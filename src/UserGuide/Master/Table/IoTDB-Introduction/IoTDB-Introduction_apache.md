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

Apache IoTDB is a low-cost, high-performance IoT-native time-series database. It addresses challenges faced by enterprises in managing time-series data for IoT big data platforms, including complex application scenarios, massive data volumes, high sampling frequencies, frequent out-of-order data, time-consuming data processing, diverse analytical requirements, and high storage and maintenance costs.

- GitHub Repository: [https://github.com/apache/iotdb](https://github.com/apache/iotdb)
- Open-Source Installation Packages: [https://iotdb.apache.org/Download/](https://iotdb.apache.org/Download/)
- Installation, Deployment, and Usage Documentation: [Quick Start](../QuickStart/QuickStart_apache.md)


## 1. Product Ecosystem

The IoTDB ecosystem consists of multiple components designed to efficiently manage and analyze massive IoT-generated time-series data.

<div style="text-align: center;">  
    <img src="/img/Introduction-en-apache.png" alt="Introduction-en-apache.png" style="width: 90%;"/>  
</div>  


Key components include:

1. **Time-Series Database (Apache IoTDB)**: The core component for time-series data storage, offering high compression, rich query capabilities, real-time stream processing, high availability, and scalability. It provides security guarantees, configuration tools, multi-language APIs, and integration with external systems for building business applications.
2. **Time-Series File Format (Apache TsFile)**: A specialized storage format for time-series data, enabling efficient storage and querying. TsFile underpins IoTDB and AINode, unifying data management across collection, storage, and analysis phases.
3. **Time-Series Model Training-Inference Engine (IoTDB AINode)**: A unified engine for intelligent analysis, supporting model training, data management, and integration with machine/deep learning frameworks.


## 2. IoTDB Architecture

The diagram below illustrates a typical IoTDB cluster deployment (3 ConfigNodes and 3 DataNodes):

<img src="/img/Cluster-Concept03.png" alt="" style="width: 60%;"/>  


## 3. Key Features

Apache IoTDB offers the following advantages:

- **Flexible Deployment**:
    - One-click cloud deployment
    - Out-of-the-box terminal usage
    - Seamless terminal-cloud synchronization

- **Cost-Effective Storage**:
    - High-compression disk storage
    - Unified management of historical and real-time data

- **Hierarchical Measurement Point Management**:
    - Aligns with industrial device hierarchies
    - Supports directory browsing and search

- **High Throughput Read/Write**:
    - Supports millions of devices
    - Handles high-speed, out-of-order, and multi-frequency data ingestion

- **Rich Query Capabilities**:
    - Native time-series computation engine
    - Timestamp alignment during queries
    - Over 100 built-in aggregation and time-series functions
    - AI-ready time-series feature analysis

- **High Availability & Scalability**:
    - HA distributed architecture with 24/7 uptime
    - Automatic load balancing for node scaling
    - Heterogeneous cluster support

- **Low Learning Curve**:
    - SQL-like query language
    - Multi-language SDKs
    - Comprehensive toolchain (e.g., console)

- **Ecosystem Integration**:
    - Hadoop, Spark, Grafana, ThingsBoard, DataEase, etc.


## 4. TimechoDB

Timecho Technology has developed **TimechoDB**, a commercial product based on  Apache IoTDB, to provide enterprise-grade solutions and services for businesses and commercial clients. TimechoDB addresses the multifaceted challenges enterprises face when building IoT big data platforms for managing time-series data, including complex application scenarios, massive data volumes, high sampling frequencies, frequent out-of-order data, time-consuming data processing, diverse analytical requirements, and high storage and maintenance costs.

Leveraging **TimechoDB**, Timecho Technology offers a broader range of product features, enhanced performance and stability, and a richer suite of efficiency tools. Additionally, it provides comprehensive enterprise services, delivering commercial clients with superior product capabilities and an optimized experience in development, operation, and usage.
- **Timecho Technology Official Website**: [https://www.timecho.com/](https://www.timecho.com/)
- **TimechoDB Documentation**: [Quick Start](https://www.timecho.com/docs/zh/UserGuide/latest/QuickStart/QuickStart_timecho.html)
