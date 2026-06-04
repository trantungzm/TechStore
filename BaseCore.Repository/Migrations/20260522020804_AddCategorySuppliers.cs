using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddCategorySuppliers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CategorySuppliers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CategoryId = table.Column<int>(type: "int", nullable: false),
                    SupplierId = table.Column<int>(type: "int", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CategorySuppliers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CategorySuppliers_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CategorySuppliers_Suppliers_SupplierId",
                        column: x => x.SupplierId,
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "CategorySuppliers",
                columns: new[] { "Id", "CategoryId", "CreatedAt", "IsActive", "SortOrder", "SupplierId", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, 1, 1, null },
                    { 2, 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, 2, 2, null },
                    { 3, 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, 1, 1, null },
                    { 4, 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, 2, 2, null },
                    { 5, 4, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, 1, 2, null },
                    { 6, 4, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, 2, 4, null },
                    { 7, 5, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, 1, 2, null },
                    { 8, 5, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, 2, 4, null },
                    { 9, 6, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, 1, 7, null },
                    { 10, 6, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, 2, 8, null },
                    { 11, 7, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, 1, 7, null },
                    { 12, 7, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, 2, 2, null }
                });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 22, 2, 8, 3, 154, DateTimeKind.Utc).AddTicks(9070));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 22, 2, 8, 3, 154, DateTimeKind.Utc).AddTicks(9094));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 22, 2, 8, 3, 154, DateTimeKind.Utc).AddTicks(9098));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 22, 2, 8, 3, 154, DateTimeKind.Utc).AddTicks(9101));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 22, 2, 8, 3, 154, DateTimeKind.Utc).AddTicks(9104));

            migrationBuilder.CreateIndex(
                name: "IX_CategorySuppliers_CategoryId_SupplierId",
                table: "CategorySuppliers",
                columns: new[] { "CategoryId", "SupplierId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CategorySuppliers_SupplierId",
                table: "CategorySuppliers",
                column: "SupplierId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CategorySuppliers");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 22, 1, 49, 23, 215, DateTimeKind.Utc).AddTicks(2666));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 22, 1, 49, 23, 215, DateTimeKind.Utc).AddTicks(2688));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 22, 1, 49, 23, 215, DateTimeKind.Utc).AddTicks(2700));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 22, 1, 49, 23, 215, DateTimeKind.Utc).AddTicks(2703));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 22, 1, 49, 23, 215, DateTimeKind.Utc).AddTicks(2705));
        }
    }
}
