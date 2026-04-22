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
# Maintenance Statement

## 1. Status Checking

### 1.1 Viewing the Connected Model

**Description**: Returns the current SQL dialect model (`Tree` or `Table`).

**Syntax**:

```SQL
showCurrentSqlDialectStatement
    : SHOW CURRENT_SQL_DIALECT
    ;
```

**Example**:

```SQL
IoTDB> SHOW CURRENT_SQL_DIALECT;
```

**Result：**

```SQL
+-----------------+
|CurrentSqlDialect|
+-----------------+
|            TABLE|
+-----------------+
```

### 1.2 Viewing the Logged-in Username

**Description**: Returns the currently logged-in username.

**Syntax**:

```SQL
showCurrentUserStatement
    : SHOW CURRENT_USER
    ;
```

**Example**:

```SQL
IoTDB> SHOW CURRENT_USER;
```

**Result**:

```Plain
+-----------+
|CurrentUser|
+-----------+
|       root|
+-----------+
```

### 1.3 Viewing the Connected Database Name

**Description**: Returns the name of the currently connected database. If no `USE` statement has been executed, it returns `null`.

**Syntax**:

```SQL
showCurrentDatabaseStatement
    : SHOW CURRENT_DATABASE
    ;
```

**Example**:

```SQL
IoTDB> SHOW CURRENT_DATABASE;
IoTDB> USE test;
IoTDB> SHOW CURRENT_DATABASE;
```

**Result**:

```Plain
+---------------+
|CurrentDatabase|
+---------------+
|           null|
+---------------+
+---------------+
|CurrentDatabase|
+---------------+
|           test|
+---------------+
```

### 1.4 Viewing the Cluster Version

**Description**: Returns the current cluster version.

**Syntax**:

```SQL
showVersionStatement
    : SHOW VERSION
    ;
```

**Example**:

```SQL
IoTDB> SHOW VERSION;
```

**Result**:

```Plain
+-------+---------+
|Version|BuildInfo|
+-------+---------+
|2.0.1.2|  1ca4008|
+-------+---------+
```

### 1.5 Viewing Cluster Key Parameters

**Description**: Returns key parameters of the current cluster.

**Syntax**:

```SQL
showVariablesStatement
    : SHOW VARIABLES
    ;
```

Key Parameters:

1. **ClusterName**: The name of the current cluster.
2. **DataReplicationFactor**: Number of data replicas per DataRegion.
3. **SchemaReplicationFactor**: Number of schema replicas per SchemaRegion.
4. **DataRegionConsensusProtocolClass**: Consensus protocol class for DataRegions.
5. **SchemaRegionConsensusProtocolClass**: Consensus protocol class for SchemaRegions.
6. **ConfigNodeConsensusProtocolClass**: Consensus protocol class for ConfigNodes.
7. **TimePartitionOrigin**: The starting timestamp of database time partitions.
8. **TimePartitionInterval**: The interval of database time partitions (in milliseconds).
9. **ReadConsistencyLevel**: The consistency level for read operations.
10. **SchemaRegionPerDataNode**: Number of SchemaRegions per DataNode.
11. **DataRegionPerDataNode**: Number of DataRegions per DataNode.
12. **SeriesSlotNum**: Number of SeriesSlots per DataRegion.
13. **SeriesSlotExecutorClass**: Implementation class for SeriesSlots.
14. **DiskSpaceWarningThreshold**: Disk space warning threshold (in percentage).
15. **TimestampPrecision**: Timestamp precision.

**Example**:

```SQL
IoTDB> SHOW VARIABLES;
```

**Result**:

```Plain
+----------------------------------+-----------------------------------------------------------------+
|                          Variable|                                                            Value|
+----------------------------------+-----------------------------------------------------------------+
|                       ClusterName|                                                   defaultCluster|
|             DataReplicationFactor|                                                                1|
|           SchemaReplicationFactor|                                                                1|
|  DataRegionConsensusProtocolClass|                      org.apache.iotdb.consensus.iot.IoTConsensus|
|SchemaRegionConsensusProtocolClass|                  org.apache.iotdb.consensus.ratis.RatisConsensus|
|  ConfigNodeConsensusProtocolClass|                  org.apache.iotdb.consensus.ratis.RatisConsensus|
|               TimePartitionOrigin|                                                                0|
|             TimePartitionInterval|                                                        604800000|
|              ReadConsistencyLevel|                                                           strong|
|           SchemaRegionPerDataNode|                                                                1|
|             DataRegionPerDataNode|                                                                0|
|                     SeriesSlotNum|                                                             1000|
|           SeriesSlotExecutorClass|org.apache.iotdb.commons.partition.executor.hash.BKDRHashExecutor|
|         DiskSpaceWarningThreshold|                                                             0.05|
|                TimestampPrecision|                                                               ms|
+----------------------------------+-----------------------------------------------------------------+
```

