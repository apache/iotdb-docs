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

在表模型中，数据库是表的上层组织结构，用于管理一组业务相关的表。创建表、写入数据或查询数据前，通常需要先创建数据库，并通过 `USE <DATABASE_NAME>` 指定当前会话使用的数据库。

数据库可以设置 TTL、时间分区间隔、SchemaRegionGroup 数量和 DataRegionGroup 数量等属性。其中 TTL 会作为数据库下表的默认数据保留周期；如果表单独设置了 TTL，则以表级 TTL 为准。

## 1. 基础概念

### 1.1 数据库

数据库用于组织和管理多张表。通常可以按业务域、项目、租户或数据隔离需求划分数据库。例如，将同一业务系统的一组设备表放在同一个数据库中，便于统一管理生命周期、权限和查询空间。

在表模型中，数据库名称也是表的命名空间。执行 `USE database1` 后，后续未显式指定数据库名的表操作会默认作用于 `database1`。

### 1.2 TTL

TTL 用于指定数据保存时间，单位为毫秒。超过 TTL 的数据会被自动过期删除。合理设置 TTL 可以控制磁盘空间占用，避免历史数据持续累积影响存储成本和查询性能。

TTL 可以在数据库级别设置，也可以在表级别设置。如需了解更详细的功能介绍可查阅：[数据保留时间](../Basic-Concept/TTL-Delete-Data_apache.md)。

### 1.3 时间分区间隔

时间分区间隔决定数据在磁盘上按多长时间进行目录分组，默认值为 604800000 ms，即 1 周。通常采用默认值即可。

### 1.4 RegionGroup

IoTDB 会将元数据和数据划分为 Region，并由 DataNode 管理。数据库级属性中的 `MAX_SCHEMA_REGION_GROUP_NUM` 和 `MAX_DATA_REGION_GROUP_NUM` 分别用于表示元数据副本组和数据副本组允许达到的最大数量，一般不需要手动修改。

## 2. 数据库管理

### 2.1 创建数据库

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
   - 名称中包含特殊字符（如反引号）、中文字符、数字开头时，必须用双引号 `""` 括起来。

2. WITH properties 子句可配置如下属性：

| 属性 | 含义 | 默认值 |
| --- | --- | --- |
| `TTL` | 数据自动过期删除，单位 ms，此值需要为正整数 | INF |
| `TIME_PARTITION_INTERVAL` | 数据库的时间分区间隔，单位 ms，此值需要为正整数 | 604800000 |
| `MAX_SCHEMA_REGION_GROUP_NUM` | 数据库自动扩展 SchemaRegionGroup 时允许达到的最大 SchemaRegionGroup 数量，此值需要为正整数，V2.0.11 起支持 | 1 |
| `MAX_DATA_REGION_GROUP_NUM` | 数据库自动扩展 DataRegionGroup 时允许达到的最大 DataRegionGroup 数量，此值需要为正整数，V2.0.11 起支持 | 2 |

**注意：**

