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
# 单机版部署

## 注意事项

1. 安装前请确认系统已参照[系统配置](./Environment-Requirements.md)准备完成。

2. 部署时推荐优先使用`hostname`进行IP配置，可避免后期修改主机ip导致数据库无法启动的问题。设置hostname需要在目标服务器上配置/etc/hosts，如本机ip是192.168.1.3，hostname是iotdb-1，则可以使用以下命令设置服务器的 hostname，并使用hostname配置IoTDB的`cn_internal_address`、dn_internal_address、dn_rpc_address。

   ```shell
   echo "192.168.1.3  iotdb-1" >> /etc/hosts 
   ```

3. 部分参数首次启动后不能修改，请参考下方的【参数配置】章节进行设置。

4. 无论是在linux还是windows中，请确保IoTDB的安装路径中不含空格和中文，避免软件运行异常。

5. 请注意，安装部署IoTDB时需要保持使用同一个用户进行操作，您可以：
- 使用 root 用户（推荐）：使用 root 用户可以避免权限等问题。
- 使用固定的非 root 用户：
  - 使用同一用户操作：确保在启动、停止等操作均保持使用同一用户，不要切换用户。
  - 避免使用 sudo：尽量避免使用 sudo 命令，因为它会以 root 用户权限执行命令，可能会引起权限混淆或安全问题。 

## 安装步骤

### 前置检查

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

![img](/img/sha512-08.png)

4. 对比输出结果与官方 SHA512 校验码，确认一致后，即可按照下方流程执行 IoTDB 的安装部署操作。

#### 注意事项：

- 若校验结果不一致，请重新获取安装包
- 校验过程中若出现"文件不存在"提示，需检查文件路径是否正确或安装包是否完整下载

### 解压安装包并进入安装目录

```shell
unzip  apache-iotdb-{version}-all-bin.zip
cd  apache-iotdb-{version}-all-bin
```

### 参数配置

#### 环境脚本配置

- ./conf/confignode-env.sh（./conf/confignode-env.bat）配置

| **配置项**  |                **说明**                | **默认值** |                    **推荐值**                    |     备注     |
| ----------- | :------------------------------------: | :--------: | :----------------------------------------------: | :----------: |
| MEMORY_SIZE | IoTDB ConfigNode节点可以使用的内存总量 |     空     | 可按需填写，填写后系统会根据填写的数值来分配内存 | 修改后保存即可，无需执行；重启服务后生效 |

- ./conf/datanode-env.sh（./conf/datanode-env.bat）配置

| **配置项**  |               **说明**               | **默认值** |                    **推荐值**                    |     备注     |
| :---------: | :----------------------------------: | :--------: | :----------------------------------------------: | :----------: |
| MEMORY_SIZE | IoTDB DataNode节点可以使用的内存总量 |     空     | 可按需填写，填写后系统会根据填写的数值来分配内存 | 修改后保存即可，无需执行；重启服务后生效 |

#### 系统通用配置

打开通用配置文件（./conf/iotdb-system.properties 文件），设置以下参数：

|        **配置项**         |             **说明**             |   **默认值**   |                    **推荐值**                    |                      备注                       |
| :-----------------------: | :------------------------------: | :------------: | :----------------------------------------------: |:---------------------------------------------:|
|       cluster_name        |             集群名称             | defaultCluster | 可根据需要设置集群名称，如无特殊需要保持默认即可 |    首次启动后不可修改，V1.3.3及之后版本支持热加载，但不建议手动修改该参数     |
| schema_replication_factor | 元数据副本数，单机版此处设置为 1 |       1        |                        1                         |                 默认1，首次启动后不可修改                 |
|  data_replication_factor  |  数据副本数，单机版此处设置为 1  |       1        |                        1                         |                 默认1，首次启动后不可修改                 |

#### ConfigNode 配置

打开ConfigNode配置文件（./conf/iotdb-system.properties文件），设置以下参数：

