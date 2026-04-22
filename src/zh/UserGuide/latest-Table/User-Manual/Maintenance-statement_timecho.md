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
# 运维语句

## 1.  状态查看

### 1.1 查看连接的模型

**含义**：返回当前连接的 sql_dialect 是树模型/表模型。

#### 语法：

```SQL
showCurrentSqlDialectStatement
    : SHOW CURRENT_SQL_DIALECT
    ;
```

#### 示例：

```SQL
IoTDB> SHOW CURRENT_SQL_DIALECT
```

执行结果如下：

```SQL
+-----------------+
|CurrentSqlDialect|
+-----------------+
|            TABLE|
+-----------------+
```
### 1.2 查看登录的用户名

**含义**：返回当前登录的用户名。

#### 语法：

```SQL
showCurrentUserStatement
    : SHOW CURRENT_USER
    ;
```

#### 示例：

```SQL
IoTDB> SHOW CURRENT_USER
```

执行结果如下：

```SQL
+-----------+
|CurrentUser|
+-----------+
|       root|
+-----------+
```

### 1.3 查看连接的数据库名

**含义**：返回当前连接的数据库名，若没有执行过 use 语句，则为 null。

#### 语法：

```SQL
showCurrentDatabaseStatement
    : SHOW CURRENT_DATABASE
    ;
```

#### 示例：

```SQL
IoTDB> SHOW CURRENT_DATABASE;

IoTDB> USE test;

IoTDB> SHOW CURRENT_DATABASE;
```

执行结果如下：

```SQL
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

### 1.4 查看集群版本

**含义**：返回当前集群的版本。

#### 语法：

```SQL
showVersionStatement
    : SHOW VERSION
    ;
```

#### 示例：

```SQL
IoTDB> SHOW VERSION
```

执行结果如下：

```SQL
+-------+---------+
|Version|BuildInfo|
+-------+---------+
|2.0.1.2|  1ca4008|
+-------+---------+
```

### 1.5 查看集群关键参数

**含义**：返回当前集群的关键参数。

#### 语法：

```SQL
showVariablesStatement
    : SHOW VARIABLES
    ;
```

关键参数如下：

1. **ClusterName**：当前集群的名称。
2. **DataReplicationFactor**：数据副本的数量，表示每个数据分区（DataRegion）的副本数。
3. **SchemaReplicationFactor**：元数据副本的数量，表示每个元数据分区（SchemaRegion）的副本数。
4. **DataRegionConsensusProtocolClass**：数据分区（DataRegion）使用的共识协议类。
5. **SchemaRegionConsensusProtocolClass**：元数据分区（SchemaRegion）使用的共识协议类。
6. **ConfigNodeConsensusProtocolClass**：配置节点（ConfigNode）使用的共识协议类。
7. **TimePartitionOrigin**：数据库时间分区的起始时间戳。
8. **TimePartitionInterval**：数据库的时间分区间隔（单位：毫秒）。
9. **ReadConsistencyLevel**：读取操作的一致性级别。
10. **SchemaRegionPerDataNode**：数据节点（DataNode）上的元数据分区（SchemaRegion）数量。
11. **DataRegionPerDataNode**：数据节点（DataNode）上的数据分区（DataRegion）数量。
12. **SeriesSlotNum**：数据分区（DataRegion）的序列槽（SeriesSlot）数量。
13. **SeriesSlotExecutorClass**：序列槽的实现类。
14. **DiskSpaceWarningThreshold**：磁盘空间告警阈值（单位：百分比）。
15. **TimestampPrecision**：时间戳精度。

#### 示例：

```SQL
IoTDB> SHOW VARIABLES
```

执行结果如下：

```SQL
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

### 1.6 查看集群ID

**含义**：返回当前集群的ID。

#### 语法：

```SQL
showClusterIdStatement
    : SHOW (CLUSTERID | CLUSTER_ID)
    ;
```

#### 示例：

```SQL
IoTDB> SHOW CLUSTER_ID
```

执行结果如下：

```SQL
+------------------------------------+
|                           ClusterId|
+------------------------------------+
|40163007-9ec1-4455-aa36-8055d740fcda|
```

### 1.7 查看客户端直连的 DataNode 进程所在服务器的时间

