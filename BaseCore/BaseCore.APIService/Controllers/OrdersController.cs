using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BaseCore.DTO.Store;
using BaseCore.Services;
using System.Security.Claims;

namespace BaseCore.APIService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Create([FromBody] CreateOrderDto dto)
        {
            var userId = CurrentUserId();
            var order = await _orderService.CreateOrderAsync(userId, dto);
            return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetOrders([FromQuery] OrderSearchDto search)
        {
            if (User.IsInRole("Admin"))
            {
                var result = await _orderService.GetAllOrdersAsync(search);
                return Ok(new
                {
                    items = result.Orders,
                    totalCount = result.TotalCount,
                    page = Math.Max(1, search.Page),
                    pageSize = Math.Clamp(search.PageSize, 1, 100),
                    totalPages = (int)Math.Ceiling(result.TotalCount / (double)Math.Clamp(search.PageSize, 1, 100))
                });
            }

            var userId = CurrentUserId();
            if (!userId.HasValue) return Unauthorized();
            return Ok(await _orderService.GetOrdersByUserIdAsync(userId.Value));
        }

        [HttpGet("my")]
        [Authorize]
        public async Task<IActionResult> GetMyOrders()
        {
            var userId = CurrentUserId();
            if (!userId.HasValue) return Unauthorized();
            return Ok(await _orderService.GetOrdersByUserIdAsync(userId.Value));
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllOrders([FromQuery] OrderSearchDto search)
        {
            var result = await _orderService.GetAllOrdersAsync(search);
            return Ok(result.Orders);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            var order = await _orderService.GetOrderWithDetailsAsync(id);
            if (order == null) return NotFound(new { message = "Order not found" });
            return Ok(order);
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateOrderStatusDto dto)
        {
            var order = await _orderService.UpdateStatusAsync(id, dto, CurrentUserId());
            if (order == null) return NotFound(new { message = "Order not found" });
            return Ok(order);
        }

        [HttpPut("{id}/cancel")]
        [Authorize]
        public async Task<IActionResult> CancelOrder(int id, [FromBody] RequestCancelOrderDto? dto)
        {
            var order = await _orderService.CancelOrderAsync(id, dto?.Reason, CurrentUserId());
            if (order == null) return NotFound(new { message = "Order not found" });
            return Ok(order);
        }

        [HttpPut("{id}/cancellation-review")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ReviewCancellation(int id, [FromBody] ReviewCancelOrderDto dto)
        {
            var order = await _orderService.ReviewCancellationAsync(id, dto, CurrentUserId());
            if (order == null) return NotFound(new { message = "Order not found" });
            return Ok(order);
        }

        [HttpGet("{id}/timeline")]
        [Authorize]
        public async Task<IActionResult> GetTimeline(int id)
        {
            return Ok(await _orderService.GetTimelineAsync(id));
        }

        private Guid? CurrentUserId()
        {
            var raw = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                      User.FindFirst("sub")?.Value ??
                      User.FindFirst("id")?.Value;
            return Guid.TryParse(raw, out var value) ? value : null;
        }
    }
}
