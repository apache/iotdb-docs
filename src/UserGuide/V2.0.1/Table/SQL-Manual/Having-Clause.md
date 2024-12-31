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

## Syntax Overview

```sql
HAVING booleanExpression
```

### HAVING Clause

The HAVING clause is used to filter the results of a query after the data has been grouped and aggregated by GROUP BY.

#### Notes

- In terms of syntax, the `HAVING` clause is similar to the `WHERE` clause. The WHERE clause filters data before grouping and aggregation, while the HAVING clause filters the results after grouping and aggregation has been performed.


## Example Data

In the [Example Data page](../Basic-Concept/Sample-Data.md), there are SQL statements for building the table structure and inserting data. By downloading and executing these statements in the IoTDB CLI, you can import data into IoTDB. You can use this data to test and execute the SQL statements in the examples and obtain the corresponding results.

#### Example 1: Filtering Devices with Counts Below a Specific Value

The query calculates the number of entries for each `device_id` in `table1` and filters out devices that have a count below 5.

```sql
SELECT device_id, COUNT(*)
  FROM table1
  GROUP BY device_id
  HAVING COUNT(*) >= 5;
```

The execution results are as follows:

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

### Example 2: Calculate the Hourly Average Temperature for Each Device and Filter

The query calculates the average temperature per hour for each device in `table1` and filters out devices with an average temperature below 85.0.


```sql
SELECT date_bin(1h, time) as hour_time, device_id, AVG(temperature) as avg_temp
  FROM table1
  GROUP BY date_bin(1h, time), device_id
  HAVING AVG(temperature) >= 85.0;
```

The execution results are as follows:

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