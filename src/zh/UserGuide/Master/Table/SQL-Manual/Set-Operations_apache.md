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

# 集合操作

IoTDB 原生支持 SQL 标准集合操作，包括 UNION（并集）、INTERSECT（交集）和EXCEPT（差集）三种核心运算符。通过执行这些操作，可实现无缝合并、比较和筛选多源时序数据查询结果，显著提升时序数据分析的灵活性与效率。

> 注意：该功能从 V2.0.9-beta 版本开始提供。

## 1. UNION
### 1.1 概述

UNION 操作将两个查询结果集的所有行合并（不保证结果顺序），支持去重（默认）和保留重复两种模式。

### 1.2 语法定义

```SQL
query UNION (ALL | DISTINCT) query
```

**说明：**

1. **去重规则：**

    1. 默认（`UNION` 或 `UNION DISTINCT`）：自动去除重复行。
    2. `UNION ALL`：保留所有行（包括重复项），性能更高。
2. **输入要求：**

    1. 两个查询结果的列数必须相同。
    2. 对应列数据类型需兼容，兼容性规则如下：
        * 数值类型互容：`INT32`、`INT64`、`FLOAT`、`DOUBLE` 之间完全兼容。
        * 字符串类型互容：`TEXT` 与 `STRING` 完全兼容。
        * 特殊规则：`INT64` 与 `TIMESTAMP` 兼容。
3. **结果集规则：**

    1. 列名及顺序继承第一个查询的定义。

### 1.3 使用示例

以[示例数据](../Reference/Sample-Data.md)为原始数据。

1. 获取 table1 和 table2 中设备及温度的非空数据集合（去重）

```SQL
select device_id,temperature from table1 where temperature is not null
union 
select device_id,temperature from table2 where temperature is not null;

--等价于;
select device_id,temperature from table1 where temperature is not null 
union distinct
select device_id,temperature from table2 where temperature is not null;
```

执行结果：

```Bash
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

2. 获取 table1 和 table2 中设备及温度的非空数据集合（保留重复）

```SQL
select device_id,temperature from table1 where temperature is not null 
union all 
select device_id,temperature from table2 where temperature is not null;
```

执行结果：

```SQL
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

> ​**注意**​：
>
> * 集合操作​**不保证结果顺序**​，实际输出顺序可能与示例不同。

## 2. INTERSECT
### 2.1 概述

INTERSECT 操作返回两个查询结果集中共同存在的行（不保证结果顺序），支持去重（默认）和保留重复两种模式。

### 2.2 语法定义

```SQL
query1 INTERSECT [ALL | DISTINCT] query2
```

​**说明**​：

1. ​**去重规则**​：

    1. 默认（`INTERSECT` 或 `INTERSECT DISTINCT`）：自动去除重复行。
    2. `INTERSECT ALL`：保留所有重复行（包括重复项），性能略低。
2. ​**优先级规则**​：

    1. `INTERSECT` 优先级高于 `UNION` 和 `EXCEPT`（如 `A UNION B INTERSECT C` 等价于 `A UNION (B INTERSECT C)`）。
    2. 从左到右计算（`A INTERSECT B INTERSECT C` 等价于 `(A INTERSECT B) INTERSECT C`）。
3. ​**输入要求**​：

    1. 两个查询结果的列数必须相同。
    2. 对应列数据类型需兼容（兼容性规则同 UNION）：
        * 数值类型互容：`INT32`、`INT64`、`FLOAT`、`DOUBLE` 之间完全兼容。
        * 字符串类型互容：`TEXT` 与 `STRING` 完全兼容。
        * 特殊规则：`INT64` 与 `TIMESTAMP` 兼容。
    3. NULL 值视为相等（`NULL IS NOT DISTINCT FROM NULL`）。
    4. 若 `SELECT` 未包含 `time` 列，则 `time` 列不参与比较，结果集无 `time` 列。
