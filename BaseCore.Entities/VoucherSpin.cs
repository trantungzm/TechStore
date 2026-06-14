
namespace BaseCore.Entities
{
    public class VoucherSpin
    {
        public int Id { get; set; }

        public Guid UserId { get; set; }

        public DateTime SpinDate { get; set; }
        public int? RewardCouponId { get; set; }
        public string? RewardCode { get; set; }
        public string ResultType { get; set; } = "NoReward";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Coupon? RewardCoupon { get; set; }
    }
}
