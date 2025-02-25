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
# 集群版部署

本小节描述如何手动部署包括3个ConfigNode和3个DataNode的实例，即通常所说的3C3D集群。

<div align="center">
    <img src="/img/cluster01.png" alt="" style="width: 60%;"/>
</div>

## 1 注意事项

1. 安装前请确认系统已参照[系统配置](./Environment-Requirements.md)准备完成。

2. 部署时推荐优先使用`hostname`进行IP配置，可避免后期修改主机ip导致数据库无法启动的问题。设置hostname需要在目标服务器上配置/etc/hosts，如本机ip是192.168.1.3，hostname是iotdb-1，则可以使用以下命令设置服务器的 hostname，并使用hostname配置IoTDB的`cn_internal_address`、`dn_internal_address`。`dn_internal_address`。

   ``` shell
   echo "192.168.1.3  iotdb-1" >> /etc/hosts 
   ```

3. 有些参数首次启动后不能修改，请参考下方的"参数配置"章节来进行设置。

4. 无论是在linux还是windows中，请确保IoTDB的安装路径中不含空格和中文，避免软件运行异常。

5. 请注意，安装部署（包括激活和使用软件）IoTDB时需要保持使用同一个用户进行操作，您可以：
- 使用 root 用户（推荐）：使用 root 用户可以避免权限等问题。
- 使用固定的非 root 用户：
  - 使用同一用户操作：确保在启动、激活、停止等操作均保持使用同一用户，不要切换用户。
  - 避免使用 sudo：尽量避免使用 sudo 命令，因为它会以 root 用户权限执行命令，可能会引起权限混淆或安全问题。 

6. 推荐部署监控面板，可以对重要运行指标进行监控，随时掌握数据库运行状态，监控面板可以联系商务获取，部署监控面板步骤可以参考：[监控面板部署](./Monitoring-panel-deployment.md)

## 2 准备步骤

1. 准备IoTDB数据库安装包 ：iotdb-enterprise-{version}-bin.zip（安装包获取见：[链接](../Deployment-and-Maintenance/IoTDB-Package_timecho.md)）
2. 按环境要求配置好操作系统环境（系统环境配置见：[链接](../Deployment-and-Maintenance/Environment-Requirements.md)）

## 3 安装步骤

假设现在有3台linux服务器，IP地址和服务角色分配如下：

| 节点ip      | 主机名  | 服务                 |
| ----------- | ------- | -------------------- |
| 192.168.1.3 | iotdb-1 | ConfigNode、DataNode |
| 192.168.1.4 | iotdb-2 | ConfigNode、DataNode |
| 192.168.1.5 | iotdb-3 | ConfigNode、DataNode |

### 3.1 设置主机名

在3台机器上分别配置主机名，设置主机名需要在目标服务器上配置`/etc/hosts`，使用如下命令：

```Bash
echo "192.168.1.3  iotdb-1"  >> /etc/hosts
echo "192.168.1.4  iotdb-2"  >> /etc/hosts
echo "192.168.1.5  iotdb-3"  >> /etc/hosts 
```

### 3.2 参数配置

解压安装包并进入安装目录

```Plain
unzip  iotdb-enterprise-{version}-bin.zip
cd  iotdb-enterprise-{version}-bin
```

#### 环境脚本配置

- `./conf/confignode-env.sh`配置

    | **配置项**  | **说明**                               | **默认值** | **推荐值**                                       | 备注         |
    | :---------- | :------------------------------------- | :--------- | :----------------------------------------------- | :----------- |
    | MEMORY_SIZE | IoTDB ConfigNode节点可以使用的内存总量 | 空         | 可按需填写，填写后系统会根据填写的数值来分配内存 | 重启服务生效 |

- `./conf/datanode-env.sh`配置

    | **配置项**  | **说明**                             | **默认值** | **推荐值**                                       | 备注         |
    | :---------- | :----------------------------------- | :--------- | :----------------------------------------------- | :----------- |
    | MEMORY_SIZE | IoTDB DataNode节点可以使用的内存总量 | 空         | 可按需填写，填写后系统会根据填写的数值来分配内存 | 重启服务生效 |

#### 通用配置

打开通用配置文件`./conf/iotdb-system.properties`，可根据部署方式设置以下参数：

| 配置项                    | 说明                                     | 192.168.1.3    | 192.168.1.4    | 192.168.1.5    |
| ------------------------- | ---------------------------------------- | -------------- | -------------- | -------------- |
| cluster_name              | 集群名称                                 | defaultCluster | defaultCluster | defaultCluster |
| schema_replication_factor | 元数据副本数，DataNode数量不应少于此数目 | 3              | 3              | 3              |
| data_replication_factor   | 数据副本数，DataNode数量不应少于此数目   | 2              | 2              | 2              |

