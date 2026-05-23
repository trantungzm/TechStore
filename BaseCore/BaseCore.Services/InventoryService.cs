using BaseCore.DTO.Inventory;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;

namespace BaseCore.Services
{
    public class InventoryService : IInventoryService
    {
        private static readonly HashSet<string> StockStatuses = new(StringComparer.OrdinalIgnoreCase)
        {
            "InStock", "Reserved", "Sold", "Returned", "Repairing", "Warranty", "Damaged", "Lost"
        };

        private static readonly HashSet<string> ReturnStatuses = new(StringComparer.OrdinalIgnoreCase)
        {
            "Pending", "Approved", "Rejected", "Restocked", "Damaged"
        };

        private static readonly HashSet<string> ReturnConditions = new(StringComparer.OrdinalIgnoreCase)
        {
            "New", "OpenBox", "Used", "Damaged", "Defective"
        };

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
        private readonly ICategorySupplierRepositoryEF _categorySupplierRepository;

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
            ICategorySupplierRepositoryEF categorySupplierRepository)
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
            _orderRepository = orderRepository;
            _orderDetailRepository = orderDetailRepository;
            _supplierRepository = supplierRepository;
            _categorySupplierRepository = categorySupplierRepository;
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
                var serials = NormalizeSerials(line.Serials);

                if (product.RequiresSerialTracking)
                {
                    if (serials.Count != line.Quantity) throw new InvalidOperationException($"Serial count must equal quantity for {product.Name}");
                    if (serials.Count != serials.Distinct(StringComparer.OrdinalIgnoreCase).Count()) throw new InvalidOperationException("Duplicate serial/IMEI in request");
                    foreach (var serial in serials)
                    {
                        if (!seenSerials.Add(serial)) throw new InvalidOperationException($"Duplicate serial/IMEI in request: {serial}");
                        if (await _stockItemRepository.AnySerialAsync(serial)) throw new InvalidOperationException($"Serial/IMEI already exists: {serial}");
                    }
                }

                if (variant != null) variant.Stock += line.Quantity;
                else product.Stock += line.Quantity;
                product.UpdatedAt = now;
            }

            if (categoryId <= 0) throw new InvalidOperationException("Category is required");
            if (!await _categorySupplierRepository.ExistsAsync(categoryId, supplier.Id))
            {
                throw new InvalidOperationException("Supplier is not configured for the selected category");
            }

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
                    foreach (var serial in NormalizeSerials(lineDto.Serials))
                    {
                        var stockItem = await _stockItemRepository.AddAsync(new StockItem
                        {
                            ProductId = product.Id,
                            VariantId = variant?.Id,
                            WarehouseId = warehouseId,
                            SupplierId = supplier?.Id,
                            SerialOrImei = serial,
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
                            SerialOrImei = serial,
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
                item.Status = "Sold";
                item.SoldAt = now;
                item.UpdatedAt = now;
                await _stockItemRepository.UpdateAsync(item);
                await _orderDetailStockItemRepository.AddAsync(new OrderDetailStockItem { OrderDetailId = detail.Id, StockItemId = item.Id, CreatedAt = now });
                await AddMovement(item.ProductId, item.VariantId, item.Id, item.WarehouseId, "Sale", 1, oldStatus, "Sold", "Order", order.Id, "Gan serial/IMEI cho don hang", userId);
            }

            detail.SerialOrImei = items.Count == 1 ? items[0].SerialOrImei : string.Join(", ", items.Select(x => x.SerialOrImei));
            await _orderDetailRepository.UpdateAsync(detail);
            return (await _stockItemRepository.GetByIdsAsync(ids)).Select(ToStockItemDto).ToList();
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
                if (variant != null) variant.Stock += 1;
                else product.Stock += 1;
                product.UpdatedAt = now;
                await _productRepository.UpdateAsync(product);
                ret.Status = "Restocked";
            }
            else
            {
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

        private async Task<Product> GetProduct(int id)
        {
            return await _productRepository.GetByIdAsync(id) ?? throw new InvalidOperationException($"Product {id} not found");
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
            if (!variantId.HasValue) return null;
            return product.Variants.FirstOrDefault(x => x.Id == variantId.Value && x.ProductId == product.Id)
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
                SupplierId = item.SupplierId,
                SupplierName = item.Supplier?.Name ?? item.SupplierName,
                SerialOrImei = item.SerialOrImei,
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
