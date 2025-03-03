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

# 内置函数与表达式

## 1. 聚合函数

聚合函数是多对一函数。它们对一组值进行聚合计算，得到单个聚合结果。

除了 `COUNT()`, `COUNT_IF()`之外，其他所有聚合函数都忽略空值，并在没有输入行或所有值为空时返回空值。 例如，`SUM()` 返回 null 而不是零，而 `AVG()` 在计数中不包括 null 值。

IoTDB 支持的聚合函数如下：

| 函数名        | 功能描述                                                     | 允许的输入类型            | 必要的属性参数                                               | 输出类型       |
| ------------- | ------------------------------------------------------------ | ------------------------- | ------------------------------------------------------------ | -------------- |
| SUM           | 求和。                                                       | INT32 INT64 FLOAT DOUBLE  | 无                                                           | DOUBLE         |
| COUNT         | 计算数据点数。                                               | 所有类型                  | 无                                                           | INT64          |
| AVG           | 求平均值。                                                   | INT32 INT64 FLOAT DOUBLE  | 无                                                           | DOUBLE         |
| STDDEV        | STDDEV_SAMP 的别名，求样本标准差。                           | INT32 INT64 FLOAT DOUBLE  | 无                                                           | DOUBLE         |
| STDDEV_POP    | 求总体标准差。                                               | INT32 INT64 FLOAT DOUBLE  | 无                                                           | DOUBLE         |
| STDDEV_SAMP   | 求样本标准差。                                               | INT32 INT64 FLOAT DOUBLE  | 无                                                           | DOUBLE         |
| VARIANCE      | VAR_SAMP 的别名，求样本方差。                                | INT32 INT64 FLOAT DOUBLE  | 无                                                           | DOUBLE         |
| VAR_POP       | 求总体方差。                                                 | INT32 INT64 FLOAT DOUBLE  | 无                                                           | DOUBLE         |
| VAR_SAMP      | 求样本方差。                                                 | INT32 INT64 FLOAT DOUBLE  | 无                                                           | DOUBLE         |
| EXTREME       | 求具有最大绝对值的值。如果正值和负值的最大绝对值相等，则返回正值。 | INT32 INT64 FLOAT DOUBLE  | 无                                                           | 与输入类型一致 |
| MAX_VALUE     | 求最大值。                                                   | INT32 INT64 FLOAT DOUBLE  | 无                                                           | 与输入类型一致 |
| MIN_VALUE     | 求最小值。                                                   | INT32 INT64 FLOAT DOUBLE  | 无                                                           | 与输入类型一致 |
| FIRST_VALUE   | 求时间戳最小的值。                                           | 所有类型                  | 无                                                           | 与输入类型一致 |
| LAST_VALUE    | 求时间戳最大的值。                                           | 所有类型                  | 无                                                           | 与输入类型一致 |
| MAX_TIME      | 求最大时间戳。                                               | 所有类型                  | 无                                                           | Timestamp      |
| MIN_TIME      | 求最小时间戳。                                               | 所有类型                  | 无                                                           | Timestamp      |
| COUNT_IF      | 求数据点连续满足某一给定条件，且满足条件的数据点个数（用keep表示）满足指定阈值的次数。 | BOOLEAN                   | `[keep >=/>/=/!=/</<=]threshold`：被指定的阈值或阈值条件，若只使用`threshold`则等价于`keep >= threshold`,`threshold`类型为`INT64` <br> `ignoreNull`：可选，默认为`true`；为`true`表示忽略null值，即如果中间出现null值，直接忽略，不会打断连续性；为`false`表示不忽略null值，即如果中间出现null值，会打断连续性 | INT64          |
| TIME_DURATION | 求某一列最大一个不为NULL的值所在时间戳与最小一个不为NULL的值所在时间戳的时间戳差 | 所有类型                  | 无                                                           | INT64          |
| MODE          | 求众数。注意：<br>1.输入序列的不同值个数过多时会有内存异常风险; <br>2.如果所有元素出现的频次相同，即没有众数，则返回对应时间戳最小的值; <br>3.如果有多个众数，则返回对应时间戳最小的众数。 | 所有类型                  | 无                                                           | 与输入类型一致 |
| COUNT_TIME    | 查询结果集的时间戳的数量。与 align by device 搭配使用时，得到的结果是每个设备的结果集的时间戳的数量。 | 所有类型，输入参数只能为* | 无                                                           | INT64          |
| MAX_BY        | MAX_BY(x, y) 求二元输入 x 和 y 在 y 最大时对应的 x 的值。MAX_BY(time, x) 返回 x 取最大值时对应的时间戳。                               | 第一个输入 x 可以是任意类型，第二个输入 y 只能是 INT32 INT64 FLOAT DOUBLE  |  无        | 与第一个输入 x 的数据类型一致 |
| MIN_BY        | MIN_BY(x, y) 求二元输入 x 和 y 在 y 最小时对应的 x 的值。MIN_BY(time, x) 返回 x 取最小值时对应的时间戳。                               | 第一个输入 x 可以是任意类型，第二个输入 y 只能是 INT32 INT64 FLOAT DOUBLE  |  无        | 与第一个输入 x 的数据类型一致 |


### 1.1 COUNT_IF

#### 语法
```sql
count_if(predicate, [keep >=/>/=/!=/</<=]threshold[, 'ignoreNull'='true/false'])
```
predicate: 返回类型为`BOOLEAN`的合法表达式

threshold 及 ignoreNull 用法见上表

>注意: count_if 当前暂不支持与 group by time 的 SlidingWindow 一起使用

#### 使用示例

##### 原始数据

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

##### 不使用ignoreNull参数(忽略null)

SQL:
```sql
select count_if(s1=0 & s2=0, 3), count_if(s1=1 & s2=0, 3) from root.db.d1
```

输出:
```
+--------------------------------------------------+--------------------------------------------------+
|count_if(root.db.d1.s1 = 0 & root.db.d1.s2 = 0, 3)|count_if(root.db.d1.s1 = 1 & root.db.d1.s2 = 0, 3)|
+--------------------------------------------------+--------------------------------------------------+
|                                                 2|                                                 1|
+--------------------------------------------------+--------------------------------------------------
```

##### 使用ignoreNull参数

SQL:
```sql
select count_if(s1=0 & s2=0, 3, 'ignoreNull'='false'), count_if(s1=1 & s2=0, 3, 'ignoreNull'='false') from root.db.d1
```

输出:
```
+------------------------------------------------------------------------+------------------------------------------------------------------------+
|count_if(root.db.d1.s1 = 0 & root.db.d1.s2 = 0, 3, "ignoreNull"="false")|count_if(root.db.d1.s1 = 1 & root.db.d1.s2 = 0, 3, "ignoreNull"="false")|
+------------------------------------------------------------------------+------------------------------------------------------------------------+
|                                                                       1|                                                                       1|
+------------------------------------------------------------------------+------------------------------------------------------------------------+
```

### 1.2 TIME_DURATION
#### 语法
```sql
    time_duration(Path)
```
#### 使用示例
##### 准备数据
```
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
##### 写入语句
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

查询：
```sql
select time_duration(s1) from root.db.d1
```

输出
```
+----------------------------+
|time_duration(root.db.d1.s1)|
+----------------------------+
|                  1677570933|
+----------------------------+
```
> 注：若数据点只有一个，则返回0，若数据点为null，则返回null。

### 1.3 COUNT_TIME
#### 语法
```sql
    count_time(*)
