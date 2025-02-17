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

# Configuration Parameters

The IoTDB configuration files are located in the `conf` folder within the IoTDB installation directory.

- `confignode-env.sh/bat`: The configuration file for environment settings, where you can configure the memory size of the ConfigNode.
- `datanode-env.sh/bat`: The configuration file for environment settings, where you can configure the memory size of the DataNode.
- `iotdb-system.properties`: The configuration file for IoTDB.
- `iotdb-system.properties.template`: The template for the IoTDB configuration file.

## 1 Modifying Configurations

Parameters that already exist in the `iotdb-system.properties` file can be directly modified. For parameters not listed in `iotdb-system.properties`, you can find the corresponding parameters in the `iotdb-system.properties.template` configuration file template and then copy them to the `iotdb-system.properties` file for modification.

### 1.1 Ways to Take Effect After Modification

Different configuration parameters have different ways of taking effect, which are divided into the following three types:

+ **Only allowed to be modified in first start up:** Can't be modified after first start, otherwise the ConfigNode/DataNode cannot start.
+ **After restarting system:** Can be modified after the ConfigNode/DataNode first start, but take effect after restart.
+ **hot-load:** Can be modified while the ConfigNode/DataNode is running, and trigger through sending the command(sql) `load configuration` or `set configuration` to the IoTDB server by client or session.

## 2 Environment Configuration Items

### 2.1 confignode-env.sh/bat

Environment configuration items are mainly used to configure parameters related to the Java environment in which ConfigNode runs, such as JVM-related configurations. When ConfigNode starts, these configurations are passed to the JVM. The detailed configuration item descriptions are as follows: 

* MEMORY_SIZE

|Name|MEMORY_SIZE|
|:---:|:---|
|Description|The memory size that IoTDB ConfigNode will use when startup |
|Type|String|
|Default|The default is three-tenths of the memory, with a maximum of 16G.|
|Effective|After restarting system|

* ON_HEAP_MEMORY

|Name|ON_HEAP_MEMORY|
|:---:|:---|
|Description|The heap memory size that IoTDB ConfigNode can use, Former Name: MAX_HEAP_SIZE |
|Type|String|
|Default| Calculate based on MEMORY_SIZE.|
|Effective|After restarting system|

* OFF_HEAP_MEMORY

|Name|OFF_HEAP_MEMORY|
|:---:|:---|
|Description|The direct memory that IoTDB ConfigNode can use, Former Name: MAX_DIRECT_MEMORY_SIZE |
|Type|String|
|Default| Calculate based on MEMORY_SIZE.|
|Effective|After restarting system|

### 2.2 datanode-env.sh/bat

The environment configuration item is mainly used to configure Java environment related parameters for running DataNode, such as JVM related configurations. When DataNode/Standby starts, this configuration will be passed to the JVM. The detailed configuration items are described as follows:

* MEMORY_SIZE

|Name|MEMORY_SIZE|
|:---:|:---|
|Description|The minimum heap memory size that IoTDB DataNode will use when startup |
|Type|String|
|Default| The default is a half of the memory.|
|Effective|After restarting system|

* ON_HEAP_MEMORY

|Name|ON_HEAP_MEMORY|
|:---:|:---|
|Description|The heap memory size that IoTDB DataNode can use, Former Name: MAX_HEAP_SIZE |
|Type|String|
|Default|  Calculate based on MEMORY_SIZE.|
|Effective|After restarting system|

* OFF_HEAP_MEMORY

|Name|OFF_HEAP_MEMORY|
|:---:|:---|
|Description|The direct memory that IoTDB DataNode can use, Former Name: MAX_DIRECT_MEMORY_SIZE|
|Type|String|
|Default|  Calculate based on MEMORY_SIZE.|
|Effective|After restarting system|



## 3 iotdb-system.properties.template

### 3.1 Cluster Configuration

- cluster_name

| Name     | cluster_name                                                 |
| -------- | ------------------------------------------------------------ |
| Description     | The name of cluster                                                     |
| Type     | String                                                       |
| Default   | default_cluster                                              |
| Effective | Execute SQL in CLI: ```set configuration "cluster_name"="xxx"``` (xxx is the new cluster name) |
| Attention     | This change is distributed to each node through the network. In the event of network fluctuations or node downtime, it is not guaranteed that the modification will be successful on all nodes. Nodes that fail to modify will not be able to join the cluster upon restart. At this time, it is necessary to manually modify the cluster_name item in the configuration file of the node, and then restart. Under normal circumstances, it is not recommended to change the cluster name by manually modifying the configuration file, nor is it recommended to hot load through the `load configuration` method.|

### 3.2 Seed ConfigNode

- cn_seed_config_node

| Name         | cn_seed_config_node                                          |
| ------------ | ------------------------------------------------------------ |
| Description         |  The target Config Node address is used to join the cluster, and SeedConfig Node is recommended. Previously known as cn_target_config_node_list in V1.2.2 and earlier|
| Type         | String                                                       |
| Default       | 127.0.0.1:10710                                              |
| Effective | Only allowed to be modified in first start up                                 |

- dn_seed_config_node

| Name         | dn_seed_config_node                                          |
| ------------ | ------------------------------------------------------------ |
| Description         | The address of the Config Node is used to join the cluster when the DataNode is started. It is recommended to use SeedConfig Node. Previously known as cn_target_config_node_list in V1.2.2 and earlier |
| Type         | String                                                       |
| Default       | 127.0.0.1:10710                                              |
| Effective | Only allowed to be modified in first start up                                 |

### 3.3 Node RPC Configuration

- cn_internal_address

| Name         | cn_internal_address          |
| ------------ | ---------------------------- |
| Description         | ConfigNode internal service address      |
| Type         | String                       |
| Default       | 127.0.0.1                    |
| Effective | Only allowed to be modified in first start up |

- cn_internal_port

| Name         | cn_internal_port             |
| ------------ | ---------------------------- |
| Description         | ConfigNode internal service port  |
| Type         | Short Int : [0,65535]        |
| Default       | 10710                        |
| Effective | Only allowed to be modified in first start up |

- cn_consensus_port

| Name         | cn_consensus_port             |
| ------------ | ----------------------------- |
| Description         | ConfigNode data Consensus Port |
| Type         | Short Int : [0,65535]         |
| Default       | 10720                         |
| Effective | Only allowed to be modified in first start up  |

- dn_rpc_address

| Name         | dn_rpc_address          |
| ------------ | ----------------------- |
| Description         | The client rpc service listens on the address. |
| Type         | String                  |
| Default       | 0.0.0.0                 |
| Effective | After restarting system            |

- dn_rpc_port

| Name         | dn_rpc_port             |
| ------------ | ----------------------- |
| Description         | The client rpc service listens on the port. |
| Type         | Short Int : [0,65535]   |
| Default       | 6667                    |
| Effective | After restarting system            |

- dn_internal_address

| Name         | dn_internal_address          |
| ------------ | ---------------------------- |
| Description         | DataNode internal service host/IP        |
| Type         | string                       |
| Default       | 127.0.0.1                    |
| Effective | Only allowed to be modified in first start up |

- dn_internal_port

| Name         | dn_internal_port             |
| ------------ | ---------------------------- |
| Description         | DataNode internal service port       |
| Type         | int                          |
| Default       | 10730                        |
| Effective | Only allowed to be modified in first start up |

- dn_mpp_data_exchange_port

| Name         | dn_mpp_data_exchange_port    |
| ------------ | ---------------------------- |
| Description         | MPP data exchange port            |
| Type         | int                          |
| Default       | 10740                        |
| Effective | Only allowed to be modified in first start up |

- dn_schema_region_consensus_port

| Name         | dn_schema_region_consensus_port       |
| ------------ | ------------------------------------- |
| Description         | DataNode Schema replica communication port for consensus |
| Type         | int                                   |
| Default       | 10750                                 |
| Effective | Only allowed to be modified in first start up          |

- dn_data_region_consensus_port

| Name         | dn_data_region_consensus_port       |
| ------------ | ----------------------------------- |
| Description         |  DataNode Data replica communication port for consensus|
| Type         | int                                 |
| Default       | 10760                               |
| Effective | Only allowed to be modified in first start up        |

- dn_join_cluster_retry_interval_ms

| Name         | dn_join_cluster_retry_interval_ms |
| ------------ | --------------------------------- |
| Description         |  The time of data node waiting for the next retry to join into the cluster |
| Type         | long                              |
| Default       | 5000                              |
| Effective | After restarting system                      |

### 3.4 Replication configuration

- config_node_consensus_protocol_class

| Name         | config_node_consensus_protocol_class             |
| ------------ | ------------------------------------------------ |
| Description         | Consensus protocol of ConfigNode replicas, only support RatisConsensus |
| Type         | String                                           |
| Default       | org.apache.iotdb.consensus.ratis.RatisConsensus  |
| Effective | Only allowed to be modified in first start up                     |

- schema_replication_factor

| Name         | schema_replication_factor          |
| ------------ | ---------------------------------- |
| Description         | Schema replication num          |
| Type         | int32                              |
| Default       | 1                                  |
| Effective | 重启服务后对**新的 Database** 生效 |

- schema_region_consensus_protocol_class

| Name         | schema_region_consensus_protocol_class                |
| ------------ | ----------------------------------------------------- |
| Description         | 元数据副本的共识协议，多副本时只能使用 RatisConsensus |
| Type         | String                                                |
| Default       | org.apache.iotdb.consensus.ratis.RatisConsensus       |
| Effective | Only allowed to be modified in first start up                          |

- data_replication_factor

| Name         | data_replication_factor            |
| ------------ | ---------------------------------- |
| Description         | Database 的默认数据副本数          |
| Type         | int32                              |
| Default       | 1                                  |
| Effective | After restarting system            |

- data_region_consensus_protocol_class

| Name         | data_region_consensus_protocol_class                         |
| ------------ | ------------------------------------------------------------ |
| Description         | Consensus protocol of data replicas，larger than 1 replicas could use IoTConsensus or RatisConsensus |
| Type         | String                                                       |
| Default       | org.apache.iotdb.consensus.iot.IoTConsensus                  |
| Effective | Only allowed to be modified in first start up                                 |

### 3.5 Directory configuration

- cn_system_dir

| Name         | cn_system_dir                                               |
| ------------ | ----------------------------------------------------------- |
| Description         | ConfigNode system data dir                               |
| Type         | String                                                      |
| Default       | data/confignode/system（Windows：data\\configndoe\\system） |
| Effective | After restarting system                                                |

- cn_consensus_dir

| Name         | cn_consensus_dir                                             |
| ------------ | ------------------------------------------------------------ |
| Description         | ConfigNode Consensus protocol data dir                             |
| Type         | String                                                       |
| Default       | data/confignode/consensus（Windows：data\\configndoe\\consensus） |
| Effective | After restarting system                                                 |

- cn_pipe_receiver_file_dir

| Name         | cn_pipe_receiver_file_dir                                    |
| ------------ | ------------------------------------------------------------ |
| Description         | The directory path used by the pipe receiver in Configurable Node to store files.               |
| Type         | String                                                       |
| Default       | data/confignode/system/pipe/receiver（Windows：data\\confignode\\system\\pipe\\receiver） |
| Effective | After restarting system                                                 |

- dn_system_dir

| Name         | dn_system_dir                                                |
| ------------ | ------------------------------------------------------------ |
| Description         | The IoTDB metadata storage path is stored by default in the data directory at the same level as the sbin directory. The starting directory of relative paths is related to the operating system, and it is recommended to use absolute paths |
| Type         | String                                                       |
| Default       | data/datanode/system（Windows：data\\datanode\\system）      |
| Effective | After restarting system                                                 |

- dn_data_dirs

| Name         | dn_data_dirs                                                 |
| ------------ | ------------------------------------------------------------ |
| Description         | The IoTDB data storage path is stored by default in the data directory at the same level as the sbin directory. The starting directory of relative paths is related to the operating system, and it is recommended to use absolute paths. |
| Type         | String                                                       |
| Default       | data/datanode/data（Windows：data\\datanode\\data）          |
| Effective | After restarting system                                                 |

- dn_multi_dir_strategy

| Name         | dn_multi_dir_strategy                                        |
| ------------ | ------------------------------------------------------------ |
| Description         | IoTDB's strategy for selecting directories for TsFile in tsfile_dir. You can use a simple class name or a full name of the class. The system provides the following three strategies: <br>1. SequenceStrategy: IoTDB selects the directory from tsfile_dir in order, traverses all the directories in tsfile_dir in turn, and keeps counting;<br>2. MaxDiskUsableSpaceFirstStrategy: IoTDB first selects the directory with the largest free disk space in tsfile_dir;<br>You can complete a user-defined policy in the following ways:<br>1. Inherit the org.apache.iotdb.db.storageengine.rescon.disk.strategy.DirectoryStrategy class and implement its own Strategy method;<br>2. Fill in the configuration class with the full class name of the implemented class (package name plus class name, UserDfineStrategyPackage);<br>3. Add the jar file to the project. |
| Type         | String                                                       |
| Default       | SequenceStrategy                                             |
| Effective | hot-load                                                       |

- dn_consensus_dir

| Name         | dn_consensus_dir                                             |
| ------------ | ------------------------------------------------------------ |
| Description         |The IoTDB consensus layer log storage path is stored by default in the data directory at the same level as the sbin directory. The starting directory of relative paths is related to the operating system, and it is recommended to use absolute paths.  |
| Type         | String                                                       |
| Default       | data/datanode/consensus（Windows：data\\datanode\\consensus） |
| Effective | After restarting system                                                 |

- dn_wal_dirs

| Name         | dn_wal_dirs                                                  |
| ------------ | ------------------------------------------------------------ |
| Description         | IoTDB pre write log storage path, default stored in the data directory at the same level as sbin directory. The starting directory of relative paths is related to the operating system, and it is recommended to use absolute paths. |
| Type         | String                                                       |
| Default       | data/datanode/wal（Windows：data\\datanode\\wal）            |
| Effective | After restarting system                                                 |

- dn_tracing_dir

| Name         | dn_tracing_dir                                               |
| ------------ | ------------------------------------------------------------ |
| Description         | IoTDB tracks the root directory path and defaults to storing it in the data directory at the same level as the sbin directory. The starting directory of relative paths is related to the operating system, and it is recommended to use absolute paths. |
| Type         | String                                                       |
| Default       | datanode/tracing（Windows：datanode\\tracing）               |
| Effective | After restarting system                                                 |

