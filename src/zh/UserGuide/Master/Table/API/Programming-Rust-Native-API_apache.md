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

Apache IoTDB 提供官方 Rust 客户端 SDK：[apache/iotdb-client-rust](https://github.com/apache/iotdb-client-rust)，基于 Thrift RPC 协议（默认端口 6667）。本文档介绍**表模型**（`TableSession` / `TableSessionPool`，关系型 SQL 方言）；树模型另有单独文档。

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
use iotdb_client::{ColumnCategory, Result, TSDataType, TableSession, Tablet, Value};

fn main() -> Result<()> {
    let mut session = TableSession::builder()
        .node_urls(&["127.0.0.1:6667"])?
        .username("root")
        .password("root")
        .build()?;

    session.execute_non_query("CREATE DATABASE IF NOT EXISTS demo")?;
    session.execute_non_query("USE demo")?;
    session.execute_non_query(
        "CREATE TABLE IF NOT EXISTS sensors (device_id STRING TAG, temperature DOUBLE FIELD)",
    )?;

    // 列式 tablet 写入。columnCategories 不包含 TIME —— 时间列是隐式的。
    let mut tablet = Tablet::new_table(
        "sensors",
        vec!["device_id".into(), "temperature".into()],
        vec![TSDataType::String, TSDataType::Double],
        vec![ColumnCategory::Tag, ColumnCategory::Field],
    )?;
    tablet.add_row(
        1_720_000_000_000,
        vec![
            Some(Value::String("dev-1".into())),
            Some(Value::Double(21.5)),
        ],
    )?;
    session.insert(&tablet)?;

    // 逐行迭代查询结果；dataset 在 drop 前借用 session。
    {
        let mut dataset =
            session.execute_query("SELECT time, device_id, temperature FROM sensors")?;
        while let Some(row) = dataset.next_row()? {
            println!("{:?}", row.values);
        }
    }

    session.execute_non_query("DROP DATABASE demo")?;
    session.close()
}
```

## 4. 会话池

`TableSessionPool` 是面向并发场景的线程安全会话池；`acquire()` 返回 RAII guard，drop 时自动将会话归还池中。可参考可运行示例 [`session_pool`](https://github.com/apache/iotdb-client-rust/blob/main/examples/session_pool.rs)。

## 5. TLS 与 RPC 压缩

**RPC 压缩**（即 Thrift compact 协议）必须与服务端配置 `dn_rpc_thrift_compression_enable`（默认 `false`）保持一致：

```rust
let mut session = TableSession::builder()
    .node_urls(&["127.0.0.1:6667"])?
    .enable_rpc_compression(true)
    .build()?;
```

**TLS** 通过 `tls` cargo feature 启用：

```toml
iotdb-client-rust = { version = "0.1", features = ["tls"] }
```

```rust
let mut session = TableSession::builder()
    .node_urls(&["127.0.0.1:6667"])?
    .use_ssl(true)
    .ca_cert_path("ca.pem")
    .build()?;
```

## 6. 示例

完整可运行示例见仓库 [`examples/`](https://github.com/apache/iotdb-client-rust/tree/main/examples) 目录：

```sh
cargo run --example table_session
cargo run --example session_pool
```
