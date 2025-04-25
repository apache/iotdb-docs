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
+-------------+-------+
|    TableName|TTL(ms)|
+-------------+-------+
|    databases|    INF|
|       tables|    INF|
| pipe_plugins|    INF|
|subscriptions|    INF|
|      regions|    INF|
|      columns|    INF|
|       topics|    INF|
|      queries|    INF|
|        pipes|    INF|
+-------------+-------+
```

## 2. 系统表

* 名称：`DATABASES`, `TABLES`, `REGIONS`, `QUERIES`, `COLUMNS`, `PIPES`, `PIPE_PLUGINS`, `SUBSCRIPTION`, `TOPICS`（详细介绍见后面小节）
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

* 说明：status 可能为`USING`/`PRE_CREATE`/`PRE_DELETE`，具体见表管理中[查看表](../Basic-Concept/Table-Management.md#12-查看表)的相关描述
* 查询示例：

```sql
IoTDB> select * from information_schema.tables
+------------------+-------------+-----------+------+-------+
|          database|   table_name|    ttl(ms)|status|comment|
+------------------+-------------+-----------+------+-------+
|information_schema|    databases|        INF| USING|   null|
|information_schema|       tables|        INF| USING|   null|
|information_schema| pipe_plugins|        INF| USING|   null|
|information_schema|subscriptions|        INF| USING|   null|
|information_schema|      regions|        INF| USING|   null|
|information_schema|      columns|        INF| USING|   null|
|information_schema|       topics|        INF| USING|   null|
|information_schema|      queries|        INF| USING|   null|
|information_schema|        pipes|        INF| USING|   null|
|         database1|       table1|31536000000| USING|   null|
+------------------+-------------+-----------+------+-------+
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

说明： status 可能为`USING`/`PRE_DELETE`，具体见表管理中[查看表的列](../Basic-Concept/Table-Management.html#13-查看表的列)的相关描述

> 用户只能查出自己有展示权限的 table

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

* 查询示例：

```SQL
IoTDB> select * from information_schema.topics
+----------+----------------------------------------------------------------+
|topic_name|                                                   topic_configs|
+----------+----------------------------------------------------------------+
|     topic|{__system.sql-dialect=table, start-time=2025-01-10T17:05:38.282}|
+----------+----------------------------------------------------------------+
```

## 3. 权限说明

* 不支持通过`GRANT/REVOKE`语句对 `information_schema` 数据库及其下任何表进行权限操作
* 支持任意用户通过`show databases`语句查看`information_schema`数据库相关信息
* 支持任意用户通过`show tables from information_schema` 语句查看所有系统表相关信息
* 支持任意用户通过`desc`语句查看任意系统表
* 目前只支持 `root `用户通过`select`语句从系统表中查询数据，其他用户查询时展示空结果集
