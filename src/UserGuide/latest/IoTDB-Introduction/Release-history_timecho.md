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

### V2.0.6.1

> Release Date: 2025.09.19</br>
> Download Link: Please contact Timecho Team to obtain the download link</br>
> Installation Package Name: timechodb-2.0.6.1-bin.zip</br>
> SHA512 Checksum: c88e3e2c0dbd06578bd0697ca9992880b300baee2c4906ba1f952134e37ae2fa803a6af236f4541d318b75f43a498b5d5bfbbc7c445783271076c36e696e4dd0

V2.0.6.1 introduces  the new table model query write-back function, access control blacklist/whitelist function, bitwise operation functions (built-in scalar functions), and push-downable time functions. Comprehensive enhancements to database monitoring, performance, and stability are also included. Key updates:

* ​**​Query Module:​**​
  * Supports the table model query write-back function
  * The table model row pattern recognition supports the use of aggregate functions to capture continuous data for analytical calculation
  * The table model adds built-in scalar functions - bitwise operation functions
  * The table model adds push-downable EXTRACT time functions
* ​**​System Module:​**​
  * Adds access control, supporting users to customize and configure blacklist/whitelist functions
* ​**​Others:​**​
  * The default user password is updated to "TimechoDB@2021" with higher security strength

### V2.0.5.2

> Release Date: 2025.08.08</br>
> Download Link: Please contact Timecho Team to obtain the download link</br>
> Installation Package Name: timechodb-2.0.5.2-bin.zip</br>
> SHA512 Checksum: a00a4075c9937b7749c454f71d2480fea5e9ff9659c0628b132e30e2f256c7c537cd91dca4f6be924db0274bb180946a1b88e460c025bf82fdb994a3c2c7b91e

V2.0.5.2 introduces addresses certain product defects, optimizes the data synchronization function,Comprehensive enhancements to database monitoring, performance, and stability are also included.


### V2.0.5.1

> Release Date: 2025.07.14</br>
> Download Link: Please contact Timecho Team to obtain the download link</br>
> Installation Package Name: timechodb-2.0.5.1-bin.zip</br>
> SHA512 Checksum: aa724755b659bf89a60da6f2123dfa91fe469d2e330ed9bd029e8f36dd49212f3d83b1025e9da26cb69315e02f65c7e9a93922e40df4f2aa4c7f8da8da2a4cea

V2.0.5.1 introduces ​**​tree-to-table view​**​, ​**​window functions​**​ and the ​**​approx\_most\_frequent​**​ aggregate function for the table model, along with support for ​**​LEFT & RIGHT JOIN​**​ and ​**​ASOF LEFT JOIN​**​. AINode adds two built-in models: ​**​Timer-XL​**​ and ​**​Timer-Sundial​**​, supporting inference and fine-tuning for tree and table models. Comprehensive enhancements to database monitoring, performance, and stability are also included. Key updates:

* ​**​Query Module:​**​
  * Supports manually creating tree-to-table views
  * Adds window functions for table model
  * Adds approx\_most\_frequent aggregate function
  * Extends JOIN support: LEFT/RIGHT JOIN, ASOF LEFT JOIN
  * Enables row pattern recognition (captures continuous data for analysis)
  * New system tables: VIEWS (view metadata), MODELS (model info), etc.
* ​**​System Module:​**​
  * Adds TsFile data encryption
* ​**​AI Module:​**​
  * New built-in models: Timer-XL and Timer-Sundial
  * Supports inference/fine-tuning for tree and table models
* ​**​Others:​**​
  * Enables data publishing via OPC DA protocol

### 2.x Other historical versions

#### V2.0.4.2

> Release Date: 2025.06.21</br>
> Download Link: Please contact Timecho Team to obtain the download link</br>
> Installation Package Name: timechodb-2.0.4.2-bin.zip</br>
> SHA512 Checksum: 31f26473ac90988ce970dac8d0950671bde918f9af6f2f6a6c2bf99a53aa1c0a459c53a137b18ff0b28e70952e9c4b6acb50029e0b2e38837b969eb8f78f2939

V2.0.4.2 adds support for passing TOPIC to custom MQTT plugins. Includes comprehensive improvements to monitoring, performance, and stability.

#### V2.0.4.1

