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

## 1. AINode介绍

### 1.1 能力介绍

AINode 是 IoTDB 在 ConfigNode、DataNode 后提供的第三种内生节点，该节点通过与 IoTDB 集群的 DataNode、ConfigNode 的交互，扩展了对时间序列进行机器学习分析的能力，支持从外部引入已有机器学习模型进行注册，并使用注册的模型在指定时序数据上通过简单 SQL 语句完成时序分析任务的过程，将模型的创建、管理及推理融合在数据库引擎中。目前已提供常见时序分析场景（例如预测与异常检测）的机器学习算法或自研模型。

### 1.2 交付方式
AINode 是 IoTDB 集群外的额外套件，独立安装包。

### 1.3 部署模式
<div >
    <img src="/img/AINode%E9%83%A8%E7%BD%B21.png" alt="" style="width: 45%;"/>
    <img src="/img/AINode%E9%83%A8%E7%BD%B22.png" alt="" style="width: 45%;"/>
</div>

## 2. 安装准备

### 2.1 安装包获取

AINode 安装包（`timechodb-<version>-ainode-bin.zip`），安装包解压后目录结构如下：

| **目录**     | **类型** | **说明**                                         |
| ------------ | -------- | ------------------------------------------------ |
| lib          | 文件夹   | AINode 的 python 包文件  |
| sbin         | 文件夹   | AINode的运行脚本，可以启动，移除和停止AINode     |
| conf         | 文件夹   | AINode 的配置文件和运行环境设置脚本           |
| LICENSE      | 文件     | 证书                                             |
| NOTICE       | 文件     | 提示                                             |
| README_ZH.md | 文件     | markdown格式的中文版说明                         |
| README.md   | 文件     | 使用说明                                         |

### 2.2 前置检查

为确保您获取的 AINode 安装包完整且正确，在执行安装部署前建议您进行SHA512校验。

#### 准备工作：

- 获取官方发布的 SHA512 校验码：请联系天谋工作人员获取

#### 校验步骤（以 linux 为例）：

1. 打开终端，进入安装包所在目录（如`/data/ainode`）：
   ```Bash
      cd /data/ainode
      ```
2. 执行以下命令计算哈希值：
   ```Bash
      sha512sum timechodb-{version}-ainode-bin.zip
      ```
3. 终端输出结果（左侧为SHA512 校验码，右侧为文件名）：

![img](/img/sha512-06.png)

4. 对比输出结果与官方 SHA512 校验码，确认一致后，即可按照下方流程执行 AINode 的安装部署操作。

#### 注意事项：

- 若校验结果不一致，请联系天谋工作人员重新获取安装包
- 校验过程中若出现"文件不存在"提示，需检查文件路径是否正确或安装包是否完整下载

### 2.3 环境准备 

1. 建议操作环境: Ubuntu, MacOS  
2. IoTDB 版本：>= V 2.0.5.1
3. 运行环境   
   - Python 版本在 3.9 ~3.12，且带有 pip 和 venv 工具；


## 3. 安装部署及使用

### 3.1 安装 AINode

1. 保证 Python 版本介于 3.9 ~3.12

```shell
python --version
# 或
python3 --version
```
2. 下载导入 AINode 到专用文件夹，切换到专用文件夹并解压安装包

```shell
  unzip timechodb-<version>-ainode-bin.zip
```

3. 激活 AINode：

- 进入 IoTDB CLI

```sql
  # Linux或MACOS系统  
  ./start-cli.sh -sql_dialect table    
  
  # windows系统  
  ./start-cli.bat -sql_dialect table
```

- 执行以下内容获取激活所需机器码：

```sql
show system info
```

- 将返回的机器码复制给天谋工作人员：

```sql
+--------------------------------------------------------------+
|                                                    SystemInfo|
+--------------------------------------------------------------+
|                                          01-TE5NLES4-UDDWCMYE|
+--------------------------------------------------------------+
```

- 将工作人员返回的激活码输入到CLI中，输入以下内容
   - 注：激活码前后需要用'符号进行标注，如所示

```sql
IoTDB> activate '01-D4EYQGPZ-EAUJJODW-NUKRDR6F-TUQS3B75-EDZFLK3A-6BOKJFFZ-ALDHOMN7-NB2E4BHI-7ZK'
```

- 可通过如下方式验证激活，当看到状态显示为 ACTIVATED 表示激活成功

