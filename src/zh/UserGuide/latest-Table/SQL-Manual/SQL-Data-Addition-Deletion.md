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

# 数据增删

## 1. 数据写入

**语法：**

```SQL
INSERT INTO <TABLE_NAME> [(COLUMN_NAME[, COLUMN_NAME]*)]? VALUES (COLUMN_VALUE[, COLUMN_VALUE]*)
```

更多详细语法说明请参考：[写入语法](../Basic-Concept/Write-Updata-Data.md#_1-1-语法)

**示例一：指定列写入**

```SQL
insert into table1("地区", "厂号", "设备号", Time, "温度", "排量") values ('湖南', '3001', '3', 4, 90.0, 1200.0)

insert into table1("地区", "厂号", "设备号", Time, "温度") values ('湖南, '3001', '3', 5, 90.0)
```

**示例二：空值写入**

```SQL
-- 上述部分列写入等价于如下的带空值写入
insert into table1("地区", "厂号", "设备号", "型号", "维修周期", Time, "温度", "排量") values ('湖南', '3001', '3', null, null, 4, 90.0, 1200.0)

insert into table1("地区", "厂号", "设备号", "型号", "维修周期", Time, "温度", "排量") values ('湖南', '3001', '3', null, null, 5, 90.0, null)
```

**示例三：多行写入**

```SQL
insert into table1
values
('北京', '3001', '3', '1', '10', 4, 90.0, 1200.0),
('北京', '3001', '3', '1', '10', 5, 90.0, 1200.0);

insert into table1
("地区", "厂号", "设备号", Time, "温度", "排量")
values
('北京', '3001', '3', 4, 90.0, 1200.0),
('北京', '3001', '3', 5, 90.0, 1200.0);
```

## 2. 数据更新

**语法：**

```SQL
UPDATE <TABLE_NAME> SET updateAssignment (',' updateAssignment)* (WHERE where=booleanExpression)?

updateAssignment
    : identifier EQ expression
    ;
```

更多详细语法说明请参考：[更新语法](../Basic-Concept/Write-Updata-Data.md#_2-1-语法)

**示例：**

```SQL
update table1 set b = a where substring(a, 1, 1) like '%'
```

## 3. 数据删除

**语法:**

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

**示例一: 删除全表数据**

```SQL
-- 全表删除
DELETE FROM table1
```

**示例二：删除一段时间范围内的数据**

```SQL
-- 单时间段数据删除
DELETE FROM table1 WHERE time <= 2024-11-29 00:00:00

-- 多时间段数据删除
DELETE FROM table1  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00
```

**示例三：删除指定设备的数据**

```SQL
-- 删除指定设备的数据
DELETE FROM table1 WHERE device_id='101' and model_id = 'B'

-- 删除指定设备及时间段的数据
DELETE FROM table1 
    WHERE time >= 2024-11-27 16:39:00  and time <= 2024-11-29 16:42:00 
    AND device_id='101' and model_id = 'B'

-- 删除指定类型设备的数据
DELETE FROM table1 WHERE model_id = 'B'
```

## 4. 设备删除

**语法：**

```SQL
DELETE DEVICES FROM tableName=qualifiedName (WHERE booleanExpression)?
```

**示例：删除指定设备及其相关的所有数据**

```SQL
DELETE DEVICES FROM table1 WHERE device_id = '101'
```
