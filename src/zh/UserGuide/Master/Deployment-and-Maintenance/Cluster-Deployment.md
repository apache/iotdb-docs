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
# 集群版安装部署

本小节将以IoTDB经典集群部署架构3C3D（3个ConfigNode和3个DataNode）为例，介绍如何部署集群，即通常所说的3C3D集群。3C3D集群架构图如下：

<div align="center">
    <img src="https://alioss.timecho.com/docs/img/%E9%9B%86%E7%BE%A4%E9%83%A8%E7%BD%B2.png)" alt="" style="width: 60%;"/>
</div>

## 注意事项

1. 部署时推荐优先使用`hostname`进行IP配置，可避免后期修改主机ip导致数据库无法启动的问题。设置hostname需要在目标服务器上配置/etc/hosts，如本机ip是192.168.1.3，hostname是iotdb-1，则可以使用以下命令设置服务器的 hostname，并使用hostname配置IoTDB的`cn_internal_address`、`dn_internal_address`。

   ``` shell
   echo "192.168.1.3  iotdb-1" >> /etc/hosts 
   ```

2. 有些参数首次启动后不能修改，请参考下方的"参数配置"章节来进行设置。

## 准备步骤

1. 准备IoTDB数据库安装包 ：apache-iotdb-{version}-all-bin.zip（安装包获取见：[链接](https://iotdb.apache.org/zh/UserGuide/latest/Deployment-and-Maintenance/IoTDB-Package.html)）

2. 按环境要求配置好操作系统环境（系统环境配置见：[链接](https://iotdb.apache.org/zh/UserGuide/latest/Deployment-and-Maintenance/Environment-Requirements.html)）

## 安装步骤

假设现在有3台linux服务器，IP地址和服务角色分配如下：

| 节点ip      | 主机名  | 服务                 |
| ----------- | ------- | -------------------- |
| 192.168.1.3 | iotdb-1 | ConfigNode、DataNode |
| 192.168.1.4 | iotdb-2 | ConfigNode、DataNode |
| 192.168.1.5 | iotdb-3 | ConfigNode、DataNode |

### 1. 设置主机名

在3台机器上分别配置主机名，设置主机名需要在目标服务器上配置`/etc/hosts`，使用如下命令：

```Bash
echo "192.168.1.3  iotdb-1"  >> /etc/hosts
echo "192.168.1.4  iotdb-2"  >> /etc/hosts
echo "192.168.1.5  iotdb-3"  >> /etc/hosts 
```

### 2. 参数配置

解压安装包并进入安装目录

```Plain
unzip  apache-iotdb-{version}-all-bin.zip 
cd  apache-iotdb-{version}-all-bin
```

#### 环境脚本配置

- `./conf/confignode-env.sh` 配置

    | **配置项**  | **说明**                               | **默认值** | **推荐值**                                       | 备注         |
    | :---------- | :------------------------------------- | :--------- | :----------------------------------------------- | :----------- |
    | MEMORY_SIZE | IoTDB ConfigNode节点可以使用的内存总量 | 空         | 可按需填写，填写后系统会根据填写的数值来分配内存 | 重启服务生效 |

- `./conf/datanode-env.sh` 配置

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
| dn_rpc_address                  | 客户端 RPC 服务的地址                                        | 0.0.0.0         | 0.0.0.0                                                 | 0.0.0.0       | 0.0.0.0       | 0.0.0.0       | 重启服务生效       |
| dn_rpc_port                     | 客户端 RPC 服务的端口                                        | 6667            | 6667                                                    | 6667          | 6667          | 6667          | 重启服务生效       |
| dn_internal_address             | DataNode在集群内部通讯使用的地址                             | 127.0.0.1       | 所在服务器的IPV4地址或hostname，推荐使用hostname        | iotdb-1       | iotdb-2       | iotdb-3       | 首次启动后不能修改 |
| dn_internal_port                | DataNode在集群内部通信使用的端口                             | 10730           | 10730                                                   | 10730         | 10730         | 10730         | 首次启动后不能修改 |
| dn_mpp_data_exchange_port       | DataNode用于接收数据流使用的端口                             | 10740           | 10740                                                   | 10740         | 10740         | 10740         | 首次启动后不能修改 |
| dn_data_region_consensus_port   | DataNode用于数据副本共识协议通信使用的端口                   | 10750           | 10750                                                   | 10750         | 10750         | 10750         | 首次启动后不能修改 |
| dn_schema_region_consensus_port | DataNode用于元数据副本共识协议通信使用的端口                 | 10760           | 10760                                                   | 10760         | 10760         | 10760         | 首次启动后不能修改 |
| dn_seed_config_node             | 节点注册加入集群时连接的ConfigNode地址,即cn_internal_address:cn_internal_port | 127.0.0.1:10710 | 第一个CongfigNode的cn_internal_address:cn_internal_port | iotdb-1:10710 | iotdb-1:10710 | iotdb-1:10710 | 首次启动后不能修改 |

### 3. 启动ConfigNode节点

先启动第一个iotdb-1的confignode, 保证种子confignode节点先启动，然后依次启动第2和第3个confignode节点

```Bash
cd sbin
./start-confignode.sh    -d      #“-d”参数将在后台进行启动 
```

### 4. 启动DataNode 节点

 分别进入iotdb的`sbin`目录下，依次启动3个datanode节点：

```Bash
cd sbin
./start-datanode.sh   -d   #“-d”参数将在后台进行启动 
```

### 5. 验证部署

可直接执行`./sbin`目录下的Cli启动脚本：

```Plain
./start-cli.sh  -h  ip(本机ip或域名)  -p  端口号(6667)
```

   成功启动后，出现如下界面显示IOTDB安装成功。

![](https://alioss.timecho.com/docs/img/%E5%BC%80%E6%BA%90%E6%88%90%E5%8A%9F.png)

​	可以使用`show cluster` 命令查看集群信息：

![](https://alioss.timecho.com/docs/img/%E5%BC%80%E6%BA%90%E7%89%88%20show%20cluter.png)

