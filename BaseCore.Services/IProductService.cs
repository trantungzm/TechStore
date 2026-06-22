using BaseCore.Entities;
using BaseCore.DTO.Store;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BaseCore.Services
{
    public record ProductInventoryStats(int TotalCount, int AvailableCount, int LowCount, int OutCount);

    public interface IProductService
    {
        Task<List<Product>> GetAllProductsAsync();
        Task<Product?> GetProductByIdAsync(int id, bool includeInactive = false);
        Task<Product> CreateAsync(ProductCreateDto dto);
        Task<Product?> UpdateAsync(int id, ProductUpdateDto dto);
        Task<bool> DeleteAsync(int id);
        Task<(List<Product> Products, int TotalCount)> SearchAsync(string? keyword, int? categoryId, int page, int pageSize);
        Task<(List<Product> Products, int TotalCount)> SearchAsync(ProductSearchDto search);
        Task<ProductInventoryStats> GetInventoryStatsAsync(ProductSearchDto search);
        Task<List<string>> GetBrandsAsync();
    }
}