```
#### 使用示例
##### 准备数据
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
##### 写入语句
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

查询示例1：
```sql
select count_time(*) from root.db.**
```

输出
```
+-------------+
|count_time(*)|
+-------------+
|            8|
+-------------+
```

查询示例2：
```sql
select count_time(*) from root.db.d1, root.db.d2
```

输出
```
+-------------+
|count_time(*)|
+-------------+
|            8|
+-------------+
```

查询示例3：
```sql
select count_time(*) from root.db.** group by([0, 10), 2ms)
```

输出
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

查询示例4：
```sql
select count_time(*) from root.db.** group by([0, 10), 2ms) align by device
```

输出
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

> 注：
> 1. count_time里的表达式只能为*。
> 2. count_time不能和其他的聚合函数一起使用。
> 3. having语句里不支持使用count_time, 使用count_time聚合函数时不支持使用having语句。
> 4. count_time不支持与group by level, group by tag一起使用。



### 1.4 MAX_BY

#### 功能定义
max_by(x, y)： 返回 y 最大时对应时间戳下的 x 值。
- max_by 必须有两个输入参数 x 和 y。
- 第一个输入可以为 time 关键字, max_by(time, x) 返回 x 取最大值时对应的时间戳。
- 如果 y 最大时对应的时间戳下 x 为 null，则返回 null。
- 如果 y 可以在多个时间戳下取得最大值，取最大值中最小时间戳对应的 x 值。
- 与 IoTDB max_value 保持一致，仅支持 INT32、INT64、FLOAT、DOUBLE 作为 y 的输入，支持所有六种类型作为 x 的输入。
- x, y 的输入均不允许为具体数值。


#### 语法
```sql
select max_by(x, y) from root.sg
select max_by(time, x) from root.sg
```

#### 使用示例

##### 原始数据
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
##### 查询示例
查询最大值对应的时间戳：
```sql
IoTDB> select max_by(time, a), max_value(a) from root.test
+-------------------------+------------------------+
|max_by(Time, root.test.a)|  max_value(root.test.a)|
+-------------------------+------------------------+
|                        4|                    10.0|
+-------------------------+------------------------+
```

求 a 最大时对应的 b 值：
```sql
IoTDB> select max_by(b, a) from root.test
+--------------------------------+
|max_by(root.test.b, root.test.a)|
+--------------------------------+
|                            10.0|
+--------------------------------+
```

结合表达式使用：
```sql
IoTDB> select max_by(b + 1, a * 2) from root.test
+----------------------------------------+
|max_by(root.test.b + 1, root.test.a * 2)|
+----------------------------------------+
|                                    11.0|
+----------------------------------------+
```

结合 group by time 子句使用：
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

结合 having 子句使用：
```sql
IoTDB> select max_by(b, a) from root.test group by ([0,7),4ms) having max_by(b, a) > 4.0
+-----------------------------+--------------------------------+
|                         Time|max_by(root.test.b, root.test.a)|
+-----------------------------+--------------------------------+
|1970-01-01T08:00:00.004+08:00|                            10.0|
+-----------------------------+--------------------------------+
```
结合 order by 子句使用：
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

#### 功能定义
min_by(x, y)： 返回 y 最小时对应时间戳下的 x 值。
- min_by 必须有两个输入参数 x 和 y。
- 第一个输入可以为 time 关键字, min_by(time, x) 返回 x 取最小值时对应的时间戳。
- 如果 y 最大时对应的时间戳下 x 为 null，则返回 null。
- 如果 y 可以在多个时间戳下取得最小值，取最小值中最小时间戳对应的 x 值。
- 与 IoTDB min_value 保持一致，仅支持 INT32、INT64、FLOAT、DOUBLE 作为 y 的输入，支持所有六种类型作为 x 的输入。
- x, y 的输入均不允许为具体数值。

#### 语法
```sql
select min_by(x, y) from root.sg
select min_by(time, x) from root.sg
```

#### 使用示例

##### 原始数据
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
##### 查询示例
查询最小值对应的时间戳：
```sql
IoTDB> select min_by(time, a), min_value(a) from root.test
+-------------------------+------------------------+
|min_by(Time, root.test.a)|  min_value(root.test.a)|
+-------------------------+------------------------+
|                        4|                     1.0|
+-------------------------+------------------------+
```

求 a 最小时对应的 b 值：
```sql
IoTDB> select min_by(b, a) from root.test
+--------------------------------+
|min_by(root.test.b, root.test.a)|
+--------------------------------+
|                            10.0|
+--------------------------------+
```

结合表达式使用：
```sql
IoTDB> select min_by(b + 1, a * 2) from root.test
+----------------------------------------+
|min_by(root.test.b + 1, root.test.a * 2)|
+----------------------------------------+
|                                    11.0|
+----------------------------------------+
```

结合 group by time 子句使用：
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

结合 having 子句使用：
```sql
IoTDB> select min_by(b, a) from root.test group by ([0,7),4ms) having max_by(b, a) > 4.0
+-----------------------------+--------------------------------+
|                         Time|min_by(root.test.b, root.test.a)|
+-----------------------------+--------------------------------+
|1970-01-01T08:00:00.004+08:00|                            10.0|
+-----------------------------+--------------------------------+
```

结合 order by 子句使用：
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

## 2. 算数运算符和函数

### 2.1 算数运算符

#### 一元算数运算符

支持的运算符：`+`, `-`

输入数据类型要求：`INT32`, `INT64`, `FLOAT`, `DOUBLE`

输出数据类型：与输入数据类型一致

#### 二元算数运算符

支持的运算符：`+`, `-`, `*`, `/`,  `%`

输入数据类型要求：`INT32`, `INT64`, `FLOAT`和`DOUBLE`

输出数据类型：`DOUBLE`

注意：当某个时间戳下左操作数和右操作数都不为空（`null`）时，二元运算操作才会有输出结果

#### 使用示例

例如：

```sql
select s1, - s1, s2, + s2, s1 + s2, s1 - s2, s1 * s2, s1 / s2, s1 % s2 from root.sg.d1
```

结果：

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

### 2.2 数学函数

目前 IoTDB 支持下列数学函数，这些数学函数的行为与这些函数在 Java Math 标准库中对应实现的行为一致。

| 函数名  | 输入序列类型                   | 输出序列类型             | 必要属性参数    | Java 标准库中的对应实现                                      |
| ------- | ------------------------------ | ------------------------ |-----------| ------------------------------------------------------------ |
| SIN     | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |           | Math#sin(double)                                             |
| COS     | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |           | Math#cos(double)                                             |
| TAN     | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |           | Math#tan(double)                                             |
| ASIN    | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |           | Math#asin(double)                                            |
| ACOS    | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |           | Math#acos(double)                                            |
| ATAN    | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |           | Math#atan(double)                                            |
| SINH    | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |           | Math#sinh(double)                                            |
| COSH    | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |           | Math#cosh(double)                                            |
| TANH    | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |           | Math#tanh(double)                                            |
| DEGREES | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |           | Math#toDegrees(double)                                       |
| RADIANS | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |           | Math#toRadians(double)                                       |
| ABS     | INT32 / INT64 / FLOAT / DOUBLE | 与输入序列的实际类型一致 |           | Math#abs(int) / Math#abs(long) /Math#abs(float) /Math#abs(double) |
| SIGN    | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |           | Math#signum(double)                                          |
| CEIL    | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |           | Math#ceil(double)                                            |
| FLOOR   | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |           | Math#floor(double)                                           |
| ROUND   | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |`places`:四舍五入有效位数，正数为小数点后面的有效位数，负数为整数位的有效位数 | Math#rint(Math#pow(10,places))/Math#pow(10,places)|
| EXP     | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |           | Math#exp(double)                                             |
| LN      | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |           | Math#log(double)                                             |
| LOG10   | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |           | Math#log10(double)                                           |
| SQRT    | INT32 / INT64 / FLOAT / DOUBLE | DOUBLE                   |           | Math#sqrt(double)                                            |

例如：

```   sql
select s1, sin(s1), cos(s1), tan(s1) from root.sg1.d1 limit 5 offset 1000;
```

结果：

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

例如：
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

## 3. 比较运算符和函数

### 3.1 基本比较运算符

- 输入数据类型： `INT32`, `INT64`, `FLOAT`, `DOUBLE`。
- 注意：会将所有数据转换为`DOUBLE`类型后进行比较。`==`和`!=`可以直接比较两个`BOOLEAN`。
- 返回类型：`BOOLEAN`。

|运算符                       |含义|
|----------------------------|-----------|
|`>`                         |大于|
|`>=`                        |大于等于|
|`<`                         |小于|
|`<=`                        |小于等于|
|`==`                        |等于|
|`!=` / `<>`                 |不等于|

**示例：**

```sql
select a, b, a > 10, a <= b, !(a <= b), a > 10 && a > b from root.test;
```

运行结果
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

### 3.2 `BETWEEN ... AND ...` 运算符

|运算符                       |含义|
|----------------------------|-----------|
|`BETWEEN ... AND ...`       |在指定范围内|
|`NOT BETWEEN ... AND ...`   |不在指定范围内|

**示例：** 选择区间 [36.5,40] 内或之外的数据：

```sql
select temperature from root.sg1.d1 where temperature between 36.5 and 40;
```

```sql
select temperature from root.sg1.d1 where temperature not between 36.5 and 40;
```

### 3.3 模糊匹配运算符

对于 TEXT 类型的数据，支持使用 `Like` 和 `Regexp` 运算符对数据进行模糊匹配

|运算符                       |含义|
|----------------------------|-----------|
|`LIKE`                      |匹配简单模式|
|`NOT LIKE`                  |无法匹配简单模式|
|`REGEXP`                    |匹配正则表达式|
|`NOT REGEXP`                |无法匹配正则表达式|

输入数据类型：`TEXT`

返回类型：`BOOLEAN`

#### 使用 `Like` 进行模糊匹配

**匹配规则：**

- `%` 表示任意0个或多个字符。
- `_` 表示任意单个字符。

**示例 1：** 查询 `root.sg.d1` 下 `value` 含有`'cc'`的数据。

```shell
IoTDB> select * from root.sg.d1 where value like '%cc%'
+-----------------------------+----------------+
|                         Time|root.sg.d1.value|
+-----------------------------+----------------+
|2017-11-01T00:00:00.000+08:00|        aabbccdd| 
|2017-11-01T00:00:01.000+08:00|              cc|
+-----------------------------+----------------+
Total line number = 2
It costs 0.002s
```

**示例 2：** 查询 `root.sg.d1` 下 `value` 中间为 `'b'`、前后为任意单个字符的数据。

```shell
IoTDB> select * from root.sg.device where value like '_b_'
+-----------------------------+----------------+
|                         Time|root.sg.d1.value|
+-----------------------------+----------------+
|2017-11-01T00:00:02.000+08:00|             abc| 
+-----------------------------+----------------+
Total line number = 1
It costs 0.002s
```

#### 使用 `Regexp` 进行模糊匹配

需要传入的过滤条件为 **Java 标准库风格的正则表达式**。

**常见的正则匹配举例：**

```
长度为3-20的所有字符：^.{3,20}$
大写英文字符：^[A-Z]+$
数字和英文字符：^[A-Za-z0-9]+$
以a开头的：^a.*
```

**示例 1：** 查询 root.sg.d1 下 value 值为26个英文字符组成的字符串。

```shell
IoTDB> select * from root.sg.d1 where value regexp '^[A-Za-z]+$'
+-----------------------------+----------------+
|                         Time|root.sg.d1.value|
+-----------------------------+----------------+
|2017-11-01T00:00:00.000+08:00|        aabbccdd| 
|2017-11-01T00:00:01.000+08:00|              cc|
+-----------------------------+----------------+
Total line number = 2
It costs 0.002s
```

**示例 2：** 查询 root.sg.d1 下 value 值为26个小写英文字符组成的字符串且时间大于100的。

```shell
IoTDB> select * from root.sg.d1 where value regexp '^[a-z]+$' and time > 100
+-----------------------------+----------------+
|                         Time|root.sg.d1.value|
+-----------------------------+----------------+
|2017-11-01T00:00:00.000+08:00|        aabbccdd| 
|2017-11-01T00:00:01.000+08:00|              cc|
+-----------------------------+----------------+
Total line number = 2
It costs 0.002s
```

**示例 3：**

```sql
select b, b like '1%', b regexp '[0-2]' from root.test;
```

运行结果
```
+-----------------------------+-----------+-------------------------+--------------------------+
|                         Time|root.test.b|root.test.b LIKE '^1.*?$'|root.test.b REGEXP '[0-2]'|
+-----------------------------+-----------+-------------------------+--------------------------+
|1970-01-01T08:00:00.001+08:00| 111test111|                     true|                      true|
|1970-01-01T08:00:00.003+08:00| 333test333|                    false|                     false|
+-----------------------------+-----------+-------------------------+--------------------------+
```

### 3.4 `IS NULL` 运算符

|运算符                       |含义|
|----------------------------|-----------|
|`IS NULL`                   |是空值|
|`IS NOT NULL`               |不是空值|

**示例 1：** 选择值为空的数据:

```sql
select code from root.sg1.d1 where temperature is null;
```

**示例 2：** 选择值为非空的数据:

```sql
select code from root.sg1.d1 where temperature is not null;
```

### 3.5 `IN` 运算符

|运算符                       |含义|
|----------------------------|-----------|
|`IN` / `CONTAINS`           |是指定列表中的值|
|`NOT IN` / `NOT CONTAINS`   |不是指定列表中的值|

输入数据类型：`All Types`

返回类型 `BOOLEAN`

**注意：请确保集合中的值可以被转为输入数据的类型。**
> 例如：
>
>`s1 in (1, 2, 3, 'test')`，`s1`的数据类型是`INT32`
>
> 我们将会抛出异常，因为`'test'`不能被转为`INT32`类型

**示例 1：** 选择值在特定范围内的数据：

```sql
select code from root.sg1.d1 where code in ('200', '300', '400', '500');
```

**示例 2：** 选择值在特定范围外的数据：

```sql
select code from root.sg1.d1 where code not in ('200', '300', '400', '500');
```

**示例 3：**

```sql
select a, a in (1, 2) from root.test;
```

输出2:
```
+-----------------------------+-----------+--------------------+
|                         Time|root.test.a|root.test.a IN (1,2)|
+-----------------------------+-----------+--------------------+
|1970-01-01T08:00:00.001+08:00|          1|                true|
|1970-01-01T08:00:00.003+08:00|          3|               false|
+-----------------------------+-----------+--------------------+
```

### 3.6 条件函数 

条件函数针对每个数据点进行条件判断，返回布尔值。

| 函数名      | 可接收的输入序列类型                     | 必要的属性参数                               | 输出序列类型     | 功能类型                                             |
|----------|--------------------------------|---------------------------------------|------------|--------------------------------------------------|
| ON_OFF   | INT32 / INT64 / FLOAT / DOUBLE | `threshold`:DOUBLE类型                  | BOOLEAN 类型 | 返回`ts_value >= threshold`的bool值                  |
| IN_RANGE | INT32 / INT64 / FLOAT / DOUBLE | `lower`:DOUBLE类型<br/>`upper`:DOUBLE类型 | BOOLEAN类型  | 返回`ts_value >= lower && ts_value <= upper`的bool值 |                                                    |

测试数据：

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

**示例 1：**

SQL语句：
```sql
select ts, on_off(ts, 'threshold'='2') from root.test;
```

输出：
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

**示例 2：**

Sql语句：
```sql
select ts, in_range(ts, 'lower'='2', 'upper'='3.1') from root.test;
```

输出：
```
IoTDB> select ts, in_range(ts, 'lower'='2', 'upper'='3.1') from root.test;
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

## 4. 逻辑运算符

### 4.1 一元逻辑运算符

- 支持运算符：`!`
- 输入数据类型：`BOOLEAN`。
- 输出数据类型：`BOOLEAN`。
- 注意：`!`的优先级很高，记得使用括号调整优先级。

### 4.2 二元逻辑运算符

- 支持运算符 
  - AND:`and`,`&`, `&&`
  - OR:`or`,`|`,`||`

- 输入数据类型：`BOOLEAN`。

- 返回类型 `BOOLEAN`。

- 注意：当某个时间戳下左操作数和右操作数都为`BOOLEAN`类型时，二元逻辑操作才会有输出结果。

**示例：**

```sql
select a, b, a > 10, a <= b, !(a <= b), a > 10 && a > b from root.test;
```

运行结果
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

##  5. 字符串处理

###  5.1 STRING_CONTAINS

####  函数简介

本函数判断字符串中是否存在子串 `s`

**函数名:** STRING_CONTAINS

**输入序列:** 仅支持单个输入序列，类型为 TEXT。

**参数:**
+ `s`: 待搜寻的字符串。

**输出序列:** 输出单个序列，类型为 BOOLEAN。

####  使用示例

```   sql
select s1, string_contains(s1, 's'='warn') from root.sg1.d4;
```

结果：

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

### 5.2 STRING_MATCHES

####  函数简介

本函数判断字符串是否能够被正则表达式`regex`匹配。

**函数名:** STRING_MATCHES

**输入序列:** 仅支持单个输入序列，类型为 TEXT。

**参数:**
+ `regex`: Java 标准库风格的正则表达式。

**输出序列:** 输出单个序列，类型为 BOOLEAN。

####  使用示例

```   sql
select s1, string_matches(s1, 'regex'='[^\\s]+37229') from root.sg1.d4;
```

结果：

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

### 5.3 Length

####  函数简介

本函数用于获取输入序列的长度。

**函数名:** LENGTH

**输入序列:** 仅支持单个输入序列，类型为 TEXT。

**输出序列:** 输出单个序列，类型为 INT32。

**提示:** 如果输入是NULL，返回NULL。

####  使用示例

输入序列:

```
+-----------------------------+--------------+
|                         Time|root.sg1.d1.s1|
+-----------------------------+--------------+
|1970-01-01T08:00:00.001+08:00|        1test1|
|1970-01-01T08:00:00.002+08:00|      22test22|
+-----------------------------+--------------+
```

用于查询的 SQL 语句:

```sql
select s1, length(s1) from root.sg1.d1
```

输出序列:

```
+-----------------------------+--------------+----------------------+
|                         Time|root.sg1.d1.s1|length(root.sg1.d1.s1)|
+-----------------------------+--------------+----------------------+
|1970-01-01T08:00:00.001+08:00|        1test1|                     6|
|1970-01-01T08:00:00.002+08:00|      22test22|                     8|
+-----------------------------+--------------+----------------------+
```

### 5.4 Locate

####  函数简介

本函数用于获取`target`子串第一次出现在输入序列的位置，如果输入序列中不包含`target`则返回 -1 。

**函数名:** LOCATE

**输入序列:** 仅支持单个输入序列，类型为 TEXT。

**参数:**

+ `target`: 需要被定位的子串。
+ `reverse`: 指定是否需要倒序定位，默认值为`false`, 即从左至右定位。

**输出序列:** 输出单个序列，类型为INT32。

**提示:** 下标从 0 开始。

####  使用示例

输入序列:

```
+-----------------------------+--------------+
|                         Time|root.sg1.d1.s1|
+-----------------------------+--------------+
|1970-01-01T08:00:00.001+08:00|        1test1|
|1970-01-01T08:00:00.002+08:00|      22test22|
+-----------------------------+--------------+
```

用于查询的 SQL 语句:

```sql
select s1, locate(s1, "target"="1") from root.sg1.d1
```

输出序列:

```
+-----------------------------+--------------+------------------------------------+
|                         Time|root.sg1.d1.s1|locate(root.sg1.d1.s1, "target"="1")|
+-----------------------------+--------------+------------------------------------+
|1970-01-01T08:00:00.001+08:00|        1test1|                                   0|
|1970-01-01T08:00:00.002+08:00|      22test22|                                  -1|
+-----------------------------+--------------+------------------------------------+
```

另一个用于查询的 SQL 语句:

```sql
select s1, locate(s1, "target"="1", "reverse"="true") from root.sg1.d1
```

输出序列:

```
+-----------------------------+--------------+------------------------------------------------------+
|                         Time|root.sg1.d1.s1|locate(root.sg1.d1.s1, "target"="1", "reverse"="true")|
+-----------------------------+--------------+------------------------------------------------------+
|1970-01-01T08:00:00.001+08:00|        1test1|                                                     5|
|1970-01-01T08:00:00.002+08:00|      22test22|                                                    -1|
+-----------------------------+--------------+------------------------------------------------------+
```

### 5.5 StartsWith

####  函数简介

本函数用于判断输入序列是否有指定前缀。

**函数名:** STARTSWITH

**输入序列:** 仅支持单个输入序列，类型为 TEXT。

**参数:**
+ `target`: 需要匹配的前缀。

**输出序列:** 输出单个序列，类型为 BOOLEAN。

**提示:** 如果输入是NULL，返回NULL。

####  使用示例

输入序列:

```
+-----------------------------+--------------+
|                         Time|root.sg1.d1.s1|
+-----------------------------+--------------+
|1970-01-01T08:00:00.001+08:00|        1test1|
|1970-01-01T08:00:00.002+08:00|      22test22|
+-----------------------------+--------------+
```

用于查询的 SQL 语句:

```sql
select s1, startswith(s1, "target"="1") from root.sg1.d1
```

输出序列:

```
+-----------------------------+--------------+----------------------------------------+
|                         Time|root.sg1.d1.s1|startswith(root.sg1.d1.s1, "target"="1")|
+-----------------------------+--------------+----------------------------------------+
|1970-01-01T08:00:00.001+08:00|        1test1|                                    true|
|1970-01-01T08:00:00.002+08:00|      22test22|                                   false|
+-----------------------------+--------------+----------------------------------------+
```

### 5.6 EndsWith

####  函数简介

本函数用于判断输入序列是否有指定后缀。

**函数名:** ENDSWITH

**输入序列:** 仅支持单个输入序列，类型为 TEXT。

**参数:**
+ `target`: 需要匹配的后缀。

**输出序列:** 输出单个序列，类型为 BOOLEAN。

**提示:** 如果输入是NULL，返回NULL。

####  使用示例

输入序列:

```
+-----------------------------+--------------+
|                         Time|root.sg1.d1.s1|
+-----------------------------+--------------+
|1970-01-01T08:00:00.001+08:00|        1test1|
|1970-01-01T08:00:00.002+08:00|      22test22|
+-----------------------------+--------------+
```

用于查询的 SQL 语句:

```sql
select s1, endswith(s1, "target"="1") from root.sg1.d1
```

输出序列:

```
+-----------------------------+--------------+--------------------------------------+
|                         Time|root.sg1.d1.s1|endswith(root.sg1.d1.s1, "target"="1")|
+-----------------------------+--------------+--------------------------------------+
|1970-01-01T08:00:00.001+08:00|        1test1|                                  true|
|1970-01-01T08:00:00.002+08:00|      22test22|                                 false|
+-----------------------------+--------------+--------------------------------------+
```

### 5.7 Concat

####  函数简介

本函数用于拼接输入序列和`target`字串。

**函数名:** CONCAT

**输入序列:** 至少一个输入序列，类型为 TEXT。

**参数:**
+ `targets`: 一系列 K-V, key需要以`target`为前缀且不重复, value是待拼接的字符串。
+ `series_behind`: 指定拼接时时间序列是否在后面，默认为`false`。

**输出序列:** 输出单个序列，类型为 TEXT。

**提示:**
+ 如果输入序列是NULL, 跳过该序列的拼接。
+ 函数只能将输入序列和`targets`区分开各自拼接。`concat(s1, "target1"="IoT", s2, "target2"="DB")`和
  `concat(s1, s2, "target1"="IoT", "target2"="DB")`得到的结果是一样的。

####  使用示例

输入序列:

```
+-----------------------------+--------------+--------------+
|                         Time|root.sg1.d1.s1|root.sg1.d1.s2|
+-----------------------------+--------------+--------------+
|1970-01-01T08:00:00.001+08:00|        1test1|          null|
|1970-01-01T08:00:00.002+08:00|      22test22|      2222test|
+-----------------------------+--------------+--------------+
```

用于查询的 SQL 语句:

```sql
select s1, s2, concat(s1, s2, "target1"="IoT", "target2"="DB") from root.sg1.d1
```

输出序列:

```
+-----------------------------+--------------+--------------+-----------------------------------------------------------------------+
|                         Time|root.sg1.d1.s1|root.sg1.d1.s2|concat(root.sg1.d1.s1, root.sg1.d1.s2, "target1"="IoT", "target2"="DB")|
+-----------------------------+--------------+--------------+-----------------------------------------------------------------------+
|1970-01-01T08:00:00.001+08:00|        1test1|          null|                                                            1test1IoTDB|
|1970-01-01T08:00:00.002+08:00|      22test22|      2222test|                                                  22test222222testIoTDB|
+-----------------------------+--------------+--------------+-----------------------------------------------------------------------+
```

另一个用于查询的 SQL 语句:

```sql
select s1, s2, concat(s1, s2, "target1"="IoT", "target2"="DB", "series_behind"="true") from root.sg1.d1
```

输出序列:

```
+-----------------------------+--------------+--------------+-----------------------------------------------------------------------------------------------+
|                         Time|root.sg1.d1.s1|root.sg1.d1.s2|concat(root.sg1.d1.s1, root.sg1.d1.s2, "target1"="IoT", "target2"="DB", "series_behind"="true")|
+-----------------------------+--------------+--------------+-----------------------------------------------------------------------------------------------+
|1970-01-01T08:00:00.001+08:00|        1test1|          null|                                                                                    IoTDB1test1|
|1970-01-01T08:00:00.002+08:00|      22test22|      2222test|                                                                          IoTDB22test222222test|
+-----------------------------+--------------+--------------+-----------------------------------------------------------------------------------------------+
```

### 5.8 Substring

####  函数简介
提取字符串的子字符串，从指定的第一个字符开始，并在指定的字符数之后停止。下标从1开始。from 和 for的范围是 INT32 类型取值范围。

**函数名:** SUBSTRING


**输入序列:** 仅支持单个输入序列，类型为TEXT。

**参数:**
+ `from`: 指定子串开始下标。
+ `for`: 指定多少个字符数后停止。

**输出序列:** 输出单个序列，类型为 TEXT。

**提示:** 如果输入是NULL，返回NULL。

####  使用示例

输入序列:

```
+-----------------------------+--------------+
|                         Time|root.sg1.d1.s1|
+-----------------------------+--------------+
|1970-01-01T08:00:00.001+08:00|        1test1|
|1970-01-01T08:00:00.002+08:00|      22test22|
+-----------------------------+--------------+
```

用于查询的 SQL 语句:

```sql
select s1, substring(s1 from 1 for 2) from root.sg1.d1
```

输出序列:

```
+-----------------------------+--------------+--------------------------------------+
|                         Time|root.sg1.d1.s1|SUBSTRING(root.sg1.d1.s1 FROM 1 FOR 2)|
+-----------------------------+--------------+--------------------------------------+
|1970-01-01T08:00:00.001+08:00|        1test1|                                    1t|
|1970-01-01T08:00:00.002+08:00|      22test22|                                    22|
+-----------------------------+--------------+--------------------------------------+
```

### 5.9 Replace

####  函数简介
将输入序列中的子串替换成目标子串。

**函数名:** REPLACE


**输入序列:** 仅支持单个输入序列，类型为TEXT。

**参数:**
+ 第一个参数: 需要替换的目标子串。
+ 第二个参数: 要替换成的子串。

**输出序列:** 输出单个序列，类型为 TEXT。

**提示:** 如果输入是NULL，返回NULL。

####  使用示例

输入序列:

```
+-----------------------------+--------------+
|                         Time|root.sg1.d1.s1|
+-----------------------------+--------------+
|1970-01-01T08:00:00.001+08:00|        1test1|
|1970-01-01T08:00:00.002+08:00|      22test22|
+-----------------------------+--------------+
```

用于查询的 SQL 语句:

```sql
select s1, replace(s1, 'es', 'tt') from root.sg1.d1
```

输出序列:

```
+-----------------------------+--------------+-----------------------------------+
|                         Time|root.sg1.d1.s1|REPLACE(root.sg1.d1.s1, 'es', 'tt')|
+-----------------------------+--------------+-----------------------------------+
|1970-01-01T08:00:00.001+08:00|        1test1|                             1tttt1|
|1970-01-01T08:00:00.002+08:00|      22test22|                           22tttt22|
+-----------------------------+--------------+-----------------------------------+
```

### 5.10 Upper

####  函数简介

本函数用于将输入序列转化为大写。

**函数名:** UPPER

**输入序列:** 仅支持单个输入序列，类型为TEXT。

**输出序列:** 输出单个序列，类型为 TEXT。

**提示:** 如果输入是NULL，返回NULL。

####  使用示例

输入序列:

```
+-----------------------------+--------------+
|                         Time|root.sg1.d1.s1|
+-----------------------------+--------------+
|1970-01-01T08:00:00.001+08:00|        1test1|
|1970-01-01T08:00:00.002+08:00|      22test22|
+-----------------------------+--------------+
```

用于查询的 SQL 语句:

```sql
select s1, upper(s1) from root.sg1.d1
```

输出序列:

```
+-----------------------------+--------------+---------------------+
|                         Time|root.sg1.d1.s1|upper(root.sg1.d1.s1)|
+-----------------------------+--------------+---------------------+
|1970-01-01T08:00:00.001+08:00|        1test1|               1TEST1|
|1970-01-01T08:00:00.002+08:00|      22test22|             22TEST22|
+-----------------------------+--------------+---------------------+
```

### 5.11 Lower

####  函数简介

本函数用于将输入序列转换为小写。

**函数名:** LOWER

**输入序列:** 仅支持单个输入序列，类型为TEXT。

**输出序列:** 输出单个序列，类型为 TEXT。

**提示:** 如果输入是NULL，返回NULL。

####  使用示例

输入序列:

```
+-----------------------------+--------------+
|                         Time|root.sg1.d1.s1|
+-----------------------------+--------------+
|1970-01-01T08:00:00.001+08:00|        1TEST1|
|1970-01-01T08:00:00.002+08:00|      22TEST22|
+-----------------------------+--------------+
```

用于查询的 SQL 语句:

```sql
select s1, lower(s1) from root.sg1.d1
```

输出序列:

```
+-----------------------------+--------------+---------------------+
|                         Time|root.sg1.d1.s1|lower(root.sg1.d1.s1)|
+-----------------------------+--------------+---------------------+
|1970-01-01T08:00:00.001+08:00|        1TEST1|               1test1|
|1970-01-01T08:00:00.002+08:00|      22TEST22|             22test22|
+-----------------------------+--------------+---------------------+
```

### 5.12 Trim

####  函数简介

本函数用于移除输入序列前后的空格。

**函数名:** TRIM

**输入序列:** 仅支持单个输入序列，类型为TEXT。

**输出序列:** 输出单个序列，类型为 TEXT。

**提示:** 如果输入是NULL，返回NULL。

####  使用示例

输入序列:

```
+-----------------------------+--------------+
|                         Time|root.sg1.d1.s3|
+-----------------------------+--------------+
|1970-01-01T08:00:00.002+08:00|   3querytest3|
|1970-01-01T08:00:00.003+08:00|  3querytest3 |
+-----------------------------+--------------+
```

用于查询的 SQL 语句:

```sql
select s3, trim(s3) from root.sg1.d1
```

输出序列:

```
+-----------------------------+--------------+--------------------+
|                         Time|root.sg1.d1.s3|trim(root.sg1.d1.s3)|
+-----------------------------+--------------+--------------------+
|1970-01-01T08:00:00.002+08:00|   3querytest3|         3querytest3|
|1970-01-01T08:00:00.003+08:00|  3querytest3 |         3querytest3|
+-----------------------------+--------------+--------------------+
```

### 5.13 StrCmp

####  函数简介

本函数用于比较两个输入序列。 如果值相同返回 `0` , 序列1的值小于序列2的值返回一个`负数`，序列1的值大于序列2的值返回一个`正数`。

**函数名:** StrCmp

**输入序列:** 输入两个序列，类型均为 TEXT。

**输出序列:** 输出单个序列，类型为 TEXT。

**提示:** 如果任何一个输入是NULL，返回NULL。

####  使用示例

输入序列:

```
+-----------------------------+--------------+--------------+
|                         Time|root.sg1.d1.s1|root.sg1.d1.s2|
+-----------------------------+--------------+--------------+
|1970-01-01T08:00:00.001+08:00|        1test1|          null|
|1970-01-01T08:00:00.002+08:00|      22test22|      2222test|
+-----------------------------+--------------+--------------+
```

用于查询的 SQL 语句:

```sql
select s1, s2, strcmp(s1, s2) from root.sg1.d1
```

输出序列:

```
+-----------------------------+--------------+--------------+--------------------------------------+
|                         Time|root.sg1.d1.s1|root.sg1.d1.s2|strcmp(root.sg1.d1.s1, root.sg1.d1.s2)|
+-----------------------------+--------------+--------------+--------------------------------------+
|1970-01-01T08:00:00.001+08:00|        1test1|          null|                                  null|
|1970-01-01T08:00:00.002+08:00|      22test22|      2222test|                                    66|
+-----------------------------+--------------+--------------+--------------------------------------+
```

### 5.14 StrReplace

####  函数简介

**非内置函数，需要注册数据质量函数库后才能使用**。本函数用于将文本中的子串替换为指定的字符串。

**函数名：** STRREPLACE

**输入序列：** 仅支持单个输入序列，类型为 TEXT。

**参数：**

+ `target`: 需要替换的字符子串
+ `replace`: 替换后的字符串。
+ `limit`: 替换次数，大于等于 -1 的整数，默认为 -1 表示所有匹配的子串都会被替换。
+ `offset`: 需要跳过的匹配次数，即前`offset`次匹配到的字符子串并不会被替换，默认为 0。
+ `reverse`: 是否需要反向计数，默认为 false 即按照从左向右的次序。

**输出序列：** 输出单个序列，类型为 TEXT。

####  使用示例

输入序列：

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

用于查询的 SQL 语句：

```sql
select strreplace(s1, "target"=",", "replace"="/", "limit"="2") from root.test.d1
```

输出序列：

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

另一个用于查询的 SQL 语句：

```sql
select strreplace(s1, "target"=",", "replace"="/", "limit"="1", "offset"="1", "reverse"="true") from root.test.d1
```

输出序列：

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

### 5.15 RegexMatch

####  函数简介

**非内置函数，需要注册数据质量函数库后才能使用**。本函数用于正则表达式匹配文本中的具体内容并返回。

**函数名：** REGEXMATCH

**输入序列：** 仅支持单个输入序列，类型为 TEXT。

**参数：**

+ `regex`: 匹配的正则表达式，支持所有 Java 正则表达式语法，比如`\d+\.\d+\.\d+\.\d+`将会匹配任意 IPv4 地址.
+ `group`: 输出的匹配组序号，根据 java.util.regex 规定，第 0 组为整个正则表达式，此后的组按照左括号出现的顺序依次编号。
  如`A(B(CD))`中共有三个组，第 0 组`A(B(CD))`，第 1 组`B(CD)`和第 2 组`CD`。

**输出序列：** 输出单个序列，类型为 TEXT。

**提示：** 空值或无法匹配给定的正则表达式的数据点没有输出结果。

####  使用示例


输入序列：

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

用于查询的 SQL 语句：

```sql
select regexmatch(s1, "regex"="\d+\.\d+\.\d+\.\d+", "group"="0") from root.test.d1
```

输出序列：

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

### 5.16 RegexReplace

