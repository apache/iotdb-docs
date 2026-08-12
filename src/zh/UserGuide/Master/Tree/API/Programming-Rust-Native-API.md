<!--

    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at
    
        http://www.apache.org/licenses/LICENSE-2.0
    
    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.

-->

# Rust 原生接口

Apache IoTDB 提供官方 Rust 客户端 SDK：[apache/iotdb-client-rust](https://github.com/apache/iotdb-client-rust)。它基于 Thrift RPC 协议（默认端口 6667），同时支持 IoTDB 的两种数据模型：

- **树模型** — `Session` / `SessionPool`：设备/时间序列路径（`root.sg.d1.s1`），本文档主要介绍此模型
- **表模型** — `TableSession` / `TableSessionPool`：关系型 SQL 方言

## 1. 环境要求

- Rust 1.75+
- Apache IoTDB 2.x — 完整的服务端版本兼容矩阵见 [COMPATIBILITY.md](https://github.com/apache/iotdb-client-rust/blob/main/COMPATIBILITY.md)

## 2. 安装

发布到 crates.io 后：

```toml
[dependencies]
iotdb-client-rust = "0.1"
```

在此之前，可使用 git 依赖：

```toml
[dependencies]
iotdb-client = { git = "https://github.com/apache/iotdb-client-rust" }
```

两种方式的导入名均为 `iotdb_client`。

## 3. 快速上手

```rust
use iotdb_client::{Result, Session, SessionConfig, TSDataType, Tablet, Value};

fn main() -> Result<()> {
    let config = SessionConfig::default().with_node_urls(&["127.0.0.1:6667"])?;
    let mut session = Session::new(config);
    session.open()?;

    session.execute_non_query("CREATE DATABASE root.demo")?;
    session.execute_non_query(
        "CREATE TIMESERIES root.demo.d1.temperature WITH DATATYPE=DOUBLE, ENCODING=PLAIN",
    )?;

    // 通过列式 tablet 批量写入（允许 null）。
    let mut tablet = Tablet::new(
        "root.demo.d1",
        vec!["temperature".into()],
        vec![TSDataType::Double],
    )?;
    tablet.add_row(1_720_000_000_000, vec![Some(Value::Double(21.5))])?;
    tablet.add_row(1_720_000_001_000, vec![None])?; // null 单元格
    session.insert_tablet(&tablet)?;

    // 或通过 insertRecord 写入单行（还提供 aligned 变体以及
    // 多行的 insert_records / insert_records_of_one_device）。
    session.insert_record(
        "root.demo.d1",
        1_720_000_002_000,
        vec!["temperature".into()],
        &[Value::Double(22.0)],
        false, // is_aligned
    )?;

    // 逐行迭代查询结果；dataset 在 drop 前借用 session。
    {
        let mut dataset = session.execute_query("SELECT temperature FROM root.demo.d1")?;
        while let Some(row) = dataset.next_row()? {
            println!("ts={:?} values={:?}", row.timestamp, row.values);
        }
    }

    session.execute_non_query("DELETE DATABASE root.demo")?;
    session.close()
}
```

## 4. 会话池

`SessionPool` 是线程安全的会话池，适用于并发场景。`acquire()` 返回 RAII guard，drop 时自动将会话归还池中：

```rust
use std::sync::Arc;
use iotdb_client::{Result, SessionPool, SessionPoolConfig};

fn main() -> Result<()> {
    let config = SessionPoolConfig {
        max_size: 4,
        ..SessionPoolConfig::default()
    }
    .with_node_urls(&["127.0.0.1:6667"])?;
    let pool = Arc::new(SessionPool::new(config)?);

    let handles: Vec<_> = (0..4)
        .map(|_| {
            let pool = Arc::clone(&pool);
            std::thread::spawn(move || -> Result<()> {
                let mut session = pool.acquire()?;
                session.execute_non_query("SHOW DATABASES")?;
                Ok(())
            })
        })
        .collect();
    for handle in handles {
        handle.join().expect("thread panicked")?;
    }

    pool.close();
    Ok(())
}
```

## 5. TLS 与 RPC 压缩

**RPC 压缩**（即 Thrift compact 协议）必须与服务端配置 `dn_rpc_thrift_compression_enable`（默认 `false`）保持一致：

```rust
let config = SessionConfig { enable_rpc_compression: true, ..Default::default() };
```

**TLS** 通过 `tls` cargo feature 启用：

```toml
iotdb-client-rust = { version = "0.1", features = ["tls"] }
```

```rust
let config = SessionConfig {
    use_ssl: true,
    ca_cert_path: Some("ca.pem".into()),  // 信任私有 CA / 自签名证书
    accept_invalid_certs: false,          // true 跳过证书校验（仅限测试！）
    domain_override: None,                // 按 IP 连接时指定 SNI/校验主机名
    ..Default::default()
};
```

## 6. 示例

完整可运行示例见仓库 [`examples/`](https://github.com/apache/iotdb-client-rust/tree/main/examples) 目录：

```sh
cargo run --example tree_session
cargo run --example table_session
cargo run --example session_pool
```
