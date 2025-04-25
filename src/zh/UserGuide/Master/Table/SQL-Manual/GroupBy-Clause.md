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

# GROUP BY 子句

## 1. 语法概览

```sql
GROUP BY expression (',' expression)*
```

- GROUP BY 子句用于将 SELECT 语句的结果集按指定的列值进行分组计算。这些分组列的值在结果中保持原样，其他列中具备相同分组列值的所有记录通过指定的聚合函数（例如 COUNT、AVG）进行计算。

![](/img/groupby01.png)


## 2. 注意事项

- 在 SELECT 子句中的项必须包含聚合函数或由出现在 GROUP BY 子句中的列组成。

合法示例：

```sql
SELECT concat(device_id, model_id), avg(temperature) 
  FROM table1 
  GROUP BY device_id, model_id; -- 合法
```

执行结果如下：

```sql
+-----+-----+
|_col0|_col1|
+-----+-----+
| 100A| 90.0|
| 100C| 86.0|
| 100E| 90.0|
| 101B| 85.0|
| 101D| 85.0|
| 101F| 90.0|
+-----+-----+
Total line number = 6
It costs 0.094s
```

不合法示例1：

```sql
SELECT device_id, temperature  
  FROM table1  
  GROUP BY device_id;-- 不合法
```

执行结果如下：

```sql
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701:
  'temperature' must be an aggregate expression or appear in GROUP BY clause
```

不合法示例2：

```sql
SELECT device_id, avg(temperature) 
  FROM table1  
  GROUP BY model; -- 不合法
```

执行结果如下：

```sql
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701:
  Column 'model' cannot be resolved
```

- 如果没有 GROUP BY 子句，则 SELECT 子句中的所有项要么都包含聚合函数，要么都不包含聚合函数。

合法示例：

```sql
SELECT COUNT(*), avg(temperature) 
  FROM table1; -- 合法
```

执行结果如下：

```sql
+-----+-----------------+
|_col0|            _col1|
+-----+-----------------+
|   18|87.33333333333333|
+-----+-----------------+
Total line number = 1
It costs 0.094s
```

不合法示例：

```sql
SELECT humidity, avg(temperature) FROM table1;    -- 不合法
```

执行结果如下：

```sql
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701: 
  'humidity' must be an aggregate expression or appear in GROUP BY clause
```

- group by子句可以使用从 1 开始的常量整数来引用 SELECT 子句中的项，如果常量整数小于1或大于选择项列表的大小，则会抛出错误。

```sql
SELECT date_bin(1h, time), device_id, avg(temperature)
  FROM table1
  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00
  GROUP BY 1, device_id;
```

执行结果如下：

```sql
+-----------------------------+---------+-----+
|                        _col0|device_id|_col2|
+-----------------------------+---------+-----+
|2024-11-28T08:00:00.000+08:00|      100| 85.0|
|2024-11-28T09:00:00.000+08:00|      100| null|
|2024-11-28T10:00:00.000+08:00|      100| 85.0|
|2024-11-28T11:00:00.000+08:00|      100| 88.0|
|2024-11-27T16:00:00.000+08:00|      101| 85.0|
+-----------------------------+---------+-----+
Total line number = 5
It costs 0.092s
```

- 不支持在 group by 子句中使用 select item 的别名。以下 SQL 将抛出错误，可以使用上述 SQL 代替。

```sql
SELECT date_bin(1h, time) AS hour_time, device_id, avg(temperature)
  FROM table1
  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00
  GROUP BY date_bin(1h, time), device_id;
```

执行结果如下：

```sql
+-----------------------------+---------+-----+
|                    hour_time|device_id|_col2|
+-----------------------------+---------+-----+
|2024-11-28T08:00:00.000+08:00|      100| 85.0|
|2024-11-28T09:00:00.000+08:00|      100| null|
|2024-11-28T10:00:00.000+08:00|      100| 85.0|
|2024-11-28T11:00:00.000+08:00|      100| 88.0|
|2024-11-27T16:00:00.000+08:00|      101| 85.0|
+-----------------------------+---------+-----+
Total line number = 5
It costs 0.092s
```

- 只有 COUNT 函数可以与星号（*）一起使用，用于计算表中的总行数。其他聚合函数与`*`一起使用，将抛出错误。

```sql
SELECT count(*) FROM table1;
```

执行结果如下：

```sql
+-----+
|_col0|
+-----+
|   18|
+-----+
Total line number = 1
It costs 0.047s
```

## 3. 示例数据

