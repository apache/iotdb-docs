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

## 1 AINode介绍

### 1.1 能力介绍

AINode 是 IoTDB 在 ConfigNode、DataNode 后提供的第三种内生节点，该节点通过与 IoTDB 集群的 DataNode、ConfigNode 的交互，扩展了对时间序列进行机器学习分析的能力，支持从外部引入已有机器学习模型进行注册，并使用注册的模型在指定时序数据上通过简单 SQL 语句完成时序分析任务的过程，将模型的创建、管理及推理融合在数据库引擎中。目前已提供常见时序分析场景（例如预测与异常检测）的机器学习算法或自研模型。

### 1.2 交付方式
 是 IoTDB 集群外的额外套件，独立安装包，独立激活（如需试用或使用，请联系天谋科技商务或技术支持）。

### 1.3 部署模式
<div >
    <img src="/img/AINode%E9%83%A8%E7%BD%B21.png" alt="" style="width: 45%;"/>
    <img src="/img/AINode%E9%83%A8%E7%BD%B22.png" alt="" style="width: 45%;"/>
</div>

## 2 安装准备

### 2.1 安装包获取

 用户可以下载AINode的软件安装包，下载并解压后即完成AINode的安装。

 解压后安装包（`iotdb-enterprise-ainode-<version>.zip`），安装包解压后目录结构如下：
| **目录**     | **类型** | **说明**                                         |
| ------------ | -------- | ------------------------------------------------ |
| lib          | 文件夹   | AINode编译后的二进制可执行文件以及相关的代码依赖 |
| sbin         | 文件夹   | AINode的运行脚本，可以启动，移除和停止AINode     |
| conf         | 文件夹   | 包含AINode的配置项，具体包含以下配置项           |
| LICENSE      | 文件     | 证书                                             |
| NOTICE       | 文件     | 提示                                             |
| README_ZH.md | 文件     | markdown格式的中文版说明                         |
| `README.md`    | 文件     | 使用说明                                         |

### 2.2 环境准备  
- 建议操作环境: Ubuntu, CentOS, MacOS  