#### 语法：

**含义**：返回当前客户端直连的 DataNode 进程所在服务器的时间。

```SQL
showCurrentTimestampStatement
    : SHOW CURRENT_TIMESTAMP
    ;
```

#### 示例：

```SQL
IoTDB> SHOW CURRENT_TIMESTAMP
```

执行结果如下：

```SQL
+-----------------------------+
|             CurrentTimestamp|
+-----------------------------+
|2025-02-17T11:11:52.987+08:00|
+-----------------------------+
```

### 1.8 查看正在执行的查询信息

**含义**：用于显示所有正在执行的查询信息。

> 更多系统表使用方法请参考[系统表](../Reference/System-Tables_timecho.md)

#### 语法：

```SQL
showQueriesStatement
    : SHOW (QUERIES | QUERY PROCESSLIST)
        (WHERE where=booleanExpression)?
        (ORDER BY sortItem (',' sortItem)*)?
        limitOffsetClause
    ;
```

**参数解释**：

1. **WHERE** 子句：需保证过滤的目标列是结果集中存在的列
2. **ORDER BY** 子句：需保证`sortKey`是结果集中存在的列
3. **limitOffsetClause**：
   - **含义**：用于限制结果集的返回数量。
   - **格式**：`LIMIT <offset>, <row_count>`， `<offset>` 是偏移量，`<row_count>` 是返回的行数。
4. **QUERIES** 表中的列：
   - **query_id**：查询语句的 ID
   - **start_time**：查询开始的时间戳，时间戳精度与系统精度一致
   - **datanode_id**：发起查询语句的 DataNode 的ID
   - **elapsed_time**：查询的执行耗时，单位是秒
   - **statement**：查询的 SQL 语句
   - **user**：发起查询的用户

#### 示例：

```SQL
IoTDB> SHOW QUERIES WHERE elapsed_time > 30 
```

执行结果如下：

```SQL
+-----------------------+-----------------------------+-----------+------------+------------+----+
|               query_id|                   start_time|datanode_id|elapsed_time|   statement|user|
+-----------------------+-----------------------------+-----------+------------+------------+----+
|20250108_101015_00000_1|2025-01-08T18:10:15.935+08:00|          1|      32.283|show queries|root|
+-----------------------+-----------------------------+-----------+------------+------------+----+
```

### 1.9 查看分区信息

**含义**：返回当前集群的分区信息。

#### 语法：

```SQL
showRegionsStatement
    : SHOW REGIONS
    ;
```

#### 示例：

```SQL
IoTDB> SHOW REGIONS
```

执行结果如下：

```SQL
+--------+------------+-------+----------+-------------+-----------+----------+----------+-------+---------------+------+-----------------------+----------+
|RegionId|        Type| Status|  Database|SeriesSlotNum|TimeSlotNum|DataNodeId|RpcAddress|RpcPort|InternalAddress|  Role|             CreateTime|TsFileSize|
+--------+------------+-------+----------+-------------+-----------+----------+----------+-------+---------------+------+-----------------------+----------+
|       6|SchemaRegion|Running|tcollector|          670|          0|         1|   0.0.0.0|   6667|      127.0.0.1|Leader|2025-08-01T17:37:01.194|          |
|       7|  DataRegion|Running|tcollector|          335|        335|         1|   0.0.0.0|   6667|      127.0.0.1|Leader|2025-08-01T17:37:01.196| 169.85 KB|
|       8|  DataRegion|Running|tcollector|          335|        335|         1|   0.0.0.0|   6667|      127.0.0.1|Leader|2025-08-01T17:37:01.198| 161.63 KB|
+--------+------------+-------+----------+-------------+-----------+----------+----------+-------+---------------+------+-----------------------+----------+
```

### 1.10 查看可用节点

**含义**：返回当前集群所有可用的 DataNode 的 RPC 地址和端口。注意：这里对于“可用”的定义为：处于非 REMOVING 状态的 DN 节点。

> V2.0.8 起支持该功能

#### 语法：

```SQL
showAvailableUrlsStatement
    : SHOW AVAILABLE URLS
    ;
```

#### 示例：

```SQL
IoTDB> SHOW AVAILABLE URLS
```

执行结果如下：

