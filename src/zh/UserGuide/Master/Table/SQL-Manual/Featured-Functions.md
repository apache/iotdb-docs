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

# 特色函数

## 时序特色函数

### 1. 降采样函数

#### 1.1 `date_bin` 函数

##### 功能描述：

`date_bin` 是一个标量函数，用于将时间戳规整到指定的时间区间起点，并结合 `GROUP BY` 子句实现降采样。

- 部分区间结果为空：只会对满足条件的数据进行时间戳规整，不会填充缺失的时间区间。
- 全部区间结果为空：：满足条件的整个查询范围内没有数据时，降采样返回空结果集

##### 使用示例：

###### 示例数据

在[示例数据页面](https://timechor.feishu.cn/docx/YEubdhNGkoaPdnxNolBcaMMKnoe)中，包含了用于构建表结构和插入数据的SQL语句，下载并在IoTDB CLI中执行这些语句，即可将数据导入IoTDB，您可以使用这些数据来测试和执行示例中的SQL语句，并获得相应的结果。

示例 1：获取设备** **`100`** **某个时间范围的每小时平均温度

```SQL
SELECT date_bin(1h, time) AS hour_time, avg(temperature) AS avg_temp
FROM table1
WHERE (time >= 2024-11-27 00:00:00  AND time <= 2024-11-30 00:00:00)
      AND device_id = '100'
GROUP BY 1;
```

结果：

```Plain
+-----------------------------+--------+
|                    hour_time|avg_temp|
+-----------------------------+--------+
|2024-11-29T11:00:00.000+08:00|    null|
|2024-11-29T18:00:00.000+08:00|    90.0|
|2024-11-28T08:00:00.000+08:00|    85.0|
|2024-11-28T09:00:00.000+08:00|    null|
|2024-11-28T10:00:00.000+08:00|    85.0|
|2024-11-28T11:00:00.000+08:00|    88.0|
+-----------------------------+--------+
```

示例 2：获取每个设备某个时间范围的每小时平均温度

```SQL
SELECT date_bin(1h, time) AS hour_time, device_id, avg(temperature) AS avg_temp
FROM table1
WHERE time >= 2024-11-27 00:00:00  AND time <= 2024-11-30 00:00:00
GROUP BY 1, device_id;
```

结果：

```Plain
+-----------------------------+---------+--------+
|                    hour_time|device_id|avg_temp|
+-----------------------------+---------+--------+
|2024-11-29T11:00:00.000+08:00|      100|    null|
|2024-11-29T18:00:00.000+08:00|      100|    90.0|
|2024-11-28T08:00:00.000+08:00|      100|    85.0|
|2024-11-28T09:00:00.000+08:00|      100|    null|
|2024-11-28T10:00:00.000+08:00|      100|    85.0|
|2024-11-28T11:00:00.000+08:00|      100|    88.0|
|2024-11-29T10:00:00.000+08:00|      101|    85.0|
|2024-11-27T16:00:00.000+08:00|      101|    85.0|
+-----------------------------+---------+--------+
```

示例 3：获取所有设备某个时间范围的每小时平均温度

```SQL
SELECT date_bin(1h, time) AS hour_time, avg(temperature) AS avg_temp
  FROM table1
  WHERE time >= 2024-11-27 00:00:00  AND time <= 2024-11-30 00:00:00
  group by 1;  
```

结果：

```Plain
+-----------------------------+--------+
|                    hour_time|avg_temp|
+-----------------------------+--------+
|2024-11-29T10:00:00.000+08:00|    85.0|
|2024-11-27T16:00:00.000+08:00|    85.0|
|2024-11-29T11:00:00.000+08:00|    null|
|2024-11-29T18:00:00.000+08:00|    90.0|
|2024-11-28T08:00:00.000+08:00|    85.0|
|2024-11-28T09:00:00.000+08:00|    null|
|2024-11-28T10:00:00.000+08:00|    85.0|
|2024-11-28T11:00:00.000+08:00|    88.0|
+-----------------------------+--------+
```

#### 1.2 `date_bin_gapfill` 函数

##### 功能描述

`date_bin_gapfill` 是 `date_bin` 的扩展，能够填充缺失的时间区间，从而返回完整的时间序列。

- 部分区间结果为空：对满足条件的数据进行时间戳规整，并填充缺失的时间区间。
- 全部区间结果为空：：整个查询范围内没有数据时，`date_bin_gapfill`会返回空结果集

##### 功能限制

- **`date_bin_gapfill`** **必须与** **`GROUP BY`** **子句搭配使用**，如果用在其他子句中，不会报错，但不会执行 gapfill 功能，效果与使用 `date_bin` 相同。
- **每个** **`GROUP BY`** **子句中只能使用一个** **`date_bin_gapfill`**。如果出现多个 `date_bin_gapfill`，会报错：multiple date_bin_gapfill calls not allowed
- **`date_bin_gapfill`** **的执行顺序**：GAPFILL 功能发生在 `HAVING` 子句执行之后，`FILL` 子句执行之前。
- **使用** **`date_bin_gapfill`** **时，****`WHERE`** **子句中的时间过滤条件必须是以下形式之一：**
  - `time >= XXX AND time <= XXX`
  - `time > XXX AND time < XXX`
  - `time BETWEEN XXX AND XXX` 
- **使用** **`date_bin_gapfill`** **时，如果出现其他时间过滤条件**，会报错。时间过滤条件与其他值过滤条件只能通过 `AND` 连接。
- **如果不能从 where 子句中推断出 startTime 和 endTime，则报错**：could not infer startTime or endTime from WHERE clause。

##### 使用示例

示例 1：填充缺失时间区间

```SQL
SELECT date_bin_gapfill(1h, time) AS hour_time, avg(temperature) AS avg_temp
FROM table1
WHERE (time >= 2024-11-28 07:00:00  AND time <= 2024-11-28 16:00:00)
      AND device_id = '100'
GROUP BY 1;
```

结果：

```Plain
+-----------------------------+--------+
|                    hour_time|avg_temp|
+-----------------------------+--------+
|2024-11-28T07:00:00.000+08:00|    null|
|2024-11-28T08:00:00.000+08:00|    85.0|
|2024-11-28T09:00:00.000+08:00|    null|
|2024-11-28T10:00:00.000+08:00|    85.0|
|2024-11-28T11:00:00.000+08:00|    88.0|
|2024-11-28T12:00:00.000+08:00|    null|
|2024-11-28T13:00:00.000+08:00|    null|
|2024-11-28T14:00:00.000+08:00|    null|
|2024-11-28T15:00:00.000+08:00|    null|
|2024-11-28T16:00:00.000+08:00|    null|
+-----------------------------+--------+
```

示例 2：结合设备分组填充缺失时间区间

```SQL
SELECT date_bin_gapfill(1h, time) AS hour_time, device_id, avg(temperature) AS avg_temp
FROM table1
WHERE time >= 2024-11-28 07:00:00  AND time <= 2024-11-28 16:00:00
GROUP BY 1, device_id;
```

结果：

```Plain
+-----------------------------+---------+--------+
|                    hour_time|device_id|avg_temp|
+-----------------------------+---------+--------+
|2024-11-28T07:00:00.000+08:00|      100|    null|
|2024-11-28T08:00:00.000+08:00|      100|    85.0|
|2024-11-28T09:00:00.000+08:00|      100|    null|
|2024-11-28T10:00:00.000+08:00|      100|    85.0|
|2024-11-28T11:00:00.000+08:00|      100|    88.0|
|2024-11-28T12:00:00.000+08:00|      100|    null|
|2024-11-28T13:00:00.000+08:00|      100|    null|
|2024-11-28T14:00:00.000+08:00|      100|    null|
|2024-11-28T15:00:00.000+08:00|      100|    null|
|2024-11-28T16:00:00.000+08:00|      100|    null|
+-----------------------------+---------+--------+
```

示例 3：查询范围内没有数据返回空结果集

```SQL
SELECT date_bin_gapfill(1h, time) AS hour_time, device_id, avg(temperature) AS avg_temp
FROM table1
WHERE time >= 2024-11-27 09:00:00  AND time <= 2024-11-27 14:00:00
GROUP BY 1, device_id;
```

结果：

```Plain
+---------+---------+--------+
|hour_time|device_id|avg_temp|
+---------+---------+--------+
+---------+---------+--------+
```

### 2. DIFF函数

##### 功能概述

`DIFF` 函数用于计算当前行与上一行的差值。对于第一行，由于没有前一行数据，因此永远返回 `NULL`。

##### 函数定义

```
DIFF(numberic[, boolean]) -> Double
```

##### 参数说明

- 第一个参数：数值类型

    - **类型**：必须是数值类型（`INT32`、`INT64`、`FLOAT`、`DOUBLE`）
    - **作用**：指定要计算差值的列。

- 第二个参数：布尔类型（可选）
    - **类型**：布尔类型（`true` 或 `false`）。
    - **默认值**：`true`。
    - **作用**：
        - **`true`**：忽略 `NULL` 值，向前找到第一个非 `NULL` 值进行差值计算。如果前面没有非 `NULL` 值，则返回 `NULL`。
        - **`false`**：不忽略 `NULL` 值，如果前一行为 `NULL`，则差值结果为 `NULL`。

##### 注意事项

- 在树模型中，第二个参数需要指定为 `'ignoreNull'='true'` 或 `'ignoreNull'='false'`，但在表模型中，只需指定为 `true` 或 `false`。
- 如果用户写成 `'ignoreNull'='true'` 或 `'ignoreNull'='false'`，表模型会将其视为对两个字符串常量进行等号比较，返回布尔值，但结果总是 `false`，等价于指定第二个参数为 `false`。

##### 使用示例

示例 1：忽略 `NULL` 值

```SQL
SELECT time, DIFF(temperature) AS diff_temp
FROM table1
WHERE device_id = '100';
```

结果：

```Plain
+-----------------------------+---------+
|                         time|diff_temp|
+-----------------------------+---------+
|2024-11-29T11:00:00.000+08:00|     null|
|2024-11-29T18:30:00.000+08:00|     null|
|2024-11-28T08:00:00.000+08:00|     -5.0|
|2024-11-28T09:00:00.000+08:00|     null|
|2024-11-28T10:00:00.000+08:00|      0.0|
|2024-11-28T11:00:00.000+08:00|      3.0|
|2024-11-26T13:37:00.000+08:00|      2.0|
|2024-11-26T13:38:00.000+08:00|      0.0|
+-----------------------------+---------+
```

示例 2：不忽略 `NULL` 值

```SQL
SELECT time, DIFF(temperature, false) AS diff_temp
FROM table1
WHERE device_id = '100';
```

结果：

```Plain
+-----------------------------+---------+
|                         time|diff_temp|
+-----------------------------+---------+
|2024-11-29T11:00:00.000+08:00|     null|
|2024-11-29T18:30:00.000+08:00|     null|
|2024-11-28T08:00:00.000+08:00|     -5.0|
|2024-11-28T09:00:00.000+08:00|     null|
|2024-11-28T10:00:00.000+08:00|     null|
|2024-11-28T11:00:00.000+08:00|      3.0|
|2024-11-26T13:37:00.000+08:00|      2.0|
|2024-11-26T13:38:00.000+08:00|      0.0|
+-----------------------------+---------+
```

示例 3：完整示例

```SQL
SELECT time, temperature, 
       DIFF(temperature) AS diff_temp_1,
       DIFF(temperature, false) AS diff_temp_2
FROM table1 
WHERE device_id = '100';
```

结果：

```Plain
+-----------------------------+-----------+-----------+-----------+
|                         time|temperature|diff_temp_1|diff_temp_2|
+-----------------------------+-----------+-----------+-----------+
|2024-11-29T11:00:00.000+08:00|       null|       null|       null|
|2024-11-29T18:30:00.000+08:00|       90.0|       null|       null|
|2024-11-28T08:00:00.000+08:00|       85.0|       -5.0|       -5.0|
|2024-11-28T09:00:00.000+08:00|       null|       null|       null|
|2024-11-28T10:00:00.000+08:00|       85.0|        0.0|       null|
|2024-11-28T11:00:00.000+08:00|       88.0|        3.0|        3.0|
|2024-11-26T13:37:00.000+08:00|       90.0|        2.0|        2.0|
|2024-11-26T13:38:00.000+08:00|       90.0|        0.0|        0.0|
+-----------------------------+-----------+-----------+-----------+
```
