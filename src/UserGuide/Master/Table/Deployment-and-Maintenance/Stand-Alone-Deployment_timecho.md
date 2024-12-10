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

## Note

1. Before installation, ensure that the system is complete by referring to [System Requirements](./Environment-Requirements.md).

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

## Installation Steps

### 1、Unzip the installation package and enter the installation directory

```Plain
unzip  timechodb-{version}-bin.zip
cd  timechodb-{version}-bin
```

### 2、Parameter Configuration

#### Memory Configuration

- conf/confignode-env.sh（or .bat）

  | **Configuration** |                       **Description**                        | **Default** |                    **Recommended value**                     |                Note                 |
  | :---------------: | :----------------------------------------------------------: | :---------: | :----------------------------------------------------------: | :---------------------------------: |
  |    MEMORY_SIZE    | The total amount of memory that IoTDB ConfigNode nodes can use |    empty    | Can be filled in as needed, and the system will allocate memory based on the filled in values | Restarting the service takes effect |

- conf/datanode-env.sh（or .bat）

  | **Configuration** |                       **Description**                        | **Default** |                    **Recommended value**                     |              **Note**               |
  | :---------------: | :----------------------------------------------------------: | :---------: | :----------------------------------------------------------: | :---------------------------------: |
  |    MEMORY_SIZE    | The total amount of memory that IoTDB DataNode nodes can use |    empty    | Can be filled in as needed, and the system will allocate memory based on the filled in values | Restarting the service takes effect |

#### Function Configuration

The parameters that actually take effect in the system are in the file conf/iotdb-system.exe. To start, the following parameters need to be set, which can be viewed in the conf/iotdb-system.exe file for all parameters

Cluster function configuration

|     **Configuration**     |                       **Description**                        |  **Default**   |                    **Recommended value**                     |                         Note                          |
| :-----------------------: | :----------------------------------------------------------: | :------------: | :----------------------------------------------------------: | :---------------------------------------------------: |
|       cluster_name        |                         Cluster Name                         | defaultCluster | The cluster name can be set as needed, and if there are no special needs, the default can be kept |       Cannot be modified after initial startup        |
| schema_replication_factor | Number of metadata replicas, set to 1 for the standalone version here |       1        |                              1                               | Default 1, cannot be modified after the first startup |
|  data_replication_factor  | Number of data replicas, set to 1 for the standalone version here |       1        |                              1                               | Default 1, cannot be modified after the first startup |

ConfigNode Configuration

|  **Configuration**  |                       **Description**                        |   **Default**   |                    **Recommended value**                     |                   Note                   |
| :-----------------: | :----------------------------------------------------------: | :-------------: | :----------------------------------------------------------: | :--------------------------------------: |
| cn_internal_address | The address used by ConfigNode for communication within the cluster |    127.0.0.1    | The IPV4 address or host name of the server where it is located, and it is recommended to use host name | Cannot be modified after initial startup |
|  cn_internal_port   | The port used by ConfigNode for communication within the cluster |      10710      |                            10710                             | Cannot be modified after initial startup |
|  cn_consensus_port  | The port used for ConfigNode replica group consensus protocol communication |      10720      |                            10720                             | Cannot be modified after initial startup |
| cn_seed_config_node | The address of the ConfigNode that the node connects to when registering to join the cluster, cn_internal_address:cn_internal_port | 127.0.0.1:10710 |             cn_internal_address:cn_internal_port             | Cannot be modified after initial startup |

DataNode Configuration

| **Configuration**               | **Description**                                              | **Default**     | **Recommended value**                                        | **Note**                                 |
| :------------------------------ | :----------------------------------------------------------- | :-------------- | :----------------------------------------------------------- | :--------------------------------------- |
| dn_rpc_address                  | The address of the client RPC service                        | 0.0.0.0         | The IPV4 address or host name of the server where it is located, and it is recommended to use host name | Restarting the service takes effect      |
| dn_rpc_port                     | The port of the client RPC service                           | 6667            | 6667                                                         | Restarting the service takes effect      |
| dn_internal_address             | The address used by DataNode for communication within the cluster | 127.0.0.1       | The IPV4 address or host name of the server where it is located, and it is recommended to use host name | Cannot be modified after initial startup |
| dn_internal_port                | The port used by DataNode for communication within the cluster | 10730           | 10730                                                        | Cannot be modified after initial startup |
| dn_mpp_data_exchange_port       | The port used by DataNode to receive data streams            | 10740           | 10740                                                        | Cannot be modified after initial startup |
| dn_data_region_consensus_port   | The port used by DataNode for data replica consensus protocol communication | 10750           | 10750                                                        | Cannot be modified after initial startup |
| dn_schema_region_consensus_port | The port used by DataNode for metadata replica consensus protocol communication | 10760           | 10760                                                        | Cannot be modified after initial startup |
| dn_seed_config_node             | The ConfigNode address that the node connects to when registering to join the cluster, i.e. cn_internal-address: cn_internal_port | 127.0.0.1:10710 | cn_internal_address:cn_internal_port                         | Cannot be modified after initial startup |

