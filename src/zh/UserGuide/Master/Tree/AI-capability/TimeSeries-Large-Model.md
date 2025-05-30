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

# 时序大模型

## 简介

时序大模型是一种专为时序数据分析设计的基础模型。IoTDB 团队长期自研时序大模型，基于变换器（Transformer）结构等技术在海量时序数据上预训练，能够理解并生成多种领域的时序数据，可被应用于时序预测、异常检测、时序填补等应用场景。不同于传统时序分析技术，时序大模型具备通用特征提取能力，基于零样本分析、微调等技术服务广泛的分析任务。

团队所研时序大模型相关技术均发表在国际机器学习顶级会议。

## 应用场景

- **时序预测**：为工业生产、自然环境等领域提供时间序列数据的预测服务，帮助用户提前了解未来趋势。
- **数据填补**：针对时间序列中的缺失序列段，进行上下文填补，以增强数据集的连续性和完整性。
- **异常检测**：利用自回归分析技术，对时间序列数据进行实时监测，及时预警潜在的异常情况。

![](/img/LargeModel09.png)

## Timer 模型

Timer模型不仅展现了出色的少样本泛化和多任务适配能力，还通过预训练获得了丰富的知识库，赋予了它处理多样化下游任务的通用能力，拥有以下特点：

- **泛化性**：模型能够通过使用少量样本进行微调，达到行业内领先的深度模型预测效果。
- **通用性**：模型设计灵活，能够适配多种不同的任务需求，并且支持变化的输入和输出长度，使其在各种应用场景中都能发挥作用。
- **可扩展性**：随着模型参数数量的增加或预训练数据规模的扩大，模型的性能会持续提升，确保模型能够随着时间和数据量的增长而不断优化其预测效果。

![](/img/LargeModel02.png)

## Timer-XL 模型

Timer-XL 基于 Timer 进一步扩展升级了网络结构，在多个维度上进行全面突破：

- **超长上下文支持**：该模型突破了传统时序预测模型的限制，支持处理数千个Token（相当于数万个时间点）的输入，有效解决了上下文长度的瓶颈问题。
- **多变量预测场景覆盖**：支持多种预测场景，包括非平稳时间序列的预测、涉及多个变量的预测任务以及包含协变量的预测，满足多样化的业务需求。
- **大规模工业时序数据集**：采用万亿大规模工业物联网领域的时序数据集进行预训练，数据集兼有庞大的体量、卓越的质量和丰富的领域等重要特质，覆盖能源、航空航天、钢铁、交通等多领域。


## 效果展示

时序大模型能够适应多种不同领域和场景的真实时序数据，在各种任务上拥有优异的处理效果，以下是在不同数据上的真实表现：

**时序预测：**

利用时序大模型的预测能力，能够准确预测时间序列的未来变化趋势，如下图蓝色曲线代表预测趋势，红色曲线为实际趋势，两曲线高度吻合。

![](/img/LargeModel03.png)

**数据填补：**

利用时序大模型对缺失数据段进行预测式填补。

![](/img/timeseries-large-model-data-imputation.png)


**异常检测：**

利用时序大模型精准识别与正常趋势偏离过大的异常值。

![](/img/LargeModel05.png)

## 部署使用

1. 打开 IoTDB cli 控制台，检查 ConfigNode、DataNode、AINode 节点确保均为 Running。

检查命令：
```sql
show cluster
```

![](/img/ainode-timer-1.png)

2. 模型文件存放路径：推荐放在 AINode 安装包相同文件夹下，可新建模型文件夹存放模型文件
3. 注册模型语句

```sql
create model <model_name> using uri <uri>
```

示例：

```sql
create model Timer-xl using uri <uri>
```

4. 检查模型是否注册成功

检查命令：

```sql
show models
```

![](/img/LargeModel06.png)
