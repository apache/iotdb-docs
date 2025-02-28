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

## 1. TimechoDB (Database Core)

### **V1.3.4.1**

> **Release Date**: January 8, 2025
>
> **Download**: Please contact the Timecho team for download.

Version V1.3.4.1 introduces a pattern-matching function and further optimizes the data subscription mechanism for improved stability. The `import-data` and `export-data` scripts have been enhanced to support additional data types. The `import-data` and `export-data` scripts have been unified, now supporting the import and export of `TsFile`, `CSV`, and `SQL` formats. Meanwhile, comprehensive improvements have been made to database monitoring, performance, and stability. The specific release contents are as follows:

- **Query** **Module**: Users can configure UDF, PipePlugin, Trigger, and AINode settings and load JAR packages via a URI.
- **System Module**:
    - Expansion of UDF,
    - Added `pattern_match` function for pattern matching.
- **Data Synchronization**: Supports specifying authentication information on the sender side.
- **Ecosystem Integration**: Kubernetes Operator compatibility.
- **Scripts & Tools**:
    - `import-data`/`export-data` scripts now support new data types (strings, large binary objects, dates, timestamps).
    - Unified import/export compatibility for TsFile, CSV, and SQL formats.

### **V1.3.3.3**

> **Release Date**: October 31, 2024
>
> **Download**: Please contact the Timecho team for download.

Version V1.3.3.3 adds the following features: optimization of restart and recovery performance to reduce startup time; the `DataNode `actively listens for and loads `TsFile` data; addition of observability indicators; once the sender transfers files to a specified directory, the receiver automatically loads them into IoTDB.; the `Alter Pipe` supports the `Alter Source` capability. At the same time, comprehensive improvements have been made to database monitoring, performance, and stability. The specific release contents are as follows:

- **Data Synchronization**:
    - Automatic data type conversion on the receiver side.
    - Enhanced observability with ops/latency metrics for internal interfaces.
    - OPC-UA-SINK plugin now supports CS mode and non-anonymous access.
- **Data Subscription**: SDK supports `CREATE IF NOT EXISTS` and `DROP IF EXISTS` interfaces.
- **Stream Processing**: `ALTER PIPE` supports `ALTER SOURCE` capability.
- **System Module**: Added latency monitoring for REST modules.
- **Scripts & Tools**:
    - Auto-loading `TsFile` from specified directories.
    - `import-tsfile` script supports remote server execution.
    - Added Kubernetes Helm support.
    - Python client now supports new data types (strings, large binary objects, dates, timestamps).

### **V1.3.3.2**

> **Release Date**: August 15, 2024
>
> **Download**: Please contact the Timecho team for download.

Version V1.3.3.2 supports outputting the time consumption of reading `mods `files, the memory for maximum sequential disorder merge-sort during input, and the dispatch time consumption. It also enables adjustment of the time partition origin through parameter configuration, and supports automatic termination of subscriptions based on the end-marker of historical pipe data processing. Meanwhile, it combines the performance improvement of module memory control. The specific release contents are as follows:

- **Query** **Module**:
    - `EXPLAIN ANALYZE` now reports time spent reading mods files.
    - Metrics for merge-sort memory usage and dispatch latency.
- **Storage Module**: Added configurable time partition origin adjustment.
- **Stream Processing**: Auto-terminate subscriptions based on pipe history markers.
- **Data Synchronization**: RPC compression now supports configurable levels.
- **Scripts & Tools**: Metadata export excludes only `root.__system`, not similar prefixes.

### **V1.3.3.1**

> **Release Date**: July 12, 2024
>
> **Download**: Please contact the Timecho team for download.

In version V1.3.3.1, a throttling mechanism is added to multi-tier storage. Data synchronization supports specifying username and password authentication for the receiver at the sender's sink. Some unclear WARN logs on the data synchronization receiver side are optimized, the restart-recovery performance is enhanced, and the startup time is reduced. Meanwhile, the script contents are merged. The specific release contents are as follows:

- **Storage Module**: Rate-limiting added to multi-tier storage.
- **Data Synchronization**: Sender-side username/password authentication for receivers.
- **System Module**:
    - Merged configuration files into `iotdb-system.properties`.
    - Optimized restart recovery time.
- **Query** **Module**:
    - Improved filter performance for aggregation and WHERE clauses.
    - Java Session client distributes SQL query requests evenly to all nodes.

### **V1.3.2.2**

