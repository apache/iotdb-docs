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

# FILL Clause

## 1. Function Introduction

During data queries, you may encounter scenarios where certain columns have missing data in some rows, resulting in NULL values in the result set. These NULL values can hinder data visualization and analysis. To address this, IoTDB provides the FILL clause to populate these NULL values.

When the query contains an `ORDER BY` clause, the FILL clause is executed before `ORDER BY`. If a `GAPFILL` (`date_bin_gapfill` function) operation exists, the FILL clause is executed after `GAPFILL`.

## 2. Syntax Overview

```sql
fillClause
    : FILL METHOD fillMethod
    ;

fillMethod
    : LINEAR timeColumnClause? fillGroupClause?                           #linearFill
    | PREVIOUS timeBoundClause? timeColumnClause? fillGroupClause?        #previousFill
    | NEXT timeBoundClause? timeColumnClause? fillGroupClause?            #nextFill
    | CONSTANT literalExpression                                          #valueFill
    ;

timeColumnClause
    : TIME_COLUMN INTEGER_VALUE
    ;

fillGroupClause
    : FILL_GROUP INTEGER_VALUE (',' INTEGER_VALUE)*
    ;

timeBoundClause
    : TIME_BOUND duration=timeDuration
    ;

timeDuration
    : (INTEGER_VALUE intervalField)+
    ;
intervalField
    : YEAR | MONTH | WEEK | DAY | HOUR | MINUTE | SECOND | MILLISECOND | MICROSECOND | NANOSECOND
    ;
```

### 2.1 Filling Methods

IoTDB supports the following four methods to fill NULL values:

1. **`PREVIOUS` Fill:** Uses the previous non-NULL value in the same column to fill NULL values.
2. **`NEXT` Fill:** Uses the next non-NULL value in the same column to fill NULL values.
3. **`LINEAR` Fill:** Applies linear interpolation using the previous and next non-NULL values in the same column.
4. **`CONSTANT` Fill:** Fills NULL values with a specified constant.

Only one filling method can be specified, and it applies to all columns in the result set.

### 2.2 Supported Data Types for Filling Methods

| Data Type | Previous | Next | Linear | Constant |
| :-------- | :------- | :--- | :----- | :------- |
| boolean   | √        | √    | -      | √        |
| int32     | √        | √    | √      | √        |
| int64     | √        | √    | √      | √        |
| float     | √        | √    | √      | √        |
| double    | √        | √    | √      | √        |
| text      | √        | √    | -      | √        |
| string    | √        | √    | -      | √        |
| blob      | √        | √    | -      | √        |
| timestamp | √        | √    | √      | √        |
| date      | √        | √    | √      | √        |
| OBJECT    | √        | √    | -      | -        |

**Note:** Columns with data types not supporting the specified filling method will remain unchanged without errors.

## 3. Sample Dataset

The [Example Data page](../Reference/Sample-Data.md) provides SQL statements to construct table schemas and insert data. By downloading and executing these statements in the IoTDB CLI, you can import the data into IoTDB. This data can be used to test and run the example SQL queries included in this documentation, allowing you to reproduce the described results.

### 3.1 PREVIOUS Fill

For NULL values in the query result set, the previous non-NULL value of the same column is used for filling.

#### 3.1.1 Parameters

- **TIME_BOUND (optional):** A forward-looking time threshold. If the time difference between the current NULL value and the previous non-NULL value exceeds this threshold, the value will not be filled. By default, the system uses the first `TIMESTAMP` column in the query result to determine whether the threshold is exceeded.
  - The time threshold is specified as a time interval. The numeric part must be an integer, and the unit part can be `y` (year), `mo` (month), `w` (week), `d` (day), `h` (hour), `m` (minute), `s` (second), `ms` (millisecond), `µs` (microsecond), or `ns` (nanosecond), e.g., `1d1h`.
- **TIME_COLUMN (optional):** Allows manually specifying the `TIMESTAMP` column used to determine the time threshold. The column is specified by appending a number (starting from 1) after the `TIME_COLUMN` parameter, which represents the positional index of the `TIMESTAMP` column in the original table.

#### 3.1.2 Examples

