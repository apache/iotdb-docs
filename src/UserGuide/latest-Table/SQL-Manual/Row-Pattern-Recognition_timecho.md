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

# Pattern Query

## 1. Syntax Definition

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

**Note:**

* PARTITION BY: Optional. Used to group the input table, and each group can perform pattern matching independently. If this clause is not specified, the entire input table will be processed as a single unit.
* ORDER BY: Optional. Used to ensure that input data is processed in a specific order during matching.
* MEASURES: Optional. Used to specify which information to extract from the matched segment of data.
* ROWS PER MATCH: Optional. Used to specify the output method of the result set after successful pattern matching.
* AFTER MATCH SKIP: Optional. Used to specify which row to resume from for the next pattern match after identifying a non-empty match.
* PATTERN: Used to define the row pattern to be matched.
* SUBSET: Optional. Used to merge rows matched by multiple basic pattern variables into a single logical set.
* DEFINE: Used to define the basic pattern variables for the row pattern.

For more detailed introductions to the features, please refer to:[Pattern Query](../User-Manual/Pattern-Query_timecho.md)

## 2. Usage Examples

Using [Sample Data](../Reference/Sample-Data.md) as the source data

1. Time Segment Query

Segment the data in table1 by time intervals less than or equal to 24 hours, and query the total number of data entries in each segment, as well as the start and end times.

Query SQL

SQL

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

Query Results

SQL

```SQL
+-----------------------------+-----------------------------+---+
|                   start_time|                     end_time|cnt|
+-----------------------------+-----------------------------+---+
|2024-11-26T13:37:00.000+08:00|2024-11-26T13:38:00.000+08:00|  2|
|2024-11-27T16:38:00.000+08:00|2024-11-30T14:30:00.000+08:00| 16|
+-----------------------------+-----------------------------+---+
Total line number = 2
```

2. Difference Segment Query

Segment the data in table2 by humidity value differences less than 0.1, and query the total number of data entries in each segment, as well as the start and end times.

* Query SQL

SQL

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

* Query Results

SQL

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

3. Event Statistics Query

Group the data in table1 by device ID, and count the start and end times and maximum humidity value where the humidity in the Shanghai area is greater than 35.

* Query SQL

SQL

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
    A AS A.region= 'Shanghai' AND A.humidity> 35
) AS m
```

* Query Results

SQL

```SQL
+---------+-----+-----------------------------+-----------------------------+------------+
|device_id|match|                  event_start|                    event_end|max_humidity|
+---------+-----+-----------------------------+-----------------------------+------------+
|      100|    1|2024-11-28T09:00:00.000+08:00|2024-11-29T18:30:00.000+08:00|        45.1|
|      101|    1|2024-11-30T09:30:00.000+08:00|2024-11-30T09:30:00.000+08:00|        35.2|
+---------+-----+-----------------------------+-----------------------------+------------+
Total line number = 2
```
