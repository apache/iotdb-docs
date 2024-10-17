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

# Aggregate Functions

Aggregate functions are many-to-one functions. They perform aggregate calculations on a set of values, resulting in a single aggregated result.

All aggregate functions except `COUNT()`, `COUNT_IF()` ignore null values and return null when there are no input rows or all values are null. For example, `SUM()` returns null instead of zero, and `AVG()` does not include null values in the count.

The aggregate functions supported by IoTDB are as follows:

| Function Name | Description                                                  | Allowed Input Series Data Types                     | Required Attributes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Output Series Data Type                              |
| ------------- | ------------------------------------------------------------ |-----------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------|
| SUM           | Summation.                                                   | INT32 INT64 FLOAT DOUBLE                            | /                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | DOUBLE                                               |
| COUNT         | Counts the number of data points.                            | All data types                                      | /                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | INT                                                  |
| AVG           | Average.                                                     | INT32 INT64 FLOAT DOUBLE                            | /                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | DOUBLE                                               |
| EXTREME       | Finds the value with the largest absolute value. Returns a positive value if the maximum absolute value of positive and negative values is equal. | INT32 INT64 FLOAT DOUBLE                            | /                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Consistent with the input data type                  |
| MAX_VALUE     | Find the maximum value.                                      | INT32 INT64 FLOAT DOUBLE                            | /                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Consistent with the input data type                  |
| MIN_VALUE     | Find the minimum value.                                      | INT32 INT64 FLOAT DOUBLE                            | /                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Consistent with the input data type                  |
| FIRST_VALUE   | Find the value with the smallest timestamp.                  | All data types                                      | /                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Consistent with input data type                      |
| LAST_VALUE    | Find the value with the largest timestamp.                   | All data types                                      | /                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Consistent with input data type                      |
| MAX_TIME      | Find the maximum timestamp.                                  | All data Types                                      | /                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Timestamp                                            |
| MIN_TIME      | Find the minimum timestamp.                                  | All data Types                                      | /                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Timestamp                                            |
| COUNT_IF      | Find the number of data points that continuously meet a given condition and the number of data points that meet the condition (represented by keep) meet the specified threshold. | BOOLEAN                                             | `[keep >=/>/=/!=/</<=]threshold`：The specified threshold or threshold condition, it is equivalent to `keep >= threshold` if `threshold` is used alone, type of `threshold` is `INT64` `ignoreNull`：Optional, default value is `true`；If the value is `true`, null values are ignored, it means that if there is a null value in the middle, the value is ignored without interrupting the continuity. If the value is `true`, null values are not ignored, it means that if there are null values in the middle, continuity will be broken | INT64                                                |
| TIME_DURATION | Find the difference between the timestamp of the largest non-null value and the timestamp of the smallest non-null value in a column | All data Types                                      | /                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | INT64                                                |
| MODE          | Find the mode. Note:  1.Having too many different values in the input series risks a memory exception;  2.If all the elements have the same number of occurrences, that is no Mode, return the value with earliest time;  3.If there are many Modes, return the Mode with earliest time. | All data Types                                      | /                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Consistent with the input data type                  |
| COUNT_TIME    | The number of timestamps in the query data set. When used with `align by device`, the result is the number of timestamps in the data set per device.                                                                                                                                       | All data Types, the input parameter can only be `*` | /                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | INT64                                                |
| MAX_BY        | MAX_BY(x, y) returns the value of x corresponding to the maximum value of the input y. MAX_BY(time, x) returns the timestamp when x is at its maximum value.                                                                                                                             | The first input x can be of any type, while the second input y must be of type INT32, INT64, FLOAT, or DOUBLE. | / |  Consistent with the data type of the first input x. |
| MIN_BY        | MIN_BY(x, y) returns the value of x corresponding to the minimum value of the input y. MIN_BY(time, x) returns the timestamp when x is at its minimum value.                                                                                                                             | The first input x can be of any type, while the second input y must be of type INT32, INT64, FLOAT, or DOUBLE. | /                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Consistent with the data type of the first input x.  |


## COUNT

### example

```sql
select count(status) from root.ln.wf01.wt01;
```
Result:

```
+-------------------------------+
|count(root.ln.wf01.wt01.status)|
+-------------------------------+
|                          10080|
+-------------------------------+
Total line number = 1
It costs 0.016s
```

## COUNT_IF

### Grammar
```sql
count_if(predicate, [keep >=/>/=/!=/</<=]threshold[, 'ignoreNull'='true/false'])
```
predicate: legal expression with `BOOLEAN` return type

use of threshold and ignoreNull can see above table

>Note: count_if is not supported to use with SlidingWindow in group by time now

### example

#### raw data

``` 
+-----------------------------+-------------+-------------+
|                         Time|root.db.d1.s1|root.db.d1.s2|
+-----------------------------+-------------+-------------+
|1970-01-01T08:00:00.001+08:00|            0|            0|
|1970-01-01T08:00:00.002+08:00|         null|            0|
|1970-01-01T08:00:00.003+08:00|            0|            0|
|1970-01-01T08:00:00.004+08:00|            0|            0|
|1970-01-01T08:00:00.005+08:00|            1|            0|
|1970-01-01T08:00:00.006+08:00|            1|            0|
|1970-01-01T08:00:00.007+08:00|            1|            0|
|1970-01-01T08:00:00.008+08:00|            0|            0|
|1970-01-01T08:00:00.009+08:00|            0|            0|
|1970-01-01T08:00:00.010+08:00|            0|            0|
+-----------------------------+-------------+-------------+
```

#### Not use `ignoreNull` attribute (Ignore Null)

SQL:
```sql
select count_if(s1=0 & s2=0, 3), count_if(s1=1 & s2=0, 3) from root.db.d1
```

Result:
```
+--------------------------------------------------+--------------------------------------------------+
|count_if(root.db.d1.s1 = 0 & root.db.d1.s2 = 0, 3)|count_if(root.db.d1.s1 = 1 & root.db.d1.s2 = 0, 3)|
+--------------------------------------------------+--------------------------------------------------+
|                                                 2|                                                 1|
+--------------------------------------------------+--------------------------------------------------
```

#### Use `ignoreNull` attribute

SQL:
```sql
select count_if(s1=0 & s2=0, 3, 'ignoreNull'='false'), count_if(s1=1 & s2=0, 3, 'ignoreNull'='false') from root.db.d1
```

Result:
```
+------------------------------------------------------------------------+------------------------------------------------------------------------+
|count_if(root.db.d1.s1 = 0 & root.db.d1.s2 = 0, 3, "ignoreNull"="false")|count_if(root.db.d1.s1 = 1 & root.db.d1.s2 = 0, 3, "ignoreNull"="false")|
+------------------------------------------------------------------------+------------------------------------------------------------------------+
|                                                                       1|                                                                       1|
+------------------------------------------------------------------------+------------------------------------------------------------------------+
```

## TIME_DURATION
### Grammar
```sql
    time_duration(Path)
```
### Example
#### raw data
```sql
+----------+-------------+
|      Time|root.db.d1.s1|
+----------+-------------+
|         1|           70|
|         3|           10|
|         4|          303|
|         6|          110|
|         7|          302|
|         8|          110|
|         9|           60|
|        10|           70|
|1677570934|           30|
+----------+-------------+
```
#### Insert sql
```sql
"CREATE DATABASE root.db",
"CREATE TIMESERIES root.db.d1.s1 WITH DATATYPE=INT32, ENCODING=PLAIN tags(city=Beijing)",
"INSERT INTO root.db.d1(timestamp,s1,s2,s3) values(1, 2, 10, true)",
"INSERT INTO root.db.d1(timestamp,s1,s2,s3) values(2, null, 20, true)",
"INSERT INTO root.db.d1(timestamp,s1,s2,s3) values(3, 10, 0, null)",
"INSERT INTO root.db.d1(timestamp,s1,s2,s3) values(4, 303, 30, true)",
"INSERT INTO root.db.d1(timestamp,s1,s2,s3) values(5, null, 20, true)",
"INSERT INTO root.db.d1(timestamp,s1,s2,s3) values(6, 110, 20, true)",
"INSERT INTO root.db.d1(timestamp,s1,s2,s3) values(7, 302, 20, true)",
"INSERT INTO root.db.d1(timestamp,s1,s2,s3) values(8, 110, null, true)",
"INSERT INTO root.db.d1(timestamp,s1,s2,s3) values(9, 60, 20, true)",
"INSERT INTO root.db.d1(timestamp,s1,s2,s3) values(10,70, 20, null)",
"INSERT INTO root.db.d1(timestamp,s1,s2,s3) values(1677570934, 30, 0, true)",
```