Without any filling method:

```sql
SELECT time, temperature, status 
  FROM table1 
  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00
    AND plant_id='1001' and device_id='101';
```

Results:

```sql
+-----------------------------+-----------+------+
|                         time|temperature|status|
+-----------------------------+-----------+------+
|2024-11-27T16:38:00.000+08:00|       null|  true|
|2024-11-27T16:39:00.000+08:00|       85.0|  null|
|2024-11-27T16:40:00.000+08:00|       85.0|  null|
|2024-11-27T16:41:00.000+08:00|       85.0|  null|
|2024-11-27T16:42:00.000+08:00|       null| false|
|2024-11-27T16:43:00.000+08:00|       null| false|
|2024-11-27T16:44:00.000+08:00|       null| false|
+-----------------------------+-----------+------+
Total line number = 7
It costs 0.088s
```

Using the `PREVIOUS` fill method (NULL values will be filled with the previous non-NULL value):

```sql
SELECT time, temperature, status 
  FROM table1 
  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00
    AND plant_id='1001' and device_id='101'
  FILL METHOD PREVIOUS;
```

Results:

```sql
+-----------------------------+-----------+------+
|                         time|temperature|status|
+-----------------------------+-----------+------+
|2024-11-27T16:38:00.000+08:00|       null|  true|
|2024-11-27T16:39:00.000+08:00|       85.0|  true|
|2024-11-27T16:40:00.000+08:00|       85.0|  true|
|2024-11-27T16:41:00.000+08:00|       85.0|  true|
|2024-11-27T16:42:00.000+08:00|       85.0| false|
|2024-11-27T16:43:00.000+08:00|       85.0| false|
|2024-11-27T16:44:00.000+08:00|       85.0| false|
+-----------------------------+-----------+------+
Total line number = 7
It costs 0.091s
```

Using the `PREVIOUS` fill method (with a specified time threshold):

```sql
-- Do not specify a time column
SELECT time, temperature, status 
  FROM table1 
  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00
      AND plant_id='1001' and device_id='101'
  FILL METHOD PREVIOUS TIME_BOUND 1m;

-- Manually specify the time column
SELECT time, temperature, status 
  FROM table1 
  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00
      AND plant_id='1001' and device_id='101'
  FILL METHOD PREVIOUS TIME_BOUND 1m TIME_COLUMN 1;
```

Results:

```sql
+-----------------------------+-----------+------+
|                         time|temperature|status|
+-----------------------------+-----------+------+
|2024-11-27T16:38:00.000+08:00|       null|  true|
|2024-11-27T16:39:00.000+08:00|       85.0|  true|
|2024-11-27T16:40:00.000+08:00|       85.0|  null|
|2024-11-27T16:41:00.000+08:00|       85.0|  null|
|2024-11-27T16:42:00.000+08:00|       85.0| false|
|2024-11-27T16:43:00.000+08:00|       null| false|
|2024-11-27T16:44:00.000+08:00|       null| false|
+-----------------------------+-----------+------+
Total line number = 7
It costs 0.075s
```

### 3.2 NEXT Fill

For NULL values in the query result set, the next non-NULL value of the same column is used for filling. (Supported since V2.0.11)

#### 3.2.1 Parameters

- **TIME_BOUND (optional):** A backward-looking time threshold. If the time difference between the current NULL value and the next non-NULL value exceeds this threshold, the value will not be filled. If this parameter is specified, the system automatically selects the first column in the `SELECT` clause whose return type is `TIMESTAMP` as the time column for threshold checking.
- **FILL_GROUP (optional):** Specifies grouping columns; filling only occurs within the same group. If this parameter is specified, the system automatically selects the first column in the `SELECT` clause whose return type is `TIMESTAMP` as the time column for sorting within each group.
- **TIME_COLUMN (optional):** Allows manually specifying the `TIMESTAMP` column used to determine the time threshold. The column is specified by appending a number (starting from 1) after the `TIME_COLUMN` parameter, which represents the positional index of the column in the `SELECT` list.

**Notes:**

