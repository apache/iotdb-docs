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

# HAVING Clause

## 1 Syntax Overview

```sql
HAVING booleanExpression
```

### 1.1 HAVING Clause


The `HAVING` clause is used to filter aggregated results after a `GROUP BY` operation has been applied.

#### Notes

In terms of syntax, the `HAVING` clause is similar to the `WHERE` clause. However, while `WHERE` filters rows before grouping and aggregation, `HAVING` filters the results after grouping and aggregation.

## 2 Sample Data and Usage Examples

The [Example Data page](../Reference/Sample-Data.md)page provides SQL statements to construct table schemas and insert data. By downloading and executing these statements in the IoTDB CLI, you can import the data into IoTDB. This data can be used to test and run the example SQL queries included in this documentation, allowing you to reproduce the described results.

#### Example 1: Filtering Devices with Entry Counts Below a Certain Threshold

This query calculates the number of entries (`COUNT(*)`) for each `device_id` in the `table1` table and filters out devices with a count less than 5.

```sql
SELECT device_id, COUNT(*)
  FROM table1
  GROUP BY device_id
  HAVING COUNT(*) >= 5;
```

Result:

```sql
+---------+-----+
|device_id|_col1|
+---------+-----+
|      100|    8|
|      101|   10|
+---------+-----+
Total line number = 2
It costs 0.063s
```

### Example 2: Calculating Hourly Average Temperatures and Filtering Results

This query calculates the hourly average temperature (`AVG(temperature)`) for each device in the `table1` table and filters out those with an average temperature below 85.0.

```sql
SELECT date_bin(1h, time) as hour_time, device_id, AVG(temperature) as avg_temp
  FROM table1
  GROUP BY date_bin(1h, time), device_id
  HAVING AVG(temperature) >= 85.0;
```

Result:

```sql
+-----------------------------+---------+--------+
|                    hour_time|device_id|avg_temp|
+-----------------------------+---------+--------+
|2024-11-29T18:00:00.000+08:00|      100|    90.0|
|2024-11-28T08:00:00.000+08:00|      100|    85.0|
|2024-11-28T10:00:00.000+08:00|      100|    85.0|
|2024-11-28T11:00:00.000+08:00|      100|    88.0|
|2024-11-26T13:00:00.000+08:00|      100|    90.0|
|2024-11-30T09:00:00.000+08:00|      101|    90.0|
|2024-11-30T14:00:00.000+08:00|      101|    90.0|
|2024-11-29T10:00:00.000+08:00|      101|    85.0|
|2024-11-27T16:00:00.000+08:00|      101|    85.0|
+-----------------------------+---------+--------+
Total line number = 9
It costs 0.079s
```