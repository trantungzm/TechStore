using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddUserForeignKeys : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Safety net: null out any user-reference Guid that does not match an
            // existing Users.Id so the foreign keys below can be created on any
            // environment. On the current DB this is a no-op (0 orphans verified).
            migrationBuilder.Sql(@"
UPDATE [Attachments]          SET [UploadedByUserId]        = NULL WHERE [UploadedByUserId]        IS NOT NULL AND [UploadedByUserId]        NOT IN (SELECT [Id] FROM [Users]);
UPDATE [Coupons]              SET [CreatedByUserId]         = NULL WHERE [CreatedByUserId]         IS NOT NULL AND [CreatedByUserId]         NOT IN (SELECT [Id] FROM [Users]);
UPDATE [GoodsReceipts]        SET [CreatedByUserId]         = NULL WHERE [CreatedByUserId]         IS NOT NULL AND [CreatedByUserId]         NOT IN (SELECT [Id] FROM [Users]);
UPDATE [InventoryReturns]     SET [CreatedByUserId]         = NULL WHERE [CreatedByUserId]         IS NOT NULL AND [CreatedByUserId]         NOT IN (SELECT [Id] FROM [Users]);
UPDATE [InventoryReturns]     SET [ReviewedByUserId]        = NULL WHERE [ReviewedByUserId]        IS NOT NULL AND [ReviewedByUserId]        NOT IN (SELECT [Id] FROM [Users]);
UPDATE [InventoryTransactions] SET [CreatedByUserId]        = NULL WHERE [CreatedByUserId]         IS NOT NULL AND [CreatedByUserId]         NOT IN (SELECT [Id] FROM [Users]);
UPDATE [Notifications]        SET [UserId]                  = NULL WHERE [UserId]                  IS NOT NULL AND [UserId]                  NOT IN (SELECT [Id] FROM [Users]);
UPDATE [OrderCancellations]   SET [RequestedByUserId]       = NULL WHERE [RequestedByUserId]       IS NOT NULL AND [RequestedByUserId]       NOT IN (SELECT [Id] FROM [Users]);
UPDATE [OrderCancellations]   SET [ReviewedByUserId]        = NULL WHERE [ReviewedByUserId]        IS NOT NULL AND [ReviewedByUserId]        NOT IN (SELECT [Id] FROM [Users]);
UPDATE [Orders]               SET [CancelReviewedByUserId]  = NULL WHERE [CancelReviewedByUserId]  IS NOT NULL AND [CancelReviewedByUserId]  NOT IN (SELECT [Id] FROM [Users]);
UPDATE [Orders]               SET [UpdatedByUserId]         = NULL WHERE [UpdatedByUserId]         IS NOT NULL AND [UpdatedByUserId]         NOT IN (SELECT [Id] FROM [Users]);
UPDATE [Orders]               SET [UserId]                  = NULL WHERE [UserId]                  IS NOT NULL AND [UserId]                  NOT IN (SELECT [Id] FROM [Users]);
UPDATE [OrderTimelines]       SET [CreatedByUserId]         = NULL WHERE [CreatedByUserId]         IS NOT NULL AND [CreatedByUserId]         NOT IN (SELECT [Id] FROM [Users]);
UPDATE [RepairCases]          SET [TechnicianId]            = NULL WHERE [TechnicianId]            IS NOT NULL AND [TechnicianId]            NOT IN (SELECT [Id] FROM [Users]);
UPDATE [RepairUpdates]        SET [CreatedByUserId]         = NULL WHERE [CreatedByUserId]         IS NOT NULL AND [CreatedByUserId]         NOT IN (SELECT [Id] FROM [Users]);
UPDATE [StockItems]           SET [CustomerId]              = NULL WHERE [CustomerId]              IS NOT NULL AND [CustomerId]              NOT IN (SELECT [Id] FROM [Users]);
UPDATE [StockMovements]       SET [CreatedByUserId]         = NULL WHERE [CreatedByUserId]         IS NOT NULL AND [CreatedByUserId]         NOT IN (SELECT [Id] FROM [Users]);
UPDATE [SupportTickets]       SET [AssignedToUserId]        = NULL WHERE [AssignedToUserId]        IS NOT NULL AND [AssignedToUserId]        NOT IN (SELECT [Id] FROM [Users]);
UPDATE [SupportTickets]       SET [UserId]                  = NULL WHERE [UserId]                  IS NOT NULL AND [UserId]                  NOT IN (SELECT [Id] FROM [Users]);
UPDATE [SupportTicketUpdates] SET [CreatedByUserId]         = NULL WHERE [CreatedByUserId]         IS NOT NULL AND [CreatedByUserId]         NOT IN (SELECT [Id] FROM [Users]);
UPDATE [UserCoupons]          SET [UserId]                  = NULL WHERE [UserId]                  IS NOT NULL AND [UserId]                  NOT IN (SELECT [Id] FROM [Users]);
UPDATE [VoucherSpins]         SET [UserId]                  = NULL WHERE [UserId]                  IS NOT NULL AND [UserId]                  NOT IN (SELECT [Id] FROM [Users]);
UPDATE [WarrantyClaims]       SET [UserId]                  = NULL WHERE [UserId]                  IS NOT NULL AND [UserId]                  NOT IN (SELECT [Id] FROM [Users]);
UPDATE [WarrantyClaimUpdates] SET [CreatedByUserId]         = NULL WHERE [CreatedByUserId]         IS NOT NULL AND [CreatedByUserId]         NOT IN (SELECT [Id] FROM [Users]);
UPDATE [WarrantyRecords]      SET [UserId]                  = NULL WHERE [UserId]                  IS NOT NULL AND [UserId]                  NOT IN (SELECT [Id] FROM [Users]);
");

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyRecords_UserId",
                table: "WarrantyRecords",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyClaimUpdates_CreatedByUserId",
                table: "WarrantyClaimUpdates",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyClaims_UserId",
                table: "WarrantyClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_SupportTicketUpdates_CreatedByUserId",
                table: "SupportTicketUpdates",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_SupportTickets_AssignedToUserId",
                table: "SupportTickets",
                column: "AssignedToUserId");

            migrationBuilder.CreateIndex(
                name: "IX_SupportTickets_UserId",
                table: "SupportTickets",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_CreatedByUserId",
                table: "StockMovements",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_StockItems_CustomerId",
                table: "StockItems",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_RepairUpdates_CreatedByUserId",
                table: "RepairUpdates",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_RepairCases_TechnicianId",
                table: "RepairCases",
                column: "TechnicianId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderTimelines_CreatedByUserId",
                table: "OrderTimelines",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_CancelReviewedByUserId",
                table: "Orders",
                column: "CancelReviewedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_UpdatedByUserId",
                table: "Orders",
                column: "UpdatedByUserId");

            // IX_Orders_UserId already exists in the database; FK reuses it.

            migrationBuilder.CreateIndex(
                name: "IX_OrderCancellations_RequestedByUserId",
                table: "OrderCancellations",
                column: "RequestedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderCancellations_ReviewedByUserId",
                table: "OrderCancellations",
                column: "ReviewedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransactions_CreatedByUserId",
                table: "InventoryTransactions",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryReturns_CreatedByUserId",
                table: "InventoryReturns",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryReturns_ReviewedByUserId",
                table: "InventoryReturns",
                column: "ReviewedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_GoodsReceipts_CreatedByUserId",
                table: "GoodsReceipts",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Coupons_CreatedByUserId",
                table: "Coupons",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_UploadedByUserId",
                table: "Attachments",
                column: "UploadedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Attachments_Users_UploadedByUserId",
                table: "Attachments",
                column: "UploadedByUserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Coupons_Users_CreatedByUserId",
                table: "Coupons",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_GoodsReceipts_Users_CreatedByUserId",
                table: "GoodsReceipts",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryReturns_Users_CreatedByUserId",
                table: "InventoryReturns",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryReturns_Users_ReviewedByUserId",
                table: "InventoryReturns",
                column: "ReviewedByUserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryTransactions_Users_CreatedByUserId",
                table: "InventoryTransactions",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Users_UserId",
                table: "Notifications",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderCancellations_Users_RequestedByUserId",
                table: "OrderCancellations",
                column: "RequestedByUserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderCancellations_Users_ReviewedByUserId",
                table: "OrderCancellations",
                column: "ReviewedByUserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Users_CancelReviewedByUserId",
                table: "Orders",
                column: "CancelReviewedByUserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Users_UpdatedByUserId",
                table: "Orders",
                column: "UpdatedByUserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Users_UserId",
                table: "Orders",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderTimelines_Users_CreatedByUserId",
                table: "OrderTimelines",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_RepairCases_Users_TechnicianId",
                table: "RepairCases",
                column: "TechnicianId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_RepairUpdates_Users_CreatedByUserId",
                table: "RepairUpdates",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_StockItems_Users_CustomerId",
                table: "StockItems",
                column: "CustomerId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_StockMovements_Users_CreatedByUserId",
                table: "StockMovements",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SupportTickets_Users_AssignedToUserId",
                table: "SupportTickets",
                column: "AssignedToUserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SupportTickets_Users_UserId",
                table: "SupportTickets",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SupportTicketUpdates_Users_CreatedByUserId",
                table: "SupportTicketUpdates",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_UserCoupons_Users_UserId",
                table: "UserCoupons",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_VoucherSpins_Users_UserId",
                table: "VoucherSpins",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_WarrantyClaims_Users_UserId",
                table: "WarrantyClaims",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_WarrantyClaimUpdates_Users_CreatedByUserId",
                table: "WarrantyClaimUpdates",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_WarrantyRecords_Users_UserId",
                table: "WarrantyRecords",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Attachments_Users_UploadedByUserId",
                table: "Attachments");

            migrationBuilder.DropForeignKey(
                name: "FK_Coupons_Users_CreatedByUserId",
                table: "Coupons");

            migrationBuilder.DropForeignKey(
                name: "FK_GoodsReceipts_Users_CreatedByUserId",
                table: "GoodsReceipts");

            migrationBuilder.DropForeignKey(
                name: "FK_InventoryReturns_Users_CreatedByUserId",
                table: "InventoryReturns");

            migrationBuilder.DropForeignKey(
                name: "FK_InventoryReturns_Users_ReviewedByUserId",
                table: "InventoryReturns");

            migrationBuilder.DropForeignKey(
                name: "FK_InventoryTransactions_Users_CreatedByUserId",
                table: "InventoryTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Users_UserId",
                table: "Notifications");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderCancellations_Users_RequestedByUserId",
                table: "OrderCancellations");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderCancellations_Users_ReviewedByUserId",
                table: "OrderCancellations");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Users_CancelReviewedByUserId",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Users_UpdatedByUserId",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Users_UserId",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderTimelines_Users_CreatedByUserId",
                table: "OrderTimelines");

            migrationBuilder.DropForeignKey(
                name: "FK_RepairCases_Users_TechnicianId",
                table: "RepairCases");

            migrationBuilder.DropForeignKey(
                name: "FK_RepairUpdates_Users_CreatedByUserId",
                table: "RepairUpdates");

            migrationBuilder.DropForeignKey(
                name: "FK_StockItems_Users_CustomerId",
                table: "StockItems");

            migrationBuilder.DropForeignKey(
                name: "FK_StockMovements_Users_CreatedByUserId",
                table: "StockMovements");

            migrationBuilder.DropForeignKey(
                name: "FK_SupportTickets_Users_AssignedToUserId",
                table: "SupportTickets");

            migrationBuilder.DropForeignKey(
                name: "FK_SupportTickets_Users_UserId",
                table: "SupportTickets");

            migrationBuilder.DropForeignKey(
                name: "FK_SupportTicketUpdates_Users_CreatedByUserId",
                table: "SupportTicketUpdates");

            migrationBuilder.DropForeignKey(
                name: "FK_UserCoupons_Users_UserId",
                table: "UserCoupons");

            migrationBuilder.DropForeignKey(
                name: "FK_VoucherSpins_Users_UserId",
                table: "VoucherSpins");

            migrationBuilder.DropForeignKey(
                name: "FK_WarrantyClaims_Users_UserId",
                table: "WarrantyClaims");

            migrationBuilder.DropForeignKey(
                name: "FK_WarrantyClaimUpdates_Users_CreatedByUserId",
                table: "WarrantyClaimUpdates");

            migrationBuilder.DropForeignKey(
                name: "FK_WarrantyRecords_Users_UserId",
                table: "WarrantyRecords");

            migrationBuilder.DropIndex(
                name: "IX_WarrantyRecords_UserId",
                table: "WarrantyRecords");

            migrationBuilder.DropIndex(
                name: "IX_WarrantyClaimUpdates_CreatedByUserId",
                table: "WarrantyClaimUpdates");

            migrationBuilder.DropIndex(
                name: "IX_WarrantyClaims_UserId",
                table: "WarrantyClaims");

            migrationBuilder.DropIndex(
                name: "IX_SupportTicketUpdates_CreatedByUserId",
                table: "SupportTicketUpdates");

            migrationBuilder.DropIndex(
                name: "IX_SupportTickets_AssignedToUserId",
                table: "SupportTickets");

            migrationBuilder.DropIndex(
                name: "IX_SupportTickets_UserId",
                table: "SupportTickets");

            migrationBuilder.DropIndex(
                name: "IX_StockMovements_CreatedByUserId",
                table: "StockMovements");

            migrationBuilder.DropIndex(
                name: "IX_StockItems_CustomerId",
                table: "StockItems");

            migrationBuilder.DropIndex(
                name: "IX_RepairUpdates_CreatedByUserId",
                table: "RepairUpdates");

            migrationBuilder.DropIndex(
                name: "IX_RepairCases_TechnicianId",
                table: "RepairCases");

            migrationBuilder.DropIndex(
                name: "IX_OrderTimelines_CreatedByUserId",
                table: "OrderTimelines");

            migrationBuilder.DropIndex(
                name: "IX_Orders_CancelReviewedByUserId",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_UpdatedByUserId",
                table: "Orders");

            // IX_Orders_UserId pre-existed and is intentionally left in place.

            migrationBuilder.DropIndex(
                name: "IX_OrderCancellations_RequestedByUserId",
                table: "OrderCancellations");

            migrationBuilder.DropIndex(
                name: "IX_OrderCancellations_ReviewedByUserId",
                table: "OrderCancellations");

            migrationBuilder.DropIndex(
                name: "IX_InventoryTransactions_CreatedByUserId",
                table: "InventoryTransactions");

            migrationBuilder.DropIndex(
                name: "IX_InventoryReturns_CreatedByUserId",
                table: "InventoryReturns");

            migrationBuilder.DropIndex(
                name: "IX_InventoryReturns_ReviewedByUserId",
                table: "InventoryReturns");

            migrationBuilder.DropIndex(
                name: "IX_GoodsReceipts_CreatedByUserId",
                table: "GoodsReceipts");

            migrationBuilder.DropIndex(
                name: "IX_Coupons_CreatedByUserId",
                table: "Coupons");

            migrationBuilder.DropIndex(
                name: "IX_Attachments_UploadedByUserId",
                table: "Attachments");
        }
    }
}
