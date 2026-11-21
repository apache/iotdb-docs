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

| **Short Param**  | **Full Param**            | **Description**                                                          | Required                            | Default                                       |
|------------------|---------------------------|--------------------------------------------------------------------------| ------------------------------------- |-----------------------------------------------|
| `-h`             | `--host`                 | Database server IPv4 address, unbracketed IPv6 address, or hostname; omit brackets for IPv6. IPv6 is supported from V2.0.12. | No                                  | 127.0.0.1                                     |
| `-p`             | `--port`                  | Port number                                                              | No                                  | 6667                                          |
| `-u`             | `--username`              | Username                                                                 | No                                  | root                                          |
| `-pw`            | `--password`              | Password. Supported for hidden input since V2.0.10                   | No                                  | root                                          |
| `-sql_dialect`   | `--sql_dialect`           | Specifies whether the server uses`tree `model or`table `model            | No                                 | tree                                          |
| `-db`            | `--database`              | Target database to export (only applies when`-sql_dialect=table`)        | Required if`-sql_dialect=table` | -                                             |
| `-table`         | `--table`                 | Target table to export (only applies when`-sql_dialect=table`)           | No                                 | -                                             |
| `-t`             | `--target`                | Output directory (created if it doesn't exist)                           | Yes                                 |                                               |
| `-path`          | `--path_pattern`          | Path pattern for metadata export                                         | Required if`-sql_dialect=tree`  |                                               |
| `-pfn`           | `--prefix_file_name`      | Output filename prefix                                                   | No                                  | `dump_dbname.sql`                             |
| `-lpf`           | `--lines_per_file`        | Maximum lines per dump file (only applies when`-sql_dialect=tree`)       | No                                 | `10000`                                       |
| `-timeout`       | `--query_timeout`         | Query timeout in milliseconds (`-1`= no timeout)                         | No                                  | -1Range：`-1 to Long. max=9223372036854775807` |
| `-help`          | `--help`                  | Display help information                                                 | No                                  |                                               |
| `-usessl`        | `--use_ssl`               | Use SSL protocol. Supported since V2.0.10                            | No      | -                                    |
| `-ts`            | `--trust_store`           | Trust store. Supports hidden input. Supported since V2.0.10          | No      | -                                    |
| `-tpw`           | `--trust_store_password`  | Trust store password. Supports hidden input. Supported since V2.0.10 | No        | -                                    |

`-h` and `-p` take host and port separately, so use an unbracketed IPv6 host, for example `-h DN_IPV6_ADDRESS -p 6667`. `DN_IPV6_ADDRESS` is a destination DataNode address placeholder; replace it with the actual reachable unbracketed IPv6 address before running the command. Do not pass brackets to `-h`. For SSL, retain the existing `-usessl`, `-ts`, and `-tpw` parameters; verify that the certificate SAN contains the actual IPv6 address accessed by the client.

### 2.2 Command

```Bash
Shell
# Unix/OS X
> tools/export-schema.sh [-sql_dialect<sql_dialect>] -db<database> -table<table>  
                [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
                -t <target_directory> [-path <exportPathPattern>] [-pfn <prefix_file_name>] 
                [-lpf <lines_per_file>] [-timeout <query_timeout>]
# Windows
# Before version V2.0.4.x  
> tools\export-schema.bat [-sql_dialect<sql_dialect>] -db<database> -table<table>  
                [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
                -t <target_directory> [-path <exportPathPattern>] [-pfn <prefix_file_name>] 
                [-lpf <lines_per_file>] [-timeout <query_timeout>]
                
# V2.0.4.x and later versions
> tools\windows\schema\export-schema.bat [-sql_dialect<sql_dialect>] -db<database> -table<table>  
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

Starting with V2.0.12, `-h` accepts an actual unbracketed IPv6 address and `-p` still takes the port separately. Parameters such as `-sql_dialect`, `-db`, `-s`, `-t`, and `-path` do not need to change for IPv6.