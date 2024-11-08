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

## Installation environment

### Recommended Operating System

Ubuntu, CentOS, MacOS

### Runtime Environment

AINode currently requires Python 3.8 or higher with pip and venv tools.

For networked environments, AINode creates a virtual environment and downloads runtime dependencies automatically, no additional configuration is needed.

In case of a non-networked environment, you can download it from https://cloud.tsinghua.edu.cn/d/4c1342f6c272439aa96c/to get the required dependencies and install them offline.

## Installation steps

Users can download the AINode software installation package, download and unzip it to complete the installation of AINode. You can also download the source code from the code repository and compile it to get the installation package.

## Software directory structure

After downloading and extracting the software package, you can get the following directory structure

```Shell
|-- apache-iotdb-AINode-bin
    |-- lib # package binary executable with environment dependencies
    |-- conf # store configuration files
        - iotdb-AINode.properties
    |-- sbin # AINode related startup scripts
        - start-AINode.sh
        - start-AINode.bat
        - stop-AINode.sh
        - stop-AINode.bat
        - remove-AINode.sh
        - remove-AINode.bat
    |-- licenses
    - LICENSE
    - NOTICE
    - README.md
    - README_ZH.md
    - RELEASE_NOTES.md
```

- **lib:** AINode's compiled binary executable and related code dependencies.
- **conf:** contains AINode's configuration items, specifically the following configuration items
- **sbin:** AINode's runtime script, which can start, remove and stop AINode.

## Start AINode

After completing the deployment of Seed-ConfigNode, you can add an AINode node to support the model registration and inference functions. After specifying the information of IoTDB cluster in the configuration item, you can execute the corresponding commands to start AINode and join the IoTDB cluster.

Note: Starting AINode requires that the system environment contains a Python interpreter of 3.8 or above as the default interpreter, so users should check whether the Python interpreter exists in the environment variables and can be directly invoked through the `python` command before using it.

### Direct Start

After obtaining the installation package files, you can directly start AINode for the first time.

The startup commands on Linux and MacOS are as follows:

```Shell
> bash sbin/start-AINode.sh
```

The startup command on windows is as follows:

```Shell
> sbin\start-AINode.bat
```

If start AINode for the first time and do not specify the path to the interpreter, the script will create a new venv virtual environment in the root directory of the program using the system Python interpreter, and install the third-party dependencies of AINode and the main program of AINode in this environment automatically and successively. **This process will generate a virtual environment of about 1GB in size, so please reserve space for installation**. On subsequent startups, if the path to the interpreter is not specified, the script will automatically look for the newly created venv environment above and start AINode without having to install the program and dependencies repeatedly.

Note that it is possible to activate reinstall with -r if you wish to force a reinstall of AINode proper on a certain startup, this parameter will reinstall AINode based on the files under lib.

Linux和MacOS：

```Shell
> bash sbin/start-AINode.sh -r
```

Windows：

```Shell
> sbin\start-AINode.bat -r
```

For example, a user replaces a newer version of the AINode installer in the lib, but the installer is not installed in the user's usual environment. In this case, you need to add the -r option at startup to instruct the script to force a reinstallation of the main AINode program in the virtual environment to update the version.

### Specify a customized virtual environment

When starting AINode, you can specify a virtual environment interpreter path to install the AINode main program and its dependencies to a specific location. Specifically, you need to specify the value of the parameter ain_interpreter_dir.

Linux and MacOS：

```Shell
> bash sbin/start-AINode.sh -i xxx/bin/python
```

Windows：

```Shell
> sbin\start-AINode.bat -i xxx\Scripts\python.exe
```

When specifying the Python interpreter please enter the address of the **executable file** of the Python interpreter in the virtual environment. Currently AINode **supports virtual environments such as venv, ****conda****, etc.** **Inputting the system Python interpreter as the installation location** is not supported. In order to ensure that scripts are recognized properly, please **use absolute paths whenever possible**!

### Join the cluster

The AINode startup process automatically adds the new AINode to the IoTDB cluster. After starting the AINode you can verify that the node was joined successfully by entering the SQL for the cluster query in IoTDB's cli command line.
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

## Remove AINode

When it is necessary to move an already connected AINode out of the cluster, the corresponding removal script can be executed.

The commands on Linux and MacOS are as follows:

```Shell
> bash sbin/remove-AINode.sh
```

The startup command on windows is as follows:

```Shell
> sbin/remove-AINode.bat
```

After removing the node, information about the node will not be available.

```Shell
IoTDB> show cluster
+------+----------+-------+---------------+------------+-------+-----------+
|NodeID|  NodeType| Status|InternalAddress|InternalPort|Version|  BuildInfo|
+------+----------+-------+---------------+------------+-------+-----------+
|     0|ConfigNode|Running|      127.0.0.1|       10710|UNKNOWN|190e303-dev|
|     1|  DataNode|Running|      127.0.0.1|       10730|UNKNOWN|190e303-dev|
+------+----------+-------+---------------+------------+-------+-----------+
```

In addition, if the location of the AINode installation was previously customized, then the remove script should be called with the corresponding path as an argument:

Linux and MacOS：

```Shell
> bash sbin/remove-AINode.sh -i xxx/bin/python
```

Windows：

```Shell
> sbin\remove-AINode.bat -i 1 xxx\Scripts\python.exe
```

Similarly, script parameters that are persistently modified in the env script will also take effect when the removal is performed.

