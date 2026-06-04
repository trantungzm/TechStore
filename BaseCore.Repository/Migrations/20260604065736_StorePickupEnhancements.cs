﻿﻿﻿using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class StorePickupEnhancements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "PickupExpiresAt",
                table: "Orders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PickupSlotEndAt",
                table: "Orders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PickupSlotStartAt",
                table: "Orders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PickupVerificationPin",
                table: "Orders",
                type: "nvarchar(12)",
                maxLength: 12,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PickupWarehouseId",
                table: "Orders",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReadyForPickupAt",
                table: "Orders",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PickupExpiresAt",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PickupSlotEndAt",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PickupSlotStartAt",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PickupVerificationPin",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PickupWarehouseId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "ReadyForPickupAt",
                table: "Orders");
        }
    }
}
