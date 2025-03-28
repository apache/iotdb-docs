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

# ConfigNode 配置参数

IoTDB ConfigNode 配置文件均位于 IoTDB 安装目录：`conf`文件夹下。

* `confignode-env.sh/bat`：环境配置项的配置文件，可以配置 ConfigNode 的内存大小。

* `iotdb-system.properties`：IoTDB 的配置文件。

## 1. 环境配置项（confignode-env.sh/bat）

环境配置项主要用于对 ConfigNode 运行的 Java 环境相关参数进行配置，如 JVM 相关配置。ConfigNode 启动时，此部分配置会被传给 JVM，详细配置项说明如下：

* MEMORY\_SIZE

|名字|MEMORY\_SIZE|
|:---:|:---|
|描述|IoTDB ConfigNode 启动时分配的内存大小 |
|类型|String|
|默认值|取决于操作系统和机器配置。默认为机器内存的十分之三，最多会被设置为 16G。|
|改后生效方式|重启服务生效|

* ON\_HEAP\_MEMORY

|名字|ON\_HEAP\_MEMORY|
|:---:|:---|
|描述|IoTDB ConfigNode 能使用的堆内内存大小, 曾用名: MAX\_HEAP\_SIZE |
|类型|String|
|默认值|取决于MEMORY\_SIZE的配置。|
|改后生效方式|重启服务生效|

* OFF\_HEAP\_MEMORY

|名字|OFF\_HEAP\_MEMORY|
|:---:|:---|
|描述|IoTDB ConfigNode 能使用的堆外内存大小, 曾用名: MAX\_DIRECT\_MEMORY\_SIZE |
|类型|String|
|默认值|取决于MEMORY\_SIZE的配置。|
|改后生效方式|重启服务生效|

## 2. 系统配置项（iotdb-system.properties）

IoTDB 集群的全局配置通过 ConfigNode 配置。

### 2.1 Config Node RPC 配置

* cn\_internal\_address

|   名字   | cn\_internal\_address |
|:------:|:----------------------|
|   描述   | ConfigNode 集群内部地址     |
|   类型   | String                |
|  默认值   | 127.0.0.1             |
| 改后生效方式 | 仅允许在第一次启动服务前修改                |

* cn\_internal\_port

|   名字   | cn\_internal\_port    |
|:------:|:----------------------|
|   描述   | ConfigNode 集群服务监听端口   |
|   类型   | Short Int : [0,65535] |
|  默认值   | 10710                  |
| 改后生效方式 | 仅允许在第一次启动服务前修改                |

### 2.2 共识协议

* cn\_consensus\_port

|   名字   | cn\_consensus\_port   |
|:------:|:----------------------|
|   描述   | ConfigNode 的共识协议通信端口  |
|   类型   | Short Int : [0,65535] |
|  默认值   | 10720                 |
| 改后生效方式 | 仅允许在第一次启动服务前修改                |

### 2.3 SeedConfigNode 配置

* cn\_seed\_config\_node

|   名字   | cn\_seed\_config\_node        |
|:------:|:--------------------------------------|
|   描述   | 目标 ConfigNode 地址，ConfigNode 通过此地址加入集群，推荐使用 SeedConfigNode。V1.2.2 及以前曾用名是 cn\_target\_config\_node\_list |
|   类型   | String                                |
|  默认值   | 127.0.0.1:10710                       |
| 改后生效方式 | 仅允许在第一次启动服务前修改                                |

### 2.4 数据目录

* cn\_system\_dir

|名字| cn\_system\_dir                                          |
|:---:|:---------------------------------------------------------|
|描述| ConfigNode 系统数据存储路径                                      |
|类型| String                                                   |
|默认值| data/confignode/system（Windows：data\\configndoe\\system） |
|改后生效方式| 重启服务生效                                                   |

* cn\_consensus\_dir

|名字| cn\_consensus\_dir                                 |
|:---:|:---------------------------------------------------|
|描述| ConfigNode 共识协议数据存储路径                              |
|类型| String                                             |
|默认值| data/confignode/consensus（Windows：data\\configndoe\\consensus） |
|改后生效方式| 重启服务生效                                             |

### 2.5 Thrift RPC 配置

* cn\_rpc\_thrift\_compression\_enable

|   名字   | cn\_rpc\_thrift\_compression\_enable |
|:------:|:-------------------------------------|
|   描述   | 是否启用 thrift 的压缩机制。                   |
|   类型   | Boolean                              |
|  默认值   | false                                |
| 改后生效方式 | 重启服务生效                               |

* cn\_rpc\_advanced\_compression\_enable

|   名字   | cn\_rpc\_advanced\_compression\_enable |
|:------:|:---------------------------------------|
|   描述   | 是否启用 thrift 的自定制压缩机制。                  |
|   类型   | Boolean                                |
|  默认值   | false                                  |
| 改后生效方式 | 重启服务生效                                 |

* cn\_rpc\_max\_concurrent\_client\_num

|   名字   | cn\_rpc\_max\_concurrent\_client\_num |
|:------:|:--------------------------------------|
|   描述   | 最大连接数。                                |
|   类型   | Short Int : [0,65535]                 |
|  默认值   | 65535                                 |
| 改后生效方式 | 重启服务生效                                |

* cn\_thrift\_max\_frame\_size

|   名字   | cn\_thrift\_max\_frame\_size                 |
|:------:|:---------------------------------------------|
|   描述   | RPC 请求/响应的最大字节数                              |
|   类型   | long                                         |
|  默认值   | 536870912 （默认值512MB，应大于等于 512 * 1024 * 1024) |
| 改后生效方式 | 重启服务生效                                       |

* cn\_thrift\_init\_buffer\_size

|   名字   | cn\_thrift\_init\_buffer\_size |
|:------:|:-------------------------------|
|   描述   | 字节数                            |
|   类型   | Long                           |
|  默认值   | 1024                           |
| 改后生效方式 | 重启服务生效                         |

* cn\_connection\_timeout\_ms

|   名字   | cn\_connection\_timeout\_ms |
|:------:|:----------------------------|
|   描述   | 节点连接超时时间                    |
|   类型   | int                         |
|  默认值   | 60000                       |
| 改后生效方式 | 重启服务生效                      |

* cn\_selector\_thread\_nums\_of\_client\_manager

|   名字   | cn\_selector\_thread\_nums\_of\_client\_manager |
|:------:|:------------------------------------------------|
|   描述   | 客户端异步线程管理的选择器线程数量                               |
|   类型   | int                                             |
|  默认值   | 1                                               |
| 改后生效方式 | 重启服务生效                                          |

* cn\_core\_client\_count\_for\_each\_node\_in\_client\_manager

|   名字   | cn\_core\_client\_count\_for\_each\_node\_in\_client\_manager |
|:------:|:--------------------------------------------------------------|
|   描述   | 单 ClientManager 中路由到每个节点的核心 Client 个数                         |
|   类型   | int                                                           |
|  默认值   | 200                                                           |
| 改后生效方式 | 重启服务生效                                                        |

* cn\_max\_client\_count\_for\_each\_node\_in\_client\_manager

|   名字   | cn\_max\_client\_count\_for\_each\_node\_in\_client\_manager |
|:------:|:-------------------------------------------------------------|
|   描述   | 单 ClientManager 中路由到每个节点的最大 Client 个数                        |
|   类型   | int                                                          |
|  默认值   | 300                                                          |
| 改后生效方式 | 重启服务生效                                                       |

### 2.6 Metric 监控配置