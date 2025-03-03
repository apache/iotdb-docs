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
# Data Partitioning and Load Balancing

This document introduces the partitioning strategies and load balance strategies in IoTDB. According to the characteristics of time series data, IoTDB partitions them by series and time dimensions. Combining a series partition with a time partition creates a partition, the unit of division. To enhance throughput and reduce management costs, these partitions are evenly allocated to RegionGroups, which serve as the unit of replication. The RegionGroup's Regions then determine the storage location, with the leader Region managing the primary load. During this process, the Region placement strategy determines which nodes will host the replicas, while the leader selection strategy designates which Region will act as the leader.

## 1. Partitioning Strategy and Partition Allocation

IoTDB implements a tailored partitioning algorithm for time-series data. Based on this, the partition information cached on the ConfigNode and DataNode is not only easy to manage but also clearly distinguishes between hot and cold data. Subsequently, balanced partitions are evenly distributed across the RegionGroups in the cluster to achieve storage balance.

### 1.1 Partitioning Strategy

IoTDB maps each sensor in a production environment to a time series. It then uses a **series** **partitioning algorithm** to partition the time series for schema management and a **time partitioning algorithm** to manage the data. The figure below illustrates how IoTDB partitions time-series data.

![](/img/partition_table_en.png)

#### Partitioning Algorithms

Since a large number of devices and sensors are typically deployed in production environments, IoTDB uses a series partitioning algorithm to ensure that the size of partition information remains manageable. As the generated time series are associated with timestamps, IoTDB uses a time partitioning algorithm to clearly distinguish between hot and cold partitions.

##### Series Partitioning Algorithm

By default, IoTDB limits the number of series partitions to 1,000 and configures the series partitioning algorithm as a **hash partitioning algorithm**. This provides the following benefits:

- The number of series partitions is a fixed constant, ensuring stable mapping between series and series partitions. Thus, IoTDB does not require frequent data migration.
- The load on series partitions is relatively balanced, as the number of series partitions is much smaller than the number of sensors deployed in production environments.

Furthermore, if the actual load in the production environment can be estimated more accurately, the sequence partitioning algorithm can be configured as a custom hash or list partitioning algorithm to achieve a more uniform load distribution across all sequence partitions.

##### Time Partitioning Algorithm

The time partitioning algorithm converts a given timestamp into the corresponding time partition using the following formula:

$$\left\lfloor\frac{\text{Timestamp} - \text{StartTimestamp}}{\text{TimePartitionInterval}}\right\rfloor$$

In this formula, $\text{StartTimestamp}$ and $\text{TimePartitionInterval}$ are configurable parameters to adapt to different production environments. $\text{StartTimestamp}$ represents the start time of the first time partition, while $\text{TimePartitionInterval}$ defines the duration of each time partition. By default, $\text{TimePartitionInterval}$ is set to seven days.

#### Schema Partitioning

Since the series partitioning algorithm evenly partitions the time series, each series partition corresponds to a schema partition. These schema partitions are then evenly distributed across **SchemaRegionGroups** to achieve balanced schema distribution.

#### Data Partitioning

Data partitions are created by combining series partitions and time partitions. Since the series partitioning algorithm evenly partitions the time series, the load of data partitions within a specific time partition remains balanced. These data partitions are then evenly distributed across **DataRegionGroups** to achieve balanced data distribution.

### 1.2 Partition Allocation

IoTDB uses RegionGroups to achieve elastic storage for time-series data. The number of RegionGroups in the cluster is determined by the total resources of all DataNodes. Since the number of RegionGroups is dynamic, IoTDB can easily scale. Both SchemaRegionGroups and DataRegionGroups follow the same partition allocation algorithm, which evenly divides all series partitions. The figure below illustrates the partition allocation process, where dynamically expanding RegionGroups match the continuously expanding time series and cluster.

![](/img/partition_allocation_en.png)

#### RegionGroup  Expansion

The number of RegionGroups is given by the following formula:

$$\text{RegionGroupNumber} = \left\lfloor\frac{\sum_{i=1}^{\text{DataNodeNumber}} \text{RegionNumber}_i}{\text{ReplicationFactor}}\right\rfloor$$

In this formula, $\text{RegionNumber}_i$ represents the number of Regions expected to be hosted on the  $i$-th DataNode, and $\text{ReplicationFactor}$ denotes the number of Regions within each RegionGroup. Both $\text{RegionNumber}_i$ and $\text{ReplicationFactor}$ are configurable parameters. $\text{RegionNumber}_i$ can be determined based on the available hardware resources (e.g., CPU cores, memory size) on the  $i$-th DataNode to adapt to different physical servers. $\text{ReplicationFactor}$ can be adjusted to ensure different levels of fault tolerance.

