using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class NormalizeSpecDefinitionsToSelectOptions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
                value: new DateTime(2026, 5, 23, 16, 44, 41, 962, DateTimeKind.Utc).AddTicks(9468));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 23, 16, 44, 41, 962, DateTimeKind.Utc).AddTicks(9479));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 23, 16, 44, 41, 962, DateTimeKind.Utc).AddTicks(9483));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 23, 16, 44, 41, 962, DateTimeKind.Utc).AddTicks(9486));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 23, 16, 44, 41, 962, DateTimeKind.Utc).AddTicks(9527));

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "select", "select", "Kich thuoc man hinh" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 2,
                column: "Name",
                value: "Cong nghe man hinh");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "DataType", "InputType" },
                values: new object[] { "select", "select" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "select", "select", "Camera truoc" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "DataType", "InputType" },
                values: new object[] { "select", "select" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 6,
                column: "Name",
                value: "Cong nghe NFC");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 7,
                column: "Name",
                value: "Dung luong RAM");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 8,
                column: "Name",
                value: "Bo nho trong");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "DataType", "InputType" },
                values: new object[] { "select", "select" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 10,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "select", "select", "The SIM" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 11,
                column: "Name",
                value: "He dieu hanh");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 12,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "select", "select", "Do phan giai man hinh" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 13,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "multiSelect", "multiSelect", "Tinh nang man hinh" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 14,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "select", "select", "Loai CPU" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 15,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "select", "select", "Loai card do hoa" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 16,
                column: "Name",
                value: "Dung luong RAM");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 17,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "select", "select", "Loai RAM" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 18,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "select", "select", "So khe RAM" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 19,
                column: "Name",
                value: "O cung");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 20,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "select", "select", "Kich thuoc man hinh" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 21,
                column: "Name",
                value: "Cong nghe man hinh");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 22,
                columns: new[] { "DataType", "InputType" },
                values: new object[] { "select", "select" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 23,
                column: "Name",
                value: "He dieu hanh");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 24,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "select", "select", "Do phan giai man hinh" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 25,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "select", "select", "Loai CPU" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 26,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "multiSelect", "multiSelect", "Cong giao tiep" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 27,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "select", "select", "Kich thuoc man hinh" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 28,
                column: "Name",
                value: "Cong nghe man hinh");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 29,
                columns: new[] { "DataType", "InputType" },
                values: new object[] { "select", "select" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 30,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "select", "select", "Camera truoc" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 31,
                columns: new[] { "DataType", "InputType" },
                values: new object[] { "select", "select" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 32,
                column: "Name",
                value: "Dung luong RAM");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 33,
                column: "Name",
                value: "Bo nho trong");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 34,
                columns: new[] { "DataType", "InputType" },
                values: new object[] { "select", "select" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 35,
                column: "Name",
                value: "He dieu hanh");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 36,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "select", "select", "Do phan giai man hinh" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 37,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "multiSelect", "multiSelect", "Tinh nang man hinh" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 38,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "select", "select", "Loai CPU" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 39,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "multiSelect", "multiSelect", "Tuong thich" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 40,
                column: "Name",
                value: "Cong nghe man hinh");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 41,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "select", "select", "Kich thuoc man hinh" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 42,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "select", "select", "Duong kinh mat" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 43,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "select", "select", "Kich thuoc co tay phu hop" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 44,
                column: "Name",
                value: "Nghe goi");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 45,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "multiSelect", "multiSelect", "Tien ich suc khoe" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 46,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "multiSelect", "multiSelect", "Tuong thich" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 47,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "select", "select", "Thoi luong pin" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 48,
                column: "Name",
                value: "Hang san xuat");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 49,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "select", "select", "Kich thuoc" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 50,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "select", "select", "Trong luong" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 51,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "multiSelect", "multiSelect", "Cong nghe am thanh" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 53,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "select", "select", "Thoi luong su dung pin" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 54,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "multiSelect", "multiSelect", "Phuong thuc dieu khien" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 55,
                columns: new[] { "DataType", "InputType" },
                values: new object[] { "select", "select" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 56,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "multiSelect", "multiSelect", "Tinh nang khac" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 57,
                column: "Name",
                value: "Hang san xuat");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 58,
                column: "Name",
                value: "Hang san xuat");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 59,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "select", "select", "Loai may anh" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 60,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "select", "select", "Loai cam bien" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 61,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "select", "select", "Khau do" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 62,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "select", "select", "Tieu cu" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 63,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "select", "select", "Loai ong kinh" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 64,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "multiSelect", "multiSelect", "Che do lay net" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 65,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "select", "select", "Man trap" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 66,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "select", "select", "Toc do in" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 67,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "select", "select", "Kich thuoc anh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 1, "5.8 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 1, "6.1 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 1, "6.5 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 1, "6.67 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 1, "6.7 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 1, "6.8 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 2, "LCD" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 2, "IPS LCD" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 2, "OLED" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 10,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 2, "AMOLED" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 11,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 2, "Super AMOLED" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 12,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 2, "Dynamic AMOLED 2X" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 13,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 7, 2, "Liquid Retina" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 14,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 8, 2, "Super Retina XDR" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 15,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 3, "12 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 16,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 3, "48 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 17,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 3, "50 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 18,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 3, "64 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 19,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 3, "108 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 20,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 3, "200 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 21,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 4, "10 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 22,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 4, "12 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 23,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 4, "16 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 24,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 4, "20 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 25,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 4, "32 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 26,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 4, "50 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 27,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 5, "Apple A16 Bionic" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 28,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 5, "Apple A17 Pro" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 29,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 5, "Snapdragon 8 Gen 2" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 30,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 5, "Snapdragon 8 Gen 3" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 31,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 5, "Dimensity 8300" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 32,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 5, "Dimensity 9300" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 33,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 6, "Khong" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 34,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 6, "Co" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 35,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 7, "4 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 36,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 7, "6 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 37,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 7, "8 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 38,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 7, "12 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 39,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 7, "16 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 40,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 7, "32 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 41,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 8, "64 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 42,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 8, "128 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 43,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 8, "256 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 44,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 8, "512 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 45,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 8, "1 TB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 46,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 8, "2 TB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 47,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 9, "3274 mAh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 48,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 9, "4000 mAh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 49,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 9, "4500 mAh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 50,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 9, "5000 mAh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 51,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 9, "5500 mAh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 52,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 9, "6000 mAh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 53,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 10, "1 Nano SIM" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 54,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 10, "2 Nano SIM" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 55,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 10, "1 Nano SIM + 1 eSIM" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 56,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 10, "2 Nano SIM + 1 eSIM" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 57,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 10, "eSIM" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 58,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 11, "iOS" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 59,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 11, "Android" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 60,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 11, "HyperOS" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 61,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 11, "ColorOS" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 62,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 11, "One UI" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 63,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 12, "HD+" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 64,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 12, "Full HD" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 65,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 12, "Full HD+" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 66,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 12, "1.5K" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 67,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 12, "2K" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 68,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 12, "Quad HD+" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 69,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 13, "120 Hz" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 70,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 13, "Always-On Display" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 71,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 13, "HDR10+" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 72,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 13, "Dolby Vision" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 73,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 13, "Man hinh tran vien" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 74,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 13, "Khang kinh cuong luc" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 75,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 14, "Hexa-core" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 76,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 14, "Octa-core" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 77,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 14, "Apple CPU 6-core" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 78,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 14, "Kryo Octa-core" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 79,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 14, "Cortex Octa-core" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 80,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 15, "Intel Iris Xe" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 81,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 15, "Intel Arc" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 82,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 15, "NVIDIA GeForce RTX 4050" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 83,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 15, "NVIDIA GeForce RTX 4060" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 84,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 15, "AMD Radeon Graphics" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 85,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 15, "Apple GPU" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 86,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 16, "4 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 87,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 16, "8 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 88,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 16, "16 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 89,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 16, "24 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 90,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 16, "32 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 91,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 16, "64 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 92,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 17, "DDR4" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 93,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 17, "DDR5" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 94,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 17, "LPDDR4X" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 95,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 17, "LPDDR5" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 96,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 17, "LPDDR5X" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 97,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 17, "Unified Memory" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 98,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 18, "1 khe" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 99,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 18, "2 khe" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 100,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 18, "4 khe" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 101,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 19, "256 GB SSD" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 102,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 19, "512 GB SSD" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 103,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 19, "1 TB SSD" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 104,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 19, "2 TB SSD" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 105,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 19, "512 GB HDD" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 106,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 19, "1 TB HDD" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 107,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 20, "13.3 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 108,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 20, "13.6 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 109,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 20, "14 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 110,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 20, "15.6 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 111,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 20, "16 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 112,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 20, "17.3 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 113,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 21, "LCD" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 114,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 21, "IPS LCD" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 115,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 21, "OLED" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 116,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 21, "AMOLED" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 117,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 21, "Mini LED" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 118,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 21, "Retina" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 119,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 22, "50 Wh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 120,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 22, "60 Wh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 121,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 22, "70 Wh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 122,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 22, "75 Wh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 123,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 22, "80 Wh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 124,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 22, "90 Wh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 125,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 23, "macOS" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 126,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 23, "Windows 11 Home" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 127,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 23, "Windows 11 Home Single Language" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 128,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 23, "Windows 11 Pro" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 129,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 24, "Full HD" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 130,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 24, "Full HD+" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 131,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 24, "2.2K" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 132,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 24, "2.8K" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 133,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 24, "3K" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 134,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 24, "4K" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 135,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 25, "Intel Core i5" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 136,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 25, "Intel Core i7" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 137,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 25, "Intel Core Ultra 7" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 138,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 25, "AMD Ryzen 5" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 139,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 25, "AMD Ryzen 7" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 140,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 25, "Apple M3" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 141,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 26, "USB-A" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 142,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 26, "USB-C" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 143,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 26, "HDMI" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 144,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 26, "Thunderbolt 4" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 145,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 26, "3.5 mm Audio" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 146,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 26, "MicroSD" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 147,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 7, 26, "LAN" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 148,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 8, 26, "DisplayPort" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 149,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 27, "8.3 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 150,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 27, "10.9 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 151,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 27, "11 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 152,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 27, "12.4 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 153,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 27, "12.9 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 154,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 28, "LCD" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 155,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 28, "IPS LCD" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 156,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 28, "OLED" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 157,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 28, "AMOLED" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 158,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 28, "Liquid Retina" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 159,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 28, "Mini LED" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 160,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 29, "8 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 161,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 29, "12 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 162,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 29, "13 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 163,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 29, "48 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 164,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 29, "50 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 165,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 30, "8 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 166,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 30, "12 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 167,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 30, "12 MP Ultra Wide" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 168,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 30, "16 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 169,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 31, "Apple M2" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 170,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 31, "Apple M4" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 171,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 31, "Snapdragon 8s Gen 3" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 172,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 31, "Dimensity 9000" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 173,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 31, "Helio G99" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 174,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 32, "4 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 175,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 32, "6 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 176,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 32, "8 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 177,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 32, "12 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 178,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 32, "16 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 179,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 33, "64 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 180,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 33, "128 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 181,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 33, "256 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 182,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 33, "512 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 183,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 33, "1 TB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 184,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 34, "7000 mAh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 185,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 34, "8000 mAh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 186,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 34, "8500 mAh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 187,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 34, "9000 mAh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 188,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 34, "10000 mAh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 189,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 35, "iPadOS" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 190,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 35, "Android" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 191,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 35, "HyperOS" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 192,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 35, "One UI" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 193,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 36, "1488 x 2266" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 194,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 36, "1600 x 2560" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 195,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 36, "1800 x 2880" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 196,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 36, "2000 x 1200" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 197,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 36, "2360 x 1640" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 198,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 37, "120 Hz" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 199,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 37, "Ho tro but" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 200,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 37, "Chia doi man hinh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 201,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 37, "HDR" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 202,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 37, "Dolby Vision" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 203,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 38, "Apple M-series" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 204,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 38, "Snapdragon" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 205,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 38, "MediaTek" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 206,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 38, "Octa-core" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 207,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 39, "iOS" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 208,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 39, "Android" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 209,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 39, "Windows" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 210,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 39, "macOS" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 211,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 40, "OLED" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 212,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 40, "AMOLED" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 213,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 40, "Super AMOLED" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 214,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 40, "Retina LTPO" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 215,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 40, "Always-On OLED" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 216,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 41, "1.43 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 217,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 41, "1.5 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 218,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 41, "1.78 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 219,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 41, "1.83 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 220,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 41, "1.9 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 221,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 41, "2.0 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 222,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 42, "41 mm" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 223,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 42, "42 mm" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 224,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 42, "44 mm" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 225,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 42, "45 mm" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 226,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 42, "46 mm" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 227,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 42, "49 mm" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 228,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 43, "Co tay 130-180 mm" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 229,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 43, "Co tay 140-190 mm" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 230,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 43, "Co tay 150-200 mm" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 231,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 43, "Co tay 160-220 mm" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 232,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 44, "Khong" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 233,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 44, "Co" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 234,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 45, "Do nhip tim" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 235,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 45, "Do SpO2" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 236,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 45, "Theo doi giac ngu" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 237,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 45, "Do stress" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 238,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 45, "Do ECG" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 239,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 45, "Theo doi chu ky" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 240,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 46, "iPhone" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 241,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 46, "Android" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 242,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 46, "iOS va Android" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 243,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 47, "2 ngay" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 244,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 47, "5 ngay" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 245,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 47, "7 ngay" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 246,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 47, "10 ngay" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 247,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 47, "14 ngay" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 248,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 48, "Apple" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 249,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 48, "Samsung" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 250,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 48, "Xiaomi" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 251,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 48, "Huawei" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 252,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 49, "Nho gon" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 253,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 49, "In-ear" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 254,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 49, "On-ear" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 255,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 49, "Over-ear" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 256,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 49, "Case kem theo" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 257,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 50, "30 g" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 258,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 50, "45 g" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 259,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 50, "60 g" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 260,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 50, "120 g" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 261,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 50, "220 g" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 262,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 50, "260 g" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 263,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 51, "Chong on chu dong" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 264,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 51, "Spatial Audio" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 265,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 51, "Hi-Res Audio" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 266,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 51, "Bass Boost" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 267,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 51, "Bluetooth 5.3" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 268,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 51, "ENC" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 269,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 52, "Khong" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 270,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 52, "Co" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 271,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 53, "5 gio" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 272,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 53, "6 gio" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 273,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 53, "8 gio" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 274,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 53, "10 gio" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 275,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 53, "20 gio" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 276,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 53, "30 gio" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 277,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 54, "Cam ung" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 278,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 54, "Nut vat ly" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 279,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 54, "Vuot cham" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 280,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 54, "Giong noi" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 281,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 55, "Apple H2" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 282,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 55, "Snapdragon Sound" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 283,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 55, "Kirin A1" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 284,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 55, "BES2700" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 285,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 56, "Chong nuoc IPX4" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 286,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 56, "Ket noi da diem" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 287,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 56, "Sac nhanh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 288,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 56, "Game Mode" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 289,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 56, "Xuyen am" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 290,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 57, "Apple" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 291,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 57, "Samsung" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 292,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 57, "Xiaomi" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 293,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 57, "OPPO" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 294,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 57, "Huawei" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 295,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 57, "Baseus" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 296,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 58, "Canon" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 297,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 58, "Sony" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 298,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 58, "Fujifilm" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 299,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 59, "Mirrorless" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 300,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 59, "DSLR" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 301,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 59, "Compact" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 302,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 59, "Action Camera" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 303,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 59, "Instant Camera" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 304,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 60, "CMOS" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 305,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 60, "APS-C CMOS" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 306,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 60, "Full Frame CMOS" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 307,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 60, "BSI CMOS" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 308,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 60, "Stacked CMOS" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 309,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 61, "f/1.8" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 310,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 61, "f/2.0" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 311,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 61, "f/2.8" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 312,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 61, "f/3.5-5.6" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 313,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 61, "f/4" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 314,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 62, "16-50 mm" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 315,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 62, "18-55 mm" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 316,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 62, "24-70 mm" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 317,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 62, "24-105 mm" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 318,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 62, "70-200 mm" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 319,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 63, "Lens kit" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 320,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 63, "Prime" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 321,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 63, "Zoom" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 322,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 63, "Telephoto" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 323,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 63, "Wide" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 324,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 64, "AF-S" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 325,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 64, "AF-C" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 326,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 64, "Nhan dien khuon mat" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 327,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 64, "Nhan dien mat" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 328,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 64, "Lay net thu cong" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 329,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 65, "1/4000 s" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 330,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 65, "1/8000 s" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 331,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 65, "Electronic shutter" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 332,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 65, "Mechanical shutter" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 333,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 66, "10 fps" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 334,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 66, "15 fps" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 335,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 66, "20 fps" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 336,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 66, "30 fps" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 337,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 67, "6000 x 4000" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 338,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 67, "6240 x 4160" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 339,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 67, "6720 x 4480" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 340,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 67, "7008 x 4672" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "text", "text", "Kích thước màn hình" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 2,
                column: "Name",
                value: "Công nghệ màn hình");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "DataType", "InputType" },
                values: new object[] { "textarea", "textarea" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "textarea", "textarea", "Camera trước" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "DataType", "InputType" },
                values: new object[] { "text", "text" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 6,
                column: "Name",
                value: "Công nghệ NFC");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 7,
                column: "Name",
                value: "Dung lượng RAM");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 8,
                column: "Name",
                value: "Bộ nhớ trong");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "DataType", "InputType" },
                values: new object[] { "text", "text" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 10,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "text", "text", "Thẻ SIM" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 11,
                column: "Name",
                value: "Hệ điều hành");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 12,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "text", "text", "Độ phân giải màn hình" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 13,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "textarea", "textarea", "Tính năng màn hình" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 14,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "text", "text", "Loại CPU" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 15,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "text", "text", "Loại card đồ họa" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 16,
                column: "Name",
                value: "Dung lượng RAM");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 17,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "text", "text", "Loại RAM" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 18,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "text", "text", "Số khe RAM" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 19,
                column: "Name",
                value: "Ổ cứng");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 20,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "text", "text", "Kích thước màn hình" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 21,
                column: "Name",
                value: "Công nghệ màn hình");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 22,
                columns: new[] { "DataType", "InputType" },
                values: new object[] { "text", "text" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 23,
                column: "Name",
                value: "Hệ điều hành");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 24,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "text", "text", "Độ phân giải màn hình" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 25,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "text", "text", "Loại CPU" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 26,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "textarea", "textarea", "Cổng giao tiếp" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 27,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "text", "text", "Kích thước màn hình" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 28,
                column: "Name",
                value: "Công nghệ màn hình");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 29,
                columns: new[] { "DataType", "InputType" },
                values: new object[] { "textarea", "textarea" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 30,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "textarea", "textarea", "Camera trước" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 31,
                columns: new[] { "DataType", "InputType" },
                values: new object[] { "text", "text" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 32,
                column: "Name",
                value: "Dung lượng RAM");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 33,
                column: "Name",
                value: "Bộ nhớ trong");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 34,
                columns: new[] { "DataType", "InputType" },
                values: new object[] { "text", "text" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 35,
                column: "Name",
                value: "Hệ điều hành");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 36,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "text", "text", "Độ phân giải màn hình" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 37,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "textarea", "textarea", "Tính năng màn hình" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 38,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "text", "text", "Loại CPU" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 39,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "textarea", "textarea", "Tương thích" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 40,
                column: "Name",
                value: "Công nghệ màn hình");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 41,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "text", "text", "Kích thước màn hình" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 42,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "text", "text", "Đường kính mặt" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 43,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "text", "text", "Kích thước cổ tay phù hợp" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 44,
                column: "Name",
                value: "Nghe gọi");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 45,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "textarea", "textarea", "Tiện ích sức khỏe" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 46,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "textarea", "textarea", "Tương thích" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 47,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "text", "text", "Thời lượng pin" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 48,
                column: "Name",
                value: "Hãng sản xuất");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 49,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "text", "text", "Kích thước" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 50,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "text", "text", "Trọng lượng" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 51,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "textarea", "textarea", "Công nghệ âm thanh" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 53,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "text", "text", "Thời lượng sử dụng pin" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 54,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "textarea", "textarea", "Phương thức điều khiển" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 55,
                columns: new[] { "DataType", "InputType" },
                values: new object[] { "text", "text" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 56,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "textarea", "textarea", "Tính năng khác" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 57,
                column: "Name",
                value: "Hãng sản xuất");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 58,
                column: "Name",
                value: "Hãng sản xuất");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 59,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "text", "text", "Loại máy ảnh" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 60,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "text", "text", "Loại cảm biến" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 61,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "text", "text", "Khẩu độ" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 62,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "text", "text", "Tiêu cự" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 63,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "text", "text", "Loại ống kính" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 64,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "textarea", "textarea", "Chế độ lấy nét" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 65,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "text", "text", "Màn trập" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 66,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "text", "text", "Tốc độ in" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 67,
                columns: new[] { "DataType", "InputType", "Name" },
                values: new object[] { "text", "text", "Kích thước ảnh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 7, "4 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 7, "6 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 7, "8 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 7, "12 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 7, "16 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 7, "32 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 16, "4 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 16, "6 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 16, "8 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 10,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 16, "12 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 11,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 16, "16 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 12,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 16, "32 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 13,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 32, "4 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 14,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 32, "6 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 15,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 32, "8 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 16,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 32, "12 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 17,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 32, "16 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 18,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 32, "32 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 19,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 8, "64 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 20,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 8, "128 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 21,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 8, "256 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 22,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 8, "512 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 23,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 8, "1 TB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 24,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 8, "2 TB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 25,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 19, "64 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 26,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 19, "128 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 27,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 19, "256 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 28,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 19, "512 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 29,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 19, "1 TB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 30,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 19, "2 TB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 31,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 33, "64 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 32,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 33, "128 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 33,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 33, "256 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 34,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 33, "512 GB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 35,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 33, "1 TB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 36,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 33, "2 TB" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 37,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 2, "LCD" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 38,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 2, "IPS LCD" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 39,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 2, "OLED" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 40,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 2, "AMOLED" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 41,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 2, "Super AMOLED" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 42,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 2, "Dynamic AMOLED 2X" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 43,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 7, 2, "Liquid Retina" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 44,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 8, 2, "Super Retina XDR" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 45,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 21, "LCD" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 46,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 21, "IPS LCD" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 47,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 21, "OLED" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 48,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 21, "AMOLED" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 49,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 21, "Super AMOLED" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 50,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 21, "Dynamic AMOLED 2X" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 51,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 7, 21, "Liquid Retina" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 52,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 8, 21, "Super Retina XDR" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 53,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 28, "LCD" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 54,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 28, "IPS LCD" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 55,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 28, "OLED" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 56,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 28, "AMOLED" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 57,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 28, "Super AMOLED" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 58,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 28, "Dynamic AMOLED 2X" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 59,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 7, 28, "Liquid Retina" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 60,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 8, 28, "Super Retina XDR" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 61,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 40, "LCD" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 62,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 40, "IPS LCD" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 63,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 40, "OLED" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 64,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 40, "AMOLED" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 65,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 40, "Super AMOLED" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 66,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 40, "Dynamic AMOLED 2X" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 67,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 7, 40, "Liquid Retina" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 68,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 8, 40, "Super Retina XDR" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 69,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 11, "iOS" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 70,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 11, "Android" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 71,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 11, "HyperOS" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 72,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 11, "ColorOS" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 73,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 11, "One UI" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 74,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 11, "iPadOS" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 75,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 7, 11, "macOS" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 76,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 8, 11, "Windows 11 Home" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 77,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 9, 11, "Windows 11 Home Single Language" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 78,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 23, "macOS" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 79,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 23, "Windows 11 Home" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 80,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 23, "Windows 11 Home Single Language" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 81,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 35, "iPadOS" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 82,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 35, "Android" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 83,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 35, "HyperOS" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 84,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 35, "One UI" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 85,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 48, "Apple" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 86,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 48, "Samsung" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 87,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 48, "Xiaomi" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 88,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 48, "Huawei" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 89,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 57, "Apple" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 90,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 57, "Samsung" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 91,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 57, "Xiaomi" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 92,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 57, "OPPO" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 93,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 57, "Huawei" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 94,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 57, "Baseus" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 95,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 58, "Canon" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 96,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 58, "Sony" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 97,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 58, "Fujifilm" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 98,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 6, "Khong" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 99,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 6, "Co" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 100,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 44, "Khong" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 101,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 44, "Co" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 102,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 52, "Khong" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 103,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 52, "Co" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 104,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 1, "5.8 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 105,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 1, "6.1 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 106,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 1, "6.5 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 107,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 1, "6.67 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 108,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 1, "6.7 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 109,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 1, "6.8 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 110,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 3, "12 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 111,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 3, "48 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 112,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 3, "50 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 113,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 3, "64 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 114,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 3, "108 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 115,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 3, "200 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 116,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 4, "10 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 117,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 4, "12 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 118,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 4, "16 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 119,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 4, "20 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 120,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 4, "32 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 121,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 4, "50 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 122,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 5, "Apple A16 Bionic" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 123,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 5, "Apple A17 Pro" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 124,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 5, "Snapdragon 8 Gen 2" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 125,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 5, "Snapdragon 8 Gen 3" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 126,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 5, "Dimensity 8300" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 127,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 5, "Dimensity 9300" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 128,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 9, "3274 mAh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 129,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 9, "4000 mAh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 130,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 9, "4500 mAh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 131,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 9, "5000 mAh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 132,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 9, "5500 mAh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 133,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 9, "6000 mAh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 134,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 10, "1 Nano SIM" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 135,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 10, "2 Nano SIM" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 136,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 10, "1 Nano SIM + 1 eSIM" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 137,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 10, "2 Nano SIM + 1 eSIM" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 138,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 10, "eSIM" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 139,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 12, "HD+" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 140,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 12, "Full HD" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 141,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 12, "Full HD+" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 142,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 12, "1.5K" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 143,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 12, "2K" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 144,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 12, "Quad HD+" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 145,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 13, "120 Hz" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 146,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 13, "Always-On Display" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 147,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 13, "HDR10+" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 148,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 13, "Dolby Vision" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 149,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 13, "Man hinh tran vien" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 150,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 13, "Khang kinh cuong luc" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 151,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 14, "Hexa-core" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 152,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 14, "Octa-core" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 153,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 14, "Apple CPU 6-core" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 154,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 14, "Kryo Octa-core" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 155,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 14, "Cortex Octa-core" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 156,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 15, "Intel Iris Xe" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 157,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 15, "Intel Arc" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 158,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 15, "NVIDIA GeForce RTX 4050" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 159,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 15, "NVIDIA GeForce RTX 4060" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 160,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 15, "AMD Radeon Graphics" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 161,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 15, "Apple GPU" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 162,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 17, "DDR4" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 163,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 17, "DDR5" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 164,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 17, "LPDDR4X" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 165,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 17, "LPDDR5" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 166,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 17, "LPDDR5X" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 167,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 17, "Unified Memory" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 168,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 18, "1 khe" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 169,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 18, "2 khe" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 170,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 18, "4 khe" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 171,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 20, "13.3 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 172,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 20, "13.6 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 173,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 20, "14 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 174,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 20, "15.6 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 175,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 20, "16 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 176,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 20, "17.3 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 177,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 22, "50 Wh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 178,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 22, "60 Wh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 179,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 22, "70 Wh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 180,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 22, "75 Wh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 181,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 22, "80 Wh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 182,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 22, "90 Wh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 183,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 24, "Full HD" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 184,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 24, "Full HD+" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 185,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 24, "2.2K" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 186,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 24, "2.8K" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 187,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 24, "3K" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 188,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 24, "4K" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 189,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 25, "Intel Core i5" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 190,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 25, "Intel Core i7" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 191,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 25, "Intel Core Ultra 7" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 192,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 25, "AMD Ryzen 5" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 193,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 25, "AMD Ryzen 7" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 194,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 25, "Apple M3" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 195,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 26, "USB-A" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 196,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 26, "USB-C" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 197,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 26, "HDMI" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 198,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 26, "Thunderbolt 4" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 199,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 26, "3.5 mm Audio" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 200,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 26, "MicroSD" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 201,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 27, "8.3 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 202,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 27, "10.9 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 203,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 27, "11 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 204,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 27, "12.4 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 205,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 27, "12.9 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 206,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 29, "8 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 207,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 29, "12 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 208,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 29, "13 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 209,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 29, "48 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 210,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 29, "50 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 211,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 30, "8 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 212,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 30, "12 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 213,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 30, "12 MP Ultra Wide" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 214,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 30, "16 MP" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 215,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 31, "Apple M2" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 216,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 31, "Apple M4" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 217,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 31, "Snapdragon 8s Gen 3" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 218,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 31, "Dimensity 9000" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 219,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 31, "Helio G99" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 220,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 34, "7000 mAh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 221,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 34, "8000 mAh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 222,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 34, "8500 mAh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 223,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 34, "9000 mAh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 224,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 34, "10000 mAh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 225,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 36, "1488 x 2266" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 226,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 36, "1600 x 2560" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 227,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 36, "1800 x 2880" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 228,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 36, "2000 x 1200" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 229,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 36, "2360 x 1640" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 230,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 37, "120 Hz" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 231,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 37, "Ho tro but" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 232,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 37, "Chia doi man hinh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 233,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 37, "HDR" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 234,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 37, "Dolby Vision" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 235,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 38, "Apple M-series" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 236,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 38, "Snapdragon" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 237,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 38, "MediaTek" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 238,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 38, "Octa-core" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 239,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 39, "iOS" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 240,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 39, "Android" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 241,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 39, "Windows" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 242,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 39, "macOS" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 243,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 41, "1.43 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 244,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 41, "1.5 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 245,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 41, "1.78 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 246,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 41, "1.83 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 247,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 41, "1.9 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 248,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 41, "2.0 inch" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 249,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 42, "41 mm" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 250,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 42, "42 mm" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 251,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 42, "44 mm" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 252,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 42, "45 mm" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 253,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 42, "46 mm" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 254,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 42, "49 mm" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 255,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 43, "Co tay 130-180 mm" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 256,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 43, "Co tay 140-190 mm" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 257,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 43, "Co tay 150-200 mm" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 258,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 43, "Co tay 160-220 mm" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 259,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 45, "Do nhip tim" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 260,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 45, "Do SpO2" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 261,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 45, "Theo doi giac ngu" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 262,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 45, "Do stress" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 263,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 45, "Do ECG" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 264,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 45, "Theo doi chu ky" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 265,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 46, "iPhone" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 266,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 46, "Android" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 267,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 46, "iOS va Android" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 268,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 47, "2 ngay" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 269,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 47, "5 ngay" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 270,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 47, "7 ngay" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 271,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 47, "10 ngay" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 272,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 47, "14 ngay" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 273,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 49, "Nho gon" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 274,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 49, "In-ear" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 275,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 49, "On-ear" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 276,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 49, "Over-ear" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 277,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 49, "Case kem theo" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 278,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 50, "30 g" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 279,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 50, "45 g" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 280,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 50, "60 g" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 281,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 50, "120 g" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 282,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 50, "220 g" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 283,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 50, "260 g" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 284,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 51, "Chong on chu dong" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 285,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 51, "Spatial Audio" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 286,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 51, "Hi-Res Audio" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 287,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 51, "Bass Boost" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 288,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 51, "Bluetooth 5.3" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 289,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 6, 51, "ENC" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 290,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 53, "5 gio" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 291,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 53, "6 gio" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 292,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 53, "8 gio" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 293,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 53, "10 gio" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 294,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 53, "20 gio" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 295,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 53, "30 gio" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 296,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 54, "Cam ung" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 297,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 54, "Nut vat ly" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 298,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 54, "Vuot cham" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 299,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 54, "Giong noi" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 300,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 55, "Apple H2" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 301,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 55, "Snapdragon Sound" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 302,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 55, "Kirin A1" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 303,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 55, "BES2700" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 304,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 56, "Chong nuoc IPX4" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 305,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 56, "Ket noi da diem" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 306,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 56, "Sac nhanh" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 307,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 56, "Game Mode" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 308,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 56, "Xuyen am" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 309,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 59, "Mirrorless" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 310,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 59, "DSLR" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 311,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 59, "Compact" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 312,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 59, "Action Camera" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 313,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 59, "Instant Camera" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 314,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 60, "CMOS" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 315,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 60, "APS-C CMOS" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 316,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 60, "Full Frame CMOS" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 317,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 60, "BSI CMOS" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 318,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 60, "Stacked CMOS" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 319,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 61, "f/1.8" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 320,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 61, "f/2.0" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 321,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 61, "f/2.8" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 322,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 61, "f/3.5-5.6" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 323,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 61, "f/4" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 324,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 62, "16-50 mm" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 325,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 62, "18-55 mm" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 326,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 62, "24-70 mm" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 327,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 62, "24-105 mm" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 328,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 62, "70-200 mm" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 329,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 63, "Lens kit" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 330,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 63, "Prime" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 331,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 63, "Zoom" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 332,
                columns: new[] { "SpecDefinitionId", "Value" },
                values: new object[] { 63, "Telephoto" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 333,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 63, "Wide" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 334,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 64, "AF-S" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 335,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 64, "AF-C" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 336,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 3, 64, "Nhan dien khuon mat" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 337,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 4, 64, "Nhan dien mat" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 338,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 5, 64, "Lay net thu cong" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 339,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 1, 65, "1/4000 s" });

            migrationBuilder.UpdateData(
                table: "SpecOptions",
                keyColumn: "Id",
                keyValue: 340,
                columns: new[] { "DisplayOrder", "SpecDefinitionId", "Value" },
                values: new object[] { 2, 65, "1/8000 s" });

            migrationBuilder.InsertData(
                table: "SpecOptions",
                columns: new[] { "Id", "CreatedAt", "DisplayOrder", "IsActive", "SpecDefinitionId", "UpdatedAt", "Value" },
                values: new object[,]
                {
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
    }
}
