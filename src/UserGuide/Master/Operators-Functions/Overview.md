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

The built-in functions can be used in IoTDB without registration, and the functions in the data quality library need to be registered by referring to the registration steps in the next chapter before they can be used.

### Aggregate Functions

| Function    | Meaning                                                      | Allowed input data types | Output data type                    |
| ----------- | ------------------------------------------------------------ | ------------------------ | ----------------------------------- |
| SUM         | Calculate the summation.                                     | INT32 INT64 FLOAT DOUBLE | DOUBLE                              |
| COUNT       | Calculate the number of data points.                         | All data types           | INT                                 |
| AVG         | Calculate the average.                                       | INT32 INT64 FLOAT DOUBLE | DOUBLE                              |
| EXTREME     | Finds the value with the largest absolute value. Returns a positive value if the maximum absolute values of the positive and negative values are equal. | INT32 INT64 FLOAT DOUBLE | Consistent with the input data type |
| MAX_VALUE   | Find the maximum value.                                      | INT32 INT64 FLOAT DOUBLE | Consistent with the input data type |
| MIN_VALUE   | Find the minimum value.                                      | INT32 INT64 FLOAT DOUBLE | Consistent with the input data type |
| FIRST_VALUE | Find the value with the smallest timestamp.                  | All data types           | Consistent with the input data type |
| LAST_VALUE  | Find the value with the biggest timestamp.                   | All data types           | Consistent with the input data type |
| MAX_TIME    | Find the maximum timestamp.                                  | All data types           | Timestamp                           |
| MIN_TIME    | Find the minimum timestamp.                                  | All data types           | Timestamp                           |

For details and examples, see the document [Aggregate Functions](./Aggregation.md).

### Arithmetic Functions

| Function | Allowed input data types       | Output data type                    | The corresponding implementation in the Java standard library |
| -------- | ------------------------------ | ----------------------------------- | ------------------------------------------------------------ |
| SIN      | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                              | Math#sin(double)                                             |
| COS      | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                              | Math#cos(double)                                             |
| TAN      | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                              | Math#tan(double)                                             |
| ASIN     | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                              | Math#asin(double)                                            |
| ACOS     | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                              | Math#acos(double)                                            |
| ATAN     | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                              | Math#atan(double)                                            |
| SINH     | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                              | Math#sinh(double)                                            |
| COSH     | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                              | Math#cosh(double)                                            |
| TANH     | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                              | Math#tanh(double)                                            |
| DEGREES  | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                              | Math#toDegrees(double)                                       |
| RADIANS  | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                              | Math#toRadians(double)                                       |
| ABS      | INT32 / INT64 / FLOAT / DOUBLE | Consistent with the input data type | Math#abs(int) / Math#abs(long) /Math#abs(float) /Math#abs(double) |
| SIGN     | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                              | Math#signum(double)                                          |
| CEIL     | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                              | Math#ceil(double)                                            |
| FLOOR    | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                              | Math#floor(double)                                           |
| ROUND    | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                              | Math#rint(double)                                            |
| EXP      | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                              | Math#exp(double)                                             |
| LN       | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                              | Math#log(double)                                             |
| LOG10    | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                              | Math#log10(double)                                           |
| SQRT     | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                              | Math#sqrt(double)                                            |


For details and examples, see the document [Arithmetic Operators and Functions](./Mathematical.md).

### Comparison Functions

| Function | Allowed input data types       | Required attribute parameters     | Output data type | Meaning                                                      |
| -------- | ------------------------------ | --------------------------------- | ---------------- | ------------------------------------------------------------ |
| ON_OFF   | INT32 / INT64 / FLOAT / DOUBLE | `threshold`:DOUBLE                | BOOLEAN          | Return the boolean result of `ts_value >= threshold`.        |
| IN_RANGE | INT32 / INT64 / FLOAT / DOUBLE | `lower`:DOUBLE<br/>`upper`:DOUBLE | BOOLEAN          | Return the boolean result of `ts_value >= lower && ts_value <= upper`. |

For details and examples, see the document [Comparison Operators and Functions](./Comparison.md).

### 字符串处理函数