### 3、Start ConfigNode

Enter the sbin directory of iotdb and start confignode

```shell

./start-confignode.sh    -d      #The "- d" parameter will start in the background 

```

If the startup fails, please refer to [Common Problem](#common-problem).

### 4、Start DataNode

 Enter the sbin directory of iotdb and start datanode:

```shell

cd sbin

./start-datanode.sh   -d   # The "- d" parameter will start in the background

```

### 5、Activate Database

#### Method 1: Activate file copy activation

- After starting the confignode datanode node, enter the activation folder and copy the systeminfo file to the Timecho staff

- Received the license file returned by the staff

- Place the license file in the activation folder of the corresponding node;

#### Method 2: Activate Script Activation

- Obtain the required machine code for activation, enter the IoTDB CLI (./start-cli.sh-sql-dialect table/start-cli.bat - sql-dialect table), and perform the following:
  
  - Note: When sql-dialect is a table, it is temporarily not supported to use

```shell
show system info
```

- Display the following information, please copy the machine code (i.e. green string) to the Timecho staff:

```sql
+--------------------------------------------------------------+
|                                                    SystemInfo|
+--------------------------------------------------------------+
|                                          01-TE5NLES4-UDDWCMYE|
+--------------------------------------------------------------+
Total line number = 1
It costs 0.030s
```

- Enter the activation code returned by the staff into the CLI and enter the following content
  
  - Note: The activation code needs to be marked with a `'`symbol before and after, as shown in

```sql
IoTDB> activate '01-D4EYQGPZ-EAUJJODW-NUKRDR6F-TUQS3B75-EDZFLK3A-6BOKJFFZ-ALDHOMN7-NB2E4BHI-7ZKGFVK6-GCIFXA4T-UG3XJTTD-SHJV6F2P-Q27B4OMJ-R47ZDIM3-UUASUXG2-OQXGVZCO-MMYKICZU-TWFQYYAO-ZOAGOKJA-NYHQTA5U-EWAR4EP5-MRC6R2CI-PKUTKRCT-7UDGRH3F-7BYV4P5D-6KKIA==='
```

### 6、Verify Activation

When the "ClusterActivation Status" field is displayed as Activated, it indicates successful activation

![](https://alioss.timecho.com/docs/img/%E5%8D%95%E6%9C%BA-%E9%AA%8C%E8%AF%81.png)

## Common Problem

1. Multiple prompts indicating activation failure during deployment process

​    - Use the `ls -al` command: Use the `ls -al` command to check if the owner information of the installation package root directory is the current user.

​    - Check activation directory: Check all files in the `./activation` directory and whether the owner information is the current user.

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
     ps -ef|gerp iotdb
   
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

## Appendix

### Introduction to Configuration Node Parameters

| Parameter | Description                                     | Is it required |
| :-------- | :---------------------------------------------- | :----------------- |
| -d        | Start in daemon mode, running in the background | No                 |

### Introduction to Datanode Node Parameters

| Abbreviation | Description                                                  | Is it required |
| :----------- | :----------------------------------------------------------- | :------------- |
| -v           | Show version information                                     | No             |
| -f           | Run the script in the foreground, do not put it in the background | No             |
| -d           | Start in daemon mode, i.e. run in the background             | No             |
| -p           | Specify a file to store the process ID for process management | No             |
| -c           | Specify the path to the configuration file folder, the script will load the configuration file from here | No             |
| -g           | Print detailed garbage collection (GC) information           | No             |
| -H           | Specify the path of the Java heap dump file, used when JVM memory overflows | No             |
| -E           | Specify the path of the JVM error log file                   | No             |
| -D           | Define system properties, in the format key=value            | No             |
| -X           | Pass -XX parameters directly to the JVM                      | No             |
| -h           | Help instruction                                             | No             |

