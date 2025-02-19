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

# LIMIT & OFFSET Clause

## 1 Syntax Overview

```sql
OFFSET INTEGER_VALUE LIMIT INTEGER_VALUE
```

### 1.1 LIMIT Clause

The `LIMIT` clause is applied in the final stage of a query to restrict the number of rows returned.

#### Notes

- When `LIMIT` is used without an `ORDER BY` clause, the result order may not be deterministic.
- The `LIMIT` clause requires a non-negative integer.

### 1.2 OFFSET Clause

The `OFFSET` clause works in conjunction with the `LIMIT` clause to skip a specified number of rows in the query result. This is particularly useful for pagination or retrieving data starting from a specific position.

#### Notes

- The `OFFSET` clause also requires a non-negative integer.
- If the total number of rows (`n`) is greater than or equal to the sum of `OFFSET` and `LIMIT`, the query returns `LIMIT` rows.
- If the total number of rows (`n`) is less than the sum of `OFFSET` and `LIMIT`, the query returns rows from `OFFSET` to the end of the dataset, up to a maximum of `n - OFFSET`.

## 2 Sample Data and Usage Examples

The [Example Data page](../Reference/Sample-Data.md)page provides SQL statements to construct table schemas and insert data. By downloading and executing these statements in the IoTDB CLI, you can import the data into IoTDB. This data can be used to test and run the example SQL queries included in this documentation, allowing you to reproduce the described results.

#### Example 1: Retrieve the Latest Row for a Device

```sql
SELECT *
  FROM table1
  ORDER BY time DESC
  LIMIT 1;
```

Result:

```sql
+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+
|                         time|region|plant_id|device_id|model_id|maintenance|temperature|humidity|status|                   modifytime|
+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+
|2024-11-30T14:30:00.000+08:00|  上海|    3002|      101|       F|        360|       90.0|    34.8|  true|2024-11-30T14:30:17.000+08:00|
+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+
Total line number = 1
It costs 0.103s
```

#### Example 2: Query the Top 10 Rows by Highest Temperature

```sql
SELECT *
  FROM table1
  ORDER BY temperature DESC NULLS LAST
  LIMIT 10;
```

Result:

```sql
+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+
|                         time|region|plant_id|device_id|model_id|maintenance|temperature|humidity|status|                   modifytime|
+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+
|2024-11-30T09:30:00.000+08:00|  上海|    3002|      101|       F|        360|       90.0|    35.2|  true|                         null|
|2024-11-26T13:38:00.000+08:00|  北京|    1001|      100|       A|        180|       90.0|    35.1|  true|2024-11-26T13:38:25.000+08:00|
|2024-11-30T14:30:00.000+08:00|  上海|    3002|      101|       F|        360|       90.0|    34.8|  true|2024-11-30T14:30:17.000+08:00|
|2024-11-26T13:37:00.000+08:00|  北京|    1001|      100|       A|        180|       90.0|    35.1|  true|2024-11-26T13:37:34.000+08:00|
|2024-11-29T18:30:00.000+08:00|  上海|    3002|      100|       E|        180|       90.0|    35.4|  true|2024-11-29T18:30:15.000+08:00|
|2024-11-28T11:00:00.000+08:00|  上海|    3001|      100|       C|         90|       88.0|    45.1|  true|2024-11-28T11:00:12.000+08:00|
|2024-11-28T10:00:00.000+08:00|  上海|    3001|      100|       C|         90|       85.0|    35.2|  null|2024-11-28T10:00:11.000+08:00|
|2024-11-28T08:00:00.000+08:00|  上海|    3001|      100|       C|         90|       85.0|    null|  null|2024-11-28T08:00:09.000+08:00|
|2024-11-29T10:00:00.000+08:00|  上海|    3001|      101|       D|        360|       85.0|    null|  null|2024-11-29T10:00:13.000+08:00|
|2024-11-27T16:40:00.000+08:00|  北京|    1001|      101|       B|        180|       85.0|    null|  null|2024-11-26T16:37:03.000+08:00|
+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+
Total line number = 10
It costs 0.063s
```

#### Example 3: Select 5 Rows Starting from a Specific Position

```sql
SELECT *
  FROM table1
  ORDER BY TIME
  OFFSET 5
  LIMIT 5;
```

Result:

```sql
+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+
|                         time|region|plant_id|device_id|model_id|maintenance|temperature|humidity|status|                   modifytime|
+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+
|2024-11-27T16:41:00.000+08:00|  北京|    1001|      101|       B|        180|       85.0|    null|  null|2024-11-26T16:37:04.000+08:00|
|2024-11-27T16:42:00.000+08:00|  北京|    1001|      101|       B|        180|       null|    35.2| false|                         null|
|2024-11-27T16:43:00.000+08:00|  北京|    1001|      101|       B|        180|       null|    null| false|                         null|
|2024-11-27T16:44:00.000+08:00|  北京|    1001|      101|       B|        180|       null|    null| false|2024-11-26T16:37:08.000+08:00|
|2024-11-28T08:00:00.000+08:00|  上海|    3001|      100|       C|         90|       85.0|    null|  null|2024-11-28T08:00:09.000+08:00|
+-----------------------------+------+--------+---------+--------+-----------+-----------+--------+------+-----------------------------+
Total line number = 5
It costs 0.069s
```