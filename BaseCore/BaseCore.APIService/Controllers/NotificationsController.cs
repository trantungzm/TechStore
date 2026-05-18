using BaseCore.DTO.Support;
using BaseCore.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BaseCore.APIService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _service;
        public NotificationsController(INotificationService service) => _service = service;

        [HttpGet("my")]
        public async Task<IActionResult> My([FromQuery] NotificationSearchDto search)
        {
            var userId = CurrentUserId();
            if (!userId.HasValue) return Unauthorized();
            var result = await _service.GetMyAsync(userId.Value, search);
            var size = Math.Clamp(search.PageSize, 1, 100);
            return Ok(new { items = result.Items, totalCount = result.TotalCount, page = Math.Max(1, search.Page), pageSize = size, totalPages = (int)Math.Ceiling(result.TotalCount / (double)size) });
        }

        [HttpGet("my/unread-count")]
        public async Task<IActionResult> Count()
        {
            var userId = CurrentUserId();
            return userId.HasValue ? Ok(new UnreadNotificationCountDto { Count = await _service.CountUnreadAsync(userId.Value) }) : Unauthorized();
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> Read(int id)
        {
            var userId = CurrentUserId();
            if (!userId.HasValue) return Unauthorized();
            var item = await _service.MarkReadAsync(id, userId.Value);
            return item == null ? NotFound(new { message = "Thong bao khong ton tai." }) : Ok(item);
        }

        [HttpPut("my/read-all")]
        public async Task<IActionResult> ReadAll()
        {
            var userId = CurrentUserId();
            if (!userId.HasValue) return Unauthorized();
            await _service.MarkAllReadAsync(userId.Value);
            return Ok(new { success = true });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = CurrentUserId();
            if (!userId.HasValue) return Unauthorized();
            return await _service.DeleteAsync(id, userId.Value) ? NoContent() : NotFound(new { message = "Thong bao khong ton tai." });
        }

        private Guid? CurrentUserId()
        {
            var raw = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
            return Guid.TryParse(raw, out var value) ? value : null;
        }
    }
}
