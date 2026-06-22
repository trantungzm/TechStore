using BaseCore.DTO.Inventory;
using BaseCore.DTO.Store;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;

namespace BaseCore.Services
{
    public class InventoryService : IInventoryService
    {
        private static readonly HashSet<string> StockStatuses = new(Common.StatusConstants.StockItemStatuses.All, StringComparer.OrdinalIgnoreCase);

        private static readonly HashSet<string> ReturnStatuses = new(Common.StatusConstants.InventoryReturnStatuses.All, StringComparer.OrdinalIgnoreCase);

        private static readonly HashSet<string> ReturnConditions = new(Common.StatusConstants.ReturnConditions.All, StringComparer.OrdinalIgnoreCase);

        private readonly IWarehouseRepositoryEF _warehouseRepository;
        private readonly IStockItemRepositoryEF _stockItemRepository;
        private readonly IGoodsReceiptRepositoryEF _receiptRepository;
        private readonly IGoodsReceiptLineRepositoryEF _receiptLineRepository;
        private readonly IGoodsReceiptSerialRepositoryEF _receiptSerialRepository;
        private readonly IStockMovementRepositoryEF _movementRepository;
        private readonly IInventoryReturnRepositoryEF _returnRepository;
        private readonly IOrderDetailStockItemRepositoryEF _orderDetailStockItemRepository;
        private readonly IProductRepositoryEF _productRepository;
        private readonly IOrderRepositoryEF _orderRepository;
        private readonly IOrderDetailRepositoryEF _orderDetailRepository;
        private readonly ISupplierRepositoryEF _supplierRepository;
        private readonly IInventoryTransactionRepositoryEF _transactionRepository;
        private readonly IWarrantyService? _warrantyService;

        public InventoryService(
            IWarehouseRepositoryEF warehouseRepository,
            IStockItemRepositoryEF stockItemRepository,
            IGoodsReceiptRepositoryEF receiptRepository,
            IGoodsReceiptLineRepositoryEF receiptLineRepository,
            IGoodsReceiptSerialRepositoryEF receiptSerialRepository,
            IStockMovementRepositoryEF movementRepository,
            IInventoryReturnRepositoryEF returnRepository,
            IOrderDetailStockItemRepositoryEF orderDetailStockItemRepository,
            IProductRepositoryEF productRepository,
            IOrderRepositoryEF orderRepository,
            IOrderDetailRepositoryEF orderDetailRepository,
            ISupplierRepositoryEF supplierRepository,
            IInventoryTransactionRepositoryEF transactionRepository,
            IWarrantyService? warrantyService = null)
        {
            _warehouseRepository = warehouseRepository;
            _stockItemRepository = stockItemRepository;
            _receiptRepository = receiptRepository;
            _receiptLineRepository = receiptLineRepository;
            _receiptSerialRepository = receiptSerialRepository;
            _movementRepository = movementRepository;
            _returnRepository = returnRepository;
            _orderDetailStockItemRepository = orderDetailStockItemRepository;
            _productRepository = productRepository;
            _transactionRepository = transactionRepository;
            _orderRepository = orderRepository;
            _orderDetailRepository = orderDetailRepository;
            _supplierRepository = supplierRepository;
            _warrantyService = warrantyService;
        }

        public async Task<GoodsReceiptDto> CreateReceiptAsync(CreateGoodsReceiptDto dto, Guid? userId)
        {
            ValidateReceipt(dto);
            var now = DateTime.UtcNow;
            var receivedAt = dto.ReceivedAt ?? now;
            var warehouseId = dto.WarehouseId ?? (await _warehouseRepository.GetDefaultAsync())?.Id;
            var supplier = await ResolveSupplierAsync(dto.SupplierId, dto.SupplierName);
            if (supplier == null) throw new InvalidOperationException("Supplier is required");
            var products = new Dictionary<int, Product>();
            var seenSerials = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var lineCodes = new Dictionary<CreateGoodsReceiptLineDto, List<StockCode>>();
            var categoryId = dto.CategoryId.GetValueOrDefault();

            foreach (var line in dto.Lines)
            {
                var product = await GetProduct(line.ProductId);
                if (categoryId <= 0) categoryId = product.CategoryId;
                if (product.CategoryId != categoryId)
                {
                    throw new InvalidOperationException("All receipt products must belong to the selected category");
                }

                products[product.Id] = product;
                var variant = GetVariant(product, line.VariantId);

                if (product.RequiresSerialTracking)
                {
                    var codeType = NormalizeCodeType(line.CodeType, line.AutoGenerateSerials);
                    lineCodes[line] = await BuildStockCodesAsync(product, variant, codeType, line.Serials, line.Quantity, seenSerials);
                    // Tồn của SP serial-tracked được tính lại từ StockItems sau khi tạo (RecomputeStockAsync)
                }
                else
                {
                    if (variant != null) variant.Stock += line.Quantity;
                    else product.Stock += line.Quantity;
                }
                product.UpdatedAt = now;
            }

            if (categoryId <= 0) throw new InvalidOperationException("Category is required");

            var receipt = new GoodsReceipt
            {
                SupplierId = supplier?.Id,
                SupplierName = supplier.Name,
                WarehouseId = warehouseId,
                ReceivedAt = receivedAt,
                CreatedByUserId = userId,
                Note = dto.Note?.Trim(),
                TotalQuantity = dto.Lines.Sum(x => x.Quantity),
                TotalCost = dto.Lines.Sum(x => x.Quantity * x.UnitCost),
                CreatedAt = now
            };

            await _receiptRepository.AddAsync(receipt);
            receipt.ReceiptCode = GenerateReceiptCode(receipt.Id, now);
            await _receiptRepository.UpdateAsync(receipt);

            foreach (var lineDto in dto.Lines)
            {
                var product = products[lineDto.ProductId];
                var variant = GetVariant(product, lineDto.VariantId);
                await _productRepository.UpdateAsync(product);

                var line = new GoodsReceiptLine
                {
                    GoodsReceiptId = receipt.Id,
                    ProductId = product.Id,
                    VariantId = variant?.Id,
                    Quantity = lineDto.Quantity,
                    UnitCost = lineDto.UnitCost,
                    TotalCost = lineDto.UnitCost * lineDto.Quantity,
                    CreatedAt = now
                };
                await _receiptLineRepository.AddAsync(line);

                if (product.RequiresSerialTracking)
                {
                    foreach (var code in lineCodes[lineDto])
                    {
                        var stockItem = await _stockItemRepository.AddAsync(new StockItem
                        {
                            ProductId = product.Id,
                            VariantId = variant?.Id,
                            WarehouseId = warehouseId,
                            SupplierId = supplier?.Id,
                            SerialOrImei = code.SerialOrImei,
                            SerialNumber = code.SerialNumber,
                            Imei = code.Imei,
                            InternalCode = code.InternalCode,
                            IsAutoTag = code.IsAutoTag,
                            Sku = variant?.Sku ?? product.Sku,
                            Status = "InStock",
                            UnitCost = lineDto.UnitCost,
                            SupplierName = receipt.SupplierName,
                            ReceivedAt = receivedAt,
                            CreatedAt = now
                        });

                        await _receiptSerialRepository.AddAsync(new GoodsReceiptSerial
                        {
                            GoodsReceiptLineId = line.Id,
                            StockItemId = stockItem.Id,
                            SerialOrImei = code.SerialOrImei,
                            CreatedAt = now
                        });

                        await AddMovement(product.Id, variant?.Id, stockItem.Id, warehouseId, "Receipt", 1, null, "InStock", "GoodsReceipt", receipt.Id, "Nhap hang", userId);
                    }
                }
                else
                {
                    await AddMovement(product.Id, variant?.Id, null, warehouseId, "Receipt", lineDto.Quantity, null, "InStock", "GoodsReceipt", receipt.Id, "Nhap hang", userId);
                }
            }

            // SP serial-tracked: tồn = số StockItems InStock (StockItems là nguồn sự thật)
            foreach (var pid in products.Keys.ToList())
            {
                await RecomputeStockAsync(pid);
            }

            return (await GetReceiptAsync(receipt.Id))!;
        }

