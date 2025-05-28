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
# Featured Functions

## 1. Downsampling Functions

### 1.1 `date_bin` Function

#### **Description**

The `date_bin` function is a scalar function that aligns timestamps to the start of specified time intervals. It is commonly used with the `GROUP BY` clause for downsampling.

- **Partial Intervals May Be Empty:** Only timestamps that meet the conditions are aligned; missing intervals are not filled.
- **All Intervals Return Empty:** If no data exists within the query range, the downsampling result is an empty set.

#### **Usage Examples**

[Sample Dataset](../Reference/Sample-Data.md): The example data page contains SQL statements for building table structures and inserting data. Download and execute these statements in the IoTDB CLI to import the data into IoTDB. You can use this data to test and execute the SQL statements in the examples and obtain the corresponding results.

**Example 1: Hourly Average Temperature for Device 100**

```SQL
SELECT date_bin(1h, time) AS hour_time, avg(temperature) AS avg_temp
FROM table1
WHERE (time >= 2024-11-27 00:00:00  AND time <= 2024-11-30 00:00:00)
      AND device_id = '100'
GROUP BY 1;
```

**Result**

```Plain
+-----------------------------+--------+
|                    hour_time|avg_temp|
+-----------------------------+--------+
|2024-11-29T11:00:00.000+08:00|    null|
|2024-11-29T18:00:00.000+08:00|    90.0|
|2024-11-28T08:00:00.000+08:00|    85.0|
|2024-11-28T09:00:00.000+08:00|    null|
|2024-11-28T10:00:00.000+08:00|    85.0|
|2024-11-28T11:00:00.000+08:00|    88.0|
+-----------------------------+--------+
```

**Example 2: Hourly Average Temperature for Each Device**

```SQL
SELECT date_bin(1h, time) AS hour_time, device_id, avg(temperature) AS avg_temp
FROM table1
WHERE time >= 2024-11-27 00:00:00  AND time <= 2024-11-30 00:00:00
GROUP BY 1, device_id;
```

**Result**

```Plain
+-----------------------------+---------+--------+
|                    hour_time|device_id|avg_temp|
+-----------------------------+---------+--------+
|2024-11-29T11:00:00.000+08:00|      100|    null|
|2024-11-29T18:00:00.000+08:00|      100|    90.0|
|2024-11-28T08:00:00.000+08:00|      100|    85.0|
|2024-11-28T09:00:00.000+08:00|      100|    null|
|2024-11-28T10:00:00.000+08:00|      100|    85.0|
|2024-11-28T11:00:00.000+08:00|      100|    88.0|
|2024-11-29T10:00:00.000+08:00|      101|    85.0|
|2024-11-27T16:00:00.000+08:00|      101|    85.0|
+-----------------------------+---------+--------+
```

**Example 3: Hourly Average Temperature for All Devices**

```SQL
SELECT date_bin(1h, time) AS hour_time, avg(temperature) AS avg_temp
  FROM table1
  WHERE time >= 2024-11-27 00:00:00  AND time <= 2024-11-30 00:00:00
  group by 1;  
```

**Result**

```Plain
+-----------------------------+--------+
|                    hour_time|avg_temp|
+-----------------------------+--------+
|2024-11-29T10:00:00.000+08:00|    85.0|
|2024-11-27T16:00:00.000+08:00|    85.0|
|2024-11-29T11:00:00.000+08:00|    null|
|2024-11-29T18:00:00.000+08:00|    90.0|
|2024-11-28T08:00:00.000+08:00|    85.0|
|2024-11-28T09:00:00.000+08:00|    null|
|2024-11-28T10:00:00.000+08:00|    85.0|
|2024-11-28T11:00:00.000+08:00|    88.0|
+-----------------------------+--------+
```

### 1.2 `date_bin_gapfill` Function

#### **Description:**

The `date_bin_gapfill` function is an extension of `date_bin` that fills in missing time intervals, returning a complete time series.

- **Partial Intervals May Be Empty**: Aligns timestamps for data that meets the conditions and fills in missing intervals.
- **All Intervals Return Empty**: If no data exists within the query range, the result is an empty set.

#### **Limitations:**

1. The function must always be used with the `GROUP BY` clause. If used elsewhere, it behaves like `date_bin` without gap-filling.
2. A `GROUP BY` clause can contain only one instance of date_bin_gapfill. Multiple calls will result in an error.
3. The `GAPFILL` operation occurs after the `HAVING` clause and before the `FILL` clause.
4. The `WHERE` clause must include time filters in one of the following forms:
   1. `time >= XXX AND time <= XXX`
   2. `time > XXX AND time < XXX`
   3. `time BETWEEN XXX AND XXX`
