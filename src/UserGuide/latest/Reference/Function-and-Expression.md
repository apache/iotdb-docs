# Function-and-Expression

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

## Arithmetic Operators and Functions

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

### Arithmetic Functions

Currently, IoTDB supports the following mathematical functions. The behavior of these mathematical functions is consistent with the behavior of these functions in the Java Math standard library.

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

Example:

```   sql
select s1, sin(s1), cos(s1), tan(s1) from root.sg1.d1 limit 5 offset 1000;
```

Result:

```
+-----------------------------+-------------------+-------------------+--------------------+-------------------+
|                         Time|     root.sg1.d1.s1|sin(root.sg1.d1.s1)| cos(root.sg1.d1.s1)|tan(root.sg1.d1.s1)|
+-----------------------------+-------------------+-------------------+--------------------+-------------------+
|2020-12-10T17:11:49.037+08:00|7360723084922759782| 0.8133527237573284|  0.5817708713544664| 1.3980636773094157|
|2020-12-10T17:11:49.038+08:00|4377791063319964531|-0.8938962705202537|  0.4482738644511651| -1.994085181866842|
|2020-12-10T17:11:49.039+08:00|7972485567734642915| 0.9627757585308978|-0.27030138509681073|-3.5618602479083545|
|2020-12-10T17:11:49.040+08:00|2508858212791964081|-0.6073417341629443| -0.7944406950452296| 0.7644897069734913|
|2020-12-10T17:11:49.041+08:00|2817297431185141819|-0.8419358900502509| -0.5395775727782725| 1.5603611649667768|
+-----------------------------+-------------------+-------------------+--------------------+-------------------+
Total line number = 5
It costs 0.008s
```

#### ROUND
Example:
```sql
select s4,round(s4),round(s4,2),round(s4,-1) from root.sg1.d1 
```

```sql
+-----------------------------+-------------+--------------------+----------------------+-----------------------+
|                         Time|root.db.d1.s4|ROUND(root.db.d1.s4)|ROUND(root.db.d1.s4,2)|ROUND(root.db.d1.s4,-1)|
+-----------------------------+-------------+--------------------+----------------------+-----------------------+
|1970-01-01T08:00:00.001+08:00|    101.14345|               101.0|                101.14|                  100.0|
|1970-01-01T08:00:00.002+08:00|    20.144346|                20.0|                 20.14|                   20.0|
|1970-01-01T08:00:00.003+08:00|    20.614372|                21.0|                 20.61|                   20.0|
|1970-01-01T08:00:00.005+08:00|    20.814346|                21.0|                 20.81|                   20.0|
|1970-01-01T08:00:00.006+08:00|     60.71443|                61.0|                 60.71|                   60.0|
|2023-03-13T16:16:19.764+08:00|    10.143425|                10.0|                 10.14|                   10.0|
+-----------------------------+-------------+--------------------+----------------------+-----------------------+
Total line number = 6
It costs 0.059s
```

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

## Comparison Operators and Functions

### Basic comparison operators

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

### `BETWEEN ... AND ...` operator

|operator |meaning|
|-----------------------------|-----------|
|`BETWEEN ... AND ...` |within the specified range|
|`NOT BETWEEN ... AND ...` |Not within the specified range|

**Example:** Select data within or outside the interval [36.5,40]:

```sql
select temperature from root.sg1.d1 where temperature between 36.5 and 40;
```

```sql
select temperature from root.sg1.d1 where temperature not between 36.5 and 40;
```

### Fuzzy matching operator

For TEXT type data, support fuzzy matching of data using `Like` and `Regexp` operators.

|operator |meaning|
|-----------------------------|-----------|
|`LIKE` | matches simple patterns|
|`NOT LIKE` |cannot match simple pattern|
|`REGEXP` | Match regular expression|
|`NOT REGEXP` |Cannot match regular expression|

Input data type: `TEXT`

Return type: `BOOLEAN`

#### Use `Like` for fuzzy matching

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

#### Use `Regexp` for fuzzy matching

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

### `IS NULL` operator

|operator |meaning|
|-----------------------------|-----------|
|`IS NULL` |is a null value|
|`IS NOT NULL` |is not a null value|

**Example 1:** Select data with empty values:

```sql
select code from root.sg1.d1 where temperature is null;
```

**Example 2:** Select data with non-null values:

```sql
select code from root.sg1.d1 where temperature is not null;
```

### `IN` operator

|operator |meaning|
|-----------------------------|-----------|
|`IN` / `CONTAINS` | are the values ​​in the specified list|
|`NOT IN` / `NOT CONTAINS` |not a value in the specified list|

Input data type: `All Types`

return type `BOOLEAN`

**Note: Please ensure that the values ​​in the collection can be converted to the type of the input data. **
> 
> For example:
>
> `s1 in (1, 2, 3, 'test')`, the data type of `s1` is `INT32`
>
> We will throw an exception because `'test'` cannot be converted to type `INT32`

