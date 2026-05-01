using System.Linq.Expressions;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;

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
            var product = Store.Products.FirstOrDefault(x => x.Id == Convert.ToInt32(id));
            if (product != null) product.Category = Store.Categories.FirstOrDefault(c => c.Id == product.CategoryId);
            return Task.FromResult(product);
        }

        public override Task<IEnumerable<Product>> GetAllAsync()
        {
            foreach (var product in Store.Products)
            {
                product.Category = Store.Categories.FirstOrDefault(c => c.Id == product.CategoryId);
            }
            return Task.FromResult(Store.Products.AsEnumerable());
        }

        public Task<List<Product>> GetByCategoryAsync(int categoryId)
        {
            var products = Store.Products.Where(x => x.CategoryId == categoryId).ToList();
            foreach (var product in products)
            {
                product.Category = Store.Categories.FirstOrDefault(c => c.Id == product.CategoryId);
            }
            return Task.FromResult(products);
        }

        public Task<(List<Product> Products, int TotalCount)> SearchAsync(string? keyword, int? categoryId, int page, int pageSize)
        {
            IEnumerable<Product> query = Store.Products;

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var lowered = keyword.ToLower();
                query = query.Where(p => p.Name.ToLower().Contains(lowered) || (p.Description ?? string.Empty).ToLower().Contains(lowered));
            }

            if (categoryId.HasValue && categoryId.Value > 0)
            {
                query = query.Where(p => p.CategoryId == categoryId.Value);
            }

            var totalCount = query.Count();
            var items = query
                .OrderByDescending(p => p.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            foreach (var product in items)
            {
                product.Category = Store.Categories.FirstOrDefault(c => c.Id == product.CategoryId);
            }

            return Task.FromResult((items, totalCount));
        }
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
}
