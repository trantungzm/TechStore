
namespace BaseCore.Entities
{
    public class SupportTicketUpdate
    {
        public int Id { get; set; }
        public int TicketId { get; set; }
        public int? ParentMessageId { get; set; }
        public string Message { get; set; } = "";
        public string SenderName { get; set; } = "";
        public string? StatusAfter { get; set; }
        public string? PriorityAfter { get; set; }

        public Guid? CreatedByUserId { get; set; }

        public bool IsAdminReply { get; set; }
        public bool IsInternalNote { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public SupportTicket? Ticket { get; set; }
        public SupportTicketUpdate? ParentMessage { get; set; }
        public List<SupportTicketUpdate> Replies { get; set; } = new();
    }
}
