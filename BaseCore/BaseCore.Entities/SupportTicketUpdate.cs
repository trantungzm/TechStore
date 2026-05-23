using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BaseCore.Entities
{
    public class SupportTicketUpdate
    {
        public int Id { get; set; }
        public int TicketId { get; set; }
        public string Message { get; set; } = "";
        public string? StatusAfter { get; set; }
        public string? PriorityAfter { get; set; }

        [BsonRepresentation(BsonType.String)]
        public Guid? CreatedByUserId { get; set; }

        public bool IsInternalNote { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonIgnore] public SupportTicket? Ticket { get; set; }
    }
}
