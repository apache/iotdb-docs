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

Data synchronization is a typical requirement in the Industrial Internet of Things (IIoT). Through data synchronization mechanisms, data sharing between IoTDB instances can be achieved, enabling the establishment of a complete data pipeline to meet needs such as internal and external network data exchange, edge-to-cloud synchronization, data migration, and data backup.

# Functional Overview

## Data Synchronization

A data synchronization task consists of three stages:

![](/img/en_dataSync01.png)

- Source Stage: This stage is used to extract data from the source IoTDB, defined in the `source` section of the SQL statement.
- Process Stage: This stage is used to process the data extracted from the source IoTDB, defined in the `processor` section of the SQL statement.
- Sink Stage: This stage is used to send data to the target IoTDB, defined in the `sink` section of the SQL statement.

By declaratively configuring these three parts in an SQL statement, flexible data synchronization capabilities can be achieved.

## Functional Limitations and Notes

- Supports data synchronization from IoTDB version 1.x series to version 2.x and later.
- Does not support data synchronization from IoTDB version 2.x series to version 1.x series.
- When performing data synchronization tasks, avoid executing any deletion operations to prevent inconsistencies between the two ends.

# Usage Instructions

A data synchronization task can be in one of three states: RUNNING, STOPPED, and DROPPED. The state transitions of the task are illustrated in the diagram below:

![](/img/Data-Sync02.png)

After creation, the task will start directly. Additionally, if the task stops due to an exception, the system will automatically attempt to restart it.

We provide the following SQL statements for managing the state of synchronization tasks.

## Create a Task

Use the `CREATE PIPE` statement to create a data synchronization task. Among the following attributes, `PipeId` and `sink` are required, while `source` and `processor` are optional. Note that the order of the `SOURCE` and `SINK` plugins cannot be swapped when writing the SQL.

SQL Example:

```SQL
CREATE PIPE [IF NOT EXISTS] <PipeId> -- PipeId is a unique name identifying the task
-- Data extraction plugin (optional)
WITH SOURCE (
  [<parameter> = <value>,],
)
-- Data processing plugin (optional)
WITH PROCESSOR (
  [<parameter> = <value>,],
)
-- Data transmission plugin (required)
WITH SINK (
  [<parameter> = <value>,],
)
```

**IF NOT EXISTS Semantics**: Ensures that the creation command is executed only if the specified Pipe does not exist, preventing errors caused by attempting to create an already existing Pipe.

## Start a Task

After creation, the task directly enters the RUNNING state and does not require manual startup. However, if the task is stopped using the `STOP PIPE` statement, you need to manually start it using the `START PIPE` statement. If the task stops due to an exception, it will automatically restart to resume data processing:

```SQL
START PIPE<PipeId>
```

## Stop a Task

To stop data processing:

```SQL
STOP PIPE <PipeId>
```

## Delete a Task

To delete a specified task:

```SQL
DROP PIPE [IF EXISTS] <PipeId>
```

**IF EXISTS Semantics**: Ensures that the deletion command is executed only if the specified Pipe exists, preventing errors caused by attempting to delete a non-existent Pipe. **Note**: Deleting a task does not require stopping the synchronization task first.

## View Tasks

To view all tasks:

```SQL
SHOW PIPES
```

To view a specific task:

```SQL
SHOW PIPE <PipeId>
```

Example Output of `SHOW PIPES`:

```SQL
+--------------------------------+-----------------------+-------+----------+-------------+-----------------------------------------------------------+----------------+-------------------+-------------------------+
|                              ID|           CreationTime|  State|PipeSource|PipeProcessor|                                                   PipeSink|ExceptionMessage|RemainingEventCount|EstimatedRemainingSeconds|
+--------------------------------+-----------------------+-------+----------+-------------+-----------------------------------------------------------+----------------+-------------------+-------------------------+
|59abf95db892428b9d01c5fa318014ea|2024-06-17T14:03:44.189|RUNNING|        {}|           {}|{sink=iotdb-thrift-sink, sink.ip=127.0.0.1, sink.port=6668}|                |                128|                     1.03|
+--------------------------------+-----------------------+-------+----------+-------------+-----------------------------------------------------------+----------------+-------------------+-------------------------+
```

