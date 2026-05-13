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
# Set Operations

IoTDB natively supports standard SQL set operations, including three core operators: **UNION**, **INTERSECT**, and **EXCEPT**. These operations enable seamless merging, comparison, and filtering of query results from multiple time-series data sources, greatly improving the flexibility and efficiency of time-series data analysis.

> Note: This feature is available since version 2.0.9-beta.

## 1. UNION
### 1.1 Overview
The UNION operator combines all rows from two result sets (order not guaranteed), supporting both duplicate elimination (default) and duplicate retention modes.

### 1.2 Syntax
```sql
query UNION (ALL | DISTINCT) query
```

**Description**
1. **Duplicate Handling**
    - Default (`UNION` or `UNION DISTINCT`): Automatically removes duplicate rows.
    - `UNION ALL`: Preserves all rows (including duplicates) with higher performance.

2. **Input Requirements**
    - The two queries must return the same number of columns.
    - Corresponding columns must have compatible data types:
        - Numeric compatibility: `INT32`, `INT64`, `FLOAT`, and `DOUBLE` are fully compatible with each other.
        - String compatibility: `TEXT` and `STRING` are fully compatible.
        - Special rule: `INT64` is compatible with `TIMESTAMP`.

3. **Result Set Rules**
    - Column names and order are inherited from the first query.

### 1.3 Examples
Using the [sample data](../Reference/Sample-Data.md):

1. Get distinct non-null device and temperature records from `table1` and `table2`
```sql
SELECT device_id, temperature FROM table1 WHERE temperature IS NOT NULL
UNION
SELECT device_id, temperature FROM table2 WHERE temperature IS NOT NULL;

-- Equivalent to:
SELECT device_id, temperature FROM table1 WHERE temperature IS NOT NULL
UNION DISTINCT
SELECT device_id, temperature FROM table2 WHERE temperature IS NOT NULL;
```

Result:
```
+---------+-----------+
|device_id|temperature|
+---------+-----------+
|      101|       90.0|
|      101|       85.0|
|      100|       90.0|
|      100|       85.0|
|      100|       88.0|
+---------+-----------+
Total line number = 5
It costs 0.074s
```

2. Get all non-null device and temperature records from `table1` and `table2` (including duplicates)
```sql
SELECT device_id, temperature FROM table1 WHERE temperature IS NOT NULL
UNION ALL
SELECT device_id, temperature FROM table2 WHERE temperature IS NOT NULL;
```

Result:
```
+---------+-----------+
|device_id|temperature|
+---------+-----------+
|      101|       90.0|
|      101|       90.0|
|      101|       85.0|
|      101|       85.0|
|      101|       85.0|
|      101|       85.0|
|      100|       90.0|
|      100|       85.0|
|      100|       85.0|
|      100|       88.0|
|      100|       90.0|
|      100|       90.0|
|      101|       90.0|
|      101|       85.0|
|      101|       85.0|
|      100|       85.0|
|      100|       90.0|
+---------+-----------+
Total line number = 17
It costs 0.108s
```

> **Notes**
> - Set operations **do not guarantee result order**; actual output may differ from examples.


## 2. INTERSECT
### 2.1 Overview
The INTERSECT operator returns rows that exist in both result sets (order not guaranteed), supporting both duplicate elimination (default) and duplicate retention modes.

### 2.2 Syntax
```sql
query1 INTERSECT [ALL | DISTINCT] query2
```

**Description**
1. **Duplicate Handling**
    - Default (`INTERSECT` or `INTERSECT DISTINCT`): Automatically removes duplicate rows.
    - `INTERSECT ALL`: Preserves duplicate rows, with slightly lower performance.

2. **Precedence Rules**
    - `INTERSECT` has higher precedence than `UNION` and `EXCEPT`
      (e.g., `A UNION B INTERSECT C` is equivalent to `A UNION (B INTERSECT C)`).
    - Evaluation is left-to-right
      (e.g., `A INTERSECT B INTERSECT C` is equivalent to `(A INTERSECT B) INTERSECT C`).

3. **Input Requirements**
    - The two queries must return the same number of columns.
    - Corresponding columns must have compatible data types (same rules as UNION).
    - NULL values are treated as equal (`NULL IS NOT DISTINCT FROM NULL`).
    - If the `time` column is not included in `SELECT`, it does not participate in comparison and will not appear in the result.

