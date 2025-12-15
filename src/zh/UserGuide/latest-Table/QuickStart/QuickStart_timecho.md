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

## 1. 如何安装部署？

本篇文档将帮助您快速安装部署 IoTDB，您可以通过以下文档的链接快速定位到所需要查看的内容：

1.  准备所需机器资源：IoTDB 的部署和运行需要考虑多个方面的机器资源配置。具体资源配置可查看 [资源规划](../Deployment-and-Maintenance/Database-Resources.md)

2. 完成系统配置准备：IoTDB 的系统配置涉及多个方面，关键的系统配置介绍可查看 [系统配置](../Deployment-and-Maintenance/Environment-Requirements.md)

3. 获取安装包：您可以联系天谋商务获取 IoTDB 安装包，以确保下载的是最新且稳定的版本。具体安装包结构可查看：[安装包获取](../Deployment-and-Maintenance/IoTDB-Package_timecho.md)

4. 安装数据库并激活：您可以根据实际部署架构选择以下教程进行安装部署：

   - 单机版：[单机版](../Deployment-and-Maintenance/Stand-Alone-Deployment_timecho.md)

   - 分布式（集群）版：[分布式（集群）版](../Deployment-and-Maintenance/Cluster-Deployment_timecho.md)

   - 双活版：[双活版](../Deployment-and-Maintenance/Dual-Active-Deployment_timecho.md)

> ❗️注意：目前我们仍然推荐直接在物理机/虚拟机上安装部署，如需要 docker 部署，可参考：[Docker 部署](../Deployment-and-Maintenance/Docker-Deployment_timecho.md)

5. 安装数据库配套工具：企业版数据库提供监控面板等配套工具，建议在部署企业版时安装，可以帮助您更加便捷的使用 IoTDB：

   - 监控面板：提供了上百个数据库监控指标，用来对 IoTDB 及其所在操作系统进行细致监控，从而进行系统优化、性能优化、发现瓶颈等，安装步骤可查看 [监控面板部署](../Deployment-and-Maintenance/Monitoring-panel-deployment.md)


## 2. 如何使用？

1. 数据库建模设计：数据库建模是创建数据库系统的重要步骤，它涉及到设计数据的结构和关系，以确保数据的组织方式能够满足特定应用的需求，下面的文档将会帮助您快速了解 IoTDB 的建模设计：
   
   - 时序概念介绍：[时序数据模型](../Background-knowledge/Navigating_Time_Series_Data.md)

   - 建模设计介绍：[建模方案设计](../Background-knowledge/Data-Model-and-Terminology_timecho.md)

   - 数据库介绍：[数据库管理](../Basic-Concept/Database-Management.md)
   
   - 表介绍：[表管理](../Basic-Concept/Table-Management.md)

2. 数据写入&更新：在数据写入&更新方面，IoTDB 提供了多种方式来插入实时数据，基本的数据写入&更新操作请查看 [数据写入&更新](../Basic-Concept/Write-Updata-Data.md)

3. 数据查询：IoTDB 提供了丰富的数据查询功能，数据查询的基本介绍请查看 [数据查询](../Basic-Concept/Query-Data.md)，其中包含了适用于识别时序数据中的特定模式、检测特定事件等业务场景的[行模式识别](../SQL-Manual/Row-Pattern-Recognition.md)，以及常用于数据分析场景的[窗口函数](../SQL-Manual/Featured-Functions_timecho.md#_4-窗口函数)等特色函数

4. 数据删除：IoTDB 提供了两种删除方式，分别为SQL语句删除与过期自动删除(TTL)

   - SQL语句删除：基本介绍请查看 [数据删除](../Basic-Concept/Delete-Data.md)
   - 过期自动删除(TTL)：基本介绍请查看 [过期自动删除](../Basic-Concept/TTL-Delete-Data.md)

5. 其他进阶功能：除了数据库常见的写入、查询等功能外，IoTDB 还支持“数据同步”等功能，具体使用方法可参见具体文档：

   - 数据同步：[数据同步](../User-Manual/Data-Sync_timecho.md)

6. 应用编程接口： IoTDB 提供了多种应用编程接口（API），以便于开发者在应用程序中与 IoTDB 进行交互，目前支持[ Java 原生接口](../API/Programming-Java-Native-API_timecho.md)、[Python 原生接口](../API/Programming-Python-Native-API_timecho)、[JDBC](../API/Programming-JDBC_timecho.md)等，更多编程接口可参见官网【应用编程接口】其他章节

## 3. 还有哪些便捷的周边工具？

IoTDB 除了自身拥有丰富的功能外，其周边的工具体系包含的种类十分齐全。本篇文档将帮助您快速使用周边工具体系：

   - 监控面板：是一个对 IoTDB 及其所在操作系统进行细致监控的工具，涵盖数据库性能、系统资源等上百个数据库监控指标，助力系统优化与瓶颈识别等，具体使用介绍请查看 [监控面板部署](../Tools-System/Monitor-Tool_timecho.md)


## 4. 想了解更多技术细节？

如果您想了解 IoTDB 的更多技术内幕，可以移步至下面的文档：

   - 数据分区和负载均衡：IoTDB 基于时序数据特性，精心设计了数据分区策略和负载均衡算法，提升了集群的可用性和性能，想了解更多请查看 [数据分区和负载均衡](../Technical-Insider/Cluster-data-partitioning.md)

   - 压缩&编码：IoTDB 通过多样化的编码和压缩技术，针对不同数据类型优化存储效率，想了解更多请查看 [压缩&编码](../Technical-Insider/Encoding-and-Compression.md)


