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

TimechoDB 是一款低成本、高性能的物联网原生时序数据库，是天谋科技基于 Apache IoTDB 社区版本提供的原厂商业化产品。它可以解决企业组建物联网大数据平台管理时序数据时所遇到的应用场景复杂、数据体量大、采样频率高、数据乱序多、数据处理耗时长、分析需求多样、存储与运维成本高等多种问题。

天谋科技基于 TimechoDB 提供更多样的产品功能、更强大的性能和稳定性、更丰富的效能工具，并为用户提供全方位的企业服务，从而为商业化客户提供更强大的产品能力，和更优质的开发、运维、使用体验。

- 下载、部署与使用：[快速上手](../QuickStart/QuickStart_timecho.md)

## 产品体系

天谋产品体系由若干个组件构成，覆盖由【数据采集】到【数据管理】到【数据分析&应用】的全时序数据生命周期，做到“采-存-用”一体化时序数据解决方案，帮助用户高效地管理和分析物联网产生的海量时序数据。

<div style="text-align: center;">        		
    <img src="https://alioss.timecho.com/docs/img/Introduction-zh-timecho.png" alt="Introduction-zh-timecho.png" style="width: 70%;"/>
</div>


其中：

1. **时序数据库（TimechoDB，基于 Apache IoTDB 提供的原厂商业化产品）**：时序数据存储的核心组件，其能够为用户提供高压缩存储能力、丰富时序查询能力、实时流处理能力，同时具备数据的高可用和集群的高扩展性，并在安全层面提供全方位保障。同时 TimechoDB 还为用户提供多种应用工具，方便用户配置和管理系统；多语言API和外部系统应用集成能力，方便用户在 TimechoDB 基础上构建业务应用。
2. **时序数据标准文件格式（Apache TsFile，多位天谋科技核心团队成员主导&贡献代码）**：该文件格式是一种专为时序数据设计的存储格式，可以高效地存储和查询海量时序数据。目前 Timecho 采集、存储、智能分析等模块的底层存储文件均由 Apache TsFile 进行支撑。TsFile 可以被高效地加载至 TimechoDB 中，也能够被迁移出来。通过 TsFile，用户可以在采集、管理、应用&分析阶段统一使用相同的文件格式进行数据管理，极大简化了数据采集到分析的整个流程，提高时序数据管理的效率和便捷度。
3. **时序模型训推一体化引擎（AINode）**：针对智能分析场景，TimechoDB 提供 AINode 时序模型训推一体化引擎，它提供了一套完整的时序数据分析工具，底层为模型训练引擎，支持训练任务与数据管理，与包括机器学习、深度学习等。通过这些工具，用户可以对存储在 TimechoDB 中的数据进行深入分析，挖掘出其中的价值。
4. **数据采集**：为了更加便捷的对接各类工业采集场景， 天谋科技提供数据采集接入服务，支持多种协议和格式，可以接入各种传感器、设备产生的数据，同时支持断点续传、网闸穿透等特性。更加适配工业领域采集过程中配置难、传输慢、网络弱的特点，让用户的数采变得更加简单、高效。


## 产品特性

TimechoDB 具备以下优势和特性：

- 灵活的部署方式：支持云端一键部署、终端解压即用、终端-云端无缝连接（数据云端同步工具）

- 低硬件成本的存储解决方案：支持高压缩比的磁盘存储，无需区分历史库与实时库，数据统一管理

- 层级化的测点组织管理方式：支持在系统中根据设备实际层级关系进行建模，以实现与工业测点管理结构的对齐，同时支持针对层级结构的目录查看、检索等能力

- 高通量的数据读写：支持百万级设备接入、数据高速读写、乱序/多频采集等复杂工业读写场景

- 丰富的时间序列查询语义：支持时序数据原生计算引擎，支持查询时时间戳对齐，提供近百种内置聚合与时序计算函数，支持面向时序特征分析和AI能力

- 高可用的分布式系统：支持HA分布式架构，系统提供7*24小时不间断的实时数据库服务，一个物理节点宕机或网络故障，不会影响系统的正常运行；支持物理节点的增加、删除或过热，系统会自动进行计算/存储资源的负载均衡处理；支持异构环境，不同类型、不同性能的服务器可以组建集群，系统根据物理机的配置，自动负载均衡

- 极低的使用&运维门槛：支持类 SQL 语言、提供多语言原生二次开发接口、具备控制台等完善的工具体系

