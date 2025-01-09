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

# 数据库&表管理

## 1. 数据库管理

### 1.1 创建数据库

用于创建数据库。

**语法：**

```SQL
 CREATE DATABASE (IF NOT EXISTS)? <DATABASE_NAME> (WITH properties)?
```

**说明：**

1. <DATABASE_NAME> 数据库名称，具有以下特性：
   - 大小写不敏感
   - 名称的长度不得超过 64 个字符。
   - 名称中包含下划线（_）、数字（非开头）、英文字母可以直接创建
   - 名称中包含特殊字符（如`）、中文字符、数字开头时，必须用双引号 "" 括起来。

2. WITH properties 子句可配置如下属性：

> 注：属性的大小写不敏感，且暂不支持修改，有关详细信息[大小写敏感规则](../SQL-Manual/Identifier.md#大小写敏感性)。

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
CREATE DATABASE IF NOT EXISTS database1 with(TTL=31536000000)；
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

IoTDB> USE test;

IoTDB> SHOW CURRENT_DATABASE;
+---------------+
|CurrentDatabase|
+---------------+
|   iot_database|
+---------------+
```

### 1.4 查看所有数据库

用于查看所有数据库和数据库的属性信息。

**语法：**

```SQL
SHOW DATABASES (DETAILS)?
```

**语句返回列含义如下：**

