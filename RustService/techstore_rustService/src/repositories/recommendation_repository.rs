use serde_json::Value;

use crate::{db::DbClient, error::ApiResult, utils::sql};

fn product_card_select_sql() -> &'static str {
    r#"
    p.Id AS id,
    p.Name AS name,
    p.Slug AS slug,
    CAST(NULL AS nvarchar(80)) AS sku,
    CAST(COALESCE(p.BasePrice, p.MinPrice, 0) AS float) AS price,
    CAST(p.OriginalPrice AS float) AS originalPrice,
    CASE
        WHEN COALESCE(stockAgg.activeVariantCount, 0) > 0
        THEN COALESCE(stockAgg.variantStock, 0)
        ELSE COALESCE(p.TotalStock, 0)
    END AS stock,
    p.ImageUrl AS imageUrl,
    p.Description AS description,
    p.Brand AS brand,
    p.SupplierId AS supplierId,
    CAST(NULL AS nvarchar(160)) AS supplierName,
    p.BackupSupplierId AS backupSupplierId,
    CAST(NULL AS nvarchar(160)) AS backupSupplierName,
    p.SupplyType AS supplyType,
    p.WarrantyProvider AS warrantyProvider,
    p.CategoryId AS categoryId,
    c.Name AS categoryName,
    CAST(0 AS float) AS ratingAverage,
    CAST(0 AS int) AS ratingCount,
    p.IsActive AS isActive,
    p.IsFeatured AS isFeatured,
    p.IsBestSeller AS isBestSeller,
    p.IsNewArrival AS isNewArrival,
    p.IsDiscounted AS isDiscounted,
    p.RequiresSerialTracking AS requiresSerialTracking,
    p.WarrantyMonths AS warrantyMonths,
    p.CreatedAt AS createdAt,
    p.UpdatedAt AS updatedAt,
    JSON_QUERY('[]') AS variants,
    JSON_QUERY('[]') AS specs
"#
}

fn product_json_sql() -> String {
    format!(
        r#"
        SELECT
{select_sql}
        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER, INCLUDE_NULL_VALUES
"#,
        select_sql = product_card_select_sql()
    )
}

pub async fn cross_sell(
    client: &mut DbClient,
    product_id: i32,
    max_items: i32,
) -> ApiResult<Value> {
    sql::json_array(
        client,
        &format!(
            r#"
SELECT TOP ({max_items})
    r.Id AS id,
    r.ProductId AS productId,
    r.RecommendedProductId AS recommendedProductId,
    r.Type AS type,
    r.SortOrder AS sortOrder,
    JSON_QUERY((
{product_json}
    )) AS product
FROM ProductRecommendations r
JOIN Products p ON p.Id = r.RecommendedProductId
LEFT JOIN Categories c ON c.Id = p.CategoryId
OUTER APPLY (
    SELECT
        COUNT(1) AS activeVariantCount,
        COALESCE(SUM(v.Stock), 0) AS variantStock
    FROM ProductVariants v
    WHERE v.ProductId = p.Id AND v.IsActive = 1
) stockAgg
WHERE r.ProductId = {product_id} AND r.Type = N'CrossSell'
ORDER BY r.SortOrder
FOR JSON PATH, INCLUDE_NULL_VALUES
"#,
            product_json = product_json_sql()
        ),
    )
    .await
}

pub async fn auto_cross_sell(
    client: &mut DbClient,
    product_id: i32,
    max_items: i32,
) -> ApiResult<Value> {
    let configured = cross_sell(client, product_id, max_items).await?;
    if configured.as_array().is_some_and(|items| !items.is_empty()) {
        return Ok(configured);
    }

    let product_exists = sql::json_value(
        client,
        &format!(
            r#"
SELECT TOP 1 Id AS id
FROM Products
WHERE Id = {product_id}
FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
"#
        ),
        serde_json::json!({}),
    )
    .await?;
    if product_exists
        .get("id")
        .and_then(Value::as_i64)
        .unwrap_or(0)
        <= 0
    {
        return Err(crate::error::ApiError::not_found("Product not found"));
    }

    sql::json_array(
        client,
        &format!(
            r#"
WITH target AS (
    SELECT TOP 1 Id, CategoryId
    FROM Products
    WHERE Id = {product_id}
),
suggestions AS (
    SELECT TOP ({max_items})
        p.Id,
        ROW_NUMBER() OVER (ORDER BY p.IsFeatured DESC, p.IsBestSeller DESC, p.Id DESC) AS sortOrder
    FROM Products p
    CROSS JOIN target
    WHERE p.Id <> target.Id
      AND p.CategoryId = target.CategoryId
      AND p.IsActive = 1
      AND COALESCE(p.TotalStock, 0) > 0
    ORDER BY p.IsFeatured DESC, p.IsBestSeller DESC, p.Id DESC
)
SELECT
    CAST(0 AS int) AS id,
    CAST({product_id} AS int) AS productId,
    p.Id AS recommendedProductId,
    N'CrossSell' AS type,
    CAST(0 AS int) AS sortOrder,
    JSON_QUERY((
{product_json}
    )) AS product
FROM suggestions s
JOIN Products p ON p.Id = s.Id
LEFT JOIN Categories c ON c.Id = p.CategoryId
OUTER APPLY (
    SELECT
        COUNT(1) AS activeVariantCount,
        COALESCE(SUM(v.Stock), 0) AS variantStock
    FROM ProductVariants v
    WHERE v.ProductId = p.Id AND v.IsActive = 1
) stockAgg
ORDER BY p.IsFeatured DESC, p.IsBestSeller DESC, p.Id DESC
FOR JSON PATH, INCLUDE_NULL_VALUES
"#,
            product_json = product_json_sql()
        ),
    )
    .await
}

pub async fn search_suggestions(
    client: &mut DbClient,
    keyword: Option<&str>,
    max_items: i32,
) -> ApiResult<Value> {
    let keyword = keyword.map(str::trim).filter(|value| !value.is_empty());
    let where_sql = if let Some(value) = keyword {
        let pattern = sql::str_lit(&format!("%{value}%"));
        format!(
            "p.IsActive = 1 AND (p.Name LIKE {pattern} OR p.Description LIKE {pattern} OR p.Brand LIKE {pattern} OR c.Name LIKE {pattern})"
        )
    } else {
        "p.IsActive = 1".to_string()
    };
    let order_sql = if keyword.is_some() {
        "p.Id DESC"
    } else {
        "p.IsBestSeller DESC, p.IsFeatured DESC, p.IsNewArrival DESC, p.Id DESC"
    };

    sql::json_array(
        client,
        &format!(
            r#"
SELECT TOP ({max_items})
{select_sql}
FROM Products p
LEFT JOIN Categories c ON c.Id = p.CategoryId
OUTER APPLY (
    SELECT
        COUNT(1) AS activeVariantCount,
        COALESCE(SUM(v.Stock), 0) AS variantStock
    FROM ProductVariants v
    WHERE v.ProductId = p.Id AND v.IsActive = 1
) stockAgg
WHERE {where_sql}
ORDER BY {order_sql}
FOR JSON PATH, INCLUDE_NULL_VALUES
"#,
            select_sql = product_card_select_sql()
        ),
    )
    .await
}
