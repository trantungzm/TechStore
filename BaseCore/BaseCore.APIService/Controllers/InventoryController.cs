using BaseCore.DTO.Inventory;
using BaseCore.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BaseCore.APIService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin,Warehouse,Technical")]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _inventoryService;

        public InventoryController(IInventoryService inventoryService)
        {
            _inventoryService = inventoryService;
        }

        [HttpPost("receipts")]
        public async Task<IActionResult> CreateReceipt([FromBody] CreateGoodsReceiptDto dto)
        {
            if (!HasAnyRole("Admin", "Warehouse")) return Forbid();
            var result = await _inventoryService.CreateReceiptAsync(dto, CurrentUserId());
            return CreatedAtAction(nameof(GetReceipt), new { id = result.Id }, result);
        }

        [HttpGet("receipts")]
        public async Task<IActionResult> GetReceipts([FromQuery] InventorySearchDto search)
        {
            if (!HasAnyRole("Admin", "Warehouse")) return Forbid();
            var result = await _inventoryService.GetReceiptsAsync(search);
            return Ok(Paged(result.Items, result.TotalCount, search.Page, search.PageSize));
        }

        [HttpGet("receipts/{id}")]
        public async Task<IActionResult> GetReceipt(int id)
        {
            if (!HasAnyRole("Admin", "Warehouse")) return Forbid();
            var result = await _inventoryService.GetReceiptAsync(id);
            return result == null ? NotFound(new { message = "Goods receipt not found" }) : Ok(result);
        }

        [HttpGet("stock-items")]
        public async Task<IActionResult> GetStockItems([FromQuery] InventorySearchDto search)
        {
            if (!HasAnyRole("Admin", "Warehouse", "Technical")) return Forbid();
            var result = await _inventoryService.GetStockItemsAsync(search);
            return Ok(Paged(result.Items, result.TotalCount, search.Page, search.PageSize));
        }

        [HttpGet("stock-items/lookup")]
        public async Task<IActionResult> LookupStockItem([FromQuery] string serialOrImei)
        {
            if (!HasAnyRole("Admin", "Warehouse", "Technical")) return Forbid();
            var result = await _inventoryService.LookupStockItemAsync(serialOrImei);
            return result == null ? NotFound(new { message = "Khong tim thay san pham voi serial/IMEI nay." }) : Ok(result);
        }

        [HttpGet("stock-items/{id}")]
        public async Task<IActionResult> GetStockItem(int id)
        {
            if (!HasAnyRole("Admin", "Warehouse", "Technical")) return Forbid();
            var result = await _inventoryService.GetStockItemAsync(id);
            return result == null ? NotFound(new { message = "Stock item not found" }) : Ok(result);
        }

        [HttpPut("stock-items/{id}/status")]
        public async Task<IActionResult> UpdateStockItemStatus(int id, [FromBody] UpdateStockItemStatusDto dto)
        {
            if (!HasAnyRole("Admin", "Warehouse")) return Forbid();
            var result = await _inventoryService.UpdateStockItemStatusAsync(id, dto, CurrentUserId());
            return result == null ? NotFound(new { message = "Stock item not found" }) : Ok(result);
        }

        [HttpPost("assign-stock-items")]
        public async Task<IActionResult> AssignStockItems([FromBody] AssignStockItemsDto dto)
        {
            if (!HasAnyRole("Admin", "Warehouse")) return Forbid();
            return Ok(await _inventoryService.AssignStockItemsAsync(dto, CurrentUserId()));
        }

        [HttpGet("aged-stock")]
        public async Task<IActionResult> GetAgedStock([FromQuery] AgedStockSearchDto search)
        {
            if (!HasAnyRole("Admin", "Warehouse")) return Forbid();
            var result = await _inventoryService.GetAgedStockAsync(search);
            return Ok(Paged(result.Items, result.TotalCount, search.Page, search.PageSize));
        }

        [HttpPost("returns")]
        public async Task<IActionResult> CreateReturn([FromBody] CreateInventoryReturnDto dto)
        {
            if (!HasAnyRole("Admin", "Technical")) return Forbid();
            var result = await _inventoryService.CreateReturnAsync(dto, CurrentUserId());
            return CreatedAtAction(nameof(GetReturn), new { id = result.Id }, result);
        }

        [HttpGet("returns")]
        public async Task<IActionResult> GetReturns([FromQuery] InventoryReturnSearchDto search)
        {
            if (!HasAnyRole("Admin", "Technical")) return Forbid();
            var result = await _inventoryService.GetReturnsAsync(search);
            return Ok(Paged(result.Items, result.TotalCount, search.Page, search.PageSize));
        }

        [HttpGet("returns/{id}")]
        public async Task<IActionResult> GetReturn(int id)
        {
            if (!HasAnyRole("Admin", "Technical")) return Forbid();
            var result = await _inventoryService.GetReturnAsync(id);
            return result == null ? NotFound(new { message = "Return not found" }) : Ok(result);
        }

        [HttpPut("returns/{id}/review")]
        public async Task<IActionResult> ReviewReturn(int id, [FromBody] ReviewInventoryReturnDto dto)
        {
            if (!HasAnyRole("Admin", "Technical")) return Forbid();
            var result = await _inventoryService.ReviewReturnAsync(id, dto, CurrentUserId());
            return result == null ? NotFound(new { message = "Return not found" }) : Ok(result);
        }

        [HttpPut("returns/{id}/restock")]
        public async Task<IActionResult> RestockReturn(int id, [FromBody] RestockReturnDto dto)
        {
            if (!HasAnyRole("Admin", "Technical")) return Forbid();
            var result = await _inventoryService.RestockReturnAsync(id, dto, CurrentUserId());
            return result == null ? NotFound(new { message = "Return not found" }) : Ok(result);
        }

        [HttpGet("movements")]
        public async Task<IActionResult> GetMovements([FromQuery] InventorySearchDto search)
        {
            if (!HasAnyRole("Admin", "Warehouse")) return Forbid();
            var result = await _inventoryService.GetMovementsAsync(search);
            return Ok(Paged(result.Items, result.TotalCount, search.Page, search.PageSize));
        }

        private static object Paged<T>(List<T> items, int totalCount, int page, int pageSize)
        {
            var safePage = Math.Max(1, page);
            var safePageSize = Math.Clamp(pageSize, 1, 100);
            return new
            {
                items,
                totalCount,
                page = safePage,
                pageSize = safePageSize,
                totalPages = (int)Math.Ceiling(totalCount / (double)safePageSize)
            };
        }

        private Guid? CurrentUserId()
        {
            var raw = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                      User.FindFirst("sub")?.Value ??
                      User.FindFirst("id")?.Value;
            return Guid.TryParse(raw, out var value) ? value : null;
        }

        private bool HasAnyRole(params string[] roles)
        {
            return roles.Any(role => User.IsInRole(role));
        }
    }
}
