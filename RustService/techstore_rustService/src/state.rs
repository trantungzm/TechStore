use std::{
    collections::HashMap,
    sync::Arc,
    time::{Duration, Instant},
};

use serde_json::Value;
use tokio::sync::Mutex;

use crate::db::DbPool;

#[derive(Clone)]
pub struct AppState {
    pub db_pool: DbPool,
    pub cache: ResponseCache,
}

#[derive(Clone)]
pub struct ResponseCache {
    entries: Arc<Mutex<HashMap<String, CacheEntry>>>,
    ttl: Duration,
}

struct CacheEntry {
    expires_at: Instant,
    value: Value,
}

impl ResponseCache {
    pub fn new(ttl: Duration) -> Self {
        Self {
            entries: Arc::new(Mutex::new(HashMap::new())),
            ttl,
        }
    }

    pub async fn get(&self, key: &str) -> Option<Value> {
        let mut entries = self.entries.lock().await;
        if entries
            .get(key)
            .is_some_and(|entry| Instant::now() >= entry.expires_at)
        {
            entries.remove(key);
        }

        entries.get(key).map(|entry| entry.value.clone())
    }

    pub async fn set(&self, key: String, value: &Value) {
        self.entries.lock().await.insert(
            key,
            CacheEntry {
                expires_at: Instant::now() + self.ttl,
                value: value.clone(),
            },
        );
    }
}