#####  函数简介

**非内置函数，需要注册数据质量函数库后才能使用**。本函数用于将文本中符合正则表达式的匹配结果替换为指定的字符串。

**函数名：** REGEXREPLACE

**输入序列：** 仅支持单个输入序列，类型为 TEXT。

**参数：**

+ `regex`: 需要替换的正则表达式，支持所有 Java 正则表达式语法。
+ `replace`: 替换后的字符串，支持 Java 正则表达式中的后向引用，
  形如'$1'指代了正则表达式`regex`中的第一个分组，并会在替换时自动填充匹配到的子串。
+ `limit`: 替换次数，大于等于 -1 的整数，默认为 -1 表示所有匹配的子串都会被替换。
+ `offset`: 需要跳过的匹配次数，即前`offset`次匹配到的字符子串并不会被替换，默认为 0。
+ `reverse`: 是否需要反向计数，默认为 false 即按照从左向右的次序。

**输出序列：** 输出单个序列，类型为 TEXT。

#####  使用示例

输入序列：

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

用于查询的 SQL 语句：

```sql
select regexreplace(s1, "regex"="192\.168\.0\.(\d+)", "replace"="cluster-$1", "limit"="1") from root.test.d1
```

输出序列：

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

####  RegexSplit

#####  函数简介

**非内置函数，需要注册数据质量函数库后才能使用**。本函数用于使用给定的正则表达式切分文本，并返回指定的项。

**函数名：** REGEXSPLIT

**输入序列：** 仅支持单个输入序列，类型为 TEXT。

**参数：**

+ `regex`: 用于分割文本的正则表达式，支持所有 Java 正则表达式语法，比如`['"]`将会匹配任意的英文引号`'`和`"`。
+ `index`: 输出结果在切分后数组中的序号，需要是大于等于 -1 的整数，默认值为 -1 表示返回切分后数组的长度，其它非负整数即表示返回数组中对应位置的切分结果（数组的秩从 0 开始计数）。

**输出序列：** 输出单个序列，在`index`为 -1 时输出数据类型为 INT32，否则为 TEXT。

**提示：** 如果`index`超出了切分后结果数组的秩范围，例如使用`,`切分`0,1,2`时输入`index`为 3，则该数据点没有输出结果。

#####  使用示例


输入序列：

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

用于查询的 SQL 语句：

```sql
select regexsplit(s1, "regex"=",", "index"="-1") from root.test.d1
```

输出序列：

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

另一个查询的 SQL 语句：

```sql
select regexsplit(s1, "regex"=",", "index"="3") from root.test.d1
```

输出序列：

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

## 6. 数据类型转换

### 6.1 CAST

#### 函数简介

当前 IoTDB 支持6种数据类型，其中包括 INT32、INT64、FLOAT、DOUBLE、BOOLEAN 以及 TEXT。当我们对数据进行查询或者计算时可能需要进行数据类型的转换， 比如说将 TEXT 转换为 INT32，或者提高数据精度，比如说将 FLOAT 转换为 DOUBLE。IoTDB 支持使用cast 函数对数据类型进行转换。

语法示例如下：

```sql
SELECT cast(s1 as INT32) from root.sg
```

cast 函数语法形式上与 PostgreSQL 一致，AS 后指定的数据类型表明要转换成的目标类型，目前 IoTDB 支持的六种数据类型均可以在 cast 函数中使用，遵循的转换规则如下表所示，其中行表示原始数据类型，列表示要转化成的目标数据类型：

|             | **INT32**                                                    | **INT64**                                                    | **FLOAT**                                       | **DOUBLE**              | **BOOLEAN**                                                  | **TEXT**                         |
| ----------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ----------------------------------------------- | ----------------------- | ------------------------------------------------------------ | -------------------------------- |
| **INT32**   | 不转化                                                       | 直接转化                                                     | 直接转化                                        | 直接转化                | !=0 : true<br />==0: false                                   | String.valueOf()                 |
| **INT64**   | 超出 INT32 范围：执行抛异常<br />否则：直接转化              | 不转化                                                       | 直接转化                                        | 直接转化                | !=0L : true<br />==0: false                                  | String.valueOf()                 |
| **FLOAT**   | 超出 INT32 范围：执行抛异常<br />否则：四舍五入(Math.round()) | 超出 INT64 范围：执行抛异常<br />否则：四舍五入(Math.round()) | 不转化                                          | 直接转化                | !=0.0f : true<br />==0: false                                | String.valueOf()                 |
| **DOUBLE**  | 超出 INT32 范围：执行抛异常<br />否则：四舍五入(Math.round()) | 超出 INT64 范围：执行抛异常<br />否则：四舍五入(Math.round()) | 超出 FLOAT 范围：执行抛异常<br />否则：直接转化 | 不转化                  | !=0.0 : true<br />==0: false                                 | String.valueOf()                 |
| **BOOLEAN** | true: 1<br />false: 0                                        | true: 1L<br />false: 0                                       | true: 1.0f<br />false: 0                        | true: 1.0<br />false: 0 | 不转化                                                       | true: "true"<br />false: "false" |
| **TEXT**    | Integer.parseInt()                                           | Long.parseLong()                                             | Float.parseFloat()                              | Double.parseDouble()    | text.toLowerCase =="true" : true<br />text.toLowerCase =="false" : false<br />其它情况：执行抛异常 | 不转化                           |

#### 使用示例

```
// timeseries
IoTDB> show timeseries root.sg.d1.**
+-------------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+
|   Timeseries|Alias|Database|DataType|Encoding|Compression|Tags|Attributes|Deadband|DeadbandParameters|
+-------------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+
|root.sg.d1.s3| null| root.sg|   FLOAT|   PLAIN|     SNAPPY|null|      null|    null|              null|
|root.sg.d1.s4| null| root.sg|  DOUBLE|   PLAIN|     SNAPPY|null|      null|    null|              null|
|root.sg.d1.s5| null| root.sg| BOOLEAN|   PLAIN|     SNAPPY|null|      null|    null|              null|
|root.sg.d1.s6| null| root.sg|    TEXT|   PLAIN|     SNAPPY|null|      null|    null|              null|
|root.sg.d1.s1| null| root.sg|   INT32|   PLAIN|     SNAPPY|null|      null|    null|              null|
|root.sg.d1.s2| null| root.sg|   INT64|   PLAIN|     SNAPPY|null|      null|    null|              null|
+-------------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+

// data of timeseries
IoTDB> select * from root.sg.d1;
+-----------------------------+-------------+-------------+-------------+-------------+-------------+-------------+
|                         Time|root.sg.d1.s3|root.sg.d1.s4|root.sg.d1.s5|root.sg.d1.s6|root.sg.d1.s1|root.sg.d1.s2|
+-----------------------------+-------------+-------------+-------------+-------------+-------------+-------------+
|1970-01-01T08:00:00.000+08:00|          0.0|          0.0|        false|        10000|            0|            0|
|1970-01-01T08:00:00.001+08:00|          1.0|          1.0|        false|            3|            1|            1|
|1970-01-01T08:00:00.002+08:00|          2.7|          2.7|         true|         TRue|            2|            2|
|1970-01-01T08:00:00.003+08:00|         3.33|         3.33|         true|        faLse|            3|            3|
+-----------------------------+-------------+-------------+-------------+-------------+-------------+-------------+

// cast BOOLEAN to other types
IoTDB> select cast(s5 as INT32), cast(s5 as INT64),cast(s5 as FLOAT),cast(s5 as DOUBLE), cast(s5 as TEXT) from root.sg.d1
+-----------------------------+----------------------------+----------------------------+----------------------------+-----------------------------+---------------------------+
|                         Time|CAST(root.sg.d1.s5 AS INT32)|CAST(root.sg.d1.s5 AS INT64)|CAST(root.sg.d1.s5 AS FLOAT)|CAST(root.sg.d1.s5 AS DOUBLE)|CAST(root.sg.d1.s5 AS TEXT)|
+-----------------------------+----------------------------+----------------------------+----------------------------+-----------------------------+---------------------------+
|1970-01-01T08:00:00.000+08:00|                           0|                           0|                         0.0|                          0.0|                      false|
|1970-01-01T08:00:00.001+08:00|                           0|                           0|                         0.0|                          0.0|                      false|
|1970-01-01T08:00:00.002+08:00|                           1|                           1|                         1.0|                          1.0|                       true|
|1970-01-01T08:00:00.003+08:00|                           1|                           1|                         1.0|                          1.0|                       true|
+-----------------------------+----------------------------+----------------------------+----------------------------+-----------------------------+---------------------------+

// cast TEXT to numeric types
IoTDB> select cast(s6 as INT32), cast(s6 as INT64), cast(s6 as FLOAT), cast(s6 as DOUBLE) from root.sg.d1 where time < 2
+-----------------------------+----------------------------+----------------------------+----------------------------+-----------------------------+
|                         Time|CAST(root.sg.d1.s6 AS INT32)|CAST(root.sg.d1.s6 AS INT64)|CAST(root.sg.d1.s6 AS FLOAT)|CAST(root.sg.d1.s6 AS DOUBLE)|
+-----------------------------+----------------------------+----------------------------+----------------------------+-----------------------------+
|1970-01-01T08:00:00.000+08:00|                       10000|                       10000|                     10000.0|                      10000.0|
|1970-01-01T08:00:00.001+08:00|                           3|                           3|                         3.0|                          3.0|
+-----------------------------+----------------------------+----------------------------+----------------------------+-----------------------------+

// cast TEXT to BOOLEAN
IoTDB> select cast(s6 as BOOLEAN) from root.sg.d1 where time >= 2
+-----------------------------+------------------------------+
|                         Time|CAST(root.sg.d1.s6 AS BOOLEAN)|
+-----------------------------+------------------------------+
|1970-01-01T08:00:00.002+08:00|                          true|
|1970-01-01T08:00:00.003+08:00|                         false|
+-----------------------------+------------------------------+
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

## 7. 常序列生成函数

常序列生成函数用于生成所有数据点的值都相同的时间序列。

常序列生成函数接受一个或者多个时间序列输入，其输出的数据点的时间戳集合是这些输入序列时间戳集合的并集。

目前 IoTDB 支持如下常序列生成函数：

| 函数名 | 必要的属性参数                                               | 输出序列类型               | 功能描述                                                     |
| ------ | ------------------------------------------------------------ | -------------------------- | ------------------------------------------------------------ |
| CONST  | `value`: 输出的数据点的值 <br />`type`: 输出的数据点的类型，只能是 INT32 / INT64 / FLOAT / DOUBLE / BOOLEAN / TEXT | 由输入属性参数 `type` 决定 | 根据输入属性 `value` 和 `type` 输出用户指定的常序列。        |
| PI     | 无                                                           | DOUBLE                     | 常序列的值：`π` 的 `double` 值，圆的周长与其直径的比值，即圆周率，等于 *Java标准库* 中的`Math.PI`。 |
| E      | 无                                                           | DOUBLE                     | 常序列的值：`e` 的 `double` 值，自然对数的底，它等于 *Java 标准库*  中的 `Math.E`。 |

例如：

```   sql
select s1, s2, const(s1, 'value'='1024', 'type'='INT64'), pi(s2), e(s1, s2) from root.sg1.d1; 
```

结果：

```
select s1, s2, const(s1, 'value'='1024', 'type'='INT64'), pi(s2), e(s1, s2) from root.sg1.d1; 
+-----------------------------+--------------+--------------+-----------------------------------------------------+------------------+---------------------------------+
|                         Time|root.sg1.d1.s1|root.sg1.d1.s2|const(root.sg1.d1.s1, "value"="1024", "type"="INT64")|pi(root.sg1.d1.s2)|e(root.sg1.d1.s1, root.sg1.d1.s2)|
+-----------------------------+--------------+--------------+-----------------------------------------------------+------------------+---------------------------------+
|1970-01-01T08:00:00.000+08:00|           0.0|           0.0|                                                 1024| 3.141592653589793|                2.718281828459045|
|1970-01-01T08:00:00.001+08:00|           1.0|          null|                                                 1024|              null|                2.718281828459045|
|1970-01-01T08:00:00.002+08:00|           2.0|          null|                                                 1024|              null|                2.718281828459045|
|1970-01-01T08:00:00.003+08:00|          null|           3.0|                                                 null| 3.141592653589793|                2.718281828459045|
|1970-01-01T08:00:00.004+08:00|          null|           4.0|                                                 null| 3.141592653589793|                2.718281828459045|
+-----------------------------+--------------+--------------+-----------------------------------------------------+------------------+---------------------------------+
Total line number = 5
It costs 0.005s
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

## 8. 选择函数

目前 IoTDB 支持如下选择函数：

| 函数名   | 输入序列类型                          | 必要的属性参数                                    | 输出序列类型             | 功能描述                                                     |
| -------- | ------------------------------------- | ------------------------------------------------- | ------------------------ | ------------------------------------------------------------ |
| TOP_K    | INT32 / INT64 / FLOAT / DOUBLE / TEXT | `k`: 最多选择的数据点数，必须大于 0 小于等于 1000 | 与输入序列的实际类型一致 | 返回某时间序列中值最大的`k`个数据点。若多于`k`个数据点的值并列最大，则返回时间戳最小的数据点。 |
| BOTTOM_K | INT32 / INT64 / FLOAT / DOUBLE / TEXT | `k`: 最多选择的数据点数，必须大于 0 小于等于 1000 | 与输入序列的实际类型一致 | 返回某时间序列中值最小的`k`个数据点。若多于`k`个数据点的值并列最小，则返回时间戳最小的数据点。 |

例如：

```   sql
select s1, top_k(s1, 'k'='2'), bottom_k(s1, 'k'='2') from root.sg1.d2 where time > 2020-12-10T20:36:15.530+08:00;
```

结果：