        public async Task<GoodsReceiptDto> CreateOpeningStockAsync(CreateOpeningStockDto dto, Guid? userId)
        {
            if (dto.ProductId <= 0) throw new InvalidOperationException("Product is required");
            if (dto.Quantity <= 0) throw new InvalidOperationException("Quantity must be greater than zero");

            var now = DateTime.UtcNow;
            var receivedAt = dto.ReceivedAt ?? now;
            var defaultWarehouse = await _warehouseRepository.GetDefaultAsync();
            var warehouseId = dto.WarehouseId ?? defaultWarehouse?.Id;
            
            if (warehouseId == null)
            {
                throw new InvalidOperationException("No default warehouse found. Please create a warehouse first.");
            }
            
            var product = await GetProduct(dto.ProductId);
            var variant = GetVariant(product, dto.VariantId);

            // Check if product already has opening stock
            if (await _transactionRepository.HasOpeningStockAsync(product.Id))
            {
                throw new InvalidOperationException("Opening stock has already been initialized for this product. You can only set opening stock once.");
            }

            if (!product.RequiresSerialTracking && dto.Serials.Count > 0)
            {
                throw new InvalidOperationException("Serials are only allowed for products with serial tracking");
            }

            var codes = new List<StockCode>();
            if (product.RequiresSerialTracking)
            {
                var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                var codeType = NormalizeCodeType(dto.CodeType, dto.AutoGenerateSerials);
                codes = await BuildStockCodesAsync(product, variant, codeType, dto.Serials, dto.Quantity, seen);
            }

            // SET stock instead of ADD stock (Opening Stock = Initial Stock).
            // SP serial-tracked: tồn sẽ được tính lại từ StockItems (RecomputeStockAsync) sau khi tạo.
            if (!product.RequiresSerialTracking)
            {
                if (variant != null) variant.Stock = dto.Quantity;
                else product.Stock = dto.Quantity;
            }
            product.UpdatedAt = now;
            await _productRepository.UpdateAsync(product);

            var receipt = new GoodsReceipt
            {
                SupplierName = "Opening Stock",
                WarehouseId = warehouseId,
                ReceivedAt = receivedAt,
                CreatedByUserId = userId,
                Note = dto.Note?.Trim(),
                TotalQuantity = dto.Quantity,
                TotalCost = 0,
                CreatedAt = now
            };

            await _receiptRepository.AddAsync(receipt);
            receipt.ReceiptCode = GenerateOpeningStockCode(receipt.Id, now);
            await _receiptRepository.UpdateAsync(receipt);

            var line = new GoodsReceiptLine
            {
                GoodsReceiptId = receipt.Id,
                ProductId = product.Id,
                VariantId = variant?.Id,
                Quantity = dto.Quantity,
                UnitCost = 0,
                TotalCost = 0,
                CreatedAt = now
            };
            await _receiptLineRepository.AddAsync(line);

            // Create InventoryTransaction record
            var transaction = new InventoryTransaction
            {
                ProductId = product.Id,
                VariantId = variant?.Id,
                Type = Common.Enums.InventoryTransactionType.OpeningStock,
                Quantity = dto.Quantity,
                UnitCost = 0,
                CreatedAt = now,
                ReferenceId = receipt.Id,
                Note = dto.Note ?? "Opening stock",
                CreatedByUserId = userId
            };
            await _transactionRepository.AddAsync(transaction);

            if (product.RequiresSerialTracking)
            {
                foreach (var code in codes)
                {
                    var stockItem = await _stockItemRepository.AddAsync(new StockItem
                    {
                        ProductId = product.Id,
                        VariantId = variant?.Id,
                        WarehouseId = warehouseId,
                        SerialOrImei = code.SerialOrImei,
                        SerialNumber = code.SerialNumber,
                        Imei = code.Imei,
                        InternalCode = code.InternalCode,
                        IsAutoTag = code.IsAutoTag,
                        Sku = variant?.Sku ?? product.Sku,
                        Status = "InStock",
                        UnitCost = 0,
                        SupplierName = receipt.SupplierName,
                        ReceivedAt = receivedAt,
                        CreatedAt = now
                    });

                    await _receiptSerialRepository.AddAsync(new GoodsReceiptSerial
                    {
                        GoodsReceiptLineId = line.Id,
                        StockItemId = stockItem.Id,
                        SerialOrImei = code.SerialOrImei,
                        CreatedAt = now
                    });

                    await AddMovement(product.Id, variant?.Id, stockItem.Id, warehouseId, "OpeningStock", 1, null, "InStock", "OpeningStock", receipt.Id, dto.Note ?? "Opening stock", userId);
                }
            }
            else
            {
                await AddMovement(product.Id, variant?.Id, null, warehouseId, "OpeningStock", dto.Quantity, null, "InStock", "OpeningStock", receipt.Id, dto.Note ?? "Opening stock", userId);
            }

            await RecomputeStockAsync(product.Id);

            return (await GetReceiptAsync(receipt.Id))!;
        }

        public async Task<(List<GoodsReceiptDto> Items, int TotalCount)> GetReceiptsAsync(InventorySearchDto search)
        {
            var result = await _receiptRepository.SearchAsync(search);
            return (result.Items.Select(ToReceiptDto).ToList(), result.TotalCount);
        }

        public async Task<GoodsReceiptDto?> GetReceiptAsync(int id)
        {
            var receipt = await _receiptRepository.GetDetailAsync(id);
            return receipt == null ? null : ToReceiptDto(receipt);
        }

        public async Task<(List<StockItemDto> Items, int TotalCount)> GetStockItemsAsync(InventorySearchDto search)
        {
            var result = await _stockItemRepository.SearchAsync(search);
            return (result.Items.Select(ToStockItemDto).ToList(), result.TotalCount);
        }

