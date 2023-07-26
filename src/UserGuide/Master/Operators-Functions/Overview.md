<!--

​    Licensed to the Apache Software Foundation (ASF) under one
​    or more contributor license agreements.  See the NOTICE file
​    distributed with this work for additional information
​    regarding copyright ownership.  The ASF licenses this file
​    to you under the Apache License, Version 2.0 (the
​    "License"); you may not use this file except in compliance
​    with the License.  You may obtain a copy of the License at
​    
​        http://www.apache.org/licenses/LICENSE-2.0
​    
​    Unless required by applicable law or agreed to in writing,
​    software distributed under the License is distributed on an
​    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
​    KIND, either express or implied.  See the License for the
​    specific language governing permissions and limitations
​    under the License.

-->

# Overview

This chapter describes the operators and functions supported by IoTDB. IoTDB provides a wealth of built-in operators and functions to meet your computing needs, and supports extensions through the [User-Defined Function](./User-Defined-Function.md).

A list of all available functions, both built-in and custom, can be displayed with `SHOW FUNCTIONS` command.

See the documentation [Select-Expression](../Query-Data/Select-Expression.md) for the behavior of operators and functions in SQL.

## Operators

### Arithmetic Operators

| Operator | Meaning                   |
| -------- | ------------------------- |
| `+`      | positive (unary operator) |
| `-`      | negative (unary operator) |
| `*`      | multiplication            |
| `/`      | division                  |
| `%`      | modulo                    |
| `+`      | addition                  |
| `-`      | subtraction               |

For details and examples, see the document [Arithmetic Operators and Functions](./Mathematical.md).

### Comparison Operators

| Operator                  | Meaning                              |
| ------------------------- | ------------------------------------ |
| `>`                       | greater than                         |
| `>=`                      | greater than or equal to             |
| `<`                       | less than                            |
| `<=`                      | less than or equal to                |
| `==`                      | equal to                             |
| `!=` / `<>`               | not equal to                         |
| `BETWEEN ... AND ...`     | within the specified range           |
| `NOT BETWEEN ... AND ...` | not within the specified range       |
| `LIKE`                    | match simple pattern                 |
| `NOT LIKE`                | cannot match simple pattern          |
| `REGEXP`                  | match regular expression             |
| `NOT REGEXP`              | cannot match regular expression      |
| `IS NULL`                 | is null                              |
| `IS NOT NULL`             | is not null                          |
| `IN` / `CONTAINS`         | is a value in the specified list     |
| `NOT IN` / `NOT CONTAINS` | is not a value in the specified list |

For details and examples, see the document [Comparison Operators and Functions](./Comparison.md).

### Logical Operators

| Operator                    | Meaning                           |
| --------------------------- | --------------------------------- |
| `NOT` / `!`                 | logical negation (unary operator) |
| `AND` / `&` / `&&`          | logical AND                       |
| `OR`/ &#124; / &#124;&#124; | logical OR                        |

For details and examples, see the document [Logical Operators](./Logical.md).

### Operator Precedence

The precedence of operators is arranged as shown below from high to low, and operators on the same row have the same precedence.

```sql
!, - (unary operator), + (unary operator)
*, /, DIV, %, MOD
-, +
=, ==, <=>, >=, >, <=, <, <>, !=
LIKE, REGEXP, NOT LIKE, NOT REGEXP
BETWEEN ... AND ..., NOT BETWEEN ... AND ...
IS NULL, IS NOT NULL
IN, CONTAINS, NOT IN, NOT CONTAINS
AND, &, &&
OR, |, ||
```

## Built-in Functions

The built-in functions can be used in IoTDB without registration, and the functions in the data quality function library need to be registered by referring to the registration steps in the next chapter before they can be used.

### Aggregate Functions

