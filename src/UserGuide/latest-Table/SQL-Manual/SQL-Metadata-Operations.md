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

# Metadata Operations

## 1. Database Management

### 1.1 Create Database

**Syntax:**

```SQL
CREATE DATABASE (IF NOT EXISTS)? <DATABASE_NAME> (WITH properties)?
```

[Detailed syntax reference](../Basic-Concept/Database-Management.md#_1-1-create-a-database)

**Examples:**

```SQL
CREATE DATABASE database1;
CREATE DATABASE IF NOT EXISTS database1;

-- Create database with 1-year TTL
CREATE DATABASE IF NOT EXISTS database1 with(TTL=31536000000);
```

### 1.2 Use Database

**Syntax:**

```SQL
USE <DATABASE_NAME>
```

**Examples:**

```SQL
USE database1
```

### 1.3 View Current Database

**Syntax:**

```SQL
SHOW CURRENT_DATABASE
```

**Examples:**

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

### 1.4 List All Databases

**Syntax:**

```SQL
SHOW DATABASES (DETAILS)?
```

[Detailed syntax reference](../Basic-Concept/Database-Management.md#_1-4-view-all-databases)

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

### 1.5 Modify Database

**Syntax:**

```SQL
ALTER DATABASE (IF EXISTS)? database=identifier SET PROPERTIES propertyAssignments
```

**Examples:**

```SQL
ALTER DATABASE database1 SET PROPERTIES TTL=31536000000;
```

### 1.6 Drop Database

**Syntax:**

```SQL
DROP DATABASE (IF EXISTS)? <DATABASE_NAME>
```

**Examples:**

```SQL
DROP DATABASE IF EXISTS database1
```

## 2. Table Management

### 2.1 Create Table

**Syntax:**

```SQL
createTableStatement
    : CREATE TABLE (IF NOT EXISTS)? qualifiedName
        '(' (columnDefinition (',' columnDefinition)*)? ')'
        charsetDesc?
        comment?
        (WITH properties)?
     ;

charsetDesc
    : DEFAULT? (CHAR SET | CHARSET | CHARACTER SET) EQ? identifierOrString
    ;

columnDefinition
    : identifier columnCategory=(TAG | ATTRIBUTE | TIME) charsetName? comment?
    | identifier type (columnCategory=(TAG | ATTRIBUTE | TIME | FIELD))? charsetName? comment?
    ;

charsetName
    : CHAR SET identifier
    | CHARSET identifier
    | CHARACTER SET identifier
    ;

comment
    : COMMENT string
    ;
```

[Detailed syntax reference](../Basic-Concept/Table-Management.md#_1-1-create-a-table)

**Examples:**

```SQL
CREATE TABLE table1 (
  time TIMESTAMP TIME,
  region STRING TAG,
  plant_id STRING TAG,
  device_id STRING TAG,
  model_id STRING ATTRIBUTE,
  maintenance STRING ATTRIBUTE COMMENT 'maintenance',
  temperature FLOAT FIELD COMMENT 'temperature',
  humidity FLOAT FIELD COMMENT 'humidity',
  status BOOLEAN FIELD COMMENT 'status',
  arrival_time TIMESTAMP FIELD COMMENT 'arrival_time'
) COMMENT 'table1' WITH (TTL=31536000000);

CREATE TABLE IF NOT EXISTS table2 ();

CREATE TABLE tableC (
  "plant" STRING TAG,
  "temperature" INT32 FIELD COMMENT 'temperature'
) WITH (TTL=DEFAULT);
```

### 2.2 List Tables

**Syntax:**

```SQL
SHOW TABLES (DETAILS)? ((FROM | IN) database_name)?
```

**Examples:**

```SQL
IoTDB> show tables from test_db
+---------+-------+-------+
|TableName|TTL(ms)|Comment|
+---------+-------+-------+
|     test|    INF|   TEST|
+---------+-------+-------+

IoTDB> show tables details from test_db
+---------+-------+----------+-------+
|TableName|TTL(ms)|    Status|Comment|
+---------+-------+----------+-------+
|     test|    INF|     USING|   TEST|
|  turbine|    INF|PRE_CREATE|   null|
|      car|   1000|PRE_DELETE|   null|
+---------+-------+----------+-------+
```

### 2.3 Describe Table Columns

**Syntax:**

```SQL
(DESC | DESCRIBE) <TABLE_NAME> (DETAILS)?
```

**Examples:**

```SQL
IoTDB> desc tableB
+----------+---------+-----------+-------+
|ColumnName| DataType|   Category|Comment|
+----------+---------+-----------+-------+
|      time|TIMESTAMP|       TIME|   null|
|         a|   STRING|        TAG|      a|
|         b|   STRING|  ATTRIBUTE|      b|
|         c|    INT32|      FIELD|      c|
+----------+---------+-----------+-------+

IoTDB> desc tableB details
+----------+---------+-----------+----------+-------+
|ColumnName| DataType|   Category|    Status|Comment|
+----------+---------+-----------+----------+-------+
|      time|TIMESTAMP|       TIME|     USING|   null|
|         a|   STRING|        TAG|     USING|      a|
|         b|   STRING|  ATTRIBUTE|     USING|      b|
|         c|    INT32|      FIELD|     USING|      c|
|         d|    INT32|      FIELD|PRE_DELETE|      d|
+----------+---------+-----------+----------+-------+
```

### 2.4 Modify Table

**Syntax:**

```SQL
ALTER TABLE (IF EXISTS)? tableName=qualifiedName ADD COLUMN (IF NOT EXISTS)? column=columnDefinition COMMENT 'column_comment'               #addColumn
| ALTER TABLE (IF EXISTS)? tableName=qualifiedName DROP COLUMN (IF EXISTS)? column=identifier                    #dropColumn
// set TTL can use this
| ALTER TABLE (IF EXISTS)? tableName=qualifiedName SET PROPERTIES propertyAssignments                #setTableProperties
| COMMENT ON TABLE tableName=qualifiedName IS 'table_comment'
| COMMENT ON COLUMN tableName.column IS 'column_comment'
```

**Examples:**

```SQL
ALTER TABLE tableB ADD COLUMN IF NOT EXISTS a TAG COMMENT 'a'
ALTER TABLE tableB set properties TTL=3600
COMMENT ON TABLE table1 IS 'table1'
COMMENT ON COLUMN table1.a IS null
```

### 2.5 Drop Table

**Syntax:**

```SQL
DROP TABLE (IF EXISTS)? <TABLE_NAME>
```

**Examples:**

```SQL
DROP TABLE tableA
DROP TABLE test.tableB
```


