using BaseCore.Entities;
using BaseCore.DTO.Store;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BaseCore.Services
{
    public interface IOrderService
    {
        Task<List<OrderListDto>> GetOrdersByUserIdAsync(System.Guid userId);
        Task<(List<OrderListDto> Orders, int TotalCount)> GetAllOrdersAsync(OrderSearchDto search);
        Task<OrderDetailDto?> GetOrderWithDetailsAsync(int id);
        Task<bool> CanAccessOrderAsync(int id, System.Guid userId);
        Task<OrderDetailDto> CreateOrderAsync(System.Guid? userId, CreateOrderDto dto);
        Task<OrderDetailDto?> UpdateStatusAsync(int id, UpdateOrderStatusDto dto, System.Guid? updatedByUserId);
        Task<OrderDetailDto?> CancelOrderAsync(int id, string? reason, System.Guid? requestedByUserId);
        Task<OrderDetailDto?> ReviewCancellationAsync(int id, ReviewCancelOrderDto dto, System.Guid? reviewedByUserId);
        Task<List<OrderTimelineDto>> GetTimelineAsync(int id);
        Task<int> AutoCancelExpiredPickupOrdersAsync(int batchSize = 100);
    }
}