        public async Task<StockItemDto?> GetStockItemAsync(int id)
        {
            var item = await _stockItemRepository.GetDetailAsync(id);
            return item == null ? null : ToStockItemDto(item);
        }

        public async Task<StockItemLookupDto?> LookupStockItemAsync(string serialOrImei)
        {
            if (string.IsNullOrWhiteSpace(serialOrImei)) throw new InvalidOperationException("Serial/IMEI is required");
            var item = await _stockItemRepository.GetBySerialAsync(serialOrImei);
            return item == null ? null : ToLookupDto(item);
        }

        public async Task<StockItemDto?> UpdateStockItemStatusAsync(int id, UpdateStockItemStatusDto dto, Guid? userId)
        {
            var status = NormalizeStockStatus(dto.Status);
            var item = await _stockItemRepository.GetDetailAsync(id);
            if (item == null) return null;
            var oldStatus = item.Status;
            item.Status = status;
            item.Note = dto.Note?.Trim() ?? item.Note;
            item.UpdatedAt = DateTime.UtcNow;
            await _stockItemRepository.UpdateAsync(item);
            await AddMovement(item.ProductId, item.VariantId, item.Id, item.WarehouseId, MovementTypeForStatus(status), 1, oldStatus, status, "Manual", null, dto.Note, userId);
            await RecomputeStockAsync(item.ProductId);
            return ToStockItemDto((await _stockItemRepository.GetDetailAsync(id))!);
        }

        public async Task<List<StockItemDto>> AssignStockItemsAsync(AssignStockItemsDto dto, Guid? userId)
        {
            var order = await _orderRepository.GetByIdAsync(dto.OrderId) ?? throw new InvalidOperationException("Order not found");
            var detail = await _orderDetailRepository.GetByIdAsync(dto.OrderDetailId) ?? throw new InvalidOperationException("Order detail not found");
            if (detail.OrderId != order.Id) throw new InvalidOperationException("Order detail does not belong to order");
            if (dto.StockItemIds == null || dto.StockItemIds.Count != detail.Quantity) throw new InvalidOperationException("Stock item count must equal order detail quantity");

            var ids = dto.StockItemIds.Distinct().ToList();
            if (ids.Count != dto.StockItemIds.Count) throw new InvalidOperationException("Duplicate stock item id in request");
            var items = await _stockItemRepository.GetByIdsAsync(ids);
            if (items.Count != ids.Count) throw new InvalidOperationException("Some stock items were not found");

            foreach (var item in items)
            {
                if (item.ProductId != detail.ProductId) throw new InvalidOperationException("Stock item product does not match order detail");
                if (detail.VariantId.HasValue && item.VariantId != detail.VariantId) throw new InvalidOperationException("Stock item variant does not match order detail");
                if (!string.Equals(item.Status, "InStock", StringComparison.OrdinalIgnoreCase) &&
                    !string.Equals(item.Status, "Reserved", StringComparison.OrdinalIgnoreCase))
                {
                    throw new InvalidOperationException($"Stock item {item.SerialOrImei} is not available");
                }
                if (await _orderDetailStockItemRepository.AnyByStockItemAsync(item.Id)) throw new InvalidOperationException($"Stock item {item.SerialOrImei} was already assigned");
            }

            var now = DateTime.UtcNow;
            foreach (var item in items)
            {
                var oldStatus = item.Status;
                item.OrderId = order.Id;
                item.OrderDetailId = detail.Id;
                item.CustomerId = order.UserId;
                item.Status = "Sold";
                item.SoldAt = now;
                item.UpdatedAt = now;
                await _stockItemRepository.UpdateAsync(item);
                await _orderDetailStockItemRepository.AddAsync(new OrderDetailStockItem { OrderDetailId = detail.Id, StockItemId = item.Id, CreatedAt = now });
                await AddMovement(item.ProductId, item.VariantId, item.Id, item.WarehouseId, "Sale", 1, oldStatus, "Sold", "Order", order.Id, "Gan serial/IMEI cho don hang", userId);
            }

            detail.SerialOrImei = items.Count == 1 ? items[0].SerialOrImei : string.Join(", ", items.Select(x => x.SerialOrImei));
            await _orderDetailRepository.UpdateAsync(detail);
            await RecomputeStockAsync(detail.ProductId);

            try
            {
                if (_warrantyService != null && string.Equals(order.Status, "Completed", StringComparison.OrdinalIgnoreCase))
                {
                    await _warrantyService.EnsureWarrantiesForCompletedOrderAsync(order.Id);
                }
            }
            catch
            {
            }
            return (await _stockItemRepository.GetByIdsAsync(ids)).Select(ToStockItemDto).ToList();
        }

        public async Task EnsureSerialsForOrderAsync(int orderId, Guid? userId)
        {
            await _orderRepository.ExecuteInTransactionAsync(async () =>
            {
                await EnsureSerialsForOrderCoreAsync(orderId, userId);
                return true;
            });
        }

        public async Task MarkOrderStockItemsSoldAsync(int orderId, Guid? userId)
        {
            await _orderRepository.ExecuteInTransactionAsync(async () =>
            {
                await MarkOrderStockItemsSoldCoreAsync(orderId, userId);
                return true;
            });
        }

        private async Task EnsureSerialsForOrderCoreAsync(int orderId, Guid? userId)
        {
            var order = await _orderRepository.GetWithDetailsAsync(orderId) ?? throw new InvalidOperationException("Order not found");
            var details = await _orderDetailRepository.GetByOrderAsync(orderId);
            var now = DateTime.UtcNow;

            foreach (var detail in details)
            {
                var product = detail.Product ?? await _productRepository.GetByIdAsync(detail.ProductId);
                if (product == null) continue;
                if (!product.RequiresSerialTracking) continue;

                var serials = SplitSerialText(detail.SerialOrImei);
                if (serials.Count >= detail.Quantity) continue;

                var need = Math.Max(0, detail.Quantity - serials.Count);
                if (need == 0) continue;

                var available = await _stockItemRepository.GetAvailableAsync(detail.ProductId, detail.VariantId, need);
                if (available.Count < need)
                {
                    var name = detail.ProductName ?? product.Name ?? $"#{detail.ProductId}";
                    throw new InvalidOperationException($"Khong du serial/IMEI trong kho de gan cho san pham {name}.");
                }

                foreach (var item in available)
                {
                    if (await _orderDetailStockItemRepository.AnyByStockItemAsync(item.Id))
                    {
                        throw new InvalidOperationException($"Stock item {item.SerialOrImei} was already assigned");
                    }

                    var oldStatus = item.Status;
                    item.OrderId = order.Id;
                    item.OrderDetailId = detail.Id;
                    item.CustomerId = order.UserId;
                    item.Status = "Reserved";
                    item.UpdatedAt = now;
                    await _stockItemRepository.UpdateAsync(item);
                    await _orderDetailStockItemRepository.AddAsync(new OrderDetailStockItem { OrderDetailId = detail.Id, StockItemId = item.Id, CreatedAt = now });
                    await AddMovement(item.ProductId, item.VariantId, item.Id, item.WarehouseId, "Reserve", 1, oldStatus, "Reserved", "Order", order.Id, "Tu dong gan serial/IMEI cho don hang", userId);

                    serials.Add(item.SerialOrImei);
                }

                detail.SerialOrImei = string.Join(", ", serials);
                await _orderDetailRepository.UpdateAsync(detail);
                await RecomputeStockAsync(detail.ProductId);
            }
        }