```SQL
+----------+-------+
|RpcAddress|RpcPort|
+----------+-------+
|   0.0.0.0|   6667|
+----------+-------+
```

### 1.11 查看服务信息

**含义**：返回当前集群所有正常工作（RUNNING 或 READ-ONLY） DN 上的服务信息（MQTT 服务、REST 服务）。

> V2.0.8.2 起支持该功能

#### 语法：

```SQL
showServicesStatement
    : SHOW SERVICES <ON dataNodeId>
    ;
```

#### 示例：

```SQL
IoTDB> SHOW SERVICES
IoTDB> SHOW SERVICES ON 1
```

执行结果如下：

```SQL
+------------+-----------+-------+
|service_name|datanode_id|  state|
+------------+-----------+-------+
|        MQTT|          1|STOPPED|
|        REST|          1|RUNNING|
+------------+-----------+-------+
```


### 1.12 查看集群激活状态

**含义**：返回当前集群的激活状态。

#### 语法：

```SQL
showActivationStatement
    : SHOW ACTIVATION
    ;
```

#### 示例：

```SQL
IoTDB> SHOW ACTIVATION
```

执行结果如下：

```SQL
+---------------+---------+-----------------------------+
|    LicenseInfo|    Usage|                        Limit|
+---------------+---------+-----------------------------+
|         Status|ACTIVATED|                            -|
|    ExpiredTime|        -|2026-04-30T00:00:00.000+08:00|
|  DataNodeLimit|        1|                    Unlimited|
|       CpuLimit|       16|                    Unlimited|
|    DeviceLimit|       30|                    Unlimited|
|TimeSeriesLimit|       72|                1,000,000,000|
+---------------+---------+-----------------------------+
```

### 1.13 查看节点配置信息

**含义**：默认返回指定节点（通过 `node_id` 指定）的配置文件中已生效的配置项；若未指定 `node_id`，则返回客户端直连的 DataNode 配置。 添加 `all` 参数返回所有配置项（未配置项的 `value` 为 `null`）；添加 `with desc` 参数返回配置项含描述信息。

> V2.0.9.1 起支持该功能

#### 语法：

```SQL
showConfigurationStatement
    : SHOW (ALL)? CONFIGURATION (ON nodeId=INTEGER_VALUE)? (WITH DESC)?
    ;
```

#### 结果集说明

| 列名           | 列类型 | 含义             |
| ---------------- | -------- | ------------------ |
| name           | string | 参数名           |
| value          | string | 参数值           |
| default\_value | string | 参数默认值       |
| description    | string | 参数描述（可选） |

#### 示例：

1. 查看客户端直连 DataNode 的配置信息

```SQL
show configuration;
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

2. 查看指定 node id 的节点配置信息

```Bash
show configuration on 1;
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

3. 查看所有配置信息

```Bash
show all configuration;
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

4. 查看配置项描述信息

```Bash
show configuration on 1 with desc;
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


## 2. 状态设置

### 2.1 设置连接的模型

**含义**：将当前连接的 sql_dialect 置为树模型/表模型，在树模型和表模型中均可使用该命令。

#### 语法：

```SQL
SET SQL_DIALECT EQ (TABLE | TREE)
```

#### 示例：

```SQL
IoTDB> SET SQL_DIALECT=TABLE
IoTDB> SHOW CURRENT_SQL_DIALECT
```

执行结果如下：

```SQL
+-----------------+
|CurrentSqlDialect|
+-----------------+
|            TABLE|
+-----------------+
```

### 2.2 更新配置项

**含义**：用于更新配置项，执行完成后会进行配置项的热加载，对于支持热修改的配置项会立即生效。

#### 语法：

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

**参数解释**：

1. **propertyAssignments**
   - **含义**：更新的配置列表，由多个 `property` 组成。
   - 可以更新多个配置列表，用逗号分隔。
   - **取值**：
      - `DEFAULT`：将配置项恢复为默认值。
      - `expression`：具体的值，必须是一个字符串。
2. **ON INTEGER_VALUE**
   - **含义**：指定要更新配置的节点 ID。
   - **可选性**：可选。如果不指定或指定的值低于 0，则更新所有 ConfigNode 和 DataNode 的配置。

#### 示例：