### 1.6 Viewing the Cluster ID

**Description**: Returns the ID of the current cluster.

**Syntax**:

```SQL
showClusterIdStatement
    : SHOW (CLUSTERID | CLUSTER_ID)
    ;
```

**Example**:

```SQL
IoTDB> SHOW CLUSTER_ID;
```

**Result**:

```Plain
+------------------------------------+
|                           ClusterId|
+------------------------------------+
|40163007-9ec1-4455-aa36-8055d740fcda|
+------------------------------------+
```

### 1.7 Viewing the Timestamp of the Connected DataNode

**Description**: Returns the current timestamp of the DataNode process directly connected to the client.

**Syntax**:

```SQL
showCurrentTimestampStatement
    : SHOW CURRENT_TIMESTAMP
    ;
```

**Example**:

```SQL
IoTDB> SHOW CURRENT_TIMESTAMP;
```

**Result**:

```Plain
+-----------------------------+
|             CurrentTimestamp|
+-----------------------------+
|2025-02-17T11:11:52.987+08:00|
+-----------------------------+
```

### 1.8 Viewing Executing Queries

**Description**: Displays information about all currently executing queries.

> For more details on how to use system tables, please refer to [System Tables](../Reference/System-Tables_timecho.md)

**Syntax**:

```SQL
showQueriesStatement
    : SHOW (QUERIES | QUERY PROCESSLIST)
        (WHERE where=booleanExpression)?
        (ORDER BY sortItem (',' sortItem)*)?
        limitOffsetClause
    ;
```

**Parameters**:

1. **WHERE Clause**: Filters the result set based on specified conditions.
2. **ORDER BY Clause**: Sorts the result set based on specified columns.
3. **limitOffsetClause**: Limits the number of rows returned.
    1. Format: `LIMIT <offset>, <row_count>`.

**Columns in QUERIES Table**:

- **query_id**: Unique ID of the query.
- **start_time**: Timestamp when the query started.
- **datanode_id**: ID of the DataNode executing the query.
- **elapsed_time**: Time elapsed since the query started (in seconds).
- **statement**: The SQL statement being executed.
- **user**: The user who initiated the query.

**Example**:

```SQL
IoTDB> SHOW QUERIES WHERE elapsed_time > 30;
```

**Result**:

```Plain
+-----------------------+-----------------------------+-----------+------------+------------+----+
|               query_id|                   start_time|datanode_id|elapsed_time|   statement|user|
+-----------------------+-----------------------------+-----------+------------+------------+----+
|20250108_101015_00000_1|2025-01-08T18:10:15.935+08:00|          1|      32.283|show queries|root|
+-----------------------+-----------------------------+-----------+------------+------------+----+
```


### 1.9 Viewing Region Information

**Description**: Displays regions' information of the current cluster.

**Syntax**:

```SQL
showRegionsStatement
    : SHOW REGIONS
    ;
```

**Example**:

```SQL
IoTDB> SHOW REGIONS
```

**Result**:

```SQL
+--------+------------+-------+----------+-------------+-----------+----------+----------+-------+---------------+------+-----------------------+----------+
|RegionId|        Type| Status|  Database|SeriesSlotNum|TimeSlotNum|DataNodeId|RpcAddress|RpcPort|InternalAddress|  Role|             CreateTime|TsFileSize|
+--------+------------+-------+----------+-------------+-----------+----------+----------+-------+---------------+------+-----------------------+----------+
|       6|SchemaRegion|Running|tcollector|          670|          0|         1|   0.0.0.0|   6667|      127.0.0.1|Leader|2025-08-01T17:37:01.194|          |
|       7|  DataRegion|Running|tcollector|          335|        335|         1|   0.0.0.0|   6667|      127.0.0.1|Leader|2025-08-01T17:37:01.196| 169.85 KB|
|       8|  DataRegion|Running|tcollector|          335|        335|         1|   0.0.0.0|   6667|      127.0.0.1|Leader|2025-08-01T17:37:01.198| 161.63 KB|
+--------+------------+-------+----------+-------------+-----------+----------+----------+-------+---------------+------+-----------------------+----------+
```

### 1.10 Viewing Available Nodes

