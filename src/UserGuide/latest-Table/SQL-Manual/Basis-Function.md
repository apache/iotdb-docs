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

# Basic Functions

## Comparison Functions and Operators

### 1. Basic Comparison Operators

Comparison operators are used to compare two values and return the comparison result (`true` or `false`).

| Operators | Description              |
| :-------- | :----------------------- |
| <         | Less than                |
| >         | Greater than             |
| <=        | Less than or equal to    |
| >=        | Greater than or equal to |
| =         | Equal to                 |
| <>        | Not equal to             |
| !=        | Not equal to             |

#### 1.1 Comparison rules:

1. All types can be compared with themselves.
2. Numeric types (INT32, INT64, FLOAT, DOUBLE, TIMESTAMP) can be compared with each other.
3. Character types (STRING, TEXT) can also be compared with each other.
4. Comparisons between types other than those mentioned above will result in an error.

### 2. BETWEEN Operator

1. The `BETWEEN `operator is used to determine whether a value falls within a specified range.
2. The `NOT BETWEEN` operator is used to determine whether a value does not fall within a specified range.
3. The `BETWEEN` and `NOT BETWEEN` operators can be used to evaluate any sortable type.
4. The value, minimum, and maximum parameters for `BETWEEN` and `NOT BETWEEN` must be of the same type, otherwise an error will occur.

Syntax：

```SQL
 value BETWEEN min AND max：
 value NOT BETWEEN min AND max：
```

Example 1 ：BETWEEN

```SQL
-- Query records where temperature is between 85.0 and 90.0
SELECT * FROM table1 WHERE temperature BETWEEN 85.0 AND 90.0;
```

Example 2 :  NOT BETWEEN

```
-- Query records where humidity is not between 35.0 and 40.0
SELECT * FROM table1 WHERE humidity NOT BETWEEN 35.0 AND 40.0;
```

### 3. IS NULL Operator

1. These operators apply to all data types.

Example 1: Query records where temperature is NULL

```SQL
SELECT * FROM table1 WHERE temperature IS NULL;
```

Example 2: Query records where humidity is not NULL

```SQL
SELECT * FROM table1 WHERE humidity IS NOT NULL;
```

### 4. IN Operator

1. The `IN` operator can be used in the `WHERE `clause to compare a column with a list of values.
2. These values can be provided by a static array or scalar expressions.

Syntax:

```SQL
... WHERE column [NOT] IN ('value1','value2', expression1)
```

Example 1: Static array: Query records where region is 'Beijing' or 'Shanghai'

```SQL
SELECT * FROM table1 WHERE region IN ('Beijing', 'Shanghai');
--Equivalent to
SELECT * FROM region WHERE name = 'Beijing' OR name = 'Shanghai';
```

Example 2: Scalar expression: Query records where temperature is among specific values

```SQL
SELECT * FROM table1 WHERE temperature IN (85.0, 90.0);
```

Example 3: Query records where region is not 'Beijing' or 'Shanghai'

```SQL
SELECT * FROM table1 WHERE region NOT IN ('Beijing', 'Shanghai');
```

## Aggregate functions

### 1. Overview

1. Aggregate functions are many-to-one functions. They perform aggregate calculations on a set of values to obtain a single aggregate result.

2. Except for `COUNT()`, all other aggregate functions ignore null values and return null when there are no input rows or all values are null. For example, `SUM()` returns null instead of zero, and `AVG()` does not include null values in the count.

### 2. Supported Aggregate Functions                            

