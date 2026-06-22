using BaseCore.DTO.Coupons;
using BaseCore.DTO.Store;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;
using System.Security.Cryptography;

namespace BaseCore.Services
{
    // Service nghiệp vụ đơn hàng: chịu trách nhiệm tạo đơn, giữ chỗ tồn kho,
    // điều khiển workflow trạng thái và nối sang coupon/inventory/warranty.
    public class OrderService : IOrderService
    {
        private static readonly HashSet<string> ValidStatuses = new(StringComparer.OrdinalIgnoreCase)
        {
            "Pending", "Confirmed", "Processing", "ReadyForPickup", "Shipping", "Shipped", "Delivered", "Completed", "CancelRequested", "Cancelled", "CancelRejected", "Failed", "Returned"
        };

        private static readonly HashSet<string> ValidPaymentStatuses = new(StringComparer.OrdinalIgnoreCase)
        {
            "Unpaid", "Paid", "Refunded", "Failed", "Cancelled"
        };

        private static readonly Dictionary<string, HashSet<string>> AllowedStatusTransitions = new(StringComparer.OrdinalIgnoreCase)
        {
            ["Pending"] = new(StringComparer.OrdinalIgnoreCase) { "Confirmed", "CancelRequested", "Cancelled", "Failed" },
            ["Confirmed"] = new(StringComparer.OrdinalIgnoreCase) { "Processing", "ReadyForPickup", "CancelRequested", "Cancelled", "Failed" },
            ["Processing"] = new(StringComparer.OrdinalIgnoreCase) { "Shipping", "CancelRequested", "Cancelled", "Failed" },
            ["ReadyForPickup"] = new(StringComparer.OrdinalIgnoreCase) { "Completed", "CancelRequested", "Cancelled", "Failed" },
            ["Shipping"] = new(StringComparer.OrdinalIgnoreCase) { "Shipped", "Delivered", "Completed", "Failed" },
            ["Shipped"] = new(StringComparer.OrdinalIgnoreCase) { "Delivered", "Completed", "Failed" },
            ["Delivered"] = new(StringComparer.OrdinalIgnoreCase) { "Completed", "Returned" },
            ["CancelRequested"] = new(StringComparer.OrdinalIgnoreCase) { "Cancelled", "CancelRejected" },
            ["CancelRejected"] = new(StringComparer.OrdinalIgnoreCase) { "Processing", "Shipping", "Cancelled" },
            ["Failed"] = new(StringComparer.OrdinalIgnoreCase) { "Returned", "Cancelled" },
            ["Completed"] = new(StringComparer.OrdinalIgnoreCase) { "Returned" },
            ["Returned"] = new(StringComparer.OrdinalIgnoreCase) { },
            ["Cancelled"] = new(StringComparer.OrdinalIgnoreCase) { }
        };

        private static readonly HashSet<string> ValidPaymentMethods = new(StringComparer.OrdinalIgnoreCase)
        {
            "COD", "BankTransfer", "Momo", "ShopeePay", "ApplePay", "StorePayment"
        };

        private static readonly HashSet<string> ValidShippingMethods = new(StringComparer.OrdinalIgnoreCase)
        {
            "Delivery", "StorePickup"
        };

        private static readonly HashSet<string> StorePickupForbiddenStatuses = new(StringComparer.OrdinalIgnoreCase)
        {
            "Shipping", "Shipped", "Delivered"
        };

        private readonly IOrderRepositoryEF _orderRepository;
        private readonly IOrderDetailRepositoryEF _orderDetailRepository;
        private readonly IOrderTimelineRepositoryEF _timelineRepository;
        private readonly IOrderCancellationRepositoryEF _cancellationRepository;
        private readonly IProductRepositoryEF _productRepository;
        private readonly IProductVariantRepositoryEF _variantRepository;
        private readonly IWarehouseRepositoryEF _warehouseRepository;
        private readonly IStockItemRepositoryEF _stockItemRepository;
        private readonly IOrderDetailStockItemRepositoryEF _orderDetailStockItemRepository;
        private readonly IWarrantyService? _warrantyService;
        private readonly IInventoryService? _inventoryService;
        private readonly ICouponService? _couponService;
        private readonly INotificationService? _notificationService;

        public OrderService(
            IOrderRepositoryEF orderRepository,
            IOrderDetailRepositoryEF orderDetailRepository,
            IOrderTimelineRepositoryEF timelineRepository,
            IOrderCancellationRepositoryEF cancellationRepository,
            IProductRepositoryEF productRepository,
            IProductVariantRepositoryEF variantRepository,
            IWarehouseRepositoryEF warehouseRepository,
            IStockItemRepositoryEF stockItemRepository,
            IOrderDetailStockItemRepositoryEF orderDetailStockItemRepository,
            IWarrantyService? warrantyService = null,
            IInventoryService? inventoryService = null,
            ICouponService? couponService = null,
            INotificationService? notificationService = null)
        {
            _orderRepository = orderRepository;
            _orderDetailRepository = orderDetailRepository;
            _timelineRepository = timelineRepository;
            _cancellationRepository = cancellationRepository;
            _productRepository = productRepository;
            _variantRepository = variantRepository;
            _warehouseRepository = warehouseRepository;
            _stockItemRepository = stockItemRepository;
            _orderDetailStockItemRepository = orderDetailStockItemRepository;
            _warrantyService = warrantyService;
            _inventoryService = inventoryService;
            _couponService = couponService;
            _notificationService = notificationService;
        }

        // Storefront "đơn hàng của tôi" dùng hàm này để lấy danh sách gọn cho user hiện tại.
        public async Task<List<OrderListDto>> GetOrdersByUserIdAsync(Guid userId)
        {
            var orders = await _orderRepository.GetByUserAsync(userId);
            return orders.Select(ToListDto).ToList();
        }

        // Màn admin orders gọi vào đây để lọc/search/paging toàn bộ đơn hàng.
        public async Task<(List<OrderListDto> Orders, int TotalCount)> GetAllOrdersAsync(OrderSearchDto search)
        {
            var result = await _orderRepository.SearchAsync(search);
            return (result.Orders.Select(ToListDto).ToList(), result.TotalCount);
        }

        // Gom toàn bộ dữ liệu detail của đơn: item, timeline, cancellation, coupon
        // để FE có thể hiển thị màn chi tiết chỉ từ một endpoint.
        public async Task<OrderDetailDto?> GetOrderWithDetailsAsync(int id)
        {
            var order = await _orderRepository.GetWithDetailsAsync(id);
            if (order == null) return null;
            var details = await _orderDetailRepository.GetByOrderAsync(id);
            var timeline = await _timelineRepository.GetByOrderAsync(id);
            var cancellations = await _cancellationRepository.GetByOrderAsync(id);
            var coupons = _couponService == null ? new List<OrderCouponDto>() : await _couponService.GetOrderCouponsAsync(id);
            return ToDetailDto(order, details, timeline, cancellations.FirstOrDefault(), coupons);
        }