> Release Date: 2025.06.03</br>
> Download Link: Please contact Timecho Team to obtain the download link</br>
> Installation Package Name: timechodb-2.0.4.1-bin.zip</br>
> SHA512 Checksum: 93ac08bfae06aff6db04849f474458433026f66778f4f5c402eb22f1a7cb14d8096daf0a9e9cc365ddfefd4f8ca4443b2a9fb6461906f056b1e6a344990beb3a

V2.0.4.1 introduces ​**​User-Defined Table Functions (UDTF)​**​ and multiple built-in table functions for the table model, adds the ​**​approx\_count\_distinct​**​ aggregate function, and enables ​**​ASOF INNER JOIN on timestamp columns​**​. Script tools are categorized, with Windows-specific scripts separated out. Key updates:

* ​**​Query Module:​**​
  * Adds UDTFs and built-in table functions
  * Supports ASOF INNER JOIN on timestamps
  * Adds approx\_count\_distinct aggregate function
* ​**​Stream Processing:​**​
  * Supports asynchronous TsFile loading via SQL
* ​**​System Module:​**​
  * Disaster-aware load balancing strategy for replica selection during downsizing
  * Compatibility with Windows Server 2025
* ​**​Scripts & Tools:​**​
  * Categorized scripts; isolated Windows-specific tools

#### V2.0.3.4

> Release Date: 2025.06.13</br>
> Download Link: Please contact Timecho Team to obtain the download link</br>
> Installation Package Name: timechodb-2.0.3.4-bin.zip</br>
> SHA512 Checksum: d80d34b7d3890def75b17c491fc4c13efc36153a5950a9b23744755d04d6adb5d6ab9ec970101183fef7bfeb8a559ef92fce90d2d22f7b7fd5795cd5589461bb

V2.0.3.4 upgrades the user password encryption algorithm to ​**​SHA-256​**​. Includes comprehensive monitoring, performance, and stability improvements.

#### V2.0.3.3

> Release Date: 2025.05.16</br>
> Download Link: Please contact Timecho Team to obtain the download link</br>
> Installation Package Name: timechodb-2.0.3.3-bin.zip</br>
> SHA512 Checksum: f47e3fb45f869dbe690e7cfaa93f95e5e08a462b362aa9d7ccac7ee5b55022dc8f62db12009dfde055f278f3003ff9ea7c22849d52a3ef2c25822f01ade78591

V2.0.3.3 introduces ​**​metadata import/export scripts for table models​**​, ​**​Spark ecosystem integration​**​, and adds ​**​timestamps to AINode results​**​. New aggregate/scalar functions are added. Key updates:

* ​**​Query Module:​**​
  * New aggregate function: count\_if; scalar functions: greatest/least
  * Significant optimization for full-table count(\*) queries
* ​**​AI Module:​**​
  * Timestamps added to AINode results
* ​**​System Module:​**​
  * Optimized metadata performance for table model
  * Active monitoring & loading of TsFiles
  * New metrics: TsFile parsing time, Tablet conversion count
* ​**​Ecosystem Integration:​**​
  * Spark integration for table model
* ​**​Scripts & Tools:​**​
  * import-schema/export-schema scripts support table model metadata

#### V2.0.3.2

> Release Date: 2025.05.15</br>
> Download Link: Please contact Timecho Team to obtain the download link</br>
> Installation Package Name: timechodb-2.0.3.2-bin.zip</br>
> SHA512 Checksum: 76bd294de4b01782e5dd621a996aeb448e4581f98c70fb5b72b17dc392c2e1227c0d26bd3df5533669a80f217a83a566bc6ec926b7efd21ce7a89b894cd33e19

V2.0.3.2 resolves product defects, optimizes node removal, and enhances monitoring, performance, and stability.

#### V2.0.2.1

> Release Date: 2025.04.07</br>
> Download Link: Please contact Timecho Team to obtain the download link</br>
> Installation Package Name: timechodb-2.0.2.1-bin.zip</br>
> SHA512 Checksum: a41be3f8c57e6a39ac165f1d6ab92c9ed790b0712528f31662c58617f4c94e6bfc9392a9c1ef2fc5bdd8c7ca79901389f368cbdbec3e5b1d5c1ce155b2f1a457

V2.0.2.1 adds ​**​table model permission management​**​, ​**​user management​**​, and ​**​operation authentication​**​, alongside UDFs, system tables, and nested queries. Data subscription mechanisms are optimized. Key updates:

* ​**​Query Module:​**​
  * Added UDF management: User-Defined Scalar Functions (UDSF) & Aggregate Functions (UDAF)
  * Configurable URI-based loading for UDF/PipePlugin/Trigger/AINode JARs
  * Permission/user management with operation authentication
  * New system tables and maintenance statements
* ​**​System Module:​**​
  * CSharp client supports table model
  * New C++ Session write APIs for table model
  * Multi-tier storage supports S3-compliant non-AWS object storage
  * New pattern\_match function
* ​**​Data Sync:​**​
  * Table model metadata sync and delete propagation

#### V2.0.1.2

> Release Date: 2025.01.25</br>
> Download Link: Please contact Timecho Team to obtain the download link</br>
> Installation Package Name: timechodb-2.0.1.2-bin.zip</br>
> SHA512 Checksum: 51c2fa5da2974a8a3c8871dec1c49bd98e5d193a13ef33ac7801adb833a1e360d74f0160bcdf33c7ffb23a5c5e0f376e26a4315cf877f1459483356285b85349

V2.0.1.2 officially implements ​**​dual-model configuration (tree + table)​**​. The table model supports ​**​standard SQL queries​**​, diverse functions/operators, stream processing, and Benchmarking. Python client adds four new data types, and script tools support TsFile/CSV/SQL import/export. Key updates:

* ​**​Time-Series Table Model:​**​
  * Standard SQL: SELECT, WHERE, JOIN, GROUP BY, ORDER BY, LIMIT, nested queries
* ​**​Query Module:​**​
  * Logical operators, math functions, time-series functions (e.g., DIFF)
  * Configurable URI-based JAR loading
* ​**​Storage Module:​**​
  * Session API writes with auto-metadata creation
  * Python client supports: String, Blob, Date, Timestamp
  * Optimized compaction task priority
* ​**​Stream Processing:​**​
  * Auth info specification on sender side
  * TsFile Load for table model
  * Plugin adaptation for table model
* ​**​System Module:​**​
  * Enhanced DataNode downsizing stability
  * Supports DROP DATABASE in read-only mode
* ​**​Scripts & Tools:​**​
  * Benchmark adapted for table model
  * Support for String/Blob/Date/Timestamp in Benchmark
  * import-data/export-data: Universal support for TsFile/CSV/SQL
* ​**​Ecosystem Integration:​**​
  * Kubernetes Operator support


### V1.3.5.11

> Release Date: 2025.09.24</br>
> Download Link: Please contact Timecho Team to obtain the download link</br>
> Installation Package Name: iotdb-enterprise-1.3.5.11-bin.zip</br>
> SHA512 Checksum: f18419e20c0d7e9316febee5a053306a97268cb07e18e6933716c2ef98520fbbe051dfa1da02a9c83e8481a839ce35525ce6c50f890f821e3d760f550c75f804

V1.3.5.11 version primarily optimizes the data synchronization function, fixes certain product defects, and includes comprehensive enhancements to database monitoring, performance, and stability.

### V1.3.5.10

> Release Date: 2025.08.27</br>
> Download Link: Please contact Timecho Team to obtain the download link</br>
> Installation Package Name: iotdb-enterprise-1.3.5.10-bin.zip</br>
> SHA512 Checksum: 3aea6d2318f52b39bfb86dae9ff06fe1b719fdeceaabb39278c9a73544e1ceaf0660339f9342abb888c8281a0fb6144179dac9bb0c40ba0ecc66bac4dd7cbe80

V1.3.5.10 version fixes certain product defects and includes comprehensive enhancements to database monitoring, performance, and stability.

### V1.3.5.9

> Release Date: 2025.08.25</br>
> Download Link: Please contact Timecho Team to obtain the download link</br>
> Installation Package Name: iotdb-enterprise-1.3.5.9-bin.zip</br>
> SHA512 Checksum: 95b7a6790e94dc88e355a81e5a54b10ee87bdadae69ba0b215273967b3422178d5ee81fa5adf1c5380a67dbb30cf9782eaa3cbfd6ec744b0fd9a91c983ee8f70

V1.3.5.9 version optimizes memory control, fixes certain product defects, and includes comprehensive enhancements to database monitoring, performance, and stability.

### 1.x Other historical versions

#### V1.3.5.8

> Release Date: 2025.08.19</br>
> Download Link: Please contact Timecho Team to obtain the download link</br>
> Installation Package Name: iotdb-enterprise-1.3.5.8-bin.zip</br>
> SHA512 Checksum: aa9802301614e20294a7f2fc4c149ba20d58213d9b74e8f8c607e0f4860949bad164bce2851b63c1d39b7568d62975ab257c269b3a9c168a29ea3945b6d28982