- If neither `TIME_BOUND` nor `FILL_GROUP` is specified but `TIME_COLUMN` is specified, a syntax error will be thrown.
- If `TIME_BOUND` or `FILL_GROUP` is specified but `TIME_COLUMN` is not, and no `TIMESTAMP`-type column exists in the `SELECT` clause, an exception will be thrown.
- If the specified `TIME_COLUMN` column is not of `TIMESTAMP` type, or the specified position is out of the range of the `SELECT` list, an exception will be thrown.

#### 3.2.2 Examples

Without any filling method:

```sql
SELECT time, temperature, status
  FROM table1
  WHERE time >= 2024-11-27 00:00:00 and time <= 2024-11-29 00:00:00
    AND plant_id='1001' and device_id='101';
```

Results:

```sql
+-----------------------------+-----------+------+
|                         time|temperature|status|
+-----------------------------+-----------+------+
|2024-11-27T16:38:00.000+08:00|       null|  true|
|2024-11-27T16:39:00.000+08:00|       85.0|  null|
|2024-11-27T16:40:00.000+08:00|       85.0|  null|
|2024-11-27T16:41:00.000+08:00|       85.0|  null|
|2024-11-27T16:42:00.000+08:00|       null| false|
|2024-11-27T16:43:00.000+08:00|       null| false|
|2024-11-27T16:44:00.000+08:00|       null| false|
+-----------------------------+-----------+------+
Total line number = 7
It costs 0.061s
```

Using the `NEXT` fill method (NULL values will be filled with the next non-NULL value):

```sql
SELECT time, temperature, status
  FROM table1
  WHERE time >= 2024-11-27 00:00:00 and time <= 2024-11-29 00:00:00
    AND plant_id='1001' and device_id='101'
  FILL METHOD NEXT;
```

Results:

```sql
+-----------------------------+-----------+------+
|                         time|temperature|status|
+-----------------------------+-----------+------+
|2024-11-27T16:38:00.000+08:00|       85.0|  true|
|2024-11-27T16:39:00.000+08:00|       85.0| false|
|2024-11-27T16:40:00.000+08:00|       85.0| false|
|2024-11-27T16:41:00.000+08:00|       85.0| false|
|2024-11-27T16:42:00.000+08:00|       null| false|
|2024-11-27T16:43:00.000+08:00|       null| false|
|2024-11-27T16:44:00.000+08:00|       null| false|
+-----------------------------+-----------+------+
Total line number = 7
It costs 0.033s
```

Using the `NEXT` fill method (with a specified time threshold):

```sql
-- Do not specify a time column
SELECT time, temperature, status
  FROM table1
  WHERE time >= 2024-11-27 00:00:00 and time <= 2024-11-29 00:00:00
    AND plant_id='1001' and device_id='101'
  FILL METHOD NEXT TIME_BOUND 1m;

-- Manually specify the time column
SELECT time, temperature, status
  FROM table1
  WHERE time >= 2024-11-27 00:00:00 and time <= 2024-11-29 00:00:00
    AND plant_id='1001' and device_id='101'
  FILL METHOD NEXT TIME_BOUND 1m TIME_COLUMN 1;
```

Results:

```sql
+-----------------------------+-----------+------+
|                         time|temperature|status|
+-----------------------------+-----------+------+
|2024-11-27T16:38:00.000+08:00|       85.0|  true|
|2024-11-27T16:39:00.000+08:00|       85.0|  null|
|2024-11-27T16:40:00.000+08:00|       85.0|  null|
|2024-11-27T16:41:00.000+08:00|       85.0| false|
|2024-11-27T16:42:00.000+08:00|       null| false|
|2024-11-27T16:43:00.000+08:00|       null| false|
|2024-11-27T16:44:00.000+08:00|       null| false|
+-----------------------------+-----------+------+
Total line number = 7
It costs 0.047s
```

### 3.3 LINEAR Fill

For NULL values in the query result set, linear interpolation based on the previous and next non-NULL values of the same column is used for filling.

#### 3.3.1 Linear Fill Rules

- If all previous values or all subsequent values are NULL, no filling is performed.
- Columns with data types such as `boolean`, `string`, `blob`, or `text` are not filled, and no error is returned.
- If no time column is specified, the first `TIMESTAMP`-type column in the `SELECT` clause is used by default as the auxiliary time column for linear interpolation. If no `TIMESTAMP`-type column exists, an exception will be thrown.

