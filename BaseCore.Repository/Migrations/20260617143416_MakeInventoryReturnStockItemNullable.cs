using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class MakeInventoryReturnStockItemNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "StockItemId",
                table: "InventoryReturns",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF EXISTS (SELECT 1 FROM [InventoryReturns] WHERE [StockItemId] IS NULL)
                    THROW 50000, 'Cannot revert MakeInventoryReturnStockItemNullable because InventoryReturns contains NULL StockItemId values.', 1;
                """);

            migrationBuilder.AlterColumn<int>(
                name: "StockItemId",
                table: "InventoryReturns",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);
        }
    }
}
