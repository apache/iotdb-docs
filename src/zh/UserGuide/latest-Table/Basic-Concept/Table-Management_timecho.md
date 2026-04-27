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

在开始使用表管理功能前，推荐您先了解以下相关预备知识，以便更好地理解和应用表管理功能：
* [时序数据模型](../Background-knowledge/Navigating_Time_Series_Data_timecho.md)：了解时序数据的基本概念与特点，帮助建立建模基础。
* [建模方案设计](../Background-knowledge/Data-Model-and-Terminology_timecho.md)：掌握 IoTDB 时序模型及适用场景，为表管理提供设计基础。

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

1. 在创建表时，可以不指定时间列（TIME），IoTDB会自动添加该列并命名为"time"， 且顺序上位于第一列。其他所有列可以通过在数据库配置时启用`enable_auto_create_schema`选项，或通过 session 接口自动创建或修改表的语句来添加。
2. 自 V2.0.8.2 版本起，支持创建表时自定义命名时间列，自定义时间列在表中的顺序由创建 SQL 中的顺序决定。相关约束如下：
- 当列分类（columnCategory）设为 TIME 时，数据类型（dataType）必须为 TIMESTAMP。
- 每张表最多允许定义 1个时间列（columnCategory = TIME）。
- 当未显式定义时间列时，不允许其他列使用 time 作为名称，否则会与系统默认时间列命名冲突。
3. 列的类别可以省略，默认为`FIELD`。当列的类别为`TAG`或`ATTRIBUTE`时，数据类型需为`STRING`（可省略）。
4. 表的TTL默认为其所在数据库的TTL。如果使用默认值，可以省略此属性，或将其设置为`default`。
5. <TABLE_NAME>表名称，具有以下特性：
   - 大小写不敏感，创建成功后，统一显示为小写
   - 名称可包含特殊字符，如  `~!`"%` 等 
   - 包含特殊字符或中文字符的表名创建时必须用双引号 "" 括起来。
       - 注意：SQL中特殊字符或中文表名需加双引号。原生API中无需额外添加，否则表名会包含引号字符。
   - 当为表命名时，最外层的双引号（`""`）不会在实际创建的表名中出现。

   - ```shell
      -- SQL 中
      "a""b" --> a"b
      """""" --> ""
      -- API 中
      "a""b" --> "a""b"
      ```
6. columnDefinition 列名称与表名称具有相同特性，并且可包含特殊字符`.`。
7. COMMENT 给表添加注释。

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

CREATE TABLE if not exists tableB ();

CREATE TABLE tableC (
  station STRING TAG,
  temperature int32 FIELD COMMENT 'temperature'
 ) with (TTL=DEFAULT);
 
  -- 自定义时间列:命名为time_test, 位于表的第二列
 CREATE TABLE table1 (
     region STRING TAG, 
     time_user_defined TIMESTAMP TIME, 
     temperature FLOAT FIELD
 );
```

注意：若您使用的终端不支持多行粘贴（例如 Windows CMD），请将 SQL 语句调整为单行格式后再执行。

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
show tables from database1;
```
```shell
+---------+---------------+
|TableName|        TTL(ms)|
+---------+---------------+
|   table1|    31536000000|
+---------+---------------+
```
```sql
show tables details from database1;
```
```shell
+---------------+-----------+------+-------+
|      TableName|    TTL(ms)|Status|Comment|
+---------------+-----------+------+-------+
|         table1|31536000000| USING| table1|
+---------------+-----------+------+-------+
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
desc table1;
```
```shell
+------------+---------+---------+
|  ColumnName| DataType| Category|
+------------+---------+---------+
|        time|TIMESTAMP|     TIME|
|      region|   STRING|      TAG|
|    plant_id|   STRING|      TAG|
|   device_id|   STRING|      TAG|
|    model_id|   STRING|ATTRIBUTE|
| maintenance|   STRING|ATTRIBUTE|
| temperature|    FLOAT|    FIELD|
|    humidity|    FLOAT|    FIELD|
|      status|  BOOLEAN|    FIELD|
|arrival_time|TIMESTAMP|    FIELD|
+------------+---------+---------+
```
```sql
desc table1 details;
```
```shell
+------------+---------+---------+------+------------+
|  ColumnName| DataType| Category|Status|     Comment|
+------------+---------+---------+------+------------+
|        time|TIMESTAMP|     TIME| USING|        null|
|      region|   STRING|      TAG| USING|        null|
|    plant_id|   STRING|      TAG| USING|        null|
|   device_id|   STRING|      TAG| USING|        null|
|    model_id|   STRING|ATTRIBUTE| USING|        null|
| maintenance|   STRING|ATTRIBUTE| USING| maintenance|
| temperature|    FLOAT|    FIELD| USING| temperature|
|    humidity|    FLOAT|    FIELD| USING|    humidity|
|      status|  BOOLEAN|    FIELD| USING|      status|
|arrival_time|TIMESTAMP|    FIELD| USING|arrival_time|
+------------+---------+---------+------+------------+
```


### 1.4 查看表的创建信息

用于获取表模型下表或视图的完整定义语句。该功能会自动补全创建时省略的所有默认值，因此结果集中所展示的语句可能与原始创建语句不同。

> V2.0.5 起支持该功能

**语法：**

```SQL
SHOW CREATE TABLE <TABLE_NAME>
```

**说明：**

1. 该语句不支持对系统表的查询