| Function Name | Description                                                  | Allowed Input Series Data Types | Required Attributes                                          | Output Series Data Type             |
| ------------- | ------------------------------------------------------------ | ------------------------------- | ------------------------------------------------------------ | ----------------------------------- |
| SUM           | Summation.                                                   | INT32 INT64 FLOAT DOUBLE        | /                                                            | DOUBLE                              |
| COUNT         | Counts the number of data points.                            | All types                       | /                                                            | INT                                 |
| AVG           | Average.                                                     | INT32 INT64 FLOAT DOUBLE        | /                                                            | DOUBLE                              |
| EXTREME       | Finds the value with the largest absolute value. Returns a positive value if the maximum absolute value of positive and negative values is equal. | INT32 INT64 FLOAT DOUBLE        | /                                                            | Consistent with the input data type |
| MAX_VALUE     | Find the maximum value.                                      | INT32 INT64 FLOAT DOUBLE        | /                                                            | Consistent with the input data type |
| MIN_VALUE     | Find the minimum value.                                      | INT32 INT64 FLOAT DOUBLE        | /                                                            | Consistent with the input data type |
| FIRST_VALUE   | Find the value with the smallest timestamp.                  | All data types                  | /                                                            | Consistent with input data type     |
| LAST_VALUE    | Find the value with the largest timestamp.                   | All data types                  | /                                                            | Consistent with input data type     |
| MAX_TIME      | Find the maximum timestamp.                                  | All data Types                  | /                                                            | Timestamp                           |
| MIN_TIME      | Find the minimum timestamp.                                  | All data Types                  | /                                                            | Timestamp                           |
| COUNT_IF      | Find the number of data points that continuously meet a given condition and the number of data points that meet the condition (represented by keep) meet the specified threshold. | BOOLEAN                         | `[keep >=/>/=/!=/</<=]threshold`：The specified threshold or threshold condition, it is equivalent to `keep >= threshold` if `threshold` is used alone, type of `threshold` is `INT64` `ignoreNull`：Optional, default value is `true`；If the value is `true`, null values are ignored, it means that if there is a null value in the middle, the value is ignored without interrupting the continuity. If the value is `true`, null values are not ignored, it means that if there are null values in the middle, continuity will be broken | INT64                               |
| TIME_DURATION | Find the difference between the timestamp of the largest non-null value and the timestamp of the smallest non-null value in a column | All data Types                  | /                                                            | INT64                               |
| MODE          | Find the mode. Note:  1.Having too many different values in the input series risks a memory exception;  2.If all the elements have the same number of occurrences, that is no Mode, return the value with earliest time;  3.If there are many Modes, return the Mode with earliest time. | All data Types                  | /                                                            | Consistent with the input data type |

For details and examples, see the document [Aggregate Functions](./Aggregation.md).

### Arithmetic Functions

