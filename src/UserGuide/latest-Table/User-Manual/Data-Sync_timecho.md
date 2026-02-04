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
# Data Sync

Data synchronization is a typical requirement in the Industrial Internet of Things (IIoT). Through data synchronization mechanisms, data sharing between IoTDB instances can be achieved, enabling the establishment of a complete data pipeline to meet needs such as internal and external network data exchange, edge-to-cloud synchronization, data migration, and data backup.

## 1. Functional Overview

### 1.1 Data Synchronization

A data synchronization task consists of three stages:

![](/img/data-sync-new.png)

- Source Stage: This stage is used to extract data from the source IoTDB, defined in the `source` section of the SQL statement.
- Process Stage: This stage is used to process the data extracted from the source IoTDB, defined in the `processor` section of the SQL statement.
- Sink Stage: This stage is used to send data to the target IoTDB, defined in the `sink` section of the SQL statement.

By declaratively configuring these three parts in an SQL statement, flexible data synchronization capabilities can be achieved.Currently, data synchronization supports the synchronization of the following information, and you can select the synchronization scope when creating a synchronization task (the default is data.insert, which means synchronizing newly written data):

<table style="text-align: left;">
  <tbody>
     <tr>            <th>Synchronization Scope</th>
            <th>Synchronization Content	</th>        
            <th>Description</th>
      </tr>
      <tr>
            <td colspan="2">all</td>  
            <td>All scopes</td> 
      </tr>
      <tr>
            <td rowspan="2">data（Data）</td>
            <td>insert</td>
            <td>Synchronize newly written data</td>
      </tr>
      <tr>
            <td>delete</td>
            <td>Synchronize deleted data</td>
      </tr>
     <tr>
            <td rowspan="3">schema</td>
            <td>database</td>
            <td>Synchronize database creation, modification or deletion operations</td>
      </tr>
      <tr>
            <td>table</td>
            <td>Synchronize table creation, modification or deletion operations</td>       
      </tr>
      <tr>
            <td>TTL</td>
            <td>Synchronize the data retention time</td>       
      </tr>
      <tr>
            <td>auth</td>
            <td>-</td>       
            <td>Synchronize user permissions and access control</td>
      </tr>
</tbody>
</table>

### 1.2 Functional Limitations and Notes

- Data synchronization between IoTDB of 1. x series version and IoTDB of 2. x and above series versions is not supported.
- When performing data synchronization tasks, avoid executing any deletion operations to prevent inconsistencies between the two ends.
- The `pipe` and `pipe plugins` for tree modes and table modes are designed to be isolated from each other. Before creating a `pipe`, it is recommended to first use the `show` command to query the built-in plugins available under the current `-sql_dialect` parameter configuration to ensure syntax compatibility and functional support.
- Does not support the Object data type.

## 2. Usage Instructions

A data synchronization task can be in one of three states: RUNNING, STOPPED, and DROPPED. The state transitions of the task are illustrated in the diagram below:

![](/img/Data-Sync02.png)

After creation, the task will start directly. Additionally, if the task stops due to an exception, the system will automatically attempt to restart it.

We provide the following SQL statements for managing the state of synchronization tasks.

### 2.1 Create a Task

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

### 2.2 Start a Task

After creation, the task directly enters the RUNNING state and does not require manual startup. However, if the task is stopped using the `STOP PIPE` statement, you need to manually start it using the `START PIPE` statement. If the task stops due to an exception, it will automatically restart to resume data processing:

```SQL
START PIPE<PipeId>
```

### 2.3 Stop a Task

To stop data processing:

```SQL
STOP PIPE <PipeId>
```

### 2.4 Delete a Task

To delete a specified task:

```SQL
DROP PIPE [IF EXISTS] <PipeId>
```

**IF EXISTS Semantics**: Ensures that the deletion command is executed only if the specified Pipe exists, preventing errors caused by attempting to delete a non-existent Pipe. 

**Note**: Deleting a task does not require stopping the synchronization task first.

### 2.5 View Tasks

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