4. ​**结果集规则**​：

    1. 列名及顺序继承第一个查询的定义。

### 2.3 使用示例

基于 [示例数据](../Reference/Sample-Data.md)：

1. 获取 table1 和 table2 中设备及温度的共同数据（去重）

   ```SQL
   select device_id, temperature from table1 
   intersect
   select device_id, temperature from table2;
   
   --等价于;
   select device_id, temperature from table1
   intersect distinct
   select device_id, temperature from table2;
   ```

   执行结果：

   ```Bash
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
2. 获取 table1 和 table2 中设备及温度的共同数据（保留重复）

   ```SQL
   select device_id, temperature from table1 
   intersect all
   select device_id, temperature from table2;
   ```

   执行结果：

   ```Bash
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

> ​**注意**​：
>
> * 集合操作​**不保证结果顺序**​，实际输出顺序可能与示例不同。
> * 与 `UNION`/`EXCEPT` 混合使用时，需通过括号明确优先级（如 `A INTERSECT (B UNION C)`）。

## 3. EXCEPT
### 3.1 概述

EXCEPT 操作返回第一个查询结果集存在但第二个查询结果集中不存在的行（不保证结果顺序），支持去重（默认）和保留重复两种模式。

### 3.2 语法定义

```SQL
query1 EXCEPT [ALL | DISTINCT] query2
```

​**说明**​：

1. ​**去重规则**​：

    1. 默认（`EXCEPT` 或 `EXCEPT DISTINCT`）：自动去除重复行。
    2. `EXCEPT ALL`：保留所有重复行（包括重复项），性能略低。
2. ​**优先级规则**​：

    1. `EXCEPT` 与 `UNION` 优先级相同，低于 `INTERSECT`（如 `A INTERSECT B EXCEPT C` 等价于 `(A INTERSECT B) EXCEPT C`）。
    2. 从左到右计算（`A EXCEPT B EXCEPT C` 等价于 `(A EXCEPT B) EXCEPT C`）。
3. ​**输入要求**​：

    1. 两个查询结果的列数必须相同。
    2. 对应列数据类型需兼容（兼容性规则同 UNION）：
        * 数值类型互容：`INT32`、`INT64`、`FLOAT`、`DOUBLE` 之间完全兼容。
        * 字符串类型互容：`TEXT` 与 `STRING` 完全兼容。
        * 特殊规则：`INT64` 与 `TIMESTAMP` 兼容。
    3. NULL 值视为相等（`NULL IS NOT DISTINCT FROM NULL`）。
    4. 若 `SELECT` 未包含 `time` 列，则 `time` 列不参与比较，结果集无 `time` 列。
4. ​**结果集规则**​：

    1. 列名及顺序继承第一个查询的定义。

### 3.3 使用示例

基于 [示例数据](../Reference/Sample-Data.md)：

1. 获取 table1 中存在但 table2 中不存在的设备及温度数据（去重）

   ```SQL
   select device_id, temperature from table1 
   except
   select device_id, temperature from table2;
   
   --等价于;
   select device_id, temperature from table1 
   except distinct
   select device_id, temperature from table2;
   ```

   执行结果：

   ```Bash
   +---------+-----------+
   |device_id|temperature|
   +---------+-----------+
   |      101|       null|
   |      100|       88.0|
   +---------+-----------+
   Total line number = 2
   It costs 0.173s
   ```
2. 获取 table1 中存在但 table2 中不存在的设备及温度数据（保留重复）

   ```SQL
   select device_id, temperature from table1
   except all
   select device_id, temperature from table2;
   ```

   执行结果：

   ```Bash
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

> ​**注意**​：
>
> * 集合操作​**不保证结果顺序**​，实际输出顺序可能与示例不同。
> * 与 `UNION`/`INTERSECT` 混合使用时，需通过括号明确优先级（如 `A EXCEPT (B INTERSECT C)`）。
