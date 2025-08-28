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

## TimechoDB (Database Core)

### V1.3.5.6

> Release Date: 2025.07.16
> 
> Download Link: Please contact Timecho team for download details.

V1.3.5.6 introduces a new configuration switch to disable the data subscription feature. It optimizes the C++ high-availability client and addresses PIPE synchronization latency issues in normal operation, restart, and deletion scenarios, along with query performance for large TEXT objects. Comprehensive enhancements to database monitoring, performance, and stability are also included.

### V1.3.5.4

> Release Date: 2025.06.19

V1.3.5.4 fixes several product defects and optimizes the node removal functionality. It also delivers comprehensive improvements to database monitoring, performance, and stability.

### V1.3.5.3

> Release Date: 2025.06.13

V1.3.5.3 focuses on optimizing data synchronization capabilities, including persisting PIPE transmission progress and adding monitoring metrics for PIPE event transfer time. Related defects have been resolved. Additionally, the encryption algorithm for user passwords has been upgraded to SHA-256. Comprehensive enhancements to database monitoring, performance, and stability are included.

### V1.3.5.2

> Release Date: 2015.06.10

V1.3.5.2 primarily optimizes data synchronization features, adding support for cascading configurations via parameters and ensuring fully consistent ordering between synchronized and real-time writes. It also enables partitioned sending of historical and real-time data after system restarts. Comprehensive enhancements to database monitoring, performance, and stability are included.

### V1.3.5.1

> Release Date: 2025.05.15

V1.3.5.1 resolves several product defects and delivers comprehensive improvements to database monitoring, performance, and stability.

### V1.3.4.2

> Release Date: 2025.04.14

V1.3.4.2 enhances the data synchronization function by supporting bi-directional active-active synchronization of data forwarded through external PIPE sources.

### V1.3.4.1

> Release Date: 2025.01.08

V1.3.4.1 introduces pattern matching functions, continuously optimizes the data subscription mechanism, improves stability, and extends import-data/export-data scripts to support new data types while unifying TsFile, CSV and SQL import/export formats. Comprehensive improvements have been made to database monitoring, performance and stability. Key updates:

* Query Module: Configurable URI-based JAR loading for UDFs, PipePlugins, Triggers and AINodes
* System Module: Extended UDF functionality with new pattern\_match function
* Data Sync: Supports specifying authentication info at sender
* Ecosystem: Kubernetes Operator support
* Scripts: import-data/export-data now supports strings, BLOBs, dates and timestamps
* Scripts: Unified import/export support for TsFile, CSV and SQL formats

### V1.3.3.3

> Release Date: 2024.10.31

V1.3.3.3 improves restart recovery performance, enables DataNodes to actively monitor/load TsFiles with observability metrics, supports automatic loading at receivers when senders transfer files to specified directories, and adds Alter Source capability for Pipes. Comprehensive improvements to monitoring, performance and stability include:

* Data Sync: Automatic type conversion for inconsistent data at receivers
* Data Sync: Enhanced observability with ops/latency metrics for internal APIs
* Data Sync: OPC-UA sink plugin supports CS mode and non-anonymous access
* Subscription: SDK supports create\_if\_not\_exists and drop\_if\_exists APIs
* Stream Processing: Alter Pipe supports Alter Source
* System: Added latency monitoring for REST module
* Scripts: Auto-loading TsFiles from specified directories
* Scripts: import-tsfile supports remote server execution
* Scripts: Kubernetes Helm support
* Scripts: Python client supports new data types (string, BLOB, date, timestamp)

### V1.3.3.2

> Release Date: 2024.08.15

V1.3.3.2 adds metrics for mods file reading time, merge sort memory usage and dispatch latency, supports configurable time partition origin adjustment, enables automatic subscription termination based on pipe completion markers, and improves merge memory control. Key updates:

* Query: Explain Analyze shows mods file read time
* Query: Explain Analyze shows merge sort memory and dispatch latency
* Storage: Added configurable file splitting during compaction
* System: Configurable time partition origin
* Stream Processing: Auto-terminate subscriptions on pipe completion markers
* Data Sync: Configurable RPC compression levels
* Scripts: Export filters only root.\_\_system paths

### V1.3.3.1

> Release Date: 2024.07.12

V1.3.3.1 adds tiered storage throttling, supports username/password auth specification at sync senders, optimizes ambiguous WARN logs at receivers, improves restart performance, and merges configuration files. Key updates:

* Query: Optimized Filter performance for faster aggregation/WHERE queries
* Query: Java Session evenly distributes SQL requests across nodes
* System: Merged config files into iotdb-system.properties
* Storage: Added tiered storage throttling
* Data Sync: Username/password auth specification at senders
* System: Optimized restart recovery time

### V1.3.2.2

> Release Date: 2024.06.04

V1.3.2.2 introduces EXPLAIN ANALYZE for SQL profiling, UDAF framework, automatic data deletion at disk thresholds, metadata sync, path-specific data point counting, and SQL import/export scripts. Supports rolling cluster upgrades and cluster-wide plugin distribution with comprehensive monitoring/performance improvements. Key updates:

