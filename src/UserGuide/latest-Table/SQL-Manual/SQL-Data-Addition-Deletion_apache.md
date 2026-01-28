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

# Data Addition & Deletion

## 1. Data Insertion

**Syntax:**

```SQL
INSERT INTO <TABLE_NAME> [(COLUMN_NAME[, COLUMN_NAME]*)]? VALUES (COLUMN_VALUE[, COLUMN_VALUE]*)
```

[Detailed syntax reference](../Basic-Concept/Write-Updata-Data_apache.md#_1-1-syntax)

**Example 1: Specified Columns Insertion**

```SQL
INSERT INTO table1(region, plant_id, device_id, time, temperature, humidity) VALUES ('Hamburg', '1001', '100', '2025-11-26 13:37:00', 90.0, 35.1)

INSERT INTO table1(region, plant_id, device_id, time, temperature) VALUES ('Hamburg', '1001', '100', '2025-11-26 13:38:00', 91.0)
```

**Example 2: NULL Value Insertion**

```SQL
# Equivalent to the example above
INSERT INTO table1(region, plant_id, device_id, model_id, maintenance, time, temperature, humidity) VALUES ('Hamburg', '1001', '100', null, null, '2025-11-26 13:37:00', 90.0, 35.1)

INSERT INTO table1(region, plant_id, device_id, model_id, maintenance, time, temperature, humidity) VALUES ('Hamburg', '1001', '100', null, null, '2025-11-26 13:38:00', 91.0, null)
```

**Example 3: Multi-row Insertion**

```SQL
INSERT INTO table1
VALUES 
('2025-11-26 13:37:00', 'Frankfurt', '1001', '100', 'A', '180', 90.0, 35.1, true, '2025-11-26 13:37:34'),
('2025-11-26 13:38:00', 'Frankfurt', '1001', '100', 'A', '180', 90.0, 35.1, true, '2025-11-26 13:38:25')

INSERT INTO table1
(region, plant_id, device_id, model_id, maintenance, time, temperature, humidity, status, arrival_time) 
VALUES 
('Frankfurt', '1001', '100', 'A', '180', '2025-11-26 13:37:00', 90.0, 35.1, true, '2025-11-26 13:37:34'),
('Frankfurt', '1001', '100', 'A', '180', '2025-11-26 13:38:00', 90.0, 35.1, true, '2025-11-26 13:38:25')
```

**Example 4: Query Write-back**

```SQL
insert into target_table select time,region,device_id,temperature from table1 where region = 'bj';

insert into target_table(time,device_id,temperature) table table3;

insert into target_table (select t1.time, t1.region as region, t1.device_id as device_id, t1.temperature as temperature from table1 t1 where t1.time in (select t2.time from table2 t2 where t2.region = 'shh'));
```


## 2. Data Update

**Syntax:**

```SQL
UPDATE <TABLE_NAME> SET updateAssignment (',' updateAssignment)* (WHERE where=booleanExpression)?

updateAssignment
    : identifier EQ expression
    ;
```

[Detailed syntax reference](../Basic-Concept/Write-Updata-Data_apache.md#_2-1-syntax)

**Example:**

```SQL
update table1 set b = a where substring(a, 1, 1) like '%'
```

## 3. Data Deletion

**Syntax:**

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

**Example 1: Full Table Deletion**

```SQL
DELETE FROM table1
```

**Example 2: Time-range Deletion**

```SQL
-- Single time range
DELETE FROM table1 WHERE time <= 2024-11-29 00:00:00

-- Multiple time ranges
DELETE FROM table1  WHERE time >= 2024-11-27 00:00:00  and time <= 2024-11-29 00:00:00
```

**Example 3: Device-Specific Deletion**

```SQL
-- Delete data for specific device
DELETE FROM table1 
WHERE device_id='101' AND model_id = 'B';

-- Delete data for device within time range
DELETE FROM table1 
WHERE time >= '2024-11-27 16:39:00' AND time <= '2024-11-29 16:42:00'
    AND device_id='101' AND model_id = 'B';
    
-- Delete data for specific device model
DELETE FROM table1 WHERE model_id = 'B';
```

## 4. Device Deletion

**Syntax:**

```SQL
DELETE DEVICES FROM tableName=qualifiedName (WHERE booleanExpression)?
```

**Example: Delete specified device and all associated data**

```SQL
DELETE DEVICES FROM table1 WHERE device_id = '101'
```
