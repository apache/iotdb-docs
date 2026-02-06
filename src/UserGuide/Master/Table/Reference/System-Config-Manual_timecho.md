
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
# Config Manual

## 1. IoTDB Configuration Files

The configuration files for IoTDB are located in the `conf` folder under the IoTDB installation directory. Key configuration files include:

1. `confignode-env.sh` **/** `confignode-env.bat`:
    1. Environment configuration file for ConfigNode.
    2. Used to configure memory size and other environment settings for ConfigNode.
2. `datanode-env.sh` **/** `datanode-env.bat`:
    1. Environment configuration file for DataNode.
    2. Used to configure memory size and other environment settings for DataNode.
3. `iotdb-system.properties`:
    1. Main configuration file for IoTDB.
    2. Contains configurable parameters for IoTDB.
4. `iotdb-system.properties.template`:
    1. Template for the `iotdb-system.properties` file.
    2. Provides a reference for all available configuration parameters.

## 2. Modify Configurations

### 2.1 **Modify Existing Parameters**:

- Parameters already present in the `iotdb-system.properties` file can be directly modified.

### 2.2 **Adding New Parameters**:

- For parameters not listed in `iotdb-system.properties`, you can find them in the `iotdb-system.properties.template` file.
- Copy the desired parameter from the template file to `iotdb-system.properties` and modify its value.

### 2.3 Configuration Update Methods

Different configuration parameters have different update methods, categorized as follows:

1. **Modify before the first startup.**:
    1. These parameters can only be modified before the first startup of ConfigNode/DataNode.
    2. Modifying them after the first startup will prevent ConfigNode/DataNode from starting.
2. **Restart Required for Changes to Take Effect**:
    1. These parameters can be modified after ConfigNode/DataNode has started.
    2. However, a restart of ConfigNode/DataNode is required for the changes to take effect.
3. **Hot Reload**:
    1. These parameters can be modified while ConfigNode/DataNode is running.
    2. After modification, use the following SQL commands to apply the changes:
        - `load configuration`: Reloads the configuration.
        - `set configuration key1 = 'value1'`: Updates specific configuration parameters.

## 3. Environment Parameters

The environment configuration files (`confignode-env.sh/bat` and `datanode-env.sh/bat`) are used to configure Java environment parameters for ConfigNode and DataNode, such as JVM settings. These configurations are passed to the JVM when ConfigNode or DataNode starts.

### 3.1 **confignode-env.sh/bat**

- MEMORY_SIZE

| Name        | MEMORY_SIZE                                                  |
| ----------- | ------------------------------------------------------------ |
| Description | Memory size allocated when IoTDB ConfigNode starts.          |
| Type        | String                                                       |
| Default     | Depends on the operating system and machine configuration. Defaults to 3/10 of the machine's memory, capped at 16G. |
| Effective   | Restart required                                             |

- ON_HEAP_MEMORY

| Name        | ON_HEAP_MEMORY                                               |
| ----------- | ------------------------------------------------------------ |
| Description | On-heap memory size available for IoTDB ConfigNode. Previously named `MAX_HEAP_SIZE`. |
| Type        | String                                                       |
| Default     | Depends on the `MEMORY_SIZE` configuration.                  |
| Effective   | Restart required                                             |

- OFF_HEAP_MEMORY

| Name        | OFF_HEAP_MEMORY                                              |
| ----------- | ------------------------------------------------------------ |
| Description | Off-heap memory size available for IoTDB ConfigNode. Previously named `MAX_DIRECT_MEMORY_SIZE`. |
| Type        | String                                                       |
| Default     | Depends on the `MEMORY_SIZE` configuration.                  |
| Effective   | Restart required                                             |

### 3.2 **datanode-env.sh/bat**

- MEMORY_SIZE

| Name        | MEMORY_SIZE                                                  |
| ----------- | ------------------------------------------------------------ |
| Description | Memory size allocated when IoTDB DataNode starts.            |
| Type        | String                                                       |
| Default     | Depends on the operating system and machine configuration. Defaults to 1/2 of the machine's memory. |
| Effective   | Restart required                                             |

- ON_HEAP_MEMORY

| Name        | ON_HEAP_MEMORY                                               |
| ----------- | ------------------------------------------------------------ |
| Description | On-heap memory size available for IoTDB DataNode. Previously named `MAX_HEAP_SIZE`. |
| Type        | String                                                       |
| Default     | Depends on the `MEMORY_SIZE` configuration.                  |
| Effective   | Restart required                                             |

- OFF_HEAP_MEMORY

| Name        | OFF_HEAP_MEMORY                                              |
| ----------- | ------------------------------------------------------------ |
| Description | Off-heap memory size available for IoTDB DataNode. Previously named `MAX_DIRECT_MEMORY_SIZE`. |
| Type        | String                                                       |
| Default     | Depends on the `MEMORY_SIZE` configuration.                  |
| Effective   | Restart required                                             |

## 4. System Parameters (`iotdb-system.properties.template`）

The `iotdb-system.properties` file contains various configurations for managing IoTDB clusters, nodes, replication, directories, monitoring, SSL, connections, object storage, tier management, and REST services. Below is a detailed breakdown of the parameters:

### 4.1 Cluster Configuration

- cluster_name

| Name        | cluster_name                                              |
| ----------- | --------------------------------------------------------- |
| Description | Name of the cluster.                                      |
| Type        | String                                                    |
| Default     | default_cluster                                           |
| Effective   | Use CLI: `set configuration cluster_name='xxx'`.           |
| Note        | Changes are distributed across nodes. Changes may not propagate to all nodes in case of network issues or node failures. Nodes that fail to update must manually modify `cluster_name` in their configuration files and restart. Under normal circumstances, it is not recommended to modify `cluster_name` by manually modifying configuration files or to perform hot-loading via `load configuration` method. |

### 4.2 Seed ConfigNode

- cn_seed_config_node

| Name        | cn_seed_config_node                                          |
| ----------- | ------------------------------------------------------------ |
| Description | Address of the seed ConfigNode for Confignode to join the cluster. |
| Type        | String                                                       |
| Default     | 127.0.0.1:10710                                              |
| Effective   | Modify before the first startup.                             |

- dn_seed_config_node

| Name        | dn_seed_config_node                                          |
| ----------- | ------------------------------------------------------------ |
| Description | Address of the seed ConfigNode for Datanode to join the cluster. |
| Type        | String                                                       |
| Default     | 127.0.0.1:10710                                              |
| Effective   | Modify before the first startup.                             |

### 4.3 Node RPC Configuration

- cn_internal_address

| Name        | cn_internal_address                            |
| ----------- | ---------------------------------------------- |
| Description | Internal address for ConfigNode communication. |
| Type        | String                                         |
| Default     | 127.0.0.1                                      |
| Effective   | Modify before the first startup.               |

- cn_internal_port

| Name        | cn_internal_port                            |
| ----------- | ------------------------------------------- |
| Description | Port for ConfigNode internal communication. |
| Type        | Short Int : [0,65535]                       |
| Default     | 10710                                       |
| Effective   | Modify before the first startup.            |

- cn_consensus_port

| Name        | cn_consensus_port                                     |
| ----------- | ----------------------------------------------------- |
| Description | Port for ConfigNode consensus protocol communication. |
| Type        | Short Int : [0,65535]                                 |
| Default     | 10720                                                 |
| Effective   | Modify before the first startup.                      |

- dn_rpc_address

| Name        | dn_rpc_address                  |
| ----------- |---------------------------------|
| Description | Address for client RPC service. |
| Type        | String                          |
| Default     | 127.0.0.1                       |
| Effective   | Restart required.               |

- dn_rpc_port

| Name        | dn_rpc_port                  |
| ----------- | ---------------------------- |
| Description | Port for client RPC service. |
| Type        | Short Int : [0,65535]        |
| Default     | 6667                         |
| Effective   | Restart required.            |

- dn_internal_address

| Name        | dn_internal_address                          |
| ----------- | -------------------------------------------- |
| Description | Internal address for DataNode communication. |
| Type        | string                                       |
| Default     | 127.0.0.1                                    |
| Effective   | Modify before the first startup.             |

- dn_internal_port

| Name        | dn_internal_port                          |
| ----------- | ----------------------------------------- |
| Description | Port for DataNode internal communication. |
| Type        | int                                       |
| Default     | 10730                                     |
| Effective   | Modify before the first startup.          |

- dn_mpp_data_exchange_port

| Name        | dn_mpp_data_exchange_port        |
| ----------- | -------------------------------- |
| Description | Port for MPP data exchange.      |
| Type        | int                              |
| Default     | 10740                            |
| Effective   | Modify before the first startup. |

- dn_schema_region_consensus_port

| Name        | dn_schema_region_consensus_port                              |
| ----------- | ------------------------------------------------------------ |
| Description | Port for Datanode SchemaRegion consensus protocol communication. |
| Type        | int                                                          |
| Default     | 10750                                                        |
| Effective   | Modify before the first startup.                             |

- dn_data_region_consensus_port

| Name        | dn_data_region_consensus_port                                |
| ----------- | ------------------------------------------------------------ |
| Description | Port for Datanode DataRegion consensus protocol communication. |
| Type        | int                                                          |
| Default     | 10760                                                        |
| Effective   | Modify before the first startup.                             |

- dn_join_cluster_retry_interval_ms

| Name        | dn_join_cluster_retry_interval_ms                   |
| ----------- | --------------------------------------------------- |
| Description | Interval for DataNode to retry joining the cluster. |
| Type        | long                                                |
| Default     | 5000                                                |
| Effective   | Restart required.                                   |

### 4.4 Replication configuration

- config_node_consensus_protocol_class

| Name        | config_node_consensus_protocol_class                         |
| ----------- | ------------------------------------------------------------ |
| Description | Consensus protocol for ConfigNode replication, only supports RatisConsensus |
| Type        | String                                                       |
| Default     | org.apache.iotdb.consensus.ratis.RatisConsensus              |
| Effective   | Modify before the first startup.                             |

- schema_replication_factor

| Name        | schema_replication_factor                                    |
| ----------- | ------------------------------------------------------------ |
| Description | Default schema replication factor for databases.             |
| Type        | int32                                                        |
| Default     | 1                                                            |
| Effective   | Restart required. Takes effect on the new database after restarting. |

- schema_region_consensus_protocol_class

| Name        | schema_region_consensus_protocol_class                       |
| ----------- | ------------------------------------------------------------ |
| Description | Consensus protocol for schema region replication. Only supports RatisConsensus when multi-replications. |
| Type        | String                                                       |
| Default     | org.apache.iotdb.consensus.ratis.RatisConsensus              |
| Effective   | Modify before the first startup.                             |

- data_replication_factor

| Name        | data_replication_factor                                      |
| ----------- | ------------------------------------------------------------ |
| Description | Default data replication factor for databases.               |
| Type        | int32                                                        |
| Default     | 1                                                            |
| Effective   | Restart required. Takes effect on the new database after restarting. |

- data_region_consensus_protocol_class

| Name        | data_region_consensus_protocol_class                         |
| ----------- | ------------------------------------------------------------ |
| Description | Consensus protocol for data region replication. Supports IoTConsensus or RatisConsensus when multi-replications. |
| Type        | String                                                       |
| Default     | org.apache.iotdb.consensus.iot.IoTConsensus                  |
| Effective   | Modify before the first startup.                             |

### 4.5 Directory configuration

- cn_system_dir

| Name        | cn_system_dir                                               |
| ----------- | ----------------------------------------------------------- |
| Description | System data storage path for ConfigNode.                    |
| Type        | String                                                      |
| Default     | data/confignode/system（Windows：data\\configndoe\\system） |
| Effective   | Restart required                                            |

- cn_consensus_dir

| Name        | cn_consensus_dir                                             |
| ----------- | ------------------------------------------------------------ |
| Description | Consensus protocol data storage path for ConfigNode.         |
| Type        | String                                                       |
| Default     | data/confignode/consensus（Windows：data\\configndoe\\consensus） |
| Effective   | Restart required                                             |

- cn_pipe_receiver_file_dir

| Name        | cn_pipe_receiver_file_dir                                    |
| ----------- | ------------------------------------------------------------ |
| Description | Directory for pipe receiver files in ConfigNode.             |
| Type        | String                                                       |
| Default     | data/confignode/system/pipe/receiver（Windows：data\\confignode\\system\\pipe\\receiver） |
| Effective   | Restart required                                             |

- dn_system_dir

| Name        | dn_system_dir                                                |
| ----------- | ------------------------------------------------------------ |
| Description | Schema storage path for DataNode.  By default, it is stored in the data directory at the same level as the sbin directory. The starting directory of the relative path is related to the operating system. It is recommended to use an absolute path. |
| Type        | String                                                       |
| Default     | data/datanode/system（Windows：data\\datanode\\system）      |
| Effective   | Restart required                                             |

- dn_data_dirs

| Name        | dn_data_dirs                                                 |
| ----------- | ------------------------------------------------------------ |
| Description | Data storage path for DataNode. By default, it is stored in the data directory at the same level as the sbin directory. The starting directory of the relative path is related to the operating system. It is recommended to use an absolute path. |
| Type        | String                                                       |
| Default     | data/datanode/data（Windows：data\\datanode\\data）          |
| Effective   | Restart required                                             |

- dn_multi_dir_strategy

| Name        | dn_multi_dir_strategy                                        |
| ----------- | ------------------------------------------------------------ |
| Description | The strategy used by IoTDB to select directories in `data_dirs` for TsFiles. You can use either the simple class name or the fully qualified class name. The system provides the following two strategies: 1. SequenceStrategy: IoTDB selects directories sequentially, iterating through all directories in `data_dirs` in a round-robin manner. 2. MaxDiskUsableSpaceFirstStrategy IoTDB prioritizes the directory in `data_dirs` with the largest disk free space.  To implement a custom strategy: 1. Inherit the `org.apache.iotdb.db.storageengine.rescon.disk.strategy.DirectoryStrategy `class and implement your own strategy method. 2. Fill in the configuration item with the fully qualified class name of your implementation (package name + class name, e.g., `UserDefineStrategyPackage`). 3. Add the JAR file containing your custom class to the project. |
| Type        | String                                                       |
| Default     | SequenceStrategy                                             |
| Effective   | Hot reload.                                                  |

- dn_consensus_dir

| Name        | dn_consensus_dir                                             |
| ----------- | ------------------------------------------------------------ |
| Description | Consensus log storage path for DataNode. By default, it is stored in the data directory at the same level as the sbin directory. The starting directory of the relative path is related to the operating system. It is recommended to use an absolute path. |
| Type        | String                                                       |
| Default     | data/datanode/consensus（Windows：data\\datanode\\consensus） |
| Effective   | Restart required                                             |

- dn_wal_dirs

| Name        | dn_wal_dirs                                                  |
| ----------- | ------------------------------------------------------------ |
| Description | Write-ahead log (WAL) storage path for DataNode. By default, it is stored in the data directory at the same level as the sbin directory. The starting directory of the relative path is related to the operating system. It is recommended to use an absolute path. |
| Type        | String                                                       |
| Default     | data/datanode/wal（Windows：data\\datanode\\wal）            |
| Effective   | Restart required                                             |

- dn_tracing_dir

