use serde::Deserialize;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RecommendationQuery {
    pub product_id: i32,
    pub max_items: Option<i32>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchSuggestionQuery {
    pub q: Option<String>,
    pub max_items: Option<i32>,
}
