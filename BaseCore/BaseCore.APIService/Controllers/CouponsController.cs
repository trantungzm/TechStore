using BaseCore.DTO.Coupons;
using BaseCore.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BaseCore.APIService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CouponsController : ControllerBase
    {
        private readonly ICouponService _couponService;

        public CouponsController(ICouponService couponService)
        {
            _couponService = couponService;
        }

        [HttpGet("public")]
        [AllowAnonymous]
        public async Task<IActionResult> Public([FromQuery] CouponSearchDto search)
        {
            var result = await _couponService.GetPublicAsync(search, CurrentUserId());
            return Ok(new
            {
                items = result.Items,
                totalCount = result.TotalCount,
                page = Math.Max(1, search.Page),
                pageSize = Math.Clamp(search.PageSize, 1, 100),
                totalPages = (int)Math.Ceiling(result.TotalCount / (double)Math.Clamp(search.PageSize, 1, 100))
            });
        }

        [HttpGet("my")]
        [Authorize]
        public async Task<IActionResult> My([FromQuery] UserCouponSearchDto search)
        {
            var userId = CurrentUserId();
            if (!userId.HasValue) return Unauthorized(new { message = "Ban can dang nhap de xem vi phieu." });
            var result = await _couponService.GetMyAsync(userId.Value, search);
            return Ok(new
            {
                items = result.Items,
                totalCount = result.TotalCount,
                page = Math.Max(1, search.Page),
                pageSize = Math.Clamp(search.PageSize, 1, 100),
                totalPages = (int)Math.Ceiling(result.TotalCount / (double)Math.Clamp(search.PageSize, 1, 100))
            });
        }

        [HttpPost("{id}/claim")]
        [Authorize]
        public async Task<IActionResult> Claim(int id)
        {
            var userId = CurrentUserId();
            if (!userId.HasValue) return Unauthorized(new { message = "Ban can dang nhap de nhan phieu." });
            return Ok(await _couponService.ClaimAsync(id, userId.Value));
        }

        [HttpPost("validate")]
        [AllowAnonymous]
        public async Task<IActionResult> Validate([FromBody] ValidateCouponsDto dto)
        {
            return Ok(await _couponService.ValidateAsync(CurrentUserId(), dto, requireUserCoupon: false));
        }

        [HttpPost("apply-preview")]
        [AllowAnonymous]
        public async Task<IActionResult> ApplyPreview([FromBody] ValidateCouponsDto dto)
        {
            return Ok(await _couponService.ValidateAsync(CurrentUserId(), dto, requireUserCoupon: false));
        }

        [HttpPost("spin")]
        [Authorize]
        public async Task<IActionResult> Spin()
        {
            var userId = CurrentUserId();
            if (!userId.HasValue) return Unauthorized(new { message = "Ban can dang nhap de quay voucher." });
            return Ok(await _couponService.SpinAsync(userId.Value));
        }

        [HttpGet("stats")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Stats()
        {
            return Ok(await _couponService.GetStatsAsync());
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll([FromQuery] CouponSearchDto search)
        {
            var result = await _couponService.GetCouponsAsync(search, CurrentUserId());
            return Ok(new
            {
                items = result.Items,
                totalCount = result.TotalCount,
                page = Math.Max(1, search.Page),
                pageSize = Math.Clamp(search.PageSize, 1, 100),
                totalPages = (int)Math.Ceiling(result.TotalCount / (double)Math.Clamp(search.PageSize, 1, 100))
            });
        }

        [HttpGet("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _couponService.GetCouponAsync(id, CurrentUserId());
            if (item == null) return NotFound(new { message = "Phieu giam gia khong ton tai." });
            return Ok(item);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CouponCreateDto dto)
        {
            var item = await _couponService.CreateAsync(dto, CurrentUserId());
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] CouponUpdateDto dto)
        {
            var item = await _couponService.UpdateAsync(id, dto);
            if (item == null) return NotFound(new { message = "Phieu giam gia khong ton tai." });
            return Ok(item);
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _couponService.DeleteAsync(id);
            if (!deleted) return NotFound(new { message = "Phieu giam gia khong ton tai." });
            return NoContent();
        }

        [HttpPut("{id:int}/toggle")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Toggle(int id)
        {
            var item = await _couponService.ToggleAsync(id);
            if (item == null) return NotFound(new { message = "Phieu giam gia khong ton tai." });
            return Ok(item);
        }

        [HttpGet("{id:int}/users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Users(int id)
        {
            return Ok(await _couponService.GetCouponUsersAsync(id));
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
