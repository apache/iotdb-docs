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

##  1 AINode介绍

### 1.1 能力介绍

 1）AINode通过大规模、高质量、多领域的时序数据集训练，具备了强大的时序数据知识库和理解能力。

 2）AINode不依赖于特定测点的机理或算法分析经验，而是可以广泛适用于各种时序数据。
    
 3）AINode允许用户将已经训练完成的模型集成到平台中。这些模型可以是针对特定数据集训练得到的，用户需要将它们注册到AINode系统中。
    
 4）目前AINode的模型不具备自我更新的能力。模型的迭代和优化需要用户根据新的数据或业务需求手动进行。
    
 5）模型被集成，AINode就可以使用这些模型对新的输入数据进行推理，并据此预测未来的数据。
    
 6）通过 SQL 语句即可完成模型的注册、管理和推理，使得 AINode 易于与现有的数据库和数据流集成，无需复杂的编程技能。
    
 7）AINode 支持直接在 IoTDB 中进行数据推理，无需数据迁移，提高了数据处理的速度，还增强了数据的安全性。

### 1.2 交付方式
 独立安装包，独立激活，是iotdb集群外的额外套件

### 1.3 部署模式
<div align="center">
    <img src="https://alioss.timecho.com/docs/img/AINode%E9%83%A8%E7%BD%B21.PNG" alt="" style="width: 60%;"/>
</div>
<div align="center">
    <img src="https://alioss.timecho.com/docs/img/AINode%E9%83%A8%E7%BD%B22.PNG" alt="" style="width: 60%;"/>
</div>

##  2 安装准备

### 2.1 安装包获取

 用户可以下载AINode的软件安装包，下载并解压后即完成AINode的安装。

 解压后安装包（iotdb-enterprise-ainode-<version>.zip），安装包解压后目录结构如下：
| **目录**     | **类型** | **说明**                                         |
| ------------ | -------- | ------------------------------------------------ |
| lib          | 文件夹   | AINode编译后的二进制可执行文件以及相关的代码依赖 |
| sbin         | 文件夹   | AINode的运行脚本，可以启动，移除和停止AINode     |
| conf         | 文件夹   | 包含AINode的配置项，具体包含以下配置项           |
| LICENSE      | 文件     | 证书                                             |
| NOTICE       | 文件     | 提示                                             |
| README_ZH.md | 文件     | markdown格式的中文版说明                         |
| README.md    | 文件     | 使用说明                                         |

###  2.2 环境准备  
 建议操作环境   
- Ubuntu, CentOS, MacOS  

 运行环境   
- AINode目前要求系统3.8以上的Python，且带有pip和venv工具。
- 如果是联网的情况，AINode会创建虚拟环境并自动下载运行时的依赖包，不需要额外配置。   
- 如果是非联网的环境，可以从 https://cloud.tsinghua.edu.cn/d/4c1342f6c272439aa96c/ 中获取安装所需要的依赖包并离线安装。

## 3 安装步骤

### 3.1 配置项修改

 AINode支持修改一些必要的参数。可以在`conf/iotdb-ainode.properties`文件中找到下列参数并进行持久化的修改：

| **名称**                      | **描述**                                                         | **类型**   | **默认值**             | **改后生效方式**                 |
| ------------------------- | ------------------------------------------------------------ | ------ | ------------------ | ---------------------------- |
| ain_seed_config_node      | AINode启动时注册的ConfigNode地址                             | String | 10710              | 仅允许在第一次启动服务前修改 |
| ain_inference_rpc_address | AINode提供服务与通信的地址                                   | String | 127.0.0.1          | 重启后生效                   |
| ain_inference_rpc_port    | AINode提供服务与通信的端口                                   | String | 10810              | 重启后生效                   |
| ain_system_dir            | AINode元数据存储路径，相对路径的起始目录与操作系统相关，建议使用绝对路径。 | String | data/AINode/system | 重启后生效                   |
| ain_models_dir            | AINode存储模型文件的路径，相对路径的起始目录与操作系统相关，建议使用绝对路径。 | String | data/AINode/models | 重启后生效                   |
| ain_logs_dir              | AINode存储日志的路径，相对路径的起始目录与操作系统相关，建议使用绝对路径。 | String | logs/AINode        | 重启后生效                   |

