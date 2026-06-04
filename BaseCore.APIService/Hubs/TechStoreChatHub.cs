using BaseCore.Repository.EFCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace BaseCore.APIService.Hubs
{
    [Authorize]
    public class TechStoreChatHub : Hub
    {
        private readonly ISupportTicketRepositoryEF _ticketRepository;

        public TechStoreChatHub(ISupportTicketRepositoryEF ticketRepository)
        {
            _ticketRepository = ticketRepository;
        }

        public async Task JoinTicketRoom(string ticketId)
        {
            if (!int.TryParse(ticketId, out var parsedTicketId))
            {
                throw new HubException("TicketId khong hop le.");
            }

            var ticket = await _ticketRepository.GetByIdAsync(parsedTicketId);
            if (ticket == null)
            {
                throw new HubException("Ticket khong ton tai.");
            }

            var user = Context.User;
            if (user == null || user.Identity?.IsAuthenticated != true)
            {
                throw new HubException("Khong duoc phep truy cap.");
            }

            var isStaff = user.IsInRole("Admin") || user.IsInRole("CustomerService") || user.IsInRole("Technical") || user.IsInRole("Warranty");
            if (!isStaff)
            {
                var raw = user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? user.FindFirst("sub")?.Value ?? user.FindFirst("id")?.Value;
                if (!Guid.TryParse(raw, out var userId))
                {
                    throw new HubException("Khong duoc phep truy cap.");
                }
                if (!ticket.UserId.HasValue || ticket.UserId.Value != userId)
                {
                    throw new HubException("Khong duoc phep truy cap ticket nay.");
                }
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, parsedTicketId.ToString());
        }

        public async Task SendMessageToRoom(string ticketId, object messageData)
        {
            await Clients.Group(ticketId).SendAsync("ReceiveMessage", messageData);
        }
    }
}
