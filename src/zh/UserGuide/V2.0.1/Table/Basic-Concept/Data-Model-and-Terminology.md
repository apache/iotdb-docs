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

# 建模方案设计

本章节主要介绍如何将时序数据应用场景转化为IoTDB时序建模。

## 1 时序数据模型

在构建IoTDB建模方案前，需要先了解时序数据和时序数据模型，详细内容见此页面：[时序数据模型](../Basic-Concept/Navigating_Time_Series_Data.md)

## 2 IoTDB 的两种时序模型

> IoTDB 提供了两种数据建模方式——树模型和表模型，以满足用户多样化的应用需求。

### 2.1 树模型

以测点为单元进行管理，每个测点对应一条时间序列，测点名按逗号分割可看作一个树形目录结构，与物理世界一一对应，简单直观。

示例：下图是一个风电场的建模管理，通过多个层级【集团】-【风电场】-【风机】-【物理量】可以唯一确定一个实体测点。

<div style="text-align: center;">
      <img src="https://alioss.timecho.com/docs/img/data-modeling01.png" alt="" style="width: 70%;"/>
</div>

### 2.2 表模型

一张表管理一类设备。下图是一个工厂设备的建模管理，每个设备的物理量采集都具备一定共性（如都采集温度和湿度物理量、同一设备的物理量同频采集等）。

此时通过【地区】-【工厂】-【设备】（下图橙色列，又称设备标签）可以唯一确定一个实体设备，同时一个设备的描述信息【型号】【维护周期】（下图黄色列，又称设备属性/描述信息）也可在表格里进行记录。设备最终采集的指标为【温度】、【湿度】、【状态】、【到达时间】（下图蓝色列）。

<div style="text-align: center;">
      <img src="https://alioss.timecho.com/docs/img/data-modeling02.png" alt="" style="width: 70%;"/>
</div>

### 2.3 模型选择

两种模型有各自的适用场景。

树模型采用层级式结构，适合实时监控场景，能够直观映射物理设备的层级关系；表模型以设备为管理单位，适合大规模设备的数据管理和多属性关联分析，能够高效支持复杂的批量查询需求。

以下表格从适用场景、典型操作等多个维度对树模型和表模型进行了对比。用户可以根据具体的使用需求，选择适合的模型，从而实现数据的高效存储和管理。

| 对比维度 | 树模型                 | 表模型                   |
| -------- | ---------------------- | ------------------------ |
| 适用场景 | 点位监控场景           | 多维分析场景             |
| 典型操作 | 指定点位路径进行读写   | 通过标签进行数据筛选分析 |
| 结构特点 | 和文件系统一样灵活增删 | 模板化管理，便于数据治理 |
| 语法特点 | 简洁                   | 标准                     |

**注意：**
- 同一个集群实例中可以存在两种模型空间，不同模型的语法、数据库命名方式不同，默认不互相可见。
- 在通过客户端工具 Cli 或 SDK 建立数据库连接时，需要通过 sql_dialect 参数指定使用的模型语法（默认使用树语法进行操作）。

## 3 树模型

### 3.1 特点

- 简单直观，和物理世界的监测点位一一对应
- 类似文件系统一样灵活，可以设计任意分支结构
- 适用 DCS、SCADA 等工业监控场景

### 3.2 基础概念

