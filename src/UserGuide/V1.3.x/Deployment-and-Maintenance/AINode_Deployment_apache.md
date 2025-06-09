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
# AINode Deployment

## AINode Introduction

### Capability Introduction

 AINode is the third type of endogenous node provided by IoTDB after the Configurable Node and DataNode. This node extends its ability to perform machine learning analysis on time series by interacting with the DataNode and Configurable Node of the IoTDB cluster. It supports the introduction of existing machine learning models from external sources for registration and the use of registered models to complete time series analysis tasks on specified time series data through simple SQL statements. The creation, management, and inference of models are integrated into the database engine. Currently, machine learning algorithms or self-developed models are available for common time series analysis scenarios, such as prediction and anomaly detection.

### Delivery Method
 It is an additional package outside the IoTDB cluster, with independent installation.

### Deployment mode
<div >
    <img src="/img/AINodeDeployment1.png" alt="" style="width: 45%;"/>
    <img src="/img/AINodeDeployment2.png" alt="" style="width: 45%;"/>
</div>

##  Installation preparation

### Get installation package

 Users can download the software installation package for AINode, download and unzip it to complete the installation of AINode.

 Unzip and install the package
 `(apache-iotdb-<version>-ainode-bin.zip)`， The directory structure after unpacking the installation package is as follows:
| **Catalogue**     | **Type** | **Explain**                                         |
| ------------ | -------- | ------------------------------------------------ |
| lib          | folder   | AINode compiled binary executable files and related code dependencies |
| sbin         | folder   | The running script of AINode can start, remove, and stop AINode     |
| conf         | folder   | Contains configuration items for AINode, specifically including the following configuration items           |
| LICENSE      | file     | Certificate                                             |
| NOTICE       | file     | Tips                                             |
| README_ZH.md | file     | Explanation of the Chinese version of the markdown format                         |
| `README.md`    | file     | Instructions                                         |

### Environment preparation  
- Suggested operating environment：Ubuntu, CentOS, MacOS  

