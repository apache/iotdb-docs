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

# FROM & JOIN Clause

## 1. Syntax Overview

```sql
FROM relation (',' relation)*

relation
    : relation joinType JOIN relation joinCriteria 
    | aliasedRelation
    ;

joinType
    : INNER?
    | FULL OUTER?
    | CROSS?
    | ASOF?
    ;

joinCriteria
    : ON booleanExpression
    | USING '(' identifier (',' identifier)* ')'
    ;

aliasedRelation
    : relationPrimary (AS? identifier columnAliases?)?
    ;

columnAliases
    : '(' identifier (',' identifier)* ')'
    ;

relationPrimary
    : qualifiedName                                              #tableName
    | '(' query ')'                                              #subqueryRelation
    | '(' relation ')'                                           #parenthesizedRelation
    ;

qualifiedName
    : identifier ('.' identifier)*
    ;
```

## 2. FROM Clause Syntax

The `FROM` clause specifies the data sources for the query. Logically, query execution begins with the `FROM` clause. It can include a single table, a combination of multiple tables joined using `JOIN` clauses, or a subquery containing another `SELECT` query.

## 3. JOIN Clause

The `JOIN` clause combines two tables based on specific conditions, typically predicates, but other implicit rules can also apply.

In the current version of IoTDB, the following joins are supported:

1. **Inner Join**: Combines rows that meet the join condition, effectively returning the intersection of the two tables. The join condition must be an equality condition on the `time` column.
2. **Full Outer Join**: Returns all records from both tables, inserting `NULL` values for unmatched rows. The join condition can be any equality expression.
3. **Cross Join**: Represents the Cartesian product of two tables.
4. ​**​ASOF JOIN​​** (AS OF a specific point in time) is a specialized join operation based on temporal or approximate matching conditions, designed for scenarios where timestamps between two datasets are not perfectly aligned. It matches each row from the left table with the closest corresponding row in the right table that meets the specified conditions (typically the nearest preceding or succeeding timestamp). This operation is widely used for time-series data analysis (e.g., sensor data, financial market feeds).

### 3.1 Inner Join

`INNER JOIN` can be written explicitly or implicitly by omitting the `INNER` keyword. It returns records where the join condition is satisfied.

#### 3.1.1 Explicit Join (Recommended)

Explicit joins use the syntax JOIN + ON or JOIN + USING to specify join conditions:

```sql
// Explicit join: Specify the join condition after the ON keyword or the join column(s) after the USING keyword.
SELECT selectExpr [, selectExpr] ... FROM <TABLE_NAME> [INNER] JOIN <TABLE_NAME> joinCriteria [WHERE whereCondition]

joinCriteria
    : ON booleanExpression
    | USING '(' identifier (',' identifier)* ')'
    ;  
```

**Note: Difference Between** **`USING`** **and** **`ON`**

- `USING` simplifies explicit join conditions by accepting a list of column names common to both tables. For example, `USING (time)` is equivalent to `ON (t1.time = t2.time)`. When using `USING`, there is logically one `time` column in the result.
- With `ON`, column names remain distinct (e.g., `t1.time` and `t2.time`).
- The final query result depends on the fields specified in the `SELECT` statement.



#### 3.1.2 Implicit Join

Implicit joins do not use `JOIN`, `ON`, or `USING` keywords. Instead, conditions are specified in the `WHERE` clause:

```sql
// Implicit join: Specify the join condition in the WHERE clause.
SELECT selectExpr [, selectExpr] ... FROM <TABLE_NAME> [, <TABLE_NAME>] ... [WHERE whereCondition] 
```

### 3.2 Outer Join

An **outer join** returns rows even when no matching records exist in the other table. Types include:

- **LEFT OUTER JOIN**: Returns all rows from the left table.
- **RIGHT OUTER JOIN**: Returns all rows from the right table.
- **FULL OUTER JOIN**: Returns all rows from both tables.

IoTDB currently supports only `FULL [OUTER] JOIN`. This type returns all records from both tables. If a record in one table has no match in the other, `NULL` values are returned for the unmatched fields. `FULL JOIN` **must use explicit join conditions**.

