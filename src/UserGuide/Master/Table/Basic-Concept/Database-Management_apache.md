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

# Database Management

In the table model, a database is the top-level organizational structure for tables and is used to manage a group of business-related tables. Before creating tables, writing data, or querying data, you usually need to create a database and specify the database used by the current session through `USE <DATABASE_NAME>`.

A database can be configured with properties such as TTL, time partition interval, the maximum number of SchemaRegionGroups, and the maximum number of DataRegionGroups. The database-level TTL is used as the default data retention period for tables in the database. If a table has its own TTL, the table-level TTL takes precedence.

## 1. Basic Concepts

### 1.1 Database

A database organizes and manages multiple tables. Databases can be divided by business domain, project, tenant, or data isolation requirements. For example, tables for a group of devices in the same business system can be placed in one database to manage their lifecycle, permissions, and query scope uniformly.

In the table model, a database name is also the namespace for its tables. After `USE database1` is executed, subsequent table operations that do not explicitly specify a database name apply to `database1` by default.

### 1.2 TTL

TTL specifies how long data is retained, in milliseconds. Data that exceeds the TTL is automatically expired and deleted. Setting an appropriate TTL controls disk space usage and prevents accumulated historical data from affecting storage costs and query performance.

TTL can be set at either the database level or the table level. For more information, see [TTL Delete Data](../Basic-Concept/TTL-Delete-Data_apache.md).

### 1.3 Time Partition Interval

The time partition interval determines the time range used to group data into directories on disk. The default value is 604800000 ms, or one week, and is suitable for most scenarios.

### 1.4 RegionGroup

IoTDB divides metadata and data into Regions managed by DataNodes. The `MAX_SCHEMA_REGION_GROUP_NUM` and `MAX_DATA_REGION_GROUP_NUM` database properties specify the maximum numbers of schema replica groups and data replica groups, respectively. These properties generally do not need to be changed manually.

## 2. Database Management

### 2.1 Create a Database

Creates a database.

**Syntax:**

```SQL
CREATE DATABASE (IF NOT EXISTS)? <DATABASE_NAME> (WITH properties)?
```

**Description:**

1. `<DATABASE_NAME>` is the database name and has the following characteristics:
   - It is case-insensitive and is displayed in lowercase after the database is created.
   - It cannot exceed 64 characters.
   - A name that contains underscores (`_`), digits (except as the first character), or English letters can be created directly.
   - A name that contains special characters (such as a backtick), Chinese characters, or starts with a digit must be enclosed in double quotation marks (`""`).
2. The `WITH properties` clause supports the following properties:

| Property | Description | Default Value |
| --- | --- | --- |
| `TTL` | Automatic data expiration time, in milliseconds. The value must be a positive integer. | `INF` |
| `TIME_PARTITION_INTERVAL` | Time partition interval for the database, in milliseconds. The value must be a positive integer. | `604800000` |
| `MAX_SCHEMA_REGION_GROUP_NUM` | Maximum number of SchemaRegionGroups to which the database can automatically expand. The value must be a positive integer. Supported starting from V2.0.11. | `1` |
| `MAX_DATA_REGION_GROUP_NUM` | Maximum number of DataRegionGroups to which the database can automatically expand. The value must be a positive integer. Supported starting from V2.0.11. | `2` |

**Notes:**

- Property names are case-insensitive. For details, see [Case Sensitivity](../SQL-Manual/Identifier.md#2-case-sensitivity).
- The maximum schema/data region group quotas, `maxSchemaRegionGroupNum` and `maxDataRegionGroupNum`, can be set or adjusted through SQL when creating or modifying a database only when `schema_region_group_extension_policy` and `data_region_group_extension_policy` in `iotdb-common.properties` are set to `CUSTOM`.

**Example:**

```SQL
CREATE DATABASE IF NOT EXISTS database1 WITH (TTL=31536000000);
```

### 2.2 Use a Database

Specifies the current database as the namespace for tables.

**Syntax:**

```SQL
USE <DATABASE_NAME>
```

**Example:**

```SQL
USE database1;
```

### 2.3 View the Current Database

Returns the name of the database used by the current session. If no database has been specified with a `USE` statement, the default value is `null`.

**Syntax:**

```SQL
SHOW CURRENT_DATABASE
```

**Example:**

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

### 2.4 View All Databases

Displays all databases and their properties.

**Syntax:**

```SQL
SHOW DATABASES (DETAILS)?
```

**Columns:**

| Column Name | Description |
| --- | --- |
| Database | Database name. |
| TTL | Data retention period. A database-level TTL applies to all tables in the database by default. You can also set or update a table-level TTL through [CREATE TABLE](../Basic-Concept/Table-Management_apache.md#21-create-a-table) or [ALTER TABLE](../Basic-Concept/Table-Management_apache.md#25-update-tables). |
| SchemaReplicationFactor | Number of schema replicas used to ensure metadata availability. This value can be changed through `schema_replication_factor` in `iotdb-system.properties`. |
| DataReplicationFactor | Number of data replicas used to ensure data availability. This value can be changed through `data_replication_factor` in `iotdb-system.properties`. |
| TimePartitionInterval | Time partition interval, which determines the time range used to group data into directories on disk. The default value of one week is suitable for most scenarios. |
| SchemaRegionGroupNum | Returned with `DETAILS`. Number of schema replica groups currently owned by the database. |
| MaxSchemaRegionGroupNum | Returned with `DETAILS`. Maximum number of schema replica groups allowed for the database. |
| DataRegionGroupNum | Returned with `DETAILS`. Number of data replica groups currently owned by the database. |
| MaxDataRegionGroupNum | Returned with `DETAILS`. Maximum number of data replica groups allowed for the database. |

**Example:**

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

### 2.5 Count Databases

Counts the total number of databases. This syntax is supported starting from V2.0.11.

**Syntax:**

```SQL
COUNT DATABASES
```

**Example:**

```shell
TimechoDB> COUNT DATABASES
+-----+
|count|
+-----+
|    2|
+-----+
```

### 2.6 Update a Database

Modifies supported database properties.

**Syntax:**

```SQL
ALTER DATABASE (IF EXISTS)? database=identifier SET PROPERTIES propertyAssignments
```

**Description:**

1. `ALTER DATABASE` currently supports modifying only `MAX_SCHEMA_REGION_GROUP_NUM`, `MAX_DATA_REGION_GROUP_NUM`, and `TTL`.

**Example:**

```SQL
ALTER DATABASE database1 SET PROPERTIES TTL=31536000000;
ALTER DATABASE database1 SET PROPERTIES MAX_SCHEMA_REGION_GROUP_NUM=2, MAX_DATA_REGION_GROUP_NUM=4;
```

### 2.7 Delete a Database

Deletes a database.

**Syntax:**

```SQL
DROP DATABASE (IF EXISTS)? <DATABASE_NAME>
```

**Description:**

1. A database can be dropped even if it is the current database selected by `USE`.
2. Dropping a database deletes all tables in the database and all data stored in those tables.

**Example:**

```SQL
DROP DATABASE IF EXISTS database1;
```
