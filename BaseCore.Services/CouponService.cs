using BaseCore.DTO.Coupons;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;

namespace BaseCore.Services
{
    // Service nghiệp vụ coupon: đứng giữa controller và repository để xử lý
    // rule khuyến mãi, validate điều kiện áp dụng và ghi nhận coupon vào đơn hàng.
    public class CouponService : ICouponService
    {
        private static readonly HashSet<string> CouponTypes = new(StringComparer.OrdinalIgnoreCase) { "Product", "Shipping" };
        private static readonly HashSet<string> DiscountTypes = new(StringComparer.OrdinalIgnoreCase) { "Amount", "Percent", "FreeShipping" };
        private static readonly HashSet<string> ScopeTypes = new(StringComparer.OrdinalIgnoreCase) { "All", "Product", "Category", "Brand" };

        private readonly ICouponRepositoryEF _couponRepository;
        private readonly ICouponScopeRepositoryEF _scopeRepository;
        private readonly IUserCouponRepositoryEF _userCouponRepository;
        private readonly IOrderCouponRepositoryEF _orderCouponRepository;
        private readonly IVoucherSpinRepositoryEF _spinRepository;
        private readonly IProductRepositoryEF _productRepository;

        public CouponService(
            ICouponRepositoryEF couponRepository,
            ICouponScopeRepositoryEF scopeRepository,
            IUserCouponRepositoryEF userCouponRepository,
            IOrderCouponRepositoryEF orderCouponRepository,
            IVoucherSpinRepositoryEF spinRepository,
            IProductRepositoryEF productRepository)
        {
            _couponRepository = couponRepository;
            _scopeRepository = scopeRepository;
            _userCouponRepository = userCouponRepository;
            _orderCouponRepository = orderCouponRepository;
            _spinRepository = spinRepository;
            _productRepository = productRepository;
        }

        // Admin dùng hàm này để lấy danh sách coupon có kèm trạng thái "đã claim chưa"
        // cho user hiện tại, giúp FE render đúng nút nhận/áp dụng.
        public async Task<(List<CouponDto> Items, int TotalCount)> GetCouponsAsync(CouponSearchDto search, Guid? userId = null)
        {
            var result = await _couponRepository.SearchAsync(search);
            var claimed = await GetClaimedCouponIds(userId);
            return (result.Items.Select(c => ToDto(c, claimed.Contains(c.Id))).ToList(), result.TotalCount);
        }

        public async Task<CouponDto?> GetCouponAsync(int id, Guid? userId = null)
        {
            var coupon = await _couponRepository.GetDetailAsync(id);
            if (coupon == null) return null;
            var claimed = await GetClaimedCouponIds(userId);
            return ToDto(coupon, claimed.Contains(coupon.Id));
        }

        // Tạo coupon mới: validate rule kinh doanh, chuẩn hóa dữ liệu rồi lưu coupon
        // cùng phạm vi áp dụng (scope) để các bước validate sau này dùng lại.
        public async Task<CouponDto> CreateAsync(CouponCreateDto dto, Guid? userId)
        {
            ValidateCoupon(dto);
            var code = NormalizeCode(dto.Code);
            if (await _couponRepository.GetByCodeAsync(code) != null)
            {
                throw new InvalidOperationException("Mã phiếu giảm giá đã tồn tại.");
            }

            var now = DateTime.UtcNow;
            var coupon = new Coupon
            {
                Code = code,
                Name = dto.Name.Trim(),
                Description = dto.Description?.Trim(),
                Type = NormalizeCouponType(dto.Type),
                DiscountType = NormalizeDiscountType(dto.DiscountType),
                DiscountValue = dto.DiscountValue,
                MaxDiscountAmount = dto.MaxDiscountAmount,
                MinOrderAmount = Math.Max(0, dto.MinOrderAmount),
                StartAt = dto.StartAt,
                EndAt = dto.EndAt,
                TotalQuantity = Math.Max(0, dto.TotalQuantity),
                PerUserLimit = Math.Max(1, dto.PerUserLimit),
                IsActive = dto.IsActive,
                IsPublic = dto.IsPublic,
                IsAutoClaimable = dto.IsAutoClaimable,
                IsStackable = dto.IsStackable,
                IsSpinReward = dto.IsSpinReward,
                SpinWeight = Math.Max(0, dto.SpinWeight),
                AllowedPaymentMethods = NormalizePaymentMethods(dto.AllowedPaymentMethods),
                DailyUsageLimit = Math.Max(0, dto.DailyUsageLimit),
                CreatedAt = now,
                CreatedByUserId = userId
            };

            await _couponRepository.AddAsync(coupon);
            await _scopeRepository.ReplaceScopesAsync(coupon.Id, BuildScopes(coupon.Id, dto.Scopes, now));
            return ToDto((await _couponRepository.GetDetailAsync(coupon.Id))!);
        }

