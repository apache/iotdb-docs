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
-- Create database;
CREATE DATABASE root.ln;

-- View database;
SHOW DATABASES root.**;

-- Delete database;
DELETE DATABASE root.ln;

-- Count database;
COUNT DATABASES root.**;
```

For detailed syntax description, please refer to: [Database Management](../Basic-Concept/Operate-Metadata_timecho.md#_1-database-management)

## 2. Time Series Management

```SQL
-- Create time series;
CREATE TIMESERIES root.ln.wf01.wt01.status BOOLEAN;
CREATE TIMESERIES root.ln.wf01.wt01.temperature FLOAT;

-- Create aligned time series;
CREATE ALIGNED TIMESERIES root.ln.wf01.GPS(latitude FLOAT, longitude FLOAT);

-- Delete time series;
DELETE TIMESERIES root.ln.wf01.wt01.status;

-- View time series;
SHOW TIMESERIES root.ln.**;

-- Count time series;
COUNT TIMESERIES root.ln.**;
```

For detailed syntax description, please refer to: [Time Series Management](../Basic-Concept/Operate-Metadata_timecho.md#_2-timeseries-management)

## 3. Data Writing

```SQL
-- Single column writing;
INSERT INTO root.ln.wf01.wt01(timestamp, temperature) VALUES(1, 23.0),(2, 42.6);

-- Multi-column writing;
INSERT INTO root.ln.wf01.wt01(timestamp, status, temperature) VALUES (3, false, 33.1),(4, true, 24.6);
```

For detailed syntax description, please refer to: [Data Writing](../Basic-Concept/Write-Data_timecho.md)

## 4. Data Query

```SQL
-- Time filter query;
SELECT * from root.ln.** where time > 1;

-- Value filter query;
SELECT temperature FROM root.ln.wf01.wt01 where temperature > 36.5;

-- Function query;
SELECT count(temperature) FROM root.ln.wf01.wt01;

-- Latest point query;
SELECT LAST status FROM root.ln.wf01.wt01;
```

For detailed syntax description, please refer to: [Data Query](../Basic-Concept/Query-Data_timecho.md)

## 5. Data Deletion

```SQL
-- Single column deletion;
DELETE FROM root.ln.wf01.wt01.status WHERE time >= 20;

-- Multi-column deletion;
DELETE FROM root.ln.wf01.wt01.* where time <= 10;
```

For detailed syntax description, please refer to: [Data Deletion](../Basic-Concept/Delete-Data.md)