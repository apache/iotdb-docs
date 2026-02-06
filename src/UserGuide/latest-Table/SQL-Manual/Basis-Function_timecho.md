
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

## 1. Comparison Functions and Operators

### 1.1 Basic Comparison Operators

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

#### 1.1.1 Comparison rules:

1. All types can be compared with themselves.
2. Numeric types (INT32, INT64, FLOAT, DOUBLE, TIMESTAMP) can be compared with each other.
3. Character types (STRING, TEXT) can also be compared with each other.
4. Comparisons between types other than those mentioned above will result in an error.

### 1.2 BETWEEN Operator

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

### 1.3 IS NULL Operator

1. These operators apply to all data types.

Example 1: Query records where temperature is NULL

```SQL
SELECT * FROM table1 WHERE temperature IS NULL;
```

Example 2: Query records where humidity is not NULL

```SQL
SELECT * FROM table1 WHERE humidity IS NOT NULL;
```

### 1.4 IN Operator

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

### 1.5 GREATEST and LEAST

The `GREATEST` function returns the maximum value from a list of arguments, while the `LEAST` function returns the minimum value. The return type matches the input data type.

Key Behaviors:
1. NULL Handling: Returns NULL if all arguments are NULL.
2. Parameter Requirements: Requires at least 2 arguments.
3. Type Constraints: All arguments must have the same data type.
4. Supported Types: `BOOLEAN`、`FLOAT`、`DOUBLE`、`INT32`、`INT64`、`STRING`、`TEXT`、`TIMESTAMP`、`DATE`

**Syntax:**

```sql
  greatest(value1, value2, ..., valueN)
  least(value1, value2, ..., valueN)
```

**Examples:**

```sql
-- Retrieve the maximum value between `temperature` and `humidity` in `table2`  
SELECT GREATEST(temperature,humidity) FROM table2;

-- Retrieve the minimum value between `temperature` and `humidity` in `table2`  
SELECT LEAST(temperature,humidity) FROM table2;
```

## 2. Aggregate functions

### 2.1 Overview

1. Aggregate functions are many-to-one functions. They perform aggregate calculations on a set of values to obtain a single aggregate result.

2. Except for `COUNT()`, all other aggregate functions ignore null values and return null when there are no input rows or all values are null. For example, `SUM()` returns null instead of zero, and `AVG()` does not include null values in the count.

### 2.2 Supported Aggregate Functions                            

| Function Name          | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Allowed Input Types                                                                                                                                                                                                                               | Output Type                                |
|:-----------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:-------------------------------------------|
| COUNT                  | Counts the number of data points.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | All types                                                                                                                                                                                                                                         | INT64                                      |
| COUNT_IF               | COUNT_IF(exp) counts the number of rows that satisfy a specified boolean expression.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | `exp` must be a boolean expression,(e.g. `count_if(temperature>20)`)                                                                                                                                                                              | INT64                                    |
| APPROX_COUNT_DISTINCT  | The APPROX_COUNT_DISTINCT(x[, maxStandardError]) function provides an approximation of COUNT(DISTINCT x), returning the estimated number of distinct input values.                                                                                                                                                                                                                                                                                                                                                                                                                                             | `x`: The target column to be calculated, supports all data types.<br>`maxStandardError` (optional): Specifies the maximum standard error allowed for the function's result. Valid range is [0.0040625, 0.26]. Defaults to 0.023 if not specified. | INT64                                           |
| APPROX_MOST_FREQUENT | The APPROX_MOST_FREQUENT(x, k, capacity) function is used to approximately calculate the top k most frequent elements in a dataset. It returns a JSON-formatted string where the keys are the element values and the values are their corresponding approximate frequencies. （Available since V2.0.5.1) | `x` : The column to be calculated, supporting all existing data types in IoTDB;<br> `k`: The number of top-k most frequent values to return;<br>`capacity`: The number of buckets used for computation, which relates to memory usage—a larger value reduces error but consumes more memory, while a smaller value increases error but uses less memory. | STRING |
| SUM                    | Calculates the sum.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | INT32 INT64 FLOAT DOUBLE                                                                                                                                                                                                                          | DOUBLE                                     |
| AVG                    | Calculates the average.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | INT32 INT64 FLOAT DOUBLE                                                                                                                                                                                                                          | DOUBLE                                     |
| MAX                    | Finds the maximum value.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | All types                                                                                                                                                                                                                                         | Same as input type                         |
| MIN                    | Finds the minimum value.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | All types                                                                                                                                                                                                                                         | Same as input type                         |
| FIRST                  | Finds the value with the smallest timestamp that is not NULL.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | All types                                                                                                                                                                                                                                         | Same as input type                         |
| LAST                   | Finds the value with the largest timestamp that is not NULL.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | All types                                                                                                                                                                                                                                         | Same as input type                         |
| STDDEV                 | Alias for STDDEV_SAMP,  calculates the sample standard deviation.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | INT32 INT64 FLOAT DOUBLE                                                                                                                                                                                                                          | DOUBLE                                     |
| STDDEV_POP             | Calculates the population standard deviation.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | INT32 INT64 FLOAT DOUBLE                                                                                                                                                                                                                          | DOUBLE                                     |
| STDDEV_SAMP            | Calculates the sample standard deviation.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | INT32 INT64 FLOAT DOUBLE                                                                                                                                                                                                                          | DOUBLE                                     |
| VARIANCE               | Alias for VAR_SAMP,  calculates the sample variance.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | INT32 INT64 FLOAT DOUBLE                                                                                                                                                                                                                          | DOUBLE                                     |
| VAR_POP                | Calculates the population variance.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | INT32 INT64 FLOAT DOUBLE                                                                                                                                                                                                                          | DOUBLE                                     |
| VAR_SAMP               | Calculates the sample variance.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | INT32 INT64 FLOAT DOUBLE                                                                                                                                                                                                                          | DOUBLE                                     |
| EXTREME                | Finds the value with the largest absolute value. If the largest absolute values of positive and negative values are equal, returns the positive value.                                                                                                                                                                                                                                                                                                                                                                                                                                                         | INT32 INT64 FLOAT DOUBLE                                                                                                                                                                                                                          | Same as input type                         |
| MODE                   | Finds the mode. Note: 1. There is a risk of memory exception when the number of distinct values in the input sequence is too large; 2. If all elements have the same frequency, i.e., there is no mode, a random element is returned; 3. If there are multiple modes, a random mode is returned; 4. NULL values are also counted in frequency, so even if not all values in the input sequence are NULL, the final result may still be NULL.                                                                                                                                                                   | All types                                                                                                                                                                                                                                         | Same as input type                         |
| MAX_BY                 | MAX_BY(x, y) finds the value of x corresponding to the maximum y in the binary input x and y. MAX_BY(time, x) returns the timestamp when x is at its maximum.                                                                                                                                                                                                                                                                                                                                                                                                                                                  | x and y can be of any type                                                                                                                                                                                                                        | Same as the data type of the first input x |
| MIN_BY                 | MIN_BY(x, y) finds the value of x corresponding to the minimum y in the binary input x and y. MIN_BY(time, x) returns the timestamp when x is at its minimum.                                                                                                                                                                                                                                                                                                                                                                                                                                                  | x and y can be of any type                                                                                                                                                                                                                        | Same as the data type of the first input x |
| FIRST_BY               | FIRST_BY(x, y) finds the value of x in the same row when y is the first non-null value.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | x and y can be of any type                                                                                                                                                                                                                        | Same as the data type of the first input x |
| LAST_BY                | LAST_BY(x, y) finds the value of x in the same row when y is the last non-null value.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | x and y can be of any type                                                                                                                                                                                                                        | Same as the data type of the first input x |


