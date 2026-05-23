using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BaseCore.APIService;
using BaseCore.DTO.Store;
using BaseCore.Services;

namespace BaseCore.APIService.Controllers
{
    /// <summary>
    /// Product API Controller
    /// Teaching: RESTful API, CRUD Operations, EF Core (Bài 10, 11)
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductsController(IProductService productService)
        {
            _productService = productService;
        }

        /// <summary>
        /// Get all products with pagination and search
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? keyword,
            [FromQuery] int? categoryId,
            [FromQuery] string? categorySlug,
            [FromQuery] string? brand,
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice,
            [FromQuery] bool? inStock,
            [FromQuery] bool? isFeatured,
            [FromQuery] bool? isBestSeller,
            [FromQuery] bool? isNewArrival,
            [FromQuery] bool? isDiscounted,
            [FromQuery] string? sortBy,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var effectivePage = Math.Max(1, page);
            var effectivePageSize = Math.Clamp(pageSize, 1, 100);
            var (products, totalCount) = await _productService.SearchAsync(new ProductSearchDto
            {
                Keyword = keyword,
                CategoryId = categoryId,
                CategorySlug = categorySlug,
                Brand = brand,
                MinPrice = minPrice,
                MaxPrice = maxPrice,
                InStock = inStock,
                IsFeatured = isFeatured,
                IsBestSeller = isBestSeller,
                IsNewArrival = isNewArrival,
                IsDiscounted = isDiscounted,
                SortBy = sortBy,
                Page = effectivePage,
                PageSize = effectivePageSize
            });

            return Ok(new
            {
                items = products.Select(StoreDtoMapper.ToListDto),
                totalCount,
                page = effectivePage,
                pageSize = effectivePageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / effectivePageSize)
            });
        }

        /// <summary>
        /// Get product by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _productService.GetProductByIdAsync(id);
            if (product == null)
                return NotFound(new { message = "Product not found" });

            return Ok(StoreDtoMapper.ToDetailDto(product));
        }

        /// <summary>
        /// Create new product (requires authentication)
        /// </summary>
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] ProductCreateDto dto)
        {
            var product = await _productService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = product.Id }, StoreDtoMapper.ToDetailDto(product));
        }

        /// <summary>
        /// Update product (requires authentication)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] ProductUpdateDto dto)
        {
            var product = await _productService.UpdateAsync(id, dto);
            if (product == null) return NotFound(new { message = "Product not found" });
            return Ok(StoreDtoMapper.ToDetailDto(product));
        }

        /// <summary>
        /// Delete product (requires authentication)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _productService.DeleteAsync(id);
            if (!deleted) return NotFound(new { message = "Product not found" });
            return Ok(new { message = "Product deleted successfully" });
        }

        /// <summary>
        /// Get products by category
        /// </summary>
        [HttpGet("category/{categoryId}")]
        public async Task<IActionResult> GetByCategory(int categoryId)
        {
            var (products, _) = await _productService.SearchAsync(null, categoryId, 1, 500);
            return Ok(products.Select(StoreDtoMapper.ToListDto));
        }
    }
}