        // Kiểm tra ownership đơn hàng để controller storefront chặn truy cập chéo user.
        public async Task<bool> CanAccessOrderAsync(int id, Guid userId)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            return order?.UserId == userId;
        }

        // Tạo đơn luôn chạy trong transaction vì một lần submit checkout sẽ chạm
        // tới tồn kho, order, order details, serial reserve và coupon commit.
        public Task<OrderDetailDto> CreateOrderAsync(Guid? userId, CreateOrderDto dto)
        {
            return _orderRepository.ExecuteInTransactionAsync(() => CreateOrderCoreAsync(userId, dto));
        }

        // Phần lõi checkout: validate request, trừ tồn optimistic locking,
        // tính tổng tiền/coupon/phí ship, tạo order rồi reserve serial/IMEI nếu cần.
        private async Task<OrderDetailDto> CreateOrderCoreAsync(Guid? userId, CreateOrderDto dto)
        {
            ValidateCreateOrder(dto);

            var now = DateTime.UtcNow;
            var details = new List<OrderDetail>();
            var productsToUpdate = new List<Product>();
            decimal subtotal = 0;

            foreach (var item in dto.Items)
            {
                var product = await _productRepository.GetByIdAsync(item.ProductId)
                    ?? throw new InvalidOperationException($"Product {item.ProductId} not found");
                if (!product.IsActive)
                {
                    throw new InvalidOperationException($"Product {product.Name} is not available");
                }

                ProductVariant? variant = null;
                if (item.VariantId.HasValue)
                {
                    variant = product.Variants.FirstOrDefault(x => x.Id == item.VariantId.Value && x.ProductId == product.Id)
                        ?? throw new InvalidOperationException($"Variant {item.VariantId.Value} not found");
                    if (!variant.IsActive)
                    {
                        throw new InvalidOperationException($"Variant {item.VariantId.Value} is not available");
                    }
                    if (variant.Stock < item.Quantity)
                    {
                        throw new InvalidOperationException($"Insufficient stock for {product.Name}");
                    }
                    // Use atomic stock decrement with optimistic locking
                    var rowsAffected = await _variantRepository.DecrementStockAsync(variant.Id, item.Quantity, variant.Version);
                    if (rowsAffected == 0)
                    {
                        throw new InvalidOperationException($"Stock update failed for {product.Name} (concurrent update or insufficient stock)");
                    }
                    // Refresh variant to get updated version
                    variant = await _variantRepository.GetByIdAsync(variant.Id);
                }
                else
                {
                    if ((product.TotalStock ?? 0) < item.Quantity)
                    {
                        throw new InvalidOperationException($"Insufficient stock for {product.Name}");
                    }
                    // Use atomic stock decrement with optimistic locking
                    var rowsAffected = await _productRepository.DecrementStockAsync(product.Id, item.Quantity, product.Version);
                    if (rowsAffected == 0)
                    {
                        throw new InvalidOperationException($"Stock update failed for {product.Name} (concurrent update or insufficient stock)");
                    }
                    // Refresh product to get updated version
                    product = await _productRepository.GetByIdAsync(product.Id);
                }

                product.UpdatedAt = now;
                productsToUpdate.Add(product);

                var unitPrice = variant?.Price ?? product.BasePrice ?? product.MinPrice ?? 0;
                var totalPrice = unitPrice * item.Quantity;
                subtotal += totalPrice;

                details.Add(new OrderDetail
                {
                    ProductId = product.Id,
                    VariantId = variant?.Id,
                    ProductName = product.Name,
                    ProductImage = variant?.ImageUrl ?? product.ImageUrl,
                    Sku = variant?.Sku,
                    SelectedColor = null,
                    SelectedVersion = variant?.VariantName,
                    Quantity = item.Quantity,
                    UnitPrice = unitPrice,
                    TotalPrice = totalPrice,
                    CreatedAt = now
                });
            }

            var shippingMethod = NormalizeShippingMethod(dto.ShippingMethod);
            var paymentMethod = NormalizePaymentMethod(dto.PaymentMethod);
            var paymentStatus = ResolveInitialPaymentStatus(shippingMethod, paymentMethod);
            var shippingFee = shippingMethod == "StorePickup" ? 0 : await _orderRepository.GetDefaultShippingFeeAsync();

            Warehouse? pickupWarehouse = null;
            var pickupWarehouseId = dto.PickupWarehouseId;
            var storePickupLocation = dto.StorePickupLocation?.Trim();
            if (shippingMethod == "StorePickup")
            {
                if (pickupWarehouseId.HasValue)
                {
                    pickupWarehouse = await _warehouseRepository.GetByIdAsync(pickupWarehouseId.Value);
                }
                pickupWarehouse ??= await _warehouseRepository.GetDefaultAsync();
                if (pickupWarehouse != null)
                {
                    pickupWarehouseId = pickupWarehouse.Id;
                    var locationParts = new List<string>();
                    if (!string.IsNullOrWhiteSpace(pickupWarehouse.Name)) locationParts.Add(pickupWarehouse.Name.Trim());
                    if (!string.IsNullOrWhiteSpace(pickupWarehouse.Address)) locationParts.Add(pickupWarehouse.Address.Trim());
                    storePickupLocation = string.Join(" — ", locationParts);
                }
            }

            var pickupSlotStartAt = dto.PickupSlotStartAt ?? dto.ExpectedPickupTime;
            var pickupSlotEndAt = dto.PickupSlotEndAt;
            var productDiscount = 0m;
            var shippingDiscount = 0m;
            ValidateCouponsResultDto? couponValidation = null;
            if (_couponService != null && (dto.ProductUserCouponId.HasValue || dto.ShippingUserCouponId.HasValue))
            {
                if (!userId.HasValue)
                {
                    throw new InvalidOperationException("Ban can dang nhap de su dung phieu giam gia.");
                }

                couponValidation = await _couponService.ValidateAsync(userId, new ValidateCouponsDto
                {
                    ProductUserCouponId = dto.ProductUserCouponId,
                    ShippingUserCouponId = dto.ShippingUserCouponId,
                    ShippingMethod = shippingMethod,
                    ShippingFee = shippingFee,
                    PaymentMethod = paymentMethod,
                    CartItems = dto.Items.Select(x => new ValidateCouponCartItemDto
                    {
                        ProductId = x.ProductId,
                        VariantId = x.VariantId,
                        Quantity = x.Quantity,
                        UnitPrice = x.UnitPrice
                    }).ToList()
                }, requireUserCoupon: true);

                if (!couponValidation.IsValid)
                {
                    throw new InvalidOperationException(string.Join(" ", couponValidation.Messages.Where(x => !string.IsNullOrWhiteSpace(x))));
                }

                productDiscount = couponValidation.ProductDiscount;
                shippingDiscount = couponValidation.ShippingDiscount;
            }
            var totalAmount = Math.Max(0, subtotal - productDiscount + shippingFee - shippingDiscount);

            foreach (var product in productsToUpdate)
            {
                await _productRepository.UpdateAsync(product);
            }

            var order = new Order
            {
                UserId = userId,
                CustomerName = dto.CustomerName?.Trim(),
                CustomerPhone = dto.CustomerPhone?.Trim(),
                CustomerEmail = dto.CustomerEmail?.Trim(),
                OrderDate = now,
                Subtotal = subtotal,
                ProductDiscount = productDiscount,
                ShippingFee = shippingFee,
                ShippingDiscount = shippingDiscount,
                TotalAmount = totalAmount,
                Status = "Pending",
                PaymentMethod = paymentMethod,
                PaymentStatus = paymentStatus,
                TransactionId = dto.TransactionId?.Trim(),
                ShippingMethod = shippingMethod,
                ShippingAddress = BuildShippingAddress(dto, shippingMethod),
                Province = shippingMethod == "Delivery" ? dto.Province?.Trim() : null,
                District = shippingMethod == "Delivery" ? dto.District?.Trim() : null,
                Ward = shippingMethod == "Delivery" ? dto.Ward?.Trim() : null,
                AddressDetail = shippingMethod == "Delivery" ? dto.AddressDetail?.Trim() : null,
                StorePickupLocation = shippingMethod == "StorePickup" ? storePickupLocation : null,
                ExpectedPickupTime = shippingMethod == "StorePickup" ? pickupSlotStartAt : null,
                PickupWarehouseId = shippingMethod == "StorePickup" ? pickupWarehouseId : null,
                PickupSlotStartAt = shippingMethod == "StorePickup" ? pickupSlotStartAt : null,
                PickupSlotEndAt = shippingMethod == "StorePickup" ? pickupSlotEndAt : null,
                InvoiceRequired = dto.InvoiceRequired,
                InvoiceCompanyName = dto.InvoiceCompanyName?.Trim(),
                InvoiceTaxCode = dto.InvoiceTaxCode?.Trim(),
                InvoiceAddress = dto.InvoiceAddress?.Trim(),
                InvoiceEmail = dto.InvoiceEmail?.Trim(),
                Notes = dto.Notes?.Trim(),
                CreatedAt = now
            };

            await _orderRepository.AddAsync(order);
            order.OrderCode = GenerateOrderCode(order.Id, now);
            await _orderRepository.UpdateAsync(order);

            foreach (var detail in details)
            {
                detail.OrderId = order.Id;
                await _orderDetailRepository.AddAsync(detail);
            }

            foreach (var detail in details)
            {
                var product = await _productRepository.GetByIdAsync(detail.ProductId);
                if (product == null) continue;
                if (!product.RequiresSerialTracking) continue;

                var available = await _stockItemRepository.GetAvailableAsync(detail.ProductId, detail.VariantId, detail.Quantity, shippingMethod == "StorePickup" ? pickupWarehouseId : null);
                if (available.Count < detail.Quantity)
                {
                    var name = detail.ProductName ?? product.Name ?? $"#{detail.ProductId}";
                    throw new InvalidOperationException($"Khong du serial/IMEI trong kho de xuat ban cho san pham {name}.");
                }

                var serials = new List<string>();
                foreach (var item in available)
                {
                    if (await _orderDetailStockItemRepository.AnyByStockItemAsync(item.Id))
                    {
                        throw new InvalidOperationException($"Stock item {item.SerialOrImei} was already assigned");
                    }

                    item.OrderId = order.Id;
                    item.OrderDetailId = detail.Id;
                    item.CustomerId = userId;
                    item.Status = "Reserved";
                    item.UpdatedAt = now;
                    await _stockItemRepository.UpdateAsync(item);
                    await _orderDetailStockItemRepository.AddAsync(new OrderDetailStockItem { OrderDetailId = detail.Id, StockItemId = item.Id, CreatedAt = now });

                    serials.Add(item.SerialOrImei);
                }

                detail.SerialOrImei = serials.Count == 1 ? serials[0] : string.Join(", ", serials);
                await _orderDetailRepository.UpdateAsync(detail);
            }

            await AddTimeline(order.Id, "Pending", "Don hang duoc tao", "Khach hang da dat hang thanh cong", userId);
            if (_notificationService != null)
            {
                var orderCode = string.IsNullOrWhiteSpace(order.OrderCode) ? $"#{order.Id}" : order.OrderCode;
                if (shippingMethod == "StorePickup")
                {
                    var location = string.IsNullOrWhiteSpace(order.StorePickupLocation) ? "chi nhanh da chon" : order.StorePickupLocation;
                    await _notificationService.CreateAsync(order.UserId, "TechStore da nhan don hang", $"TechStore da nhan don hang {orderCode} cua ban. Chung toi dang kiem tra san pham tai {location}.", "Order", "Order", order.Id);
                }
                else
                {
                    await _notificationService.CreateAsync(order.UserId, "TechStore da nhan don hang", $"TechStore da nhan don hang {orderCode} cua ban. Chung toi dang xu ly don hang.", "Order", "Order", order.Id);
                }
            }
            if (couponValidation != null)
            {
                await _couponService!.CommitOrderCouponsAsync(order.Id, couponValidation);
            }

            return (await GetOrderWithDetailsAsync(order.Id))!;
        }

