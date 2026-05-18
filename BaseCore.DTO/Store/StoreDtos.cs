using BaseCore.DTO.Coupons;

namespace BaseCore.DTO.Store
{
    public class CategoryUpsertDto
    {
        public string Name { get; set; } = "";
        public string? Description { get; set; }
    }

    public class ProductCreateDto
    {
        public string Name { get; set; } = "";
        public string? Slug { get; set; }
        public string? Sku { get; set; }
        public decimal Price { get; set; }
        public decimal? OriginalPrice { get; set; }
        public int Stock { get; set; }
        public int CategoryId { get; set; }
        public string? Description { get; set; }
        public string? LongDescription { get; set; }
        public string? Brand { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsFeatured { get; set; }
        public bool IsBestSeller { get; set; }
        public bool IsNewArrival { get; set; }
        public bool IsDiscounted { get; set; }
        public bool RequiresSerialTracking { get; set; }
        public int WarrantyMonths { get; set; } = 12;
        public List<ProductImageDto> Images { get; set; } = new();
        public List<ProductVariantDto> Variants { get; set; } = new();
    }

    public class ProductUpdateDto
    {
        public string? Name { get; set; }
        public string? Slug { get; set; }
        public string? Sku { get; set; }
        public decimal? Price { get; set; }
        public decimal? OriginalPrice { get; set; }
        public int? Stock { get; set; }
        public int? CategoryId { get; set; }
        public string? Description { get; set; }
        public string? LongDescription { get; set; }
        public string? Brand { get; set; }
        public string? ImageUrl { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsFeatured { get; set; }
        public bool? IsBestSeller { get; set; }
        public bool? IsNewArrival { get; set; }
        public bool? IsDiscounted { get; set; }
        public bool? RequiresSerialTracking { get; set; }
        public int? WarrantyMonths { get; set; }
        public List<ProductImageDto>? Images { get; set; }
        public List<ProductVariantDto>? Variants { get; set; }
    }