| Function Name | Allowed Input Series Data Types | Output Series Data Type       | Required Attributes                                          | Corresponding Implementation in the Java Standard Library    |
| ------------- | ------------------------------- | ----------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| SIN           | INT32 / INT64 / FLOAT / DOUBLE  | DOUBLE                        | /                                                            | Math#sin(double)                                             |
| COS           | INT32 / INT64 / FLOAT / DOUBLE  | DOUBLE                        | /                                                            | Math#cos(double)                                             |
| TAN           | INT32 / INT64 / FLOAT / DOUBLE  | DOUBLE                        | /                                                            | Math#tan(double)                                             |
| ASIN          | INT32 / INT64 / FLOAT / DOUBLE  | DOUBLE                        | /                                                            | Math#asin(double)                                            |
| ACOS          | INT32 / INT64 / FLOAT / DOUBLE  | DOUBLE                        | /                                                            | Math#acos(double)                                            |
| ATAN          | INT32 / INT64 / FLOAT / DOUBLE  | DOUBLE                        | /                                                            | Math#atan(double)                                            |
| SINH          | INT32 / INT64 / FLOAT / DOUBLE  | DOUBLE                        | /                                                            | Math#sinh(double)                                            |
| COSH          | INT32 / INT64 / FLOAT / DOUBLE  | DOUBLE                        | /                                                            | Math#cosh(double)                                            |
| TANH          | INT32 / INT64 / FLOAT / DOUBLE  | DOUBLE                        | /                                                            | Math#tanh(double)                                            |
| DEGREES       | INT32 / INT64 / FLOAT / DOUBLE  | DOUBLE                        | /                                                            | Math#toDegrees(double)                                       |
| RADIANS       | INT32 / INT64 / FLOAT / DOUBLE  | DOUBLE                        | /                                                            | Math#toRadians(double)                                       |
| ABS           | INT32 / INT64 / FLOAT / DOUBLE  | Same type as the input series | /                                                            | Math#abs(int) / Math#abs(long) /Math#abs(float) /Math#abs(double) |
| SIGN          | INT32 / INT64 / FLOAT / DOUBLE  | DOUBLE                        | /                                                            | Math#signum(double)                                          |
| CEIL          | INT32 / INT64 / FLOAT / DOUBLE  | DOUBLE                        | /                                                            | Math#ceil(double)                                            |
| FLOOR         | INT32 / INT64 / FLOAT / DOUBLE  | DOUBLE                        | /                                                            | Math#floor(double)                                           |
| ROUND         | INT32 / INT64 / FLOAT / DOUBLE  | DOUBLE                        | 'places' : Round the significant number, positive number is the significant number after the decimal point, negative number is the significant number of whole number | Math#rint(Math#pow(10,places))/Math#pow(10,places)           |
| EXP           | INT32 / INT64 / FLOAT / DOUBLE  | DOUBLE                        | /                                                            | Math#exp(double)                                             |
| LN            | INT32 / INT64 / FLOAT / DOUBLE  | DOUBLE                        | /                                                            | Math#log(double)                                             |
| LOG10         | INT32 / INT64 / FLOAT / DOUBLE  | DOUBLE                        | /                                                            | Math#log10(double)                                           |
| SQRT          | INT32 / INT64 / FLOAT / DOUBLE  | DOUBLE                        | /                                                            | Math#sqrt(double)                                            |

For details and examples, see the document [Arithmetic Operators and Functions](./Mathematical.md).

### Comparison Functions

| Function Name | Allowed Input Series Data Types | Required Attributes                       | Output Series Data Type | Description                                   |
| ------------- | ------------------------------- | ----------------------------------------- | ----------------------- | --------------------------------------------- |
| ON_OFF        | INT32 / INT64 / FLOAT / DOUBLE  | `threshold`: a double type variate        | BOOLEAN                 | Return `ts_value >= threshold`.               |
| IN_RANGR      | INT32 / INT64 / FLOAT / DOUBLE  | `lower`: DOUBLE type `upper`: DOUBLE type | BOOLEAN                 | Return `ts_value >= lower && value <= upper`. |

For details and examples, see the document [Comparison Operators and Functions](./Comparison.md).

### String Processing Functions