**Description**: Returns the RPC addresses and ports of all available DataNodes in the current cluster. Note: A DataNode is considered "available" if it is not in the REMOVING state.

> This feature is supported starting from v2.0.8.

**Syntax**:

```SQL
showAvailableUrlsStatement
    : SHOW AVAILABLE URLS
    ;
```

**Example**:

```SQL
IoTDB> SHOW AVAILABLE URLS
```

**Result**:

```SQL
+----------+-------+
|RpcAddress|RpcPort|
+----------+-------+
|   0.0.0.0|   6667|
+----------+-------+
```

### 1.11 View Service Information

**Description**: Returns service information (MQTT service, REST service) on all active DataNodes (in RUNNING or READ-ONLY state) in the current cluster.

> Supported since V2.0.8.2

#### Syntax:
```sql
showServicesStatement
    : SHOW SERVICES <ON dataNodeId>
    ;
```

#### Examples:
```sql
IoTDB> SHOW SERVICES
IoTDB> SHOW SERVICES ON 1
```

Execution result:
```sql
+--------------+-------------+---------+
| Service Name | DataNode ID | State   |
+--------------+-------------+---------+
| MQTT         | 1           | STOPPED |
| REST         | 1           | RUNNING |
+--------------+-------------+---------+
```

### 1.13 View Node Configuration
**Description**: By default, returns the effective configuration items from the configuration file of the specified node (identified by `node_id`). If `node_id` is not specified, returns the configuration of the directly connected DataNode.
Adding the `all` parameter returns all configuration items (the `value` of unconfigured items is `null`).
Adding the `with desc` parameter returns configuration items with descriptions.

> Supported since version 2.0.9

#### Syntax:
```SQL
showConfigurationStatement
    : SHOW (ALL)? CONFIGURATION (ON nodeId=INTEGER_VALUE)? (WITH DESC)?
    ;
```

#### Result Set Description
| Column Name   | Column Type | Description                     |
|---------------|-------------|---------------------------------|
| name          | string      | Configuration name              |
| value         | string      | Configuration value             |
| default_value | string      | Default value of the configuration |
| description   | string      | Configuration description (optional) |

#### Examples:
1. View configuration of the directly connected DataNode
```SQL
SHOW CONFIGURATION;
```

```Bash
+--------------------------------------+-----------------------------------------------------------------+-----------------------------------------------------------------+
|                                  name|                                                            value|                                                    default_value|
+--------------------------------------+-----------------------------------------------------------------+-----------------------------------------------------------------+
|                          cluster_name|                                                   defaultCluster|                                                   defaultCluster|
|                   cn_seed_config_node|                                                  127.0.0.1:10710|                                                  127.0.0.1:10710|
|                   dn_seed_config_node|                                                  127.0.0.1:10710|                                                  127.0.0.1:10710|
|                   cn_internal_address|                                                        127.0.0.1|                                                        127.0.0.1|
|                      cn_internal_port|                                                            10710|                                                            10710|
|                     cn_consensus_port|                                                            10720|                                                            10720|
|                        dn_rpc_address|                                                          0.0.0.0|                                                          0.0.0.0|
|                           dn_rpc_port|                                                             6667|                                                             6667|
|                   dn_internal_address|                                                        127.0.0.1|                                                        127.0.0.1|
|                      dn_internal_port|                                                            10730|                                                            10730|
|             dn_mpp_data_exchange_port|                                                            10740|                                                            10740|
|       dn_schema_region_consensus_port|                                                            10750|                                                            10750|
|         dn_data_region_consensus_port|                                                            10760|                                                            10760|
|             schema_replication_factor|                                                                1|                                                                1|
|schema_region_consensus_protocol_class|                  org.apache.iotdb.consensus.ratis.RatisConsensus|                  org.apache.iotdb.consensus.ratis.RatisConsensus|
|               data_replication_factor|                                                                1|                                                                1|
|  data_region_consensus_protocol_class|                      org.apache.iotdb.consensus.iot.IoTConsensus|                      org.apache.iotdb.consensus.iot.IoTConsensus|
|    cn_metric_prometheus_reporter_port|                                                             9091|                                                             9091|
|    dn_metric_prometheus_reporter_port|                                                             9092|                                                             9092|
|                       series_slot_num|                                                             1000|                                                             1000|
|       series_partition_executor_class|org.apache.iotdb.commons.partition.executor.hash.BKDRHashExecutor|org.apache.iotdb.commons.partition.executor.hash.BKDRHashExecutor|
|                 time_partition_origin|                                                                0|                                                                0|
|               time_partition_interval|                                                        604800000|                                                        604800000|
|          disk_space_warning_threshold|                                                             0.05|                                                             0.05|
|                    schema_engine_mode|                                                           Memory|                                                           Memory|
|              tag_attribute_total_size|                                                              700|                                                              700|
|                read_consistency_level|                                                           strong|                                                           strong|
|                   timestamp_precision|                                                               ms|                                                               ms|
+--------------------------------------+-----------------------------------------------------------------+-----------------------------------------------------------------+
Total line number = 28
It costs 0.013s
```

