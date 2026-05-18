namespace BaseCore.Entities
{
    public class ProductRecommendation
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public int RecommendedProductId { get; set; }
        public string Type { get; set; } = "CrossSell";
        public int SortOrder { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Product Product { get; set; }
        public Product RecommendedProduct { get; set; }
    }
}