5. If additional time filters or conditions are used, an error is raised. Time conditions and other value filters must be connected using the `AND` operator.
6. If `startTime` and `endTime` cannot be inferred from the `WHERE` clause, an error is raised.

**Usage Examples**

**Example 1: Fill Missing Intervals**

```SQL
SELECT date_bin_gapfill(1h, time) AS hour_time, avg(temperature) AS avg_temp
FROM table1
WHERE (time >= 2024-11-28 07:00:00  AND time <= 2024-11-28 16:00:00)
      AND device_id = '100'
GROUP BY 1;
```

**Result**

```Plain
+-----------------------------+--------+
|                    hour_time|avg_temp|
+-----------------------------+--------+
|2024-11-28T07:00:00.000+08:00|    null|
|2024-11-28T08:00:00.000+08:00|    85.0|
|2024-11-28T09:00:00.000+08:00|    null|
|2024-11-28T10:00:00.000+08:00|    85.0|
|2024-11-28T11:00:00.000+08:00|    88.0|
|2024-11-28T12:00:00.000+08:00|    null|
|2024-11-28T13:00:00.000+08:00|    null|
|2024-11-28T14:00:00.000+08:00|    null|
|2024-11-28T15:00:00.000+08:00|    null|
|2024-11-28T16:00:00.000+08:00|    null|
+-----------------------------+--------+
```

**Example 2: Fill Missing Intervals with Device Grouping**

```SQL
SELECT date_bin_gapfill(1h, time) AS hour_time, device_id, avg(temperature) AS avg_temp
FROM table1
WHERE time >= 2024-11-28 07:00:00  AND time <= 2024-11-28 16:00:00
GROUP BY 1, device_id;
```

**Result**

```Plain
+-----------------------------+---------+--------+
|                    hour_time|device_id|avg_temp|
+-----------------------------+---------+--------+
|2024-11-28T07:00:00.000+08:00|      100|    null|
|2024-11-28T08:00:00.000+08:00|      100|    85.0|
|2024-11-28T09:00:00.000+08:00|      100|    null|
|2024-11-28T10:00:00.000+08:00|      100|    85.0|
|2024-11-28T11:00:00.000+08:00|      100|    88.0|
|2024-11-28T12:00:00.000+08:00|      100|    null|
|2024-11-28T13:00:00.000+08:00|      100|    null|
|2024-11-28T14:00:00.000+08:00|      100|    null|
|2024-11-28T15:00:00.000+08:00|      100|    null|
|2024-11-28T16:00:00.000+08:00|      100|    null|
+-----------------------------+---------+--------+
```

**Example 3: Empty Result Set for No Data in Range**

```SQL
SELECT date_bin_gapfill(1h, time) AS hour_time, device_id, avg(temperature) AS avg_temp
FROM table1
WHERE time >= 2024-11-27 09:00:00  AND time <= 2024-11-27 14:00:00
GROUP BY 1, device_id;
```

**Result**

```Plain
+---------+---------+--------+
|hour_time|device_id|avg_temp|
+---------+---------+--------+
+---------+---------+--------+
```

## 2. `DIFF` Function

### 2.1 **Description:**

- The `DIFF` function calculates the difference between the current row and the previous row. For the first row, it returns `NULL` since there is no previous row.

### 2.2 **Function Definition:**

```
DIFF(numberic[, boolean]) -> Double
```

### 2.3 **Parameters:**

#### **First Parameter (numeric):**

- **Type**: Must be numeric (`INT32`, `INT64`, `FLOAT`, `DOUBLE`).
- **Purpose**: Specifies the column for which to calculate the difference.

#### **Second Parameter (boolean, optional):**

- **Type**: Boolean (`true` or `false`).
- **Default**: `true`.
- **Purpose**:
  - `true`: Ignores `NULL` values and uses the first non-`NULL` value for calculation. If no non-`NULL` value exists, returns `NULL`.
  - `false`: Does not ignore `NULL` values. If the previous row is `NULL`, the result is `NULL`.

### 2.4 **Notes:**

- In **tree models**, the second parameter must be specified as `'ignoreNull'='true'` or `'ignoreNull'='false'`.
- In **table models**, simply use `true` or `false`. Using `'ignoreNull'='true'` or `'ignoreNull'='false'` in table models results in a string comparison and always evaluates to `false`.

