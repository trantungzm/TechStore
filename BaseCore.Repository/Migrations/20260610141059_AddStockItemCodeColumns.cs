using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddStockItemCodeColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Imei",
                table: "StockItems",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InternalCode",
                table: "StockItems",
                type: "nvarchar(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SerialNumber",
                table: "StockItems",
                type: "nvarchar(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_StockItems_Imei",
                table: "StockItems",
                column: "Imei",
                unique: true,
                filter: "[Imei] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_StockItems_InternalCode",
                table: "StockItems",
                column: "InternalCode",
                unique: true,
                filter: "[InternalCode] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_StockItems_SerialNumber",
                table: "StockItems",
                column: "SerialNumber",
                unique: true,
                filter: "[SerialNumber] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_StockItems_Imei",
                table: "StockItems");

            migrationBuilder.DropIndex(
                name: "IX_StockItems_InternalCode",
                table: "StockItems");

            migrationBuilder.DropIndex(
                name: "IX_StockItems_SerialNumber",
                table: "StockItems");

            migrationBuilder.DropColumn(
                name: "Imei",
                table: "StockItems");

            migrationBuilder.DropColumn(
                name: "InternalCode",
                table: "StockItems");

            migrationBuilder.DropColumn(
                name: "SerialNumber",
                table: "StockItems");
        }
    }
}
