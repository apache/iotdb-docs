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

## V1.3.7

> Release Date: 2026.03.04

V1.3.7 focuses on security hardening and stability optimization. It removes high-risk RPC interfaces and JEXL functions, strengthens naming convention validation and service address configuration logic, optimizes the automatic deletion mechanism for partitioned tables, and provides comprehensive improvements to database monitoring, performance, and stability. The specific release contents are as follows:

* **Miscellaneous**: Removed high-risk RPC interfaces
* **Miscellaneous**: Removed JEXL functions
* **Miscellaneous**: Added naming合法性校验 when creating Pipe
* **Miscellaneous**: Changed the default client RPC service address to 127.0.0.1
* **Miscellaneous**: Adjusted code logic so that internal services bind to the address configured by `dn_internal_address` instead of the default address


## V1.3.6

> Release Date: 2026.01.20

V1.3.6 is a maintenance update within the 1.X series, delivering deep optimizations across three core areas: query performance, data synchronization stability, and memory management mechanisms—resulting in comprehensive enhancements to database monitoring, performance, and overall system stability. The specific release contents are as follows:

* **Query Module**: Optimized query performance in multiple scenarios, including multi-series Last queries.
* **Query Module**: Added a new FastLastQuery interface in the Java SDK to support more efficient Last query operations.
* **Query Module**: Adjusted the tree model’s fetchSchema to return results in segmented streaming mode, improving response speed in large-data-volume scenarios.
* **Storage Module**: Enhanced memory management to prevent memory leaks and ensure long-term system stability.
* **Storage Module**: Optimized the file compaction mechanism to improve compaction efficiency and reduce storage resource consumption.
* **Data Synchronization**: Improved Pipe SQL parameter configuration to support specifying asynchronous loading methods.
* **Data Synchronization**: Introduced syntactic sugar to automatically split full-data Pipe creation SQL into real-time and historical synchronization components.
* **System Module**: Added a global configuration option for data-type-specific compression strategies, enabling on-demand tuning of storage compression policies.
* **Others**: Fixed security vulnerabilities CVE-2025-12183, CVE-2025-66566, and CVE-2025-11226.

## V1.3.5

> Release Date: 2025.09.12

V1.3.5, as a bugfix release based on the previous 1.3.x versions, primarily adjusts the user password encryption algorithm to further enhance data access security. It also optimizes kernel stability and addresses issues reported by the community.


## V1.3.4

> Release Date: 2025.04.18

V1.3.4 primarily introduces pattern matching functions, continuously optimizes the data subscription mechanism, improves stability, merges data import/export scripts, and extends support for new data types. It also delivers comprehensive enhancements in database monitoring, performance, and stability. Key updates include:

* ​**​Query Module​**​:
    * Users can now configure UDFs, PipePlugins, Triggers, and AINodes to load JARs via URI.
    * Added monitoring for cached TimeIndex during merge operations.
* ​**​System Module​**​:
    * Extended UDF functionality with the new `pattern_match` pattern-matching function.
    * Python Session SDK now supports connection timeout parameters.
    * Added authentication for cluster management operations.
    * ConfigNode/DataNode now supports scaling down via SQL.
    * ConfigNode automatically cleans up partition information exceeding TTL (every 2 hours).
* ​**​Data Synchronization​**​:
    * Supports specifying authentication information at the sender.
* ​**​Ecosystem Integration​**​:
    * Added Kubernetes Operator support.
* ​**​Scripts & Tools​**​:
    * Extended `import-data/export-data` scripts to support new data types (strings, BLOBs, dates, timestamps).
    * Unified script support for importing/exporting TsFile, CSV, and SQL data formats.

## V1.3.3

> Release Date: 2024.11.20

V1.3.3 introduces support for ​**​String, Blob, Date, and Timestamp​**​ data types, enhances data subscription capabilities, enables DataNodes to actively monitor and load TsFiles, and adds observability metrics. It also optimizes configuration file integration, client query load balancing, and more, while addressing bugs and performance issues. Key updates:

* ​**​Storage Module​**​:
    * New data types: String, Blob, Date, Timestamp.
    * Improved memory control during merge operations.
* ​**​Query Module​**​:
    * Optimized client query request load balancing.
    * Added active metadata statistics queries.
    * Enhanced Filter performance for faster aggregation and WHERE queries.
* ​**​Data Synchronization​**​:
    * Senders can now transfer files to a specified directory, with receivers automatically loading them into IoTDB.
    * Added automatic data type conversion at the receiver.
* ​**​Data Subscription​**​:
    * New subscription capability for data points or TsFile-based updates.
* ​**​Data Loading​**​:
    * DataNodes actively monitor and load TsFiles with added observability metrics.
* ​**​Stream Processing​**​:
    * `ALTER PIPE` now supports `ALTER SOURCE`.
* ​**​System Module​**​:
    * Simplified configuration files (merged into one).
    * Added configuration interface settings.
    * Improved restart recovery performance.
* ​**​Scripts & Tools​**​:
    * New metadata import/export scripts.
    * Added Kubernetes Helm support.

## V1.3.2

> Release Date: 2024.07.01

V1.3.2 introduces ​**​`EXPLAIN ANALYZE`​**​ for SQL query profiling, a ​**​UDAF framework​**​, metadata synchronization, and tools for counting data points under specified paths. It also supports rolling cluster upgrades and plugin distribution. Key updates:

* ​**​Query Module​**​:
    * `EXPLAIN ANALYZE` to profile SQL execution stages.
    * New UDAF (User-Defined Aggregation Function) framework.
    * `MaxBy/MinBy` functions to retrieve timestamps with max/min values.
