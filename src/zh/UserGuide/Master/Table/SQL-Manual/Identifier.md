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

# 标识符

在 IoTDB 中，标识符用于标识 database、table、column、function 或其他对象名称。

## 1 命名规则

- __开头字符__：标识符必须以字母开头。
- __后续字符__：可以包含字母、数字和下划线。
- __特殊字符__：如果标识符包含除字母、数字和下划线之外的其他字符，必须用双引号（`"`）括起来。
- __转义字符__：在双引号定界的标识符中，使用两个连续的双引号（`""`）来表示一个双引号字符。

### 1.1 示例

以下是一些有效的标识符示例：

```sql
test
"table$partitions"
"identifierWith"
"double"
"quotes"
```

无效的标识符示例，使用时必须用双引号引用：

```sql
table-name // 包含短横线
123SchemaName // 以数字开头
colum$name@field  // 包含特殊字符且未用双引号括起
```

## 2 大小写敏感性

标识符不区分大小写，且系统存储标识符时不保留原始大小写，查询结果会根据用户在`SELECT`子句中指定的大小写显示列名。

> 双引号括起来的标识符也不区分大小写。

### 2.1 示例

当创建了一个名为 `Device_id` 的列，在查看表时看到为 `device_id`，但返回的结果列与用户查询时指定的格式保持相同为`Device_ID`：

```sql
IoTDB> create table table1(Device_id STRING TAG, Model STRING ATTRIBUTE, TemPerature FLOAT FIELD, Humidity DOUBLE FIELD)

IoTDB> desc table1;
+-----------+---------+-----------+
| ColumnName| DataType|   Category|
+-----------+---------+-----------+
|       time|TIMESTAMP|       TIME|
|  device_id|   STRING|        TAG|
|      model|   STRING|  ATTRIBUTE|
|temperature|    FLOAT|      FIELD|
|   humidity|   DOUBLE|      FIELD|
+-----------+---------+-----------+

IoTDB> select TiMe, Device_ID, MoDEL, TEMPerature, HUMIdity from table1;
+-----------------------------+---------+------+-----------+--------+
|                         TiMe|Device_ID| MoDEL|TEMPerature|HUMIdity|
+-----------------------------+---------+------+-----------+--------+
|1970-01-01T08:00:00.001+08:00|       d1|modelY|       27.2|    67.0|
+-----------------------------+---------+------+-----------+--------+
```