- dn_sync_dir

| Name         | dn_sync_dir                                                  |
| ------------ | ------------------------------------------------------------ |
| Description         | The IoTDB sync storage path is stored by default in the data directory at the same level as the sbin directory. The starting directory of relative paths is related to the operating system, and it is recommended to use absolute paths. |
| Type         | String                                                       |
| Default       | data/datanode/sync（Windows：data\\datanode\\sync）          |
| Effective | After restarting system                                                 |

- sort_tmp_dir

| Name         | sort_tmp_dir                                      |
| ------------ | ------------------------------------------------- |
| Description         | Used to configure the temporary directory for sorting operations.                  |
| Type         | String                                            |
| Default       | data/datanode/tmp（Windows：data\\datanode\\tmp） |
| Effective | After restarting system                                      |

- dn_pipe_receiver_file_dirs

| Name         | dn_pipe_receiver_file_dirs                                   |
| ------------ | ------------------------------------------------------------ |
| Description         | The directory path used by the pipe receiver in DataNode for storing files.                 |
| Type         | String                                                       |
| Default       | data/datanode/system/pipe/receiver（Windows：data\\datanode\\system\\pipe\\receiver） |
| Effective | After restarting system                                                 |

- iot_consensus_v2_receiver_file_dirs

| Name         | iot_consensus_v2_receiver_file_dirs                          |
| ------------ | ------------------------------------------------------------ |
| Description         | The directory path used by the receiver in IoTConsensus V2 for storing files.           |
| Type         | String                                                       |
| Default       | data/datanode/system/pipe/consensus/receiver（Windows：data\\datanode\\system\\pipe\\consensus\\receiver） |
| Effective | After restarting system                                                 |

- iot_consensus_v2_deletion_file_dir

| Name         | iot_consensus_v2_deletion_file_dir                           |
| ------------ | ------------------------------------------------------------ |
| Description         | The directory path used by the deletion operation in IoTConsensus V2 for storing files.        |
| Type         | String                                                       |
| Default       | data/datanode/system/pipe/consensus/deletion（Windows：data\\datanode\\system\\pipe\\consensus\\deletion） |
| Effective | After restarting system                                                 |

### 3.6 Metric Configuration

- cn_metric_reporter_list

| Name         | cn_metric_reporter_list                            |
| ------------ | -------------------------------------------------- |
| Description         | The system used in confignode to configure the monitoring module for reporting required data.  |
| Type         | String                                             |
| Default       | “ ”                                                 |
| Effective | After restarting system                                       |

- cn_metric_level

| Name         | cn_metric_level                            |
| ------------ | ------------------------------------------ |
| Description         | The level of detail controlled by the monitoring module in confignode for data collection. |
| Type         | String                                     |
| Default       | IMPORTANT                                  |
| Effective | After restarting system                               |

- cn_metric_async_collect_period

| Name         | cn_metric_async_collect_period                     |
| ------------ | -------------------------------------------------- |
| Description         | The interval for asynchronous collection of certain monitoring data in confignode, in seconds. |
| Type         | int                                                |
| Default       | 5                                                  |
| Effective | After restarting system                                       |

- cn_metric_prometheus_reporter_port 

| Name         | cn_metric_prometheus_reporter_port                     |
| ------------ | ------------------------------------------------------ |
| Description         | The port number used by the Prometheus reporter in confignode for monitoring data reporting.  |
| Type         | int                                                    |
| Default       | 9091                                                   |
| Effective | After restarting system                                           |

- dn_metric_reporter_list

| Name         | dn_metric_reporter_list                          |
| ------------ | ------------------------------------------------ |
| Description         | The system used in DataNode to configure the monitoring module for reporting required data. |
| Type         | String                                           |
| Default       | “ ”                                               |
| Effective | After restarting system                                     |

- dn_metric_level

| Name         | dn_metric_level                          |
| ------------ | ---------------------------------------- |
| Description         | The level of detail controlled by the monitoring module in DataNode for data collection. |
| Type         | String                                   |
| Default       | IMPORTANT                                |
| Effective | After restarting system                             |

- dn_metric_async_collect_period

| Name         | dn_metric_async_collect_period                   |
| ------------ | ------------------------------------------------ |
| Description         | The interval for asynchronous collection of certain monitoring data in DataNode, in seconds. |
| Type         | int                                              |
| Default       | 5                                                |
| Effective | After restarting system                                     |

- dn_metric_prometheus_reporter_port 

| Name         | dn_metric_prometheus_reporter_port                   |
| ------------ | ---------------------------------------------------- |
| Description         | The port number used by the Prometheus reporter in DataNode for monitoring data reporting.  |
| Type         | int                                                  |
| Default       | 9092                                                 |
| Effective | After restarting system                                         |

- dn_metric_internal_reporter_type

| Name         | dn_metric_internal_reporter_type                             |
| ------------ | ------------------------------------------------------------ |
| Description         | The types of internal reporters in the monitoring module of DataNode, used for internal monitoring and checking whether data has been successfully written and flushed.  |
| Type         | String                                                       |
| Default       | IOTDB                                                        |
| Effective | After restarting system                                                 |

### 3.7 SSL Configuration

- enable_thrift_ssl

| Name         | enable_thrift_ssl                                            |
| ------------ | ------------------------------------------------------------ |
| Description         | When the enable_thrift_ssl configuration is set to true, communication will be encrypted using SSL through the dn_rpc_port. |
| Type         | Boolean                                                      |
| Default       | false                                                        |
| Effective | After restarting system                                                 |

- enable_https

| Name         | enable_https                   |
| ------------ | ------------------------------ |
| Description         | Whether the REST Service has SSL enabled or not. |
| Type         | Boolean                        |
| Default       | false                          |
| Effective | After restarting system                       |

- key_store_path

| Name         | key_store_path |
| ------------ | -------------- |
| Description         | SSL certificate path.    |
| Type         | String         |
| Default       | “ ”             |
| Effective | After restarting system   |

- key_store_pwd

| Name         | key_store_pwd |
| ------------ | ------------- |
| Description         | SSL certificate password.   |
| Type         | String        |
| Default       | “ ”            |
| Effective | After restarting system  |

### 3.8 Connection Configuration

- cn_rpc_thrift_compression_enable

| Name         | cn_rpc_thrift_compression_enable |
| ------------ | -------------------------------- |
| Description         | Whether to enable the Thrift compression mechanism.     |
| Type         | Boolean                          |
| Default       | false                            |
| Effective | After restarting system                     |

- cn_rpc_max_concurrent_client_num

| Name         | cn_rpc_max_concurrent_client_num |
| ------------ | -------------------------------- |
| Description         | Maximum number of connections.                    |
| Type         | Short Int : [0,65535]            |
| Default       | 65535                            |
| Effective | After restarting system                     |

- cn_connection_timeout_ms 

| Name         | cn_connection_timeout_ms |
| ------------ | ------------------------ |
| Description         | Node connection timeout duration.         |
| Type         | int                      |
| Default       | 60000                    |
| Effective | After restarting system             |

- cn_selector_thread_nums_of_client_manager

| Name         | cn_selector_thread_nums_of_client_manager |
| ------------ | ----------------------------------------- |
| Description         | Number of selector threads for client asynchronous thread management.     |
| Type         | int                                       |
| Default       | 1                                         |
| Effective | After restarting system                              |

- cn_max_client_count_for_each_node_in_client_manager

| Name         | cn_max_client_count_for_each_node_in_client_manager |
| ------------ | --------------------------------------------------- |
| Description         | Maximum number of Clients routed to each node in a single ClientManager. |
| Type         | int                                                 |
| Default       | 300                                                 |
| Effective | After restarting system                                        |

- dn_session_timeout_threshold

| Name         | dn_session_timeout_threshold |
| ------------ | ---------------------------- |
| Description         | Maximum session idle time.        |
| Type         | int                          |
| Default       | 0                            |
| Effective | After restarting system                 |

- dn_rpc_thrift_compression_enable

| Name         | dn_rpc_thrift_compression_enable |
| ------------ | -------------------------------- |
| Description         | Whether to enable the Thrift compression mechanism.     |
| Type         | Boolean                          |
| Default       | false                            |
| Effective | After restarting system                     |

- dn_rpc_advanced_compression_enable

| Name         | dn_rpc_advanced_compression_enable |
| ------------ | ---------------------------------- |
| Description         | Whether to enable the custom Thrift compression mechanism.   |
| Type         | Boolean                            |
| Default       | false                              |
| Effective | After restarting system                       |

- dn_rpc_selector_thread_count

| Name         | rpc_selector_thread_count |
| ------------ | ------------------------- |
| Description         | Number of RPC selector threads.      |
| Type         | int                       |
| Default       | 1                         |
| Effective | After restarting system              |

- dn_rpc_min_concurrent_client_num

| Name         | rpc_min_concurrent_client_num |
| ------------ | ----------------------------- |
| Description         | Minimum number of connections.                   |
| Type         | Short Int : [0,65535]         |
| Default       | 1                             |
| Effective | After restarting system                  |

- dn_rpc_max_concurrent_client_num

| Name         | dn_rpc_max_concurrent_client_num |
| ------------ | -------------------------------- |
| Description         | Maximum number of connections.                     |
| Type         | Short Int : [0,65535]            |
| Default       | 65535                            |
| Effective | After restarting system                     |

- dn_thrift_max_frame_size

| Name         | dn_thrift_max_frame_size                               |
| ------------ | ------------------------------------------------------ |
| Description         | Maximum bytes for RPC requests/responses.                              |
| Type         | long                                                   |
| Default       | 536870912    |
| Effective | After restarting system                                           |

- dn_thrift_init_buffer_size

| Name         | dn_thrift_init_buffer_size |
| ------------ | -------------------------- |
| Description         |Byte count.                     |
| Type         | long                       |
| Default       | 1024                       |
| Effective | After restarting system               |

- dn_connection_timeout_ms

| Name         | dn_connection_timeout_ms |
| ------------ | ------------------------ |
| Description         | Node connection timeout duration.         |
| Type         | int                      |
| Default       | 60000                    |
| Effective | After restarting system             |

- dn_selector_thread_count_of_client_manager

| Name         | dn_selector_thread_count_of_client_manager                   |
| ------------ | ------------------------------------------------------------ |
| Description         | Number of selector threads (TAsyncClientManager) for asynchronous threads in a clientManager.Identifier for selector threads (TAsyncClientManager) of asynchronous threads in a clientManager. |
| Type         | int                                                          |
| Default       | 1                                                            |
| Effective | After restarting system                                                 |

- dn_max_client_count_for_each_node_in_client_manager

| Name         | dn_max_client_count_for_each_node_in_client_manager |
| ------------ | --------------------------------------------------- |
| Description         | Maximum number of Clients routed to each node in a single ClientManager. |
| Type         | int                                                 |
| Default       | 300                                                 |
| Effective | After restarting system                                        |

### 3.9 Object storage management

- remote_tsfile_cache_dirs

| Name         | remote_tsfile_cache_dirs |
| ------------ | ------------------------ |
| Description         | Local cache directory for cloud storage. |
| Type         | String                   |
| Default       | data/datanode/data/cache |
| Effective | After restarting system                 |

- remote_tsfile_cache_page_size_in_kb 

| Name         | remote_tsfile_cache_page_size_in_kb |
| ------------ | ----------------------------------- |
| Description         | Block size of cached files in local cloud storage.     |
| Type         | int                                 |
| Default       | 20480                               |
| Effective | After restarting system                            |

- remote_tsfile_cache_max_disk_usage_in_mb   

| Name         | remote_tsfile_cache_max_disk_usage_in_mb |
| ------------ | ---------------------------------------- |
| Description         | Maximum disk space usage for local cache in cloud storage.      |
| Type         | long                                     |
| Default       | 51200                                    |
| Effective | After restarting system                                 |

- object_storage_type 

| Name         | object_storage_type |
| ------------ | ------------------- |
| Description         | Type of cloud storage.        |
| Type         | String              |
| Default       | AWS_S3              |
| Effective | After restarting system            |

- object_storage_endpoint    

| Name         | object_storage_endpoint |
| ------------ | ----------------------- |
| Description         | Cloud storage endpoint.     |
| Type         | String                  |
| Default       | “ ”                      |
| Effective | After restarting system                |

- object_storage_bucket   

| Name         | object_storage_bucket  |
| ------------ | ---------------------- |
| Description         | Name of the cloud storage bucket. |
| Type         | String                 |
| Default       | iotdb_data             |
| Effective | After restarting system               |

- object_storage_access_key  

| Name         | object_storage_access_key |
| ------------ | ------------------------- |
| Description         | Key for cloud storage authentication information.   |
| Type         | String                    |
| Default       | “ ”                        |
| Effective | After restarting system                  |

- object_storage_access_secret       

| Name         | object_storage_access_secret |
| ------------ | ---------------------------- |
| Description         | Secret for cloud storage authentication information.    |
| Type         | String                       |
| Default       | “ ”                           |
| Effective | After restarting system                     |

### 3.10 Tier management

- dn_default_space_usage_thresholds

| Name         | dn_default_space_usage_thresholds                            |
| ------------ | ------------------------------------------------------------ |
| Description         | Define the minimum remaining space ratio for data directories at each level; when the remaining space is less than this ratio, data will be automatically migrated to the next level; when the remaining storage space of the last level falls below this threshold, the system will be set to READ_ONLY.  |
| Type         | double                                                       |
| Default       | 0.85                                                         |
| Effective | hot-load                                                       |

- dn_tier_full_policy

| Name         | dn_tier_full_policy                                          |
| ------------ | ------------------------------------------------------------ |
| Description         | How to deal with the last tier?s data when its used space has been higher than its dn_default_space_usage_thresholds. |
| Type         | String                                                       |
| Default       | NULL                                                         |
| Effective | hot-load                                                       |

- migrate_thread_count

| Name         | migrate_thread_count                     |
| ------------ | ---------------------------------------- |
| Description         | The size of the thread pool for migration operations in the DataNode data directory. |
| Type         | int                                      |
| Default       | 1                                        |
| Effective | hot-load                                   |