> **Release Date**: June 4, 2024
>
> **Download**: Please contact the Timecho team for download.

The V1.3.2.2 version introduces the Explain Analyze statement for analyzing the execution time of a single `SQL `query, a User-Defined Aggregate Function (`UDAF`) framework, automatic data deletion when disk space reaches a set threshold, schema synchronization, counting data points in specified paths, and `SQL `script import/export functionality. The cluster management tool now supports rolling upgrades and plugin deployment across the entire cluster. Comprehensive improvements have also been made to database monitoring, performance, and stability. The specific release content is as follows:

**Storage Module:**

- Improved write performance of the `insertRecords `interface.
- Added `SpaceTL `functionality to automatically delete data when disk space reaches a set threshold.

**Query** **Module:**

- Added the `Explain Analyze` statement to monitor the execution time of each stage of a single SQL query.
- Introduced a User-Defined Aggregate Function (UDAF) framework.
- Added envelope demodulation analysis in UDF.
- Added `MaxBy/MinBy` functions to return the corresponding timestamp while obtaining the maximum/minimum value.
- Improved performance of value filter queries.

**Data Synchronization:**

- Path matching now supports wildcards.
- Schema synchronization is now supported, including time series and related attributes, permissions, and other settings.

**Stream Processing:**

- Added the `Alter Pipe` statement to support hot updates of Pipe task plugins.

**System Module:**

- Enhanced system data point counting to include statistics for `load TsFile`.

**Scripts and Tools:**

- Added a local upgrade backup tool that uses hard links to back up existing data.
- Introduced `export-data/import-data` scripts to support data export in `CSV`, `TsFile `, or as `SQL `statements.
- The Windows environment now supports distinguishing `ConfigNode`, `DataNode`, and `Cli `by window name.

### **V1.3.1.4**

> **Release Date**: April 23, 2024
>
> **Download**: Please contact the Timecho team for download.

The V1.3.1 release introduces several new features and enhancements, including the ability to view system activation status, built-in variance and standard deviation aggregate functions, timeout settings for the built-in `Fill `statement, and a `TsFile `repair command. Additionally, one-click scripts for collecting instance information and starting/stopping the cluster have been added. The usability and performance of views and stream processing have also been optimized. The specific release content is as follows:

**Query** **Module:**

- The `Fill `clause now supports setting a fill timeout threshold; no fill will occur if the time threshold is exceeded.
- The `REST API` (V2 version) now returns column types.

**Data Synchronization:**

- Simplified the way to specify time ranges for data synchronization by directly setting start and end times.
- Data synchronization now supports the `SSL `transport protocol (via the` iotdb-thrift-ssl-sink` plugin).

**System Module:**

- Added the ability to query cluster activation information using SQL.
- Added transmission rate control during data migration in multi-tier storage.
- Enhanced system observability (added divergence monitoring for cluster nodes and observability for the distributed task scheduling framework).
- Optimized the default log output strategy.

**Scripts and Tools:**

- Added one-click scripts to start and stop the cluster (`start-all/stop-all.sh & start-all/stop-all.bat`).
- Added one-click scripts to collect instance information (`collect-info.sh & collect-info.bat`).

### **V1.3.0.4**

> **Release Date**: January 3, 2024
>
> **Download**: Please contact the Timecho team for download.



The V1.3.0.4 release introduces a new inborn machine learning framework `AINode`, a comprehensive upgrade of the permission module to support sequence-granularity permissions, and numerous detail optimizations for views and stream processing. These enhancements further improve usability, version stability, and overall performance. The specific release content is as follows:

**Query** **Module:**

- Added the `AINode `inborn machine learning module.
- Optimized the performance of the `show path` statement to reduce response time.

**Security Module:**

- Upgraded the permission module to support permission settings at the time-series granularity.
- Added `SSL `communication encryption between clients and servers.

**Stream Processing:**

- Added multiple new metrics for monitoring in the stream processing module.

**Query** **Module:**

- Non-writable view sequences now support `LAST` queries.
- Optimized the accuracy of data point monitoring statistics.

### **V1.2.0.1**

> **Release Date**: June 30, 2023
>
> **Download**: Please contact the Timecho team for download.

The V1.2.0.1 release introduces several new features, including a new stream processing framework, dynamic templates, and built-in query functions such as `substring`, `replace`, and `round`. It also enhances the functionality of built-in statements like `show region`, `show timeseries`, and `show variable`, as well as the Session interface. Additionally, it optimizes built-in monitoring items and their implementation, and fixes several product bugs and performance issues. The specific release content is as follows:

