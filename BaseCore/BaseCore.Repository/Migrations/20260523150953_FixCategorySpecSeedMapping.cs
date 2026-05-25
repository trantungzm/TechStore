using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class FixCategorySpecSeedMapping : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 1,
                column: "Name",
                value: "Dien thoai");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Description", "Name" },
                values: new object[] { "May tinh bang", "Tablet" });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Dong ho thong minh", "Dong ho thong minh" });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Description", "Name" },
                values: new object[] { "May anh va thiet bi quay video", "May anh" });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Tai nghe va thiet bi am thanh", "Tai nghe" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 23, 15, 9, 52, 117, DateTimeKind.Utc).AddTicks(9608));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 23, 15, 9, 52, 117, DateTimeKind.Utc).AddTicks(9620));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 23, 15, 9, 52, 117, DateTimeKind.Utc).AddTicks(9624));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 23, 15, 9, 52, 117, DateTimeKind.Utc).AddTicks(9627));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "CategoryId", "CreatedAt" },
                values: new object[] { 7, new DateTime(2026, 5, 23, 15, 9, 52, 117, DateTimeKind.Utc).AddTicks(9630) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 1,
                column: "Name",
                value: "Smartphone");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Thiet bi cho game thu", "Gaming" });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Description", "Name" },
                values: new object[] { "May tinh bang", "Tablet" });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Dong ho thong minh", "Smartwatch" });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "Description", "Name" },
                values: new object[] { "May anh va quay video", "Camera" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 23, 12, 30, 54, 256, DateTimeKind.Utc).AddTicks(7293));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 23, 12, 30, 54, 256, DateTimeKind.Utc).AddTicks(7315));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 23, 12, 30, 54, 256, DateTimeKind.Utc).AddTicks(7319));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 23, 12, 30, 54, 256, DateTimeKind.Utc).AddTicks(7323));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "CategoryId", "CreatedAt" },
                values: new object[] { 3, new DateTime(2026, 5, 23, 12, 30, 54, 256, DateTimeKind.Utc).AddTicks(7326) });
        }
    }
}
