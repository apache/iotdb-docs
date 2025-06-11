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

### V2.0.4.1

> Release Date: 2025.06.03
>
> Download: Please contact Timecho staff for download

V2.0.4.1 introduces user-defined table functions (UDTF) and multiple built-in table functions for the table model, adds the approx\_count\_distinct aggregate function, supports ASOF INNER JOIN for time columns, and reorganizes script tools by separating Windows-specific scripts. Comprehensive improvements have been made to monitoring, performance, and stability. Key updates:

* ​**​Query Module​**​:
    * New UDTF and built-in table functions for table model
    * ASOF INNER JOIN support for time columns
    * New approx\_count\_distinct aggregate function
* ​**​Stream Processing​**​:
    * Supports asynchronous TsFile loading via SQL
* ​**​System Module​**​:
    * Disaster recovery load balancing strategy for replica selection during scaling down
    * Compatibility with Windows Server 2025
* ​**​Scripts & Tools​**​:
    * Reorganized script tools with Windows-specific scripts separated

### V2.0.3.3

> Release Date: 2025.05.16
>
> Download: Please contact Timecho staff for download

V2.0.3.3 introduces metadata import/export script adaptation for table model, Spark ecosystem integration, timestamps in AINode results, and new aggregate/scalar functions for table model. Comprehensive improvements include:

* ​**​Query Module​**​:
    * New count\_if aggregate function and greatest/least scalar functions
    * Significant performance improvement for full-table count(\*) queries
* ​**​AI Module​**​:
    * Timestamps added to AINode results
* ​**​System Module​**​:
    * Optimized metadata module performance
    * Proactive TsFile monitoring and loading
    * New metrics for TsFile parsing/conversion time and TsFile-to-Tablet conversion count
* ​**​Ecosystem Integration​**​:
    * Spark integration for table model
* ​**​Scripts & Tools​**​:
    * import-schema/export-schema scripts support table model metadata operations

### V2.0.2.1

> Release Date: 2025.04.07
>
> Download: Please contact Timecho staff for download

V2.0.2.1 introduces table model permission management, user management, authentication, UDFs, system tables, and nested queries. Continued optimization of data subscription mechanism with comprehensive improvements:

* ​**​Query Module​**​:
    * UDF management (UDSF/UDAF)
    * URI-based JAR loading configuration for UDFs/PipePlugins/Triggers/AINodes
    * Permission/user management and authentication
    * New system tables and administrative statements
* ​**​System Module​**​:
    * C# client supports table model
    * New C++ Session write interface
    * S3-compatible non-AWS object storage support
    * New pattern\_match UDF function
* ​**​Data Sync​**​:
    * Metadata synchronization and sync-delete operations

### V2.0.1.2

> Release Date: 2025.01.25
>
> Download: Please contact Timecho staff for download

V2.0.1.2 officially implements dual tree-table model configuration, supporting standard SQL syntax, various functions/operators, stream processing, and Benchmark capabilities. Additional features include:

* ​**​Time-Series Table Model​**​:
    * Standard SQL syntax (SELECT/WHERE/JOIN/GROUP BY/ORDER BY/LIMIT/subqueries)
* ​**​Query Module​**​:
    * Logical/mathematical functions and time-series functions like DIFF
    * URI-based component loading configuration
* ​**​Storage Module​**​:
    * Python client adds String/Blob/Date/Timestamp support
    * Optimized merge task priorities
* ​**​Stream Processing​**​:
    * Sender-specified authentication
    * TsFile Load and plugin adaptation
* ​**​System Module​**​:
    * Improved DataNode scaling stability
    * DROP DATABASE in readonly mode
* ​**​Scripts & Tools​**​:
    * Benchmark tool adaptation
    * Extended import/export for new data types
    * Unified TsFile/CSV/SQL support
* ​**​Ecosystem Integration​**​:
    * Kubernetes Operator support

### V1.3.5.1

> Release Date: 2025.05.15
>
> Download: Please contact Timecho staff for download

V1.3.5.1 version has fixed some product defects while also delivering comprehensive improvements to database monitoring, performance, and stability.


### V1.3.4.1

> Release Date: 2025.01.08
>
> Download: Please contact Timecho staff for download

V1.3.4.1 introduces pattern matching functions, continuously optimizes the data subscription mechanism, improves stability, and extends import-data/export-data scripts to support new data types while unifying TsFile, CSV and SQL import/export formats. Comprehensive improvements have been made to database monitoring, performance and stability. Key updates:

* Query Module: Configurable URI-based JAR loading for UDFs, PipePlugins, Triggers and AINodes
* System Module: Extended UDF functionality with new pattern\_match function
* Data Sync: Supports specifying authentication info at sender
* Ecosystem: Kubernetes Operator support
* Scripts: import-data/export-data now supports strings, BLOBs, dates and timestamps
* Scripts: Unified import/export support for TsFile, CSV and SQL formats

### V1.3.3.3

> Release Date: 2024.10.31
>
> Download: Please contact Timecho staff for download

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
>
> Download: Please contact Timecho staff for download

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
>
> Download: Please contact Timecho staff for download

V1.3.3.1 adds tiered storage throttling, supports username/password auth specification at sync senders, optimizes ambiguous WARN logs at receivers, improves restart performance, and merges configuration files. Key updates:

* Query: Optimized Filter performance for faster aggregation/WHERE queries
* Query: Java Session evenly distributes SQL requests across nodes
* System: Merged config files into iotdb-system.properties
* Storage: Added tiered storage throttling
* Data Sync: Username/password auth specification at senders
* System: Optimized restart recovery time

### V1.3.2.2

> Release Date: 2024.06.04
>
> Download: Please contact Timecho staff for download

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
>
> Download: Please contact Timecho staff for download

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
>
> Download: Please contact Timecho staff for download

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
>
> Download: Please contact Timecho staff for download

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
>
> Download: Please contact Timecho staff for download

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
>
> Download: Please contact Timecho staff for download

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

## 2. Workbench (Console Tool)

| Version | Description                                                | Supported IoTDB Versions |
| --------- | ------------------------------------------------------------ | -------------------------- |
| V1.5.1  | Added AI analysis and pattern matching                     | V1.3.2+                  |
| V1.4.0  | Added tree model display and English UI                    | V1.3.2+                  |
| V1.3.1  | Enhanced analysis methods and import templates             | V1.3.2+                  |
| V1.3.0  | Added DB configuration and UI refinements                  | V1.3.2+                  |
| V1.2.6  | Optimized permission controls                              | V1.3.1+                  |
| V1.2.5  | Added "Common Templates" and caching                       | V1.3.0+                  |
| V1.2.4  | Added import/export for calculations, time alignment field | V1.2.2+                  |
| V1.2.3  | Added activation details and analysis features             | V1.2.2+                  |
| V1.2.2  | Optimized point description display                        | V1.2.2+                  |
| V1.2.1  | Added sync monitoring panel, Prometheus hints              | V1.2.2+                  |
| V1.2.0  | Major Workbench upgrade                                    | V1.2.0+                  |
