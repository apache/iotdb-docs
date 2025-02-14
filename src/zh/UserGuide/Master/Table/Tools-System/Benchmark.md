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

## 1 基本概述

IoT-benchmark 是基于 Java 和大数据环境开发的时序数据库基准测试工具，由清华大学软件学院研发并开源。它使用方便，支持多种写入以及查询方式，支持存储测试信息和结果以供进一步查询或分析，支持与 Tableau 集成以可视化测试结果。

下图1-1囊括了测试基准流程及其他扩展功能。这些流程可以由IoT-benchmark 统一来完成。IoT Benchmark 支持多种工作负载，包括**纯写入、纯查询、写入查询混合**等，支持**软硬件系统监控、测试指标度量**等监控功能，还实现了**初始化数据库自动化、测试数据分析及系统参数优化**等功能。

![](https://alioss.timecho.com/docs/img/bm1.PNG)

图1-1

借鉴 YCSB 测试工具将工作负载生成、性能指标测量和数据库接口三个组件分离的设计思想，IoT-benchmark 的模块化设计如图1-2所示。与基于 YCSB 的测试工具系统不同的是，IoT-benchmark 增加了系统监控模块，支持测试数据和系统指标监控数据的持久化。此外也增加了一些特别针对时序数据场景的特殊负载测试功能，如支持物联网场景的批量写入和多种乱序数据写入模式。

![](https://alioss.timecho.com/docs/img/bm2.PNG)

图1-2


目前 IoT-benchmark 支持如下时间序列数据库、版本和连接方式：

| 数据库          | 版本            | 连接方式                                                 |
| :-------------- | :-------------- | :------------------------------------------------------- |
| InfluxDB        | v1.x  v2.0      | SDK                                                      |
| TimescaleDB     | --              | jdbc                                                     |
| OpenTSDB        | --              | Http Request                                             |
| QuestDB         | v6.0.7          | jdbc                                                     |
| TDengine        | v2.2.0.2        | jdbc                                                     |
| VictoriaMetrics | v1.64.0         | Http Request                                             |
| KairosDB        | --              | Http Request                                             |
| IoTDB           | v2.0 v1.x v0.13 | jdbc、sessionByTablet、sessionByRecord、sessionByRecords |

表1-1大数据测试基准对比

## 2 安装运行

### 前置条件

1. Java 8
2. Maven 3.6+
3. 对应的合适版本的数据库，如 Apache IoTDB 1.0



### 获取方式

- 获取二进制包：进入[这里](https://github.com/thulab/iot-benchmark/releases) 下载需要的安装包。下载下来为一个压缩文件，选择文件夹解压即可使用。
- 源代码编译（可用户 Apache IoTDB 2.0 的测试）：
  - 第一步（编译 IoTDB Session 最新包）：进入[官网](https://github.com/apache/iotdb/tree/rc/2.0.1)下载 IoTDB 源码，在根目录下运行命令 mvn clean package install -pl session -am -DskipTests 编译 IoTDB Session 的最新包。
  - 第二步（编译 IoTDB Benchmark 测试包）：进入[官网](https://github.com/thulab/iot-benchmark)下载源码，在根目录下运行 mvn clean package install -pl iotdb-2.0 -am -DskipTests 编译测试 Apache IoTDB 2.0版本的测试包，测试包位置与根目录的相对路径为 ./iotdb-2.0/target/iotdb-2.0-0.0.1/iotdb-2.0-0.0.1


### 测试包结构

测试包的目录结构如下所示。其中测试配置文件为conf/config.properties，测试启动脚本为benchmark\.sh (Linux & MacOS) 和 benchmark.bat (Windows)，详细文件用途见下表所示。

```Shell
-rw-r--r--. 1 root root  2881 1月  10 01:36 benchmark.bat
-rwxr-xr-x. 1 root root   314 1月  10 01:36 benchmark.sh
drwxr-xr-x. 2 root root    24 1月  10 01:36 bin
-rwxr-xr-x. 1 root root  1140 1月  10 01:36 cli-benchmark.sh
drwxr-xr-x. 2 root root   107 1月  10 01:36 conf
drwxr-xr-x. 2 root root  4096 1月  10 01:38 lib
-rw-r--r--. 1 root root 11357 1月  10 01:36 LICENSE
-rwxr-xr-x. 1 root root   939 1月  10 01:36 rep-benchmark.sh
-rw-r--r--. 1 root root    14 1月  10 01:36 routine
```

| 名称             | 子文件            | 用途                      |
| :--------------- | :---------------- | :------------------------ |
| benchmark.bat    | -                 | Windows环境运行启动脚本   |
| benchmark.sh     | -                 | Linux/Mac环境运行启动脚本 |
| bin              | startup.sh        | 初始化脚本文件夹          |
| conf             | config.properties | 测试场景配置文件          |
| lib              | -                 | 依赖库文件                |
| LICENSE          | -                 | 许可文件                  |
| cli-benchmark.sh | -                 | 一键化启动脚本            |
| routine          |                   | 多项测试配置文件          |
| rep-benchmark.sh |                   | 多项测试启动脚本          |

表1-2文件和文件夹列表用途

### 执行测试

1. 按照测试需求修改配置文件，主要参数介绍见 1.2 节，对应配置文件为conf/config.properties，**比如测试Apache IoTDB 1.0，则需要修改 DB_SWITCH=IoTDB-100-SESSION_BY_TABLET**
2. 启动被测时间序列数据库
3. 通过运行
4. 启动IoT-benchmark执行测试。执行中观测被测时间序列数据库和IoT-benchmark状态，执行完毕后查看结果和分析测试过程。

### 结果说明

测试的所有日志文件被存放于 logs 文件夹下，测试的结果在测试完成后被存放到 data/csvOutput 文件夹下，例如测试后我们得到了如下的结果矩阵：

![](https://alioss.timecho.com/docs/img/bm4.png)

- Result Matrix
  - OkOperation：成功的对应操作次数
  - OkPoint：对于写入操作，是成功写入的点数；对于查询操作，是成功查询到的点数。
  - FailOperation：失败的对应操作次数
  - FailPoint：对于写入操作是写入失败的点数
- Latency(mx) Matrix
  - AVG：操作平均耗时
  - MIN：操作最小耗时
  - Pn：操作整体分布的对应分位值，比如P25是下四分位数



## 主要参数


### IoTDB服务模型

参数`IoTDB_DIALECT_MODE`支持tree、table,默认值为tree。

- 当被测数据库为IoTDB-2.0及以上版本时需指定sql_dialect, 并且一个IoTDB只能指定一种。
- sql_dialect等于table时，要满足：device数为table数的整数倍，table数为database数的整数倍
- sql_dialect等于tree时，要满足：device数量 >= database数量
- 表模型模式下，调整参数如下：

| **参数名称**            | **类型** | **示例** | **系统描述**                                                 |
| :---------------------- | :------- | :------- | :----------------------------------------------------------- |
| IoTDB_TABLE_NAME_PREFIX | 字符串   | table_   | IoTDB 表模型下(IoTDB_DIALECT_MODE=table)，表名称前缀         |
| DATA_CLIENT_NUMBER      | 整数     | 10       | IoTDB 表模型下(IoTDB_DIALECT_MODE=table)，client数为table数的整数倍 |
| SENSOR_NUMBER           | 整数     | 10       | IoTDB 表模型下(IoTDB_DIALECT_MODE=table)，则控制属性列数量   |
| IoTDB_TABLE_NUMBER      | 整数     | 1        | IoTDB 表模型下(IoTDB_DIALECT_MODE=table)，表的数量           |

### 工作模式

工作模式参数“`BENCHMARK_WORK_MODE`”可选项有如下四种模式：

- 常用测试模式：结合配置`OPERATION_PROPORTION`参数达到“纯写入”、“纯查询”和“读写混合”的测试操作。
- 生成数据模式：为了生成可以重复使用的数据集，iot-benchmark提供生成数据集的模式，生成数据集到FILE_PATH，以供后续使用正确性写入模式和正确性查询模式使用。
- 单数据库正确性写入模式：为了验证数据集写入的正确性，您可以使用该模式写入生成数据模式中生成的数据集，目前该模式仅支持IoTDB v1.0 及更新的版本和InfluxDB v1.x。
- 单数据库正确性查询模式：在运行这个模式之前需要先使用正确性写入模式写入数据到数据库。为了验证数据集写入的正确性，您可以使用该模式查询写入到数据库中的数据集，目前该模式仅支持IoTDB v1.0 和 InfluxDB v1.x。

| **模式名称**           | **BENCHMARK_WORK_MODE** | **模式内容**                     |
| :--------------------- | :---------------------- | :------------------------------- |
| 常规测试模式           | testWithDefaultPath     | 支持多种读和写操作的混合负载     |
| 生成数据模式           | generateDataMode        | 生成Benchmark本身识别的数据      |
| 单数据库正确性写入模式 | verificationWriteMode   | 需要配置 FILE_PATH 以及 DATA_SET |
| 单数据库正确性查询模式 | verificationQueryMode   | 需要配置 FILE_PATH 以及 DATA_SET |

### 服务器连接信息

工作模式指定后，被测时序数据库的信息会通过如下参数告知IoT-benchmark

| **参数名称** | **类型** | **示例**                    | **系统描述**                                    |
| :----------- | :------- | :-------------------------- | :---------------------------------------------- |
| DB_SWITCH    | 字符串   | IoTDB-200-SESSION_BY_TABLET | 被测时序数据库类型                              |
| HOST         | 字符串   | 127.0.0.1                   | 被测时序数据库网络地址                          |
| PORT         | 整数     | 6667                        | 被测时序数据库网络端口                          |
| USERNAME     | 字符串   | root                        | 被测时序数据库登录用户名                        |
| PASSWORD     | 字符串   | root                        | 被测时序数据库登录用户的密码                    |
| DB_NAME      | 字符串   | test                        | 被测时序数据库名称                              |
| TOKEN        | 字符串   |                             | 被测时序数据库连接认证Token（InfluxDB 2.0使用） |

### 写入场景

| **参数名称**               | **类型** | **示例**                  | **系统描述**                                                 |
| :------------------------- | :------- | :------------------------ | :----------------------------------------------------------- |
| CLIENT_NUMBER              | 整数     | 100                       | 客户端总数                                                   |
| GROUP_NUMBER               | 整数     | 20                        | 数据库的数量；仅针对IoTDB。                                  |
| DEVICE_NUMBER              | 整数     | 100                       | 设备总数                                                     |
| SENSOR_NUMBER              | 整数     | 300                       | 每个设备的传感器总数； **如果使用 IoTDB 表模型，则控制属性列数量** |
| INSERT_DATATYPE_PROPORTION | 字符串   | 1:1:1:1:1:1               | 设备的数据类型比例，BOOLEAN:INT32:INT64:FLOAT:DOUBLE:TEXT    |
| POINT_STEP                 | 整数     | 1000                      | 数据间时间戳间隔，即生成的数据两个时间戳之间的固定长度。     |
| OP_MIN_INTERVAL            | 整数     | 0                         | 操作最小执行间隔：若操作耗时大于该值则立即执行下一个，否则等待 (OP_MIN_INTERVAL-实际执行时间) ms；如果为0，则参数不生效；如果为-1，则其值和POINT_STEP一致 |
| IS_OUT_OF_ORDER            | 布尔     | false                     | 是否乱序写入                                                 |
| OUT_OF_ORDER_RATIO         | 浮点数   | 0.3                       | 乱序写入的数据比例                                           |
| BATCH_SIZE_PER_WRITE       | 整数     | 1                         | 批写入数据行数（一次写入多少行数据）                         |
| START_TIME                 | 时间     | 2022-10-30T00:00:00+08:00 | 写入数据的开始时间戳；以该时间戳为起点开始模拟创建数据时间戳。 |
| LOOP                       | 整数     | 86400                     | 总操作次数：具体每种类型操作会按OPERATION_PROPORTION定义的比例划分 |
| OPERATION_PROPORTION       | 字符     | 1:0:0:0:0:0:0:0:0:0:0     | # 各操作的比例,按照顺序为 写入:Q1:Q2:Q3:Q4:Q5:Q6:Q7:Q8:Q9:Q10, 请注意使用英文冒号。比例中的每一项是整数。 |


### 查询场景

| 参数名称             | 类型 | 示例                  | 系统描述                                                     |
| :------------------- | :--- | :-------------------- | :----------------------------------------------------------- |
| QUERY_DEVICE_NUM     | 整数 | 2                     | 每条查询语句中查询涉及到的设备数量                           |
| QUERY_SENSOR_NUM     | 整数 | 2                     | 每条查询语句中查询涉及到的传感器数量                         |
| QUERY_AGGREGATE_FUN  | 字符 | count                 | 在聚集查询中使用的聚集函数，比如count、avg、sum、max_time等  |
| STEP_SIZE            | 整数 | 1                     | 时间过滤条件的时间起点变化步长，若设为0则每个查询的时间过滤条件是一样的，单位：POINT_STEP |
| QUERY_INTERVAL       | 整数 | 250000                | 起止时间的查询中开始时间与结束时间之间的时间间隔，和Group By中的时间间隔 |
| QUERY_LOWER_VALUE    | 整数 | -5                    | 条件查询子句时的参数，where xxx > QUERY_LOWER_VALUE          |
| GROUP_BY_TIME_UNIT   | 整数 | 20000                 | Group by语句中的组的大小                                     |
| LOOP                 | 整数 | 10                    | 总操作次数：具体每种类型操作会按OPERATION_PROPORTION定义的比例划分 |
| OPERATION_PROPORTION | 字符 | 0:0:0:0:0:0:0:0:0:0:1 | 写入:Q1:Q2:Q3:Q4:Q5:Q6:Q7:Q8:Q9:Q10                          |


### 操作比例

| 编号 | 查询类型                     | IoTDB 示例 SQL                                               |
| :--- | :--------------------------- | :----------------------------------------------------------- |
| Q1   | 精确点查询                   | select v1 from root.db.d1 where time = ?                     |
| Q2   | 时间范围查询                 | select v1 from root.db.d1 where time > ? and time < ?        |
| Q3   | 带值过滤的时间范围查询       | select v1 from root.db.d1 where time > ? and time < ? and v1 > ? |
| Q4   | 时间范围聚合查询             | select count(v1) from root.db.d1 where and time > ? and time < ? |
| Q5   | 带值过滤的全时间范围聚合查询 | select count(v1) from root.db.d1 where v1 > ?                |
| Q6   | 带值过滤的时间范围聚合查询   | select count(v1) from root.db.d1 where v1 > ? and time > ? and time < ? |
| Q7   | 时间分组聚合查询             | select count(v1) from root.db.d1 group by ([?, ?), ?, ?)     |
| Q8   | 最新点查询                   | select last v1 from root.db.d1                               |
| Q9   | 倒序范围查询                 | select v1 from root.sg.d1 where time > ? and time < ? order by time desc |
| Q10  | 倒序带值过滤的范围查询       | select v1 from root.sg.d1 where time > ? and time < ? and v1 > ? order by time desc |

###  测试过程和测试结果持久化

IoT-benchmark目前支持通过配置参数将测试过程和测试结果持久化:

| **参数名称**          | **类型** | **示例**  | **系统描述**                                                 |
| :-------------------- | :------- | :-------- | :----------------------------------------------------------- |
| TEST_DATA_PERSISTENCE | 字符串   | None      | 结果持久化选择，支持None，IoTDB，MySQL和CSV                  |
| RECORD_SPLIT          | 布尔     | true      | 是否将结果划分后输出到多个记录, IoTDB 暂时不支持             |
| RECORD_SPLIT_MAX_LINE | 整数     | 10000000  | 记录行数的上限（每个数据库表或CSV文件按照总行数为1千万切分存放） |
| TEST_DATA_STORE_IP    | 字符串   | 127.0.0.1 | 输出数据库的IP地址                                           |
| TEST_DATA_STORE_PORT  | 整数     | 6667      | 输出数据库的端口号                                           |
| TEST_DATA_STORE_DB    | 字符串   | result    | 输出数据库的名称                                             |
| TEST_DATA_STORE_USER  | 字符串   | root      | 输出数据库的用户名                                           |
| TEST_DATA_STORE_PW    | 字符串   | root      | 输出数据库的用户密码                                         |

- 如果我们设置“`TEST_DATA_PERSISTENCE=CSV`”，测试执行时和执行完毕后我们可以在IoT-benchmark根目录下看到新生成的`data`文件夹，其下包含`csv`文件夹记录测试过程；`csvOutput`文件夹记录测试结果。
- 如果我们设置“`TEST_DATA_PERSISTENCE=MySQL`”，它会在测试开始前在指定的MySQL数据库中创建命名如“testWithDefaultPath_被测数据库名称_备注_测试启动时间”的数据表记录测试过程；会在名为“CONFIG”的数据表（如果不存在则创建该表），写入本次测试的配置信息；当测试完成时会在名为“FINAL_RESULT”的数据表（如果不存在则创建该表）中写入本次测试结果。

### 自动化脚本

#### 一键化启动脚本

您可以通过`cli-benchmark.sh`脚本一键化启动IoTDB、监控的IoTDB Benchmark和测试的IoTDB Benchmark，但需要注意该脚本启动时会清理IoTDB中的**所有数据**，请谨慎使用。

首先，您需要修改`cli-benchmark.sh`中的`IOTDB_HOME`参数为您本地的IoTDB所在的文件夹。

然后您可以使用脚本启动测试

```Bash
> ./cli-benchmark.sh
```

测试完成后您可以在`logs`文件夹中查看测试相关日志，在`server-logs`文件夹中查看监控相关日志。

#### 自动执行多项测试

通常，除非与其他测试结果进行比较，否则单个测试是没有意义的。因此，我们提供了一个接口来通过一次启动执行多个测试。

- 配置 routine

这个文件的每一行应该是每个测试过程会改变的参数（否则就变成复制测试）。例如，"例程"文件是：

```Plain
LOOP=10 DEVICE_NUMBER=100 TEST
LOOP=20 DEVICE_NUMBER=50 TEST
LOOP=50 DEVICE_NUMBER=20 TEST
```

然后依次执行3个LOOP参数分别为10、20、50的测试过程。

> 注意：
>
> 您可以使用“LOOP=20 DEVICE_NUMBER=10 TEST”等格式更改每个测试中的多个参数，不允许使用不必要的空间。 关键字"TEST"意味着新的测试开始。如果您更改不同的参数，更改后的参数将保留在下一次测试中。

- 开始测试

配置文件routine后，您可以通过启动脚本启动多测试任务：

```Bash
> ./rep-benchmark.sh
```

然后测试信息将显示在终端中。

> 注意：
>
> 如果您关闭终端或失去与客户端机器的连接，测试过程将终止。 如果输出传输到终端，则与任何其他情况相同。

使用此接口通常需要很长时间，您可能希望将测试过程作为守护程序执行。这样，您可以通过启动脚本将测试任务作为守护程序启动：

```Bash
> ./rep-benchmark.sh > /dev/null 2>&1 &
```

在这种情况下，如果您想知道发生了什么，可以通过以下命令查看日志信息：

```Bash
> cd ./logs
> tail -f log_info.log
```

## 测试示例

以IoTDB 2.0为例，使用IoT-Benchemark测试表模型写入及查询，修改IoT-Benchemark配置文件如下：

```Properties
----------------------Main Configurations----------------------
BENCHMARK_WORK_MODE=testWithDefaultPath
IoTDB_DIALECT_MODE=TABLE
DB_SWITCH=IoTDB-200-SESSION_BY_TABLET
GROUP_NUMBER=1
IoTDB_TABLE_NUMBER=1
DEVICE_NUMBER=60
REAL_INSERT_RATE=1.0
SENSOR_NUMBER=10
OPERATION_PROPORTION=1:0:0:0:0:0:0:0:0:0:0:0
SCHEMA_CLIENT_NUMBER=10
DATA_CLIENT_NUMBER=10
LOOP=10
BATCH_SIZE_PER_WRITE=10
DEVICE_NUM_PER_WRITE=1
START_TIME=2025-01-01T00:00:00+08:00
POINT_STEP=1000
INSERT_DATATYPE_PROPORTION=1:1:1:1:1:1:0:0:0:0
VECTOR=true
```

在被测数据库正常运行下，启动IoT-Benchmark服务，等待执行结束后，可查看打印结果如下：

```Shell
Create schema cost 0.88 second
Test elapsed time (not include schema creation): 4.60 second
----------------------------------------------------------Result Matrix----------------------------------------------------------
Operation                okOperation              okPoint                  failOperation            failPoint                throughput(point/s)      
INGESTION                600                      60000                    0                        0                        13054.42                 
PRECISE_POINT            0                        0                        0                        0                        0.00                     
TIME_RANGE               0                        0                        0                        0                        0.00                     
VALUE_RANGE              0                        0                        0                        0                        0.00                     
AGG_RANGE                0                        0                        0                        0                        0.00                     
AGG_VALUE                0                        0                        0                        0                        0.00                     
AGG_RANGE_VALUE          0                        0                        0                        0                        0.00                     
GROUP_BY                 0                        0                        0                        0                        0.00                     
LATEST_POINT             0                        0                        0                        0                        0.00                     
RANGE_QUERY_DESC         0                        0                        0                        0                        0.00                     
VALUE_RANGE_QUERY_DESC   0                        0                        0                        0                        0.00                     
GROUP_BY_DESC            0                        0                        0                        0                        0.00                     
---------------------------------------------------------------------------------------------------------------------------------

--------------------------------------------------------------------------Latency (ms) Matrix--------------------------------------------------------------------------
Operation                AVG         MIN         P10         P25         MEDIAN      P75         P90         P95         P99         P999        MAX         SLOWEST_THREAD
INGESTION                41.77       0.95        1.41        2.27        6.76        24.14       63.42       127.18      1260.92     1265.72     1265.49     2581.91     
PRECISE_POINT            0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        
TIME_RANGE               0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        
VALUE_RANGE              0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        
AGG_RANGE                0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        
AGG_VALUE                0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        
AGG_RANGE_VALUE          0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        
GROUP_BY                 0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        
LATEST_POINT             0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        
RANGE_QUERY_DESC         0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        
VALUE_RANGE_QUERY_DESC   0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        
GROUP_BY_DESC            0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        0.00        
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
```