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

# 基础函数

## 1. 比较函数和运算符

### 1.1 基本比较运算符

比较运算符用于比较两个值，并返回比较结果（true或false）。

| 运算符 | 描述       |
| ------ | ---------- |
| <      | 小于       |
| >      | 大于       |
| <=     | 小于或等于 |
| >=     | 大于或等于 |
| =      | 等于       |
| <>     | 不等于     |
| !=     | 不等于     |

#### 1.1.1 比较规则：

1. 所有类型都可以与自身进行比较
2. 数值类型（INT32, INT64, FLOAT, DOUBLE, TIMESTAMP）之间可以相互比较
3. 字符类型（STRING, TEXT）之间也可以相互比较
4. 除上述规则外的类型进行比较时，均会报错。

### 1.2 BETWEEN 运算符

1. `BETWEEN` 操作符用于判断一个值是否在指定的范围内。
2. `NOT BETWEEN`操作符用于判断一个值是否不在指定范围内。
3. `BETWEEN` 和 `NOT BETWEEN` 操作符可用于评估任何可排序的类型。
4. `BETWEEN` 和 `NOT BETWEEN` 的值、最小值和最大值参数必须是同一类型，否则会报错。

**语法**：

```SQL
 value BETWEEN min AND max：
 value NOT BETWEEN min AND max：
```

示例 1 ：BETWEEN

```SQL
-- 查询 temperature 在 85.0 和 90.0 之间的记录
SELECT * FROM table1 WHERE temperature BETWEEN 85.0 AND 90.0;
```

示例 2 ：NOT BETWEEN

```SQL
3-- 查询 humidity 不在 35.0 和 40.0 之间的记录
SELECT * FROM table1 WHERE humidity NOT BETWEEN 35.0 AND 40.0;
```

### 1.3 IS NULL 运算符

1. `IS NULL` 和 `IS NOT NULL` 运算符用于判断一个值是否为 NULL。
2. 这两个运算符适用于所有数据类型。

示例1：查询 temperature 为 NULL 的记录

```SQL
SELECT * FROM table1 WHERE temperature IS NULL;
```

示例2：查询 humidity 不为 NULL 的记录

```SQL
SELECT * FROM table1 WHERE humidity IS NOT NULL;
```

### 1.4 IN 运算符

1. `IN` 操作符可用于 `WHERE` 子句中，比较一列中的一些值。
2. 这些值可以由静态数组、标量表达式。

**语法：**

```SQL
... WHERE column [NOT] IN ('value1','value2', expression1)
```

示例 1：静态数组：查询 region 为 '北京' 或 '上海' 的记录

```SQL
SELECT * FROM table1 WHERE region IN ('北京', '上海');
--等价于
SELECT * FROM region WHERE name = '北京' OR name = '上海';
```

示例 2：标量表达式：查询 temperature 在特定值中的记录

```SQL
SELECT * FROM table1 WHERE temperature IN (85.0, 90.0);
```

示例 3：查询 region 不为 '北京' 或 '上海' 的记录

```SQL
SELECT * FROM table1 WHERE region NOT IN ('北京', '上海');
```

### 1.5 GREATEST 和 LEAST

`Greatest` 函数用于返回参数列表中的最大值，`Least` 函数用于返回参数列表中的最小值，返回数据类型与输入类型相同。
1. 空值处理：若所有参数均为 NULL，则返回 NULL。
2. 参数要求：必须提供 至少 2 个参数。
3. 类型约束：仅支持 相同数据类型 的参数比较。
4. 支持类型： `BOOLEAN`、`FLOAT`、`DOUBLE`、`INT32`、`INT64`、`STRING`、`TEXT`、`TIMESTAMP`、`DATE`

**语法：**

```sql
  greatest(value1, value2, ..., valueN)
  least(value1, value2, ..., valueN)
```

**示例：**

```sql
-- 查询 table2 中 temperature 和 humidity 的最大记录
SELECT GREATEST(temperature,humidity) FROM table2;

-- 查询 table2 中 temperature 和 humidity 的最小记录
SELECT LEAST(temperature,humidity) FROM table2;
```
  

## 2. 聚合函数

### 2.1 概述

1. 聚合函数是多对一函数。它们对一组值进行聚合计算，得到单个聚合结果。
2. 除了 `COUNT()`之外，其他所有聚合函数都忽略空值，并在没有输入行或所有值为空时返回空值。 例如，`SUM()` 返回 null 而不是零，而 `AVG()` 在计数中不包括 null 值。

### 2.2 支持的聚合函数                          

| 函数名                   | 功能描述                                                                                                                                     | 允许的输入类型                                                                                 | 输出类型             |
|-----------------------|------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------|------------------|
| COUNT                 | 计算数据点数。                                                                                                                                  | 所有类型                                                                                    | INT64            |
| COUNT_IF              | COUNT_IF(exp) 用于统计满足指定布尔表达式的记录行数                                                                                                         | exp 必须是一个布尔类型的表达式，例如 count_if(temperature>20)                                           | INT64            |
| APPROX_COUNT_DISTINCT | APPROX_COUNT_DISTINCT(x[,maxStandardError]) 函数提供 COUNT(DISTINCT x) 的近似值，返回不同输入值的近似个数。                                 | `x`：待计算列，支持所有类型；<br> `maxStandardError`：指定该函数应产生的最大标准误差，取值范围[0.0040625, 0.26]，未指定值时默认0.023。 | INT64            |
| APPROX_MOST_FREQUENT | APPROX_MOST_FREQUENT(x, k, capacity) 函数用于近似计算数据集中出现频率最高的前 k 个元素。它返回一个JSON 格式的字符串，其中键是该元素的值，值是该元素对应的近似频率。（V 2.0.5.1 及以后版本支持）  | `x`：待计算列，支持 IoTDB 现有所有的数据类型；<br> `k`：返回出现频率最高的 k 个值；<br> `capacity`: 用于计算的桶的数量，跟内存占用相关：其值越大误差越小，但占用内存更大，反之capacity值越小误差越大，但占用内存更小。 | STRING   |
| SUM                   | 求和。                                                                                                                                      | INT32 INT64 FLOAT DOUBLE                                                                | DOUBLE           |
| AVG                   | 求平均值。                                                                                                                                    | INT32 INT64 FLOAT DOUBLE                                                                | DOUBLE           |
| MAX                   | 求最大值。                                                                                                                                    | 所有类型                                                                                    | 与输入类型一致          |
| MIN                   | 求最小值。                                                                                                                                    | 所有类型                                                                                    | 与输入类型一致          |
| FIRST                 | 求时间戳最小且不为 NULL 的值。                                                                                                                       | 所有类型                                                                                    | 与输入类型一致          |
| LAST                  | 求时间戳最大且不为 NULL 的值。                                                                                                                       | 所有类型                                                                                    | 与输入类型一致          |
| STDDEV                | STDDEV_SAMP 的别名，求样本标准差。                                                                                                                  | INT32 INT64 FLOAT DOUBLE                                                                | DOUBLE           |
| STDDEV_POP            | 求总体标准差。                                                                                                                                  | INT32 INT64 FLOAT DOUBLE                                                                | DOUBLE           |
| STDDEV_SAMP           | 求样本标准差。                                                                                                                                  | INT32 INT64 FLOAT DOUBLE                                                                | DOUBLE           |
| VARIANCE              | VAR_SAMP 的别名，求样本方差。                                                                                                                      | INT32 INT64 FLOAT DOUBLE                                                                | DOUBLE           |
| VAR_POP               | 求总体方差。                                                                                                                                   | INT32 INT64 FLOAT DOUBLE                                                                | DOUBLE           |
| VAR_SAMP              | 求样本方差。                                                                                                                                   | INT32 INT64 FLOAT DOUBLE                                                                | DOUBLE           |
| EXTREME               | 求具有最大绝对值的值。如果正值和负值的最大绝对值相等，则返回正值。                                                                                                        | INT32 INT64 FLOAT DOUBLE                                                                | 与输入类型一致          |
| MODE                  | 求众数。注意： 1.输入序列的不同值个数过多时会有内存异常风险; 2.如果所有元素出现的频次相同，即没有众数，则随机返回一个元素; 3.如果有多个众数，则随机返回一个众数； 4. NULL 值也会被统计频次，所以即使输入序列的值不全为 NULL，最终结果也可能为 NULL。 | 所有类型                                                                                    | 与输入类型一致          |
| MAX_BY                | MAX_BY(x, y) 求二元输入 x 和 y 在 y 最大时对应的 x 的值。MAX_BY(time, x) 返回 x 取最大值时对应的时间戳。                                                               | x 和 y 可以是任意类型                                                                           | 与第一个输入 x 的数据类型一致 |
| MIN_BY                | MIN_BY(x, y) 求二元输入 x 和 y 在 y 最小时对应的 x 的值。MIN_BY(time, x) 返回 x 取最小值时对应的时间戳。                                                               | x 和 y 可以是任意类型                                                                           | 与第一个输入 x 的数据类型一致 |
| FIRST_BY              | FIRST_BY(x, y) 求当 y 为第一个不为 NULL 的值时，同一行里对应的 x 值。                                                                                         | x 和 y 可以是任意类型                                                                           | 与第一个输入 x 的数据类型一致 |
| LAST_BY               | LAST_BY(x, y) 求当 y 为最后一个不为 NULL 的值时，同一行里对应的 x 值。                                                                                         | x 和 y 可以是任意类型                                                                           | 与第一个输入 x 的数据类型一致 |


