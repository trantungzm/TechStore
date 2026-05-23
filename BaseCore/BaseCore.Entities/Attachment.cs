using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BaseCore.Entities
{
    public class Attachment
    {
        public int Id { get; set; }
        public string EntityType { get; set; } = "";
        public int? EntityId { get; set; }
        public string FileName { get; set; } = "";
        public string FileUrl { get; set; } = "";
        public string ContentType { get; set; } = "";
        public long Size { get; set; }

        [BsonRepresentation(BsonType.String)]
        public Guid? UploadedByUserId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
