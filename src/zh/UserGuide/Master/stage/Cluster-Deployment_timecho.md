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

## 集群版部署（使用集群管理工具）

IoTDB 集群管理工具是一款易用的运维工具（企业版工具）。旨在解决 IoTDB 分布式系统多节点的运维难题，主要包括集群部署、集群启停、弹性扩容、配置更新、数据导出等功能，从而实现对复杂数据库集群的一键式指令下发，
极大降低管理难度。本文档将说明如何用集群管理工具远程部署、配置、启动和停止 IoTDB 集群实例。

### 环境准备

本工具为 TimechoDB（基于IoTDB的企业版数据库）配套工具，您可以联系您的销售获取工具下载方式。

IoTDB 要部署的机器需要依赖jdk 8及以上版本、lsof、netstat、unzip功能如果没有请自行安装，可以参考文档最后的一节环境所需安装命令。

提示:IoTDB集群管理工具需要使用有root权限的账号

### 部署方法

#### 下载安装

本工具为TimechoDB（基于IoTDB的企业版数据库）配套工具，您可以联系您的销售获取工具下载方式。

注意：由于二进制包仅支持GLIBC2.17 及以上版本，因此最低适配Centos7版本

* 在iotdbctl目录内输入以下指令后：

```bash
bash install-iotdbctl.sh
```

即可在之后的 shell 内激活 iotdbctl 关键词，如检查部署前所需的环境指令如下所示：

```bash
iotdbctl cluster check example
```

* 也可以不激活iotd直接使用  &lt;iotdbctl absolute path&gt;/sbin/iotdbctl 来执行命令，如检查部署前所需的环境：

```bash
<iotdbctl absolute path>/sbin/iotdbctl cluster check example
```

### 系统结构

IoTDB集群管理工具主要由config、logs、doc、sbin目录组成。

* `config`存放要部署的集群配置文件如果要使用集群部署工具需要修改里面的yaml文件。

* `logs` 存放部署工具日志，如果想要查看部署工具执行日志请查看`logs/iotd_yyyy_mm_dd.log`。

* `sbin` 存放集群部署工具所需的二进制包。

* `doc` 存放用户手册、开发手册和推荐部署手册。

### 集群配置文件介绍

* 在`iotdbctl/config` 目录下有集群配置的yaml文件，yaml文件名字就是集群名字yaml 文件可以有多个，为了方便用户配置yaml文件在iotd/config目录下面提供了`default_cluster.yaml`示例。
* yaml 文件配置由`global`、`confignode_servers`、`datanode_servers`、`grafana_server`、`prometheus_server`四大部分组成
* global 是通用配置主要配置机器用户名密码、IoTDB本地安装文件、Jdk配置等。在`iotdbctl/config`目录中提供了一个`default_cluster.yaml`样例数据，
  用户可以复制修改成自己集群名字并参考里面的说明进行配置IoTDB集群，在`default_cluster.yaml`样例中没有注释的均为必填项，已经注释的为非必填项。

例如要执行`default_cluster.yaml`检查命令则需要执行命令`iotdbctl cluster check default_cluster`即可，
更多详细命令请参考下面命令列表。