**Example 1:** Select data with values ​​within a certain range:

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

### Condition Functions

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

#### Test 1
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

#### Test 2
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

## Logical Operators

### Unary Logical Operators

Supported operator `!`

Supported input data types: `BOOLEAN`

Output data type: `BOOLEAN`

Hint: the priority of `!` is the same as `-`. Remember to use brackets to modify priority.

### Binary Logical Operators

Supported operators AND:`and`,`&`, `&&`; OR:`or`,`|`,`||`

Supported input data types: `BOOLEAN`

Output data type: `BOOLEAN`

Note: Only when the left operand and the right operand under a certain timestamp are both `BOOLEAN` type, the binary logic operation will have an output value.

**Example:**

```sql
select a, b, a > 10, a <= b, !(a <= b), a > 10 && a > b from root.test;
```

Output:
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

## Aggregate Functions

Aggregate functions are many-to-one functions. They perform aggregate calculations on a set of values, resulting in a single aggregated result.

All aggregate functions except `COUNT()`, `COUNT_IF()` ignore null values and return null when there are no input rows or all values are null. For example, `SUM()` returns null instead of zero, and `AVG()` does not include null values in the count.

The aggregate functions supported by IoTDB are as follows:

| Function Name | Description                                                  | Allowed Input Series Data Types                     | Required Attributes                                          | Output Series Data Type             |
| ------------- | ------------------------------------------------------------ |-----------------------------------------------------| ------------------------------------------------------------ | ----------------------------------- |
| SUM           | Summation.                                                   | INT32 INT64 FLOAT DOUBLE                            | /                                                            | DOUBLE                              |
| COUNT         | Counts the number of data points.                            | All data types                                      | /                                                            | INT                                 |
| AVG           | Average.                                                     | INT32 INT64 FLOAT DOUBLE                            | /                                                            | DOUBLE                              |
| EXTREME       | Finds the value with the largest absolute value. Returns a positive value if the maximum absolute value of positive and negative values is equal. | INT32 INT64 FLOAT DOUBLE                            | /                                                            | Consistent with the input data type |
| MAX_VALUE     | Find the maximum value.                                      | INT32 INT64 FLOAT DOUBLE                            | /                                                            | Consistent with the input data type |
| MIN_VALUE     | Find the minimum value.                                      | INT32 INT64 FLOAT DOUBLE                            | /                                                            | Consistent with the input data type |
| FIRST_VALUE   | Find the value with the smallest timestamp.                  | All data types                                      | /                                                            | Consistent with input data type     |
| LAST_VALUE    | Find the value with the largest timestamp.                   | All data types                                      | /                                                            | Consistent with input data type     |
| MAX_TIME      | Find the maximum timestamp.                                  | All data Types                                      | /                                                            | Timestamp                           |
| MIN_TIME      | Find the minimum timestamp.                                  | All data Types                                      | /                                                            | Timestamp                           |
| COUNT_IF      | Find the number of data points that continuously meet a given condition and the number of data points that meet the condition (represented by keep) meet the specified threshold. | BOOLEAN                                             | `[keep >=/>/=/!=/</<=]threshold`：The specified threshold or threshold condition, it is equivalent to `keep >= threshold` if `threshold` is used alone, type of `threshold` is `INT64` `ignoreNull`：Optional, default value is `true`；If the value is `true`, null values are ignored, it means that if there is a null value in the middle, the value is ignored without interrupting the continuity. If the value is `true`, null values are not ignored, it means that if there are null values in the middle, continuity will be broken | INT64                               |
| TIME_DURATION | Find the difference between the timestamp of the largest non-null value and the timestamp of the smallest non-null value in a column | All data Types                                      | /                                                            | INT64                               |
| MODE          | Find the mode. Note:  1.Having too many different values in the input series risks a memory exception;  2.If all the elements have the same number of occurrences, that is no Mode, return the value with earliest time;  3.If there are many Modes, return the Mode with earliest time. | All data Types                                      | /                                                            | Consistent with the input data type |
| COUNT_TIME    | The number of timestamps in the query data set. When used with `align by device`, the result is the number of timestamps in the data set per device.                                                                                                                                       | All data Types, the input parameter can only be `*` | /                                                                                                                                                                                                                                                                                                                                                                                                                           | INT64                                        |


### COUNT

#### example

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

### COUNT_IF

#### Grammar
```sql
count_if(predicate, [keep >=/>/=/!=/</<=]threshold[, 'ignoreNull'='true/false'])
```
predicate: legal expression with `BOOLEAN` return type

use of threshold and ignoreNull can see above table

>Note: count_if is not supported to use with SlidingWindow in group by time now

#### example

##### raw data

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

##### Not use `ignoreNull` attribute (Ignore Null)

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

