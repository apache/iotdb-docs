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
# Stand-Alone Deployment

This chapter will introduce how to start an IoTDB standalone instance, which includes 1 ConfigNode and 1 DataNode (commonly known as 1C1D).

## Matters Needing Attention

1. Before installation, ensure that the system is complete by referring to [System configuration](./Environment-Requirements.md).

2. It is recommended to prioritize using 'hostname' for IP configuration during deployment, which can avoid the problem of modifying the host IP in the later stage and causing the database to fail to start. To set the host name, you need to configure/etc/hosts on the target server. For example, if the local IP is 192.168.1.3 and the host name is iotdb-1, you can use the following command to set the server's host name and configure IoTDB's' cn_internal-address' using the host name dn_internal_address、dn_rpc_address。

   ```shell
   echo "192.168.1.3  iotdb-1" >> /etc/hosts 
   ```

3. Some parameters cannot be modified after the first startup. Please refer to the "Parameter Configuration" section below for settings.

4. Whether in linux or windows, ensure that the IoTDB installation path does not contain Spaces and Chinese characters to avoid software exceptions.

5. Please note that when installing and deploying IoTDB (including activating and using software), it is necessary to use the same user for operations. You can:
- Using root user (recommended): Using root user can avoid issues such as permissions.
- Using a fixed non root user:
  - Using the same user operation: Ensure that the same user is used for start, activation, stop, and other operations, and do not switch users.
  - Avoid using sudo: Try to avoid using sudo commands as they execute commands with root privileges, which may cause confusion or security issues.

6. It is recommended to deploy a monitoring panel, which can monitor important operational indicators and keep track of database operation status at any time. The monitoring panel can be obtained by contacting the business department, and the steps for deploying the monitoring panel can be referred to：[Monitoring Board Install and Deploy](./Monitoring-panel-deployment.md).

7. Before installation, the health check tool can help inspect the operating environment of IoTDB nodes and obtain detailed inspection results. The usage method of the IoTDB health check tool can be found in:[Health Check Tool](../Tools-System/Health-Check-Tool.md).

## Installation Steps

### 1. Pre-installation Check

To ensure the IoTDB Enterprise Edition installation package you obtained is complete and authentic, we recommend performing an SHA512 verification before proceeding with the installation and deployment.

#### Preparation:

- Obtain the officially released SHA512 checksum: Find the "SHA512 Checksum" corresponding to each version in the [Release History](../IoTDB-Introduction/Release-history_timecho.md) document.

#### Verification Steps (Linux as an Example):

1. Open the terminal and navigate to the directory where the installation package is stored (e.g., /data/iotdb):
   ```Bash
      cd /data/iotdb
      ```
2. Execute the following command to calculate the hash value:
   ```Bash
      sha512sum timechodb-{version}-bin.zip
      ```
3. The terminal will output a result (the left part is the SHA512 checksum, and the right part is the file name):

![img](/img/sha512-02.png)

4. Compare the output result with the official SHA512 checksum. Once confirmed that they match, you can proceed with the installation and deployment operations in accordance with the procedures below.

#### Notes:

- If the verification results do not match, please contact Timecho Team to re-obtain the installation package.
- If a "file not found" prompt appears during verification, check whether the file path is correct or if the installation package has been fully downloaded.

### 2、Unzip the installation package and enter the installation directory

```shell
unzip  iotdb-enterprise-{version}-bin.zip
cd  iotdb-enterprise-{version}-bin
```

### 2. Parameter Configuration

#### Environment Script Configuration

- ./conf/confignode-env.sh (./conf/confignode-env.bat) configuration

| **Configuration** |                       **Description**                        | **Default** |                    **Recommended value**                     |                Note                 |
| :---------------: | :----------------------------------------------------------: | :---------: | :----------------------------------------------------------: | :---------------------------------: |
|    MEMORY_SIZE    | The total amount of memory that IoTDB ConfigNode nodes can use |    empty    | Can be filled in as needed, and the system will allocate memory based on the filled in values | Save changes without immediate execution; modifications take effect after service restart. |

- ./conf/datanode-env.sh (./conf/datanode-env.bat) configuration

| **Configuration**  |               **Description**               | **Default** |                    **Recommended value**                    |      **Note**      |
| :---------: | :----------------------------------: | :--------: | :----------------------------------------------: | :----------: |
| MEMORY_SIZE | The total amount of memory that IoTDB DataNode nodes can use |     empty     | Can be filled in as needed, and the system will allocate memory based on the filled in values | Save changes without immediate execution; modifications take effect after service restart. |

#### System General Configuration

Open the general configuration file (./conf/iotdb-system. properties file) and set the following parameters:

|     **Configuration**     |                       **Description**                        |  **Default**   |                    **Recommended value**                     |                         Note                          |
| :-----------------------: | :----------------------------------------------------------: | :------------: | :----------------------------------------------------------: | :---------------------------------------------------: |
|       cluster_name        |                         Cluster Name                         | defaultCluster | The cluster name can be set as needed, and if there are no special needs, the default can be kept |       Support hot loading from V1.3.3, but it is not recommended to change the cluster name by manually modifying the configuration file        |
| schema_replication_factor | Number of metadata replicas, set to 1 for the standalone version here |       1        |                              1                               | Default 1, cannot be modified after the first startup |
|  data_replication_factor  | Number of data replicas, set to 1 for the standalone version here |       1        |                              1                               | Default 1, cannot be modified after the first startup |

#### ConfigNode Configuration

Open the ConfigNode configuration file (./conf/iotdb-system. properties file) and set the following parameters:

|  **Configuration**  |                       **Description**                        |   **Default**   |                    **Recommended value**                     |                   Note                   |
| :-----------------: | :----------------------------------------------------------: | :-------------: | :----------------------------------------------------------: | :--------------------------------------: |
| cn_internal_address | The address used by ConfigNode for communication within the cluster |    127.0.0.1    | The IPV4 address or host name of the server where it is located, and it is recommended to use host name | Cannot be modified after initial startup |
|  cn_internal_port   | The port used by ConfigNode for communication within the cluster |      10710      |                            10710                             | Cannot be modified after initial startup |
|  cn_consensus_port  | The port used for ConfigNode replica group consensus protocol communication |      10720      |                            10720                             | Cannot be modified after initial startup |
| cn_seed_config_node | The address of the ConfigNode that the node connects to when registering to join the cluster, cn_internal_address:cn_internal_port | 127.0.0.1:10710 |             cn_internal_address:cn_internal_port             | Cannot be modified after initial startup |

#### DataNode Configuration

Open the DataNode configuration file (./conf/iotdb-system. properties file) and set the following parameters:

| **Configuration**               | **Description**                                              | **Default**     | **Recommended value**                                                                                           | **Note**                                 |
| :------------------------------ | :----------------------------------------------------------- | :-------------- |:----------------------------------------------------------------------------------------------------------------| :--------------------------------------- |
| dn_rpc_address                  | The address of the client RPC service                        | 0.0.0.0         | The IPV4 address or host name of the server where it is located, and it is recommended to use the IPV4 address  | Restarting the service takes effect      |
| dn_rpc_port                     | The port of the client RPC service                           | 6667            | 6667                                                                                                            | Restarting the service takes effect      |
| dn_internal_address             | The address used by DataNode for communication within the cluster | 127.0.0.1       | The IPV4 address or host name of the server where it is located, and it is recommended to use host name         | Cannot be modified after initial startup |
| dn_internal_port                | The port used by DataNode for communication within the cluster | 10730           | 10730                                                                                                           | Cannot be modified after initial startup |
| dn_mpp_data_exchange_port       | The port used by DataNode to receive data streams            | 10740           | 10740                                                                                                           | Cannot be modified after initial startup |
| dn_data_region_consensus_port   | The port used by DataNode for data replica consensus protocol communication | 10750           | 10750                                                                                                           | Cannot be modified after initial startup |
| dn_schema_region_consensus_port | The port used by DataNode for metadata replica consensus protocol communication | 10760           | 10760                                                                                                           | Cannot be modified after initial startup |
| dn_seed_config_node             | The ConfigNode address that the node connects to when registering to join the cluster, i.e. cn_internal-address: cn_internal_port | 127.0.0.1:10710 | cn_internal_address:cn_internal_port                                                                            | Cannot be modified after initial startup |

> ❗️Attention: Editors such as VSCode Remote do not have automatic configuration saving function. Please ensure that the modified files are saved persistently, otherwise the configuration items will not take effect

### 3. Start and Activate Database (Available since V1.3.4)

#### 3.1 Start ConfigNode

Enter the sbin directory of iotdb and start confignode

