
namespace BaseCore.Entities
{
    public class Notification
    {
        public int Id { get; set; }

        public Guid? UserId { get; set; }

        public string Title { get; set; } = "";
        public string Message { get; set; } = "";
        public string Type { get; set; } = "System";
        public string ReferenceType { get; set; } = "None";
        public int? ReferenceId { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReadAt { get; set; }
    }
}
