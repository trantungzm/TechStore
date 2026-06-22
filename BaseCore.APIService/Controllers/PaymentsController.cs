using BaseCore.DTO.Store;
using BaseCore.Entities;
using BaseCore.Repository;
using BaseCore.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace BaseCore.APIService.Controllers
{
    [Route("api/payments")]
    [ApiController]
    public class PaymentsController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IWebHostEnvironment _env;
        private readonly IOrderService _orderService;
        private static readonly TimeSpan SessionTtl = TimeSpan.FromMinutes(15);

        public PaymentsController(AppDbContext db, IWebHostEnvironment env, IOrderService orderService)
        {
            _db = db;
            _env = env;
            _orderService = orderService;
        }

        [HttpPost("sessions")]
        [AllowAnonymous]
        public async Task<IActionResult> CreateSession([FromBody] CreatePaymentSessionRequest request)
        {
            if (request == null)
                return BadRequest(new { message = "Du lieu thanh toan la bat buoc" });

            var now = DateTime.UtcNow;

            // New online checkout flow: do not create an Order yet. Keep checkout data
            // in the payment session, then create the real Order only after payment is confirmed.
            if (request.OrderPayload != null)
            {
                if (request.Amount <= 0)
                    return BadRequest(new { message = "So tien thanh toan la bat buoc" });

                request.OrderPayload.PaymentMethod = "BankTransfer";
                request.OrderPayload.PaymentStatus = null;
                request.OrderPayload.TransactionId = null;
                NormalizeCheckoutPayload(request.OrderPayload);

                var pendingSession = new PaymentSession
                {
                    SessionId = "PAY_" + Guid.NewGuid().ToString("N")[..6].ToUpperInvariant(),
                    Token = Guid.NewGuid().ToString(),
                    UserId = CurrentUserId(),
                    OrderPayloadJson = JsonSerializer.Serialize(request.OrderPayload),
                    Amount = request.Amount,
                    Status = "Pending",
                    ExpiresAt = now.Add(SessionTtl),
                    CreatedAt = now
                };

                _db.PaymentSessions.Add(pendingSession);
                await _db.SaveChangesAsync();
                return Ok(ToDto(pendingSession));
            }

            // Backward-compatible flow for existing orders.
            if (!request.OrderId.HasValue || request.OrderId.Value <= 0)
                return BadRequest(new { message = "OrderId hoac orderPayload la bat buoc" });

            var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == request.OrderId.Value);
            if (order == null) return NotFound(new { message = "Khong tim thay don hang" });

            if (string.Equals(order.PaymentStatus, "Paid", StringComparison.OrdinalIgnoreCase))
                return BadRequest(new { message = "Don hang da duoc thanh toan" });

            var amount = request.Amount > 0 ? request.Amount : order.TotalAmount;
            var existing = await _db.PaymentSessions
                .Where(s => s.OrderId == order.Id && s.Status == "Pending" && s.ExpiresAt > now)
                .OrderByDescending(s => s.Id)
                .FirstOrDefaultAsync();
            if (existing != null)
                return Ok(ToDto(existing));

            var session = new PaymentSession
            {
                SessionId = "PAY_" + Guid.NewGuid().ToString("N")[..6].ToUpperInvariant(),
                Token = Guid.NewGuid().ToString(),
                OrderId = order.Id,
                UserId = CurrentUserId(),
                Amount = amount,
                Status = "Pending",
                ExpiresAt = now.Add(SessionTtl),
                CreatedAt = now
            };

            _db.PaymentSessions.Add(session);
            await _db.SaveChangesAsync();
            return Ok(ToDto(session));
        }

        [HttpPost("mock-confirm")]
        [AllowAnonymous]
        public async Task<IActionResult> MockConfirm([FromBody] MockConfirmRequest request)
        {
            if (!_env.IsDevelopment())
                return NotFound();

            if (request == null || string.IsNullOrWhiteSpace(request.SessionId))
                return BadRequest(new { message = "sessionId la bat buoc" });

            return await ConfirmSessionAsync(request.SessionId, request.Token, request.Amount, request.Status, request.TransactionId);
        }

        [HttpPost("{sessionId}/mock-confirm")]
        [AllowAnonymous]
        public async Task<IActionResult> MockConfirmBySession(string sessionId, [FromBody] MockConfirmTokenRequest request)
        {
            if (!_env.IsDevelopment())
                return NotFound();

            if (string.IsNullOrWhiteSpace(sessionId))
                return BadRequest(new { message = "sessionId la bat buoc" });

            if (request == null || string.IsNullOrWhiteSpace(request.Token))
                return BadRequest(new { message = "token la bat buoc" });

            return await ConfirmSessionAsync(sessionId, request.Token, null, request.Status, request.TransactionId);
        }

        private async Task<IActionResult> ConfirmSessionAsync(string sessionId, string token, decimal? amount, string? statusValue, string? transactionId)
        {
            var session = await _db.PaymentSessions.FirstOrDefaultAsync(s => s.SessionId == sessionId);
            if (session == null) return NotFound(new { message = "Phien thanh toan khong ton tai" });

            if (!string.Equals(session.Token, token, StringComparison.Ordinal))
                return BadRequest(new { message = "Token khong hop le" });

            if (string.Equals(session.Status, "Paid", StringComparison.OrdinalIgnoreCase))
                return BadRequest(new { message = "Phien da duoc thanh toan truoc do" });

            if (session.ExpiresAt <= DateTime.UtcNow)
            {
                session.Status = "Expired";
                await _db.SaveChangesAsync();
                return BadRequest(new { message = "Phien thanh toan da het han" });
            }

            if (amount.HasValue && amount.Value > 0 && Math.Round(amount.Value) != Math.Round(session.Amount))
                return BadRequest(new { message = $"So tien khong khop (can {session.Amount:0})" });

            var status = string.IsNullOrWhiteSpace(statusValue) ? "SUCCESS" : statusValue.Trim();
            if (!string.Equals(status, "SUCCESS", StringComparison.OrdinalIgnoreCase))
            {
                session.Status = "Failed";
                await _db.SaveChangesAsync();
                return Ok(new { success = false, status = session.Status });
            }

            var now = DateTime.UtcNow;
            session.TransactionId = string.IsNullOrWhiteSpace(transactionId)
                ? "MOCK" + DateTime.Now.ToString("yyyyMMddHHmmssfff")
                : transactionId.Trim();

            OrderDetailDto? orderDto = null;
            var order = session.OrderId.HasValue
                ? await _db.Orders.FirstOrDefaultAsync(o => o.Id == session.OrderId.Value)
                : null;

            if (order == null && !string.IsNullOrWhiteSpace(session.OrderPayloadJson))
            {
                var payload = JsonSerializer.Deserialize<CreateOrderDto>(session.OrderPayloadJson, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
                if (payload == null)
                    return BadRequest(new { message = "Du lieu don hang tam khong hop le" });

                payload.PaymentMethod = "BankTransfer";
                payload.PaymentStatus = null;
                payload.TransactionId = null;
                NormalizeCheckoutPayload(payload);

                orderDto = await _orderService.CreateOrderAsync(session.UserId, payload);
                session.OrderId = orderDto.Id;
                order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == orderDto.Id);
            }

            if (order != null)
            {
                orderDto = await _orderService.UpdateStatusAsync(order.Id, new UpdateOrderStatusDto
                {
                    Status = "Confirmed",
                    PaymentStatus = "Paid",
                    TransactionId = session.TransactionId,
                    Note = $"Thanh toan QR thanh cong (ma GD {session.TransactionId})"
                }, session.UserId);
            }

            session.Status = "Paid";
            session.PaidAt = now;
            await _db.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                status = session.Status,
                orderId = session.OrderId,
                orderCode = orderDto?.OrderCode ?? order?.OrderCode,
                paymentStatus = orderDto?.PaymentStatus ?? order?.PaymentStatus,
                orderStatus = orderDto?.Status ?? order?.Status,
                paidAt = session.PaidAt,
                transactionId = session.TransactionId
            });
        }

        [HttpGet("{sessionId}/status")]
        [AllowAnonymous]
        public async Task<IActionResult> GetStatus(string sessionId)
        {
            var session = await _db.PaymentSessions.AsNoTracking().FirstOrDefaultAsync(s => s.SessionId == sessionId);
            if (session == null) return NotFound(new { message = "Phien thanh toan khong ton tai" });

            var status = session.Status;
            if (status == "Pending" && session.ExpiresAt <= DateTime.UtcNow) status = "Expired";

            var order = session.OrderId.HasValue
                ? await _db.Orders.AsNoTracking().FirstOrDefaultAsync(o => o.Id == session.OrderId.Value)
                : null;

            return Ok(new
            {
                sessionId = session.SessionId,
                orderId = session.OrderId,
                status,
                orderStatus = order?.Status,
                paymentStatus = order?.PaymentStatus,
                amount = session.Amount,
                expiresAt = AsUtc(session.ExpiresAt),
                paidAt = AsUtc(session.PaidAt)
            });
        }

        [HttpGet("{sessionId}/detail")]
        [AllowAnonymous]
        public async Task<IActionResult> GetDetail(string sessionId)
        {
            var session = await _db.PaymentSessions.AsNoTracking().FirstOrDefaultAsync(s => s.SessionId == sessionId);
            if (session == null) return NotFound(new { message = "Phien thanh toan khong ton tai" });

            var status = session.Status;
            if (status == "Pending" && session.ExpiresAt <= DateTime.UtcNow) status = "Expired";

            var order = session.OrderId.HasValue
                ? await _db.Orders.AsNoTracking().FirstOrDefaultAsync(o => o.Id == session.OrderId.Value)
                : null;
            var qr = GetQrPaymentInfo(session);

            return Ok(new
            {
                sessionId = session.SessionId,
                orderId = session.OrderId,
                amount = session.Amount,
                status,
                orderStatus = order?.Status,
                paymentStatus = order?.PaymentStatus,
                bankName = qr.BankName,
                accountNumber = qr.AccountNumber,
                accountHolder = qr.AccountHolder,
                qrUrl = qr.QrUrl,
                expiresAt = AsUtc(session.ExpiresAt),
                paidAt = AsUtc(session.PaidAt)
            });
        }

        [HttpGet("{sessionId}/dev-info")]
        [AllowAnonymous]
        public async Task<IActionResult> GetDevInfo(string sessionId)
        {
            if (!_env.IsDevelopment())
                return NotFound();

            var session = await _db.PaymentSessions.AsNoTracking().FirstOrDefaultAsync(s => s.SessionId == sessionId);
            if (session == null) return NotFound(new { message = "Phien thanh toan khong ton tai" });

            return Ok(new
            {
                sessionId = session.SessionId,
                token = session.Token,
                amount = session.Amount,
                orderId = session.OrderId,
                status = session.Status,
                expiresAt = AsUtc(session.ExpiresAt)
            });
        }

        private static object ToDto(PaymentSession s)
        {
            var qr = GetQrPaymentInfo(s);
            return new
            {
                sessionId = s.SessionId,
                token = s.Token,
                orderId = s.OrderId,
                amount = s.Amount,
                status = s.Status,
                bankName = qr.BankName,
                accountNumber = qr.AccountNumber,
                accountHolder = qr.AccountHolder,
                qrUrl = qr.QrUrl,
                expiresAt = AsUtc(s.ExpiresAt)
            };
        }

        private static QrPaymentInfo GetQrPaymentInfo(PaymentSession session)
        {
            // Keep old pending sessions usable; new sessions carry the bank selected at checkout.
            var bankName = "Vietcombank";
            var accountNumber = "1012345678";
            var accountHolder = "CNTHHT Store";

            if (!string.IsNullOrWhiteSpace(session.OrderPayloadJson))
            {
                try
                {
                    var payload = JsonSerializer.Deserialize<CreateOrderDto>(session.OrderPayloadJson, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                    if (!string.IsNullOrWhiteSpace(payload?.PaymentBankName)) bankName = payload.PaymentBankName.Trim();
                    if (!string.IsNullOrWhiteSpace(payload?.PaymentBankAccountNumber)) accountNumber = payload.PaymentBankAccountNumber.Trim();
                    if (!string.IsNullOrWhiteSpace(payload?.PaymentBankAccountHolder)) accountHolder = payload.PaymentBankAccountHolder.Trim();
                }
                catch (JsonException)
                {
                    // Invalid legacy checkout metadata should not hide the payment QR.
                }
            }

            var bankCode = NormalizeBankCode(bankName);
            var cleanAccount = new string(accountNumber.Where(char.IsLetterOrDigit).ToArray());
            var query = new List<string>
            {
                $"amount={Uri.EscapeDataString(Math.Round(session.Amount).ToString("0", System.Globalization.CultureInfo.InvariantCulture))}",
                $"addInfo={Uri.EscapeDataString(session.SessionId)}"
            };
            if (!string.IsNullOrWhiteSpace(accountHolder))
                query.Add($"accountName={Uri.EscapeDataString(accountHolder)}");

            var qrUrl = $"https://img.vietqr.io/image/{Uri.EscapeDataString(bankCode)}-{Uri.EscapeDataString(cleanAccount)}-compact.png?{string.Join("&", query)}";
            return new QrPaymentInfo(bankName, accountNumber, accountHolder, qrUrl);
        }

        private static string NormalizeBankCode(string bankName)
        {
            var key = new string(bankName.Where(char.IsLetterOrDigit).ToArray()).ToLowerInvariant();
            return key switch
            {
                "vietcombank" or "vcb" => "VCB",
                "techcombank" or "tcb" => "TCB",
                "mbbank" or "mb" => "MB",
                "bidv" => "BIDV",
                "vietinbank" or "vietin" => "ICB",
                "agribank" => "VBA",
                "acb" => "ACB",
                "sacombank" => "STB",
                "tpbank" => "TPB",
                "vpbank" => "VPB",
                _ => bankName.Trim().ToUpperInvariant()
            };
        }

        private sealed record QrPaymentInfo(string BankName, string AccountNumber, string AccountHolder, string QrUrl);

        private static void NormalizeCheckoutPayload(CreateOrderDto payload)
        {
            if (!string.Equals(payload.ShippingMethod, "Delivery", StringComparison.OrdinalIgnoreCase))
                return;

            if (!string.IsNullOrWhiteSpace(payload.ShippingAddress))
                return;

            var parts = new[] { payload.AddressDetail, payload.Ward, payload.District, payload.Province }
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Select(x => x!.Trim());
            var address = string.Join(", ", parts);
            if (!string.IsNullOrWhiteSpace(address))
            {
                payload.ShippingAddress = address;
            }
        }

        private static DateTime AsUtc(DateTime value)
        {
            return value.Kind == DateTimeKind.Utc
                ? value
                : DateTime.SpecifyKind(value, DateTimeKind.Utc);
        }

        private static DateTime? AsUtc(DateTime? value)
        {
            return value.HasValue ? AsUtc(value.Value) : null;
        }

        private Guid? CurrentUserId()
        {
            var raw = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                      User.FindFirst("sub")?.Value ??
                      User.FindFirst("id")?.Value;
            return Guid.TryParse(raw, out var value) ? value : null;
        }
    }

    public class CreatePaymentSessionRequest
    {
        public int? OrderId { get; set; }
        public decimal Amount { get; set; }
        public CreateOrderDto? OrderPayload { get; set; }
    }

    public class MockConfirmRequest
    {
        public string SessionId { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Status { get; set; } = "SUCCESS";
        public string? TransactionId { get; set; }
    }

    public class MockConfirmTokenRequest
    {
        public string Token { get; set; } = string.Empty;
        public string Status { get; set; } = "SUCCESS";
        public string? TransactionId { get; set; }
    }
}