#### 3.3.2 Parameters

- **TIME_COLUMN (optional):** Allows manually specifying the `TIMESTAMP` column used as the auxiliary column for linear interpolation. The column is specified by appending a number (starting from 1) after the `TIME_COLUMN` parameter, which represents the positional index of the `TIMESTAMP` column in the original table.

**Note:** The auxiliary column used for linear interpolation is not required to be the `time` column. Any expression of `TIMESTAMP` type can be used. However, since linear interpolation is only meaningful when the auxiliary column is sorted in ascending or descending order, if another column is specified, the user must ensure the result set is ordered by that column in ascending or descending order.

#### 3.3.3 Examples

```sql
SELECT time, temperature, status 
  FROM table1 
  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00
      AND plant_id='1001' and device_id='101'
  FILL METHOD LINEAR;
```

Results:

```sql
+-----------------------------+-----------+------+
|                         time|temperature|status|
+-----------------------------+-----------+------+
|2024-11-27T16:38:00.000+08:00|       null|  true|
|2024-11-27T16:39:00.000+08:00|       85.0|  null|
|2024-11-27T16:40:00.000+08:00|       85.0|  null|
|2024-11-27T16:41:00.000+08:00|       85.0|  null|
|2024-11-27T16:42:00.000+08:00|       null| false|
|2024-11-27T16:43:00.000+08:00|       null| false|
|2024-11-27T16:44:00.000+08:00|       null| false|
+-----------------------------+-----------+------+
Total line number = 7
It costs 0.053s
```

### 3.4 CONSTANT Fill

For NULL values in the query result set, a specified constant is used for filling.

#### 3.4.1 Constant Fill Rules

- If the data type of the constant does not match the column's data type, IoTDB does not fill the query result, and no error is returned.
- If the constant value exceeds the maximum value that the data type can represent, IoTDB does not fill the query result, and no error is returned.

#### 3.4.2 Examples

Using a `FLOAT` constant:

```sql
SELECT time, temperature, status 
  FROM table1 
  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00
      AND plant_id='1001' and device_id='101'
  FILL METHOD CONSTANT 80.0;
```

Results:

```sql
+-----------------------------+-----------+------+
|                         time|temperature|status|
+-----------------------------+-----------+------+
|2024-11-27T16:38:00.000+08:00|       80.0|  true|
|2024-11-27T16:39:00.000+08:00|       85.0|  true|
|2024-11-27T16:40:00.000+08:00|       85.0|  true|
|2024-11-27T16:41:00.000+08:00|       85.0|  true|
|2024-11-27T16:42:00.000+08:00|       80.0| false|
|2024-11-27T16:43:00.000+08:00|       80.0| false|
|2024-11-27T16:44:00.000+08:00|       80.0| false|
+-----------------------------+-----------+------+
Total line number = 7
It costs 0.242s
```

Using a `BOOLEAN` constant:

```sql
SELECT time, temperature, status 
  FROM table1 
  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00
      AND plant_id='1001' and device_id='101'
  FILL METHOD CONSTANT true;
```

Results:

```sql
+-----------------------------+-----------+------+
|                         time|temperature|status|
+-----------------------------+-----------+------+
|2024-11-27T16:38:00.000+08:00|        1.0|  true|
|2024-11-27T16:39:00.000+08:00|       85.0|  true|
|2024-11-27T16:40:00.000+08:00|       85.0|  true|
|2024-11-27T16:41:00.000+08:00|       85.0|  true|
|2024-11-27T16:42:00.000+08:00|        1.0| false|
|2024-11-27T16:43:00.000+08:00|        1.0| false|
|2024-11-27T16:44:00.000+08:00|        1.0| false|
+-----------------------------+-----------+------+
Total line number = 7
It costs 0.073s
```

## 4. Advanced Usage

When using `PREVIOUS`, `NEXT`, or `LINEAR` FILL, an additional `FILL_GROUP` parameter is supported to perform filling within groups.

