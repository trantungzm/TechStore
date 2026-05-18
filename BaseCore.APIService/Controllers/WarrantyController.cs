using BaseCore.DTO.Support;
using BaseCore.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BaseCore.APIService.Controllers
{
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

        [HttpPost("claims")]
        [AllowAnonymous]
        public async Task<IActionResult> CreateClaim([FromBody] CreateWarrantyClaimDto dto)
        {
            var claim = await _service.CreateClaimAsync(dto, CurrentUserId());
            return Ok(new { claim.Id, claim.ClaimCode, claim.Status, message = "Yeu cau bao hanh cua ban da duoc gui. Chung toi se lien he lai trong thoi gian som nhat." });
        }

        [HttpGet("claims/all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AllClaims([FromQuery] SupportSearchDto search)
        {
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
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateWarrantyClaimStatusDto dto)
        {
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
