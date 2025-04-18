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

# SELECT 子句

## 1. 语法概览

```sql
SELECT setQuantifier? selectItem (',' selectItem)*

selectItem
    : expression (AS? identifier)?                          #selectSingle
    | tableName '.' ASTERISK (AS columnAliases)?            #selectAll
    | ASTERISK                                              #selectAll
    ;
setQuantifier
    : DISTINCT
    | ALL
    ;
```

- **SELECT 子句**: 指定了查询结果应包含的列，包含聚合函数（如 SUM、AVG、COUNT 等）以及窗口函数，在逻辑上最后执行。
- **DISTINCT 关键字**: `SELECT DISTINCT column_name` 确保查询结果中的值是唯一的，去除重复项。

## 2. 语法详释：

每个 `selectItem` 可以是以下形式之一：

- **表达式**: `expression [ [ AS ] column_alias ]` 定义单个输出列，可以指定列别名。
- **选择某个关系的所有列**: `relation.*` 选择某个关系的所有列，不允许使用列别名。
- **选择结果集中的所有列**: `*` 选择查询的所有列，不允许使用列别名。

`DISTINCT` 的使用场景：

- **SELECT 语句**：在 SELECT 语句中使用 DISTINCT，查询结果去除重复项。
- **聚合函数**：与聚合函数一起使用时，DISTINCT 只处理输入数据集中的非重复行。
- **GROUP BY 子句**：在 GROUP BY 子句中使用 ALL 和 DISTINCT 量词，决定是否每个重复的分组集产生不同的输出行。

## 3. 示例数据

在[示例数据页面](../Reference/Sample-Data.md)中，包含了用于构建表结构和插入数据的SQL语句，下载并在IoTDB CLI中执行这些语句，即可将数据导入IoTDB，您可以使用这些数据来测试和执行示例中的SQL语句，并获得相应的结果。

### 3.1 选择列表

#### 3.1.1 星表达式

使用星号(*)可以选取表中的所有列，**注意**，星号表达式不能被大多数函数转换，除了`count(*)`的情况。

示例：从表中选择所有列

```sql
SELECT * FROM table1;
```

执行结果如下：

```sql
+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+
|                         time|region|plant_id|device_id|model_id|maintenance|temperature|humidity|status|                   modifytime|
+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+
|2024-11-29T11:00:00.000+08:00|  上海|    3002|      100|       E|        180|       null|    45.1|  true|                         null|
|2024-11-29T18:30:00.000+08:00|  上海|    3002|      100|       E|        180|       90.0|    35.4|  true|2024-11-29T18:30:15.000+08:00|
|2024-11-28T08:00:00.000+08:00|  上海|    3001|      100|       C|         90|       85.0|    null|  null|2024-11-28T08:00:09.000+08:00|
|2024-11-28T09:00:00.000+08:00|  上海|    3001|      100|       C|         90|       null|    40.9|  true|                         null|
|2024-11-28T10:00:00.000+08:00|  上海|    3001|      100|       C|         90|       85.0|    35.2|  null|2024-11-28T10:00:11.000+08:00|
|2024-11-28T11:00:00.000+08:00|  上海|    3001|      100|       C|         90|       88.0|    45.1|  true|2024-11-28T11:00:12.000+08:00|
|2024-11-26T13:37:00.000+08:00|  北京|    1001|      100|       A|        180|       90.0|    35.1|  true|2024-11-26T13:37:34.000+08:00|
|2024-11-26T13:38:00.000+08:00|  北京|    1001|      100|       A|        180|       90.0|    35.1|  true|2024-11-26T13:38:25.000+08:00|
|2024-11-30T09:30:00.000+08:00|  上海|    3002|      101|       F|        360|       90.0|    35.2|  true|                         null|
|2024-11-30T14:30:00.000+08:00|  上海|    3002|      101|       F|        360|       90.0|    34.8|  true|2024-11-30T14:30:17.000+08:00|
|2024-11-29T10:00:00.000+08:00|  上海|    3001|      101|       D|        360|       85.0|    null|  null|2024-11-29T10:00:13.000+08:00|
|2024-11-27T16:38:00.000+08:00|  北京|    1001|      101|       B|        180|       null|    35.1|  true|2024-11-26T16:37:01.000+08:00|
|2024-11-27T16:39:00.000+08:00|  北京|    1001|      101|       B|        180|       85.0|    35.3|  null|                         null|
|2024-11-27T16:40:00.000+08:00|  北京|    1001|      101|       B|        180|       85.0|    null|  null|2024-11-26T16:37:03.000+08:00|
|2024-11-27T16:41:00.000+08:00|  北京|    1001|      101|       B|        180|       85.0|    null|  null|2024-11-26T16:37:04.000+08:00|
|2024-11-27T16:42:00.000+08:00|  北京|    1001|      101|       B|        180|       null|    35.2| false|                         null|
|2024-11-27T16:43:00.000+08:00|  北京|    1001|      101|       B|        180|       null|    null| false|                         null|
|2024-11-27T16:44:00.000+08:00|  北京|    1001|      101|       B|        180|       null|    null| false|2024-11-26T16:37:08.000+08:00|
+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+
Total line number = 18
It costs 0.653s
```