#### ConfigNode 配置

打开ConfigNode配置文件`./conf/iotdb-system.properties`，设置以下参数

| 配置项              | 说明                                                         | 默认            | 推荐值                                                  | 192.168.1.3   | 192.168.1.4   | 192.168.1.5   | 备注               |
| ------------------- | ------------------------------------------------------------ | --------------- | ------------------------------------------------------- | ------------- | ------------- | ------------- | ------------------ |
| cn_internal_address | ConfigNode在集群内部通讯使用的地址                           | 127.0.0.1       | 所在服务器的IPV4地址或hostname，推荐使用hostname        | iotdb-1       | iotdb-2       | iotdb-3       | 首次启动后不能修改 |
| cn_internal_port    | ConfigNode在集群内部通讯使用的端口                           | 10710           | 10710                                                   | 10710         | 10710         | 10710         | 首次启动后不能修改 |
| cn_consensus_port   | ConfigNode副本组共识协议通信使用的端口                       | 10720           | 10720                                                   | 10720         | 10720         | 10720         | 首次启动后不能修改 |
| cn_seed_config_node | 节点注册加入集群时连接的ConfigNode 的地址，cn_internal_address:cn_internal_port | 127.0.0.1:10710 | 第一个CongfigNode的cn_internal_address:cn_internal_port | iotdb-1:10710 | iotdb-1:10710 | iotdb-1:10710 | 首次启动后不能修改 |

#### DataNode 配置

打开DataNode配置文件 `./conf/iotdb-system.properties`，设置以下参数：

| 配置项                          | 说明                                                         | 默认            | 推荐值                                                  | 192.168.1.3   | 192.168.1.4   | 192.168.1.5   | 备注               |
| ------------------------------- | ------------------------------------------------------------ | --------------- | ------------------------------------------------------- | ------------- | ------------- | ------------- | ------------------ |
| dn_rpc_address                  | 客户端 RPC 服务的地址                                        | 127.0.0.1       |  推荐使用所在服务器的**IPV4地址或hostname**       |  iotdb-1       |iotdb-2       | iotdb-3       | 重启服务生效       |
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