##### Use `ignoreNull` attribute

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

### TIME_DURATION
#### Grammar
```sql
    time_duration(Path)
```
#### Example
##### raw data
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
##### Insert sql
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

### COUNT_TIME
#### Grammar
```sql
    count_time(*)
```
#### Example
##### raw data
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
##### Insert sql
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

## String Processing

### STRING_CONTAINS

#### Function introduction

This function checks whether the substring `s` exists in the string

**Function name:** STRING_CONTAINS

**Input sequence:** Only a single input sequence is supported, the type is TEXT.

**parameter:**
+ `s`: The string to search for.

**Output Sequence:** Output a single sequence, the type is BOOLEAN.

#### Usage example

```   sql
select s1, string_contains(s1, 's'='warn') from root.sg1.d4;
```

``` 
+-----------------------------+--------------+-------------------------------------------+
|                         Time|root.sg1.d4.s1|string_contains(root.sg1.d4.s1, "s"="warn")|
+-----------------------------+--------------+-------------------------------------------+
|1970-01-01T08:00:00.001+08:00|    warn:-8721|                                       true|
|1970-01-01T08:00:00.002+08:00|  error:-37229|                                      false|
|1970-01-01T08:00:00.003+08:00|     warn:1731|                                       true|
+-----------------------------+--------------+-------------------------------------------+
Total line number = 3
It costs 0.007s
```

### STRING_MATCHES

#### Function introduction

This function judges whether a string can be matched by the regular expression `regex`.

**Function name:** STRING_MATCHES

**Input sequence:** Only a single input sequence is supported, the type is TEXT.

**parameter:**
+ `regex`: Java standard library-style regular expressions.

**Output Sequence:** Output a single sequence, the type is BOOLEAN.

#### Usage example

```sql
select s1, string_matches(s1, 'regex'='[^\\s]+37229') from root.sg1.d4;
```

```
+-----------------------------+--------------+------------------------------------------------------+
|                         Time|root.sg1.d4.s1|string_matches(root.sg1.d4.s1, "regex"="[^\\s]+37229")|
+-----------------------------+--------------+------------------------------------------------------+
|1970-01-01T08:00:00.001+08:00|    warn:-8721|                                                 false|
|1970-01-01T08:00:00.002+08:00|  error:-37229|                                                  true|
|1970-01-01T08:00:00.003+08:00|     warn:1731|                                                 false|
+-----------------------------+--------------+------------------------------------------------------+
Total line number = 3
It costs 0.007s
```

### Length

#### Usage

The function is used to get the length of input series.

**Name:** LENGTH

**Input Series:** Only support a single input series. The data type is TEXT.

**Output Series:** Output a single series. The type is INT32.

**Note:** Returns NULL if input is NULL.

#### Examples

Input series:

```
+-----------------------------+--------------+
|                         Time|root.sg1.d1.s1|
+-----------------------------+--------------+
|1970-01-01T08:00:00.001+08:00|        1test1|
|1970-01-01T08:00:00.002+08:00|      22test22|
+-----------------------------+--------------+
```

SQL for query:

```sql
select s1, length(s1) from root.sg1.d1
```

Output series:

```
+-----------------------------+--------------+----------------------+
|                         Time|root.sg1.d1.s1|length(root.sg1.d1.s1)|
+-----------------------------+--------------+----------------------+
|1970-01-01T08:00:00.001+08:00|        1test1|                     6|
|1970-01-01T08:00:00.002+08:00|      22test22|                     8|
+-----------------------------+--------------+----------------------+
```

### Locate

#### Usage

The function is used to get the position of the first occurrence of substring `target` in input series. Returns -1 if there are no `target` in input.

**Name:** LOCATE

**Input Series:** Only support a single input series. The data type is TEXT.

**Parameter:**

+ `target`: The substring to be located.
+ `reverse`: Indicates whether reverse locate is required. The default value is `false`, means left-to-right locate.

**Output Series:** Output a single series. The type is INT32.

**Note:** The index begins from 0.

#### Examples

Input series:

```
+-----------------------------+--------------+
|                         Time|root.sg1.d1.s1|
+-----------------------------+--------------+
|1970-01-01T08:00:00.001+08:00|        1test1|
|1970-01-01T08:00:00.002+08:00|      22test22|
+-----------------------------+--------------+
```

SQL for query:

```sql
select s1, locate(s1, "target"="1") from root.sg1.d1
```

Output series:

```
+-----------------------------+--------------+------------------------------------+
|                         Time|root.sg1.d1.s1|locate(root.sg1.d1.s1, "target"="1")|
+-----------------------------+--------------+------------------------------------+
|1970-01-01T08:00:00.001+08:00|        1test1|                                   0|
|1970-01-01T08:00:00.002+08:00|      22test22|                                  -1|
+-----------------------------+--------------+------------------------------------+
```

