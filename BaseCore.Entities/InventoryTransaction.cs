using BaseCore.Common;

namespace BaseCore.Entities
{
    public class InventoryTransaction
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public int? VariantId { get; set; }
        public Enums.InventoryTransactionType Type { get; set; }
        public int Quantity { get; set; }
        public decimal UnitCost { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int? ReferenceId { get; set; }
        public string? Note { get; set; }
        public Guid? CreatedByUserId { get; set; }

        // Navigation properties
        public Product? Product { get; set; }
        public ProductVariant? Variant { get; set; }
    }
}