SQL:
```sql
select time_duration(s1) from root.db.d1
```

Result:
```
+----------------------------+
|time_duration(root.db.d1.s1)|
+----------------------------+
|                  1677570933|
+----------------------------+
```
> Note: Returns 0 if there is only one data point, or null if the data point is null.

## COUNT_TIME
### Grammar
```sql
    count_time(*)
```
### Example
#### raw data
```
+----------+-------------+-------------+-------------+-------------+
|      Time|root.db.d1.s1|root.db.d1.s2|root.db.d2.s1|root.db.d2.s2|
+----------+-------------+-------------+-------------+-------------+
|         0|            0|         null|         null|            0|
|         1|         null|            1|            1|         null|
|         2|         null|            2|            2|         null|
|         4|            4|         null|         null|            4|
|         5|            5|            5|            5|            5|
|         7|         null|            7|            7|         null|
|         8|            8|            8|            8|            8|
|         9|         null|            9|         null|         null|
+----------+-------------+-------------+-------------+-------------+
```
#### Insert sql
```sql
CREATE DATABASE root.db;
CREATE TIMESERIES root.db.d1.s1 WITH DATATYPE=INT32, ENCODING=PLAIN;
CREATE TIMESERIES root.db.d1.s2 WITH DATATYPE=INT32, ENCODING=PLAIN;
CREATE TIMESERIES root.db.d2.s1 WITH DATATYPE=INT32, ENCODING=PLAIN;
CREATE TIMESERIES root.db.d2.s2 WITH DATATYPE=INT32, ENCODING=PLAIN;
INSERT INTO root.db.d1(time, s1) VALUES(0, 0), (4,4), (5,5), (8,8);
INSERT INTO root.db.d1(time, s2) VALUES(1, 1), (2,2), (5,5), (7,7), (8,8), (9,9);
INSERT INTO root.db.d2(time, s1) VALUES(1, 1), (2,2), (5,5), (7,7), (8,8);
INSERT INTO root.db.d2(time, s2) VALUES(0, 0), (4,4), (5,5), (8,8);
```

Query-Example - 1:
```sql
select count_time(*) from root.db.**
```

Result
```
+-------------+
|count_time(*)|
+-------------+
|            8|
+-------------+
```

Query-Example - 2:
```sql
select count_time(*) from root.db.d1, root.db.d2
```

Result
```
+-------------+
|count_time(*)|
+-------------+
|            8|
+-------------+
```

Query-Example - 3:
```sql
select count_time(*) from root.db.** group by([0, 10), 2ms)
```

Result
``` 
+-----------------------------+-------------+
|                         Time|count_time(*)|
+-----------------------------+-------------+
|1970-01-01T08:00:00.000+08:00|            2|            
|1970-01-01T08:00:00.002+08:00|            1|            
|1970-01-01T08:00:00.004+08:00|            2|            
|1970-01-01T08:00:00.006+08:00|            1|            
|1970-01-01T08:00:00.008+08:00|            2|            
+-----------------------------+-------------+
```

Query-Example - 4:
```sql
select count_time(*) from root.db.** group by([0, 10), 2ms) align by device
```

