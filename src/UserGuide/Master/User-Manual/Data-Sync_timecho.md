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

# Data synchronisation
Data synchronisation is a typical requirement of industrial IoT. Through the data synchronisation mechanism, data sharing between IoTDBs can be achieved, and a complete data link can be built to meet the needs of intranet and extranet data interoperability, end-to-end cloud synchronisation, data migration, data backup, and so on.

## Introduction

### Synchronisation Task Overview

A data synchronisation task consists of 2 phases:

- Source phase: This part is used to extract data from the source IoTDB, which is defined in the source part of the SQL statement.
- Sink phase: This part is used to send data to the target IoTDB and is defined in the sink part of the SQL statement.



Flexible data synchronisation capabilities can be achieved by declaratively configuring the specifics of the 2 sections through SQL statements.

### Synchronisation Task - Create

Use the `CREATE PIPE` statement to create a data synchronisation task, the following attributes `PipeId` and `sink` are mandatory, `source` and `processor` are optional, when entering the SQL note that the order of the `SOURCE ` and `SINK` plugins are not interchangeable.

The SQL example is as follows:

```SQL
CREATE PIPE <PipeId> -- PipeId is the name that uniquely identifies the task.
-- Data Extraction Plugin, Required Plugin
WITH SOURCE (
  [<parameter> = <value>,], [<value>,]
-- Data connection plugin, required
WITH SINK (
  [<parameter> = <value>,], -- data connection plugin, required.
)
```
> 📌 Note: To use the data synchronisation feature, make sure that automatic metadata creation is enabled on the receiving side



### Synchronisation Tasks - Management

The Data Synchronisation task has three states; RUNNING, STOPPED and DROPPED.The task state transitions are shown below:

![State Migration Diagram](https://alioss.timecho.com/docs/img/%E7%8A%B6%E6%80%81%E8%BF%81%E7%A7%BB%E5%9B%BE.png)

A data synchronisation task passes through multiple states during its lifecycle:

- RUNNING: Running state.
- STOPPED: Stopped state.
  - Explanation 1: The initial state of the task is the stopped state, and you need to use SQL statements to start the task.
  - Description 2: You can also manually stop a running task with a SQL statement, and the state will change from RUNNING to STOPPED.
  - Description 3: When a task has an unrecoverable error, its status will automatically change from RUNNING to STOPPED.
- DROPPED: deleted state.

We provide the following SQL statements to manage the status of synchronisation tasks.

#### Starting a Task

After creation, the task will not be processed immediately, you need to start the task. Use the `START PIPE` statement to start the task so that it can begin processing data:

```Go
START PIPE<PipeId>
```

#### Stop the task

Stop processing data:

``` Go
STOP PIPE <PipeId>
```

#### Delete a task

Deletes the specified task:

``` Go
DROP PIPE <PipeId>
```
Deleting a task does not require you to stop synchronising the task first.
#### Viewing Tasks

View all tasks:

```Go
SHOW PIPES
```

To view a specified task:

```Go
SHOW PIPE <PipeId>.
```

### Plugin

In order to make the overall architecture more flexible to match different synchronisation scenarios, IoTDB supports plug-in assembly in the above synchronisation task framework. Some common plug-ins are pre-built for you to use directly, and you can also customise sink plug-ins and load them into the IoTDB system for use.

| Modules | Plug-ins | Pre-configured Plug-ins | Customised Plug-ins |
| ------- | -------- | ----------------------- | ------------------- | 
| Extract (Source) | Source Plugin | iotdb-source | Not Supported |
| Send (Sink) | Sink plugin | iotdb-thrift-sink, iotdb-air-gap-sink | Support |

#### Preconfigured Plugins

The preset plug-ins are listed below:

| Plugin Name | Type | Introduction | Available Versions |
| ---------------------------- | ---- | ------------------------------------------------------------ | --------- |
| iotdb-source | source plugin | Default source plugin for extracting IoTDB historical or real-time data | 1.2.x | iotdb-thrill | iotdb-thrill | iotdb-thrill | iotdb-thrill
| | iotdb-thrift-sink | sink plugin | Used for data transfer between IoTDB (v1.2.0 and above) and IoTDB (v1.2.0 and above). Uses the Thrift RPC framework to transfer data, multi-threaded async non-blocking IO model, high transfer performance, especially for scenarios where the target is distributed | 1.2.x | iotdb-air | iotdb-air | iotdb-air | iotdb-air | iotdb-air
| iotdb-air-gap-sink | sink plug-in | Used for data synchronisation from IoTDB (v1.2.2+) to IoTDB (v1.2.2+) across unidirectional data gates. Supported gate models include Nanrui Syskeeper 2000, etc. | 1.2.1+ |

Detailed parameters for each plug-in can be found in the [Parameter Description](#sink-parameters) section of this document.

#### View Plug-ins

To view the plug-ins in the system (including custom and built-in plug-ins) you can use the following statement:

```Go
SHOW PIPEPLUGINS
```

The following results are returned:

```Go
IoTDB> show pipeplugins
+--------------------+----------+---------------------------------------------------------------------------+---------+
|          PluginName|PluginType|                                                                  ClassName|PluginJar|
+--------------------+----------+---------------------------------------------------------------------------+---------+
|DO-NOTHING-PROCESSOR|   Builtin|  org.apache.iotdb.commons.pipe.plugin.builtin.processor.DoNothingProcessor|         |
|     DO-NOTHING-SINK|   Builtin|  org.apache.iotdb.commons.pipe.plugin.builtin.sink.DoNothingSink|         |
|  IOTDB-AIR-GAP-SINK|   Builtin|org.apache.iotdb.commons.pipe.plugin.builtin.sink.IoTDBAirGapSink|         |
|        IOTDB-SOURCE|   Builtin|      org.apache.iotdb.commons.pipe.plugin.builtin.source.IoTDBSOURCE|         |
|   IOTDB-THRIFT-SINK|   Builtin|org.apache.iotdb.commons.pipe.plugin.builtin.sink.IoTDBThriftSinkr|         |
|         OPC-UA-SINK|   Builtin|      org.apache.iotdb.commons.pipe.plugin.builtin.sink.OpcUaSink|         |
+--------------------+----------+---------------------------------------------------------------------------+---------+

```

## Use examples

### Full data synchronisation

This example is used to demonstrate the synchronisation of all data from one IoTDB to another IoTDB with the data link as shown below:

![](https://alioss.timecho.com/upload/pipe1.jpg)

In this example, we can create a synchronisation task named A2B to synchronise the full amount of data from IoTDB A to IoTDB B. Here we need to use the iotdb-thrift-sink plugin (built-in plugin) which uses sink, and we need to specify the address of the receiving end, in this example, we have specified 'sink.ip' and 'sink.port', and we can also specify 'sink.port'. This example specifies 'sink.ip' and 'sink.port', and also 'sink.node-urls', as in the following example statement:

```Go
create pipe A2B
with sink (
  'sink'='iotdb-thrift-sink', 'sink.ip'='iotdb-thrift-sink',
  
  'sink.port'='6668'
)
```


### Synchronising historical data

This example is used to demonstrate the synchronisation of data from a certain historical time range (8:00pm 23 August 2023 to 8:00pm 23 October 2023) to another IoTDB, the data link is shown below:

![](https://alioss.timecho.com/upload/pipe2.jpg)

In this example we can create a synchronisation task called A2B. First of all, we need to define the range of data to be transferred in source, since the data to be transferred is historical data (historical data refers to the data that existed before the creation of the synchronisation task), we need to configure the source.realtime.enable parameter to false; at the same time, we need to configure the start-time and end-time of the data and the mode mode of the transfer. At the same time, you need to configure the start-time and end-time of the data and the mode mode of transmission, and it is recommended that the mode be set to hybrid mode (hybrid mode is a mixed transmission mode, which adopts the real-time transmission mode when there is no backlog of data, and adopts the batch transmission mode when there is a backlog of data, and automatically switches according to the internal situation of the system).

The detailed statements are as follows:

```SQL
create pipe A2B
WITH SOURCE (
'source'= 'iotdb-source',
'source.realtime.enable' = 'false', 
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

```Go
create pipe AB
with source (
  'source.history.enable' = 'false',
  'source.forwarding-pipe-requests' = 'false',
with sink (
  'sink'='iotdb-thrift-sink',
  'sink.ip'='127.0.0.1',
  'sink.port'='6668'
)
```

Execute the following statements on B IoTDB:

```Go
create pipe BA
with source (
  'source.history.enable' = 'false',
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

```Go
create pipe AB
with sink (
  'sink'='iotdb-thrift-sink',
  'sink.ip'='127.0.0.1',
  'sink.port'='6668'
)
```

Execute the following statement on the B IoTDB to synchronise data in B to C:

```Go
create pipe BC
with source (
  'source.forwarding-pipe-requests' = 'true',
with sink (
  'sink'='iotdb-thrift-sink',
  'sink.ip'='127.0.0.1',
  'sink.port'='6669'
)
```

### Transmission of data across a netgate

This example is used to demonstrate a scenario where data from one IoTDB is synchronised to another IoTDB via a unidirectional gate, with the data link shown below:

![](https://alioss.timecho.com/upload/pipe5.jpg)

In this example, you need to use the iotdb-air-gap-sink plug-in in the sink task (currently supports some models of network gates, please contact the staff of Tianmou Technology to confirm the specific model), and after configuring the network gate, execute the following statements on IoTDB A, where ip and port fill in the information of the network gate, and the detailed statements are as follows:

```Go
create pipe A2B
with sink (
  'sink'='iotdb-air-gap-sink',
  'sink.ip'='10.53.53.53',
  'sink.port'='9780'
)
```

## Reference: Notes

The IoTDB configuration file (iotdb-common.properties) can be modified in order to adjust the parameters for data synchronisation, such as the synchronisation data storage directory. The complete configuration is as follows:

```Go
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

## Reference: parameter description

### source parameter


| key                                | value                                            | value range                         | required or not |default value|
| ---------------------------------- | ------------------------------------------------ | -------------------------------------- | -------- |------|
| source                          | iotdb-source                                  | String: iotdb-source                | required  | - |
| source.pattern                  | Path prefix for filtering time series                       | String: any time series prefix            | optional  | root |
| source.history.enable           | Whether to synchronise history data                                 | Boolean: true, false                   | optional | true |
| source.history.start-time       | Synchronise the start event time of historical data, including start-time   | Long: [Long.MIN_VALUE, Long.MAX_VALUE] | optional  | Long.MIN_VALUE |
| source.history.end-time         | end event time for synchronised history data, contains end-time     | Long: [Long.MIN_VALUE, Long.MAX_VALUE] | optional  | Long.MAX_VALUE |
| source.realtime.enable          | Whether to synchronise real-time data                                 | Boolean: true, false                   | optional | true |
| source.realtime.mode            | Extraction mode for real-time data                               | String: hybrid, stream, batch              | optional | hybrid |
| source.forwarding-pipe-requests | Whether to forward data written by another Pipe (usually Data Sync) | Boolean: true, false                   | optional | true |

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

| key                               | value                                                        | value range                                               | required or not | default value                                    |
| --------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- | ------------------------------------------- |
| sink                         | iotdb-thrift-sink or iotdb-thrift-sync-sink        | String: iotdb-thrift-sink or iotdb-thrift-sync-sink | required     |                                             |
| sink.ip                      | Data service IP of a Datanode node in the target  IoTDB (note that the synchronisation task does not support forwarding to its own service)             | String                                                       | Optional     | Fill in either sink.node-urls         |
| sink.port                    | Data service port of a Datanode node in the target IoTDB (note that the synchronisation task does not support forwarding to its own service)           | Integer                                                      | Optional     | Fill in either sink.node-urls         |
| sink.node-urls               | The url of the data service port of any number of DataNode nodes on the target IoTDB (note that the synchronisation task does not support forwarding to its own service)      | String. Example: '127.0.0.1:6667,127.0.0.1:6668,127.0.0.1:6669', '127.0.0.1:6667' | Optional     | Fill in either sink.ip:sink.port |
| sink.batch.enable            | Whether to enable the log saving wholesale delivery mode, which is used to improve transmission throughput and reduce IOPS        | Boolean: true, false                                         | Optional     | true                                        |
| sink.batch.max-delay-seconds | Effective when the log save and send mode is turned on, indicates the longest time a batch of data waits before being sent (unit: s) | Integer                                                      | Optional     | 1                                           |
| sink.batch.size-bytes        | Effective when log saving and delivery mode is enabled, indicates the maximum saving size of a batch of data (unit: byte)      | Long                                                                         | Optional


#### iotdb-air-gap-sink

| key                                    | value                                                        | value range                                               | required or not | default value                                    |
| -------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- | ------------------------------------------- |
| sink                              | iotdb-air-gap-sink                                      | String: iotdb-air-gap-sink                              | required     |                                             |
| sink.ip                           | Data service IP of a Datanode node in the target  IoTDB             | String                                                       | Optional     | Fill in either sink.node-urls         |
| sink.port                         | Data service port of a Datanode node in the target IoTDB           | Integer                                                      | Optional     | Fill in either sink.node-urls        |
| sink.node-urls                    | URL of the data service port of any multiple DATANODE nodes on the target      | String.Example: '127.0.0.1:6667,127.0.0.1:6668,127.0.0.1:6669', '127.0.0.1:6667' | Optional     | Fill in either sink.ip:sink.port |
| sink.air-gap.handshake-timeout-ms | The timeout length of the handshake request when the sender and the receiver try to establish a connection for the first time, unit: milliseconds | Integer                                                      | Optional     | 5000                                        |