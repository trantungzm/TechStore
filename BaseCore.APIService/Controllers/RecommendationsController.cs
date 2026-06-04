using BaseCore.APIService;
using BaseCore.DTO.Store;
using BaseCore.Entities;
using BaseCore.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BaseCore.APIService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecommendationsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public RecommendationsController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet("cross-sell")]
        public async Task<IActionResult> GetCrossSell([FromQuery] int productId, [FromQuery] int maxItems = 6)
        {
            var items = await _db.ProductRecommendations
                .AsNoTracking()
                .Include(x => x.RecommendedProduct)
                    .ThenInclude(p => p.Category)
                .Where(x => x.ProductId == productId && x.Type == "CrossSell")
                .OrderBy(x => x.SortOrder)
                .Take(Math.Clamp(maxItems, 1, 24))
                .ToListAsync();

            return Ok(items.Select(StoreDtoMapper.ToRecommendationDto));
        }

        [HttpPut("cross-sell/{productId}")]
        [Authorize]
        public async Task<IActionResult> SetCrossSellByRoute(int productId, [FromBody] CrossSellUpdateDto dto)
        {
            return await SaveCrossSell(productId, dto.ProductIds);
        }

        [HttpPut("cross-sell")]
        [Authorize]
        public async Task<IActionResult> SetCrossSellByQuery([FromQuery] int productId, [FromBody] CrossSellUpdateDto dto)
        {
            return await SaveCrossSell(productId, dto.ProductIds);
        }

        [HttpGet("auto-cross-sell")]
        public async Task<IActionResult> GetAutoCrossSell([FromQuery] int productId, [FromQuery] int maxItems = 6)
        {
            var configured = await _db.ProductRecommendations
                .AsNoTracking()
                .Include(x => x.RecommendedProduct)
                    .ThenInclude(p => p.Category)
                .Where(x => x.ProductId == productId && x.Type == "CrossSell")
                .OrderBy(x => x.SortOrder)
                .Take(Math.Clamp(maxItems, 1, 24))
                .ToListAsync();

            if (configured.Count > 0)
            {
                return Ok(configured.Select(StoreDtoMapper.ToRecommendationDto));
            }

            var product = await _db.Products.AsNoTracking().FirstOrDefaultAsync(x => x.Id == productId);
            if (product == null) return NotFound(new { message = "Product not found" });

            var suggestions = await _db.Products
                .AsNoTracking()
                .Include(x => x.Category)
                .Where(x => x.Id != productId && x.CategoryId == product.CategoryId && x.IsActive && x.Stock > 0)
                .OrderByDescending(x => x.IsFeatured)
                .ThenByDescending(x => x.IsBestSeller)
                .ThenByDescending(x => x.Id)
                .Take(Math.Clamp(maxItems, 1, 24))
                .ToListAsync();

            return Ok(suggestions.Select(product => new RecommendationDto
            {
                ProductId = productId,
                RecommendedProductId = product.Id,
                Type = "CrossSell",
                Product = StoreDtoMapper.ToListDto(product)
            }));
        }

        private async Task<IActionResult> SaveCrossSell(int productId, List<int> productIds)
        {
            var productExists = await _db.Products.AnyAsync(x => x.Id == productId);
            if (!productExists) return NotFound(new { message = "Product not found" });

            var ids = productIds
                .Where(id => id > 0 && id != productId)
                .Distinct()
                .Take(24)
                .ToList();

            var existing = await _db.ProductRecommendations
                .Where(x => x.ProductId == productId && x.Type == "CrossSell")
                .ToListAsync();

            _db.ProductRecommendations.RemoveRange(existing);

            for (var i = 0; i < ids.Count; i++)
            {
                _db.ProductRecommendations.Add(new ProductRecommendation
                {
                    ProductId = productId,
                    RecommendedProductId = ids[i],
                    Type = "CrossSell",
                    SortOrder = i + 1,
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _db.SaveChangesAsync();
            return await GetCrossSell(productId, ids.Count == 0 ? 6 : ids.Count);
        }
    }
}
