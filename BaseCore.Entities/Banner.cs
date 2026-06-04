namespace BaseCore.Entities
{
    public class Banner
    {
        public int Id { get; set; }
        public string Kicker { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string SubTitle { get; set; } = string.Empty;
        public string CtaLabel { get; set; } = string.Empty;
        public string CtaTo { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        
        // Special Offer section
        public string OfferTitle { get; set; } = string.Empty;
        public string OfferDiscount { get; set; } = string.Empty;
        public string OfferProduct { get; set; } = string.Empty;
        
        // Display management
        public int DisplayOrder { get; set; } = 0;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
