using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class RemoveAccessoryElectronicsCategories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DECLARE @CategoryIds TABLE (Id int PRIMARY KEY);
                INSERT INTO @CategoryIds VALUES (3), (9);

                DECLARE @ProductIds TABLE (Id int PRIMARY KEY);
                INSERT INTO @ProductIds
                SELECT Id FROM dbo.Products WHERE CategoryId IN (SELECT Id FROM @CategoryIds);

                DECLARE @SpecDefinitionIds TABLE (Id int PRIMARY KEY);
                INSERT INTO @SpecDefinitionIds
                SELECT Id FROM dbo.SpecDefinitions WHERE CategoryId IN (SELECT Id FROM @CategoryIds);

                DELETE FROM dbo.ProductRecommendations
                WHERE ProductId IN (SELECT Id FROM @ProductIds)
                   OR RecommendedProductId IN (SELECT Id FROM @ProductIds);

                DELETE FROM dbo.ProductSpecValues
                WHERE ProductId IN (SELECT Id FROM @ProductIds)
                   OR SpecDefinitionId IN (SELECT Id FROM @SpecDefinitionIds);

                DELETE FROM dbo.ProductImages WHERE ProductId IN (SELECT Id FROM @ProductIds);
                DELETE FROM dbo.ProductVariants WHERE ProductId IN (SELECT Id FROM @ProductIds);
                DELETE FROM dbo.OrderDetails WHERE ProductId IN (SELECT Id FROM @ProductIds);
                DELETE FROM dbo.GoodsReceiptLines WHERE ProductId IN (SELECT Id FROM @ProductIds);
                DELETE FROM dbo.InventoryTransactions WHERE ProductId IN (SELECT Id FROM @ProductIds);
                DELETE FROM dbo.StockItems WHERE ProductId IN (SELECT Id FROM @ProductIds);
                DELETE FROM dbo.WarrantyRecords WHERE ProductId IN (SELECT Id FROM @ProductIds);
                DELETE FROM dbo.RepairCases WHERE ProductId IN (SELECT Id FROM @ProductIds);
                DELETE FROM dbo.Products WHERE Id IN (SELECT Id FROM @ProductIds);

                DELETE FROM dbo.CategorySuppliers WHERE CategoryId IN (SELECT Id FROM @CategoryIds);
                DELETE FROM dbo.CouponScopes WHERE CategoryId IN (SELECT Id FROM @CategoryIds);
                UPDATE dbo.Suppliers SET CategoryId = NULL WHERE CategoryId IN (SELECT Id FROM @CategoryIds);
                DELETE FROM dbo.SpecOptions WHERE SpecDefinitionId IN (SELECT Id FROM @SpecDefinitionIds);
                DELETE FROM dbo.SpecDefinitions WHERE Id IN (SELECT Id FROM @SpecDefinitionIds);

                DELETE FROM dbo.Categories
                WHERE Id IN (SELECT Id FROM @CategoryIds)
                   OR Name IN (N'Accessories', N'Phụ kiện điện tử', N'Electronics', N'Thiết bị điện tử');
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Description", "Name" },
                values: new object[,]
                {
                    { 3, "Phu kien dien tu", "Accessories" },
                    { 9, "Thiet bi dien tu", "Electronics" }
                });
        }
    }
}
