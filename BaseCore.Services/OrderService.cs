using BaseCore.DTO.Store;
using BaseCore.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BaseCore.Repository.EFCore;

namespace BaseCore.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepositoryEF _orderRepository;
        private readonly IOrderDetailRepositoryEF _orderDetailRepository;
        private readonly IProductRepositoryEF _productRepository;

        public OrderService(
            IOrderRepositoryEF orderRepository,
            IOrderDetailRepositoryEF orderDetailRepository,
            IProductRepositoryEF productRepository)
        {
            _orderRepository = orderRepository;
            _orderDetailRepository = orderDetailRepository;
            _productRepository = productRepository;
        }

        public async Task<List<Order>> GetOrdersByUserIdAsync(Guid userId)
        {
            return await _orderRepository.GetByUserAsync(userId);
        }

        public async Task<List<Order>> GetAllOrdersAsync()
        {
            var orders = await _orderRepository.GetAllAsync();
            return orders.OrderByDescending(o => o.OrderDate).ToList();
        }

        public async Task<(Order Order, List<OrderDetail> Details)?> GetOrderWithDetailsAsync(int id)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null) return null;
            var details = await _orderDetailRepository.GetByOrderAsync(id);
            return (order, details);
        }

        public async Task<(Order Order, List<OrderDetail> Details)> CreateOrderAsync(Guid userId, CreateOrderDto dto)
        {
            var items = dto.Items ?? new List<OrderItemDto>();
            if (items.Count == 0)
            {
                throw new InvalidOperationException("Order items are required");
            }

            decimal totalAmount = 0;
            var details = new List<OrderDetail>();
            var productsToUpdate = new List<Product>();

            foreach (var item in items)
            {
                if (item.Quantity <= 0)
                {
                    throw new InvalidOperationException("Quantity must be greater than 0");
                }

                var product = await _productRepository.GetByIdAsync(item.ProductId);
                if (product == null)
                {
                    throw new InvalidOperationException($"Product {item.ProductId} not found");
                }

                if (product.Stock < item.Quantity)
                {
                    throw new InvalidOperationException($"Insufficient stock for {product.Name}");
                }

                product.Stock -= item.Quantity;
                productsToUpdate.Add(product);

                totalAmount += product.Price * item.Quantity;
                details.Add(new OrderDetail
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price
                });
            }

            foreach (var product in productsToUpdate)
            {
                await _productRepository.UpdateAsync(product);
            }

            var order = new Order
            {
                UserId = userId,
                OrderDate = DateTime.UtcNow,
                TotalAmount = totalAmount,
                Status = "Pending",
                ShippingAddress = dto.ShippingAddress ?? string.Empty
            };

            await _orderRepository.AddAsync(order);

            foreach (var detail in details)
            {
                detail.OrderId = order.Id;
                await _orderDetailRepository.AddAsync(detail);
            }

            return (order, details);
        }

        public async Task<Order?> UpdateStatusAsync(int id, string status)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null) return null;
            order.Status = status;
            await _orderRepository.UpdateAsync(order);
            return order;
        }

        public async Task<(Order Order, List<OrderDetail> Details)?> CancelOrderAsync(int id, string? reason)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null) return null;

            if (string.Equals(order.Status, "Completed", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Cannot cancel completed order");
            }

            var details = await _orderDetailRepository.GetByOrderAsync(id);
            foreach (var detail in details)
            {
                var product = await _productRepository.GetByIdAsync(detail.ProductId);
                if (product != null)
                {
                    product.Stock += detail.Quantity;
                    await _productRepository.UpdateAsync(product);
                }
            }

            order.Status = "Cancelled";
            await _orderRepository.UpdateAsync(order);

            var updatedDetails = await _orderDetailRepository.GetByOrderAsync(id);
            return (order, updatedDetails);
        }
    }
}
