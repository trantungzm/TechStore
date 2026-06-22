using BaseCore.DTO.Support;
using BaseCore.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BaseCore.APIService.Controllers
{
    // Controller sửa chữa phục vụ cả kỹ thuật nội bộ và user theo dõi repair case của mình.
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RepairsController : ControllerBase
    {
        private readonly IRepairService _service;
        public RepairsController(IRepairService service) => _service = service;

        [HttpGet]
        [Authorize(Roles = "Admin,Warehouse,Technical")]
        public async Task<IActionResult> Get([FromQuery] SupportSearchDto search)
        {
            // Màn AdminRepairs lấy danh sách hồ sơ sửa chữa từ đây.
            var result = await _service.GetRepairsAsync(search);
            return Ok(Paged(result.Items, result.TotalCount, search.Page, search.PageSize));
        }

        [HttpGet("my")]
        public async Task<IActionResult> My([FromQuery] SupportSearchDto search)
        {
            var userId = CurrentUserId();
            if (!userId.HasValue) return Unauthorized();
            var result = await _service.GetMyRepairsAsync(userId.Value, search);
            return Ok(Paged(result.Items, result.TotalCount, search.Page, search.PageSize));
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Warehouse,Technical")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _service.GetRepairAsync(id);
            return item == null ? NotFound(new { message = "Repair khong ton tai." }) : Ok(item);
        }

        [HttpGet("my/{id}")]
        public async Task<IActionResult> GetMyById(int id)
        {
            var userId = CurrentUserId();
            if (!userId.HasValue) return Unauthorized();
            var item = await _service.GetMyRepairAsync(userId.Value, id);
            return item == null ? NotFound(new { message = "Repair khong ton tai." }) : Ok(item);
        }

        [HttpPost("intake")]
        [Authorize(Roles = "Technical")]
        public async Task<IActionResult> Intake([FromBody] CreateRepairIntakeDto dto)
        {
            // Technical tiếp nhận thiết bị vào quy trình sửa chữa.
            var item = await _service.IntakeAsync(dto, CurrentUserId());
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Technical")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateRepairCaseDto dto)
        {
            // Update ghi chú/nội dung xử lý của repair case.
            var item = await _service.UpdateAsync(id, dto);
            return item == null ? NotFound(new { message = "Repair khong ton tai." }) : Ok(item);
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Technical")]
        public async Task<IActionResult> Status(int id, [FromBody] UpdateRepairStatusDto dto)
        {
            // Endpoint tách riêng cho việc đổi bước xử lý sửa chữa nếu cần gọi độc lập.
            var item = await _service.UpdateStatusAsync(id, dto, CurrentUserId());
            return item == null ? NotFound(new { message = "Repair khong ton tai." }) : Ok(item);
        }

        [HttpGet("{id}/updates")]
        [Authorize(Roles = "Admin,Warehouse,Technical")]
        public async Task<IActionResult> Updates(int id) => Ok(await _service.GetUpdatesAsync(id));

        [HttpGet("my/{id}/updates")]
        public async Task<IActionResult> MyUpdates(int id)
        {
            var userId = CurrentUserId();
            if (!userId.HasValue) return Unauthorized();
            var item = await _service.GetMyRepairAsync(userId.Value, id);
            return item == null ? NotFound(new { message = "Repair khong ton tai." }) : Ok(await _service.GetUpdatesAsync(id));
        }

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
