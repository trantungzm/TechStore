using Microsoft.EntityFrameworkCore;
using BaseCore.Entities;
using BaseCore.DTO.Store;

namespace BaseCore.Repository.EFCore
{
    /// <summary>
    /// Order Repository using Entity Framework Core
    /// </summary>
    public interface IOrderRepositoryEF : IRepository<Order>
    {
        Task<List<Order>> GetByUserAsync(Guid userId);
        Task<Order?> GetWithDetailsAsync(int orderId);
        Task<(List<Order> Orders, int TotalCount)> SearchAsync(OrderSearchDto search);
    }

    public class OrderRepositoryEF : Repository<Order>, IOrderRepositoryEF
    {
        public OrderRepositoryEF(AppDbContext context) : base(context)
        {
        }

        public async Task<List<Order>> GetByUserAsync(Guid userId)
        {
            return await _dbSet
                .Where(o => o.UserId == userId)
                .Include(o => o.OrderDetails)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }

        public async Task<Order?> GetWithDetailsAsync(int orderId)
        {
            return await _dbSet
                .Include(o => o.OrderDetails)
                .Include(o => o.Timelines)
                .Include(o => o.Cancellations)
                .FirstOrDefaultAsync(o => o.Id == orderId);
        }

        public async Task<(List<Order> Orders, int TotalCount)> SearchAsync(OrderSearchDto search)
        {
            var query = _dbSet.Include(o => o.OrderDetails).AsQueryable();

            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                var keyword = search.Keyword.Trim().ToLower();
                query = query.Where(o =>
                    (o.OrderCode != null && o.OrderCode.ToLower().Contains(keyword)) ||
                    (o.CustomerName != null && o.CustomerName.ToLower().Contains(keyword)) ||
                    (o.CustomerPhone != null && o.CustomerPhone.ToLower().Contains(keyword)) ||
                    (o.CustomerEmail != null && o.CustomerEmail.ToLower().Contains(keyword)));
            }

            if (!string.IsNullOrWhiteSpace(search.Status))
            {
                var status = search.Status.Trim().ToLower();
                query = query.Where(o => o.Status != null && o.Status.ToLower() == status);
            }

            if (!string.IsNullOrWhiteSpace(search.PaymentStatus))
            {
                var status = search.PaymentStatus.Trim().ToLower();
                query = query.Where(o => o.PaymentStatus != null && o.PaymentStatus.ToLower() == status);
            }

            if (!string.IsNullOrWhiteSpace(search.PaymentMethod))
            {
                var method = search.PaymentMethod.Trim().ToLower();
                query = query.Where(o => o.PaymentMethod != null && o.PaymentMethod.ToLower() == method);
            }

            if (!string.IsNullOrWhiteSpace(search.CustomerPhone))
            {
                var phone = search.CustomerPhone.Trim();
                query = query.Where(o => o.CustomerPhone != null && o.CustomerPhone.Contains(phone));
            }

            if (search.FromDate.HasValue) query = query.Where(o => o.OrderDate >= search.FromDate.Value);
            if (search.ToDate.HasValue) query = query.Where(o => o.OrderDate <= search.ToDate.Value);

            var totalCount = await query.CountAsync();

            query = (search.SortBy ?? "newest").ToLower() switch
            {
                "oldest" => query.OrderBy(o => o.OrderDate).ThenBy(o => o.Id),
                "totaldesc" or "total_desc" => query.OrderByDescending(o => o.TotalAmount),
                "totalasc" or "total_asc" => query.OrderBy(o => o.TotalAmount),
                _ => query.OrderByDescending(o => o.OrderDate).ThenByDescending(o => o.Id),
            };

            var page = Math.Max(1, search.Page);
            var pageSize = Math.Clamp(search.PageSize, 1, 100);
            var orders = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            return (orders, totalCount);
        }
    }

    /// <summary>
    /// OrderDetail Repository using Entity Framework Core
    /// </summary>
    public interface IOrderDetailRepositoryEF : IRepository<OrderDetail>
    {
        Task<List<OrderDetail>> GetByOrderAsync(int orderId);
    }

    public class OrderDetailRepositoryEF : Repository<OrderDetail>, IOrderDetailRepositoryEF
    {
        public OrderDetailRepositoryEF(AppDbContext context) : base(context)
        {
        }

        public async Task<List<OrderDetail>> GetByOrderAsync(int orderId)
        {
            return await _dbSet
                .Where(od => od.OrderId == orderId)
                .Include(od => od.Product)
                .ToListAsync();
        }
    }

    public interface IOrderTimelineRepositoryEF : IRepository<OrderTimeline>
    {
        Task<List<OrderTimeline>> GetByOrderAsync(int orderId);
    }

    public class OrderTimelineRepositoryEF : Repository<OrderTimeline>, IOrderTimelineRepositoryEF
    {
        public OrderTimelineRepositoryEF(AppDbContext context) : base(context)
        {
        }

        public async Task<List<OrderTimeline>> GetByOrderAsync(int orderId)
        {
            return await _dbSet
                .Where(x => x.OrderId == orderId)
                .OrderBy(x => x.CreatedAt)
                .ThenBy(x => x.Id)
                .ToListAsync();
        }
    }

    public interface IOrderCancellationRepositoryEF : IRepository<OrderCancellation>
    {
        Task<OrderCancellation?> GetPendingByOrderAsync(int orderId);
        Task<List<OrderCancellation>> GetByOrderAsync(int orderId);
    }

    public class OrderCancellationRepositoryEF : Repository<OrderCancellation>, IOrderCancellationRepositoryEF
    {
        public OrderCancellationRepositoryEF(AppDbContext context) : base(context)
        {
        }

        public async Task<OrderCancellation?> GetPendingByOrderAsync(int orderId)
        {
            return await _dbSet
                .Where(x => x.OrderId == orderId && x.Status == "Pending")
                .OrderByDescending(x => x.RequestedAt)
                .FirstOrDefaultAsync();
        }

        public async Task<List<OrderCancellation>> GetByOrderAsync(int orderId)
        {
            return await _dbSet
                .Where(x => x.OrderId == orderId)
                .OrderByDescending(x => x.RequestedAt)
                .ToListAsync();
        }
    }
}
