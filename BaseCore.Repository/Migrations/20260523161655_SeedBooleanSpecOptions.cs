using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class SeedBooleanSpecOptions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 23, 16, 16, 54, 747, DateTimeKind.Utc).AddTicks(6336));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 23, 16, 16, 54, 747, DateTimeKind.Utc).AddTicks(6350));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 23, 16, 16, 54, 747, DateTimeKind.Utc).AddTicks(6354));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 23, 16, 16, 54, 747, DateTimeKind.Utc).AddTicks(6357));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 23, 16, 16, 54, 747, DateTimeKind.Utc).AddTicks(6360));

            migrationBuilder.InsertData(
                table: "SpecOptions",
                columns: new[] { "Id", "CreatedAt", "DisplayOrder", "IsActive", "SpecDefinitionId", "UpdatedAt", "Value" },
                values: new object[,]
                {
                    { 98, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 6, null, "Khong" },
                    { 99, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 6, null, "Co" },
                    { 100, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 44, null, "Khong" },
                    { 101, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 44, null, "Co" },
                    { 102, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 52, null, "Khong" },
                    { 103, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 52, null, "Co" },
                    { 104, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 1, null, "5.8 inch" },
                    { 105, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 1, null, "6.1 inch" },
                    { 106, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 1, null, "6.5 inch" },
                    { 107, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 1, null, "6.67 inch" },
                    { 108, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 1, null, "6.7 inch" },
                    { 109, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 1, null, "6.8 inch" },
                    { 110, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 3, null, "12 MP" },
                    { 111, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 3, null, "48 MP" },
                    { 112, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 3, null, "50 MP" },
                    { 113, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 3, null, "64 MP" },
                    { 114, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 3, null, "108 MP" },
                    { 115, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 3, null, "200 MP" },
                    { 116, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 4, null, "10 MP" },
                    { 117, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 4, null, "12 MP" },
                    { 118, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 4, null, "16 MP" },
                    { 119, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 4, null, "20 MP" },
                    { 120, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 4, null, "32 MP" },
                    { 121, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 4, null, "50 MP" },
                    { 122, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 5, null, "Apple A16 Bionic" },
                    { 123, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 5, null, "Apple A17 Pro" },
                    { 124, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 5, null, "Snapdragon 8 Gen 2" },
                    { 125, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 5, null, "Snapdragon 8 Gen 3" },
                    { 126, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 5, null, "Dimensity 8300" },
                    { 127, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 5, null, "Dimensity 9300" },
                    { 128, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 9, null, "3274 mAh" },
                    { 129, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 9, null, "4000 mAh" },
                    { 130, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 9, null, "4500 mAh" },
                    { 131, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 9, null, "5000 mAh" },
                    { 132, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 9, null, "5500 mAh" },
                    { 133, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 9, null, "6000 mAh" },
                    { 134, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 10, null, "1 Nano SIM" },
                    { 135, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 10, null, "2 Nano SIM" },
                    { 136, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 10, null, "1 Nano SIM + 1 eSIM" },
                    { 137, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 10, null, "2 Nano SIM + 1 eSIM" },
                    { 138, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 10, null, "eSIM" },
                    { 139, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 12, null, "HD+" },
                    { 140, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 12, null, "Full HD" },
                    { 141, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 12, null, "Full HD+" },
                    { 142, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 12, null, "1.5K" },
                    { 143, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 12, null, "2K" },
                    { 144, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 12, null, "Quad HD+" },
                    { 145, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 13, null, "120 Hz" },
                    { 146, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 13, null, "Always-On Display" },
                    { 147, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 13, null, "HDR10+" },
                    { 148, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 13, null, "Dolby Vision" },
                    { 149, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 13, null, "Man hinh tran vien" },
                    { 150, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 13, null, "Khang kinh cuong luc" },
                    { 151, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 14, null, "Hexa-core" },
                    { 152, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 14, null, "Octa-core" },
                    { 153, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 14, null, "Apple CPU 6-core" },
                    { 154, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 14, null, "Kryo Octa-core" },
                    { 155, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 14, null, "Cortex Octa-core" },
                    { 156, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 15, null, "Intel Iris Xe" },
                    { 157, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 15, null, "Intel Arc" },
                    { 158, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 15, null, "NVIDIA GeForce RTX 4050" },
                    { 159, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 15, null, "NVIDIA GeForce RTX 4060" },
                    { 160, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 15, null, "AMD Radeon Graphics" },
                    { 161, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 15, null, "Apple GPU" },
                    { 162, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 17, null, "DDR4" },
                    { 163, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 17, null, "DDR5" },
                    { 164, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 17, null, "LPDDR4X" },
                    { 165, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 17, null, "LPDDR5" },
                    { 166, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 17, null, "LPDDR5X" },
                    { 167, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 17, null, "Unified Memory" },
                    { 168, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 18, null, "1 khe" },
                    { 169, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 18, null, "2 khe" },
                    { 170, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 18, null, "4 khe" },
                    { 171, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 20, null, "13.3 inch" },
                    { 172, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 20, null, "13.6 inch" },
                    { 173, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 20, null, "14 inch" },
                    { 174, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 20, null, "15.6 inch" },
                    { 175, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 20, null, "16 inch" },
                    { 176, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 20, null, "17.3 inch" },
                    { 177, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 22, null, "50 Wh" },
                    { 178, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 22, null, "60 Wh" },
                    { 179, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 22, null, "70 Wh" },
                    { 180, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 22, null, "75 Wh" },
                    { 181, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 22, null, "80 Wh" },
                    { 182, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 22, null, "90 Wh" },
                    { 183, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 24, null, "Full HD" },
                    { 184, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 24, null, "Full HD+" },
                    { 185, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 24, null, "2.2K" },
                    { 186, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 24, null, "2.8K" },
                    { 187, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 24, null, "3K" },
                    { 188, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 24, null, "4K" },
                    { 189, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 25, null, "Intel Core i5" },
                    { 190, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 25, null, "Intel Core i7" },
                    { 191, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 25, null, "Intel Core Ultra 7" },
                    { 192, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 25, null, "AMD Ryzen 5" },
                    { 193, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 25, null, "AMD Ryzen 7" },
                    { 194, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 25, null, "Apple M3" },
                    { 195, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 26, null, "USB-A" },
                    { 196, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 26, null, "USB-C" },
                    { 197, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 26, null, "HDMI" },
                    { 198, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 26, null, "Thunderbolt 4" },
                    { 199, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 26, null, "3.5 mm Audio" },
                    { 200, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 26, null, "MicroSD" },
                    { 201, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 27, null, "8.3 inch" },
                    { 202, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 27, null, "10.9 inch" },
                    { 203, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 27, null, "11 inch" },
                    { 204, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 27, null, "12.4 inch" },
                    { 205, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 27, null, "12.9 inch" },
                    { 206, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 29, null, "8 MP" },
                    { 207, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 29, null, "12 MP" },
                    { 208, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 29, null, "13 MP" },
                    { 209, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 29, null, "48 MP" },
                    { 210, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 29, null, "50 MP" },
                    { 211, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 30, null, "8 MP" },
                    { 212, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 30, null, "12 MP" },
                    { 213, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 30, null, "12 MP Ultra Wide" },
                    { 214, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 30, null, "16 MP" },
                    { 215, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 31, null, "Apple M2" },
                    { 216, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 31, null, "Apple M4" },
                    { 217, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 31, null, "Snapdragon 8s Gen 3" },
                    { 218, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 31, null, "Dimensity 9000" },
                    { 219, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 31, null, "Helio G99" },
                    { 220, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 34, null, "7000 mAh" },
                    { 221, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 34, null, "8000 mAh" },
                    { 222, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 34, null, "8500 mAh" },
                    { 223, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 34, null, "9000 mAh" },
                    { 224, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 34, null, "10000 mAh" },
                    { 225, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 36, null, "1488 x 2266" },
                    { 226, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 36, null, "1600 x 2560" },
                    { 227, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 36, null, "1800 x 2880" },
                    { 228, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 36, null, "2000 x 1200" },
                    { 229, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 36, null, "2360 x 1640" },
                    { 230, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 37, null, "120 Hz" },
                    { 231, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 37, null, "Ho tro but" },
                    { 232, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 37, null, "Chia doi man hinh" },
                    { 233, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 37, null, "HDR" },
                    { 234, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 37, null, "Dolby Vision" },
                    { 235, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 38, null, "Apple M-series" },
                    { 236, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 38, null, "Snapdragon" },
                    { 237, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 38, null, "MediaTek" },
                    { 238, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 38, null, "Octa-core" },
                    { 239, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 39, null, "iOS" },
                    { 240, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 39, null, "Android" },
                    { 241, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 39, null, "Windows" },
                    { 242, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 39, null, "macOS" },
                    { 243, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 41, null, "1.43 inch" },
                    { 244, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 41, null, "1.5 inch" },
                    { 245, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 41, null, "1.78 inch" },
                    { 246, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 41, null, "1.83 inch" },
                    { 247, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 41, null, "1.9 inch" },
                    { 248, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 41, null, "2.0 inch" },
                    { 249, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 42, null, "41 mm" },
                    { 250, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 42, null, "42 mm" },
                    { 251, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 42, null, "44 mm" },
                    { 252, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 42, null, "45 mm" },
                    { 253, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 42, null, "46 mm" },
                    { 254, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 42, null, "49 mm" },
                    { 255, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 43, null, "Co tay 130-180 mm" },
                    { 256, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 43, null, "Co tay 140-190 mm" },
                    { 257, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 43, null, "Co tay 150-200 mm" },
                    { 258, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 43, null, "Co tay 160-220 mm" },
                    { 259, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 45, null, "Do nhip tim" },
                    { 260, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 45, null, "Do SpO2" },
                    { 261, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 45, null, "Theo doi giac ngu" },
                    { 262, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 45, null, "Do stress" },
                    { 263, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 45, null, "Do ECG" },
                    { 264, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 45, null, "Theo doi chu ky" },
                    { 265, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 46, null, "iPhone" },
                    { 266, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 46, null, "Android" },
                    { 267, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 46, null, "iOS va Android" },
                    { 268, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 47, null, "2 ngay" },
                    { 269, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 47, null, "5 ngay" },
                    { 270, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 47, null, "7 ngay" },
                    { 271, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 47, null, "10 ngay" },
                    { 272, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 47, null, "14 ngay" },
                    { 273, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 49, null, "Nho gon" },
                    { 274, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 49, null, "In-ear" },
                    { 275, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 49, null, "On-ear" },
                    { 276, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 49, null, "Over-ear" },
                    { 277, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 49, null, "Case kem theo" },
                    { 278, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 50, null, "30 g" },
                    { 279, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 50, null, "45 g" },
                    { 280, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 50, null, "60 g" },
                    { 281, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 50, null, "120 g" },
                    { 282, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 50, null, "220 g" },
                    { 283, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 50, null, "260 g" },
                    { 284, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 51, null, "Chong on chu dong" },
                    { 285, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 51, null, "Spatial Audio" },
                    { 286, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 51, null, "Hi-Res Audio" },
                    { 287, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 51, null, "Bass Boost" },
                    { 288, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 51, null, "Bluetooth 5.3" },
                    { 289, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 51, null, "ENC" },
                    { 290, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 53, null, "5 gio" },
                    { 291, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 53, null, "6 gio" },
                    { 292, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 53, null, "8 gio" },
                    { 293, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 53, null, "10 gio" },
                    { 294, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 53, null, "20 gio" },
                    { 295, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 53, null, "30 gio" },
                    { 296, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 54, null, "Cam ung" },
                    { 297, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 54, null, "Nut vat ly" },
                    { 298, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 54, null, "Vuot cham" },
                    { 299, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 54, null, "Giong noi" },
                    { 300, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 55, null, "Apple H2" },
                    { 301, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 55, null, "Snapdragon Sound" },
                    { 302, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 55, null, "Kirin A1" },
                    { 303, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 55, null, "BES2700" },
                    { 304, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 56, null, "Chong nuoc IPX4" },
                    { 305, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 56, null, "Ket noi da diem" },
                    { 306, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 56, null, "Sac nhanh" },
                    { 307, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 56, null, "Game Mode" },
                    { 308, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 56, null, "Xuyen am" },
                    { 309, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 59, null, "Mirrorless" },
                    { 310, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 59, null, "DSLR" },
                    { 311, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 59, null, "Compact" },
                    { 312, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 59, null, "Action Camera" },
                    { 313, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 59, null, "Instant Camera" },
                    { 314, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 60, null, "CMOS" },
                    { 315, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 60, null, "APS-C CMOS" },
                    { 316, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 60, null, "Full Frame CMOS" },
                    { 317, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 60, null, "BSI CMOS" },
                    { 318, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 60, null, "Stacked CMOS" },
                    { 319, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 61, null, "f/1.8" },
                    { 320, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 61, null, "f/2.0" },
                    { 321, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 61, null, "f/2.8" },
                    { 322, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 61, null, "f/3.5-5.6" },
                    { 323, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 61, null, "f/4" },
                    { 324, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 62, null, "16-50 mm" },
                    { 325, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 62, null, "18-55 mm" },
                    { 326, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 62, null, "24-70 mm" },
                    { 327, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 62, null, "24-105 mm" },
                    { 328, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 62, null, "70-200 mm" },
                    { 329, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 63, null, "Lens kit" },
                    { 330, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 63, null, "Prime" },
                    { 331, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 63, null, "Zoom" },
                    { 332, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 63, null, "Telephoto" },
                    { 333, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 63, null, "Wide" },
                    { 334, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 64, null, "AF-S" },
                    { 335, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 64, null, "AF-C" },
                    { 336, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 64, null, "Nhan dien khuon mat" },
                    { 337, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 64, null, "Nhan dien mat" },
                    { 338, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 64, null, "Lay net thu cong" },
                    { 339, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 65, null, "1/4000 s" },
                    { 340, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 65, null, "1/8000 s" },
                    { 341, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 65, null, "Electronic shutter" },
                    { 342, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 65, null, "Mechanical shutter" },
                    { 343, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 66, null, "10 fps" },
                    { 344, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 66, null, "15 fps" },
                    { 345, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 66, null, "20 fps" },
                    { 346, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 66, null, "30 fps" },
                    { 347, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 67, null, "6000 x 4000" },
                    { 348, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 67, null, "6240 x 4160" },
                    { 349, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 67, null, "6720 x 4480" },
                    { 350, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 67, null, "7008 x 4672" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 98);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 99);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 100);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 101);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 102);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 103);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 104);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 105);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 106);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 107);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 108);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 109);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 110);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 111);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 112);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 113);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 114);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 115);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 116);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 117);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 118);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 119);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 120);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 121);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 122);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 123);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 124);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 125);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 126);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 127);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 128);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 129);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 130);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 131);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 132);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 133);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 134);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 135);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 136);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 137);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 138);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 139);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 140);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 141);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 142);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 143);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 144);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 145);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 146);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 147);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 148);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 149);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 150);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 151);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 152);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 153);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 154);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 155);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 156);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 157);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 158);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 159);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 160);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 161);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 162);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 163);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 164);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 165);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 166);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 167);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 168);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 169);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 170);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 171);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 172);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 173);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 174);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 175);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 176);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 177);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 178);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 179);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 180);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 181);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 182);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 183);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 184);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 185);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 186);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 187);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 188);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 189);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 190);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 191);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 192);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 193);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 194);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 195);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 196);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 197);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 198);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 199);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 200);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 201);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 202);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 203);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 204);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 205);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 206);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 207);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 208);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 209);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 210);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 211);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 212);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 213);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 214);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 215);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 216);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 217);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 218);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 219);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 220);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 221);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 222);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 223);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 224);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 225);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 226);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 227);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 228);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 229);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 230);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 231);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 232);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 233);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 234);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 235);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 236);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 237);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 238);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 239);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 240);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 241);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 242);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 243);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 244);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 245);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 246);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 247);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 248);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 249);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 250);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 251);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 252);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 253);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 254);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 255);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 256);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 257);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 258);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 259);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 260);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 261);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 262);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 263);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 264);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 265);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 266);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 267);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 268);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 269);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 270);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 271);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 272);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 273);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 274);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 275);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 276);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 277);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 278);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 279);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 280);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 281);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 282);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 283);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 284);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 285);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 286);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 287);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 288);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 289);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 290);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 291);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 292);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 293);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 294);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 295);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 296);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 297);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 298);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 299);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 300);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 301);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 302);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 303);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 304);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 305);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 306);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 307);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 308);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 309);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 310);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 311);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 312);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 313);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 314);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 315);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 316);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 317);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 318);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 319);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 320);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 321);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 322);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 323);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 324);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 325);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 326);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 327);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 328);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 329);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 330);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 331);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 332);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 333);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 334);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 335);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 336);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 337);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 338);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 339);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 340);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 341);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 342);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 343);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 344);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 345);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 346);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 347);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 348);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 349);

            migrationBuilder.DeleteData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 350);

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
                column: "CreatedAt",
                value: new DateTime(2026, 5, 23, 15, 9, 52, 117, DateTimeKind.Utc).AddTicks(9630));
        }
    }
}
