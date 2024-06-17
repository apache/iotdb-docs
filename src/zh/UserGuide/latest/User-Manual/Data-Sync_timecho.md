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

## 功能介绍

### 同步任务概述

一个数据同步任务包含2个阶段：

- 抽取（Source）阶段：该部分用于从源 IoTDB 抽取数据，在 SQL 语句中的 source 部分定义
- 发送（Sink）阶段：该部分用于向目标 IoTDB 发送数据，在 SQL 语句中的 sink 部分定义



通过 SQL 语句声明式地配置2个部分的具体内容，可实现灵活的数据同步能力。

### 同步任务 - 创建

使用 `CREATE PIPE` 语句来创建一条数据同步任务，下列属性中`PipeId`和`sink`为必填项，`source`和`processor`为选填项，输入SQL时注意 `SOURCE `与 `SINK` 插件顺序不能替换。

SQL 示例如下：

```SQL
CREATE PIPE <PipeId> -- PipeId 是能够唯一标定任务任务的名字
-- 数据抽取插件，必填插件
WITH SOURCE (
  [<parameter> = <value>,],
-- 数据连接插件，必填插件
WITH SINK (
  [<parameter> = <value>,],
)
```
> 📌 注：使用数据同步功能，请保证接收端开启自动创建元数据



### 同步任务 - 管理

数据同步任务有三种状态：RUNNING、STOPPED和DROPPED。任务状态转换如下图所示：