#### 3.1.2 聚合函数

聚合函数将多行数据汇总为单个值。当 SELECT 子句中存在聚合函数时，查询将被视为聚合查询。在聚合查询中，所有表达式必须是聚合函数的一部分或由[GROUP BY子句](../SQL-Manual/GroupBy-Clause.md)指定的分组的一部分。

示例1：返回地址表中的总行数：

```sql
SELECT count(*) FROM table1;
```

执行结果如下：

```sql
+-----+
|_col0|
+-----+
|   18|
+-----+
Total line number = 1
It costs 0.091s
```

示例2：返回按城市分组的地址表中的总行数：

```sql
SELECT region, count(*) 
  FROM table1 
  GROUP BY region;
```

执行结果如下：

```sql
+------+-----+
|region|_col1|
+------+-----+
|  上海|    9|
|  北京|    9|
+------+-----+
Total line number = 2
It costs 0.071s
```

#### 3.1.3 别名

关键字`AS`：为选定的列指定别名，别名将覆盖已存在的列名，以提高查询结果的可读性。

示例1：原始表格：

```sql
IoTDB> SELECT * FROM table1;
```

执行结果如下：

```sql
+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+
|                         time|region|plant_id|device_id|model_id|maintenance|temperature|humidity|status|                   modifytime|
+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+
|2024-11-29T11:00:00.000+08:00|  上海|    3002|      100|       E|        180|       null|    45.1|  true|                         null|
|2024-11-29T18:30:00.000+08:00|  上海|    3002|      100|       E|        180|       90.0|    35.4|  true|2024-11-29T18:30:15.000+08:00|
|2024-11-28T08:00:00.000+08:00|  上海|    3001|      100|       C|         90|       85.0|    null|  null|2024-11-28T08:00:09.000+08:00|
|2024-11-28T09:00:00.000+08:00|  上海|    3001|      100|       C|         90|       null|    40.9|  true|                         null|
|2024-11-28T10:00:00.000+08:00|  上海|    3001|      100|       C|         90|       85.0|    35.2|  null|2024-11-28T10:00:11.000+08:00|
|2024-11-28T11:00:00.000+08:00|  上海|    3001|      100|       C|         90|       88.0|    45.1|  true|2024-11-28T11:00:12.000+08:00|
|2024-11-26T13:37:00.000+08:00|  北京|    1001|      100|       A|        180|       90.0|    35.1|  true|2024-11-26T13:37:34.000+08:00|
|2024-11-26T13:38:00.000+08:00|  北京|    1001|      100|       A|        180|       90.0|    35.1|  true|2024-11-26T13:38:25.000+08:00|
|2024-11-30T09:30:00.000+08:00|  上海|    3002|      101|       F|        360|       90.0|    35.2|  true|                         null|
|2024-11-30T14:30:00.000+08:00|  上海|    3002|      101|       F|        360|       90.0|    34.8|  true|2024-11-30T14:30:17.000+08:00|
|2024-11-29T10:00:00.000+08:00|  上海|    3001|      101|       D|        360|       85.0|    null|  null|2024-11-29T10:00:13.000+08:00|
|2024-11-27T16:38:00.000+08:00|  北京|    1001|      101|       B|        180|       null|    35.1|  true|2024-11-26T16:37:01.000+08:00|
|2024-11-27T16:39:00.000+08:00|  北京|    1001|      101|       B|        180|       85.0|    35.3|  null|                         null|
|2024-11-27T16:40:00.000+08:00|  北京|    1001|      101|       B|        180|       85.0|    null|  null|2024-11-26T16:37:03.000+08:00|
|2024-11-27T16:41:00.000+08:00|  北京|    1001|      101|       B|        180|       85.0|    null|  null|2024-11-26T16:37:04.000+08:00|
|2024-11-27T16:42:00.000+08:00|  北京|    1001|      101|       B|        180|       null|    35.2| false|                         null|
|2024-11-27T16:43:00.000+08:00|  北京|    1001|      101|       B|        180|       null|    null| false|                         null|
|2024-11-27T16:44:00.000+08:00|  北京|    1001|      101|       B|        180|       null|    null| false|2024-11-26T16:37:08.000+08:00|
+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+
Total line number = 18
It costs 0.653s
```