### 2.3 示例

#### 2.3.1 示例数据

在[示例数据页面](../Reference/Sample-Data.md)中，包含了用于构建表结构和插入数据的SQL语句，下载并在IoTDB CLI中执行这些语句，即可将数据导入IoTDB，您可以使用这些数据来测试和执行示例中的SQL语句，并获得相应的结果。

#### 2.3.2 Count

统计的是整张表的行数和 `temperature` 列非 NULL 值的数量。

```SQL
IoTDB> select count(*), count(temperature) from table1;
```

执行结果如下：

> 注意：只有COUNT函数可以与*一起使用，否则将抛出错误。

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

统计 `table2` 中 到达时间 `arrival_time` 不是 `null` 的记录行数。

```sql
IoTDB> select count_if(arrival_time is not null) from table2;
```

执行结果如下：

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

查询 `table1` 中 `temperature` 列不同值的个数。

```sql
IoTDB> SELECT COUNT(DISTINCT temperature) as origin, APPROX_COUNT_DISTINCT(temperature) as approx FROM table1;
IoTDB> SELECT COUNT(DISTINCT temperature) as origin, APPROX_COUNT_DISTINCT(temperature,0.006) as approx FROM table1;
```

执行结果如下：

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

查询 `table1` 中 `temperature` 列出现频次最高的2个值

```sql
IoTDB> select approx_most_frequent(temperature,2,100) as topk from table1;
```

执行结果如下：

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

查询`temperature`列、`humidity`列时间戳最小且不为 NULL 的值。

```SQL
IoTDB> select first(temperature), first(humidity) from table1;
```

执行结果如下：

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

查询`temperature`列、`humidity`列时间戳最大且不为 NULL 的值。

```SQL
IoTDB> select last(temperature), last(humidity) from table1;
```

执行结果如下：

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

查询 `temperature` 列中非 NULL 且时间戳最小的行的 `time` 值，以及 `temperature` 列中非 NULL 且时间戳最小的行的 `humidity` 值。

```SQL
IoTDB> select first_by(time, temperature), first_by(humidity, temperature) from table1;
```

执行结果如下：

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

查询`temperature` 列中非 NULL 且时间戳最大的行的 `time` 值，以及 `temperature` 列中非 NULL 且时间戳最大的行的 `humidity` 值。

```SQL
IoTDB> select last_by(time, temperature), last_by(humidity, temperature) from table1;
```

执行结果如下：

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

查询`temperature` 列中最大值所在行的 `time` 值，以及`temperature` 列中最大值所在行的 `humidity` 值。

```SQL
IoTDB> select max_by(time, temperature), max_by(humidity, temperature) from table1;
```

执行结果如下：

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

查询`temperature` 列中最小值所在行的 `time` 值，以及`temperature` 列中最小值所在行的 `humidity` 值。

```SQL
select min_by(time, temperature), min_by(humidity, temperature) from table1;
```

执行结果如下：

```SQL
+-----------------------------+-----+
|                        _col0|_col1|
+-----------------------------+-----+
|2024-11-29T10:00:00.000+08:00| null|
+-----------------------------+-----+
Total line number = 1
It costs 0.244s
```


## 3. 逻辑运算符

### 3.1 概述

逻辑运算符用于组合条件或否定条件，返回布尔结果（`true` 或 `false`）。

以下是常用的逻辑运算符及其描述：

| 运算符 | 描述                          | 示例    |
| ------ | ----------------------------- | ------- |
| AND    | 仅当两个值都为 true 时为 true | a AND b |
| OR     | 任一值为 true 时为 true       | a OR b  |
| NOT    | 当值为 false 时为 true        | NOT a   |

### 3.2 NULL 对逻辑运算符的影响

#### 3.2.1 AND 运算符

- 如果表达式的一侧或两侧为 `NULL`，结果可能为 `NULL`。
- 如果 `AND` 运算符的一侧为 `FALSE`，则表达式结果为 `FALSE`。

示例：

```SQL
NULL AND true -- null
NULL AND false -- false
NULL AND NULL -- null
```

#### 3.2.2 OR 运算符

- 如果表达式的一侧或两侧为 `NULL`，结果可能为 `NULL`。
- 如果 `OR` 运算符的一侧为 `TRUE`，则表达式结果为 `TRUE`。

示例：

```SQL
NULL OR NULL -- null
NULL OR false -- null
NULL OR true -- true
```

##### 3.2.2.1 真值表

以下真值表展示了 `NULL` 在 `AND` 和 `OR` 运算符中的处理方式：

| a     | b     | a AND b | a OR b |
| ----- | ----- | ------- | ------ |
| TRUE  | TRUE  | TRUE    | TRUE   |
| TRUE  | FALSE | FALSE   | TRUE   |
| TRUE  | NULL  | NULL    | TRUE   |
| FALSE | TRUE  | FALSE   | TRUE   |
| FALSE | FALSE | FALSE   | FALSE  |
| FALSE | NULL  | FALSE   | NULL   |
| NULL  | TRUE  | NULL    | TRUE   |
| NULL  | FALSE | FALSE   | NULL   |
| NULL  | NULL  | NULL    | NULL   |

#### 3.2.3 NOT 运算符

NULL 的逻辑否定仍然是 NULL

示例：

```SQL
NOT NULL -- null
```

##### 3.2.3.1真值表

以下真值表展示了 `NULL` 在 `NOT` 运算符中的处理方式：

| a     | NOT a |
| ----- | ----- |
| TRUE  | FALSE |
| FALSE | TRUE  |
| NULL  | NULL  |


## 4. 日期和时间函数和运算符

### 4.1 now() -> Timestamp

返回当前时间的时间戳。

### 4.2 date_bin(interval, Timestamp[, Timestamp]) -> Timestamp

`date_bin` 函数是一种用于处理时间数据的函数，作用是将一个时间戳（Timestamp）舍入到指定的时间间隔（interval）的边界上。

**语法：**

```SQL
-- 从时间戳为 0 开始计算时间间隔，返回最接近指定时间戳的时间间隔起始点
date_bin(interval,source)

-- 从时间戳为 origin 开始计算时间间隔，返回最接近指定时间戳的时间间隔起始点
date_bin(interval,source,origin)

-- interval支持的时间单位有:
-- 年y、月mo、周week、日d、小时h、分钟M、秒s、毫秒ms、微秒µs、纳秒ns。
-- source必须为时间戳类型。
```

**参数：**

| 参数     | 含义                                                         |
| -------- | ------------------------------------------------------------ |
| interval | 时间间隔支持的时间单位有：年y、月mo、周week、日d、小时h、分钟M、秒s、毫秒ms、微秒µs、纳秒ns。 |
| source   | 待计算时间列，也可以是表达式。必须为时间戳类型。             |
| origin   | 起始时间戳                                                   |

#### 4.2.1 语法约定：

1. 不传入 `origin` 时，起始时间戳从 1970-01-01T00:00:00Z 开始计算（北京时间为 1970-01-01 08:00:00）。
2. `interval` 为一个非负数，且必须带上时间单位。`interval` 为 0ms 时，不进行计算，直接返回 `source`。
3. 当传入 `origin` 或 `source` 为负时，表示纪元时间之前的某个时间点，`date_bin` 会正常计算并返回与该时间点相关的时间段。
4. 如果 `source` 中的值为 `null`，则返回 `null`。
5. 不支持月份和非月份时间单位混用，例如 `1 MONTH 1 DAY`，这种时间间隔有歧义。