| 参数                      | 说明                                                                                                                                                                          | 是否必填 |
|-------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------|
| `iotdb_zip_dir`         | IoTDB 部署分发目录，如果值为空则从`iotdb_download_url`指定地址下载                                                                                                                              | 非必填  |
| `iotdb_download_url`    | IoTDB 下载地址，如果`iotdb_zip_dir` 没有值则从指定地址下载                                                                                                                                    | 非必填  |
| `jdk_tar_dir`           | jdk 本地目录，可使用该 jdk 路径进行上传部署至目标节点。                                                                                                                                            | 非必填  |
| `jdk_deploy_dir`        | jdk 远程机器部署目录，会将 jdk 部署到该目录下面，与下面的`jdk_dir_name`参数构成完整的jdk部署目录即 `<jdk_deploy_dir>/<jdk_dir_name>`                                                                            | 非必填  |
| `jdk_dir_name`          | jdk 解压后的目录名称默认是jdk_iotdb                                                                                                                                                    | 非必填  |
| `iotdb_lib_dir`         | IoTDB lib 目录或者IoTDB 的lib 压缩包仅支持.zip格式 ，仅用于IoTDB升级，默认处于注释状态，如需升级请打开注释修改路径即可。如果使用zip文件请使用zip 命令压缩iotdb/lib目录例如 zip -r lib.zip apache\-iotdb\-1.2.0/lib/*                      | 非必填  |
| `user`                    | ssh登陆部署机器的用户名                                                                                                                                                               | 必填   |
| `password`                | ssh登录的密码, 如果password未指定使用pkey登陆, 请确保已配置节点之间ssh登录免密钥                                                                                                                         | 非必填  |
| `pkey`                    | 密钥登陆如果password有值优先使用password否则使用pkey登陆                                                                                                                                      | 非必填  |
| `ssh_port`               | ssh登录端口                                                                                                                                                                     | 必填   |
| `deploy_dir`             | IoTDB 部署目录，会把 IoTDB 部署到该目录下面与下面的`iotdb_dir_name`参数构成完整的IoTDB 部署目录即 `<deploy_dir>/<iotdb_dir_name>`                                                                          | 必填   |
| `iotdb_dir_name`        | IoTDB 解压后的目录名称默认是iotdb                                                                                                                                                      | 非必填  |
| `datanode-env.sh`         | 对应`iotdb/config/datanode-env.sh`   ,在`global`与`confignode_servers`同时配置值时优先使用`confignode_servers`中的值                                                                         | 非必填  |
| `confignode-env.sh`       | 对应`iotdb/config/confignode-env.sh`,在`global`与`datanode_servers`同时配置值时优先使用`datanode_servers`中的值                                                                              | 非必填  |
| `iotdb-common.properties` | 对应`iotdb/config/iotdb-common.properties`                                                                                                                                    | 非必填  |
| `cn_seed_config_node`  | 集群配置地址指向存活的ConfigNode,默认指向confignode_x，在`global`与`confignode_servers`同时配置值时优先使用`confignode_servers`中的值，对应`iotdb/config/iotdb-confignode.properties`中的`cn_seed_config_node` | 必填   |
| `dn_seed_config_node`  | 集群配置地址指向存活的ConfigNode,默认指向confignode_x，在`global`与`datanode_servers`同时配置值时优先使用`datanode_servers`中的值，对应`iotdb/config/iotdb-datanode.properties`中的`dn_seed_config_node`       | 必填   |

其中 `datanode-env.sh` 和 `confignode-env.sh` 可以配置额外参数`extra_opts`，当该参数配置后会在`datanode-env.sh` 和`confignode-env.sh` 后面追加对应的值，可参考`default_cluster.yaml`，配置示例如下:
``` yaml
datanode-env.sh: 
  extra_opts: |
  IOTDB_JMX_OPTS="$IOTDB_JMX_OPTS -XX:+UseG1GC"
  IOTDB_JMX_OPTS="$IOTDB_JMX_OPTS -XX:MaxGCPauseMillis=200"
```

* confignode_servers 是部署IoTDB Confignodes配置，里面可以配置多个Confignode
  默认将第一个启动的ConfigNode节点node1当作Seed-ConfigNode

| 参数                          | 说明                                                                                                                                                                         | 是否必填 |
|-----------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------|
| `name`                        | Confignode 名称                                                                                                                                                              | 必填   |
| `deploy_dir`                 | IoTDB config node 部署目录                                                                                                                                                     | 必填｜  |
| `iotdb-confignode.properties` | 对应`iotdb/config/iotdb-confignode.properties`更加详细请参看`iotdb-confignode.properties`文件说明                                                                                       | 非必填  |
| `cn_internal_address`       | 对应iotdb/内部通信地址，对应`iotdb/config/iotdb-confignode.properties`中的`cn_internal_address`                                                                                         | 必填   |
| `cn_seed_config_node`      | 集群配置地址指向存活的ConfigNode,默认指向confignode_x，在`global`与`confignode_servers`同时配置值时优先使用`confignode_servers`中的值，对应`iotdb/config/iotdb-confignode.properties`中的`cn_seed_config_node` | 必填   |
| `cn_internal_port`          | 内部通信端口，对应`iotdb/config/iotdb-confignode.properties`中的`cn_internal_port`                                                                                                    | 必填   |
| `cn_consensus_port`         | 对应`iotdb/config/iotdb-confignode.properties`中的`cn_consensus_port`                                                                                                          | 非必填  |
| `cn_data_dir`               | 对应`iotdb/config/iotdb-confignode.properties`中的`cn_data_dir`                                                                                                                | 必填   |
| `iotdb-common.properties`     | 对应`iotdb/config/iotdb-common.properties`在`global`与`confignode_servers`同时配置值优先使用confignode_servers中的值                                                                      | 非必填  |

* datanode_servers 是部署IoTDB Datanodes配置，里面可以配置多个Datanode

| 参数                        | 说明                                                                                                                                                                   |是否必填|
|---------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|--- |
| name                      | Datanode 名称                                                                                                                                                          |必填|
| `deploy_dir`               | IoTDB data node 部署目录                                                                                                                                                 |必填|
| `iotdb-datanode.properties` | 对应`iotdb/config/iotdb-datanode.properties`更加详细请参看`iotdb-datanode.properties`文件说明                                                                                     |非必填|
| `dn_rpc_address`          | datanode rpc 地址对应`iotdb/config/iotdb-datanode.properties`中的`dn_rpc_address`                                                                                          |必填|
| `dn_internal_address`     | 内部通信地址，对应`iotdb/config/iotdb-datanode.properties`中的`dn_internal_address`                                                                                             |必填|
| `dn_seed_config_node`    | 集群配置地址指向存活的ConfigNode,默认指向confignode_x，在`global`与`datanode_servers`同时配置值时优先使用`datanode_servers`中的值，对应`iotdb/config/iotdb-datanode.properties`中的`dn_seed_config_node` |必填|
| `dn_rpc_port`             | datanode rpc端口地址，对应`iotdb/config/iotdb-datanode.properties`中的`dn_rpc_port`                                                                                           |必填|
| `dn_internal_port`        | 内部通信端口，对应`iotdb/config/iotdb-datanode.properties`中的`dn_internal_port`                                                                                                |必填|
| `iotdb-common.properties`   | 对应`iotdb/config/iotdb-common.properties`在`global`与`datanode_servers`同时配置值优先使用`datanode_servers`中的值                                                                   |非必填|

* grafana_server 是部署Grafana 相关配置

| 参数                 | 说明               | 是否必填              |
|--------------------|------------------|-------------------|
| `grafana_dir_name` | grafana 解压目录名称   | 非必填默认grafana_iotdb |
| `host`               | grafana 部署的服务器ip | 必填                |
| `grafana_port`      | grafana 部署机器的端口  | 非必填，默认3000        |
| `deploy_dir`        | grafana 部署服务器目录  | 必填                |
| `grafana_tar_dir`  | grafana 压缩包位置    | 必填                |
| `dashboards`         | dashboards 所在的位置 | 非必填,多个用逗号隔开       |

* prometheus_server 是部署Prometheus 相关配置

| 参数                             | 说明               | 是否必填                  |
|--------------------------------|------------------|-----------------------|
| `prometheus_dir_name`           | prometheus 解压目录名称   | 非必填默认prometheus_iotdb |
| `host`                           | prometheus 部署的服务器ip | 必填                    |
| `prometheus_port`               | prometheus 部署机器的端口  | 非必填，默认9090            |
| `deploy_dir`                    | prometheus 部署服务器目录  | 必填                    |
| `prometheus_tar_dir`           | prometheus 压缩包位置    | 必填                    |
| `storage_tsdb_retention_time` | 默认保存数据天数 默认15天    | 非必填                   |
| `storage_tsdb_retention_size` | 指定block可以保存的数据大小 ，注意单位KB, MB, GB, TB, PB, EB    | 非必填                   |

如果在config/xxx.yaml的`iotdb-datanode.properties`和`iotdb-confignode.properties`中配置了metrics,则会自动把配置放入到promethues无需手动修改

注意:如何配置yaml key对应的值包含特殊字符如:等建议整个value使用双引号，对应的文件路径中不要使用包含空格的路径，防止出现识别出现异常问题。

### 使用场景

#### 清理数据场景

* 清理集群数据场景会删除IoTDB集群中的data目录以及yaml文件中配置的`cn_system_dir`、`cn_consensus_dir`、
  `dn_data_dirs`、`dn_consensus_dir`、`dn_system_dir`、`logs`和`ext`目录。
* 首先执行停止集群命令、然后在执行集群清理命令。
```bash
iotdbctl cluster stop default_cluster
iotdbctl cluster clean default_cluster
```

#### 集群销毁场景

* 集群销毁场景会删除IoTDB集群中的`data`、`cn_system_dir`、`cn_consensus_dir`、
  `dn_data_dirs`、`dn_consensus_dir`、`dn_system_dir`、`logs`、`ext`、`IoTDB`部署目录、
  grafana部署目录和prometheus部署目录。
* 首先执行停止集群命令、然后在执行集群销毁命令。


```bash
iotdbctl cluster stop default_cluster
iotdbctl cluster destroy default_cluster
```

#### 集群升级场景

* 集群升级首先需要在config/xxx.yaml中配置`iotdb_lib_dir`为要上传到服务器的jar所在目录路径（例如iotdb/lib）。
* 如果使用zip文件上传请使用zip 命令压缩iotdb/lib目录例如 zip -r lib.zip apache-iotdb-1.2.0/lib/*
* 执行上传命令、然后执行重启IoTDB集群命令即可完成集群升级

```bash
iotdbctl cluster upgrade default_cluster
iotdbctl cluster restart default_cluster
```

#### 集群配置文件的热部署场景

* 首先修改在config/xxx.yaml中配置。
* 执行分发命令、然后执行热部署命令即可完成集群配置的热部署

```bash
iotdbctl cluster distribute default_cluster
iotdbctl cluster reload default_cluster
```

#### 集群扩容场景

* 首先修改在config/xxx.yaml中添加一个datanode 或者confignode 节点。
* 执行集群扩容命令
```bash
iotdbctl cluster scaleout default_cluster
```

#### 集群缩容场景

* 首先在config/xxx.yaml中找到要缩容的节点名字或者ip+port（其中confignode port 是cn_internal_port、datanode port 是rpc_port）
* 执行集群缩容命令
```bash
iotdbctl cluster scalein default_cluster
```

#### 已有IoTDB集群，使用集群部署工具场景

* 配置服务器的`user`、`passwod`或`pkey`、`ssh_port`
* 修改config/xxx.yaml中IoTDB 部署路径，`deploy_dir`（IoTDB 部署目录）、`iotdb_dir_name`(IoTDB解压目录名称,默认是iotdb)
  例如IoTDB 部署完整路径是`/home/data/apache-iotdb-1.1.1`则需要修改yaml文件`deploy_dir:/home/data/`、`iotdb_dir_name:apache-iotdb-1.1.1`
* 如果服务器不是使用的java_home则修改`jdk_deploy_dir`(jdk 部署目录)、`jdk_dir_name`(jdk解压后的目录名称,默认是jdk_iotdb)，如果使用的是java_home 则不需要修改配置
  例如jdk部署完整路径是`/home/data/jdk_1.8.2`则需要修改yaml文件`jdk_deploy_dir:/home/data/`、`jdk_dir_name:jdk_1.8.2`
* 配置`cn_seed_config_node`、`dn_seed_config_node`
* 配置`confignode_servers`中`iotdb-confignode.properties`里面的`cn_internal_address`、`cn_internal_port`、`cn_consensus_port`、`cn_system_dir`、
  `cn_consensus_dir`和`iotdb-common.properties`里面的值不是IoTDB默认的则需要配置否则可不必配置
* 配置`datanode_servers`中`iotdb-datanode.properties`里面的`dn_rpc_address`、`dn_internal_address`、`dn_data_dirs`、`dn_consensus_dir`、`dn_system_dir`和`iotdb-common.properties`等
* 执行初始化命令

```bash
iotdbctl cluster init default_cluster
```

#### 一键部署IoTDB、Grafana和Prometheus 场景

* 配置`iotdb-datanode.properties` 、`iotdb-confignode.properties` 打开metrics接口
* 配置Grafana 配置，如果`dashboards` 有多个就用逗号隔开，名字不能重复否则会被覆盖。
* 配置Prometheus配置，IoTDB 集群配置了metrics 则无需手动修改Prometheus 配置会根据哪个节点配置了metrics，自动修改Prometheus 配置。
* 启动集群

```bash
iotdbctl cluster start default_cluster
```

更加详细参数请参考上方的 集群配置文件介绍


### 命令格式

本工具的基本用法为：
```bash
iotdbctl cluster <key> <cluster name> [params (Optional)]
```
* key 表示了具体的命令。

* cluster name 表示集群名称(即`iotdbctl/config` 文件中yaml文件名字)。

* params 表示了命令的所需参数(选填)。

* 例如部署default_cluster集群的命令格式为：

```bash
iotdbctl cluster deploy default_cluster
```

* 集群的功能及参数列表如下：

| 命令         | 功能                         | 参数                                                                                                                      |
|------------|----------------------------|-------------------------------------------------------------------------------------------------------------------------|
| check      | 检测集群是否可以部署                 | 集群名称列表                                                                                                                  |
| clean      | 清理集群                       | 集群名称                                                                                                                    |
| deploy     | 部署集群                       | 集群名称 ,-N,模块名称(iotdb、grafana、prometheus可选),-op force(可选)                                                                 |
| list       | 打印集群及状态列表                  | 无                                                                                                                       |
| start      | 启动集群                       | 集群名称,-N,节点名称(nodename、grafana、prometheus可选)                                                                                               |
| stop       | 关闭集群                       | 集群名称,-N,节点名称(nodename、grafana、prometheus可选) ,-op force(nodename、grafana、prometheus可选)                                                                                         |
| restart    | 重启集群                       | 集群名称,-N,节点名称(nodename、grafana、prometheus可选),-op force(nodename、grafana、prometheus可选)                                                                                          |
| show       | 查看集群信息，details字段表示展示集群信息细节 | 集群名称, details(可选)                                                                                                       |
| destroy    | 销毁集群                       | 集群名称,-N,模块名称(iotdb、grafana、prometheus可选)                                                                                |
| scaleout   | 集群扩容                       | 集群名称                                                                                                                    |
| scalein    | 集群缩容                       | 集群名称，-N，集群节点名字或集群节点ip+port                                                                                              |
| reload     | 集群热加载                      | 集群名称                                                                                                                    |
| distribute | 集群配置文件分发                   | 集群名称                                                                                                                    |
| dumplog    | 备份指定集群日志                   | 集群名称,-N,集群节点名字 -h 备份至目标机器ip -pw 备份至目标机器密码 -p 备份至目标机器端口 -path 备份的目录 -startdate 起始时间 -enddate 结束时间 -loglevel 日志类型 -l 传输速度 |
| dumpdata   | 备份指定集群数据                   | 集群名称, -h 备份至目标机器ip -pw 备份至目标机器密码 -p 备份至目标机器端口 -path 备份的目录 -startdate 起始时间 -enddate 结束时间  -l 传输速度                        |
| upgrade    | lib 包升级                    | 集群名字(升级完后请重启)                                                                                                           |
| init       | 已有集群使用集群部署工具时，初始化集群配置      | 集群名字，初始化集群配置                                                                                                            |
| status     | 查看进程状态                     | 集群名字                                                                                                                    |
| acitvate   | 激活集群                       | 集群名字                                                                                                                    |
### 详细命令执行过程

下面的命令都是以default_cluster.yaml 为示例执行的，用户可以修改成自己的集群文件来执行

#### 检查集群部署环境命令

```bash
iotdbctl cluster check default_cluster
```

* 根据 cluster-name 找到默认位置的 yaml 文件，获取`confignode_servers`和`datanode_servers`配置信息

* 验证目标节点是否能够通过 SSH 登录

* 验证对应节点上的 JDK 版本是否满足IoTDB jdk1.8及以上版本、服务器是否按照unzip、是否安装lsof 或者netstat

* 如果看到下面提示`Info:example check successfully!` 证明服务器已经具备安装的要求，
  如果输出`Error:example check fail!` 证明有部分条件没有满足需求可以查看上面的输出的Error日志(例如:`Error:Server (ip:172.20.31.76) iotdb port(10713) is listening`)进行修复，
  如果检查jdk没有满足要求，我们可以自己在yaml 文件中配置一个jdk1.8 及以上版本的进行部署不影响后面使用，
  如果检查lsof、netstat或者unzip 不满足要求需要在服务器上自行安装。

#### 部署集群命令

```bash
iotdbctl cluster deploy default_cluster
```

* 根据 cluster-name 找到默认位置的 yaml 文件，获取`confignode_servers`和`datanode_servers`配置信息

* 根据`confignode_servers` 和`datanode_servers`中的节点信息上传IoTDB压缩包和jdk压缩包(如果yaml中配置`jdk_tar_dir`和`jdk_deploy_dir`值)

* 根据yaml文件节点配置信息生成并上传`iotdb-common.properties`、`iotdb-confignode.properties`、`iotdb-datanode.properties`

```bash
iotdbctl cluster deploy default_cluster -op force
```
注意：该命令会强制执行部署，具体过程会删除已存在的部署目录重新部署

*部署单个模块*
```bash
# 部署grafana模块
iotdbctl cluster deploy default_cluster -N grafana
# 部署prometheus模块
iotdbctl cluster deploy default_cluster -N prometheus
# 部署iotdb模块
iotdbctl cluster deploy default_cluster -N iotdb
```

#### 启动集群命令

```bash
iotdbctl cluster start default_cluster
```

* 根据 cluster-name 找到默认位置的 yaml 文件，获取`confignode_servers`和`datanode_servers`配置信息

* 启动confignode，根据yaml配置文件中`confignode_servers`中的顺序依次启动同时根据进程id检查confignode是否正常，第一个confignode 为seek config

* 启动datanode，根据yaml配置文件中`datanode_servers`中的顺序依次启动同时根据进程id检查datanode是否正常

* 如果根据进程id检查进程存在后，通过cli依次检查集群列表中每个服务是否正常，如果cli链接失败则每隔10s重试一次直到成功最多重试5次


*启动单个节点命令*
```bash
#按照IoTDB 节点名称启动
iotdbctl cluster start default_cluster -N datanode_1
#按照IoTDB 集群ip+port启动，其中port对应confignode的cn_internal_port、datanode的rpc_port
iotdbctl cluster start default_cluster -N 192.168.1.5:6667
#启动grafana
iotdbctl cluster start default_cluster -N grafana
#启动prometheus
iotdbctl cluster start default_cluster -N prometheus
```

* 根据 cluster-name 找到默认位置的 yaml 文件

* 根据提供的节点名称或者ip:port找到对于节点位置信息,如果启动的节点是`data_node`则ip使用yaml 文件中的`dn_rpc_address`、port 使用的是yaml文件中datanode_servers 中的`dn_rpc_port`。
  如果启动的节点是`config_node`则ip使用的是yaml文件中confignode_servers 中的`cn_internal_address` 、port 使用的是`cn_internal_port`

* 启动该节点

说明：由于集群部署工具仅是调用了IoTDB集群中的start-confignode.sh和start-datanode.sh 脚本，
在实际输出结果失败时有可能是集群还未正常启动，建议使用status命令进行查看当前集群状态(iotdbctl cluster status xxx)


#### 查看IoTDB集群状态命令

```bash
iotdbctl cluster show default_cluster
#查看IoTDB集群详细信息
iotdbctl cluster show default_cluster details
```
* 根据 cluster-name 找到默认位置的 yaml 文件，获取`confignode_servers`和`datanode_servers`配置信息

* 依次在datanode通过cli执行`show cluster details` 如果有一个节点执行成功则不会在后续节点继续执行cli直接返回结果


#### 停止集群命令


```bash
iotdbctl cluster stop default_cluster
```
* 根据 cluster-name 找到默认位置的 yaml 文件，获取`confignode_servers`和`datanode_servers`配置信息

* 根据`datanode_servers`中datanode节点信息，按照配置先后顺序依次停止datanode节点

* 根据`confignode_servers`中confignode节点信息，按照配置依次停止confignode节点

*强制停止集群命令*

```bash
iotdbctl cluster stop default_cluster -op force
```
会直接执行kill -9 pid 命令强制停止集群

*停止单个节点命令*

```bash
#按照IoTDB 节点名称停止
iotdbctl cluster stop default_cluster -N datanode_1
#按照IoTDB 集群ip+port停止(ip+port是按照datanode中的ip+dn_rpc_port获取唯一节点或confignode中的ip+cn_internal_port获取唯一节点)
iotdbctl cluster stop default_cluster -N 192.168.1.5:6667
#停止grafana
iotdbctl cluster stop default_cluster -N grafana
#停止prometheus
iotdbctl cluster stop default_cluster -N prometheus
```

* 根据 cluster-name 找到默认位置的 yaml 文件

* 根据提供的节点名称或者ip:port找到对应节点位置信息，如果停止的节点是`data_node`则ip使用yaml 文件中的`dn_rpc_address`、port 使用的是yaml文件中datanode_servers 中的`dn_rpc_port`。
  如果停止的节点是`config_node`则ip使用的是yaml文件中confignode_servers 中的`cn_internal_address` 、port 使用的是`cn_internal_port`

* 停止该节点

说明：由于集群部署工具仅是调用了IoTDB集群中的stop-confignode.sh和stop-datanode.sh 脚本，在某些情况下有可能iotdb集群并未停止。


#### 清理集群数据命令

```bash
iotdbctl cluster clean default_cluster
```

* 根据 cluster-name 找到默认位置的 yaml 文件，获取`confignode_servers`、`datanode_servers`配置信息

* 根据`confignode_servers`、`datanode_servers`中的信息，检查是否还有服务正在运行，
  如果有任何一个服务正在运行则不会执行清理命令

* 删除IoTDB集群中的data目录以及yaml文件中配置的`cn_system_dir`、`cn_consensus_dir`、
  `dn_data_dirs`、`dn_consensus_dir`、`dn_system_dir`、`logs`和`ext`目录。



#### 重启集群命令

```bash
iotdbctl cluster restart default_cluster
```
* 根据 cluster-name 找到默认位置的 yaml 文件，获取`confignode_servers`、`datanode_servers`、`grafana`、`prometheus`配置信息

* 执行上述的停止集群命令(stop),然后执行启动集群命令(start) 具体参考上面的start 和stop 命令

*强制重启集群命令*

```bash
iotdbctl cluster restart default_cluster -op force
```
会直接执行kill -9 pid 命令强制停止集群，然后启动集群

*重启单个节点命令*

```bash
#按照IoTDB 节点名称重启datanode_1
iotdbctl cluster restart default_cluster -N datanode_1
#按照IoTDB 节点名称重启confignode_1
iotdbctl cluster restart default_cluster -N confignode_1
#重启grafana
iotdbctl cluster restart default_cluster -N grafana
#重启prometheus
iotdbctl cluster restart default_cluster -N prometheus
```

#### 集群缩容命令

```bash
#按照节点名称缩容
iotdbctl cluster scalein default_cluster -N nodename
#按照ip+port缩容(ip+port按照datanode中的ip+dn_rpc_port获取唯一节点，confignode中的ip+cn_internal_port获取唯一节点)
iotdbctl cluster scalein default_cluster -N ip:port
```
* 根据 cluster-name 找到默认位置的 yaml 文件，获取`confignode_servers`和`datanode_servers`配置信息

* 判断要缩容的confignode节点和datanode是否只剩一个，如果只剩一个则不能执行缩容

* 然后根据ip:port或者nodename 获取要缩容的节点信息，执行缩容命令，然后销毁该节点目录，如果缩容的节点是`data_node`则ip使用yaml 文件中的`dn_rpc_address`、port 使用的是yaml文件中datanode_servers 中的`dn_rpc_port`。
  如果缩容的节点是`config_node`则ip使用的是yaml文件中confignode_servers 中的`cn_internal_address` 、port 使用的是`cn_internal_port`


提示：目前一次仅支持一个节点缩容

#### 集群扩容命令

```bash
iotdbctl cluster scaleout default_cluster
```
* 修改config/xxx.yaml 文件添加一个datanode 节点或者confignode节点

* 根据 cluster-name 找到默认位置的 yaml 文件，获取`confignode_servers`和`datanode_servers`配置信息

* 找到要扩容的节点，执行上传IoTDB压缩包和jdb包(如果yaml中配置`jdk_tar_dir`和`jdk_deploy_dir`值)并解压

* 根据yaml文件节点配置信息生成并上传`iotdb-common.properties`、`iotdb-confignode.properties`或`iotdb-datanode.properties`

* 执行启动该节点命令并校验节点是否启动成功

提示：目前一次仅支持一个节点扩容

#### 销毁集群命令
```bash
iotdbctl cluster destroy default_cluster
```

* cluster-name 找到默认位置的 yaml 文件

* 根据`confignode_servers`、`datanode_servers`、`grafana`、`prometheus`中node节点信息，检查是否节点还在运行，
  如果有任何一个节点正在运行则停止销毁命令

* 删除IoTDB集群中的`data`以及yaml文件配置的`cn_system_dir`、`cn_consensus_dir`、
  `dn_data_dirs`、`dn_consensus_dir`、`dn_system_dir`、`logs`、`ext`、`IoTDB`部署目录、
  grafana部署目录和prometheus部署目录

*销毁单个模块*
```bash
# 销毁grafana模块
iotdbctl cluster destroy default_cluster -N grafana
# 销毁prometheus模块
iotdbctl cluster destroy default_cluster -N prometheus
# 销毁iotdb模块
iotdbctl cluster destroy default_cluster -N iotdb
```

#### 分发集群配置命令
```bash
iotdbctl cluster distribute default_cluster
```

* 根据 cluster-name 找到默认位置的 yaml 文件，获取`confignode_servers`、`datanode_servers`、`grafana`、`prometheus`配置信息

* 根据yaml文件节点配置信息生成并依次上传`iotdb-common.properties`、`iotdb-confignode.properties`、`iotdb-datanode.properties`、到指定节点

#### 热加载集群配置命令
```bash
iotdbctl cluster reload default_cluster
```
* 根据 cluster-name 找到默认位置的 yaml 文件，获取`confignode_servers`和`datanode_servers`配置信息

* 根据yaml文件节点配置信息依次在cli中执行`load configuration`

#### 集群节点日志备份
```bash
iotdbctl cluster dumplog default_cluster -N datanode_1,confignode_1  -startdate '2023-04-11' -enddate '2023-04-26' -h 192.168.9.48 -p 36000 -u root -pw root -path '/iotdb/logs' -logs '/root/data/db/iotdb/logs'
```
* 根据 cluster-name 找到默认位置的 yaml 文件

* 该命令会根据yaml文件校验datanode_1,confignode_1 是否存在，然后根据配置的起止日期(startdate&lt;=logtime&lt;=enddate)备份指定节点datanode_1,confignode_1 的日志数据到指定服务`192.168.9.48` 端口`36000` 数据备份路径是 `/iotdb/logs` ，IoTDB日志存储路径在`/root/data/db/iotdb/logs`(非必填，如果不填写-logs xxx 默认从IoTDB安装路径/logs下面备份日志)

| 命令         | 功能                                 | 是否必填 |
|------------|------------------------------------| ---|
| -h         | 存放备份数据机器ip                         |否|
| -u         | 存放备份数据机器用户名                        |否|
| -pw        | 存放备份数据机器密码                         |否|
| -p         | 存放备份数据机器端口(默认22)                   |否|
| -path      | 存放备份数据的路径(默认当前路径)                  |否|
| -loglevel  | 日志基本有all、info、error、warn(默认是全部)    |否|
| -l         | 限速(默认不限速范围0到104857601 单位Kbit/s)    |否|
| -N         | 配置文件集群名称多个用逗号隔开                    |是|
| -startdate | 起始时间(包含默认1970-01-01)               |否|
| -enddate   | 截止时间(包含)                           |否|
| -logs      | IoTDB 日志存放路径，默认是（{iotdb}/logs） |否|

#### 集群节点数据备份
```bash
iotdbctl cluster dumpdata default_cluster -granularity partition  -startdate '2023-04-11' -enddate '2023-04-26' -h 192.168.9.48 -p 36000 -u root -pw root -path '/iotdb/datas'
```
* 该命令会根据yaml文件获取leader 节点，然后根据起止日期(startdate&lt;=logtime&lt;=enddate)备份数据到192.168.9.48 服务上的/iotdb/datas 目录下

| 命令   | 功能                              | 是否必填 |
| ---|---------------------------------| ---|
|-h| 存放备份数据机器ip                      |否|
|-u| 存放备份数据机器用户名                     |否|
|-pw| 存放备份数据机器密码                      |否|
|-p| 存放备份数据机器端口(默认22)                |否|
|-path| 存放备份数据的路径(默认当前路径)               |否|
|-granularity| 类型partition                     |是|
|-l| 限速(默认不限速范围0到104857601 单位Kbit/s) |否|
|-startdate| 起始时间(包含)                        |是|
|-enddate| 截止时间(包含)                        |是|

#### 集群升级
```bash
iotdbctl cluster upgrade default_cluster
```
* 根据 cluster-name 找到默认位置的 yaml 文件，获取`confignode_servers`和`datanode_servers`配置信息

* 上传lib包

注意执行完升级后请重启IoTDB 才能生效

#### 集群初始化
```bash
iotdbctl cluster init default_cluster
```
* 根据 cluster-name 找到默认位置的 yaml 文件，获取`confignode_servers`、`datanode_servers`、`grafana`、`prometheus`配置信息
* 初始化集群配置

#### 查看集群进程状态
```bash
iotdbctl cluster status default_cluster
```
* 根据 cluster-name 找到默认位置的 yaml 文件，获取`confignode_servers`、`datanode_servers`、`grafana`、`prometheus`配置信息
* 展示集群的存活状态

#### 集群授权激活

集群激活默认是通过输入激活码激活，也可以通过-op license_path 通过license路径激活

* 默认激活方式
```bash
iotdbctl cluster activate default_cluster
```
* 根据 cluster-name 找到默认位置的 yaml 文件，获取`confignode_servers`配置信息
* 读取里面的机器码
* 等待输入激活码

```bash
Machine code:
Kt8NfGP73FbM8g4Vty+V9qU5lgLvwqHEF3KbLN/SGWYCJ61eFRKtqy7RS/jw03lHXt4MwdidrZJ==
JHQpXu97IKwv3rzbaDwoPLUuzNCm5aEeC9ZEBW8ndKgGXEGzMms25+u==
Please enter the activation code: 
JHQpXu97IKwv3rzbaDwoPLUuzNCm5aEeC9ZEBW8ndKg=，lTF1Dur1AElXIi/5jPV9h0XCm8ziPd9/R+tMYLsze1oAPxE87+Nwws=
Activation successful
```
* 激活单个节点

```bash
iotdbctl cluster activate default_cluster -N confignode1
```

* 通过license路径方式激活

```bash
iotdbctl cluster activate default_cluster -op license_path 
```
* 根据 cluster-name 找到默认位置的 yaml 文件，获取`confignode_servers`配置信息
* 读取里面的机器码
* 等待输入激活码

```bash
Machine code:
Kt8NfGP73FbM8g4Vty+V9qU5lgLvwqHEF3KbLN/SGWYCJ61eFRKtqy7RS/jw03lHXt4MwdidrZJ==
JHQpXu97IKwv3rzbaDwoPLUuzNCm5aEeC9ZEBW8ndKgGXEGzMms25+u==
Please enter the activation code: 
JHQpXu97IKwv3rzbaDwoPLUuzNCm5aEeC9ZEBW8ndKg=，lTF1Dur1AElXIi/5jPV9h0XCm8ziPd9/R+tMYLsze1oAPxE87+Nwws=
Activation successful
```
* 激活单个节点

```bash
iotdbctl cluster activate default_cluster -N confignode1 -op license_path
```


### 集群部署工具样例介绍
在集群部署工具安装目录中config/example 下面有3个yaml样例，如果需要可以复制到config 中进行修改即可

| 名称                          | 说明                                             |
|-----------------------------|------------------------------------------------|
| default_1c1d.yaml          | 1个confignode和1个datanode 配置样例                   |
| default_3c3d.yaml          | 3个confignode和3个datanode 配置样例                   |
| default_3c3d_grafa_prome | 3个confignode和3个datanode、Grafana、Prometheus配置样例 |

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

你可以选择下载二进制文件或从源代码编译。

#### 下载二进制文件

1. 打开官网[Download Page](https://iotdb.apache.org/Download/)。
2. 下载 IoTDB 1.3.0 版本的二进制文件。
3. 解压得到 apache-iotdb-1.3.0-all-bin 目录。

#### 使用源码编译

##### 下载源码

**Git**

```
git clone https://github.com/apache/iotdb.git
git checkout v1.3.0
```

**官网下载**

1. 打开官网[Download Page](https://iotdb.apache.org/Download/)。
2. 下载 IoTDB 1.3.0 版本的源码。
3. 解压得到 apache-iotdb-1.3.0 目录。

##### 编译源码

在 IoTDB 源码根目录下:

```
mvn clean package -pl distribution -am -DskipTests
```

编译成功后，可在目录 
**distribution/target/apache-iotdb-1.3.0-all-bin/apache-iotdb-1.3.0-all-bin** 
找到集群版本的二进制文件。

### 安装包说明

打开 apache-iotdb-1.3.0-all-bin，可见以下目录：

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

`apache-iotdb-1.3.0-all-bin` 包含 ConfigNode 和 DataNode，
请将安装包部署于你目标集群的所有机器上，推荐将安装包部署于所有服务器的相同目录下。

如果你希望先在一台服务器上尝试部署 IoTDB 集群，请参考
[Cluster Quick Start](../QuickStart/ClusterQuickStart.md)。

#### 集群配置

接下来需要修改每个服务器上的配置文件，登录服务器，
并将工作路径切换至 `apache-iotdb-1.3.0-all-bin`，
配置文件在 `./conf` 目录内。

对于所有部署 ConfigNode 的服务器，需要修改[通用配置](../Reference/Common-Config-Manual.md)和 [ConfigNode 配置](../Reference/ConfigNode-Config-Manual.md)。

对于所有部署 DataNode 的服务器，需要修改[通用配置](../Reference/Common-Config-Manual.md)和 [DataNode 配置](../Reference/DataNode-Config-Manual.md)。

##### 通用配置

打开通用配置文件 ./conf/iotdb-common.properties，
可根据 [部署推荐](./Deployment-Recommendation.md)
设置以下参数：

| **配置项**                                 | **说明**                                                     | **默认**                                        |
| ------------------------------------------ | ------------------------------------------------------------ | ----------------------------------------------- |
| cluster_name                              | 节点希望加入的集群的名称                                     | defaultCluster                                  |
| config_node_consensus_protocol_class   | ConfigNode 使用的共识协议                                    | org.apache.iotdb.consensus.ratis.RatisConsensus |
| schema_replication_factor                | 元数据副本数，DataNode 数量不应少于此数目                    | 1                                               |
| schema_region_consensus_protocol_class | 元数据副本组的共识协议                                       | org.apache.iotdb.consensus.ratis.RatisConsensus |
| data_replication_factor                  | 数据副本数，DataNode 数量不应少于此数目                      | 1                                               |
| data_region_consensus_protocol_class   | 数据副本组的共识协议。注：RatisConsensus 目前不支持多数据目录 | org.apache.iotdb.consensus.iot.IoTConsensus     |

**注意：上述配置项在集群启动后即不可更改，且务必保证所有节点的通用配置完全一致，否则节点无法启动。**

##### ConfigNode 配置

打开 ConfigNode 配置文件 ./conf/iotdb-confignode.properties，根据服务器/虚拟机的 IP 地址和可用端口，设置以下参数：

| **配置项**                     | **说明**                                                     | **默认**        | **用法**                                                     |
| ------------------------------ | ------------------------------------------------------------ | --------------- | ------------------------------------------------------------ |
| cn_internal_address          | ConfigNode 在集群内部通讯使用的地址                          | 127.0.0.1       | 设置为服务器的 `IP地址`或`hostname(机器名/域名)`                              |
| cn_internal_port             | ConfigNode 在集群内部通讯使用的端口                          | 10710           | 设置为任意未占用端口                                         |
| cn_consensus_port            | ConfigNode 副本组共识协议通信使用的端口                      | 10720           | 设置为任意未占用端口                                         |
| cn_seed_config_node | 节点注册加入集群时连接的 ConfigNode 的地址。注：只能配置一个 | 127.0.0.1:10710 | 对于 Seed-ConfigNode，设置为自己的 cn_internal_address:cn_internal_port；对于其它 ConfigNode，设置为另一个正在运行的 ConfigNode 的 cn_internal_address:cn_internal_port |

**注意：上述配置项在节点启动后即不可更改，且务必保证所有端口均未被占用，否则节点无法启动。**

##### DataNode 配置

打开 DataNode 配置文件 ./conf/iotdb-datanode.properties，根据服务器/虚拟机的 IP 地址和可用端口，设置以下参数：

| **配置项**                          | **说明**                                  | **默认**        | **用法**                                                     |
| ----------------------------------- | ----------------------------------------- | --------------- | ------------------------------------------------------------ |
| dn_rpc_address                    | 客户端 RPC 服务的地址                     | 127.0.0.1       | 设置为服务器的 `IP地址`或`hostname(机器名/域名)`                              |
| dn_rpc_port                       | 客户端 RPC 服务的端口                     | 6667            | 设置为任意未占用端口                                         |
| dn_internal_address               | DataNode 在集群内部接收控制流使用的地址   | 127.0.0.1       | 设置为服务器的 `IP地址`或`hostname(机器名/域名)`                              |
| dn_internal_port                  | DataNode 在集群内部接收控制流使用的端口   | 10730           | 设置为任意未占用端口                                         |
| dn_mpp_data_exchange_port       | DataNode 在集群内部接收数据流使用的端口   | 10740           | 设置为任意未占用端口                                         |
| dn_data_region_consensus_port   | DataNode 的数据副本间共识协议通信的端口   | 10750           | 设置为任意未占用端口                                         |
| dn_schema_region_consensus_port | DataNode 的元数据副本间共识协议通信的端口 | 10760           | 设置为任意未占用端口                                         |
| dn_seed_config_node      | 集群中正在运行的 ConfigNode 地址          | 127.0.0.1:10710 | 设置为任意正在运行的 ConfigNode 的 cn_internal_address:cn_internal_port，可设置多个，用逗号（","）隔开 |

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
| cluster_name                              | 已设置为期望的集群名称     |
| config_node_consensus_protocol_class   | 已设置为期望的共识协议     |
| schema_replication_factor                | 已设置为期望的元数据副本数 |
| schema_region_consensus_protocol_class | 已设置为期望的共识协议     |
| data_replication_factor                  | 已设置为期望的数据副本数   |
| data_region_consensus_protocol_class   | 已设置为期望的共识协议     |

**注意：** 请根据[部署推荐](./Deployment-Recommendation.md)配置合适的通用参数，这些参数在首次配置后即不可修改。

接着请打开它的配置文件 ./conf/iotdb-confignode.properties，并检查如下参数：

| **配置项**                     | **检查**                                                     |
| ------------------------------ | ------------------------------------------------------------ |
| cn_internal_address          | 已设置为服务器的 `IP地址`或`hostname(机器名/域名)`                            |
| cn_internal_port             | 该端口未被占用                                               |
| cn_consensus_port            | 该端口未被占用                                               |
| cn_seed_config_node | 已设置为自己的内部通讯地址，即 cn_internal_address:cn_internal_port |

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
[ConfigNode 配置参数](../Reference/ConfigNode-Config-Manual.md)。

##### 增加更多 ConfigNode（可选）

**只要不是第一个启动的 ConfigNode 就必须遵循本小节教程。**

可向集群添加更多 ConfigNode，以保证 ConfigNode 的高可用。常用的配置为额外增加两个 ConfigNode，使集群共有三个 ConfigNode。

新增的 ConfigNode 需要保证 ./conf/iotdb-common.properites 中的所有配置参数与 Seed-ConfigNode 完全一致，否则可能启动失败或产生运行时错误。
因此，请着重检查通用配置文件中的以下参数：

| **配置项**                                 | **检查**                    |
| ------------------------------------------ | --------------------------- |
| cluster_name                              | 与 Seed-ConfigNode 保持一致 |
| config_node_consensus_protocol_class   | 与 Seed-ConfigNode 保持一致 |
| schema_replication_factor                | 与 Seed-ConfigNode 保持一致 |
| schema_region_consensus_protocol_class | 与 Seed-ConfigNode 保持一致 |
| data_replication_factor                  | 与 Seed-ConfigNode 保持一致 |
| data_region_consensus_protocol_class   | 与 Seed-ConfigNode 保持一致 |

接着请打开它的配置文件 ./conf/iotdb-confignode.properties，并检查以下参数：

| **配置项**                     | **检查**                                                     |
| ------------------------------ | ------------------------------------------------------------ |
| cn_internal_address          | 已设置为服务器的 `IP地址`或`hostname(机器名/域名)`                            |
| cn_internal_port             | 该端口未被占用                                               |
| cn_consensus_port            | 该端口未被占用                                               |
| cn_seed_config_node | 已设置为另一个正在运行的 ConfigNode 的内部通讯地址，推荐使用 Seed-ConfigNode 的内部通讯地址 |

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
[ConfigNode 配置参数](../Reference/ConfigNode-Config-Manual.md)。

##### 增加 DataNode

**确保集群已有正在运行的 ConfigNode 后，才能开始增加 DataNode。**

可以向集群中添加任意个 DataNode。
在添加新的 DataNode 前，请先打开通用配置文件 ./conf/iotdb-common.properties 并检查以下参数：

| **配置项**    | **检查**                    |
| ------------- | --------------------------- |
| cluster_name | 与 Seed-ConfigNode 保持一致 |

接着打开它的配置文件 ./conf/iotdb-datanode.properties 并检查以下参数：

| **配置项**                          | **检查**                                                     |
| ----------------------------------- | ------------------------------------------------------------ |
| dn_rpc_address                    | 已设置为服务器的 `IP地址`或`hostname(机器名/域名)`                            |
| dn_rpc_port                       | 该端口未被占用                                               |
| dn_internal_address               | 已设置为服务器的 `IP地址`或`hostname(机器名/域名)`                            |
| dn_internal_port                  | 该端口未被占用                                               |
| dn_mpp_data_exchange_port       | 该端口未被占用                                               |
| dn_data_region_consensus_port   | 该端口未被占用                                               |
| dn_schema_region_consensus_port | 该端口未被占用                                               |
| dn_seed_config_node      | 已设置为正在运行的 ConfigNode 的内部通讯地址，推荐使用 Seed-ConfigNode 的内部通讯地址 |

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
[DataNode配置参数](../Reference/DataNode-Config-Manual.md) 。

**注意：当且仅当集群拥有不少于副本个数（max{schema_replication_factor, data_replication_factor}）的 DataNode 后，集群才可以提供服务**

#### 启动 Cli

若搭建的集群仅用于本地调试，可直接执行 ./sbin 目录下的 Cli 启动脚本：

```
# Linux
./sbin/start-cli.sh

# Windows
.\sbin\start-cli.bat
```

若希望通过 Cli 连接生产环境的集群，
请阅读 [Cli 使用手册](../Tools-System/CLI.md)。

#### 验证集群

以在6台服务器上启动的3C3D（3个ConfigNode 和 3个DataNode）集群为例，
这里假设3个ConfigNode依次为iotdb-1(192.168.1.10)、iotdb-2(192.168.1.11)、iotdb-3(192.168.1.12)，且3个ConfigNode启动时均使用了默认的端口10710与10720；
3个DataNode依次为iotdb-4(192.168.1.20)、iotdb-5(192.168.1.21)、iotdb-6(192.168.1.22)，且3个DataNode启动时均使用了默认的端口6667、10730、10740、10750与10760。

我们为这六台地址全部设置 hostname
```shell
echo "192.168.132.10 iotdb-1" >> /etc/hosts 
echo "192.168.132.11 iotdb-2" >> /etc/hosts 
echo "192.168.132.12 iotdb-3" >> /etc/hosts 
echo "192.168.132.20 iotdb-4" >> /etc/hosts 
echo "192.168.132.21 iotdb-5" >> /etc/hosts 
echo "192.168.132.22 iotdb-6" >> /etc/hosts 
```

当按照6.1步骤成功启动集群后，在 Cli 执行 `show cluster details`，看到的结果应当如下：

```
IoTDB> show cluster details
+------+----------+-------+---------------+------------+-------------------+----------+-------+-------+-------------------+-----------------+
|NodeID|  NodeType| Status|InternalAddress|InternalPort|ConfigConsensusPort|RpcAddress|RpcPort|MppPort|SchemaConsensusPort|DataConsensusPort|
+------+----------+-------+---------------+------------+-------------------+----------+-------+-------+-------------------+-----------------+
|     0|ConfigNode|Running|    iotdb-1    |       10710|              10720|          |       |       |                   |                 |
|     2|ConfigNode|Running|    iotdb-2    |       10710|              10720|          |       |       |                   |                 |
|     3|ConfigNode|Running|    iotdb-3    |       10710|              10720|          |       |       |                   |                 |
|     1|  DataNode|Running|    iotdb-4    |       10730|                   |   iotdb-4|   6667|  10740|              10750|            10760|
|     4|  DataNode|Running|    iotdb-5    |       10730|                   |   iotdb-5|   6667|  10740|              10750|            10760|
|     5|  DataNode|Running|    iotdb-6    |       10730|                   |   iotdb-6|   6667|  10740|              10750|            10760|
+------+----------+-------+---------------+------------+-------------------+----------+-------+-------+-------------------+-----------------+
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

请参考 [分布式部署FAQ](../FAQ/Frequently-asked-questions.md#分布式部署-faq)
