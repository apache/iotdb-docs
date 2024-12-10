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

# Features


* Flexible deployment. 

IoTDB provides users one-click installation tool on the cloud, once-decompressed-used terminal tool and the bridging tool between cloud platforms and terminal tools (Data Synchronization Tool).

* Low storage cost. 

IoTDB can reach a high compression ratio of disk storage, which means IoTDB can store the same amount of data with less hardware disk cost.

* Efficient directory structure. 

IoTDB supports efficient oganization for complex timeseries data structure from intelligent networking devices, oganization for timeseries data from devices of the same type, fuzzy searching strategy for massive and complex directory of timeseries data.
* High-throughput read and write. 

IoTDB supports millions of low-power devices' strong connection data access, high-speed data read and write for intelligent networking devices and mixed devices mentioned above.

* Rich query semantics. 

IoTDB supports time alignment for timeseries data accross devices and sensors, computation in timeseries field (frequency domain transformation) and rich aggregation function support in time dimension.

* Easy to get started. 

IoTDB supports SQL-Like language, JDBC standard API and import/export tools which are easy to use.

* Intense integration with Open Source Ecosystem. 

IoTDB supports Hadoop, Spark, etc. analysis ecosystems and Grafana visualization tool.

* Unified data access mode

IoTDB eliminates the need for database partitioning or sharding and makes no distinction between historical and real-time databases.

* High availability support

IoTDB supports a HA distributed architecture, ensuring 7x24 uninterrupted real-time database services. Users can connect to any node within the cluster for system access. The system remains operational and unaffected even during physical node outages or network failures. As physical nodes are added, removed, or face performance issues, IoTDB automatically manages load balancing for both computational and storage resources. Furthermore, it's compatible with heterogeneous environments, allowing servers of varying types and capabilities to form a cluster, with load balancing optimized based on the specific configurations of each server.