### 2.3 Examples

#### 2.3.1 Example Data

The [Example Data page](../Reference/Sample-Data.md) contains SQL statements for building table structures and inserting data. Download and execute these statements in the IoTDB CLI to import the data into IoTDB. You can use this data to test and execute the SQL statements in the examples and obtain the corresponding results.

#### 2.3.2 Count

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


#### 2.3.3 Count_if

Count `Non-Null` `arrival_time` Records in `table2`

```sql
select count_if(arrival_time is not null) from table2;
```

The execution result is as follows:

```sql
+-----+
|_col0|
+-----+
|    4|
+-----+
Total line number = 1
It costs 0.047s
```

#### 2.3.4 Approx_count_distinct

Retrieve the number of distinct values in the `temperature` column from `table1`.

```sql
IoTDB> SELECT COUNT(DISTINCT temperature) as origin, APPROX_COUNT_DISTINCT(temperature) as approx FROM table1;
IoTDB> SELECT COUNT(DISTINCT temperature) as origin, APPROX_COUNT_DISTINCT(temperature,0.006) as approx FROM table1;
```

The execution result is as follows:

```sql
+------+------+
|origin|approx|
+------+------+
|     3|     3|
+------+------+
Total line number = 1
It costs 0.022s
```

#### 2.3.5 Approx_most_frequent

Query the ​​top 2 most frequent values​​ in the `temperature` column of `table1`.

```sql
IoTDB> select approx_most_frequent(temperature,2,100) as topk from table1;
```

The execution result is as follows:

```sql
+-------------------+
|               topk|
+-------------------+
|{"85.0":6,"90.0":5}|
+-------------------+
Total line number = 1
It costs 0.064s
```


#### 2.3.6 First

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

#### 2.3.7 Last

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

#### 2.3.8 First_by

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

#### 2.3.9 Last_by

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

#### 2.3.10 Max_by

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

#### 2.3.11 Min_by

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


## 3. Logical operators

### 3.1 Overview

Logical operators are used to combine conditions or negate conditions, returning a Boolean result (`true` or `false`).

Below are the commonly used logical operators along with their descriptions:

| Operator | Description                       | Example |
| :------- | :-------------------------------- | :------ |
| AND      | True only if both values are true | a AND b |
| OR       | True if either value is true      | a OR b  |
| NOT      | True when the value is false      | NOT a   |

### 3.2 Impact of NULL on Logical Operators

#### 3.2.1 AND Operator

- If one or both sides of the expression are `NULL`, the result may be `NULL`.
- If one side of the `AND` operator is `FALSE`, the expression result is `FALSE`.

Examples：

```SQL
NULL AND true -- null
NULL AND false -- false
NULL AND NULL -- null
```

#### 3.2.2 OR Operator

- If one or both sides of the expression are `NULL`, the result may be `NULL`.
- If one side of the `OR` operator is `TRUE`, the expression result is `TRUE`.

Examples:

```SQL
NULL OR NULL -- null
NULL OR false -- null
NULL OR true -- true
```

##### 3.2.2.1 Truth Table

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

#### 3.2.3 NOT Operator

The logical negation of `NULL` remains `NULL`.

Example:

```SQL
NOT NULL -- null
```

##### 3.2.3.1 Truth Table

The following truth table illustrates how `NULL` is handled in the `NOT` operator:

| a     | NOT a |
| :---- | :---- |
| TRUE  | FALSE |
| FALSE | TRUE  |
| NULL  | NULL  |

## 4. Date and Time Functions and Operators

### 4.1 now() -> Timestamp

Returns the current timestamp.

### 4.2 date_bin(interval, Timestamp[, Timestamp]) -> Timestamp

The `date_bin` function is used for handling time data by rounding a timestamp (`Timestamp`) to the boundary of a specified time interval (`interval`).

#### **Syntax:**

```SQL
-- Calculates the time interval starting from timestamp 0 and returns the nearest interval boundary to the specified timestamp.
date_bin(interval,source)

-- Calculates the time interval starting from the origin timestamp and returns the nearest interval boundary to the specified timestamp.
date_bin(interval,source,origin)

--Supported time units for interval:
--Years (y), months (mo), weeks (week), days (d), hours (h), minutes (M), seconds (s), milliseconds (ms), microseconds (µs), nanoseconds (ns).
--source: Must be of timestamp type.
```

#### **Parameters**：

| Parameter | Description                                                  |
| :-------- | :----------------------------------------------------------- |
| interval  | 1. Time interval 2. Supported units: `y`, `mo`, `week`, `d`, `h`, `M`, `s`, `ms`, `µs`, `ns`. |
| source    | 1. The timestamp column or expression to be calculated. 2. Must be of timestamp type. |
| origin    | The reference timestamp.                                     |

#### 4.2.1Syntax Rules ：

1. If `origin` is not specified, the default reference timestamp is `1970-01-01T00:00:00Z` (Beijing time: `1970-01-01 08:00:00`).
2. `interval` must be a non-negative number with a time unit. If `interval` is `0ms`, the function returns `source` directly without calculation.
3. If `origin` or `source` is negative, it represents a time point before the epoch. `date_bin` will calculate and return the relevant time period.
4. If `source` is `null`, the function returns `null`.
5. Mixing months and non-month time units (e.g., `1 MONTH 1 DAY`) is not supported due to ambiguity.

> For example, if the starting point is **April 30, 2000**, calculating `1 DAY` first and then `1 MONTH` results in **June 1, 2000**, whereas calculating `1 MONTH` first and then `1 DAY` results in **May 31, 2000**. The resulting dates are different.                             

#### 4.2.2 Examples

##### Example Data

The [Example Data page](../Reference/Sample-Data.md) contains SQL statements for building table structures and inserting data. Download and execute these statements in the IoTDB CLI to import the data into IoTDB. You can use this data to test and execute the SQL statements in the examples and obtain the corresponding results.

#### Example 1: Without Specifying the Origin Timestamp

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

#### Example 2: Specifying the Origin Timestamp

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

#### Example 3: Negative Origin

```SQL
SELECT 
    time,
    date_bin(1h, time, 1969-12-31 00:00:00.000) as time_bin
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

#### Example 4: Interval of 0

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

#### Example 5: Source is NULL

```SQL
SELECT
    arrival_time,
    date_bin(1h,arrival_time) as time_bin
FROM
    table1;
