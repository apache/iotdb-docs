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
# Cluster Deployment

This section describes how to manually deploy an instance that includes 3 ConfigNodes and 3 DataNodes, commonly known as a 3C3D cluster.

<div align="center">
    <img src="https://alioss.timecho.com/docs/img/cluster02.png" alt="" style="width: 60%;"/>
</div>


## Note

1. Before installation, ensure that the system is complete by referring to [System Requirements](./Environment-Requirements.md)

2. It is recommended to prioritize using `hostname` for IP configuration during deployment, which can avoid the problem of modifying the host IP in the later stage and causing the database to fail to start. To set the host name, you need to configure /etc/hosts on the target server. For example, if the local IP is 192.168.1.3 and the host name is iotdb-1, you can use the following command to set the server's host name and configure the `cn_internal_address` and `dn_internal_address` of IoTDB using the host name.

   ``` shell
   echo "192.168.1.3  iotdb-1" >> /etc/hosts 
   ```

3. Some parameters cannot be modified after the first startup. Please refer to the "Parameter Configuration" section below for settings.

4. Whether in linux or windows, ensure that the IoTDB installation path does not contain Spaces and Chinese characters to avoid software exceptions.

5. Please note that when installing and deploying IoTDB (including activating and using software), it is necessary to use the same user for operations. You can:

- Using root user (recommended): Using root user can avoid issues such as permissions.
- Using a fixed non root user:
  - Using the same user operation: Ensure that the same user is used for start, activation, stop, and other operations, and do not switch users.
  - Avoid using sudo: Try to avoid using sudo commands as they execute commands with root privileges, which may cause confusion or security issues.

6. It is recommended to deploy a monitoring panel, which can monitor important operational indicators and keep track of database operation status at any time. The monitoring panel can be obtained by contacting the business department,The steps for deploying a monitoring panel can refer to:[Monitoring Panel Deployment](./Monitoring-panel-deployment.md)

## Preparation Steps

1. Prepare the IoTDB database installation package: timechodb-{version}-bin.zip（The installation package can be obtained from:[IoTDB-Package](./IoTDB-Package_timecho.md)）
2. Configure the operating system environment according to environmental requirements（The system environment configuration can be found in:[Environment Requirement](./Environment-Requirements.md)）

## Installation Steps

Assuming there are three Linux servers now, the IP addresses and service roles are assigned as follows:

| Node IP       | Host Name | Service              |
| ------------- | --------- | -------------------- |
| 11.101.17.224 | iotdb-1   | ConfigNode、DataNode |
| 11.101.17.225 | iotdb-2   | ConfigNode、DataNode |
| 11.101.17.226 | iotdb-3   | ConfigNode、DataNode |

### Set Host Name

On three machines, configure the host names separately. To set the host names, configure `/etc/hosts` on the target server. Use the following command:

```Bash
echo "11.101.17.224  iotdb-1"  >> /etc/hosts
echo "11.101.17.225  iotdb-2"  >> /etc/hosts
echo "11.101.17.226  iotdb-3"  >> /etc/hosts 
```

### Configuration

Unzip the installation package and enter the installation directory

```Plain
unzip  timechodb-{version}-bin.zip
cd  timechodb-{version}-bin
```

#### Environment script configuration

- `./conf/confignode-env.sh` configuration

  | **Configuration** | **Description**                                              | **Default** | **Recommended value**                                        | **Note**                            |
  | :---------------- | :----------------------------------------------------------- | :---------- | :----------------------------------------------------------- | :---------------------------------- |
  | MEMORY_SIZE       | The total amount of memory that IoTDB ConfigNode nodes can use | -           | Can be filled in as needed, and the system will allocate memory based on the filled in values | Restarting the service takes effect |

- `./conf/datanode-env.sh`  configuration

  | **Configuration** | **Description**                                              | **Default** | **Recommended value**                                        | **Note**                            |
  | :---------------- | :----------------------------------------------------------- | :---------- | :----------------------------------------------------------- | :---------------------------------- |
  | MEMORY_SIZE       | The total amount of memory that IoTDB DataNode nodes can use | -           | Can be filled in as needed, and the system will allocate memory based on the filled in values | Restarting the service takes effect |

#### General Configuration（./conf/iotdb-system.properties）