2. View configuration of the node with a specific node ID
```SQL
SHOW CONFIGURATION ON 1;
```

```Bash
+--------------------------------------+-----------------------------------------------------------------+-----------------------------------------------------------------+
|                                  name|                                                            value|                                                    default_value|
+--------------------------------------+-----------------------------------------------------------------+-----------------------------------------------------------------+
|                          cluster_name|                                                   defaultCluster|                                                   defaultCluster|
|                   cn_seed_config_node|                                                  127.0.0.1:10710|                                                  127.0.0.1:10710|
|                   dn_seed_config_node|                                                  127.0.0.1:10710|                                                  127.0.0.1:10710|
|                   cn_internal_address|                                                        127.0.0.1|                                                        127.0.0.1|
|                      cn_internal_port|                                                            10710|                                                            10710|
|                     cn_consensus_port|                                                            10720|                                                            10720|
|                        dn_rpc_address|                                                          0.0.0.0|                                                          0.0.0.0|
|                           dn_rpc_port|                                                             6667|                                                             6667|
|                   dn_internal_address|                                                        127.0.0.1|                                                        127.0.0.1|
|                      dn_internal_port|                                                            10730|                                                            10730|
|             dn_mpp_data_exchange_port|                                                            10740|                                                            10740|
|       dn_schema_region_consensus_port|                                                            10750|                                                            10750|
|         dn_data_region_consensus_port|                                                            10760|                                                            10760|
|             schema_replication_factor|                                                                1|                                                                1|
|schema_region_consensus_protocol_class|                  org.apache.iotdb.consensus.ratis.RatisConsensus|                  org.apache.iotdb.consensus.ratis.RatisConsensus|
|               data_replication_factor|                                                                1|                                                                1|
|  data_region_consensus_protocol_class|                      org.apache.iotdb.consensus.iot.IoTConsensus|                      org.apache.iotdb.consensus.iot.IoTConsensus|
|    cn_metric_prometheus_reporter_port|                                                             9091|                                                             9091|
|    dn_metric_prometheus_reporter_port|                                                             9092|                                                             9092|
|                       series_slot_num|                                                             1000|                                                             1000|
|       series_partition_executor_class|org.apache.iotdb.commons.partition.executor.hash.BKDRHashExecutor|org.apache.iotdb.commons.partition.executor.hash.BKDRHashExecutor|
|                 time_partition_origin|                                                                0|                                                                0|
|               time_partition_interval|                                                        604800000|                                                        604800000|
|          disk_space_warning_threshold|                                                             0.05|                                                             0.05|
|                    schema_engine_mode|                                                           Memory|                                                           Memory|
|              tag_attribute_total_size|                                                              700|                                                              700|
|                read_consistency_level|                                                           strong|                                                           strong|
|                   timestamp_precision|                                                               ms|                                                               ms|
+--------------------------------------+-----------------------------------------------------------------+-----------------------------------------------------------------+
Total line number = 28
It costs 0.004s
```

3. View all configurations
```SQL
SHOW ALL CONFIGURATION;
```

