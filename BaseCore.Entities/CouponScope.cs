namespace BaseCore.Entities
{
    public class CouponScope
    {
        public int Id { get; set; }
        public int CouponId { get; set; }
        public string ScopeType { get; set; } = "All";
        public int? ProductId { get; set; }
        public int? CategoryId { get; set; }
        public string? Brand { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Coupon Coupon { get; set; }
        public Product? Product { get; set; }
        public Category? Category { get; set; }
    }
}
