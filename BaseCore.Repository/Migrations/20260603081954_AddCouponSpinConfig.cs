using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddCouponSpinConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
DECLARE @dropSql nvarchar(max) = N'';
SELECT @dropSql = @dropSql + N'ALTER TABLE [WarrantyClaims] DROP CONSTRAINT [' + fk.name + N'];'
FROM sys.foreign_keys fk
WHERE fk.parent_object_id = OBJECT_ID(N'[WarrantyClaims]')
  AND fk.referenced_object_id = OBJECT_ID(N'[WarrantyRecords]');

IF (LEN(@dropSql) > 0)
    EXEC sp_executesql @dropSql;
""");

            migrationBuilder.Sql("""
IF COL_LENGTH(N'WarrantyRecords', N'SerialNumber') IS NULL AND COL_LENGTH(N'WarrantyRecords', N'SerialOrImei') IS NOT NULL
    EXEC sp_rename N'[WarrantyRecords].[SerialOrImei]', N'SerialNumber', N'COLUMN';

IF COL_LENGTH(N'WarrantyRecords', N'SerialNumber') IS NOT NULL AND COL_LENGTH(N'WarrantyRecords', N'SerialOrImei') IS NOT NULL
    UPDATE [WarrantyRecords]
    SET [SerialNumber] = COALESCE(NULLIF([SerialNumber], N''), [SerialOrImei])
    WHERE [SerialNumber] IS NULL OR [SerialNumber] = N'';

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_WarrantyRecords_SerialOrImei' AND object_id = OBJECT_ID(N'[WarrantyRecords]'))
   AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_WarrantyRecords_SerialNumber' AND object_id = OBJECT_ID(N'[WarrantyRecords]'))
    EXEC sp_rename N'[WarrantyRecords].[IX_WarrantyRecords_SerialOrImei]', N'IX_WarrantyRecords_SerialNumber', N'INDEX';
""");

            migrationBuilder.Sql("""
IF COL_LENGTH(N'WarrantyClaims', N'WarrantyRecordId') IS NULL AND COL_LENGTH(N'WarrantyClaims', N'WarrantyId') IS NOT NULL
    EXEC sp_rename N'[WarrantyClaims].[WarrantyId]', N'WarrantyRecordId', N'COLUMN';

IF COL_LENGTH(N'WarrantyClaims', N'WarrantyRecordId') IS NOT NULL AND COL_LENGTH(N'WarrantyClaims', N'WarrantyId') IS NOT NULL
    UPDATE [WarrantyClaims]
    SET [WarrantyRecordId] = COALESCE([WarrantyRecordId], [WarrantyId])
    WHERE [WarrantyRecordId] IS NULL;

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_WarrantyClaims_WarrantyId' AND object_id = OBJECT_ID(N'[WarrantyClaims]'))
   AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_WarrantyClaims_WarrantyRecordId' AND object_id = OBJECT_ID(N'[WarrantyClaims]'))
    EXEC sp_rename N'[WarrantyClaims].[IX_WarrantyClaims_WarrantyId]', N'IX_WarrantyClaims_WarrantyRecordId', N'INDEX';
""");

            migrationBuilder.Sql("""
IF COL_LENGTH(N'RepairCases', N'SerialNumber') IS NULL AND COL_LENGTH(N'RepairCases', N'SerialOrImei') IS NOT NULL
    EXEC sp_rename N'[RepairCases].[SerialOrImei]', N'SerialNumber', N'COLUMN';

IF COL_LENGTH(N'RepairCases', N'CaseCode') IS NULL AND COL_LENGTH(N'RepairCases', N'RepairCode') IS NOT NULL
    EXEC sp_rename N'[RepairCases].[RepairCode]', N'CaseCode', N'COLUMN';

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_RepairCases_RepairCode' AND object_id = OBJECT_ID(N'[RepairCases]'))
   AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_RepairCases_CaseCode' AND object_id = OBJECT_ID(N'[RepairCases]'))
    EXEC sp_rename N'[RepairCases].[IX_RepairCases_RepairCode]', N'IX_RepairCases_CaseCode', N'INDEX';
""");

            migrationBuilder.Sql("""
IF COL_LENGTH(N'WarrantyRecords', N'SerialNumber') IS NOT NULL
BEGIN
    UPDATE [WarrantyRecords] SET [SerialNumber] = N'' WHERE [SerialNumber] IS NULL;
    ALTER TABLE [WarrantyRecords] ALTER COLUMN [SerialNumber] nvarchar(120) NOT NULL;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.default_constraints dc
        INNER JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
        WHERE dc.parent_object_id = OBJECT_ID(N'[WarrantyRecords]') AND c.name = N'SerialNumber'
    )
        ALTER TABLE [WarrantyRecords] ADD DEFAULT N'' FOR [SerialNumber];

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_WarrantyRecords_SerialNumber' AND object_id = OBJECT_ID(N'[WarrantyRecords]'))
        CREATE INDEX [IX_WarrantyRecords_SerialNumber] ON [WarrantyRecords] ([SerialNumber]);
