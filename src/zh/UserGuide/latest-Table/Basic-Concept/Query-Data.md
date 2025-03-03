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

# 数据查询

## 1. 语法概览

```SQL
SELECT ⟨select_list⟩
    FROM ⟨tables⟩
    [WHERE ⟨condition⟩]
    [GROUP BY ⟨groups⟩]
    [HAVING ⟨group_filter⟩]
    [FILL ⟨fill_methods⟩]
    [ORDER BY ⟨order_expression⟩]
    [OFFSET ⟨n⟩]
    [LIMIT ⟨n⟩];
```

IoTDB 查询语法提供以下子句：

- SELECT 子句：查询结果应包含的列。详细语法见：[SELECT子句](../SQL-Manual/Select-Clause.md)
- FROM 子句：指出查询的数据源，可以是单个表、多个通过 `JOIN` 子句连接的表，或者是一个子查询。详细语法见：[FROM & JOIN 子句](../SQL-Manual/From-Join-Clause.md)
- WHERE 子句：用于过滤数据，只选择满足特定条件的数据行。这个子句在逻辑上紧跟在 FROM 子句之后执行。详细语法见：[WHERE 子句](../SQL-Manual/Where-Clause.md)
- GROUP BY 子句：当需要对数据进行聚合时使用，指定了用于分组的列。详细语法见：[GROUP BY 子句](../SQL-Manual/GroupBy-Clause.md)
- HAVING 子句：在 GROUP BY 子句之后使用，用于对已经分组的数据进行过滤。与 WHERE 子句类似，但 HAVING 子句在分组后执行。详细语法见：[HAVING 子句](../SQL-Manual/Having-Clause.md)
- FILL 子句：用于处理查询结果中的空值，用户可以使用 FILL 子句来指定数据缺失时的填充模式（如前一个非空值或线性插值）来填充 null 值，以便于数据可视化和分析。 详细语法见：[FILL 子句](../SQL-Manual/Fill-Clause.md)
- ORDER BY 子句：对查询结果进行排序，可以指定升序（ASC）或降序（DESC），以及 NULL 值的处理方式（NULLS FIRST 或 NULLS LAST）。详细语法见：[ORDER BY 子句](../SQL-Manual/OrderBy-Clause.md)
- OFFSET 子句：用于指定查询结果的起始位置，即跳过前 OFFSET 行。与 LIMIT 子句配合使用。详细语法见：[LIMIT 和 OFFSET 子句](../SQL-Manual/Limit-Offset-Clause.md)
- LIMIT 子句：限制查询结果的行数，通常与 OFFSET 子句一起使用以实现分页功能。详细语法见：[LIMIT 和 OFFSET 子句](../SQL-Manual/Limit-Offset-Clause.md)

## 2. 子句执行顺序

![](/img/%E5%AD%90%E5%8F%A5%E6%89%A7%E8%A1%8C%E9%A1%BA%E5%BA%8F01.png)



## 3. 常见查询示例

### 3.1 示例数据

在[示例数据页面](../Reference/Sample-Data.md)中，包含了用于构建表结构和插入数据的SQL语句，下载并在IoTDB CLI中执行这些语句，即可将数据导入IoTDB，您可以使用这些数据来测试和执行示例中的SQL语句，并获得相应的结果。

### 3.2 原始数据查询

**示例1：根据时间过滤**

```SQL
IoTDB> SELECT time, temperature, humidity 
         FROM table1 
         WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00;
```

执行结果如下：

```SQL
+-----------------------------+-----------+--------+
|                         time|temperature|humidity|
+-----------------------------+-----------+--------+
|2024-11-28T08:00:00.000+08:00|       85.0|    null|
|2024-11-28T09:00:00.000+08:00|       null|    40.9|
|2024-11-28T10:00:00.000+08:00|       85.0|    35.2|
|2024-11-28T11:00:00.000+08:00|       88.0|    45.1|
|2024-11-27T16:38:00.000+08:00|       null|    35.1|
|2024-11-27T16:39:00.000+08:00|       85.0|    35.3|
|2024-11-27T16:40:00.000+08:00|       85.0|    null|
|2024-11-27T16:41:00.000+08:00|       85.0|    null|
|2024-11-27T16:42:00.000+08:00|       null|    35.2|
|2024-11-27T16:43:00.000+08:00|       null|    null|
|2024-11-27T16:44:00.000+08:00|       null|    null|
+-----------------------------+-----------+--------+
Total line number = 11
It costs 0.075s
```

**示例2：根据值过滤**

```SQL
IoTDB> SELECT time, temperature, humidity 
         FROM table1 
         WHERE temperature > 89.0;
```

执行结果如下：

```SQL
+-----------------------------+-----------+--------+
|                         time|temperature|humidity|
+-----------------------------+-----------+--------+
|2024-11-29T18:30:00.000+08:00|       90.0|    35.4|
|2024-11-26T13:37:00.000+08:00|       90.0|    35.1|
|2024-11-26T13:38:00.000+08:00|       90.0|    35.1|
|2024-11-30T09:30:00.000+08:00|       90.0|    35.2|
|2024-11-30T14:30:00.000+08:00|       90.0|    34.8|
+-----------------------------+-----------+--------+
Total line number = 5
It costs 0.156s
```

**示例3：根据属性过滤**

```SQL
IoTDB> SELECT time, temperature, humidity 
         FROM table1 
         WHERE model_id ='B';
```

执行结果如下：

