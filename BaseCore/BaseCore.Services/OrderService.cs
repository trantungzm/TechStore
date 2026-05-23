using BaseCore.DTO.Coupons;
using BaseCore.DTO.Store;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;

namespace BaseCore.Services
{
    public class OrderService : IOrderService
    {
        private static readonly HashSet<string> ValidStatuses = new(StringComparer.OrdinalIgnoreCase)
        {
            "Pending", "Confirmed", "Processing", "Shipping", "Completed", "CancelRequested", "Cancelled", "CancelRejected"
        };

        private static readonly HashSet<string> ValidPaymentStatuses = new(StringComparer.OrdinalIgnoreCase)
        {
            "Unpaid", "Paid", "Refunded", "Failed", "Cancelled"
        };

        private static readonly HashSet<string> ValidPaymentMethods = new(StringComparer.OrdinalIgnoreCase)
        {
            "COD", "BankTransfer", "Momo", "ShopeePay", "ApplePay", "StorePayment"
        };

        private static readonly HashSet<string> ValidShippingMethods = new(StringComparer.OrdinalIgnoreCase)
        {
            "Delivery", "StorePickup"
        };

        private readonly IOrderRepositoryEF _orderRepository;
        private readonly IOrderDetailRepositoryEF _orderDetailRepository;
        private readonly IOrderTimelineRepositoryEF _timelineRepository;
        private readonly IOrderCancellationRepositoryEF _cancellationRepository;
        private readonly IProductRepositoryEF _productRepository;
        private readonly IWarrantyService? _warrantyService;
        private readonly ICouponService? _couponService;

        public OrderService(
            IOrderRepositoryEF orderRepository,
            IOrderDetailRepositoryEF orderDetailRepository,
            IOrderTimelineRepositoryEF timelineRepository,
            IOrderCancellationRepositoryEF cancellationRepository,
            IProductRepositoryEF productRepository,
            IWarrantyService? warrantyService = null,
            ICouponService? couponService = null)
        {
            _orderRepository = orderRepository;
            _orderDetailRepository = orderDetailRepository;
            _timelineRepository = timelineRepository;
            _cancellationRepository = cancellationRepository;
            _productRepository = productRepository;
            _warrantyService = warrantyService;
            _couponService = couponService;
        }

        public async Task<List<OrderListDto>> GetOrdersByUserIdAsync(Guid userId)
        {
            var orders = await _orderRepository.GetByUserAsync(userId);
            return orders.Select(ToListDto).ToList();
        }

        public async Task<(List<OrderListDto> Orders, int TotalCount)> GetAllOrdersAsync(OrderSearchDto search)
        {
            var result = await _orderRepository.SearchAsync(search);
            return (result.Orders.Select(ToListDto).ToList(), result.TotalCount);
        }

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

        public Task<OrderDetailDto> CreateOrderAsync(Guid? userId, CreateOrderDto dto)
        {
            return _orderRepository.ExecuteInTransactionAsync(() => CreateOrderCoreAsync(userId, dto));
        }

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

                ProductVariant? variant = null;
                if (item.VariantId.HasValue)
                {
                    variant = product.Variants.FirstOrDefault(x => x.Id == item.VariantId.Value && x.ProductId == product.Id)
                        ?? throw new InvalidOperationException($"Variant {item.VariantId.Value} not found");
                    if (variant.Stock < item.Quantity)
                    {
                        throw new InvalidOperationException($"Insufficient stock for {product.Name}");
                    }
                    variant.Stock -= item.Quantity;
                    variant.UpdatedAt = now;
                }
                else
                {
                    if (product.Stock < item.Quantity)
                    {
                        throw new InvalidOperationException($"Insufficient stock for {product.Name}");
                    }
                    product.Stock -= item.Quantity;
                }

                product.UpdatedAt = now;
                productsToUpdate.Add(product);

                var unitPrice = variant?.Price ?? product.Price;
                var totalPrice = unitPrice * item.Quantity;
                subtotal += totalPrice;

