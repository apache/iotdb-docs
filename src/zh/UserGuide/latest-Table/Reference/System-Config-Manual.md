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

# 配置参数

IoTDB 配置文件位于 IoTDB 安装目录：`conf`文件夹下。

- `confignode-env.sh/bat`：环境配置项的配置文件，可以配置 ConfigNode 的内存大小。
- `datanode-env.sh/bat`：环境配置项的配置文件，可以配置 DataNode 的内存大小。
- `iotdb-system.properties`：IoTDB 的配置文件。
- `iotdb-system.properties.template`：IoTDB 的配置文件模版。

## 1. 修改配置：

在 `iotdb-system.properties` 文件中已存在的参数可以直接进行修改。对于那些在 `iotdb-system.properties` 中未列出的参数，可以从 `iotdb-system.properties.template` 配置文件模板中找到相应的参数，然后将其复制到 `iotdb-system.properties` 文件中进行修改。

### 1.1 改后生效方式

不同的配置参数有不同的生效方式，分为以下三种：

- 仅允许在第一次启动服务前修改： 在第一次启动 ConfigNode/DataNode 后即禁止修改，修改会导致 ConfigNode/DataNode 无法启动。
- 重启服务生效： ConfigNode/DataNode 启动后仍可修改，但需要重启 ConfigNode/DataNode 后才生效。
- 热加载： 可在 ConfigNode/DataNode 运行时修改，修改后通过 Session 或 Cli 发送 `load configuration` 或 `set configuration` 命令（SQL）至 IoTDB 使配置生效。

## 2. 环境配置项

### 2.1 confignode-env.sh/bat

环境配置项主要用于对 ConfigNode 运行的 Java 环境相关参数进行配置，如 JVM 相关配置。ConfigNode 启动时，此部分配置会被传给 JVM，详细配置项说明如下：CONFIGNODE_JMX_OPTS

- MEMORY_SIZE

| 名字         | MEMORY_SIZE                                                  |
| ------------ | ------------------------------------------------------------ |
| 描述         | IoTDB ConfigNode 启动时分配的内存大小                        |
| 类型         | String                                                       |
| 默认值       | 取决于操作系统和机器配置。默认为机器内存的十分之三，最多会被设置为 16G。 |
| 改后生效方式 | 重启服务生效                                                 |

- ON_HEAP_MEMORY

| 名字         | ON_HEAP_MEMORY                                               |
| ------------ | ------------------------------------------------------------ |
| 描述         | IoTDB ConfigNode 能使用的堆内内存大小, 曾用名: MAX_HEAP_SIZE |
| 类型         | String                                                       |
| 默认值       | 取决于MEMORY_SIZE的配置。                                    |
| 改后生效方式 | 重启服务生效                                                 |

- OFF_HEAP_MEMORY

| 名字         | OFF_HEAP_MEMORY                                              |
| ------------ | ------------------------------------------------------------ |
| 描述         | IoTDB ConfigNode 能使用的堆外内存大小, 曾用名: MAX_DIRECT_MEMORY_SIZE |
| 类型         | String                                                       |
| 默认值       | 取决于MEMORY_SIZE的配置。                                    |
| 改后生效方式 | 重启服务生效                                                 |

### 2.2 datanode-env.sh/bat

环境配置项主要用于对 DataNode 运行的 Java 环境相关参数进行配置，如 JVM 相关配置。DataNode/Standalone 启动时，此部分配置会被传给 JVM，详细配置项说明如下：

- MEMORY_SIZE

| 名字         | MEMORY_SIZE                                          |
| ------------ | ---------------------------------------------------- |
| 描述         | IoTDB DataNode 启动时分配的内存大小                  |
| 类型         | String                                               |
| 默认值       | 取决于操作系统和机器配置。默认为机器内存的二分之一。 |
| 改后生效方式 | 重启服务生效                                         |

- ON_HEAP_MEMORY

| 名字         | ON_HEAP_MEMORY                                             |
| ------------ | ---------------------------------------------------------- |
| 描述         | IoTDB DataNode 能使用的堆内内存大小, 曾用名: MAX_HEAP_SIZE |
| 类型         | String                                                     |
| 默认值       | 取决于MEMORY_SIZE的配置。                                  |
| 改后生效方式 | 重启服务生效                                               |

- OFF_HEAP_MEMORY

| 名字         | OFF_HEAP_MEMORY                                              |
| ------------ | ------------------------------------------------------------ |
| 描述         | IoTDB DataNode 能使用的堆外内存大小, 曾用名: MAX_DIRECT_MEMORY_SIZE |
| 类型         | String                                                       |
| 默认值       | 取决于MEMORY_SIZE的配置                                      |
| 改后生效方式 | 重启服务生效                                                 |


## 3. 系统配置项（iotdb-system.properties.template）

### 3.1 集群管理

- cluster_name

| 名字     | cluster_name                                                 |
| -------- | ------------------------------------------------------------ |
| 描述     | 集群名称                                                     |
| 类型     | String                                                       |
| 默认值   | default_cluster                                              |
| 修改方式 | CLI 中执行语句 `set configuration "cluster_name"="xxx"` （xxx为希望修改成的集群名称） |
| 注意     | 此修改通过网络分发至每个节点。在网络波动或者有节点宕机的情况下，不保证能够在全部节点修改成功。未修改成功的节点重启时无法加入集群，此时需要手动修改该节点的配置文件中的cluster_name项，再重启。正常情况下，不建议通过手动修改配置文件的方式修改集群名称，不建议通过`load configuration`的方式热加载。 |

### 3.2 SeedConfigNode 配置

- cn_seed_config_node

| 名字         | cn_seed_config_node                                          |
| ------------ | ------------------------------------------------------------ |
| 描述         | 目标 ConfigNode 地址，ConfigNode 通过此地址加入集群，推荐使用 SeedConfigNode。V1.2.2 及以前曾用名是 cn_target_config_node_list |
| 类型         | String                                                       |
| 默认值       | 127.0.0.1:10710                                              |
| 改后生效方式 | 仅允许在第一次启动服务前修改                                 |

- dn_seed_config_node

| 名字         | dn_seed_config_node                                          |
| ------------ | ------------------------------------------------------------ |
| 描述         | ConfigNode 地址，DataNode 启动时通过此地址加入集群，推荐使用 SeedConfigNode。V1.2.2 及以前曾用名是 dn_target_config_node_list |
| 类型         | String                                                       |
| 默认值       | 127.0.0.1:10710                                              |
| 改后生效方式 | 仅允许在第一次启动服务前修改                                 |

### 3.3 Node RPC 配置

- cn_internal_address

| 名字         | cn_internal_address          |
| ------------ | ---------------------------- |
| 描述         | ConfigNode 集群内部地址      |
| 类型         | String                       |
| 默认值       | 127.0.0.1                    |
| 改后生效方式 | 仅允许在第一次启动服务前修改 |

- cn_internal_port

| 名字         | cn_internal_port             |
| ------------ | ---------------------------- |
| 描述         | ConfigNode 集群服务监听端口  |
| 类型         | Short Int : [0,65535]        |
| 默认值       | 10710                        |
| 改后生效方式 | 仅允许在第一次启动服务前修改 |

- cn_consensus_port

| 名字         | cn_consensus_port             |
| ------------ | ----------------------------- |
| 描述         | ConfigNode 的共识协议通信端口 |
| 类型         | Short Int : [0,65535]         |
| 默认值       | 10720                         |
| 改后生效方式 | 仅允许在第一次启动服务前修改  |

- dn_rpc_address

| 名字         | dn_rpc_address          |
| ------------ | ----------------------- |
| 描述         | 客户端 RPC 服务监听地址 |
| 类型         | String                  |
| 默认值       | 0.0.0.0                 |
| 改后生效方式 | 重启服务生效            |

- dn_rpc_port

| 名字         | dn_rpc_port             |
| ------------ | ----------------------- |
| 描述         | Client RPC 服务监听端口 |
| 类型         | Short Int : [0,65535]   |
| 默认值       | 6667                    |
| 改后生效方式 | 重启服务生效            |

- dn_internal_address

| 名字         | dn_internal_address          |
| ------------ | ---------------------------- |
| 描述         | DataNode 内网通信地址        |
| 类型         | string                       |
| 默认值       | 127.0.0.1                    |
| 改后生效方式 | 仅允许在第一次启动服务前修改 |

- dn_internal_port

| 名字         | dn_internal_port             |
| ------------ | ---------------------------- |
| 描述         | DataNode 内网通信端口        |
| 类型         | int                          |
| 默认值       | 10730                        |
| 改后生效方式 | 仅允许在第一次启动服务前修改 |

- dn_mpp_data_exchange_port

| 名字         | dn_mpp_data_exchange_port    |
| ------------ | ---------------------------- |
| 描述         | MPP 数据交换端口             |
| 类型         | int                          |
| 默认值       | 10740                        |
| 改后生效方式 | 仅允许在第一次启动服务前修改 |

- dn_schema_region_consensus_port

| 名字         | dn_schema_region_consensus_port       |
| ------------ | ------------------------------------- |
| 描述         | DataNode 元数据副本的共识协议通信端口 |
| 类型         | int                                   |
| 默认值       | 10750                                 |
| 改后生效方式 | 仅允许在第一次启动服务前修改          |

- dn_data_region_consensus_port

| 名字         | dn_data_region_consensus_port       |
| ------------ | ----------------------------------- |
| 描述         | DataNode 数据副本的共识协议通信端口 |
| 类型         | int                                 |
| 默认值       | 10760                               |
| 改后生效方式 | 仅允许在第一次启动服务前修改        |

- dn_join_cluster_retry_interval_ms

| 名字         | dn_join_cluster_retry_interval_ms |
| ------------ | --------------------------------- |
| 描述         | DataNode 再次重试加入集群等待时间 |
| 类型         | long                              |
| 默认值       | 5000                              |
| 改后生效方式 | 重启服务生效                      |

### 3.4 副本配置

- config_node_consensus_protocol_class

| 名字         | config_node_consensus_protocol_class             |
| ------------ | ------------------------------------------------ |
| 描述         | ConfigNode 副本的共识协议，仅支持 RatisConsensus |
| 类型         | String                                           |
| 默认值       | org.apache.iotdb.consensus.ratis.RatisConsensus  |
| 改后生效方式 | 仅允许在第一次启动服务前修改                     |

- schema_replication_factor

| 名字         | schema_replication_factor          |
| ------------ | ---------------------------------- |
| 描述         | Database 的默认元数据副本数        |
| 类型         | int32                              |
| 默认值       | 1                                  |
| 改后生效方式 | 重启服务后对**新的 Database** 生效 |

- schema_region_consensus_protocol_class

| 名字         | schema_region_consensus_protocol_class                |
| ------------ | ----------------------------------------------------- |
| 描述         | 元数据副本的共识协议，多副本时只能使用 RatisConsensus |
| 类型         | String                                                |
| 默认值       | org.apache.iotdb.consensus.ratis.RatisConsensus       |
| 改后生效方式 | 仅允许在第一次启动服务前修改                          |

- data_replication_factor

| 名字         | data_replication_factor            |
| ------------ | ---------------------------------- |
| 描述         | Database 的默认数据副本数          |
| 类型         | int32                              |
| 默认值       | 1                                  |
| 改后生效方式 | 重启服务后对**新的 Database** 生效 |

- data_region_consensus_protocol_class

| 名字         | data_region_consensus_protocol_class                         |
| ------------ | ------------------------------------------------------------ |
| 描述         | 数据副本的共识协议，多副本时可以使用 IoTConsensus 或 RatisConsensus |
| 类型         | String                                                       |
| 默认值       | org.apache.iotdb.consensus.iot.IoTConsensus                  |
| 改后生效方式 | 仅允许在第一次启动服务前修改                                 |

### 3.5 目录配置

- cn_system_dir

| 名字         | cn_system_dir                                               |
| ------------ | ----------------------------------------------------------- |
| 描述         | ConfigNode 系统数据存储路径                                 |
| 类型         | String                                                      |
| 默认值       | data/confignode/system（Windows：data\\configndoe\\system） |
| 改后生效方式 | 重启服务生效                                                |

- cn_consensus_dir

| 名字         | cn_consensus_dir                                             |
| ------------ | ------------------------------------------------------------ |
| 描述         | ConfigNode 共识协议数据存储路径                              |
| 类型         | String                                                       |
| 默认值       | data/confignode/consensus（Windows：data\\configndoe\\consensus） |
| 改后生效方式 | 重启服务生效                                                 |

- cn_pipe_receiver_file_dir

| 名字         | cn_pipe_receiver_file_dir                                    |
| ------------ | ------------------------------------------------------------ |
| 描述         | ConfigNode中pipe接收者用于存储文件的目录路径。               |
| 类型         | String                                                       |
| 默认值       | data/confignode/system/pipe/receiver（Windows：data\\confignode\\system\\pipe\\receiver） |
| 改后生效方式 | 重启服务生效                                                 |

- dn_system_dir

| 名字         | dn_system_dir                                                |
| ------------ | ------------------------------------------------------------ |
| 描述         | IoTDB 元数据存储路径，默认存放在和 sbin 目录同级的 data 目录下。相对路径的起始目录与操作系统相关，建议使用绝对路径。 |
| 类型         | String                                                       |
| 默认值       | data/datanode/system（Windows：data\\datanode\\system）      |
| 改后生效方式 | 重启服务生效                                                 |

- dn_data_dirs

| 名字         | dn_data_dirs                                                 |
| ------------ | ------------------------------------------------------------ |
| 描述         | IoTDB 数据存储路径，默认存放在和 sbin 目录同级的 data 目录下。相对路径的起始目录与操作系统相关，建议使用绝对路径。 |
| 类型         | String                                                       |
| 默认值       | data/datanode/data（Windows：data\\datanode\\data）          |
| 改后生效方式 | 重启服务生效                                                 |

- dn_multi_dir_strategy

| 名字         | dn_multi_dir_strategy                                        |
| ------------ | ------------------------------------------------------------ |
| 描述         | IoTDB 在 data_dirs 中为 TsFile 选择目录时采用的策略。可使用简单类名或类名全称。系统提供以下三种策略：<br>1. SequenceStrategy：IoTDB 按顺序选择目录，依次遍历 data_dirs 中的所有目录，并不断轮循；<br>2. MaxDiskUsableSpaceFirstStrategy：IoTDB 优先选择 data_dirs 中对应磁盘空余空间最大的目录；<br>您可以通过以下方法完成用户自定义策略：<br>1. 继承 org.apache.iotdb.db.storageengine.rescon.disk.strategy.DirectoryStrategy 类并实现自身的 Strategy 方法；<br>2. 将实现的类的完整类名（包名加类名，UserDefineStrategyPackage）填写到该配置项；<br>3. 将该类 jar 包添加到工程中。 |
| 类型         | String                                                       |
| 默认值       | SequenceStrategy                                             |
| 改后生效方式 | 热加载                                                       |

- dn_consensus_dir

| 名字         | dn_consensus_dir                                             |
| ------------ | ------------------------------------------------------------ |
| 描述         | IoTDB 共识层日志存储路径，默认存放在和 sbin 目录同级的 data 目录下。相对路径的起始目录与操作系统相关，建议使用绝对路径。 |
| 类型         | String                                                       |
| 默认值       | data/datanode/consensus（Windows：data\\datanode\\consensus） |
| 改后生效方式 | 重启服务生效                                                 |

- dn_wal_dirs

