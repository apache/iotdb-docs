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

# FILL 子句

## 1. 功能介绍

在执行数据查询时，可能会遇到某些列在某些行中没有数据，导致结果集中出现 NULL 值。这些 NULL 值不利于数据的可视化展示和分析，因此 IoTDB 提供了 FILL 子句来填充这些 NULL 值。

当查询中包含 ORDER BY 子句时，FILL 子句会在 ORDER BY 之前执行。而如果存在 GAPFILL（ date_bin_gapfill 函数）操作，则 FILL 子句会在 GAPFILL 之后执行。

## 2. 语法概览

```sql
fillClause
    : FILL METHOD fillMethod
    ;

fillMethod
    : LINEAR timeColumnClause? fillGroupClause?                           #linearFill
    | PREVIOUS timeBoundClause? timeColumnClause? fillGroupClause?        #previousFill
    | CONSTANT literalExpression                                          #valueFill
    ;

timeColumnClause
    : TIME_COLUMN INTEGER_VALUE
    ;

fillGroupClause
    : FILL_GROUP INTEGER_VALUE (',' INTEGER_VALUE)*
    ;

timeBoundClause
    : TIME_BOUND duration=timeDuration
    ;

timeDuration
    : (INTEGER_VALUE intervalField)+
    ;
intervalField
    : YEAR | MONTH | WEEK | DAY | HOUR | MINUTE | SECOND | MILLISECOND | MICROSECOND | NANOSECOND
    ;
```

### 2.1 填充方式

IoTDB 支持以下三种空值填充方式：

1. **`PREVIOUS`填充**：使用该列前一个非空值进行填充，V2.0.8-beta 版本起仅该方式支持支持 OBJECT 类型。
2. **`LINEAR`填充**：使用该列前一个非空值和下一个非空值的线性插值进行填充。
3. **`Constant`填充**：使用指定的常量值进行填充。

只能指定一种填充方法，且该方法会作用于结果集的全部列。

### 2.2 数据类型与支持的填充方法

| Data Type | Previous | Linear | Constant |
| :-------- | :------- | :----- | :------- |
| boolean   | √        | -      | √        |
| int32     | √        | √      | √        |
| int64     | √        | √      | √        |
| float     | √        | √      | √        |
| double    | √        | √      | √        |
| text      | √        | -      | √        |
| string    | √        | -      | √        |
| blob      | √        | -      | √        |
| timestamp | √        | √      | √        |
| date      | √        | √      | √        |

注意：对于数据类型不支持指定填充方法的列，既不进行填充，也不抛出异常，只是保持原样。

## 3. 示例数据

在[示例数据页面](../Reference/Sample-Data.md)中，包含了用于构建表结构和插入数据的SQL语句，下载并在IoTDB CLI中执行这些语句，即可将数据导入IoTDB，您可以使用这些数据来测试和执行示例中的SQL语句，并获得相应的结果。

### 3.1 PREVIOUS 填充：

对于查询结果集中的空值，使用该列的前一个非空值进行填充。

#### 3.1.1 参数介绍：

- TIME_BOUND（可选）：向前查看的时间阈值。如果当前空值的时间戳与前一个非空值的时间戳之间的间隔超过了此阈值，则不会进行填充。默认选择查询结果中第一个 TIMESTAMP 类型的列来确定是否超出了时间阈值。
  - 时间阈值参数格式为时间间隔，数值部分需要为整数，单位部分 y 表示年，mo 表示月，w 表示周，d 表示天，h 表示小时，m 表示分钟，s 表示秒，ms 表示毫秒，µs 表示微秒，ns 表示纳秒，如1d1h。
- TIME_COLUMN（可选）：若需手动指定用于判断时间阈值的 TIMESTAMP 列，可通过在 `TIME_COLUMN` 参数后指定数字（从1开始）来确定列的顺序位置，该数字代表在原始表中 TIMESTAMP 列的具体位置。

#### 3.1.2 示例

不使用任何填充方法：

