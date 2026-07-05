use std::{
    ops::{Deref, DerefMut},
    sync::{
        Arc,
        atomic::{AtomicUsize, Ordering},
    },
    time::Instant,
};

use tiberius::{Client, Config};
use tokio::net::TcpStream;
use tokio::sync::{Mutex, mpsc};
use tokio_util::compat::{Compat, TokioAsyncWriteCompatExt};

use crate::error::ApiResult;

pub type DbClient = Client<Compat<TcpStream>>;

#[derive(Clone)]
pub struct DbPool {
    config: Config,
    sender: mpsc::Sender<DbClient>,
    receiver: Arc<Mutex<mpsc::Receiver<DbClient>>>,
    max_size: usize,
    total_connections: Arc<AtomicUsize>,
}

pub struct PooledClient {
    client: Option<DbClient>,
    sender: mpsc::Sender<DbClient>,
    total_connections: Arc<AtomicUsize>,
}

impl DbPool {
    pub async fn new(config: Config, max_size: usize) -> Self {
        let (sender, receiver) = mpsc::channel(max_size);
        Self {
            config,
            sender,
            receiver: Arc::new(Mutex::new(receiver)),
            max_size,
            total_connections: Arc::new(AtomicUsize::new(0)),
        }
    }

    pub async fn acquire(&self) -> ApiResult<PooledClient> {
        if let Ok(client) = self.receiver.lock().await.try_recv() {
            tracing::info!("db_pool=reuse");
            return Ok(PooledClient {
                client: Some(client),
                sender: self.sender.clone(),
                total_connections: Arc::clone(&self.total_connections),
            });
        }

        if self.try_reserve_connection_slot() {
            tracing::info!(pool_size = self.max_size, "db_pool=open");
            match connect(self.config.clone()).await {
                Ok(client) => {
                    return Ok(PooledClient {
                        client: Some(client),
                        sender: self.sender.clone(),
                        total_connections: Arc::clone(&self.total_connections),
                    });
                }
                Err(err) => {
                    self.total_connections.fetch_sub(1, Ordering::AcqRel);
                    return Err(err);
                }
            }
        }

        tracing::info!(pool_size = self.max_size, "db_pool=wait");
        let client = self.receiver.lock().await.recv().await;
        match client {
            Some(client) => Ok(PooledClient {
                client: Some(client),
                sender: self.sender.clone(),
                total_connections: Arc::clone(&self.total_connections),
            }),
            None => {
                self.total_connections.store(0, Ordering::Release);
                Ok(PooledClient {
                    client: Some(connect(self.config.clone()).await?),
                    sender: self.sender.clone(),
                    total_connections: Arc::clone(&self.total_connections),
                })
            }
        }
    }

    fn try_reserve_connection_slot(&self) -> bool {
        let mut current = self.total_connections.load(Ordering::Acquire);
        loop {
            if current >= self.max_size {
                return false;
            }

            match self.total_connections.compare_exchange(
                current,
                current + 1,
                Ordering::AcqRel,
                Ordering::Acquire,
            ) {
                Ok(_) => return true,
                Err(actual) => current = actual,
            }
        }
    }
}

impl Deref for PooledClient {
    type Target = DbClient;

    fn deref(&self) -> &Self::Target {
        self.client.as_ref().expect("pooled client missing")
    }
}

impl DerefMut for PooledClient {
    fn deref_mut(&mut self) -> &mut Self::Target {
        self.client.as_mut().expect("pooled client missing")
    }
}

impl Drop for PooledClient {
    fn drop(&mut self) {
        let Some(client) = self.client.take() else {
            return;
        };

        if self.sender.try_send(client).is_err() {
            self.total_connections.fetch_sub(1, Ordering::AcqRel);
        }
    }
}

pub async fn connect(config: Config) -> ApiResult<DbClient> {
    let started = Instant::now();
    let addr = config.get_addr();
    let tcp = TcpStream::connect(addr).await?;
    tcp.set_nodelay(true)?;
    let client = Client::connect(config, tcp.compat_write()).await?;
    tracing::info!(db_connect_ms = started.elapsed().as_millis() as u64);
    Ok(client)
}