### 2.5 **Usage Examples**

#### **Example 1: Ignore NULL Values**

```SQL
SELECT time, DIFF(temperature) AS diff_temp
FROM table1
WHERE device_id = '100';
```

**Result**

```Plain
+-----------------------------+---------+
|                         time|diff_temp|
+-----------------------------+---------+
|2024-11-29T11:00:00.000+08:00|     null|
|2024-11-29T18:30:00.000+08:00|     null|
|2024-11-28T08:00:00.000+08:00|     -5.0|
|2024-11-28T09:00:00.000+08:00|     null|
|2024-11-28T10:00:00.000+08:00|      0.0|
|2024-11-28T11:00:00.000+08:00|      3.0|
|2024-11-26T13:37:00.000+08:00|      2.0|
|2024-11-26T13:38:00.000+08:00|      0.0|
+-----------------------------+---------+
```

#### **Example 2: Do Not Ignore NULL Values**

```SQL
SELECT time, DIFF(temperature, false) AS diff_temp
FROM table1
WHERE device_id = '100';
```

**Result**

```Plain
+-----------------------------+---------+
|                         time|diff_temp|
+-----------------------------+---------+
|2024-11-29T11:00:00.000+08:00|     null|
|2024-11-29T18:30:00.000+08:00|     null|
|2024-11-28T08:00:00.000+08:00|     -5.0|
|2024-11-28T09:00:00.000+08:00|     null|
|2024-11-28T10:00:00.000+08:00|     null|
|2024-11-28T11:00:00.000+08:00|      3.0|
|2024-11-26T13:37:00.000+08:00|      2.0|
|2024-11-26T13:38:00.000+08:00|      0.0|
+-----------------------------+---------+
```

#### **Example 3: Full Example**

```SQL
SELECT time, temperature, 
       DIFF(temperature) AS diff_temp_1,
       DIFF(temperature, false) AS diff_temp_2
FROM table1 
WHERE device_id = '100';
```

**Result**

```Plain
+-----------------------------+-----------+-----------+-----------+
|                         time|temperature|diff_temp_1|diff_temp_2|
+-----------------------------+-----------+-----------+-----------+
|2024-11-29T11:00:00.000+08:00|       null|       null|       null|
|2024-11-29T18:30:00.000+08:00|       90.0|       null|       null|
|2024-11-28T08:00:00.000+08:00|       85.0|       -5.0|       -5.0|
|2024-11-28T09:00:00.000+08:00|       null|       null|       null|
|2024-11-28T10:00:00.000+08:00|       85.0|        0.0|       null|
|2024-11-28T11:00:00.000+08:00|       88.0|        3.0|        3.0|
|2024-11-26T13:37:00.000+08:00|       90.0|        2.0|        2.0|
|2024-11-26T13:38:00.000+08:00|       90.0|        0.0|        0.0|
+-----------------------------+-----------+-----------+-----------+
```

## 3 Table-Valued Functions

The sample data is as follows:

```SQL
IoTDB> SELECT * FROM bid;
+-----------------------------+--------+-----+
|                         time|stock_id|price|
+-----------------------------+--------+-----+
|2021-01-01T09:05:00.000+08:00|    AAPL|100.0|
|2021-01-01T09:06:00.000+08:00|    TESL|200.0|
|2021-01-01T09:07:00.000+08:00|    AAPL|103.0|
|2021-01-01T09:07:00.000+08:00|    TESL|202.0|
|2021-01-01T09:09:00.000+08:00|    AAPL|102.0|
|2021-01-01T09:15:00.000+08:00|    TESL|195.0|
+-----------------------------+--------+-----+

-- Create table statement
CREATE TABLE bid(time TIMESTAMP TIME, stock_id STRING TAG, price FLOAT FIELD);
-- Insert data
INSERT INTO bid(time, stock_id, price) VALUES('2021-01-01T09:05:00','AAPL',100.0),('2021-01-01T09:06:00','TESL',200.0),('2021-01-01T09:07:00','AAPL',103.0),('2021-01-01T09:07:00','TESL',202.0),('2021-01-01T09:09:00','AAPL',102.0),('2021-01-01T09:15:00','TESL',195.0);
```

### 3.1 HOP

#### Function Description

The HOP function segments data into overlapping time windows for analysis, assigning each row to all windows that overlap with its timestamp. If windows overlap (when SLIDE < SIZE), data will be duplicated across multiple windows.

#### Function Definition

```SQL
HOP(data, timecol, size, slide[, origin])
```

#### Parameter Description

