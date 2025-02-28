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

# GROUP BY Clause

## 1. Syntax Overview

```sql
GROUP BY expression (',' expression)*
```

- The `GROUP BY` clause is used to group the result set of a `SELECT` statement based on the specified column values. The values of the grouping columns remain unchanged in the results, while other columns with the same grouping column values are calculated using specified aggregate functions (e.g., `COUNT`, `AVG`).

![](/img/groupby01.png)


## 2. Notes

#### 2.1 Items in the `SELECT` Clause 

Items in the `SELECT` clause must either include aggregate functions or consist of columns specified in the `GROUP BY` clause.

Valid Example:

```sql
SELECT concat(device_id, model_id), avg(temperature) 
  FROM table1 
  GROUP BY device_id, model_id; -- valid
```

Result:

```sql
+-----+-----+
|_col0|_col1|
+-----+-----+
| 100A| 90.0|
| 100C| 86.0|
| 100E| 90.0|
| 101B| 85.0|
| 101D| 85.0|
| 101F| 90.0|
+-----+-----+
Total line number = 6
It costs 0.094s
```

Invalid Example 1:

```sql
SELECT device_id, temperature  
  FROM table1  
  GROUP BY device_id;-- invalid
```

Error Message:

```sql
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701:
  'temperature' must be an aggregate expression or appear in GROUP BY clause
```

Invalid Example 2:

```sql
SELECT device_id, avg(temperature) 
  FROM table1  
  GROUP BY model; -- invalid
```

Error Message:

```sql
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701:
  Column 'model' cannot be resolved
```

#### 2.2 Without a `GROUP BY` Clause

If there is no `GROUP BY` clause, all items in the `SELECT` clause must either include aggregate functions or exclude them entirely.

Valid Example:

```sql
SELECT COUNT(*), avg(temperature) 
  FROM table1; -- valid
```

Result:

```sql
+-----+-----------------+
|_col0|            _col1|
+-----+-----------------+
|   18|87.33333333333333|
+-----+-----------------+
Total line number = 1
It costs 0.094s
```

Invalid Example:

```sql
SELECT humidity, avg(temperature) FROM table1;   -- invalid
```

Result:

```sql
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701: 
  'humidity' must be an aggregate expression or appear in GROUP BY clause
```

#### 2.3 Using Constant Integers in `GROUP BY` Clause

The `GROUP BY` clause supports referencing `SELECT` items using constant integers starting from 1. If the constant is less than 1 or exceeds the size of the `SELECT` item list, an error will occur.

Example:

```sql
SELECT date_bin(1h, time), device_id, avg(temperature)
  FROM table1
  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00
  GROUP BY 1, device_id;
```

Result:

```sql
+-----------------------------+---------+-----+
|                        _col0|device_id|_col2|
+-----------------------------+---------+-----+
|2024-11-28T08:00:00.000+08:00|      100| 85.0|
|2024-11-28T09:00:00.000+08:00|      100| null|
|2024-11-28T10:00:00.000+08:00|      100| 85.0|
|2024-11-28T11:00:00.000+08:00|      100| 88.0|
|2024-11-27T16:00:00.000+08:00|      101| 85.0|
+-----------------------------+---------+-----+
Total line number = 5
It costs 0.092s
```

#### 2.4 Alias Restrictions in `GROUP BY` Clause 

Aliases from `SELECT` items cannot be used in the `GROUP BY` clause. Use the original expression instead.

Example:

```sql
SELECT date_bin(1h, time) AS hour_time, device_id, avg(temperature)
  FROM table1
  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00
  GROUP BY date_bin(1h, time), device_id;
```

Result:

```sql
+-----------------------------+---------+-----+
|                    hour_time|device_id|_col2|
+-----------------------------+---------+-----+
|2024-11-28T08:00:00.000+08:00|      100| 85.0|
|2024-11-28T09:00:00.000+08:00|      100| null|
|2024-11-28T10:00:00.000+08:00|      100| 85.0|
|2024-11-28T11:00:00.000+08:00|      100| 88.0|
|2024-11-27T16:00:00.000+08:00|      101| 85.0|
+-----------------------------+---------+-----+
Total line number = 5
It costs 0.092s
```

#### 2.5 Using Aggregate Functions with `\*` 

Only the `COUNT` function can be used with `*` to calculate the total number of rows. Using `*` with other aggregate functions will result in an error.

Example:

```sql
SELECT count(*) FROM table1;
```

Result:

```sql
+-----+
|_col0|
+-----+
|   18|
+-----+
Total line number = 1
It costs 0.047s
```