```

Result:

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

### 4.3 Extract Function

This function is used to extract the value of a specific part of a date. (Supported from version V2.0.6)

#### 4.3.1 Syntax Definition

```SQL
EXTRACT (identifier FROM expression)
```

* Parameter Description
  * **expression**: `TIMESTAMP` type or a time constant
  * **identifier**: The valid ranges and corresponding return value types are shown in the table below.

    | Valid Range          | Return Type   | 	     Return Range |
    |----------------------|---------------|--------------------|
    | `YEAR`               | `INT64`       | `/`                |
    | `QUARTER`            | `INT64`       | `1-4`              |
    | `MONTH`              | `INT64`       | `1-12`             |
    | `WEEK`               | `INT64`       | `1-53`             |
    | `DAY_OF_MONTH (DAY)` | `INT64`       | `1-31`             |
    | `DAY_OF_WEEK (DOW)`  | `INT64`       | `1-7`              |
    | `DAY_OF_YEAR (DOY)`  | `INT64`       | `1-366`            |
    | `HOUR`               | `INT64`       | `0-23`             |
    | `MINUTE`             | `INT64`       | `0-59`             |
    | `SECOND`             | `INT64`       | `0-59`             |
    | `MS`                 | `INT64`       | `0-999`            |
    | `US`                 | `INT64`       | `0-999`            |
    | `NS`                 | `INT64`       | `0-999`            |


#### 4.3.2 Usage Example

Using table1 from the [Sample Data](../Reference/Sample-Data.md) as the source data, query the average temperature for the first 12 hours of each day within a certain period.

```SQL
IoTDB:database1> select format('%1$tY-%1$tm-%1$td',date_bin(1d,time)) as fmtdate,avg(temperature) as avgtp from table1 where time >= 2024-11-26T00:00:00 and time <= 2024-11-30T23:59:59 and extract(hour from time) <= 12 group by date_bin(1d,time) order by date_bin(1d,time)
+----------+-----+
|   fmtdate|avgtp|
+----------+-----+
|2024-11-28| 86.0|
|2024-11-29| 85.0|
|2024-11-30| 90.0|
+----------+-----+
Total line number = 3
It costs 0.041s
```

Introduction to the `Format` function: [Format Function](../SQL-Manual/Basis-Function_timecho.md#_7-2-format-function)

Introduction to the `Date_bin` function: [Date_bin Funtion](../SQL-Manual/Basis-Function_timecho.md#_4-2-date-bin-interval-timestamp-timestamp-timestamp)


## 5. Mathematical Functions and Operators

### 5.1 Mathematical Operators

| **Operator** | **Description**                                 |
| :----------- | :---------------------------------------------- |
| +            | Addition                                        |
| -            | Subtraction                                     |
| *            | Multiplication                                  |
| /            | Division (integer division performs truncation) |
| %            | Modulus (remainder)                             |
| -            | Negation                                        |

### 5.2 Mathematical functions

| Function Name | Description                                                                                                                                                                                                                                      | Input                       | Output             | Usage      |
|:--------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:----------------------------|:-------------------| :--------- |
| sin           | Sine                                                                                                                                                                                                                                             | double, float, INT64, INT32 | double             | sin(x)     |
| cos           | Cosine                                                                                                                                                                                                                                           | double, float, INT64, INT32 | double             | cos(x)     |
| tan           | Tangent                                                                                                                                                                                                                                          | double, float, INT64, INT32 | double             | tan(x)     |
| asin          | Inverse Sine                                                                                                                                                                                                                                     | double, float, INT64, INT32 | double             | asin(x)    |
| acos          | Inverse Cosine                                                                                                                                                                                                                                   | double, float, INT64, INT32 | double             | acos(x)    |
| atan          | Inverse Tangent                                                                                                                                                                                                                                  | double, float, INT64, INT32 | double             | atan(x)    |
| sinh          | Hyperbolic Sine                                                                                                                                                                                                                                  | double, float, INT64, INT32 | double             | sinh(x)    |
| cosh          | Hyperbolic Cosine                                                                                                                                                                                                                                | double, float, INT64, INT32 | double             | cosh(x)    |
| tanh          | Hyperbolic Tangent                                                                                                                                                                                                                               | double, float, INT64, INT32 | double             | tanh(x)    |
| degrees       | Converts angle `x` in radians to degrees                                                                                                                                                                                                         | double, float, INT64, INT32 | double             | degrees(x) |
| radians       | Radian Conversion from Degrees                                                                                                                                                                                                                   | double, float, INT64, INT32 | double             | radians(x) |
| abs           | Absolute Value                                                                                                                                                                                                                                   | double, float, INT64, INT32 | Same as input type | abs(x)     |
| sign          | Returns the sign of `x`:  - If `x = 0`, returns `0`  - If `x > 0`, returns `1`  - If `x < 0`, returns `-1`  For `double/float` inputs:  - If `x = NaN`, returns `NaN`  - If `x = +Infinity`, returns `1.0`  - If `x = -Infinity`, returns `-1.0` | double, float, INT64, INT32 | Same as input type | sign(x)    |
| ceil          | Rounds `x` up to the nearest integer                                                                                                                                                                                                             | double, float, INT64, INT32 | double             | ceil(x)    |
| floor         | Rounds `x` down to the nearest integer                                                                                                                                                                                                           | double, float, INT64, INT32 | double             | floor(x)   |
| exp           | Returns `e^x` (Euler's number raised to the power of `x`)                                                                                                                                                                                        | double, float, INT64, INT32 | double             | exp(x)     |
| ln            | Returns the natural logarithm of `x`                                                                                                                                                                                                             | double, float, INT64, INT32 | double             | ln(x)      |
| log10         | Returns the base 10 logarithm of `x`                                                                                                                                                                                                             | double, float, INT64, INT32 | double             | log10(x)   |
| round         | Rounds `x` to the nearest integer                                                                                                                                                                                                                | double, float, INT64, INT32 | double             | round(x)   |
| round         | Rounds `x` to `d` decimal places                                                                                                                                                                                                                 | double, float, INT64, INT32 | double             | round(x, d) |
| sqrt          | Returns the square root of `x`.                                                                                                                                                                                                                  | double, float, INT64, INT32 | double             | sqrt(x)    |
| e             | Returns Euler’s number `e`.                                                                                                                                                                                                                      |                             | double             | e()        |
| pi            | Pi (π)                                                                                                                                                                                                                                           |                             | double             | pi()       |

## 6. Bitwise Functions

> Supported from version V2.0.6

Example raw data is as follows:

```
IoTDB:database1> select * from bit_table
+-----------------------------+---------+------+-----+
|                         time|device_id|length|width|
+-----------------------------+---------+------+-----+
|2025-10-29T15:59:42.957+08:00|       d1|    14|   12|
|2025-10-29T15:58:59.399+08:00|       d3|    15|   10|
|2025-10-29T15:59:32.769+08:00|       d2|    13|   12|
+-----------------------------+---------+------+-----+

-- Table creation statement
CREATE TABLE bit_table(time TIMESTAMP TIME, device_id STRING TAG, length INT32 FIELD, width INT32 FIELD);