- tiered_storage_migrate_speed_limit_bytes_per_sec

| Name         | tiered_storage_migrate_speed_limit_bytes_per_sec |
| ------------ | ------------------------------------------------ |
| Description         | Limit the data migration speed between different storage levels.            |
| Type         | int                                              |
| Default       | 10485760                                         |
| Effective | hot-load                                           |

### 3.11 REST Service Configuration

- enable_rest_service

| Name         | enable_rest_service |
| ------------ | ------------------- |
| Description         | Whether to enable the REST service.  |
| Type         | Boolean             |
| Default       | false               |
| Effective | After restarting system            |

- rest_service_port

| Name         | rest_service_port  |
| ------------ | ------------------ |
| Description         | The port number on which the REST service listens. |
| Type         | int32              |
| Default       | 18080              |
| Effective | After restarting system           |

- enable_swagger

| Name         | enable_swagger                    |
| ------------ | --------------------------------- |
| Description         | Whether to enable Swagger to display REST interface information. |
| Type         | Boolean                           |
| Default       | false                             |
| Effective | After restarting system                          |

- rest_query_default_row_size_limit

| Name         | rest_query_default_row_size_limit |
| ------------ | --------------------------------- |
| Description         | The maximum number of rows that can be returned in a single query result set.    |
| Type         | int32                             |
| Default       | 10000                             |
| Effective | After restarting system                          |

- cache_expire_in_seconds

| Name         | cache_expire_in_seconds          |
| ------------ | -------------------------------- |
| Description         | The expiration time for user login information cache, in seconds. |
| Type         | int32                            |
| Default       | 28800                            |
| Effective | After restarting system                         |

- cache_max_num

| Name         | cache_max_num            |
| ------------ | ------------------------ |
| Description         | The maximum number of users stored in the cache. |
| Type         | int32                    |
| Default       | 100                      |
| Effective | After restarting system                 |

- cache_init_num

| Name         | cache_init_num |
| ------------ | -------------- |
| Description         | The initial capacity of the cache.   |
| Type         | int32          |
| Default       | 10             |
| Effective | After restarting system       |

- client_auth

| Name         | client_auth            |
| ------------ | ---------------------- |
| Description         | Whether client authentication is required. |
| Type         | boolean                |
| Default       | false                  |
| Effective | After restarting system               |

- trust_store_path

| Name         | trust_store_path        |
| ------------ | ----------------------- |
| Description         | KeyStore password (optional). |
| Type         | String                  |
| Default       | ""                      |
| Effective | After restarting system                |

- trust_store_pwd

| Name         | trust_store_pwd           |
| ------------ | ------------------------- |
| Description         | TrustStore password (optional). |
| Type         | String                    |
| Default       | ""                        |
| Effective | After restarting system                  |

- idle_timeout_in_seconds

| Name         | idle_timeout_in_seconds |
| ------------ | ----------------------- |
| Description         | SSL timeout time, in seconds.  |
| Type         | int32                   |
| Default       | 5000                    |
| Effective | After restarting system                |

### 3.12 Load balancing configuration

- series_slot_num

| Name         | series_slot_num              |
| ------------ | ---------------------------- |
| Description         | Number of sequence partition slots.             |
| Type         | int32                        |
| Default       | 10000                        |
| Effective | Only allowed to be modified in first start up |

- series_partition_executor_class

| Name         | series_partition_executor_class                              |
| ------------ | ------------------------------------------------------------ |
| Description         | Hash function for sequence partitioning.                                       |
| Type         | String                                                       |
| Default       | org.apache.iotdb.commons.partition.executor.hash.BKDRHashExecutor |
| Effective | Only allowed to be modified in first start up                                 |

- schema_region_group_extension_policy

| Name         | schema_region_group_extension_policy |
| ------------ | ------------------------------------ |
| Description         | Scaling strategy for SchemaRegionGroup.        |
| Type         | string                               |
| Default       | AUTO                                 |
| Effective | After restarting system                             |

- default_schema_region_group_num_per_database

| Name         | default_schema_region_group_num_per_database                 |
| ------------ | ------------------------------------------------------------ |
| Description         | When using the CUSTOM-SchemaRegionGroup scaling strategy, this parameter is the number of SchemaRegionGroups each Database has; when using the AUTO-SchemaRegionGroup scaling strategy, this parameter is the minimum number of SchemaRegionGroups each Database has. |
| Type         | int                                                          |
| Default       | 1                                                            |
| Effective | After restarting system                                                     |

- schema_region_per_data_node

| Name         | schema_region_per_data_node                        |
| ------------ | -------------------------------------------------- |
| Description         | The maximum number of SchemaRegions expected to be managed by each DataNode. |
| Type         | double                                             |
| Default       | 1.0                                                |
| Effective | After restarting system                                           |

- data_region_group_extension_policy

| Name         | data_region_group_extension_policy |
| ------------ | ---------------------------------- |
| Description         | Scaling strategy for DataRegionGroup.        |
| Type         | string                             |
| Default       | AUTO                               |
| Effective | After restarting system                           |

- default_data_region_group_num_per_database

| Name         | default_data_region_group_per_database                       |
| ------------ | ------------------------------------------------------------ |
| Description         | When using the CUSTOM-DataRegionGroup scaling strategy, this parameter is the number of DataRegionGroups each Database has; when using the AUTO-DataRegionGroup scaling strategy, this parameter is the minimum number of DataRegionGroups each Database has. |
| Type         | int                                                          |
| Default       | 2                                                            |
| Effective | After restarting system                                                     |

- data_region_per_data_node

| Name         | data_region_per_data_node                        |
| ------------ | ------------------------------------------------ |
| Description         | The maximum number of DataRegions expected to be managed by each DataNode. |
| Type         | double                                           |
| Default       | Half of the CPU cores                                              |
| Effective | After restarting system                                         |

- enable_auto_leader_balance_for_ratis_consensus

| Name         | enable_auto_leader_balance_for_ratis_consensus |
| ------------ | ---------------------------------------------- |
| Description         | Whether to enable automatic leader balancing strategy for the Ratis consensus protocol.  |
| Type         | Boolean                                        |
| Default       | true                                           |
| Effective | After restarting system                                       |

- enable_auto_leader_balance_for_iot_consensus

| Name         | enable_auto_leader_balance_for_iot_consensus |
| ------------ | -------------------------------------------- |
| Description         | Whether to enable automatic leader balancing strategy for the IoT consensus protocol.  |
| Type         | Boolean                                      |
| Default       | true                                         |
| Effective | After restarting system                                     |

### 3.13 Cluster management

- time_partition_origin

| Name         | time_partition_origin                                        |
| ------------ | ------------------------------------------------------------ |
| Description         | The starting point for Database data time partitioning, i.e., the time point from which time partitions are calculated. |
| Type         | Long                                                         |
| Unit         | ms                                                         |
| Default       | 0                                                            |
| Effective | Only allowed to be modified in first start up                                 |

- time_partition_interval

| Name         | time_partition_interval         |
| ------------ | ------------------------------- |
| Description         | The default data time partition interval for the Database. |
| Type         | Long                            |
| Unit         | ms                            |
| Default       | 604800000                       |
| Effective | Only allowed to be modified in first start up    |

- heartbeat_interval_in_ms

| Name         | heartbeat_interval_in_ms |
| ------------ | ------------------------ |
| Description         | The heartbeat interval between cluster nodes.     |
| Type         | Long                     |
| Unit         | ms                       |
| Default       | 1000                     |
| Effective | After restarting system                 |

- disk_space_warning_threshold

| Name         | disk_space_warning_threshold |
| ------------ | ---------------------------- |
| Description         | The remaining disk space threshold for DataNode.       |
| Type         | double(percentage)           |
| Default       | 0.05                         |
| Effective | After restarting system                     |

### 3.14 Memory Control Configuration

- datanode_memory_proportion

| Name         | datanode_memory_proportion                           |
| ------------ | ---------------------------------------------------- |
| Description         | Storage, query, metadata, stream processing engine, consensus layer, and free memory ratio. |
| Type         | Ratio                                                |
| Default       | 3:3:1:1:1:1                                          |
| Effective | After restarting system                                             |

- schema_memory_proportion

| Name         | schema_memory_proportion                                     |
| ------------ | ------------------------------------------------------------ |
| Description         | How to allocate memory related to Schema among SchemaRegion, SchemaCache, and PartitionCache. |
| Type         | Ratio                                                        |
| Default       | 5:4:1                                                        |
| Effective | After restarting system                                                     |

- storage_engine_memory_proportion

| Name         | storage_engine_memory_proportion |
| ------------ | -------------------------------- |
| Description         | The proportion of storage memory occupied by writing and merging.         |
| Type         | Ratio                            |
| Default       | 8:2                              |
| Effective | After restarting system                         |

- write_memory_proportion

| Name         | write_memory_proportion                      |
| ------------ | -------------------------------------------- |
| Description         | The proportion of write memory occupied by Memtable and TimePartitionInfo. |
| Type         | Ratio                                        |
| Default       | 19:1                                         |
| Effective | After restarting system                                     |

- primitive_array_size

| Name         | primitive_array_size                     |
| ------------ | ---------------------------------------- |
| Description         | The size of the original arrays in the array pool (the length of each array). |
| Type         | int32                                    |
| Default       | 64                                       |
| Effective | After restarting system                                 |

- chunk_metadata_size_proportion

| Name         | chunk_metadata_size_proportion               |
| ------------ | -------------------------------------------- |
| Description         | The proportion of memory used for storing block metadata during data compression.  |
| Type         | Double                                       |
| Default       | 0.1                                          |
| Effective | After restarting system                                     |

- flush_proportion

| Name         | flush_proportion                                             |
| ------------ | ------------------------------------------------------------ |
| Description         | The proportion of write memory for flushing to disk, default is 0.4; if there is a very high write load (e.g., batch=1000), it can be set lower than the default, such as 0.2. |
| Type         | Double                                                       |
| Default       | 0.4                                                          |
| Effective | After restarting system                                                     |

- buffered_arrays_memory_proportion

| Name         | buffered_arrays_memory_proportion       |
| ------------ | --------------------------------------- |
| Description         | The proportion of write memory allocated for buffer arrays, default is 0.6. |
| Type         | Double                                  |
| Default       | 0.6                                     |
| Effective | After restarting system                                |

- reject_proportion

| Name         | reject_proportion                                            |
| ------------ | ------------------------------------------------------------ |
| Description         | The proportion of write memory for rejecting insertions, default is 0.8; if there is a very high write load (e.g., batch=1000) and sufficient physical memory, it can be set higher than the default, such as 0.9. |
| Type         | Double                                                       |
| Default       | 0.8                                                          |
| Effective | After restarting system                                                     |

- device_path_cache_proportion

| Name         | device_path_cache_proportion                        |
| ------------ | --------------------------------------------------- |
| Description         | The proportion of memory allocated to device path cache (DevicePathCache) in memory.   |
| Type         | Double                                              |
| Default       | 0.05                                                |
| Effective | After restarting system                                            |

- write_memory_variation_report_proportion

| Name         | write_memory_variation_report_proportion                     |
| ------------ | ------------------------------------------------------------ |
| Description         | If the memory of DataRegion increases by more than a certain proportion of the available write memory, report to the system. Default is 0.001. |
| Type         | Double                                                       |
| Default       | 0.001                                                        |
| Effective | After restarting system                                                     |

- check_period_when_insert_blocked

| Name         | check_period_when_insert_blocked                             |
| ------------ | ------------------------------------------------------------ |
| Description         | The waiting time (in ms) to check the system again when an insertion is rejected, default is 50. If insertions are rejected and read load is low, it can be set higher. |
| Type         | int32                                                        |
| Default       | 50                                                           |
| Effective | After restarting system                                                     |

- io_task_queue_size_for_flushing

| Name         | io_task_queue_size_for_flushing  |
| ------------ | -------------------------------- |
| Description         |The size of the ioTaskQueue. Default is 10. |
| Type         | int32                            |
| Default       | 10                               |
| Effective | After restarting system                         |

- enable_query_memory_estimation

| Name         | enable_query_memory_estimation                               |
| ------------ | ------------------------------------------------------------ |
| Description         | After starting, it will estimate the memory usage for each query; if it exceeds the available memory, the query will be rejected. |
| Type         | bool                                                         |
| Default       | true                                                         |
| Effective | hot-load                                                       |

### 3.15 Schema Engine Configuration

- schema_engine_mode

| Name         | schema_engine_mode                                           |
| ------------ | ------------------------------------------------------------ |
| Description         | The metadata engine's operating mode, supports Memory and PBTree; in PBTree mode, it supports swapping temporarily unused sequence metadata from memory to disk in real-time, and loading it back into memory when needed; this parameter must be the same on all DataNodes in the cluster.  |
| Type         | string                                                       |
| Default       | Memory                                                       |
| Effective | Only allowed to be modified in first start up                                 |

- partition_cache_size

| Name         | partition_cache_size           |
| ------------ | ------------------------------ |
| Description         | The maximum number of cache entries for partition information caching.

|
| Type         | Int32                          |
| Default       | 1000                           |
| Effective | After restarting system                       |

- sync_mlog_period_in_ms

| Name         | sync_mlog_period_in_ms                                       |
| ------------ | ------------------------------------------------------------ |
| Description         | The periodic refresh cycle of mlog to disk, in milliseconds. If this parameter is 0, it means that every update operation on metadata will be immediately written to disk. |
| Type         | Int64                                                        |
| Default       | 100                                                          |
| Effective | After restarting system                                                     |

- tag_attribute_flush_interval

| Name         | tag_attribute_flush_interval                       |
| ------------ | -------------------------------------------------- |
| Description         | The interval number for recording labels and attributes, at which point a forced flush to disk will occur when this record count is reached. |
| Type         | int32                                              |
| Default       | 1000                                               |
| Effective | Only allowed to be modified in first start up                       |

- tag_attribute_total_size

| Name         | tag_attribute_total_size                 |
| ------------ | ---------------------------------------- |
| Description         | The maximum number of persistent bytes for each time series label and attribute. |
| Type         | int32                                    |
| Default       | 700                                      |
| Effective | Only allowed to be modified in first start up             |

- max_measurement_num_of_internal_request

