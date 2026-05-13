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

# 公用表表达式（CTE）

## 1. 概述

CTE（Common Table Expressions，公用表表达式）功能支持通过 `WITH` 子句定义一个或多个临时结果集（即公用表），这些结果集可以在同一个查询的后续部分中被多次引用。CTE 提供了一种清晰的方式来构建复杂的查询，使 SQL 代码更易读和维护。

> 注意：该功能从 V2.0.9-beta 版本开始提供。

## 2. 语法定义

CTE 的简化 SQL 语法如下：

```SQL
with_clause:
    WITH cte_name [(col_name [, col_name] ...)] AS (subquery)
    [, cte_name [(col_name [, col_name] ...)] AS (subquery)] ...
```

* 支持简单 CTE 和嵌套 CTE：可以在 `WITH` 子句中定义一个或多个 CTE，且 CTE 之间可以嵌套引用（但不能前向引用，即不能使用尚未定义的 CTE）。
* CTE 名称与源表重名：如果 CTE 名称与源表重名，在外层作用域中只有 CTE 可见，源表将被屏蔽。
* CTE 的多次引用：同一个 CTE 在外层查询中可以被多次引用。
* Explain / ExplainAnalyze 支持：支持对整个查询进行 `Explain` 或 `ExplainAnalyze`，但不支持对 CTE 定义中的 `subquery` 进行 `Explain` 或 `ExplainAnalyze`。
* 列名指定限制：CTE 定义时指定的列名个数需与 `subquery` 输出列个数一致，否则报错。
* 未使用的 CTE：如果定义的 CTE 在查询主体中没有用到，查询仍可正常执行。

## 3. 使用示例

基于[示例数据](../Reference/Sample-Data.md) 中的表 `table1` 和 `table2`作为源表：

### 3.1 简单 CTE

```SQL
WITH cte1 AS (SELECT device_id, temperature FROM table1 WHERE temperature IS NOT NULL),
     cte2 AS (SELECT device_id, humidity FROM table2 WHERE humidity IS NOT NULL)
SELECT * FROM cte1 join cte2 on cte1.device_id = cte2.device_id limit 10;
```

执行结果

```Bash
+---------+-----------+---------+--------+
|device_id|temperature|device_id|humidity|
+---------+-----------+---------+--------+
|      100|       90.0|      100|    45.1|
|      100|       90.0|      100|    35.2|
|      100|       90.0|      100|    35.1|
|      100|       85.0|      100|    45.1|
|      100|       85.0|      100|    35.2|
|      100|       85.0|      100|    35.1|
|      100|       85.0|      100|    45.1|
|      100|       85.0|      100|    35.2|
|      100|       85.0|      100|    35.1|
|      100|       88.0|      100|    45.1|
+---------+-----------+---------+--------+
Total line number = 10
It costs 0.075s
```

### 3.2 CTE 与源表重名

```SQL
WITH table1 AS (SELECT time, device_id, temperature FROM table1 WHERE temperature IS NOT NULL)
SELECT * FROM table1 limit 5;
```

执行结果

```Bash
+-----------------------------+---------+-----------+
|                         time|device_id|temperature|
+-----------------------------+---------+-----------+
|2024-11-30T09:30:00.000+08:00|      101|       90.0|
|2024-11-30T14:30:00.000+08:00|      101|       90.0|
|2024-11-29T10:00:00.000+08:00|      101|       85.0|
|2024-11-27T16:39:00.000+08:00|      101|       85.0|
|2024-11-27T16:40:00.000+08:00|      101|       85.0|
+-----------------------------+---------+-----------+
Total line number = 5
It costs 0.103s
```

### 3.3 嵌套 CTE

```SQL
WITH
    table1 AS (select device_id, temperature from table1 WHERE temperature IS NOT NULL),
    cte1 AS (select device_id, temperature from table2 WHERE temperature IS NOT NULL),
    table2 AS (select temperature from table1),
    cte2 AS (SELECT temperature FROM table1)
SELECT * FROM table2;
```

执行结果