- 丰富的生态环境对接：支持Hadoop、Spark等大数据生态系统组件对接，支持Grafana、Thingsboard、DataEase等设备管理和可视化工具

## 企业特性

### 更高阶的产品功能

TimechoDB 在开源版基础上提供了更多高阶产品功能，在内核层面针对工业生产场景进行原生升级和优化，如多级存储、云边协同、可视化工具、安全增强等功能，能够让用户无需过多关注底层逻辑，将精力聚焦在业务开发中，让工业生产更简单更高效，为企业带来更多的经济效益。如：

- 双活部署：双活通常是指两个独立的单机（或集群），实时进行镜像同步，它们的配置完全独立，可以同时接收外界的写入，每一个独立的单机（或集群）都可以将写入到自己的数据同步到另一个单机（或集群）中，两个单机（或集群）的数据可达到最终一致。

- 数据同步：通过数据库内置的同步模块，支持数据由场站向中心汇聚，支持全量汇聚、部分汇聚、级联汇聚等各类场景，可支持实时数据同步与批量数据同步两种模式。同时提供多种内置插件，支持企业数据同步应用中的网闸穿透、加密传输、压缩传输等相关要求。

- 多级存储：通过升级底层存储能力，支持根据访问频率和数据重要性等因素将数据划分为冷、温、热等不同层级的数据，并将其存储在不同介质中（如 SSD、机械硬盘、云存储等），同时在查询过程中也由系统进行数据调度。从而在保证数据访问速度的同时，降低客户数据存储成本。

- 安全增强：通过白名单、审计日志等功能加强企业内部管理，降低数据泄露风险。

详细功能对比如下：

<table style="text-align: left;">
  <tbody>
     <tr>            <th colspan="2">功能</th>
            <th>Apache IoTDB</th>        
            <th>TimechoDB</th>
      </tr>
      <tr>
            <td rowspan="4">部署模式</td>  
            <td>单机部署</td> 
            <td>√</td> 
            <td>√</td> 
      </tr>
      <tr>
            <td>分布式部署</td> 
            <td>√</td> 
            <td>√</td> 
      </tr>
      <tr>
            <td>双活部署</td> 
            <td>×</td> 
            <td>√</td> 
      </tr>
       <tr>
            <td>容器部署</td> 
            <td>部分支持</td> 
            <td>√</td> 
      </tr>
      <tr>
            <td rowspan="13">数据库功能</td>  
            <td>测点管理</td> 
            <td>√</td> 
            <td>√</td>       
      </tr>
      <tr>
            <td>数据写入</td> 
            <td>√</td> 
            <td>√</td>        
      </tr>
      <tr>
            <td>数据查询</td> 
            <td>√</td> 
            <td>√</td>
      </tr>
      <tr>
            <td>连续查询</td> 
            <td>√</td> 
            <td>√</td>
      </tr>
      <tr>
            <td>触发器</td> 
            <td>√</td> 
            <td>√</td>
      </tr>
      <tr>
            <td>用户自定义函数</td> 
            <td>√</td> 
            <td>√</td>
      </tr>
      <tr>
            <td>权限管理</td> 
            <td>√</td> 
            <td>√</td>
      </tr>
      <tr>
            <td>数据同步</td> 
            <td>仅文件同步，无内置插件</td> 
            <td>实时同步+文件同步，丰富内置插件</td>
      </tr>
      <tr>
            <td>流处理</td> 
            <td>仅框架，无内置插件</td> 
            <td>框架+丰富内置插件</td>
      </tr>
      <tr>
            <td>多级存储</td> 
            <td>×</td> 
            <td>√</td>
      </tr>
      <tr>
            <td>视图</td> 
            <td>×</td> 
            <td>√</td>
      </tr>
      <tr>
            <td>白名单</td> 
            <td>×</td> 
            <td>√</td>
      </tr>
      <tr>
            <td>审计日志</td> 
            <td>×</td> 
            <td>√</td>
      </tr>
      <tr>
            <td rowspan="3">配套工具</td>  
            <td>可视化控制台</td> 
            <td>×</td> 
            <td>√</td>       
      </tr>
      <tr>
            <td>集群管理工具</td> 
            <td>×</td> 
            <td>√</td>
      </tr>
      <tr>
            <td>系统监控工具</td> 
            <td>×</td> 
            <td>√</td>
      </tr>
      <tr>
            <td>国产化</td>  
            <td>国产化兼容性认证</td> 
            <td>×</td> 
            <td>√</td>       
      </tr>
      <tr>
            <td rowspan="2">技术支持</td>  
            <td>最佳实践</td> 
            <td>×</td> 
            <td>√</td>       
      </tr>
      <tr>
            <td>使用培训</td> 
            <td>×</td> 
            <td>√</td>
      </tr>
