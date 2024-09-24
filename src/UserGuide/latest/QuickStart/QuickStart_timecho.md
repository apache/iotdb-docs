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

1.  Prepare the necessary machine resources: The deployment and operation of IoTDB require consideration of multiple aspects of machine resource configuration. Specific resource allocation can be viewed [Database Resources](../Deployment-and-Maintenance/Database-Resources.md)

2. Complete system configuration preparation: The system configuration of IoTDB involves multiple aspects, and the key system configuration introductions can be viewed [System Requirements](../Deployment-and-Maintenance/Environment-Requirements.md)

3. Get installation package: You can contact Timecho Business to obtain the IoTDB installation package to ensure that the downloaded version is the latest and stable. The specific installation package structure can be viewed: [Obtain TimechoDB](../Deployment-and-Maintenance/IoTDB-Package_timecho.md)

4. Install database and activate: You can choose the following tutorials for installation and deployment based on the actual deployment architecture:

   - Stand-Alone Deployment:  [Stand-Alone Deployment](../Deployment-and-Maintenance/Stand-Alone-Deployment_timecho.md)

   - Cluster Deployment: [Cluster Deployment](../Deployment-and-Maintenance/Cluster-Deployment_timecho.md)

   - Dual Active Deployment: [Dual Active Deployment](../Deployment-and-Maintenance/Dual-Active-Deployment_timecho.md)

> ❗️Attention: Currently, we still recommend installing and deploying directly on physical/virtual machines. If Docker deployment is required, please refer to: [Docker Deployment](../Deployment-and-Maintenance/Docker-Deployment_timecho.md)

5. Install database supporting tools: The enterprise version database provides a monitoring panel 、Workbench Supporting tools, etc，It is recommended to install IoTDB when deploying the enterprise version, which can help you use IoTDB more conveniently:

   - Monitoring panel：Provides over a hundred database monitoring metrics for detailed monitoring of IoTDB and its operating system, enabling system optimization, performance optimization, bottleneck discovery, and more. The installation steps can be viewed [Monitoring panel](../Deployment-and-Maintenance/Monitoring-panel-deployment.md)

   - Workbench: It is the visual interface of IoTDB,Support providing through interface interaction Operate Metadata、Query Data、Data Visualization and other functions, help users use the database easily and efficiently, and the installation steps can be viewed [Workbench Deployment](../Deployment-and-Maintenance/workbench-deployment.md)

## How to use it?

1. Database modeling design: Database modeling is an important step in creating a database system, which involves designing the structure and relationships of data to ensure that the organization of data meets the specific application requirements. The following document will help you quickly understand the modeling design of IoTDB:

   - Introduction to the concept of timeseries：[Navigating Time Series Data](../Basic-Concept/Navigating_Time_Series_Data.md)

   - Introduction to Modeling Design: [Data Model](../Basic-Concept/Data-Model-and-Terminology.md)

   - SQL syntax introduction：[Operate Metadata](../User-Manual/Operate-Metadata_timecho.md)

2. Write Data: In terms of data writing, IoTDB provides multiple ways to insert real-time data. Please refer to the basic data writing operations for details [Write Data](../User-Manual/Write-Delete-Data.md)

3. Query Data: IoTDB provides rich data query functions. Please refer to the basic introduction of data query [Query Data](../User-Manual/Query-Data.md)

4. Other advanced features: In addition to common functions such as writing and querying in databases, IoTDB also supports "Data Synchronisation、Stream Framework、Security Management、Database Administration、AI Capability"and other functions, specific usage methods can be found in the specific document:

   - Data Synchronisation: [Data Synchronisation](../User-Manual/Data-Sync_timecho.md)

   - Stream Framework: [Stream Framework](../User-Manual/Streaming_timecho.md)

   - Security Management: [Security Management](../User-Manual/Security-Management_timecho.md)

   - Database Administration: [Database Administration](../User-Manual/Authority-Management.md)

   - AI Capability :[AI Capability](../User-Manual/AINode_timecho.md)

5. API: IoTDB provides multiple application programming interfaces (API) for developers to interact with IoTDB in their applications, and currently supports[ Java Native API](../API/Programming-Java-Native-API.md)、[Python Native API](../API/Programming-Python-Native-API.md)、[C++ Native API](../API/Programming-Cpp-Native-API.md)、[Go Native API](../API/Programming-Go-Native-API.md), For more API, please refer to the official website 【API】 and other chapters

## What other convenient peripheral tools are available?

In addition to its rich features, IoTDB also has a comprehensive range of tools in its surrounding system. This document will help you quickly use the peripheral tool system :

   - Benchmark Tool: IoT benchmark is a time series database benchmark testing tool developed based on Java and big data environments, developed and open sourced by the School of Software at Tsinghua University. It supports multiple writing and querying methods, can store test information and results for further query or analysis, and supports integration with Tableau to visualize test results. For specific usage instructions, please refer to: [Benchmark Tool](../Tools-System/Benchmark.md)

   - Data Import Export Script: Used to achieve the interaction between internal data and external files in IoTDB, suitable for batch operations of individual files or directory files. For specific usage instructions, please refer to: [Data Import Export Script](../Tools-System/Data-Import-Export-Tool.md)

   - TsFile Import Export Script: For different scenarios, IoTDB provides users with multiple ways to batch import data. For specific usage instructions, please refer to: [TsFile Import Export Script](../Tools-System/TsFile-Import-Export-Tool.md)

## Encountering problems during use?

If you encounter difficulties during installation or use, you can move to [Frequently Asked Questions](../FAQ/Frequently-asked-questions.md) View in the middle