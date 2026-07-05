use axum::{
    Json, Router,
    extract::{Query, State},
    routing::get,
};

use crate::{
    dto::recommendation::{RecommendationQuery, SearchSuggestionQuery},
    error::ApiResult,
    services::recommendation_service,
    state::AppState,
};

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/recommendations/cross-sell", get(cross_sell))
        .route("/recommendations/auto-cross-sell", get(auto_cross_sell))
        .route("/recommendations", get(recommendations))
        .route("/search-suggestions", get(search_suggestions))
}

async fn cross_sell(
    State(state): State<AppState>,
    Query(query): Query<RecommendationQuery>,
) -> ApiResult<Json<serde_json::Value>> {
    Ok(Json(
        recommendation_service::cross_sell(&state, query).await?,
    ))
}

async fn auto_cross_sell(
    State(state): State<AppState>,
    Query(query): Query<RecommendationQuery>,
) -> ApiResult<Json<serde_json::Value>> {
    Ok(Json(
        recommendation_service::auto_cross_sell(&state, query).await?,
    ))
}

async fn recommendations(
    State(state): State<AppState>,
    Query(query): Query<RecommendationQuery>,
) -> ApiResult<Json<serde_json::Value>> {
    Ok(Json(
        recommendation_service::auto_cross_sell(&state, query).await?,
    ))
}

async fn search_suggestions(
    State(state): State<AppState>,
    Query(query): Query<SearchSuggestionQuery>,
) -> ApiResult<Json<serde_json::Value>> {
    Ok(Json(
        recommendation_service::search_suggestions(&state, query).await?,
    ))
}
