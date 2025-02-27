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

# 快速上手

本篇文档将帮助您了解快速入门 IoTDB 的方法。

## 如何安装部署？

本篇文档将帮助您快速安装部署 IoTDB，您可以通过以下文档的链接快速定位到所需要查看的内容：

1. 准备所需机器资源：IoTDB 的部署和运行需要考虑多个方面的机器资源配置。具体资源配置可查看 [资源规划](../Deployment-and-Maintenance/Database-Resources.md)

2. 完成系统配置准备：IoTDB 的系统配置涉及多个方面，关键的系统配置介绍可查看 [系统配置](../Deployment-and-Maintenance/Environment-Requirements.md)

3. 获取安装包：您可以在[ Apache IoTDB 官网](https://iotdb.apache.org/zh/Download/)获取获取 IoTDB 安装包。具体安装包结构可查看：[安装包获取](../Deployment-and-Maintenance/IoTDB-Package_apache.md)

4. 安装数据库：您可以根据实际部署架构选择以下教程进行安装部署：

   -  单机版：[单机版](../Deployment-and-Maintenance/Stand-Alone-Deployment_apache.md)

   -  集群版：[集群版](../Deployment-and-Maintenance/Cluster-Deployment_apache.md)

> ❗️注意：目前我们仍然推荐直接在物理机/虚拟机上安装部署，如需要 docker 部署，可参考：[Docker 部署](../Deployment-and-Maintenance/Docker-Deployment_apache.md)

## 如何使用？

1. 数据库建模设计：数据库建模是创建数据库系统的重要步骤，它涉及到设计数据的结构和关系，以确保数据的组织方式能够满足特定应用的需求，下面的文档将会帮助您快速了解 IoTDB 的建模设计：

   - 时序概念介绍：[时序数据模型](../Background-knowledge/Navigating_Time_Series_Data.md)

   - 建模设计介绍：[建模方案设计](../Background-knowledge/Data-Model-and-Terminology_apache.md)

   - 数据库介绍：[数据库管理](../Basic-Concept/Database-Management.md)
   
   - 表介绍：[表管理](../Basic-Concept/Table-Management.md)

2. 数据写入&更新：在数据写入&更新方面，IoTDB 提供了多种方式来插入实时数据，基本的数据写入&更新操作请查看 [数据写入&更新](../Basic-Concept/Write-Updata-Data.md)

3. 数据查询：IoTDB 提供了丰富的数据查询功能，数据查询的基本介绍请查看 [数据查询](../Basic-Concept/Query-Data.md)

4. 数据删除：IoTDB 提供了两种删除方式，分别为SQL语句删除与过期自动删除(TTL)

   - SQL语句删除：基本介绍请查看 [数据删除](../Basic-Concept/Delete-Data.md)
   - 过期自动删除(TTL)：基本介绍请查看 [过期自动删除](../Basic-Concept/TTL-Delete-Data.md)

5. 其他进阶功能：除了数据库常见的写入、查询等功能外，IoTDB 还支持“数据同步”等功能，具体使用方法可参见具体文档：

   - 数据同步：[数据同步](../User-Manual/Data-Sync_apache.md)

6. 应用编程接口： IoTDB 提供了多种应用编程接口（API），以便于开发者在应用程序中与 IoTDB 进行交互，目前支持[ Java 原生接口](../API/Programming-Java-Native-API_apache.md)、[Python 原生接口](../API/Programming-Python-Native-API.md)、[JDBC](../API/Programming-JDBC_apache.md)等，更多编程接口可参见官网【应用编程接口】其他章节

## 想了解更多技术细节？

如果您想了解 IoTDB 的更多技术内幕，可以移步至下面的文档：

   - 数据分区和负载均衡：IoTDB 基于时序数据特性，精心设计了数据分区策略和负载均衡算法，提升了集群的可用性和性能，想了解更多请查看 [数据分区和负载均衡](../Technical-Insider/Cluster-data-partitioning.md)

   - 压缩&编码：IoTDB 通过多样化的编码和压缩技术，针对不同数据类型优化存储效率，想了解更多请查看 [压缩&编码](../Technical-Insider/Encoding-and-Compression.md)
