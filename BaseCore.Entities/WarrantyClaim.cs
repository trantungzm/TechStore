
namespace BaseCore.Entities
{
    public class WarrantyClaim
    {
        public int Id { get; set; }
        public string ClaimCode { get; set; } = "";
        public int WarrantyId { get; set; }

        public Guid? UserId { get; set; }

        public int? OrderId { get; set; }
        public int? OrderDetailId { get; set; }
        public int ProductId { get; set; }
        public int? VariantId { get; set; }
        public int? StockItemId { get; set; }
        public string? SerialOrImei { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string? CustomerEmail { get; set; }
        public string IssueDescription { get; set; } = "";
        public string ReceiveMethod { get; set; } = "";
        public string? ReturnAddress { get; set; }
        public string Status { get; set; } = "Pending";
        public string Priority { get; set; } = "Normal";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? ReceivedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string? RejectedReason { get; set; }
        public string? Note { get; set; }

        public WarrantyRecord? Warranty { get; set; }
        public Product? Product { get; set; }
        public ProductVariant? Variant { get; set; }
        public StockItem? StockItem { get; set; }
        public List<WarrantyClaimUpdate> Updates { get; set; } = new();
    }
}
