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
# Quick Start

This document will help you understand how to quickly get started with IoTDB.

## How to install and deploy?

This document will help you quickly install and deploy IoTDB. You can quickly locate the content you need to view through the following document links:

1.  Prepare the necessary machine resources: The deployment and operation of IoTDB require consideration of multiple aspects of machine resource configuration. Specific resource allocation can be viewed [Database Resources](https://www.timecho.com/docs/zh/UserGuide/latest/Deployment-and-Maintenance/Database-Resources.html)

2. Complete system configuration preparation: The system configuration of IoTDB involves multiple aspects, and the key system configuration introductions can be viewed [System Requirements](https://www.timecho.com/docs/UserGuide/latest/Deployment-and-Maintenance/Environment-Requirements.html)

3. Get installation package: You can contact Timecho Business to obtain the IoTDB installation package to ensure that the downloaded version is the latest and stable. The specific installation package structure can be viewed: [Obtain TimechoDB](https://www.timecho.com/docs/UserGuide/latest/Deployment-and-Maintenance/IoTDB-Package_timecho.html)

4. Install database and activate: You can choose the following tutorials for installation and deployment based on the actual deployment architecture:

   - Stand-Alone Deployment:  [Stand-Alone Deployment](https://www.timecho.com/docs/UserGuide/latest/Deployment-and-Maintenance/Stand-Alone-Deployment_timecho.html)

   - Cluster Deployment: [Cluster Deployment](https://www.timecho.com/docs/zh/UserGuide/latest/Deployment-and-Maintenance/Cluster-Deployment_timecho.html)

   - Dual Active Deployment: [Dual Active Deployment](https://www.timecho.com/docs/UserGuide/latest/Deployment-and-Maintenance/Dual-Active-Deployment_timecho.html)

> ❗️Attention: Currently, we still recommend installing and deploying directly on physical/virtual machines. If Docker deployment is required, please refer to: [Docker Deployment](https://www.timecho.com/docs/UserGuide/latest/Deployment-and-Maintenance/Docker-Deployment_timecho.html)

5. Install database supporting tools: The enterprise version database provides a monitoring panel 、Workbench Supporting tools, etc，It is recommended to install IoTDB when deploying the enterprise version, which can help you use IoTDB more conveniently:

   - Monitoring panel：Provides over a hundred database monitoring metrics for detailed monitoring of IoTDB and its operating system, enabling system optimization, performance optimization, bottleneck discovery, and more. The installation steps can be viewed [Monitoring panel](https://www.timecho.com/docs/UserGuide/latest/Deployment-and-Maintenance/Monitoring-panel-deployment.html)

   - Workbench: It is the visual interface of IoTDB,Support providing through interface interaction Operate Metadata、Query Data、Data Visualization and other functions, help users use the database easily and efficiently, and the installation steps can be viewed [Workbench Deployment](https://www.timecho.com/docs/UserGuide/latest/Deployment-and-Maintenance/Monitoring-panel-deployment.html)

## How to use it?

1. Database modeling design: Database modeling is an important step in creating a database system, which involves designing the structure and relationships of data to ensure that the organization of data meets the specific application requirements. The following document will help you quickly understand the modeling design of IoTDB:

   - Introduction to the concept of timeseries：[Navigating Time Series Data](https://www.timecho.com/docs/UserGuide/latest/Basic-Concept/Navigating_Time_Series_Data.html)

   - Introduction to Modeling Design: [Data Model](https://www.timecho.com/docs/UserGuide/latest/Basic-Concept/Data-Model-and-Terminology.html)

   - SQL syntax introduction：[Operate Metadata](https://www.timecho.com/docs/UserGuide/latest/User-Manual/Operate-Metadata_timecho.html)

2. Write Data: In terms of data writing, IoTDB provides multiple ways to insert real-time data. Please refer to the basic data writing operations for details [Write Data](https://www.timecho.com/docs/UserGuide/latest/User-Manual/Write-Delete-Data.html)

3. Query Data: IoTDB provides rich data query functions. Please refer to the basic introduction of data query [Query Data](https://www.timecho.com/docs/UserGuide/latest/User-Manual/Query-Data.html)

4. Other advanced features: In addition to common functions such as writing and querying in databases, IoTDB also supports "Data Synchronisation、Stream Framework、Security Management、Database Administration、AI Capability"and other functions, specific usage methods can be found in the specific document:

   - Data Synchronisation: [Data Synchronisation](https://www.timecho.com/docs/UserGuide/latest/User-Manual/Data-Sync_timecho.html)

   - Stream Framework: [Stream Framework](https://www.timecho.com/docs/UserGuide/latest/User-Manual/Streaming_timecho.html)

   - Security Management: [Security Management](https://www.timecho.com/docs/UserGuide/latest/User-Manual/Security-Management_timecho.html)

   - Database Administration: [Database Administration](https://www.timecho.com/docs/UserGuide/latest/User-Manual/Authority-Management.html)

   - AI Capability :[AI Capability](https://www.timecho.com/docs/UserGuide/latest/User-Manual/AINode_timecho.html)

5. API: IoTDB provides multiple application programming interfaces (API) for developers to interact with IoTDB in their applications, and currently supports[ Java Native API](https://www.timecho.com/docs/UserGuide/latest/API/Programming-Java-Native-API.html)、[Python Native API](https://www.timecho.com/docs/UserGuide/latest/API/Programming-Python-Native-API.html)、[C++ Native API](https://www.timecho.com/docs/UserGuide/latest/API/Programming-Cpp-Native-API.html)、[Go Native API](https://www.timecho.com/docs/UserGuide/latest/API/Programming-Go-Native-API.html), For more API, please refer to the official website 【API】 and other chapters

## What other convenient peripheral tools are available?

In addition to its rich features, IoTDB also has a comprehensive range of tools in its surrounding system. This document will help you quickly use the peripheral tool system :

- Benchmark Tool: IoT benchmark is a time series database benchmark testing tool developed based on Java and big data environments, developed and open sourced by the School of Software at Tsinghua University. It supports multiple writing and querying methods, can store test information and results for further query or analysis, and supports integration with Tableau to visualize test results. For specific usage instructions, please refer to: [Benchmark Tool](https://www.timecho.com/docs/UserGuide/latest/Tools-System/Benchmark.html)

- Data Import Export Script: Used to achieve the interaction between internal data and external files in IoTDB, suitable for batch operations of individual files or directory files. For specific usage instructions, please refer to: [Data Import Export Script](https://www.timecho.com/docs/UserGuide/latest/Tools-System/Data-Import-Export-Tool.html)

- TsFile Import Export Script: For different scenarios, IoTDB provides users with multiple ways to batch import data. For specific usage instructions, please refer to: [TsFile Import Export Script](https://www.timecho.com/docs/UserGuide/latest/Tools-System/TsFile-Import-Export-Tool.html)

## Encountering problems during use?

If you encounter difficulties during installation or use, you can move to [Frequently Asked Questions](https://www.timecho.com/docs/UserGuide/latest/FAQ/Frequently-asked-questions.html) View in the middle