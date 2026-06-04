using BaseCore.DTO.Coupons;

namespace BaseCore.Services
{
    public interface ICouponService
    {
        Task<(List<CouponDto> Items, int TotalCount)> GetCouponsAsync(CouponSearchDto search, Guid? userId = null);
        Task<CouponDto?> GetCouponAsync(int id, Guid? userId = null);
        Task<CouponDto> CreateAsync(CouponCreateDto dto, Guid? userId);
        Task<CouponDto?> UpdateAsync(int id, CouponUpdateDto dto);
        Task<bool> DeleteAsync(int id);
        Task<CouponDto?> ToggleAsync(int id);
        Task<List<UserCouponDto>> GetCouponUsersAsync(int couponId);
        Task<(List<CouponDto> Items, int TotalCount)> GetPublicAsync(CouponSearchDto search, Guid? userId);
        Task<(List<UserCouponDto> Items, int TotalCount)> GetMyAsync(Guid userId, UserCouponSearchDto search);
        Task<UserCouponDto> ClaimAsync(int couponId, Guid userId);
        Task<ValidateCouponsResultDto> ValidateAsync(Guid? userId, ValidateCouponsDto dto, bool requireUserCoupon);
        Task<List<OrderCouponDto>> CommitOrderCouponsAsync(int orderId, ValidateCouponsResultDto validation);
        Task<List<OrderCouponDto>> GetOrderCouponsAsync(int orderId);
        Task<VoucherSpinResultDto> SpinAsync(Guid userId);
        Task<CouponStatsDto> GetStatsAsync();
        Task<List<CouponCampaignAnalyticsDto>> GetCampaignAnalyticsAsync(CouponAnalyticsSearchDto search);
    }
}