```SQL
IoTDB> SET CONFIGURATION disk_space_warning_threshold='0.05',heartbeat_interval_in_ms='1000' ON 1;
```

### 2.3 读取手动修改的配置文件

**含义**：用于读取手动修改过的配置文件，并对配置项进行热加载，对于支持热修改的配置项会立即生效。

#### 语法：

```SQL
loadConfigurationStatement
    : LOAD CONFIGURATION localOrClusterMode?
    ;
    
localOrClusterMode
    : (ON (LOCAL | CLUSTER))
    ;
```

**参数解释**：

1. **localOrClusterMode**
   - **含义**：指定配置热加载的范围。
   - **可选性**：可选。默认值为 `CLUSTER`。
   - **取值**：
      - `LOCAL`：只对客户端直连的 DataNode 进行配置热加载。
      - `CLUSTER`：对集群中所有 DataNode 进行配置热加载。

#### 示例：

```SQL
IoTDB> LOAD CONFIGURATION ON LOCAL;
```

### 2.4 设置系统的状态

**含义**：用于设置系统的状态。

#### 语法：

```SQL
setSystemStatusStatement
    : SET SYSTEM TO (READONLY | RUNNING) localOrClusterMode?
    ;    
    
localOrClusterMode
    : (ON (LOCAL | CLUSTER))
    ;
```

**参数解释**：

1. **RUNNING | READONLY**
   - **含义**：指定系统的新状态。
   - **取值**：
      - `RUNNING`：将系统设置为运行状态，允许读写操作。
      - `READONLY`：将系统设置为只读状态，只允许读取操作，禁止写入操作。
2. **localOrClusterMode**
   - **含义**：指定状态变更的范围。
   - **可选性**：可选。默认值为 `CLUSTER`。
   - **取值**：
      - `LOCAL`：仅对客户端直连的 DataNode 生效。
      - `CLUSTER`：对集群中所有 DataNode 生效。

#### 示例：

```SQL
IoTDB> SET SYSTEM TO READONLY ON CLUSTER;
```


## 3. 数据管理

### 3.1 刷写内存表中的数据到磁盘

**含义**：将内存表中的数据刷写到磁盘上。

#### 语法：

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

**参数解释**：

1.  **identifier**
    - **含义**：指定要刷写的数据库名称。
    - **可选性**：可选。如果不指定，则默认刷写所有数据库。
    - **多个数据库**：可以指定多个数据库名称，用逗号分隔。例如：`FLUSH test_db1, test_db2`。
2. **booleanValue**
   - **含义**：指定刷写的内容。
   - **可选性**：可选。如果不指定，则默认刷写顺序和乱序空间的内存。
   - **取值**：
      - `TRUE`：只刷写顺序空间的内存表。
      - `FALSE`：只刷写乱序空间的MemTable。
3. **localOrClusterMode**
   - **含义**：指定刷写的范围。
   - **可选性**：可选。默认值为 `CLUSTER`。
   - **取值**：
      - `ON LOCAL`：只刷写客户端直连的 DataNode 上的内存表。
      - `ON CLUSTER`：刷写集群中所有 DataNode 上的内存表。

#### 示例：

```SQL
IoTDB> FLUSH test_db TRUE ON LOCAL;
```

## 4. 数据修复

### 4.1 启动后台扫描并修复 tsfile 任务

**含义**：启动一个后台任务，开始扫描并修复 tsfile，能够修复数据文件内的时间戳乱序类异常。

#### 语法：

```SQL
startRepairDataStatement
    : START REPAIR DATA localOrClusterMode?
    ;
    
localOrClusterMode
    : (ON (LOCAL | CLUSTER))
    ;
```

**参数解释**：

1. **localOrClusterMode**
   - **含义**：指定数据修复的范围。
   - **可选性**：可选。默认值为 `CLUSTER`。
   - **取值**：
      - `ON LOCAL`：仅对客户端直连的 DataNode 执行。
      - `ON CLUSTER`：对集群中所有 DataNode 执行。

#### 示例：

```SQL
IoTDB> START REPAIR DATA ON CLUSTER;
```

### 4.2 暂停后台修复 tsfile 任务

**含义**：暂停后台的修复任务，暂停中的任务可通过再次执行 start repair data 命令恢复。

