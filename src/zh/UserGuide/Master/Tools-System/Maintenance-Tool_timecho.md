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

# 运维工具

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
| cn_target_config_node_list | 集群配置地址指向存活的ConfigNode,默认指向confignode_x，在`global`与`confignode_servers`同时配置值时优先使用`confignode_servers`中的值，对应`iotdb/config/iotdb-confignode.properties`中的`cn_target_config_node_list` | 必填     |
| dn_target_config_node_list | 集群配置地址指向存活的ConfigNode,默认指向confignode_x，在`global`与`datanode_servers`同时配置值时优先使用`datanode_servers`中的值，对应`iotdb/config/iotdb-datanode.properties`中的`dn_target_config_node_list` | 必填     |

* confignode_servers 是部署IoTDB Confignodes配置，里面可以配置多个Confignode
    默认将第一个启动的ConfigNode节点node1当作Seed-ConfigNode

| 参数                        | 说明                                                         | 是否必填 |
| --------------------------- | ------------------------------------------------------------ | -------- |
| name                        | Confignode 名称                                              | 必填     |
| deploy_dir                  | IoTDB config node 部署目录，注:该目录不能与下面的IoTDB data node部署目录相同 | 必填｜   |
| iotdb-confignode.properties | 对应`iotdb/config/iotdb-confignode.properties`更加详细请参看`iotdb-confignode.properties`文件说明 | 非必填   |
| cn_internal_address         | 对应iotdb/内部通信地址，对应`iotdb/config/iotdb-confignode.properties`中的`cn_internal_address` | 必填     |
| cn_target_config_node_list  | 集群配置地址指向存活的ConfigNode,默认指向confignode_x，在`global`与`confignode_servers`同时配置值时优先使用`confignode_servers`中的值，对应`iotdb/config/iotdb-confignode.properties`中的`cn_target_config_node_list` | 必填     |
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
| dn_target_config_node_list | 集群配置地址指向存活的ConfigNode,默认指向confignode_x，在`global`与`datanode_servers`同时配置值时优先使用`datanode_servers`中的值，对应`iotdb/config/iotdb-datanode.properties`中的`dn_target_config_node_list` | 必填     |
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

## 数据文件夹概览工具

IoTDB数据文件夹概览工具用于打印出数据文件夹的结构概览信息，工具位置为 tools/tsfile/print-iotdb-data-dir。

### 用法

-   Windows:

```bash
.\print-iotdb-data-dir.bat <IoTDB数据文件夹路径，如果是多个文件夹用逗号分隔> (<输出结果的存储路径>) 
```

-   Linux or MacOs:

```shell
./print-iotdb-data-dir.sh <IoTDB数据文件夹路径，如果是多个文件夹用逗号分隔> (<输出结果的存储路径>)
```

注意：如果没有设置输出结果的存储路径, 将使用相对路径"IoTDB_data_dir_overview.txt"作为默认值。

### 示例

以Windows系统为例：

`````````````````````````bash
.\print-iotdb-data-dir.bat D:\github\master\iotdb\data\datanode\data
````````````````````````
Starting Printing the IoTDB Data Directory Overview
````````````````````````
output save path:IoTDB_data_dir_overview.txt
data dir num:1
143  [main] WARN  o.a.i.t.c.conf.TSFileDescriptor - not found iotdb-common.properties, use the default configs.
|==============================================================
|D:\github\master\iotdb\data\datanode\data
|--sequence
|  |--root.redirect0
|  |  |--1
|  |  |  |--0
|  |--root.redirect1
|  |  |--2
|  |  |  |--0
|  |--root.redirect2
|  |  |--3
|  |  |  |--0
|  |--root.redirect3
|  |  |--4
|  |  |  |--0
|  |--root.redirect4
|  |  |--5
|  |  |  |--0
|  |--root.redirect5
|  |  |--6
|  |  |  |--0
|  |--root.sg1
|  |  |--0
|  |  |  |--0
|  |  |  |--2760
|--unsequence
|==============================================================
`````````````````````````

## TsFile概览工具

TsFile概览工具用于以概要模式打印出一个TsFile的内容，工具位置为 tools/tsfile/print-tsfile。

### 用法

-   Windows:

```bash
.\print-tsfile-sketch.bat <TsFile文件路径> (<输出结果的存储路径>) 
```

-   Linux or MacOs:

```shell
./print-tsfile-sketch.sh <TsFile文件路径> (<输出结果的存储路径>) 
```

注意：如果没有设置输出结果的存储路径, 将使用相对路径"TsFile_sketch_view.txt"作为默认值。

### 示例

以Windows系统为例：

