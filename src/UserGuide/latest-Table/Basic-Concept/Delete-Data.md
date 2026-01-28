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

Data deletion in IoTDB can be achieved using the DELETE statement. You can specify filters based on tags and time to delete specific subsets of data.

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

SINGLE_CODITION:
    TIME_CONDITION | ID_CONDITION

TIME_CONDITION:
    time TIME_OPERATOR LONG_LITERAL

TIME_OPERATOR:
    < | > | <= | >= | =

ID_CONDITION:
    identifier = STRING_LITERAL
```

**Note:**

- The `DELETE_CONDITION` can include single conditions or be a combination of conditions (logical operators like `AND` and `OR` are used). Currently, only **time conditions** and **tag conditions** are supported.
- For **time conditions**, operators include standard comparison symbols (`<`, `>`, etc.).
- For **tag conditions**, only equality (=) is allowed.

### 1.2 Examples

The [Example Data page](../Reference/Sample-Data.md)page provides SQL statements to construct table schemas and insert data. By downloading and executing these statements in the IoTDB CLI, you can import the data into IoTDB. This data can be used to test and run the example SQL queries included in this documentation, allowing you to reproduce the described results.

#### 1.2.1 Delet  All Data from a Table

```SQL
# Whole table deletion
DELETE FROM table1
```

#### 1.2.2 Delete Data within a Specific Time Range

```SQL
# Single time interval deletion
DELETE FROM table1 WHERE time <= 2024-11-29 00:00:00

# Multi time interval deletion
DELETE FROM table1  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00
```

#### 1.2.3 Deleting Data for a Specific Device

```SQL
# Device-specific deletion
# Identifier conditions only support the '=' operator
DELETE FROM table1 WHERE device_id='101' and model_id = 'B'

# Device-specific deletion with time interval
DELETE FROM table1 
    WHERE time >= 2024-11-27 16:39:00  and time <= 2024-11-29 16:42:00 
    AND device_id='101' and model_id = 'B'

# Device-type-specific deletion
DELETE FROM table1 WHERE model_id = 'B'
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
DELETE DEVICES FROM table1 WHERE device_id = '101'
```