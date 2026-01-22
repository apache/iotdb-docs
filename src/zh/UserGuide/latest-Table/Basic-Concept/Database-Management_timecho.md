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

# 数据库管理

## 1. 数据库管理

### 1.1 创建数据库

用于创建数据库。

**语法：**

```SQL
 CREATE DATABASE (IF NOT EXISTS)? <DATABASE_NAME> (WITH properties)?
```

**说明：**

1. <DATABASE_NAME> 数据库名称，具有以下特性：
   - 大小写不敏感，创建成功后，统一显示为小写
   - 名称的长度不得超过 64 个字符。
   - 名称中包含下划线（_）、数字（非开头）、英文字母可以直接创建
   - 名称中包含特殊字符（如`）、中文字符、数字开头时，必须用双引号 "" 括起来。

2. WITH properties 子句可配置如下属性：

> 注：属性的大小写不敏感，有关详细信息[大小写敏感规则](../SQL-Manual/Identifier.md#大小写敏感性)。

| 属性                      | 含义                                     | 默认值    |
| ------------------------- | ---------------------------------------- | --------- |
| `TTL`                     | 数据自动过期删除，单位 ms                | INF       |
| `TIME_PARTITION_INTERVAL` | 数据库的时间分区间隔，单位 ms            | 604800000 |
| `SCHEMA_REGION_GROUP_NUM` | 数据库的元数据副本组数量，一般不需要修改 | 1         |
| `DATA_REGION_GROUP_NUM`   | 数据库的数据副本组数量，一般不需要修改   | 2         |

**示例：**

```SQL
CREATE DATABASE database1;
CREATE DATABASE IF NOT EXISTS database1;

// 创建一个名为 database1 的数据库，并将数据库的TTL时间设置为1年。
CREATE DATABASE IF NOT EXISTS database1 with(TTL=31536000000);
```

### 1.2 使用数据库

用于指定当前数据库作为表的命名空间。

**语法：**

```SQL
USE <DATABASE_NAME>
```

**示例:** 

```SQL
USE database1
```

### 1.3 查看当前数据库

返回当前会话所连接的数据库名称，若未执行过 `use`语句指定数据库，则默认为 `null`。

**语法：**

```SQL
SHOW CURRENT_DATABASE
```

**示例：**

```SQL
IoTDB> SHOW CURRENT_DATABASE;
+---------------+
|CurrentDatabase|
+---------------+
|           null|
+---------------+

IoTDB> USE database1;

IoTDB> SHOW CURRENT_DATABASE;
+---------------+
|CurrentDatabase|
+---------------+
|      database1|
+---------------+
```

### 1.4 查看所有数据库

用于查看所有数据库和数据库的属性信息。

**语法：**

```SQL
SHOW DATABASES (DETAILS)?
```

**语句返回列含义如下：**

| 列名                    | 含义                                                                                                                                                                                                        |
| ----------------------- |-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| database                | database名称。                                                                                                                                                                                               |
| TTL                     | 数据保留周期。如果在创建数据库的时候指定TTL，则TTL对该数据库下所有表的TTL生效。也可以再通过 [create table](../Basic-Concept/Table-Management_timecho.md#11-创建表) 、[alter table](../Basic-Concept/Table-Management_timecho.md#14-修改表) 来设置或更新表的TTL时间。 |
| SchemaReplicationFactor | 元数据副本数，用于确保元数据的高可用性。可以在`iotdb-system.properties`中修改`schema_replication_factor`配置项。                                                                                                                        |
| DataReplicationFactor   | 数据副本数，用于确保数据的高可用性。可以在`iotdb-system.properties`中修改`data_replication_factor`配置项。                                                                                                                            |
| TimePartitionInterval   | 时间分区间隔，决定了数据在磁盘上按多长时间进行目录分组，通常采用默认1周即可。                                                                                                                                                                   |
| SchemaRegionGroupNum          | 使用`DETAILS`语句会返回此列，展示数据库的元数据副本组数量，一般不需要修改                                                                                                                                                                 |
| DataRegionGroupNum         | 使用`DETAILS`语句会返回此列，展示数据库的数据副本组数量，一般不需要修改                                                                                                                                                                  |

**示例:** 

```SQL
IoTDB> show databases
+------------------+-------+-----------------------+---------------------+---------------------+
|          Database|TTL(ms)|SchemaReplicationFactor|DataReplicationFactor|TimePartitionInterval|
+------------------+-------+-----------------------+---------------------+---------------------+
|         database1|    INF|                      1|                    1|            604800000|
|information_schema|    INF|                   null|                 null|                 null|
+------------------+-------+-----------------------+---------------------+---------------------+

IoTDB> show databases details
+------------------+-------+-----------------------+---------------------+---------------------+--------------------+------------------+
|          Database|TTL(ms)|SchemaReplicationFactor|DataReplicationFactor|TimePartitionInterval|SchemaRegionGroupNum|DataRegionGroupNum|
+------------------+-------+-----------------------+---------------------+---------------------+--------------------+------------------+
|         database1|    INF|                      1|                    1|            604800000|                   1|                 2|
|information_schema|    INF|                   null|                 null|                 null|                null|              null|
+------------------+-------+-----------------------+---------------------+---------------------+--------------------+------------------+
```

### 1.5 修改数据库

用于修改数据库中的部分属性。

**语法：**

```SQL
ALTER DATABASE (IF EXISTS)? database=identifier SET PROPERTIES propertyAssignments
```

**说明：**

1. `ALTER DATABASE`操作目前仅支持对数据库的`SCHEMA_REGION_GROUP_NUM`、`DATA_REGION_GROUP_NUM`以及`TTL`属性进行修改。

**示例:** 

```SQL
ALTER DATABASE database1 SET PROPERTIES TTL=31536000000;
```

### 1.6 删除数据库

用于删除数据库。

**语法：**

```SQL
DROP DATABASE (IF EXISTS)? <DATABASE_NAME>
```

**说明：**

1. 数据库已被设置为当前使用（use）的数据库，仍然可以被删除（drop）。
2. 删除数据库将导致所选数据库及其内所有表连同其存储的数据一并被删除。

**示例:**

```SQL
DROP DATABASE IF EXISTS database1
```
