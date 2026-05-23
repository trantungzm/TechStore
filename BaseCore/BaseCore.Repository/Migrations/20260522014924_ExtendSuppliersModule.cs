using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class ExtendSuppliersModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Suppliers_Code",
                table: "Suppliers");

            migrationBuilder.RenameColumn(
                name: "Code",
                table: "Suppliers",
                newName: "SupplierCode");

            migrationBuilder.AddColumn<string>(
                name: "ContactPerson",
                table: "Suppliers",
                type: "nvarchar(160)",
                maxLength: 160,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SupplierType",
                table: "Suppliers",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: false,
                defaultValue: "AuthorizedDistributor");

            migrationBuilder.AddColumn<int>(
                name: "BackupSupplierId",
                table: "Products",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SupplierId",
                table: "Products",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SupplyType",
                table: "Products",
                type: "nvarchar(80)",
                maxLength: 80,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WarrantyProvider",
                table: "Products",
                type: "nvarchar(160)",
                maxLength: 160,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "BackupSupplierId", "CreatedAt", "SupplierId", "SupplyType", "WarrantyProvider" },
                values: new object[] { null, new DateTime(2026, 5, 22, 1, 49, 23, 215, DateTimeKind.Utc).AddTicks(2666), null, null, null });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "BackupSupplierId", "CreatedAt", "SupplierId", "SupplyType", "WarrantyProvider" },
                values: new object[] { null, new DateTime(2026, 5, 22, 1, 49, 23, 215, DateTimeKind.Utc).AddTicks(2688), null, null, null });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "BackupSupplierId", "CreatedAt", "SupplierId", "SupplyType", "WarrantyProvider" },
                values: new object[] { null, new DateTime(2026, 5, 22, 1, 49, 23, 215, DateTimeKind.Utc).AddTicks(2700), null, null, null });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "BackupSupplierId", "CreatedAt", "SupplierId", "SupplyType", "WarrantyProvider" },
                values: new object[] { null, new DateTime(2026, 5, 22, 1, 49, 23, 215, DateTimeKind.Utc).AddTicks(2703), null, null, null });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "BackupSupplierId", "CreatedAt", "SupplierId", "SupplyType", "WarrantyProvider" },
                values: new object[] { null, new DateTime(2026, 5, 22, 1, 49, 23, 215, DateTimeKind.Utc).AddTicks(2705), null, null, null });

            migrationBuilder.UpdateData(
                table: "Suppliers",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "ContactPerson", "Email", "Name", "Phone", "SupplierCode", "SupplierType" },
                values: new object[] { null, "contact@synnexfpt.com", "Synnex FPT", "19006600", "SUP-SYNNEX-FPT", "AuthorizedDistributor" });

            migrationBuilder.UpdateData(
                table: "Suppliers",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "ContactPerson", "Email", "Name", "Phone", "SupplierCode", "SupplierType" },
                values: new object[] { null, "contact@digiworld.com.vn", "Digiworld", "02839299959", "SUP-DIGIWORLD", "AuthorizedDistributor" });

            migrationBuilder.UpdateData(
                table: "Suppliers",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Address", "ContactPerson", "Email", "Name", "Phone", "SupplierCode", "SupplierType" },
                values: new object[] { "Vietnam", null, "contact@petrosetco.com.vn", "Petrosetco", "02854168686", "SUP-PETROSETCO", "Tier1Distributor" });

            migrationBuilder.InsertData(
                table: "Suppliers",
                columns: new[] { "Id", "Address", "ContactPerson", "CreatedAt", "Email", "IsActive", "Name", "Note", "Phone", "SupplierCode", "SupplierType", "TaxCode", "UpdatedAt" },
                values: new object[,]
                {
                    { 4, "Vietnam", null, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "support.vn@samsung.com", true, "Samsung Viet Nam", null, "1800588899", "SUP-SAMSUNG-VN", "OfficialBrand", null, null },
                    { 5, "Vietnam", null, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "service.vn@xiaomi.com", true, "Xiaomi Viet Nam", null, "1800400410", "SUP-XIAOMI-VN", "OfficialBrand", null, null },
                    { 6, "Vietnam", null, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "support.vn@oppo.com", true, "OPPO Viet Nam", null, "1800577776", "SUP-OPPO-VN", "OfficialBrand", null, null },
                    { 7, "Vietnam", null, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "support.vn@sony.com", true, "Sony Viet Nam", null, "1800585885", "SUP-SONY-VN", "OfficialBrand", null, null },
                    { 8, "Vietnam", null, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "support@canon.com.vn", true, "Canon Viet Nam", null, "1900558800", "SUP-CANON-VN", "OfficialBrand", null, null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_SupplierCode",
                table: "Suppliers",
                column: "SupplierCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Products_BackupSupplierId",
                table: "Products",
                column: "BackupSupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_SupplierId",
                table: "Products",
                column: "SupplierId");

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Suppliers_BackupSupplierId",
                table: "Products",
                column: "BackupSupplierId",
                principalTable: "Suppliers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Suppliers_SupplierId",
                table: "Products",
                column: "SupplierId",
                principalTable: "Suppliers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Products_Suppliers_BackupSupplierId",
                table: "Products");

            migrationBuilder.DropForeignKey(
                name: "FK_Products_Suppliers_SupplierId",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Suppliers_SupplierCode",
                table: "Suppliers");

            migrationBuilder.DropIndex(
                name: "IX_Products_BackupSupplierId",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_SupplierId",
                table: "Products");

            migrationBuilder.DeleteData(
                table: "Suppliers",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Suppliers",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Suppliers",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Suppliers",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Suppliers",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DropColumn(
                name: "ContactPerson",
                table: "Suppliers");

            migrationBuilder.DropColumn(
                name: "SupplierType",
                table: "Suppliers");

            migrationBuilder.DropColumn(
                name: "BackupSupplierId",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "SupplierId",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "SupplyType",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "WarrantyProvider",
                table: "Products");

            migrationBuilder.RenameColumn(
                name: "SupplierCode",
                table: "Suppliers",
                newName: "Code");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 21, 17, 49, 44, 136, DateTimeKind.Utc).AddTicks(6988));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 21, 17, 49, 44, 136, DateTimeKind.Utc).AddTicks(7016));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 21, 17, 49, 44, 136, DateTimeKind.Utc).AddTicks(7020));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 21, 17, 49, 44, 136, DateTimeKind.Utc).AddTicks(7024));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 21, 17, 49, 44, 136, DateTimeKind.Utc).AddTicks(7027));

            migrationBuilder.UpdateData(
                table: "Suppliers",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Code", "Email", "Name", "Phone" },
                values: new object[] { "SUP-APPLE", "sales@apple.com", "Apple VN", "02873001999" });

            migrationBuilder.UpdateData(
                table: "Suppliers",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Code", "Email", "Name", "Phone" },
                values: new object[] { "SUP-SAMSUNG", "sales@samsung.com", "Samsung Electronics", "1800588899" });

            migrationBuilder.UpdateData(
                table: "Suppliers",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Address", "Code", "Email", "Name", "Phone" },
                values: new object[] { "Main warehouse", "SUP-DISTRO", "contact@cnthht.vn", "CNTHHT Distribution", "0327188459" });

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_Code",
                table: "Suppliers",
                column: "Code",
                unique: true);
        }
    }
}
