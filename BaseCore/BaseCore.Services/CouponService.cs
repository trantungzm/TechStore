using BaseCore.DTO.Coupons;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;

namespace BaseCore.Services
{
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

        public async Task<CouponDto> CreateAsync(CouponCreateDto dto, Guid? userId)
        {
            ValidateCoupon(dto);
            var code = NormalizeCode(dto.Code);
            if (await _couponRepository.GetByCodeAsync(code) != null)
            {
                throw new InvalidOperationException("Ma phieu giam gia da ton tai.");
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
                CreatedAt = now,
                CreatedByUserId = userId
            };

            await _couponRepository.AddAsync(coupon);
            await _scopeRepository.ReplaceScopesAsync(coupon.Id, BuildScopes(coupon.Id, dto.Scopes, now));
            return ToDto((await _couponRepository.GetDetailAsync(coupon.Id))!);
        }

        public async Task<CouponDto?> UpdateAsync(int id, CouponUpdateDto dto)
        {
            ValidateCoupon(dto);
            var coupon = await _couponRepository.GetDetailAsync(id);
            if (coupon == null) return null;
            var code = NormalizeCode(dto.Code);
            var sameCode = await _couponRepository.GetByCodeAsync(code);
            if (sameCode != null && sameCode.Id != id) throw new InvalidOperationException("Ma phieu giam gia da ton tai.");

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

        public async Task<ValidateCouponsResultDto> ValidateAsync(Guid? userId, ValidateCouponsDto dto, bool requireUserCoupon)
        {
            if (dto.CartItems == null || dto.CartItems.Count == 0) throw new InvalidOperationException("Gio hang khong co san pham.");
            if (requireUserCoupon && (dto.ProductUserCouponId.HasValue || dto.ShippingUserCouponId.HasValue) && !userId.HasValue)
            {
                throw new InvalidOperationException("Ban can dang nhap de su dung phieu giam gia.");
            }

            var items = new List<CartItem>();
            foreach (var item in dto.CartItems)
            {
                if (item.ProductId <= 0 || item.Quantity <= 0) throw new InvalidOperationException("San pham trong gio hang khong hop le.");
                var product = await _productRepository.GetByIdAsync(item.ProductId)
                    ?? throw new InvalidOperationException("San pham khong ton tai.");
                var variant = item.VariantId.HasValue ? product.Variants.FirstOrDefault(v => v.Id == item.VariantId.Value && v.ProductId == product.Id) : null;
                if (item.VariantId.HasValue && variant == null) throw new InvalidOperationException("Phien ban san pham khong ton tai.");
                var unitPrice = variant?.Price ?? product.Price;
                items.Add(new CartItem(product, variant, item.Quantity, unitPrice));
            }

            var subtotal = items.Sum(x => x.UnitPrice * x.Quantity);
            var shippingMethod = NormalizeShippingMethod(dto.ShippingMethod);
            var shippingFee = shippingMethod == "StorePickup" ? 0 : Math.Max(0, dto.ShippingFee ?? 30000m);
            var result = new ValidateCouponsResultDto
            {
                IsValid = true,
                Subtotal = subtotal,
                ShippingFee = shippingFee
            };

            var productResult = await ValidateOneAsync(userId, dto.ProductUserCouponId, dto.ProductCouponId, "Product", requireUserCoupon, items, subtotal, shippingMethod, shippingFee);
            var shippingResult = await ValidateOneAsync(userId, dto.ShippingUserCouponId, dto.ShippingCouponId, "Shipping", requireUserCoupon, items, subtotal, shippingMethod, shippingFee);
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

        public async Task<List<OrderCouponDto>> CommitOrderCouponsAsync(int orderId, ValidateCouponsResultDto validation)
        {
            var created = new List<OrderCouponDto>();
            foreach (var item in new[] { validation.ProductCouponResult, validation.ShippingCouponResult }.Where(x => x?.IsValid == true && x.DiscountAmount > 0))
            {
                var coupon = await _couponRepository.GetDetailAsync(item!.CouponId!.Value)
                    ?? throw new InvalidOperationException("Phieu giam gia khong ton tai.");
                UserCoupon? userCoupon = null;
                if (item.UserCouponId.HasValue)
                {
                    userCoupon = await _userCouponRepository.GetDetailAsync(item.UserCouponId.Value)
                        ?? throw new InvalidOperationException("Phieu trong vi khong ton tai.");
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
                    Message = "Ban da quay voucher hom nay.",
                    NextSpinAt = today.AddDays(1)
                };
            }

            var rewards = new List<(string Code, int Weight)>
            {
                ("FREESHIP", 25), ("SHIP20K", 20), ("GIAM10", 15), ("SALE50K", 10), ("PHUKIEN20", 10), ("LAPTOP5", 5), ("NO_REWARD", 15)
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
                        return new VoucherSpinResultDto { ResultType = "Coupon", Message = "Ban da nhan duoc voucher.", Coupon = userCoupon, NextSpinAt = today.AddDays(1) };
                    }
                    catch
                    {
                    }
                }
            }

            await _spinRepository.AddAsync(new VoucherSpin { UserId = userId, SpinDate = today, ResultType = "NoReward", CreatedAt = now });
            return new VoucherSpinResultDto { ResultType = "NoReward", Message = "Chuc ban may man lan sau.", NextSpinAt = today.AddDays(1) };
        }

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

