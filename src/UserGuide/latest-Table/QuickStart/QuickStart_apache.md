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

3. Obtain the installation package: You can obtain the IoTDB installation package on the [Apache IoTDB official website](https://iotdb.apache.org/zh/Download/).For the specific structure of the installation package, please refer to [Obtain TimechoDB](../Deployment-and-Maintenance/IoTDB-Package_apache.md)

4. Install the database and activate it: Depending on your actual deployment architecture, you can choose from the following tutorials for installation and deployment:

   - Stand-Alone Deployment: [Stand-Alone Deployment ](../Deployment-and-Maintenance/Stand-Alone-Deployment_apache.md)

   - Distributed(Cluster) Deployment: [Distributed(Cluster) Deployment](../Deployment-and-Maintenance/Cluster-Deployment_apache.md)

> ❗️Note: We currently still recommend direct installation and deployment on physical/virtual machines. For Docker deployment, please refer to [Docker Deployment](../Deployment-and-Maintenance/Docker-Deployment_apache.md)

## 2. How to Use IoTDB?

1. Database Modeling Design: Database modeling is a crucial step in creating a database system, involving the design of data structures and relationships to ensure that the organization of data meets the needs of specific applications. The following documents will help you quickly understand IoTDB's modeling design:
   
   - Introduction to Time Series Concepts: [Navigating Time Series Data](../Background-knowledge/Navigating_Time_Series_Data.md)

   - Introduction to Modeling Design: [Data Model and Terminology](../Background-knowledge/Data-Model-and-Terminology_apache.md)

   - Introduction to Database: [Database Management](../Basic-Concept/Database-Management.md)
   
   - Introduction to Tables: [Table Management](../Basic-Concept/Table-Management.md)

2. Data Insertion & Updates: IoTDB provides multiple methods for inserting real-time data. For basic data insertion and updating operations, please see [Write&Updata Data](../Basic-Concept/Write-Updata-Data.md)

3. Data Querying: IoTDB offers a rich set of data querying capabilities. For a basic introduction to data querying, please see [Query Data](../Basic-Concept/Query-Data.md)

4. Data Deletion: IoTDB supports two deletion methods: SQL-based deletion and automatic expiration deletion (TTL).

   - SQL-Based Deletion: For a basic introduction, please refer to [Delete Data](../Basic-Concept/Delete-Data.md)
   
   - Automatic Expiration Deletion (TTL): For a basic introduction, please see  [TTL Delete Data](../Basic-Concept/TTL-Delete-Data.md)

5. Advanced Features: In addition to common database functions such as insertion and querying, IoTDB also supports features like "data synchronization." For specific usage methods, please refer to the respective documents:

   - Data Synchronization: [Data Sync](../User-Manual/Data-Sync_apache.md)

6. Application Programming Interfaces (APIs): IoTDB provides various application programming interfaces (APIs) to facilitate developers' interaction with IoTDB in applications. Currently supported interfaces include [Java Native API](../API/Programming-Java-Native-API_apache.md), [Python Native API](../API/Programming-Python-Native-API.md), [JDBC](../API/Programming-JDBC_apache.md), and more. For more programming interfaces, please refer to the [Application Programming Interfaces] section on the official website.

## 3. Want to learn more technical details?

If you want to explore IoTDB’s internal mechanisms further, refer to the following documents:

   - Data Partitioning and Load Balancing: IoTDB is designed with a partitioning strategy and load balancing algorithm to enhance cluster availability and performance. For more details, please see [Cluster data partitioning](../Technical-Insider/Cluster-data-partitioning.md)

   - Compression & Encoding: IoTDB employs various encoding and compression techniques optimized for different data types to improve storage efficiency. For more details, please see [Encoding and Compression](../Technical-Insider/Encoding-and-Compression.md)
