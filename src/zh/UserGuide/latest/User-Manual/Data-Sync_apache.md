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

# 数据同步
数据同步是工业物联网的典型需求，通过数据同步机制，可实现 IoTDB 之间的数据共享，搭建完整的数据链路来满足内网外网数据互通、端边云同步、数据迁移、数据备份等需求。

## 功能概述

### 数据同步

一个数据同步任务包含 3 个阶段：

![](https://alioss.timecho.com/docs/img/dataSync01.png)

- 抽取（Source）阶段：该部分用于从源 IoTDB 抽取数据，在 SQL 语句中的 source 部分定义
- 处理（Process）阶段：该部分用于处理从源 IoTDB 抽取出的数据，在 SQL 语句中的 processor 部分定义
- 发送（Sink）阶段：该部分用于向目标 IoTDB 发送数据，在 SQL 语句中的 sink 部分定义

通过 SQL 语句声明式地配置 3 个部分的具体内容，可实现灵活的数据同步能力。目前数据同步支持以下信息的同步，您可以在创建同步任务时对同步范围进行选择（默认选择 data.insert，即同步新写入的数据）：

<table style="text-align: left;">
      <tr>
            <th>同步范围</th>
            <th>同步内容</th>        
            <th>说明</th>
      </tr>
      <tr>
            <td colspan="2">all</td>  
            <td>所有范围</td> 
      </tr>
      <tr>
            <td rowspan="2">data（数据）</td>
            <td>insert（增量）</td>
            <td>同步新写入的数据</td>
      </tr>
      <tr>
            <td>delete（删除）</td>
            <td>同步被删除的数据</td>
      </tr>
       <tr>
            <td rowspan="3">schema（元数据）</td>
            <td>database（数据库）</td>
            <td>同步数据库的创建、修改或删除操作</td>
      </tr>
      <tr>
            <td>timeseries（时间序列）</td>
            <td>同步时间序列的定义和属性</td>       
      </tr>
      <tr>
            <td>TTL（数据到期时间）</td>
            <td>同步数据的存活时间</td>       
      </tr>
      <tr>
            <td>auth（权限）</td>
            <td>-</td>       
            <td>同步用户权限和访问控制</td>
      </tr>
</table>

### 功能限制及说明

元数据（schema）、权限（auth）同步功能存在如下限制：

- 使用元数据同步时，要求`Schema region`、`ConfigNode` 的共识协议必须为默认的 ratis 协议，即：`iotdb-common.properties`配置文件中`config_node_consensus_protocol_class`和`schema_region_consensus_protocol_class`配置项均为`org.apache.iotdb.consensus.ratis.RatisConsensus`

- 为了防止潜在的冲突，请在开启元数据同步时关闭接收端自动创建元数据功能。可通过修改 `iotdb-common.properties`配置文件中的`enable_auto_create_schema`配置项为 false，关闭元数据自动创建功能。

- 开启元数据同步时，不支持使用自定义插件。

- 在进行数据同步任务时，请避免执行任何删除操作，防止两端状态不一致。

## 使用说明

数据同步任务有三种状态：RUNNING、STOPPED 和 DROPPED。任务状态转换如下图所示：

![](https://alioss.timecho.com/docs/img/dataSync02.png)

提供以下 SQL 语句对同步任务进行状态管理。

### 创建任务

使用 `CREATE PIPE` 语句来创建一条数据同步任务，下列属性中`PipeId`和`sink`必填，`source`和`processor`为选填项，输入 SQL 时注意  `SOURCE`与 `SINK` 插件顺序不能替换。

SQL 示例如下：

```SQL
CREATE PIPE <PipeId> -- PipeId 是能够唯一标定任务任务的名字
-- 数据抽取插件，可选插件
WITH SOURCE (
  [<parameter> = <value>,],
)
-- 数据处理插件，可选插件
WITH PROCESSOR (
  [<parameter> = <value>,],
)
-- 数据连接插件，必填插件
WITH SINK (
  [<parameter> = <value>,],
)
```

### 开始任务

创建之后，任务不会立即被处理，需要启动任务。使用`START PIPE`语句来启动任务，从而开始处理数据：

```SQL
START PIPE<PipeId>
```

### 停止任务

停止处理数据：

```SQL
STOP PIPE <PipeId>
```

###  删除任务

删除指定任务：

```SQL
DROP PIPE <PipeId>
```

删除任务不需要先停止同步任务。

### 查看任务

查看全部任务：

```SQL
SHOW PIPES
```

查看指定任务：

```SQL
SHOW PIPE <PipeId>
```

pipe 的 show pipes 结果示例：

```SQL
+--------------------------------+-----------------------+-------+---------------+--------------------+------------------------------------------------------------+----------------+
|                              ID|           CreationTime|  State|     PipeSource|      PipeProcessor|                                                     PipeSink|ExceptionMessage|
+--------------------------------+-----------------------+-------+---------------+--------------------+------------------------------------------------------------+----------------+
|3421aacb16ae46249bac96ce4048a220|2024-08-13T09:55:18.717|RUNNING|             {}|                 {}|{{sink=iotdb-thrift-sink, sink.ip=127.0.0.1, sink.port=6668}}|                |
+--------------------------------+-----------------------+-------+---------------+--------------------+------------------------------------------------------------+----------------+
```

其中各列含义如下：

- **ID**：同步任务的唯一标识符
- **CreationTime**：同步任务的创建的时间
- **State**：同步任务的状态
- **PipeSource**：同步数据流的来源
- **PipeProcessor**：同步数据流在传输过程中的处理逻辑
- **PipeSink**：同步数据流的目的地
- **ExceptionMessage**：显示同步任务的异常信息


### 同步插件

为了使得整体架构更加灵活以匹配不同的同步场景需求，我们支持在同步任务框架中进行插件组装。系统为您预置了一些常用插件可直接使用，同时您也可以自定义 processor 插件 和 Sink 插件，并加载至 IoTDB 系统进行使用。查看系统中的插件（含自定义与内置插件）可以用以下语句：

```SQL
SHOW PIPEPLUGINS
```

返回结果如下（1.3.2 版本）：

```SQL
IoTDB> SHOW PIPEPLUGINS
+---------------------+----------+-------------------------------------------------------------------------------------------+----------------------------------------------------+
|           PluginName|PluginType|                                                                                  ClassName|                                           PluginJar|
+---------------------+----------+-------------------------------------------------------------------------------------------+----------------------------------------------------+
| DO-NOTHING-PROCESSOR|   Builtin|        org.apache.iotdb.commons.pipe.plugin.builtin.processor.donothing.DoNothingProcessor|                                                    |
|      DO-NOTHING-SINK|   Builtin|        org.apache.iotdb.commons.pipe.plugin.builtin.connector.donothing.DoNothingConnector|                                                    |
|         IOTDB-SOURCE|   Builtin|                org.apache.iotdb.commons.pipe.plugin.builtin.extractor.iotdb.IoTDBExtractor|                                                    |
|    IOTDB-THRIFT-SINK|   Builtin|   org.apache.iotdb.commons.pipe.plugin.builtin.connector.iotdb.thrift.IoTDBThriftConnector|                                                    |
|IOTDB-THRIFT-SSL-SINK|   Builtin|org.apache.iotdb.commons.pipe.plugin.builtin.connector.iotdb.thrift.IoTDBThriftSslConnector|                                                    |
+---------------------+----------+-------------------------------------------------------------------------------------------+----------------------------------------------------+
```

预置插件详细介绍如下(各插件的详细参数可参考本文[参数说明](#参考参数说明))：


<table style="text-align: left;">
      <tr>
            <th>类型</th>
            <th>自定义插件</th>        
            <th>插件名称</th>
            <th>介绍</th>
            <th>适用版本</th>
      </tr>
      <tr> 
            <td>source 插件</td>
            <td>不支持</td>
            <td>iotdb-source</td>
            <td>默认的 extractor 插件，用于抽取 IoTDB 历史或实时数据</td>
            <td>1.2.x</td>
      </tr>
      <tr>
            <td>processor 插件</td>
            <td>支持</td>
            <td>do-nothing-processor</td>
            <td>默认的 processor 插件，不对传入的数据做任何的处理</td>
            <td>1.2.x</td>
      </tr>
      <tr>
            <td rowspan="3">sink 插件</td>
            <td rowspan="3">支持</td>
            <td>do-nothing-sink</td>
            <td>不对发送出的数据做任何的处理</td>
            <td>1.2.x</td>
      </tr>
      <tr>
            <td>iotdb-thrift-sink</td>
            <td>默认的 sink 插件（V1.3.1及以上），用于 IoTDB（V1.2.0 及以上）与 IoTDB（V1.2.0 及以上）之间的数据传输。使用 Thrift RPC 框架传输数据，多线程 async non-blocking IO 模型，传输性能高，尤其适用于目标端为分布式时的场景</td>
            <td>1.2.x</td>
      </tr>
      <tr>
            <td>iotdb-thrift-ssl-sink</td>
            <td>用于 IoTDB（V1.3.1 及以上）与 IoTDB（V1.2.0 及以上）之间的数据传输。使用 Thrift RPC 框架传输数据，单线程 sync blocking IO 模型，适用于安全需求较高的场景 </td>
            <td>1.3.1+</td>
      </tr>
</table>

导入自定义插件可参考[流处理框架](./Streaming_timecho.md#自定义流处理插件管理)章节。

## 使用示例

### 全量数据同步

本例子用来演示将一个 IoTDB 的所有数据同步至另一个 IoTDB，数据链路如下图所示：

![](https://alioss.timecho.com/docs/img/%E6%95%B0%E6%8D%AE%E5%90%8C%E6%AD%A51.png)

在这个例子中，我们可以创建一个名为 A2B 的同步任务，用来同步 A IoTDB 到 B IoTDB 间的全量数据，这里需要用到用到 sink 的 iotdb-thrift-sink 插件（内置插件），需通过 node-urls 配置目标端 IoTDB 中 DataNode 节点的数据服务端口的 url，如下面的示例语句：

```SQL
create pipe A2B
with sink (
  'sink'='iotdb-thrift-sink',
  'node-urls' = '127.0.0.1:6668', -- 目标端 IoTDB 中 DataNode 节点的数据服务端口的 url
)
```

### 部分数据同步

本例子用来演示同步某个历史时间范围（ 2023 年 8 月 23 日 8 点到 2023 年 10 月 23 日 8 点）的数据至另一个 IoTDB，数据链路如下图所示：

![](https://alioss.timecho.com/docs/img/%E6%95%B0%E6%8D%AE%E5%90%8C%E6%AD%A51.png)

在这个例子中，我们可以创建一个名为 A2B 的同步任务。首先我们需要在 source 中定义传输数据的范围，由于传输的是历史数据（历史数据是指同步任务创建之前存在的数据），需要配置数据的起止时间 start-time 和 end-time 以及传输的模式 mode。通过 node-urls 配置目标端 IoTDB 中 DataNode 节点的数据服务端口的 url。

详细语句如下：

```SQL
create pipe A2B
WITH SOURCE (
  'source'= 'iotdb-source',
  'realtime.mode' = 'stream'  -- 新插入数据（pipe创建后）的抽取模式
  'start-time' = '2023.08.23T08:00:00+00:00',  -- 同步所有数据的开始 event time，包含 start-time
  'end-time' = '2023.10.23T08:00:00+00:00'  -- 同步所有数据的结束 event time，包含 end-time
) 
with SINK (
  'sink'='iotdb-thrift-async-sink',
  'node-urls' = '127.0.0.1:6668', -- 目标端 IoTDB 中 DataNode 节点的数据服务端口的 url
)
```

### 边云数据传输

本例子用来演示多个 IoTDB 之间边云传输数据的场景，数据由 B 、C、D 集群分别都同步至 A 集群，数据链路如下图所示：

![](https://alioss.timecho.com/docs/img/dataSync03.png)

在这个例子中，为了将 B 、C、D 集群的数据同步至 A，在 BA 、CA、DA 之间的 pipe 需要配置`path`限制范围，以及要保持边侧和云侧的数据一致 pipe  需要配置`inclusion=all`来同步全量数据和元数据，详细语句如下：

在 B IoTDB 上执行下列语句，将 B 中数据同步至 A：

```SQL
create pipe BA
with source (
   'inclusion'='all',  -- 表示同步全量数据、元数据和权限
   'path'='root.db.**', -- 限制范围
)
with sink (
  'sink'='iotdb-thrift-sink',
  'node-urls' = '127.0.0.1:6668', -- 目标端 IoTDB 中 DataNode 节点的数据服务端口的 url
)
```

在 C IoTDB 上执行下列语句，将 C 中数据同步至 A：

```SQL
create pipe CA
with source (
   'inclusion'='all',  -- 表示同步全量数据、元数据和权限
   'path'='root.db.**', -- 限制范围
)
with sink (
  'sink'='iotdb-thrift-sink',
  'node-urls' = '127.0.0.1:6668', -- 目标端 IoTDB 中 DataNode 节点的数据服务端口的 url
)
```

在 D IoTDB 上执行下列语句，将 D 中数据同步至 A：

```SQL
create pipe DA
with source (
   'inclusion'='all',  -- 表示同步全量数据、元数据和权限
   'path'='root.db.**', -- 限制范围
)
with sink (
  'sink'='iotdb-thrift-sink',
  'node-urls' = '127.0.0.1:6668', -- 目标端 IoTDB 中 DataNode 节点的数据服务端口的 url
)
```

### 级联数据传输

本例子用来演示多个 IoTDB 之间级联传输数据的场景，数据由 A 集群同步至 B 集群，再同步至 C 集群，数据链路如下图所示：

![](https://alioss.timecho.com/docs/img/1706698610134.jpg)

在这个例子中，为了将 A 集群的数据同步至 C，在 BC 之间的 pipe 需要将 `forwarding-pipe-requests` 配置为`true`，详细语句如下：

在 A IoTDB 上执行下列语句，将 A 中数据同步至 B：

```SQL
create pipe AB
with sink (
  'sink'='iotdb-thrift-sink',
  'node-urls' = '127.0.0.1:6668', -- 目标端 IoTDB 中 DataNode 节点的数据服务端口的 url
)
```

在 B IoTDB 上执行下列语句，将 B 中数据同步至 C：

```SQL
create pipe BC
with source (
  'forwarding-pipe-requests' = 'true'   --是否转发由其他 Pipe 写入的数据
)
with sink (
  'sink'='iotdb-thrift-sink',
  'node-urls' = '127.0.0.1:6669', -- 目标端 IoTDB 中 DataNode 节点的数据服务端口的 url
)
```

### 加密同步（V1.3.1+ ）

IoTDB 支持在同步过程中使用 SSL 加密，从而在不同的 IoTDB 实例之间安全地传输数据。通过配置 SSL 相关的参数，如证书地址和密码（`ssl.trust-store-path`）、（`ssl.trust-store-pwd`）可以确保数据在同步过程中被 SSL 加密所保护。

如创建名为 A2B 的同步任务：

```SQL
create pipe A2B
with sink (
  'sink'='iotdb-thrift-ssl-sink',
  'node-urls'='127.0.0.1:6667',  -- 目标端 IoTDB 中 DataNode 节点的数据服务端口的 url
  'ssl.trust-store-path'='pki/trusted', -- 连接目标端 DataNode 所需的 trust store 证书路径
  'ssl.trust-store-pwd'='root' -- 连接目标端 DataNode 所需的 trust store 证书密码
)
```

## 参考：注意事项

可通过修改 IoTDB 配置文件（`iotdb-common.properties`）以调整数据同步的参数，如同步数据存储目录等。完整配置如下：：

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
```

## 参考：参数说明

### source  参数（V1.3.0）

| 参数                            | 描述                                                         | value 取值范围                         | 是否必填 | 默认取值       |
| :------------------------------ | :----------------------------------------------------------- | :------------------------------------- | :------- | :------------- |
| source                          | iotdb-source                                                 | String: iotdb-source                   | 必填     | -              |
| source.pattern                  | 用于筛选时间序列的路径前缀                                   | String: 任意的时间序列前缀             | 选填     | root           |
| source.history.enable           | 是否发送历史数据                                             | Boolean: true / false                  | 选填     | true           |
| source.history.start-time       | 同步历史数据的开始 event time，包含 start-time               | Long: [Long.MIN_VALUE, Long.MAX_VALUE] | 选填     | Long.MIN_VALUE |
| source.history.end-time         | 同步历史数据的结束 event time，包含 end-time                 | Long: [Long.MIN_VALUE, Long.MAX_VALUE] | 选填     | Long.MAX_VALUE |
| source.realtime.enable          | 是否发送实时数据                                             | Boolean: true / false                 | 选填     | batch            |
| source.realtime.mode            | 新插入数据（pipe 创建后）的抽取模式                          | String: batch                        | 选填     | batch         |
| source.forwarding-pipe-requests | 是否转发由其他 Pipe （通常是数据同步）写入的数据             |  Boolean: true                      | 选填     | true           |
| source.history.loose-range      | tsfile 传输时，是否放宽历史数据（pipe 创建前）范围。""：不放宽范围，严格按照设置的条件挑选数据"time"：放宽时间范围，避免对 TsFile 进行拆分，可以提升同步效率 | String: "" / "time"                    | 选填     | 空字符串       |

> 💎 **说明：历史数据与实时数据的差异**
> - **历史数据**：所有 arrival time < 创建 pipe 时当前系统时间的数据称为历史数据
> - **实时数据**：所有 arrival time >= 创建 pipe 时当前系统时间的数据称为实时数据
> - **全量数据**： 全量数据 = 历史数据 + 实时数据
> 
> 💎 **说明：数据抽取模式 batch 的含义**
> - **batch**：该模式下，任务将对数据进行批量（按底层数据文件）处理、发送，其特点是低时效、高吞吐

### source  参数（V1.3.1）

> 在 1.3.1 及以上的版本中，各项参数不再需要额外增加 source、processor、sink 前缀

| 参数                     | 描述                                                         | value 取值范围                         | 是否必填 | 默认取值       |
| :----------------------- | :----------------------------------------------------------- | :------------------------------------- | :------- | :------------- |
| source                   | iotdb-source                                                 | String: iotdb-source                   | 必填     | -              |
| pattern                  | 用于筛选时间序列的路径前缀                                   | String: 任意的时间序列前缀             | 选填     | root           |
| start-time               | 同步所有数据的开始 event time，包含 start-time               | Long: [Long.MIN_VALUE, Long.MAX_VALUE] | 选填     | Long.MIN_VALUE |
| end-time                 | 同步所有数据的结束 event time，包含 end-time                 | Long: [Long.MIN_VALUE, Long.MAX_VALUE] | 选填     | Long.MAX_VALUE |
| realtime.mode            | 新插入数据（pipe 创建后）的抽取模式                          | String: batch                                   | 选填     | batch            |
| forwarding-pipe-requests | 是否转发由其他 Pipe （通常是数据同步）写入的数据             | Boolean: true                                     | 选填     | true           |
| history.loose-range      | tsfile 传输时，是否放宽历史数据（pipe 创建前）范围。""：不放宽范围，严格按照设置的条件挑选数据"time"：放宽时间范围，避免对 TsFile 进行拆分，可以提升同步效率 | String: "" / "time"                    | 选填     | 空字符串       |

> 💎 **说明**：为保持低版本兼容，history.enable、history.start-time、history.end-time、realtime.enable 仍可使用，但在新版本中不推荐。
> 
> 💎 **说明：数据抽取模式 batch 的含义**
> - **batch**：该模式下，任务将对数据进行批量（按底层数据文件）处理、发送，其特点是低时效、高吞吐
### source  参数（V1.3.2）

> 在 1.3.1 及以上的版本中，各项参数不再需要额外增加 source、processor、sink 前缀

| 参数                     | 描述                                                         | value 取值范围                                               | 是否必填 | 默认取值       |
| :----------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- | :------- | :------------- |
| source                   | iotdb-source                                                 | String: iotdb-source                                         | 必填     | -              |
| inclusion                | 用于指定数据同步任务中需要同步范围，分为数据、元数据和权限   | String:all, data(insert,delete), schema(database,timeseries,ttl), auth | 选填     | data.insert    |
| inclusion.exclusion      | 用于从 inclusion 指定的同步范围内排除特定的操作，减少同步的数据量 | String:all, data(insert,delete), schema(database,timeseries,ttl), auth | 选填     | -              |
| path                     | 用于筛选待同步的时间序列及其相关元数据 / 数据的路径模式path 是精确匹配，参数必须为前缀路径或完整路径，即不能含有 `"*"`，最多在 path 参数的尾部含有一个 `"**"` | String：IoTDB 的 pattern                                     | 选填     | root.**        |
| pattern                  | 用于筛选时间序列的路径前缀元数据同步不能用 pattern 参数      | String: 任意的时间序列前缀                                   | 选填     | root           |
| start-time               | 同步所有数据的开始 event time，包含 start-time               | Long: [Long.MIN_VALUE, Long.MAX_VALUE]                       | 选填     | Long.MIN_VALUE |
| end-time                 | 同步所有数据的结束 event time，包含 end-time                 | Long: [Long.MIN_VALUE, Long.MAX_VALUE]                       | 选填     | Long.MAX_VALUE |
| realtime.mode            | 新插入数据（pipe 创建后）的抽取模式                          | String: batch                                                 | 选填     | batch            |
| forwarding-pipe-requests | 是否转发由其他 Pipe （通常是数据同步）写入的数据             | Boolean: true                                                | 选填     | true           |
| history.loose-range      | tsfile 传输时，是否放宽历史数据（pipe 创建前）范围。""：不放宽范围，严格按照设置的条件挑选数据"time"：放宽时间范围，避免对 TsFile 进行拆分，可以提升同步效率 | String: "" 、 "time"                                         | 选填     | ""             |
| mods.enable              | 是否发送 tsfile 的 mods 文件                                 | Boolean: true / false                                        | 选填     | false          |

> 💎 **说明**：为保持低版本兼容，history.enable、history.start-time、history.end-time、realtime.enable 仍可使用，但在新版本中不推荐。
> 
> 💎 **说明：数据抽取模式 batch 的含义**
> - **batch**：该模式下，任务将对数据进行批量（按底层数据文件）处理、发送，其特点是低时效、高吞吐
### sink 参数

> 在 1.3.1 及以上的版本中，各项参数不再需要额外增加 source、processor、sink 前缀

#### iotdb-thrift-sink( V1.3.0/1/2) 

| key                          | value                                                        | value 取值范围                                               | 是否必填 | 默认取值     |
| :--------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- | :------- | :----------- |
| sink                         | iotdb-thrift-sink 或 iotdb-thrift-async-sink                 | String: iotdb-thrift-sink 或 iotdb-thrift-async-sink         | 必填     |              |
| sink.node-urls               | 目标端 IoTDB 任意多个 DataNode 节点的数据服务端口的 url（请注意同步任务不支持向自身服务进行转发） | String. 例：'127.0.0.1：6667，127.0.0.1：6668，127.0.0.1：6669'， '127.0.0.1：6667' | 必填     | -            |
| sink.batch.enable            | 是否开启日志攒批发送模式，用于提高传输吞吐，降低 IOPS        | Boolean: true, false                                         | 选填     | true         |
| sink.batch.max-delay-seconds | 在开启日志攒批发送模式时生效，表示一批数据在发送前的最长等待时间（单位：s） | Integer                                                      | 选填     | 1            |
| batch.size-bytes             | 在开启日志攒批发送模式时生效，表示一批数据最大的攒批大小（单位：byte） | Long                                                         | 选填     | 16*1024*1024 |

#### iotdb-thrift-ssl-sink( V1.3.1/2) 

| key                     | value                                                        | value 取值范围                                               | 是否必填 | 默认取值     |
| :---------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- | :------- | :----------- |
| sink                    | iotdb-thrift-ssl-sink                                        | String: iotdb-thrift-ssl-sink                                | 必填     | -            |
| node-urls               | 目标端 IoTDB 任意多个 DataNode 节点的数据服务端口的 url（请注意同步任务不支持向自身服务进行转发） | String. 例：'127.0.0.1：6667，127.0.0.1：6668，127.0.0.1：6669'， '127.0.0.1：6667' | 必填     | -            |
| batch.enable            | 是否开启日志攒批发送模式，用于提高传输吞吐，降低 IOPS        | Boolean: true, false                                         | 选填     | true         |
| batch.max-delay-seconds | 在开启日志攒批发送模式时生效，表示一批数据在发送前的最长等待时间（单位：s） | Integer                                                      | 选填     | 1            |
| batch.size-bytes        | 在开启日志攒批发送模式时生效，表示一批数据最大的攒批大小（单位：byte） | Long                                                         | 选填     | 16*1024*1024 |
| ssl.trust-store-path    | 连接目标端 DataNode 所需的 trust store 证书路径              | String: 证书目录名，配置为相对目录时，相对于 IoTDB 根目录Example: '127.0.0.1:6667,127.0.0.1:6668,127.0.0.1:6669', '127.0.0.1:6667' | 必填     | -            |
| ssl.trust-store-pwd     | 连接目标端 DataNode 所需的 trust store 证书密码              | Integer                                                      | 必填     | -            |