| 名字         | dn_wal_dirs                                                  |
| ------------ | ------------------------------------------------------------ |
| 描述         | IoTDB 写前日志存储路径，默认存放在和 sbin 目录同级的 data 目录下。相对路径的起始目录与操作系统相关，建议使用绝对路径。 |
| 类型         | String                                                       |
| 默认值       | data/datanode/wal（Windows：data\\datanode\\wal）            |
| 改后生效方式 | 重启服务生效                                                 |

- dn_tracing_dir

| 名字         | dn_tracing_dir                                               |
| ------------ | ------------------------------------------------------------ |
| 描述         | IoTDB 追踪根目录路径，默认存放在和 sbin 目录同级的 data 目录下。相对路径的起始目录与操作系统相关，建议使用绝对路径。 |
| 类型         | String                                                       |
| 默认值       | datanode/tracing（Windows：datanode\\tracing）               |
| 改后生效方式 | 重启服务生效                                                 |

- dn_sync_dir

| 名字         | dn_sync_dir                                                  |
| ------------ | ------------------------------------------------------------ |
| 描述         | IoTDB sync 存储路径，默认存放在和 sbin 目录同级的 data 目录下。相对路径的起始目录与操作系统相关，建议使用绝对路径。 |
| 类型         | String                                                       |
| 默认值       | data/datanode/sync（Windows：data\\datanode\\sync）          |
| 改后生效方式 | 重启服务生效                                                 |

- sort_tmp_dir

| 名字         | sort_tmp_dir                                      |
| ------------ | ------------------------------------------------- |
| 描述         | 用于配置排序操作的临时目录。                      |
| 类型         | String                                            |
| 默认值       | data/datanode/tmp（Windows：data\\datanode\\tmp） |
| 改后生效方式 | 重启服务生效                                      |

- dn_pipe_receiver_file_dirs

| 名字         | dn_pipe_receiver_file_dirs                                   |
| ------------ | ------------------------------------------------------------ |
| 描述         | DataNode中pipe接收者用于存储文件的目录路径。                 |
| 类型         | String                                                       |
| 默认值       | data/datanode/system/pipe/receiver（Windows：data\\datanode\\system\\pipe\\receiver） |
| 改后生效方式 | 重启服务生效                                                 |

- iot_consensus_v2_receiver_file_dirs

| 名字         | iot_consensus_v2_receiver_file_dirs                          |
| ------------ | ------------------------------------------------------------ |
| 描述         | IoTConsensus V2中接收者用于存储文件的目录路径。              |
| 类型         | String                                                       |
| 默认值       | data/datanode/system/pipe/consensus/receiver（Windows：data\\datanode\\system\\pipe\\consensus\\receiver） |
| 改后生效方式 | 重启服务生效                                                 |

- iot_consensus_v2_deletion_file_dir

| 名字         | iot_consensus_v2_deletion_file_dir                           |
| ------------ | ------------------------------------------------------------ |
| 描述         | IoTConsensus V2中删除操作用于存储文件的目录路径。            |
| 类型         | String                                                       |
| 默认值       | data/datanode/system/pipe/consensus/deletion（Windows：data\\datanode\\system\\pipe\\consensus\\deletion） |
| 改后生效方式 | 重启服务生效                                                 |

### 3.6 监控配置

- cn_metric_reporter_list

| 名字         | cn_metric_reporter_list                            |
| ------------ | -------------------------------------------------- |
| 描述         | confignode中用于配置监控模块的数据需要报告的系统。 |
| 类型         | String                                             |
| 默认值       | 无                                                 |
| 改后生效方式 | 重启服务生效                                       |

- cn_metric_level

| 名字         | cn_metric_level                            |
| ------------ | ------------------------------------------ |
| 描述         | confignode中控制监控模块收集数据的详细程度 |
| 类型         | String                                     |
| 默认值       | IMPORTANT                                  |
| 改后生效方式 | 重启服务生效                               |

- cn_metric_async_collect_period

| 名字         | cn_metric_async_collect_period                     |
| ------------ | -------------------------------------------------- |
| 描述         | confignode中某些监控数据异步收集的周期，单位是秒。 |
| 类型         | int                                                |
| 默认值       | 5                                                  |
| 改后生效方式 | 重启服务生效                                       |

- cn_metric_prometheus_reporter_port 

| 名字         | cn_metric_prometheus_reporter_port                     |
| ------------ | ------------------------------------------------------ |
| 描述         | confignode中Prometheus报告者用于监控数据报告的端口号。 |
| 类型         | int                                                    |
| 默认值       | 9091                                                   |
| 改后生效方式 | 重启服务生效                                           |

- dn_metric_reporter_list

| 名字         | dn_metric_reporter_list                          |
| ------------ | ------------------------------------------------ |
| 描述         | DataNode中用于配置监控模块的数据需要报告的系统。 |
| 类型         | String                                           |
| 默认值       | 无                                               |
| 改后生效方式 | 重启服务生效                                     |

- dn_metric_level

| 名字         | dn_metric_level                          |
| ------------ | ---------------------------------------- |
| 描述         | DataNode中控制监控模块收集数据的详细程度 |
| 类型         | String                                   |
| 默认值       | IMPORTANT                                |
| 改后生效方式 | 重启服务生效                             |

- dn_metric_async_collect_period

| 名字         | dn_metric_async_collect_period                   |
| ------------ | ------------------------------------------------ |
| 描述         | DataNode中某些监控数据异步收集的周期，单位是秒。 |
| 类型         | int                                              |
| 默认值       | 5                                                |
| 改后生效方式 | 重启服务生效                                     |

- dn_metric_prometheus_reporter_port 

| 名字         | dn_metric_prometheus_reporter_port                   |
| ------------ | ---------------------------------------------------- |
| 描述         | DataNode中Prometheus报告者用于监控数据报告的端口号。 |
| 类型         | int                                                  |
| 默认值       | 9092                                                 |
| 改后生效方式 | 重启服务生效                                         |

- dn_metric_internal_reporter_type

| 名字         | dn_metric_internal_reporter_type                             |
| ------------ | ------------------------------------------------------------ |
| 描述         | DataNode中监控模块内部报告者的种类，用于内部监控和检查数据是否已经成功写入和刷新。 |
| 类型         | String                                                       |
| 默认值       | IOTDB                                                        |
| 改后生效方式 | 重启服务生效                                                 |

### 3.7 SSL 配置

- enable_thrift_ssl

| 名字         | enable_thrift_ssl                                            |
| ------------ | ------------------------------------------------------------ |
| 描述         | 当enable_thrift_ssl配置为true时，将通过dn_rpc_port使用 SSL 加密进行通信 |
| 类型         | Boolean                                                      |
| 默认值       | false                                                        |
| 改后生效方式 | 重启服务生效                                                 |

- enable_https

| 名字         | enable_https                   |
| ------------ | ------------------------------ |
| 描述         | REST Service 是否开启 SSL 配置 |
| 类型         | Boolean                        |
| 默认值       | false                          |
| 改后生效方式 | 重启服务生效                       |

- key_store_path

| 名字         | key_store_path |
| ------------ | -------------- |
| 描述         | ssl证书路径    |
| 类型         | String         |
| 默认值       | 无             |
| 改后生效方式 | 重启服务生效   |

- key_store_pwd

| 名字         | key_store_pwd |
| ------------ | ------------- |
| 描述         | ssl证书密码   |
| 类型         | String        |
| 默认值       | 无            |
| 改后生效方式 | 重启服务生效  |

### 3.8 连接配置

- cn_rpc_thrift_compression_enable

| 名字         | cn_rpc_thrift_compression_enable |
| ------------ | -------------------------------- |
| 描述         | 是否启用 thrift 的压缩机制。     |
| 类型         | Boolean                          |
| 默认值       | false                            |
| 改后生效方式 | 重启服务生效                     |

- cn_rpc_max_concurrent_client_num

| 名字         | cn_rpc_max_concurrent_client_num |
| ------------ | -------------------------------- |
| 描述         | 最大连接数。                     |
| 类型         | Short Int : [0,65535]            |
| 默认值       | 65535                            |
| 改后生效方式 | 重启服务生效                     |

- cn_connection_timeout_ms 

| 名字         | cn_connection_timeout_ms |
| ------------ | ------------------------ |
| 描述         | 节点连接超时时间         |
| 类型         | int                      |
| 默认值       | 60000                    |
| 改后生效方式 | 重启服务生效             |

- cn_selector_thread_nums_of_client_manager

| 名字         | cn_selector_thread_nums_of_client_manager |
| ------------ | ----------------------------------------- |
| 描述         | 客户端异步线程管理的选择器线程数量        |
| 类型         | int                                       |
| 默认值       | 1                                         |
| 改后生效方式 | 重启服务生效                              |

- cn_max_client_count_for_each_node_in_client_manager

| 名字         | cn_max_client_count_for_each_node_in_client_manager |
| ------------ | --------------------------------------------------- |
| 描述         | 单 ClientManager 中路由到每个节点的最大 Client 个数 |
| 类型         | int                                                 |
| 默认值       | 300                                                 |
| 改后生效方式 | 重启服务生效                                        |

- dn_session_timeout_threshold

| 名字         | dn_session_timeout_threshold |
| ------------ | ---------------------------- |
| 描述         | 最大的会话空闲时间           |
| 类型         | int                          |
| 默认值       | 0                            |
| 改后生效方式 | 重启服务生效                 |

- dn_rpc_thrift_compression_enable

| 名字         | dn_rpc_thrift_compression_enable |
| ------------ | -------------------------------- |
| 描述         | 是否启用 thrift 的压缩机制       |
| 类型         | Boolean                          |
| 默认值       | false                            |
| 改后生效方式 | 重启服务生效                     |

- dn_rpc_advanced_compression_enable

| 名字         | dn_rpc_advanced_compression_enable |
| ------------ | ---------------------------------- |
| 描述         | 是否启用 thrift 的自定制压缩机制   |
| 类型         | Boolean                            |
| 默认值       | false                              |
| 改后生效方式 | 重启服务生效                       |

- dn_rpc_selector_thread_count

| 名字         | rpc_selector_thread_count |
| ------------ | ------------------------- |
| 描述         | rpc 选择器线程数量        |
| 类型         | int                       |
| 默认值       | 1                         |
| 改后生效方式 | 重启服务生效              |

- dn_rpc_min_concurrent_client_num

| 名字         | rpc_min_concurrent_client_num |
| ------------ | ----------------------------- |
| 描述         | 最小连接数                    |
| 类型         | Short Int : [0,65535]         |
| 默认值       | 1                             |
| 改后生效方式 | 重启服务生效                  |

- dn_rpc_max_concurrent_client_num

| 名字         | dn_rpc_max_concurrent_client_num |
| ------------ | -------------------------------- |
| 描述         | 最大连接数                       |
| 类型         | Short Int : [0,65535]            |
| 默认值       | 65535                            |
| 改后生效方式 | 重启服务生效                     |

- dn_thrift_max_frame_size

| 名字         | dn_thrift_max_frame_size                               |
| ------------ | ------------------------------------------------------ |
| 描述         | RPC 请求/响应的最大字节数                              |
| 类型         | long                                                   |
| 默认值       | 536870912 （默认值512MB，应大于等于 512 * 1024 * 1024) |
| 改后生效方式 | 重启服务生效                                           |

- dn_thrift_init_buffer_size

| 名字         | dn_thrift_init_buffer_size |
| ------------ | -------------------------- |
| 描述         | 字节数                     |
| 类型         | long                       |
| 默认值       | 1024                       |
| 改后生效方式 | 重启服务生效               |

- dn_connection_timeout_ms

| 名字         | dn_connection_timeout_ms |
| ------------ | ------------------------ |
| 描述         | 节点连接超时时间         |
| 类型         | int                      |
| 默认值       | 60000                    |
| 改后生效方式 | 重启服务生效             |

- dn_selector_thread_count_of_client_manager

| 名字         | dn_selector_thread_count_of_client_manager                   |
| ------------ | ------------------------------------------------------------ |
| 描述         | selector thread (TAsyncClientManager) nums for async thread in a clientManagerclientManager中异步线程的选择器线程（TAsyncClientManager）编号 |
| 类型         | int                                                          |
| 默认值       | 1                                                            |
| 改后生效方式 | 重启服务生效                                                 |

- dn_max_client_count_for_each_node_in_client_manager

| 名字         | dn_max_client_count_for_each_node_in_client_manager |
| ------------ | --------------------------------------------------- |
| 描述         | 单 ClientManager 中路由到每个节点的最大 Client 个数 |
| 类型         | int                                                 |
| 默认值       | 300                                                 |
| 改后生效方式 | 重启服务生效                                        |

### 3.9 对象存储管理

- remote_tsfile_cache_dirs

| 名字         | remote_tsfile_cache_dirs |
| ------------ | ------------------------ |
| 描述         | 云端存储在本地的缓存目录 |
| 类型         | String                   |
| 默认值       | data/datanode/data/cache |
| 改后生效方式 | 重启服务生效                 |

- remote_tsfile_cache_page_size_in_kb 

| 名字         | remote_tsfile_cache_page_size_in_kb |
| ------------ | ----------------------------------- |
| 描述         | 云端存储在本地缓存文件的块大小      |
| 类型         | int                                 |
| 默认值       | 20480                               |
| 改后生效方式 | 重启服务生效                            |

- remote_tsfile_cache_max_disk_usage_in_mb   

| 名字         | remote_tsfile_cache_max_disk_usage_in_mb |
| ------------ | ---------------------------------------- |
| 描述         | 云端存储本地缓存的最大磁盘占用大小       |
| 类型         | long                                     |
| 默认值       | 51200                                    |
| 改后生效方式 | 重启服务生效                                 |

- object_storage_type 

| 名字         | object_storage_type |
| ------------ | ------------------- |
| 描述         | 云端存储类型        |
| 类型         | String              |
| 默认值       | AWS_S3              |
| 改后生效方式 | 重启服务生效            |

- object_storage_endpoint    

| 名字         | object_storage_endpoint |
| ------------ | ----------------------- |
| 描述         | 云端存储的 endpoint     |
| 类型         | String                  |
| 默认值       | 无                      |
| 改后生效方式 | 重启服务生效                |

- object_storage_bucket   

| 名字         | object_storage_bucket  |
| ------------ | ---------------------- |
| 描述         | 云端存储 bucket 的名称 |
| 类型         | String                 |
| 默认值       | iotdb_data             |
| 改后生效方式 | 重启服务生效               |

- object_storage_access_key  

| 名字         | object_storage_access_key |
| ------------ | ------------------------- |
| 描述         | 云端存储的验证信息 key    |
| 类型         | String                    |
| 默认值       | 无                        |
| 改后生效方式 | 重启服务生效                  |

- object_storage_access_secret       

| 名字         | object_storage_access_secret |
| ------------ | ---------------------------- |
| 描述         | 云端存储的验证信息 secret    |
| 类型         | String                       |
| 默认值       | 无                           |
| 改后生效方式 | 重启服务生效                     |

### 3.10 多级管理

- dn_default_space_usage_thresholds

| 名字         | dn_default_space_usage_thresholds                            |
| ------------ | ------------------------------------------------------------ |
| 描述         | 定义每个层级数据目录的最小剩余空间比例；当剩余空间少于该比例时，数据会被自动迁移至下一个层级；当最后一个层级的剩余存储空间到低于此阈值时，会将系统置为 READ_ONLY |
| 类型         | double                                                       |
| 默认值       | 0.85                                                         |
| 改后生效方式 | 热加载                                                       |

- dn_tier_full_policy

| 名字         | dn_tier_full_policy                                          |
| ------------ | ------------------------------------------------------------ |
| 描述         | 如何处理最后一层数据，当其已用空间高于其dn_default_space_usage_threshold时。|
| 类型         | String                                                       |
| 默认值       | NULL                                                         |
| 改后生效方式 | 热加载                                                       |

