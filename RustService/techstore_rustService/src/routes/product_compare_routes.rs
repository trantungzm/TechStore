use axum::{Json, Router, extract::State, routing::post};

use crate::{
    dto::product_compare::ProductCompareRequest, error::ApiResult,
    services::product_compare_service, state::AppState,
};

pub fn routes() -> Router<AppState> {
    Router::new().route("/product-compare", post(compare))
}

async fn compare(
    State(state): State<AppState>,
    Json(request): Json<ProductCompareRequest>,
) -> ApiResult<Json<serde_json::Value>> {
    Ok(Json(
        product_compare_service::compare(&state, request).await?,
    ))
}