* ​**​Data Sync​**​:
    * Wildcard support for path matching.
    * Metadata synchronization (including time series attributes and permissions).
* ​**​System Module​**​:
    * TsFile load operations now contribute to data point statistics.
* ​**​Scripts & Tools​**​:
    * Local upgrade/backup tools (via hard links).
    * `export-data/import-data` scripts for CSV/TsFile/SQL formats.
    * Windows support for distinguishing ConfigNode/DataNode/Cli via window titles.


## V1.3.1

> Release Date: 2024.04.22

V1.3.1 introduces several new features including one-click cluster control scripts, instance information collection scripts, and multiple built-in functions. It also optimizes existing data synchronization, log output strategies, and query execution processes, while enhancing system observability and addressing various product bugs and performance issues. Key updates include:

* Added one-click cluster start/stop scripts (start-all/stop-all.sh & start-all/stop-all.bat)
* Added one-click instance information collection scripts (collect-info.sh & collect-info.bat)
* New built-in aggregate functions: standard deviation and variance
* Added TsFile repair command
* FILL clause now supports timeout threshold setting (no filling when exceeding time limit)
* Simplified time range specification for data synchronization (direct start/end time setting)
* Enhanced system observability (added cluster node divergence monitoring and distributed task scheduling observability)
* Optimized default log output strategy
* Improved memory control for Load TsFile operations (full-process coverage)
* REST interface (V2) now returns column types
* Optimized query execution process
* Clients now automatically fetch available DataNode lists

## V1.3.0

> Release Date: 2024.01.01

V1.3.0 introduces new features including SSL communication encryption and data synchronization monitoring statistics. It optimizes the syntax and logic of the permission module, metrics algorithm library performance, Python client write performance, and query efficiency in specific scenarios, while fixing various product bugs and performance issues. Key updates include:

* Security Module:
    * Enhanced permission module with time-series granular permission control
    * Added SSL communication encryption for client-server connections
* Query Module:
    * Calculation-type views now support LAST queries
* Stream Processing:
    * Added pipe-related monitoring metrics
* Storage Module:
    * Support for negative timestamp writing
* Scripts & Tools:
    * Load script imported data now included in data point monitoring statistics
* Client Module:
    * Optimized Python client performance
* Query Module Improvements:
    * Resolved long response time for SHOW PATH commands
    * Improved EXPLAIN statement display alignment
* System Module:
    * Added unified memory configuration item MEMORY\_SIZE to environment configuration scripts
    * Renamed configuration item target\_config\_node\_list to seed\_config\_node
    * Renamed configuration item storage\_query\_schema\_consensus\_free\_memory\_proportion to datanode\_memory\_proportion

## V1.2.0

> Release Date: 2023.06.30

V1.2.0 introduces major new features including a stream processing framework, dynamic templates, and built-in query functions (substring/replace/round). It enhances built-in statements like SHOW REGION/SHOW TIMESERIES/SHOW VARIABLE and Session interfaces, while optimizing built-in monitoring metrics and fixing various bugs and performance issues.

* ​**​Stream Processing​**​: New stream processing framework
* ​**​Metadata Module​**​: Added dynamic template expansion
* ​**​Storage Module​**​: New SPRINTZ and RLBE encoding schemes with LZMA2 compression
* ​**​Query Module​**​:
    * New built-in scalar functions: CAST, ROUND, SUBSTR, REPLACE
    * New aggregate functions: TIME\_DURATION, MODE
    * SQL now supports CASE WHEN syntax
    * SQL now supports ORDER BY expressions
* ​**​Interface Module​**​:
    * Python API supports connecting to multiple distributed nodes
    * Python client supports write redirection
    * Session API adds batch time series creation via templates

## V1.1.0

> Release Date: 2023.04.03

V1.1.0 introduces new segmentation methods (GROUP BY VARIATION/CONDITION) and utility functions (DIFF, COUNT\_IF), along with a pipeline execution engine for faster queries. It also fixes issues including:

* Aligned sequence LAST queries with ORDER BY TIMESERIES
* LIMIT & OFFSET failures
* Metadata template errors after restart
* Sequence creation errors after deleting all databases

Key updates:

* ​**​Query Module​**​:
    * ALIGN BY DEVICE now supports ORDER BY TIME
    * New SHOW QUERIES command
    * New KILL QUERY command
    * Aggregate queries support GROUP BY VARIATION/CONDITION
    * SELECT INTO supports type casting
    * New built-in functions: DIFF (scalar), COUNT\_IF (aggregate)
* ​**​System Module​**​:
    * SHOW REGIONS supports database specification
    * New SHOW VARIABLES for cluster parameters
    * SHOW REGIONS displays creation time
    * Supports modifying dn\_rpc\_port and dn\_rpc\_address

## V1.0.0

> Release Date: 2022.12.03

V1.0.0 stabilizes the distributed architecture while fixing:

* Partition calculation issues
* Undeleted historical snapshots
* Query execution and SessionPool memory problems

Major features:

* ​**​System Module​**​:
    * Distributed high-availability architecture
    * Multi-replica storage
    * Port conflict detection during node startup
    * Cluster management SQL
    * ConfigNode/DataNode lifecycle control (start/stop/remove)
    * Configurable consensus protocols: Simple, IoTConsensus, Ratis
    * Multi-replica support for data/metadata/ConfigNodes
* ​**​Query Module​**​: MPP framework for distributed read/write
* ​**​Stream Processing​**​:
    * Stream processing framework
    * Cross-cluster data synchronization
