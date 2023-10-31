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

数据同步是工业物联网的典型需求，通过数据同步机制，可实现不同数据库的数据共享，搭建完整的数据链路来满足内网外网数据互通、端*边云同步、**数据迁移、**异地灾备、读写负载分库*等需求。

# 功能介绍

## 同步任务 - 整体框架

一个数据同步任务称为 Pipe，如图所示，一个 Pipe 包含三个子阶段：

![任务模型图](https://alioss.timecho.com/docs/img/%E6%B5%81%E5%A4%84%E7%90%86%E5%BC%95%E6%93%8E.jpeg)

- 抽取（Extract）：由 Extractor 插件实现，用于抽取数据
- 处理（Process）：由 Processor 插件实现，用于处理数据
- 发送（Connect）：由 Connector 插件实现，用于发送数据

通过 SQL 语句声明式地配置三个子任务的具体插件，组合每个插件不同的属性，可实现灵活的数据 ETL 能力。

## 同步任务 - 创建

使用 `CREATE PIPE` 语句来创建一条数据同步任务，下列属性中`PipeId`和`connector`必填,`extractor`和`processor`选填，输入SQL时注意 `EXTRACTOR `与 `CONNECTOR` 插件顺序不能替换。

SQL 示例如下：

```Go
CREATE PIPE <PipeId> -- PipeId 是能够唯一标定任务任务的名字
WITH EXTRACTOR (
  -- IoTDB 数据抽取插件，默认为 'iotdb-extractor'
  'extractor'                    = 'iotdb-extractor',
  -- 以下为 IoTDB 数据抽取插件参数，此处为示例，详细参数见本文extractor参数部分
  'extractor.pattern'            = 'root.timecho',
  'extractor.history.enable'     = 'true',
  'extractor.history.start-time' = '2011.12.03T10:15:30+01:00',
  'extractor.history.end-time'   = '2022.12.03T10:15:30+01:00',
  'extractor.realtime.enable'    = 'true',
  'extractor.realtime.mode'      = 'hybrid',
  'extractor.forwarding-pipe-requests'      = 'hybrid',
WITH PROCESSOR (
  -- 数据处理插件，即不做任何处理
  'processor'                    = 'do-nothing-processor',
)
WITH CONNECTOR (
  -- IoTDB 数据发送插件，目标端为 IoTDB
  'connector'      = '',
  -- 目标端 IoTDB 其中一个 DataNode 节点的数据服务 ip
  'connector.ip'   = '127.0.0.1',
  -- 目标端 IoTDB 其中一个 DataNode 节点的数据服务 port
  'connector.port' = '6667',
)
```

## 同步任务 - 管理

数据同步任务有三种状态：RUNNING、STOPPED和DROPPED。

任务状态转换如下图所示：
![状态迁移图](https://alioss.timecho.com/docs/img/%E7%8A%B6%E6%80%81%E8%BF%81%E7%A7%BB%E5%9B%BE.png)

- 任务的初始状态为停止状态（STOPPED）。可以使用SQL语句启动任务，将状态从STOPPED转换为RUNNING。

- 用户可以使用SQL语句手动将运行状态的任务停止，将状态从RUNNING转换为STOPPED。

- 当任务遇到无法恢复的错误时，其状态会自动从RUNNING转换为STOPPED，这表示任务无法继续执行数据同步操作。

- 如果需要删除一个任务，可以使用相应命令。删除之前无需转换为STOPPED状态。

我们提供以下SQL语句对同步任务进行状态管理。

### 启动任务

创建之后，任务不会立即被处理，需要启动任务。使用`START PIPE`语句来启动任务，从而开始处理数据：

```Go
START PIPE<PipeId>
```

### 停止任务

停止处理数据：

```Go
STOP PIPE <PipeId>
```

###  删除任务

删除指定任务：

```Go
DROP PIPE <PipeId>
```

### 查看任务

查看全部任务：

```Go
SHOW PIPES
```

查看指定任务：

```Go
SHOW PIPE <PipeId>
```

## 插件

为了使得整体架构更加灵活以匹配不同的同步场景需求，在上述同步任务框架中IoTDB支持进行插件组装。系统为您预置了一些常用插件可直接使用，同时您也可以自定义 processor 插件和 connector 插件，并加载至IoTDB系统进行使用。

| 模块 | 插件 | 预置插件 | 自定义插件 |
| --- | --- | --- | --- |
| 抽取（Extract） | Extractor 插件 | iotdb-extractor | 不支持 |
| 处理（Process） | Processor 插件 | do-nothing-processor  | 支持 |
| 发送（Connect） | Connector 插件 | iotdb-thrift-sync-connector iotdb-thrift-async-connector iotdb-legacy-pipe-connector iotdb-air-gap-connector websocket - connector | 支持 |

### 预置插件

预置插件如下：

| 插件名称                     |  类型    | 介绍                                                         | 适用版本  |
| ---------------------------- | ---- | ------------------------------------------------------------ | --------- |
| iotdb-extractor              |   extractor 插件   | 抽取 IoTDB 内部的历史或实时数据进入 pipe                     | 1.2.x     |
| do-nothing-processor         |    processor 插件  | 不对 extractor 传入的事件做任何的处理                        | 1.2.x     |
| iotdb-thrift-sync-connector  |    connector 插件  | 主要用于 IoTDB（v1.2.0及以上）与 IoTDB（v1.2.0及以上）之间的数据传输。 使用 Thrift RPC 框架传输数据，单线程 blocking IO 模型 | 1.2.x     |
| iotdb-thrift-async-connector |    connector 插件  | 用于 IoTDB（v1.2.0及以上）与 IoTDB（v1.2.0及以上）之间的数据传输。使用 Thrift RPC 框架传输数据，多线程 async non-blocking IO 模型，传输性能高，尤其适用于目标端为分布式时的场景 | 1.2.x     |
| iotdb-legacy-pipe-connector  |    connector 插件  | 用于 IoTDB（v1.2.0及以上）与低版本的 IoTDB （V1.2.0以前）之间的数据传输。 使用 Thrift RPC 框架传输数据 | 1.2.x     |
| iotdb-air-gap-connector      |    connector 插件  | 用于 IoTDB（v1.2.2+）向 IoTDB（v1.2.2+）跨单向数据网闸的数据同步。支持的网闸型号包括南瑞 Syskeeper 2000 等 | 1.2.1以上 |
| websocket - connector        |    connector 插件  | 用于flink sql connector 传输数据                             | 1.2.2以上 |

每个插件的属性参考[参数说明](#connector-参数)。
### 自定义插件

自定义插件方法参考[自定义流处理插件开发](Streaming_timecho.md#自定义流处理插件开发)一章。

### 查看插件

查看系统中的插件（含自定义与内置插件）可以用以下语句：

```Go
SHOW PIPEPLUGINS
```

返回结果如下（1.2.2 版本）：

```Go
IoTDB> SHOW PIPEPLUGINS
+----------------------------+----------+--------------------------------------------------------------------------------+----------------------------------------------------+
|                  PluginName|PluginType|                                                                       ClassName|                                           PluginJar|
+----------------------------+----------+--------------------------------------------------------------------------------+----------------------------------------------------+
|        DO-NOTHING-CONNECTOR|   Builtin|       org.apache.iotdb.commons.pipe.plugin.builtin.connector.DoNothingConnector|                                                    |
|        DO-NOTHING-PROCESSOR|   Builtin|       org.apache.iotdb.commons.pipe.plugin.builtin.processor.DoNothingProcessor|                                                    |
|     IOTDB-AIR-GAP-CONNECTOR|   Builtin|     org.apache.iotdb.commons.pipe.plugin.builtin.connector.IoTDBAirGapConnector|                                                    |
|             IOTDB-EXTRACTOR|   Builtin|           org.apache.iotdb.commons.pipe.plugin.builtin.extractor.IoTDBExtractor|                                                    |
| IOTDB-LEGACY-PIPE-CONNECTOR|   Builtin| org.apache.iotdb.commons.pipe.plugin.builtin.connector.IoTDBLegacyPipeConnector|                                                    |
|IOTDB-THRIFT-ASYNC-CONNECTOR|   Builtin|org.apache.iotdb.commons.pipe.plugin.builtin.connector.IoTDBThriftAsyncConnector|                                                    |
|      IOTDB-THRIFT-CONNECTOR|   Builtin|     org.apache.iotdb.commons.pipe.plugin.builtin.connector.IoTDBThriftConnector|                                                    |
| IOTDB-THRIFT-SYNC-CONNECTOR|   Builtin| org.apache.iotdb.commons.pipe.plugin.builtin.connector.IoTDBThriftSyncConnector|                                                    |
+----------------------------+----------+--------------------------------------------------------------------------------+----------------------------------------------------+
```

# 使用示例

## 全量数据同步

创建一个名为 A2B, 功能为同步 A IoTDB 到 B IoTDB 间的全量数据，数据链路如下图所示：

![](https://alioss.timecho.com/docs/img/w1.png)
可使用如下语句：

```Go
create pipe A2B
with connector (
  'connector'='iotdb-thrift-connector',
  'connector.ip'='127.0.0.1',
  'connector.port'='6668'
)
```

## 部分数据同步

创建一个名为 实时数据, 功能为同步 A IoTDB 到 B IoTDB 间的2023年8月23日8点到2023年10月23日8点的数据，数据链路如下图所示。

![](https://alioss.timecho.com/docs/img/w2.png)

可使用如下语句：

```Go
create pipe A2B
WITH EXTRACTOR (
'extractor'= 'iotdb-extractor',
'extractor.realtime.enable' = 'false', 
'extractor.realtime.mode'='file',
'extractor.history.start-time' = '2023.08.23T08:00:00+00:00',
'extractor.history.end-time' = '2023.10.23T08:00:00+00:00') 
with connector (
'connector'='iotdb-thrift-async-connector',
'connector.node-urls'='xxxx:6668',
'connector.batch.enable'='false')
```
> 📌 'extractor.realtime.mode'='file'表示实时数据的抽取模式为 file 模式，该模式下，任务仅使用数据文件进行数据处理、发送。

> 📌'extractor.realtime.enable' = 'false', 表示不同步实时数据，即创建该任务后到达的数据都不传输。

> 📌 start-time，end-time 应为 ISO 格式。	
## 双向数据传输

要实现两个 IoTDB 之间互相备份，实时同步的功能，如下图所示：

![](https://alioss.timecho.com/docs/img/w3.png)

可创建两个子任务, 功能为双向同步 A IoTDB 到 B IoTDB 间的实时数据，在 A IoTDB  上执行下列语句：

```Go
create pipe AB
with extractor (
  'extractor.history.enable' = 'false',
  'extractor.forwarding-pipe-requests' = 'false',
with connector (
  'connector'='iotdb-thrift-connector',
  'connector.ip'='127.0.0.1',
  'connector.port'='6668'
)
```

在 B IoTDB 上执行下列语句：

```Go
create pipe BA
with extractor (
  'extractor.history.enable' = 'false',
  'extractor.forwarding-pipe-requests' = 'false',
with connector (
  'connector'='iotdb-thrift-connector',
  'connector.ip'='127.0.0.1',
  'connector.port'='6667'
)
```
> 📌 'extractor.history.enable' = 'false'表示不传输历史数据，即不同步创建该任务前的数据。

> 📌 'extractor.forwarding-pipe-requests' = 'false'表示不转发从另一 pipe 传输而来的数据，A  和 B 上的的 pipe 都需要将该参数设置为 false，否则将会造成数据无休止的集群间循环转发。


## 级联数据传输

要实现 A IoTDB 到 B IoTDB 到 C IoTDB 之间的级联数据传输链路，如下图所示：

![](https://alioss.timecho.com/docs/img/w4.png)

创建一个名为 AB 的pipe，在 A IoTDB  上执行下列语句：

```Go
create pipe AB
with extractor (
  'extractor.forwarding-pipe-requests',
with connector (
  'connector'='iotdb-thrift-connector',
  'connector.ip'='127.0.0.1',
  'connector.port'='6668'
)
```

创建一个名为 BC 的pipe，在 B IoTDB 上执行下列语句：

```Go
create pipe BC
with extractor (
  'extractor.forwarding-pipe-requests' = 'false',
with connector (
  'connector'='iotdb-thrift-connector',
  'connector.ip'='127.0.0.1',
  'connector.port'='6669'
)
```

## 跨网闸数据传输

创建一个名为 A2B 的pipe，实现内网服务器上的 A，经由单向网闸，传输数据到外网服务器上的B，如下图所示：

![](https://alioss.timecho.com/docs/img/w5.png)


配置网闸后，在 A IoTDB 上执行下列语句：

```Go
create pipe A2B
with connector (
  'connector'='iotdb-air-gap-connector',
  'connector.ip'='10.53.53.53',
  'connector.port'='9780'
)
```

# 参考：注意事项

- 使用数据同步功能，请保证接收端开启自动创建元数据；
- Pipe 中的数据含义:

1. 历史数据抽取：所有 arrival time < 创建 pipe 时当前系统时间的数据称为历史数据
2. 实时数据抽取：所有 arrival time >= 创建 pipe 时当前系统时间的数据称为实时数据
3. 全量数据 = 历史数据 + 实时数据

- 可通过修改 IoTDB 配置文件（iotdb-common.properties）以调整数据同步的参数，如同步数据存储目录等。完整配置如下：

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

# 参考：参数说明

## extractor  参数

| key                                | value                                            | value 取值范围                         | 是否必填 |默认取值|
| ---------------------------------- | ------------------------------------------------ | -------------------------------------- | -------- |------|
| extractor                          | iotdb-extractor                                  | String: iotdb-extractor                | 必填  | - |
| extractor.pattern                  | 用于筛选时间序列的路径前缀                       | String: 任意的时间序列前缀             | 选填  | root |
| extractor.history.enable           | 是否同步历史数据                                 | Boolean: true, false                   | 选填 | true |
| extractor.history.start-time       | 同步历史数据的开始 event time，包含 start-time   | Long: [Long.MIN_VALUE, Long.MAX_VALUE] | 选填  | Long.MIN_VALUE |
| extractor.history.end-time         | 同步历史数据的结束 event time，包含 end-time     | Long: [Long.MIN_VALUE, Long.MAX_VALUE] | 选填  | Long.MAX_VALUE |
| extractor.realtime.enable          | 是否同步实时数据                                 | Boolean: true, false                   | 选填 | true |
| extractor.realtime.mode            | 实时数据的抽取模式                               | String: hybrid, log, file              | 选填 | hybrid |
| extractor.forwarding-pipe-requests | 是否转发由其他 Pipe （通常是数据同步）写入的数据 | Boolean: true, false                   | 选填 | true |


## connector 参数

#### iotdb-thrift-sync-connector（别名：iotdb-thrift-connector）

| key                               | value                                                        | value 取值范围                                               | 是否必填 | 默认取值                                    |
| --------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- | ------------------------------------------- |
| connector                         | iotdb-thrift-connector 或 iotdb-thrift-sync-connector        | String: iotdb-thrift-connector 或 iotdb-thrift-sync-connector | 必填     |                                             |
| connector.ip                      | 目标端 IoTDB 其中一个 DataNode 节点的数据服务 ip             | String                                                       | 选填     | 与 connector.node-urls 任选其一填写         |
| connector.port                    | 目标端 IoTDB 其中一个 DataNode 节点的数据服务 port           | Integer                                                      | 选填     | 与 connector.node-urls 任选其一填写         |
| connector.node-urls               | 目标端 IoTDB 任意多个 DataNode 节点的数据服务端口的 url      | String。例：'127.0.0.1:6667,127.0.0.1:6668,127.0.0.1:6669', '127.0.0.1:6667' | 选填     | 与 connector.ip:connector.port 任选其一填写 |
| connector.batch.enable            | 是否开启日志攒批发送模式，用于提高传输吞吐，降低 IOPS        | Boolean: true, false                                         | 选填     | true                                        |
| connector.batch.max-delay-seconds | 在开启日志攒批发送模式时生效，表示一批数据在发送前的最长等待时间（单位：s） | Integer                                                      | 选填     | 1                                           |
| connector.batch.size-bytes        | 在开启日志攒批发送模式时生效，表示一批数据最大的攒批大小（单位：byte）      | Long                                                                         | 选填

#### iotdb-thrift-async-connector

| key                               | value                                                        | value 取值范围                                               | 是否必填 | 默认取值                                    |
| --------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- | ------------------------------------------- |
| connector                         | iotdb-thrift-async-connector                                 | String: iotdb-thrift-async-connector                         | 必填     |                                             |
| connector.ip                      | 目标端 IoTDB 其中一个 DataNode 节点的数据服务 ip             | String                                                       | 选填     | 与 connector.node-urls 任选其一填写         |
| connector.port                    | 目标端 IoTDB 其中一个 DataNode 节点的数据服务 port           | Integer                                                      | 选填     | 与 connector.node-urls 任选其一填写         |
| connector.node-urls               | 目标端 IoTDB 任意多个 DataNode 节点的数据服务端口的 url      | String。例：'127.0.0.1:6667,127.0.0.1:6668,127.0.0.1:6669', '127.0.0.1:6667' | 选填     | 与 connector.ip:connector.port 任选其一填写 |
| connector.batch.enable            | 是否开启日志攒批发送模式，用于提高传输吞吐，降低 IOPS        | Boolean: true, false                                         | 选填     | true                                        |
| connector.batch.max-delay-seconds | 在开启日志攒批发送模式时生效，表示一批数据在发送前的最长等待时间（单位：s） | Integer                                                      | 选填     | 1                                           |
| connector.batch.size-bytes        | 在开启日志攒批发送模式时生效，表示一批数据最大的攒批大小（单位：byte） | Long                                                         | 选填     | 16 * 1024 * 1024 (16MiB)                    |


#### iotdb-legacy-pipe-connector

| key                | value                                                        | value 取值范围                      | 是否必填 | 默认取值 |
| ------------------ | ------------------------------------------------------------ | ----------------------------------- | -------- | -------- |
| connector          | iotdb-legacy-pipe-connector                                  | String: iotdb-legacy-pipe-connector | 必填     | -        |
| connector.ip       | 目标端 IoTDB 其中一个 DataNode 节点的数据服务 ip             | String                              | 选填     | -        |
| connector.port     | 目标端 IoTDB 其中一个 DataNode 节点的数据服务 port           | Integer                             | 选填     | -        |
| connector.user     | 目标端 IoTDB 的用户名，注意该用户需要支持数据写入、TsFile Load 的权限 | String                              | 选填     | root     |
| connector.password | 目标端 IoTDB 的密码，注意该用户需要支持数据写入、TsFile Load 的权限 | String                              | 选填     | root     |
| connector.version  | 目标端 IoTDB 的版本，用于伪装自身实际版本，绕过目标端的版本一致性检查 | String                              | 选填     | 1.1      |

#### iotdb-air-gap-connector

| key                                    | value                                                        | value 取值范围                                               | 是否必填 | 默认取值                                    |
| -------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- | ------------------------------------------- |
| connector                              | iotdb-air-gap-connector                                      | String: iotdb-air-gap-connector                              | 必填     |                                             |
| connector.ip                           | 目标端 IoTDB 其中一个 DataNode 节点的数据服务 ip             | String                                                       | 选填     | 与 connector.node-urls 任选其一填写         |
| connector.port                         | 目标端 IoTDB 其中一个 DataNode 节点的数据服务 port           | Integer                                                      | 选填     | 与 connector.node-urls 任选其一填写         |
| connector.node-urls                    | 目标端 IoTDB 任意多个 DataNode 节点的数据服务端口的 url      | String。例：'127.0.0.1:6667,127.0.0.1:6668,127.0.0.1:6669', '127.0.0.1:6667' | 选填     | 与 connector.ip:connector.port 任选其一填写 |
| connector.air-gap.handshake-timeout-ms | 发送端与接收端在首次尝试建立连接时握手请求的超时时长，单位：毫秒 | Integer                                                      | 选填     | 5000                                        |