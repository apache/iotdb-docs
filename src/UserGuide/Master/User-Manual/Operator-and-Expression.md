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

# Operator and Expression

## OPERATORS

### Arithmetic Operators

#### Unary Arithmetic Operators

Supported operators: `+`, `-`

Supported input data types: `INT32`, `INT64` and `FLOAT`

Output data type: consistent with the input data type

#### Binary Arithmetic Operators

Supported operators: `+`, `-`, `*`, `/`, `%`

Supported input data types: `INT32`, `INT64`, `FLOAT` and `DOUBLE`

Output data type: `DOUBLE`

Note: Only when the left operand and the right operand under a certain timestamp are not  `null`, the binary arithmetic operation will have an output value.

#### Example

```sql
select s1, - s1, s2, + s2, s1 + s2, s1 - s2, s1 * s2, s1 / s2, s1 % s2 from root.sg.d1
```

Result:

```
+-----------------------------+-------------+--------------+-------------+-------------+-----------------------------+-----------------------------+-----------------------------+-----------------------------+-----------------------------+
|                         Time|root.sg.d1.s1|-root.sg.d1.s1|root.sg.d1.s2|root.sg.d1.s2|root.sg.d1.s1 + root.sg.d1.s2|root.sg.d1.s1 - root.sg.d1.s2|root.sg.d1.s1 * root.sg.d1.s2|root.sg.d1.s1 / root.sg.d1.s2|root.sg.d1.s1 % root.sg.d1.s2|
+-----------------------------+-------------+--------------+-------------+-------------+-----------------------------+-----------------------------+-----------------------------+-----------------------------+-----------------------------+
|1970-01-01T08:00:00.001+08:00|          1.0|          -1.0|          1.0|          1.0|                          2.0|                          0.0|                          1.0|                          1.0|                          0.0|
|1970-01-01T08:00:00.002+08:00|          2.0|          -2.0|          2.0|          2.0|                          4.0|                          0.0|                          4.0|                          1.0|                          0.0|
|1970-01-01T08:00:00.003+08:00|          3.0|          -3.0|          3.0|          3.0|                          6.0|                          0.0|                          9.0|                          1.0|                          0.0|
|1970-01-01T08:00:00.004+08:00|          4.0|          -4.0|          4.0|          4.0|                          8.0|                          0.0|                         16.0|                          1.0|                          0.0|
|1970-01-01T08:00:00.005+08:00|          5.0|          -5.0|          5.0|          5.0|                         10.0|                          0.0|                         25.0|                          1.0|                          0.0|
+-----------------------------+-------------+--------------+-------------+-------------+-----------------------------+-----------------------------+-----------------------------+-----------------------------+-----------------------------+
Total line number = 5
It costs 0.014s
```

### Comparison Operators

#### Basic comparison operators

Supported operators `>`, `>=`, `<`, `<=`, `==`, `!=` (or  `<>` )

Supported input data types: `INT32`, `INT64`, `FLOAT` and `DOUBLE` 

Note: It will transform all type to `DOUBLE` then do computation. 

Output data type: `BOOLEAN`

**Example:**

```sql
select a, b, a > 10, a <= b, !(a <= b), a > 10 && a > b from root.test;
```

```
IoTDB> select a, b, a > 10, a <= b, !(a <= b), a > 10 && a > b from root.test;
+-----------------------------+-----------+-----------+----------------+--------------------------+---------------------------+------------------------------------------------+
|                         Time|root.test.a|root.test.b|root.test.a > 10|root.test.a <= root.test.b|!root.test.a <= root.test.b|(root.test.a > 10) & (root.test.a > root.test.b)|
+-----------------------------+-----------+-----------+----------------+--------------------------+---------------------------+------------------------------------------------+
|1970-01-01T08:00:00.001+08:00|         23|       10.0|            true|                     false|                       true|                                            true|
|1970-01-01T08:00:00.002+08:00|         33|       21.0|            true|                     false|                       true|                                            true|
|1970-01-01T08:00:00.004+08:00|         13|       15.0|            true|                      true|                      false|                                           false|
|1970-01-01T08:00:00.005+08:00|         26|        0.0|            true|                     false|                       true|                                            true|
|1970-01-01T08:00:00.008+08:00|          1|       22.0|           false|                      true|                      false|                                           false|
|1970-01-01T08:00:00.010+08:00|         23|       12.0|            true|                     false|                       true|                                            true|
+-----------------------------+-----------+-----------+----------------+--------------------------+---------------------------+------------------------------------------------+
```

#### `BETWEEN ... AND ...` operator

| operator                  | meaning                        |
| ------------------------- | ------------------------------ |
| `BETWEEN ... AND ...`     | within the specified range     |
| `NOT BETWEEN ... AND ...` | Not within the specified range |

**Example:** Select data within or outside the interval [36.5,40]:

```sql
select temperature from root.sg1.d1 where temperature between 36.5 and 40;
```

```sql
select temperature from root.sg1.d1 where temperature not between 36.5 and 40;
```

#### Fuzzy matching operator

For TEXT type data, support fuzzy matching of data using `Like` and `Regexp` operators.

| operator     | meaning                         |
| ------------ | ------------------------------- |
| `LIKE`       | matches simple patterns         |
| `NOT LIKE`   | cannot match simple pattern     |
| `REGEXP`     | Match regular expression        |
| `NOT REGEXP` | Cannot match regular expression |

Input data type: `TEXT`

Return type: `BOOLEAN`

##### Use `Like` for fuzzy matching

**Matching rules:**

- `%` means any 0 or more characters.
- `_` means any single character.

**Example 1:** Query the data under `root.sg.d1` that contains `'cc'` in `value`.

```shell
IoTDB> select * from root.sg.d1 where value like '%cc%'
+--------------------------+----------------+
| Time|root.sg.d1.value|
+--------------------------+----------------+
|2017-11-01T00:00:00.000+08:00| aabbccdd|
|2017-11-01T00:00:01.000+08:00| cc|
+--------------------------+----------------+
Total line number = 2
It costs 0.002s
```

**Example 2:** Query the data under `root.sg.d1` with `'b'` in the middle of `value` and any single character before and after.

```shell
IoTDB> select * from root.sg.device where value like '_b_'
+--------------------------+----------------+
| Time|root.sg.d1.value|
+--------------------------+----------------+
|2017-11-01T00:00:02.000+08:00|abc|
+--------------------------+----------------+
Total line number = 1
It costs 0.002s
```

##### Use `Regexp` for fuzzy matching

The filter condition that needs to be passed in is **Java standard library style regular expression**.

**Common regular matching examples:**

```
All characters with a length of 3-20: ^.{3,20}$
Uppercase English characters: ^[A-Z]+$
Numbers and English characters: ^[A-Za-z0-9]+$
Starting with a: ^a.*
```

**Example 1:** Query the string of 26 English characters for value under root.sg.d1.

```shell
IoTDB> select * from root.sg.d1 where value regexp '^[A-Za-z]+$'
+--------------------------+----------------+
| Time|root.sg.d1.value|
+--------------------------+----------------+
|2017-11-01T00:00:00.000+08:00| aabbccdd|
|2017-11-01T00:00:01.000+08:00| cc|
+--------------------------+----------------+
Total line number = 2
It costs 0.002s
```

**Example 2:** Query root.sg.d1 where the value is a string consisting of 26 lowercase English characters and the time is greater than 100.

```shell
IoTDB> select * from root.sg.d1 where value regexp '^[a-z]+$' and time > 100
+--------------------------+----------------+
| Time|root.sg.d1.value|
+--------------------------+----------------+
|2017-11-01T00:00:00.000+08:00| aabbccdd|
|2017-11-01T00:00:01.000+08:00| cc|
+--------------------------+----------------+
Total line number = 2
It costs 0.002s
```

**Example 3:**

```sql
select b, b like '1%', b regexp '[0-2]' from root.test;
```

operation result

```
+-----------------------------+-----------+------- ------------------+--------------------------+
| Time|root.test.b|root.test.b LIKE '^1.*?$'|root.test.b REGEXP '[0-2]'|
+-----------------------------+-----------+------- ------------------+--------------------------+
|1970-01-01T08:00:00.001+08:00| 111test111| true| true|
|1970-01-01T08:00:00.003+08:00| 333test333| false| false|
+-----------------------------+-----------+------- ------------------+--------------------------+
```

#### `IS NULL` operator

| operator      | meaning             |
| ------------- | ------------------- |
| `IS NULL`     | is a null value     |
| `IS NOT NULL` | is not a null value |

**Example 1:** Select data with empty values:

```sql
select code from root.sg1.d1 where temperature is null;
```

**Example 2:** Select data with non-null values:

```sql
select code from root.sg1.d1 where temperature is not null;
```

#### `IN` operator

| operator                  | meaning                              |
| ------------------------- | ------------------------------------ |
| `IN` / `CONTAINS`         | are the values ​​in the specified list |
| `NOT IN` / `NOT CONTAINS` | not a value in the specified list    |

Input data type: `All Types`

return type `BOOLEAN`

**Note: Please ensure that the values ​​in the collection can be converted to the type of the input data. **

> For example:
>
> `s1 in (1, 2, 3, 'test')`, the data type of `s1` is `INT32`
>
> We will throw an exception because `'test'` cannot be converted to type `INT32`
>
> **Example 1:** Select data with values ​​within a certain range:

```sql
select code from root.sg1.d1 where code in ('200', '300', '400', '500');
```

**Example 2:** Select data with values ​​outside a certain range:

```sql
select code from root.sg1.d1 where code not in ('200', '300', '400', '500');
```

**Example 3:**

```sql
select a, a in (1, 2) from root.test;
```

Output 2:

```
+-----------------------------+-----------+------- -------------+
| Time|root.test.a|root.test.a IN (1,2)|
+-----------------------------+-----------+------- -------------+
|1970-01-01T08:00:00.001+08:00| 1| true|
|1970-01-01T08:00:00.003+08:00| 3| false|
+-----------------------------+-----------+------- -------------+
```

#### Condition Functions

Condition functions are used to check whether timeseries data points satisfy some specific condition. 

They return BOOLEANs.

Currently, IoTDB supports the following condition functions:

| Function Name | Allowed Input Series Data Types | Required Attributes                           | Output Series Data Type | Description                                   |
| ------------- | ------------------------------- | --------------------------------------------- | ----------------------- | --------------------------------------------- |
| ON_OFF        | INT32 / INT64 / FLOAT / DOUBLE  | `threshold`: a double type variate            | BOOLEAN                 | Return `ts_value >= threshold`.               |
| IN_RANGR      | INT32 / INT64 / FLOAT / DOUBLE  | `lower`: DOUBLE type<br/>`upper`: DOUBLE type | BOOLEAN                 | Return `ts_value >= lower && value <= upper`. |

Example Data:

```
IoTDB> select ts from root.test;
+-----------------------------+------------+
|                         Time|root.test.ts|
+-----------------------------+------------+
|1970-01-01T08:00:00.001+08:00|           1|
|1970-01-01T08:00:00.002+08:00|           2|
|1970-01-01T08:00:00.003+08:00|           3|
|1970-01-01T08:00:00.004+08:00|           4|
+-----------------------------+------------+
```

##### Test 1

SQL:

```sql
select ts, on_off(ts, 'threshold'='2') from root.test;
```

Output:

```
IoTDB> select ts, on_off(ts, 'threshold'='2') from root.test;
+-----------------------------+------------+-------------------------------------+
|                         Time|root.test.ts|on_off(root.test.ts, "threshold"="2")|
+-----------------------------+------------+-------------------------------------+
|1970-01-01T08:00:00.001+08:00|           1|                                false|
|1970-01-01T08:00:00.002+08:00|           2|                                 true|
|1970-01-01T08:00:00.003+08:00|           3|                                 true|
|1970-01-01T08:00:00.004+08:00|           4|                                 true|
+-----------------------------+------------+-------------------------------------+
```

##### Test 2

Sql:

```sql
select ts, in_range(ts, 'lower'='2', 'upper'='3.1') from root.test;
```

Output:

```
IoTDB> select ts, in_range(ts,'lower'='2', 'upper'='3.1') from root.test;
+-----------------------------+------------+--------------------------------------------------+
|                         Time|root.test.ts|in_range(root.test.ts, "lower"="2", "upper"="3.1")|
+-----------------------------+------------+--------------------------------------------------+
|1970-01-01T08:00:00.001+08:00|           1|                                             false|
|1970-01-01T08:00:00.002+08:00|           2|                                              true|
|1970-01-01T08:00:00.003+08:00|           3|                                              true|
|1970-01-01T08:00:00.004+08:00|           4|                                             false|
+-----------------------------+------------+--------------------------------------------------+
```

## SELECT EXPRESSIONS

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

See the documentation [Operators and Functions](../Operators-Functions/Overview.md) for a list of operators supported in IoTDB.

### Function

#### aggregate functions

Aggregate functions are many-to-one functions. They perform aggregate calculations on a set of values, resulting in a single aggregated result.

**A query that contains an aggregate function is called an aggregate query**, otherwise, it is called a time series query.

> Please note that mixed use of `Aggregate Query` and `Timeseries Query` is not allowed. Below are examples for queries that are not allowed.
>
> ```
> select a, count(a) from root.sg 
> select sin(a), count(a) from root.sg
> select a, count(a) from root.sg group by ([10,100),10ms)
> ```

For the aggregation functions supported by IoTDB, see the document [Aggregation Functions](../Operators-Functions/Aggregation.md).

#### Time series generation function

A time series generation function takes several raw time series as input and produces a list of time series as output. Unlike aggregate functions, time series generators have a timestamp column in their result sets.

All time series generation functions accept * as input, and all can be mixed with raw time series queries.

##### Built-in time series generation functions

See the documentation [Operators and Functions](../Operators-Functions/Overview.md) for a list of built-in functions supported in IoTDB.

##### User-Defined time series generation function

IoTDB supports function extension through User Defined Function (click for [User-Defined Function](../Operators-Functions/User-Defined-Function.md)) capability.

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

#### Nested Expressions query with aggregations

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

## BUILT-IN FUNCTIONS

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