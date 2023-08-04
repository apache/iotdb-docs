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

# 数据同步软件

除了内置的 Pipe 同步功能之外，IoTDB 还提供外置的数据同步软件。该软件由 Java 编写，因此具有跨平台性，在 Windows 和 Linux 下都可以执行同步功能。该软件除 Pipe 的基础功能外，还添加了额外功能。该软件支持命令行中以 SQL 语句执行，此外还支持图形化界面。

## 连接方法
在使用数据同步软件时，首先需定位发送端集群。为允许发送端集群出于关闭状态，此处除可以通过 ip:port 定位集群，也可以给定发送端集群的 data 目录。将以下两组配置其一写入 data-sync.properties 即可：

- ssh_port, ssh_user, ssh_password, data_dir：用于定位数据目录位置，当 ssh 未配置时默认为本机。
- user, password, dn_rpc_address, dn_rpc_port：用于定位运行中的 IoTDB 位置，user 和 password 可不填写，默认为 root。

## 软件特性及用法
数据同步软件支持 SQL 及图形化界面的交互。其中，SQL 语句的用法与 IoTDB Pipe 的命令行用法相同，如下：
```shell
create pipe p1 with extractor (....) processor (....) connector (....)
```
其中 extractor，processor，connector 均为可自定义的插件。extractor 为数据的收集器，负责收集 IoTDB 内的特定数据；processor 为处理器，负责对收集到的数据进行过滤等处理；connector 为连接器，负责对数据进行最后的发送。上述命令中（....）部分为可配置的参数，容忍无效参数，具体有效参数取决于插件实现本身。

下面将列出该软件的所有特性及其 SQL 用法。

### 数据收集
目前软件自带的 Extractor 为 iotdb-extractor，该 extractor 支持对任意前缀路径进行同步，即支持选定任意数据库，设备和时间序列。此外，还可以选择同步历史数据 / 实时数据或是两者，还支持规定历史数据的起始时间和截止时间。示例的 extractor 参数如下：
```shell
('extractor' = 'iotdb-extractor', 'extractor.pattern' = 'root', 'extractor.history.enable' = 'true', 'extractor.history.start-time' = '2023-07-03T16:49:58.845+08:00', 'extractor.history.end-time' = '2023-07-04T16:49:58.845+08:00', 'extractor.realtime.enable' = 'true', 'extractor.realtime.mode' = 'log')
```
其中，各参数的含义如下：

| 参数名          | 参数说明    | 是否必需                                                  |
| ---------------------- | ------------------------------------------------------- | -------- |
| extractor | 通用配置，表示选用的 extractor 类型，这里是软件自带的 iotdb-extractor。|否，默认为 iotdb-extractor|
| extractor.pattern | 为 iotdb-extractor 规定的特定配置，之后的参数相同。这里为选定的数据前缀路径。|否，默认为 root|
| extractor.history.enable | 规定是否可以同步历史数据，取值为 true 或 false。|否，默认为 true|
| extractor.history.start-time | 为历史数据的截取开始时间戳，用于截取某一时间段的数据。|否，默认为历史数据开始时间|
| extractor.history.end-time| 为历史数据的截取停止时间戳，用于截取某一时间段的数据。|否，默认为历史数据结束时间|
| extractor.realtime.enable| 规定是否可以同步实时数据，取值为 true 或 false|否，默认为true|
| extractor.realtime.mode |规定实时数据的同步方式，取值为 log，hybrid，file，表示基于文件，WAL或混合同步|否，默认为hybrid|
### 数据处理
此外，该软件支持对选择的数据进行处理。目前的 processor 内置了一些简单功能，例如基于某个字段取值的过滤，选择和重命名等，还可以自定义流处理算法，来对收集到的数据进行处理，例如滑动平均等。一些较为简单的功能已经封装在软件内部，而如果想要自定义复杂功能，可以编写相关的类作为数据的处理插件。

#### 无操作
无操作时，使用 do-nothing-processor 即可。示例的 processor 参数如下：
```shell
('processor' = 'do-nothing-processor')
```
与上述相似，此处的 processor 为通用配置，表示选用的 processor 类型。

#### 取值过滤及选择
使用自带的取值过滤 processor 可以根据 IoTDB 点的取值进行过滤。示例的 processor 参数如下：
```shell
('processor' = 'filter-processor', 'processor.include.condition'='is double && >1', 'processor.exclude.condition' = 'is double && >=2')
```
此处的 processor.include.condition 为选择某个取值的条件，processor.exclude.condition 为过滤某个取值的条件，二者必填其一。此处的参数表示选取收集的数据中，类型为 double 且大于 1 小于 2 的数据。

