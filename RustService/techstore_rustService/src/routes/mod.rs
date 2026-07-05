use axum::Router;
use tower_http::{cors::CorsLayer, trace::TraceLayer};

use crate::state::AppState;

pub mod product_compare_routes;
pub mod recommendation_routes;

pub fn app_router(state: AppState) -> Router {
    let api_router = Router::new()
        .merge(product_compare_routes::routes())
        .merge(recommendation_routes::routes());

    Router::new()
        .nest("/api/rust", api_router)
        .with_state(state)
        .layer(CorsLayer::permissive())
        .layer(TraceLayer::new_for_http())
}
