using BaseCore.DTO.Support;
using BaseCore.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BaseCore.APIService.Controllers
{
    // Controller bảo hành phục vụ cả user-side lookup/claim và admin-side quản trị claim/warranty.
    [Route("api/[controller]")]
    [ApiController]
    public class WarrantyController : ControllerBase
    {
        private readonly IWarrantyService _service;
        public WarrantyController(IWarrantyService service) => _service = service;

        [HttpGet("lookup")]
        [AllowAnonymous]
        public async Task<IActionResult> Lookup([FromQuery] string? serialOrImei, [FromQuery] string? orderCode, [FromQuery] string? phone)
        {
            // Lookup công khai theo serial hoặc orderCode + phone ở màn Warranty người dùng.
            var result = await _service.LookupAsync(serialOrImei, orderCode, phone);
            return result.Found ? Ok(result) : NotFound(result);
        }

        [HttpGet("my")]
        [Authorize]
        public async Task<IActionResult> My()
        {
            var userId = CurrentUserId();
            return userId.HasValue ? Ok(await _service.GetMyAsync(userId.Value)) : Unauthorized();
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin,Warehouse,Technical")]
        public async Task<IActionResult> All([FromQuery] SupportSearchDto search)
        {
            // AdminWarranty tab danh sách bảo hành dùng endpoint này.
            var result = await _service.GetAllWarrantiesAsync(search);
            return Ok(Paged(result.Items, result.TotalCount, search.Page, search.PageSize));
        }

        [HttpPost("activate")]
        [Authorize]
        public async Task<IActionResult> Activate([FromBody] ActivateWarrantyDto dto)
        {
            var userId = CurrentUserId();
            if (!userId.HasValue) return Unauthorized();
            var item = await _service.ActivateAsync(dto.WarrantyId, userId.Value);
            return item == null ? NotFound(new { message = "Bao hanh khong ton tai." }) : Ok(item);
        }

        [HttpPost("activate-admin")]
        [Authorize(Roles = "Technical")]
        public async Task<IActionResult> ActivateAdmin([FromBody] ActivateWarrantyDto dto)
        {
            // Technical kích hoạt thủ công khi xử lý tại quầy hoặc trong màn sửa chữa.
            var item = await _service.ActivateAsStaffAsync(dto.WarrantyId, CurrentUserId());
            return item == null ? NotFound(new { message = "Bao hanh khong ton tai." }) : Ok(item);
        }

        [HttpPost("activate-public")]
        [AllowAnonymous]
        public async Task<IActionResult> ActivatePublic([FromBody] ActivateWarrantyPublicDto dto)
        {
            var item = await _service.ActivatePublicAsync(dto);
            return item == null ? NotFound(new { message = "Bao hanh khong ton tai." }) : Ok(item);
        }

        [HttpPost("claims")]
        [Authorize]
        public async Task<IActionResult> CreateClaim([FromBody] CreateWarrantyClaimDto dto)
        {
            // User gửi yêu cầu bảo hành, sau đó claim sẽ xuất hiện trong màn AdminWarranty.
            var claim = await _service.CreateClaimAsync(dto, CurrentUserId());
            return Ok(new { claim.Id, claim.ClaimCode, claim.Status, message = "Yeu cau bao hanh cua ban da duoc gui. Chung toi se lien he lai trong thoi gian som nhat." });
        }

        [HttpGet("claims/my")]
        [Authorize]
        public async Task<IActionResult> MyClaims([FromQuery] int? warrantyId)
        {
            var userId = CurrentUserId();
            if (!userId.HasValue) return Unauthorized();
            return Ok(await _service.GetMyClaimsAsync(userId.Value, warrantyId));
        }

        [HttpGet("claims/all")]
        [Authorize(Roles = "Admin,Warehouse,Technical")]
        public async Task<IActionResult> AllClaims([FromQuery] SupportSearchDto search)
        {
            // Tab quản trị yêu cầu bảo hành đọc dữ liệu từ đây.
            var result = await _service.GetClaimsAsync(search);
            return Ok(Paged(result.Items, result.TotalCount, search.Page, search.PageSize));
        }

        [HttpGet("claims/{id}")]
        [Authorize]
        public async Task<IActionResult> GetClaim(int id)
        {
            var claim = await _service.GetClaimAsync(id);
            return claim == null ? NotFound(new { message = "Yeu cau bao hanh khong ton tai." }) : Ok(claim);
        }

        [HttpPut("claims/{id}/status")]
        [Authorize(Roles = "Technical")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateWarrantyClaimStatusDto dto)
        {
            // Technical đổi trạng thái claim; service sẽ đồng bộ timeline và trạng thái thiết bị nếu cần.
            var claim = await _service.UpdateClaimStatusAsync(id, dto, CurrentUserId());
            return claim == null ? NotFound(new { message = "Yeu cau bao hanh khong ton tai." }) : Ok(claim);
        }

        [HttpGet("claims/{id}/updates")]
        [Authorize]
        public async Task<IActionResult> Updates(int id) => Ok(await _service.GetClaimUpdatesAsync(id));

        private Guid? CurrentUserId()
        {
            var raw = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
            return Guid.TryParse(raw, out var value) ? value : null;
        }

        private static object Paged<T>(List<T> items, int totalCount, int page, int pageSize)
        {
            var size = Math.Clamp(pageSize, 1, 100);
            return new { items, totalCount, page = Math.Max(1, page), pageSize = size, totalPages = (int)Math.Ceiling(totalCount / (double)size) };
        }
    }
}