```sql
//Specify the join condition after the ON keyword or specify the join columns after the USING keyword.
SELECT selectExpr [, selectExpr] ... FROM <TABLE_NAME> FULL [OUTER] JOIN <TABLE_NAME> joinCriteria [WHERE whereCondition]

joinCriteria
    : ON booleanExpression
    | USING '(' identifier (',' identifier)* ')'
    ;
```

### 3.3 Cross Join
A cross join represents the Cartesian product of two tables, returning all possible combinations of the N rows from the left table and the M rows from the right table, resulting in N*M rows. This type of join is the least commonly used in practice.

### 3.4 ​Asof Join

IoTDB ASOF JOIN is an approximate point join method that allows users to perform matching based on the closest timestamp according to specified rules. ​​The current version only supports ASOF INNER JOIN for Time columns.​​

The SQL syntax is as follows:

```SQL
SELECT selectExpr [, selectExpr] ... FROM 
<TABLE_NAME1> ASOF[(tolerance theta)] [INNER] JOIN <TABLE_NAME2> joinCriteria 
[WHERE whereCondition]
WHERE a.time = tolerance(b.time, 1s)

joinCriteria
    : ON <TABLE_NAME1>.time comparisonOperator <TABLE_NAME2>.time 
    ;

comparisonOperator
    : < | <= | > | >=
    ;
```

**​Notes:​​**

* ASOF JOIN defaults to ASOF INNER JOIN implementation.
* When using the ON keyword for joining, the join condition must include an inequality join condition for the Time column. Only four operators are supported: `">", ">=", "<", "<="`. The corresponding join matching rules are as follows (where lt represents the left table and rt represents the right table):

| Operator                   | Join Method                                   |
| -------------------------- | ---------------------------------------------- |
| `lt.time >= rt.time` | The closest timestamp in the left table that is greater than or equal to the right table's timestamp. |
| `lt.time > rt.time`  | The closest timestamp in the left table that is greater than the right table's timestamp.     |
| `lt.time <= rt.time` | The closest timestamp in the left table that is less than or equal to the right table's timestamp. |
| `lt.time < rt.time`  | The closest timestamp in the left table that is less than the right table's timestamp.     |

* `Tolerance parameter​`​: The maximum allowed time difference for searching data in the right table (expressed as a TimeDuration, e.g., 1d for one day). If the Tolerance parameter is not specified, the search time range defaults to ​​infinity​​. ​​Note​​: Currently, this parameter is only supported in ASOF ​​INNER​​ JOIN.



## 4. Example Queries

The [Example Data page](../Reference/Sample-Data.md)page provides SQL statements to construct table schemas and insert data. By downloading and executing these statements in the IoTDB CLI, you can import the data into IoTDB. This data can be used to test and run the example SQL queries included in this documentation, allowing you to reproduce the described results.

### 4.1 FROM Examples

#### 4.1.1 Query from a Single Table

**Example 1:** This query retrieves all records from `table1` and sorts them by time.

```sql
SELECT * FROM table1 ORDER BY time;
```

Query Results:

```sql
+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+
|                         time|region|plant_id|device_id|model_id|maintenance|temperature|humidity|status|                arrival_time|
+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+
|2024-11-26T13:37:00.000+08:00|  北京|    1001|      100|       A|        180|       90.0|    35.1|  true|2024-11-26T13:37:34.000+08:00|
|2024-11-26T13:38:00.000+08:00|  北京|    1001|      100|       A|        180|       90.0|    35.1|  true|2024-11-26T13:38:25.000+08:00|
|2024-11-27T16:38:00.000+08:00|  北京|    1001|      101|       B|        180|       null|    35.1|  true|2024-11-27T16:37:01.000+08:00|
|2024-11-27T16:39:00.000+08:00|  北京|    1001|      101|       B|        180|       85.0|    35.3|  null|                         null|
|2024-11-27T16:40:00.000+08:00|  北京|    1001|      101|       B|        180|       85.0|    null|  null|2024-11-27T16:37:03.000+08:00|
|2024-11-27T16:41:00.000+08:00|  北京|    1001|      101|       B|        180|       85.0|    null|  null|2024-11-27T16:37:04.000+08:00|
|2024-11-27T16:42:00.000+08:00|  北京|    1001|      101|       B|        180|       null|    35.2| false|                         null|
|2024-11-27T16:43:00.000+08:00|  北京|    1001|      101|       B|        180|       null|    null| false|                         null|
|2024-11-27T16:44:00.000+08:00|  北京|    1001|      101|       B|        180|       null|    null| false|2024-11-27T16:37:08.000+08:00|
|2024-11-28T08:00:00.000+08:00|  上海|    3001|      100|       C|         90|       85.0|    null|  null|2024-11-28T08:00:09.000+08:00|
|2024-11-28T09:00:00.000+08:00|  上海|    3001|      100|       C|         90|       null|    40.9|  true|                         null|
|2024-11-28T10:00:00.000+08:00|  上海|    3001|      100|       C|         90|       85.0|    35.2|  null|2024-11-28T10:00:11.000+08:00|
|2024-11-28T11:00:00.000+08:00|  上海|    3001|      100|       C|         90|       88.0|    45.1|  true|2024-11-28T11:00:12.000+08:00|
|2024-11-29T10:00:00.000+08:00|  上海|    3001|      101|       D|        360|       85.0|    null|  null|2024-11-29T10:00:13.000+08:00|
|2024-11-29T11:00:00.000+08:00|  上海|    3002|      100|       E|        180|       null|    45.1|  true|                         null|
|2024-11-29T18:30:00.000+08:00|  上海|    3002|      100|       E|        180|       90.0|    35.4|  true|2024-11-29T18:30:15.000+08:00|
|2024-11-30T09:30:00.000+08:00|  上海|    3002|      101|       F|        360|       90.0|    35.2|  true|                         null|
|2024-11-30T14:30:00.000+08:00|  上海|    3002|      101|       F|        360|       90.0|    34.8|  true|2024-11-30T14:30:17.000+08:00|
+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+
Total line number = 18
It costs 0.085s
```

**Example 2:** This query retrieves all records from `table1` where the device is `101` and sorts them by time.

```sql
SELECT * FROM table1 t1 where t1.device_id='101' order by time;
```

Query Results:

```sql
+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+
|                         time|region|plant_id|device_id|model_id|maintenance|temperature|humidity|status|                arrival_time|
+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+
|2024-11-27T16:38:00.000+08:00|  北京|    1001|      101|       B|        180|       null|    35.1|  true|2024-11-27T16:37:01.000+08:00|
|2024-11-27T16:39:00.000+08:00|  北京|    1001|      101|       B|        180|       85.0|    35.3|  null|                         null|
|2024-11-27T16:40:00.000+08:00|  北京|    1001|      101|       B|        180|       85.0|    null|  null|2024-11-27T16:37:03.000+08:00|
|2024-11-27T16:41:00.000+08:00|  北京|    1001|      101|       B|        180|       85.0|    null|  null|2024-11-27T16:37:04.000+08:00|
|2024-11-27T16:42:00.000+08:00|  北京|    1001|      101|       B|        180|       null|    35.2| false|                         null|
|2024-11-27T16:43:00.000+08:00|  北京|    1001|      101|       B|        180|       null|    null| false|                         null|
|2024-11-27T16:44:00.000+08:00|  北京|    1001|      101|       B|        180|       null|    null| false|2024-11-27T16:37:08.000+08:00|
|2024-11-29T10:00:00.000+08:00|  上海|    3001|      101|       D|        360|       85.0|    null|  null|2024-11-29T10:00:13.000+08:00|
|2024-11-30T09:30:00.000+08:00|  上海|    3002|      101|       F|        360|       90.0|    35.2|  true|                         null|
|2024-11-30T14:30:00.000+08:00|  上海|    3002|      101|       F|        360|       90.0|    34.8|  true|2024-11-30T14:30:17.000+08:00|
+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+
Total line number = 10
It costs 0.061s
```

#### 4.1.2 Querying from a Subquery

**Example 1:** This query retrieves the total number of records in `table1`.

```sql
SELECT COUNT(*) AS count FROM (SELECT * FROM table1);
```

Query Results:

```sql
+-----+
|count|
+-----+
|   18|
+-----+
Total line number = 1
It costs 0.072s
```

### 4.2 JOIN Examples

#### 4.2.1 Inner Join

**Example 1: Explicit Join using `ON`** 

This query retrieves records where `table1` and `table2` share the same `time` values.

```sql
SELECT 
  t1.time, 
  t1.device_id as device1, 
  t1.temperature as temperature1, 
  t2.device_id as device2, 
  t2.temperature as temperature2 
FROM 
  table1 t1 JOIN table2 t2 
ON t1.time = t2.time
```

Query Results:

```sql
+-----------------------------+-------+------------+-------+------------+
|                         time|device1|temperature1|device2|temperature2|
+-----------------------------+-------+------------+-------+------------+
|2024-11-26T13:37:00.000+08:00|    100|        90.0|    100|        90.0|
|2024-11-28T08:00:00.000+08:00|    100|        85.0|    100|        85.0|
|2024-11-29T11:00:00.000+08:00|    100|        null|    100|        null|
+-----------------------------+-------+------------+-------+------------+
Total line number = 3
It costs 0.076s
```

**Example 2: Explicit Join using `USING`** 

This query retrieves records from `table1` and `table2`, joining on the `time` column.

```sql
SELECT time,
  t1.device_id as device1, 
  t1.temperature as temperature1, 
  t2.device_id as device2, 
  t2.temperature as temperature2   
FROM 
  table1 t1 JOIN table2 t2
USING(time)
```

Query Results:

```sql
+-----------------------------+-------+------------+-------+------------+
|                         time|device1|temperature1|device2|temperature2|
+-----------------------------+-------+------------+-------+------------+
|2024-11-26T13:37:00.000+08:00|    100|        90.0|    100|        90.0|
|2024-11-28T08:00:00.000+08:00|    100|        85.0|    100|        85.0|
|2024-11-29T11:00:00.000+08:00|    100|        null|    100|        null|
+-----------------------------+-------+------------+-------+------------+
Total line number = 3
It costs 0.081s
```

**Example 3: Implicit Join using `WHERE`** 

This query joins `table1` and `table2` by specifying the condition in the `WHERE` clause.

```sql
SELECT t1.time, 
  t1.device_id as device1, 
  t1.temperature as temperature1, 
  t2.device_id as device2, 
  t2.temperature as temperature2 
FROM 
table1 t1, table2 t2
WHERE
t1.time=t2.time
```

Query Results:

```sql
+-----------------------------+-------+------------+-------+------------+
|                         time|device1|temperature1|device2|temperature2|
+-----------------------------+-------+------------+-------+------------+
|2024-11-26T13:37:00.000+08:00|    100|        90.0|    100|        90.0|
|2024-11-28T08:00:00.000+08:00|    100|        85.0|    100|        85.0|
|2024-11-29T11:00:00.000+08:00|    100|        null|    100|        null|
+-----------------------------+-------+------------+-------+------------+
Total line number = 3
It costs 0.082s
```

#### 4.2.2 Outer Join

**Example 1: Full Outer Join using `ON`** 

This query retrieves all records from `table1` and `table2`, including unmatched rows with `NULL` values.

```sql
SELECT 
  t1.time as time1, t2.time as time2, 
  t1.device_id as device1, 
  t1.temperature as temperature1, 
  t2.device_id as device2, 
  t2.temperature as temperature2  
FROM 
  table1 t1 FULL JOIN table2 t2 
ON t1.time = t2.time
```

Query Results:

