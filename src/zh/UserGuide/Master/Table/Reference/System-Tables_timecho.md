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

# 系统表

IoTDB 内置系统数据库 `INFORMATION_SCHEMA`，其中包含一系列系统表，用于存储 IoTDB 运行时信息（如当前正在执行的 SQL 语句等）。目前`INFORMATION_SCHEMA`数据库只支持读操作。

> 💡 **【V2.0.8 版本更新】**<br>
> 👉 新增四张系统表：**[CONNECTIONS](../Reference/System-Tables_timecho.md#_2-18-connections-表)**（实时连接追踪）、**[CURRENT\_QUERIES](#_2-19-current-queries-表)**（活跃查询监控）、**[QUERIES\_COSTS\_HISTOGRAM](#_2-20-queries-costs-histogram-表)**（查询耗时分布）、**[SERVICES](#_2-21-services-表)**（服务状态管理），助力集群运维与性能分析。

## 1. 系统库

* 名称：`INFORMATION_SCHEMA`
* 指令：只读，只支持 `Show databases (DETAILS) `​`/ Show Tables (DETAILS) / Use`，其余操作将会报错：`"The database 'information_schema' can only be queried"`
* 属性：`TTL=INF`，其余属性默认为`null`
* SQL示例：

```sql
IoTDB> show databases
+------------------+-------+-----------------------+---------------------+---------------------+
|          Database|TTL(ms)|SchemaReplicationFactor|DataReplicationFactor|TimePartitionInterval|
+------------------+-------+-----------------------+---------------------+---------------------+
|information_schema|    INF|                   null|                 null|                 null|
+------------------+-------+-----------------------+---------------------+---------------------+

IoTDB> show tables from information_schema
+-----------------------+-------+
|              TableName|TTL(ms)|
+-----------------------+-------+
|                columns|    INF|
|           config_nodes|    INF|
|         configurations|    INF|
|            connections|    INF|
|        current_queries|    INF|
|             data_nodes|    INF|
|              databases|    INF|
|              functions|    INF|
|               keywords|    INF|
|                  nodes|    INF|
|           pipe_plugins|    INF|
|                  pipes|    INF|
|                queries|    INF|
|queries_costs_histogram|    INF|
|                regions|    INF|
|               services|    INF|
|          subscriptions|    INF|
|                 tables|    INF|
|                 topics|    INF|
|                  views|    INF|
+-----------------------+-------+
```

## 2. 系统表

* 名称：`DATABASES`, `TABLES`, `REGIONS`, `QUERIES`, `COLUMNS`, `PIPES`, `PIPE_PLUGINS`, `SUBSCRIPTION`, `TOPICS`, `VIEWS`, `MODELS`, `FUNCTIONS`, `CONFIGURATIONS`, `KEYWORDS`, `NODES`, `CONFIG_NODES`, `DATA_NODES`, `CONNECTIONS`, `CURRENT_QUERIES`, `QUERIES_COSTS_HISTOGRAM`、`SERVICES`（详细介绍见后面小节）
* 操作：只读，只支持`SELECT`, `COUNT/SHOW DEVICES`, `DESC`，不支持对于表结构 / 内容的任意修改，如果修改将会报错：`"The database 'information_schema' can only be queried"`
* 列名：系统表的列名均默认为小写，且用`_`分隔

### 2.1 DATABASES 表

* 包含集群中所有数据库的信息
* 表结构如下表所示：

| 列名                        | 数据类型 | 列类型    | 说明           |
| ----------------------------- | ---------- | ----------- | ---------------- |
| database                    | STRING   | TAG       | 数据库名称     |
| ttl(ms)                     | STRING   | ATTRIBUTE | 数据保留时间   |
| schema\_replication\_factor | INT32    | ATTRIBUTE | 元数据副本数   |
| data\_replication\_factor   | INT32    | ATTRIBUTE | 数据副本数     |
| time\_partition\_interval   | INT64    | ATTRIBUTE | 时间分区间隔   |
| schema\_region\_group\_num  | INT32    | ATTRIBUTE | 元数据分区数量 |
| data\_region\_group\_num    | INT32    | ATTRIBUTE | 数据分区数量   |

* 查询结果只展示自身对该数据库本身或库中任意表有任意权限的数据库集合
* 查询示例：

```sql
IoTDB> select * from information_schema.databases
+------------------+-------+-------------------------+-----------------------+-----------------------+-----------------------+---------------------+
|          database|ttl(ms)|schema_replication_factor|data_replication_factor|time_partition_interval|schema_region_group_num|data_region_group_num|
+------------------+-------+-------------------------+-----------------------+-----------------------+-----------------------+---------------------+
|information_schema|    INF|                     null|                   null|                   null|                   null|                 null|
|         database1|    INF|                        1|                      1|              604800000|                      0|                    0|
+------------------+-------+-------------------------+-----------------------+-----------------------+-----------------------+---------------------+
```

### 2.2 TABLES 表

* 包含集群中所有表的信息
* 表结构如下表所示：

| 列名        | 数据类型 | 列类型    | 说明         |
| ------------- | ---------- | ----------- | -------------- |
| database    | STRING   | TAG       | 数据库名称   |
| table\_name | STRING   | TAG       | 表名称       |
| ttl(ms)     | STRING   | ATTRIBUTE | 数据保留时间 |
| status      | STRING   | ATTRIBUTE | 状态         |
| comment     | STRING   | ATTRIBUTE | 注释         |

* 说明：status 可能为`USING`/`PRE_CREATE`/`PRE_DELETE`，具体见表管理中[查看表](../Basic-Concept/Table-Management_timecho.md#12-查看表)的相关描述
* 查询结果只展示自身有任意权限的表集合
* 查询示例：

```sql
IoTDB> select * from information_schema.tables
+------------------+--------------+-----------+------+-------+-----------+
|          database|    table_name|    ttl(ms)|status|comment| table_type|
+------------------+--------------+-----------+------+-------+-----------+
|information_schema|     databases|        INF| USING|   null|SYSTEM VIEW|
|information_schema|        models|        INF| USING|   null|SYSTEM VIEW|
|information_schema| subscriptions|        INF| USING|   null|SYSTEM VIEW|
|information_schema|       regions|        INF| USING|   null|SYSTEM VIEW|
|information_schema|     functions|        INF| USING|   null|SYSTEM VIEW|
|information_schema|      keywords|        INF| USING|   null|SYSTEM VIEW|
|information_schema|       columns|        INF| USING|   null|SYSTEM VIEW|
|information_schema|        topics|        INF| USING|   null|SYSTEM VIEW|
|information_schema|configurations|        INF| USING|   null|SYSTEM VIEW|
|information_schema|       queries|        INF| USING|   null|SYSTEM VIEW|
|information_schema|        tables|        INF| USING|   null|SYSTEM VIEW|
|information_schema|  pipe_plugins|        INF| USING|   null|SYSTEM VIEW|
|information_schema|         nodes|        INF| USING|   null|SYSTEM VIEW|
|information_schema|    data_nodes|        INF| USING|   null|SYSTEM VIEW|
|information_schema|         pipes|        INF| USING|   null|SYSTEM VIEW|
|information_schema|         views|        INF| USING|   null|SYSTEM VIEW|
|information_schema|  config_nodes|        INF| USING|   null|SYSTEM VIEW|
|         database1|        table1|31536000000| USING|   null| BASE TABLE|
+------------------+--------------+-----------+------+-------+-----------+
```

### 2.3 REGIONS 表

* 包含集群中所有`Region`的信息
* 表结构如下表所示：

| 列名                | 数据类型  | 列类型    | 说明                                                                                                      |
| --------------------- | ----------- | ----------- | ----------------------------------------------------------------------------------------------------------- |
| region\_id          | INT32     | TAG       | region ID                                                                                                 |
| datanode\_id        | INT32     | TAG       | dataNode ID                                                                                               |
| type                | STRING    | ATTRIBUTE | 类型（SchemaRegion / DataRegion）                                                                         |
| status              | STRING    | ATTRIBUTE | 状态（Running/Unknown 等）                                                                                |
| database            | STRING    | ATTRIBUTE | database 名字                                                                                             |
| series\_slot\_num   | INT32     | ATTRIBUTE | series slot 个数                                                                                          |
| time\_slot\_num     | INT64     | ATTRIBUTE | time slot 个数                                                                                            |
| rpc\_address        | STRING    | ATTRIBUTE | Rpc 地址                                                                                                  |
| rpc\_port           | INT32     | ATTRIBUTE | Rpc 端口                                                                                                  |
| internal\_address   | STRING    | ATTRIBUTE | 内部通讯地址                                                                                              |
| role                | STRING    | ATTRIBUTE | Leader / Follower                                                                                         |
| create\_time        | TIMESTAMP | ATTRIBUTE | 创建时间                                                                                                  |
| tsfile\_size\_bytes | INT64     | ATTRIBUTE | 可统计的 DataRegion：含有 TsFile 的总文件大小；不可统计的 DataRegion（Unknown）：-1；SchemaRegion：null； |

* 仅管理员可执行查询操作
* 查询示例：

```SQL
IoTDB> select * from information_schema.regions
+---------+-----------+------------+-------+---------+---------------+-------------+-----------+--------+----------------+------+-----------------------------+-----------------+
|region_id|datanode_id|        type| status| database|series_slot_num|time_slot_num|rpc_address|rpc_port|internal_address|  role|                  create_time|tsfile_size_bytes|
+---------+-----------+------------+-------+---------+---------------+-------------+-----------+--------+----------------+------+-----------------------------+-----------------+
|        0|          1|SchemaRegion|Running|database1|             12|            0|    0.0.0.0|    6667|       127.0.0.1|Leader|2025-03-31T11:19:08.485+08:00|             null|
|        1|          1|  DataRegion|Running|database1|              6|            6|    0.0.0.0|    6667|       127.0.0.1|Leader|2025-03-31T11:19:09.156+08:00|             3985|
|        2|          1|  DataRegion|Running|database1|              6|            6|    0.0.0.0|    6667|       127.0.0.1|Leader|2025-03-31T11:19:09.156+08:00|             3841|
+---------+-----------+------------+-------+---------+---------------+-------------+-----------+--------+----------------+------+-----------------------------+-----------------+
```

### 2.4 QUERIES 表

* 包含集群中所有正在执行的查询的信息。也可以使用 `SHOW QUERIES`语法去查询。
* 表结构如下表所示：

| 列名          | 数据类型  | 列类型    | 说明                                           |
| --------------- | ----------- | ----------- | ------------------------------------------------ |
| query\_id     | STRING    | TAG       | ID                                             |
| start\_time   | TIMESTAMP | ATTRIBUTE | 查询开始的时间戳，时间戳精度与系统精度保持一致 |
| datanode\_id  | INT32     | ATTRIBUTE | 发起查询的DataNode ID                          |
| elapsed\_time | FLOAT     | ATTRIBUTE | 查询执行耗时，单位是秒                         |
| statement     | STRING    | ATTRIBUTE | 查询sql                                        |
| user          | STRING    | ATTRIBUTE | 发起查询的用户                                 |

* 普通用户查询结果仅显示自身执行的查询；管理员显示全部。
* 查询示例：

```SQL
IoTDB> select * from information_schema.queries
+-----------------------+-----------------------------+-----------+------------+----------------------------------------+----+
|               query_id|                   start_time|datanode_id|elapsed_time|                               statement|user|
+-----------------------+-----------------------------+-----------+------------+----------------------------------------+----+
|20250331_023242_00011_1|2025-03-31T10:32:42.360+08:00|          1|       0.025|select * from information_schema.queries|root|
+-----------------------+-----------------------------+-----------+------------+----------------------------------------+----+
```

### 2.5 COLUMNS 表

* 包含集群中所有表中列的信息
* 表结构如下表所示：

| 列名         | 数据类型 | 列类型    | 说明         |
| -------------- | ---------- | ----------- | -------------- |
| database     | STRING   | TAG       | 数据库名称   |
| table\_name  | STRING   | TAG       | 表名称       |
| column\_name | STRING   | TAG       | 列名称       |
| datatype     | STRING   | ATTRIBUTE | 列的数值类型 |
| category     | STRING   | ATTRIBUTE | 列类型       |
| status       | STRING   | ATTRIBUTE | 列状态       |
| comment      | STRING   | ATTRIBUTE | 列注释       |

说明：
* status 可能为`USING`/`PRE_DELETE`，具体见表管理中[查看表的列](../Basic-Concept/Table-Management_timecho.md#13-查看表的列)的相关描述
* 查询结果只展示自身有任意权限的表的列信息
* 查询示例：

```SQL
IoTDB> select * from information_schema.columns where database = 'database1'
+---------+----------+------------+---------+---------+------+-------+
| database|table_name| column_name| datatype| category|status|comment|
+---------+----------+------------+---------+---------+------+-------+
|database1|    table1|        time|TIMESTAMP|     TIME| USING|   null|
|database1|    table1|      region|   STRING|      TAG| USING|   null|
|database1|    table1|    plant_id|   STRING|      TAG| USING|   null|
|database1|    table1|   device_id|   STRING|      TAG| USING|   null|
|database1|    table1|    model_id|   STRING|ATTRIBUTE| USING|   null|
|database1|    table1| maintenance|   STRING|ATTRIBUTE| USING|   null|
|database1|    table1| temperature|    FLOAT|    FIELD| USING|   null|
|database1|    table1|    humidity|    FLOAT|    FIELD| USING|   null|
|database1|    table1|      status|  BOOLEAN|    FIELD| USING|   null|
|database1|    table1|arrival_time|TIMESTAMP|    FIELD| USING|   null|
+---------+----------+------------+---------+---------+------+-------+
```

### 2.6 PIPES 表

* 包含集群中所有 PIPE 的信息
* 表结构如下表所示：

| 列名                          | 数据类型  | 列类型    | 说明                                  |
| ------------------------------- | ----------- | ----------- | --------------------------------------- |
| id                            | STRING    | TAG       | Pipe 名称                             |
| creation\_time                | TIMESTAMP | ATTRIBUTE | 创建时间                              |
| state                         | STRING    | ATTRIBUTE | Pipe 状态（RUNNING/STOPPED）          |
| pipe\_source                  | STRING    | ATTRIBUTE | source 插件参数                       |
| pipe\_processor               | STRING    | ATTRIBUTE | processor 插件参数                    |
| pipe\_sink                    | STRING    | ATTRIBUTE | source 插件参数                       |
| exception\_message            | STRING    | ATTRIBUTE | Exception 信息                        |
| remaining\_event\_count       | INT64     | ATTRIBUTE | 剩余 event 数量，如果 Unknown 则为 -1 |
| estimated\_remaining\_seconds | DOUBLE    | ATTRIBUTE | 预估剩余时间，如果 Unknown 则为 -1    |

* 仅管理员可执行操作
* 查询示例：

```SQL
select * from information_schema.pipes
+----------+-----------------------------+-------+--------------------------------------------------------------------------+--------------+-----------------------------------------------------------------------+-----------------+---------------------+---------------------------+
|        id|                creation_time|  state|                                                               pipe_source|pipe_processor|                                                              pipe_sink|exception_message|remaining_event_count|estimated_remaining_seconds|
+----------+-----------------------------+-------+--------------------------------------------------------------------------+--------------+-----------------------------------------------------------------------+-----------------+---------------------+---------------------------+
|tablepipe1|2025-03-31T12:25:24.040+08:00|RUNNING|{__system.sql-dialect=table, source.password=******, source.username=root}|            {}|{format=hybrid, node-urls=192.168.xxx.xxx:6667, sink=iotdb-thrift-sink}|                 |                    0|                        0.0|
+----------+-----------------------------+-------+--------------------------------------------------------------------------+--------------+-----------------------------------------------------------------------+-----------------+---------------------+---------------------------+
```

### 2.7 PIPE\_PLUGINS 表

* 包含集群中所有PIPE插件的信息
* 表结构如下表所示：

| 列名         | 数据类型 | 列类型    | 说明                                          |
| -------------- | ---------- | ----------- | ----------------------------------------------- |
| plugin\_name | STRING   | TAG       | 插件名称                                      |
| plugin\_type | STRING   | ATTRIBUTE | 插件类型（Builtin/External）                  |
| class\_name  | STRING   | ATTRIBUTE | 插件的主类名                                  |
| plugin\_jar  | STRING   | ATTRIBUTE | 插件的 jar 包名称，若为 builtin 类型则为 null |

* 查询示例：

```SQL
IoTDB> select * from information_schema.pipe_plugins
+---------------------+-----------+-------------------------------------------------------------------------------------------------+----------+
|          plugin_name|plugin_type|                                                                                       class_name|plugin_jar|
+---------------------+-----------+-------------------------------------------------------------------------------------------------+----------+
|IOTDB-THRIFT-SSL-SINK|    Builtin|org.apache.iotdb.commons.pipe.agent.plugin.builtin.connector.iotdb.thrift.IoTDBThriftSslConnector|      null|
|   IOTDB-AIR-GAP-SINK|    Builtin|   org.apache.iotdb.commons.pipe.agent.plugin.builtin.connector.iotdb.airgap.IoTDBAirGapConnector|      null|
|      DO-NOTHING-SINK|    Builtin|        org.apache.iotdb.commons.pipe.agent.plugin.builtin.connector.donothing.DoNothingConnector|      null|
| DO-NOTHING-PROCESSOR|    Builtin|        org.apache.iotdb.commons.pipe.agent.plugin.builtin.processor.donothing.DoNothingProcessor|      null|
|    IOTDB-THRIFT-SINK|    Builtin|   org.apache.iotdb.commons.pipe.agent.plugin.builtin.connector.iotdb.thrift.IoTDBThriftConnector|      null|
|         IOTDB-SOURCE|    Builtin|                org.apache.iotdb.commons.pipe.agent.plugin.builtin.extractor.iotdb.IoTDBExtractor|      null|
+---------------------+-----------+-------------------------------------------------------------------------------------------------+----------+
```

### 2.8 SUBSCRIPTIONS 表

* 包含集群中所有数据订阅的信息
* 表结构如下表所示：

| 列名                  | 数据类型 | 列类型    | 说明         |
| ----------------------- | ---------- | ----------- | -------------- |
| topic\_name           | STRING   | TAG       | 订阅主题名称 |
| consumer\_group\_name | STRING   | TAG       | 消费者组名称 |
| subscribed\_consumers | STRING   | ATTRIBUTE | 订阅的消费者 |

* 仅管理员可执行操作
* 查询示例：

```SQL
IoTDB> select * from information_schema.subscriptions where topic_name = 'topic_1'
+----------+-------------------+--------------------------------+
|topic_name|consumer_group_name|            subscribed_consumers|
+----------+-------------------+--------------------------------+
|   topic_1|                cg1|[c3, c4, c5, c6, c7, c0, c1, c2]|
+----------+-------------------+--------------------------------+
```

### 2.9 TOPICS 表

* 包含集群中所有数据订阅主题的信息
* 表结构如下表所示：

| 列名           | 数据类型 | 列类型    | 说明         |
| ---------------- | ---------- | ----------- | -------------- |
| topic\_name    | STRING   | TAG       | 订阅主题名称 |
| topic\_configs | STRING   | ATTRIBUTE | 订阅主题配置 |

* 仅管理员可执行操作
* 查询示例：

```SQL
IoTDB> select * from information_schema.topics
+----------+----------------------------------------------------------------+
|topic_name|                                                   topic_configs|
+----------+----------------------------------------------------------------+
|     topic|{__system.sql-dialect=table, start-time=2025-01-10T17:05:38.282}|
+----------+----------------------------------------------------------------+
```

### 2.10 VIEWS 表

> 该系统表从 V 2.0.5 版本开始提供

* 包含数据库内所有的表视图信息
* 表结构如下表所示：

| 列名             | 数据类型 | 列类型    | 说明           |
| ------------------ | ---------- | ----------- | ---------------- |
| database         | STRING   | TAG       | 数据库名称     |
| table\_name      | STRING   | TAG       | 视图名称       |
| view\_definition | STRING   | ATTRIBUTE | 视图的创建语句 |

* 查询结果只展示自身有任意权限的视图集合
* 查询示例：

```SQL
IoTDB> select * from information_schema.views
+---------+----------+---------------------------------------------------------------------------------------------------------------------------------------+
| database|table_name|                                                                                                                        view_definition|
+---------+----------+---------------------------------------------------------------------------------------------------------------------------------------+
|database1|        ln|CREATE VIEW "ln" ("device" STRING TAG,"model" STRING TAG,"status" BOOLEAN FIELD,"hardware" STRING FIELD) WITH (ttl='INF') AS root.ln.**|
+---------+----------+---------------------------------------------------------------------------------------------------------------------------------------
```

### 2.11 MODELS 表

> 该系统表从 V 2.0.5 版本开始提供，从V 2.0.8 版本开始不再提供

* 包含数据库内所有的模型信息
* 表结构如下表所示：

| 列名        | 数据类型 | 列类型    | 说明                                                                  |
| ------------- | ---------- | ----------- | ----------------------------------------------------------------------- |
| model\_id   | STRING   | TAG       | 模型名称                                                              |
| model\_type | STRING   | ATTRIBUTE | 模型类型（预测，异常检测，自定义）                                    |
| state       | STRING   | ATTRIBUTE | 模型状态（是否可用）                                                  |
| configs     | STRING   | ATTRIBUTE | 模型的超参数的 string 格式，与正常的 show 相同                        |
| notes       | STRING   | ATTRIBUTE | 模型注释* 内置 model：Built-in model in IoTDB* 用户的 model：自定义 |

* 查询示例：

```SQL
-- 找到类型为内置预测的所有模型
IoTDB> select * from information_schema.models where model_type = 'BUILT_IN_FORECAST'
+---------------------+-----------------+------+-------+-----------------------+
|             model_id|       model_type| state|configs|                  notes|
+---------------------+-----------------+------+-------+-----------------------+
|       _STLForecaster|BUILT_IN_FORECAST|ACTIVE|   null|Built-in model in IoTDB|
|     _NaiveForecaster|BUILT_IN_FORECAST|ACTIVE|   null|Built-in model in IoTDB|
|               _ARIMA|BUILT_IN_FORECAST|ACTIVE|   null|Built-in model in IoTDB|
|_ExponentialSmoothing|BUILT_IN_FORECAST|ACTIVE|   null|Built-in model in IoTDB|
|         _HoltWinters|BUILT_IN_FORECAST|ACTIVE|   null|Built-in model in IoTDB|
|             _sundial|BUILT_IN_FORECAST|ACTIVE|   null|Built-in model in IoTDB|
+---------------------+-----------------+------+-------+-----------------------+
```

### 2.12 FUNCTIONS 表

> 该系统表从 V 2.0.5 版本开始提供

* 包含数据库内所有的函数信息
* 表结构如下表所示：

| 列名             | 数据类型 | 列类型    | 说明                                    |
| ------------------ | ---------- | ----------- | ----------------------------------------- |
| function\_name   | STRING   | TAG       | 函数名称                                |
| function\_type   | STRING   | ATTRIBUTE | 函数类型（内/外置数值/聚合/表函数）     |
| class\_name(udf) | STRING   | ATTRIBUTE | 如为 UDF，则为类名，否则为 null（暂定） |
| state            | STRING   | ATTRIBUTE | 是否可用                                |

* 查询示例：

```SQL
IoTDB> select * from information_schema.functions where function_type='built-in table function'
+--------------+-----------------------+---------------+---------+
|function_table|          function_type|class_name(udf)|    state|
+--------------+-----------------------+---------------+---------+
|      CUMULATE|built-in table function|           null|AVAILABLE|
|       SESSION|built-in table function|           null|AVAILABLE|
|           HOP|built-in table function|           null|AVAILABLE|
|        TUMBLE|built-in table function|           null|AVAILABLE|
|      FORECAST|built-in table function|           null|AVAILABLE|
|     VARIATION|built-in table function|           null|AVAILABLE|
|      CAPACITY|built-in table function|           null|AVAILABLE|
+--------------+-----------------------+---------------+---------+
```

### 2.13 CONFIGURATIONS表

> 该系统表从 V 2.0.5 版本开始提供

* 包含数据库内所有的属性信息
* 表结构如下表所示：

| 列名     | 数据类型 | 列类型    | 说明   |
| ---------- | ---------- | ----------- | -------- |
| variable | STRING   | TAG       | 属性名 |
| value    | STRING   | ATTRIBUTE | 属性值 |

* 仅管理员可执行操作
* 查询示例：

```SQL
IoTDB> select * from information_schema.configurations
+----------------------------------+-----------------------------------------------------------------+
|                          variable|                                                            value|
+----------------------------------+-----------------------------------------------------------------+
|                       ClusterName|                                                   defaultCluster|
|             DataReplicationFactor|                                                                1|
|           SchemaReplicationFactor|                                                                1|
|  DataRegionConsensusProtocolClass|                      org.apache.iotdb.consensus.iot.IoTConsensus|
|SchemaRegionConsensusProtocolClass|                  org.apache.iotdb.consensus.ratis.RatisConsensus|
|  ConfigNodeConsensusProtocolClass|                  org.apache.iotdb.consensus.ratis.RatisConsensus|
|               TimePartitionOrigin|                                                                0|
|             TimePartitionInterval|                                                        604800000|
|              ReadConsistencyLevel|                                                           strong|
|           SchemaRegionPerDataNode|                                                                1|
|             DataRegionPerDataNode|                                                                0|
|                     SeriesSlotNum|                                                             1000|
|           SeriesSlotExecutorClass|org.apache.iotdb.commons.partition.executor.hash.BKDRHashExecutor|
|         DiskSpaceWarningThreshold|                                                             0.05|
|                TimestampPrecision|                                                               ms|
+----------------------------------+-----------------------------------------------------------------+
```

### 2.14 KEYWORDS 表

> 该系统表从 V 2.0.5 版本开始提供

* 包含数据库内所有的关键字信息
* 表结构如下表所示：

| 列名     | 数据类型 | 列类型    | 说明                           |
| ---------- | ---------- | ----------- | -------------------------------- |
| word     | STRING   | TAG       | 关键字                         |
| reserved | INT32    | ATTRIBUTE | 是否为保留字，1表示是，0表示否 |

* 查询示例：

```SQL
IoTDB> select * from information_schema.keywords limit 10
+----------+--------+
|      word|reserved|
+----------+--------+
|    ABSENT|       0|
|ACTIVATION|       1|
|  ACTIVATE|       1|
|       ADD|       0|
|     ADMIN|       0|
|     AFTER|       0|
|   AINODES|       1|
|       ALL|       0|
|     ALTER|       1|
|   ANALYZE|       0|
+----------+--------+
```

### 2.15 NODES 表

> 该系统表从 V 2.0.5 版本开始提供

* 包含数据库内所有的节点信息
* 表结构如下表所示：

| 列名                         | 数据类型 | 列类型    | 说明          |
| ------------------------------ | ---------- | ----------- | --------------- |
| node\_id                     | INT32    | TAG       | 节点 ID       |
| node\_type                   | STRING   | ATTRIBUTE | 节点类型      |
| status                       | STRING   | ATTRIBUTE | 节点状态      |
| internal\_address            | STRING   | ATTRIBUTE | 内部 rpc 地址 |
| internal\_port               | INT32    | ATTRIBUTE | 内部端口      |
| version                      | STRING   | ATTRIBUTE | 版本号        |
| build\_info                  | STRING   | ATTRIBUTE | CommitID      |
| activate\_status（仅企业版） | STRING   | ATTRIBUTE | 激活状态      |

* 仅管理员可执行操作
* 查询示例：

```SQL
IoTDB> select * from information_schema.nodes 
+-------+----------+-------+----------------+-------------+-------+----------+
|node_id| node_type| status|internal_address|internal_port|version|build_info|
+-------+----------+-------+----------------+-------------+-------+----------+
|      0|ConfigNode|Running|       127.0.0.1|        10710|2.0.5.1|   58d685e|
|      1|  DataNode|Running|       127.0.0.1|        10730|2.0.5.1|   58d685e|
+-------+----------+-------+----------------+-------------+-------+----------+
+----------+--------+
```

### 2.16 CONFIG\_NODES 表

> 该系统表从 V 2.0.5 版本开始提供

* 包含数据库内所有的配置节点信息
* 表结构如下表所示：

| 列名                    | 数据类型 | 列类型    | 说明                |
| ------------------------- | ---------- | ----------- | --------------------- |
| node\_id                | INT32    | TAG       | 节点 ID             |
| config\_consensus\_port | INT32    | ATTRIBUTE | configNode 共识端口 |
| role                    | STRING   | ATTRIBUTE | configNode 节点角色 |

* 仅管理员可执行操作
* 查询示例：

```SQL
IoTDB> select * from information_schema.config_nodes 
+-------+---------------------+------+
|node_id|config_consensus_port|  role|
+-------+---------------------+------+
|      0|                10720|Leader|
+-------+---------------------+------+
```

### 2.17 DATA\_NODES 表

> 该系统表从 V 2.0.5 版本开始提供

* 包含数据库内所有的数据节点信息
* 表结构如下表所示：

| 列名                   | 数据类型 | 列类型    | 说明                  |
| ------------------------ | ---------- | ----------- | ----------------------- |
| node\_id               | INT32    | TAG       | 节点 ID               |
| data\_region\_num      | INT32    | ATTRIBUTE | DataRegion 数量       |
| schema\_region\_num    | INT32    | ATTRIBUTE | SchemaRegion 数量     |
| rpc\_address           | STRING   | ATTRIBUTE | Rpc 地址              |
| rpc\_port              | INT32    | ATTRIBUTE | Rpc 端口              |
| mpp\_port              | INT32    | ATTRIBUTE | MPP 通信端口          |
| data\_consensus\_port  | INT32    | ATTRIBUTE | DataRegion 共识端口   |
| scema\_consensus\_port | INT32    | ATTRIBUTE | SchemaRegion 共识端口 |

* 仅管理员可执行操作
* 查询示例：

```SQL
IoTDB> select * from information_schema.data_nodes 
+-------+---------------+-----------------+-----------+--------+--------+-------------------+---------------------+
|node_id|data_region_num|schema_region_num|rpc_address|rpc_port|mpp_port|data_consensus_port|schema_consensus_port|
+-------+---------------+-----------------+-----------+--------+--------+-------------------+---------------------+
|      1|              4|                4|    0.0.0.0|    6667|   10740|              10760|                10750|
+-------+---------------+-----------------+-----------+--------+--------+-------------------+---------------------+
```

### 2.18 CONNECTIONS 表

> 该系统表从 V 2.0.8 版本开始提供

* 包含集群中所有连接。
* 表结构如下表所示：

| **列名**     | **数据类型** | **列类型** | **说明** |
| -------------------- | -------------------- | ------------------ | ---------------- |
| datanode\_id       | STRING             | TAG              | DataNode的ID   |
| user\_id           | STRING             | TAG              | 用户ID         |
| session\_id        | STRING             | TAG              | Session ID     |
| user\_name         | STRING             | ATTRIBUTE        | 用户名         |
| last\_active\_time | TIMESTAMP          | ATTRIBUTE        | 最近活跃时间   |
| client\_ip         | STRING             | ATTRIBUTE        | 客户端IP       |

* 查询示例：

```SQL
IoTDB> select * from information_schema.connections;
+-----------+-------+----------+---------+-----------------------------+---------+
|datanode_id|user_id|session_id|user_name|             last_active_time|client_ip|
+-----------+-------+----------+---------+-----------------------------+---------+
|          1|      0|         2|     root|2026-01-21T16:28:54.704+08:00|127.0.0.1|
+-----------+-------+----------+---------+-----------------------------+---------+
```

### 2.19 CURRENT\_QUERIES 表

> 该系统表从 V 2.0.8 版本开始提供

* 包含所有执行结束时间在 `[now() - query_cost_stat_window, now())` 范围内的所有查询，也包括当前正在执行的查询。其中`query_cost_stat_window `代表查询耗时统计的窗口，默认值为 0 ，可通过配置文件`iotdb-system.properties`进行配置。
* 表结构如下表所示：

| 列名         | 数据类型  | 列类型 | 说明                                                                          |
| -------------- | ----------- | -------- | ------------------------------------------------------------------------------- |
| query\_id    | STRING    | TAG    | 查询语句的 ID                                                                 |
| state        | STRING    | FIELD  | 查询状态，RUNNING 表示正在执行，FINISHED 表示已结束                           |
| start\_time  | TIMESTAMP | FIELD  | 查询开始的时间戳，时间戳精度与系统精度保持一致                                |
| end\_time    | TIMESTAMP | FIELD  | 查询结束的时间戳，时间戳精度与系统精度保持一致。若查询尚未结束，该列值为 NULL |
| datanode\_id | INT32     | FIELD  | 该查询语句是从哪个 DataNode 发起的                                            |
| cost\_time| FLOAT     | FIELD  | 查询的执行耗时，单位是秒。若查询尚未结束，该列值为查询已执行时间              |
| statement    | STRING    | FIELD  | 查询的sql / 查询请求拼接后的 sql                                              |
| user         | STRING    | FIELD  | 发起查询的用户                                                                |
| client\_ip   | STRING    | FIELD  | 发起查询的客户端 ip                                                           |

* 普通用户查询结果仅显示自身执行的查询；管理员显示全部。
* 查询示例：

```SQL
IoTDB> select * from information_schema.current_queries;
+-----------------------+-------+-----------------------------+--------+-----------+---------+------------------------------------------------+----+---------+
|               query_id|  state|                   start_time|end_time|datanode_id|cost_time|                                       statement|user|client_ip|
+-----------------------+-------+-----------------------------+--------+-----------+---------+------------------------------------------------+----+---------+
|20260121_085427_00013_1|RUNNING|2026-01-21T16:54:27.019+08:00|    null|          1|      0.0|select * from information_schema.current_queries|root|127.0.0.1|
+-----------------------+-------+-----------------------------+--------+-----------+---------+------------------------------------------------+----+---------+
```

### 2.20 QUERIES\_COSTS\_HISTOGRAM 表

> 该系统表从 V 2.0.8 版本开始提供

* 包含过去 `query_cost_stat_window` 时间内的查询耗时的直方图（仅统计已经执行结束的 SQL），其中`query_cost_stat_window `代表查询耗时统计的窗口，默认值为 0 ，可通过配置文件`iotdb-system.properties`进行配置。
* 表结构如下表所示：

| 列名         | 数据类型 | 列类型 | 说明                                                               |
| -------------- | ---------- | -------- | -------------------------------------------------------------------- |
| bin| STRING   | TAG| 分桶名：共包含61个分桶，[0, 1), [1, 2), [2, 3),...., [59, 60), 60+ |
| nums         | INT32    | FIELD  | 分桶内sql的个数                                                    |
| datanode\_id | INT32    | FIELD  | 该桶属于哪个 DataNode                                              |

* 仅管理员可执行操作
* 查询示例：

```SQL
IoTDB> select * from information_schema.queries_costs_histogram limit 10
+------+----+-----------+
|   bin|nums|datanode_id|
+------+----+-----------+
| [0,1)|   0|          1|
| [1,2)|   0|          1|
| [2,3)|   0|          1|
| [3,4)|   0|          1|
| [4,5)|   0|          1|
| [5,6)|   0|          1|
| [6,7)|   0|          1|
| [7,8)|   0|          1|
| [8,9)|   0|          1|
|[9,10)|   0|          1|
+------+----+-----------+
```

### 2.21 SERVICES 表

> 该系统表从 V 2.0.8 版本开始提供

* 可展示所有正常工作（RUNNING 或 READ-ONLY） DN 上的服务（MQTT 服务、REST 服务）。
* 表结构如下表所示：

| 列名          | 数据类型 | 列类型    | 说明                         |
| --------------- | ---------- | ----------- | ------------------------------ |
| service\_name | STRING   | TAG       | 服务名称                     |
| datanode\_id  | INT32    | ATTRIBUTE | 所在 DataNode 的 ID          |
| state         | STRING   | ATTRIBUTE | 服务状态： RUNNING / STOPPED |

* 查询示例：

```SQL
IoTDB> select * from information_schema.services
+------------+-----------+-------+
|service_name|datanode_id|  state|
+------------+-----------+-------+
|        MQTT|          1|STOPPED|
|        REST|          1|RUNNING|
+------------+-----------+-------+
```

## 3. 权限说明

* 不支持通过`GRANT/REVOKE`语句对 `information_schema` 数据库及其下任何表进行权限操作
* 支持任意用户通过`show databases`语句查看`information_schema`数据库相关信息
* 支持任意用户通过`show tables from information_schema` 语句查看所有系统表相关信息
* 支持任意用户通过`desc`语句查看任意系统表 