```Bash
+---------------------------------------------------------+-----------------------------------------------------------------+-----------------------------------------------------------------+
|                                                     name|                                                            value|                                                    default_value|
+---------------------------------------------------------+-----------------------------------------------------------------+-----------------------------------------------------------------+
|                                             cluster_name|                                                   defaultCluster|                                                   defaultCluster|
|                                      cn_seed_config_node|                                                  127.0.0.1:10710|                                                  127.0.0.1:10710|
|                                      dn_seed_config_node|                                                  127.0.0.1:10710|                                                  127.0.0.1:10710|
|                                      cn_internal_address|                                                        127.0.0.1|                                                        127.0.0.1|
|                                         cn_internal_port|                                                            10710|                                                            10710|
|                                        cn_consensus_port|                                                            10720|                                                            10720|
|                                           dn_rpc_address|                                                          0.0.0.0|                                                          0.0.0.0|
|                                              dn_rpc_port|                                                             6667|                                                             6667|
|                                      dn_internal_address|                                                        127.0.0.1|                                                        127.0.0.1|
|                                         dn_internal_port|                                                            10730|                                                            10730|
|                                dn_mpp_data_exchange_port|                                                            10740|                                                            10740|
|                          dn_schema_region_consensus_port|                                                            10750|                                                            10750|
|                            dn_data_region_consensus_port|                                                            10760|                                                            10760|
|                        dn_join_cluster_retry_interval_ms|                                                             null|                                                             5000|
|                     config_node_consensus_protocol_class|                                                             null|                  org.apache.iotdb.consensus.ratis.RatisConsensus|
|                                schema_replication_factor|                                                                1|                                                                1|
|                   schema_region_consensus_protocol_class|                  org.apache.iotdb.consensus.ratis.RatisConsensus|                  org.apache.iotdb.consensus.ratis.RatisConsensus|
|                                  data_replication_factor|                                                                1|                                                                1|
|                     data_region_consensus_protocol_class|                      org.apache.iotdb.consensus.iot.IoTConsensus|                      org.apache.iotdb.consensus.iot.IoTConsensus|
|                                            cn_system_dir|                                                             null|                                           data/confignode/system|
|                                         cn_consensus_dir|                                                             null|                                        data/confignode/consensus|
|                                cn_pipe_receiver_file_dir|                                                             null|                             data/confignode/system/pipe/receiver|
...
+---------------------------------------------------------+-----------------------------------------------------------------+-----------------------------------------------------------------+
Total line number = 412
It costs 0.006s
```

4. View configuration items with descriptions
```SQL
SHOW CONFIGURATION ON 1 WITH DESC;
```

