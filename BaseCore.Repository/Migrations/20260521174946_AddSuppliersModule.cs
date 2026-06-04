using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddSuppliersModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SupplierId",
                table: "StockItems",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SupplierId",
                table: "GoodsReceipts",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Suppliers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    Address = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    TaxCode = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    Note = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Suppliers", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 21, 17, 49, 44, 136, DateTimeKind.Utc).AddTicks(6988));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 21, 17, 49, 44, 136, DateTimeKind.Utc).AddTicks(7016));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 21, 17, 49, 44, 136, DateTimeKind.Utc).AddTicks(7020));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 21, 17, 49, 44, 136, DateTimeKind.Utc).AddTicks(7024));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 21, 17, 49, 44, 136, DateTimeKind.Utc).AddTicks(7027));

            migrationBuilder.InsertData(
                table: "Suppliers",
                columns: new[] { "Id", "Address", "Code", "CreatedAt", "Email", "IsActive", "Name", "Note", "Phone", "TaxCode", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "Vietnam", "SUP-APPLE", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "sales@apple.com", true, "Apple VN", null, "02873001999", null, null },
                    { 2, "Vietnam", "SUP-SAMSUNG", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "sales@samsung.com", true, "Samsung Electronics", null, "1800588899", null, null },
                    { 3, "Main warehouse", "SUP-DISTRO", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "contact@cnthht.vn", true, "CNTHHT Distribution", null, "0327188459", null, null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_StockItems_SupplierId",
                table: "StockItems",
                column: "SupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_GoodsReceipts_SupplierId",
                table: "GoodsReceipts",
                column: "SupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_Code",
                table: "Suppliers",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_Name",
                table: "Suppliers",
                column: "Name");

            migrationBuilder.AddForeignKey(
                name: "FK_GoodsReceipts_Suppliers_SupplierId",
                table: "GoodsReceipts",
                column: "SupplierId",
                principalTable: "Suppliers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_StockItems_Suppliers_SupplierId",
                table: "StockItems",
                column: "SupplierId",
                principalTable: "Suppliers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GoodsReceipts_Suppliers_SupplierId",
                table: "GoodsReceipts");

            migrationBuilder.DropForeignKey(
                name: "FK_StockItems_Suppliers_SupplierId",
                table: "StockItems");

            migrationBuilder.DropTable(
                name: "Suppliers");

            migrationBuilder.DropIndex(
                name: "IX_StockItems_SupplierId",
                table: "StockItems");

            migrationBuilder.DropIndex(
                name: "IX_GoodsReceipts_SupplierId",
                table: "GoodsReceipts");

            migrationBuilder.DropColumn(
                name: "SupplierId",
                table: "StockItems");

            migrationBuilder.DropColumn(
                name: "SupplierId",
                table: "GoodsReceipts");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 21, 15, 58, 55, 523, DateTimeKind.Utc).AddTicks(9569));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 21, 15, 58, 55, 523, DateTimeKind.Utc).AddTicks(9596));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 21, 15, 58, 55, 523, DateTimeKind.Utc).AddTicks(9601));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 21, 15, 58, 55, 523, DateTimeKind.Utc).AddTicks(9605));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 21, 15, 58, 55, 523, DateTimeKind.Utc).AddTicks(9608));
        }
    }
}
