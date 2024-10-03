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

# Partitioning & Load Balance
This document introduces the partitioning strategies and load balance algorithms in IoTDB. According to the characteristics of time series data, IoTDB partitions them by series and time dimensions. Combining a series partition with a time partition creates a partition, the unit of division. To enhance throughput and reduce management costs, these partitions are evenly allocated to RegionGroups, which serve as the unit of replication. The RegionGroup's Regions then determine the storage location, with the leader Region managing the primary load. During this process, the Region placement algorithm determines which nodes will host the replicas, while the leader selection algorithm designates which Region will act as the leader.

## Partitioning Strategy & Partition Allocation
IoTDB implements tailored partitioning operators for time series data. Building on this foundation, the partition information cached on both ConfigNodes and DataNodes is not only manageable in size but also clearly differentiated between hot and cold. Subsequently, balanced partitions are evenly allocated across the cluster's RegionGroups to achieve storage balance.

### Partitioning Strategy
IoTDB maps each sensor in the production environment to a time series. The time series are then partitioned using the series partitioning operator to manage their schema, and combined with the time partitioning operator to manage their data. The following figure illustrates how IoTDB partitions time series data.

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="https://alioss.timecho.com/docs/img/partition_table_en.png?raw=true">

#### Partitioning Operator
Because numerous devices and sensors are commonly deployed in production environments, IoTDB employs the series partitioning operator to ensure the size of partition information is manageable. Since the generated time series associated with timestamps, IoTDB uses the time partioning operator to clearly distinguish between hot and cold partitions.

##### Series Partitioning Operator
By default, IoTDB limits the number of series partitions to 1000 and configures the series partitioning operator to use a hash partitioning strategy. This leads to the following outcomes:
+ Since the number of series partitions is a fixed constant, the mapping between series and series partitions remains stable. As a result, IoTDB does not require frequent data migrations.
+ The load across series partitions is relatively balanced because the number of series partitions is much smaller than the number of sensors deployed in the production environment.

Furthermore, if a more accurate estimate of the actual load in the production environment is available, the series partitioning operator can be configured to use a customized hash partitioning strategy or a list partitioning strategy to achieve a more uniform load distribution across all series partitions.

##### Time Partitioning Operator
The time partitioning operator converts a given timestamp to the corresponding time partition by

$$\left\lfloor\frac{\text{Timestamp}-\text{StartTimestamp}}{\text{TimePartitionInterval}}\right\rfloor.$$

In this equation, both $\text{StartTimestamp}$ and $\text{TimePartitionInterval}$ are configurable parameters to accommodate various production environments. The $\text{StartTimestamp}$ represents the starting time of the first time partition, while the $\text{TimePartitionInterval}$ defines the duration of each time partition. By default, the $\text{TimePartitionInterval}$ is set to one day.

#### Schema Partitioning
Since the series partitioning operator evenly partitions the time series, each series partition corresponds to a schema partition. These schema partitions are then evenly allocated across the SchemaRegionGroups to achieve a balanced schema distribution.

#### Data Partitioning
Combining a series partition with a time partition creates a data partition. Since the series partitioning operator evenly partitions the time series, the load of data partitions within a specified time partition remains balanced. These data partitions are then evenly allocated across the DataRegionGroups to achieve balanced data distribution.

### Partition Allocation
IoTDB uses RegionGroups to enable elastic storage of time series, with the number of RegionGroups in the cluster determined by the total resources available across all DataNodes. Since the number of RegionGroups is dynamic, IoTDB can easily scale out. Both the SchemaRegionGroup and DataRegionGroup follow the same partition allocation strategy, which evenly splits all series partitions. The following figure demonstrates the partition allocation process, where the dynamic RegionGroups match the variously expending time series and cluster.

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="https://alioss.timecho.com/docs/img/partition_allocation_en.png?raw=true">

#### RegionGroup Expansion
The number of RegionGroups is given by

$$\text{RegionGroupNumber}=\left\lfloor\frac{\sum_{i=1}^{DataNodeNumber}\text{RegionNumber}_i}{\text{ReplicationFactor}}\right\rfloor.$$

In this equation, $\text{RegionNumber}_i$ represents the number of Regions expected to be hosted on the $i$-th DataNode, while $\text{ReplicationFactor}$ denotes the number of Regions within each RegionGroup. Both $\text{RegionNumber}_i$ and $\text{ReplicationFactor}$ are configurable parameters. The $\text{RegionNumber}_i$ can be determined by the available hardware resources---such as CPU cores, memory sizes, etc.---on the $i$-th DataNode to accommodate different physical servers. The $\text{ReplicationFactor}$ can be adjusted to ensure diverse levels of fault tolerance.