**Stream Processing:**

- Added a new stream processing framework.

**Schema Module:**

- Added dynamic template expansion functionality.

**Storage Module:**

- Added SPRINTZ and RLBE encoding, as well as the LZMA2 compression algorithm.

**Query** **Module:**

- Added built-in scalar functions: `cast`, `round`, `substr`, `replace`.
- Added built-in aggregate functions: `time_duration`, `mode`.
- SQL statements now support `CASE WHEN` syntax.
- SQL statements now support `ORDER BY` expressions.

**Interface Module:**

- Python API now supports connecting to multiple distributed nodes.
- Python client now supports write redirection.
- Session API added an interface for creating sequences in batches using templates.

### **V1.1.0.1**

> **Release Date**: April 3, 2023
>
> **Download**: Please contact the Timecho team for download.



The V1.1.0.1 release introduces several new features, including support for `GROUP BY VARIATION`, `GROUP BY CONDITION`, and useful functions like `DIFF` and `COUNT_IF`. It also introduces the pipeline execution engine to further improve query speed. Additionally, it fixes several issues related to last query alignment, `LIMIT` and `OFFSET` functionality, metadata template errors after restart, and sequence creation errors after deleting all databases. The specific release content is as follows:

**Query** **Module:**

- `ALIGN BY DEVICE` statements now support `ORDER BY TIME`.
- Added support for the `SHOW QUERIES` command.
- Added support for the `KILL QUERY` command.

**System Module:**

- `SHOW REGIONS` now supports specifying a particular database.
- Added the `SHOW VARIABLES` SQL command to display current cluster parameters.
- Aggregation queries now support `GROUP BY VARIATION`.
- `SELECT INTO` now supports explicit data type conversion.
- Implemented the built-in scalar function `DIFF`.
- `SHOW REGIONS` now displays creation time.
- Implemented the built-in aggregate function `COUNT_IF`.
- Aggregation queries now support `GROUP BY CONDITION`.
- Added support for modifying `dn_rpc_port` and `dn_rpc_address`.

### **V1.0.0.1**

> **Release Date**: December 3, 2022
>
> **Download**: Please contact the Timecho team for download.



The V1.0.0.1 release focuses on fixing issues related to partition computation and query execution, undeleted historical snapshots, data query problems, and SessionPool memory usage. It also introduces several new features, such as support for `SHOW VARIABLES`, `EXPLAIN ALIGN BY DEVICE`, and enhanced functionality for ExportCSV/ExportTsFile/MQTT. Additionally, it improves the cluster startup/shutdown process, changes the default internal ports of the IoTDB cluster, and adds the `cluster_name` attribute to distinguish clusters. The specific release content is as follows:

**System Module:**

- Added support for distributed high-availability architecture.
- Added support for multi-replica storage.
- If a port is already in use, the node startup process will be terminated.
- Added cluster management SQL.
- Added functional management for starting, stopping, and removing ConfigNodes and DataNodes.
- Configurable consensus protocol framework and multiple consensus protocols: Simple, IoTConsensus, Ratis.
- Added multi-replica management for data, schema, and ConfigNodes.

**Query** **Module:**

- Added support for the large-scale parallel processing framework MPP, providing distributed read/write capabilities.

**Stream Processing Module:**

- Added support for the stream processing framework.
- Added support for data synchronization between clusters.

## 2. Workbench (Console Tool)

| Version | Key New Features                         | Supported IoTDB Versions |
| :------ | :--------------------------------------- | :----------------------- |
| V1.5.1  | AI analysis, pattern matching            | V1.3.2+                  |
| V1.4.0  | Tree model visualization, English UI     | V1.3.2+                  |
| V1.3.1  | Enhanced analysis templates              | V1.3.2+                  |
| V1.3.0  | Database configuration tools             | V1.3.2+                  |
| V1.2.6  | Improved permission controls             | V1.3.1+                  |
| V1.2.5  | Template caching, UI optimizations       | V1.3.0+                  |
| V1.2.4  | Data import/export, time alignment       | V1.2.2+                  |
| V1.2.3  | Activation details, analysis tools       | V1.2.2+                  |
| V1.2.2  | Enhanced measurement point descriptions  | V1.2.2+                  |
| V1.2.1  | Sync monitoring panel, Prometheus alerts | V1.2.2+                  |
| V1.2.0  | Major Workbench upgrade                  | V1.2.0+                  |