| Parameter | Type   | Attributes                      | Description             |
| ----------- | -------- | --------------------------------- | ------------------------- |
| DATA      | Table  | ROW SEMANTIC, PASS THROUGH      | Input table             |
| TIMECOL   | Scalar | String (default: 'time')        | Time column             |
| SIZE      | Scalar | Long integer                    | Window size             |
| SLIDE     | Scalar | Long integer                    | Sliding step            |
| ORIGIN    | Scalar | Timestamp (default: Unix epoch) | First window start time |


#### Returned Results

The HOP function returns:

* `window_start`: Window start time (inclusive)
* `window_end`: Window end time (exclusive)
* Pass-through columns: All input columns from DATA

#### Usage Example

```SQL
IoTDB> SELECT * FROM HOP(DATA => bid,TIMECOL => 'time',SLIDE => 5m,SIZE => 10m);
+-----------------------------+-----------------------------+-----------------------------+--------+-----+
|                 window_start|                   window_end|                         time|stock_id|price|
+-----------------------------+-----------------------------+-----------------------------+--------+-----+
|2021-01-01T09:00:00.000+08:00|2021-01-01T09:10:00.000+08:00|2021-01-01T09:05:00.000+08:00|    AAPL|100.0|
|2021-01-01T09:05:00.000+08:00|2021-01-01T09:15:00.000+08:00|2021-01-01T09:05:00.000+08:00|    AAPL|100.0|
|2021-01-01T09:00:00.000+08:00|2021-01-01T09:10:00.000+08:00|2021-01-01T09:06:00.000+08:00|    TESL|200.0|
|2021-01-01T09:05:00.000+08:00|2021-01-01T09:15:00.000+08:00|2021-01-01T09:06:00.000+08:00|    TESL|200.0|
|2021-01-01T09:00:00.000+08:00|2021-01-01T09:10:00.000+08:00|2021-01-01T09:07:00.000+08:00|    AAPL|103.0|
|2021-01-01T09:00:00.000+08:00|2021-01-01T09:10:00.000+08:00|2021-01-01T09:07:00.000+08:00|    TESL|202.0|
|2021-01-01T09:05:00.000+08:00|2021-01-01T09:15:00.000+08:00|2021-01-01T09:07:00.000+08:00|    AAPL|103.0|
|2021-01-01T09:05:00.000+08:00|2021-01-01T09:15:00.000+08:00|2021-01-01T09:07:00.000+08:00|    TESL|202.0|
|2021-01-01T09:00:00.000+08:00|2021-01-01T09:10:00.000+08:00|2021-01-01T09:09:00.000+08:00|    AAPL|102.0|
|2021-01-01T09:05:00.000+08:00|2021-01-01T09:15:00.000+08:00|2021-01-01T09:09:00.000+08:00|    AAPL|102.0|
|2021-01-01T09:10:00.000+08:00|2021-01-01T09:20:00.000+08:00|2021-01-01T09:15:00.000+08:00|    TESL|195.0|
|2021-01-01T09:15:00.000+08:00|2021-01-01T09:25:00.000+08:00|2021-01-01T09:15:00.000+08:00|    TESL|195.0|
+-----------------------------+-----------------------------+-----------------------------+--------+-----+

-- Equivalent to tree model's GROUP BY TIME when combined with GROUP BY
IoTDB> SELECT window_start, window_end, stock_id, avg(price) as avg FROM HOP(DATA => bid,TIMECOL => 'time',SLIDE => 5m,SIZE => 10m) GROUP BY window_start, window_end, stock_id;
+-----------------------------+-----------------------------+--------+------------------+
|                 window_start|                   window_end|stock_id|               avg|
+-----------------------------+-----------------------------+--------+------------------+
|2021-01-01T09:00:00.000+08:00|2021-01-01T09:10:00.000+08:00|    TESL|             201.0|
|2021-01-01T09:05:00.000+08:00|2021-01-01T09:15:00.000+08:00|    TESL|             201.0|
|2021-01-01T09:10:00.000+08:00|2021-01-01T09:20:00.000+08:00|    TESL|             195.0|
|2021-01-01T09:15:00.000+08:00|2021-01-01T09:25:00.000+08:00|    TESL|             195.0|
|2021-01-01T09:00:00.000+08:00|2021-01-01T09:10:00.000+08:00|    AAPL|101.66666666666667|
|2021-01-01T09:05:00.000+08:00|2021-01-01T09:15:00.000+08:00|    AAPL|101.66666666666667|
+-----------------------------+-----------------------------+--------+------------------+
```

