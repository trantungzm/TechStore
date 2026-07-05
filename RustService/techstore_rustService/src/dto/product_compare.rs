use serde::Deserialize;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProductCompareRequest {
    pub product_ids: Vec<i32>,
}
