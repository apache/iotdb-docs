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

# ConfigNode Configuration

IoTDB ConfigNode files are under `conf`.

* `confignode-env.sh/bat`：Environment configurations, in which we could set the memory allocation of ConfigNode.

* `iotdb-system.properties`：IoTDB system configurations.

## Environment Configuration File（confignode-env.sh/bat）

The environment configuration file is mainly used to configure the Java environment related parameters when ConfigNode is running, such as JVM related configuration. This part of the configuration is passed to the JVM when the ConfigNode starts.

The details of each parameter are as follows:

* MEMORY\_SIZE

|Name|MEMORY\_SIZE|
|:---:|:---|
|Description|The memory size that IoTDB ConfigNode will use when startup |
|Type|String|
|Default|The default is three-tenths of the memory, with a maximum of 16G.|
|Effective|After restarting system|

* ON\_HEAP\_MEMORY

|Name|ON\_HEAP\_MEMORY|
|:---:|:---|
|Description|The heap memory size that IoTDB ConfigNode can use, Former Name: MAX\_HEAP\_SIZE |
|Type|String|
|Default| Calculate based on MEMORY\_SIZE.|
|Effective|After restarting system|

* OFF\_HEAP\_MEMORY

|Name|OFF\_HEAP\_MEMORY|
|:---:|:---|
|Description|The direct memory that IoTDB ConfigNode can use, Former Name: MAX\_DIRECT\_MEMORY\_SIZE |
|Type|String|
|Default| Calculate based on MEMORY\_SIZE.|
|Effective|After restarting system|


## ConfigNode Configuration File (iotdb-system.properties)

The global configuration of cluster is in ConfigNode.

### Config Node RPC Configuration

* cn\_internal\_address

|    Name     | cn\_internal\_address               |
|:-----------:|:------------------------------------|
| Description | ConfigNode internal service address |
|    Type     | String                              |
|   Default   | 127.0.0.1                           |
|  Effective  | Only allowed to be modified in first start up             |

* cn\_internal\_port

|Name| cn\_internal\_port |
|:---:|:---|
|Description| ConfigNode internal service port|
|Type| Short Int : [0,65535] |
|Default| 10710 |
|Effective|Only allowed to be modified in first start up|

### Consensus

* cn\_consensus\_port

|Name| cn\_consensus\_port |
|:---:|:---|
|Description| ConfigNode data Consensus Port  |
|Type| Short Int : [0,65535] |
|Default| 10720 |
|Effective|Only allowed to be modified in first start up|

### Target Config Nodes

* cn\_seed\_config\_node

|Name| cn\_seed\_config\_node                                        |
|:---:|:----------------------------------------------------------------------|
|Description| Target ConfigNode address, for current ConfigNode to join the cluster |
|Type| String                                                                |
|Default| 127.0.0.1:10710                                                       |
|Effective| Only allowed to be modified in first start up                                               |

### Directory configuration

* cn\_system\_dir

|Name| cn\_system\_dir |
|:---:|:---|
|Description| ConfigNode system data dir |
|Type| String |
|Default| data/system（Windows：data\\system） |
|Effective|After restarting system|

* cn\_consensus\_dir

|Name| cn\_consensus\_dir                                             |
|:---:|:---------------------------------------------------------------|
|Description| ConfigNode Consensus protocol data dir                         |
|Type| String                                                         |
|Default| data/confignode/consensus（Windows：data\\confignode\\consensus） |
|Effective| After restarting system                                        |

### Thrift RPC configuration

* cn\_rpc\_thrift\_compression\_enable

|Name| cn\_rpc\_thrift\_compression\_enable |
|:---:|:---|
|Description| Whether enable thrift's compression (using GZIP).|
|Type|Boolean|
|Default| false |
|Effective|After restarting system|

* cn\_rpc\_thrift\_compression\_enable

|Name| cn\_rpc\_thrift\_compression\_enable |
|:---:|:---|
|Description| Whether enable thrift's compression (using GZIP).|
|Type|Boolean|
|Default| false |
|Effective|After restarting system|

* cn\_rpc\_advanced\_compression\_enable

|Name| cn\_rpc\_advanced\_compression\_enable |
|:---:|:---|
|Description| Whether enable thrift's advanced compression.|
|Type|Boolean|
|Default| false |
|Effective|After restarting system|

* cn\_rpc\_max\_concurrent\_client\_num

|Name| cn\_rpc\_max\_concurrent\_client\_num |
|:---:|:---|
|Description| Max concurrent rpc connections|
|Type| Short Int : [0,65535] |
|Description| 65535 |
|Effective|After restarting system|

* cn\_thrift\_max\_frame\_size

|Name| cn\_thrift\_max\_frame\_size |
|:---:|:---|
|Description| Max size of bytes of each thrift RPC request/response|
|Type| Long |
|Unit|Byte|
|Default| 536870912 |
|Effective|After restarting system|

* cn\_thrift\_init\_buffer\_size

|Name| cn\_thrift\_init\_buffer\_size |
|:---:|:---|
|Description| Initial size of bytes of buffer that thrift used |
|Type| long |
|Default| 1024 |
|Effective|After restarting system|

* cn\_connection\_timeout\_ms

|    Name     | cn\_connection\_timeout\_ms                            |
|:-----------:|:-------------------------------------------------------|
| Description | Thrift socket and connection timeout between nodes     |
|    Type     | int                                                    |
|   Default   | 60000                                                  |
|  Effective  | After restarting system                                |

* cn\_selector\_thread\_nums\_of\_client\_manager

|    Name     | cn\_selector\_thread\_nums\_of\_client\_manager                                |
|:-----------:|:-------------------------------------------------------------------------------|
| Description | selector thread (TAsyncClientManager) nums for async thread in a clientManager |
|    Type     | int                                                                            |
|   Default   | 1                                                                              |
|  Effective  | After restarting system                                                        |

* cn\_core\_client\_count\_for\_each\_node\_in\_client\_manager

|     Name     | cn\_core\_client\_count\_for\_each\_node\_in\_client\_manager  |
|:------------:|:---------------------------------------------------------------|
| Description  | Number of core clients routed to each node in a ClientManager  |
|     Type     | int                                                            |
|   Default    | 200                                                            |
|  Effective   | After restarting system                                        |

* cn\_max\_client\_count\_for\_each\_node\_in\_client\_manager

|      Name      | cn\_max\_client\_count\_for\_each\_node\_in\_client\_manager |
|:--------------:|:-------------------------------------------------------------|
|  Description   | Number of max clients routed to each node in a ClientManager |
|      Type      | int                                                          |
|    Default     | 300                                                          |
|   Effective    | After restarting system                                      |

### Metric Configuration