### 3.2 SESSION

#### Function Description

The SESSION function groups data into sessions based on time intervals. It checks the time gap between consecutive rows—rows with gaps smaller than the threshold (GAP) are grouped into the current window, while larger gaps trigger a new window.

#### Function Definition

```SQL
SESSION(data [PARTITION BY(pkeys, ...)] [ORDER BY(okeys, ...)], timecol, gap)
```
#### Parameter Description

| Parameter | Type   | Attributes                 | Description                          |
| ----------- | -------- | ---------------------------- | -------------------------------------- |
| DATA      | Table  | SET SEMANTIC, PASS THROUGH | Input table with partition/sort keys |
| TIMECOL   | Scalar | String (default: 'time')   | Time column name                     |
| GAP       | Scalar | Long integer               | Session gap threshold                |

#### Returned Results

The SESSION function returns:

* `window_start`: Time of the first row in the session
* `window_end`: Time of the last row in the session
* Pass-through columns: All input columns from DATA

#### Usage Example

```SQL
IoTDB> SELECT * FROM SESSION(DATA => bid PARTITION BY stock_id ORDER BY time,TIMECOL => 'time',GAP => 2m);
+-----------------------------+-----------------------------+-----------------------------+--------+-----+
|                 window_start|                   window_end|                         time|stock_id|price|
+-----------------------------+-----------------------------+-----------------------------+--------+-----+
|2021-01-01T09:06:00.000+08:00|2021-01-01T09:07:00.000+08:00|2021-01-01T09:06:00.000+08:00|    TESL|200.0|
|2021-01-01T09:06:00.000+08:00|2021-01-01T09:07:00.000+08:00|2021-01-01T09:07:00.000+08:00|    TESL|202.0|
|2021-01-01T09:15:00.000+08:00|2021-01-01T09:15:00.000+08:00|2021-01-01T09:15:00.000+08:00|    TESL|195.0|
|2021-01-01T09:05:00.000+08:00|2021-01-01T09:09:00.000+08:00|2021-01-01T09:05:00.000+08:00|    AAPL|100.0|
|2021-01-01T09:05:00.000+08:00|2021-01-01T09:09:00.000+08:00|2021-01-01T09:07:00.000+08:00|    AAPL|103.0|
|2021-01-01T09:05:00.000+08:00|2021-01-01T09:09:00.000+08:00|2021-01-01T09:09:00.000+08:00|    AAPL|102.0|
+-----------------------------+-----------------------------+-----------------------------+--------+-----+

-- Equivalent to tree model's GROUP BY SESSION when combined with GROUP BY
IoTDB> SELECT window_start, window_end, stock_id, avg(price) as avg FROM SESSION(DATA => bid PARTITION BY stock_id ORDER BY time,TIMECOL => 'time',GAP => 2m) GROUP BY window_start, window_end, stock_id;
+-----------------------------+-----------------------------+--------+------------------+
|                 window_start|                   window_end|stock_id|               avg|
+-----------------------------+-----------------------------+--------+------------------+
|2021-01-01T09:06:00.000+08:00|2021-01-01T09:07:00.000+08:00|    TESL|             201.0|
|2021-01-01T09:15:00.000+08:00|2021-01-01T09:15:00.000+08:00|    TESL|             195.0|
|2021-01-01T09:05:00.000+08:00|2021-01-01T09:09:00.000+08:00|    AAPL|101.66666666666667|
+-----------------------------+-----------------------------+--------+------------------+
```

### 3.3 VARIATION

#### Function Description

The VARIATION function groups data based on value differences. The first row becomes the baseline for the first window. Subsequent rows are compared to the baseline—if the difference is within the threshold (DELTA), they join the current window; otherwise, a new window starts with that row as the new baseline.

#### Function Definition

```sql
VARIATION(data [PARTITION BY(pkeys, ...)] [ORDER BY(okeys, ...)], col, delta)
```

#### Parameter Description

| Parameter | Type   | Attributes                 | Description                          |
| ----------- | -------- | ---------------------------- | -------------------------------------- |
| DATA      | Table  | SET SEMANTIC, PASS THROUGH | Input table with partition/sort keys |
| COL       | Scalar | String                     | Column for difference calculation    |
| DELTA     | Scalar | Float                      | Difference threshold                 |

#### Returned Results

The VARIATION function returns:

* `window_index`: Window identifier
* Pass-through columns: All input columns from DATA

#### Usage Example

