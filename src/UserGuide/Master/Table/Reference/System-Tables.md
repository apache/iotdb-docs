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

# System Tables (V2.0.2)

IoTDB has a built-in system database called `INFORMATION_SCHEMA`, which contains a series of system tables for storing IoTDB runtime information (such as currently executing SQL statements, etc.). Currently, the `INFORMATION_SCHEMA` database only supports read operations.

## 1. System Database

* ​**Name**​: `INFORMATION_SCHEMA`
* ​**Commands**​: Read-only, only supports `Show databases (DETAILS)` / `Show Tables (DETAILS)` / `Use`. Other operations will result in an error: `"The database 'information_schema' can only be queried."`
* ​**Attributes**​:` TTL=INF`, other attributes default to `null  `
* ​**SQL Example**​:

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

## 2. System Tables

* ​**Names**​: `DATABASES`, `TABLES`, `REGIONS`, `QUERIES`, `COLUMNS`, `PIPES`, `PIPE_PLUGINS`, `SUBSCRIPTION`, `TOPICS` (detailed descriptions in later sections)
* ​**Operations**​: Read-only, only supports `SELECT`, `COUNT/SHOW DEVICES`, `DESC`. Any modifications to table structure or content are not allowed and will result in an error: `"The database 'information_schema' can only be queried."  `
* ​**Column Names**​: System table column names are all lowercase by default and separated by underscores (`_`).

### 2.1 DATABASES

* Contains information about all databases in the cluster.
* Table structure is as follows:

| Column Name                     | Data Type | Column Type | Description                    |
| --------------------------------- | ----------- | ------------- | -------------------------------- |
| `database`                  | STRING    | TAG         | Database name                  |
| `ttl(ms)`                   | STRING    | ATTRIBUTE   | Data retention time            |
| `schema_replication_factor` | INT32     | ATTRIBUTE   | Schema replica count           |
| `data_replication_factor`   | INT32     | ATTRIBUTE   | Data replica count             |
| `time_partition_interval`   | INT64     | ATTRIBUTE   | Time partition interval        |
| `schema_region_group_num`   | INT32     | ATTRIBUTE   | Number of schema region groups |
| `data_region_group_num`     | INT32     | ATTRIBUTE   | Number of data region groups   |

* Query Example:

```sql
IoTDB> select * from information_schema.databases
+------------------+-------+-------------------------+-----------------------+-----------------------+-----------------------+---------------------+
|          database|ttl(ms)|schema_replication_factor|data_replication_factor|time_partition_interval|schema_region_group_num|data_region_group_num|
+------------------+-------+-------------------------+-----------------------+-----------------------+-----------------------+---------------------+
|information_schema|    INF|                     null|                   null|                   null|                   null|                 null|
|         database1|    INF|                        1|                      1|              604800000|                      0|                    0|
+------------------+-------+-------------------------+-----------------------+-----------------------+-----------------------+---------------------+
```

### 2.2 TABLES

* Contains information about all tables in the cluster.
* Table structure is as follows:

| Column Name      | Data Type | Column Type | Description         |
| ------------------ | ----------- | ------------- | --------------------- |
| `database`   | STRING    | TAG         | Database name       |
| `table_name` | STRING    | TAG         | Table name          |
| `ttl(ms)`    | STRING    | ATTRIBUTE   | Data retention time |
| `status`     | STRING    | ATTRIBUTE   | Status              |
| `comment`    | STRING    | ATTRIBUTE   | Description/comment |

