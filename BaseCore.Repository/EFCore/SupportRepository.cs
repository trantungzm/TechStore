using BaseCore.DTO.Support;
using BaseCore.Entities;
using Microsoft.EntityFrameworkCore;

namespace BaseCore.Repository.EFCore
{
    public interface IWarrantyRecordRepositoryEF : IRepository<WarrantyRecord>
    {
        Task<bool> ExistsForOrderDetailAsync(int orderDetailId, int? stockItemId);
        Task<List<WarrantyRecord>> LookupAsync(string? serialOrImei, string? orderCode, string? phone);
        Task<List<WarrantyRecord>> GetByUserAsync(Guid userId);
        Task<List<WarrantyRecord>> GetUnassignedByOrderDetailAsync(int orderDetailId);
        Task<WarrantyRecord?> GetDetailAsync(int id);
        Task<(List<WarrantyRecord> Items, int TotalCount)> SearchAsync(SupportSearchDto search);
    }

    // Warranty record là "sổ bảo hành" của từng thiết bị bán ra; repository này phục vụ
    // cả lookup public lẫn màn admin warranty.
    public class WarrantyRecordRepositoryEF : Repository<WarrantyRecord>, IWarrantyRecordRepositoryEF
    {
        public WarrantyRecordRepositoryEF(AppDbContext context) : base(context) { }

        public Task<bool> ExistsForOrderDetailAsync(int orderDetailId, int? stockItemId)
        {
            return _dbSet.AnyAsync(x => x.OrderDetailId == orderDetailId && x.StockItemId == stockItemId);
        }

        // Lookup theo serial/order/phone đúng các kịch bản mà FE và form public đang hỗ trợ.
        public Task<List<WarrantyRecord>> LookupAsync(string? serialOrImei, string? orderCode, string? phone)
        {
            var query = DetailQuery();
            if (!string.IsNullOrWhiteSpace(serialOrImei))
            {
                var serial = serialOrImei.Trim().ToLower();
                query = query.Where(x => x.SerialOrImei != null && x.SerialOrImei.ToLower() == serial);
            }
            else if (!string.IsNullOrWhiteSpace(orderCode) && !string.IsNullOrWhiteSpace(phone))
            {
                var code = orderCode.Trim().ToLower();
                var p = phone.Trim();
                query = query.Where(x => x.Order != null && x.Order.OrderCode != null && x.Order.OrderCode.ToLower() == code && x.CustomerPhone == p);
            }
            else if (!string.IsNullOrWhiteSpace(phone))
            {
                var p = phone.Trim();
                query = query.Where(x => x.CustomerPhone == p);
            }
            else
            {
                query = query.Where(x => false);
            }
            return query.OrderByDescending(x => x.CreatedAt).ToListAsync();
        }

        public Task<List<WarrantyRecord>> GetByUserAsync(Guid userId)
        {
            return DetailQuery().Where(x => x.UserId == userId).OrderByDescending(x => x.CreatedAt).ToListAsync();
        }

        public Task<List<WarrantyRecord>> GetUnassignedByOrderDetailAsync(int orderDetailId)
        {
            return DetailQuery()
                .Where(x => x.OrderDetailId == orderDetailId && x.StockItemId == null && (x.SerialOrImei == null || x.SerialOrImei == ""))
                .OrderBy(x => x.CreatedAt)
                .ToListAsync();
        }

        public Task<WarrantyRecord?> GetDetailAsync(int id) => DetailQuery().FirstOrDefaultAsync(x => x.Id == id);

        // Search danh sách bảo hành cho màn admin warranty.
        public async Task<(List<WarrantyRecord> Items, int TotalCount)> SearchAsync(SupportSearchDto search)
        {
            var query = DetailQuery();
            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                var k = search.Keyword.Trim().ToLower();
                query = query.Where(x =>
                    x.WarrantyCode.ToLower().Contains(k) ||
                    (x.ProductName != null && x.ProductName.ToLower().Contains(k)) ||
                    (x.Product != null && x.Product.Name.ToLower().Contains(k)) ||
                    (x.CustomerName != null && x.CustomerName.ToLower().Contains(k)) ||
                    (x.CustomerPhone != null && x.CustomerPhone.Contains(k)) ||
                    (x.SerialOrImei != null && x.SerialOrImei.ToLower().Contains(k)) ||
                    (x.Order != null && x.Order.OrderCode != null && x.Order.OrderCode.ToLower().Contains(k))
                );
            }
            if (!string.IsNullOrWhiteSpace(search.Status)) query = query.Where(x => x.Status == search.Status.Trim());
            if (!string.IsNullOrWhiteSpace(search.Phone)) query = query.Where(x => x.CustomerPhone == search.Phone.Trim());
            if (!string.IsNullOrWhiteSpace(search.CustomerPhone)) query = query.Where(x => x.CustomerPhone == search.CustomerPhone.Trim());
            if (!string.IsNullOrWhiteSpace(search.SerialOrImei)) query = query.Where(x => x.SerialOrImei == search.SerialOrImei.Trim());
            if (search.FromDate.HasValue) query = query.Where(x => x.CreatedAt >= search.FromDate.Value);
            if (search.ToDate.HasValue) query = query.Where(x => x.CreatedAt <= search.ToDate.Value);