Another SQL for query:

```sql
select s1, locate(s1, "target"="1", "reverse"="true") from root.sg1.d1
```

Output series:

```
+-----------------------------+--------------+------------------------------------------------------+
|                         Time|root.sg1.d1.s1|locate(root.sg1.d1.s1, "target"="1", "reverse"="true")|
+-----------------------------+--------------+------------------------------------------------------+
|1970-01-01T08:00:00.001+08:00|        1test1|                                                     5|
|1970-01-01T08:00:00.002+08:00|      22test22|                                                    -1|
+-----------------------------+--------------+------------------------------------------------------+
```

### StartsWith

#### Usage

The function is used to check whether input series starts with the specified prefix.

**Name:** STARTSWITH

**Input Series:** Only support a single input series. The data type is TEXT.

**Parameter:**
+ `target`: The prefix to be checked.

**Output Series:** Output a single series. The type is BOOLEAN.

**Note:** Returns NULL if input is NULL.

#### Examples

Input series:

```
+-----------------------------+--------------+
|                         Time|root.sg1.d1.s1|
+-----------------------------+--------------+
|1970-01-01T08:00:00.001+08:00|        1test1|
|1970-01-01T08:00:00.002+08:00|      22test22|
+-----------------------------+--------------+
```

SQL for query:

```sql
select s1, startswith(s1, "target"="1") from root.sg1.d1
```

Output series:

```
+-----------------------------+--------------+----------------------------------------+
|                         Time|root.sg1.d1.s1|startswith(root.sg1.d1.s1, "target"="1")|
+-----------------------------+--------------+----------------------------------------+
|1970-01-01T08:00:00.001+08:00|        1test1|                                    true|
|1970-01-01T08:00:00.002+08:00|      22test22|                                   false|
+-----------------------------+--------------+----------------------------------------+
```

### EndsWith

#### Usage

The function is used to check whether input series ends with the specified suffix.

**Name:** ENDSWITH

**Input Series:** Only support a single input series. The data type is TEXT.

**Parameter:**
+ `target`: The suffix to be checked.

**Output Series:** Output a single series. The type is BOOLEAN.

**Note:** Returns NULL if input is NULL.

#### Examples

Input series:

```
+-----------------------------+--------------+
|                         Time|root.sg1.d1.s1|
+-----------------------------+--------------+
|1970-01-01T08:00:00.001+08:00|        1test1|
|1970-01-01T08:00:00.002+08:00|      22test22|
+-----------------------------+--------------+
```

SQL for query:

```sql
select s1, endswith(s1, "target"="1") from root.sg1.d1
```

Output series:

```
+-----------------------------+--------------+--------------------------------------+
|                         Time|root.sg1.d1.s1|endswith(root.sg1.d1.s1, "target"="1")|
+-----------------------------+--------------+--------------------------------------+
|1970-01-01T08:00:00.001+08:00|        1test1|                                  true|
|1970-01-01T08:00:00.002+08:00|      22test22|                                 false|
+-----------------------------+--------------+--------------------------------------+
```

### Concat

#### Usage

The function is used to concat input series and target strings.

**Name:** CONCAT

**Input Series:** At least one input series. The data type is TEXT.

**Parameter:**
+ `targets`: A series of K-V, key needs to start with `target` and be not duplicated, value is the string you want to concat.
+ `series_behind`: Indicates whether series behind targets. The default value is `false`.

**Output Series:** Output a single series. The type is TEXT.

**Note:** 
+ If value of input series is NULL, it will be skipped.
+ We can only concat input series and `targets` separately. `concat(s1, "target1"="IoT", s2, "target2"="DB")` and
  `concat(s1, s2, "target1"="IoT", "target2"="DB")` gives the same result.

#### Examples

Input series:

```
+-----------------------------+--------------+--------------+
|                         Time|root.sg1.d1.s1|root.sg1.d1.s2|
+-----------------------------+--------------+--------------+
|1970-01-01T08:00:00.001+08:00|        1test1|          null|
|1970-01-01T08:00:00.002+08:00|      22test22|      2222test|
+-----------------------------+--------------+--------------+
```

SQL for query:

```sql
select s1, s2, concat(s1, s2, "target1"="IoT", "target2"="DB") from root.sg1.d1
```

Output series:

```
+-----------------------------+--------------+--------------+-----------------------------------------------------------------------+
|                         Time|root.sg1.d1.s1|root.sg1.d1.s2|concat(root.sg1.d1.s1, root.sg1.d1.s2, "target1"="IoT", "target2"="DB")|
+-----------------------------+--------------+--------------+-----------------------------------------------------------------------+
|1970-01-01T08:00:00.001+08:00|        1test1|          null|                                                            1test1IoTDB|
|1970-01-01T08:00:00.002+08:00|      22test22|      2222test|                                                  22test222222testIoTDB|
+-----------------------------+--------------+--------------+-----------------------------------------------------------------------+
```

