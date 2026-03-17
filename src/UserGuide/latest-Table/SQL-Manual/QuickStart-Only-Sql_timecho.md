<!--

    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at
    
        http://www.timecho.org/licenses/LICENSE-2.0
    
    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.

-->
# QuickStart Only SQL

> **Before executing the following SQL statements, please ensure**
>
> * **IoTDB service has been successfully started**
> * **Connected to IoTDB via Cli client**
>
> Note: If your terminal does not support multi-line pasting (e.g., Windows CMD), please adjust the SQL statements to single-line format before execution.

## 1. Database Management

```SQL
-- Create database database1, and set the database TTL time to 1 year;
CREATE DATABASE IF NOT EXISTS database1;

-- Use database database1;
USE database1;

-- Modify the database TTL time to 1 week;
ALTER DATABASE database1 SET PROPERTIES TTL=604800000;

-- Delete database database1;
DROP DATABASE IF EXISTS database1;
```

For detailed syntax description, please refer to: [Database Management](../Basic-Concept/Database-Management_timecho.md)

## 2. Table Management

```SQL
-- Create table table1;
CREATE TABLE table1 (
  time TIMESTAMP TIME,
  device_id STRING TAG,
  maintenance STRING ATTRIBUTE COMMENT 'maintenance',
  temperature FLOAT FIELD COMMENT 'temperature',
  status Boolean FIELD COMMENT 'status'
);

-- View column information of table table1;
DESC table1 DETAILS;

-- Modify table;
-- Add column to table table1;
ALTER TABLE table1 ADD COLUMN IF NOT EXISTS humidity FLOAT FIELD COMMENT 'humidity';
-- Set table table1 TTL to 1 week;
ALTER TABLE table1 set properties TTL=604800000;

-- Delete table table1;
DROP TABLE table1;
```

For detailed syntax description, please refer to: [Table Management](../Basic-Concept/Table-Management_timecho.md)

## 3. Data Writing

```SQL
-- Single row writing;
INSERT INTO table1(device_id, time, temperature) VALUES ('100', '2025-11-26 13:37:00', 90.0);

-- Multi-row writing;
INSERT INTO table1(device_id, maintenance, time, temperature) VALUES 
  ('101', '180', '2024-11-26 13:37:00', 88.0),
  ('100', '180', '2024-11-26 13:38:00', 85.0),
  ('101', '180', '2024-11-27 16:38:00', 80.0);
```

For detailed syntax description, please refer to: [Data Writing](../Basic-Concept/Write-Updata-Data_timecho.md#_1-data-insertion)

## 4. Data Query

```SQL
-- Full table query;
SELECT * FROM table1;

-- Function query;
SELECT count(*), sum(temperature) FROM table1;

-- Query data for specified device and time period;
SELECT * 
FROM table1 
WHERE time >= 2024-11-26 00:00:00  and time <= 2024-11-27 00:00:00 and device_id='101';
```

For detailed syntax description, please refer to: [Data Query](../Basic-Concept/Query-Data_timecho.md)

## 5. Data Update

```SQL
-- Update the maintenance attribute value for data where device_id is 100;
UPDATE table1 SET maintenance='45' WHERE device_id='100';
```

For detailed syntax description, please refer to: [Data Update](../Basic-Concept/Write-Updata-Data_timecho.md#_2-data-updates)

## 6. Data Deletion

```SQL
-- Delete data for specified device and time period;
DELETE FROM table1 WHERE time >= 2024-11-26 23:39:00  and time <= 2024-11-27 20:42:00 AND device_id='101';

-- Full table deletion;
DELETE FROM table1;
```

For detailed syntax description, please refer to: [Data Deletion](../Basic-Concept/Delete-Data.md)