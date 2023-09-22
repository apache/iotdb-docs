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

**A Pipe consists of three subtasks (plugins): **

- Extract
- Process
- Connect

**Pipe allows users to customize the processing logic of these three subtasks, just like handling data using UDF (User-Defined Functions)**. Within a Pipe, the aforementioned subtasks are executed and implemented by three types of plugins. Data flows through these three plugins sequentially: Pipe Extractor is used to extract data, Pipe Processor is used to process data, and Pipe Connector is used to send data to an external system.

**The model of a Pipe task is as follows: **

![Task model diagram](https://alioss.timecho.com/docs/img/%E6%B5%81%E5%A4%84%E7%90%86%E5%BC%95%E6%93%8E.jpeg)

It describes a data synchronization task, which essentially describes the attributes of the Pipe Extractor, Pipe Processor, and Pipe Connector plugins. Users can declaratively configure the specific attributes of the three subtasks through SQL statements. By combining different attributes, flexible data ETL (Extract, Transform, Load) capabilities can be achieved.

By utilizing the data synchronization functionality, a complete data pipeline can be built to fulfill various requirements such as edge-to-cloud synchronization, remote disaster recovery, and read-write workload distribution across multiple databases.

## Quick Start

**🎯 Goal: Achieve full data synchronisation of IoTDB A -> IoTDB B**

- Start two IoTDBs,A（datanode -> 127.0.0.1:6667） B（datanode -> 127.0.0.1:6668）
- create a Pipe from A -> B, and execute on A

  ```sql
  create pipe a2b
  with connector (
    'connector'='iotdb-thrift-connector',
    'connector.ip'='127.0.0.1',
    'connector.port'='6668'
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

> ❗️**Note: The current IoTDB -> IoTDB implementation of data synchronisation does not support DDL synchronisation**
>
> That is: ttl, trigger, alias, template, view, create/delete sequence, create/delete storage group, etc. are not supported.
>
> **IoTDB -> IoTDB data synchronisation requires the target IoTDB:**
>
> * Enable automatic metadata creation: manual configuration of encoding and compression of data types to be consistent with the sender is required
> * Do not enable automatic metadata creation: manually create metadata that is consistent with the source

## Synchronization task management

### Create a synchronization task

A data synchronisation task can be created using the `CREATE PIPE` statement, a sample SQL statement is shown below:

```sql
CREATE PIPE <PipeId> -- PipeId is the name that uniquely identifies the synchronisation task
WITH EXTRACTOR (
  -- Default IoTDB Data Extraction Plugin
  'extractor'                    = 'iotdb-extractor',
  -- Path prefix, only data that can match the path prefix will be extracted for subsequent processing and delivery
  'extractor.pattern'            = 'root.timecho',
  -- Whether to extract historical data
  'extractor.history.enable'     = 'true',
  -- Describes the time range of the historical data being extracted, indicating the earliest possible time
  'extractor.history.start-time' = '2011.12.03T10:15:30+01:00',
  -- Describes the time range of the extracted historical data, indicating the latest time
  'extractor.history.end-time'   = '2022.12.03T10:15:30+01:00',
  -- Whether to extract real-time data
  'extractor.realtime.enable'    = 'true',
)
WITH PROCESSOR (
  -- Default data processing plugin, means no processing
  'processor'                    = 'do-nothing-processor',
)
WITH CONNECTOR (
  -- IoTDB data sending plugin with target IoTDB
  'connector'                    = 'iotdb-thrift-connector',
  -- Data service for one of the DataNode nodes on the target IoTDB ip
  'connector.ip'                 = '127.0.0.1',
  -- Data service port of one of the DataNode nodes of the target IoTDB
  'connector.port'               = '6667',
)
```

**To create a synchronisation task it is necessary to configure the PipeId and the parameters of the three plugin sections:**


| 配置项    | 说明                                              | 是否必填                    | 默认实现             | 默认实现说明                                           | 是否允许自定义实现        |
| --------- | ------------------------------------------------- | --------------------------- | -------------------- | ------------------------------------------------------ | ------------------------- |
| PipeId    | 全局唯一标定一个同步任务的名称                    | <font color=red>必填</font> | -                    | -                                                      | -                         |
| extractor | Pipe Extractor 插件，负责在数据库底层抽取同步数据 | 选填                        | iotdb-extractor      | 将数据库的全量历史数据和后续到达的实时数据接入同步任务 | 否                        |
| processor | Pipe Processor 插件，负责处理数据                 | 选填                        | do-nothing-processor | 对传入的数据不做任何处理                               | <font color=red>是</font> |
| connector | Pipe Connector 插件，负责发送数据                 | <font color=red>必填</font> | -                    | -                                                      | <font color=red>是</font> |

In the example, the iotdb-extractor, do-nothing-processor, and iotdb-thrift-connector plug-ins are used to build the data synchronisation task. iotdb has other built-in data synchronisation plug-ins, **see the section "System pre-built data synchronisation plug-ins" **. See the "System Preconfigured Data Synchronisation Plugins" section**.

**An example of a minimalist CREATE PIPE statement is as follows:**

```sql
CREATE PIPE <PipeId> -- PipeId 是能够唯一标定任务任务的名字
WITH CONNECTOR (
  -- IoTDB 数据发送插件，目标端为 IoTDB
  'connector'      = 'iotdb-thrift-connector',
  -- 目标端 IoTDB 其中一个 DataNode 节点的数据服务 ip
  'connector.ip'   = '127.0.0.1',
  -- 目标端 IoTDB 其中一个 DataNode 节点的数据服务 port
  'connector.port' = '6667',
)
```

The expressed semantics are: synchronise the full amount of historical data and subsequent arrivals of real-time data from this database instance to the IoTDB instance with target 127.0.0.1:6667.

**注意：**

- EXTRACTOR 和 PROCESSOR 为选填配置，若不填写配置参数，系统则会采用相应的默认实现
- CONNECTOR 为必填配置，需要在 CREATE PIPE 语句中声明式配置
- CONNECTOR 具备自复用能力。对于不同的任务，如果他们的 CONNECTOR 具备完全相同 KV 属性的（所有属性的 key 对应的 value 都相同），**那么系统最终只会创建一个 CONNECTOR 实例**，以实现对连接资源的复用。

  - 例如，有下面 pipe1, pipe2 两个任务的声明：

  ```sql
  CREATE PIPE pipe1
  WITH CONNECTOR (
    'connector' = 'iotdb-thrift-connector',
    'connector.thrift.host' = 'localhost',
    'connector.thrift.port' = '9999',
  )

  CREATE PIPE pipe2
  WITH CONNECTOR (
    'connector' = 'iotdb-thrift-connector',
    'connector.thrift.port' = '9999',
    'connector.thrift.host' = 'localhost',
  )
  ```

  - 因为它们对 CONNECTOR 的声明完全相同（**即使某些属性声明时的顺序不同**），所以框架会自动对它们声明的 CONNECTOR 进行复用，最终 pipe1, pipe2 的CONNECTOR 将会是同一个实例。
- 请不要构建出包含数据循环同步的应用场景（会导致无限循环）：

  - IoTDB A -> IoTDB B -> IoTDB A
  - IoTDB A -> IoTDB A

### 启动任务

CREATE PIPE 语句成功执行后，任务相关实例会被创建，但整个任务的运行状态会被置为 STOPPED，即任务不会立刻处理数据。

可以使用 START PIPE 语句使任务开始处理数据：

```sql
START PIPE <PipeId>
```

### 停止任务

使用 STOP PIPE 语句使任务停止处理数据：

```sql
STOP PIPE <PipeId>
```

### 删除任务

使用 DROP PIPE 语句使任务停止处理数据（当任务状态为 RUNNING 时），然后删除整个任务同步任务：

```sql
DROP PIPE <PipeId>
```

用户在删除任务前，不需要执行 STOP 操作。

### 展示任务

使用 SHOW PIPES 语句查看所有任务：

```sql
SHOW PIPES
```

查询结果如下：

```sql
+-----------+-----------------------+-------+-------------+-------------+-------------+----------------+
|         ID|          CreationTime |  State|PipeExtractor|PipeProcessor|PipeConnector|ExceptionMessage|
+-----------+-----------------------+-------+-------------+-------------+-------------+----------------+
|iotdb-kafka|2022-03-30T20:58:30.689|RUNNING|          ...|          ...|          ...|            None|
+-----------+-----------------------+-------+-------------+-------------+-------------+----------------+
|iotdb-iotdb|2022-03-31T12:55:28.129|STOPPED|          ...|          ...|          ...| TException: ...|
+-----------+-----------------------+-------+-------------+-------------+-------------+----------------+
```

可以使用 `<PipeId>` 指定想看的某个同步任务状态：

```sql
SHOW PIPE <PipeId>
```

您也可以通过 where 子句，判断某个 \<PipeId\> 使用的 Pipe Connector 被复用的情况。

```sql
SHOW PIPES
WHERE CONNECTOR USED BY <PipeId>
```

### 任务运行状态迁移

一个数据同步 pipe 在其被管理的生命周期中会经过多种状态：

- **STOPPED：** pipe 处于停止运行状态。当管道处于该状态时，有如下几种可能：
  - 当一个 pipe 被成功创建之后，其初始状态为暂停状态
  - 用户手动将一个处于正常运行状态的 pipe 暂停，其状态会被动从 RUNNING 变为 STOPPED
  - 当一个 pipe 运行过程中出现无法恢复的错误时，其状态会自动从 RUNNING 变为 STOPPED
- **RUNNING：** pipe 正在正常工作
- **DROPPED：** pipe 任务被永久删除

下图表明了所有状态以及状态的迁移：

![状态迁移图](https://alioss.timecho.com/docs/img/%E7%8A%B6%E6%80%81%E8%BF%81%E7%A7%BB%E5%9B%BE.png)

## 系统预置数据同步插件

### 查看预置插件

用户可以按需查看系统中的插件。查看插件的语句如图所示。

```sql
SHOW PIPEPLUGINS
```

### 预置 extractor 插件

#### iotdb-extractor

作用：抽取 IoTDB 内部的历史或实时数据进入 pipe。


| key                                | value                                            | value range                         | required or optional with default |
| ---------------------------------- | ------------------------------------------------ | -------------------------------------- | --------------------------------- |
| extractor                          | iotdb-extractor                                  | String: iotdb-extractor                | required                          |
| extractor.pattern                  | 用于筛选时间序列的路径前缀                       | String: 任意的时间序列前缀             | optional: root                    |
| extractor.history.enable           | 是否同步历史数据                                 | Boolean: true, false                   | optional: true                    |
| extractor.history.start-time       | 同步历史数据的开始 event time，包含 start-time   | Long: [Long.MIN_VALUE, Long.MAX_VALUE] | optional: Long.MIN_VALUE          |
| extractor.history.end-time         | 同步历史数据的结束 event time，包含 end-time     | Long: [Long.MIN_VALUE, Long.MAX_VALUE] | optional: Long.MAX_VALUE          |
| extractor.realtime.enable          | 是否同步实时数据                                 | Boolean: true, false                   | optional: true                    |

> 🚫 **extractor.pattern 参数说明**
>
> * Pattern 需用反引号修饰不合法字符或者是不合法路径节点，例如如果希望筛选 root.\`a@b\` 或者 root.\`123\`，应设置 pattern 为 root.\`a@b\` 或者 root.\`123\`（具体参考 [单双引号和反引号的使用时机](https://iotdb.apache.org/zh/Download/#_1-0-版本不兼容的语法详细说明)）
> * 在底层实现中，当检测到 pattern 为 root（默认值）时，同步效率较高，其他任意格式都将降低性能
> * 路径前缀不需要能够构成完整的路径。例如，当创建一个包含参数为 'extractor.pattern'='root.aligned.1' 的 pipe 时：
>
>   * root.aligned.1TS
>   * root.aligned.1TS.\`1\`
>   * root.aligned.100TS
>
>   的数据会被同步；
>
>   * root.aligned.\`1\`
>   * root.aligned.\`123\`
>
>   的数据不会被同步。

> ❗️**extractor.history 的 start-time，end-time 参数说明**
>
> * start-time，end-time 应为 ISO 格式，例如 2011-12-03T10:15:30 或 2011-12-03T10:15:30+01:00

> ✅ **一条数据从生产到落库 IoTDB，包含两个关键的时间概念**
>
> * **event time：** 数据实际生产时的时间（或者数据生产系统给数据赋予的生成时间，是数据点中的时间项），也称为事件时间。
> * **arrival time：** 数据到达 IoTDB 系统内的时间。
>
> 我们常说的乱序数据，指的是数据到达时，其 **event time** 远落后于当前系统时间（或者已经落库的最大 **event time**）的数据。另一方面，不论是乱序数据还是顺序数据，只要它们是新到达系统的，那它们的 **arrival time** 都是会随着数据到达 IoTDB 的顺序递增的。

> 💎 **iotdb-extractor 的工作可以拆分成两个阶段**
>
> 1. 历史数据抽取：所有 **arrival time** < 创建 pipe 时**当前系统时间**的数据称为历史数据
> 2. 实时数据抽取：所有 **arrival time** >= 创建 pipe 时**当前系统时间**的数据称为实时数据
>
> 历史数据传输阶段和实时数据传输阶段，**两阶段串行执行，只有当历史数据传输阶段完成后，才执行实时数据传输阶段。**
>
> 用户可以指定 iotdb-extractor 进行：
>
> * 历史数据抽取（`'extractor.history.enable' = 'true'`, `'extractor.realtime.enable' = 'false'` ）
> * 实时数据抽取（`'extractor.history.enable' = 'false'`, `'extractor.realtime.enable' = 'true'` ）
> * 全量数据抽取（`'extractor.history.enable' = 'true'`, `'extractor.realtime.enable' = 'true'` ）
> * 禁止同时设置 `extractor.history.enable` 和 `extractor.realtime.enable` 为 `false`

### pre-processor plugin

#### do-nothing-processor

Function: Do not do anything with the events passed in by the extractor.


| key       | value                | value range               | required or optional with default |
| --------- | -------------------- | ---------------------------- | --------------------------------- |
| processor | do-nothing-processor | String: do-nothing-processor | required                          |

### pre-connector plugin

#### iotdb-thrift-sync-connector(alias:iotdb-thrift-connector)

Function: Primarily used for data transfer between IoTDB instances (v1.2.0+). Data is transmitted using the Thrift RPC framework and a single-threaded blocking IO model. It guarantees that the receiving end applies the data in the same order as the sending end receives the write requests.

Limitation: Both the source and target IoTDB versions need to be v1.2.0+.


| key                               | value                                                                       | value range                                                               | required or optional with default                     |
| --------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------- |
| connector                         | iotdb-thrift-connector 或 iotdb-thrift-sync-connector                       | String: iotdb-thrift-connector 或 iotdb-thrift-sync-connector                | required                                              |
| connector.ip                      | 目标端 IoTDB 其中一个 DataNode 节点的数据服务 ip                            | String                                                                       | optional: 与 connector.node-urls 任选其一填写         |
| connector.port                    | 目标端 IoTDB 其中一个 DataNode 节点的数据服务 port                          | Integer                                                                      | optional: 与 connector.node-urls 任选其一填写         |
| connector.node-urls               | 目标端 IoTDB 任意多个 DataNode 节点的数据服务端口的 url                     | String。例：'127.0.0.1:6667,127.0.0.1:6668,127.0.0.1:6669', '127.0.0.1:6667' | optional: 与 connector.ip:connector.port 任选其一填写 |

> 📌 Please ensure that the receiving end has already created all the time series present in the sending end or has enabled automatic metadata creation. Otherwise, it may result in the failure of the pipe operation.

#### iotdb-thrift-async-connector

Function: Primarily used for data transfer between IoTDB instances (v1.2.0+).
Data is transmitted using the Thrift RPC framework, employing a multi-threaded async non-blocking IO model, resulting in high transfer performance. It is particularly suitable for distributed scenarios on the target end.
It does not guarantee that the receiving end applies the data in the same order as the sending end receives the write requests, but it guarantees data integrity (at-least-once).

Limitation: Both the source and target IoTDB versions need to be v1.2.0+.


| key                               | value                                                                       | value range                                                               | required or optional with default                     |
| --------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------- |
| connector                         | iotdb-thrift-async-connector                                                | String: iotdb-thrift-async-connector                                         | required                                              |
| connector.ip                      | 目标端 IoTDB 其中一个 DataNode 节点的数据服务 ip                            | String                                                                       | optional: 与 connector.node-urls 任选其一填写         |
| connector.port                    | 目标端 IoTDB 其中一个 DataNode 节点的数据服务 port                          | Integer                                                                      | optional: 与 connector.node-urls 任选其一填写         |
| connector.node-urls               | 目标端 IoTDB 任意多个 DataNode 节点的数据服务端口的 url                     | String。例：'127.0.0.1:6667,127.0.0.1:6668,127.0.0.1:6669', '127.0.0.1:6667' | optional: 与 connector.ip:connector.port 任选其一填写 |

> 📌 Please ensure that the receiving end has already created all the time series present in the sending end or has enabled automatic metadata creation. Otherwise, it may result in the failure of the pipe operation.

#### iotdb-legacy-pipe-connector

Function: Mainly used to transfer data from IoTDB (v1.2.0+) to lower versions of IoTDB, using the data synchronization (Sync) protocol before version v1.2.0.
Data is transmitted using the Thrift RPC framework. It employs a single-threaded sync blocking IO model, resulting in weak transfer performance.

Limitation: The source IoTDB version needs to be v1.2.0+. The target IoTDB version can be either v1.2.0+, v1.1.x (lower versions of IoTDB are theoretically supported but untested).

Note: In theory, any version prior to v1.2.0 of IoTDB can serve as the data synchronization (Sync) receiver for v1.2.0+.


| key                | value                                                                 | value range                      | required or optional with default |
| ------------------ | --------------------------------------------------------------------- | ----------------------------------- | --------------------------------- |
| connector          | iotdb-legacy-pipe-connector                                           | String: iotdb-legacy-pipe-connector | required                          |
| connector.ip       | 目标端 IoTDB 其中一个 DataNode 节点的数据服务 ip                      | String                              | required                          |
| connector.port     | 目标端 IoTDB 其中一个 DataNode 节点的数据服务 port                    | Integer                             | required                          |
| connector.user     | 目标端 IoTDB 的用户名，注意该用户需要支持数据写入、TsFile Load 的权限 | String                              | optional: root                    |
| connector.password | 目标端 IoTDB 的密码，注意该用户需要支持数据写入、TsFile Load 的权限   | String                              | optional: root                    |
| connector.version  | 目标端 IoTDB 的版本，用于伪装自身实际版本，绕过目标端的版本一致性检查 | String                              | optional: 1.1                     |

> 📌 Make sure that the receiver has created all the time series on the sender side, or that automatic metadata creation is turned on, otherwise the pipe run will fail.

#### do-nothing-connector

Function: Does not do anything with the events passed in by the processor.


| key       | value                | value range               | required or optional with default |
| --------- | -------------------- | ---------------------------- | --------------------------------- |
| connector | do-nothing-connector | String: do-nothing-connector | required                          |

## Authority Management

| Authority Name    | Description                 |
| ----------- | -------------------- |
| CREATE_PIPE | Register task,path-independent |
| START_PIPE  | Start task,path-independent |
| STOP_PIPE   | Stop task,path-independent |
| DROP_PIPE   | Uninstall task,path-independent |
| SHOW_PIPES  | Query task,path-independent |

## Configure Parameters

In iotdb-common.properties ：

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

## Functionality Features

### At least one semantic guarantee **at-least-once**

The data synchronization feature provides an at-least-once delivery semantic when transferring data to external systems. In most scenarios, the synchronization feature guarantees exactly-once delivery, ensuring that all data is synchronized exactly once.

However, in the following scenarios, it is possible for some data to be synchronized multiple times **(due to resumable transmission)**:

- Temporary network failures: If a data transmission request fails, the system will retry sending it until reaching the maximum retry attempts.
- Abnormal implementation of the Pipe plugin logic: If an error is thrown during the plugin's execution, the system will retry sending the data until reaching the maximum retry attempts.
- Data partition switching due to node failures or restarts: After the partition change is completed, the affected data will be retransmitted.
- Cluster unavailability: Once the cluster becomes available again, the affected data will be retransmitted.

### Source End: Data Writing with Pipe Processing and Asynchronous Decoupling of Data Transmission

In the data synchronization feature, data transfer adopts an asynchronous replication mode.

Data synchronization is completely decoupled from the writing operation, eliminating any impact on the critical path of writing. This mechanism allows the framework to maintain the writing speed of a time-series database while ensuring continuous data synchronization.

### Source End: High Availability of Pipe Service in a Highly Available Cluster Deployment

When the sender end IoTDB is deployed in a high availability cluster mode, the data synchronization service will also be highly available. The data synchronization framework monitors the data synchronization progress of each data node and periodically takes lightweight distributed consistent snapshots to preserve the synchronization state.

- In the event of a failure of a data node in the sender cluster, the data synchronization framework can leverage the consistent snapshot and the data stored in replicas to quickly recover and resume synchronization, thus achieving high availability of the data synchronization service.
- In the event of a complete failure and restart of the sender cluster, the data synchronization framework can also use snapshots to recover the synchronization service.
