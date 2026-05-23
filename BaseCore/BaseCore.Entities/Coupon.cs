using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BaseCore.Entities
{
    public class Coupon
    {
        [BsonId]
        public int Id { get; set; }
        public string Code { get; set; } = "";
        public string Name { get; set; } = "";
        public string? Description { get; set; }
        public string Type { get; set; } = "Product";
        public string DiscountType { get; set; } = "Amount";
        public decimal DiscountValue { get; set; }
        public decimal? MaxDiscountAmount { get; set; }
        public decimal MinOrderAmount { get; set; }
        public DateTime StartAt { get; set; }
        public DateTime EndAt { get; set; }
        public int TotalQuantity { get; set; }
        public int UsedQuantity { get; set; }
        public int ClaimedQuantity { get; set; }
        public int PerUserLimit { get; set; } = 1;
        public bool IsActive { get; set; } = true;
        public bool IsPublic { get; set; } = true;
        public bool IsAutoClaimable { get; set; } = true;
        public bool IsStackable { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        [BsonRepresentation(BsonType.String)]
        public Guid? CreatedByUserId { get; set; }

        [BsonIgnore]
        public List<CouponScope> Scopes { get; set; } = new();
    }
}