When using the GROUP BY clause together with FILL, you may want to fill NULL values within each group without being affected by other groups.

For example, fill the NULL values within each `device_id` group without using values from other devices:

```sql
SELECT date_bin(1h, time) AS hour_time,  plant_id, device_id, avg(temperature) AS avg_temp
  FROM table1
  WHERE time >= 2024-11-28 08:00:00 AND time < 2024-11-30 14:30:00
  group by 1, plant_id, device_id;
```

Results:

```sql
+-----------------------------+--------+---------+--------+
|                    hour_time|plant_id|device_id|avg_temp|
+-----------------------------+--------+---------+--------+
|2024-11-28T08:00:00.000+08:00|    3001|      100|    85.0|
|2024-11-28T09:00:00.000+08:00|    3001|      100|    null|
|2024-11-28T10:00:00.000+08:00|    3001|      100|    85.0|
|2024-11-28T11:00:00.000+08:00|    3001|      100|    88.0|
|2024-11-29T10:00:00.000+08:00|    3001|      101|    85.0|
|2024-11-29T11:00:00.000+08:00|    3002|      100|    null|
|2024-11-29T18:00:00.000+08:00|    3002|      100|    90.0|
|2024-11-30T09:00:00.000+08:00|    3002|      101|    90.0|
+-----------------------------+--------+---------+--------+
Total line number = 8
It costs 0.110s
```

If the `FILL_GROUP` parameter is not specified, the NULL values of `100` will be filled with the values of `101`:

```sql
SELECT date_bin(1h, time) AS hour_time,  plant_id, device_id, avg(temperature) AS avg_temp
  FROM table1
  WHERE time >= 2024-11-28 08:00:00 AND time < 2024-11-30 14:30:00
  group by 1, plant_id, device_id
  FILL METHOD PREVIOUS;
```

Results:

```sql
+-----------------------------+--------+---------+--------+
|                    hour_time|plant_id|device_id|avg_temp|
+-----------------------------+--------+---------+--------+
|2024-11-28T08:00:00.000+08:00|    3001|      100|    85.0|
|2024-11-28T09:00:00.000+08:00|    3001|      100|    85.0|
|2024-11-28T10:00:00.000+08:00|    3001|      100|    85.0|
|2024-11-28T11:00:00.000+08:00|    3001|      100|    88.0|
|2024-11-29T10:00:00.000+08:00|    3001|      101|    85.0|
|2024-11-29T11:00:00.000+08:00|    3002|      100|    85.0|
|2024-11-29T18:00:00.000+08:00|    3002|      100|    90.0|
|2024-11-30T09:00:00.000+08:00|    3002|      101|    90.0|
+-----------------------------+--------+---------+--------+
Total line number = 8
It costs 0.066s
```

After specifying `FILL_GROUP` as the 2nd column, filling only occurs within groups keyed by the second column `device_id`. The NULL values of `100` will not be filled with the values of `101`, because they belong to different groups.

```sql
SELECT date_bin(1h, time) AS hour_time,  plant_id, device_id, avg(temperature) AS avg_temp
  FROM table1
  WHERE time >= 2024-11-28 08:00:00 AND time < 2024-11-30 14:30:00
  group by 1, plant_id, device_id
  FILL METHOD PREVIOUS FILL_GROUP 2;
```

Results:

```sql
+-----------------------------+--------+---------+--------+
|                    hour_time|plant_id|device_id|avg_temp|
+-----------------------------+--------+---------+--------+
|2024-11-28T08:00:00.000+08:00|    3001|      100|    85.0|
|2024-11-28T09:00:00.000+08:00|    3001|      100|    85.0|
|2024-11-28T10:00:00.000+08:00|    3001|      100|    85.0|
|2024-11-28T11:00:00.000+08:00|    3001|      100|    88.0|
|2024-11-29T10:00:00.000+08:00|    3001|      101|    85.0|
|2024-11-29T11:00:00.000+08:00|    3002|      100|    null|
|2024-11-29T18:00:00.000+08:00|    3002|      100|    90.0|
|2024-11-30T09:00:00.000+08:00|    3002|      101|    90.0|
+-----------------------------+--------+---------+--------+
Total line number = 8
It costs 0.089s
```