**Column Descriptions**:

- **ID**: Unique identifier of the synchronization task.
- **CreationTime**: Time when the task was created.
- **State**: Current state of the task.
- **PipeSource**: Source of the data stream.
- **PipeProcessor**: Processing logic applied during data transmission.
- **PipeSink**: Destination of the data stream.
- **ExceptionMessage**: Displays exception information for the task.
- **RemainingEventCount** (statistics may have delays): Number of remaining events, including data and metadata synchronization events, as well as system and user-defined events.
- **EstimatedRemainingSeconds** (statistics may have delays): Estimated remaining time to complete the transmission based on the current event count and pipe processing rate.

## Synchronization Plugins

To make the architecture more flexible and adaptable to different synchronization scenarios, IoTDB supports plugin assembly in the synchronization task framework. The system provides some common pre-installed plugins, and you can also customize `processor` and `sink` plugins and load them into the IoTDB system.

To view the plugins available in the system (including custom and built-in plugins), use the following statement:

```SQL
SHOW PIPEPLUGINS
```

Example Output:

```SQL
IoTDB> SHOW PIPEPLUGINS
+------------------------------+----------+--------------------------------------------------------------------------------------------------+----------------------------------------------------+
|                    PluginName|PluginType|                                                                                         ClassName|                                           PluginJar|
+------------------------------+----------+--------------------------------------------------------------------------------------------------+----------------------------------------------------+
|          DO-NOTHING-PROCESSOR|   Builtin|               org.apache.iotdb.commons.pipe.plugin.builtin.processor.donothing.DoNothingProcessor|                                                    |
|               DO-NOTHING-SINK|   Builtin|               org.apache.iotdb.commons.pipe.plugin.builtin.connector.donothing.DoNothingConnector|                                                    |
|            IOTDB-AIR-GAP-SINK|   Builtin|          org.apache.iotdb.commons.pipe.plugin.builtin.connector.iotdb.airgap.IoTDBAirGapConnector|                                                    |
|                  IOTDB-SOURCE|   Builtin|                       org.apache.iotdb.commons.pipe.plugin.builtin.extractor.iotdb.IoTDBExtractor|                                                    |
|             IOTDB-THRIFT-SINK|   Builtin|          org.apache.iotdb.commons.pipe.plugin.builtin.connector.iotdb.thrift.IoTDBThriftConnector|                                                    |
|         IOTDB-THRIFT-SSL-SINK|   Builtin|       org.apache.iotdb.commons.pipe.plugin.builtin.connector.iotdb.thrift.IoTDBThriftSslConnector|                                                    |
+------------------------------+----------+--------------------------------------------------------------------------------------------------+----------------------------------------------------+
```

Detailed introduction of pre-installed plugins is as follows (for detailed parameters of each plugin, please refer to the [Parameter Description](../Reference/System-Config-Manual.md) section):

| **Type**                | **Custom Plugin**                                            | **Plugin Name**        | **Description**                                              |
| :---------------------- | :----------------------------------------------------------- | :--------------------- | :----------------------------------------------------------- |
| Source Plugin           | Not Supported                                                | `iotdb-source`         | Default extractor plugin for extracting historical or real-time data from IoTDB. |
| Processor Plugin        | Supported                                                    | `do-nothing-processor` | Default processor plugin that does not process incoming data. |
| Sink Plugin             | Supported                                                    | `do-nothing-sink`      | Does not process outgoing data.                              |
| `iotdb-thrift-sink`     | Default sink plugin for data transmission between IoTDB instances (V2.0.0+). Uses Thrift RPC framework with a multi-threaded async non-blocking IO model, ideal for distributed target scenarios. |                        |                                                              |
| `iotdb-air-gap-sink`    | Used for cross-unidirectional data gate synchronization between IoTDB instances (V2.0.0+). Supports gate models like NARI Syskeeper 2000. |                        |                                                              |
| `iotdb-thrift-ssl-sink` | Used for data transmission between IoTDB instances (V2.0.0+). Uses Thrift RPC framework with a multi-threaded sync blocking IO model, suitable for high-security scenarios. |                        |                                                              |

# Usage Examples

## Full Data Synchronization