        // Cập nhật coupon theo cùng cấu trúc payload từ màn admin; scope cũ sẽ được thay
        // toàn bộ để backend luôn bám đúng cấu hình mới nhất trên giao diện.
        public async Task<CouponDto?> UpdateAsync(int id, CouponUpdateDto dto)
        {
            ValidateCoupon(dto);
            var coupon = await _couponRepository.GetDetailAsync(id);
            if (coupon == null) return null;
            var code = NormalizeCode(dto.Code);
            var sameCode = await _couponRepository.GetByCodeAsync(code);
            if (sameCode != null && sameCode.Id != id) throw new InvalidOperationException("Mã phiếu giảm giá đã tồn tại.");

            coupon.Code = code;
            coupon.Name = dto.Name.Trim();
            coupon.Description = dto.Description?.Trim();
            coupon.Type = NormalizeCouponType(dto.Type);
            coupon.DiscountType = NormalizeDiscountType(dto.DiscountType);
            coupon.DiscountValue = dto.DiscountValue;
            coupon.MaxDiscountAmount = dto.MaxDiscountAmount;
            coupon.MinOrderAmount = Math.Max(0, dto.MinOrderAmount);
            coupon.StartAt = dto.StartAt;
            coupon.EndAt = dto.EndAt;
            coupon.TotalQuantity = Math.Max(0, dto.TotalQuantity);
            coupon.PerUserLimit = Math.Max(1, dto.PerUserLimit);
            coupon.IsActive = dto.IsActive;
            coupon.IsPublic = dto.IsPublic;
            coupon.IsAutoClaimable = dto.IsAutoClaimable;
            coupon.IsStackable = dto.IsStackable;
            coupon.IsSpinReward = dto.IsSpinReward;
            coupon.SpinWeight = Math.Max(0, dto.SpinWeight);
            coupon.AllowedPaymentMethods = NormalizePaymentMethods(dto.AllowedPaymentMethods);
            coupon.DailyUsageLimit = Math.Max(0, dto.DailyUsageLimit);
            coupon.UpdatedAt = DateTime.UtcNow;

            await _couponRepository.UpdateAsync(coupon);
            await _scopeRepository.ReplaceScopesAsync(coupon.Id, BuildScopes(coupon.Id, dto.Scopes, DateTime.UtcNow));
            return ToDto((await _couponRepository.GetDetailAsync(coupon.Id))!);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var coupon = await _couponRepository.GetDetailAsync(id);
            if (coupon == null) return false;
            if (coupon.UsedQuantity > 0 || coupon.ClaimedQuantity > 0)
            {
                coupon.IsActive = false;
                coupon.UpdatedAt = DateTime.UtcNow;
                await _couponRepository.UpdateAsync(coupon);
                return true;
            }

            await _couponRepository.DeleteAsync(coupon);
            return true;
        }

        public async Task<CouponDto?> ToggleAsync(int id)
        {
            var coupon = await _couponRepository.GetDetailAsync(id);
            if (coupon == null) return null;
            coupon.IsActive = !coupon.IsActive;
            coupon.UpdatedAt = DateTime.UtcNow;
            await _couponRepository.UpdateAsync(coupon);
            return ToDto(coupon);
        }

        public async Task<List<UserCouponDto>> GetCouponUsersAsync(int couponId)
        {
            var items = await _userCouponRepository.GetByCouponAsync(couponId);
            return items.Select(ToUserCouponDto).ToList();
        }

        public async Task<(List<CouponDto> Items, int TotalCount)> GetPublicAsync(CouponSearchDto search, Guid? userId)
        {
            search.IsPublic = true;
            var result = await GetCouponsAsync(search, userId);
            return (result.Items.Where(c => c.IsPublic).ToList(), result.TotalCount);
        }

        public async Task<(List<UserCouponDto> Items, int TotalCount)> GetMyAsync(Guid userId, UserCouponSearchDto search)
        {
            var result = await _userCouponRepository.GetByUserAsync(userId, search);
            return (result.Items.Select(ToUserCouponDto).ToList(), result.TotalCount);
        }

        // Người dùng "nhận" coupon công khai vào ví. Tại đây service kiểm tra quota toàn cục,
        // quota theo user rồi mới tạo UserCoupon và tăng bộ đếm đã claim.
        public async Task<UserCouponDto> ClaimAsync(int couponId, Guid userId)
        {
            var coupon = await _couponRepository.GetDetailAsync(couponId)
                ?? throw new InvalidOperationException("Phieu giam gia khong ton tai.");
            ValidateClaimable(coupon);
            var count = await _userCouponRepository.CountClaimedAsync(userId, couponId);
            if (count >= Math.Max(1, coupon.PerUserLimit)) throw new InvalidOperationException("Ban da nhan phieu nay.");

            var now = DateTime.UtcNow;
            var userCoupon = new UserCoupon
            {
                UserId = userId,
                CouponId = coupon.Id,
                ClaimedAt = now,
                Status = "Claimed",
                ExpiredAt = coupon.EndAt,
                CreatedAt = now
            };
            await _userCouponRepository.AddAsync(userCoupon);
            coupon.ClaimedQuantity += 1;
            coupon.UpdatedAt = now;
            await _couponRepository.UpdateAsync(coupon);
            return ToUserCouponDto((await _userCouponRepository.GetDetailAsync(userCoupon.Id))!);
        }

