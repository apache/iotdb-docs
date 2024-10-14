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

# Operator and Expression

This chapter describes the operators and functions supported by IoTDB. IoTDB provides a wealth of built-in operators and functions to meet your computing needs, and supports extensions through the [User-Defined Function](../Reference/UDF-Libraries.md).

A list of all available functions, both built-in and custom, can be displayed with `SHOW FUNCTIONS` command.

See the documentation [Select-Expression](../Reference/Function-and-Expression.md#selector-functions) for the behavior of operators and functions in SQL.

## OPERATORS

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

For details and examples, see the document [Arithmetic Operators and Functions](../Reference/Function-and-Expression.md#arithmetic-functions).

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

For details and examples, see the document [Comparison Operators and Functions](../Reference/Function-and-Expression.md#comparison-operators-and-functions).

### Logical Operators

| Operator                    | Meaning                           |
| --------------------------- | --------------------------------- |
| `NOT` / `!`                 | logical negation (unary operator) |
| `AND` / `&` / `&&`          | logical AND                       |
| `OR`/ &#124; / &#124;&#124; | logical OR                        |

For details and examples, see the document [Logical Operators](../Reference/Function-and-Expression.md#logical-operators).

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

## BUILT-IN FUNCTIONS

The built-in functions can be used in IoTDB without registration, and the functions in the data quality function library need to be registered by referring to the registration steps in the next chapter before they can be used.

### Aggregate Functions

| Function Name | Description                                                  | Allowed Input Series Data Types | Required Attributes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Output Series Data Type                             |
| ------------- | ------------------------------------------------------------ | ------------------------------- |--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------|
| SUM           | Summation.                                                   | INT32 INT64 FLOAT DOUBLE        | /                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | DOUBLE                                              |
| COUNT         | Counts the number of data points.                            | All types                       | /                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | INT                                                 |
| AVG           | Average.                                                     | INT32 INT64 FLOAT DOUBLE        | /                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | DOUBLE                                              |
| EXTREME       | Finds the value with the largest absolute value. Returns a positive value if the maximum absolute value of positive and negative values is equal. | INT32 INT64 FLOAT DOUBLE        | /                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Consistent with the input data type                 |
| MAX_VALUE     | Find the maximum value.                                      | INT32 INT64 FLOAT DOUBLE        | /                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Consistent with the input data type                 |
| MIN_VALUE     | Find the minimum value.                                      | INT32 INT64 FLOAT DOUBLE        | /                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Consistent with the input data type                 |
| FIRST_VALUE   | Find the value with the smallest timestamp.                  | All data types                  | /                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Consistent with input data type                     |
| LAST_VALUE    | Find the value with the largest timestamp.                   | All data types                  | /                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Consistent with input data type                     |
| MAX_TIME      | Find the maximum timestamp.                                  | All data Types                  | /                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Timestamp                                           |
| MIN_TIME      | Find the minimum timestamp.                                  | All data Types                  | /                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Timestamp                                           |
| COUNT_IF      | Find the number of data points that continuously meet a given condition and the number of data points that meet the condition (represented by keep) meet the specified threshold. | BOOLEAN                         | `[keep >=/>/=/!=/</<=]threshold`：The specified threshold or threshold condition, it is equivalent to `keep >= threshold` if `threshold` is used alone, type of `threshold` is `INT64` `ignoreNull`：Optional, default value is `true`；If the value is `true`, null values are ignored, it means that if there is a null value in the middle, the value is ignored without interrupting the continuity. If the value is `true`, null values are not ignored, it means that if there are null values in the middle, continuity will be broken | INT64                                               |
| TIME_DURATION | Find the difference between the timestamp of the largest non-null value and the timestamp of the smallest non-null value in a column | All data Types                  | /                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | INT64                                               |
| MODE          | Find the mode. Note:  1.Having too many different values in the input series risks a memory exception;  2.If all the elements have the same number of occurrences, that is no Mode, return the value with earliest time;  3.If there are many Modes, return the Mode with earliest time. | All data Types                  | /                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Consistent with the input data type                 |
| MAX_BY        | MAX_BY(x, y) returns the value of x corresponding to the maximum value of the input y. MAX_BY(time, x) returns the timestamp when x is at its maximum value.                                                                                                                             | The first input x can be of any type, while the second input y must be of type INT32, INT64, FLOAT, or DOUBLE. | /                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Consistent with the data type of the first input x. |
| MIN_BY        | MIN_BY(x, y) returns the value of x corresponding to the minimum value of the input y. MIN_BY(time, x) returns the timestamp when x is at its minimum value.                                                                                                                             | The first input x can be of any type, while the second input y must be of type INT32, INT64, FLOAT, or DOUBLE. | /                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Consistent with the data type of the first input x. |

For details and examples, see the document [Aggregate Functions](../Reference/Function-and-Expression.md#aggregate-functions).

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

For details and examples, see the document [Arithmetic Operators and Functions](../Reference/Function-and-Expression.md#arithmetic-operators-and-functions).

### Comparison Functions

| Function Name | Allowed Input Series Data Types | Required Attributes                       | Output Series Data Type | Description                                   |
| ------------- | ------------------------------- | ----------------------------------------- | ----------------------- | --------------------------------------------- |
| ON_OFF        | INT32 / INT64 / FLOAT / DOUBLE  | `threshold`: a double type variate        | BOOLEAN                 | Return `ts_value >= threshold`.               |
| IN_RANGR      | INT32 / INT64 / FLOAT / DOUBLE  | `lower`: DOUBLE type `upper`: DOUBLE type | BOOLEAN                 | Return `ts_value >= lower && value <= upper`. |

For details and examples, see the document [Comparison Operators and Functions](../Reference/Function-and-Expression.md#comparison-operators-and-functions).

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


For details and examples, see the document [String Processing](../Reference/Function-and-Expression.md#string-processing).

### Data Type Conversion Function

| Function Name | Required Attributes                                          | Output Series Data Type | Description                                                  |
| ------------- | ------------------------------------------------------------ | ----------------------- | ------------------------------------------------------------ |
| CAST          | `type`: Output data type, INT32 / INT64 / FLOAT / DOUBLE / BOOLEAN / TEXT | determined by `type`    | Convert the data to the type specified by the `type` parameter. |

For details and examples, see the document [Data Type Conversion Function](../Reference/Function-and-Expression.md#data-type-conversion-function).

### Constant Timeseries Generating Functions

| Function Name | Required Attributes                                          | Output Series Data Type                      | Description                                                  |
| ------------- | ------------------------------------------------------------ | -------------------------------------------- | ------------------------------------------------------------ |
| CONST         | `value`: the value of the output data point  `type`: the type of the output data point, it can only be INT32 / INT64 / FLOAT / DOUBLE / BOOLEAN / TEXT | Determined by the required attribute  `type` | Output the user-specified constant timeseries according to the  attributes `value` and `type`. |
| PI            | None                                                         | DOUBLE                                       | Data point value: a `double` value of  `π`, the ratio of the circumference of a circle to its diameter, which is equals to `Math.PI` in the *Java Standard Library*. |
| E             | None                                                         | DOUBLE                                       | Data point value: a `double` value of  `e`, the base of the natural logarithms, which is equals to `Math.E` in the *Java Standard Library*. |

For details and examples, see the document [Constant Timeseries Generating Functions](../Reference/Function-and-Expression.md#constant-timeseries-generating-functions).

### Selector Functions

| Function Name | Allowed Input Series Data Types       | Required Attributes                                          | Output Series Data Type       | Description                                                  |
| ------------- | ------------------------------------- | ------------------------------------------------------------ | ----------------------------- | ------------------------------------------------------------ |
| TOP_K         | INT32 / INT64 / FLOAT / DOUBLE / TEXT | `k`: the maximum number of selected data points, must be greater than 0 and less than or equal to 1000 | Same type as the input series | Returns `k` data points with the largest values in a time series. |
| BOTTOM_K      | INT32 / INT64 / FLOAT / DOUBLE / TEXT | `k`: the maximum number of selected data points, must be greater than 0 and less than or equal to 1000 | Same type as the input series | Returns `k` data points with the smallest values in a time series. |

For details and examples, see the document [Selector Functions](../Reference/Function-and-Expression.md#selector-functions).

### Continuous Interval Functions

| Function Name     | Allowed Input Series Data Types      | Required Attributes                                          | Output Series Data Type | Description                                                  |
| ----------------- | ------------------------------------ | ------------------------------------------------------------ | ----------------------- | ------------------------------------------------------------ |
| ZERO_DURATION     | INT32/ INT64/ FLOAT/ DOUBLE/ BOOLEAN | `min`:Optional with default value `0L` `max`:Optional with default value `Long.MAX_VALUE` | Long                    | Return intervals' start times and duration times in which the value is always 0(false), and the duration time `t` satisfy `t >= min && t <= max`. The unit of `t` is ms |
| NON_ZERO_DURATION | INT32/ INT64/ FLOAT/ DOUBLE/ BOOLEAN | `min`:Optional with default value `0L` `max`:Optional with default value `Long.MAX_VALUE` | Long                    | Return intervals' start times and duration times in which the value is always not 0, and the duration time `t` satisfy `t >= min && t <= max`. The unit of `t` is ms |
| ZERO_COUNT        | INT32/ INT64/ FLOAT/ DOUBLE/ BOOLEAN | `min`:Optional with default value `1L` `max`:Optional with default value `Long.MAX_VALUE` | Long                    | Return intervals' start times and the number of data points in the interval in which the value is always 0(false). Data points number `n` satisfy `n >= min && n <= max` |
| NON_ZERO_COUNT    | INT32/ INT64/ FLOAT/ DOUBLE/ BOOLEAN | `min`:Optional with default value `1L` `max`:Optional with default value `Long.MAX_VALUE` | Long                    | Return intervals' start times and the number of data points in the interval in which the value is always not 0(false). Data points number `n` satisfy `n >= min && n <= max` |

For details and examples, see the document [Continuous Interval Functions](../Reference/Function-and-Expression.md#continuous-interval-functions).

### Variation Trend Calculation Functions

| Function Name           | Allowed Input Series Data Types                 | Required Attributes                                          | Output Series Data Type       | Description                                                  |
| ----------------------- | ----------------------------------------------- | ------------------------------------------------------------ | ----------------------------- | ------------------------------------------------------------ |
| TIME_DIFFERENCE         | INT32 / INT64 / FLOAT / DOUBLE / BOOLEAN / TEXT | /                                                            | INT64                         | Calculates the difference between the time stamp of a data point and the time stamp of the previous data point. There is no corresponding output for the first data point. |
| DIFFERENCE              | INT32 / INT64 / FLOAT / DOUBLE                  | /                                                            | Same type as the input series | Calculates the difference between the value of a data point and the value of the previous data point. There is no corresponding output for the first data point. |
| NON_NEGATIVE_DIFFERENCE | INT32 / INT64 / FLOAT / DOUBLE                  | /                                                            | Same type as the input series | Calculates the absolute value of the difference between the value of a data point and the value of the previous data point. There is no corresponding output for the first data point. |
| DERIVATIVE              | INT32 / INT64 / FLOAT / DOUBLE                  | /                                                            | DOUBLE                        | Calculates the rate of change of a data point compared to the previous data point, the result is equals to DIFFERENCE / TIME_DIFFERENCE. There is no corresponding output for the first data point. |
| NON_NEGATIVE_DERIVATIVE | INT32 / INT64 / FLOAT / DOUBLE                  | /                                                            | DOUBLE                        | Calculates the absolute value of the rate of change of a data point compared to the previous data point, the result is equals to NON_NEGATIVE_DIFFERENCE / TIME_DIFFERENCE. There is no corresponding output for the first data point. |
| DIFF                    | INT32 / INT64 / FLOAT / DOUBLE                  | `ignoreNull`：optional，default is true. If is true, the previous data point is ignored when it is null and continues to find the first non-null value forwardly. If the value is false, previous data point is not ignored when it is null, the result is also null because null is used for subtraction | DOUBLE                        | Calculates the difference between the value of a data point and the value of the previous data point. There is no corresponding output for the first data point, so output is null |

For details and examples, see the document [Variation Trend Calculation Functions](../Reference/Function-and-Expression.md#variation-trend-calculation-functions).

### Sample Functions

| Function Name                    | Allowed Input Series Data Types | Required Attributes                                          | Output Series Data Type        | Description                                                  |
| -------------------------------- | ------------------------------- | ------------------------------------------------------------ | ------------------------------ | ------------------------------------------------------------ |
| EQUAL_SIZE_BUCKET_RANDOM_SAMPLE  | INT32 / INT64 / FLOAT / DOUBLE  | `proportion` The value range is `(0, 1]`, the default is `0.1` | INT32 / INT64 / FLOAT / DOUBLE | Returns a random sample of equal buckets that matches the sampling ratio |
| EQUAL_SIZE_BUCKET_AGG_SAMPLE     | INT32 / INT64 / FLOAT / DOUBLE  | `proportion` The value range is `(0, 1]`, the default is `0.1`<br>`type`: The value types are `avg`, `max`, `min`, `sum`, `extreme`, `variance`, the default is `avg` | INT32 / INT64 / FLOAT / DOUBLE | Returns equal bucket aggregation samples that match the sampling ratio |
| EQUAL_SIZE_BUCKET_M4_SAMPLE      | INT32 / INT64 / FLOAT / DOUBLE  | `proportion` The value range is `(0, 1]`, the default is `0.1` | INT32 / INT64 / FLOAT / DOUBLE | Returns equal bucket M4 samples that match the sampling ratio |
| EQUAL_SIZE_BUCKET_OUTLIER_SAMPLE | INT32 / INT64 / FLOAT / DOUBLE  | The value range of `proportion` is `(0, 1]`, the default is `0.1`<br> The value of `type` is `avg` or `stendis` or `cos` or `prenextdis`, the default is `avg` <br>The value of `number` should be greater than 0, the default is `3` | INT32 / INT64 / FLOAT / DOUBLE | Returns outlier samples in equal buckets that match the sampling ratio and the number of samples in the bucket |
| M4                               | INT32 / INT64 / FLOAT / DOUBLE  | Different attributes used by the size window and the time window. The size window uses attributes `windowSize` and `slidingStep`. The time window uses attributes `timeInterval`, `slidingStep`, `displayWindowBegin`, and `displayWindowEnd`. More details see below. | INT32 / INT64 / FLOAT / DOUBLE | Returns the `first, last, bottom, top` points in each sliding window. M4 sorts and deduplicates the aggregated points within the window before outputting them. |

For details and examples, see the document [Sample Functions](../Reference/Function-and-Expression.md#sample-functions).

### Change Points Function

| Function Name | Allowed Input Series Data Types | Required Attributes | Output Series Data Type       | Description                                                 |
| ------------- | ------------------------------- | ------------------- | ----------------------------- | ----------------------------------------------------------- |
| CHANGE_POINTS | INT32 / INT64 / FLOAT / DOUBLE  | /                   | Same type as the input series | Remove consecutive identical values from an input sequence. |

For details and examples, see the document [Time-Series](../Reference/Function-and-Expression.md#time-series-processing).

## DATA QUALITY FUNCTION LIBRARY

### About

For applications based on time series data, data quality is vital. **UDF Library** is IoTDB User Defined Functions (UDF) about data quality, including data profiling, data quality evalution and data repairing. It effectively meets the demand for data quality in the industrial field.

### Quick Start

The functions in this function library are not built-in functions, and must be loaded into the system before use.

1. [Download](https://archive.apache.org/dist/iotdb/1.0.1/apache-iotdb-1.0.1-library-udf-bin.zip) the JAR with all dependencies and the script of registering UDF.
2. Copy the JAR package to `ext\udf` under the directory of IoTDB system (Please put JAR to this directory of all DataNodes if you use Cluster).
3. Run `sbin\start-confignode.bat` and then `sbin\start-datanode.bat` (for Windows) or `sbin\start-confignode.sh` and `sbin\start-datanode.sh` (for Linux or MacOS) to start IoTDB server.
4. Copy the script to the directory of IoTDB system (under the root directory, at the same level as `sbin`), modify the parameters in the script if needed and run it to register UDF.

### Implemented Functions

1.   Data Quality related functions, such as `Completeness`. For details and examples, see the document [Data-Quality](../Reference/UDF-Libraries.md#data-quality).
2.   Data Profiling related functions, such as `ACF`. For details and examples, see the document [Data-Profiling](../Reference/UDF-Libraries.md#data-profiling).
3.   Anomaly Detection related functions, such as `IQR`. For details and examples, see the document [Anomaly-Detection](../Reference/UDF-Libraries.md#anomaly-detection).
4.   Frequency Domain Analysis related functions, such as `Conv`. For details and examples, see the document [Frequency-Domain](../Reference/UDF-Libraries.md#frequency-domain-analysis).
5.   Data Matching related functions, such as `DTW`. For details and examples, see the document [Data-Matching](../Reference/UDF-Libraries.md#data-matching).
6.   Data Repairing related functions, such as `TimestampRepair`. For details and examples, see the document [Data-Repairing](../Reference/UDF-Libraries.md#timestamprepair).
7.   Series Discovery related functions, such as `ConsecutiveSequences`. For details and examples, see the document [Series-Discovery](../Reference/UDF-Libraries.md).
8.   Machine Learning related functions, such as `AR`. For details and examples, see the document [Machine-Learning](../Reference/UDF-Libraries.md#machine-learning).

## LAMBDA EXPRESSION

| Function Name | Allowed Input Series Data Types                 | Required Attributes                                          | Output Series Data Type                         | Series Data Type  Description                                |
| ------------- | ----------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------- | ------------------------------------------------------------ |
| JEXL          | INT32 / INT64 / FLOAT / DOUBLE / TEXT / BOOLEAN | `expr` is a lambda expression that supports standard one or multi arguments in the form `x -> {...}` or `(x, y, z) -> {...}`, e.g. `x -> {x * 2}`, `(x, y, z) -> {x + y * z}` | INT32 / INT64 / FLOAT / DOUBLE / TEXT / BOOLEAN | Returns the input time series transformed by a lambda expression |

For details and examples, see the document [Lambda](../Reference/Function-and-Expression.md#lambda-expression).

## CONDITIONAL EXPRESSION

| Expression Name | Description          |
| --------------- | -------------------- |
| `CASE`          | similar to "if else" |

For details and examples, see the document [Conditional Expressions](../Reference/Function-and-Expression.md#conditional-expressions).

## SELECT EXPRESSION

The `SELECT` clause specifies the output of the query, consisting of several `selectExpr`. Each `selectExpr` defines one or more columns in the query result.

**`selectExpr` is an expression consisting of time series path suffixes, constants, functions, and operators. That is, `selectExpr` can contain: **

- Time series path suffix (wildcards are supported)
- operator
    - Arithmetic operators
    - comparison operators
    - Logical Operators
- function
    - aggregate functions
    - Time series generation functions (including built-in functions and user-defined functions)
- constant

### Use Alias

Since the unique data model of IoTDB, lots of additional information like device will be carried before each sensor. Sometimes, we want to query just one specific device, then these prefix information show frequently will be redundant in this situation, influencing the analysis of result set. At this time, we can use `AS` function provided by IoTDB, assign an alias to time series selected in query.  

For example：

```sql
select s1 as temperature, s2 as speed from root.ln.wf01.wt01;
```

The result set is：

| Time | temperature | speed |
| ---- | ----------- | ----- |
| ...  | ...         | ...   |


### Operator

See this documentation for a list of operators supported in IoTDB.

### Function

#### Aggregate Functions

Aggregate functions are many-to-one functions. They perform aggregate calculations on a set of values, resulting in a single aggregated result.

**A query that contains an aggregate function is called an aggregate query**, otherwise, it is called a time series query.

> Please note that mixed use of `Aggregate Query` and `Timeseries Query` is not allowed. Below are examples for queries that are not allowed.
>
> ```
> select a, count(a) from root.sg 
> select sin(a), count(a) from root.sg
> select a, count(a) from root.sg group by ([10,100),10ms)
> ```

For the aggregation functions supported by IoTDB, see the document [Aggregate Functions](../Reference/Function-and-Expression.md#aggregate-functions).


#### Time Series Generation Function

A time series generation function takes several raw time series as input and produces a list of time series as output. Unlike aggregate functions, time series generators have a timestamp column in their result sets.

All time series generation functions accept * as input, and all can be mixed with raw time series queries.

##### Built-in Time Series Generation Functions

See this documentation for a list of built-in functions supported in IoTDB.

##### User-Defined Time Series Generation Functions

IoTDB supports function extension through User Defined Function (click for [User-Defined Function](./Database-Programming.md#udtfuser-defined-timeseries-generating-function)) capability.

### Nested Expressions

IoTDB supports the calculation of arbitrary nested expressions. Since time series query and aggregation query can not be used in a query statement at the same time, we divide nested expressions into two types, which are nested expressions with time series query and nested expressions with aggregation query. 

The following is the syntax definition of the `select` clause:

```sql
selectClause
    : SELECT resultColumn (',' resultColumn)*
    ;

resultColumn
    : expression (AS ID)?
    ;

expression
    : '(' expression ')'
    | '-' expression
    | expression ('*' | '/' | '%') expression
    | expression ('+' | '-') expression
    | functionName '(' expression (',' expression)* functionAttribute* ')'
    | timeSeriesSuffixPath
    | number
    ;
```

#### Nested Expressions with Time Series Query

IoTDB supports the calculation of arbitrary nested expressions consisting of **numbers, time series, time series generating functions (including user-defined functions) and arithmetic expressions** in the `select` clause.

##### Example

Input1：

```sql
select a,
       b,
       ((a + 1) * 2 - 1) % 2 + 1.5,
       sin(a + sin(a + sin(b))),
       -(a + b) * (sin(a + b) * sin(a + b) + cos(a + b) * cos(a + b)) + 1
from root.sg1;
```

Result1：

```
+-----------------------------+----------+----------+----------------------------------------+---------------------------------------------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------+
|                         Time|root.sg1.a|root.sg1.b|((((root.sg1.a + 1) * 2) - 1) % 2) + 1.5|sin(root.sg1.a + sin(root.sg1.a + sin(root.sg1.b)))|(-root.sg1.a + root.sg1.b * ((sin(root.sg1.a + root.sg1.b) * sin(root.sg1.a + root.sg1.b)) + (cos(root.sg1.a + root.sg1.b) * cos(root.sg1.a + root.sg1.b)))) + 1|
+-----------------------------+----------+----------+----------------------------------------+---------------------------------------------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------+
|1970-01-01T08:00:00.010+08:00|         1|         1|                                     2.5|                                 0.9238430524420609|                                                                                                                      -1.0|
|1970-01-01T08:00:00.020+08:00|         2|         2|                                     2.5|                                 0.7903505371876317|                                                                                                                      -3.0|
|1970-01-01T08:00:00.030+08:00|         3|         3|                                     2.5|                                0.14065207680386618|                                                                                                                      -5.0|
|1970-01-01T08:00:00.040+08:00|         4|      null|                                     2.5|                                               null|                                                                                                                      null|
|1970-01-01T08:00:00.050+08:00|      null|         5|                                    null|                                               null|                                                                                                                      null|
|1970-01-01T08:00:00.060+08:00|         6|         6|                                     2.5|                                -0.7288037411970916|                                                                                                                     -11.0|
+-----------------------------+----------+----------+----------------------------------------+---------------------------------------------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------+
Total line number = 6
It costs 0.048s
```

Input2：

```sql
select (a + b) * 2 + sin(a) from root.sg
```

Result2：

```
+-----------------------------+----------------------------------------------+
|                         Time|((root.sg.a + root.sg.b) * 2) + sin(root.sg.a)|
+-----------------------------+----------------------------------------------+
|1970-01-01T08:00:00.010+08:00|                             59.45597888911063|
|1970-01-01T08:00:00.020+08:00|                            100.91294525072763|
|1970-01-01T08:00:00.030+08:00|                            139.01196837590714|
|1970-01-01T08:00:00.040+08:00|                            180.74511316047935|
|1970-01-01T08:00:00.050+08:00|                            219.73762514629607|
|1970-01-01T08:00:00.060+08:00|                             259.6951893788978|
|1970-01-01T08:00:00.070+08:00|                             300.7738906815579|
|1970-01-01T08:00:00.090+08:00|                             39.45597888911063|
|1970-01-01T08:00:00.100+08:00|                             39.45597888911063|
+-----------------------------+----------------------------------------------+
Total line number = 9
It costs 0.011s
```

Input3：

```sql
select (a + *) / 2  from root.sg1
```

Result3：

```
+-----------------------------+-----------------------------+-----------------------------+
|                         Time|(root.sg1.a + root.sg1.a) / 2|(root.sg1.a + root.sg1.b) / 2|
+-----------------------------+-----------------------------+-----------------------------+
|1970-01-01T08:00:00.010+08:00|                          1.0|                          1.0|
|1970-01-01T08:00:00.020+08:00|                          2.0|                          2.0|
|1970-01-01T08:00:00.030+08:00|                          3.0|                          3.0|
|1970-01-01T08:00:00.040+08:00|                          4.0|                         null|
|1970-01-01T08:00:00.060+08:00|                          6.0|                          6.0|
+-----------------------------+-----------------------------+-----------------------------+
Total line number = 5
It costs 0.011s
```

Input4：

```sql
select (a + b) * 3 from root.sg, root.ln
```

Result4：

```
+-----------------------------+---------------------------+---------------------------+---------------------------+---------------------------+
|                         Time|(root.sg.a + root.sg.b) * 3|(root.sg.a + root.ln.b) * 3|(root.ln.a + root.sg.b) * 3|(root.ln.a + root.ln.b) * 3|
+-----------------------------+---------------------------+---------------------------+---------------------------+---------------------------+
|1970-01-01T08:00:00.010+08:00|                       90.0|                      270.0|                      360.0|                      540.0|
|1970-01-01T08:00:00.020+08:00|                      150.0|                      330.0|                      690.0|                      870.0|
|1970-01-01T08:00:00.030+08:00|                      210.0|                      450.0|                      570.0|                      810.0|
|1970-01-01T08:00:00.040+08:00|                      270.0|                      240.0|                      690.0|                      660.0|
|1970-01-01T08:00:00.050+08:00|                      330.0|                       null|                       null|                       null|
|1970-01-01T08:00:00.060+08:00|                      390.0|                       null|                       null|                       null|
|1970-01-01T08:00:00.070+08:00|                      450.0|                       null|                       null|                       null|
|1970-01-01T08:00:00.090+08:00|                       60.0|                       null|                       null|                       null|
|1970-01-01T08:00:00.100+08:00|                       60.0|                       null|                       null|                       null|
+-----------------------------+---------------------------+---------------------------+---------------------------+---------------------------+
Total line number = 9
It costs 0.014s
```

##### Explanation

- Only when the left operand and the right operand under a certain timestamp are not `null`, the nested expressions will have an output value. Otherwise this row will not be included in the result. 
    - In Result1 of the Example part, the value of time series `root.sg.a` at time 40 is 4, while the value of time series `root.sg.b` is `null`. So at time 40, the value of nested expressions `(a + b) * 2 + sin(a)` is `null`. So in Result2, this row is not included in the result.
- If one operand in the nested expressions can be translated into multiple time series (For example, `*`), the result of each time series will be included in the result (Cartesian product). Please refer to Input3, Input4 and corresponding Result3 and Result4 in Example.

##### Note

> Please note that Aligned Time Series has not been supported in Nested Expressions with Time Series Query yet. An error message is expected if you use it with Aligned Time Series selected in a query statement.

#### Nested Expressions Query with Aggregations

IoTDB supports the calculation of arbitrary nested expressions consisting of **numbers, aggregations and arithmetic expressions** in the `select` clause.

##### Example

Aggregation query without `GROUP BY`.

Input1:

```sql
select avg(temperature),
       sin(avg(temperature)),
       avg(temperature) + 1,
       -sum(hardware),
       avg(temperature) + sum(hardware)
from root.ln.wf01.wt01;
```

Result1:

```
+----------------------------------+---------------------------------------+--------------------------------------+--------------------------------+--------------------------------------------------------------------+
|avg(root.ln.wf01.wt01.temperature)|sin(avg(root.ln.wf01.wt01.temperature))|avg(root.ln.wf01.wt01.temperature) + 1|-sum(root.ln.wf01.wt01.hardware)|avg(root.ln.wf01.wt01.temperature) + sum(root.ln.wf01.wt01.hardware)|
+----------------------------------+---------------------------------------+--------------------------------------+--------------------------------+--------------------------------------------------------------------+
|                15.927999999999999|                   -0.21826546964855045|                    16.927999999999997|                         -7426.0|                                                            7441.928|
+----------------------------------+---------------------------------------+--------------------------------------+--------------------------------+--------------------------------------------------------------------+
Total line number = 1
It costs 0.009s
```

Input2:

```sql
select avg(*), 
	   (avg(*) + 1) * 3 / 2 -1 
from root.sg1
```

Result2:

```
+---------------+---------------+-------------------------------------+-------------------------------------+
|avg(root.sg1.a)|avg(root.sg1.b)|(avg(root.sg1.a) + 1) * 3 / 2 - 1    |(avg(root.sg1.b) + 1) * 3 / 2 - 1    |
+---------------+---------------+-------------------------------------+-------------------------------------+
|            3.2|            3.4|                    5.300000000000001|                   5.6000000000000005|
+---------------+---------------+-------------------------------------+-------------------------------------+
Total line number = 1
It costs 0.007s
```

Aggregation with `GROUP BY`.

Input3:

```sql
select avg(temperature),
       sin(avg(temperature)),
       avg(temperature) + 1,
       -sum(hardware),
       avg(temperature) + sum(hardware) as custom_sum
from root.ln.wf01.wt01
GROUP BY([10, 90), 10ms);
```

Result3:

```
+-----------------------------+----------------------------------+---------------------------------------+--------------------------------------+--------------------------------+----------+
|                         Time|avg(root.ln.wf01.wt01.temperature)|sin(avg(root.ln.wf01.wt01.temperature))|avg(root.ln.wf01.wt01.temperature) + 1|-sum(root.ln.wf01.wt01.hardware)|custom_sum|
+-----------------------------+----------------------------------+---------------------------------------+--------------------------------------+--------------------------------+----------+
|1970-01-01T08:00:00.010+08:00|                13.987499999999999|                     0.9888207947857667|                    14.987499999999999|                         -3211.0| 3224.9875|
|1970-01-01T08:00:00.020+08:00|                              29.6|                    -0.9701057337071853|                                  30.6|                         -3720.0|    3749.6|
|1970-01-01T08:00:00.030+08:00|                              null|                                   null|                                  null|                            null|      null|
|1970-01-01T08:00:00.040+08:00|                              null|                                   null|                                  null|                            null|      null|
|1970-01-01T08:00:00.050+08:00|                              null|                                   null|                                  null|                            null|      null|
|1970-01-01T08:00:00.060+08:00|                              null|                                   null|                                  null|                            null|      null|
|1970-01-01T08:00:00.070+08:00|                              null|                                   null|                                  null|                            null|      null|
|1970-01-01T08:00:00.080+08:00|                              null|                                   null|                                  null|                            null|      null|
+-----------------------------+----------------------------------+---------------------------------------+--------------------------------------+--------------------------------+----------+
Total line number = 8
It costs 0.012s
```

##### Explanation

- Only when the left operand and the right operand under a certain timestamp are not `null`, the nested expressions will have an output value. Otherwise this row will not be included in the result. But for nested expressions with `GROUP BY` clause, it is better to show the result of all time intervals. Please refer to Input3 and corresponding Result3 in Example.
- If one operand in the nested expressions can be translated into multiple time series (For example, `*`), the result of each time series will be included in the result (Cartesian product). Please refer to Input2 and corresponding Result2 in Example.