                details.Add(new OrderDetail
                {
                    ProductId = product.Id,
                    VariantId = variant?.Id,
                    ProductName = product.Name,
                    ProductImage = variant?.ImageUrl ?? product.ImageUrl,
                    Sku = variant?.Sku ?? product.Sku,
                    SelectedColor = variant?.ColorName,
                    SelectedVersion = variant?.VariantName ?? variant?.Storage ?? variant?.Ram,
                    Quantity = item.Quantity,
                    UnitPrice = unitPrice,
                    TotalPrice = totalPrice,
                    CreatedAt = now
                });
            }

            var shippingMethod = NormalizeShippingMethod(dto.ShippingMethod);
            var paymentMethod = NormalizePaymentMethod(dto.PaymentMethod);
            var paymentStatus = NormalizePaymentStatus(dto.PaymentStatus);
            var shippingFee = shippingMethod == "StorePickup" ? 0 : await _orderRepository.GetDefaultShippingFeeAsync();
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
                ShippingAddress = BuildShippingAddress(dto),
                Province = dto.Province?.Trim(),
                District = dto.District?.Trim(),
                Ward = dto.Ward?.Trim(),
                AddressDetail = dto.AddressDetail?.Trim(),
                StorePickupLocation = dto.StorePickupLocation?.Trim(),
                ExpectedPickupTime = dto.ExpectedPickupTime,
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

            await AddTimeline(order.Id, "Pending", "Don hang duoc tao", "Khach hang da dat hang thanh cong", userId);
            if (couponValidation != null)
            {
                await _couponService!.CommitOrderCouponsAsync(order.Id, couponValidation);
            }