</table>

### 更高效/稳定的产品性能

TimechoDB 在开源版的基础上优化了稳定性与性能，经过企业版技术支持，能够实现10倍以上性能提升，并具有故障及时恢复的性能优势。

### 更用户友好的工具体系

TimechoDB 将为用户提供更简单、易用的工具体系，通过集群监控面板（IoTDB Grafana）、数据库控制台（IoTDB Workbench）、集群管理工具（IoTDB Deploy Tool，简称 IoTD）等产品帮助用户快速部署、管理、监控数据库集群，降低运维人员工作/学习成本，简化数据库运维工作，使运维过程更加方便、快捷。

- 集群监控面板：旨在解决 IoTDB 及其所在操作系统的监控问题，主要包括：操作系统资源监控、IoTDB 性能监控，及上百项内核监控指标，从而帮助用户监控集群健康状态，并进行集群调优和运维。

<div style="display: flex; justify-content: space-between; width: 100%;">
  <p style="width: 30%; text-align: center;">总体概览</p>
  <p style="width: 30%; text-align: center;">操作系统资源监控</p>
  <p style="width: 30%; text-align: center;">IoTDB 性能监控</p>
</div>
<div style="display: flex; justify-content: space-between; width: 100%;">
  <img src="https://alioss.timecho.com/docs/img/Introduction01.png" alt="" style="width: 30%; height: auto;">
  <img src="https://alioss.timecho.com/docs/img/Introduction02.png" alt="" style="width: 30%; height: auto;">
  <img src="https://alioss.timecho.com/docs/img/Introduction03.png" alt="" style="width: 30%; height: auto;">
</div>
<p></p>

- 数据库控制台：旨在提供低门槛的数据库交互工具，通过提供界面化的控制台帮助用户简洁明了的进行元数据管理、数据增删改查、权限管理、系统管理等操作，简化数据库使用难度，提高数据库使用效率。


<div style="display: flex; justify-content: space-between; width: 100%;">
  <p style="width: 30%; text-align: center;">首页</p>
  <p style="width: 30%; text-align: center;">元数据管理</p>
  <p style="width: 30%; text-align: center;">SQL 查询</p>
</div>
<div style="display: flex; justify-content: space-between; width: 100%;">
  <img src="https://alioss.timecho.com/docs/img/Introduction04.png" alt="" style="width: 30%; height: auto;">
  <img src="https://alioss.timecho.com/docs/img/Introduction05.png" alt="" style="width: 30%; height: auto;">
  <img src="https://alioss.timecho.com/docs/img/Introduction06.png" alt="" style="width: 30%; height: auto;">
</div>
<p></p>


- 集群管理工具：旨在解决分布式系统多节点的运维难题，主要包括集群部署、集群启停、弹性扩容、配置更新、数据导出等功能，从而实现对复杂数据库集群的一键式指令下发，极大降低管理难度。


<div style="text-align: center;">        		
    <img src="https://alioss.timecho.com/docs/img/Intoduction07.png" alt=" " style="width: 50%;"/>
</div>

### 更专业的企业技术服务

TimechoDB 客户提供强大的原厂服务，包括但不限于现场安装及培训、专家顾问咨询、现场紧急救助、软件升级、在线自助服务、远程支持、最新开发版使用指导等服务。同时，为了使 IoTDB 更契合工业生产场景，我们会根据企业实际数据结构和读写负载，进行建模方案推荐、读写性能调优、压缩比调优、数据库配置推荐及其他的技术支持。如遇到部分产品未覆盖的工业化定制场景，TimechoDB 将根据用户特点提供定制化开发工具。

相较于开源版本，每 2-3 个月一个发版周期，TimechoDB 提供周期更快的发版频率，同时针对客户现场紧急问题，提供天级别的专属修复，确保生产环境稳定。


### 更兼容的国产化适配

TimechoDB 代码自研可控，同时兼容大部分主流信创产品（CPU、操作系统等），并完成与多个厂家的兼容认证，确保产品的合规性和安全性。