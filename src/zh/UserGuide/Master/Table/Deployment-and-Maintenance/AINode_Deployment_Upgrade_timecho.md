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
# AINode 部署

## 1. AINode 介绍

### 1.1 能力介绍

AINode 是 TimechoDB 在 ConfigNode、DataNode 后提供的第三种内生节点，该节点通过与 TimechoDB 集群的 DataNode、ConfigNode 交互，扩展了对时间序列进行机器学习分析的能力。AINode 将模型的管理、训练及推理融合在数据库引擎中，支持使用注册的模型在指定时序数据上通过简单 SQL 语句完成时序分析任务，还支持注册并使用自定义机器学习模型。AINode 目前已集成常见时序分析场景（例如预测）的机器学习算法和自研模型。

### 1.2 交付方式

AINode 是 TimechoDB 集群外的额外套件，独立安装包。

### 1.3 部署模式

<div >
    <img src="/img/ainode-deployment-upgrade-timecho-1.png" alt="" style="width: 45%;"/>
    <img src="/img/ainode-deployment-upgrade-timecho-2.png" alt="" style="width: 45%;"/>
</div>

## 2. 安装准备

### 2.1 安装包获取

AINode 安装包（`timechodb-<version>-ainode-bin.zip`）解压后关键目录结构如下：

| **目录** | **类型** | **说明**                           |
| ---------------- | ---------------- | ------------------------------------------ |
| lib            | 文件夹         | AINode 的可执行程序及依赖                |
| sbin           | 文件夹         | AINode 的运行脚本，用于启动或停止 AINode |
| conf           | 文件夹         | AINode 的配置文件和版本声明文件          | 

### 2.2 前置检查

为确保您获取的 AINode 安装包完整且正确，在执行安装部署前建议您进行 SHA512 校验。

**准备工作：**

* 获取官方发布的 SHA512 校验码：请联系天谋工作人员获取

**校验步骤（以 linux 为例）：**

1. 打开终端，进入安装包所在目录（如`/data/ainode`）：
   ```Bash
   cd /data/ainode
   ```
2. 执行以下命令计算哈希值：
   ```Bash
   sha512sum timechodb-{version}-ainode-bin.zip
   ```
3. 终端输出结果（左侧为SHA512 校验码，右侧为文件名）：

```SQL
(base) root@hadoop@1:/data/ainode (0.664s)
sha512sum timechodb-2.0.6.1-ainode-bin.zip
4d5a6a64935b4f0459bc9ed214c4563aa7a6a5941024336e9416212424707f27bdfdfc70f4c528b51b812687d660014adc1b8add699498ea67ff17c7e619a6f0 timechodb-2.0.6.1-ainode-bin.zip
```

4. 对比输出结果与官方 SHA512 校验码，确认一致后，即可按照下方流程执行 AINode 的安装部署操作。

**注意事项：**

* 若校验结果不一致，请联系天谋工作人员重新获取安装包
* 校验过程中若出现"文件不存在"提示，需检查文件路径是否正确或安装包是否完整下载

### 2.3 环境要求

* 建议操作环境: Linux, MacOS；
* TimechoDB 版本：>= V 2.0.8；

## 3. 安装部署及使用

### 3.1 安装 AINode

下载导入 AINode 到专用文件夹，切换到专用文件夹并解压安装包；

```Shell
unzip timechodb-<version>-ainode-bin.zip
```

### 3.2 配置项修改

AINode 支持修改一些必要的参数。可以在 `/TIMECHO_AINODE_HOME/conf/iotdb-ainode.properties` 文件中找到下列参数并进行持久化的修改：

