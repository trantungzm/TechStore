
namespace BaseCore.Entities
{
    public class GoodsReceipt
    {
        public int Id { get; set; }
        public string ReceiptCode { get; set; } = "";
        public int? SupplierId { get; set; }
        public string SupplierName { get; set; } = "";
        public int? WarehouseId { get; set; }
        public DateTime ReceivedAt { get; set; } = DateTime.UtcNow;

        public Guid? CreatedByUserId { get; set; }

        public string? Note { get; set; }
        public int TotalQuantity { get; set; }
        public decimal TotalCost { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public Supplier? Supplier { get; set; }

        public Warehouse? Warehouse { get; set; }

        public List<GoodsReceiptLine> Lines { get; set; } = new();
    }
}
