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

# Release History

## V2.0.1-beta

> Release Date: 2025.02.18

V2.0.1-beta introduces dual model configuration for tree and table models, along with table model support for standard SQL query syntax, multiple functions and operators, stream processing, Benchmark, and more. Additional updates include: Python client support for four new data types, database deletion in read-only mode, script tools compatible with TsFile, CSV, and SQL data import/export, Kubernetes Operator integration, and other enhancements. Key updates include:

- **Table Model**: IoTDB now supports table models, including standard SQL query syntax (SELECT, WHERE, JOIN, GROUP BY, ORDER BY, LIMIT clauses, and subqueries).
- **Query Module**: Table model supports multiple functions and operators (logical operators, mathematical functions, and time-series-specific functions like DIFF).
- **Query Module**: Users can control UDF, PipePlugin, Trigger, and AINode to load JAR packages via URI through configuration items.
- **Storage Module**: Table model supports data writing via the Session interface, with automatic metadata creation.
- **Storage Module**: Python client adds support for four new data types: String, Blob, Date, and Timestamp.
- **Storage Module**: Optimized priority comparison rules for merge tasks of the same type.
- **Stream Processing**: Supports specifying authentication information at the receiver end.
- **Stream Processing**: TsFile Load now supports table models.
- **Stream Processing**: Stream processing plugins are adapted to table models.
- **System Module**: Improved stability of DataNode scaling down.
- **System Module**: Users can perform `DROP DATABASE` operations in read-only mode.
- **Scripts & Tools**: Benchmark tool adapted to table models.
- **Scripts & Tools**: Benchmark tool supports four new data types: String, Blob, Date, and Timestamp.
- **Scripts & Tools**: Extended `data/export-data` script to support new data types (String, Blob, Date, Timestamp).
- **Scripts & Tools**: `import-data/export-data` scripts now support TsFile, CSV, and SQL data import/export.
- **Ecosystem Integration**: Kubernetes Operator support.

---

## V1.3.3

> Release Date: 2024.11.20

V1.3.3 introduces String, Blob, Date, and Timestamp data types, data subscription, DataNode auto-monitoring and TsFile loading, observability metrics, sender-to-receiver file transfer automation, configuration file consolidation, client query load balancing, and stability improvements. Key updates include:

- **Storage Module**: Added String, Blob, Date, and Timestamp data types.
- **Storage Module**: Optimized memory control for merge operations.
- **Query Module**: Client query load balancing enhancements.
- **Query Module**: Added active metadata statistics queries.
- **Query Module**: Filter performance optimization for faster aggregation and WHERE queries.
- **Data Sync**: Sender supports transferring files to a specified directory, after which the receiver automatically loads them into IoTDB.
- **Data Sync**: Receiver adds automatic data type conversion.
- **Data Subscription**: Added subscription capabilities (data points or TsFile-based).
- **Data Loading**: DataNode actively monitors and loads TsFiles, with observability metrics.
- **Stream Processing**: `ALTER PIPE` supports `ALTER SOURCE`.
- **System Module**: Simplified configuration files (merged three into one).
- **System Module**: Added configuration item APIs.
- **System Module**: Improved restart recovery performance.
- **Scripts & Tools**: Metadata import/export scripts.
- **Scripts & Tools**: Kubernetes Helm support.

---

## V1.3.2

> Release Date: 2024.07.01

V1.3.2 introduces `EXPLAIN ANALYZE` for SQL query profiling, UDAF framework, metadata sync, data point counting, SQL import/export scripts, rolling upgrades, and stability improvements. Key updates include:

- **Storage Module**: Optimized `insertRecords` write performance.
- **Query Module**: Added `EXPLAIN ANALYZE` for query stage time analysis.
- **Query Module**: Added UDAF (User-Defined Aggregation Function) framework.
- **Query Module**: Added `MAX_BY`/`MIN_BY` functions to return timestamps with max/min values.
- **Query Module**: Value-filter query performance improvements.
- **Data Sync**: Wildcard support for path matching.
- **Data Sync**: Metadata synchronization (time series, attributes, permissions).
- **Stream Processing**: Added `ALTER PIPE` for hot-updating plugins.
- **System Module**: TsFile load data included in data point statistics.
- **Scripts & Tools**: Local upgrade backup tool (hard-link-based backups).
- **Scripts & Tools**: `export-data`/`import-data` scripts for CSV, TsFile, and SQL formats.
- **Scripts & Tools**: Windows support for ConfigNode/DataNode/Cli window naming.