在[示例数据页面](../Reference/Sample-Data.md)中，包含了用于构建表结构和插入数据的SQL语句，下载并在IoTDB CLI中执行这些语句，即可将数据导入IoTDB，您可以使用这些数据来测试和执行示例中的SQL语句，并获得相应的结果。

#### 示例 1：降采样时间序列数据

对设备 101 下述时间范围的温度进行降采样，每小时返回一个平均温度。

```sql
SELECT date_bin(1h, time) AS hour_time, AVG(temperature) AS avg_temperature
  FROM table1
  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-30 00:00:00
  AND device_id='101'
  GROUP BY 1;
```

执行结果如下：

```sql
+-----------------------------+---------------+
|                    hour_time|avg_temperature|
+-----------------------------+---------------+
|2024-11-29T10:00:00.000+08:00|           85.0|
|2024-11-27T16:00:00.000+08:00|           85.0|
+-----------------------------+---------------+
Total line number = 2
It costs 0.054s
```

对每个设备过去一天的温度进行降采样，每小时返回一个平均温度。

```sql
SELECT date_bin(1h, time) AS hour_time, device_id, AVG(temperature) AS avg_temperature
  FROM table1
  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-30 00:00:00
  GROUP BY 1, device_id;
```

执行结果如下：

```sql
+-----------------------------+---------+---------------+
|                    hour_time|device_id|avg_temperature|
+-----------------------------+---------+---------------+
|2024-11-29T11:00:00.000+08:00|      100|           null|
|2024-11-29T18:00:00.000+08:00|      100|           90.0|
|2024-11-28T08:00:00.000+08:00|      100|           85.0|
|2024-11-28T09:00:00.000+08:00|      100|           null|
|2024-11-28T10:00:00.000+08:00|      100|           85.0|
|2024-11-28T11:00:00.000+08:00|      100|           88.0|
|2024-11-29T10:00:00.000+08:00|      101|           85.0|
|2024-11-27T16:00:00.000+08:00|      101|           85.0|
+-----------------------------+---------+---------------+
Total line number = 8
It costs 0.081s
```

有关date_bin函数的更多详细信息可以参见 date_bin （时间分桶规整）函数功能定义

#### 示例 2：查询每个设备的最新数据点

```sql
SELECT device_id, LAST(temperature), LAST_BY(time, temperature)
  FROM table1
  GROUP BY device_id;
```

执行结果如下：

```sql
+---------+-----+-----------------------------+
|device_id|_col1|                        _col2|
+---------+-----+-----------------------------+
|      100| 90.0|2024-11-29T18:30:00.000+08:00|
|      101| 90.0|2024-11-30T14:30:00.000+08:00|
+---------+-----+-----------------------------+
Total line number = 2
It costs 0.078s
```

#### 示例 3：计算总行数

计算所有设备的总行数：

```sql
SELECT COUNT(*) FROM table1;
```

执行结果如下：

```sql
+-----+
|_col0|
+-----+
|   18|
+-----+
Total line number = 1
It costs 0.060s
```

计算每个设备的总行数：

```sql
SELECT device_id, COUNT(*) AS total_rows
  FROM table1
  GROUP BY device_id;
```

执行结果如下：

```sql
+---------+----------+
|device_id|total_rows|
+---------+----------+
|      100|         8|
|      101|        10|
+---------+----------+
Total line number = 2
It costs 0.060s
```

#### 示例 4：没有 group by 子句的聚合

查询所有设备中的最大温度：

```sql
SELECT MAX(temperature)
FROM table1;
```

执行结果如下：

```sql
+-----+
|_col0|
+-----+
| 90.0|
+-----+
Total line number = 1
It costs 0.086s
```

#### 示例 5：对子查询的结果进行聚合

查询在指定时间段内平均温度超过 80.0 且至少有两次记录的设备和工厂组合：

```sql
SELECT plant_id, device_id 
FROM (
    SELECT date_bin(10m, time) AS time, plant_id, device_id, AVG(temperature) AS temp FROM table1 WHERE time >= 2024-11-26 00:00:00 AND time <= 2024-11-29 00:00:00
    GROUP BY 1, plant_id, device_id
) 
WHERE temp > 80.0 
GROUP BY plant_id, device_id 
HAVING COUNT(*) > 1;
```

执行结果如下：

```sql
+--------+---------+
|plant_id|device_id|
+--------+---------+
|    1001|      101|
|    3001|      100|
+--------+---------+
Total line number = 2
It costs 0.073s
```