use std::collections::HashMap;

use serde_json::{Value, json};

use crate::{
    dto::product_compare::ProductCompareRequest,
    error::{ApiError, ApiResult},
    repositories::product_compare_repository,
    state::AppState,
};

pub async fn compare(state: &AppState, request: ProductCompareRequest) -> ApiResult<Value> {
    let mut ids = request
        .product_ids
        .into_iter()
        .filter(|id| *id > 0)
        .collect::<Vec<_>>();
    ids.dedup();

    if ids.len() < 2 {
        return Err(ApiError::bad_request("At least 2 products are required"));
    }
    if ids.len() > 4 {
        return Err(ApiError::bad_request(
            "Product compare supports up to 4 products",
        ));
    }

    let ids_sql = ids.iter().map(i32::to_string).collect::<Vec<_>>().join(",");
    let cache_key = format!("product_compare:{ids_sql}");
    if let Some(value) = state.cache.get(&cache_key).await {
        tracing::info!(cache = "hit", endpoint = "product_compare");
        return Ok(value);
    }

    let mut client = state.db_pool.acquire().await?;
    let payload = product_compare_repository::compare_payload(&mut client, &ids_sql).await?;
    let products = payload
        .get("products")
        .cloned()
        .unwrap_or_else(|| json!([]));
    let spec_list = payload
        .get("specRows")
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default();

    let mut spec_values = HashMap::<String, HashMap<i32, Value>>::with_capacity(spec_list.len());
    let mut spec_names = spec_list
        .iter()
        .filter_map(|item| {
            let product_id = item.get("productId").and_then(Value::as_i64)? as i32;
            let spec_name = item.get("specName").and_then(Value::as_str)?.to_string();
            spec_values.entry(spec_name.clone()).or_default().insert(
                product_id,
                item.get("value").cloned().unwrap_or_else(|| json!(null)),
            );
            Some(spec_name)
        })
        .collect::<Vec<_>>();
    spec_names.sort();
    spec_names.dedup();

    let rows = spec_names
        .into_iter()
        .map(|name| {
            let values = ids
                .iter()
                .map(|id| {
                    spec_values
                        .get(&name)
                        .and_then(|values| values.get(id))
                        .cloned()
                        .unwrap_or_else(|| json!(null))
                })
                .collect::<Vec<_>>();
            json!({ "label": name, "values": values })
        })
        .collect::<Vec<_>>();

    let value = json!({
        "productIds": ids,
        "products": products,
        "specRows": rows
    });
    state.cache.set(cache_key, &value).await;
    Ok(value)
}