```Bash
+--------------------------------------+-----------------------------------------------------------------+-----------------------------------------------------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
|                                  name|                                                            value|                                                    default_value|                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              description|
+--------------------------------------+-----------------------------------------------------------------+-----------------------------------------------------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
|                          cluster_name|                                                   defaultCluster|                                                   defaultCluster|                                                                                                                                                                                                                                                     Used for indicate cluster name and distinguish different cluster. If you need to modify the cluster name, it's recommended to use 'set configuration "cluster_name=xxx"' sql. Manually modifying configuration file is not recommended, which may cause node restart fail.effectiveMode: hot_reload.Datatype: string|
|                   cn_seed_config_node|                                                  127.0.0.1:10710|                                                  127.0.0.1:10710|For the first ConfigNode to start, cn_seed_config_node points to its own cn_internal_address:cn_internal_port. For other ConfigNodes that to join the cluster, cn_seed_config_node points to any running ConfigNode's cn_internal_address:cn_internal_port. Note: After this ConfigNode successfully joins the cluster for the first time, this parameter is no longer used. Each node automatically maintains the list of ConfigNodes and traverses connections when restarting. Format: address:port   e.g. 127.0.0.1:10710.effectiveMode: first_start.Datatype: String|
|                   dn_seed_config_node|                                                  127.0.0.1:10710|                                                  127.0.0.1:10710|                                                                                                                                                                 dn_seed_config_node points to any running ConfigNode's cn_internal_address:cn_internal_port. Note: After this DataNode successfully joins the cluster for the first time, this parameter is no longer used. Each node automatically maintains the list of ConfigNodes and traverses connections when restarting. Format: address:port   e.g. 127.0.0.1:10710.effectiveMode: first_start.Datatype: String|
|                   cn_internal_address|                                                        127.0.0.1|                                                        127.0.0.1|                                                                                                                                                                                                                                                                                                                                                                                                                               Used for RPC communication inside cluster. Could set 127.0.0.1(for local test) or ipv4 address.effectiveMode: first_start.Datatype: String|
|                      cn_internal_port|                                                            10710|                                                            10710|                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       Used for RPC communication inside cluster.effectiveMode: first_start.Datatype: int|
|                     cn_consensus_port|                                                            10720|                                                            10720|                                                                                                                                                                                                                                                                                                                                                                                                                                                               Used for consensus communication among ConfigNodes inside cluster.effectiveMode: first_start.Datatype: int|
|                        dn_rpc_address|                                                          0.0.0.0|                                                          0.0.0.0|                                                                                                                                                                                                                                                                                                                                                                                                                         Used for connection of IoTDB native clients(Session) Could set 127.0.0.1(for local test) or ipv4 address.effectiveMode: restart.Datatype: String|
|                           dn_rpc_port|                                                             6667|                                                             6667|                                                                                                                                                                                                                                                                                                                                                                                                                                                       Used for connection of IoTDB native clients(Session) Bind with dn_rpc_address.effectiveMode: restart.Datatype: int|
|                   dn_internal_address|                                                        127.0.0.1|                                                        127.0.0.1|                                                                                                                                                                                                                                                                                                                                                                                                                                   Used for communication inside cluster. could set 127.0.0.1(for local test) or ipv4 address.effectiveMode: first_start.Datatype: String|
|                      dn_internal_port|                                                            10730|                                                            10730|                                                                                                                                                                                                                                                                                                                                                                                                                                                            Used for communication inside cluster. Bind with dn_internal_address.effectiveMode: first_start.Datatype: int|
|             dn_mpp_data_exchange_port|                                                            10740|                                                            10740|                                                                                                                                                                                                                                                                                                                                                                                                                                             Port for data exchange among DataNodes inside cluster Bind with dn_internal_address.effectiveMode: first_start.Datatype: int|
|       dn_schema_region_consensus_port|                                                            10750|                                                            10750|                                                                                                                                                                                                                                                                                                                                                                                                                              port for consensus's communication for schema region inside cluster. Bind with dn_internal_address.effectiveMode: first_start.Datatype: int|
|         dn_data_region_consensus_port|                                                            10760|                                                            10760|                                                                                                                                                                                                                                                                                                                                                                                                                                port for consensus's communication for data region inside cluster. Bind with dn_internal_address.effectiveMode: first_start.Datatype: int|
|             schema_replication_factor|                                                                1|                                                                1|                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               Default number of schema replicas.effectiveMode: first_start.Datatype: int|
|schema_region_consensus_protocol_class|                  org.apache.iotdb.consensus.ratis.RatisConsensus|                  org.apache.iotdb.consensus.ratis.RatisConsensus|                                                                                                                                                                                           SchemaRegion consensus protocol type. This parameter is unmodifiable after ConfigNode starts for the first time. These consensus protocols are currently supported: 1. org.apache.iotdb.consensus.ratis.RatisConsensus 2. org.apache.iotdb.consensus.simple.SimpleConsensus   (The schema_replication_factor can only be set to 1).effectiveMode: first_start.Datatype: string|
|               data_replication_factor|                                                                1|                                                                1|                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 Default number of data replicas.effectiveMode: first_start.Datatype: int|
|  data_region_consensus_protocol_class|                      org.apache.iotdb.consensus.iot.IoTConsensus|                      org.apache.iotdb.consensus.iot.IoTConsensus|                                                                                               DataRegion consensus protocol type. This parameter is unmodifiable after ConfigNode starts for the first time. These consensus protocols are currently supported: 1. org.apache.iotdb.consensus.simple.SimpleConsensus   (The data_replication_factor can only be set to 1) 2. org.apache.iotdb.consensus.iot.IoTConsensus 3. org.apache.iotdb.consensus.ratis.RatisConsensus 4. org.apache.iotdb.consensus.iot.IoTConsensusV2.effectiveMode: first_start.Datatype: string|
|    cn_metric_prometheus_reporter_port|                                                             9091|                                                             9091|                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    The port of prometheus reporter of metric module.effectiveMode: restart.Datatype: int|
|    dn_metric_prometheus_reporter_port|                                                             9092|                                                             9092|                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    The port of prometheus reporter of metric module.effectiveMode: restart.Datatype: int|
|                       series_slot_num|                                                             1000|                                                             1000|                                                                                                                                                                                                                                                                                                     All parameters in Partition configuration is unmodifiable after ConfigNode starts for the first time. And these parameters should be consistent within the ConfigNodeGroup. Number of SeriesPartitionSlots per Database.effectiveMode: first_start.Datatype: Integer|
|       series_partition_executor_class|org.apache.iotdb.commons.partition.executor.hash.BKDRHashExecutor|org.apache.iotdb.commons.partition.executor.hash.BKDRHashExecutor|                                                                                                                                                                     SeriesPartitionSlot executor class These hashing algorithms are currently supported: 1. BKDRHashExecutor(Default) 2. APHashExecutor 3. JSHashExecutor 4. SDBMHashExecutor Also, if you want to implement your own SeriesPartition executor, you can inherit the SeriesPartitionExecutor class and modify this parameter to correspond to your Java class.effectiveMode: first_start.Datatype: String|
|                 time_partition_origin|                                                                0|                                                                0|                                                                                                                                Time partition origin in milliseconds, default is equal to zero. This origin is set by default to the beginning of Unix time, which is January 1, 1970, at 00:00 UTC (Coordinated Universal Time). This point is known as the Unix epoch, and its timestamp is 0. If you want to specify a different time partition origin, you can set this value to a specific Unix timestamp in milliseconds.effectiveMode: first_start.Datatype: long|
|               time_partition_interval|                                                        604800000|                                                        604800000|                                                                                                                                                                                                                                                                                                                                                                                                           Time partition interval in milliseconds, and partitioning data inside each data region, default is equal to one week.effectiveMode: first_start.Datatype: long|
|          disk_space_warning_threshold|                                                             0.05|                                                             0.05|                                                                                                                                                                                                                                                                                                                                                                                                                                                 Disk remaining threshold at which DataNode is set to ReadOnly status.effectiveMode: restart.Datatype: double(percentage)|
|                    schema_engine_mode|                                                           Memory|                                                           Memory|                                                                                                                                                                                                                                                                                                                                                                                The schema management mode of schema engine. Currently, support Memory and PBTree. This config of all DataNodes in one cluster must keep same.effectiveMode: first_start.Datatype: string|
|              tag_attribute_total_size|                                                              700|                                                              700|                                                                                                                                                                                                                                                                          max size for a storage block for tags and attributes of one time series. If the combined size of tags and attributes exceeds the tag_attribute_total_size, a new storage block will be allocated to continue storing the excess data. the unit is byte.effectiveMode: first_start.Datatype: int|
|                read_consistency_level|                                                           strong|                                                           strong|                                                                                                                                                                                                                                                                                                                                                                The read consistency level These consistency levels are currently supported: 1. strong(Default, read from the leader replica) 2. weak(Read from a random replica).effectiveMode: restart.Datatype: string|
|                   timestamp_precision|                                                               ms|                                                               ms|                                                                                                                                                                                                                                                                                                                                                                                                      Use this value to set timestamp precision as "ms", "us" or "ns". Once the precision has been set, it can not be changed.effectiveMode: first_start.Datatype: String|
+--------------------------------------+-----------------------------------------------------------------+-----------------------------------------------------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
Total line number = 28
It costs 0.010s
```

