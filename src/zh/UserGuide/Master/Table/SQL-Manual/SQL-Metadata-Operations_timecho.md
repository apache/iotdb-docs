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

# 元数据操作

## 1. 数据库管理

### 1.1 创建数据库

**语法：**

```SQL
CREATE DATABASE (IF NOT EXISTS)? <DATABASE_NAME> (WITH properties)?
```

更多详细语法说明请参考：[创建数据库](../Basic-Concept/Database-Management_timecho.md#_1-1-创建数据库)

**示例：**

```SQL
CREATE DATABASE database1;
CREATE DATABASE IF NOT EXISTS database1;

-- 创建一个名为 database1 的数据库，并将数据库的TTL时间设置为1年。
CREATE DATABASE IF NOT EXISTS database1 with(TTL=31536000000);
```

### 1.2 使用数据库

**语法：**

```SQL
USE <DATABASE_NAME>
```

**示例:**

```SQL
USE database1
```

### 1.3 查看当前数据库

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

IoTDB> USE test;

IoTDB> SHOW CURRENT_DATABASE;
+---------------+
|CurrentDatabase|
+---------------+
|   iot_database|
+---------------+
```

### 1.4 查看所有数据库

**语法：**

```SQL
SHOW DATABASES (DETAILS)?
```

更多返回结果详细说明请参考：[查看所有数据库](../Basic-Concept/Database-Management_timecho.md#_1-4-查看所有数据库)

**示例:**

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

### 1.5 修改数据库

**语法：**

```SQL
ALTER DATABASE (IF EXISTS)? database=identifier SET PROPERTIES propertyAssignments
```

**示例:**

```SQL
ALTER DATABASE database1 SET PROPERTIES TTL=31536000000;
```

### 1.6 删除数据库

**语法：**

```SQL
DROP DATABASE (IF EXISTS)? <DATABASE_NAME>
```

**示例:**

```SQL
DROP DATABASE IF EXISTS database1
```

## 2. 表管理

### 2.1 创建表

**语法：**

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

更多详细语法说明请参考：[创建表](../Basic-Concept/Table-Management_timecho.md#_1-1-创建表)

**示例:**

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
  status Boolean FIELD COMMENT 'status',
  arrival_time TIMESTAMP FIELD COMMENT 'arrival_time'
) COMMENT 'table1' WITH (TTL=31536000000);

CREATE TABLE if not exists table2 ();

CREATE TABLE tableC (
  "场站" STRING TAG,
  "温度" int32 FIELD COMMENT 'temperature'
 ) with (TTL=DEFAULT);
```

### 2.2 查看表

**语法：**

```SQL
SHOW TABLES (DETAILS)? ((FROM | IN) database_name)?
```

**示例:**

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

### 2.3 查看表的列

**语法：**

```SQL
(DESC | DESCRIBE) <TABLE_NAME> (DETAILS)?
```

**示例:**

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

### 2.4 修改表

**语法：**

```SQL
ALTER TABLE (IF EXISTS)? tableName=qualifiedName ADD COLUMN (IF NOT EXISTS)? column=columnDefinition COMMENT 'column_comment'               #addColumn
| ALTER TABLE (IF EXISTS)? tableName=qualifiedName DROP COLUMN (IF EXISTS)? column=identifier                    #dropColumn
// set TTL can use this
| ALTER TABLE (IF EXISTS)? tableName=qualifiedName SET PROPERTIES propertyAssignments                #setTableProperties
| COMMENT ON TABLE tableName=qualifiedName IS 'table_comment'
| COMMENT ON COLUMN tableName.column IS 'column_comment'
```

**示例:**

```SQL
ALTER TABLE tableB ADD COLUMN IF NOT EXISTS a TAG COMMENT 'a'
ALTER TABLE tableB set properties TTL=3600
COMMENT ON TABLE table1 IS 'table1'
COMMENT ON COLUMN table1.a IS null
```

### 2.5 删除表

**语法：**

```SQL
DROP TABLE (IF EXISTS)? <TABLE_NAME>
```

**示例:**

```SQL
DROP TABLE tableA
DROP TABLE test.tableB
```