-- Write data
INSERT INTO bit_table values(2025-10-29 15:59:42.957, 'd1', 14, 12),(2025-10-29 15:58:59.399, 'd3', 15, 10),(2025-10-29 15:59:32.769, 'd2', 13, 12);
```

### 6.1 bit\_count(num, bits)

The `bit_count(num, bits)`function is used to count the number of 1s in the binary representation of the integer `num`under the specified bit width `bits`.

#### 6.1.1 Syntax Definition

```
bit_count(num, bits) -> INT64 -- The return type is Int64
```

* Parameter Description

    * **​num:​**​ Any integer value (int32 or int64)
    * **​bits:​**​ Integer value, with a valid range of 2\~64

Note: An error will be raised if the number of `bits`is insufficient to represent `num`(using ​**two's complement signed representation**​): `Argument exception, the scalar function num must be representable with the bits specified. [num] cannot be represented with [bits] bits.`

* Usage Methods

    * Two specific numbers: `bit_count(9, 64)`
    * Column and a number: `bit_count(column1, 64)`
    * Between two columns: `bit_count(column1, column2)`

#### 6.1.2 Usage Examples

```
-- Two specific numbers
IoTDB:database1> select distinct bit_count(2,8) from bit_table
+-----+
|_col0|
+-----+
|    1|
+-----+
-- Two specific numbers
IoTDB:database1> select distinct bit_count(-5,8) from bit_table
+-----+
|_col0|
+-----+
|    7|
+-----+
-- Column and a number
IoTDB:database1> select length,bit_count(length,8) from bit_table
+------+-----+
|length|_col1|
+------+-----+
|    14|    3|
|    15|    4|
|    13|    3|
+------+-----+
-- Insufficient bits
IoTDB:database1> select length,bit_count(length,2) from bit_table
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701: Argument exception, the scalar function num must be representable with the bits specified. 13 cannot be represented with 2 bits.
```

### 6.2 bitwise\_and(x, y)

The `bitwise_and(x, y)`function performs a logical AND operation on each bit of two integers x and y based on their two's complement representation, and returns the bitwise AND operation result.

#### 6.2.1 Syntax Definition

```
bitwise_and(x, y) -> INT64 -- The return type is Int64
```

* Parameter Description

    * ​**x, y**​: Must be integer values of data type Int32 or Int64
* Usage Methods

    * Two specific numbers: `bitwise_and(19, 25)`
    * Column and a number: `bitwise_and(column1, 25)`
    * Between two columns: `bitwise_and(column1, column2)`

#### 6.2.2 Usage Examples

```
--Two specific numbers
IoTDB:database1> select distinct bitwise_and(19,25) from bit_table
+-----+
|_col0|
+-----+
|   17|
+-----+
--Column and a number
IoTDB:database1> select length, bitwise_and(length,25) from bit_table
+------+-----+
|length|_col1|
+------+-----+
|    14|    8|
|    15|    9|
|    13|    9|
+------+-----+
--Between two columns
IoTDB:database1> select length, width, bitwise_and(length, width) from bit_table
+------+-----+-----+
|length|width|_col2|
+------+-----+-----+
|    14|   12|   12|
|    15|   10|   10|
|    13|   12|   12|
+------+-----+-----+
```

### 6.3 bitwise\_not(x)

The `bitwise_not(x)`function performs a logical NOT operation on each bit of the integer x based on its two's complement representation, and returns the bitwise NOT operation result.

#### 6.3.1 Syntax Definition

```
bitwise_not(x) -> INT64 -- The return type is Int64
```

* Parameter Description

    * ​**x**​: Must be an integer value of data type Int32 or Int64
* Usage Methods

    * Specific number: `bitwise_not(5)`
    * Single column operation: `bitwise_not(column1)`

#### 6.3.2 Usage Examples

```
-- Specific number
IoTDB:database1> select distinct bitwise_not(5) from bit_table
+-----+
|_col0|
+-----+
|   -6|
+-----+
-- Single column
IoTDB:database1> select length, bitwise_not(length) from bit_table
+------+-----+
|length|_col1|
+------+-----+
|    14|  -15|
|    15|  -16|
|    13|  -14|
+------+-----+
```

### 6.4 bitwise\_or(x, y)

The `bitwise_or(x,y)`function performs a logical OR operation on each bit of two integers x and y based on their two's complement representation, and returns the bitwise OR operation result.

#### 6.4.1 Syntax Definition

```
bitwise_or(x, y) -> INT64 -- The return type is Int64
```

* Parameter Description

    * ​**x, y**​: Must be integer values of data type Int32 or Int64
* Usage Methods

    * Two specific numbers: `bitwise_or(19, 25)`
    * Column and a number: `bitwise_or(column1, 25)`
    * Between two columns: `bitwise_or(column1, column2)`

#### 6.4.2 Usage Examples

```
-- Two specific numbers
IoTDB:database1> select distinct bitwise_or(19,25) from bit_table
+-----+
|_col0|
+-----+
|   27|
+-----+
-- Column and a number
IoTDB:database1> select length,bitwise_or(length,25) from bit_table
+------+-----+
|length|_col1|
+------+-----+
|    14|   31|
|    15|   31|
|    13|   29|
+------+-----+
-- Between two columns
IoTDB:database1> select length, width, bitwise_or(length,width) from bit_table
+------+-----+-----+
|length|width|_col2|
+------+-----+-----+
|    14|   12|   14|
|    15|   10|   15|
|    13|   12|   13|
+------+-----+-----+
```

### 6.5 bitwise\_xor(x, y)

The `bitwise_xor(x,y)`function performs a logical XOR (exclusive OR) operation on each bit of two integers x and y based on their two's complement representation, and returns the bitwise XOR operation result. XOR rule: same bits result in 0, different bits result in 1.

#### 6.5.1 Syntax Definition

```
bitwise_xor(x, y) -> INT64 -- The return type is Int64
```

* Parameter Description

    * ​**x, y**​: Must be integer values of data type Int32 or Int64
* Usage Methods

    * Two specific numbers: `bitwise_xor(19, 25)`
    * Column and a number: `bitwise_xor(column1, 25)`
    * Between two columns: `bitwise_xor(column1, column2)`

#### 6.5.2 Usage Examples

```
-- Two specific numbers
IoTDB:database1> select distinct bitwise_xor(19,25) from bit_table
+-----+
|_col0|
+-----+
|   10|
+-----+
-- Column and a number
IoTDB:database1> select length,bitwise_xor(length,25) from bit_table
+------+-----+
|length|_col1|
+------+-----+
|    14|   23|
|    15|   22|
|    13|   20|
+------+-----+
-- Between two columns
IoTDB:database1> select length, width, bitwise_xor(length,width) from bit_table
+------+-----+-----+
|length|width|_col2|
+------+-----+-----+
|    14|   12|    2|
|    15|   10|    5|
|    13|   12|    1|
+------+-----+-----+
```

### 6.6 bitwise\_left\_shift(value, shift)

The `bitwise_left_shift(value, shift)`function returns the result of shifting the binary representation of integer `value`left by `shift`bits. The left shift operation moves bits towards the higher-order direction, filling the vacated lower-order bits with 0s, and discarding the higher-order bits that overflow. Equivalent to: `value << shift`.

#### 6.6.1 Syntax Definition

```
bitwise_left_shift(value, shift) -> [same as value] -- The return type is the same as the data type of value
```

* Parameter Description

    * ​**value**​: The integer value to shift left. Must be of data type Int32 or Int64.
    * ​**shift**​: The number of bits to shift. Must be of data type Int32 or Int64.
* Usage Methods

    * Two specific numbers: `bitwise_left_shift(1, 2)`
    * Column and a number: `bitwise_left_shift(column1, 2)`
    * Between two columns: `bitwise_left_shift(column1, column2)`

#### 6.6.2 Usage Examples

```
--Two specific numbers
IoTDB:database1> select distinct bitwise_left_shift(1,2) from bit_table
+-----+
|_col0|
+-----+
|    4|
+-----+
-- Column and a number
IoTDB:database1> select length, bitwise_left_shift(length,2) from bit_table
+------+-----+
|length|_col1|
+------+-----+
|    14|   56|
|    15|   60|
|    13|   52|
+------+-----+
-- Between two columns
IoTDB:database1> select length, width, bitwise_left_shift(length,width) from bit_table
+------+-----+-----+
|length|width|_col2|
+------+-----+-----+
|    14|   12|    0|
|    15|   10|    0|
|    13|   12|    0|
+------+-----+-----+
```

### 6.7 bitwise\_right\_shift(value, shift)

The `bitwise_right_shift(value, shift)`function returns the result of logically (unsigned) right shifting the binary representation of integer `value`by `shift`bits. The logical right shift operation moves bits towards the lower-order direction, filling the vacated higher-order bits with 0s, and discarding the lower-order bits that overflow.

#### 6.7.1 Syntax Definition

```
bitwise_right_shift(value, shift) -> [same as value] -- The return type is the same as the data type of value
```

* Parameter Description

    * ​**value**​: The integer value to shift right. Must be of data type Int32 or Int64.
    * ​**shift**​: The number of bits to shift. Must be of data type Int32 or Int64.
* Usage Methods

    * Two specific numbers: `bitwise_right_shift(8, 3)`
    * Column and a number: `bitwise_right_shift(column1, 3)`
    * Between two columns: `bitwise_right_shift(column1, column2)`

#### 6.7.2 Usage Examples

```
--Two specific numbers
IoTDB:database1> select distinct bitwise_right_shift(8,3) from bit_table
+-----+
|_col0|
+-----+
|    1|
+-----+
--Column and a number
IoTDB:database1> select length, bitwise_right_shift(length,3) from bit_table
+------+-----+
|length|_col1|
+------+-----+
|    14|    1|
|    15|    1|
|    13|    1|
+------+-----+
--Between two columns
IoTDB:database1> select length, width, bitwise_right_shift(length,width) from bit_table
+------+-----+-----+
|length|width|_col2|
+------+-----+-----+
|    14|   12|    0|
|    15|   10|    0|
|    13|   12|    0|
```

### 6.8 bitwise\_right\_shift\_arithmetic(value, shift)

The `bitwise_right_shift_arithmetic(value, shift)`function returns the result of arithmetically right shifting the binary representation of integer `value`by `shift`bits. The arithmetic right shift operation moves bits towards the lower-order direction, discarding the lower-order bits that overflow, and filling the vacated higher-order bits with the sign bit (0 for positive numbers, 1 for negative numbers) to preserve the sign of the number.

#### 6.8.1 Syntax Definition

```
bitwise_right_shift_arithmetic(value, shift) -> [same as value]-- The return type is the same as the data type of value
```

* Parameter Description

    * ​**value**​: The integer value to shift right. Must be of data type Int32 or Int64.
    * ​**shift**​: The number of bits to shift. Must be of data type Int32 or Int64.
* Usage Methods:

    * Two specific numbers: `bitwise_right_shift_arithmetic(12, 2)`
    * Column and a number: `bitwise_right_shift_arithmetic(column1, 64)`
    * Between two columns: `bitwise_right_shift_arithmetic(column1, column2)`

#### 6.8.2 Usage Examples

```
--Two specific numbers
IoTDB:database1> select distinct bitwise_right_shift_arithmetic(12,2) from bit_table
+-----+
|_col0|
+-----+
|    3|
+-----+
-- Column and a number
IoTDB:database1> select length, bitwise_right_shift_arithmetic(length,3) from bit_table
+------+-----+
|length|_col1|
+------+-----+
|    14|    1|
|    15|    1|
|    13|    1|
+------+-----+
--Between two columns
IoTDB:database1> select length, width, bitwise_right_shift_arithmetic(length,width) from bit_table
+------+-----+-----+
|length|width|_col2|
+------+-----+-----+
|    14|   12|    0|
|    15|   10|    0|
|    13|   12|    0|
+------+-----+-----+
```


## 7. Conditional Expressions

### 7.1 CASE

CASE expressions come in two forms: **Simple CASE** and **Searched CASE**.

#### 7.1.1 Simple CASE

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

#### 7.1.2 Searched CASE

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

### 7.2 COALESCE

Returns the first non-null value from the given list of parameters.

```SQL
coalesce(value1, value2[, ...])
```

## 8. Conversion Functions

### 8.1 Conversion Functions

#### 8.1.1 cast(value AS type) → type

Explicitly converts a value to the specified type. This can be used to convert strings (`VARCHAR`) to numeric types or numeric values to string types. Starting from V2.0.8, OBJECT type can be explicitly cast to STRING type.

If the conversion fails, a runtime error is thrown.

Example：

```SQL
SELECT *
  FROM table1
  WHERE CAST(time AS DATE) 
  IN (CAST('2024-11-27' AS DATE), CAST('2024-11-28' AS DATE));
