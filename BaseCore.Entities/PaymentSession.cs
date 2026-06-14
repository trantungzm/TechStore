using System;

namespace BaseCore.Entities
{
    // Phiên thanh toán QR (mock): tạo khi khách chọn QR, xác nhận qua endpoint mock-confirm để giả lập "quét QR thành công".
    public class PaymentSession
    {
        public int Id { get; set; }
        public string SessionId { get; set; } = string.Empty; // vd PAY_8F4A21
        public string Token { get; set; } = string.Empty;     // bí mật, đối chiếu khi confirm
        public int? OrderId { get; set; }
        public Guid? UserId { get; set; }
        public string? OrderPayloadJson { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; } = "Pending";       // Pending | Paid | Expired
        public string? TransactionId { get; set; }
        public DateTime ExpiresAt { get; set; }
        public DateTime? PaidAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
