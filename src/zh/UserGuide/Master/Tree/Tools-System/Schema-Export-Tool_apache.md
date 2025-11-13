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

# 元数据导出

## 1. 功能概述

元数据导出工具 `export-schema.sh/bat` 位于tools 目录下，能够将 IoTDB 中指定数据库下的元数据导出为脚本文件。

## 2. 功能详解

### 2.1 参数介绍

| 参数缩写            | 参数全称                 | 参数含义                                                               | 是否为必填项                      | 默认值                                   |
| --------------------- | -------------------------- | ------------------------------------------------------------------------ | ----------------------------------- |---------------------------------------|
| `-h`            | `-- host`            | 主机名                                                                 | 否                                | 127.0.0.1                             |
| `-p`            | `--port`             | 端口号                                                                 | 否                                | 6667                                  |
| `-u`            | `--username`         | 用户名                                                                 | 否                                | root                                  |
| `-pw`           | `--password`         | 密码                                                                   | 否                                | root                                  |
| `-sql_dialect` | `--sql_dialect`      | 选择 server 是树模型还是表模型，当前支持 tree 和 table 类型            | 否                                | tree                                  |
| `-db`           | `--database`         | 将要导出的目标数据库，只在`-sql_dialect`为 table 类型下生效。      | `-sql_dialect`为 table 时必填 | -                                     |
| `-table`        | `--table`            | 将要导出的目标表，只在`-sql_dialect`为 table 类型下生效。          | 否                               | -                                     |
| `-t`            | `--target`           | 指定输出文件的目标文件夹，如果路径不存在新建文件夹                     | 是                                |                                       |
| `-path`         | `--path_pattern`     | 指定导出元数据的path  pattern                                          | `-sql_dialect`为 tree 时必填  |                                       |
| `-pfn`          | `--prefix_file_name` | 指定导出文件的名称。                                                   | 否                                | dump\_dbname.sql                      |
| `-lpf`          | `--lines_per_file`  | 指定导出的dump文件最大行数，只在`-sql_dialect`为 tree 类型下生效。 | 否                                | `10000`                               |
| `-timeout`      | `--query_timeout`    | 会话查询的超时时间(ms)                                                 | 否                                | -1范围：-1～Long. max=9223372036854775807 |
| `-help`         | `--help`             | 显示帮助信息                                                           | 否                                |                                       |

### 2.2 运行命令

```Bash
Shell
# Unix/OS X
> tools/export-schema.sh [-sql_dialect<sql_dialect>] -db<database> -table<table>  
                [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
                -t <target_directory> [-path <exportPathPattern>] [-pfn <prefix_file_name>] 
                [-lpf <lines_per_file>] [-timeout <query_timeout>]
# Windows
# V2.0.4.x 版本之前
> tools\export-schema.bat [-sql_dialect<sql_dialect>] -db<database> -table<table>  
                [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
                -t <target_directory> [-path <exportPathPattern>] [-pfn <prefix_file_name>] 
                [-lpf <lines_per_file>] [-timeout <query_timeout>]
               
# V2.0.4.x 版本及之后               
> tools\windows\schema\export-schema.bat [-sql_dialect<sql_dialect>] -db<database> -table<table>  
                [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
                -t <target_directory> [-path <exportPathPattern>] [-pfn <prefix_file_name>] 
                [-lpf <lines_per_file>] [-timeout <query_timeout>]
```

### 2.3 运行示例

```Bash
# 导出 root.treedb路径下的元数据
./export-schema.sh -sql_dialect tree -t /home/ -path "root.treedb.**"

# 导出结果内容格式如下
Timeseries,Alias,DataType,Encoding,Compression
root.treedb.device.temperature,,DOUBLE,GORILLA,LZ4
root.treedb.device.humidity,,DOUBLE,GORILLA,LZ4
```
