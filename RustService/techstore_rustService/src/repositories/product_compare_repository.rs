use serde_json::Value;

use crate::{db::DbClient, error::ApiResult, utils::sql};

pub async fn compare_payload(client: &mut DbClient, ids_sql: &str) -> ApiResult<Value> {
    sql::json_value(
        client,
        &format!(
            r#"
SELECT
    JSON_QUERY((
        SELECT
            p.Id AS id,
            p.Name AS name,
            p.Slug AS slug,
            p.ImageUrl AS imageUrl,
            p.Description AS description,
            p.Brand AS brand,
            p.CategoryId AS categoryId,
            c.Name AS categoryName,
            CAST(COALESCE(p.BasePrice, p.MinPrice, 0) AS float) AS price,
            CAST(p.OriginalPrice AS float) AS originalPrice,
            CASE
                WHEN COALESCE(stockAgg.activeVariantCount, 0) > 0
                THEN COALESCE(stockAgg.variantStock, 0)
                ELSE COALESCE(p.TotalStock, 0)
            END AS stock,
            p.IsFeatured AS isFeatured,
            p.IsBestSeller AS isBestSeller,
            p.IsNewArrival AS isNewArrival,
            p.IsDiscounted AS isDiscounted
        FROM Products p
        LEFT JOIN Categories c ON c.Id = p.CategoryId
        OUTER APPLY (
            SELECT
                COUNT(1) AS activeVariantCount,
                COALESCE(SUM(v.Stock), 0) AS variantStock
            FROM ProductVariants v
            WHERE v.ProductId = p.Id AND v.IsActive = 1
        ) stockAgg
        WHERE p.Id IN ({ids_sql}) AND p.IsActive = 1
        ORDER BY CHARINDEX(',' + CAST(p.Id AS varchar(20)) + ',', ',{ids_sql},')
        FOR JSON PATH, INCLUDE_NULL_VALUES
    )) AS products,
    JSON_QUERY((
        SELECT
            psv.ProductId AS productId,
            sd.Name AS specName,
            COALESCE(
                so.Value,
                psv.ValueText,
                CAST(psv.ValueNumber AS nvarchar(80)),
                CASE
                    WHEN psv.ValueBool = 1 THEN N'true'
                    WHEN psv.ValueBool = 0 THEN N'false'
                    ELSE NULL
                END
            ) AS value
        FROM ProductSpecValues psv
        JOIN SpecDefinitions sd ON sd.Id = psv.SpecDefinitionId
        LEFT JOIN SpecOptions so ON so.Id = psv.SpecOptionId
        WHERE psv.ProductId IN ({ids_sql})
        ORDER BY sd.SortOrder, sd.Name
        FOR JSON PATH, INCLUDE_NULL_VALUES
    )) AS specRows
FOR JSON PATH, WITHOUT_ARRAY_WRAPPER, INCLUDE_NULL_VALUES
"#
        ),
        serde_json::json!({ "products": [], "specRows": [] }),
    )
    .await
}