| Name        | dn_tracing_dir                                               |
| ----------- | ------------------------------------------------------------ |
| Description | Tracing root directory for DataNode. By default, it is stored in the data directory at the same level as the sbin directory. The starting directory of the relative path is related to the operating system. It is recommended to use an absolute path. |
| Type        | String                                                       |
| Default     | datanode/tracing（Windows：datanode\\tracing）               |
| Effective   | Restart required                                             |

- dn_sync_dir

| Name        | dn_sync_dir                                                  |
| ----------- | ------------------------------------------------------------ |
| Description | Sync storage path for DataNode.By default, it is stored in the data directory at the same level as the sbin directory. The starting directory of the relative path is related to the operating system. It is recommended to use an absolute path. |
| Type        | String                                                       |
| Default     | data/datanode/sync（Windows：data\\datanode\\sync）          |
| Effective   | Restart required                                             |

- sort_tmp_dir

| Name        | sort_tmp_dir                                      |
| ----------- | ------------------------------------------------- |
| Description | Temporary directory for sorting operations.       |
| Type        | String                                            |
| Default     | data/datanode/tmp（Windows：data\\datanode\\tmp） |
| Effective   | Restart required                                  |

- dn_pipe_receiver_file_dirs

| Name        | dn_pipe_receiver_file_dirs                                   |
| ----------- | ------------------------------------------------------------ |
| Description | Directory for pipe receiver files in DataNode.               |
| Type        | String                                                       |
| Default     | data/datanode/system/pipe/receiver（Windows：data\\datanode\\system\\pipe\\receiver） |
| Effective   | Restart required                                             |

- iot_consensus_v2_receiver_file_dirs

| Name        | iot_consensus_v2_receiver_file_dirs                          |
| ----------- | ------------------------------------------------------------ |
| Description | Directory for IoTConsensus V2 receiver files.                |
| Type        | String                                                       |
| Default     | data/datanode/system/pipe/consensus/receiver（Windows：data\\datanode\\system\\pipe\\consensus\\receiver） |
| Effective   | Restart required                                             |

- iot_consensus_v2_deletion_file_dir

| Name        | iot_consensus_v2_deletion_file_dir                           |
| ----------- | ------------------------------------------------------------ |
| Description | Directory for IoTConsensus V2 deletion files.                |
| Type        | String                                                       |
| Default     | data/datanode/system/pipe/consensus/deletion（Windows：data\\datanode\\system\\pipe\\consensus\\deletion） |
| Effective   | Restart required                                             |

### 4.6 Metric Configuration

- cn_metric_reporter_list

| Name        | cn_metric_reporter_list                   |
| ----------- | ----------------------------------------- |
| Description | Systems for reporting ConfigNode metrics. |
| Type        | String                                    |
| Default     | None                                      |
| Effective   | Restart required.                         |

- cn_metric_level

| Name        | cn_metric_level                         |
| ----------- | --------------------------------------- |
| Description | Level of detail for ConfigNode metrics. |
| Type        | String                                  |
| Default     | IMPORTANT                               |
| Effective   | Restart required.                       |

- cn_metric_async_collect_period

| Name        | cn_metric_async_collect_period                               |
| ----------- | ------------------------------------------------------------ |
| Description | Period for asynchronous metric collection in ConfigNode (in seconds). |
| Type        | int                                                          |
| Default     | 5                                                            |
| Effective   | Restart required.                                            |

- cn_metric_prometheus_reporter_port

| Name        | cn_metric_prometheus_reporter_port                  |
| ----------- | --------------------------------------------------- |
| Description | Port for Prometheus metric reporting in ConfigNode. |
| Type        | int                                                 |
| Default     | 9091                                                |
| Effective   | Restart required.                                   |

- dn_metric_reporter_list

| Name        | dn_metric_reporter_list                 |
| ----------- | --------------------------------------- |
| Description | Systems for reporting DataNode metrics. |
| Type        | String                                  |
| Default     | None                                    |
| Effective   | Restart required.                       |

- dn_metric_level

| Name        | dn_metric_level                       |
| ----------- | ------------------------------------- |
| Description | Level of detail for DataNode metrics. |
| Type        | String                                |
| Default     | IMPORTANT                             |
| Effective   | Restart required.                     |

- dn_metric_async_collect_period

| Name        | dn_metric_async_collect_period                               |
| ----------- | ------------------------------------------------------------ |
| Description | Period for asynchronous metric collection in DataNode (in seconds). |
| Type        | int                                                          |
| Default     | 5                                                            |
| Effective   | Restart required.                                            |

- dn_metric_prometheus_reporter_port

| Name        | dn_metric_prometheus_reporter_port                |
| ----------- | ------------------------------------------------- |
| Description | Port for Prometheus metric reporting in DataNode. |
| Type        | int                                               |
| Default     | 9092                                              |
| Effective   | Restart required.                                 |

- dn_metric_internal_reporter_type

| Name        | dn_metric_internal_reporter_type                             |
| ----------- | ------------------------------------------------------------ |
| Description | Internal reporter types for DataNode metrics. For internal monitoring and checking that the data has been successfully written and refreshed. |
| Type        | String                                                       |
| Default     | IOTDB                                                        |
| Effective   | Restart required.                                            |

### 4.7 SSL Configuration

- enable_thrift_ssl

| Name        | enable_thrift_ssl                             |
| ----------- | --------------------------------------------- |
| Description | Enables SSL encryption for RPC communication. |
| Type        | Boolean                                       |
| Default     | false                                         |
| Effective   | Restart required.                             |

- enable_https

| Name        | enable_https                   |
| ----------- | ------------------------------ |
| Description | Enables SSL for REST services. |
| Type        | Boolean                        |
| Default     | false                          |
| Effective   | Restart required.              |

- key_store_path

| Name        | key_store_path               |
| ----------- | ---------------------------- |
| Description | Path to the SSL certificate. |
| Type        | String                       |
| Default     | None                         |
| Effective   | Restart required.            |

- key_store_pwd

| Name        | key_store_pwd                     |
| ----------- | --------------------------------- |
| Description | Password for the SSL certificate. |
| Type        | String                            |
| Default     | None                              |
| Effective   | Restart required.                 |

### 4.8 Connection Configuration

- cn_rpc_thrift_compression_enable

| Name        | cn_rpc_thrift_compression_enable    |
| ----------- | ----------------------------------- |
| Description | Enables Thrift compression for RPC. |
| Type        | Boolean                             |
| Default     | false                               |
| Effective   | Restart required.                   |

- cn_rpc_max_concurrent_client_num

| Name        | cn_rpc_max_concurrent_client_num          |
| ----------- |-------------------------------------------|
| Description | Maximum number of concurrent RPC clients. |
| Type        | int                                       |
| Default     | 3000                                      |
| Effective   | Restart required.                         |

- cn_connection_timeout_ms

| Name        | cn_connection_timeout_ms                             |
| ----------- | ---------------------------------------------------- |
| Description | Connection timeout for ConfigNode (in milliseconds). |
| Type        | int                                                  |
| Default     | 60000                                                |
| Effective   | Restart required.                                    |

- cn_selector_thread_nums_of_client_manager

| Name        | cn_selector_thread_nums_of_client_manager                    |
| ----------- | ------------------------------------------------------------ |
| Description | Number of selector threads for client management in ConfigNode. |
| Type        | int                                                          |
| Default     | 1                                                            |
| Effective   | Restart required.                                            |

- cn_max_client_count_for_each_node_in_client_manager

| Name        | cn_max_client_count_for_each_node_in_client_manager    |
| ----------- | ------------------------------------------------------ |
| Description | Maximum clients per node in ConfigNode client manager. |
| Type        | int                                                    |
| Default     | 300                                                    |
| Effective   | Restart required.                                      |

- dn_session_timeout_threshold

| Name        | dn_session_timeout_threshold             |
| ----------- | ---------------------------------------- |
| Description | Maximum idle time for DataNode sessions. |
| Type        | int                                      |
| Default     | 0                                        |
| Effective   | Restart required.t required.             |

- dn_rpc_thrift_compression_enable

| Name        | dn_rpc_thrift_compression_enable             |
| ----------- | -------------------------------------------- |
| Description | Enables Thrift compression for DataNode RPC. |
| Type        | Boolean                                      |
| Default     | false                                        |
| Effective   | Restart required.                            |

- dn_rpc_advanced_compression_enable

| Name        | dn_rpc_advanced_compression_enable                    |
| ----------- | ----------------------------------------------------- |
| Description | Enables advanced Thrift compression for DataNode RPC. |
| Type        | Boolean                                               |
| Default     | false                                                 |
| Effective   | Restart required.                                     |

- dn_rpc_selector_thread_count

| Name        | rpc_selector_thread_count                    |
| ----------- | -------------------------------------------- |
| Description | Number of selector threads for DataNode RPC. |
| Type        | int                                          |
| Default     | 1                                            |
| Effective   | Restart required.t required.                 |

- dn_rpc_min_concurrent_client_num

| Name        | rpc_min_concurrent_client_num                          |
| ----------- | ------------------------------------------------------ |
| Description | Minimum number of concurrent RPC clients for DataNode. |
| Type        | Short Int : [0,65535]                                  |
| Default     | 1                                                      |
| Effective   | Restart required.                                      |

- dn_rpc_max_concurrent_client_num

| Name        | dn_rpc_max_concurrent_client_num                       |
| ----------- |--------------------------------------------------------|
| Description | Maximum number of concurrent RPC clients for DataNode. |
| Type        | Short Int : [0,65535]                                  |
| Default     | 1000                                                   |
| Effective   | Restart required.                                      |

- dn_thrift_max_frame_size

| Name        | dn_thrift_max_frame_size                       |
| ----------- |------------------------------------------------|
| Description | Maximum frame size for RPC requests/responses. |
| Type        | long                                           |
| Default     | 536870912 （Default 512MB)                      |
| Effective   | Restart required.                              |

- dn_thrift_init_buffer_size

| Name        | dn_thrift_init_buffer_size          |
| ----------- | ----------------------------------- |
| Description | Initial buffer size for Thrift RPC. |
| Type        | long                                |
| Default     | 1024                                |
| Effective   | Restart required.                   |

- dn_connection_timeout_ms

| Name        | dn_connection_timeout_ms                           |
| ----------- | -------------------------------------------------- |
| Description | Connection timeout for DataNode (in milliseconds). |
| Type        | int                                                |
| Default     | 60000                                              |
| Effective   | Restart required.                                  |

- dn_selector_thread_count_of_client_manager

| Name        | dn_selector_thread_count_of_client_manager                   |
| ----------- | ------------------------------------------------------------ |
| Description | selector thread (TAsyncClientManager) nums for async thread in a clientManager |
| Type        | int                                                          |
| Default     | 1                                                            |
| Effective   | Restart required.t required.                                 |

- dn_max_client_count_for_each_node_in_client_manager

| Name        | dn_max_client_count_for_each_node_in_client_manager |
| ----------- | --------------------------------------------------- |
| Description | Maximum clients per node in DataNode clientmanager. |
| Type        | int                                                 |
| Default     | 300                                                 |
| Effective   | Restart required.                                   |

### 4.9 Object storage management

- remote_tsfile_cache_dirs

| Name        | remote_tsfile_cache_dirs                 |
| ----------- | ---------------------------------------- |
| Description | Local cache directory for cloud storage. |
| Type        | String                                   |
| Default     | data/datanode/data/cache                 |
| Effective   | Restart required.                        |

- remote_tsfile_cache_page_size_in_kb

| Name        | remote_tsfile_cache_page_size_in_kb           |
| ----------- | --------------------------------------------- |
| Description | Block size for cached files in cloud storage. |
| Type        | int                                           |
| Default     | 20480                                         |
| Effective   | Restart required.                             |

- remote_tsfile_cache_max_disk_usage_in_mb

| Name        | remote_tsfile_cache_max_disk_usage_in_mb    |
| ----------- | ------------------------------------------- |
| Description | Maximum disk usage for cloud storage cache. |
| Type        | long                                        |
| Default     | 51200                                       |
| Effective   | Restart required.                           |

- object_storage_type

| Name        | object_storage_type    |
| ----------- | ---------------------- |
| Description | Type of cloud storage. |
| Type        | String                 |
| Default     | AWS_S3                 |
| Effective   | Restart required.      |

- object_storage_endpoint

| Name        | object_storage_endpoint     |
| ----------- | --------------------------- |
| Description | Endpoint for cloud storage. |
| Type        | String                      |
| Default     | None                        |
| Effective   | Restart required.           |

- object_storage_bucket

| Name        | object_storage_bucket          |
| ----------- | ------------------------------ |
| Description | Bucket name for cloud storage. |
| Type        | String                         |
| Default     | iotdb_data                     |
| Effective   | Restart required.              |

- object_storage_access_key

| Name        | object_storage_access_key     |
| ----------- | ----------------------------- |
| Description | Access key for cloud storage. |
| Type        | String                        |
| Default     | None                          |
| Effective   | Restart required.             |

- object_storage_access_secret

| Name        | object_storage_access_secret     |
| ----------- | -------------------------------- |
| Description | Access secret for cloud storage. |
| Type        | String                           |
| Default     | None                             |
| Effective   | Restart required.                |

### 4.10 Tier management

- dn_default_space_usage_thresholds

| Name        | dn_default_space_usage_thresholds                            |
| ----------- | ------------------------------------------------------------ |
| Description | Disk usage threshold, data will be moved to the next tier when the usage of the tier is higher than this threshold.If tiered storage is enabled, please separate thresholds of different tiers by semicolons ";". |
| Type        | double                                                       |
| Default     | 0.85                                                         |
| Effective   | Hot reload.                                                  |

- dn_tier_full_policy

| Name        | dn_tier_full_policy                                          |
| ----------- | ------------------------------------------------------------ |
| Description | How to deal with the last tier's data when its used space has been higher than its dn_default_space_usage_thresholds. |
| Type        | String                                                       |
| Default     | NULL                                                         |
| Effective   | Hot reload.                                                  |

- migrate_thread_count

| Name        | migrate_thread_count                                         |
| ----------- | ------------------------------------------------------------ |
| Description | thread pool size for migrate operation in the DataNode's data directories. |
| Type        | int                                                          |
| Default     | 1                                                            |
| Effective   | Hot reload.                                                  |

- tiered_storage_migrate_speed_limit_bytes_per_sec

| Name        | tiered_storage_migrate_speed_limit_bytes_per_sec             |
| ----------- | ------------------------------------------------------------ |
| Description | The migrate speed limit of different tiers can reach per second |
| Type        | int                                                          |
| Default     | 10485760                                                     |
| Effective   | Hot reload.                                                  |

### 4.11 REST Service Configuration

- enable_rest_service

| Name        | enable_rest_service         |
| ----------- | --------------------------- |
| Description | Is the REST service enabled |
| Type        | Boolean                     |
| Default     | false                       |
| Effective   | Restart required.           |

- rest_service_port

| Name        | rest_service_port                    |
| ----------- | ------------------------------------ |
| Description | the binding port of the REST service |
| Type        | int32                                |
| Default     | 18080                                |
| Effective   | Restart required.                    |

- enable_swagger

| Name        | enable_swagger                                               |
| ----------- | ------------------------------------------------------------ |
| Description | Whether to display rest service interface information through swagger. eg: http://ip:port/swagger.json |
| Type        | Boolean                                                      |
| Default     | false                                                        |
| Effective   | Restart required.                                            |

- rest_query_default_row_size_limit