| Function Name   | Allowed Input Series Data Types | Required Attributes                                          | Output Series Data Type | Description                                                  |
| --------------- | ------------------------------- | ------------------------------------------------------------ | ----------------------- | ------------------------------------------------------------ |
| STRING_CONTAINS | TEXT                            | `s`: string to search for                                    | BOOLEAN                 | Checks whether the substring `s` exists in the string.       |
| STRING_MATCHES  | TEXT                            | `regex`: Java standard library-style regular expressions.    | BOOLEAN                 | Judges whether a string can be matched by the regular expression `regex`. |
| LENGTH          | TEXT                            | /                                                            | INT32                   | Get the length of input series.                              |
| LOCATE          | TEXT                            | `target`: The substring to be located.<br/> `reverse`: Indicates whether reverse locate is required. The default value is `false`, means left-to-right locate. | INT32                   | Get the position of the first occurrence of substring `target` in input series. Returns -1 if there are no `target` in input. |
| STARTSWITH      | TEXT                            | `target`: The prefix to be checked.                          | BOOLEAN                 | Check whether input series starts with the specified prefix `target`. |
| ENDSWITH        | TEXT                            | `target`: The suffix to be checked.                          | BOOLEAN                 | Check whether input series ends with the specified suffix `target`. |
| CONCAT          | TEXT                            | `targets`: a series of K-V, key needs to start with `target` and be not duplicated, value is the string you want to concat.<br/>`series_behind`: Indicates whether series behind targets. The default value is `false`. | TEXT                    | Concatenate input string and `target` string.                |
| SUBSTRING       | TEXT                            | `from`: Indicates the start position of substring.<br/>`for`: Indicates how many characters to stop after of substring. | TEXT                    | Extracts a substring of a string, starting with the first specified character and stopping after the specified number of characters.The index start at 1. |
| REPLACE         | TEXT                            | first parameter: The target substring to be replaced.<br />second parameter: The substring to replace with. | TEXT                    | Replace a substring in the input sequence with the target substring. |
| UPPER           | TEXT                            | /                                                            | TEXT                    | Get the string of input series with all characters changed to uppercase. |
| LOWER           | TEXT                            | /                                                            | TEXT                    | Get the string of input series with all characters changed to lowercase. |
| TRIM            | TEXT                            | /                                                            | TEXT                    | Get the string whose value is same to input series, with all leading and trailing space removed. |
| STRCMP          | TEXT                            | /                                                            | TEXT                    | Get the compare result of two input series. Returns `0` if series value are the same, a `negative integer` if value of series1 is smaller than series2, <br/>a `positive integer` if value of series1  is more than series2. |

For details and examples, see the document [String Processing](./String.md).

### Data Type Conversion Function

| Function Name | Required Attributes                                          | Output Series Data Type | Description                                                  |
| ------------- | ------------------------------------------------------------ | ----------------------- | ------------------------------------------------------------ |
| CAST          | `type`: Output data type, INT32 / INT64 / FLOAT / DOUBLE / BOOLEAN / TEXT | determined by `type`    | Convert the data to the type specified by the `type` parameter. |

For details and examples, see the document [Data Type Conversion Function](./Conversion.md).

### Constant Timeseries Generating Functions

| Function Name | Required Attributes                                          | Output Series Data Type                      | Description                                                  |
| ------------- | ------------------------------------------------------------ | -------------------------------------------- | ------------------------------------------------------------ |
| CONST         | `value`: the value of the output data point  `type`: the type of the output data point, it can only be INT32 / INT64 / FLOAT / DOUBLE / BOOLEAN / TEXT | Determined by the required attribute  `type` | Output the user-specified constant timeseries according to the  attributes `value` and `type`. |
| PI            | None                                                         | DOUBLE                                       | Data point value: a `double` value of  `π`, the ratio of the circumference of a circle to its diameter, which is equals to `Math.PI` in the *Java Standard Library*. |
| E             | None                                                         | DOUBLE                                       | Data point value: a `double` value of  `e`, the base of the natural logarithms, which is equals to `Math.E` in the *Java Standard Library*. |

For details and examples, see the document [Constant Timeseries Generating Functions](./Constant.md).

### Selector Functions

| Function Name | Allowed Input Series Data Types       | Required Attributes                                          | Output Series Data Type       | Description                                                  |
| ------------- | ------------------------------------- | ------------------------------------------------------------ | ----------------------------- | ------------------------------------------------------------ |
| TOP_K         | INT32 / INT64 / FLOAT / DOUBLE / TEXT | `k`: the maximum number of selected data points, must be greater than 0 and less than or equal to 1000 | Same type as the input series | Returns `k` data points with the largest values in a time series. |
| BOTTOM_K      | INT32 / INT64 / FLOAT / DOUBLE / TEXT | `k`: the maximum number of selected data points, must be greater than 0 and less than or equal to 1000 | Same type as the input series | Returns `k` data points with the smallest values in a time series. |