Result
```
+-----------------------------+----------+-------------+
|                         Time|    Device|count_time(*)|
+-----------------------------+----------+-------------+
|1970-01-01T08:00:00.000+08:00|root.db.d1|            2|
|1970-01-01T08:00:00.002+08:00|root.db.d1|            1|
|1970-01-01T08:00:00.004+08:00|root.db.d1|            2|
|1970-01-01T08:00:00.006+08:00|root.db.d1|            1|
|1970-01-01T08:00:00.008+08:00|root.db.d1|            2|
|1970-01-01T08:00:00.000+08:00|root.db.d2|            2|
|1970-01-01T08:00:00.002+08:00|root.db.d2|            1|
|1970-01-01T08:00:00.004+08:00|root.db.d2|            2|
|1970-01-01T08:00:00.006+08:00|root.db.d2|            1|
|1970-01-01T08:00:00.008+08:00|root.db.d2|            1|
+-----------------------------+----------+-------------+
```

> Note:
> 1. The parameter in count_time can only be *.
> 2. Count_time aggregation cannot be used with other aggregation functions.
> 3. Count_time aggregation used with having statement is not supported, and count_time aggregation can not appear in the having statement.
> 4. Count_time does not support use with group by level, group by tag.


### MAX_BY
#### Function Definition
max_by(x, y): Returns the value of x at the timestamp when y is at its maximum.
- max_by must have two input parameters x and y.
- The first input x can be the keyword time, with max_by(time, x) returning the timestamp when x is at its maximum value.
- If x is null at the timestamp corresponding to the maximum value of y, null is returned.
- If y reaches its maximum value at multiple timestamps, the x value corresponding to the smallest timestamp among those maximum values is returned.
- Consistent with IoTDB max_value, only INT32, INT64, FLOAT, DOUBLE are supported as inputs for y, while all six types are supported as inputs for x.
- Direct numerical values are not allowed as inputs for either x or y.

#### Grammar
```sql
select max_by(x, y) from root.sg
select max_by(time, x) from root.sg
```

#### Examples

##### Input Data
```sql
IoTDB> select * from root.test
+-----------------------------+-----------+-----------+
|                         Time|root.test.a|root.test.b|
+-----------------------------+-----------+-----------+
|1970-01-01T08:00:00.001+08:00|        1.0|       10.0|
|1970-01-01T08:00:00.002+08:00|        2.0|       10.0|
|1970-01-01T08:00:00.003+08:00|        3.0|        3.0|
|1970-01-01T08:00:00.004+08:00|       10.0|       10.0|
|1970-01-01T08:00:00.005+08:00|       10.0|       12.0|
|1970-01-01T08:00:00.006+08:00|        6.0|        6.0|
+-----------------------------+-----------+-----------+
```
##### Query Example
Querying the timestamp corresponding to the maximum value:
```sql
IoTDB> select max_by(time, a), max_value(a) from root.test
+-------------------------+------------------------+
|max_by(Time, root.test.a)|  max_value(root.test.a)|
+-------------------------+------------------------+
|                        4|                    10.0|
+-------------------------+------------------------+
```

Finding the value of b when a is at its maximum:
```sql
IoTDB> select max_by(b, a) from root.test
+--------------------------------+
|max_by(root.test.b, root.test.a)|
+--------------------------------+
|                            10.0|
+--------------------------------+
```

Using with expressions:
```sql
IoTDB> select max_by(b + 1, a * 2) from root.test
+----------------------------------------+
|max_by(root.test.b + 1, root.test.a * 2)|
+----------------------------------------+
|                                    11.0|
+----------------------------------------+
```

Using with group by clause：
```sql
IoTDB> select max_by(b, a) from root.test group by ([0,7),4ms)
+-----------------------------+--------------------------------+
|                         Time|max_by(root.test.b, root.test.a)|
+-----------------------------+--------------------------------+
|1970-01-01T08:00:00.000+08:00|                             3.0|
+-----------------------------+--------------------------------+
|1970-01-01T08:00:00.004+08:00|                            10.0|
+-----------------------------+--------------------------------+
```

Using with having clause：
```sql
IoTDB> select max_by(b, a) from root.test group by ([0,7),4ms) having max_by(b, a) > 4.0
+-----------------------------+--------------------------------+
|                         Time|max_by(root.test.b, root.test.a)|
+-----------------------------+--------------------------------+
|1970-01-01T08:00:00.004+08:00|                            10.0|
+-----------------------------+--------------------------------+
```
Using with order by clause：
```sql
IoTDB> select max_by(b, a) from root.test group by ([0,7),4ms) order by time desc
+-----------------------------+--------------------------------+
|                         Time|max_by(root.test.b, root.test.a)|
+-----------------------------+--------------------------------+
|1970-01-01T08:00:00.004+08:00|                            10.0|
+-----------------------------+--------------------------------+
|1970-01-01T08:00:00.000+08:00|                             3.0|
+-----------------------------+--------------------------------+
```

