using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BaseCore.Repository.Migrations
{
    /// <summary>
    /// Removes legacy "orphan" columns that are no longer mapped by any entity.
    /// These columns are leftovers from earlier schema generations (MongoDB -> SQL Server
    /// migration and renamed columns) and have been superseded:
    ///   Attachments:     FilePath/FileSize/MimeType/UploadedBy  -> FileUrl/Size/ContentType/UploadedByUserId
    ///   WarrantyClaims:  WarrantyId (replaced by column WarrantyRecordId), ClaimType (unused)
    ///   WarrantyRecords: SerialOrImei (data lives in SerialNumber), legacy date columns,
    ///                    CustomerId (nvarchar legacy id), IsActive (replaced by Status)
    /// All dropped columns were verified to contain no data that is not already represented
    /// by the active columns, so no backfill is required.
    /// </summary>
    /// <inheritdoc />
    public partial class DropOrphanColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // --- Attachments ---
            migrationBuilder.DropColumn(name: "FilePath", table: "Attachments");
            migrationBuilder.DropColumn(name: "FileSize", table: "Attachments");
            migrationBuilder.DropColumn(name: "MimeType", table: "Attachments");
            migrationBuilder.DropColumn(name: "UploadedBy", table: "Attachments");

            // --- WarrantyClaims ---
            migrationBuilder.DropColumn(name: "WarrantyId", table: "WarrantyClaims");
            migrationBuilder.DropColumn(name: "ClaimType", table: "WarrantyClaims");

            // --- WarrantyRecords ---
            migrationBuilder.DropColumn(name: "SerialOrImei", table: "WarrantyRecords");
            migrationBuilder.DropColumn(name: "PurchaseDate", table: "WarrantyRecords");
            migrationBuilder.DropColumn(name: "WarrantyStartDate", table: "WarrantyRecords");
            migrationBuilder.DropColumn(name: "WarrantyEndDate", table: "WarrantyRecords");
            migrationBuilder.DropColumn(name: "CustomerId", table: "WarrantyRecords");
            migrationBuilder.DropColumn(name: "IsActive", table: "WarrantyRecords");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // --- Attachments ---
            migrationBuilder.AddColumn<string>(
                name: "FilePath", table: "Attachments",
                type: "nvarchar(500)", maxLength: 500, nullable: false, defaultValue: "");
            migrationBuilder.AddColumn<long>(
                name: "FileSize", table: "Attachments",
                type: "bigint", nullable: true);
            migrationBuilder.AddColumn<string>(
                name: "MimeType", table: "Attachments",
                type: "nvarchar(100)", maxLength: 100, nullable: true);
            migrationBuilder.AddColumn<string>(
                name: "UploadedBy", table: "Attachments",
                type: "nvarchar(100)", maxLength: 100, nullable: true);

            // --- WarrantyClaims ---
            migrationBuilder.AddColumn<int>(
                name: "WarrantyId", table: "WarrantyClaims",
                type: "int", nullable: true);
            migrationBuilder.AddColumn<string>(
                name: "ClaimType", table: "WarrantyClaims",
                type: "nvarchar(50)", maxLength: 50, nullable: true);

            // --- WarrantyRecords ---
            migrationBuilder.AddColumn<string>(
                name: "SerialOrImei", table: "WarrantyRecords",
                type: "nvarchar(120)", maxLength: 120, nullable: true);
            migrationBuilder.AddColumn<DateTime>(
                name: "PurchaseDate", table: "WarrantyRecords",
                type: "date", nullable: true);
            migrationBuilder.AddColumn<DateTime>(
                name: "WarrantyStartDate", table: "WarrantyRecords",
                type: "date", nullable: true);
            migrationBuilder.AddColumn<DateTime>(
                name: "WarrantyEndDate", table: "WarrantyRecords",
                type: "date", nullable: true);
            migrationBuilder.AddColumn<string>(
                name: "CustomerId", table: "WarrantyRecords",
                type: "nvarchar(100)", maxLength: 100, nullable: true);
            migrationBuilder.AddColumn<bool>(
                name: "IsActive", table: "WarrantyRecords",
                type: "bit", nullable: true);
        }
    }
}
