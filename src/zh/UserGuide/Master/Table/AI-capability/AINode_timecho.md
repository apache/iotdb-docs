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

# AINode

AINode 是支持时序大模型注册、管理、调用的 IoTDB 原生节点，内置业界领先的自研时序大模型，如 Timer、Sundial 等，可通过标准 SQL 语句进行调用，实现时序数据的毫秒级实时推理，可支持时序趋势预测、缺失值填补、异常值检测等应用场景。

系统架构如下图所示：

![](/img/h4.png)

三种节点的职责如下：

- **ConfigNode**：负责保存和管理模型的元信息；负责分布式节点管理。
- **DataNode**：负责接收并解析用户的 SQL请求；负责存储时间序列数据；负责数据的预处理计算。
- **AINode**：负责模型文件的导入创建以及模型推理。

## 1. 优势特点

与单独构建机器学习服务相比，具有以下优势：

- **简单易用**：无需使用 Python 或 Java 编程，使用 SQL 语句即可完成机器学习模型管理与推理的完整流程。如创建模型可使用CREATE MODEL语句、使用模型进行推理可使用CALL INFERENCE(...)语句等，使用更加简单便捷。

- **避免数据迁移**：使用 IoTDB 原生机器学习可以将存储在 IoTDB 中的数据直接应用于机器学习模型的推理，无需将数据移动到单独的机器学习服务平台，从而加速数据处理、提高安全性并降低成本。

![](/img/h1.png)

- **内置先进算法**：支持业内领先机器学习分析算法，覆盖典型时序分析任务，为时序数据库赋能原生数据分析能力。如：
  - **时间序列预测（Time Series Forecasting）**：从过去时间序列中学习变化模式；从而根据给定过去时间的观测值，输出未来序列最可能的预测。
  - **时序异常检测（Anomaly Detection for Time Series）**：在给定的时间序列数据中检测和识别异常值，帮助发现时间序列中的异常行为。
  - **时间序列标注（Time Series Annotation）**：为每个数据点或特定时间段添加额外的信息或标记，例如事件发生、异常点、趋势变化等，以便更好地理解和分析数据。


## 2. 基本概念

- **模型（Model）**：机器学习模型，以时序数据作为输入，输出分析任务的结果或决策。模型是AINode 的基本管理单元，支持模型的增（注册）、删、查、用（推理）。
- **创建（Create）**: 将外部设计或训练好的模型文件或算法加载到MLNode中，由IoTDB统一管理与使用。
- **推理（Inference）**：使用创建的模型在指定时序数据上完成该模型适用的时序分析任务的过程。
- **内置能力（Built-in）**：AINode 自带常见时序分析场景（例如预测与异常检测）的机器学习算法或自研模型。

![](/img/h3.png)

## 3. 安装部署

AINode 的部署可参考文档 [部署指导](../Deployment-and-Maintenance/AINode_Deployment_timecho.md) 章节。

## 4. 使用指导

AINode 对时序数据相关的深度学习模型提供了模型创建及删除的流程，内置模型无需创建及删除，可直接使用，并且在完成推理后创建的内置模型实例将自动销毁。

### 4.1 注册模型

通过指定模型输入输出的向量维度，可以注册训练好的深度学习模型，从而用于模型推理。

符合以下内容的模型可以注册到AINode中：
  1.  AINode 支持的PyTorch 2.1.0、 2.2.0版本训练的模型，需避免使用2.2.0版本以上的特性。
  2.  AINode支持使用PyTorch JIT存储的模型，模型文件需要包含模型的参数和结构。
  3.  模型输入序列可以包含一列或多列，若有多列，需要和模型能力、模型配置文件对应。
  4.  模型的输入输出维度必须在`config.yaml`配置文件中明确定义。使用模型时，必须严格按照`config.yaml`配置文件中定义的输入输出维度。如果输入输出列数不匹配配置文件，将会导致错误。

下方为模型注册的SQL语法定义。

```SQL
create model <model_name> using uri <uri>
```

SQL中参数的具体含义如下：

