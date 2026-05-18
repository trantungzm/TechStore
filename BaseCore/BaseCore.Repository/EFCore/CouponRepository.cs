using BaseCore.DTO.Coupons;
using BaseCore.Entities;
using Microsoft.EntityFrameworkCore;

namespace BaseCore.Repository.EFCore
{
    public interface ICouponRepositoryEF : IRepository<Coupon>
    {
        Task<Coupon?> GetDetailAsync(int id);
        Task<Coupon?> GetByCodeAsync(string code);
        Task<(List<Coupon> Items, int TotalCount)> SearchAsync(CouponSearchDto search);
    }

    public class CouponRepositoryEF : Repository<Coupon>, ICouponRepositoryEF
    {
        public CouponRepositoryEF(AppDbContext context) : base(context)
        {
        }

        public override async Task<Coupon?> GetByIdAsync(object id)
        {
            return await GetDetailAsync(Convert.ToInt32(id));
        }

        public async Task<Coupon?> GetDetailAsync(int id)
        {
            return await _dbSet
                .Include(c => c.Scopes)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Coupon?> GetByCodeAsync(string code)
        {
            var normalized = code.Trim().ToUpper();
            return await _dbSet
                .Include(c => c.Scopes)
                .FirstOrDefaultAsync(c => c.Code.ToUpper() == normalized);
        }

        public async Task<(List<Coupon> Items, int TotalCount)> SearchAsync(CouponSearchDto search)
        {
            var query = _dbSet.Include(c => c.Scopes).AsQueryable();

            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                var keyword = search.Keyword.Trim().ToLower();
                query = query.Where(c =>
                    c.Code.ToLower().Contains(keyword) ||
                    c.Name.ToLower().Contains(keyword) ||
                    (c.Description != null && c.Description.ToLower().Contains(keyword)));
            }

            if (!string.IsNullOrWhiteSpace(search.Type))
            {
                var type = search.Type.Trim().ToLower();
                query = query.Where(c => c.Type.ToLower() == type);
            }

            if (!string.IsNullOrWhiteSpace(search.DiscountType))
            {
                var discountType = search.DiscountType.Trim().ToLower();
                query = query.Where(c => c.DiscountType.ToLower() == discountType);
            }

            if (search.IsActive.HasValue) query = query.Where(c => c.IsActive == search.IsActive.Value);
            if (search.IsPublic.HasValue) query = query.Where(c => c.IsPublic == search.IsPublic.Value);
            if (search.FromDate.HasValue) query = query.Where(c => c.CreatedAt >= search.FromDate.Value);
            if (search.ToDate.HasValue) query = query.Where(c => c.CreatedAt <= search.ToDate.Value);
            if (search.ClaimableOnly == true) query = query.Where(c => c.IsPublic && c.IsAutoClaimable);

            var now = DateTime.UtcNow;
            if (!string.IsNullOrWhiteSpace(search.Status))
            {
                query = search.Status.Trim().ToLower() switch
                {
                    "disabled" => query.Where(c => !c.IsActive),
                    "upcoming" => query.Where(c => c.IsActive && now < c.StartAt),
                    "expired" => query.Where(c => c.IsActive && now > c.EndAt),
                    "outofstock" or "out_of_stock" => query.Where(c => c.IsActive && c.TotalQuantity > 0 && c.ClaimedQuantity >= c.TotalQuantity),
                    "active" => query.Where(c => c.IsActive && now >= c.StartAt && now <= c.EndAt && (c.TotalQuantity <= 0 || c.ClaimedQuantity < c.TotalQuantity)),
                    _ => query
                };
            }

            var totalCount = await query.CountAsync();
            query = (search.SortBy ?? "newest").ToLower() switch
            {
                "oldest" => query.OrderBy(c => c.CreatedAt),
                "endingsoon" or "ending_soon" => query.OrderBy(c => c.EndAt),
                "claimeddesc" or "claimed_desc" => query.OrderByDescending(c => c.ClaimedQuantity),
                "useddesc" or "used_desc" => query.OrderByDescending(c => c.UsedQuantity),
                _ => query.OrderByDescending(c => c.CreatedAt).ThenByDescending(c => c.Id)
            };

            var page = Math.Max(1, search.Page);
            var pageSize = Math.Clamp(search.PageSize, 1, 100);
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            return (items, totalCount);
        }
    }

    public interface ICouponScopeRepositoryEF : IRepository<CouponScope>
    {
        Task<List<CouponScope>> GetByCouponAsync(int couponId);
        Task ReplaceScopesAsync(int couponId, IEnumerable<CouponScope> scopes);
    }

    public class CouponScopeRepositoryEF : Repository<CouponScope>, ICouponScopeRepositoryEF
    {
        public CouponScopeRepositoryEF(AppDbContext context) : base(context)
        {
        }

