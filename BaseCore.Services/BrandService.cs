using BaseCore.DTO.Store;
using BaseCore.Repository;
using Microsoft.EntityFrameworkCore;

namespace BaseCore.Services
{
    public interface IBrandService
    {
        Task<List<BrandDto>> GetActiveBrandsAsync(int? categoryId);
    }

    public class BrandService : IBrandService
    {
        private readonly AppDbContext _db;

        public BrandService(AppDbContext db)
        {
            _db = db;
        }

        // Hãng đang hoạt động, lọc theo danh mục (dùng cho dropdown form sản phẩm).
        public async Task<List<BrandDto>> GetActiveBrandsAsync(int? categoryId)
        {
            var query = _db.Brands.AsNoTracking().Where(b => b.IsActive);
            if (categoryId.HasValue && categoryId.Value > 0)
            {
                query = query.Where(b => b.CategoryId == categoryId.Value);
            }

            return await query
                .OrderBy(b => b.Name)
                .Select(b => new BrandDto { Id = b.Id, Name = b.Name, CategoryId = b.CategoryId })
                .ToListAsync();
        }
    }
}