V1.3.5.8 version optimizes the data synchronization function, fixes certain product defects, and includes comprehensive enhancements to database monitoring, performance, and stability.

#### V1.3.5.7

> Release Date: 2025.08.13</br>
> Download Link: Please contact Timecho Team to obtain the download link</br>
> Installation Package Name: iotdb-enterprise-1.3.5.7-bin.zip</br>
> SHA512 Checksum: 17374a440267aed3507dcc8cf4dc8703f8136d5af30d16206a6e1101e378cbbc50eda340b1598a12df35fe87d96db20f7802f0e64033a013d4b81499198663d4

V1.3.5.7 version optimizes the data synchronization function, fixes certain product defects, and includes comprehensive enhancements to database monitoring, performance, and stability.

#### V1.3.5.6

> Release Date: 2025.07.16</br>
> Download Link: Please contact Timecho Team to obtain the download link</br>
> Installation Package Name: iotdb-enterprise-1.3.5.6-bin.zip</br>
> SHA512 Checksum: 05b9fda4d98ba8a1c9313c0831362ed3d667ce07cb00acaeabcf6441a6d67dff7da27f3fda2a5e1b3c3b85d1e5c730a534f3aa2f0c731b8c03ef447203b32493

V1.3.5.6 introduces a new configuration switch to disable the data subscription feature. It optimizes the C++ high-availability client and addresses PIPE synchronization latency issues in normal operation, restart, and deletion scenarios, along with query performance for large TEXT objects. Comprehensive enhancements to database monitoring, performance, and stability are also included.

#### V1.3.5.4

> Release Date: 2025.06.19</br>
> Download Link: Please contact Timecho Team to obtain the download link</br>
> Installation Package Name: iotdb-enterprise-1.3.5.4-bin.zip</br>
> SHA512 Checksum: edac5f8b70dd67b3f84d3e693dc025a10b41565143afa15fc0c4937f8207479ffe2da787cc9384440262b1b05748c23411373c08606c6e354ea3dcdba0371778

V1.3.5.4 fixes several product defects and optimizes the node removal functionality. It also delivers comprehensive improvements to database monitoring, performance, and stability.

#### V1.3.5.3

> Release Date: 2025.06.13</br>
> Download Link: Please contact Timecho Team to obtain the download link</br>
> Installation Package Name: iotdb-enterprise-1.3.5.3-bin.zip</br>
> SHA512 Checksum: 5f807322ceec9e63a6be86108cc57e7ad4251b99a6c28baf11256ab65b2145768e9110409f89834d5f4256094a8ad995775c0e59a17224ff2627cd9354e09d82

V1.3.5.3 focuses on optimizing data synchronization capabilities, including persisting PIPE transmission progress and adding monitoring metrics for PIPE event transfer time. Related defects have been resolved. Additionally, the encryption algorithm for user passwords has been upgraded to SHA-256. Comprehensive enhancements to database monitoring, performance, and stability are included.

#### V1.3.5.2

> Release Date: 2015.06.10</br>
> Download Link: Please contact Timecho Team to obtain the download link</br>
> Installation Package Name: iotdb-enterprise-1.3.5.2-bin.zip</br>
> SHA512 Checksum: 4c0a5db76c6045dfd27cce303546155cdb402318024dae5f999f596000d7b038b13bbeac39068331b5c6e2c80bc1d89cd346dd0be566fe2fe865007d441d9d05

V1.3.5.2 primarily optimizes data synchronization features, adding support for cascading configurations via parameters and ensuring fully consistent ordering between synchronized and real-time writes. It also enables partitioned sending of historical and real-time data after system restarts. Comprehensive enhancements to database monitoring, performance, and stability are included.

#### V1.3.5.1

> Release Date: 2025.05.15</br>
> Download Link: Please contact Timecho Team to obtain the download link</br>
> Installation Package Name: iotdb-enterprise-1.3.5.1-bin.zip</br>
> SHA512 Checksum: 91f22bafbdd4d580126ed59ba1ba99d14209f10ce4a0a4bd7d731943ac99fdb6ebfab6e3a1e294a7cb7f46367e9fd4252b0d9ac4d4240ddedf6d85658e48f212

