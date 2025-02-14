<!--

​    Licensed to the Apache Software Foundation (ASF) under one
​    or more contributor license agreements.  See the NOTICE file
​    distributed with this work for additional information
​    regarding copyright ownership.  The ASF licenses this file
​    to you under the Apache License, Version 2.0 (the
​    "License"); you may not use this file except in compliance
​    with the License.  You may obtain a copy of the License at
​    
​        http://www.apache.org/licenses/LICENSE-2.0
​    
​    Unless required by applicable law or agreed to in writing,
​    software distributed under the License is distributed on an
​    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
​    KIND, either express or implied.  See the License for the
​    specific language governing permissions and limitations
​    under the License.

-->

# 常见概念

## 数据模型相关概念 

| 概念                    | 含义                                                         |
| ----------------------- | ------------------------------------------------------------ |
| 数据模型（sql_dialect） | IoTDB 支持两种时序数据模型（SQL语法），管理的对象均为设备和测点树：以层级路径的方式管理数据，一条路径对应一个设备的一个测点表：以关系表的方式管理数据，一张表对应一类设备 |
| 元数据（Schema）        | 元数据是数据库的数据模型信息，即树形结构或表结构。包括测点的名称、数据类型等定义。 |
| 设备（Device）          | 对应一个实际场景中的物理设备，通常包含多个测点。             |
| 测点（Timeseries）      | 又名：物理量、时间序列、时间线、点位、信号量、指标、测量值等。是多个数据点按时间戳递增排列形成的一个时间序列。通常一个测点代表一个采集点位，能够定期采集所在环境的物理量。 |
| 编码（Encoding）        | 编码是一种压缩技术，将数据以二进制的形式进行表示，可以提高存储效率。IoTDB 支持多种针对不同类型的数据的编码方法，详细信息请查看：[压缩和编码](../Technical-Insider/Encoding-and-Compression.md) |
| 压缩（Compression）     | IoTDB 在数据编码后，使用压缩技术进一步压缩二进制数据，提升存储效率。IoTDB 支持多种压缩方法，详细信息请查看：[压缩和编码](../Technical-Insider/Encoding-and-Compression.md) |

## 分布式相关概念

下图展示了一个常见的 IoTDB 3C3D（3 个 ConfigNode、3 个 DataNode）的集群部署模式：                 

<img src="/img/Cluster-Concept01.png" alt="" style="width: 60%;"/>

IoTDB 的集群包括如下常见概念：

- 节点（ConfigNode、DataNode、AINode）
- Region（SchemaRegion、DataRegion）
- 多副本

下文将对以上概念进行介绍。


### 节点

IoTDB 集群包括三种节点（进程）：ConfigNode（管理节点），DataNode（数据节点）和 AINode（分析节点），如下所示：

- ConfigNode：管理集群的节点信息、配置信息、用户权限、元数据、分区信息等，负责分布式操作的调度和负载均衡，所有 ConfigNode 之间互为全量备份，如上图中的 ConfigNode-1，ConfigNode-2 和 ConfigNode-3 所示。
- DataNode：服务客户端请求，负责数据的存储和计算，如上图中的 DataNode-1，DataNode-2 和 DataNode-3 所示。
- AINode：负责提供机器学习能力，支持注册已训练好的机器学习模型，并通过 SQL 调用模型进行推理，目前已内置自研时序大模型和常见的机器学习算法（如预测与异常检测）。

### 数据分区

在 IoTDB 中，元数据和数据都被分为小的分区，即 Region，由集群的各个 DataNode 进行管理。

- SchemaRegion：元数据分区，管理一部分设备和测点的元数据。不同 DataNode 相同 RegionID 的 SchemaRegion 互为副本，如上图中 SchemaRegion-1 拥有三个副本，分别放置于 DataNode-1，DataNode-2 和 DataNode-3。
- DataRegion：数据分区，管理一部分设备的一段时间的数据。不同 DataNode 相同 RegionID 的 DataRegion 互为副本，如上图中 DataRegion-2 拥有两个副本，分别放置于 DataNode-1 和 DataNode-2。
- 具体分区算法可参考：[数据分区](../Technical-Insider/Cluster-data-partitioning.md)

### 多副本

数据和元数据的副本数可配置，不同部署模式下的副本数推荐如下配置，其中多副本时可提供高可用服务。

| 类别   | 配置项                    | 单机推荐配置 | 集群推荐配置 |
| :----- | :------------------------ | :----------- | :----------- |
| 元数据 | schema_replication_factor | 1            | 3            |
| 数据   | data_replication_factor   | 1            | 2            |


## 部署相关概念

IoTDB 有三种运行模式：单机模式、集群模式和双活模式。

### 单机模式 

IoTDB单机实例包括 1 个ConfigNode、1个DataNode，即1C1D；

- **特点**：便于开发者安装部署，部署和维护成本较低，操作方便。
- **适用场景**：资源有限或对高可用要求不高的场景，例如边缘端服务器。
- **部署方法**：[单机版部署](../Deployment-and-Maintenance/Stand-Alone-Deployment_timecho.md)

### 双活模式 

双活版部署为 TimechoDB 企业版功能，是指两个独立的实例进行双向同步，能同时对外提供服务。当一台停机重启后，另一个实例会将缺失数据断点续传。

> IoTDB 双活实例通常为2个单机节点，即2套1C1D。每个实例也可以为集群。

- **特点**：资源占用最低的高可用解决方案。
- **适用场景**：资源有限（仅有两台服务器），但希望获得高可用能力。
- **部署方法**：[双活版部署](../Deployment-and-Maintenance/Dual-Active-Deployment_timecho.md)

### 集群模式

IoTDB 集群实例为 3 个ConfigNode 和不少于 3 个 DataNode，通常为 3 个 DataNode，即3C3D；当部分节点出现故障时，剩余节点仍然能对外提供服务，保证数据库服务的高可用性，且可随节点增加提升数据库性能。

- **特点**：具有高可用性、高扩展性，可通过增加 DataNode 提高系统性能。
- **适用场景**：需要提供高可用和可靠性的企业级应用场景。
- **部署方法**：[集群版部署](../Deployment-and-Maintenance/Cluster-Deployment_timecho.md)

### 特点总结

| 维度         | 单机模式                     | 双活模式                 | 集群模式                 |
| ------------ | ---------------------------- | ------------------------ | ------------------------ |
| 适用场景     | 边缘侧部署、对高可用要求不高 | 高可用性业务、容灾场景等 | 高可用性业务、容灾场景等 |
| 所需机器数量 | 1                            | 2                        | ≥3                       |
| 安全可靠性   | 无法容忍单点故障             | 高，可容忍单点故障       | 高，可容忍单点故障       |
| 扩展性       | 可扩展 DataNode 提升性能     | 每个实例可按需扩展       | 可扩展 DataNode 提升性能 |
| 性能         | 可随 DataNode 数量扩展       | 与其中一个实例性能相同   | 可随 DataNode 数量扩展   |

- 单机模式和集群模式，部署步骤类似（逐个增加 ConfigNode 和 DataNode），仅副本数和可提供服务的最少节点数不同。