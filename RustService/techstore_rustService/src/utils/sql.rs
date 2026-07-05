use serde_json::{Value, json};
use std::time::Instant;

use crate::{db::DbClient, error::ApiResult};

pub fn str_lit(value: &str) -> String {
    format!("N'{}'", value.trim().replace('\'', "''"))
}

pub async fn json_value(client: &mut DbClient, sql: &str, fallback: Value) -> ApiResult<Value> {
    let started = Instant::now();
    let rows = client.simple_query(sql).await?.into_first_result().await?;
    let mut raw = String::new();

    for row in rows {
        if let Some(chunk) = row.get::<&str, _>(0) {
            raw.push_str(chunk);
        }
    }

    if raw.trim().is_empty() {
        tracing::info!(sql_query_ms = started.elapsed().as_millis() as u64);
        return Ok(fallback);
    }

    let value = serde_json::from_str(&raw)?;
    tracing::info!(sql_query_ms = started.elapsed().as_millis() as u64);
    Ok(value)
}

pub async fn json_array(client: &mut DbClient, sql: &str) -> ApiResult<Value> {
    json_value(client, sql, json!([])).await
}