```sql
IoTDB> show cluster
+------+----------+-------+---------------+------------+--------------+-----------+--------------+
|NodeID|  NodeType| Status|InternalAddress|InternalPort|       Version|  BuildInfo|ActivateStatus|
+------+----------+-------+---------------+------------+--------------+-----------+--------------+
|     0|ConfigNode|Running|      127.0.0.1|       10710|     <version>|    xxxxxxx|     ACTIVATED|
|     1|  DataNode|Running|      127.0.0.1|       10730|     <version>|    xxxxxxx|     ACTIVATED|
|     2|    AINode|Running|      127.0.0.1|       10810|     <version>|    xxxxxxx|     ACTIVATED|
+------+----------+-------+---------------+------------+--------------+-----------+--------------+

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

```

### 3.2 配置项修改
AINode 支持修改一些必要的参数。可以在 `conf/iotdb-ainode.properties` 文件中找到下列参数并进行持久化的修改：

| **名称**                       | **描述**                                                     | **类型** | **默认值**         |
| ------------------------------ | ------------------------------------------------------------ | -------- | ------------------ |
| cluster_name                   | AINode 要加入集群的标识                                      | string   | defaultCluster     |
| ain_seed_config_node           | AINode 启动时注册的 ConfigNode 地址                          | String   | 127.0.0.1:10710    |
| ain_cluster_ingress_address    | AINode 拉取数据的 DataNode 的 rpc 地址                       | String   | 127.0.0.1          |
| ain_cluster_ingress_port       | AINode 拉取数据的 DataNode 的 rpc 端口                       | Integer  | 6667               |
| ain_cluster_ingress_username   | AINode 拉取数据的 DataNode 的客户端用户名                    | String   | root               |
| ain_cluster_ingress_password   | AINode 拉取数据的 DataNode 的客户端密码                      | String   | root               |
| ain_cluster_ingress_time_zone  | AINode 拉取数据的 DataNode 的客户端时区                      | String   | UTC+8              |
| ain_inference_rpc_address      | AINode 提供服务与通信的地址 ，内部服务通讯接口               | String   | 127.0.0.1          |
| ain_inference_rpc_port         | AINode 提供服务与通信的端口                                  | String   | 10810              |
| ain_system_dir                 | AINode 元数据存储路径，相对路径的起始目录与操作系统相关，建议使用绝对路径 | String   | data/AINode/system |
| ain_models_dir                 | AINode 存储模型文件的路径，相对路径的起始目录与操作系统相关，建议使用绝对路径 | String   | data/AINode/models |
| ain_thrift_compression_enabled | AINode 是否启用 thrift 的压缩机制，0-不启动、1-启动          | Boolean  | 0                  |

### 3.3 导入权重文件

> 仅离线环境，在线环境可忽略本步骤
> 
 联系天谋工作人员获取模型权重文件，并放置到/IOTDB_AINODE_HOME/data/ainode/models/weights/目录下。

### 3.4 启动 AINode

 在完成 Seed-ConfigNode 的部署后，可以通过添加 AINode 节点来支持模型的注册和推理功能。在配置项中指定 IoTDB 集群的信息后，可以执行相应的指令来启动 AINode，加入 IoTDB 集群。  

- 联网环境启动

启动命令

```shell
  # 启动命令
  # Linux 和 MacOS 系统
  bash sbin/start-ainode.sh  

  # Windows 系统
  sbin\start-ainode.bat  

  # 后台启动命令（长期运行推荐）
  # Linux 和 MacOS 系统
  nohup bash sbin/start-ainode.sh  > myout.file 2>& 1 &

  # Windows 系统
  nohup bash sbin\start-ainode.bat  > myout.file 2>& 1 &
  ```

### 3.5 检测 AINode 节点状态 

AINode 启动过程中会自动将新的 AINode 加入 IoTDB 集群。启动 AINode 后可以在 命令行中输入 SQL 来查询，集群中看到 AINode 节点，其运行状态为 Running（如下展示）表示加入成功。

```shell
IoTDB> show cluster
+------+----------+-------+---------------+------------+-------+-----------+
|NodeID|  NodeType| Status|InternalAddress|InternalPort|Version|  BuildInfo|
+------+----------+-------+---------------+------------+-------+-----------+
|     0|ConfigNode|Running|      127.0.0.1|       10710|UNKNOWN|190e303-dev|
|     1|  DataNode|Running|      127.0.0.1|       10730|UNKNOWN|190e303-dev|
|     2|    AINode|Running|      127.0.0.1|       10810|UNKNOWN|190e303-dev|
+------+----------+-------+---------------+------------+-------+-----------+
```

除此之外，还可以通过 show models 命令来查看模型状态。如果模型状态不对，请检查权重文件路径是否正确。