- migrate_thread_count

| 名字         | migrate_thread_count                     |
| ------------ | ---------------------------------------- |
| 描述         | DataNode数据目录中迁移操作的线程池大小。 |
| 类型         | int                                      |
| 默认值       | 1                                        |
| 改后生效方式 | 热加载                                   |

- tiered_storage_migrate_speed_limit_bytes_per_sec

| 名字         | tiered_storage_migrate_speed_limit_bytes_per_sec |
| ------------ | ------------------------------------------------ |
| 描述         | 限制不同存储层级之间的数据迁移速度。             |
| 类型         | int                                              |
| 默认值       | 10485760                                         |
| 改后生效方式 | 热加载                                           |

### 3.11 REST服务配置

- enable_rest_service

| 名字         | enable_rest_service |
| ------------ | ------------------- |
| 描述         | 是否开启Rest服务。  |
| 类型         | Boolean             |
| 默认值       | false               |
| 改后生效方式 | 重启服务生效            |

- rest_service_port

| 名字         | rest_service_port  |
| ------------ | ------------------ |
| 描述         | Rest服务监听端口号 |
| 类型         | int32              |
| 默认值       | 18080              |
| 改后生效方式 | 重启服务生效           |

- enable_swagger

| 名字         | enable_swagger                    |
| ------------ | --------------------------------- |
| 描述         | 是否启用swagger来展示rest接口信息 |
| 类型         | Boolean                           |
| 默认值       | false                             |
| 改后生效方式 | 重启服务生效                          |

- rest_query_default_row_size_limit

| 名字         | rest_query_default_row_size_limit |
| ------------ | --------------------------------- |
| 描述         | 一次查询能返回的结果集最大行数    |
| 类型         | int32                             |
| 默认值       | 10000                             |
| 改后生效方式 | 重启服务生效                          |

- cache_expire_in_seconds

| 名字         | cache_expire_in_seconds          |
| ------------ | -------------------------------- |
| 描述         | 用户登录信息缓存的过期时间（秒） |
| 类型         | int32                            |
| 默认值       | 28800                            |
| 改后生效方式 | 重启服务生效                         |

- cache_max_num

| 名字         | cache_max_num            |
| ------------ | ------------------------ |
| 描述         | 缓存中存储的最大用户数量 |
| 类型         | int32                    |
| 默认值       | 100                      |
| 改后生效方式 | 重启服务生效                 |

- cache_init_num

| 名字         | cache_init_num |
| ------------ | -------------- |
| 描述         | 缓存初始容量   |
| 类型         | int32          |
| 默认值       | 10             |
| 改后生效方式 | 重启服务生效       |

- client_auth

| 名字         | client_auth            |
| ------------ | ---------------------- |
| 描述         | 是否需要客户端身份验证 |
| 类型         | boolean                |
| 默认值       | false                  |
| 改后生效方式 | 重启服务生效               |

- trust_store_path

| 名字         | trust_store_path        |
| ------------ | ----------------------- |
| 描述         | keyStore 密码（非必填） |
| 类型         | String                  |
| 默认值       | ""                      |
| 改后生效方式 | 重启服务生效                |

- trust_store_pwd

| 名字         | trust_store_pwd           |
| ------------ | ------------------------- |
| 描述         | trustStore 密码（非必填） |
| 类型         | String                    |
| 默认值       | ""                        |
| 改后生效方式 | 重启服务生效                  |

- idle_timeout_in_seconds

| 名字         | idle_timeout_in_seconds |
| ------------ | ----------------------- |
| 描述         | SSL 超时时间，单位为秒  |
| 类型         | int32                   |
| 默认值       | 5000                    |
| 改后生效方式 | 重启服务生效                |

### 3.12 负载均衡配置

- series_slot_num

| 名字         | series_slot_num              |
| ------------ | ---------------------------- |
| 描述         | 序列分区槽数                 |
| 类型         | int32                        |
| 默认值       | 10000                        |
| 改后生效方式 | 仅允许在第一次启动服务前修改 |

- series_partition_executor_class

| 名字         | series_partition_executor_class                              |
| ------------ | ------------------------------------------------------------ |
| 描述         | 序列分区哈希函数                                             |
| 类型         | String                                                       |
| 默认值       | org.apache.iotdb.commons.partition.executor.hash.BKDRHashExecutor |
| 改后生效方式 | 仅允许在第一次启动服务前修改                                 |

- schema_region_group_extension_policy

| 名字         | schema_region_group_extension_policy |
| ------------ | ------------------------------------ |
| 描述         | SchemaRegionGroup 的扩容策略         |
| 类型         | string                               |
| 默认值       | AUTO                                 |
| 改后生效方式 | 重启服务生效                             |

- default_schema_region_group_num_per_database

| 名字         | default_schema_region_group_num_per_database                 |
| ------------ | ------------------------------------------------------------ |
| 描述         | 当选用 CUSTOM-SchemaRegionGroup 扩容策略时，此参数为每个 Database 拥有的 SchemaRegionGroup 数量；当选用 AUTO-SchemaRegionGroup 扩容策略时，此参数为每个 Database 最少拥有的 SchemaRegionGroup 数量 |
| 类型         | int                                                          |
| 默认值       | 1                                                            |
| 改后生效方式 | 重启服务生效                                                     |

- schema_region_per_data_node

| 名字         | schema_region_per_data_node                        |
| ------------ | -------------------------------------------------- |
| 描述         | 期望每个 DataNode 可管理的 SchemaRegion 的最大数量 |
| 类型         | double                                             |
| 默认值       | 1.0                                                |
| 改后生效方式 | 重启服务生效                                           |

- data_region_group_extension_policy

| 名字         | data_region_group_extension_policy |
| ------------ | ---------------------------------- |
| 描述         | DataRegionGroup 的扩容策略         |
| 类型         | string                             |
| 默认值       | AUTO                               |
| 改后生效方式 | 重启服务生效                           |

- default_data_region_group_num_per_database

| 名字         | default_data_region_group_per_database                       |
| ------------ | ------------------------------------------------------------ |
| 描述         | 当选用 CUSTOM-DataRegionGroup 扩容策略时，此参数为每个 Database 拥有的 DataRegionGroup 数量；当选用 AUTO-DataRegionGroup 扩容策略时，此参数为每个 Database 最少拥有的 DataRegionGroup 数量 |
| 类型         | int                                                          |
| 默认值       | 2                                                            |
| 改后生效方式 | 重启服务生效                                                     |

- data_region_per_data_node

| 名字         | data_region_per_data_node                        |
| ------------ | ------------------------------------------------ |
| 描述         | 期望每个 DataNode 可管理的 DataRegion 的最大数量 |
| 类型         | double                                           |
| 默认值       |  CPU 核心数的一半                                              |
| 改后生效方式 | 重启服务生效                                         |

- enable_auto_leader_balance_for_ratis_consensus

| 名字         | enable_auto_leader_balance_for_ratis_consensus |
| ------------ | ---------------------------------------------- |
| 描述         | 是否为 Ratis 共识协议开启自动均衡 leader 策略  |
| 类型         | Boolean                                        |
| 默认值       | true                                           |
| 改后生效方式 | 重启服务生效                                       |

- enable_auto_leader_balance_for_iot_consensus

| 名字         | enable_auto_leader_balance_for_iot_consensus |
| ------------ | -------------------------------------------- |
| 描述         | 是否为 IoT 共识协议开启自动均衡 leader 策略  |
| 类型         | Boolean                                      |
| 默认值       | true                                         |
| 改后生效方式 | 重启服务生效                                     |

### 3.13 集群管理

- time_partition_origin

| 名字         | time_partition_origin                                        |
| ------------ | ------------------------------------------------------------ |
| 描述         | Database 数据时间分区的起始点，即从哪个时间点开始计算时间分区。 |
| 类型         | Long                                                         |
| 单位         | 毫秒                                                         |
| 默认值       | 0                                                            |
| 改后生效方式 | 仅允许在第一次启动服务前修改                                 |

- time_partition_interval

| 名字         | time_partition_interval         |
| ------------ | ------------------------------- |
| 描述         | Database 默认的数据时间分区间隔 |
| 类型         | Long                            |
| 单位         | 毫秒                            |
| 默认值       | 604800000                       |
| 改后生效方式 | 仅允许在第一次启动服务前修改    |

- heartbeat_interval_in_ms

| 名字         | heartbeat_interval_in_ms |
| ------------ | ------------------------ |
| 描述         | 集群节点间的心跳间隔     |
| 类型         | Long                     |
| 单位         | ms                       |
| 默认值       | 1000                     |
| 改后生效方式 | 重启服务生效                 |

- disk_space_warning_threshold

| 名字         | disk_space_warning_threshold |
| ------------ | ---------------------------- |
| 描述         | DataNode 磁盘剩余阈值        |
| 类型         | double(percentage)           |
| 默认值       | 0.05                         |
| 改后生效方式 | 重启服务生效                     |

### 3.14 内存控制配置

- datanode_memory_proportion

| 名字         | datanode_memory_proportion                           |
| ------------ | ---------------------------------------------------- |
| 描述         | 存储引擎、查询引擎、元数据、共识、流处理引擎和空闲内存比例 |
| 类型         | Ratio                                                |
| 默认值       | 3:3:1:1:1:1                                          |
| 改后生效方式 | 重启服务生效                                             |

- schema_memory_proportion

| 名字         | schema_memory_proportion                                     |
| ------------ | ------------------------------------------------------------ |
| 描述         | Schema 相关的内存如何在 SchemaRegion、SchemaCache 和 PartitionCache 之间分配 |
| 类型         | Ratio                                                        |
| 默认值       | 5:4:1                                                        |
| 改后生效方式 | 重启服务生效                                                     |

- storage_engine_memory_proportion

| 名字         | storage_engine_memory_proportion |
| ------------ | -------------------------------- |
| 描述         | 写入和合并占存储内存比例         |
| 类型         | Ratio                            |
| 默认值       | 8:2                              |
| 改后生效方式 | 重启服务生效                         |

- write_memory_proportion

| 名字         | write_memory_proportion                      |
| ------------ | -------------------------------------------- |
| 描述         | Memtable 和 TimePartitionInfo 占写入内存比例 |
| 类型         | Ratio                                        |
| 默认值       | 19:1                                         |
| 改后生效方式 | 重启服务生效                                     |

- primitive_array_size

| 名字         | primitive_array_size                     |
| ------------ | ---------------------------------------- |
| 描述         | 数组池中的原始数组大小（每个数组的长度） |
| 类型         | int32                                    |
| 默认值       | 64                                       |
| 改后生效方式 | 重启服务生效                                 |

- chunk_metadata_size_proportion

| 名字         | chunk_metadata_size_proportion               |
| ------------ | -------------------------------------------- |
| 描述         | 在数据压缩过程中，用于存储块元数据的内存比例 |
| 类型         | Double                                       |
| 默认值       | 0.1                                          |
| 改后生效方式 | 重启服务生效                                     |

- flush_proportion

| 名字         | flush_proportion                                             |
| ------------ | ------------------------------------------------------------ |
| 描述         | 调用flush disk的写入内存比例，默认0.4,若有极高的写入负载力（比如batch=1000），可以设置为低于默认值，比如0.2 |
| 类型         | Double                                                       |
| 默认值       | 0.4                                                          |
| 改后生效方式 | 重启服务生效                                                     |

- buffered_arrays_memory_proportion

| 名字         | buffered_arrays_memory_proportion       |
| ------------ | --------------------------------------- |
| 描述         | 为缓冲数组分配的写入内存比例，默认为0.6 |
| 类型         | Double                                  |
| 默认值       | 0.6                                     |
| 改后生效方式 | 重启服务生效                                |

- reject_proportion

| 名字         | reject_proportion                                            |
| ------------ | ------------------------------------------------------------ |
| 描述         | 拒绝插入的写入内存比例，默认0.8，若有极高的写入负载力（比如batch=1000）并且物理内存足够大，它可以设置为高于默认值，如0.9 |
| 类型         | Double                                                       |
| 默认值       | 0.8                                                          |
| 改后生效方式 | 重启服务生效                                                     |

- device_path_cache_proportion

| 名字         | device_path_cache_proportion                        |
| ------------ | --------------------------------------------------- |
| 描述         | 在内存中分配给设备路径缓存（DevicePathCache）的比例 |
| 类型         | Double                                              |
| 默认值       | 0.05                                                |
| 改后生效方式 | 重启服务生效                                            |

- write_memory_variation_report_proportion

| 名字         | write_memory_variation_report_proportion                     |
| ------------ | ------------------------------------------------------------ |
| 描述         | 如果 DataRegion 的内存增加超过写入可用内存的一定比例，则向系统报告。默认值为0.001 |
| 类型         | Double                                                       |
| 默认值       | 0.001                                                        |
| 改后生效方式 | 重启服务生效                                                     |

- check_period_when_insert_blocked

| 名字         | check_period_when_insert_blocked                             |
| ------------ | ------------------------------------------------------------ |
| 描述         | 当插入被拒绝时，等待时间（以毫秒为单位）去再次检查系统，默认为50。若插入被拒绝，读取负载低，可以设置大一些。 |
| 类型         | int32                                                        |
| 默认值       | 50                                                           |
| 改后生效方式 | 重启服务生效                                                     |

- io_task_queue_size_for_flushing

| 名字         | io_task_queue_size_for_flushing  |
| ------------ | -------------------------------- |
| 描述         | ioTaskQueue 的大小。默认值为10。 |
| 类型         | int32                            |
| 默认值       | 10                               |
| 改后生效方式 | 重启服务生效                         |

- enable_query_memory_estimation

| 名字         | enable_query_memory_estimation                               |
| ------------ | ------------------------------------------------------------ |
| 描述         | 开启后会预估每次查询的内存使用量，如果超过可用内存，会拒绝本次查询 |
| 类型         | bool                                                         |
| 默认值       | true                                                         |
| 改后生效方式 | 热加载                                                       |

### 3.15 元数据引擎配置

- schema_engine_mode

| 名字         | schema_engine_mode                                           |
| ------------ | ------------------------------------------------------------ |
| 描述         | 元数据引擎的运行模式，支持 Memory 和 PBTree；PBTree 模式下支持将内存中暂时不用的序列元数据实时置换到磁盘上，需要使用时再加载进内存；此参数在集群中所有的 DataNode 上务必保持相同。 |
| 类型         | string                                                       |
| 默认值       | Memory                                                       |
| 改后生效方式 | 仅允许在第一次启动服务前修改                                 |

- partition_cache_size

| 名字         | partition_cache_size           |
| ------------ | ------------------------------ |
| 描述         | 分区信息缓存的最大缓存条目数。 |
| 类型         | Int32                          |
| 默认值       | 1000                           |
| 改后生效方式 | 重启服务生效                       |

- sync_mlog_period_in_ms

| 名字         | sync_mlog_period_in_ms                                       |
| ------------ | ------------------------------------------------------------ |
| 描述         | mlog定期刷新到磁盘的周期，单位毫秒。如果该参数为0，则表示每次对元数据的更新操作都会被立即写到磁盘上。 |
| 类型         | Int64                                                        |
| 默认值       | 100                                                          |
| 改后生效方式 | 重启服务生效                                                     |

- tag_attribute_flush_interval

| 名字         | tag_attribute_flush_interval                       |
| ------------ | -------------------------------------------------- |
| 描述         | 标签和属性记录的间隔数，达到此记录数量时将强制刷盘 |
| 类型         | int32                                              |
| 默认值       | 1000                                               |
| 改后生效方式 | 仅允许在第一次启动服务前修改                       |