## 2. Status Setting

### 2.1 Setting the Connected Model

**Description**: Sets the current SQL dialect model to `Tree` or `Table` which can be used in both tree and table models.

**Syntax**:

```SQL
SET SQL_DIALECT = (TABLE | TREE);
```

**Example**:

```SQL
IoTDB> SET SQL_DIALECT=TABLE;
IoTDB> SHOW CURRENT_SQL_DIALECT;
```

**Result**:

```SQL
+-----------------+
|CurrentSqlDialect|
+-----------------+
|            TABLE|
+-----------------+
```

### 2.2 Updating Configuration Items

**Description**: Updates configuration items. Changes take effect immediately without restarting if the items support hot modification.

**Syntax**:

```SQL
setConfigurationStatement
    : SET CONFIGURATION propertyAssignments (ON INTEGER_VALUE)?
    ;

propertyAssignments
    : property (',' property)*
    ;
    
property
    : identifier EQ propertyValue
    ;

propertyValue
    : DEFAULT
    | expression
    ;
```

**Parameters**:

1. **propertyAssignments**: A list of properties to update.
    1. Format: `property (',' property)*`.
    2. Values:
        - `DEFAULT`: Resets the configuration to its default value.
        - `expression`: A specific value (must be a string).
2. **ON INTEGER_VALUE** **(Optional):** Specifies the node ID to update.
    1. If not specified or set to a negative value, updates all ConfigNodes and DataNodes.

**Example**:

```SQL
IoTDB> SET CONFIGURATION disk_space_warning_threshold='0.05',heartbeat_interval_in_ms='1000' ON 1;
```

### 2.3 Loading Manually Modified Configuration Files

**Description**: Loads manually modified configuration files and hot-loads the changes. Configuration items that support hot modification take effect immediately.

**Syntax**:

```SQL
loadConfigurationStatement
    : LOAD CONFIGURATION localOrClusterMode?
    ;
    
localOrClusterMode
    : (ON (LOCAL | CLUSTER))
    ;
```

**Parameters**:

1. **localOrClusterMode** **(Optional):**
    1. Specifies the scope of configuration loading.
    2. Default: `CLUSTER`.
    3. Values:
        - `LOCAL`: Loads configuration only on the DataNode directly connected to the client.
        - `CLUSTER`: Loads configuration on all DataNodes in the cluster.

**Example**:

```SQL
IoTDB> LOAD CONFIGURATION ON LOCAL;
```

### 2.4 Setting the System Status

