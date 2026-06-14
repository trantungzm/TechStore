namespace BaseCore.Common
{
    /// <summary>
    /// Single source of truth for the string-based status / type values used across
    /// the store domain. Groups marked "DB-enforced" also have a matching SQL CHECK
    /// constraint (see migration AddStatusCheckConstraints) and MUST stay in sync with it.
    /// The remaining groups are advisory (no DB constraint) because their value set is
    /// produced dynamically and is intentionally open.
    /// </summary>
    public static class StatusConstants
    {
        // ---- DB-enforced (CHECK constraint) ----

        /// <summary>StockItems.Status — DB-enforced.</summary>
        public static class StockItemStatuses
        {
            public const string InStock = "InStock";
            public const string Reserved = "Reserved";
            public const string Sold = "Sold";
            public const string Returned = "Returned";
            public const string Repairing = "Repairing";
            public const string Warranty = "Warranty";
            public const string Damaged = "Damaged";
            public const string Lost = "Lost";
            public static readonly string[] All = { InStock, Reserved, Sold, Returned, Repairing, Warranty, Damaged, Lost };
        }

        /// <summary>InventoryReturns.Status — DB-enforced.</summary>
        public static class InventoryReturnStatuses
        {
            public const string Pending = "Pending";
            public const string Approved = "Approved";
            public const string Rejected = "Rejected";
            public const string Restocked = "Restocked";
            public const string Damaged = "Damaged";
            public static readonly string[] All = { Pending, Approved, Rejected, Restocked, Damaged };
        }

        /// <summary>InventoryReturns.Condition — DB-enforced.</summary>
        public static class ReturnConditions
        {
            public const string New = "New";
            public const string OpenBox = "OpenBox";
            public const string Used = "Used";
            public const string Damaged = "Damaged";
            public const string Defective = "Defective";
            public static readonly string[] All = { New, OpenBox, Used, Damaged, Defective };
        }

        /// <summary>Coupons.Type — DB-enforced.</summary>
        public static class CouponTypes
        {
            public const string Product = "Product";
            public const string Shipping = "Shipping";
            public static readonly string[] All = { Product, Shipping };
        }

        /// <summary>Coupons.DiscountType — DB-enforced.</summary>
        public static class CouponDiscountTypes
        {
            public const string Amount = "Amount";
            public const string Percent = "Percent";
            public const string FreeShipping = "FreeShipping";
            public static readonly string[] All = { Amount, Percent, FreeShipping };
        }

        /// <summary>VoucherSpins.ResultType — DB-enforced.</summary>
        public static class VoucherSpinResultTypes
        {
            public const string Coupon = "Coupon";
            public const string NoReward = "NoReward";
            public static readonly string[] All = { Coupon, NoReward };
        }

        /// <summary>UserCoupons.Status — DB-enforced.</summary>
        public static class UserCouponStatuses
        {
            public const string Claimed = "Claimed";
            public const string Used = "Used";
            public const string Removed = "Removed";
            public const string Expired = "Expired";
            public static readonly string[] All = { Claimed, Used, Removed, Expired };
        }

        // ---- Advisory only (no DB CHECK; value set is open / dynamically produced) ----

        /// <summary>Orders.Status (advisory).</summary>
        public static class OrderStatuses
        {
            public const string Pending = "Pending";
            public const string Confirmed = "Confirmed";
            public const string Processing = "Processing";
            public const string Shipping = "Shipping";
            public const string Shipped = "Shipped";
            public const string Delivered = "Delivered";
            public const string Completed = "Completed";
            public const string ReadyForPickup = "ReadyForPickup";
            public const string CancelRequested = "CancelRequested";
            public const string Cancelled = "Cancelled";
            public const string Returned = "Returned";
            public const string DeliveryFailed = "DeliveryFailed";
        }

        /// <summary>Orders.PaymentStatus (advisory).</summary>
        public static class PaymentStatuses
        {
            public const string Unpaid = "Unpaid";
            public const string Paid = "Paid";
            public const string Refunded = "Refunded";
        }

        /// <summary>Shared priority values (advisory).</summary>
        public static class Priorities
        {
            public const string Low = "Low";
            public const string Normal = "Normal";
            public const string High = "High";
            public const string Urgent = "Urgent";
        }

        /// <summary>WarrantyRecords.Status (advisory).</summary>
        public static class WarrantyRecordStatuses
        {
            public const string NotActivated = "NotActivated";
            public const string Active = "Active";
            public const string Expired = "Expired";
        }

        /// <summary>WarrantyClaims.Status (advisory).</summary>
        public static class WarrantyClaimStatuses
        {
            public const string Pending = "Pending";
            public const string Confirmed = "Confirmed";
            public const string Received = "Received";
            public const string Diagnosing = "Diagnosing";
            public const string Repairing = "Repairing";
            public const string Completed = "Completed";
            public const string Rejected = "Rejected";
        }

        /// <summary>RepairCases.Status (advisory).</summary>
        public static class RepairStatuses
        {
            public const string Intake = "Intake";
            public const string Diagnosing = "Diagnosing";
            public const string Repairing = "Repairing";
            public const string Completed = "Completed";
            public const string Delivered = "Delivered";
            public const string Cancelled = "Cancelled";
        }

        /// <summary>SupportTickets.Status (advisory).</summary>
        public static class SupportTicketStatuses
        {
            public const string Open = "Open";
            public const string InProgress = "InProgress";
            public const string WaitingCustomer = "WaitingCustomer";
            public const string Resolved = "Resolved";
            public const string Closed = "Closed";
        }

        /// <summary>StockMovements.Type (advisory — open set).</summary>
        public static class StockMovementTypes
        {
            public const string Receipt = "Receipt";
            public const string Sale = "Sale";
            public const string Return = "Return";
            public const string OpeningStock = "OpeningStock";
            public const string Adjust = "Adjust";
            public const string Damage = "Damage";
            public const string Warranty = "Warranty";
            public const string Repair = "Repair";
        }

        /// <summary>StockMovements.ReferenceType (advisory — open set).</summary>
        public static class StockMovementReferenceTypes
        {
            public const string GoodsReceipt = "GoodsReceipt";
            public const string Order = "Order";
            public const string OpeningStock = "OpeningStock";
            public const string Return = "Return";
            public const string Manual = "Manual";
        }
    }
}
