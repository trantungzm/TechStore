using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddWarrantyActivation_20260531 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "WarrantyRecords",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: false,
                defaultValue: "NotActivated",
                oldClrType: typeof(string),
                oldType: "nvarchar(40)",
                oldMaxLength: 40,
                oldDefaultValue: "Active");

            migrationBuilder.AddColumn<DateTime>(
                name: "ActivatedAt",
                table: "WarrantyRecords",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ExpiresAt",
                table: "WarrantyRecords",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActivatedAt",
                table: "WarrantyRecords");

            migrationBuilder.DropColumn(
                name: "ExpiresAt",
                table: "WarrantyRecords");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "WarrantyRecords",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: false,
                defaultValue: "Active",
                oldClrType: typeof(string),
                oldType: "nvarchar(40)",
                oldMaxLength: 40,
                oldDefaultValue: "NotActivated");
        }
    }
}
