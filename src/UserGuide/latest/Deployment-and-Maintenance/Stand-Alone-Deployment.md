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

## Matters Needing Attention
1. Before installation, ensure that the system is complete by referring to [System configuration](.\Environment-Requirements.md).

2. It is recommended to prioritize using 'hostname' for IP configuration during deployment, which can avoid the problem of modifying the host IP in the later stage and causing the database to fail to start. To set the host name, you need to configure/etc/hosts on the target server. For example, if the local IP is 192.168.1.3 and the host name is iotdb-1, you can use the following command to set the server's host name and configure IoTDB's' cn_internal-address' using the host name dn_internal_address、dn_rpc_address.

   ``` Shell
   echo "192.168.1.3  iotdb-1" >> /etc/hosts 
   ```

3. Some parameters cannot be modified after the first startup. Please refer to the "Parameter Configuration" section below for settings.

4. Whether in linux or windows, ensure that the IoTDB installation path does not contain Spaces and Chinese characters to avoid software exceptions.

## Installation Steps

### Unzip the installation package and enter the installation directory

```Shell
unzip  apache-iotdb-{version}-all-bin.zip
cd  apache-iotdb-{version}-all-bin
```

### Parameter Configuration

#### Environment Script Configuration

- ./conf/confignode env.sh (./conf/confignode env.bat) configuration

| **Configuration** |                       **Description**                        | **Default** |                    **Recommended value**                     |                Note                 |
| :---------------: | :----------------------------------------------------------: | :---------: | :----------------------------------------------------------: | :---------------------------------: |
|    MEMORY_SIZE    | The total amount of memory that IoTDB ConfigNode nodes can use |    empty    | Can be filled in as needed, and the system will allocate memory based on the filled in values | Restarting the service takes effect |

- ./conf/datanode-env.sh（./conf/datanode-env.bat）configuration

| **Configuration** |                       **Description**                        | **Default** |                    **Recommended value**                     |                Note                 |
| :---------------: | :----------------------------------------------------------: | :---------: | :----------------------------------------------------------: | :---------------------------------: |
|    MEMORY_SIZE    | The total amount of memory that IoTDB DataNode nodes can use |    empty    | Can be filled in as needed, and the system will allocate memory based on the filled in values | Restarting the service takes effect |

#### System General Configuration

Open the general configuration file (./conf/iotdb common. properties file) and set the following parameters:

|     **Configuration**     |                       **Description**                        |  **Default**   |                    **Recommended value**                     |                         Note                          |
| :-----------------------: | :----------------------------------------------------------: | :------------: | :----------------------------------------------------------: | :---------------------------------------------------: |
|       cluster_name        |                         Cluster Name                         | defaultCluster | The cluster name can be set as needed, and if there are no special needs, the default can be kept |       Cannot be modified after initial startup        |
| schema_replication_factor | Number of metadata replicas, set to 1 for the standalone version here |       1        |                              1                               | Default 1, cannot be modified after the first startup |
|  data_replication_factor  | Number of data replicas, set to 1 for the standalone version here |       1        |                              1                               | Default 1, cannot be modified after the first startup |

#### ConfigNode Configuration

Open the ConfigNode configuration file (./conf/iotdb configure. properties file) and set the following parameters:

|  **Configuration**  |                       **Description**                        |   **Default**   |                    **Recommended value**                     |                   Note                   |
| :-----------------: | :----------------------------------------------------------: | :-------------: | :----------------------------------------------------------: | :--------------------------------------: |
| cn_internal_address | The address used by ConfigNode for communication within the cluster |    127.0.0.1    | The IPV4 address or host name of the server where it is located, and it is recommended to use host name | Cannot be modified after initial startup |
|  cn_internal_port   | The port used by ConfigNode for communication within the cluster |      10710      |                            10710                             | Cannot be modified after initial startup |
|  cn_consensus_port  | The port used for ConfigNode replica group consensus protocol communication |      10720      |                            10720                             | Cannot be modified after initial startup |
| cn_seed_config_node | The address of the ConfigNode that the node connects to when registering to join the cluster, cn_internal_address:cn_internal_port | 127.0.0.1:10710 |             cn_internal_address:cn_internal_port             | Cannot be modified after initial startup |

#### DataNode Configuration

Open the DataNode configuration file/ conf/iotdb-system.properties,Set the following parameters:

|        **Configuration**        |                       **Description**                        |   **Default**   |                    **Recommended value**                     | **Note**                                 |
| :-----------------------------: | :----------------------------------------------------------: | :-------------: | :----------------------------------------------------------: | :--------------------------------------- |
|         dn_rpc_address          |            The address of the client RPC service             |     0.0.0.0     | The IPV4 address or host name of the server where it is located, and it is recommended to use host name | Restarting the service takes effect      |
|           dn_rpc_port           |              The port of the client RPC service              |      6667       |                             6667                             | Restarting the service takes effect      |
|       dn_internal_address       | The address used by DataNode for communication within the cluster |    127.0.0.1    | The IPV4 address or host name of the server where it is located, and it is recommended to use host name | Cannot be modified after initial startup |
|        dn_internal_port         | The port used by DataNode for communication within the cluster |      10730      |                            10730                             | Cannot be modified after initial startup |
|    dn_mpp_data_exchange_port    |      The port used by DataNode to receive data streams       |      10740      |                            10740                             | Cannot be modified after initial startup |
|  dn_data_region_consensus_port  | The port used by DataNode for data replica consensus protocol communication |      10750      |                            10750                             | Cannot be modified after initial startup |
| dn_schema_region_consensus_port | The port used by DataNode for metadata replica consensus protocol communication |      10760      |                            10760                             | Cannot be modified after initial startup |
|       dn_seed_config_node       | The ConfigNode address that the node connects to when registering to join the cluster, i.e. cn_internal-address: cn_internal_port | 127.0.0.1:10710 |             cn_internal_address:cn_internal_port             | Cannot be modified after initial startup |

### Start ConfigNode

Enter the sbin directory of iotdb and start confignode

```Shell
./start-confignode.sh    -d      #The "- d" parameter will start in the background 
```

### Start DataNode

Enter the sbin directory of iotdb and start datanode:

```Shell
cd sbin
./start-datanode.sh   -d   #The "- d" parameter will start in the background 
```

### Verify Deployment

Can be executed directly/ Cli startup script in sbin directory:

```Shell
./start-cli.sh  -h  ip(local IP or domain name)  -p  port(6667)
```

After successful startup, the following interface will appear displaying successful installation of IOTDB.

![](https://alioss.timecho.com/docs/img/%E5%BC%80%E6%BA%90%E7%89%88%E5%90%AF%E5%8A%A8%E6%88%90%E5%8A%9F.png)

After the successful installation interface appears, use the `show cluster` command to check the service running status

When the status is all running, it indicates that the service has started successfully

![](https://alioss.timecho.com/docs/img/%E5%BC%80%E6%BA%90-%E5%8D%95%E6%9C%BAshow.jpeg)

> The appearance of 'Activated (W)' indicates passive activation, indicating that this Config Node does not have a license file (or has not issued the latest license file with a timestamp). At this point, it is recommended to check if the license file has been placed in the license folder. If not, please place the license file. If a license file already exists, it may be due to inconsistency between the license file of this node and the information of other nodes. Please contact Tianmu staff to reapply.