| Name        | rest_query_default_row_size_limit                            |
| ----------- | ------------------------------------------------------------ |
| Description | the default row limit to a REST query response when the rowSize parameter is not given in request |
| Type        | int32                                                        |
| Default     | 10000                                                        |
| Effective   | Restart required.                                            |

- cache_expire_in_seconds

| Name        | cache_expire_in_seconds                                      |
| ----------- | ------------------------------------------------------------ |
| Description | The expiration time of the user login information cache (in seconds) |
| Type        | int32                                                        |
| Default     | 28800                                                        |
| Effective   | Restart required.                                            |

- cache_max_num

| Name        | cache_max_num                                                |
| ----------- | ------------------------------------------------------------ |
| Description | The maximum number of users can be stored in the user login cache. |
| Type        | int32                                                        |
| Default     | 100                                                          |
| Effective   | Restart required.                                            |

- cache_init_num

| Name        | cache_init_num                                               |
| ----------- | ------------------------------------------------------------ |
| Description | The initial capacity of users can be stored in the user login cache. |
| Type        | int32                                                        |
| Default     | 10                                                           |
| Effective   | Restart required.                                            |

- client_auth

| Name        | client_auth                       |
| ----------- | --------------------------------- |
| Description | Is client authentication required |
| Type        | boolean                           |
| Default     | false                             |
| Effective   | Restart required.                 |

- trust_store_path

| Name        | trust_store_path     |
| ----------- | -------------------- |
| Description | SSL trust store path |
| Type        | String               |
| Default     | ""                   |
| Effective   | Restart required.    |

- trust_store_pwd

| Name        | trust_store_pwd           |
| ----------- | ------------------------- |
| Description | SSL trust store password. |
| Type        | String                    |
| Default     | ""                        |
| Effective   | Restart required.         |

- idle_timeout_in_seconds

| Name        | idle_timeout_in_seconds  |
| ----------- | ------------------------ |
| Description | SSL timeout (in seconds) |
| Type        | int32                    |
| Default     | 5000                     |
| Effective   | Restart required.        |

### 4.12 Load balancing configuration

- series_slot_num

| Name        | series_slot_num                             |
| ----------- | ------------------------------------------- |
| Description | Number of SeriesPartitionSlots per Database |
| Type        | int32                                       |
| Default     | 10000                                       |
| Effective   | Modify before the first startup.            |

- series_partition_executor_class

| Name        | series_partition_executor_class                              |
| ----------- | ------------------------------------------------------------ |
| Description | SeriesPartitionSlot executor class                           |
| Type        | String                                                       |
| Default     | org.apache.iotdb.commons.partition.executor.hash.BKDRHashExecutor |
| Effective   | Modify before the first startup.                             |

- schema_region_group_extension_policy

| Name        | schema_region_group_extension_policy                         |
| ----------- | ------------------------------------------------------------ |
| Description | The policy of extension SchemaRegionGroup for each Database. |
| Type        | string                                                       |
| Default     | AUTO                                                         |
| Effective   | Restart required.                                            |

- default_schema_region_group_num_per_database

| Name        | default_schema_region_group_num_per_database                 |
| ----------- | ------------------------------------------------------------ |
| Description | When set schema_region_group_extension_policy=CUSTOM, this parameter is the default number of SchemaRegionGroups for each Database.When set schema_region_group_extension_policy=AUTO, this parameter is the default minimal number of SchemaRegionGroups for each Database. |
| Type        | int                                                          |
| Default     | 1                                                            |
| Effective   | Restart required.                                            |

- schema_region_per_data_node

| Name        | schema_region_per_data_node                                  |
| ----------- | ------------------------------------------------------------ |
| Description | It only takes effect when set schema_region_group_extension_policy=AUTO.This parameter is the maximum number of SchemaRegions expected to be managed by each DataNode. |
| Type        | double                                                       |
| Default     | 1.0                                                          |
| Effective   | Restart required.                                            |

- data_region_group_extension_policy

| Name        | data_region_group_extension_policy                         |
| ----------- | ---------------------------------------------------------- |
| Description | The policy of extension DataRegionGroup for each Database. |
| Type        | string                                                     |
| Default     | AUTO                                                       |
| Effective   | Restart required.                                          |

- default_data_region_group_num_per_database

| Name        | default_data_region_group_per_database                       |
| ----------- | ------------------------------------------------------------ |
| Description | When set data_region_group_extension_policy=CUSTOM, this parameter is the default number of DataRegionGroups for each Database.When set data_region_group_extension_policy=AUTO, this parameter is the default minimal number of DataRegionGroups for each Database. |
| Type        | int                                                          |
| Default     | 2                                                            |
| Effective   | Restart required.                                            |

- data_region_per_data_node

| Name        | data_region_per_data_node                                    |
| ----------- | ------------------------------------------------------------ |
| Description | It only takes effect when set data_region_group_extension_policy=AUTO.This parameter is the maximum number of DataRegions expected to be managed by each DataNode. |
| Type        | double                                                       |
| Default     | 5.0                                                          |
| Effective   | Restart required.                                            |

- enable_auto_leader_balance_for_ratis_consensus

| Name        | enable_auto_leader_balance_for_ratis_consensus               |
| ----------- | ------------------------------------------------------------ |
| Description | Whether to enable auto leader balance for Ratis consensus protocol. |
| Type        | Boolean                                                      |
| Default     | true                                                         |
| Effective   | Restart required.                                            |

- enable_auto_leader_balance_for_iot_consensus

| Name        | enable_auto_leader_balance_for_iot_consensus                 |
| ----------- | ------------------------------------------------------------ |
| Description | Whether to enable auto leader balance for IoTConsensus protocol. |
| Type        | Boolean                                                      |
| Default     | true                                                         |
| Effective   | Restart required.                                            |

### 4.13 Cluster management

- time_partition_origin

| Name        | time_partition_origin                                        |
| ----------- | ------------------------------------------------------------ |
| Description | Time partition origin in milliseconds, default is equal to zero. |
| Type        | Long                                                         |
| Unit        | ms                                                           |
| Default     | 0                                                            |
| Effective   | Modify before the first startup.                             |

- time_partition_interval

| Name        | time_partition_interval                                      |
| ----------- | ------------------------------------------------------------ |
| Description | Time partition interval in milliseconds, and partitioning data inside each data region, default is equal to one week |
| Type        | Long                                                         |
| Unit        | ms                                                           |
| Default     | 604800000                                                    |
| Effective   | Modify before the first startup.                             |

- heartbeat_interval_in_ms

| Name        | heartbeat_interval_in_ms               |
| ----------- | -------------------------------------- |
| Description | The heartbeat interval in milliseconds |
| Type        | Long                                   |
| Unit        | ms                                     |
| Default     | 1000                                   |
| Effective   | Restart required.                      |

- disk_space_warning_threshold

| Name        | disk_space_warning_threshold                                 |
| ----------- | ------------------------------------------------------------ |
| Description | Disk remaining threshold at which DataNode is set to ReadOnly status |
| Type        | double(percentage)                                           |
| Default     | 0.05                                                         |
| Effective   | Restart required.                                            |

### 4.14 Memory Control Configuration

- datanode_memory_proportion

| Name        | datanode_memory_proportion                                   |
| ----------- | ------------------------------------------------------------ |
| Description | Memory Allocation Ratio: StorageEngine, QueryEngine, SchemaEngine, Consensus, StreamingEngine and Free Memory. |
| Type        | Ratio                                                        |
| Default     | 3:3:1:1:1:1                                                  |
| Effective   | Restart required.                                            |

- schema_memory_proportion

| Name        | schema_memory_proportion                                     |
| ----------- | ------------------------------------------------------------ |
| Description | Schema Memory Allocation Ratio: SchemaRegion, SchemaCache, and PartitionCache. |
| Type        | Ratio                                                        |
| Default     | 5:4:1                                                        |
| Effective   | Restart required.                                            |

- storage_engine_memory_proportion

| Name        | storage_engine_memory_proportion                            |
| ----------- | ----------------------------------------------------------- |
| Description | Memory allocation ratio in StorageEngine: Write, Compaction |
| Type        | Ratio                                                       |
| Default     | 8:2                                                         |
| Effective   | Restart required.                                           |

- write_memory_proportion

| Name        | write_memory_proportion                                      |
| ----------- | ------------------------------------------------------------ |
| Description | Memory allocation ratio in writing: Memtable, TimePartitionInfo |
| Type        | Ratio                                                        |
| Default     | 19:1                                                         |
| Effective   | Restart required.                                            |

- primitive_array_size

| Name        | primitive_array_size                                      |
| ----------- | --------------------------------------------------------- |
| Description | primitive array size (length of each array) in array pool |
| Type        | int32                                                     |
| Default     | 64                                                        |
| Effective   | Restart required.                                         |

- chunk_metadata_size_proportion

| Name        | chunk_metadata_size_proportion                               |
| ----------- | ------------------------------------------------------------ |
| Description | Ratio of compaction memory for chunk metadata maintains in memory when doing compaction |
| Type        | Double                                                       |
| Default     | 0.1                                                          |
| Effective   | Restart required.                                            |

- flush_proportion

| Name        | flush_proportion                                             |
| ----------- | ------------------------------------------------------------ |
| Description | Ratio of memtable memory for invoking flush disk, 0.4 by defaultIf you have extremely high write load (like batch=1000), it can be set lower than the default value like 0.2 |
| Type        | Double                                                       |
| Default     | 0.4                                                          |
| Effective   | Restart required.                                            |

- buffered_arrays_memory_proportion

| Name        | buffered_arrays_memory_proportion                            |
| ----------- | ------------------------------------------------------------ |
| Description | Ratio of memtable memory allocated for buffered arrays, 0.6 by default |
| Type        | Double                                                       |
| Default     | 0.6                                                          |
| Effective   | Restart required.                                            |

- reject_proportion

| Name        | reject_proportion                                            |
| ----------- | ------------------------------------------------------------ |
| Description | Ratio of memtable memory for rejecting insertion, 0.8 by defaultIf you have extremely high write load (like batch=1000) and the physical memory size is large enough, it can be set higher than the default value like 0.9 |
| Type        | Double                                                       |
| Default     | 0.8                                                          |
| Effective   | Restart required.                                            |

- device_path_cache_proportion

| Name        | device_path_cache_proportion                                 |
| ----------- | ------------------------------------------------------------ |
| Description | Ratio of memtable memory for the DevicePathCache. DevicePathCache is the deviceId cache, keeping only one copy of the same deviceId in memory |
| Type        | Double                                                       |
| Default     | 0.05                                                         |
| Effective   | Restart required.                                            |

- write_memory_variation_report_proportion

| Name        | write_memory_variation_report_proportion                     |
| ----------- | ------------------------------------------------------------ |
| Description | If memory cost of data region increased more than proportion of allocated memory for writing, report to system. The default value is 0.001 |
| Type        | Double                                                       |
| Default     | 0.001                                                        |
| Effective   | Restart required.                                            |

- check_period_when_insert_blocked

| Name        | check_period_when_insert_blocked                             |
| ----------- | ------------------------------------------------------------ |
| Description | When an insertion is rejected, the waiting period (in ms) to check system again, 50 by default.If the insertion has been rejected and the read load is low, it can be set larger. |
| Type        | int32                                                        |
| Default     | 50                                                           |
| Effective   | Restart required.                                            |

- io_task_queue_size_for_flushing

| Name        | io_task_queue_size_for_flushing              |
| ----------- | -------------------------------------------- |
| Description | size of ioTaskQueue. The default value is 10 |
| Type        | int32                                        |
| Default     | 10                                           |
| Effective   | Restart required.                            |

- enable_query_memory_estimation

| Name        | enable_query_memory_estimation                               |
| ----------- | ------------------------------------------------------------ |
| Description | If true, we will estimate each query's possible memory footprint before executing it and deny it if its estimated memory exceeds current free memory |
| Type        | bool                                                         |
| Default     | true                                                         |
| Effective   | Hot reload.                                                  |

### 4.15 Schema Engine Configuration

- schema_engine_mode

| Name        | schema_engine_mode                                           |
| ----------- | ------------------------------------------------------------ |
| Description | The schema management mode of schema engine. Currently, support Memory and PBTree.This config of all DataNodes in one cluster must keep same. |
| Type        | string                                                       |
| Default     | Memory                                                       |
| Effective   | Modify before the first startup.                             |

- partition_cache_size

| Name        | partition_cache_size      |
| ----------- | ------------------------- |
| Description | cache size for partition. |
| Type        | Int32                     |
| Default     | 1000                      |
| Effective   | Restart required.         |

- sync_mlog_period_in_ms

| Name        | sync_mlog_period_in_ms                                       |
| ----------- | ------------------------------------------------------------ |
| Description | The cycle when metadata log is periodically forced to be written to disk(in milliseconds)If sync_mlog_period_in_ms=0 it means force metadata log to be written to disk after each refreshmentSetting this parameter to 0 may slow down the operation on slow disk. |
| Type        | Int64                                                        |
| Default     | 100                                                          |
| Effective   | Restart required.                                            |

- tag_attribute_flush_interval

| Name        | tag_attribute_flush_interval                                 |
| ----------- | ------------------------------------------------------------ |
| Description | interval num for tag and attribute records when force flushing to disk |
| Type        | int32                                                        |
| Default     | 1000                                                         |
| Effective   | Modify before the first startup.                             |

- tag_attribute_total_size

| Name        | tag_attribute_total_size                                     |
| ----------- | ------------------------------------------------------------ |
| Description | max size for a storage block for tags and attributes of a one-time series |
| Type        | int32                                                        |
| Default     | 700                                                          |
| Effective   | Modify before the first startup.                             |

- max_measurement_num_of_internal_request

| Name        | max_measurement_num_of_internal_request                      |
| ----------- | ------------------------------------------------------------ |
| Description | max measurement num of internal requestWhen creating timeseries with Session.createMultiTimeseries, the user input plan, the timeseries num ofwhich exceeds this num, will be split to several plans with timeseries no more than this num. |
| Type        | Int32                                                        |
| Default     | 10000                                                        |
| Effective   | Restart required.                                            |

- datanode_schema_cache_eviction_policy

| Name        | datanode_schema_cache_eviction_policy   |
| ----------- | --------------------------------------- |
| Description | Policy of DataNodeSchemaCache eviction. |
| Type        | String                                  |
| Default     | FIFO                                    |
| Effective   | Restart required.                       |

- cluster_timeseries_limit_threshold

| Name        | cluster_timeseries_limit_threshold                           |
| ----------- | ------------------------------------------------------------ |
| Description | This configuration parameter sets the maximum number of time series allowed in the cluster. |
| Type        | Int32                                                        |
| Default     | -1                                                           |
| Effective   | Restart required.                                            |

- cluster_device_limit_threshold

| Name        | cluster_device_limit_threshold                               |
| ----------- | ------------------------------------------------------------ |
| Description | This configuration parameter sets the maximum number of devices allowed in the cluster. |
| Type        | Int32                                                        |
| Default     | -1                                                           |
| Effective   | Restart required.                                            |

- database_limit_threshold

| Name        | database_limit_threshold                                     |
| ----------- | ------------------------------------------------------------ |
| Description | This configuration parameter sets the maximum number of Cluster Databases allowed. |
| Type        | Int32                                                        |
| Default     | -1                                                           |
| Effective   | Restart required.                                            |

### 4.16 Configurations for creating schema automatically

- enable_auto_create_schema

