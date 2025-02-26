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
# 部署形态

IoTDB 有两种运行模式：单机模式、集群模式。

## 1 单机模式 

IoTDB单机实例包括 1 个ConfigNode、1个DataNode，即1C1D；

- **特点**：便于开发者安装部署，部署和维护成本较低，操作方便。
- **适用场景**：资源有限或对高可用要求不高的场景，例如边缘端服务器。
- **部署方法**：[单机版部署](../Deployment-and-Maintenance/Stand-Alone-Deployment_apache.md)

## 2 集群模式

IoTDB 集群实例为 3 个ConfigNode 和不少于 3 个 DataNode，通常为 3 个 DataNode，即3C3D；当部分节点出现故障时，剩余节点仍然能对外提供服务，保证数据库服务的高可用性，且可随节点增加提升数据库性能。

- **特点**：具有高可用性、高扩展性，可通过增加 DataNode 提高系统性能。
- **适用场景**：需要提供高可用和可靠性的企业级应用场景。
- **部署方法**：[集群版部署](../Deployment-and-Maintenance/Cluster-Deployment_apache.md)

## 3 特点总结

| 维度         | 单机模式                     | 集群模式                 |
| ------------ | ---------------------------- | ------------------------ |
| 适用场景     | 边缘侧部署、对高可用要求不高 | 高可用性业务、容灾场景等 |
| 所需机器数量 | 1                            | ≥3                       |
| 安全可靠性   | 无法容忍单点故障             | 高，可容忍单点故障       |
| 扩展性       | 可扩展 DataNode 提升性能     | 可扩展 DataNode 提升性能 |
| 性能         | 可随 DataNode 数量扩展       | 可随 DataNode 数量扩展   |

- 单机模式和集群模式，部署步骤类似（逐个增加 ConfigNode 和 DataNode），仅副本数和可提供服务的最少节点数不同。