### 3.2 启动AINode

 在完成Seed-ConfigNode的部署后，可以通过添加AINode节点来支持模型的注册和推理功能。在配置项中指定IoTDB集群的信息后，可以执行相应的指令来启动AINode，加入IoTDB集群。  

 注意：启动AINode需要系统环境中含有3.8及以上的Python解释器作为默认解释器，用户在使用前请检查环境变量中是否存在Python解释器且可以通过`python`指令直接调用。

#### 3.2.1 直接启动   

 在获得安装包的文件后，用户可以直接进行AINode的初次启动。  
 在Linux和MacOS上的基本启动指令如下：
```Shell
> bash sbin/start-ainode.sh
```
 长期运行推荐后台启动，启动命令参考如下：
```Shell
> nohup bash sbin/start-ainode.sh  > myout.file 2>& 1 &
```
 在windows上的启动指令如下：
```Shell
> sbin\start-ainode.bat
```
 长期运行推荐后台启动，启动命令参考如下：
```Shell
> nohup bash sbin/start-ainode.bat  > myout.file 2>& 1 &
```
 如果首次启动AINode且没有指定解释器路径，那么脚本将在程序根目录使用系统Python解释器新建venv虚拟环境，并在这个环境中自动先后安装AINode的第三方依赖和AINode主程序。**这个过程将产生大小约为1GB的虚拟环境，请预留好安装的空间**。在后续启动时，如果未指定解释器路径，脚本将自动寻找上面新建的venv环境并启动AINode，无需重复安装程序和依赖。   

 注意，如果希望在某次启动时强制重新安装AINode本体，可以通过-r激活reinstall，该参数会根据lib下的文件重新安装AINode。

 Linux和MacOS：
```Shell
> bash sbin/start-ainode.sh -r
```
 Windows：
```Shell
> sbin\start-ainode.bat -r
```

 例如，用户在lib中更换了更新版本的AINode安装包，但该安装包并不会安装到用户的常用环境中。此时用户即需要在启动时添加-r选项来指示脚本强制重新安装虚拟环境中的AINode主程序，实现版本的更新。

#### 3.2.2 指定自定义虚拟环境   

 在启动AINode时，可以通过指定一个虚拟环境解释器路径来将AINode主程序及其依赖安装到特定的位置。具体需要指定参数ain_interpreter_dir的值。

 Linux和MacOS：
```Shell
> bash sbin/start-ainode.sh -i xxx/bin/python
```

 Windows：
```Shell
> sbin\start-ainode.bat -i xxx\Scripts\python.exe
```

在指定Python解释器的时候请输入虚拟环境中Python解释器的可执行文件的地址。目前AINode支持venv、conda等虚拟环境，不支持输入系统Python解释器作为安装位置。为了保证脚本能够正常识别，请尽可能使用绝对路径。

#### 3.2.3 加入集群 

 AINode启动过程中会自动将新的AINode加入IoTDB集群。启动AINode后可以通过在IoTDB的cli命令行中输入集群查询的SQL来验证节点是否加入成功。

```Shell
IoTDB> show cluster
+------+----------+-------+---------------+------------+-------+-----------+
|NodeID|  NodeType| Status|InternalAddress|InternalPort|Version|  BuildInfo|
+------+----------+-------+---------------+------------+-------+-----------+
|     0|ConfigNode|Running|      127.0.0.1|       10710|UNKNOWN|190e303-dev|
|     1|  DataNode|Running|      127.0.0.1|       10730|UNKNOWN|190e303-dev|
|     2|    AINode|Running|      127.0.0.1|       10810|UNKNOWN|190e303-dev|
+------+----------+-------+---------------+------------+-------+-----------+

IoTDB> show cluster details
+------+----------+-------+---------------+------------+-------------------+----------+-------+-------+-------------------+-----------------+-------+-----------+
|NodeID|  NodeType| Status|InternalAddress|InternalPort|ConfigConsensusPort|RpcAddress|RpcPort|MppPort|SchemaConsensusPort|DataConsensusPort|Version|  BuildInfo|
+------+----------+-------+---------------+------------+-------------------+----------+-------+-------+-------------------+-----------------+-------+-----------+
|     0|ConfigNode|Running|      127.0.0.1|       10710|              10720|          |       |       |                   |                 |UNKNOWN|190e303-dev|
|     1|  DataNode|Running|      127.0.0.1|       10730|                   |   0.0.0.0|   6667|  10740|              10750|            10760|UNKNOWN|190e303-dev|
|     2|    AINode|Running|      127.0.0.1|       10810|                   |   0.0.0.0|  10810|       |                   |                 |UNKNOWN|190e303-dev|
+------+----------+-------+---------------+------------+-------------------+----------+-------+-------+-------------------+-----------------+-------+-----------+

IoTDB> show AINodes
+------+-------+----------+-------+
|NodeID| Status|RpcAddress|RpcPort|
+------+-------+----------+-------+
|     2|Running| 127.0.0.1|  10810|
+------+-------+----------+-------+
```

