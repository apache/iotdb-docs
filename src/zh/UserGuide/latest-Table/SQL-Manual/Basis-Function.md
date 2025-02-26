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

## 1 比较函数和运算符

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

## 2 聚合函数

### 2.1 概述

1. 聚合函数是多对一函数。它们对一组值进行聚合计算，得到单个聚合结果。
2. 除了 `COUNT()`之外，其他所有聚合函数都忽略空值，并在没有输入行或所有值为空时返回空值。 例如，`SUM()` 返回 null 而不是零，而 `AVG()` 在计数中不包括 null 值。

### 2.2 支持的聚合函数                          

| 函数名      | 功能描述                                                     | 允许的输入类型           | 输出类型                      |
| ----------- | ------------------------------------------------------------ | ------------------------ | ----------------------------- |
| COUNT       | 计算数据点数。                                               | 所有类型                 | INT64                         |
| SUM         | 求和。                                                       | INT32 INT64 FLOAT DOUBLE | DOUBLE                        |
| AVG         | 求平均值。                                                   | INT32 INT64 FLOAT DOUBLE | DOUBLE                        |
| MAX         | 求最大值。                                                   | 所有类型                 | 与输入类型一致                |
| MIN         | 求最小值。                                                   | 所有类型                 | 与输入类型一致                |
| FIRST       | 求时间戳最小且不为 NULL 的值。                               | 所有类型                 | 与输入类型一致                |
| LAST        | 求时间戳最大且不为 NULL 的值。                               | 所有类型                 | 与输入类型一致                |
| STDDEV      | STDDEV_SAMP 的别名，求样本标准差。                           | INT32 INT64 FLOAT DOUBLE | DOUBLE                        |
| STDDEV_POP  | 求总体标准差。                                               | INT32 INT64 FLOAT DOUBLE | DOUBLE                        |
| STDDEV_SAMP | 求样本标准差。                                               | INT32 INT64 FLOAT DOUBLE | DOUBLE                        |
| VARIANCE    | VAR_SAMP 的别名，求样本方差。                                | INT32 INT64 FLOAT DOUBLE | DOUBLE                        |
| VAR_POP     | 求总体方差。                                                 | INT32 INT64 FLOAT DOUBLE | DOUBLE                        |
| VAR_SAMP    | 求样本方差。                                                 | INT32 INT64 FLOAT DOUBLE | DOUBLE                        |
| EXTREME     | 求具有最大绝对值的值。如果正值和负值的最大绝对值相等，则返回正值。 | INT32 INT64 FLOAT DOUBLE | 与输入类型一致                |
| MODE        | 求众数。注意： 1.输入序列的不同值个数过多时会有内存异常风险; 2.如果所有元素出现的频次相同，即没有众数，则随机返回一个元素; 3.如果有多个众数，则随机返回一个众数； 4. NULL 值也会被统计频次，所以即使输入序列的值不全为 NULL，最终结果也可能为 NULL。 | 所有类型                 | 与输入类型一致                |
| MAX_BY      | MAX_BY(x, y) 求二元输入 x 和 y 在 y 最大时对应的 x 的值。MAX_BY(time, x) 返回 x 取最大值时对应的时间戳。 | x 和 y 可以是任意类型    | 与第一个输入 x 的数据类型一致 |
| MIN_BY      | MIN_BY(x, y) 求二元输入 x 和 y 在 y 最小时对应的 x 的值。MIN_BY(time, x) 返回 x 取最小值时对应的时间戳。 | x 和 y 可以是任意类型    | 与第一个输入 x 的数据类型一致 |
| FIRST_BY    | FIRST_BY(x, y) 求当 y 为第一个不为 NULL 的值时，同一行里对应的 x 值。 | x 和 y 可以是任意类型    | 与第一个输入 x 的数据类型一致 |
| LAST_BY     | LAST_BY(x, y) 求当 y 为最后一个不为 NULL 的值时，同一行里对应的 x 值。 | x 和 y 可以是任意类型    | 与第一个输入 x 的数据类型一致 |

### 2.3 示例

#### 2.3.1 示例数据

