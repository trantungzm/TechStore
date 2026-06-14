using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddStatusCheckConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddCheckConstraint(
                name: "CK_VoucherSpins_ResultType",
                table: "VoucherSpins",
                sql: "[ResultType] IN ('Coupon','NoReward')");

            migrationBuilder.AddCheckConstraint(
                name: "CK_UserCoupons_Status",
                table: "UserCoupons",
                sql: "[Status] IN ('Claimed','Used','Removed','Expired')");

            migrationBuilder.AddCheckConstraint(
                name: "CK_StockItems_Status",
                table: "StockItems",
                sql: "[Status] IN ('InStock','Reserved','Sold','Returned','Repairing','Warranty','Damaged','Lost')");

            migrationBuilder.AddCheckConstraint(
                name: "CK_InventoryReturns_Condition",
                table: "InventoryReturns",
                sql: "[Condition] IN ('New','OpenBox','Used','Damaged','Defective')");

            migrationBuilder.AddCheckConstraint(
                name: "CK_InventoryReturns_Status",
                table: "InventoryReturns",
                sql: "[Status] IN ('Pending','Approved','Rejected','Restocked','Damaged')");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Coupons_DiscountType",
                table: "Coupons",
                sql: "[DiscountType] IN ('Amount','Percent','FreeShipping')");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Coupons_Type",
                table: "Coupons",
                sql: "[Type] IN ('Product','Shipping')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_VoucherSpins_ResultType",
                table: "VoucherSpins");

            migrationBuilder.DropCheckConstraint(
                name: "CK_UserCoupons_Status",
                table: "UserCoupons");

            migrationBuilder.DropCheckConstraint(
                name: "CK_StockItems_Status",
                table: "StockItems");

            migrationBuilder.DropCheckConstraint(
                name: "CK_InventoryReturns_Condition",
                table: "InventoryReturns");

            migrationBuilder.DropCheckConstraint(
                name: "CK_InventoryReturns_Status",
                table: "InventoryReturns");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Coupons_DiscountType",
                table: "Coupons");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Coupons_Type",
                table: "Coupons");
        }
    }
}