`````````````````````````bash
.\print-tsfile.bat D:\github\master\1669359533965-1-0-0.tsfile D:\github\master\sketch.txt
````````````````````````
Starting Printing the TsFile Sketch
````````````````````````
TsFile path:D:\github\master\1669359533965-1-0-0.tsfile
Sketch save path:D:\github\master\sketch.txt
148  [main] WARN  o.a.i.t.c.conf.TSFileDescriptor - not found iotdb-common.properties, use the default configs.
-------------------------------- TsFile Sketch --------------------------------
file path: D:\github\master\1669359533965-1-0-0.tsfile
file length: 2974

            POSITION|   CONTENT
            --------    -------
                   0|   [magic head] TsFile
                   6|   [version number] 3
||||||||||||||||||||| [Chunk Group] of root.sg1.d1, num of Chunks:3
                   7|   [Chunk Group Header]
                    |           [marker] 0
                    |           [deviceID] root.sg1.d1
                  20|   [Chunk] of root.sg1.d1.s1, startTime: 1669359533948 endTime: 1669359534047 count: 100 [minValue:-9032452783138882770,maxValue:9117677033041335123,firstValue:7068645577795875906,lastValue:-5833792328174747265,sumValue:5.795959009889246E19]
                    |           [chunk header] marker=5, measurementID=s1, dataSize=864, dataType=INT64, compressionType=SNAPPY, encodingType=RLE
                    |           [page]  UncompressedSize:862, CompressedSize:860
                 893|   [Chunk] of root.sg1.d1.s2, startTime: 1669359533948 endTime: 1669359534047 count: 100 [minValue:-8806861312244965718,maxValue:9192550740609853234,firstValue:1150295375739457693,lastValue:-2839553973758938646,sumValue:8.2822564314572677E18]
                    |           [chunk header] marker=5, measurementID=s2, dataSize=864, dataType=INT64, compressionType=SNAPPY, encodingType=RLE
                    |           [page]  UncompressedSize:862, CompressedSize:860
                1766|   [Chunk] of root.sg1.d1.s3, startTime: 1669359533948 endTime: 1669359534047 count: 100 [minValue:-9076669333460323191,maxValue:9175278522960949594,firstValue:2537897870994797700,lastValue:7194625271253769397,sumValue:-2.126008424849926E19]
                    |           [chunk header] marker=5, measurementID=s3, dataSize=864, dataType=INT64, compressionType=SNAPPY, encodingType=RLE
                    |           [page]  UncompressedSize:862, CompressedSize:860
||||||||||||||||||||| [Chunk Group] of root.sg1.d1 ends
                2656|   [marker] 2
                2657|   [TimeseriesIndex] of root.sg1.d1.s1, tsDataType:INT64, startTime: 1669359533948 endTime: 1669359534047 count: 100 [minValue:-9032452783138882770,maxValue:9117677033041335123,firstValue:7068645577795875906,lastValue:-5833792328174747265,sumValue:5.795959009889246E19]
                    |           [ChunkIndex] offset=20
                2728|   [TimeseriesIndex] of root.sg1.d1.s2, tsDataType:INT64, startTime: 1669359533948 endTime: 1669359534047 count: 100 [minValue:-8806861312244965718,maxValue:9192550740609853234,firstValue:1150295375739457693,lastValue:-2839553973758938646,sumValue:8.2822564314572677E18]
                    |           [ChunkIndex] offset=893
                2799|   [TimeseriesIndex] of root.sg1.d1.s3, tsDataType:INT64, startTime: 1669359533948 endTime: 1669359534047 count: 100 [minValue:-9076669333460323191,maxValue:9175278522960949594,firstValue:2537897870994797700,lastValue:7194625271253769397,sumValue:-2.126008424849926E19]
                    |           [ChunkIndex] offset=1766
                2870|   [IndexOfTimerseriesIndex Node] type=LEAF_MEASUREMENT
                    |           <s1, 2657>
                    |           <endOffset, 2870>
||||||||||||||||||||| [TsFileMetadata] begins
                2891|   [IndexOfTimerseriesIndex Node] type=LEAF_DEVICE
                    |           <root.sg1.d1, 2870>
                    |           <endOffset, 2891>
                    |   [meta offset] 2656
                    |   [bloom filter] bit vector byte array length=31, filterSize=256, hashFunctionSize=5
||||||||||||||||||||| [TsFileMetadata] ends
                2964|   [TsFileMetadataSize] 73
                2968|   [magic tail] TsFile
                2974|   END of TsFile
---------------------------- IndexOfTimerseriesIndex Tree -----------------------------
        [MetadataIndex:LEAF_DEVICE]
        └──────[root.sg1.d1,2870]
                        [MetadataIndex:LEAF_MEASUREMENT]
                        └──────[s1,2657]
---------------------------------- TsFile Sketch End ----------------------------------
`````````````````````````