| Function        | Allowed input data types | Required attribute parameters                                | Output data type | Meaning                                                      |
| --------------- | ------------------------ | ------------------------------------------------------------ | ---------------- | ------------------------------------------------------------ |
| STRING_CONTAINS | TEXT                     | `s`: string to search for                                    | BOOLEAN          | Check if `s` exists in a string.                             |
| STRING_MATCHES  | TEXT                     | `regex`: a regular expression conforming to the style of the Java standard library | BOOLEAN          | Determine whether a string can be matched by the regular expression `regex`. |
| LENGTH          | TEXT                     | /                                                            | INT32            | Returns the length of the string.                            |
| LOCATE          | TEXT                     | `target`: the substring to be located<br/> `reverse`: specifies whether reverse positioning is required, the default value is `false`, that is, positioning from left to right | INT32            | Get the first occurrence position of the `target` substring in the input sequence, and return -1 if the input sequence does not contain `target`. |
| STARTSWITH      | TEXT                     | `target`: prefix to match                                    | BOOLEAN          | Determine whether a string has the specified prefix `target`. |
| ENDSWITH        | TEXT                     | `target`: suffix to match                                    | BOOLEAN          | Determine whether a string has the specified suffix `target`. |
| CONCAT          | TEXT                     | `targets`: 一系列 K-V, key需要以`target`为前缀且不重复, value是待拼接的字符串。<br/>`series_behind`: 指定拼接时时间序列是否在后面，默认为`false`。 | TEXT             | 拼接字符串和`target`字串                                     |
| SUBSTR          | TEXT                     | `start`: 指定子串开始下标 <br/>`end`: 指定子串结束下标       | TEXT             | 获取下标从`start`到`end - 1`的子串                           |
| UPPER           | TEXT                     | 无                                                           | TEXT             | 将字符串转化为大写                                           |
| LOWER           | TEXT                     | 无                                                           | TEXT             | 将字符串转化为小写                                           |
| TRIM            | TEXT                     | 无                                                           | TEXT             | 移除字符串前后的空格                                         |
| STRCMP          | TEXT                     | 无                                                           | TEXT             | 用于比较两个输入序列，如果值相同返回 `0` , 序列1的值小于序列2的值返回一个`负数`，序列1的值大于序列2的值返回一个`正数` |

For details and examples, see the document [字符串处理函数](./String.md).

### 数据类型转换函数

| Function | Required attribute parameters                                | Output data type         | Meaning                            |
| -------- | ------------------------------------------------------------ | ------------------------ | ---------------------------------- |
| CAST     | `type`:输出的数据点的类型，只能是 INT32 / INT64 / FLOAT / DOUBLE / BOOLEAN / TEXT | 由输入属性参数`type`决定 | 将数据转换为`type`参数指定的类型。 |

For details and examples, see the document [数据类型转换](./Conversion.md).

### 常序列生成函数

| Function | Required attribute parameters                                | Output data type           | Meaning                                                      |
| -------- | ------------------------------------------------------------ | -------------------------- | ------------------------------------------------------------ |
| CONST    | `value`: 输出的数据点的值 <br />`type`: 输出的数据点的类型，只能是 INT32 / INT64 / FLOAT / DOUBLE / BOOLEAN / TEXT | 由输入属性参数 `type` 决定 | 根据输入属性 `value` 和 `type` 输出用户指定的常序列。        |
| PI       | 无                                                           | DOUBLE                     | 常序列的值：`π` 的 `double` 值，圆的周长与其直径的比值，即圆周率，等于 *Java标准库* 中的`Math.PI`。 |
| E        | 无                                                           | DOUBLE                     | 常序列的值：`e` 的 `double` 值，自然对数的底，它等于 *Java 标准库*  中的 `Math.E`。 |

For details and examples, see the document [常序列生成函数](./Constant.md).

### 选择函数

| Function | Allowed input data types              | Required attribute parameters                     | Output data type         | Meaning                                                      |
| -------- | ------------------------------------- | ------------------------------------------------- | ------------------------ | ------------------------------------------------------------ |
| TOP_K    | INT32 / INT64 / FLOAT / DOUBLE / TEXT | `k`: 最多选择的数据点数，必须大于 0 小于等于 1000 | 与输入序列的实际类型一致 | 返回某时间序列中值最大的`k`个数据点。若多于`k`个数据点的值并列最大，则返回时间戳最小的数据点。 |
| BOTTOM_K | INT32 / INT64 / FLOAT / DOUBLE / TEXT | `k`: 最多选择的数据点数，必须大于 0 小于等于 1000 | 与输入序列的实际类型一致 | 返回某时间序列中值最小的`k`个数据点。若多于`k`个数据点的值并列最小，则返回时间戳最小的数据点。 |

For details and examples, see the document [选择函数](./Selection.md).

### 区间查询函数

