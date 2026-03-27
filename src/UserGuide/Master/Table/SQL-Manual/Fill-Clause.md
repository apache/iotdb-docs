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

- If the query includes an `ORDER BY` clause, the FILL clause is executed before `ORDER BY`.
- If a `GAPFILL` (e.g., `date_bin_gapfill` function) operation exists, the FILL clause is executed after `GAPFILL`.

## 2. Syntax Overview


```sql
fillClause
    : FILL METHOD fillMethod
    ;

fillMethod
    : LINEAR timeColumnClause? fillGroupClause?                           #linearFill
    | PREVIOUS timeBoundClause? timeColumnClause? fillGroupClause?        #previousFill
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

### 2.1 ### Filling Methods

IoTDB supports the following three methods to fill NULL values:

1. **PREVIOUS Fill:** Uses the most recent non-NULL value from the same column to fill NULL values. Starting from V2.0.8, only this method supports the OBJECT type.
2. **LINEAR Fill:** Applies linear interpolation using the nearest previous and next non-NULL values in the same column.
3. **CONSTANT Fill:** Fills NULL values with a specified constant.

Only one filling method can be specified, and it applies to all columns in the result set.


### 2.2 Supported Data Types for Filling Methods

| Data Type | Previous | Linear | Constant |
| :-------- | :------- | :----- | :------- |
| boolean   | √        | -      | √        |
| int32     | √        | √      | √        |
| int64     | √        | √      | √        |
| float     | √        | √      | √        |
| double    | √        | √      | √        |
| text      | √        | -      | √        |
| string    | √        | -      | √        |
| blob      | √        | -      | √        |
| timestamp | √        | √      | √        |
| date      | √        | √      | √        |

**Note:** Columns with data types not supporting the specified filling method will remain unchanged without errors.

## 3. Sample Dataset


The [Example Data page](../Reference/Sample-Data.md)page provides SQL statements to construct table schemas and insert data. By downloading and executing these statements in the IoTDB CLI, you can import the data into IoTDB. This data can be used to test and run the example SQL queries included in this documentation, allowing you to reproduce the described results.

### 3.1 PREVIOUS Fill

`PREVIOUS FILL` fills NULL values with the most recent non-NULL value in the same column.

#### 3.1.1 Parameters

- **TIME_BOUND (optional):** Defines a forward-looking time threshold. If the time difference between the current NULL value and the previous non-NULL value exceeds this threshold, the value will not be filled. By default, the system uses the first `TIMESTAMP` column in the query result to determine the threshold.
  - Format: A time interval specified with integer values and units, e.g., `1d1h` (1 day and 1 hour).
- **TIME_COLUMN (optional):** Allows specifying the `TIMESTAMP` column used to determine the time threshold. The column is specified using its positional index (starting from 1) in the original table.

#### 3.1.2 Examples

- Without FILL Clause:

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

- Using `PREVIOUS Fill`:

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

- Using `PREVIOUS Fill` with a Specified Time Threshold:

```sql
# Do not specify a time column
SELECT time, temperature, status 
  FROM table1 
  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00
      AND plant_id='1001' and device_id='101'
  FILL METHOD PREVIOUS TIME_BOUND 1m;

# Manually specify the time column
SELECT time, temperature, status 
  FROM table1 
  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00
      AND plant_id='1001' and device_id='101'
  FILL METHOD PREVIOUS        1m TIME_COLUMN 1;
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

### 3.2 LINEAR Fill

`LINEAR Fill` fills NULL values using linear interpolation based on the nearest previous and next non-NULL values in the same column.

#### 3.2.1 Linear Fill Rules

1. If all previous or all subsequent values are NULL, no filling is performed.
2. Columns with data types such as `boolean`, `string`, `blob`, or `text` are not filled, and no error is returned.
3. If no auxiliary time column is specified, the first `TIMESTAMP`-type column in the `SELECT` clause is used by default for interpolation. If no `TIMESTAMP` column exists, an error will be returned.