``` 
+-----------------------------+--------------------+------------------------------+---------------------------------+
|                         Time|      root.sg1.d2.s1|top_k(root.sg1.d2.s1, "k"="2")|bottom_k(root.sg1.d2.s1, "k"="2")|
+-----------------------------+--------------------+------------------------------+---------------------------------+
|2020-12-10T20:36:15.531+08:00| 1531604122307244742|           1531604122307244742|                             null|
|2020-12-10T20:36:15.532+08:00|-7426070874923281101|                          null|                             null|
|2020-12-10T20:36:15.533+08:00|-7162825364312197604|          -7162825364312197604|                             null|
|2020-12-10T20:36:15.534+08:00|-8581625725655917595|                          null|             -8581625725655917595|
|2020-12-10T20:36:15.535+08:00|-7667364751255535391|                          null|             -7667364751255535391|
+-----------------------------+--------------------+------------------------------+---------------------------------+
Total line number = 5
It costs 0.006s
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

## 9. 区间查询函数

### 9.1 连续满足区间函数

连续满足条件区间函数用来查询所有满足指定条件的连续区间。

按返回值可分为两类：
1. 返回满足条件连续区间的起始时间戳和时间跨度(时间跨度为0表示此处只有起始时间这一个数据点满足条件)
2. 返回满足条件连续区间的起始时间戳和后面连续满足条件的点的个数（个数为1表示此处只有起始时间这一个数据点满足条件）

| 函数名               | 输入序列类型                               | 属性参数                                           | 输出序列类型 | 功能描述                                                             |
|-------------------|--------------------------------------|------------------------------------------------|-------|------------------------------------------------------------------|
| ZERO_DURATION     | INT32/ INT64/ FLOAT/ DOUBLE/ BOOLEAN | `min`:可选，默认值0<br>`max`:可选，默认值`Long.MAX_VALUE` | Long  | 返回时间序列连续为0(false)的开始时间与持续时间，持续时间t(单位ms)满足`t >= min && t <= max`  |
| NON_ZERO_DURATION | INT32/ INT64/ FLOAT/ DOUBLE/ BOOLEAN | `min`:可选，默认值0<br>`max`:可选，默认值`Long.MAX_VALUE` | Long  | 返回时间序列连续不为0(false)的开始时间与持续时间，持续时间t(单位ms)满足`t >= min && t <= max` |               |
| ZERO_COUNT        | INT32/ INT64/ FLOAT/ DOUBLE/ BOOLEAN | `min`:可选，默认值1<br>`max`:可选，默认值`Long.MAX_VALUE` | Long  | 返回时间序列连续为0(false)的开始时间与其后数据点的个数，数据点个数n满足`n >= min && n <= max`   |               |
| NON_ZERO_COUNT    | INT32/ INT64/ FLOAT/ DOUBLE/ BOOLEAN | `min`:可选，默认值1<br>`max`:可选，默认值`Long.MAX_VALUE` | Long  | 返回时间序列连续不为0(false)的开始时间与其后数据点的个数，数据点个数n满足`n >= min && n <= max`  |               |

测试数据:
```
IoTDB> select s1,s2,s3,s4,s5 from root.sg.d2;
+-----------------------------+-------------+-------------+-------------+-------------+-------------+
|                         Time|root.sg.d2.s1|root.sg.d2.s2|root.sg.d2.s3|root.sg.d2.s4|root.sg.d2.s5|
+-----------------------------+-------------+-------------+-------------+-------------+-------------+
|1970-01-01T08:00:00.000+08:00|            0|            0|          0.0|          0.0|        false|
|1970-01-01T08:00:00.001+08:00|            1|            1|          1.0|          1.0|         true|
|1970-01-01T08:00:00.002+08:00|            1|            1|          1.0|          1.0|         true|
|1970-01-01T08:00:00.003+08:00|            0|            0|          0.0|          0.0|        false|
|1970-01-01T08:00:00.004+08:00|            1|            1|          1.0|          1.0|         true|
|1970-01-01T08:00:00.005+08:00|            0|            0|          0.0|          0.0|        false|
|1970-01-01T08:00:00.006+08:00|            0|            0|          0.0|          0.0|        false|
|1970-01-01T08:00:00.007+08:00|            1|            1|          1.0|          1.0|         true|
+-----------------------------+-------------+-------------+-------------+-------------+-------------+
```

sql:
```sql
select s1, zero_count(s1), non_zero_count(s2), zero_duration(s3), non_zero_duration(s4) from root.sg.d2;
```

结果:
```
+-----------------------------+-------------+-------------------------+-----------------------------+----------------------------+--------------------------------+
|                         Time|root.sg.d2.s1|zero_count(root.sg.d2.s1)|non_zero_count(root.sg.d2.s2)|zero_duration(root.sg.d2.s3)|non_zero_duration(root.sg.d2.s4)|
+-----------------------------+-------------+-------------------------+-----------------------------+----------------------------+--------------------------------+
|1970-01-01T08:00:00.000+08:00|            0|                        1|                         null|                           0|                            null|
|1970-01-01T08:00:00.001+08:00|            1|                     null|                            2|                        null|                               1|
|1970-01-01T08:00:00.002+08:00|            1|                     null|                         null|                        null|                            null|
|1970-01-01T08:00:00.003+08:00|            0|                        1|                         null|                           0|                            null|
|1970-01-01T08:00:00.004+08:00|            1|                     null|                            1|                        null|                               0|
|1970-01-01T08:00:00.005+08:00|            0|                        2|                         null|                           1|                            null|
|1970-01-01T08:00:00.006+08:00|            0|                     null|                         null|                        null|                            null|
|1970-01-01T08:00:00.007+08:00|            1|                     null|                            1|                        null|                               0|
+-----------------------------+-------------+-------------------------+-----------------------------+----------------------------+--------------------------------+
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

## 10. 趋势计算函数

目前 IoTDB 支持如下趋势计算函数：

| 函数名                  | 输入序列类型                                    | 属性参数                                                     | 输出序列类型             | 功能描述                                                     |
| ----------------------- | ----------------------------------------------- | ------------------------------------------------------------ | ------------------------ | ------------------------------------------------------------ |
| TIME_DIFFERENCE         | INT32 / INT64 / FLOAT / DOUBLE / BOOLEAN / TEXT | 无                                                           | INT64                    | 统计序列中某数据点的时间戳与前一数据点时间戳的差。范围内第一个数据点没有对应的结果输出。 |
| DIFFERENCE              | INT32 / INT64 / FLOAT / DOUBLE                  | 无                                                           | 与输入序列的实际类型一致 | 统计序列中某数据点的值与前一数据点的值的差。范围内第一个数据点没有对应的结果输出。 |
| NON_NEGATIVE_DIFFERENCE | INT32 / INT64 / FLOAT / DOUBLE                  | 无                                                           | 与输入序列的实际类型一致 | 统计序列中某数据点的值与前一数据点的值的差的绝对值。范围内第一个数据点没有对应的结果输出。 |
| DERIVATIVE              | INT32 / INT64 / FLOAT / DOUBLE                  | 无                                                           | DOUBLE                   | 统计序列中某数据点相对于前一数据点的变化率，数量上等同于 DIFFERENCE /  TIME_DIFFERENCE。范围内第一个数据点没有对应的结果输出。 |
| NON_NEGATIVE_DERIVATIVE | INT32 / INT64 / FLOAT / DOUBLE                  | 无                                                           | DOUBLE                   | 统计序列中某数据点相对于前一数据点的变化率的绝对值，数量上等同于 NON_NEGATIVE_DIFFERENCE /  TIME_DIFFERENCE。范围内第一个数据点没有对应的结果输出。 |
| DIFF                    | INT32 / INT64 / FLOAT / DOUBLE                  | `ignoreNull`：可选，默认为true；为true时，前一个数据点值为null时，忽略该数据点继续向前找到第一个出现的不为null的值；为false时，如果前一个数据点为null，则不忽略，使用null进行相减，结果也为null | DOUBLE                   | 统计序列中某数据点的值与前一数据点的值的差。第一个数据点没有对应的结果输出，输出值为null |

例如：

```   sql
select s1, time_difference(s1), difference(s1), non_negative_difference(s1), derivative(s1), non_negative_derivative(s1) from root.sg1.d1 limit 5 offset 1000; 
```

结果：

``` 
+-----------------------------+-------------------+-------------------------------+--------------------------+---------------------------------------+--------------------------+---------------------------------------+
|                         Time|     root.sg1.d1.s1|time_difference(root.sg1.d1.s1)|difference(root.sg1.d1.s1)|non_negative_difference(root.sg1.d1.s1)|derivative(root.sg1.d1.s1)|non_negative_derivative(root.sg1.d1.s1)|
+-----------------------------+-------------------+-------------------------------+--------------------------+---------------------------------------+--------------------------+---------------------------------------+
|2020-12-10T17:11:49.037+08:00|7360723084922759782|                              1|      -8431715764844238876|                    8431715764844238876|    -8.4317157648442388E18|                  8.4317157648442388E18|
|2020-12-10T17:11:49.038+08:00|4377791063319964531|                              1|      -2982932021602795251|                    2982932021602795251|     -2.982932021602795E18|                   2.982932021602795E18|
|2020-12-10T17:11:49.039+08:00|7972485567734642915|                              1|       3594694504414678384|                    3594694504414678384|     3.5946945044146785E18|                  3.5946945044146785E18|
|2020-12-10T17:11:49.040+08:00|2508858212791964081|                              1|      -5463627354942678834|                    5463627354942678834|     -5.463627354942679E18|                   5.463627354942679E18|
|2020-12-10T17:11:49.041+08:00|2817297431185141819|                              1|        308439218393177738|                     308439218393177738|     3.0843921839317773E17|                  3.0843921839317773E17|
+-----------------------------+-------------------+-------------------------------+--------------------------+---------------------------------------+--------------------------+---------------------------------------+
Total line number = 5
It costs 0.014s
```

### 10.1 使用示例

#### 原始数据

``` 
+-----------------------------+------------+------------+
|                         Time|root.test.s1|root.test.s2|
+-----------------------------+------------+------------+
|1970-01-01T08:00:00.001+08:00|           1|         1.0|
|1970-01-01T08:00:00.002+08:00|           2|        null|
|1970-01-01T08:00:00.003+08:00|        null|         3.0|
|1970-01-01T08:00:00.004+08:00|           4|        null|
|1970-01-01T08:00:00.005+08:00|           5|         5.0|
|1970-01-01T08:00:00.006+08:00|        null|         6.0|
+-----------------------------+------------+------------+
```

#### 不使用ignoreNull参数(忽略null)

SQL:
```sql
SELECT DIFF(s1), DIFF(s2) from root.test;
```

输出:
```
+-----------------------------+------------------+------------------+
|                         Time|DIFF(root.test.s1)|DIFF(root.test.s2)|
+-----------------------------+------------------+------------------+
|1970-01-01T08:00:00.001+08:00|              null|              null|
|1970-01-01T08:00:00.002+08:00|               1.0|              null|
|1970-01-01T08:00:00.003+08:00|              null|               2.0|
|1970-01-01T08:00:00.004+08:00|               2.0|              null|
|1970-01-01T08:00:00.005+08:00|               1.0|               2.0|
|1970-01-01T08:00:00.006+08:00|              null|               1.0|
+-----------------------------+------------------+------------------+
```

#### 使用ignoreNull参数

SQL:
```sql
SELECT DIFF(s1, 'ignoreNull'='false'), DIFF(s2, 'ignoreNull'='false') from root.test;
```

