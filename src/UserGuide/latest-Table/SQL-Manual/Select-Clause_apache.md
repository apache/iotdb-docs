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

**SELECT Clause** specifies the columns included in the query results.

## 1. Syntax Overview

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

- It supports aggregate functions (e.g., `SUM`, `AVG`, `COUNT`) and window functions, logically executed last in the query process.
- DISTINCT Keyword: `SELECT DISTINCT column_name` ensures that the values in the query results are unique, removing duplicates.
- COLUMNS Function: The COLUMNS function is supported in the SELECT clause for column filtering. It can be combined with expressions, allowing the expression's logic to apply to all columns selected by the function.

## 2. Detailed Syntax:

Each `selectItem` can take one of the following forms:

1. **Expression**: `expression [[AS] column_alias]` defines a single output column and optionally assigns an alias.
2. **All Columns from a Relation**: `relation.*` selects all columns from a specified relation. Column aliases are not allowed in this case.
3. **All Columns in the Result Set**: `*` selects all columns returned by the query. Column aliases are not allowed.

Usage scenarios for DISTINCT:

1. **SELECT Statement**: Use DISTINCT in the SELECT statement to remove duplicate items from the query results.

2. **Aggregate Functions**: When used with aggregate functions, DISTINCT only processes non-duplicate rows in the input dataset.

3. **AGROUP BY Clause**: Use ALL and DISTINCT quantifiers in the GROUP BY clause to determine whether each duplicate grouping set produces distinct output rows.

`COLUMNS` Function:

1. **`COLUMNS(*)`**: Matches all columns and supports combining with expressions.
2. **`COLUMNS(regexStr) ? AS identifier`**: Regular expression matching
    - Selects columns whose names match the specified regular expression `(regexStr)` and supports combining with expressions.
    - Allows renaming columns by referencing groups captured by the regular expression. If `AS` is omitted, the original column name is displayed in the format `_coln_original_name` (where `n` is the column’s position in the result table).
    - Renaming Syntax:
        - Use parentheses () in regexStr to define capture groups.
        - Reference captured groups in identifier using `'$index'`.
        - Note: The identifier must be enclosed in double quotes if it contains special characters like `$`.

## 3. Example Data


The [Example Data page](../Reference/Sample-Data.md)page provides SQL statements to construct table schemas and insert data. By downloading and executing these statements in the IoTDB CLI, you can import the data into IoTDB. This data can be used to test and run the example SQL queries included in this documentation, allowing you to reproduce the described results.

### 3.1 Selection List

#### 3.1.1 Star Expression

The asterisk (`*`) selects all columns in a table. Note that it cannot be used with most functions, except for cases like `COUNT(*)`.

**Example**: Selecting all columns from a table.


```sql
SELECT * FROM table1;
```

Results:

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

Aggregate functions summarize multiple rows into a single value. When aggregate functions are present in the `SELECT` clause, the query is treated as an **aggregate query**. All expressions in the query must either be part of an aggregate function or specified in the [GROUP BY clause](../SQL-Manual/GroupBy-Clause.md).

**Example 1**: Total number of rows in a table.

```sql
SELECT count(*) FROM table1;
```

Results:

```sql
+-----+
|_col0|
+-----+
|   18|
+-----+
Total line number = 1
It costs 0.091s
```

**Example 2**: Total rows grouped by region.

```sql
SELECT region, count(*) 
  FROM table1 
  GROUP BY region;
```

Results:

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

The `AS` keyword assigns an alias to selected columns, improving readability by overriding existing column names.

**Example 1**: Original table.


```sql
IoTDB> SELECT * FROM table1;
```

Results:

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

**Example 2**: Assigning an alias to a single column.

```sql
IoTDB> SELECT device_id 
         AS device 
         FROM table1;
```

Results:

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

**Example 3:** Assigning aliases to all columns.

```sql
IoTDB> SELECT table1.* 
         AS (timestamp, Reg, Pl, DevID, Mod, Mnt, Temp, Hum, Stat,MTime) 
         FROM table1;
```

Results:

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

### 3.2 Columns Function

