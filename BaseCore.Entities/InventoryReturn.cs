
namespace BaseCore.Entities
{
    public class InventoryReturn
    {
        public int Id { get; set; }
        public string ReturnCode { get; set; } = "";
        public int? OrderId { get; set; }
        public int? OrderDetailId { get; set; }
        public int ProductId { get; set; }
        public int? VariantId { get; set; }
        public int? StockItemId { get; set; }
        public string? SerialOrImei { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string Reason { get; set; } = "";
        public string Condition { get; set; } = "Used";
        public string Status { get; set; } = "Pending";
        public decimal RefundAmount { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public Guid? CreatedByUserId { get; set; }

        public Guid? ReviewedByUserId { get; set; }

        public string? ReviewNote { get; set; }

        public Product? Product { get; set; }
        public ProductVariant? Variant { get; set; }
        public StockItem? StockItem { get; set; }
        public Order? Order { get; set; }
        public OrderDetail? OrderDetail { get; set; }
    }
}