输出:
```
+-----------------------------+----------------------------------------+----------------------------------------+
|                         Time|DIFF(root.test.s1, "ignoreNull"="false")|DIFF(root.test.s2, "ignoreNull"="false")|
+-----------------------------+----------------------------------------+----------------------------------------+
|1970-01-01T08:00:00.001+08:00|                                    null|                                    null|
|1970-01-01T08:00:00.002+08:00|                                     1.0|                                    null|
|1970-01-01T08:00:00.003+08:00|                                    null|                                    null|
|1970-01-01T08:00:00.004+08:00|                                    null|                                    null|
|1970-01-01T08:00:00.005+08:00|                                     1.0|                                    null|
|1970-01-01T08:00:00.006+08:00|                                    null|                                     1.0|
+-----------------------------+----------------------------------------+----------------------------------------+
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

##  11. 采样函数

###  11.1 等数量分桶降采样函数

本函数对输入序列进行等数量分桶采样，即根据用户给定的降采样比例和降采样方法将输入序列按固定点数等分为若干桶。在每个桶内通过给定的采样方法进行采样。

####  等数量分桶随机采样

对等数量分桶后，桶内进行随机采样。

| 函数名      | 可接收的输入序列类型                     | 必要的属性参数                               | 输出序列类型     | 功能类型                                             |
|----------|--------------------------------|---------------------------------------|------------|--------------------------------------------------|
| EQUAL_SIZE_BUCKET_RANDOM_SAMPLE   | INT32 / INT64 / FLOAT / DOUBLE | 降采样比例 `proportion`，取值范围为`(0, 1]`，默认为`0.1`  | INT32 / INT64 / FLOAT / DOUBLE | 返回符合采样比例的等分桶随机采样                |

#####  示例

输入序列:`root.ln.wf01.wt01.temperature`从`0.0-99.0`共`100`条数据。

```
IoTDB> select temperature from root.ln.wf01.wt01;
+-----------------------------+-----------------------------+
|                         Time|root.ln.wf01.wt01.temperature|
+-----------------------------+-----------------------------+
|1970-01-01T08:00:00.000+08:00|                          0.0|
|1970-01-01T08:00:00.001+08:00|                          1.0|
|1970-01-01T08:00:00.002+08:00|                          2.0|
|1970-01-01T08:00:00.003+08:00|                          3.0|
|1970-01-01T08:00:00.004+08:00|                          4.0|
|1970-01-01T08:00:00.005+08:00|                          5.0|
|1970-01-01T08:00:00.006+08:00|                          6.0|
|1970-01-01T08:00:00.007+08:00|                          7.0|
|1970-01-01T08:00:00.008+08:00|                          8.0|
|1970-01-01T08:00:00.009+08:00|                          9.0|
|1970-01-01T08:00:00.010+08:00|                         10.0|
|1970-01-01T08:00:00.011+08:00|                         11.0|
|1970-01-01T08:00:00.012+08:00|                         12.0|
|.............................|.............................|            
|1970-01-01T08:00:00.089+08:00|                         89.0|
|1970-01-01T08:00:00.090+08:00|                         90.0|
|1970-01-01T08:00:00.091+08:00|                         91.0|
|1970-01-01T08:00:00.092+08:00|                         92.0|
|1970-01-01T08:00:00.093+08:00|                         93.0|
|1970-01-01T08:00:00.094+08:00|                         94.0|
|1970-01-01T08:00:00.095+08:00|                         95.0|
|1970-01-01T08:00:00.096+08:00|                         96.0|
|1970-01-01T08:00:00.097+08:00|                         97.0|
|1970-01-01T08:00:00.098+08:00|                         98.0|
|1970-01-01T08:00:00.099+08:00|                         99.0|
+-----------------------------+-----------------------------+
```
sql:
```sql
select equal_size_bucket_random_sample(temperature,'proportion'='0.1') as random_sample from root.ln.wf01.wt01;
```
结果:
```
+-----------------------------+-------------+
|                         Time|random_sample|
+-----------------------------+-------------+
|1970-01-01T08:00:00.007+08:00|          7.0|
|1970-01-01T08:00:00.014+08:00|         14.0|
|1970-01-01T08:00:00.020+08:00|         20.0|
|1970-01-01T08:00:00.035+08:00|         35.0|
|1970-01-01T08:00:00.047+08:00|         47.0|
|1970-01-01T08:00:00.059+08:00|         59.0|
|1970-01-01T08:00:00.063+08:00|         63.0|
|1970-01-01T08:00:00.079+08:00|         79.0|
|1970-01-01T08:00:00.086+08:00|         86.0|
|1970-01-01T08:00:00.096+08:00|         96.0|
+-----------------------------+-------------+
Total line number = 10
It costs 0.024s
```

####  等数量分桶聚合采样

采用聚合采样法对输入序列进行采样，用户需要另外提供一个聚合函数参数即
- `type`：聚合类型，取值为`avg`或`max`或`min`或`sum`或`extreme`或`variance`。在缺省情况下，采用`avg`。其中`extreme`表示等分桶中，绝对值最大的值。`variance`表示采样等分桶中的方差。

每个桶采样输出的时间戳为这个桶第一个点的时间戳


| 函数名      | 可接收的输入序列类型                     | 必要的属性参数                               | 输出序列类型     | 功能类型                                             |
|----------|--------------------------------|---------------------------------------|------------|--------------------------------------------------|
| EQUAL_SIZE_BUCKET_AGG_SAMPLE   | INT32 / INT64 / FLOAT / DOUBLE | `proportion`取值范围为`(0, 1]`，默认为`0.1`<br>`type`:取值类型有`avg`, `max`, `min`, `sum`, `extreme`, `variance`, 默认为`avg`  | INT32 / INT64 / FLOAT / DOUBLE | 返回符合采样比例的等分桶聚合采样                |

#####  示例

输入序列:`root.ln.wf01.wt01.temperature`从`0.0-99.0`共`100`条有序数据，同等分桶随机采样的测试数据。

sql:
```sql
select equal_size_bucket_agg_sample(temperature, 'type'='avg','proportion'='0.1') as agg_avg, equal_size_bucket_agg_sample(temperature, 'type'='max','proportion'='0.1') as agg_max, equal_size_bucket_agg_sample(temperature,'type'='min','proportion'='0.1') as agg_min, equal_size_bucket_agg_sample(temperature, 'type'='sum','proportion'='0.1') as agg_sum, equal_size_bucket_agg_sample(temperature, 'type'='extreme','proportion'='0.1') as agg_extreme, equal_size_bucket_agg_sample(temperature, 'type'='variance','proportion'='0.1') as agg_variance from root.ln.wf01.wt01;
```
结果:
```
+-----------------------------+-----------------+-------+-------+-------+-----------+------------+
|                         Time|          agg_avg|agg_max|agg_min|agg_sum|agg_extreme|agg_variance|
+-----------------------------+-----------------+-------+-------+-------+-----------+------------+
|1970-01-01T08:00:00.000+08:00|              4.5|    9.0|    0.0|   45.0|        9.0|        8.25|
|1970-01-01T08:00:00.010+08:00|             14.5|   19.0|   10.0|  145.0|       19.0|        8.25|
|1970-01-01T08:00:00.020+08:00|             24.5|   29.0|   20.0|  245.0|       29.0|        8.25|
|1970-01-01T08:00:00.030+08:00|             34.5|   39.0|   30.0|  345.0|       39.0|        8.25|
|1970-01-01T08:00:00.040+08:00|             44.5|   49.0|   40.0|  445.0|       49.0|        8.25|
|1970-01-01T08:00:00.050+08:00|             54.5|   59.0|   50.0|  545.0|       59.0|        8.25|
|1970-01-01T08:00:00.060+08:00|             64.5|   69.0|   60.0|  645.0|       69.0|        8.25|
|1970-01-01T08:00:00.070+08:00|74.50000000000001|   79.0|   70.0|  745.0|       79.0|        8.25|
|1970-01-01T08:00:00.080+08:00|             84.5|   89.0|   80.0|  845.0|       89.0|        8.25|
|1970-01-01T08:00:00.090+08:00|             94.5|   99.0|   90.0|  945.0|       99.0|        8.25|
+-----------------------------+-----------------+-------+-------+-------+-----------+------------+
Total line number = 10
It costs 0.044s
```

####  等数量分桶 M4 采样

采用M4采样法对输入序列进行采样。即对于每个桶采样首、尾、最小和最大值。

| 函数名      | 可接收的输入序列类型                     | 必要的属性参数                               | 输出序列类型     | 功能类型                                             |
|----------|--------------------------------|---------------------------------------|------------|--------------------------------------------------|
| EQUAL_SIZE_BUCKET_M4_SAMPLE   | INT32 / INT64 / FLOAT / DOUBLE | `proportion`取值范围为`(0, 1]`，默认为`0.1`| INT32 / INT64 / FLOAT / DOUBLE | 返回符合采样比例的等分桶M4采样                |

#####  示例

输入序列:`root.ln.wf01.wt01.temperature`从`0.0-99.0`共`100`条有序数据，同等分桶随机采样的测试数据。

sql:
```sql
select equal_size_bucket_m4_sample(temperature, 'proportion'='0.1') as M4_sample from root.ln.wf01.wt01;
```
结果:
```
+-----------------------------+---------+
|                         Time|M4_sample|
+-----------------------------+---------+
|1970-01-01T08:00:00.000+08:00|      0.0|
|1970-01-01T08:00:00.001+08:00|      1.0|
|1970-01-01T08:00:00.038+08:00|     38.0|
|1970-01-01T08:00:00.039+08:00|     39.0|
|1970-01-01T08:00:00.040+08:00|     40.0|
|1970-01-01T08:00:00.041+08:00|     41.0|
|1970-01-01T08:00:00.078+08:00|     78.0|
|1970-01-01T08:00:00.079+08:00|     79.0|
|1970-01-01T08:00:00.080+08:00|     80.0|
|1970-01-01T08:00:00.081+08:00|     81.0|
|1970-01-01T08:00:00.098+08:00|     98.0|
|1970-01-01T08:00:00.099+08:00|     99.0|
+-----------------------------+---------+
Total line number = 12
It costs 0.065s
```

####  等数量分桶离群值采样

本函数对输入序列进行等数量分桶离群值采样，即根据用户给定的降采样比例和桶内采样个数将输入序列按固定点数等分为若干桶，在每个桶内通过给定的离群值采样方法进行采样。

| 函数名      | 可接收的输入序列类型                     | 必要的属性参数                               | 输出序列类型     | 功能类型                                             |
|----------|--------------------------------|---------------------------------------|------------|--------------------------------------------------|
| EQUAL_SIZE_BUCKET_OUTLIER_SAMPLE   | INT32 / INT64 / FLOAT / DOUBLE | `proportion`取值范围为`(0, 1]`，默认为`0.1`<br>`type`取值为`avg`或`stendis`或`cos`或`prenextdis`，默认为`avg`<br>`number`取值应大于0，默认`3`| INT32 / INT64 / FLOAT / DOUBLE | 返回符合采样比例和桶内采样个数的等分桶离群值采样                |

参数说明
- `proportion`: 采样比例
    - `number`: 每个桶内的采样个数，默认`3`
- `type`: 离群值采样方法，取值为
    - `avg`: 取桶内数据点的平均值，并根据采样比例，找到距离均值最远的`top number`个
    - `stendis`: 取桶内每一个数据点距离桶的首末数据点连成直线的垂直距离，并根据采样比例，找到距离最大的`top number`个
    - `cos`: 设桶内一个数据点为b，b左边的数据点为a，b右边的数据点为c，则取ab与bc向量的夹角的余弦值，值越小，说明形成的角度越大，越可能是异常值。找到cos值最小的`top number`个
    - `prenextdis`: 设桶内一个数据点为b，b左边的数据点为a，b右边的数据点为c，则取ab与bc的长度之和作为衡量标准，和越大越可能是异常值，找到最大的`top number`个

#####  示例

测试数据:`root.ln.wf01.wt01.temperature`从`0.0-99.0`共`100`条数据，其中为了加入离群值，我们使得个位数为5的值自增100。
```
IoTDB> select temperature from root.ln.wf01.wt01;
+-----------------------------+-----------------------------+
|                         Time|root.ln.wf01.wt01.temperature|
+-----------------------------+-----------------------------+
|1970-01-01T08:00:00.000+08:00|                          0.0|
|1970-01-01T08:00:00.001+08:00|                          1.0|
|1970-01-01T08:00:00.002+08:00|                          2.0|
|1970-01-01T08:00:00.003+08:00|                          3.0|
|1970-01-01T08:00:00.004+08:00|                          4.0|
|1970-01-01T08:00:00.005+08:00|                        105.0|
|1970-01-01T08:00:00.006+08:00|                          6.0|
|1970-01-01T08:00:00.007+08:00|                          7.0|
|1970-01-01T08:00:00.008+08:00|                          8.0|
|1970-01-01T08:00:00.009+08:00|                          9.0|
|1970-01-01T08:00:00.010+08:00|                         10.0|
|1970-01-01T08:00:00.011+08:00|                         11.0|
|1970-01-01T08:00:00.012+08:00|                         12.0|
|1970-01-01T08:00:00.013+08:00|                         13.0|
|1970-01-01T08:00:00.014+08:00|                         14.0|
|1970-01-01T08:00:00.015+08:00|                        115.0|
|1970-01-01T08:00:00.016+08:00|                         16.0|
|.............................|.............................|
|1970-01-01T08:00:00.092+08:00|                         92.0|
|1970-01-01T08:00:00.093+08:00|                         93.0|
|1970-01-01T08:00:00.094+08:00|                         94.0|
|1970-01-01T08:00:00.095+08:00|                        195.0|
|1970-01-01T08:00:00.096+08:00|                         96.0|
|1970-01-01T08:00:00.097+08:00|                         97.0|
|1970-01-01T08:00:00.098+08:00|                         98.0|
|1970-01-01T08:00:00.099+08:00|                         99.0|
+-----------------------------+-----------------------------+
```
sql:
```sql
select equal_size_bucket_outlier_sample(temperature, 'proportion'='0.1', 'type'='avg', 'number'='2') as outlier_avg_sample, equal_size_bucket_outlier_sample(temperature, 'proportion'='0.1', 'type'='stendis', 'number'='2') as outlier_stendis_sample, equal_size_bucket_outlier_sample(temperature, 'proportion'='0.1', 'type'='cos', 'number'='2') as outlier_cos_sample, equal_size_bucket_outlier_sample(temperature, 'proportion'='0.1', 'type'='prenextdis', 'number'='2') as outlier_prenextdis_sample from root.ln.wf01.wt01;
```
结果:
```
+-----------------------------+------------------+----------------------+------------------+-------------------------+
|                         Time|outlier_avg_sample|outlier_stendis_sample|outlier_cos_sample|outlier_prenextdis_sample|
+-----------------------------+------------------+----------------------+------------------+-------------------------+
|1970-01-01T08:00:00.005+08:00|             105.0|                 105.0|             105.0|                    105.0|
|1970-01-01T08:00:00.015+08:00|             115.0|                 115.0|             115.0|                    115.0|
|1970-01-01T08:00:00.025+08:00|             125.0|                 125.0|             125.0|                    125.0|
|1970-01-01T08:00:00.035+08:00|             135.0|                 135.0|             135.0|                    135.0|
|1970-01-01T08:00:00.045+08:00|             145.0|                 145.0|             145.0|                    145.0|
|1970-01-01T08:00:00.055+08:00|             155.0|                 155.0|             155.0|                    155.0|
|1970-01-01T08:00:00.065+08:00|             165.0|                 165.0|             165.0|                    165.0|
|1970-01-01T08:00:00.075+08:00|             175.0|                 175.0|             175.0|                    175.0|
|1970-01-01T08:00:00.085+08:00|             185.0|                 185.0|             185.0|                    185.0|
|1970-01-01T08:00:00.095+08:00|             195.0|                 195.0|             195.0|                    195.0|
+-----------------------------+------------------+----------------------+------------------+-------------------------+
Total line number = 10
It costs 0.041s
```

### 11.2 M4函数

####  函数简介

M4用于在窗口内采样第一个点（`first`）、最后一个点（`last`）、最小值点（`bottom`）、最大值点（`top`）：

-   第一个点是拥有这个窗口内最小时间戳的点；
-   最后一个点是拥有这个窗口内最大时间戳的点；
-   最小值点是拥有这个窗口内最小值的点（如果有多个这样的点，M4只返回其中一个）；
-   最大值点是拥有这个窗口内最大值的点（如果有多个这样的点，M4只返回其中一个）。

<img src="/img/github/198178733-a0919d17-0663-4672-9c4f-1efad6f463c2.png" alt="image" style="zoom:50%;" />

| 函数名 | 可接收的输入序列类型           | 属性参数                                                     | 输出序列类型                   | 功能类型                                                     |
| ------ | ------------------------------ | ------------------------------------------------------------ | ------------------------------ | ------------------------------------------------------------ |
| M4     | INT32 / INT64 / FLOAT / DOUBLE | 包含固定点数的窗口和滑动时间窗口使用不同的属性参数。包含固定点数的窗口使用属性`windowSize`和`slidingStep`。滑动时间窗口使用属性`timeInterval`、`slidingStep`、`displayWindowBegin`和`displayWindowEnd`。更多细节见下文。 | INT32 / INT64 / FLOAT / DOUBLE | 返回每个窗口内的第一个点（`first`）、最后一个点（`last`）、最小值点（`bottom`）、最大值点（`top`）。在一个窗口内的聚合点输出之前，M4会将它们按照时间戳递增排序并且去重。 |

####  属性参数

**(1) 包含固定点数的窗口（SlidingSizeWindowAccessStrategy）使用的属性参数:**

+ `windowSize`: 一个窗口内的点数。Int数据类型。必需的属性参数。
+ `slidingStep`: 按照设定的点数来滑动窗口。Int数据类型。可选的属性参数；如果没有设置，默认取值和`windowSize`一样。

<img src="/img/github/198181449-00d563c8-7bce-4ecd-a031-ec120ca42c3f.png" alt="image" style="zoom: 50%;" />

**(2) 滑动时间窗口（SlidingTimeWindowAccessStrategy）使用的属性参数:**

+ `timeInterval`: 一个窗口的时间长度。Long数据类型。必需的属性参数。
+ `slidingStep`: 按照设定的时长来滑动窗口。Long数据类型。可选的属性参数；如果没有设置，默认取值和`timeInterval`一样。
+ `displayWindowBegin`: 窗口滑动的起始时间戳位置（包含在内）。Long数据类型。可选的属性参数；如果没有设置，默认取值为Long.MIN_VALUE，意为使用输入的时间序列的第一个点的时间戳作为窗口滑动的起始时间戳位置。
+ `displayWindowEnd`: 结束时间限制（不包含在内；本质上和`WHERE time < displayWindowEnd`起的效果是一样的)。Long数据类型。可选的属性参数；如果没有设置，默认取值为Long.MAX_VALUE，意为除了输入的时间序列自身数据读取完毕之外没有增加额外的结束时间过滤条件限制。

<img src="/img/github/198183015-93b56644-3330-4acf-ae9e-d718a02b5f4c.png" alt="groupBy window" style="zoom: 67%;" />

####  示例

输入的时间序列：

```sql
+-----------------------------+------------------+
|                         Time|root.vehicle.d1.s1|
+-----------------------------+------------------+
|1970-01-01T08:00:00.001+08:00|               5.0|
|1970-01-01T08:00:00.002+08:00|              15.0|
|1970-01-01T08:00:00.005+08:00|              10.0|
|1970-01-01T08:00:00.008+08:00|               8.0|
|1970-01-01T08:00:00.010+08:00|              30.0|
|1970-01-01T08:00:00.020+08:00|              20.0|
|1970-01-01T08:00:00.025+08:00|               8.0|
|1970-01-01T08:00:00.027+08:00|              20.0|
|1970-01-01T08:00:00.030+08:00|              40.0|
|1970-01-01T08:00:00.033+08:00|               9.0|
|1970-01-01T08:00:00.035+08:00|              10.0|
|1970-01-01T08:00:00.040+08:00|              20.0|
|1970-01-01T08:00:00.045+08:00|              30.0|
|1970-01-01T08:00:00.052+08:00|               8.0|
|1970-01-01T08:00:00.054+08:00|              18.0|
+-----------------------------+------------------+
```

查询语句1：

```sql
select M4(s1,'timeInterval'='25','displayWindowBegin'='0','displayWindowEnd'='100') from root.vehicle.d1
```

输出结果1：

```sql
+-----------------------------+-----------------------------------------------------------------------------------------------+
|                         Time|M4(root.vehicle.d1.s1, "timeInterval"="25", "displayWindowBegin"="0", "displayWindowEnd"="100")|
+-----------------------------+-----------------------------------------------------------------------------------------------+
|1970-01-01T08:00:00.001+08:00|                                                                                            5.0|
|1970-01-01T08:00:00.010+08:00|                                                                                           30.0|
|1970-01-01T08:00:00.020+08:00|                                                                                           20.0|
|1970-01-01T08:00:00.025+08:00|                                                                                            8.0|
|1970-01-01T08:00:00.030+08:00|                                                                                           40.0|
|1970-01-01T08:00:00.045+08:00|                                                                                           30.0|
|1970-01-01T08:00:00.052+08:00|                                                                                            8.0|
|1970-01-01T08:00:00.054+08:00|                                                                                           18.0|
+-----------------------------+-----------------------------------------------------------------------------------------------+
Total line number = 8
```

查询语句2：

```sql
select M4(s1,'windowSize'='10') from root.vehicle.d1
```

输出结果2：

```sql
+-----------------------------+-----------------------------------------+
|                         Time|M4(root.vehicle.d1.s1, "windowSize"="10")|
+-----------------------------+-----------------------------------------+
|1970-01-01T08:00:00.001+08:00|                                      5.0|
|1970-01-01T08:00:00.030+08:00|                                     40.0|
|1970-01-01T08:00:00.033+08:00|                                      9.0|
|1970-01-01T08:00:00.035+08:00|                                     10.0|
|1970-01-01T08:00:00.045+08:00|                                     30.0|
|1970-01-01T08:00:00.052+08:00|                                      8.0|
|1970-01-01T08:00:00.054+08:00|                                     18.0|
+-----------------------------+-----------------------------------------+
Total line number = 7
```

####  推荐的使用场景

**(1) 使用场景：保留极端点的降采样**

由于M4为每个窗口聚合其第一个点（`first`）、最后一个点（`last`）、最小值点（`bottom`）、最大值点（`top`），因此M4通常保留了极值点，因此比其他下采样方法（如分段聚合近似 (PAA)）能更好地保留模式。如果你想对时间序列进行下采样并且希望保留极值点，你可以试试 M4。

**(2) 使用场景：基于M4降采样的大规模时间序列的零误差双色折线图可视化**

参考论文["M4: A Visualization-Oriented Time Series Data Aggregation"](http://www.vldb.org/pvldb/vol7/p797-jugel.pdf)，作为大规模时间序列可视化的降采样方法，M4可以做到双色折线图的零变形。

假设屏幕画布的像素宽乘高是`w*h`，假设时间序列要可视化的时间范围是`[tqs,tqe)`，并且(tqe-tqs)是w的整数倍，那么落在第i个时间跨度`Ii=[tqs+(tqe-tqs)/w*(i-1),tqs+(tqe-tqs)/w*i)` 内的点将会被画在第i个像素列中，i=1,2,...,w。于是从可视化驱动的角度出发，使用查询语句：`"select M4(s1,'timeInterval'='(tqe-tqs)/w','displayWindowBegin'='tqs','displayWindowEnd'='tqe') from root.vehicle.d1"`，来采集每个时间跨度内的第一个点（`first`）、最后一个点（`last`）、最小值点（`bottom`）、最大值点（`top`）。降采样时间序列的结果点数不会超过`4*w`个，与此同时，使用这些聚合点画出来的二色折线图与使用原始数据画出来的在像素级别上是完全一致的。

为了免除参数值硬编码的麻烦，当Grafana用于可视化时，我们推荐使用Grafana的[模板变量](https://grafana.com/docs/grafana/latest/dashboards/variables/add-template-variables/#global-variables)`$ __interval_ms`，如下所示：

```sql
select M4(s1,'timeInterval'='$__interval_ms') from root.sg1.d1
```

其中`timeInterval`自动设置为`(tqe-tqs)/w`。请注意，这里的时间精度假定为毫秒。

####  和其它函数的功能比较

| SQL                                               | 是否支持M4聚合                                               | 滑动窗口类型                                      | 示例                                                         | 相关文档                                                     |
| ------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 1. 带有Group By子句的内置聚合函数                 | 不支持，缺少`BOTTOM_TIME`和`TOP_TIME`，即缺少最小值点和最大值点的时间戳。 | Time Window                                       | `select count(status), max_value(temperature) from root.ln.wf01.wt01 group by ([2017-11-01 00:00:00, 2017-11-07 23:00:00), 3h, 1d)` | https://iotdb.apache.org/UserGuide/Master/Query-Data/Aggregate-Query.html#built-in-aggregate-functions <br />https://iotdb.apache.org/UserGuide/Master/Query-Data/Aggregate-Query.html#downsampling-aggregate-query |
| 2. EQUAL_SIZE_BUCKET_M4_SAMPLE (内置UDF)          | 支持*                                                        | Size Window. `windowSize = 4*(int)(1/proportion)` | `select equal_size_bucket_m4_sample(temperature, 'proportion'='0.1') as M4_sample from root.ln.wf01.wt01` | https://iotdb.apache.org/UserGuide/Master/Query-Data/Select-Expression.html#time-series-generating-functions |
| **3. M4 (内置UDF)**                               | 支持*                                                        | Size Window, Time Window                          | (1) Size Window: `select M4(s1,'windowSize'='10') from root.vehicle.d1` <br />(2) Time Window: `select M4(s1,'timeInterval'='25','displayWindowBegin'='0','displayWindowEnd'='100') from root.vehicle.d1` | 本文档                                                       |
| 4. 扩展带有Group By子句的内置聚合函数来支持M4聚合 | 未实施                                                       | 未实施                                            | 未实施                                                       | 未实施                                                       |

进一步比较`EQUAL_SIZE_BUCKET_M4_SAMPLE`和`M4`：

**(1) 不同的M4聚合函数定义：**

在每个窗口内，`EQUAL_SIZE_BUCKET_M4_SAMPLE`从排除了第一个点和最后一个点之后剩余的点中提取最小值点和最大值点。

而`M4`则是从窗口内所有点中（包括第一个点和最后一个点）提取最小值点和最大值点，这个定义与元数据中保存的`max_value`和`min_value`的语义更加一致。

值得注意的是，在一个窗口内的聚合点输出之前，`EQUAL_SIZE_BUCKET_M4_SAMPLE`和`M4`都会将它们按照时间戳递增排序并且去重。

**(2) 不同的滑动窗口：**

`EQUAL_SIZE_BUCKET_M4_SAMPLE`使用SlidingSizeWindowAccessStrategy，并且通过采样比例（`proportion`）来间接控制窗口点数（`windowSize`)，转换公式是`windowSize = 4*(int)(1/proportion)`。

`M4`支持两种滑动窗口：SlidingSizeWindowAccessStrategy和SlidingTimeWindowAccessStrategy，并且`M4`通过相应的参数直接控制窗口的点数或者时长。

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

## 12. 时间序列处理

### 12.1 CHANGE_POINTS

#### 函数简介

本函数用于去除输入序列中的连续相同值。如输入序列`1，1，2，2，3`输出序列为`1，2，3`。

**函数名：** CHANGE_POINTS

**输入序列：** 仅支持输入1个序列。

**参数：** 无

#### 使用示例

原始数据：

```
+-----------------------------+---------------------------+---------------------------+---------------------------+---------------------------+---------------------------+---------------------------+
|                         Time|root.testChangePoints.d1.s1|root.testChangePoints.d1.s2|root.testChangePoints.d1.s3|root.testChangePoints.d1.s4|root.testChangePoints.d1.s5|root.testChangePoints.d1.s6|
+-----------------------------+---------------------------+---------------------------+---------------------------+---------------------------+---------------------------+---------------------------+
|1970-01-01T08:00:00.001+08:00|                       true|                          1|                          1|                        1.0|                        1.0|                     1test1|
|1970-01-01T08:00:00.002+08:00|                       true|                          2|                          2|                        2.0|                        1.0|                     2test2|
|1970-01-01T08:00:00.003+08:00|                      false|                          1|                          2|                        1.0|                        1.0|                     2test2|
|1970-01-01T08:00:00.004+08:00|                       true|                          1|                          3|                        1.0|                        1.0|                     1test1|
|1970-01-01T08:00:00.005+08:00|                       true|                          1|                          3|                        1.0|                        1.0|                     1test1|
+-----------------------------+---------------------------+---------------------------+---------------------------+---------------------------+---------------------------+---------------------------+
```

用于查询的SQL语句：

```sql
select change_points(s1), change_points(s2), change_points(s3), change_points(s4), change_points(s5), change_points(s6) from root.testChangePoints.d1
```

输出序列：

```
+-----------------------------+------------------------------------------+------------------------------------------+------------------------------------------+------------------------------------------+------------------------------------------+------------------------------------------+
|                         Time|change_points(root.testChangePoints.d1.s1)|change_points(root.testChangePoints.d1.s2)|change_points(root.testChangePoints.d1.s3)|change_points(root.testChangePoints.d1.s4)|change_points(root.testChangePoints.d1.s5)|change_points(root.testChangePoints.d1.s6)|
+-----------------------------+------------------------------------------+------------------------------------------+------------------------------------------+------------------------------------------+------------------------------------------+------------------------------------------+
|1970-01-01T08:00:00.001+08:00|                                      true|                                         1|                                         1|                                       1.0|                                       1.0|                                    1test1|
|1970-01-01T08:00:00.002+08:00|                                      null|                                         2|                                         2|                                       2.0|                                      null|                                    2test2|
|1970-01-01T08:00:00.003+08:00|                                     false|                                         1|                                      null|                                       1.0|                                      null|                                      null|
|1970-01-01T08:00:00.004+08:00|                                      true|                                      null|                                         3|                                      null|                                      null|                                    1test1|
+-----------------------------+------------------------------------------+------------------------------------------+------------------------------------------+------------------------------------------+------------------------------------------+------------------------------------------+
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

