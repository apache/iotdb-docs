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

## 1. 时序数据模型

在构建IoTDB建模方案前，需要先了解时序数据和时序数据模型，详细内容见此页面：[时序数据模型](../Background-knowledge/Navigating_Time_Series_Data.md)

## 2. IoTDB 的两种时序模型

IoTDB 提供了两种数据建模方式——树模型和表模型，其特点分别如下：

**树模型**：以测点为对象进行管理，每个测点对应一条时间序列，测点名按`.`分割可形成一个树形目录结构，与物理世界一一对应，对测点的读写操作简单直观。

> 在构建树模型[路径](../Basic-Concept/Operate-Metadata_apache.md#4-路径查询)时，节点命名若存在包含非标准字符或特殊符号的可能性，则建议对所有层级节点实施反引号封装策略。这样可以有效规避因字符解析异常导致的测点注册失败及数据写入中断问题，确保路径标识符在语法解析层面的准确性。

**表模型**：推荐为每类设备创建一张表，同类设备的物理量采集都具备一定共性（如都采集温度和湿度物理量），数据分析灵活丰富。

### 2.1 模型特点

两种模型有各自的适用场景。

以下表格从适用场景、典型操作等多个维度对树模型和表模型进行了对比。用户可以根据具体的使用需求，选择适合的模型，从而实现数据的高效存储和管理。


<table style="text-align: center;">
        <tr>
            <td>对比维度</td>
            <td>树模型</td>
            <td>表模型</td>
        </tr>
        <tr>
            <td>适用场景</td>
            <td>测点管理，监控场景</td>
            <td>设备管理，分析场景</td>
        </tr>
        <tr>
            <td>典型操作</td>
            <td>指定点位路径进行读写</td>
            <td>通过标签进行数据筛选分析</td>
        </tr>
        <tr>
            <td>结构特点</td>
            <td>和文件系统一样灵活增删</td>
            <td>模板化管理，便于数据治理</td>
        </tr>
        <tr>
            <td>语法特点</td>
            <td>简洁灵活</td>
            <td>分析丰富</td>
        </tr>
        <tr>
            <td>性能对比</td>
            <td colspan="2">相同</td>
        </tr>
</table>

**注意：**
- 同一个集群实例中可以存在两种模型空间，不同模型的语法、数据库命名方式不同，默认不互相可见。

- 在通过客户端工具 Cli 或 SDK 建立数据库连接时，需要通过 sql_dialect 参数指定使用的模型语法（默认使用树语法进行操作）。


## 3. 应用场景

应用场景主要包括两类：

- 场景一：使用树模型进行数据的读写

- 场景二：使用表模型进行数据的读写


### 3.1 场景一：树模型

#### 3.1.1 特点

- 简单直观，和物理世界的监测点位一一对应

- 类似文件系统一样灵活，可以设计任意分支结构

- 适用 DCS、SCADA 等工业监控场景

#### 3.1.2 基础概念

| **概念**             | **定义**                                                     |
| -------------------- | ------------------------------------------------------------ |
| **数据库**           | 定义：一个以 root. 为前缀的路径<br>命名推荐：仅包含 root 的下一级节点，如 root.db<br>数量推荐：上限和内存相关，一个数据库也可以充分利用机器资源，无需为性能原因创建多个数据库<br>创建方式：推荐手动创建，也可创建时间序列时自动创建（默认为 root 的下一级节点） |
| **时间序列（测点）** | 定义：<br>1. 一个以数据库路径为前缀的、由 . 分割的路径，可包含任意多个层级，如 root.db.turbine.device1.metric1 <br>2. 每个时间序列可以有不同的数据类型。<br>命名推荐:<br>1. 仅将唯一定位时间序列的标签（类似联合主键）放入路径中，一般不超过10层<br>2. 通常将基数（不同的取值数量）少的标签放在前面，便于系统将公共前缀进行压缩<br>数量推荐:<br>1. 集群可管理的时间序列总量和总内存相关，可参考资源推荐章节<br>2. 任一层级的子节点数量没有限制<br>创建方式：可手动创建或在数据写入时自动创建。 |
| **设备**                 | 定义：倒数第二级为设备，如 root.db.turbine.**device1**.metric1中的“device1”这一层级即为设备<br>创建方式：无法仅创建设备，随时间序列创建而存在 |

> 注意：在进行数据建模时，为保障系统性能与扩展性，应优先创建大量设备而非在单一设备下堆积无限序列，同时确保路径倒数第二层节点基数不少于1000以提供足够的并发粒度，并在路径末级使用.value等后缀明确标识数据点——例如，推荐采用root.db.device01.metric.value的高并发模型，而非root.db.device01.metric的低效结构。

#### 3.1.3 建模示例

##### 3.1.3.1 有多种类型的设备需要管理，如何建模？

- 如场景中不同类型的设备具备不同的层级路径和测点集合，可以在数据库节点下按设备类型创建分支。每种设备下可以有不同的测点结构。

<div style="text-align: center;">
      <img src="/img/data-model-new-1.png" alt="" style="width: 70%;"/>
</div>

##### 3.1.3.2 如果场景中没有设备，只有测点，如何建模？

- 如场站的监控系统中，每个测点都有唯一编号，但无法对应到某些设备。

<div style="text-align: center;">
      <img src="/img/data-modeling04.png" alt="" style="width: 70%;"/>
</div>

##### 3.1.3.3 如果在一个设备下，既有子设备，也有测点，如何建模？

- 如在储能场景中，每一层结构都要监控其电压和电流，可以采用如下建模方式。

<div style="text-align: center;">
      <img src="/img/Modeling-scheme05.png" alt="" style="width: 70%;"/>
</div>


### 3.2 场景二：表模型

#### 3.2.1 特点

- 以时序表建模管理设备时序数据，便于使用标准 SQL 进行分析

- 适用于设备数据分析或从其他数据库迁移至 IoTDB 的场景

#### 3.2.2 基础概念

- 数据库：可管理多类设备

- 时序表：对应一类设备

| **列类别**                  | **定义**                                                     |
| --------------------------- | ------------------------------------------------------------ |
| **时间列（TIME）**          | 每个时序表必须有一个时间列，且列名必须为 time，数据类型为 TIMESTAMP  |
| **标签列（TAG）**           | 设备的唯一标识（联合主键），可以为 0 至多个<br>标签信息不可修改和删除，但允许增加<br>推荐按粒度由大到小进行排列 |
| **测点列（FIELD）** | 一个设备采集的测点可以有1个至多个，值随时间变化<br>表的测点列没有数量限制，可以达到数十万以上 |
| **属性列（ATTRIBUTE）** | 对设备的补充描述，**不随时间变化**<br>设备属性信息可以有0个或多个，可以更新或新增<br>少量希望修改的静态属性可以存至此列 |


数据筛选效率：时间列=标签列>属性列>测点列

#### 3.2.3 建模示例

##### 3.2.3.1 有多种类型的设备需要管理，如何建模？

- 推荐为每一类型的设备建立一张表，每个表可以具有不同的标签和测点集合。
- 即使设备之间有联系，或有层级关系，也推荐为每一类设备建一张表。

<div style="text-align: center;">
      <img src="/img/data-model-new-2.png" alt="" style="width: 70%;"/>
</div>

##### 3.2.3.2 如果没有设备标识列和属性列，如何建模？

- 列数没有数量限制，可以达到数十万以上。

<div style="text-align: center;">
      <img src="/img/data-modeling07.png" alt="" style="width: 70%;"/>
</div>

##### 3.2.3.3 如果在一个设备下，既有子设备，也有测点，如何建模？

- 每个设备有多个子设备及测点信息，推荐为每类设备建一个表进行管理。

<div style="text-align: center;">
      <img src="/img/data-model-new-3.png" alt="" style="width: 70%;"/>
</div>