This example demonstrates synchronizing all data from one IoTDB to another. The data pipeline is shown below:

![](/img/e1.png)

In this example, we create a synchronization task named `A2B` to synchronize all data from IoTDB A to IoTDB B. The `iotdb-thrift-sink` plugin (built-in) is used, and the `node-urls` parameter is configured with the URL of the DataNode service port on the target IoTDB.

SQL Example:

```SQL
CREATE PIPE A2B
WITH SINK (
  'sink' = 'iotdb-thrift-sink',
  'node-urls' = '127.0.0.1:6668' -- URL of the DataNode service port on the target IoTDB
)
```

## Partial Data Synchronization

This example demonstrates synchronizing data within a specific historical time range (from August 23, 2023, 8:00 to October 23, 2023, 8:00) to another IoTDB. The data pipeline is shown below:

![](/img/e2.png)

In this example, we create a synchronization task named `A2B`. First, we define the data range in the `source` configuration. Since we are synchronizing historical data (data that existed before the task was created), we need to configure the start time (`start-time`), end time (`end-time`), and the streaming mode (`mode.streaming`). The `node-urls` parameter is configured with the URL of the DataNode service port on the target IoTDB.

SQL Example:

```SQL
CREATE PIPE A2B
WITH SOURCE (
  'source' = 'iotdb-source',
  'mode.streaming' = 'true'  -- Extraction mode for newly inserted data (after the pipe is created): 
                             -- Whether to extract data in streaming mode (if set to false, batch mode is used).
  'start-time' = '2023.08.23T08:00:00+00:00',  -- The event time at which data synchronization starts (inclusive).
  'end-time' = '2023.10.23T08:00:00+00:00'  -- The event time at which data synchronization ends (inclusive).
) 
WITH SINK (
  'sink' = 'iotdb-thrift-async-sink',
  'node-urls' = '127.0.0.1:6668'  -- The URL of the DataNode's data service port in the target IoTDB instance.
)
```

## Bidirectional Data Transmission

This example demonstrates a scenario where two IoTDB instances act as dual-active systems. The data pipeline is shown below:

![](/img/e3.png)

To avoid infinite data loops, the `source.mode.double-living` parameter must be set to `true` on both IoTDB A and B, indicating that data forwarded from another pipe will not be retransmitted.

SQL Example: On IoTDB A:

```SQL
CREATE PIPE AB
WITH SOURCE (
  'source.mode.double-living' = 'true'  -- Do not forward data from other pipes
)
WITH SINK (
  'sink' = 'iotdb-thrift-sink',
  'node-urls' = '127.0.0.1:6668' -- URL of the DataNode service port on the target IoTDB
)
```

On IoTDB B:

```SQL
CREATE PIPE BA
WITH SOURCE (
  'source.mode.double-living' = 'true'  -- Do not forward data from other pipes
)
WITH SINK (
  'sink' = 'iotdb-thrift-sink',
  'node-urls' = '127.0.0.1:6667' -- URL of the DataNode service port on the target IoTDB
)
```

## Edge-to-Cloud Data Transmission

This example demonstrates synchronizing data from multiple IoTDB clusters (B, C, D) to a central IoTDB cluster (A). The data pipeline is shown below:

![](/img/sync_en_03.png)

To synchronize data from clusters B, C, and D to cluster A, the `database-name` and `table-name` parameters are used to restrict the data range.

SQL Example: On IoTDB B:

```SQL
CREATE PIPE BA
WITH SOURCE (
  'database-name' = 'db_b.*',  -- Restrict the database scope
  'table-name' = '.*'          -- Match all tables
)
WITH SINK (
  'sink' = 'iotdb-thrift-sink',
  'node-urls' = '127.0.0.1:6667' -- URL of the DataNode service port on the target IoTDB
)
```

On IoTDB C ：

```SQL
CREATE PIPE CA
WITH SOURCE (
  'database-name' = 'db_c.*',  -- Restrict the database scope
  'table-name' = '.*'          -- Match all tables
)
WITH SINK (
  'sink' = 'iotdb-thrift-sink',
  'node-urls' = '127.0.0.1:6668' -- URL of the DataNode service port on the target IoTDB
)
```

On IoTDB D：