END
""");

            migrationBuilder.Sql("""
IF COL_LENGTH(N'WarrantyClaims', N'WarrantyRecordId') IS NOT NULL
BEGIN
    IF EXISTS (SELECT 1 FROM [WarrantyClaims] WHERE [WarrantyRecordId] IS NULL)
        DELETE FROM [WarrantyClaims] WHERE [WarrantyRecordId] IS NULL;

    DELETE wc
    FROM [WarrantyClaims] wc
    LEFT JOIN [WarrantyRecords] wr ON wr.[Id] = wc.[WarrantyRecordId]
    WHERE wr.[Id] IS NULL;

    ALTER TABLE [WarrantyClaims] ALTER COLUMN [WarrantyRecordId] int NOT NULL;

    IF NOT EXISTS (
        SELECT 1
        FROM sys.default_constraints dc
        INNER JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
        WHERE dc.parent_object_id = OBJECT_ID(N'[WarrantyClaims]') AND c.name = N'WarrantyRecordId'
    )
        ALTER TABLE [WarrantyClaims] ADD DEFAULT (0) FOR [WarrantyRecordId];

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_WarrantyClaims_WarrantyRecordId' AND object_id = OBJECT_ID(N'[WarrantyClaims]'))
        CREATE INDEX [IX_WarrantyClaims_WarrantyRecordId] ON [WarrantyClaims] ([WarrantyRecordId]);
END
""");

            migrationBuilder.AddColumn<bool>(
                name: "IsSpinReward",
                table: "Coupons",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "SpinWeight",
                table: "Coupons",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "Coupons",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "IsSpinReward", "SpinWeight" },
                values: new object[] { true, 25 });

            migrationBuilder.UpdateData(
                table: "Coupons",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "IsSpinReward", "SpinWeight" },
                values: new object[] { true, 20 });

            migrationBuilder.UpdateData(
                table: "Coupons",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "IsSpinReward", "SpinWeight" },
                values: new object[] { true, 15 });

            migrationBuilder.UpdateData(
                table: "Coupons",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "IsSpinReward", "SpinWeight" },
                values: new object[] { true, 10 });

            migrationBuilder.UpdateData(
                table: "Coupons",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "IsSpinReward", "SpinWeight" },
                values: new object[] { true, 5 });

            migrationBuilder.UpdateData(
                table: "Coupons",
                keyColumn: "Id",
                keyValue: 10,
                columns: new[] { "IsSpinReward", "SpinWeight" },
                values: new object[] { true, 10 });

            migrationBuilder.AddForeignKey(
                name: "FK_WarrantyClaims_WarrantyRecords_WarrantyRecordId",
                table: "WarrantyClaims",
                column: "WarrantyRecordId",
                principalTable: "WarrantyRecords",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WarrantyClaims_WarrantyRecords_WarrantyRecordId",
                table: "WarrantyClaims");

            migrationBuilder.DropColumn(
                name: "IsSpinReward",
                table: "Coupons");

            migrationBuilder.DropColumn(
                name: "SpinWeight",
                table: "Coupons");

            migrationBuilder.RenameColumn(
                name: "SerialNumber",
                table: "WarrantyRecords",
                newName: "SerialOrImei");

            migrationBuilder.RenameIndex(
                name: "IX_WarrantyRecords_SerialNumber",
                table: "WarrantyRecords",
                newName: "IX_WarrantyRecords_SerialOrImei");

            migrationBuilder.RenameColumn(
                name: "WarrantyRecordId",
                table: "WarrantyClaims",
                newName: "WarrantyId");

            migrationBuilder.RenameIndex(
                name: "IX_WarrantyClaims_WarrantyRecordId",
                table: "WarrantyClaims",
                newName: "IX_WarrantyClaims_WarrantyId");

            migrationBuilder.RenameColumn(
                name: "SerialNumber",
                table: "RepairCases",
                newName: "SerialOrImei");

            migrationBuilder.RenameColumn(
                name: "CaseCode",
                table: "RepairCases",
                newName: "RepairCode");

            migrationBuilder.RenameIndex(
                name: "IX_RepairCases_CaseCode",
                table: "RepairCases",
                newName: "IX_RepairCases_RepairCode");

            migrationBuilder.AlterColumn<string>(
                name: "SerialOrImei",
                table: "WarrantyRecords",
                type: "nvarchar(120)",
                maxLength: 120,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(120)",
                oldMaxLength: 120);

            migrationBuilder.AlterColumn<int>(
                name: "WarrantyId",
                table: "WarrantyClaims",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_WarrantyClaims_WarrantyRecords_WarrantyId",
                table: "WarrantyClaims",
                column: "WarrantyId",
                principalTable: "WarrantyRecords",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