        public async Task<List<CouponScope>> GetByCouponAsync(int couponId)
        {
            return await _dbSet.Where(s => s.CouponId == couponId).ToListAsync();
        }

        public async Task ReplaceScopesAsync(int couponId, IEnumerable<CouponScope> scopes)
        {
            var existing = await _dbSet.Where(s => s.CouponId == couponId).ToListAsync();
            _dbSet.RemoveRange(existing);
            await _dbSet.AddRangeAsync(scopes);
            await _context.SaveChangesAsync();
        }
    }

    public interface IUserCouponRepositoryEF : IRepository<UserCoupon>
    {
        Task<(List<UserCoupon> Items, int TotalCount)> GetByUserAsync(Guid userId, UserCouponSearchDto search);
        Task<int> CountClaimedAsync(Guid userId, int couponId);
        Task<UserCoupon?> GetDetailAsync(int id);
        Task<List<UserCoupon>> GetByCouponAsync(int couponId);
    }

    public class UserCouponRepositoryEF : Repository<UserCoupon>, IUserCouponRepositoryEF
    {
        public UserCouponRepositoryEF(AppDbContext context) : base(context)
        {
        }

        public override async Task<UserCoupon?> GetByIdAsync(object id)
        {
            return await GetDetailAsync(Convert.ToInt32(id));
        }

        public async Task<UserCoupon?> GetDetailAsync(int id)
        {
            return await _dbSet.Include(x => x.Coupon).ThenInclude(c => c.Scopes).FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<(List<UserCoupon> Items, int TotalCount)> GetByUserAsync(Guid userId, UserCouponSearchDto search)
        {
            var query = _dbSet.Include(x => x.Coupon).ThenInclude(c => c.Scopes).Where(x => x.UserId == userId);
            if (!string.IsNullOrWhiteSpace(search.Type))
            {
                var type = search.Type.Trim().ToLower();
                query = query.Where(x => x.Coupon.Type.ToLower() == type);
            }
            if (!string.IsNullOrWhiteSpace(search.Status))
            {
                var status = search.Status.Trim().ToLower();
                query = query.Where(x => x.Status.ToLower() == status);
            }
            if (search.UsableOnly == true)
            {
                var now = DateTime.UtcNow;
                query = query.Where(x => x.Status == "Claimed" && x.Coupon.IsActive && x.Coupon.StartAt <= now && x.Coupon.EndAt >= now);
            }

            var totalCount = await query.CountAsync();
            var page = Math.Max(1, search.Page);
            var pageSize = Math.Clamp(search.PageSize, 1, 100);
            var items = await query.OrderByDescending(x => x.ClaimedAt).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            return (items, totalCount);
        }

        public async Task<int> CountClaimedAsync(Guid userId, int couponId)
        {
            return await _dbSet.CountAsync(x => x.UserId == userId && x.CouponId == couponId && x.Status != "Removed");
        }

        public async Task<List<UserCoupon>> GetByCouponAsync(int couponId)
        {
            return await _dbSet.Include(x => x.Coupon).Where(x => x.CouponId == couponId).OrderByDescending(x => x.ClaimedAt).ToListAsync();
        }
    }

    public interface IOrderCouponRepositoryEF : IRepository<OrderCoupon>
    {
        Task<List<OrderCoupon>> GetByOrderAsync(int orderId);
        Task<decimal> GetTotalDiscountAsync();
    }

    public class OrderCouponRepositoryEF : Repository<OrderCoupon>, IOrderCouponRepositoryEF
    {
        public OrderCouponRepositoryEF(AppDbContext context) : base(context)
        {
        }

        public async Task<List<OrderCoupon>> GetByOrderAsync(int orderId)
        {
            return await _dbSet.Where(x => x.OrderId == orderId).OrderBy(x => x.Id).ToListAsync();
        }

        public async Task<decimal> GetTotalDiscountAsync()
        {
            return await _dbSet.SumAsync(x => x.DiscountAmount);
        }
    }

    public interface IVoucherSpinRepositoryEF : IRepository<VoucherSpin>
    {
        Task<VoucherSpin?> GetTodayAsync(Guid userId, DateTime date);
    }

    public class VoucherSpinRepositoryEF : Repository<VoucherSpin>, IVoucherSpinRepositoryEF
    {
        public VoucherSpinRepositoryEF(AppDbContext context) : base(context)
        {
        }

        public async Task<VoucherSpin?> GetTodayAsync(Guid userId, DateTime date)
        {
            return await _dbSet.FirstOrDefaultAsync(x => x.UserId == userId && x.SpinDate.Date == date.Date);
        }
    }
}
