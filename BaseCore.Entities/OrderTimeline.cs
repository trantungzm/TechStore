
namespace BaseCore.Entities
{
    public class OrderTimeline
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public string Status { get; set; } = "";
        public string Title { get; set; } = "";
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Guid? CreatedByUserId { get; set; }

        public Order? Order { get; set; }
    }
}
