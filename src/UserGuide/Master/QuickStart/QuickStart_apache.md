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

1. Prepare the necessary machine resources:The deployment and operation of IoTDB require consideration of multiple aspects of machine resource configuration. Specific resource allocation can be viewed [Database Resources](https://iotdb.apache.org/UserGuide/latest/Deployment-and-Maintenance/Database-Resources.html)

2. Complete system configuration preparation:The system configuration of IoTDB involves multiple aspects, and the key system configuration introductions can be viewed [System Requirements](https://iotdb.apache.org/UserGuide/latest/Deployment-and-Maintenance/Environment-Requirements.html)

3. Get installation package:You can visit [Apache IoTDB official website](https://iotdb.apache.org/zh/Download/ ) Get the IoTDB installation package.The specific installation package structure can be viewed: [Obtain IoTDB](https://iotdb.apache.org/UserGuide/latest/Deployment-and-Maintenance/IoTDB-Package_apache.html)

4. Install database：You can choose the following tutorials for installation and deployment based on the actual deployment architecture:

   - Stand-Alone Deployment：[Stand-Alone Deployment](https://iotdb.apache.org/UserGuide/latest/Deployment-and-Maintenance/Stand-Alone-Deployment_apache.html)

   - Cluster Deployment：[Cluster Deployment](https://iotdb.apache.org/UserGuide/latest/Deployment-and-Maintenance/Cluster-Deployment_apache.html)

> ❗️Attention: Currently, we still recommend installing and deploying directly on physical/virtual machines. If Docker deployment is required, please refer to: [Docker Deployment](https://iotdb.apache.org/UserGuide/latest/Deployment-and-Maintenance/Docker-Deployment_apache.html)

## How to use it?

1. Database modeling design: Database modeling is an important step in creating a database system, which involves designing the structure and relationships of data to ensure that the organization of data meets the specific application requirements. The following document will help you quickly understand the modeling design of IoTDB:

   - Introduction to the concept of timeseries：[Navigating Time Series Data](https://iotdb.apache.org/UserGuide/latest/Basic-Concept/Navigating_Time_Series_Data.html)

   - Introduction to Modeling Design:：[Data Model](https://iotdb.apache.org/zh/UserGuide/latest/Basic-Concept/Data-Model-and-Terminology.html)

   - SQL syntax introduction: [Operate Metadata](https://iotdb.apache.org/UserGuide/latest/User-Manual/Operate-Metadata_apache.html)

2. Write Data: In terms of data writing, IoTDB provides multiple ways to insert real-time data. Please refer to the basic data writing operations for details [Write Data](https://iotdb.apache.org/UserGuide/latest/User-Manual/Query-Data.html)

3. Query Data: IoTDB provides rich data query functions. Please refer to the basic introduction of data query [Query Data](https://iotdb.apache.org/UserGuide/latest/User-Manual/Query-Data.html)

4. Other advanced features: In addition to common functions such as writing and querying in databases, IoTDB also supports "Data Synchronisation、Stream Framework、Database Administration " and other functions, specific usage methods can be found in the specific document:

   - Data Synchronisation: [Data Synchronisation](https://iotdb.apache.org/UserGuide/latest/User-Manual/Data-Sync_apache.html)

   - Stream Framework: [Stream Framework](https://iotdb.apache.org/UserGuide/latest/User-Manual/Streaming_apache.html)

   - Database Administration: [Database Administration](https://iotdb.apache.org/UserGuide/latest/User-Manual/Authority-Management.html)

5. API: IoTDB provides multiple application programming interfaces (API) for developers to interact with IoTDB in their applications, and currently supports [Java Native API](https://iotdb.apache.org/UserGuide/latest/API/Programming-Java-Native-API.html)、[Python Native API](https://iotdb.apache.org/UserGuide/latest/API/Programming-Python-Native-API.html)、[C++ Native API](https://iotdb.apache.org/UserGuide/latest/API/Programming-Cpp-Native-API.html) ,For more API, please refer to the official website 【API】 and other chapters

## What other convenient peripheral tools are available?

In addition to its rich features, IoTDB also has a comprehensive range of tools in its surrounding system. This document will help you quickly use the peripheral tool system : 

- Benchmark Tool: IoT benchmark is a time series database benchmark testing tool developed based on Java and big data environments, developed and open sourced by the School of Software at Tsinghua University. It supports multiple writing and querying methods, can store test information and results for further query or analysis, and supports integration with Tableau to visualize test results. For specific usage instructions, please refer to:https://iotdb.apache.org/UserGuide/latest/Tools-System/Benchmark.html)

- Data Import Export Script: Used to achieve the interaction between internal data and external files in IoTDB, suitable for batch operations of individual files or directory files. For specific usage instructions, please refer to: [Data Import Export Script](https://iotdb.apache.org/UserGuide/latest/Tools-System/Data-Import-Export-Tool.html)

- TsFile Import Export Script: For different scenarios, IoTDB provides users with multiple ways to batch import data. For specific usage instructions, please refer to:  [TsFile Import Export Script](https://iotdb.apache.org/UserGuide/latest/Tools-System/TsFile-Import-Export-Tool.html)

## Encountering problems during use?

If you encounter difficulties during installation or use, you can move to [Frequently Asked Questions](https://iotdb.apache.org/UserGuide/latest/FAQ/Frequently-asked-questions.html) View in the middle

