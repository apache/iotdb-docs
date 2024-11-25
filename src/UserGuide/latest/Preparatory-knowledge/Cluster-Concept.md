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

# Cluster-related Concepts
The figure below illustrates a typical IoTDB 3C3D1A cluster deployment mode, comprising 3 ConfigNodes, 3 DataNodes, and 1 AINode:  
<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="https://alioss.timecho.com/docs/img/Common-Concepts_02.png">

This deployment involves several key concepts that users commonly encounter when working with IoTDB clusters, including:  
- **Nodes** (ConfigNode, DataNode, AINode);  
- **Slots** (SchemaSlot, DataSlot);  
- **Regions** (SchemaRegion, DataRegion);  
- **Replica Groups**.

The following sections will provide a detailed introduction to these concepts.

## Nodes

An IoTDB cluster consists of three types of nodes (processes): **ConfigNode** (the main node), **DataNode**, and **AINode**, as detailed below:
- **ConfigNode:** ConfigNodes store cluster configurations, database metadata, the routing information of time series' schema and data. They also monitor cluster nodes and conduct load balancing. All ConfigNodes maintain full mutual backups, as shown in the figure with ConfigNode-1, ConfigNode-2, and ConfigNode-3. ConfigNodes do not directly handle client read or write requests. Instead, they guide the distribution of time series' schema and data within the cluster using a series of [load balancing algorithms](https://iotdb.apache.org/UserGuide/latest/Technical-Insider/Cluster-data-partitioning.html).
- **DataNode:** DataNodes are responsible for reading and writing time series' schema and data. Each DataNode can accept client read and write requests and provide corresponding services, as illustrated with DataNode-1, DataNode-2, and DataNode-3 in the above figure. When a DataNode receives client requests, it can process them directly or forward them if it has the relevant routing information cached locally. Otherwise, it queries the ConfigNode for routing details and caches the information to improve the efficiency of subsequent requests.
- **AINode:** AINodes interact with ConfigNodes and DataNodes to extend IoTDB's capabilities for machine learning analysis on time series data. They support registering pre-trained machine learning models from external sources and performing time series analysis tasks using simple SQL statements on specified data. This process integrates model creation, management, and inference within the database engine. Currently, the system provides built-in algorithms or custom models for common time series analysis scenarios, such as forecasting and anomaly detection.

## Slots

IoTDB divides time series' schema and data into smaller, more manageable units called **slots**. Slots are logical entities, and in an IoTDB cluster, the **SchemaSlots** and **DataSlots** are defined as follows:
- **SchemaSlot:** A SchemaSlot represents a subset of the time series' schema collection. The total number of SchemaSlots is fixed, with a default value of 1000. IoTDB uses a hashing algorithm to evenly distribute all devices across these SchemaSlots.
- **DataSlot:** A DataSlot represents a subset of the time series' data collection. Based on the SchemaSlots, the data for corresponding devices is further divided into DataSlots by a fixed time interval. The default time interval for a DataSlot is 7 days.

## Region

In IoTDB, time series' schema and data are replicated across DataNodes to ensure high availability in the cluster. However, replicating data at the slot level can increase management complexity and reduce write throughput. To address this, IoTDB introduces the concept of **Region**, which groups SchemaSlots and DataSlots into **SchemaRegions** and **DataRegions** respectively. Replication is then performed at the Region level. The definitions of SchemaRegion and DataRegion are as follows:
- **SchemaRegion**: A SchemaRegion is the basic unit for storing and replicating time series' schema. All SchemaSlots in a database are evenly distributed across the database's SchemaRegions. SchemaRegions with the same RegionID are replicas of each other. For example, in the figure above, SchemaRegion-1 has three replicas located on DataNode-1, DataNode-2, and DataNode-3.  
- **DataRegion**: A DataRegion is the basic unit for storing and replicating time series' data. All DataSlots in a database are evenly distributed across the database's DataRegions. DataRegions with the same RegionID are replicas of each other. For instance, in the figure above, DataRegion-2 has two replicas located on DataNode-1 and DataNode-2.  

## Replica Groups
Region replicas are critical for the fault tolerance of the cluster. Each Region's replicas are organized into **replica groups**, where the replicas are assigned roles as either **leader** or **follower**, working together to provide read and write services. Recommended replica group configurations under different architectures are as follows:

| Category     | Parameter       | Single-node Recommended Configuration | Distributed Recommended Configuration |
|:------------:|:-----------------------:|:------------------------------------:|:-------------------------------------:|
| Schema     | `schema_replication_factor` | 1                                    | 3                                     |
| Data         | `data_replication_factor`   | 1                                    | 2                                     |