```sql
IoTDB> SELECT * FROM VARIATION(DATA => bid PARTITION BY stock_id ORDER BY time,COL => 'price',DELTA => 2.0);
+------------+-----------------------------+--------+-----+
|window_index|                         time|stock_id|price|
+------------+-----------------------------+--------+-----+
|           0|2021-01-01T09:06:00.000+08:00|    TESL|200.0|
|           0|2021-01-01T09:07:00.000+08:00|    TESL|202.0|
|           1|2021-01-01T09:15:00.000+08:00|    TESL|195.0|
|           0|2021-01-01T09:05:00.000+08:00|    AAPL|100.0|
|           1|2021-01-01T09:07:00.000+08:00|    AAPL|103.0|
|           1|2021-01-01T09:09:00.000+08:00|    AAPL|102.0|
+------------+-----------------------------+--------+-----+

-- Equivalent to tree model's GROUP BY VARIATION when combined with GROUP BY
IoTDB> SELECT first(time) as window_start, last(time) as window_end, stock_id, avg(price) as avg FROM VARIATION(DATA => bid PARTITION BY stock_id ORDER BY time,COL => 'price', DELTA => 2.0) GROUP BY window_index, stock_id;
+-----------------------------+-----------------------------+--------+-----+
|                 window_start|                   window_end|stock_id|  avg|
+-----------------------------+-----------------------------+--------+-----+
|2021-01-01T09:06:00.000+08:00|2021-01-01T09:07:00.000+08:00|    TESL|201.0|
|2021-01-01T09:15:00.000+08:00|2021-01-01T09:15:00.000+08:00|    TESL|195.0|
|2021-01-01T09:05:00.000+08:00|2021-01-01T09:05:00.000+08:00|    AAPL|100.0|
|2021-01-01T09:07:00.000+08:00|2021-01-01T09:09:00.000+08:00|    AAPL|102.5|
+-----------------------------+-----------------------------+--------+-----+
```

### 3.4 CAPACITY

#### Function Description

The CAPACITY function groups data into fixed-size windows, where each window contains up to SIZE rows.

#### Function Definition

```sql
CAPACITY(data [PARTITION BY(pkeys, ...)] [ORDER BY(okeys, ...)], size)
```

#### Parameter Description

| Parameter | Type   | Attributes                 | Description                          |
| ----------- | -------- | ---------------------------- | -------------------------------------- |
| DATA      | Table  | SET SEMANTIC, PASS THROUGH | Input table with partition/sort keys |
| SIZE      | Scalar | Long integer               | Window size (row count)              |

#### Returned Results

The CAPACITY function returns:

* `window_index`: Window identifier
* Pass-through columns: All input columns from DATA

#### Usage Example

```sql
IoTDB> SELECT * FROM CAPACITY(DATA => bid PARTITION BY stock_id ORDER BY time, SIZE => 2);
+------------+-----------------------------+--------+-----+
|window_index|                         time|stock_id|price|
+------------+-----------------------------+--------+-----+
|           0|2021-01-01T09:06:00.000+08:00|    TESL|200.0|
|           0|2021-01-01T09:07:00.000+08:00|    TESL|202.0|
|           1|2021-01-01T09:15:00.000+08:00|    TESL|195.0|
|           0|2021-01-01T09:05:00.000+08:00|    AAPL|100.0|
|           0|2021-01-01T09:07:00.000+08:00|    AAPL|103.0|
|           1|2021-01-01T09:09:00.000+08:00|    AAPL|102.0|
+------------+-----------------------------+--------+-----+

-- Equivalent to tree model's GROUP BY COUNT when combined with GROUP BY
IoTDB> SELECT first(time) as start_time, last(time) as end_time, stock_id, avg(price) as avg FROM CAPACITY(DATA => bid PARTITION BY stock_id ORDER BY time, SIZE => 2) GROUP BY window_index, stock_id;
+-----------------------------+-----------------------------+--------+-----+
|                   start_time|                     end_time|stock_id|  avg|
+-----------------------------+-----------------------------+--------+-----+
|2021-01-01T09:06:00.000+08:00|2021-01-01T09:07:00.000+08:00|    TESL|201.0|
|2021-01-01T09:15:00.000+08:00|2021-01-01T09:15:00.000+08:00|    TESL|195.0|
|2021-01-01T09:05:00.000+08:00|2021-01-01T09:07:00.000+08:00|    AAPL|101.5|
|2021-01-01T09:09:00.000+08:00|2021-01-01T09:09:00.000+08:00|    AAPL|102.0|
+-----------------------------+-----------------------------+--------+-----+
```