```sql
+-----------------------------+-----------------------------+-------+------------+-------+------------+
|                        time1|                        time2|device1|temperature1|device2|temperature2|
+-----------------------------+-----------------------------+-------+------------+-------+------------+
|2024-11-26T13:37:00.000+08:00|2024-11-26T13:37:00.000+08:00|    100|        90.0|    100|        90.0|
|2024-11-26T13:38:00.000+08:00|                         null|    100|        90.0|   null|        null|
|                         null|2024-11-27T00:00:00.000+08:00|   null|        null|    101|        85.0|
|2024-11-27T16:38:00.000+08:00|                         null|    101|        null|   null|        null|
|2024-11-27T16:39:00.000+08:00|                         null|    101|        85.0|   null|        null|
|2024-11-27T16:40:00.000+08:00|                         null|    101|        85.0|   null|        null|
|2024-11-27T16:41:00.000+08:00|                         null|    101|        85.0|   null|        null|
|2024-11-27T16:42:00.000+08:00|                         null|    101|        null|   null|        null|
|2024-11-27T16:43:00.000+08:00|                         null|    101|        null|   null|        null|
|2024-11-27T16:44:00.000+08:00|                         null|    101|        null|   null|        null|
|2024-11-28T08:00:00.000+08:00|2024-11-28T08:00:00.000+08:00|    100|        85.0|    100|        85.0|
|2024-11-28T09:00:00.000+08:00|                         null|    100|        null|   null|        null|
|2024-11-28T10:00:00.000+08:00|                         null|    100|        85.0|   null|        null|
|2024-11-28T11:00:00.000+08:00|                         null|    100|        88.0|   null|        null|
|                         null|2024-11-29T00:00:00.000+08:00|   null|        null|    101|        85.0|
|2024-11-29T10:00:00.000+08:00|                         null|    101|        85.0|   null|        null|
|2024-11-29T11:00:00.000+08:00|2024-11-29T11:00:00.000+08:00|    100|        null|    100|        null|
|2024-11-29T18:30:00.000+08:00|                         null|    100|        90.0|   null|        null|
|                         null|2024-11-30T00:00:00.000+08:00|   null|        null|    101|        90.0|
|2024-11-30T09:30:00.000+08:00|                         null|    101|        90.0|   null|        null|
|2024-11-30T14:30:00.000+08:00|                         null|    101|        90.0|   null|        null|
+-----------------------------+-----------------------------+-------+------------+-------+------------+
Total line number = 21
It costs 0.071s
```

**Example 2: Explicit Join using `USING`**

This query retrieves all records from `table1` and `table2`, combining them based on the `time` column. Rows with no matches in one of the tables will include `NULL` values for the missing fields.

```sql
SELECT 
  time, 
  t1.device_id as device1, 
  t1.temperature as temperature1, 
  t2.device_id as device2, 
  t2.temperature as temperature2  
FROM 
  table1 t1 FULL JOIN table2 t2 
USING(time)
```

Query Results:

```sql
+-----------------------------+-------+------------+-------+------------+
|                         time|device1|temperature1|device2|temperature2|
+-----------------------------+-------+------------+-------+------------+
|2024-11-26T13:37:00.000+08:00|    100|        90.0|    100|        90.0|
|2024-11-26T13:38:00.000+08:00|    100|        90.0|   null|        null|
|2024-11-27T00:00:00.000+08:00|   null|        null|    101|        85.0|
|2024-11-27T16:38:00.000+08:00|    101|        null|   null|        null|
|2024-11-27T16:39:00.000+08:00|    101|        85.0|   null|        null|
|2024-11-27T16:40:00.000+08:00|    101|        85.0|   null|        null|
|2024-11-27T16:41:00.000+08:00|    101|        85.0|   null|        null|
|2024-11-27T16:42:00.000+08:00|    101|        null|   null|        null|
|2024-11-27T16:43:00.000+08:00|    101|        null|   null|        null|
|2024-11-27T16:44:00.000+08:00|    101|        null|   null|        null|
|2024-11-28T08:00:00.000+08:00|    100|        85.0|    100|        85.0|
|2024-11-28T09:00:00.000+08:00|    100|        null|   null|        null|
|2024-11-28T10:00:00.000+08:00|    100|        85.0|   null|        null|
|2024-11-28T11:00:00.000+08:00|    100|        88.0|   null|        null|
|2024-11-29T00:00:00.000+08:00|   null|        null|    101|        85.0|
|2024-11-29T10:00:00.000+08:00|    101|        85.0|   null|        null|
|2024-11-29T11:00:00.000+08:00|    100|        null|    100|        null|
|2024-11-29T18:30:00.000+08:00|    100|        90.0|   null|        null|
|2024-11-30T00:00:00.000+08:00|   null|        null|    101|        90.0|
|2024-11-30T09:30:00.000+08:00|    101|        90.0|   null|        null|
|2024-11-30T14:30:00.000+08:00|    101|        90.0|   null|        null|
+-----------------------------+-------+------------+-------+------------+
Total line number = 21
It costs 0.073s
```

