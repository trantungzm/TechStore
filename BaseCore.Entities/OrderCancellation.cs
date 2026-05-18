using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BaseCore.Entities
{
    public class OrderCancellation
    {
        [BsonId]
        public int Id { get; set; }
        public int OrderId { get; set; }

        [BsonRepresentation(BsonType.String)]
        public Guid? RequestedByUserId { get; set; }

        public string? Reason { get; set; }
        public string Status { get; set; } = "Pending";
        public string? AdminNote { get; set; }

        [BsonRepresentation(BsonType.String)]
        public Guid? ReviewedByUserId { get; set; }

        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReviewedAt { get; set; }

        [BsonIgnore]
        public Order? Order { get; set; }
    }
}