---

## V1.3.1

> Release Date: 2024.04.22

V1.3.1 adds one-click cluster start/stop scripts, info collection scripts, built-in functions, sync/log/query optimizations, and observability improvements. Key updates include:

- Added one-click cluster start/stop scripts (`start-all/stop-all.sh` and `.bat`).
- Added instance info collection scripts (`collect-info.sh` and `.bat`).
- Added `STDDEV`, `VARIANCE` aggregation functions.
- Added TsFile repair command.
- `FILL` clause supports timeout thresholds.
- Simplified data sync time range configuration.
- Enhanced observability (cluster node divergence monitoring, task scheduling metrics).
- Optimized default logging strategy.
- Improved memory control for TsFile loading.
- REST API (v2) returns column types.
- Optimized query execution.
- Client auto-fetches available DataNode lists.

---

## V1.3.0

> Release Date: 2024.01.01

V1.3.0 adds SSL encryption, sync monitoring, permission syntax optimizations, metrics performance improvements, and query optimizations. Key updates include:

- **Security**: Time-series-level permission control.
- **Security**: SSL support for client-server communication.
- **Query Module**: Calculation views support `LAST` queries.
- **Stream Processing**: Added Pipe monitoring metrics.
- **Storage Module**: Support for negative timestamps.
- **Scripts & Tools**: `LOAD` script data included in monitoring.
- **Client**: Optimized Python client performance.
- **Query Module**: Fixed slow `SHOW PATH` responses.
- **Query Module**: Improved `EXPLAIN` result formatting.
- **System Module**: Added `MEMORY_SIZE` configuration.
- **System Module**: Renamed config items (e.g., `target_config_node_list` → `seed_config_node`).

---

## V1.2.0

> Release Date: 2023.06.30

V1.2.0 introduces stream processing, dynamic templates, `SUBSTRING`/`REPLACE`/`ROUND` functions, and optimizations. Key updates include:

- **Stream Processing**: Framework added.
- **Metadata**: Dynamic template expansion.
- **Storage**: Added SPRINTZ/RLBE encodings and LZMA2 compression.
- **Query Module**: `CAST`, `ROUND`, `SUBSTR`, `REPLACE` functions.
- **Query Module**: `TIME_DURATION`, `MODE` aggregation functions.
- **Query Module**: `CASE WHEN` and `ORDER BY` expression support.
- **Client**: Python API supports multi-node distributed connections.
- **Client**: Python write redirection.
- **Session API**: Batch time-series creation via templates.

---

## V1.1.0

> Release Date: 2023.04.03

V1.1.0 adds `GROUP BY VARIATION/CONDITION`, `DIFF`, `COUNT_IF`, and pipeline engine optimizations. Key fixes include metadata template errors and query issues. Key updates:

- **Query Module**: `ALIGN BY DEVICE` supports `ORDER BY TIME`.
- **Query Module**: `SHOW QUERIES` and `KILL QUERY` commands.
- **System Module**: `SHOW REGIONS` with database filtering.
- **System Module**: `SHOW VARIABLES` for cluster parameters.
- **Query Module**: `GROUP BY VARIATION` and `GROUP BY CONDITION`.
- **Query Module**: `DIFF` scalar function and `COUNT_IF` aggregation.
- **System Module**: `dn_rpc_port` and `dn_rpc_address` configurability.

---

## V1.0.0

> Release Date: 2022.12.03

V1.0.0 fixes partition calculation, query execution, and memory issues. Adds HA architecture, multi-replica storage, cluster management SQL, and MPP framework. Key updates:

- **System Module**: Distributed high-availability architecture.
- **System Module**: Multi-replica storage.
- **System Module**: Port conflict detection during startup.
- **System Module**: Cluster management SQL (start/stop/remove nodes).
- **System Module**: Configurable consensus protocols (Simple, IoTConsensus, Ratis).
- **Query Module**: MPP framework for distributed read/write.
- **Stream Processing**: Framework and cross-cluster sync.