- Cluster Configuration

  | **Configuration**         | **Description**                                              | 11.101.17.224  | 11.101.17.225  | 11.101.17.226  |
  | ------------------------- | ------------------------------------------------------------ | -------------- | -------------- | -------------- |
  | cluster_name              | Cluster Name                                                 | defaultCluster | defaultCluster | defaultCluster |
  | schema_replication_factor | The number of metadata replicas, the number of DataNodes should not be less than this number | 3              | 3              | 3              |
  | data_replication_factor   | The number of data replicas should not be less than this number of DataNodes | 2              | 2              | 2              |

#### ConfigNode Configuration

| **Configuration**   | **Description**                                              | **Default**     | **Recommended value**                                        | 11.101.17.224 | 11.101.17.225 | 11.101.17.226 | Note                                     |
| ------------------- | ------------------------------------------------------------ | --------------- | ------------------------------------------------------------ | ------------- | ------------- | ------------- | ---------------------------------------- |
| cn_internal_address | The address used by ConfigNode for communication within the cluster | 127.0.0.1       | The IPV4 address or host name of the server where it is located, and it is recommended to use host name | iotdb-1       | iotdb-2       | iotdb-3       | Cannot be modified after initial startup |
| cn_internal_port    | The port used by ConfigNode for communication within the cluster | 10710           | 10710                                                        | 10710         | 10710         | 10710         | Cannot be modified after initial startup |
| cn_consensus_port   | The port used for ConfigNode replica group consensus protocol communication | 10720           | 10720                                                        | 10720         | 10720         | 10720         | Cannot be modified after initial startup |
| cn_seed_config_node | The address of the ConfigNode that the node connects to when registering to join the cluster, `cn_internal_address:cn_internal_port` | 127.0.0.1:10710 | The first CongfigNode's `cn_internal-address: cn_internal_port` | iotdb-1:10710 | iotdb-1:10710 | iotdb-1:10710 | Cannot be modified after initial startup |

#### Datanode Configuration

| **Configuration**               | **Description**                                              | **Default**     | **Recommended value**                                        | 11.101.17.224 | 11.101.17.225 | 11.101.17.226 | Note                                     |
| ------------------------------- | ------------------------------------------------------------ | --------------- | ------------------------------------------------------------ | ------------- | ------------- | ------------- | ---------------------------------------- |
| dn_rpc_address                  | The address of the client RPC service                        | 127.0.0.1       | Recommend using the **IPV4 address or hostname** of the server where it is located | iotdb-1       | iotdb-2       | iotdb-3       | Restarting the service takes effect      |
| dn_rpc_port                     | The port of the client RPC service                           | 6667            | 6667                                                         | 6667          | 6667          | 6667          | Restarting the service takes effect      |
| dn_internal_address             | The address used by DataNode for communication within the cluster | 127.0.0.1       | The IPV4 address or host name of the server where it is located, and it is recommended to use host name | iotdb-1       | iotdb-2       | iotdb-3       | Cannot be modified after initial startup |
| dn_internal_port                | The port used by DataNode for communication within the cluster | 10730           | 10730                                                        | 10730         | 10730         | 10730         | Cannot be modified after initial startup |
| dn_mpp_data_exchange_port       | The port used by DataNode to receive data streams            | 10740           | 10740                                                        | 10740         | 10740         | 10740         | Cannot be modified after initial startup |
| dn_data_region_consensus_port   | The port used by DataNode for data replica consensus protocol communication | 10750           | 10750                                                        | 10750         | 10750         | 10750         | Cannot be modified after initial startup |
| dn_schema_region_consensus_port | The port used by DataNode for metadata replica consensus protocol communication | 10760           | 10760                                                        | 10760         | 10760         | 10760         | Cannot be modified after initial startup |
| dn_seed_config_node             | The address of the ConfigNode that the node connects to when registering to join the cluster, i.e. `cn_internal-address: cn_internal_port` | 127.0.0.1:10710 | The first CongfigNode's cn_internal-address: cn_internal_port | iotdb-1:10710 | iotdb-1:10710 | iotdb-1:10710 | Cannot be modified after initial startup |

