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

# 运算符、函数和表达式

## 运算符
### 算数运算符
|运算符                       |含义|
|----------------------------|-----------|
|`+`                         |取正（单目）|
|`-`                         |取负（单目）|
|`*`                         |乘|
|`/`                         |除|
|`%`                         |取余|
|`+`                         |加|
|`-`                         |减|

详细说明及示例见文档 [算数运算符和函数](../Reference/Function-and-Expression.md#算数运算符)。

### 比较运算符
|运算符                       |含义|
|----------------------------|-----------|
|`>`                         |大于|
|`>=`                        |大于等于|
|`<`                         |小于|
|`<=`                        |小于等于|
|`==`                        |等于|
|`!=` / `<>`                 |不等于|
|`BETWEEN ... AND ...`       |在指定范围内|
|`NOT BETWEEN ... AND ...`   |不在指定范围内|
|`LIKE`                      |匹配简单模式|
|`NOT LIKE`                  |无法匹配简单模式|
|`REGEXP`                    |匹配正则表达式|
|`NOT REGEXP`                |无法匹配正则表达式|
|`IS NULL`                   |是空值|
|`IS NOT NULL`               |不是空值|
|`IN` / `CONTAINS`           |是指定列表中的值|
|`NOT IN` / `NOT CONTAINS`   |不是指定列表中的值|

详细说明及示例见文档 [比较运算符和函数](../Reference/Function-and-Expression.md#比较运算符和函数)。

### 逻辑运算符
|运算符                       |含义|
|----------------------------|-----------|
|`NOT` / `!`                 |取非（单目）|
|`AND` / `&` / `&&`          |逻辑与|
|`OR`/ &#124; / &#124;&#124; |逻辑或|

详细说明及示例见文档 [逻辑运算符](../Reference/Function-and-Expression.md#逻辑运算符)。

### 运算符优先级

运算符的优先级从高到低排列如下，同一行的运算符优先级相同。

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

## 内置函数

列表中的函数无须注册即可在 IoTDB 中使用，数据函数质量库中的函数需要参考注册步骤进行注册后才能使用。

### 聚合函数

| 函数名         | 功能描述                                                                       | 允许的输入类型           | 输出类型       |
|-------------|----------------------------------------------------------------------------| ------------------------ | -------------- |
| SUM         | 求和。                                                                        | INT32 INT64 FLOAT DOUBLE | DOUBLE         |
| COUNT       | 计算数据点数。                                                                    | 所有类型                 | INT            |
| AVG         | 求平均值。                                                                      | INT32 INT64 FLOAT DOUBLE | DOUBLE         |
| EXTREME     | 求具有最大绝对值的值。如果正值和负值的最大绝对值相等，则返回正值。                                          | INT32 INT64 FLOAT DOUBLE | 与输入类型一致 |
| MAX_VALUE   | 求最大值。                                                                      | INT32 INT64 FLOAT DOUBLE | 与输入类型一致 |
| MIN_VALUE   | 求最小值。                                                                      | INT32 INT64 FLOAT DOUBLE | 与输入类型一致 |
| FIRST_VALUE | 求时间戳最小的值。                                                                  | 所有类型                 | 与输入类型一致 |
| LAST_VALUE  | 求时间戳最大的值。                                                                  | 所有类型                 | 与输入类型一致 |
| MAX_TIME    | 求最大时间戳。                                                                    | 所有类型                 | Timestamp      |
| MIN_TIME    | 求最小时间戳。                                                                    | 所有类型                 | Timestamp      |
| MAX_BY      | MAX_BY(x, y) 求二元输入 x 和 y 在 y 最大时对应的 x 的值。MAX_BY(time, x) 返回 x 取最大值时对应的时间戳。 | 第一个输入 x 可以是任意类型，第二个输入 y 只能是 INT32 INT64 FLOAT DOUBLE  |  与第一个输入 x 的数据类型一致 |
| MIN_BY      | MIN_BY(x, y) 求二元输入 x 和 y 在 y 最小时对应的 x 的值。MIN_BY(time, x) 返回 x 取最小值时对应的时间戳。 | 第一个输入 x 可以是任意类型，第二个输入 y 只能是 INT32 INT64 FLOAT DOUBLE  |  与第一个输入 x 的数据类型一致 |

详细说明及示例见文档 [聚合函数](../Reference/Function-and-Expression.md#聚合函数)。

### 数学函数 

| 函数名  | 输入序列类型                   | 输出序列类型             | 必要属性参数                                       | Java 标准库中的对应实现                                                    |
| ------- | ------------------------------ | ------------------------ |----------------------------------------------|-------------------------------------------------------------------|
| SIN     | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |                                              | Math#sin(double)                                                  |
| COS     | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |                                              | Math#cos(double)                                                  |
| TAN     | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |                                              | Math#tan(double)                                                  |
| ASIN    | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |                                              | Math#asin(double)                                                 |
| ACOS    | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |                                              | Math#acos(double)                                                 |
| ATAN    | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |                                              | Math#atan(double)                                                 |
| SINH    | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |                                              | Math#sinh(double)                                                 |
| COSH    | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |                                              | Math#cosh(double)                                                 |
| TANH    | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |                                              | Math#tanh(double)                                                 |
| DEGREES | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |                                              | Math#toDegrees(double)                                            |
| RADIANS | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |                                              | Math#toRadians(double)                                            |
| ABS     | INT32 / INT64 / FLOAT / DOUBLE | 与输入序列的实际类型一致 |                                              | Math#abs(int) / Math#abs(long) /Math#abs(float) /Math#abs(double) |
| SIGN    | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |                                              | Math#signum(double)                                               |
| CEIL    | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |                                              | Math#ceil(double)                                                 |
| FLOOR   | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |                                              | Math#floor(double)                                                |
| ROUND   | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   | `places`:四舍五入有效位数，正数为小数点后面的有效位数，负数为整数位的有效位数 | Math#rint(Math#pow(10,places))/Math#pow(10,places)                         |
| EXP     | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |                                              | Math#exp(double)                                                  |
| LN      | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |                                              | Math#log(double)                                                  |
| LOG10   | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |                                              | Math#log10(double)                                                |
| SQRT    | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |                                              | Math#sqrt(double)                                                 |


详细说明及示例见文档 [数学函数](../Reference/Function-and-Expression.md#数学函数)。

### 比较函数

| 函数名    | 可接收的输入序列类型                | 必要的属性参数                               | 输出序列类型     | 功能类型                                             |
|----------|--------------------------------|---------------------------------------|------------|--------------------------------------------------|
| ON_OFF   | INT32 / INT64 / FLOAT / DOUBLE | `threshold`:DOUBLE                  | BOOLEAN | 返回`ts_value >= threshold`的bool值                  |
| IN_RANGE | INT32 / INT64 / FLOAT / DOUBLE | `lower`:DOUBLE<br/>`upper`:DOUBLE | BOOLEAN | 返回`ts_value >= lower && ts_value <= upper`的bool值 |                                                    |

详细说明及示例见文档 [比较运算符和函数](../Reference/Function-and-Expression.md#比较运算符和函数)。

### 字符串函数
| 函数名             | 输入序列类型 | 必要的属性参数                                                                                                   | 输出序列类型 | 功能描述                                                                    |
|-----------------| ------------ |-----------------------------------------------------------------------------------------------------------| ------------ |-------------------------------------------------------------------------|
| STRING_CONTAINS | TEXT         | `s`: 待搜寻的字符串                                                                                              | BOOLEAN      | 判断字符串中是否存在`s`                                                           |
| STRING_MATCHES  | TEXT         | `regex`: Java 标准库风格的正则表达式                                                                                 | BOOLEAN      | 判断字符串是否能够被正则表达式`regex`匹配                                                |
| LENGTH          | TEXT | 无                                                                                                         | INT32 | 返回字符串的长度                                                                |
| LOCATE          | TEXT | `target`: 需要被定位的子串 <br/> `reverse`: 指定是否需要倒序定位，默认值为`false`, 即从左至右定位                                       | INT32 | 获取`target`子串第一次出现在输入序列的位置，如果输入序列中不包含`target`则返回 -1                      |
| STARTSWITH      | TEXT | `target`: 需要匹配的前缀                                                                                         | BOOLEAN | 判断字符串是否有指定前缀                                                            |
| ENDSWITH        | TEXT | `target`: 需要匹配的后缀                                                                                         | BOOLEAN | 判断字符串是否有指定后缀                                                            |
| CONCAT          | TEXT | `targets`: 一系列 K-V, key需要以`target`为前缀且不重复, value是待拼接的字符串。<br/>`series_behind`: 指定拼接时时间序列是否在后面，默认为`false`。 | TEXT | 拼接字符串和`target`字串                                                        |
| SUBSTRING       | TEXT | `from`: 指定子串开始下标 <br/>`for`: 指定的字符个数之后停止                                                                  | TEXT | 提取字符串的子字符串，从指定的第一个字符开始，并在指定的字符数之后停止。下标从1开始。from 和 for的范围是 INT32 类型取值范围。 |
| REPLACE | TEXT | 第一个参数： 需要替换的目标子串<br />第二个参数：要替换成的子串 | TEXT | 将输入序列中的子串替换成目标子串 |
| UPPER           | TEXT | 无                                                                                                         | TEXT | 将字符串转化为大写                                                               |
| LOWER           | TEXT | 无                                                                                                         | TEXT | 将字符串转化为小写                                                               |
| TRIM            | TEXT | 无                                                                                                         | TEXT | 移除字符串前后的空格                                                              |
| STRCMP          | TEXT | 无                                                                                                         | TEXT | 用于比较两个输入序列，如果值相同返回 `0` , 序列1的值小于序列2的值返回一个`负数`，序列1的值大于序列2的值返回一个`正数`      |
详细说明及示例见文档 [字符串处理函数](../Reference/Function-and-Expression.md#字符串处理)。

### 数据类型转换函数

| 函数名 | 必要的属性参数                                               | 输出序列类型             | 功能类型                           |
| ------ | ------------------------------------------------------------ | ------------------------ | ---------------------------------- |
| CAST   | `type`:输出的数据点的类型，只能是 INT32 / INT64 / FLOAT / DOUBLE / BOOLEAN / TEXT | 由输入属性参数`type`决定 | 将数据转换为`type`参数指定的类型。 |

详细说明及示例见文档 [数据类型转换](../Reference/Function-and-Expression.md#数据类型转换)。

### 常序列生成函数

| 函数名 | 必要的属性参数                                               | 输出序列类型               | 功能描述                                                     |
| ------ | ------------------------------------------------------------ | -------------------------- | ------------------------------------------------------------ |
| CONST  | `value`: 输出的数据点的值 <br />`type`: 输出的数据点的类型，只能是 INT32 / INT64 / FLOAT / DOUBLE / BOOLEAN / TEXT | 由输入属性参数 `type` 决定 | 根据输入属性 `value` 和 `type` 输出用户指定的常序列。        |
| PI     | 无                                                           | DOUBLE                     | 常序列的值：`π` 的 `double` 值，圆的周长与其直径的比值，即圆周率，等于 *Java标准库* 中的`Math.PI`。 |
| E      | 无                                                           | DOUBLE                     | 常序列的值：`e` 的 `double` 值，自然对数的底，它等于 *Java 标准库*  中的 `Math.E`。 |

详细说明及示例见文档 [常序列生成函数](../Reference/Function-and-Expression.md#常序列生成函数)。

### 选择函数

| 函数名   | 输入序列类型                          | 必要的属性参数                                    | 输出序列类型             | 功能描述                                                     |
| -------- | ------------------------------------- | ------------------------------------------------- | ------------------------ | ------------------------------------------------------------ |
| TOP_K    | INT32 / INT64 / FLOAT / DOUBLE / TEXT | `k`: 最多选择的数据点数，必须大于 0 小于等于 1000 | 与输入序列的实际类型一致 | 返回某时间序列中值最大的`k`个数据点。若多于`k`个数据点的值并列最大，则返回时间戳最小的数据点。 |
| BOTTOM_K | INT32 / INT64 / FLOAT / DOUBLE / TEXT | `k`: 最多选择的数据点数，必须大于 0 小于等于 1000 | 与输入序列的实际类型一致 | 返回某时间序列中值最小的`k`个数据点。若多于`k`个数据点的值并列最小，则返回时间戳最小的数据点。 |

详细说明及示例见文档 [选择函数](../Reference/Function-and-Expression.md#选择函数)。

### 区间查询函数

| 函数名               | 输入序列类型                               | 属性参数                                           | 输出序列类型 | 功能描述                                                             |
|-------------------|--------------------------------------|------------------------------------------------|-------|------------------------------------------------------------------|
| ZERO_DURATION     | INT32/ INT64/ FLOAT/ DOUBLE/ BOOLEAN | `min`:可选，默认值0<br>`max`:可选，默认值`Long.MAX_VALUE` | Long  | 返回时间序列连续为0(false)的开始时间与持续时间，持续时间t(单位ms)满足`t >= min && t <= max`  |
| NON_ZERO_DURATION | INT32/ INT64/ FLOAT/ DOUBLE/ BOOLEAN | `min`:可选，默认值0<br>`max`:可选，默认值`Long.MAX_VALUE` | Long  | 返回时间序列连续不为0(false)的开始时间与持续时间，持续时间t(单位ms)满足`t >= min && t <= max` |               |
| ZERO_COUNT        | INT32/ INT64/ FLOAT/ DOUBLE/ BOOLEAN | `min`:可选，默认值1<br>`max`:可选，默认值`Long.MAX_VALUE` | Long  | 返回时间序列连续为0(false)的开始时间与其后数据点的个数，数据点个数n满足`n >= min && n <= max`   |               |
| NON_ZERO_COUNT    | INT32/ INT64/ FLOAT/ DOUBLE/ BOOLEAN | `min`:可选，默认值1<br>`max`:可选，默认值`Long.MAX_VALUE` | Long  | 返回时间序列连续不为0(false)的开始时间与其后数据点的个数，数据点个数n满足`n >= min && n <= max`  |               |

详细说明及示例见文档 [区间查询函数](../Reference/Function-and-Expression.md#区间查询函数)。

### 趋势计算函数

| 函数名                  | 输入序列类型                                    | 输出序列类型             | 功能描述                                                     |
| ----------------------- | ----------------------------------------------- | ------------------------ | ------------------------------------------------------------ |
| TIME_DIFFERENCE         | INT32 / INT64 / FLOAT / DOUBLE / BOOLEAN / TEXT | INT64                    | 统计序列中某数据点的时间戳与前一数据点时间戳的差。范围内第一个数据点没有对应的结果输出。 |
| DIFFERENCE              | INT32 / INT64 / FLOAT / DOUBLE                  | 与输入序列的实际类型一致 | 统计序列中某数据点的值与前一数据点的值的差。范围内第一个数据点没有对应的结果输出。 |
| NON_NEGATIVE_DIFFERENCE | INT32 / INT64 / FLOAT / DOUBLE                  | 与输入序列的实际类型一致 | 统计序列中某数据点的值与前一数据点的值的差的绝对值。范围内第一个数据点没有对应的结果输出。 |
| DERIVATIVE              | INT32 / INT64 / FLOAT / DOUBLE                  | DOUBLE                   | 统计序列中某数据点相对于前一数据点的变化率，数量上等同于 DIFFERENCE /  TIME_DIFFERENCE。范围内第一个数据点没有对应的结果输出。 |
| NON_NEGATIVE_DERIVATIVE | INT32 / INT64 / FLOAT / DOUBLE                  | DOUBLE                   | 统计序列中某数据点相对于前一数据点的变化率的绝对值，数量上等同于 NON_NEGATIVE_DIFFERENCE /  TIME_DIFFERENCE。范围内第一个数据点没有对应的结果输出。 |


| 函数名  | 输入序列类型                         | 参数                                                                                                                     | 输出序列类型 | 功能描述                                           |
|------|--------------------------------|------------------------------------------------------------------------------------------------------------------------|--------|------------------------------------------------|
| DIFF | INT32 / INT64 / FLOAT / DOUBLE | `ignoreNull`：可选，默认为true；为true时，前一个数据点值为null时，忽略该数据点继续向前找到第一个出现的不为null的值；为false时，如果前一个数据点为null，则不忽略，使用null进行相减，结果也为null | DOUBLE | 统计序列中某数据点的值与前一数据点的值的差。第一个数据点没有对应的结果输出，输出值为null |

详细说明及示例见文档 [趋势计算函数](../Reference/Function-and-Expression.md#趋势计算函数)。

### 采样函数

| 函数名      | 可接收的输入序列类型                     | 必要的属性参数                               | 输出序列类型     | 功能类型                                             |
|----------|--------------------------------|---------------------------------------|------------|--------------------------------------------------|
| EQUAL_SIZE_BUCKET_RANDOM_SAMPLE   | INT32 / INT64 / FLOAT / DOUBLE | 降采样比例 `proportion`，取值范围为`(0, 1]`，默认为`0.1`  | INT32 / INT64 / FLOAT / DOUBLE | 返回符合采样比例的等分桶随机采样                |
| EQUAL_SIZE_BUCKET_AGG_SAMPLE   | INT32 / INT64 / FLOAT / DOUBLE | `proportion`取值范围为`(0, 1]`，默认为`0.1`<br>`type`:取值类型有`avg`, `max`, `min`, `sum`, `extreme`, `variance`, 默认为`avg`  | INT32 / INT64 / FLOAT / DOUBLE | 返回符合采样比例的等分桶聚合采样                |
| EQUAL_SIZE_BUCKET_M4_SAMPLE   | INT32 / INT64 / FLOAT / DOUBLE | `proportion`取值范围为`(0, 1]`，默认为`0.1`| INT32 / INT64 / FLOAT / DOUBLE | 返回符合采样比例的等分桶M4采样                |
| EQUAL_SIZE_BUCKET_OUTLIER_SAMPLE   | INT32 / INT64 / FLOAT / DOUBLE | `proportion`取值范围为`(0, 1]`，默认为`0.1`<br>`type`取值为`avg`或`stendis`或`cos`或`prenextdis`，默认为`avg`<br>`number`取值应大于0，默认`3`| INT32 / INT64 / FLOAT / DOUBLE | 返回符合采样比例和桶内采样个数的等分桶离群值采样                |
| M4     | INT32 / INT64 / FLOAT / DOUBLE | 包含固定点数的窗口和滑动时间窗口使用不同的属性参数。包含固定点数的窗口使用属性`windowSize`和`slidingStep`。滑动时间窗口使用属性`timeInterval`、`slidingStep`、`displayWindowBegin`和`displayWindowEnd`。更多细节见下文。 | INT32 / INT64 / FLOAT / DOUBLE | 返回每个窗口内的第一个点（`first`）、最后一个点（`last`）、最小值点（`bottom`）、最大值点（`top`）。在一个窗口内的聚合点输出之前，M4会将它们按照时间戳递增排序并且去重。 |

详细说明及示例见文档 [采样函数](../Reference/Function-and-Expression.md#采样函数)。
### 时间序列处理函数

| 函数名        | 输入序列类型                   | 参数 | 输出序列类型             | 功能描述                   |
| ------------- | ------------------------------ | ---- | ------------------------ | -------------------------- |
| CHANGE_POINTS | INT32 / INT64 / FLOAT / DOUBLE | /    | 与输入序列的实际类型一致 | 去除输入序列中的连续相同值 |

详细说明及示例见文档 [时间序列处理](../Reference/Function-and-Expression.md#时间序列处理)。

## 数据质量函数库

### 关于

对基于时序数据的应用而言，数据质量至关重要。基于用户自定义函数能力，IoTDB 提供了一系列关于数据质量的函数，包括数据画像、数据质量评估与修复等，能够满足工业领域对数据质量的需求。

### 快速上手

**该函数库中的函数不是内置函数，使用前要先加载到系统中。** 操作流程如下：

1. 下载包含全部依赖的 jar 包和注册脚本 [【点击下载】](https://archive.apache.org/dist/iotdb/1.0.1/apache-iotdb-1.0.1-library-udf-bin.zip) ；
2. 将 jar 包复制到 IoTDB 程序目录的 `ext\udf` 目录下 (若您使用的是集群，请将jar包复制到所有DataNode的该目录下)；
3. 启动 IoTDB；
4. 将注册脚本复制到 IoTDB 的程序目录下（与`sbin`目录同级的根目录下），修改脚本中的参数（如果需要）并运行注册脚本以注册 UDF。

### 已经实现的函数

1.   [Data-Quality](../Reference/UDF-Libraries.md#数据质量) 数据质量
2.   [Data-Profiling](../Reference/UDF-Libraries.md#数据画像) 数据画像
3.   [Anomaly-Detection](../Reference/UDF-Libraries.md#异常检测) 异常检测
4.   [Frequency-Domain](../Reference/UDF-Libraries.md#频域分析) 频域分析
5.   [Data-Matching](../Reference/UDF-Libraries.md#数据匹配) 数据匹配
6.   [Data-Repairing](../Reference/UDF-Libraries.md#数据修复) 数据修复
7.   [Series-Discovery](../Reference/UDF-Libraries.md#序列发现) 序列发现
8.   [Machine-Learning](../Reference/UDF-Libraries.md#机器学习) 机器学习

## Lambda 表达式

| 函数名 | 可接收的输入序列类型                            | 必要的属性参数                                               | 输出序列类型                                    | 功能类型                                       |
| ------ | ----------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------- | ---------------------------------------------- |
| JEXL   | INT32 / INT64 / FLOAT / DOUBLE / TEXT / BOOLEAN | `expr`是一个支持标准的一元或多元参数的lambda表达式，符合`x -> {...}`或`(x, y, z) -> {...}`的格式，例如`x -> {x * 2}`, `(x, y, z) -> {x + y * z}` | INT32 / INT64 / FLOAT / DOUBLE / TEXT / BOOLEAN | 返回将输入的时间序列通过lambda表达式变换的序列 |

详细说明及示例见文档 [Lambda 表达式](../Reference/Function-and-Expression.md#Lambda表达式)

## 条件表达式

| 表达式名称                     | 含义        |
|---------------------------|-----------|
| `CASE` | 类似if else |

详细说明及示例见文档 [条件表达式](../Reference/Function-and-Expression.md#条件表达式)

## SELECT 表达式

`SELECT` 子句指定查询的输出，由若干个 `selectExpr` 组成。 每个 `selectExpr` 定义了查询结果中的一列或多列。

**`selectExpr` 是一个由时间序列路径后缀、常量、函数和运算符组成的表达式。即 `selectExpr` 中可以包含：**

- 时间序列路径后缀（支持使用通配符）
- 运算符
    - 算数运算符
    - 比较运算符
    - 逻辑运算符
- 函数
    - 聚合函数
    - 时间序列生成函数（包括内置函数和用户自定义函数）
- 常量

#### 使用别名

由于 IoTDB 独特的数据模型，在每个传感器前都附带有设备等诸多额外信息。有时，我们只针对某个具体设备查询，而这些前缀信息频繁显示造成了冗余，影响了结果集的显示与分析。

IoTDB 支持使用`AS`为查询结果集中的列指定别名。

**示例：**

```sql
select s1 as temperature, s2 as speed from root.ln.wf01.wt01;
```

结果集将显示为：

| Time | temperature | speed |
| ---- | ----------- | ----- |
| ...  | ...         | ...   |

#### 运算符

IoTDB 中支持的运算符列表见文档 [运算符和函数](../Reference/Function-and-Expression.md#算数运算符和函数)。

#### 函数

##### 聚合函数

聚合函数是多对一函数。它们对一组值进行聚合计算，得到单个聚合结果。

**包含聚合函数的查询称为聚合查询**，否则称为时间序列查询。

**注意：聚合查询和时间序列查询不能混合使用。** 下列语句是不支持的：

```sql
select s1, count(s1) from root.sg.d1;
select sin(s1), count(s1) from root.sg.d1;
select s1, count(s1) from root.sg.d1 group by ([10,100),10ms);
```

IoTDB 支持的聚合函数见文档 [聚合函数](../Reference/Function-and-Expression.md#聚合函数)。

##### 时间序列生成函数

时间序列生成函数接受若干原始时间序列作为输入，产生一列时间序列输出。与聚合函数不同的是，时间序列生成函数的结果集带有时间戳列。

所有的时间序列生成函数都可以接受 * 作为输入，都可以与原始时间序列查询混合进行。

###### 内置时间序列生成函数

IoTDB 中支持的内置函数列表见文档 [运算符和函数](../Reference/Function-and-Expression.md#算数运算符)。

###### 自定义时间序列生成函数

IoTDB 支持通过用户自定义函数（点击查看： [用户自定义函数](../Reference/UDF-Libraries.md) ）能力进行函数功能扩展。

#### 嵌套表达式举例

IoTDB 支持嵌套表达式，由于聚合查询和时间序列查询不能在一条查询语句中同时出现，我们将支持的嵌套表达式分为时间序列查询嵌套表达式和聚合查询嵌套表达式两类。

##### 时间序列查询嵌套表达式

IoTDB 支持在 `SELECT` 子句中计算由**时间序列、常量、时间序列生成函数（包括用户自定义函数）和运算符**组成的任意嵌套表达式。

**说明：**

- 当某个时间戳下左操作数和右操作数都不为空（`null`）时，表达式才会有结果，否则表达式值为`null`，且默认不出现在结果集中。 
- 如果表达式中某个操作数对应多条时间序列（如通配符 `*`），那么每条时间序列对应的结果都会出现在结果集中（按照笛卡尔积形式）。

**示例 1：**

```sql
select a,
       b,
       ((a + 1) * 2 - 1) % 2 + 1.5,
       sin(a + sin(a + sin(b))),
       -(a + b) * (sin(a + b) * sin(a + b) + cos(a + b) * cos(a + b)) + 1
from root.sg1;
```

运行结果：

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

**示例 2：**

```sql
select (a + b) * 2 + sin(a) from root.sg
```

运行结果：

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

**示例 3：**

```sql
select (a + *) / 2  from root.sg1
```

运行结果：

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

**示例 4：**

```sql
select (a + b) * 3 from root.sg, root.ln
```

运行结果：

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

##### 聚合查询嵌套表达式

IoTDB 支持在 `SELECT` 子句中计算由**聚合函数、常量、时间序列生成函数和表达式**组成的任意嵌套表达式。

**说明：**

- 当某个时间戳下左操作数和右操作数都不为空（`null`）时，表达式才会有结果，否则表达式值为`null`，且默认不出现在结果集中。但在使用`GROUP BY`子句的聚合查询嵌套表达式中，我们希望保留每个时间窗口的值，所以表达式值为`null`的窗口也包含在结果集中。
- 如果表达式中某个操作数对应多条时间序列（如通配符`*`），那么每条时间序列对应的结果都会出现在结果集中（按照笛卡尔积形式）。

**示例 1：**

```sql
select avg(temperature),
       sin(avg(temperature)),
       avg(temperature) + 1,
       -sum(hardware),
       avg(temperature) + sum(hardware)
from root.ln.wf01.wt01;
```

运行结果：

```
+----------------------------------+---------------------------------------+--------------------------------------+--------------------------------+--------------------------------------------------------------------+
|avg(root.ln.wf01.wt01.temperature)|sin(avg(root.ln.wf01.wt01.temperature))|avg(root.ln.wf01.wt01.temperature) + 1|-sum(root.ln.wf01.wt01.hardware)|avg(root.ln.wf01.wt01.temperature) + sum(root.ln.wf01.wt01.hardware)|
+----------------------------------+---------------------------------------+--------------------------------------+--------------------------------+--------------------------------------------------------------------+
|                15.927999999999999|                   -0.21826546964855045|                    16.927999999999997|                         -7426.0|                                                            7441.928|
+----------------------------------+---------------------------------------+--------------------------------------+--------------------------------+--------------------------------------------------------------------+
Total line number = 1
It costs 0.009s
```

**示例 2：**

```sql
select avg(*), 
	   (avg(*) + 1) * 3 / 2 -1 
from root.sg1
```

运行结果：

```
+---------------+---------------+-------------------------------------+-------------------------------------+
|avg(root.sg1.a)|avg(root.sg1.b)|(avg(root.sg1.a) + 1) * 3 / 2 - 1    |(avg(root.sg1.b) + 1) * 3 / 2 - 1    |
+---------------+---------------+-------------------------------------+-------------------------------------+
|            3.2|            3.4|                    5.300000000000001|                   5.6000000000000005|
+---------------+---------------+-------------------------------------+-------------------------------------+
Total line number = 1
It costs 0.007s
```

**示例 3：**

```sql
select avg(temperature),
       sin(avg(temperature)),
       avg(temperature) + 1,
       -sum(hardware),
       avg(temperature) + sum(hardware) as custom_sum
from root.ln.wf01.wt01
GROUP BY([10, 90), 10ms);
```

运行结果：

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
