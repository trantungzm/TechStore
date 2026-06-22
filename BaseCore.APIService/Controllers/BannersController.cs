using BaseCore.Entities;
using BaseCore.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BaseCore.APIService.Controllers
{
    /// <summary>
    /// Banner API Controller — quản lý banner slider trang chủ.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class BannersController : ControllerBase
    {
        private readonly IBannerService _bannerService;

        public BannersController(IBannerService bannerService)
        {
            _bannerService = bannerService;
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveBanners()
            => Ok(await _bannerService.GetActiveAsync());

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllBanners()
            => Ok(await _bannerService.GetAllAsync());

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetBannerById(int id)
        {
            var banner = await _bannerService.GetByIdAsync(id);
            return banner == null ? NotFound(new { message = "Banner not found" }) : Ok(banner);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateBanner([FromBody] Banner banner)
        {
            var created = await _bannerService.CreateAsync(banner);
            return CreatedAtAction(nameof(GetBannerById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateBanner(int id, [FromBody] Banner banner)
        {
            var updated = await _bannerService.UpdateAsync(id, banner);
            return updated == null ? NotFound(new { message = "Banner not found" }) : Ok(updated);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteBanner(int id)
        {
            var deleted = await _bannerService.DeleteAsync(id);
            return deleted ? Ok(new { message = "Banner deleted successfully" }) : NotFound(new { message = "Banner not found" });
        }

        [HttpPut("{id}/toggle")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ToggleBanner(int id)
        {
            var banner = await _bannerService.ToggleAsync(id);
            return banner == null ? NotFound(new { message = "Banner not found" }) : Ok(banner);
        }
    }
}
