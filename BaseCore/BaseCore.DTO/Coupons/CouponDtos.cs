namespace BaseCore.DTO.Coupons
{
    public class CouponDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = "";
        public string Name { get; set; } = "";
        public string? Description { get; set; }
        public string Type { get; set; } = "Product";
        public string DiscountType { get; set; } = "Amount";
        public decimal DiscountValue { get; set; }
        public decimal? MaxDiscountAmount { get; set; }
        public decimal MinOrderAmount { get; set; }
        public DateTime StartAt { get; set; }
        public DateTime EndAt { get; set; }
        public int TotalQuantity { get; set; }
        public int UsedQuantity { get; set; }
        public int ClaimedQuantity { get; set; }
        public int PerUserLimit { get; set; }
        public bool IsActive { get; set; }
        public bool IsPublic { get; set; }
        public bool IsAutoClaimable { get; set; }
        public bool IsStackable { get; set; }
        public string Status { get; set; } = "Active";
        public bool IsClaimed { get; set; }
        public bool CanClaim { get; set; }
        public bool CanUse { get; set; }
        public string? Reason { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<CouponScopeDto> Scopes { get; set; } = new();
    }

    public class CouponCreateDto
    {
        public string Code { get; set; } = "";
        public string Name { get; set; } = "";
        public string? Description { get; set; }
        public string Type { get; set; } = "Product";
        public string DiscountType { get; set; } = "Amount";
        public decimal DiscountValue { get; set; }
        public decimal? MaxDiscountAmount { get; set; }
        public decimal MinOrderAmount { get; set; }
        public DateTime StartAt { get; set; }
        public DateTime EndAt { get; set; }
        public int TotalQuantity { get; set; }
        public int PerUserLimit { get; set; } = 1;
        public bool IsActive { get; set; } = true;
        public bool IsPublic { get; set; } = true;
        public bool IsAutoClaimable { get; set; } = true;
        public bool IsStackable { get; set; }
        public List<CouponScopeDto> Scopes { get; set; } = new();
    }

    public class CouponUpdateDto : CouponCreateDto
    {
    }

    public class CouponScopeDto
    {
        public int Id { get; set; }
        public int CouponId { get; set; }
        public string ScopeType { get; set; } = "All";
        public int? ProductId { get; set; }
        public int? CategoryId { get; set; }
        public string? Brand { get; set; }
    }

    public class UserCouponDto
    {
        public int Id { get; set; }
        public Guid UserId { get; set; }
        public int CouponId { get; set; }
        public string Status { get; set; } = "Claimed";
        public DateTime ClaimedAt { get; set; }
        public DateTime? UsedAt { get; set; }
        public DateTime? ExpiredAt { get; set; }
        public bool IsExpired { get; set; }
        public bool CanUse { get; set; }
        public string? Reason { get; set; }
        public CouponDto Coupon { get; set; } = new();
    }

    public class ClaimCouponDto
    {
    }

    public class ValidateCouponsDto
    {
        public int? ProductCouponId { get; set; }
        public int? ShippingCouponId { get; set; }
        public int? ProductUserCouponId { get; set; }
        public int? ShippingUserCouponId { get; set; }
        public List<ValidateCouponCartItemDto> CartItems { get; set; } = new();
        public string? ShippingMethod { get; set; }
        public decimal? ShippingFee { get; set; }
    }

    public class ValidateCouponCartItemDto
    {
        public int ProductId { get; set; }
        public int? VariantId { get; set; }
        public int Quantity { get; set; }
        public decimal? UnitPrice { get; set; }
    }

    public class ValidateCouponsResultDto
    {
        public bool IsValid { get; set; }
        public List<string> Messages { get; set; } = new();
        public decimal Subtotal { get; set; }
        public decimal ProductDiscount { get; set; }
        public decimal ShippingFee { get; set; }
        public decimal ShippingDiscount { get; set; }
        public decimal TotalAmount { get; set; }
        public ApplyCouponResultDto? ProductCouponResult { get; set; }
        public ApplyCouponResultDto? ShippingCouponResult { get; set; }
    }

    public class ApplyCouponResultDto
    {
        public int? CouponId { get; set; }
        public int? UserCouponId { get; set; }
        public string? Code { get; set; }
        public string? Name { get; set; }
        public string? Type { get; set; }
        public string? DiscountType { get; set; }
        public decimal DiscountValue { get; set; }
        public bool IsValid { get; set; }
        public decimal DiscountAmount { get; set; }
        public string? Message { get; set; }
    }

    public class OrderCouponDto
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
        public DateTime CreatedAt { get; set; }
    }

    public class VoucherSpinResultDto
    {
        public string ResultType { get; set; } = "NoReward";
        public string Message { get; set; } = "";
        public UserCouponDto? Coupon { get; set; }
        public DateTime NextSpinAt { get; set; }
    }

    public class CouponSearchDto
    {
        public string? Keyword { get; set; }
        public string? Type { get; set; }
        public string? DiscountType { get; set; }
        public string? Status { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsPublic { get; set; }
        public bool? ClaimableOnly { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 50;
        public string? SortBy { get; set; } = "newest";
    }

    public class UserCouponSearchDto
    {
        public string? Type { get; set; }
        public string? Status { get; set; }
        public bool? UsableOnly { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }

    public class CouponStatsDto
    {
        public int TotalCoupons { get; set; }
        public int ActiveCoupons { get; set; }
        public int ExpiredCoupons { get; set; }
        public int TotalClaimed { get; set; }
        public int TotalUsed { get; set; }
        public decimal TotalDiscountAmount { get; set; }
    }
}
