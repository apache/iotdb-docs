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

1. 准备所需机器资源：IoTDB 的部署和运行需要考虑多个方面的机器资源配置。具体资源配置可查看 [资源规划](https://iotdb.apache.org/zh/UserGuide/latest/Deployment-and-Maintenance/Database-Resources.html)
2. 完成系统配置准备：IoTDB 的系统配置涉及多个方面，关键的系统配置介绍可查看 [系统配置](https://iotdb.apache.org/zh/UserGuide/latest/Deployment-and-Maintenance/Environment-Requirements.html)
3. 获取安装包：您可以在[ Apache IoTDB 官网](https://iotdb.apache.org/zh/Download/)获取获取 IoTDB 安装包。具体安装包结构可查看：[安装包获取](https://iotdb.apache.org/zh/UserGuide/latest/Deployment-and-Maintenance/IoTDB-Package_apache.html)
4. 安装数据库：您可以根据实际部署架构选择以下教程进行安装部署：
   -  单机版：[单机版](https://iotdb.apache.org/zh/UserGuide/latest/Deployment-and-Maintenance/Stand-Alone-Deployment_apache.html)
   -  集群版：[集群版](https://iotdb.apache.org/zh/UserGuide/latest/Deployment-and-Maintenance/Cluster-Deployment_apache.html)

> ❗️注意：目前我们仍然推荐直接在物理机/虚拟机上安装部署，如需要 docker 部署，可参考：[Docker 部署](https://iotdb.apache.org/zh/UserGuide/latest/Deployment-and-Maintenance/Docker-Deployment_apache.html)

## 如何使用？

1. 数据库建模设计：数据库建模是创建数据库系统的重要步骤，它涉及到设计数据的结构和关系，以确保数据的组织方式能够满足特定应用的需求，下面的文档将会帮助您快速了解 IoTDB 的建模设计：

   - 时序概念介绍：[走进时序数据](https://iotdb.apache.org/zh/UserGuide/latest/Basic-Concept/Navigating_Time_Series_Data.html)

   - 建模设计介绍：[数据模型介绍](https://iotdb.apache.org/zh/UserGuide/latest/Basic-Concept/Data-Model-and-Terminology.html)

   - SQL 语法介绍：[SQL 语法介绍](https://iotdb.apache.org/zh/UserGuide/latest/User-Manual/Operate-Metadata_apache.html)

2. 数据写入：在数据写入方面，IoTDB 提供了多种方式来插入实时数据，基本的数据写入操作请查看 [数据写入](https://www.timecho.com/docs/zh/UserGuide/latest/User-Manual/Write-Delete-Data.html)

3. 数据查询：IoTDB 提供了丰富的数据查询功能，数据查询的基本介绍请查看 [数据查询](https://iotdb.apache.org/zh/UserGuide/latest/User-Manual/Query-Data.html)

4. 其他进阶功能：除了数据库常见的写入、查询等功能外，IoTDB 还支持“数据同步、流处理框架、权限管理”等功能，具体使用方法可参见具体文档：

   - 数据同步：[数据同步](https://iotdb.apache.org/zh/UserGuide/latest/User-Manual/Data-Sync_apache.html)

   - 流处理框架：[流处理框架](https://iotdb.apache.org/zh/UserGuide/latest/User-Manual/Streaming_apache.html)

   - 权限管理：[权限管理](https://iotdb.apache.org/zh/UserGuide/latest/User-Manual/Authority-Management.html)

5. 应用编程接口： IoTDB 提供了多种应用编程接口（API），以便于开发者在应用程序中与 IoTDB 进行交互，目前支持 [Java](https://iotdb.apache.org/zh/UserGuide/latest/API/Programming-Java-Native-API.html)、[Python](https://iotdb.apache.org/zh/UserGuide/latest/API/Programming-Python-Native-API.html)、[C++](https://iotdb.apache.org/zh/UserGuide/latest/API/Programming-Cpp-Native-API.html)等，更多编程接口可参见官网【应用编程接口】其他章节

## 还有哪些便捷的周边工具？

IoTDB 除了自身拥有丰富的功能外，其周边的工具体系包含的种类十分齐全。本篇文档将帮助您快速使用周边工具体系：

- 测试工具：IoT-benchmark 是一个基于 Java 和大数据环境开发的时序数据库基准测试工具，由清华大学软件学院研发并开源。它支持多种写入和查询方式，能够存储测试信息和结果供进一步查询或分析，并支持与 Tableau 集成以可视化测试结果。具体使用介绍请查看：[测试工具](https://iotdb.apache.org/zh/UserGuide/latest/Tools-System/Benchmark.html)

- 数据导入导出脚本：用于实现 IoTDB 内部数据与外部文件的交互，适用于单个文件或目录文件批量操作，具体使用介绍请查看：[数据导入导出脚本](https://iotdb.apache.org/zh/UserGuide/latest/Tools-System/Data-Import-Export-Tool.html)

- TsFile 导入导出脚本：针对于不同场景，IoTDB 为用户提供多种批量导入数据的操作方式，具体使用介绍请查看：[TsFile 导入导出脚本](https://iotdb.apache.org/zh/UserGuide/latest/Tools-System/TsFile-Import-Export-Tool.html)

## 使用过程中遇到问题？

如果您在安装或使用过程中遇到困难，可以移步至 [常见问题](https://iotdb.apache.org/zh/UserGuide/latest/FAQ/Frequently-asked-questions.html) 中进行查看