        private async Task MarkOrderStockItemsSoldCoreAsync(int orderId, Guid? userId)
        {
            var order = await _orderRepository.GetByIdAsync(orderId) ?? throw new InvalidOperationException("Order not found");
            var items = await _stockItemRepository.GetByOrderAsync(orderId);
            if (items.Count == 0) return;
            var now = DateTime.UtcNow;

            foreach (var item in items)
            {
                if (string.Equals(item.Status, "Sold", StringComparison.OrdinalIgnoreCase)) continue;
                var oldStatus = item.Status;
                item.CustomerId = order.UserId ?? item.CustomerId;
                item.Status = "Sold";
                item.SoldAt ??= now;
                item.UpdatedAt = now;
                await _stockItemRepository.UpdateAsync(item);
                await AddMovement(item.ProductId, item.VariantId, item.Id, item.WarehouseId, "Sale", 1, oldStatus, "Sold", "Order", order.Id, "Tu dong xuat ban khi don hoan tat", userId);
            }

            foreach (var pid in items.Select(x => x.ProductId).Distinct())
            {
                await RecomputeStockAsync(pid);
            }

            try
            {
                if (_warrantyService != null)
                {
                    await _warrantyService.EnsureWarrantiesForCompletedOrderAsync(order.Id);
                }
            }
            catch
            {
            }
        }

        public async Task<(List<AgedStockDto> Items, int TotalCount)> GetAgedStockAsync(AgedStockSearchDto search)
        {
            var result = await _stockItemRepository.GetAgedAsync(search);
            return (result.Items.Select(ToAgedStockDto).ToList(), result.TotalCount);
        }

        public async Task<InventoryReturnDto> CreateReturnAsync(CreateInventoryReturnDto dto, Guid? userId)
        {
            if (string.IsNullOrWhiteSpace(dto.Reason)) throw new InvalidOperationException("Reason is required");
            var condition = NormalizeReturnCondition(dto.Condition);
            StockItem? stockItem = null;
            if (dto.StockItemId.HasValue) stockItem = await _stockItemRepository.GetDetailAsync(dto.StockItemId.Value) ?? throw new InvalidOperationException("Stock item not found");
            if (stockItem == null && !string.IsNullOrWhiteSpace(dto.SerialOrImei)) stockItem = await _stockItemRepository.GetBySerialAsync(dto.SerialOrImei.Trim()) ?? throw new InvalidOperationException("Stock item not found");

            var productId = dto.ProductId ?? stockItem?.ProductId ?? 0;
            if (productId <= 0) throw new InvalidOperationException("Product is required");
            var product = await GetProduct(productId);
            var variant = GetVariant(product, dto.VariantId ?? stockItem?.VariantId);

            if (dto.OrderId.HasValue && dto.OrderDetailId.HasValue)
            {
                var detail = await _orderDetailRepository.GetByIdAsync(dto.OrderDetailId.Value) ?? throw new InvalidOperationException("Order detail not found");
                if (detail.OrderId != dto.OrderId.Value) throw new InvalidOperationException("Order detail does not belong to order");
            }

            var now = DateTime.UtcNow;
            var ret = await _returnRepository.AddAsync(new InventoryReturn
            {
                ReturnCode = "",
                OrderId = dto.OrderId ?? stockItem?.OrderId,
                OrderDetailId = dto.OrderDetailId ?? stockItem?.OrderDetailId,
                ProductId = product.Id,
                VariantId = variant?.Id,
                StockItemId = stockItem?.Id,
                SerialOrImei = dto.SerialOrImei?.Trim() ?? stockItem?.SerialOrImei,
                CustomerName = dto.CustomerName?.Trim(),
                CustomerPhone = dto.CustomerPhone?.Trim(),
                Reason = dto.Reason.Trim(),
                Condition = condition,
                Status = "Pending",
                RefundAmount = dto.RefundAmount,
                Note = dto.Note?.Trim(),
                CreatedAt = now,
                CreatedByUserId = userId
            });
            ret.ReturnCode = GenerateReturnCode(ret.Id, now);
            await _returnRepository.UpdateAsync(ret);
            return (await GetReturnAsync(ret.Id))!;
        }

        public async Task<(List<InventoryReturnDto> Items, int TotalCount)> GetReturnsAsync(InventoryReturnSearchDto search)
        {
            var result = await _returnRepository.SearchAsync(search);
            return (result.Items.Select(ToReturnDto).ToList(), result.TotalCount);
        }

        public async Task<InventoryReturnDto?> GetReturnAsync(int id)
        {
            var ret = await _returnRepository.GetDetailAsync(id);
            return ret == null ? null : ToReturnDto(ret);
        }

        public async Task<InventoryReturnDto?> ReviewReturnAsync(int id, ReviewInventoryReturnDto dto, Guid? userId)
        {
            var ret = await _returnRepository.GetDetailAsync(id);
            if (ret == null) return null;
            if (!string.Equals(ret.Status, "Pending", StringComparison.OrdinalIgnoreCase)) throw new InvalidOperationException("Only pending returns can be reviewed");
            ret.Status = dto.Approved ? "Approved" : "Rejected";
            ret.ReviewNote = dto.ReviewNote?.Trim();
            ret.ReviewedByUserId = userId;
            ret.UpdatedAt = DateTime.UtcNow;
            await _returnRepository.UpdateAsync(ret);
            return await GetReturnAsync(id);
        }