        private async Task<ApplyCouponResultDto?> ValidateOneAsync(Guid? userId, int? userCouponId, int? couponId, string expectedType, bool requireUserCoupon, List<CartItem> items, decimal subtotal, string shippingMethod, decimal shippingFee)
        {
            if (!userCouponId.HasValue && !couponId.HasValue) return null;
            Coupon coupon;
            UserCoupon? userCoupon = null;
            if (userCouponId.HasValue)
            {
                userCoupon = await _userCouponRepository.GetDetailAsync(userCouponId.Value);
                if (userCoupon == null) return InvalidResult(expectedType, "Ban chua nhan phieu nay.");
                if (requireUserCoupon && !userId.HasValue) return InvalidResult(expectedType, "Ban can dang nhap de su dung phieu giam gia.");
                if (userId.HasValue && userCoupon.UserId != userId.Value) return InvalidResult(expectedType, "Ban chua nhan phieu nay.");
                coupon = userCoupon.Coupon;
            }
            else
            {
                if (requireUserCoupon) return InvalidResult(expectedType, "Ban chua nhan phieu nay.");
                coupon = await _couponRepository.GetDetailAsync(couponId!.Value) ?? null!;
                if (coupon == null) return InvalidResult(expectedType, "Phieu giam gia khong ton tai.");
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
                result.Message = expectedType == "Product" ? "Phieu san pham khong hop le." : "Phieu van chuyen khong hop le.";
                return result;
            }
            if (userCoupon != null && userCoupon.Status != "Claimed")
            {
                result.Message = "Phieu giam gia da duoc su dung.";
                return result;
            }
            if (userCoupon != null && userCoupon.ExpiredAt.HasValue && userCoupon.ExpiredAt.Value < DateTime.UtcNow)
            {
                result.Message = "Phieu giam gia da het han.";
                return result;
            }

            var status = GetStatus(coupon, DateTime.UtcNow);
            if (status == "Expired") result.Message = "Phieu giam gia da het han.";
            else if (status == "Upcoming") result.Message = "Phieu giam gia chua bat dau.";
            else if (status == "OutOfStock") result.Message = "Phieu giam gia da het luot su dung.";
            else if (status == "Disabled") result.Message = "Phieu giam gia khong hoat dong.";
            if (result.Message != null) return result;

            if (subtotal < coupon.MinOrderAmount)
            {
                result.Message = "Don hang chua dat gia tri toi thieu.";
                return result;
            }

            if (expectedType == "Shipping")
            {
                if (shippingMethod == "StorePickup")
                {
                    result.Message = "Phieu van chuyen khong ap dung khi nhan tai cua hang.";
                    return result;
                }
                result.DiscountAmount = CalculateDiscount(coupon, shippingFee);
                result.IsValid = result.DiscountAmount > 0;
                result.Message = result.IsValid ? "Ap dung thanh cong." : "Phieu van chuyen khong hop le.";
                return result;
            }

            var eligibleAmount = CalculateEligibleAmount(coupon, items);
            if (eligibleAmount <= 0)
            {
                result.Message = "Phieu nay khong ap dung cho san pham trong gio hang.";
                return result;
            }

            result.DiscountAmount = CalculateDiscount(coupon, eligibleAmount);
            result.IsValid = result.DiscountAmount > 0;
            result.Message = result.IsValid ? "Ap dung thanh cong." : "Phieu giam gia khong hop le.";
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
            if (!coupon.IsAutoClaimable) throw new InvalidOperationException("Phieu giam gia khong the tu nhan.");
            var status = GetStatus(coupon, DateTime.UtcNow);
            if (status == "Upcoming") throw new InvalidOperationException("Phieu giam gia chua bat dau.");
            if (status == "Expired") throw new InvalidOperationException("Phieu giam gia da het han.");
            if (status == "OutOfStock") throw new InvalidOperationException("Phieu giam gia da het luot nhan.");
            if (status == "Disabled") throw new InvalidOperationException("Phieu giam gia khong hoat dong.");
        }