#### 取值重写
使用取值重命名 processor 可以根据 IoTDB 点的取值进行改写。processor 参数如下：
```shell
('processor' = 'rewrite-processor', 'processor.rewrite.condition'='is double && >1', 'processor.rewrite.newValue' = '1')
```
此处的 processor.rewrite.condition 表示进行重写的判断条件，必填；processor.rewrite.newValue 表示进行重写的新值，同样必填。此处的参数表示将收集的数据中，类型为 double 且值大于 1 的数据改为 1，其他数据不变。

### 数据发送
数据同步软件提供了内置的多种 connector，这些 connector 的类型如下：

#### Thrift connector
支持使用 Thrift 方式，将数据同步到 IoTDB 的接收端。采用 Thrift 方式的同步参数如下：
- iotdb-thrift-connector
- iotdb-thrift-connector-v1
- iotdb-thrift-connector-v2

其中，iotdb-thrift-connector-v1 会选择某个接收端地址进行发送，通常在单个地址时效率较高；iotdb-thrift-connector-v2 会并发在所有接收端地址进行发送，在多个地址时效率较高。
iotdb-thrift-connector 会选择当前版本默认的 connector 进行发送，目前为 iotdb-thrift-connector-v1。以上 connector 公用相关参数，其取值示例如下：

```shell
('connector' = 'iotdb-thrift-connector', 'connector.ip' = 'xxx.xxx.xxx.xxx', 'connector.port' = 'xxxx', 'connector.node-urls' = 'xxx.xxx.xxx.xxx:xxxx,yyy.yyy.yyy.yyy:yyyy', 'connector.compression' = 'zstd')
```
| 参数名          | 参数说明    | 是否必需                                                  |
| ---------------------- | ------------------------------------------------------- | -------- |
|connector|通用配置，表示选用的 connector 类型，这里是 iotdb-thrift-connector， iotdb-thrift-connector-v1 或 iotdb-thrift-connector-v2。|否，默认为iotdb-thrift-connector|
|connector.ip| 表示接收端选定 IoTDB 的 IP 地址 | 与 node-urls 必选其一 |
|connector.port| 表示接收端选定 IoTDB 的端口 | 与 node-urls 必选其一 |
|connector.node-urls | 表示接收端集群的地址列表，与上面的 ip/port 可以共存 |与 ip/port 必选其一|
|connector.compression | 表示发送时 tsFile 使用的二次压缩算法 | 否，默认为不压缩 |

#### InfluxDB connector
此外，使用 InfluxDB connector，还可以将上述经过筛选、处理的数据同步到 InfluxDB。该 Connector 的名称为 influxdb-connector。目前仅支持单点传输。参数取值示例如下：
```shell
('connector' = 'influxdb-connector', 'connector.ip' = 'xxx.xxx.xxx.xxx', 'connector.port' = 'xxxx')
```
这里的参数名和参数说明同上，但 ip 和 port 此时为必选项。

#### Local file backup connector

Local file backup connector 能够将 IoTDB 内部的 tsFile 文件备份至本地。此时的参数为：
```shell
('connector' = 'local-file-backup-connector', 'connector.path' = '/usr/local', 'connector.compression' = 'zstd')
```
这里的 connector.path 指要备份的文件目录，必填。connector.compression 为二次压缩方式，可选，非空时将根据 compression 的类型对打包出的 tsFile 进行二次压缩。

除了以上三类 connector 外，用户还可以自定义 connector 来实现数据的自定义发送。理论上，可以将数据以任意压缩格式，通过任何方法，发送至任何端口。

### REST api
与 IoTDB 自带的 Pipe 功能相同，该软件也提供了使用 REST 接口的访问方式，能够查看同步任务的启停和执行状态等。下面是一个示例的 REST 接口访问方法：
```shell
curl -H "Content-Type:application/json" -H "Authorization:Basic cm9vdDpyb290" -X POST --data '{"sql":"show pipes"}' http://127.0.0.1:18080/rest/v2/query
```
其中示例中 Authorization: Basic cm9vdDpyb2901 字符串为用户名 root，密码 root 对应的 Basic 鉴权 Header 格式。用户名、密码对应的完整鉴权格式为 base64.encode(username + ':' + password)，如果手动设置了用户名及密码，需要按照该格式来编写鉴权字符串。
SQL 中的 show pipes 与 IoTDB 中的对应格式相同，18080 则为配置的 REST 端口。

此处的 REST api 也提供了配置文件，在项目根目录下的 data-sync.properties 中。其中能够对 REST 服务是否启用，用户名，密码及 REST 对外的端口进行配置。