| Name         | max_measurement_num_of_internal_request                      |
| ------------ | ------------------------------------------------------------ |
| Description         | If there are too many physical quantities in a single sequence registration request, it will be split into several lightweight sub-requests when executed internally by the system, with the number of physical quantities in each sub-request not exceeding the maximum value set by this parameter. |
| Type         | Int32                                                        |
| Default       | 10000                                                        |
| Effective | After restarting system                                                     |

- datanode_schema_cache_eviction_policy

| Name         | datanode_schema_cache_eviction_policy                 |
| ------------ | ----------------------------------------------------- |
| Description         | When the Schema cache reaches its maximum capacity, the eviction policy for the Schema cache. |
| Type         | String                                                |
| Default       | FIFO                                                  |
| Effective | After restarting system                                              |

- cluster_timeseries_limit_threshold

| Name         | cluster_timeseries_limit_threshold |
| ------------ | ---------------------------------- |
| Description         | The maximum number of time series that can be created in the cluster. |
| Type         | Int32                              |
| Default       | -1                                 |
| Effective | After restarting system                           |

- cluster_device_limit_threshold

| Name         | cluster_device_limit_threshold |
| ------------ | ------------------------------ |
| Description         | The maximum number of devices that can be created in the cluster. |
| Type         | Int32                          |
| Default       | -1                             |
| Effective | After restarting system                       |

- database_limit_threshold

| Name         | database_limit_threshold       |
| ------------ | ------------------------------ |
| Description         | The maximum number of databases that can be created in the cluster. |
| Type         | Int32                          |
| Default       | -1                             |
| Effective | After restarting system                       |

### 3.16 Configurations for creating schema automatically

- enable_auto_create_schema

| Name         | enable_auto_create_schema              |
| ------------ | -------------------------------------- |
| Description         | Whether to automatically create a sequence when the sequence to be written does not exist. |
| Value         | true or false                          |
| Default       | true                                   |
| Effective | After restarting system                               |

- default_storage_group_level

| Name         | default_storage_group_level                                  |
| ------------ | ------------------------------------------------------------ |
| Description         | When writing data that does not exist and automatically creating a sequence, if a corresponding database needs to be created, which level of the sequence path is considered as the database. For example, if we receive a new sequence root.sg0.d1.s2 and level=1, then root.sg0 is considered as the database (because root is level 0). |
| Type         | int32                                                        |
| Default       | 1                                                            |
| Effective | After restarting system                                                     |

- boolean_string_infer_type

| Name         | boolean_string_infer_type                  |
| ------------ | ------------------------------------------ |
| Description         | The data Type inferred from "true" or "false" strings. |
| Type         | BOOLEAN or TEXT                          |
| Default       | BOOLEAN                                    |
| Effective | After restarting system                                   |

- integer_string_infer_type

| Name         | integer_string_infer_type         |
| ------------ | --------------------------------- |
| Description         | The data Type inferred from integer strings.          |
| Type         | INT32, INT64, FLOAT, DOUBLE, TEXT |
| Default       | DOUBLE                            |
| Effective | After restarting system                          |

- floating_string_infer_type

| Name         | floating_string_infer_type    |
| ------------ | ----------------------------- |
| Description         | The data Type inferred from strings like "6.7". |
| Type         | DOUBLE, FLOAT or TEXT         |
| Default       | DOUBLE                        |
| Effective | After restarting system                      |

- nan_string_infer_type

| Name         | nan_string_infer_type        |
| ------------ | ---------------------------- |
| Description         | The data Type inferred from "NaN" strings. |
| Type         | DOUBLE, FLOAT or TEXT        |
| Default       | DOUBLE                       |
| Effective | After restarting system                     |

- default_boolean_encoding

| Name         | default_boolean_encoding |
| ------------ | ------------------------ |
| Description         | BOOLEAN Type encoding format.   |
| Value         | PLAIN, RLE               |
| Default       | RLE                      |
| Effective | After restarting system                 |

- default_int32_encoding

| Name         | default_int32_encoding                 |
| ------------ | -------------------------------------- |
| Description         | int32 Type encoding format.                 |
| Value         | PLAIN, RLE, TS_2DIFF, REGULAR, GORILLA |
| Default       | TS_2DIFF                               |
| Effective | After restarting system                               |

- default_int64_encoding

| Name         | default_int64_encoding                 |
| ------------ | -------------------------------------- |
| Description         | int64 Type encoding format.               |
| Value         | PLAIN, RLE, TS_2DIFF, REGULAR, GORILLA |
| Default       | TS_2DIFF                               |
| Effective | After restarting system                               |

- default_float_encoding

| Name         | default_float_encoding        |
| ------------ | ----------------------------- |
| Description         | float Type encoding format.            |
| Value         | PLAIN, RLE, TS_2DIFF, GORILLA |
| Default       | GORILLA                       |
| Effective | After restarting system                      |

- default_double_encoding

| Name         | default_double_encoding       |
| ------------ | ----------------------------- |
| Description         | double Type encoding format.           |
| Value         | PLAIN, RLE, TS_2DIFF, GORILLA |
| Default       | GORILLA                       |
| Effective | After restarting system                      |

- default_text_encoding

| Name         | default_text_encoding |
| ------------ | --------------------- |
| Description         | text Type encoding format.     |
| Value         | PLAIN                 |
| Default       | PLAIN                 |
| Effective | After restarting system              |

### 3.17 Query Configurations

- read_consistency_level

| Name         | read_consistency_level                                       |
| ------------ | ------------------------------------------------------------ |
| Description         | Query consistency level, when the Value is 'strong', query from the Leader replica; when the Value is 'weak', query a replica randomly. |
| Type         | String                                                       |
| Default       | strong                                                       |
| Effective | After restarting system                                                     |

- meta_data_cache_enable

| Name         | meta_data_cache_enable                                       |
| ------------ | ------------------------------------------------------------ |
| Description         | Whether to cache metadata (including BloomFilter, Chunk Metadata, and TimeSeries Metadata). |
| Type         | Boolean                                                      |
| Default       | true                                                         |
| Effective | After restarting system                                                     |

- chunk_timeseriesmeta_free_memory_proportion

| Name         | chunk_timeseriesmeta_free_memory_proportion                  |
| ------------ | ------------------------------------------------------------ |
| Description         | Memory allocation ratio for reading, BloomFilterCache, ChunkCache, TimeseriesMetadataCache, memory for dataset queries, and available memory queries. The parameter format is a : b : c : d : e, where a, b, c, d, e are integers. For example, '1 : 1 : 1 : 1 : 1', '1 : 100 : 200 : 300 : 400'. |
| Type         | String                                                       |
| Default       | 1 : 100 : 200 : 300 : 400                                    |
| Effective | After restarting system                                                     |

- enable_last_cache

| Name         | enable_last_cache  |
| ------------ | ------------------ |
| Description         | Whether to enable the latest point cache. |
| Type         | Boolean            |
| Default       | true               |
| Effective | After restarting system           |

- mpp_data_exchange_core_pool_size

| Name         | mpp_data_exchange_core_pool_size |
| ------------ | -------------------------------- |
| Description         | The core thread count of the MPP data exchange thread pool.   |
| Type         | int32                            |
| Default       | 10                               |
| Effective | After restarting system                         |

- mpp_data_exchange_max_pool_size

| Name         | mpp_data_exchange_max_pool_size |
| ------------ | ------------------------------- |
| Description         | The maximum thread count of the MPP data exchange thread pool.    |
| Type         | int32                           |
| Default       | 10                              |
| Effective | After restarting system                        |

- mpp_data_exchange_keep_alive_time_in_ms

| Name         | mpp_data_exchange_keep_alive_time_in_ms |
| ------------ | --------------------------------------- |
| Description         | The maximum wait time for MPP data exchange.           |
| Type         | int32                                   |
| Default       | 1000                                    |
| Effective | After restarting system                                |

- driver_task_execution_time_slice_in_ms

| Name         | driver_task_execution_time_slice_in_ms |
| ------------ | -------------------------------------- |
| Description         | The maximum execution time for a single DriverTask (ms).     |
| Type         | int32                                  |
| Default       | 200                                    |
| Effective | After restarting system                               |

- max_tsblock_size_in_bytes

| Name         | max_tsblock_size_in_bytes       |
| ------------ | ------------------------------- |
| Description         | The maximum capacity of a single TsBlock (byte). |
| Type         | int32                           |
| Default       | 131072                          |
| Effective | After restarting system                        |

- max_tsblock_line_numbers

| Name         | max_tsblock_line_numbers |
| ------------ | ------------------------ |
| Description         | The maximum number of rows in a single TsBlock.  |
| Type         | int32                    |
| Default       | 1000                     |
| Effective | After restarting system                 |

- slow_query_threshold

| Name         | slow_query_threshold           |
| ------------ | ------------------------------ |
| Description         | The time threshold for slow queries. Unit: ms. |
| Type         | long                           |
| Default       | 10000                          |
| Effective | hot-load                         |

- query_timeout_threshold

| Name         | query_timeout_threshold          |
| ------------ | -------------------------------- |
| Description         | The maximum execution time for a query. Unit: ms. |
| Type         | Int32                            |
| Default       | 60000                            |
| Effective | After restarting system                         |

- max_allowed_concurrent_queries

| Name         | max_allowed_concurrent_queries |
| ------------ | ------------------------------ |
| Description         | The maximum number of concurrent queries allowed.       |
| Type         | Int32                          |
| Default       | 1000                           |
| Effective | After restarting system                       |

- query_thread_count

| Name         | query_thread_count                                           |
| ------------ | ------------------------------------------------------------ |
| Description         | When IoTDB queries data in memory, the maximum number of threads to start for this operation. If this value is less than or equal to 0, then the number of CPU cores installed on the machine is used. |
| Type         | Int32                                                        |
| Default       | 0                                                            |
| Effective | After restarting system                                                     |

- degree_of_query_parallelism

| Name         | degree_of_query_parallelism                                  |
| ------------ | ------------------------------------------------------------ |
| Description         | Set the number of pipeline drivers created by a single query fragment instance, which is the degree of parallelism for query operations. |
| Type         | Int32                                                        |
| Default       | 0                                                            |
| Effective | After restarting system                                                     |

- mode_map_size_threshold

| Name         | mode_map_size_threshold                        |
| ------------ | ---------------------------------------------- |
| Description         | The threshold to which the count map can grow when calculating the MODE aggregate function. |
| Type         | Int32                                          |
| Default       | 10000                                          |
| Effective | After restarting system                                       |

- batch_size

| Name         | batch_size                                                 |
| ------------ | ---------------------------------------------------------- |
| Description         | The amount of data per iteration on the server (data entries, i.e., the number of different timestamps). |
| Type         | Int32                                                      |
| Default       | 100000                                                     |
| Effective | After restarting system                                                   |

- sort_buffer_size_in_bytes

| Name         | sort_buffer_size_in_bytes              |
| ------------ | -------------------------------------- |
| Description         | Set the size of the memory buffer used in external sorting operations. |
| Type         | long                                   |
| Default       | 1048576                                |
| Effective | After restarting system                               |

- merge_threshold_of_explain_analyze

| Name         | merge_threshold_of_explain_analyze                           |
| ------------ | ------------------------------------------------------------ |
| Description         | Used to set the merge threshold for the number of operators (operator) in the result set of the `EXPLAIN ANALYZE` statement. |
| Type         | int                                                          |
| Default       | 10                                                           |
| Effective | hot-load                                                       |

###  3.18 TTL Configuration

- ttl_check_interval

| Name         | ttl_check_interval                     |
| ------------ | -------------------------------------- |
| Description         | The interval for TTL check tasks, Unit ms, default is 2 hours. |
| Type         | int                                    |
| Default       | 7200000                                |
| Effective | After restarting system                               |

- max_expired_time

| Name         | max_expired_time                                             |
| ------------ | ------------------------------------------------------------ |
| Description         | If a device in a file has expired for more than this time, then the file will be immediately compacted. Unit ms, default is one month. |
| Type         | int                                                          |
| Default       | 2592000000                                                   |
| Effective | After restarting system                                                     |

- expired_data_ratio

| Name         | expired_data_ratio                                           |
| ------------ | ------------------------------------------------------------ |
| Description         | The ratio of expired devices. If the ratio of expired devices in a file exceeds this value, then the expired data in the file will be cleaned up through compaction. |
| Type         | float                                                        |
| Default       | 0.3                                                          |
| Effective | After restarting system                                                     |

### 3.19 Storage Engine Configuration

- timestamp_precision

| Name         | timestamp_precision          |
| ------------ | ---------------------------- |
| Description         | Timestamp precision, supports ms, us, ns.  |
| Type         | String                       |
| Default       | ms                           |
| Effective | Only allowed to be modified in first start up |

- timestamp_precision_check_enabled

| Name         | timestamp_precision_check_enabled |
| ------------ | --------------------------------- |
| Description         | Used to control whether to enable timestamp precision checks.    |
| Type         | Boolean                           |
| Default       | true                              |
| Effective | Only allowed to be modified in first start up      |

- max_waiting_time_when_insert_blocked

| Name         | max_waiting_time_when_insert_blocked            |
| ------------ | ----------------------------------------------- |
| Description         | If an insert request waits for more than this time, an exception is thrown, Unit ms. |
| Type         | Int32                                           |
| Default       | 10000                                           |
| Effective | After restarting system                                        |

- handle_system_error

| Name         | handle_system_error                  |
| ------------ | ------------------------------------ |
| Description         | The method of handling when the system encounters an irrecoverable error. |
| Type         | String                               |
| Default       | CHANGE_TO_READ_ONLY                  |
| Effective | After restarting system                             |

- enable_timed_flush_seq_memtable

| Name         | enable_timed_flush_seq_memtable |
| ------------ | ------------------------------- |
| Description         | Whether to enable scheduled flushing of sequential memtables.   |
| Type         | Boolean                         |
| Default       | true                            |
| Effective | hot-load                          |

- seq_memtable_flush_interval_in_ms

| Name         | seq_memtable_flush_interval_in_ms                            |
| ------------ | ------------------------------------------------------------ |
| Description         | When the creation time of a memTable is less than the current time minus this value, the memtable needs to be flushed. |
| Type         | long                                                         |
| Default       | 600000                                                       |
| Effective | hot-load                                                       |

- seq_memtable_flush_check_interval_in_ms