#### 3.2.4 脚本参数详情

 AINode启动过程中支持两种参数，其具体的作用如下图所示：

| **名称**                | **作用脚本**         | **标签** | **描述**                                                         | **类型**   | **默认值**           | **输入方式**              |
| ------------------- | ---------------- | ---- | ------------------------------------------------------------ | ------ | ---------------- | --------------------- |
| ain_interpreter_dir | start remove env | -i   | AINode所安装在的虚拟环境的解释器路径，需要使用绝对路径       | String | 默认读取环境变量 | 调用时输入+持久化修改 |
| ain_remove_target   | remove stop      | -t   | AINode关闭时可以指定待移除的目标AINode的Node ID、地址和端口号，格式为`<AINode-id>/<ip>:<rpc-port>` | String | 无               | 调用时输入            |
| ain_force_reinstall | start remove env | -r   | 该脚本在检查AINode安装情况的时候是否检查版本，如果检查则在版本不对的情况下会强制安装lib里的whl安装包 | Bool   | false            | 调用时输入            |
| ain_no_dependencies | start remove env | -n   | 指定在安装AINode的时候是否安装依赖，如果指定则仅安装AINode主程序而不安装依赖。 | Bool   | false            | 调用时输入            |

 除了按照上文所述的方法在执行脚本时传入上述参数外，也可以在`conf`文件夹下的`AINode-env.sh`和`AINode-env.bat`脚本中持久化地修改部分参数。

  `AINode-env.sh`：

```Bash
# The defaulte venv environment is used if ain_interpreter_dir is not set. Please use absolute path without quotation mark
# ain_interpreter_dir=
```

  `AINode-env.bat`：

```Plain
@REM The defaulte venv environment is used if ain_interpreter_dir is not set. Please use absolute path without quotation mark
@REM set ain_interpreter_dir=
```

在写入参数值的后解除对应行的注释并保存即可在下一次执行脚本时生效。

### 3.3 停止AINode

 如果需要停止正在运行的AINode节点，则执行相应的关闭脚本。

 在Linux和MacOS上的指令如下：
```Shell
> bash sbin/stop-ainode.sh
```
 在windows上的启动指令如下：
```Shell
> sbin\stop-ainode.bat
```
 此时无法获取节点的具体状态，也就无法使用对应的管理和推理功能。如果需要重新启动该节点，再次执行启动脚本即可。

 ```Shell
IoTDB> show cluster
+------+----------+-------+---------------+------------+-------+-----------+
|NodeID|  NodeType| Status|InternalAddress|InternalPort|Version|  BuildInfo|
+------+----------+-------+---------------+------------+-------+-----------+
|     0|ConfigNode|Running|      127.0.0.1|       10710|UNKNOWN|190e303-dev|
|     1|  DataNode|Running|      127.0.0.1|       10730|UNKNOWN|190e303-dev|
|     2|    AINode|UNKNOWN|      127.0.0.1|       10790|UNKNOWN|190e303-dev|
+------+----------+-------+---------------+------------+-------+-----------+
```

### 3.4 移除AINode

 当需要把一个已经连接的AINode移出集群时，可以执行对应的移除脚本。

 在Linux和MacOS上的指令如下：
