using BaseCore.APIService.Hubs;
using BaseCore.DTO.Support;
using BaseCore.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace BaseCore.APIService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TicketsController : ControllerBase
    {
        private readonly ITicketService _service;
        private readonly IHubContext<TechStoreChatHub> _hubContext;

        public TicketsController(ITicketService service, IHubContext<TechStoreChatHub> hubContext)
        {
            _service = service;
            _hubContext = hubContext;
        }

        [HttpGet("my")]
        [Authorize]
        public async Task<IActionResult> My()
        {
            var userId = CurrentUserId();
            if (!userId.HasValue) return Unauthorized();
            var items = await _service.GetMyAsync(userId.Value);
            foreach (var item in items)
            {
                item.Updates = item.Updates.Where(x => !x.IsInternalNote).ToList();
            }
            return Ok(items);
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin,Warehouse,Technical")]
        public async Task<IActionResult> All([FromQuery] SupportSearchDto search)
        {
            var result = await _service.GetAllAsync(search);
            return Ok(Paged(result.Items, result.TotalCount, search.Page, search.PageSize));
        }

        [HttpGet("public/by-product/{productId}")]
        [AllowAnonymous]
        public async Task<IActionResult> PublicByProduct(int productId, [FromQuery] string? category = null)
        {
            // Fetch tickets for this product that are either Review or QA
            // We can reuse GetAllAsync, but we should make sure we only return safe data to the client if needed.
            // Since SupportTicketDto doesn't expose extreme secrets, we can just return the result.
            var search = new SupportSearchDto { RelatedProductId = productId, Category = category, PageSize = 100, Page = 1 };
            var result = await _service.GetAllAsync(search);
            // Hide email/phone for public viewers
            var items = result.Items.Select(x => {
                var ticketOwnerId = x.UserId;
                x.CustomerEmail = null;
                x.CustomerPhone = null;
                x.UserId = null;
                x.AssignedToUserId = null;

                // Expose updates that are public, plus allow admin replies for product Q&A
                // (some admin replies may have been incorrectly marked as internal). We
                // only expose these additional updates when the ticket category is Product
                // and the update was created by someone other than the ticket owner.
                var updatesToExpose = x.Updates.Where(u => !u.IsInternalNote).ToList();
                if (string.Equals(x.Category, "Product", StringComparison.OrdinalIgnoreCase))
                {
                    var extra = x.Updates
                        .Where(u => u.IsInternalNote && u.CreatedByUserId.HasValue && u.CreatedByUserId != ticketOwnerId)
                        .ToList();
                    foreach (var u in extra)
                    {
                        if (!updatesToExpose.Contains(u)) updatesToExpose.Add(u);
                    }
                }

                x.Updates = updatesToExpose
                    .Select(u =>
                    {
                        var createdByIsStaff = u.CreatedByUserId.HasValue && u.CreatedByUserId != ticketOwnerId;
                        u.CreatedByIsStaff = createdByIsStaff;
                        u.IsAdminReply = createdByIsStaff && !u.IsInternalNote;
                        // Remove any identifying GUIDs before returning publicly.
                        u.CreatedByUserId = null;
                        u.IsInternalNote = false;
                        return u;
                    })
                    .OrderBy(u => u.CreatedAt)
                    .ToList();

                // Remove any identifying created-by fields from the ticket updates
                // and the ticket itself before returning to public viewers.
                var updatesTree = BuildUpdateTree(x.Updates);
                return new
                {
                    x.Id,
                    x.TicketCode,
                    x.UserId,
                    x.Subject,
                    x.Description,
                    x.CustomerName,
                    x.CustomerPhone,
                    x.CustomerEmail,
                    x.RelatedOrderId,
                    x.RelatedProductId,
                    x.RelatedWarrantyId,
                    x.SerialOrImei,
                    x.UserSessionId,
                    x.Status,
                    x.Priority,
                    x.Category,
                    x.AssignedToUserId,
                    x.CreatedAt,
                    x.UpdatedAt,
                    x.ClosedAt,
                    Updates = x.Updates,
                    UpdatesTree = updatesTree
                };
            }).ToList();
            return Ok(items);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> Get(int id)
        {
            var userId = CurrentUserId();
            var isStaff = IsStaffViewer();
            var item = await _service.GetAsync(id);
            if (item == null) return NotFound(new { message = "Ticket khong ton tai." });
            if (!isStaff)
            {
                if (!userId.HasValue) return Unauthorized();
                if (!item.UserId.HasValue || item.UserId.Value != userId.Value) return Forbid();
                item.Updates = item.Updates.Where(x => !x.IsInternalNote).ToList();
            }
            return Ok(item);
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Create([FromBody] CreateSupportTicketDto dto)
        {
            var item = await _service.CreateAsync(dto, CurrentUserId());
            return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
        }

        [HttpPost("{id}/updates")]
        [Authorize]
        public async Task<IActionResult> AddUpdate(int id, [FromBody] CreateTicketUpdateDto dto)
        {
            // Admin & Warehouse chỉ được xem ticket, không trả lời/ghi chú.
            if (User.IsInRole("Admin") || User.IsInRole("Warehouse")) return Forbid();
            var isStaff = IsStaff();
            if (!isStaff)
            {
                dto.StatusAfter = null;
                dto.PriorityAfter = null;
                dto.IsInternalNote = false;
            }
            var result = await _service.AddUpdateAsync(id, dto, CurrentUserId(), isStaff);
            if (!result.IsInternalNote)
            {
                await _hubContext.Clients.Group(id.ToString()).SendAsync("ReceiveMessage", result);
            }
            return Ok(result);
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Technical")]
        public async Task<IActionResult> Status(int id, [FromBody] UpdateTicketStatusDto dto)
        {
            var item = await _service.UpdateStatusAsync(id, dto, CurrentUserId());
            return item == null ? NotFound(new { message = "Ticket khong ton tai." }) : Ok(item);
        }

        [HttpPut("{id}/assign")]
        [Authorize(Roles = "Technical")]
        public async Task<IActionResult> Assign(int id, [FromBody] AssignTicketDto dto)
        {
            var item = await _service.AssignAsync(id, dto, CurrentUserId());
            return item == null ? NotFound(new { message = "Ticket khong ton tai." }) : Ok(item);
        }

        private Guid? CurrentUserId()
        {
            var raw = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
            return Guid.TryParse(raw, out var value) ? value : null;
        }
        // Người thao tác ticket (ghi): chỉ Technical. Admin chỉ được xem.
        private bool IsStaff()
        {
            return User.IsInRole("Technical");
        }

        // Người được xem nội dung staff (mọi ticket + ghi chú nội bộ): Admin & Warehouse (chỉ xem) + Technical.
        private bool IsStaffViewer()
        {
            return User.IsInRole("Admin") || User.IsInRole("Warehouse") || User.IsInRole("Technical");
        }
        private static object Paged<T>(List<T> items, int totalCount, int page, int pageSize)
        {
            var size = Math.Clamp(pageSize, 1, 100);
            return new { items, totalCount, page = Math.Max(1, page), pageSize = size, totalPages = (int)Math.Ceiling(totalCount / (double)size) };
        }

        private static List<SupportTicketUpdateTreeDto> BuildUpdateTree(List<SupportTicketUpdateDto> updates)
        {
            var map = new Dictionary<int, SupportTicketUpdateTreeDto>();
            for (var i = 0; i < updates.Count; i++)
            {
                var u = updates[i];
                map[u.Id] = new SupportTicketUpdateTreeDto
                {
                    Id = u.Id,
                    TicketId = u.TicketId,
                    ParentMessageId = u.ParentMessageId,
                    Message = u.Message,
                    SenderName = u.SenderName,
                    StatusAfter = u.StatusAfter,
                    PriorityAfter = u.PriorityAfter,
                    CreatedByUserId = u.CreatedByUserId,
                    CreatedByIsStaff = u.CreatedByIsStaff,
                    IsAdminReply = u.IsAdminReply,
                    IsInternalNote = u.IsInternalNote,
                    CreatedAt = u.CreatedAt,
                    Replies = new List<SupportTicketUpdateTreeDto>()
                };
            }

            var roots = new List<SupportTicketUpdateTreeDto>();
            foreach (var node in map.Values)
            {
                if (node.ParentMessageId.HasValue && map.TryGetValue(node.ParentMessageId.Value, out var parent))
                {
                    parent.Replies.Add(node);
                }
                else
                {
                    roots.Add(node);
                }
            }

            SortTree(roots);
            return roots;
        }

        private static void SortTree(List<SupportTicketUpdateTreeDto> nodes)
        {
            nodes.Sort((a, b) => a.CreatedAt.CompareTo(b.CreatedAt));
            for (var i = 0; i < nodes.Count; i++)
            {
                SortTree(nodes[i].Replies);
            }
        }
    }
}