```shell
./start-confignode.sh    -d      #The "- d" parameter will start in the background 
```
If the startup fails, please refer to [Common Questions](#common-questions).

#### 3.2 Start DataNode

Enter the sbin directory of iotdb and start datanode:

```shell
./start-datanode.sh   -d   # The "- d" parameter will start in the background
```

#### 3.3 Activate Database

##### Activation via CLI

- Enter the CLI

 ```SQL 
  ./sbin/start-cli.sh
```

- Execute the following command to obtain the machine code required for activation:

  ```Bash
  show system info
  ```

- Copy the returned machine code and provide it to the Timecho team:

```Bash
+--------------------------------------------------------------+
|                                                    SystemInfo|
+--------------------------------------------------------------+
|                                          01-TE5NLES4-UDDWCMYE|
+--------------------------------------------------------------+
Total line number = 1
It costs 0.030s
```

- Input the activation code returned by the Timecho team into the CLI using the following command:
  - Note: The activation code must be enclosed in ' symbols, as shown:

```Bash
IoTDB> activate '01-D4EYQGPZ-EAUJJODW-NUKRDR6F-TUQS3B75-EDZFLK3A-6BOKJFFZ-ALDHOMN7-NB2E4BHI-7ZKGFVK6-GCIFXA4T-UG3XJTTD-SHJV6F2P-Q27B4OMJ-R47ZDIM3-UUASUXG2-OQXGVZCO-MMYKICZU-TWFQYYAO-ZOAGOKJA-NYHQTA5U-EWAR4EP5-MRC6R2CI-PKUTKRCT-7UDGRH3F-7BYV4P5D-6KKIA==='
```

### 4. Start and Activate Database (Available before V1.3.4)

#### 4.1 Start ConfigNode

Enter the sbin directory of iotdb and start confignode

```shell
./start-confignode.sh    -d      #The "- d" parameter will start in the background 
```
If the startup fails, please refer to [Common Questions](#common-questions).

#### 4.2 Activate Database

##### Method 1: Activate file copy activation

- After starting the confignode node, enter the activation folder and copy the systeminfo file to the Timecho staff
- Received the license file returned by the staff
- Place the license file in the activation folder of the corresponding node;

##### Method 2: Activate Script Activation

- Obtain the required machine code for activation, enter the sbin directory of the installation directory, and execute the activation script:

```shell
 cd sbin
./start-activate.sh
```

- The following information is displayed. Please copy the machine code (i.e. the string of characters) to the Timecho staff:

```shell
Please copy the system_info's content and send it to Timecho:
01-KU5LDFFN-PNBEHDRH
Please enter license:
```

- Enter the activation code returned by the staff into the previous command line prompt 'Please enter license:', as shown below:

```shell
Please enter license:
JJw+MmF+AtexsfgNGOFgTm83Bxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxm6pF+APW1CiXLTSijK9Qh3nsLgzrW8OJPh26Vl6ljKUpCvpTiw==
License has been stored to sbin/../activation/license
Import completed. Please start cluster and excute 'show cluster' to verify activation status
```

#### 4.3 Start DataNode

Enter the sbin directory of iotdb and start datanode:

```shell
./start-datanode.sh   -d   # The "- d" parameter will start in the background
```

### 5、Verify Deployment

Can be executed directly/ Cli startup script in sbin directory:

```shell
./start-cli.sh  -h  ip(local IP or domain name)  -p  port(6667)
```

After successful startup, the following interface will appear displaying successful installation of IOTDB.

![](/img/%E5%90%AF%E5%8A%A8%E6%88%90%E5%8A%9F.png)

After the installation success interface appears, continue to check if the activation is successful and use the `show cluster`command

When you see the display "Activated" on the far right, it indicates successful activation

![](/img/show%20cluster.png)

In the CLI, you can also check the activation status by running the `show activation` command; the example below shows a status of ACTIVATED, indicating successful activation.

```sql
IoTDB> show activation
+---------------+---------+-----------------------------+
|    LicenseInfo|    Usage|                        Limit|
+---------------+---------+-----------------------------+
|         Status|ACTIVATED|                            -|
|    ExpiredTime|        -|2026-04-30T00:00:00.000+08:00|
|  DataNodeLimit|        1|                    Unlimited|
|       CpuLimit|       16|                    Unlimited|
|    DeviceLimit|       30|                    Unlimited|
|TimeSeriesLimit|       72|                1,000,000,000|
+---------------+---------+-----------------------------+
```


> The appearance of 'Activated (W)' indicates passive activation, indicating that this Config Node does not have a license file (or has not issued the latest license file with a timestamp). At this point, it is recommended to check if the license file has been placed in the license folder. If not, please place the license file. If a license file already exists, it may be due to inconsistency between the license file of this node and the information of other nodes. Please contact Timecho staff to reapply.

## Common Problem
1. Multiple prompts indicating activation failure during deployment process
    - Use the `ls -al` command: Use the `ls -al` command to check if the owner information of the installation package root directory is the current user.
    - Check activation directory: Check all files in the `./activation` directory and whether the owner information is the current user.

2. Confignode failed to start

    Step 1: Please check the startup log to see if any parameters that cannot be changed after the first startup have been modified.

    Step 2: Please check the startup log for any other abnormalities. If there are any abnormal phenomena in the log, please contact Timecho Technical Support personnel for consultation on solutions.

    Step 3: If it is the first deployment or data can be deleted, you can also clean up the environment according to the following steps, redeploy, and restart.

    Step 4: Clean up the environment:

    a. Terminate all ConfigNode Node and DataNode processes.
    ```Bash
      # 1. Stop the ConfigNode and DataNode services
      sbin/stop-standalone.sh

      # 2. Check for any remaining processes
      jps
      # Or
      ps -ef|grep iotdb

      # 3. If there are any remaining processes, manually kill the
      kill -9 <pid>
      # If you are sure there is only one iotdb on the machine, you can use the following command to clean up residual processes
      ps -ef|grep iotdb|grep -v grep|tr -s '  ' ' ' |cut -d ' ' -f2|xargs kill -9
    ```
    b.  Delete the data and logs directories.
   
    Explanation: Deleting the data directory is necessary, deleting the logs directory is for clean logs and is not mandatory.
    
    ```Bash
      cd /data/iotdb
      rm -rf data logs
    ```