> 假设是起始时间是 2000 年 4 月 30 日进行计算，那么在一个时间间隔后，如果是先算 DAY再算MONTH，则会得到 2000 年 6 月 1 日，如果先算 MONTH 再算 DAY 则会得到 2000 年 5 月 31 日，二者得出的时间日期不同。

#### 4.2.2 示例

##### 示例数据

在[示例数据页面](../Reference/Sample-Data.md)中，包含了用于构建表结构和插入数据的SQL语句，下载并在IoTDB CLI中执行这些语句，即可将数据导入IoTDB，您可以使用这些数据来测试和执行示例中的SQL语句，并获得相应的结果。

示例 1：不指定起始时间戳

```SQL
SELECT 
    time,
    date_bin(1h,time) as time_bin
FROM 
    table1;
```

结果：

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

示例 2：指定起始时间戳

```SQL
SELECT 
    time,
    date_bin(1h, time, 2024-11-29T18:30:00.000) as time_bin
FROM 
    table1;
```

结果：

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

示例 3：`origin` 为负数的情况

```SQL
SELECT 
    time,
    date_bin(1h, time, 1969-12-31 00:00:00.000) as time_bin
FROM 
    table1;
```

结果：

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

示例 4：`interval` 为 0 的情况

```SQL
SELECT 
    time,
    date_bin(0ms, time) as time_bin
FROM 
    table1;
```

结果：

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

示例 5：`source` 为 null 的情况

```SQL
SELECT
    arrival_time,
    date_bin(1h,arrival_time) as time_bin
FROM
    table1;
```

结果：

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

### 4.3 Extract 函数

该函数用于提取日期对应部分的值。（V2.0.6 版本起支持）

#### 4.3.1 语法定义

```SQL
EXTRACT (identifier FROM expression)
```
* 参数说明
  * **expression**： `TIMESTAMP` 类型或时间常量
  * **identifier** ：取值范围及对应的返回值见下表
  
    | 取值范围                 | 返回值类型  | 返回值范围  |
    | -------------------------- | ------------- | ------------- |
    | `YEAR`               | `INT64` | `/`     |
    | `QUARTER`            | `INT64` | `1-4`   |
    | `MONTH`              | `INT64` | `1-12`  |
    | `WEEK`               | `INT64` | `1-53`  |
    | `DAY_OF_MONTH (DAY)` | `INT64` | `1-31`  |
    | `DAY_OF_WEEK (DOW)`  | `INT64` | `1-7`   |
    | `DAY_OF_YEAR (DOY)`  | `INT64` | `1-366` |
    | `HOUR`               | `INT64` | `0-23`  |
    | `MINUTE`             | `INT64` | `0-59`  |
    | `SECOND`             | `INT64` | `0-59`  |
    | `MS`                 | `INT64` | `0-999` |
    | `US`                 | `INT64` | `0-999` |
    | `NS`                 | `INT64` | `0-999` |


#### 4.3.2 使用示例

以[示例数据](../Reference/Sample-Data.md)中的 table1 为源数据，查询某段时间每天前12个小时的温度平均值

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