```SQL
+-----------------------------+-----------+--------+
|                         time|temperature|humidity|
+-----------------------------+-----------+--------+
|2024-11-27T16:38:00.000+08:00|       null|    35.1|
|2024-11-27T16:39:00.000+08:00|       85.0|    35.3|
|2024-11-27T16:40:00.000+08:00|       85.0|    null|
|2024-11-27T16:41:00.000+08:00|       85.0|    null|
|2024-11-27T16:42:00.000+08:00|       null|    35.2|
|2024-11-27T16:43:00.000+08:00|       null|    null|
|2024-11-27T16:44:00.000+08:00|       null|    null|
+-----------------------------+-----------+--------+
Total line number = 7
It costs 0.106s
```

### 3.3 聚合查询

**示例：查询计算了在指定时间范围内，每个`device_id`的平均温度、最高温度和最低温度。**

```SQL
IoTDB> SELECT device_id, AVG(temperature) as avg_temp, MAX(temperature) as max_temp, MIN(temperature) as min_temp
         FROM table1
         WHERE time >= 2024-11-26 00:00:00 AND time <= 2024-11-29 00:00:00
         GROUP BY device_id;
```

执行结果如下：

```SQL
+---------+--------+--------+--------+
|device_id|avg_temp|max_temp|min_temp|
+---------+--------+--------+--------+
|      100|    87.6|    90.0|    85.0|
|      101|    85.0|    85.0|    85.0|
+---------+--------+--------+--------+
Total line number = 2
It costs 0.278s
```

### 3.4 最新点查询

**示例：查询表中每个 `device_id` 返回最后一条记录，包含该记录的温度值以及在该设备中基于时间和温度排序的最后一条记录。**

```SQL
IoTDB> SELECT device_id,last(temperature),last_by(time,temperature) 
         FROM table1 
         GROUP BY device_id;
```

执行结果如下：

```SQL
+---------+-----+-----------------------------+
|device_id|_col1|                        _col2|
+---------+-----+-----------------------------+
|      100| 90.0|2024-11-29T18:30:00.000+08:00|
|      101| 90.0|2024-11-30T14:30:00.000+08:00|
+---------+-----+-----------------------------+
Total line number = 2
It costs 0.090s
```

### 3.5 降采样查询（date_bin_gapfill函数）

**示例：查询将时间按天分组，并计算每天的平均温度。**

```SQL
IoTDB> SELECT date_bin(1d ,time) as day_time, AVG(temperature) as avg_temp
         FROM table1
         WHERE time >= 2024-11-26 00:00:00 AND time <= 2024-11-30 00:00:00
         GROUP BY date_bin(1d ,time);
```

执行结果如下：

```SQL
+-----------------------------+--------+
|                     day_time|avg_temp|
+-----------------------------+--------+
|2024-11-29T08:00:00.000+08:00|    87.5|
|2024-11-28T08:00:00.000+08:00|    86.0|
|2024-11-26T08:00:00.000+08:00|    90.0|
|2024-11-27T08:00:00.000+08:00|    85.0|
+-----------------------------+--------+
Total line number = 4
It costs 0.110s
```

### 3.6 数据填充

**示例：查询指定时间范围内，满足 `device_id` 为 '100' 的记录，若存在缺失的数据点，则用前一个非空值进行填充。**

```SQL
IoTDB> SELECT time, temperature, humidity  
         FROM table1 
         WHERE time >= 2024-11-26 00:00:00  and time <= 2024-11-30 11:00:00
         AND region='北京' AND plant_id='1001' AND device_id='101'
         FILL METHOD PREVIOUS;
```

执行结果如下：

```SQL
+-----------------------------+-----------+--------+
|                         time|temperature|humidity|
+-----------------------------+-----------+--------+
|2024-11-27T16:38:00.000+08:00|       null|    35.1|
|2024-11-27T16:39:00.000+08:00|       85.0|    35.3|
|2024-11-27T16:40:00.000+08:00|       85.0|    35.3|
|2024-11-27T16:41:00.000+08:00|       85.0|    35.3|
|2024-11-27T16:42:00.000+08:00|       85.0|    35.2|
|2024-11-27T16:43:00.000+08:00|       85.0|    35.2|
|2024-11-27T16:44:00.000+08:00|       85.0|    35.2|
+-----------------------------+-----------+--------+
Total line number = 7
It costs 0.101s
```

### 3.7 排序&分页

**示例：查询表中湿度降序排列且空值（NULL）排最后的记录，跳过前 2 条，只返回接下来的 8 条记录。**

```SQL
IoTDB> SELECT time, temperature, humidity
         FROM table1
         ORDER BY humidity desc NULLS LAST
         OFFSET 2
         LIMIT 10;
```

执行结果如下：

```SQL
+-----------------------------+-----------+--------+
|                         time|temperature|humidity|
+-----------------------------+-----------+--------+
|2024-11-28T09:00:00.000+08:00|       null|    40.9|
|2024-11-29T18:30:00.000+08:00|       90.0|    35.4|
|2024-11-27T16:39:00.000+08:00|       85.0|    35.3|
|2024-11-28T10:00:00.000+08:00|       85.0|    35.2|
|2024-11-30T09:30:00.000+08:00|       90.0|    35.2|
|2024-11-27T16:42:00.000+08:00|       null|    35.2|
|2024-11-26T13:38:00.000+08:00|       90.0|    35.1|
|2024-11-26T13:37:00.000+08:00|       90.0|    35.1|
|2024-11-27T16:38:00.000+08:00|       null|    35.1|
|2024-11-30T14:30:00.000+08:00|       90.0|    34.8|
+-----------------------------+-----------+--------+
Total line number = 10
It costs 0.093s
```