Another SQL for query:

```sql
select s1, s2, concat(s1, s2, "target1"="IoT", "target2"="DB", "series_behind"="true") from root.sg1.d1
```

Output series:

```
+-----------------------------+--------------+--------------+-----------------------------------------------------------------------------------------------+
|                         Time|root.sg1.d1.s1|root.sg1.d1.s2|concat(root.sg1.d1.s1, root.sg1.d1.s2, "target1"="IoT", "target2"="DB", "series_behind"="true")|
+-----------------------------+--------------+--------------+-----------------------------------------------------------------------------------------------+
|1970-01-01T08:00:00.001+08:00|        1test1|          null|                                                                                    IoTDB1test1|
|1970-01-01T08:00:00.002+08:00|      22test22|      2222test|                                                                          IoTDB22test222222test|
+-----------------------------+--------------+--------------+-----------------------------------------------------------------------------------------------+
```

### substring

#### Usage

Extracts a substring of a string, starting with the first specified character and stopping after the specified number of characters.The index start at 1. The value range of from and for is an INT32.

**Name:** SUBSTRING

**Input Series:** Only support a single input series. The data type is TEXT.

**Parameter:**
+ `from`: Indicates the start position of substring.
+ `for`: Indicates how many characters to stop after of substring.

**Output Series:** Output a single series. The type is TEXT.

**Note:** Returns NULL if input is NULL.

#### Examples

Input series:

```
+-----------------------------+--------------+
|                         Time|root.sg1.d1.s1|
+-----------------------------+--------------+
|1970-01-01T08:00:00.001+08:00|        1test1|
|1970-01-01T08:00:00.002+08:00|      22test22|
+-----------------------------+--------------+
```

SQL for query:

```sql
select s1, substring(s1 from 1 for 2) from root.sg1.d1
```

Output series:

```
+-----------------------------+--------------+--------------------------------------+
|                         Time|root.sg1.d1.s1|SUBSTRING(root.sg1.d1.s1 FROM 1 FOR 2)|
+-----------------------------+--------------+--------------------------------------+
|1970-01-01T08:00:00.001+08:00|        1test1|                                    1t|
|1970-01-01T08:00:00.002+08:00|      22test22|                                    22|
+-----------------------------+--------------+--------------------------------------+
```

### replace

#### Usage

Replace a substring in the input sequence with the target substring.

**Name:** REPLACE

**Input Series:** Only support a single input series. The data type is TEXT.

**Parameter:**
+ first parameter: The target substring to be replaced.
+ second parameter: The substring to replace with.

**Output Series:** Output a single series. The type is TEXT.

**Note:** Returns NULL if input is NULL.

#### Examples

Input series:

```
+-----------------------------+--------------+
|                         Time|root.sg1.d1.s1|
+-----------------------------+--------------+
|1970-01-01T08:00:00.001+08:00|        1test1|
|1970-01-01T08:00:00.002+08:00|      22test22|
+-----------------------------+--------------+
```

SQL for query:

```sql
select s1, replace(s1, 'es', 'tt') from root.sg1.d1
```

Output series:

```
+-----------------------------+--------------+-----------------------------------+
|                         Time|root.sg1.d1.s1|REPLACE(root.sg1.d1.s1, 'es', 'tt')|
+-----------------------------+--------------+-----------------------------------+
|1970-01-01T08:00:00.001+08:00|        1test1|                             1tttt1|
|1970-01-01T08:00:00.002+08:00|      22test22|                           22tttt22|
+-----------------------------+--------------+-----------------------------------+
```

### Upper

#### Usage

The function is used to get the string of input series with all characters changed to uppercase.

**Name:** UPPER

**Input Series:** Only support a single input series. The data type is TEXT.

**Output Series:** Output a single series. The type is TEXT.

**Note:** Returns NULL if input is NULL.

#### Examples

Input series:

```
+-----------------------------+--------------+
|                         Time|root.sg1.d1.s1|
+-----------------------------+--------------+
|1970-01-01T08:00:00.001+08:00|        1test1|
|1970-01-01T08:00:00.002+08:00|      22test22|
+-----------------------------+--------------+
```

SQL for query:

```sql
select s1, upper(s1) from root.sg1.d1
```

Output series:

```
+-----------------------------+--------------+---------------------+
|                         Time|root.sg1.d1.s1|upper(root.sg1.d1.s1)|
+-----------------------------+--------------+---------------------+
|1970-01-01T08:00:00.001+08:00|        1test1|               1TEST1|
|1970-01-01T08:00:00.002+08:00|      22test22|             22TEST22|
+-----------------------------+--------------+---------------------+
```

### Lower

#### Usage

The function is used to get the string of input series with all characters changed to lowercase.

