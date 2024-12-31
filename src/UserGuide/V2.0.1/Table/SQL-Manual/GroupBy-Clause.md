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

## Syntax Overview

```sql
GROUP BY expression (',' expression)*
```

- The GROUP BY clause is used to group the result set of a SELECT statement by specified column values. The values of these grouping columns remain unchanged in the result, while all records with the same grouping column values in other columns are calculated through specified aggregate functions (such as COUNT, AVG).

![](https://alioss.timecho.com/docs/img/groupby01.png)


## Notes

- Items in the SELECT clause must include aggregate functions or consist of columns that appear in the GROUP BY clause.

Valid Example:

```sql
SELECT concat(device_id, model_id), avg(temperature) 
  FROM table1 
  GROUP BY device_id, model_id; -- Valid
```

Execution results are as follows:


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
  GROUP BY device_id;-- Invalid
```

Execution results are as follows:

```sql
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701:
  'temperature' must be an aggregate expression or appear in GROUP BY clause
```

Invalid Example 2:

```sql
SELECT device_id, avg(temperature) 
  FROM table1  
  GROUP BY model; -- 不合法
```

Execution results are as follows:

```sql
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701:
  Column 'model' cannot be resolved
```

- If there is no GROUP BY clause, then all items in the SELECT clause must either include aggregate functions or none at all.

Valid Example:

```sql
SELECT COUNT(*), avg(temperature) 
  FROM table1; -- Valid
```

Execution results are as follows:

```sql
+-----+-----------------+
|_col0|            _col1|
+-----+-----------------+
|   18|87.33333333333333|
+-----+-----------------+
Total line number = 1
It costs 0.094s
```

Invalid Example ：

```sql
SELECT humidity, avg(temperature) FROM table1;    -- Invalid
```

Execution results are as follows:

```sql
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701: 
  'humidity' must be an aggregate expression or appear in GROUP BY clause
```

- The GROUP BY clause can use constant integers starting from 1 to reference items in the SELECT clause; if the constant integer is less than 1 or greater than the size of the selection list, an error will be thrown.

```sql
SELECT date_bin(1h, time), device_id, avg(temperature)
  FROM table1
  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00
  GROUP BY 1, device_id;
```

Execution results are as follows:

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

- Aliases of select items are not supported in the group by clause. The following SQL will throw an error and can be replaced with the above SQL.

```sql
SELECT date_bin(1h, time) AS hour_time, device_id, avg(temperature)
  FROM table1
  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00
  GROUP BY date_bin(1h, time), device_id;
```

Execution results are as follows:

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

- Only the COUNT function can be used with an asterisk (*) to calculate the total number of rows in the table. Other aggregate functions used with * will throw an error.

```sql
SELECT count(*) FROM table1;
```

Execution results are as follows:

```sql
+-----+
|_col0|
+-----+
|   18|
+-----+
Total line number = 1
It costs 0.047s
```

## Example Data

In the [Example Data page](../Basic-Concept/Sample-Data.md), there are SQL statements for building the table structure and inserting data. By downloading and executing these statements in the IoTDB CLI, you can import data into IoTDB. You can use this data to test and execute the SQL statements in the examples and obtain the corresponding results.

#### Example 1: Downsampling Time Series Data

Downsample the temperature of device 101 within the specified time range, returning the average temperature per hour.

```sql
SELECT date_bin(1h, time) AS hour_time, AVG(temperature) AS avg_temperature
  FROM table1
  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-30 00:00:00
  AND device_id='101'
  GROUP BY 1;
```

Execution results are as follows:

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

Downsample the temperature for each device over the past day, returning the average temperature per hour.


```sql
SELECT date_bin(1h, time) AS hour_time, device_id, AVG(temperature) AS avg_temperature
  FROM table1
  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-30 00:00:00
  GROUP BY 1, device_id;
```

Execution results are as follows:

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

For more information about the date_bin function, please refer to the date_bin function definition

#### Example 2: Querying the Latest Data Point for Each Device

```sql
SELECT device_id, LAST(temperature), LAST_BY(time, temperature)
  FROM table1
  GROUP BY device_id;
```

Execution results are as follows:

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

#### Example 3: Calculating Total Number of Rows

Calculate the total number of rows for all devices:


```sql
SELECT COUNT(*) FROM table1;
```

Execution results are as follows:

```sql
+-----+
|_col0|
+-----+
|   18|
+-----+
Total line number = 1
It costs 0.060s
```

Execution results are as follows:

```sql
SELECT device_id, COUNT(*) AS total_rows
  FROM table1
  GROUP BY device_id;
```

Execution results are as follows:

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

#### Example 4: Aggregation Without GROUP BY Clause

Query the maximum temperature among all devices:

```sql
SELECT MAX(temperature)
FROM table1;
```

Execution results are as follows:

```sql
+-----+
|_col0|
+-----+
| 90.0|
+-----+
Total line number = 1
It costs 0.086s
```

#### Example 5: Aggregating on the Results of a Subquery

Query the combinations of devices and factories with an average temperature exceeding 80.0 and at least two records within the specified time period:

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

Execution results are as follows:

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