#### Allocation Strategy

Both the SchemaRegionGroup and the DataRegionGroup follow the same allocation algorithm--splitting all series partitions evenly. As a result, each SchemaRegionGroup holds the same number of schema partitions, ensuring balanced schema storage. Similarly, for each time partition, each DataRegionGroup acquires the data partitions corresponding to the series partitions it holds. Consequently, the data partitions within a time partition are evenly distributed across all DataRegionGroups, ensuring balanced data storage in each time partition.

Notably, IoTDB effectively leverages the characteristics of time series data. When the TTL (Time to Live) is configured, IoTDB enables migration-free elastic storage for time series data. This feature facilitates cluster expansion while minimizing the impact on online operations. The figures above illustrate an instance of this feature: newborn data partitions are evenly allocated to each DataRegion, and expired data are automatically archived. As a result, the cluster's storage will eventually remain balanced.

## 2. Load Balancing Strategies

To improve cluster availability and performance, IoTDB employs carefully designed storage balancing and computation balancing algorithms.

### 2.1 Storage Balancing

The number of Regions held by a DataNode reflects its storage load. If the number of Regions varies significantly between DataNodes, the DataNode with more Regions may become a storage bottleneck. Although a simple Round Robin placement algorithm can achieve storage balancing by ensuring each DataNode holds an equal number of Regions, it reduces the cluster's fault tolerance, as shown below:

![](/img/placement_en.png)

- Assume the cluster has 4 DataNodes, 4 RegionGroups, and a replication factor of 2.
- Place the 2 Regions of RegionGroups $r_1$ on DataNodes $n_1$ and  $n_2$ .
- Place the 2 Regions of RegionGroups $r_2$ on DataNodes $n_3$ and  $n_4$ .
- Place the 2 Regions of RegionGroups $r_3$ on DataNodes $n_1$ and  $n_3$ .
- Place the 2 Regions of RegionGroups $r_4$ on DataNodes $n_2$ and  $n_4$ .

In this scenario, if DataNode $n_2$  fails, the load previously handled by DataNode $n_2$  would be transferred solely to DataNode $n_1$ , potentially overloading it.

To address this issue, IoTDB employs a Region placement algorithm that not only evenly distributes Regions across all DataNodes but also ensures that each DataNode can offload its storage to sufficient other DataNodes in the event of a failure. As a result, the cluster achieves balanced storage distribution and a high level of fault tolerance, ensuring its availability.

### 2.2 Computation Balancing

The number of leader Regions held by a DataNode reflects its Computing load. If the difference in the number of leaders across DataNodes is relatively large, the DataNode with more leaders is likely to become a Computing bottleneck. If the leader selection process is conducted using a transparent Greedy algorithm, the result may be an unbalanced leader distribution when the Regions are fault-tolerantly placed, as demonstrated below:

![](/img/selection_en.png)

- Assume the cluster has 4 DataNodes, 4 RegionGroups, and a replication factor of 2.
- Select RegionGroup $r_5$ on DataNode $n_5$ as the leader.
- Select RegionGroup $r_6$ on DataNode $n_7$ as the leader.
- Select RegionGroup $r_7$ on DataNode $n_7$ as the leader.
- Select RegionGroup $r_8$ on DataNode $n_8$ as the leader.

Note that the above steps strictly follow the Greedy algorithm. However, by step 3, selecting the leader of RegionGroup $r_7$ on either DataNode $n_5$ or $n_7$ would result in uneven leader distribution. The root cause is that each greedy selection step lacks a global perspective, ultimately leading to a local optimum.

To address this issue, IoTDB adopts a **leader selection algorithm** that continuously balances the distribution of leader across the cluster. As a result, the cluster achieves balanced computation load distribution, ensuring its performance.

## 3. Source Code

- [Data Partitioning](https://github.com/apache/iotdb/tree/master/iotdb-core/node-commons/src/main/java/org/apache/iotdb/commons/partition)
- [Partition Allocation](https://github.com/apache/iotdb/tree/master/iotdb-core/confignode/src/main/java/org/apache/iotdb/confignode/manager/load/balancer/partition)
- [Region Placement](https://github.com/apache/iotdb/tree/master/iotdb-core/confignode/src/main/java/org/apache/iotdb/confignode/manager/load/balancer/region)
- [Leader Selection](https://github.com/apache/iotdb/tree/master/iotdb-core/confignode/src/main/java/org/apache/iotdb/confignode/manager/load/balancer/router/leader)