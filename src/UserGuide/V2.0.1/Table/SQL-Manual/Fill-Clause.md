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


## Function Introduction

When performing data queries, you may encounter situations where certain columns lack data in some rows, resulting in NULL values in the result set. These NULL values are not conducive to data visualization and analysis, so IoTDB provides the FILL clause to fill in these NULL values.

When the query includes an ORDER BY clause, the FILL clause will be executed before the ORDER BY. If there is a GAPFILL (date_bin_gapfill function) operation, the FILL clause will be executed after the GAPFILL.

## Syntax Overview


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

### Filling Methods

IoTDB supports the following three methods for filling null values:

1. __`PREVIOUS` Filling__：Fills with the previous non-null value of the column.
2. __`LINEAR` Filling__：Fills with the linear interpolation between the previous and next non-null values of the column.
3. __`Constant` Filling__：Fills with a specified constant value.

Only one filling method can be specified, and this method will be applied to all columns in the result set.

### Data Types and Supported Filling Methods


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

Note: For columns whose data types do not support the specified filling method, neither filling is performed nor exceptions are thrown; the original state is simply maintained.

## Example Data


In the [Example Data page](../Basic-Concept/Sample-Data.md), there are SQL statements for building the table structure and inserting data. By downloading and executing these statements in the IoTDB CLI, you can import data into IoTDB. You can use this data to test and execute the SQL statements in the examples and obtain the corresponding results.

### PREVIOUS Filling：

For null values in the query result set, fill with the previous non-null value of the column.

#### Parameter Introduction：

- TIME_BOUND（optional）：The time threshold to look forward. If the time interval between the current null value's timestamp and the previous non-null value's timestamp exceeds this threshold, filling will not be performed. By default, the first TIMESTAMP type column in the query result is used to determine whether the time threshold has been exceeded.
  - The format of the time threshold parameter is a time interval, where the numerical part must be an integer, and the unit part y represents years, mo represents months, w represents weeks, d represents days, h represents hours, m represents minutes, s represents seconds, ms represents milliseconds, µs represents microseconds, and ns represents nanoseconds, such as 1d1h.
- TIME_COLUMN（optional）：If you need to manually specify the TIMESTAMP column used to judge the time threshold, you can determine the order of the column by specifying a number (starting from 1) after the `TIME_COLUMN`parameter. This number represents the specific position of the TIMESTAMP column in the original table.

#### Example

Without using any filling method:

```sql
SELECT time, temperature, status 
  FROM table1 
  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00
    AND plant_id='1001' and device_id='101';
```

Query results:

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

Use the PREVIOUS padding method (the result will be filled with the previous non null value to fill the NULL value):

```sql
SELECT time, temperature, status 
  FROM table1 
  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00
    AND plant_id='1001' and device_id='101'
  FILL METHOD PREVIOUS;
```

Query results:

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

Use the PREVIOUS padding method (specify time threshold):

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

Query results:

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

### LINEAR Filling

For null values in the query result set, fill with the linear interpolation between the previous and next non-null values of the column.

#### Linear Filling Rules:

- If all previous values are null, or all subsequent values are null, no filling is performed.
- If the column's data type is boolean/string/blob/text, no filling is performed, and no exceptions are thrown.
- If no time column is specified, the system defaults to selecting the first column with a data type of TIMESTAMP in the SELECT clause as the auxiliary time column for linear interpolation. If no column with a TIMESTAMP data type exists, the system will throw an exception.

#### Parameter Introduction:

- TIME_COLUMN（optional）：You can manually specify the `TIMESTAMP` column used to determine the time threshold as an auxiliary column for linear interpolation by specifying a number (starting from 1) after the `TIME_COLUMN` parameter. This number represents the specific position of the `TIMESTAMP` column in the original table.

Note: It is not mandatory that the auxiliary column for linear interpolation must be a time column; any expression with a TIMESTAMP type is acceptable. However, since linear interpolation only makes sense when the auxiliary column is in ascending or descending order, users need to ensure that the result set is ordered by that column in ascending or descending order if they specify other columns.


#### Example


```sql
SELECT time, temperature, status 
  FROM table1 
  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00
      AND plant_id='1001' and device_id='101'
  FILL METHOD LINEAR;
```

