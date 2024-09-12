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

# Data Synchronisation
Data synchronisation is a typical requirement of industrial IoT. Through the data synchronisation mechanism, data sharing between IoTDBs can be achieved, and a complete data link can be built to meet the needs of intranet and extranet data interoperability, end-to-end cloud synchronisation, data migration, data backup, and so on.

## Introduction

### Synchronisation Task Overview

A data synchronisation task consists of 3 phases:

- Source phase: This part is used to extract data from the source IoTDB, which is defined in the source part of the SQL statement.
- Process phase: This section is used to process data extracted from the source IoTDB, as defined in the processor section of the SQL statement.
- Sink phase: This part is used to send data to the target IoTDB and is defined in the sink part of the SQL statement.



Flexible data synchronisation capabilities can be achieved by declaratively configuring the specifics of the 3 sections through SQL statements.

### Synchronisation Task - Create

Use the `CREATE PIPE` statement to create a data synchronisation task, the following attributes `PipeId` and `sink` are mandatory, `source` and `processor` are optional, when entering the SQL note that the order of the `SOURCE ` and `SINK` plugins are not interchangeable.

The SQL example is as follows:

```SQL
CREATE PIPE <PipeId> -- PipeId is the name that can uniquely calibrate a task
-- Data extraction plugin, optional plugin
WITH SOURCE (
  [<parameter> = <value>,],
)
-- Data processing plugin, optional plugin
WITH PROCESSOR (
  [<parameter> = <value>,],
)
-- Data connection plugin, required plugin
WITH SINK (
  [<parameter> = <value>,],
)
```
> 📌 Note: To use the data synchronisation feature, make sure that automatic metadata creation is enabled on the receiving side



### Synchronisation Tasks - Management

The Data Synchronisation task has three states; RUNNING, STOPPED and DROPPED.The task state transitions are shown below:

