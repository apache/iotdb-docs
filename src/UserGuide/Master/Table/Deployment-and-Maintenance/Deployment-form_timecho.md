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

An IoTDB standalone instance includes 1 ConfigNode and 1 DataNode, i.e., 1C1D.

- **Features**: Easy for developers to install and deploy, with low deployment and maintenance costs and convenient operations.  
- **Use Cases**: Scenarios with limited resources or low high-availability requirements, such as edge servers. 
- **Deployment Method**: [Stand-Alone Deployment](../Deployment-and-Maintenance/Stand-Alone-Deployment_timecho.md)
 
## 2. Dual-Active Mode  

Dual-Active Deployment is a feature of TimechoDB, where two independent instances synchronize bidirectionally and can provide services simultaneously. If one instance stops and restarts, the other instance will resume data transfer from the breakpoint.  

> An IoTDB Dual-Active instance typically consists of 2 standalone nodes, i.e., 2 sets of 1C1D. Each instance can also be a cluster.  

- **Features**: The high-availability solution with the lowest resource consumption.  
- **Use Cases**: Scenarios with limited resources (only two servers) but requiring high availability.  
- **Deployment Method**: [Dual-Active Deployment](../Deployment-and-Maintenance/Dual-Active-Deployment_timecho.md)

## 3. Cluster Mode

An IoTDB cluster instance consists of 3 ConfigNodes and no fewer than 3 DataNodes, typically 3 DataNodes, i.e., 3C3D. If some nodes fail, the remaining nodes can still provide services, ensuring high availability of the database. Performance can be improved by adding DataNodes.  

- **Features**: High availability, high scalability, and improved system performance by adding DataNodes.  
- **Use Cases**: Enterprise-level application scenarios requiring high availability and reliability.  
- **Deployment Method**: [Cluster Deployment](../Deployment-and-Maintenance/Cluster-Deployment_timecho.md)



## 4. Feature Summary

| **Dimension**                   | **Stand-Alone Mode**                                         | **Dual-Active Mode**                                        | **Cluster Mode**                                            |
| :-------------------------- | :------------------------------------------------------- | :------------------------------------------------------ | :------------------------------------------------------ |
| Use Cases                   | Edge-side deployment, low high-availability requirements | High-availability services, disaster recovery scenarios | High-availability services, disaster recovery scenarios |
| Number of Machines Required | 1                                                        | 2                                                       | ≥3                                                      |
| Security and Reliability    | Cannot tolerate single-point failure                     | High, can tolerate single-point failure                 | High, can tolerate single-point failure                 |
| Scalability                 | Can expand DataNodes to improve performance              | Each instance can be scaled as needed                   | Can expand DataNodes to improve performance             |
| Performance                 | Can scale with the number of DataNodes                   | Same as one of the instances                            | Can scale with the number of DataNodes                  |

- The deployment steps for Stand-Alone Mode and Cluster Mode are similar (adding ConfigNodes and DataNodes one by one), with differences only in the number of replicas and the minimum number of nodes required to provide services.