解释：

-   以"|"为分隔，左边是在TsFile文件中的实际位置，右边是梗概内容。
-   "|||||||||||||||||||||"是为增强可读性而添加的导引信息，不是TsFile中实际存储的数据。
-   最后打印的"IndexOfTimerseriesIndex Tree"是对TsFile文件末尾的元数据索引树的重新整理打印，便于直观理解，不是TsFile中存储的实际数据。

## TsFile Resource概览工具

TsFile resource概览工具用于打印出TsFile resource文件的内容，工具位置为 tools/tsfile/print-tsfile-resource-files。

### 用法

-   Windows:

```bash
.\print-tsfile-resource-files.bat <TsFile resource文件所在的文件夹路径，或者单个TsFile resource文件路径>
```

-   Linux or MacOs:

```
./print-tsfile-resource-files.sh <TsFile resource文件所在的文件夹路径，或者单个TsFile resource文件路径> 
```

### 示例

以Windows系统为例：

`````````````````````````bash
.\print-tsfile-resource-files.bat D:\github\master\iotdb\data\datanode\data\sequence\root.sg1\0\0
````````````````````````
Starting Printing the TsFileResources
````````````````````````
147  [main] WARN  o.a.i.t.c.conf.TSFileDescriptor - not found iotdb-common.properties, use the default configs.
230  [main] WARN  o.a.iotdb.db.conf.IoTDBDescriptor - Cannot find IOTDB_HOME or IOTDB_CONF environment variable when loading config file iotdb-common.properties, use default configuration
231  [main] WARN  o.a.iotdb.db.conf.IoTDBDescriptor - Couldn't load the configuration iotdb-common.properties from any of the known sources.
233  [main] WARN  o.a.iotdb.db.conf.IoTDBDescriptor - Cannot find IOTDB_HOME or IOTDB_CONF environment variable when loading config file iotdb-datanode.properties, use default configuration
237  [main] WARN  o.a.iotdb.db.conf.IoTDBDescriptor - Couldn't load the configuration iotdb-datanode.properties from any of the known sources.
Analyzing D:\github\master\iotdb\data\datanode\data\sequence\root.sg1\0\0\1669359533489-1-0-0.tsfile ...

Resource plan index range [9223372036854775807, -9223372036854775808]
device root.sg1.d1, start time 0 (1970-01-01T08:00+08:00[GMT+08:00]), end time 99 (1970-01-01T08:00:00.099+08:00[GMT+08:00])

Analyzing the resource file folder D:\github\master\iotdb\data\datanode\data\sequence\root.sg1\0\0 finished.
`````````````````````````

`````````````````````````bash
.\print-tsfile-resource-files.bat D:\github\master\iotdb\data\datanode\data\sequence\root.sg1\0\0\1669359533489-1-0-0.tsfile.resource
````````````````````````
Starting Printing the TsFileResources
````````````````````````
178  [main] WARN  o.a.iotdb.db.conf.IoTDBDescriptor - Cannot find IOTDB_HOME or IOTDB_CONF environment variable when loading config file iotdb-common.properties, use default configuration
186  [main] WARN  o.a.i.t.c.conf.TSFileDescriptor - not found iotdb-common.properties, use the default configs.
187  [main] WARN  o.a.iotdb.db.conf.IoTDBDescriptor - Couldn't load the configuration iotdb-common.properties from any of the known sources.
188  [main] WARN  o.a.iotdb.db.conf.IoTDBDescriptor - Cannot find IOTDB_HOME or IOTDB_CONF environment variable when loading config file iotdb-datanode.properties, use default configuration
192  [main] WARN  o.a.iotdb.db.conf.IoTDBDescriptor - Couldn't load the configuration iotdb-datanode.properties from any of the known sources.
Analyzing D:\github\master\iotdb\data\datanode\data\sequence\root.sg1\0\0\1669359533489-1-0-0.tsfile ...

Resource plan index range [9223372036854775807, -9223372036854775808]
device root.sg1.d1, start time 0 (1970-01-01T08:00+08:00[GMT+08:00]), end time 99 (1970-01-01T08:00:00.099+08:00[GMT+08:00])

Analyzing the resource file D:\github\master\iotdb\data\datanode\data\sequence\root.sg1\0\0\1669359533489-1-0-0.tsfile.resource finished.
`````````````````````````