For details and examples, see the document [Selector Functions](./Selection.md).

### Continuous Interval Functions

| Function Name     | Allowed Input Series Data Types      | Required Attributes                                          | Output Series Data Type | Description                                                  |
| ----------------- | ------------------------------------ | ------------------------------------------------------------ | ----------------------- | ------------------------------------------------------------ |
| ZERO_DURATION     | INT32/ INT64/ FLOAT/ DOUBLE/ BOOLEAN | `min`:Optional with default value `0L` `max`:Optional with default value `Long.MAX_VALUE` | Long                    | Return intervals' start times and duration times in which the value is always 0(false), and the duration time `t` satisfy `t >= min && t <= max`. The unit of `t` is ms |
| NON_ZERO_DURATION | INT32/ INT64/ FLOAT/ DOUBLE/ BOOLEAN | `min`:Optional with default value `0L` `max`:Optional with default value `Long.MAX_VALUE` | Long                    | Return intervals' start times and duration times in which the value is always not 0, and the duration time `t` satisfy `t >= min && t <= max`. The unit of `t` is ms |
| ZERO_COUNT        | INT32/ INT64/ FLOAT/ DOUBLE/ BOOLEAN | `min`:Optional with default value `1L` `max`:Optional with default value `Long.MAX_VALUE` | Long                    | Return intervals' start times and the number of data points in the interval in which the value is always 0(false). Data points number `n` satisfy `n >= min && n <= max` |
| NON_ZERO_COUNT    | INT32/ INT64/ FLOAT/ DOUBLE/ BOOLEAN | `min`:Optional with default value `1L` `max`:Optional with default value `Long.MAX_VALUE` | Long                    | Return intervals' start times and the number of data points in the interval in which the value is always not 0(false). Data points number `n` satisfy `n >= min && n <= max` |

For details and examples, see the document [Continuous Interval Functions](./Continuous-Interval.md).

### Variation Trend Calculation Functions

| Function Name           | Allowed Input Series Data Types                 | Required Attributes                                          | Output Series Data Type       | Description                                                  |
| ----------------------- | ----------------------------------------------- | ------------------------------------------------------------ | ----------------------------- | ------------------------------------------------------------ |
| TIME_DIFFERENCE         | INT32 / INT64 / FLOAT / DOUBLE / BOOLEAN / TEXT | /                                                            | INT64                         | Calculates the difference between the time stamp of a data point and the time stamp of the previous data point. There is no corresponding output for the first data point. |
| DIFFERENCE              | INT32 / INT64 / FLOAT / DOUBLE                  | /                                                            | Same type as the input series | Calculates the difference between the value of a data point and the value of the previous data point. There is no corresponding output for the first data point. |
| NON_NEGATIVE_DIFFERENCE | INT32 / INT64 / FLOAT / DOUBLE                  | /                                                            | Same type as the input series | Calculates the absolute value of the difference between the value of a data point and the value of the previous data point. There is no corresponding output for the first data point. |
| DERIVATIVE              | INT32 / INT64 / FLOAT / DOUBLE                  | /                                                            | DOUBLE                        | Calculates the rate of change of a data point compared to the previous data point, the result is equals to DIFFERENCE / TIME_DIFFERENCE. There is no corresponding output for the first data point. |
| NON_NEGATIVE_DERIVATIVE | INT32 / INT64 / FLOAT / DOUBLE                  | /                                                            | DOUBLE                        | Calculates the absolute value of the rate of change of a data point compared to the previous data point, the result is equals to NON_NEGATIVE_DIFFERENCE / TIME_DIFFERENCE. There is no corresponding output for the first data point. |
| DIFF                    | INT32 / INT64 / FLOAT / DOUBLE                  | `ignoreNull`：optional，default is true. If is true, the previous data point is ignored when it is null and continues to find the first non-null value forwardly. If the value is false, previous data point is not ignored when it is null, the result is also null because null is used for subtraction | DOUBLE                        | Calculates the difference between the value of a data point and the value of the previous data point. There is no corresponding output for the first data point, so output is null |