**示例:**

```SQL
show create table table1;
```
```shell
+------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table|                                                                                                                                                                                                                                                                     Create Table|
+------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
|table1|CREATE TABLE "table1" ("region" STRING TAG,"plant_id" STRING TAG,"device_id" STRING TAG,"model_id" STRING ATTRIBUTE,"maintenance" STRING ATTRIBUTE,"temperature" FLOAT FIELD,"humidity" FLOAT FIELD,"status" BOOLEAN FIELD,"arrival_time" TIMESTAMP FIELD) WITH (ttl=31536000000)|
+------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
Total line number = 1
```


### 1.5 修改表

用于修改表，包括添加列、删除列、修改列类型（V2.0.8.2）以及设置表的属性。

**语法：**

```SQL
#addColumn;
ALTER TABLE (IF EXISTS)? tableName=qualifiedName ADD COLUMN (IF NOT EXISTS)? column=columnDefinition COMMENT 'column_comment';               
#dropColumn;
ALTER TABLE (IF EXISTS)? tableName=qualifiedName DROP COLUMN (IF EXISTS)? column=identifier;
#setTableProperties;                    
// set TTL can use this;
| ALTER TABLE (IF EXISTS)? tableName=qualifiedName SET PROPERTIES propertyAssignments;                
| COMMENT ON TABLE tableName=qualifiedName IS 'table_comment';
| COMMENT ON COLUMN tableName.column IS 'column_comment';
#changeColumndatatype;
| ALTER TABLE (IF EXISTS)? tableName=qualifiedName ALTER COLUMN (IF EXISTS)? column=identifier SET DATA TYPE new_type=type;
```

**说明：**

1. `SET PROPERTIES`操作目前仅支持对表的 TTL 属性进行配置。
2. 删除列功能，仅支持删除属性列(ATTRIBUTE)和物理量列(FIELD)，标识列(TAG)不支持删除。
3. 修改后的 comment 会覆盖原有注释，如果指定为 null，则会擦除之前的 comment。
4. 自 V2.0.8.2 版本起支持修改字段数据类型，目前只支持修改Category类型为FIELD的字段。
   - 变更过程中若该时间序列被并发删除，会报错提示。
   - 变更后的字段类型需要与原类型兼容，具体兼容性如下表所示：

| 原始类型  | 可变更为类型                                  |
| ----------- | ----------------------------------------------- |
| INT32     | INT64, FLOAT, DOUBLE, TIMESTAMP, STRING, TEXT |
| INT64     | TIMESTAMP, DOUBLE, STRING, TEXT               |
| FLOAT     | DOUBLE, STRING, TEXT                          |
| DOUBLE    | STRING, TEXT                                  |
| BOOLEAN   | STRING, TEXT                                  |
| TEXT      | BLOB, STRING                                  |
| STRING    | TEXT, BLOB                                    |
| BLOB      | STRING, TEXT                                  |
| DATE      | STRING, TEXT                                  |
| TIMESTAMP | INT64, DOUBLE, STRING, TEXT                   |


**示例:** 

```SQL
ALTER TABLE table1 ADD COLUMN IF NOT EXISTS a TAG COMMENT 'a';
ALTER TABLE table1 ADD COLUMN IF NOT EXISTS b FLOAT FIELD COMMENT 'b';
ALTER TABLE table1 set properties TTL=3600;
COMMENT ON TABLE table1 IS 'table1';
COMMENT ON COLUMN table1.a IS null;
ALTER TABLE table1 ALTER COLUMN IF EXISTS b SET DATA TYPE DOUBLE;
```

### 1.6 删除表

用于删除表。

**语法：**

```SQL
DROP TABLE (IF EXISTS)? <TABLE_NAME>
```

**示例:**

```SQL
DROP TABLE table1;
DROP TABLE database1.table1;
```


### 1.7 元数据查询

表模型下**测点数量**等于所有表的测点数之和，目前单表测点数可通过公式：**单表测点数 = device 数量 × field 列的数量** 计算得出，后续会支持通过 SQL 语句直接查询表模型下测点数，敬请期待。

以[示例数据](../Reference/Sample-Data.md) 中的表 table1 为例。

该示例组织架构共包含三个 tag 列（region 为区域，plant_id 为工厂，device_id 为机器）和四个 field 列（temperature 为温度，humidity 为湿度，status 为状态，arrival_time 为到达时间）。

device 的唯一标识由全部 tag 列组合而成，只要 region（区域）+ plant_id（工厂）+ device_id（机器）的组合不重复，就代表一个独立设备。

示例数据一共定义了 2 个区域，分别为：北京、上海。其中

* 北京区域：包含 1 个工厂，工厂编号 1001；
    * 该工厂下共有 2 台设备，设备编号分别为 100、101；
* 上海区域：包含 2 个工厂，工厂编号分别为 3001、3002；
    * 工厂 3001 下包含 2 台设备：100、101；
    * 工厂 3002 下包含 2 台设备：100、101。

综上，整个表一共存在 6 组唯一 tag 组合，对应 6 个独立设备。

**单表测点数完整计算示例：**

1. 查询 device 数量

```sql
IoTDB:database1> count devices from table1
+--------------+
|count(devices)|
+--------------+
|             6|
+--------------+
Total line number = 1
It costs 0.019s
```

2. 计算单表测点数量
- device 数量：6
- field 列数：4
- 单表测点总数：6 × 4 = 24