* Storage: Improved insertRecords performance
* Storage: SpaceTL feature for auto-deletion at disk thresholds
* Query: EXPLAIN ANALYZE for SQL stage-level profiling
* Query: New UDAF framework
* Query: New envelope demodulation analysis in UDFs
* Query: MaxBy/MinBy functions returning timestamps with values
* Query: Faster value-filtered queries
* Data Sync: Wildcard path matching
* Data Sync: Metadata synchronization (including attributes/permissions)
* Stream Processing: ALTER PIPE for hot plugin updates
* System: TsFile load statistics in data point counting
* Scripts: Local upgrade/backup via hard links
* Scripts: New export-data/import-data for CSV/TsFile/SQL formats
* Scripts: Windows window title differentiation for ConfigNode/DataNode/Cli

### V1.3.1.4

> Release Date: 2024.04.23

V1.3.1.4 adds cluster activation status viewing, variance/stddev aggregation functions, FILL timeout settings, TsFile repair command, one-click info collection scripts, and cluster control scripts while optimizing views and stream processing. Key updates:

* Query: FILL clause timeout threshold
* Query: REST V2 returns column types
* Data Sync: Simplified time range specification
* Data Sync: SSL support (iotdb-thrift-ssl-sink)
* System: SQL query for cluster activation status
* System: Tiered storage transfer rate control
* System: Enhanced observability (node divergence, task scheduling)
* System: Optimized default logging
* Scripts: One-click cluster control scripts (start-all/stop-all)
* Scripts: One-click info collection scripts (collect-info)

### V1.3.0.4

> Release Date: 2024.01.03

V1.3.0.4 introduces the AINode machine learning framework, upgrades permission granularity to time-series level, and optimizes views/stream processing for better usability and stability. Key updates:

* Query: New AINode ML framework
* Query: Fixed slow SHOW PATH responses
* Security: Time-series granular permissions
* Security: SSL client-server encryption
* Stream Processing: New metrics monitoring
* Query: LAST queries on non-writable views
* System: Improved data point counting accuracy

### V1.2.0.1

> Release Date: 2023.06.30

V1.2.0.1 introduces stream processing framework, dynamic templates, substring/replace/round functions, enhances SHOW REGION/TIMESERIES/VARIABLE statements and Session APIs while optimizing monitoring metrics. Key updates:

* Stream Processing: New framework
* Metadata: Dynamic template expansion
* Storage: New SPRINTZ/RLBE encoding and LZMA2 compression
* Query: New CAST, ROUND, SUBSTR, REPLACE functions
* Query: New TIME\_DURATION, MODE aggregation
* Query: CASE WHEN syntax support
* Query: ORDER BY expression support
* Interface: Python API multi-node connection
* Interface: Python client write redirection
* Interface: Batch sequence creation via templates

### V1.1.0.1

> Release Date: 2023.04.03

V1.1.0.1 introduces GROUP BY VARIATION/CONDITION, DIFF/COUNT\_IF functions, and pipeline execution engine while fixing issues including:

* Aligned sequence LAST queries with ORDER BY TIMESERIES
* LIMIT & OFFSET failures
* Post-restart metadata template errors
* Sequence creation after database deletion

Key updates:

* Query: ALIGN BY DEVICE supports ORDER BY TIME
* Query: SHOW QUERIES/KILL QUERY commands
* System: SHOW REGIONS per database
* System: SHOW VARIABLES for cluster parameters
* Query: GROUP BY VARIATION/CONDITION
* Query: SELECT INTO type casting
* Query: New DIFF (scalar), COUNT\_IF (aggregate)
* System: SHOW REGIONS creation time
* System: Configurable dn\_rpc\_port/address

### V1.0.0.1

> Release Date: 2022.12.03

V1.0.0.1 stabilizes distributed architecture while fixing:

* Partition calculation issues
* Undeleted historical snapshots
* Query/SessionPool memory problems

Major features:

* System: Distributed HA architecture
* System: Multi-replica storage
* System: Port conflict detection
* System: Cluster management SQL
* System: ConfigNode/DataNode lifecycle control
* System: Configurable consensus (Simple/IoTConsensus/Ratis)
* System: Multi-replica data/metadata/ConfigNodes
* Query: MPP framework for distributed I/O
* Stream Processing: Framework and cross-cluster sync

## Workbench (Console Tool)

| Version | Description                                                                                        | Supported IoTDB Versions |
|---------|----------------------------------------------------------------------------------------------------|-------------------------|
| V1.5.5  | Added server clock functionality and support for activating Enterprise Edition license databases   | V1.3.4+                 |
| V1.5.4  | Added authentication for Prometheus settings in Instance Management                                | V1.3.4+                 |
| V1.5.1  | Added AI analysis and pattern matching                                                             | V1.3.2+                 |
| V1.4.0  | Added tree model display and English UI                                                            | V1.3.2+                 |
| V1.3.1  | Enhanced analysis methods and import templates                                                     | V1.3.2+                 |
| V1.3.0  | Added DB configuration and UI refinements                                                          | V1.3.2+                 |
| V1.2.6  | Optimized permission controls                                                                      | V1.3.1+                 |
| V1.2.5  | Added "Common Templates" and caching                                                               | V1.3.0+                 |
| V1.2.4  | Added import/export for calculations, time alignment field                                         | V1.2.2+                 |
| V1.2.3  | Added activation details and analysis features                                                     | V1.2.2+                 |
| V1.2.2  | Optimized point description display                                                                | V1.2.2+                 |
| V1.2.1  | Added sync monitoring panel, Prometheus hints                                                      | V1.2.2+                 |
| V1.2.0  | Major Workbench upgrade                                                                            | V1.2.0+                 |