V1.3.5.1 resolves several product defects and delivers comprehensive improvements to database monitoring, performance, and stability.

#### V1.3.4.2

> Release Date: 2025.04.14</br>
> Download Link: Please contact Timecho Team to obtain the download link</br>
> Installation Package Name: iotdb-enterprise-1.3.4.2-bin.zip</br>
> SHA512 Checksum: 52fbd79f5e7256e7d04edc8f640bb8d918e837fedd1e64642beb2b2b25e3525b5f5a4c92235f88f6f7b59bfcdf096e4ea52ab85bfef0b69274334470017a2c5b

V1.3.4.2 enhances the data synchronization function by supporting bi-directional active-active synchronization of data forwarded through external PIPE sources.

#### V1.3.4.1

> Release Date: 2025.01.08</br>
> Download Link: Please contact Timecho Team to obtain the download link</br>
> Installation Package Name: iotdb-enterprise-1.3.4.1-bin.zip</br>
> SHA512 Checksum: e9d46516f1f25732a93cc915041a8e59bca77cf8a1018c89d18ed29598540c9f2bdf1ffae9029c87425cecd9ecb5ebebea0334c7e23af11e28d78621d4a78148

V1.3.4.1 introduces pattern matching functions, continuously optimizes the data subscription mechanism, improves stability, and extends import-data/export-data scripts to support new data types while unifying TsFile, CSV and SQL import/export formats. Comprehensive improvements have been made to database monitoring, performance and stability. Key updates:

* Query Module: Configurable URI-based JAR loading for UDFs, PipePlugins, Triggers and AINodes
* System Module: Extended UDF functionality with new pattern\_match function
* Data Sync: Supports specifying authentication info at sender
* Ecosystem: Kubernetes Operator support
* Scripts: import-data/export-data now supports strings, BLOBs, dates and timestamps
* Scripts: Unified import/export support for TsFile, CSV and SQL formats

#### V1.3.3.3

> Release Date: 2024.10.31</br>
> Download Link: Please contact Timecho Team to obtain the download link</br>
> Installation Package Name: iotdb-enterprise-1.3.3.3-bin.zip</br>
> SHA512 Checksum: 4a3eceda479db3980e9c8058628e71ba5a16fbfccf70894e8181aea5e014c7b89988d0093f6d42df29d478340a33878602a3924bec13f442a48611cec4e0e961

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

#### V1.3.3.2

> Release Date: 2024.08.15</br>
> Download Link: Please contact Timecho Team to obtain the download link</br>
> Installation Package Name: iotdb-enterprise-1.3.3.2-bin.zip</br>
> SHA512 Checksum: 32733610da40aa965e5e9263a869d6e315c5673feaefad43b61749afcf534926398209d9ca7fff866c09deb92c09d950c583cea84be5a6aa2c315e1c7e8cfb74 

V1.3.3.2 adds metrics for mods file reading time, merge sort memory usage and dispatch latency, supports configurable time partition origin adjustment, enables automatic subscription termination based on pipe completion markers, and improves merge memory control. Key updates:

* Query: Explain Analyze shows mods file read time
* Query: Explain Analyze shows merge sort memory and dispatch latency
* Storage: Added configurable file splitting during compaction
* System: Configurable time partition origin
* Stream Processing: Auto-terminate subscriptions on pipe completion markers
* Data Sync: Configurable RPC compression levels
* Scripts: Export filters only root.\_\_system paths

#### V1.3.3.1

> Release Date: 2024.07.12</br>
> Download Link: Please contact Timecho Team to obtain the download link</br>
> Installation Package Name: iotdb-enterprise-1.3.3.1-bin.zip</br>
> SHA512 Checksum: 1fdffbc1f18bfabfa3463a5a6fbc4f6ba6ab686942f9e85e7e6be1840fb8700e0147e5e73fd52201656ae6adb572cc2e5ecc61bcad6fa4c5a4048c4207e3c6c0

V1.3.3.1 adds tiered storage throttling, supports username/password auth specification at sync senders, optimizes ambiguous WARN logs at receivers, improves restart performance, and merges configuration files. Key updates:

* Query: Optimized Filter performance for faster aggregation/WHERE queries
* Query: Java Session evenly distributes SQL requests across nodes
* System: Merged config files into iotdb-system.properties
* Storage: Added tiered storage throttling
* Data Sync: Username/password auth specification at senders
* System: Optimized restart recovery time

