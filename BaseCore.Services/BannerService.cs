using BaseCore.Entities;
using BaseCore.Repository;
using Microsoft.EntityFrameworkCore;

namespace BaseCore.Services
{
    public interface IBannerService
    {
        Task<List<Banner>> GetActiveAsync();
        Task<List<Banner>> GetAllAsync();
        Task<Banner?> GetByIdAsync(int id);
        Task<Banner> CreateAsync(Banner banner);
        Task<Banner?> UpdateAsync(int id, Banner banner);
        Task<bool> DeleteAsync(int id);
        Task<Banner?> ToggleAsync(int id);
    }

    public class BannerService : IBannerService
    {
        private readonly AppDbContext _db;

        public BannerService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<List<Banner>> GetActiveAsync()
            => await _db.Banners.Where(b => b.IsActive).OrderBy(b => b.DisplayOrder).ToListAsync();

        public async Task<List<Banner>> GetAllAsync()
            => await _db.Banners.OrderBy(b => b.DisplayOrder).ToListAsync();

        public async Task<Banner?> GetByIdAsync(int id)
            => await _db.Banners.FindAsync(id);

        public async Task<Banner> CreateAsync(Banner banner)
        {
            banner.CreatedAt = DateTime.UtcNow;
            _db.Banners.Add(banner);
            await _db.SaveChangesAsync();
            return banner;
        }

        public async Task<Banner?> UpdateAsync(int id, Banner banner)
        {
            var existing = await _db.Banners.FindAsync(id);
            if (existing == null) return null;

            existing.Kicker = banner.Kicker;
            existing.Title = banner.Title;
            existing.SubTitle = banner.SubTitle;
            existing.CtaLabel = banner.CtaLabel;
            existing.CtaTo = banner.CtaTo;
            existing.ImageUrl = banner.ImageUrl;
            existing.OfferTitle = banner.OfferTitle;
            existing.OfferDiscount = banner.OfferDiscount;
            existing.OfferProduct = banner.OfferProduct;
            existing.DisplayOrder = banner.DisplayOrder;
            existing.IsActive = banner.IsActive;
            existing.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var banner = await _db.Banners.FindAsync(id);
            if (banner == null) return false;

            _db.Banners.Remove(banner);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<Banner?> ToggleAsync(int id)
        {
            var banner = await _db.Banners.FindAsync(id);
            if (banner == null) return null;

            banner.IsActive = !banner.IsActive;
            banner.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return banner;
        }
    }
}