Query results:

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

### Constant Filling:

For null values in the query result set, fill with a specified constant.

#### Constant Filling Rules:

- If the data type does not match the input constant, IoTDB will not fill the query result and will not throw an exception.
- If the inserted constant value exceeds the maximum value that its data type can represent, IoTDB will not fill the query result and will not throw an exception.


#### Example

When using a `FLOAT` constant for filling, the SQL statement is as follows:


```sql
SELECT time, temperature, status 
  FROM table1 
  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00
      AND plant_id='1001' and device_id='101'
  FILL METHOD CONSTANT 80.0;
```

Query results:

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

When using the constant `BOOLEAN` to fill in, the SQL statement is as follows:


```sql
SELECT time, temperature, status 
  FROM table1 
  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00
      AND plant_id='1001' and device_id='101'
  FILL METHOD CONSTANT true;
```

Query results:

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

## Advanced Usage

When using `PREVIOUS` and `LINEAR` FILL, an additional `FILL_GROUP` parameter is also supported for filling within groups.

When using a group by clause with fill, you may want to fill within groups without being affected by other groups.

For example: Fill the null values within each `device_id` without using values from other devices:

```sql
SELECT date_bin(1h, time) AS hour_time,  plant_id, device_id, avg(temperature) AS avg_temp
  FROM table1
  WHERE time >= 2024-11-28 08:00:00 AND time < 2024-11-30 14:30:00
  group by 1, plant_id, device_id;
```

Query results:

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

If the FILL_GROUP parameter is not specified, the null value for `100` will be filled with the value of `101`:

```sql
SELECT date_bin(1h, time) AS hour_time,  plant_id, device_id, avg(temperature) AS avg_temp
  FROM table1
  WHERE time >= 2024-11-28 08:00:00 AND time < 2024-11-30 14:30:00
  group by 1, plant_id, device_id
  FILL METHOD PREVIOUS;
```

Query results:

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

After specifying FILL_GROUP as the second column, the filling will only occur within the group that uses the second column `device_id` as the group key. The null value for `100` will not be filled with the value of `101` because they belong to different groups.

```sql
SELECT date_bin(1h, time) AS hour_time,  plant_id, device_id, avg(temperature) AS avg_temp
  FROM table1
  WHERE time >= 2024-11-28 08:00:00 AND time < 2024-11-30 14:30:00
  group by 1, plant_id, device_id
  FILL METHOD PREVIOUS FILL_GROUP 2;
```

Query results:

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

## Special Notes

When using  `LINEAR FILL` or `PREVIOUS FILL`, if there are NULL values in the auxiliary time column (the column used to determine the filling logic), IoTDB will follow these rules:

- Do not fill rows where the auxiliary time column is NULL.
- These rows will also not participate in the filling logic calculation.

Taking  `PREVIOUS FILL` as an example, the original data is as follows:



```sql
SELECT time, plant_id, device_id, humidity, arrival_time
  FROM table1 
  WHERE time >= 2024-11-26 16:37:00 and time <= 2024-11-28 08:00:00
      AND plant_id='1001' and device_id='101';
```

Query results:

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

Use the arrival_time column as the auxiliary time column and set the time interval (TIME_SOUND) to 2 ms (if the previous value is more than 2ms away from the current value, it will not be filled in):

```sql
SELECT time, plant_id, device_id, humidity, arrival_time
  FROM table1
  WHERE time >= 2024-11-26 16:37:00 and time <= 2024-11-28 08:00:00
    AND plant_id='1001' and device_id='101'
  FILL METHOD PREVIOUS TIME_BOUND 2s TIME_COLUMN 5;
```

Query results:

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

Filling results details:

- For the humidity column at 16:39, 16:42, and 16:43, filling is not performed because the auxiliary column arrival_time is NULL.
- For the humidity column at 16:40, since the auxiliary column arrival_time is not NULL and is `1970-01-01T08:00:00.003+08:00`, which is within a 2ms time difference from the previous non-NULL value `1970-01-01T08:00:00.001+08:00`, it is filled with the value 1 from the first row (s1).
- For the humidity column at 16:41, although arrival_time is not NULL, the time difference from the previous non-NULL value exceeds 2ms, so no filling is performed. The same applies to the seventh row.