### 2.6 Synchronization Plugins

To make the architecture more flexible and adaptable to different synchronization scenarios, IoTDB supports plugin assembly in the synchronization task framework. The system provides some common pre-installed plugins, and you can also customize `processor` and `sink` plugins and load them into the IoTDB system.

To view the plugins available in the system (including custom and built-in plugins), use the following statement:

```SQL
SHOW PIPEPLUGINS
```

Example Output:

```SQL
IoTDB> SHOW PIPEPLUGINS
**+---------------------+----------+-------------------------------------------------------------------------------------------------+---------+
|           PluginName|PluginType|                                                                                        ClassName|PluginJar|
+---------------------+----------+-------------------------------------------------------------------------------------------------+---------+
| DO-NOTHING-PROCESSOR|   Builtin|        org.apache.iotdb.commons.pipe.agent.plugin.builtin.processor.donothing.DoNothingProcessor|         |
|      DO-NOTHING-SINK|   Builtin|        org.apache.iotdb.commons.pipe.agent.plugin.builtin.connector.donothing.DoNothingConnector|         |
|   IOTDB-AIR-GAP-SINK|   Builtin|   org.apache.iotdb.commons.pipe.agent.plugin.builtin.connector.iotdb.airgap.IoTDBAirGapConnector|         |
|         IOTDB-SOURCE|   Builtin|                org.apache.iotdb.commons.pipe.agent.plugin.builtin.extractor.iotdb.IoTDBExtractor|         |
|    IOTDB-THRIFT-SINK|   Builtin|   org.apache.iotdb.commons.pipe.agent.plugin.builtin.connector.iotdb.thrift.IoTDBThriftConnector|         |
|IOTDB-THRIFT-SSL-SINK|   Builtin|org.apache.iotdb.commons.pipe.agent.plugin.builtin.connector.iotdb.thrift.IoTDBThriftSslConnector|         |
|      WRITE-BACK-SINK|   Builtin|        org.apache.iotdb.commons.pipe.agent.plugin.builtin.connector.writeback.WriteBackConnector|         |
+---------------------+----------+-------------------------------------------------------------------------------------------------+---------+
```