- model_name：模型的全局唯一标识，不可重复。模型名称具备以下约束：

  - 允许出现标识符 [ 0-9 a-z A-Z _ ] （字母，数字，下划线）
  - 长度限制为2-64字符
  - 大小写敏感

- uri：模型注册文件的资源路径，路径下应包含**模型权重model.pt文件和模型的元数据描述文件config.yaml**

  - 模型权重文件：深度学习模型训练完成后得到的权重文件，目前支持pytorch训练得到的.pt文件

  - yaml元数据描述文件：模型注册时需要提供的与模型结构有关的参数，其中必须包含模型的输入输出维度用于模型推理：

    - | **参数名**   | **参数描述**                 | **示例** |
      | ------------ | ---------------------------- | -------- |
      | input_shape  | 模型输入的行列，用于模型推理 | [96,2]   |
      | output_shape | 模型输出的行列，用于模型推理 | [48,2]   |

    - ​    除了模型推理外，还可以指定模型输入输出的数据类型：

    - | **参数名**  | **参数描述**       | **示例**              |
      | ----------- | ------------------ | --------------------- |
      | input_type  | 模型输入的数据类型 | ['float32','float32'] |
      | output_type | 模型输出的数据类型 | ['float32','float32'] |

    - ​    除此之外，可以额外指定备注信息用于在模型管理时进行展示

    - | **参数名** | **参数描述**                                   | **示例**                                    |
      | ---------- | ---------------------------------------------- | ------------------------------------------- |
      | attributes | 可选，用户自行设定的模型备注信息，用于模型展示 | 'model_type': 'dlinear','kernel_size': '25' |


除了本地模型文件的注册，还可以通过URI来指定远程资源路径来进行注册，使用开源的模型仓库（例如HuggingFace）。


### 4.2 查看模型

注册成功的模型可以通过show models指令查询模型的具体信息。其SQL定义如下：

```SQL
show models

show models <model_name>
```

除了直接展示所有模型的信息外，可以指定model id来查看某一具体模型的信息。模型展示的结果中包含如下信息：

| **ModelId**  | **State**                             | **Configs**                                    | **Attributes** |
| ------------ | ------------------------------------- | ---------------------------------------------- | -------------- |
| 模型唯一标识 | 模型注册状态(LOADING,ACTIVE,DROPPING) | InputShape, outputShapeInputTypes, outputTypes | 模型备注信息   |

其中，State用于展示当前模型注册的状态，包含以下三个阶段

- **LOADING**：已经在configNode中添加对应的模型元信息，正将模型文件传输到AINode节点上
- **ACTIVE:** 模型已经设置完成，模型处于可用状态
- **DROPPING**：模型删除中，正在从configNode以及AINode处删除模型相关信息
- **UNAVAILABLE**: 模型创建失败，可以通过drop model删除创建失败的model_name。


### 4.3 删除模型

对于注册成功的模型，用户可以通过SQL进行删除。该操作除了删除configNode上的元信息外，还会删除所有AINode下的相关模型文件。其SQL如下：

```SQL
drop model <model_name>
```

需要指定已经成功注册的模型model_name来删除对应的模型。由于模型删除涉及多个节点上的数据删除，操作不会立即完成，此时模型的状态为DROPPING，该状态的模型不能用于模型推理。

### 4.4 使用内置模型推理

敬请期待

## 5. 权限管理

使用AINode相关的功能时，可以使用IoTDB本身的鉴权去做一个权限管理，用户只有在具备 USE_MODEL 权限时，才可以使用模型管理的相关功能。当使用推理功能时，用户需要有访问输入模型的SQL对应的源序列的权限。

| 权限名称  | 权限范围                           | 管理员用户（默认ROOT）   | 普通用户  | 路径相关 |
| --------- | --------------------------------- | ---------------------- | -------- | -------- |
| USE_MODEL | create model / show models / drop model | √                | √        | x        |
| READ_DATA | call inference                          |  √               | √        |   √      |

## 6. 实际案例

敬请期待