| 列名                    | 含义                                                         |
| ----------------------- | ------------------------------------------------------------ |
| database                | database名称。                                               |
| TTL                     | 数据保留周期。如果在创建数据库的时候指定TTL，则TTL对该数据库下所有表的TTL生效。也可以再通过 [create table](#创建表) 、[alter table](#修改表) 来设置或更新表的TTL时间。 |
| SchemaReplicationFactor | 元数据副本数，用于确保元数据的高可用性。可以在`iotdb-system.properties`中修改`schema_replication_factor`配置项。 |
| DataReplicationFactor   | 数据副本数，用于确保数据的高可用性。可以在`iotdb-system.properties`中修改`data_replication_factor`配置项。 |
| TimePartitionInterval   | 时间分区间隔，决定了数据在磁盘上按多长时间进行目录分组，通常采用默认1周即可。 |
| SchemaRegionGroupNum          | 使用`DETAILS`语句会返回此列，展示数据库的元数据副本组数量，一般不需要修改 |
| DataRegionGroupNum         | 使用`DETAILS`语句会返回此列，展示数据库的数据副本组数量，一般不需要修改 |

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

暂不支持，V2.0.2.1后支持

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

## 2. 表管理

### 2.1 创建表

#### 2.1.1 通过 Create 语句手动创建表

用于在当前数据库中创建表，也可以对任何指定数据库创建表，格式为“数据库名.表名”。

**语法：**

```SQL
CREATE TABLE (IF NOT EXISTS)? <TABLE_NAME>
    '(' (columnDefinition (',' columnDefinition)*)? ')'
    (WITH properties)?
    
columnDefinition
    : identifier columnCategory=(TAG | ATTRIBUTE)
    | identifier type (columnCategory=(TAG | ATTRIBUTE | TIME | FIELD))?
    ;
    
properties
    : '(' propertyAssignments ')'
    ;

propertyAssignments
    : property (',' property)*
    ;

property
    : identifier EQ propertyValue
    ;
```

**说明：**

1. 在创建表时，可以不指定时间列（TIME），IoTDB会自动添加该列。其他所有列可以通过在数据库配置时启用`enable_auto_create_schema`选项，或通过 session 接口自动创建或修改表的语句来添加。
2. 列的类别可以省略，默认为`FIELD`。当列的类别为`TAG`或`ATTRIBUTE`时，数据类型需为`STRING`（可省略）。
3. 表的TTL默认为其所在数据库的TTL。如果使用默认值，可以省略此属性，或将其设置为`default`。
4. <TABLE_NAME>表名称，具有以下特性：
   - 大小写不敏感
   - 名称可包含特殊字符，如  `~!`"%` 等 
   - 包含特殊字符如 or 中文字符的数据库名创建时必须用双引号 "" 括起来。
   - 当为表命名时，最外层的双引号（`""`）不会在实际创建的表名中出现。
   - ```SQL
      "a""b" --> a"b
      """""" --> ""
      ```
5. columnDefinition 列名称与表名称具有相同特性，并且可包含特殊字符`.`。

**示例:** 

```SQL
CREATE TABLE table1 (
  time TIMESTAMP TIME,
  region STRING TAG,
  plant_id STRING TAG,
  device_id STRING TAG,
  model_id STRING ATTRIBUTE,
  maintenance STRING ATTRIBUTE,
  temperature FLOAT FIELD,
  humidity FLOAT FIELD,
  status Boolean FIELD,
  arrival_time TIMESTAMP FIELD
) WITH (TTL=31536000000);

CREATE TABLE if not exists table2 ();

CREATE TABLE tableC (
  "场站" STRING TAG,
  "温度" int32 FIELD
 ) with (TTL=DEFAULT);
```

#### 2.1.2 通过 Session 写入自动创建表

在通过 Session 进行数据写入时，IoTDB 能够根据写入请求中的信息自动构建表结构，无需用户事先手动创建表即可直接执行数据写入操作。

**示例：**

```Java
try (ITableSession session =
    new TableSessionBuilder()
        .nodeUrls(Collections.singletonList("127.0.0.1:6667"))
        .username("root")
        .password("root")
        .build()) {

  session.executeNonQueryStatement("CREATE DATABASE db1");
  session.executeNonQueryStatement("use db1");

  // 不创建表直接写入数据
  List<String> columnNameList =
      Arrays.asList("region_id", "plant_id", "device_id", "model", "temperature", "humidity");
  List<TSDataType> dataTypeList =
      Arrays.asList(
          TSDataType.STRING,
          TSDataType.STRING,
          TSDataType.STRING,
          TSDataType.STRING,
          TSDataType.FLOAT,
          TSDataType.DOUBLE);
  List<Tablet.ColumnCategory> columnTypeList =
      new ArrayList<>(
          Arrays.asList(
              Tablet.ColumnCategory.TAG,
              Tablet.ColumnCategory.TAG,
              Tablet.ColumnCategory.TAG,
              Tablet.ColumnCategory.ATTRIBUTE,
              Tablet.ColumnCategory.FIELD,
              Tablet.ColumnCategory.FIELD));
  Tablet tablet = new Tablet("table1", columnNameList, dataTypeList, columnTypeList, 100);
  for (long timestamp = 0; timestamp < 100; timestamp++) {
    int rowIndex = tablet.getRowSize();
    tablet.addTimestamp(rowIndex, timestamp);
    tablet.addValue("region_id", rowIndex, "1");
    tablet.addValue("plant_id", rowIndex, "5");
    tablet.addValue("device_id", rowIndex, "3");
    tablet.addValue("model", rowIndex, "A");
    tablet.addValue("temperature", rowIndex, 37.6F);
    tablet.addValue("humidity", rowIndex, 111.1);
    if (tablet.getRowSize() == tablet.getMaxRowNumber()) {
      session.insert(tablet);
      tablet.reset();
    }
  }
  if (tablet.getRowSize() != 0) {
    session.insert(tablet);
    tablet.reset();
  }
}
```

在代码执行完成后，可以通过下述语句确认表已成功创建，其中包含了时间列、标签列、属性列以及测点列等各类信息。

```SQL
IoTDB> desc table1
+-----------+---------+-----------+
| ColumnName| DataType|   Category|
+-----------+---------+-----------+
|       time|TIMESTAMP|       TIME|
|  region_id|   STRING|        TAG|
|   plant_id|   STRING|        TAG|
|  device_id|   STRING|        TAG|
|      model|   STRING|  ATTRIBUTE|
|temperature|    FLOAT|      FIELD|
|   humidity|   DOUBLE|      FIELD|
+-----------+---------+-----------+
```

### 2.2 查看表

用于查看该数据库中或指定数据库中的所有表和表库的属性信息。

**语法：**

```SQL
SHOW TABLES (DETAILS)? ((FROM | IN) database_name)?
```

**说明：**

1. 在查询中指定了`FROM`或`IN`子句时，系统将展示指定数据库内的所有表。
2. 如果未指定`FROM`或`IN`子句，系统将展示当前选定数据库中的所有表。如果用户未使用（use）某个数据库空间，系统将报错。
3. 请求显示详细信息（指定`DETAILS`），系统将展示表的当前状态，包括：
   - `USING`：表示表处于正常可用状态。
   - `PRE_CREATE`：表示表正在创建中或创建失败，此时表不可用。
   - `PRE_DELETE`：表示表正在删除中或删除失败，此类表将永久不可用。

**示例:**

```SQL
IoTDB> show tables from test_db
+---------+-------+
|TableName|TTL(ms)|
+---------+-------+
|     test|    INF|
+---------+-------+

IoTDB> show tables details from test_db
+---------+-------+----------+
|TableName|TTL(ms)|    Status|
+---------+-------+----------+
|     test|    INF|     USING|
|  turbine|    INF|PRE_CREATE|
|      car|   1000|PRE_DELETE|
+---------+-------+----------+
```

### 2.3 查看表的列

用于查看表的列名、数据类型、类别、状态。

**语法：**

```SQL
(DESC | DESCRIBE) <TABLE_NAME> (DETAILS)?
```

**说明：**

- 如果设置了`DETAILS`选项，系统将展示列的详细状态信息，包括：
  - `USING`：表示列目前处于正常使用状态。
  - `PRE_DELETE`：表示列正在被删除或删除操作失败，该列将永久无法使用。

**示例:** 

```SQL
IoTDB> desc tableB
+----------+---------+-----------+
|ColumnName| DataType|   Category|
+----------+---------+-----------+
|      time|TIMESTAMP|       TIME|
|         a|   STRING|        TAG|
|         b|   STRING|  ATTRIBUTE|
|         c|    INT32|      FIELD|
+----------+---------+-----------+

IoTDB> desc tableB details
+----------+---------+-----------+----------+
|ColumnName| DataType|   Category|    Status|
+----------+---------+-----------+----------+
|      time|TIMESTAMP|       TIME|     USING|
|         a|   STRING|        TAG|     USING|
|         b|   STRING|  ATTRIBUTE|     USING|
|         c|    INT32|      FIELD|     USING|
|         d|    INT32|      FIELD|PRE_DELETE|
+----------+---------+-----------+----------+
```

### 2.4 修改表

用于修改表，包括添加列、删除列以及设置表的属性。

**语法：**

```SQL
ALTER TABLE (IF EXISTS)? tableName=qualifiedName ADD COLUMN (IF NOT EXISTS)? column=columnDefinition                #addColumn
| ALTER TABLE (IF EXISTS)? tableName=qualifiedName DROP COLUMN (IF EXISTS)? column=identifier                     #dropColumn
// set TTL can use this
| ALTER TABLE (IF EXISTS)? tableName=qualifiedName SET PROPERTIES propertyAssignments                #setTableProperties
```

**说明：**

1. `SET PROPERTIES`操作目前仅支持对表的 TTL 属性进行配置。

**示例:** 

```SQL
ALTER TABLE tableB ADD COLUMN IF NOT EXISTS a TAG
ALTER TABLE tableB set properties TTL=3600
```

### 2.5 删除表

用于删除表。

**语法：**

```SQL
DROP TABLE (IF EXISTS)? <TABLE_NAME>
```

**示例:**

```SQL
DROP TABLE tableA
DROP TABLE test.tableB
```