| **名称**                            | **描述**                                       | **类型** | **默认值**   |
|-----------------------------------|----------------------------------------------| ---------------- | -------------------- |
| cluster\_name                     | AINode 要加入的集群标识                              | string| defaultCluster     |
| ain\_seed\_config\_node           | AINode 启动时注册的 ConfigNode 地址                  | String         | 127.0.0.1:10710    |
| ain\_cluster\_ingress\_address    | AINode 拉取数据的 DataNode 的 rpc 地址               | String         | 127.0.0.1          |
| ain\_cluster\_ingress\_port       | AINode 拉取数据的 DataNode 的 rpc 端口               | Integer        | 6667               |
| ain\_cluster\_ingress\_username   | AINode 拉取数据的 DataNode 的客户端用户名                | String         | root               |
| ain\_cluster\_ingress\_password   | AINode 拉取数据的 DataNode 的客户端密码                 | String         | root               |
| ain\_cluster\_ingress\_time\_zone | AINode 拉取数据的 DataNode 的客户端时区                 | String         | UTC+8              |
| ain\_rpc\_address                 | AINode 提供服务与通信的地址 ，内部服务通讯接口                  | String         | 127.0.0.1          |
| ain\_rpc\_port                    | AINode 提供服务与通信的端口                            | String         | 10810              |
| ain\_system\_dir                  | AINode 元数据存储路径，相对路径的起始目录与操作系统相关，建议使用绝对路径     | String| data/AINode/system |
| ain\_models\_dir                  | AINode 存储模型文件的路径，相对路径的起始目录与操作系统相关，建议使用绝对路径   | String| data/AINode/models |
| ain\_thrift\_compression\_enabled | AINode 是否启用 thrift 的压缩机制，0-不启动、1-启动          | Boolean        | 0                  |

### 3.3 导入内置权重文件

若部署环境可联网且能连通 HuggingFace 环境，系统会自动拉取内置模型权重文件，可忽略本步骤。

若为离线环境，联系天谋工作人员获取模型权重文件夹，并放置到`/TIMECHO_AINODE_HOME/data/ainode/models/builtin` 目录下。

**​NOTE：​**注意目录层级，最终所有内置模型权重的父目录都是 `builtin `。

### 3.4 启动 AINode

在完成 ConfigNode 的部署后，可以通过添加 TimechoDB 来支持时序模型的管理和推理功能。在配置项中指定 TimechoDB 集群的信息后，可以执行相应的指令来启动 AINode，加入 TimechoDB 集群。

```Shell
# 启动命令
 # Linux 和 MacOS 系统
 bash sbin/start-ainode.sh  

 # Windows 系统
 sbin\start-ainode.bat  

 # 后台启动命令（长期运行推荐）
 # Linux 和 MacOS 系统
 bash sbin/start-ainode.sh -d

 # Windows 系统
 bash sbin\start-ainode.bat -d
```

### 3.5 激活 AINode

