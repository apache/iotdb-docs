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

# Metadata Import

## 1. Overview

The metadata import tool `import-schema.sh/bat` is located in the `tools` directory. It can import CSV files containing metadata creation statements from a specified path into IoTDB.

> Supported since version 1.3.3

## 2. Detailed Functionality

### 2.1 Parameter Description

| Short Parameter | Full Parameter | Description | Required | Default Value |
|-----------------|----------------|-------------|----------|---------------|
| `-h` | `--host` | Hostname | No | 127.0.0.1 |
| `-p` | `--port` | Port number | No | 6667 |
| `-u` | `--username` | Username | No | root |
| `-pw` | `--password` | Password | No | root |
| `-s` | `--source` | Local path of the script file or directory to be loaded | Yes | - |
| `-fd` | `--fail_dir` | Specifies the directory to save failed files | No | - |
| `-lpf` | `--lines_per_failed_file` | Specifies the maximum number of lines per failed file | No | 100000. Range: 0 ~ Integer.MAX_VALUE = 2147483647 |
| `-help` | `--help` | Displays help information | No | - |

### 2.2 Execution Commands

```Bash
# Unix/OS X
tools/import-schema.sh [-h <host>] [-p <port>] [-u <username>] [-pw <password>] -s
       <sourceDir/sourceFile> [-fd <failDir>] [-batch <batchSize>] [-lpf <linesPerFile>] [-help]
      
# Windows
tools\import-schema.bat [-h <host>] [-p <port>] [-u <username>] [-pw <password>] -s
       <sourceDir/sourceFile> [-fd <failDir>] [-batch <batchSize>] [-lpf <linesPerFile>] [-help] 
```

### 2.3 Usage Example

```SQL
-- Before import
IoTDB> show timeseries root.ln.**
+----------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+
|Timeseries|Alias|Database|DataType|Encoding|Compression|Tags|Attributes|Deadband|DeadbandParameters|ViewType|
+----------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+
+----------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+
```

```Bash
# Execute the import command
./import-schema.sh -s /home/dump0_0.csv
```

```SQL
-- Verify after successful import
IoTDB> show timeseries root.ln.**
+--------------------------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+
|                Timeseries|Alias|Database|DataType|Encoding|Compression|Tags|Attributes|Deadband|DeadbandParameters|ViewType|
+--------------------------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+
|  root.ln.wf02.wt02.status| null| root.ln| BOOLEAN|     RLE|        LZ4|null|      null|    null|              null|    BASE|
|root.ln.wf02.wt02.hardware| null| root.ln|    TEXT|   PLAIN|        LZ4|null|      null|    null|              null|    BASE|
+--------------------------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+
```
