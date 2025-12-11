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
# 集群版部署指导

本小节描述如何手动部署包括3个ConfigNode和3个DataNode的实例，即通常所说的3C3D集群。

<div align="center">
    <img src="/img/cluster01.png" alt="" style="width: 60%;"/>
</div>

## 1. 注意事项

1. 安装前请确认系统已参照[系统配置](../Deployment-and-Maintenance/Environment-Requirements.md)准备完成。
   
2. 推荐使用`hostname`进行IP配置，可避免后期修改主机ip导致数据库无法启动的问题。设置hostname需要在服务器上配`/etc/hosts`，如本机ip是11.101.17.224，hostname是iotdb-1，则可以使用以下命令设置服务器的 hostname，并使用hostname配置IoTDB的`cn_internal_address`、`dn_internal_address`。

    ```shell
    echo "11.101.17.224  iotdb-1" >> /etc/hosts 
    ```

3. 有些参数首次启动后不能修改，请参考下方的[参数配置](#参数配置)章节来进行设置。

4. 无论是在linux还是windows中，请确保IoTDB的安装路径中不含空格和中文，避免软件运行异常。
   
5. 请注意，安装部署（包括激活和使用软件）IoTDB时，您可以：

- 使用 root 用户（推荐）：可以避免权限等问题。

- 使用固定的非 root 用户：

  - 使用同一用户操作：确保在启动、激活、停止等操作均保持使用同一用户，不要切换用户。

  - 避免使用 sudo：使用 sudo 命令会以 root 用户权限执行命令，可能会引起权限混淆或安全问题。

6. 在安装部署数据库前，可以使用健康检查工具检测 IoTDB 节点运行环境，并获取详细的检查结果。 IoTDB 健康检查工具使用方法可以参考：[健康检查工具](../Tools-System/Health-Check-Tool.md)。


## 2. 准备步骤

1. 准备IoTDB数据库安装包 ：apache-iotdb-{version}-all-bin.zip（安装包获取见：[链接](../Deployment-and-Maintenance/IoTDB-Package_apache.md)）
2. 按环境要求配置好操作系统环境（系统环境配置见：[链接](../Deployment-and-Maintenance/Environment-Requirements.md)）


### 2.1 前置检查

为确保您获取的 IoTDB 安装包完整且正确，在执行安装部署前建议您进行SHA512校验。

#### 准备工作：

- 获取官方发布的 SHA512 校验码：请到 IoTDB 开源官网[发行版本](https://iotdb.apache.org/zh/Download/)页面获取

#### 校验步骤（以 linux 为例）：

1. 打开终端，进入安装包所在目录（如`/data/iotdb`）：
   ```Bash
      cd /data/iotdb
      ```
2. 执行以下命令计算哈希值：
   ```Bash
      sha512sum apache-iotdb-{version}-all-bin.zip
      ```
3. 终端输出结果（左侧为SHA512 校验码，右侧为文件名）：

![img](/img/sha512-07.png)

4. 对比输出结果与官方 SHA512 校验码，确认一致后，即可按照下方流程执行 IoTDB 的安装部署操作。

#### 注意事项：

- 若校验结果不一致，请重新获取安装包
- 校验过程中若出现"文件不存在"提示，需检查文件路径是否正确或安装包是否完整下载

## 3. 安装步骤

假设现在有3台linux服务器，IP地址和服务角色分配如下：

| 节点ip        | 主机名  | 服务                 |
| ------------- | ------- | -------------------- |
| 11.101.17.224 | iotdb-1 | ConfigNode、DataNode |
| 11.101.17.225 | iotdb-2 | ConfigNode、DataNode |
| 11.101.17.226 | iotdb-3 | ConfigNode、DataNode |

### 3.1 设置主机名

在3台机器上分别配置主机名，设置主机名需要在目标服务器上配置/etc/hosts，使用如下命令：

```shell
echo "11.101.17.224  iotdb-1"  >> /etc/hosts
echo "11.101.17.225  iotdb-2"  >> /etc/hosts
echo "11.101.17.226  iotdb-3"  >> /etc/hosts 
```

### 3.2 参数配置

解压安装包并进入安装目录

```shell
unzip  apache-iotdb-{version}-all-bin.zip 
cd  apache-iotdb-{version}-all-bin
```

#### 3.2.1 环境脚本配置

- ./conf/confignode-env.sh配置

| **配置项**  | **说明**                               | **默认值** | **推荐值**                                       | 备注         |
| :---------- | :------------------------------------- | :--------- | :----------------------------------------------- | :----------- |
| MEMORY_SIZE | IoTDB ConfigNode节点可以使用的内存总量 | 空         | 可按需填写，填写后系统会根据填写的数值来分配内存 | 修改后保存即可，无需执行；重启服务后生效 |

- ./conf/datanode-env.sh配置

| **配置项**  | **说明**                             | **默认值** | **推荐值**                                       | 备注         |
| :---------- | :----------------------------------- | :--------- | :----------------------------------------------- | :----------- |
| MEMORY_SIZE | IoTDB DataNode节点可以使用的内存总量 | 空         | 可按需填写，填写后系统会根据填写的数值来分配内存 | 修改后保存即可，无需执行；重启服务后生效 |

#### 3.2.2 通用配置（./conf/iotdb-system.properties）

- 集群配置

| 配置项                    | 说明                                     | 11.101.17.224  | 11.101.17.225  | 11.101.17.226  |
| ------------------------- | ---------------------------------------- | -------------- | -------------- | -------------- |
| cluster_name              | 集群名称                                 | defaultCluster | defaultCluster | defaultCluster |
| schema_replication_factor | 元数据副本数，DataNode数量不应少于此数目 | 3              | 3              | 3              |
| data_replication_factor   | 数据副本数，DataNode数量不应少于此数目   | 2              | 2              | 2              |

#### 3.2.3 ConfigNode 配置

| 配置项              | 说明                                                         | 默认            | 推荐值                                                  | 11.101.17.224 | 11.101.17.225 | 11.101.17.226 | 备注               |
| ------------------- | ------------------------------------------------------------ | --------------- | ------------------------------------------------------- | ------------- | ------------- | ------------- | ------------------ |
| cn_internal_address | ConfigNode在集群内部通讯使用的地址                           | 127.0.0.1       | 所在服务器的IPV4地址或hostname，推荐使用hostname        | iotdb-1       | iotdb-2       | iotdb-3       | 首次启动后不能修改 |
| cn_internal_port    | ConfigNode在集群内部通讯使用的端口                           | 10710           | 10710                                                   | 10710         | 10710         | 10710         | 首次启动后不能修改 |
| cn_consensus_port   | ConfigNode副本组共识协议通信使用的端口                       | 10720           | 10720                                                   | 10720         | 10720         | 10720         | 首次启动后不能修改 |
| cn_seed_config_node | 节点注册加入集群时连接的ConfigNode 的地址，cn_internal_address:cn_internal_port | 127.0.0.1:10710 | 第一个CongfigNode的cn_internal_address:cn_internal_port | iotdb-1:10710 | iotdb-1:10710 | iotdb-1:10710 | 首次启动后不能修改 |

#### 3.2.4 DataNode 配置

| 配置项                          | 说明                                                         | 默认            | 推荐值                                                  | 11.101.17.224 | 11.101.17.225 | 11.101.17.226 | 备注               |
| ------------------------------- | ------------------------------------------------------------ | --------------- | ------------------------------------------------------- | ------------- | ------------- | ------------- | ------------------ |
| dn_rpc_address                  | 客户端 RPC 服务的地址                                        | 0.0.0.0         |  所在服务器的IPV4地址或hostname，推荐使用所在服务器的IPV4地址      |  iotdb-1       |iotdb-2       | iotdb-3         | 重启服务生效       |
| dn_rpc_port                     | 客户端 RPC 服务的端口                                        | 6667            | 6667                                                    | 6667          | 6667          | 6667          | 重启服务生效       |
| dn_internal_address             | DataNode在集群内部通讯使用的地址                             | 127.0.0.1       | 所在服务器的IPV4地址或hostname，推荐使用hostname        | iotdb-1       | iotdb-2       | iotdb-3       | 首次启动后不能修改 |
| dn_internal_port                | DataNode在集群内部通信使用的端口                             | 10730           | 10730                                                   | 10730         | 10730         | 10730         | 首次启动后不能修改 |
| dn_mpp_data_exchange_port       | DataNode用于接收数据流使用的端口                             | 10740           | 10740                                                   | 10740         | 10740         | 10740         | 首次启动后不能修改 |
| dn_data_region_consensus_port   | DataNode用于数据副本共识协议通信使用的端口                   | 10750           | 10750                                                   | 10750         | 10750         | 10750         | 首次启动后不能修改 |
| dn_schema_region_consensus_port | DataNode用于元数据副本共识协议通信使用的端口                 | 10760           | 10760                                                   | 10760         | 10760         | 10760         | 首次启动后不能修改 |
| dn_seed_config_node             | 节点注册加入集群时连接的ConfigNode地址,即cn_internal_address:cn_internal_port | 127.0.0.1:10710 | 第一个CongfigNode的cn_internal_address:cn_internal_port | iotdb-1:10710 | iotdb-1:10710 | iotdb-1:10710 | 首次启动后不能修改 |

> ❗️注意：VSCode Remote等编辑器无自动保存配置功能，请确保修改的文件被持久化保存，否则配置项无法生效

### 3.3 启动ConfigNode节点

先启动第一个iotdb-1的confignode, 保证种子confignode节点先启动，然后依次启动第2和第3个confignode节点

```shell
cd sbin
./start-confignode.sh -d      #“-d”参数将在后台进行启动 
```

如果启动失败，请参考下[常见问题](#常见问题)

### 3.4 启动DataNode 节点

 分别进入iotdb的sbin目录下，依次启动3个datanode节点：

```shell
cd sbin
./start-datanode.sh   -d   #-d参数将在后台进行启动 
```

### 3.5 启动 CLI

表模型 CLI 进入命令：

```SQL
# Linux或MACOS系统
./start-cli.sh -sql_dialect table

# windows系统
./start-cli.bat -sql_dialect table
```

### 3.6 一键启停集群

#### 3.6.1 概述

在 IoTDB 的根目录中，`sbin` 子目录包含的 `start-all.sh` 和 `stop-all.sh` 脚本，与 `conf` 子目录中的 `iotdb-cluster.properties` 配置文件协同工作，可通过单一节点实现一键启动或停止集群所有节点的功能。通过这种方式，可以高效地管理 IoTDB 集群的生命周期，简化了部署和运维流程。
下文将介绍`iotdb-cluster.properties` 文件中的具体配置项。

#### 3.6.2 配置项


> 注意：
> 
> * 当集群变更时，需要手动更新此配置文件。
> * 如果在未配置 `iotdb-cluster.properties` 配置文件的情况下执行 `start-all.sh` 或者 `stop-all.sh` 脚本，则默认会启停当前脚本所在 IOTDB\_HOME 目录下的 ConfigNode 与 DataNode 节点。
> * 推荐配置 ssh 免密登录：如果未配置，启动脚本后会提示输入服务器密码以便于后续启动/停止/销毁操作。如果已配置，则无需在执行脚本过程中输入服务器密码。

* confignode\_address\_list

| 名字         | confignode\_address\_list                                                    |
| :--------------: | :------------------------------------------------------------------------------ |
| 描述         | 待启动/停止的 ConfigNode 节点所在主机的 IP 列表，如果有多个需要用“,”分隔。 |
| 类型         | String                                                                       |
| 默认值       | 无                                                                           |
| 改后生效方式 | 重启服务生效                                                                 |

* datanode\_address\_list

| 名字 | datanode\_address\_list                                          |
| :----------------: | :---------------------------------------------------------------------------- |
| 描述           | 待启动/停止的 DataNode 节点所在主机的 IP 列表，如果有多个需要用“,”分隔。 |
| 类型           | String                                                                     |
| 默认值         | 无                                                                         |
| 改后生效方式   | 重启服务生效                                                               |

* ssh\_account

| 名字 | ssh\_account                                     |
| :----------------: | :------------------------------------------------------------- |
| 描述           | 通过 SSH 登陆目标主机的用户名，需要所有的主机的用户名都相同 |
| 类型           | String                                                      |
| 默认值         | root                                                        |
| 改后生效方式   | 重启服务生效                                                |

* ssh\_port

| 名字 | ssh\_port                                     |
| :----------------: | :--------------------------------------------------------- |
| 描述           | 目标主机对外暴露的 SSH 端口，需要所有的主机的端口都相同 |
| 类型           | int                                                     |
| 默认值         | 22                                                      |
| 改后生效方式   | 重启服务生效                                            |

* confignode\_deploy\_path

| 名字 | confignode\_deploy\_path                                                                            |
| :----------------: | :---------------------------------------------------------------------------------------------------------------- |
| 描述           | 待启动/停止的所有 ConfigNode 所在目标主机的路径，需要所有待启动/停止的 ConfigNode 节点在目标主机的相同目录下。 |
| 类型           | String                                                                                                         |
| 默认值         | 无                                                                                                             |
| 改后生效方式   | 重启服务生效                                                                                                   |

* datanode\_deploy\_path

| 名字 | datanode\_deploy\_path                                                                           |
| :----------------: | :------------------------------------------------------------------------------------------------------------ |
| 描述           | 待启动/停止的所有 DataNode 所在目标主机的路径，需要所有待启动/停止的 DataNode 节点在目标主机的相同目录下。 |
| 类型           | String                                                                                                     |
| 默认值         | 无                                                                                                         |
| 改后生效方式   | 重启服务生效                                                                                               |



## 4. 节点维护步骤

### 4.1 ConfigNode节点维护

ConfigNode节点维护分为ConfigNode添加和移除两种操作，有两个常见使用场景：

- 集群扩展：如集群中只有1个ConfigNode时，希望增加ConfigNode以提升ConfigNode节点高可用性，则可以添加2个ConfigNode，使得集群中有3个ConfigNode。
- 集群故障恢复：1个ConfigNode所在机器发生故障，使得该ConfigNode无法正常运行，此时可以移除该ConfigNode，然后添加一个新的ConfigNode进入集群。

> ❗️注意，在完成ConfigNode节点维护后，需要保证集群中有1或者3个正常运行的ConfigNode。2个ConfigNode不具备高可用性，超过3个ConfigNode会导致性能损失。

#### 4.1.1 添加ConfigNode节点

脚本命令：

```shell
# Linux / MacOS
# 首先切换到IoTDB根目录
sbin/start-confignode.sh

# Windows
# 首先切换到IoTDB根目录
# V2.0.4.x 版本之前
sbin\start-confignode.bat

# V2.0.4.x 版本及之后 
sbin\windows\start-confignode.bat
```

#### 4.1.2 移除ConfigNode节点

首先通过CLI连接集群，通过`show confignodes`确认想要移除ConfigNode的NodeID：

```shell
IoTDB> show confignodes
+------+-------+---------------+------------+--------+
|NodeID| Status|InternalAddress|InternalPort|    Role|
+------+-------+---------------+------------+--------+
|     0|Running|      127.0.0.1|       10710|  Leader|
|     1|Running|      127.0.0.1|       10711|Follower|
|     2|Running|      127.0.0.1|       10712|Follower|
+------+-------+---------------+------------+--------+
Total line number = 3
It costs 0.030s
```

然后使用SQL将ConfigNode移除，SQL命令：

```Bash
remove confignode [confignode_id]
```

### 4.2 DataNode节点维护

DataNode节点维护有两个常见场景：

- 集群扩容：出于集群能力扩容等目的，添加新的DataNode进入集群
- 集群故障恢复：一个DataNode所在机器出现故障，使得该DataNode无法正常运行，此时可以移除该DataNode，并添加新的DataNode进入集群

> ❗️注意，为了使集群能正常工作，在DataNode节点维护过程中以及维护完成后，正常运行的DataNode总数不得少于数据副本数（通常为2），也不得少于元数据副本数（通常为3）。

#### 4.2.1 添加DataNode节点

脚本命令：

```Bash
# Linux / MacOS 
# 首先切换到IoTDB根目录
sbin/start-datanode.sh

#Windows
# 首先切换到IoTDB根目录
# V2.0.4.x 版本之前
sbin\start-datanode.bat

# V2.0.4.x 版本及之后     
tools\windows\start-datanode.bat
```

说明：在添加DataNode后，随着新的写入到来（以及旧数据过期，如果设置了TTL），集群负载会逐渐向新的DataNode均衡，最终在所有节点上达到存算资源的均衡。

#### 4.2.2 移除DataNode节点

首先通过CLI连接集群，通过`show datanodes`确认想要移除的DataNode的NodeID：

```Bash
IoTDB> show datanodes
+------+-------+----------+-------+-------------+---------------+
|NodeID| Status|RpcAddress|RpcPort|DataRegionNum|SchemaRegionNum|
+------+-------+----------+-------+-------------+---------------+
|     1|Running|   0.0.0.0|   6667|            0|              0|
|     2|Running|   0.0.0.0|   6668|            1|              1|
|     3|Running|   0.0.0.0|   6669|            1|              0|
+------+-------+----------+-------+-------------+---------------+
Total line number = 3
It costs 0.110s
```

然后使用SQL将DataNode移除，SQL命令：

```Bash
remove datanode [datanode_id]
```

### 4.3 集群维护

更多关于集群维护的介绍可参考：[集群维护](../User-Manual/Load-Balance.md)

## 5. 常见问题

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
## 6. 附录

### 6.1 Confignode节点参数介绍

| 参数 | 描述                             | 是否为必填项 |
| :--- | :------------------------------- | :----------- |
| -d   | 以守护进程模式启动，即在后台运行 | 否           |

### 6.2 Datanode节点参数介绍

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

