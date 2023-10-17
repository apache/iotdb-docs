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

# 部署指导

## 单机版部署

本文将介绍关于 IoTDB 使用的基本流程，如果需要更多信息，请浏览我们官网的 [指引](../IoTDB-Introduction/What-is-IoTDB.md).

### 安装环境

安装前需要保证设备上配有 JDK>=1.8 的运行环境，并配置好 JAVA_HOME 环境变量。

设置最大文件打开数为 65535。

### 安装步骤

IoTDB 支持多种安装途径。用户可以使用三种方式对 IoTDB 进行安装——下载二进制可运行程序、使用源码、使用 docker 镜像。

* 使用源码：您可以从代码仓库下载源码并编译，具体编译方法见下方。

* 二进制可运行程序：请从 [下载](https://iotdb.apache.org/Download/) 页面下载最新的安装包，解压后即完成安装。

* 使用 Docker 镜像：dockerfile 文件位于[github](https://github.com/apache/iotdb/blob/master/docker/src/main)

### 软件目录结构

* sbin 启动和停止脚本目录
* conf 配置文件目录
* tools 系统工具目录
* lib 依赖包目录

### IoTDB 试用

用户可以根据以下操作对 IoTDB 进行简单的试用，若以下操作均无误，则说明 IoTDB 安装成功。

#### 启动 IoTDB

IoTDB 是一个基于分布式系统的数据库。要启动 IoTDB ，你可以先启动单机版（一个 ConfigNode 和一个 DataNode）来检查安装。

用户可以使用 sbin 文件夹下的 start-standalone 脚本启动 IoTDB。

Linux 系统与 MacOS 系统启动命令如下：

```
> bash sbin/start-standalone.sh
```

Windows 系统启动命令如下：

```
> sbin\start-standalone.bat
```

注意：目前，要使用单机模式，你需要保证所有的地址设置为 127.0.0.1，如果需要从非 IoTDB 所在的机器访问此IoTDB，请将配置项 `dn_rpc_address` 修改为 IoTDB 所在的机器 IP。副本数设置为1。并且，推荐使用 SimpleConsensus，因为这会带来额外的效率。这些现在都是默认配置。

## 集群版部署

### 集群管理工具部署

IoTDB 集群管理工具是一款易用的运维工具（企业版工具）。旨在解决 IoTDB 分布式系统多节点的运维难题，主要包括集群部署、集群启停、弹性扩容、配置更新、数据导出等功能，从而实现对复杂数据库集群的一键式指令下发，极大降低管理难度。本文档将说明如何用集群管理工具远程部署、配置、启动和停止 IoTDB 集群实例。

#### 部署集群管理工具

##### 环境依赖

IoTDB 要部署的机器需要依赖jdk 8及以上版本、lsof 或者 netstat、unzip功能如果没有请自行安装，可以参考文档最后的一节环境所需安装命令。

提示:IoTDB集群管理工具需要使用具有root权限的账号

##### 部署方法

###### 下载安装

本工具为IoTDB企业版配套工具，您可以联系您的销售获取工具下载方式。

注意：由于二进制包仅支持GLIBC2.17 及以上版本，因此最低适配Centos7版本

* 在在iotd目录内输入以下指令后：

```bash
bash install-iotd.sh
```

即可在之后的 shell 内激活 iotd 关键词，如检查部署前所需的环境指令如下所示：

```bash
iotd cluster check example
```

* 也可以不激活iotd直接使用  &lt;iotd absolute path&gt;/sbin/iotd 来执行命令，如检查部署前所需的环境：

```bash
<iotd absolute path>/sbin/iotd cluster check example
```

#### 集群配置文件介绍

* 在`iotd/config` 目录下有集群配置的yaml文件，yaml文件名字就是集群名字yaml 文件可以有多个，为了方便用户配置yaml文件在iotd/config目录下面提供了`default_cluster.yaml`示例。
* yaml 文件配置由`global`、`confignode_servers`、`datanode_servers`、`grafana_servers`(功能待开发)四大部分组成
* global 是通用配置主要配置机器用户名密码、IoTDB本地安装文件、Jdk配置等。在`iotd/config`目录中提供了一个`default_cluster.yaml`样例数据，
    用户可以复制修改成自己集群名字并参考里面的说明进行配置iotdb集群，在`default_cluster.yaml`样例中没有注释的均为必填项，已经注释的为非必填项。

例如要执行`default_cluster.yaml`检查命令则需要执行命令`iotd cluster check default_cluster`即可，
更多详细命令请参考下面命令列表。

| 参数                       | 说明                                                         | 是否必填 |
| -------------------------- | ------------------------------------------------------------ | -------- |
| iotdb_zip_dir              | IoTDB 部署分发目录，如果值为空则从`iotdb_download_url`指定地址下载 | 非必填   |
| iotdb_download_url         | IoTDB 下载地址，如果`iotdb_zip_dir` 没有值则从指定地址下载   | 非必填   |
| jdk_tar_dir                | jdk 本地目录，可使用该 jdk 路径进行上传部署至目标节点。      | 非必填   |
| jdk_deploy_dir             | jdk 远程机器部署目录，会将 jdk 部署到目标节点该文件夹下最终部署完成的路径是`<jdk_deploy_dir>/jdk_iotdb` | 非必填   |
| iotdb_lib_dir              | IoTDB lib 目录或者IoTDB 的lib 压缩包仅支持.zip格式 ，仅用于IoTDB升级，默认处于注释状态，如需升级请打开注释 | 非必填   |
| user                       | ssh登陆部署机器的用户名                                      | 必填     |
| password                   | ssh登录的密码, 如果password未指定使用pkey登陆, 请确保已配置节点之间ssh登录免密钥 | 非必填   |
| pkey                       | 密钥登陆如果password 有值优先使用password否则使用pkey登陆    | 非必填   |
| ssh_port                   | ssh登录端口                                                  | 必填     |
| deploy_dir                 | iotdb 部署目录，会把 iotdb 部署到目标节点该文件夹下最终部署完成的路径是`<deploy_dir>/iotdb` | 必填     |
| datanode-env.sh            | 对应`iotdb/config/datanode-env.sh`                           | 非必填   |
| confignode-env.sh          | 对应`iotdb/config/confignode-env.sh`                         | 非必填   |
| iotdb-common.properties    | 对应`iotdb/config/iotdb-common.properties`                   | 非必填   |
| cn_target_config_node | 集群配置地址指向存活的ConfigNode,默认指向confignode_x，在`global`与`confignode_servers`同时配置值时优先使用`confignode_servers`中的值，对应`iotdb/config/iotdb-confignode.properties`中的`cn_target_config_node` | 必填     |
| dn_target_config_node | 集群配置地址指向存活的ConfigNode,默认指向confignode_x，在`global`与`datanode_servers`同时配置值时优先使用`datanode_servers`中的值，对应`iotdb/config/iotdb-datanode.properties`中的`dn_target_config_node` | 必填     |

* confignode_servers 是部署IoTDB Confignodes配置，里面可以配置多个Confignode
    默认将第一个启动的ConfigNode节点node1当作Seed-ConfigNode

| 参数                        | 说明                                                         | 是否必填 |
| --------------------------- | ------------------------------------------------------------ | -------- |
| name                        | Confignode 名称                                              | 必填     |
| deploy_dir                  | IoTDB config node 部署目录，注:该目录不能与下面的IoTDB data node部署目录相同 | 必填｜   |
| iotdb-confignode.properties | 对应`iotdb/config/iotdb-confignode.properties`更加详细请参看`iotdb-confignode.properties`文件说明 | 非必填   |
| cn_internal_address         | 对应iotdb/内部通信地址，对应`iotdb/config/iotdb-confignode.properties`中的`cn_internal_address` | 必填     |
| cn_target_config_node  | 集群配置地址指向存活的ConfigNode,默认指向confignode_x，在`global`与`confignode_servers`同时配置值时优先使用`confignode_servers`中的值，对应`iotdb/config/iotdb-confignode.properties`中的`cn_target_config_node` | 必填     |
| cn_internal_port            | 内部通信端口，对应`iotdb/config/iotdb-confignode.properties`中的`cn_internal_port` | 必填     |
| cn_consensus_port           | 对应`iotdb/config/iotdb-confignode.properties`中的`cn_consensus_port` | 非必填   |
| cn_data_dir                 | 对应`iotdb/config/iotdb-confignode.properties`中的`cn_data_dir` | 必填     |
| iotdb-common.properties     | 对应`iotdb/config/iotdb-common.properties`在`global`与`confignode_servers`同时配置值优先使用confignode_servers中的值 | 非必填   |


* datanode_servers 是部署IoTDB Datanodes配置，里面可以配置多个Datanode

| 参数                       | 说明                                                         | 是否必填 |
| -------------------------- | ------------------------------------------------------------ | -------- |
| name                       | Datanode 名称                                                | 必填     |
| deploy_dir                 | IoTDB data node 部署目录，注:该目录不能与下面的IoTDB config node部署目录相同 | 必填     |
| iotdb-datanode.properties  | 对应`iotdb/config/iotdb-datanode.properties`更加详细请参看`iotdb-datanode.properties`文件说明 | 非必填   |
| dn_rpc_address             | datanode rpc 地址对应`iotdb/config/iotdb-datanode.properties`中的`dn_rpc_address` | 必填     |
| dn_internal_address        | 内部通信地址，对应`iotdb/config/iotdb-datanode.properties`中的`dn_internal_address` | 必填     |
| dn_target_config_node | 集群配置地址指向存活的ConfigNode,默认指向confignode_x，在`global`与`datanode_servers`同时配置值时优先使用`datanode_servers`中的值，对应`iotdb/config/iotdb-datanode.properties`中的`dn_target_config_node` | 必填     |
| dn_rpc_port                | datanode rpc端口地址，对应`iotdb/config/iotdb-datanode.properties`中的`dn_rpc_port` | 必填     |
| dn_internal_port           | 内部通信端口，对应`iotdb/config/iotdb-datanode.properties`中的`dn_internal_port` | 必填     |
| iotdb-common.properties    | 对应`iotdb/config/iotdb-common.properties`在`global`与`datanode_servers`同时配置值优先使用`datanode_servers`中的值 | 非必填   |

* grafana_servers 是部署Grafana 相关配置
    该模块暂不支持

注意:如何配置yaml key对应的值包含特殊字符如:等建议整个value使用双引号，对应的文件路径中不要使用包含空格的路径，防止出现识别出现异常问题。

#### 命令格式

本工具的基本用法为：

```bash
iotd cluster <key> <cluster name> [params (Optional)]
```

* key 表示了具体的命令。

* cluster name 表示集群名称(即`iotd/config` 文件中yaml文件名字)。

* params 表示了命令的所需参数(选填)。

* 例如部署default_cluster集群的命令格式为：

```bash
iotd cluster deploy default_cluster
```

* 集群的功能及参数列表如下：

| 命令       | 功能                                          | 参数                                                         |
| ---------- | --------------------------------------------- | ------------------------------------------------------------ |
| check      | 检测集群是否可以部署                          | 集群名称列表                                                 |
| clean      | 清理集群                                      | 集群名称                                                     |
| deploy     | 部署集群                                      | 集群名称                                                     |
| list       | 打印集群及状态列表                            | 无                                                           |
| start      | 启动集群                                      | 集群名称,-N,节点名称(可选)                                   |
| stop       | 关闭集群                                      | 集群名称,-N,节点名称(可选)                                   |
| restart    | 重启集群                                      | 集群名称                                                     |
| show       | 查看集群信息，details字段表示展示集群信息细节 | 集群名称, details(可选)                                      |
| destroy    | 销毁集群                                      | 集群名称                                                     |
| scaleout   | 集群扩容                                      | 集群名称                                                     |
| scalein    | 集群缩容                                      | 集群名称，-N，集群节点名字或集群节点ip+port                  |
| reload     | 集群热加载                                    | 集群名称                                                     |
| distribute | 集群配置文件分发                              | 集群名称                                                     |
| dumplog    | 备份指定集群日志                              | 集群名称,-N,集群节点名字 -h 备份至目标机器ip -pw 备份至目标机器密码 -p 备份至目标机器端口 -path 备份的目录 -startdate 起始时间 -enddate 结束时间 -loglevel 日志类型 -l 传输速度 |
| dumpdata   | 备份指定集群数据                              | 集群名称, -h 备份至目标机器ip -pw 备份至目标机器密码 -p 备份至目标机器端口 -path 备份的目录 -startdate 起始时间 -enddate 结束时间  -l 传输速度 |
| upgrade    | lib 包升级                                    | 集群名字(升级完后请重启)                                     |

#### 详细命令执行过程

下面的命令都是以default_cluster.yaml 为示例执行的，用户可以修改成自己的集群文件来执行

##### 检查集群部署环境命令

```bash
iotd cluster check default_cluster
```

* 根据 cluster-name 找到默认位置的 yaml 文件，获取`confignode_servers`和`datanode_servers`配置信息

* 验证目标节点是否能够通过 SSH 登录

* 验证对应节点上的 JDK 版本是否满足IoTDB jdk1.8及以上版本、服务器是否按照unzip、是否安装lsof 或者netstat 

* 如果看到下面提示`Info:example check successfully!` 证明服务器已经具备安装的要求，
    如果输出`Warn:example check fail!` 证明有部分条件没有满足需求可以查看上面的Warn日志进行修复，假如jdk没有满足要求，我们可以自己在yaml 文件中配置一个jdk1.8 及以上版本的进行部署不影响后面使用，如果检查lsof、netstat或者unzip 不满足要求需要在服务器上自行安装


##### 部署集群命令

```bash
iotd cluster deploy default_cluster
```

* 根据 cluster-name 找到默认位置的 yaml 文件，获取`confignode_servers`和`datanode_servers`配置信息

* 根据`confignode_servers` 和`datanode_servers`中的节点信息上传iotdb压缩包和jdk压缩包(如果yaml中配置`jdk_tar_dir`和`jdk_deploy_dir`值)

* 根据yaml文件节点配置信息生成并上传`iotdb-common.properties`、`iotdb-confignode.properties`、`iotdb-datanode.properties`

提示：这里的confignode 和datanode部署到同一台机器上时目录不能为相同，否则会被后部署的节点文件覆盖


##### 启动集群命令

```bash
iotd cluster check default_cluster
```

* 根据 cluster-name 找到默认位置的 yaml 文件，获取`confignode_servers`和`datanode_servers`配置信息

* 启动confignode，根据yaml配置文件中`confignode_servers`中的顺序依次启动同时根据进程id检查confignode是否正常，第一个confignode 为seek config

* 启动datanode，根据yaml配置文件中`datanode_servers`中的顺序依次启动同时根据进程id检查datanode是否正常

* 如果根据进程id检查进程存在后，通过cli依次检查集群列表中每个服务是否正常，如果cli链接失败则每隔10s重试一次直到成功最多重试5次


*启动单个节点命令*

```bash
iotd cluster start default_cluster -N datanode_1
```

or

```bash
iotd cluster start default_cluster -N 192.168.1.5:6667
```

* 根据 cluster-name 找到默认位置的 yaml 文件

* 根据提供的节点名称或者ip:port找到对于节点位置信息,如果启动的节点是`data_node`则ip使用yaml 文件中的`dn_rpc_address`、port 使用的是yaml文件中datanode_servers 中的`dn_rpc_port`。
    如果启动的节点是`config_node`则ip使用的是yaml文件中confignode_servers 中的`cn_internal_address` 、port 使用的是`cn_internal_port`

* 启动该节点

##### 查看集群状态命令

```bash
iotd cluster show default_cluster
```

or

```bash
iotd cluster show default_cluster details
```

* 根据 cluster-name 找到默认位置的 yaml 文件，获取`confignode_servers`和`datanode_servers`配置信息

* 依次在datanode通过cli执行`show cluster details` 如果有一个节点执行成功则不会在后续节点继续执行cli直接返回结果


##### 停止集群命令

```bash
iotd cluster stop default_cluster
```

* 根据 cluster-name 找到默认位置的 yaml 文件，获取`confignode_servers`和`datanode_servers`配置信息

* 根据`datanode_servers`中datanode节点信息，按照配置先后顺序依次停止datanode节点

* 根据`confignode_servers`中confignode节点信息，按照配置依次停止confignode节点


*停止单个节点命令*

```bash
iotd cluster stop default_cluster -N datanode_1
```

or

```bash
iotd cluster stop default_cluster -N 192.168.1.5:6667
```

* 根据 cluster-name 找到默认位置的 yaml 文件

* 根据提供的节点名称或者ip:port找到对于节点位置信息，如果停止的节点是`data_node`则ip使用yaml 文件中的`dn_rpc_address`、port 使用的是yaml文件中datanode_servers 中的`dn_rpc_port`。
    如果停止的节点是`config_node`则ip使用的是yaml文件中confignode_servers 中的`cn_internal_address` 、port 使用的是`cn_internal_port`

* 停止该节点

## 手动部署

### 前置检查

1. JDK>=1.8 的运行环境，并配置好 JAVA_HOME 环境变量。
2. 设置最大文件打开数为 65535。
3. 关闭交换内存。
4. 首次启动ConfigNode节点时，确保已清空ConfigNode节点的data/confignode目录；首次启动DataNode节点时，确保已清空DataNode节点的data/datanode目录。
5. 如果整个集群处在可信环境下，可以关闭机器上的防火墙选项。
6. 在集群默认配置中，ConfigNode 会占用端口 10710 和 10720，DataNode 会占用端口 6667、10730、10740、10750 和 10760，
    请确保这些端口未被占用，或者手动修改配置文件中的端口配置。

### 安装包获取

你可以选择下载二进制文件（见 3.1）或从源代码编译（见 3.2）。

#### 下载二进制文件

1. 打开官网[Download Page](https://iotdb.apache.org/Download/)。
2. 下载 IoTDB 1.0.0 版本的二进制文件。
3. 解压得到 apache-iotdb-1.0.0-all-bin 目录。

#### 使用源码编译

##### 下载源码

**Git**

```
git clone https://github.com/apache/iotdb.git
git checkout v1.0.0
```

**官网下载**

1. 打开官网[Download Page](https://iotdb.apache.org/Download/)。
2. 下载 IoTDB 1.0.0 版本的源码。
3. 解压得到 apache-iotdb-1.0.0 目录。

##### 编译源码

在 IoTDB 源码根目录下:

```
mvn clean package -pl distribution -am -DskipTests
```

编译成功后，可在目录 
**distribution/target/apache-iotdb-1.0.0-SNAPSHOT-all-bin/apache-iotdb-1.0.0-SNAPSHOT-all-bin** 
找到集群版本的二进制文件。

### 安装包说明

打开 apache-iotdb-1.0.0-SNAPSHOT-all-bin，可见以下目录：

| **目录** | **说明**                                                     |
| -------- | ------------------------------------------------------------ |
| conf     | 配置文件目录，包含 ConfigNode、DataNode、JMX 和 logback 等配置文件 |
| data     | 数据文件目录，包含 ConfigNode 和 DataNode 的数据文件         |
| lib      | 库文件目录                                                   |
| licenses | 证书文件目录                                                 |
| logs     | 日志文件目录，包含 ConfigNode 和 DataNode 的日志文件         |
| sbin     | 脚本目录，包含 ConfigNode 和 DataNode 的启停移除脚本，以及 Cli 的启动脚本等 |
| tools    | 系统工具目录                                                 |

### 集群安装配置

#### 集群安装

`apache-iotdb-1.0.0-SNAPSHOT-all-bin` 包含 ConfigNode 和 DataNode，
请将安装包部署于你目标集群的所有机器上，推荐将安装包部署于所有服务器的相同目录下。

如果你希望先在一台服务器上尝试部署 IoTDB 集群，请参考
[Cluster Quick Start](https://iotdb.apache.org/zh/UserGuide/Master/QuickStart/ClusterQuickStart.html)。

#### 集群配置

接下来需要修改每个服务器上的配置文件，登录服务器，
并将工作路径切换至 `apache-iotdb-1.0.0-SNAPSHOT-all-bin`，
配置文件在 `./conf` 目录内。

对于所有部署 ConfigNode 的服务器，需要修改通用配置（见 5.2.1）和 ConfigNode 配置（见 5.2.2）。

对于所有部署 DataNode 的服务器，需要修改通用配置（见 5.2.1）和 DataNode 配置（见 5.2.3）。

##### 通用配置

打开通用配置文件 ./conf/iotdb-common.properties，
可根据 [部署推荐](https://iotdb.apache.org/zh/UserGuide/Master/Cluster/Deployment-Recommendation.html)
设置以下参数：

| **配置项**                                 | **说明**                                                     | **默认**                                        |
| ------------------------------------------ | ------------------------------------------------------------ | ----------------------------------------------- |
| cluster\_name                              | 节点希望加入的集群的名称                                     | defaultCluster                                  |
| config\_node\_consensus\_protocol\_class   | ConfigNode 使用的共识协议                                    | org.apache.iotdb.consensus.ratis.RatisConsensus |
| schema\_replication\_factor                | 元数据副本数，DataNode 数量不应少于此数目                    | 1                                               |
| schema\_region\_consensus\_protocol\_class | 元数据副本组的共识协议                                       | org.apache.iotdb.consensus.ratis.RatisConsensus |
| data\_replication\_factor                  | 数据副本数，DataNode 数量不应少于此数目                      | 1                                               |
| data\_region\_consensus\_protocol\_class   | 数据副本组的共识协议。注：RatisConsensus 目前不支持多数据目录 | org.apache.iotdb.consensus.iot.IoTConsensus     |

**注意：上述配置项在集群启动后即不可更改，且务必保证所有节点的通用配置完全一致，否则节点无法启动。**

##### ConfigNode 配置

打开 ConfigNode 配置文件 ./conf/iotdb-confignode.properties，根据服务器/虚拟机的 IP 地址和可用端口，设置以下参数：

| **配置项**                     | **说明**                                                     | **默认**        | **用法**                                                     |
| ------------------------------ | ------------------------------------------------------------ | --------------- | ------------------------------------------------------------ |
| cn\_internal\_address          | ConfigNode 在集群内部通讯使用的地址                          | 127.0.0.1       | 设置为服务器的 IPV4 地址或域名                               |
| cn\_internal\_port             | ConfigNode 在集群内部通讯使用的端口                          | 10710           | 设置为任意未占用端口                                         |
| cn\_consensus\_port            | ConfigNode 副本组共识协议通信使用的端口                      | 10720           | 设置为任意未占用端口                                         |
| cn\_target\_config\_node\_list | 节点注册加入集群时连接的 ConfigNode 的地址。注：只能配置一个 | 127.0.0.1:10710 | 对于 Seed-ConfigNode，设置为自己的 cn\_internal\_address:cn\_internal\_port；对于其它 ConfigNode，设置为另一个正在运行的 ConfigNode 的 cn\_internal\_address:cn\_internal\_port |

**注意：上述配置项在节点启动后即不可更改，且务必保证所有端口均未被占用，否则节点无法启动。**

##### DataNode 配置

打开 DataNode 配置文件 ./conf/iotdb-datanode.properties，根据服务器/虚拟机的 IP 地址和可用端口，设置以下参数：

| **配置项**                          | **说明**                                  | **默认**        | **用法**                                                     |
| ----------------------------------- | ----------------------------------------- | --------------- | ------------------------------------------------------------ |
| dn\_rpc\_address                    | 客户端 RPC 服务的地址                     | 127.0.0.1       | 设置为服务器的 IPV4 地址或域名                               |
| dn\_rpc\_port                       | 客户端 RPC 服务的端口                     | 6667            | 设置为任意未占用端口                                         |
| dn\_internal\_address               | DataNode 在集群内部接收控制流使用的地址   | 127.0.0.1       | 设置为服务器的 IPV4 地址或域名                               |
| dn\_internal\_port                  | DataNode 在集群内部接收控制流使用的端口   | 10730           | 设置为任意未占用端口                                         |
| dn\_mpp\_data\_exchange\_port       | DataNode 在集群内部接收数据流使用的端口   | 10740           | 设置为任意未占用端口                                         |
| dn\_data\_region\_consensus\_port   | DataNode 的数据副本间共识协议通信的端口   | 10750           | 设置为任意未占用端口                                         |
| dn\_schema\_region\_consensus\_port | DataNode 的元数据副本间共识协议通信的端口 | 10760           | 设置为任意未占用端口                                         |
| dn\_target\_config\_node\_list      | 集群中正在运行的 ConfigNode 地址          | 127.0.0.1:10710 | 设置为任意正在运行的 ConfigNode 的 cn\_internal\_address:cn\_internal\_port，可设置多个，用逗号（","）隔开 |

**注意：上述配置项在节点启动后即不可更改，且务必保证所有端口均未被占用，否则节点无法启动。**

### 集群操作

#### 启动集群

本小节描述如何启动包括若干 ConfigNode 和 DataNode 的集群。
集群可以提供服务的标准是至少启动一个 ConfigNode 且启动 不小于（数据/元数据）副本个数 的 DataNode。

总体启动流程分为三步：

1. 启动种子 ConfigNode
2. 增加 ConfigNode（可选）
3. 增加 DataNode

##### 启动 Seed-ConfigNode

**集群第一个启动的节点必须是 ConfigNode，第一个启动的 ConfigNode 必须遵循本小节教程。**

第一个启动的 ConfigNode 是 Seed-ConfigNode，标志着新集群的创建。
在启动 Seed-ConfigNode 前，请打开通用配置文件 ./conf/iotdb-common.properties，并检查如下参数：

| **配置项**                                 | **检查**                   |
| ------------------------------------------ | -------------------------- |
| cluster\_name                              | 已设置为期望的集群名称     |
| config\_node\_consensus\_protocol\_class   | 已设置为期望的共识协议     |
| schema\_replication\_factor                | 已设置为期望的元数据副本数 |
| schema\_region\_consensus\_protocol\_class | 已设置为期望的共识协议     |
| data\_replication\_factor                  | 已设置为期望的数据副本数   |
| data\_region\_consensus\_protocol\_class   | 已设置为期望的共识协议     |

**注意：** 请根据[部署推荐](https://iotdb.apache.org/zh/UserGuide/Master/Cluster/Deployment-Recommendation.html)配置合适的通用参数，这些参数在首次配置后即不可修改。

接着请打开它的配置文件 ./conf/iotdb-confignode.properties，并检查如下参数：

| **配置项**                     | **检查**                                                     |
| ------------------------------ | ------------------------------------------------------------ |
| cn\_internal\_address          | 已设置为服务器的 IPV4 地址或域名                             |
| cn\_internal\_port             | 该端口未被占用                                               |
| cn\_consensus\_port            | 该端口未被占用                                               |
| cn\_target\_config\_node\_list | 已设置为自己的内部通讯地址，即 cn\_internal\_address:cn\_internal\_port |

检查完毕后，即可在服务器上运行启动脚本：

```
# Linux 前台启动
bash ./sbin/start-confignode.sh

# Linux 后台启动
nohup bash ./sbin/start-confignode.sh >/dev/null 2>&1 &

# Windows
.\sbin\start-confignode.bat
```

ConfigNode 的其它配置参数可参考
[ConfigNode 配置参数](https://iotdb.apache.org/zh/UserGuide/Master/Reference/ConfigNode-Config-Manual.html)。

##### 增加更多 ConfigNode（可选）

**只要不是第一个启动的 ConfigNode 就必须遵循本小节教程。**

可向集群添加更多 ConfigNode，以保证 ConfigNode 的高可用。常用的配置为额外增加两个 ConfigNode，使集群共有三个 ConfigNode。

新增的 ConfigNode 需要保证 ./conf/iotdb-common.properites 中的所有配置参数与 Seed-ConfigNode 完全一致，否则可能启动失败或产生运行时错误。
因此，请着重检查通用配置文件中的以下参数：

| **配置项**                                 | **检查**                    |
| ------------------------------------------ | --------------------------- |
| cluster\_name                              | 与 Seed-ConfigNode 保持一致 |
| config\_node\_consensus\_protocol\_class   | 与 Seed-ConfigNode 保持一致 |
| schema\_replication\_factor                | 与 Seed-ConfigNode 保持一致 |
| schema\_region\_consensus\_protocol\_class | 与 Seed-ConfigNode 保持一致 |
| data\_replication\_factor                  | 与 Seed-ConfigNode 保持一致 |
| data\_region\_consensus\_protocol\_class   | 与 Seed-ConfigNode 保持一致 |

接着请打开它的配置文件 ./conf/iotdb-confignode.properties，并检查以下参数：

| **配置项**                     | **检查**                                                     |
| ------------------------------ | ------------------------------------------------------------ |
| cn\_internal\_address          | 已设置为服务器的 IPV4 地址或域名                             |
| cn\_internal\_port             | 该端口未被占用                                               |
| cn\_consensus\_port            | 该端口未被占用                                               |
| cn\_target\_config\_node\_list | 已设置为另一个正在运行的 ConfigNode 的内部通讯地址，推荐使用 Seed-ConfigNode 的内部通讯地址 |

检查完毕后，即可在服务器上运行启动脚本：

```
# Linux 前台启动
bash ./sbin/start-confignode.sh

# Linux 后台启动
nohup bash ./sbin/start-confignode.sh >/dev/null 2>&1 &

# Windows
.\sbin\start-confignode.bat
```

ConfigNode 的其它配置参数可参考
[ConfigNode配置参数](https://iotdb.apache.org/zh/UserGuide/Master/Reference/ConfigNode-Config-Manual.html)。

##### 增加 DataNode

**确保集群已有正在运行的 ConfigNode 后，才能开始增加 DataNode。**

可以向集群中添加任意个 DataNode。
在添加新的 DataNode 前，请先打开通用配置文件 ./conf/iotdb-common.properties 并检查以下参数：

| **配置项**    | **检查**                    |
| ------------- | --------------------------- |
| cluster\_name | 与 Seed-ConfigNode 保持一致 |

接着打开它的配置文件 ./conf/iotdb-datanode.properties 并检查以下参数：

| **配置项**                          | **检查**                                                     |
| ----------------------------------- | ------------------------------------------------------------ |
| dn\_rpc\_address                    | 已设置为服务器的 IPV4 地址或域名                             |
| dn\_rpc\_port                       | 该端口未被占用                                               |
| dn\_internal\_address               | 已设置为服务器的 IPV4 地址或域名                             |
| dn\_internal\_port                  | 该端口未被占用                                               |
| dn\_mpp\_data\_exchange\_port       | 该端口未被占用                                               |
| dn\_data\_region\_consensus\_port   | 该端口未被占用                                               |
| dn\_schema\_region\_consensus\_port | 该端口未被占用                                               |
| dn\_target\_config\_node\_list      | 已设置为正在运行的 ConfigNode 的内部通讯地址，推荐使用 Seed-ConfigNode 的内部通讯地址 |

检查完毕后，即可在服务器上运行启动脚本：

```
# Linux 前台启动
bash ./sbin/start-datanode.sh

# Linux 后台启动
nohup bash ./sbin/start-datanode.sh >/dev/null 2>&1 &

# Windows
.\sbin\start-datanode.bat
```

DataNode 的其它配置参数可参考
[DataNode配置参数](https://iotdb.apache.org/zh/UserGuide/Master/Reference/DataNode-Config-Manual.html)。

**注意：当且仅当集群拥有不少于副本个数（max{schema\_replication\_factor, data\_replication\_factor}）的 DataNode 后，集群才可以提供服务**

#### 启动 Cli

若搭建的集群仅用于本地调试，可直接执行 ./sbin 目录下的 Cli 启动脚本：

```
# Linux
./sbin/start-cli.sh

# Windows
.\sbin\start-cli.bat
```

若希望通过 Cli 连接生产环境的集群，
请阅读 [Cli 使用手册](https://iotdb.apache.org/zh/UserGuide/Master/QuickStart/Command-Line-Interface.html)。

#### 验证集群

以在6台服务器上启动的3C3D（3个ConfigNode 和 3个DataNode）集群为例，
这里假设3个ConfigNode的IP地址依次为192.168.1.10、192.168.1.11、192.168.1.12，且3个ConfigNode启动时均使用了默认的端口10710与10720；
3个DataNode的IP地址依次为192.168.1.20、192.168.1.21、192.168.1.22，且3个DataNode启动时均使用了默认的端口6667、10730、10740、10750与10760。

当按照6.1步骤成功启动集群后，在 Cli 执行 `show cluster details`，看到的结果应当如下：

```
IoTDB> show cluster details
+------+----------+-------+---------------+------------+-------------------+------------+-------+-------+-------------------+-----------------+
|NodeID|  NodeType| Status|InternalAddress|InternalPort|ConfigConsensusPort|  RpcAddress|RpcPort|MppPort|SchemaConsensusPort|DataConsensusPort|
+------+----------+-------+---------------+------------+-------------------+------------+-------+-------+-------------------+-----------------+
|     0|ConfigNode|Running|   192.168.1.10|       10710|              10720|            |       |       |                   |                 |
|     2|ConfigNode|Running|   192.168.1.11|       10710|              10720|            |       |       |                   |                 |
|     3|ConfigNode|Running|   192.168.1.12|       10710|              10720|            |       |       |                   |                 |
|     1|  DataNode|Running|   192.168.1.20|       10730|                   |192.168.1.20|   6667|  10740|              10750|            10760|
|     4|  DataNode|Running|   192.168.1.21|       10730|                   |192.168.1.21|   6667|  10740|              10750|            10760|
|     5|  DataNode|Running|   192.168.1.22|       10730|                   |192.168.1.22|   6667|  10740|              10750|            10760|
+------+----------+-------+---------------+------------+-------------------+------------+-------+-------+-------------------+-----------------+
Total line number = 6
It costs 0.012s
```

若所有节点的状态均为 **Running**，则说明集群部署成功；
否则，请阅读启动失败节点的运行日志，并检查对应的配置参数。

#### 停止 IoTDB 进程

本小节描述如何手动关闭 IoTDB 的 ConfigNode 或 DataNode 进程。

##### 使用脚本停止 ConfigNode

执行停止 ConfigNode 脚本：

```
# Linux
./sbin/stop-confignode.sh

# Windows
.\sbin\stop-confignode.bat
```

##### 使用脚本停止 DataNode

执行停止 DataNode 脚本：

```
# Linux
./sbin/stop-datanode.sh

# Windows
.\sbin\stop-datanode.bat
```

##### 停止节点进程

首先获取节点的进程号：

```
jps

# 或

ps aux | grep iotdb
```

结束进程：

```
kill -9 <pid>
```

**注意：有些端口的信息需要 root 权限才能获取，在此情况下请使用 sudo**

#### 集群缩容

本小节描述如何将 ConfigNode 或 DataNode 移出集群。

##### 移除 ConfigNode

在移除 ConfigNode 前，请确保移除后集群至少还有一个活跃的 ConfigNode。
在活跃的 ConfigNode 上执行 remove-confignode 脚本：

```
# Linux
## 根据 confignode_id 移除节点
./sbin/remove-confignode.sh <confignode_id>

## 根据 ConfigNode 内部通讯地址和端口移除节点
./sbin/remove-confignode.sh <cn_internal_address>:<cn_internal_port>


# Windows
## 根据 confignode_id 移除节点
.\sbin\remove-confignode.bat <confignode_id>

## 根据 ConfigNode 内部通讯地址和端口移除节点
.\sbin\remove-confignode.bat <cn_internal_address>:<cn_internal_port>
```

##### 移除 DataNode

在移除 DataNode 前，请确保移除后集群至少还有不少于（数据/元数据）副本个数的 DataNode。
在活跃的 DataNode 上执行 remove-datanode 脚本：

```
# Linux
## 根据 datanode_id 移除节点
./sbin/remove-datanode.sh <datanode_id>

## 根据 DataNode RPC 服务地址和端口移除节点
./sbin/remove-datanode.sh <dn_rpc_address>:<dn_rpc_port>


# Windows
## 根据 datanode_id 移除节点
.\sbin\remove-datanode.bat <datanode_id>

## 根据 DataNode RPC 服务地址和端口移除节点
.\sbin\remove-datanode.bat <dn_rpc_address>:<dn_rpc_port>
```

### 常见问题

请参考 [分布式部署FAQ](https://iotdb.apache.org/zh/UserGuide/Master/FAQ/FAQ-for-cluster-setup.html)