using System;

namespace BaseCore.Entities
{
    /// <summary>
    /// Hãng (thương hiệu) thuộc một danh mục. Dùng làm master để chọn ở form sản phẩm.
    /// Product.Brand vẫn lưu tên hãng được chọn (string) để giữ tương thích coupon scope / bộ lọc shop.
    /// </summary>
    public class Brand
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public int CategoryId { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
