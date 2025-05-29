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

# 元数据导入

## 1. 功能概述

元数据导入工具 `import-schema.sh/bat` 位于tools 目录下，能够将指定路径下创建元数据的脚本文件导入到 IoTDB 中。

## 2. 功能详解

### 2.1 参数介绍

| 参数缩写            | 参数全称                      | 参数含义                                                                    | 是否为必填项 | 默认值                                |
| --------------------- | ------------------------------- | ----------------------------------------------------------------------------- | -------------- | --------------------------------------- |
| `-h`            | `-- host`                 | 主机名                                                                      | 否           | 127.0.0.1                             |
| `-p`            | `--port`                  | 端口号                                                                      | 否           | 6667                                  |
| `-u`            | `--username`              | 用户名                                                                      | 否           | root                                  |
| `-pw`           | `--password`              | 密码                                                                        | 否           | root                                  |
| `-sql_dialect` | `--sql_dialect`           | 选择 server 是树模型还是表模型，当前支持 tree 和 table 类型                 | 否           | tree                                  |
| `-db`           | `--database`              | 将要导入的目标数据库                                                        | `是`     | -                                     |
| `-table`        | `--table`                 | 将要导入的目标表，只在`-sql_dialect`为 table 类型下生效。               | 否          | -                                     |
| `-s`            | `--source`                | 待加载的脚本文件(夹)的本地目录路径。                                        | 是           |                                      |
| `-fd`           | `--fail_dir`              | 指定保存失败文件的目录                                                      | 否           |                                      |
| `-lpf`          | `--lines_per_failed_file` | 指定失败文件最大写入数据的行数，只在`-sql_dialect`为 table 类型下生效。 | 否          | 100000范围：0～Integer.Max=2147483647 |
| `-help`         | `--help`                  | 显示帮助信息                                                                | 否           |                                      |

### 2.2 运行命令

```Bash
# Unix/OS X
tools/import-schema.sh [-sql_dialect<sql_dialect>] -db<database> -table<table> 
     [-h <host>] [-p <port>] [-u <username>] [-pw <password>]
       -s <source> [-fd <fail_dir>] [-lpf <lines_per_failed_file>]
      
# Windows
# V2.0.4.x 版本之前
tools\import-schema.bat [-sql_dialect<sql_dialect>] -db<database> -table<table>  
        [-h <host>] [-p <port>] [-u <username>] [-pw <password>]
       -s <source> [-fd <fail_dir>] [-lpf <lines_per_failed_file>] 
       
# V2.0.4.x 版本及之后 
tools\windows\schema\import-schema.bat [-sql_dialect<sql_dialect>] -db<database> -table<table>  
        [-h <host>] [-p <port>] [-u <username>] [-pw <password>]
       -s <source> [-fd <fail_dir>] [-lpf <lines_per_failed_file>] 
```

### 2.3 运行示例

```Bash
# 导入前
IoTDB> show timeseries root.treedb.**
+----------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+
|Timeseries|Alias|Database|DataType|Encoding|Compression|Tags|Attributes|Deadband|DeadbandParameters|ViewType|
+----------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+
+----------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+

# 执行导入命令
./import-schema.sh -sql_dialect tree -s /home/dump0_0.csv -db root.treedb

# 导入成功后验证
IoTDB> show timeseries root.treedb.**
+------------------------------+-----+-----------+--------+--------+-----------+----+----------+--------+------------------+--------+
|                    Timeseries|Alias|   Database|DataType|Encoding|Compression|Tags|Attributes|Deadband|DeadbandParameters|ViewType|
+------------------------------+-----+-----------+--------+--------+-----------+----+----------+--------+------------------+--------+
|root.treedb.device.temperature| null|root.treedb|  DOUBLE| GORILLA|        LZ4|null|      null|    null|              null|    BASE|
|   root.treedb.device.humidity| null|root.treedb|  DOUBLE| GORILLA|        LZ4|null|      null|    null|              null|    BASE|
+------------------------------+-----+-----------+--------+--------+-----------+----+----------+--------+------------------+--------+
```
