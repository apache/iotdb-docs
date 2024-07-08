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

This section will take the IoTDB classic cluster deployment architecture 3C3D (3 ConfigNodes and 3 DataNodes) as an example to introduce how to deploy a cluster, commonly known as the 3C3D cluster. The architecture diagram of the 3C3D cluster is as follows:

![](https://alioss.timecho.com/docs/img/20240705141552.png)

## Note

1. It is recommended to prioritize using `hostname` for IP configuration during deployment, which can avoid the problem of modifying the host IP in the later stage and causing the database to fail to start. To set the host name, you need to configure /etc/hosts on the target server. For example, if the local IP is 192.168.1.3 and the host name is iotdb-1, you can use the following command to set the server's host name and configure the `cn_internal_address` and `dn_internal_address` of IoTDB using the host name.

   ``` shell
   echo "192.168.1.3  iotdb-1" >> /etc/hosts 
   ```

2. Some parameters cannot be modified after the first startup. Please refer to the "Parameter Configuration" section below for settings.

## Preparation Steps

1. Prepare the IoTDB database installation package:：apache-iotdb-{version}-all-bin.zip（Please refer to the installation package for details：[IoTDB-Package](https://iotdb.apache.org/UserGuide/latest/Deployment-and-Maintenance/IoTDB-Package.html)）

2. Configure the operating system environment according to environmental requirements (system environment configuration can be found in:[Database Resources](https://iotdb.apache.org/UserGuide/latest/Deployment-and-Maintenance/Database-Resources.html))

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
unzip  apache-iotdb-{version}-all-bin.zip 
cd  apache-iotdb-{version}-all-bin
```

#### Environment Script Configuration

- `./conf/confignode-env.sh` configuration

| **配置项**  | **Description**                                              | **Default** | **Recommended value**                                        | **Note**                            |
| :---------- | :----------------------------------------------------------- | :---------- | :----------------------------------------------------------- | :---------------------------------- |
| MEMORY_SIZE | The total amount of memory that IoTDB ConfigNode nodes can use | -           | Can be filled in as needed, and the system will allocate memory based on the filled in values | Restarting the service takes effect |

- `./conf/datanode-env.sh` configuration

| **Configuration** | **Description**                                              | **Default** | **Recommended value**                                        | **Note**                            |
| :---------------- | :----------------------------------------------------------- | :---------- | :----------------------------------------------------------- | :---------------------------------- |
| MEMORY_SIZE       | The total amount of memory that IoTDB DataNode nodes can use | -           | Can be filled in as needed, and the system will allocate memory based on the filled in values | Restarting the service takes effect |

#### General Configuration

Open the general configuration file `./conf/iotdb-common.properties`， The following parameters can be set according to the deployment method:

| **Configuration**         | **Description**                                              | 192.168.1.3    | 192.168.1.4    | 192.168.1.5    |
| ------------------------- | ------------------------------------------------------------ | -------------- | -------------- | -------------- |
| cluster_name              | Cluster Name                                                 | defaultCluster | defaultCluster | defaultCluster |
| schema_replication_factor | The number of metadata replicas, the number of DataNodes should not be less than this number | 3              | 3              | 3              |
| data_replication_factor   | The number of data replicas should not be less than this number of DataNodes | 2              | 2              | 2              |

#### ConfigNode Configuration

Open the ConfigNode configuration file `./conf/iotdb-confignode.properties`， Set the following parameters

| **Configuration**   | **Description**                                              | **Default**     | **Recommended value**                                        | 192.168.1.3   | 192.168.1.4   | 192.168.1.5   | Note                                     |
| ------------------- | ------------------------------------------------------------ | --------------- | ------------------------------------------------------------ | ------------- | ------------- | ------------- | ---------------------------------------- |
| cn_internal_address | The address used by ConfigNode for communication within the cluster | 127.0.0.1       | The IPV4 address or host name of the server where it is located, and it is recommended to use host name | iotdb-1       | iotdb-2       | iotdb-3       | Cannot be modified after initial startup |
| cn_internal_port    | The port used by ConfigNode for communication within the cluster | 10710           | 10710                                                        | 10710         | 10710         | 10710         | Cannot be modified after initial startup |
| cn_consensus_port   | The port used for ConfigNode replica group consensus protocol communication | 10720           | 10720                                                        | 10720         | 10720         | 10720         | Cannot be modified after initial startup |
| cn_seed_config_node | The address of the ConfigNode that the node connects to when registering to join the cluster, `cn_internal_address:cn_internal_port` | 127.0.0.1:10710 | The first CongfigNode's `cn_internal-address: cn_internal_port` | iotdb-1:10710 | iotdb-1:10710 | iotdb-1:10710 | Cannot be modified after initial startup |

#### DataNode Configuration

Open DataNode Configuration File `./conf/iotdb-datanode.properties`,Set the following parameters:

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

### 4. Start DataNode

 Enter the `sbin` directory of iotdb and start three datanode nodes in sequence:

```Bash
cd sbin
./start-datanode.sh   -d   #"- d" parameter will start in the background
```

### 5. Verify Deployment

Can be executed directly Cli startup script in `./sbin`  directory:

```Plain
./start-cli.sh  -h  ip(local IP or domain name)  -p  port(6667)
```

After successful startup, the following interface will appear displaying successful installation of IOTDB.

![](https://alioss.timecho.com/docs/img/%E5%BC%80%E6%BA%90%E6%88%90%E5%8A%9F.png)

You can use the `show cluster` command to view cluster information:

![](https://alioss.timecho.com/docs/img/%E5%BC%80%E6%BA%90%E7%89%88%20show%20cluter.png)