#### V1.3.2.2

> Release Date: 2024.06.04</br>
> Download Link: Please contact Timecho Team to obtain the download link</br>
> Installation Package Name: iotdb-enterprise-1.3.2.2-bin.zip</br>
> SHA512 Checksum: ad73212a0b5025d18d2481163f6b2d4f604e06eb5e391cc6cba7bf4e42792e115b527ed8bfb5cd95d20a150645c8b4d56a531889dac229ce0f63139a27267322

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

#### V1.3.1.4

> Release Date: 2024.04.23</br>
> Download Link: Please contact Timecho Team to obtain the download link</br>
> Installation Package Name: iotdb-enterprise-1.3.1.4-bin.zip</br>
> SHA512 Checksum: 8547702061d52e2707c750a624730eb2d9b605b60661efa3c8f11611ca1685aeb51b6f8a93f94c1b30bf2e8764139489c9fbb76cf598cfa8bf9c874b2a7c57eb

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

#### V1.3.0.4

> Release Date: 2024.01.03</br>
> Download Link: Please contact Timecho Team to obtain the download link</br>
> Installation Package Name: iotdb-enterprise-1.3.0.4-bin.zip</br>
> SHA512 Checksum: 3c07798f37c07e776e5cd24f758e8aaa563a2aae0fb820dad5ebf565ad8a76c765b896d44e7fdb7dad2e46ffd4262af901c765f9bf6af926bc62103118e38951

V1.3.0.4 introduces the AINode machine learning framework, upgrades permission granularity to time-series level, and optimizes views/stream processing for better usability and stability. Key updates:

* Query: New AINode ML framework
* Query: Fixed slow SHOW PATH responses
* Security: Time-series granular permissions
* Security: SSL client-server encryption
* Stream Processing: New metrics monitoring
* Query: LAST queries on non-writable views
* System: Improved data point counting accuracy

#### V1.2.0.1

> Release Date: 2023.06.30</br>
> Download Link: Please contact Timecho Team to obtain the download link</br>
> Installation Package Name: iotdb-enterprise-1.2.0.1-bin.zip</br>
> SHA512 Checksum: dcf910d0c047d148a6c52fa9ee03a4d6bc3ff2a102dc31c0864695a25268ae933a274b093e5f3121689063544d7c6b3b635e5e87ae6408072e8705b3c4e20bf0

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

#### V1.1.0.1

> Release Date: 2023.04.03</br>
> Download Link: Please contact Timecho Team to obtain the download link</br>
> Installation Package Name: iotdb-enterprise-1.1.0.1.zip</br>
> SHA512 Checksum: 58df58fc8b11afeec8436678842210ec092ac32f6308656d5356b7819acc199f1aec4b531635976b091b61d6736f0d9706badcabeaa5de50939e5c331c1dc804

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

## 2. Workbench (Console Tool)

