using BaseCore.DTO.Inventory;
using BaseCore.Entities;
using Microsoft.EntityFrameworkCore;

namespace BaseCore.Repository.EFCore
{
    public interface IWarehouseRepositoryEF : IRepository<Warehouse>
    {
        Task<Warehouse?> GetDefaultAsync();
    }

    public class WarehouseRepositoryEF : Repository<Warehouse>, IWarehouseRepositoryEF
    {
        public WarehouseRepositoryEF(AppDbContext context) : base(context) { }

        public Task<Warehouse?> GetDefaultAsync()
        {
            return _dbSet.OrderBy(x => x.Id).FirstOrDefaultAsync(x => x.IsActive);
        }
    }

    public interface ISupplierRepositoryEF : IRepository<Supplier>
    {
        Task<Supplier?> GetDetailAsync(int id);
        Task<Supplier?> GetByCodeAsync(string code);
        Task<bool> IsUsedAsync(int id);
        Task<(List<Supplier> Items, int TotalCount)> SearchAsync(SupplierSearchDto search);
    }

    public class SupplierRepositoryEF : Repository<Supplier>, ISupplierRepositoryEF
    {
        public SupplierRepositoryEF(AppDbContext context) : base(context) { }

        public Task<Supplier?> GetDetailAsync(int id)
        {
            return _dbSet.FirstOrDefaultAsync(x => x.Id == id);
        }

        public Task<Supplier?> GetByCodeAsync(string code)
        {
            var normalized = code.Trim().ToLower();
            return _dbSet.FirstOrDefaultAsync(x => x.SupplierCode.ToLower() == normalized);
        }

        public async Task<bool> IsUsedAsync(int id)
        {
            return await _context.Products.AnyAsync(x => x.SupplierId == id || x.BackupSupplierId == id)
                || await _context.GoodsReceipts.AnyAsync(x => x.SupplierId == id);
        }