#### 语法：

```SQL
stopRepairDataStatement
    : STOP REPAIR DATA localOrClusterMode?
    ;
    
localOrClusterMode
    : (ON (LOCAL | CLUSTER))
    ;
```

**参数解释**：

1. **localOrClusterMode**
   - **含义**：指定数据修复的范围。
   - **可选性**：可选。默认值为 `CLUSTER`。
   - **取值**：
      - `ON LOCAL`：仅对客户端直连的 DataNode 执行。
      - `ON CLUSTER`：对集群中所有 DataNode 执行。

#### 示例：

```SQL
IoTDB> STOP REPAIR DATA ON CLUSTER;
```

## 5. 终止查询

### 5.1 主动终止查询

**含义**：使用该命令主动地终止查询。

#### 语法：

```SQL
killQueryStatement
    : KILL (QUERY queryId=string | ALL QUERIES)
    ;
```

**参数解释**：

1. **QUERY queryId=string**
   - **含义**：指定要终止的查询的 ID。 `<queryId>` 是正在执行的查询的唯一标识符。
   - **获取查询 ID**：可以通过 `SHOW QUERIES` 命令获取所有正在执行的查询及其 ID。
2. **ALL QUERIES**
   - **含义**：终止所有正在执行的查询。

#### 示例：

通过指定 `queryId` 可以中止指定的查询，为了获取正在执行的查询 id，用户可以使用 show queries 命令，该命令将显示所有正在执行的查询列表。

```SQL
IoTDB> KILL QUERY 20250108_101015_00000_1; -- 终止指定query
IoTDB> KILL ALL QUERIES; -- 终止所有query
```

## 6. 调试查询

### 6.1 DEBUG SQL


**​含义：​**在 SQL 查询语句开头添加 debug 关键字，执行时将输出 debug 日志，包括涉及到的底层文件 scan 信息。

> V2.0.9 起支持该功能

#### 语法：

```SQL
debugSQLStatement
    : DEBUG ? query
    ;
```

**说明：**

* 日志输出目录为： `logs/log_datanode_query_debug.log`

#### 示例：

1. 执行以下 SQL 进行 DEBUG 查询

```SQL
debug select * from table3;
```

2. 观察`log_datanode_query_debug.log` 的日志内容，查看查询涉及到的文件 scan 信息。

