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

# 无表查询

## 1. 功能概述

无表查询支持在不依赖实际数据库表的情况下，直接执行不包含 `FROM` 子句的 SQL 查询语句，获取计算结果、常量值或系统信息，主要用于表达式计算、系统函数调用、常量查询等场景。

> 注意：自 V2.0.11 版本起支持该功能。

## 2. 语法定义

```sql
SELECT expression [ [ AS ] column_alias ]
    [, expression [ [ AS ] column_alias ] ]*;
```

其中：

- `expression`：待计算的表达式，可以是常量、数学函数、字符串函数、日期时间函数、聚合函数，目前支持**无参数或只需传入常量参数**的函数。

- `column_alias`：可选的结果列别名，用于提升查询结果的可读性。未指定别名时，系统会自动生成 `_col0`、`_col1` 等列名。

- 不支持使用 `SELECT *`。

- 执行 `SELECT COUNT(*);` 时，结果始终为 `1`。

## 3. 使用示例

### 3.1 常量与数学计算

查询语句：

```sql
SELECT 100 + 50 AS sum_result,
  10 * 5 AS product,
  SQRT(144) AS square_root,
  ABS(-25) AS absolute_value,
  SIN(1) AS sin_value;
```

返回结果：

```text
+----------+-------+-----------+--------------+------------------+
|sum_result|product|square_root|absolute_value|         sin_value|
+----------+-------+-----------+--------------+------------------+
|       150|     50|       12.0|            25|0.8414709848078965|
+----------+-------+-----------+--------------+------------------+
```

### 3.2 字符串函数

查询语句：

```sql
SELECT
  CONCAT('Hello', ' ', 'World') AS greeting,
  UPPER('iotdb') AS uppercase,
  LOWER('IOTDB') AS lowercase,
  LENGTH('database') AS str_length;
```

返回结果：

```text
+-----------+---------+---------+----------+
|   greeting|uppercase|lowercase|str_length|
+-----------+---------+---------+----------+
|Hello World|    IOTDB|    iotdb|         8|
+-----------+---------+---------+----------+
```

### 3.3 日期时间函数

查询语句：

```sql
SELECT NOW() AS now_time;
```

返回结果：

```text
+-------------+
|     now_time|
+-------------+
|1784776724555|
+-------------+
```

### 3.4 聚合函数

查询语句：

```sql
SELECT
  AVG(10),
  SUM(10),
  COUNT(10),
  COUNT(*);
```

返回结果：

```text
+-----+-----+-----+-----+
|_col0|_col1|_col2|_col3|
+-----+-----+-----+-----+
| 10.0| 10.0|    1|    1|
+-----+-----+-----+-----+
```
