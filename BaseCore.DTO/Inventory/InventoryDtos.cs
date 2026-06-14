namespace BaseCore.DTO.Inventory
{
    public class CreateGoodsReceiptDto
    {
        public int? CategoryId { get; set; }
        public int? SupplierId { get; set; }
        public string? SupplierName { get; set; }
        public int? WarehouseId { get; set; }
        public DateTime? ReceivedAt { get; set; }
        public string? Note { get; set; }
        public List<CreateGoodsReceiptLineDto> Lines { get; set; } = new();
    }

    public class CreateOpeningStockDto
    {
        public int ProductId { get; set; }
        public int? VariantId { get; set; }
        public int? WarehouseId { get; set; }
        public int Quantity { get; set; }
        public List<string> Serials { get; set; } = new();
        // Loại mã: "IMEI" | "SERIAL" | "AUTO_INTERNAL_CODE"
        public string? CodeType { get; set; }
        // (giữ tương thích) true = tự sinh mã tem nội bộ
        public bool AutoGenerateSerials { get; set; }
        public DateTime? ReceivedAt { get; set; }
        public string? Note { get; set; }
    }

    public class CreateGoodsReceiptLineDto
    {
        public int ProductId { get; set; }
        public int? VariantId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitCost { get; set; }
        public List<string> Serials { get; set; } = new();
        // Loại mã: "IMEI" | "SERIAL" | "AUTO_INTERNAL_CODE"
        public string? CodeType { get; set; }
        // (giữ tương thích) true = tự sinh mã tem nội bộ
        public bool AutoGenerateSerials { get; set; }
    }

    public class GoodsReceiptDto
    {
        public int Id { get; set; }
        public string ReceiptCode { get; set; } = "";
        public int? SupplierId { get; set; }
        public string SupplierName { get; set; } = "";
        public int? WarehouseId { get; set; }
        public string? WarehouseName { get; set; }
        public DateTime ReceivedAt { get; set; }
        public int TotalQuantity { get; set; }
        public decimal TotalCost { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<GoodsReceiptLineDto> Lines { get; set; } = new();
    }

    public class GoodsReceiptLineDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public int? VariantId { get; set; }
        public string? VariantName { get; set; }
        public int Quantity { get; set; }
        public decimal UnitCost { get; set; }
        public decimal TotalCost { get; set; }
        public List<string> Serials { get; set; } = new();
    }

    public class StockItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public int? VariantId { get; set; }
        public string? VariantName { get; set; }
        public int? WarehouseId { get; set; }
        public string? WarehouseName { get; set; }
        public int? SupplierId { get; set; }
        public string? SupplierName { get; set; }
        public string SerialOrImei { get; set; } = "";
        public string? SerialNumber { get; set; }
        public string? Imei { get; set; }
        public string? InternalCode { get; set; }
        public bool IsAutoTag { get; set; }
        public string? Sku { get; set; }
        public string Status { get; set; } = "";
        public decimal UnitCost { get; set; }
        public DateTime ReceivedAt { get; set; }
        public DateTime? SoldAt { get; set; }
        public int? OrderId { get; set; }
        public int? OrderDetailId { get; set; }
        public Guid? CustomerId { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class StockItemLookupDto : StockItemDto
    {
        public string? OrderCode { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string? CustomerEmail { get; set; }
        public string? OrderStatus { get; set; }
        public string? WarrantyStatus { get; set; }
    }

    public class UpdateStockItemStatusDto
    {
        public string Status { get; set; } = "";
        public string? Note { get; set; }
    }

    public class AssignStockItemsDto
    {
        public int OrderId { get; set; }
        public int OrderDetailId { get; set; }
        public List<int> StockItemIds { get; set; } = new();
    }

    public class AgedStockDto
    {
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public int? VariantId { get; set; }
        public string? VariantName { get; set; }
        public string? SerialOrImei { get; set; }
        public DateTime ReceivedAt { get; set; }
        public int DaysInStock { get; set; }
        public decimal UnitCost { get; set; }
        public decimal EstimatedValue { get; set; }
        public string Status { get; set; } = "";
    }

    public class CreateInventoryReturnDto
    {
        public int? OrderId { get; set; }
        public int? OrderDetailId { get; set; }
        public int? ProductId { get; set; }
        public int? VariantId { get; set; }
        public int? StockItemId { get; set; }
        public string? SerialOrImei { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string? Reason { get; set; }
        public string? Condition { get; set; }
        public decimal RefundAmount { get; set; }
        public string? Note { get; set; }
    }

    public class InventoryReturnDto
    {
        public int Id { get; set; }
        public string ReturnCode { get; set; } = "";
        public int? OrderId { get; set; }
        public int? OrderDetailId { get; set; }
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public int? VariantId { get; set; }
        public string? VariantName { get; set; }
        public int? StockItemId { get; set; }
        public string? SerialOrImei { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string Reason { get; set; } = "";
        public string Condition { get; set; } = "";
        public string Status { get; set; } = "";
        public decimal RefundAmount { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? CreatedByUserId { get; set; }
        public Guid? ReviewedByUserId { get; set; }
        public string? ReviewNote { get; set; }
    }

    public class ReviewInventoryReturnDto
    {
        public bool Approved { get; set; }
        public string? ReviewNote { get; set; }
    }

    public class RestockReturnDto
    {
        public string RestockStatus { get; set; } = "";
        public string? Note { get; set; }
    }

    public class ReconcileStockRequestDto
    {
        // true = sinh mã tem cho phần tồn ảo (Stock > số StockItems) ở SP không biến thể
        public bool BackfillTags { get; set; }
    }

    public class StockReconcileItemDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = "";
        public int OldStock { get; set; }
        public int NewStock { get; set; }
        public int TagsBackfilled { get; set; }
    }

    public class StockReconcileResultDto
    {
        public int ProductsChecked { get; set; }
        public int ProductsChanged { get; set; }
        public int TagsBackfilled { get; set; }
        public List<StockReconcileItemDto> Changes { get; set; } = new();
    }

    public class StockMovementDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public int? VariantId { get; set; }
        public string? VariantName { get; set; }
        public int? StockItemId { get; set; }
        public int? WarehouseId { get; set; }
        public string? WarehouseName { get; set; }
        public string Type { get; set; } = "";
        public int Quantity { get; set; }
        public string? FromStatus { get; set; }
        public string? ToStatus { get; set; }
        public string ReferenceType { get; set; } = "";
        public int? ReferenceId { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid? CreatedByUserId { get; set; }
    }

    public class InventorySearchDto
    {
        public string? Keyword { get; set; }
        public int? ProductId { get; set; }
        public int? VariantId { get; set; }
        public int? SupplierId { get; set; }
        public int? CategoryId { get; set; }
        public string? Status { get; set; }
        public int? WarehouseId { get; set; }
        public string? SerialOrImei { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int? MinDays { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 50;
        public string? SortBy { get; set; } = "newest";
    }

    public class InventoryReturnSearchDto
    {
        public string? Status { get; set; }
        public string? Keyword { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }

    public class AgedStockSearchDto
    {
        public int MinDays { get; set; } = 30;
        public int? CategoryId { get; set; }
        public int? SupplierId { get; set; }
        public int? WarehouseId { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }

    public class SupplierDto
    {
        public int Id { get; set; }
        public string SupplierCode { get; set; } = "";
        public string Code { get; set; } = "";
        public string Name { get; set; } = "";
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? TaxCode { get; set; }
        public string? ContactPerson { get; set; }
        public string SupplierType { get; set; } = "AuthorizedDistributor";
        public string? Note { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class SupplierUpsertDto
    {
        public string Name { get; set; } = "";
        public string? SupplierCode { get; set; }
        public string? Code { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? TaxCode { get; set; }
        public string? ContactPerson { get; set; }
        public string? SupplierType { get; set; }
        public string? Note { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class SupplierSearchDto
    {
        public string? Keyword { get; set; }
        public bool? IsActive { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }

    public class CategorySupplierDto
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public int SupplierId { get; set; }
        public string? SupplierCode { get; set; }
        public string? SupplierName { get; set; }
        public string? SupplierType { get; set; }
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }
    }

    public class CategorySupplierUpsertDto
    {
        public int CategoryId { get; set; }
        public int SupplierId { get; set; }
        public int SortOrder { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
