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
# CLI

The IoTDB Command Line Interface (CLI) tool allows users to interact with the IoTDB server. Before using the CLI tool to connect to IoTDB, ensure that the IoTDB service is running correctly. This document explains how to launch the CLI and its related parameters.

In this manual, `$IOTDB_HOME` represents the installation directory of IoTDB.

## 1. CLI Launch

The CLI client script is located in the `$IOTDB_HOME/sbin` directory. The common commands to start the CLI tool are as follows:

#### **Linux** **MacOS**

```Bash
Shell> bash sbin/start-cli.sh -sql_dialect table
#or
Shell> bash sbin/start-cli.sh -h 127.0.0.1 -p 6667 -u root -pw root -sql_dialect table
```

#### **Windows**

```Bash
# Before version V2.0.4.x  
Shell> sbin\start-cli.bat -sql_dialect table
#or
Shell> sbin\start-cli.bat -h 127.0.0.1 -p 6667 -u root -pw root -sql_dialect table

# V2.0.4.x and later versions
Shell> sbin\windows\start-cli.bat -sql_dialect table
#or
Shell> sbin\windows\start-cli.bat -h 127.0.0.1 -p 6667 -u root -pw root -sql_dialect table
```

**Parameter Explanation**

| **Parameter**              | **Type** | **Required** | **Description**                                              | **Example**         |
| -------------------------- | -------- | ------------ | ------------------------------------------------------------ | ------------------- |
| -h `<host>`                  | string   | No           | The IP address of the IoTDB server. (Default: 127.0.0.1)     | -h 127.0.0.1        |
| -p `<rpcPort>`               | int      | No           | The RPC port of the IoTDB server. (Default: 6667)            | -p 6667             |
| -u `<username>`              | string   | No           | The username to connect to the IoTDB server. (Default: root) | -u root             |
| -pw `<password>`             | string   | No           | The password to connect to the IoTDB server. (Default: root) | -pw root            |
| -sql_dialect `<sql_dialect>` | string   | No           | The data model type: tree or table. (Default: tree)          | -sql_dialect table  |
| -e `<execute>`               | string   | No           | Batch operations in non-interactive mode.                    | -e "show databases" |
| -c                         | Flag     | No           | Required if rpc_thrift_compression_enable=true on the server. | -c                  |
| -disableISO8601            | Flag     | No           | If set, timestamps will be displayed as numeric values instead of ISO8601 format. | -disableISO8601     |
| -usessl `<use_ssl>`          | Boolean | No           | Enable SSL connection                            | -usessl true         |
| -ts `<trust_store>`          | string  | No           | SSL certificate store path             | -ts /path/to/truststore  |
| -tpw `<trust_store_pwd>`      | string  | No           | SSL certificate store password                   | -tpw myTrustPassword |
| -timeout `<queryTimeout>`    | int    | No           | Query timeout (seconds). If not set, the server's configuration will be used.           | -timeout 30          |
| -help                      | Flag     | No           | Displays help information for the CLI tool.                  | -help               |

The figure below indicates a successful startup:

![](/img/Cli-01.png)


## 2. Example Commands

### 2.1 **Create a Database**

```Java
create database test
```

![](/img/Cli-02.png)


### 2.2 **Show Databases**
```Java
show databases
```

![](/img/Cli-03.png)


## 3. CLI Exit

To exit the CLI and terminate the session, type`quit`or`exit`.

### 3.1 Additional Notes and Shortcuts

1. **Navigate Command History:** Use the up and down arrow keys.
2. **Auto-Complete Commands:** Use the right arrow key.
3. **Interrupt Command Execution:** Press `CTRL+C`.