| Function Name | Description                                                  | Allowed Input Types        | Output Type                                |
| :------------ | :----------------------------------------------------------- | :------------------------- | :----------------------------------------- |
| COUNT         | Counts the number of data points.                            | All types                  | INT64                                      |
| SUM           | Calculates the sum.                                          | INT32 INT64 FLOAT DOUBLE   | DOUBLE                                     |
| AVG           | Calculates the average.                                      | INT32 INT64 FLOAT DOUBLE   | DOUBLE                                     |
| MAX           | Finds the maximum value.                                     | All types                  | Same as input type                         |
| MIN           | Finds the minimum value.                                     | All types                  | Same as input type                         |
| FIRST         | Finds the value with the smallest timestamp that is not NULL. | All types                  | Same as input type                         |
| LAST          | Finds the value with the largest timestamp that is not NULL. | All types                  | Same as input type                         |
| STDDEV        | Alias for STDDEV_SAMP,  calculates the sample standard deviation. | INT32 INT64 FLOAT DOUBLE   | DOUBLE                                     |
| STDDEV_POP    | Calculates the population standard deviation.                | INT32 INT64 FLOAT DOUBLE   | DOUBLE                                     |
| STDDEV_SAMP   | Calculates the sample standard deviation.                    | INT32 INT64 FLOAT DOUBLE   | DOUBLE                                     |
| VARIANCE      | Alias for VAR_SAMP,  calculates the sample variance.         | INT32 INT64 FLOAT DOUBLE   | DOUBLE                                     |
| VAR_POP       | Calculates the population variance.                          | INT32 INT64 FLOAT DOUBLE   | DOUBLE                                     |
| VAR_SAMP      | Calculates the sample variance.                              | INT32 INT64 FLOAT DOUBLE   | DOUBLE                                     |
| EXTREME       | Finds the value with the largest absolute value. If the largest absolute values of positive and negative values are equal, returns the positive value. | INT32 INT64 FLOAT DOUBLE   | Same as input type                         |
| MODE          | Finds the mode. Note: 1. There is a risk of memory exception when the number of distinct values in the input sequence is too large; 2. If all elements have the same frequency, i.e., there is no mode, a random element is returned; 3. If there are multiple modes, a random mode is returned; 4. NULL values are also counted in frequency, so even if not all values in the input sequence are NULL, the final result may still be NULL. | All types                  | Same as input type                         |
| MAX_BY        | MAX_BY(x, y) finds the value of x corresponding to the maximum y in the binary input x and y. MAX_BY(time, x) returns the timestamp when x is at its maximum. | x and y can be of any type | Same as the data type of the first input x |
| MIN_BY        | MIN_BY(x, y) finds the value of x corresponding to the minimum y in the binary input x and y. MIN_BY(time, x) returns the timestamp when x is at its minimum. | x and y can be of any type | Same as the data type of the first input x |
| FIRST_BY      | FIRST_BY(x, y) finds the value of x in the same row when y is the first non-null value. | x and y can be of any type | Same as the data type of the first input x |
| LAST_BY       | LAST_BY(x, y) finds the value of x in the same row when y is the last non-null value. | x and y can be of any type | Same as the data type of the first input x |

### 3. Examples

#### 3.1 Example Data

The [Example Data page](../Reference/Sample-Data.md) contains SQL statements for building table structures and inserting data. Download and execute these statements in the IoTDB CLI to import the data into IoTDB. You can use this data to test and execute the SQL statements in the examples and obtain the corresponding results.

#### 3.2 Count

Counts the number of rows in the entire table and the number of non-null values in the `temperature` column.

```SQL
IoTDB> select count(*), count(temperature) from table1;
```

The execution result is as follows:

> Note: Only the COUNT function can be used with *, otherwise an error will occur.

```SQL
+-----+-----+
|_col0|_col1|
+-----+-----+
|   18|   12|
+-----+-----+
Total line number = 1
It costs 0.834s
```

#### 3.3 First

Finds the values with the smallest timestamp that are not NULL in the `temperature` and `humidity` columns.

```SQL
IoTDB> select first(temperature), first(humidity) from table1;
```

The execution result is as follows:

```SQL
+-----+-----+
|_col0|_col1|
+-----+-----+
| 90.0| 35.1|
+-----+-----+
Total line number = 1
It costs 0.170s
```

#### 3.4 Last

Finds the values with the largest timestamp that are not NULL in the `temperature` and `humidity` columns.

```SQL
IoTDB> select last(temperature), last(humidity) from table1;
```

The execution result is as follows:

```SQL
+-----+-----+
|_col0|_col1|
+-----+-----+
| 90.0| 34.8|
+-----+-----+
Total line number = 1
It costs 0.211s
```

#### 3.5 First_by

Finds the `time` value of the row with the smallest timestamp that is not NULL in the `temperature` column, and the `humidity` value of the row with the smallest timestamp that is not NULL in the `temperature` column.

```SQL
IoTDB> select first_by(time, temperature), first_by(humidity, temperature) from table1;
```

The execution result is as follows:

```SQL
+-----------------------------+-----+
|                        _col0|_col1|
+-----------------------------+-----+
|2024-11-26T13:37:00.000+08:00| 35.1|
+-----------------------------+-----+
Total line number = 1
It costs 0.269s
```

#### 3.6 Last_by

Queries the `time` value of the row with the largest timestamp that is not NULL in the `temperature` column, and the `humidity` value of the row with the largest timestamp that is not NULL in the `temperature` column.

```SQL
IoTDB> select last_by(time, temperature), last_by(humidity, temperature) from table1;
```

The execution result is as follows:

```SQL
+-----------------------------+-----+
|                        _col0|_col1|
+-----------------------------+-----+
|2024-11-30T14:30:00.000+08:00| 34.8|
+-----------------------------+-----+
Total line number = 1
It costs 0.070s
```

#### 3.7 Max_by

Queries the `time` value of the row where the `temperature` column is at its maximum, and the `humidity` value of the row where the `temperature` column is at its maximum.

```SQL
IoTDB> select max_by(time, temperature), max_by(humidity, temperature) from table1;
```

The execution result is as follows:

```SQL
+-----------------------------+-----+
|                        _col0|_col1|
+-----------------------------+-----+
|2024-11-30T09:30:00.000+08:00| 35.2|
+-----------------------------+-----+
Total line number = 1
It costs 0.172s
```

#### 3.8 Min_by

