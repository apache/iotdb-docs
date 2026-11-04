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

# Delete Data

## 1. Data Deletion

Data deletion in IoTDB can be achieved using the DELETE statement. You can specify filters based on tags, attributes (supported since V2.0.12), and time to delete specific subsets of data.

Note:  
When executing a conventional data deletion command (the DELETE FROM statement), disk space is not immediately released. Instead, the data is marked first, and disk space is gradually freed by background tasks.  
You can speed up this process by adjusting the parameters `inner_compaction_task_selection_disk_redundancy` and `inner_compaction_task_selection_mods_file_threshold` to smaller values.  
The database deletion command (the DROP DATABASE statement) can immediately release disk space.

### 1.1 Syntax Overview

```SQL
DELETE FROM <TABLE_NAME> [WHERE_CLAUSE]?

WHERE_CLAUSE:
    WHERE DELETE_CONDITION

DELETE_CONDITION:
    SINGLE_CONDITION
    | DELETE_CONDITION AND DELETE_CONDITION
    | DELETE_CONDITION OR DELETE_CONDITION

SINGLE_CONDITION:
    TIME_CONDITION | ID_CONDITION | ATTRIBUTE_CONDITION

TIME_CONDITION:
    time TIME_OPERATOR LONG_LITERAL

TIME_OPERATOR:
    < | > | <= | >= | =

ID_CONDITION:
    identifier = STRING_LITERAL

ATTRIBUTE_CONDITION:
    attribute_identifier (= | != | > | >= | < | <= | LIKE) STRING_LITERAL
    | attribute_identifier IS [NOT] NULL
    | attribute_identifier IN (STRING_LITERAL [, STRING_LITERAL] ...)
```

**Note:**

- Conditions can filter by time, tags, and attributes, and can only be combined using `AND` and `OR`.
- Time conditions support `<`, `>`, `=`, `<=`, and `>=`.
- Tag conditions support only `=`.
- Attribute conditions support `=`, `!=`, `IS NULL`, `IS NOT NULL`, `>`, `>=`, `<`, `<=`, `LIKE`, and `IN`. The left operand must be an attribute column name, without an expression; the right operand must be a string literal.
- Each conjunction (a group of conditions joined by `AND`) that contains an attribute filter can match at most 1,000 devices. If it matches more, the entire DELETE statement is rejected. Add attribute filters to narrow the range, or remove all attribute filters and confirm the deletion range again.

### 1.2 Examples

The [Example Data page](../Reference/Sample-Data.md) provides SQL statements to construct table schemas and insert data. By downloading and executing these statements in the IoTDB CLI, you can import the data into IoTDB. This data can be used to test and run the example SQL queries included in this documentation, allowing you to reproduce the described results.

#### 1.2.1 Delete All Data from a Table

```SQL
DELETE FROM table1;
```

#### 1.2.2 Delete Data within a Specific Time Range

```SQL
DELETE FROM table1  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00;
```

#### 1.2.3 Deleting Data for a Specific Device

```SQL
DELETE FROM table1 
    WHERE time >= 2024-11-27 16:39:00  and time <= 2024-11-29 16:42:00 
    AND device_id='101' and model_id = 'B';
```

#### 1.2.4 Deleting Data by Attribute Condition

Since V2.0.12, data can be deleted by filtering on an attribute column. For example, delete data in `table1` where the attribute column `model_id` is `'B'` and the time is no earlier than `2024-11-27 16:39:00`:

```SQL
DELETE FROM table1
    WHERE model_id = 'B'
      AND time >= 2024-11-27 16:39:00;
```

## 2. Device Deletion

The device deletion statement supports deleting all devices and their related data in the table.

### 2.1 Syntax Overview

```SQL
DELETE DEVICES FROM tableName=qualifiedName (WHERE booleanExpression)?
```

**Notes:**

- The `WHERE` clause supports only equality filters on tags. Conditions can be combined using `AND` and `OR` operators.
- Time conditions are **not** supported in the `DELETE DEVICES` statement.

### 2.2 Example

```SQL
DELETE DEVICES FROM table1 WHERE device_id = '101';
```