```sql
SELECT time, temperature, status 
  FROM table1 
  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00
    AND plant_id='1001' and device_id='101';
```

查询结果：

```sql
+-----------------------------+-----------+------+
|                         time|temperature|status|
+-----------------------------+-----------+------+
|2024-11-27T16:38:00.000+08:00|       null|  true|
|2024-11-27T16:39:00.000+08:00|       85.0|  null|
|2024-11-27T16:40:00.000+08:00|       85.0|  null|
|2024-11-27T16:41:00.000+08:00|       85.0|  null|
|2024-11-27T16:42:00.000+08:00|       null| false|
|2024-11-27T16:43:00.000+08:00|       null| false|
|2024-11-27T16:44:00.000+08:00|       null| false|
+-----------------------------+-----------+------+
Total line number = 7
It costs 0.088s
```

使用 PREVIOUS 填充方法（结果将使用前一个非空值填充 NULL 值）：

```sql
SELECT time, temperature, status 
  FROM table1 
  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00
    AND plant_id='1001' and device_id='101'
  FILL METHOD PREVIOUS;
```

查询结果：

```sql
+-----------------------------+-----------+------+
|                         time|temperature|status|
+-----------------------------+-----------+------+
|2024-11-27T16:38:00.000+08:00|       null|  true|
|2024-11-27T16:39:00.000+08:00|       85.0|  true|
|2024-11-27T16:40:00.000+08:00|       85.0|  true|
|2024-11-27T16:41:00.000+08:00|       85.0|  true|
|2024-11-27T16:42:00.000+08:00|       85.0| false|
|2024-11-27T16:43:00.000+08:00|       85.0| false|
|2024-11-27T16:44:00.000+08:00|       85.0| false|
+-----------------------------+-----------+------+
Total line number = 7
It costs 0.091s
```

使用 PREVIOUS 填充方法（指定时间阈值）：

```sql
# 不指定时间列
SELECT time, temperature, status 
  FROM table1 
  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00
      AND plant_id='1001' and device_id='101'
  FILL METHOD PREVIOUS TIME_BOUND 1m;

# 手动指定时间列
SELECT time, temperature, status 
  FROM table1 
  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00
      AND plant_id='1001' and device_id='101'
  FILL METHOD PREVIOUS        1m TIME_COLUMN 1;
```

查询结果：

```sql
+-----------------------------+-----------+------+
|                         time|temperature|status|
+-----------------------------+-----------+------+
|2024-11-27T16:38:00.000+08:00|       null|  true|
|2024-11-27T16:39:00.000+08:00|       85.0|  true|
|2024-11-27T16:40:00.000+08:00|       85.0|  null|
|2024-11-27T16:41:00.000+08:00|       85.0|  null|
|2024-11-27T16:42:00.000+08:00|       85.0| false|
|2024-11-27T16:43:00.000+08:00|       null| false|
|2024-11-27T16:44:00.000+08:00|       null| false|
+-----------------------------+-----------+------+
Total line number = 7
It costs 0.075s
```

### 3.2 LINEAR 填充

对于查询结果集中的空值，用该列的前一个非空值和后一个非空值的线性插值填充。

#### 3.2.1 线性填充规则：

- 如果之前都是空值，或者之后都是空值，则不进行填充。
- 如果列的数据类型是 boolean/string/blob/text，则不会进行填充，也不会抛出异常。
- 若没有指定时间列，默认选择 SELECT 子句中第一个数据类型为 TIMESTAMP 类型的列作为辅助时间列进行线性插值。如果不存在数据类型为TIMESTAMP的列，系统将抛出异常。

#### 3.2.2 参数介绍：

- TIME_COLUMN（可选）：可以通过在`TIME_COLUMN`参数后指定数字（从1开始）来手动指定用于判断时间阈值的`TIMESTAMP`列，作为线性插值的辅助列，该数字代表原始表中`TIMESTAMP`列的具体位置。

