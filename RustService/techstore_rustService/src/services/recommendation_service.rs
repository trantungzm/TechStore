use serde_json::Value;

use crate::{
    dto::recommendation::{RecommendationQuery, SearchSuggestionQuery},
    error::{ApiError, ApiResult},
    repositories::recommendation_repository,
    state::AppState,
};

pub async fn cross_sell(state: &AppState, query: RecommendationQuery) -> ApiResult<Value> {
    if query.product_id <= 0 {
        return Err(ApiError::bad_request("Product id is required"));
    }

    let max_items = query.max_items.unwrap_or(6).clamp(1, 24);
    let cache_key = format!("cross_sell:{}:{}", query.product_id, max_items);
    if let Some(value) = state.cache.get(&cache_key).await {
        tracing::info!(cache = "hit", endpoint = "cross_sell");
        return Ok(value);
    }

    let mut client = state.db_pool.acquire().await?;
    let value =
        recommendation_repository::cross_sell(&mut client, query.product_id, max_items).await?;
    state.cache.set(cache_key, &value).await;
    Ok(value)
}

pub async fn auto_cross_sell(state: &AppState, query: RecommendationQuery) -> ApiResult<Value> {
    if query.product_id <= 0 {
        return Err(ApiError::bad_request("Product id is required"));
    }

    let max_items = query.max_items.unwrap_or(6).clamp(1, 24);
    let cache_key = format!("auto_cross_sell:{}:{}", query.product_id, max_items);
    if let Some(value) = state.cache.get(&cache_key).await {
        tracing::info!(cache = "hit", endpoint = "auto_cross_sell");
        return Ok(value);
    }

    let mut client = state.db_pool.acquire().await?;
    let value =
        recommendation_repository::auto_cross_sell(&mut client, query.product_id, max_items)
            .await?;
    state.cache.set(cache_key, &value).await;
    Ok(value)
}

pub async fn search_suggestions(
    state: &AppState,
    query: SearchSuggestionQuery,
) -> ApiResult<Value> {
    let max_items = query.max_items.unwrap_or(8).clamp(1, 12);
    let keyword = query.q.as_deref().map(str::trim).unwrap_or("");
    let catalog_key = "search_suggestions_catalog";
    let catalog = if let Some(value) = state.cache.get(catalog_key).await {
        tracing::info!(cache = "hit", endpoint = "search_suggestions_catalog");
        value
    } else {
        let mut client = state.db_pool.acquire().await?;
        let value = recommendation_repository::search_suggestions(&mut client, None, 500).await?;
        state.cache.set(catalog_key.to_string(), &value).await;
        value
    };

    Ok(filter_search_catalog(&catalog, keyword, max_items as usize))
}

fn filter_search_catalog(catalog: &Value, keyword: &str, max_items: usize) -> Value {
    let Some(items) = catalog.as_array() else {
        return Value::Array(Vec::new());
    };

    let normalized_keyword = keyword.to_lowercase();
    let results = items
        .iter()
        .filter(|item| {
            normalized_keyword.is_empty()
                || ["name", "description", "brand", "categoryName"]
                    .iter()
                    .filter_map(|field| item.get(*field).and_then(Value::as_str))
                    .any(|text| text.to_lowercase().contains(&normalized_keyword))
        })
        .take(max_items)
        .cloned()
        .collect::<Vec<_>>();

    Value::Array(results)
}