**Name:** LOWER

**Input Series:** Only support a single input series. The data type is TEXT.

**Output Series:** Output a single series. The type is TEXT.

**Note:** Returns NULL if input is NULL.

#### Examples

Input series:

```
+-----------------------------+--------------+
|                         Time|root.sg1.d1.s1|
+-----------------------------+--------------+
|1970-01-01T08:00:00.001+08:00|        1TEST1|
|1970-01-01T08:00:00.002+08:00|      22TEST22|
+-----------------------------+--------------+
```

SQL for query:

```sql
select s1, lower(s1) from root.sg1.d1
```

Output series:

```
+-----------------------------+--------------+---------------------+
|                         Time|root.sg1.d1.s1|lower(root.sg1.d1.s1)|
+-----------------------------+--------------+---------------------+
|1970-01-01T08:00:00.001+08:00|        1TEST1|               1test1|
|1970-01-01T08:00:00.002+08:00|      22TEST22|             22test22|
+-----------------------------+--------------+---------------------+
```

### Trim

#### Usage

The function is used to get the string whose value is same to input series, with all leading and trailing space removed.

**Name:** TRIM

**Input Series:** Only support a single input series. The data type is TEXT.

**Output Series:** Output a single series. The type is TEXT.

**Note:** Returns NULL if input is NULL.

#### Examples

Input series:

```
+-----------------------------+--------------+
|                         Time|root.sg1.d1.s3|
+-----------------------------+--------------+
|1970-01-01T08:00:00.002+08:00|   3querytest3|
|1970-01-01T08:00:00.003+08:00|  3querytest3 |
+-----------------------------+--------------+
```

SQL for query:

```sql
select s3, trim(s3) from root.sg1.d1
```

Output series:

```
+-----------------------------+--------------+--------------------+
|                         Time|root.sg1.d1.s3|trim(root.sg1.d1.s3)|
+-----------------------------+--------------+--------------------+
|1970-01-01T08:00:00.002+08:00|   3querytest3|         3querytest3|
|1970-01-01T08:00:00.003+08:00|  3querytest3 |         3querytest3|
+-----------------------------+--------------+--------------------+
```

### StrCmp

#### Usage

The function is used to get the compare result of two input series. Returns `0` if series value are the same, a `negative integer` if value of series1 is smaller than series2, 
a `positive integer` if value of series1  is more than series2.

**Name:** StrCmp

**Input Series:** Support two input series. Data types are all the TEXT.

**Output Series:** Output a single series. The type is INT32.

**Note:** Returns NULL either series value is NULL.

#### Examples

Input series:

```
+-----------------------------+--------------+--------------+
|                         Time|root.sg1.d1.s1|root.sg1.d1.s2|
+-----------------------------+--------------+--------------+
|1970-01-01T08:00:00.001+08:00|        1test1|          null|
|1970-01-01T08:00:00.002+08:00|      22test22|      2222test|
+-----------------------------+--------------+--------------+
```

SQL for query:

```sql
select s1, s2, strcmp(s1, s2) from root.sg1.d1
```

Output series:

```
+-----------------------------+--------------+--------------+--------------------------------------+
|                         Time|root.sg1.d1.s1|root.sg1.d1.s2|strcmp(root.sg1.d1.s1, root.sg1.d1.s2)|
+-----------------------------+--------------+--------------+--------------------------------------+
|1970-01-01T08:00:00.001+08:00|        1test1|          null|                                  null|
|1970-01-01T08:00:00.002+08:00|      22test22|      2222test|                                    66|
+-----------------------------+--------------+--------------+--------------------------------------+
```


### StrReplace

#### Usage

**This is not a built-in function and can only be used after registering the library-udf.** The function is used to replace the specific substring with given string.

**Name:** STRREPLACE

**Input Series:** Only support a single input series. The data type is TEXT.

**Parameter:**

+ `target`: The target substring to be replaced.
+ `replace`: The string to be put on.
+ `limit`: The number of matches to be replaced which should be an integer no less than -1,
  default to -1 which means all matches will be replaced.
+ `offset`: The number of matches to be skipped, which means the first `offset` matches will not be replaced, default to 0.
+ `reverse`: Whether to count all the matches reversely, default to 'false'.

**Output Series:** Output a single series. The type is TEXT.

#### Examples

Input series:

```
+-----------------------------+---------------+
|                         Time|root.test.d1.s1|
+-----------------------------+---------------+
|2021-01-01T00:00:01.000+08:00|      A,B,A+,B-|
|2021-01-01T00:00:02.000+08:00|      A,A+,A,B+|
|2021-01-01T00:00:03.000+08:00|         B+,B,B|
|2021-01-01T00:00:04.000+08:00|      A+,A,A+,A|
|2021-01-01T00:00:05.000+08:00|       A,B-,B,B|
+-----------------------------+---------------+
```

