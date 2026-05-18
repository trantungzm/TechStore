using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddCouponVoucherModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Coupons",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Type = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    DiscountType = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    DiscountValue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    MaxDiscountAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    MinOrderAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    StartAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TotalQuantity = table.Column<int>(type: "int", nullable: false),
                    UsedQuantity = table.Column<int>(type: "int", nullable: false),
                    ClaimedQuantity = table.Column<int>(type: "int", nullable: false),
                    PerUserLimit = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsPublic = table.Column<bool>(type: "bit", nullable: false),
                    IsAutoClaimable = table.Column<bool>(type: "bit", nullable: false),
                    IsStackable = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Coupons", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CouponScopes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CouponId = table.Column<int>(type: "int", nullable: false),
                    ScopeType = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: true),
                    CategoryId = table.Column<int>(type: "int", nullable: true),
                    Brand = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CouponScopes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CouponScopes_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_CouponScopes_Coupons_CouponId",
                        column: x => x.CouponId,
                        principalTable: "Coupons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CouponScopes_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "UserCoupons",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CouponId = table.Column<int>(type: "int", nullable: false),
                    ClaimedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UsedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false, defaultValue: "Claimed"),
                    ExpiredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserCoupons", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserCoupons_Coupons_CouponId",
                        column: x => x.CouponId,
                        principalTable: "Coupons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "VoucherSpins",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SpinDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RewardCouponId = table.Column<int>(type: "int", nullable: true),
                    RewardCode = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: true),
                    ResultType = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VoucherSpins", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VoucherSpins_Coupons_RewardCouponId",
                        column: x => x.RewardCouponId,
                        principalTable: "Coupons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "OrderCoupons",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderId = table.Column<int>(type: "int", nullable: false),
                    CouponId = table.Column<int>(type: "int", nullable: false),
                    UserCouponId = table.Column<int>(type: "int", nullable: true),
                    CouponCode = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    CouponName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CouponType = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    DiscountType = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    DiscountValue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderCoupons", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderCoupons_Coupons_CouponId",
                        column: x => x.CouponId,
                        principalTable: "Coupons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OrderCoupons_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrderCoupons_UserCoupons_UserCouponId",
                        column: x => x.UserCouponId,
                        principalTable: "UserCoupons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.InsertData(
                table: "Coupons",
                columns: new[] { "Id", "ClaimedQuantity", "Code", "CreatedAt", "CreatedByUserId", "Description", "DiscountType", "DiscountValue", "EndAt", "IsActive", "IsAutoClaimable", "IsPublic", "IsStackable", "MaxDiscountAmount", "MinOrderAmount", "Name", "PerUserLimit", "StartAt", "TotalQuantity", "Type", "UpdatedAt", "UsedQuantity" },
                values: new object[,]
                {
                    { 1, 0, "FREESHIP", new DateTime(2026, 5, 17, 0, 0, 0, 0, DateTimeKind.Utc), null, "Mien phi van chuyen cho don giao hang", "FreeShipping", 100m, new DateTime(2026, 6, 17, 23, 59, 59, 0, DateTimeKind.Utc), true, true, true, false, null, 0m, "Mien phi van chuyen", 1, new DateTime(2026, 5, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1000, "Shipping", null, 0 },
                    { 2, 0, "SHIP20K", new DateTime(2026, 5, 17, 0, 0, 0, 0, DateTimeKind.Utc), null, "Giam 20.000d phi giao hang", "Amount", 20000m, new DateTime(2026, 6, 17, 23, 59, 59, 0, DateTimeKind.Utc), true, true, true, false, null, 0m, "Giam 20K phi van chuyen", 1, new DateTime(2026, 5, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1000, "Shipping", null, 0 },
                    { 3, 0, "GIAM10", new DateTime(2026, 5, 17, 0, 0, 0, 0, DateTimeKind.Utc), null, "Giam 10% toi da 100.000d cho don tu 1.000.000d", "Percent", 10m, new DateTime(2026, 6, 17, 23, 59, 59, 0, DateTimeKind.Utc), true, true, true, false, 100000m, 1000000m, "Giam 10% don hang", 1, new DateTime(2026, 5, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1000, "Product", null, 0 },
                    { 4, 0, "SALE50K", new DateTime(2026, 5, 17, 0, 0, 0, 0, DateTimeKind.Utc), null, "Giam 50.000d cho don tu 2.000.000d", "Amount", 50000m, new DateTime(2026, 6, 17, 23, 59, 59, 0, DateTimeKind.Utc), true, true, true, false, null, 2000000m, "Giam 50K cho don tu 2 trieu", 1, new DateTime(2026, 5, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1000, "Product", null, 0 },
                    { 5, 0, "PHUKIEN20", new DateTime(2026, 5, 17, 0, 0, 0, 0, DateTimeKind.Utc), null, "Giam 20% toi da 80.000d cho phu kien", "Percent", 20m, new DateTime(2026, 6, 17, 23, 59, 59, 0, DateTimeKind.Utc), true, true, true, false, 80000m, 0m, "Giam 20% phu kien", 1, new DateTime(2026, 5, 17, 0, 0, 0, 0, DateTimeKind.Utc), 500, "Product", null, 0 },
                    { 6, 0, "LAPTOP5", new DateTime(2026, 5, 17, 0, 0, 0, 0, DateTimeKind.Utc), null, "Giam 5% toi da 500.000d cho laptop", "Percent", 5m, new DateTime(2026, 6, 17, 23, 59, 59, 0, DateTimeKind.Utc), true, true, true, false, 500000m, 0m, "Giam 5% laptop", 1, new DateTime(2026, 5, 17, 0, 0, 0, 0, DateTimeKind.Utc), 500, "Product", null, 0 }
                });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 18, 2, 13, 14, 787, DateTimeKind.Utc).AddTicks(8248));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 18, 2, 13, 14, 787, DateTimeKind.Utc).AddTicks(8260));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 18, 2, 13, 14, 787, DateTimeKind.Utc).AddTicks(8263));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 18, 2, 13, 14, 787, DateTimeKind.Utc).AddTicks(8386));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 18, 2, 13, 14, 787, DateTimeKind.Utc).AddTicks(8389));

            migrationBuilder.InsertData(
                table: "CouponScopes",
                columns: new[] { "Id", "Brand", "CategoryId", "CouponId", "CreatedAt", "ProductId", "ScopeType" },
                values: new object[,]
                {
                    { 1, null, null, 1, new DateTime(2026, 5, 17, 0, 0, 0, 0, DateTimeKind.Utc), null, "All" },
                    { 2, null, null, 2, new DateTime(2026, 5, 17, 0, 0, 0, 0, DateTimeKind.Utc), null, "All" },
                    { 3, null, null, 3, new DateTime(2026, 5, 17, 0, 0, 0, 0, DateTimeKind.Utc), null, "All" },
                    { 4, null, null, 4, new DateTime(2026, 5, 17, 0, 0, 0, 0, DateTimeKind.Utc), null, "All" },
                    { 5, null, 7, 5, new DateTime(2026, 5, 17, 0, 0, 0, 0, DateTimeKind.Utc), null, "Category" },
                    { 6, null, 1, 6, new DateTime(2026, 5, 17, 0, 0, 0, 0, DateTimeKind.Utc), null, "Category" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Coupons_Code",
                table: "Coupons",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CouponScopes_CategoryId",
                table: "CouponScopes",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_CouponScopes_CouponId",
                table: "CouponScopes",
                column: "CouponId");

            migrationBuilder.CreateIndex(
                name: "IX_CouponScopes_ProductId",
                table: "CouponScopes",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderCoupons_CouponId",
                table: "OrderCoupons",
                column: "CouponId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderCoupons_OrderId_CouponType",
                table: "OrderCoupons",
                columns: new[] { "OrderId", "CouponType" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrderCoupons_UserCouponId",
                table: "OrderCoupons",
                column: "UserCouponId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCoupons_CouponId",
                table: "UserCoupons",
                column: "CouponId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCoupons_UserId_CouponId",
                table: "UserCoupons",
                columns: new[] { "UserId", "CouponId" });

            migrationBuilder.CreateIndex(
                name: "IX_VoucherSpins_RewardCouponId",
                table: "VoucherSpins",
                column: "RewardCouponId");

            migrationBuilder.CreateIndex(
                name: "IX_VoucherSpins_UserId_SpinDate",
                table: "VoucherSpins",
                columns: new[] { "UserId", "SpinDate" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CouponScopes");

            migrationBuilder.DropTable(
                name: "OrderCoupons");

            migrationBuilder.DropTable(
                name: "VoucherSpins");

            migrationBuilder.DropTable(
                name: "UserCoupons");

            migrationBuilder.DropTable(
                name: "Coupons");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 18, 1, 58, 44, 499, DateTimeKind.Utc).AddTicks(7118));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 18, 1, 58, 44, 499, DateTimeKind.Utc).AddTicks(7142));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 18, 1, 58, 44, 499, DateTimeKind.Utc).AddTicks(7144));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 18, 1, 58, 44, 499, DateTimeKind.Utc).AddTicks(7146));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 18, 1, 58, 44, 499, DateTimeKind.Utc).AddTicks(7148));
        }
    }
}
