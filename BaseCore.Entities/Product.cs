using System.ComponentModel.DataAnnotations.Schema;

namespace BaseCore.Entities
{
    public class Product
    {
        public int Id { get; set; }

        public string Name { get; set; }
        public string? Slug { get; set; }

        public decimal? BasePrice { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public decimal? OriginalPrice { get; set; }
        public int? TotalStock { get; set; }
        public int Version { get; set; }

        [NotMapped]
        public decimal Price
        {
            get => BasePrice ?? MinPrice ?? 0;
            set
            {
                BasePrice = value;
                MinPrice ??= value;
                MaxPrice ??= value;
            }
        }

        [NotMapped]
        public int Stock
        {
            get => TotalStock ?? 0;
            set => TotalStock = value;
        }

        [NotMapped]
        public string? Sku { get; set; }
 
        public string? ImageUrl { get; set; }

        public string? Description { get; set; }
        public string? LongDescription { get; set; }
        public string? Brand { get; set; }
        public int? SupplierId { get; set; }
        public int? BackupSupplierId { get; set; }
        public string? SupplyType { get; set; }
        public string? WarrantyProvider { get; set; }

        public int CategoryId { get; set; }

        /// <summary> 
        /// Additional categories the product belongs to (many-to-many).
        /// The primary category is still CategoryId.
        /// </summary>
        public List<ProductCategory> ProductCategories { get; set; } = new();
        public bool IsActive { get; set; } = true;
        public bool IsFeatured { get; set; }
        public bool IsBestSeller { get; set; }
        public bool IsNewArrival { get; set; }
        public bool IsDiscounted { get; set; }
        public bool RequiresSerialTracking { get; set; }
        public int WarrantyMonths { get; set; } = 12;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public Category Category { get; set; }

        public Supplier? Supplier { get; set; }

        public Supplier? BackupSupplier { get; set; }

        public List<ProductImage> Images { get; set; } = new();

        public List<ProductVariant> Variants { get; set; } = new();

        public List<ProductSpecValue> SpecValues { get; set; } = new();

        public List<ProductRecommendation> Recommendations { get; set; } = new();
    }
}