        private static void ValidateCoupon(CouponCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Code)) throw new InvalidOperationException("Ma phieu giam gia la bat buoc.");
            if (string.IsNullOrWhiteSpace(dto.Name)) throw new InvalidOperationException("Ten phieu giam gia la bat buoc.");
            NormalizeCouponType(dto.Type);
            NormalizeDiscountType(dto.DiscountType);
            if (dto.EndAt <= dto.StartAt) throw new InvalidOperationException("Thoi gian ket thuc phai sau thoi gian bat dau.");
            if (dto.DiscountValue <= 0 && dto.DiscountType != "FreeShipping") throw new InvalidOperationException("Gia tri giam gia khong hop le.");
            if (dto.DiscountType == "Percent" && dto.DiscountValue > 100) throw new InvalidOperationException("Phan tram giam gia khong duoc vuot qua 100.");
            foreach (var scope in dto.Scopes) NormalizeScopeType(scope.ScopeType);
        }

        private async Task<HashSet<int>> GetClaimedCouponIds(Guid? userId)
        {
            if (!userId.HasValue) return new HashSet<int>();
            var result = await _userCouponRepository.GetByUserAsync(userId.Value, new UserCouponSearchDto { PageSize = 100 });
            return result.Items.Where(x => x.Status != "Removed").Select(x => x.CouponId).ToHashSet();
        }

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
                Reason = expired ? "Phieu giam gia da het han." : null,
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
                "Disabled" => "Phieu giam gia khong hoat dong.",
                "Upcoming" => "Phieu giam gia chua bat dau.",
                "Expired" => "Phieu giam gia da het han.",
                "OutOfStock" => "Phieu giam gia da het luot su dung.",
                _ => null
            } ?? "";
        }

        private static string NormalizeCode(string code) => code.Trim().ToUpperInvariant();

        private static string NormalizeCouponType(string value)
        {
            var raw = string.IsNullOrWhiteSpace(value) ? "Product" : value.Trim();
            if (!CouponTypes.Contains(raw)) throw new InvalidOperationException("Loai phieu giam gia khong hop le.");
            return CouponTypes.First(x => string.Equals(x, raw, StringComparison.OrdinalIgnoreCase));
        }

        private static string NormalizeDiscountType(string value)
        {
            var raw = string.IsNullOrWhiteSpace(value) ? "Amount" : value.Trim();
            if (!DiscountTypes.Contains(raw)) throw new InvalidOperationException("Kieu giam gia khong hop le.");
            return DiscountTypes.First(x => string.Equals(x, raw, StringComparison.OrdinalIgnoreCase));
        }

        private static string NormalizeScopeType(string value)
        {
            var raw = string.IsNullOrWhiteSpace(value) ? "All" : value.Trim();
            if (!ScopeTypes.Contains(raw)) throw new InvalidOperationException("Pham vi phieu giam gia khong hop le.");
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