|     **配置项**      |                           **说明**                           |    **默认**     |                      推荐值                      |      **备注**      |
| :-----------------: | :----------------------------------------------------------: | :-------------: | :----------------------------------------------: | :----------------: |
| cn_internal_address |              ConfigNode在集群内部通讯使用的地址              |    127.0.0.1    | 所在服务器的IPV4地址或hostname，推荐使用hostname | 首次启动后不能修改 |
|  cn_internal_port   |              ConfigNode在集群内部通讯使用的端口              |      10710      |                      10710                       | 首次启动后不能修改 |
|  cn_consensus_port  |            ConfigNode副本组共识协议通信使用的端口            |      10720      |                      10720                       | 首次启动后不能修改 |
| cn_seed_config_node | 节点注册加入集群时连接的ConfigNode 的地址，cn_internal_address:cn_internal_port | 127.0.0.1:10710 |       cn_internal_address:cn_internal_port       | 首次启动后不能修改 |

#### DataNode 配置

打开DataNode配置文件 ./conf/iotdb-system.properties，设置以下参数：

|           **配置项**            |                           **说明**                           |    **默认**     |                      推荐值                      | **备注**           |
| :-----------------------------: | :----------------------------------------------------------: | :-------------: | :----------------------------------------------: | :----------------- |
|         dn_rpc_address          |                    客户端 RPC 服务的地址                     |    0.0.0.0         |  所在服务器的IPV4地址或hostname，推荐使用所在服务器的IPV4地址 | 重启服务生效       |
|           dn_rpc_port           |                    客户端 RPC 服务的端口                     |      6667       |                       6667                       | 重启服务生效       |
|       dn_internal_address       |               DataNode在集群内部通讯使用的地址               |    127.0.0.1    | 所在服务器的IPV4地址或hostname，推荐使用hostname | 首次启动后不能修改 |
|        dn_internal_port         |               DataNode在集群内部通信使用的端口               |      10730      |                      10730                       | 首次启动后不能修改 |
|    dn_mpp_data_exchange_port    |               DataNode用于接收数据流使用的端口               |      10740      |                      10740                       | 首次启动后不能修改 |
|  dn_data_region_consensus_port  |          DataNode用于数据副本共识协议通信使用的端口          |      10750      |                      10750                       | 首次启动后不能修改 |
| dn_schema_region_consensus_port |         DataNode用于元数据副本共识协议通信使用的端口         |      10760      |                      10760                       | 首次启动后不能修改 |
|       dn_seed_config_node       | 节点注册加入集群时连接的ConfigNode地址,即cn_internal_address:cn_internal_port | 127.0.0.1:10710 |       cn_internal_address:cn_internal_port       | 首次启动后不能修改 |

> ❗️注意：VSCode Remote等编辑器无自动保存配置功能，请确保修改的文件被持久化保存，否则配置项无法生效

### 启动ConfigNode 节点

进入iotdb的sbin目录下，启动confignode

```shell
./start-confignode.sh    -d      #“-d”参数将在后台进行启动 
```
如果启动失败，请参考[常见问题](#常见问题)。

### 启动DataNode 节点

 进入iotdb的sbin目录下，启动datanode：

```shell
cd sbin
./start-datanode.sh   -d   #-d参数将在后台进行启动 
```

### 验证部署

可直接执行 ./sbin 目录下的 Cli 启动脚本：

```shell
./start-cli.sh  -h  ip(本机ip或域名)  -p  端口号(6667)
```

   成功启动后，出现如下界面显示IoTDB安装成功。

![](/img/%E5%BC%80%E6%BA%90%E7%89%88%E5%90%AF%E5%8A%A8%E6%88%90%E5%8A%9F.png)

出现安装成功界面后，使用`show cluster`命令查看服务运行状态

当看到status都是running表示服务启动成功

![](/img/%E5%BC%80%E6%BA%90-%E5%8D%95%E6%9C%BAshow.jpeg)

## 常见问题

1.  Confignode节点启动失败

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
        ps -ef|grep iotdb

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