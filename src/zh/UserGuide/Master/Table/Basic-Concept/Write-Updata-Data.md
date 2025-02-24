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

# 数据写入&更新

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
6. 写入重复时间戳，原时间戳为null的列会被更新，原不为null的列，保留原来列的值。

由于属性一般并不随时间的变化而变化，因此推荐以 update 的方式单独更新属性值，参见下文 [数据更新](#数据更新)。

<div style="text-align: center;">
  <img src="/img/WriteData01.png" alt="" style="width: 70%;"/>
</div>


### 1.2 通过 Session 写入自动创建表

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

### 1.3 指定列写入

在写入操作中，可以指定部分列，未指定的列将不会被写入任何内容（即设置为 `null`）。

**示例：**

```SQL
insert into table1("地区", "厂号", "设备号", Time, "温度", "排量") values ('湖南', '3001', '3', 4, 90.0, 1200.0)


insert into table1("地区", "厂号", "设备号", Time, "温度") values ('湖南, '3001', '3', 5, 90.0)
```

### 1.4 空值写入

标签列、属性列和测点列可以指定空值（`null`），表示不写入任何内容。

**示例（与上述事例等价）：**

```SQL
# 上述部分列写入等价于如下的带空值写入
insert into table1("地区", "厂号", "设备号", "型号", "维修周期", Time, "温度", "排量") values ('湖南', '3001', '3', null, null, 4, 90.0, 1200.0)

insert into table1("地区", "厂号", "设备号", "型号", "维修周期", Time, "温度", "排量") values ('湖南', '3001', '3', null, null, 5, 90.0, null)
```

当向不包含任何标签列的表中写入数据时，系统将默认创建一个所有标签列值均为 null 的device。

> 注意，该操作不仅会自动为表中已有的标签列填充 null 值，而且对于未来新增的标签列，同样会自动填充 null。

### 1.5 多行写入

支持同时写入多行数据，提高数据写入效率。

**示例：**

```SQL
insert into table1
values
('北京', '3001', '3', '1', '10', 4, 90.0, 1200.0),
('北京', '3001', '3', '1', '10', 5, 90.0, 1200.0);


insert into table1
("地区", "厂号", "设备号", Time, "温度", "排量")
values
('北京', '3001', '3', 4, 90.0, 1200.0),
('北京', '3001', '3', 5, 90.0, 1200.0);
```

#### 注意事项

- 如果在 SQL 语句中引用了表中不存在的列，IoTDB 将返回错误码 `COLUMN_NOT_EXIST(616)`。
- 如果写入的数据类型与表中列的数据类型不一致，将报错 `DATA_TYPE_MISMATCH(507)`。

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