using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BaseCore.Repository.Migrations
{
    /// <summary>
    /// Chuẩn hoá dữ liệu spec (Phương án A):
    /// - "Bộ nhớ trong" (code ROM) -> trục biến thể, code chuẩn 'internalStorage'.
    /// - RAM -> code thường 'ram'.
    /// - Bỏ định nghĩa màu trùng (code 'mau-sac'), giữ 'color'.
    /// - Đảm bảo mọi RAM/Bộ nhớ/Màu là IsVariantAxis + tên tiếng Việt chuẩn.
    /// - Dọn toàn bộ ProductSpecValues của trục biến thể (lưu ở Variant, không ở cấp sản phẩm).
    /// Không đổi schema. Down() không khôi phục dữ liệu đã xoá.
    /// </summary>
    public partial class NormalizeSpecVariantAxisData : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
-- 1) Bộ nhớ trong (ROM) -> trục biến thể, chuẩn hoá code + tên
UPDATE [SpecDefinitions] SET [Code] = 'internalStorage', [Name] = N'Bộ nhớ trong', [IsVariantAxis] = 1 WHERE [Code] = 'ROM';

-- 2) RAM -> code thường + tên chuẩn
UPDATE [SpecDefinitions] SET [Code] = 'ram', [Name] = N'Dung lượng RAM', [IsVariantAxis] = 1 WHERE [Code] = 'RAM';

-- 3) Bỏ định nghĩa màu trùng (code 'mau-sac'), giữ 'color'
DELETE FROM [ProductSpecValues] WHERE [SpecDefinitionId] IN (SELECT [Id] FROM [SpecDefinitions] WHERE [Code] = 'mau-sac');
DELETE FROM [SpecOptions]       WHERE [SpecDefinitionId] IN (SELECT [Id] FROM [SpecDefinitions] WHERE [Code] = 'mau-sac');
DELETE FROM [SpecDefinitions]   WHERE [Code] = 'mau-sac';

-- 4) Chuẩn hoá cờ trục biến thể + tên màu
UPDATE [SpecDefinitions] SET [IsVariantAxis] = 1 WHERE [Code] IN ('ram','internalStorage','hardDrive','color');
UPDATE [SpecDefinitions] SET [Name] = N'Màu sắc' WHERE [Code] = 'color';

-- 5) Dọn ProductSpecValues của trục biến thể (RAM/Bộ nhớ/Màu chỉ lưu ở Variant)
DELETE psv FROM [ProductSpecValues] psv
JOIN [SpecDefinitions] sd ON psv.[SpecDefinitionId] = sd.[Id]
WHERE sd.[IsVariantAxis] = 1;
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Chuẩn hoá dữ liệu — không khôi phục.
        }
    }
}
