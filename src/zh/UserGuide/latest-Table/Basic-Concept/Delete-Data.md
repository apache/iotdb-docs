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

# 数据删除

## 1. 数据删除：

数据删除可以通过 delete 语句来完成，其中可以通过指定标签和时间的过滤条件来删除部分数据。

### 1.1 语法概览：

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

- 当前仅支持时间条件和标签条件，条件之间仅可使用 AND 和 OR 运算符连接。
- 对于时间条件，支持 >、<、=、<=、>= 五种运算符。
- 对于标签条件，目前仅支持 = 运算符。

### 1.2 示例：

可以在[示例数据页面](../Reference/Sample-Data.md)中导入示例数据。可以使用这些数据来测试和执行示例中的SQL语句。

#### 1.2.1 删除全表数据

```SQL
# 全表删除
# Whole table deletion
DELETE FROM table1
```

#### 1.2.2 删除一段时间范围

```SQL
# 单时间段删除
# Single time interval deletion
DELETE FROM table1 WHERE time <= 2024-11-29 00:00:00

# 多时间段删除
# Multi time interval deletion
DELETE FROM table1  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00
```

#### 1.2.3 删除指定设备

```SQL
# 删除指定设备
# 标识条件只支持 = 运算符
# Device-specific deletion
DELETE FROM table1 WHERE device_id='101' and model_id = 'B'

# 删除指定设备的时间段
# Device-specific deletion with time interval
DELETE FROM table1 
    WHERE time >= 2024-11-27 16:39:00  and time <= 2024-11-29 16:42:00 
    AND device_id='101' and model_id = 'B'

# 删除指定类型的设备
# Device-type-specific deletion
DELETE FROM table1 WHERE model_id = 'B'
```

## 2. 设备删除：

当一个设备写入后，在 IoTDB 中即保留了其元数据，数据删除语句无法删除设备的元数据，可以使用设备删除语句删除设备的所有数据和元数据。

### 2.1 语法概览：

```SQL
DELETE DEVICES FROM tableName=qualifiedName (WHERE booleanExpression)?
```

- WHERE 仅支持对标签的等值过滤，条件之间仅可使用 AND 和 OR 运算符连接，不支持时间条件。

### 2.2 示例：

```SQL
DELETE DEVICES FROM table1 WHERE device_id = '101'
```