| **Version**     | **Description**                                                 | **Supported IoTDB Versions**            | **SHA512 checksum**                                              |
| ----------- | ------------------------------------------------------------ | ----------------------------------- | ------------------------------------------------------------ |
| V2.1.1      | Optimize the measuring point selection on the trend interface to support scenarios without devices | V2.0 and above                      | aa05fd4d9f33f07c0949bc2d6546bb4b9791ed5ea94bcef27e2bf51ea141ec0206f1c12466aced7bf3449e11ad68d65378d697f3d10cb4881024a83746029a65 |
| V2.0.1-beta | The first version of the V2.x series, supporting dual models of tree and table | V2.0 and above                      | 0ca0d5029874ed8ada9c7d1cb562370b3a46913eed66d39c08759287ccc8bf332cf80bb8861e788614b61ae5d53a9f5605f553e1a607e856f395eb5102e7cc4d |
| V1.5.7      | Optimize the point list by splitting point names into device names and points, ensure the point selection area supports horizontal scrolling, and align the export file column order with the page display. | All 1.x versions from V1.3.4 onward | d3cd4a63372ca5d6217b67dddf661980c6a442b3b1564235e9ad34fc254d681febd58c2cc59c6273ffbfd8a1b003b9adb130ecfaaebe1942003b0d07427b1fcc |
| V1.5.6      | Enhanced CSV import/export: optional tags/aliases on import; support for measurement descriptions with backtick-quoted quotes on export. | All 1.x versions from V1.3.4 onward | 276ac1ea341f468bf6d29489c9109e9aa61afe2d1caaab577bc40603c6f4120efccc36b65a58a29ce6a266c21b46837aad6128f84ba5e676231ea9e6284a35e5 |
| V1.5.5      | Added server clock functionality and support for activating Enterprise Edition license databases | All 1.x versions from V1.3.4 onward | b18d01b70908d503a25866d1cc69d14e024d5b10ca6fcc536932fdbef8257c66e53204663ce3be5548479911aca238645be79dfd7ee7e65a07ab3c0f68c497f6 |
| V1.5.4      | Added authentication for Prometheus settings in Instance Management | All 1.x versions from V1.3.4 onward | adc7e13576913f9e43a9671fed02911983888da57be98ec8fbbb2593600d310f69619d32b22b569520c88e29f100d7ccae995b20eba757dbb1b2825655719335 |
| V1.5.1      | Added AI analysis and pattern matching                       | All 1.x versions from V1.3.2 onward | 4f2053a2a3b2b255ce195268d6cd245278f3be32ba4cf68be1552c386d78ed4424f7bdc9d8e68c6b8260b3e398c8fd23ff342439c4e88e1e777c62640d2279f9 |
| V1.4.0      | Added tree model display and English UI                      | All 1.x versions from V1.3.2 onward | 734077f3bb5e1719d20b319d8b554ce30718c935cb0451e02b2c9267ff770e9c2d63b958222f314f16c2e6e62bf78b643255249b574ee6f37d00e123433981e8 |
| V1.3.1      | Enhanced analysis methods and import templates               | All 1.x versions from V1.3.2 onward | 134f87101cc7f159f8a22ac976ad2a3a295c5435058ee0a15160892aac46ac61dd3cfb0633b4aea9cc7415bf904d0ae65aaf77d663f027d864204d81fb34768b |
| V1.3.0      | Added DB configuration and UI refinements                    | All 1.x versions from V1.3.2 onward | 94a137fc5c681b211f3e076472a9c5875d59e7f0cd6d7409cb8f66bb9e4f87577a0f12dd500e2bcb99a435860c82183e4a6514b638bcb4aecfb48f184730f3f1 |
| V1.2.6      | Optimized permission controls                                | All 1.x versions from V1.3.1 onward | f345b7edcbe245a561cb94ec2e4f4d40731fe205f134acadf5e391e5874c5c2477d9f75f15dbaf36c3a7cb6506823ac6fbc2a0ccce484b7c4cc71ec0fbdd9901 |
| V1.2.5      | Added "Common Templates" and caching                         | All 1.x versions from V1.3.0 onward | 37376b6cfbef7df8496e255fc33627de01bd68f636e50b573ed3940906b6f3da1e8e8b25260262293b8589718f5a72180fa15e5823437bf6dc51ed7da0c583f7 |
| V1.2.4      | Added import/export for calculations, time alignment field   | All 1.x versions from V1.2.2 onward | 061ad1add38c109c1a90b06f1ddb7797bd45e84a34a4f77154ee48b90bdc7ecccc1e25eaa53fbbc98170d99facca93e3536192dd8d10a50ce505f59923ce6186 |
| V1.2.3      | Added activation details and analysis features               | All 1.x versions from V1.2.2 onward | 254f5b7451300f6f99937d27fd7a5b20847d5293f53e0eaf045ac9235c7ea011785716b800014645ed5d2161078b37e1d04f3c59589c976614fb801c4da982e1 |
| V1.2.2      | Optimized point description display                          | All 1.x versions from V1.2.2 onward | 062e520d010082be852d6db0e2a3aa6de594eb26aeb608da28a212726e378cd4ea30fca5e1d2c3231ebd8de29e94ca9641f1fabc1cea46acfb650c37b7681b4e |
| V1.2.1      | Added sync monitoring panel, Prometheus hints                | All 1.x versions from V1.2.2 onward | 8a3bcf87982ad5004528829b121f2d3945429deb77069917a42a8c8d2e2e2a2c24a398aaa87003920eeacc0c692f1ed39eac52a696887aa085cce011f0ddd745 |
| V1.2.0      | Major Workbench upgrade                                      | All 1.x versions from V1.2.0 onward | ea1f7d3a4c0c6476a195479e69bbd3b3a2da08b5b2bb70b0a4aba988a28b5db5a209d4e2c697eb8095dfdf130e29f61f2ddf58c5b51d002c8d4c65cfc13106b3 |