using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddProductOriginalPrice : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "OriginalPrice",
                table: "Products",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1,
                column: "OriginalPrice",
                value: null);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2,
                column: "OriginalPrice",
                value: null);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3,
                column: "OriginalPrice",
                value: null);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 4,
                column: "OriginalPrice",
                value: null);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 5,
                column: "OriginalPrice",
                value: null);

            migrationBuilder.Sql(@"
                UPDATE p
                SET
                    p.OriginalPrice = p.MaxPrice,
                    p.MaxPrice = COALESCE(p.BasePrice, p.MinPrice, p.MaxPrice)
                FROM Products p
                WHERE
                    p.OriginalPrice IS NULL
                    AND p.MaxPrice IS NOT NULL
                    AND COALESCE(p.BasePrice, p.MinPrice, 0) > 0
                    AND p.MaxPrice > COALESCE(p.BasePrice, p.MinPrice, 0)
                    AND NOT EXISTS (
                        SELECT 1
                        FROM ProductVariants v
                        WHERE v.ProductId = p.Id
                    );
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OriginalPrice",
                table: "Products");
        }
    }
}