Example 3: The join condition is based on a non-time column.

```sql
SELECT 
  region,
  t1.time as time1,
  t1.temperature as temperature1, 
  t2.time as time2, 
  t2.temperature as temperature2 
FROM 
  table1 t1 FULL JOIN table2 t2 
USING(region)
LIMIT 10
```

Query Results:

```sql
+------+-----------------------------+------------+-----------------------------+------------+
|region|                        time1|temperature1|                        time2|temperature2|
+------+-----------------------------+------------+-----------------------------+------------+
|  上海|2024-11-29T11:00:00.000+08:00|        null|2024-11-29T11:00:00.000+08:00|        null|
|  上海|2024-11-29T11:00:00.000+08:00|        null|2024-11-28T08:00:00.000+08:00|        85.0|
|  上海|2024-11-29T11:00:00.000+08:00|        null|2024-11-30T00:00:00.000+08:00|        90.0|
|  上海|2024-11-29T11:00:00.000+08:00|        null|2024-11-29T00:00:00.000+08:00|        85.0|
|  上海|2024-11-30T09:30:00.000+08:00|        90.0|2024-11-29T11:00:00.000+08:00|        null|
|  上海|2024-11-30T09:30:00.000+08:00|        90.0|2024-11-28T08:00:00.000+08:00|        85.0|
|  上海|2024-11-30T09:30:00.000+08:00|        90.0|2024-11-30T00:00:00.000+08:00|        90.0|
|  上海|2024-11-30T09:30:00.000+08:00|        90.0|2024-11-29T00:00:00.000+08:00|        85.0|
|  上海|2024-11-29T18:30:00.000+08:00|        90.0|2024-11-29T11:00:00.000+08:00|        null|
|  上海|2024-11-29T18:30:00.000+08:00|        90.0|2024-11-28T08:00:00.000+08:00|        85.0|
+------+-----------------------------+------------+-----------------------------+------------+
Total line number = 10
It costs 0.040s
```

#### 4.2.3 Cross Join

**Example 1: Explicit Join**

```sql
SELECT table1.*, table2.* FROM table1 CROSS JOIN table2 LIMIT 8;
```

Query Results:

```sql
+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+
|                         time|region|plant_id|device_id|model_id|maintenance|temperature|humidity|status|                 arrival_time|                         time|region|plant_id|device_id|model_id|maintenance|temperature|humidity|status|                 arrival_time|
+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+
|2024-11-30T09:30:00.000+08:00|  上海|    3002|      101|       F|        360|       90.0|    35.2|  true|                         null|2024-11-30T00:00:00.000+08:00|  上海|    3002|      101|       F|        360|       90.0|    35.2|  true|                         null|
|2024-11-30T09:30:00.000+08:00|  上海|    3002|      101|       F|        360|       90.0|    35.2|  true|                         null|2024-11-29T00:00:00.000+08:00|  上海|    3001|      101|       D|        360|       85.0|    35.1|  null|2024-11-29T10:00:13.000+08:00|
|2024-11-30T09:30:00.000+08:00|  上海|    3002|      101|       F|        360|       90.0|    35.2|  true|                         null|2024-11-27T00:00:00.000+08:00|  北京|    1001|      101|       B|        180|       85.0|    35.1|  true|2024-11-27T16:37:01.000+08:00|
|2024-11-30T09:30:00.000+08:00|  上海|    3002|      101|       F|        360|       90.0|    35.2|  true|                         null|2024-11-29T11:00:00.000+08:00|  上海|    3002|      100|       E|        180|       null|    45.1|  true|                         null|
|2024-11-30T09:30:00.000+08:00|  上海|    3002|      101|       F|        360|       90.0|    35.2|  true|                         null|2024-11-28T08:00:00.000+08:00|  上海|    3001|      100|       C|         90|       85.0|    35.2| false|2024-11-28T08:00:09.000+08:00|
|2024-11-30T09:30:00.000+08:00|  上海|    3002|      101|       F|        360|       90.0|    35.2|  true|                         null|2024-11-26T13:37:00.000+08:00|  北京|    1001|      100|       A|        180|       90.0|    35.1|  true|2024-11-26T13:37:34.000+08:00|
|2024-11-30T14:30:00.000+08:00|  上海|    3002|      101|       F|        360|       90.0|    34.8|  true|2024-11-30T14:30:17.000+08:00|2024-11-30T00:00:00.000+08:00|  上海|    3002|      101|       F|        360|       90.0|    35.2|  true|                         null|
|2024-11-30T14:30:00.000+08:00|  上海|    3002|      101|       F|        360|       90.0|    34.8|  true|2024-11-30T14:30:17.000+08:00|2024-11-29T00:00:00.000+08:00|  上海|    3001|      101|       D|        360|       85.0|    35.1|  null|2024-11-29T10:00:13.000+08:00|
+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+
Total line number = 8
It costs 0.282s
```