| Name         | seq_memtable_flush_check_interval_in_ms  |
| ------------ | ---------------------------------------- |
| Description         | The time interval to check whether sequential memtables need to be flushed. |
| Type         | long                                     |
| Default       | 30000                                    |
| Effective | hot-load                                   |

- enable_timed_flush_unseq_memtable

| Name         | enable_timed_flush_unseq_memtable |
| ------------ | --------------------------------- |
| Description         | Whether to enable scheduled refreshing of out-of-order memtables.     |
| Type         | Boolean                           |
| Default       | true                              |
| Effective | hot-load                            |

- unseq_memtable_flush_interval_in_ms

| Name         | unseq_memtable_flush_interval_in_ms                          |
| ------------ | ------------------------------------------------------------ |
| Description         | When the creation time of a memTable is less than the current time minus this value, the memtable needs to be flushed. |
| Type         | long                                                         |
| Default       | 600000                                                       |
| Effective | hot-load                                                       |

- unseq_memtable_flush_check_interval_in_ms

| Name         | unseq_memtable_flush_check_interval_in_ms |
| ------------ | ----------------------------------------- |
| Description         | The time interval to check whether out-of-order memtables need to be flushed.  |
| Type         | long                                      |
| Default       | 30000                                     |
| Effective | hot-load                                    |

- tvlist_sort_algorithm

| Name         | tvlist_sort_algorithm    |
| ------------ | ------------------------ |
| Description         | The sorting method for data in memtables. |
| Type         | String                   |
| Default       | TIM                      |
| Effective | After restarting system                 |

- avg_series_point_number_threshold

| Name         | avg_series_point_number_threshold                |
| ------------ | ------------------------------------------------ |
| Description         | The maximum average number of points per time series in memory, triggering a flush when reached. |
| Type         | int32                                            |
| Default       | 100000                                           |
| Effective | After restarting system                                         |

- flush_thread_count

| Name         | flush_thread_count                                           |
| ------------ | ------------------------------------------------------------ |
| Description         | When IoTDB writes data from memory to disk, the maximum number of threads to start for this operation. If this value is less than or equal to 0, then the number of CPU cores installed on the machine is used. Default is 0. |
| Type         | int32                                                        |
| Default       | 0                                                            |
| Effective | After restarting system                                                     |

- enable_partial_insert

| Name         | enable_partial_insert                                        |
| ------------ | ------------------------------------------------------------ |
| Description         | In a single insert request, if some measurements fail to write, whether to continue writing other measurements. |
| Type         | Boolean                                                      |
| Default       | true                                                         |
| Effective | After restarting system                                                     |

- recovery_log_interval_in_ms

| Name         | recovery_log_interval_in_ms               |
| ------------ | ----------------------------------------- |
| Description         | The interval at which log information is printed during the recovery process of a data region. |
| Type         | Int32                                     |
| Default       | 5000                                      |
| Effective | After restarting system                                  |

- 0.13_data_insert_adapt

| Name         | 0.13_data_insert_adapt                                  |
| ------------ | ------------------------------------------------------- |
| Description         | If the 0.13 version client performs writing, this configuration item needs to be set to true. |
| Type         | Boolean                                                 |
| Default       | false                                                   |
| Effective | After restarting system                                                |

- enable_tsfile_validation

| Name         | enable_tsfile_validation               |
| ------------ | -------------------------------------- |
| Description         | Verify the correctness of the tsfile after Flush, Load, or merge. |
| Type         | boolean                                |
| Default       | false                                  |
| Effective | hot-load                                 |

- tier_ttl_in_ms

| Name         | tier_ttl_in_ms                            |
| ------------ | ----------------------------------------- |
| Description         | Define the data range responsible for each level, represented by TTL. |
| Type         | long                                      |
| Default       | -1                                        |
| Effective | After restarting system                                  |

### 3.20 Compaction Configurations

- enable_seq_space_compaction

| Name         | enable_seq_space_compaction            |
| ------------ | -------------------------------------- |
| Description         | In-order space merging, enabling the merging of sequential files within the same space. |
| Type         | Boolean                                |
| Default       | true                                   |
| Effective | hot-load                                 |

- enable_unseq_space_compaction

| Name         | enable_unseq_space_compaction          |
| ------------ | -------------------------------------- |
| Description         | Out-of-order space merging, enabling the merging of out-of-order files within the same space. |
| Type         | Boolean                                |
| Default       | true                                   |
| Effective | hot-load                                 |

- enable_cross_space_compaction

| Name         | enable_cross_space_compaction              |
| ------------ | ------------------------------------------ |
| Description         | Cross-space merging, enabling the merging of out-of-order files into sequential files. |
| Type         | Boolean                                    |
| Default       | true                                       |
| Effective | hot-load                                     |

- enable_auto_repair_compaction

| Name         | enable_auto_repair_compaction |
| ------------ | ----------------------------- |
| Description         | Merge task for repairing files.            |
| Type         | Boolean                       |
| Default       | true                          |
| Effective | hot-load                        |

- cross_selector

| Name         | cross_selector             |
| ------------ | -------------------------- |
| Description         | Type of cross-space merge task selector. |
| Type         | String                     |
| Default       | rewrite                    |
| Effective | After restarting system                   |

- cross_performer

| Name         | cross_performer                                              |
| ------------ | ------------------------------------------------------------ |
| Description         | Type of cross-space merge task executor, options are read_point and fast, default is read_point, fast is still in testing. |
| Type         | String                                                       |
| Default       | read_point                                                   |
| Effective | After restarting system                                                     |

- inner_seq_selector

| Name         | inner_seq_selector                                           |
| ------------ | ------------------------------------------------------------ |
| Description         | Type of in-order space merge task selector, options are size_tiered_single_target, size_tiered_multi_target. |
| Type         | String                                                       |
| Default       | size_tiered_multi_target                                     |
| Effective | hot-load                                                       |

- inner_seq_performer

| Name         | inner_seq_performer                                          |
| ------------ | ------------------------------------------------------------ |
| Description         | Type of in-order space merge task executor, options are read_chunk and fast, default is read_chunk, fast is still in testing. |
| Type         | String                                                       |
| Default       | read_chunk                                                   |
| Effective | After restarting system                                                     |

- inner_unseq_selector

| Name         | inner_unseq_selector                                         |
| ------------ | ------------------------------------------------------------ |
| Description         | Type of out-of-order space merge task selector, options are size_tiered_single_target, size_tiered_multi_target. |
| Type         | String                                                       |
| Default       | size_tiered_multi_target                                     |
| Effective | hot-load                                                       |

- inner_unseq_performer

| Name         | inner_unseq_performer                                        |
| ------------ | ------------------------------------------------------------ |
| Description         | Type of out-of-order space merge task executor, options are read_point and fast, default is read_point, fast is still in testing. |
| Type         | String                                                       |
| Default       | read_point                                                   |
| Effective | After restarting system                                                     |

- compaction_priority

| Name         | compaction_priority                                          |
| ------------ | ------------------------------------------------------------ |
| Description         | Priorities during merging, BALANCE for equal priority among all merges, INNER_CROSS for prioritizing merges between sequential files or out-of-order files, CROSS_INNER for prioritizing merging out-of-order files into sequential files. |
| Type         | String                                                       |
| Default       | INNER_CROSS                                                  |
| Effective | After restarting system                                                 |

- candidate_compaction_task_queue_size

| Name         | candidate_compaction_task_queue_size |
| ------------ | ------------------------------------ |
| Description         | Size of the merge task priority queue.             |
| Type         | int32                                |
| Default       | 50                                   |
| Effective | After restarting system                             |

- target_compaction_file_size

| Name         | target_compaction_file_size |
| ------------ | --------------------------- |
| Description         | Target file size after merging.        |
| Type         | Int64                       |
| Default       | 2147483648                  |
| Effective | hot-load                      |

- inner_compaction_total_file_size_threshold

| Name         | inner_compaction_total_file_size_threshold   |
| ------------ | -------------------------------------------- |
| Description         | Maximum total size of selected files for in-space merge tasks, Unit: byte. |
| Type         | int64                                        |
| Default       | 10737418240                                  |
| Effective | hot-load                                       |

- inner_compaction_total_file_num_threshold

| Name         | inner_compaction_total_file_num_threshold |
| ------------ | ----------------------------------------- |
| Description         | Maximum number of files involved in a single in-space merge.      |
| Type         | int32                                     |
| Default       | 100                                       |
| Effective | hot-load                                    |

- max_level_gap_in_inner_compaction

| Name         | max_level_gap_in_inner_compaction      |
| ------------ | -------------------------------------- |
| Description         | Maximum allowed file levels to span when selecting files for in-space merging. |
| Type         | int32                                  |
| Default       | 2                                      |
| Effective | hot-load                                 |

- target_chunk_size

| Name         | target_chunk_size       |
| ------------ | ----------------------- |
| Description         | Target size of a Chunk during merging. |
| Type         | Int64                   |
| Default       | 1048576                 |
| Effective | After restarting system                |

- target_chunk_point_num

| Name         | target_chunk_point_num  |
| ------------ | ----------------------- |
| Description         | Target number of points in a Chunk during merging. |
| Type         | int32                   |
| Default       | 100000                  |
| Effective | After restarting system                |

- chunk_size_lower_bound_in_compaction

| Name         | chunk_size_lower_bound_in_compaction                  |
| ------------ | ----------------------------------------------------- |
| Description         | When merging, if the size of the source Chunk is smaller than this value, it will be unpacked into points for merging |
| Type         | Int64                                                 |
| Default       | 10240                                                 |
| Effective | After restarting system                                              |

- chunk_point_num_lower_bound_in_compaction

| Name         | chunk_point_num_lower_bound_in_compaction             |
| ------------ | ----------------------------------------------------- |
| Description         | When merging, if the number of points in the source Chunk is less than this value, it will be split into points for merging |
| Type         | int32                                                 |
| Default       | 1000                                                  |
| Effective | After restarting system                                              |

- inner_compaction_candidate_file_num

| Name         | inner_compaction_candidate_file_num      |
| ------------ | ---------------------------------------- |
| Description         | Number of candidate files eligible to form an in-space merge task. |
| Type         | int32                                    |
| Default       | 30                                       |
| Effective | hot-load                                   |

- max_cross_compaction_candidate_file_num

| Name         | max_cross_compaction_candidate_file_num |
| ------------ | --------------------------------------- |
| Description         | Maximum number of files involved in a single cross-space merge.    |
| Type         | int32                                   |
| Default       | 500                                     |
| Effective | hot-load                                  |

- max_cross_compaction_candidate_file_size

| Name         | max_cross_compaction_candidate_file_size |
| ------------ | ---------------------------------------- |
| Description         | Maximum total size of files involved in a single cross-space merge. |
| Type         | Int64                                    |
| Default       | 5368709120                               |
| Effective | hot-load                                   |

- min_cross_compaction_unseq_file_level

| Name         | min_cross_compaction_unseq_file_level          |
| ------------ | ---------------------------------------------- |
| Description         | Minimum internal compression level for files in out-of-order space during cross-space merging. |
| Type         | int32                                          |
| Default       | 1                                              |
| Effective | hot-load                                         |

- compaction_thread_count

| Name         | compaction_thread_count |
| ------------ | ----------------------- |
| Description         | Number of threads executing merge tasks.  |
| Type         | int32                   |
| Default       | 10                      |
| Effective | hot-load                  |

- compaction_max_aligned_series_num_in_one_batch

| Name         | compaction_max_aligned_series_num_in_one_batch |
| ------------ | ---------------------------------------------- |
| Description         | Number of value columns processed in a single execution of aligned sequence merging.           |
| Type         | int32                                          |
| Default       | 10                                             |
| Effective | hot-load                                         |

- compaction_schedule_interval_in_ms

| Name         | compaction_schedule_interval_in_ms |
| ------------ | ---------------------------------- |
| Description         | Time interval for merge scheduling.                 |
| Type         | Int64                              |
| Default       | 60000                              |
| Effective | After restarting system                           |

- compaction_write_throughput_mb_per_sec

| Name         | compaction_write_throughput_mb_per_sec |
| ------------ | -------------------------------------- |
| Description         | Merge limit on achievable write throughput per second.       |
| Type         | int32                                  |
| Default       | 16                                     |
| Effective | After restarting system                               |

- compaction_read_throughput_mb_per_sec

| Name      | compaction_read_throughput_mb_per_sec                |
| --------- | ---------------------------------------------------- |
| Description      | Merge read throughput limit per second, Unit is byte, set to 0 for no limit. |
| Type      | int32                                                |
| Default    | 0                                                    |
| Effective | hot-load                                               |

- compaction_read_operation_per_sec

| Name      | compaction_read_operation_per_sec           |
| --------- | ------------------------------------------- |
| Description      | Merge read operation limit per second, set to 0 for no limit. |
| Type      | int32                                       |
| Default    | 0                                           |
| Effective | hot-load                                      |

- sub_compaction_thread_count

| Name         | sub_compaction_thread_count                                  |
| ------------ | ------------------------------------------------------------ |
| Description         | Number of sub-task threads per merge task, effective only for cross-space merging and out-of-order in-space merging. |
| Type         | int32                                                        |
| Default       | 4                                                            |
| Effective | hot-load                                                       |

- inner_compaction_task_selection_disk_redundancy

| Name         | inner_compaction_task_selection_disk_redundancy |
| ------------ | ----------------------------------------------- |
| Description         | Defines the redundancy value of available disk space, used only for internal compression.     |
| Type         | double                                          |
| Default       | 0.05                                            |
| Effective | hot-load                                          |

- inner_compaction_task_selection_mods_file_threshold

| Name         | inner_compaction_task_selection_mods_file_threshold |
| ------------ | --------------------------------------------------- |
| Description         | Defines the threshold size of mods files, used only for internal compression.       |
| Type         | long                                                |
| Default       | 131072                                              |
| Effective | hot-load                                              |

- compaction_schedule_thread_num

| Name         | compaction_schedule_thread_num |
| ------------ | ------------------------------ |
| Description         | Number of threads selecting merge tasks.         |
| Type         | int32                          |
| Default       | 4                              |
| Effective | hot-load                         |

### 3.21 Write Ahead Log Configuration

- wal_mode