            return (await GetOrderWithDetailsAsync(order.Id))!;
        }

        public async Task<OrderDetailDto?> UpdateStatusAsync(int id, UpdateOrderStatusDto dto, Guid? updatedByUserId)
        {
            var status = NormalizeStatus(dto.Status);
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null) return null;

            order.Status = status;
            order.UpdatedAt = DateTime.UtcNow;
            order.UpdatedByUserId = updatedByUserId;

            if (status == "Cancelled")
            {
                order.PaymentStatus = NormalizeCancelledPaymentStatus(order.PaymentStatus);
            }

            if (!string.IsNullOrWhiteSpace(dto.PaymentStatus))
            {
                order.PaymentStatus = NormalizePaymentStatus(dto.PaymentStatus);
            }

            if (!string.IsNullOrWhiteSpace(dto.TransactionId))
            {
                order.TransactionId = dto.TransactionId.Trim();
            }

            await _orderRepository.UpdateAsync(order);
            await AddTimeline(order.Id, status, TimelineTitle(status), dto.Note, updatedByUserId);
            if (status == "Completed" && _warrantyService != null)
            {
                await _warrantyService.EnsureWarrantiesForCompletedOrderAsync(order.Id);
            }
            return await GetOrderWithDetailsAsync(order.Id);
        }

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

        public async Task<List<OrderTimelineDto>> GetTimelineAsync(int id)
        {
            var timeline = await _timelineRepository.GetByOrderAsync(id);
            return timeline.Select(ToTimelineDto).ToList();
        }

        private async Task RestoreStock(int orderId)
        {
            var details = await _orderDetailRepository.GetByOrderAsync(orderId);
            foreach (var detail in details)
            {
                var product = await _productRepository.GetByIdAsync(detail.ProductId);
                if (product == null) continue;

                if (detail.VariantId.HasValue)
                {
                    var variant = product.Variants.FirstOrDefault(x => x.Id == detail.VariantId.Value);
                    if (variant != null) variant.Stock += detail.Quantity;
                }
                else
                {
                    product.Stock += detail.Quantity;
                }
                product.UpdatedAt = DateTime.UtcNow;
                await _productRepository.UpdateAsync(product);
            }
        }

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

        private static void ValidateCreateOrder(CreateOrderDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CustomerName)) throw new InvalidOperationException("Customer name is required");
            if (string.IsNullOrWhiteSpace(dto.CustomerPhone)) throw new InvalidOperationException("Customer phone is required");
            if (dto.CustomerPhone.Trim().Length < 9) throw new InvalidOperationException("Customer phone is invalid");
            if (!string.IsNullOrWhiteSpace(dto.CustomerEmail) && !dto.CustomerEmail.Contains('@')) throw new InvalidOperationException("Customer email is invalid");
            if (string.IsNullOrWhiteSpace(dto.PaymentMethod)) throw new InvalidOperationException("Payment method is required");
            if (string.IsNullOrWhiteSpace(dto.ShippingMethod)) throw new InvalidOperationException("Shipping method is required");
            NormalizePaymentMethod(dto.PaymentMethod);
            NormalizePaymentStatus(dto.PaymentStatus);
            if (dto.Items == null || dto.Items.Count == 0) throw new InvalidOperationException("Order items are required");
            if (dto.Items.Any(x => x.ProductId <= 0 || x.Quantity <= 0)) throw new InvalidOperationException("Invalid order item");

            var shippingMethod = NormalizeShippingMethod(dto.ShippingMethod);
            if (shippingMethod == "Delivery" &&
                (string.IsNullOrWhiteSpace(dto.Province) ||
                 string.IsNullOrWhiteSpace(dto.District) ||
                 string.IsNullOrWhiteSpace(dto.Ward) ||
                 string.IsNullOrWhiteSpace(dto.AddressDetail)))
            {
                throw new InvalidOperationException("Delivery address is required");
            }

            if (shippingMethod == "StorePickup" && string.IsNullOrWhiteSpace(dto.StorePickupLocation))
            {
                throw new InvalidOperationException("Store pickup location is required");
            }
        }

        private static string NormalizeStatus(string? status)
        {
            var value = string.IsNullOrWhiteSpace(status) ? "Pending" : status.Trim();
            if (!ValidStatuses.Contains(value)) throw new InvalidOperationException("Invalid order status");
            return ValidStatuses.First(x => string.Equals(x, value, StringComparison.OrdinalIgnoreCase));
        }

        private static string NormalizePaymentStatus(string? status)
        {
            var value = string.IsNullOrWhiteSpace(status) ? "Unpaid" : status.Trim();
            if (!ValidPaymentStatuses.Contains(value)) throw new InvalidOperationException("Invalid payment status");
            return ValidPaymentStatuses.First(x => string.Equals(x, value, StringComparison.OrdinalIgnoreCase));
        }

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

        private static string NormalizeCancelledPaymentStatus(string? currentStatus)
        {
            return string.Equals(currentStatus, "Paid", StringComparison.OrdinalIgnoreCase) ? "Refunded" : "Cancelled";
        }

        private static string GenerateOrderCode(int id, DateTime createdAt)
        {
            return $"CNTHHT-{createdAt:yyyyMMdd}-{id:0000}";
        }

        private static string? BuildShippingAddress(CreateOrderDto dto)
        {
            if (!string.IsNullOrWhiteSpace(dto.ShippingAddress)) return dto.ShippingAddress.Trim();
            if (NormalizeShippingMethod(dto.ShippingMethod) == "StorePickup") return dto.StorePickupLocation?.Trim();
            return string.Join(", ", new[] { dto.AddressDetail, dto.Ward, dto.District, dto.Province }.Where(x => !string.IsNullOrWhiteSpace(x)).Select(x => x!.Trim()));
        }

        private static string TimelineTitle(string status)
        {
            return status switch
            {
                "Pending" => "Don hang duoc tao",
                "Confirmed" => "Don hang da duoc xac nhan",
                "Processing" => "Don hang dang duoc chuan bi",
                "Shipping" => "Don hang dang duoc giao",
                "Completed" => "Don hang da hoan tat",
                "CancelRequested" => "Khach hang yeu cau huy don",
                "Cancelled" => "Don hang da bi huy",
                "CancelRejected" => "Yeu cau huy don bi tu choi",
                _ => "Cap nhat don hang"
            };
        }

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
                ItemCount = order.OrderDetails?.Sum(x => x.Quantity) ?? 0,
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt
            };
        }

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
                InvoiceRequired = order.InvoiceRequired,
                InvoiceCompanyName = order.InvoiceCompanyName,
                InvoiceTaxCode = order.InvoiceTaxCode,
                InvoiceAddress = order.InvoiceAddress,
                InvoiceEmail = order.InvoiceEmail,
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

        private static OrderItemDetailDto ToItemDto(OrderDetail detail)
        {
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
                SerialOrImei = detail.SerialOrImei,
                CreatedAt = detail.CreatedAt
            };
        }

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
