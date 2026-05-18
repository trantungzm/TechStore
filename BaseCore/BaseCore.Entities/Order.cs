using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

namespace BaseCore.Entities
{
    public class Order
    {
        [BsonId]
        public int Id { get; set; }

        public string? OrderCode { get; set; }

        [BsonRepresentation(BsonType.String)]
        public Guid? UserId { get; set; }

        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string? CustomerEmail { get; set; }

        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        public decimal Subtotal { get; set; }
        public decimal ProductDiscount { get; set; }
        public decimal ShippingFee { get; set; }
        public decimal ShippingDiscount { get; set; }
        public decimal TotalAmount { get; set; }

        public string? Status { get; set; } = "Pending";
        public string? PaymentMethod { get; set; }
        public string? PaymentStatus { get; set; } = "Unpaid";
        public string? TransactionId { get; set; }
        public string? ShippingMethod { get; set; }

        public string? ShippingAddress { get; set; }
        public string? Province { get; set; }
        public string? District { get; set; }
        public string? Ward { get; set; }
        public string? AddressDetail { get; set; }
        public string? StorePickupLocation { get; set; }
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

        [BsonRepresentation(BsonType.String)]
        public Guid? CancelReviewedByUserId { get; set; }

        public string? CancelReviewNote { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        [BsonRepresentation(BsonType.String)]
        public Guid? UpdatedByUserId { get; set; }

        public List<OrderDetail> OrderDetails { get; set; } = new();
        public List<OrderTimeline> Timelines { get; set; } = new();
        public List<OrderCancellation> Cancellations { get; set; } = new();
        public List<OrderCoupon> Coupons { get; set; } = new();
    }
}
