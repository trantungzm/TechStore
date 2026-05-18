using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BaseCore.Entities
{
    public class OrderTimeline
    {
        [BsonId]
        public int Id { get; set; }
        public int OrderId { get; set; }
        public string Status { get; set; } = "";
        public string Title { get; set; } = "";
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonRepresentation(BsonType.String)]
        public Guid? CreatedByUserId { get; set; }

        [BsonIgnore]
        public Order? Order { get; set; }
    }
}