1. 参考 TimechoDB 激活：[激活方式](../Deployment-and-Maintenance/Stand-Alone-Deployment_timecho.md#_2-6-激活数据库)

2. 可通过如下方式验证 AINode 激活，当看到状态显示为 ACTIVATED 表示激活成功。

```SQL
IoTDB> show cluster
+------+----------+-------+---------------+------------+--------------+-----------+--------------+
|NodeID|  NodeType| Status|InternalAddress|InternalPort|       Version|  BuildInfo|ActivateStatus|
+------+----------+-------+---------------+------------+--------------+-----------+--------------+
|     0|ConfigNode|Running|      127.0.0.1|       10710|     <version>|    xxxxxxx|     ACTIVATED|
|     1|  DataNode|Running|      127.0.0.1|       10730|     <version>|    xxxxxxx|     ACTIVATED|
|     2|    AINode|Running|      127.0.0.1|       10810|     <version>|    xxxxxxx|     ACTIVATED|
+------+----------+-------+---------------+------------+--------------+-----------+--------------+
Total line number = 3
It costs 0.002s
IoTDB> show activation
+---------------+---------+-----------------------------+
|    LicenseInfo|    Usage|                        Limit|
+---------------+---------+-----------------------------+
|         Status|ACTIVATED|                            -|
|    ExpiredTime|        -|2025-07-16T00:00:00.000+08:00|
|  DataNodeLimit|        1|                    Unlimited|
|    AiNodeLimit|        1|                            1|
|       CpuLimit|       11|                    Unlimited|
|    DeviceLimit|        0|                    Unlimited|
|TimeSeriesLimit|        0|                        9,999|
+---------------+---------+-----------------------------+
Total line number = 7
It costs 0.013s
```


### 3.6 检测 AINode 节点状态

AINode 启动过程中会自动将新的 AINode 加入 TimechoDB 集群。启动 AINode 后可以在命令行中输入 SQL 来查询，集群中看到 AINode 节点，其运行状态为 Running（如下展示）表示加入成功。

```Shell
IoTDB> show cluster
+------+----------+-------+---------------+------------+--------------+-----------+--------------+
|NodeID|  NodeType| Status|InternalAddress|InternalPort|       Version|  BuildInfo|ActivateStatus|
+------+----------+-------+---------------+------------+--------------+-----------+--------------+
|     0|ConfigNode|Running|      127.0.0.1|       10710|     <version>|    xxxxxxx|     ACTIVATED|
|     1|  DataNode|Running|      127.0.0.1|       10730|     <version>|    xxxxxxx|     ACTIVATED|
|     2|    AINode|Running|      127.0.0.1|       10810|     <version>|    xxxxxxx|     ACTIVATED|
+------+----------+-------+---------------+------------+--------------+-----------+--------------+
```

除此之外，还可以通过 show models 命令来查看模型状态。如果模型状态不对，请检查权重文件路径是否正确。

```Bash
IoTDB> show models
+---------------------+---------+--------+--------+
|              ModelId|ModelType|Category|   State|
+---------------------+---------+--------+--------+
|                arima|   sktime| builtin|  active|
|          holtwinters|   sktime| builtin|  active|
|exponential_smoothing|   sktime| builtin|  active|
|     naive_forecaster|   sktime| builtin|  active|
|       stl_forecaster|   sktime| builtin|  active|
|         gaussian_hmm|   sktime| builtin|  active|
|              gmm_hmm|   sktime| builtin|  active|
|                stray|   sktime| builtin|  active|
|             timer_xl|    timer| builtin|  active|
|              sundial|  sundial| builtin|  active|
|             chronos2|       t5| builtin|  active|
+---------------------+---------+--------+--------+
```

### 3.7 停止 AINode

如果需要停止正在运行的 AINode 节点，则执行相应的关停脚本，且支持通过参数 -p 指定端口，该端口为配置项中的 `ain_rpc_port`。

```Shell
# Linux / MacOS 
 bash sbin/stop-ainode.sh
 bash sbin/stop-ainode.sh -p <port_id> # 指定端口
  
 #Windows
 sbin\stop-ainode.bat  
 sbin\stop-ainode.bat -p <port_id> # 指定端口
```

停止 AINode 后，还可以在集群中看到 AINode 节点，其运行状态为 UNKNOWN（如下展示），此时无法使用 AINode 功能。

```Shell
IoTDB> show cluster
+------+----------+-------+---------------+------------+--------------+-----------+--------------+
|NodeID|  NodeType| Status|InternalAddress|InternalPort|       Version|  BuildInfo|ActivateStatus|
+------+----------+-------+---------------+------------+--------------+-----------+--------------+
|     0|ConfigNode|Running|      127.0.0.1|       10710|     <version>|    xxxxxxx|     ACTIVATED|
|     1|  DataNode|Running|      127.0.0.1|       10730|     <version>|    xxxxxxx|     ACTIVATED|
|     2|    AINode|UNKNOWN|      127.0.0.1|       10810|     <version>|    xxxxxxx|     ACTIVATED|
+------+----------+-------+---------------+------------+--------------+-----------+--------------+
```

如果需要重新启动该节点，需重新执行启动脚本。
