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

# 写入&更新

## 1. 数据写入

### 1.1 语法

在 IoTDB 中，数据写入遵循以下通用语法：

```SQL
INSERT INTO <TABLE_NAME> [(COLUMN_NAME[, COLUMN_NAME]*)]? VALUES (COLUMN_VALUE[, COLUMN_VALUE]*)
```

基本约束包括：

1. 通过 insert 语句写入无法自动创建表。
2. 未指定的标签列将自动填充为 `null`。
3. 未包含时间戳，系统将使用当前时间 `now()` 进行填充。
4. 若当前设备（由标识信息定位）不存在该属性列的值，执行写入操作将导致原有的空值（NULL）被写入的数据所替代。
5. 若当前设备（由标识信息定位）已有属性列的值，再次写入相同的属性列时，系统将更新该属性列的值为新数据。
6. 写入重复时间戳，原时间戳对应列的值会更新。
7. 若 INSERT 语句未指定列名（如 INSERT INTO table VALUES (...)），则 VALUES中的值必须严格按表中列的物理顺序排列（顺序可通过 DESC table命令查看）。

由于属性一般并不随时间的变化而变化，因此推荐以 update 的方式单独更新属性值，参见下文 [数据更新](#数据更新)。

<div style="text-align: center;">
  <img src="/img/WriteData01.png" alt="" style="width: 70%;"/>
</div>


### 1.2 通过 Session 写入自动创建表

在通过 Session 进行数据写入时，IoTDB 支持无模式写入：无需事先手动创建表，系统会根据写入请求中的信息自动构建表结构，之后直接执行数据写入操作。

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

### 1.3 指定列写入

在写入操作中，可以指定部分列，未指定的列将不会被写入任何内容（即设置为 `null`）。

**示例：**

```SQL
INSERT INTO table1(region, plant_id, device_id, time, temperature, humidity) VALUES ('北京', '1001', '100', '2025-11-26 13:37:00', 90.0, 35.1)

INSERT INTO table1(region, plant_id, device_id, time, temperature) VALUES ('北京', '1001', '100', '2025-11-26 13:38:00', 91.0)
```

### 1.4 空值写入

标签列、属性列和测点列可以指定空值（`null`），表示不写入任何内容。

**示例（与上述事例等价）：**

```SQL
# 上述部分列写入等价于如下的带空值写入
INSERT INTO table1(region, plant_id, device_id, model_id, maintenance, time, temperature, humidity) VALUES ('北京', '1001', '100', null, null, '2025-11-26 13:37:00', 90.0, 35.1)

INSERT INTO table1(region, plant_id, device_id, model_id, maintenance, time, temperature, humidity) VALUES ('北京', '1001', '100', null, null, '2025-11-26 13:38:00', 91.0, null)
```

当向不包含任何标签列的表中写入数据时，系统将默认创建一个所有标签列值均为 null 的device。

> 注意，该操作不仅会自动为表中已有的标签列填充 null 值，而且对于未来新增的标签列，同样会自动填充 null。

### 1.5 多行写入

支持同时写入多行数据，提高数据写入效率。

**示例：**

```SQL
INSERT INTO table1
VALUES 
('2025-11-26 13:37:00', '北京', '1001', '100', 'A', '180', 90.0, 35.1, true, '2025-11-26 13:37:34'),
('2025-11-26 13:38:00', '北京', '1001', '100', 'A', '180', 90.0, 35.1, true, '2025-11-26 13:38:25')

INSERT INTO table1
(region, plant_id, device_id, model_id, maintenance, time, temperature, humidity, status, arrival_time) 
VALUES 
('北京', '1001', '100', 'A', '180', '2025-11-26 13:37:00', 90.0, 35.1, true, '2025-11-26 13:37:34'),
('北京', '1001', '100', 'A', '180', '2025-11-26 13:38:00', 90.0, 35.1, true, '2025-11-26 13:38:25')
```

#### 注意事项

- 如果在 SQL 语句中引用了表中不存在的列，IoTDB 将返回错误码 `COLUMN_NOT_EXIST(616)`。
- 如果写入的数据类型与表中列的数据类型不一致，将报错 `DATA_TYPE_MISMATCH(507)`。 

### 1.6 查询写回

IoTDB 表模型支持追加查询写回功能，即`INSERT INTO QUERY` 语句，支持将查询结果写入**已经存在**的表中。

> 注意：该功能从 V 2.0.6 版本开始提供。

#### 1.6.1 语法定义

```SQL
INSERT INTO table_name [ ( column [, ... ] ) ] query
```

其中**​ ​query** 支持三种形式，下面将通过示例进行说明。

以[示例数据](../Reference/Sample-Data.md)为源数据，先创建目标表

```SQL
IoTDB:database1> CREATE TABLE target_table ( time TIMESTAMP TIME, region STRING TAG, device_id STRING TAG, temperature FLOAT FIELD );
Msg: The statement is executed successfully.
```

1. 通过标准查询语句写回

即 query 处为直接通过`select ... from ...`执行的查询。

例如：使用标准查询语句，将 table1 中北京地区的 time, region, device\_id, temperature 数据查询写回到 target\_table 中

```SQL
IoTDB:database1> insert into target_table select time,region,device_id,temperature from table1 where region = '北京'
Msg: The statement is executed successfully.
IoTDB:database1> select * from target_table where region='北京'
+-----------------------------+------+---------+-----------+
|                         time|region|device_id|temperature|
+-----------------------------+------+---------+-----------+
|2024-11-26T13:37:00.000+08:00|  北京|      100|       90.0|
|2024-11-26T13:38:00.000+08:00|  北京|      100|       90.0|
|2024-11-27T16:38:00.000+08:00|  北京|      101|       null|
|2024-11-27T16:39:00.000+08:00|  北京|      101|       85.0|
|2024-11-27T16:40:00.000+08:00|  北京|      101|       85.0|
|2024-11-27T16:41:00.000+08:00|  北京|      101|       85.0|
|2024-11-27T16:42:00.000+08:00|  北京|      101|       null|
|2024-11-27T16:43:00.000+08:00|  北京|      101|       null|
|2024-11-27T16:44:00.000+08:00|  北京|      101|       null|
+-----------------------------+------+---------+-----------+
Total line number = 9
It costs 0.029s
```

2. 通过表引用查询写回

即 query 处为表引用方式`table source_table`。

例如：使用表引用查询，将 table3 中的数据查询写回到 target\_table 中

```SQL
IoTDB:database1> insert into target_table(time,device_id,temperature) table table3
Msg: The statement is executed successfully.
IoTDB:database1> select * from target_table where region is null
+-----------------------------+------+---------+-----------+
|                         time|region|device_id|temperature|
+-----------------------------+------+---------+-----------+
|2025-05-13T00:00:00.001+08:00|  null|       d1|       90.0|
|2025-05-13T00:00:01.002+08:00|  null|       d1|       85.0|
|2025-05-13T00:00:02.101+08:00|  null|       d1|       85.0|
|2025-05-13T00:00:03.201+08:00|  null|       d1|       null|
|2025-05-13T00:00:04.105+08:00|  null|       d1|       90.0|
|2025-05-13T00:00:05.023+08:00|  null|       d1|       85.0|
|2025-05-13T00:00:06.129+08:00|  null|       d1|       90.0|
+-----------------------------+------+---------+-----------+
Total line number = 7
It costs 0.015s
```

3. 通过子查询写回

即 query 处为带括号的子查询。

例如：使用子查询，将 table1 中时间与 table2 上海地区记录匹配的数据的 time, region, device\_id, temperature 查询写回到 target\_table

```SQL
IoTDB:database1> insert into target_table (select t1.time, t1.region as region, t1.device_id as device_id, t1.temperature as temperature from table1 t1 where t1.time in (select t2.time from table2 t2 where t2.region = '上海'))
Msg: The statement is executed successfully.
IoTDB:database1> select * from target_table where region = '上海'
+-----------------------------+------+---------+-----------+
|                         time|region|device_id|temperature|
+-----------------------------+------+---------+-----------+
|2024-11-28T08:00:00.000+08:00|  上海|      100|       85.0|
|2024-11-29T11:00:00.000+08:00|  上海|      100|       null|
+-----------------------------+------+---------+-----------+
Total line number = 2
It costs 0.014s
```

#### 1.6.2 相关说明

* 允许 query 中的源表与目标表 table\_name 是同一个表，例如：`INSERT INTO testtb SELECT * FROM testtb`。
* 目标表必须已存在，否则提示错误信息`550: Table 'xxx.xxx' does not exist`。
* 查询返回列和目标表列的数量和类型需完全匹配，目前不支持兼容类型的转换，若类型不匹配则提示错误信息 `701: Insert query has mismatched column types`。
* 允许指定目标表的部分列，指定目标表列名时需符合以下规则：
    * 必须包含时间戳列，否则提示错误信息`701: time column can not be null`
    * 必须包含至少一个 FIELD 列，否则提示错误信息`701: No Field column present`
    * 允许不指定 TAG 列
    * 允许指定列数少于目标表列数，缺失列自动补为 NULL 值
* JAVA 支持使用 [executeNonQueryStatement](../API/Programming-Java-Native-API_timecho.md#_3-1-itablesession接口) 方法执行`INSERT INTO QUERY`。
* REST 支持[/rest/table/v1/nonQuery](../API/RestServiceV1.md#_3-3-非查询接口)API 执行`INSERT INTO QUERY`。
* `INSERT INTO QUERY`不支持 Explain 和 Explain Analyze。
* 用户必须有下列权限才能正常执行查询写回语句：
    * 对查询语句中的源表具有 `SELECT` 权限。
    * 对目标表具有`WRITE`权限。
    * 更多用户权限相关的内容，请参考[权限管理](../User-Manual/Authority-Management_timecho.md)。


## 2. 数据更新

### 2.1 语法

```SQL
UPDATE <TABLE_NAME> SET updateAssignment (',' updateAssignment)* (WHERE where=booleanExpression)?

updateAssignment
    : identifier EQ expression
    ;
```

1. `update`语句仅允许修改属性（ATTRIBUTE）列的值。
2.  `WHERE` 的规则：
    - 范围仅限于标签列（TAG）和属性列（ATTRIBUTE），不允许涉及测点列（FIELD）和时间列（TIME）。
    - 不允许使用聚合函数
3. 执行 SET 操作后，赋值表达式的结果应当是字符串类型，且其使用的限制应与 WHERE 子句中的表达式相同。
4. 属性（ATTRIBUTE）列以及测点（FIELD）列的值也可通过`insert`语句来实现指定行的更新。

**示例：**

```SQL
update table1 set b = a where substring(a, 1, 1) like '%'
```