        // Đây là bước checkout quan trọng nhất của luồng coupon:
        // dựng giỏ hàng từ product/variant thật, tính subtotal/shipping rồi validate
        // lần lượt coupon sản phẩm và coupon vận chuyển trước khi tạo đơn.
        public async Task<ValidateCouponsResultDto> ValidateAsync(Guid? userId, ValidateCouponsDto dto, bool requireUserCoupon)
        {
            if (dto.CartItems == null || dto.CartItems.Count == 0) throw new InvalidOperationException("Giỏ hàng không có sản phẩm.");
            if (requireUserCoupon && (dto.ProductUserCouponId.HasValue || dto.ShippingUserCouponId.HasValue) && !userId.HasValue)
            {
                throw new InvalidOperationException("Bạn cần đăng nhập để sử dụng phiếu giảm giá.");
            }

            var items = new List<CartItem>();
            foreach (var item in dto.CartItems)
            {
                if (item.ProductId <= 0 || item.Quantity <= 0) throw new InvalidOperationException("Sản phẩm trong giỏ hàng không hợp lệ.");
                var product = await _productRepository.GetByIdAsync(item.ProductId)
                    ?? throw new InvalidOperationException("Sản phẩm không tồn tại.");
                var variant = item.VariantId.HasValue ? product.Variants.FirstOrDefault(v => v.Id == item.VariantId.Value && v.ProductId == product.Id) : null;
                if (item.VariantId.HasValue && variant == null) throw new InvalidOperationException("Phiên bản sản phẩm không tồn tại.");
                var unitPrice = variant?.Price ?? product.BasePrice ?? product.MinPrice ?? 0;
                items.Add(new CartItem(product, variant, item.Quantity, unitPrice));
            }

            var subtotal = items.Sum(x => x.UnitPrice * x.Quantity);
            var shippingMethod = NormalizeShippingMethod(dto.ShippingMethod);
            var shippingFee = shippingMethod == "StorePickup" ? 0 : Math.Max(0, dto.ShippingFee ?? 30000m);
            var paymentMethod = NormalizePaymentMethodKey(dto.PaymentMethod);
            var result = new ValidateCouponsResultDto
            {
                IsValid = true,
                Subtotal = subtotal,
                ShippingFee = shippingFee
            };

            var productResult = await ValidateOneAsync(userId, dto.ProductUserCouponId, dto.ProductCouponId, "Product", requireUserCoupon, items, subtotal, shippingMethod, shippingFee, paymentMethod);
            var shippingResult = await ValidateOneAsync(userId, dto.ShippingUserCouponId, dto.ShippingCouponId, "Shipping", requireUserCoupon, items, subtotal, shippingMethod, shippingFee, paymentMethod);
            result.ProductCouponResult = productResult;
            result.ShippingCouponResult = shippingResult;

            foreach (var couponResult in new[] { productResult, shippingResult }.Where(x => x != null))
            {
                if (couponResult!.IsValid)
                {
                    if (couponResult.Type == "Product") result.ProductDiscount += couponResult.DiscountAmount;
                    if (couponResult.Type == "Shipping") result.ShippingDiscount += couponResult.DiscountAmount;
                }
                else
                {
                    result.IsValid = false;
                    if (!string.IsNullOrWhiteSpace(couponResult.Message)) result.Messages.Add(couponResult.Message);
                }
            }

            result.ProductDiscount = Math.Min(result.ProductDiscount, subtotal);
            result.ShippingDiscount = Math.Min(result.ShippingDiscount, shippingFee);
            result.TotalAmount = Math.Max(0, subtotal - result.ProductDiscount + shippingFee - result.ShippingDiscount);
            return result;
        }