### MIN_BY
#### Function Definition
min_by(x, y): Returns the value of x at the timestamp when y is at its minimum.
- min_by must have two input parameters x and y.
- The first input x can be the keyword time, with min_by(time, x) returning the timestamp when x is at its minimum value.
- If x is null at the timestamp corresponding to the minimum value of y, null is returned.
- If y reaches its minimum value at multiple timestamps, the x value corresponding to the smallest timestamp among those minimum values is returned.
- Consistent with IoTDB min_value, only INT32, INT64, FLOAT, DOUBLE are supported as inputs for y, while all six types are supported as inputs for x.
- Direct numerical values are not allowed as inputs for either x or y.

#### Grammar
```sql
select min_by(x, y) from root.sg
select min_by(time, x) from root.sg
```

#### Examples

##### Input Data
```sql
IoTDB> select * from root.test
+-----------------------------+-----------+-----------+
|                         Time|root.test.a|root.test.b|
+-----------------------------+-----------+-----------+
|1970-01-01T08:00:00.001+08:00|        4.0|       10.0|
|1970-01-01T08:00:00.002+08:00|        3.0|       10.0|
|1970-01-01T08:00:00.003+08:00|        2.0|        3.0|
|1970-01-01T08:00:00.004+08:00|        1.0|       10.0|
|1970-01-01T08:00:00.005+08:00|        1.0|       12.0|
|1970-01-01T08:00:00.006+08:00|        6.0|        6.0|
+-----------------------------+-----------+-----------+
```
##### Query Example
Querying the timestamp corresponding to the minimum value:
```sql
IoTDB> select min_by(time, a), min_value(a) from root.test
+-------------------------+------------------------+
|min_by(Time, root.test.a)|  min_value(root.test.a)|
+-------------------------+------------------------+
|                        4|                     1.0|
+-------------------------+------------------------+
```

Finding the value of b when a is at its minimum:
```sql
IoTDB> select min_by(b, a) from root.test
+--------------------------------+
|min_by(root.test.b, root.test.a)|
+--------------------------------+
|                            10.0|
+--------------------------------+
```

Using with expressions:
```sql
IoTDB> select min_by(b + 1, a * 2) from root.test
+----------------------------------------+
|min_by(root.test.b + 1, root.test.a * 2)|
+----------------------------------------+
|                                    11.0|
+----------------------------------------+
```

Using with group by clause：
```sql
IoTDB> select min_by(b, a) from root.test group by ([0,7),4ms)
+-----------------------------+--------------------------------+
|                         Time|min_by(root.test.b, root.test.a)|
+-----------------------------+--------------------------------+
|1970-01-01T08:00:00.000+08:00|                             3.0|
+-----------------------------+--------------------------------+
|1970-01-01T08:00:00.004+08:00|                            10.0|
+-----------------------------+--------------------------------+
```

Using with having clause：
```sql
IoTDB> select min_by(b, a) from root.test group by ([0,7),4ms) having max_by(b, a) > 4.0
+-----------------------------+--------------------------------+
|                         Time|min_by(root.test.b, root.test.a)|
+-----------------------------+--------------------------------+
|1970-01-01T08:00:00.004+08:00|                            10.0|
+-----------------------------+--------------------------------+
```
Using with order by clause：
```sql
IoTDB> select min_by(b, a) from root.test group by ([0,7),4ms) order by time desc
+-----------------------------+--------------------------------+
|                         Time|min_by(root.test.b, root.test.a)|
+-----------------------------+--------------------------------+
|1970-01-01T08:00:00.004+08:00|                            10.0|
+-----------------------------+--------------------------------+
|1970-01-01T08:00:00.000+08:00|                             3.0|
+-----------------------------+--------------------------------+
```