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

# SELECT Clauses

## 1 Syntax Overview

```sql
SELECT selectItem (',' selectItem)*

selectItem
    : expression (AS? identifier)?                          #selectSingle
    | tableName '.' ASTERISK (AS columnAliases)?            #selectAll
    | ASTERISK                                              #selectAll
    ;
```

- __SELECT Clause__: SELECT Clause: Specifies the columns to be included in the query results, including aggregate functions (such as SUM, AVG, COUNT, etc.) and window functions, which are logically executed last.

## 2 Detailed Syntax:

Each `selectItem` can be one of the following forms:

- __Expression__: `expression [ [ AS ] column_alias ]` defines a single output column, and a column alias can be specified.
- __Selecting all columns of a relation__: `relation.*` selects all columns of a certain relation, and column aliases are not allowed.
- __Selecting all columns in the result set__: `*` selects all columns of the query, and column aliases are not allowed.


## 3 Example Data


In the [Example Data page](../Basic-Concept/Sample-Data.md), there are SQL statements for building the table structure and inserting data. By downloading and executing these statements in the IoTDB CLI, you can import data into IoTDB. You can use this data to test and execute the SQL statements in the examples and obtain the corresponding results.

### 3.1 Select List

#### 3.1.1 Star Expression

The asterisk (*) can be used to select all columns from a table. __Note__, the star expression cannot be transformed by most functions, except in the case of `count(*)`.

Example: Select all columns from a table


```sql
SELECT * FROM table1;
```

The execution result is as follows:

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

#### 3.1.2 Aggregate Functions

Aggregate functions summarize multiple rows of data into a single value. When the SELECT clause contains aggregate functions, the query is considered an aggregate query. In aggregate queries, all expressions must be part of an aggregate function or specified by the [GROUP BY clause](../SQL-Manual/GroupBy-Clause.md) for grouping.

Example 1: Return the total number of rows in the address table:

```sql
SELECT count(*) FROM table1;
```

The execution result is as follows:

```sql
+-----+
|_col0|
+-----+
|   18|
+-----+
Total line number = 1
It costs 0.091s
```

Example 2: Return the total number of rows in the address table grouped by city:


```sql
SELECT region, count(*) 
  FROM table1 
  GROUP BY region;
```

The execution result is as follows:

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

#### 3.1.3 Aliases

The keyword `AS` is used to specify an alias for the selected column, which overrides the existing column name to improve the readability of the query results.

Example 1: Original Table:


```sql
IoTDB> SELECT * FROM table1;
```

The execution result is as follows:

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

Example 2: Single column alias setting:

```sql
IoTDB> SELECT device_id 
         AS device 
         FROM table1;
```

The execution result is as follows:

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

Example 3: Aliases for all columns:

```sql
IoTDB> SELECT table1.* 
         AS (timestamp, Reg, Pl, DevID, Mod, Mnt, Temp, Hum, Stat,MTime) 
         FROM table1;
```

The execution result is as follows:

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

## 4 Result Set Column Order

- __Column order__: The column order in the result set is the same as the order specified in the SELECT clause.
- __Multi column sorting__: If an expression is selected to return multiple columns, their sorting method is the same as the sorting method in the source relationship.