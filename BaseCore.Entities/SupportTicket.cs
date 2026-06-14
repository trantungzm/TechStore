
namespace BaseCore.Entities
{
    public class SupportTicket
    {
        public int Id { get; set; }
        public string TicketCode { get; set; } = "";

        public Guid? UserId { get; set; }

        public string Subject { get; set; } = "";
        public string Description { get; set; } = "";
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string? CustomerEmail { get; set; }
        public int? RelatedOrderId { get; set; }
        public int? RelatedProductId { get; set; }
        public int? RelatedWarrantyId { get; set; }
        public string? SerialOrImei { get; set; }
        public string? UserSessionId { get; set; }
        public string Status { get; set; } = "Open";
        public string Priority { get; set; } = "Normal";
        public string Category { get; set; } = "Other";

        public Guid? AssignedToUserId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? ClosedAt { get; set; }

        public Order? RelatedOrder { get; set; }
        public Product? RelatedProduct { get; set; }
        public WarrantyRecord? RelatedWarranty { get; set; }
        public List<SupportTicketUpdate> Updates { get; set; } = new();
    }
}
