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

# Command Line Interface (CLI)


IoTDB provides Cli/shell tools for users to interact with IoTDB server in command lines. This document shows how Cli/shell tool works and the meaning of its parameters.

> Note: In this document, \$IOTDB\_HOME represents the path of the IoTDB installation directory.

## 1. Installation

If you use the source code version of IoTDB, then under the root path of IoTDB, execute:

```shell
> mvn clean package -pl iotdb-client/cli -am -DskipTests -P get-jar-with-dependencies
```

After build, the IoTDB Cli will be in the folder "cli/target/iotdb-cli-{project.version}".

If you download the binary version, then the Cli can be used directly in sbin folder.

## 2. Running 

### 2.1 Running Cli

After installation, there is a default user in IoTDB: `root`, and the
default password is `TimechoDB@2021`(Before V2.0.6 it is `root`). Users can use this username to try IoTDB Cli/Shell tool. The cli startup script is the `start-cli` file under the \$IOTDB\_HOME/bin folder. When starting the script, you need to specify the IP and PORT. (Make sure the IoTDB cluster is running properly when you use Cli/Shell tool to connect to it.)

Here is an example where the cluster is started locally and the user has not changed the running port. The default rpc port is
6667 <br>
If you need to connect to the remote DataNode or changes
the rpc port number of the DataNode running, set the specific IP and RPC PORT at -h and -p.<br>
You also can set your own environment variable at the front of the start script 

The Linux and MacOS system startup commands are as follows:

```shell
# Before version V2.0.6
Shell > bash sbin/start-cli.sh -h 127.0.0.1 -p 6667 -u root -pw root

# V2.0.6 and later versions
Shell > bash sbin/start-cli.sh -h 127.0.0.1 -p 6667 -u root -pw TimechoDB@2021
```

The Windows system startup commands are as follows:

```shell
# Before version V2.0.4
Shell > sbin\start-cli.bat -h 127.0.0.1 -p 6667 -u root -pw root

# V2.0.4 and later versions, before version V2.0.6
Shell > sbin\windows\start-cli.bat -h 127.0.0.1 -p 6667 -u root -pw root

# V2.0.6 and later versions
Shell > sbin\windows\start-cli.bat -h 127.0.0.1 -p 6667 -u root -pw TimechoDB@2021
```

After operating these commands, the cli can be started successfully. The successful status will be as follows:

```
 _____       _________  ______   ______
|_   _|     |  _   _  ||_   _ `.|_   _ \
  | |   .--.|_/ | | \_|  | | `. \ | |_) |
  | | / .'`\ \  | |      | |  | | |  __'.
 _| |_| \__. | _| |_    _| |_.' /_| |__) |
|_____|'.__.' |_____|  |______.'|_______/  version <version>


Successfully login at 127.0.0.1:6667
IoTDB>
```

Enter ```quit``` or `exit` can exit Cli.

### 2.2 Cli Parameters

| Parameter name               | Parameter type             | Required | Description                                                  | Example             |
| :--------------------------- | :------------------------- | :------- | :----------------------------------------------------------- | :------------------ |
| -disableISO8601              | No parameters              | No       | If this parameter is set, IoTDB will print the timestamp in digital form | -disableISO8601     |
| -h <`host`>                  | string, no quotation marks | Yes      | The IP address of the IoTDB server                           | -h 10.129.187.21    |
| -help                        | No parameters              | No       | Print help information for IoTDB                             | -help               |
| -p <`rpcPort`>               | int                        | Yes      | The rpc port number of the IoTDB server. IoTDB runs on rpc port 6667 by default | -p 6667             |
| -pw <`password`>             | string, no quotation marks | No       | The password used for IoTDB to connect to the server. If no password is entered, IoTDB will ask for password in Cli command | -pw root            |
| -u <`username`>              | string, no quotation marks | Yes      | User name used for IoTDB to connect the server               | -u root             |
| -maxPRC <`maxPrintRowCount`> | int                        | No       | Set the maximum number of rows that IoTDB returns            | -maxPRC 10          |
| -e <`execute`>               | string                     | No       | manipulate IoTDB in batches without entering cli input mode  | -e "show databases" |
| -c                           | empty                      | No       | If the server enables `rpc_thrift_compression_enable=true`, then cli must use `-c` | -c                  |

Following is a cli command which connects the host with IP
10.129.187.21, rpc port 6667, username "root", password "root", and prints the timestamp in digital form. The maximum number of lines displayed on the IoTDB command line is 10.

The Linux and MacOS system startup commands are as follows:

```shell
Shell > bash sbin/start-cli.sh -h 10.129.187.21 -p 6667 -u root -pw root -disableISO8601 -maxPRC 10
```

The Windows system startup commands are as follows:

```shell
# Before version V2.0.4.x
Shell > sbin\start-cli.bat -h 10.129.187.21 -p 6667 -u root -pw root -disableISO8601 -maxPRC 10