- tag_attribute_total_size

| 名字         | tag_attribute_total_size                 |
| ------------ | ---------------------------------------- |
| 描述         | 每个时间序列标签和属性的最大持久化字节数 |
| 类型         | int32                                    |
| 默认值       | 700                                      |
| 改后生效方式 | 仅允许在第一次启动服务前修改             |

- max_measurement_num_of_internal_request

| 名字         | max_measurement_num_of_internal_request                      |
| ------------ | ------------------------------------------------------------ |
| 描述         | 一次注册序列请求中若物理量过多，在系统内部执行时将被拆分为若干个轻量级的子请求，每个子请求中的物理量数目不超过此参数设置的最大值。 |
| 类型         | Int32                                                        |
| 默认值       | 10000                                                        |
| 改后生效方式 | 重启服务生效                                                     |

- datanode_schema_cache_eviction_policy

| 名字         | datanode_schema_cache_eviction_policy                 |
| ------------ | ----------------------------------------------------- |
| 描述         | 当 Schema 缓存达到其最大容量时，Schema 缓存的淘汰策略 |
| 类型         | String                                                |
| 默认值       | FIFO                                                  |
| 改后生效方式 | 重启服务生效                                              |

- cluster_timeseries_limit_threshold

| 名字         | cluster_timeseries_limit_threshold |
| ------------ | ---------------------------------- |
| 描述         | 集群中可以创建的时间序列的最大数量 |
| 类型         | Int32                              |
| 默认值       | -1                                 |
| 改后生效方式 | 重启服务生效                           |

- cluster_device_limit_threshold

| 名字         | cluster_device_limit_threshold |
| ------------ | ------------------------------ |
| 描述         | 集群中可以创建的最大设备数量   |
| 类型         | Int32                          |
| 默认值       | -1                             |
| 改后生效方式 | 重启服务生效                       |

- database_limit_threshold

| 名字         | database_limit_threshold       |
| ------------ | ------------------------------ |
| 描述         | 集群中可以创建的最大数据库数量 |
| 类型         | Int32                          |
| 默认值       | -1                             |
| 改后生效方式 | 重启服务生效                       |

### 3.16 自动推断数据类型

- enable_auto_create_schema

| 名字         | enable_auto_create_schema              |
| ------------ | -------------------------------------- |
| 描述         | 当写入的序列不存在时，是否自动创建序列 |
| 取值         | true or false                          |
| 默认值       | true                                   |
| 改后生效方式 | 重启服务生效                               |

- default_storage_group_level

| 名字         | default_storage_group_level                                  |
| ------------ | ------------------------------------------------------------ |
| 描述         | 当写入的数据不存在且自动创建序列时，若需要创建相应的 database，将序列路径的哪一层当做 database。例如，如果我们接到一个新序列 root.sg0.d1.s2, 并且 level=1， 那么 root.sg0 被视为database（因为 root 是 level 0 层） |
| 取值         | int32                                                        |
| 默认值       | 1                                                            |
| 改后生效方式 | 重启服务生效                                                     |

- boolean_string_infer_type

| 名字         | boolean_string_infer_type                  |
| ------------ | ------------------------------------------ |
| 描述         | "true" 或者 "false" 字符串被推断的数据类型 |
| 取值         | BOOLEAN 或者 TEXT                          |
| 默认值       | BOOLEAN                                    |
| 改后生效方式 | 重启服务生效                                   |

- integer_string_infer_type

| 名字         | integer_string_infer_type         |
| ------------ | --------------------------------- |
| 描述         | 整型字符串推断的数据类型          |
| 取值         | INT32, INT64, FLOAT, DOUBLE, TEXT |
| 默认值       | DOUBLE                            |
| 改后生效方式 | 重启服务生效                          |

- floating_string_infer_type

| 名字         | floating_string_infer_type    |
| ------------ | ----------------------------- |
| 描述         | "6.7"等字符串被推断的数据类型 |
| 取值         | DOUBLE, FLOAT or TEXT         |
| 默认值       | DOUBLE                        |
| 改后生效方式 | 重启服务生效                      |

- nan_string_infer_type

| 名字         | nan_string_infer_type        |
| ------------ | ---------------------------- |
| 描述         | "NaN" 字符串被推断的数据类型 |
| 取值         | DOUBLE, FLOAT or TEXT        |
| 默认值       | DOUBLE                       |
| 改后生效方式 | 重启服务生效                     |

- default_boolean_encoding

| 名字         | default_boolean_encoding |
| ------------ | ------------------------ |
| 描述         | BOOLEAN 类型编码格式     |
| 取值         | PLAIN, RLE               |
| 默认值       | RLE                      |
| 改后生效方式 | 重启服务生效                 |

- default_int32_encoding

| 名字         | default_int32_encoding                 |
| ------------ | -------------------------------------- |
| 描述         | int32 类型编码格式                     |
| 取值         | PLAIN, RLE, TS_2DIFF, REGULAR, GORILLA |
| 默认值       | TS_2DIFF                               |
| 改后生效方式 | 重启服务生效                               |

- default_int64_encoding

| 名字         | default_int64_encoding                 |
| ------------ | -------------------------------------- |
| 描述         | int64 类型编码格式                     |
| 取值         | PLAIN, RLE, TS_2DIFF, REGULAR, GORILLA |
| 默认值       | TS_2DIFF                               |
| 改后生效方式 | 重启服务生效                               |

- default_float_encoding

| 名字         | default_float_encoding        |
| ------------ | ----------------------------- |
| 描述         | float 类型编码格式            |
| 取值         | PLAIN, RLE, TS_2DIFF, GORILLA |
| 默认值       | GORILLA                       |
| 改后生效方式 | 重启服务生效                      |

- default_double_encoding

| 名字         | default_double_encoding       |
| ------------ | ----------------------------- |
| 描述         | double 类型编码格式           |
| 取值         | PLAIN, RLE, TS_2DIFF, GORILLA |
| 默认值       | GORILLA                       |
| 改后生效方式 | 重启服务生效                      |

- default_text_encoding

| 名字         | default_text_encoding |
| ------------ | --------------------- |
| 描述         | text 类型编码格式     |
| 取值         | PLAIN                 |
| 默认值       | PLAIN                 |
| 改后生效方式 | 重启服务生效              |

### 3.17 查询配置

- read_consistency_level

| 名字         | read_consistency_level                                       |
| ------------ | ------------------------------------------------------------ |
| 描述         | 查询一致性等级，取值 “strong” 时从 Leader 副本查询，取值 “weak” 时随机查询一个副本。 |
| 类型         | String                                                       |
| 默认值       | strong                                                       |
| 改后生效方式 | 重启服务生效                                                     |

- meta_data_cache_enable

| 名字         | meta_data_cache_enable                                       |
| ------------ | ------------------------------------------------------------ |
| 描述         | 是否缓存元数据（包括 BloomFilter、Chunk Metadata 和 TimeSeries Metadata。） |
| 类型         | Boolean                                                      |
| 默认值       | true                                                         |
| 改后生效方式 | 重启服务生效                                                     |

- chunk_timeseriesmeta_free_memory_proportion

| 名字         | chunk_timeseriesmeta_free_memory_proportion                  |
| ------------ | ------------------------------------------------------------ |
| 描述         | 读取内存分配比例，BloomFilterCache、ChunkCache、TimeseriesMetadataCache、数据集查询的内存和可用内存的查询。参数形式为a : b : c : d : e，其中a、b、c、d、e为整数。 例如“1 : 1 : 1 : 1 : 1” ，“1 : 100 : 200 : 300 : 400” 。 |
| 类型         | String                                                       |
| 默认值       | 1 : 100 : 200 : 300 : 400                                    |
| 改后生效方式 | 重启服务生效                                                     |

- enable_last_cache

| 名字         | enable_last_cache  |
| ------------ | ------------------ |
| 描述         | 是否开启最新点缓存 |
| 类型         | Boolean            |
| 默认值       | true               |
| 改后生效方式 | 重启服务生效           |

- mpp_data_exchange_core_pool_size

| 名字         | mpp_data_exchange_core_pool_size |
| ------------ | -------------------------------- |
| 描述         | MPP 数据交换线程池核心线程数     |
| 类型         | int32                            |
| 默认值       | 10                               |
| 改后生效方式 | 重启服务生效                         |

- mpp_data_exchange_max_pool_size

| 名字         | mpp_data_exchange_max_pool_size |
| ------------ | ------------------------------- |
| 描述         | MPP 数据交换线程池最大线程数    |
| 类型         | int32                           |
| 默认值       | 10                              |
| 改后生效方式 | 重启服务生效                        |

- mpp_data_exchange_keep_alive_time_in_ms

| 名字         | mpp_data_exchange_keep_alive_time_in_ms |
| ------------ | --------------------------------------- |
| 描述         | MPP 数据交换最大等待时间                |
| 类型         | int32                                   |
| 默认值       | 1000                                    |
| 改后生效方式 | 重启服务生效                                |

- driver_task_execution_time_slice_in_ms

| 名字         | driver_task_execution_time_slice_in_ms |
| ------------ | -------------------------------------- |
| 描述         | 单个 DriverTask 最长执行时间（ms）     |
| 类型         | int32                                  |
| 默认值       | 200                                    |
| 改后生效方式 | 重启服务生效                               |

- max_tsblock_size_in_bytes

| 名字         | max_tsblock_size_in_bytes       |
| ------------ | ------------------------------- |
| 描述         | 单个 TsBlock 的最大容量（byte） |
| 类型         | int32                           |
| 默认值       | 131072                          |
| 改后生效方式 | 重启服务生效                        |

- max_tsblock_line_numbers

| 名字         | max_tsblock_line_numbers |
| ------------ | ------------------------ |
| 描述         | 单个 TsBlock 的最大行数  |
| 类型         | int32                    |
| 默认值       | 1000                     |
| 改后生效方式 | 重启服务生效                 |

- slow_query_threshold

| 名字         | slow_query_threshold           |
| ------------ | ------------------------------ |
| 描述         | 慢查询的时间阈值。单位：毫秒。 |
| 类型         | long                           |
| 默认值       | 10000                          |
| 改后生效方式 | 热加载                         |

- query_timeout_threshold

| 名字         | query_timeout_threshold          |
| ------------ | -------------------------------- |
| 描述         | 查询的最大执行时间。单位：毫秒。 |
| 类型         | Int32                            |
| 默认值       | 60000                            |
| 改后生效方式 | 重启服务生效                         |

- max_allowed_concurrent_queries

| 名字         | max_allowed_concurrent_queries |
| ------------ | ------------------------------ |
| 描述         | 允许的最大并发查询数量。       |
| 类型         | Int32                          |
| 默认值       | 1000                           |
| 改后生效方式 | 重启服务生效                       |

- query_thread_count

| 名字         | query_thread_count                                           |
| ------------ | ------------------------------------------------------------ |
| 描述         | 当 IoTDB 对内存中的数据进行查询时，最多启动多少个线程来执行该操作。如果该值小于等于 0，那么采用机器所安装的 CPU 核的数量。 |
| 类型         | Int32                                                        |
| 默认值       | 0                                                            |
| 改后生效方式 | 重启服务生效                                                     |

- degree_of_query_parallelism

| 名字         | degree_of_query_parallelism                                  |
| ------------ | ------------------------------------------------------------ |
| 描述         | 设置单个查询片段实例将创建的 pipeline 驱动程序数量，也就是查询操作的并行度。 |
| 类型         | Int32                                                        |
| 默认值       | 0                                                            |
| 改后生效方式 | 重启服务生效                                                     |

- mode_map_size_threshold

| 名字         | mode_map_size_threshold                        |
| ------------ | ---------------------------------------------- |
| 描述         | 计算 MODE 聚合函数时，计数映射可以增长到的阈值 |
| 类型         | Int32                                          |
| 默认值       | 10000                                          |
| 改后生效方式 | 重启服务生效                                       |

- batch_size

| 名字         | batch_size                                                 |
| ------------ | ---------------------------------------------------------- |
| 描述         | 服务器中每次迭代的数据量（数据条目，即不同时间戳的数量。） |
| 类型         | Int32                                                      |
| 默认值       | 100000                                                     |
| 改后生效方式 | 重启服务生效                                                   |

- sort_buffer_size_in_bytes

| 名字         | sort_buffer_size_in_bytes              |
| ------------ | -------------------------------------- |
| 描述         | 设置外部排序操作中使用的内存缓冲区大小 |
| 类型         | long                                   |
| 默认值       | 1048576                                |
| 改后生效方式 | 重启服务生效                               |

- merge_threshold_of_explain_analyze

| 名字         | merge_threshold_of_explain_analyze                           |
| ------------ | ------------------------------------------------------------ |
| 描述         | 用于设置在 `EXPLAIN ANALYZE` 语句的结果集中操作符（operator）数量的合并阈值。 |
| 类型         | int                                                          |
| 默认值       | 10                                                           |
| 改后生效方式 | 热加载                                                       |

###  3.18 TTL配置

- ttl_check_interval

| 名字         | ttl_check_interval                     |
| ------------ | -------------------------------------- |
| 描述         | ttl 检查任务的间隔，单位 ms，默认为 2h |
| 类型         | int                                    |
| 默认值       | 7200000                                |
| 改后生效方式 | 重启服务生效                               |

- max_expired_time

| 名字         | max_expired_time                                             |
| ------------ | ------------------------------------------------------------ |
| 描述         | 如果一个文件中存在设备已经过期超过此时间，那么这个文件将被立即整理。单位 ms，默认为一个月 |
| 类型         | int                                                          |
| 默认值       | 2592000000                                                   |
| 改后生效方式 | 重启服务生效                                                     |

- expired_data_ratio

| 名字         | expired_data_ratio                                           |
| ------------ | ------------------------------------------------------------ |
| 描述         | 过期设备比例。如果一个文件中过期设备的比率超过这个值，那么这个文件中的过期数据将通过 compaction 清理。 |
| 类型         | float                                                        |
| 默认值       | 0.3                                                          |
| 改后生效方式 | 重启服务生效                                                     |

### 3.19 存储引擎配置

- timestamp_precision

| 名字         | timestamp_precision          |
| ------------ | ---------------------------- |
| 描述         | 时间戳精度，支持 ms、us、ns  |
| 类型         | String                       |
| 默认值       | ms                           |
| 改后生效方式 | 仅允许在第一次启动服务前修改 |

- timestamp_precision_check_enabled

| 名字         | timestamp_precision_check_enabled |
| ------------ | --------------------------------- |
| 描述         | 用于控制是否启用时间戳精度检查    |
| 类型         | Boolean                           |
| 默认值       | true                              |
| 改后生效方式 | 仅允许在第一次启动服务前修改      |

- max_waiting_time_when_insert_blocked

| 名字         | max_waiting_time_when_insert_blocked            |
| ------------ | ----------------------------------------------- |
| 描述         | 当插入请求等待超过这个时间，则抛出异常，单位 ms |
| 类型         | Int32                                           |
| 默认值       | 10000                                           |
| 改后生效方式 | 重启服务生效                                        |

- handle_system_error

| 名字         | handle_system_error                  |
| ------------ | ------------------------------------ |
| 描述         | 当系统遇到不可恢复的错误时的处理方法 |
| 类型         | String                               |
| 默认值       | CHANGE_TO_READ_ONLY                  |
| 改后生效方式 | 重启服务生效                             |

- enable_timed_flush_seq_memtable

| 名字         | enable_timed_flush_seq_memtable |
| ------------ | ------------------------------- |
| 描述         | 是否开启定时刷盘顺序 memtable   |
| 类型         | Boolean                         |
| 默认值       | true                            |
| 改后生效方式 | 热加载                          |

