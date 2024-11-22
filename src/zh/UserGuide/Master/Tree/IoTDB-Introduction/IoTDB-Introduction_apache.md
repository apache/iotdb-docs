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

# 产品介绍

Apache IoTDB 是一款低成本、高性能的物联网原生时序数据库。它可以解决企业组建物联网大数据平台管理时序数据时所遇到的应用场景复杂、数据体量大、采样频率高、数据乱序多、数据处理耗时长、分析需求多样、存储与运维成本高等多种问题。

- Github仓库链接：https://github.com/apache/iotdb

- 开源安装包下载：https://iotdb.apache.org/zh/Download/

- 安装部署与使用文档：[快速上手](../QuickStart/QuickStart_apache.md)

## 产品特性

Apache IoTDB 具备以下优势和特性：

- 灵活的部署方式：支持云端一键部署、终端解压即用、终端-云端无缝连接（数据云端同步工具）

- 低硬件成本的存储解决方案：支持高压缩比的磁盘存储，无需区分历史库与实时库，数据统一管理

- 层级化的测点组织管理方式：支持在系统中根据设备实际层级关系进行建模，以实现与工业测点管理结构的对齐，同时支持针对层级结构的目录查看、检索等能力

- 高通量的数据读写：支持百万级设备接入、数据高速读写、乱序/多频采集等复杂工业读写场景

- 丰富的时间序列查询语义：支持时序数据原生计算引擎，支持查询时时间戳对齐，提供近百种内置聚合与时序计算函数，支持面向时序特征分析和AI能力

- 高可用的分布式系统：支持HA分布式架构，系统提供7*24小时不间断的实时数据库服务，一个物理节点宕机或网络故障，不会影响系统的正常运行；支持物理节点的增加、删除或过热，系统会自动进行计算/存储资源的负载均衡处理；支持异构环境，不同类型、不同性能的服务器可以组建集群，系统根据物理机的配置，自动负载均衡

- 极低的使用&运维门槛：支持类 SQL 语言、提供多语言原生二次开发接口、具备控制台等完善的工具体系

- 丰富的生态环境对接：支持Hadoop、Spark等大数据生态系统组件对接，支持Grafana、Thingsboard、DataEase等设备管理和可视化工具

## 商业版本

天谋科技在 Apache IoTDB 开源版本的基础上提供了原厂商业化产品 TimechoDB，为企业、商业客户提供企业级产品和服务，它可以解决企业组建物联网大数据平台管理时序数据时所遇到的应用场景复杂、数据体量大、采样频率高、数据乱序多、数据处理耗时长、分析需求多样、存储与运维成本高等多种问题。

天谋科技基于 TimechoDB 提供更多样的产品功能、更强大的性能和稳定性、更丰富的效能工具，并为用户提供全方位的企业服务，从而为商业化客户提供更强大的产品能力，和更优质的开发、运维、使用体验。

- 天谋科技官网：https://www.timecho.com/

- TimechoDB 安装部署与使用文档：[快速上手](../QuickStart/QuickStart_timecho.md)