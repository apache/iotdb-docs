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

# Schema Export

## 1. Overview

The schema export tool `export-schema.sh/bat` is located in the `tools` directory. It can export schema from a specified database in IoTDB to a script file.

## 2. Detailed Functionality

### 2.1 Parameter

| **Short Param** | **Full Param**     | **Description**                                                  | Required                            | Default                                                |
| ----------------------- | -------------------------- | ------------------------------------------------------------------------ | ------------------------------------- | -------------------------------------------------------- |
| `-h`              | `-- host`            | Hostname                                                               | No                                  | 127.0.0.1                                              |
| `-p`              | `--port`             | Port number                                                            | No                                  | 6667                                                   |
| `-u`              | `--username`         | Username                                                               | No                                  | root                                                   |
| `-pw`             | `--password`         | Password                                                               | No                                  | root                                                   |
| `-sql_dialect`   | `--sql_dialect`      | Specifies whether the server uses`tree `model or`table `model  | No                                 | tree                                                   |
| `-db`             | `--database`         | Target database to export (only applies when`-sql_dialect=table`)  | Required if`-sql_dialect=table` | -                                                      |
| `-table`          | `--table`           | Target table to export (only applies when`-sql_dialect=table`)     | No                                 | -                                                      |
| `-t`              | `--target`           | Output directory (created if it doesn't exist)                         | Yes                                 |                                                       |
| `-path`           | `--path_pattern`     | Path pattern for metadata export                                       | Required if`-sql_dialect=tree`  |                                                       |
| `-pfn`            | `--prefix_file_name` | Output filename prefix                                                 | No                                  | `dump_dbname.sql`                                  |
| `-lpf`            | `--lines_per_file`  | Maximum lines per dump file (only applies when`-sql_dialect=tree`) | No                                 | `10000`                                            |
| `-timeout`        | `--query_timeout`    | Query timeout in milliseconds (`-1`= no timeout)                   | No                                  | -1Range：`-1 to Long. max=9223372036854775807` |
| `-help`           | `--help`             | Display help information                                               | No                                  |                                                       |

### 2.2 Command

```Bash
Shell
# Unix/OS X
> tools/export-schema.sh [-sql_dialect<sql_dialect>] -db<database> -table<table>  
                [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
                -t <target_directory> [-path <exportPathPattern>] [-pfn <prefix_file_name>] 
                [-lpf <lines_per_file>] [-timeout <query_timeout>]
# Windows
> tools\export-schema.bat [-sql_dialect<sql_dialect>] -db<database> -table<table>  
                [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
                -t <target_directory> [-path <exportPathPattern>] [-pfn <prefix_file_name>] 
                [-lpf <lines_per_file>] [-timeout <query_timeout>]
```

### 2.3 Examples


```Bash
# Export schema under root.treedb
./export-schema.sh -sql_dialect tree -t /home/ -path "root.treedb.**"

# Output
Timeseries,Alias,DataType,Encoding,Compression
root.treedb.device.temperature,,DOUBLE,GORILLA,LZ4
root.treedb.device.humidity,,DOUBLE,GORILLA,LZ4
```