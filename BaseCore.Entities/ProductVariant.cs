using System.ComponentModel.DataAnnotations.Schema;

namespace BaseCore.Entities
{
    public class ProductVariant
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string? VariantName { get; set; }
        public decimal Price { get; set; }
        public decimal? OriginalPrice { get; set; }
        public string? AttributesJson { get; set; }
        public int Stock { get; set; }
        public string? Sku { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsDefault { get; set; }
        public int Version { get; set; }

        [NotMapped]
        public string? ColorName { get; set; }

        [NotMapped]
        public string? ColorCode { get; set; }

        [NotMapped]
        public string? Storage { get; set; }

        [NotMapped]
        public string? Ram { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public Product Product { get; set; }
    }
}