1. Without combining expressions
```sql
-- Query data from columns whose names start with 'm'
IoTDB:database1> select columns('^m.*') from table1 limit 5
+--------+-----------+
|model_id|maintenance|
+--------+-----------+
|       E|        180|
|       E|        180|
|       C|         90|
|       C|         90|
|       C|         90|
+--------+-----------+


-- Query columns whose names start with 'o' - throw an exception if no columns match
IoTDB:database1> select columns('^o.*') from table1 limit 5
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701: No matching columns found that match regex '^o.*'


-- Query data from columns whose names start with 'm' and rename them with 'series_' prefix
IoTDB:database1> select columns('^m(.*)') AS "series_$0" from table1 limit 5
+---------------+------------------+
|series_model_id|series_maintenance|
+---------------+------------------+
|              E|               180|
|              E|               180|
|              C|                90|
|              C|                90|
|              C|                90|
+---------------+------------------+
```

2. With Expression Combination

- Single COLUMNS Function
```sql
-- Query the minimum value of all columns
IoTDB:database1> select min(columns(*)) from table1
+-----------------------------+------------+--------------+---------------+--------------+-----------------+-----------------+--------------+------------+-----------------------------+
|                   _col0_time|_col1_region|_col2_plant_id|_col3_device_id|_col4_model_id|_col5_maintenance|_col6_temperature|_col7_humidity|_col8_status|           _col9_arrival_time|
+-----------------------------+------------+--------------+---------------+--------------+-----------------+-----------------+--------------+------------+-----------------------------+
|2024-11-26T13:37:00.000+08:00|        上海|          1001|            100|             A|              180|             85.0|          34.8|       false|2024-11-26T13:37:34.000+08:00|
+-----------------------------+------------+--------------+---------------+--------------+-----------------+-----------------+--------------+------------+-----------------------------+
```

- Multiple COLUMNS Functions in Same Expression

> Usage Restriction: When multiple COLUMNS functions appear in the same expression, their parameters must be identical.

```sql
-- Query the sum of minimum and maximum values for columns starting with 'h'
IoTDB:database1> select min(columns('^h.*')) + max(columns('^h.*')) from table1
+--------------+
|_col0_humidity|
+--------------+
|     79.899994|
+--------------+

-- Error Case: Non-Identical COLUMNS Functions
IoTDB:database1> select min(columns('^h.*')) + max(columns('^t.*')) from table1
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701: Multiple different COLUMNS in the same expression are not supported
```

- Multiple COLUMNS Functions in Different Expressions

```sql
-- Query minimum of 'h'-columns and maximum of 'h'-columns separately
IoTDB:database1> select min(columns('^h.*')) , max(columns('^h.*')) from table1
+--------------+--------------+
|_col0_humidity|_col1_humidity|
+--------------+--------------+
|          34.8|          45.1|
+--------------+--------------+

-- Query minimum of 'h'-columns and maximum of 'te'-columns
IoTDB:database1> select min(columns('^h.*')) , max(columns('^te.*')) from table1
+--------------+-----------------+
|_col0_humidity|_col1_temperature|
+--------------+-----------------+
|          34.8|             90.0|
+--------------+-----------------+
```

3. In Where Clause

```sql
-- Query data where all 'h'-columns must be > 40 (equivalent to)
IoTDB:database1> select * from table1 where columns('^h.*') > 40
+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+
|                         time|region|plant_id|device_id|model_id|maintenance|temperature|humidity|status|                 arrival_time|
+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+
|2024-11-29T11:00:00.000+08:00|  上海|    3002|      100|       E|        180|       null|    45.1|  true|                         null|
|2024-11-28T09:00:00.000+08:00|  上海|    3001|      100|       C|         90|       null|    40.9|  true|                         null|
|2024-11-28T11:00:00.000+08:00|  上海|    3001|      100|       C|         90|       88.0|    45.1|  true|2024-11-28T11:00:12.000+08:00|
+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+

--Alternative syntax
IoTDB:database1> select * from table1 where humidity > 40
+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+
|                         time|region|plant_id|device_id|model_id|maintenance|temperature|humidity|status|                 arrival_time|
+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+
|2024-11-29T11:00:00.000+08:00|  上海|    3002|      100|       E|        180|       null|    45.1|  true|                         null|
|2024-11-28T09:00:00.000+08:00|  上海|    3001|      100|       C|         90|       null|    40.9|  true|                         null|
|2024-11-28T11:00:00.000+08:00|  上海|    3001|      100|       C|         90|       88.0|    45.1|  true|2024-11-28T11:00:12.000+08:00|
+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+
```

## 4. Column Order in the Result Set

- **Column Order**: The order of columns in the result set matches the order specified in the `SELECT` clause.
- **Multi-column Expressions**: If a selection expression produces multiple columns, their order follows the order in the source relation.p.