        public async Task<InventoryReturnDto?> RestockReturnAsync(int id, RestockReturnDto dto, Guid? userId)
        {
            var restockStatus = NormalizeRestockStatus(dto.RestockStatus);
            var ret = await _returnRepository.GetDetailAsync(id);
            if (ret == null) return null;
            if (!string.Equals(ret.Status, "Approved", StringComparison.OrdinalIgnoreCase)) throw new InvalidOperationException("Only approved returns can be restocked");

            var product = await GetProduct(ret.ProductId);
            var variant = GetVariant(product, ret.VariantId);
            StockItem? item = null;
            if (ret.StockItemId.HasValue) item = await _stockItemRepository.GetDetailAsync(ret.StockItemId.Value);
            if (item == null && !string.IsNullOrWhiteSpace(ret.SerialOrImei)) item = await _stockItemRepository.GetBySerialAsync(ret.SerialOrImei);

            var now = DateTime.UtcNow;
            var oldStatus = item?.Status;
            if (item != null)
            {
                item.Status = restockStatus;
                item.UpdatedAt = now;
                item.Note = dto.Note?.Trim() ?? item.Note;
                await _stockItemRepository.UpdateAsync(item);
            }

            if (restockStatus == "InStock")
            {
                // SP serial-tracked: tồn tính lại từ StockItems (item vừa chuyển InStock). SP thường: cộng 1.
                if (product.RequiresSerialTracking)
                {
                    await RecomputeStockAsync(product.Id);
                }
                else
                {
                    if (variant != null) variant.Stock += 1;
                    else product.Stock += 1;
                    product.UpdatedAt = now;
                    await _productRepository.UpdateAsync(product);
                }
                ret.Status = "Restocked";
            }
            else
            {
                if (product.RequiresSerialTracking) await RecomputeStockAsync(product.Id);
                ret.Status = "Damaged";
            }

            ret.UpdatedAt = now;
            ret.ReviewNote = dto.Note?.Trim() ?? ret.ReviewNote;
            await _returnRepository.UpdateAsync(ret);
            await AddMovement(product.Id, variant?.Id, item?.Id, item?.WarehouseId, "Return", 1, oldStatus, restockStatus, "Return", ret.Id, dto.Note, userId);
            return await GetReturnAsync(id);
        }

        public async Task<(List<StockMovementDto> Items, int TotalCount)> GetMovementsAsync(InventorySearchDto search)
        {
            var result = await _movementRepository.SearchAsync(search);
            return (result.Items.Select(ToMovementDto).ToList(), result.TotalCount);
        }

        // Đối soát tồn kho: đặt lại Product.Stock = số StockItems InStock cho mọi SP serial-tracked.
        // backfillTags: với SP không biến thể có tồn ảo (Stock > thực), sinh mã tem cho phần thiếu.
        public async Task<StockReconcileResultDto> ReconcileStockAsync(bool backfillTags, Guid? userId)
        {
            var result = new StockReconcileResultDto();
            var counts = (await _stockItemRepository.CountInStockGroupedAsync())
                .ToDictionary(x => x.ProductId, x => x.Count);
            var now = DateTime.UtcNow;

            // Lấy toàn bộ sản phẩm (gồm cả ẩn) theo trang
            var all = new List<Product>();
            var page = 1;
            while (true)
            {
                var (items, total) = await _productRepository.SearchAsync(new ProductSearchDto
                {
                    IncludeInactive = true,
                    Page = page,
                    PageSize = 100
                });
                all.AddRange(items);
                if (all.Count >= total || items.Count == 0) break;
                page++;
            }

            foreach (var product in all)
            {
                if (!product.RequiresSerialTracking) continue;
                result.ProductsChecked++;
                var oldStock = product.Stock;
                var real = counts.TryGetValue(product.Id, out var c) ? c : 0;
                var backfilled = 0;

                var activeVariants = product.Variants?.Where(v => v.IsActive).ToList() ?? new List<ProductVariant>();
                var hasVariants = activeVariants.Count > 0;
                if (backfillTags && oldStock > real)
                {
                    // Sinh tem nội bộ cho phần tồn còn thiếu StockItem.
                    // SP có biến thể: bù theo từng biến thể (Variant.Stock vs số InStock thực).
                    // SP không biến thể: bù ở mức sản phẩm.
                    if (hasVariants)
                    {
                        var variantCounts = await _stockItemRepository.CountInStockByVariantAsync(product.Id);
                        foreach (var variant in activeVariants)
                        {
                            var variantReal = variantCounts.TryGetValue(variant.Id, out var vc) ? vc : 0;
                            var need = Math.Max(0, variant.Stock - variantReal);
                            if (need <= 0) continue;
                            backfilled += await BackfillTagsForAsync(product, variant, need, now, userId);
                        }
                    }
                    else
                    {
                        backfilled += await BackfillTagsForAsync(product, null, oldStock - real, now, userId);
                    }
                    real += backfilled;
                }

                await RecomputeStockAsync(product.Id);

                if (oldStock != real || backfilled > 0)
                {
                    result.ProductsChanged++;
                    result.TagsBackfilled += backfilled;
                    result.Changes.Add(new StockReconcileItemDto
                    {
                        ProductId = product.Id,
                        ProductName = product.Name,
                        OldStock = oldStock,
                        NewStock = real,
                        TagsBackfilled = backfilled
                    });
                }
            }

            return result;
        }

        private async Task<Product> GetProduct(int id)
        {
            return await _productRepository.GetByIdAsync(id) ?? throw new InvalidOperationException($"Product {id} not found");
        }

        // Backfill InternalCode cho StockItems cũ + phân loại SerialOrImei thành Imei/SerialNumber.
        // Không xóa/ghi đè dữ liệu cũ — chỉ điền các cột còn trống.
        public async Task<StockReconcileResultDto> BackfillInternalCodesAsync(Guid? userId)
        {
            var result = new StockReconcileResultDto();
            var items = await _stockItemRepository.GetAllDetailedAsync();
            var groups = items.GroupBy(x => new { x.ProductId, x.VariantId });

            foreach (var g in groups)
            {
                var product = g.First().Product;
                if (product == null) continue;
                var variant = g.First().Variant;
                result.ProductsChecked++;

                var needCode = g.Where(x => string.IsNullOrWhiteSpace(x.InternalCode)).OrderBy(x => x.Id).ToList();
                var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                var newCodes = needCode.Count > 0
                    ? await GenerateInternalCodesAsync(product, variant, needCode.Count, seen)
                    : new List<string>();

                for (var i = 0; i < needCode.Count; i++)
                {
                    needCode[i].InternalCode = newCodes[i];
                }

                foreach (var it in g)
                {
                    // Chỉ promote IMEI thật (15 số + Luhn) lên cột Imei. KHÔNG đoán SerialNumber từ
                    // dữ liệu cũ — SerialNumber chỉ chứa serial thật nhập qua chế độ SERIAL về sau.
                    if (!it.IsAutoTag && string.IsNullOrEmpty(it.Imei))
                    {
                        var s = (it.SerialOrImei ?? string.Empty).Trim();
                        if (s.Length == 15 && s.All(char.IsDigit) && IsValidLuhn(s)) it.Imei = s;
                    }
                    it.UpdatedAt = DateTime.UtcNow;
                    await _stockItemRepository.UpdateAsync(it);
                }
                result.TagsBackfilled += needCode.Count;
            }

            foreach (var pid in items.Select(x => x.ProductId).Distinct())
            {
                await RecomputeStockAsync(pid);
            }
            result.ProductsChanged = result.TagsBackfilled;
            return result;
        }

        // ===== Mã định danh kho: SerialNumber / Imei / InternalCode =====
        public const string CodeTypeImei = "IMEI";
        public const string CodeTypeSerial = "SERIAL";
        public const string CodeTypeAuto = "AUTO_INTERNAL_CODE";

        internal sealed record StockCode(string? SerialNumber, string? Imei, string? InternalCode, string SerialOrImei, bool IsAutoTag);