- seq_memtable_flush_interval_in_ms

| 名字         | seq_memtable_flush_interval_in_ms                            |
| ------------ | ------------------------------------------------------------ |
| 描述         | 当 memTable 的创建时间小于当前时间减去该值时，该 memtable 需要被刷盘 |
| 类型         | long                                                         |
| 默认值       | 600000                                                       |
| 改后生效方式 | 热加载                                                       |

- seq_memtable_flush_check_interval_in_ms

| 名字         | seq_memtable_flush_check_interval_in_ms  |
| ------------ | ---------------------------------------- |
| 描述         | 检查顺序 memtable 是否需要刷盘的时间间隔 |
| 类型         | long                                     |
| 默认值       | 30000                                    |
| 改后生效方式 | 热加载                                   |

- enable_timed_flush_unseq_memtable

| 名字         | enable_timed_flush_unseq_memtable |
| ------------ | --------------------------------- |
| 描述         | 是否开启定时刷新乱序 memtable     |
| 类型         | Boolean                           |
| 默认值       | true                              |
| 改后生效方式 | 热加载                            |

- unseq_memtable_flush_interval_in_ms

| 名字         | unseq_memtable_flush_interval_in_ms                          |
| ------------ | ------------------------------------------------------------ |
| 描述         | 当 memTable 的创建时间小于当前时间减去该值时，该 memtable 需要被刷盘 |
| 类型         | long                                                         |
| 默认值       | 600000                                                       |
| 改后生效方式 | 热加载                                                       |

- unseq_memtable_flush_check_interval_in_ms

| 名字         | unseq_memtable_flush_check_interval_in_ms |
| ------------ | ----------------------------------------- |
| 描述         | 检查乱序 memtable 是否需要刷盘的时间间隔  |
| 类型         | long                                      |
| 默认值       | 30000                                     |
| 改后生效方式 | 热加载                                    |

- tvlist_sort_algorithm

| 名字         | tvlist_sort_algorithm    |
| ------------ | ------------------------ |
| 描述         | memtable中数据的排序方法 |
| 类型         | String                   |
| 默认值       | TIM                      |
| 改后生效方式 | 重启服务生效                 |

- avg_series_point_number_threshold

| 名字         | avg_series_point_number_threshold                |
| ------------ | ------------------------------------------------ |
| 描述         | 内存中平均每个时间序列点数最大值，达到触发 flush |
| 类型         | int32                                            |
| 默认值       | 100000                                           |
| 改后生效方式 | 重启服务生效                                         |

- flush_thread_count

| 名字         | flush_thread_count                                           |
| ------------ | ------------------------------------------------------------ |
| 描述         | 当 IoTDB 将内存中的数据写入磁盘时，最多启动多少个线程来执行该操作。如果该值小于等于 0，那么采用机器所安装的 CPU 核的数量。默认值为 0。 |
| 类型         | int32                                                        |
| 默认值       | 0                                                            |
| 改后生效方式 | 重启服务生效                                                     |

- enable_partial_insert

| 名字         | enable_partial_insert                                        |
| ------------ | ------------------------------------------------------------ |
| 描述         | 在一次 insert 请求中，如果部分测点写入失败，是否继续写入其他测点。 |
| 类型         | Boolean                                                      |
| 默认值       | true                                                         |
| 改后生效方式 | 重启服务生效                                                     |

- recovery_log_interval_in_ms

| 名字         | recovery_log_interval_in_ms               |
| ------------ | ----------------------------------------- |
| 描述         | data region的恢复过程中打印日志信息的间隔 |
| 类型         | Int32                                     |
| 默认值       | 5000                                      |
| 改后生效方式 | 重启服务生效                                  |

- 0.13_data_insert_adapt

| 名字         | 0.13_data_insert_adapt                                  |
| ------------ | ------------------------------------------------------- |
| 描述         | 如果 0.13 版本客户端进行写入，需要将此配置项设置为 true |
| 类型         | Boolean                                                 |
| 默认值       | false                                                   |
| 改后生效方式 | 重启服务生效                                                |

- enable_tsfile_validation

| 名字         | enable_tsfile_validation               |
| ------------ | -------------------------------------- |
| 描述         | Flush, Load 或合并后验证 tsfile 正确性 |
| 类型         | boolean                                |
| 默认值       | false                                  |
| 改后生效方式 | 热加载                                 |

- tier_ttl_in_ms

| 名字         | tier_ttl_in_ms                            |
| ------------ | ----------------------------------------- |
| 描述         | 定义每个层级负责的数据范围，通过 TTL 表示 |
| 类型         | long                                      |
| 默认值       | -1                                        |
| 改后生效方式 | 重启服务生效                                  |

### 3.20 合并配置

- enable_seq_space_compaction

| 名字         | enable_seq_space_compaction            |
| ------------ | -------------------------------------- |
| 描述         | 顺序空间内合并，开启顺序文件之间的合并 |
| 类型         | Boolean                                |
| 默认值       | true                                   |
| 改后生效方式 | 热加载                                 |

- enable_unseq_space_compaction

| 名字         | enable_unseq_space_compaction          |
| ------------ | -------------------------------------- |
| 描述         | 乱序空间内合并，开启乱序文件之间的合并 |
| 类型         | Boolean                                |
| 默认值       | true                                   |
| 改后生效方式 | 热加载                                 |

- enable_cross_space_compaction

| 名字         | enable_cross_space_compaction              |
| ------------ | ------------------------------------------ |
| 描述         | 跨空间合并，开启将乱序文件合并到顺序文件中 |
| 类型         | Boolean                                    |
| 默认值       | true                                       |
| 改后生效方式 | 热加载                                     |

- enable_auto_repair_compaction

| 名字         | enable_auto_repair_compaction |
| ------------ | ----------------------------- |
| 描述         | 修复文件的合并任务            |
| 类型         | Boolean                       |
| 默认值       | true                          |
| 改后生效方式 | 热加载                        |

- cross_selector

| 名字         | cross_selector             |
| ------------ | -------------------------- |
| 描述         | 跨空间合并任务选择器的类型 |
| 类型         | String                     |
| 默认值       | rewrite                    |
| 改后生效方式 | 重启服务生效                   |

- cross_performer

| 名字         | cross_performer                                              |
| ------------ | ------------------------------------------------------------ |
| 描述         | 跨空间合并任务执行器的类型，可选项是read_point和fast，默认是read_point，fast还在测试中 |
| 类型         | String                                                       |
| 默认值       | read_point                                                   |
| 改后生效方式 | 重启服务生效                                                     |

- inner_seq_selector

| 名字         | inner_seq_selector                                           |
| ------------ | ------------------------------------------------------------ |
| 描述         | 顺序空间内合并任务选择器的类型,可选 size_tiered_single_\target,size_tiered_multi_target |
| 类型         | String                                                       |
| 默认值       | size_tiered_multi_target                                     |
| 改后生效方式 | 热加载                                                       |

- inner_seq_performer

| 名字         | inner_seq_performer                                          |
| ------------ | ------------------------------------------------------------ |
| 描述         | 顺序空间内合并任务执行器的类型，可选项是read_chunk和fast，默认是read_chunk，fast还在测试中 |
| 类型         | String                                                       |
| 默认值       | read_chunk                                                   |
| 改后生效方式 | 重启服务生效                                                     |

- inner_unseq_selector

| 名字         | inner_unseq_selector                                         |
| ------------ | ------------------------------------------------------------ |
| 描述         | 乱序空间内合并任务选择器的类型,可选 size_tiered_single_\target,size_tiered_multi_target |
| 类型         | String                                                       |
| 默认值       | size_tiered_multi_target                                     |
| 改后生效方式 | 热加载                                                       |

- inner_unseq_performer

| 名字         | inner_unseq_performer                                        |
| ------------ | ------------------------------------------------------------ |
| 描述         | 乱序空间内合并任务执行器的类型，可选项是read_point和fast，默认是read_point，fast还在测试中 |
| 类型         | String                                                       |
| 默认值       | read_point                                                   |
| 改后生效方式 | 重启服务生效                                                     |

- compaction_priority

| 名字         | compaction_priority                                          |
| ------------ | ------------------------------------------------------------ |
| 描述         | 合并时的优先级，BALANCE 各种合并平等，INNER_CROSS 优先进行顺序文件和顺序文件或乱序文件和乱序文件的合并，CROSS_INNER 优先将乱序文件合并到顺序文件中 |
| 类型         | String                                                       |
| 默认值       | INNER_CROSS                                                  |
| 改后生效方式 | 重启服务生效                                                 |

- candidate_compaction_task_queue_size

| 名字         | candidate_compaction_task_queue_size |
| ------------ | ------------------------------------ |
| 描述         | 合并任务优先级队列的大小             |
| 类型         | int32                                |
| 默认值       | 50                                   |
| 改后生效方式 | 重启服务生效                             |

- target_compaction_file_size

| 名字         | target_compaction_file_size |
| ------------ | --------------------------- |
| 描述         | 合并后的目标文件大小        |
| 类型         | Int64                       |
| 默认值       | 2147483648                  |
| 改后生效方式 | 热加载                      |

- inner_compaction_total_file_size_threshold

| 名字         | inner_compaction_total_file_size_threshold   |
| ------------ | -------------------------------------------- |
| 描述         | 空间内合并任务最大选中文件总大小，单位：byte |
| 类型         | int64                                        |
| 默认值       | 10737418240                                  |
| 改后生效方式 | 热加载                                       |

- inner_compaction_total_file_num_threshold

| 名字         | inner_compaction_total_file_num_threshold |
| ------------ | ----------------------------------------- |
| 描述         | 空间内合并中一次合并最多参与的文件数      |
| 类型         | int32                                     |
| 默认值       | 100                                       |
| 改后生效方式 | 热加载                                    |

- max_level_gap_in_inner_compaction

| 名字         | max_level_gap_in_inner_compaction      |
| ------------ | -------------------------------------- |
| 描述         | 空间内合并选文件时最大允许跨的文件层级 |
| 类型         | int32                                  |
| 默认值       | 2                                      |
| 改后生效方式 | 热加载                                 |

- target_chunk_size

| 名字         | target_chunk_size       |
| ------------ | ----------------------- |
| 描述         | 合并时 Chunk 的目标大小 |
| 类型         | Int64                   |
| 默认值       | 1048576                 |
| 改后生效方式 | 重启服务生效                |

- target_chunk_point_num

| 名字         | target_chunk_point_num  |
| ------------ | ----------------------- |
| 描述         | 合并时 Chunk 的目标点数 |
| 类型         | int32                   |
| 默认值       | 100000                  |
| 改后生效方式 | 重启服务生效                |

- chunk_size_lower_bound_in_compaction

| 名字         | chunk_size_lower_bound_in_compaction                  |
| ------------ | ----------------------------------------------------- |
| 描述         | 合并时源 Chunk 的大小小于这个值，将被解开成点进行合并 |
| 类型         | Int64                                                 |
| 默认值       | 10240                                                 |
| 改后生效方式 | 重启服务生效                                              |

- chunk_point_num_lower_bound_in_compaction

| 名字         | chunk_point_num_lower_bound_in_compaction             |
| ------------ | ----------------------------------------------------- |
| 描述         | 合并时源 Chunk 的点数小于这个值，将被解开成点进行合并 |
| 类型         | int32                                                 |
| 默认值       | 1000                                                  |
| 改后生效方式 | 重启服务生效                                              |

- inner_compaction_candidate_file_num

| 名字         | inner_compaction_candidate_file_num      |
| ------------ | ---------------------------------------- |
| 描述         | 符合构成一个空间内合并任务的候选文件数量 |
| 类型         | int32                                    |
| 默认值       | 30                                       |
| 改后生效方式 | 热加载                                   |

- max_cross_compaction_candidate_file_num

| 名字         | max_cross_compaction_candidate_file_num |
| ------------ | --------------------------------------- |
| 描述         | 跨空间合并中一次合并最多参与的文件数    |
| 类型         | int32                                   |
| 默认值       | 500                                     |
| 改后生效方式 | 热加载                                  |

- max_cross_compaction_candidate_file_size

| 名字         | max_cross_compaction_candidate_file_size |
| ------------ | ---------------------------------------- |
| 描述         | 跨空间合并中一次合并最多参与的文件总大小 |
| 类型         | Int64                                    |
| 默认值       | 5368709120                               |
| 改后生效方式 | 热加载                                   |

- min_cross_compaction_unseq_file_level

| 名字         | min_cross_compaction_unseq_file_level          |
| ------------ | ---------------------------------------------- |
| 描述         | 乱序空间中跨空间合并中文件的最小内部压缩级别。 |
| 类型         | int32                                          |
| 默认值       | 1                                              |
| 改后生效方式 | 热加载                                         |

- compaction_thread_count

| 名字         | compaction_thread_count |
| ------------ | ----------------------- |
| 描述         | 执行合并任务的线程数目  |
| 类型         | int32                   |
| 默认值       | 10                      |
| 改后生效方式 | 热加载                  |

- compaction_max_aligned_series_num_in_one_batch

| 名字         | compaction_max_aligned_series_num_in_one_batch |
| ------------ | ---------------------------------------------- |
| 描述         | 对齐序列合并一次执行时处理的值列数量           |
| 类型         | int32                                          |
| 默认值       | 10                                             |
| 改后生效方式 | 热加载                                         |

- compaction_schedule_interval_in_ms

| 名字         | compaction_schedule_interval_in_ms |
| ------------ | ---------------------------------- |
| 描述         | 合并调度的时间间隔                 |
| 类型         | Int64                              |
| 默认值       | 60000                              |
| 改后生效方式 | 重启服务生效                           |

- compaction_write_throughput_mb_per_sec

| 名字         | compaction_write_throughput_mb_per_sec |
| ------------ | -------------------------------------- |
| 描述         | 每秒可达到的写入吞吐量合并限制。       |
| 类型         | int32                                  |
| 默认值       | 16                                     |
| 改后生效方式 | 重启服务生效                               |

- compaction_read_throughput_mb_per_sec

| 名字      | compaction_read_throughput_mb_per_sec                |
| --------- | ---------------------------------------------------- |
| 描述      | 合并每秒读吞吐限制，单位为 byte，设置为 0 代表不限制 |
| 类型      | int32                                                |
| 默认值    | 0                                                    |
| Effective | 热加载                                               |

- compaction_read_operation_per_sec

| 名字      | compaction_read_operation_per_sec           |
| --------- | ------------------------------------------- |
| 描述      | 合并每秒读操作数量限制，设置为 0 代表不限制 |
| 类型      | int32                                       |
| 默认值    | 0                                           |
| Effective | 热加载                                      |

- sub_compaction_thread_count

| 名字         | sub_compaction_thread_count                                  |
| ------------ | ------------------------------------------------------------ |
| 描述         | 每个合并任务的子任务线程数，只对跨空间合并和乱序空间内合并生效 |
| 类型         | int32                                                        |
| 默认值       | 4                                                            |
| 改后生效方式 | 热加载                                                       |

- inner_compaction_task_selection_disk_redundancy

| 名字         | inner_compaction_task_selection_disk_redundancy |
| ------------ | ----------------------------------------------- |
| 描述         | 定义了磁盘可用空间的冗余值，仅用于内部压缩      |
| 类型         | double                                          |
| 默认值       | 0.05                                            |
| 改后生效方式 | 热加载                                          |

- inner_compaction_task_selection_mods_file_threshold

| 名字         | inner_compaction_task_selection_mods_file_threshold |
| ------------ | --------------------------------------------------- |
| 描述         | 定义了mods文件大小的阈值，仅用于内部压缩。          |
| 类型         | long                                                |
| 默认值       | 131072                                              |
| 改后生效方式 | 热加载                                              |

