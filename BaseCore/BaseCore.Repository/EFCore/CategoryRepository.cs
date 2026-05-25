using Microsoft.EntityFrameworkCore;
using BaseCore.Entities;

namespace BaseCore.Repository.EFCore
{
    /// <summary>
    /// Category Repository using Entity Framework Core
    /// </summary>
    public interface ICategoryRepositoryEF : IRepository<Category>
    {
        Task<Category?> GetByNameAsync(string name);
        Task<bool> HasProductsAsync(int categoryId);
    }

    public class CategoryRepositoryEF : Repository<Category>, ICategoryRepositoryEF
    {
        public CategoryRepositoryEF(AppDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<Category>> GetAllAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .OrderBy(c => c.Id)
                .ToListAsync();
        }

        public async Task<Category?> GetByNameAsync(string name)
        {
            return await _dbSet.FirstOrDefaultAsync(c => c.Name.ToLower() == name.ToLower());
        }

        public async Task<bool> HasProductsAsync(int categoryId)
        {
            return await _context.Products.AnyAsync(p => p.CategoryId == categoryId && p.IsActive);
        }
    }
}