注意：不强制要求线性插值的辅助列一定是 time 列，任何类型为 TIMESTAMP 的表达式都可以，不过因为线性插值只有在辅助列是升序或者降序的时候，才有意义，所以用户如果指定了其他的列，需要自行保证结果集是按照那一列升序或降序排列的。

#### 3.2.3 示例

```sql
SELECT time, temperature, status 
  FROM table1 
  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00
      AND plant_id='1001' and device_id='101'
  FILL METHOD LINEAR;
```

查询结果：

```sql
+-----------------------------+-----------+------+
|                         time|temperature|status|
+-----------------------------+-----------+------+
|2024-11-27T16:38:00.000+08:00|       null|  true|
|2024-11-27T16:39:00.000+08:00|       85.0|  null|
|2024-11-27T16:40:00.000+08:00|       85.0|  null|
|2024-11-27T16:41:00.000+08:00|       85.0|  null|
|2024-11-27T16:42:00.000+08:00|       null| false|
|2024-11-27T16:43:00.000+08:00|       null| false|
|2024-11-27T16:44:00.000+08:00|       null| false|
+-----------------------------+-----------+------+
Total line number = 7
It costs 0.053s
```

### 3.3 Constant 填充：

对于查询结果集中的空值，使用指定的常量进行填充。

#### 3.3.1 常量填充规则：

- 若数据类型与输入的常量不匹配，IoTDB 不会填充查询结果，也不会抛出异常。
- 若插入的常量值超出了其数据类型所能表示的最大值，IoTDB 不会填充查询结果，也不会抛出异常。

#### 3.3.2 示例

使用`FLOAT`常量填充时，SQL 语句如下所示：

```sql
SELECT time, temperature, status 
  FROM table1 
  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00
      AND plant_id='1001' and device_id='101'
  FILL METHOD CONSTANT 80.0;
```

查询结果：

```sql
+-----------------------------+-----------+------+
|                         time|temperature|status|
+-----------------------------+-----------+------+
|2024-11-27T16:38:00.000+08:00|       80.0|  true|
|2024-11-27T16:39:00.000+08:00|       85.0|  true|
|2024-11-27T16:40:00.000+08:00|       85.0|  true|
|2024-11-27T16:41:00.000+08:00|       85.0|  true|
|2024-11-27T16:42:00.000+08:00|       80.0| false|
|2024-11-27T16:43:00.000+08:00|       80.0| false|
|2024-11-27T16:44:00.000+08:00|       80.0| false|
+-----------------------------+-----------+------+
Total line number = 7
It costs 0.242s
```

使用`BOOLEAN`常量填充时，SQL 语句如下所示：

```sql
SELECT time, temperature, status 
  FROM table1 
  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00
      AND plant_id='1001' and device_id='101'
  FILL METHOD CONSTANT true;
```

查询结果：

```sql
+-----------------------------+-----------+------+
|                         time|temperature|status|
+-----------------------------+-----------+------+
|2024-11-27T16:38:00.000+08:00|        1.0|  true|
|2024-11-27T16:39:00.000+08:00|       85.0|  true|
|2024-11-27T16:40:00.000+08:00|       85.0|  true|
|2024-11-27T16:41:00.000+08:00|       85.0|  true|
|2024-11-27T16:42:00.000+08:00|        1.0| false|
|2024-11-27T16:43:00.000+08:00|        1.0| false|
|2024-11-27T16:44:00.000+08:00|        1.0| false|
+-----------------------------+-----------+------+
Total line number = 7
It costs 0.073s
```

## 4. 高阶用法

使用 `PREVIOUS` 和 `LINEAR` FILL 时，还支持额外的 `FILL_GROUP` 参数，来进行分组内填充。

在使用 group by 子句 + fill 时，想在分组内进行填充，而不受其他分组的影响。

例如：对每个 `device_id` 内部的空值进行填充，而不使用其他设备的值：

```sql
SELECT date_bin(1h, time) AS hour_time,  plant_id, device_id, avg(temperature) AS avg_temp
  FROM table1
  WHERE time >= 2024-11-28 08:00:00 AND time < 2024-11-30 14:30:00
  group by 1, plant_id, device_id;
```