- 属性的大小写不敏感，有关详细信息请参阅[大小写敏感规则](../SQL-Manual/Identifier.md#大小写敏感性)。
- 仅当 `iotdb-common.properties` 配置文件中的 `schema_region_group_extension_policy` 和 `data_region_group_extension_policy` 参数设置为 `CUSTOM` 策略时，才支持通过 SQL 在创建或修改数据库时设置或调整 schema/data region group 最大配额，即 `maxSchemaRegionGroupNum` 和 `maxDataRegionGroupNum`。

**示例：**

```SQL
CREATE DATABASE IF NOT EXISTS database1 WITH (TTL=31536000000);
```

### 2.2 使用数据库

用于指定当前数据库作为表的命名空间。

**语法：**

```SQL
USE <DATABASE_NAME>
```

**示例:** 

```SQL
USE database1;
```

### 2.3 查看当前数据库

返回当前会话所连接的数据库名称，若未执行过 `use`语句指定数据库，则默认为 `null`。

**语法：**

```SQL
SHOW CURRENT_DATABASE
```

**示例：**

```SQL
USE database1;
SHOW CURRENT_DATABASE;
```

```shell
+---------------+
|CurrentDatabase|
+---------------+
|      database1|
+---------------+
```

### 2.4 查看所有数据库

用于查看所有数据库和数据库的属性信息。

**语法：**

```SQL
SHOW DATABASES (DETAILS)?
```

**语句返回列含义如下：**

| 列名 | 含义 |
| --- | --- |
| Database | 数据库名称。 |
| TTL | 数据保留周期。如果在创建数据库时指定 TTL，则 TTL 默认对该数据库下所有表生效。也可以通过 [CREATE TABLE](../Basic-Concept/Table-Management_apache.md#21-创建表) 或 [ALTER TABLE](../Basic-Concept/Table-Management_apache.md#25-修改表) 设置或更新表的 TTL。 |
| SchemaReplicationFactor | 元数据副本数，用于确保元数据的高可用性。可以在 `iotdb-system.properties` 中修改 `schema_replication_factor` 配置项。 |
| DataReplicationFactor | 数据副本数，用于确保数据的高可用性。可以在 `iotdb-system.properties` 中修改 `data_replication_factor` 配置项。 |
| TimePartitionInterval | 时间分区间隔，决定数据在磁盘上按多长时间进行目录分组，通常采用默认值 1 周即可。 |
| SchemaRegionGroupNum | 使用 `DETAILS` 语句会返回此列，展示数据库当前拥有的元数据副本组数量。 |
| MaxSchemaRegionGroupNum | 使用 `DETAILS` 语句会返回此列，展示数据库允许拥有的最大元数据副本组数量。 |
| DataRegionGroupNum | 使用 `DETAILS` 语句会返回此列，展示数据库当前拥有的数据副本组数量。 |
| MaxDataRegionGroupNum | 使用 `DETAILS` 语句会返回此列，展示数据库允许拥有的最大数据副本组数量。 |

**示例:** 

```SQL
SHOW DATABASES DETAILS;
```

```shell
+------------------+-------+-----------------------+---------------------+---------------------+--------------------+-----------------------+------------------+---------------------+
|          Database|TTL(ms)|SchemaReplicationFactor|DataReplicationFactor|TimePartitionInterval|SchemaRegionGroupNum|MaxSchemaRegionGroupNum|DataRegionGroupNum|MaxDataRegionGroupNum|
+------------------+-------+-----------------------+---------------------+---------------------+--------------------+-----------------------+------------------+---------------------+
|         database1|    INF|                      1|                    1|            604800000|                   1|                      1|                 2|                    2|
|information_schema|    INF|                   null|                 null|                 null|                null|                   null|              null|                 null|
+------------------+-------+-----------------------+---------------------+---------------------+--------------------+-----------------------+------------------+---------------------+
```

### 2.5 统计数据库数量

用于统计数据库的总数。该语法自 V2.0.11 版本起支持。

**语法：**

```SQL
COUNT DATABASES
```

**示例：**

```shell
TimechoDB> COUNT DATABASES
+-----+
|count|
+-----+
|    2|
+-----+
```

### 2.6 修改数据库

用于修改数据库中的部分属性。

**语法：**

```SQL
ALTER DATABASE (IF EXISTS)? database=identifier SET PROPERTIES propertyAssignments
```

**说明：**

1. `ALTER DATABASE` 操作目前仅支持对数据库的 `MAX_SCHEMA_REGION_GROUP_NUM`、`MAX_DATA_REGION_GROUP_NUM` 以及 `TTL` 属性进行修改。

**示例:** 

```SQL
ALTER DATABASE database1 SET PROPERTIES TTL=31536000000;
ALTER DATABASE database1 SET PROPERTIES MAX_SCHEMA_REGION_GROUP_NUM=2, MAX_DATA_REGION_GROUP_NUM=4;
```

### 2.7 删除数据库

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
DROP DATABASE IF EXISTS database1;
```