* Note:  Possible values for `status`: `USING`, `PRE_CREATE`, `PRE_DELETE`.  For details, refer to the [View Tables](../Basic-Concept/Table-Management.md#12-view-tables) in Table Management documentation
* Query Example:

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

### 2.3 REGIONS

* Contains information about all regions in the cluster.
* Table structure is as follows:

| Column Name             | Data Type | Column Type | Description                                                                                                                                                       |
| ------------------------- | ----------- | ------------- |-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `region_id`         | INT32     | TAG         | Region ID                                                                                                                                                         |
| `datanode_id`       | INT32     | TAG         | DataNode ID                                                                                                                                                       |
| `type`              | STRING    | ATTRIBUTE   | Type (`SchemaRegion`/`DataRegion`)                                                                                                                                |
| `status`            | STRING    | ATTRIBUTE   | Status (`Running`,`Unknown`, etc.)                                                                                                                                |
| `database`          | STRING    | ATTRIBUTE   | Database name                                                                                                                                                     |
| `series_slot_num`   | INT32     | ATTRIBUTE   | Number of series slots                                                                                                                                            |
| `time_slot_num`     | INT64     | ATTRIBUTE   | Number of time slots                                                                                                                                              |
| `rpc_address`       | STRING    | ATTRIBUTE   | RPC address                                                                                                                                                       |
| `rpc_port`          | INT32     | ATTRIBUTE   | RPC port                                                                                                                                                          |
| `internal_address`  | STRING    | ATTRIBUTE   | Internal communication address                                                                                                                                    |
| `role`              | STRING    | ATTRIBUTE   | Role (`Leader`/`Follower`)                                                                                                                                        |
| `create_time`       | TIMESTAMP | ATTRIBUTE   | Creation time                                                                                                                                                     |
| `tsfile_size_bytes` | INT64     | ATTRIBUTE   | - For​**DataRegion with statistics ​**​: Total file size of TsFiles. <br>- For**DataRegion without statistics**(Unknown):`-1`.<br>- For​**SchemaRegion**​:`null`. |

* Query Example:

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

### 2.4 QUERIES

* Contains information about all currently executing queries in the cluster. Can also be queried using the `SHOW QUERIES` syntax.
* Table structure is as follows:

| Column Name        | Data Type | Column Type | Description                                                |
| -------------------- | ----------- | ------------- | ------------------------------------------------------------ |
| `query_id`     | STRING    | TAG         | Query ID                                                   |
| `start_time`   | TIMESTAMP | ATTRIBUTE   | Query start timestamp (precision matches system precision) |
| `datanode_id`  | INT32     | ATTRIBUTE   | DataNode ID that initiated the query                       |
| `elapsed_time` | FLOAT     | ATTRIBUTE   | Query execution duration (in seconds)                      |
| `statement`    | STRING    | ATTRIBUTE   | SQL statement of the query                                 |
| `user`         | STRING    | ATTRIBUTE   | User who initiated the query                               |

* Query Example:

```SQL
IoTDB> select * from information_schema.queries
+-----------------------+-----------------------------+-----------+------------+----------------------------------------+----+
|               query_id|                   start_time|datanode_id|elapsed_time|                               statement|user|
+-----------------------+-----------------------------+-----------+------------+----------------------------------------+----+
|20250331_023242_00011_1|2025-03-31T10:32:42.360+08:00|          1|       0.025|select * from information_schema.queries|root|
+-----------------------+-----------------------------+-----------+------------+----------------------------------------+----+
```

### 2.5 COLUMNS

* Contains information about all columns in tables across the cluster
* Table structure is as follows:

| Column Name       | Data Type | Column Type | Description        |
| ------------------- | ----------- | ------------- | -------------------- |
| `database`    | STRING    | TAG         | Database name      |
| `table_name`  | STRING    | TAG         | Table name         |
| `column_name` | STRING    | TAG         | Column name        |
| `datatype`    | STRING    | ATTRIBUTE   | Column data type   |
| `category`    | STRING    | ATTRIBUTE   | Column category    |
| `status`      | STRING    | ATTRIBUTE   | Column status      |
| `comment`     | STRING    | ATTRIBUTE   | Column description |

Notes: Possible values for `status`: `USING`, `PRE_DELETE`. For details, refer to [Viewing Table Columns](../Basic-Concept/Table-Management.html#13-view-table-columns) in Table Management documentation.
> Users can only query tables for which they have select permissions .

* Query Example:

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

### 2.6 PIPES

* Contains information about all pipes in the cluster
* Table structure is as follows:

| Column Name                       | Data Type | Column Type | Description                                              |
| ----------------------------------- | ----------- | ------------- | ---------------------------------------------------------- |
| `id`                          | STRING    | TAG         | Pipe name                                                |
| `creation_time`               | TIMESTAMP | ATTRIBUTE   | Creation time                                            |
| `state`                       | STRING    | ATTRIBUTE   | Pipe status (`RUNNING`/`STOPPED`)                |
| `pipe_source`                 | STRING    | ATTRIBUTE   | Source plugin parameters                                 |
| `pipe_processor`              | STRING    | ATTRIBUTE   | Processor plugin parameters                              |
| `pipe_sink`                   | STRING    | ATTRIBUTE   | Sink plugin parameters                                   |
| `exception_message`           | STRING    | ATTRIBUTE   | Exception message                                        |
| `remaining_event_count`       | INT64     | ATTRIBUTE   | Remaining event count (`-1`if Unknown)               |
| `estimated_remaining_seconds` | DOUBLE    | ATTRIBUTE   | Estimated remaining time in seconds (`-1`if Unknown) |

* Query Example:

```SQL
select * from information_schema.pipes
+----------+-----------------------------+-------+--------------------------------------------------------------------------+--------------+-----------------------------------------------------------------------+-----------------+---------------------+---------------------------+
|        id|                creation_time|  state|                                                               pipe_source|pipe_processor|                                                              pipe_sink|exception_message|remaining_event_count|estimated_remaining_seconds|
+----------+-----------------------------+-------+--------------------------------------------------------------------------+--------------+-----------------------------------------------------------------------+-----------------+---------------------+---------------------------+
|tablepipe1|2025-03-31T12:25:24.040+08:00|RUNNING|{__system.sql-dialect=table, source.password=******, source.username=root}|            {}|{format=hybrid, node-urls=192.168.xxx.xxx:6667, sink=iotdb-thrift-sink}|                 |                    0|                        0.0|
+----------+-----------------------------+-------+--------------------------------------------------------------------------+--------------+-----------------------------------------------------------------------+-----------------+---------------------+---------------------------+
```

### 2.7 PIPE\_PLUGINS

* Contains information about all PIPE plugins in the cluster
* Table structure is as follows:

| Column Name       | Data Type | Column Type | Description                                         |
| ------------------- | ----------- | ------------- | ----------------------------------------------------- |
| `plugin_name` | STRING    | TAG         | Plugin name                                         |
| `plugin_type` | STRING    | ATTRIBUTE   | Plugin type (`Builtin`/`External`)          |
| `class_name`  | STRING    | ATTRIBUTE   | Plugin's main class name                            |
| `plugin_jar`  | STRING    | ATTRIBUTE   | Plugin's JAR file name (`null`for builtin type) |

* Query Example:

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

### 2.8 SUBSCRIPTIONS

* Contains information about all data subscriptions in the cluster
* Table structure is as follows:

| Column Name                | Data Type | Column Type | Description             |
| ---------------------------- | ----------- | ------------- | ------------------------- |
| `topic_name`           | STRING    | TAG         | Subscription topic name |
| `consumer_group_name`  | STRING    | TAG         | Consumer group name     |
| `subscribed_consumers` | STRING    | ATTRIBUTE   | Subscribed consumers    |

* Query Example:

```SQL
IoTDB> select * from information_schema.subscriptions where topic_name = 'topic_1'
+----------+-------------------+--------------------------------+
|topic_name|consumer_group_name|            subscribed_consumers|
+----------+-------------------+--------------------------------+
|   topic_1|                cg1|[c3, c4, c5, c6, c7, c0, c1, c2]|
+----------+-------------------+--------------------------------+
```

### 2.9 TOPICS

* Contains information about all data subscription topics in the cluster
* Table structure is as follows:

| Column Name         | Data Type | Column Type | Description                    |
| --------------------- | ----------- | ------------- | -------------------------------- |
| `topic_name`    | STRING    | TAG         | Subscription topic name        |
| `topic_configs` | STRING    | ATTRIBUTE   | Topic configuration parameters |

* Query Example:

```SQL
IoTDB> select * from information_schema.topics
+----------+----------------------------------------------------------------+
|topic_name|                                                   topic_configs|
+----------+----------------------------------------------------------------+
|     topic|{__system.sql-dialect=table, start-time=2025-01-10T17:05:38.282}|
+----------+----------------------------------------------------------------+
```

## 3. Permission Description

* GRANT/REVOKE operations are not supported for the `information_schema` database or any of its tables.
* All users can view `information_schema` database details via the `SHOW DATABASES` statement.
* All users can list system tables via `SHOW TABLES FROM information_schema`.
* All users can inspect system table structures using the `DESC` statement.
* Currently, only the root user can query data from system tables via `SELECT`—other users will receive empty result sets.
