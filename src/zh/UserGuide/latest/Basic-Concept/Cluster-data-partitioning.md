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

# 分区与负载均衡
本文档介绍了 IoTDB 中的分区策略和负载均衡算法。根据时序数据的特性，IoTDB 按序列和时间维度对其进行分区。结合序列分区与时间分区创建一个分区，作为划分的基本单元。为了提高吞吐量并降低管理成本，这些分区被均匀分配到 RegionGroup 中，RegionGroup 是复制的基本单元。RegionGroup 的 Region 决定了数据的存储位置，leader 负责主要负载的管理。在此过程中，Region 放置算法决定哪些节点将持有 Region，而 leader 选择算法则指定哪个 Region 将成为 leader。

## 分区策略和分区分配
IoTDB 为时间序列数据实现了量身定制的分区算子。在此基础上，缓存于 ConfigNode 和 DataNode 上的分区信息不仅易于管理，而且能够清晰区分冷热数据。随后，平衡的分区被均匀分配到集群的 RegionGroup 中，以实现存储均衡。

### 分区策略
IoTDB 将生产环境中的每个传感器映射为一个时间序列。然后，使用序列分区算子对时间序列进行分区以管理其元数据，再结合时间分区算子来管理其数据。下图展示了 IoTDB 如何对时序数据进行分区。

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="https://alioss.timecho.com/docs/img/partition_table_cn.png?raw=true">

#### 分区算子
由于生产环境中通常部署大量设备和传感器，IoTDB 使用序列分区算子以确保分区信息的大小可控。由于生成的时间序列与时间戳相关联，IoTDB 使用时间分区算子来清晰区分冷热分区。

##### 序列分区算子
默认情况下，IoTDB 将序列分区的数量限制为 1000，并将序列分区算子配置为哈希分区策略。这带来以下收益：
+ 由于序列分区的数量是固定常量，序列与序列分区之间的映射保持稳定。因此，IoTDB 不需要频繁进行数据迁移。
+ 序列分区的负载相对均衡，因为序列分区的数量远小于生产环境中部署的传感器数量。

更进一步，如果能够更准确地估计生产环境中的实际负载情况，序列分区算子可以配置为自定义的哈希分区策略或列表分区策略，以在所有序列分区中实现更均匀的负载分布。

##### 时间分区算子
时间分区算子通过下式将给定的时间戳转换为相应的时间分区：
$$\left\lfloor\frac{\text{Timestamp}-\text{StartTimestamp}}{\text{TimePartitionInterval}}\right\rfloor。$$

在此式中，$\text{StartTimestamp}$ 和 $\text{TimePartitionInterval}$ 都是可配置参数，以适应不同的生产环境。$\text{StartTimestamp}$ 表示第一个时间分区的起始时间，而 $\text{TimePartitionInterval}$ 定义了每个时间分区的持续时间。默认情况下，$\text{TimePartitionInterval}$ 设置为一天。

#### 元数据分区
由于序列分区算子对时间序列进行了均匀分区，每个序列分区对应一个元数据分区。这些元数据分区随后被均匀分配到 SchemaRegionGroup 中，以实现元数据的均衡分布。

#### 数据分区
结合序列分区与时间分区创建数据分区。由于序列分区算子对时间序列进行了均匀分区，特定时间分区内的数据分区负载保持均衡。这些数据分区随后被均匀分配到 DataRegionGroup 中，以实现数据的均衡分布。

### 分区分配
IoTDB 使用 RegionGroup 来实现时间序列的弹性存储，集群中RegionGroup 的数量由所有 DataNode 的总资源决定。由于RegionGroup 的数量是动态的，IoTDB 可以轻松扩展。SchemaRegionGroup 和 DataRegionGroup 都遵循相同的分区分配策略，即均匀划分所有序列分区。下图展示了分区分配过程，其中动态的 RegionGroup 匹配不断扩展的时间序列和集群。

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="https://alioss.timecho.com/docs/img/partition_allocation.png?raw=true">

#### RegionGroup 扩容
RegionGroup 的数量由下式给出：

$$\text{RegionGroupNumber}=\left\lfloor\frac{\sum_{i=1}^{DataNodeNumber}\text{RegionNumber}_i}{\text{ReplicationFactor}}\right\rfloor。$$

在此式中，$\text{RegionNumber}_i$ 表示期望在第 $i$ 个 DataNode 上放置的 Region 数量，而 $\text{ReplicationFactor}$ 表示每个 RegionGroup 中的 Region 数量。$\text{RegionNumber}_i$ 和 $\text{ReplicationFactor}$ 都是可配置的参数。$\text{RegionNumber}_i$ 可以根据第 $i$ 个 DataNode 上的可用硬件资源（如 CPU 核心数量、内存大小等）确定，以适应不同的物理服务器。$\text{ReplicationFactor}$ 可以调整以确保不同级别的容错能力。