```Shell
> bash sbin/remove-ainode.sh
```
 在windows上的启动指令如下：
```Shell
> sbin\remove-ainode.bat
```
 移除节点后，将无法查询到节点的相关信息。
 ```Shell
IoTDB> show cluster
+------+----------+-------+---------------+------------+-------+-----------+
|NodeID|  NodeType| Status|InternalAddress|InternalPort|Version|  BuildInfo|
+------+----------+-------+---------------+------------+-------+-----------+
|     0|ConfigNode|Running|      127.0.0.1|       10710|UNKNOWN|190e303-dev|
|     1|  DataNode|Running|      127.0.0.1|       10730|UNKNOWN|190e303-dev|
+------+----------+-------+---------------+------------+-------+-----------+
```
 另外，如果之前自定义了AINode安装的位置，那么在调用remove脚本的时候也需要附带相应的路径作为参数：
 
 Linux和MacOS：
```Shell
> bash sbin/remove-ainode.sh -i xxx/bin/python
```
 Windows：
 ```Shell
> sbin\remove-ainode.bat -i 1 xxx\Scripts\python.exe
```
 类似地，在env脚本中持久化修改的脚本参数同样会在执行移除的时候生效。
  
 如果用户丢失了data文件夹下的文件，可能AINode本地无法主动移除自己，需要用户指定节点号、地址和端口号进行移除，此时我们支持用户按照以下方法输入参数进行删除。
 
 Linux和MacOS：
```Shell
> bash sbin/remove-ainode.sh -t <AINode-id>/<ip>:<rpc-port>
```
 Windows：
 ```Shell
> sbin\remove-ainode.bat -t <AINode-id>/<ip>:<rpc-port>
```
## 4 常见问题

### 4.1 启动AINode时出现找不到venv模块的报错

 当使用默认方式启动AINode时，会在安装包目录下创建一个python虚拟环境并安装依赖，因此要求安装venv模块。通常来说python3.8及以上的版本会自带venv，但对于一些系统自带的python环境可能并不满足这一要求。出现该报错时有两种解决方案（二选一）：

 在本地安装venv模块，以ubuntu为例，可以通过运行以下命令来安装python自带的venv模块。或者从python官网安装一个自带venv的python版本。

 ```SQL
apt-get install python3.8-venv 
```
 安装3.8.0版本的venv 到ainode里面 在ainode路径下
 ```SQL
../Python-3.8.0/python -m venv venv(文件夹名）
```
 在运行启动脚本时通过-i指定已有的python解释器路径作为AINode的运行环境，这样就不再需要创建一个新的虚拟环境。

 ### 4.2 python中的SSL模块没有被正确安装和配置，无法处理HTTPS资源
WARNING: pip is configured with locations that require TLS/SSL, however the ssl module in Python is not available.      
可以安装OpenSSLS后，再重新构建python来解决这个问题
> Currently Python versions 3.6 to 3.9 are compatible with OpenSSL 1.0.2, 1.1.0, and 1.1.1.

 Python要求我们的系统上安装有OpenSSL，具体安装方法可见https://stackoverflow.com/questions/56552390/how-to-fix-ssl-module-in-python-is-not-available-in-centos

 ```SQL
sudo apt-get install build-essential libssl-dev zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm libncurses5-dev libncursesw5-dev xz-utils tk-dev libffi-dev liblzma-dev uuid-dev lzma-dev liblzma-dev
sudo -E ./configure --with-ssl
make
sudo make install
```

 ### 4.3 pip版本较低

 windows下出现类似“error：Microsoft Visual C++ 14.0 or greater is required...”的编译问题

 出现对应的报错，通常是c++版本或是setuptools版本不足，可以

 ```SQL
./python -m pip install --upgrade pip
./python -m pip install --upgrade setuptools
```


 ### 4.4 安装编译python

 使用以下指定从官网下载安装包并解压
  ```SQL
.wget https://www.python.org/ftp/python/3.8.0/Python-3.8.0.tar.xz
tar Jxf Python-3.8.0.tar.xz 
```
 编译安装对应的python包
 ```SQL
cd Python-3.8.0
./configure prefix=/usr/local/python3
make
sudo make install
python3 --version
```