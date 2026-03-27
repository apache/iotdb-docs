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

# Apache SeaTunnel

## 1. 概述

SeaTunnel 是一款专为海量数据设计的分布式集成平台，凭借其高性能与弹性扩展能力，通过标准化的 Connector 连接器（由 Source 和 Sink 构成）打通多源异构数据链路。平台将各类数据源通过 Source 统一抽象为 SeaTunnelRow 格式，经动态资源调度与批量处理优化后，由 Sink 高效写入不同存储系统。通过 IoTDB Connector 与 SeaTunnel 的深度集成，不仅解决了时序数据场景下的 高吞吐写入、多源治理、复杂分析 等核心挑战，更通过开箱即用的连接器生态和自动化运维能力，帮助企业在物联网、工业互联网等领域快速构建 低成本、高可靠、易扩展 的数据基础设施。

## 2. 使用步骤

### 2.1 环境准备

#### 2.1.1 软件要求

| 软件      | 版本       | 安装参考                                          |
| ----------- | ---------- |-----------------------------------------------|
| IoTDB     | >= 2.0.5 | [快速入手](../QuickStart/QuickStart_apache.md)    |
| SeaTunnel | 2.3.12   | [官方网站](https://seatunnel.apache.org/download) |

* Thrift 版本冲突解决（仅 Spark 引擎需处理）：

```Bash
# 移除 Spark 中的旧版 Thrift
rm -f $SPARK_HOME/jars/libthrift*
# 复制 IoTDB 的 Thrift 库到 Sparkcp 
$IOTDB_HOME/lib/libthrift* $SPARK_HOME/jars/
```

#### 2.1.2 依赖配置

1. JDBC

* Spark/Flink 引擎：将 [JDBC 驱动 Jar 包](https://mvnrepository.com/artifact/org.apache.iotdb/iotdb-jdbc) 放入 `${SEATUNNEL_HOME}/plugins/` 目录
* SeaTunnel Zeta 引擎：将 [JDBC 驱动 Jar 包](https://mvnrepository.com/artifact/org.apache.iotdb/iotdb-jdbc) 放入 `${SEATUNNEL_HOME}/lib/` 目录

2. Connector

将对应版本的 [seaTunnel Connector](https://mvnrepository.com/artifact/org.apache.seatunnel/connector-iotdb) 放入 `${SEATUNNEL_HOME}/plugins/` 目录

### 2.2 读取数据 （IoTDB Source Connector）

#### 2.2.1 配置参数

| **参数名**                 | **类型** | **必填** | **默认值** | **描述**                                                                   |
| ---------------------------------- | ---------------- | ---------------- | ------------------ |--------------------------------------------------------------------------|
| `node_urls`                  | string         | 是             | -                | IoTDB 集群地址，格式：`"host1:port"`或`"host1:port,host2:port"`                   |
| `username`                   | string         | 是             | -                | IoTDB 用户名                                                                |
| `password`                   | string         | 是             | -                | IoTDB 密码                                                                 |
| `sql_dialect`                | string         | 否             | tree             | IoTDB 模型，tree：树模型；table：表模型                                              |
| `sql`                        | string         | 是             | -                | 要执行的 SQL 查询语句                                                            |
| `database`                   | string         | 否             | -                | 数据库名，只在表模型中生效                                                            |
| `schema`                     | config         | 是             | -                | 数据模式定义                                                                   |
| `fetch_size`                 | int            | 否             | -                | 单次获取数据量：查询时每次从 IoTDB 获取的数据量                                              |
| `lower_bound`| long           | 否             | -                | 时间范围下界（通过时间列进行数据分片时使用）                                                   |
| `upper_bound`                | long           | 否             | -                | 时间范围上界（通过时间列进行数据分片时使用）                                                   |
| `num_partitions`| int            | 否             | -                | 分区数量（通过时间列进行数据分片时使用）：<br> 1个分区：使用完整时间范围 <br> 若分区数 < (上界-下界)，则使用差值作为实际分区数 |
| `thrift_default_buffer_size` | int            | 否             | -                | Thrift 协议缓冲区大小                                                           |
| `thrift_max_frame_size`      | int            | 否             | -                | Thrift 最大帧尺寸                                                             |
| `enable_cache_leader`        | boolean        | 否             | -                | 是否启用 Leader 节点缓存                                                         |
| `version`                    | string         | 否             | -                | 客户端 SQL 语义版本`（V_0_12/V_0_13）`                                            |

#### 2.2.2 配置示例

1. 在 `${SEATUNNEL_HOME}/`​`config/` 目录下新建` iotdb_source_example.conf`

```SQL
env { 
    parallelism = 2       # 并行度为2
    job.mode = "BATCH"   # 批处理模式
}

source {
    IoTDB {
        node_urls = "localhost:6667"
        username = "root"
        password = "root"
        sql_dialect = "table"
        sql = "SELECT time,device_id,city,s1,s2,s3,s4 FROM tcollector.table1"
        schema {
            fields {
                time = timestamp
                device_id = string
                city= string
                s1= int
                s2= bigint
                s3= float
                s4= double
            }
        }
    }
}

sink {
    Console {
    }  # 输出到控制台
}
```

2. 执行如下命令运行 seaTunnel

```Bash
./bin/seatunnel.sh --config config/iotdb_source_example.conf -e local
```

3. 更多详情请参考 Apache SeanTunnel 官网 [IoTDB Source Connector](https://seatunnel.incubator.apache.org/zh-CN/docs/2.3.12/connector-v2/source/IoTDB) 相关介绍

### 2.3 写入数据（IoTDB Sink Connector）

#### 2.3.1 配置参数

| **名称**                        | **类型**  | **是否必传​** | **默认值**          | **描述**                                                                                                                                                                                                                                                                                                                                    |
|-------------------------------|---------| ---------------------- |------------------| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node_urls`                   | Array   | 是                   | -                | `IoTDB`集群地址，格式为` ["host1:port"]`或`["host1:port","host2:port"]`                                                                                                                                                                                                                                                               |
| `username`                    | String  | 是                   | -                | `IoTDB`用户的用户名                                                                                                                                                                                                                                                                                                                           |
| `password`                    | String  | 是                   | -                | `IoTDB`用户的密码                                                                                                                                                                                                                                                                                                                             |
| `sql_dialect`                 | String  | 否                   | tree             | `IoTDB`模型，tree：树模型；table：表模型                                                                                                                                                                                                                                                                                                      |
| `storage_group`               | String  | 是                   | -                | `IoTDB`树模型：指定设备存储组（路径前缀） 例: deviceId = \${storage\_group} + "." + \${key\_device} ；`IoTDB`表模型：指定数据库                                                                                                                                                                                                           |
| `key_device`                  | String  | 是                   | -                | `IoTDB`树模型：在 SeaTunnelRow 中指定`IoTDB`设备 ID 的字段名；`IoTDB`表模型：在 SeaTunnelRow 中指定`IoTDB`表名的字段名                                                                                                                                                                                                            |
| `key_timestamp`               | String  | 否                   | processing time  | `IoTDB`树模型：在 SeaTunnelRow 中指定`IoTDB`时间戳的字段名（如未指定，则使用处理时间作为时间戳）；`IoTDB`表模型：在 SeaTunnelRow 中指定 IoTDB 时间列的字段名（如未指定，则使用处理时间作为时间戳）                                                                                                                                    |
| `key_measurement_fields`      | Array   | 否                   | 见描述              | `IoTDB`树模型：在 SeaTunnelRow 中指定`IoTDB`测量列表的字段名（如未指定，则包括排除`key_device`&`key_timestamp`后的其余字段）；`IoTDB`表模型：在 SeaTunnelRow 中指定`IoTDB`测点列（FIELD）的字段名（如未指定，则包括排除`key_device`&`key_timestamp`&`key_tag_fields`&`key_attribute_fields`后的其余字段） |
| `key_tag_fields`              | Array   | 否                   | -                | `IoTDB`树模型：不生效；`IoTDB`表模型：在 SeaTunnelRow 中指定`IoTDB`标签列（TAG）的字段名                                                                                                                                                                                                                                              |
| `key_attribute_fields`        | Array   | 否                   | -                | `IoTDB`树模型：不生效；`IoTDB`表模型：在 SeaTunnelRow 中指定`IoTDB`属性列（ATTRIBUTE）的字段名                                                                                                                                                                                                                                        |
| `batch_size`                  | Integer | 否                   | 1024             | 对于批写入，当缓冲区的数量达到`batch_size`的数量或时间达到`batch_interval_ms`时，数据将被刷新到IoTDB中                                                                                                                                                                                                                                    |
| `max_retries`                 | Integer | 否                   | -                | 刷新的重试次数 failed                                                                                                                                                                                                                                                                                                                             |
| `retry_backoff_multiplier_ms` | Integer | 否                   | -                | 用作生成下一个退避延迟的乘数                                                                                                                                                                                                                                                                                                                      |
| `max_retry_backoff_ms`        | Integer | 否                   | -                | 尝试重试对`IoTDB`的请求之前等待的时间量                                                                                                                                                                                                                                                                                                       |
| `default_thrift_buffer_size`  | Integer | 否                   | -                | 在`IoTDB`客户端中节省初始化缓冲区大小                                                                                                                                                                                                                                                                                                         |
| `max_thrift_frame_size`       | Integer | 否                   | -                | 在`IoTDB`客户端中节约最大帧大小                                                                                                                                                                                                                                                                                                               |
| `zone_id`                     | string  | 否                   | -                | `IoTDB`java.time.ZoneId client                                                                                                                                                                                                                                                                                                                |
| `enable_rpc_compression`      | Boolean | 否                   | -                | 在`IoTDB`客户端中启用rpc压缩                                                                                                                                                                                                                                                                                                                  |
| `connection_timeout_in_ms`    | Integer | 否                   | -                | 连接到`IoTDB`时等待的最长时间（毫秒）                                                                                                                                                                                                                                                                                                         |

#### 2.3.2 配置示例

1. 在 `${SEATUNNEL_HOME}/`​`config/` 目录下新建` iotdb_sink_example.conf`

```Bash
# 定义运行时环境
env {
  parallelism = 4
  job.mode = "BATCH"
}
source{
    Jdbc {
        url = "jdbc:mysql://localhost:3306/demo_db?useUnicode=true&characterEncoding=UTF-8&rewriteBatchedStatements=true"
        driver = "com.mysql.cj.jdbc.Driver"
        connection_check_timeout_sec = 100
        user = "root"
        password = "IoTDB@2024"
        query = "select * from device"
    }
}
sink {
    IoTDB {
        node_urls = ["localhost:6667"]
        username = "root"
        password = "root"
        sql_dialect = "table"
        storage_group = "seatunnel"
        key_device = "id"
        key_timestamp = "intime" 
    }
}
```

2. 执行如下命令运行 seaTunnel

```Bash
./bin/seatunnel.sh --config config/iotdb_sink_example.conf -e local
```

3. 更多配置参数及示例请参考 Apache SeanTunnel 官网 [IoTDB Sink Connector](https://seatunnel.incubator.apache.org/zh-CN/docs/2.3.12/connector-v2/sink/IoTDB) 相关介绍


