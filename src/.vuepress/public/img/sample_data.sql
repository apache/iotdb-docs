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
  