| Name        | enable_auto_create_schema                        |
| ----------- | ------------------------------------------------ |
| Description | Whether creating schema automatically is enabled |
| Value       | true or false                                    |
| Default     | true                                             |
| Effective   | Restart required.                                |

- default_storage_group_level

| Name        | default_storage_group_level                                  |
| ----------- | ------------------------------------------------------------ |
| Description | Database level when creating schema automatically is enabled e.g. root.sg0.d1.s2We will set root.sg0 as the database if database level is 1If the incoming path is shorter than this value, the creation/insertion will fail. |
| Value       | int32                                                        |
| Default     | 1                                                            |
| Effective   | Restart required.                                            |

- boolean_string_infer_type

| Name        | boolean_string_infer_type                                                          |
| ----------- |------------------------------------------------------------------------------------|
| Description | register time series as which type when receiving boolean string "true" or "false" |
| Value       | BOOLEAN or TEXT                                                                    |
| Default     | BOOLEAN                                                                            |
| Effective   | Hot_reload                                                                         |

- integer_string_infer_type

| Name        | integer_string_infer_type                                                                                        |
| ----------- |------------------------------------------------------------------------------------------------------------------|
| Description | register time series as which type when receiving an integer string and using float or double may lose precision |
| Value       | INT32, INT64, FLOAT, DOUBLE, TEXT                                                                                |
| Default     | DOUBLE                                                                                                           |
| Effective   | Hot_reload                                                                                                       |

- floating_string_infer_type

| Name        | floating_string_infer_type                                                       |
| ----------- |----------------------------------------------------------------------------------|
| Description | register time series as which type when receiving a floating number string "6.7" |
| Value       | DOUBLE, FLOAT or TEXT                                                            |
| Default     | DOUBLE                                                                           |
| Effective   | Hot_reload                                                                       |

- nan_string_infer_type

| Name        | nan_string_infer_type                                              |
| ----------- |--------------------------------------------------------------------|
| Description | register time series as which type when receiving the Literal NaN. |
| Value       | DOUBLE, FLOAT or TEXT                                              |
| Default     | DOUBLE                                                             |
| Effective   | Hot_reload                                                         |

- default_boolean_encoding

| Name        | default_boolean_encoding                                       |
| ----------- |----------------------------------------------------------------|
| Description | BOOLEAN encoding when creating schema automatically is enabled |
| Value       | PLAIN, RLE                                                     |
| Default     | RLE                                                            |
| Effective   | Hot_reload                                                     |

- default_int32_encoding

| Name        | default_int32_encoding                                       |
| ----------- |--------------------------------------------------------------|
| Description | INT32 encoding when creating schema automatically is enabled |
| Value       | PLAIN, RLE, TS_2DIFF, REGULAR, GORILLA                       |
| Default     | TS_2DIFF                                                     |
| Effective   | Hot_reload                                                   |

- default_int64_encoding

| Name        | default_int64_encoding                                       |
| ----------- |--------------------------------------------------------------|
| Description | INT64 encoding when creating schema automatically is enabled |
| Value       | PLAIN, RLE, TS_2DIFF, REGULAR, GORILLA                       |
| Default     | TS_2DIFF                                                     |
| Effective   | Hot_reload                                                   |

- default_float_encoding

| Name        | default_float_encoding                                       |
| ----------- |--------------------------------------------------------------|
| Description | FLOAT encoding when creating schema automatically is enabled |
| Value       | PLAIN, RLE, TS_2DIFF, GORILLA                                |
| Default     | GORILLA                                                      |
| Effective   | Hot_reload                                                   |

- default_double_encoding

| Name        | default_double_encoding                                       |
| ----------- |---------------------------------------------------------------|
| Description | DOUBLE encoding when creating schema automatically is enabled |
| Value       | PLAIN, RLE, TS_2DIFF, GORILLA                                 |
| Default     | GORILLA                                                       |
| Effective   | Hot_reload                                                    |

- default_text_encoding

| Name        | default_text_encoding                                       |
| ----------- |-------------------------------------------------------------|
| Description | TEXT encoding when creating schema automatically is enabled |
| Value       | PLAIN                                                       |
| Default     | PLAIN                                                       |
| Effective   | Hot_reload                                                  |


* boolean_compressor

| Name             | boolean_compressor                                                                      |
|------------------|-----------------------------------------------------------------------------------------|
| Description      | BOOLEAN compression when creating schema automatically is enabled (Supports from V2.0.6) |
| Type             | String                                                                                  |
| Default          | LZ4                                                                                     |
| Effective        | Hot_reload                                                                              |

* int32_compressor

| Name                 | int32_compressor                                                                           |
|----------------------|--------------------------------------------------------------------------------------------|
| Description          | INT32/DATE compression when creating schema automatically is enabled(Supports from V2.0.6) |
| Type                 | String                                                                                     |
| Default              | LZ4                                                                                        |
| Effective            | Hot_reload                                                                                 |

* int64_compressor

| Name               | int64_compressor                                                                                |
|--------------------|-------------------------------------------------------------------------------------------------|
| Description        | INT64/TIMESTAMP compression when creating schema automatically is enabled (Supports from V2.0.6) |
| Type               | String                                                                                          |
| Default            | LZ4                                                                                             |
| Effective          | Hot_reload                                                                                      |

* float_compressor

| Name                  | float_compressor                                                                      |
|-----------------------|---------------------------------------------------------------------------------------|
| Description           | FLOAT compression when creating schema automatically is enabled (Supports from V2.0.6) |
| Type                  | String                                                                                |
| Default               | LZ4                                                                                   |
| Effective             | Hot_reload                                                                            |

* double_compressor

| Name              | double_compressor                                                                      |
|-------------------|----------------------------------------------------------------------------------------|
| Description       | DOUBLE compression when creating schema automatically is enabled (Supports from V2.0.6) |
| Type              | String                                                                                 |
| Default           | LZ4                                                                                    |
| Effective         | Hot_reload                                                                             |

* text_compressor

| Name               | text_compressor                                                                                  |
|--------------------|--------------------------------------------------------------------------------------------------|
| Description        | TEXT/BINARY/BLOB compression when creating schema automatically is enabled (Supports from V2.0.6) |
| Type               | String                                                                                           |
| Default            | LZ4                                                                                              |
| Effective          | Hot_reload                                                                                       |


### 4.17 Query Configurations

- read_consistency_level

| Name        | read_consistency_level                                       |
| ----------- | ------------------------------------------------------------ |
| Description | The read consistency levelThese consistency levels are currently supported:strong(Default, read from the leader replica)weak(Read from a random replica) |
| Type        | String                                                       |
| Default     | strong                                                       |
| Effective   | Restart required.                                            |

- meta_data_cache_enable

| Name        | meta_data_cache_enable                                       |
| ----------- | ------------------------------------------------------------ |
| Description | Whether to cache meta data (BloomFilter, ChunkMetadata and TimeSeriesMetadata) or not. |
| Type        | Boolean                                                      |
| Default     | true                                                         |
| Effective   | Restart required.                                            |

- chunk_timeseriesmeta_free_memory_proportion

| Name        | chunk_timeseriesmeta_free_memory_proportion                  |
| ----------- | ------------------------------------------------------------ |
| Description | Read memory Allocation Ratio: BloomFilterCache : ChunkCache : TimeSeriesMetadataCache : Coordinator : Operators : DataExchange : timeIndex in TsFileResourceList : others.The parameter form is a:b:c:d:e:f:g:h, where a, b, c, d, e, f, g and h are integers. for example: 1:1:1:1:1:1:1:1 , 1:100:200:50:200:200:200:50 |
| Type        | String                                                       |
| Default     | 1 : 100 : 200 : 300 : 400                                    |
| Effective   | Restart required.                                            |

- enable_last_cache

| Name        | enable_last_cache            |
| ----------- | ---------------------------- |
| Description | Whether to enable LAST cache |
| Type        | Boolean                      |
| Default     | true                         |
| Effective   | Restart required.            |

- mpp_data_exchange_core_pool_size

| Name        | mpp_data_exchange_core_pool_size             |
| ----------- | -------------------------------------------- |
| Description | Core size of ThreadPool of MPP data exchange |
| Type        | int32                                        |
| Default     | 10                                           |
| Effective   | Restart required.                            |

- mpp_data_exchange_max_pool_size

| Name        | mpp_data_exchange_max_pool_size             |
| ----------- | ------------------------------------------- |
| Description | Max size of ThreadPool of MPP data exchange |
| Type        | int32                                       |
| Default     | 10                                          |
| Effective   | Restart required.                           |

- mpp_data_exchange_keep_alive_time_in_ms

| Name        | mpp_data_exchange_keep_alive_time_in_ms |
| ----------- | --------------------------------------- |
| Description | Max waiting time for MPP data exchange  |
| Type        | int32                                   |
| Default     | 1000                                    |
| Effective   | Restart required.                       |

- driver_task_execution_time_slice_in_ms

| Name        | driver_task_execution_time_slice_in_ms |
| ----------- | -------------------------------------- |
| Description | The max execution time of a DriverTask |
| Type        | int32                                  |
| Default     | 200                                    |
| Effective   | Restart required.                      |

- max_tsblock_size_in_bytes

| Name        | max_tsblock_size_in_bytes     |
| ----------- | ----------------------------- |
| Description | The max capacity of a TsBlock |
| Type        | int32                         |
| Default     | 131072                        |
| Effective   | Restart required.             |

- max_tsblock_line_numbers

| Name        | max_tsblock_line_numbers                    |
| ----------- | ------------------------------------------- |
| Description | The max number of lines in a single TsBlock |
| Type        | int32                                       |
| Default     | 1000                                        |
| Effective   | Restart required.                           |

- slow_query_threshold

| Name        | slow_query_threshold                   |
| ----------- | -------------------------------------- |
| Description | Time cost(ms) threshold for slow query |
| Type        | long                                   |
| Default     | 10000                                  |
| Effective   | Hot reload                             |

- query_cost_stat_window

| Name        | query_cost_stat_window |
|-------------|--------------------|
| Description | Time window threshold(min) for record of history queries.   |
| Type        | Int32              |
| Default     | 0                  |
| Effective   | Hot reload                 |

- query_timeout_threshold

| Name        | query_timeout_threshold                   |
| ----------- | ----------------------------------------- |
| Description | The max executing time of query. unit: ms |
| Type        | Int32                                     |
| Default     | 60000                                     |
| Effective   | Restart required.                         |

- max_allowed_concurrent_queries

| Name        | max_allowed_concurrent_queries                     |
| ----------- | -------------------------------------------------- |
| Description | The maximum allowed concurrently executing queries |
| Type        | Int32                                              |
| Default     | 1000                                               |
| Effective   | Restart required.                                  |

- query_thread_count

| Name        | query_thread_count                                           |
| ----------- | ------------------------------------------------------------ |
| Description | How many threads can concurrently execute query statement. When <= 0, use CPU core number. |
| Type        | Int32                                                        |
| Default     | 0                                                            |
| Effective   | Restart required.                                            |

- degree_of_query_parallelism

| Name        | degree_of_query_parallelism                                  |
| ----------- | ------------------------------------------------------------ |
| Description | How many pipeline drivers will be created for one fragment instance. When <= 0, use CPU core number / 2. |
| Type        | Int32                                                        |
| Default     | 0                                                            |
| Effective   | Restart required.                                            |

- mode_map_size_threshold

| Name        | mode_map_size_threshold                                      |
| ----------- | ------------------------------------------------------------ |
| Description | The threshold of count map size when calculating the MODE aggregation function |
| Type        | Int32                                                        |
| Default     | 10000                                                        |
| Effective   | Restart required.                                            |

- batch_size

| Name        | batch_size                                                   |
| ----------- | ------------------------------------------------------------ |
| Description | The amount of data iterate each time in server (the number of data strips, that is, the number of different timestamps.) |
| Type        | Int32                                                        |
| Default     | 100000                                                       |
| Effective   | Restart required.                                            |

- sort_buffer_size_in_bytes

| Name        | sort_buffer_size_in_bytes                                                                                                                                                                                                                                                      |
| ----------- |--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Description | The memory for external sort in sort operator, when the data size is smaller than sort_buffer_size_in_bytes, the sort operator will use in-memory sort.                                                                                                                        |
| Type        | long                                                                                                                                                                                                                                                                           |
| Default     | 1048576(Before V2.0.6) <br> 0(Supports from V2.0.6), if `sort_buffer_size_in_bytes <= 0`, default value will be used, `default value = min(32MB, memory for query operators / query_thread_count / 2)`, if `sort_buffer_size_in_bytes > 0`, the specified value will be used.  |
| Effective   | Hot_reload                                                                                                                                                                                                                                                                     |

- merge_threshold_of_explain_analyze

| Name        | merge_threshold_of_explain_analyze                           |
| ----------- | ------------------------------------------------------------ |
| Description | The threshold of operator count in the result set of EXPLAIN ANALYZE, if the number of operator in the result set is larger than this threshold, operator will be merged. |
| Type        | int                                                          |
| Default     | 10                                                           |
| Effective   | Hot reload                                                   |

### 4.18 TTL Configuration

- ttl_check_interval

| Name        | ttl_check_interval                                           |
| ----------- | ------------------------------------------------------------ |
| Description | The interval of TTL check task in each database. The TTL check task will inspect and select files with a higher volume of expired data for compaction. Default is 2 hours. |
| Type        | int                                                          |
| Default     | 7200000                                                      |
| Effective   | Restart required.                                            |

- max_expired_time

| Name        | max_expired_time                                             |
| ----------- | ------------------------------------------------------------ |
| Description | The maximum expiring time of device which has a ttl. Default is 1 month.If the data elapsed time (current timestamp minus the maximum data timestamp of the device in the file) of such devices exceeds this value, then the file will be cleaned by compaction. |
| Type        | int                                                          |
| Default     | 2592000000                                                   |
| Effective   | Restart required.                                            |

- expired_data_ratio

| Name        | expired_data_ratio                                           |
| ----------- | ------------------------------------------------------------ |
| Description | The expired device ratio. If the ratio of expired devices in one file exceeds this value, then expired data of this file will be cleaned by compaction. |
| Type        | float                                                        |
| Default     | 0.3                                                          |
| Effective   | Restart required.                                            |

### 4.19 Storage Engine Configuration

- timestamp_precision

| Name        | timestamp_precision                                          |
| ----------- | ------------------------------------------------------------ |
| Description | Use this value to set timestamp precision as "ms", "us" or "ns". |
| Type        | String                                                       |
| Default     | ms                                                           |
| Effective   | Modify before the first startup.                             |

- timestamp_precision_check_enabled

| Name        | timestamp_precision_check_enabled                            |
| ----------- | ------------------------------------------------------------ |
| Description | When the timestamp precision check is enabled, the timestamps those are over 13 digits for ms precision, or over 16 digits for us precision are not allowed to be inserted. |
| Type        | Boolean                                                      |
| Default     | true                                                         |
| Effective   | Modify before the first startup.                             |

- max_waiting_time_when_insert_blocked

| Name        | max_waiting_time_when_insert_blocked                         |
| ----------- | ------------------------------------------------------------ |
| Description | When the waiting time (in ms) of an inserting exceeds this, throw an exception. 10000 by default. |
| Type        | Int32                                                        |
| Default     | 10000                                                        |
| Effective   | Restart required.                                            |

- handle_system_error