SQL for query:

```sql
select strreplace(s1, "target"=",", "replace"="/", "limit"="2") from root.test.d1
```

Output series:

```
+-----------------------------+-----------------------------------------+
|                         Time|strreplace(root.test.d1.s1, "target"=",",|
|                             |              "replace"="/", "limit"="2")|
+-----------------------------+-----------------------------------------+
|2021-01-01T00:00:01.000+08:00|                                A/B/A+,B-|
|2021-01-01T00:00:02.000+08:00|                                A/A+/A,B+|
|2021-01-01T00:00:03.000+08:00|                                   B+/B/B|
|2021-01-01T00:00:04.000+08:00|                                A+/A/A+,A|
|2021-01-01T00:00:05.000+08:00|                                 A/B-/B,B|
+-----------------------------+-----------------------------------------+
```

Another SQL for query:

```sql
select strreplace(s1, "target"=",", "replace"="/", "limit"="1", "offset"="1", "reverse"="true") from root.test.d1
```

Output series:

```
+-----------------------------+-----------------------------------------------------+
|                         Time|strreplace(root.test.d1.s1, "target"=",", "replace"= | 
|                             |    "|", "limit"="1", "offset"="1", "reverse"="true")|
+-----------------------------+-----------------------------------------------------+
|2021-01-01T00:00:01.000+08:00|                                            A,B/A+,B-|
|2021-01-01T00:00:02.000+08:00|                                            A,A+/A,B+|
|2021-01-01T00:00:03.000+08:00|                                               B+/B,B|
|2021-01-01T00:00:04.000+08:00|                                            A+,A/A+,A|
|2021-01-01T00:00:05.000+08:00|                                             A,B-/B,B|
+-----------------------------+-----------------------------------------------------+
```

### RegexMatch

#### Usage

**This is not a built-in function and can only be used after registering the library-udf.** The function is used to fetch matched contents from text with given regular expression.

**Name:** REGEXMATCH

**Input Series:** Only support a single input series. The data type is TEXT.

**Parameter:**

+ `regex`: The regular expression to match in the text. All grammars supported by Java are acceptable,
  for example, `\d+\.\d+\.\d+\.\d+` is expected to match any IPv4 addresses.
+ `group`: The wanted group index in the matched result.
  Reference to java.util.regex, group 0 is the whole pattern and
  the next ones are numbered with the appearance order of left parentheses.
  For example, the groups in `A(B(CD))` are: 0-`A(B(CD))`, 1-`B(CD)`, 2-`CD`.

**Output Series:** Output a single series. The type is TEXT.

**Note:** Those points with null values or not matched with the given pattern will not return any results.

#### Examples

Input series:

```
+-----------------------------+-------------------------------+
|                         Time|                root.test.d1.s1|
+-----------------------------+-------------------------------+
|2021-01-01T00:00:01.000+08:00|        [192.168.0.1] [SUCCESS]|
|2021-01-01T00:00:02.000+08:00|       [192.168.0.24] [SUCCESS]|
|2021-01-01T00:00:03.000+08:00|           [192.168.0.2] [FAIL]|
|2021-01-01T00:00:04.000+08:00|        [192.168.0.5] [SUCCESS]|
|2021-01-01T00:00:05.000+08:00|      [192.168.0.124] [SUCCESS]|
+-----------------------------+-------------------------------+
```

SQL for query:

```sql
select regexmatch(s1, "regex"="\d+\.\d+\.\d+\.\d+", "group"="0") from root.test.d1
```

Output series:

```
+-----------------------------+----------------------------------------------------------------------+
|                         Time|regexmatch(root.test.d1.s1, "regex"="\d+\.\d+\.\d+\.\d+", "group"="0")|
+-----------------------------+----------------------------------------------------------------------+
|2021-01-01T00:00:01.000+08:00|                                                           192.168.0.1|
|2021-01-01T00:00:02.000+08:00|                                                          192.168.0.24|
|2021-01-01T00:00:03.000+08:00|                                                           192.168.0.2|
|2021-01-01T00:00:04.000+08:00|                                                           192.168.0.5|
|2021-01-01T00:00:05.000+08:00|                                                         192.168.0.124|
+-----------------------------+----------------------------------------------------------------------+
```

### RegexReplace

#### Usage

**This is not a built-in function and can only be used after registering the library-udf.** The function is used to replace the specific regular expression matches with given string.

**Name:** REGEXREPLACE

**Input Series:** Only support a single input series. The data type is TEXT.

**Parameter:**

+ `regex`: The target regular expression to be replaced. All grammars supported by Java are acceptable.
+ `replace`: The string to be put on and back reference notes in Java is also supported,
  for example, '$1' refers to group 1 in the `regex` which will be filled with corresponding matched results.
+ `limit`: The number of matches to be replaced which should be an integer no less than -1,
  default to -1 which means all matches will be replaced.
