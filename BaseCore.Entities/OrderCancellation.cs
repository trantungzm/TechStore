
namespace BaseCore.Entities
{
    public class OrderCancellation
    {
        public int Id { get; set; }
        public int OrderId { get; set; }

        public Guid? RequestedByUserId { get; set; }

        public string? Reason { get; set; }
        public string Status { get; set; } = "Pending";
        public string? AdminNote { get; set; }

        public Guid? ReviewedByUserId { get; set; }

        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReviewedAt { get; set; }

        public Order? Order { get; set; }
    }
}
