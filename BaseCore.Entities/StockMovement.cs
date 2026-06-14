
namespace BaseCore.Entities
{
    public class StockMovement
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public int? VariantId { get; set; }
        public int? StockItemId { get; set; }
        public int? WarehouseId { get; set; }
        public string Type { get; set; } = "";
        public int Quantity { get; set; }
        public string? FromStatus { get; set; }
        public string? ToStatus { get; set; }
        public string ReferenceType { get; set; } = "";
        public int? ReferenceId { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Guid? CreatedByUserId { get; set; }

        public Product? Product { get; set; }
        public ProductVariant? Variant { get; set; }
        public StockItem? StockItem { get; set; }
        public Warehouse? Warehouse { get; set; }
    }
}