查询结果：

```sql
+-----------------------------+--------+---------+--------+
|                    hour_time|plant_id|device_id|avg_temp|
+-----------------------------+--------+---------+--------+
|2024-11-28T08:00:00.000+08:00|    3001|      100|    85.0|
|2024-11-28T09:00:00.000+08:00|    3001|      100|    null|
|2024-11-28T10:00:00.000+08:00|    3001|      100|    85.0|
|2024-11-28T11:00:00.000+08:00|    3001|      100|    88.0|
|2024-11-29T10:00:00.000+08:00|    3001|      101|    85.0|
|2024-11-29T11:00:00.000+08:00|    3002|      100|    null|
|2024-11-29T18:00:00.000+08:00|    3002|      100|    90.0|
|2024-11-30T09:00:00.000+08:00|    3002|      101|    90.0|
+-----------------------------+--------+---------+--------+
Total line number = 8
It costs 0.110s
```

若没有指定 FILL_GROUP 参数时，`100` 的空值会被 `101` 的值填充：

```sql
SELECT date_bin(1h, time) AS hour_time,  plant_id, device_id, avg(temperature) AS avg_temp
  FROM table1
  WHERE time >= 2024-11-28 08:00:00 AND time < 2024-11-30 14:30:00
  group by 1, plant_id, device_id
  FILL METHOD PREVIOUS;
```

查询结果：

```sql
+-----------------------------+--------+---------+--------+
|                    hour_time|plant_id|device_id|avg_temp|
+-----------------------------+--------+---------+--------+
|2024-11-28T08:00:00.000+08:00|    3001|      100|    85.0|
|2024-11-28T09:00:00.000+08:00|    3001|      100|    85.0|
|2024-11-28T10:00:00.000+08:00|    3001|      100|    85.0|
|2024-11-28T11:00:00.000+08:00|    3001|      100|    88.0|
|2024-11-29T10:00:00.000+08:00|    3001|      101|    85.0|
|2024-11-29T11:00:00.000+08:00|    3002|      100|    85.0|
|2024-11-29T18:00:00.000+08:00|    3002|      100|    90.0|
|2024-11-30T09:00:00.000+08:00|    3002|      101|    90.0|
+-----------------------------+--------+---------+--------+
Total line number = 8
It costs 0.066s
```

指定了 FILL_GROUP 为第 2 列后，填充只会发生在以第二列`device_id`为分组键的分组中，`100` 的空值不会被 `101` 的值填充，因为它们属于不同的分组。

```sql
SELECT date_bin(1h, time) AS hour_time,  plant_id, device_id, avg(temperature) AS avg_temp
  FROM table1
  WHERE time >= 2024-11-28 08:00:00 AND time < 2024-11-30 14:30:00
  group by 1, plant_id, device_id
  FILL METHOD PREVIOUS FILL_GROUP 2;
```

查询结果：

```sql
+-----------------------------+--------+---------+--------+
|                    hour_time|plant_id|device_id|avg_temp|
+-----------------------------+--------+---------+--------+
|2024-11-28T08:00:00.000+08:00|    3001|      100|    85.0|
|2024-11-28T09:00:00.000+08:00|    3001|      100|    85.0|
|2024-11-28T10:00:00.000+08:00|    3001|      100|    85.0|
|2024-11-28T11:00:00.000+08:00|    3001|      100|    88.0|
|2024-11-29T10:00:00.000+08:00|    3001|      101|    85.0|
|2024-11-29T11:00:00.000+08:00|    3002|      100|    null|
|2024-11-29T18:00:00.000+08:00|    3002|      100|    90.0|
|2024-11-30T09:00:00.000+08:00|    3002|      101|    90.0|
+-----------------------------+--------+---------+--------+
Total line number = 8
It costs 0.089s
```

## 5. 特别说明

