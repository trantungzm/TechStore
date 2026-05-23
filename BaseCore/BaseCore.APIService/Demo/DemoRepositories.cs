using System.Linq.Expressions;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;
using BaseCore.DTO.Store;
using BaseCore.DTO.Inventory;

namespace BaseCore.APIService.Demo
{
    public abstract class DemoRepositoryBase<T> : IRepository<T> where T : class
    {
        protected readonly DemoStore Store;
        protected readonly List<T> Items;

        protected DemoRepositoryBase(DemoStore store, List<T> items)
        {
            Store = store;
            Items = items;
        }

        public virtual Task<T?> GetByIdAsync(object id) => Task.FromResult(Items.FirstOrDefault(x => MatchId(x, id)));
        public virtual Task<IEnumerable<T>> GetAllAsync() => Task.FromResult(Items.AsEnumerable());
        public virtual Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate) => Task.FromResult(Items.AsQueryable().Where(predicate).AsEnumerable());
        public virtual Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate) => Task.FromResult(Items.AsQueryable().FirstOrDefault(predicate));

        public virtual Task<T> AddAsync(T entity)
        {
            SetIdIfNeeded(entity);
            Items.Add(entity);
            return Task.FromResult(entity);
        }

        public virtual Task AddRangeAsync(IEnumerable<T> entities)
        {
            foreach (var entity in entities)
            {
                SetIdIfNeeded(entity);
                Items.Add(entity);
            }

            return Task.CompletedTask;
        }

        public virtual Task UpdateAsync(T entity) => Task.CompletedTask;

        public virtual Task DeleteAsync(T entity)
        {
            Items.Remove(entity);
            return Task.CompletedTask;
        }

        public virtual async Task DeleteByIdAsync(object id)
        {
            var entity = await GetByIdAsync(id);
            if (entity != null)
            {
                Items.Remove(entity);
            }
        }

        public virtual Task<(IEnumerable<T> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, Expression<Func<T, bool>>? filter = null, Expression<Func<T, object>>? orderBy = null, bool descending = false)
        {
            IQueryable<T> query = Items.AsQueryable();
            if (filter != null) query = query.Where(filter);
            if (orderBy != null) query = descending ? query.OrderByDescending(orderBy) : query.OrderBy(orderBy);

            var totalCount = query.Count();
            var pageItems = query.Skip((page - 1) * pageSize).Take(pageSize).ToList();
            return Task.FromResult((pageItems.AsEnumerable(), totalCount));
        }

        protected abstract bool MatchId(T entity, object id);
        protected virtual void SetIdIfNeeded(T entity) { }
    }

    public class DemoCategoryRepository : DemoRepositoryBase<Category>, ICategoryRepositoryEF
    {
        public DemoCategoryRepository(DemoStore store) : base(store, store.Categories) { }

        protected override bool MatchId(Category entity, object id) => entity.Id == Convert.ToInt32(id);
        protected override void SetIdIfNeeded(Category entity)
        {
            if (entity.Id == 0) entity.Id = Store.NextCategoryId;
        }

        public Task<Category?> GetByNameAsync(string name) =>
            Task.FromResult(Store.Categories.FirstOrDefault(x => x.Name.Equals(name, StringComparison.OrdinalIgnoreCase)));

        public Task<bool> HasProductsAsync(int categoryId) =>
            Task.FromResult(Store.Products.Any(x => x.CategoryId == categoryId && x.IsActive));
    }

    public class DemoProductRepository : DemoRepositoryBase<Product>, IProductRepositoryEF
    {
        public DemoProductRepository(DemoStore store) : base(store, store.Products) { }

        protected override bool MatchId(Product entity, object id) => entity.Id == Convert.ToInt32(id);
        protected override void SetIdIfNeeded(Product entity)
        {
            if (entity.Id == 0) entity.Id = Store.NextProductId;
        }

        public override Task<Product?> GetByIdAsync(object id)
        {
            return GetDetailAsync(Convert.ToInt32(id));
        }

        public Task<Product?> GetDetailAsync(int id)
        {
            var product = Store.Products.FirstOrDefault(x => x.Id == Convert.ToInt32(id));
            if (product != null)
            {
                product.Category = Store.Categories.FirstOrDefault(c => c.Id == product.CategoryId);
                product.Supplier = Store.Suppliers.FirstOrDefault(s => s.Id == product.SupplierId);
                product.BackupSupplier = Store.Suppliers.FirstOrDefault(s => s.Id == product.BackupSupplierId);
                product.Images = Store.ProductImages.Where(x => x.ProductId == product.Id).OrderBy(x => x.SortOrder).ToList();
                product.Variants = Store.ProductVariants.Where(x => x.ProductId == product.Id).ToList();
                product.SpecValues = Store.ProductSpecValues.Where(x => x.ProductId == product.Id).ToList();
                product.Recommendations = Store.ProductRecommendations.Where(x => x.ProductId == product.Id).ToList();
            }
            return Task.FromResult(product);
        }

        public override Task<IEnumerable<Product>> GetAllAsync()
        {
            foreach (var product in Store.Products)
            {
                product.Category = Store.Categories.FirstOrDefault(c => c.Id == product.CategoryId);
                product.Supplier = Store.Suppliers.FirstOrDefault(s => s.Id == product.SupplierId);
                product.BackupSupplier = Store.Suppliers.FirstOrDefault(s => s.Id == product.BackupSupplierId);
            }
            return Task.FromResult(Store.Products.AsEnumerable());
        }

        public Task<List<Product>> GetByCategoryAsync(int categoryId)
        {
            var products = Store.Products.Where(x => x.CategoryId == categoryId).ToList();
            foreach (var product in products)
            {
                product.Category = Store.Categories.FirstOrDefault(c => c.Id == product.CategoryId);
                product.Supplier = Store.Suppliers.FirstOrDefault(s => s.Id == product.SupplierId);
                product.BackupSupplier = Store.Suppliers.FirstOrDefault(s => s.Id == product.BackupSupplierId);
            }
            return Task.FromResult(products);
        }

        public Task<(List<Product> Products, int TotalCount)> SearchAsync(string? keyword, int? categoryId, int page, int pageSize)
        {
            return SearchAsync(new BaseCore.DTO.Store.ProductSearchDto
            {
                Keyword = keyword,
                CategoryId = categoryId,
                Page = page,
                PageSize = pageSize
            });
        }

        public Task<(List<Product> Products, int TotalCount)> SearchAsync(BaseCore.DTO.Store.ProductSearchDto search)
        {
            IEnumerable<Product> query = Store.Products;

            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                var lowered = search.Keyword.ToLower();
                query = query.Where(p => p.Name.ToLower().Contains(lowered) || (p.Description ?? string.Empty).ToLower().Contains(lowered));
            }

            if (search.CategoryId.HasValue && search.CategoryId.Value > 0)
            {
                query = query.Where(p => p.CategoryId == search.CategoryId.Value);
            }

            if (!string.IsNullOrWhiteSpace(search.Brand))
            {
                query = query.Where(p => string.Equals(p.Brand, search.Brand, StringComparison.OrdinalIgnoreCase));
            }

            if (search.MinPrice.HasValue) query = query.Where(p => p.Price >= search.MinPrice.Value);
            if (search.MaxPrice.HasValue) query = query.Where(p => p.Price <= search.MaxPrice.Value);
            if (search.InStock == true) query = query.Where(p => p.Stock > 0);
            if (search.IsFeatured.HasValue) query = query.Where(p => p.IsFeatured == search.IsFeatured.Value);
            if (search.IsBestSeller.HasValue) query = query.Where(p => p.IsBestSeller == search.IsBestSeller.Value);
            if (search.IsNewArrival.HasValue) query = query.Where(p => p.IsNewArrival == search.IsNewArrival.Value);
            if (search.IsDiscounted.HasValue) query = query.Where(p => p.IsDiscounted == search.IsDiscounted.Value);

            query = (search.SortBy ?? string.Empty).ToLower() switch
            {
                "priceasc" or "price_asc" => query.OrderBy(p => p.Price),
                "pricedesc" or "price_desc" => query.OrderByDescending(p => p.Price),
                "newest" => query.OrderByDescending(p => p.CreatedAt),
                _ => query.OrderByDescending(p => p.Id)
            };

            var totalCount = query.Count();
            var items = query
                .Skip((Math.Max(1, search.Page) - 1) * Math.Clamp(search.PageSize, 1, 100))
                .Take(Math.Clamp(search.PageSize, 1, 100))
                .ToList();

            foreach (var product in items)
            {
                product.Category = Store.Categories.FirstOrDefault(c => c.Id == product.CategoryId);
                product.Supplier = Store.Suppliers.FirstOrDefault(s => s.Id == product.SupplierId);
                product.BackupSupplier = Store.Suppliers.FirstOrDefault(s => s.Id == product.BackupSupplierId);
            }

            return Task.FromResult((items, totalCount));
        }

        public Task<bool> HasOrderDetailsAsync(int productId) =>
            Task.FromResult(Store.OrderDetails.Any(x => x.ProductId == productId));
    }

    public class DemoOrderRepository : DemoRepositoryBase<Order>, IOrderRepositoryEF
    {
        public DemoOrderRepository(DemoStore store) : base(store, store.Orders) { }

        protected override bool MatchId(Order entity, object id) => entity.Id == Convert.ToInt32(id);
        protected override void SetIdIfNeeded(Order entity)
        {
            if (entity.Id == 0) entity.Id = Store.NextOrderId;
        }

        public Task<List<Order>> GetByUserAsync(Guid userId) =>
            Task.FromResult(Store.Orders.Where(x => x.UserId == userId).OrderByDescending(x => x.OrderDate).ToList());

        public Task<Order?> GetWithDetailsAsync(int orderId) =>
            Task.FromResult(Store.Orders.FirstOrDefault(x => x.Id == orderId));

        public Task<(List<Order> Orders, int TotalCount)> SearchAsync(OrderSearchDto search)
        {
            var query = Store.Orders.AsEnumerable();
            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                var keyword = search.Keyword.Trim().ToLower();
                query = query.Where(o =>
                    (o.OrderCode ?? "").ToLower().Contains(keyword) ||
                    (o.CustomerName ?? "").ToLower().Contains(keyword) ||
                    (o.CustomerPhone ?? "").ToLower().Contains(keyword) ||
                    (o.CustomerEmail ?? "").ToLower().Contains(keyword));
            }
            if (!string.IsNullOrWhiteSpace(search.Status))
                query = query.Where(o => string.Equals(o.Status, search.Status, StringComparison.OrdinalIgnoreCase));
            if (!string.IsNullOrWhiteSpace(search.PaymentStatus))
                query = query.Where(o => string.Equals(o.PaymentStatus, search.PaymentStatus, StringComparison.OrdinalIgnoreCase));
            if (!string.IsNullOrWhiteSpace(search.PaymentMethod))
                query = query.Where(o => string.Equals(o.PaymentMethod, search.PaymentMethod, StringComparison.OrdinalIgnoreCase));
            if (!string.IsNullOrWhiteSpace(search.CustomerPhone))
                query = query.Where(o => (o.CustomerPhone ?? "").Contains(search.CustomerPhone));
            if (search.FromDate.HasValue) query = query.Where(o => o.OrderDate >= search.FromDate.Value);
            if (search.ToDate.HasValue) query = query.Where(o => o.OrderDate <= search.ToDate.Value);

            query = (search.SortBy ?? "newest").ToLower() switch
            {
                "oldest" => query.OrderBy(o => o.OrderDate),
                "totaldesc" or "total_desc" => query.OrderByDescending(o => o.TotalAmount),
                "totalasc" or "total_asc" => query.OrderBy(o => o.TotalAmount),
                _ => query.OrderByDescending(o => o.OrderDate),
            };

            var total = query.Count();
            var items = query.Skip((Math.Max(1, search.Page) - 1) * Math.Clamp(search.PageSize, 1, 100))
                .Take(Math.Clamp(search.PageSize, 1, 100))
                .ToList();
            return Task.FromResult((items, total));
        }

        public Task<decimal> GetDefaultShippingFeeAsync(decimal fallback = 30000m) => Task.FromResult(fallback);

        public Task<T> ExecuteInTransactionAsync<T>(Func<Task<T>> action) => action();
    }

    public class DemoOrderDetailRepository : DemoRepositoryBase<OrderDetail>, IOrderDetailRepositoryEF
    {
        public DemoOrderDetailRepository(DemoStore store) : base(store, store.OrderDetails) { }

        protected override bool MatchId(OrderDetail entity, object id) => entity.Id == Convert.ToInt32(id);
        protected override void SetIdIfNeeded(OrderDetail entity)
        {
            if (entity.Id == 0) entity.Id = Store.NextOrderDetailId;
        }

        public Task<List<OrderDetail>> GetByOrderAsync(int orderId)
        {
            var details = Store.OrderDetails.Where(x => x.OrderId == orderId).ToList();
            foreach (var detail in details)
            {
                detail.Product = Store.Products.FirstOrDefault(p => p.Id == detail.ProductId);
            }
            return Task.FromResult(details);
        }
    }

    public class DemoOrderTimelineRepository : DemoRepositoryBase<OrderTimeline>, IOrderTimelineRepositoryEF
    {
        public DemoOrderTimelineRepository(DemoStore store) : base(store, store.OrderTimelines) { }
        protected override bool MatchId(OrderTimeline entity, object id) => entity.Id == Convert.ToInt32(id);
        protected override void SetIdIfNeeded(OrderTimeline entity)
        {
            if (entity.Id == 0) entity.Id = Store.NextOrderTimelineId;
        }

        public Task<List<OrderTimeline>> GetByOrderAsync(int orderId) =>
            Task.FromResult(Store.OrderTimelines.Where(x => x.OrderId == orderId).OrderBy(x => x.CreatedAt).ThenBy(x => x.Id).ToList());
    }

    public class DemoOrderCancellationRepository : DemoRepositoryBase<OrderCancellation>, IOrderCancellationRepositoryEF
    {
        public DemoOrderCancellationRepository(DemoStore store) : base(store, store.OrderCancellations) { }
        protected override bool MatchId(OrderCancellation entity, object id) => entity.Id == Convert.ToInt32(id);
        protected override void SetIdIfNeeded(OrderCancellation entity)
        {
            if (entity.Id == 0) entity.Id = Store.NextOrderCancellationId;
        }

        public Task<OrderCancellation?> GetPendingByOrderAsync(int orderId) =>
            Task.FromResult(Store.OrderCancellations.Where(x => x.OrderId == orderId && x.Status == "Pending").OrderByDescending(x => x.RequestedAt).FirstOrDefault());

        public Task<List<OrderCancellation>> GetByOrderAsync(int orderId) =>
            Task.FromResult(Store.OrderCancellations.Where(x => x.OrderId == orderId).OrderByDescending(x => x.RequestedAt).ToList());
    }

    public class DemoWarehouseRepository : DemoRepositoryBase<Warehouse>, IWarehouseRepositoryEF
    {
        public DemoWarehouseRepository(DemoStore store) : base(store, store.Warehouses) { }
        protected override bool MatchId(Warehouse entity, object id) => entity.Id == Convert.ToInt32(id);
        protected override void SetIdIfNeeded(Warehouse entity) { if (entity.Id == 0) entity.Id = Store.NextWarehouseId; }
        public Task<Warehouse?> GetDefaultAsync() => Task.FromResult(Store.Warehouses.OrderBy(x => x.Id).FirstOrDefault(x => x.IsActive));
    }

    public class DemoSupplierRepository : DemoRepositoryBase<Supplier>, ISupplierRepositoryEF
    {
        public DemoSupplierRepository(DemoStore store) : base(store, store.Suppliers) { }
        protected override bool MatchId(Supplier entity, object id) => entity.Id == Convert.ToInt32(id);
        protected override void SetIdIfNeeded(Supplier entity) { if (entity.Id == 0) entity.Id = Store.NextSupplierId; }
        public Task<Supplier?> GetDetailAsync(int id) => Task.FromResult(Store.Suppliers.FirstOrDefault(x => x.Id == id));
        public Task<Supplier?> GetByCodeAsync(string code) => Task.FromResult(Store.Suppliers.FirstOrDefault(x => string.Equals(x.Code, code?.Trim(), StringComparison.OrdinalIgnoreCase)));
        public Task<bool> IsUsedAsync(int id) => Task.FromResult(
            Store.Products.Any(x => x.SupplierId == id || x.BackupSupplierId == id) ||
            Store.GoodsReceipts.Any(x => x.SupplierId == id));
        public Task<(List<Supplier> Items, int TotalCount)> SearchAsync(SupplierSearchDto search)
        {
            IEnumerable<Supplier> query = Store.Suppliers;
            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                var keyword = search.Keyword.Trim().ToLower();
                query = query.Where(x =>
                    x.Name.ToLower().Contains(keyword) ||
                    x.Code.ToLower().Contains(keyword) ||
                    (x.Phone != null && x.Phone.ToLower().Contains(keyword)) ||
                    (x.Email != null && x.Email.ToLower().Contains(keyword)));
            }
            if (search.IsActive.HasValue) query = query.Where(x => x.IsActive == search.IsActive.Value);
            var total = query.Count();
            var page = Math.Max(1, search.Page);
            var pageSize = Math.Clamp(search.PageSize, 1, 100);
            var items = query.OrderBy(x => x.Name).Skip((page - 1) * pageSize).Take(pageSize).ToList();
            return Task.FromResult((items, total));
        }
    }

    public class DemoCategorySupplierRepository : DemoRepositoryBase<CategorySupplier>, ICategorySupplierRepositoryEF
    {
        public DemoCategorySupplierRepository(DemoStore store) : base(store, store.CategorySuppliers) { }
        protected override bool MatchId(CategorySupplier entity, object id) => entity.Id == Convert.ToInt32(id);
        protected override void SetIdIfNeeded(CategorySupplier entity) { if (entity.Id == 0) entity.Id = Store.NextCategorySupplierId; }

        public Task<List<CategorySupplier>> GetAllDetailAsync()
        {
            return Task.FromResult(Store.CategorySuppliers.Select(Attach).OrderBy(x => x.CategoryId).ThenBy(x => x.SortOrder).ToList());
        }

        public Task<List<CategorySupplier>> GetByCategoryAsync(int categoryId, bool activeOnly = true)
        {
            var query = Store.CategorySuppliers.Where(x => x.CategoryId == categoryId);
            if (activeOnly) query = query.Where(x => x.IsActive && (Store.Suppliers.FirstOrDefault(s => s.Id == x.SupplierId)?.IsActive ?? false));
            return Task.FromResult(query.Select(Attach).OrderBy(x => x.SortOrder).ToList());
        }

        public Task<bool> ExistsAsync(int categoryId, int supplierId) =>
            Task.FromResult(Store.CategorySuppliers.Any(x => x.CategoryId == categoryId && x.SupplierId == supplierId && x.IsActive));

        public Task<int> CountByCategoryAsync(int categoryId, int? excludingId = null)
        {
            var query = Store.CategorySuppliers.Where(x => x.CategoryId == categoryId && x.IsActive);
            if (excludingId.HasValue) query = query.Where(x => x.Id != excludingId.Value);
            return Task.FromResult(query.Count());
        }

        private CategorySupplier Attach(CategorySupplier item)
        {
            item.Category = Store.Categories.FirstOrDefault(x => x.Id == item.CategoryId);
            item.Supplier = Store.Suppliers.FirstOrDefault(x => x.Id == item.SupplierId);
            return item;
        }
    }

    public class DemoStockItemRepository : DemoRepositoryBase<StockItem>, IStockItemRepositoryEF
    {
        public DemoStockItemRepository(DemoStore store) : base(store, store.StockItems) { }
        protected override bool MatchId(StockItem entity, object id) => entity.Id == Convert.ToInt32(id);
        protected override void SetIdIfNeeded(StockItem entity) { if (entity.Id == 0) entity.Id = Store.NextStockItemId; }
        public Task<StockItem?> GetDetailAsync(int id) => Task.FromResult(Attach(Store.StockItems.FirstOrDefault(x => x.Id == id)));
        public Task<StockItem?> GetBySerialAsync(string serialOrImei) => Task.FromResult(Attach(Store.StockItems.FirstOrDefault(x => string.Equals(x.SerialOrImei, serialOrImei.Trim(), StringComparison.OrdinalIgnoreCase))));
        public Task<List<StockItem>> GetByIdsAsync(List<int> ids) => Task.FromResult(Store.StockItems.Where(x => ids.Contains(x.Id)).Select(Attach).Where(x => x != null).Cast<StockItem>().ToList());
        public Task<bool> AnySerialAsync(string serialOrImei) => Task.FromResult(Store.StockItems.Any(x => string.Equals(x.SerialOrImei, serialOrImei.Trim(), StringComparison.OrdinalIgnoreCase)));

        public Task<(List<StockItem> Items, int TotalCount)> SearchAsync(InventorySearchDto search)
        {
            var query = Store.StockItems.Select(Attach).Where(x => x != null).Cast<StockItem>().AsEnumerable();
            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                var keyword = search.Keyword.Trim().ToLower();
                query = query.Where(x => (x.Product?.Name ?? "").ToLower().Contains(keyword) || (x.Sku ?? "").ToLower().Contains(keyword) || x.SerialOrImei.ToLower().Contains(keyword) || (x.SupplierName ?? "").ToLower().Contains(keyword));
            }
            if (search.ProductId.HasValue) query = query.Where(x => x.ProductId == search.ProductId);
            if (search.VariantId.HasValue) query = query.Where(x => x.VariantId == search.VariantId);
            if (search.SupplierId.HasValue) query = query.Where(x => x.SupplierId == search.SupplierId);
            if (search.CategoryId.HasValue) query = query.Where(x => x.Product?.CategoryId == search.CategoryId);
            if (!string.IsNullOrWhiteSpace(search.Status)) query = query.Where(x => string.Equals(x.Status, search.Status, StringComparison.OrdinalIgnoreCase));
            if (search.WarehouseId.HasValue) query = query.Where(x => x.WarehouseId == search.WarehouseId);
            if (!string.IsNullOrWhiteSpace(search.SerialOrImei)) query = query.Where(x => x.SerialOrImei.Contains(search.SerialOrImei.Trim()));
            if (search.FromDate.HasValue) query = query.Where(x => x.ReceivedAt >= search.FromDate);
            if (search.ToDate.HasValue) query = query.Where(x => x.ReceivedAt <= search.ToDate);
            query = (search.SortBy ?? "newest").ToLower() switch
            {
                "oldest" => query.OrderBy(x => x.ReceivedAt),
                "productname" or "product_name" => query.OrderBy(x => x.Product?.Name),
                "status" => query.OrderBy(x => x.Status),
                _ => query.OrderByDescending(x => x.ReceivedAt)
            };
            var total = query.Count();
            var items = query.Skip((Math.Max(1, search.Page) - 1) * Math.Clamp(search.PageSize, 1, 100)).Take(Math.Clamp(search.PageSize, 1, 100)).ToList();
            return Task.FromResult((items, total));
        }

        public Task<(List<StockItem> Items, int TotalCount)> GetAgedAsync(AgedStockSearchDto search)
        {
            var cutoff = DateTime.UtcNow.AddDays(-Math.Max(0, search.MinDays));
            var query = Store.StockItems.Select(Attach).Where(x => x != null && x.Status == "InStock" && x.ReceivedAt <= cutoff).Cast<StockItem>();
            if (search.CategoryId.HasValue) query = query.Where(x => x.Product?.CategoryId == search.CategoryId);
            if (search.SupplierId.HasValue) query = query.Where(x => x.SupplierId == search.SupplierId);
            if (search.WarehouseId.HasValue) query = query.Where(x => x.WarehouseId == search.WarehouseId);
            var total = query.Count();
            var items = query.OrderBy(x => x.ReceivedAt).Skip((Math.Max(1, search.Page) - 1) * Math.Clamp(search.PageSize, 1, 100)).Take(Math.Clamp(search.PageSize, 1, 100)).ToList();
            return Task.FromResult((items, total));
        }

        private StockItem? Attach(StockItem? item)
        {
            if (item == null) return null;
            item.Product = Store.Products.FirstOrDefault(x => x.Id == item.ProductId);
            item.Variant = Store.ProductVariants.FirstOrDefault(x => x.Id == item.VariantId);
            item.Supplier = Store.Suppliers.FirstOrDefault(x => x.Id == item.SupplierId);
            item.Warehouse = Store.Warehouses.FirstOrDefault(x => x.Id == item.WarehouseId);
            item.Order = Store.Orders.FirstOrDefault(x => x.Id == item.OrderId);
            return item;
        }
    }

    public class DemoGoodsReceiptRepository : DemoRepositoryBase<GoodsReceipt>, IGoodsReceiptRepositoryEF
    {
        public DemoGoodsReceiptRepository(DemoStore store) : base(store, store.GoodsReceipts) { }
        protected override bool MatchId(GoodsReceipt entity, object id) => entity.Id == Convert.ToInt32(id);
        protected override void SetIdIfNeeded(GoodsReceipt entity) { if (entity.Id == 0) entity.Id = Store.NextGoodsReceiptId; }
        public Task<GoodsReceipt?> GetDetailAsync(int id) => Task.FromResult(Attach(Store.GoodsReceipts.FirstOrDefault(x => x.Id == id)));

        public Task<(List<GoodsReceipt> Items, int TotalCount)> SearchAsync(InventorySearchDto search)
        {
            var query = Store.GoodsReceipts.Select(Attach).Where(x => x != null).Cast<GoodsReceipt>().AsEnumerable();
            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                var keyword = search.Keyword.Trim().ToLower();
                query = query.Where(x => x.ReceiptCode.ToLower().Contains(keyword) || x.SupplierName.ToLower().Contains(keyword));
            }
            if (search.WarehouseId.HasValue) query = query.Where(x => x.WarehouseId == search.WarehouseId);
            var total = query.Count();
            var items = query.OrderByDescending(x => x.ReceivedAt).Skip((Math.Max(1, search.Page) - 1) * Math.Clamp(search.PageSize, 1, 100)).Take(Math.Clamp(search.PageSize, 1, 100)).ToList();
            return Task.FromResult((items, total));
        }

        private GoodsReceipt? Attach(GoodsReceipt? receipt)
        {
            if (receipt == null) return null;
            receipt.Warehouse = Store.Warehouses.FirstOrDefault(x => x.Id == receipt.WarehouseId);
            receipt.Supplier = Store.Suppliers.FirstOrDefault(x => x.Id == receipt.SupplierId);
            receipt.Lines = Store.GoodsReceiptLines.Where(x => x.GoodsReceiptId == receipt.Id).ToList();
            foreach (var line in receipt.Lines)
            {
                line.Product = Store.Products.FirstOrDefault(x => x.Id == line.ProductId);
                line.Variant = Store.ProductVariants.FirstOrDefault(x => x.Id == line.VariantId);
                line.Serials = Store.GoodsReceiptSerials.Where(x => x.GoodsReceiptLineId == line.Id).ToList();
            }
            return receipt;
        }
    }

    public class DemoGoodsReceiptLineRepository : DemoRepositoryBase<GoodsReceiptLine>, IGoodsReceiptLineRepositoryEF
    {
        public DemoGoodsReceiptLineRepository(DemoStore store) : base(store, store.GoodsReceiptLines) { }
        protected override bool MatchId(GoodsReceiptLine entity, object id) => entity.Id == Convert.ToInt32(id);
        protected override void SetIdIfNeeded(GoodsReceiptLine entity) { if (entity.Id == 0) entity.Id = Store.NextGoodsReceiptLineId; }
    }

    public class DemoGoodsReceiptSerialRepository : DemoRepositoryBase<GoodsReceiptSerial>, IGoodsReceiptSerialRepositoryEF
    {
        public DemoGoodsReceiptSerialRepository(DemoStore store) : base(store, store.GoodsReceiptSerials) { }
        protected override bool MatchId(GoodsReceiptSerial entity, object id) => entity.Id == Convert.ToInt32(id);
        protected override void SetIdIfNeeded(GoodsReceiptSerial entity) { if (entity.Id == 0) entity.Id = Store.NextGoodsReceiptSerialId; }
    }

    public class DemoStockMovementRepository : DemoRepositoryBase<StockMovement>, IStockMovementRepositoryEF
    {
        public DemoStockMovementRepository(DemoStore store) : base(store, store.StockMovements) { }
        protected override bool MatchId(StockMovement entity, object id) => entity.Id == Convert.ToInt32(id);
        protected override void SetIdIfNeeded(StockMovement entity) { if (entity.Id == 0) entity.Id = Store.NextStockMovementId; }
        public Task<(List<StockMovement> Items, int TotalCount)> SearchAsync(InventorySearchDto search)
        {
            var query = Store.StockMovements.AsEnumerable();
            if (search.ProductId.HasValue) query = query.Where(x => x.ProductId == search.ProductId);
            if (search.VariantId.HasValue) query = query.Where(x => x.VariantId == search.VariantId);
            if (search.WarehouseId.HasValue) query = query.Where(x => x.WarehouseId == search.WarehouseId);
            var total = query.Count();
            var items = query.OrderByDescending(x => x.CreatedAt).Skip((Math.Max(1, search.Page) - 1) * Math.Clamp(search.PageSize, 1, 100)).Take(Math.Clamp(search.PageSize, 1, 100)).ToList();
            foreach (var item in items)
            {
                item.Product = Store.Products.FirstOrDefault(x => x.Id == item.ProductId);
                item.Variant = Store.ProductVariants.FirstOrDefault(x => x.Id == item.VariantId);
                item.Warehouse = Store.Warehouses.FirstOrDefault(x => x.Id == item.WarehouseId);
            }
            return Task.FromResult((items, total));
        }
    }

    public class DemoInventoryReturnRepository : DemoRepositoryBase<InventoryReturn>, IInventoryReturnRepositoryEF
    {
        public DemoInventoryReturnRepository(DemoStore store) : base(store, store.InventoryReturns) { }
        protected override bool MatchId(InventoryReturn entity, object id) => entity.Id == Convert.ToInt32(id);
        protected override void SetIdIfNeeded(InventoryReturn entity) { if (entity.Id == 0) entity.Id = Store.NextInventoryReturnId; }
        public Task<InventoryReturn?> GetDetailAsync(int id) => Task.FromResult(Attach(Store.InventoryReturns.FirstOrDefault(x => x.Id == id)));

        public Task<(List<InventoryReturn> Items, int TotalCount)> SearchAsync(InventoryReturnSearchDto search)
        {
            var query = Store.InventoryReturns.Select(Attach).Where(x => x != null).Cast<InventoryReturn>().AsEnumerable();
            if (!string.IsNullOrWhiteSpace(search.Status)) query = query.Where(x => string.Equals(x.Status, search.Status, StringComparison.OrdinalIgnoreCase));
            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                var keyword = search.Keyword.Trim().ToLower();
                query = query.Where(x => x.ReturnCode.ToLower().Contains(keyword) || (x.SerialOrImei ?? "").ToLower().Contains(keyword) || (x.CustomerName ?? "").ToLower().Contains(keyword));
            }
            var total = query.Count();
            var items = query.OrderByDescending(x => x.CreatedAt).Skip((Math.Max(1, search.Page) - 1) * Math.Clamp(search.PageSize, 1, 100)).Take(Math.Clamp(search.PageSize, 1, 100)).ToList();
            return Task.FromResult((items, total));
        }

        private InventoryReturn? Attach(InventoryReturn? item)
        {
            if (item == null) return null;
            item.Product = Store.Products.FirstOrDefault(x => x.Id == item.ProductId);
            item.Variant = Store.ProductVariants.FirstOrDefault(x => x.Id == item.VariantId);
            item.StockItem = Store.StockItems.FirstOrDefault(x => x.Id == item.StockItemId);
            return item;
        }
    }

    public class DemoOrderDetailStockItemRepository : DemoRepositoryBase<OrderDetailStockItem>, IOrderDetailStockItemRepositoryEF
    {
        public DemoOrderDetailStockItemRepository(DemoStore store) : base(store, store.OrderDetailStockItems) { }
        protected override bool MatchId(OrderDetailStockItem entity, object id) => entity.Id == Convert.ToInt32(id);
        protected override void SetIdIfNeeded(OrderDetailStockItem entity) { if (entity.Id == 0) entity.Id = Store.NextOrderDetailStockItemId; }
        public Task<bool> AnyByStockItemAsync(int stockItemId) => Task.FromResult(Store.OrderDetailStockItems.Any(x => x.StockItemId == stockItemId));
    }
}
