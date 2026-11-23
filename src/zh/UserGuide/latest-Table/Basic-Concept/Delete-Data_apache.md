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

## 1. 数据删除

数据删除可以通过 DELETE 语句来完成，其中可以通过指定标签、属性（自 V2.0.12 起支持）和时间的过滤条件来删除部分数据。

注意：
常规的数据删除命令 （DELETE FROM 语句）执行后不会立即释放磁盘空间，而是先对数据进行标记，依靠后台任务逐步地去释放空间。
调小参数 `inner_compaction_task_selection_disk_redundancy` 和 `inner_compaction_task_selection_mods_file_threshold` 可以加快该过程。
删除数据库命令（DROP DATABASE 语句）可以立即释放磁盘空间。

### 1.1 语法概览

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

- 条件可按时间、标签和属性过滤，条件之间仅可使用 AND 和 OR 运算符连接。
- 时间条件支持 >、<、=、<=、>= 五种运算符。
- 标签条件仅支持 = 运算符。
- 属性条件支持 =、!=、IS NULL、IS NOT NULL、>、>=、<、<=、LIKE 和 IN。左操作数必须是属性列名，不能是表达式；右操作数必须是字符串字面量。
- 每个包含属性条件的 AND 条件组最多可匹配 1,000 台设备。如果匹配设备数超过该上限，整条 DELETE 语句将被拒绝。可以添加属性条件缩小范围，或移除所有属性条件后重新确认删除范围。

### 1.2 示例

可以在[示例数据页面](../Reference/Sample-Data.md)中导入示例数据。可以使用这些数据来测试和执行示例中的SQL语句。

#### 1.2.1 删除全表数据

```SQL
DELETE FROM table1;
```

#### 1.2.2 删除一段时间范围

```SQL
DELETE FROM table1  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00;
```

#### 1.2.3 删除指定设备

```SQL
DELETE FROM table1 
    WHERE time >= 2024-11-27 16:39:00  and time <= 2024-11-29 16:42:00 
    AND device_id='101' and model_id = 'B';
```

#### 1.2.4 按属性条件删除数据

自 V2.0.12 起，支持按属性列过滤删除数据。例如，删除 `table1` 中属性列 `model_id` 为 `'B'` 且时间不早于 `2024-11-27 16:39:00` 的数据：

```SQL
DELETE FROM table1
    WHERE model_id = 'B'
      AND time >= 2024-11-27 16:39:00;
```

## 2. 设备删除

设备删除语句支持删除表里所有设备及相关数据。

### 2.1 语法概览

```SQL
DELETE DEVICES FROM tableName=qualifiedName (WHERE booleanExpression)?
```

- WHERE 仅支持对标签的等值过滤，条件之间仅可使用 AND 和 OR 运算符连接，不支持时间条件。

### 2.2 示例

```SQL
DELETE DEVICES FROM table1 WHERE device_id = '101';
```