`Format` 函数介绍：[Format 函数](../SQL-Manual/Basis-Function_timecho.md#_7-2-format-函数)

`Date_bin` 函数介绍：[Date_bin 函数](../SQL-Manual/Basis-Function_timecho.md#_4-2-date-bin-interval-timestamp-timestamp-timestamp)


## 5. 数学函数和运算符

### 5.1 数学运算符

| **运算符** | **描述**                 |
| ---------- | ------------------------ |
| +          | 加法                     |
| -          | 减法                     |
| *          | 乘法                     |
| /          | 除法（整数除法执行截断） |
| %          | 模（余数）               |
| -          | 取反                     |

### 5.2 数学函数

| 函数名               | 描述                                                                                                                                                         | 输入                               | 输出                   | 用法       |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------| ---------------------- | ---------- |
| sin               | 正弦函数                                                                                                                                                       | double、float、INT64、INT32         | double                 | sin(x)     |
| cos               | 余弦函数                                                                                                                                                       | double、float、INT64、INT32         | double                 | cos(x)     |
| tan               | 正切函数                                                                                                                                                       | double、float、INT64、INT32         | double                 | tan(x)     |
| asin              | 反正弦函数                                                                                                                                                      | double、float、INT64、INT32         | double                 | asin(x)    |
| acos              | 反余弦函数                                                                                                                                                      | double、float、INT64、INT32         | double                 | acos(x)    |
| atan              | 反正切函数                                                                                                                                                      | double、float、INT64、INT32         | double                 | atan(x)    |
| sinh              | 双曲正弦函数                                                                                                                                                     | double、float、INT64、INT32         | double                 | sinh(x)    |
| cosh              | 双曲余弦函数                                                                                                                                                     | double、float、INT64、INT32         | double                 | cosh(x)    |
| tanh              | 双曲正切函数                                                                                                                                                     | double、float、INT64、INT32         | double                 | tanh(x)    |
| degrees           | 将弧度角 x 转换为度                                                                                                                                                | double、float、INT64、INT32         | double                 | degrees(x) |
| radians           | 将度转换为弧度                                                                                                                                                    | double、float、INT64、INT32         | double                 | radians(x) |
| abs               | 绝对值                                                                                                                                                        | double、float、INT64、INT32         | 返回与输入类型相同的值 | abs(x)     |
| sign              | 返回 x 的符号函数，即：如果参数为 0，则返回 0，如果参数大于 0，则返回 1，如果参数小于 0，则返回 -1。对于 double/float 类型的参数，函数还会返回：如果参数为 NaN，则返回 NaN，如果参数为 +Infinity，则返回 1.0，如果参数为 -Infinity，则返回 -1.0。 | double、float、INT64、INT32         | 返回与输入类型相同的值 | sign(x)    |
| ceil              | 返回 x 向上取整到最近的整数。                                                                                                                                           | double、float、INT64、INT32         | double                 | ceil(x)    |
| floor             | 返回 x 向下取整到最近的整数。                                                                                                                                           | double、float、INT64、INT32         | double                 | floor(x)   |
| exp               | 返回欧拉数 e 的 x 次幂。                                                                                                                                            | double、float、INT64、INT32         | double                 | exp(x)     |
| ln                | 返回 x 的自然对数。                                                                                                                                                | double、float、INT64、INT32         | double                 | ln(x)      |
| log10             | 返回 x 的以 10 为底的对数。                                                                                                                                          | double、float、INT64、INT32         | double                 | log10(x)   |
| round             | 返回 x 四舍五入到最近的整数。                                                                                                                                           | double、float、INT64、INT32         | double                 | round(x)   |
| round             | 返回 x 四舍五入到 d 位小数。                                                                                                                                          | double、float、INT64、INT32         | double                      | round(x, d)             |
| sqrt              | 返回 x 的平方根。                                                                                                                                                 | double、float、INT64、INT32         | double                 | sqrt(x)    |
| e                 | 自然指数                                                                                                                                                       |                                  | double                 | e()        |
| pi                | π                                                                                                                                                          |                                  | double                 | pi()       |


## 6. 位运算函数

> V 2.0.6 版本起支持

示例原始数据如下：

```SQL
IoTDB:database1> select * from bit_table
+-----------------------------+---------+------+-----+
|                         time|device_id|length|width|
+-----------------------------+---------+------+-----+
|2025-10-29T15:59:42.957+08:00|       d1|    14|   12|
|2025-10-29T15:58:59.399+08:00|       d3|    15|   10|
|2025-10-29T15:59:32.769+08:00|       d2|    13|   12|
+-----------------------------+---------+------+-----+

--建表语句
CREATE TABLE bit_table(time TIMESTAMP TIME, device_id STRING TAG, length INT32 FIELD, width INT32 FIELD);

--写入数据
INSERT INTO bit_table values(2025-10-29 15:59:42.957, 'd1', 14, 12),(2025-10-29 15:58:59.399, 'd3', 15, 10),(2025-10-29 15:59:32.769, 'd2', 13, 12);
```

### 6.1 bit\_count(num, bits)

`bit_count(num, bits)` 函数用于统计整数 `num`在指定位宽 `bits`下的二进制表示中 1 的个数。

#### 6.1.1 语法定义

```SQL
bit_count(num, bits) -> INT64 --返回结果类型为 Int64
```

* 参数说明
  * **​num：​**任意整型数值（int32 或者 int64）
  * **​bits：​**整型数值，取值范围为2\~64

注意：如果 bits 位数不够表示 num，会报错（此处是​**有符号补码**​）：`Argument exception, the scalar function num must be representable with the bits specified. [num] cannot be represented with [bits] bits.`

* 调用方式
  * 两个具体数值：`bit_count(9, 64)`
  * 列与数值：`bit_count(column1, 64)`
  * 两列之间：`bit_count(column1, column2)`

#### 6.1.2 使用示例

```SQL
-- 两个具体数值
IoTDB:database1> select distinct bit_count(2,8) from bit_table
+-----+
|_col0|
+-----+
|    1|
+-----+
-- 两个具体数值
IoTDB:database1> select distinct bit_count(-5,8) from bit_table
+-----+
|_col0|
+-----+
|    7|
+-----+
--列与数值
IoTDB:database1> select length,bit_count(length,8) from bit_table
+------+-----+
|length|_col1|
+------+-----+
|    14|    3|
|    15|    4|
|    13|    3|
+------+-----+
--bits位数不够
IoTDB:database1> select length,bit_count(length,2) from bit_table
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701: Argument exception, the scalar function num must be representable with the bits specified. 13 cannot be represented with 2 bits.
```

### 6.2 bitwise\_and(x, y)

`bitwise_and(x, y)`函数基于二进制补码表示法，对两个整数 x 和 y 的每一位进行逻辑与操作，并返回其按位与（bitwise AND）的运算结果。

#### 6.2.1 语法定义

```SQL
bitwise_and(x, y) -> INT64 --返回结果类型为 Int64
```

* 参数说明
  * ​**x, y**​: 必须是 Int32 或 Int64 数据类型的整数值
* 调用方式
  * 两个具体数值：`bitwise_and(19, 25)`
  * 列与数值：`bitwise_and(column1, 25)`
  * 两列之间：`bitwise_and(column1, column2)`

#### 6.2.2 使用示例

```SQL
--两个具体数值
IoTDB:database1> select distinct bitwise_and(19,25) from bit_table
+-----+
|_col0|
+-----+
|   17|
+-----+
--列与数值
IoTDB:database1> select length, bitwise_and(length,25) from bit_table
+------+-----+
|length|_col1|
+------+-----+
|    14|    8|
|    15|    9|
|    13|    9|
+------+-----+
--俩列之间
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

`bitwise_not(x)` 函数基于二进制补码表示法，对整数 x 的每一位进行逻辑非操作，并返回其按位取反（bitwise NOT）的运算结果。

#### 6.3.1 语法定义

```SQL
bitwise_not(x) -> INT64 --返回结果类型为 Int64
```

* 参数说明
  * ​**x**​: 必须是 Int32 或 Int64 数据类型的整数值
* 调用方式
  * 具体数值：`bitwise_not(5)`
  * 单列操作：`bitwise_not(column1)`

#### 6.3.2 使用示例

```SQL
-- 具体数值
IoTDB:database1> select distinct bitwise_not(5) from bit_table
+-----+
|_col0|
+-----+
|   -6|
+-----+
-- 单列
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

`bitwise_or(x,y)` 函数基于二进制补码表示法，对两个整数 x 和 y 的每一位进行逻辑或操作，并返回其按位或（bitwise OR）的运算结果。

#### 6.4.1 语法定义

```SQL
bitwise_or(x, y) -> INT64 --返回结果类型为 Int64
```

* 参数说明
  * ​**x, y**​: 必须是 Int32 或 Int64 数据类型的整数值
* 调用方式
  * 两个具体数值：`bitwise_or(19, 25)`
  * 列与数值：`bitwise_or(column1, 25)`
  * 两列之间：`bitwise_or(column1, column2)`

#### 6.4.2 使用示例

```SQL
-- 两个具体数值
IoTDB:database1> select distinct bitwise_or(19,25) from bit_table
+-----+
|_col0|
+-----+
|   27|
+-----+
-- 列与数值
IoTDB:database1> select length,bitwise_or(length,25) from bit_table
+------+-----+
|length|_col1|
+------+-----+
|    14|   31|
|    15|   31|
|    13|   29|
+------+-----+
-- 两列之间
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

bitwise\_xor(x,y) 函数基于二进制补码表示法，对两个整数 x 和 y 的每一位进行逻辑异或操作，并返回其按位异或（bitwise XOR）的运算结果。异或规则：相同为0，不同为1。

#### 6.5.1 语法定义

```SQL
bitwise_xor(x, y) -> INT64 --返回结果类型为 Int64
```

* 参数说明
  * ​**x, y**​: 必须是 Int32 或 Int64 数据类型的整数值
* 调用方式
  * 两个具体数值：`bitwise_xor(19, 25)`
  * 列与数值：`bitwise_xor(column1, 25)`
  * 两列之间：`bitwise_xor(column1, column2)`

#### 6.5.2 使用示例

```SQL
-- 两个具体数值
IoTDB:database1> select distinct bitwise_xor(19,25) from bit_table
+-----+
|_col0|
+-----+
|   10|
+-----+
-- 列与数值
IoTDB:database1> select length,bitwise_xor(length,25) from bit_table
+------+-----+
|length|_col1|
+------+-----+
|    14|   23|
|    15|   22|
|    13|   20|
+------+-----+
-- 两列之间
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

`bitwise_left_shift(value, shift)` 函数返回将整数 `value`的二进制表示左移 `shift`位后的结果。左移操作将二进制位向高位方向移动，右侧空出的位用 0 填充，左侧溢出的位直接丢弃。等价于： `value << shift`。

#### 6.6.1 语法定义

```SQL
bitwise_left_shift(value, shift) -> [same as value] --返回结果类型与value数据类型相同
```

* 参数说明
  * ​**value**​: 要左移的整数值，必须是 Int32 或 Int64 数据类型
  * ​**shift**​: 左移的位数，必须是 Int32 或 Int64 数据类型
* 调用方式
  * 两个具体数值：`bitwise_left_shift(1, 2)`
  * 列与数值：`bitwise_left_shift(column1, 2)`
  * 两列之间：`bitwise_left_shift(column1, column2)`

#### 6.6.2 使用示例

```SQL
--两个具体数值
IoTDB:database1> select distinct bitwise_left_shift(1,2) from bit_table
+-----+
|_col0|
+-----+
|    4|
+-----+
-- 列与数值
IoTDB:database1> select length, bitwise_left_shift(length,2) from bit_table
+------+-----+
|length|_col1|
+------+-----+
|    14|   56|
|    15|   60|
|    13|   52|
+------+-----+
-- 两列之间
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

`bitwise_right_shift(value, shift)`函数返回将整数 `value`的二进制表示逻辑右移（无符号右移） `shift`位后的结果。逻辑右移操作将二进制位向低位方向移动，左侧空出的高位用 0 填充，右侧溢出的低位直接丢弃。

#### 6.7.1 语法定义

```SQL
bitwise_right_shift(value, shift) -> [same as value] --返回结果类型与value数据类型相同
```

* 参数说明
  * ​**value**​: 要右移的整数值，必须是 Int32 或 Int64 数据类型
  * ​**shift**​: 右移的位数，必须是 Int32 或 Int64 数据类型
* 调用方式
  * 两个具体数值：`bitwise_right_shift(8, 3)`
  * 列与数值：`bitwise_right_shift(column1, 3)`
  * 两列之间：`bitwise_right_shift(column1, column2)`

#### 6.7.2 使用示例

```SQL
--两个具体数值
IoTDB:database1> select distinct bitwise_right_shift(8,3) from bit_table
+-----+
|_col0|
+-----+
|    1|
+-----+
--列与数值
IoTDB:database1> select length, bitwise_right_shift(length,3) from bit_table
+------+-----+
|length|_col1|
+------+-----+
|    14|    1|
|    15|    1|
|    13|    1|
+------+-----+
--两列之间
IoTDB:database1> select length, width, bitwise_right_shift(length,width) from bit_table
+------+-----+-----+
|length|width|_col2|
+------+-----+-----+
|    14|   12|    0|
|    15|   10|    0|
|    13|   12|    0|
```

### 6.8 bitwise\_right\_shift\_arithmetic(value, shift)

`bitwise_right_shift_arithmetic(value, shift)`函数返回将整数 `value`的二进制表示算术右移 `shift`位后的结果。算术右移操作将二进制位向低位方向移动，右侧溢出的低位直接丢弃，左侧空出的高位用符号位填充（正数补0，负数补1），以保持数值的符号不变。

#### 6.8.1 语法定义

```SQL
bitwise_right_shift_arithmetic(value, shift) -> [same as value]--返回结果类型与value数据类型相同
```

* 参数说明
  * ​**value**​: 要右移的整数值，必须是 Int32 或 Int64 数据类型
  * ​**shift**​: 右移的位数，必须是 Int32 或 Int64 数据类型
* 调用方式：
  * 两个具体数值：`bitwise_right_shift_arithmetic(12, 2)`
  * 列与数值：`bitwise_right_shift_arithmetic(column1, 64)`
  * 两列之间：`bitwise_right_shift_arithmetic(column1, column2)`

#### 6.8.2 使用示例

```SQL
--两个具体数值
IoTDB:database1> select distinct bitwise_right_shift_arithmetic(12,2) from bit_table
+-----+
|_col0|
+-----+
|    3|
+-----+
-- 列与数值
IoTDB:database1> select length, bitwise_right_shift_arithmetic(length,3) from bit_table
+------+-----+
|length|_col1|
+------+-----+
|    14|    1|
|    15|    1|
|    13|    1|
+------+-----+
--两列之间
IoTDB:database1> select length, width, bitwise_right_shift_arithmetic(length,width) from bit_table
+------+-----+-----+
|length|width|_col2|
+------+-----+-----+
|    14|   12|    0|
|    15|   10|    0|
|    13|   12|    0|
+------+-----+-----+
```

## 7. 条件表达式

### 7.1 CASE 表达式

CASE 表达式有两种形式：简单形式、搜索形式

#### 7.1.1 简单形式

简单形式从左到右搜索每个值表达式，直到找到一个与表达式相等的值：

```SQL
CASE expression
    WHEN value THEN result
    [ WHEN ... ]
    [ ELSE result ]
END
```

如果找到匹配的值，则返回相应的结果。如果没有找到匹配项，则返回 ELSE 子句中的结果（如果存在），否则返回 null。例如：

```SQL
SELECT a,       
       CASE a           
           WHEN 1 THEN 'one'
           WHEN 2 THEN 'two'
           ELSE 'many'
       END
```

#### 7.1.2 搜索形式

搜索形式从左到右评估每个布尔条件，直到找到一个为真的条件，并返回相应的结果：

```SQL
CASE
    WHEN condition THEN result
    [ WHEN ... ]
    [ ELSE result ]
END
```

如果没有条件为真，则返回 ELSE 子句中的结果（如果存在），否则返回 null。例如：

```SQL
SELECT a, b,       
       CASE          
           WHEN a = 1 THEN 'aaa'
           WHEN b = 2 THEN 'bbb'
           ELSE 'ccc'
       END
```

### 7.2 COALESCE 函数

返回参数列表中的第一个非空值。

```SQL
coalesce(value1, value2[, ...])
```

## 8. 转换函数

### 8.1 转换函数

#### 8.1.1 cast(value AS type) → type

1. 显式地将一个值转换为指定类型。
2. 可以用于将字符串（varchar）转换为数值类型，或数值转换为字符串类型，V2.0.8 版本起支持 OBJECT 类型强转成 STRING 类型。
3. 如果转换失败，将抛出运行时错误。

示例：

```SQL
SELECT *
  FROM table1
  WHERE CAST(time AS DATE) 
  IN (CAST('2024-11-27' AS DATE), CAST('2024-11-28' AS DATE));
```

#### 8.1.2 try_cast(value AS type) → type

1. 与 `cast()` 类似。
2. 如果转换失败，则返回 `null`。

示例：

```SQL
SELECT *
  FROM table1
  WHERE try_cast(time AS DATE) 
  IN (try_cast('2024-11-27' AS DATE), try_cast('2024-11-28' AS DATE));
```

### 8.2 Format 函数
该函数基于指定的格式字符串与输入参数，生成并返回格式化后的字符串输出。其功能与 Java 语言中的`String.format` 方法及 C 语言中的`printf`函数相类似，支持开发者通过占位符语法构建动态字符串模板，其中预设的格式标识符将被传入的对应参数值精准替换，最终形成符合特定格式要求的完整字符串。

#### 8.2.1 语法介绍

```SQL
format(pattern,...args) -> String
```

**参数定义**

* `pattern`: 格式字符串，可包含静态文本及一个或多个格式说明符（如 `%s`, `%d` 等），或任意返回类型为 `STRING/TEXT` 的表达式。
* `args`: 用于替换格式说明符的输入参数。需满足以下条件：
  * 参数数量 ≥ 1
  * 若存在多个参数，以逗号`,`分隔（如 `arg1,arg2`）
  * 参数总数可多于 `pattern` 中的占位符数量，但不可少于，否则触发异常

**返回值**

* 类型为 `STRING` 的格式化结果字符串

#### 8.2.2 使用示例

1. 格式化浮点数

```SQL
IoTDB:database1> select format('%.5f',humidity) from table1 where humidity = 35.4
+--------+
|   _col0|
+--------+
|35.40000|
+--------+
```

2. 格式化整数

```SQL
IoTDB:database1> select format('%03d',8) from table1 limit 1
+-----+
|_col0|
+-----+
|  008|
+-----+
```

3. 格式化日期和时间戳

* Locale-specific日期

```SQL
IoTDB:database1> SELECT format('%1$tA, %1$tB %1$te, %1$tY', 2024-01-01) from table1 limit 1
+--------------------+
|               _col0|
+--------------------+
|星期一, 一月 1, 2024|
+--------------------+
```

* 去除时区信息

```SQL
IoTDB:database1> SELECT format('%1$tY-%1$tm-%1$td %1$tH:%1$tM:%1$tS.%1$tL', 2024-01-01T00:00:00.000+08:00) from table1 limit 1
+-----------------------+
|                  _col0|
+-----------------------+
|2024-01-01 00:00:00.000|
+-----------------------+
```

* 获取秒级时间戳精度

```SQL
IoTDB:database1> SELECT format('%1$tF %1$tT', 2024-01-01T00:00:00.000+08:00) from table1 limit 1
+-------------------+
|              _col0|
+-------------------+
|2024-01-01 00:00:00|
+-------------------+
```

* 日期符号说明如下

| **符号** | **​ 描述**                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 'H'            | 24 小时制的小时数，格式为两位数，必要时加上前导零，i.e. 00 - 23。                                                                                                                                                                                                                                                                                                                                                                                                |
| 'I'            | 12 小时制的小时数，格式为两位数，必要时加上前导零，i.e. 01 - 12。                                                                                                                                                                                                                                                                                                                                                                                                |
| 'k'            | 24 小时制的小时数，i.e. 0 - 23。                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 'l'            | 12 小时制的小时数，i.e. 1 - 12。                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 'M'            | 小时内的分钟，格式为两位数，必要时加上前导零，i.e. 00 - 59。                                                                                                                                                                                                                                                                                                                                                                                                     |
| 'S'            | 分钟内的秒数，格式为两位数，必要时加上前导零，i.e. 00 - 60（“60 ”是支持闰秒所需的特殊值）。                                                                                                                                                                                                                                                                                                                                                                    |
| 'L'            | 秒内毫秒，格式为三位数，必要时加前导零，i.e. 000 - 999。                                                                                                                                                                                                                                                                                                                                                                                                         |
| 'N'            | 秒内的纳秒，格式为九位数，必要时加前导零，i.e. 000000000 - 999999999。                                                                                                                                                                                                                                                                                                                                                                                           |
| 'p'            | 当地特定的[上午或下午](https://docs.oracle.com/en/java/javase/23/docs/api/java.base/java/text/DateFormatSymbols.html#getAmPmStrings())标记，小写，如 “am ”或 “pm”。使用转换前缀 “T ”会强制输出为大写。                                                                                                                                                                                                                                                        |
| 'z'            | 从格林尼治标准时间偏移的[RFC 822](http://www.ietf.org/rfc/rfc0822.txt)式数字时区，例如 -0800。该值将根据夏令时的需要进行调整。对于 long、[Long](https://docs.oracle.com/en/java/javase/23/docs/api/java.base/java/lang/Long.html)和[Date](https://docs.oracle.com/en/java/javase/23/docs/api/java.base/java/util/Date.html)，使用的时区是 Java 虚拟机此实例的[默认时区](https://docs.oracle.com/en/java/javase/23/docs/api/java.base/java/util/TimeZone.html#getDefault())。 |
| 'Z'            | 表示时区缩写的字符串。该值将根据夏令时的需要进行调整。对于 long、[Long](https://docs.oracle.com/en/java/javase/23/docs/api/java.base/java/lang/Long.html)和[Date](https://docs.oracle.com/en/java/javase/23/docs/api/java.base/java/util/Date.html)，使用的时区是此 Java 虚拟机实例的[默认时区](https://docs.oracle.com/en/java/javase/23/docs/api/java.base/java/util/TimeZone.html#getDefault())。Formatter 的时区将取代参数的时区（如果有）。                          |
| 's'            | 自 1970 年 1 月 1 日 00:00:00 UTC 开始的纪元起的秒数，i.e. Long.MIN\_VALUE/1000 至 Long.MAX\_VALUE/1000。                                                                                                                                                                                                                                                                                                                                                        |
| 'Q'            | 自 1970 年 1 月 1 日 00:00:00 UTC 开始的纪元起的毫秒数，i.e. Long.MIN\_VALUE 至 Long.MAX\_VALUE。                                                                                                                                                                                                                                                                                                                                                                |

* 用于格式化常见的日期/时间组成的转换字符说明如下

| **符号** | **描述**                                                                                                                                                           |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 'B'            | 特定于区域设置[的完整月份名称](https://docs.oracle.com/en/java/javase/23/docs/api/java.base/java/text/DateFormatSymbols.html#getMonths())，例如 “January”、“February”。 |
| 'b'            | 当地特定月份的缩写名称，如"1 月"、"2 月"。                                                                                                                               |
| 'h'            | 与"b "相同。                                                                                                                                                             |
| 'A'            | 一周中某一天在当地的全称，如"星期日"、"星期一"。                                                                                                                         |
| 'a'            | 当地特有的星期简短名称，例如"星期日"、"星期一                                                                                                                            |
| 'C'            | 四位数年份除以100，格式为两位数，必要时加上前导零，即00 - 99                                                                                                             |
| 'Y'            | 年份，格式为至少四位数，必要时加上前导零，例如0092相当于公历92年。                                                                                                       |
| 'y'            | 年份的最后两位数，格式为必要的前导零，即00 - 99。                                                                                                                        |
| 'j'            | 年号，格式为三位数，必要时加前导零，例如公历为001 - 366。                                                                                                                |
| 'm'            | 月份，格式为两位数，必要时加前导零，即01 - 13。                                                                                                                          |
| 'd'            | 月日，格式为两位数，必要时加前导零，即01 - 31                                                                                                                            |
| 'e'            | 月日，格式为两位数，即1 - 31。                                                                                                                                           |

4. 格式化字符串

```SQL
IoTDB:database1> SELECT format('The measurement status is :%s',status) FROM table2 limit 1
+-------------------------------+
|                          _col0|
+-------------------------------+
|The measurement status is :true|
+-------------------------------+
```

5. 格式化百分号

```SQL
IoTDB:database1> SELECT format('%s%%', 99.9) from table1 limit 1
+-----+
|_col0|
+-----+
|99.9%|
+-----+
```

#### 8.2.3 **格式转换失败场景说明**

1. 类型不匹配错误

* 时间戳类型冲突 若格式说明符中包含时间相关标记（如 `%Y-%m-%d`），但参数提供：
  * 非 `DATE`/`TIMESTAMP` 类型值
  * 或涉及日期细粒度单位（如 `%H` 小时、`%M` 分钟）时，参数仅支持 `TIMESTAMP` 类型，否则将抛出类型异常

```SQL
-- 示例1
IoTDB:database1> SELECT format('%1$tA, %1$tB %1$te, %1$tY', humidity) from table2 limit 1
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701: Invalid format string: %1$tA, %1$tB %1$te, %1$tY (IllegalFormatConversion: A != java.lang.Float)

-- 示例2
IoTDB:database1> SELECT format('%1$tY-%1$tm-%1$td %1$tH:%1$tM:%1$tS.%1$tL', humidity) from table1 limit 1
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701: Invalid format string: %1$tY-%1$tm-%1$td %1$tH:%1$tM:%1$tS.%1$tL (IllegalFormatConversion: Y != java.lang.Float)
```

* 浮点数类型冲突 若使用 `%f` 等浮点格式说明符，但参数提供非数值类型（如字符串、布尔值），将触发类型转换错误

```SQL
IoTDB:database1> select format('%.5f',status) from table1 where humidity = 35.4
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701: Invalid format string: %.5f (IllegalFormatConversion: f != java.lang.Boolean)
```

2. 参数数量不匹配错误

* 实际提供的参数数量 必须等于或大于 格式字符串中格式说明符的数量
* 若参数数量少于格式说明符数量，将抛出 `ArgumentCountMismatch` 异常

```SQL
IoTDB:database1> select format('%.5f %03d', humidity) from table1 where humidity = 35.4
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701: Invalid format string: %.5f %03d (MissingFormatArgument: Format specifier '%03d')
```

3. 无效调用错误

* 当函数参数满足以下任一条件时，视为非法调用：
  * 参数总数 小于 2（必须包含格式字符串及至少一个参数）
  * 格式字符串（`pattern`）类型非 `STRING/TEXT`

```SQL
-- 示例1
IoTDB:database1> select format('%s') from table1 limit 1
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701: Scalar function format must have at least two arguments, and first argument pattern must be TEXT or STRING type.

--示例2
IoTDB:database1> select format(123, humidity) from table1 limit 1
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701: Scalar function format must have at least two arguments, and first argument pattern must be TEXT or STRING type.
```



## 9. 字符串函数和操作符

### 9.1 字符串操作符

#### 9.1.1 || 操作符

`||` 操作符用于字符串连接，功能与 `concat` 函数相同。

#### 9.1.2 LIKE 语句

`LIKE` 语句用于模式匹配，具体用法在[模式匹配：LIKE](#1-like-运算符) 中有详细文档。

### 9.2 字符串函数

| 函数名      | 描述                                                                                                | 输入                                                                                                                                                              | 输出                                                         | 用法                                                         |
| ----------- |---------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------| ------------------------------------------------------------ | ------------------------------------------------------------ |
| length      | 返回字符串的字符长度，而不是字符数组的长度。                                                                            | 支持一个参数，类型可以是字符串或文本。**string**：要计算长度的字符串。                                                                                                                        | INT32                                                        | length(string)                                               |
| upper       | 将字符串中的字母转换为大写。                                                                                    | 支持一个参数，类型可以是字符串或文本。**string**：要计算长度的字符串。                                                                                                                        | String                                                       | upper(string)                                                |
| lower       | 将字符串中的字母转换为小写。                                                                                    | 支持一个参数，类型可以是字符串或文本。**string**：要计算长度的字符串。                                                                                                                        | String                                                       | lower(string)                                                |
| trim        | 从源字符串中删除指定的开头和/或结尾字符。                                                                             | 支持三个参数**specification（可选）**：指定从哪边去掉字符，可以是：`BOTH`：两边都去掉（默认）。`LEADING`：只去掉开头的字符。`TRAILING`：只去掉结尾的字符。**trimcharacter（可选）**：要去掉的字符，如果没指定，默认去掉空格。**string**：要处理的字符串。 | String                                                       | trim([ [ specification ] [ trimcharacter ] FROM ] string) 示例：`trim('!' FROM '!foo!');` —— `'foo'` |
| strpos      | 返回子字符串在字符串中第一次出现的起始位置。位置从 1 开始计数。如果未找到，返回 0。注意：起始位置是基于字符而不是字节数组确定的。                               | 仅支持两个参数，类型可以是字符串或文本。**sourceStr**：要搜索的字符串。**subStr**：要找的子字符串。                                                                                                   | INT32                                                        | strpos(sourceStr, subStr)                                    |
| starts_with | 测试子字符串是否是字符串的前缀。                                                                                  | 支持两个参数，类型可以是字符串或文本。**sourceStr**：要检查的字符串，类型可以是字符串或文本。**prefix**：前缀子字符串，类型可以是字符串或文本。                                                                             | Boolean                                                      | starts_with(sourceStr, prefix)                               |
| ends_with   | 测试字符串是否以指定的后缀结束。                                                                                  | 支持两个参数，类型可以是字符串或文本。**sourceStr**：要检查的字符串。**suffix**：后缀子字符串。                                                                                                     | Boolean                                                      | ends_with(sourceStr, suffix)                                 |
| concat      | 返回字符串 `string1`、`string2`、...、`stringN` 的连接结果。功能与连接操作符 `\|\|` 相同。                        | 至少两个参数，所有参数类型必须是字符串或文本。               | String                                                       | concat(str1, str2, ...) 或 str1 \|\| str2 ...                |
| strcmp      | 比较两个字符串的字母序。                                                                                      | 支持两个参数，两个参数类型必须是字符串或文本。**string1**：第一个要比较的字符串。**string2**：第二个要比较的字符串。                                                                                           | 返回一个整数值INT32如果 `str1 < str2`，返回 `-1`如果 `str1 = str2`，返回 `0`如果 `str1 > str2`，返回 `1`如果 `str1` 或 `str2` 为 `NULL`，返回 `NULL` | strcmp(str1, str2)                                           |
| replace     | 从字符串中删除所有 `search` 的实例。                                                                           | 支持两个参数，可以是字符串或文本类型。**string**：原始字符串，要从中删除内容的字符串。**search**：要删除的子字符串。                                                                                            | String                                                       | replace(string, string)                                      |
| replace     | 将字符串中所有 `search` 的实例替换为 `replace`。                                                                | 支持三个参数，可以是字符串或文本类型。**string**：原始字符串，要从中替换内容的字符串。**search**：要替换掉的子字符串。**replace**：用来替换的新字符串。                                                                     | String                                                       | replace(string, string, string)                              |
| substring   | 从指定位置提取字符到字符串末尾。需要注意的是，起始位置是基于字符而不是字节数组确定的。`start_index` 从 1 开始计数，长度从 `start_index` 位置计算。         | 支持两个参数**string**：要提取子字符串的源字符串，可以是字符串或文本类型。**start_index**：从哪个索引开始提取子字符串，索引从 1 开始计数。                                                                             | String：返回一个字符串，从 `start_index` 位置开始到字符串末尾的所有字符。**注意事项**：`start_index` 从 1 开始，即数组的第 0 个位置是 1参数为 null时，返回 `null`start_index 大于字符串长度时，结果报错。 | substring(string from start_index)或 substring(string, start_index) |
| substring   | 从一个字符串中提取从指定位置开始、指定长度的子字符串注意：起始位置和长度是基于字符而不是字节数组确定的。`start_index` 从 1 开始计数，长度从 `start_index` 位置计算。 | 支持三个参数**string**：要提取子字符串的源字符串，可以是字符串或文本类型。**start_index**：从哪个索引开始提取子字符串，索引从 1 开始计数。**length**：要提取的子字符串的长度。                                                      | String：返回一个字符串，从 `start_index` 位置开始，提取 `length` 个字符。**注意事项**：参数为 null时，返回 `null`如果 `start_index` 大于字符串的长度，结果报错。如果 `length` 小于 0，结果报错。极端情况，`start_index + length` 超过 `int.MAX` 并变成负数，将导致异常结果。 | substring(string from start_index for length)  或 substring(string, start_index, length) |

## 10. 模式匹配函数

### 10.1 LIKE 运算符

#### 10.1.1 用途

`LIKE` 运算符用于将值与模式进行比较。它通常用于 `WHERE` 子句中，用于匹配字符串中的特定模式。

#### 10.1.2 语法

```SQL
... column [NOT] LIKE 'pattern' ESCAPE 'character';
```

#### 10.1.3 匹配规则

- 匹配字符是区分大小写的。
- 模式支持两个匹配符号：
  - `_`：匹配任意单个字符。
  - `%`：匹配0个或多个字符。

#### 10.1.4 注意事项

- `LIKE` 模式匹配总是覆盖整个字符串。如果需要匹配字符串中的任意位置，模式必须以 `%` 开头和结尾。
- 如果需要匹配 `%` 或 `_` 作为普通字符，必须使用转义字符。

#### 10.1.5 示例

示例 1：匹配以特定字符开头的字符串

- **说明**：查找所有以字母 `E` 开头的名称，例如 `Europe`。

```SQL
SELECT * FROM table1 WHERE continent LIKE 'E%';
```

示例 2：排除特定模式

- **说明**：查找所有不以字母 `E` 开头的名称。

```SQL
SELECT * FROM table1 WHERE continent NOT LIKE 'E%';
```

示例 3：匹配特定长度的字符串

- **说明**：查找所有以 `A` 开头、以 `a` 结尾且中间有两个字符的名称，例如 `Asia`。

```SQL
SELECT * FROM table1 WHERE continent LIKE 'A__a';
```

示例 4：转义特殊字符

- **说明**：查找所有以 `South_` 开头的名称。这里使用了转义字符 `\` 来转义 `_` 等特殊字符，例如`South_America`。

```SQL
SELECT * FROM table1 WHERE continent LIKE 'South\_%' ESCAPE '\';
```

示例 5：匹配转义字符本身

- **说明**：如果需要匹配转义字符本身，可以使用双转义字符 `\\`。

```SQL
SELECT * FROM table1 WHERE continent LIKE 'South\\%' ESCAPE '\';
```

### 10.2 regexp_like 函数

#### 10.2.1 用途

`regexp_like` 函数用于评估正则表达式模式，并确定该模式是否包含在字符串中。

#### 10.2.2 语法

```SQL
regexp_like(string, pattern);
```

#### 10.2.3 注意事项

- `regexp_like` 的模式只需包含在字符串中，而不需要匹配整个字符串。
- 如果需要匹配整个字符串，可以使用正则表达式的锚点 `^` 和 `$`。
- `^` 表示“字符串的开头”，`$` 表示“字符串的结尾”。
- 正则表达式采用 Java 定义的正则语法，但存在以下需要注意的例外情况：
  - **多行模式**
    1. 启用方式：`(?m)`。
    2. 只识别`\n`作为行终止符。
    3. 不支持`(?d)`标志，且禁止使用。
  - **不区分大小写匹配**
    1. 启用方式：`(?i)`。
    2. 基于Unicode规则，不支持上下文相关和本地化匹配。
    3. 不支持`(?u)`标志，且禁止使用。
  - **字符类**
    1. 在字符类（如`[A-Z123]`）中，`\Q`和`\E`不被支持，被视为普通字面量。
  - **Unicode字符类（**`\p{prop}`**）**
    1. **名称下划线**：名称中的所有下划线必须删除（如`OldItalic`而非`Old_Italic`）。
    2. **文字（Scripts）**：直接指定，无需`Is`、`script=`或`sc=`前缀（如`\p{Hiragana}`）。
    3. **区块（Blocks）**：必须使用`In`前缀，不支持`block=`或`blk=`前缀（如`\p{InMongolian}`）。
    4. **类别（Categories）**：直接指定，无需`Is`、`general_category=`或`gc=`前缀（如`\p{L}`）。
    5. **二元属性（Binary Properties）**：直接指定，无需`Is`（如`\p{NoncharacterCodePoint}`）。

#### 10.2.4 示例

示例 1：匹配包含特定模式的字符串

```SQL
SELECT regexp_like('1a 2b 14m', '\\d+b'); -- true
```

- **说明**：检查字符串 `'1a 2b 14m'` 是否包含模式 `\d+b`。
  - `\d+` 表示“一个或多个数字”。
  - `b` 表示字母 `b`。
  - 在 `'1a 2b 14m'` 中，`2b` 符合这个模式，所以返回 `true`。

示例 2：匹配整个字符串

```SQL
SELECT regexp_like('1a 2b 14m', '^\\d+b$'); -- false
```

- **说明**：检查字符串 `'1a 2b 14m'` 是否完全匹配模式 `^\\d+b$`。
  - `\d+` 表示“一个或多个数字”。
  - `b` 表示字母 `b`。
  - `'1a 2b 14m'` 并不符合这个模式，因为它不是从数字开始，也不是以 `b` 结束，所以返回 `false`。

## 11. 时序分窗函数

原始示例数据如下：

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

-- 创建语句
CREATE TABLE bid(time TIMESTAMP TIME, stock_id STRING TAG, price FLOAT FIELD);
-- 插入数据
INSERT INTO bid(time, stock_id, price) VALUES('2021-01-01T09:05:00','AAPL',100.0),('2021-01-01T09:06:00','TESL',200.0),('2021-01-01T09:07:00','AAPL',103.0),('2021-01-01T09:07:00','TESL',202.0),('2021-01-01T09:09:00','AAPL',102.0),('2021-01-01T09:15:00','TESL',195.0);
```

### 11.1 HOP

#### 11.1.1 功能描述

HOP 函数用于按时间分段分窗分析，识别每一行数据所属的时间窗口。该函数通过指定固定窗口大小（size）和窗口滑动步长（SLIDE），将数据按时间戳分配到所有与其时间戳重叠的窗口中。若窗口之间存在重叠（步长 < 窗口大小），数据会自动复制到多个窗口。

#### 11.1.2 函数定义

```SQL
HOP(data, timecol, size, slide[, origin])
```

#### 11.1.3 参数说明

| 参数名  | 参数类型 | 参数属性                        | 描述               |
| --------- | ---------- | --------------------------------- | -------------------- |
| DATA    | 表参数   | ROW SEMANTICPASS THROUGH        | 输入表             |
| TIMECOL | 标量参数 | 字符串类型默认值：time          | 时间列             |
| SIZE    | 标量参数 | 长整数类型                      | 窗口大小           |
| SLIDE   | 标量参数 | 长整数类型                      | 窗口滑动步长       |
| ORIGIN  | 标量参数 | 时间戳类型默认值：Unix 纪元时间 | 第一个窗口起始时间 |

#### 11.1.4 返回结果

HOP 函数的返回结果列包含：

* window\_start: 窗口开始时间（闭区间）
* window\_end: 窗口结束时间（开区间）
* 映射列：DATA 参数的所有输入列

#### 11.1.5 使用示例

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

-- 结合 GROUP BY 语句，等效于树模型的 GROUP BY TIME
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

#### 11.2.1 功能描述

SESSION 函数用于按会话间隔对数据进行分窗。系统逐行检查与前一行的时间间隔，小于阈值（GAP）则归入当前窗口，超过则归入下一个窗口。

#### 11.2.2 函数定义

```SQL
SESSION(data [PARTITION BY(pkeys, ...)] [ORDER BY(okeys, ...)], timecol, gap)
```
#### 11.2.3 参数说明

| 参数名  | 参数类型 | 参数属性                 | 描述                                   |
| --------- | ---------- | -------------------------- | ---------------------------------------- |
| DATA    | 表参数   | SET SEMANTICPASS THROUGH | 输入表通过 pkeys、okeys 指定分区和排序 |
| TIMECOL | 标量参数 | 字符串类型默认值：'time' | 时间列名
|
| GAP     | 标量参数 | 长整数类型               | 会话间隔阈值                           |

#### 11.2.4 返回结果

SESSION 函数的返回结果列包含：

* window\_start: 会话窗口内的第一条数据的时间
* window\_end: 会话窗口内的最后一条数据的时间
* 映射列：DATA 参数的所有输入列

#### 11.2.5 使用示例

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

-- 结合 GROUP BY 语句，等效于树模型的 GROUP BY SESSION
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

#### 11.3.1 功能描述

VARIATION 函数用于按数据差值分窗，将第一条数据作为首个窗口的基准值，每个数据点会与基准值进行差值运算，如果差值小于给定的阈值（delta）则加入当前窗口；如果超过阈值，则分为下一个窗口，将该值作为下一个窗口的基准值。

#### 11.3.2 函数定义

```sql
VARIATION(data [PARTITION BY(pkeys, ...)] [ORDER BY(okeys, ...)], col, delta)
```

#### 11.3.3 参数说明

| 参数名 | 参数类型 | 参数属性                 | 描述                                   |
| -------- | ---------- | -------------------------- | ---------------------------------------- |
| DATA   | 表参数   | SET SEMANTICPASS THROUGH | 输入表通过 pkeys、okeys 指定分区和排序 |
| COL    | 标量参数 | 字符串类型               | 标识对哪一列计算差值                   |
| DELTA  | 标量参数 | 浮点数类型               | 差值阈值                               |

#### 11.3.4 返回结果

VARIATION 函数的返回结果列包含：

* window\_index: 窗口编号
* 映射列：DATA 参数的所有输入列

#### 11.3.5 使用示例

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

-- 结合 GROUP BY 语句，等效于树模型的 GROUP BY VARIATION
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

#### 11.4.1 功能描述

CAPACITY 函数用于按数据点数（行数）分窗，每个窗口最多有 SIZE 行数据。

#### 11.4.2 函数定义

```sql
CAPACITY(data [PARTITION BY(pkeys, ...)] [ORDER BY(okeys, ...)], size)
```

#### 11.4.3 参数说明

| 参数名 | 参数类型 | 参数属性                 | 描述                                   |
| -------- | ---------- | -------------------------- | ---------------------------------------- |
| DATA   | 表参数   | SET SEMANTICPASS THROUGH | 输入表通过 pkeys、okeys 指定分区和排序 |
| SIZE   | 标量参数 | 长整数类型               | 窗口大小                               |

#### 11.4.4 返回结果

CAPACITY 函数的返回结果列包含：

* window\_index: 窗口编号
* 映射列：DATA 参数的所有输入列

#### 11.4.5 使用示例

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

-- 结合 GROUP BY 语句，等效于树模型的 GROUP BY COUNT
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

#### 11.5.1 功能描述

TUMBLE 函数用于通过时间属性字段为每行数据分配一个窗口，滚动窗口的大小固定且不重复。

#### 11.5.2 函数定义

```sql
TUMBLE(data, timecol, size[, origin])
```
#### 11.5.3 参数说明

| 参数名  | 参数类型 | 参数属性                        | 描述               |
| --------- | ---------- | --------------------------------- | -------------------- |
| DATA    | 表参数   | ROW SEMANTICPASS THROUGH        | 输入表             |
| TIMECOL | 标量参数 | 字符串类型默认值：time          | 时间列             |
| SIZE    | 标量参数 | 长整数类型                      | 窗口大小，需为正数 |
| ORIGIN  | 标量参数 | 时间戳类型默认值：Unix 纪元时间 | 第一个窗口起始时间 |

#### 11.5.4 返回结果

TUBMLE 函数的返回结果列包含：

* window\_start: 窗口开始时间（闭区间）
* window\_end: 窗口结束时间（开区间）
* 映射列：DATA 参数的所有输入列

#### 11.5.5 使用示例

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

-- 结合 GROUP BY 语句，等效于树模型的 GROUP BY TIME
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

#### 11.6.1 功能描述

Cumulate 函数用于从初始的窗口开始，创建相同窗口开始但窗口结束步长不同的窗口，直到达到最大的窗口大小。每个窗口包含其区间内的元素。例如：1小时步长，24小时大小的累计窗口，每天可以获得如下这些窗口：`[00:00, 01:00)`，`[00:00, 02:00)`，`[00:00, 03:00)`， …， `[00:00, 24:00)`

#### 11.6.2 函数定义

```sql
CUMULATE(data, timecol, size, step[, origin])
```

#### 11.6.3 参数说明

| 参数名  | 参数类型 | 参数属性                        | 描述                                       |
| --------- | ---------- | --------------------------------- | -------------------------------------------- |
| DATA    | 表参数   | ROW SEMANTICPASS THROUGH        | 输入表                                     |
| TIMECOL | 标量参数 | 字符串类型默认值：time          | 时间列                                     |
| SIZE    | 标量参数 | 长整数类型                      | 窗口大小，SIZE必须是STEP的整数倍，需为正数 |
| STEP    | 标量参数 | 长整数类型                      | 窗口步长，需为正数                         |
| ORIGIN  | 标量参数 | 时间戳类型默认值：Unix 纪元时间 | 第一个窗口起始时间                         |

> 注意：size 如果不是 step 的整数倍，则会报错`Cumulative table function requires size must be an integral multiple of step`

#### 11.6.4 返回结果

CUMULATE函数的返回结果列包含：

* window\_start: 窗口开始时间（闭区间）
* window\_end: 窗口结束时间（开区间）
* 映射列：DATA 参数的所有输入列

#### 11.6.5 使用示例

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

-- 结合 GROUP BY 语句，等效于树模型的 GROUP BY TIME
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