            var total = await query.CountAsync();
            var page = Math.Max(1, search.Page);
            var size = Math.Clamp(search.PageSize, 1, 100);
            var items = await query
                .OrderByDescending(x => x.CreatedAt)
                .Skip((page - 1) * size)
                .Take(size)
                .ToListAsync();
            return (items, total);
        }

        // Include order/order detail/product/variant/stock item để service có đủ dữ liệu map DTO.
        private IQueryable<WarrantyRecord> DetailQuery()
        {
            return _dbSet.Include(x => x.Order).Include(x => x.OrderDetail).Include(x => x.Product).Include(x => x.Variant).Include(x => x.StockItem);
        }
    }

    public interface IWarrantyClaimRepositoryEF : IRepository<WarrantyClaim>
    {
        Task<WarrantyClaim?> GetDetailAsync(int id);
        Task<List<WarrantyClaim>> GetByUserAsync(Guid userId, int? warrantyId);
        Task<(List<WarrantyClaim> Items, int TotalCount)> SearchAsync(SupportSearchDto search);
        Task<WarrantyClaim?> GetLatestByWarrantyAsync(int warrantyId);
    }

    // Repository claim bảo hành: cung cấp dữ liệu cho màn claims và luồng tạo repair case.
    public class WarrantyClaimRepositoryEF : Repository<WarrantyClaim>, IWarrantyClaimRepositoryEF
    {
        public WarrantyClaimRepositoryEF(AppDbContext context) : base(context) { }
        public Task<WarrantyClaim?> GetDetailAsync(int id) => DetailQuery().FirstOrDefaultAsync(x => x.Id == id);
        public Task<WarrantyClaim?> GetLatestByWarrantyAsync(int warrantyId) => _dbSet.Where(x => x.WarrantyId == warrantyId).OrderByDescending(x => x.CreatedAt).FirstOrDefaultAsync();
        public Task<List<WarrantyClaim>> GetByUserAsync(Guid userId, int? warrantyId)
        {
            var query = DetailQuery().Where(x => x.UserId == userId);
            if (warrantyId.HasValue) query = query.Where(x => x.WarrantyId == warrantyId.Value);
            return query.OrderByDescending(x => x.CreatedAt).ToListAsync();
        }

        // Search claim theo claim code, serial, customer, trạng thái, ưu tiên.
        public async Task<(List<WarrantyClaim> Items, int TotalCount)> SearchAsync(SupportSearchDto search)
        {
            var query = DetailQuery();
            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                var k = search.Keyword.Trim().ToLower();
                query = query.Where(x => x.ClaimCode.ToLower().Contains(k) || (x.Warranty != null && x.Warranty.WarrantyCode.ToLower().Contains(k)) || (x.Product != null && x.Product.Name.ToLower().Contains(k)) || (x.CustomerName != null && x.CustomerName.ToLower().Contains(k)) || (x.CustomerPhone != null && x.CustomerPhone.Contains(k)) || (x.SerialOrImei != null && x.SerialOrImei.ToLower().Contains(k)));
            }
            if (!string.IsNullOrWhiteSpace(search.Status)) query = query.Where(x => x.Status == search.Status.Trim());
            if (!string.IsNullOrWhiteSpace(search.Priority)) query = query.Where(x => x.Priority == search.Priority.Trim());
            if (!string.IsNullOrWhiteSpace(search.Phone)) query = query.Where(x => x.CustomerPhone == search.Phone.Trim());
            if (!string.IsNullOrWhiteSpace(search.SerialOrImei)) query = query.Where(x => x.SerialOrImei == search.SerialOrImei.Trim());
            if (search.FromDate.HasValue) query = query.Where(x => x.CreatedAt >= search.FromDate.Value);
            if (search.ToDate.HasValue) query = query.Where(x => x.CreatedAt <= search.ToDate.Value);
            return await Page(query, search);
        }

        // Query chi tiết claim kèm warranty, product, stock item và updates timeline.
        private IQueryable<WarrantyClaim> DetailQuery() => _dbSet.Include(x => x.Warranty).Include(x => x.Product).Include(x => x.Variant).Include(x => x.StockItem).Include(x => x.Updates);
        private static async Task<(List<WarrantyClaim>, int)> Page(IQueryable<WarrantyClaim> query, SupportSearchDto search)
        {
            var total = await query.CountAsync();
            var page = Math.Max(1, search.Page);
            var size = Math.Clamp(search.PageSize, 1, 100);
            return (await query.OrderByDescending(x => x.CreatedAt).Skip((page - 1) * size).Take(size).ToListAsync(), total);
        }
    }

    public interface IWarrantyClaimUpdateRepositoryEF : IRepository<WarrantyClaimUpdate>
    {
        Task<List<WarrantyClaimUpdate>> GetByClaimAsync(int claimId);
    }
    public class WarrantyClaimUpdateRepositoryEF : Repository<WarrantyClaimUpdate>, IWarrantyClaimUpdateRepositoryEF
    {
        public WarrantyClaimUpdateRepositoryEF(AppDbContext context) : base(context) { }
        public Task<List<WarrantyClaimUpdate>> GetByClaimAsync(int claimId) => _dbSet.Where(x => x.WarrantyClaimId == claimId).OrderBy(x => x.CreatedAt).ThenBy(x => x.Id).ToListAsync();
    }

    public interface IRepairCaseRepositoryEF : IRepository<RepairCase>
    {
        Task<RepairCase?> GetDetailAsync(int id);
        Task<RepairCase?> GetDetailByUserAsync(Guid userId, int id);
        Task<RepairCase?> GetByWarrantyClaimIdAsync(int warrantyClaimId);
        Task<(List<RepairCase> Items, int TotalCount)> SearchAsync(SupportSearchDto search);
        Task<(List<RepairCase> Items, int TotalCount)> SearchByUserAsync(Guid userId, SupportSearchDto search);
    }
    // Repair case là lớp nối giữa warranty claim, ticket và thiết bị thực tế ngoài kho.
    public class RepairCaseRepositoryEF : Repository<RepairCase>, IRepairCaseRepositoryEF
    {
        public RepairCaseRepositoryEF(AppDbContext context) : base(context) { }
        public Task<RepairCase?> GetDetailAsync(int id) => DetailQuery().FirstOrDefaultAsync(x => x.Id == id);
        public Task<RepairCase?> GetDetailByUserAsync(Guid userId, int id)
        {
            return DetailQuery()
                .Where(x => (x.WarrantyClaim != null && x.WarrantyClaim.UserId == userId) || (x.Ticket != null && x.Ticket.UserId == userId))
                .FirstOrDefaultAsync(x => x.Id == id);
        }
        public Task<RepairCase?> GetByWarrantyClaimIdAsync(int warrantyClaimId) => DetailQuery().FirstOrDefaultAsync(x => x.WarrantyClaimId == warrantyClaimId);
        // Search toàn bộ ca sửa chữa cho admin/technical.
        public async Task<(List<RepairCase> Items, int TotalCount)> SearchAsync(SupportSearchDto search)
        {
            var query = DetailQuery();
            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                var k = search.Keyword.Trim().ToLower();
                query = query.Where(x => x.RepairCode.ToLower().Contains(k) || (x.ProductName != null && x.ProductName.ToLower().Contains(k)) || (x.CustomerName != null && x.CustomerName.ToLower().Contains(k)) || (x.CustomerPhone != null && x.CustomerPhone.Contains(k)) || (x.SerialOrImei != null && x.SerialOrImei.ToLower().Contains(k)));
            }
            if (!string.IsNullOrWhiteSpace(search.Status)) query = query.Where(x => x.Status == search.Status.Trim());
            if (!string.IsNullOrWhiteSpace(search.Priority)) query = query.Where(x => x.Priority == search.Priority.Trim());
            if (search.TechnicianId.HasValue) query = query.Where(x => x.TechnicianId == search.TechnicianId);
            if (!string.IsNullOrWhiteSpace(search.SerialOrImei)) query = query.Where(x => x.SerialOrImei == search.SerialOrImei.Trim());
            if (!string.IsNullOrWhiteSpace(search.CustomerPhone)) query = query.Where(x => x.CustomerPhone == search.CustomerPhone.Trim());
            if (search.FromDate.HasValue) query = query.Where(x => x.CreatedAt >= search.FromDate.Value);
            if (search.ToDate.HasValue) query = query.Where(x => x.CreatedAt <= search.ToDate.Value);
            var total = await query.CountAsync();
            var page = Math.Max(1, search.Page);
            var size = Math.Clamp(search.PageSize, 1, 100);
            return (await query.OrderByDescending(x => x.CreatedAt).Skip((page - 1) * size).Take(size).ToListAsync(), total);
        }
        // Customer chỉ nhìn thấy các ca sửa chữa gắn với claim/ticket của chính mình.
        public async Task<(List<RepairCase> Items, int TotalCount)> SearchByUserAsync(Guid userId, SupportSearchDto search)
        {
            var query = DetailQuery().Where(x => (x.WarrantyClaim != null && x.WarrantyClaim.UserId == userId) || (x.Ticket != null && x.Ticket.UserId == userId));
            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                var k = search.Keyword.Trim().ToLower();
                query = query.Where(x => x.RepairCode.ToLower().Contains(k) || (x.ProductName != null && x.ProductName.ToLower().Contains(k)) || (x.SerialOrImei != null && x.SerialOrImei.ToLower().Contains(k)));
            }
            if (!string.IsNullOrWhiteSpace(search.Status)) query = query.Where(x => x.Status == search.Status.Trim());
            if (!string.IsNullOrWhiteSpace(search.SerialOrImei)) query = query.Where(x => x.SerialOrImei == search.SerialOrImei.Trim());
            if (!string.IsNullOrWhiteSpace(search.CustomerPhone)) query = query.Where(x => x.CustomerPhone == search.CustomerPhone.Trim());
            var total = await query.CountAsync();
            var page = Math.Max(1, search.Page);
            var size = Math.Clamp(search.PageSize, 1, 100);
            return (await query.OrderByDescending(x => x.CreatedAt).Skip((page - 1) * size).Take(size).ToListAsync(), total);
        }
        // Query chi tiết repair để service có thể đồng bộ ngược trạng thái giữa các module.
        private IQueryable<RepairCase> DetailQuery() => _dbSet.Include(x => x.WarrantyClaim).Include(x => x.Ticket).Include(x => x.StockItem).Include(x => x.Product).Include(x => x.Variant).Include(x => x.Updates);
    }

    public interface IRepairUpdateRepositoryEF : IRepository<RepairUpdate>
    {
        Task<List<RepairUpdate>> GetByRepairAsync(int repairId);
    }
    public class RepairUpdateRepositoryEF : Repository<RepairUpdate>, IRepairUpdateRepositoryEF
    {
        public RepairUpdateRepositoryEF(AppDbContext context) : base(context) { }
        public Task<List<RepairUpdate>> GetByRepairAsync(int repairId) => _dbSet.Where(x => x.RepairCaseId == repairId).OrderBy(x => x.CreatedAt).ThenBy(x => x.Id).ToListAsync();
    }

    public interface ISupportTicketRepositoryEF : IRepository<SupportTicket>
    {
        Task<SupportTicket?> GetDetailAsync(int id);
        Task<List<SupportTicket>> GetByUserAsync(Guid userId);
        Task<(List<SupportTicket> Items, int TotalCount)> SearchAsync(SupportSearchDto search);
    }
    // Repository ticket hỗ trợ, phục vụ cả storefront "ticket của tôi" và màn admin ticket.
    public class SupportTicketRepositoryEF : Repository<SupportTicket>, ISupportTicketRepositoryEF
    {
        public SupportTicketRepositoryEF(AppDbContext context) : base(context) { }
        public Task<SupportTicket?> GetDetailAsync(int id) => DetailQuery().FirstOrDefaultAsync(x => x.Id == id);
        public Task<List<SupportTicket>> GetByUserAsync(Guid userId) => DetailQuery().Where(x => x.UserId == userId).OrderByDescending(x => x.CreatedAt).ToListAsync();
        // Search ticket theo mã, tiêu đề, mô tả, khách hàng, serial và các cờ workflow.
        public async Task<(List<SupportTicket> Items, int TotalCount)> SearchAsync(SupportSearchDto search)
        {
            var query = DetailQuery();
            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                var k = search.Keyword.Trim().ToLower();
                query = query.Where(x => x.TicketCode.ToLower().Contains(k) || x.Subject.ToLower().Contains(k) || x.Description.ToLower().Contains(k) || (x.CustomerName != null && x.CustomerName.ToLower().Contains(k)) || (x.CustomerPhone != null && x.CustomerPhone.Contains(k)) || (x.SerialOrImei != null && x.SerialOrImei.ToLower().Contains(k)));
            }
            if (!string.IsNullOrWhiteSpace(search.Status)) query = query.Where(x => x.Status == search.Status.Trim());
            if (!string.IsNullOrWhiteSpace(search.Priority)) query = query.Where(x => x.Priority == search.Priority.Trim());
            if (!string.IsNullOrWhiteSpace(search.Category)) query = query.Where(x => x.Category == search.Category.Trim());
            if (search.AssignedToUserId.HasValue) query = query.Where(x => x.AssignedToUserId == search.AssignedToUserId);
            if (!string.IsNullOrWhiteSpace(search.CustomerPhone)) query = query.Where(x => x.CustomerPhone == search.CustomerPhone.Trim());
            if (search.RelatedProductId.HasValue) query = query.Where(x => x.RelatedProductId == search.RelatedProductId);
            if (!string.IsNullOrWhiteSpace(search.SerialOrImei)) query = query.Where(x => x.SerialOrImei == search.SerialOrImei.Trim());
            if (search.FromDate.HasValue) query = query.Where(x => x.CreatedAt >= search.FromDate.Value);
            if (search.ToDate.HasValue) query = query.Where(x => x.CreatedAt <= search.ToDate.Value);
            var total = await query.CountAsync();
            var page = Math.Max(1, search.Page);
            var size = Math.Clamp(search.PageSize, 1, 100);
            return (await query.OrderByDescending(x => x.CreatedAt).Skip((page - 1) * size).Take(size).ToListAsync(), total);
        }
        // Include các thực thể liên quan để FE hiển thị ticket trong bối cảnh đơn/bảo hành/sản phẩm.
        private IQueryable<SupportTicket> DetailQuery() => _dbSet.Include(x => x.RelatedOrder).Include(x => x.RelatedProduct).Include(x => x.RelatedWarranty).Include(x => x.Updates);
    }

    public interface ISupportTicketUpdateRepositoryEF : IRepository<SupportTicketUpdate>
    {
        Task<List<SupportTicketUpdate>> GetByTicketAsync(int ticketId, bool includeInternal);
    }
    // Bảng message/update của ticket, có hỗ trợ ẩn internal note với phía khách hàng.
    public class SupportTicketUpdateRepositoryEF : Repository<SupportTicketUpdate>, ISupportTicketUpdateRepositoryEF
    {
        public SupportTicketUpdateRepositoryEF(AppDbContext context) : base(context) { }
        public Task<List<SupportTicketUpdate>> GetByTicketAsync(int ticketId, bool includeInternal)
        {
            var query = _dbSet.Where(x => x.TicketId == ticketId);
            if (!includeInternal) query = query.Where(x => !x.IsInternalNote);
            return query.OrderBy(x => x.CreatedAt).ThenBy(x => x.Id).ToListAsync();
        }
    }

    public interface INotificationRepositoryEF : IRepository<Notification>
    {
        Task<(List<Notification> Items, int TotalCount)> GetByUserAsync(Guid userId, NotificationSearchDto search);
        Task<int> CountUnreadAsync(Guid userId);
        Task<List<Notification>> GetUnreadByUserAsync(Guid userId);
    }
    // Notification là tầng read model cho user biết đơn/ticket/bảo hành đã đổi trạng thái.
    public class NotificationRepositoryEF : Repository<Notification>, INotificationRepositoryEF
    {
        public NotificationRepositoryEF(AppDbContext context) : base(context) { }
        public async Task<(List<Notification> Items, int TotalCount)> GetByUserAsync(Guid userId, NotificationSearchDto search)
        {
            var query = _dbSet.Where(x => x.UserId == userId);
            if (search.UnreadOnly) query = query.Where(x => !x.IsRead);
            if (!string.IsNullOrWhiteSpace(search.Type)) query = query.Where(x => x.Type == search.Type.Trim());
            var total = await query.CountAsync();
            var page = Math.Max(1, search.Page);
            var size = Math.Clamp(search.PageSize, 1, 100);
            return (await query.OrderByDescending(x => x.CreatedAt).Skip((page - 1) * size).Take(size).ToListAsync(), total);
        }
        public Task<int> CountUnreadAsync(Guid userId) => _dbSet.CountAsync(x => x.UserId == userId && !x.IsRead);
        public Task<List<Notification>> GetUnreadByUserAsync(Guid userId) => _dbSet.Where(x => x.UserId == userId && !x.IsRead).ToListAsync();
    }

    public interface IAttachmentRepositoryEF : IRepository<Attachment> { }
    public class AttachmentRepositoryEF : Repository<Attachment>, IAttachmentRepositoryEF
    {
        public AttachmentRepositoryEF(AppDbContext context) : base(context) { }
    }
}