Queries the `time` value of the row where the `temperature` column is at its minimum, and the `humidity` value of the row where the `temperature` column is at its minimum.

```SQL
select min_by(time, temperature), min_by(humidity, temperature) from table1;
```

The execution result is as follows:

```SQL
+-----------------------------+-----+
|                        _col0|_col1|
+-----------------------------+-----+
|2024-11-29T10:00:00.000+08:00| null|
+-----------------------------+-----+
Total line number = 1
It costs 0.244s
```

## Logical operators

### 1. Overview

Logical operators are used to combine conditions or negate conditions, returning a Boolean result (`true` or `false`).

Below are the commonly used logical operators along with their descriptions:

| Operator | Description                       | Example |
| :------- | :-------------------------------- | :------ |
| AND      | True only if both values are true | a AND b |
| OR       | True if either value is true      | a OR b  |
| NOT      | True when the value is false      | NOT a   |

### 2. Impact of NULL on Logical Operators

#### 2.1 AND Operator

- If one or both sides of the expression are `NULL`, the result may be `NULL`.
- If one side of the `AND` operator is `FALSE`, the expression result is `FALSE`.

Examples：

```SQL
NULL AND true -- null
NULL AND false -- false
NULL AND NULL -- null
```

#### 2.2 OR Operator

- If one or both sides of the expression are `NULL`, the result may be `NULL`.
- If one side of the `OR` operator is `TRUE`, the expression result is `TRUE`.

Examples:

```SQL
NULL OR NULL -- null
NULL OR false -- null
NULL OR true -- true
```

##### 2.2.1 Truth Table

The following truth table illustrates how `NULL` is handled in `AND` and `OR` operators: 

| a     | b     | a AND b | a OR b |
| :---- | :---- | :------ | :----- |
| TRUE  | TRUE  | TRUE    | TRUE   |
| TRUE  | FALSE | FALSE   | TRUE   |
| TRUE  | NULL  | NULL    | TRUE   |
| FALSE | TRUE  | FALSE   | TRUE   |
| FALSE | FALSE | FALSE   | FALSE  |
| FALSE | NULL  | FALSE   | NULL   |
| NULL  | TRUE  | NULL    | TRUE   |
| NULL  | FALSE | FALSE   | NULL   |
| NULL  | NULL  | NULL    | NULL   |

#### 2.3 NOT Operator

The logical negation of `NULL` remains `NULL`.

Example:

```SQL
NOT NULL -- null
```

##### 2.3.1 Truth Table

The following truth table illustrates how `NULL` is handled in the `NOT` operator:

| a     | NOT a |
| :---- | :---- |
| TRUE  | FALSE |
| FALSE | TRUE  |
| NULL  | NULL  |

## Date and Time Functions and Operators

### 1. now() -> Timestamp

Returns the current timestamp.

### 2. date_bin(interval, Timestamp[, Timestamp]) -> Timestamp

The `date_bin` function is used for handling time data by rounding a timestamp (`Timestamp`) to the boundary of a specified time interval (`interval`).

## **Syntax:**

```SQL
-- Calculates the time interval starting from timestamp 0 and returns the nearest interval boundary to the specified timestamp.
date_bin(interval,source)

-- Calculates the time interval starting from the origin timestamp and returns the nearest interval boundary to the specified timestamp.
date_bin(interval,source,origin)

--Supported time units for interval:
--Years (y), months (mo), weeks (week), days (d), hours (h), minutes (M), seconds (s), milliseconds (ms), microseconds (µs), nanoseconds (ns).
--source: Must be of timestamp type.
```

### **Parameters**：

| Parameter | Description                                                  |
| :-------- | :----------------------------------------------------------- |
| interval  | 1. Time interval 2. Supported units: `y`, `mo`, `week`, `d`, `h`, `M`, `s`, `ms`, `µs`, `ns`. |
| source    | 1. The timestamp column or expression to be calculated. 2. Must be of timestamp type. |
| origin    | The reference timestamp.                                     |

### 2.1Syntax Rules ：

1. If `origin` is not specified, the default reference timestamp is `1970-01-01T00:00:00Z` (Beijing time: `1970-01-01 08:00:00`).
2. `interval` must be a non-negative number with a time unit. If `interval` is `0ms`, the function returns `source` directly without calculation.
3. If `origin` or `source` is negative, it represents a time point before the epoch. `date_bin` will calculate and return the relevant time period.
4. If `source` is `null`, the function returns `null`.
5. Mixing months and non-month time units (e.g., `1 MONTH 1 DAY`) is not supported due to ambiguity.

> For example, if the starting point is **April 30, 2000**, calculating `1 DAY` first and then `1 MONTH` results in **June 1, 2000**, whereas calculating `1 MONTH` first and then `1 DAY` results in **May 31, 2000**. The resulting dates are different.                             

#### 2.2 Examples

##### Example Data

The [Example Data page](../Reference/Sample-Data.md) contains SQL statements for building table structures and inserting data. Download and execute these statements in the IoTDB CLI to import the data into IoTDB. You can use this data to test and execute the SQL statements in the examples and obtain the corresponding results.

