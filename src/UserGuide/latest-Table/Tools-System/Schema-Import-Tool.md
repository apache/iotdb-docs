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

# Schema Import

## 1. Overview

The schema import tool `import-schema.sh/bat` is located in `tools` directory.

## 2. Detailed Functionality

### 2.1 Parameter

| **Short Param** | **Full Param**          | **Description**                                                     | Required | Default                                        |
| ----------------------- | ------------------------------- | --------------------------------------------------------------------------- | ---------- | ------------------------------------------------ |
| `-h`              | `-- host`                 | Hostname                                                                  | No       | 127.0.0.1                                      |
| `-p`              | `--port`                  | Port number                                                               | No       | 6667                                           |
| `-u`              | `--username`              | Username                                                                  | No       | root                                           |
| `-pw`             | `--password`              | Password                                                                  | No       | root                                           |
| `-sql_dialect`   | `--sql_dialect`           | Specifies whether the server uses`tree `model or`table `model     | No      | tree                                           |
| `-db`             | `--database`              | Target database for import                                                | Yes      | -                                              |
| `-table`          | `--table`                 | Target table for import (only applies when`-sql_dialect=table`)       | No      | -                                              |
| `-s`              | `--source`                | Local directory path containing script file(s) to import                  | Yes      |                                               |
| `-fd`             | `--fail_dir`              | Directory to save failed import files                                     | No       |                                               |
| `-lpf`            | `--lines_per_failed_file` | Maximum lines per failed file (only applies when`-sql_dialect=table`) | No      | 100000Range：`0 to Integer.Max=2147483647` |
| `-help`           | `--help`                  | Display help information                                                  | No       |                                               |

### 2.2 Command

```Bash
# Unix/OS X
tools/import-schema.sh [-sql_dialect<sql_dialect>] -db<database> -table<table> 
     [-h <host>] [-p <port>] [-u <username>] [-pw <password>]
       -s <source> [-fd <fail_dir>] [-lpf <lines_per_failed_file>]
      
# Windows
tools\import-schema.bat [-sql_dialect<sql_dialect>] -db<database> -table<table>  
      [-h <host>] [-p <port>] [-u <username>] [-pw <password>]
       -s <source> [-fd <fail_dir>] [-lpf <lines_per_failed_file>] 
```

### 2.3 Examples

Import `dump_database1.sql` from `/home` into `database2`,

```sql
-- File content (dump_database1.sql):
DROP TABLE IF EXISTS table1;
CREATE TABLE table1(
        time TIMESTAMP TIME,
        region STRING TAG,
        plant_id STRING TAG,
        device_id STRING TAG,
        model_id STRING ATTRIBUTE,
        maintenance STRING ATTRIBUTE,
        temperature FLOAT FIELD,
        humidity FLOAT FIELD,
        status BOOLEAN FIELD,
        arrival_time TIMESTAMP FIELD
);
DROP TABLE IF EXISTS table2;
CREATE TABLE table2(
        time TIMESTAMP TIME,
        region STRING TAG,
        plant_id STRING TAG,
        device_id STRING TAG,
        model_id STRING ATTRIBUTE,
        maintenance STRING ATTRIBUTE,
        temperature FLOAT FIELD,
        humidity FLOAT FIELD,
        status BOOLEAN FIELD,
        arrival_time TIMESTAMP FIELD
);
```

Executing the command:

```Bash
./import-schema.sh -sql_dialect table -s /home/dump_database1.sql -db database2 

# If database2 doesn't exist
The target database database2 does not exist

# If database2 exists
Import completely!
```

Verification:

```Bash
# Before import
IoTDB:database2> show tables
+---------+-------+
|TableName|TTL(ms)|
+---------+-------+
+---------+-------+
Empty set.

# After import
IoTDB:database2> show tables details
+---------+-------+------+-------+
|TableName|TTL(ms)|Status|Comment|
+---------+-------+------+-------+
|   table2|    INF| USING|   null|
|   table1|    INF| USING|   null|
+---------+-------+------+-------+

IoTDB:database2> desc table1
+------------+---------+---------+
|  ColumnName| DataType| Category|
+------------+---------+---------+
|        time|TIMESTAMP|     TIME|
|      region|   STRING|      TAG|
|    plant_id|   STRING|      TAG|
|   device_id|   STRING|      TAG|
|    model_id|   STRING|ATTRIBUTE|
| maintenance|   STRING|ATTRIBUTE|
| temperature|    FLOAT|    FIELD|
|    humidity|    FLOAT|    FIELD|
|      status|  BOOLEAN|    FIELD|
|arrival_time|TIMESTAMP|    FIELD|
+------------+---------+---------+
 
IoTDB:database2> desc table2
+------------+---------+---------+
|  ColumnName| DataType| Category|
+------------+---------+---------+
|        time|TIMESTAMP|     TIME|
|      region|   STRING|      TAG|
|    plant_id|   STRING|      TAG|
|   device_id|   STRING|      TAG|
|    model_id|   STRING|ATTRIBUTE|
| maintenance|   STRING|ATTRIBUTE|
| temperature|    FLOAT|    FIELD|
|    humidity|    FLOAT|    FIELD|
|      status|  BOOLEAN|    FIELD|
|arrival_time|TIMESTAMP|    FIELD|
+------------+---------+---------+
```
