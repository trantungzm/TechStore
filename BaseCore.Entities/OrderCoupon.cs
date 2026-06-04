namespace BaseCore.Entities
{
    public class OrderCoupon
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public int CouponId { get; set; }
        public int? UserCouponId { get; set; }
        public string CouponCode { get; set; } = "";
        public string CouponName { get; set; } = "";
        public string CouponType { get; set; } = "Product";
        public string DiscountType { get; set; } = "Amount";
        public decimal DiscountValue { get; set; }
        public decimal DiscountAmount { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Order Order { get; set; }
        public Coupon Coupon { get; set; }
        public UserCoupon? UserCoupon { get; set; }
    }
}
