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

# TTL Delete Data

## 1. Overview

Time-to-Live (TTL) is a mechanism for defining the lifespan of data in a database. In IoTDB, TTL allows setting table-level expiration policies, enabling the system to automatically delete outdated data periodically. This helps manage disk space efficiently, maintain high query performance, and reduce memory usage.

TTL values are specified in milliseconds, and once data exceeds its defined lifespan, it becomes unavailable for queries and cannot be written to. However, the physical deletion of expired data occurs later during the compaction process. Note that changes to TTL settings can briefly impact the accessibility of data.

**Notes:**

1. TTL defines the expiration time of data in milliseconds, independent of the time precision configuration file.
2. Modifying TTL settings can cause temporary variations in data accessibility.
3. The system eventually removes expired data, though this process may involve some delay.。
4. The TTL expiration check is based on the data point timestamp, not the write time.

## 2. Set TTL

In the table model, IoTDB’s TTL operates at the granularity of individual tables. You can set TTL directly on a table or at the database level. When TTL is configured at the database level, it serves as the default for new tables created within the database. However, each table can still have its own independent TTL settings.

**Note:** Modifying the database-level TTL does not retroactively affect the TTL settings of existing tables.

### 2.1 Set TTL for Tables

If TTL is specified when creating a table using SQL, the table’s TTL takes precedence. Refer to [Table-Management](../Basic-Concept/Table-Management_apache.md)for details.

Example 1: Setting TTL during table creation:

```SQL
CREATE TABLE test3 ("site" string id, "temperature" int32) with (TTL=3600)
```

Example 2: Changing TTL for an existing table:

```SQL
ALTER TABLE tableB SET PROPERTIES TTL=3600;
```

**Example 3:** If TTL is not specified or set to the default value, it will inherit the database's TTL. By default, the database TTL is `'INF'` (infinite):

```SQL
CREATE TABLE test3 ("site" string id, "temperature" int32) with (TTL=DEFAULT)
CREATE TABLE test3 ("site" string id, "temperature" int32)
ALTER TABLE tableB set properties TTL=DEFAULT
```

### 2.2 Set TTL for Databases

Tables without explicit TTL settings inherit the TTL of their database. Refer to [Database-Management](../Basic-Concept/Database-Management_apache.md)for details.

Example 4: A database with TTL=3600000 creates tables inheriting this TTL:

```SQL
CREATE DATABASE db WITH (ttl=3600000)
use db
CREATE TABLE test3 ("site" string id, "temperature" int32)
```

Example 5: A database without a TTL setting creates tables without TTL:

```SQL
CREATE DATABASE db
use db
CREATE TABLE test3 ("site" string id, "temperature" int32)
```

Example 6: Setting a table with no TTL explicitly (TTL=INF) in a database with a configured TTL:

```SQL
CREATE DATABASE db WITH (ttl=3600000)
use db
CREATE TABLE test3 ("site" string id, "temperature" int32) with (ttl='INF')
```

## 3. Remove TTL

To cancel a TTL setting, modify the table's TTL to 'INF'. Note that IoTDB does not currently support modifying the TTL of a database.

```SQL
ALTER TABLE tableB set properties TTL='INF'
```

## 4. View TTL Information

Use the SHOW DATABASES and SHOW TABLES commands to view TTL details for databases and tables. Refer to [Database-Management](../Basic-Concept/Database-Management_apache.md)、 [Table-Management](../Basic-Concept/Table-Management_apache.md)for details.

> Note: TTL settings in tree-model will also be shown.

Example Output:

```SQL
IoTDB> show databases
+---------+-------+-----------------------+---------------------+---------------------+
| Database|TTL(ms)|SchemaReplicationFactor|DataReplicationFactor|TimePartitionInterval|
+---------+-------+-----------------------+---------------------+---------------------+
|test_prop|    300|                      1|                    3|               100000|
|    test2|    300|                      1|                    1|            604800000|
+---------+-------+-----------------------+---------------------+---------------------+

IoTDB> show databases details
+---------+-------+-----------------------+---------------------+---------------------+-----+
| Database|TTL(ms)|SchemaReplicationFactor|DataReplicationFactor|TimePartitionInterval|Model|
+---------+-------+-----------------------+---------------------+---------------------+-----+
|test_prop|    300|                      1|                    3|               100000|TABLE|
|    test2|    300|                      1|                    1|            604800000| TREE|
+---------+-------+-----------------------+---------------------+---------------------+-----+
IoTDB> show tables
+---------+-------+
|TableName|TTL(ms)|
+---------+-------+
|    grass|   1000|
|   bamboo|    300|
|   flower|    INF|
+---------+-------+

IoTDB> show tables details
+---------+-------+----------+
|TableName|TTL(ms)|    Status|
+---------+-------+----------+
|     bean|    300|PRE_CREATE|
|    grass|   1000|     USING|
|   bamboo|    300|     USING|
|   flower|    INF|     USING|
+---------+-------+----------+
```