For details and examples, see the document [Variation Trend Calculation Functions](./Variation-Trend.md).

### Sample Functions

| Function Name                    | Allowed Input Series Data Types | Required Attributes                                          | Output Series Data Type        | Description                                                  |
| -------------------------------- | ------------------------------- | ------------------------------------------------------------ | ------------------------------ | ------------------------------------------------------------ |
| EQUAL_SIZE_BUCKET_RANDOM_SAMPLE  | INT32 / INT64 / FLOAT / DOUBLE  | `proportion` The value range is `(0, 1]`, the default is `0.1` | INT32 / INT64 / FLOAT / DOUBLE | Returns a random sample of equal buckets that matches the sampling ratio |
| EQUAL_SIZE_BUCKET_AGG_SAMPLE     | INT32 / INT64 / FLOAT / DOUBLE  | `proportion` The value range is `(0, 1]`, the default is `0.1`<br>`type`: The value types are `avg`, `max`, `min`, `sum`, `extreme`, `variance`, the default is `avg` | INT32 / INT64 / FLOAT / DOUBLE | Returns equal bucket aggregation samples that match the sampling ratio |
| EQUAL_SIZE_BUCKET_M4_SAMPLE      | INT32 / INT64 / FLOAT / DOUBLE  | `proportion` The value range is `(0, 1]`, the default is `0.1` | INT32 / INT64 / FLOAT / DOUBLE | Returns equal bucket M4 samples that match the sampling ratio |
| EQUAL_SIZE_BUCKET_OUTLIER_SAMPLE | INT32 / INT64 / FLOAT / DOUBLE  | The value range of `proportion` is `(0, 1]`, the default is `0.1`<br> The value of `type` is `avg` or `stendis` or `cos` or `prenextdis`, the default is `avg` <br>The value of `number` should be greater than 0, the default is `3` | INT32 / INT64 / FLOAT / DOUBLE | Returns outlier samples in equal buckets that match the sampling ratio and the number of samples in the bucket |
| M4                               | INT32 / INT64 / FLOAT / DOUBLE  | Different attributes used by the size window and the time window. The size window uses attributes `windowSize` and `slidingStep`. The time window uses attributes `timeInterval`, `slidingStep`, `displayWindowBegin`, and `displayWindowEnd`. More details see below. | INT32 / INT64 / FLOAT / DOUBLE | Returns the `first, last, bottom, top` points in each sliding window. M4 sorts and deduplicates the aggregated points within the window before outputting them. |

For details and examples, see the document [Sample Functions](./Sample.md).

## Data Quality Function Library

### About

For applications based on time series data, data quality is vital. **UDF Library** is IoTDB User Defined Functions (UDF) about data quality, including data profiling, data quality evalution and data repairing. It effectively meets the demand for data quality in the industrial field.

### Quick Start

The functions in this function library are not built-in functions, and must be loaded into the system before use.

1. [Download](https://archive.apache.org/dist/iotdb/1.0.1/apache-iotdb-1.0.1-library-udf-bin.zip) the JAR with all dependencies and the script of registering UDF.
2. Copy the JAR package to `ext\udf` under the directory of IoTDB system (Please put JAR to this directory of all DataNodes if you use Cluster).
3. Run `sbin\start-server.bat` (for Windows) or `sbin\start-server.sh` (for Linux or MacOS) to start IoTDB server.
4. Copy the script to the directory of IoTDB system (under the root directory, at the same level as `sbin`), modify the parameters in the script if needed and run it to register UDF.

