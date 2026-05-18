using BaseCore.DTO.Support;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;

namespace BaseCore.Services
{
    public class TicketService : ITicketService
    {
        private readonly ISupportTicketRepositoryEF _ticketRepository;
        private readonly ISupportTicketUpdateRepositoryEF _updateRepository;
        private readonly INotificationService _notificationService;

        public TicketService(ISupportTicketRepositoryEF ticketRepository, ISupportTicketUpdateRepositoryEF updateRepository, INotificationService notificationService)
        {
            _ticketRepository = ticketRepository;
            _updateRepository = updateRepository;
            _notificationService = notificationService;
        }

        public async Task<List<SupportTicketDto>> GetMyAsync(Guid userId) => (await _ticketRepository.GetByUserAsync(userId)).Select(ToDto).ToList();

        public async Task<(List<SupportTicketDto> Items, int TotalCount)> GetAllAsync(SupportSearchDto search)
        {
            var result = await _ticketRepository.SearchAsync(search);
            return (result.Items.Select(ToDto).ToList(), result.TotalCount);
        }

        public async Task<SupportTicketDto?> GetAsync(int id)
        {
            var item = await _ticketRepository.GetDetailAsync(id);
            return item == null ? null : ToDto(item);
        }

        public async Task<SupportTicketDto> CreateAsync(CreateSupportTicketDto dto, Guid? userId)
        {
            ValidateCreate(dto, userId);
            var now = DateTime.UtcNow;
            var ticket = await _ticketRepository.AddAsync(new SupportTicket
            {
                UserId = userId,
                Subject = dto.Subject!.Trim(),
                Description = dto.Description!.Trim(),
                CustomerName = dto.CustomerName?.Trim(),
                CustomerPhone = dto.CustomerPhone?.Trim(),
                CustomerEmail = dto.CustomerEmail?.Trim(),
                RelatedOrderId = dto.RelatedOrderId,
                RelatedProductId = dto.RelatedProductId,
                SerialOrImei = dto.SerialOrImei?.Trim(),
                Status = "Open",
                Priority = NormalizePriority(dto.Priority),
                Category = NormalizeCategory(dto.Category),
                CreatedAt = now
            });
            ticket.TicketCode = $"TK-{now:yyyyMMdd}-{ticket.Id:0000}";
            await _ticketRepository.UpdateAsync(ticket);
            await AddUpdate(ticket.Id, "Ticket da duoc tao", "Open", ticket.Priority, userId, false);
            await _notificationService.CreateAsync(userId, "Ticket da duoc tao", ticket.TicketCode, "Ticket", "Ticket", ticket.Id);
            return (await GetAsync(ticket.Id))!;
        }

        public async Task<SupportTicketUpdateDto> AddUpdateAsync(int id, CreateTicketUpdateDto dto, Guid? userId, bool isAdmin)
        {
            var ticket = await _ticketRepository.GetDetailAsync(id) ?? throw new InvalidOperationException("Ticket khong ton tai.");
            if (string.IsNullOrWhiteSpace(dto.Message)) throw new InvalidOperationException("Vui long nhap noi dung phan hoi.");
            if (!string.IsNullOrWhiteSpace(dto.StatusAfter)) ticket.Status = NormalizeStatus(dto.StatusAfter);
            if (!string.IsNullOrWhiteSpace(dto.PriorityAfter)) ticket.Priority = NormalizePriority(dto.PriorityAfter);
            ticket.UpdatedAt = DateTime.UtcNow;
            if (ticket.Status is "Closed" or "Resolved" or "Cancelled") ticket.ClosedAt = DateTime.UtcNow;
            await _ticketRepository.UpdateAsync(ticket);
            var update = await AddUpdate(ticket.Id, dto.Message.Trim(), ticket.Status, ticket.Priority, userId, dto.IsInternalNote && isAdmin);
            if (isAdmin && !update.IsInternalNote) await _notificationService.CreateAsync(ticket.UserId, "Ticket co phan hoi moi", ticket.TicketCode, "Ticket", "Ticket", ticket.Id);
            return ToUpdateDto(update);
        }