### 3.5 TUMBLE

#### Function Description

The TUMBLE function assigns each row to a non-overlapping, fixed-size time window based on a timestamp attribute.

#### Function Definition

```sql
TUMBLE(data, timecol, size[, origin])
```
#### Parameter Description

| Parameter | Type   | Attributes                      | Description             |
| ----------- | -------- | --------------------------------- | ------------------------- |
| DATA      | Table  | ROW SEMANTIC, PASS THROUGH      | Input table             |
| TIMECOL   | Scalar | String (default: 'time')        | Time column             |
| SIZE      | Scalar | Long integer (positive)         | Window size             |
| ORIGIN    | Scalar | Timestamp (default: Unix epoch) | First window start time |

#### Returned Results

The TUMBLE function returns:

* `window_start`: Window start time (inclusive)
* `window_end`: Window end time (exclusive)
* Pass-through columns: All input columns from DATA

#### Usage Example

```SQL
IoTDB> SELECT * FROM TUMBLE( DATA => bid, TIMECOL => 'time', SIZE => 10m);
+-----------------------------+-----------------------------+-----------------------------+--------+-----+
|                 window_start|                   window_end|                         time|stock_id|price|
+-----------------------------+-----------------------------+-----------------------------+--------+-----+
|2021-01-01T09:00:00.000+08:00|2021-01-01T09:10:00.000+08:00|2021-01-01T09:06:00.000+08:00|    TESL|200.0|
|2021-01-01T09:00:00.000+08:00|2021-01-01T09:10:00.000+08:00|2021-01-01T09:07:00.000+08:00|    TESL|202.0|
|2021-01-01T09:10:00.000+08:00|2021-01-01T09:20:00.000+08:00|2021-01-01T09:15:00.000+08:00|    TESL|195.0|
|2021-01-01T09:00:00.000+08:00|2021-01-01T09:10:00.000+08:00|2021-01-01T09:05:00.000+08:00|    AAPL|100.0|
|2021-01-01T09:00:00.000+08:00|2021-01-01T09:10:00.000+08:00|2021-01-01T09:07:00.000+08:00|    AAPL|103.0|
|2021-01-01T09:00:00.000+08:00|2021-01-01T09:10:00.000+08:00|2021-01-01T09:09:00.000+08:00|    AAPL|102.0|
+-----------------------------+-----------------------------+-----------------------------+--------+-----+

-- Equivalent to tree model's GROUP BY TIME when combined with GROUP BY
IoTDB> SELECT window_start, window_end, stock_id, avg(price) as avg FROM TUMBLE(DATA => bid, TIMECOL => 'time', SIZE => 10m) GROUP BY window_start, window_end, stock_id;
+-----------------------------+-----------------------------+--------+------------------+
|                 window_start|                   window_end|stock_id|               avg|
+-----------------------------+-----------------------------+--------+------------------+
|2021-01-01T09:00:00.000+08:00|2021-01-01T09:10:00.000+08:00|    TESL|             201.0|
|2021-01-01T09:10:00.000+08:00|2021-01-01T09:20:00.000+08:00|    TESL|             195.0|
|2021-01-01T09:00:00.000+08:00|2021-01-01T09:10:00.000+08:00|    AAPL|101.66666666666667|
+-----------------------------+-----------------------------+--------+------------------+
```

### 3.6 CUMULATE

#### Function Description

The CUMULATE function creates expanding windows from an initial window, maintaining the same start time while incrementally extending the end time by STEP until reaching SIZE. Each window contains all elements within its range. For example, with a 1-hour STEP and 24-hour SIZE, daily windows would be: `[00:00, 01:00)`, `[00:00, 02:00)`, ..., `[00:00, 24:00)`.

#### Function Definition

```sql
CUMULATE(data, timecol, size, step[, origin])
```

#### Parameter Description

| Parameter | Type   | Attributes                      | Description                                       |
| ----------- | -------- | --------------------------------- | --------------------------------------------------- |
| DATA      | Table  | ROW SEMANTIC, PASS THROUGH      | Input table                                       |
| TIMECOL   | Scalar | String (default: 'time')        | Time column                                       |
| SIZE      | Scalar | Long integer (positive)         | Window size (must be an integer multiple of STEP) |
| STEP      | Scalar | Long integer (positive)         | Expansion step                                    |
| ORIGIN    | Scalar | Timestamp (default: Unix epoch) | First window start time                           |

> Note: An error `Cumulative table function requires size must be an integral multiple of step` occurs if SIZE is not divisible by STEP.

