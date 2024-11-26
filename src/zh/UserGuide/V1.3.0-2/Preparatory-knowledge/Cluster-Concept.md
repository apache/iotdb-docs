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

# 集群相关概念
下图展示了一个常见的 IoTDB 3C3D1A（3 个 ConfigNode、3 个 DataNode 和 1 个 AINode）的集群部署模式：
<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="https://alioss.timecho.com/docs/img/Common-Concepts_01.png">

其中包括了 IoTDB 集群使用中用户常接触到的几个概念，包括：
- **节点**（ConfigNode、DataNode、AINode）；
- **槽**（SchemaSlot、DataSlot）；
- **Region**（SchemaRegion、DataRegion）；
- ***副本组***。

下文将重点对以上概念进行介绍。

## 节点
IoTDB 集群包括三种节点（进程），**ConfigNode**（管理节点），**DataNode**（数据节点）和 **AINode**（分析节点），如下所示：
- **ConfigNode**：存储集群的配置信息、数据库的元数据、时间序列元数据和数据的路由信息，监控集群节点并实施负载均衡，所有 ConfigNode 之间互为全量备份，如上图中的 ConfigNode-1，ConfigNode-2 和 ConfigNode-3 所示。ConfigNode 不直接接收客户端读写请求，它会通过一系列[负载均衡算法](https://iotdb.apache.org/zh/UserGuide/latest/Technical-Insider/Cluster-data-partitioning.html)对集群中元数据和数据的分布提供指导。
- **DataNode**：负责时间序列元数据和数据的读写，每个 DataNode 都能接收客户端读写请求并提供相应服务，如上图中的 DataNode-1，DataNode-2 和 DataNode-3 所示。接收客户端读写请求时，若 DataNode 缓存有对应的路由信息，它能直接在本地执行或是转发这些请求；否则它会向 ConfigNode 询问并缓存路由信息，以加速后续请求的服务效率。
- **AINode**：负责与 ConfigNode 和 DataNode 交互来扩展 IoTDB 集群对时间序列进行智能分析的能力，支持从外部引入已有机器学习模型进行注册，并使用注册的模型在指定时序数据上通过简单 SQL 语句完成时序分析任务的过程，将模型的创建、管理及推理融合在数据库引擎中。目前已提供常见时序分析场景（例如预测与异常检测）的机器学习算法或自研模型。

## 槽
IoTDB 内部将元数据和数据划分成多个更小的、更易于管理的单元，每个单元称为一个**槽**。槽是一个逻辑概念，在 IoTDB 集群中，**元数据槽**和**数据槽**定义如下：
- **元数据槽**（SchemaSlot）：一部分元数据集合，元数据槽总数固定，默认数量为 1000，IoTDB 使用哈希算法将所有设备均匀地分配到这些元数据槽中。
- **数据槽**（DataSlot）：一部分数据集合，在元数据槽的基础上，将对应设备的数据按时间范围划分为数据槽，默认的时间范围为 7 天。

## Region
在 IoTDB 中，元数据和数据被复制到各个 DataNode 以获得集群高可用性。然而以槽为粒度进行复制会增加集群管理成本、降低写入吞吐。因此 IoTDB 引入 **Region** 这一概念，将元数据槽和数据槽分别分配给 SchemaRegion 和 DataRegion 后，以 Region 为单位进行复制。**SchemRegion** 和 **DataRegion** 的详细定义如下：
- **SchemaRegion**：元数据存储和复制的基本单元，集群每个数据库的所有元数据槽会被均匀分配给该数据库的所有 SchemaRegion。拥有相同 RegionID 的 SchemaRegion 互为副本，如上图中 SchemaRegion-1 拥有三个副本，分别放置于 DataNode-1，DataNode-2 和 DataNode-3。
- **DataRegion**：数据存储和复制的基本单元，集群每个数据库的所有数据槽会被均匀分配给该数据库的所有 DataRegion。拥有相同 RegionID 的 DataRegion 互为副本，如上图中 DataRegion-2 拥有两个副本，分别放置于 DataNode-1 和 DataNode-2。

## 副本组
Region 的副本对集群的容灾能力至关重要。对于每个 Region 的所有副本，它们的角色分为 **leader** 和 **follower**，共同提供读写服务。不同架构下的副本组配置推荐如下：
| 类别 | 配置项 | 单机推荐配置 | 分布式推荐配置 |
| :-: | :-: | :-: | :-: |
| 元数据 | schema_replication_factor | 1 | 3 |
| 数据 | data_replication_factor | 1 | 2 |