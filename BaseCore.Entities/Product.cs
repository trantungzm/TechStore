using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BaseCore.Entities
{
    public class Product
    {
        [BsonId]
        public int Id { get; set; }

        public string Name { get; set; }
        public string? Slug { get; set; }
        public string? Sku { get; set; }

        public decimal Price { get; set; }
        public decimal? OriginalPrice { get; set; }

        public int Stock { get; set; }

        public string? ImageUrl { get; set; }

        public string? Description { get; set; }
        public string? LongDescription { get; set; }
        public string? Brand { get; set; }

        public int CategoryId { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsFeatured { get; set; }
        public bool IsBestSeller { get; set; }
        public bool IsNewArrival { get; set; }
        public bool IsDiscounted { get; set; }
        public bool RequiresSerialTracking { get; set; }
        public int WarrantyMonths { get; set; } = 12;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        [BsonIgnore]
        public Category Category { get; set; }

        [BsonIgnore]
        public List<ProductImage> Images { get; set; } = new();

        [BsonIgnore]
        public List<ProductVariant> Variants { get; set; } = new();

        [BsonIgnore]
        public List<ProductSpecValue> SpecValues { get; set; } = new();

        [BsonIgnore]
        public List<ProductRecommendation> Recommendations { get; set; } = new();
    }
}
