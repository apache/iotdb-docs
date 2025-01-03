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

# CLI Tool

The IoTDB Command Line Interface (CLI) tool allows users to interact with the IoTDB server. Before using the CLI tool to connect to IoTDB, ensure that the IoTDB service is running correctly. This document explains how to launch the CLI and its related parameters.

> In this manual, `$IOTDB_HOME` represents the installation directory of IoTDB.

## 1 CLI Launch

The CLI client script is located in the `$IOTDB_HOME/sbin` directory. The common commands to start the CLI tool are as follows:

- Linux/MacOS:

```Shell
Shell> bash sbin/start-cli.sh -sql_dialect table
#or
Shell> bash sbin/start-cli.sh -h 127.0.0.1 -p 6667 -u root -pw root -sql_dialect table
```

- Windows:

```Shell
Shell> sbin\start-cli.bat -sql_dialect table
#or
Shell> sbin\start-cli.bat -h 127.0.0.1 -p 6667 -u root -pw root -sql_dialect table
```

Among them:

-The -h and -p items are the IP and RPC port numbers where IoTDB is located (default IP and RPC port numbers are 127.0.0.1 and 6667 if not modified locally)
- -u and -pw are the username and password for logging into IoTDB (after installation, IoTDB has a default user, and both username and password are 'root')
- -sql-dialect is the logged in data model (table model or tree model), where table is specified to represent entering table model mode

**Parameter Explanation**

| **Parameter**              | **Type** | **Required** | **Description**                                              | **Example**         |
| -------------------------- | -------- | ------------ | ------------------------------------------------------------ | ------------------- |
| -h /<host>                  | string   | No           | The IP address of the IoTDB server. (Default: 127.0.0.1)     | -h 127.0.0.1        |
| -p /<rpcPort>               | int      | No           | The RPC port of the IoTDB server. (Default: 6667)            | -p 6667             |
| -u /<username>              | string   | No           | The username to connect to the IoTDB server. (Default: root) | -u root             |
| -pw /<password>             | string   | No           | The password to connect to the IoTDB server. (Default: root) | -pw root            |
| -sql_dialect /<sql_dialect> | string   | No           | The data model type: tree or table. (Default: tree)          | -sql_dialect table  |
| -e /<execute>               | string   | No           | Batch operations in non-interactive mode.                    | -e "show databases" |
| -c                         | Flag     | No           | Required if rpc_thrift_compression_enable=true on the server. | -c                  |
| -disableISO8601            | Flag     | No           | If set, timestamps will be displayed as numeric values instead of ISO8601 format. | -disableISO8601     |
| -help                      | Flag     | No           | Displays help information for the CLI tool.                  | -help               |

The figure below indicates a successful startup:

![](https://alioss.timecho.com/docs/img/Cli-01.png)


## 2 Execute statements in CLI

After entering the CLI, users can directly interact by entering SQL statements in the conversation. For example:

- Create Database

```Java
create database test
```

![](https://alioss.timecho.com/docs/img/Cli-02.png)


- Show Databases

```Java
show databases
```

![](https://alioss.timecho.com/docs/img/Cli-03.png)


## 3 CLI Exit

To exit the CLI and terminate the session, type`quit`or`exit`.

## 4 Additional Notes

CLI Command Usage Tips：

1. **Navigate Command History:** Use the up and down arrow keys.
2. **Auto-Complete Commands:** Use the right arrow key.
3. **Interrupt Command Execution:** Press `CTRL+C`.