**Example 2: Implicit Join**

```sql
SELECT table1.*, table2.* FROM table1, table2 LIMIT 8;
```

Query Results:

```sql
+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+
|                         time|region|plant_id|device_id|model_id|maintenance|temperature|humidity|status|                 arrival_time|                         time|region|plant_id|device_id|model_id|maintenance|temperature|humidity|status|                 arrival_time|
+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+
|2024-11-30T09:30:00.000+08:00|  上海|    3002|      101|       F|        360|       90.0|    35.2|  true|                         null|2024-11-30T00:00:00.000+08:00|  上海|    3002|      101|       F|        360|       90.0|    35.2|  true|                         null|
|2024-11-30T09:30:00.000+08:00|  上海|    3002|      101|       F|        360|       90.0|    35.2|  true|                         null|2024-11-29T00:00:00.000+08:00|  上海|    3001|      101|       D|        360|       85.0|    35.1|  null|2024-11-29T10:00:13.000+08:00|
|2024-11-30T09:30:00.000+08:00|  上海|    3002|      101|       F|        360|       90.0|    35.2|  true|                         null|2024-11-27T00:00:00.000+08:00|  北京|    1001|      101|       B|        180|       85.0|    35.1|  true|2024-11-27T16:37:01.000+08:00|
|2024-11-30T09:30:00.000+08:00|  上海|    3002|      101|       F|        360|       90.0|    35.2|  true|                         null|2024-11-29T11:00:00.000+08:00|  上海|    3002|      100|       E|        180|       null|    45.1|  true|                         null|
|2024-11-30T09:30:00.000+08:00|  上海|    3002|      101|       F|        360|       90.0|    35.2|  true|                         null|2024-11-28T08:00:00.000+08:00|  上海|    3001|      100|       C|         90|       85.0|    35.2| false|2024-11-28T08:00:09.000+08:00|
|2024-11-30T09:30:00.000+08:00|  上海|    3002|      101|       F|        360|       90.0|    35.2|  true|                         null|2024-11-26T13:37:00.000+08:00|  北京|    1001|      100|       A|        180|       90.0|    35.1|  true|2024-11-26T13:37:34.000+08:00|
|2024-11-30T14:30:00.000+08:00|  上海|    3002|      101|       F|        360|       90.0|    34.8|  true|2024-11-30T14:30:17.000+08:00|2024-11-30T00:00:00.000+08:00|  上海|    3002|      101|       F|        360|       90.0|    35.2|  true|                         null|
|2024-11-30T14:30:00.000+08:00|  上海|    3002|      101|       F|        360|       90.0|    34.8|  true|2024-11-30T14:30:17.000+08:00|2024-11-29T00:00:00.000+08:00|  上海|    3001|      101|       D|        360|       85.0|    35.1|  null|2024-11-29T10:00:13.000+08:00|
+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+
Total line number = 8
It costs 0.047s
```

#### 4.2.4 Asof join

​​Example 1​​: Without specifying the tolerance parameter, where the timestamp in table1 is greater than or equal to and closest to the timestamp in table2.

