using BaseCore.DTO.Support;
using BaseCore.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BaseCore.APIService.Controllers
{
    /// <summary>
    /// Controller quản lý thông báo cá nhân của người dùng.
    /// Thông báo được tạo từ các sự kiện trong hệ thống (đơn hàng, bảo hành, ticket...).
    /// Chỉ người dùng đã đăng nhập mới có thể xem/thao tác với thông báo của mình.
    /// Route: api/notifications
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Mọi endpoint đều yêu cầu đăng nhập vì thông báo là dữ liệu cá nhân.
    public class NotificationsController : ControllerBase
    {
        /// <summary>
        /// Service xử lý nghiệp vụ thông báo: tạo, đọc, xóa, đếm chưa đọc...
        /// </summary>
        private readonly INotificationService _service;

        /// <summary>
        /// Khởi tạo controller với dependency injection service thông báo.
        /// </summary>
        public NotificationsController(INotificationService service) => _service = service;

        /// <summary>
        /// Lấy danh sách thông báo của người dùng đang đăng nhập.
        /// - Hỗ trợ phân trang (page, pageSize) và tìm kiếm qua NotificationSearchDto.
        /// - Trả về kết quả dạng paged (items, totalCount, page, pageSize, totalPages).
        /// - Dùng cho icon chuông thông báo trên header và trang thông báo chi tiết.
        /// </summary>
        /// <param name="search">Tham số tìm kiếm/lọc và phân trang.</param>
        /// <returns>Danh sách thông báo phân trang.</returns>
        [HttpGet("my")]
        public async Task<IActionResult> My([FromQuery] NotificationSearchDto search)
        {
            var userId = CurrentUserId();
            if (!userId.HasValue) return Unauthorized();

            var result = await _service.GetMyAsync(userId.Value, search);
            var size = Math.Clamp(search.PageSize, 1, 100);
            return Ok(new
            {
                items = result.Items,
                totalCount = result.TotalCount,
                page = Math.Max(1, search.Page),
                pageSize = size,
                totalPages = (int)Math.Ceiling(result.TotalCount / (double)size)
            });
        }

        /// <summary>
        /// Đếm số thông báo chưa đọc của người dùng.
        /// - Dùng cho badge số trên icon chuông thông báo (header frontend).
        /// - Trả về UnreadNotificationCountDto với trường Count.
        /// </summary>
        /// <returns>Số lượng thông báo chưa đọc.</returns>
        [HttpGet("my/unread-count")]
        public async Task<IActionResult> Count()
        {
            var userId = CurrentUserId();
            return userId.HasValue
                ? Ok(new UnreadNotificationCountDto { Count = await _service.CountUnreadAsync(userId.Value) })
                : Unauthorized();
        }

        /// <summary>
        /// Đánh dấu một thông báo là đã đọc.
        /// - Khi người dùng nhấp vào thông báo, frontend gọi endpoint này.
        /// - Trả về 404 nếu thông báo không tồn tại hoặc không thuộc người dùng.
        /// </summary>
        /// <param name="id">Mã thông báo cần đánh dấu đã đọc.</param>
        /// <returns>Thông báo đã cập nhật trạng thái đã đọc.</returns>
        [HttpPut("{id}/read")]
        public async Task<IActionResult> Read(int id)
        {
            var userId = CurrentUserId();
            if (!userId.HasValue) return Unauthorized();

            var item = await _service.MarkReadAsync(id, userId.Value);
            return item == null
                ? NotFound(new { message = "Thong bao khong ton tai." })
                : Ok(item);
        }

        /// <summary>
        /// Đánh dấu tất cả thông báo là đã đọc.
        /// - Nút "Đánh dấu tất cả đã đọc" ở trang thông báo gọi endpoint này.
        /// - Xử lý hàng loạt trong service, trả về kết quả thành công.
        /// </summary>
        /// <returns>{ success: true } nếu thực hiện thành công.</returns>
        [HttpPut("my/read-all")]
        public async Task<IActionResult> ReadAll()
        {
            var userId = CurrentUserId();
            if (!userId.HasValue) return Unauthorized();

            await _service.MarkAllReadAsync(userId.Value);
            return Ok(new { success = true });
        }

        /// <summary>
        /// Xóa một thông báo.
        /// - Người dùng có thể xóa thông báo cá nhân khỏi danh sách.
        /// - Trả về 204 NoContent nếu xóa thành công, 404 nếu không tìm thấy.
        /// </summary>
        /// <param name="id">Mã thông báo cần xóa.</param>
        /// <returns>204 nếu thành công, 404 nếu không tồn tại.</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = CurrentUserId();
            if (!userId.HasValue) return Unauthorized();

            return await _service.DeleteAsync(id, userId.Value)
                ? NoContent()
                : NotFound(new { message = "Thong bao khong ton tai." });
        }

        /// <summary>
        /// Lấy mã người dùng hiện tại từ JWT claims.
        /// Hỗ trợ nhiều claim name khác nhau (NameIdentifier, sub, id) để tương thích
        /// với các hệ thống auth khác nhau.
        /// </summary>
        /// <returns>Guid? mã người dùng hoặc null nếu không xác định được.</returns>
        private Guid? CurrentUserId()
        {
            var raw = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                      ?? User.FindFirst("sub")?.Value
                      ?? User.FindFirst("id")?.Value;
            return Guid.TryParse(raw, out var value) ? value : null;
        }
    }
}