4. **Result Set Rules**
    - Column names and order are inherited from the first query.

### 2.3 Examples
Using the [sample data](../Reference/Sample-Data.md):

1. Get distinct common device and temperature records from `table1` and `table2`
```sql
SELECT device_id, temperature FROM table1
INTERSECT
SELECT device_id, temperature FROM table2;

-- Equivalent to:
SELECT device_id, temperature FROM table1
INTERSECT DISTINCT
SELECT device_id, temperature FROM table2;
```

Result:
```
+---------+-----------+
|device_id|temperature|
+---------+-----------+
|      101|       90.0|
|      101|       85.0|
|      100|       null|
|      100|       90.0|
|      100|       85.0|
+---------+-----------+
Total line number = 5
It costs 0.087s
```

2. Get all common device and temperature records from `table1` and `table2` (including duplicates)
```sql
SELECT device_id, temperature FROM table1
INTERSECT ALL
SELECT device_id, temperature FROM table2;
```

Result:
```
+---------+-----------+
|device_id|temperature|
+---------+-----------+
|      100|       85.0|
|      100|       90.0|
|      100|       null|
|      101|       85.0|
|      101|       85.0|
|      101|       90.0|
+---------+-----------+
Total line number = 6
It costs 0.139s
```

> **Notes**
> - Set operations **do not guarantee result order**.
> - When mixed with `UNION`/`EXCEPT`, use parentheses to explicitly specify precedence
    >   (e.g., `A INTERSECT (B UNION C)`).


## 3. EXCEPT
### 3.1 Overview
The EXCEPT operator returns rows that exist in the first result set but **not** in the second (order not guaranteed), supporting both duplicate elimination (default) and duplicate retention modes.

### 3.2 Syntax
```sql
query1 EXCEPT [ALL | DISTINCT] query2
```

**Description**
1. **Duplicate Handling**
    - Default (`EXCEPT` or `EXCEPT DISTINCT`): Automatically removes duplicate rows.
    - `EXCEPT ALL`: Preserves duplicate rows, with slightly lower performance.

2. **Precedence Rules**
    - `EXCEPT` has the same precedence as `UNION`, and lower precedence than `INTERSECT`
      (e.g., `A INTERSECT B EXCEPT C` is equivalent to `(A INTERSECT B) EXCEPT C`).
    - Evaluation is left-to-right
      (e.g., `A EXCEPT B EXCEPT C` is equivalent to `(A EXCEPT B) EXCEPT C`).

3. **Input Requirements**
    - The two queries must return the same number of columns.
    - Corresponding columns must have compatible data types (same rules as UNION).
    - NULL values are treated as equal (`NULL IS NOT DISTINCT FROM NULL`).
    - If the `time` column is not included in `SELECT`, it does not participate in comparison and will not appear in the result.

4. **Result Set Rules**
    - Column names and order are inherited from the first query.

### 3.3 Examples
Using the [sample data](../Reference/Sample-Data.md):

1. Get distinct records from `table1` that do not exist in `table2`
```sql
SELECT device_id, temperature FROM table1
EXCEPT
SELECT device_id, temperature FROM table2;

-- Equivalent to:
SELECT device_id, temperature FROM table1
EXCEPT DISTINCT
SELECT device_id, temperature FROM table2;
```

Result:
```
+---------+-----------+
|device_id|temperature|
+---------+-----------+
|      101|       null|
|      100|       88.0|
+---------+-----------+
Total line number = 2
It costs 0.173s
```

2. Get all records from `table1` that do not exist in `table2` (including duplicates)
```sql
SELECT device_id, temperature FROM table1
EXCEPT ALL
SELECT device_id, temperature FROM table2;
```

Result:
```
+---------+-----------+
|device_id|temperature|
+---------+-----------+
|      100|       85.0|
|      100|       88.0|
|      100|       90.0|
|      100|       90.0|
|      100|       null|
|      101|       85.0|
|      101|       85.0|
|      101|       90.0|
|      101|       null|
|      101|       null|
|      101|       null|
|      101|       null|
+---------+-----------+
Total line number = 12
It costs 0.155s
```

> **Notes**
> - Set operations **do not guarantee result order**.
> - When mixed with `UNION`/`INTERSECT`, use parentheses to explicitly specify precedence
    >   (e.g., `A EXCEPT (B INTERSECT C)`).