```

#### 8.1.2 try_cast(value AS type) → type

Similar to `CAST()`. If the conversion fails, returns `NULL` instead of throwing an error.

Example：

```SQL
SELECT *
  FROM table1
  WHERE try_cast(time AS DATE) 
  IN (try_cast('2024-11-27' AS DATE), try_cast('2024-11-28' AS DATE));
```

### 8.2 Format Function

This function generates and returns a formatted string based on a specified format string and input arguments. Similar to Java’s `String.format` or C’s `printf`, it allows developers to construct dynamic string templates using placeholder syntax. Predefined format specifiers in the template are replaced precisely with corresponding argument values, producing a complete string that adheres to specific formatting requirements.

#### 8.2.1 Syntax

```SQL
format(pattern, ...args) -> STRING
```

**Parameters**

* `pattern`: A format string containing static text and one or more format specifiers (e.g., `%s`, `%d`), or any expression returning a `STRING`/`TEXT` type.
* `args`: Input arguments to replace format specifiers. Constraints:
  * Number of arguments ≥ 1.
  * Multiple arguments must be comma-separated (e.g., `arg1, arg2`).
  * Total arguments can exceed the number of specifiers in `pattern` but cannot be fewer, otherwise an exception is triggered.

**Return Value**

* Formatted result string of type `STRING`.

#### 8.2.2 Usage Examples

1. Format Floating-Point Numbers
   ```SQL
   IoTDB:database1> SELECT format('%.5f', humidity) FROM table1 WHERE humidity = 35.4;
   +--------+
   |   _col0|
   +--------+
   |35.40000|
   +--------+
   ```
2. Format Integers
   ```SQL
   IoTDB:database1> SELECT format('%03d', 8) FROM table1 LIMIT 1;
   +-----+
   |_col0|
   +-----+
   |  008|
   +-----+
   ```
3. Format Dates and Timestamps

* Locale-Specific Date

```SQL
IoTDB:database1> SELECT format('%1$tA, %1$tB %1$te, %1$tY', 2024-01-01) FROM table1 LIMIT 1;
+--------------------+
|               _col0|
+--------------------+
|Monday, January 1, 2024|
+--------------------+
```

* Remove Timezone Information

```SQL
IoTDB:database1> SELECT format('%1$tY-%1$tm-%1$td %1$tH:%1$tM:%1$tS.%1$tL', 2024-01-01T00:00:00.000+08:00) FROM table1 LIMIT 1;
+-----------------------+
|                  _col0|
+-----------------------+
|2024-01-01 00:00:00.000|
+-----------------------+
```

* Second-Level Timestamp Precision

```SQL
IoTDB:database1> SELECT format('%1$tF %1$tT', 2024-01-01T00:00:00.000+08:00) FROM table1 LIMIT 1;
+-------------------+
|              _col0|
+-------------------+
|2024-01-01 00:00:00|
+-------------------+
```

* Date/Time Format Symbols

| **Symbol** | **​ Description**                                                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 'H'              | 24-hour format (two digits, zero-padded), i.e. 00 - 23                                                                                                                  |
| 'I'              | 12-hour format (two digits, zero-padded), i.e. 01 - 12                                                                                                                  |
| 'k'              | 24-hour format (no padding), i.e. 0 - 23                                                                                                                                |
| 'l'              | 12-hour format (no padding), i.e. 1 - 12                                                                                                                                |
| 'M'              | Minute (two digits, zero-padded), i.e. 00 - 59                                                                                                                          |
| 'S'              | Second (two digits, zero-padded; supports leap seconds), i.e. 00 - 60                                                                                                   |
| 'L'              | Millisecond (three digits, zero-padded), i.e. 000 - 999                                                                                                                 |
| 'N'              | Nanosecond (nine digits, zero-padded), i.e. 000000000 - 999999999。                                                                                                     |
| 'p'              | Locale-specific lowercase AM/PM marker (e.g., "am", "pm"). Prefix with`T`to force uppercase (e.g., "AM").                                                           |
| 'z'              | RFC 822 timezone offset from GMT (e.g.,`-0800`). Adjusts for daylight saving. Uses the JVM's default timezone for`long`/`Long`/`Date`.                  |
| 'Z'              | Timezone abbreviation (e.g., "PST"). Adjusts for daylight saving. Uses the JVM's default timezone; Formatter's timezone overrides the argument's timezone if specified. |
| 's'              | Seconds since Unix epoch (1970-01-01 00:00:00 UTC), i.e. Long.MIN\_VALUE/1000 to Long.MAX\_VALUE/1000。                                                                 |
| 'Q'              | Milliseconds since Unix epoch, i.e. Long.MIN\_VALUE 至 Long.MAX\_VALUE。                                                                                                |

* Common Date/Time Conversion Characters

| **Symbol** | **​ Description**                                                   |
| ---------------- | -------------------------------------------------------------------- |
| 'B'            | Locale-specific full month name, for example "January", "February" |
| 'b'            | Locale-specific abbreviated month name,  for example "Jan", "Feb"  |
| 'h'            | Same as`b`                                                     |
| 'A'            | Locale-specific full weekday name,  for example "Sunday", "Monday" |
| 'a'            | Locale-specific short weekday name,  for example "Sun", "Mon"      |
| 'C'            | Year divided by 100 (two digits, zero-padded)                      |
| 'Y'            | Year (minimum 4 digits, zero-padded)                               |
| 'y'            | Last two digits of year (zero-padded)                              |
| 'j'            | Day of year (three digits, zero-padded)                            |
| 'm'            | Month (two digits, zero-padded)                                    |
| 'd'            | Day of month (two digits, zero-padded)                             |
| 'e'            | Day of month (no padding)                                          |

4. Format Strings
   ```SQL
   IoTDB:database1> SELECT format('The measurement status is: %s', status) FROM table2 LIMIT 1;
   +-------------------------------+
   |                          _col0|
   +-------------------------------+
   |The measurement status is: true|
   +-------------------------------+
   ```
5. Format Percentage Sign
   ```SQL
   IoTDB:database1> SELECT format('%s%%', 99.9) FROM table1 LIMIT 1;
   +-----+
   |_col0|
   +-----+
   |99.9%|
   +-----+
   ```

#### 8.2.3 Format Conversion Failure Scenarios

1. Type Mismatch Errors

* Timestamp Type Conflict

  If the format specifier includes time-related tokens (e.g., `%Y-%m-%d`) but the argument:

  * Is a non-`DATE`/`TIMESTAMP` type value.  ◦
  * Requires sub-day precision (e.g., `%H`, `%M`) but the argument is not `TIMESTAMP`.

```SQL
-- Example 1
IoTDB:database1> SELECT format('%1$tA, %1$tB %1$te, %1$tY', humidity) from table2 limit 1
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701: Invalid format string: %1$tA, %1$tB %1$te, %1$tY (IllegalFormatConversion: A != java.lang.Float)

