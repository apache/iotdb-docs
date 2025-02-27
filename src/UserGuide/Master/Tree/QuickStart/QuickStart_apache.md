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

This document will guide you through methods to get started quickly with IoTDB.

## 1. How to Install and Deploy?

This guide will assist you in quickly installing and deploying IoTDB. You can quickly navigate to the content you need to review through the following document links:

1.  Prepare the necessary machine resources: The deployment and operation of IoTDB require consideration of various aspects of machine resource configuration. For specific resource configurations, please refer to [Database Resource](../Deployment-and-Maintenance/Database-Resources.md)

2. Complete system configuration preparations: IoTDB's system configuration involves multiple aspects. For an introduction to key system configurations, please see [System Requirements](../Deployment-and-Maintenance/Environment-Requirements.md)

3. Obtain the installation package: You can obtain the IoTDB installation package on the [Apache IoTDB official website](https://iotdb.apache.org/zh/Download/).For the specific structure of the installation package, please refer to[Obtain TimechoDB](../Deployment-and-Maintenance/IoTDB-Package_apache.md)


4. Install the database and activate it: Depending on your actual deployment architecture, you can choose from the following tutorials for installation and deployment:

   - Stand-Alone Deployment: [Stand-Alone Deployment ](../Deployment-and-Maintenance/Stand-Alone-Deployment_apache.md)

   - Cluster Deployment:[Cluster Deployment](../Deployment-and-Maintenance/Cluster-Deployment_apache.md)

> ❗️Note: We currently still recommend direct installation and deployment on physical/virtual machines. For Docker deployment, please refer to [Docker Deployment](../Deployment-and-Maintenance/Docker-Deployment_apache.md)

## 2. How to Use IoTDB?

1. Database Modeling Design: Database modeling is a crucial step in creating a database system, involving the design of data structures and relationships to ensure that the organization of data meets the needs of specific applications. The following documents will help you quickly understand IoTDB's modeling design:
   
   - Introduction to Time Series Concepts: [Navigating Time Series Data](../Background-knowledge/Navigating_Time_Series_Data.md)

   - Introduction to Modeling Design:[Data Model and Terminology](../Background-knowledge/Data-Model-and-Terminology_apache.md)

   - Introduction to SQL syntax[SQL syntax](../Basic-Concept/Operate-Metadata_apache.md)

2. Write Data: In terms of data writing, IoTDB provides multiple ways to insert real-time data. Please refer to the basic data writing operations for details [Write Data](../Basic-Concept/Write-Delete-Data.md)

3. Query Data: IoTDB provides rich data query functions. Please refer to the basic introduction of data query [Query Data](../Basic-Concept/Query-Data.md)

4. Other advanced features: In addition to common functions such as writing and querying in databases, IoTDB also supports "Data Synchronisation、Stream Framework、Database Administration " and other functions, specific usage methods can be found in the specific document:

   - Data Synchronisation: [Data Synchronisation](../User-Manual/Data-Sync_apache.md)

   - Stream Framework: [Stream Framework](../User-Manual/Streaming_apache.md)

   - Authority Management:[Authority Management](../User-Manual/Authority-Management.md)

5. API: IoTDB provides multiple application programming interfaces (API) for developers to interact with IoTDB in their applications, and currently supports [Java Native API](../API/Programming-Java-Native-API.md)、[Python Native API](../API/Programming-Python-Native-API.md)、[C++ Native API](../API/Programming-Cpp-Native-API.md) ,For more API, please refer to the official website 【API】 and other chapters

## 3. What other convenient tools are available?

In addition to its rich features, IoTDB also has a comprehensive range of tools in its surrounding system. This document will help you quickly use the peripheral tool system : 

   - Benchmark Tool: IoT benchmark is a time series database benchmark testing tool developed based on Java and big data environments, developed and open sourced by the School of Software at Tsinghua University. It supports multiple writing and querying methods, can store test information and results for further query or analysis, and supports integration with Tableau to visualize test results. For specific usage instructions, please refer to: [Benchmark Tool](../Tools-System/Benchmark.md)

   - Data Import Script: For different scenarios, IoTDB provides users with multiple ways to batch import data. For specific usage instructions, please refer to: [Data Import](../Tools-System/Data-Import-Tool.md)

   - Data Export Script: For different scenarios, IoTDB provides users with multiple ways to batch export data. For specific usage instructions, please refer to: [Data Export](../Tools-System/Data-Export-Tool.md)

## 4. Want to Learn More About the Technical Details?

If you are interested in delving deeper into the technical aspects of IoTDB, you can refer to the following documents:

   - Publication: IoTDB features columnar storage, data encoding, pre-calculation, and indexing technologies, along with a SQL-like interface and high-performance data processing capabilities. It also integrates seamlessly with Apache Hadoop, MapReduce, and Apache Spark. For related research papers, please refer to: [Publication](../Technical-Insider/Publication.md)

   - Encoding & Compression: IoTDB optimizes storage efficiency for different data types through a variety of encoding and compression techniques. To learn more,  please refer to:[Encoding & Compression](../Technical-Insider/Encoding-and-Compression.md)
 
   - Data Partitioning and Load Balancing:  IoTDB has meticulously designed data partitioning strategies and load balancing algorithms based on the characteristics of time series data, enhancing the availability and performance of the cluster. For more information,  please refer to: [Data Partitioning and Load Balancing](../Technical-Insider/Cluster-data-partitioning.md)

## 5. Encountering problems during use?

If you encounter difficulties during installation or use, you can move to [Frequently Asked Questions](../FAQ/Frequently-asked-questions.md) View in the middle
