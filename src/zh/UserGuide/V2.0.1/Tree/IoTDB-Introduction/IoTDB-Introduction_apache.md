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


## 产品体系

IoTDB 体系由若干个组件构成，帮助用户高效地管理和分析物联网产生的海量时序数据。

<div style="text-align: center;">        		
    <img src="https://alioss.timecho.com/docs/img/Introduction-zh-apache.png" alt="Introduction-zh-apache.png" style="width: 90%;"/>
</div>

其中：

1. **时序数据库（Apache IoTDB）**：时序数据存储的核心组件，其能够为用户提供高压缩存储能力、丰富时序查询能力、实时流处理能力，同时具备数据的高可用和集群的高扩展性，并在安全层面提供全方位保障。同时 TimechoDB 还为用户提供多种应用工具，方便用户配置和管理系统；多语言API和外部系统应用集成能力，方便用户在 TimechoDB 基础上构建业务应用。
2. **时序数据标准文件格式（Apache TsFile）**：该文件格式是一种专为时序数据设计的存储格式，可以高效地存储和查询海量时序数据。目前 IoTDB、AINode 等模块的底层存储文件均由 Apache TsFile 进行支撑。通过 TsFile，用户可以在采集、管理、应用&分析阶段统一使用相同的文件格式进行数据管理，极大简化了数据采集到分析的整个流程，提高时序数据管理的效率和便捷度。
3. **时序模型训推一体化引擎（IoTDB AINode）**：针对智能分析场景，IoTDB 提供 AINode 时序模型训推一体化引擎，它提供了一套完整的时序数据分析工具，底层为模型训练引擎，支持训练任务与数据管理，与包括机器学习、深度学习等。通过这些工具，用户可以对存储在 IoTDB 中的数据进行深入分析，挖掘出其中的价值。


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