- compaction_schedule_thread_num

| 名字         | compaction_schedule_thread_num |
| ------------ | ------------------------------ |
| 描述         | 选择合并任务的线程数量         |
| 类型         | int32                          |
| 默认值       | 4                              |
| 改后生效方式 | 热加载                         |

### 3.21 写前日志配置

- wal_mode

| 名字         | wal_mode                                                     |
| ------------ | ------------------------------------------------------------ |
| 描述         | 写前日志的写入模式. DISABLE 模式下会关闭写前日志；SYNC 模式下写入请求会在成功写入磁盘后返回； ASYNC 模式下写入请求返回时可能尚未成功写入磁盘后。 |
| 类型         | String                                                       |
| 默认值       | ASYNC                                                        |
| 改后生效方式 | 重启服务生效                                                     |

- max_wal_nodes_num

| 名字         | max_wal_nodes_num                                     |
| ------------ | ----------------------------------------------------- |
| 描述         | 写前日志节点的最大数量，默认值 0 表示数量由系统控制。 |
| 类型         | int32                                                 |
| 默认值       | 0                                                     |
| 改后生效方式 | 重启服务生效                                              |

- wal_async_mode_fsync_delay_in_ms

| 名字         | wal_async_mode_fsync_delay_in_ms            |
| ------------ | ------------------------------------------- |
| 描述         | async 模式下写前日志调用 fsync 前的等待时间 |
| 类型         | int32                                       |
| 默认值       | 1000                                        |
| 改后生效方式 | 热加载                                      |

- wal_sync_mode_fsync_delay_in_ms

| 名字         | wal_sync_mode_fsync_delay_in_ms            |
| ------------ | ------------------------------------------ |
| 描述         | sync 模式下写前日志调用 fsync 前的等待时间 |
| 类型         | int32                                      |
| 默认值       | 3                                          |
| 改后生效方式 | 热加载                                     |

- wal_buffer_size_in_byte

| 名字         | wal_buffer_size_in_byte |
| ------------ | ----------------------- |
| 描述         | 写前日志的 buffer 大小  |
| 类型         | int32                   |
| 默认值       | 33554432                |
| 改后生效方式 | 重启服务生效                |

- wal_buffer_queue_capacity

| 名字         | wal_buffer_queue_capacity |
| ------------ | ------------------------- |
| 描述         | 写前日志阻塞队列大小上限  |
| 类型         | int32                     |
| 默认值       | 500                       |
| 改后生效方式 | 重启服务生效                  |

- wal_file_size_threshold_in_byte

| 名字         | wal_file_size_threshold_in_byte |
| ------------ | ------------------------------- |
| 描述         | 写前日志文件封口阈值            |
| 类型         | int32                           |
| 默认值       | 31457280                        |
| 改后生效方式 | 热加载                          |

- wal_min_effective_info_ratio

| 名字         | wal_min_effective_info_ratio |
| ------------ | ---------------------------- |
| 描述         | 写前日志最小有效信息比       |
| 类型         | double                       |
| 默认值       | 0.1                          |
| 改后生效方式 | 热加载                       |

- wal_memtable_snapshot_threshold_in_byte

| 名字         | wal_memtable_snapshot_threshold_in_byte  |
| ------------ | ---------------------------------------- |
| 描述         | 触发写前日志中内存表快照的内存表大小阈值 |
| 类型         | int64                                    |
| 默认值       | 8388608                                  |
| 改后生效方式 | 热加载                                   |

- max_wal_memtable_snapshot_num

| 名字         | max_wal_memtable_snapshot_num  |
| ------------ | ------------------------------ |
| 描述         | 写前日志中内存表的最大数量上限 |
| 类型         | int32                          |
| 默认值       | 1                              |
| 改后生效方式 | 热加载                         |

- delete_wal_files_period_in_ms

| 名字         | delete_wal_files_period_in_ms |
| ------------ | ----------------------------- |
| 描述         | 删除写前日志的检查间隔        |
| 类型         | int64                         |
| 默认值       | 20000                         |
| 改后生效方式 | 热加载                        |

- wal_throttle_threshold_in_byte

| 名字         | wal_throttle_threshold_in_byte                               |
| ------------ | ------------------------------------------------------------ |
| 描述         | 在IoTConsensus中，当WAL文件的大小达到一定阈值时，会开始对写入操作进行节流，以控制写入速度。 |
| 类型         | long                                                         |
| 默认值       | 53687091200                                                  |
| 改后生效方式 | 热加载                                                       |

- iot_consensus_cache_window_time_in_ms

| 名字         | iot_consensus_cache_window_time_in_ms    |
| ------------ | ---------------------------------------- |
| 描述         | 在IoTConsensus中，写缓存的最大等待时间。 |
| 类型         | long                                     |
| 默认值       | -1                                       |
| 改后生效方式 | 热加载                                   |

- enable_wal_compression

| 名字         | iot_consensus_cache_window_time_in_ms |
| ------------ | ------------------------------------- |
| 描述         | 用于控制是否启用WAL的压缩。           |
| 类型         | boolean                               |
| 默认值       | true                                  |
| 改后生效方式 | 热加载                                |

### 3.22 IoT 共识协议配置

当Region配置了IoTConsensus共识协议之后，下述的配置项才会生效

- data_region_iot_max_log_entries_num_per_batch

| 名字         | data_region_iot_max_log_entries_num_per_batch |
| ------------ | --------------------------------------------- |
| 描述         | IoTConsensus batch 的最大日志条数             |
| 类型         | int32                                         |
| 默认值       | 1024                                          |
| 改后生效方式 | 重启服务生效                                      |

- data_region_iot_max_size_per_batch

| 名字         | data_region_iot_max_size_per_batch |
| ------------ | ---------------------------------- |
| 描述         | IoTConsensus batch 的最大大小      |
| 类型         | int32                              |
| 默认值       | 16777216                           |
| 改后生效方式 | 重启服务生效                           |

- data_region_iot_max_pending_batches_num

| 名字         | data_region_iot_max_pending_batches_num |
| ------------ | --------------------------------------- |
| 描述         | IoTConsensus batch 的流水线并发阈值     |
| 类型         | int32                                   |
| 默认值       | 5                                       |
| 改后生效方式 | 重启服务生效                                |

- data_region_iot_max_memory_ratio_for_queue

| 名字         | data_region_iot_max_memory_ratio_for_queue |
| ------------ | ------------------------------------------ |
| 描述         | IoTConsensus 队列内存分配比例              |
| 类型         | double                                     |
| 默认值       | 0.6                                        |
| 改后生效方式 | 重启服务生效                                   |

- region_migration_speed_limit_bytes_per_second

| 名字         | region_migration_speed_limit_bytes_per_second |
| ------------ | --------------------------------------------- |
| 描述         | 定义了在region迁移过程中，数据传输的最大速率  |
| 类型         | long                                          |
| 默认值       | 33554432                                      |
| 改后生效方式 | 重启服务生效                                      |

### 3.23 TsFile配置

- group_size_in_byte

| 名字         | group_size_in_byte                             |
| ------------ | ---------------------------------------------- |
| 描述         | 每次将内存中的数据写入到磁盘时的最大写入字节数 |
| 类型         | int32                                          |
| 默认值       | 134217728                                      |
| 改后生效方式 | 热加载                                         |

- page_size_in_byte

| 名字         | page_size_in_byte                                    |
| ------------ | ---------------------------------------------------- |
| 描述         | 内存中每个列写出时，写成的单页最大的大小，单位为字节 |
| 类型         | int32                                                |
| 默认值       | 65536                                                |
| 改后生效方式 | 热加载                                               |

- max_number_of_points_in_page

| 名字         | max_number_of_points_in_page                      |
| ------------ | ------------------------------------------------- |
| 描述         | 一个页中最多包含的数据点（时间戳-值的二元组）数量 |
| 类型         | int32                                             |
| 默认值       | 10000                                             |
| 改后生效方式 | 热加载                                            |

- pattern_matching_threshold

| 名字         | pattern_matching_threshold     |
| ------------ | ------------------------------ |
| 描述         | 正则表达式匹配时最大的匹配次数 |
| 类型         | int32                          |
| 默认值       | 1000000                        |
| 改后生效方式 | 热加载                         |

- float_precision

| 名字         | float_precision                                              |
| ------------ | ------------------------------------------------------------ |
| 描述         | 浮点数精度，为小数点后数字的位数                             |
| 类型         | int32                                                        |
| 默认值       | 默认为 2 位。注意：32 位浮点数的十进制精度为 7 位，64 位浮点数的十进制精度为 15 位。如果设置超过机器精度将没有实际意义。 |
| 改后生效方式 | 热加载                                                       |

- value_encoder

| 名字         | value_encoder                         |
| ------------ | ------------------------------------- |
| 描述         | value 列编码方式                      |
| 类型         | 枚举 String: “TS_2DIFF”,“PLAIN”,“RLE” |
| 默认值       | PLAIN                                 |
| 改后生效方式 | 热加载                                |

- compressor

| 名字         | compressor                                                   |
| ------------ | ------------------------------------------------------------ |
| 描述         | 数据压缩方法; 对齐序列中时间列的压缩方法                     |
| 类型         | 枚举 String : "UNCOMPRESSED", "SNAPPY", "LZ4", "ZSTD", "LZMA2" |
| 默认值       | LZ4                                                          |
| 改后生效方式 | 热加载                                                       |

- encrypt_flag

| 名字         | compressor                   |
| ------------ | ---------------------------- |
| 描述         | 用于开启或关闭数据加密功能。 |
| 类型         | Boolean                      |
| 默认值       | false                        |
| 改后生效方式 | 重启服务生效                     |

- encrypt_type

| 名字         | compressor                            |
| ------------ | ------------------------------------- |
| 描述         | 数据加密的方法。                      |
| 类型         | String                                |
| 默认值       | org.apache.tsfile.encrypt.UNENCRYPTED |
| 改后生效方式 | 重启服务生效                              |

- encrypt_key_path

| 名字         | encrypt_key_path             |
| ------------ | ---------------------------- |
| 描述         | 数据加密使用的密钥来源路径。 |
| 类型         | String                       |
| 默认值       | 无                           |
| 改后生效方式 | 重启服务生效                     |

### 3.24 授权配置

- authorizer_provider_class

| 名字         | authorizer_provider_class                                    |
| ------------ | ------------------------------------------------------------ |
| 描述         | 权限服务的类名                                               |
| 类型         | String                                                       |
| 默认值       | org.apache.iotdb.commons.auth.authorizer.LocalFileAuthorizer |
| 改后生效方式 | 重启服务生效                                                     |
| 其他可选值   | org.apache.iotdb.commons.auth.authorizer.OpenIdAuthorizer    |

- openID_url

| 名字         | openID_url                                                 |
| ------------ | ---------------------------------------------------------- |
| 描述         | openID 服务器地址 （当 OpenIdAuthorizer 被启用时必须设定） |
| 类型         | String（一个 http 地址）                                   |
| 默认值       | 无                                                         |
| 改后生效方式 | 重启服务生效                                                   |

- iotdb_server_encrypt_decrypt_provider

| 名字         | iotdb_server_encrypt_decrypt_provider                        |
| ------------ | ------------------------------------------------------------ |
| 描述         | 用于用户密码加密的类                                         |
| 类型         | String                                                       |
| 默认值       | org.apache.iotdb.commons.security.encrypt.MessageDigestEncrypt |
| 改后生效方式 | 仅允许在第一次启动服务前修改                                 |

- iotdb_server_encrypt_decrypt_provider_parameter

| 名字         | iotdb_server_encrypt_decrypt_provider_parameter |
| ------------ | ----------------------------------------------- |
| 描述         | 用于初始化用户密码加密类的参数                  |
| 类型         | String                                          |
| 默认值       | 无                                              |
| 改后生效方式 | 仅允许在第一次启动服务前修改                    |

- author_cache_size

| 名字         | author_cache_size        |
| ------------ | ------------------------ |
| 描述         | 用户缓存与角色缓存的大小 |
| 类型         | int32                    |
| 默认值       | 1000                     |
| 改后生效方式 | 重启服务生效                 |

- author_cache_expire_time

| 名字         | author_cache_expire_time               |
| ------------ | -------------------------------------- |
| 描述         | 用户缓存与角色缓存的有效期，单位为分钟 |
| 类型         | int32                                  |
| 默认值       | 30                                     |
| 改后生效方式 | 重启服务生效                               |

### 3.25 UDF配置

- udf_initial_byte_array_length_for_memory_control

| 名字         | udf_initial_byte_array_length_for_memory_control             |
| ------------ | ------------------------------------------------------------ |
| 描述         | 用于评估UDF查询中文本字段的内存使用情况。建议将此值设置为略大于所有文本的平均长度记录。 |
| 类型         | int32                                                        |
| 默认值       | 48                                                           |
| 改后生效方式 | 重启服务生效                                                     |

- udf_memory_budget_in_mb

| 名字         | udf_memory_budget_in_mb                                      |
| ------------ | ------------------------------------------------------------ |
| 描述         | 在一个UDF查询中使用多少内存（以 MB 为单位）。上限为已分配内存的 20% 用于读取。 |
| 类型         | Float                                                        |
| 默认值       | 30.0                                                         |
| 改后生效方式 | 重启服务生效                                                     |

- udf_reader_transformer_collector_memory_proportion

| 名字         | udf_reader_transformer_collector_memory_proportion        |
| ------------ | --------------------------------------------------------- |
| 描述         | UDF内存分配比例。参数形式为a : b : c，其中a、b、c为整数。 |
| 类型         | String                                                    |
| 默认值       | 1:1:1                                                     |
| 改后生效方式 | 重启服务生效                                                  |

- udf_lib_dir

| 名字         | udf_lib_dir                  |
| ------------ | ---------------------------- |
| 描述         | UDF 日志及jar文件存储路径    |
| 类型         | String                       |
| 默认值       | ext/udf（Windows：ext\\udf） |
| 改后生效方式 | 重启服务生效                     |

### 3.26 触发器配置

- trigger_lib_dir

| 名字         | trigger_lib_dir         |
| ------------ | ----------------------- |
| 描述         | 触发器 JAR 包存放的目录 |
| 类型         | String                  |
| 默认值       | ext/trigger             |
| 改后生效方式 | 重启服务生效                |

- stateful_trigger_retry_num_when_not_found

| 名字         | stateful_trigger_retry_num_when_not_found      |
| ------------ | ---------------------------------------------- |
| 描述         | 有状态触发器触发无法找到触发器实例时的重试次数 |
| 类型         | Int32                                          |
| 默认值       | 3                                              |
| 改后生效方式 | 重启服务生效                                       |

### 3.27 SELECT-INTO配置

- into_operation_buffer_size_in_byte

| 名字         | into_operation_buffer_size_in_byte                           |
| ------------ | ------------------------------------------------------------ |
| 描述         | 执行 select-into 语句时，待写入数据占用的最大内存（单位：Byte） |
| 类型         | long                                                         |
| 默认值       | 104857600                                                    |
| 改后生效方式 | 热加载                                                       |

- select_into_insert_tablet_plan_row_limit

| 名字         | select_into_insert_tablet_plan_row_limit                     |
| ------------ | ------------------------------------------------------------ |
| 描述         | 执行 select-into 语句时，一个 insert-tablet-plan 中可以处理的最大行数 |
| 类型         | int32                                                        |
| 默认值       | 10000                                                        |
| 改后生效方式 | 热加载                                                       |

- into_operation_execution_thread_count