    public class ProductSearchDto
    {
        public string? Keyword { get; set; }
        public int? CategoryId { get; set; }
        public string? CategorySlug { get; set; }
        public string? Brand { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public bool? InStock { get; set; }
        public bool? IsFeatured { get; set; }
        public bool? IsBestSeller { get; set; }
        public bool? IsNewArrival { get; set; }
        public bool? IsDiscounted { get; set; }
        public string? SortBy { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class ProductListDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string? Slug { get; set; }
        public string? Sku { get; set; }
        public decimal Price { get; set; }
        public decimal? OriginalPrice { get; set; }
        public int Stock { get; set; }
        public string? ImageUrl { get; set; }
        public string? Description { get; set; }
        public string? Brand { get; set; }
        public int CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public bool IsActive { get; set; }
        public bool IsFeatured { get; set; }
        public bool IsBestSeller { get; set; }
        public bool IsNewArrival { get; set; }
        public bool IsDiscounted { get; set; }
        public bool RequiresSerialTracking { get; set; }
        public int WarrantyMonths { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class ProductDetailDto : ProductListDto
    {
        public string? LongDescription { get; set; }
        public List<ProductImageDto> Images { get; set; } = new();
        public List<ProductVariantDto> Variants { get; set; } = new();
        public List<ProductSpecValueDto> Specs { get; set; } = new();
        public List<RecommendationDto> Recommendations { get; set; } = new();
    }

    public class ProductImageDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ImageUrl { get; set; } = "";
        public string? AltText { get; set; }
        public int SortOrder { get; set; }
        public bool IsPrimary { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ProductVariantDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string? VariantName { get; set; }
        public string? ColorName { get; set; }
        public string? ColorCode { get; set; }
        public string? Storage { get; set; }
        public string? Ram { get; set; }
        public decimal? Price { get; set; }
        public decimal? OriginalPrice { get; set; }
        public int Stock { get; set; }
        public string? Sku { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class SpecDefinitionDto
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public string Name { get; set; } = "";
        public string Code { get; set; } = "";
        public string DataType { get; set; } = "text";
        public string? Unit { get; set; }
        public int SortOrder { get; set; }
        public bool IsComparable { get; set; } = true;
        public bool IsFilterable { get; set; }
        public bool IsRequired { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class ProductSpecValueDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public int SpecDefinitionId { get; set; }
        public string? Name { get; set; }
        public string? Code { get; set; }
        public string? DataType { get; set; }
        public string? Unit { get; set; }
        public string? ValueText { get; set; }
        public decimal? ValueNumber { get; set; }
        public bool? ValueBool { get; set; }
        public object? Value { get; set; }
    }

    public class ProductSpecValueUpsertDto
    {
        public int SpecDefinitionId { get; set; }
        public string? ValueText { get; set; }
        public decimal? ValueNumber { get; set; }
        public bool? ValueBool { get; set; }
    }

    public class RecommendationDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public int RecommendedProductId { get; set; }
        public string Type { get; set; } = "CrossSell";
        public int SortOrder { get; set; }
        public ProductListDto? Product { get; set; }
    }

    public class CrossSellUpdateDto
    {
        public List<int> ProductIds { get; set; } = new();
    }

    public class CreateOrderDto
    {
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string? CustomerEmail { get; set; }
        public string? ShippingMethod { get; set; }
        public string? Province { get; set; }
        public string? District { get; set; }
        public string? Ward { get; set; }
        public string? AddressDetail { get; set; }
        public string? ShippingAddress { get; set; }
        public string? StorePickupLocation { get; set; }
        public DateTime? ExpectedPickupTime { get; set; }
        public string? PaymentMethod { get; set; }
        public string? Notes { get; set; }
        public bool InvoiceRequired { get; set; }
        public string? InvoiceCompanyName { get; set; }
        public string? InvoiceTaxCode { get; set; }
        public string? InvoiceAddress { get; set; }
        public string? InvoiceEmail { get; set; }
        public int? ProductUserCouponId { get; set; }
        public int? ShippingUserCouponId { get; set; }
        public List<OrderItemDto> Items { get; set; } = new();
    }

    public class OrderItemDto
    {
        public int ProductId { get; set; }
        public int? VariantId { get; set; }
        public string? ProductName { get; set; }
        public int Quantity { get; set; }
        public decimal? UnitPrice { get; set; }
    }

    public class UpdateOrderStatusDto
    {
        public string Status { get; set; } = "";
        public string? Note { get; set; }
    }

    public class CancelOrderDto
    {
        public string? Reason { get; set; }
    }

    public class RequestCancelOrderDto
    {
        public string? Reason { get; set; }
    }

    public class ReviewCancelOrderDto
    {
        public bool Approved { get; set; }
        public string? AdminNote { get; set; }
    }

    public class OrderListDto
    {
        public int Id { get; set; }
        public string? OrderCode { get; set; }
        public Guid? UserId { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string? CustomerEmail { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal Subtotal { get; set; }
        public decimal ProductDiscount { get; set; }
        public decimal ShippingFee { get; set; }
        public decimal ShippingDiscount { get; set; }
        public decimal TotalAmount { get; set; }
        public string? Status { get; set; }
        public string? PaymentMethod { get; set; }
        public string? PaymentStatus { get; set; }
        public string? ShippingMethod { get; set; }
        public string? ShippingAddress { get; set; }
        public string? StorePickupLocation { get; set; }
        public int ItemCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class OrderDetailDto : OrderListDto
    {
        public string? TransactionId { get; set; }
        public string? Province { get; set; }
        public string? District { get; set; }
        public string? Ward { get; set; }
        public string? AddressDetail { get; set; }
        public DateTime? ExpectedPickupTime { get; set; }
        public bool InvoiceRequired { get; set; }
        public string? InvoiceCompanyName { get; set; }
        public string? InvoiceTaxCode { get; set; }
        public string? InvoiceAddress { get; set; }
        public string? InvoiceEmail { get; set; }
        public string? Notes { get; set; }
        public string? CancelReason { get; set; }
        public DateTime? CancelRequestedAt { get; set; }
        public DateTime? CancelReviewedAt { get; set; }
        public Guid? CancelReviewedByUserId { get; set; }
        public string? CancelReviewNote { get; set; }
        public List<OrderItemDetailDto> Items { get; set; } = new();
        public List<OrderTimelineDto> Timeline { get; set; } = new();
        public List<OrderCouponDto> Coupons { get; set; } = new();
        public OrderCancellationDto? Cancellation { get; set; }
    }

    public class OrderItemDetailDto
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public int? VariantId { get; set; }
        public string? ProductName { get; set; }
        public string? ProductImage { get; set; }
        public string? Sku { get; set; }
        public string? SelectedColor { get; set; }
        public string? SelectedVersion { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public string? SerialOrImei { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class OrderTimelineDto
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public string Status { get; set; } = "";
        public string Title { get; set; } = "";
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid? CreatedByUserId { get; set; }
    }

    public class OrderCancellationDto
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public Guid? RequestedByUserId { get; set; }
        public string? Reason { get; set; }
        public string Status { get; set; } = "Pending";
        public string? AdminNote { get; set; }
        public Guid? ReviewedByUserId { get; set; }
        public DateTime RequestedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }
    }

    public class OrderSearchDto
    {
        public string? Keyword { get; set; }
        public string? Status { get; set; }
        public string? PaymentStatus { get; set; }
        public string? PaymentMethod { get; set; }
        public string? CustomerPhone { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 50;
        public string? SortBy { get; set; } = "newest";
    }
}