| Name         | wal_mode                                                     |
| ------------ | ------------------------------------------------------------ |
| Description         | Write-ahead log (WAL) write mode. In DISABLE mode, the write-ahead log is turned off; in SYNC mode, write requests return after being successfully written to disk; in ASYNC mode, write requests may return before being successfully written to disk. |
| Type         | String                                                       |
| Default       | ASYNC                                                        |
| Effective | After restarting system                                                     |

- max_wal_nodes_num

| Name         | max_wal_nodes_num                                     |
| ------------ | ----------------------------------------------------- |
| Description         | The maximum number of write-ahead log (WAL) nodes, Default 0 means the quantity is controlled by the system. |
| Type         | int32                                                 |
| Default       | 0                                                     |
| Effective | After restarting system                                              |

- wal_async_mode_fsync_delay_in_ms

| Name         | wal_async_mode_fsync_delay_in_ms            |
| ------------ | ------------------------------------------- |
| Description         | The waiting time before calling fsync in async mode for write-ahead logs. |
| Type         | int32                                       |
| Default       | 1000                                        |
| Effective | hot-load                                      |

- wal_sync_mode_fsync_delay_in_ms

| Name         | wal_sync_mode_fsync_delay_in_ms            |
| ------------ | ------------------------------------------ |
| Description         | The waiting time before calling fsync in sync mode for write-ahead logs. |
| Type         | int32                                      |
| Default       | 3                                          |
| Effective | hot-load                                     |

- wal_buffer_size_in_byte

| Name         | wal_buffer_size_in_byte |
| ------------ | ----------------------- |
| Description         | The buffer size of the write-ahead log.  |
| Type         | int32                   |
| Default       | 33554432                |
| Effective | After restarting system                |

- wal_buffer_queue_capacity

| Name         | wal_buffer_queue_capacity |
| ------------ | ------------------------- |
| Description         | The upper limit of the write-ahead log's blocking queue size.  |
| Type         | int32                     |
| Default       | 500                       |
| Effective | After restarting system                  |

- wal_file_size_threshold_in_byte

| Name         | wal_file_size_threshold_in_byte |
| ------------ | ------------------------------- |
| Description         | The sealing threshold for write-ahead log files.            |
| Type         | int32                           |
| Default       | 31457280                        |
| Effective | hot-load                          |

- wal_min_effective_info_ratio

| Name         | wal_min_effective_info_ratio |
| ------------ | ---------------------------- |
| Description         | The minimum valid information ratio of the write-ahead log.       |
| Type         | double                       |
| Default       | 0.1                          |
| Effective | hot-load                       |

- wal_memtable_snapshot_threshold_in_byte

| Name         | wal_memtable_snapshot_threshold_in_byte  |
| ------------ | ---------------------------------------- |
| Description         | The threshold size of the memory table that triggers a snapshot in the write-ahead log. |
| Type         | int64                                    |
| Default       | 8388608                                  |
| Effective | hot-load                                   |

- max_wal_memtable_snapshot_num

| Name         | max_wal_memtable_snapshot_num  |
| ------------ | ------------------------------ |
| Description         | The maximum number limit of memory tables in the write-ahead log. |
| Type         | int32                          |
| Default       | 1                              |
| Effective | hot-load                         |

- delete_wal_files_period_in_ms

| Name         | delete_wal_files_period_in_ms |
| ------------ | ----------------------------- |
| Description         | The interval for checking deletion of write-ahead logs.        |
| Type         | int64                         |
| Default       | 20000                         |
| Effective | hot-load                        |

- wal_throttle_threshold_in_byte

| Name         | wal_throttle_threshold_in_byte                               |
| ------------ | ------------------------------------------------------------ |
| Description         | In IoTConsensus, when the size of the WAL file reaches a certain threshold, throttling of write operations will begin to control the write speed. |
| Type         | long                                                         |
| Default       | 53687091200                                                  |
| Effective | hot-load                                                       |

- iot_consensus_cache_window_time_in_ms

| Name         | iot_consensus_cache_window_time_in_ms    |
| ------------ | ---------------------------------------- |
| Description         | The maximum waiting time for write caches in IoTConsensus. |
| Type         | long                                     |
| Default       | -1                                       |
| Effective | hot-load                                   |

- enable_wal_compression

| Name         | iot_consensus_cache_window_time_in_ms |
| ------------ | ------------------------------------- |
| Description         | Used to control whether to enable compression of WAL.         |
| Type         | boolean                               |
| Default       | true                                  |
| Effective | hot-load                                |

### 3.22 IoTConsensus Configuration

The following configuration items will only take effect after the Region is configured with the IoTConsensus consensus protocol.

- data_region_iot_max_log_entries_num_per_batch

| Name         | data_region_iot_max_log_entries_num_per_batch |
| ------------ | --------------------------------------------- |
| Description         | The maximum number of logs in an IoTConsensus batch.            |
| Type         | int32                                         |
| Default       | 1024                                          |
| Effective | After restarting system                                      |

- data_region_iot_max_size_per_batch

| Name         | data_region_iot_max_size_per_batch |
| ------------ | ---------------------------------- |
| Description         |The maximum size of an IoTConsensus batch.      |
| Type         | int32                              |
| Default       | 16777216                           |
| Effective | After restarting system                           |

- data_region_iot_max_pending_batches_num

| Name         | data_region_iot_max_pending_batches_num |
| ------------ | --------------------------------------- |
| Description         | The pipeline concurrency threshold of an IoTConsensus batch.     |
| Type         | int32                                   |
| Default       | 5                                       |
| Effective | After restarting system                                |

- data_region_iot_max_memory_ratio_for_queue

| Name         | data_region_iot_max_memory_ratio_for_queue |
| ------------ | ------------------------------------------ |
| Description         | IoTConsensus queue memory allocation ratio              |
| Type         | double                                     |
| Default       | 0.6                                        |
| Effective | After restarting system                                   |

- region_migration_speed_limit_bytes_per_second

| Name         | region_migration_speed_limit_bytes_per_second |
| ------------ | --------------------------------------------- |
| Description         | Defines the maximum data transfer rate during region migration  |
| Type         | long                                          |
| Default       | 33554432                                      |
| Effective | After restarting system                                      |

### 3.23 TsFile Configurations

- group_size_in_byte

| Name         | group_size_in_byte                             |
| ------------ | ---------------------------------------------- |
| Description         | Maximum number of bytes written to disk each time data is written from memory |
| Type         | int32                                          |
| Default       | 134217728                                      |
| Effective | hot-load                                         |

- page_size_in_byte

| Name         | page_size_in_byte                                    |
| ------------ | ---------------------------------------------------- |
| Description         | The maximum size of a single page written for each column in memory, in bytes |
| Type         | int32                                                |
| Default       | 65536                                                |
| Effective | hot-load                                               |

- max_number_of_points_in_page

| Name         | max_number_of_points_in_page                      |
| ------------ | ------------------------------------------------- |
| Description         |  The maximum number of data points (timestamp-value pairs) contained in a page |
| Type         | int32                                             |
| Default       | 10000                                             |
| Effective | hot-load                                            |

- pattern_matching_threshold

| Name         | pattern_matching_threshold     |
| ------------ | ------------------------------ |
| Description         | The maximum number of matches for regular expression matching |
| Type         | int32                          |
| Default       | 1000000                        |
| Effective | hot-load                         |

- float_precision

| Name         | float_precision                                              |
| ------------ | ------------------------------------------------------------ |
| Description         | The precision of floating-point numbers, which is the number of digits after the decimal point                             |
| Type         | int32                                                        |
| Default       | The default is 2 digits. Note: The decimal precision of 32-bit floating-point numbers is 7 bits, and the decimal precision of 64 bit floating-point numbers is 15 bits. If the setting exceeds the machine accuracy, it will have no practical significance. |
| Effective | hot-load                                                       |

- value_encoder

| Name         | value_encoder                         |
| ------------ | ------------------------------------- |
| Description         | Value column encoding method                      |
| Type         | String: “TS_2DIFF”,“PLAIN”,“RLE” |
| Default       | PLAIN                                 |
| Effective | hot-load                                |

- compressor

| Name         | compressor                                                   |
| ------------ | ------------------------------------------------------------ |
| Description         | Data compression method; Compression method for the time column in aligned sequences.                    |
| Type         |  String : "UNCOMPRESSED", "SNAPPY", "LZ4", "ZSTD", "LZMA2" |
| Default       | LZ4                                                          |
| Effective | hot-load                                                       |

- encrypt_flag

| Name         | compressor                   |
| ------------ | ---------------------------- |
| Description         | Used to enable or disable data encryption functionality. |
| Type         | Boolean                      |
| Default       | false                        |
| Effective | After restarting system                     |

- encrypt_type

| Name         | compressor                            |
| ------------ | ------------------------------------- |
| Description         | Method of data encryption.                      |
| Type         | String                                |
| Default       | org.apache.tsfile.encrypt.UNENCRYPTED |
| Effective | After restarting system                              |

- encrypt_key_path

| Name         | encrypt_key_path             |
| ------------ | ---------------------------- |
| Description         | Key source path used for data encryption. |
| Type         | String                       |
| Default       | “ ”                           |
| Effective | After restarting system                     |

### 3.24 Authorization Configuration

- authorizer_provider_class

| Name         | authorizer_provider_class                                    |
| ------------ | ------------------------------------------------------------ |
| Description         | Permission service class name                            |
| Type         | String                                                       |
| Default       | org.apache.iotdb.commons.auth.authorizer.LocalFileAuthorizer |
| Effective | After restarting system                                                     |
| Other optional values   | org.apache.iotdb.commons.auth.authorizer.OpenIdAuthorizer    |

- openID_url

| Name         | openID_url                                                 |
| ------------ | ---------------------------------------------------------- |
| Description         | OpenID server address (must be set when OpenIdAuthorizer is enabled)
 |
| Type         | String (an HTTP address)                                 |
| Default       | “ ”                                                         |
| Effective | After restarting system                                                   |

- iotdb_server_encrypt_decrypt_provider

| Name         | iotdb_server_encrypt_decrypt_provider                        |
| ------------ | ------------------------------------------------------------ |
| Description         | Class used for user password encryption          |
| Type         | String                                                       |
| Default       | org.apache.iotdb.commons.security.encrypt.MessageDigestEncrypt |
| Effective | Only allowed to be modified in first start up                                 |

- iotdb_server_encrypt_decrypt_provider_parameter

| Name         | iotdb_server_encrypt_decrypt_provider_parameter |
| ------------ | ----------------------------------------------- |
| Description         | Parameters for initializing the user password encryption class
    |
| Type         | String                                          |
| Default       | “ ”                                              |
| Effective | Only allowed to be modified in first start up                    |

- author_cache_size

| Name         | author_cache_size        |
| ------------ | ------------------------ |
| Description         |The size of user cache and role cache
 |
| Type         | int32                    |
| Default       | 1000                     |
| Effective | After restarting system                 |

- author_cache_expire_time

| Name         | author_cache_expire_time               |
| ------------ | -------------------------------------- |
| Description         | The validity period of user cache and role cache, Unit is minutes |
| Type         | int32                                  |
| Default       | 30                                     |
| Effective | After restarting system                               |

### 3.25 UDF Configuration

- udf_initial_byte_array_length_for_memory_control

| Name         | udf_initial_byte_array_length_for_memory_control             |
| ------------ | ------------------------------------------------------------ |
| Description         | Used to evaluate the memory usage of text fields in UDF queries. It is recommended to set this value slightly larger than the average length of all text records. |
| Type         | int32                                                        |
| Default       | 48                                                           |
| Effective | After restarting system                                                     |

- udf_memory_budget_in_mb

| Name         | udf_memory_budget_in_mb                                      |
| ------------ | ------------------------------------------------------------ |
| Description         | How much memory (in MB) is used in a UDF query. The limit is 20% of the allocated memory for reading. |
| Type         | Float                                                        |
| Default       | 30.0                                                         |
| Effective | After restarting system                                                     |

- udf_reader_transformer_collector_memory_proportion

| Name         | udf_reader_transformer_collector_memory_proportion        |
| ------------ | --------------------------------------------------------- |
| Description         | UDF memory allocation ratio. The parameter format is a : b : c, where a, b, c are integers. |
| Type         | String                                                    |
| Default       | 1:1:1                                                     |
| Effective | After restarting system                                                  |

- udf_lib_dir

| Name         | udf_lib_dir                  |
| ------------ | ---------------------------- |
| Description         | UDF log and jar file storage path  |
| Type         | String                       |
| Default       | ext/udf（Windows：ext\\udf） |
| Effective | After restarting system                     |

### 3.26 Trigger Configuration

- trigger_lib_dir

| Name         | trigger_lib_dir         |
| ------------ | ----------------------- |
| Description         | Directory where trigger JAR packages are stored |
| Type         | String                  |
| Default       | ext/trigger             |
| Effective | After restarting system                |

- stateful_trigger_retry_num_when_not_found

| Name         | stateful_trigger_retry_num_when_not_found      |
| ------------ | ---------------------------------------------- |
| Description         | The number of retries for stateful triggers when they cannot find a trigger instance |
| Type         | Int32                                          |
| Default       | 3                                              |
| Effective | After restarting system                                       |

### 3.27 Select-Into Configuration

- into_operation_buffer_size_in_byte

| Name         | into_operation_buffer_size_in_byte                           |
| ------------ | ------------------------------------------------------------ |
| Description         | The maximum memory (Unit: Byte) that can be occupied by data to be written when executing a select-into statement |
| Type         | long                                                         |
| Default       | 104857600                                                    |
| Effective | hot-load                                                       |

- select_into_insert_tablet_plan_row_limit

| Name         | select_into_insert_tablet_plan_row_limit                     |
| ------------ | ------------------------------------------------------------ |
| Description         | The maximum number of rows that can be processed in one insert-tablet-plan when executing a select-into statement  |
| Type         | int32                                                        |
| Default       | 10000                                                        |
| Effective | hot-load                                                       |

- into_operation_execution_thread_count

| Name         | into_operation_execution_thread_count      |
| ------------ | ------------------------------------------ |
| Description         | The number of threads in the thread pool for writing tasks in SELECT INTO |
| Type         | int32                                      |
| Default       | 2                                          |
| Effective | After restarting system                                   |