        public async Task<SupportTicketDto?> UpdateStatusAsync(int id, UpdateTicketStatusDto dto, Guid? userId)
        {
            var ticket = await _ticketRepository.GetDetailAsync(id);
            if (ticket == null) return null;
            ticket.Status = NormalizeStatus(dto.Status);
            ticket.UpdatedAt = DateTime.UtcNow;
            if (ticket.Status is "Closed" or "Resolved" or "Cancelled") ticket.ClosedAt = DateTime.UtcNow;
            await _ticketRepository.UpdateAsync(ticket);
            await AddUpdate(ticket.Id, dto.Note ?? $"Cap nhat trang thai {ticket.Status}", ticket.Status, ticket.Priority, userId, true);
            await _notificationService.CreateAsync(ticket.UserId, "Trang thai ticket da thay doi", ticket.TicketCode, "Ticket", "Ticket", ticket.Id);
            return await GetAsync(id);
        }

        public async Task<SupportTicketDto?> AssignAsync(int id, AssignTicketDto dto, Guid? userId)
        {
            var ticket = await _ticketRepository.GetDetailAsync(id);
            if (ticket == null) return null;
            ticket.AssignedToUserId = dto.AssignedToUserId;
            ticket.Status = ticket.Status == "Open" ? "InProgress" : ticket.Status;
            ticket.UpdatedAt = DateTime.UtcNow;
            await _ticketRepository.UpdateAsync(ticket);
            await AddUpdate(ticket.Id, dto.Note ?? "Ticket da duoc phan cong", ticket.Status, ticket.Priority, userId, true);
            return await GetAsync(id);
        }

        private async Task<SupportTicketUpdate> AddUpdate(int ticketId, string message, string? status, string? priority, Guid? userId, bool internalNote)
        {
            return await _updateRepository.AddAsync(new SupportTicketUpdate { TicketId = ticketId, Message = message, StatusAfter = status, PriorityAfter = priority, CreatedByUserId = userId, IsInternalNote = internalNote, CreatedAt = DateTime.UtcNow });
        }

        private static void ValidateCreate(CreateSupportTicketDto dto, Guid? userId)
        {
            if (string.IsNullOrWhiteSpace(dto.Subject)) throw new InvalidOperationException("Vui long nhap tieu de ticket.");
            if (string.IsNullOrWhiteSpace(dto.Description) || dto.Description.Trim().Length < 10) throw new InvalidOperationException("Vui long nhap mo ta toi thieu 10 ky tu.");
            if (!userId.HasValue && string.IsNullOrWhiteSpace(dto.CustomerPhone)) throw new InvalidOperationException("Vui long nhap so dien thoai.");
        }

        private static string NormalizePriority(string? value)
        {
            var allowed = new[] { "Low", "Normal", "High", "Urgent" };
            return allowed.FirstOrDefault(x => string.Equals(x, value, StringComparison.OrdinalIgnoreCase)) ?? "Normal";
        }
        private static string NormalizeCategory(string? value)
        {
            var allowed = new[] { "Order", "Warranty", "Product", "Payment", "Shipping", "Account", "Other" };
            return allowed.FirstOrDefault(x => string.Equals(x, value, StringComparison.OrdinalIgnoreCase)) ?? "Other";
        }
        private static string NormalizeStatus(string? value)
        {
            var allowed = new[] { "Open", "InProgress", "WaitingCustomer", "Resolved", "Closed", "Cancelled" };
            return allowed.FirstOrDefault(x => string.Equals(x, value, StringComparison.OrdinalIgnoreCase)) ?? throw new InvalidOperationException("Trang thai ticket khong hop le.");
        }
        private static SupportTicketDto ToDto(SupportTicket item) => new()
        {
            Id = item.Id, TicketCode = item.TicketCode, UserId = item.UserId, Subject = item.Subject, Description = item.Description, CustomerName = item.CustomerName, CustomerPhone = item.CustomerPhone, CustomerEmail = item.CustomerEmail, RelatedOrderId = item.RelatedOrderId, RelatedProductId = item.RelatedProductId, RelatedWarrantyId = item.RelatedWarrantyId, SerialOrImei = item.SerialOrImei, Status = item.Status, Priority = item.Priority, Category = item.Category, AssignedToUserId = item.AssignedToUserId, CreatedAt = item.CreatedAt, UpdatedAt = item.UpdatedAt, ClosedAt = item.ClosedAt, Updates = item.Updates.OrderBy(x => x.CreatedAt).Select(ToUpdateDto).ToList()
        };
        private static SupportTicketUpdateDto ToUpdateDto(SupportTicketUpdate item) => new() { Id = item.Id, TicketId = item.TicketId, Message = item.Message, StatusAfter = item.StatusAfter, PriorityAfter = item.PriorityAfter, CreatedByUserId = item.CreatedByUserId, IsInternalNote = item.IsInternalNote, CreatedAt = item.CreatedAt };
    }
}