        // Sau khi order được tạo thành công, service "commit" coupon vào đơn:
        // đánh dấu user coupon đã dùng, tăng used quantity và tạo snapshot OrderCoupon
        // để lịch sử đơn không bị ảnh hưởng nếu coupon gốc thay đổi sau này.
        public async Task<List<OrderCouponDto>> CommitOrderCouponsAsync(int orderId, ValidateCouponsResultDto validation)
        {
            var created = new List<OrderCouponDto>();
            foreach (var item in new[] { validation.ProductCouponResult, validation.ShippingCouponResult }.Where(x => x?.IsValid == true && x.DiscountAmount > 0))
            {
                var coupon = await _couponRepository.GetDetailAsync(item!.CouponId!.Value)
                    ?? throw new InvalidOperationException("Phiếu giảm giá không tồn tại.");
                UserCoupon? userCoupon = null;
                if (item.UserCouponId.HasValue)
                {
                    userCoupon = await _userCouponRepository.GetDetailAsync(item.UserCouponId.Value)
                        ?? throw new InvalidOperationException("Phiếu trong ví không tồn tại.");
                    userCoupon.Status = "Used";
                    userCoupon.UsedAt = DateTime.UtcNow;
                    userCoupon.UpdatedAt = DateTime.UtcNow;
                    await _userCouponRepository.UpdateAsync(userCoupon);
                }

                coupon.UsedQuantity += 1;
                coupon.UpdatedAt = DateTime.UtcNow;
                await _couponRepository.UpdateAsync(coupon);

                var orderCoupon = new OrderCoupon
                {
                    OrderId = orderId,
                    CouponId = coupon.Id,
                    UserCouponId = userCoupon?.Id,
                    CouponCode = coupon.Code,
                    CouponName = coupon.Name,
                    CouponType = coupon.Type,
                    DiscountType = coupon.DiscountType,
                    DiscountValue = coupon.DiscountValue,
                    DiscountAmount = item.DiscountAmount,
                    CreatedAt = DateTime.UtcNow
                };
                await _orderCouponRepository.AddAsync(orderCoupon);
                created.Add(ToOrderCouponDto(orderCoupon));
            }
            return created;
        }

        public async Task<List<OrderCouponDto>> GetOrderCouponsAsync(int orderId)
        {
            var items = await _orderCouponRepository.GetByOrderAsync(orderId);
            return items.Select(ToOrderCouponDto).ToList();
        }

        // Vòng quay voucher ngày: kiểm tra user đã quay hôm nay chưa, chọn thưởng theo
        // trọng số và nếu trúng coupon thì tái sử dụng luôn flow ClaimAsync ở trên.
        public async Task<VoucherSpinResultDto> SpinAsync(Guid userId)
        {
            var now = DateTime.UtcNow;
            var today = now.Date;
            var existing = await _spinRepository.GetTodayAsync(userId, today);
            if (existing != null)
            {
                return new VoucherSpinResultDto
                {
                    ResultType = existing.ResultType,
                    Message = "Bạn đã quay mã hôm nay.",
                    NextSpinAt = today.AddDays(1)
                };
            }

            var allCoupons = (await _couponRepository.GetAllAsync()).ToList();
            var spinCoupons = allCoupons
                .Where(c => c.IsSpinReward && c.SpinWeight > 0 && GetStatus(c, now) == "Active" && c.IsPublic && c.IsAutoClaimable)
                .Select(c => (Code: c.Code, Weight: c.SpinWeight))
                .ToList();
            var rewards = spinCoupons.Count > 0
                ? spinCoupons.Concat(new[] { (Code: "NO_REWARD", Weight: 15) }).ToList()
                : new List<(string Code, int Weight)>
                {
                    ("FREESHIP", 25), ("SHIP20K", 20), ("WELCOME10", 15), ("SALE50K", 10), ("APPLE7", 10), ("LAPTOP5", 5), ("NO_REWARD", 15)
                };
            var ticket = Random.Shared.Next(1, rewards.Sum(x => x.Weight) + 1);
            var current = 0;
            var selected = "NO_REWARD";
            foreach (var reward in rewards)
            {
                current += reward.Weight;
                if (ticket <= current)
                {
                    selected = reward.Code;
                    break;
                }
            }

            if (selected != "NO_REWARD")
            {
                var coupon = await _couponRepository.GetByCodeAsync(selected);
                if (coupon != null)
                {
                    try
                    {
                        var userCoupon = await ClaimAsync(coupon.Id, userId);
                        await _spinRepository.AddAsync(new VoucherSpin { UserId = userId, SpinDate = today, RewardCouponId = coupon.Id, RewardCode = coupon.Code, ResultType = "Coupon", CreatedAt = now });
                        return new VoucherSpinResultDto { ResultType = "Coupon", Message = "Bạn đã nhận được voucher.", Coupon = userCoupon, NextSpinAt = today.AddDays(1) };
                    }
                    catch
                    {
                    }
                }
            }

            await _spinRepository.AddAsync(new VoucherSpin { UserId = userId, SpinDate = today, ResultType = "NoReward", CreatedAt = now });
            return new VoucherSpinResultDto { ResultType = "NoReward", Message = "Chúc bạn may mắn lần sau.", NextSpinAt = today.AddDays(1) };
        }

        // Dashboard/admin dùng hàm này để lấy số liệu tổng quan coupon từ dữ liệu đã phát sinh.
        public async Task<CouponStatsDto> GetStatsAsync()
        {
            var all = (await _couponRepository.GetAllAsync()).ToList();
            var now = DateTime.UtcNow;
            return new CouponStatsDto
            {
                TotalCoupons = all.Count,
                ActiveCoupons = all.Count(c => GetStatus(c, now) == "Active"),
                ExpiredCoupons = all.Count(c => GetStatus(c, now) == "Expired"),
                TotalClaimed = all.Sum(c => c.ClaimedQuantity),
                TotalUsed = all.Sum(c => c.UsedQuantity),
                TotalDiscountAmount = await _orderCouponRepository.GetTotalDiscountAsync()
            };
        }