        private static string CategoryCode(int? categoryId) => categoryId switch
        {
            1 => "PHONE",
            2 => "LAP",
            4 => "TAB",
            5 => "WATCH",
            6 => "CAM",
            7 => "HEAD",
            8 => "AUD",
            _ => "PROD"
        };

        // Chuẩn hóa 1 token: bỏ dấu, in hoa, chỉ giữ chữ-số
        private static string NormToken(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return string.Empty;
            var lowered = value.Trim().ToLowerInvariant().Replace((char)0x111, 'd');
            var norm = lowered.Normalize(System.Text.NormalizationForm.FormD);
            var sb = new System.Text.StringBuilder();
            foreach (var ch in norm)
            {
                if (System.Globalization.CharUnicodeInfo.GetUnicodeCategory(ch) == System.Globalization.UnicodeCategory.NonSpacingMark) continue;
                if (ch < 128 && char.IsLetterOrDigit(ch)) sb.Append(char.ToUpperInvariant(ch));
            }
            return sb.ToString();
        }

        // Tiền tố mã tem nội bộ: CATEGORY-PRODUCT-VARIANT (vd PHONE-IP16PM-256GB-VANG)
        private static string BuildInternalPrefix(Product product, ProductVariant? variant)
        {
            var parts = new List<string> { CategoryCode(product.CategoryId) };

            var sku = product.Sku ?? string.Empty;
            string prod;
            var dash = sku.IndexOf('-');
            if (dash >= 0 && dash < sku.Length - 1) prod = NormToken(sku[(dash + 1)..]);
            else prod = NormToken(string.IsNullOrWhiteSpace(sku) ? product.Name : sku);
            if (prod.Length > 14) prod = prod[..14];
            if (string.IsNullOrEmpty(prod)) prod = "P" + product.Id;
            parts.Add(prod);

            if (variant != null)
            {
                foreach (var token in new[] { NormToken(variant.Ram), NormToken(variant.Storage), NormToken(variant.ColorName) })
                {
                    if (!string.IsNullOrEmpty(token)) parts.Add(token);
                }
            }
            return string.Join("-", parts.Where(p => !string.IsNullOrEmpty(p)));
        }

        // Sinh `need` tem nội bộ (StockItem auto-tag, Status=InStock) cho 1 SP/biến thể. Trả về số đã tạo.
        private async Task<int> BackfillTagsForAsync(Product product, ProductVariant? variant, int need, DateTime now, Guid? userId)
        {
            if (need <= 0) return 0;
            var warehouseId = (await _warehouseRepository.GetDefaultAsync())?.Id;
            if (!warehouseId.HasValue)
            {
                throw new InvalidOperationException("Khong tim thay kho mac dinh de tao tem ton kho");
            }
            var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var newCodes = await GenerateInternalCodesAsync(product, variant, need, seen);
            var created = 0;
            foreach (var ic in newCodes)
            {
                var si = await _stockItemRepository.AddAsync(new StockItem
                {
                    ProductId = product.Id,
                    VariantId = variant?.Id,
                    WarehouseId = warehouseId,
                    SerialOrImei = ic,
                    InternalCode = ic,
                    IsAutoTag = true,
                    Sku = variant?.Sku ?? product.Sku,
                    Status = "InStock",
                    UnitCost = 0,
                    SupplierName = "Đối soát tồn kho",
                    ReceivedAt = now,
                    CreatedAt = now,
                    Note = "Backfill khi đối soát tồn kho"
                });
                await AddMovement(product.Id, variant?.Id, si.Id, warehouseId, "Adjust", 1, null, "InStock", "Manual", null, "Backfill đối soát tồn kho", userId);
                created++;
            }
            return created;
        }

        // Sinh N mã InternalCode duy nhất: {prefix}-{seq:000000}
        private async Task<List<string>> GenerateInternalCodesAsync(Product product, ProductVariant? variant, int quantity, HashSet<string> seen)
        {
            if (quantity <= 0) return new List<string>();
            var prefix = BuildInternalPrefix(product, variant);
            var seq = (await _stockItemRepository.CountByInternalCodePrefixAsync(prefix)) + 1;
            var result = new List<string>(quantity);
            var guard = 0;
            while (result.Count < quantity)
            {
                if (++guard > quantity + 100000) throw new InvalidOperationException("Không sinh được mã tem kho duy nhất");
                var candidate = $"{prefix}-{seq:000000}";
                seq++;
                if (!seen.Add(candidate)) continue;
                if (await _stockItemRepository.AnyInternalCodeAsync(candidate)) continue;
                result.Add(candidate);
            }
            return result;
        }

        private static string NormalizeCodeType(string? codeType, bool autoFlag)
        {
            var ct = (codeType ?? string.Empty).Trim().ToUpperInvariant();
            if (ct == CodeTypeImei || ct == CodeTypeSerial || ct == CodeTypeAuto) return ct;
            return autoFlag ? CodeTypeAuto : CodeTypeAuto; // mặc định an toàn: tự sinh
        }

        // Dựng bộ mã cho từng đơn vị nhập kho theo CodeType. Luôn gán InternalCode.
        private async Task<List<StockCode>> BuildStockCodesAsync(
            Product product, ProductVariant? variant, string codeType,
            List<string> inputCodes, int quantity, HashSet<string> seenSerialOrImei)
        {
            var internalSeen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var internalCodes = await GenerateInternalCodesAsync(product, variant, quantity, internalSeen);
            var codes = new List<StockCode>(quantity);

            if (codeType == CodeTypeAuto)
            {
                for (var i = 0; i < quantity; i++)
                {
                    var ic = internalCodes[i];
                    if (!seenSerialOrImei.Add(ic) || await _stockItemRepository.AnySerialAsync(ic))
                        throw new InvalidOperationException($"Mã tem kho bị trùng: {ic}");
                    codes.Add(new StockCode(null, null, ic, ic, true));
                }
                return codes;
            }

            var values = NormalizeSerials(inputCodes);
            if (values.Count != quantity) throw new InvalidOperationException("Số mã nhập phải bằng số lượng");
            if (values.Count != values.Distinct(StringComparer.OrdinalIgnoreCase).Count()) throw new InvalidOperationException("Có mã bị trùng trong danh sách nhập");

            for (var i = 0; i < quantity; i++)
            {
                var raw = values[i];
                if (!seenSerialOrImei.Add(raw)) throw new InvalidOperationException($"Mã bị trùng trong yêu cầu: {raw}");
                if (codeType == CodeTypeImei)
                {
                    ValidateImeiStrict(raw);
                    if (await _stockItemRepository.AnyImeiAsync(raw)) throw new InvalidOperationException($"IMEI đã tồn tại: {raw}");
                    if (await _stockItemRepository.AnySerialAsync(raw)) throw new InvalidOperationException($"Mã đã tồn tại: {raw}");
                    codes.Add(new StockCode(null, raw, internalCodes[i], raw, false));
                }
                else // SERIAL
                {
                    if (await _stockItemRepository.AnySerialNumberAsync(raw)) throw new InvalidOperationException($"Serial đã tồn tại: {raw}");
                    if (await _stockItemRepository.AnySerialAsync(raw)) throw new InvalidOperationException($"Mã đã tồn tại: {raw}");
                    codes.Add(new StockCode(raw, null, internalCodes[i], raw, false));
                }
            }
            return codes;
        }

