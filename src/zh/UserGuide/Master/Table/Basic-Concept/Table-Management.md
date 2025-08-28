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

# 表管理

## 1. 表管理

### 1.1 创建表

#### 1.1.1 通过 Create 语句手动创建表

用于在当前数据库中创建表，也可以对任何指定数据库创建表，格式为“数据库名.表名”。

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

**说明：**

1. 在创建表时，可以不指定时间列（TIME），IoTDB会自动添加该列。其他所有列可以通过在数据库配置时启用`enable_auto_create_schema`选项，或通过 session 接口自动创建或修改表的语句来添加。
2. 列的类别可以省略，默认为`FIELD`。当列的类别为`TAG`或`ATTRIBUTE`时，数据类型需为`STRING`（可省略）。
3. 表的TTL默认为其所在数据库的TTL。如果使用默认值，可以省略此属性，或将其设置为`default`。
4. <TABLE_NAME>表名称，具有以下特性：
   - 大小写不敏感
   - 名称可包含特殊字符，如  `~!`"%` 等 
   - 包含特殊字符或中文字符的数据库名创建时必须用双引号 "" 括起来。
   - 当为表命名时，最外层的双引号（`""`）不会在实际创建的表名中出现。
   - ```SQL
      "a""b" --> a"b
      """""" --> ""
      ```
5. columnDefinition 列名称与表名称具有相同特性，并且可包含特殊字符`.`。
6. COMMENT 给表添加注释。

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

#### 1.1.2 通过 Session 写入自动创建表

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
  List<ColumnCategory> columnTypeList =
      new ArrayList<>(
          Arrays.asList(
              ColumnCategory.TAG,
              ColumnCategory.TAG,
              ColumnCategory.TAG,
              ColumnCategory.ATTRIBUTE,
              ColumnCategory.FIELD,
              ColumnCategory.FIELD));
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
+-----------+---------+-----------+-------+
| ColumnName| DataType|   Category|Comment|
+-----------+---------+-----------+-------+
|       time|TIMESTAMP|       TIME|   null|
|  region_id|   STRING|        TAG|   null|
|   plant_id|   STRING|        TAG|   null|
|  device_id|   STRING|        TAG|   null|
|      model|   STRING|  ATTRIBUTE|   null|
|temperature|    FLOAT|      FIELD|   null|
|   humidity|   DOUBLE|      FIELD|   null|
+-----------+---------+-----------+-------+
```

### 1.2 查看表

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

### 1.3 查看表的列

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

### 1.4 修改表

用于修改表，包括添加列、删除列以及设置表的属性。

**语法：**

```SQL
ALTER TABLE (IF EXISTS)? tableName=qualifiedName ADD COLUMN (IF NOT EXISTS)? column=columnDefinition COMMENT 'column_comment'               #addColumn
| ALTER TABLE (IF EXISTS)? tableName=qualifiedName DROP COLUMN (IF EXISTS)? column=identifier                    #dropColumn
// set TTL can use this
| ALTER TABLE (IF EXISTS)? tableName=qualifiedName SET PROPERTIES propertyAssignments                #setTableProperties
| COMMENT ON TABLE tableName=qualifiedName IS 'table_comment'
| COMMENT ON COLUMN tableName.column IS 'column_comment'
```

**说明：**

1. `SET PROPERTIES`操作目前仅支持对表的 TTL 属性进行配置。
2. 删除列功能，仅支持删除属性列(ATTRIBUTE)和物理量列(FIELD)，标识列(TAG)不支持删除。
3. 修改后的 comment 会覆盖原有注释，如果指定为 null，则会擦除之前的 comment。

**示例:** 

```SQL
ALTER TABLE tableB ADD COLUMN IF NOT EXISTS a TAG COMMENT 'a'
ALTER TABLE tableB set properties TTL=3600
COMMENT ON TABLE table1 IS 'table1'
COMMENT ON COLUMN table1.a IS null
```

### 1.5 删除表

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