#### 3.2.2 Parameters

- **TIME_COLUMN (optional):** Specifies the `TIMESTAMP` column to be used as an auxiliary column for linear interpolation. The column is identified by its positional index (starting from 1) in the original table.

**Note:** The auxiliary column used for linear interpolation is not required to be the `time` column. However, the auxiliary column must be sorted in ascending or descending order for meaningful interpolation. If another column is specified, the user must ensure the result set is ordered correctly.

#### 3.2.3 Examples


```sql
SELECT time, temperature, status 
  FROM table1 
  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00
      AND plant_id='1001' and device_id='101'
  FILL METHOD LINEAR;
```

Result:

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

### 3.3 ### CONSTANT Fill

`CONSTANT Fill` fills NULL values with a specified constant value.

#### 3.3.1 Constant Fill Rules

1. If the data type of the constant does not match the column's data type, IoTDB does not fill the result set and no error is returned.
2. If the constant value exceeds the column's allowable range, IoTDB does not fill the result set and no error is returned.


#### 3.3.2 Examples

- Using a `FLOAT` constant:


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

W- Using a `BOOLEAN` constant:

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

When using the `PREVIOUS` or `LINEAR` FILL methods, the `FILL_GROUP` parameter allows filling within specific groups without being influenced by other groups.

#### Examples

- **Filling Missing Values Within `device_id`**

The following query demonstrates how to fill missing values for each `device_id` group independently, without using values from other devices:
```sql
SELECT date_bin(1h, time) AS hour_time,  plant_id, device_id, avg(temperature) AS avg_temp
  FROM table1
  WHERE time >= 2024-11-28 08:00:00 AND time < 2024-11-30 14:30:00
  group by 1, plant_id, device_id;
```

Results：

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

- **Without Specifying `FILL_GROUP`**

If the `FILL_GROUP` parameter is not specified, missing values in `device_id = 100` will be filled using values from `device_id = 101`:

```sql
SELECT date_bin(1h, time) AS hour_time,  plant_id, device_id, avg(temperature) AS avg_temp
  FROM table1
  WHERE time >= 2024-11-28 08:00:00 AND time < 2024-11-30 14:30:00
  group by 1, plant_id, device_id
  FILL METHOD PREVIOUS;
```

Results：

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

- **Specifying `FILL_GROUP` for Grouped Filling**

By specifying `FILL_GROUP 2`, the filling is restricted to groups based on the second column (`device_id`). As a result, missing values in `device_id = 100` will not be filled using values from `device_id = 101`:

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

When using `LINEAR` or `PREVIOUS` FILL methods, if the auxiliary time column (used to determine filling logic) contains NULL values, IoTDB follows these rules:

- Rows with NULL values in the auxiliary column will not be filled.
- These rows are also excluded from the filling logic calculations.

**Example of `PREVIOUS Fill`**

- Query original data:



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

- Using `arrival_time` as the auxiliary column with a time interval (`TIME_BOUND`) of 2 seconds

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
**Filling Details**

1. For `humidity` at `16:39`, `16:42`, and `16:43`:
   1. Since the auxiliary column `arrival_time` is NULL, no filling is performed.
2. For `humidity` at `16:40`:
   1. The auxiliary column `arrival_time` is not NULL and has a value of `1970-01-01T08:00:00.003+08:00`.
   2. The time difference from the previous non-NULL value (`1970-01-01T08:00:00.001+08:00`) is less than 2 seconds (`TIME_BOUND`)
   3. So the value `35.1` from the first row is used for filling.
3. For `humidity` at `16:41`:
   1. Although the auxiliary column `arrival_time` is not NULL, the time difference from the previous non-NULL value exceeds 2 seconds, so no filling is performed.
4. For `humidity` at `16:44`:
   1. Similarly, the time difference exceeds 2 seconds, so no filling is performed.