#### Allocation Strategy
Both the SchemaRegionGroup and the DataRegionGroup follow the same allocation strategy--splitting all series partitions evenly. As a result, each SchemaRegionGroup holds the same number of schema partitions, ensuring balanced schema storage. Similarly, for each time partition, each DataRegionGroup acquires the data partitions corresponding to the series partitions it holds. Consequently, the data partitions within a time partition are evenly distributed across all DataRegionGroups, ensuring balanced data storage in each time partition.

Notably, IoTDB effectively leverages the characteristics of time series data. When the TTL (Time to Live) is configured, IoTDB enables migration-free elastic storage for time series data. This feature facilitates cluster expansion while minimizing the impact on online operations. The figures above illustrate an instance of this feature: newborn data partitions are evenly allocated to each DataRegion, and expired data are automatically archived. As a result, the cluster's storage will eventually remain balanced.

## Load Balance
To enhance the cluster's availability and performance, IoTDB employs sophisticated Region placement and leader selection algorithms.

### Region Placement
The number of Regions held by a DataNode reflects its storage load. If the difference in the number of Regions across DataNodes is relatively large, the DataNode with more Regions is likely to become a storage bottleneck. Although a straightforward Round Robin placement algorithm can achieve storage balance by ensuring that each DataNode hosts an equal number of Regions, it compromises the cluster's fault tolerance, as illustrated below:

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="https://alioss.timecho.com/docs/img/placement_en.png?raw=true">

+ Assume the cluster has 4 DataNodes, 4 RegionGroups and a replication factor of 2.
+ Place RegionGroup $r_1$'s 2 Regions on DataNodes $n_1$ and $n_2$.
+ Place RegionGroup $r_2$'s 2 Regions on DataNodes $n_3$ and $n_4$.
+ Place RegionGroup $r_3$'s 2 Regions on DataNodes $n_1$ and $n_3$.
+ Place RegionGroup $r_4$'s 2 Regions on DataNodes $n_2$ and $n_4$.

In this scenario, if DataNode $n_2$ fails, the load previously handled by DataNode $n_2$ would be transferred solely to DataNode $n_1$, potentially overloading it.

To address this issue, IoTDB employs a Region placement algorithm that not only evenly distributes Regions across all DataNodes but also ensures that each DataNode can offload its storage to sufficient other DataNodes in the event of a failure. As a result, the cluster achieves balanced storage distribution and a high level of fault tolerance, ensuring its availability.

### Leader Selection
The number of leader Regions held by a DataNode reflects its computational load. If the difference in the number of leaders across DataNodes is relatively large, the DataNode with more leaders is likely to become a computational bottleneck. If the leader selection process is conducted using a transparent Greedy algorithm, the result may be an unbalanced leader distribution when the Regions are fault-tolerantly placed, as demonstrated below:

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="https://alioss.timecho.com/docs/img/selection_en.png?raw=true">

+ Assume the cluster has 4 DataNodes, 4 RegionGroups and a replication factor of 2.
+ Select RegionGroup $r_5$'s Region on DataNode $n_5$ as the leader.
+ Select RegionGroup $r_6$'s Region on DataNode $n_7$ as the leader.
+ Select RegionGroup $r_7$'s Region on DataNode $n_7$ as the leader.
+ Select RegionGroup $r_8$'s Region on DataNode $n_8$ as the leader.

Please note that all the above steps strictly follow the Greedy algorithm. However, by Step 3, selecting the leader of RegionGroup $r_7$ on either DataNode $n_5$ or $n_7$ results in an unbalanced leader distribution. The rationale is that each greedy step lacks a global perspective, leading to a locally optimal solution.

To address this issue, IoTDB employs a leader selection algorithm that can consistently balance the cluster's leader distribution. Consequently, the cluster achieves balanced computational load distribution, ensuring its performance.

## Source Code
+ [Data Partitioning](https://github.com/apache/iotdb/tree/master/iotdb-core/node-commons/src/main/java/org/apache/iotdb/commons/partition)
+ [Partition Allocation](https://github.com/apache/iotdb/tree/master/iotdb-core/confignode/src/main/java/org/apache/iotdb/confignode/manager/load/balancer/partition)
+ [Region Placement](https://github.com/apache/iotdb/tree/master/iotdb-core/confignode/src/main/java/org/apache/iotdb/confignode/manager/load/balancer/region)
+ [Leader Selection](https://github.com/apache/iotdb/tree/master/iotdb-core/confignode/src/main/java/org/apache/iotdb/confignode/manager/load/balancer/router/leader)