## 3. Sample Data and Usage Examples

The [Example Data page](../Reference/Sample-Data.md)page provides SQL statements to construct table schemas and insert data. By downloading and executing these statements in the IoTDB CLI, you can import the data into IoTDB. This data can be used to test and run the example SQL queries included in this documentation, allowing you to reproduce the described results.

#### Example 1: Downsampling Time-Series Data

Downsample the temperature of device `101` over the specified time range, returning one average temperature per hour:

```sql
SELECT date_bin(1h, time) AS hour_time, AVG(temperature) AS avg_temperature
  FROM table1
  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-30 00:00:00
  AND device_id='101'
  GROUP BY 1;
```

Result:

```sql
+-----------------------------+---------------+
|                    hour_time|avg_temperature|
+-----------------------------+---------------+
|2024-11-29T10:00:00.000+08:00|           85.0|
|2024-11-27T16:00:00.000+08:00|           85.0|
+-----------------------------+---------------+
Total line number = 2
It costs 0.054s
```

Downsample the temperature of all devices over the past day, returning one average temperature per hour for each device:

```sql
SELECT date_bin(1h, time) AS hour_time, device_id, AVG(temperature) AS avg_temperature
  FROM table1
  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-30 00:00:00
  GROUP BY 1, device_id;
```

Result:

```sql
+-----------------------------+---------+---------------+
|                    hour_time|device_id|avg_temperature|
+-----------------------------+---------+---------------+
|2024-11-29T11:00:00.000+08:00|      100|           null|
|2024-11-29T18:00:00.000+08:00|      100|           90.0|
|2024-11-28T08:00:00.000+08:00|      100|           85.0|
|2024-11-28T09:00:00.000+08:00|      100|           null|
|2024-11-28T10:00:00.000+08:00|      100|           85.0|
|2024-11-28T11:00:00.000+08:00|      100|           88.0|
|2024-11-29T10:00:00.000+08:00|      101|           85.0|
|2024-11-27T16:00:00.000+08:00|      101|           85.0|
+-----------------------------+---------+---------------+
Total line number = 8
It costs 0.081s
```


For more details on the `date_bin` function, refer to the **Definition of Date Bin (Time Bucketing)** feature documentation.

#### Example 2: Query the Latest Data Point for Each Device

```sql
SELECT device_id, LAST(temperature), LAST_BY(time, temperature)
  FROM table1
  GROUP BY device_id;
```

Result:

```sql
+---------+-----+-----------------------------+
|device_id|_col1|                        _col2|
+---------+-----+-----------------------------+
|      100| 90.0|2024-11-29T18:30:00.000+08:00|
|      101| 90.0|2024-11-30T14:30:00.000+08:00|
+---------+-----+-----------------------------+
Total line number = 2
It costs 0.078s
```

#### Example 3: Count Total Rows

Count the total number of rows for all devices:

```sql
SELECT COUNT(*) FROM table1;
```

Result:

```sql
+-----+
|_col0|
+-----+
|   18|
+-----+
Total line number = 1
It costs 0.060s
```

Count the total number of rows for each device:

```sql
SELECT device_id, COUNT(*) AS total_rows
  FROM table1
  GROUP BY device_id;
```

Result:

```sql
+---------+----------+
|device_id|total_rows|
+---------+----------+
|      100|         8|
|      101|        10|
+---------+----------+
Total line number = 2
It costs 0.060s
```

#### Example 4: Aggregate without a `GROUP BY` Clause

Query the maximum temperature across all devices:

```sql
SELECT MAX(temperature)
FROM table1;
```

Result:

```sql
+-----+
|_col0|
+-----+
| 90.0|
+-----+
Total line number = 1
It costs 0.086s
```

#### Example 5: Aggregate Results from a Subquery

Query the combinations of plants and devices where the average temperature exceeds 80.0 over a specified time range and has at least two records:

```sql
SELECT plant_id, device_id 
FROM (
    SELECT date_bin(10m, time) AS time, plant_id, device_id, AVG(temperature) AS temp FROM table1 WHERE time >= 2024-11-26 00:00:00 AND time <= 2024-11-29 00:00:00
    GROUP BY 1, plant_id, device_id
) 
WHERE temp > 80.0 
GROUP BY plant_id, device_id 
HAVING COUNT(*) > 1;
```

Result:

```sql
+--------+---------+
|plant_id|device_id|
+--------+---------+
|    1001|      101|
|    3001|      100|
+--------+---------+
Total line number = 2
It costs 0.073s
```