Detailed introduction of pre-installed plugins is as follows (for detailed parameters of each plugin, please refer to the [Parameter Description](#reference-parameter-description):

<table style="text-align: left;">
  <tbody>
     <tr>          
            <th>Type</th>
            <th>Custom Plugin</th>        
            <th>Plugin Name</th>
            <th>Description</th>
      </tr>
      <tr> 
            <td>Source Plugin</td>
            <td>Not Supported</td>
            <td>iotdb-source</td>
            <td>Default extractor plugin for extracting historical or real-time data from IoTDB. </td>
      </tr>
      <tr>
            <td>processor Plugin</td>
            <td>Supported</td>
            <td>do-nothing-processor</td>
            <td>Default processor plugin that does not process incoming data.</td>
      </tr>
      <tr>
            <td rowspan="6">sink Plugin</td>
            <td rowspan="6">Supported</td>
            <td>do-nothing-sink</td>
            <td>Does not process outgoing data.</td>
      </tr>
      <tr>
            <td>iotdb-thrift-sink</td>
            <td>Default sink plugin for data transmission between IoTDB instances (V2.0.0+). Uses Thrift RPC framework with a multi-threaded async non-blocking IO model, ideal for distributed target scenarios.</td>
      </tr>
      <tr>
            <td>iotdb-air-gap-sink</td>
            <td>Used for cross-unidirectional data gate synchronization between IoTDB instances (V2.0.0+). Supports gate models like NARI Syskeeper 2000.</td>
      </tr>
      <tr>
            <td>iotdb-thrift-ssl-sink</td>
            <td>Used for data transmission between IoTDB instances (V2.0.0+). Uses Thrift RPC framework with a multi-threaded sync blocking IO model, suitable for high-security scenarios.</td>
      </tr>
      <tr>
            <td>write-back-sink</td>
            <td>A data write-back plugin for IoTDB (V2.0.2 and above) to achieve the effect of materialized views.</td>
      </tr>
     <tr>
            <td>opc-ua-sink</td>
            <td>An OPC UA protocol data transfer plugin for IoTDB (V2.0.2 and above), supporting both Client/Server and Pub/Sub communication modes. </td>
      </tr>
  </tbody>
</table>

## 3. Usage Examples

### 3.1 Full Data Synchronization

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

### 3.2 Partial Data Synchronization

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
  'database-name'='testdb.*', -- Scope of Data Synchronization
  'start-time' = '2023.08.23T08:00:00+00:00',  -- The event time at which data synchronization starts (inclusive).
  'end-time' = '2023.10.23T08:00:00+00:00'  -- The event time at which data synchronization ends (inclusive).
) 
WITH SINK (
  'sink' = 'iotdb-thrift-async-sink',
  'node-urls' = '127.0.0.1:6668'  -- The URL of the DataNode's data service port in the target IoTDB instance.
)
```

### 3.3 Bidirectional Data Transmission

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

### 3.4 Edge-to-Cloud Data Transmission

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

### 3.5 Cascaded Data Transmission

This example demonstrates cascading data transmission from IoTDB A to IoTDB B and then to IoTDB C. The data pipeline is shown below:

![](/img/sync_en_04.png)


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
)
WITH SINK (
  'sink' = 'iotdb-thrift-sink',
  'node-urls' = '127.0.0.1:6669' -- URL of the DataNode service port on the target IoTDB
)
```

### 3.6 Air-Gapped Data Transmission

This example demonstrates synchronizing data from one IoTDB to another through a unidirectional air gap. The data pipeline is shown below:

![](/img/cross-network-gateway.png)

In this example, the `iotdb-air-gap-sink` plugin is used (currently supports specific air gap models; contact Timecho team for details). After configuring the air gap, execute the following statement on IoTDB A, where `node-urls` is the URL of the DataNode service port on the target IoTDB.

SQL Example:

```SQL
CREATE PIPE A2B
WITH SINK (
  'sink' = 'iotdb-air-gap-sink',
  'node-urls' = '10.53.53.53:9780' -- URL of the DataNode service port on the target IoTDB
)
```

**Notes: Currently supported gateway models**
> For other models of network gateway devices, Please contact timechodb staff to confirm compatibility.

| Gateway Type           | Model                                                        | Return Packet Limit | Send Limit             |
| ---------------------- | ------------------------------------------------------------ | ------------------- | ---------------------- |
| Forward Gate         | NARI Syskeeper-2000 Forward Gate                         | All 0 / All 1 bytes | No Limit               |
| Forward Gate         | XJ Self-developed Diaphragm                                  | All 0 / All 1 bytes | No Limit               |
| Unknown     | WISGAP         | No Limit            | No Limit               |
| Forward Gate         | KEDONG StoneWall-2000 Network Security Isolation Device | No Limit            | No Limit               |
| Reverse Gate      | NARI Syskeeper-2000 Reverse Direction                      | All 0 / All 1 bytes | Meet E Language Format |
| Unknown     | DPtech ISG5000                                      | No Limit            | No Limit               |
| Unknown     | GAP‌‌
 XL—GAP    | No Limit            | No Limit               |
 
### 3.7 Compressed Synchronization

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

### 3.8 Encrypted Synchronization

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

## Reference: Notes

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

## Reference: Parameter Description

### source  parameter

| **Parameter**            | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | **Value Range**                                                                                                             | **Required** | **Default Value**                                           |
| :----------------------- |:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------------------------------| :----------- | :---------------------------------------------------------- |
| source                   | iotdb-source                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | String: iotdb-source                                                                                                        | Yes          | -                                                           |
| inclusion                | Used to specify the range of data to be synchronized in the data synchronization task, including data,schema and auth                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | String:all, data(insert,delete), schema(database,table,ttl), auth                                                           | Optional     | data.insert    |
| inclusion.exclusion      | Used to exclude specific operations from the range specified by inclusion, reducing the amount of data synchronized                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | String:all, data(insert,delete), schema(database,table,ttl), auth                                                           | Optional     | -              |
| mode.streaming           | This parameter specifies the source of time-series data capture. It applies to scenarios where `mode.streaming` is set to `false`, determining the capture source for `data.insert` in `inclusion`. Two capture strategies are available:  - **true**: Dynamically selects the capture type. The system adapts to downstream processing speed, choosing between capturing each write request or only capturing TsFile file sealing requests. When downstream processing is fast, write requests are prioritized to reduce latency; when processing is slow, only file sealing requests are captured to prevent processing backlogs. This mode suits most scenarios, optimizing the balance between processing latency and throughput.  - **false**: Uses a fixed batch capture approach, capturing only TsFile file sealing requests. This mode is suitable for resource-constrained applications, reducing system load.  **Note**: Snapshot data captured when the pipe starts will only be provided for downstream processing as files. | Boolean: true / false                                                                                                       | No           | true                                                        |
| mode.strict              | Determines whether to strictly filter data when using the `time`, `path`, `database-name`, or `table-name` parameters:  - **true**: Strict filtering. The system will strictly filter captured data according to the specified conditions, ensuring that only matching data is selected.  - **false**: Non-strict filtering. Some extra data may be included during the selection process to optimize performance and reduce CPU and I/O consumption.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Boolean: true / false                                                                                                       | No           | true                                                        |
| mode.snapshot            | This parameter determines the data capture mode, affecting the `data` in `inclusion`. Two modes are available:  - **true**: Static data capture. A one-time data snapshot is taken when the pipe starts. Once the snapshot data is fully consumed, the pipe automatically terminates (executing `DROP PIPE` SQL automatically).  - **false**: Dynamic data capture. In addition to capturing snapshot data when the pipe starts, it continuously captures subsequent data changes. The pipe remains active to process the dynamic data stream.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Boolean: true / false                                                                                                       | No           | false                                                       |
| database-name            | When the user connects with `sql_dialect` set to `table`, this parameter can be specified.  Determines the scope of data capture, affecting the `data` in `inclusion`.  Specifies the database name to filter. It can be a specific database name or a Java-style regular expression to match multiple databases. By default, all databases are matched.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | String: Database name or database regular expression pattern string, which can match uncreated or non - existent databases. | No           | ".*"                                                        |
| table-name               | When the user connects with `sql_dialect` set to `table`, this parameter can be specified.  Determines the scope of data capture, affecting the `data` in `inclusion`.  Specifies the table name to filter. It can be a specific table name or a Java-style regular expression to match multiple tables. By default, all tables are matched.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | String: Data table name or data table regular expression pattern string, which can be uncreated or non - existent tables.   | No           | ".*"                                                        |
| start-time               | Determines the scope of data capture, affecting the `data` in `inclusion`. Data with an event time **greater than or equal to** this parameter will be selected for stream processing in the pipe.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Long: [Long.MIN_VALUE, Long.MAX_VALUE](Unix bare timestamp)orString: ISO format timestamp supported by IoTDB                | No           | Long: [Long.MIN_VALUE, Long.MAX_VALUE](Unix bare timestamp) |
| end-time                 | Determines the scope of data capture, affecting the `data` in `inclusion`. Data with an event time **less than or equal to** this parameter will be selected for stream processing in the pipe.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Long: [Long.MIN_VALUE, Long.MAX_VALUE](Unix bare timestamp)orString: ISO format timestamp supported by IoTDB                | No           | Long: [Long.MIN_VALUE, Long.MAX_VALUE](Unix bare timestamp) |
| mode.double-living       | Whether to enable full dual-active mode. When enabled, the system will ignore the `-sql_dialect` connection method to capture all tree-table model data and not forward data synced from another pipe (to avoid circular synchronization).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Boolean: true / false                                | No           | false                     |
| mods                     | Same as mods.enable, whether to send the MODS file for TSFile.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Boolean: true / false                                                  | Optional         | false         |

> 💎  **Note:** The difference between the values of true and false for the data extraction mode `mode.streaming`
>
> - True (recommended): Under this value, the task will process and send the data in real-time. Its characteristics are high timeliness and low throughput.
> -  False: Under this value, the task will process and send the data in batches (according to the underlying data files). Its characteristics are low timeliness and high throughput.

### sink parameter

#### iotdb-thrift-sink

| **Parameter**               | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Value Range                                                                      | Required | Default Value |
|:----------------------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:---------------------------------------------------------------------------------| :------- | :------------ |
| sink                        | iotdb-thrift-sink or iotdb-thrift-async-sink                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | String: iotdb-thrift-sink or iotdb-thrift-async-sink                             | Yes      | -             |
| node-urls                   | URLs of the DataNode service ports on the target IoTDB. (please note that the synchronization task does not support forwarding to its own service).                                                                                                                                                                                                                                                                                                                                                                                                         | String. Example：'127.0.0.1：6667，127.0.0.1：6668，127.0.0.1：6669'， '127.0.0.1：6667' | Yes      | -             |
| user/username                | username for connecting to the target IoTDB. Must have appropriate permissions.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | String                                                                           | No       | root          |
| password                    | Password for the username.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | String                                                                           | No       | root          |
| batch.enable                | Enables batch mode for log transmission to improve throughput and reduce IOPS.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Boolean: true, false                                                             | No       | true          |
| batch.max-delay-seconds     | Maximum delay (in seconds) for batch transmission.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Integer                                                                          | No       | 1             |
| batch.max-delay-ms          | Maximum delay (in ms) for batch transmission. (Available since v2.0.5)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Integer                                                                          | No       | 1             |
| batch.size-bytes            | Maximum batch size (in bytes) for batch  transmission.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Long                                                                             | No       | 16*1024*1024  |
| compressor                  | The selected RPC compression algorithm. Multiple algorithms can be configured and will be adopted in sequence for each request.                                                                                                                                                                                                                                                                                                                                                                                                                             | String: snappy / gzip / lz4 / zstd / lzma2                                       | No       | ""            |
| compressor.zstd.level       | When the selected RPC compression algorithm is zstd, this parameter can be used to additionally configure the compression level of the zstd algorithm.                                                                                                                                                                                                                                                                                                                                                                                                      | Int: [-131072, 22]                                                               | No       | 3             |
| rate-limit-bytes-per-second | The maximum number of bytes allowed to be transmitted per second. The compressed bytes (such as after compression) are calculated. If it is less than 0, there is no limit.                                                                                                                                                                                                                                                                                                                                                                                 | Double:  [Double.MIN_VALUE, Double.MAX_VALUE]                                    | No       | -1            |
| load-tsfile-strategy        | When synchronizing file data, ​​whether the receiver waits for the local load tsfile operation to complete before responding to the sender​​:<br>​​sync​​: Wait for the local load tsfile operation to complete before returning the response.<br>​​async​​: Do not wait for the local load tsfile operation to complete; return the response immediately.                                                                                                                                                                                                  | String: sync / async                                                             | No       | sync           |
| format                      | The payload formats for data transmission include the following options:<br>  - hybrid: The format depends on what is passed from the processor (either tsfile or tablet), and the sink performs no conversion.<br> - tsfile: Data is forcibly converted to tsfile format before transmission. This is suitable for scenarios like data file backup.<br> - tablet: Data is forcibly converted to tsfile format before transmission. This is useful for data synchronization when the sender and receiver have incompatible data types (to minimize errors). | String: hybrid / tsfile / tablet   | No       | hybrid |
| mark-as-general-write-request | This parameter controls whether data forwarded by external pipes can be synchronized between dual-active pipes (configured on the sender side of dual-active external pipes). | Boolean: true / false. True: can synchronize; False: cannot synchronize; | Optional | False |

#### iotdb-air-gap-sink

| **Parameter**                | **Description**                                              | Value Range                                                  | Required | Default Value                                |
| :--------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- | :------- |:---------------------------------------------|
| sink                         | iotdb-air-gap-sink                                           | String: iotdb-air-gap-sink                                   | Yes      | -                                            |
| node-urls                    | URLs of the DataNode service ports on the target IoTDB. (please note that the synchronization task does not support forwarding to its own service). | String. Example：'127.0.0.1：6667，127.0.0.1：6668，127.0.0.1：6669'， '127.0.0.1：6667' | Yes      | -                                            |
| user/username                 | username for connecting to the target IoTDB. Must have appropriate permissions. | String                                                       | No       | root                                         |
| password                     | Password for the username.                                   | String                                                       | No       | TimechoDB@2021 (Before V2.0.6.x it is root)  |
| compressor                   | The selected RPC compression algorithm. Multiple algorithms can be configured and will be adopted in sequence for each request. | String: snappy / gzip / lz4 / zstd / lzma2                   | No       | ""                                           |
| compressor.zstd.level        | When the selected RPC compression algorithm is zstd, this parameter can be used to additionally configure the compression level of the zstd algorithm. | Int: [-131072, 22]                                           | No       | 3                                            |
| rate-limit-bytes-per-second  | The maximum number of bytes allowed to be transmitted per second. The compressed bytes (such as after compression) are calculated. If it is less than 0, there is no limit. | Double:  [Double.MIN_VALUE, Double.MAX_VALUE]                | No       | -1                                           |
| load-tsfile-strategy        | When synchronizing file data, ​​whether the receiver waits for the local load tsfile operation to complete before responding to the sender​​:<br>​​sync​​: Wait for the local load tsfile operation to complete before returning the response.<br>​​async​​: Do not wait for the local load tsfile operation to complete; return the response immediately.                                                                                                                                                               | String: sync / async                                                             | No       | sync                                         |
| air-gap.handshake-timeout-ms | The timeout duration for the handshake requests when the sender and receiver attempt to establish a connection for the first time, in milliseconds. | Integer                                                      | No       | 5000                                         |

#### iotdb-thrift-ssl-sink

| **Parameter**               | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Value Range                                                                      | Required | Default Value |
|:----------------------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:---------------------------------------------------------------------------------|:---------| :------------ |
| sink                        | iotdb-thrift-ssl-sink                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | String: iotdb-thrift-ssl-sink                                                    | Yes      | -             |
| node-urls                   | URLs of the DataNode service ports on the target IoTDB. (please note that the synchronization task does not support forwarding to its own service).                                                                                                                                                                                                                                                                                                                                                                                                         | String. Example：'127.0.0.1：6667，127.0.0.1：6668，127.0.0.1：6669'， '127.0.0.1：6667' | Yes      | -             |
| user/usename                | Usename for connecting to the target IoTDB. Must have appropriate permissions.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | String                                                                           | No       | root          |
| password                    | Password for the username.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | String                                                                           | No       | root          |
| batch.enable                | Enables batch mode for log transmission to improve throughput and reduce IOPS.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Boolean: true, false                                                             | No       | true          |
| batch.max-delay-seconds     | Maximum delay (in seconds) for batch transmission.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Integer                                                                          | No       | 1             |
| batch.max-delay-ms          | Maximum delay (in ms) for batch transmission. (Available since v2.0.5)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Integer                                                                          | No       | 1             |
| batch.size-bytes            | Maximum batch size (in bytes) for batch  transmission.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Long                                                                             | No       | 16*1024*1024  |
| compressor                  | The selected RPC compression algorithm. Multiple algorithms can be configured and will be adopted in sequence for each request.                                                                                                                                                                                                                                                                                                                                                                                                                             | String: snappy / gzip / lz4 / zstd / lzma2                                       | No       | ""            |
| compressor.zstd.level       | When the selected RPC compression algorithm is zstd, this parameter can be used to additionally configure the compression level of the zstd algorithm.                                                                                                                                                                                                                                                                                                                                                                                                      | Int: [-131072, 22]                                                               | No       | 3             |
| rate-limit-bytes-per-second | Maximum bytes allowed per second for transmission (calculated after compression). Set to a value less than 0 for no limit.                                                                                                                                                                                                                                                                                                                                                                                                                                  | Double:  [Double.MIN_VALUE, Double.MAX_VALUE]                                    | No       | -1            |
| load-tsfile-strategy        | When synchronizing file data, ​​whether the receiver waits for the local load tsfile operation to complete before responding to the sender​​:<br>​​sync​​: Wait for the local load tsfile operation to complete before returning the response.<br>​​async​​: Do not wait for the local load tsfile operation to complete; return the response immediately.                                                                                                                                                               | String: sync / async                                                             | No       | sync           |
| ssl.trust-store-path        | Path to the trust store certificate for SSL connection.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | String.Example: '127.0.0.1:6667,127.0.0.1:6668,127.0.0.1:6669', '127.0.0.1:6667' | Yes      | -             |
| ssl.trust-store-pwd         | Password for the trust store certificate.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Integer                                                                          | Yes      | -             |
| format                      | The payload formats for data transmission include the following options:<br>  - hybrid: The format depends on what is passed from the processor (either tsfile or tablet), and the sink performs no conversion.<br> - tsfile: Data is forcibly converted to tsfile format before transmission. This is suitable for scenarios like data file backup.<br> - tablet: Data is forcibly converted to tsfile format before transmission. This is useful for data synchronization when the sender and receiver have incompatible data types (to minimize errors). | String: hybrid / tsfile / tablet                                                 | No       | hybrid |
| mark-as-general-write-request | This parameter controls whether data forwarded by external pipes can be synchronized between dual-active pipes (configured on the sender side of dual-active external pipes).(Available since v2.0.5)  | Boolean: true / false. True: can synchronize; False: cannot synchronize; | Optional | False |



#### write-back-sink

| **Parameter**                 | **Description**                                                     | **value Range**                                           | **Required** | **Default Value** |
| ---------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- |--------------|
| sink                         | write-back-sink                                           | String: write-back-sink                                   | Yes     | -            |

#### opc-ua-sink

| **Parameter**                        | **Description**                                                                                          |Value Range                         | Required	    | Default Value                                                                                                                                                                                                                                                                 |
|:-------------------------------------|:-------------------------------------------------------------------------------------------------------| :------------------------------------- |:-------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| sink                                 | opc-ua-sink                                                                                          | String: opc-ua-sink              | Yes	         | -                                                                                                                                                                                                                                                                             |
| sink.opcua.model                     | OPC UA model used	                                                                                     | String: client-server / pub-sub  | No           | pub-sub                                                                                                                                                                                                                                                                       |
| sink.opcua.tcp.port                  | OPC UA's TCP port	                                                                                     | Integer: [0, 65536]              | No           | 12686                                                                                                                                                                                                                                                                         |
| sink.opcua.https.port                | OPC UA's HTTPS port	                                                                                   | Integer: [0, 65536]              | No           | 8443                                                                                                                                                                                                                                                                          |
| sink.opcua.security.dir              | Directory for OPC UA's keys and certificates	                                                          | String: Path, supports absolute and relative directories | No           | Opc_security folder`<httpsPort: tcpPort>`in the conf directory of the DataNode related to iotdb <br> If there is no conf directory for iotdb (such as launching DataNode in IDEA), it will be the iotdb_opc_Security folder`<httpsPort: tcpPort>`in the user's home directory |
| sink.opcua.enable-anonymous-access   | Whether OPC UA allows anonymous access	                                                                | Boolean                          | No           | true                                                                                                                                                                                                                                                                          |
| sink.user                            | User for OPC UA, specified in the configuration	                                                       | String                           | No           | root                                                                                                                                                                                                                                                                          |
| sink.password                        | Password for OPC UA, specified in the configuration	                                                   | String                           | No           | TimechoDB@2021 (Before V2.0.6.x it is root)                                                                                                                                                                                                                                   |
| sink.opcua.placeholder               | A placeholder string used to substitute for null mapping paths when the value of the ID column is null | String               | Optional     | "null"                                                                                                                                                                                                                                                                        |
