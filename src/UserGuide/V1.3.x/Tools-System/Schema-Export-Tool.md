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
# Metadata Export

## 1. Overview

The metadata export tool `export-schema.sh/bat` is located in the `tools` directory. It can export metadata from a specified database in IoTDB into CSV files.

> Supported since version 1.3.3

## 2. Detailed Functionality

### 2.1 Parameter Description

| Short Parameter | Full Parameter | Description | Required | Default Value |
|-----------------|----------------|-------------|----------|---------------|
| `-h` | `--host` | Hostname | No | 127.0.0.1 |
| `-p` | `--port` | Port number | No | 6667 |
| `-u` | `--username` | Username | No | root |
| `-pw` | `--password` | Password. Hidden input is supported since V2.0.9-beta | No | root |
| `-t` | `--target` | Specifies the target directory for output files. The directory will be created if it does not exist | Yes | - |
| `-path` | `--path_pattern` | Specifies the path pattern for metadata export | Yes | - |
| `-pf` | `--path_pattern_file` | Specifies the name of the export file | No | - |
| `-lpf` | `--lines_per_file` | Specifies the maximum number of lines per exported dump file | No | `10000` |
| `-timeout` | `--queryTimeout` | Query timeout for the session (ms) | No | -1. Range: -1 ~ Long.MAX_VALUE = 9223372036854775807 |
| `-help` | `--help` | Displays help information | No | - |

### 2.2 Execution Commands

```Bash
# Unix/OS X
> tools/export-schema.sh [-h <host>] [-p <port>] [-u <username>] [-pw <password>] -t <targetDir>
       [-path <exportPathPattern>] [-pf <exportPathPatternFile>] [-lpf <linesPerFile>]
       [-timeout <timeout>] [-help]

# Windows
> tools\export-schema.bat [-h <host>] [-p <port>] [-u <username>] [-pw <password>] -t <targetDir>
       [-path <exportPathPattern>] [-pf <exportPathPatternFile>] [-lpf <linesPerFile>]
       [-timeout <timeout>] [-help]
```

### 2.3 Usage Example

```Bash
# Export metadata under the root.ln path
./export-schema.sh -t /home/ -path "root.ln.**"
```

```CSV
# Export result format
Timeseries,Alias,DataType,Encoding,Compression
root.ln.wf02.wt02.status,,BOOLEAN,RLE,LZ4
root.ln.wf02.wt02.hardware,,TEXT,PLAIN,LZ4
``` 