| 名字         | into_operation_execution_thread_count      |
| ------------ | ------------------------------------------ |
| 描述         | SELECT INTO 中执行写入任务的线程池的线程数 |
| 类型         | int32                                      |
| 默认值       | 2                                          |
| 改后生效方式 | 重启服务生效                                   |

### 3.28 连续查询配置
- continuous_query_submit_thread_count

| 名字         | continuous_query_execution_thread |
| ------------ | --------------------------------- |
| 描述         | 执行连续查询任务的线程池的线程数  |
| 类型         | int32                             |
| 默认值       | 2                                 |
| 改后生效方式 | 重启服务生效                          |

- continuous_query_min_every_interval_in_ms

| 名字         | continuous_query_min_every_interval_in_ms |
| ------------ | ----------------------------------------- |
| 描述         | 连续查询执行时间间隔的最小值              |
| 类型         | long (duration)                           |
| 默认值       | 1000                                      |
| 改后生效方式 | 重启服务生效                                  |

### 3.29 PIPE配置

- pipe_lib_dir

| 名字         | pipe_lib_dir               |
| ------------ | -------------------------- |
| 描述         | 自定义 Pipe 插件的存放目录 |
| 类型         | string                     |
| 默认值       | ext/pipe                   |
| 改后生效方式 | 暂不支持修改               |

- pipe_subtask_executor_max_thread_num

| 名字         | pipe_subtask_executor_max_thread_num                         |
| ------------ | ------------------------------------------------------------ |
| 描述         | pipe 子任务 processor、sink 中各自可以使用的最大线程数。实际值将是 min(pipe_subtask_executor_max_thread_num, max(1, CPU核心数 / 2))。 |
| 类型         | int                                                          |
| 默认值       | 5                                                            |
| 改后生效方式 | 重启服务生效                                                     |

- pipe_sink_timeout_ms

| 名字         | pipe_sink_timeout_ms                          |
| ------------ | --------------------------------------------- |
| 描述         | thrift 客户端的连接超时时间（以毫秒为单位）。 |
| 类型         | int                                           |
| 默认值       | 900000                                        |
| 改后生效方式 | 重启服务生效                                      |

- pipe_sink_selector_number

| 名字         | pipe_sink_selector_number                                    |
| ------------ | ------------------------------------------------------------ |
| 描述         | 在 iotdb-thrift-async-sink 插件中可以使用的最大执行结果处理线程数量。 建议将此值设置为小于或等于 pipe_sink_max_client_number。 |
| 类型         | int                                                          |
| 默认值       | 4                                                            |
| 改后生效方式 | 重启服务生效                                                     |

- pipe_sink_max_client_number

| 名字         | pipe_sink_max_client_number                                 |
| ------------ | ----------------------------------------------------------- |
| 描述         | 在 iotdb-thrift-async-sink 插件中可以使用的最大客户端数量。 |
| 类型         | int                                                         |
| 默认值       | 16                                                          |
| 改后生效方式 | 重启服务生效                                                    |

- pipe_air_gap_receiver_enabled

| 名字         | pipe_air_gap_receiver_enabled                                |
| ------------ | ------------------------------------------------------------ |
| 描述         | 是否启用通过网闸接收 pipe 数据。接收器只能在 tcp 模式下返回 0 或 1，以指示数据是否成功接收。 \| |
| 类型         | Boolean                                                      |
| 默认值       | false                                                        |
| 改后生效方式 | 重启服务生效                                                     |

- pipe_air_gap_receiver_port

| 名字         | pipe_air_gap_receiver_port           |
| ------------ | ------------------------------------ |
| 描述         | 服务器通过网闸接收 pipe 数据的端口。 |
| 类型         | int                                  |
| 默认值       | 9780                                 |
| 改后生效方式 | 重启服务生效                             |

- pipe_all_sinks_rate_limit_bytes_per_second

| 名字         | pipe_all_sinks_rate_limit_bytes_per_second                   |
| ------------ | ------------------------------------------------------------ |
| 描述         | 所有 pipe sink 每秒可以传输的总字节数。当给定的值小于或等于 0 时，表示没有限制。默认值是 -1，表示没有限制。 |
| 类型         | double                                                       |
| 默认值       | -1                                                           |
| 改后生效方式 | 热加载                                                       |

### 3.30 Ratis共识协议配置

当Region配置了RatisConsensus共识协议之后，下述的配置项才会生效

- config_node_ratis_log_appender_buffer_size_max

| 名字         | config_node_ratis_log_appender_buffer_size_max |
| ------------ | ---------------------------------------------- |
| 描述         | confignode 一次同步日志RPC最大的传输字节限制   |
| 类型         | int32                                          |
| 默认值       | 16777216                                       |
| 改后生效方式 | 重启服务生效                                       |

- schema_region_ratis_log_appender_buffer_size_max

| 名字         | schema_region_ratis_log_appender_buffer_size_max |
| ------------ | ------------------------------------------------ |
| 描述         | schema region 一次同步日志RPC最大的传输字节限制  |
| 类型         | int32                                            |
| 默认值       | 16777216                                         |
| 改后生效方式 | 重启服务生效                                         |

- data_region_ratis_log_appender_buffer_size_max

| 名字         | data_region_ratis_log_appender_buffer_size_max |
| ------------ | ---------------------------------------------- |
| 描述         | data region 一次同步日志RPC最大的传输字节限制  |
| 类型         | int32                                          |
| 默认值       | 16777216                                       |
| 改后生效方式 | 重启服务生效                                       |

- config_node_ratis_snapshot_trigger_threshold

| 名字         | config_node_ratis_snapshot_trigger_threshold |
| ------------ | -------------------------------------------- |
| 描述         | confignode 触发snapshot需要的日志条数        |
| 类型         | int32                                        |
| 默认值       | 400,000                                      |
| 改后生效方式 | 重启服务生效                                     |

- schema_region_ratis_snapshot_trigger_threshold

| 名字         | schema_region_ratis_snapshot_trigger_threshold |
| ------------ | ---------------------------------------------- |
| 描述         | schema region 触发snapshot需要的日志条数       |
| 类型         | int32                                          |
| 默认值       | 400,000                                        |
| 改后生效方式 | 重启服务生效                                       |

- data_region_ratis_snapshot_trigger_threshold

| 名字         | data_region_ratis_snapshot_trigger_threshold |
| ------------ | -------------------------------------------- |
| 描述         | data region 触发snapshot需要的日志条数       |
| 类型         | int32                                        |
| 默认值       | 400,000                                      |
| 改后生效方式 | 重启服务生效                                     |

- config_node_ratis_log_unsafe_flush_enable

| 名字         | config_node_ratis_log_unsafe_flush_enable |
| ------------ | ----------------------------------------- |
| 描述         | confignode 是否允许Raft日志异步刷盘       |
| 类型         | boolean                                   |
| 默认值       | false                                     |
| 改后生效方式 | 重启服务生效                                  |

- schema_region_ratis_log_unsafe_flush_enable

| 名字         | schema_region_ratis_log_unsafe_flush_enable |
| ------------ | ------------------------------------------- |
| 描述         | schema region 是否允许Raft日志异步刷盘      |
| 类型         | boolean                                     |
| 默认值       | false                                       |
| 改后生效方式 | 重启服务生效                                    |

- data_region_ratis_log_unsafe_flush_enable

| 名字         | data_region_ratis_log_unsafe_flush_enable |
| ------------ | ----------------------------------------- |
| 描述         | data region 是否允许Raft日志异步刷盘      |
| 类型         | boolean                                   |
| 默认值       | false                                     |
| 改后生效方式 | 重启服务生效                                  |

- config_node_ratis_log_segment_size_max_in_byte

| 名字         | config_node_ratis_log_segment_size_max_in_byte |
| ------------ | ---------------------------------------------- |
| 描述         | confignode 一个RaftLog日志段文件的大小         |
| 类型         | int32                                          |
| 默认值       | 25165824                                       |
| 改后生效方式 | 重启服务生效                                       |

- schema_region_ratis_log_segment_size_max_in_byte

| 名字         | schema_region_ratis_log_segment_size_max_in_byte |
| ------------ | ------------------------------------------------ |
| 描述         | schema region 一个RaftLog日志段文件的大小        |
| 类型         | int32                                            |
| 默认值       | 25165824                                         |
| 改后生效方式 | 重启服务生效                                         |

- data_region_ratis_log_segment_size_max_in_byte

| 名字         | data_region_ratis_log_segment_size_max_in_byte |
| ------------ | ---------------------------------------------- |
| 描述         | data region 一个RaftLog日志段文件的大小        |
| 类型         | int32                                          |
| 默认值       | 25165824                                       |
| 改后生效方式 | 重启服务生效                                       |

- config_node_simple_consensus_log_segment_size_max_in_byte

| 名字         | data_region_ratis_log_segment_size_max_in_byte |
| ------------ | ---------------------------------------------- |
| 描述         | Confignode 简单共识协议一个Log日志段文件的大小 |
| 类型         | int32                                          |
| 默认值       | 25165824                                       |
| 改后生效方式 | 重启服务生效                                       |

- config_node_ratis_grpc_flow_control_window

| 名字         | config_node_ratis_grpc_flow_control_window |
| ------------ | ------------------------------------------ |
| 描述         | confignode grpc 流式拥塞窗口大小           |
| 类型         | int32                                      |
| 默认值       | 4194304                                    |
| 改后生效方式 | 重启服务生效                                   |

- schema_region_ratis_grpc_flow_control_window

| 名字         | schema_region_ratis_grpc_flow_control_window |
| ------------ | -------------------------------------------- |
| 描述         | schema region grpc 流式拥塞窗口大小          |
| 类型         | int32                                        |
| 默认值       | 4194304                                      |
| 改后生效方式 | 重启服务生效                                     |

- data_region_ratis_grpc_flow_control_window

| 名字         | data_region_ratis_grpc_flow_control_window |
| ------------ | ------------------------------------------ |
| 描述         | data region grpc 流式拥塞窗口大小          |
| 类型         | int32                                      |
| 默认值       | 4194304                                    |
| 改后生效方式 | 重启服务生效                                   |

- config_node_ratis_grpc_leader_outstanding_appends_max

| 名字         | config_node_ratis_grpc_leader_outstanding_appends_max |
| ------------ | ----------------------------------------------------- |
| 描述         | config node grpc 流水线并发阈值                       |
| 类型         | int32                                                 |
| 默认值       | 128                                                   |
| 改后生效方式 | 重启服务生效                                              |

- schema_region_ratis_grpc_leader_outstanding_appends_max

| 名字         | schema_region_ratis_grpc_leader_outstanding_appends_max |
| ------------ | ------------------------------------------------------- |
| 描述         | schema region grpc 流水线并发阈值                       |
| 类型         | int32                                                   |
| 默认值       | 128                                                     |
| 改后生效方式 | 重启服务生效                                                |

- data_region_ratis_grpc_leader_outstanding_appends_max

| 名字         | data_region_ratis_grpc_leader_outstanding_appends_max |
| ------------ | ----------------------------------------------------- |
| 描述         | data region grpc 流水线并发阈值                       |
| 类型         | int32                                                 |
| 默认值       | 128                                                   |
| 改后生效方式 | 重启服务生效                                              |

- config_node_ratis_log_force_sync_num

| 名字         | config_node_ratis_log_force_sync_num |
| ------------ | ------------------------------------ |
| 描述         | config node fsync 阈值               |
| 类型         | int32                                |
| 默认值       | 128                                  |
| 改后生效方式 | 重启服务生效                             |

- schema_region_ratis_log_force_sync_num

| 名字         | schema_region_ratis_log_force_sync_num |
| ------------ | -------------------------------------- |
| 描述         | schema region fsync 阈值               |
| 类型         | int32                                  |
| 默认值       | 128                                    |
| 改后生效方式 | 重启服务生效                               |

- data_region_ratis_log_force_sync_num

| 名字         | data_region_ratis_log_force_sync_num |
| ------------ | ------------------------------------ |
| 描述         | data region fsync 阈值               |
| 类型         | int32                                |
| 默认值       | 128                                  |
| 改后生效方式 | 重启服务生效                             |

- config_node_ratis_rpc_leader_election_timeout_min_ms

| 名字         | config_node_ratis_rpc_leader_election_timeout_min_ms |
| ------------ | ---------------------------------------------------- |
| 描述         | confignode leader 选举超时最小值                     |
| 类型         | int32                                                |
| 默认值       | 2000ms                                               |
| 改后生效方式 | 重启服务生效                                             |

- schema_region_ratis_rpc_leader_election_timeout_min_ms

| 名字         | schema_region_ratis_rpc_leader_election_timeout_min_ms |
| ------------ | ------------------------------------------------------ |
| 描述         | schema region leader 选举超时最小值                    |
| 类型         | int32                                                  |
| 默认值       | 2000ms                                                 |
| 改后生效方式 | 重启服务生效                                               |

- data_region_ratis_rpc_leader_election_timeout_min_ms

| 名字         | data_region_ratis_rpc_leader_election_timeout_min_ms |
| ------------ | ---------------------------------------------------- |
| 描述         | data region leader 选举超时最小值                    |
| 类型         | int32                                                |
| 默认值       | 2000ms                                               |
| 改后生效方式 | 重启服务生效                                             |

- config_node_ratis_rpc_leader_election_timeout_max_ms

| 名字         | config_node_ratis_rpc_leader_election_timeout_max_ms |
| ------------ | ---------------------------------------------------- |
| 描述         | confignode leader 选举超时最大值                     |
| 类型         | int32                                                |
| 默认值       | 4000ms                                               |
| 改后生效方式 | 重启服务生效                                             |

- schema_region_ratis_rpc_leader_election_timeout_max_ms

| 名字         | schema_region_ratis_rpc_leader_election_timeout_max_ms |
| ------------ | ------------------------------------------------------ |
| 描述         | schema region leader 选举超时最大值                    |
| 类型         | int32                                                  |
| 默认值       | 4000ms                                                 |
| 改后生效方式 | 重启服务生效                                               |

- data_region_ratis_rpc_leader_election_timeout_max_ms

| 名字         | data_region_ratis_rpc_leader_election_timeout_max_ms |
| ------------ | ---------------------------------------------------- |
| 描述         | data region leader 选举超时最大值                    |
| 类型         | int32                                                |
| 默认值       | 4000ms                                               |
| 改后生效方式 | 重启服务生效                                             |

- config_node_ratis_request_timeout_ms

| 名字         | config_node_ratis_request_timeout_ms |
| ------------ | ------------------------------------ |
| 描述         | confignode Raft 客户端重试超时       |
| 类型         | int32                                |
| 默认值       | 10000                                |
| 改后生效方式 | 重启服务生效                             |

- schema_region_ratis_request_timeout_ms

| 名字         | schema_region_ratis_request_timeout_ms |
| ------------ | -------------------------------------- |
| 描述         | schema region Raft 客户端重试超时      |
| 类型         | int32                                  |
| 默认值       | 10000                                  |
| 改后生效方式 | 重启服务生效                               |

- data_region_ratis_request_timeout_ms

| 名字         | data_region_ratis_request_timeout_ms |
| ------------ | ------------------------------------ |
| 描述         | data region Raft 客户端重试超时      |
| 类型         | int32                                |
| 默认值       | 10000                                |
| 改后生效方式 | 重启服务生效                             |

- config_node_ratis_max_retry_attempts

| 名字         | config_node_ratis_max_retry_attempts |
| ------------ | ------------------------------------ |
| 描述         | confignode Raft客户端最大重试次数    |
| 类型         | int32                                |
| 默认值       | 10                                   |
| 改后生效方式 | 重启服务生效                             |