        // IMEI bắt buộc đúng 15 chữ số + Luhn
        private static void ValidateImeiStrict(string imei)
        {
            var s = (imei ?? string.Empty).Trim();
            if (s.Length != 15 || !s.All(char.IsDigit))
                throw new InvalidOperationException($"IMEI phải gồm đúng 15 chữ số: {s}");
            if (!IsValidLuhn(s))
                throw new InvalidOperationException($"IMEI không hợp lệ (sai số kiểm tra Luhn): {s}");
        }

        private static bool IsValidLuhn(string digits)
        {
            var sum = 0;
            var alt = false;
            for (var i = digits.Length - 1; i >= 0; i--)
            {
                var d = digits[i] - '0';
                if (alt) { d *= 2; if (d > 9) d -= 9; }
                sum += d;
                alt = !alt;
            }
            return sum % 10 == 0;
        }

        // SP serial-tracked: Product.Stock & Variant.Stock = số StockItems InStock (nguồn sự thật).
        // SP không serial: giữ nguyên (tồn do nghiệp vụ nhập/đặt quản lý).
        private async Task RecomputeStockAsync(int productId)
        {
            var product = await _productRepository.GetByIdAsync(productId);
            if (product == null || !product.RequiresSerialTracking) return;

            var variantCounts = await _stockItemRepository.CountInStockByVariantAsync(productId);
            if (product.Variants != null)
            {
                foreach (var v in product.Variants)
                {
                    v.Stock = variantCounts.TryGetValue(v.Id, out var c) ? c : 0;
                }
            }
            // Product.Stock = tổng MỌI StockItem InStock của SP (kể cả hàng còn sót ở biến thể đã tắt),
            // để tồn tổng không bao giờ bị tụt âm thầm khi sửa/đổi biến thể.
            product.Stock = await _stockItemRepository.CountInStockByProductAsync(productId);
            product.UpdatedAt = DateTime.UtcNow;
            await _productRepository.UpdateAsync(product);
        }

        private async Task<Supplier?> ResolveSupplierAsync(int? supplierId, string? supplierName)
        {
            if (supplierId.HasValue && supplierId.Value > 0)
            {
                var supplier = await _supplierRepository.GetDetailAsync(supplierId.Value);
                if (supplier == null) throw new InvalidOperationException($"Supplier {supplierId.Value} not found");
                if (!supplier.IsActive) throw new InvalidOperationException("Supplier is inactive");
                return supplier;
            }

            if (!string.IsNullOrWhiteSpace(supplierName))
            {
                var normalized = supplierName.Trim();
                var supplier = await _supplierRepository.FirstOrDefaultAsync(x => x.Name.ToLower() == normalized.ToLower());
                if (supplier != null)
                {
                    if (!supplier.IsActive) throw new InvalidOperationException("Supplier is inactive");
                    return supplier;
                }
            }

            return null;
        }

        private static ProductVariant? GetVariant(Product product, int? variantId)
        {
            var activeVariants = product.Variants?.Where(x => x.IsActive).ToList() ?? new();
            if (!variantId.HasValue)
            {
                if (activeVariants.Count > 0)
                {
                    throw new InvalidOperationException("Variant is required for products that have variants");
                }
                return null;
            }

            var variants = product.Variants ?? new();
            return variants.FirstOrDefault(x => x.Id == variantId.Value && x.ProductId == product.Id)
                ?? throw new InvalidOperationException($"Variant {variantId.Value} not found");
        }

        private static void ValidateReceipt(CreateGoodsReceiptDto dto)
        {
            if (dto.CategoryId.GetValueOrDefault() <= 0) throw new InvalidOperationException("Category is required");
            if (dto.SupplierId.GetValueOrDefault() <= 0) throw new InvalidOperationException("Supplier is required");
            if (dto.Lines == null || dto.Lines.Count == 0) throw new InvalidOperationException("Receipt lines are required");
            if (dto.Lines.Any(x => x.ProductId <= 0 || x.Quantity <= 0 || x.UnitCost < 0)) throw new InvalidOperationException("Invalid receipt line");
        }

        private async Task AddMovement(int productId, int? variantId, int? stockItemId, int? warehouseId, string type, int quantity, string? fromStatus, string? toStatus, string referenceType, int? referenceId, string? note, Guid? userId)
        {
            await _movementRepository.AddAsync(new StockMovement
            {
                ProductId = productId,
                VariantId = variantId,
                StockItemId = stockItemId,
                WarehouseId = warehouseId,
                Type = type,
                Quantity = quantity,
                FromStatus = fromStatus,
                ToStatus = toStatus,
                ReferenceType = referenceType,
                ReferenceId = referenceId,
                Note = note,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = userId
            });
        }

        private static List<string> NormalizeSerials(IEnumerable<string>? values)
        {
            return values?.Where(x => !string.IsNullOrWhiteSpace(x)).Select(x => x.Trim()).ToList() ?? new();
        }

