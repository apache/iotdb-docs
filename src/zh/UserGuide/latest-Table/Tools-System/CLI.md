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

# CLI 命令行工具

IoTDB 为用户提供 CLI 工具用于和服务端程序进行交互操作。在使用 CLI 工具连接 IoTDB 前，请保证 IoTDB 服务已经正常启动。下面介绍 CLI 工具的运行方式和相关参数。

> 本文中 $IoTDB_HOME 表示 IoTDB 的安装目录所在路径。

## 1 CLI 启动

CLI 客户端脚本是 $IoTDB_HOME/sbin 文件夹下的`start-cli`脚本。启动命令为：

- Linux/MacOS 系统常用启动命令为：

```Shell
Shell> bash sbin/start-cli.sh -sql_dialect table
或
Shell> bash sbin/start-cli.sh -h 127.0.0.1 -p 6667 -u root -pw root -sql_dialect table
```

- Windows 系统常用启动命令为：

```Shell
Shell> sbin\start-cli.bat -sql_dialect table
或
Shell> sbin\start-cli.bat -h 127.0.0.1 -p 6667 -u root -pw root -sql_dialect table
```

其中：

- -h 和-p 项是 IoTDB 所在的 IP 和 RPC 端口号（本机未修改 IP 和 RPC 端口号默认为 127.0.0.1、6667）
- -u 和-pw 是 IoTDB 登录的用户名密码（安装后IoTDB有一个默认用户，用户名密码均为`root`）
- -sql_dialect 是登录的数据模型（表模型或树模型），此处指定为 table 代表进入表模型模式

更多参数见：

| **参数名**                 | **参数类型** | **是否为必需参数** | **说明**                                                     | **示例**            |
| :------------------------- | :----------- | :----------------- | :----------------------------------------------------------- | :------------------ |
| -h `<host>`                  | string 类型  | 否                 | IoTDB 客户端连接 IoTDB 服务器的 IP 地址， 默认使用：127.0.0.1。 | -h  127.0.0.1       |
| -p `<rpcPort>`               | int 类型     | 否                 | IoTDB 客户端连接服务器的端口号，IoTDB 默认使用 6667。        | -p 6667             |
| -u `<username>`              | string 类型  | 否                 | IoTDB 客户端连接服务器所使用的用户名，默认使用 root。        | -u root             |
| -pw `<password>`             | string 类型  | 否                 | IoTDB 客户端连接服务器所使用的密码，默认使用 root。          | -pw root            |
| -sql_dialect `<sql_dialect>` | string 类型  | 否                 | 目前可选 tree（树模型） 、table（表模型），默认 tree         | -sql_dialect  table |
| -e `<execute>`               | string 类型  | 否                 | 在不进入客户端输入模式的情况下，批量操作 IoTDB。             | -e "show databases" |
| -c                         | 空           | 否                 | 如果服务器设置了 rpc_thrift_compression_enable=true， 则 CLI 必须使用 -c | -c                  |
| -disableISO8601            | 空           | 否                 | 如果设置了这个参数，IoTDB 将以数字的形式打印时间戳 （timestamp）。 | -disableISO8601     |
| -help                      | 空           | 否                 | 打印 IoTDB 的帮助信息。                                      | -help               |

启动后出现如图提示即为启动成功。

![](https://alioss.timecho.com/docs/img/Cli-01.png)


## 2 在 CLI 中执行语句

进入 CLI 后，用户可以直接在对话中输入 SQL 语句进行交互。如：

- 创建数据库

```Java
create database test
```

![](https://alioss.timecho.com/docs/img/Cli-02.png)


- 查看数据库

```Java
show databases
```

![](https://alioss.timecho.com/docs/img/Cli-03.png)


## 3 CLI 退出

在 CLI 中输入`quit`或`exit`可退出 CLI 结束本次会话。

## 4 其他说明

CLI中使用命令小技巧：

（1）快速切换历史命令: 上下箭头

（2）历史命令自动补全：右箭头

（3）中断执行命令: CTRL+C