| Function          | Allowed input data types             | Required attribute parameters                             | Output data type | Meaning                                                      |
| ----------------- | ------------------------------------ | --------------------------------------------------------- | ---------------- | ------------------------------------------------------------ |
| ZERO_DURATION     | INT32/ INT64/ FLOAT/ DOUBLE/ BOOLEAN | `min`:可选，默认值0<br>`max`:可选，默认值`Long.MAX_VALUE` | Long             | 返回时间序列连续为0(false)的开始时间与持续时间，持续时间t(单位ms)满足`t >= min && t <= max` |
| NON_ZERO_DURATION | INT32/ INT64/ FLOAT/ DOUBLE/ BOOLEAN | `min`:可选，默认值0<br>`max`:可选，默认值`Long.MAX_VALUE` | Long             | 返回时间序列连续不为0(false)的开始时间与持续时间，持续时间t(单位ms)满足`t >= min && t <= max` |
| ZERO_COUNT        | INT32/ INT64/ FLOAT/ DOUBLE/ BOOLEAN | `min`:可选，默认值1<br>`max`:可选，默认值`Long.MAX_VALUE` | Long             | 返回时间序列连续为0(false)的开始时间与其后数据点的个数，数据点个数n满足`n >= min && n <= max` |
| NON_ZERO_COUNT    | INT32/ INT64/ FLOAT/ DOUBLE/ BOOLEAN | `min`:可选，默认值1<br>`max`:可选，默认值`Long.MAX_VALUE` | Long             | 返回时间序列连续不为0(false)的开始时间与其后数据点的个数，数据点个数n满足`n >= min && n <= max` |

For details and examples, see the document [区间查询函数](./Continuous-Interval.md).

### 趋势计算函数

| Function                | Allowed input data types                        | Output data type         | Meaning                                                      |
| ----------------------- | ----------------------------------------------- | ------------------------ | ------------------------------------------------------------ |
| TIME_DIFFERENCE         | INT32 / INT64 / FLOAT / DOUBLE / BOOLEAN / TEXT | INT64                    | 统计序列中某数据点的时间戳与前一数据点时间戳的差。范围内第一个数据点没有对应的结果输出。 |
| DIFFERENCE              | INT32 / INT64 / FLOAT / DOUBLE                  | 与输入序列的实际类型一致 | 统计序列中某数据点的值与前一数据点的值的差。范围内第一个数据点没有对应的结果输出。 |
| NON_NEGATIVE_DIFFERENCE | INT32 / INT64 / FLOAT / DOUBLE                  | 与输入序列的实际类型一致 | 统计序列中某数据点的值与前一数据点的值的差的绝对值。范围内第一个数据点没有对应的结果输出。 |
| DERIVATIVE              | INT32 / INT64 / FLOAT / DOUBLE                  | DOUBLE                   | 统计序列中某数据点相对于前一数据点的变化率，数量上等同于 DIFFERENCE /  TIME_DIFFERENCE。范围内第一个数据点没有对应的结果输出。 |
| NON_NEGATIVE_DERIVATIVE | INT32 / INT64 / FLOAT / DOUBLE                  | DOUBLE                   | 统计序列中某数据点相对于前一数据点的变化率的绝对值，数量上等同于 NON_NEGATIVE_DIFFERENCE /  TIME_DIFFERENCE。范围内第一个数据点没有对应的结果输出。 |


| Function | Allowed input data types       | Required attribute parameters                                | Output data type | Meaning                                                      |
| -------- | ------------------------------ | ------------------------------------------------------------ | ---------------- | ------------------------------------------------------------ |
| DIFF     | INT32 / INT64 / FLOAT / DOUBLE | `ignoreNull`：可选，默认为true；为true时，前一个数据点值为null时，忽略该数据点继续向前找到第一个出现的不为null的值；为false时，如果前一个数据点为null，则不忽略，使用null进行相减，结果也为null | DOUBLE           | 统计序列中某数据点的值与前一数据点的值的差。第一个数据点没有对应的结果输出，输出值为null |

For details and examples, see the document [趋势计算函数](./Variation-Trend.md).

### 采样函数

