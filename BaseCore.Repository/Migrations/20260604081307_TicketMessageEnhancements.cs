using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class TicketMessageEnhancements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsAdminReply",
                table: "SupportTicketUpdates",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "ParentMessageId",
                table: "SupportTicketUpdates",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SenderName",
                table: "SupportTicketUpdates",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UserSessionId",
                table: "SupportTickets",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SupportTicketUpdates_ParentMessageId",
                table: "SupportTicketUpdates",
                column: "ParentMessageId");

            migrationBuilder.AddForeignKey(
                name: "FK_SupportTicketUpdates_SupportTicketUpdates_ParentMessageId",
                table: "SupportTicketUpdates",
                column: "ParentMessageId",
                principalTable: "SupportTicketUpdates",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SupportTicketUpdates_SupportTicketUpdates_ParentMessageId",
                table: "SupportTicketUpdates");

            migrationBuilder.DropIndex(
                name: "IX_SupportTicketUpdates_ParentMessageId",
                table: "SupportTicketUpdates");

            migrationBuilder.DropColumn(
                name: "IsAdminReply",
                table: "SupportTicketUpdates");

            migrationBuilder.DropColumn(
                name: "ParentMessageId",
                table: "SupportTicketUpdates");

            migrationBuilder.DropColumn(
                name: "SenderName",
                table: "SupportTicketUpdates");

            migrationBuilder.DropColumn(
                name: "UserSessionId",
                table: "SupportTickets");
        }
    }
}
