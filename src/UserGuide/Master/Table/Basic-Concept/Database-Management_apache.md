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

## 1. Database Management

### 1.1 Create a Database

This command is used to create a database.

**Syntax:**

```SQL
 CREATE DATABASE (IF NOT EXISTS)? <DATABASE_NAME> (WITH properties)?
```

**Note: **

1. `<DATABASE_NAME>`: The name of the database, with the following characteristics:
  - Case-insensitive. After creation, it will be displayed uniformly in lowercase.
  - Can include commas (`,`), underscores (`_`), numbers, letters, and Chinese characters.
  - Maximum length is 64 characters.
  - Names with special characters or Chinese characters must be enclosed in double quotes (`""`).

2. `WITH properties`: Property names are case-insensitive. For more details, refer to the case sensitivity rules [case-sensitivity](../SQL-Manual/Identifier.md#2-case-sensitivity)。Configurable properties include:

| Property                | Description                                                  | Default Value        |
| ----------------------- | ------------------------------------------------------------ | -------------------- |
| TTL                     | Automatic data expiration time, in milliseconds              | `INF`                |
| TIME_PARTITION_INTERVAL | Time partition interval for the database, in milliseconds    | `604800000` (7 days) |
| SCHEMA_REGION_GROUP_NUM | Number of metadata replica groups; generally does not require modification | `1`                  |
| DATA_REGION_GROUP_NUM   | Number of data replica groups; generally does not require modification | `2`                  |

**Examples:**

```SQL
CREATE DATABASE database1;
CREATE DATABASE IF NOT EXISTS database1;

// Sets TTL to 1 year.
CREATE DATABASE IF NOT EXISTS database1 with(TTL=31536000000);
```

### 1.2 Use a Database

Specify the current database as the namespace for table operations.

**Syntax:**

```SQL
USE <DATABASE_NAME>
```

**Example:** 

```SQL
USE database1
```

### 1.3 View the Current Database

Displays the name of the currently connected database. If no USE statement has been executed, the default is `null`.

**Syntax:**

```SQL
SHOW CURRENT_DATABASE
```

**Example:**

```SQL
IoTDB> SHOW CURRENT_DATABASE;
+---------------+
|CurrentDatabase|
+---------------+
|           null|
+---------------+

IoTDB> USE test;

IoTDB> SHOW CURRENT_DATABASE;
+---------------+
|CurrentDatabase|
+---------------+
|   iot_database|
+---------------+
```

### 1.4 View All Databases

Displays all databases and their properties.

**Syntax:**

```SQL
SHOW DATABASES (DETAILS)?
```

**Columns Explained:**


| Column Name             | Description                                                                                                                                                                                                                                                                                                                                   |
| ----------------------- |-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| database                | Name of the database.                                                                                                                                                                                                                                                                                                                         |
| TTL                     | Data retention period. If TTL is specified when creating a database, it applies to all tables within the database. You can also set or update the TTL of individual tables using [create table](../Basic-Concept/Table-Management_apache.md#11-create-a-table) 、[alter table](../Basic-Concept/Table-Management_apache.md#14-update-tables) . |
| SchemaReplicationFactor | Number of metadata replicas, ensuring metadata high availability. This can be configured in the `iotdb-system.properties` file under the `schema_replication_factor` property.                                                                                                                                                                |
| DataReplicationFactor   | Number of data replicas, ensuring data high availability. This can be configured in the `iotdb-system.properties` file under the `data_replication_factor` property.                                                                                                                                                                          |
| TimePartitionInterval   | Time partition interval, determining how often data is grouped into directories on disk. The default is typically one week.                                                                                                                                                                                                                   |
| Model                   | Returned when using the `DETAILS` option, showing the data model corresponding to each database (e.g., timeseries tree model or device table model).                                                                                                                                                                                          |

**Examples:** 

```SQL
IoTDB> show databases
+---------+-------+-----------------------+---------------------+---------------------+
| Database|TTL(ms)|SchemaReplicationFactor|DataReplicationFactor|TimePartitionInterval|
+---------+-------+-----------------------+---------------------+---------------------+
|test_prop|    300|                      3|                    2|               100000|
|    test2|    300|                      3|                    2|            604800000|
+---------+-------+-----------------------+---------------------+---------------------+
IoTDB> show databases details
+---------+-------+-----------------------+---------------------+---------------------+-----------------------+-----------------------+
| Database|TTL(ms)|SchemaReplicationFactor|DataReplicationFactor|TimePartitionInterval|SchemaRegionGroupNum|  DataRegionGroupNum|
+---------+-------+-----------------------+---------------------+---------------------+-----------------------+-----------------------+
|test_prop|    300|                      3|                    2|               100000|                      1|                      2|
|    test2|    300|                      3|                    2|            604800000|                      1|                      2|
+---------+-------+-----------------------+---------------------+---------------------+-----------------------+-----------------------+
```

### 1.5 Update a Database

Used to modify some attributes in the database.

**Syntax:**

```SQL
ALTER DATABASE (IF EXISTS)? database=identifier SET PROPERTIES propertyAssignments
```

**Note:**

1. The `ALTER DATABASE` operation currently only supports modifications to the database's `SCHEMA_REGION_GROUP_NUM`, `DATA_REGION_GROUP_NUM`, and `TTL` attributes.

**Example:**

```SQL
ALTER DATABASE database1 SET PROPERTIES TTL=31536000000;
```

### 1.6 Delete a Database

Deletes the specified database and all associated tables and data.

**Syntax:**

```SQL
DROP DATABASE (IF EXISTS)? <DATABASE_NAME>
```

**Note:**

1. A database currently in use can still be dropped.
2. Deleting a database removes all its tables and stored data.

**Example:**

```SQL
DROP DATABASE IF EXISTS database1
```
