using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BaseCore.Entities;
using BaseCore.Repository;

namespace BaseCore.APIService.Controllers
{
    /// <summary>
    /// Banner API Controller
    /// Manages dynamic banner sliders for the home page
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class BannersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BannersController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get all active banners ordered by display order
        /// </summary>
        [HttpGet("active")]
        public async Task<IActionResult> GetActiveBanners()
        {
            var banners = await _context.Banners
                .Where(b => b.IsActive)
                .OrderBy(b => b.DisplayOrder)
                .ToListAsync();
            
            return Ok(banners);
        }

        /// <summary>
        /// Get all banners (admin only)
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllBanners()
        {
            var banners = await _context.Banners
                .OrderBy(b => b.DisplayOrder)
                .ToListAsync();
            
            return Ok(banners);
        }

        /// <summary>
        /// Get banner by ID
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetBannerById(int id)
        {
            var banner = await _context.Banners.FindAsync(id);
            if (banner == null)
                return NotFound(new { message = "Banner not found" });

            return Ok(banner);
        }

        /// <summary>
        /// Create new banner
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateBanner([FromBody] Banner banner)
        {
            banner.CreatedAt = DateTime.UtcNow;
            _context.Banners.Add(banner);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBannerById), new { id = banner.Id }, banner);
        }

        /// <summary>
        /// Update banner
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateBanner(int id, [FromBody] Banner banner)
        {
            var existing = await _context.Banners.FindAsync(id);
            if (existing == null)
                return NotFound(new { message = "Banner not found" });

            existing.Kicker = banner.Kicker;
            existing.Title = banner.Title;
            existing.SubTitle = banner.SubTitle;
            existing.CtaLabel = banner.CtaLabel;
            existing.CtaTo = banner.CtaTo;
            existing.ImageUrl = banner.ImageUrl;
            existing.OfferTitle = banner.OfferTitle;
            existing.OfferDiscount = banner.OfferDiscount;
            existing.OfferProduct = banner.OfferProduct;
            existing.DisplayOrder = banner.DisplayOrder;
            existing.IsActive = banner.IsActive;
            existing.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        /// <summary>
        /// Delete banner
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteBanner(int id)
        {
            var banner = await _context.Banners.FindAsync(id);
            if (banner == null)
                return NotFound(new { message = "Banner not found" });

            _context.Banners.Remove(banner);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Banner deleted successfully" });
        }

        /// <summary>
        /// Toggle banner active status
        /// </summary>
        [HttpPut("{id}/toggle")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ToggleBanner(int id)
        {
            var banner = await _context.Banners.FindAsync(id);
            if (banner == null)
                return NotFound(new { message = "Banner not found" });

            banner.IsActive = !banner.IsActive;
            banner.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(banner);
        }
    }
}