![State Migration Diagram](https://alioss.timecho.com/docs/img/%E7%8A%B6%E6%80%81%E8%BF%81%E7%A7%BB%E5%9B%BE.png)

A data synchronisation task passes through multiple states during its lifecycle:

- RUNNING: Running state.
  - Explanation 1: The initial state of the task is the running state (* * _V1.3.1_ * * and above).
- STOPPED: Stopped state.
  - Description 1: The initial state of the task is in a stopped state (* * _V1.3.0_ * *), and an SQL statement is required to start the task.
  - Description 2: You can manually stop a running task with a SQL statement, and the state will change from RUNNING to STOPPED.
  - Description 3: When a task has an unrecoverable error, its status will automatically change from RUNNING to STOPPED.
- DROPPED: deleted state.

We provide the following SQL statements to manage the status of synchronisation tasks.

#### Starting a Task

After creation, the task will not be processed immediately, you need to start the task. Use the `START PIPE` statement to start the task so that it can begin processing data:

```SQL
START PIPE<PipeId>
```

#### Stop the task

Stop processing data:

```SQL
STOP PIPE <PipeId>
```

#### Delete a task

Deletes the specified task:

```SQL
DROP PIPE <PipeId>
```
Deleting a task does not require you to stop synchronising the task first.
#### Viewing Tasks

View all tasks:

```SQL
SHOW PIPES
```

To view a specified task:

```SQL
SHOW PIPE <PipeId>.
```

Starting from version _**V1.3.3**_ , the `show pipes` command comes with an estimated remaining time and number of remaining events. The remaining time and number of remaining events are defined as follows:
* **剩余 event 个数**: refers to the current total number of events in the pipeline transmission task, including data synchronization and metadata synchronization, as well as events controlled by the pipeline framework and user-defined events.
* **剩余时间**: refers to the estimated remaining transmission time based on the current number of events in the pipe and the processing rate of the pipe.

To avoid affecting the normal workflow, the statistical values of these two indicators are usually cached on the Configurable Node and aggregated when the pipeline reports heartbeats, which may have a certain amount of delay in their statistics. As an optimization, when a pipeline transmission task only involves DataNodes and there is only one DataNode in the cluster, this metric will be optimized for local computation of DataNodes.
For example, a pipe created by the following command:
```SQL
create pipe A2B
with sink (
  'sink'='iotdb-thrift-sink',
  'sink.ip'='127.0.0.1',
  'sink.port'='6668'
)
```
This pipe is a fully synchronized data pipe. If the cluster where this pipe is located is a 1C1D cluster, the statistical information of this pipe will be the latest every time the `show pipe` is performed.

Here is an example of the show pipes result for this pipe:
```SQL
+---+-----------------------+-------+----------+-------------+-----------------------------------------------------------+----------------+-------------------+-------------------------+
| ID|           CreationTime|  State|PipeSource|PipeProcessor|                                                   PipeSink|ExceptionMessage|RemainingEventCount|EstimatedRemainingSeconds|
+---+-----------------------+-------+----------+-------------+-----------------------------------------------------------+----------------+-------------------+-------------------------+
|A2B|2024-06-17T14:03:44.189|RUNNING|        {}|           {}|{sink=iotdb-thrift-sink, sink.ip=127.0.0.1, sink.port=6668}|                |                128|                     1.03|
+---+-----------------------+-------+----------+-------------+-----------------------------------------------------------+----------------+-------------------+-------------------------+
```

### Plugin

In order to make the overall architecture more flexible to match different synchronisation scenarios, IoTDB supports plugin assembly in the above synchronisation task framework. Some common plugins are pre-built for you to use directly, and you can also customise sink plugins and load them into the IoTDB system for use.

| Modules          | Plugins       | Pre-configured Plugins                | Customised Plugins |
|------------------|---------------|---------------------------------------|--------------------| 
| Extract (Source) | Source Plugin | iotdb-source                          | Not Supported      |
| handle（Process） | Processor Plugin | ido-nothing-processor                 | Support        |
| Send (Sink)      | Sink plugin   | iotdb-thrift-sink, iotdb-air-gap-sink | Not Supported             |

#### Preconfigured Plugins

The preset plugins are listed below:

| Plugin Name           | Type          | Introduction                                                                                                                                                                                                                                                          | Available Versions |
|-----------------------|---------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------|
| iotdb-source          | source plugin | Default source plugin for extracting IoTDB historical or real-time data                                                                                                                                                                                               | **1.2.x**              |
| do-nothing-processor         | processor plugin | The default processor plugin does not handle any events passed by the source                                                                                                                                                                                               | **1.2.x**              |
| iotdb-thrift-sink     | sink plugin   | Used for data transfer between IoTDB (**V1.2.0**  and above) and IoTDB (**V1.2.0** and above). Uses the Thrift RPC framework to transfer data, multi-threaded async non-blocking IO model, high transfer performance, especially for scenarios where the target is distributed | **V1.2.x**             |
| iotdb-air-gap-sink    | sink plugin   | Used for data synchronization from IoTDB (**V1.2.2+**) to IoTDB (**V1.2.2**) across unidirectional data gates. Supported gate models include Nanrui Syskeeper 2000, etc.                                                                                                     | **V1.2.2+**             |
| iotdb-thrift-ssl-sink | sink plugin   | Used for data synchronization from IoTDB (**V1.3.1+**) to IoTDB (**V1.2.0+**). Uses the Thrift RPC framework to transfer data, single-thread blocking IO model.                                                                                                                 | 1.3.1+             |

Detailed parameters for each plugin can be found in the [Parameter Description](#sink-parameters) section of this document.

#### View Plugins

To view the plugins in the system (including custom and built-in plugins) you can use the following statement:

```SQL
SHOW PIPEPLUGINS
```

The following results are returned:

```SQL
IoTDB> show pipeplugins
+------------------------------+----------+---------------------------------------------------------------------------------+---------+
|                    PluginName|PluginType|                                                                        ClassName|PluginJar|
+------------------------------+--------------------------------------------------------------------------------------------+---------+
|          DO-NOTHING-PROCESSOR|   Builtin|        org.apache.iotdb.commons.pipe.plugin.builtin.processor.DoNothingProcessor|         |
|               DO-NOTHING-SINK|   Builtin|                  org.apache.iotdb.commons.pipe.plugin.builtin.sink.DoNothingSink|         |
|            IOTDB-AIR-GAP-SINK|   Builtin|                org.apache.iotdb.commons.pipe.plugin.builtin.sink.IoTDBAirGapSink|         |
|                  IOTDB-SOURCE|   Builtin|                  org.apache.iotdb.commons.pipe.plugin.builtin.source.IoTDBSOURCE|         |
|             IOTDB-THRIFT-SINK|   Builtin|                org.apache.iotdb.commons.pipe.plugin.builtin.sink.IoTDBThriftSink|         |
|IOTDB-THRIFT-SSL-SINK(V1.3.1+)|   Builtin|org.apache.iotdb.commons.pipe.plugin.builtin.sink.iotdb.thrift.IoTDBThriftSslSink|         |
+------------------------------+----------+---------------------------------------------------------------------------------+---------+

```
### Metadata synchronization

Starting from **V1.3.2**, the data synchronization function supports configuring metadata synchronization to another IoTDB of the same **V1.3.2** +version. The metadata synchronization function can synchronize all metadata write operations within the given path range and given sentence range from the sender to the receiver, and can synchronize all historical and real-time metadata,
Supports cross gateway synchronization and can handle various conflicts caused by asynchronous replication.

On the basis of the previous data synchronization, slight modifications can be made to configure metadata synchronization. Below are several key parameters for metadata synchronization.

#### Scope limitation
Based on the SQL example created in the previous synchronization task, make changes to support synchronizing full metadata:

```SQL
CREATE PIPE <PipeId> -- PipeId is the name that can uniquely calibrate a task
-- Data extraction plugin, required plugin
WITH SOURCE (
  'inclusion'='all',
  [<parameter> = <value>,],
-- Data connection plugin, required plugin
WITH SINK (
  [<parameter> = <value>,],
)
```

It can be seen that there is only one `inclusion` difference between metadata synchronization and data synchronization in terms of configuration scope. Here `'inclusion'='all'` represents synchronizing full data and metadata. When `'inclusion'` is not `all`, the function of `'inclusion'` follows the prefix, and the prefix tree is as follows:

![](https://alioss.timecho.com/upload/%E5%85%83%E6%95%B0%E6%8D%AE%E5%90%8C%E6%AD%A5%E8%8C%83%E5%9B%B4%E7%A4%BA%E6%84%8F%E5%9B%BE.png)

Inclusion can configure one or more prefixes, and synchronization will synchronize all data/metadata operations under each prefix. Among them, `'data.insert'` is the normal data synchronization and the default configuration for a synchronization task.

For example, when `'inclusion'='data.insert, auth'` , in addition to the original data synchronization operation, all permission related operations will also be transmitted. For example, the following operations will also be synchronized to the receiving end:

```SQL
CREATE USER user1 'passwd'
```
```SQL
GRANT READ_DATA, WRITE_DATA ON root.t1.**,root.t2.** TO USER user1;
```
`'inclusion.exclusion'` is an additional configuration of `'inclusion'`, which is used to subtract the range of `'inclusion.exclusion'` from the range of `'inclusion'`. The range of `'inclusion.exclusion'` is also based on the prefix tree. For example:

```SQL
'inclusion'='schema,auth',
'inclusion.exclusion'='schema.database'
```
Equivalent to:
```SQL
'inclusion'='schema.timeseries,schema.ttl,auth',
```
`'inclusion.exclusion'` the parameter defaults to empty.

#### Path restriction
Considering some edge cloud scenarios that use metadata synchronization, multiple group side databases hope to synchronize their operations to the headquarters receiving end, but do not want their operations to affect the data on the headquarters side. For example, when using the delete all database command to delete data, they hope that the headquarters will only delete the data of that group without affecting the synchronization of past data by other groups. In addition, there are other scenarios where only partial metadata needs to be added.

In order to meet such scenarios, metadata synchronization supports path restriction function. That is, the `'source.path'` parameter of the original data synchronization can be semantically applied to the synchronization of metadata. When enabling metadata synchronization, the `'source.path'` parameter must be a prefix path or a full path, which means it does not contain `"*"` and can only contain one `"*"`. If it does, it must be at the end of the `'path'` parameter. For example, the following `'path'` is a valid parameter:


```SQL
'path'='root.db.**',
```
```SQL
'path'='root.db.d1.s1',
```
The following path is not a valid parameter:
```SQL
'path'='root.db.*.s1',
```


Below are detailed explanations and examples:
* For database/set template operations, if it is prefixed with  `path`, it can be synchronized.
  * For example, when the  `path` is set to  `root.db.d1.**`, creating a `root.db` database will be synchronized, while `root.db1` will not be synchronized.
* For operations such as creating sequences, only matching paths will synchronize.
  * For example, when the `path` is `root.db.d1.d2.**` , the sequence `root.db.d1.d2` ill not be synchronized, while `root.db.d1.d2.s1`  will be synchronized.
* For operations containing wildcard characters such as deletion, they will be limited according to the synchronization range before synchronization.
  * For example, when  `path` is `root.db.**` , the operation of  `delete from root.**` on the sender is equivalent to  `delete from root.db.**`  on the receiver.
* When the Path is a complete sequence, the relevant metadata templates will be cropped according to the last level path.
  * For example, if the  `path` is set to  `root.db.d1.s1` , a template containing three measurement points, namely `s1`、`s2`、`s3` , will become a template with only one measurement point, `s1`, at the receiving end.

#### Conflict resolution
During the synchronization process, there may be some conflicts in transmission due to issues with asynchronous replication itself or existing metadata/data at the receiving end. During the transmission process, there may also be transmission failures due to insufficient resources or other unknown errors. Our handling of these errors is as follows:
* **Resource issues**：For errors caused by insufficient resources on the receiving end, we will retry indefinitely. Once the receiving end resources are released, normal synchronization can be achieved.
* **Idempotent problem**：If the result of a synchronization operation is consistent with the receiving end's own state, for example, attempting to create an existing sequence, metadata synchronization will directly ignore this conflict and continue to transmit the next data.
* **Conflict issues**：If a conflict is detected between the data to be synchronized and the existing data, we will default to a limited retry, but we can also configure whether to retry and infinite retry, as well as whether to print the relevant information of a certain data transmission after abandoning it.
* **Other issues**：If other issues are detected, we will default to unlimited retries. It is also possible to configure limited retries and whether to print information related to a certain data transmission after abandoning it.

For configuration parameters related to conflict and other issues, you can search for them in the "Reference: Parameter Description" section later. For cross gateway metadata synchronization, since we cannot detect the return code of the receiving end, we will ignore idempotent issues; For other issues, we will handle them as conflict issues uniformly.


#### Restrictions
The metadata synchronization function has the following limitations:
* The consensus protocol that only supports Schema region/Config Node is the ratis protocol.
* Only supports the built-in SINK plugin of IoTDB mentioned below.
* Possible conflicts may arise due to asynchronous replication and multi partition parallel transmission, which require manual resolution.
* Custom metadata related plugins are not supported.
* To prevent potential conflicts, it is recommended to disable the automatic metadata creation feature at the receiving end.
* It is recommended to perform the data deletion operation on the sending end after confirming the completion of the synchronization of the remaining data, otherwise it may result in inconsistent status between the sending and receiving ends.

## Use examples

### Full data synchronisation

This example is used to demonstrate the synchronisation of all data from one IoTDB to another IoTDB with the data link as shown below:

![](https://alioss.timecho.com/upload/pipe1.jpg)

In this example, we can create a synchronisation task named A2B to synchronise the full amount of data from IoTDB A to IoTDB B. Here we need to use the iotdb-thrift-sink plugin (built-in plugin) which uses sink, and we need to specify the address of the receiving end, in this example, we have specified 'sink.ip' and 'sink.port', and we can also specify 'sink.port'. This example specifies 'sink.ip' and 'sink.port', and also 'sink.node-urls', as in the following example statement:

```SQL
create pipe A2B
with sink (
  'sink'='iotdb-thrift-sink', 
  'sink.ip'='127.0.0.1',
  'sink.port'='6668'
)
```


### Synchronising historical data

This example is used to demonstrate the synchronisation of data from a certain historical time range (8:00pm 23 August 2023 to 8:00pm 23 October 2023) to another IoTDB, the data link is shown below:

![](https://alioss.timecho.com/upload/pipe2.jpg)

In this example we can create a synchronisation task called A2B. First of all, we need to define the range of data to be transferred in source, since the data to be transferred is historical data (historical data refers to the data that existed before the creation of the synchronisation task), we need to configure the source.realtime.enable parameter to false; at the same time, we need to configure the start-time and end-time of the data and the mode of the transfer. At the same time, you need to configure the start-time and end-time of the data and the mode of transmission, and it is recommended that the mode be set to hybrid mode (hybrid mode is a mixed transmission mode, which adopts the real-time transmission mode when there is no backlog of data, and adopts the batch transmission mode when there is a backlog of data, and automatically switches according to the internal situation of the system).

The detailed statements are as follows:

```SQL
create pipe A2B
WITH SOURCE (
'source'= 'iotdb-source',
'source.realtime.mode'='hybrid',
'source.history.start-time' = '2023.08.23T08:00:00+00:00',
'source.history.end-time' = '2023.10.23T08:00:00+00:00') 
with SINK (
'sink'='iotdb-thrift-async-sink',
'sink.node-urls'='xxxx:6668',
'sink.batch.enable'='false')
```


### Bidirectional data transfer

This example is used to demonstrate a scenario where two IoTDBs are dual-active with each other, with the data link shown below:

![](https://alioss.timecho.com/upload/pipe3.jpg)

In this example, in order to avoid an infinite loop of data, the parameter `'source.forwarding-pipe-requests` needs to be set to ``false`` on both A and B to indicate that the data transferred from the other pipe will not be forwarded. Also set `'source.history.enable'` to `false` to indicate that historical data is not transferred, i.e., data prior to the creation of the task is not synchronised.

The detailed statement is as follows:

Execute the following statements on A IoTDB:

```SQL
create pipe AB
with source (
  'source.forwarding-pipe-requests' = 'false',
with sink (
  'sink'='iotdb-thrift-sink',
  'sink.ip'='127.0.0.1',
  'sink.port'='6668'
)
```

Execute the following statements on B IoTDB:

```SQL
create pipe BA
with source (
  'source.forwarding-pipe-requests' = 'false',
with sink (
  'sink'='iotdb-thrift-sink',
  'sink.ip'='127.0.0.1',
  'sink.port'='6667'
)
```


### Cascading Data Transfer


This example is used to demonstrate a cascading data transfer scenario between multiple IoTDBs, where data is synchronised from cluster A to cluster B and then to cluster C. The data link is shown in the figure below:

![](https://alioss.timecho.com/upload/pipe4.jpg)

In this example, in order to synchronise the data from cluster A to C, the pipe between BC needs to be configured with `source.forwarding-pipe-requests` to `true`, the detailed statement is as follows:

Execute the following statement on A IoTDB to synchronise data from A to B:

```SQL
create pipe AB
with sink (
  'sink'='iotdb-thrift-sink',
  'sink.ip'='127.0.0.1',
  'sink.port'='6668'
)
```

Execute the following statement on B IoTDB to synchronise data in B to C:

```SQL
create pipe BC
with source (
  'source.forwarding-pipe-requests' = 'true',
with sink (
  'sink'='iotdb-thrift-sink',
  'sink.ip'='127.0.0.1',
  'sink.port'='6669'
)
```

### Transmission of data through an air gap

This example is used to demonstrate a scenario where data from one IoTDB is synchronised to another IoTDB via a unidirectional gate, with the data link shown below:

![](https://alioss.timecho.com/docs/img/1706698659207.jpg)

In this example, you need to use the iotdb-air-gap-sink plugin in the sink task (currently supports some models of network gates, please contact the staff of Timecho Technology to confirm the specific model), and after configuring the network gate, execute the following statements on IoTDB A, where ip and port fill in the information of the network gate, and the detailed statements are as follows:

```SQL
create pipe A2B
with sink (
  'sink'='iotdb-air-gap-sink',
  'sink.ip'='10.53.53.53',
  'sink.port'='9780'
)
```
### Downsampling data synchronization

The downsampling synchronization task can convert high-frequency data into low-frequency data, reducing storage pressure and improving processing efficiency.When creating a synchronization task, the`processor` parameter can be configured,Specify the use of the built-in`changing-value-sampling-processor`plugin (based on positional upload downsampling, supported in versions 1.3.3 and later)，or`swinging-door-trending-sampling-processor`(Trend change downsampling based on the revolving door algorithm, supported in V1.3.2 and later versions)、`tumbling-time-sampling-processor`(Downsampling based on scrolling time window, supported in V1.3.2 and later versions)plugin to implement downsampling.

```SQL
create pipe A2B
with processor (
  'processor' = 'changing-value-sampling-processor'
)
with sink (
  'node-urls' = '127.0.0.1:6668'
)
```

### Compression synchronization (1.3.2 and later versions)

IoTDB supports specifying data compression methods during synchronization.

To create a synchronization task named A2B:

```SQL
create pipe A2B 
with sink (
 'node-urls' = '127.0.0.1:6668',
 'compressor' = 'snappy,lz4'
)
```

Real time compression and transmission of data can be achieved by configuring the `compressor` parameter.`compressor` currently supports 5 optional algorithms:  snappy / gzip / lz4 / zstd / lzma2 , and can choose multiple compression algorithm combinations to compress in the order of configuration.

### Encryption synchronization (1.3.1 and later versions)

IoTDB supports the use of SSL encryption during synchronization to securely transfer data between different IoTDB instances.

Create a synchronization task named A2B:

```SQL
create pipe A2B
with sink (
  'sink'='iotdb-thrift-ssl-sink',
  'node-urls'='127.0.0.1:6667',
  'ssl.trust-store-path'='pki/trusted',
  'ssl.trust-store-pwd'='root'
)
```

By configuring SSL related parameters such as certificate address and password（`ssl.trust-store-path`）、（`ssl.trust-store-pwd`）, it can be ensured that data is protected by SSL encryption during synchronization.



## Reference: Notes

The IoTDB configuration file (iotdb-system.properties) can be modified in order to adjust the parameters for data synchronisation, such as the synchronisation data storage directory. The complete configuration is as follows:

V1.3.0+:
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

# Whether to enable receiving pipe data through air gap.
# The receiver can only return 0 or 1 in tcp mode to indicate whether the data is received successfully.
# pipe_air_gap_receiver_enabled=false

# The port for the server to receive pipe data through air gap.
# pipe_air_gap_receiver_port=9780
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

# Whether to enable receiving pipe data through air gap.
# The receiver can only return 0 or 1 in tcp mode to indicate whether the data is received successfully.
# pipe_air_gap_receiver_enabled=false

# The port for the server to receive pipe data through air gap.
# pipe_air_gap_receiver_port=9780
```

## Reference: parameter description
📌 Notes: for version 1.3.1 or later, any parameters other than "source", "processor", "sink" themselves need not be with the prefixes. For instance:
```Sql
create pipe A2B
with sink (
  'sink'='iotdb-air-gap-sink',
  'sink.ip'='10.53.53.53',
  'sink.port'='9780'
)
```
can be written as
```Sql
create pipe A2B
with sink (
  'sink'='iotdb-air-gap-sink',
  'ip'='10.53.53.53',
  'port'='9780'
)
```

### source parameter


| key                             | value                                                                     | value range                            | required or not | default value  |
|---------------------------------|---------------------------------------------------------------------------|----------------------------------------|-----------------|----------------|
| source                          | iotdb-source                                                              | String: iotdb-source                   | required        | -              |
| source.pattern                  | Path prefix for filtering time series                                     | String: any time series prefix         | optional        | root           |
| source.history.start-time       | Synchronise the start event time of historical data, including start-time | Long: [Long.MIN_VALUE, Long.MAX_VALUE] | optional        | Long.MIN_VALUE |
| source.history.end-time         | end event time for synchronised history data, contains end-time           | Long: [Long.MIN_VALUE, Long.MAX_VALUE] | optional        | Long.MAX_VALUE |
| start-time(V1.3.1+)             | Synchronise the start event time of all data, including start-time        | Long: [Long.MIN_VALUE, Long.MAX_VALUE] | optional        | Long.MIN_VALUE |
| end-time(V1.3.1+)               | end event time for synchronised all data, contains end-time               | Long: [Long.MIN_VALUE, Long.MAX_VALUE] | optional        | Long.MAX_VALUE |
| source.realtime.mode            | Extraction mode for real-time data                                        | String: hybrid, stream, batch          | optional        | hybrid         |
| source.forwarding-pipe-requests | Whether to forward data written by another Pipe (usually Data Sync)       | Boolean: true, false                   | optional        | true           |

> 💎 **Note: Difference between historical and real-time data**
>
> * **Historical data**: all data with arrival time < current system time when the pipe was created is called historical data
> * **Real-time data**: All data with arrival time >= current system time when the pipe was created is called real-time data.
> * **Full data**: full data = historical data + real time data


> 💎 **Explanation: Difference between data extraction modes hybrid, stream and batch**
>
> - **hybrid (recommended)**: In this mode, the task will give priority to real-time processing and sending of data, and automatically switch to batch sending mode when data backlog occurs, which is characterised by a balance between timeliness of data synchronisation and throughput
> - **stream**: In this mode, the task will process and send data in real time, which is characterised by high timeliness and low throughput.
> - **batch**: In this mode, the task will process and send data in batch (by underlying data file), which is characterised by low latency and high throughput.

### sink parameters

#### iotdb-thrift-sink

| key                          | value                                                                                                                                                               | value range                                                                       | required or not | default value                    |
|------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|-----------------|----------------------------------|
| sink                         | iotdb-thrift-sink or iotdb-thrift-async-sink                                                                                                                        | String: iotdb-thrift-sink or iotdb-thrift-async-sink                              | required        |                                  |
| sink.ip                      | Data service IP of a DataNode in the target IoTDB (note that the synchronisation task does not support forwarding to its own service)                               | String                                                                            | Optional        | Fill in either sink.node-urls    |
| sink.port                    | Data service port of a DataNode in the target IoTDB (note that the synchronisation task does not support forwarding to its own service)                             | Integer                                                                           | Optional        | Fill in either sink.node-urls    |
| sink.node-urls               | The url of the data service port of any number of DataNodes on the target IoTDB (note that the synchronisation task does not support forwarding to its own service) | String. Example: '127.0.0.1:6667,127.0.0.1:6668,127.0.0.1:6669', '127.0.0.1:6667' | Optional        | Fill in either sink.ip:sink.port |
| sink.batch.enable            | Whether to enable the log saving wholesale delivery mode, which is used to improve transmission throughput and reduce IOPS                                          | Boolean: true, false                                                              | Optional        | true                             |
| sink.batch.max-delay-seconds | Effective when the log save and send mode is turned on, indicates the longest time a batch of data waits before being sent (unit: s)                                | Integer                                                                           | Optional        | 1                                |
| sink.batch.size-bytes        | Effective when log saving and delivery mode is enabled, indicates the maximum saving size of a batch of data (unit: byte)                                           | Long                                                                              | Optional        |                                  |

#### iotdb-air-gap-sink

| key                               | value                                                                                                                                             | value range                                                                      | required or not | default value                    |
|-----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------|-----------------|----------------------------------|
| sink                              | iotdb-air-gap-sink                                                                                                                                | String: iotdb-air-gap-sink                                                       | required        |                                  |
| sink.ip                           | Data service IP of a DataNode in the target IoTDB                                                                                                 | String                                                                           | Optional        | Fill in either sink.node-urls    |
| sink.port                         | Data service port of a DataNode in the target IoTDB                                                                                               | Integer                                                                          | Optional        | Fill in either sink.node-urls    |
| sink.node-urls                    | URL of the data service port of any multiple DataNodes on the target                                                                              | String.Example: '127.0.0.1:6667,127.0.0.1:6668,127.0.0.1:6669', '127.0.0.1:6667' | Optional        | Fill in either sink.ip:sink.port |
| sink.air-gap.handshake-timeout-ms | The timeout length of the handshake request when the sender and the receiver try to establish a connection for the first time, unit: milliseconds | Integer                                                                          | Optional        | 5000                             |

#### iotdb-thrift-ssl-sink(V1.3.1+)

| key                          | value                                                                                                                                                               | value range                                                                       | required or not | default value                    |
|------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|-----------------|----------------------------------|
| sink                         | iotdb-thrift-sink or iotdb-thrift-async-sink                                                                                                                        | String: iotdb-thrift-sink or iotdb-thrift-sync-sink                               | required        |                                  |
| sink.ip                      | Data service IP of a DataNode in the target  IoTDB (note that the synchronisation task does not support forwarding to its own service)                              | String                                                                            | Optional        | Fill in either sink.node-urls    |
| sink.port                    | Data service port of a DataNode in the target IoTDB (note that the synchronisation task does not support forwarding to its own service)                             | Integer                                                                           | Optional        | Fill in either sink.node-urls    |
| sink.node-urls               | The url of the data service port of any number of DataNodes on the target IoTDB (note that the synchronisation task does not support forwarding to its own service) | String. Example: '127.0.0.1:6667,127.0.0.1:6668,127.0.0.1:6669', '127.0.0.1:6667' | Optional        | Fill in either sink.ip:sink.port |
| sink.batch.enable            | Whether to enable the log saving wholesale delivery mode, which is used to improve transmission throughput and reduce IOPS                                          | Boolean: true, false                                                              | Optional        | true                             |
| sink.batch.max-delay-seconds | Effective when the log save and send mode is turned on, indicates the longest time a batch of data waits before being sent (unit: s)                                | Integer                                                                           | Optional        | 1                                |
| sink.batch.size-bytes        | Effective when log saving and delivery mode is enabled, indicates the maximum saving size of a batch of data (unit: byte)                                           | Long                                                                              | Optional        |                                  |
| ssl.trust-store-path         | The certificate trust store path to connect to the target DataNodes                                                                                                 | String.Example: '127.0.0.1:6667,127.0.0.1:6668,127.0.0.1:6669', '127.0.0.1:6667'  | Optional        | Fill in either sink.ip:sink.port |
| ssl.trust-store-pwd          | The certificate trust store password to connect to the target DataNodes                                                                                             | Integer                                                                           | Optional        | 5000                             |