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

# Data Query

## 1. Syntax Overview

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

The IoTDB table model query syntax supports the following clauses:

- **SELECT Clause**: Specifies the columns to be included in the result. Details: [SELECT Clause](../SQL-Manual/Select-Clause.md)
- **FROM Clause**: Indicates the data source for the query, which can be a single table, multiple tables joined using the `JOIN` clause, or a subquery. Details: [FROM & JOIN Clause](../SQL-Manual/From-Join-Clause.md)
- **WHERE Clause**: Filters rows based on specific conditions. Logically executed immediately after the `FROM` clause. Details: [WHERE Clause](../SQL-Manual/Where-Clause.md)
- **GROUP BY Clause**: Used for aggregating data, specifying the columns for grouping. Details: [GROUP BY Clause](../SQL-Manual/GroupBy-Clause.md)
- **HAVING Clause**: Applied after the `GROUP BY` clause to filter grouped data, similar to `WHERE` but operates after grouping. Details:[HAVING Clause](../SQL-Manual/Having-Clause.md)
- **FILL Clause**: Handles missing values in query results by specifying fill methods (e.g., previous non-null value or linear interpolation) for better visualization and analysis. Details:[FILL Clause](../SQL-Manual/Fill-Clause.md)
- **ORDER BY Clause**: Sorts query results in ascending (`ASC`) or descending (`DESC`) order, with optional handling for null values (`NULLS FIRST` or `NULLS LAST`). Details: [ORDER BY Clause](../SQL-Manual/OrderBy-Clause.md)
- **OFFSET Clause**: Specifies the starting position for the query result, skipping the first `OFFSET` rows. Often used with the `LIMIT` clause. Details: [LIMIT and OFFSET Clause](../SQL-Manual/Limit-Offset-Clause.md)
- **LIMIT Clause**: Limits the number of rows in the query result. Typically used in conjunction with the `OFFSET` clause for pagination. Details: [LIMIT and OFFSET Clause](../SQL-Manual/Limit-Offset-Clause.md)

## 2. Clause Execution Order

![](/img/%E5%AD%90%E5%8F%A5%E6%89%A7%E8%A1%8C%E9%A1%BA%E5%BA%8F01.png)


## 3. Common Query Examples

### 3.1 Sample Dataset

The [Example Data page](../Reference/Sample-Data.md)page provides SQL statements to construct table schemas and insert data. By downloading and executing these statements in the IoTDB CLI, you can import the data into IoTDB. This data can be used to test and run the example SQL queries included in this documentation, allowing you to reproduce the described results.

### 3.2 Basic Data Query

**Example 1: Filter by Time**

```SQL
IoTDB> SELECT time, temperature, humidity 
         FROM table1 
         WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00;
```

**Result**:

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

**Example 2: Filter by** **Value**

```SQL
IoTDB> SELECT time, temperature, humidity 
         FROM table1 
         WHERE temperature > 89.0;
```

**Result**:

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

**Example 3: Filter by Attribute**

```SQL
IoTDB> SELECT time, temperature, humidity 
         FROM table1 
         WHERE model_id ='B';
```

**Result**:

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

### 3.3 Aggregation Query

**Example**: Calculate the average, maximum, and minimum temperature for each `device_id` within a specific time range.

```SQL
IoTDB> SELECT device_id, AVG(temperature) as avg_temp, MAX(temperature) as max_temp, MIN(temperature) as min_temp
         FROM table1
         WHERE time >= 2024-11-26 00:00:00 AND time <= 2024-11-29 00:00:00
         GROUP BY device_id;
```

**Result**:

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

### 3.4 Latest Point Query

**Example**: Retrieve the latest record for each `device_id`, including the temperature value and the timestamp of the last record.

```SQL
IoTDB> SELECT device_id,last(temperature),last_by(time,temperature) 
         FROM table1 
         GROUP BY device_id;
```

**Result**:

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

### 3.5 Downsampling Query

**Example**: Group data by day and calculate the average temperature using `date_bin_gapfill` function.

```SQL
IoTDB> SELECT date_bin(1d ,time) as day_time, AVG(temperature) as avg_temp
         FROM table1
         WHERE time >= 2024-11-26 00:00:00 AND time <= 2024-11-30 00:00:00
         GROUP BY date_bin(1d ,time);
```

**Result**:

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

### 3.6 Missing Data Filling

**Example**: Query the records within a specified time range where `device_id` is '100'. If there are missing data points, fill them using the previous non-null value.

```SQL
IoTDB> SELECT time, temperature, humidity  
         FROM table1 
         WHERE time >= 2024-11-26 00:00:00  and time <= 2024-11-30 11:00:00
         AND region='East' AND plant_id='1001' AND device_id='101'
         FILL METHOD PREVIOUS;
```

**Result**:

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

### 3.7 Sorting & Pagination

**Example**: Query records from the table, sorting by `humidity` in descending order and placing null values (NULL) at the end. Skip the first 2 rows and return the next 8 rows.

```SQL
IoTDB> SELECT time, temperature, humidity
         FROM table1
         ORDER BY humidity desc NULLS LAST
         OFFSET 2
         LIMIT 10;
```

**Result**:

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
