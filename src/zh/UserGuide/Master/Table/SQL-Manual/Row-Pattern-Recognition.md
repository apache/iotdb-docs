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

# 模式查询

## 1. 语法定义

```SQL
MATCH_RECOGNIZE (
  [ PARTITION BY column [, ...] ]
  [ ORDER BY column [, ...] ]
  [ MEASURES measure_definition [, ...] ]
  [ ROWS PER MATCH ]
  [ AFTER MATCH skip_to ]
  PATTERN ( row_pattern )
  [ SUBSET subset_definition [, ...] ]
  DEFINE variable_definition [, ...]
)
```

**说明：**

* PARTITION BY ： 可选，用于对输入表进行分组，每个分组能独立进行模式匹配。如果未声明该子句，则整个输入表将作为一个整体进行处理。
* ORDER BY ：可选，用于确保输入数据按某种顺序进行匹配处理。
* MEASURES ：可选，用于指定从匹配到的一段数据中提取哪些信息。
* ROWS PER MATCH ：可选，用于指定模式匹配成功后结果集的输出方式。
* AFTER MATCH SKIP ：可选，用于指定在识别到一个非空匹配后，下一次模式匹配应从哪一行继续进行。
* PATTERN ：用于定义需要匹配的行模式。
* SUBSET ：可选，用于将多个基本模式变量所匹配的行合并为一个逻辑集合。
* DEFINE ：用于定义行模式的基本模式变量。

更多详细功能介绍请参考：[模式查询](../User-Manual/Timeseries-Featured-Analysis_timecho.md)

## 2. 使用示例

以[示例数据](../Reference/Sample-Data.md)为源数据

1. 时间分段查询

将 table1 中的数据按照时间间隔小于等于 24 小时分段，查询每段中的数据总条数，以及开始、结束时间。

查询SQL

```SQL
SELECT start_time, end_time, cnt 
FROM table1 
MATCH_RECOGNIZE (
    ORDER BY time 
    MEASURES 
        RPR_FIRST(A.time) AS start_time, 
        RPR_LAST(time) AS end_time, 
        COUNT() AS cnt 
    PATTERN (A B*)  
    DEFINE  B AS (cast(B.time as INT64) - cast(PREV(B.time) as INT64)) <= 86400000
) AS m
```

查询结果

```SQL
+-----------------------------+-----------------------------+---+
|                   start_time|                     end_time|cnt|
+-----------------------------+-----------------------------+---+
|2024-11-26T13:37:00.000+08:00|2024-11-26T13:38:00.000+08:00|  2|
|2024-11-27T16:38:00.000+08:00|2024-11-30T14:30:00.000+08:00| 16|
+-----------------------------+-----------------------------+---+
Total line number = 2
```

2. 差值分段查询

将 table2 中的数据按照 humidity 湿度值差值小于 0.1 分段，查询每段中的数据总条数，以及开始、结束时间。

* 查询sql

```SQL
SELECT start_time, end_time, cnt 
FROM table2 
MATCH_RECOGNIZE (
    ORDER BY time 
    MEASURES 
        RPR_FIRST(A.time) AS start_time, 
        RPR_LAST(time) AS end_time, 
        COUNT() AS cnt 
    PATTERN (A B*)  
    DEFINE  B AS (B.humidity - PREV(B.humidity )) <=0.1
) AS m;
```

* 查询结果

```SQL
+-----------------------------+-----------------------------+---+
|                   start_time|                     end_time|cnt|
+-----------------------------+-----------------------------+---+
|2024-11-26T13:37:00.000+08:00|2024-11-27T00:00:00.000+08:00|  2|
|2024-11-28T08:00:00.000+08:00|2024-11-29T00:00:00.000+08:00|  2|
|2024-11-29T11:00:00.000+08:00|2024-11-30T00:00:00.000+08:00|  2|
+-----------------------------+-----------------------------+---+
Total line number = 3
```

3. 事件统计查询

将 table1 中数据按照设备号分组，统计上海地区湿度大于 35 的开始、结束时间及最大湿度值。

* 查询sql

```SQL
SELECT m.device_id, m.match, m.event_start, m.event_end, m.max_humidity 
FROM table1
MATCH_RECOGNIZE (
  PARTITION BY device_id
  ORDER BY time 
  MEASURES
    MATCH_NUMBER() AS match,
    RPR_FIRST(A.time) AS event_start,
    RPR_LAST(A.time) AS event_end,
    MAX(A.humidity) AS max_humidity 
  ONE ROW PER MATCH
  PATTERN (A+)
  DEFINE
    A AS A.region= '上海' AND A.humidity> 35
) AS m
```

* 查询结果

```SQL
+---------+-----+-----------------------------+-----------------------------+------------+
|device_id|match|                  event_start|                    event_end|max_humidity|
+---------+-----+-----------------------------+-----------------------------+------------+
|      100|    1|2024-11-28T09:00:00.000+08:00|2024-11-29T18:30:00.000+08:00|        45.1|
|      101|    1|2024-11-30T09:30:00.000+08:00|2024-11-30T09:30:00.000+08:00|        35.2|
+---------+-----+-----------------------------+-----------------------------+------------+
Total line number = 2
```
