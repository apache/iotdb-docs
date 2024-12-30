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

# 示例数据

本章节主要介绍一个简单的时序数据应用场景以及在此场景下的建模与示例数据，IoTDB 表模型用户手册中所有的示例 SQL 语句都可以在此建模和示例数据下执行。

## 数据结构

table1和table2均为如下表结构：

![](https://alioss.timecho.com/docs/img/Sample_data01.png)

## 导入语句

以下为构建上述表结构及数据的SQL语句，您可以点此（[sample_data.sql](https://alioss.timecho.com/upload/sample_data.sql)）下载全部SQL并在CLI中执行，从而将数据导入您的IoTDB。

```SQL
-- 创建表，表名可以贴近业务语义，这里我们以 t1 来代替
-- 时间列可以不手动指定，IoTDB 会自动创建
-- TTL 的单位是 ms，所以 1 年是 31536000000 ms
create database database1;
use database1;
CREATE TABLE table1 (
  time TIMESTAMP TIME,
  region STRING TAG,
  plant_id STRING TAG,
  device_id STRING TAG,
  model_id STRING ATTRIBUTE,
  maintenance STRING ATTRIBUTE,
  temperature FLOAT FIELD,
  humidity FLOAT FIELD,
  status Boolean FIELD,
  arrival_time TIMESTAMP FIELD
) WITH (TTL=31536000000);

CREATE TABLE table2 (
  time TIMESTAMP TIME,
  region STRING TAG,
  plant_id STRING TAG,
  device_id STRING TAG,
  model_id STRING ATTRIBUTE,
  maintenance STRING ATTRIBUTE,
  temperature FLOAT FIELD,
  humidity FLOAT FIELD,
  status Boolean FIELD,
  arrival_time TIMESTAMP FIELD
) WITH (TTL=31536000000);



INSERT INTO table1(region, plant_id, device_id, model_id, maintenance, time, temperature, humidity, status, arrival_time) VALUES 
  ('北京', '1001', '100', 'A', '180', '2024-11-26 13:37:00', 90.0, 35.1, true, '2024-11-26 13:37:34'),
  ('北京', '1001', '100', 'A', '180', '2024-11-26 13:38:00', 90.0, 35.1, true, '2024-11-26 13:38:25'),
  ('北京', '1001', '101', 'B', '180', '2024-11-27 16:38:00', NULL, 35.1,  true, '2024-11-27 16:37:01'),
  ('北京', '1001', '101', 'B', '180', '2024-11-27 16:39:00', 85.0, 35.3, NULL, Null),
  ('北京', '1001', '101', 'B', '180', '2024-11-27 16:40:00', 85.0, NULL, NULL, '2024-11-27 16:37:03'),
  ('北京', '1001', '101', 'B', '180', '2024-11-27 16:41:00', 85.0, NULL, NULL, '2024-11-27 16:37:04'),
  ('北京', '1001', '101', 'B', '180', '2024-11-27 16:42:00', NULL, 35.2, false, Null),
  ('北京', '1001', '101', 'B', '180', '2024-11-27 16:43:00', NULL, Null, false, Null),
  ('北京', '1001', '101', 'B', '180', '2024-11-27 16:44:00', NULL, Null, false, '2024-11-27 16:37:08'),
  ('上海', '3001', '100', 'C', '90', '2024-11-28 08:00:00', 85.0, Null, NULL, '2024-11-28 08:00:09'),
  ('上海', '3001', '100', 'C', '90', '2024-11-28 09:00:00', NULL, 40.9, true, NULL),
  ('上海', '3001', '100', 'C', '90', '2024-11-28 10:00:00', 85.0, 35.2, NULL, '2024-11-28 10:00:11'),
  ('上海', '3001', '100', 'C', '90', '2024-11-28 11:00:00', 88.0, 45.1, true, '2024-11-28 11:00:12'),
  ('上海', '3001', '101', 'D', '360', '2024-11-29 10:00:00', 85.0, NULL, NULL, '2024-11-29 10:00:13'),
  ('上海', '3002', '100', 'E', '180', '2024-11-29 11:00:00', NULL, 45.1, true, NULL),
  ('上海', '3002', '100', 'E', '180', '2024-11-29 18:30:00', 90.0, 35.4, true, '2024-11-29 18:30:15'),
  ('上海', '3002', '101', 'F', '360', '2024-11-30 09:30:00', 90.0, 35.2, true, NULL),
  ('上海', '3002', '101', 'F', '360', '2024-11-30 14:30:00', 90.0, 34.8, true, '2024-11-30 14:30:17');
  
 INSERT INTO table2(region, plant_id, device_id, model_id, maintenance, time, temperature, humidity, status, arrival_time) VALUES 
  ('北京', '1001', '100', 'A', '180', '2024-11-26 13:37:00', 90.0, 35.1, true, '2024-11-26 13:37:34'),
  ('北京', '1001', '101', 'B', '180', '2024-11-27 00:00:00', 85.0, 35.1,  true, '2024-11-27 16:37:01'),
  ('上海', '3001', '100', 'C', '90', '2024-11-28 08:00:00', 85.0, 35.2, false, '2024-11-28 08:00:09'),
  ('上海', '3001', '101', 'D', '360', '2024-11-29 00:00:00', 85.0, 35.1, NULL, '2024-11-29 10:00:13'),
  ('上海', '3002', '100', 'E', '180', '2024-11-29 11:00:00', NULL, 45.1, true, NULL),
  ('上海', '3002', '101', 'F', '360', '2024-11-30 00:00:00', 90.0, 35.2, true, NULL);
```