#### Returned Results

The CUMULATE function returns:

* `window_start`: Window start time (inclusive)
* `window_end`: Window end time (exclusive)
* Pass-through columns: All input columns from DATA

#### Usage Example

```sql
IoTDB> SELECT * FROM CUMULATE(DATA => bid,TIMECOL => 'time',STEP => 2m,SIZE => 10m);
+-----------------------------+-----------------------------+-----------------------------+--------+-----+
|                 window_start|                   window_end|                         time|stock_id|price|
+-----------------------------+-----------------------------+-----------------------------+--------+-----+
|2021-01-01T09:00:00.000+08:00|2021-01-01T09:08:00.000+08:00|2021-01-01T09:06:00.000+08:00|    TESL|200.0|
|2021-01-01T09:00:00.000+08:00|2021-01-01T09:10:00.000+08:00|2021-01-01T09:06:00.000+08:00|    TESL|200.0|
|2021-01-01T09:00:00.000+08:00|2021-01-01T09:08:00.000+08:00|2021-01-01T09:07:00.000+08:00|    TESL|202.0|
|2021-01-01T09:00:00.000+08:00|2021-01-01T09:10:00.000+08:00|2021-01-01T09:07:00.000+08:00|    TESL|202.0|
|2021-01-01T09:10:00.000+08:00|2021-01-01T09:16:00.000+08:00|2021-01-01T09:15:00.000+08:00|    TESL|195.0|
|2021-01-01T09:10:00.000+08:00|2021-01-01T09:18:00.000+08:00|2021-01-01T09:15:00.000+08:00|    TESL|195.0|
|2021-01-01T09:10:00.000+08:00|2021-01-01T09:20:00.000+08:00|2021-01-01T09:15:00.000+08:00|    TESL|195.0|
|2021-01-01T09:00:00.000+08:00|2021-01-01T09:06:00.000+08:00|2021-01-01T09:05:00.000+08:00|    AAPL|100.0|
|2021-01-01T09:00:00.000+08:00|2021-01-01T09:08:00.000+08:00|2021-01-01T09:05:00.000+08:00|    AAPL|100.0|
|2021-01-01T09:00:00.000+08:00|2021-01-01T09:10:00.000+08:00|2021-01-01T09:05:00.000+08:00|    AAPL|100.0|
|2021-01-01T09:00:00.000+08:00|2021-01-01T09:08:00.000+08:00|2021-01-01T09:07:00.000+08:00|    AAPL|103.0|
|2021-01-01T09:00:00.000+08:00|2021-01-01T09:10:00.000+08:00|2021-01-01T09:07:00.000+08:00|    AAPL|103.0|
|2021-01-01T09:00:00.000+08:00|2021-01-01T09:10:00.000+08:00|2021-01-01T09:09:00.000+08:00|    AAPL|102.0|
+-----------------------------+-----------------------------+-----------------------------+--------+-----+

-- Equivalent to tree model's GROUP BY TIME when combined with GROUP BY
IoTDB> SELECT window_start, window_end, stock_id, avg(price) as avg FROM CUMULATE(DATA => bid,TIMECOL => 'time',STEP => 2m, SIZE => 10m) GROUP BY window_start, window_end, stock_id;
+-----------------------------+-----------------------------+--------+------------------+
|                 window_start|                   window_end|stock_id|               avg|
+-----------------------------+-----------------------------+--------+------------------+
|2021-01-01T09:00:00.000+08:00|2021-01-01T09:08:00.000+08:00|    TESL|             201.0|
|2021-01-01T09:00:00.000+08:00|2021-01-01T09:10:00.000+08:00|    TESL|             201.0|
|2021-01-01T09:10:00.000+08:00|2021-01-01T09:16:00.000+08:00|    TESL|             195.0|
|2021-01-01T09:10:00.000+08:00|2021-01-01T09:18:00.000+08:00|    TESL|             195.0|
|2021-01-01T09:10:00.000+08:00|2021-01-01T09:20:00.000+08:00|    TESL|             195.0|
|2021-01-01T09:00:00.000+08:00|2021-01-01T09:06:00.000+08:00|    AAPL|             100.0|
|2021-01-01T09:00:00.000+08:00|2021-01-01T09:08:00.000+08:00|    AAPL|             101.5|
|2021-01-01T09:00:00.000+08:00|2021-01-01T09:10:00.000+08:00|    AAPL|101.66666666666667|
+-----------------------------+-----------------------------+--------+------------------+
```
