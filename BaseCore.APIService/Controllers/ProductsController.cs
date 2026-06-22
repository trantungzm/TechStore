using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BaseCore.APIService;
using BaseCore.DTO.Store;
using BaseCore.Repository.EFCore;
using BaseCore.Services;
using System.Text.Json;

namespace BaseCore.APIService.Controllers
{
    // Controller sản phẩm phục vụ cả storefront và các màn admin như Products/Dashboard/Inventory.
    /// <summary>
    /// Product API Controller
    /// Teaching: RESTful API, CRUD Operations, EF Core (Bài 10, 11)
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly ISupportTicketRepositoryEF _ticketRepository;

        public ProductsController(IProductService productService, ISupportTicketRepositoryEF ticketRepository)
        {
            _productService = productService;
            _ticketRepository = ticketRepository;
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
            [FromQuery] bool includeInactive,
            [FromQuery] string? sortBy,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            // Danh sách sản phẩm dùng lại ở nhiều nơi: shop storefront, admin products, dropdown nhập kho, dashboard.
            var effectivePage = Math.Max(1, page);
            var effectivePageSize = Math.Clamp(pageSize, 1, 100);
            var canIncludeInactive = includeInactive && User.IsInRole("Admin");
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
                IncludeInactive = canIncludeInactive,
                SortBy = sortBy,
                Page = effectivePage,
                PageSize = effectivePageSize
            });

            var ratingMap = await GetProductRatingMapAsync(products.Select(x => x.Id));

            return Ok(new
            {
                items = products.Select(p =>
                {
                    var rating = ratingMap.TryGetValue(p.Id, out var value) ? value : default;
                    return StoreDtoMapper.ToListDto(p, rating.RatingAverage, rating.RatingCount);
                }),
                totalCount,
                page = effectivePage,
                pageSize = effectivePageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / effectivePageSize)
            });
        }

        [HttpGet("stats")]
        [Authorize(Roles = "Admin,Warehouse,Technical")]
        public async Task<IActionResult> GetStats([FromQuery] ProductSearchDto search)
        {
            // Dashboard và AdminProducts dùng để lấy số liệu tồn kho tổng quan.
            var canIncludeInactive = search.IncludeInactive && User.IsInRole("Admin");
            search.IncludeInactive = canIncludeInactive;

            var stats = await _productService.GetInventoryStatsAsync(search);
            return Ok(new
            {
                totalCount = stats.TotalCount,
                available = stats.AvailableCount,
                low = stats.LowCount,
                outOfStock = stats.OutCount
            });
        }

        /// <summary>
        /// Get product by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id, [FromQuery] bool includeInactive = false)
        {
            var product = await _productService.GetProductByIdAsync(id, includeInactive && User.IsInRole("Admin"));
            if (product == null)
                return NotFound(new { message = "Product not found" });

            var dto = StoreDtoMapper.ToDetailDto(product);
            var ratingMap = await GetProductRatingMapAsync(new[] { product.Id });
            if (ratingMap.TryGetValue(product.Id, out var rating))
            {
                dto.RatingAverage = rating.RatingAverage;
                dto.RatingCount = rating.RatingCount;
            }
            return Ok(dto);
        }

        /// <summary>
        /// Distinct list of existing brands (for the product form brand picker).
        /// </summary>
        [HttpGet("brands")]
        public async Task<IActionResult> GetBrands()
        {
            var brands = await _productService.GetBrandsAsync();
            return Ok(brands);
        }

        /// <summary>
        /// Create new product (requires authentication)
        /// </summary>
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] ProductCreateDto dto)
        {
            // Tạo sản phẩm từ form quản trị; xử lý sâu nằm ở ProductService.
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
            // Cập nhật master data sản phẩm, biến thể, ảnh và giá.
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
            var ratingMap = await GetProductRatingMapAsync(products.Select(x => x.Id));
            return Ok(products.Select(p =>
            {
                var rating = ratingMap.TryGetValue(p.Id, out var value) ? value : default;
                return StoreDtoMapper.ToListDto(p, rating.RatingAverage, rating.RatingCount);
            }));
        }

        private async Task<Dictionary<int, (double RatingAverage, int RatingCount)>> GetProductRatingMapAsync(IEnumerable<int> productIds)
        {
            // Dashboard/store detail tận dụng ticket review để tính rating mà không cần bảng rating riêng.
            var ids = productIds.Distinct().ToList();
            if (ids.Count == 0) return new Dictionary<int, (double, int)>();

            var tickets = await _ticketRepository.FindAsync(t =>
                t.RelatedProductId.HasValue &&
                ids.Contains(t.RelatedProductId.Value) &&
                t.Category == "Product" &&
                t.Subject.Contains("[Review"));

            var sums = new Dictionary<int, (double Sum, int Count)>();
            foreach (var ticket in tickets)
            {
                if (!ticket.RelatedProductId.HasValue) continue;
                var productId = ticket.RelatedProductId.Value;

                if (string.IsNullOrWhiteSpace(ticket.Description)) continue;
                if (!TryReadRating(ticket.Description, out var rating)) continue;
                if (rating <= 0) continue;

                if (!sums.TryGetValue(productId, out var agg)) agg = (0, 0);
                agg.Sum += rating;
                agg.Count += 1;
                sums[productId] = agg;
            }

            var result = new Dictionary<int, (double RatingAverage, int RatingCount)>();
            foreach (var kvp in sums)
            {
                var avg = kvp.Value.Count > 0 ? kvp.Value.Sum / kvp.Value.Count : 0;
                result[kvp.Key] = (Math.Round(avg, 1), kvp.Value.Count);
            }
            return result;
        }

        private static bool TryReadRating(string rawDescription, out double rating)
        {
            rating = 0;
            try
            {
                using var doc = JsonDocument.Parse(rawDescription);
                var root = doc.RootElement;
                if (root.ValueKind != JsonValueKind.Object) return false;
                if (!root.TryGetProperty("rating", out var value) && !root.TryGetProperty("Rating", out value)) return false;
                if (value.ValueKind == JsonValueKind.Number && value.TryGetDouble(out var v))
                {
                    rating = v;
                    return true;
                }
                return false;
            }
            catch
            {
                return false;
            }
        }
    }
}
