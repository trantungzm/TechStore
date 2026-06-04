using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddWarrantyRepairTicketNotification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Attachments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EntityType = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    EntityId = table.Column<int>(type: "int", nullable: true),
                    FileName = table.Column<string>(type: "nvarchar(260)", maxLength: 260, nullable: false),
                    FileUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ContentType = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Size = table.Column<long>(type: "bigint", nullable: false),
                    UploadedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Attachments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    ReferenceType = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    ReferenceId = table.Column<int>(type: "int", nullable: true),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    ReadAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WarrantyRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WarrantyCode = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    OrderId = table.Column<int>(type: "int", nullable: true),
                    OrderDetailId = table.Column<int>(type: "int", nullable: true),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    VariantId = table.Column<int>(type: "int", nullable: true),
                    StockItemId = table.Column<int>(type: "int", nullable: true),
                    SerialOrImei = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    CustomerName = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    CustomerPhone = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    CustomerEmail = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    ProductName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    ProductImage = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    WarrantyMonths = table.Column<int>(type: "int", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false, defaultValue: "Active"),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Note = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WarrantyRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WarrantyRecords_OrderDetails_OrderDetailId",
                        column: x => x.OrderDetailId,
                        principalTable: "OrderDetails",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WarrantyRecords_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WarrantyRecords_ProductVariants_VariantId",
                        column: x => x.VariantId,
                        principalTable: "ProductVariants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WarrantyRecords_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WarrantyRecords_StockItems_StockItemId",
                        column: x => x.StockItemId,
                        principalTable: "StockItems",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "SupportTickets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TicketCode = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Subject = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(3000)", maxLength: 3000, nullable: false),
                    CustomerName = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    CustomerPhone = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    CustomerEmail = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    RelatedOrderId = table.Column<int>(type: "int", nullable: true),
                    RelatedProductId = table.Column<int>(type: "int", nullable: true),
                    RelatedWarrantyId = table.Column<int>(type: "int", nullable: true),
                    SerialOrImei = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false, defaultValue: "Open"),
                    Priority = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false, defaultValue: "Normal"),
                    Category = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false, defaultValue: "Other"),
                    AssignedToUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ClosedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupportTickets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SupportTickets_Orders_RelatedOrderId",
                        column: x => x.RelatedOrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_SupportTickets_Products_RelatedProductId",
                        column: x => x.RelatedProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_SupportTickets_WarrantyRecords_RelatedWarrantyId",
                        column: x => x.RelatedWarrantyId,
                        principalTable: "WarrantyRecords",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "WarrantyClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClaimCode = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    WarrantyId = table.Column<int>(type: "int", nullable: true),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    OrderId = table.Column<int>(type: "int", nullable: true),
                    OrderDetailId = table.Column<int>(type: "int", nullable: true),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    VariantId = table.Column<int>(type: "int", nullable: true),
                    StockItemId = table.Column<int>(type: "int", nullable: true),
                    SerialOrImei = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    CustomerName = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    CustomerPhone = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    CustomerEmail = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    IssueDescription = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    ReceiveMethod = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    ReturnAddress = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false, defaultValue: "Pending"),
                    Priority = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false, defaultValue: "Normal"),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReceivedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RejectedReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Note = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WarrantyClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WarrantyClaims_ProductVariants_VariantId",
                        column: x => x.VariantId,
                        principalTable: "ProductVariants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WarrantyClaims_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WarrantyClaims_StockItems_StockItemId",
                        column: x => x.StockItemId,
                        principalTable: "StockItems",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WarrantyClaims_WarrantyRecords_WarrantyId",
                        column: x => x.WarrantyId,
                        principalTable: "WarrantyRecords",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "SupportTicketUpdates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TicketId = table.Column<int>(type: "int", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(3000)", maxLength: 3000, nullable: false),
                    StatusAfter = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    PriorityAfter = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsInternalNote = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupportTicketUpdates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SupportTicketUpdates_SupportTickets_TicketId",
                        column: x => x.TicketId,
                        principalTable: "SupportTickets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RepairCases",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RepairCode = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    WarrantyClaimId = table.Column<int>(type: "int", nullable: true),
                    TicketId = table.Column<int>(type: "int", nullable: true),
                    StockItemId = table.Column<int>(type: "int", nullable: true),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    VariantId = table.Column<int>(type: "int", nullable: true),
                    SerialOrImei = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    CustomerName = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    CustomerPhone = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    ProductName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    IssueDescription = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Diagnosis = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Solution = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    TechnicianId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false, defaultValue: "Pending"),
                    Priority = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false, defaultValue: "Normal"),
                    ReceivedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EstimatedCompletionAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CostEstimate = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    FinalCost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    IsWarrantyCovered = table.Column<bool>(type: "bit", nullable: false),
                    CustomerApprovedCost = table.Column<bool>(type: "bit", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RepairCases", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RepairCases_ProductVariants_VariantId",
                        column: x => x.VariantId,
                        principalTable: "ProductVariants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RepairCases_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RepairCases_StockItems_StockItemId",
                        column: x => x.StockItemId,
                        principalTable: "StockItems",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RepairCases_SupportTickets_TicketId",
                        column: x => x.TicketId,
                        principalTable: "SupportTickets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_RepairCases_WarrantyClaims_WarrantyClaimId",
                        column: x => x.WarrantyClaimId,
                        principalTable: "WarrantyClaims",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "WarrantyClaimUpdates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WarrantyClaimId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WarrantyClaimUpdates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WarrantyClaimUpdates_WarrantyClaims_WarrantyClaimId",
                        column: x => x.WarrantyClaimId,
                        principalTable: "WarrantyClaims",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RepairUpdates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RepairCaseId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RepairUpdates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RepairUpdates_RepairCases_RepairCaseId",
                        column: x => x.RepairCaseId,
                        principalTable: "RepairCases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 18, 1, 58, 44, 499, DateTimeKind.Utc).AddTicks(7118));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 18, 1, 58, 44, 499, DateTimeKind.Utc).AddTicks(7142));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 18, 1, 58, 44, 499, DateTimeKind.Utc).AddTicks(7144));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 18, 1, 58, 44, 499, DateTimeKind.Utc).AddTicks(7146));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 18, 1, 58, 44, 499, DateTimeKind.Utc).AddTicks(7148));

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId_IsRead_CreatedAt",
                table: "Notifications",
                columns: new[] { "UserId", "IsRead", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_RepairCases_ProductId",
                table: "RepairCases",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_RepairCases_RepairCode",
                table: "RepairCases",
                column: "RepairCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RepairCases_StockItemId",
                table: "RepairCases",
                column: "StockItemId");

            migrationBuilder.CreateIndex(
                name: "IX_RepairCases_TicketId",
                table: "RepairCases",
                column: "TicketId");

            migrationBuilder.CreateIndex(
                name: "IX_RepairCases_VariantId",
                table: "RepairCases",
                column: "VariantId");

            migrationBuilder.CreateIndex(
                name: "IX_RepairCases_WarrantyClaimId",
                table: "RepairCases",
                column: "WarrantyClaimId");

            migrationBuilder.CreateIndex(
                name: "IX_RepairUpdates_RepairCaseId",
                table: "RepairUpdates",
                column: "RepairCaseId");

            migrationBuilder.CreateIndex(
                name: "IX_SupportTickets_RelatedOrderId",
                table: "SupportTickets",
                column: "RelatedOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_SupportTickets_RelatedProductId",
                table: "SupportTickets",
                column: "RelatedProductId");

            migrationBuilder.CreateIndex(
                name: "IX_SupportTickets_RelatedWarrantyId",
                table: "SupportTickets",
                column: "RelatedWarrantyId");

            migrationBuilder.CreateIndex(
                name: "IX_SupportTickets_TicketCode",
                table: "SupportTickets",
                column: "TicketCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SupportTicketUpdates_TicketId",
                table: "SupportTicketUpdates",
                column: "TicketId");

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyClaims_ClaimCode",
                table: "WarrantyClaims",
                column: "ClaimCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyClaims_ProductId",
                table: "WarrantyClaims",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyClaims_StockItemId",
                table: "WarrantyClaims",
                column: "StockItemId");

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyClaims_VariantId",
                table: "WarrantyClaims",
                column: "VariantId");

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyClaims_WarrantyId",
                table: "WarrantyClaims",
                column: "WarrantyId");

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyClaimUpdates_WarrantyClaimId",
                table: "WarrantyClaimUpdates",
                column: "WarrantyClaimId");

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyRecords_OrderDetailId",
                table: "WarrantyRecords",
                column: "OrderDetailId");

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyRecords_OrderId",
                table: "WarrantyRecords",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyRecords_ProductId",
                table: "WarrantyRecords",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyRecords_SerialOrImei",
                table: "WarrantyRecords",
                column: "SerialOrImei");

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyRecords_StockItemId",
                table: "WarrantyRecords",
                column: "StockItemId");

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyRecords_VariantId",
                table: "WarrantyRecords",
                column: "VariantId");

            migrationBuilder.CreateIndex(
                name: "IX_WarrantyRecords_WarrantyCode",
                table: "WarrantyRecords",
                column: "WarrantyCode",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Attachments");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "RepairUpdates");

            migrationBuilder.DropTable(
                name: "SupportTicketUpdates");

            migrationBuilder.DropTable(
                name: "WarrantyClaimUpdates");

            migrationBuilder.DropTable(
                name: "RepairCases");

            migrationBuilder.DropTable(
                name: "SupportTickets");

            migrationBuilder.DropTable(
                name: "WarrantyClaims");

            migrationBuilder.DropTable(
                name: "WarrantyRecords");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 18, 1, 40, 54, 862, DateTimeKind.Utc).AddTicks(5939));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 18, 1, 40, 54, 862, DateTimeKind.Utc).AddTicks(5956));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 18, 1, 40, 54, 862, DateTimeKind.Utc).AddTicks(5959));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 18, 1, 40, 54, 862, DateTimeKind.Utc).AddTicks(5962));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 18, 1, 40, 54, 862, DateTimeKind.Utc).AddTicks(5964));
        }
    }
}
