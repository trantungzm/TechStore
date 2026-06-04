using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BaseCore.Repository.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260525130000_AddColorSpecOptions")]
    public partial class AddColorSpecOptions : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
DECLARE @ColorOptions TABLE (
    CategoryId int NOT NULL,
    DisplayOrder int NOT NULL,
    Value nvarchar(250) NOT NULL
);

INSERT INTO @ColorOptions (CategoryId, DisplayOrder, Value)
VALUES
    (1, 1, N'Den'),
    (1, 2, N'Trang'),
    (1, 3, N'Xanh duong'),
    (1, 4, N'Xanh la'),
    (1, 5, N'Hong'),
    (1, 6, N'Natural Titanium'),
    (1, 7, N'Desert Titanium'),
    (2, 1, N'Bac'),
    (2, 2, N'Xam'),
    (2, 3, N'Den'),
    (2, 4, N'Midnight'),
    (2, 5, N'Starlight'),
    (2, 6, N'Space Gray'),
    (4, 1, N'Bac'),
    (4, 2, N'Xam'),
    (4, 3, N'Xanh duong'),
    (4, 4, N'Hong'),
    (4, 5, N'Graphite'),
    (5, 1, N'Den'),
    (5, 2, N'Bac'),
    (5, 3, N'Vang'),
    (5, 4, N'Graphite'),
    (5, 5, N'Midnight'),
    (5, 6, N'Starlight'),
    (6, 1, N'Den'),
    (6, 2, N'Bac'),
    (6, 3, N'Trang'),
    (6, 4, N'Graphite'),
    (7, 1, N'Trang'),
    (7, 2, N'Den'),
    (7, 3, N'Xanh duong'),
    (7, 4, N'Bac'),
    (7, 5, N'Be');

UPDATE d
SET
    [Name] = N'Mau sac',
    [DataType] = N'select',
    [InputType] = N'select',
    [IsComparable] = CAST(1 AS bit),
    [IsFilterable] = CAST(1 AS bit),
    [AllowCustomValue] = CAST(0 AS bit),
    [IsActive] = CAST(1 AS bit),
    [UpdatedAt] = SYSUTCDATETIME()
FROM [SpecDefinitions] d
WHERE d.[Code] = N'color'
  AND EXISTS (SELECT 1 FROM @ColorOptions s WHERE s.CategoryId = d.CategoryId);

INSERT INTO [SpecDefinitions] (
    [CategoryId],
    [Name],
    [Code],
    [DataType],
    [InputType],
    [Unit],
    [SortOrder],
    [IsRequired],
    [IsFilterable],
    [IsComparable],
    [AllowCustomValue],
    [IsActive],
    [CreatedAt],
    [UpdatedAt]
)
SELECT
    c.[CategoryId],
    N'Mau sac',
    N'color',
    N'select',
    N'select',
    NULL,
    COALESCE(maxSort.MaxSortOrder, 0) + 1,
    CAST(0 AS bit),
    CAST(1 AS bit),
    CAST(1 AS bit),
    CAST(0 AS bit),
    CAST(1 AS bit),
    SYSUTCDATETIME(),
    NULL
FROM (SELECT DISTINCT CategoryId FROM @ColorOptions) c
OUTER APPLY (
    SELECT MAX([SortOrder]) AS MaxSortOrder
    FROM [SpecDefinitions]
    WHERE [CategoryId] = c.[CategoryId]
) maxSort
WHERE EXISTS (SELECT 1 FROM [Categories] cat WHERE cat.[Id] = c.[CategoryId])
  AND NOT EXISTS (
      SELECT 1
      FROM [SpecDefinitions] existing
      WHERE existing.[CategoryId] = c.[CategoryId]
        AND existing.[Code] = N'color'
  );

UPDATE o
SET
    [DisplayOrder] = s.[DisplayOrder],
    [IsActive] = CAST(1 AS bit),
    [UpdatedAt] = SYSUTCDATETIME()
FROM [SpecOptions] o
INNER JOIN [SpecDefinitions] d ON d.[Id] = o.[SpecDefinitionId]
INNER JOIN @ColorOptions s ON s.[CategoryId] = d.[CategoryId] AND s.[Value] = o.[Value]
WHERE d.[Code] = N'color';

INSERT INTO [SpecOptions] (
    [SpecDefinitionId],
    [Value],
    [DisplayOrder],
    [IsActive],
    [CreatedAt],
    [UpdatedAt]
)
SELECT
    d.[Id],
    s.[Value],
    s.[DisplayOrder],
    CAST(1 AS bit),
    SYSUTCDATETIME(),
    NULL
FROM @ColorOptions s
INNER JOIN [SpecDefinitions] d ON d.[CategoryId] = s.[CategoryId] AND d.[Code] = N'color'
WHERE NOT EXISTS (
    SELECT 1
    FROM [SpecOptions] existing
    WHERE existing.[SpecDefinitionId] = d.[Id]
      AND existing.[Value] = s.[Value]
);
""");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
DELETE o
FROM [SpecOptions] o
INNER JOIN [SpecDefinitions] d ON d.[Id] = o.[SpecDefinitionId]
WHERE d.[Code] = N'color'
  AND NOT EXISTS (
      SELECT 1
      FROM [ProductSpecValues] v
      WHERE v.[SpecOptionId] = o.[Id]
  );

DELETE d
FROM [SpecDefinitions] d
WHERE d.[Code] = N'color'
  AND NOT EXISTS (
      SELECT 1
      FROM [ProductSpecValues] v
      WHERE v.[SpecDefinitionId] = d.[Id]
  )
  AND NOT EXISTS (
      SELECT 1
      FROM [SpecOptions] o
      WHERE o.[SpecDefinitionId] = d.[Id]
  );
""");
        }
    }
}