```SQL
CREATE PIPE DA
WITH SOURCE (
  'database-name' = 'db_d.*',  -- Restrict the database scope
  'table-name' = '.*'          -- Match all tables
)
WITH SINK (
  'sink' = 'iotdb-thrift-sink',
  'node-urls' = '127.0.0.1:6669' -- URL of the DataNode service port on the target IoTDB
)
```

## Cascaded Data Transmission

This example demonstrates cascading data transmission from IoTDB A to IoTDB B and then to IoTDB C. The data pipeline is shown below:

![](/img/sync_en_04.png)

To synchronize data from cluster A to cluster C, the `source.mode.double-living` parameter is set to `true` in the pipe between B and C.

SQL Example: On IoTDB A:

```SQL
CREATE PIPE AB
WITH SINK (
  'sink' = 'iotdb-thrift-sink',
  'node-urls' = '127.0.0.1:6668' -- URL of the DataNode service port on the target IoTDB
)
```

On IoTDB B:

```SQL
CREATE PIPE BC
WITH SOURCE (
  'source.mode.double-living' = 'true'  -- Do not forward data from other pipes
)
WITH SINK (
  'sink' = 'iotdb-thrift-sink',
  'node-urls' = '127.0.0.1:6669' -- URL of the DataNode service port on the target IoTDB
)
```

## Air-Gapped Data Transmission

This example demonstrates synchronizing data from one IoTDB to another through a unidirectional air gap. The data pipeline is shown below:

![](/img/e5.png)

In this example, the `iotdb-air-gap-sink` plugin is used (currently supports specific air gap models; contact Timecho team for details). After configuring the air gap, execute the following statement on IoTDB A, where `node-urls` is the URL of the DataNode service port on the target IoTDB.

SQL Example:

```SQL
CREATE PIPE A2B
WITH SINK (
  'sink' = 'iotdb-air-gap-sink',
  'node-urls' = '10.53.53.53:9780' -- URL of the DataNode service port on the target IoTDB
)
```

## Compressed Synchronization

IoTDB supports specifying data compression methods during synchronization. The `compressor` parameter can be configured to enable real-time data compression and transmission. Supported algorithms include `snappy`, `gzip`, `lz4`, `zstd`, and `lzma2`. Multiple algorithms can be combined and applied in the configured order. The `rate-limit-bytes-per-second` parameter (supported in V1.3.3 and later) limits the maximum number of bytes transmitted per second (calculated after compression). If set to a value less than 0, there is no limit.

**SQL Example**:

```SQL
CREATE PIPE A2B
WITH SINK (
  'node-urls' = '127.0.0.1:6668', -- URL of the DataNode service port on the target IoTDB
  'compressor' = 'snappy,lz4',    -- Compression algorithms
  'rate-limit-bytes-per-second' = '1048576'  -- Maximum bytes allowed per second
)
```

## Encrypted Synchronization

IoTDB supports SSL encryption during synchronization to securely transmit data between IoTDB instances. By configuring SSL-related parameters such as the certificate path (`ssl.trust-store-path`) and password (`ssl.trust-store-pwd`), data can be protected by SSL encryption during synchronization.

**SQL Example**:

```SQL
CREATE PIPE A2B
WITH SINK (
  'sink' = 'iotdb-thrift-ssl-sink',
  'node-urls' = '127.0.0.1:6667',  -- URL of the DataNode service port on the target IoTDB
  'ssl.trust-store-path' = 'pki/trusted',  -- Path to the trust store certificate
  'ssl.trust-store-pwd' = 'root'           -- Password for the trust store certificate
)
```

# Reference: Notes

You can adjust the parameters for data synchronization by modifying the IoTDB configuration file (`iotdb-system.properties`), such as the directory for storing synchronized data. The complete configuration is as follows:

```Properties
# pipe_receiver_file_dir
# If this property is unset, system will save the data in the default relative path directory under the IoTDB folder(i.e., %IOTDB_HOME%/${cn_system_dir}/pipe/receiver).
# If it is absolute, system will save the data in the exact location it points to.
# If it is relative, system will save the data in the relative path directory it indicates under the IoTDB folder.
# Note: If pipe_receiver_file_dir is assigned an empty string(i.e.,zero-size), it will be handled as a relative path.
# effectiveMode: restart
# For windows platform
# If its prefix is a drive specifier followed by "\\", or if its prefix is "\\\\", then the path is absolute. Otherwise, it is relative.
# pipe_receiver_file_dir=data\\confignode\\system\\pipe\\receiver
# For Linux platform
# If its prefix is "/", then the path is absolute. Otherwise, it is relative.
pipe_receiver_file_dir=data/confignode/system/pipe/receiver

####################
### Pipe Configuration
####################

# Uncomment the following field to configure the pipe lib directory.
# effectiveMode: first_start
# For Windows platform
# If its prefix is a drive specifier followed by "\\", or if its prefix is "\\\\", then the path is
# absolute. Otherwise, it is relative.
# pipe_lib_dir=ext\\pipe
# For Linux platform
# If its prefix is "/", then the path is absolute. Otherwise, it is relative.
pipe_lib_dir=ext/pipe

# The maximum number of threads that can be used to execute the pipe subtasks in PipeSubtaskExecutor.
# The actual value will be min(pipe_subtask_executor_max_thread_num, max(1, CPU core number / 2)).
# effectiveMode: restart
# Datatype: int
pipe_subtask_executor_max_thread_num=5

# The connection timeout (in milliseconds) for the thrift client.
# effectiveMode: restart
# Datatype: int
pipe_sink_timeout_ms=900000

# The maximum number of selectors that can be used in the sink.
# Recommend to set this value to less than or equal to pipe_sink_max_client_number.
# effectiveMode: restart
# Datatype: int
pipe_sink_selector_number=4

# The maximum number of clients that can be used in the sink.
# effectiveMode: restart
# Datatype: int
pipe_sink_max_client_number=16

# Whether to enable receiving pipe data through air gap.
# The receiver can only return 0 or 1 in tcp mode to indicate whether the data is received successfully.
# effectiveMode: restart
# Datatype: Boolean
pipe_air_gap_receiver_enabled=false

# The port for the server to receive pipe data through air gap.
# Datatype: int
# effectiveMode: restart
pipe_air_gap_receiver_port=9780

# The total bytes that all pipe sinks can transfer per second.
# When given a value less than or equal to 0, it means no limit.
# default value is -1, which means no limit.
# effectiveMode: hot_reload
# Datatype: double
pipe_all_sinks_rate_limit_bytes_per_second=-1
```

# Reference: Parameter Description

## S**ource**  **p****arameter****s**