```Bash
+-----------+
|temperature|
+-----------+
|       90.0|
|       90.0|
|       85.0|
|       85.0|
|       85.0|
|       85.0|
|       90.0|
|       85.0|
|       85.0|
|       88.0|
|       90.0|
|       90.0|
+-----------+
Total line number = 12
It costs 0.050s
```

* 不支持前向引用

```SQL
WITH
  cte2 AS (SELECT temperature FROM cte1),
  cte1 AS (select device_id, temperature from table1)
SELECT * FROM cte2;
```

错误信息

```Bash
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 550: Table 'database1.cte1' does not exist.
```

### 3.4 CTE 的多次引用

```SQL
WITH cte AS (select device_id, temperature from table1 WHERE temperature IS NOT NULL)
SELECT * FROM cte WHERE temperature > (SELECT avg(temperature ) FROM cte);
```

执行结果

```Bash
+---------+-----------+
|device_id|temperature|
+---------+-----------+
|      101|       90.0|
|      101|       90.0|
|      100|       90.0|
|      100|       88.0|
|      100|       90.0|
|      100|       90.0|
+---------+-----------+
Total line number = 6
It costs 0.241s
```

### 3.5 Explain 支持

* 支持整个查询

```SQL
EXPLAIN WITH cte AS (SELECT * FROM table1) SELECT * FROM cte;
```

执行结果

```Bash
+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
|                                                                                                                                                                                                                                distribution plan|
+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
|                                                            ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐                                                             |
|                                                            │OutputNode-7                                                                                                          │                                                             |
|                                                            │OutputColumns-[time, region, plant_id, device_id, model_id, maintenance, temperature, humidity, status, arrival_time] │                                                             |
|                                                            │OutputSymbols: [time, region, plant_id, device_id, model_id, maintenance, temperature, humidity, status, arrival_time]│                                                             |
|                                                            └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘                                                             |
|                                                                                                                        │                                                                                                                        |
|                                                                                                                        │                                                                                                                        |
|                                                            ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐                                                             |
|                                                            │Collect-42                                                                                                            │                                                             |
|                                                            │OutputSymbols: [time, region, plant_id, device_id, model_id, maintenance, temperature, humidity, status, arrival_time]│                                                             |
|                                                            └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘                                                             |
|                                                            ┌───────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────┐                                                           |
|                                                            │                                                                                                                        │                                                           |
|                                                     ┌───────────┐                                                                                                            ┌───────────┐                                                      |
|                                                     │Exchange-49│                                                                                                            │Exchange-50│                                                      |
|                                                     └───────────┘                                                                                                            └───────────┘                                                      |
|                                                            │                                                                                                                        │                                                           |
|                                                            │                                                                                                                        │                                                           |
|┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐|
|│DeviceTableScanNode-41                                                                                                │ │DeviceTableScanNode-40                                                                                                │|
|│QualifiedTableName: database1.table1                                                                                  │ │QualifiedTableName: database1.table1                                                                                  │|
|│OutputSymbols: [time, region, plant_id, device_id, model_id, maintenance, temperature, humidity, status, arrival_time]│ │OutputSymbols: [time, region, plant_id, device_id, model_id, maintenance, temperature, humidity, status, arrival_time]│|
|│DeviceNumber: 3                                                                                                       │ │DeviceNumber: 3                                                                                                       │|
|│ScanOrder: ASC                                                                                                        │ │ScanOrder: ASC                                                                                                        │|
|│PushDownOffset: 0                                                                                                     │ │PushDownOffset: 0                                                                                                     │|
|│PushDownLimit: 0                                                                                                      │ │PushDownLimit: 0                                                                                                      │|
|│PushDownLimitToEachDevice: false                                                                                      │ │PushDownLimitToEachDevice: false                                                                                      │|
|│RegionId: 2                                                                                                           │ │RegionId: 1                                                                                                           │|
|└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘|
+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
Total line number = 29
It costs 0.065s
```

* 不支持 cte 内部查询

```SQL
WITH cte AS (EXPLAIN SELECT * FROM table1) SELECT * FROM cte;
```

错误信息

```Bash
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 700: line 1:14: mismatched input 'EXPLAIN'. Expecting: <query>
```