> ❗️Attention: Editors such as VSCode Remote do not have automatic configuration saving function. Please ensure that the modified files are saved persistently, otherwise the configuration items will not take effect

### Start ConfigNode

Start the first confignode of IoTDB-1 first, ensuring that the seed confignode node starts first, and then start the second and third confignode nodes in sequence

```Bash
cd sbin

./start-confignode.sh  -d      #"- d" parameter will start in the background
```

If the startup fails, please refer to [Common Questions](#common-questions).

### Start DataNode

 Enter the `sbin` directory of iotdb and start three datanode nodes in sequence:

```Go
cd sbin

./start-datanode.sh  -d   #"- d" parameter will start in the background
```

### Activate Database

#### Method 1: Activate file copy activation

- After starting three Confignode Datanode nodes in sequence, copy the `activation` folder of each machine and the `system_info` file of each machine to the Timecho staff;

- The staff will return the license files for each ConfigNode Datanode node, where 3 license files will be returned;

- Put the three license files into the `activation` folder of the corresponding ConfigNode node;

#### Method 2: Activate Script Activation

- Retrieve the machine codes of 3 machines in sequence and enter IoTDB CLI

  - Table Model CLI Enter Command：

  ```SQL
  # Linux or MACOS
  ./start-cli.sh -sql_dialect table
  
  # windows
  ./start-cli.bat -sql_dialect table
  ```

  - Enter the tree model CLI command:

  ```SQL
  # Linux or MACOS
  ./start-cli.sh
  
  # windows
  ./start-cli.bat
  ```

  - Execute the following to obtain the machine code required for activation:
    - Note: Currently, activation is only supported in tree models

  ```Bash
  show system info
  ```

  - The following information is displayed, which shows the machine code of one machine:

  ```Bash
  +--------------------------------------------------------------+
  |                                                    SystemInfo|
  +--------------------------------------------------------------+
  |01-TE5NLES4-UDDWCMYE,01-GG5NLES4-XXDWCMYE,01-FF5NLES4-WWWWCMYE|
  +--------------------------------------------------------------+
  Total line number = 1
  It costs 0.030s
  ```

- The other two nodes enter the CLI of the IoTDB tree model in sequence, execute the statement, and copy the machine codes of the three machines obtained to the Timecho staff

- The staff will return three activation codes, which normally correspond to the order of the three machine codes provided. Please paste each activation code into the CLI separately, as prompted below:

  - Note: The activation code needs to be marked with a `'`symbol before and after, as shown in

   ```Bash
    IoTDB> activate '01-D4EYQGPZ-EAUJJODW-NUKRDR6F-TUQS3B75-EDZFLK3A-6BOKJFFZ-ALDHOMN7-NB2E4BHI-7ZKGFVK6-GCIFXA4T-UG3XJTTD-SHJV6F2P-Q27B4OMJ-R47ZDIM3-UUASUXG2-OQXGVZCO-MMYKICZU-TWFQYYAO-ZOAGOKJA-NYHQTA5U-EWAR4EP5-MRC6R2CI-PKUTKRCT-7UDGRH3F-7BYV4P5D-6KKIA===,01-D4EYQGPZ-EAUJJODW-NUKRDR6F-TUQS3B75-EDZFLK3A-6BOKJFFZ-ALDHOMN7-NB2E4BHI-7ZKGFVK6-GCIFXA4T-UG3XJTTD-SHJV6F2P-Q27B4OMJ-R47ZDIM3-UUASUXG2-OQXGVZCO-MMYKICZU-TWFQYYAO-ZOAGOKJA-NYHQTA5U-EWAR4EP5-MRC6R2CI-PKUTKRCT-7UDGRH3F-7BYV4P5D-6KKIA===,01-D4EYQGPZ-EAUJJODW-NUKRDR6F-TUQS3B75-EDZFLK3A-6BOKJFFZ-ALDHOMN7-NB2E4BHI-7ZKGFVK6-GCIFXA4T-UG3XJTTD-SHJV6F2P-Q27B4OMJ-R47ZDIM3-UUASUXG2-OQXGVZCO-MMYKICZU-TWFQYYAO-ZOAGOKJA-NYHQTA5U-EWAR4EP5-MRC6R2CI-PKUTKRCT-7UDGRH3F-7BYV4P5D-6KKIA==='
    ```

### Verify Activation

When the status of the 'Result' field is displayed as' success', it indicates successful activation

![](https://alioss.timecho.com/docs/img/%E9%9B%86%E7%BE%A4-%E9%AA%8C%E8%AF%81.png)

## Node Maintenance Steps

### ConfigNode Node Maintenance

ConfigNode node maintenance is divided into two types of operations: adding and removing ConfigNodes, with two common use cases:

- Cluster expansion: For example, when there is only one ConfigNode in the cluster, and you want to increase the high availability of ConfigNode nodes, you can add two ConfigNodes, making a total of three ConfigNodes in the cluster.

- Cluster failure recovery: When the machine where a ConfigNode is located fails, making the ConfigNode unable to run normally, you can remove this ConfigNode and then add a new ConfigNode to the cluster.

> ❗️Note, after completing ConfigNode node maintenance, you need to ensure that there are 1 or 3 ConfigNodes running normally in the cluster. Two ConfigNodes do not have high availability, and more than three ConfigNodes will lead to performance loss.

#### Adding ConfigNode Nodes

Script command:

```shell
# Linux / MacOS
# First switch to the IoTDB root directory
sbin/start-confignode.sh

# Windows
# First switch to the IoTDB root directory
sbin/start-confignode.bat
```

#### Removing ConfigNode Nodes

First connect to the cluster through the CLI and confirm the internal address and port number of the ConfigNode you want to remove by using `show confignodes`:

```Bash
IoTDB> show confignodes
+------+-------+---------------+------------+--------+
|NodeID| Status|InternalAddress|InternalPort|    Role|
+------+-------+---------------+------------+--------+
|     0|Running|      127.0.0.1|       10710|  Leader|
|     1|Running|      127.0.0.1|       10711|Follower|
|     2|Running|      127.0.0.1|       10712|Follower|
+------+-------+---------------+------------+--------+
Total line number = 3
It costs 0.030s
```

Then use the script to remove the DataNode. Script command:

```Bash
# Linux / MacOS 
sbin/remove-confignode.sh [confignode_id]

#Windows
sbin/remove-confignode.bat [confignode_id]

```

### DataNode Node Maintenance

There are two common scenarios for DataNode node maintenance:

- Cluster expansion: For the purpose of expanding cluster capabilities, add new DataNodes to the cluster

- Cluster failure recovery: When a machine where a DataNode is located fails, making the DataNode unable to run normally, you can remove this DataNode and add a new DataNode to the cluster

> ❗️Note, in order for the cluster to work normally, during the process of DataNode node maintenance and after the maintenance is completed, the total number of DataNodes running normally should not be less than the number of data replicas (usually 2), nor less than the number of metadata replicas (usually 3).

#### Adding DataNode Nodes

Script command:

```Bash
# Linux / MacOS 
# First switch to the IoTDB root directory
sbin/start-datanode.sh

# Windows
# First switch to the IoTDB root directory
sbin/start-datanode.bat
```

Note: After adding a DataNode, as new writes arrive (and old data expires, if TTL is set), the cluster load will gradually balance towards the new DataNode, eventually achieving a balance of storage and computation resources on all nodes.

#### Removing DataNode Nodes

First connect to the cluster through the CLI and confirm the RPC address and port number of the DataNode you want to remove with `show datanodes`:

```Bash
IoTDB> show datanodes
+------+-------+----------+-------+-------------+---------------+
|NodeID| Status|RpcAddress|RpcPort|DataRegionNum|SchemaRegionNum|
+------+-------+----------+-------+-------------+---------------+
|     1|Running|   0.0.0.0|   6667|            0|              0|
|     2|Running|   0.0.0.0|   6668|            1|              1|
|     3|Running|   0.0.0.0|   6669|            1|              0|
+------+-------+----------+-------+-------------+---------------+
Total line number = 3
It costs 0.110s
```

Then use the script to remove the DataNode. Script command:

```Bash
# Linux / MacOS 
sbin/remove-datanode.sh [datanode_id]

#Windows
sbin/remove-datanode.bat [datanode_id]
```

## Common Questions

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
| :-------- | :---------------------------------------------- | :------------- |
| -d        | Start in daemon mode, running in the background | No             |

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