```SQL
SELECT t1.time as time1, t1.device_id as device1, t1.temperature as temperature1, t2.time as time2, t2.device_id as device2, t2.temperature as temperature2 FROM  table1 t1 ASOF JOIN table2 t2 ON t1.time>=t2.time;
```

Query Results:

```SQL
+-----------------------------+-------+------------+-----------------------------+-------+------------+
|                        time1|device1|temperature1|                        time2|device2|temperature2|
+-----------------------------+-------+------------+-----------------------------+-------+------------+
|2024-11-30T14:30:00.000+08:00|    101|        90.0|2024-11-30T00:00:00.000+08:00|    101|        90.0|
|2024-11-30T09:30:00.000+08:00|    101|        90.0|2024-11-30T00:00:00.000+08:00|    101|        90.0|
|2024-11-29T18:30:00.000+08:00|    100|        90.0|2024-11-29T11:00:00.000+08:00|    100|        null|
|2024-11-29T11:00:00.000+08:00|    100|        null|2024-11-29T11:00:00.000+08:00|    100|        null|
|2024-11-29T10:00:00.000+08:00|    101|        85.0|2024-11-29T00:00:00.000+08:00|    101|        85.0|
|2024-11-28T11:00:00.000+08:00|    100|        88.0|2024-11-28T08:00:00.000+08:00|    100|        85.0|
|2024-11-28T10:00:00.000+08:00|    100|        85.0|2024-11-28T08:00:00.000+08:00|    100|        85.0|
|2024-11-28T09:00:00.000+08:00|    100|        null|2024-11-28T08:00:00.000+08:00|    100|        85.0|
|2024-11-28T08:00:00.000+08:00|    100|        85.0|2024-11-28T08:00:00.000+08:00|    100|        85.0|
|2024-11-27T16:44:00.000+08:00|    101|        null|2024-11-27T00:00:00.000+08:00|    101|        85.0|
|2024-11-27T16:43:00.000+08:00|    101|        null|2024-11-27T00:00:00.000+08:00|    101|        85.0|
|2024-11-27T16:42:00.000+08:00|    101|        null|2024-11-27T00:00:00.000+08:00|    101|        85.0|
|2024-11-27T16:41:00.000+08:00|    101|        85.0|2024-11-27T00:00:00.000+08:00|    101|        85.0|
|2024-11-27T16:40:00.000+08:00|    101|        85.0|2024-11-27T00:00:00.000+08:00|    101|        85.0|
|2024-11-27T16:39:00.000+08:00|    101|        85.0|2024-11-27T00:00:00.000+08:00|    101|        85.0|
|2024-11-27T16:38:00.000+08:00|    101|        null|2024-11-27T00:00:00.000+08:00|    101|        85.0|
|2024-11-26T13:38:00.000+08:00|    100|        90.0|2024-11-26T13:37:00.000+08:00|    100|        90.0|
|2024-11-26T13:37:00.000+08:00|    100|        90.0|2024-11-26T13:37:00.000+08:00|    100|        90.0|
+-----------------------------+-------+------------+-----------------------------+-------+------------+
```

Example 2​​: With the tolerance parameter specified, where the timestamp in table1 is greater than or equal to and closest to the timestamp in table2.

```SQL
SELECT t1.time as time1, t1.device_id as device1, t1.temperature as temperature1, t2.time as time2, t2.device_id as device2, t2.temperature as temperature2 FROM table1 t1 ASOF(tolerance 2s) JOIN table2 t2 ON t1.time>=t2.time;
```

Query Results:

```SQL
+-----------------------------+-------+------------+-----------------------------+-------+------------+
|                        time1|device1|temperature1|                        time2|device2|temperature2|
+-----------------------------+-------+------------+-----------------------------+-------+------------+
|2024-11-29T11:00:00.000+08:00|    100|        null|2024-11-29T11:00:00.000+08:00|    100|        null|
|2024-11-28T08:00:00.000+08:00|    100|        85.0|2024-11-28T08:00:00.000+08:00|    100|        85.0|
|2024-11-26T13:37:00.000+08:00|    100|        90.0|2024-11-26T13:37:00.000+08:00|    100|        90.0|
+-----------------------------+-------+------------+-----------------------------+-------+------------+
```