| Name        | handle_system_error                                      |
| ----------- | -------------------------------------------------------- |
| Description | What will the system do when unrecoverable error occurs. |
| Type        | String                                                   |
| Default     | CHANGE_TO_READ_ONLY                                      |
| Effective   | Restart required.                                        |

- enable_timed_flush_seq_memtable

| Name        | enable_timed_flush_seq_memtable                     |
| ----------- | --------------------------------------------------- |
| Description | Whether to timed flush sequence tsfiles' memtables. |
| Type        | Boolean                                             |
| Default     | true                                                |
| Effective   | Hot reload                                          |

- seq_memtable_flush_interval_in_ms

| Name        | seq_memtable_flush_interval_in_ms                            |
| ----------- | ------------------------------------------------------------ |
| Description | If a memTable's last update time is older than current time minus this, the memtable will be flushed to disk. |
| Type        | long                                                         |
| Default     | 600000                                                       |
| Effective   | Hot reload                                                   |

- seq_memtable_flush_check_interval_in_ms

| Name        | seq_memtable_flush_check_interval_in_ms                      |
| ----------- | ------------------------------------------------------------ |
| Description | The interval to check whether sequence memtables need flushing. |
| Type        | long                                                         |
| Default     | 30000                                                        |
| Effective   | Hot reload                                                   |

- enable_timed_flush_unseq_memtable

| Name        | enable_timed_flush_unseq_memtable                     |
| ----------- | ----------------------------------------------------- |
| Description | Whether to timed flush unsequence tsfiles' memtables. |
| Type        | Boolean                                               |
| Default     | true                                                  |
| Effective   | Hot reload                                            |

- unseq_memtable_flush_interval_in_ms

| Name        | unseq_memtable_flush_interval_in_ms                          |
| ----------- | ------------------------------------------------------------ |
| Description | If a memTable's last update time is older than current time minus this, the memtable will be flushed to disk. |
| Type        | long                                                         |
| Default     | 600000                                                       |
| Effective   | Hot reload                                                   |

- unseq_memtable_flush_check_interval_in_ms

| Name        | unseq_memtable_flush_check_interval_in_ms                    |
| ----------- | ------------------------------------------------------------ |
| Description | The interval to check whether unsequence memtables need flushing. |
| Type        | long                                                         |
| Default     | 30000                                                        |
| Effective   | Hot reload                                                   |

- tvlist_sort_algorithm

| Name        | tvlist_sort_algorithm                             |
| ----------- | ------------------------------------------------- |
| Description | The sort algorithms used in the memtable's TVList |
| Type        | String                                            |
| Default     | TIM                                               |
| Effective   | Restart required.                                 |

- avg_series_point_number_threshold

| Name        | avg_series_point_number_threshold                            |
| ----------- | ------------------------------------------------------------ |
| Description | When the average point number of timeseries in memtable exceeds this, the memtable is flushed to disk. |
| Type        | int32                                                        |
| Default     | 100000                                                       |
| Effective   | Restart required.                                            |

- flush_thread_count

| Name        | flush_thread_count                                           |
| ----------- | ------------------------------------------------------------ |
| Description | How many threads can concurrently flush. When <= 0, use CPU core number. |
| Type        | int32                                                        |
| Default     | 0                                                            |
| Effective   | Restart required.                                            |

- enable_partial_insert

| Name        | enable_partial_insert                                        |
| ----------- | ------------------------------------------------------------ |
| Description | In one insert (one device, one timestamp, multiple measurements), if enable partial insert, one measurement failure will not impact other measurements |
| Type        | Boolean                                                      |
| Default     | true                                                         |
| Effective   | Restart required.                                            |

- recovery_log_interval_in_ms

| Name        | recovery_log_interval_in_ms                                  |
| ----------- | ------------------------------------------------------------ |
| Description | the interval to log recover progress of each vsg when starting iotdb |
| Type        | Int32                                                        |
| Default     | 5000                                                         |
| Effective   | Restart required.                                            |

- 0.13_data_insert_adapt

| Name        | 0.13_data_insert_adapt                                       |
| ----------- | ------------------------------------------------------------ |
| Description | If using a v0.13 client to insert data, please set this configuration to true. |
| Type        | Boolean                                                      |
| Default     | false                                                        |
| Effective   | Restart required.                                            |

- enable_tsfile_validation

| Name        | enable_tsfile_validation                                     |
| ----------- | ------------------------------------------------------------ |
| Description | Verify that TSfiles generated by Flush, Load, and Compaction are correct. |
| Type        | boolean                                                      |
| Default     | false                                                        |
| Effective   | Hot reload                                                   |

- tier_ttl_in_ms

| Name        | tier_ttl_in_ms                                               |
| ----------- | ------------------------------------------------------------ |
| Description | Default tier TTL. When the survival time of the data exceeds the threshold, it will be migrated to the next tier. |
| Type        | long                                                         |
| Default     | -1                                                           |
| Effective   | Restart required.                                            |

- max_object_file_size_in_byte

| Name        | max_object_file_size_in_byte                                          |
|-------------|-----------------------------------------------------------------------|
| Description | Maximum size limit for a single object file (supported since V2.0.8). |
| Type        | long                                                                  |
| Default     | 4294967296 (4 GB in bytes)                                            |
| Effective   | Hot reload                                                            |
 
- restrict_object_limit

