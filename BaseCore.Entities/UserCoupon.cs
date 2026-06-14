
namespace BaseCore.Entities
{
    public class UserCoupon
    {
        public int Id { get; set; }

        public Guid UserId { get; set; }

        public int CouponId { get; set; }
        public DateTime ClaimedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UsedAt { get; set; }
        public string Status { get; set; } = "Claimed";
        public DateTime? ExpiredAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public Coupon Coupon { get; set; }
    }
}