```Bash
cd sbin
./start-confignode.sh    -d      #“-d”参数将在后台进行启动 
```
如果启动失败，请参考[常见问题](#常见问题)。

### 3.4 激活数据库

#### **方式一：激活文件拷贝激活**

- 依次启动3个confignode节点后，每台机器各自的`activation`文件夹, 分别拷贝每台机器的`system_info`文件给天谋工作人员;
- 工作人员将返回每个ConfigNode节点的license文件，这里会返回3个license文件；
- 将3个license文件分别放入对应的ConfigNode节点的`activation`文件夹下；

#### 方式二：激活脚本激活

- 依次获取3台机器的机器码，分别进入安装目录的`sbin`目录，执行激活脚本`start-activate.sh`:

    ```Bash
    cd sbin
    ./start-activate.sh
    ```

- 显示如下信息，这里显示的是1台机器的机器码 ：

    ```Bash
    Please copy the system_info's content and send it to Timecho:
    01-KU5LDFFN-PNBEHDRH
    Please enter license:
    ```

- 其他2个节点依次执行激活脚本`start-activate.sh`，然后将获取的3台机器的机器码都复制给天谋工作人员
- 工作人员会返回3段激活码，正常是与提供的3个机器码的顺序对应的，请分别将各自的激活码粘贴到上一步的命令行提示处 `Please enter license:`，如下提示：

    ```Bash
    Please enter license:
    Jw+MmF+Atxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx5bAOXNeob5l+HO5fEMgzrW8OJPh26Vl6ljKUpCvpTiw==
    License has been stored to sbin/../activation/license
    Import completed. Please start cluster and excute 'show cluster' to verify activation status
    ```

### 3.5 启动DataNode 节点

 分别进入iotdb的`sbin`目录下，依次启动3个datanode节点：

```Go
cd sbin
./start-datanode.sh   -d   #-d参数将在后台进行启动 
```

### 3.6 验证部署

可直接执行`./sbin`目录下的Cli启动脚本：

```Plain
./start-cli.sh  -h  ip(本机ip或域名)  -p  端口号(6667)
```

   成功启动后，出现如下界面显示IOTDB安装成功。

![](/img/%E4%BC%81%E4%B8%9A%E7%89%88%E6%88%90%E5%8A%9F.png)

出现安装成功界面后，继续看下是否激活成功，使用 `show cluster`命令

当看到最右侧显示`ACTIVATED`表示激活成功

![](/img/%E4%BC%81%E4%B8%9A%E7%89%88%E6%BF%80%E6%B4%BB.png)

> 出现`ACTIVATED(W)`为被动激活，表示此ConfigNode没有license文件（或没有签发时间戳最新的license文件），其激活依赖于集群中其它Activate状态的ConfigNode。此时建议检查license文件是否已放入license文件夹，没有请放入license文件，若已存在license文件，可能是此节点license文件与其他节点信息不一致导致，请联系天谋工作人员重新申请.

## 4 节点维护步骤

### 4.1 ConfigNode节点维护

ConfigNode节点维护分为ConfigNode添加和移除两种操作，有两个常见使用场景：
- 集群扩展：如集群中只有1个ConfigNode时，希望增加ConfigNode以提升ConfigNode节点高可用性，则可以添加2个ConfigNode，使得集群中有3个ConfigNode。
- 集群故障恢复：1个ConfigNode所在机器发生故障，使得该ConfigNode无法正常运行，此时可以移除该ConfigNode，然后添加一个新的ConfigNode进入集群。

> ❗️注意，在完成ConfigNode节点维护后，需要保证集群中有1或者3个正常运行的ConfigNode。2个ConfigNode不具备高可用性，超过3个ConfigNode会导致性能损失。

#### 添加ConfigNode节点

脚本命令：
```shell
# Linux / MacOS
# 首先切换到IoTDB根目录
sbin/start-confignode.sh

# Windows
# 首先切换到IoTDB根目录
sbin/start-confignode.bat
```

参数介绍：

| 参数 | 描述                                           | 是否为必填项 |
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

#### 移除ConfigNode节点

首先通过CLI连接集群，通过`show confignodes`确认想要移除ConfigNode的内部地址与端口号：

```Bash
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

然后使用脚本将DataNode移除。脚本命令：

```Bash
# Linux / MacOS 
sbin/remove-confignode.sh [confignode_id]

#Windows
sbin/remove-confignode.bat [confignode_id]

```

### 4.2 DataNode节点维护

DataNode节点维护有两个常见场景：

- 集群扩容：出于集群能力扩容等目的，添加新的DataNode进入集群
- 集群故障恢复：一个DataNode所在机器出现故障，使得该DataNode无法正常运行，此时可以移除该DataNode，并添加新的DataNode进入集群

> ❗️注意，为了使集群能正常工作，在DataNode节点维护过程中以及维护完成后，正常运行的DataNode总数不得少于数据副本数（通常为2），也不得少于元数据副本数（通常为3）。

#### 添加DataNode节点

脚本命令：

```Bash
# Linux / MacOS 
# 首先切换到IoTDB根目录
sbin/start-datanode.sh

# Windows
# 首先切换到IoTDB根目录
sbin/start-datanode.bat
```

参数介绍：

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

说明：在添加DataNode后，随着新的写入到来（以及旧数据过期，如果设置了TTL），集群负载会逐渐向新的DataNode均衡，最终在所有节点上达到存算资源的均衡。

#### 移除DataNode节点

首先通过CLI连接集群，通过`show datanodes`确认想要移除的DataNode的RPC地址与端口号：

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

然后使用脚本将DataNode移除。脚本命令：

```Bash
# Linux / MacOS 
sbin/remove-datanode.sh [datanode_id]

#Windows
sbin/remove-datanode.bat [datanode_id]
```

## 5 常见问题

1. 部署过程中多次提示激活失败
    - 使用 `ls -al` 命令：使用 `ls -al` 命令检查安装包根目录的所有者信息是否为当前用户。
    - 检查激活目录：检查 `./activation` 目录下的所有文件，所有者信息是否为当前用户。  

2. Confignode节点启动失败

    步骤 1: 请查看启动日志，检查是否修改了某些首次启动后不可改的参数。

    步骤 2: 请查看启动日志，检查是否出现其他异常。日志中若存在异常现象，请联系天谋技术支持人员咨询解决方案。

    步骤 3: 如果是首次部署或者数据可删除，也可按下述步骤清理环境，重新部署后，再次启动。

    步骤 4: 清理环境：

    a. 结束所有 ConfigNode 和 DataNode 进程。
   
    ```Bash
        # 1. 停止 ConfigNode 和 DataNode 服务
        sbin/stop-standalone.sh

        # 2. 检查是否还有进程残留
        jps
        # 或者
        ps -ef|gerp iotdb

        # 3. 如果有进程残留，则手动kill
        kill -9 <pid>
        # 如果确定机器上仅有1个iotdb，可以使用下面命令清理残留进程
        ps -ef|grep iotdb|grep -v grep|tr -s '  ' ' ' |cut -d ' ' -f2|xargs kill -9
    ```
     b.  删除 data 和 logs 目录。 

    说明：删除 data 目录是必要的，删除 logs 目录是为了纯净日志，非必需。
    ```Bash
        cd /data/iotdb
        rm -rf data logs
    ```