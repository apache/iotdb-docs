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

# Tableless Query

## 1. Overview

Tableless query allows you to execute SQL statements without a `FROM` clause, without relying on any actual database table. It retrieves computed results, constant values, or system information, and is mainly used in scenarios such as expression evaluation, system function calls, and constant queries.

> Note: This feature is supported since V2.0.11.

## 2. Syntax

```sql
SELECT expression [ [ AS ] column_alias ]
    [, expression [ [ AS ] column_alias ] ]*;
```

Where:

- `expression`: the expression to be evaluated. It can be a constant, a mathematical function, a string function, a date-time function, or an aggregate function. Currently, only functions that take **no arguments or constant arguments only** are supported.

- `column_alias`: an optional alias for the result column, which improves the readability of query results. If no alias is specified, the system automatically generates column names such as `_col0`, `_col1`, etc.

- `SELECT *` is not supported.

- When executing `SELECT COUNT(*);`, the result is always `1`.

## 3. Examples

### 3.1 Constants and Mathematical Calculations

Query statement:

```sql
SELECT 100 + 50 AS sum_result,
  10 * 5 AS product,
  SQRT(144) AS square_root,
  ABS(-25) AS absolute_value,
  SIN(1) AS sin_value;
```

Result:

```text
+----------+-------+-----------+--------------+------------------+
|sum_result|product|square_root|absolute_value|         sin_value|
+----------+-------+-----------+--------------+------------------+
|       150|     50|       12.0|            25|0.8414709848078965|
+----------+-------+-----------+--------------+------------------+
```

### 3.2 String Functions

Query statement:

```sql
SELECT
  CONCAT('Hello', ' ', 'World') AS greeting,
  UPPER('iotdb') AS uppercase,
  LOWER('IOTDB') AS lowercase,
  LENGTH('database') AS str_length;
```

Result:

```text
+-----------+---------+---------+----------+
|   greeting|uppercase|lowercase|str_length|
+-----------+---------+---------+----------+
|Hello World|    IOTDB|    iotdb|         8|
+-----------+---------+---------+----------+
```

### 3.3 Date and Time Functions

Query statement:

```sql
SELECT NOW() AS now_time;
```

Result:

```text
+-------------+
|     now_time|
+-------------+
|1784776724555|
+-------------+
```

### 3.4 Aggregate Functions

Query statement:

```sql
SELECT
  AVG(10),
  SUM(10),
  COUNT(10),
  COUNT(*);
```

Result:

```text
+-----+-----+-----+-----+
|_col0|_col1|_col2|_col3|
+-----+-----+-----+-----+
| 10.0| 10.0|    1|    1|
+-----+-----+-----+-----+
```
