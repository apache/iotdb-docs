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

# Rust Native API

Apache IoTDB provides an official Rust client SDK: [apache/iotdb-client-rust](https://github.com/apache/iotdb-client-rust). It speaks the Thrift RPC protocol (default port 6667). This document covers the **table model** (`TableSession` / `TableSessionPool`, relational SQL dialect); the tree model is documented separately.

## 1. Requirements

- Rust 1.75+
- Apache IoTDB 2.x — see [COMPATIBILITY.md](https://github.com/apache/iotdb-client-rust/blob/main/COMPATIBILITY.md) for the full server version matrix

## 2. Installation

Once published to crates.io:

```toml
[dependencies]
iotdb-client-rust = "0.1"
```

Until then, use a git dependency:

```toml
[dependencies]
iotdb-client = { git = "https://github.com/apache/iotdb-client-rust" }
```

The import name is `iotdb_client` in both cases.

## 3. Quick start

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

    // Column-major tablet write. columnCategories must NOT include TIME —
    // the time column is implicit.
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

    // Query with row iteration; the dataset borrows the session until dropped.
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

## 4. Session pool

`TableSessionPool` is the thread-safe pool variant for concurrent workloads; `acquire()` returns an RAII guard that releases the session back to the pool on drop. See the runnable [`session_pool` example](https://github.com/apache/iotdb-client-rust/blob/main/examples/session_pool.rs).

## 5. TLS & RPC compression

**RPC compression** (the Thrift compact protocol) must match the server setting `dn_rpc_thrift_compression_enable` (default `false`):

```rust
let mut session = TableSession::builder()
    .node_urls(&["127.0.0.1:6667"])?
    .enable_rpc_compression(true)
    .build()?;
```

**TLS** is behind the `tls` cargo feature:

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

## 6. Examples

Full runnable examples live in the repository's [`examples/`](https://github.com/apache/iotdb-client-rust/tree/main/examples) directory:

```sh
cargo run --example table_session
cargo run --example session_pool
```