        public async Task<List<CouponCampaignAnalyticsDto>> GetCampaignAnalyticsAsync(CouponAnalyticsSearchDto search)
        {
            var top = Math.Clamp(search.Top, 1, 200);
            var aggregates = await _orderCouponRepository.GetCampaignAggregatesAsync(search.FromDate, search.ToDate, top, search.SortBy);
            if (aggregates.Count == 0) return new List<CouponCampaignAnalyticsDto>();

            var couponIds = aggregates.Select(x => x.CouponId).ToHashSet();
            var coupons = (await _couponRepository.GetAllAsync()).Where(c => couponIds.Contains(c.Id)).ToList();
            var byId = coupons.ToDictionary(x => x.Id);

            var result = new List<CouponCampaignAnalyticsDto>();
            foreach (var row in aggregates)
            {
                if (!byId.TryGetValue(row.CouponId, out var coupon)) continue;
                var ordersCount = Math.Max(0, row.OrdersCount);
                var totalDiscount = Math.Max(0, row.TotalDiscountAmount);
                var redemptionRate = coupon.ClaimedQuantity > 0 ? (decimal)coupon.UsedQuantity / coupon.ClaimedQuantity : 0m;

                result.Add(new CouponCampaignAnalyticsDto
                {
                    CouponId = coupon.Id,
                    Code = coupon.Code,
                    Name = coupon.Name,
                    Type = coupon.Type,
                    ClaimedQuantity = coupon.ClaimedQuantity,
                    UsedQuantity = coupon.UsedQuantity,
                    OrdersCount = ordersCount,
                    TotalDiscountAmount = totalDiscount,
                    AvgDiscountPerOrder = ordersCount > 0 ? totalDiscount / ordersCount : 0m,
                    RedemptionRate = Math.Clamp(redemptionRate, 0m, 1m),
                    LastUsedAt = row.LastUsedAt
                });
            }

            return result;
        }

        // Validate cho từng coupon cụ thể. Hàm này gom toàn bộ rule áp dụng:
        // loại coupon, thời gian hiệu lực, min order, payment method, daily limit
        // và phạm vi sản phẩm đủ điều kiện để trả về kết quả dùng được cho checkout.
        private async Task<ApplyCouponResultDto?> ValidateOneAsync(Guid? userId, int? userCouponId, int? couponId, string expectedType, bool requireUserCoupon, List<CartItem> items, decimal subtotal, string shippingMethod, decimal shippingFee, string paymentMethod)
        {
            if (!userCouponId.HasValue && !couponId.HasValue) return null;
            Coupon coupon;
            UserCoupon? userCoupon = null;
            if (userCouponId.HasValue)
            {
                userCoupon = await _userCouponRepository.GetDetailAsync(userCouponId.Value);
                if (userCoupon == null) return InvalidResult(expectedType, "Bạn chưa nhận phiếu này.");
                if (requireUserCoupon && !userId.HasValue) return InvalidResult(expectedType, "Bạn cần đăng nhập để sử dụng phiếu tham gia.");
                if (userId.HasValue && userCoupon.UserId != userId.Value) return InvalidResult(expectedType, "Bạn chưa nhận phiếu này.");
                coupon = userCoupon.Coupon;
            }
            else
            {
                if (requireUserCoupon) return InvalidResult(expectedType, "Bạn chưa nhận phiếu này.");
                coupon = await _couponRepository.GetDetailAsync(couponId!.Value) ?? null!;
                if (coupon == null) return InvalidResult(expectedType, "Phiếu tham gia không tồn tại.");
            }

            var result = new ApplyCouponResultDto
            {
                CouponId = coupon.Id,
                UserCouponId = userCoupon?.Id,
                Code = coupon.Code,
                Name = coupon.Name,
                Type = coupon.Type,
                DiscountType = coupon.DiscountType,
                DiscountValue = coupon.DiscountValue,
                IsValid = false
            };

            if (!string.Equals(coupon.Type, expectedType, StringComparison.OrdinalIgnoreCase))
            {
                result.Message = expectedType == "Product" ? "Phiếu sản phẩm không hợp lệ." : "Phiếu vận chuyển không hợp lệ.";
                return result;
            }
            if (userCoupon != null && userCoupon.Status != "Claimed")
                {
                result.Message = "Phiếu tham gia đã được sử dụng.";
                return result;
            }
            if (userCoupon != null && userCoupon.ExpiredAt.HasValue && userCoupon.ExpiredAt.Value < DateTime.UtcNow)
            {
                result.Message = "Phiếu giảm giá đã hết hạn sử dụng.";
                return result;
            }

            var status = GetStatus(coupon, DateTime.UtcNow);
            if (status == "Expired") result.Message = "Phiếu giảm giá đã hết hạn sử dụng.";
            else if (status == "Upcoming") result.Message = "Phiếu giảm giá chưa bắt đầu."; 
            else if (status == "OutOfStock") result.Message = "Phiếu giảm giá đã hết lần sử dụng.";
            else if (status == "Disabled") result.Message = "Phiếu giảm giá không hoạt động.";
            if (result.Message != null) return result;

            if (subtotal < coupon.MinOrderAmount)
            {
                result.Message = "Đơn hàng chưa đạt giá trị tối thiểu.";
                return result;
            }

            if (!IsPaymentMethodAllowed(coupon.AllowedPaymentMethods, paymentMethod))
            {
                result.Message = "Phiếu giảm giá không áp dụng cho phương thức thanh toán này.";
                return result;
            }

            if (coupon.DailyUsageLimit > 0)
            {
                var start = DateTime.UtcNow.Date;
                var end = start.AddDays(1).AddTicks(-1);
                var usedToday = await _orderCouponRepository.CountUsedAsync(coupon.Id, start, end);
                if (usedToday >= coupon.DailyUsageLimit)
                {
                    result.Message = "Phiếu giảm giá đã hết lượt sử dụng trong hôm nay.";
                    return result;
                }
            }

            if (expectedType == "Shipping")
            {
                if (shippingMethod == "StorePickup")
                {
                    result.Message = "Phiếu vận chuyển không áp dụng khi nhận tại cửa hàng.";
                    return result;
                }
                result.DiscountAmount = CalculateDiscount(coupon, shippingFee);
                result.IsValid = result.DiscountAmount > 0;
                result.Message = result.IsValid ? "Áp dụng thành công." : "Phiếu vận chuyển không hợp lệ.";
                return result;
            }

            var eligibleAmount = CalculateEligibleAmount(coupon, items);
            if (eligibleAmount <= 0)
            {
                result.Message = "Phiếu này không áp dụng cho sản phẩm trong giỏ hàng.";
                return result;
            }

            result.DiscountAmount = CalculateDiscount(coupon, eligibleAmount);
            result.IsValid = result.DiscountAmount > 0;
            result.Message = result.IsValid ? "Áp dụng thành công." : "Phiếu giảm giá không hợp lệ.";
            return result;
        }

