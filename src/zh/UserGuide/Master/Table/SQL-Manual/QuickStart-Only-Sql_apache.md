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

# 快速 SQL 体验

> **在执行以下 SQL 语句前，请确保**
> 
> * **已成功启动 IoTDB 服务**
> * **已通过 Cli 客户端连接 IoTDB**
>
> 注意：若您使用的终端不支持多行粘贴（例如 Windows CMD），请将 SQL 语句调整为单行格式后再执行。

## 1. 数据库管理

```SQL
--创建数据库 database1,并将数据库的 TTL 时间设置为1年;
CREATE DATABASE IF NOT EXISTS database1;

--使用数据库 database1;
USE database1;

--修改数据库的 TTL 时间为1周;
ALTER DATABASE database1 SET PROPERTIES TTL=604800000;

--删除数据库 database1;
DROP DATABASE IF EXISTS database1;
```

详细语法说明可参考：[数据库管理](../Basic-Concept/Database-Management_apache.md)

## 2. 表管理

```SQL
--创建表 table1;
CREATE TABLE table1 (
  time TIMESTAMP TIME,
  device_id STRING TAG,
  maintenance STRING ATTRIBUTE COMMENT 'maintenance',
  temperature FLOAT FIELD COMMENT 'temperature',
  status Boolean FIELD COMMENT 'status'
);

-- 查看表 table1 的列信息;
DESC table1 DETAILS;

-- 修改表;
-- 表 table1 增加列;
ALTER TABLE table1 ADD COLUMN IF NOT EXISTS humidity FLOAT FIELD COMMENT 'humidity';
-- 表 table1 TTL 设置为1周;
ALTER TABLE table1 set properties TTL=604800000;

--删除表 table1;
DROP TABLE table1;
```

详细语法说明可参考：[表管理](../Basic-Concept/Table-Management_apache.md)

## 3. 数据写入

```SQL
--单行写入;
INSERT INTO table1(device_id, time, temperature) VALUES ('100', '2025-11-26 13:37:00', 90.0);

--多行写入;
INSERT INTO table1(device_id, maintenance, time, temperature) VALUES 
  ('101', '180', '2024-11-26 13:37:00', 88.0),
  ('100', '180', '2024-11-26 13:38:00', 85.0),
  ('101', '180', '2024-11-27 16:38:00', 80.0);
```

详细语法说明可参考：[数据写入](../Basic-Concept/Write-Updata-Data_apache.md#_1-数据写入)

## 4. 数据查询

```SQL
--全表查询;
SELECT * FROM table1;

--函数查询;
SELECT count(*), sum(temperature) FROM table1;

--查询指定设备及时间段的数据;
SELECT * 
FROM table1 
WHERE time >= 2024-11-26 00:00:00  and time <= 2024-11-27 00:00:00 and device_id='101';
```

详细语法说明可参考：[数据查询](../Basic-Concept/Query-Data_apache.md)

## 5. 数据更新

```SQL
-- 更新 device_id 是 100 的数据的属性 maintenance 值;
UPDATE table1 SET maintenance='45' WHERE device_id='100';
```

详细语法说明可参考：[数据更新](../Basic-Concept/Write-Updata-Data_apache.md#_2-数据更新)

## 6. 数据删除

```SQL
-- 删除指定设备及时间段的数据;
DELETE FROM table1 WHERE time >= 2024-11-26 23:39:00  and time <= 2024-11-27 20:42:00 AND device_id='101';

-- 全表删除;
DELETE FROM table1;
```

详细语法说明可参考：[数据删除](../Basic-Concept/Delete-Data.md)
