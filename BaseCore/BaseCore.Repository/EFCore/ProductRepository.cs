using Microsoft.EntityFrameworkCore;
using BaseCore.DTO.Store;
using BaseCore.Entities;

namespace BaseCore.Repository.EFCore
{
    /// <summary>
    /// Product Repository using Entity Framework Core
    /// </summary>
    public interface IProductRepositoryEF : IRepository<Product>
    {
        Task<(List<Product> Products, int TotalCount)> SearchAsync(string? keyword, int? categoryId, int page, int pageSize);
        Task<(List<Product> Products, int TotalCount)> SearchAsync(ProductSearchDto search);
        Task<List<Product>> GetByCategoryAsync(int categoryId);
        Task<Product?> GetDetailAsync(int id);
        Task<bool> HasOrderDetailsAsync(int productId);
    }

    public class ProductRepositoryEF : Repository<Product>, IProductRepositoryEF
    {
        public ProductRepositoryEF(AppDbContext context) : base(context)
        {
        }

        public override async Task<Product?> GetByIdAsync(object id)
        {
            return await GetDetailAsync(Convert.ToInt32(id));
        }

        public async Task<(List<Product> Products, int TotalCount)> SearchAsync(string? keyword, int? categoryId, int page, int pageSize)
        {
            return await SearchAsync(new ProductSearchDto
            {
                Keyword = keyword,
                CategoryId = categoryId,
                Page = page,
                PageSize = pageSize
            });
        }

        public async Task<(List<Product> Products, int TotalCount)> SearchAsync(ProductSearchDto search)
        {
            var query = _dbSet
                .Include(p => p.Category)
                .Include(p => p.Supplier)
                .Include(p => p.BackupSupplier)
                .Where(p => p.IsActive)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search.Keyword))
            {
                var keyword = search.Keyword.ToLower();
                query = query.Where(p =>
                    p.Name.ToLower().Contains(keyword) ||
                    (p.Description != null && p.Description.ToLower().Contains(keyword)) ||
                    (p.Brand != null && p.Brand.ToLower().Contains(keyword)) ||
                    (p.Sku != null && p.Sku.ToLower().Contains(keyword)));
            }

            if (search.CategoryId.HasValue && search.CategoryId > 0)
            {
                query = query.Where(p => p.CategoryId == search.CategoryId);
            }

            if (!string.IsNullOrWhiteSpace(search.CategorySlug))
            {
                var categorySlug = search.CategorySlug.Trim().ToLower();
                query = query.Where(p => p.Category != null && p.Category.Name.ToLower().Replace(" ", "-") == categorySlug);
            }

            if (!string.IsNullOrWhiteSpace(search.Brand))
            {
                var brand = search.Brand.Trim().ToLower();
                query = query.Where(p => p.Brand != null && p.Brand.ToLower() == brand);
            }

            if (search.MinPrice.HasValue) query = query.Where(p => p.Price >= search.MinPrice.Value);
            if (search.MaxPrice.HasValue) query = query.Where(p => p.Price <= search.MaxPrice.Value);
            if (search.InStock == true) query = query.Where(p => p.Stock > 0);
            if (search.IsFeatured.HasValue) query = query.Where(p => p.IsFeatured == search.IsFeatured.Value);
            if (search.IsBestSeller.HasValue) query = query.Where(p => p.IsBestSeller == search.IsBestSeller.Value);
            if (search.IsNewArrival.HasValue) query = query.Where(p => p.IsNewArrival == search.IsNewArrival.Value);
            if (search.IsDiscounted.HasValue) query = query.Where(p => p.IsDiscounted == search.IsDiscounted.Value);

            var totalCount = await query.CountAsync();

            query = (search.SortBy ?? string.Empty).ToLower() switch
            {
                "priceasc" or "price_asc" => query.OrderBy(p => p.Price),
                "pricedesc" or "price_desc" => query.OrderByDescending(p => p.Price),
                "bestseller" or "best_seller" => query.OrderByDescending(p => p.IsBestSeller).ThenByDescending(p => p.Id),
                "newest" => query.OrderByDescending(p => p.CreatedAt).ThenByDescending(p => p.Id),
                _ => query.OrderByDescending(p => p.Id)
            };

            var page = Math.Max(1, search.Page);
            var pageSize = Math.Clamp(search.PageSize, 1, 100);
            var products = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (products, totalCount);
        }

        public async Task<List<Product>> GetByCategoryAsync(int categoryId)
        {
            return await _dbSet
                .Where(p => p.CategoryId == categoryId)
                .Where(p => p.IsActive)
                .Include(p => p.Category)
                .Include(p => p.Supplier)
                .Include(p => p.BackupSupplier)
                .ToListAsync();
        }

        public async Task<Product?> GetDetailAsync(int id)
        {
            return await _dbSet
                .Include(p => p.Category)
                .Include(p => p.Supplier)
                .Include(p => p.BackupSupplier)
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .Include(p => p.SpecValues)
                    .ThenInclude(v => v.SpecDefinition)
                .Include(p => p.Recommendations)
                    .ThenInclude(r => r.RecommendedProduct)
                        .ThenInclude(rp => rp.Category)
                .FirstOrDefaultAsync(p => p.Id == id && p.IsActive);
        }

        public async Task<bool> HasOrderDetailsAsync(int productId)
        {
            return await _context.OrderDetails.AnyAsync(x => x.ProductId == productId);
        }
    }
}
