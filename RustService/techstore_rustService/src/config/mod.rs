use std::env;

use tiberius::{Config, EncryptionLevel};

use crate::error::{ApiError, ApiResult};

#[derive(Clone)]
pub struct AppConfig {
    pub bind_addr: String,
    pub database_url: String,
    pub db_pool_size: usize,
}

impl AppConfig {
    pub fn from_env() -> Self {
        let bind_addr =
            env::var("TECHSTORE_RUST_BIND").unwrap_or_else(|_| "0.0.0.0:7001".to_string());

        let database_url = env::var("TECHSTORE_RUST_DATABASE_URL").unwrap_or_else(|_| {
            "Server=LUONG-CONG;Database=techstore;Integrated Security=true;Encrypt=false;TrustServerCertificate=true"
                .to_string()
        });
        let db_pool_size = env::var("TECHSTORE_RUST_DB_POOL_SIZE")
            .ok()
            .and_then(|value| value.parse::<usize>().ok())
            .unwrap_or(4)
            .clamp(1, 64);

        Self {
            bind_addr,
            database_url,
            db_pool_size,
        }
    }

    pub fn db_config(&self) -> ApiResult<Config> {
        let normalized = normalize_ado_connection_string(&self.database_url);
        let mut config = Config::from_ado_string(&normalized).map_err(|err| {
            ApiError::config(format!("Invalid SQL Server connection string: {err}"))
        })?;
        if has_flag(&normalized, "encrypt", "false") {
            config.encryption(EncryptionLevel::NotSupported);
        }
        if has_flag(&normalized, "trustservercertificate", "true") {
            config.trust_cert();
        }
        config.application_name("TechStoreRustService");
        Ok(config)
    }
}

fn normalize_ado_connection_string(raw: &str) -> String {
    raw.split(';')
        .filter(|part| !part.trim().is_empty())
        .map(|part| {
            let trimmed = part.trim();
            let Some((key, value)) = trimmed.split_once('=') else {
                return trimmed.to_string();
            };

            let normalized_key = key.trim().to_ascii_lowercase().replace(' ', "");
            if normalized_key == "trusted_connection" {
                format!("Integrated Security={}", value.trim())
            } else {
                format!("{}={}", key.trim(), value.trim())
            }
        })
        .collect::<Vec<_>>()
        .join(";")
}

fn has_flag(raw: &str, expected_key: &str, expected_value: &str) -> bool {
    raw.split(';').any(|part| {
        let Some((key, value)) = part.trim().split_once('=') else {
            return false;
        };
        key.trim().to_ascii_lowercase().replace(' ', "") == expected_key
            && value.trim().eq_ignore_ascii_case(expected_value)
    })
}
