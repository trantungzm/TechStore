using BaseCore.DTO.Support;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;

namespace BaseCore.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepositoryEF _repository;

        public NotificationService(INotificationRepositoryEF repository)
        {
            _repository = repository;
        }

        public async Task CreateAsync(Guid? userId, string title, string message, string type, string referenceType, int? referenceId)
        {
            if (!userId.HasValue) return;
            await _repository.AddAsync(new Notification
            {
                UserId = userId,
                Title = title,
                Message = message,
                Type = type,
                ReferenceType = referenceType,
                ReferenceId = referenceId,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });
        }

        public async Task<(List<NotificationDto> Items, int TotalCount)> GetMyAsync(Guid userId, NotificationSearchDto search)
        {
            var result = await _repository.GetByUserAsync(userId, search);
            return (result.Items.Select(ToDto).ToList(), result.TotalCount);
        }

        public Task<int> CountUnreadAsync(Guid userId) => _repository.CountUnreadAsync(userId);

        public async Task<NotificationDto?> MarkReadAsync(int id, Guid userId)
        {
            var item = await _repository.GetByIdAsync(id);
            if (item == null || item.UserId != userId) return null;
            item.IsRead = true;
            item.ReadAt = DateTime.UtcNow;
            await _repository.UpdateAsync(item);
            return ToDto(item);
        }

        public async Task MarkAllReadAsync(Guid userId)
        {
            var items = await _repository.GetUnreadByUserAsync(userId);
            foreach (var item in items)
            {
                item.IsRead = true;
                item.ReadAt = DateTime.UtcNow;
                await _repository.UpdateAsync(item);
            }
        }

        public async Task<bool> DeleteAsync(int id, Guid userId)
        {
            var item = await _repository.GetByIdAsync(id);
            if (item == null || item.UserId != userId) return false;
            await _repository.DeleteAsync(item);
            return true;
        }

        private static NotificationDto ToDto(Notification item) => new()
        {
            Id = item.Id,
            UserId = item.UserId,
            Title = item.Title,
            Message = item.Message,
            Type = item.Type,
            ReferenceType = item.ReferenceType,
            ReferenceId = item.ReferenceId,
            IsRead = item.IsRead,
            CreatedAt = item.CreatedAt,
            ReadAt = item.ReadAt
        };
    }
}