- 运行环境   
    - 联网环境下 Python >= 3.8即可，且带有 pip 和 venv 工具；非联网环境下需要使用 Python 3.8版本，并从 [此处](https://cloud.tsinghua.edu.cn/d/4c1342f6c272439aa96c/?p=%2Flibs&mode=list) 下载对应操作系统的zip压缩包（注意下载依赖需选择libs文件夹中的zip压缩包，如下图），并将文件夹下的所有文件拷贝到 `iotdb-enterprise-ainode-<version>` 文件夹中 `lib` 文件夹下，并按下文步骤启动AINode。 

      <img src="/img/AINode%E9%83%A8%E7%BD%B23.png" alt="" style="width: 80%;"/>
    
    - 环境变量中需存在 Python 解释器且可以通过 `python` 指令直接调用
    - 建议在 `iotdb-enterprise-ainode-<version>` 文件夹下，新建 Python 解释器 venv 虚拟环境。如安装 3.8.0 版本虚拟环境，语句如下：
    
      ```shell
      # 安装3.8.0版本的venv，创建虚拟环境，文件夹名为 `venv`
      ../Python-3.8.0/python -m venv `venv`
      ```
## 3 安装部署及使用

### 3.1 安装 AINode

1. 检查Linux的内核架构
```shell
  uname -m
  ```

2. 导入Python环境[下载](https://repo.anaconda.com/miniconda/)

推荐下载py311版本应用，导入至用户根目录下 iotdb专用文件夹 中

3. 切换至iotdb专用文件夹安装Python环境

以 Miniconda3-py311_24.5.0-0-Linux-x86_64 为例：

```shell
  bash ./Miniconda3-py311_24.5.0-0-Linux-x86_64.sh
  ```
> 根据提示键入“回车”、“长按空格”、“回车”、“yes”、“yes” <br>
> 关闭当前SSH窗口重新连接

  4. 创建专用环境

```shell
  conda create -n ainode_py python=3.11.9
  ```

  根据提示键入“y”

  5. 激活专用环境

```shell
  conda activate ainode_py
  ```

  6. 验证Python版本

```shell
  python --version
  ```
  7. 下载导入AINode到专用文件夹，切换到专用文件夹并解压安装包

```shell
  unzip iotdb-enterprise-ainode-1.3.3.2.zip
  ```

  8. 配置项修改

```shell
  vi iotdb-enterprise-ainode-1.3.3.2/conf/iotdb-ainode.properties
  ```
  配置项修改：[详细信息](#配置项修改)
> ain_seed_config_node=iotdb-1:10710（集群通讯节点IP:通讯节点端口）<br>
> ain_inference_rpc_address=iotdb-3（运行AINode的服务器IP）

  9. 更换Python源

```shell
  pip config set global.index-url https://mirrors.aliyun.com/pypi/simple/
  ```

  10. 启动AINode节点

```shell
  nohup bash iotdb-enterprise-ainode-1.3.3.2/sbin/start-ainode.sh  > myout.file 2>& 1 &
  ```
> 回到系统默认环境：conda deactivate
  
### 3.2 配置项修改
AINode 支持修改一些必要的参数。可以在 `conf/iotdb-ainode.properties` 文件中找到下列参数并进行持久化的修改：

| **名称**                           | **描述**                                                         | **类型**    | **默认值**             | **改后生效方式**                 |
| :----------------------------- | ------------------------------------------------------------ | ------- | ------------------ | ---------------------------- |
| cluster_name                   | AINode 要加入集群的标识                                      | string  | defaultCluster     | 仅允许在第一次启动服务前修改 |
| ain_seed_config_node           | AINode 启动时注册的 ConfigNode 地址                          | String  | 127.0.0.1:10710      | 仅允许在第一次启动服务前修改 |
| ain_inference_rpc_address      | AINode 提供服务与通信的地址 ，内部服务通讯接口                        | String  | 127.0.0.1          | 仅允许在第一次启动服务前修改    |
| ain_inference_rpc_port         | AINode 提供服务与通信的端口                                  | String  | 10810              | 仅允许在第一次启动服务前修改   |
| ain_system_dir                 | AINode 元数据存储路径，相对路径的起始目录与操作系统相关，建议使用绝对路径 | String  | data/AINode/system | 仅允许在第一次启动服务前修改   |
| ain_models_dir                 | AINode 存储模型文件的路径，相对路径的起始目录与操作系统相关，建议使用绝对路径 | String  | data/AINode/models | 仅允许在第一次启动服务前修改   |
| ain_logs_dir                   | AINode 存储日志的路径，相对路径的起始目录与操作系统相关，建议使用绝对路径 | String  | logs/AINode        | 重启后生效                   |
| ain_thrift_compression_enabled | AINode 是否启用 thrift 的压缩机制，0-不启动、1-启动          | Boolean | 0                  | 重启后生效                   |
### 3.3 启动 AINode

 在完成 Seed-ConfigNode 的部署后，可以通过添加 AINode 节点来支持模型的注册和推理功能。在配置项中指定 IoTDB 集群的信息后，可以执行相应的指令来启动 AINode，加入 IoTDB 集群。  

#### 联网环境启动

##### 启动命令

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

##### 详细语法

```shell
  # 启动命令
  # Linux 和 MacOS 系统
  bash sbin/start-ainode.sh  -i <bin_path>  -r  -n

  # Windows 系统
  sbin\start-ainode.bat  -i <bin_path>  -r  -n
  ```

##### 参数介绍：

| **名称**                | **标签** | **描述**                                                         | **是否必填** | **类型**   | **默认值**           | **输入方式**               |
| ------------------- | ---- | ------------------------------------------------------------ | -------- | ------ | ---------------- | ---------------------- |
| ain_interpreter_dir | -i   | AINode 所安装在的虚拟环境的解释器路径，需要使用绝对路径      | 否       | String | 默认读取环境变量 | 调用时输入或持久化修改 |
| ain_force_reinstall | -r   | 该脚本在检查 AINode 安装情况的时候是否检查版本，如果检查则在版本不对的情况下会强制安装 lib 里的 whl 安装包 | 否       | Bool   | false            | 调用时输入             |
| ain_no_dependencies | -n   | 指定在安装 AINode 的时候是否安装依赖，如果指定则仅安装 AINode 主程序而不安装依赖。 | 否       | Bool   | false            | 调用时输入             |
 
 如不想每次启动时指定对应参数，也可以在 `conf` 文件夹下的`ainode-env.sh` 和 `ainode-env.bat` 脚本中持久化修改参数（目前支持持久化修改 ain_interpreter_dir 参数）。
 
 `ainode-env.sh` : 
 ```shell
  # The defaulte venv environment is used if ain_interpreter_dir is not set. Please use absolute path without quotation mark
  # ain_interpreter_dir=
  ```
  `ainode-env.bat` : 
```shell
  @REM The defaulte venv environment is used if ain_interpreter_dir is not set. Please use absolute path without quotation mark
  @REM set ain_interpreter_dir=
  ```
  在写入参数值的后解除对应行的注释并保存即可在下一次执行脚本时生效。

#### 示例  

##### 直接启动：
 
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

##### 更新启动：
如果 AINode 的版本进行了更新（如更新了 `lib` 文件夹），可使用此命令。首先要保证 AINode 已经停止运行，然后通过 `-r` 参数重启，该参数会根据 `lib` 下的文件重新安装 AINode。

```shell
  # 更新启动命令
  # Linux 和 MacOS 系统
  bash sbin/start-ainode.sh -r
  # Windows 系统
  sbin\start-ainode.bat -r


  # 后台更新启动命令（长期运行推荐）
  # Linux 和 MacOS 系统
  nohup bash sbin/start-ainode.sh -r > myout.file 2>& 1 &
  # Windows 系统
  nohup bash sbin\start-ainode.bat -r > myout.file 2>& 1 &
  ```
#### 非联网环境启动 

##### 启动命令

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

##### 详细语法

```shell
  # 启动命令
  # Linux 和 MacOS 系统
  bash sbin/start-ainode.sh  -i <bin_path>  -r  -n

  # Windows 系统
  sbin\start-ainode.bat  -i <bin_path>  -r  -n
  ```

##### 参数介绍：

| **名称**                | **标签** | **描述**                                                         | **是否必填** | **类型**   | **默认值**           | **输入方式**               |
| ------------------- | ---- | ------------------------------------------------------------ | -------- | ------ | ---------------- | ---------------------- |
| ain_interpreter_dir | -i   | AINode 所安装在的虚拟环境的解释器路径，需要使用绝对路径      | 否       | String | 默认读取环境变量 | 调用时输入或持久化修改 |
| ain_force_reinstall | -r   | 该脚本在检查 AINode 安装情况的时候是否检查版本，如果检查则在版本不对的情况下会强制安装 lib 里的 whl 安装包 | 否       | Bool   | false            | 调用时输入               |

> 注意：非联网环境下安装失败时，首先检查是否选择了平台对应的安装包，其次确认python版本为3.8（由于下载的安装包限制了python版本，3.7、3.9等其他都不行）

#### 示例  

##### 直接启动：
 
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

### 3.4 检测 AINode 节点状态 

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

### 3.5 停止 AINode

如果需要停止正在运行的 AINode 节点，则执行相应的关闭脚本。

#### 停止命令

```shell
  # Linux / MacOS 
  bash sbin/stop-ainode.sh

  #Windows
  sbin\stop-ainode.bat  
  ```

##### 详细语法

```shell
  # Linux / MacOS 
  bash sbin/stop-ainode.sh  -t<AINode-id>

  #Windows
  sbin\stop-ainode.bat  -t<AINode-id>
  ```

##### 参数介绍：
 
 | **名称**              | **标签** | **描述**                                                         | **是否必填** | **类型**   | **默认值** | **输入方式**   |
| ----------------- | ---- | ------------------------------------------------------------ | -------- | ------ | ------ | ---------- |
| ain_remove_target | -t   | AINode 关闭时可以指定待移除的目标 AINode 的 Node ID、地址和端口号，格式为`<AINode-id>` | 否       | String | 无     | 调用时输入 |

#### 示例
```shell
  # Linux / MacOS 
  bash sbin/stop-ainode.sh

  # Windows
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

### 3.6 移除 AINode

当需要把一个 AINode 节点移出集群时，可以执行移除脚本。移除和停止脚本的差别是：停止是在集群中保留 AINode 节点但停止 AINode 服务，移除则是把 AINode 节点从集群中移除出去。


 #### 移除命令

```shell
  # Linux / MacOS 
  bash sbin/remove-ainode.sh  

  # Windows
  sbin\remove-ainode.bat  
  ```

##### 详细语法

```shell
  # Linux / MacOS 
  bash sbin/remove-ainode.sh  -i<bin_path>  -t<AINode-id>  -r  -n

  # Windows
  sbin\remove-ainode.bat  -i<bin_path>  -t<AINode-id>  -r  -n
  ```

##### 参数介绍：
 
 | **名称**                | **标签** | **描述**                                                         | **是否必填** | **类型**   | **默认值**           | **输入方式**              |
| ------------------- | ---- | ------------------------------------------------------------ | -------- | ------ | ---------------- | --------------------- |
| ain_interpreter_dir | -i   | AINode 所安装在的虚拟环境的解释器路径，需要使用绝对路径      | 否       | String | 默认读取环境变量 | 调用时输入+持久化修改 |
| ain_remove_target   | -t   | AINode 关闭时可以指定待移除的目标 AINode 的 Node ID、地址和端口号，格式为`<AINode-id>` | 否       | String | 无               | 调用时输入            |
| ain_force_reinstall | -r   | 该脚本在检查 AINode 安装情况的时候是否检查版本，如果检查则在版本不对的情况下会强制安装 lib 里的 whl 安装包 | 否       | Bool   | false            | 调用时输入            |
| ain_no_dependencies | -n   | 指定在安装 AINode 的时候是否安装依赖，如果指定则仅安装 AINode 主程序而不安装依赖。 | 否       | Bool   | false            | 调用时输入            |

 如不想每次启动时指定对应参数，也可以在 `conf` 文件夹下的`ainode-env.sh` 和 `ainode-env.bat` 脚本中持久化修改参数（目前支持持久化修改 ain_interpreter_dir 参数）。
 
 `ainode-env.sh` : 
 ```shell
  # The defaulte venv environment is used if ain_interpreter_dir is not set. Please use absolute path without quotation mark
  # ain_interpreter_dir=
  ```
  `ainode-env.bat` : 
```shell
  @REM The defaulte venv environment is used if ain_interpreter_dir is not set. Please use absolute path without quotation mark
  @REM set ain_interpreter_dir=
  ```
  在写入参数值的后解除对应行的注释并保存即可在下一次执行脚本时生效。

#### 示例  

##### 直接移除：
 
  ```shell
  # Linux / MacOS 
  bash sbin/remove-ainode.sh

  # Windows
  sbin\remove-ainode.bat
  ```
 移除节点后，将无法查询到节点的相关信息。

 ```shell
IoTDB> show cluster
+------+----------+-------+---------------+------------+-------+-----------+
|NodeID|  NodeType| Status|InternalAddress|InternalPort|Version|  BuildInfo|
+------+----------+-------+---------------+------------+-------+-----------+
|     0|ConfigNode|Running|      127.0.0.1|       10710|UNKNOWN|190e303-dev|
|     1|  DataNode|Running|      127.0.0.1|       10730|UNKNOWN|190e303-dev|
+------+----------+-------+---------------+------------+-------+-----------+
```
##### 指定移除：

如果用户丢失了 data 文件夹下的文件，可能 AINode 本地无法主动移除自己，需要用户指定节点号、地址和端口号进行移除，此时我们支持用户按照以下方法输入参数进行删除。

  ```shell
  # Linux / MacOS 
  bash sbin/remove-ainode.sh -t <AINode-id>/<ip>:<rpc-port>

  # Windows
  sbin\remove-ainode.bat -t <AINode-id>/<ip>:<rpc-port>
  ```

## 4 常见问题

### 4.1 启动AINode时出现找不到venv模块的报错

 当使用默认方式启动 AINode 时，会在安装包目录下创建一个 python 虚拟环境并安装依赖，因此要求安装 venv 模块。通常来说 python3.8 及以上的版本会自带 venv，但对于一些系统自带的 python 环境可能并不满足这一要求。出现该报错时有两种解决方案（二选一）：

 在本地安装 venv 模块，以 ubuntu 为例，可以通过运行以下命令来安装 python 自带的 venv 模块。或者从 python 官网安装一个自带 venv 的 python 版本。

 ```shell
apt-get install python3.8-venv 
```
 安装 3.8.0 版本的 venv 到 AINode 里面 在 AINode 路径下

 ```shell
../Python-3.8.0/python -m venv venv(文件夹名）
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
.wget https://www.python.org/ftp/python/3.8.0/Python-3.8.0.tar.xz
tar Jxf Python-3.8.0.tar.xz 
```
 编译安装对应的 python 包:
 ```shell
cd Python-3.8.0
./configure prefix=/usr/local/python3
make
sudo make install
python3 --version
```