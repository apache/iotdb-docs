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

# Common Concepts

## Sql_dialect Related Concepts

| Concept	                    | Meaning                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------- |---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| sql_dialect | Tree model: manages devices and measurement points, manages data in a hierarchical path manner, where one path corresponds to one measurement point of a device.                                                                                 |
| Schema        | Schema is the data model information of the database, i.e., tree structure. It includes definitions such as the names and data types of measurement points.                                                                                                                                                                           |
| Device          | Corresponds to a physical device in an actual scenario, usually containing multiple measurement points.                                                                                                                                                                                                                                                 |
| Timeseries      | Also known as: physical quantity, time series, timeline, point location, semaphore, indicator, measurement value, etc. It is a time series formed by arranging multiple data points in ascending order of timestamps. Usually, a Timeseries represents a collection point that can periodically collect physical quantities of the environment it is in. |
| Encoding        | Encoding is a compression technique that represents data in binary form to improve storage efficiency. IoTDB supports various encoding methods for different types of data. For more detailed information, please refer to:[Encoding-and-Compression](../Technical-Insider/Encoding-and-Compression.md)                                                 |
| Compression     | After data encoding, IoTDB uses compression technology to further compress binary data to enhance storage efficiency. IoTDB supports multiple compression methods. For more detailed information, please refer to: [Encoding-and-Compression](../Technical-Insider/Encoding-and-Compression.md)                                                         |

## Distributed Related Concepts

The following figure shows a common IoTDB 3C3D (3 ConfigNodes, 3 DataNodes) cluster deployment pattern:                

<img src="/img/Cluster-Concept03.png" alt="" style="width: 60%;"/>

IoTDB's cluster includes the following common concepts:

- Nodes（ConfigNode、DataNode、AINode）
- Region（SchemaRegion、DataRegion）
- Replica Groups

The above concepts will be introduced in the following text.


### Nodes

IoTDB cluster includes three types of nodes (processes): ConfigNode (management node), DataNode (data node), and AINode (analysis node), as shown below:

- ConfigNode: Manages cluster node information, configuration information, user permissions, metadata, partition information, etc., and is responsible for the scheduling of distributed operations and load balancing. All ConfigNodes are fully backed up with each other, as shown in ConfigNode-1, ConfigNode-2, and ConfigNode-3 in the figure above.
- DataNode: Serves client requests and is responsible for data storage and computation, as shown in DataNode-1, DataNode-2, and DataNode-3 in the figure above.
- AINode: Provides machine learning capabilities, supports the registration of trained machine learning models, and allows model inference through SQL calls. It has already built-in self-developed time-series large models and common machine learning algorithms (such as prediction and anomaly detection).

### Data Partitioning

In IoTDB, both metadata and data are divided into small partitions, namely Regions, which are managed by various DataNodes in the cluster.

- SchemaRegion: Metadata partition, managing the metadata of a part of devices and measurement points. SchemaRegions with the same RegionID on different DataNodes are mutual replicas, as shown in SchemaRegion-1 in the figure above, which has three replicas located on DataNode-1, DataNode-2, and DataNode-3.
- DataRegion: Data partition, managing the data of a part of devices for a certain period of time. DataRegions with the same RegionID on different DataNodes are mutual replicas, as shown in DataRegion-2 in the figure above, which has two replicas located on DataNode-1 and DataNode-2.
- For specific partitioning algorithms, please refer to: [Data Partitioning](../Technical-Insider/Cluster-data-partitioning.md)

### Replica Groups

The number of replicas for data and metadata can be configured. The recommended configurations for different deployment modes are as follows, where multi-replication can provide high-availability services.

| Category   | Parameter                    | Stand-Alone Recommended Configuration		 | Cluster Recommended Configuration |
| :----- | :------------------------ | :----------- | :----------- |
| Schema | schema_replication_factor | 1            | 3            |
| Data   | data_replication_factor   | 1            | 2            |


## Deployment Related Concepts

IoTDB has three operating modes: Stand-Alone mode, Cluster mode, and Dual-Active mode.

### Stand-Alone Mode 

An IoTDB Stand-Alone instance includes 1 ConfigNode and 1 DataNode, i.e., 1C1D;


- **Features**：Easy for developers to install and deploy, with low deployment and maintenance costs and convenient operations.
- **Applicable Scenarios**：Scenarios with limited resources or low requirements for high availability, such as edge-side servers.
- **Deployment Method**：[Stand-Alone-Deployment](../Deployment-and-Maintenance/Stand-Alone-Deployment_timecho.md)

### Dual-Active Mode 

Dual-active deployment is a feature of TimechoDB Enterprise Edition, which refers to two independent instances performing bidirectional synchronization and can provide services simultaneously. When one instance is restarted after a shutdown, the other instance will resume transmission of the missing data.


> An IoTDB dual-active instance usually consists of 2 single-machine nodes, i.e., 2 sets of 1C1D. Each instance can also be a cluster.

- **Features**：The most resource-efficient high-availability solution.
- **Applicable Scenarios**：Scenarios with limited resources (only two servers) but requiring high-availability capabilities.
- **Deployment Method**：[Dual-Active-Deployment](../Deployment-and-Maintenance/Dual-Active-Deployment_timecho.md)

### Cluster Mode

An IoTDB cluster instance consists of 3 ConfigNodes and no less than 3 DataNodes, usually 3 DataNodes, i.e., 3C3D; when some nodes fail, the remaining nodes can still provide services, ensuring the high availability of the database service, and the database performance can be improved with the addition of nodes.

- **Features**：High availability and scalability, and the system performance can be improved by adding DataNodes.
- **Applicable Scenarios**：Enterprise-level application scenarios requiring high availability and reliability.
- **Deployment Method**：[Cluster-Deployment](../Deployment-and-Maintenance/Cluster-Deployment_timecho.md)

### Summary of Features

| Dimension         | Stand-Alone Mode                     | Dual-Active Mode                  | Cluster Mode                 |
| ------------ | ---------------------------- | ------------------------ | ------------------------ |
| Applicable Scenarios	     | Edge-side deployment, scenarios with low requirements for high availability | High-availability business, disaster recovery scenarios, etc.	 | High-availability business, disaster recovery scenarios, etc. |
| Number of Machines Required	 | 1                            | 2                        | ≥3                       |
| Security and Reliability	   | Cannot tolerate single-point failures	             | High, can tolerate single-point failures	       | High, can tolerate single-point failures	     |
| Scalability	       | Can expand DataNodes to improve performance	     | Each instance can be expanded as needed	      | Can expand DataNodes to improve performance |
| Performance         | Can be expanded with the number of DataNodes	       | Same as the performance of one of the instances	   | Can be expanded with the number of DataNodes   |

- The deployment steps for single-machine mode and cluster mode are similar (adding ConfigNodes and DataNodes one by one), with only the number of replicas and the minimum number of nodes that can provide services being different.