-- Example 2
IoTDB:database1> SELECT format('%1$tY-%1$tm-%1$td %1$tH:%1$tM:%1$tS.%1$tL', humidity) from table1 limit 1
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701: Invalid format string: %1$tY-%1$tm-%1$td %1$tH:%1$tM:%1$tS.%1$tL (IllegalFormatConversion: Y != java.lang.Float)
```

* Floating-Point Type Conflict

  Using `%f` with non-numeric arguments (e.g., strings or booleans):

```SQL
IoTDB:database1> select format('%.5f',status) from table1 where humidity = 35.4
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701: Invalid format string: %.5f (IllegalFormatConversion: f != java.lang.Boolean)
```

2. Argument Count Mismatch
   The number of arguments must equal or exceed the number of format specifiers.

   ```SQL
   IoTDB:database1> SELECT format('%.5f %03d', humidity) FROM table1 WHERE humidity = 35.4;
   Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701: Invalid format string: %.5f %03d (MissingFormatArgument: Format specifier '%03d')
   ```
3. Invalid Invocation Errors

  Triggered if:

  * Total arguments < 2 (must include `pattern` and at least one argument).•
  * `pattern` is not of type `STRING`/`TEXT`.

```SQL
-- Example 1
IoTDB:database1> select format('%s') from table1 limit 1
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701: Scalar function format must have at least two arguments, and first argument pattern must be TEXT or STRING type.

