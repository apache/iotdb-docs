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

# FROM & JOIN 子句

## 1 语法概览

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

## 2 FROM 子句

FROM 子句指定了查询操作的数据源。在逻辑上，查询的执行从 FROM 子句开始。FROM 子句可以包含单个表、使用 JOIN 子句连接的多个表的组合，或者子查询中的另一个 SELECT 查询。

## 3 JOIN 子句

JOIN 用于将两个表基于某些条件连接起来，通常，连接条件是一个谓词，但也可以指定其他隐含的规则。

在当前版本的 IoTDB 中，支持内连接（Inner Join）和全外连接（Full Outer Join），并且连接条件只能是时间列的等值连接。

### 3.1 内连接（Inner Join）

INNER JOIN 表示内连接，其中 INNER 关键字可以省略。它返回两个表中满足连接条件的记录，舍弃不满足的记录，等同于两个表的交集。

#### 3.1.1 显式指定连接条件（推荐）

显式连接需要使用 JOIN + ON 或 JOIN + USING 语法，在 ON 或 USING 关键字后指定连接条件。

SQL语法如下所示：

```sql
// 显式连接, 在ON关键字后指定连接条件或在Using关键字后指定连接列
SELECT selectExpr [, selectExpr] ... FROM <TABLE_NAME> [INNER] JOIN <TABLE_NAME> joinCriteria [WHERE whereCondition]

joinCriteria
    : ON booleanExpression
    | USING '(' identifier (',' identifier)* ')'
    ;
```

__注意：USING 和 ON 的区别__

USING 是显式连接条件的缩写语法，它接收一个用逗号分隔的字段名列表，这些字段必须是连接表共有的字段。例如，USING (time) 等效于 ON (t1.time = t2.time)。当使用 `ON` 关键字时，两个表中的 `time` 字段在逻辑上是区分的，分别表示为 `t1.time` 和 `t2.time`。而当使用 `USING` 关键字时，逻辑上只会有一个 `time` 字段。而最终的查询结果取决于 `SELECT` 语句中指定的字段。

#### 3.1.2 隐式指定连接条件

隐式连接不需要出现 JOIN、ON、USING 关键字，而是通过在 WHERE 子句中指定条件来实现表与表之间的连接。

SQL语法如下所示：

```sql
// 隐式连接, 在WHERE子句里指定连接条件
SELECT selectExpr [, selectExpr] ... FROM <TABLE_NAME> [, <TABLE_NAME>] ... [WHERE whereCondition] 
```

### 3.2 外连接（Outer Join）

如果没有匹配的行，仍然可以通过指定外连接返回行。外连接可以是：

- LEFT（左侧表的所有行至少出现一次）
- RIGHT（右侧表的所有行至少出现一次）
- FULL（两个表的所有行至少出现一次）

在当前版本的 IoTDB 中，只支持 FULL [OUTER] JOIN，即全外连接，返回左表和右表连接后的所有记录。如果某个表中的记录没有与另一个表中的记录匹配，则会返回 NULL 值。__FULL JOIN 只能使用显式连接方式。__

## 4 示例数据

在[示例数据页面](../Reference/Sample-Data.md)中，包含了用于构建表结构和插入数据的SQL语句，下载并在IoTDB CLI中执行这些语句，即可将数据导入IoTDB，您可以使用这些数据来测试和执行示例中的SQL语句，并获得相应的结果。

### 4.1 From 示例

#### 4.1.1 从单个表查询

示例 1：此查询将返回 `table1` 中的所有记录，并按时间排序。

```sql
SELECT * FROM table1 ORDER BY time;
```

查询结果：

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

示例 2：此查询将返回 `table1`中`device`为`101`的记录，并按时间排序。

```sql
SELECT * FROM table1 t1 where t1.device_id='101' order by time;
```

查询结果：

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

#### 4.1.2 从子查询中查询

示例 1：此查询将返回 `table1` 中的记录总数。

```sql
SELECT COUNT(*) AS count FROM (SELECT * FROM table1);
```

查询结果：

```sql
+-----+
|count|
+-----+
|   18|
+-----+
Total line number = 1
It costs 0.072s
```

### 4.2 Join 示例

#### 4.2.1 Inner Join

示例 1：显式连接

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

查询结果：

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

示例 2：显式连接

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

查询结果：

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

示例 3：隐式连接

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

查询结果：

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

示例 1：显式连接

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

查询结果：

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

示例 2：显式连接

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

查询结果：

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