```Bash
2026-03-24 10:10:41,515 [Query-Worker-Thread-0$20260324_021041_00068_1.1.0.0] INFO  o.a.i.d.s.d.t.TsFileResource:1098 - Path: table3.d1 file /home/iotdb/timechodb/data/datanode/data/sequence/database1/4/2864/1769139940009-1-0-0.tsfile is not satisfied because of no device! 
2026-03-24 10:10:41,515 [Query-Worker-Thread-0$20260324_021041_00068_1.1.0.0] INFO  o.a.i.d.s.d.t.TsFileResource:1098 - Path: table3.d1 file /home/iotdb/timechodb/data/datanode/data/sequence/database1/4/2865/1769139940010-1-0-0.tsfile is not satisfied because of no device! 
2026-03-24 10:10:41,516 [Query-Worker-Thread-0$20260324_021041_00068_1.1.0.0] INFO  o.a.i.d.s.b.TimeSeriesMetadataCache:159 - Cache miss: table3.d1. in file: /home/iotdb/timechodb/data/datanode/data/sequence/database1/4/2888/1774247880109-1-0-0.tsfile 
2026-03-24 10:10:41,516 [Query-Worker-Thread-0$20260324_021041_00068_1.1.0.0] INFO  o.a.i.d.s.b.TimeSeriesMetadataCache:160 - Device: table3.d1, all sensors: [, temperature] 
2026-03-24 10:10:41,517 [Query-Worker-Thread-0$20260324_021041_00068_1.1.0.0] INFO  o.a.i.d.s.b.BloomFilterCache:110 - get bloomFilter from cache where filePath is: /home/iotdb/timechodb/data/datanode/data/sequence/database1/4/2888/1774247880109-1-0-0.tsfile 
2026-03-24 10:10:41,517 [Query-Worker-Thread-0$20260324_021041_00068_1.1.0.0] INFO  o.a.i.d.s.b.TimeSeriesMetadataCache:227 - Get timeseries: table3.d1.  metadata in file: /home/iotdb/timechodb/data/datanode/data/sequence/database1/4/2888/1774247880109-1-0-0.tsfile  from cache: TimeseriesMetadata{timeSeriesMetadataType=-128, chunkMetaDataListDataSize=8, measurementId='', dataType=VECTOR, statistics=startTime: 1747065600001 endTime: 1747065601002 count: 2, modified=false, isSeq=true, chunkMetadataList=[measurementId: , datatype: VECTOR, version: 0, Statistics: startTime: 1747065600001 endTime: 1747065601002 count: 2, deleteIntervalList: null]}. 
2026-03-24 10:10:41,517 [Query-Worker-Thread-0$20260324_021041_00068_1.1.0.0] INFO  o.a.i.d.s.b.TimeSeriesMetadataCache:227 - Get timeseries: table3.d1.temperature  metadata in file: /home/iotdb/timechodb/data/datanode/data/sequence/database1/4/2888/1774247880109-1-0-0.tsfile  from cache: TimeseriesMetadata{timeSeriesMetadataType=64, chunkMetaDataListDataSize=8, measurementId='temperature', dataType=FLOAT, statistics=startTime: 1747065600001 endTime: 1747065601002 count: 2 [minValue:85.0,maxValue:90.0,firstValue:90.0,lastValue:85.0,sumValue:175.0], modified=false, isSeq=true, chunkMetadataList=[measurementId: temperature, datatype: FLOAT, version: 0, Statistics: startTime: 1747065600001 endTime: 1747065601002 count: 2 [minValue:85.0,maxValue:90.0,firstValue:90.0,lastValue:85.0,sumValue:175.0], deleteIntervalList: null]}. 
2026-03-24 10:10:41,517 [Query-Worker-Thread-0$20260324_021041_00068_1.1.0.0] INFO  o.a.i.d.s.d.r.r.c.m.DiskAlignedChunkMetadataLoader:110 - Modifications size is 1 for file Path: /home/iotdb/timechodb/data/datanode/data/sequence/database1/4/2888/1774247880109-1-0-0.tsfile  
2026-03-24 10:10:41,518 [Query-Worker-Thread-0$20260324_021041_00068_1.1.0.0] INFO  o.a.i.d.s.d.r.r.c.m.DiskAlignedChunkMetadataLoader:114 - [] 
2026-03-24 10:10:41,518 [Query-Worker-Thread-0$20260324_021041_00068_1.1.0.0] INFO  o.a.i.d.s.d.r.r.c.m.DiskAlignedChunkMetadataLoader:125 - After modification Chunk meta data list is:  
2026-03-24 10:10:41,518 [Query-Worker-Thread-0$20260324_021041_00068_1.1.0.0] INFO  o.a.i.d.s.d.r.r.c.m.DiskAlignedChunkMetadataLoader:126 - org.apache.tsfile.file.metadata.TableDeviceChunkMetadata@2e11291f 
2026-03-24 10:10:41,518 [Query-Worker-Thread-0$20260324_021041_00068_1.1.0.0] INFO  o.a.i.d.s.b.ChunkCache:167 - get chunk from cache whose key is: ChunkCacheKey{filePath='/home/iotdb/timechodb/data/datanode/data/sequence/database1/4/2888/1774247880109-1-0-0.tsfile', regionId=4, timePartitionId=2888, tsFileVersion=1, compactionVersion=0, offsetOfChunkHeader=19} 
2026-03-24 10:10:41,518 [Query-Worker-Thread-0$20260324_021041_00068_1.1.0.0] INFO  o.a.i.d.s.b.ChunkCache:167 - get chunk from cache whose key is: ChunkCacheKey{filePath='/home/iotdb/timechodb/data/datanode/data/sequence/database1/4/2888/1774247880109-1-0-0.tsfile', regionId=4, timePartitionId=2888, tsFileVersion=1, compactionVersion=0, offsetOfChunkHeader=46} 
2026-03-24 10:10:41,519 [pool-69-IoTDB-ClientRPC-Processor-1$20260324_021041_00068_1] INFO  o.a.i.d.q.p.Coordinator:902 - debug select * from table3 
```