### 3.28 Continuous Query Configuration
- continuous_query_submit_thread_count

| Name         | continuous_query_execution_thread |
| ------------ | --------------------------------- |
| Description         | The number of threads in the thread pool for executing continuous query tasks  |
| Type         | int32                             |
| Default       | 2                                 |
| Effective | After restarting system                          |

- continuous_query_min_every_interval_in_ms

| Name         | continuous_query_min_every_interval_in_ms |
| ------------ | ----------------------------------------- |
| Description         | The minimum interval for continuous query execution              |
| Type         | long (duration)                           |
| Default       | 1000                                      |
| Effective | After restarting system                                  |

### 3.29 Pipe Configuration

- pipe_lib_dir

| Name         | pipe_lib_dir               |
| ------------ | -------------------------- |
| Description         | Custom Pipe plugin storage directory |
| Type         | string                     |
| Default       | ext/pipe                   |
| Effective | Not currently supported for modification               |

- pipe_subtask_executor_max_thread_num

| Name         | pipe_subtask_executor_max_thread_num                         |
| ------------ | ------------------------------------------------------------ |
| Description         | The maximum number of threads that can be used in processor and sink for pipe subtasks. The actual value will be min(pipe_subtask_executor_max_thread_num, max(1, CPU core count / 2)). |
| Type         | int                                                          |
| Default       | 5                                                            |
| Effective | After restarting system                                                     |

- pipe_sink_timeout_ms

| Name         | pipe_sink_timeout_ms                          |
| ------------ | --------------------------------------------- |
| Description         | The connection timeout time for Thrift clients (in milliseconds). |
| Type         | int                                           |
| Default       | 900000                                        |
| Effective | After restarting system                                      |

- pipe_sink_selector_number

| Name         | pipe_sink_selector_number                                    |
| ------------ | ------------------------------------------------------------ |
| Description         | The maximum number of execution result processing threads that can be used in the iotdb-thrift-async-sink plugin. It is recommended to set this value to less than or equal to pipe_sink_max_client_number. |
| Type         | int                                                          |
| Default       | 4                                                            |
| Effective | After restarting system                                                     |

- pipe_sink_max_client_number

| Name         | pipe_sink_max_client_number                                 |
| ------------ | ----------------------------------------------------------- |
| Description         | The maximum number of clients that can be used in the iotdb-thrift-async-sink plugin. |
| Type         | int                                                         |
| Default       | 16                                                          |
| Effective | After restarting system                                                    |

- pipe_air_gap_receiver_enabled

| Name         | pipe_air_gap_receiver_enabled                                |
| ------------ | ------------------------------------------------------------ |
| Description         | Whether to enable receiving pipe data through a gateway. The receiver can only return 0 or 1 in TCP mode to indicate whether the data is successfully received. |
| Type         | Boolean                                                      |
| Default       | false                                                        |
| Effective | After restarting system                                                     |

- pipe_air_gap_receiver_port

| Name         | pipe_air_gap_receiver_port           |
| ------------ | ------------------------------------ |
| Description         | The port through which the server receives pipe data via a gateway. |
| Type         | int                                  |
| Default       | 9780                                 |
| Effective | After restarting system                             |

- pipe_all_sinks_rate_limit_bytes_per_second

| Name         | pipe_all_sinks_rate_limit_bytes_per_second                   |
| ------------ | ------------------------------------------------------------ |
| Description         | The total number of bytes that all pipe sinks can transmit per second. When the given value is less than or equal to 0, it means there is no limit. The default is -1, indicating no limit. |
| Type         | double                                                       |
| Default       | -1                                                           |
| Effective | hot-load                                                       |

### 3.30 RatisConsensus Configuration

The following configuration items will only take effect after the Region is configured with the RatisConsensus consensus protocol.

- config_node_ratis_log_appender_buffer_size_max

| Name         | config_node_ratis_log_appender_buffer_size_max |
| ------------ | ---------------------------------------------- |
| Description         | The maximum byte limit for a single log RPC synchronization of confignode.   |
| Type         | int32                                          |
| Default       | 16777216                                       |
| Effective | After restarting system                                       |

- schema_region_ratis_log_appender_buffer_size_max

| Name         | schema_region_ratis_log_appender_buffer_size_max |
| ------------ | ------------------------------------------------ |
| Description         | The maximum byte limit for a single log RPC synchronization of schema region. |
| Type         | int32                                            |
| Default       | 16777216                                         |
| Effective | After restarting system                                         |

- data_region_ratis_log_appender_buffer_size_max

| Name         | data_region_ratis_log_appender_buffer_size_max |
| ------------ | ---------------------------------------------- |
| Description         | The maximum byte limit for a single log RPC synchronization of data region.  |
| Type         | int32                                          |
| Default       | 16777216                                       |
| Effective | After restarting system                                       |

- config_node_ratis_snapshot_trigger_threshold

| Name         | config_node_ratis_snapshot_trigger_threshold |
| ------------ | -------------------------------------------- |
| Description         | The number of logs required to trigger a snapshot for confignode.        |
| Type         | int32                                        |
| Default       | 400,000                                      |
| Effective | After restarting system                                     |

- schema_region_ratis_snapshot_trigger_threshold

| Name         | schema_region_ratis_snapshot_trigger_threshold |
| ------------ | ---------------------------------------------- |
| Description         | The number of logs required to trigger a snapshot for schema region.       |
| Type         | int32                                          |
| Default       | 400,000                                        |
| Effective | After restarting system                                       |

- data_region_ratis_snapshot_trigger_threshold

| Name         | data_region_ratis_snapshot_trigger_threshold |
| ------------ | -------------------------------------------- |
| Description         | The number of logs required to trigger a snapshot for data region.       |
| Type         | int32                                        |
| Default       | 400,000                                      |
| Effective | After restarting system                                     |

- config_node_ratis_log_unsafe_flush_enable

| Name         | config_node_ratis_log_unsafe_flush_enable |
| ------------ | ----------------------------------------- |
| Description         | Whether confignode allows asynchronous flushing of Raft logs.   |
| Type         | boolean                                   |
| Default       | false                                     |
| Effective | After restarting system                                  |

- schema_region_ratis_log_unsafe_flush_enable

| Name         | schema_region_ratis_log_unsafe_flush_enable |
| ------------ | ------------------------------------------- |
| Description         | Whether schema region allows asynchronous flushing of Raft logs.      |
| Type         | boolean                                     |
| Default       | false                                       |
| Effective | After restarting system                                    |

- data_region_ratis_log_unsafe_flush_enable

| Name         | data_region_ratis_log_unsafe_flush_enable |
| ------------ | ----------------------------------------- |
| Description         | Whether data region allows asynchronous flushing of Raft logs.     |
| Type         | boolean                                   |
| Default       | false                                     |
| Effective | After restarting system                                  |

- config_node_ratis_log_segment_size_max_in_byte

| Name         | config_node_ratis_log_segment_size_max_in_byte |
| ------------ | ---------------------------------------------- |
| Description         |The size of a RaftLog log segment file for confignode.  |
| Type         | int32                                          |
| Default       | 25165824                                       |
| Effective | After restarting system                                       |

- schema_region_ratis_log_segment_size_max_in_byte

| Name         | schema_region_ratis_log_segment_size_max_in_byte |
| ------------ | ------------------------------------------------ |
| Description         | The size of a RaftLog log segment file for schema region.  |
| Type         | int32                                            |
| Default       | 25165824                                         |
| Effective | After restarting system                                         |

- data_region_ratis_log_segment_size_max_in_byte

| Name         | data_region_ratis_log_segment_size_max_in_byte |
| ------------ | ---------------------------------------------- |
| Description         | The size of a RaftLog log segment file for data region.      |
| Type         | int32                                          |
| Default       | 25165824                                       |
| Effective | After restarting system                                       |

- config_node_simple_consensus_log_segment_size_max_in_byte

| Name         | data_region_ratis_log_segment_size_max_in_byte |
| ------------ | ---------------------------------------------- |
| Description         | The size of a Log log segment file for confignode simple consensus protocol.|
| Type         | int32                                          |
| Default       | 25165824                                       |
| Effective | After restarting system                                       |

- config_node_ratis_grpc_flow_control_window

| Name         | config_node_ratis_grpc_flow_control_window |
| ------------ | ------------------------------------------ |
| Description         | The size of the gRPC streaming congestion window for confignode.        |
| Type         | int32                                      |
| Default       | 4194304                                    |
| Effective | After restarting system                                   |

- schema_region_ratis_grpc_flow_control_window

| Name         | schema_region_ratis_grpc_flow_control_window |
| ------------ | -------------------------------------------- |
| Description         | The size of the gRPC streaming congestion window for schema region.      |
| Type         | int32                                        |
| Default       | 4194304                                      |
| Effective | After restarting system                                     |

- data_region_ratis_grpc_flow_control_window

| Name         | data_region_ratis_grpc_flow_control_window |
| ------------ | ------------------------------------------ |
| Description         | The size of the gRPC streaming congestion window for data region.     |
| Type         | int32                                      |
| Default       | 4194304                                    |
| Effective | After restarting system                                   |

- config_node_ratis_grpc_leader_outstanding_appends_max

| Name         | config_node_ratis_grpc_leader_outstanding_appends_max |
| ------------ | ----------------------------------------------------- |
| Description         | The concurrency threshold for gRPC pipelining for config node.  |
| Type         | int32                                                 |
| Default       | 128                                                   |
| Effective | After restarting system                                              |

- schema_region_ratis_grpc_leader_outstanding_appends_max

| Name         | schema_region_ratis_grpc_leader_outstanding_appends_max |
| ------------ | ------------------------------------------------------- |
| Description         | The concurrency threshold for gRPC pipelining for schema region.   |
| Type         | int32                                                   |
| Default       | 128                                                     |
| Effective | After restarting system                                                |

- data_region_ratis_grpc_leader_outstanding_appends_max

| Name         | data_region_ratis_grpc_leader_outstanding_appends_max |
| ------------ | ----------------------------------------------------- |
| Description         | The concurrency threshold for gRPC pipelining for data region.              |
| Type         | int32                                                 |
| Default       | 128                                                   |
| Effective | After restarting system                                              |

- config_node_ratis_log_force_sync_num

| Name         | config_node_ratis_log_force_sync_num |
| ------------ | ------------------------------------ |
| Description         |The fsync threshold for config node.         |
| Type         | int32                                |
| Default       | 128                                  |
| Effective | After restarting system                             |

- schema_region_ratis_log_force_sync_num

| Name         | schema_region_ratis_log_force_sync_num |
| ------------ | -------------------------------------- |
| Description         | The fsync threshold for schema region.       |
| Type         | int32                                  |
| Default       | 128                                    |
| Effective | After restarting system                               |

- data_region_ratis_log_force_sync_num

| Name         | data_region_ratis_log_force_sync_num |
| ------------ | ------------------------------------ |
| Description         | The fsync threshold for data region.             |
| Type         | int32                                |
| Default       | 128                                  |
| Effective | After restarting system                             |

- config_node_ratis_rpc_leader_election_timeout_min_ms

| Name         | config_node_ratis_rpc_leader_election_timeout_min_ms |
| ------------ | ---------------------------------------------------- |
| Description         | The minimum leader election timeout for confignode.      |
| Type         | int32                                                |
| Default       | 2000ms                                               |
| Effective | After restarting system                                             |

- schema_region_ratis_rpc_leader_election_timeout_min_ms

| Name         | schema_region_ratis_rpc_leader_election_timeout_min_ms |
| ------------ | ------------------------------------------------------ |
| Description         | The minimum leader election timeout for schema region.          |
| Type         | int32                                                  |
| Default       | 2000ms                                                 |
| Effective | After restarting system                                               |

- data_region_ratis_rpc_leader_election_timeout_min_ms

| Name         | data_region_ratis_rpc_leader_election_timeout_min_ms |
| ------------ | ---------------------------------------------------- |
| Description         | The minimum leader election timeout for data region.  |
| Type         | int32                                                |
| Default       | 2000ms                                               |
| Effective | After restarting system                                             |

- config_node_ratis_rpc_leader_election_timeout_max_ms

| Name         | config_node_ratis_rpc_leader_election_timeout_max_ms |
| ------------ | ---------------------------------------------------- |
| Description         | The maximum leader election timeout for confignode. |
| Type         | int32                                                |
| Default       | 4000ms                                               |
| Effective | After restarting system                                             |

- schema_region_ratis_rpc_leader_election_timeout_max_ms

| Name         | schema_region_ratis_rpc_leader_election_timeout_max_ms |
| ------------ | ------------------------------------------------------ |
| Description         | The maximum leader election timeout for schema region.    |
| Type         | int32                                                  |
| Default       | 4000ms                                                 |
| Effective | After restarting system                                               |

- data_region_ratis_rpc_leader_election_timeout_max_ms

| Name         | data_region_ratis_rpc_leader_election_timeout_max_ms |
| ------------ | ---------------------------------------------------- |
| Description         | The maximum leader election timeout for data region.     |
| Type         | int32                                                |
| Default       | 4000ms                                               |
| Effective | After restarting system                                             |

- config_node_ratis_request_timeout_ms

| Name         | config_node_ratis_request_timeout_ms |
| ------------ | ------------------------------------ |
| Description         |The retry timeout for confignode Raft client.      |
| Type         | int32                                |
| Default       | 10000                                |
| Effective | After restarting system                             |

- schema_region_ratis_request_timeout_ms

| Name         | schema_region_ratis_request_timeout_ms |
| ------------ | -------------------------------------- |
| Description         |The retry timeout for schema region Raft client.   |
| Type         | int32                                  |
| Default       | 10000                                  |
| Effective | After restarting system                               |

- data_region_ratis_request_timeout_ms

| Name         | data_region_ratis_request_timeout_ms |
| ------------ | ------------------------------------ |
| Description         |The retry timeout for data region Raft client.      |
| Type         | int32                                |
| Default       | 10000                                |
| Effective | After restarting system                             |

- config_node_ratis_max_retry_attempts

| Name         | config_node_ratis_max_retry_attempts |
| ------------ | ------------------------------------ |
| Description         |The maximum number of retries for confignode Raft client.   |
| Type         | int32                                |
| Default       | 10                                   |
| Effective | After restarting system                             |

- config_node_ratis_initial_sleep_time_ms