| **概念**             | **定义**                                                     |
| -------------------- | ------------------------------------------------------------ |
| **数据库**           | 定义：一个以 root. 为前缀的路径<br>命名推荐：仅包含 root 的下一级节点，如 root.db<br>数量推荐：上限和内存相关，一个数据库也可以充分利用机器资源，无需为性能原因创建多个数据库<br>创建方式：推荐手动创建，也可创建时间序列时自动创建（默认为 root 的下一级节点） |
| **时间序列（测点）** | 定义：<br>1. 一个以数据库路径为前缀的、由 . 分割的路径，可包含任意多个层级，如 root.db.turbine.device1.metric1 <br>2. 每个时间序列可以有不同的数据类型。<br>命名推荐:<br>1. 仅将唯一定位时间序列的标签（类似联合主键）放入路径中，一般不超过10层<br>2. 通常将基数（不同的取值数量）少的标签放在前面，便于系统将公共前缀进行压缩<br>数量推荐:<br>1. 集群可管理的时间序列总量和总内存相关，可参考资源推荐章节<br>2. 任一层级的子节点数量没有限制<br>创建方式：可手动创建或在数据写入时自动创建。 |
| **设备**                 | 定义：倒数第二级为设备，如 root.db.turbine.**device1**.metric1中的“device1”这一层级即为设备<br>创建方式：无法仅创建设备，随时间序列创建而存在 |

### 3.3 建模示例

#### 3.3.1 有多种类型的设备需要管理，如何建模？

- 如场景中不同类型的设备具备不同的层级路径和测点集合，可以在数据库节点下按设备类型创建分支。每种设备下可以有不同的测点结构。

<div style="text-align: center;">
      <img src="https://alioss.timecho.com/docs/img/data-modeling03.png" alt="" style="width: 70%;"/>
</div>

#### 3.3.2 如果场景中没有设备，只有测点，如何建模？

- 如场站的监控系统中，每个测点都有唯一编号，但无法对应到某些设备。

<div style="text-align: center;">
      <img src="https://alioss.timecho.com/docs/img/data-modeling04.png" alt="" style="width: 70%;"/>
</div>

#### 3.3.3 如果在一个设备下，既有子设备，也有测点，如何建模？

- 如在储能场景中，每一层结构都要监控其电压和电流，可以采用如下建模方式

<div style="text-align: center;">
      <img src="https://alioss.timecho.com/docs/img/data-modeling05.png" alt="" style="width: 70%;"/>
</div>


## 4 表模型

### 4.1 特点

- 以标准关系建模管理设备时序数据，便于使用标准 SQL 进行分析
- 适用物联网数据分析场景，或从其他时序数据库迁移至 IoTDB 的场景

### 4.2 基础概念

- 数据库：可管理多类设备
- 时序表：对应一类设备

| **列类别**                  | **定义**                                                     |
| --------------------------- | ------------------------------------------------------------ |
| **时间列（TIME）**          | 每个时序表必须有一个时间列，数据类型为 TIMESTAMP，名称可以自定义 |
| **标签列（TAG）**           | 设备的唯一标识（联合主键），可以为 0 至多个<br>标签信息不可修改和删除，但允许增加<br>推荐按粒度由大到小进行排列 |
| **测点列（FIELD）** | 一个设备采集的测点可以有1个至多个，值随时间变化<br>表的测点列没有数量限制，可以达到数十万以上 |
| **属性列（ATTRIBUTE）** | 对设备的补充描述，**不随时间变化**<br>设备属性信息可以有0个或多个，可以更新或新增<br>少量希望修改的静态属性可以存至此列 |


数据筛选效率：时间列=标签列>属性列>测点列

### 4.3 建模示例

#### 4.3.1 有多种类型的设备需要管理，如何建模？

- 推荐为每一类型的设备建立一张表，每个表可以具有不同的标签和测点集合

<div style="text-align: center;">
      <img src="https://alioss.timecho.com/docs/img/data-modeling06.png" alt="" style="width: 70%;"/>
</div>

#### 4.3.2 如果没有设备标识列和属性列，如何建模？

- 列数没有数量限制，可以达到数十万以上。

<div style="text-align: center;">
      <img src="https://alioss.timecho.com/docs/img/data-modeling07.png" alt="" style="width: 70%;"/>
</div>

#### 4.3.3 如果在一个设备下，既有子设备，也有测点，如何建模？

- 设备之间存在嵌套关系，每个设备可以有多个子设备及测点信息，推荐建立多个表进行管理。

<div style="text-align: center;">
      <img src="https://alioss.timecho.com/docs/img/data-modeling09.png" alt="" style="width: 70%;"/>
</div>