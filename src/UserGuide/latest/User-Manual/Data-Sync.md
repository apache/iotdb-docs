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

# IoTDB Data Sync
**The IoTDB data sync transfers data from IoTDB to another data platform, and <font color=RED>a data sync task is called a Pipe</font>.**

**A Pipe consists of three subtasks (plugins):**

- Source
- Process
- Sink

**Pipe allows users to customize the processing logic of these three subtasks, just like handling data using UDF (User-Defined Functions)**. Within a Pipe, the aforementioned subtasks are executed and implemented by three types of plugins. Data flows through these three plugins sequentially: Pipe Source is used to extract data, Pipe Processor is used to process data, and Pipe Sink is used to send data to an external system.

**The model of a Pipe task is as follows:**

![Task model diagram](https://alioss.timecho.com/docs/img/1706698537700.jpg)

It describes a data sync task, which essentially describes the attributes of the Pipe Source, Pipe Processor, and Pipe Sink plugins. Users can declaratively configure the specific attributes of the three subtasks through SQL statements. By combining different attributes, flexible data ETL (Extract, Transform, Load) capabilities can be achieved.

By utilizing the data sync functionality, a complete data pipeline can be built to fulfill various requirements such as edge-to-cloud sync, remote disaster recovery, and read-write workload distribution across multiple databases.

## Quick Start

**🎯 Goal: Achieve full data sync of IoTDB A -> IoTDB B**

- Start two IoTDBs,A（datanode -> 127.0.0.1:6667） B（datanode -> 127.0.0.1:6668）
- create a Pipe from A -> B, and execute on A

  ```sql
  create pipe a2b
  with sink (
    'sink'='iotdb-thrift-sink',
    'sink.ip'='127.0.0.1',
    'sink.port'='6668'
  )
  ```
- start a Pipe from A -> B, and execute on A

  ```sql
  start pipe a2b
  ```
- Write data to A

  ```sql
  INSERT INTO root.db.d(time, m) values (1, 1)
  ```
- Checking data synchronised from A at B
  ```sql
  SELECT ** FROM root
  ```

> ❗️**Note: The current IoTDB -> IoTDB implementation of data sync does not support DDL sync**
>
> That is: ttl, trigger, alias, template, view, create/delete sequence, create/delete storage group, etc. are not supported.
>
> **IoTDB -> IoTDB data sync requires the target IoTDB:**
>
> * Enable automatic metadata creation: manual configuration of encoding and compression of data types to be consistent with the sender is required
> * Do not enable automatic metadata creation: manually create metadata that is consistent with the source

## Sync Task Management

### Create a sync task

A data sync task can be created using the `CREATE PIPE` statement, a sample SQL statement is shown below:

```sql
CREATE PIPE <PipeId> -- PipeId is the name that uniquely identifies the sync task
WITH SOURCE (
  -- Default IoTDB Data Extraction Plugin
  'source'                    = 'iotdb-source',
  -- Path prefix, only data that can match the path prefix will be extracted for subsequent processing and delivery
  'source.pattern'            = 'root.timecho',
  -- Describes the time range of the data being extracted, indicating the earliest possible time
  'source.historical.start-time' = '2011.12.03T10:15:30+01:00',
  -- Describes the time range of the extracted data, indicating the latest time
  'source.historical.end-time'   = '2022.12.03T10:15:30+01:00',
)
WITH PROCESSOR (
  -- Default data processing plugin, means no processing
  'processor'                    = 'do-nothing-processor',
)
WITH SINK (
  -- IoTDB data sending plugin with target IoTDB
  'sink'                    = 'iotdb-thrift-sink',
  -- Data service for one of the DataNode nodes on the target IoTDB ip
  'sink.ip'                 = '127.0.0.1',
  -- Data service port of one of the DataNode nodes of the target IoTDB
  'sink.port'               = '6667',
)
```

**To create a sync task it is necessary to configure the PipeId and the parameters of the three plugin sections:**


| configuration item | description                                                                         | Required or not                 | default implementation | Default implementation description                                                            | Whether to allow custom implementations |
|--------------------|-------------------------------------------------------------------------------------|---------------------------------|------------------------|-----------------------------------------------------------------------------------------------|-----------------------------------------|
| pipeId             | Globally uniquely identifies the name of a sync task                                | <font color=red>required</font> | -                      | -                                                                                             | -                                       |
| source             | pipe Source plug-in, for extracting synchronized data at the bottom of the database | Optional                        | iotdb-source           | Integrate all historical data of the database and subsequent realtime data into the sync task | no                                      |
| processor          | Pipe Processor plug-in, for processing data                                         | Optional                        | do-nothing-processor   | no processing of incoming data                                                                | <font color=red>yes</font>              |
| sink               | Pipe Sink plug-in，for sending data                                                  | <font color=red>required</font> | -                      | -                                                                                             | <font color=red>yes</font>              |

In the example, the iotdb-source, do-nothing-processor, and iotdb-thrift-sink plug-ins are used to build the data sync task. IoTDB has other built-in data sync plug-ins, **see the section "System Pre-built Data Sync Plugin"**.
**An example of a minimalist CREATE PIPE statement is as follows:**

```sql
CREATE PIPE <PipeId> -- PipeId is a name that uniquely identifies the task.
WITH SINK (
  -- IoTDB data sending plugin with target IoTDB
  'sink'      = 'iotdb-thrift-sink',
  -- Data service for one of the DataNode nodes on the target IoTDB ip
  'sink.ip'   = '127.0.0.1',
  -- Data service port of one of the DataNode nodes of the target IoTDB
  'sink.port' = '6667',
)
```

The expressed semantics are: synchronize the full amount of historical data and subsequent arrivals of realtime data from this database instance to the IoTDB instance with target 127.0.0.1:6667.

**Note:**

- SOURCE and PROCESSOR are optional, if no configuration parameters are filled in, the system will use the corresponding default implementation.
- The SINK is a mandatory configuration that needs to be declared in the CREATE PIPE statement for configuring purposes.
- The SINK exhibits self-reusability. For different tasks, if their SINK possesses identical KV properties (where the value corresponds to every key), **the system will ultimately create only one instance of the SINK** to achieve resource reuse for connections.

  - For example, there are the following pipe1, pipe2 task declarations:

  ```sql
  CREATE PIPE pipe1
  WITH SINK (
    'sink' = 'iotdb-thrift-sink',
    'sink.ip' = 'localhost',
    'sink.port' = '9999',
  )

  CREATE PIPE pipe2
  WITH SINK (
    'sink' = 'iotdb-thrift-sink',
    'sink.port' = '9999',
    'sink.ip' = 'localhost',
  )
  ```

  - Since they have identical SINK declarations (**even if the order of some properties is different**), the framework will automatically reuse the SINK declared by them. Hence, the SINK instances for pipe1 and pipe2 will be the same.
- Please note that we should avoid constructing application scenarios that involve data cycle sync (as it can result in an infinite loop):

  - IoTDB A -> IoTDB B -> IoTDB A
  - IoTDB A -> IoTDB A

### START TASK

After the successful execution of the CREATE PIPE statement, task-related instances will be created. However, the overall task's running status will be set to STOPPED(V1.3.0), meaning the task will not immediately process data. In version 1.3.1 and later, the status of the task will be set to RUNNING after CREATE.

You can use the START PIPE statement to begin processing data for a task:

```sql
START PIPE <PipeId>
```

### STOP TASK

the STOP PIPE statement can be used to halt the data processing:

```sql
STOP PIPE <PipeId>
```

### DELETE TASK

If a task is in the RUNNING state, you can use the DROP PIPE statement to stop the data processing and delete the entire task:

```sql
DROP PIPE <PipeId>
```

Before deleting a task, there is no need to execute the STOP operation.

### SHOW TASK

You can use the SHOW PIPES statement to view all tasks:

```sql
SHOW PIPES
```

The query results are as follows:

```sql
+-----------+-----------------------+-------+----------+-------------+--------+----------------+
|         ID|          CreationTime |  State|PipeSource|PipeProcessor|PipeSink|ExceptionMessage|
+-----------+-----------------------+-------+----------+-------------+--------+----------------+
|iotdb-kafka|2022-03-30T20:58:30.689|RUNNING|       ...|          ...|     ...|              {}|
+-----------+-----------------------+-------+----------+-------------+--------+----------------+
|iotdb-iotdb|2022-03-31T12:55:28.129|STOPPED|       ...|          ...|     ...| TException: ...|
+-----------+-----------------------+-------+----------+-------------+--------+----------------+
```

You can use \<PipeId\> to specify the status of a particular synchronization task:

```sql
SHOW PIPE <PipeId>
```

Additionally, the WHERE clause can be used to determine if the Pipe Sink used by a specific \<PipeId\> is being reused.

```sql
SHOW PIPES
WHERE SINK USED BY <PipeId>
```

### Task Running Status Migration

The task running status can transition through several states during the lifecycle of a data synchronization pipe:

- **STOPPED：** The pipe is in a stopped state. It has the following causes:
  - After the successful creation of a pipe, its initial state is set to STOPPED (V1.3.0)
  - The user manually pauses a pipe that is in normal running state, transitioning its status from RUNNING to STOPPED
  - If a pipe encounters an unrecoverable error during execution, its status automatically changes from RUNNING to STOPPED.
- **RUNNING：** The pipe is actively processing data. It has the following cause:
  - After the successful creation of a pipe, its initial state is set to RUNNING (V1.3.1+)
- **DROPPED：** The pipe is permanently deleted

The following diagram illustrates the different states and their transitions:

![state migration diagram](https://alioss.timecho.com/docs/img/%E7%8A%B6%E6%80%81%E8%BF%81%E7%A7%BB%E5%9B%BE.png)

## System Pre-built Data Sync Plugin
📌 Notes: for version 1.3.1 or later, any parameters other than "source", "processor", "sink" themselves need not be with the prefixes. For instance:
```Sql
create pipe A2B
with sink (
  'sink'='iotdb-thrift-sink',
  'sink.ip'='127.0.0.1',
  'sink.port'='6668'
)
```
can be written as
```Sql
create pipe A2B
with sink (
  'sink'='iotdb-air-gap-sink',
  'ip'='127.0.0.1',
  'port'='6668'
)
```
### View pre-built plugin

User can view the plug-ins in the system on demand. The statement for viewing plug-ins is shown below.
```sql
SHOW PIPEPLUGINS
```

### Pre-built Source Plugin

#### iotdb-source

Function: Extract historical or realtime data inside IoTDB into pipe.


| key                       | value                                                                                                                               | value range                            | required or optional with default |
|---------------------------|-------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------|-----------------------------------|
| source                    | iotdb-source                                                                                                                        | String: iotdb-source                   | required                          |
| source.pattern            | path prefix for filtering time series                                                                                               | String: any time series prefix         | optional: root                    |
| source.history.start-time | start of synchronizing historical data event time，including start-time                                                              | Long: [Long.MIN_VALUE, Long.MAX_VALUE] | optional: Long.MIN_VALUE          |
| source.history.end-time   | end of synchronizing historical data event time，including end-time                                                                  | Long: [Long.MIN_VALUE, Long.MAX_VALUE] | optional: Long.MAX_VALUE          |
| start-time(V1.3.1+)       | start of synchronizing all data event time，including start-time. Will disable "history.start-time" "history.end-time" if configured | Long: [Long.MIN_VALUE, Long.MAX_VALUE] | optional: Long.MIN_VALUE          |
| end-time(V1.3.1+)         | end of synchronizing all data event time，including end-time. Will disable "history.start-time" "history.end-time" if configured     | Long: [Long.MIN_VALUE, Long.MAX_VALUE] | optional: Long.MAX_VALUE          |

> 🚫 **source.pattern Parameter Description**
>
> * Pattern should use backquotes to modify illegal characters or illegal path nodes, for example, if you want to filter root.\`a@b\` or root.\`123\`, you should set the pattern to root.\`a@b\` or root.\`123\`（Refer specifically to [Timing of single and double quotes and backquotes](https://iotdb.apache.org/zh/Download/#_1-0-版本不兼容的语法详细说明)）
> * In the underlying implementation, when pattern is detected as root (default value) or a database name, synchronization efficiency is higher, and any other format will reduce performance.
> * The path prefix does not need to form a complete path. For example, when creating a pipe with the parameter 'source.pattern'='root.aligned.1':
>
>   * root.aligned.1TS
>   * root.aligned.1TS.\`1\`
>   * root.aligned.100TS
>
>   the data will be synchronized;
>
>   * root.aligned.\`1\`
>   * root.aligned.\`123\`
>
>   the data will not be synchronized.

> ❗️**start-time, end-time parameter description of source**
>
> * start-time, end-time should be in ISO format, such as 2011-12-03T10:15:30 or 2011-12-03T10:15:30+01:00. Version 1.3.1+ supports timeStamp format like 1706704494000.

> ✅ **a piece of data from production to IoTDB contains two key concepts of time**
>
> * **event time：** the time when the data is actually produced (or the generation time assigned to the data by the data production system, which is a time item in the data point), also called the event time.
> * **arrival time：** the time the data arrived in the IoTDB system.
>
> The out-of-order data we often refer to refers to data whose **event time** is far behind the current system time (or the maximum **event time** that has been dropped) when the data arrives. On the other hand, whether it is out-of-order data or sequential data, as long as they arrive newly in the system, their **arrival time** will increase with the order in which the data arrives at IoTDB.

> 💎 **the work of iotdb-source can be split into two stages**
>
> 1. Historical data extraction: All data with **arrival time** < **current system time** when creating the pipe is called historical data
> 2. Realtime data extraction: All data with **arrival time** >= **current system time** when the pipe is created is called realtime data
>
> The historical data transmission phase and the realtime data transmission phase are executed serially. Only when the historical data transmission phase is completed, the realtime data transmission phase is executed.**

### Pre-built Processor Plugin

#### do-nothing-processor

Function: Do nothing with the events passed in by the source.


| key       | value                | value range                  | required or optional with default |
|-----------|----------------------|------------------------------|-----------------------------------|
| processor | do-nothing-processor | String: do-nothing-processor | required                          |

### Pre-built Sink plugin

#### iotdb-thrift-sync-sink

Function: Primarily used for data transfer between IoTDB instances (v1.2.0+). Data is transmitted using the Thrift RPC framework and a single-threaded blocking IO model. It guarantees that the receiving end applies the data in the same order as the sending end receives the write requests.

Limitation: Both the source and target IoTDB versions need to be v1.2.0+.


| key            | value                                                                               | value range                                                                | required or optional with default                  |
|----------------|-------------------------------------------------------------------------------------|----------------------------------------------------------------------------|----------------------------------------------------|
| sink           | iotdb-thrift-sink or iotdb-thrift-sync-sink                                         | String: iotdb-thrift-sync-sink                                             | required                                           |
| sink.ip        | the data service IP of one of the DataNode nodes in the target IoTDB                | String                                                                     | optional: and sink.node-urls fill in either one    |
| sink.port      | the data service port of one of the DataNode nodes in the target IoTDB              | Integer                                                                    | optional: and sink.node-urls fill in either one    |
| sink.node-urls | the URL of the data service port of any multiple DataNode nodes in the target IoTDB | String。eg：'127.0.0.1:6667,127.0.0.1:6668,127.0.0.1:6669', '127.0.0.1:6667' | optional: and sink.ip:sink.port fill in either one |

> 📌 Please ensure that the receiving end has already created all the time series present in the sending end or has enabled automatic metadata creation. Otherwise, it may result in the failure of the pipe operation.

#### iotdb-thrift-async-sink(alias:iotdb-thrift-sink)

Function: Primarily used for data transfer between IoTDB instances (v1.2.0+).
Data is transmitted using the Thrift RPC framework, employing a multi-threaded async non-blocking IO model, resulting in high transfer performance. It is particularly suitable for distributed scenarios on the target end.
It does not guarantee that the receiving end applies the data in the same order as the sending end receives the write requests, but it guarantees data integrity (at-least-once).

Limitation: Both the source and target IoTDB versions need to be v1.2.0+.


| key            | value                                                                               | value range                                                                | required or optional with default                  |
|----------------|-------------------------------------------------------------------------------------|----------------------------------------------------------------------------|----------------------------------------------------|
| sink           | iotdb-thrift-async-sink                                                             | String: iotdb-thrift-async-sink                                            | required                                           |
| sink.ip        | the data service IP of one of the DataNode nodes in the target IoTDB                | String                                                                     | optional: and sink.node-urls fill in either one    |
| sink.port      | the data service port of one of the DataNode nodes in the target IoTDB              | Integer                                                                    | optional: and sink.node-urls fill in either one    |
| sink.node-urls | the URL of the data service port of any multiple DataNode nodes in the target IoTDB | String。eg：'127.0.0.1:6667,127.0.0.1:6668,127.0.0.1:6669', '127.0.0.1:6667' | optional: and sink.ip:sink.port fill in either one |

> 📌 Please ensure that the receiving end has already created all the time series present in the sending end or has enabled automatic metadata creation. Otherwise, it may result in the failure of the pipe operation.

#### iotdb-legacy-pipe-sink

Function: Mainly used to transfer data from IoTDB (v1.2.0+) to versions lower than v1.2.0 of IoTDB, using the data synchronization (Sync) protocol before version v1.2.0.
Data is transmitted using the Thrift RPC framework. It employs a single-threaded sync blocking IO model, resulting in weak transfer performance.

Limitation: The source IoTDB version needs to be v1.2.0+. The target IoTDB version can be either v1.2.0+, v1.1.x (lower versions of IoTDB are theoretically supported but untested).

Note: In theory, any version prior to v1.2.0 of IoTDB can serve as the data synchronization (Sync) receiver for v1.2.0+.


| key           | value                                                                                                                        | value range                    | required or optional with default |
|---------------|------------------------------------------------------------------------------------------------------------------------------|--------------------------------|-----------------------------------|
| sink          | iotdb-legacy-pipe-sink                                                                                                       | string: iotdb-legacy-pipe-sink | required                          |
| sink.ip       | data service of one DataNode node of the target IoTDB ip                                                                     | string                         | required                          |
| sink.port     | the data service port of one of the DataNode nodes in the target IoTDB                                                       | integer                        | required                          |
| sink.user     | the user name of the target IoTDB. Note that the user needs to support data writing and TsFile Load permissions.             | string                         | optional: root                    |
| sink.password | the password of the target IoTDB. Note that the user needs to support data writing and TsFile Load permissions.              | string                         | optional: root                    |
| sink.version  | the version of the target IoTDB, used to disguise its actual version and bypass the version consistency check of the target. | string                         | optional: 1.1                     |

> 📌 Make sure that the receiver has created all the time series on the sender side, or that automatic metadata creation is turned on, otherwise the pipe run will fail.

#### do-nothing-sink

Function: Does nothing with the events passed in by the processor.

| key  | value           | value 取值范围              | required or optional with default |
|------|-----------------|-------------------------|-----------------------------------|
| sink | do-nothing-sink | String: do-nothing-sink | required                          |

## Authority Management

| Authority Name | Description                     |
|----------------|---------------------------------|
| CREATE_PIPE    | Register task,path-independent  |
| START_PIPE     | Start task,path-independent     |
| STOP_PIPE      | Stop task,path-independent      |
| DROP_PIPE      | Uninstall task,path-independent |
| SHOW_PIPES     | Query task,path-independent     |

## Configure Parameters

In iotdb-common.properties ：

V1.3.0:
```Properties
####################
### Pipe Configuration
####################

# Uncomment the following field to configure the pipe lib directory.
# For Windows platform
# If its prefix is a drive specifier followed by "\\", or if its prefix is "\\\\", then the path is
# absolute. Otherwise, it is relative.
# pipe_lib_dir=ext\\pipe
# For Linux platform
# If its prefix is "/", then the path is absolute. Otherwise, it is relative.
# pipe_lib_dir=ext/pipe

# The maximum number of threads that can be used to execute the pipe subtasks in PipeSubtaskExecutor.
# The actual value will be min(pipe_subtask_executor_max_thread_num, max(1, CPU core number / 2)).
# pipe_subtask_executor_max_thread_num=5

# The connection timeout (in milliseconds) for the thrift client.
# pipe_connector_timeout_ms=900000

# The maximum number of selectors that can be used in the async connector.
# pipe_async_connector_selector_number=1

# The core number of clients that can be used in the async connector.
# pipe_async_connector_core_client_number=8

# The maximum number of clients that can be used in the async connector.
# pipe_async_connector_max_client_number=16
```

V1.3.1+:
```Properties
####################
### Pipe Configuration
####################

# Uncomment the following field to configure the pipe lib directory.
# For Windows platform
# If its prefix is a drive specifier followed by "\\", or if its prefix is "\\\\", then the path is
# absolute. Otherwise, it is relative.
# pipe_lib_dir=ext\\pipe
# For Linux platform
# If its prefix is "/", then the path is absolute. Otherwise, it is relative.
# pipe_lib_dir=ext/pipe

# The maximum number of threads that can be used to execute the pipe subtasks in PipeSubtaskExecutor.
# The actual value will be min(pipe_subtask_executor_max_thread_num, max(1, CPU core number / 2)).
# pipe_subtask_executor_max_thread_num=5

# The connection timeout (in milliseconds) for the thrift client.
# pipe_sink_timeout_ms=900000

# The maximum number of selectors that can be used in the sink.
# Recommend to set this value to less than or equal to pipe_sink_max_client_number.
# pipe_sink_selector_number=4

# The maximum number of clients that can be used in the sink.
# pipe_sink_max_client_number=16
```

## Functionality Features

### At least one semantic guarantee **at-least-once**

The data synchronization feature provides an at-least-once delivery semantic when transferring data to external systems. In most scenarios, the synchronization feature guarantees exactly-once delivery, ensuring that all data is synchronized exactly once.

However, in the following scenarios, it is possible for some data to be synchronized multiple times **(due to resumable transmission)**:

- Temporary network failures: If a data transmission request fails, the system will retry sending it until reaching the maximum retry attempts.
- Abnormal implementation of the Pipe plugin logic: If an error is thrown during the plugin's execution, the system will retry sending the data until reaching the maximum retry attempts.
- Data partition switching due to node failures or restarts: After the partition change is completed, the affected data will be retransmitted.
- Cluster unavailability: Once the cluster becomes available again, the affected data will be retransmitted.

### Source: Data Writing with Pipe Processing and Asynchronous Decoupling of Data Transmission

In the data synchronization feature, data transfer adopts an asynchronous replication mode.

Data synchronization is completely decoupled from the writing operation, eliminating any impact on the critical path of writing. This mechanism allows the framework to maintain the writing speed of a time-series database while ensuring continuous data synchronization.

### Source: High Availability of Pipe Service in a Highly Available Cluster Deployment

When the sender end IoTDB is deployed in a high availability cluster mode, the data synchronization service will also be highly available. The data synchronization framework monitors the data synchronization progress of each data node and periodically takes lightweight distributed consistent snapshots to preserve the synchronization state.

- In the event of a failure of a data node in the sender cluster, the data synchronization framework can leverage the consistent snapshot and the data stored in replicas to quickly recover and resume synchronization, thus achieving high availability of the data synchronization service.
- In the event of a complete failure and restart of the sender cluster, the data synchronization framework can also use snapshots to recover the synchronization service.