## 5. Special Notes

When using `LINEAR FILL`, `PREVIOUS FILL`, or `NEXT FILL`, if the auxiliary time column (the time column used to determine the filling logic) contains NULL values, IoTDB follows these rules:

- Rows whose auxiliary time column is NULL will not be filled.
- These rows are also excluded from the filling logic calculations.

Taking `PREVIOUS FILL` as an example, the original data is as follows:

```sql
SELECT time, plant_id, device_id, humidity, arrival_time
  FROM table1 
  WHERE time >= 2024-11-26 16:37:00 and time <= 2024-11-28 08:00:00
      AND plant_id='1001' and device_id='101';
```

Results:

```sql
+-----------------------------+--------+---------+--------+-----------------------------+
|                         time|plant_id|device_id|humidity|                 arrival_time|
+-----------------------------+--------+---------+--------+-----------------------------+
|2024-11-27T16:38:00.000+08:00|    1001|      101|    35.1|2024-11-27T16:37:01.000+08:00|
|2024-11-27T16:39:00.000+08:00|    1001|      101|    35.3|                         null|
|2024-11-27T16:40:00.000+08:00|    1001|      101|    null|2024-11-27T16:37:03.000+08:00|
|2024-11-27T16:41:00.000+08:00|    1001|      101|    null|2024-11-27T16:37:04.000+08:00|
|2024-11-27T16:42:00.000+08:00|    1001|      101|    35.2|                         null|
|2024-11-27T16:43:00.000+08:00|    1001|      101|    null|                         null|
|2024-11-27T16:44:00.000+08:00|    1001|      101|    null|2024-11-27T16:37:08.000+08:00|
+-----------------------------+--------+---------+--------+-----------------------------+
Total line number = 7
It costs 0.119s
```

Using the `arrival_time` column as the auxiliary time column, with a time interval (`TIME_BOUND`) of 2 seconds (values are not filled if the previous non-NULL value is more than 2 seconds away from the current value):

```sql
SELECT time, plant_id, device_id, humidity, arrival_time
  FROM table1
  WHERE time >= 2024-11-26 16:37:00 and time <= 2024-11-28 08:00:00
    AND plant_id='1001' and device_id='101'
  FILL METHOD PREVIOUS TIME_BOUND 2s TIME_COLUMN 5;
```

Results:

```sql
+-----------------------------+--------+---------+--------+-----------------------------+
|                         time|plant_id|device_id|humidity|                 arrival_time|
+-----------------------------+--------+---------+--------+-----------------------------+
|2024-11-27T16:38:00.000+08:00|    1001|      101|    35.1|2024-11-27T16:37:01.000+08:00|
|2024-11-27T16:39:00.000+08:00|    1001|      101|    35.3|                         null|
|2024-11-27T16:40:00.000+08:00|    1001|      101|    35.1|2024-11-27T16:37:03.000+08:00|
|2024-11-27T16:41:00.000+08:00|    1001|      101|    null|2024-11-27T16:37:04.000+08:00|
|2024-11-27T16:42:00.000+08:00|    1001|      101|    35.2|                         null|
|2024-11-27T16:43:00.000+08:00|    1001|      101|    null|                         null|
|2024-11-27T16:44:00.000+08:00|    1001|      101|    null|2024-11-27T16:37:08.000+08:00|
+-----------------------------+--------+---------+--------+-----------------------------+
Total line number = 7
It costs 0.049s
```

Filling details:

- For the `humidity` column at 16:39, 16:42, and 16:43: since the auxiliary column `arrival_time` is NULL, no filling is performed.
- For the `humidity` column at 16:40: the auxiliary column `arrival_time` is not NULL (`1970-01-01T08:00:00.003+08:00`), and the time difference from the previous non-NULL value (`1970-01-01T08:00:00.001+08:00`) does not exceed 2 seconds, so the value `35.1` of the first row is used for filling.
- For the `humidity` column at 16:41: although `arrival_time` is not NULL, the time difference from the previous non-NULL value exceeds 2 seconds, so no filling is performed. The same applies to the seventh row.