--Example 2
IoTDB:database1> select format(123, humidity) from table1 limit 1
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701: Scalar function format must have at least two arguments, and first argument pattern must be TEXT or STRING type.
```


## 9. String Functions and Operators

### 9.1 String operators

#### 9.1.1 || Operator

The `||` operator is used for string concatenation and functions the same as the `concat` function.

#### 9.1.2 LIKE Statement

 The `LIKE` statement is used for pattern matching. For detailed usage, refer to Pattern Matching:[LIKE](#1-like-运算符).

### 9.2 String Functions

| Function Name | Description                                                                                                                                                                                                                                                                                                                                                                                                                              | Input                                                             | Output  | Usage                                                        |
| :------------ |:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:------------------------------------------------------------------| :------ | :----------------------------------------------------------- |
| `length`      | Returns the number of characters in a string (not byte length).                                                                                                                                                                                                                                                                                                                                                                          | `string` (the string whose length is to be calculated)            | INT32   | length(string)                                               |
| `upper`       | Converts all letters in a string to uppercase.                                                                                                                                                                                                                                                                                                                                                                                           | string                                                            | String  | upper(string)                                                |
| `lower`       | Converts all letters in a string to lowercase.                                                                                                                                                                                                                                                                                                                                                                                           | string                                                            | String  | lower(string)                                                |
| `trim`        | Removes specified leading and/or trailing characters from a string.  **Parameters:**  - `specification` (optional): Specifies which side to trim:     - `BOTH`: Removes characters from both sides (default).     - `LEADING`: Removes characters from the beginning.     - `TRAILING`: Removes characters from the end.  - `trimcharacter` (optional): Character to be removed (default is whitespace).  - `string`: The target string. | string                                                            | String  | trim([ [ specification ] [ trimcharacter ] FROM ] string) Example：`trim('!' FROM '!foo!');` —— `'foo'` |
| `strpos`      | Returns the position of the first occurrence of `subStr` in `sourceStr`.  **Notes:**  - Position starts at `1`.  - Returns `0` if `subStr` is not found.  - Positioning is based on characters, not byte arrays.                                                                                                                                                                                                                         | `sourceStr` (string to be searched), `subStr` (substring to find) | INT32   | strpos(sourceStr, subStr)                                    |
| `starts_with` | Checks if `sourceStr` starts with the specified `prefix`.                                                                                                                                                                                                                                                                                                                                                                                | `sourceStr`, `prefix`                                             | Boolean | starts_with(sourceStr, prefix)                               |
| `ends_with`   | Checks if `sourceStr` ends with the specified `suffix`.                                                                                                                                                                                                                                                                                                                                                                                  | `sourceStr`, `suffix`                                             | Boolean | ends_with(sourceStr, suffix)                                 |
| `concat`      | Concatenates `string1, string2, ..., stringN`. Equivalent to the `\|\|` operator.                                                                                                                                                                                                                                                                                                                                                        | `string`, `text`                                             | String  | concat(str1, str2, ...) or str1 \|\| str2 ...                |
| `strcmp`      | Compares two strings lexicographically.  **Returns:**  - `-1` if `str1 < str2`  - `0` if `str1 = str2`  - `1` if `str1 > str2`  - `NULL` if either `str1` or `str2` is `NULL`                                                                                                                                                                                                                                                            | `string1`, `string2`                                              | INT32   | strcmp(str1, str2)                                           |
| `replace`     | Removes all occurrences of `search` in `string`.                                                                                                                                                                                                                                                                                                                                                                                         | `string`, `search`                                                | String  | replace(string, search)                                      |
| `replace`     | Replaces all occurrences of `search` in `string` with `replace`.                                                                                                                                                                                                                                                                                                                                                                         | `string`, `search`, `replace`                                     | String  | replace(string, search, replace)                             |
| `substring`   | Extracts a substring from `start_index` to the end of the string. **Notes:**  - `start_index` starts at `1`.  - Returns `NULL` if input is `NULL`.  - Throws an error if `start_index` is greater than string length.                                                                                                                                                                                                                    | `string`, `start_index`                                           | String  | substring(string from start_index)or substring(string, start_index) |
| `substring`   | Extracts a substring of `length` characters starting from `start_index`. **Notes:**  - `start_index` starts at `1`.  - Returns `NULL` if input is `NULL`.  - Throws an error if `start_index` is greater than string length.  - Throws an error if `length` is negative.  - If `start_index + length` exceeds `int.MAX`, an overflow error may occur.                                                                                    | `string`, `start_index`, `length`                                 | String  | substring(string from start_index for length)  or substring(string, start_index, length) |

## 10. Pattern Matching Functions

### 10.1 LIKE

#### 10.1.1 Usage

The `LIKE `operator is used to compare a value with a pattern. It is commonly used in the `WHERE `clause to match specific patterns within strings.

#### 10.1.2 Syntax

```SQL
... column [NOT] LIKE 'pattern' ESCAPE 'character';
```

#### 10.1.3 Match rules

- Matching characters is case-sensitive
- The pattern supports two wildcard characters:
  - `_` matches any single character
  - `%` matches zero or more characters

#### 10.1.4 Notes

- `LIKE` pattern matching applies to the entire string by default. Therefore, if it's desired to match a sequence anywhere within a string, the pattern must start and end with a percent sign.
- To match the escape character itself, double it (e.g., `\\` to match `\`). For example, you can use `\\` to match for `\`.

#### 10.1.5 Examples

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

### 10.2 regexp_like

#### 10.2.1 Usage

Evaluates whether the regular expression pattern is present within the given string.

#### 10.2.2 Syntax

```SQL
regexp_like(string, pattern);
```

#### 10.2.3 Notes

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

#### 10.2.4 Examples

#### Example 1: **Matching strings containing a specific pattern**

```SQL
SELECT regexp_like('1a 2b 14m', '\\d+b'); -- true
```

- **Explanation**: Determines whether the string '1a 2b 14m' contains a substring that matches the pattern `\d+b`.
  - `\d+` means "one or more digits".
  - `b` represents the letter b.
  - In `'1a 2b 14m'`, the substring `'2b'` matches this pattern, so it returns `true`.


#### **Example 2: Matching the entire string**

```SQL
SELECT regexp_like('1a 2b 14m', '^\\d+b$'); -- false
```

- **Explanation**: Checks if the string `'1a 2b 14m'` matches the pattern `^\\d+b$` exactly.
  - `\d+` means "one or more digits".
  - `b` represents the letter b.
  - `'1a 2b 14m'` does not match this pattern because it does not start with digits and does not end with `b`, so it returns `false`.

## 11. Timeseries Windowing Functions

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

### 11.1 HOP

#### 11.1.1 Function Description

The HOP function segments data into overlapping time windows for analysis, assigning each row to all windows that overlap with its timestamp. If windows overlap (when SLIDE < SIZE), data will be duplicated across multiple windows.

#### 11.1.2 Function Definition

```SQL
HOP(data, timecol, size, slide[, origin])
```

#### 11.1.3 Parameter Description

| Parameter | Type   | Attributes                      | Description             |
| ----------- | -------- | --------------------------------- | ------------------------- |
| DATA      | Table  | ROW SEMANTIC, PASS THROUGH      | Input table             |
| TIMECOL   | Scalar | String (default: 'time')        | Time column             |
| SIZE      | Scalar | Long integer                    | Window size             |
| SLIDE     | Scalar | Long integer                    | Sliding step            |
| ORIGIN    | Scalar | Timestamp (default: Unix epoch) | First window start time |


#### 11.1.4 Returned Results

The HOP function returns:

* `window_start`: Window start time (inclusive)
* `window_end`: Window end time (exclusive)
* Pass-through columns: All input columns from DATA

#### 11.1.5 Usage Example

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

-- Equivalent to tree mode's GROUP BY TIME when combined with GROUP BY
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

### 11.2 SESSION

#### 11.2.1 Function Description

The SESSION function groups data into sessions based on time intervals. It checks the time gap between consecutive rows—rows with gaps smaller than the threshold (GAP) are grouped into the current window, while larger gaps trigger a new window.

#### 11.2.2 Function Definition

```SQL
SESSION(data [PARTITION BY(pkeys, ...)] [ORDER BY(okeys, ...)], timecol, gap)
```
#### 11.2.3 Parameter Description

| Parameter | Type   | Attributes                 | Description                          |
| ----------- | -------- | ---------------------------- | -------------------------------------- |
| DATA      | Table  | SET SEMANTIC, PASS THROUGH | Input table with partition/sort keys |
| TIMECOL   | Scalar | String (default: 'time')   | Time column name                     |
| GAP       | Scalar | Long integer               | Session gap threshold                |

#### 11.2.4 Returned Results

The SESSION function returns:

* `window_start`: Time of the first row in the session
* `window_end`: Time of the last row in the session
* Pass-through columns: All input columns from DATA

#### 11.2.5 Usage Example

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

-- Equivalent to tree mode's GROUP BY SESSION when combined with GROUP BY
IoTDB> SELECT window_start, window_end, stock_id, avg(price) as avg FROM SESSION(DATA => bid PARTITION BY stock_id ORDER BY time,TIMECOL => 'time',GAP => 2m) GROUP BY window_start, window_end, stock_id;
+-----------------------------+-----------------------------+--------+------------------+
|                 window_start|                   window_end|stock_id|               avg|
+-----------------------------+-----------------------------+--------+------------------+
|2021-01-01T09:06:00.000+08:00|2021-01-01T09:07:00.000+08:00|    TESL|             201.0|
|2021-01-01T09:15:00.000+08:00|2021-01-01T09:15:00.000+08:00|    TESL|             195.0|
|2021-01-01T09:05:00.000+08:00|2021-01-01T09:09:00.000+08:00|    AAPL|101.66666666666667|
+-----------------------------+-----------------------------+--------+------------------+
```

