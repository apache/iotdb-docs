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

## Syntax Overview

```sql
FROM relation (',' relation)*

relation
    : relation joinType JOIN relation joinCriteria 
    | aliasedRelation
    ;

joinType
    : INNER?
    | FULL OUTER?
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

## FROM Clause

The FROM clause specifies the data source for the query operation. Logically, the execution of the query starts with the FROM clause. The FROM clause can contain a single table, a combination of multiple tables joined using the JOIN clause, or another SELECT query within a subquery.

## JOIN Clause

JOIN is used to combine two tables based on certain conditions. Typically, the join condition is a predicate, but other implicit rules can also be specified.

In the current version of IoTDB, inner joins (Inner Join) and full outer joins (Full Outer Join) are supported, and the join condition can only be an equi-join on the time column.

### Inner Join

INNER JOIN indicates an inner join, where the INNER keyword can be omitted. It returns records that satisfy the join condition from both tables, discarding those that do not, equivalent to the intersection of the two tables.

#### Explicitly Specifying Join Conditions (Recommended)

Explicit joins require the use of JOIN + ON or JOIN + USING syntax, specifying the join condition after the ON or USING keyword.

The SQL syntax is as follows:

```sql
// Explicit join, specify join conditions after the ON keyword or specify join columns after the USING keyword
SELECT selectExpr [, selectExpr] ... FROM <TABLE_NAME> [INNER] JOIN <TABLE_NAME> joinCriteria [WHERE whereCondition]

joinCriteria
    : ON booleanExpression
    | USING '(' identifier (',' identifier)* ')'
    ;
```

__Note: The Difference Between USING and ON__


USING is an abbreviated syntax for explicit join conditions. It accepts a list of field names separated by commas, which must be fields common to the joined tables. For example, USING (time) is equivalent to ON (t1.time = t2.time). When using the `ON` keyword, the `time` fields in the two tables are logically distinct, represented as `t1.time` and `t2.time`. When using the `USING` keyword, there is logically only one `time` field. The final query result depends on the fields specified in the SELECT statement.

#### Implicitly Specifying Join Conditions

Implicit joins do not require the use of JOIN, ON, or USING keywords, but instead achieve table-to-table connections by specifying conditions in the WHERE clause.

The SQL syntax is as follows:

```sql
// Implicit join, specify join conditions in the WHERE clause
SELECT selectExpr [, selectExpr] ... FROM <TABLE_NAME> [, <TABLE_NAME>] ... [WHERE whereCondition] 
```

### Outer Join

If there are no matching rows, you can still return rows by specifying an outer join. Outer joins can be:

- LEFT（all rows from the left table appear at least once）
- RIGHT（all rows from the right table appear at least once）
- FULL（all rows from both tables appear at least once）


In the current version of IoTDB, only FULL [OUTER] JOIN is supported, which is a full outer join, returning all records after the left and right tables are joined. If a record from one table does not match with a record from the other table, NULL values will be returned. __FULL JOIN can only be used with explicit join methods.__

## Example Data

In the [Example Data page](../Basic-Concept/Sample-Data.md), there are SQL statements for building table structures and inserting data. By downloading and executing these statements in the IoTDB CLI, you can import data into IoTDB. You can use this data to test and execute the SQL statements in the examples and obtain the corresponding results.

### From Example

#### Query from a Single Table

Example 1: This query will return all records from `table1, sorted by time.

```sql
SELECT * FROM table1 ORDER BY time;
```

Query results:

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

Example 1: This query will return records with `device` `d1` in `table1`, sorted by time.

```sql
SELECT * FROM table1 t1 where t1.device_id='101' order by time;
```

Query results:

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

#### Search From Subqueries

Example 1: This query will return the total number of records in `table1`.

```sql
SELECT COUNT(*) AS count FROM (SELECT * FROM table1);
```

Query results:

```sql
+-----+
|count|
+-----+
|   18|
+-----+
Total line number = 1
It costs 0.072s
```

### Join Example

#### Inner Join

Example 1: Explicit Connection

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

Query results:

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

Example 2: Explicit Connection


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

Query results:

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

Example 3: Implicit Connection

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

Query results:

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

#### Outer Join

Example 1: Explicit Connection

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

Query results:

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

Example 2: Explicit Connection

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

Query results:

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