![状态迁移图](https://alioss.timecho.com/docs/img/%E7%8A%B6%E6%80%81%E8%BF%81%E7%A7%BB%E5%9B%BE.png)

一个数据同步任务在生命周期中会经过多种状态：

- RUNNING： 运行状态。
  - 说明1：任务的初始状态为运行状态(**_V1.3.1_** 及以上)
- STOPPED： 停止状态。
  - 说明1：任务的初始状态为停止状态(**_V1.3.0_**)，需要使用SQL语句启动任务
  - 说明2：用户也可以使用SQL语句手动将一个处于运行状态的任务停止，此时状态会从 RUNNING 变为 STOPPED
  - 说明3：当一个任务出现无法恢复的错误时，其状态会自动从 RUNNING 变为 STOPPED
- DROPPED：删除状态。

我们提供以下SQL语句对同步任务进行状态管理。

#### 启动任务

创建之后，任务不会立即被处理，需要启动任务。使用`START PIPE`语句来启动任务，从而开始处理数据：

```SQL
START PIPE <PipeId>
```

#### 停止任务

停止处理数据：

```SQL
STOP PIPE <PipeId>
```

####  删除任务

删除指定任务：

```SQL
DROP PIPE <PipeId>
```
删除任务不需要先停止同步任务。
#### 查看任务

查看全部任务：

```SQL
SHOW PIPES
```

查看指定任务：

```SQL
SHOW PIPE <PipeId>
```

从 _**V1.3.3**_ 版本开始，`show pipes`命令中附带了预估的剩余时间和剩余 event 个数。剩余时间和剩余 event 个数定义如下：
* **剩余 event 个数**：指 pipe 总传输任务中，包括数据同步和元数据同步的当前所有 event 个数，也包含 pipe 框架控制使用的 event 和用户自己定义的 event。
* **剩余时间**：指根据 pipe 当前的 event 个数和 pipe 的处理速率，所预估的剩余传输时间。

为避免影响正常的工作流程，这两个指标的统计值通常在 ConfigNode 上缓存，在 pipe 上报心跳时进行聚合，其统计可能带有一定量的延迟。作为优化，当一个 pipe 传输任务仅涉及 DataNode，且集群内只有一个 DataNode 时，该指标将优化为 DataNode 的本地计算。
例如通过如下命令创建的 pipe：
```SQL
create pipe A2B
with sink (
  'sink'='iotdb-thrift-sink',
  'sink.ip'='127.0.0.1',
  'sink.port'='6668'
)
```
该 Pipe 为一个全量数据同步的 pipe，如果该 pipe 所在的集群为一个 1C1D 的集群，则该 pipe 的统计信息每次进行`show pipe`时均为最新。

这里给出该 pipe 一个示例的 show pipes 结果：
```SQL
+---+-----------------------+-------+----------+-------------+-----------------------------------------------------------+----------------+-------------------+-------------------------+
| ID|           CreationTime|  State|PipeSource|PipeProcessor|                                                   PipeSink|ExceptionMessage|RemainingEventCount|EstimatedRemainingSeconds|
+---+-----------------------+-------+----------+-------------+-----------------------------------------------------------+----------------+-------------------+-------------------------+
|A2B|2024-06-17T14:03:44.189|RUNNING|        {}|           {}|{sink=iotdb-thrift-sink, sink.ip=127.0.0.1, sink.port=6668}|                |                128|                     1.03|
+---+-----------------------+-------+----------+-------------+-----------------------------------------------------------+----------------+-------------------+-------------------------+
```
### 插件

为了使得整体架构更加灵活以匹配不同的同步场景需求，在上述同步任务框架中 IoTDB 支持进行插件组装。系统为您预置了一些常用插件可直接使用，同时您也可以自定义 Sink 插件，并加载至 IoTDB 系统进行使用。

| 模块             | 插件           | 预置插件                                 | 自定义插件 |
|----------------|--------------|--------------------------------------|-------|
| 抽取（Source）     | Source 插件    | iotdb-source                         | 不支持   |
| 发送（Sink）       | Sink 插件      | iotdb-thrift-sink、iotdb-air-gap-sink | 支持    |

#### 预置插件

预置插件如下：

| 插件名称                  | 类型          | 介绍                                                                                                                                | 适用版本            |
|-----------------------|-------------|-----------------------------------------------------------------------------------------------------------------------------------|-----------------|
| iotdb-source          | source 插件   | 默认的 source 插件，用于抽取 IoTDB 历史或实时数据                                                                                                  | _**1.2.x**_     |
| iotdb-thrift-sink     | sink 插件     | 用于 IoTDB(***V1.2.0***及以上）与 IoTDB（***V1.2.0***及以上）之间的数据传输。使用 Thrift RPC 框架传输数据，多线程 async non-blocking IO 模型，传输性能高，尤其适用于目标端为分布式时的场景 | _**1.2.x**_     |
| iotdb-air-gap-sink    | sink 插件     | 用于 IoTDB（_**V1.2.2**_+）向 IoTDB（_**V1.2.2**_+）跨单向数据网闸的数据同步。支持的网闸型号包括南瑞 Syskeeper 2000 等                                            | _**1.2.2**_ 及以上 |
| iotdb-thrift-ssl-sink | sink plugin | 用于 IoTDB（***V1.3.1***及以上）与 IoTDB（***V1.2.0***及以上）之间的数据传输。使用 Thrift RPC 框架传输数据，单线程 sync blocking IO 模型，适用于安全需求较高的场景                | _**1.3.1**_ 及以上 |

每个插件的详细参数可参考本文[参数说明](#sink-参数)章节。

#### 查看插件

查看系统中的插件（含自定义与内置插件）可以用以下语句：

```SQL
SHOW PIPEPLUGINS
```

返回结果如下：

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

### 元数据同步

从 _**V1.3.2**_ 开始，数据同步功能支持配置向另一台同样为 _**V1.3.2**_+ 版本的 IoTDB 的元数据同步。元数据同步功能能够将发送端给定语句范围、给定路径下的全部元数据写操作同步到接收端，能够同步所有历史、实时元数据，
支持跨网闸同步，并且能够处理异步复制带来的各种冲突。

在前文数据同步的基础上稍加改动，即可进行元数据同步的配置。下面介绍元数据同步的几个关键参数。

#### 范围限定
在上文同步任务 - 创建的 SQL 示例基础上，进行支持同步全量元数据的改动：

```SQL
CREATE PIPE <PipeId> -- PipeId 是能够唯一标定任务任务的名字
-- 数据抽取插件，必填插件
WITH SOURCE (
  'inclusion'='all',
  [<parameter> = <value>,],
-- 数据连接插件，必填插件
WITH SINK (
  [<parameter> = <value>,],
)
```
可以看出，此处在配置范围时，元数据同步和数据同步相比，仅有一个 `'inclusion'` 的区别。此处 `'inclusion'='all'` 表示同步全量数据和元数据。当 `'inclusion'` 不为 `'all'` 时，`'inclusion'` 的作用按照前缀进行，前缀树如下：

![元数据同步范围示意图.png](https://alioss.timecho.com/upload/%E5%85%83%E6%95%B0%E6%8D%AE%E5%90%8C%E6%AD%A5%E8%8C%83%E5%9B%B4%E7%A4%BA%E6%84%8F%E5%9B%BE.png)

inclusion 可以配置一个或多个前缀，同步时将会同步每个前缀下的所有数据 / 元数据操作。其中，`'data.insert'` 即是正常的数据同步，也是一个同步任务的默认配置。

例如，`'inclusion'='data.insert, auth'` 时，除了原有的数据同步操作外，还会传输所有的权限相关操作，例如以下操作也会被同步到接收端：
```SQL
CREATE USER user1 'passwd'
```
```SQL
GRANT READ_DATA, WRITE_DATA ON root.t1.**,root.t2.** TO USER user1;
```
`'inclusion.exclusion'` 为 `'inclusion'` 的一个附加配置，作用是从 `'inclusion'` 的范围内减去 `'inclusion.exclusion'` 的范围，`'inclusion.exclusion'` 的范围同样按照前缀树进行。例如：
```SQL
'inclusion'='schema,auth',
'inclusion.exclusion'='schema.database'
```
等价于：
```SQL
'inclusion'='schema.timeseries,schema.ttl,auth',
```
`'inclusion.exclusion'`参数默认为空。

#### 路径限定
考虑到部分使用元数据同步的边云场景，多个集团侧的数据库希望将自身的操作同步到总部接收端，但是不希望自身的操作对总部侧的数据产生影响，例如自身采用删除全库命令删除数据时，希望总部仅删除该集团的数据，不影响其他集团同步过去的数据。此外，还存在其他仅希望补录部分元数据等的场景。

为了满足此类场景，元数据同步支持路径限定功能。即，原有数据同步的 `'source.path'` 参数，能够按照相似的语义作用到元数据的同步上。开启元数据同步时，`'source.path'` 参数必须为前缀路径或完整路径，即不含有 `"*"`，最多含有一个 `"**"`，且若有则必定在 `'path'` 参数的尾部。例如，以下 `'path'` 是合法参数：
```SQL
'path'='root.db.**',
```
```SQL
'path'='root.db.d1.s1',
```
以下 path 不是合法参数：
```SQL
'path'='root.db.*.s1',
```

下面给出详细说明及示例：
* 对于 database / set template 的操作，如果为 `path` 的前缀，即可同步。
  * 例如，在 `path` 为 `root.db.d1.**` 时，创建 `root.db` 数据库会被同步，`root.db1` 不会被同步。
* 对于创建序列等操作，只有匹配 path，才会同步。
  * 例如，在 `path` 为 `root.db.d1.d2.**` 时，序列 `root.db.d1.d2` 不会被同步，`root.db.d1.d2.s1` 会被同步。
* 对于删除等含有通配符的操作，在同步前，将会按照同步范围被限定。
  * 例如，在 `path` 为 `root.db.**` 时，发送端 `delete from root.**` 的操作，在接收端等价于 `delete from root.db.**`。
* Path 为完整序列时，相关的元数据模板会按照最后一级路径被裁剪。
  * 例如，在 `path` 为 `root.db.d1.s1` 是，一个含有 `s1`、`s2`、`s3` 三个测点的模板，在接收端将会变为仅有 `s1` 一个测点的模板。

#### 冲突处理
在同步过程中，可能由于异步复制自身的问题，或者接收端已存在的元数据 / 数据，导致传输出现一定的冲突。传输过程中，还可能发生因资源不足导致的传输失败，或是其他的未知错误。我们对这些错误的处理方式如下：
* **资源问题**：对于因接收端资源不足而导致的错误，我们会无限重试，接收端资源一旦释放，即可正常同步。
* **幂等问题**：如果一个同步操作的结果与接收端自身的状态一致，例如，试图创建一个已存在的序列，那么元数据同步将会直接忽略这种冲突，继续传输接下来的数据。
* **冲突问题**：如果检测到了待同步的数据和已存在的数据存在冲突，那么我们默认会进行有限重试，也可以配置是否重试以及无限重试，以及放弃某数据传输后，是否打印该数据相关信息。
* **其他问题**：如果检测到其他问题，那么我们默认会进行无限重试。也可以配置进行有限重试，以及放弃某数据传输后，是否打印该数据相关信息。

对于冲突问题和其他问题的相关配置参数，可以在后文"参考：参数说明"中进行查找。对于跨网闸的元数据同步，由于我们无法检测接收端的返回码，因此对于幂等问题，我们将会忽略；对于其他问题，我们统一作为冲突问题处理。

#### 限制
元数据同步功能存在如下限制：
* 仅支持 Schema region / Config Node 的共识协议为 ratis 协议。
* 仅支持下文提到的，IoTDB 的内置 SINK 插件。
* 可能因为异步复制和多分区并行传输的原因，造成一定的冲突，需要手动解决。
* 不支持自定义元数据相关插件。
* 为了防止潜在的冲突，建议在接收端关闭自动创建元数据功能。
* 建议在确认其余数据同步完成后，再在发送端执行删除数据的操作，否则可能导致发送端和接收端的相关状态不一致。

## 使用示例

### 全量数据同步

本例子用来演示将一个 IoTDB 的所有数据同步至另一个 IoTDB，数据链路如下图所示：

![全量数据同步.jpg](https://alioss.timecho.com/upload/%E5%85%A8%E9%87%8F%E6%95%B0%E6%8D%AE%E5%90%8C%E6%AD%A5.jpg)

在这个例子中，我们可以创建一个名为 A2B 的同步任务，用来同步 A IoTDB 到 B IoTDB 间的全量数据，这里需要用到用到 sink 的 iotdb-thrift-sink 插件（内置插件），需指定接收端地址，这个例子中指定了'sink.ip'和'sink.port'，也可指定'sink.node-urls'，如下面的示例语句：

```SQL
create pipe A2B
with sink (
  'sink'='iotdb-thrift-sink',
  'sink.ip'='127.0.0.1',
  'sink.port'='6668'
)
```


### 历史数据同步

本例子用来演示同步某个历史时间范围（ 2023 年 8 月 23 日 8 点到 2023 年 10 月 23 日 8 点）的数据至另一个 IoTDB，数据链路如下图所示：

![历史数据同步.jpg](https://alioss.timecho.com/upload/%E5%85%A8%E9%87%8F%E6%95%B0%E6%8D%AE%E5%90%8C%E6%AD%A5.jpg)

在这个例子中，我们可以创建一个名为 A2B 的同步任务。首先我们需要在 source 中定义传输数据的范围，由于传输的是历史数据（历史数据是指同步任务创建之前存在的数据），所以需要将 source.realtime.enable 参数配置为 false；同时需要配置数据的起止时间 start-time 和 end-time 以及传输的模式 mode，此处推荐 mode 设置为 hybrid 模式（hybrid 模式为混合传输，在无数据积压时采用实时传输方式，有数据积压时采用批量传输方式，并根据系统内部情况自动切换）。

详细语句如下：

```SQL
create pipe A2B
WITH SOURCE (
  'source'= 'iotdb-source',
  'source.start-time' = '2023.08.23T08:00:00+00:00',
  'source.end-time' = '2023.10.23T08:00:00+00:00'
) 
with SINK (
  'sink'='iotdb-thrift-async-sink',
  'sink.node-urls'='xxxx:6668',
  'sink.batch.enable'='false'
)
```


### 双向数据传输

本例子用来演示两个 IoTDB 之间互为双活的场景，数据链路如下图所示：

![](https://alioss.timecho.com/docs/img/1706698592139.jpg)

在这个例子中，为了避免数据无限循环，需要将 A 和 B 上的参数`source.forwarding-pipe-requests` 均设置为 `false`，表示不转发从另一pipe传输而来的数据。
 
详细语句如下：

在 A IoTDB 上执行下列语句：

```SQL
create pipe AB
with source (
  'source.forwarding-pipe-requests' = 'false'
)
with sink (
  'sink'='iotdb-thrift-sink',
  'sink.ip'='127.0.0.1',
  'sink.port'='6668'
)
```

在 B IoTDB 上执行下列语句：

```SQL
create pipe BA
with source (
  'source.forwarding-pipe-requests' = 'false'
)
with sink (
  'sink'='iotdb-thrift-sink',
  'sink.ip'='127.0.0.1',
  'sink.port'='6667'
)
```


### 级联数据传输


本例子用来演示多个 IoTDB 之间级联传输数据的场景，数据由 A 集群同步至 B 集群，再同步至 C 集群，数据链路如下图所示：

![](https://alioss.timecho.com/docs/img/1706698610134.jpg)

在这个例子中，为了将 A 集群的数据同步至 C，在 BC 之间的 pipe 需要将 `source.forwarding-pipe-requests` 配置为`true`，详细语句如下：

在 A IoTDB 上执行下列语句，将 A 中数据同步至 B：

```SQL
create pipe AB
with sink (
  'sink'='iotdb-thrift-sink',
  'sink.ip'='127.0.0.1',
  'sink.port'='6668'
)
```

在 B IoTDB 上执行下列语句，将 B 中数据同步至 C：

```SQL
create pipe BC
with source (
  'source.forwarding-pipe-requests' = 'true'
)
with sink (
  'sink'='iotdb-thrift-sink',
  'sink.ip'='127.0.0.1',
  'sink.port'='6669'
)
```

### 跨网闸数据传输

本例子用来演示将一个 IoTDB 的数据，经过单向网闸，同步至另一个 IoTDB 的场景，数据链路如下图所示：

![跨网闸数据同步示意图.jpg](https://alioss.timecho.com/upload/%E8%B7%A8%E7%BD%91%E9%97%B8%E6%95%B0%E6%8D%AE%E5%90%8C%E6%AD%A5%E7%A4%BA%E6%84%8F%E5%9B%BE.jpg)

在这个例子中，需要使用 sink 任务中的 iotdb-air-gap-sink 插件（目前支持部分型号网闸，具体型号请联系天谋科技工作人员确认），配置网闸后，在 A IoTDB 上执行下列语句，其中 ip 和 port 填写网闸配置的虚拟 ip 和相关 port，详细语句如下：

```SQL
create pipe A2B
with sink (
  'sink'='iotdb-air-gap-sink',
  'sink.ip'='10.53.53.53',
  'sink.port'='9780'
)
```

### SSL协议数据传输

本例子演示了使用 SSL 协议配置 IoTDB 单向数据同步的场景，数据链路如下图所示：

![](https://alioss.timecho.com/docs/img/1706696754380.jpg)

在该场景下，需要使用 IoTDB 的 iotdb-thrift-ssl-sink 插件。我们可以创建一个名为 A2B 的同步任务，并配置自身证书的密码和地址，详细语句如下：
```SQL
create pipe A2B
with sink (
  'sink'='iotdb-thrift-ssl-sink',
  'sink.ip'='127.0.0.1',
  'sink.port'='6669',
  'ssl.trust-store-path'='pki/trusted'
  'ssl.trust-store-pwd'='root'
)
```

### 含元数据同步的双活部署
本例子演示了含元数据同步的双活部署场景，数据链路如下图所示：

![带元数据双向同步示意图.png](https://alioss.timecho.com/upload/%E5%B8%A6%E5%85%83%E6%95%B0%E6%8D%AE%E5%8F%8C%E5%90%91%E5%90%8C%E6%AD%A5%E7%A4%BA%E6%84%8F%E5%9B%BE.png)

在该场景下，需要使用 IoTDB 的 `'inclusion'='all'` 配置。在 A 上创建一个名为 A2B 的同步任务，详细语句如下：
```SQL
create pipe A2B
with source (
  'source.inclusion' = 'all',
  'source.forwarding-pipe-requests' = 'false'
)
with sink (
  'sink'='iotdb-thrift-sink',
  'sink.ip'='127.0.0.1',
  'sink.port'='6668'
)
```
在 B 上创建一个名为 B2A 的同步任务，详细语句如下：
```SQL
create pipe B2A
with source (
  'source.inclusion' = 'all',
  'source.forwarding-pipe-requests' = 'false'
)
with sink (
  'sink'='iotdb-thrift-sink',
  'sink.ip'='127.0.0.1',
  'sink.port'='6667'
)
```

### 含元数据同步的边云部署
本例子演示了含元数据同步的边云部署场景，数据链路如下图所示：

![带元数据边云同步示意图.png](https://alioss.timecho.com/upload/%E5%B8%A6%E5%85%83%E6%95%B0%E6%8D%AE%E8%BE%B9%E4%BA%91%E5%90%8C%E6%AD%A5%E7%A4%BA%E6%84%8F%E5%9B%BE.png)

在该场景下，可以使用 IoTDB 的 `'path'` 参数，配置一个从 A 到 C 的，范围为 root.A 下全部数据 / 元数据的同步任务，详细语句如下：
```SQL
create pipe A2C
with source (
  'source.inclusion'='data, schema',
  'source.path'='root.A.**',
)
with sink (
  'sink'='iotdb-thrift-sink',
  'sink.ip'='127.0.0.1',
  'sink.port'='6669'
)
```
并配置一个从 B 到 C 的，范围为 root.B 下全部数据 / 元数据的同步任务，详细语句如下：
```SQL
create pipe B2C
with source (
  'source.inclusion'='data, schema',
  'source.path'='root.B.**',
)
with sink (
  'sink'='iotdb-thrift-sink',
  'sink.ip'='127.0.0.1',
  'sink.port'='6669'
)
```
### 历史数据导出
本例子演示了将 IoTDB 的全量历史数据导出到另一个 IoTDB 的场景，数据链路如下图所示：

![历史数据同步示意图.png](https://alioss.timecho.com/upload/%E5%8E%86%E5%8F%B2%E6%95%B0%E6%8D%AE%E5%90%8C%E6%AD%A5%E7%A4%BA%E6%84%8F%E5%9B%BE.png)

在该场景下，可以使用 IoTDB 的 `'mode'='query'` 配置，配置一个名为 A2B 的，完成之后自动清除的同步任务，详细语句如下：
```SQL
create pipe A2B
with source (
  'source.mode'='query',
)
with sink (
  'sink'='iotdb-thrift-sink',
  'sink.ip'='127.0.0.1',
  'sink.port'='6669'
)
```

## 参考：注意事项

在 _**V1.3.3**_ 之前的版本中，可通过修改 IoTDB 配置文件（`iotdb-common.properties`）以调整数据同步的部分参数。完整配置如下：

_**V1.3.0**_，`iotdb-common.properties` 中：
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

_**V1.3.1/2**_，`iotdb-common.properties`:
```Properties
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

在 _**V1.3.0/1/2**_ 版本中，在 `iotdb-datanode.properties` 中可以调整 dataNode 接收端的临时文件目录：
```Properties
# pipe_receiver_file_dirs
# If this property is unset, system will save the data in the default relative path directory under the IoTDB folder(i.e., %IOTDB_HOME%/${dn_system_dir}/pipe/receiver).
# If it is absolute, system will save the data in the exact location it points to.
# If it is relative, system will save the data in the relative path directory it indicates under the IoTDB folder.
# If there are more than one directory, please separate them by commas ",".
# Note: If pipe_receiver_file_dirs is assigned an empty string(i.e.,zero-size), it will be handled as a relative path.
# For windows platform
# If its prefix is a drive specifier followed by "\\", or if its prefix is "\\\\", then the path is absolute. Otherwise, it is relative.
# pipe_receiver_file_dirs=data\\datanode\\system\\pipe\\receiver
# For Linux platform
# If its prefix is "/", then the path is absolute. Otherwise, it is relative.
# effectiveMode: restart
# pipe_receiver_file_dirs=data/datanode/system/pipe/receiver
```

在 _**V1.3.2**_ 版本中，在 `iotdb-confignode.properties` 中还可以调整 configNode 接收端的临时文件目录，供元数据同步使用：
```Properties
# pipe_receiver_file_dir
# If this property is unset, system will save the data in the default relative path directory under the IoTDB folder(i.e., %IOTDB_HOME%/${cn_system_dir}/pipe/receiver).
# If it is absolute, system will save the data in the exact location it points to.
# If it is relative, system will save the data in the relative path directory it indicates under the IoTDB folder.
# Note: If pipe_receiver_file_dir is assigned an empty string(i.e.,zero-size), it will be handled as a relative path.
# For windows platform
# If its prefix is a drive specifier followed by "\\", or if its prefix is "\\\\", then the path is absolute. Otherwise, it is relative.
# pipe_receiver_file_dir=data\\confignode\\system\\pipe\\receiver
# For Linux platform
# If its prefix is "/", then the path is absolute. Otherwise, it is relative.
# effectiveMode: restart
# pipe_receiver_file_dir=data/confignode/system/pipe/receiver
```

在 _**V1.3.3**_ 及以上版本中，可以通过配置 `iotdb-system.properties` 文件来配置参数。参数如下：
```Properties
# pipe_receiver_file_dir
# If this property is unset, system will save the data in the default relative path directory under the IoTDB folder(i.e., %IOTDB_HOME%/${cn_system_dir}/pipe/receiver).
# If it is absolute, system will save the data in the exact location it points to.
# If it is relative, system will save the data in the relative path directory it indicates under the IoTDB folder.
# Note: If pipe_receiver_file_dir is assigned an empty string(i.e.,zero-size), it will be handled as a relative path.
# For windows platform
# If its prefix is a drive specifier followed by "\\", or if its prefix is "\\\\", then the path is absolute. Otherwise, it is relative.
# pipe_receiver_file_dir=data\\confignode\\system\\pipe\\receiver
# For Linux platform
# If its prefix is "/", then the path is absolute. Otherwise, it is relative.
# effectiveMode: restart
# pipe_receiver_file_dir=data/confignode/system/pipe/receiver

# pipe_receiver_file_dirs
# If this property is unset, system will save the data in the default relative path directory under the IoTDB folder(i.e., %IOTDB_HOME%/${dn_system_dir}/pipe/receiver).
# If it is absolute, system will save the data in the exact location it points to.
# If it is relative, system will save the data in the relative path directory it indicates under the IoTDB folder.
# If there are more than one directory, please separate them by commas ",".
# Note: If pipe_receiver_file_dirs is assigned an empty string(i.e.,zero-size), it will be handled as a relative path.
# For windows platform
# If its prefix is a drive specifier followed by "\\", or if its prefix is "\\\\", then the path is absolute. Otherwise, it is relative.
# pipe_receiver_file_dirs=data\\datanode\\system\\pipe\\receiver
# For Linux platform
# If its prefix is "/", then the path is absolute. Otherwise, it is relative.
# effectiveMode: restart
# pipe_receiver_file_dirs=data/datanode/system/pipe/receiver

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
# Datatype: int
# pipe_subtask_executor_max_thread_num=5

# The connection timeout (in milliseconds) for the thrift client.
# Datatype: int
# pipe_sink_timeout_ms=900000

# The maximum number of selectors that can be used in the sink.
# Recommend to set this value to less than or equal to pipe_sink_max_client_number.
# Datatype: int
# pipe_sink_selector_number=4

# The maximum number of clients that can be used in the sink.
# Datatype: int
# pipe_sink_max_client_number=16

# Whether to enable receiving pipe data through air gap.
# The receiver can only return 0 or 1 in tcp mode to indicate whether the data is received successfully.
# Datatype: Boolean
# pipe_air_gap_receiver_enabled=false

# The port for the server to receive pipe data through air gap.
# Datatype: int
# pipe_air_gap_receiver_port=9780

# The total bytes that all pipe sinks can transfer per second.
# When given a value less than or equal to 0, it means no limit.
# default value is -1, which means no limit.
# Datatype: double
# pipe_all_sinks_rate_limit_bytes_per_second=-1
```

## 参考：参数说明
📌 说明：在 _**1.3.1**_ 及以上的版本中，除 source、processor、sink 本身外，各项参数不再需要额外增加 source、processor、sink 前缀。例如：
```SQL
create pipe A2B
with sink (
  'sink'='iotdb-air-gap-sink',
  'sink.ip'='10.53.53.53',
  'sink.port'='9780'
)
```
可以写作
```SQL
create pipe A2B
with sink (
  'sink'='iotdb-air-gap-sink',
  'ip'='10.53.53.53',
  'port'='9780'
)
```

### source  参数

| key                                        | value                                                       | value 取值范围                             | 是否必填 | 默认取值                                   |
|--------------------------------------------|-------------------------------------------------------------|----------------------------------------|------|----------------------------------------|
| source                                     | iotdb-source                                                | String: iotdb-source                   | 必填   | -                                      |
| source.pattern                             | 用于筛选时间序列的路径前缀                                               | String: 任意的时间序列前缀                      | 选填   | root                                   |
| source.history.start-time                  | 同步历史数据的开始 event time，包含 start-time                          | Long: [Long.MIN_VALUE, Long.MAX_VALUE] | 选填   | Long.MIN_VALUE                         |
| source.history.end-time                    | 同步历史数据的结束 event time，包含 end-time                            | Long: [Long.MIN_VALUE, Long.MAX_VALUE] | 选填   | Long.MAX_VALUE                         |
| source.realtime.mode                       | 实时数据的抽取模式                                                   | String: hybrid, stream, batch          | 选填   | hybrid                                 |
| source.forwarding-pipe-requests            | 是否转发由其他 Pipe （通常是数据同步）写入的数据                                 | Boolean: true, false                   | 选填   | true                                   |
| source.history.loose-range                 | 是否放松对于历史数据的过滤条件限制，以达到更高的同步速率。目前仅支持放松时间条件                    | String: time                           | 选填   | time                                   |
| source.start-time(_**V1.3.1**_+)           | 同步所有数据的开始 event time，包含 start-time                          | Long: [Long.MIN_VALUE, Long.MAX_VALUE] | 选填   | Long.MIN_VALUE                         |
| source.end-time(_**V1.3.1**_+)             | 同步所有数据的结束 event time，包含 end-time                            | Long: [Long.MIN_VALUE, Long.MAX_VALUE] | 选填   | Long.MAX_VALUE                         |
| source.inclusion(_**V1.3.2**_+)            | 数据 / 元数据同步的整体范围，具体介绍见上文                                     | String: 合法的同步范围前缀                      | 选填   | data.insert                            |
| source.inclusion.exclusion(_**V1.3.2**_+)  | 数据 / 元数据同步的整体范围中的排除范围，具体介绍见上文                               | String: 合法的同步范围前缀                      | 选填   | Ø                                      |
| source.mods.enable(_**V1.3.2**_+)          | 是否支持同步 tsFile 的 mods（删除信息）文件                                | Boolean: true, false                   | 选填   | false, 元数据同步范围包括 data.delete 时默认为 true |
| source.mode(_**V1.3.3**_+)                 | Pipe 的类型，如果为 subscribe 则会一直处理数据，如果为 query 则会在处理历史数据后自动 drop | String: query / subscribe              | 选填   | subscribe                              |
| source.realtime.loose-range(_**V1.3.3**_+) | 是否放松对于实时数据的过滤条件限制，以达到更高的同步速率。目前仅支持放松时间条件                    | String: time                           | 选填   | time                                   |

> 💎 **说明：历史数据与实时数据的差异**
> 
> * **历史数据**：所有 arrival time < 创建 pipe 时当前系统时间的数据称为历史数据
> * **实时数据**：所有 arrival time >= 创建 pipe 时当前系统时间的数据称为实时数据
> * **全量数据**: 全量数据 = 历史数据 + 实时数据


> 💎  ​**说明：数据抽取模式hybrid, stream和batch的差异**
> 
>    - **hybrid（推荐）**：该模式下，任务将优先对数据进行实时处理、发送，当数据产生积压时自动切换至批量发送模式，其特点是平衡了数据同步的时效性和吞吐量
>    - **stream**：该模式下，任务将对数据进行实时处理、发送，其特点是高时效、低吞吐
>    - **batch**：该模式下，任务将对数据进行批量（按底层数据文件）处理、发送，其特点是低时效、高吞吐


### sink 参数

#### iotdb-thrift-sink

| key                                                           | value                                                                                   | value 取值范围                                                                | 是否必填 | 默认取值                       |
|---------------------------------------------------------------|-----------------------------------------------------------------------------------------|---------------------------------------------------------------------------|------|----------------------------|
| sink                                                          | iotdb-thrift-sink 或 iotdb-thrift-async-sink                                             | String: iotdb-thrift-sink 或 iotdb-thrift-async-sink                       | 必填   |                            |
| sink.ip                                                       | 目标端 IoTDB 其中一个 DataNode 节点的数据服务 ip（请注意同步任务不支持向自身服务进行转发）                                 | String                                                                    | 选填   | 与 sink.node-urls 任选其一填写    |
| sink.port                                                     | 目标端 IoTDB 其中一个 DataNode 节点的数据服务 port（请注意同步任务不支持向自身服务进行转发）                               | Integer                                                                   | 选填   | 与 sink.node-urls 任选其一填写    |
| sink.node-urls                                                | 目标端 IoTDB 任意多个 DataNode 节点的数据服务端口的 url（请注意同步任务不支持向自身服务进行转发）                             | String。例：'127.0.0.1:6667,127.0.0.1:6668,127.0.0.1:6669', '127.0.0.1:6667' | 选填   | 与 sink.ip:sink.port 任选其一填写 |
| sink.batch.enable                                             | 是否开启日志攒批发送模式，用于提高传输吞吐，降低 IOPS                                                           | Boolean: true, false                                                      | 选填   | true                       |
| sink.batch.max-delay-seconds                                  | 在开启日志攒批发送模式时生效，表示一批数据在发送前的最长等待时间（单位：s）                                                  | Integer                                                                   | 选填   | 1                          |
| sink.batch.size-bytes                                         | 在开启日志攒批发送模式时生效，表示一批数据最大的攒批大小（单位：byte）                                                   | Long                                                                      | 选填   | 16 * 1024 * 1024           |
| sink.leader-cache.enable（_**V1.3.1**_+）                       | 是否允许 sink 缓存接收端请求路径下的 region leader，当接收端为集群时可以增加同步效率                                    | Boolean: true, false                                                      | 选填   | true                       |
| sink.exception.conflict.resolve-strategy（_**V1.3.2**_+）       | 当出现发送端、接收端的数据 / 元数据冲突时的解决策略。配置为 retry 时重试，ignore 时忽略。                                   | String: retry / ignore                                                    | 选填   | retry                      |
| sink.exception.conflict.retry-max-time-seconds（_**V1.3.2**_+） | 当策略为 retry 且出现数据 / 元数据冲突时的最大重试秒数，小于 0 时无限重试                                             | Long                                                                      | 选填   | 60                         |
| sink.exception.conflict.record-ignored-data（_**V1.3.2**_+）    | 当由于 ignore 或 retry 超时而忽略掉某个冲突数据 / 元数据时，是否打印该数据的信息。                                      | Boolean: true, false                                                      | 选填   | true                       |
| sink.exception.others.retry-max-time-seconds（_**V1.3.2**_+）   | 当出现未知错误时的最大重试秒数，小于 0 时无限重试                                                              | Long                                                                      | 选填   | -1                         |
| sink.exception.others.record-ignored-data（_**V1.3.2**_+）      | 当由于 retry 超时而忽略掉某个未知错误数据时，是否打印该数据的信息。                                                   | Boolean: true, false                                                      | 选填   | true                       |
| sink.load-balance-strategy（_**V1.3.2**_+）                     | 配置多个接收端时，sink 的负载均衡策略。round-robin：从当前连接节点开始顺序选择，random：随机选择，priority：每次都从第一个配置的节点开始顺序尝试 | String: round-robin / random / priority                                   | 选填   | round-robin                |
| sink.compressor（_**V1.3.3**_+）                                | Sink 所选取的 rpc 压缩算法，可配置多个，每个之间用逗号分隔，对每个发送的请求会从左到右迭代执行配置的压缩算法。                            | String: snappy / gzip / lz4 / zstd / lzma2                                | 选填   | ""                         |
| sink.rate-limit-bytes-per-second（_**V1.3.3**_+）               | 用于限流的参数，设置该 pipe 每秒可传输的 byte 数上限。小于 0 时表示不限制。                                           | Long                                                                      | 选填   | -1                         |
| sink.realtime-first（_**V1.3.3**_+）                            | 是否允许 sink 优先传输实时数据，若配置为 false 则所有数据按照捕获顺序传输                                             | Boolean: true, false                                                      | 选填   | true                       |

#### iotdb-air-gap-sink

| key                                                           | value                                                                                   | value 取值范围                                                                | 是否必填 | 默认取值                       |
|---------------------------------------------------------------|-----------------------------------------------------------------------------------------|---------------------------------------------------------------------------|------|----------------------------|
| sink                                                          | iotdb-air-gap-sink                                                                      | String: iotdb-air-gap-sink                                                | 必填   |                            |
| sink.ip                                                       | 目标端 IoTDB 其中一个 DataNode 节点的数据服务 ip                                                      | String                                                                    | 选填   | 与 sink.node-urls 任选其一填写    |
| sink.port                                                     | 目标端 IoTDB 其中一个 DataNode 节点的数据服务 port                                                    | Integer                                                                   | 选填   | 与 sink.node-urls 任选其一填写    |
| sink.node-urls                                                | 目标端 IoTDB 任意多个 DataNode 节点的数据服务端口的 url                                                  | String。例：'127.0.0.1:6667,127.0.0.1:6668,127.0.0.1:6669', '127.0.0.1:6667' | 选填   | 与 sink.ip:sink.port 任选其一填写 |
| sink.air-gap.handshake-timeout-ms                             | 发送端与接收端在首次尝试建立连接时握手请求的超时时长，单位：毫秒                                                        | Integer                                                                   | 选填   | 5000                       |
| sink.air-gap.e-language.enable                                | 是否是反向网闸                                                                                 | Boolean: true, false                                                      | 选填   | false                      |
| sink.exception.conflict.resolve-strategy（_**V1.3.2**_+）       | 当出现发送端、接收端的数据 / 元数据传输错误时的解决策略。配置为 retry 时重试，ignore 时忽略。                                 | String: retry / ignore                                                    | 选填   | retry                      |
| sink.exception.conflict.retry-max-time-seconds（_**V1.3.2**_+） | 当策略为 retry 且出现数据 / 元数据传输错误时的最大重试秒数，小于 0 时无限重试                                           | Long                                                                      | 选填   | 60                         |
| sink.exception.conflict.record-ignored-data（_**V1.3.2**_+）    | 当由于 ignore 或 retry 超时而忽略掉某个传输错误数据时，是否打印该数据的信息。                                          | Boolean: true, false                                                      | 选填   | true                       |
| sink.load-balance-strategy（_**V1.3.2**_+）                     | 配置多个接收端时，sink 的负载均衡策略。round-robin：从当前连接节点开始顺序选择，random：随机选择，priority：每次都从第一个配置的节点开始顺序尝试 | String: round-robin / random / priority                                   | 选填   | round-robin                |
| sink.compressor（_**V1.3.3**_+）                                | Sink 所选取的 rpc 压缩算法，可配置多个，每个之间用逗号分隔，对每个发送的请求会从左到右迭代执行配置的压缩算法。                            | String: snappy / gzip / lz4 / zstd / lzma2                                | 选填   | ""                         |
| sink.rate-limit-bytes-per-second（_**V1.3.3**_+）               | 用于限流的参数，设置该 pipe 每秒可传输的 byte 数上限。小于 0 时表示不限制。                                           | Long                                                                      | 选填   | -1                         |
| sink.realtime-first（_**V1.3.3**_+）                            | 是否允许 sink 优先传输实时数据，若配置为 false 则所有数据按照捕获顺序传输                                             | Boolean: true, false                                                      | 选填   | true                       |

#### iotdb-thrift-ssl-sink(V1.3.1+)

| key                                                           | value                                                                                   | value range                                                                      | required or not | default value                    |
|---------------------------------------------------------------|-----------------------------------------------------------------------------------------|----------------------------------------------------------------------------------|-----------------|----------------------------------|
| sink                                                          | iotdb-thrift-ssl-sink                                                                   | String: iotdb-thrift-ssl-sink                                                    | 必填              |                                  |
| sink.ip                                                       | 目标端 IoTDB 其中一个 DataNode 节点的数据服务 ip（请注意同步任务不支持向自身服务进行转发）                                 | String                                                                           | 选填              | 与 sink.node-urls 任选其一填写          |
| sink.port                                                     | 目标端 IoTDB 其中一个 DataNode 节点的数据服务 port（请注意同步任务不支持向自身服务进行转发）                               | Integer                                                                          | 选填              | 与 sink.node-urls 任选其一填写          |
| sink.node-urls                                                | 目标端 IoTDB 任意多个 DataNode 节点的数据服务端口的 url（请注意同步任务不支持向自身服务进行转发）                             | String。例：'127.0.0.1:6667,127.0.0.1:6668,127.0.0.1:6669', '127.0.0.1:6667'        | 选填              | 与 sink.ip:sink.port 任选其一填写       |
| sink.batch.enable                                             | 是否开启日志攒批发送模式，用于提高传输吞吐，降低 IOPS                                                           | Boolean: true, false                                                             | 选填              | true                             |
| sink.batch.max-delay-seconds                                  | 在开启日志攒批发送模式时生效，表示一批数据在发送前的最长等待时间（单位：s）                                                  | Integer                                                                          | 选填              | 1                                |
| sink.batch.size-bytes                                         | 在开启日志攒批发送模式时生效，表示一批数据最大的攒批大小（单位：byte）                                                   | Long                                                                             | 选填              | 16 * 1024 * 1024                 |
| ssl.trust-store-path                                          | 连接目标端 DataNode 所需的 trust store 证书路径                                                     | String.Example: '127.0.0.1:6667,127.0.0.1:6668,127.0.0.1:6669', '127.0.0.1:6667' | Optional        | Fill in either sink.ip:sink.port |
| ssl.trust-store-pwd                                           | 连接目标端 DataNode 所需的 trust store 证书密码                                                     | Integer                                                                          | Optional        | 5000                             |
| sink.leader-cache.enable（_**V1.3.1**_+）                       | 是否允许 sink 缓存接收端请求路径下的 region leader，当接收端为集群时可以增加同步效率                                    | Boolean: true, false                                                             | 选填              | true                             |
| sink.exception.conflict.resolve-strategy（_**V1.3.2**_+）       | 当出现发送端、接收端的数据 / 元数据冲突时的解决策略。配置为 retry 时重试，ignore 时忽略。                                   | String: retry / ignore                                                           | 选填              | retry                            |
| sink.exception.conflict.retry-max-time-seconds（_**V1.3.2**_+） | 当策略为 retry 且出现数据 / 元数据冲突时的最大重试秒数，小于 0 时无限重试                                             | Long                                                                             | 选填              | 60                               |
| sink.exception.conflict.record-ignored-data（_**V1.3.2**_+）    | 当由于 ignore 或 retry 超时而忽略掉某个冲突数据时，是否打印该数据的信息。                                            | Boolean: true, false                                                             | 选填              | true                             |
| sink.exception.others.retry-max-time-seconds（_**V1.3.2**_+）   | 当出现未知错误时的最大重试秒数，小于 0 时无限重试                                                              | Long                                                                             | 选填              | -1                               |
| sink.exception.others.record-ignored-data（_**V1.3.2**_+）      | 当由于 retry 超时而忽略掉某个未知错误数据时，是否打印该数据的信息。                                                   | Boolean: true, false                                                             | 选填              | true                             |
| sink.load-balance-strategy（_**V1.3.2**_+）                     | 配置多个接收端时，sink 的负载均衡策略。round-robin：从当前连接节点开始顺序选择，random：随机选择，priority：每次都从第一个配置的节点开始顺序尝试 | String: round-robin / random / priority                                          | 选填              | round-robin                      |
| sink.compressor（_**V1.3.3**_+）                                | Sink 所选取的 rpc 压缩算法，可配置多个，每个之间用逗号分隔，对每个发送的请求会从左到右迭代执行配置的压缩算法。                            | String: snappy / gzip / lz4 / zstd / lzma2                                       | 选填              | ""                               |
| sink.rate-limit-bytes-per-second（_**V1.3.3**_+）               | 用于限流的参数，设置该 pipe 每秒可传输的 byte 数上限。小于 0 时表示不限制。                                           | Long                                                                             | 选填              | -1                               |
| sink.realtime-first（_**V1.3.3**_+）                            | 是否允许 sink 优先传输实时数据，若配置为 false 则所有数据按照捕获顺序传输                                             | Boolean: true, false                                                             | 选填              | true                             |
