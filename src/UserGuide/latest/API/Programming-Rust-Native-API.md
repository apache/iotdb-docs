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

Apache IoTDB provides an official Rust client SDK: [apache/iotdb-client-rust](https://github.com/apache/iotdb-client-rust). It speaks the Thrift RPC protocol (default port 6667) and supports both IoTDB data models:

- **Tree model** — `Session` / `SessionPool`: device/timeseries paths (`root.sg.d1.s1`), covered in this document
- **Table model** — `TableSession` / `TableSessionPool`: relational SQL dialect

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
use iotdb_client::{Result, Session, SessionConfig, TSDataType, Tablet, Value};

fn main() -> Result<()> {
    let config = SessionConfig::default().with_node_urls(&["127.0.0.1:6667"])?;
    let mut session = Session::new(config);
    session.open()?;

    session.execute_non_query("CREATE DATABASE root.demo")?;
    session.execute_non_query(
        "CREATE TIMESERIES root.demo.d1.temperature WITH DATATYPE=DOUBLE, ENCODING=PLAIN",
    )?;

    // Batch write via a column-major tablet (nulls allowed).
    let mut tablet = Tablet::new(
        "root.demo.d1",
        vec!["temperature".into()],
        vec![TSDataType::Double],
    )?;
    tablet.add_row(1_720_000_000_000, vec![Some(Value::Double(21.5))])?;
    tablet.add_row(1_720_000_001_000, vec![None])?; // null cell
    session.insert_tablet(&tablet)?;

    // Or write a single row via insertRecord (aligned variants and
    // multi-row insert_records / insert_records_of_one_device also exist).
    session.insert_record(
        "root.demo.d1",
        1_720_000_002_000,
        vec!["temperature".into()],
        &[Value::Double(22.0)],
        false, // is_aligned
    )?;

    // Query with row iteration; the dataset borrows the session until dropped.
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

## 4. Session pool

`SessionPool` is a thread-safe pool for concurrent workloads. `acquire()` returns an RAII guard that releases the session back to the pool on drop:

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

## 5. TLS & RPC compression

**RPC compression** (the Thrift compact protocol) must match the server setting `dn_rpc_thrift_compression_enable` (default `false`):

```rust
let config = SessionConfig { enable_rpc_compression: true, ..Default::default() };
```

**TLS** is behind the `tls` cargo feature:

```toml
iotdb-client-rust = { version = "0.1", features = ["tls"] }
```

```rust
let config = SessionConfig {
    use_ssl: true,
    ca_cert_path: Some("ca.pem".into()),  // trust a private CA / self-signed cert
    accept_invalid_certs: false,          // true skips verification (tests only!)
    domain_override: None,                // SNI/validation hostname when connecting by IP
    ..Default::default()
};
```

## 6. Examples

Full runnable examples live in the repository's [`examples/`](https://github.com/apache/iotdb-client-rust/tree/main/examples) directory:

```sh
cargo run --example tree_session
cargo run --example table_session
cargo run --example session_pool
```
