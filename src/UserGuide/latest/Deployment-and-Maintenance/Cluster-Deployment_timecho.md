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
    <img src="https://alioss.timecho.com/docs/img/20240705141552.png" alt="" style="width: 60%;"/>
</div>

## Note

1. It is recommended to prioritize using `hostname` for IP configuration during deployment, which can avoid the problem of modifying the host IP in the later stage and causing the database to fail to start. To set the host name, you need to configure /etc/hosts on the target server. For example, if the local IP is 192.168.1.3 and the host name is iotdb-1, you can use the following command to set the server's host name and configure the `cn_internal_address` and `dn_internal_address` of IoTDB using the host name.

   ``` shell
   echo "192.168.1.3  iotdb-1" >> /etc/hosts 
   ```

2. Some parameters cannot be modified after the first startup. Please refer to the "Parameter Configuration" section below for settings.
3. It is recommended to deploy a monitoring panel, which can monitor important operational indicators and keep track of database operation status at any time. The monitoring panel can be obtained by contacting the business department,The steps for deploying a monitoring panel can refer to:[Monitoring Panel Deployment](https://timecho.com/docs/UserGuide/latest/Deployment-and-Maintenance/Monitoring-panel-deployment.html)

## Preparation Steps

1. Prepare the IoTDB database installation package: iotdb enterprise- {version}-bin.zip（The installation package can be obtained from:[IoTDB-Package](https://www.timecho.com/docs/UserGuide/latest/Deployment-and-Maintenance/IoTDB-Package_timecho.html)）
2. Configure the operating system environment according to environmental requirements（The system environment configuration can be found in:[Environment Requirements](https://www.timecho.com/docs/UserGuide/latest/Deployment-and-Maintenance/Environment-Requirements.html)）

## Installation Steps

Assuming there are three Linux servers now, the IP addresses and service roles are assigned as follows:

| Node IP     | Host Name | Service              |
| ----------- | --------- | -------------------- |
| 192.168.1.3 | iotdb-1   | ConfigNode、DataNode |
| 192.168.1.4 | iotdb-2   | ConfigNode、DataNode |
| 192.168.1.5 | iotdb-3   | ConfigNode、DataNode |

### 1. Set Host Name

On three machines, configure the host names separately. To set the host names, configure `/etc/hosts` on the target server. Use the following command:

```Bash
echo "192.168.1.3  iotdb-1"  >> /etc/hosts
echo "192.168.1.4  iotdb-2"  >> /etc/hosts
echo "192.168.1.5  iotdb-3"  >> /etc/hosts 
```

### 2. Configuration

Unzip the installation package and enter the installation directory

```Plain
unzip  iotdb-enterprise-{version}-bin.zip
cd  iotdb-enterprise-{version}-bin
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

#### General Configuration

Open the general configuration file `./conf/iotdb-system.properties`,The following parameters can be set according to the deployment method:

| **Configuration**         | **Description**                                              | 192.168.1.3    | 192.168.1.4    | 192.168.1.5    |
| ------------------------- | ------------------------------------------------------------ | -------------- | -------------- | -------------- |
| cluster_name              | Cluster Name                                                 | defaultCluster | defaultCluster | defaultCluster |
| schema_replication_factor | The number of metadata replicas, the number of DataNodes should not be less than this number | 3              | 3              | 3              |
| data_replication_factor   | The number of data replicas should not be less than this number of DataNodes | 2              | 2              | 2              |

#### **ConfigNode Configuration**

Open the ConfigNode configuration file `./conf/iotdb-system.properties`,Set the following parameters

| **Configuration**   | **Description**                                              | **Default**     | **Recommended value**                                        | 192.168.1.3   | 192.168.1.4   | 192.168.1.5   | Note                                     |
| ------------------- | ------------------------------------------------------------ | --------------- | ------------------------------------------------------------ | ------------- | ------------- | ------------- | ---------------------------------------- |
| cn_internal_address | The address used by ConfigNode for communication within the cluster | 127.0.0.1       | The IPV4 address or host name of the server where it is located, and it is recommended to use host name | iotdb-1       | iotdb-2       | iotdb-3       | Cannot be modified after initial startup |
| cn_internal_port    | The port used by ConfigNode for communication within the cluster | 10710           | 10710                                                        | 10710         | 10710         | 10710         | Cannot be modified after initial startup |
| cn_consensus_port   | The port used for ConfigNode replica group consensus protocol communication | 10720           | 10720                                                        | 10720         | 10720         | 10720         | Cannot be modified after initial startup |
| cn_seed_config_node | The address of the ConfigNode that the node connects to when registering to join the cluster, `cn_internal_address:cn_internal_port` | 127.0.0.1:10710 | The first CongfigNode's `cn_internal-address: cn_internal_port` | iotdb-1:10710 | iotdb-1:10710 | iotdb-1:10710 | Cannot be modified after initial startup |

#### DataNode Configuration

Open DataNode Configuration File `./conf/iotdb-system.properties`,Set the following parameters:

| **Configuration**               | **Description**                                              | **Default**     | **Recommended value**                                        | 192.168.1.3   | 192.168.1.4   | 192.168.1.5   | Note                                     |
| ------------------------------- | ------------------------------------------------------------ | --------------- | ------------------------------------------------------------ | ------------- | ------------- | ------------- | ---------------------------------------- |
| dn_rpc_address                  | The address of the client RPC service                        | 0.0.0.0         | 0.0.0.0                                                      | 0.0.0.0       | 0.0.0.0       | 0.0.0.0       | Restarting the service takes effect      |
| dn_rpc_port                     | The port of the client RPC service                           | 6667            | 6667                                                         | 6667          | 6667          | 6667          | Restarting the service takes effect      |
| dn_internal_address             | The address used by DataNode for communication within the cluster | 127.0.0.1       | The IPV4 address or host name of the server where it is located, and it is recommended to use host name | iotdb-1       | iotdb-2       | iotdb-3       | Cannot be modified after initial startup |
| dn_internal_port                | The port used by DataNode for communication within the cluster | 10730           | 10730                                                        | 10730         | 10730         | 10730         | Cannot be modified after initial startup |
| dn_mpp_data_exchange_port       | The port used by DataNode to receive data streams            | 10740           | 10740                                                        | 10740         | 10740         | 10740         | Cannot be modified after initial startup |
| dn_data_region_consensus_port   | The port used by DataNode for data replica consensus protocol communication | 10750           | 10750                                                        | 10750         | 10750         | 10750         | Cannot be modified after initial startup |
| dn_schema_region_consensus_port | The port used by DataNode for metadata replica consensus protocol communication | 10760           | 10760                                                        | 10760         | 10760         | 10760         | Cannot be modified after initial startup |
| dn_seed_config_node             | The ConfigNode address that the node connects to when registering to join the cluster, i.e. `cn_internal-address: cn_internal_port` | 127.0.0.1:10710 | The first CongfigNode's cn_internal-address: cn_internal_port | iotdb-1:10710 | iotdb-1:10710 | iotdb-1:10710 | Cannot be modified after initial startup |

### 3. Start ConfigNode

Start the first confignode of IoTDB-1 first, ensuring that the seed confignode node starts first, and then start the second and third confignode nodes in sequence

```Bash
cd sbin
./start-confignode.sh    -d      #"- d" parameter will start in the background
```

### 4. Activate Database

#### **Method 1: Activate file copy activation**

- After starting three confignode nodes in sequence, copy the `activation` folder of each machine and the `system_info` file of each machine to the Timecho staff;
- The staff will return the license files for each ConfigNode node, where 3 license files will be returned;
- Put the three license files into the `activation` folder of the corresponding ConfigNode node;

#### Method 2: Activate Script Activation

- Obtain the machine codes of three machines in sequence, enter the `sbin` directory of the installation directory, and execute the activation script `start activate.sh`:

    ```Bash
    cd sbin
    ./start-activate.sh
    ```

- The following information is displayed, where the machine code of one machine is displayed:

    ```Bash
    Please copy the system_info's content and send it to Timecho:
    Y17hFA0xRCE1TmkVxILuxxxxxxxxxxxxxxxxxxxxxxxxxxxxW5P52KCccFMVeHTc=
    Please enter license:
    ```

- The other two nodes execute the activation script `start activate.sh` in sequence, and then copy the machine codes of the three machines obtained to the Timecho staff
- The staff will return 3 activation codes, which normally correspond to the order of the provided 3 machine codes. Please paste each activation code into the previous command line prompt `Please enter license:`, as shown below:

    ```Bash
    Please enter license:
    Jw+MmF+Atxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx5bAOXNeob5l+HO5fEMgzrW8OJPh26Vl6ljKUpCvpTiw==
    License has been stored to sbin/../activation/license
    Import completed. Please start cluster and excute 'show cluster' to verify activation status
    ```

### 5. Start DataNode

 Enter the `sbin` directory of iotdb and start three datanode nodes in sequence:

```Go
cd sbin
./start-datanode.sh   -d   #"- d" parameter will start in the background
```

### 6. Verify Deployment

Can be executed directly Cli startup script in `./sbin`  directory:

```Plain
./start-cli.sh  -h  ip(local IP or domain name)  -p  port(6667)
```

   After successful startup, the following interface will appear displaying successful installation of IOTDB.

![](https://alioss.timecho.com/docs/img/%E4%BC%81%E4%B8%9A%E7%89%88%E6%88%90%E5%8A%9F.png)

After the installation success interface appears, continue to check if the activation is successful and use the `show cluster`  command.

When you see the display of `Activated` on the far right, it indicates successful activation.

![](https://alioss.timecho.com/docs/img/%E4%BC%81%E4%B8%9A%E7%89%88%E6%BF%80%E6%B4%BB.png)


> The appearance of `ACTIVATED (W)` indicates passive activation, which means that this Configurable Node does not have a license file (or has not issued the latest license file with a timestamp), and its activation depends on other Activated Configurable Nodes in the cluster. At this point, it is recommended to check if the license file has been placed in the license folder. If not, please place the license file. If a license file already exists, it may be due to inconsistency between the license file of this node and the information of other nodes. Please contact Tianmu staff to reapply.


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

Parameter introduction:

| Parameter | Description                                           | Is it required |
| :--- | :--------------------------------------------- | :----------- |
| -v   | Show version information                                   | No           |
| -f   | Run the script in the foreground, do not put it in the background                 | No           |
| -d   | Start in daemon mode, i.e. run in the background               | No           |
| -p   | Specify a file to store the process ID for process management         | No           |
| -c   | Specify the path to the configuration file folder, the script will load the configuration file from here | No           |
| -g   | Print detailed garbage collection (GC) information                   | No           |
| -H   | Specify the path of the Java heap dump file, used when JVM memory overflows  | No           |
| -E   | Specify the path of the JVM error log file                      | No           |
| -D   | Define system properties, in the format key=value                 | No           |
| -X   | Pass -XX parameters directly to the JVM                        | No           |
| -h   | Help instruction                                       | No           |

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
or
./sbin/remove-confignode.sh [cn_internal_address:cn_internal_port]

#Windows
sbin/remove-confignode.bat [confignode_id]
or
./sbin/remove-confignode.bat [cn_internal_address:cn_internal_port]
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

Parameter introduction:

| Abbreviation | Description                                           | Is it required |
| :--- | :--------------------------------------------- | :----------- |
| -v   | Show version information                                   | No           |
| -f   | Run the script in the foreground, do not put it in the background                 | No           |
| -d   | Start in daemon mode, i.e. run in the background               | No           |
| -p   | Specify a file to store the process ID for process management         | No           |
| -c   | Specify the path to the configuration file folder, the script will load the configuration file from here | No           |
| -g   | Print detailed garbage collection (GC) information                   | No           |
| -H   | Specify the path of the Java heap dump file, used when JVM memory overflows  | No           |
| -E   | Specify the path of the JVM error log file                      | No           |
| -D   | Define system properties, in the format key=value                 | No           |
| -X   | Pass -XX parameters directly to the JVM                        | No           |
| -h   | Help instruction                                       | No           |

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
sbin/remove-datanode.sh [dn_rpc_address:dn_rpc_port]

#Windows
sbin/remove-datanode.bat [dn_rpc_address:dn_rpc_port]
```