### Example 1: Without Specifying the Origin Timestamp

```SQL
SELECT 
    time,
    date_bin(1h,time) as time_bin
FROM 
    table1;
```

Result**:**

```Plain
+-----------------------------+-----------------------------+
|                         time|                     time_bin|
+-----------------------------+-----------------------------+
|2024-11-30T09:30:00.000+08:00|2024-11-30T09:00:00.000+08:00|
|2024-11-30T14:30:00.000+08:00|2024-11-30T14:00:00.000+08:00|
|2024-11-29T10:00:00.000+08:00|2024-11-29T10:00:00.000+08:00|
|2024-11-27T16:38:00.000+08:00|2024-11-27T16:00:00.000+08:00|
|2024-11-27T16:39:00.000+08:00|2024-11-27T16:00:00.000+08:00|
|2024-11-27T16:40:00.000+08:00|2024-11-27T16:00:00.000+08:00|
|2024-11-27T16:41:00.000+08:00|2024-11-27T16:00:00.000+08:00|
|2024-11-27T16:42:00.000+08:00|2024-11-27T16:00:00.000+08:00|
|2024-11-27T16:43:00.000+08:00|2024-11-27T16:00:00.000+08:00|
|2024-11-27T16:44:00.000+08:00|2024-11-27T16:00:00.000+08:00|
|2024-11-29T11:00:00.000+08:00|2024-11-29T11:00:00.000+08:00|
|2024-11-29T18:30:00.000+08:00|2024-11-29T18:00:00.000+08:00|
|2024-11-28T08:00:00.000+08:00|2024-11-28T08:00:00.000+08:00|
|2024-11-28T09:00:00.000+08:00|2024-11-28T09:00:00.000+08:00|
|2024-11-28T10:00:00.000+08:00|2024-11-28T10:00:00.000+08:00|
|2024-11-28T11:00:00.000+08:00|2024-11-28T11:00:00.000+08:00|
|2024-11-26T13:37:00.000+08:00|2024-11-26T13:00:00.000+08:00|
|2024-11-26T13:38:00.000+08:00|2024-11-26T13:00:00.000+08:00|
+-----------------------------+-----------------------------+
Total line number = 18
It costs 0.683s
```

### Example 2: Specifying the Origin Timestamp

```SQL
SELECT 
    time,
    date_bin(1h, time, 2024-11-29T18:30:00.000) as time_bin
FROM 
    table1;
```

Result:

```Plain
+-----------------------------+-----------------------------+
|                         time|                     time_bin|
+-----------------------------+-----------------------------+
|2024-11-30T09:30:00.000+08:00|2024-11-30T09:30:00.000+08:00|
|2024-11-30T14:30:00.000+08:00|2024-11-30T14:30:00.000+08:00|
|2024-11-29T10:00:00.000+08:00|2024-11-29T09:30:00.000+08:00|
|2024-11-27T16:38:00.000+08:00|2024-11-27T16:30:00.000+08:00|
|2024-11-27T16:39:00.000+08:00|2024-11-27T16:30:00.000+08:00|
|2024-11-27T16:40:00.000+08:00|2024-11-27T16:30:00.000+08:00|
|2024-11-27T16:41:00.000+08:00|2024-11-27T16:30:00.000+08:00|
|2024-11-27T16:42:00.000+08:00|2024-11-27T16:30:00.000+08:00|
|2024-11-27T16:43:00.000+08:00|2024-11-27T16:30:00.000+08:00|
|2024-11-27T16:44:00.000+08:00|2024-11-27T16:30:00.000+08:00|
|2024-11-29T11:00:00.000+08:00|2024-11-29T10:30:00.000+08:00|
|2024-11-29T18:30:00.000+08:00|2024-11-29T18:30:00.000+08:00|
|2024-11-28T08:00:00.000+08:00|2024-11-28T07:30:00.000+08:00|
|2024-11-28T09:00:00.000+08:00|2024-11-28T08:30:00.000+08:00|
|2024-11-28T10:00:00.000+08:00|2024-11-28T09:30:00.000+08:00|
|2024-11-28T11:00:00.000+08:00|2024-11-28T10:30:00.000+08:00|
|2024-11-26T13:37:00.000+08:00|2024-11-26T13:30:00.000+08:00|
|2024-11-26T13:38:00.000+08:00|2024-11-26T13:30:00.000+08:00|
+-----------------------------+-----------------------------+
Total line number = 18
It costs 0.056s
```

### Example 3: Negative Origin

```SQL
SELECT 
    time,
    date_bin(1h, time, '1969-12-31 00:00:00.000') as time_bin
FROM 
    table1;
```

Result:

```Plain
+-----------------------------+-----------------------------+
|                         time|                     time_bin|
+-----------------------------+-----------------------------+
|2024-11-30T09:30:00.000+08:00|2024-11-30T09:00:00.000+08:00|
|2024-11-30T14:30:00.000+08:00|2024-11-30T14:00:00.000+08:00|
|2024-11-29T10:00:00.000+08:00|2024-11-29T10:00:00.000+08:00|
|2024-11-27T16:38:00.000+08:00|2024-11-27T16:00:00.000+08:00|
|2024-11-27T16:39:00.000+08:00|2024-11-27T16:00:00.000+08:00|
|2024-11-27T16:40:00.000+08:00|2024-11-27T16:00:00.000+08:00|
|2024-11-27T16:41:00.000+08:00|2024-11-27T16:00:00.000+08:00|
|2024-11-27T16:42:00.000+08:00|2024-11-27T16:00:00.000+08:00|
|2024-11-27T16:43:00.000+08:00|2024-11-27T16:00:00.000+08:00|
|2024-11-27T16:44:00.000+08:00|2024-11-27T16:00:00.000+08:00|
|2024-11-29T11:00:00.000+08:00|2024-11-29T11:00:00.000+08:00|
|2024-11-29T18:30:00.000+08:00|2024-11-29T18:00:00.000+08:00|
|2024-11-28T08:00:00.000+08:00|2024-11-28T08:00:00.000+08:00|
|2024-11-28T09:00:00.000+08:00|2024-11-28T09:00:00.000+08:00|
|2024-11-28T10:00:00.000+08:00|2024-11-28T10:00:00.000+08:00|
|2024-11-28T11:00:00.000+08:00|2024-11-28T11:00:00.000+08:00|
|2024-11-26T13:37:00.000+08:00|2024-11-26T13:00:00.000+08:00|
|2024-11-26T13:38:00.000+08:00|2024-11-26T13:00:00.000+08:00|
+-----------------------------+-----------------------------+
Total line number = 18
It costs 0.203s
```

### Example 4: Interval of 0

```SQL
SELECT 
    time,
    date_bin(0ms, time) as time_bin
FROM 
    table1;
```

Result**：**

```Plain
+-----------------------------+-----------------------------+
|                         time|                     time_bin|
+-----------------------------+-----------------------------+
|2024-11-30T09:30:00.000+08:00|2024-11-30T09:30:00.000+08:00|
|2024-11-30T14:30:00.000+08:00|2024-11-30T14:30:00.000+08:00|
|2024-11-29T10:00:00.000+08:00|2024-11-29T10:00:00.000+08:00|
|2024-11-27T16:38:00.000+08:00|2024-11-27T16:38:00.000+08:00|
|2024-11-27T16:39:00.000+08:00|2024-11-27T16:39:00.000+08:00|
|2024-11-27T16:40:00.000+08:00|2024-11-27T16:40:00.000+08:00|
|2024-11-27T16:41:00.000+08:00|2024-11-27T16:41:00.000+08:00|
|2024-11-27T16:42:00.000+08:00|2024-11-27T16:42:00.000+08:00|
|2024-11-27T16:43:00.000+08:00|2024-11-27T16:43:00.000+08:00|
|2024-11-27T16:44:00.000+08:00|2024-11-27T16:44:00.000+08:00|
|2024-11-29T11:00:00.000+08:00|2024-11-29T11:00:00.000+08:00|
|2024-11-29T18:30:00.000+08:00|2024-11-29T18:30:00.000+08:00|
|2024-11-28T08:00:00.000+08:00|2024-11-28T08:00:00.000+08:00|
|2024-11-28T09:00:00.000+08:00|2024-11-28T09:00:00.000+08:00|
|2024-11-28T10:00:00.000+08:00|2024-11-28T10:00:00.000+08:00|
|2024-11-28T11:00:00.000+08:00|2024-11-28T11:00:00.000+08:00|
|2024-11-26T13:37:00.000+08:00|2024-11-26T13:37:00.000+08:00|
|2024-11-26T13:38:00.000+08:00|2024-11-26T13:38:00.000+08:00|
+-----------------------------+-----------------------------+
Total line number = 18
It costs 0.107s
```

### Example 5: Source is NULL

```SQL
SELECT
    arrival_time,
    date_bin(1h,arrival_time) as time_bin
FROM
    table1;
```

Result**：**

```Plain
+-----------------------------+-----------------------------+
|                 arrival_time|                     time_bin|
+-----------------------------+-----------------------------+
|                         null|                         null|
|2024-11-30T14:30:17.000+08:00|2024-11-30T14:00:00.000+08:00|
|2024-11-29T10:00:13.000+08:00|2024-11-29T10:00:00.000+08:00|
|2024-11-27T16:37:01.000+08:00|2024-11-27T16:00:00.000+08:00|
|                         null|                         null|
|2024-11-27T16:37:03.000+08:00|2024-11-27T16:00:00.000+08:00|
|2024-11-27T16:37:04.000+08:00|2024-11-27T16:00:00.000+08:00|
|                         null|                         null|
|                         null|                         null|
|2024-11-27T16:37:08.000+08:00|2024-11-27T16:00:00.000+08:00|
|                         null|                         null|
|2024-11-29T18:30:15.000+08:00|2024-11-29T18:00:00.000+08:00|
|2024-11-28T08:00:09.000+08:00|2024-11-28T08:00:00.000+08:00|
|                         null|                         null|
|2024-11-28T10:00:11.000+08:00|2024-11-28T10:00:00.000+08:00|
|2024-11-28T11:00:12.000+08:00|2024-11-28T11:00:00.000+08:00|
|2024-11-26T13:37:34.000+08:00|2024-11-26T13:00:00.000+08:00|
|2024-11-26T13:38:25.000+08:00|2024-11-26T13:00:00.000+08:00|
+-----------------------------+-----------------------------+
Total line number = 18
It costs 0.319s
```

