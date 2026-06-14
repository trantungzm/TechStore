using System;

namespace BaseCore.Entities
{
    public class StoreSetting
    {
        public int Id { get; set; }
        public string StoreName { get; set; } = string.Empty;
        public string Hotline { get; set; } = string.Empty;
        public string? SupportEmail { get; set; }
        public string? Address { get; set; }
        public string? WarrantyAddress { get; set; }
        public decimal DefaultShippingFee { get; set; }
        public decimal? FreeShippingThreshold { get; set; }
        public string? SupportTime { get; set; }
        public string? LogoUrl { get; set; }
        public string? FacebookUrl { get; set; }
        public string? ZaloUrl { get; set; }
        public string? BankName { get; set; }
        public string? BankAccountNumber { get; set; }
        public string? BankAccountHolder { get; set; }
        // Danh sách nhiều tài khoản ngân hàng nhận chuyển khoản (JSON: [{bankName, accountNumber, accountHolder}]).
        public string? BankAccountsJson { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
