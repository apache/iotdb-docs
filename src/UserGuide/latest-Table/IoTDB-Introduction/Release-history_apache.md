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

## V2.0.6

> Release Date: 2026.01.20

V2.0.6 is the official release of the dual-mode (tree and table) architecture. It introduces **query-writeback capability for the table mode**, new **bitwise operation functions** (built-in scalar functions), and **push-down-capable time functions**, while delivering comprehensive improvements in database monitoring, performance, and stability. Specific release contents are as follows:

* **Query Module**: Added support for query-writeback functionality in the table model.
* **Query Module**: Enhanced row-pattern recognition in the table model to support aggregate functions, enabling analysis and computation over consecutive data sequences.
* **Query Module**: Introduced built-in scalar bitwise operation functions for the table model.
* **Query Module**: Added a push-down-capable `EXTRACT` time function for the table model.
* **Others**: Fixed security vulnerabilities CVE-2025-12183, CVE-2025-66566, and CVE-2025-11226.


## V2.0.5

> Release Date: 2025.08.21

V2.0.5, as the official release of the Dual-Mode Tree-Table system, primarily introduces the tree-to-table view, window functions for the table model, the aggregate function approx_most_frequent, and supports LEFT & RIGHT JOIN as well as ASOF LEFT JOIN. The AINode now includes two new built-in models, Timer-XL and Timer-Sundial, and supports inference capabilities for both tree and table models. Additionally, this version brings comprehensive improvements to database monitoring, performance, and stability. The specific updates are as follows:

* **Query Module**: Supports manual creation of tree-to-table views
* **Query Module**: Adds window functions for the table model
* **Query Module**: Adds the aggregate function approx_most_frequent for the table model
* **Query Module**: Extends JOIN functionality for the table model, supporting LEFT & RIGHT JOIN and ASOF LEFT JOIN
* **Query Module**: The table model now supports row pattern recognition, enabling the capture of continuous data for analysis and computation
* **Storage Module**: Adds multiple system tables for the table model, such as VIEWS (table view information) and MODELS (model information)
* **AI Module**: AINode adds two new built-in models, Timer-XL and Timer-Sundial
* **AI Module**: AINode supports inference functions for both tree and table models

## V2.0.4

> Release Date: 2025.07.09

V2.0.4 serves as the official release of the dual-model system for tree and table structures. The table model primarily introduces user-defined table functions (UDTF) and multiple built-in table functions, adds the aggregate function approx_count_distinct, and supports ASOF INNER JOIN for time columns. Additionally, script tools have been categorized and reorganized, with Windows-specific scripts separated. The release also includes comprehensive improvements in database monitoring, performance, and stability. The detailed updates are as follows:

* **Query Module**: The table model introduces user-defined table functions (UDTF) and multiple built-in table functions.

* **Query Module**: The table model supports ASOF INNER JOIN for time columns.

* **Query Module**: The table model adds the aggregate function approx_count_distinct.

* **Stream Processing**: Supports asynchronous loading of TsFile via SQL.

* **System Module**: During capacity reduction, replica selection now supports disaster recovery load balancing strategies.

* **System Module**: Compatibility with Windows Server 2025 has been added.

* **Scripts & Tools**: Script tools have been categorized and reorganized, with Windows-specific scripts separated.

## V2.0.3

> Release Date: 2025.05.30

As the official release of the dual tree-table model, V2.0.3 primarily introduces metadata import/export script adaptation for the table model, Spark ecosystem integration (table model), timestamp addition to AINode results, and new aggregate/scalar functions for the table model. Comprehensive improvements have been made to database monitoring, performance, and stability. Key updates include:

* ​**​Query Module​**​:
    * New aggregate function `count_if` and scalar functions `greatest/least` for table model
    * Significant performance improvement for full-table `count(*)` queries in table model
* ​**​AI Module​**​:
    * AINode results now include timestamps
* ​**​System Module​**​:
    * Optimized metadata module performance for table model
    * Added proactive TsFile monitoring and loading for table model
    * Python/Go client query interfaces now support TsBlock deserialization
* ​**​Ecosystem Integration​**​:
    * Spark integration for table model
* ​**​Scripts & Tools​**​:
    * `import-schema/export-schema` scripts now support table model metadata import/export

## V2.0.2

> Release Date: 2025.04.18

As the official release of the dual tree-table model, V2.0.2 introduces table model permission management, user management, and related authentication, along with UDFs, system tables, and nested queries for the table model. Comprehensive improvements to monitoring, performance, and stability include:

* ​**​Query Module​**​:
    * Added UDF management, user-defined scalar functions (UDSF), and aggregate functions (UDAF) for table model
    * Permission/user management and operation authentication for table model
    * New system tables and administrative statements
* ​**​System Module​**​:
    * Full isolation between tree and table models at database level
    * Built-in MQTT Service adapted for table model
    * C# and Go clients now support table model
    * New C++ Session write interface for table model
* ​**​Data Sync​**​:
    * Metadata synchronization and sync-delete operations for table model
* ​**​Scripts & Tools​**​:
    * `import-data/export-data` scripts now support table model and local TsFile load

## V2.0.1-beta

> Release Date: 2025.02.18

V2.0.1-beta introduces dual tree-table model configuration, supporting standard SQL query syntax, various functions/operators, stream processing, and Benchmark capabilities for the table model. Additional updates include:

* ​**​Table Model​**​:
    * Supports standard SQL syntax (SELECT/WHERE/JOIN/GROUP BY/ORDER BY/LIMIT/subqueries)
    * Various functions including logical operators, mathematical functions, and time-series functions like DIFF
* ​**​Storage Module​**​:
    * Python client adds support for four new data types: String, Blob, Date, Timestamp
    * Optimized merge task priority rules
* ​**​Stream Processing​**​:
    * Supports specifying authentication info at sender
    * TsFile Load supports table model
    * Stream processing plugins adapted for table model
* ​**​System Module​**​:
    * Enhanced DataNode scaling stability
    * Supports DROP DATABASE in readonly mode
* ​**​Scripts & Tools​**​:
    * Benchmark tool adapted for table model
    * Supports four new data types: String, Blob, Date, Timestamp
    * Unified import/export support for TsFile, CSV and SQL formats
* ​**​Ecosystem Integration​**​:
    * Kubernetes Operator support

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
