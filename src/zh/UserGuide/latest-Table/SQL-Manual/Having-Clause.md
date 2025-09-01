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

# HAVING 子句

## 1. 语法概览

```sql
HAVING booleanExpression
```

### 1.1 HAVING 子句

用于在数据分组聚合(GROUP BY)完成后，对聚合结果进行筛选。

#### 注意事项

- 就语法而言，`HAVING`子句与`WHERE`子句相同，WHERE子句在分组聚合之前对数据进行过滤，HAVING子句是对分组聚合后的结果进行过滤。

## 2. 示例数据

在[示例数据页面](../Reference/Sample-Data.md)中，包含了用于构建表结构和插入数据的SQL语句，下载并在IoTDB CLI中执行这些语句，即可将数据导入IoTDB，您可以使用这些数据来测试和执行示例中的SQL语句，并获得相应的结果。

### 2.1 示例 1：过滤计数低于特定值的设备

查询将计算 `table1` 表中每个 `device_id` 的条目数，并过滤掉那些计数低于 5 的设备。

```sql
SELECT device_id, COUNT(*)
  FROM table1
  GROUP BY device_id
  HAVING COUNT(*) >= 5;
```

执行结果如下：

```sql
+---------+-----+
|device_id|_col1|
+---------+-----+
|      100|    8|
|      101|   10|
+---------+-----+
Total line number = 2
It costs 0.063s
```

### 2.2 示例 2：计算每个设备的每小时平均温度并过滤

查询将计算 `table1` 表中每个设备每小时的平均温度，并过滤掉那些平均温度低于 85.0 的设备。

```sql
SELECT date_bin(1h, time) as hour_time, device_id, AVG(temperature) as avg_temp
  FROM table1
  GROUP BY date_bin(1h, time), device_id
  HAVING AVG(temperature) >= 85.0;
```

执行结果如下：

```sql
+-----------------------------+---------+--------+
|                    hour_time|device_id|avg_temp|
+-----------------------------+---------+--------+
|2024-11-29T18:00:00.000+08:00|      100|    90.0|
|2024-11-28T08:00:00.000+08:00|      100|    85.0|
|2024-11-28T10:00:00.000+08:00|      100|    85.0|
|2024-11-28T11:00:00.000+08:00|      100|    88.0|
|2024-11-26T13:00:00.000+08:00|      100|    90.0|
|2024-11-30T09:00:00.000+08:00|      101|    90.0|
|2024-11-30T14:00:00.000+08:00|      101|    90.0|
|2024-11-29T10:00:00.000+08:00|      101|    85.0|
|2024-11-27T16:00:00.000+08:00|      101|    85.0|
+-----------------------------+---------+--------+
Total line number = 9
It costs 0.079s
```