| Name        | restrict_object_limit                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|-------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Description | No special restrictions on table names, column names, or device identifiers for `OBJECT` type (supported since V2.0.8). When set to `true` and the table contains `OBJECT` columns, the following restrictions apply: <br> 1. Naming Rules: Values in TAG columns, table names, and field names must not use `.` or `..`; Prohibited characters include `./` or `.\`, otherwise metadata creation will fail; Names containing filesystem-unsupported characters will cause write errors. <br>2. Case Sensitivity: If the underlying filesystem is case-insensitive, device identifiers like `'d1'` and `'D1'` are treated as identical; Creating similar identifiers may overwrite `OBJECT` data files, leading to data corruption.<br> 3. Storage Path: Actual storage path format: `${dataregionid}/${tablename}/${tag1}/${tag2}/.../${field}/${timestamp}.bin` |
| Type        | boolean                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Default     | false                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Effective   | Can only be modified before the first service startup.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

### 4.20 Compaction Configurations

- enable_seq_space_compaction

| Name        | enable_seq_space_compaction                                |
| ----------- | ---------------------------------------------------------- |
| Description | sequence space compaction: only compact the sequence files |
| Type        | Boolean                                                    |
| Default     | true                                                       |
| Effective   | Hot reload                                                 |

- enable_unseq_space_compaction

| Name        | enable_unseq_space_compaction                                |
| ----------- | ------------------------------------------------------------ |
| Description | unsequence space compaction: only compact the unsequence files |
| Type        | Boolean                                                      |
| Default     | true                                                         |
| Effective   | Hot reload                                                   |

- enable_cross_space_compaction

| Name        | enable_cross_space_compaction                                |
| ----------- | ------------------------------------------------------------ |
| Description | cross space compaction: compact the unsequence files into the overlapped sequence files |
| Type        | Boolean                                                      |
| Default     | true                                                         |
| Effective   | Hot reload                                                   |

- enable_auto_repair_compaction

| Name        | enable_auto_repair_compaction                  |
| ----------- | ---------------------------------------------- |
| Description | enable auto repair unsorted file by compaction |
| Type        | Boolean                                        |
| Default     | true                                           |
| Effective   | Hot reload                                     |

- cross_selector

| Name        | cross_selector                              |
| ----------- | ------------------------------------------- |
| Description | the selector of cross space compaction task |
| Type        | String                                      |
| Default     | rewrite                                     |
| Effective   | Restart required.                           |

- cross_performer

| Name        | cross_performer                                           |
| ----------- |-----------------------------------------------------------|
| Description | the compaction performer of cross space compaction task, Options: read_point, fast |
| Type        | String                                                    |
| Default     | fast                                                      |
| Effective   | Hot reload .                                              |

- inner_seq_selector

| Name        | inner_seq_selector                                     |
| ----------- |--------------------------------------------------------|
| Description | the selector of inner sequence space compaction task, Options: size_tiered_single_target,size_tiered_multi_target |
| Type        | String                                                 |
| Default     | size_tiered_multi_target                               |
| Effective   | Hot reload                                             |

- inner_seq_performer

| Name        | inner_seq_performer                                     |
| ----------- |---------------------------------------------------------|
| Description | the performer of inner sequence space compaction task, Options: read_chunk, fast |
| Type        | String                                                  |
| Default     | read_chunk                                              |
| Effective   | Hot reload                                       |

- inner_unseq_selector

| Name        | inner_unseq_selector                                     |
| ----------- |----------------------------------------------------------|
| Description | the selector of inner unsequence space compaction task, Options: size_tiered_single_target,size_tiered_multi_target |
| Type        | String                                                   |
| Default     | size_tiered_multi_target                                 |
| Effective   | Hot reload                                               |

- inner_unseq_performer

| Name        | inner_unseq_performer                                     |
| ----------- |-----------------------------------------------------------|
| Description | the performer of inner unsequence space compaction task, Options: read_point, fast |
| Type        | String                                                    |
| Default     | fast                                                      |
| Effective   | Hot reload                                         |

- compaction_priority

| Name        | compaction_priority                                          |
| ----------- | ------------------------------------------------------------ |
| Description | The priority of compaction executionINNER_CROSS: prioritize inner space compaction, reduce the number of files firstCROSS_INNER: prioritize cross space compaction, eliminate the unsequence files firstBALANCE: alternate two compaction types |
| Type        | String                                                       |
| Default     | INNER_CROSS                                                  |
| Effective   | Restart required.                                                 |

- candidate_compaction_task_queue_size

| Name        | candidate_compaction_task_queue_size         |
| ----------- | -------------------------------------------- |
| Description | The size of candidate compaction task queue. |
| Type        | int32                                        |
| Default     | 50                                           |
| Effective   | Restart required.                            |

- target_compaction_file_size

| Name        | target_compaction_file_size                                  |
| ----------- | ------------------------------------------------------------ |
| Description | This parameter is used in two places:The target tsfile size of inner space compaction.The candidate size of seq tsfile in cross space compaction will be smaller than target_compaction_file_size * 1.5.In most cases, the target file size of cross compaction won't exceed this threshold, and if it does, it will not be much larger than it. |
| Type        | Int64                                                        |
| Default     | 2147483648                                                   |
| Effective   | Hot reload                                                   |

- inner_compaction_total_file_size_threshold

| Name        | inner_compaction_total_file_size_threshold           |
| ----------- | ---------------------------------------------------- |
| Description | The total file size limit in inner space compaction. |
| Type        | int64                                                |
| Default     | 10737418240                                          |
| Effective   | Hot reload                                           |

- inner_compaction_total_file_num_threshold

| Name        | inner_compaction_total_file_num_threshold           |
| ----------- | --------------------------------------------------- |
| Description | The total file num limit in inner space compaction. |
| Type        | int32                                               |
| Default     | 100                                                 |
| Effective   | Hot reload                                          |

- max_level_gap_in_inner_compaction

| Name        | max_level_gap_in_inner_compaction               |
| ----------- | ----------------------------------------------- |
| Description | The max level gap in inner compaction selection |
| Type        | int32                                           |
| Default     | 2                                               |
| Effective   | Hot reload                                      |

- target_chunk_size

| Name        | target_chunk_size                                            |
| ----------- | ------------------------------------------------------------ |
| Description | The target chunk size in flushing and compaction. If the size of a timeseries in memtable exceeds this, the data will be flushed to multiple chunks.|
| Type        | Int64                                                        |
| Default     | 1600000                                                      |
| Effective   | Restart required.                                            |

- target_chunk_point_num

| Name        | target_chunk_point_num                                          |
| ----------- |-----------------------------------------------------------------|
| Description | The target point nums in one chunk in flushing and compaction. If the point number of a timeseries in memtable exceeds this, the data will be flushed to multiple chunks. |
| Type        | Int64                                                           |
| Default     | 100000                                                          |
| Effective   | Restart required.                                               |

- chunk_size_lower_bound_in_compaction

| Name        | chunk_size_lower_bound_in_compaction                         |
| ----------- | ------------------------------------------------------------ |
| Description | If the chunk size is lower than this threshold, it will be deserialized into points |
| Type        | Int64                                                        |
| Default     | 128                                                          |
| Effective   | Restart required.                                            |

- chunk_point_num_lower_bound_in_compaction

| Name        | chunk_point_num_lower_bound_in_compaction                                                |
| ----------- |------------------------------------------------------------------------------------------|
| Description | If the chunk point num is lower than this threshold, it will be deserialized into points |
| Type        | Int64                                                                                    |
| Default     | 100                                                                                      |
| Effective   | Restart required.                                                                        |

- inner_compaction_candidate_file_num

| Name        | inner_compaction_candidate_file_num                          |
| ----------- | ------------------------------------------------------------ |
| Description | The file num requirement when selecting inner space compaction candidate files |
| Type        | int32                                                        |
| Default     | 30                                                           |
| Effective   | Hot reload                                                   |

- max_cross_compaction_candidate_file_num

| Name        | max_cross_compaction_candidate_file_num                      |
| ----------- | ------------------------------------------------------------ |
| Description | The max file when selecting cross space compaction candidate files |
| Type        | int32                                                        |
| Default     | 500                                                          |
| Effective   | Hot reload                                                   |

- max_cross_compaction_candidate_file_size

| Name        | max_cross_compaction_candidate_file_size                     |
| ----------- | ------------------------------------------------------------ |
| Description | The max total size when selecting cross space compaction candidate files |
| Type        | Int64                                                        |
| Default     | 5368709120                                                   |
| Effective   | Hot reload                                                   |

- min_cross_compaction_unseq_file_level

| Name        | min_cross_compaction_unseq_file_level                        |
| ----------- | ------------------------------------------------------------ |
| Description | The min inner compaction level of unsequence file which can be selected as candidate |
| Type        | int32                                                        |
| Default     | 1                                                            |
| Effective   | Hot reload                                                   |

- compaction_thread_count

| Name        | compaction_thread_count                                      |
| ----------- | ------------------------------------------------------------ |
| Description | How many threads will be set up to perform compaction, 10 by default. |
| Type        | int32                                                        |
| Default     | 10                                                           |
| Effective   | Hot reload                                                   |

- compaction_max_aligned_series_num_in_one_batch

| Name        | compaction_max_aligned_series_num_in_one_batch               |
| ----------- | ------------------------------------------------------------ |
| Description | How many chunk will be compacted in aligned series compaction, 10 by default. |
| Type        | int32                                                        |
| Default     | 10                                                           |
| Effective   | Hot reload                                                   |

- compaction_schedule_interval_in_ms

| Name        | compaction_schedule_interval_in_ms       |
| ----------- | ---------------------------------------- |
| Description | The interval of compaction task schedule |
| Type        | Int64                                    |
| Default     | 60000                                    |
| Effective   | Restart required.                        |

- compaction_write_throughput_mb_per_sec

| Name        | compaction_write_throughput_mb_per_sec                   |
| ----------- | -------------------------------------------------------- |
| Description | The limit of write throughput merge can reach per second |
| Type        | int32                                                    |
| Default     | 16                                                       |
| Effective   | Restart required.                                        |

- compaction_read_throughput_mb_per_sec

| Name        | compaction_read_throughput_mb_per_sec                   |
| ----------- | ------------------------------------------------------- |
| Description | The limit of read throughput merge can reach per second |
| Type        | int32                                                   |
| Default     | 0                                                       |
| Effective   | Hot reload                                              |

- compaction_read_operation_per_sec

| Name        | compaction_read_operation_per_sec                      |
| ----------- | ------------------------------------------------------ |
| Description | The limit of read operation merge can reach per second |
| Type        | int32                                                  |
| Default     | 0                                                      |
| Effective   | Hot reload                                             |

- sub_compaction_thread_count

| Name        | sub_compaction_thread_count                                  |
| ----------- | ------------------------------------------------------------ |
| Description | The number of sub compaction threads to be set up to perform compaction. |
| Type        | int32                                                        |
| Default     | 4                                                            |
| Effective   | Hot reload                                                   |

- inner_compaction_task_selection_disk_redundancy

| Name        | inner_compaction_task_selection_disk_redundancy              |
| ----------- | ------------------------------------------------------------ |
| Description | Redundancy value of disk availability, only use for inner compaction. |
| Type        | double                                                       |
| Default     | 0.05                                                         |
| Effective   | Hot reload                                                   |

- inner_compaction_task_selection_mods_file_threshold

| Name        | inner_compaction_task_selection_mods_file_threshold      |
| ----------- | -------------------------------------------------------- |
| Description | Mods file size threshold, only use for inner compaction. |
| Type        | long                                                     |
| Default     | 131072                                                   |
| Effective   | Hot reload                                               |

- compaction_schedule_thread_num

| Name        | compaction_schedule_thread_num                               |
| ----------- | ------------------------------------------------------------ |
| Description | The number of threads to be set up to select compaction task. |
| Type        | int32                                                        |
| Default     | 4                                                            |
| Effective   | Hot reload                                                   |

### 4.21 Write Ahead Log Configuration

- wal_mode

| Name        | wal_mode                                                     |
| ----------- | ------------------------------------------------------------ |
| Description | The details of these three modes are as follows:DISABLE: the system will disable wal.SYNC: the system will submit wal synchronously, write request will not return until its wal is fsynced to the disk successfully.ASYNC: the system will submit wal asynchronously, write request will return immediately no matter its wal is fsynced to the disk successfully. |
| Type        | String                                                       |
| Default     | ASYNC                                                        |
| Effective   | Restart required.                                            |

- max_wal_nodes_num

| Name        | max_wal_nodes_num                                            |
| ----------- | ------------------------------------------------------------ |
| Description | each node corresponds to one wal directory The default value 0 means the number is determined by the system, the number is in the range of [data region num / 2, data region num]. |
| Type        | int32                                                        |
| Default     | 0                                                            |
| Effective   | Restart required.                                            |

- wal_async_mode_fsync_delay_in_ms

| Name        | wal_async_mode_fsync_delay_in_ms                             |
| ----------- | ------------------------------------------------------------ |
| Description | Duration a wal flush operation will wait before calling fsync in the async mode |
| Type        | int32                                                        |
| Default     | 1000                                                         |
| Effective   | Hot reload                                                   |

- wal_sync_mode_fsync_delay_in_ms

| Name        | wal_sync_mode_fsync_delay_in_ms                              |
| ----------- | ------------------------------------------------------------ |
| Description | Duration a wal flush operation will wait before calling fsync in the sync mode |
| Type        | int32                                                        |
| Default     | 3                                                            |
| Effective   | Hot reload                                                   |

- wal_buffer_size_in_byte

| Name        | wal_buffer_size_in_byte      |
| ----------- | ---------------------------- |
| Description | Buffer size of each wal node |
| Type        | int32                        |
| Default     | 33554432                     |
| Effective   | Restart required.            |

- wal_buffer_queue_capacity

| Name        | wal_buffer_queue_capacity         |
| ----------- | --------------------------------- |
| Description | Buffer capacity of each wal queue |
| Type        | int32                             |
| Default     | 500                               |
| Effective   | Restart required.                 |

- wal_file_size_threshold_in_byte

| Name        | wal_file_size_threshold_in_byte |
| ----------- | ------------------------------- |
| Description | Size threshold of each wal file |
| Type        | int32                           |
| Default     | 31457280                        |
| Effective   | Hot reload                      |

- wal_min_effective_info_ratio

| Name        | wal_min_effective_info_ratio                        |
| ----------- | --------------------------------------------------- |
| Description | Minimum ratio of effective information in wal files |
| Type        | double                                              |
| Default     | 0.1                                                 |
| Effective   | Hot reload                                          |

- wal_memtable_snapshot_threshold_in_byte

| Name        | wal_memtable_snapshot_threshold_in_byte                      |
| ----------- | ------------------------------------------------------------ |
| Description | MemTable size threshold for triggering MemTable snapshot in wal |
| Type        | int64                                                        |
| Default     | 8388608                                                      |
| Effective   | Hot reload                                                   |

- max_wal_memtable_snapshot_num

| Name        | max_wal_memtable_snapshot_num         |
| ----------- | ------------------------------------- |
| Description | MemTable's max snapshot number in wal |
| Type        | int32                                 |
| Default     | 1                                     |
| Effective   | Hot reload                            |

- delete_wal_files_period_in_ms

| Name        | delete_wal_files_period_in_ms                               |
| ----------- | ----------------------------------------------------------- |
| Description | The period when outdated wal files are periodically deleted |
| Type        | int64                                                       |
| Default     | 20000                                                       |
| Effective   | Hot reload                                                  |

- wal_throttle_threshold_in_byte

| Name        | wal_throttle_threshold_in_byte                               |
| ----------- | ------------------------------------------------------------ |
| Description | The minimum size of wal files when throttle down in IoTConsensus |
| Type        | long                                                         |
| Default     | 53687091200                                                  |
| Effective   | Hot reload                                                   |

- iot_consensus_cache_window_time_in_ms

| Name        | iot_consensus_cache_window_time_in_ms            |
| ----------- | ------------------------------------------------ |
| Description | Maximum wait time of write cache in IoTConsensus |
| Type        | long                                             |
| Default     | -1                                               |
| Effective   | Hot reload                                       |

- enable_wal_compression

| Name        | iot_consensus_cache_window_time_in_ms |
| ----------- | ------------------------------------- |
| Description | Enable Write Ahead Log compression.   |
| Type        | boolean                               |
| Default     | true                                  |
| Effective   | Hot reload                            |

### 4.22 **IoTConsensus Configuration**

- data_region_iot_max_log_entries_num_per_batch

| Name        | data_region_iot_max_log_entries_num_per_batch     |
| ----------- | ------------------------------------------------- |
| Description | The maximum log entries num in IoTConsensus Batch |
| Type        | int32                                             |
| Default     | 1024                                              |
| Effective   | Restart required.                                 |

- data_region_iot_max_size_per_batch

| Name        | data_region_iot_max_size_per_batch     |
| ----------- | -------------------------------------- |
| Description | The maximum size in IoTConsensus Batch |
| Type        | int32                                  |
| Default     | 16777216                               |
| Effective   | Restart required.                      |

- data_region_iot_max_pending_batches_num

| Name        | data_region_iot_max_pending_batches_num         |
| ----------- | ----------------------------------------------- |
| Description | The maximum pending batches num in IoTConsensus |
| Type        | int32                                           |
| Default     | 5                                               |
| Effective   | Restart required.                               |

- data_region_iot_max_memory_ratio_for_queue

| Name        | data_region_iot_max_memory_ratio_for_queue         |
| ----------- | -------------------------------------------------- |
| Description | The maximum memory ratio for queue in IoTConsensus |
| Type        | double                                             |
| Default     | 0.6                                                |
| Effective   | Restart required.                                  |

- region_migration_speed_limit_bytes_per_second

| Name        | region_migration_speed_limit_bytes_per_second                |
| ----------- | ------------------------------------------------------------ |
| Description | The maximum transit size in byte per second for region migration |
| Type        | long                                                         |
| Default     | 33554432                                                     |
| Effective   | Restart required.                                            |

### 4.23 TsFile Configurations

- group_size_in_byte

| Name        | group_size_in_byte                                           |
| ----------- | ------------------------------------------------------------ |
| Description | The maximum number of bytes written to disk each time the data in memory is written to disk |
| Type        | int32                                                        |
| Default     | 134217728                                                    |
| Effective   | Hot reload                                                   |

- page_size_in_byte

| Name        | page_size_in_byte                                            |
| ----------- | ------------------------------------------------------------ |
| Description | The memory size for each series writer to pack page, default value is 64KB |
| Type        | int32                                                        |
| Default     | 65536                                                        |
| Effective   | Hot reload                                                   |

- max_number_of_points_in_page

| Name        | max_number_of_points_in_page                |
| ----------- | ------------------------------------------- |
| Description | The maximum number of data points in a page |
| Type        | int32                                       |
| Default     | 10000                                       |
| Effective   | Hot reload                                  |

- pattern_matching_threshold

| Name        | pattern_matching_threshold                  |
| ----------- | ------------------------------------------- |
| Description | The threshold for pattern matching in regex |
| Type        | int32                                       |
| Default     | 1000000                                     |
| Effective   | Hot reload                                  |

- float_precision

| Name        | float_precision                                              |
| ----------- | ------------------------------------------------------------ |
| Description | Floating-point precision of query results.Only effective for RLE and TS_2DIFF encodings.Due to the limitation of machine precision, some values may not be interpreted strictly. |
| Type        | int32                                                        |
| Default     | 2                                                            |
| Effective   | Hot reload                                                   |

- value_encoder

| Name        | value_encoder                                                |
| ----------- | ------------------------------------------------------------ |
| Description | Encoder of value series. default value is PLAIN.             |
| Type        | For int, long data type, also supports TS_2DIFF and RLE(run-length encoding), GORILLA and ZIGZAG. |
| Default     | PLAIN                                                        |
| Effective   | Hot reload                                                   |

- compressor

| Name        | compressor                                                   |
| ----------- | ------------------------------------------------------------ |
| Description | Compression configuration And it is also used as the default compressor of time column in aligned timeseries. |
| Type        | Data compression method, supports UNCOMPRESSED, SNAPPY, ZSTD, LZMA2 or LZ4. Default value is LZ4 |
| Default     | LZ4                                                          |
| Effective   | Hot reload                                                   |

- encrypt_flag

| Name        | encrypt_flag             |
| ----------- | ---------------------- |
| Description | Enable data encryption |
| Type        | Boolean                |
| Default     | false                  |
| Effective   | Restart required.      |

- encrypt_type

| Name        | encrypt_type                          |
| ----------- |---------------------------------------|
| Description | The method of data encrytion          |
| Type        | String                                |
| Default     | org.apache.tsfile.encrypt.UNENCRYPTED |
| Effective   | Restart required.                     |

- encrypt_key_path

| Name        | encrypt_key_path                    |
| ----------- | ----------------------------------- |
| Description | The path of key for data encryption |
| Type        | String                              |
| Default     | None                                |
| Effective   | Restart required.                   |

### 4.24 Authorization Configuration

- authorizer_provider_class

| Name        | authorizer_provider_class                                    |
| ----------- | ------------------------------------------------------------ |
| Description | which class to serve for authorization.                      |
| Type        | String                                                       |
| Default     | org.apache.iotdb.commons.auth.authorizer.LocalFileAuthorizer |
| Effective   | Restart required.                                            |
| 其他可选值  | org.apache.iotdb.commons.auth.authorizer.OpenIdAuthorizer    |

- openID_url

| Name        | openID_url                                                   |
| ----------- | ------------------------------------------------------------ |
| Description | The url of openID server   If OpenIdAuthorizer is enabled, then openID_url must be set. |
| Type        | String（a http link）                                        |
| Default     | None                                                         |
| Effective   | Restart required.                                            |

- iotdb_server_encrypt_decrypt_provider

| Name        | iotdb_server_encrypt_decrypt_provider                        |
| ----------- | ------------------------------------------------------------ |
| Description | encryption provider class                                    |
| Type        | String                                                       |
| Default     | org.apache.iotdb.commons.security.encrypt.MessageDigestEncrypt |
| Effective   | Modify before the first startup.                             |

- iotdb_server_encrypt_decrypt_provider_parameter

| Name        | iotdb_server_encrypt_decrypt_provider_parameter |
| ----------- | ----------------------------------------------- |
| Description | encryption provided class parameter             |
| Type        | String                                          |
| Default     | None                                            |
| Effective   | Modify before the first startup.                |

- author_cache_size

| Name        | author_cache_size           |
| ----------- | --------------------------- |
| Description | Cache size of user and role |
| Type        | int32                       |
| Default     | 1000                        |
| Effective   | Restart required.           |

- author_cache_expire_time

| Name        | author_cache_expire_time           |
| ----------- | ---------------------------------- |
| Description | Cache expire time of user and role |
| Type        | int32                              |
| Default     | 30                                 |
| Effective   | Restart required.                  |

### 4.25 UDF Configuration

- udf_initial_byte_array_length_for_memory_control

| Name        | udf_initial_byte_array_length_for_memory_control             |
| ----------- | ------------------------------------------------------------ |
| Description | Used to estimate the memory usage of text fields in a UDF query.It is recommended to set this value to be slightly larger than the average length of all text records. |
| Type        | int32                                                        |
| Default     | 48                                                           |
| Effective   | Restart required.                                            |

- udf_memory_budget_in_mb

| Name        | udf_memory_budget_in_mb                                      |
| ----------- | ------------------------------------------------------------ |
| Description | How much memory may be used in ONE UDF query (in MB). The upper limit is 20% of allocated memory for read. |
| Type        | Float                                                        |
| Default     | 30.0                                                         |
| Effective   | Restart required.                                            |

- udf_reader_transformer_collector_memory_proportion

| Name        | udf_reader_transformer_collector_memory_proportion           |
| ----------- | ------------------------------------------------------------ |
| Description | UDF memory allocation ratio.The parameter form is a:b:c, where a, b, and c are integers. |
| Type        | String                                                       |
| Default     | 1:1:1                                                        |
| Effective   | Restart required.                                            |

- udf_lib_dir

| Name        | udf_lib_dir                  |
| ----------- | ---------------------------- |
| Description | the udf lib directory        |
| Type        | String                       |
| Default     | ext/udf（Windows：ext\\udf） |
| Effective   | Restart required.            |

### 4.26 Trigger Configuration

- trigger_lib_dir

| Name        | trigger_lib_dir           |
| ----------- | ------------------------- |
| Description | the trigger lib directory |
| Type        | String                    |
| Default     | ext/trigger               |
| Effective   | Restart required.         |

- stateful_trigger_retry_num_when_not_found

| Name        | stateful_trigger_retry_num_when_not_found                    |
| ----------- | ------------------------------------------------------------ |
| Description | How many times will we retry to found an instance of stateful trigger on DataNodes |
| Type        | Int32                                                        |
| Default     | 3                                                            |
| Effective   | Restart required.                                            |

### 4.27 **Select-Into Configuration**

- into_operation_buffer_size_in_byte

| Name        | into_operation_buffer_size_in_byte                           |
| ----------- | ------------------------------------------------------------ |
| Description | The maximum memory occupied by the data to be written when executing select-into statements. |
| Type        | long                                                         |
| Default     | 104857600                                                    |
| Effective   | Hot reload                                                   |

- select_into_insert_tablet_plan_row_limit

| Name        | select_into_insert_tablet_plan_row_limit                     |
| ----------- | ------------------------------------------------------------ |
| Description | The maximum number of rows can be processed in insert-tablet-plan when executing select-into statements. |
| Type        | int32                                                        |
| Default     | 10000                                                        |
| Effective   | Hot reload                                                   |

- into_operation_execution_thread_count

| Name        | into_operation_execution_thread_count                        |
| ----------- | ------------------------------------------------------------ |
| Description | The number of threads in the thread pool that execute insert-tablet tasks |
| Type        | int32                                                        |
| Default     | 2                                                            |
| Effective   | Restart required.                                            |

### 4.28 Continuous Query Configuration

- continuous_query_submit_thread_count

| Name        | continuous_query_execution_thread                            |
| ----------- | ------------------------------------------------------------ |
| Description | The number of threads in the scheduled thread pool that submit continuous query tasks periodically |
| Type        | int32                                                        |
| Default     | 2                                                            |
| Effective   | Restart required.                                            |

- continuous_query_min_every_interval_in_ms

| Name        | continuous_query_min_every_interval_in_ms                    |
| ----------- | ------------------------------------------------------------ |
| Description | The minimum value of the continuous query execution time interval |
| Type        | long (duration)                                              |
| Default     | 1000                                                         |
| Effective   | Restart required.                                            |

### 4.29 Pipe Configuration

- pipe_lib_dir

| Name        | pipe_lib_dir            |
| ----------- | ----------------------- |
| Description | the pipe lib directory. |
| Type        | string                  |
| Default     | ext/pipe                |
| Effective   | Not support modify      |

- pipe_subtask_executor_max_thread_num

| Name        | pipe_subtask_executor_max_thread_num                         |
| ----------- | ------------------------------------------------------------ |
| Description | The maximum number of threads that can be used to execute the pipe subtasks in PipeSubtaskExecutor. The actual value will be min(pipe_subtask_executor_max_thread_num, max(1, CPU core number / 2)). |
| Type        | int                                                          |
| Default     | 5                                                            |
| Effective   | Restart required.                                            |

- pipe_sink_timeout_ms

| Name        | pipe_sink_timeout_ms                                         |
| ----------- | ------------------------------------------------------------ |
| Description | The connection timeout (in milliseconds) for the thrift client. |
| Type        | int                                                          |
| Default     | 900000                                                       |
| Effective   | Restart required.                                            |

- pipe_sink_selector_number

| Name        | pipe_sink_selector_number                                    |
| ----------- | ------------------------------------------------------------ |
| Description | The maximum number of selectors that can be used in the sink.Recommend to set this value to less than or equal to pipe_sink_max_client_number. |
| Type        | int                                                          |
| Default     | 4                                                            |
| Effective   | Restart required.                                            |

- pipe_sink_max_client_number

| Name        | pipe_sink_max_client_number                                 |
| ----------- | ----------------------------------------------------------- |
| Description | The maximum number of clients that can be used in the sink. |
| Type        | int                                                         |
| Default     | 16                                                          |
| Effective   | Restart required.                                           |

- pipe_air_gap_receiver_enabled

| Name        | pipe_air_gap_receiver_enabled                                |
| ----------- | ------------------------------------------------------------ |
| Description | Whether to enable receiving pipe data through air gap.The receiver can only return 0 or 1 in TCP mode to indicate whether the data is received successfully. |
| Type        | Boolean                                                      |
| Default     | false                                                        |
| Effective   | Restart required.                                            |

- pipe_air_gap_receiver_port

| Name        | pipe_air_gap_receiver_port                                   |
| ----------- | ------------------------------------------------------------ |
| Description | The port for the server to receive pipe data through air gap. |
| Type        | int                                                          |
| Default     | 9780                                                         |
| Effective   | Restart required.                                            |

- pipe_all_sinks_rate_limit_bytes_per_second

| Name        | pipe_all_sinks_rate_limit_bytes_per_second                   |
| ----------- | ------------------------------------------------------------ |
| Description | The total bytes that all pipe sinks can transfer per second.When given a value less than or equal to 0, it means no limit. default value is -1, which means no limit. |
| Type        | double                                                       |
| Default     | -1                                                           |
| Effective   | Hot reload                                                   |

### 4.30 RatisConsensus Configuration

- config_node_ratis_log_appender_buffer_size_max

| Name        | config_node_ratis_log_appender_buffer_size_max               |
| ----------- | ------------------------------------------------------------ |
| Description | max payload size for a single log-sync-RPC from leader to follower of ConfigNode (in byte, by default 16MB) |
| Type        | int32                                                        |
| Default     | 16777216                                                     |
| Effective   | Restart required.                                            |

- schema_region_ratis_log_appender_buffer_size_max

| Name        | schema_region_ratis_log_appender_buffer_size_max             |
| ----------- | ------------------------------------------------------------ |
| Description | max payload size for a single log-sync-RPC from leader to follower of SchemaRegion (in byte, by default 16MB) |
| Type        | int32                                                        |
| Default     | 16777216                                                     |
| Effective   | Restart required.                                            |

- data_region_ratis_log_appender_buffer_size_max

| Name        | data_region_ratis_log_appender_buffer_size_max               |
| ----------- | ------------------------------------------------------------ |
| Description | max payload size for a single log-sync-RPC from leader to follower of DataRegion (in byte, by default 16MB) |
| Type        | int32                                                        |
| Default     | 16777216                                                     |
| Effective   | Restart required.                                            |

- config_node_ratis_snapshot_trigger_threshold

| Name        | config_node_ratis_snapshot_trigger_threshold                 |
| ----------- | ------------------------------------------------------------ |
| Description | max numbers of snapshot_trigger_threshold logs to trigger a snapshot of Confignode |
| Type        | int32                                                        |
| Default     | 400,000                                                      |
| Effective   | Restart required.                                            |

- schema_region_ratis_snapshot_trigger_threshold

| Name        | schema_region_ratis_snapshot_trigger_threshold               |
| ----------- | ------------------------------------------------------------ |
| Description | max numbers of snapshot_trigger_threshold logs to trigger a snapshot of SchemaRegion |
| Type        | int32                                                        |
| Default     | 400,000                                                      |
| Effective   | Restart required.                                            |

- data_region_ratis_snapshot_trigger_threshold

| Name        | data_region_ratis_snapshot_trigger_threshold                 |
| ----------- | ------------------------------------------------------------ |
| Description | max numbers of snapshot_trigger_threshold logs to trigger a snapshot of DataRegion |
| Type        | int32                                                        |
| Default     | 400,000                                                      |
| Effective   | Restart required.                                            |

- config_node_ratis_log_unsafe_flush_enable

| Name        | config_node_ratis_log_unsafe_flush_enable              |
| ----------- | ------------------------------------------------------ |
| Description | Is confignode allowed flushing Raft Log asynchronously |
| Type        | boolean                                                |
| Default     | false                                                  |
| Effective   | Restart required.                                      |

- schema_region_ratis_log_unsafe_flush_enable

| Name        | schema_region_ratis_log_unsafe_flush_enable              |
| ----------- | -------------------------------------------------------- |
| Description | Is schemaregion allowed flushing Raft Log asynchronously |
| Type        | boolean                                                  |
| Default     | false                                                    |
| Effective   | Restart required.                                        |

- data_region_ratis_log_unsafe_flush_enable

| Name        | data_region_ratis_log_unsafe_flush_enable              |
| ----------- | ------------------------------------------------------ |
| Description | Is dataregion allowed flushing Raft Log asynchronously |
| Type        | boolean                                                |
| Default     | false                                                  |
| Effective   | Restart required.                                      |

- config_node_ratis_log_segment_size_max_in_byte

| Name        | config_node_ratis_log_segment_size_max_in_byte               |
| ----------- | ------------------------------------------------------------ |
| Description | max capacity of a RaftLog segment file of confignode (in byte, by default 24MB) |
| Type        | int32                                                        |
| Default     | 25165824                                                     |
| Effective   | Restart required.                                            |

- schema_region_ratis_log_segment_size_max_in_byte

| Name        | schema_region_ratis_log_segment_size_max_in_byte             |
| ----------- | ------------------------------------------------------------ |
| Description | max capacity of a RaftLog segment file of schemaregion (in byte, by default 24MB) |
| Type        | int32                                                        |
| Default     | 25165824                                                     |
| Effective   | Restart required.                                            |

- data_region_ratis_log_segment_size_max_in_byte

| Name        | data_region_ratis_log_segment_size_max_in_byte               |
| ----------- | ------------------------------------------------------------ |
| Description | max capacity of a RaftLog segment file of dataregion(in byte, by default 24MB) |
| Type        | int32                                                        |
| Default     | 25165824                                                     |
| Effective   | Restart required.                                            |

- config_node_simple_consensus_log_segment_size_max_in_byte

| Name        | data_region_ratis_log_segment_size_max_in_byte               |
| ----------- | ------------------------------------------------------------ |
| Description | max capacity of a simple log segment file of confignode(in byte, by default 24MB) |
| Type        | int32                                                        |
| Default     | 25165824                                                     |
| Effective   | Restart required.                                            |

- config_node_ratis_grpc_flow_control_window

| Name        | config_node_ratis_grpc_flow_control_window                 |
| ----------- | ---------------------------------------------------------- |
| Description | confignode flow control window for ratis grpc log appender |
| Type        | int32                                                      |
| Default     | 4194304                                                    |
| Effective   | Restart required.                                          |

- schema_region_ratis_grpc_flow_control_window

| Name        | schema_region_ratis_grpc_flow_control_window                 |
| ----------- | ------------------------------------------------------------ |
| Description | schema region flow control window for ratis grpc log appender |
| Type        | int32                                                        |
| Default     | 4194304                                                      |
| Effective   | Restart required.                                            |

- data_region_ratis_grpc_flow_control_window

| Name        | data_region_ratis_grpc_flow_control_window                  |
| ----------- | ----------------------------------------------------------- |
| Description | data region flow control window for ratis grpc log appender |
| Type        | int32                                                       |
| Default     | 4194304                                                     |
| Effective   | Restart required.                                           |

- config_node_ratis_grpc_leader_outstanding_appends_max

| Name        | config_node_ratis_grpc_leader_outstanding_appends_max |
| ----------- | ----------------------------------------------------- |
| Description | config node grpc line concurrency threshold           |
| Type        | int32                                                 |
| Default     | 128                                                   |
| Effective   | Restart required.                                     |

- schema_region_ratis_grpc_leader_outstanding_appends_max

| Name        | schema_region_ratis_grpc_leader_outstanding_appends_max |
| ----------- | ------------------------------------------------------- |
| Description | schema region grpc line concurrency threshold           |
| Type        | int32                                                   |
| Default     | 128                                                     |
| Effective   | Restart required.                                       |

- data_region_ratis_grpc_leader_outstanding_appends_max

| Name        | data_region_ratis_grpc_leader_outstanding_appends_max |
| ----------- | ----------------------------------------------------- |
| Description | data region grpc line concurrency threshold           |
| Type        | int32                                                 |
| Default     | 128                                                   |
| Effective   | Restart required.                                     |

- config_node_ratis_log_force_sync_num

| Name        | config_node_ratis_log_force_sync_num |
| ----------- | ------------------------------------ |
| Description | config node fsync threshold          |
| Type        | int32                                |
| Default     | 128                                  |
| Effective   | Restart required.                    |

- schema_region_ratis_log_force_sync_num

| Name        | schema_region_ratis_log_force_sync_num |
| ----------- | -------------------------------------- |
| Description | schema region fsync threshold          |
| Type        | int32                                  |
| Default     | 128                                    |
| Effective   | Restart required.                      |

- data_region_ratis_log_force_sync_num

| Name        | data_region_ratis_log_force_sync_num |
| ----------- | ------------------------------------ |
| Description | data region fsync threshold          |
| Type        | int32                                |
| Default     | 128                                  |
| Effective   | Restart required.                    |

- config_node_ratis_rpc_leader_election_timeout_min_ms

| Name        | config_node_ratis_rpc_leader_election_timeout_min_ms |
| ----------- | ---------------------------------------------------- |
| Description | confignode leader min election timeout               |
| Type        | int32                                                |
| Default     | 2000ms                                               |
| Effective   | Restart required.                                    |

- schema_region_ratis_rpc_leader_election_timeout_min_ms

| Name        | schema_region_ratis_rpc_leader_election_timeout_min_ms |
| ----------- | ------------------------------------------------------ |
| Description | schema region leader min election timeout              |
| Type        | int32                                                  |
| Default     | 2000ms                                                 |
| Effective   | Restart required.                                      |

- data_region_ratis_rpc_leader_election_timeout_min_ms

| Name        | data_region_ratis_rpc_leader_election_timeout_min_ms |
| ----------- | ---------------------------------------------------- |
| Description | data region leader min election timeout              |
| Type        | int32                                                |
| Default     | 2000ms                                               |
| Effective   | Restart required.                                    |

- config_node_ratis_rpc_leader_election_timeout_max_ms

| Name        | config_node_ratis_rpc_leader_election_timeout_max_ms |
| ----------- | ---------------------------------------------------- |
| Description | confignode leader max election timeout               |
| Type        | int32                                                |
| Default     | 4000ms                                               |
| Effective   | Restart required.                                    |

- schema_region_ratis_rpc_leader_election_timeout_max_ms

| Name        | schema_region_ratis_rpc_leader_election_timeout_max_ms |
| ----------- | ------------------------------------------------------ |
| Description | schema region leader max election timeout              |
| Type        | int32                                                  |
| Default     | 4000ms                                                 |
| Effective   | Restart required.                                      |

- data_region_ratis_rpc_leader_election_timeout_max_ms

| Name        | data_region_ratis_rpc_leader_election_timeout_max_ms |
| ----------- | ---------------------------------------------------- |
| Description | data region leader max election timeout              |
| Type        | int32                                                |
| Default     | 4000ms                                               |
| Effective   | Restart required.                                    |

- config_node_ratis_request_timeout_ms

| Name        | config_node_ratis_request_timeout_ms    |
| ----------- | --------------------------------------- |
| Description | confignode ratis client retry threshold |
| Type        | int32                                   |
| Default     | 10000                                   |
| Effective   | Restart required.                       |

- schema_region_ratis_request_timeout_ms

| Name        | schema_region_ratis_request_timeout_ms     |
| ----------- | ------------------------------------------ |
| Description | schema region ratis client retry threshold |
| Type        | int32                                      |
| Default     | 10000                                      |
| Effective   | Restart required.                          |

- data_region_ratis_request_timeout_ms

| Name        | data_region_ratis_request_timeout_ms     |
| ----------- | ---------------------------------------- |
| Description | data region ratis client retry threshold |
| Type        | int32                                    |
| Default     | 10000                                    |
| Effective   | Restart required.                        |

- config_node_ratis_max_retry_attempts

| Name        | config_node_ratis_max_retry_attempts |
| ----------- | ------------------------------------ |
| Description | confignode ratis client retry times  |
| Type        | int32                                |
| Default     | 10                                   |
| Effective   | Restart required.                    |

- config_node_ratis_initial_sleep_time_ms

| Name        | config_node_ratis_initial_sleep_time_ms    |
| ----------- | ------------------------------------------ |
| Description | confignode ratis client initial sleep time |
| Type        | int32                                      |
| Default     | 100ms                                      |
| Effective   | Restart required.                          |

- config_node_ratis_max_sleep_time_ms

| Name        | config_node_ratis_max_sleep_time_ms          |
| ----------- | -------------------------------------------- |
| Description | confignode ratis client max retry sleep time |
| Type        | int32                                        |
| Default     | 10000                                        |
| Effective   | Restart required.                            |

- schema_region_ratis_max_retry_attempts

| Name        | schema_region_ratis_max_retry_attempts     |
| ----------- | ------------------------------------------ |
| Description | schema region ratis client max retry times |
| Type        | int32                                      |
| Default     | 10                                         |
| Effective   | Restart required.                          |

- schema_region_ratis_initial_sleep_time_ms

| Name        | schema_region_ratis_initial_sleep_time_ms  |
| ----------- | ------------------------------------------ |
| Description | schema region ratis client init sleep time |
| Type        | int32                                      |
| Default     | 100ms                                      |
| Effective   | Restart required.                          |

- schema_region_ratis_max_sleep_time_ms

| Name        | schema_region_ratis_max_sleep_time_ms     |
| ----------- | ----------------------------------------- |
| Description | schema region ratis client max sleep time |
| Type        | int32                                     |
| Default     | 1000                                      |
| Effective   | Restart required.                         |

- data_region_ratis_max_retry_attempts

| Name        | data_region_ratis_max_retry_attempts          |
| ----------- | --------------------------------------------- |
| Description | data region ratis client max retry sleep time |
| Type        | int32                                         |
| Default     | 10                                            |
| Effective   | Restart required.                             |

- data_region_ratis_initial_sleep_time_ms

| Name        | data_region_ratis_initial_sleep_time_ms  |
| ----------- | ---------------------------------------- |
| Description | data region ratis client init sleep time |
| Type        | int32                                    |
| Default     | 100ms                                    |
| Effective   | Restart required.                        |

- data_region_ratis_max_sleep_time_ms

| Name        | data_region_ratis_max_sleep_time_ms           |
| ----------- | --------------------------------------------- |
| Description | data region ratis client max retry sleep time |
| Type        | int32                                         |
| Default     | 1000                                          |
| Effective   | Restart required.                             |

- ratis_first_election_timeout_min_ms

| Name        | ratis_first_election_timeout_min_ms |
| ----------- | ----------------------------------- |
| Description | Ratis first election min timeout    |
| Type        | int64                               |
| Default     | 50 (ms)                             |
| Effective   | Restart required.                   |

- ratis_first_election_timeout_max_ms

| Name        | ratis_first_election_timeout_max_ms |
| ----------- | ----------------------------------- |
| Description | Ratis first election max timeout    |
| Type        | int64                               |
| Default     | 150 (ms)                            |
| Effective   | Restart required.                   |

- config_node_ratis_preserve_logs_num_when_purge

| Name        | config_node_ratis_preserve_logs_num_when_purge               |
| ----------- | ------------------------------------------------------------ |
| Description | confignode snapshot preserves certain logs when taking snapshot and purge |
| Type        | int32                                                        |
| Default     | 1000                                                         |
| Effective   | Restart required.                                            |

- schema_region_ratis_preserve_logs_num_when_purge

| Name        | schema_region_ratis_preserve_logs_num_when_purge             |
| ----------- | ------------------------------------------------------------ |
| Description | schema region snapshot preserves certain logs when taking snapshot and purge |
| Type        | int32                                                        |
| Default     | 1000                                                         |
| Effective   | Restart required.                                            |

- data_region_ratis_preserve_logs_num_when_purge

| Name        | data_region_ratis_preserve_logs_num_when_purge               |
| ----------- | ------------------------------------------------------------ |
| Description | data region snapshot preserves certain logs when taking snapshot and purge |
| Type        | int32                                                        |
| Default     | 1000                                                         |
| Effective   | Restart required.                                            |

- config_node_ratis_log_max_size

| Name        | config_node_ratis_log_max_size         |
| ----------- | -------------------------------------- |
| Description | config node Raft Log disk size control |
| Type        | int64                                  |
| Default     | 2147483648 (2GB)                       |
| Effective   | Restart required.                      |

- schema_region_ratis_log_max_size

| Name        | schema_region_ratis_log_max_size         |
| ----------- | ---------------------------------------- |
| Description | schema region Raft Log disk size control |
| Type        | int64                                    |
| Default     | 2147483648 (2GB)                         |
| Effective   | Restart required.                        |

- data_region_ratis_log_max_size

| Name        | data_region_ratis_log_max_size         |
| ----------- | -------------------------------------- |
| Description | data region Raft Log disk size control |
| Type        | int64                                  |
| Default     | 21474836480 (20GB)                     |
| Effective   | Restart required.                      |

- config_node_ratis_periodic_snapshot_interval

| Name        | config_node_ratis_periodic_snapshot_interval |
| ----------- | -------------------------------------------- |
| Description | config node Raft periodic snapshot interval  |
| Type        | int64                                        |
| Default     | 86400 (s)                                    |
| Effective   | Restart required.                            |

- schema_region_ratis_periodic_snapshot_interval

| Name        | schema_region_ratis_preserve_logs_num_when_purge |
| ----------- | ------------------------------------------------ |
| Description | schema region Raft periodic snapshot interval    |
| Type        | int64                                            |
| Default     | 86400 (s)                                        |
| Effective   | Restart required.                                |

- data_region_ratis_periodic_snapshot_interval

| Name        | data_region_ratis_preserve_logs_num_when_purge |
| ----------- | ---------------------------------------------- |
| Description | data region Raft periodic snapshot interval    |
| Type        | int64                                          |
| Default     | 86400 (s)                                      |
| Effective   | Restart required.                              |

### 4.31 IoTConsensusV2 Configuration

- iot_consensus_v2_pipeline_size

| Name        | iot_consensus_v2_pipeline_size                               |
| ----------- | ------------------------------------------------------------ |
| Description | Default event buffer size for connector and receiver in iot consensus v2 |
| Type        | int                                                          |
| Default     | 5                                                            |
| Effective   | Restart required.                                            |

- iot_consensus_v2_mode

| Name        | iot_consensus_v2_pipeline_size |
| ----------- | ------------------------------ |
| Description | IoTConsensusV2 mode.           |
| Type        | String                         |
| Default     | batch                          |
| Effective   | Restart required.              |

### 4.32 Procedure Configuration

- procedure_core_worker_thread_count

| Name        | procedure_core_worker_thread_count    |
| ----------- | ------------------------------------- |
| Description | Default number of worker thread count |
| Type        | int32                                 |
| Default     | 4                                     |
| Effective   | Restart required.                     |

- procedure_completed_clean_interval

| Name        | procedure_completed_clean_interval                           |
| ----------- | ------------------------------------------------------------ |
| Description | Default time interval of completed procedure cleaner work in, time unit is second |
| Type        | int32                                                        |
| Default     | 30(s)                                                        |
| Effective   | Restart required.                                            |

- procedure_completed_evict_ttl

| Name        | procedure_completed_evict_ttl                           |
| ----------- | ------------------------------------------------------- |
| Description | Default ttl of completed procedure, time unit is second |
| Type        | int32                                                   |
| Default     | 60(s)                                                   |
| Effective   | Restart required.                                       |

### 4.33 MQTT Broker Configuration

- enable_mqtt_service

| Name        | enable_mqtt_service。               |
| ----------- | ----------------------------------- |
| Description | whether to enable the mqtt service. |
| Type        | Boolean                             |
| Default     | false                               |
| Effective   | Hot reload                          |

- mqtt_host

| Name        | mqtt_host                      |
| ----------- | ------------------------------ |
| Description | the mqtt service binding host. |
| Type        | String                         |
| Default     | 127.0.0.1                      |
| Effective   | Hot reload                     |

- mqtt_port

| Name        | mqtt_port                      |
| ----------- | ------------------------------ |
| Description | the mqtt service binding port. |
| Type        | int32                          |
| Default     | 1883                           |
| Effective   | Hot reload                     |

- mqtt_handler_pool_size

| Name        | mqtt_handler_pool_size                               |
| ----------- | ---------------------------------------------------- |
| Description | the handler pool size for handing the mqtt messages. |
| Type        | int32                                                |
| Default     | 1                                                    |
| Effective   | Hot reload                                           |

- mqtt_payload_formatter

| Name        | mqtt_payload_formatter              |
| ----------- | ----------------------------------- |
| Description | the mqtt message payload formatter. |
| Type        | String                              |
| Default     | json                                |
| Effective   | Hot reload                          |

- mqtt_max_message_size

| Name        | mqtt_max_message_size              |
| ----------- | ---------------------------------- |
| Description | max length of mqtt message in byte |
| Type        | int32                              |
| Default     | 1048576                            |
| Effective   | Hot reload                         |

### 4.34 Audit log Configuration

- enable_audit_log

| Name        | enable_audit_log                 |
| ----------- | -------------------------------- |
| Description | whether to enable the audit log. |
| Type        | Boolean                          |
| Default     | false                            |
| Effective   | Restart required.                |

- audit_log_storage

| Name        | audit_log_storage             |
| ----------- | ----------------------------- |
| Description | Output location of audit logs |
| Type        | String                        |
| Default     | IOTDB,LOGGER                  |
| Effective   | Restart required.             |

- audit_log_operation

| Name        | audit_log_operation                                          |
| ----------- | ------------------------------------------------------------ |
| Description | whether enable audit log for DML operation of datawhether enable audit log for DDL operation of schemawhether enable audit log for QUERY operation of data and schema |
| Type        | String                                                       |
| Default     | DML,DDL,QUERY                                                |
| Effective   | Restart required.                                            |

- enable_audit_log_for_native_insert_api

| Name        | enable_audit_log_for_native_insert_api         |
| ----------- | ---------------------------------------------- |
| Description | whether the local write api records audit logs |
| Type        | Boolean                                        |
| Default     | true                                           |
| Effective   | Restart required.                              |

### 4.35 White List Configuration

- enable_white_list

| Name        | enable_white_list         |
| ----------- | ------------------------- |
| Description | whether enable white list |
| Type        | Boolean                   |
| Default     | false                     |
| Effective   | Hot reload                |

### 4.36 IoTDB-AI Configuration

- model_inference_execution_thread_count

| Name        | model_inference_execution_thread_count                       |
| ----------- | ------------------------------------------------------------ |
| Description | The thread count which can be used for model inference operation. |
| Type        | int                                                          |
| Default     | 5                                                            |
| Effective   | Restart required.                                            |

### 4.37 Load TsFile Configuration

- load_clean_up_task_execution_delay_time_seconds

| Name        | load_clean_up_task_execution_delay_time_seconds              |
| ----------- | ------------------------------------------------------------ |
| Description | Load clean up task is used to clean up the unsuccessful loaded tsfile after a certain period of time. |
| Type        | int                                                          |
| Default     | 1800                                                         |
| Effective   | Hot reload                                                   |

- load_write_throughput_bytes_per_second

| Name        | load_write_throughput_bytes_per_second                       |
| ----------- | ------------------------------------------------------------ |
| Description | The maximum bytes per second of disk write throughput when loading tsfile. |
| Type        | int                                                          |
| Default     | -1                                                           |
| Effective   | Hot reload                                                   |

- load_active_listening_enable

| Name        | load_active_listening_enable                                 |
| ----------- | ------------------------------------------------------------ |
| Description | Whether to enable the active listening mode for tsfile loading. |
| Type        | Boolean                                                      |
| Default     | true                                                         |
| Effective   | Hot reload                                                   |

- load_active_listening_dirs

| Name        | load_active_listening_dirs                                   |
| ----------- | ------------------------------------------------------------ |
| Description | The directory to be actively listened for tsfile loading.Multiple directories should be separated by a ','. |
| Type        | String                                                       |
| Default     | ext/load/pending                                             |
| Effective   | Hot reload                                                   |

- load_active_listening_fail_dir

| Name        | load_active_listening_fail_dir                               |
| ----------- | ------------------------------------------------------------ |
| Description | The directory where tsfiles are moved if the active listening mode fails to load them. |
| Type        | String                                                       |
| Default     | ext/load/failed                                              |
| Effective   | Hot reload                                                   |

- load_active_listening_max_thread_num

| Name        | load_active_listening_max_thread_num                         |
| ----------- | ------------------------------------------------------------ |
| Description | The maximum number of threads that can be used to load tsfile actively.The default value, when this parameter is commented out or <= 0, use CPU core number. |
| Type        | Long                                                         |
| Default     | 0                                                            |
| Effective   | Restart required.                                            |

- load_active_listening_check_interval_seconds

| Name        | load_active_listening_check_interval_seconds                 |
| ----------- | ------------------------------------------------------------ |
| Description | The interval specified in seconds for the active listening mode to check the directory specified in `load_active_listening_dirs`.The active listening mode will check the directory every `load_active_listening_check_interval_seconds seconds`. |
| Type        | Long                                                         |
| Default     | 5                                                            |
| Effective   | Restart required.                                            |

* last_cache_operation_on_load

|Name| last_cache_operation_on_load                                                                                                                                                                                                                                                                                                              |
|:---:|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|Description| The operation performed to LastCache when a TsFile is successfully loaded. `UPDATE`: use the data in the TsFile to update LastCache; `UPDATE_NO_BLOB`: similar to UPDATE, but will invalidate LastCache for blob series; `CLEAN_DEVICE`: invalidate LastCache of devices contained in the TsFile; `CLEAN_ALL`: clean the whole LastCache. |
|Type| String                                                                                                                                                                                                                                                                                                                                    |
|Default| UPDATE_NO_BLOB                                                                                                                                                                                                                                                                                                                            |
|Effective| Effective after restart                                                                                                                                                                                                                                                                                                                   |

* cache_last_values_for_load

|Name| cache_last_values_for_load                                                                                                                                                                                                                                                                                                                |
|:---:|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|Description| Whether to cache last values before loading a TsFile. Only effective when `last_cache_operation_on_load=UPDATE_NO_BLOB` or `last_cache_operation_on_load=UPDATE`. When set to true, blob series will be ignored even with `last_cache_operation_on_load=UPDATE`. Enabling this will increase the memory footprint during loading TsFiles. |
|Type| Boolean                                                                                                                                                                                                                                                                                                                                   |
|Default| true                                                                                                                                                                                                                                                                                                                                      |
|Effective| Effective after restart                                                                                                                                                                                                                                                                                                                   |

* cache_last_values_memory_budget_in_byte

|Name| cache_last_values_memory_budget_in_byte                                                                                                                                                                                              |
|:---:|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|Description| When `cache_last_values_for_load=true`, the maximum memory that can be used to cache last values. If this value is exceeded, the cached values will be abandoned and last values will be read from the TsFile in a streaming manner. |
|Type| int32                                                                                                                                                                                                                                |
|Default| 4194304                                                                                                                                                                                                                              |
|Effective| Effective after restart                                                                                                                                                                                                              |


### 4.38 Dispatch Retry Configuration

- enable_retry_for_unknown_error

| Name        | enable_retry_for_unknown_error                               |
| ----------- | ------------------------------------------------------------ |
| Description | The maximum retrying time for write request remotely dispatching, time unit is milliseconds. |
| Type        | Long                                                         |
| Default     | 60000                                                        |
| Effective   | Hot reload                                                   |

- enable_retry_for_unknown_error

| Name        | enable_retry_for_unknown_error       |
| ----------- | ------------------------------------ |
| Description | Whether retrying for unknown errors. |
| Type        | boolean                              |
| Default     | false                                |
| Effective   | Hot reload                           |