### 11.3 VARIATION

#### 11.3.1 Function Description

The VARIATION function groups data based on value differences. The first row becomes the baseline for the first window. Subsequent rows are compared to the baseline—if the difference is within the threshold (DELTA), they join the current window; otherwise, a new window starts with that row as the new baseline.

#### 11.3.2 Function Definition

```sql
VARIATION(data [PARTITION BY(pkeys, ...)] [ORDER BY(okeys, ...)], col, delta)
```

#### 11.3.3 Parameter Description

| Parameter | Type   | Attributes                 | Description                          |
| ----------- | -------- | ---------------------------- | -------------------------------------- |
| DATA      | Table  | SET SEMANTIC, PASS THROUGH | Input table with partition/sort keys |
| COL       | Scalar | String                     | Column for difference calculation    |
| DELTA     | Scalar | Float                      | Difference threshold                 |

#### 11.3.4 Returned Results

The VARIATION function returns:

* `window_index`: Window identifier
* Pass-through columns: All input columns from DATA

#### 11.3.5 Usage Example

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

-- Equivalent to tree mode's GROUP BY VARIATION when combined with GROUP BY
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

### 11.4 CAPACITY

#### 11.4.1 Function Description

The CAPACITY function groups data into fixed-size windows, where each window contains up to SIZE rows.

#### 11.4.2 Function Definition

```sql
CAPACITY(data [PARTITION BY(pkeys, ...)] [ORDER BY(okeys, ...)], size)
```

#### 11.4.3 Parameter Description

| Parameter | Type   | Attributes                 | Description                          |
| ----------- | -------- | ---------------------------- | -------------------------------------- |
| DATA      | Table  | SET SEMANTIC, PASS THROUGH | Input table with partition/sort keys |
| SIZE      | Scalar | Long integer               | Window size (row count)              |

#### 11.4.4 Returned Results

The CAPACITY function returns:

* `window_index`: Window identifier
* Pass-through columns: All input columns from DATA

#### 11.4.5 Usage Example

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

-- Equivalent to tree mode's GROUP BY COUNT when combined with GROUP BY
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

### 11.5 TUMBLE

#### 11.5.1 Function Description

The TUMBLE function assigns each row to a non-overlapping, fixed-size time window based on a timestamp attribute.

#### 11.5.2 Function Definition

```sql
TUMBLE(data, timecol, size[, origin])
```
#### 11.5.3 Parameter Description

| Parameter | Type   | Attributes                      | Description             |
| ----------- | -------- | --------------------------------- | ------------------------- |
| DATA      | Table  | ROW SEMANTIC, PASS THROUGH      | Input table             |
| TIMECOL   | Scalar | String (default: 'time')        | Time column             |
| SIZE      | Scalar | Long integer (positive)         | Window size             |
| ORIGIN    | Scalar | Timestamp (default: Unix epoch) | First window start time |

#### 11.5.4 Returned Results

The TUMBLE function returns:

* `window_start`: Window start time (inclusive)
* `window_end`: Window end time (exclusive)
* Pass-through columns: All input columns from DATA

#### 11.5.5 Usage Example

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

-- Equivalent to tree mode's GROUP BY TIME when combined with GROUP BY
IoTDB> SELECT window_start, window_end, stock_id, avg(price) as avg FROM TUMBLE(DATA => bid, TIMECOL => 'time', SIZE => 10m) GROUP BY window_start, window_end, stock_id;
+-----------------------------+-----------------------------+--------+------------------+
|                 window_start|                   window_end|stock_id|               avg|
+-----------------------------+-----------------------------+--------+------------------+
|2021-01-01T09:00:00.000+08:00|2021-01-01T09:10:00.000+08:00|    TESL|             201.0|
|2021-01-01T09:10:00.000+08:00|2021-01-01T09:20:00.000+08:00|    TESL|             195.0|
|2021-01-01T09:00:00.000+08:00|2021-01-01T09:10:00.000+08:00|    AAPL|101.66666666666667|
+-----------------------------+-----------------------------+--------+------------------+
```

### 11.6 CUMULATE

#### 11.6.1 Function Description

The CUMULATE function creates expanding windows from an initial window, maintaining the same start time while incrementally extending the end time by STEP until reaching SIZE. Each window contains all elements within its range. For example, with a 1-hour STEP and 24-hour SIZE, daily windows would be: `[00:00, 01:00)`, `[00:00, 02:00)`, ..., `[00:00, 24:00)`.

#### 11.6.2 Function Definition

```sql
CUMULATE(data, timecol, size, step[, origin])
```

#### 11.6.3 Parameter Description

| Parameter | Type   | Attributes                      | Description                                       |
| ----------- | -------- | --------------------------------- | --------------------------------------------------- |
| DATA      | Table  | ROW SEMANTIC, PASS THROUGH      | Input table                                       |
| TIMECOL   | Scalar | String (default: 'time')        | Time column                                       |
| SIZE      | Scalar | Long integer (positive)         | Window size (must be an integer multiple of STEP) |
| STEP      | Scalar | Long integer (positive)         | Expansion step                                    |
| ORIGIN    | Scalar | Timestamp (default: Unix epoch) | First window start time                           |

> Note: An error `Cumulative table function requires size must be an integral multiple of step` occurs if SIZE is not divisible by STEP.

#### 11.6.4 Returned Results

The CUMULATE function returns:

* `window_start`: Window start time (inclusive)
* `window_end`: Window end time (exclusive)
* Pass-through columns: All input columns from DATA

#### 11.6.5 Usage Example

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

-- Equivalent to tree mode's GROUP BY TIME when combined with GROUP BY
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