+ `offset`: The number of matches to be skipped, which means the first `offset` matches will not be replaced, default to 0.
+ `reverse`: Whether to count all the matches reversely, default to 'false'.

**Output Series:** Output a single series. The type is TEXT.

#### Examples

Input series:

```
+-----------------------------+-------------------------------+
|                         Time|                root.test.d1.s1|
+-----------------------------+-------------------------------+
|2021-01-01T00:00:01.000+08:00|        [192.168.0.1] [SUCCESS]|
|2021-01-01T00:00:02.000+08:00|       [192.168.0.24] [SUCCESS]|
|2021-01-01T00:00:03.000+08:00|           [192.168.0.2] [FAIL]|
|2021-01-01T00:00:04.000+08:00|        [192.168.0.5] [SUCCESS]|
|2021-01-01T00:00:05.000+08:00|      [192.168.0.124] [SUCCESS]|
+-----------------------------+-------------------------------+
```

SQL for query:

```sql
select regexreplace(s1, "regex"="192\.168\.0\.(\d+)", "replace"="cluster-$1", "limit"="1") from root.test.d1
```

Output series:

```
+-----------------------------+-----------------------------------------------------------+
|                         Time|regexreplace(root.test.d1.s1, "regex"="192\.168\.0\.(\d+)",|
|                             |                       "replace"="cluster-$1", "limit"="1")|
+-----------------------------+-----------------------------------------------------------+
|2021-01-01T00:00:01.000+08:00|                                      [cluster-1] [SUCCESS]|
|2021-01-01T00:00:02.000+08:00|                                     [cluster-24] [SUCCESS]|
|2021-01-01T00:00:03.000+08:00|                                         [cluster-2] [FAIL]|
|2021-01-01T00:00:04.000+08:00|                                      [cluster-5] [SUCCESS]|
|2021-01-01T00:00:05.000+08:00|                                    [cluster-124] [SUCCESS]|
+-----------------------------+-----------------------------------------------------------+
```

### RegexSplit

#### Usage

**This is not a built-in function and can only be used after registering the library-udf.** The function is used to split text with given regular expression and return specific element.

**Name:** REGEXSPLIT

**Input Series:** Only support a single input series. The data type is TEXT.

**Parameter:**

+ `regex`: The regular expression used to split the text.
  All grammars supported by Java are acceptable, for example, `['"]` is expected to match `'` and `"`.
+ `index`: The wanted index of elements in the split result.
  It should be an integer no less than -1, default to -1 which means the length of the result array is returned
  and any non-negative integer is used to fetch the text of the specific index starting from 0.

**Output Series:** Output a single series. The type is INT32 when `index` is -1 and TEXT when it's an valid index.

**Note:** When `index` is out of the range of the result array, for example `0,1,2` split with `,` and `index` is set to 3,
no result are returned for that record.

#### Examples

Input series:

```
+-----------------------------+---------------+
|                         Time|root.test.d1.s1|
+-----------------------------+---------------+
|2021-01-01T00:00:01.000+08:00|      A,B,A+,B-|
|2021-01-01T00:00:02.000+08:00|      A,A+,A,B+|
|2021-01-01T00:00:03.000+08:00|         B+,B,B|
|2021-01-01T00:00:04.000+08:00|      A+,A,A+,A|
|2021-01-01T00:00:05.000+08:00|       A,B-,B,B|
+-----------------------------+---------------+
```

SQL for query:

```sql
select regexsplit(s1, "regex"=",", "index"="-1") from root.test.d1
```

Output series:

```
+-----------------------------+------------------------------------------------------+
|                         Time|regexsplit(root.test.d1.s1, "regex"=",", "index"="-1")|
+-----------------------------+------------------------------------------------------+
|2021-01-01T00:00:01.000+08:00|                                                     4|
|2021-01-01T00:00:02.000+08:00|                                                     4|
|2021-01-01T00:00:03.000+08:00|                                                     3|
|2021-01-01T00:00:04.000+08:00|                                                     4|
|2021-01-01T00:00:05.000+08:00|                                                     4|
+-----------------------------+------------------------------------------------------+
```

Another SQL for query:

SQL for query:

```sql
select regexsplit(s1, "regex"=",", "index"="3") from root.test.d1
```

Output series:

```
+-----------------------------+-----------------------------------------------------+
|                         Time|regexsplit(root.test.d1.s1, "regex"=",", "index"="3")|
+-----------------------------+-----------------------------------------------------+
|2021-01-01T00:00:01.000+08:00|                                                   B-|
|2021-01-01T00:00:02.000+08:00|                                                   B+|
|2021-01-01T00:00:04.000+08:00|                                                    A|
|2021-01-01T00:00:05.000+08:00|                                                    B|
+-----------------------------+-----------------------------------------------------+
```