using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddSpecOptionsAndProductSpecs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AllowCustomValue",
                table: "SpecDefinitions",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "InputType",
                table: "SpecDefinitions",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "text");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "SpecDefinitions",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<int>(
                name: "SpecOptionId",
                table: "ProductSpecValues",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "SpecOptions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SpecDefinitionId = table.Column<int>(type: "int", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpecOptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SpecOptions_SpecDefinitions_SpecDefinitionId",
                        column: x => x.SpecDefinitionId,
                        principalTable: "SpecDefinitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

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
                column: "CreatedAt",
                value: new DateTime(2026, 5, 23, 12, 30, 54, 256, DateTimeKind.Utc).AddTicks(7326));

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "AllowCustomValue", "InputType", "IsActive" },
                values: new object[] { true, "text", true });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "AllowCustomValue", "DataType", "InputType", "IsActive", "IsFilterable" },
                values: new object[] { true, "select", "select", true, true });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "AllowCustomValue", "DataType", "InputType", "IsActive" },
                values: new object[] { true, "textarea", "textarea", true });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "AllowCustomValue", "DataType", "InputType", "IsActive" },
                values: new object[] { true, "textarea", "textarea", true });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "AllowCustomValue", "InputType", "IsActive" },
                values: new object[] { true, "text", true });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Code", "DataType", "InputType", "IsActive", "IsFilterable", "Name" },
                values: new object[] { "nfc", "boolean", "boolean", true, true, "Công nghệ NFC" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "AllowCustomValue", "Code", "DataType", "InputType", "IsActive", "IsFilterable", "Name" },
                values: new object[] { true, "ram", "select", "select", true, true, "Dung lượng RAM" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "AllowCustomValue", "Code", "DataType", "InputType", "IsActive", "IsFilterable", "Name" },
                values: new object[] { true, "internalStorage", "select", "select", true, true, "Bộ nhớ trong" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "AllowCustomValue", "Code", "InputType", "IsActive", "Name" },
                values: new object[] { true, "battery", "text", true, "Pin" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 10,
                columns: new[] { "AllowCustomValue", "CategoryId", "Code", "InputType", "IsActive", "Name", "SortOrder" },
                values: new object[] { true, 1, "sim", "text", true, "Thẻ SIM", 10 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 11,
                columns: new[] { "AllowCustomValue", "CategoryId", "Code", "DataType", "InputType", "IsActive", "IsFilterable", "Name", "SortOrder" },
                values: new object[] { true, 1, "os", "select", "select", true, true, "Hệ điều hành", 11 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 12,
                columns: new[] { "AllowCustomValue", "CategoryId", "Code", "InputType", "IsActive", "Name", "SortOrder" },
                values: new object[] { true, 1, "screenResolution", "text", true, "Độ phân giải màn hình", 12 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 13,
                columns: new[] { "AllowCustomValue", "CategoryId", "Code", "DataType", "InputType", "IsActive", "Name", "SortOrder" },
                values: new object[] { true, 1, "screenFeatures", "textarea", "textarea", true, "Tính năng màn hình", 13 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 14,
                columns: new[] { "AllowCustomValue", "CategoryId", "Code", "InputType", "IsActive", "Name", "SortOrder" },
                values: new object[] { true, 1, "cpuType", "text", true, "Loại CPU", 14 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 15,
                columns: new[] { "AllowCustomValue", "Code", "InputType", "IsActive", "IsFilterable", "Name", "SortOrder" },
                values: new object[] { true, "graphicsType", "text", true, true, "Loại card đồ họa", 1 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 16,
                columns: new[] { "AllowCustomValue", "Code", "DataType", "InputType", "IsActive", "IsFilterable", "Name", "SortOrder" },
                values: new object[] { true, "ram", "select", "select", true, true, "Dung lượng RAM", 2 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 17,
                columns: new[] { "AllowCustomValue", "Code", "InputType", "IsActive", "IsFilterable", "Name", "SortOrder" },
                values: new object[] { true, "ramType", "text", true, true, "Loại RAM", 3 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 18,
                columns: new[] { "AllowCustomValue", "CategoryId", "Code", "InputType", "IsActive", "Name", "SortOrder" },
                values: new object[] { true, 2, "ramSlots", "text", true, "Số khe RAM", 4 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 19,
                columns: new[] { "AllowCustomValue", "CategoryId", "Code", "DataType", "InputType", "IsActive", "IsFilterable", "Name", "SortOrder" },
                values: new object[] { true, 2, "hardDrive", "select", "select", true, true, "Ổ cứng", 5 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 20,
                columns: new[] { "AllowCustomValue", "CategoryId", "Code", "InputType", "IsActive", "Name", "SortOrder" },
                values: new object[] { true, 2, "screenSize", "text", true, "Kích thước màn hình", 6 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 21,
                columns: new[] { "AllowCustomValue", "CategoryId", "Code", "DataType", "InputType", "IsActive", "IsFilterable", "Name", "SortOrder" },
                values: new object[] { true, 2, "screenTechnology", "select", "select", true, true, "Công nghệ màn hình", 7 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 22,
                columns: new[] { "AllowCustomValue", "CategoryId", "InputType", "IsActive", "SortOrder" },
                values: new object[] { true, 2, "text", true, 8 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 23,
                columns: new[] { "AllowCustomValue", "CategoryId", "Code", "DataType", "InputType", "IsActive", "IsFilterable", "Name", "SortOrder" },
                values: new object[] { true, 2, "os", "select", "select", true, true, "Hệ điều hành", 9 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 24,
                columns: new[] { "AllowCustomValue", "CategoryId", "Code", "InputType", "IsActive", "Name", "SortOrder" },
                values: new object[] { true, 2, "screenResolution", "text", true, "Độ phân giải màn hình", 10 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 25,
                columns: new[] { "AllowCustomValue", "CategoryId", "Code", "InputType", "IsActive", "IsFilterable", "Name", "SortOrder" },
                values: new object[] { true, 2, "cpuType", "text", true, true, "Loại CPU", 11 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 26,
                columns: new[] { "AllowCustomValue", "CategoryId", "Code", "DataType", "InputType", "IsActive", "Name", "SortOrder" },
                values: new object[] { true, 2, "ports", "textarea", "textarea", true, "Cổng giao tiếp", 12 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 27,
                columns: new[] { "AllowCustomValue", "CategoryId", "Code", "InputType", "IsActive", "Name", "SortOrder" },
                values: new object[] { true, 4, "screenSize", "text", true, "Kích thước màn hình", 1 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 28,
                columns: new[] { "AllowCustomValue", "CategoryId", "Code", "DataType", "InputType", "IsActive", "IsFilterable", "Name", "SortOrder" },
                values: new object[] { true, 4, "screenTechnology", "select", "select", true, true, "Công nghệ màn hình", 2 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 29,
                columns: new[] { "AllowCustomValue", "CategoryId", "Code", "DataType", "InputType", "IsActive", "Name", "SortOrder" },
                values: new object[] { true, 4, "rearCamera", "textarea", "textarea", true, "Camera sau", 3 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 30,
                columns: new[] { "AllowCustomValue", "CategoryId", "Code", "DataType", "InputType", "IsActive", "Name", "SortOrder" },
                values: new object[] { true, 4, "frontCamera", "textarea", "textarea", true, "Camera trước", 4 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 31,
                columns: new[] { "AllowCustomValue", "CategoryId", "Code", "InputType", "IsActive", "Name", "SortOrder" },
                values: new object[] { true, 4, "chipset", "text", true, "Chipset", 5 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 32,
                columns: new[] { "AllowCustomValue", "CategoryId", "Code", "DataType", "InputType", "IsActive", "IsFilterable", "Name", "SortOrder" },
                values: new object[] { true, 4, "ram", "select", "select", true, true, "Dung lượng RAM", 6 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 33,
                columns: new[] { "AllowCustomValue", "CategoryId", "Code", "DataType", "InputType", "IsActive", "IsFilterable", "Name", "SortOrder" },
                values: new object[] { true, 4, "internalStorage", "select", "select", true, true, "Bộ nhớ trong", 7 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 34,
                columns: new[] { "AllowCustomValue", "CategoryId", "Code", "InputType", "IsActive", "Name", "SortOrder" },
                values: new object[] { true, 4, "battery", "text", true, "Pin", 8 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 35,
                columns: new[] { "AllowCustomValue", "CategoryId", "Code", "DataType", "InputType", "IsActive", "IsFilterable", "Name", "SortOrder" },
                values: new object[] { true, 4, "os", "select", "select", true, true, "Hệ điều hành", 9 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 36,
                columns: new[] { "AllowCustomValue", "CategoryId", "Code", "InputType", "IsActive", "Name", "SortOrder" },
                values: new object[] { true, 4, "screenResolution", "text", true, "Độ phân giải màn hình", 10 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 37,
                columns: new[] { "AllowCustomValue", "CategoryId", "Code", "DataType", "InputType", "IsActive", "Name", "SortOrder" },
                values: new object[] { true, 4, "screenFeatures", "textarea", "textarea", true, "Tính năng màn hình", 11 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 38,
                columns: new[] { "AllowCustomValue", "CategoryId", "Code", "InputType", "IsActive", "Name", "SortOrder" },
                values: new object[] { true, 4, "cpuType", "text", true, "Loại CPU", 12 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 39,
                columns: new[] { "AllowCustomValue", "CategoryId", "Code", "DataType", "InputType", "IsActive", "Name", "SortOrder" },
                values: new object[] { true, 4, "compatibility", "textarea", "textarea", true, "Tương thích", 13 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 40,
                columns: new[] { "AllowCustomValue", "CategoryId", "Code", "DataType", "InputType", "IsActive", "IsFilterable", "Name", "SortOrder" },
                values: new object[] { true, 5, "screenTechnology", "select", "select", true, true, "Công nghệ màn hình", 1 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 41,
                columns: new[] { "AllowCustomValue", "CategoryId", "Code", "InputType", "IsActive", "Name", "SortOrder" },
                values: new object[] { true, 5, "screenSize", "text", true, "Kích thước màn hình", 2 });

            migrationBuilder.InsertData(
                table: "SpecDefinitions",
                columns: new[] { "Id", "AllowCustomValue", "CategoryId", "Code", "CreatedAt", "DataType", "InputType", "IsActive", "IsComparable", "IsFilterable", "IsRequired", "Name", "SortOrder", "Unit", "UpdatedAt" },
                values: new object[,]
                {
                    { 42, true, 5, "faceDiameter", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", "text", true, true, false, false, "Đường kính mặt", 3, null, null },
                    { 43, true, 5, "wristSize", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", "text", true, true, false, false, "Kích thước cổ tay phù hợp", 4, null, null }
                });

            migrationBuilder.InsertData(
                table: "SpecDefinitions",
                columns: new[] { "Id", "CategoryId", "Code", "CreatedAt", "DataType", "InputType", "IsActive", "IsComparable", "IsFilterable", "IsRequired", "Name", "SortOrder", "Unit", "UpdatedAt" },
                values: new object[] { 44, 5, "calling", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "boolean", "boolean", true, true, true, false, "Nghe gọi", 5, null, null });

            migrationBuilder.InsertData(
                table: "SpecDefinitions",
                columns: new[] { "Id", "AllowCustomValue", "CategoryId", "Code", "CreatedAt", "DataType", "InputType", "IsActive", "IsComparable", "IsFilterable", "IsRequired", "Name", "SortOrder", "Unit", "UpdatedAt" },
                values: new object[,]
                {
                    { 45, true, 5, "healthFeatures", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "textarea", "textarea", true, true, false, false, "Tiện ích sức khỏe", 6, null, null },
                    { 46, true, 5, "compatibility", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "textarea", "textarea", true, true, false, false, "Tương thích", 7, null, null },
                    { 47, true, 5, "batteryLife", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", "text", true, true, false, false, "Thời lượng pin", 8, null, null },
                    { 48, true, 5, "manufacturer", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, true, false, "Hãng sản xuất", 9, null, null },
                    { 49, true, 7, "dimensions", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", "text", true, true, false, false, "Kích thước", 1, null, null },
                    { 50, true, 7, "weight", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", "text", true, true, false, false, "Trọng lượng", 2, null, null },
                    { 51, true, 7, "audioTechnology", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "textarea", "textarea", true, true, false, false, "Công nghệ âm thanh", 3, null, null }
                });

            migrationBuilder.InsertData(
                table: "SpecDefinitions",
                columns: new[] { "Id", "CategoryId", "Code", "CreatedAt", "DataType", "InputType", "IsActive", "IsComparable", "IsFilterable", "IsRequired", "Name", "SortOrder", "Unit", "UpdatedAt" },
                values: new object[] { 52, 7, "microphone", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "boolean", "boolean", true, true, true, false, "Micro", 4, null, null });

            migrationBuilder.InsertData(
                table: "SpecDefinitions",
                columns: new[] { "Id", "AllowCustomValue", "CategoryId", "Code", "CreatedAt", "DataType", "InputType", "IsActive", "IsComparable", "IsFilterable", "IsRequired", "Name", "SortOrder", "Unit", "UpdatedAt" },
                values: new object[,]
                {
                    { 53, true, 7, "batteryLife", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", "text", true, true, false, false, "Thời lượng sử dụng pin", 5, null, null },
                    { 54, true, 7, "controlMethod", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "textarea", "textarea", true, true, false, false, "Phương thức điều khiển", 6, null, null },
                    { 55, true, 7, "chipset", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", "text", true, true, false, false, "Chipset", 7, null, null },
                    { 56, true, 7, "otherFeatures", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "textarea", "textarea", true, true, false, false, "Tính năng khác", 8, null, null },
                    { 57, true, 7, "manufacturer", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, true, false, "Hãng sản xuất", 9, null, null },
                    { 58, true, 6, "manufacturer", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "select", "select", true, true, true, false, "Hãng sản xuất", 1, null, null },
                    { 59, true, 6, "cameraType", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", "text", true, true, true, false, "Loại máy ảnh", 2, null, null },
                    { 60, true, 6, "sensorType", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", "text", true, true, true, false, "Loại cảm biến", 3, null, null },
                    { 61, true, 6, "aperture", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", "text", true, true, false, false, "Khẩu độ", 4, null, null },
                    { 62, true, 6, "focalLength", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", "text", true, true, false, false, "Tiêu cự", 5, null, null },
                    { 63, true, 6, "lensType", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", "text", true, true, false, false, "Loại ống kính", 6, null, null },
                    { 64, true, 6, "focusMode", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "textarea", "textarea", true, true, false, false, "Chế độ lấy nét", 7, null, null },
                    { 65, true, 6, "shutter", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", "text", true, true, false, false, "Màn trập", 8, null, null },
                    { 66, true, 6, "printSpeed", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", "text", true, true, false, false, "Tốc độ in", 9, null, null },
                    { 67, true, 6, "imageSize", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "text", "text", true, true, false, false, "Kích thước ảnh", 10, null, null }
                });

            migrationBuilder.InsertData(
                table: "SpecOptions",
                columns: new[] { "Id", "CreatedAt", "DisplayOrder", "IsActive", "SpecDefinitionId", "UpdatedAt", "Value" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 7, null, "4 GB" },
                    { 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 7, null, "6 GB" },
                    { 3, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 7, null, "8 GB" },
                    { 4, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 7, null, "12 GB" },
                    { 5, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 7, null, "16 GB" },
                    { 6, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 7, null, "32 GB" },
                    { 7, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 16, null, "4 GB" },
                    { 8, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 16, null, "6 GB" },
                    { 9, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 16, null, "8 GB" },
                    { 10, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 16, null, "12 GB" },
                    { 11, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 16, null, "16 GB" },
                    { 12, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 16, null, "32 GB" },
                    { 13, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 32, null, "4 GB" },
                    { 14, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 32, null, "6 GB" },
                    { 15, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 32, null, "8 GB" },
                    { 16, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 32, null, "12 GB" },
                    { 17, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 32, null, "16 GB" },
                    { 18, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 32, null, "32 GB" },
                    { 19, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 8, null, "64 GB" },
                    { 20, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 8, null, "128 GB" },
                    { 21, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 8, null, "256 GB" },
                    { 22, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 8, null, "512 GB" },
                    { 23, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 8, null, "1 TB" },
                    { 24, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 8, null, "2 TB" },
                    { 25, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 19, null, "64 GB" },
                    { 26, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 19, null, "128 GB" },
                    { 27, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 19, null, "256 GB" },
                    { 28, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 19, null, "512 GB" },
                    { 29, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 19, null, "1 TB" },
                    { 30, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 19, null, "2 TB" },
                    { 31, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 33, null, "64 GB" },
                    { 32, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 33, null, "128 GB" },
                    { 33, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 33, null, "256 GB" },
                    { 34, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 33, null, "512 GB" },
                    { 35, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 33, null, "1 TB" },
                    { 36, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 33, null, "2 TB" },
                    { 37, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 2, null, "LCD" },
                    { 38, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 2, null, "IPS LCD" },
                    { 39, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 2, null, "OLED" },
                    { 40, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 2, null, "AMOLED" },
                    { 41, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 2, null, "Super AMOLED" },
                    { 42, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 2, null, "Dynamic AMOLED 2X" },
                    { 43, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 7, true, 2, null, "Liquid Retina" },
                    { 44, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 8, true, 2, null, "Super Retina XDR" },
                    { 45, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 21, null, "LCD" },
                    { 46, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 21, null, "IPS LCD" },
                    { 47, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 21, null, "OLED" },
                    { 48, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 21, null, "AMOLED" },
                    { 49, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 21, null, "Super AMOLED" },
                    { 50, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 21, null, "Dynamic AMOLED 2X" },
                    { 51, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 7, true, 21, null, "Liquid Retina" },
                    { 52, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 8, true, 21, null, "Super Retina XDR" },
                    { 53, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 28, null, "LCD" },
                    { 54, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 28, null, "IPS LCD" },
                    { 55, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 28, null, "OLED" },
                    { 56, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 28, null, "AMOLED" },
                    { 57, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 28, null, "Super AMOLED" },
                    { 58, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 28, null, "Dynamic AMOLED 2X" },
                    { 59, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 7, true, 28, null, "Liquid Retina" },
                    { 60, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 8, true, 28, null, "Super Retina XDR" },
                    { 61, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 40, null, "LCD" },
                    { 62, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 40, null, "IPS LCD" },
                    { 63, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 40, null, "OLED" },
                    { 64, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 40, null, "AMOLED" },
                    { 65, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 40, null, "Super AMOLED" },
                    { 66, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 40, null, "Dynamic AMOLED 2X" },
                    { 67, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 7, true, 40, null, "Liquid Retina" },
                    { 68, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 8, true, 40, null, "Super Retina XDR" },
                    { 69, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 11, null, "iOS" },
                    { 70, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 11, null, "Android" },
                    { 71, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 11, null, "HyperOS" },
                    { 72, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 11, null, "ColorOS" },
                    { 73, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 11, null, "One UI" },
                    { 74, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 11, null, "iPadOS" },
                    { 75, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 7, true, 11, null, "macOS" },
                    { 76, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 8, true, 11, null, "Windows 11 Home" },
                    { 77, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 9, true, 11, null, "Windows 11 Home Single Language" },
                    { 78, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 23, null, "macOS" },
                    { 79, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 23, null, "Windows 11 Home" },
                    { 80, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 23, null, "Windows 11 Home Single Language" },
                    { 81, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 35, null, "iPadOS" },
                    { 82, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 35, null, "Android" },
                    { 83, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 35, null, "HyperOS" },
                    { 84, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 35, null, "One UI" },
                    { 85, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 48, null, "Apple" },
                    { 86, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 48, null, "Samsung" },
                    { 87, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 48, null, "Xiaomi" },
                    { 88, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 48, null, "Huawei" },
                    { 89, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 57, null, "Apple" },
                    { 90, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 57, null, "Samsung" },
                    { 91, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 57, null, "Xiaomi" },
                    { 92, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, 57, null, "OPPO" },
                    { 93, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, 57, null, "Huawei" },
                    { 94, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6, true, 57, null, "Baseus" },
                    { 95, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 58, null, "Canon" },
                    { 96, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 58, null, "Sony" },
                    { 97, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, true, 58, null, "Fujifilm" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductSpecValues_SpecOptionId",
                table: "ProductSpecValues",
                column: "SpecOptionId");

            migrationBuilder.CreateIndex(
                name: "IX_SpecOptions_SpecDefinitionId",
                table: "SpecOptions",
                column: "SpecDefinitionId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductSpecValues_SpecOptions_SpecOptionId",
                table: "ProductSpecValues",
                column: "SpecOptionId",
                principalTable: "SpecOptions",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductSpecValues_SpecOptions_SpecOptionId",
                table: "ProductSpecValues");

            migrationBuilder.DropTable(
                name: "SpecOptions");

            migrationBuilder.DropIndex(
                name: "IX_ProductSpecValues_SpecOptionId",
                table: "ProductSpecValues");

            migrationBuilder.DeleteData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 42);

            migrationBuilder.DeleteData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 43);

            migrationBuilder.DeleteData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 44);

            migrationBuilder.DeleteData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 45);

            migrationBuilder.DeleteData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 46);

            migrationBuilder.DeleteData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 47);

            migrationBuilder.DeleteData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 48);

            migrationBuilder.DeleteData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 49);

            migrationBuilder.DeleteData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 50);

            migrationBuilder.DeleteData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 51);

            migrationBuilder.DeleteData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 52);

            migrationBuilder.DeleteData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 53);

            migrationBuilder.DeleteData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 54);

            migrationBuilder.DeleteData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 55);

            migrationBuilder.DeleteData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 56);

            migrationBuilder.DeleteData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 57);

            migrationBuilder.DeleteData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 58);

            migrationBuilder.DeleteData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 59);

            migrationBuilder.DeleteData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 60);

            migrationBuilder.DeleteData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 61);

            migrationBuilder.DeleteData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 62);

            migrationBuilder.DeleteData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 63);

            migrationBuilder.DeleteData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 64);

            migrationBuilder.DeleteData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 65);

            migrationBuilder.DeleteData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 66);

            migrationBuilder.DeleteData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 67);

            migrationBuilder.DropColumn(
                name: "AllowCustomValue",
                table: "SpecDefinitions");

            migrationBuilder.DropColumn(
                name: "InputType",
                table: "SpecDefinitions");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "SpecDefinitions");

            migrationBuilder.DropColumn(
                name: "SpecOptionId",
                table: "ProductSpecValues");

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

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "DataType", "IsFilterable" },
                values: new object[] { "text", false });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 3,
                column: "DataType",
                value: "text");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 4,
                column: "DataType",
                value: "text");

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Code", "DataType", "IsFilterable", "Name" },
                values: new object[] { "ram", "text", false, "RAM" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "Code", "DataType", "IsFilterable", "Name" },
                values: new object[] { "internalStorage", "text", false, "Bộ nhớ trong" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "Code", "DataType", "IsFilterable", "Name" },
                values: new object[] { "battery", "text", false, "Pin" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "Code", "Name" },
                values: new object[] { "os", "Hệ điều hành" });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 10,
                columns: new[] { "CategoryId", "Code", "Name", "SortOrder" },
                values: new object[] { 2, "cpuType", "Loại CPU", 1 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 11,
                columns: new[] { "CategoryId", "Code", "DataType", "IsFilterable", "Name", "SortOrder" },
                values: new object[] { 2, "ram", "text", false, "Dung lượng RAM", 2 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 12,
                columns: new[] { "CategoryId", "Code", "Name", "SortOrder" },
                values: new object[] { 2, "hardDrive", "Ổ cứng", 3 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 13,
                columns: new[] { "CategoryId", "Code", "DataType", "Name", "SortOrder" },
                values: new object[] { 2, "graphicsCard", "text", "Card đồ họa", 4 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 14,
                columns: new[] { "CategoryId", "Code", "Name", "SortOrder" },
                values: new object[] { 2, "screenSize", "Kích thước màn hình", 5 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 15,
                columns: new[] { "Code", "IsFilterable", "Name", "SortOrder" },
                values: new object[] { "screenResolution", false, "Độ phân giải màn hình", 6 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 16,
                columns: new[] { "Code", "DataType", "IsFilterable", "Name", "SortOrder" },
                values: new object[] { "battery", "text", false, "Pin", 7 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 17,
                columns: new[] { "Code", "IsFilterable", "Name", "SortOrder" },
                values: new object[] { "os", false, "Hệ điều hành", 8 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 18,
                columns: new[] { "CategoryId", "Code", "Name", "SortOrder" },
                values: new object[] { 4, "screenSize", "Kích thước màn hình", 1 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 19,
                columns: new[] { "CategoryId", "Code", "DataType", "IsFilterable", "Name", "SortOrder" },
                values: new object[] { 4, "chipset", "text", false, "Chipset", 2 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 20,
                columns: new[] { "CategoryId", "Code", "Name", "SortOrder" },
                values: new object[] { 4, "ram", "RAM", 3 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 21,
                columns: new[] { "CategoryId", "Code", "DataType", "IsFilterable", "Name", "SortOrder" },
                values: new object[] { 4, "internalStorage", "text", false, "Bộ nhớ trong", 4 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 22,
                columns: new[] { "CategoryId", "SortOrder" },
                values: new object[] { 4, 5 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 23,
                columns: new[] { "CategoryId", "Code", "DataType", "IsFilterable", "Name", "SortOrder" },
                values: new object[] { 4, "frontCamera", "text", false, "Camera trước", 6 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 24,
                columns: new[] { "CategoryId", "Code", "Name", "SortOrder" },
                values: new object[] { 4, "rearCamera", "Camera sau", 7 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 25,
                columns: new[] { "CategoryId", "Code", "IsFilterable", "Name", "SortOrder" },
                values: new object[] { 7, "headphoneType", false, "Loại tai nghe", 1 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 26,
                columns: new[] { "CategoryId", "Code", "DataType", "Name", "SortOrder" },
                values: new object[] { 7, "audioTechnology", "text", "Công nghệ âm thanh", 2 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 27,
                columns: new[] { "CategoryId", "Code", "Name", "SortOrder" },
                values: new object[] { 7, "microphone", "Micro", 3 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 28,
                columns: new[] { "CategoryId", "Code", "DataType", "IsFilterable", "Name", "SortOrder" },
                values: new object[] { 7, "connection", "text", false, "Kết nối", 4 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 29,
                columns: new[] { "CategoryId", "Code", "DataType", "Name", "SortOrder" },
                values: new object[] { 7, "batteryLife", "text", "Thời lượng pin", 5 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 30,
                columns: new[] { "CategoryId", "Code", "DataType", "Name", "SortOrder" },
                values: new object[] { 7, "noiseCancellation", "text", "Chống ồn", 6 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 31,
                columns: new[] { "CategoryId", "Code", "Name", "SortOrder" },
                values: new object[] { 5, "screenTechnology", "Công nghệ màn hình", 1 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 32,
                columns: new[] { "CategoryId", "Code", "DataType", "IsFilterable", "Name", "SortOrder" },
                values: new object[] { 5, "screenSize", "text", false, "Kích thước màn hình", 2 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 33,
                columns: new[] { "CategoryId", "Code", "DataType", "IsFilterable", "Name", "SortOrder" },
                values: new object[] { 5, "calling", "text", false, "Nghe gọi", 3 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 34,
                columns: new[] { "CategoryId", "Code", "Name", "SortOrder" },
                values: new object[] { 5, "healthFeatures", "Tiện ích sức khỏe", 4 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 35,
                columns: new[] { "CategoryId", "Code", "DataType", "IsFilterable", "Name", "SortOrder" },
                values: new object[] { 5, "batteryLife", "text", false, "Thời lượng pin", 5 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 36,
                columns: new[] { "CategoryId", "Code", "Name", "SortOrder" },
                values: new object[] { 5, "waterResistance", "Chống nước", 6 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 37,
                columns: new[] { "CategoryId", "Code", "DataType", "Name", "SortOrder" },
                values: new object[] { 6, "cameraLine", "text", "Dòng camera", 1 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 38,
                columns: new[] { "CategoryId", "Code", "Name", "SortOrder" },
                values: new object[] { 6, "resolution", "Độ phân giải", 2 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 39,
                columns: new[] { "CategoryId", "Code", "DataType", "Name", "SortOrder" },
                values: new object[] { 6, "lensAngle", "text", "Góc ống kính", 3 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 40,
                columns: new[] { "CategoryId", "Code", "DataType", "IsFilterable", "Name", "SortOrder" },
                values: new object[] { 6, "stabilization", "text", false, "Chống rung", 4 });

            migrationBuilder.UpdateData(
                table: "SpecDefinitions",
                keyColumn: "Id",
                keyValue: 41,
                columns: new[] { "CategoryId", "Code", "Name", "SortOrder" },
                values: new object[] { 6, "wirelessConnection", "Kết nối không dây", 5 });
        }
    }
}