        public async Task<(List<Supplier> Items, int TotalCount)> SearchAsync(SupplierSearchDto search)
        {
            var query = _dbSet.AsQueryable();
            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                var keyword = search.Keyword.Trim().ToLower();
                query = query.Where(x =>
                    x.Name.ToLower().Contains(keyword) ||
                    x.SupplierCode.ToLower().Contains(keyword) ||
                    (x.Phone != null && x.Phone.ToLower().Contains(keyword)) ||
                    (x.Email != null && x.Email.ToLower().Contains(keyword)) ||
                    (x.TaxCode != null && x.TaxCode.ToLower().Contains(keyword)) ||
                    (x.ContactPerson != null && x.ContactPerson.ToLower().Contains(keyword)));
            }
            if (search.IsActive.HasValue) query = query.Where(x => x.IsActive == search.IsActive.Value);
            var total = await query.CountAsync();
            var page = Math.Max(1, search.Page);
            var pageSize = Math.Clamp(search.PageSize, 1, 100);
            var items = await query.OrderBy(x => x.Name).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            return (items, total);
        }
    }

    public interface ICategorySupplierRepositoryEF : IRepository<CategorySupplier>
    {
        Task<List<CategorySupplier>> GetAllDetailAsync();
        Task<List<CategorySupplier>> GetByCategoryAsync(int categoryId, bool activeOnly = true);
        Task<bool> ExistsAsync(int categoryId, int supplierId);
        Task<int> CountByCategoryAsync(int categoryId, int? excludingId = null);
    }

    public class CategorySupplierRepositoryEF : Repository<CategorySupplier>, ICategorySupplierRepositoryEF
    {
        public CategorySupplierRepositoryEF(AppDbContext context) : base(context) { }

        public Task<List<CategorySupplier>> GetAllDetailAsync()
        {
            return DetailQuery()
                .OrderBy(x => x.CategoryId)
                .ThenBy(x => x.SortOrder)
                .ThenBy(x => x.Supplier!.Name)
                .ToListAsync();
        }

        public Task<List<CategorySupplier>> GetByCategoryAsync(int categoryId, bool activeOnly = true)
        {
            var query = DetailQuery().Where(x => x.CategoryId == categoryId);
            if (activeOnly)
            {
                query = query.Where(x => x.IsActive && x.Supplier != null && x.Supplier.IsActive);
            }

            return query.OrderBy(x => x.SortOrder).ThenBy(x => x.Supplier!.Name).ToListAsync();
        }

        public Task<bool> ExistsAsync(int categoryId, int supplierId)
        {
            return _dbSet.AnyAsync(x => x.CategoryId == categoryId && x.SupplierId == supplierId && x.IsActive);
        }

        public Task<int> CountByCategoryAsync(int categoryId, int? excludingId = null)
        {
            var query = _dbSet.Where(x => x.CategoryId == categoryId && x.IsActive);
            if (excludingId.HasValue) query = query.Where(x => x.Id != excludingId.Value);
            return query.CountAsync();
        }

        private IQueryable<CategorySupplier> DetailQuery()
        {
            return _dbSet.Include(x => x.Category).Include(x => x.Supplier);
        }
    }

    public interface IStockItemRepositoryEF : IRepository<StockItem>
    {
        Task<StockItem?> GetDetailAsync(int id);
        Task<StockItem?> GetBySerialAsync(string serialOrImei);
        Task<List<StockItem>> GetByIdsAsync(List<int> ids);
        Task<bool> AnySerialAsync(string serialOrImei);
        Task<(List<StockItem> Items, int TotalCount)> SearchAsync(InventorySearchDto search);
        Task<(List<StockItem> Items, int TotalCount)> GetAgedAsync(AgedStockSearchDto search);
    }

    public class StockItemRepositoryEF : Repository<StockItem>, IStockItemRepositoryEF
    {
        public StockItemRepositoryEF(AppDbContext context) : base(context) { }

        public Task<StockItem?> GetDetailAsync(int id)
        {
            return DetailQuery().FirstOrDefaultAsync(x => x.Id == id);
        }

        public Task<StockItem?> GetBySerialAsync(string serialOrImei)
        {
            var serial = serialOrImei.Trim().ToLower();
            return DetailQuery().FirstOrDefaultAsync(x => x.SerialOrImei.ToLower() == serial);
        }

        public Task<List<StockItem>> GetByIdsAsync(List<int> ids)
        {
            return DetailQuery().Where(x => ids.Contains(x.Id)).ToListAsync();
        }

        public Task<bool> AnySerialAsync(string serialOrImei)
        {
            var serial = serialOrImei.Trim().ToLower();
            return _dbSet.AnyAsync(x => x.SerialOrImei.ToLower() == serial);
        }

        public async Task<(List<StockItem> Items, int TotalCount)> SearchAsync(InventorySearchDto search)
        {
            var query = ApplySearch(DetailQuery(), search);
            var totalCount = await query.CountAsync();
            query = ApplySort(query, search.SortBy);
            var page = Math.Max(1, search.Page);
            var pageSize = Math.Clamp(search.PageSize, 1, 100);
            return (await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(), totalCount);
        }

        public async Task<(List<StockItem> Items, int TotalCount)> GetAgedAsync(AgedStockSearchDto search)
        {
            var minDays = Math.Max(0, search.MinDays);
            var cutoff = DateTime.UtcNow.AddDays(-minDays);
            var query = DetailQuery().Where(x => x.Status == "InStock" && x.ReceivedAt <= cutoff);
            if (search.CategoryId.HasValue) query = query.Where(x => x.Product != null && x.Product.CategoryId == search.CategoryId.Value);
            if (search.SupplierId.HasValue) query = query.Where(x => x.SupplierId == search.SupplierId.Value);
            if (search.WarehouseId.HasValue) query = query.Where(x => x.WarehouseId == search.WarehouseId.Value);
            var totalCount = await query.CountAsync();
            var page = Math.Max(1, search.Page);
            var pageSize = Math.Clamp(search.PageSize, 1, 100);
            var items = await query.OrderBy(x => x.ReceivedAt).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            return (items, totalCount);
        }

        private IQueryable<StockItem> DetailQuery()
        {
            return _dbSet
                .Include(x => x.Product)
                .Include(x => x.Variant)
                .Include(x => x.Supplier)
                .Include(x => x.Warehouse)
                .Include(x => x.Order);
        }

        private static IQueryable<StockItem> ApplySearch(IQueryable<StockItem> query, InventorySearchDto search)
        {
            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                var keyword = search.Keyword.Trim().ToLower();
                query = query.Where(x =>
                    (x.Product != null && x.Product.Name.ToLower().Contains(keyword)) ||
                    (x.Sku != null && x.Sku.ToLower().Contains(keyword)) ||
                    x.SerialOrImei.ToLower().Contains(keyword) ||
                    (x.SupplierName != null && x.SupplierName.ToLower().Contains(keyword)));
            }
            if (search.ProductId.HasValue) query = query.Where(x => x.ProductId == search.ProductId.Value);
            if (search.VariantId.HasValue) query = query.Where(x => x.VariantId == search.VariantId.Value);
            if (search.CategoryId.HasValue) query = query.Where(x => x.Product != null && x.Product.CategoryId == search.CategoryId.Value);
            if (search.SupplierId.HasValue) query = query.Where(x => x.SupplierId == search.SupplierId.Value);
            if (!string.IsNullOrWhiteSpace(search.Status)) query = query.Where(x => x.Status == search.Status.Trim());
            if (search.WarehouseId.HasValue) query = query.Where(x => x.WarehouseId == search.WarehouseId.Value);
            if (!string.IsNullOrWhiteSpace(search.SerialOrImei))
            {
                var serial = search.SerialOrImei.Trim();
                query = query.Where(x => x.SerialOrImei.Contains(serial));
            }
            if (search.FromDate.HasValue) query = query.Where(x => x.ReceivedAt >= search.FromDate.Value);
            if (search.ToDate.HasValue) query = query.Where(x => x.ReceivedAt <= search.ToDate.Value);
            return query;
        }

        private static IQueryable<StockItem> ApplySort(IQueryable<StockItem> query, string? sortBy)
        {
            return (sortBy ?? "newest").ToLower() switch
            {
                "oldest" => query.OrderBy(x => x.ReceivedAt).ThenBy(x => x.Id),
                "productname" or "product_name" => query.OrderBy(x => x.Product != null ? x.Product.Name : "").ThenBy(x => x.SerialOrImei),
                "status" => query.OrderBy(x => x.Status).ThenByDescending(x => x.ReceivedAt),
                _ => query.OrderByDescending(x => x.ReceivedAt).ThenByDescending(x => x.Id)
            };
        }
    }

    public interface IGoodsReceiptRepositoryEF : IRepository<GoodsReceipt>
    {
        Task<GoodsReceipt?> GetDetailAsync(int id);
        Task<(List<GoodsReceipt> Items, int TotalCount)> SearchAsync(InventorySearchDto search);
    }

    public class GoodsReceiptRepositoryEF : Repository<GoodsReceipt>, IGoodsReceiptRepositoryEF
    {
        public GoodsReceiptRepositoryEF(AppDbContext context) : base(context) { }

        public Task<GoodsReceipt?> GetDetailAsync(int id)
        {
            return DetailQuery().FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<(List<GoodsReceipt> Items, int TotalCount)> SearchAsync(InventorySearchDto search)
        {
            var query = DetailQuery();
            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                var keyword = search.Keyword.Trim().ToLower();
                query = query.Where(x => x.ReceiptCode.ToLower().Contains(keyword) || x.SupplierName.ToLower().Contains(keyword));
            }
            if (search.WarehouseId.HasValue) query = query.Where(x => x.WarehouseId == search.WarehouseId.Value);
            if (search.SupplierId.HasValue) query = query.Where(x => x.SupplierId == search.SupplierId.Value);
            if (search.FromDate.HasValue) query = query.Where(x => x.ReceivedAt >= search.FromDate.Value);
            if (search.ToDate.HasValue) query = query.Where(x => x.ReceivedAt <= search.ToDate.Value);
            var total = await query.CountAsync();
            var page = Math.Max(1, search.Page);
            var pageSize = Math.Clamp(search.PageSize, 1, 100);
            var items = await query.OrderByDescending(x => x.ReceivedAt).ThenByDescending(x => x.Id).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            return (items, total);
        }

        private IQueryable<GoodsReceipt> DetailQuery()
        {
            return _dbSet
                .Include(x => x.Warehouse)
                .Include(x => x.Supplier)
                .Include(x => x.Lines).ThenInclude(l => l.Product)
                .Include(x => x.Lines).ThenInclude(l => l.Variant)
                .Include(x => x.Lines).ThenInclude(l => l.Serials);
        }
    }

    public interface IGoodsReceiptLineRepositoryEF : IRepository<GoodsReceiptLine> { }
    public class GoodsReceiptLineRepositoryEF : Repository<GoodsReceiptLine>, IGoodsReceiptLineRepositoryEF
    {
        public GoodsReceiptLineRepositoryEF(AppDbContext context) : base(context) { }
    }

    public interface IGoodsReceiptSerialRepositoryEF : IRepository<GoodsReceiptSerial> { }
    public class GoodsReceiptSerialRepositoryEF : Repository<GoodsReceiptSerial>, IGoodsReceiptSerialRepositoryEF
    {
        public GoodsReceiptSerialRepositoryEF(AppDbContext context) : base(context) { }
    }

    public interface IStockMovementRepositoryEF : IRepository<StockMovement>
    {
        Task<(List<StockMovement> Items, int TotalCount)> SearchAsync(InventorySearchDto search);
    }

    public class StockMovementRepositoryEF : Repository<StockMovement>, IStockMovementRepositoryEF
    {
        public StockMovementRepositoryEF(AppDbContext context) : base(context) { }

        public async Task<(List<StockMovement> Items, int TotalCount)> SearchAsync(InventorySearchDto search)
        {
            var query = _dbSet.Include(x => x.Product).Include(x => x.Variant).Include(x => x.Warehouse).AsQueryable();
            if (search.ProductId.HasValue) query = query.Where(x => x.ProductId == search.ProductId.Value);
            if (search.VariantId.HasValue) query = query.Where(x => x.VariantId == search.VariantId.Value);
            if (search.WarehouseId.HasValue) query = query.Where(x => x.WarehouseId == search.WarehouseId.Value);
            if (search.FromDate.HasValue) query = query.Where(x => x.CreatedAt >= search.FromDate.Value);
            if (search.ToDate.HasValue) query = query.Where(x => x.CreatedAt <= search.ToDate.Value);
            var total = await query.CountAsync();
            var page = Math.Max(1, search.Page);
            var pageSize = Math.Clamp(search.PageSize, 1, 100);
            var items = await query.OrderByDescending(x => x.CreatedAt).ThenByDescending(x => x.Id).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            return (items, total);
        }
    }

    public interface IInventoryReturnRepositoryEF : IRepository<InventoryReturn>
    {
        Task<InventoryReturn?> GetDetailAsync(int id);
        Task<(List<InventoryReturn> Items, int TotalCount)> SearchAsync(InventoryReturnSearchDto search);
    }

    public class InventoryReturnRepositoryEF : Repository<InventoryReturn>, IInventoryReturnRepositoryEF
    {
        public InventoryReturnRepositoryEF(AppDbContext context) : base(context) { }

        public Task<InventoryReturn?> GetDetailAsync(int id)
        {
            return DetailQuery().FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<(List<InventoryReturn> Items, int TotalCount)> SearchAsync(InventoryReturnSearchDto search)
        {
            var query = DetailQuery();
            if (!string.IsNullOrWhiteSpace(search.Status)) query = query.Where(x => x.Status == search.Status.Trim());
            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                var keyword = search.Keyword.Trim().ToLower();
                query = query.Where(x =>
                    x.ReturnCode.ToLower().Contains(keyword) ||
                    (x.SerialOrImei != null && x.SerialOrImei.ToLower().Contains(keyword)) ||
                    (x.CustomerName != null && x.CustomerName.ToLower().Contains(keyword)) ||
                    (x.CustomerPhone != null && x.CustomerPhone.ToLower().Contains(keyword)) ||
                    (x.Product != null && x.Product.Name.ToLower().Contains(keyword)));
            }
            if (search.FromDate.HasValue) query = query.Where(x => x.CreatedAt >= search.FromDate.Value);
            if (search.ToDate.HasValue) query = query.Where(x => x.CreatedAt <= search.ToDate.Value);
            var total = await query.CountAsync();
            var page = Math.Max(1, search.Page);
            var pageSize = Math.Clamp(search.PageSize, 1, 100);
            var items = await query.OrderByDescending(x => x.CreatedAt).ThenByDescending(x => x.Id).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            return (items, total);
        }

        private IQueryable<InventoryReturn> DetailQuery()
        {
            return _dbSet.Include(x => x.Product).Include(x => x.Variant).Include(x => x.StockItem).Include(x => x.Order);
        }
    }

    public interface IOrderDetailStockItemRepositoryEF : IRepository<OrderDetailStockItem>
    {
        Task<bool> AnyByStockItemAsync(int stockItemId);
    }

    public class OrderDetailStockItemRepositoryEF : Repository<OrderDetailStockItem>, IOrderDetailStockItemRepositoryEF
    {
        public OrderDetailStockItemRepositoryEF(AppDbContext context) : base(context) { }

        public Task<bool> AnyByStockItemAsync(int stockItemId)
        {
            return _dbSet.AnyAsync(x => x.StockItemId == stockItemId);
        }
    }
}