| **Parameter**            | **Description**                                              | **Value Range**                                              | **Required** | **Default Value**                                           |
| :----------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- | :----------- | :---------------------------------------------------------- |
| source                   | iotdb-source                                                 | String: iotdb-source                                         | Yes          | -                                                           |
| mode.streaming           | This parameter specifies the source of time-series data capture. It applies to scenarios where `mode.streaming` is set to `false`, determining the capture source for `data.insert` in `inclusion`. Two capture strategies are available:  - **true**: Dynamically selects the capture type. The system adapts to downstream processing speed, choosing between capturing each write request or only capturing TsFile file sealing requests. When downstream processing is fast, write requests are prioritized to reduce latency; when processing is slow, only file sealing requests are captured to prevent processing backlogs. This mode suits most scenarios, optimizing the balance between processing latency and throughput.  - **false**: Uses a fixed batch capture approach, capturing only TsFile file sealing requests. This mode is suitable for resource-constrained applications, reducing system load.  **Note**: Snapshot data captured when the pipe starts will only be provided for downstream processing as files. | Boolean: true / false                                        | No           | true                                                        |
| mode.strict              | Determines whether to strictly filter data when using the `time`, `path`, `database-name`, or `table-name` parameters:  - **true**: Strict filtering. The system will strictly filter captured data according to the specified conditions, ensuring that only matching data is selected.  - **false**: Non-strict filtering. Some extra data may be included during the selection process to optimize performance and reduce CPU and I/O consumption. | Boolean: true / false                                        | No           | true                                                        |
| mode.snapshot            | This parameter determines the data capture mode, affecting the `data` in `inclusion`. Two modes are available:  - **true**: Static data capture. A one-time data snapshot is taken when the pipe starts. Once the snapshot data is fully consumed, the pipe automatically terminates (executing `DROP PIPE` SQL automatically).  - **false**: Dynamic data capture. In addition to capturing snapshot data when the pipe starts, it continuously captures subsequent data changes. The pipe remains active to process the dynamic data stream. | Boolean: true / false                                        | No           | false                                                       |
| database-name            | When the user connects with `sql_dialect` set to `table`, this parameter can be specified.  Determines the scope of data capture, affecting the `data` in `inclusion`.  Specifies the database name to filter. It can be a specific database name or a Java-style regular expression to match multiple databases. By default, all databases are matched. | String: Database name or database regular expression pattern string, which can match uncreated or non - existent databases. | No           | ".*"                                                        |
| table-name               | When the user connects with `sql_dialect` set to `table`, this parameter can be specified.  Determines the scope of data capture, affecting the `data` in `inclusion`.  Specifies the table name to filter. It can be a specific table name or a Java-style regular expression to match multiple tables. By default, all tables are matched. | String: Data table name or data table regular expression pattern string, which can be uncreated or non - existent tables. | No           | ".*"                                                        |
| start-time               | Determines the scope of data capture, affecting the `data` in `inclusion`. Data with an event time **greater than or equal to** this parameter will be selected for stream processing in the pipe. | Long: [Long.MIN_VALUE, Long.MAX_VALUE](Unix bare timestamp)orString: ISO format timestamp supported by IoTDB | No           | Long: [Long.MIN_VALUE, Long.MAX_VALUE](Unix bare timestamp) |
| end-time                 | Determines the scope of data capture, affecting the `data` in `inclusion`. Data with an event time **less than or equal to** this parameter will be selected for stream processing in the pipe. | Long: [Long.MIN_VALUE, Long.MAX_VALUE](Unix bare timestamp)orString: ISO format timestamp supported by IoTDB | No           | Long: [Long.MIN_VALUE, Long.MAX_VALUE](Unix bare timestamp) |
| forwarding-pipe-requests | Specifies whether to forward data that was synchronized via the pipe to external clusters.  Typically used for setting up **active-active clusters**. In active-active cluster mode, this parameter should be set to `false` to prevent **infinite circular synchronization**. | Boolean: true / false                                        | No           | true                                                        |

> 💎  **Note:** The difference between the values of true and false for the data extraction mode `mode.streaming`
>
> - True (recommended): Under this value, the task will process and send the data in real-time. Its characteristics are high timeliness and low throughput.
> -  False: Under this value, the task will process and send the data in batches (according to the underlying data files). Its characteristics are low timeliness and high throughput.

## Sink **p****arameter****s**

#### iotdb-thrift-sink

| **Parameter**               | **Description**                                              | Value Range                                                  | Required | Default Value |
| :-------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- | :------- | :------------ |
| sink                        | iotdb-thrift-sink or iotdb-thrift-async-sink                 | String: iotdb-thrift-sink or iotdb-thrift-async-sink         | Yes      | -             |
| node-urls                   | URLs of the DataNode service ports on the target IoTDB. (please note that the synchronization task does not support forwarding to its own service). | String. Example：'127.0.0.1：6667，127.0.0.1：6668，127.0.0.1：6669'， '127.0.0.1：6667' | Yes      | -             |
| user/usename                | Usename for connecting to the target IoTDB. Must have appropriate permissions. | String                                                       | No       | root          |
| password                    | Password for the username.                                   | String                                                       | No       | root          |
| batch.enable                | Enables batch mode for log transmission to improve throughput and reduce IOPS. | Boolean: true, false                                         | No       | true          |
| batch.max-delay-seconds     | Maximum delay (in seconds) for batch transmission.           | Integer                                                      | No       | 1             |
| batch.size-bytes            | Maximum batch size (in bytes) for batch  transmission.       | Long                                                         | No       | 16*1024*1024  |
| compressor                  | The selected RPC compression algorithm. Multiple algorithms can be configured and will be adopted in sequence for each request. | String: snappy / gzip / lz4 / zstd / lzma2                   | No       | ""            |
| compressor.zstd.level       | When the selected RPC compression algorithm is zstd, this parameter can be used to additionally configure the compression level of the zstd algorithm. | Int: [-131072, 22]                                           | No       | 3             |
| rate-limit-bytes-per-second | The maximum number of bytes allowed to be transmitted per second. The compressed bytes (such as after compression) are calculated. If it is less than 0, there is no limit. | Double:  [Double.MIN_VALUE, Double.MAX_VALUE]                | No       | -1            |

