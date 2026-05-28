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

元数据导入工具 `import-schema.sh/bat` 位于tools 目录下，能够将指定路径下创建元数据的csv文件导入到 IoTDB 中。

> V1.3.3 版本起支持

## 2. 功能详解

### 2.1 参数介绍

| 参数缩写       | 参数全称                      | 参数含义                            | 是否为必填项 | 默认值                               |
|------------|---------------------------|---------------------------------| -------------- |-----------------------------------|
| `-h`       | `-- host`                 | 主机名                             | 否           | 127.0.0.1                         |
| `-p`       | `--port`                  | 端口号                             | 否           | 6667                              |
| `-u`       | `--username`              | 用户名                             | 否           | root                              |
| `-pw`      | `--password`              | 密码                              | 否           | root                              |
| `-s`       | `--source`                | 待加载的脚本文件(夹)的本地目录路径。             | 是           |                                   |
| `-fd`      | `--fail_dir`              | 指定保存失败文件的目录                     | 否           |                                   |
| `-lpf`     | `--lines_per_failed_file` | 指定失败文件最大写入数据的行数                 | 否          | 100000范围：0～Integer.Max=2147483647 |
| `-help`    | `--help`                  | 显示帮助信息                          | 否           |                                   |

### 2.2 运行命令

```Bash
# Unix/OS X
tools/import-schema.sh [-h <host>] [-p <port>] [-u <username>] [-pw <password>] -s
       <sourceDir/sourceFile> [-fd <failDir>] [-batch <batchSize>] [-lpf <linesPerFile>] [-help]
      
# Windows
tools\import-schema.bat [-h <host>] [-p <port>] [-u <username>] [-pw <password>] -s
       <sourceDir/sourceFile> [-fd <failDir>] [-batch <batchSize>] [-lpf <linesPerFile>] [-help] 
```

### 2.3 运行示例

```Bash
# 导入前
IoTDB> show timeseries root.ln.**
+----------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+
|Timeseries|Alias|Database|DataType|Encoding|Compression|Tags|Attributes|Deadband|DeadbandParameters|ViewType|
+----------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+
+----------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+

# 执行导入命令
./import-schema.sh -s /home/dump0_0.csv

# 导入成功后验证
IoTDB> show timeseries root.ln.**
+--------------------------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+
|                Timeseries|Alias|Database|DataType|Encoding|Compression|Tags|Attributes|Deadband|DeadbandParameters|ViewType|
+--------------------------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+
|  root.ln.wf02.wt02.status| null| root.ln| BOOLEAN|     RLE|        LZ4|null|      null|    null|              null|    BASE|
|root.ln.wf02.wt02.hardware| null| root.ln|    TEXT|   PLAIN|        LZ4|null|      null|    null|              null|    BASE|
+--------------------------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+
```
