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

| **Short Param** | **Full Param**          | **Description**                                                     | Required | Default                                   |
| ----------------------- | ------------------------------- | --------------------------------------------------------------------------- | ---------- |-------------------------------------------|
| `-h`              | `-- host`                 | Hostname                                                                  | No       | 127.0.0.1                                 |
| `-p`              | `--port`                  | Port number                                                               | No       | 6667                                      |
| `-u`              | `--username`              | Username                                                                  | No       | root                                      |
| `-pw`             | `--password`              | Password                                                                  | No       | TimechoDB@2021(Before V2.0.6 it is root)  |
| `-sql_dialect`   | `--sql_dialect`           | Specifies whether the server uses`tree `model or`table `model     | No      | tree                                      |
| `-db`             | `--database`              | Target database for import                                                | Yes      | -                                         |
| `-table`          | `--table`                 | Target table for import (only applies when`-sql_dialect=table`)       | No      | -                                         |
| `-s`              | `--source`                | Local directory path containing script file(s) to import                  | Yes      |                                           |
| `-fd`             | `--fail_dir`              | Directory to save failed import files                                     | No       |                                           |
| `-lpf`            | `--lines_per_failed_file` | Maximum lines per failed file (only applies when`-sql_dialect=table`) | No      | 100000Range：`0 to Integer.Max=2147483647` |
| `-help`           | `--help`                  | Display help information                                                  | No       |                                           |

### 2.2 Command

```Bash
# Unix/OS X
tools/import-schema.sh [-sql_dialect<sql_dialect>] -db<database> -table<table> 
     [-h <host>] [-p <port>] [-u <username>] [-pw <password>]
       -s <source> [-fd <fail_dir>] [-lpf <lines_per_failed_file>]
      
# Windows
# Before version V2.0.4.x  
tools\import-schema.bat [-sql_dialect<sql_dialect>] -db<database> -table<table>  
      [-h <host>] [-p <port>] [-u <username>] [-pw <password>]
       -s <source> [-fd <fail_dir>] [-lpf <lines_per_failed_file>] 
       
# V2.0.4.x and later versions       
tools\windows\schema\import-schema.bat [-sql_dialect<sql_dialect>] -db<database> -table<table>  
      [-h <host>] [-p <port>] [-u <username>] [-pw <password>]
       -s <source> [-fd <fail_dir>] [-lpf <lines_per_failed_file>] 
```

### 2.3 Examples

```Bash
# Before import
IoTDB> show timeseries root.treedb.**
+----------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+
|Timeseries|Alias|Database|DataType|Encoding|Compression|Tags|Attributes|Deadband|DeadbandParameters|ViewType|
+----------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+
+----------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+

# Execution
./import-schema.sh -sql_dialect tree -s /home/dump0_0.csv -db root.treedb

# Verification
IoTDB> show timeseries root.treedb.**
+------------------------------+-----+-----------+--------+--------+-----------+----+----------+--------+------------------+--------+
|                    Timeseries|Alias|   Database|DataType|Encoding|Compression|Tags|Attributes|Deadband|DeadbandParameters|ViewType|
+------------------------------+-----+-----------+--------+--------+-----------+----+----------+--------+------------------+--------+
|root.treedb.device.temperature| null|root.treedb|  DOUBLE| GORILLA|        LZ4|null|      null|    null|              null|    BASE|
|   root.treedb.device.humidity| null|root.treedb|  DOUBLE| GORILLA|        LZ4|null|      null|    null|              null|    BASE|
+------------------------------+-----+-----------+--------+--------+-----------+----+----------+--------+------------------+--------+
```
