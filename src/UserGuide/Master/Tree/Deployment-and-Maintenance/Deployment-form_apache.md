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
# Deployment form

IoTDB has two operation modes: standalone mode and cluster mode.

## 1. Standalone Mode

An IoTDB standalone instance includes 1 ConfigNode and 1 DataNode, referred to as 1C1D.

- **Features**: Easy for developers to install and deploy, with lower deployment and maintenance costs, and convenient operation.
- **Applicable scenarios**: Situations with limited resources or where high availability is not a critical requirement, such as edge servers.
- **Deployment method**:[Stand-Alone Deployment](../Deployment-and-Maintenance/Stand-Alone-Deployment_apache.md)
 

## 2. Cluster Mode

An IoTDB cluster instance consists of 3 ConfigNodes and no fewer than 3 DataNodes, typically 3 DataNodes, referred to as 3C3D. In the event of partial node failures, the remaining nodes can still provide services, ensuring high availability of the database service, and the database performance can be improved with the addition of nodes.

- **Features**: High availability and scalability, with the ability to enhance system performance by adding DataNodes.
- **Applicable scenarios**: Enterprise-level application scenarios that require high availability and reliability.
- **Deployment method**: [Cluster Deployment](../Deployment-and-Maintenance/Cluster-Deployment_apache.md)

## 3. Summary of Features

| **Dimension**               | **Stand-Alone Mode**                                       | **Cluster Mode**                                                 |
| :-------------------------- | :----------------------------------------------------- | :----------------------------------------------------------- |
| Applicable Scenario         | Edge deployment, low requirement for high availability | High-availability business, disaster recovery scenarios, etc. |
| Number of Machines Required | 1                                                      | ≥3                                                           |
| Security and Reliability    | Cannot tolerate single-point failure                   | High, can tolerate single-point failure                      |
| Scalability                 | Scalable by adding DataNodes to improve performance    | Scalable by adding DataNodes to improve performance          |
| Performance                 | Scalable with the number of DataNodes                  | Scalable with the number of DataNodes                        |

- The deployment steps for standalone mode and cluster mode are similar (adding ConfigNodes and DataNodes one by one), with the only differences being the number of replicas and the minimum number of nodes required to provide services.