在[示例数据页面](https://www.timecho.com/docs/zh/UserGuide/V2.0.1/Table/Basic-Concept/Sample-Data.html)中，包含了用于构建表结构和插入数据的SQL语句，下载并在IoTDB CLI中执行这些语句，即可将数据导入IoTDB，您可以使用这些数据来测试和执行示例中的SQL语句，并获得相应的结果。

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

#### 2.3.3 First

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

#### 2.3.4 Last

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

#### 2.3.5 First_by

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

#### 2.3.6 Last_by

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

#### 2.3.7 Max_by

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

#### 2.3.8 Min_by

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

## 3 逻辑运算符

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


## 4 日期和时间函数和运算符

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

在[示例数据页面](https://www.timecho.com/docs/zh/UserGuide/V2.0.1/Table/Basic-Concept/Sample-Data.html)中，包含了用于构建表结构和插入数据的SQL语句，下载并在IoTDB CLI中执行这些语句，即可将数据导入IoTDB，您可以使用这些数据来测试和执行示例中的SQL语句，并获得相应的结果。

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
    date_bin(1h, time, '1969-12-31 00:00:00.000') as time_bin
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

## 5 数学函数和运算符

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

| 函数名                       | 描述                                                         | 输入                        | 输出                   | 用法       |
| ---------------------------- | ------------------------------------------------------------ | --------------------------- | ---------------------- | ---------- |
| sin                          | 正弦函数                                                     | double、float、INT64、INT32 | double                 | sin(x)     |
| cos                          | 余弦函数                                                     | double、float、INT64、INT32 | double                 | cos(x)     |
| tan                          | 正切函数                                                     | double、float、INT64、INT32 | double                 | tan(x)     |
| asin                         | 反正弦函数                                                   | double、float、INT64、INT32 | double                 | asin(x)    |
| acos                         | 反余弦函数                                                   | double、float、INT64、INT32 | double                 | acos(x)    |
| atan                         | 反正切函数                                                   | double、float、INT64、INT32 | double                 | atan(x)    |
| sinh                         | 双曲正弦函数                                                 | double、float、INT64、INT32 | double                 | sinh(x)    |
| cosh                         | 双曲余弦函数                                                 | double、float、INT64、INT32 | double                 | cosh(x)    |
| tanh                         | 双曲正切函数                                                 | double、float、INT64、INT32 | double                 | tanh(x)    |
| degrees                      | 将弧度角 x 转换为度                                          | double、float、INT64、INT32 | double                 | degrees(x) |
| radians                      | 将度转换为弧度                                               | double、float、INT64、INT32 | double                 | radians(x) |
| abs                          | 绝对值                                                       | double、float、INT64、INT32 | 返回与输入类型相同的值 | abs(x)     |
| sign                         | 返回 x 的符号函数，即：如果参数为 0，则返回 0，如果参数大于 0，则返回 1，如果参数小于 0，则返回 -1。对于 double/float 类型的参数，函数还会返回：如果参数为 NaN，则返回 NaN，如果参数为 +Infinity，则返回 1.0，如果参数为 -Infinity，则返回 -1.0。 | double、float、INT64、INT32 | 返回与输入类型相同的值 | sign(x)    |
| ceil                         | 返回 x 向上取整到最近的整数。                                | double、float、INT64、INT32 | double                 | ceil(x)    |
| floor                        | 返回 x 向下取整到最近的整数。                                | double、float、INT64、INT32 | double                 | floor(x)   |
| exp                          | 返回欧拉数 e 的 x 次幂。                                     | double、float、INT64、INT32 | double                 | exp(x)     |
| ln                           | 返回 x 的自然对数。                                          | double、float、INT64、INT32 | double                 | ln(x)      |
| log10                        | 返回 x 的以 10 为底的对数。                                  | double、float、INT64、INT32 | double                 | log10(x)   |
| round                        | 返回 x 四舍五入到最近的整数。                                | double、float、INT64、INT32 | double                 | round(x)   |
| 返回 x 四舍五入到 d 位小数。 | double、float、INT64、INT32                                  | double                      | round(x, d)            |            |
| sqrt                         | 返回 x 的平方根。                                            | double、float、INT64、INT32 | double                 | sqrt(x)    |
| e                            | 自然指数                                                     |                             | double                 | e()        |
| pi                           | π                                                            |                             | double                 | pi()       |

## 6 条件表达式

### 6.1 CASE 表达式

CASE 表达式有两种形式：简单形式、搜索形式

#### 6.1.1 简单形式

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

#### 6.1.2 搜索形式

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

### 6.2. COALESCE 函数

返回参数列表中的第一个非空值。

```SQL
coalesce(value1, value2[, ...])
```

## 7 转换函数

### 7.1 转换函数

#### 7.1.1 cast(value AS type) → type

1. 显式地将一个值转换为指定类型。
2. 可以用于将字符串（varchar）转换为数值类型，或数值转换为字符串类型。
3. 如果转换失败，将抛出运行时错误。

示例：

```SQL
SELECT *
  FROM table1
  WHERE CAST(time AS DATE) 
  IN (CAST('2024-11-27' AS DATE), CAST('2024-11-28' AS DATE));
```

#### 7.1.2 try_cast(value AS type) → type

1. 与 `cast()` 类似。
2. 如果转换失败，则返回 `null`。

示例：

```SQL
SELECT *
  FROM table1
  WHERE try_cast(time AS DATE) 
  IN (try_cast('2024-11-27' AS DATE), try_cast('2024-11-28' AS DATE));
```

## 8 字符串函数和操作符

### 8.1 字符串操作符

#### 8.1.1 || 操作符

`||` 操作符用于字符串连接，功能与 `concat` 函数相同。

#### 8.1.2 LIKE 语句

`LIKE` 语句用于模式匹配，具体用法在[模式匹配：LIKE](#1-like-运算符) 中有详细文档。

### 8.2 字符串函数

| 函数名      | 描述                                                         | 输入                                                         | 输出                                                         | 用法                                                         |
| ----------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| length      | 返回字符串的字符长度，而不是字符数组的长度。                 | 支持一个参数，类型可以是字符串或文本。**string**：要计算长度的字符串。 | INT32                                                        | length(string)                                               |
| upper       | 将字符串中的字母转换为大写。                                 | 支持一个参数，类型可以是字符串或文本。**string**：要计算长度的字符串。 | String                                                       | upper(string)                                                |
| lower       | 将字符串中的字母转换为小写。                                 | 支持一个参数，类型可以是字符串或文本。**string**：要计算长度的字符串。 | String                                                       | lower(string)                                                |
| trim        | 从源字符串中删除指定的开头和/或结尾字符。                    | 支持三个参数**specification（可选）**：指定从哪边去掉字符，可以是：`BOTH`：两边都去掉（默认）。`LEADING`：只去掉开头的字符。`TRAILING`：只去掉结尾的字符。**trimcharacter（可选）**：要去掉的字符，如果没指定，默认去掉空格。**string**：要处理的字符串。 | String                                                       | trim([ [ specification ] [ trimcharacter ] FROM ] string) 示例：`trim('!' FROM '!foo!');` —— `'foo'` |
| strpos      | 返回子字符串在字符串中第一次出现的起始位置。位置从 1 开始计数。如果未找到，返回 0。注意：起始位置是基于字符而不是字节数组确定的。 | 仅支持两个参数，类型可以是字符串或文本。**sourceStr**：要搜索的字符串。**subStr**：要找的子字符串。 | INT32                                                        | strpos(sourceStr, subStr)                                    |
| starts_with | 测试子字符串是否是字符串的前缀。                             | 支持两个参数，类型可以是字符串或文本。**sourceStr**：要检查的字符串，类型可以是字符串或文本。**prefix**：前缀子字符串，类型可以是字符串或文本。 | Boolean                                                      | starts_with(sourceStr, prefix)                               |
| ends_with   | 测试字符串是否以指定的后缀结束。                             | 支持两个参数，类型可以是字符串或文本。**sourceStr**：要检查的字符串。**suffix**：后缀子字符串。 | Boolean                                                      | ends_with(sourceStr, suffix)                                 |
| concat      | 返回字符串 `string1`、`string2`、...、`stringN` 的连接结果。功能与连接操作符 `||` 相同。 | 至少两个参数，所有参数类型必须是字符串或文本。               | String                                                       | concat(str1, str2, ...) 或 str1 \|\| str2 ...                |
| strcmp      | 比较两个字符串的字母序。                                     | 支持两个参数，两个参数类型必须是字符串或文本。**string1**：第一个要比较的字符串。**string2**：第二个要比较的字符串。 | 返回一个整数值INT32如果 `str1 < str2`，返回 `-1`如果 `str1 = str2`，返回 `0`如果 `str1 > str2`，返回 `1`如果 `str1` 或 `str2` 为 `NULL`，返回 `NULL` | strcmp(str1, str2)                                           |
| replace     | 从字符串中删除所有 `search` 的实例。                         | 支持两个参数，可以是字符串或文本类型。**string**：原始字符串，要从中删除内容的字符串。**search**：要删除的子字符串。 | String                                                       | replace(string, string)                                      |
| replace     | 将字符串中所有 `search` 的实例替换为 `replace`。             | 支持三个参数，可以是字符串或文本类型。**string**：原始字符串，要从中替换内容的字符串。**search**：要替换掉的子字符串。**replace**：用来替换的新字符串。 | String                                                       | replace(string, string, string)                              |
| substring   | 从指定位置提取字符到字符串末尾。需要注意的是，起始位置是基于字符而不是字节数组确定的。`start_index` 从 1 开始计数，长度从 `start_index` 位置计算。 | 支持两个参数**string**：要提取子字符串的源字符串，可以是字符串或文本类型。**start_index**：从哪个索引开始提取子字符串，索引从 1 开始计数。 | String：返回一个字符串，从 `start_index` 位置开始到字符串末尾的所有字符。**注意事项**：`start_index` 从 1 开始，即数组的第 0 个位置是 1参数为 null时，返回 `null`start_index 大于字符串长度时，结果报错。 | substring(string from start_index)或 substring(string, start_index) |
| substring   | 从一个字符串中提取从指定位置开始、指定长度的子字符串注意：起始位置和长度是基于字符而不是字节数组确定的。`start_index` 从 1 开始计数，长度从 `start_index` 位置计算。 | 支持三个参数**string**：要提取子字符串的源字符串，可以是字符串或文本类型。**start_index**：从哪个索引开始提取子字符串，索引从 1 开始计数。**length**：要提取的子字符串的长度。 | String：返回一个字符串，从 `start_index` 位置开始，提取 `length` 个字符。**注意事项**：参数为 null时，返回 `null`如果 `start_index` 大于字符串的长度，结果报错。如果 `length` 小于 0，结果报错。极端情况，`start_index + length` 超过 `int.MAX` 并变成负数，将导致异常结果。 | substring(string from start_index for length)  或 substring(string, start_index, length) |

## 9 模式匹配函数

### 9.1 LIKE 运算符

#### 9.1.1 用途

`LIKE` 运算符用于将值与模式进行比较。它通常用于 `WHERE` 子句中，用于匹配字符串中的特定模式。

#### 9.1.2 语法

```SQL
... column [NOT] LIKE 'pattern' ESCAPE 'character';
```

#### 9.1.3 匹配规则

- 匹配字符是区分大小写的。
- 模式支持两个匹配符号：
  - `_`：匹配任意单个字符。
  - `%`：匹配0个或多个字符。

#### 9.1.4 注意事项

- `LIKE` 模式匹配总是覆盖整个字符串。如果需要匹配字符串中的任意位置，模式必须以 `%` 开头和结尾。
- 如果需要匹配 `%` 或 `_` 作为普通字符，必须使用转义字符。

#### 9.1.5 示例

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

### 9.2 regexp_like 函数

#### 9.2.1 用途

`regexp_like` 函数用于评估正则表达式模式，并确定该模式是否包含在字符串中。

#### 9.2.2 语法

```SQL
regexp_like(string, pattern);
```

#### 9.2.3 注意事项

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

#### 9.2.4 示例

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