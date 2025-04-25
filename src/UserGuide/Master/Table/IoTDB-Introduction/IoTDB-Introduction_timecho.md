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
# IoTDB Introduction

TimechoDB is a high-performance, cost-efficient, and IoT-native time-series database developed by Timecho. As an enterprise-grade extension of Apache IoTDB, it is designed to tackle the complexities of managing large-scale time-series data in IoT environments. These challenges include high-frequency data sampling, massive data volumes, out-of-order data, extended processing times, diverse analytical demands, and high storage and maintenance costs.

TimechoDB enhances Apache IoTDB with superior functionality, optimized performance, enterprise-grade reliability, and an intuitive toolset, enabling industrial users to streamline data operations and unlock deeper insights.

- [Quick Start](../QuickStart/QuickStart_timecho.md): Download, Deploy, and Use

## 1. TimechoDB Data Management Solution

The Timecho ecosystem provides an integrated **collect-store-use** solution, covering the complete lifecycle of time-series data, from acquisition to analysis.

![](/img/Introduction-en-timecho-new.png)

Key components include:

1. **Time-Series Database (TimechoDB)**:
    1. The primary storage and processing engine for time-series data, based on Apache IoTDB.
    2. Offers **high compression, advanced** **query** **capabilities, real-time stream processing, high availability, and scalability**.
    3. Provides **security features, multi-language APIs, and seamless integration with external systems**.
2. **Time-Series Standard File Format** **(Apache** **TsFile)**:
    1. A high-performance storage format originally developed by Timecho’s core contributors.
    2. Enables **efficient compression and fast querying**.
    3. Powers TimechoDB’s **data collection, storage, and analysis pipeline**, ensuring unified data management
3. **Time-Series AI Engine** **(AINode)**:
    1. Integrates **machine learning and deep learning** for time-series analytics.
    2. Extracts actionable insights directly from TimechoDB-stored data.
4. **Data Collection Framework**:
    1. Supports **various industrial protocols, resumable transfers, and network barrier penetration**.
    2. Facilitates **reliable data acquisition in challenging industrial environments**.

## 2. TimechoDB Architecture

The diagram below illustrates a common cluster deployment (3 ConfigNodes, 3 DataNodes) of TimechoDB:

![](/img/Cluster-Concept03.png)

## 3. Key Features

TimechoDB offers the following advantages:

**Flexible Deployment:**

- Supports one-click cloud deployment, on-premise installation, and seamless terminal-cloud synchronization.
- Adapts to hybrid, edge, and cloud-native architectures

**Cost-Efficient Storage:**

- Utilizes high compression ratio storage, eliminating the need for separate real-time and historical databases.
- Supports unified data management across different time horizons.

**Hierarchical** **Data** **Organization:**

- Mirrors real-world industrial structures through hierarchical measurement point modeling.
- Enables directory-based navigation, search, and retrieval.

**High-Throughput Read****&****Write:**

- Optimized for millions of concurrent device connections.
- Handles multi-frequency and out-of-order data ingestion with high efficiency.

**Advanced Time-Series Query Semantics** **:**

- Features a native time-series computation engine with built-in timestamp alignment.
- Provides nearly 100 aggregation and analytical functions, enabling AI-powered time-series insights.

**Enterprise-Grade High Availability** **:**

- Distributed HA architecture ensures 24/7 real-time database services.
- Automated resource balancing when nodes are added, removed, or overheated.
- Supports heterogeneous clusters with varying hardware configurations.

**Operational Simplicity** **:**

- Standard SQL query syntax for ease of use.
- Multi-language APIs for flexible development.
- Comes with a comprehensive toolset, including an intuitive management console

**Robust Ecosystem Integration:**

- Seamlessly integrates with big data frameworks (Hadoop, Spark) and visualization tools (Grafana, ThingsBoard, DataEase).
- Supports device management for industrial IoT environments.

## 4. Enterprise-level Enhancements

TimechoDB extends the open-source version with advanced industrial-grade capabilities, including tiered storage, cloud-edge collaboration, visualization tools, and security upgrades.

**Dual-Active Deployment:**

- Implements active-active high availability, ensuring continuous operations.
- Two independent clusters perform real-time bidirectional synchronization.
- Both systems accept external writes and maintain eventual consistency.

**Seamless Data Synchronization** **:**

- Built-in synchronization module supports real-time and batch data aggregation from field devices to central hubs.
- Supports full, partial, and cascading aggregation.
- Includes enterprise-ready plugins for cross air-gap transmission, encrypted transmission, and compression.

**Tiered** **Storage:**

- Dynamically categorizes data into hot, warm, and cold tiers.
- Efficiently balances SSD, HDD, and cloud storage utilization.
- Automatically optimizes data access speed and storage costs.

**Enhanced Security** **:**

- Implements whitelist-based access control and audit logging.
- Strengthens data governance and risk mitigation.

**Feature Comparison**:

