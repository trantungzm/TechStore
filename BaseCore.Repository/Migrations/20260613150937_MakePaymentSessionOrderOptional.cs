using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class MakePaymentSessionOrderOptional : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF COL_LENGTH('PaymentSessions', 'OrderId') IS NOT NULL
BEGIN
    ALTER TABLE PaymentSessions ALTER COLUMN OrderId int NULL;
END

IF COL_LENGTH('PaymentSessions', 'UserId') IS NULL
BEGIN
    ALTER TABLE PaymentSessions ADD UserId uniqueidentifier NULL;
END

IF COL_LENGTH('PaymentSessions', 'OrderPayloadJson') IS NULL
BEGIN
    ALTER TABLE PaymentSessions ADD OrderPayloadJson nvarchar(max) NULL;
END
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF COL_LENGTH('PaymentSessions', 'OrderPayloadJson') IS NOT NULL
BEGIN
    ALTER TABLE PaymentSessions DROP COLUMN OrderPayloadJson;
END

IF COL_LENGTH('PaymentSessions', 'UserId') IS NOT NULL
BEGIN
    ALTER TABLE PaymentSessions DROP COLUMN UserId;
END

IF COL_LENGTH('PaymentSessions', 'OrderId') IS NOT NULL
BEGIN
    UPDATE PaymentSessions SET OrderId = 0 WHERE OrderId IS NULL;
    ALTER TABLE PaymentSessions ALTER COLUMN OrderId int NOT NULL;
END
");
        }
    }
}
