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

Data synchronization is a typical requirement in industrial Internet of Things (IoT). Through data synchronization mechanisms, it is possible to achieve data sharing between IoTDB, and to establish a complete data link to meet the needs for internal and external network data interconnectivity, edge-cloud synchronization, data migration, and data backup.

## Function Overview

### Data Synchronization

A data synchronization task consists of three stages:

![](https://alioss.timecho.com/docs/img/sync_en_01.png)

- Source Stage：This part is used to extract data from the source IoTDB, defined in the source section of the SQL statement.
- Process Stage：This part is used to process the data extracted from the source IoTDB, defined in the processor section of the SQL statement.
- Sink Stage：This part is used to send data to the target IoTDB, defined in the sink section of the SQL statement.

By declaratively configuring the specific content of the three parts through SQL statements, flexible data synchronization capabilities can be achieved. Currently, data synchronization supports the synchronization of the following information, and you can select the synchronization scope when creating a synchronization task (the default is data.insert, which means synchronizing newly written data):

<table style="text-align: left;">
      <tr>
            <th>Synchronization Scope</th>
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
            <td>timeseries</td>
            <td>Synchronize the definition and attributes of time series</td>       
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
</table>

### Functional limitations and instructions

The schema and auth synchronization functions have the following limitations:

- When using schema synchronization, it is required that the consensus protocol of `Schema region` and `ConfigNode` must be the default ratis protocol,  that is: In the `iotdb-common.properties` configuration file, both the `config_node_consensus_protocol_class` and `schema_region_consensus_protocol_class` configuration items are set to `org.apache.iotdb.consensus.ratis.RatisConsensus`.

- To prevent potential conflicts, please turn off the automatic creation of metadata on the receiving end when enabling schema synchronization. You can do this by setting the `enable_auto_create_schema` configuration in the `iotdb-common.properties` configuration file to false. 

- When schema synchronization is enabled, the use of custom plugins is not supported.

- In a dual-active cluster, schema synchronization should avoid simultaneous operations on both ends.

- During data synchronization tasks, please avoid performing any deletion operations to prevent inconsistent states between the two ends.

## Usage Instructions

Data synchronization tasks have three states: RUNNING, STOPPED, and DROPPED. The task state transitions are shown in the following diagram:

![](https://alioss.timecho.com/docs/img/sync_en_02.png)

Provide the following SQL statements for state management of synchronization tasks.

### Create Task

Use the `CREATE PIPE` statement to create a data synchronization task. The `PipeId` and `sink` attributes are required, while `source` and `processor` are optional. When entering the SQL, note that the order of the `SOURCE` and `SINK` plugins cannot be swapped.

The SQL example is as follows:

```SQL
CREATE PIPE <PipeId> -- PipeId is the name that uniquely identifies the task.
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

### Start Task

After creation, the task will not be processed immediately and needs to be started. Use the `START PIPE` statement to start the task and begin processing data: 

```SQL
START PIPE<PipeId>
```

### Stop Task

Stop processing data:

```SQL
STOP PIPE <PipeId>
```

###  Delete Task

Deletes the specified task:

```SQL
DROP PIPE <PipeId>
```

Deleting a task does not require stopping the synchronization task first.

### View Task

View all tasks:

```SQL
SHOW PIPES
```

To view a specified task:

```SQL
SHOW PIPE <PipeId>
```

Example of the show pipes result for a pipe:

```SQL
+--------------------------------+-----------------------+-------+---------------+--------------------+------------------------------------------------------------+----------------+
|                              ID|           CreationTime|  State|     PipeSource|      PipeProcessor|                                                     PipeSink|ExceptionMessage|
+--------------------------------+-----------------------+-------+---------------+--------------------+------------------------------------------------------------+----------------+
|3421aacb16ae46249bac96ce4048a220|2024-08-13T09:55:18.717|RUNNING|             {}|                 {}|{{sink=iotdb-thrift-sink, sink.ip=127.0.0.1, sink.port=6668}}|                |
+--------------------------------+-----------------------+-------+---------------+--------------------+------------------------------------------------------------+----------------+
```

The meanings of each column are as follows:

- **ID**：The unique identifier for the synchronization task
- **CreationTime**：The time when the synchronization task was created
- **State**：The state of the synchronization task
- **PipeSource**：The source of the synchronized data stream
- **PipeProcessor**：The processing logic of the synchronized data stream during transmission
- **PipeSink**：The destination of the synchronized data stream
- **ExceptionMessage**：Displays the exception information of the synchronization task


### Synchronization Plugins

To make the overall architecture more flexible to match different synchronization scenario requirements, we support plugin assembly within the synchronization task framework. The system comes with some pre-installed common plugins that you can use directly. At the same time, you can also customize processor plugins and Sink plugins, and load them into the IoTDB system for use. You can view the plugins in the system (including custom and built-in plugins) with the following statement:

```SQL
SHOW PIPEPLUGINS
```

The return result is as follows (version 1.3.2):

```SQL
IoTDB> SHOW PIPEPLUGINS
+---------------------+----------+-------------------------------------------------------------------------------------------+----------------------------------------------------+
|           PluginName|PluginType|                                                                                  ClassName|                                           PluginJar|
+---------------------+----------+-------------------------------------------------------------------------------------------+----------------------------------------------------+
| DO-NOTHING-PROCESSOR|   Builtin|        org.apache.iotdb.commons.pipe.plugin.builtin.processor.donothing.DoNothingProcessor|                                                    |
|      DO-NOTHING-SINK|   Builtin|        org.apache.iotdb.commons.pipe.plugin.builtin.connector.donothing.DoNothingConnector|                                                    |
|   IOTDB-AIR-GAP-SINK|   Builtin|   org.apache.iotdb.commons.pipe.plugin.builtin.connector.iotdb.airgap.IoTDBAirGapConnector|                                                    |
|         IOTDB-SOURCE|   Builtin|                org.apache.iotdb.commons.pipe.plugin.builtin.extractor.iotdb.IoTDBExtractor|                                                    |
|    IOTDB-THRIFT-SINK|   Builtin|   org.apache.iotdb.commons.pipe.plugin.builtin.connector.iotdb.thrift.IoTDBThriftConnector|                                                    |
|IOTDB-THRIFT-SSL-SINK|   Builtin|org.apache.iotdb.commons.pipe.plugin.builtin.connector.iotdb.thrift.IoTDBThriftSslConnector|                                                    |
+---------------------+----------+-------------------------------------------------------------------------------------------+----------------------------------------------------+
```

Detailed introduction of pre-installed plugins is as follows (for detailed parameters of each plugin, please refer to the [Parameter Description](#reference-parameter-description) section):

<table style="text-align: left;">
      <tr>
            <th>Type</th>
            <th>Custom Plugin</th>        
            <th>Plugin Name</th>
            <th>Description</th>
            <th>Applicable Version</th>
      </tr>
      <tr> 
            <td>source plugin</td>
            <td>Not Supported</td>
            <td>iotdb-source</td>
            <td>The default extractor plugin, used to extract historical or real-time data from IoTDB</td>
            <td>1.2.x</td>
      </tr>
      <tr>
            <td>processor plugin</td>
            <td>Supported</td>
            <td>do-nothing-processor</td>
            <td>The default processor plugin, which does not process the incoming data</td>
            <td>1.2.x</td>
      </tr>
      <tr>
            <td rowspan="4">sink plugin</td>
            <td rowspan="4">Supported</td>
            <td>do-nothing-sink</td>
            <td>Does not process the data that is sent out</td>
            <td>1.2.x</td>
      </tr>
      <tr>
            <td>iotdb-thrift-sink</td>
            <td>The default sink plugin ( V1.3.1+ ), used for data transfer between IoTDB ( V1.2.0+ ) and IoTDB( V1.2.0+ ) . It uses the Thrift RPC framework to transfer data, with a multi-threaded async non-blocking IO model, high transfer performance, especially suitable for scenarios where the target end is distributed</td>
            <td>1.2.x</td>
      </tr>
      <tr>
            <td>iotdb-air-gap-sink</td>
            <td>Used for data synchronization across unidirectional data diodes from IoTDB ( V1.2.0+ ) to IoTDB ( V1.2.0+ ). Supported diode models include Nanrui Syskeeper 2000, etc</td>
            <td>1.2.x</td>
      </tr>
      <tr>
            <td>iotdb-thrift-ssl-sink</td>
            <td>Used for data transfer between IoTDB ( V1.3.1+ ) and IoTDB ( V1.2.0+ ). It uses the Thrift RPC framework to transfer data, with a single-threaded sync blocking IO model, suitable for scenarios with higher security requirements</td>
            <td>1.3.1+</td>
      </tr>
</table>

For importing custom plugins, please refer to the [Stream Processing](./Streaming_timecho.md#custom-stream-processing-plugin-management) section.

## Use examples

### Full data synchronisation

This example is used to demonstrate the synchronisation of all data from one IoTDB to another IoTDB with the data link as shown below:

![](https://alioss.timecho.com/upload/pipe1.jpg)

In this example, we can create a synchronization task named A2B to synchronize the full data from A IoTDB to B IoTDB. The iotdb-thrift-sink plugin (built-in plugin) for the sink is required. The URL of the data service port of the DataNode node on the target IoTDB needs to be configured through node-urls, as shown in the following example statement:

```SQL
create pipe A2B
with sink (
  'sink'='iotdb-thrift-sink',
  'node-urls' = '127.0.0.1:6668',  -- The URL of the data service port of the DataNode node on the target IoTDB
```

### Partial data synchronization

This example is used to demonstrate the synchronisation of data from a certain historical time range (8:00pm 23 August 2023 to 8:00pm 23 October 2023) to another IoTDB, the data link is shown below:

![](https://alioss.timecho.com/upload/pipe2.jpg)

In this example, we can create a synchronization task named A2B. First, we need to define the range of data to be transferred in the source. Since the data being transferred is historical data (historical data refers to data that existed before the creation of the synchronization task), we need to configure the start-time and end-time of the data and the transfer mode mode. The URL of the data service port of the DataNode node on the target IoTDB needs to be configured through node-urls.

The detailed statements are as follows:

```SQL
create pipe A2B
WITH SOURCE (
  'source'= 'iotdb-source',
  'realtime.mode' = 'stream' -- The extraction mode for newly inserted data (after pipe creation)
  'start-time' = '2023.08.23T08:00:00+00:00',  -- The start event time for synchronizing all data, including start-time
  'end-time' = '2023.10.23T08:00:00+00:00'  -- The end event time for synchronizing all data, including end-time
) 
with SINK (
  'sink'='iotdb-thrift-async-sink',
  'node-urls' = '127.0.0.1:6668', -- The URL of the data service port of the DataNode node on the target IoTDB
)
```

### Bidirectional data transfer

This example is used to demonstrate the scenario where two IoTDB act as active-active pairs, with the data link shown in the figure below:

![](https://alioss.timecho.com/upload/pipe3.jpg)

In this example, to avoid infinite data loops, the `forwarding-pipe-requests` parameter on A and B needs to be set to `false`, indicating that data transmitted from another pipe is not forwarded, and to keep the data consistent on both sides, the pipe needs to be configured with `inclusion=all` to synchronize full data and metadata.

The detailed statement is as follows:

On A IoTDB, execute the following statement:

```SQL
create pipe AB
with source (
  'inclusion'='all',  -- Indicates synchronization of full data, schema , and auth
  'forwarding-pipe-requests' = 'false'   -- Do not forward data written by other Pipes
)
with sink (
  'sink'='iotdb-thrift-sink',
  'node-urls' = '127.0.0.1:6668', -- The URL of the data service port of the DataNode node on the target IoTDB
)
```

On B IoTDB, execute the following statement:

```SQL
create pipe BA
with source (
  'inclusion'='all',   -- Indicates synchronization of full data, schema , and auth
  'forwarding-pipe-requests' = 'false'   -- Do not forward data written by other Pipes
)
with sink (
  'sink'='iotdb-thrift-sink',
  'node-urls' = '127.0.0.1:6667', -- The URL of the data service port of the DataNode node on the target IoTDB
)
```

### Edge-cloud data transfer

This example is used to demonstrate the scenario where data from multiple IoTDB is transferred to the cloud, with data from clusters B, C, and D all synchronized to cluster A, as shown in the figure below:

![](https://alioss.timecho.com/docs/img/sync_en_03.png)

In this example, to synchronize the data from clusters B, C, and D to A, the pipe between BA, CA, and DA needs to configure the `path` to limit the range, and to keep the edge and cloud data consistent, the pipe needs to be configured with `inclusion=all` to synchronize full data and metadata. The detailed statement is as follows:

On B IoTDB, execute the following statement to synchronize data from B to A:

```SQL
create pipe BA
with source (
   'inclusion'='all',   -- Indicates synchronization of full data, schema , and auth
   'path'='root.db.**', -- Limit the range
)
with sink (
  'sink'='iotdb-thrift-sink',
  'node-urls' = '127.0.0.1:6668', -- The URL of the data service port of the DataNode node on the target IoTDB
)
)
```

On C IoTDB, execute the following statement to synchronize data from C to A:

```SQL
create pipe CA
with source (
   'inclusion'='all',  -- Indicates synchronization of full data, schema , and auth
   'path'='root.db.**', -- Limit the range
with sink (
  'sink'='iotdb-thrift-sink',
  'node-urls' = '127.0.0.1:6668', -- The URL of the data service port of the DataNode node on the target IoTDB
)
)
```

On D IoTDB, execute the following statement to synchronize data from D to A:

```SQL
create pipe DA
with source (
   'inclusion'='all',  -- Indicates synchronization of full data, schema , and auth
   'path'='root.db.**', -- Limit the range
)
with sink (
  'sink'='iotdb-thrift-sink',
  'node-urls' = '127.0.0.1:6668', -- The URL of the data service port of the DataNode node on the target IoTDB
)
)
```

### Cascading data transfer

This example is used to demonstrate the scenario where data is transferred in a cascading manner between multiple IoTDB, with data from cluster A synchronized to cluster B, and then to cluster C, as shown in the figure below:

![](https://alioss.timecho.com/docs/img/sync_en_04.png)

In this example, to synchronize the data from cluster A to C, the `forwarding-pipe-requests` needs to be set to `true` between BC. The detailed statement is as follows:

On A IoTDB, execute the following statement to synchronize data from A to B:

```SQL
create pipe AB
with sink (
  'sink'='iotdb-thrift-sink',
  'node-urls' = '127.0.0.1:6668', -- The URL of the data service port of the DataNode node on the target IoTDB
)
)
```

On B IoTDB, execute the following statement to synchronize data from B to C:

```SQL
create pipe BC
with source (
  'forwarding-pipe-requests' = 'true'   -- Whether to forward data written by other Pipes
)
with sink (
  'sink'='iotdb-thrift-sink',
  'node-urls' = '127.0.0.1:6669', -- The URL of the data service port of the DataNode node on the target IoTDB
)
)
```

### Cross-gate data transfer

This example is used to demonstrate the scenario where data from one IoTDB is synchronized to another IoTDB through a unidirectional gateway, as shown in the figure below:

![](https://alioss.timecho.com/upload/pipe5.jpg)


In this example, the iotdb-air-gap-sink plugin in the sink task needs to be used (currently supports some gateway models, for specific models, please contact Timecho staff for confirmation). After configuring the gateway, execute the following statement on A IoTDB. Fill in the node-urls with the URL of the data service port of the DataNode node on the target IoTDB configured by the gateway, as detailed below:

```SQL
create pipe A2B
with sink (
  'sink'='iotdb-air-gap-sink',
  'node-urls' = '10.53.53.53:9780', -- The URL of the data service port of the DataNode node on the target IoTDB
```

### Compression Synchronization (V1.3.2+)

IoTDB supports specifying data compression methods during the synchronization process. By configuring the  `compressor` parameter, real-time data compression and transmission can be achieved. The  `compressor` currently supports five optional algorithms: snappy, gzip, lz4, zstd, and lzma2, and multiple compression algorithms can be combined, compressed in the order of configuration.

For example, to create a synchronization task named A2B:

```SQL
create pipe A2B 
with sink (
 'node-urls' = '127.0.0.1:6668', -- The URL of the data service port of the DataNode node on the target IoTDB
 'compressor' = 'snappy,lz4'  -- Compression algorithms
)
```

### Encrypted Synchronization (V1.3.1+)

IoTDB supports the use of SSL encryption during the synchronization process, ensuring the secure transfer of data between different IoTDB instances. By configuring SSL-related parameters, such as the certificate address and password （`ssl.trust-store-path`）、（`ssl.trust-store-pwd`）, data can be protected by SSL encryption during the synchronization process.

For example, to create a synchronization task named A2B:

```SQL
create pipe A2B
with sink (
  'sink'='iotdb-thrift-ssl-sink',
  'node-urls'='127.0.0.1:6667',  -- The URL of the data service port of the DataNode node on the target IoTDB
  'ssl.trust-store-path'='pki/trusted',  -- The trust store certificate path required to connect to the target DataNode
  'ssl.trust-store-pwd'='root' -- The trust store certificate password required to connect to the target DataNode
)
```

## Reference: Notes

You can adjust the parameters for data synchronization by modifying the IoTDB configuration file （`iotdb-common.properties`）, such as the directory for storing synchronized data. The complete configuration is as follows:

V1.3.0/1/2:

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

# Whether to enable receiving pipe data through air gap.
# The receiver can only return 0 or 1 in tcp mode to indicate whether the data is received successfully.
# pipe_air_gap_receiver_enabled=false

# The port for the server to receive pipe data through air gap.
# pipe_air_gap_receiver_port=9780
```

## Reference: parameter description

### source parameter（V1.3.0）

| key                            | value                                                         | value range                         | required or not	 | default value       |
| :------------------------------ | :----------------------------------------------------------- | :------------------------------------- | :------- | :------------- |
| source                          | iotdb-source                                                 | String: iotdb-source                   | required	     | -              |
| source.pattern                  | Used to filter the path prefix of time series	                                   | String: any time series prefix             | optional     | root           |
| source.history.enable           | Whether to send historical data	                                             | Boolean: true / false                  | optional     | true           |
| source.history.start-time       | The start event time for synchronizing historical data, including start-time	               | Long: [Long.MIN_VALUE, Long.MAX_VALUE] | optional     | Long.MIN_VALUE |
| source.history.end-time         | The end event time for synchronizing historical data, including end-time	                 | Long: [Long.MIN_VALUE, Long.MAX_VALUE] | optional     | Long.MAX_VALUE |
| source.realtime.enable          | Whether to send real-time data	                                             | Boolean: true / false                  | optional     | true           |
| source.realtime.mode            | The extraction mode for newly inserted data (after pipe creation)	                          | String: stream, batch                  | optional     | stream         |
| source.forwarding-pipe-requests | Whether to forward data written by other Pipes (usually data synchronization)	             | Boolean: true, false                   | optional     | true           |
| source.history.loose-range      | When transferring tsfile, whether to relax the historical data (before pipe creation) range. "": Do not relax the range, select data strictly according to the set conditions "time": Relax the time range to avoid splitting TsFile, which can improve synchronization efficiency	 | String: "" / "time"                    | optional     | Empty String |

> 💎 **Explanation: Difference between Historical Data and Real-time Data**
> - **Historical Data**: All data with arrival time < the current system time when the pipe is created is called historical data.
> - **Real-time Data**：All data with arrival time >= the current system time when the pipe is created is called real-time data.
> - **Full Data**： Full data = Historical data + Real-time data
>
> 💎  **Explanation: Differences between Stream and Batch Data Extraction Modes**
> - **stream (recommended)**: In this mode, tasks process and send data in real-time. It is characterized by high timeliness and low throughput.
> - **batch**: In this mode, tasks process and send data in batches (according to the underlying data files). It is characterized by low timeliness and high throughput.

### source parameter（V1.3.1）

> In versions 1.3.1 and above, the parameters no longer require additional source, processor, and sink prefixes.

| key                            | value                                                         | value range                         | required or not	 | default value       |
| :----------------------- | :----------------------------------------------------------- | :------------------------------------- | :------- | :------------- |
| source                   | iotdb-source                                                 | String: iotdb-source                   | Required     | -              |
| pattern                  | Used to filter the path prefix of time series	                                   | String: any time series prefix	             | Optional     | root           |
| start-time               | The start event time for synchronizing all data, including start-time	              | Long: [Long.MIN_VALUE, Long.MAX_VALUE] | Optional     | Long.MIN_VALUE |
| end-time                 | The end event time for synchronizing all data, including end-time	                 | Long: [Long.MIN_VALUE, Long.MAX_VALUE] | Optional     | Long.MAX_VALUE |
| realtime.mode            | The extraction mode for newly inserted data (after pipe creation)	                          | String: stream, batch                  | Optional     | stream         |
| forwarding-pipe-requests | Whether to forward data written by other Pipes (usually data synchronization)             | Boolean: true, false                   | Optional     | true           |
| history.loose-range      | When transferring tsfile, whether to relax the historical data (before pipe creation) range. "": Do not relax the range, select data strictly according to the set conditions "time": Relax the time range to avoid splitting TsFile, which can improve synchronization efficiency	 | String: "" / "time"                    | Optional     | Empty String  |

> 💎  **Explanation**：To maintain compatibility with lower versions, history.enable, history.start-time, history.end-time, realtime.enable can still be used, but they are not recommended in the new version.
>
> 💎  **Explanation: Differences between Stream and Batch Data Extraction Modes**
> - **stream (recommended)**: In this mode, tasks process and send data in real-time. It is characterized by high timeliness and low throughput.
> - **batch**: In this mode, tasks process and send data in batches (according to the underlying data files). It is characterized by low timeliness and high throughput.

### source parameter（V1.3.2）

> In versions 1.3.1 and above, the parameters no longer require additional source, processor, and sink prefixes.

| key                            | value                                                         | value range                         | required or not	 | default value       |
| :----------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- | :------- | :------------- |
| source                   | iotdb-source                                                 | String: iotdb-source                                         | Required     | -              |
| inclusion                | Used to specify the range of data to be synchronized in the data synchronization task, including data, schema, and auth   | String:all, data(insert,delete), schema(database,timeseries,ttl), auth | Optional     | data.insert    |
| inclusion.exclusion      | Used to exclude specific operations from the range specified by inclusion, reducing the amount of data synchronized | String:all, data(insert,delete), schema(database,timeseries,ttl), auth | Optional     | -              |
| path                     | Used to filter the path pattern schema of time series and data to be synchronized / schema synchronization can only use pathpath is exact matching, parameters must be prefix paths or complete paths, i.e., cannot contain `"*"`, at most one `"**"` at the end of the path parameter  | String：IoTDB  pattern                                     | Optional     | root.**        |
| pattern                  | Used to filter the path prefix of time series	                                   | String: Optional                                   | Optional     | root           |
| start-time               | The start event time for synchronizing all data, including start-time	              | Long: [Long.MIN_VALUE, Long.MAX_VALUE]                       | Optional     | Long.MIN_VALUE |
| end-time                 | The end event time for synchronizing all data, including end-time                 | Long: [Long.MIN_VALUE, Long.MAX_VALUE]                       | Optional     | Long.MAX_VALUE |
| realtime.mode            | The extraction mode for newly inserted data (after pipe creation)                          | String: stream, batch                                        | Optional     | stream         |
| forwarding-pipe-requests | Whether to forward data written by other Pipes (usually data synchronization)             | Boolean: true, false                                         | Optional     | true           |
| history.loose-range      | When transferring tsfile, whether to relax the historical data (before pipe creation) range. "": Do not relax the range, select data strictly according to the set conditions "time": Relax the time range to avoid splitting TsFile, which can improve synchronization efficiency  | String: "" 、 "time"                                         | Optional     | ""             |
| mods.enable              | Whether to send the mods file of tsfile	                                 | Boolean: true / false                                        | Optional     | false          |

> 💎  **Explanation**：To maintain compatibility with lower versions, history.enable, history.start-time, history.end-time, realtime.enable can still be used, but they are not recommended in the new version.
>
> 💎  **Explanation: Differences between Stream and Batch Data Extraction Modes**
> - **stream (recommended)**: In this mode, tasks process and send data in real-time. It is characterized by high timeliness and low throughput.
> - **batch**: In this mode, tasks process and send data in batches (according to the underlying data files). It is characterized by low timeliness and high throughput.

### sink parameter

> In versions 1.3.1 and above, the parameters no longer require additional source, processor, and sink prefixes.

#### iotdb-thrift-sink( V1.3.0/1/2) 


| key                          | value                                                        | value Range                                               | required or not  | Default Value     |
| :--------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- | :------- | :----------- |
| sink                         | iotdb-thrift-sink or iotdb-thrift-async-sink                 | String: iotdb-thrift-sink or iotdb-thrift-async-sink         | Required     |              |
| sink.node-urls               | The URL of the data service port of any DataNode nodes on the target IoTDB (please note that synchronization tasks do not support forwarding to its own service)	 | String. Example: '127.0.0.1：6667，127.0.0.1：6668，127.0.0.1：6669'， '127.0.0.1：6667' | Required     | -            |
| sink.batch.enable            | Whether to enable batched log transmission mode to improve transmission throughput and reduce IOPS        | Boolean: true, false                                         | Optional     | true         |
| sink.batch.max-delay-seconds | Effective when batched log transmission mode is enabled, it represents the maximum waiting time for a batch of data before sending (unit: s)  | Integer                                                      | Optional     | 1            |
| sink.batch.size-bytes             | Effective when batched log transmission mode is enabled, it represents the maximum batch size for a batch of data (unit: byte)	 | Long                                                         | Optional     | 16*1024*1024 |

#### iotdb-air-gap-sink( V1.3.0/1/2) 

| key                          | value                                                        | value Range                                               | required or not  | Default Value     |
| :--------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- | :------- | :----------- |
| sink                              | iotdb-air-gap-sink                                           | String: iotdb-air-gap-sink                                   | Required     | -        |
| sink.node-urls                    | The URL of the data service port of any DataNode nodes on the target IoTDB      | String. Example: ：'127.0.0.1：6667，127.0.0.1：6668，127.0.0.1：6669'， '127.0.0.1：6667' | Required     | -        |
| sink.air-gap.handshake-timeout-ms | The timeout duration of the handshake request when the sender and receiver first attempt to establish a connection, unit: ms | Integer                                                      | Optional     | 5000     |


#### iotdb-thrift-ssl-sink( V1.3.1/2) 

| key                               | value                                                        | value Range                                                | required or not | Default Value      |
| :---------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- | :------- | :----------- |
| sink                    | iotdb-thrift-ssl-sink                                        | String: iotdb-thrift-ssl-sink                                | Required     | -            |
| node-urls               | The URL of the data service port of any DataNode nodes on the target IoTDB (please note that synchronization tasks do not support forwarding to its own service)	  | String. Example: '127.0.0.1：6667，127.0.0.1：6668，127.0.0.1：6669'， '127.0.0.1：6667' | Required     | -            |
| batch.enable            | Whether to enable batched log transmission mode to improve transmission throughput and reduce IOPS	       | Boolean: true, false                                         | Optional     | true         |
| batch.max-delay-seconds | Effective when batched log transmission mode is enabled, it represents the maximum waiting time for a batch of data before sending (unit: s)	  | Integer                                                      | Optional     | 1            |
| batch.size-bytes        | Effective when batched log transmission mode is enabled, it represents the maximum batch size for a batch of data (unit: byte)	 | Long                                                         | Optional     | 16*1024*1024 |
| ssl.trust-store-path    | The trust store certificate path required to connect to the target DataNode	              | String: certificate directory name, when configured as a relative directory, it is relative to the IoTDB root directory.  Example: '127.0.0.1:6667,127.0.0.1:6668,127.0.0.1:6669', '127.0.0.1:6667'| Required     | -            |
| ssl.trust-store-pwd     | The trust store certificate password required to connect to the target DataNode	              | Integer                                                      | Required     | -            |
