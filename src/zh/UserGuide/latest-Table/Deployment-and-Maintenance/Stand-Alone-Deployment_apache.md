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
# 单机版部署指导

本章将介绍如何启动IoTDB单机实例，IoTDB单机实例包括 1 个ConfigNode 和1个DataNode（即通常所说的1C1D）。

## 1. 注意事项

1. 安装前请确认系统已参照[系统配置](../Deployment-and-Maintenance/Environment-Requirements.md)准备完成。
2. 推荐使用`hostname`进行IP配置，可避免后期修改主机ip导致数据库无法启动的问题。设置hostname需要在服务器上配置`/etc/hosts`，如本机ip是192.168.1.3，hostname是iotdb-1，则可以使用以下命令设置服务器的 hostname，并使用hostname配置IoTDB的 `cn_internal_address`、`dn_internal_address`。

    ```shell
    echo "192.168.1.3  iotdb-1" >> /etc/hosts 
    ```

3. 部分参数首次启动后不能修改，请参考下方的[参数配置](#2参数配置)章节进行设置。
4. 无论是在linux还是windows中，请确保IoTDB的安装路径中不含空格和中文，避免软件运行异常。
5. 请注意，安装部署（包括激活和使用软件）IoTDB时，您可以：
   - 使用 root 用户（推荐）：可以避免权限等问题。
   - 使用固定的非 root 用户：
      - 使用同一用户操作：确保在启动、激活、停止等操作均保持使用同一用户，不要切换用户。
      - 避免使用 sudo：使用 sudo 命令会以 root 用户权限执行命令，可能会引起权限混淆或安全问题。
6. 推荐部署监控面板，可以对重要运行指标进行监控，随时掌握数据库运行状态，监控面板可以联系工作人员获取，部署监控面板步骤可以参考：[监控面板部署](../Deployment-and-Maintenance/Monitoring-panel-deployment.md)

## 2. 安装步骤

### 2.1 解压安装包并进入安装目录

```Plain
unzip  apache-iotdb-{version}-all-bin.zip
cd  apache-iotdb-{version}-all-bin
```

### 2.2 参数配置

#### 2.2.1 内存配置

- conf/confignode-env.sh（或 .bat）

| **配置项**  | **说明**                               | **默认值** | **推荐值**                                       | 备注         |
| :---------- | :------------------------------------- | :--------- | :----------------------------------------------- | :----------- |
| MEMORY_SIZE | IoTDB ConfigNode节点可以使用的内存总量 | 空         | 可按需填写，填写后系统会根据填写的数值来分配内存 | 重启服务生效 |

- conf/datanode-env.sh（或 .bat）

| **配置项**  | **说明**                             | **默认值** | **推荐值**                                       | 备注         |
| :---------- | :----------------------------------- | :--------- | :----------------------------------------------- | :----------- |
| MEMORY_SIZE | IoTDB DataNode节点可以使用的内存总量 | 空         | 可按需填写，填写后系统会根据填写的数值来分配内存 | 重启服务生效 |

#### 2.2.2 功能配置

系统实际生效的参数在文件 conf/iotdb-system.properties 中，启动需设置以下参数，可以从 conf/iotdb-system.properties.template 文件中查看全部参数

集群级功能配置

| **配置项**                | **说明**                         | **默认值**     | **推荐值**                                       | 备注                      |
| :------------------------ | :------------------------------- | :------------- | :----------------------------------------------- | :------------------------ |
| cluster_name              | 集群名称                         | defaultCluster | 可根据需要设置集群名称，如无特殊需要保持默认即可 | 首次启动后不可修改        |
| schema_replication_factor | 元数据副本数，单机版此处设置为 1 | 1              | 1                                                | 默认1，首次启动后不可修改 |
| data_replication_factor   | 数据副本数，单机版此处设置为 1   | 1              | 1                                                | 默认1，首次启动后不可修改 |

ConfigNode 配置

| **配置项**          | **说明**                                                     | **默认**        | 推荐值                                           | **备注**           |
| :------------------ | :----------------------------------------------------------- | :-------------- | :----------------------------------------------- | :----------------- |
| cn_internal_address | ConfigNode在集群内部通讯使用的地址                           | 127.0.0.1       | 所在服务器的IPV4地址或hostname，推荐使用hostname | 首次启动后不能修改 |
| cn_internal_port    | ConfigNode在集群内部通讯使用的端口                           | 10710           | 10710                                            | 首次启动后不能修改 |
| cn_consensus_port   | ConfigNode副本组共识协议通信使用的端口                       | 10720           | 10720                                            | 首次启动后不能修改 |
| cn_seed_config_node | 节点注册加入集群时连接的ConfigNode 的地址，cn_internal_address:cn_internal_port | 127.0.0.1:10710 | cn_internal_address:cn_internal_port             | 首次启动后不能修改 |

DataNode 配置

| **配置项**                      | **说明**                                                     | **默认**        | 推荐值                                           | **备注**           |
| :------------------------------ | :----------------------------------------------------------- | :-------------- | :----------------------------------------------- | :----------------- |
| dn_rpc_address                  | 客户端 RPC 服务的地址                                        | 0.0.0.0         | 0.0.0.0                                          | 重启服务生效       |
| dn_rpc_port                     | 客户端 RPC 服务的端口                                        | 6667            | 6667                                             | 重启服务生效       |
| dn_internal_address             | DataNode在集群内部通讯使用的地址                             | 127.0.0.1       | 所在服务器的IPV4地址或hostname，推荐使用hostname | 首次启动后不能修改 |
| dn_internal_port                | DataNode在集群内部通信使用的端口                             | 10730           | 10730                                            | 首次启动后不能修改 |
| dn_mpp_data_exchange_port       | DataNode用于接收数据流使用的端口                             | 10740           | 10740                                            | 首次启动后不能修改 |
| dn_data_region_consensus_port   | DataNode用于数据副本共识协议通信使用的端口                   | 10750           | 10750                                            | 首次启动后不能修改 |
| dn_schema_region_consensus_port | DataNode用于元数据副本共识协议通信使用的端口                 | 10760           | 10760                                            | 首次启动后不能修改 |
| dn_seed_config_node             | 节点注册加入集群时连接的ConfigNode地址,即cn_internal_address:cn_internal_port | 127.0.0.1:10710 | cn_internal_address:cn_internal_port             | 首次启动后不能修改 |

### 2.3 启动 ConfigNode 节点

进入iotdb的sbin目录下，启动confignode

```shell
./sbin/start-confignode.sh -d      #“-d”参数将在后台进行启动 
```

如果启动失败，请参考下方[常见问题](#常见问题)。

### 2.4 启动 DataNode 节点

 进入iotdb的sbin目录下，启动datanode：

```shell
./sbin/start-datanode.sh -d    #“-d”参数将在后台进行启动
```
### 3.5 启动 CLI

表模型 CLI 进入命令：

```SQL
# Linux或MACOS系统
./start-cli.sh -sql_dialect table

# windows系统
./start-cli.bat -sql_dialect table
```

## 3. 常见问题

1. Confignode节点启动失败
   - 步骤 1: 请查看启动日志，检查是否修改了某些首次启动后不可改的参数。
   - 步骤 2: 请查看启动日志，检查是否出现其他异常。日志中若存在异常现象，请联系天谋技术支持人员咨询解决方案。
   -  步骤 3: 如果是首次部署或者数据可删除，也可按下述步骤清理环境，重新部署后，再次启动。
        - 清理环境：
         1. 结束所有 ConfigNode 和 DataNode 进程。
        ```Bash
             # 1. 停止 ConfigNode 和 DataNode 服务
             sbin/stop-standalone.sh
            
             # 2. 检查是否还有进程残留
             jps
             # 或者
             ps -ef|grep iotdb
            
             # 3. 如果有进程残留，则手动kill
             kill -9 <pid>
             # 如果确定机器上仅有1个iotdb，可以使用下面命令清理残留进程
             ps -ef|grep iotdb|grep -v grep|tr -s '  ' ' ' |cut -d ' ' -f2|xargs kill -9
        ```

         2. 删除 data 和 logs 目录。
            - 说明：删除 data 目录是必要的，删除 logs 目录是为了纯净日志，非必需。
        ```shell
            cd /data/iotdb rm -rf data logs
        ```

## 4. 附录

### 4.1 Confignode节点参数介绍

| 参数 | 描述                             | 是否为必填项 |
| :--- | :------------------------------- | :----------- |
| -d   | 以守护进程模式启动，即在后台运行 | 否           |

### 4.2 Datanode节点参数介绍

| 缩写 | 描述                                           | 是否为必填项 |
| :--- | :--------------------------------------------- | :----------- |
| -v   | 显示版本信息                                   | 否           |
| -f   | 在前台运行脚本，不将其放到后台                 | 否           |
| -d   | 以守护进程模式启动，即在后台运行               | 否           |
| -p   | 指定一个文件来存放进程ID，用于进程管理         | 否           |
| -c   | 指定配置文件夹的路径，脚本会从这里加载配置文件 | 否           |
| -g   | 打印垃圾回收（GC）的详细信息                   | 否           |
| -H   | 指定Java堆转储文件的路径，当JVM内存溢出时使用  | 否           |
| -E   | 指定JVM错误日志文件的路径                      | 否           |
| -D   | 定义系统属性，格式为 key=value                 | 否           |
| -X   | 直接传递 -XX 参数给 JVM                        | 否           |
| -h   | 帮助指令                                       | 否           |