If a user loses a file in the data folder, AINode may not be able to remove itself locally, and requires the user to specify the node number, address and port number for removal, in which case we support the user to enter parameters for removal as follows

Linux and MacOS：

```Shell
> bash sbin/remove-AINode.sh -t <AINode-id>/<ip>:<rpc-port>
```

Windows：

```Shell
> sbin\remove-AINode.bat -t <AINode-id>/<ip>:<rpc-port>
```

## Stop AINode

If you need to stop a running AINode node, execute the appropriate shutdown script.

The commands on Linux and MacOS are as follows:

``` Shell.
> bash sbin/stop-AINode.sh
```

The startup command on windows is as follows:

```Shell
> sbin/stop-AINode.bat
```

At this point the exact state of the node is not available and the corresponding management and reasoning functions cannot be used. If you need to restart the node, just execute the startup script again.

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

## Script parameter details

Two parameters are supported during AINode startup, and their specific roles are shown below:

| **Name**            | **Action Script**     | Tag | **Description**                                                     | **Type** | **Default Value**       | Input Method              |
| ------------------- | ---------------- | ---- | ------------------------------------------------------------ | -------- | ---------------- | --------------------- |
| ain_interpreter_dir | start remove env | -i   | The path to the interpreter of the virtual environment in which AINode is installed; absolute paths are required.       | String   | Read environment variables by default | Input on call + persistent modifications |
| ain_remove_target   | remove stop      | -t   | AINode shutdown can specify the Node ID, address, and port number of the target AINode to be removed, in the format of `<AINode-id>/<ip>:<rpc-port>` | String   | Null               | Input on call            |
| ain_force_reinstall | start remove env | -r   | This script checks the version of the AINode installation, and if it does, it forces the installation of the whl package in lib if the version is not correct. | Bool     | false            | Input on call            |
| ain_no_dependencies | start remove env | -n   | Specifies whether to install dependencies when installing AINode, if so only the main AINode program will be installed without dependencies. | Bool     | false            | Input on call            |

Besides passing in the above parameters when executing the script as described above, it is also possible to modify some of the parameters persistently in the `AINode-env.sh` and `AINode-env.bat` scripts in the `conf` folder.

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

Uncomment the corresponding line after writing the parameter value and save it to take effect the next time you execute the script.

## AINode configuration items

AINode supports modifying some necessary parameters. The following parameters can be found in the `conf/iotdb-AINode.properties` file and modified for persistence:

| **Name**                    | **Description**                                                     | **Type** | **Default Value**         | **Modified Mode of Effect**             |
| --------------------------- | ------------------------------------------------------------ | -------- | ------------------ | ---------------------------- |
| ain_seed_config_node | ConfigNode address registered at AINode startup                             | String   | 10710              | Only allow to modify before the first startup |
| ain_inference_rpc_address   | Addresses where AINode provides services and communications                                   | String   | 127.0.0.1          | Effective after reboot                   |
| ain_inference_rpc_port      | AINode provides services and communication ports                                   | String   | 10810              | Effective after reboot                   |
| ain_system_dir              | AINode metadata storage path, the starting directory of the relative path is related to the operating system, it is recommended to use the absolute path. | String   | data/AINode/system | Effective after reboot                   |
| ain_models_dir              | AINode stores the path to the model file. The starting directory of the relative path is related to the operating system, and an absolute path is recommended. | String   | data/AINode/models | Effective after reboot                   |
| ain_logs_dir                | The path where AINode stores the logs. The starting directory of the relative path is related to the operating system, and it is recommended to use the absolute path. | String   | logs/AINode        | Effective after reboot                   |

## Frequently Asked Questions

1. **Not found venv module error when starting AINode**

When starting AINode using the default method, a python virtual environment is created in the installation package directory and dependencies are installed, thus requiring the installation of the venv module. Generally speaking, python 3.8 and above will come with venv, but for some systems that come with python environment may not fulfill this requirement. There are two solutions when this error occurs (either one or the other):

- Install venv module locally, take ubuntu as an example, you can run the following command to install the venv module that comes with python. Or install a version of python that comes with venv from the python website.

```SQL
apt-get install python3.8-venv 
```

- Specify the path to an existing python interpreter as the AINode runtime environment via -i when running the startup script, so that you no longer need to create a new virtual environment.

2. **Compiling the python environment in CentOS7**

The new environment in centos7 (comes with python3.6) does not meet the requirements to start mlnode, you need to compile python3.8+ by yourself (python is not provided as a binary package in centos7)

- Install OpenSSL
  
> Currently Python versions 3.6 to 3.9 are compatible with OpenSSL 1.0.2, 1.1.0, and 1.1.1.

Python requires that we have OpenSSL installed on our system, which can be found at https://stackoverflow.com/questions/56552390/how-to-fix-ssl-module-in-python-is-not-available-in-centos

- Installation and compilation of python

Download the installation package from the official website and extract it using the following specifications

```SQL
wget https://www.python.org/ftp/python/3.8.1/Python-3.8.1.tgz
tar -zxvf Python-3.8.1.tgz
```

Compile and install the corresponding python packages.

```SQL
./configure prefix=/usr/local/python3 -with-openssl=/usr/local/openssl 
make && make install
```

1. **Windows compilation problem like "error: Microsoft Visual** **C++** **14.0 or greater is required..." compilation problem** on windows.

The corresponding error is usually caused by an insufficient version of c++ or setuptools, you can find the appropriate solution at https://stackoverflow.com/questions/44951456/pip-error-microsoft-visual-c-14-0-is-required
you can find a suitable solution there. 