## 13. Lambda 表达式

### 13.1 JEXL 自定义函数

#### 函数简介

Java Expression Language (JEXL) 是一个表达式语言引擎。我们使用 JEXL 来扩展 UDF，在命令行中，通过简易的 lambda 表达式来实现 UDF。

lambda 表达式中支持的运算符详见链接 [JEXL 中 lambda 表达式支持的运算符](https://commons.apache.org/proper/commons-jexl/apidocs/org/apache/commons/jexl3/package-summary.html#customization) 。

| 函数名      | 可接收的输入序列类型                     | 必要的属性参数                               | 输出序列类型     | 功能类型                                             |
|----------|--------------------------------|---------------------------------------|------------|--------------------------------------------------|
| JEXL   | INT32 / INT64 / FLOAT / DOUBLE / TEXT / BOOLEAN | `expr`是一个支持标准的一元或多元参数的lambda表达式，符合`x -> {...}`或`(x, y, z) -> {...}`的格式，例如`x -> {x * 2}`, `(x, y, z) -> {x + y * z}`| INT32 / INT64 / FLOAT / DOUBLE / TEXT / BOOLEAN | 返回将输入的时间序列通过lambda表达式变换的序列             |

#### 使用示例

输入序列：
```
IoTDB> select * from root.ln.wf01.wt01;
+-----------------------------+---------------------+--------------------+-----------------------------+
|                         Time|root.ln.wf01.wt01.str|root.ln.wf01.wt01.st|root.ln.wf01.wt01.temperature|
+-----------------------------+---------------------+--------------------+-----------------------------+
|1970-01-01T08:00:00.000+08:00|                  str|                10.0|                          0.0|
|1970-01-01T08:00:00.001+08:00|                  str|                20.0|                          1.0|
|1970-01-01T08:00:00.002+08:00|                  str|                30.0|                          2.0|
|1970-01-01T08:00:00.003+08:00|                  str|                40.0|                          3.0|
|1970-01-01T08:00:00.004+08:00|                  str|                50.0|                          4.0|
|1970-01-01T08:00:00.005+08:00|                  str|                60.0|                          5.0|
|1970-01-01T08:00:00.006+08:00|                  str|                70.0|                          6.0|
|1970-01-01T08:00:00.007+08:00|                  str|                80.0|                          7.0|
|1970-01-01T08:00:00.008+08:00|                  str|                90.0|                          8.0|
|1970-01-01T08:00:00.009+08:00|                  str|               100.0|                          9.0|
|1970-01-01T08:00:00.010+08:00|                  str|               110.0|                         10.0|
+-----------------------------+---------------------+--------------------+-----------------------------+
```

用于查询的SQL语句：
```sql
select jexl(temperature, 'expr'='x -> {x + x}') as jexl1, jexl(temperature, 'expr'='x -> {x * 3}') as jexl2, jexl(temperature, 'expr'='x -> {x * x}') as jexl3, jexl(temperature, 'expr'='x -> {multiply(x, 100)}') as jexl4, jexl(temperature, st, 'expr'='(x, y) -> {x + y}') as jexl5, jexl(temperature, st, str, 'expr'='(x, y, z) -> {x + y + z}') as jexl6 from root.ln.wf01.wt01;
```

输出序列：
```
+-----------------------------+-----+-----+-----+------+-----+--------+
|                         Time|jexl1|jexl2|jexl3| jexl4|jexl5|   jexl6|
+-----------------------------+-----+-----+-----+------+-----+--------+
|1970-01-01T08:00:00.000+08:00|  0.0|  0.0|  0.0|   0.0| 10.0| 10.0str|
|1970-01-01T08:00:00.001+08:00|  2.0|  3.0|  1.0| 100.0| 21.0| 21.0str|
|1970-01-01T08:00:00.002+08:00|  4.0|  6.0|  4.0| 200.0| 32.0| 32.0str|
|1970-01-01T08:00:00.003+08:00|  6.0|  9.0|  9.0| 300.0| 43.0| 43.0str|
|1970-01-01T08:00:00.004+08:00|  8.0| 12.0| 16.0| 400.0| 54.0| 54.0str|
|1970-01-01T08:00:00.005+08:00| 10.0| 15.0| 25.0| 500.0| 65.0| 65.0str|
|1970-01-01T08:00:00.006+08:00| 12.0| 18.0| 36.0| 600.0| 76.0| 76.0str|
|1970-01-01T08:00:00.007+08:00| 14.0| 21.0| 49.0| 700.0| 87.0| 87.0str|
|1970-01-01T08:00:00.008+08:00| 16.0| 24.0| 64.0| 800.0| 98.0| 98.0str|
|1970-01-01T08:00:00.009+08:00| 18.0| 27.0| 81.0| 900.0|109.0|109.0str|
|1970-01-01T08:00:00.010+08:00| 20.0| 30.0|100.0|1000.0|120.0|120.0str|
+-----------------------------+-----+-----+-----+------+-----+--------+
Total line number = 11
It costs 0.118s
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

## 14. 条件表达式

### 14.1 CASE

CASE表达式是一种条件表达式，可用于根据特定条件返回不同的值，功能类似于其它语言中的if-else。
CASE表达式由以下部分组成：
- CASE关键字：表示开始CASE表达式。
- WHEN-THEN子句：可能存在多个，用于定义条件与给出结果。此子句又分为WHEN和THEN两个部分，WHEN部分表示条件，THEN部分表示结果表达式。如果WHEN条件为真，则返回对应的THEN结果。
- ELSE子句：如果没有任何WHEN-THEN子句的条件为真，则返回ELSE子句中的结果。可以不存在ELSE子句。
- END关键字：表示结束CASE表达式。

CASE表达式是一种标量运算，可以配合任何其它的标量运算或聚合函数使用。

下文把所有THEN部分和ELSE子句并称为结果子句。

#### 语法示例

CASE表达式支持两种格式。

语法示例如下：
- 格式1：
```sql
  CASE
    WHEN condition1 THEN expression1
    [WHEN condition2 THEN expression2] ...
    [ELSE expression_end]
  END
```
  从上至下检查WHEN子句中的condition。

  condition为真时返回对应THEN子句中的expression，condition为假时继续检查下一个WHEN子句中的condition。
- 格式2：
```sql
  CASE caseValue
    WHEN whenValue1 THEN expression1
    [WHEN whenValue2 THEN expression2] ...
    [ELSE expression_end]
  END
```

  从上至下检查WHEN子句中的whenValue是否与caseValue相等。

  满足caseValue=whenValue时返回对应THEN子句中的expression，不满足时继续检查下一个WHEN子句中的whenValue。

  格式2会被iotdb转换成等效的格式1，例如以上sql语句会转换成：
```sql
  CASE
    WHEN caseValue=whenValue1 THEN expression1
    [WHEN caseValue=whenValue1 THEN expression1] ...
    [ELSE expression_end]
  END
```

如果格式1中的condition均不为真，或格式2中均不满足caseVaule=whenValue，则返回ELSE子句中的expression_end；不存在ELSE子句则返回null。

#### 注意事项

- 格式1中，所有WHEN子句必须返回BOOLEAN类型。
- 格式2中，所有WHEN子句必须能够与CASE子句进行判等。
- 一个CASE表达式中所有结果子句的返回值类型需要满足一定的条件：
  - BOOLEAN类型不能与其它类型共存，存在其它类型会报错。
  - TEXT类型不能与其它类型共存，存在其它类型会报错。
  - 其它四种数值类型可以共存，最终结果会为DOUBLE类型，转换过程可能会存在精度损失。
- CASE表达式没有实现惰性计算，即所有子句都会被计算。
- CASE表达式不支持与UDF混用。
- CASE表达式内部不能存在聚合函数，但CASE表达式的结果可以提供给聚合函数。
- 使用CLI时，由于CASE表达式字符串较长，推荐用as为表达式提供别名。

#### 使用示例

##### 示例1

CASE表达式可对数据进行直观地分析，例如：

- 某种化学产品的制备需要温度和压力都处于特定范围之内
- 在制备过程中传感器会侦测温度和压力，在iotdb中形成T(temperature)和P(pressure)两个时间序列

这种应用场景下，CASE表达式可以指出哪些时间的参数是合适的，哪些时间的参数不合适，以及为什么不合适。

数据：
```sql
IoTDB> select * from root.test1
+-----------------------------+------------+------------+
|                         Time|root.test1.P|root.test1.T|
+-----------------------------+------------+------------+
|2023-03-29T11:25:54.724+08:00|   1000000.0|      1025.0|
|2023-03-29T11:26:13.445+08:00|   1000094.0|      1040.0|
|2023-03-29T11:27:36.988+08:00|   1000095.0|      1041.0|
|2023-03-29T11:27:56.446+08:00|   1000095.0|      1059.0|
|2023-03-29T11:28:20.838+08:00|   1200000.0|      1040.0|
+-----------------------------+------------+------------+
```

SQL语句：
```sql
select T, P, case
when 1000<T and T<1050 and 1000000<P and P<1100000 then "good!"
when T<=1000 or T>=1050 then "bad temperature"
when P<=1000000 or P>=1100000 then "bad pressure"
end as `result`
from root.test1
```


输出：
```
+-----------------------------+------------+------------+---------------+
|                         Time|root.test1.T|root.test1.P|         result|
+-----------------------------+------------+------------+---------------+
|2023-03-29T11:25:54.724+08:00|      1025.0|   1000000.0|   bad pressure|
|2023-03-29T11:26:13.445+08:00|      1040.0|   1000094.0|          good!|
|2023-03-29T11:27:36.988+08:00|      1041.0|   1000095.0|          good!|
|2023-03-29T11:27:56.446+08:00|      1059.0|   1000095.0|bad temperature|
|2023-03-29T11:28:20.838+08:00|      1040.0|   1200000.0|   bad pressure|
+-----------------------------+------------+------------+---------------+
```


##### 示例2

CASE表达式可实现结果的自由转换，例如将具有某种模式的字符串转换成另一种字符串。

数据：
```sql
IoTDB> select * from root.test2
+-----------------------------+--------------+
|                         Time|root.test2.str|
+-----------------------------+--------------+
|2023-03-27T18:23:33.427+08:00|         abccd|
|2023-03-27T18:23:39.389+08:00|         abcdd|
|2023-03-27T18:23:43.463+08:00|       abcdefg|
+-----------------------------+--------------+
```

SQL语句：
```sql
select str, case
when str like "%cc%" then "has cc"
when str like "%dd%" then "has dd"
else "no cc and dd" end as `result`
from root.test2
```

输出：
```
+-----------------------------+--------------+------------+
|                         Time|root.test2.str|      result|
+-----------------------------+--------------+------------+
|2023-03-27T18:23:33.427+08:00|         abccd|      has cc|
|2023-03-27T18:23:39.389+08:00|         abcdd|      has dd|
|2023-03-27T18:23:43.463+08:00|       abcdefg|no cc and dd|
+-----------------------------+--------------+------------+
```

##### 示例3：搭配聚合函数

###### 合法：聚合函数←CASE表达式

CASE表达式可作为聚合函数的参数。例如，与聚合函数COUNT搭配，可实现同时按多个条件进行数据统计。

数据：
```sql
IoTDB> select * from root.test3
+-----------------------------+------------+
|                         Time|root.test3.x|
+-----------------------------+------------+
|2023-03-27T18:11:11.300+08:00|         0.0|
|2023-03-27T18:11:14.658+08:00|         1.0|
|2023-03-27T18:11:15.981+08:00|         2.0|
|2023-03-27T18:11:17.668+08:00|         3.0|
|2023-03-27T18:11:19.112+08:00|         4.0|
|2023-03-27T18:11:20.822+08:00|         5.0|
|2023-03-27T18:11:22.462+08:00|         6.0|
|2023-03-27T18:11:24.174+08:00|         7.0|
|2023-03-27T18:11:25.858+08:00|         8.0|
|2023-03-27T18:11:27.979+08:00|         9.0|
+-----------------------------+------------+
```

SQL语句：

```sql
select
count(case when x<=1 then 1 end) as `(-∞,1]`,
count(case when 1<x and x<=3 then 1 end) as `(1,3]`,
count(case when 3<x and x<=7 then 1 end) as `(3,7]`,
count(case when 7<x then 1 end) as `(7,+∞)`
from root.test3
```

输出：
```
+------+-----+-----+------+
|(-∞,1]|(1,3]|(3,7]|(7,+∞)|
+------+-----+-----+------+
|     2|    2|    4|     2|
+------+-----+-----+------+
```

###### 非法：CASE表达式←聚合函数

不支持在CASE表达式内部使用聚合函数。

SQL语句：
```sql
select case when x<=1 then avg(x) else sum(x) end from root.test3
```

输出：
```
Msg: 701: Raw data and aggregation result hybrid calculation is not supported.
```

##### 示例4：格式2

一个使用格式2的简单例子。如果所有条件都为判等，则推荐使用格式2，以简化SQL语句。

数据：
```sql
IoTDB> select * from root.test4
+-----------------------------+------------+
|                         Time|root.test4.x|
+-----------------------------+------------+
|1970-01-01T08:00:00.001+08:00|         1.0|
|1970-01-01T08:00:00.002+08:00|         2.0|
|1970-01-01T08:00:00.003+08:00|         3.0|
|1970-01-01T08:00:00.004+08:00|         4.0|
+-----------------------------+------------+
```

SQL语句：
```sql
select x, case x when 1 then "one" when 2 then "two" else "other" end from root.test4
```

输出：
```
+-----------------------------+------------+-----------------------------------------------------------------------------------+
|                         Time|root.test4.x|CASE WHEN root.test4.x = 1 THEN "one" WHEN root.test4.x = 2 THEN "two" ELSE "other"|
+-----------------------------+------------+-----------------------------------------------------------------------------------+
|1970-01-01T08:00:00.001+08:00|         1.0|                                                                                one|
|1970-01-01T08:00:00.002+08:00|         2.0|                                                                                two|
|1970-01-01T08:00:00.003+08:00|         3.0|                                                                              other|
|1970-01-01T08:00:00.004+08:00|         4.0|                                                                              other|
+-----------------------------+------------+-----------------------------------------------------------------------------------+
```

##### 示例5：结果子句类型

CASE表达式的结果子句的返回值需要满足一定的类型限制。

此示例中，继续使用示例4中的数据。

###### 非法：BOOLEAN与其它类型共存

SQL语句：
```sql
select x, case x when 1 then true when 2 then 2 end from root.test4
```

输出：
```
Msg: 701: CASE expression: BOOLEAN and other types cannot exist at same time
```

###### 合法：只存在BOOLEAN类型

SQL语句：
```sql
select x, case x when 1 then true when 2 then false end as `result` from root.test4
```

输出：
```
+-----------------------------+------------+------+
|                         Time|root.test4.x|result|
+-----------------------------+------------+------+
|1970-01-01T08:00:00.001+08:00|         1.0|  true|
|1970-01-01T08:00:00.002+08:00|         2.0| false|
|1970-01-01T08:00:00.003+08:00|         3.0|  null|
|1970-01-01T08:00:00.004+08:00|         4.0|  null|
+-----------------------------+------------+------+
```

###### 非法：TEXT与其它类型共存

SQL语句：
```sql
select x, case x when 1 then 1 when 2 then "str" end from root.test4
```

输出：
```
Msg: 701: CASE expression: TEXT and other types cannot exist at same time
```

###### 合法：只存在TEXT类型

见示例1。

###### 合法：数值类型共存

SQL语句：
```sql
select x, case x
when 1 then 1
when 2 then 222222222222222
when 3 then 3.3
when 4 then 4.4444444444444
end as `result`
from root.test4
```

输出：
```
+-----------------------------+------------+-------------------+
|                         Time|root.test4.x|             result|
+-----------------------------+------------+-------------------+
|1970-01-01T08:00:00.001+08:00|         1.0|                1.0|
|1970-01-01T08:00:00.002+08:00|         2.0|2.22222222222222E14|
|1970-01-01T08:00:00.003+08:00|         3.0|  3.299999952316284|
|1970-01-01T08:00:00.004+08:00|         4.0|   4.44444465637207|
+-----------------------------+------------+-------------------+
```