| Name         | config_node_ratis_initial_sleep_time_ms |
| ------------ | --------------------------------------- |
| Description         | The initial retry sleep duration for confignode Raft client.  |
| Type         | int32                                   |
| Default       | 100ms                                   |
| Effective | After restarting system                                |

- config_node_ratis_max_sleep_time_ms

| Name         | config_node_ratis_max_sleep_time_ms   |
| ------------ | ------------------------------------- |
| Description         |The maximum retry sleep duration for confignode Raft client. |
| Type         | int32                                 |
| Default       | 10000                                 |
| Effective | After restarting system                              |

- schema_region_ratis_max_retry_attempts

| Name         | schema_region_ratis_max_retry_attempts |
| ------------ | -------------------------------------- |
| Description         | The maximum number of retries for schema region Raft client.   |
| Type         | int32                                  |
| Default       | 10                                     |
| Effective | After restarting system                               |

- schema_region_ratis_initial_sleep_time_ms

| Name         | schema_region_ratis_initial_sleep_time_ms |
| ------------ | ----------------------------------------- |
| Description         |The initial retry sleep duration for schema region Raft client.  |
| Type         | int32                                     |
| Default       | 100ms                                     |
| Effective | After restarting system                                  |

- schema_region_ratis_max_sleep_time_ms

| Name         | schema_region_ratis_max_sleep_time_ms    |
| ------------ | ---------------------------------------- |
| Description         | The maximum retry sleep duration for schema region Raft client.|
| Type         | int32                                    |
| Default       | 1000                                     |
| Effective | After restarting system                                 |

- data_region_ratis_max_retry_attempts

| Name         | data_region_ratis_max_retry_attempts |
| ------------ | ------------------------------------ |
| Description         | The maximum number of retries for data region Raft client.   |
| Type         | int32                                |
| Default       | 10                                   |
| Effective | After restarting system                             |

- data_region_ratis_initial_sleep_time_ms

| Name         | data_region_ratis_initial_sleep_time_ms |
| ------------ | --------------------------------------- |
| Description         |The initial retry sleep duration for data region Raft client.|
| Type         | int32                                   |
| Default       | 100ms                                   |
| Effective | After restarting system                                |

- data_region_ratis_max_sleep_time_ms

| Name         | data_region_ratis_max_sleep_time_ms    |
| ------------ | -------------------------------------- |
| Description         |The maximum retry sleep duration for data region Raft client. |
| Type         | int32                                  |
| Default       | 1000                                   |
| Effective | After restarting system                               |

- ratis_first_election_timeout_min_ms

| Name         | ratis_first_election_timeout_min_ms |
| ------------ | ----------------------------------- |
| Description         |The minimum timeout for the first election in Ratis protocol.     |
| Type         | int64                               |
| Default       | 50 (ms)                             |
| Effective | After restarting system                            |

- ratis_first_election_timeout_max_ms

| Name         | ratis_first_election_timeout_max_ms |
| ------------ | ----------------------------------- |
| Description         | The maximum timeout for the first election in Ratis protocol.      |
| Type         | int64                               |
| Default       | 150 (ms)                            |
| Effective | After restarting system                            |

- config_node_ratis_preserve_logs_num_when_purge

| Name         | config_node_ratis_preserve_logs_num_when_purge |
| ------------ | ---------------------------------------------- |
| Description         | The number of logs to retain after snapshot in confignode.    |
| Type         | int32                                          |
| Default       | 1000                                           |
| Effective | After restarting system                                       |

- schema_region_ratis_preserve_logs_num_when_purge

| Name         | schema_region_ratis_preserve_logs_num_when_purge |
| ------------ | ------------------------------------------------ |
| Description         |The number of logs to retain after snapshot in schema region. |
| Type         | int32                                            |
| Default       | 1000                                             |
| Effective | After restarting system                                         |

- data_region_ratis_preserve_logs_num_when_purge

| Name         | data_region_ratis_preserve_logs_num_when_purge |
| ------------ | ---------------------------------------------- |
| Description         |The number of logs to retain after snapshot in data region.  |
| Type         | int32                                          |
| Default       | 1000                                           |
| Effective | After restarting system                                       |

- config_node_ratis_log_max_size 

| Name         | config_node_ratis_log_max_size      |
| ------------ | ----------------------------------- |
| Description         | The maximum disk space that Raft Log can occupy for config node. |
| Type         | int64                               |
| Default       | 2147483648 (2GB)                    |
| Effective | After restarting system                            |

- schema_region_ratis_log_max_size 

| Name         | schema_region_ratis_log_max_size       |
| ------------ | -------------------------------------- |
| Description         | The maximum disk space that Raft Log can occupy for schema region.|
| Type         | int64                                  |
| Default       | 2147483648 (2GB)                       |
| Effective | After restarting system                               |

- data_region_ratis_log_max_size 

| Name         | data_region_ratis_log_max_size       |
| ------------ | ------------------------------------ |
| Description         |The maximum disk space that Raft Log can occupy for data region. |
| Type         | int64                                |
| Default       | 21474836480 (20GB)                   |
| Effective | After restarting system                             |

- config_node_ratis_periodic_snapshot_interval

| Name         | config_node_ratis_periodic_snapshot_interval |
| ------------ | -------------------------------------------- |
| Description         | The interval time for regular snapshots for config node.            |
| Type         | int64                                        |
| Default       | 86400 (秒)                                   |
| Effective | After restarting system                                     |

- schema_region_ratis_periodic_snapshot_interval  

| Name         | schema_region_ratis_preserve_logs_num_when_purge |
| ------------ | ------------------------------------------------ |
| Description         | The interval time for regular snapshots for schema region.      |
| Type         | int64                                            |
| Default       | 86400 (秒)                                       |
| Effective | After restarting system                                         |

- data_region_ratis_periodic_snapshot_interval  

| Name         | data_region_ratis_preserve_logs_num_when_purge |
| ------------ | ---------------------------------------------- |
| Description         | The interval time for regular snapshots for data region.   |
| Type         | int64                                          |
| Default       | 86400 (秒)                                     |
| Effective | After restarting 
system                                       |

### 3.31  IoTConsensusV2 Configuration

- iot_consensus_v2_pipeline_size

| Name         | iot_consensus_v2_pipeline_size                               |
| ------------ | ------------------------------------------------------------ |
| Description         | The default event buffer size for connectors and receivers in IoTConsensus V2. |
| Type         | int                                                          |
| Default       | 5                                                            |
| Effective | After restarting system                                                     |

- iot_consensus_v2_mode

| Name         | iot_consensus_v2_pipeline_size      |
| ------------ | ----------------------------------- |
| Description         | The consensus protocol mode used by IoTConsensus V2. |
| Type         | String                              |
| Default       | batch                               |
| Effective | After restarting system                            |

### 3.32 Procedure Configuration

- procedure_core_worker_thread_count

| Name         | procedure_core_worker_thread_count |
| ------------ | ---------------------------------- |
| Description         | The number of working threads.                       |
| Type         | int32                              |
| Default       | 4                                  |
| Effective | After restarting system                           |

- procedure_completed_clean_interval

| Name         | procedure_completed_clean_interval |
| ------------ | ---------------------------------- |
| Description         | The time interval for cleaning up completed procedures.   |
| Type         | int32                              |
| Default       | 30(s)                              |
| Effective | After restarting system                           |

- procedure_completed_evict_ttl

| Name         | procedure_completed_evict_ttl     |
| ------------ | --------------------------------- |
| Description         | The data retention time for completed procedures. |
| Type         | int32                             |
| Default       | 60(s)                             |
| Effective | After restarting system                          |

### 3.33 MQTT Broker Configuration

- enable_mqtt_service

| Name         | enable_mqtt_service。 |
| ------------ | --------------------- |
| Description         | Whether to enable the MQTT service.      |
| Type         | Boolean               |
| Default       | false                 |
| Effective | hot-load                |

- mqtt_host

| Name         | mqtt_host            |
| ------------ | -------------------- |
| Description         | The host to which the MQTT service is bound. |
| Type         | String               |
| Default       | 127.0.0.1            |
| Effective | hot-load               |

- mqtt_port

| Name         | mqtt_port            |
| ------------ | -------------------- |
| Description         | The port to which the MQTT service is bound. |
| Type         | int32                |
| Default       | 1883                 |
| Effective | hot-load               |

- mqtt_handler_pool_size

| Name         | mqtt_handler_pool_size             |
| ------------ | ---------------------------------- |
| Description         | The size of the handler pool for processing MQTT messages. |
| Type         | int32                              |
| Default       | 1                                  |
| Effective | hot-load                             |

- mqtt_payload_formatter

| Name         | mqtt_payload_formatter       |
| ------------ | ---------------------------- |
| Description         | The formatter for MQTT message payloads. |
| Type         | String                       |
| Default       | json                         |
| Effective | hot-load                       |

- mqtt_max_message_size

| Name         | mqtt_max_message_size                |
| ------------ | ------------------------------------ |
| Description         | The maximum length of MQTT messages (in bytes).|
| Type         | int32                                |
| Default       | 1048576                              |
| Effective | hot-load                               |

### 3.34 Audit log Configuration

- enable_audit_log

| Name         | enable_audit_log               |
| ------------ | ------------------------------ |
| Description         | Used to control whether the audit log feature is enabled. |
| Type         | Boolean                        |
| Default       | false                          |
| Effective | After restarting system                       |

- audit_log_storage

| Name         | audit_log_storage          |
| ------------ | -------------------------- |
| Description         | Defines the output location for audit logs. |
| Type         | String                     |
| Default       | IOTDB,LOGGER               |
| Effective | After restarting system                   |

- audit_log_operation

| Name         | audit_log_operation                    |
| ------------ | -------------------------------------- |
| Description         | Defines which types of operations need to be recorded in the audit log. |
| Type         | String                                 |
| Default       | DML,DDL,QUERY                          |
| Effective | After restarting system                               |

- enable_audit_log_for_native_insert_api

| Name         | enable_audit_log_for_native_insert_api |
| ------------ | -------------------------------------- |
| Description         | Used to control whether local write APIs record audit logs.  |
| Type         | Boolean                                |
| Default       | true                                   |
| Effective | After restarting system                               |

### 3.35 White List Configuration
- enable_white_list

| Name         | enable_white_list |
| ------------ | ----------------- |
| Description         | Whether to enable the whitelist.  |
| Type         | Boolean           |
| Default       | false             |
| Effective | hot-load            |

### 3.36 IoTDB-AI Configuration

- model_inference_execution_thread_count

| Name         | model_inference_execution_thread_count |
| ------------ | -------------------------------------- |
| Description         | The number of threads used for model inference operations.             |
| Type         | int                                    |
| Default       | 5                                      |
| Effective | After restarting system                               |

### 3.37 Load TsFile Configuration

- load_clean_up_task_execution_delay_time_seconds

| Name         | load_clean_up_task_execution_delay_time_seconds              |
| ------------ | ------------------------------------------------------------ |
| Description         | The time the system will wait after a failed TsFile load before executing cleanup tasks to remove these unsuccessfully loaded TsFiles. |
| Type         | int                                                          |
| Default       | 1800                                                         |
| Effective | hot-load                                                       |

- load_write_throughput_bytes_per_second

| Name         | load_write_throughput_bytes_per_second |
| ------------ | -------------------------------------- |
| Description         | The maximum number of bytes per second for disk writes when loading TsFiles. |
| Type         | int                                    |
| Default       | -1                                     |
| Effective | hot-load                                 |

- load_active_listening_enable

| Name         | load_active_listening_enable                                 |
| ------------ | ------------------------------------------------------------ |
| Description         | Whether to enable the DataNode's active listening and loading of tsfile functionality (default is enabled). |
| Type         | Boolean                                                      |
| Default       | true                                                         |
| Effective | hot-load                                                       |

- load_active_listening_dirs

| Name         | load_active_listening_dirs                                   |
| ------------ | ------------------------------------------------------------ |
| Description         | The directories to be monitored (automatically including subdirectories), separated by “,“ if multiple; the default directory is ext/load/pending (supports hot loading). |
| Type         | String                                                       |
| Default       | ext/load/pending                                             |
| Effective | hot-load                                                       |

- load_active_listening_fail_dir

| Name         | load_active_listening_fail_dir                             |
| ------------ | ---------------------------------------------------------- |
| Description         | The directory where files are transferred after a failed tsfile loading task, only one can be configured. |
| Type         | String                                                     |
| Default       | ext/load/failed                                            |
| Effective | hot-load                                                     |

- load_active_listening_max_thread_num

| Name         | load_active_listening_max_thread_num                         |
| ------------ | ------------------------------------------------------------ |
| Description         | The maximum number of threads to execute tsfile loading tasks simultaneously; the default is max(1, CPU core count / 2) when commented out; if the user's setting is not within the range [1, CPU core count / 2], it will be set to the default (1, CPU core count / 2). |
| Type         | Long                                                         |
| Default       | 0                                                            |
| Effective | After restarting system                                                     |

- load_active_listening_check_interval_seconds

| Name         | load_active_listening_check_interval_seconds                 |
| ------------ | ------------------------------------------------------------ |
| Description         | 主动监听轮询间隔，Unit秒。主动监听 tsfile 的功能是通过轮询检查文件夹实现的。该配置指定了两次检查 load_active_listening_dirs 的时间间隔，每次检查完成 load_active_listening_check_interval_seconds 秒后，会执行下一次检查。当用户设置的轮询间隔小于 1 时，会被设置为Default 5 秒。 |
| Type         | Long                                                         |
| Default       | 5                                                            |
| Effective | After restarting system                                                     |

### 3.38 Dispatch Retry Configuration

- enable_retry_for_unknown_error

| Name         | enable_retry_for_unknown_error                               |
| ------------ | ------------------------------------------------------------ |
| Description         | The maximum retry time for remote distribution of write requests in case of unknown errors, with the unit being milliseconds (ms). |
| Type         | Long                                                         |
| Default       | 60000                                                        |
| Effective | hot-load                                                       |

- enable_retry_for_unknown_error

| Name         | enable_retry_for_unknown_error   |
| ------------ | -------------------------------- |
| Description         | Used to control whether to retry in the event of unknown errors. |
| Type         | boolean                          |
| Default       | false                            |
| Effective | hot-load                           |