示例2：单列设置别名：

```sql
IoTDB> SELECT device_id 
         AS device 
         FROM table1;
```

执行结果如下：

```sql
+------+
|device|
+------+
|   100|
|   100|
|   100|
|   100|
|   100|
|   100|
|   100|
|   100|
|   101|
|   101|
|   101|
|   101|
|   101|
|   101|
|   101|
|   101|
|   101|
|   101|
+------+
Total line number = 18
It costs 0.053s
```

示例3：所有列的别名：

```sql
IoTDB> SELECT table1.* 
         AS (timestamp, Reg, Pl, DevID, Mod, Mnt, Temp, Hum, Stat,MTime) 
         FROM table1;
```

执行结果如下：

```sql
+-----------------------------+----+----+-----+---+---+----+----+-----+-----------------------------+
|                    TIMESTAMP| REG|  PL|DEVID|MOD|MNT|TEMP| HUM| STAT|                        MTIME|
+-----------------------------+----+----+-----+---+---+----+----+-----+-----------------------------+
|2024-11-29T11:00:00.000+08:00|上海|3002|  100|  E|180|null|45.1| true|                         null|
|2024-11-29T18:30:00.000+08:00|上海|3002|  100|  E|180|90.0|35.4| true|2024-11-29T18:30:15.000+08:00|
|2024-11-28T08:00:00.000+08:00|上海|3001|  100|  C| 90|85.0|null| null|2024-11-28T08:00:09.000+08:00|
|2024-11-28T09:00:00.000+08:00|上海|3001|  100|  C| 90|null|40.9| true|                         null|
|2024-11-28T10:00:00.000+08:00|上海|3001|  100|  C| 90|85.0|35.2| null|2024-11-28T10:00:11.000+08:00|
|2024-11-28T11:00:00.000+08:00|上海|3001|  100|  C| 90|88.0|45.1| true|2024-11-28T11:00:12.000+08:00|
|2024-11-26T13:37:00.000+08:00|北京|1001|  100|  A|180|90.0|35.1| true|2024-11-26T13:37:34.000+08:00|
|2024-11-26T13:38:00.000+08:00|北京|1001|  100|  A|180|90.0|35.1| true|2024-11-26T13:38:25.000+08:00|
|2024-11-30T09:30:00.000+08:00|上海|3002|  101|  F|360|90.0|35.2| true|                         null|
|2024-11-30T14:30:00.000+08:00|上海|3002|  101|  F|360|90.0|34.8| true|2024-11-30T14:30:17.000+08:00|
|2024-11-29T10:00:00.000+08:00|上海|3001|  101|  D|360|85.0|null| null|2024-11-29T10:00:13.000+08:00|
|2024-11-27T16:38:00.000+08:00|北京|1001|  101|  B|180|null|35.1| true|2024-11-26T16:37:01.000+08:00|
|2024-11-27T16:39:00.000+08:00|北京|1001|  101|  B|180|85.0|35.3| null|                         null|
|2024-11-27T16:40:00.000+08:00|北京|1001|  101|  B|180|85.0|null| null|2024-11-26T16:37:03.000+08:00|
|2024-11-27T16:41:00.000+08:00|北京|1001|  101|  B|180|85.0|null| null|2024-11-26T16:37:04.000+08:00|
|2024-11-27T16:42:00.000+08:00|北京|1001|  101|  B|180|null|35.2|false|                         null|
|2024-11-27T16:43:00.000+08:00|北京|1001|  101|  B|180|null|null|false|                         null|
|2024-11-27T16:44:00.000+08:00|北京|1001|  101|  B|180|null|null|false|2024-11-26T16:37:08.000+08:00|
+-----------------------------+----+----+-----+---+---+----+----+-----+-----------------------------+
Total line number = 18
It costs 0.189s
```

## 4. 结果集列顺序

- **列顺序**: 结果集中的列顺序与 SELECT 子句中指定的顺序相同。
- **多列排序**: 如果选择表达式返回多个列，它们的排序方式与源关系中的排序方式相同