#### iotdb-air-gap-sink

| **Parameter**                | **Description**                                              | Value Range                                                  | Required | Default Value |
| :--------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- | :------- | :------------ |
| sink                         | iotdb-air-gap-sink                                           | String: iotdb-air-gap-sink                                   | Yes      | -             |
| node-urls                    | URLs of the DataNode service ports on the target IoTDB. (please note that the synchronization task does not support forwarding to its own service). | String. Example：'127.0.0.1：6667，127.0.0.1：6668，127.0.0.1：6669'， '127.0.0.1：6667' | Yes      | -             |
| user/usename                 | Usename for connecting to the target IoTDB. Must have appropriate permissions. | String                                                       | No       | root          |
| password                     | Password for the username.                                   | String                                                       | No       | root          |
| compressor                   | The selected RPC compression algorithm. Multiple algorithms can be configured and will be adopted in sequence for each request. | String: snappy / gzip / lz4 / zstd / lzma2                   | No       | ""            |
| compressor.zstd.level        | When the selected RPC compression algorithm is zstd, this parameter can be used to additionally configure the compression level of the zstd algorithm. | Int: [-131072, 22]                                           | No       | 3             |
| rate-limit-bytes-per-second  | The maximum number of bytes allowed to be transmitted per second. The compressed bytes (such as after compression) are calculated. If it is less than 0, there is no limit. | Double:  [Double.MIN_VALUE, Double.MAX_VALUE]                | No       | -1            |
| air-gap.handshake-timeout-ms | The timeout duration for the handshake requests when the sender and receiver attempt to establish a connection for the first time, in milliseconds. | Integer                                                      | No       | 5000          |

#### iotdb-thrift-ssl-sink

| **Parameter**               | **Description**                                              | Value Range                                                  | Required | Default Value |
| :-------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- | :------- | :------------ |
| sink                        | iotdb-thrift-ssl-sink                                        | String: iotdb-thrift-ssl-sink                                | Yes      | -             |
| node-urls                   | URLs of the DataNode service ports on the target IoTDB. (please note that the synchronization task does not support forwarding to its own service). | String. Example：'127.0.0.1：6667，127.0.0.1：6668，127.0.0.1：6669'， '127.0.0.1：6667' | Yes      | -             |
| user/usename                | Usename for connecting to the target IoTDB. Must have appropriate permissions. | String                                                       | No       | root          |
| password                    | Password for the username.                                   | String                                                       | No       | root          |
| batch.enable                | Enables batch mode for log transmission to improve throughput and reduce IOPS. | Boolean: true, false                                         | No       | true          |
| batch.max-delay-seconds     | Maximum delay (in seconds) for batch transmission.           | Integer                                                      | No       | 1             |
| batch.size-bytes            | Maximum batch size (in bytes) for batch  transmission.       | Long                                                         | No       | 16*1024*1024  |
| compressor                  | The selected RPC compression algorithm. Multiple algorithms can be configured and will be adopted in sequence for each request. | String: snappy / gzip / lz4 / zstd / lzma2                   | No       | ""            |
| compressor.zstd.level       | When the selected RPC compression algorithm is zstd, this parameter can be used to additionally configure the compression level of the zstd algorithm. | Int: [-131072, 22]                                           | No       | 3             |
| rate-limit-bytes-per-second | Maximum bytes allowed per second for transmission (calculated after compression). Set to a value less than 0 for no limit. | Double:  [Double.MIN_VALUE, Double.MAX_VALUE]                | No       | -1            |
| ssl.trust-store-path        | Path to the trust store certificate for SSL connection.      | String.Example: '127.0.0.1:6667,127.0.0.1:6668,127.0.0.1:6669', '127.0.0.1:6667' | Yes      | -             |
| ssl.trust-store-pwd         | Password for the trust store certificate.                    | Integer                                                      | Yes      | -             |