- config_node_ratis_initial_sleep_time_ms

| 名字         | config_node_ratis_initial_sleep_time_ms |
| ------------ | --------------------------------------- |
| 描述         | confignode Raft客户端初始重试睡眠时长   |
| 类型         | int32                                   |
| 默认值       | 100ms                                   |
| 改后生效方式 | 重启服务生效                                |

- config_node_ratis_max_sleep_time_ms

| 名字         | config_node_ratis_max_sleep_time_ms   |
| ------------ | ------------------------------------- |
| 描述         | confignode Raft客户端最大重试睡眠时长 |
| 类型         | int32                                 |
| 默认值       | 10000                                 |
| 改后生效方式 | 重启服务生效                              |

- schema_region_ratis_max_retry_attempts

| 名字         | schema_region_ratis_max_retry_attempts |
| ------------ | -------------------------------------- |
| 描述         | schema region Raft客户端最大重试次数   |
| 类型         | int32                                  |
| 默认值       | 10                                     |
| 改后生效方式 | 重启服务生效                               |

- schema_region_ratis_initial_sleep_time_ms

| 名字         | schema_region_ratis_initial_sleep_time_ms |
| ------------ | ----------------------------------------- |
| 描述         | schema region Raft客户端初始重试睡眠时长  |
| 类型         | int32                                     |
| 默认值       | 100ms                                     |
| 改后生效方式 | 重启服务生效                                  |

- schema_region_ratis_max_sleep_time_ms

| 名字         | schema_region_ratis_max_sleep_time_ms    |
| ------------ | ---------------------------------------- |
| 描述         | schema region Raft客户端最大重试睡眠时长 |
| 类型         | int32                                    |
| 默认值       | 1000                                     |
| 改后生效方式 | 重启服务生效                                 |

- data_region_ratis_max_retry_attempts

| 名字         | data_region_ratis_max_retry_attempts |
| ------------ | ------------------------------------ |
| 描述         | data region Raft客户端最大重试次数   |
| 类型         | int32                                |
| 默认值       | 10                                   |
| 改后生效方式 | 重启服务生效                             |

- data_region_ratis_initial_sleep_time_ms

| 名字         | data_region_ratis_initial_sleep_time_ms |
| ------------ | --------------------------------------- |
| 描述         | data region Raft客户端初始重试睡眠时长  |
| 类型         | int32                                   |
| 默认值       | 100ms                                   |
| 改后生效方式 | 重启服务生效                                |

- data_region_ratis_max_sleep_time_ms

| 名字         | data_region_ratis_max_sleep_time_ms    |
| ------------ | -------------------------------------- |
| 描述         | data region Raft客户端最大重试睡眠时长 |
| 类型         | int32                                  |
| 默认值       | 1000                                   |
| 改后生效方式 | 重启服务生效                               |

- ratis_first_election_timeout_min_ms

| 名字         | ratis_first_election_timeout_min_ms |
| ------------ | ----------------------------------- |
| 描述         | Ratis协议首次选举最小超时时间       |
| 类型         | int64                               |
| 默认值       | 50 (ms)                             |
| 改后生效方式 | 重启服务生效                            |

- ratis_first_election_timeout_max_ms

| 名字         | ratis_first_election_timeout_max_ms |
| ------------ | ----------------------------------- |
| 描述         | Ratis协议首次选举最大超时时间       |
| 类型         | int64                               |
| 默认值       | 150 (ms)                            |
| 改后生效方式 | 重启服务生效                            |

- config_node_ratis_preserve_logs_num_when_purge

| 名字         | config_node_ratis_preserve_logs_num_when_purge |
| ------------ | ---------------------------------------------- |
| 描述         | confignode snapshot后保持一定数量日志不删除    |
| 类型         | int32                                          |
| 默认值       | 1000                                           |
| 改后生效方式 | 重启服务生效                                       |

- schema_region_ratis_preserve_logs_num_when_purge

| 名字         | schema_region_ratis_preserve_logs_num_when_purge |
| ------------ | ------------------------------------------------ |
| 描述         | schema region snapshot后保持一定数量日志不删除   |
| 类型         | int32                                            |
| 默认值       | 1000                                             |
| 改后生效方式 | 重启服务生效                                         |

- data_region_ratis_preserve_logs_num_when_purge

| 名字         | data_region_ratis_preserve_logs_num_when_purge |
| ------------ | ---------------------------------------------- |
| 描述         | data region snapshot后保持一定数量日志不删除   |
| 类型         | int32                                          |
| 默认值       | 1000                                           |
| 改后生效方式 | 重启服务生效                                       |

- config_node_ratis_log_max_size 

| 名字         | config_node_ratis_log_max_size      |
| ------------ | ----------------------------------- |
| 描述         | config node磁盘Raft Log最大占用空间 |
| 类型         | int64                               |
| 默认值       | 2147483648 (2GB)                    |
| 改后生效方式 | 重启服务生效                            |

- schema_region_ratis_log_max_size 

| 名字         | schema_region_ratis_log_max_size       |
| ------------ | -------------------------------------- |
| 描述         | schema region 磁盘Raft Log最大占用空间 |
| 类型         | int64                                  |
| 默认值       | 2147483648 (2GB)                       |
| 改后生效方式 | 重启服务生效                               |

- data_region_ratis_log_max_size 

| 名字         | data_region_ratis_log_max_size       |
| ------------ | ------------------------------------ |
| 描述         | data region 磁盘Raft Log最大占用空间 |
| 类型         | int64                                |
| 默认值       | 21474836480 (20GB)                   |
| 改后生效方式 | 重启服务生效                             |

- config_node_ratis_periodic_snapshot_interval

| 名字         | config_node_ratis_periodic_snapshot_interval |
| ------------ | -------------------------------------------- |
| 描述         | config node定期snapshot的间隔时间            |
| 类型         | int64                                        |
| 默认值       | 86400 (秒)                                   |
| 改后生效方式 | 重启服务生效                                     |

- schema_region_ratis_periodic_snapshot_interval  

| 名字         | schema_region_ratis_preserve_logs_num_when_purge |
| ------------ | ------------------------------------------------ |
| 描述         | schema region定期snapshot的间隔时间              |
| 类型         | int64                                            |
| 默认值       | 86400 (秒)                                       |
| 改后生效方式 | 重启服务生效                                         |

- data_region_ratis_periodic_snapshot_interval  

| 名字         | data_region_ratis_preserve_logs_num_when_purge |
| ------------ | ---------------------------------------------- |
| 描述         | data region定期snapshot的间隔时间              |
| 类型         | int64                                          |
| 默认值       | 86400 (秒)                                     |
| 改后生效方式 | 重启服务生效                                       |

### 3.31 IoTConsensusV2配置

- iot_consensus_v2_pipeline_size

| 名字         | iot_consensus_v2_pipeline_size                               |
| ------------ | ------------------------------------------------------------ |
| 描述         | IoTConsensus V2中连接器（connector）和接收器（receiver）的默认事件缓冲区大小。 |
| 类型         | int                                                          |
| 默认值       | 5                                                            |
| 改后生效方式 | 重启服务生效                                                     |

- iot_consensus_v2_mode

| 名字         | iot_consensus_v2_pipeline_size      |
| ------------ | ----------------------------------- |
| 描述         | IoTConsensus V2使用的共识协议模式。 |
| 类型         | String                              |
| 默认值       | batch                               |
| 改后生效方式 | 重启服务生效                            |

### 3.32 Procedure 配置

- procedure_core_worker_thread_count

| 名字         | procedure_core_worker_thread_count |
| ------------ | ---------------------------------- |
| 描述         | 工作线程数量                       |
| 类型         | int32                              |
| 默认值       | 4                                  |
| 改后生效方式 | 重启服务生效                           |

- procedure_completed_clean_interval

| 名字         | procedure_completed_clean_interval |
| ------------ | ---------------------------------- |
| 描述         | 清理已完成的 procedure 时间间隔    |
| 类型         | int32                              |
| 默认值       | 30(s)                              |
| 改后生效方式 | 重启服务生效                           |

- procedure_completed_evict_ttl

| 名字         | procedure_completed_evict_ttl     |
| ------------ | --------------------------------- |
| 描述         | 已完成的 procedure 的数据保留时间 |
| 类型         | int32                             |
| 默认值       | 60(s)                             |
| 改后生效方式 | 重启服务生效                          |

### 3.33 MQTT代理配置

- enable_mqtt_service

| 名字         | enable_mqtt_service。 |
| ------------ | --------------------- |
| 描述         | 是否开启MQTT服务      |
| 类型         | Boolean               |
| 默认值       | false                 |
| 改后生效方式 | 热加载                |

- mqtt_host

| 名字         | mqtt_host            |
| ------------ | -------------------- |
| 描述         | MQTT服务绑定的host。 |
| 类型         | String               |
| 默认值       | 127.0.0.1            |
| 改后生效方式 | 热加载               |

- mqtt_port

| 名字         | mqtt_port            |
| ------------ | -------------------- |
| 描述         | MQTT服务绑定的port。 |
| 类型         | int32                |
| 默认值       | 1883                 |
| 改后生效方式 | 热加载               |

- mqtt_handler_pool_size

| 名字         | mqtt_handler_pool_size             |
| ------------ | ---------------------------------- |
| 描述         | 用于处理MQTT消息的处理程序池大小。 |
| 类型         | int32                              |
| 默认值       | 1                                  |
| 改后生效方式 | 热加载                             |

- mqtt_payload_formatter

| 名字         | mqtt_payload_formatter       |
| ------------ | ---------------------------- |
| 描述         | MQTT消息有效负载格式化程序。 |
| 类型         | String                       |
| 默认值       | json                         |
| 改后生效方式 | 热加载                       |

- mqtt_max_message_size

| 名字         | mqtt_max_message_size                |
| ------------ | ------------------------------------ |
| 描述         | MQTT消息的最大长度（以字节为单位）。 |
| 类型         | int32                                |
| 默认值       | 1048576                              |
| 改后生效方式 | 热加载                               |

### 3.34 审计日志配置

- enable_audit_log

| 名字         | enable_audit_log               |
| ------------ | ------------------------------ |
| 描述         | 用于控制是否启用审计日志功能。 |
| 类型         | Boolean                        |
| 默认值       | false                          |
| 改后生效方式 | 重启服务生效                       |

- audit_log_storage

| 名字         | audit_log_storage          |
| ------------ | -------------------------- |
| 描述         | 定义了审计日志的输出位置。 |
| 类型         | String                     |
| 默认值       | IOTDB,LOGGER               |
| 改后生效方式 | 重启服务生效                   |

- audit_log_operation

| 名字         | audit_log_operation                    |
| ------------ | -------------------------------------- |
| 描述         | 定义了哪些类型的操作需要记录审计日志。 |
| 类型         | String                                 |
| 默认值       | DML,DDL,QUERY                          |
| 改后生效方式 | 重启服务生效                               |

- enable_audit_log_for_native_insert_api

| 名字         | enable_audit_log_for_native_insert_api |
| ------------ | -------------------------------------- |
| 描述         | 用于控制本地写入API是否记录审计日志。  |
| 类型         | Boolean                                |
| 默认值       | true                                   |
| 改后生效方式 | 重启服务生效                               |

### 3.35 白名单配置
- enable_white_list

| 名字         | enable_white_list |
| ------------ | ----------------- |
| 描述         | 是否启用白名单。  |
| 类型         | Boolean           |
| 默认值       | false             |
| 改后生效方式 | 热加载            |

### 3.36 IoTDB-AI 配置

- model_inference_execution_thread_count

| 名字         | model_inference_execution_thread_count |
| ------------ | -------------------------------------- |
| 描述         | 用于模型推理操作的线程数。             |
| 类型         | int                                    |
| 默认值       | 5                                      |
| 改后生效方式 | 重启服务生效                               |

### 3.37 TsFile 主动监听&加载功能配置

- load_clean_up_task_execution_delay_time_seconds

| 名字         | load_clean_up_task_execution_delay_time_seconds              |
| ------------ | ------------------------------------------------------------ |
| 描述         | 在加载TsFile失败后，系统将等待多长时间才会执行清理任务来清除这些未成功加载的TsFile。 |
| 类型         | int                                                          |
| 默认值       | 1800                                                         |
| 改后生效方式 | 热加载                                                       |

- load_write_throughput_bytes_per_second

| 名字         | load_write_throughput_bytes_per_second |
| ------------ | -------------------------------------- |
| 描述         | 加载TsFile时磁盘写入的最大字节数每秒。 |
| 类型         | int                                    |
| 默认值       | -1                                     |
| 改后生效方式 | 热加载                                 |

- load_active_listening_enable

| 名字         | load_active_listening_enable                                 |
| ------------ | ------------------------------------------------------------ |
| 描述         | 是否开启 DataNode 主动监听并且加载 tsfile 的功能（默认开启）。 |
| 类型         | Boolean                                                      |
| 默认值       | true                                                         |
| 改后生效方式 | 热加载                                                       |

- load_active_listening_dirs

| 名字         | load_active_listening_dirs                                   |
| ------------ | ------------------------------------------------------------ |
| 描述         | 需要监听的目录（自动包括目录中的子目录），如有多个使用 “，“ 隔开默认的目录为 ext/load/pending（支持热装载）。 |
| 类型         | String                                                       |
| 默认值       | ext/load/pending                                             |
| 改后生效方式 | 热加载                                                       |

- load_active_listening_fail_dir

| 名字         | load_active_listening_fail_dir                             |
| ------------ | ---------------------------------------------------------- |
| 描述         | 执行加载 tsfile 文件失败后将文件转存的目录，只能配置一个。 |
| 类型         | String                                                     |
| 默认值       | ext/load/failed                                            |
| 改后生效方式 | 热加载                                                     |

- load_active_listening_max_thread_num

| 名字         | load_active_listening_max_thread_num                         |
| ------------ | ------------------------------------------------------------ |
| 描述         | 同时执行加载 tsfile 任务的最大线程数，参数被注释掉时的默值为 max(1, CPU 核心数 / 2)，当用户设置的值不在这个区间[1, CPU核心数 /2]内时，会设置为默认值 (1, CPU 核心数 / 2)。 |
| 类型         | Long                                                         |
| 默认值       | 0                                                            |
| 改后生效方式 | 重启服务生效                                                     |

- load_active_listening_check_interval_seconds

| 名字         | load_active_listening_check_interval_seconds                 |
| ------------ | ------------------------------------------------------------ |
| 描述         | 主动监听轮询间隔，单位秒。主动监听 tsfile 的功能是通过轮询检查文件夹实现的。该配置指定了两次检查 load_active_listening_dirs 的时间间隔，每次检查完成 load_active_listening_check_interval_seconds 秒后，会执行下一次检查。当用户设置的轮询间隔小于 1 时，会被设置为默认值 5 秒。 |
| 类型         | Long                                                         |
| 默认值       | 5                                                            |
| 改后生效方式 | 重启服务生效                                                     |

### 3.38 分发重试配置

- enable_retry_for_unknown_error

| 名字         | enable_retry_for_unknown_error                               |
| ------------ | ------------------------------------------------------------ |
| 描述         | 在遇到未知错误时，写请求远程分发的最大重试时间，单位是毫秒。 |
| 类型         | Long                                                         |
| 默认值       | 60000                                                        |
| 改后生效方式 | 热加载                                                       |

- enable_retry_for_unknown_error

| 名字         | enable_retry_for_unknown_error   |
| ------------ | -------------------------------- |
| 描述         | 用于控制是否对未知错误进行重试。 |
| 类型         | boolean                          |
| 默认值       | false                            |
| 改后生效方式 | 热加载                           |