<table style="text-align: left;">
  <tbody>
     <tr>            <th colspan="2">Function</th>
            <th>Apache IoTDB</th>        
            <th>TimechoDB</th>
      </tr>
      <tr>
            <td rowspan="4">Deployment Mode</td>  
            <td>Stand-Alone Deployment</td> 
            <td>√</td> 
            <td>√</td> 
      </tr>
      <tr>
            <td>Distributed Deployment</td> 
            <td>√</td> 
            <td>√</td> 
      </tr>
      <tr>
            <td>Dual Active Deployment</td> 
            <td>×</td> 
            <td>√</td> 
      </tr>
       <tr>
            <td>Container Deployment</td> 
            <td>Partial support</td> 
            <td>√</td> 
      </tr>
      <tr>
            <td rowspan="13">Database Functionality</td>  
            <td>Sensor Management</td> 
            <td>√</td> 
            <td>√</td>       
      </tr>
      <tr>
            <td>Write Data</td> 
            <td>√</td> 
            <td>√</td>        
      </tr>
      <tr>
            <td>Query Data</td> 
            <td>√</td> 
            <td>√</td>
      </tr>
      <tr>
            <td>Continuous Query</td> 
            <td>√</td> 
            <td>√</td>
      </tr>
      <tr>
            <td>Trigger</td> 
            <td>√</td> 
            <td>√</td>
      </tr>
      <tr>
            <td>User Defined Function</td> 
            <td>√</td> 
            <td>√</td>
      </tr>
      <tr>
            <td>Permission Management</td> 
            <td>√</td> 
            <td>√</td>
      </tr>
      <tr>
            <td>Data Synchronisation</td> 
            <td>Only file synchronization, no built-in plugins</td> 
            <td>Real time synchronization+file synchronization, enriched with built-in plugins</td>
      </tr>
      <tr>
            <td>Stream Processing</td> 
            <td>Only framework, no built-in plugins</td> 
            <td>Framework+rich built-in plugins</td>
      </tr>
      <tr>
            <td>Tiered Storage</td> 
            <td>×</td> 
            <td>√</td>
      </tr>
      <tr>
            <td>View</td> 
            <td>×</td> 
            <td>√</td>
      </tr>
      <tr>
            <td>White List</td> 
            <td>×</td> 
            <td>√</td>
      </tr>
      <tr>
            <td>Audit Log</td> 
            <td>×</td> 
            <td>√</td>
      </tr>
      <tr>
            <td rowspan="3">Supporting Tools</td>  
            <td>Workbench</td> 
            <td>×</td> 
            <td>√</td>       
      </tr>
      <tr>
            <td>Cluster Management Tool</td> 
            <td>×</td> 
            <td>√</td>
      </tr>
      <tr>
            <td>System Monitor Tool</td> 
            <td>×</td> 
            <td>√</td>
      </tr>
      <tr>
            <td>Localization</td>  
            <td>Localization Compatibility Certification</td> 
            <td>×</td> 
            <td>√</td>       
      </tr>
      <tr>
            <td rowspan="2">Technical Support</td>  
            <td>Best Practices</td> 
            <td>×</td> 
            <td>√</td>       
      </tr>
      <tr>
            <td>Use Training</td> 
            <td>×</td> 
            <td>√</td>
      </tr>
</tbody>
</table>

### 4.1 Higher Efficiency and Stability

TimechoDB achieves up to 10x performance improvements over Apache IoTDB in mission-critical workloads, and provides rapid fault recovery for industrial environments.

### 4.2 Comprehensive Management Tools

TimechoDB simplifies deployment, monitoring, and maintenance through an intuitive toolset:

- **Cluster Monitoring Dashboard**
    - Real-time insights into IoTDB and underlying OS health.
    - 100+ performance metrics for in-depth monitoring and optimization.
    -
    - ![](/img/Introduction01.png)
    -
    - ![](/img/Introduction02.png)
    -
    - ![](/img/Introduction03.png)
    -  
- **Database Console** **:**
    - Simplifies interaction with an intuitive GUI for metadata management, SQL execution, user permissions, and system configuration.
- **Cluster Management Tool** **:**
    - Provides **one-click operations** for cluster deployment, scaling, start/stop, and configuration updates.

### 4.3 Professional Enterprise Technical Services

TimechoDB offers **vendor-backed enterprise services** to support industrial-scale deployments:

- **On-Site Installation & Training**: Hands-on guidance for fast adoption.
- **Expert Consulting & Advisory**: Performance tuning and best practices.
- **Emergency Support & Remote Assistance**: Minimized downtime for mission-critical operations.
- **Custom Development & Optimization**: Tailored solutions for unique industrial use cases.

Compared to the open-source version’s 2-3 month release cycle, TimechoDB delivers faster updates and same-day critical issue resolutions, ensuring production stability.

### 4.4 Ecosystem Compatibility & Compliance

imechoDB is self-developed, supports mainstream CPUs & operating systems, and meets industry compliance standards, making it a reliable choice for enterprise IoT deployments.  