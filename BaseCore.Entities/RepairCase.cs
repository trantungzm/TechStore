
namespace BaseCore.Entities
{
    public class RepairCase
    {
        public int Id { get; set; }
        public string RepairCode { get; set; } = "";
        public int? WarrantyClaimId { get; set; }
        public int? TicketId { get; set; }
        public int? StockItemId { get; set; }
        public int ProductId { get; set; }
        public int? VariantId { get; set; }
        public string? SerialOrImei { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string? ProductName { get; set; }
        public string IssueDescription { get; set; } = "";
        public string? Diagnosis { get; set; }
        public string? Solution { get; set; }

        public Guid? TechnicianId { get; set; }

        public string Status { get; set; } = "Pending";
        public string Priority { get; set; } = "Normal";
        public DateTime ReceivedAt { get; set; } = DateTime.UtcNow;
        public DateTime? EstimatedCompletionAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public decimal CostEstimate { get; set; }
        public decimal FinalCost { get; set; }
        public bool IsWarrantyCovered { get; set; }
        public bool CustomerApprovedCost { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public WarrantyClaim? WarrantyClaim { get; set; }
        public SupportTicket? Ticket { get; set; }
        public StockItem? StockItem { get; set; }
        public Product? Product { get; set; }
        public ProductVariant? Variant { get; set; }
        public List<RepairUpdate> Updates { get; set; } = new();
    }
}