        private static List<string> SplitSerialText(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return new List<string>();
            return value
                .Split(new[] { ',', '\n', ';', '\r' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(x => x.Trim())
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();
        }

        private static string NormalizeStockStatus(string? value)
        {
            var status = string.IsNullOrWhiteSpace(value) ? "" : value.Trim();
            if (!StockStatuses.Contains(status)) throw new InvalidOperationException("Invalid stock item status");
            return StockStatuses.First(x => string.Equals(x, status, StringComparison.OrdinalIgnoreCase));
        }

        private static string NormalizeReturnCondition(string? value)
        {
            var condition = string.IsNullOrWhiteSpace(value) ? "Used" : value.Trim();
            if (!ReturnConditions.Contains(condition)) throw new InvalidOperationException("Invalid return condition");
            return ReturnConditions.First(x => string.Equals(x, condition, StringComparison.OrdinalIgnoreCase));
        }

        private static string NormalizeRestockStatus(string? value)
        {
            var status = NormalizeStockStatus(value);
            if (status != "InStock" && status != "Damaged") throw new InvalidOperationException("Restock status must be InStock or Damaged");
            return status;
        }

        private static string MovementTypeForStatus(string status)
        {
            return status switch
            {
                "Damaged" => "Damage",
                "Warranty" => "Warranty",
                "Repairing" => "Repair",
                _ => "Adjust"
            };
        }

        private static string GenerateReceiptCode(int id, DateTime now) => $"GR-{now:yyyyMMdd}-{id:0000}";
        private static string GenerateOpeningStockCode(int id, DateTime now) => $"OS-{now:yyyyMMdd}-{id:0000}";
        private static string GenerateReturnCode(int id, DateTime now) => $"RT-{now:yyyyMMdd}-{id:0000}";

        private static string? VariantName(ProductVariant? variant)
        {
            if (variant == null) return null;
            return variant.VariantName ?? string.Join(" ", new[] { variant.ColorName, variant.Storage, variant.Ram }.Where(x => !string.IsNullOrWhiteSpace(x)));
        }

        private static GoodsReceiptDto ToReceiptDto(GoodsReceipt item)
        {
            return new GoodsReceiptDto
            {
                Id = item.Id,
                ReceiptCode = item.ReceiptCode,
                SupplierId = item.SupplierId,
                SupplierName = item.SupplierName,
                WarehouseId = item.WarehouseId,
                WarehouseName = item.Warehouse?.Name,
                ReceivedAt = item.ReceivedAt,
                TotalQuantity = item.TotalQuantity,
                TotalCost = item.TotalCost,
                Note = item.Note,
                CreatedAt = item.CreatedAt,
                Lines = item.Lines.Select(ToReceiptLineDto).ToList()
            };
        }

        private static GoodsReceiptLineDto ToReceiptLineDto(GoodsReceiptLine item)
        {
            return new GoodsReceiptLineDto
            {
                Id = item.Id,
                ProductId = item.ProductId,
                ProductName = item.Product?.Name,
                VariantId = item.VariantId,
                VariantName = VariantName(item.Variant),
                Quantity = item.Quantity,
                UnitCost = item.UnitCost,
                TotalCost = item.TotalCost,
                Serials = item.Serials.Select(x => x.SerialOrImei).ToList()
            };
        }

        private static StockItemDto ToStockItemDto(StockItem item)
        {
            return new StockItemDto
            {
                Id = item.Id,
                ProductId = item.ProductId,
                ProductName = item.Product?.Name,
                VariantId = item.VariantId,
                VariantName = VariantName(item.Variant),
                WarehouseId = item.WarehouseId,
                WarehouseName = item.Warehouse?.Name,
                SupplierId = item.SupplierId ?? item.Product?.SupplierId,
                SupplierName = item.Supplier?.Name ?? item.Product?.Supplier?.Name ?? item.SupplierName,
                SerialOrImei = item.SerialOrImei,
                SerialNumber = item.SerialNumber,
                Imei = item.Imei,
                InternalCode = item.InternalCode,
                IsAutoTag = item.IsAutoTag,
                Sku = item.Sku,
                Status = item.Status,
                UnitCost = item.UnitCost,
                ReceivedAt = item.ReceivedAt,
                SoldAt = item.SoldAt,
                OrderId = item.OrderId,
                OrderDetailId = item.OrderDetailId,
                CustomerId = item.CustomerId,
                Note = item.Note,
                CreatedAt = item.CreatedAt,
                UpdatedAt = item.UpdatedAt
            };
        }

        public async Task<bool> HasOpeningStockAsync(int productId)
        {
            return await _transactionRepository.HasOpeningStockAsync(productId);
        }

        private static StockItemLookupDto ToLookupDto(StockItem item)
        {
            var dto = new StockItemLookupDto
            {
                OrderCode = item.Order?.OrderCode,
                CustomerName = item.Order?.CustomerName,
                CustomerPhone = item.Order?.CustomerPhone,
                CustomerEmail = item.Order?.CustomerEmail,
                OrderStatus = item.Order?.Status,
                WarrantyStatus = null
            };
            var baseDto = ToStockItemDto(item);
            dto.Id = baseDto.Id;
            dto.ProductId = baseDto.ProductId;
            dto.ProductName = baseDto.ProductName;
            dto.VariantId = baseDto.VariantId;
            dto.VariantName = baseDto.VariantName;
            dto.WarehouseId = baseDto.WarehouseId;
            dto.WarehouseName = baseDto.WarehouseName;
            dto.SupplierId = baseDto.SupplierId;
            dto.SupplierName = baseDto.SupplierName;
            dto.SerialOrImei = baseDto.SerialOrImei;
            dto.Sku = baseDto.Sku;
            dto.Status = baseDto.Status;
            dto.UnitCost = baseDto.UnitCost;
            dto.ReceivedAt = baseDto.ReceivedAt;
            dto.SoldAt = baseDto.SoldAt;
            dto.OrderId = baseDto.OrderId;
            dto.OrderDetailId = baseDto.OrderDetailId;
            dto.CustomerId = baseDto.CustomerId;
            dto.Note = baseDto.Note;
            dto.CreatedAt = baseDto.CreatedAt;
            dto.UpdatedAt = baseDto.UpdatedAt;
            return dto;
        }

        private static AgedStockDto ToAgedStockDto(StockItem item)
        {
            var days = Math.Max(0, (int)(DateTime.UtcNow - item.ReceivedAt).TotalDays);
            return new AgedStockDto
            {
                ProductId = item.ProductId,
                ProductName = item.Product?.Name,
                VariantId = item.VariantId,
                VariantName = VariantName(item.Variant),
                SerialOrImei = item.SerialOrImei,
                ReceivedAt = item.ReceivedAt,
                DaysInStock = days,
                UnitCost = item.UnitCost,
                EstimatedValue = item.UnitCost,
                Status = item.Status
            };
        }

        private static InventoryReturnDto ToReturnDto(InventoryReturn item)
        {
            return new InventoryReturnDto
            {
                Id = item.Id,
                ReturnCode = item.ReturnCode,
                OrderId = item.OrderId,
                OrderDetailId = item.OrderDetailId,
                ProductId = item.ProductId,
                ProductName = item.Product?.Name,
                VariantId = item.VariantId,
                VariantName = VariantName(item.Variant),
                StockItemId = item.StockItemId,
                SerialOrImei = item.SerialOrImei,
                CustomerName = item.CustomerName,
                CustomerPhone = item.CustomerPhone,
                Reason = item.Reason,
                Condition = item.Condition,
                Status = item.Status,
                RefundAmount = item.RefundAmount,
                Note = item.Note,
                CreatedAt = item.CreatedAt,
                UpdatedAt = item.UpdatedAt,
                CreatedByUserId = item.CreatedByUserId,
                ReviewedByUserId = item.ReviewedByUserId,
                ReviewNote = item.ReviewNote
            };
        }

        private static StockMovementDto ToMovementDto(StockMovement item)
        {
            return new StockMovementDto
            {
                Id = item.Id,
                ProductId = item.ProductId,
                ProductName = item.Product?.Name,
                VariantId = item.VariantId,
                VariantName = VariantName(item.Variant),
                StockItemId = item.StockItemId,
                WarehouseId = item.WarehouseId,
                WarehouseName = item.Warehouse?.Name,
                Type = item.Type,
                Quantity = item.Quantity,
                FromStatus = item.FromStatus,
                ToStatus = item.ToStatus,
                ReferenceType = item.ReferenceType,
                ReferenceId = item.ReferenceId,
                Note = item.Note,
                CreatedAt = item.CreatedAt,
                CreatedByUserId = item.CreatedByUserId
            };
        }
    }
}