| Function                         | Allowed input data types       | Required attribute parameters                                | Output data type               | Meaning                                                      |
| -------------------------------- | ------------------------------ | ------------------------------------------------------------ | ------------------------------ | ------------------------------------------------------------ |
| EQUAL_SIZE_BUCKET_RANDOM_SAMPLE  | INT32 / INT64 / FLOAT / DOUBLE | 降采样比例 `proportion`，取值范围为`(0, 1]`，默认为`0.1`     | INT32 / INT64 / FLOAT / DOUBLE | 返回符合采样比例的等分桶随机采样                             |
| EQUAL_SIZE_BUCKET_AGG_SAMPLE     | INT32 / INT64 / FLOAT / DOUBLE | `proportion`取值范围为`(0, 1]`，默认为`0.1`<br>`type`:取值类型有`avg`, `max`, `min`, `sum`, `extreme`, `variance`, 默认为`avg` | INT32 / INT64 / FLOAT / DOUBLE | 返回符合采样比例的等分桶聚合采样                             |
| EQUAL_SIZE_BUCKET_M4_SAMPLE      | INT32 / INT64 / FLOAT / DOUBLE | `proportion`取值范围为`(0, 1]`，默认为`0.1`                  | INT32 / INT64 / FLOAT / DOUBLE | 返回符合采样比例的等分桶M4采样                               |
| EQUAL_SIZE_BUCKET_OUTLIER_SAMPLE | INT32 / INT64 / FLOAT / DOUBLE | `proportion`取值范围为`(0, 1]`，默认为`0.1`<br>`type`取值为`avg`或`stendis`或`cos`或`prenextdis`，默认为`avg`<br>`number`取值应大于0，默认`3` | INT32 / INT64 / FLOAT / DOUBLE | 返回符合采样比例和桶内采样个数的等分桶离群值采样             |
| M4                               | INT32 / INT64 / FLOAT / DOUBLE | 包含固定点数的窗口和滑动时间窗口使用不同的属性参数。包含固定点数的窗口使用属性`windowSize`和`slidingStep`。滑动时间窗口使用属性`timeInterval`、`slidingStep`、`displayWindowBegin`和`displayWindowEnd`。更多细节见下文。 | INT32 / INT64 / FLOAT / DOUBLE | 返回每个窗口内的第一个点（`first`）、最后一个点（`last`）、最小值点（`bottom`）、最大值点（`top`）。在一个窗口内的聚合点输出之前，M4会将它们按照时间戳递增排序并且去重。 |

## 数据质量函数库

对基于时序数据的应用而言，数据质量至关重要。基于用户自定义函数能力，IoTDB 提供了一系列关于数据质量的函数，包括数据画像、数据质量评估与修复等，能够满足工业领域对数据质量的需求。

**该函数库中的函数不是内置函数，使用前要先加载到系统中。** 操作流程如下：

1. 下载包含全部依赖的 jar 包和注册脚本 [【点击下载】](https://archive.apache.org/dist/iotdb/1.0.1/apache-iotdb-1.0.1-library-udf-bin.zip) ；
2. 将 jar 包复制到 IoTDB 程序目录的 `ext\udf` 目录下 (若您使用的是集群，请将jar包复制到所有DataNode的该目录下)；
3. 启动 IoTDB；
4. 将注册脚本复制到 IoTDB 的程序目录下（与`sbin`目录同级的根目录下），修改脚本中的参数（如果需要）并运行注册脚本以注册 UDF。

## Priority of Operators

|priority|operator  |meaning            |
|:---:|:------------|:------------------|
|1    |`-`          |Unary operator negative  |
|1    |`+`          |Unary operator positive  |
|1    |`!`          |Unary operator negation  |
|2    |`*`          |Binary operator multiply |
|2    |`/`          |Binary operator division |
|2    |`%`          |Binary operator remainder|
|3    |`+`          |Binary operator add      |
|3    |`-`          |Binary operator minus    |
|4    |`>`          |Binary compare operator greater than|
|4    |`>=`         |Binary compare operator greater or equal to|
|4    |`<`          |Binary compare operator less than|
|4    |`<=`         |Binary compare operator less or equal to|
|4    |`==`         |Binary compare operator equal to|
|4    |`!=`/`<>`    |Binary compare operator non-equal to|
|5      |`REGEXP`   |`REGEXP` operator|
|5      |`LIKE`    |`LIKE` operator|
|6      |`IN`    |`IN` operator|
|7    |`and`/`&`/`&&`               |Binary logic operator and|
|8    |`or`/ &#124; / &#124;&#124;  |Binary logic operator or|

## About
For applications based on time series data, data quality is vital.
**UDF Library** is IoTDB User Defined Functions (UDF) about data quality, including data profiling, data quality evalution and data repairing.
It effectively meets the demand for data quality in the industrial field.

## Quick Start

1. Download the JAR with all dependencies and the script of registering UDF.
2. Copy the JAR package to `ext\udf` under the directory of IoTDB system (Please put JAR to this directory of all DataNodes if you use Cluster).
3. Run `sbin\start-server.bat` (for Windows) or `sbin\start-server.sh` (for Linux or MacOS) to start IoTDB server.
4. Copy the script to the directory of IoTDB system (under the root directory, at the same level as `sbin`), modify the parameters in the script if needed and run it to register UDF.


## Download

Since our codes are still under review, there are no codes in Apache repository. Before finishing the review, the above files can be downloaded in our [old website](https://thulab.github.io/iotdb-quality/en/Download.html). 