        private static ApplyCouponResultDto InvalidResult(string type, string message)
        {
            return new ApplyCouponResultDto { Type = type, IsValid = false, Message = message };
        }

        private static decimal CalculateEligibleAmount(Coupon coupon, List<CartItem> items)
        {
            var scopes = coupon.Scopes == null || coupon.Scopes.Count == 0 ? new List<CouponScope> { new() { ScopeType = "All" } } : coupon.Scopes;
            return items.Where(item => scopes.Any(scope => ScopeMatches(scope, item.Product))).Sum(item => item.UnitPrice * item.Quantity);
        }

        private static bool ScopeMatches(CouponScope scope, Product product)
        {
            return NormalizeScopeType(scope.ScopeType) switch
            {
                "All" => true,
                "Product" => scope.ProductId == product.Id,
                "Category" => scope.CategoryId == product.CategoryId,
                "Brand" => !string.IsNullOrWhiteSpace(scope.Brand) && string.Equals(scope.Brand.Trim(), product.Brand?.Trim(), StringComparison.OrdinalIgnoreCase),
                _ => false
            };
        }

        private static decimal CalculateDiscount(Coupon coupon, decimal amount)
        {
            if (amount <= 0) return 0;
            var discount = coupon.DiscountType switch
            {
                "FreeShipping" => amount,
                "Percent" => amount * coupon.DiscountValue / 100m,
                _ => coupon.DiscountValue
            };
            if (coupon.DiscountType == "Percent" && coupon.MaxDiscountAmount.HasValue)
            {
                discount = Math.Min(discount, coupon.MaxDiscountAmount.Value);
            }
            return Math.Max(0, Math.Min(discount, amount));
        }

        private static void ValidateClaimable(Coupon coupon)
        {
            if (!coupon.IsAutoClaimable) throw new InvalidOperationException("Phiếu giảm giá không thể nhận tự.");
            var status = GetStatus(coupon, DateTime.UtcNow);
            if (status == "Upcoming") throw new InvalidOperationException("Phiếu giảm giá chưa bắt đầu.");
            if (status == "Expired") throw new InvalidOperationException("Phiếu giảm giá đã hết hạn sử dụng."); 
            if (status == "OutOfStock") throw new InvalidOperationException("Phiếu giảm giá đã hết lần sử dụng.");
            if (status == "Disabled") throw new InvalidOperationException("Phiếu giảm giá không hoạt động.");
        }

