using BaseCore.Entities;
using BaseCore.DTO.Store;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BaseCore.Services
{
    public interface IOrderService
    {
        Task<List<Order>> GetOrdersByUserIdAsync(System.Guid userId);
        Task<List<Order>> GetAllOrdersAsync();
        Task<(Order Order, List<OrderDetail> Details)?> GetOrderWithDetailsAsync(int id);
        Task<(Order Order, List<OrderDetail> Details)> CreateOrderAsync(System.Guid userId, CreateOrderDto dto);
        Task<Order?> UpdateStatusAsync(int id, string status);
        Task<(Order Order, List<OrderDetail> Details)?> CancelOrderAsync(int id, string? reason);
    }
}
