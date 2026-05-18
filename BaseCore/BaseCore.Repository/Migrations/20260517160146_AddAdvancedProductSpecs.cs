using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddAdvancedProductSpecs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("IF COL_LENGTH('Products', 'Brand') IS NULL ALTER TABLE [Products] ADD [Brand] nvarchar(120) NULL;");
            migrationBuilder.Sql("IF COL_LENGTH('Products', 'CreatedAt') IS NULL ALTER TABLE [Products] ADD [CreatedAt] datetime2 NOT NULL CONSTRAINT [DF_Products_CreatedAt] DEFAULT (GETUTCDATE()) WITH VALUES;");
            migrationBuilder.Sql("IF COL_LENGTH('Products', 'IsActive') IS NULL ALTER TABLE [Products] ADD [IsActive] bit NOT NULL CONSTRAINT [DF_Products_IsActive] DEFAULT (CAST(1 AS bit)) WITH VALUES;");
            migrationBuilder.Sql("IF COL_LENGTH('Products', 'IsBestSeller') IS NULL ALTER TABLE [Products] ADD [IsBestSeller] bit NOT NULL CONSTRAINT [DF_Products_IsBestSeller] DEFAULT (CAST(0 AS bit)) WITH VALUES;");
            migrationBuilder.Sql("IF COL_LENGTH('Products', 'IsDiscounted') IS NULL ALTER TABLE [Products] ADD [IsDiscounted] bit NOT NULL CONSTRAINT [DF_Products_IsDiscounted] DEFAULT (CAST(0 AS bit)) WITH VALUES;");
            migrationBuilder.Sql("IF COL_LENGTH('Products', 'IsFeatured') IS NULL ALTER TABLE [Products] ADD [IsFeatured] bit NOT NULL CONSTRAINT [DF_Products_IsFeatured] DEFAULT (CAST(0 AS bit)) WITH VALUES;");
            migrationBuilder.Sql("IF COL_LENGTH('Products', 'IsNewArrival') IS NULL ALTER TABLE [Products] ADD [IsNewArrival] bit NOT NULL CONSTRAINT [DF_Products_IsNewArrival] DEFAULT (CAST(0 AS bit)) WITH VALUES;");
            migrationBuilder.Sql("IF COL_LENGTH('Products', 'LongDescription') IS NULL ALTER TABLE [Products] ADD [LongDescription] nvarchar(4000) NULL;");
            migrationBuilder.Sql("IF COL_LENGTH('Products', 'OriginalPrice') IS NULL ALTER TABLE [Products] ADD [OriginalPrice] decimal(18,2) NULL;");
            migrationBuilder.Sql("IF COL_LENGTH('Products', 'RequiresSerialTracking') IS NULL ALTER TABLE [Products] ADD [RequiresSerialTracking] bit NOT NULL CONSTRAINT [DF_Products_RequiresSerialTracking] DEFAULT (CAST(0 AS bit)) WITH VALUES;");
            migrationBuilder.Sql("IF COL_LENGTH('Products', 'Sku') IS NULL ALTER TABLE [Products] ADD [Sku] nvarchar(80) NULL;");
            migrationBuilder.Sql("IF COL_LENGTH('Products', 'Slug') IS NULL ALTER TABLE [Products] ADD [Slug] nvarchar(220) NULL;");
            migrationBuilder.Sql("IF COL_LENGTH('Products', 'UpdatedAt') IS NULL ALTER TABLE [Products] ADD [UpdatedAt] datetime2 NULL;");
            migrationBuilder.Sql("IF COL_LENGTH('Products', 'WarrantyMonths') IS NULL ALTER TABLE [Products] ADD [WarrantyMonths] int NOT NULL CONSTRAINT [DF_Products_WarrantyMonths] DEFAULT (12) WITH VALUES;");

            migrationBuilder.CreateTable(
                name: "ProductImages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    AltText = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductImages_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductRecommendations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    RecommendedProductId = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductRecommendations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductRecommendations_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductRecommendations_Products_RecommendedProductId",
                        column: x => x.RecommendedProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProductVariants",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    VariantName = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    ColorName = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    ColorCode = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: true),
                    Storage = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    Ram = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    Price = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    OriginalPrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    Stock = table.Column<int>(type: "int", nullable: false),
                    Sku = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductVariants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductVariants_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SpecDefinitions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CategoryId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DataType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false, defaultValue: "text"),
                    Unit = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsComparable = table.Column<bool>(type: "bit", nullable: false),
                    IsFilterable = table.Column<bool>(type: "bit", nullable: false),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpecDefinitions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SpecDefinitions_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductSpecValues",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    SpecDefinitionId = table.Column<int>(type: "int", nullable: false),
                    ValueText = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ValueNumber = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: true),
                    ValueBool = table.Column<bool>(type: "bit", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductSpecValues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductSpecValues_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductSpecValues_SpecDefinitions_SpecDefinitionId",
                        column: x => x.SpecDefinitionId,
                        principalTable: "SpecDefinitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Description", "Name" },
                values: new object[,]
                {
                    { 6, "May tinh bang", "Tablet" },
                    { 7, "Tai nghe va thiet bi am thanh", "Tai nghe" },
                    { 8, "Smartwatch", "Dong ho thong minh" },
                    { 9, "May anh va camera", "May anh" }
                });

            migrationBuilder.InsertData(
                table: "SpecDefinitions",
                columns: new[] { "Id", "CategoryId", "Code", "CreatedAt", "DataType", "IsComparable", "IsFilterable", "IsRequired", "Name", "SortOrder", "Unit", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, 1, "screenSize", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Kích thước màn hình", 1, null, null },
                    { 2, 1, "screenTechnology", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Công nghệ màn hình", 2, null, null },
                    { 3, 1, "rearCamera", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Camera sau", 3, null, null },
                    { 4, 1, "frontCamera", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Camera trước", 4, null, null },
                    { 5, 1, "chipset", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Chipset", 5, null, null },
                    { 6, 1, "ram", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "RAM", 6, null, null },
                    { 7, 1, "internalStorage", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Bộ nhớ trong", 7, null, null },
                    { 8, 1, "battery", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Pin", 8, null, null },
                    { 9, 1, "os", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Hệ điều hành", 9, null, null },
                    { 10, 2, "cpuType", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Loại CPU", 1, null, null },
                    { 11, 2, "ram", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Dung lượng RAM", 2, null, null },
                    { 12, 2, "hardDrive", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Ổ cứng", 3, null, null },
                    { 13, 2, "graphicsCard", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Card đồ họa", 4, null, null },
                    { 14, 2, "screenSize", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Kích thước màn hình", 5, null, null },
                    { 15, 2, "screenResolution", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Độ phân giải màn hình", 6, null, null },
                    { 16, 2, "battery", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Pin", 7, null, null },
                    { 17, 2, "os", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Hệ điều hành", 8, null, null },
                    { 18, 6, "screenSize", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Kích thước màn hình", 1, null, null },
                    { 19, 6, "chipset", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Chipset", 2, null, null },
                    { 20, 6, "ram", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "RAM", 3, null, null },
                    { 21, 6, "internalStorage", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Bộ nhớ trong", 4, null, null },
                    { 22, 6, "battery", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Pin", 5, null, null },
                    { 23, 6, "frontCamera", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Camera trước", 6, null, null },
                    { 24, 6, "rearCamera", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Camera sau", 7, null, null },
                    { 25, 7, "headphoneType", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Loại tai nghe", 1, null, null },
                    { 26, 7, "audioTechnology", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Công nghệ âm thanh", 2, null, null },
                    { 27, 7, "microphone", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Micro", 3, null, null },
                    { 28, 7, "connection", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Kết nối", 4, null, null },
                    { 29, 7, "batteryLife", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Thời lượng pin", 5, null, null },
                    { 30, 7, "noiseCancellation", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Chống ồn", 6, null, null },
                    { 31, 8, "screenTechnology", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Công nghệ màn hình", 1, null, null },
                    { 32, 8, "screenSize", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Kích thước màn hình", 2, null, null },
                    { 33, 8, "calling", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Nghe gọi", 3, null, null },
                    { 34, 8, "healthFeatures", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Tiện ích sức khỏe", 4, null, null },
                    { 35, 8, "batteryLife", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Thời lượng pin", 5, null, null },
                    { 36, 8, "waterResistance", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Chống nước", 6, null, null },
                    { 37, 9, "cameraLine", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Dòng camera", 1, null, null },
                    { 38, 9, "resolution", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Độ phân giải", 2, null, null },
                    { 39, 9, "lensAngle", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Góc ống kính", 3, null, null },
                    { 40, 9, "stabilization", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Chống rung", 4, null, null },
                    { 41, 9, "wirelessConnection", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", true, false, false, "Kết nối không dây", 5, null, null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductImages_ProductId",
                table: "ProductImages",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductRecommendations_ProductId_RecommendedProductId_Type",
                table: "ProductRecommendations",
                columns: new[] { "ProductId", "RecommendedProductId", "Type" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductRecommendations_RecommendedProductId",
                table: "ProductRecommendations",
                column: "RecommendedProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductSpecValues_ProductId_SpecDefinitionId",
                table: "ProductSpecValues",
                columns: new[] { "ProductId", "SpecDefinitionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductSpecValues_SpecDefinitionId",
                table: "ProductSpecValues",
                column: "SpecDefinitionId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariants_ProductId",
                table: "ProductVariants",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_SpecDefinitions_CategoryId_Code",
                table: "SpecDefinitions",
                columns: new[] { "CategoryId", "Code" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProductImages");

            migrationBuilder.DropTable(
                name: "ProductRecommendations");

            migrationBuilder.DropTable(
                name: "ProductSpecValues");

            migrationBuilder.DropTable(
                name: "ProductVariants");

            migrationBuilder.DropTable(
                name: "SpecDefinitions");

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DropColumn(
                name: "Brand",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "IsBestSeller",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "IsDiscounted",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "IsFeatured",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "IsNewArrival",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "LongDescription",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "OriginalPrice",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "RequiresSerialTracking",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Sku",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "WarrantyMonths",
                table: "Products");
        }
    }
}
