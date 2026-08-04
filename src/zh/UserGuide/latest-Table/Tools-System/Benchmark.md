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

# 测试工具

IoT Benchmark 是面向工业物联网（IIoT）场景的时序数据库、实时数据库基准测试工具。本手册介绍工具的主要能力、支持的数据库及基本使用方法；安装、配置和测试案例主要以 IoTDB 2\.0\.x 为例，并同时覆盖树模型和表模型。

![](/img/bm2.png)

## 1\. 基本概述

IoT Benchmark 可以按照配置生成周期性时间序列数据，对数据库执行写入和查询，并统计吞吐、延迟及成功率等指标。主要能力包括：

- 跨平台运行：支持 Linux、macOS 和 Windows。

- 多种负载：支持纯写入、纯查询及读写混合负载。

- 数据集生成：可将生成的数据保存到磁盘，供重复测试使用。

- 正确性验证：可从磁盘加载数据集，执行写入和查询正确性验证。

- 多数据库支持：可对多种时序数据库和实时数据库执行测试；IoTDB 2\.0\.x 支持 JDBC、REST 和多种 Session 写入方式。

- 结果持久化：支持将测试过程和结果保存到文件、CSV、MySQL 或 IoTDB。

- 测试扩展：支持乱序写入、批量写入、集群压测、双写对比和结果可视化等场景。

### 1\.1 支持的数据库、版本和接入方式

IoT Benchmark 支持如下数据库和版本。测试时通过 `DB_SWITCH` 选择对应的数据库、版本及连接或写入方式。

|数据库|支持版本|`DB_SWITCH`|
|---|---|---|
|IoTDB|v1\.x|`IoTDB-130-JDBC`、`IoTDB-130-REST`、`IoTDB-130-SESSION_BY_TABLET`、`IoTDB-130-SESSION_BY_RECORD`、`IoTDB-130-SESSION_BY_RECORDS`|
|IoTDB|v2\.x|`IoTDB-200-JDBC`、`IoTDB-200-REST`、`IoTDB-200-SESSION_BY_TABLET`、`IoTDB-200-SESSION_BY_RECORD`、`IoTDB-200-SESSION_BY_RECORDS`|
|InfluxDB|v1\.x|`InfluxDB`|
|InfluxDB|v2\.x|`InfluxDB-2.x`|
|QuestDB|v6\.0\.7|`QuestDB`|
|Microsoft SQL Server|2016 SP2|`MSSQLSERVER`|
|VictoriaMetrics|v1\.64\.0|`VictoriaMetrics`|
|SQLite|—|`SQLite`|
|OpenTSDB|2\.4\.1|`OpenTSDB`|
|KairosDB|—|`KairosDB`|
|TimescaleDB|—|`TimescaleDB`|
|TimescaleDB Cluster|Cluster|`TimescaleDB-Cluster`|
|TDengine|2\.2\.0\.2|`TDengine`|
|TDengine|3\.0\.1|`TDengine-3`|
|DolphinDB|v2\.x|`DolphinDB-2-MTW`、`DolphinDB-2-PTA`|
|DolphinDB|v3\.x|`DolphinDB-3-MTW`、`DolphinDB-3-PTA`|
|CnosDB|—|`CnosDB`|

其中：

- IoTDB 的接入方式包括 JDBC、REST、Session by Tablet、Session by Record 和 Session by Records。

- DolphinDB 的 `MTW` 表示 `MultithreadedTableWriter`，按行缓冲写入；`PTA` 表示 `PartitionedTableAppender`，按批次进行列式整表追加。

- 数据库版本、驱动和服务端必须相互匹配。使用其他数据库时，还需要配置相应的连接及扩展参数。

### 1\.2 IoTDB 2\.0\.x 接入方式

后续安装、配置和案例以 IoTDB 2\.0\.x 为主。支持的接入方式如下。

|接入方式|`DB_SWITCH`|说明|
|---|---|---|
|JDBC|`IoTDB-200-JDBC`|通过 JDBC 执行写入和查询|
|REST|`IoTDB-200-REST`|通过 IoTDB REST 接口执行测试|
|Session by Tablet|`IoTDB-200-SESSION_BY_TABLET`|使用 Tablet 批量写入|
|Session by Record|`IoTDB-200-SESSION_BY_RECORD`|逐条写入记录|
|Session by Records|`IoTDB-200-SESSION_BY_RECORDS`|批量写入多条记录|