```sql
IoTDB:etth> show models
+---------------------+--------------------+--------+------+
|              ModelId|           ModelType|Category| State|
+---------------------+--------------------+--------+------+
|                arima|               Arima|BUILT-IN|ACTIVE|
|          holtwinters|         HoltWinters|BUILT-IN|ACTIVE|
|exponential_smoothing|ExponentialSmoothing|BUILT-IN|ACTIVE|
|     naive_forecaster|     NaiveForecaster|BUILT-IN|ACTIVE|
|       stl_forecaster|       StlForecaster|BUILT-IN|ACTIVE|
|         gaussian_hmm|         GaussianHmm|BUILT-IN|ACTIVE|
|              gmm_hmm|              GmmHmm|BUILT-IN|ACTIVE|
|                stray|               Stray|BUILT-IN|ACTIVE|
|              sundial|       Timer-Sundial|BUILT-IN|ACTIVE|
|             timer_xl|            Timer-XL|BUILT-IN|ACTIVE|
+---------------------+--------------------+--------+------+
```

### 3.6 停止 AINode

如果需要停止正在运行的 AINode 节点，则执行相应的关闭脚本。

- 停止命令

```shell
  # Linux / MacOS 
  bash sbin/stop-ainode.sh

  #Windows
  sbin\stop-ainode.bat  
  ```

停止 AINode 后，还可以在集群中看到 AINode 节点，其运行状态为 UNKNOWN（如下展示），此时无法使用 AINode 功能。

 ```shell
IoTDB> show cluster
+------+----------+-------+---------------+------------+-------+-----------+
|NodeID|  NodeType| Status|InternalAddress|InternalPort|Version|  BuildInfo|
+------+----------+-------+---------------+------------+-------+-----------+
|     0|ConfigNode|Running|      127.0.0.1|       10710|UNKNOWN|190e303-dev|
|     1|  DataNode|Running|      127.0.0.1|       10730|UNKNOWN|190e303-dev|
|     2|    AINode|UNKNOWN|      127.0.0.1|       10790|UNKNOWN|190e303-dev|
+------+----------+-------+---------------+------------+-------+-----------+
```
如果需要重新启动该节点，需重新执行启动脚本。


## 4. 常见问题

### 4.1 启动AINode时出现找不到venv模块的报错

 当使用默认方式启动 AINode 时，会在安装包目录下创建一个 python 虚拟环境并安装依赖，因此要求安装 venv 模块。通常来说 python3.10 及以上的版本会自带 venv，但对于一些系统自带的 python 环境可能并不满足这一要求。出现该报错时有两种解决方案（二选一）：

 在本地安装 venv 模块，以 ubuntu 为例，可以通过运行以下命令来安装 python 自带的 venv 模块。或者从 python 官网安装一个自带 venv 的 python 版本。

 ```shell
apt-get install python3.10-venv 
```
 安装 3.10.0 版本的 venv 到 AINode 里面 在 AINode 路径下

 ```shell
../Python-3.10.0/python -m venv venv(文件夹名）
```
 在运行启动脚本时通过 `-i` 指定已有的 python 解释器路径作为 AINode 的运行环境，这样就不再需要创建一个新的虚拟环境。

 ### 4.2 python中的SSL模块没有被正确安装和配置，无法处理HTTPS资源
WARNING: pip is configured with locations that require TLS/SSL, however the ssl module in Python is not available.      
可以安装 OpenSSLS 后，再重新构建 python 来解决这个问题
> Currently Python versions 3.6 to 3.9 are compatible with OpenSSL 1.0.2, 1.1.0, and 1.1.1.

 Python 要求我们的系统上安装有 OpenSSL，具体安装方法可见[链接](https://stackoverflow.com/questions/56552390/how-to-fix-ssl-module-in-python-is-not-available-in-centos)

 ```shell
sudo apt-get install build-essential libssl-dev zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm libncurses5-dev libncursesw5-dev xz-utils tk-dev libffi-dev liblzma-dev uuid-dev lzma-dev liblzma-dev
sudo -E ./configure --with-ssl
make
sudo make install
```

 ### 4.3 pip版本较低

 windows下出现类似“error：Microsoft Visual C++ 14.0 or greater is required...”的编译问题

 出现对应的报错，通常是 c++版本或是 setuptools 版本不足，可以在

 ```shell
./python -m pip install --upgrade pip
./python -m pip install --upgrade setuptools
```


 ### 4.4 安装编译python

 使用以下指定从官网下载安装包并解压:
  ```shell
.wget https://www.python.org/ftp/python/3.10.0/Python-3.10.0.tar.xz
tar Jxf Python-3.10.0.tar.xz 
```
 编译安装对应的 python 包:
 ```shell
cd Python-3.10.0
./configure prefix=/usr/local/python3
make
sudo make install
python3 --version
```