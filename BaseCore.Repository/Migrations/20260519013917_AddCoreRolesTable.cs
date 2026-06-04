using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814

namespace BaseCore.Repository.Migrations
{
    public partial class AddCoreRolesTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(24)", maxLength: 24, nullable: false),
                    Guid = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Created = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Modified = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    RoleType = table.Column<int>(type: "int", nullable: false),
                    CreatedDateTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedUser = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "Created", "CreatedBy", "CreatedDateTime", "CreatedUser", "Description", "Guid", "IsActive", "IsDeleted", "Modified", "ModifiedBy", "Name", "RoleType" },
                values: new object[,]
                {
                    { "000000000000000000000001", new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), "system", new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), "system", "Administrator", new Guid("00000000-0000-0000-0000-000000000001"), true, false, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), "system", "Admin", 1 },
                    { "000000000000000000000002", new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), "system", new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), "system", "Regular user", new Guid("00000000-0000-0000-0000-000000000002"), true, false, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), "system", "User", 0 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Roles_Name",
                table: "Roles",
                column: "Name",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "Roles");
        }
    }
}