`IoTDB-200-SESSION_BY_TABLET` 适用于批量写入测试。

## 2\. 安装运行

本章以 IoTDB 2\.0\.x 作为被测数据库。

### 2\.1 前置条件

1. 使用 IoT Benchmark 前需要准备：

    - Java 17。

    - Maven。

    - 已安装并能够正常运行的 IoTDB 2\.0\.x。

    - 足够的客户端 CPU、内存、磁盘和网络资源。

2. 环境相关说明：

    - 推荐使用 Linux 或 macOS 执行测试。

    - Windows 使用安装包根目录下的 `benchmark.bat` 启动测试。

    - Linux 和 macOS 使用 `benchmark.sh` 启动测试。

    - CSV 记录模式中的部分系统信息采集能力仅支持 Linux。

> 注意：不要将 IoT Benchmark 与被测 IoTDB 部署在资源相互竞争的环境中。正式性能测试建议使用独立服务器，并关闭无关服务。
>
>

### 2\.2 获取方式

1. 获取发行包

可以从 [IoT Benchmark Releases](https://github.com/thulab/iot-benchmark/releases) 下载与测试目标匹配的发行包，解压后使用。

2. 从源码构建

克隆仓库：

```Bash
git clone https://github.com/thulab/iot-benchmark.git
cd iot-benchmark
```

在项目根目录执行：

```Bash
mvn clean package -Dmaven.test.skip=true
```

构建完成后，IoTDB 2\.0\.x 安装包位于：

```Plain Text
iotdb-2.0/target/iot-benchmark-iotdb-2.0/iot-benchmark-iotdb-2.0
```

进入安装目录：

```Bash
cd iotdb-2.0/target/iot-benchmark-iotdb-2.0/iot-benchmark-iotdb-2.0
```

### 2\.3 测试包结构

安装包中的常用文件和目录如下。

|名称|用途|
|---|---|
|`benchmark.sh`|Linux、macOS 启动脚本|
|`benchmark.bat`|Windows 启动脚本|
|`conf/config.properties`|测试场景配置文件|
|`lib/`|运行依赖库|
|`logs/`|测试日志，首次运行后生成|
|`data/`|数据集或持久化结果目录，按工作模式和持久化配置生成|

### 2\.4 执行测试

1. 启动 IoTDB

首先启动目标 IoTDB 2\.0\.x，并确认客户端能够访问其服务端口。默认原生接口端口为 `6667`。

2. 修改配置

- 编辑 `conf/config.properties`

- 最小连接配置示例：

```Properties
DB_SWITCH=IoTDB-200-SESSION_BY_TABLET
IoTDB_DIALECT_MODE=tree
HOST=127.0.0.1
PORT=6667
USERNAME=root
PASSWORD=root
DB_NAME=test
```

- 使用表模型时改为：

```Properties
IoTDB_DIALECT_MODE=table
```

- 如果选择 REST：

```Properties
DB_SWITCH=IoTDB-200-REST
REST_PORT=18080
REST_AUTHORIZATION=Basic cm9vdDpyb290
```

`REST_AUTHORIZATION `用于配置 REST 接口的 `Basic Authentication` 信息。示例使用用户名 root、密码 root。

3. 检查 RPC 压缩兼容性

IoT Benchmark 2\.0 默认开启 IoTDB RPC 压缩：

```Properties
ENABLE_IOTDB_RPC_COMPRESSION=true
```

该功能要求被测 IoTDB 版本为 2\.0\.6 或更高版本。如果测试 2\.0\.6 之前的 IoTDB 2\.0\.x，请设置：

```Properties
ENABLE_IOTDB_RPC_COMPRESSION=false
```

Thrift 压缩是另一项独立配置。如果启用：

```Properties
ENABLE_THRIFT_COMPRESSION=true
```

还需要在 IoTDB 的 `iotdb-datanode.properties` 中设置：

```Properties
dn_rpc_thrift_compression_enable=true
```

4. 启动 Benchmark

Linux 或 macOS：

```Bash
./benchmark.sh
```

Windows：

```Plain Text
benchmark.bat
```

测试过程中终端会周期性输出进度。完成后会输出主要配置、执行时间、结果矩阵和延迟矩阵。

### 2\.5 结果说明

测试执行信息会写入安装目录下的 `logs` 文件夹。是否生成 CSV 或写入结果数据库由 `TEST_DATA_PERSISTENCE` 等参数决定。

1. 结果矩阵

结果矩阵按操作类型统计以下指标：

|指标|说明|
|---|---|
|`okOperation`|成功执行的请求或 SQL 数量|
|`okPoint`|写入成功的数据点数，或查询成功返回的数据点数|
|`failOperation`|执行失败的请求或 SQL 数量|
|`failPoint`|写入失败的数据点数；查询操作通常为 0|
|`throughput`|吞吐量，通常等于 `okPoint / Test elapsed time`|

输出中的主要操作名称包括：

- `INGESTION`

- `PRECISE_POINT`

- `TIME_RANGE`

- `VALUE_RANGE`

- `AGG_RANGE`

- `AGG_VALUE`

- `AGG_RANGE_VALUE`

- `GROUP_BY`

- `LATEST_POINT`

- `RANGE_QUERY_DESC`

- `VALUE_RANGE_QUERY_DESC`

- `GROUP_BY_DESC`

- `SET_OP_QUERY`

2. 延迟矩阵

延迟矩阵以毫秒为单位，常见字段如下：

|指标|说明|
|---|---|
|`AVG`|平均延迟|
|`MIN`|最小延迟|
|`P10`、`P25`、`MEDIAN`|低分位和中位延迟|
|`P75`、`P90`、`P95`|较高分位延迟|
|`P99`、`P999`|尾延迟|
|`MAX`|最大延迟|
|`SLOWEST_THREAD`|客户端线程中最大的累计操作时间|

测试结果还会给出元数据创建耗时和不包含元数据创建的 `Test elapsed time`。对比测试时，应确保各轮测试的硬件、数据量、客户端数、压缩配置和缓存状态一致。

3. 输出示例

测试完成后，终端会输出本次测试的主要配置、执行时间、结果矩阵和延迟矩阵。以下为一次纯写入测试的截断输出：

```Plain Text
----------------------Main Configurations----------------------
BENCHMARK_WORK_MODE=testWithDefaultPath
DB_SWITCH=IoTDB-200-SESSION_BY_TABLET
HOST=[127.0.0.1]

GROUP_NUMBER=10
DEVICE_NUMBER=50
SENSOR_NUMBER=500
SCHEMA_CLIENT_NUMBER=20
DATA_CLIENT_NUMBER=20

OPERATION_PROPORTION=1:0:0:0:0:0:0:0:0:0:0:0:0
LOOP=10000
BATCH_SIZE_PER_WRITE=100
---------------------------------------------------------------

Create schema cost 0.30 second
Test elapsed time (not include schema creation): 1238.79 second

----------------------------------------------------------Result Matrix----------------------------------------------------------
Operation   okOperation   okPoint       failOperation   failPoint   throughput(point/s)
INGESTION   500000        25000000000   0               0           20180954.09
---------------------------------------------------------------------------------------------------------------------------------

----------------------------------------------------------Latency (ms) Matrix----------------------------------------------------
Operation   AVG    MIN   P10   P25   MEDIAN   P75   P90   P95   P99      P999      MAX      SLOWEST_THREAD
INGESTION   37.78  1.67  2.02  2.29  2.86     4.14  5.62  7.43  759.69   5799.89   8309.40  1227561.44
---------------------------------------------------------------------------------------------------------------------------------
```

从该输出可以得到：

- 元数据创建耗时为 `0.30` 秒，正式测试耗时为 `1238.79` 秒。

- 共成功执行 `500000` 次写入操作，写入 `25000000000` 个数据点。

- `failOperation` 和 `failPoint` 均为 `0`，表示该轮测试没有记录到写入失败。

- 写入吞吐为 `20180954.09` 点/秒。

- 平均延迟为 `37.78` ms，P95 延迟为 `7.43` ms，P99 延迟为 `759.69` ms，最大延迟为 `8309.40` ms。

- `SLOWEST_THREAD` 是最慢客户端线程的累计操作时间，不是单次请求延迟。

示例中的数值仅用于展示输出格式。实际结果取决于硬件资源、网络环境、IoTDB 配置、数据规模和测试参数。

## 3\. 主要参数

### 3\.1 IoTDB 服务模型

IoTDB 2\.0\.x 支持树模型和表模型，通过以下参数选择：

```Properties
IoTDB_DIALECT_MODE=tree
```

或：

```Properties
IoTDB_DIALECT_MODE=table
```

相关约束如下：

- 一个 IoTDB 实例在一次测试中只能选择一种 SQL 方言。

- 树模型要求 `DEVICE_NUMBER >= GROUP_NUMBER`。

- 表模型要求设备数是表数的整数倍，表数是数据库数的整数倍。

- 表模型下，数据客户端数应为表数的整数倍。



常用模型参数：

|参数|示例|说明|
|---|---|---|
|`IoTDB_DIALECT_MODE`|`tree`|`tree` 或 `table`|
|`GROUP_NUMBER`|`1`|数据库数量；树模型下对应 database 数量|
|`IoTDB_TABLE_NUMBER`|`1`|表模型下创建的表数量|
|`IoTDB_TABLE_NAME_PREFIX`|`table_`|表名称前缀|
|`TABLE_TIME_COLUMN`|`time`|表模型时间列名称|
|`IoTDB_TABLE_WRITABLE_VIEW`|`false`|是否创建并使用可写视图|

### 3\.2 工作模式

通过 `BENCHMARK_WORK_MODE` 选择工作模式。

|模式|配置值|说明|
|---|---|---|
|常规测试模式|`testWithDefaultPath`|执行写入、查询或混合负载|
|生成数据模式|`generateDataMode`|将 Benchmark 生成的数据集保存到 `FILE_PATH`|
|正确性写入模式|`verificationWriteMode`|从 `FILE_PATH` 加载数据集并写入数据库|
|正确性查询模式|`verificationQueryMode`|加载数据集并与数据库查询结果进行比对|

示例：

```Properties
BENCHMARK_WORK_MODE=testWithDefaultPath
```

使用正确性写入和查询模式前，应先通过 `generateDataMode` 生成可复用数据集。

### 3\.3 服务器连接信息

|参数|示例|说明|
|---|---|---|
|`DB_SWITCH`|`IoTDB-200-SESSION_BY_TABLET`|数据库版本和连接方式|
|`HOST`|`127.0.0.1`|IoTDB 地址；多个地址使用英文逗号分隔|
|`PORT`|`6667`|原生服务端口，数量应与 `HOST` 一致|
|`USERNAME`|`root`|用户名|
|`PASSWORD`|`root`|密码|
|`DB_NAME`|`test`|测试使用的数据库名称|
|`REST_PORT`|`18080`|REST 服务端口|
|`REST_AUTHORIZATION`|`Basic cm9vdDpyb290`|REST 授权头|
|`ENABLE_AUTO_FETCH`|`false`|Session 是否自动刷新 DataNode 列表|

清理数据相关参数：

```Properties
IS_DELETE_DATA=false
INIT_WAIT_TIME=1000
```

> 警告：`IS_DELETE_DATA=true` 会在测试开始前清理目标数据库中的测试数据。仅可在专用测试环境中启用，并在执行前确认 `HOST`、`PORT`、`DB_NAME` 和账号权限。
>
>

### 3\.4 写入场景

1. 数据规模和客户端

|参数|示例|说明|
|---|---|---|
|`DEVICE_NUMBER`|`100`|设备总数|
|`SENSOR_NUMBER`|`10`|每个设备的测点数；表模型下为测点列数量|
|`GROUP_NUMBER`|`1`|IoTDB database 数量|
|`SCHEMA_CLIENT_NUMBER`|`5`|注册元数据的客户端数|
|`DATA_CLIENT_NUMBER`|`10`|执行数据读写的客户端数|
|`IS_CLIENT_BIND`|`true`|是否将设备绑定到客户端|
|`REAL_INSERT_RATE`|`1.0`|实际参与写入的设备比例|
|`IS_SENSOR_TS_ALIGNMENT`|`true`|同一设备下测点时间戳是否对齐|

2. 批量写入

|参数|示例|说明|
|---|---|---|
|`BATCH_SIZE_PER_WRITE`|`100`|每批每个设备写入的数据行数|
|`DEVICE_NUM_PER_WRITE`|`1`|每批写入涉及的设备数|
|`CREATE_SCHEMA`|`true`|写入前是否创建元数据|
|`START_TIME`|`2022-01-01T00:00:00+08:00`|生成数据的起始时间|

单个批次的数据点数为：

```Plain Text
DEVICE_NUM_PER_WRITE × SENSOR_NUMBER × BATCH_SIZE_PER_WRITE
```

`DEVICE_NUM_PER_WRITE` 必须能够整除单个数据客户端所负责的设备数。表模型下还应满足设备数、表数和单批设备数之间的整除约束。

3. 写入节奏

|参数|示例|说明|
|---|---|---|
|`POINT_STEP`|`5000`|相邻生成时间戳的固定间隔|
|`OP_MIN_INTERVAL`|`0`|每个 loop 的最小执行间隔，单位 ms|
|`OP_MIN_INTERVAL_RANDOM`|`false`|是否在 `[0, OP_MIN_INTERVAL)` 中随机选择间隔|
|`INTERVAL_BETWEEN_WRITE_BATCH`|`0`|同一 loop 内相邻 batch 的最小间隔，单位 ms|
|`TIMESTAMP_PRECISION`|`ms`|时间戳精度|

`OP_MIN_INTERVAL` 的特殊值：

- `0`：不限制 loop 间隔。

- `-1`：使用 `POINT_STEP` 作为最小间隔。

- 正整数：如果当前 loop 耗时不足该值，则等待剩余时间。

4. 乱序写入

```Properties
IS_OUT_OF_ORDER=false
OUT_OF_ORDER_MODE=POISSON
OUT_OF_ORDER_RATIO=0.5
IS_REGULAR_FREQUENCY=true
```

支持的乱序模式包括：

- `POISSON`：按照泊松分布生成乱序时间戳。

- `BATCH`：按批次生成乱序数据。

5. 数据类型

```Properties
INSERT_DATATYPE_PROPORTION=1:1:1:1:1:1:0:0:0:0:0
```

各项顺序为：

```Plain Text
BOOLEAN:INT32:INT64:FLOAT:DOUBLE:TEXT:STRING:BLOB:TIMESTAMP:DATE:OBJECT
```

各项数值表示相应数据类型的比例。

### 3\.5 查询场景

|参数|示例|说明|
|---|---|---|
|`QUERY_DEVICE_NUM`|`1`|每条查询涉及的设备数|
|`QUERY_SENSOR_NUM`|`1`|每条查询涉及的测点数|
|`QUERY_AGGREGATE_FUN`|`count`|聚合函数|
|`STEP_SIZE`|`0`|查询起始时间的变化步长，单位为 `POINT_STEP`|
|`QUERY_INTERVAL`|`250000`|查询起止时间间隔|
|`QUERY_LOWER_VALUE`|`-5`|值过滤条件下限|
|`GROUP_BY_TIME_UNIT`|`20000`|Group By 窗口大小|
|`QUERY_SET_OP_TYPE`|`union`|集合操作类型|
|`QUERY_SET_OP_NUM`|`2`|集合查询的子集合数量，至少为 2|
|`IS_RECENT_QUERY`|`false`|混合场景下是否优先查询最近写入的数据|
|`ENABLE_FIXED_QUERY`|`false`|是否让所有查询线程使用相同设备和测点组合|
|`RESULT_ROW_LIMIT`|`-1`|查询结果行数限制；`-1` 表示不使用限制|
|`ALIGN_BY_DEVICE`|`false`|是否使用 Align By Device|

### 3\.6 操作比例

`OPERATION_PROPORTION` 用于定义写入和各类查询的比例，共包含 13 项：

```Plain Text
写入:Q1:Q2:Q3:Q4:Q5:Q6:Q7:Q8:Q9:Q10:Q11:Q12
```

例如，纯写入：

```Properties
OPERATION_PROPORTION=1:0:0:0:0:0:0:0:0:0:0:0:0
```

纯精确点查询：

```Properties
OPERATION_PROPORTION=0:1:0:0:0:0:0:0:0:0:0:0:0
```

操作类型如下。

|编号|操作类型|说明|
|---|---|---|
|写入|数据写入|按当前写入配置生成并写入数据|
|Q1|精确点查询|按时间戳和设备查询指定测点|
|Q2|时间范围查询|只限制起止时间的范围查询|
|Q3|带值过滤的范围查询|同时包含时间和值过滤条件|
|Q4|带时间过滤的聚合查询|在时间范围内执行聚合|
|Q5|带值过滤的聚合查询|在全时间范围内按值过滤并聚合|
|Q6|带时间和值过滤的聚合查询|同时包含时间和值过滤条件|
|Q7|时间分组聚合查询|Group By 查询|
|Q8|最近点查询|查询设备的最新数据点|
|Q9|倒序时间范围查询|按时间倒序返回范围查询结果|
|Q10|倒序带值过滤的范围查询|带值过滤并按时间倒序返回|
|Q11|倒序时间分组聚合查询|倒序 Group By 查询|
|Q12|集合操作查询|`union`、`intersect` 或 `except` 等集合操作|

Q12 仅支持 IoTDB 2\.0 表模型。集合操作中的各子查询为范围查询。

### 3\.7 测试过程和结果持久化

```Properties
TEST_DATA_PERSISTENCE=None
```

支持的取值包括：

- `None`：不将测试过程写入外部持久化介质。

- `CSV`：写入 CSV 文件。

- `MySQL`：写入 MySQL。

- `IoTDB`：写入指定的 IoTDB。

常用参数：

|参数|示例|说明|
|---|---|---|
|`TEST_DATA_PERSISTENCE`|`None`|持久化方式|
|`RECORD_SPLIT`|`true`|是否将结果拆分为多条记录|
|`RECORD_SPLIT_MAX_LINE`|`10000000`|单表或单文件的最大记录数|
|`TEST_DATA_STORE_IP`|`127.0.0.1`|结果数据库地址|
|`TEST_DATA_STORE_PORT`|`6667`|结果数据库端口|
|`TEST_DATA_STORE_DB`|`result`|结果数据库名称|
|`TEST_DATA_STORE_USER`|`root`|结果数据库用户名|
|`TEST_DATA_STORE_PW`|`root`|结果数据库密码|
|`REMARK`|`write_test`|测试备注，可用于区分不同测试|
|`CSV_OUTPUT`|`true`|是否将最终结果写入 CSV|

设置为 CSV 时，运行后会在 `data` 目录下生成相关记录；其中测试结果通常位于 `data/csvOutput`。无论是否开启持久化，测试日志均写入 `logs`。



日志输出频率可通过以下参数控制：

```Properties
IS_QUIET_MODE=true
LOG_PRINT_INTERVAL=5
RESULT_PRINT_INTERVAL=3600
```

### 3\.8 自动化和集群测试

1. 限制测试时长

```Properties
TEST_MAX_TIME=3600000
```

单位为毫秒。设置为 `0` 表示不限制。该参数不包含预注册元数据所消耗的时间。

2. 多 Benchmark 集群压测

在多台客户端机器上使用相同的总体数据规模配置，并设置：

```Properties
BENCHMARK_CLUSTER=true
BENCHMARK_INDEX=0
```

每个 Benchmark 实例必须使用不同的 `BENCHMARK_INDEX`，例如依次使用 `0`、`1`、`2`。所有客户端应保持数据库连接、数据规模和操作比例等配置一致。

3. 双写测试

IoT Benchmark 支持将同一份数据写入两个不同的数据库进行对比：

```Properties
IS_DOUBLE_WRITE=true
ANOTHER_DB_SWITCH=<另一数据库类型>
ANOTHER_HOST=127.0.0.1
ANOTHER_PORT=6667
ANOTHER_USERNAME=root
ANOTHER_PASSWORD=root
ANOTHER_DB_NAME=test
```

双写模式不支持同一数据库不同版本之间的比较，也不支持 IoTDB 树模型与表模型之间的直接比较。

## 4\. 使用示例

本节使用小规模数据演示基本流程。正式性能测试应根据目标业务模型扩大设备数、测点数、客户端数和循环次数，并进行多轮预热和重复测试。

### 4\.1 写入测试示例

测试目标：使用 10 个数据客户端，模拟 100 台设备，每台设备包含 10 个测点，执行纯写入测试。

配置示例：

```Properties
# 数据库连接
DB_SWITCH=IoTDB-200-SESSION_BY_TABLET
IoTDB_DIALECT_MODE=tree
HOST=127.0.0.1
PORT=6667
USERNAME=root
PASSWORD=root
DB_NAME=test

# 安全设置：默认不自动删除已有数据
IS_DELETE_DATA=false

# 工作模式
BENCHMARK_WORK_MODE=testWithDefaultPath
OPERATION_PROPORTION=1:0:0:0:0:0:0:0:0:0:0:0:0

# 数据规模
GROUP_NUMBER=1
DEVICE_NUMBER=100
SENSOR_NUMBER=10
SCHEMA_CLIENT_NUMBER=5
DATA_CLIENT_NUMBER=10
IS_SENSOR_TS_ALIGNMENT=true

# 写入配置
CREATE_SCHEMA=true
BATCH_SIZE_PER_WRITE=10
DEVICE_NUM_PER_WRITE=1
LOOP=100
POINT_STEP=1000
OP_MIN_INTERVAL=0
START_TIME=2026-01-01T00:00:00+08:00
INSERT_DATATYPE_PROPORTION=1:1:1:1:1:1:0:0:0:0:0

# IoTDB 2.0.6 及以上版本可开启
ENABLE_IOTDB_RPC_COMPRESSION=true

# 输出
TEST_DATA_PERSISTENCE=None
CSV_OUTPUT=true
REMARK=iotdb_2_write_test
```

启动测试：

```Bash
./benchmark.sh
```

完成后重点查看：

- `INGESTION` 的 `okPoint` 和 `failPoint`。

- 吞吐量 `throughput`。

- `AVG`、`P95`、`P99`、`MAX` 延迟。

- 是否存在连接超时、写入失败或服务端异常日志。

### 4\.2 查询测试示例

执行查询测试前，应确保目标数据库中已经存在与查询配置匹配的数据。建议复用写入测试生成的数据，并关闭自动删数和元数据创建。

以下示例同时执行多种查询：

```Properties
DB_SWITCH=IoTDB-200-SESSION_BY_TABLET
IoTDB_DIALECT_MODE=tree
HOST=127.0.0.1
PORT=6667
USERNAME=root
PASSWORD=root
DB_NAME=test

IS_DELETE_DATA=false
CREATE_SCHEMA=false
BENCHMARK_WORK_MODE=testWithDefaultPath

GROUP_NUMBER=1
DEVICE_NUMBER=100
SENSOR_NUMBER=10
SCHEMA_CLIENT_NUMBER=1
DATA_CLIENT_NUMBER=10

# 不执行写入，Q1～Q11 各占相同比例；树模型不使用 Q12
OPERATION_PROPORTION=0:1:1:1:1:1:1:1:1:1:1:1:0
LOOP=100

QUERY_DEVICE_NUM=2
QUERY_SENSOR_NUM=2
QUERY_AGGREGATE_FUN=count
STEP_SIZE=1
QUERY_INTERVAL=250000
QUERY_LOWER_VALUE=-5
GROUP_BY_TIME_UNIT=20000
```

如果测试表模型集合查询，可将方言切换为 `table`，并为 Q12 设置比例：

```Properties
IoTDB_DIALECT_MODE=table
OPERATION_PROPORTION=0:0:0:0:0:0:0:0:0:0:0:0:1
QUERY_SET_OP_TYPE=union
QUERY_SET_OP_NUM=2
```

### 4\.3 其他配置示例

1. 模拟真实写入速率

让每个 loop 的最小间隔与数据时间戳间隔一致：

```Properties
POINT_STEP=1000
OP_MIN_INTERVAL=-1
```

如果希望写入请求在一个 loop 内均匀分布，可使用：

```Properties
INTERVAL_BETWEEN_WRITE_BATCH=100
```

2. 指定测试时长

测试 1 小时：

```Properties
TEST_MAX_TIME=3600000
```

应确保 `LOOP` 足够大，否则测试可能先因循环次数耗尽而结束。

3. 控制生成数据规律

```Properties
LINE_RATIO=1
SIN_RATIO=1
SQUARE_RATIO=1
RANDOM_RATIO=1
CONSTANT_RATIO=1
DATA_SEED=666
STRING_LENGTH=10
DOUBLE_LENGTH=2
```

固定 `DATA_SEED` 有助于在多轮测试中生成可重复的数据。

## 5\. 参考资料

- [IoT Benchmark 文档](https://github.com/thulab/iot-benchmark/tree/master/docs)