**Description**: Sets the system status to either `READONLY` or `RUNNING`.

**Syntax**:

```SQL
setSystemStatusStatement
    : SET SYSTEM TO (READONLY | RUNNING) localOrClusterMode?
    ;    
    
localOrClusterMode
    : (ON (LOCAL | CLUSTER))
    ;
```

**Parameters**:

1. **RUNNING |** **READONLY**:
    1. **RUNNING**: Sets the system to running mode, allowing both read and write operations.
    2. **READONLY**: Sets the system to read-only mode, allowing only read operations and prohibiting writes.
2. **localOrClusterMode** **(Optional):**
    1. **LOCAL**: Applies the status change only to the DataNode directly connected to the client.
    2. **CLUSTER**: Applies the status change to all DataNodes in the cluster.
    3. **Default**: `ON CLUSTER`.

**Example**:

```SQL
IoTDB> SET SYSTEM TO READONLY ON CLUSTER;
```

## 3. Data Management

### 3.1 Flushing Data from Memory to Disk

**Description**: Flushes data from the memory table to disk.

**Syntax**:

```SQL
flushStatement
    : FLUSH identifier? (',' identifier)* booleanValue? localOrClusterMode?
    ;

booleanValue
    : TRUE | FALSE
    ;

localOrClusterMode
    : (ON (LOCAL | CLUSTER))
    ;
```

**Parameters**:

1. **identifier** **(Optional):**
    1. Specifies the name of the database to flush.
    2. If not specified, all databases are flushed.
    3. **Multiple Databases**: Multiple database names can be specified, separated by commas (e.g., `FLUSH test_db1, test_db2`).
2. **booleanValue** **(****Optional****)**:
    1. Specifies the type of data to flush.
    2. **TRUE**: Flushes only the sequential memory table.
    3. **FALSE**: Flushes only the unsequential MemTable.
    4. **Default**: Flushes both sequential and unsequential memory tables.
3. **localOrClusterMode** **(****Optional****)**:
    1. **ON LOCAL**: Flushes only the memory tables on the DataNode directly connected to the client.
    2. **ON CLUSTER**: Flushes memory tables on all DataNodes in the cluster.
    3. **Default:** `ON CLUSTER`.

**Example**:

```SQL
IoTDB> FLUSH test_db TRUE ON LOCAL;
```


## 4. Data Repair

### 4.1 Starting Background Scan and Repair of TsFiles

**Description**: Starts a background task to scan and repair TsFiles, fixing issues such as timestamp disorder within data files.

**Syntax**:

```SQL
startRepairDataStatement
    : START REPAIR DATA localOrClusterMode?
    ;
    
localOrClusterMode
    : (ON (LOCAL | CLUSTER))
    ;
```

**Parameters**:

1. **localOrClusterMode（Optional）**:
    1. **ON LOCAL**: Executes the repair task only on the DataNode directly connected to the client.
    2. **ON CLUSTER**: Executes the repair task on all DataNodes in the cluster.
    3. **Default:** `ON CLUSTER`.

**Example**:

```SQL
IoTDB> START REPAIR DATA ON CLUSTER;
```

### 4.2 Pausing Background TsFile Repair Task

**Description**: Pauses the background repair task. The paused task can be resumed by executing the `START REPAIR DATA` command again.

**Syntax**:

```SQL
stopRepairDataStatement
    : STOP REPAIR DATA localOrClusterMode?
    ;
    
localOrClusterMode
    : (ON (LOCAL | CLUSTER))
    ;
```

**Parameters**:

1. **localOrClusterMode** **(Optional):**
    1. **ON LOCAL**: Executes the pause command only on the DataNode directly connected to the client.
    2. **ON CLUSTER**: Executes the pause command on all DataNodes in the cluster.
    3. **Default:** `ON CLUSTER`.

**Example**:

```SQL
IoTDB> STOP REPAIR DATA ON CLUSTER;
```

## 5. Query Termination

### 5.1 Terminating Queries

**Description**: Terminates one or more running queries.

**Syntax**:

```SQL
killQueryStatement
    : KILL (QUERY queryId=string | ALL QUERIES)
    ;
```

**Parameters**:

1. **QUERY** **queryId:** Specifies the ID of the query to terminate.

- To obtain the `queryId`, use the `SHOW QUERIES` command.

2. **ALL QUERIES:** Terminates all currently running queries.

**Example**:

Terminate a specific query:

```SQL
IoTDB> KILL QUERY 20250108_101015_00000_1;
```

Terminate all queries:

```SQL
IoTDB> KILL ALL QUERIES;
```