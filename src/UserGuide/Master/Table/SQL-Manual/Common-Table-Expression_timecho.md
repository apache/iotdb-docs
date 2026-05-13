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
# Common Table Expressions (CTE)

## 1. Overview

CTE (Common Table Expressions) supports defining one or more temporary result sets (called common tables) using the `WITH` clause. These result sets can be referenced multiple times in subsequent parts of the same query. CTE provides a clean way to construct complex queries, making SQL code more readable and maintainable.

> Note: This feature is available since version 2.0.9.1.

## 2. Syntax Definition

The simplified SQL syntax for CTE is as follows:

```sql
with_clause:
    WITH cte_name [(col_name [, col_name] ...)] AS (subquery)
    [, cte_name [(col_name [, col_name] ...)] AS (subquery)] ...
```

- Supports simple and nested CTEs: One or more CTEs can be defined in a `WITH` clause, and CTEs can reference each other in a nested way (forward references are **not** allowed, meaning a CTE cannot reference another CTE that has not yet been defined).
- Name conflict between CTE and source table: If a CTE has the same name as a source table, only the CTE is visible in the outer scope, and the source table is shadowed.
- Multiple references to CTE: The same CTE can be referenced multiple times in the outer query.
- EXPLAIN / EXPLAIN ANALYZE support: `EXPLAIN` or `EXPLAIN ANALYZE` can be used on the entire query, but **not** on the `subquery` inside a CTE definition.
- Column count constraint: The number of column names specified in a CTE definition must match the number of output columns from the `subquery`, otherwise an error will be thrown.
- Unused CTE: A query can still execute normally if a defined CTE is not referenced in the main query body.

## 3. Examples

Using tables `table1` and `table2` from the [Sample Data](../Reference/Sample-Data.md) as source tables:

### 3.1 Simple CTE

```sql
WITH cte1 AS (SELECT device_id, temperature FROM table1 WHERE temperature IS NOT NULL),
     cte2 AS (SELECT device_id, humidity FROM table2 WHERE humidity IS NOT NULL)
SELECT * FROM cte1 JOIN cte2 ON cte1.device_id = cte2.device_id LIMIT 10;
```

Result

```
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

### 3.2 CTE with the Same Name as Source Table

```sql
WITH table1 AS (SELECT time, device_id, temperature FROM table1 WHERE temperature IS NOT NULL)
SELECT * FROM table1 LIMIT 5;
```

Result

```
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

### 3.3 Nested CTE

```sql
WITH
    table1 AS (SELECT device_id, temperature FROM table1 WHERE temperature IS NOT NULL),
    cte1 AS (SELECT device_id, temperature FROM table2 WHERE temperature IS NOT NULL),
    table2 AS (SELECT temperature FROM table1),
    cte2 AS (SELECT temperature FROM table1)
SELECT * FROM table2;
```

Result

```
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

- Forward references are **not** supported

```sql
WITH
  cte2 AS (SELECT temperature FROM cte1),
  cte1 AS (SELECT device_id, temperature FROM table1)
SELECT * FROM cte2;
```

Error message

```
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 550: Table 'database1.cte1' does not exist.
```

### 3.4 Multiple References to CTE

```sql
WITH cte AS (SELECT device_id, temperature FROM table1 WHERE temperature IS NOT NULL)
SELECT * FROM cte WHERE temperature > (SELECT avg(temperature) FROM cte);
```

Result

```
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
It costs 0.203s
```

### 3.5 EXPLAIN Support

- Supported on the entire query

```sql
EXPLAIN WITH cte AS (SELECT * FROM table1) SELECT * FROM cte;
```

Result

```
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

- Not supported for internal queries of CTE

```sql
WITH cte AS (EXPLAIN SELECT * FROM table1) SELECT * FROM cte;
```

Error message

```
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 700: line 1:14: mismatched input 'EXPLAIN'. Expecting: <query>
```