#### 分配策略
SchemaRegionGroup 和 DataRegionGroup 都遵循相同的分配策略，即均匀划分所有序列分区。因此，每个 SchemaRegionGroup 持有相同数量的元数据分区，以确保元数据存储均衡。同样，对于每个时间分区，每个 DataRegionGroup 获取与其持有的序列分区对应的数据分区。因此，时间分区内的数据分区均匀分布在所有 DataRegionGroup 中，确保每个时间分区内的数据存储均衡。

值得注意的是，IoTDB 有效利用了时序数据的特性。当配置了 TTL（生存时间）时，IoTDB 可实现无需迁移的时序数据弹性存储，该功能在集群扩展时最小化了对在线操作的影响。上图展示了该功能的一个实例：新生成的数据分区被均匀分配到每个 DataRegion，过期数据会自动归档。因此，集群的存储最终将保持平衡。

## 负载均衡
为了提高集群的可用性和性能，IoTDB 采用了精心设计的 Region 放置和 leader 选择算法。

### Region 放置
DataNode 持有的 Region 数量反映了它的存储负载。如果DataNode 之间的 Region 数量差异较大，拥有更多 Region 的DataNode 可能成为存储瓶颈。尽管简单的轮询（Round Robin）放置算法可以通过确保每个 DataNode 持有等量 Region 来实现存储均衡，但它会降低集群的容错能力，如下所示：

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="https://alioss.timecho.com/docs/img/placement.png?raw=true">

+ 假设集群有 4 个 DataNode，4 个 RegionGroup，并且副本因子为 2。
+ 将 RegionGroup $r_1$ 的 2 个 Region 放置在 DataNode $n_1$ 和 $n_2$ 上。
+ 将 RegionGroup $r_2$ 的 2 个 Region 放置在 DataNode $n_3$ 和 $n_4$ 上。
+ 将 RegionGroup $r_3$ 的 2 个 Region 放置在 DataNode $n_1$ 和 $n_3$ 上。
+ 将 RegionGroup $r_4$ 的 2 个 Region 放置在 DataNode $n_2$ 和 $n_4$ 上。

在这种情况下，如果 DataNode $n_2$ 发生故障，由它先前负责的负载将只能全部转移到 DataNode $n_1$，可能导致其过载。

为了解决这个问题，IoTDB 采用了一种副本放置算法，该算法不仅将Region 均匀放置到所有 DataNode 上，还确保每个 DataNode 在发生故障时，能够将其负载转移到足够多的其他 DataNode。因此，集群实现了存储分布的均衡，并具备较高的容错能力，从而确保其可用性。

### Leader 选择
一个 DataNode 持有的 leader Region 数量反映了它的计算负载。如果 DataNode 之间持有 leader 数量差异较大，拥有更多 leader 的 DataNode 可能成为计算瓶颈。如果 leader 选择过程使用直观的贪心算法，当 Region 以容错算法放置时，可能会导致 leader 分布不均，如下所示：

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="https://alioss.timecho.com/docs/img/selection.png?raw=true">

+ 假设集群有 4 个 DataNode，4 个 RegionGroup，并且副本因子为 2。
+ 选择 RegionGroup $r_5$ 在 DataNode $n_5$ 上的 Region 作为 leader。
+ 选择 RegionGroup $r_6$ 在 DataNode $n_7$ 上的 Region 作为 leader。
+ 选择 RegionGroup $r_7$ 在 DataNode $n_7$ 上的 Region 作为 leader。
+ 选择 RegionGroup $r_8$ 在 DataNode $n_8$ 上的 Region 作为 leader。

请注意，以上步骤严格遵循贪心算法。然而，到第 3 步时，无论在DataNode $n_5$ 或 $n_7$ 上选择 RegionGroup $r_7$ 的 leader，都会导致 leader 分布不均衡。根本原因在于每一步贪心选择都缺乏全局视角，最终导致局部最优解。

为了解决这个问题，IoTDB 采用了一种 leader 选择算法，能够持续平衡集群中的 leader 分布。因此，集群实现了计算负载的均衡分布，确保了其性能。

## Source Code
+ [数据分区](https://github.com/apache/iotdb/tree/master/iotdb-core/node-commons/src/main/java/org/apache/iotdb/commons/partition)
+ [分区分配](https://github.com/apache/iotdb/tree/master/iotdb-core/confignode/src/main/java/org/apache/iotdb/confignode/manager/load/balancer/partition)
+ [Region 放置](https://github.com/apache/iotdb/tree/master/iotdb-core/confignode/src/main/java/org/apache/iotdb/confignode/manager/load/balancer/region)
+ [主 Region 选择](https://github.com/apache/iotdb/tree/master/iotdb-core/confignode/src/main/java/org/apache/iotdb/confignode/manager/load/balancer/router/leader)