- Runtime Environment   
  - Python>=3.8 and Python <= 3.14 is sufficient in a networked environment, and comes with pip and venv tools; Python 3.8 version is required for non networked environments, and download the zip package for the corresponding operating system from [here](https://cloud.tsinghua.edu.cn/d/4c1342f6c272439aa96c/?p=%2Flibs&mode=list) (Note that when downloading dependencies, you need to select the zip file in the libs folder, as shown in the following figure). Copy all files in the folder to the `lib` folder in the `apache-iotdb-<version>-ainode-bin` folder, and follow the steps below to start AINode.

     <img src="/img/AINode%E9%83%A8%E7%BD%B2%E7%8E%AF%E5%A2%83.png" alt="" style="width: 80%;"/>

  - There must be a Python interpreter in the environment variables that can be directly called through the `python` instruction.
  - It is recommended to create a Python interpreter venv virtual environment in the `apache-iotdb-<version>-ainode-bin` folder. If installing version 3.8.0 virtual environment, the statement is as follows:
    ```shell
      # Install version 3.8.0 of Venv , Create a virtual environment with the folder name `venv`.
      ../Python-3.8.0/python -m venv `venv`
    ```

## Installation steps

### Install AINode


  1. Check the kernel architecture of Linux
```shell
  uname -m
  ```

  2. Import Python environment [Download](https://repo.anaconda.com/miniconda/)
  
  Recommend downloading the py311 version application and importing it into the iotdb dedicated folder in the user's root directory

  3. Verify Python version

```shell
  python --version
  ```
4. Create a virtual environment (execute in the ainode directory)

  ```shell
   python -m venv venv
   ```

5. Activate the virtual environment

  ```shell
   source venv/bin/activate
   ```


6. Download and import AINode to a dedicated folder, switch to the dedicated folder and extract the installation package

```shell
  unzip apache-iotdb-1.3.3-ainode-bin.zip
  ```

 7. Configuration item modification

```shell
  vi apache-iotdb-1.3.3-ainode-bin/conf/iotdb-ainode.properties
  ```
  Configuration item modification：[detailed information](#configuration-item-modification)

> ain_seed_config_node=iotdb-1:10710 (Cluster communication node IP: communication node port)<br>
> ain_inference_rpc_address=iotdb-3 (IP address of the server running AINode)

8. Replace Python source

```shell
  pip config set global.index-url https://mirrors.aliyun.com/pypi/simple/
  ```

9. Start the AINode node

```shell
  nohup bash apache-iotdb-1.3.3-ainode-bin/sbin/start-ainode.sh  > myout.file 2>& 1 &
  ```
> Return to the default environment of the system: conda deactivate

 ### Configuration item modification

AINode supports modifying some necessary parameters. You can find the following parameters in the `conf/iotdb-ainode.properties` file and make persistent modifications to them:
：

| **Name**                           | **Describe**                                                         | **Type**    | **Default value**             | **Effective method after modification**                 |
| :----------------------------- | ------------------------------------------------------------ | ------- | ------------------ | ---------------------------- |
| cluster_name                   | The identifier for AINode to join the cluster                                      | string  | defaultCluster     | Only allow modifications before the first service startup |
| ain_seed_config_node           | The Configurable Node address registered during AINode startup                          | String  | 127.0.0.1:10710     | Only allow modifications before the first service startup |
| ain_inference_rpc_address      | AINode provides service and communication addresses , Internal Service Communication Interface        | String  | 127.0.0.1          | Only allow modifications before the first service startup                   |
| ain_inference_rpc_port         | AINode provides ports for services and communication                                  | String  | 10810              | Only allow modifications before the first service startup                   |
| ain_system_dir                 | AINode metadata storage path, the starting directory of the relative path is related to the operating system, and it is recommended to use an absolute path | String  | data/AINode/system | Only allow modifications before the first service startup                   |
| ain_models_dir                 | AINode stores the path of the model file, and the starting directory of the relative path is related to the operating system. It is recommended to use an absolute path | String  | data/AINode/models | Only allow modifications before the first service startup                   |
| ain_logs_dir                   | The path where AINode stores logs, the starting directory of the relative path is related to the operating system, and it is recommended to use an absolute path | String  | logs/AINode        | Effective after restart                   |
| ain_thrift_compression_enabled | Does AINode enable Thrift's compression mechanism , 0-Do not start, 1-Start          | Boolean | 0                  | Effective after restart                   |

### Start AINode

 After completing the deployment of Seed Config Node, the registration and inference functions of the model can be supported by adding AINode nodes. After specifying the information of the IoTDB cluster in the configuration file, the corresponding instruction can be executed to start AINode and join the IoTDB cluster。  

#### Networking environment startup

##### Start command

```shell
  # Start command
  # Linux and MacOS systems
  bash sbin/start-ainode.sh 

  # Windows systems
  sbin\start-ainode.bat  

  # Backend startup command (recommended for long-term running)
  # Linux and MacOS systems
  nohup bash sbin/start-ainode.sh  > myout.file 2>& 1 &

  # Windows systems
  nohup bash sbin\start-ainode.bat  > myout.file 2>& 1 &
  ```

#### Detailed Syntax

```shell
  # Start command
  # Linux and MacOS systems
  bash sbin/start-ainode.sh  -i <bin_path>  -r  -n

  # Windows systems
  sbin\start-ainode.bat  -i <bin_path>  -r  -n
  ```

##### Parameter introduction:

| **Name**                | **Label** | **Describe**                                                         | **Is it mandatory** | **Type**   | **Default value**           | **Input method**               |
| ------------------- | ---- | ------------------------------------------------------------ | -------- | ------ | ---------------- | ---------------------- |
| ain_interpreter_dir | -i   |  The interpreter path of the virtual environment where AINode is installed requires the use of an absolute path.      | no       | String | Default reading of environment variables | Input or persist modifications during invocation |
| ain_force_reinstall | -r   | Does this script check the version when checking the installation status of AINode. If it does, it will force the installation of the whl package in lib if the version is incorrect. | no       | Bool   | false            | Input when calling             |
| ain_no_dependencies | -n   | Specify whether to install dependencies when installing AINode, and if so, only install the AINode main program without installing dependencies. | no       | Bool   | false            | Input when calling             |
 
 If you don't want to specify the corresponding parameters every time you start, you can also persistently modify the parameters in the `ainode-env.sh` and `ainode-env.bat` scripts in the `conf` folder (currently supporting persistent modification of the ain_interpreter-dir parameter).
 
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
  After writing the parameter value, uncomment the corresponding line and save it to take effect on the next script execution.


#### Example  

##### Directly start:
 
```shell
  # Start command
  # Linux and MacOS systems
  bash sbin/start-ainode.sh
  # Windows systems
  sbin\start-ainode.bat 


  # Backend startup command (recommended for long-term running)
  # Linux and MacOS systems
  nohup bash sbin/start-ainode.sh  > myout.file 2>& 1 &
  # Windows systems
  nohup bash sbin\start-ainode.bat  > myout.file 2>& 1 &
  ```

##### Update Start:
If the version of AINode has been updated (such as updating the `lib` folder), this command can be used. Firstly, it is necessary to ensure that AINode has stopped running, and then restart it using the `-r` parameter, which will reinstall AINode based on the files under `lib`.


```shell
  # Update startup command
  # Linux and MacOS systems
  bash sbin/start-ainode.sh -r
  # Windows systems
  sbin\start-ainode.bat -r


  # Backend startup command (recommended for long-term running)
  # Linux and MacOS systems
  nohup bash sbin/start-ainode.sh -r > myout.file 2>& 1 &
  # Windows c
  nohup bash sbin\start-ainode.bat -r > myout.file 2>& 1 &
  ```
#### Non networked environment startup 

##### Start command

```shell
  # Start command
  # Linux and MacOS systems
  bash sbin/start-ainode.sh  

  # Windows systems
  sbin\start-ainode.bat  

  # Backend startup command (recommended for long-term running)
  # Linux and MacOS systems
  nohup bash sbin/start-ainode.sh  > myout.file 2>& 1 &

  # Windows systems
  nohup bash sbin\start-ainode.bat  > myout.file 2>& 1 &
  ``` 

#### Detailed Syntax

```shell
  # Start command
  # Linux and MacOS systems
  bash sbin/start-ainode.sh  -i <bin_path>  -r  -n

  # Windows systems
  sbin\start-ainode.bat  -i <bin_path>  -r  -n
  ```

##### Parameter introduction:

| **Name**                | **Label** | **Describe**                                                         | **Is it mandatory** | **Type**   | **Default value**           | **Input method**               |
| ------------------- | ---- | ------------------------------------------------------------ | -------- | ------ | ---------------- | ---------------------- |
| ain_interpreter_dir | -i   | The interpreter path of the virtual environment where AINode is installed requires the use of an absolute path      | no       | String | Default reading of environment variables | Input or persist modifications during invocation |
| ain_force_reinstall | -r   | Does this script check the version when checking the installation status of AINode. If it does, it will force the installation of the whl package in lib if the version is incorrect | no       | Bool   | false            | Input when calling               |

> Attention: When installation fails in a non networked environment, first check if the installation package corresponding to the platform is selected, and then confirm that the Python version is 3.8 (due to the limitations of the downloaded installation package on Python versions, 3.7, 3.9, and others are not allowed)

#### Example  

##### Directly start:
 
```shell
  # Start command
  # Linux and MacOS systems
  bash sbin/start-ainode.sh
  # Windows systems
  sbin\start-ainode.bat 

  # Backend startup command (recommended for long-term running)
  # Linux and MacOS systems
  nohup bash sbin/start-ainode.sh  > myout.file 2>& 1 &
  # Windows systems
  nohup bash sbin\start-ainode.bat  > myout.file 2>& 1 &
  ```

### Detecting the status of AINode nodes 

During the startup process of AINode, the new AINode will be automatically added to the IoTDB cluster. After starting AINode, you can enter SQL in the command line to query. If you see an AINode node in the cluster and its running status is Running (as shown below), it indicates successful joining.


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

### Stop AINode

If you need to stop a running AINode node, execute the corresponding shutdown script.

#### Stop command

```shell
  # Linux / MacOS 
  bash sbin/stop-ainode.sh  

  #Windows
  sbin\stop-ainode.bat 
  ```


#### Detailed Syntax

```shell
  # Linux / MacOS 
  bash sbin/stop-ainode.sh  -t<AINode-id>

  #Windows
  sbin\stop-ainode.bat  -t<AINode-id>
  ```

##### Parameter introduction:
 
| **Name**                | **Label** | **Describe**                                                         | **Is it mandatory** | **Type**   | **Default value**           | **Input method**   |
| ----------------- | ---- | ------------------------------------------------------------ | -------- | ------ | ------ | ---------- |
| ain_remove_target | -t   | When closing AINode, you can specify the Node ID, address, and port number of the target AINode to be removed, in the format of `<AINode id>` | no       | String | nothing     | Input when calling |

#### Example

```shell
  # Linux / MacOS 
  bash sbin/stop-ainode.sh

  # Windows
  sbin\stop-ainode.bat
  ```
After stopping AINode, you can still see AINode nodes in the cluster, whose running status is UNKNOWN (as shown below), and the AINode function cannot be used at this time.

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
If you need to restart the node, you need to execute the startup script again.

### Remove AINode

When it is necessary to remove an AINode node from the cluster, a removal script can be executed. The difference between removing and stopping scripts is that stopping retains the AINode node in the cluster but stops the AINode service, while removing removes the AINode node from the cluster.

#### Remove command


```shell
  # Linux / MacOS 
  bash sbin/remove-ainode.sh  

  # Windows
  sbin\remove-ainode.bat  
  ```

#### Detailed Syntax

```shell
  # Linux / MacOS 
  bash sbin/remove-ainode.sh  -i<bin_path>  -t<AINode-id>/<ip>:<rpc-port>  -r  -n

  # Windows
  sbin\remove-ainode.bat  -i<bin_path>  -t<AINode-id>/<ip>:<rpc-port>  -r  -n
  ```

##### Parameter introduction:
 
 | **Name**                | **Label** | **Describe**                                                         | **Is it mandatory** | **Type**   | **Default value**           | **Input method**              |
| ------------------- | ---- | ------------------------------------------------------------ | -------- | ------ | ---------------- | --------------------- |
| ain_interpreter_dir | -i   | The interpreter path of the virtual environment where AINode is installed requires the use of an absolute path      | no       | String | Default reading of environment variables | Input+persistent modification during invocation |
| ain_remove_target   | -t   | When closing AINode, you can specify the Node ID, address, and port number of the target AINode to be removed, in the format of `<AINode id>` | no       | String | nothing               | Input when calling            |
| ain_force_reinstall | -r   | Does this script check the version when checking the installation status of AINode. If it does, it will force the installation of the whl package in lib if the version is incorrect | no       | Bool   | false            | Input when calling            |
| ain_no_dependencies | -n   | Specify whether to install dependencies when installing AINode, and if so, only install the AINode main program without installing dependencies | no       | Bool   | false            | Input when calling            |

 If you don't want to specify the corresponding parameters every time you start, you can also persistently modify the parameters in the `ainode-env.sh` and `ainode-env.bat` scripts in the `conf` folder (currently supporting persistent modification of the ain_interpreter-dir parameter).
 
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
  After writing the parameter value, uncomment the corresponding line and save it to take effect on the next script execution.

#### Example  

##### Directly remove:
 
  ```shell
  # Linux / MacOS 
  bash sbin/remove-ainode.sh

  # Windows
  sbin\remove-ainode.bat
  ```
 After removing the node, relevant information about the node cannot be queried.

 ```shell
IoTDB> show cluster
+------+----------+-------+---------------+------------+-------+-----------+
|NodeID|  NodeType| Status|InternalAddress|InternalPort|Version|  BuildInfo|
+------+----------+-------+---------------+------------+-------+-----------+
|     0|ConfigNode|Running|      127.0.0.1|       10710|UNKNOWN|190e303-dev|
|     1|  DataNode|Running|      127.0.0.1|       10730|UNKNOWN|190e303-dev|
+------+----------+-------+---------------+------------+-------+-----------+
```
##### Specify removal:

If the user loses files in the data folder, AINode may not be able to actively remove them locally. The user needs to specify the node number, address, and port number for removal. In this case, we support users to input parameters according to the following methods for deletion.

  ```shell
  # Linux / MacOS 
  bash sbin/remove-ainode.sh -t <AINode-id>/<ip>:<rpc-port>

  # Windows
  sbin\remove-ainode.bat -t <AINode-id>/<ip>:<rpc-port>
  ```

## common problem

### An error occurs when starting AINode stating that the venv module cannot be found

 When starting AINode using the default method, a Python virtual environment will be created in the installation package directory and dependencies will be installed, so it is required to install the venv module. Generally speaking, Python 3.8 and above versions come with built-in VenV, but for some systems with built-in Python environments, this requirement may not be met. There are two solutions when this error occurs (choose one or the other):

 To install the Venv module locally, taking Ubuntu as an example, you can run the following command to install the built-in Venv module in Python. Or install a Python version with built-in Venv from the Python official website.

 ```shell
apt-get install python3.8-venv 
```
Install version 3.8.0 of venv into AINode in the AINode path.

 ```shell
../Python-3.8.0/python -m venv venv(Folder Name）
```
 When running the startup script, use ` -i ` to specify an existing Python interpreter path as the running environment for AINode, eliminating the need to create a new virtual environment.

 ### The SSL module in Python is not properly installed and configured to handle HTTPS resources
WARNING: pip is configured with locations that require TLS/SSL, however the ssl module in Python is not available.      
You can install OpenSSLS and then rebuild Python to solve this problem
> Currently Python versions 3.6 to 3.9 are compatible with OpenSSL 1.0.2, 1.1.0, and 1.1.1.

 Python requires OpenSSL to be installed on our system, the specific installation method can be found in [link](https://stackoverflow.com/questions/56552390/how-to-fix-ssl-module-in-python-is-not-available-in-centos)

 ```shell
sudo apt-get install build-essential libssl-dev zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm libncurses5-dev libncursesw5-dev xz-utils tk-dev libffi-dev liblzma-dev uuid-dev lzma-dev liblzma-dev
sudo -E ./configure --with-ssl
make
sudo make install
```

 ### Pip version is lower

 A compilation issue similar to "error: Microsoft Visual C++14.0 or greater is required..." appears on Windows

The corresponding error occurs during installation and compilation, usually due to insufficient C++version or Setup tools version. You can check it in

 ```shell
./python -m pip install --upgrade pip
./python -m pip install --upgrade setuptools
```


 ### Install and compile Python

 Use the following instructions to download the installation package from the official website and extract it:
  ```shell
.wget https://www.python.org/ftp/python/3.8.0/Python-3.8.0.tar.xz
tar Jxf Python-3.8.0.tar.xz 
```
 Compile and install the corresponding Python package:
 ```shell
cd Python-3.8.0
./configure prefix=/usr/local/python3
make
sudo make install
python3 --version
```