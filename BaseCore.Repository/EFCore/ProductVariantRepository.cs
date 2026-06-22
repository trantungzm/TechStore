using BaseCore.Entities;
using Microsoft.EntityFrameworkCore;

namespace BaseCore.Repository.EFCore
{
    public interface IProductVariantRepositoryEF : IRepository<ProductVariant>
    {
        Task<int> DecrementStockAsync(int variantId, int quantity, int version);
        Task<int> IncrementStockAsync(int variantId, int quantity, int version);
    }

    public class ProductVariantRepositoryEF : Repository<ProductVariant>, IProductVariantRepositoryEF
    {
        public ProductVariantRepositoryEF(AppDbContext context) : base(context)
        {
        }

        public async Task<int> DecrementStockAsync(int variantId, int quantity, int version)
        {
            return await _context.ProductVariants
                .Where(v => v.Id == variantId && v.Stock >= quantity)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(v => v.Stock, v => v.Stock - quantity)
                    .SetProperty(v => v.UpdatedAt, DateTime.UtcNow));
        }

        public async Task<int> IncrementStockAsync(int variantId, int quantity, int version)
        {
            return await _context.ProductVariants
                .Where(v => v.Id == variantId)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(v => v.Stock, v => v.Stock + quantity)
                    .SetProperty(v => v.UpdatedAt, DateTime.UtcNow));
        }
    }
}