在使用 `LINEAR FILL` 或 `PREVIOUS FILL` 时，如果辅助时间列（用于确定填充逻辑的时间列）中存在 NULL 值，IoTDB 将遵循以下规则：

- 不对辅助时间列为 NULL 的行进行填充。
- 这些行也不会参与到填充逻辑的计算中。

以 `PREVIOUS FILL`为例，原始数据如下所示：

```sql
SELECT time, plant_id, device_id, humidity, arrival_time
  FROM table1 
  WHERE time >= 2024-11-26 16:37:00 and time <= 2024-11-28 08:00:00
      AND plant_id='1001' and device_id='101';
```

查询结果：

```sql
+-----------------------------+--------+---------+--------+-----------------------------+
|                         time|plant_id|device_id|humidity|                 arrival_time|
+-----------------------------+--------+---------+--------+-----------------------------+
|2024-11-27T16:38:00.000+08:00|    1001|      101|    35.1|2024-11-27T16:37:01.000+08:00|
|2024-11-27T16:39:00.000+08:00|    1001|      101|    35.3|                         null|
|2024-11-27T16:40:00.000+08:00|    1001|      101|    null|2024-11-27T16:37:03.000+08:00|
|2024-11-27T16:41:00.000+08:00|    1001|      101|    null|2024-11-27T16:37:04.000+08:00|
|2024-11-27T16:42:00.000+08:00|    1001|      101|    35.2|                         null|
|2024-11-27T16:43:00.000+08:00|    1001|      101|    null|                         null|
|2024-11-27T16:44:00.000+08:00|    1001|      101|    null|2024-11-27T16:37:08.000+08:00|
+-----------------------------+--------+---------+--------+-----------------------------+
Total line number = 7
It costs 0.119s
```

使用 arrival_time 列作为辅助时间列，并设置时间间隔（TIME_BOUND）为 2 ms（前值距离当前值超过 2ms 就不填充）：

```sql
SELECT time, plant_id, device_id, humidity, arrival_time
  FROM table1
  WHERE time >= 2024-11-26 16:37:00 and time <= 2024-11-28 08:00:00
    AND plant_id='1001' and device_id='101'
  FILL METHOD PREVIOUS TIME_BOUND 2s TIME_COLUMN 5;
```

查询结果：

```sql
+-----------------------------+--------+---------+--------+-----------------------------+
|                         time|plant_id|device_id|humidity|                 arrival_time|
+-----------------------------+--------+---------+--------+-----------------------------+
|2024-11-27T16:38:00.000+08:00|    1001|      101|    35.1|2024-11-27T16:37:01.000+08:00|
|2024-11-27T16:39:00.000+08:00|    1001|      101|    35.3|                         null|
|2024-11-27T16:40:00.000+08:00|    1001|      101|    35.1|2024-11-27T16:37:03.000+08:00|
|2024-11-27T16:41:00.000+08:00|    1001|      101|    null|2024-11-27T16:37:04.000+08:00|
|2024-11-27T16:42:00.000+08:00|    1001|      101|    35.2|                         null|
|2024-11-27T16:43:00.000+08:00|    1001|      101|    null|                         null|
|2024-11-27T16:44:00.000+08:00|    1001|      101|    null|2024-11-27T16:37:08.000+08:00|
+-----------------------------+--------+---------+--------+-----------------------------+
Total line number = 7
It costs 0.049s
```

填充结果详情：

- 16:39、16:42、16:43 的 humidity 列，由于辅助列 arrival_time 为 NULL，所以不进行填充。
- 16:40 的 humidity 列，由于辅助列 arrival_time 非 NULL ，为 `1970-01-01T08:00:00.003+08:00`且与前一个非 NULL 值 `1970-01-01T08:00:00.001+08:00`的时间差未超过 2ms，因此使用第一行 s1 的值 1 进行填充。
- 16:41 的 humidity 列，尽管 arrival_time 非 NULL，但与前一个非 NULL 值的时间差超过 2ms，因此不进行填充。第七行同理。