## Mathematical Functions and Operators

### 1. Mathematical Operators

| **Operator** | **Description**                                 |
| :----------- | :---------------------------------------------- |
| +            | Addition                                        |
| -            | Subtraction                                     |
| *            | Multiplication                                  |
| /            | Division (integer division performs truncation) |
| %            | Modulus (remainder)                             |
| -            | Negation                                        |

### 2. Mathematical functions

| Function Name                    | Description                                                  | Input                       | Output             | Usage      |
| :------------------------------- | :----------------------------------------------------------- | :-------------------------- | :----------------- | :--------- |
| sin                              | Sine                                                         | double, float, INT64, INT32 | double             | sin(x)     |
| cos                              | Cosine                                                       | double, float, INT64, INT32 | double             | cos(x)     |
| tan                              | Tangent                                                      | double, float, INT64, INT32 | double             | tan(x)     |
| asin                             | Inverse Sine                                                 | double, float, INT64, INT32 | double             | asin(x)    |
| acos                             | Inverse Cosine                                               | double, float, INT64, INT32 | double             | acos(x)    |
| atan                             | Inverse Tangent                                              | double, float, INT64, INT32 | double             | atan(x)    |
| sinh                             | Hyperbolic Sine                                              | double, float, INT64, INT32 | double             | sinh(x)    |
| cosh                             | Hyperbolic Cosine                                            | double, float, INT64, INT32 | double             | cosh(x)    |
| tanh                             | Hyperbolic Tangent                                           | double, float, INT64, INT32 | double             | tanh(x)    |
| degrees                          | Converts angle `x` in radians to degrees                     | double, float, INT64, INT32 | double             | degrees(x) |
| radians                          | Radian Conversion from Degrees                               | double, float, INT64, INT32 | double             | radians(x) |
| abs                              | Absolute Value                                               | double, float, INT64, INT32 | Same as input type | abs(x)     |
| sign                             | Returns the sign of `x`:  - If `x = 0`, returns `0`  - If `x > 0`, returns `1`  - If `x < 0`, returns `-1`  For `double/float` inputs:  - If `x = NaN`, returns `NaN`  - If `x = +Infinity`, returns `1.0`  - If `x = -Infinity`, returns `-1.0` | double, float, INT64, INT32 | Same as input type | sign(x)    |
| ceil                             | Rounds `x` up to the nearest integer                         | double, float, INT64, INT32 | double             | ceil(x)    |
| floor                            | Rounds `x` down to the nearest integer                       | double, float, INT64, INT32 | double             | floor(x)   |
| exp                              | Returns `e^x` (Euler's number raised to the power of `x`)    | double, float, INT64, INT32 | double             | exp(x)     |
| ln                               | Returns the natural logarithm of `x`                         | double, float, INT64, INT32 | double             | ln(x)      |
| log10                            | Returns the base 10 logarithm of `x`                         | double, float, INT64, INT32 | double             | log10(x)   |
| round                            | Rounds `x` to the nearest integer                            | double, float, INT64, INT32 | double             | round(x)   |
| Rounds `x` to `d` decimal places | double, float, INT64, INT32                                  | double                      | round(x, d)        |            |
| sqrt                             | Returns the square root of `x`.                              | double, float, INT64, INT32 | double             | sqrt(x)    |
| e                                | Returns Euler’s number `e`.                                  |                             | double             | e()        |
| pi                               | Pi (π)                                                       |                             | double             | pi()       |


## Conditional Expressions

### 1.CASE

CASE expressions come in two forms: **Simple CASE** and **Searched CASE**.

#### 1.1 Simple CASE

The simple form evaluates each value expression from left to right until it finds a match with the given expression:

```SQL
CASE expression
    WHEN value THEN result
    [ WHEN ... ]
    [ ELSE result ]
END
```

If a matching value is found, the corresponding result is returned. If no match is found, the result from the `ELSE` clause (if provided) is returned; otherwise, `NULL` is returned.

Example:

```SQL
SELECT a,       
       CASE a           
           WHEN 1 THEN 'one'
           WHEN 2 THEN 'two'
           ELSE 'many'
       END
```

#### 1.2 Searched CASE

The searched form evaluates each Boolean condition from left to right until a `TRUE` condition is found, then returns the corresponding result:

```SQL
CASE
    WHEN condition THEN result
    [ WHEN ... ]
    [ ELSE result ]
END
```

If no condition evaluates to `TRUE`, the `ELSE` clause result (if provided) is returned; otherwise, `NULL` is returned.

Example:

```SQL
SELECT a, b,       
       CASE          
           WHEN a = 1 THEN 'aaa'
           WHEN b = 2 THEN 'bbb'
           ELSE 'ccc'
       END
```

### 2. COALESCE

Returns the first non-null value from the given list of parameters.

```SQL
coalesce(value1, value2[, ...])
```

## Conversion Functions

### 1. Conversion Functions

#### 1.1 cast(value AS type) → type

Explicitly converts a value to the specified type. This can be used to convert strings (`VARCHAR`) to numeric types or numeric values to string types.

If the conversion fails, a runtime error is thrown.

Example：

```SQL
SELECT *
  FROM table1
  WHERE CAST(time AS DATE) 
  IN (CAST('2024-11-27' AS DATE), CAST('2024-11-28' AS DATE));
```

#### 1.2 try_cast(value AS type) → type

Similar to `CAST()`. If the conversion fails, returns `NULL` instead of throwing an error.

Example：

```SQL
SELECT *
  FROM table1
  WHERE try_cast(time AS DATE) 
  IN (try_cast('2024-11-27' AS DATE), try_cast('2024-11-28' AS DATE));
```

## String Functions and Operators

### 1. String operators

#### 1.1 || Operator

The `||` operator is used for string concatenation and functions the same as the `concat` function.

#### 1.2 LIKE Statement

 The `LIKE` statement is used for pattern matching. For detailed usage, refer to Pattern Matching:[LIKE](#1-like-运算符).

### 2. String Functions

| Function Name | Description                                                  | Input                                                        | Output  | Usage                                                        |
| :------------ | :----------------------------------------------------------- | :----------------------------------------------------------- | :------ | :----------------------------------------------------------- |
| `length`      | Returns the number of characters in a string (not byte length). | `string` (the string whose length is to be calculated)       | INT32   | length(string)                                               |
| `upper`       | Converts all letters in a string to uppercase.               | string                                                       | String  | upper(string)                                                |
| `lower`       | Converts all letters in a string to lowercase.               | string                                                       | String  | lower(string)                                                |
| `trim`        | Removes specified leading and/or trailing characters from a string.  **Parameters:**  - `specification` (optional): Specifies which side to trim:     - `BOTH`: Removes characters from both sides (default).     - `LEADING`: Removes characters from the beginning.     - `TRAILING`: Removes characters from the end.  - `trimcharacter` (optional): Character to be removed (default is whitespace).  - `string`: The target string. | string                                                       | String  | trim([ [ specification ] [ trimcharacter ] FROM ] string) Example：`trim('!' FROM '!foo!');` —— `'foo'` |
| `strpos`      | Returns the position of the first occurrence of `subStr` in `sourceStr`.  **Notes:**  - Position starts at `1`.  - Returns `0` if `subStr` is not found.  - Positioning is based on characters, not byte arrays. | `sourceStr` (string to be searched), `subStr` (substring to find) | INT32   | strpos(sourceStr, subStr)                                    |
| `starts_with` | Checks if `sourceStr` starts with the specified `prefix`.    | `sourceStr`, `prefix`                                        | Boolean | starts_with(sourceStr, prefix)                               |
| `ends_with`   | Checks if `sourceStr` ends with the specified `suffix`.      | `sourceStr`, `suffix`                                        | Boolean | ends_with(sourceStr, suffix)                                 |
| `concat`      | Concatenates `string1, string2, ..., stringN`. Equivalent to the `||` operator. | `string`, `text`                                             | String  | concat(str1, str2, ...) or str1 \|\| str2 ...                |
| `strcmp`      | Compares two strings lexicographically.  **Returns:**  - `-1` if `str1 < str2`  - `0` if `str1 = str2`  - `1` if `str1 > str2`  - `NULL` if either `str1` or `str2` is `NULL` | `string1`, `string2`                                         | INT32   | strcmp(str1, str2)                                           |
| `replace`     | Removes all occurrences of `search` in `string`.             | `string`, `search`                                           | String  | replace(string, search)                                      |
| `replace`     | Replaces all occurrences of `search` in `string` with `replace`. | `string`, `search`, `replace`                                | String  | replace(string, search, replace)                             |
| `substring`   | Extracts a substring from `start_index` to the end of the string. **Notes:**  - `start_index` starts at `1`.  - Returns `NULL` if input is `NULL`.  - Throws an error if `start_index` is greater than string length. | `string`, `start_index`                                      | String  | substring(string from start_index)or substring(string, start_index) |
| `substring`   | Extracts a substring of `length` characters starting from `start_index`. **Notes:**  - `start_index` starts at `1`.  - Returns `NULL` if input is `NULL`.  - Throws an error if `start_index` is greater than string length.  - Throws an error if `length` is negative.  - If `start_index + length` exceeds `int.MAX`, an overflow error may occur. | `string`, `start_index`, `length`                            | String  | substring(string from start_index for length)  or substring(string, start_index, length) |

## Pattern Matching Functions

### 1. LIKE

#### 1.1 Usage

The `LIKE `operator is used to compare a value with a pattern. It is commonly used in the `WHERE `clause to match specific patterns within strings.

#### 1.2 Syntax

```SQL
... column [NOT] LIKE 'pattern' ESCAPE 'character';
```

#### 1.3 Match rules

- Matching characters is case-sensitive
- The pattern supports two wildcard characters:
  - `_` matches any single character
  - `%` matches zero or more characters

#### 1.4 Notes

- `LIKE` pattern matching applies to the entire string by default. Therefore, if it's desired to match a sequence anywhere within a string, the pattern must start and end with a percent sign.
- To match the escape character itself, double it (e.g., `\\` to match `\`). For example, you can use `\\` to match for `\`.

#### 1.5 Examples

#### **Example 1: Match Strings Starting with a Specific Character**

- **Description:** Find all names that start with the letter `E` (e.g., `Europe`).

```SQL
SELECT * FROM table1 WHERE continent LIKE 'E%';
```

#### **Example 2: Exclude a Specific Pattern**

- **Description:** Find all names that do **not** start with the letter `E`.

```SQL
SELECT * FROM table1 WHERE continent NOT LIKE 'E%';
```

#### **Example 3: Match Strings of a Specific Length**

- **Description:** Find all names that start with `A`, end with `a`, and have exactly two characters in between (e.g., `Asia`).

```SQL
SELECT * FROM table1 WHERE continent LIKE 'A__a';
```

#### **Example 4: Escape Special Characters**

- **Description:** Find all names that start with `South_` (e.g., `South_America`). The underscore (`_`) is a wildcard character, so it needs to be escaped using `\`.

```SQL
SELECT * FROM table1 WHERE continent LIKE 'South\_%' ESCAPE '\';
```

#### **Example 5: Match the Escape Character Itself**

- **Description:** Find all names that start with 'South\'. Since `\` is the escape character, it must be escaped using `\\`.

```SQL
SELECT * FROM table1 WHERE continent LIKE 'South\\%' ESCAPE '\';
```

### 2. regexp_like

#### 2.1 Usage

Evaluates whether the regular expression pattern is present within the given string.

#### 2.2 Syntax

```SQL
regexp_like(string, pattern);
```

#### 2.3 Notes

- The pattern for `regexp_like` only needs to be contained within the string, and does not need to match the entire string.
- To match the entire string, use the `^` and `$` anchors.
- `^` signifies the "start of the string," and `$` signifies the "end of the string."
- Regular expressions use the Java-defined regular syntax, but there are the following exceptions to be aware of:
  - Multiline mode
    1. Enabled by: `(?m)`.
    2. Recognizes only `\n` as the line terminator.
    3. Does not support the `(?d)` flag, and its use is prohibited.
  - Case-insensitive matching
    1. Enabled by: `(?i)`.
    2. Based on Unicode rules, it does not support context-dependent and localized matching.
    3. Does not support the `(?u)` flag, and its use is prohibited.
  - Character classes
    1. Within character classes (e.g., `[A-Z123]`), `\Q` and `\E` are not supported and are treated as literals.
  - Unicode character classes (`\p{prop}`)
    1. Underscores in names: All underscores in names must be removed (e.g., `OldItalic `instead of `Old_Italic`).
    2. Scripts: Specify directly, without the need for `Is`, `script=`, or `sc=` prefixes (e.g., `\p{Hiragana}`).
    3. Blocks: Must use the `In` prefix, `block=` or `blk=` prefixes are not supported (e.g., `\p{InMongolian}`).
    4. Categories: Specify directly, without the need for `Is`, `general_category=`, or `gc=` prefixes (e.g., `\p{L}`).
    5. Binary properties: Specify directly, without `Is` (e.g., `\p{NoncharacterCodePoint}`).

#### 2.4 Examples

#### Example 1: **Matching strings containing a specific pattern**

```SQL
SELECT regexp_like('1a 2b 14m', '\\d+b'); -- true
```

- **Explanation**: Determines whether the string '1a 2b 14m' contains a substring that matches the pattern `\d+b`.
  - `\d+` means "one or more digits".
  - `b` represents the letter b.
  - In `'1a 2b 14m'`, the substring `'2b'` matches this pattern, so it returns `true`.
  - 

#### **Example 2: Matching the entire string**

```SQL
SELECT regexp_like('1a 2b 14m', '^\\d+b$'); -- false
```

- **Explanation**: Checks if the string `'1a 2b 14m'` matches the pattern `^\\d+b$` exactly.
  - `\d+` means "one or more digits".
  - `b` represents the letter b.
  - `'1a 2b 14m'` does not match this pattern because it does not start with digits and does not end with `b`, so it returns `false`.