        // Quick action từ màn admin đi vào đây. Service kiểm soát toàn bộ transition,
        // auto reserve/sold stock item, restore stock khi hủy và kích hoạt bảo hành khi hoàn tất.
        public async Task<OrderDetailDto?> UpdateStatusAsync(int id, UpdateOrderStatusDto dto, Guid? updatedByUserId)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null) return null;
            var now = DateTime.UtcNow;
            var shippingMethod = NormalizeShippingMethod(order.ShippingMethod);
            var currentStatus = NormalizeStatus(order.Status);

            var requestedStatus = string.IsNullOrWhiteSpace(dto.Status) ? currentStatus : NormalizeStatus(dto.Status);
            var requestedPaymentStatus = string.IsNullOrWhiteSpace(dto.PaymentStatus)
                ? NormalizePaymentStatus(order.PaymentStatus)
                : NormalizePaymentStatus(dto.PaymentStatus);

            var finalStatus = requestedStatus;

            if (shippingMethod != "StorePickup" && string.Equals(finalStatus, "ReadyForPickup", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Delivery order does not support ReadyForPickup status");
            }

            if (shippingMethod == "StorePickup")
            {
                if (StorePickupForbiddenStatuses.Contains(finalStatus))
                {
                    throw new InvalidOperationException("Store pickup order does not support this status");
                }

                var isCancellationFlow =
                    finalStatus.Contains("Cancel", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(finalStatus, "Cancelled", StringComparison.OrdinalIgnoreCase);

                var effectivePaymentStatus =
                    !string.IsNullOrWhiteSpace(dto.PaymentStatus)
                        ? requestedPaymentStatus
                        : (ShouldAutoMarkPaidOnCompletion(order, finalStatus) ? "Paid" : NormalizePaymentStatus(order.PaymentStatus));

                if (string.Equals(finalStatus, "Completed", StringComparison.OrdinalIgnoreCase) &&
                    !string.Equals(effectivePaymentStatus, "Paid", StringComparison.OrdinalIgnoreCase))
                {
                    throw new InvalidOperationException("Store pickup order can be completed only when payment status is Paid");
                }

            }

            if (!string.Equals(currentStatus, finalStatus, StringComparison.OrdinalIgnoreCase))
            {
                var allowFastPickupCompletion =
                    shippingMethod == "StorePickup" &&
                    string.Equals(finalStatus, "Completed", StringComparison.OrdinalIgnoreCase) &&
                    (string.Equals(currentStatus, "Pending", StringComparison.OrdinalIgnoreCase) ||
                     string.Equals(currentStatus, "Confirmed", StringComparison.OrdinalIgnoreCase) ||
                     string.Equals(currentStatus, "CancelRejected", StringComparison.OrdinalIgnoreCase));

                if (!allowFastPickupCompletion)
                {
                    EnsureAllowedTransition(currentStatus, finalStatus);
                }
            }

            if (_inventoryService != null &&
                !string.Equals(currentStatus, finalStatus, StringComparison.OrdinalIgnoreCase) &&
                (finalStatus == "Processing" || finalStatus == "Shipping" || finalStatus == "Shipped" || finalStatus == "Completed"))
            {
                await _inventoryService.EnsureSerialsForOrderAsync(order.Id, updatedByUserId);
                if (finalStatus == "Completed")
                {
                    await _inventoryService.MarkOrderStockItemsSoldAsync(order.Id, updatedByUserId);
                }
            }

            if (shippingMethod == "StorePickup" && !string.Equals(currentStatus, finalStatus, StringComparison.OrdinalIgnoreCase))
            {
                if (string.Equals(finalStatus, "ReadyForPickup", StringComparison.OrdinalIgnoreCase))
                {
                    order.ReadyForPickupAt ??= now;
                    order.PickupExpiresAt = order.ReadyForPickupAt.Value.AddHours(48);
                }
            }

            order.Status = finalStatus;
            order.UpdatedAt = now;
            order.UpdatedByUserId = updatedByUserId;

            if (finalStatus == "Cancelled" && !string.Equals(currentStatus, "Cancelled", StringComparison.OrdinalIgnoreCase))
            {
                await RestoreStock(order.Id);
                order.PaymentStatus = NormalizeCancelledPaymentStatus(order.PaymentStatus);
            }

            if (!string.IsNullOrWhiteSpace(dto.PaymentStatus))
            {
                order.PaymentStatus = requestedPaymentStatus;
            }
            else if (ShouldAutoMarkPaidOnCompletion(order, finalStatus))
            {
                order.PaymentStatus = "Paid";
            }

            if (!string.IsNullOrWhiteSpace(dto.TransactionId))
            {
                order.TransactionId = dto.TransactionId.Trim();
            }

            ApplyFulfillmentFields(order, dto, finalStatus, now);
            ApplyRefundReturnFields(order, dto, finalStatus, now);

            await _orderRepository.UpdateAsync(order);
            try
            {
                if (!string.Equals(currentStatus, finalStatus, StringComparison.OrdinalIgnoreCase))
                {
                    await AddTimeline(order.Id, finalStatus, TimelineTitle(finalStatus), dto.Note, updatedByUserId);
                }
            }
            catch
            {
                // Ignore timeline errors
            }
            try
            {
                if (_notificationService != null &&
                    !string.Equals(currentStatus, finalStatus, StringComparison.OrdinalIgnoreCase) &&
                    string.Equals(finalStatus, "ReadyForPickup", StringComparison.OrdinalIgnoreCase))
                {
                    var orderCode = string.IsNullOrWhiteSpace(order.OrderCode) ? $"#{order.Id}" : order.OrderCode;
                    var location = string.IsNullOrWhiteSpace(order.StorePickupLocation) ? "chi nhanh da chon" : order.StorePickupLocation;
                    await _notificationService.CreateAsync(order.UserId, "Don hang da san sang nhan", $"Don hang {orderCode} da SAN SANG! Kinh moi ban den {location} de nhan hang.", "Order", "Order", order.Id);
                }
            }
            catch
            {
            }
            try
            {
                if (!string.Equals(currentStatus, finalStatus, StringComparison.OrdinalIgnoreCase) &&
                    finalStatus == "Completed" &&
                    _warrantyService != null)
                {
                    await _warrantyService.EnsureWarrantiesForCompletedOrderAsync(order.Id);
                }
            }
            catch
            {
                // Ignore warranty errors
            }
            return await GetOrderWithDetailsAsync(order.Id);
        }

        // User gửi yêu cầu hủy đơn không hủy trực tiếp ngay mà tạo bản ghi review,
        // giúp admin có luồng duyệt/từ chối riêng trên màn quản trị đơn hàng.
        public async Task<OrderDetailDto?> CancelOrderAsync(int id, string? reason, Guid? requestedByUserId)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null) return null;

            if (string.Equals(order.Status, "Completed", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(order.Status, "Cancelled", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Cannot cancel completed or cancelled order");
            }

            var now = DateTime.UtcNow;
            var pending = await _cancellationRepository.GetPendingByOrderAsync(id);
            if (pending == null)
            {
                pending = new OrderCancellation
                {
                    OrderId = id,
                    RequestedByUserId = requestedByUserId,
                    Reason = reason?.Trim(),
                    Status = "Pending",
                    RequestedAt = now
                };
                await _cancellationRepository.AddAsync(pending);
            }

            order.Status = "CancelRequested";
            order.CancelReason = reason?.Trim();
            order.CancelRequestedAt = now;
            order.UpdatedAt = now;
            await _orderRepository.UpdateAsync(order);
            await AddTimeline(order.Id, "CancelRequested", "Khach hang yeu cau huy don", reason, requestedByUserId);

            return await GetOrderWithDetailsAsync(order.Id);
        }

        // Admin duyệt yêu cầu hủy. Nếu chấp nhận thì trả tồn kho và cập nhật payment status,
        // nếu từ chối thì đẩy đơn sang CancelRejected để tiếp tục xử lý.
        public async Task<OrderDetailDto?> ReviewCancellationAsync(int id, ReviewCancelOrderDto dto, Guid? reviewedByUserId)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null) return null;
            var cancellation = await _cancellationRepository.GetPendingByOrderAsync(id)
                ?? throw new InvalidOperationException("No pending cancellation request");

            var now = DateTime.UtcNow;
            cancellation.Status = dto.Approved ? "Approved" : "Rejected";
            cancellation.AdminNote = dto.AdminNote?.Trim();
            cancellation.ReviewedByUserId = reviewedByUserId;
            cancellation.ReviewedAt = now;
            await _cancellationRepository.UpdateAsync(cancellation);

            order.Status = dto.Approved ? "Cancelled" : "CancelRejected";
            order.CancelReviewedAt = now;
            order.CancelReviewedByUserId = reviewedByUserId;
            order.CancelReviewNote = dto.AdminNote?.Trim();
            order.UpdatedAt = now;
            order.UpdatedByUserId = reviewedByUserId;

            if (dto.Approved)
            {
                await RestoreStock(order.Id);
                order.PaymentStatus = NormalizeCancelledPaymentStatus(order.PaymentStatus);
            }

            await _orderRepository.UpdateAsync(order);
            await AddTimeline(
                order.Id,
                order.Status,
                dto.Approved ? "Yeu cau huy don da duoc chap nhan" : "Yeu cau huy don bi tu choi",
                dto.AdminNote,
                reviewedByUserId);

            return await GetOrderWithDetailsAsync(order.Id);
        }

        // Trả về riêng timeline khi FE chỉ cần lịch sử trạng thái mà không tải full detail.
        public async Task<List<OrderTimelineDto>> GetTimelineAsync(int id)
        {
            var timeline = await _timelineRepository.GetByOrderAsync(id);
            return timeline.Select(ToTimelineDto).ToList();
        }

        // Job nền cho store-pickup: tự hủy các đơn đã quá hạn nhận tại cửa hàng
        // để giải phóng tồn kho và giữ workflow vận hành sạch.
        public async Task<int> AutoCancelExpiredPickupOrdersAsync(int batchSize = 100)
        {
            var now = DateTime.UtcNow;
            var items = await _orderRepository.GetExpiredPickupOrdersAsync(now, batchSize);
            if (items.Count == 0) return 0;

            var cancelled = 0;
            foreach (var order in items)
            {
                try
                {
                    order.Status = "Cancelled";
                    order.CancelReviewNote = "Qua han lay";
                    order.UpdatedAt = now;
                    order.PaymentStatus = NormalizeCancelledPaymentStatus(order.PaymentStatus);
                    await RestoreStock(order.Id);
                    await _orderRepository.UpdateAsync(order);
                    await AddTimeline(order.Id, order.Status, "Don hang bi huy (Qua han lay)", null, null);
                    if (_notificationService != null)
                    {
                        var orderCode = string.IsNullOrWhiteSpace(order.OrderCode) ? $"#{order.Id}" : order.OrderCode;
                        await _notificationService.CreateAsync(order.UserId, "Don hang bi huy", $"Don hang {orderCode} da bi huy do qua han nhan tai cua hang.", "Order", "Order", order.Id);
                    }
                    cancelled++;
                }
                catch
                {
                }
            }

            return cancelled;
        }

        // Khi đơn bị hủy, service hoàn trả cả stock số lượng lẫn serial/IMEI đã reserve,
        // xóa link OrderDetailStockItem và reset dữ liệu gắn với đơn.
        private async Task RestoreStock(int orderId)
        {
            var details = await _orderDetailRepository.GetByOrderAsync(orderId);
            var detailIds = details.Select(x => x.Id).ToList();
            var assignedLinks = detailIds.Count == 0
                ? new List<OrderDetailStockItem>()
                : await _orderDetailStockItemRepository.GetByOrderDetailIdsAsync(detailIds);
            var assignedStockIds = assignedLinks.Select(x => x.StockItemId).Distinct().ToHashSet();
            var stockItems = await _stockItemRepository.GetByOrderAsync(orderId);
            var now = DateTime.UtcNow;

            foreach (var item in stockItems.Where(x => assignedStockIds.Contains(x.Id) || x.OrderId == orderId))
            {
                if (string.Equals(item.Status, "InStock", StringComparison.OrdinalIgnoreCase)) continue;
                item.Status = "InStock";
                item.OrderId = null;
                item.OrderDetailId = null;
                item.CustomerId = null;
                item.SoldAt = null;
                item.UpdatedAt = now;
                await _stockItemRepository.UpdateAsync(item);
            }

            foreach (var link in assignedLinks)
            {
                await _orderDetailStockItemRepository.DeleteAsync(link);
            }

            foreach (var detail in details)
            {
                var product = await _productRepository.GetByIdAsync(detail.ProductId);
                if (product == null) continue;

                if (detail.VariantId.HasValue)
                {
                    var variant = product.Variants.FirstOrDefault(x => x.Id == detail.VariantId.Value);
                    if (variant != null)
                    {
                        // Use atomic stock increment with optimistic locking
                        var rowsAffected = await _variantRepository.IncrementStockAsync(variant.Id, detail.Quantity, variant.Version);
                        if (rowsAffected == 0)
                        {
                            throw new InvalidOperationException($"Stock restore failed for {product.Name} (concurrent update)");
                        }
                    }
                }
                else
                {
                    // Use atomic stock increment with optimistic locking
                    var rowsAffected = await _productRepository.IncrementStockAsync(product.Id, detail.Quantity, product.Version);
                    if (rowsAffected == 0)
                    {
                        throw new InvalidOperationException($"Stock restore failed for {product.Name} (concurrent update)");
                    }
                }
                detail.SerialOrImei = null;
                await _orderDetailRepository.UpdateAsync(detail);

                product.UpdatedAt = now;
                await _productRepository.UpdateAsync(product);
            }
        }

        // Timeline là lịch sử business của đơn để FE/admin trace lại từng mốc xử lý.
        private async Task AddTimeline(int orderId, string status, string title, string? note, Guid? createdByUserId)
        {
            await _timelineRepository.AddAsync(new OrderTimeline
            {
                OrderId = orderId,
                Status = status,
                Title = title,
                Note = note,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = createdByUserId
            });
        }

        // Validate dữ liệu checkout trước khi chạm vào tồn kho và tạo bản ghi đơn hàng.
        private static void ValidateCreateOrder(CreateOrderDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CustomerName)) throw new InvalidOperationException("Customer name is required");
            if (string.IsNullOrWhiteSpace(dto.CustomerPhone)) throw new InvalidOperationException("Customer phone is required");
            if (dto.CustomerPhone.Trim().Length < 9) throw new InvalidOperationException("Customer phone is invalid");
            if (!string.IsNullOrWhiteSpace(dto.CustomerEmail) && !dto.CustomerEmail.Contains('@')) throw new InvalidOperationException("Customer email is invalid");
            if (string.IsNullOrWhiteSpace(dto.PaymentMethod)) throw new InvalidOperationException("Payment method is required");
            if (string.IsNullOrWhiteSpace(dto.ShippingMethod)) throw new InvalidOperationException("Shipping method is required");
            var paymentMethod = NormalizePaymentMethod(dto.PaymentMethod);
            if (dto.Items == null || dto.Items.Count == 0) throw new InvalidOperationException("Order items are required");
            if (dto.Items.Any(x => x.ProductId <= 0 || x.Quantity <= 0)) throw new InvalidOperationException("Invalid order item");

            var shippingMethod = NormalizeShippingMethod(dto.ShippingMethod);
            EnsureValidPaymentMethodForShipping(shippingMethod, paymentMethod);
            if (shippingMethod == "Delivery" &&
                (string.IsNullOrWhiteSpace(dto.Province) ||
                 string.IsNullOrWhiteSpace(dto.Ward)))
            {
                throw new InvalidOperationException("Delivery address is required");
            }

            if (shippingMethod == "StorePickup" && !dto.PickupWarehouseId.HasValue && string.IsNullOrWhiteSpace(dto.StorePickupLocation))
            {
                throw new InvalidOperationException("Pickup branch is required");
            }

            if (shippingMethod == "StorePickup" &&
                dto.PickupSlotStartAt.HasValue &&
                dto.PickupSlotEndAt.HasValue &&
                dto.PickupSlotEndAt.Value <= dto.PickupSlotStartAt.Value)
            {
                throw new InvalidOperationException("Pickup time slot is invalid");
            }
        }

        // Chuẩn hóa order status từ input text và reject giá trị ngoài state machine.
        private static string NormalizeStatus(string? status)
        {
            var value = string.IsNullOrWhiteSpace(status) ? "Pending" : status.Trim();
            if (!ValidStatuses.Contains(value)) throw new InvalidOperationException("Invalid order status");
            return ValidStatuses.First(x => string.Equals(x, value, StringComparison.OrdinalIgnoreCase));
        }

        // Chuẩn hóa payment status để mọi luồng update lưu đúng tập giá trị cho phép.
        private static string NormalizePaymentStatus(string? status)
        {
            var value = string.IsNullOrWhiteSpace(status) ? "Unpaid" : status.Trim();
            if (!ValidPaymentStatuses.Contains(value)) throw new InvalidOperationException("Invalid payment status");
            return ValidPaymentStatuses.First(x => string.Equals(x, value, StringComparison.OrdinalIgnoreCase));
        }

        // Hỗ trợ nhiều alias payment method từ FE nhưng luôn lưu về canonical value.
        private static string NormalizePaymentMethod(string? value)
        {
            var raw = string.IsNullOrWhiteSpace(value) ? "COD" : value.Trim();
            var normalized = raw.ToLower() switch
            {
                "cod" => "COD",
                "banktransfer" or "bank_transfer" or "bank" => "BankTransfer",
                "momo" => "Momo",
                "shopeepay" or "shopee_pay" => "ShopeePay",
                "applepay" or "apple_pay" => "ApplePay",
                "storepayment" or "store_payment" => "StorePayment",
                _ => raw
            };

            if (!ValidPaymentMethods.Contains(normalized)) throw new InvalidOperationException("Invalid payment method");
            return ValidPaymentMethods.First(x => string.Equals(x, normalized, StringComparison.OrdinalIgnoreCase));
        }

        // Chuẩn hóa delivery/store-pickup để các nhánh nghiệp vụ dùng thống nhất.
        private static string NormalizeShippingMethod(string? value)
        {
            var raw = string.IsNullOrWhiteSpace(value) ? "Delivery" : value.Trim();
            var normalized = raw.ToLower() switch
            {
                "delivery" => "Delivery",
                "storepickup" or "store_pickup" or "pickup" => "StorePickup",
                _ => raw
            };

            if (!ValidShippingMethods.Contains(normalized)) throw new InvalidOperationException("Invalid shipping method");
            return ValidShippingMethods.First(x => string.Equals(x, normalized, StringComparison.OrdinalIgnoreCase));
        }

        // Khi đơn bị hủy, payment status sẽ chuyển sang Cancelled hoặc Refunded tùy trạng thái cũ.
        private static string NormalizeCancelledPaymentStatus(string? currentStatus)
        {
            return string.Equals(currentStatus, "Paid", StringComparison.OrdinalIgnoreCase) ? "Refunded" : "Cancelled";
        }

        // Ràng buộc payment method hợp lệ theo từng hình thức giao/nhận.
        private static void EnsureValidPaymentMethodForShipping(string shippingMethod, string paymentMethod)
        {
            if (shippingMethod == "StorePickup")
            {
                if (paymentMethod != "StorePayment" && paymentMethod != "BankTransfer")
                {
                    throw new InvalidOperationException("Store pickup only supports cash at store or bank transfer");
                }
                return;
            }

            if (paymentMethod != "COD" && paymentMethod != "BankTransfer")
            {
                throw new InvalidOperationException("Delivery only supports COD or bank transfer");
            }
        }

        // Suy ra payment status ban đầu ngay khi tạo đơn.
        private static string ResolveInitialPaymentStatus(string shippingMethod, string paymentMethod)
        {
            EnsureValidPaymentMethodForShipping(shippingMethod, paymentMethod);
            return paymentMethod == "BankTransfer" ? "Paid" : "Unpaid";
        }

        // Một số luồng như COD hoặc thanh toán tại cửa hàng sẽ tự coi là đã thanh toán khi completed.
        private static bool ShouldAutoMarkPaidOnCompletion(Order order, string finalStatus)
        {
            if (!string.Equals(finalStatus, "Completed", StringComparison.OrdinalIgnoreCase)) return false;
            if (string.Equals(order.PaymentStatus, "Paid", StringComparison.OrdinalIgnoreCase)) return false;

            var shippingMethod = NormalizeShippingMethod(order.ShippingMethod);
            var paymentMethod = NormalizePaymentMethod(order.PaymentMethod);

            return (shippingMethod == "StorePickup" && paymentMethod == "StorePayment")
                || (shippingMethod == "Delivery" && paymentMethod == "COD");
        }

        // Khóa chặt state machine đơn hàng để mọi thao tác từ admin/user đều đi đúng luồng.
        private static void EnsureAllowedTransition(string currentStatus, string nextStatus)
        {
            if (string.Equals(currentStatus, nextStatus, StringComparison.OrdinalIgnoreCase)) return;
            if (!AllowedStatusTransitions.TryGetValue(currentStatus, out var allowed) || !allowed.Contains(nextStatus))
            {
                throw new InvalidOperationException($"Invalid order status transition from {currentStatus} to {nextStatus}");
            }
        }

        // Các trường fulfillment như hãng vận chuyển, tracking, shipped/delivered time
        // được cập nhật tập trung ở đây để không rải logic trong controller.
        private static void ApplyFulfillmentFields(Order order, UpdateOrderStatusDto dto, string status, DateTime now)
        {
            if (!string.IsNullOrWhiteSpace(dto.Carrier)) order.Carrier = dto.Carrier.Trim();
            if (!string.IsNullOrWhiteSpace(dto.TrackingCode)) order.TrackingCode = dto.TrackingCode.Trim();
            if (!string.IsNullOrWhiteSpace(dto.DeliveryFailedReason)) order.DeliveryFailedReason = dto.DeliveryFailedReason.Trim();
            if ((status == "Shipping" || status == "Shipped") && !order.ShippedAt.HasValue) order.ShippedAt = now;
            if ((status == "Delivered" || status == "Completed") && !order.DeliveredAt.HasValue) order.DeliveredAt = now;
            if (status == "Failed" && string.IsNullOrWhiteSpace(order.DeliveryFailedReason))
            {
                order.DeliveryFailedReason = dto.Note?.Trim();
            }
        }

        // Gom phần metadata hoàn tiền/hoàn trả của đơn để các bước update status
        // có thể dùng lại cùng một logic.
        private static void ApplyRefundReturnFields(Order order, UpdateOrderStatusDto dto, string status, DateTime now)
        {
            var refundStatus = NormalizeOptionalRefundStatus(dto.RefundStatus);
            if (!string.IsNullOrWhiteSpace(refundStatus)) order.RefundStatus = refundStatus;
            if (dto.RefundAmount.HasValue) order.RefundAmount = dto.RefundAmount;
            if (!string.IsNullOrWhiteSpace(dto.RefundTransactionId)) order.RefundTransactionId = dto.RefundTransactionId.Trim();
            if (string.Equals(order.RefundStatus, "Refunded", StringComparison.OrdinalIgnoreCase) && !order.RefundedAt.HasValue) order.RefundedAt = now;

            var returnStatus = NormalizeOptionalReturnStatus(dto.ReturnStatus);
            if (!string.IsNullOrWhiteSpace(returnStatus)) order.ReturnStatus = returnStatus;
            if (status == "Returned")
            {
                order.ReturnStatus = string.IsNullOrWhiteSpace(order.ReturnStatus) ? "Requested" : order.ReturnStatus;
                order.ReturnedAt ??= now;
            }
        }

        // Chuẩn hóa refund status nếu request có gửi kèm thông tin hoàn tiền.
        private static string? NormalizeOptionalRefundStatus(string? status)
        {
            if (string.IsNullOrWhiteSpace(status)) return null;
            var value = status.Trim();
            var allowed = new[] { "Pending", "Approved", "Refunded", "Rejected", "Failed" };
            if (!allowed.Contains(value, StringComparer.OrdinalIgnoreCase)) throw new InvalidOperationException("Invalid refund status");
            return allowed.First(x => string.Equals(x, value, StringComparison.OrdinalIgnoreCase));
        }

        // Chuẩn hóa return status cho các case hoàn trả sau bán.
        private static string? NormalizeOptionalReturnStatus(string? status)
        {
            if (string.IsNullOrWhiteSpace(status)) return null;
            var value = status.Trim();
            var allowed = new[] { "Requested", "Approved", "Rejected", "Received", "Restocked", "Damaged" };
            if (!allowed.Contains(value, StringComparer.OrdinalIgnoreCase)) throw new InvalidOperationException("Invalid return status");
            return allowed.First(x => string.Equals(x, value, StringComparison.OrdinalIgnoreCase));
        }

        // Sinh mã đơn hàng thân thiện để hiển thị cho người dùng và đối soát nội bộ.
        private static string GenerateOrderCode(int id, DateTime createdAt)
        {
            return $"CNTHHT-{createdAt:yyyyMMdd}-{id:0000}";
        }

        // Tạo chuỗi địa chỉ giao hàng từ field nhập tay hoặc ghép từ ward/province.
        private static string? BuildShippingAddress(CreateOrderDto dto, string shippingMethod)
        {
            if (shippingMethod == "StorePickup") return null;
            if (!string.IsNullOrWhiteSpace(dto.ShippingAddress)) return dto.ShippingAddress.Trim();
            return string.Join(", ", new[] { dto.Ward, dto.Province }.Where(x => !string.IsNullOrWhiteSpace(x)).Select(x => x!.Trim()));
        }

        // Quy đổi status kỹ thuật sang title dễ đọc trong timeline/order history.
        private static string TimelineTitle(string status)
        {
            return status switch
            {
                "Pending" => "Don hang duoc tao",
                "Confirmed" => "Don hang da duoc xac nhan",
                "Processing" => "Don hang dang duoc chuan bi",
                "ReadyForPickup" => "Hang san sang nhan tai cua hang",
                "Shipping" => "Don hang dang duoc giao",
                "Completed" => "Don hang da hoan tat",
                "CancelRequested" => "Khach hang yeu cau huy don",
                "Cancelled" => "Don hang da bi huy",
                "CancelRejected" => "Yeu cau huy don bi tu choi",
                "Shipped" => "Don hang da duoc giao",
                "Delivered" => "Don hang da duoc giao thanh cong",
                "Failed" => "Don hang giao that bai",
                "Returned" => "Don hang bi hoan tra",
                _ => "Cap nhat don hang"
            };
        }

        // DTO rút gọn cho danh sách đơn hàng, vẫn giữ đủ thông tin thanh toán/giao nhận quan trọng.
        private static OrderListDto ToListDto(Order order)
        {
            return new OrderListDto
            {
                Id = order.Id,
                OrderCode = order.OrderCode,
                UserId = order.UserId,
                CustomerName = order.CustomerName,
                CustomerPhone = order.CustomerPhone,
                CustomerEmail = order.CustomerEmail,
                OrderDate = order.OrderDate,
                Subtotal = order.Subtotal,
                ProductDiscount = order.ProductDiscount,
                ShippingFee = order.ShippingFee,
                ShippingDiscount = order.ShippingDiscount,
                TotalAmount = order.TotalAmount,
                Status = order.Status,
                PaymentMethod = order.PaymentMethod,
                PaymentStatus = order.PaymentStatus,
                ShippingMethod = order.ShippingMethod,
                ShippingAddress = order.ShippingAddress,
                StorePickupLocation = order.StorePickupLocation,
                PickupWarehouseId = order.PickupWarehouseId,
                PickupSlotStartAt = order.PickupSlotStartAt,
                PickupSlotEndAt = order.PickupSlotEndAt,
                ReadyForPickupAt = order.ReadyForPickupAt,
                PickupExpiresAt = order.PickupExpiresAt,
                Carrier = order.Carrier,
                TrackingCode = order.TrackingCode,
                ShippedAt = order.ShippedAt,
                DeliveredAt = order.DeliveredAt,
                DeliveryFailedReason = order.DeliveryFailedReason,
                RefundStatus = order.RefundStatus,
                RefundAmount = order.RefundAmount,
                RefundedAt = order.RefundedAt,
                RefundTransactionId = order.RefundTransactionId,
                ReturnStatus = order.ReturnStatus,
                ReturnedAt = order.ReturnedAt,
                ItemCount = order.OrderDetails?.Sum(x => x.Quantity) ?? 0,
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt
            };
        }

        // Snapshot chi tiết trả về cho FE: từ entity đơn + danh sách con sang DTO duy nhất.
        private static OrderDetailDto ToDetailDto(Order order, List<OrderDetail> details, List<OrderTimeline> timeline, OrderCancellation? cancellation, List<OrderCouponDto>? coupons = null)
        {
            var dto = new OrderDetailDto
            {
                Id = order.Id,
                OrderCode = order.OrderCode,
                UserId = order.UserId,
                CustomerName = order.CustomerName,
                CustomerPhone = order.CustomerPhone,
                CustomerEmail = order.CustomerEmail,
                OrderDate = order.OrderDate,
                Subtotal = order.Subtotal,
                ProductDiscount = order.ProductDiscount,
                ShippingFee = order.ShippingFee,
                ShippingDiscount = order.ShippingDiscount,
                TotalAmount = order.TotalAmount,
                Status = order.Status,
                PaymentMethod = order.PaymentMethod,
                PaymentStatus = order.PaymentStatus,
                TransactionId = order.TransactionId,
                ShippingMethod = order.ShippingMethod,
                ShippingAddress = order.ShippingAddress,
                Province = order.Province,
                District = order.District,
                Ward = order.Ward,
                AddressDetail = order.AddressDetail,
                StorePickupLocation = order.StorePickupLocation,
                ExpectedPickupTime = order.ExpectedPickupTime,
                PickupWarehouseId = order.PickupWarehouseId,
                PickupSlotStartAt = order.PickupSlotStartAt,
                PickupSlotEndAt = order.PickupSlotEndAt,
                ReadyForPickupAt = order.ReadyForPickupAt,
                PickupExpiresAt = order.PickupExpiresAt,
                PickupVerificationPin = order.PickupVerificationPin,
                Carrier = order.Carrier,
                TrackingCode = order.TrackingCode,
                ShippedAt = order.ShippedAt,
                DeliveredAt = order.DeliveredAt,
                DeliveryFailedReason = order.DeliveryFailedReason,
                InvoiceRequired = order.InvoiceRequired,
                InvoiceCompanyName = order.InvoiceCompanyName,
                InvoiceTaxCode = order.InvoiceTaxCode,
                InvoiceAddress = order.InvoiceAddress,
                InvoiceEmail = order.InvoiceEmail,
                RefundStatus = order.RefundStatus,
                RefundAmount = order.RefundAmount,
                RefundedAt = order.RefundedAt,
                RefundTransactionId = order.RefundTransactionId,
                ReturnStatus = order.ReturnStatus,
                ReturnedAt = order.ReturnedAt,
                Notes = order.Notes,
                CancelReason = order.CancelReason,
                CancelRequestedAt = order.CancelRequestedAt,
                CancelReviewedAt = order.CancelReviewedAt,
                CancelReviewedByUserId = order.CancelReviewedByUserId,
                CancelReviewNote = order.CancelReviewNote,
                ItemCount = details.Sum(x => x.Quantity),
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt,
                Items = details.Select(ToItemDto).ToList(),
                Timeline = timeline.Select(ToTimelineDto).ToList(),
                Coupons = coupons ?? new List<OrderCouponDto>(),
                Cancellation = cancellation == null ? null : ToCancellationDto(cancellation)
            };
            return dto;
        }

        // Gom serial/IMEI từ nhiều nguồn để item detail luôn hiển thị được số máy đã cấp.
        private static OrderItemDetailDto ToItemDto(OrderDetail detail)
        {
            var serialOrImei = detail.SerialOrImei;
            if (string.IsNullOrWhiteSpace(serialOrImei) && detail.StockItems != null && detail.StockItems.Count > 0)
            {
                var serials = detail.StockItems
                    .Select(x => x.StockItem?.SerialOrImei)
                    .Where(x => !string.IsNullOrWhiteSpace(x))
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToList();
                if (serials.Count > 0) serialOrImei = string.Join(", ", serials);
            }

            return new OrderItemDetailDto
            {
                Id = detail.Id,
                OrderId = detail.OrderId,
                ProductId = detail.ProductId,
                VariantId = detail.VariantId,
                ProductName = detail.ProductName ?? detail.Product?.Name,
                ProductImage = detail.ProductImage ?? detail.Product?.ImageUrl,
                Sku = detail.Sku,
                SelectedColor = detail.SelectedColor,
                SelectedVersion = detail.SelectedVersion,
                Quantity = detail.Quantity,
                UnitPrice = detail.UnitPrice,
                TotalPrice = detail.TotalPrice == 0 ? detail.UnitPrice * detail.Quantity : detail.TotalPrice,
                SerialOrImei = serialOrImei,
                StockItemIds = detail.StockItems?.Select(x => x.StockItemId).Distinct().ToList() ?? new List<int>(),
                CreatedAt = detail.CreatedAt
            };
        }

        // Map timeline entity sang DTO trả về cho FE.
        private static OrderTimelineDto ToTimelineDto(OrderTimeline item)
        {
            return new OrderTimelineDto
            {
                Id = item.Id,
                OrderId = item.OrderId,
                Status = item.Status,
                Title = item.Title,
                Note = item.Note,
                CreatedAt = item.CreatedAt,
                CreatedByUserId = item.CreatedByUserId
            };
        }

        // Map bản ghi yêu cầu hủy để màn chi tiết đơn có thể hiển thị quyết định review.
        private static OrderCancellationDto ToCancellationDto(OrderCancellation item)
        {
            return new OrderCancellationDto
            {
                Id = item.Id,
                OrderId = item.OrderId,
                RequestedByUserId = item.RequestedByUserId,
                Reason = item.Reason,
                Status = item.Status,
                AdminNote = item.AdminNote,
                ReviewedByUserId = item.ReviewedByUserId,
                RequestedAt = item.RequestedAt,
                ReviewedAt = item.ReviewedAt
            };
        }
    }
}