        private static void ValidateCoupon(CouponCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Code)) throw new InvalidOperationException("Mã phiếu giảm giá là bắt buộc.");
            if (string.IsNullOrWhiteSpace(dto.Name)) throw new InvalidOperationException("Tên phiếu giảm giá là bắt buộc.");
            NormalizeCouponType(dto.Type);
            NormalizeDiscountType(dto.DiscountType);
            if (dto.EndAt <= dto.StartAt) throw new InvalidOperationException("Thời gian kết thúc phải sau thời gian bắt đầu.");
            if (dto.DiscountValue <= 0 && dto.DiscountType != "FreeShipping") throw new InvalidOperationException("Giá trị giảm giá không hợp lệ.");
            if (dto.DiscountType == "Percent" && dto.DiscountValue > 100) throw new InvalidOperationException("Phần trăm giảm giá không được vượt quá 100.");
            if (dto.DailyUsageLimit < 0) throw new InvalidOperationException("Giới hạn dùng theo ngày không hợp lệ.");
            NormalizePaymentMethods(dto.AllowedPaymentMethods);
            foreach (var scope in dto.Scopes) NormalizeScopeType(scope.ScopeType);
        }

        private static string NormalizePaymentMethodKey(string? value)
        {
            var key = (value ?? "").Trim();
            if (string.IsNullOrWhiteSpace(key)) return "";
            var normalized = key.Trim().ToLowerInvariant();
            return normalized switch
            {
                "storepayment" or "store" => "StorePayment",
                "banktransfer" or "bank" => "BankTransfer",
                "momo" => "Momo",
                "shopeepay" => "ShopeePay",
                "applepay" => "ApplePay",
                _ => key.Trim()
            };
        }

        private static string? NormalizePaymentMethods(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return null;
            var items = value
                .Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(x => NormalizePaymentMethodKey(x))
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();
            return items.Count == 0 ? null : string.Join(",", items);
        }

        private static bool IsPaymentMethodAllowed(string? allowedPaymentMethods, string paymentMethod)
        {
            if (string.IsNullOrWhiteSpace(allowedPaymentMethods)) return true;
            var selected = NormalizePaymentMethodKey(paymentMethod);
            if (string.IsNullOrWhiteSpace(selected)) return true;
            var allowed = allowedPaymentMethods
                .Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(x => NormalizePaymentMethodKey(x))
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .ToHashSet(StringComparer.OrdinalIgnoreCase);
            return allowed.Contains(selected);
        }

        private async Task<HashSet<int>> GetClaimedCouponIds(Guid? userId)
        {
            if (!userId.HasValue) return new HashSet<int>();
            var result = await _userCouponRepository.GetByUserAsync(userId.Value, new UserCouponSearchDto { PageSize = 100 });
            return result.Items.Where(x => x.Status != "Removed").Select(x => x.CouponId).ToHashSet();
        }

        // Chuẩn hóa scope từ form admin sang entity. Nếu admin không chọn gì thì mặc định
        // coupon áp dụng cho toàn bộ catalog ("All").
        private static IEnumerable<CouponScope> BuildScopes(int couponId, IEnumerable<CouponScopeDto> scopes, DateTime now)
        {
            var normalized = scopes.Where(s => !string.IsNullOrWhiteSpace(s.ScopeType)).Select(s => new CouponScope
            {
                CouponId = couponId,
                ScopeType = NormalizeScopeType(s.ScopeType),
                ProductId = s.ProductId,
                CategoryId = s.CategoryId,
                Brand = s.Brand?.Trim(),
                CreatedAt = now
            }).ToList();
            return normalized.Count == 0 ? new[] { new CouponScope { CouponId = couponId, ScopeType = "All", CreatedAt = now } } : normalized;
        }

        // Map entity sang DTO hiển thị cho FE, đồng thời tính trạng thái runtime
        // như Active/Expired/OutOfStock và các cờ CanClaim/CanUse.
        private static CouponDto ToDto(Coupon coupon, bool isClaimed = false)
        {
            var now = DateTime.UtcNow;
            var status = GetStatus(coupon, now);
            var canClaim = status == "Active" && coupon.IsPublic && coupon.IsAutoClaimable;
            return new CouponDto
            {
                Id = coupon.Id,
                Code = coupon.Code,
                Name = coupon.Name,
                Description = coupon.Description,
                Type = coupon.Type,
                DiscountType = coupon.DiscountType,
                DiscountValue = coupon.DiscountValue,
                MaxDiscountAmount = coupon.MaxDiscountAmount,
                MinOrderAmount = coupon.MinOrderAmount,
                StartAt = coupon.StartAt,
                EndAt = coupon.EndAt,
                TotalQuantity = coupon.TotalQuantity,
                UsedQuantity = coupon.UsedQuantity,
                ClaimedQuantity = coupon.ClaimedQuantity,
                PerUserLimit = coupon.PerUserLimit,
                IsActive = coupon.IsActive,
                IsPublic = coupon.IsPublic,
                IsAutoClaimable = coupon.IsAutoClaimable,
                IsStackable = coupon.IsStackable,
                IsSpinReward = coupon.IsSpinReward,
                SpinWeight = coupon.SpinWeight,
                AllowedPaymentMethods = coupon.AllowedPaymentMethods,
                DailyUsageLimit = coupon.DailyUsageLimit,
                Status = status,
                IsClaimed = isClaimed,
                CanClaim = canClaim && !isClaimed,
                CanUse = status == "Active",
                Reason = status == "Active" ? null : StatusReason(status),
                CreatedAt = coupon.CreatedAt,
                UpdatedAt = coupon.UpdatedAt,
                Scopes = coupon.Scopes?.Select(ToScopeDto).ToList() ?? new()
            };
        }

        private static UserCouponDto ToUserCouponDto(UserCoupon item)
        {
            var expired = item.ExpiredAt.HasValue && item.ExpiredAt.Value < DateTime.UtcNow;
            return new UserCouponDto
            {
                Id = item.Id,
                UserId = item.UserId,
                CouponId = item.CouponId,
                Status = item.Status,
                ClaimedAt = item.ClaimedAt,
                UsedAt = item.UsedAt,
                ExpiredAt = item.ExpiredAt,
                IsExpired = expired,
                CanUse = item.Status == "Claimed" && !expired && GetStatus(item.Coupon, DateTime.UtcNow) == "Active",
                Reason = expired ? "Phiếu giảm giá đã hết hạn sử dụng." : null,
                Coupon = ToDto(item.Coupon, true)
            };
        }

        private static CouponScopeDto ToScopeDto(CouponScope scope)
        {
            return new CouponScopeDto
            {
                Id = scope.Id,
                CouponId = scope.CouponId,
                ScopeType = scope.ScopeType,
                ProductId = scope.ProductId,
                CategoryId = scope.CategoryId,
                Brand = scope.Brand
            };
        }

        private static OrderCouponDto ToOrderCouponDto(OrderCoupon item)
        {
            return new OrderCouponDto
            {
                Id = item.Id,
                OrderId = item.OrderId,
                CouponId = item.CouponId,
                UserCouponId = item.UserCouponId,
                CouponCode = item.CouponCode,
                CouponName = item.CouponName,
                CouponType = item.CouponType,
                DiscountType = item.DiscountType,
                DiscountValue = item.DiscountValue,
                DiscountAmount = item.DiscountAmount,
                CreatedAt = item.CreatedAt
            };
        }

        // Trạng thái coupon không lưu cứng hoàn toàn trong DB mà được suy ra từ
        // cờ active, thời gian hiệu lực và quota còn lại.
        private static string GetStatus(Coupon coupon, DateTime now)
        {
            if (!coupon.IsActive) return "Disabled";
            if (now < coupon.StartAt) return "Upcoming";
            if (now > coupon.EndAt) return "Expired";
            if (coupon.TotalQuantity > 0 && coupon.ClaimedQuantity >= coupon.TotalQuantity) return "OutOfStock";
            return "Active";
        }

        private static string StatusReason(string status)
        {
            return status switch
            {
                "Disabled" => "Phiếu giảm giá không hoạt động.",
                "Upcoming" => "Phiếu giảm giá chưa bắt đầu.",
                "Expired" => "Phiếu giảm giá đã hết hạn sử dụng.",
                "OutOfStock" => "Phiếu giảm giá đã hết lượt sử dụng.",
                _ => null
            } ?? "";
        }

        private static string NormalizeCode(string code) => code.Trim().ToUpperInvariant();

        private static string NormalizeCouponType(string value)
        {
            var raw = string.IsNullOrWhiteSpace(value) ? "Product" : value.Trim();
            if (!CouponTypes.Contains(raw)) throw new InvalidOperationException("Loại phiếu giảm giá không hợp lệ.");
            return CouponTypes.First(x => string.Equals(x, raw, StringComparison.OrdinalIgnoreCase));
        }

        private static string NormalizeDiscountType(string value)
        {
            var raw = string.IsNullOrWhiteSpace(value) ? "Amount" : value.Trim();
            if (!DiscountTypes.Contains(raw)) throw new InvalidOperationException("Kiểu giảm giá không hợp lệ.");
            return DiscountTypes.First(x => string.Equals(x, raw, StringComparison.OrdinalIgnoreCase));
        }

        private static string NormalizeScopeType(string value)
        {
            var raw = string.IsNullOrWhiteSpace(value) ? "All" : value.Trim();
            if (!ScopeTypes.Contains(raw)) throw new InvalidOperationException("Phạm vi phiếu giảm giá không hợp lệ.");
            return ScopeTypes.First(x => string.Equals(x, raw, StringComparison.OrdinalIgnoreCase));
        }

        private static string NormalizeShippingMethod(string? value)
        {
            var raw = string.IsNullOrWhiteSpace(value) ? "Delivery" : value.Trim();
            return raw.ToLower() switch
            {
                "storepickup" or "store_pickup" or "pickup" => "StorePickup",
                _ => "Delivery"
            };
        }

        private sealed record CartItem(Product Product, ProductVariant? Variant, int Quantity, decimal UnitPrice);
    }
}