# # V2.0.4.x and later versions
Shell > sbin\windows\start-cli.bat -h 10.129.187.21 -p 6667 -u root -pw root -disableISO8601 -maxPRC 10
```

### 2.3 CLI Special Command

Special commands of Cli are below.

| Command                     | Description / Example                                   |
| :-------------------------- | :------------------------------------------------------ |
| `set time_display_type=xxx` | eg. long, default, ISO8601, yyyy-MM-dd HH:mm:ss         |
| `show time_display_type`    | show time display type                                  |
| `set time_zone=xxx`         | eg. +08:00, Asia/Shanghai                               |
| `show time_zone`            | show cli time zone                                      |
| `set fetch_size=xxx`        | set fetch size when querying data from server           |
| `show fetch_size`           | show fetch size                                         |
| `set max_display_num=xxx`   | set max lines for cli to output, -1 equals to unlimited |
| `help`                      | Get hints for CLI special commands                      |
| `exit/quit`                 | Exit CLI                                                |


### 2.4 Batch Operation of Cli

-e parameter is designed for the Cli/shell tool in the situation where you would like to manipulate IoTDB in batches through scripts. By using the -e parameter, you can operate IoTDB without entering the cli's input mode.

In order to avoid confusion between statements and other parameters, the current version only supports the -e parameter as the last parameter.

The usage of -e parameter for Cli/shell is as follows:

The Linux and MacOS system commands:

```shell
Shell > bash sbin/start-cli.sh -h {host} -p {rpcPort} -u {user} -pw {password} -e {sql for iotdb}
```

The Windows system commands:

```shell
# Before version V2.0.4.x 
Shell > sbin\start-cli.bat -h {host} -p {rpcPort} -u {user} -pw {password} -e {sql for iotdb}

# V2.0.4.x and later versions
Shell > sbin\windows\start-cli.bat -h {host} -p {rpcPort} -u {user} -pw {password} -e {sql for iotdb}
```

In the Windows environment, the SQL statement of the -e parameter needs to use ` `` ` to replace `" "`

In order to better explain the use of -e parameter, take following as an example(On linux system).

Suppose you want to create a database root.demo to a newly launched IoTDB, create a timeseries root.demo.s1 and insert three data points into it. With -e parameter, you could write a shell like this:

```shell
# !/bin/bash

host=127.0.0.1
rpcPort=6667
user=root
pass=root

bash ./sbin/start-cli.sh -h ${host} -p ${rpcPort} -u ${user} -pw ${pass} -e "create database root.demo"
bash ./sbin/start-cli.sh -h ${host} -p ${rpcPort} -u ${user} -pw ${pass} -e "create timeseries root.demo.s1 WITH DATATYPE=INT32, ENCODING=RLE"
bash ./sbin/start-cli.sh -h ${host} -p ${rpcPort} -u ${user} -pw ${pass} -e "insert into root.demo(timestamp,s1) values(1,10)"
bash ./sbin/start-cli.sh -h ${host} -p ${rpcPort} -u ${user} -pw ${pass} -e "insert into root.demo(timestamp,s1) values(2,11)"
bash ./sbin/start-cli.sh -h ${host} -p ${rpcPort} -u ${user} -pw ${pass} -e "insert into root.demo(timestamp,s1) values(3,12)"
bash ./sbin/start-cli.sh -h ${host} -p ${rpcPort} -u ${user} -pw ${pass} -e "select s1 from root.demo"
```

The results are shown in the figure, which are consistent with the Cli and jdbc operations.

```shell
 Shell > bash ./shell.sh 
+-----------------------------+------------+
|                         Time|root.demo.s1|
+-----------------------------+------------+
|1970-01-01T08:00:00.001+08:00|          10|
|1970-01-01T08:00:00.002+08:00|          11|
|1970-01-01T08:00:00.003+08:00|          12|
+-----------------------------+------------+
Total line number = 3
It costs 0.267s
```

It should be noted that the use of the -e parameter in shell scripts requires attention to the escaping of special characters. 
