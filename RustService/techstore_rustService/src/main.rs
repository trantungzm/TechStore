mod config;
mod db;
mod dto;
mod error;
mod repositories;
mod routes;
mod services;
mod state;
mod utils;

use std::time::{Duration, Instant};

#[tokio::main]
async fn main() -> error::ApiResult<()> {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "TechStoreRustService=info,tower_http=info".into()),
        )
        .init();

    let config = config::AppConfig::from_env();
    let bind_addr = config.bind_addr.clone();
    let db_pool = db::DbPool::new(config.db_config()?, config.db_pool_size).await;
    let state = state::AppState {
        db_pool,
        cache: state::ResponseCache::new(Duration::from_secs(300)),
    };
    let warm_started = Instant::now();
    if let Err(err) = warm_runtime_cache(state.clone()).await {
        tracing::warn!("Runtime warm-up skipped: {err}");
    } else {
        tracing::info!(runtime_warmup_ms = warm_started.elapsed().as_millis() as u64);
    }
    let app = routes::app_router(state);

    let listener = tokio::net::TcpListener::bind(&bind_addr).await?;
    tracing::info!("TechStore Rust Service listening on http://{}", bind_addr);

    axum::serve(listener, app).await?;
    Ok(())
}

async fn warm_runtime_cache(state: state::AppState) -> error::ApiResult<()> {
    let mut client = state.db_pool.acquire().await?;
    let warm_products = utils::sql::json_array(
        &mut client,
        r#"
SELECT TOP (4) Id AS id
FROM Products
WHERE IsActive = 1
ORDER BY IsBestSeller DESC, IsFeatured DESC, IsNewArrival DESC, Id DESC
FOR JSON PATH, INCLUDE_NULL_VALUES
"#,
    )
    .await?;
    drop(client);

    let product_ids = warm_products
        .as_array()
        .into_iter()
        .flatten()
        .filter_map(|item| item.get("id").and_then(serde_json::Value::as_i64))
        .map(|id| id as i32)
        .collect::<Vec<_>>();

    let _ = services::recommendation_service::search_suggestions(
        &state,
        dto::recommendation::SearchSuggestionQuery {
            q: None,
            max_items: Some(4),
        },
    )
    .await;
    if let Some(product_id) = product_ids.first().copied() {
        let _ = services::recommendation_service::auto_cross_sell(
            &state,
            dto::recommendation::RecommendationQuery {
                product_id,
                max_items: Some(4),
            },
        )
        .await;
    }

    if product_ids.len() >= 2 {
        let _ = services::product_compare_service::compare(
            &state,
            dto::product_compare::ProductCompareRequest {
                product_ids: product_ids.into_iter().take(4).collect(),
            },
        )
        .await;
    }

    Ok(())
}
