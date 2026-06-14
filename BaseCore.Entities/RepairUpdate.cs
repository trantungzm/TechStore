
namespace BaseCore.Entities
{
    public class RepairUpdate
    {
        public int Id { get; set; }
        public int RepairCaseId { get; set; }
        public string Status { get; set; } = "";
        public string Title { get; set; } = "";
        public string? Message { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Guid? CreatedByUserId { get; set; }

        public RepairCase? RepairCase { get; set; }
    }
}
