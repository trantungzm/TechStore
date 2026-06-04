using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddStoreSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "StoreSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StoreName = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Hotline = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    SupportEmail = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    WarrantyAddress = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DefaultShippingFee = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    FreeShippingThreshold = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    SupportTime = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    LogoUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    FacebookUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ZaloUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StoreSettings", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "StoreSettings",
                columns: new[] { "Id", "Address", "CreatedAt", "DefaultShippingFee", "FacebookUrl", "FreeShippingThreshold", "Hotline", "LogoUrl", "StoreName", "SupportEmail", "SupportTime", "UpdatedAt", "WarrantyAddress", "ZaloUrl" },
                values: new object[] { 1, "", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0m, "", null, "0327 188 459", "", "CNTHHT Store", "support@cnthht.vn", "", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "", "" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StoreSettings");

        }
    }
}
