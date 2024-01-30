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

# Deployment Guide

## Stand-Alone Deployment

This short guide will walk you through the basic process of using IoTDB. For a more-complete guide, please visit our website's [User Guide](../IoTDB-Introduction/What-is-IoTDB.md).

### Prerequisites

To use IoTDB, you need to have:

1. Java >= 1.8 (Please make sure the environment path has been set)
2. Set the max open files num as 65535 to avoid "too many open files" problem.

### Installation

IoTDB provides you three installation methods, you can refer to the following suggestions, choose one of them:

* Installation from source code. If you need to modify the code yourself, you can use this method.
* Installation from binary files. Download the binary files from the official website. This is the recommended method, in which you will get a binary released package which is out-of-the-box.
* Using Docker：The path to the dockerfile is [github](https://github.com/apache/iotdb/blob/master/docker/src/main)


### Download

You can download the binary file from:
[Download Page](https://iotdb.apache.org/Download/)

### Configurations

Configuration files are under "conf" folder

* environment config module (`datanode-env.bat`, `datanode-env.sh`),
* system config module (`iotdb-datanode.properties`)
* log config module (`logback.xml`).

For more, see [Config](../Reference/DataNode-Config-Manual.md) in detail.

### Start

You can go through the following step to test the installation, if there is no error after execution, the installation is completed.

#### Start IoTDB

IoTDB is a database based on distributed system. To launch IoTDB, you can first start standalone mode (i.e. 1 ConfigNode and 1 DataNode) to check.

Users can start IoTDB standalone mode by the start-standalone script under the sbin folder.

```
# Unix/OS X
> bash sbin/start-standalone.sh
```

```
# Windows
> sbin\start-standalone.bat
```

## Cluster Deployment
This article uses a local environment as an example to
illustrate how to start, expand, and shrink an IoTDB Cluster.

**Notice: This document is a tutorial for deploying in a pseudo-cluster environment using different local ports, and is for exercise only. In real deployment scenarios, you only need to configure the IPV4 address or domain name of the server, and do not need to change the Node ports.**

### 1. Prepare the Start Environment

Unzip the apache-iotdb-1.0.0-all-bin.zip file to cluster0 folder.

### 2. Start a Minimum Cluster

Start the Cluster version with one ConfigNode and one DataNode(1C1D), and
the default number of replicas is one.

```
./cluster0/sbin/start-confignode.sh
./cluster0/sbin/start-datanode.sh
```

### 3. Verify the Minimum Cluster

+ If everything goes well, the minimum cluster will start successfully. Then, we can start the Cli for verification.

```
./cluster0/sbin/start-cli.sh
```

+ Execute the `show cluster details`
  command on the Cli. The result is shown below:

```
IoTDB> show cluster details
+------+----------+-------+---------------+------------+-------------------+----------+-------+--------+-------------------+-----------------+
|NodeID|  NodeType| Status|InternalAddress|InternalPort|ConfigConsensusPort|RpcAddress|RpcPort|MppPort |SchemaConsensusPort|DataConsensusPort|
+------+----------+-------+---------------+------------+-------------------+----------+-------+--------+-------------------+-----------------+
|     0|ConfigNode|Running|      127.0.0.1|       10710|              10720|          |       |        |                   |                 |
|     1|  DataNode|Running|      127.0.0.1|       10730|                   | 127.0.0.1|   6667|   10740|              10750|            10760|
+------+----------+-------+---------------+------------+-------------------+----------+-------+--------+-------------------+-----------------+
Total line number = 2
It costs 0.242s
```

### 4. Prepare the Expanding Environment

Unzip the apache-iotdb-1.0.0-all-bin.zip file to cluster1 and cluster2 folder.

### 5. Modify the Node Configuration file

For folder cluster1:

+ Modify ConfigNode configurations:

| **configuration item**         | **value**       |
| ------------------------------ | --------------- |
| cn\_internal\_address          | 127.0.0.1       |
| cn\_internal\_port             | 10711           |
| cn\_consensus\_port            | 10721           |
| cn\_target\_config\_node\_list | 127.0.0.1:10710 |

+ Modify DataNode configurations:

| **configuration item**              | **value**       |
| ----------------------------------- | --------------- |
| dn\_rpc\_address                    | 127.0.0.1       |
| dn\_rpc\_port                       | 6668            |
| dn\_internal\_address               | 127.0.0.1       |
| dn\_internal\_port                  | 10731           |
| dn\_mpp\_data\_exchange\_port       | 10741           |
| dn\_schema\_region\_consensus\_port | 10751           |
| dn\_data\_region\_consensus\_port   | 10761           |
| dn\_target\_config\_node\_list      | 127.0.0.1:10710 |

For folder cluster2:

+ Modify ConfigNode configurations:

| **configuration item**         | **value**       |
| ------------------------------ | --------------- |
| cn\_internal\_address          | 127.0.0.1       |
| cn\_internal\_port             | 10712           |
| cn\_consensus\_port            | 10722           |
| cn\_target\_config\_node\_list | 127.0.0.1:10710 |

+ Modify DataNode configurations:

| **configuration item**              | **value**       |
| ----------------------------------- | --------------- |
| dn\_rpc\_address                    | 127.0.0.1       |
| dn\_rpc\_port                       | 6669            |
| dn\_internal\_address               | 127.0.0.1       |
| dn\_internal\_port                  | 10732           |
| dn\_mpp\_data\_exchange\_port       | 10742           |
| dn\_schema\_region\_consensus\_port | 10752           |
| dn\_data\_region\_consensus\_port   | 10762           |
| dn\_target\_config\_node\_list      | 127.0.0.1:10710 |

### 6. Expanding the Cluster

Expanding the Cluster to three ConfigNode and three DataNode(3C3D).
The following commands can be executed in arbitrary order.

```
./cluster1/sbin/start-confignode.sh
./cluster1/sbin/start-datanode.sh
./cluster2/sbin/start-confignode.sh
./cluster2/sbin/start-datanode.sh
```

### 7. Verify Cluster expansion

Execute the `show cluster details` command, then the result is shown below:

```
IoTDB> show cluster details
+------+----------+-------+---------------+------------+-------------------+----------+-------+-------+-------------------+-----------------+
|NodeID|  NodeType| Status|InternalAddress|InternalPort|ConfigConsensusPort|RpcAddress|RpcPort|MppPort|SchemaConsensusPort|DataConsensusPort|
+------+----------+-------+---------------+------------+-------------------+----------+-------+-------+-------------------+-----------------+
|     0|ConfigNode|Running|      127.0.0.1|       10710|              10720|          |       |       |                   |                 |
|     2|ConfigNode|Running|      127.0.0.1|       10711|              10721|          |       |       |                   |                 |
|     3|ConfigNode|Running|      127.0.0.1|       10712|              10722|          |       |       |                   |                 |
|     1|  DataNode|Running|      127.0.0.1|       10730|                   | 127.0.0.1|   6667|  10740|              10750|            10760|
|     4|  DataNode|Running|      127.0.0.1|       10731|                   | 127.0.0.1|   6668|  10741|              10751|            10761|
|     5|  DataNode|Running|      127.0.0.1|       10732|                   | 127.0.0.1|   6669|  10742|              10752|            10762|
+------+----------+-------+---------------+------------+-------------------+----------+-------+-------+-------------------+-----------------+
Total line number = 6
It costs 0.012s
```

### 8. Shrinking the Cluster

+ Remove a ConfigNode:

```
# Removing by ip:port
./cluster0/sbin/remove-confignode.sh 127.0.0.1:10711

# Removing by Node index
./cluster0/sbin/remove-confignode.sh 2
```

+ Remove a DataNode:

```
# Removing by ip:port
./cluster0/sbin/remove-datanode.sh 127.0.0.1:6668

# Removing by Node index
./cluster0/sbin/remove-confignode.sh 4
```

### 9. Verify Cluster shrinkage

Execute the `show cluster details` command, then the result is shown below:

```
IoTDB> show cluster details
+------+----------+-------+---------------+------------+-------------------+----------+-------+-------+-------------------+-----------------+
|NodeID|  NodeType| Status|InternalAddress|InternalPort|ConfigConsensusPort|RpcAddress|RpcPort|MppPort|SchemaConsensusPort|DataConsensusPort|
+------+----------+-------+---------------+------------+-------------------+----------+-------+-------+-------------------+-----------------+
|     0|ConfigNode|Running|      127.0.0.1|       10710|              10720|          |       |       |                   |                 |
|     3|ConfigNode|Running|      127.0.0.1|       10712|              10722|          |       |       |                   |                 |
|     1|  DataNode|Running|      127.0.0.1|       10730|                   | 127.0.0.1|   6667|  10740|              10750|            10760|
|     5|  DataNode|Running|      127.0.0.1|       10732|                   | 127.0.0.1|   6669|  10742|              10752|            10762|
+------+----------+-------+---------------+------------+-------------------+----------+-------+-------+-------------------+-----------------+
Total line number = 4
It costs 0.005s
```

## Manual Deployment
### Prerequisites

1. JDK>=1.8.
2. Max open file 65535.
3. Disable the swap memory.
4. Ensure that data/confignode directory has been cleared when starting ConfigNode for the first time,
    and data/datanode directory has been cleared when starting DataNode for the first time
5. Turn off the firewall of the server if the entire cluster is in a trusted environment.
6. By default, IoTDB Cluster will use ports 10710, 10720 for the ConfigNode and 
    6667, 10730, 10740, 10750 and 10760 for the DataNode. 
    Please make sure those ports are not occupied, or you will modify the ports in configuration files. 

### Get the Installation Package

You can either download the binary release files (see Chap 3.1) or compile with source code (see Chap 3.2).

#### Download the binary distribution

1. Open our website [Download Page](https://iotdb.apache.org/Download/).
2. Download the binary distribution.
3. Decompress to get the apache-iotdb-1.0.0-all-bin directory.

#### Compile with source code

##### Download the source code

**Git**

```
git clone https://github.com/apache/iotdb.git
git checkout v1.0.0
```

**Website**

1. Open our website [Download Page](https://iotdb.apache.org/Download/).
2. Download the source code.
3. Decompress to get the apache-iotdb-1.0.0 directory.

##### Compile source code

Under the source root folder:

```
mvn clean package -pl distribution -am -DskipTests
```

Then you will get the binary distribution under 
**distribution/target/apache-iotdb-1.0.0-SNAPSHOT-all-bin/apache-iotdb-1.0.0-SNAPSHOT-all-bin**.

### Binary Distribution Content

| **Folder** | **Description**                                              |
| ---------- | ------------------------------------------------------------ |
| conf       | Configuration files folder, contains configuration files of ConfigNode, DataNode, JMX and logback |
| data       | Data files folder, contains data files of ConfigNode and DataNode |
| lib        | Jar files folder                                             |
| licenses   | Licenses files folder                                        |
| logs       | Logs files folder, contains logs files of ConfigNode and DataNode |
| sbin       | Shell files folder, contains start/stop/remove shell of ConfigNode and DataNode, cli shell |
| tools      | System tools                                                 |

### Cluster Installation and Configuration

#### Cluster Installation

`apache-iotdb-1.0.0-SNAPSHOT-all-bin` contains both the ConfigNode and the DataNode. 
Please deploy the files to all servers of your target cluster. 
A best practice is deploying the files into the same directory in all servers.

If you want to try the cluster mode on one server, please read 
[Cluster Quick Start](https://iotdb.apache.org/UserGuide/Master/QuickStart/ClusterQuickStart.html).

#### Cluster Configuration

We need to modify the configurations on each server.
Therefore, login each server and switch the working directory to `apache-iotdb-1.0.0-SNAPSHOT-all-bin`.
The configuration files are stored in the `./conf` directory.

For all ConfigNode servers, we need to modify the common configuration (see Chap 5.2.1) 
and ConfigNode configuration (see Chap 5.2.2).

For all DataNode servers, we need to modify the common configuration (see Chap 5.2.1) 
and DataNode configuration (see Chap 5.2.3).

##### Common configuration

Open the common configuration file ./conf/iotdb-common.properties,
and set the following parameters base on the 
[Deployment Recommendation](./Deployment-Recommendation.md):

| **Configuration**                          | **Description**                                              | **Default**                                     |
| ------------------------------------------ | ------------------------------------------------------------ | ----------------------------------------------- |
| cluster\_name                              | Cluster name for which the Node to join in                   | defaultCluster                                  |
| config\_node\_consensus\_protocol\_class   | Consensus protocol of ConfigNode                             | org.apache.iotdb.consensus.ratis.RatisConsensus |
| schema\_replication\_factor                | Schema replication factor, no more than DataNode number      | 1                                               |
| schema\_region\_consensus\_protocol\_class | Consensus protocol of schema replicas                        | org.apache.iotdb.consensus.ratis.RatisConsensus |
| data\_replication\_factor                  | Data replication factor, no more than DataNode number        | 1                                               |
| data\_region\_consensus\_protocol\_class   | Consensus protocol of data replicas. Note that RatisConsensus currently does not support multiple data directories | org.apache.iotdb.consensus.iot.IoTConsensus     |

**Notice: The preceding configuration parameters cannot be changed after the cluster is started. Ensure that the common configurations of all Nodes are the same. Otherwise, the Nodes cannot be started.**

##### ConfigNode configuration

Open the ConfigNode configuration file ./conf/iotdb-confignode.properties,
and set the following parameters based on the IP address and available port of the server or VM:

| **Configuration**              | **Description**                                              | **Default**     | **Usage**                                                    |
| ------------------------------ | ------------------------------------------------------------ | --------------- | ------------------------------------------------------------ |
| cn\_internal\_address          | Internal rpc service address of ConfigNode                   | 127.0.0.1       | Set to the IPV4 address or domain name of the server         |
| cn\_internal\_port             | Internal rpc service port of ConfigNode                      | 10710           | Set to any unoccupied port                                   |
| cn\_consensus\_port            | ConfigNode replication consensus protocol communication port | 10720           | Set to any unoccupied port                                   |
| cn\_target\_config\_node\_list | ConfigNode address to which the node is connected when it is registered to the cluster. Note that Only one ConfigNode can be configured. | 127.0.0.1:10710 | For Seed-ConfigNode, set to its own cn\_internal\_address:cn\_internal\_port; For other ConfigNodes, set to other one running ConfigNode's cn\_internal\_address:cn\_internal\_port |

**Notice: The preceding configuration parameters cannot be changed after the node is started. Ensure that all ports are not occupied. Otherwise, the Node cannot be started.**

##### DataNode configuration

Open the DataNode configuration file ./conf/iotdb-datanode.properties,
and set the following parameters based on the IP address and available port of the server or VM:

| **Configuration**                   | **Description**                                  | **Default**     | **Usage**                                                    |
| ----------------------------------- | ------------------------------------------------ | --------------- | ------------------------------------------------------------ |
| dn\_rpc\_address                    | Client RPC Service address                       | 127.0.0.1       | Set to the IPV4 address or domain name of the server         |
| dn\_rpc\_port                       | Client RPC Service port                          | 6667            | Set to any unoccupied port                                   |
| dn\_internal\_address               | Control flow address of DataNode inside cluster  | 127.0.0.1       | Set to the IPV4 address or domain name of the server         |
| dn\_internal\_port                  | Control flow port of DataNode inside cluster     | 10730           | Set to any unoccupied port                                   |
| dn\_mpp\_data\_exchange\_port       | Data flow port of DataNode inside cluster        | 10740           | Set to any unoccupied port                                   |
| dn\_data\_region\_consensus\_port   | Data replicas communication port for consensus   | 10750           | Set to any unoccupied port                                   |
| dn\_schema\_region\_consensus\_port | Schema replicas communication port for consensus | 10760           | Set to any unoccupied port                                   |
| dn\_target\_config\_node\_list      | Running ConfigNode of the Cluster                | 127.0.0.1:10710 | Set to any running ConfigNode's cn\_internal\_address:cn\_internal\_port. You can set multiple values, separate them with commas(",") |

**Notice: The preceding configuration parameters cannot be changed after the node is started. Ensure that all ports are not occupied. Otherwise, the Node cannot be started.**

### Cluster Operation

#### Starting the cluster

This section describes how to start a cluster that includes several ConfigNodes and DataNodes.
The cluster can provide services only by starting at least one ConfigNode
and no less than the number of data/schema_replication_factor DataNodes.

The total process are three steps:

* Start the Seed-ConfigNode
* Add ConfigNode (Optional)
* Add DataNode

##### Start the Seed-ConfigNode

**The first Node started in the cluster must be ConfigNode. The first started ConfigNode must follow the tutorial in this section.**

The first ConfigNode to start is the Seed-ConfigNode, which marks the creation of the new cluster.
Before start the Seed-ConfigNode, please open the common configuration file ./conf/iotdb-common.properties and check the following parameters:

| **Configuration**                          | **Check**                                       |
| ------------------------------------------ | ----------------------------------------------- |
| cluster\_name                              | Is set to the expected name                     |
| config\_node\_consensus\_protocol\_class   | Is set to the expected consensus protocol       |
| schema\_replication\_factor                | Is set to the expected schema replication count |
| schema\_region\_consensus\_protocol\_class | Is set to the expected consensus protocol       |
| data\_replication\_factor                  | Is set to the expected data replication count   |
| data\_region\_consensus\_protocol\_class   | Is set to the expected consensus protocol       |

**Notice:** Please set these parameters carefully based on the [Deployment Recommendation](./Deployment-Recommendation.md).
These parameters are not modifiable after the Node first startup.

Then open its configuration file ./conf/iotdb-confignode.properties and check the following parameters:

| **Configuration**              | **Check**                                                    |
| ------------------------------ | ------------------------------------------------------------ |
| cn\_internal\_address          | Is set to the IPV4 address or domain name of the server      |
| cn\_internal\_port             | The port isn't occupied                                      |
| cn\_consensus\_port            | The port isn't occupied                                      |
| cn\_target\_config\_node\_list | Is set to its own internal communication address, which is cn\_internal\_address:cn\_internal\_port |

After checking, you can run the startup script on the server:

```
# Linux foreground
bash ./sbin/start-confignode.sh

# Linux background
nohup bash ./sbin/start-confignode.sh >/dev/null 2>&1 &

# Windows
.\sbin\start-confignode.bat
```

For more details about other configuration parameters of ConfigNode, see the
[ConfigNode Configurations](https://iotdb.apache.org/UserGuide/Master/Reference/ConfigNode-Config-Manual.html).

##### Add more ConfigNodes (Optional)

**The ConfigNode who isn't the first one started must follow the tutorial in this section.**

You can add more ConfigNodes to the cluster to ensure high availability of ConfigNodes.
A common configuration is to add extra two ConfigNodes to make the cluster has three ConfigNodes.

Ensure that all configuration parameters in the ./conf/iotdb-common.properites are the same as those in the Seed-ConfigNode; 
otherwise, it may fail to start or generate runtime errors.
Therefore, please check the following parameters in common configuration file:

| **Configuration**                          | **Check**                              |
| ------------------------------------------ | -------------------------------------- |
| cluster\_name                              | Is consistent with the Seed-ConfigNode |
| config\_node\_consensus\_protocol\_class   | Is consistent with the Seed-ConfigNode |
| schema\_replication\_factor                | Is consistent with the Seed-ConfigNode |
| schema\_region\_consensus\_protocol\_class | Is consistent with the Seed-ConfigNode |
| data\_replication\_factor                  | Is consistent with the Seed-ConfigNode |
| data\_region\_consensus\_protocol\_class   | Is consistent with the Seed-ConfigNode |

Then, please open its configuration file ./conf/iotdb-confignode.properties and check the following parameters:

| **Configuration**              | **Check**                                                    |
| ------------------------------ | ------------------------------------------------------------ |
| cn\_internal\_address          | Is set to the IPV4 address or domain name of the server      |
| cn\_internal\_port             | The port isn't occupied                                      |
| cn\_consensus\_port            | The port isn't occupied                                      |
| cn\_target\_config\_node\_list | Is set to the internal communication address of an other running ConfigNode. The internal communication address of the seed ConfigNode is recommended. |

After checking, you can run the startup script on the server:

```
# Linux foreground
bash ./sbin/start-confignode.sh

# Linux background
nohup bash ./sbin/start-confignode.sh >/dev/null 2>&1 &

# Windows
.\sbin\start-confignode.bat
```

For more details about other configuration parameters of ConfigNode, see the
[ConfigNode Configurations](https://iotdb.apache.org/UserGuide/Master/Reference/ConfigNode-Config-Manual.html).

##### Start DataNode

**Before adding DataNodes, ensure that there exists at least one ConfigNode is running in the cluster.**

You can add any number of DataNodes to the cluster.
Before adding a new DataNode, 

please open its common configuration file ./conf/iotdb-common.properties and check the following parameters:

| **Configuration** | **Check**                              |
| ----------------- | -------------------------------------- |
| cluster\_name     | Is consistent with the Seed-ConfigNode |

Then open its configuration file ./conf/iotdb-datanode.properties and check the following parameters:

| **Configuration**                   | **Check**                                                    |
| ----------------------------------- | ------------------------------------------------------------ |
| dn\_rpc\_address                    | Is set to the IPV4 address or domain name of the server      |
| dn\_rpc\_port                       | The port isn't occupied                                      |
| dn\_internal\_address               | Is set to the IPV4 address or domain name of the server      |
| dn\_internal\_port                  | The port isn't occupied                                      |
| dn\_mpp\_data\_exchange\_port       | The port isn't occupied                                      |
| dn\_data\_region\_consensus\_port   | The port isn't occupied                                      |
| dn\_schema\_region\_consensus\_port | The port isn't occupied                                      |
| dn\_target\_config\_node\_list      | Is set to the internal communication address of other running ConfigNodes. The internal communication address of the seed ConfigNode is recommended. |

After checking, you can run the startup script on the server:

```
# Linux foreground
bash ./sbin/start-datanode.sh

# Linux background
nohup bash ./sbin/start-datanode.sh >/dev/null 2>&1 &

# Windows
.\sbin\start-datanode.bat
```

For more details about other configuration parameters of DataNode, see the
[DataNode Configurations](https://iotdb.apache.org/UserGuide/Master/Reference/DataNode-Config-Manual.html).

**Notice: The cluster can provide services only if the number of its DataNodes is no less than the number of replicas(max{schema\_replication\_factor, data\_replication\_factor}).**

#### Start Cli

If the cluster is in local environment, you can directly run the Cli startup script in the ./sbin directory:

```
# Linux
./sbin/start-cli.sh

# Windows
.\sbin\start-cli.bat
```

If you want to use the Cli to connect to a cluster in the production environment,
Please read the [Cli manual](../Tools-System/CLI.md).

#### Verify Cluster

Use a 3C3D(3 ConfigNodes and 3 DataNodes) as an example.
Assumed that the IP addresses of the 3 ConfigNodes are 192.168.1.10, 192.168.1.11 and 192.168.1.12, and the default ports 10710 and 10720 are used.
Assumed that the IP addresses of the 3 DataNodes are 192.168.1.20, 192.168.1.21 and 192.168.1.22, and the default ports 6667, 10730, 10740, 10750 and 10760 are used.

After starting the cluster successfully according to chapter 6.1, you can run the `show cluster details` command on the Cli, and you will see the following results:

```
IoTDB> show cluster details
+------+----------+-------+---------------+------------+-------------------+------------+-------+-------+-------------------+-----------------+
|NodeID|  NodeType| Status|InternalAddress|InternalPort|ConfigConsensusPort|  RpcAddress|RpcPort|MppPort|SchemaConsensusPort|DataConsensusPort|
+------+----------+-------+---------------+------------+-------------------+------------+-------+-------+-------------------+-----------------+
|     0|ConfigNode|Running|   192.168.1.10|       10710|              10720|            |       |       |                   |                 |
|     2|ConfigNode|Running|   192.168.1.11|       10710|              10720|            |       |       |                   |                 |
|     3|ConfigNode|Running|   192.168.1.12|       10710|              10720|            |       |       |                   |                 |
|     1|  DataNode|Running|   192.168.1.20|       10730|                   |192.168.1.20|   6667|  10740|              10750|            10760|
|     4|  DataNode|Running|   192.168.1.21|       10730|                   |192.168.1.21|   6667|  10740|              10750|            10760|
|     5|  DataNode|Running|   192.168.1.22|       10730|                   |192.168.1.22|   6667|  10740|              10750|            10760|
+------+----------+-------+---------------+------------+-------------------+------------+-------+-------+-------------------+-----------------+
Total line number = 6
It costs 0.012s
```

If the status of all Nodes is **Running**, the cluster deployment is successful.
Otherwise, read the run logs of the Node that fails to start and 
check the corresponding configuration parameters.

#### Stop IoTDB

This section describes how to manually shut down the ConfigNode or DataNode process of the IoTDB.

##### Stop ConfigNode by script

Run the stop ConfigNode script:

```
# Linux
./sbin/stop-confignode.sh

# Windows
.\sbin\stop-confignode.bat
```

##### Stop DataNode by script

Run the stop DataNode script:

```
# Linux
./sbin/stop-datanode.sh

# Windows
.\sbin\stop-datanode.bat
```

##### Kill Node process

Get the process number of the Node:

```
jps

# or

ps aux | grep iotdb
```

Kill the process：

```
kill -9 <pid>
```

**Notice Some ports require root access, in which case use sudo**

#### Shrink the Cluster

This section describes how to remove ConfigNode or DataNode from the cluster.

##### Remove ConfigNode

Before removing a ConfigNode, ensure that there is at least one active ConfigNode in the cluster after the removal.
Run the remove-confignode script on an active ConfigNode:

```
# Linux
# Remove the ConfigNode with confignode_id
./sbin/remove-confignode.sh <confignode_id>

# Remove the ConfigNode with address:port
./sbin/remove-confignode.sh <cn_internal_address>:<cn_internal_port>


# Windows
# Remove the ConfigNode with confignode_id
.\sbin\remove-confignode.bat <confignode_id>

# Remove the ConfigNode with address:port
.\sbin\remove-confignode.bat <cn_internal_address>:<cn_internal_portcn_internal_port>
```

##### Remove DataNode

Before removing a DataNode, ensure that the cluster has at least the number of data/schema replicas DataNodes.
Run the remove-datanode script on an active DataNode:

```
# Linux
# Remove the DataNode with datanode_id
./sbin/remove-datanode.sh <datanode_id>

# Remove the DataNode with rpc address:port
./sbin/remove-datanode.sh <dn_rpc_address>:<dn_rpc_port>


# Windows
# Remove the DataNode with datanode_id
.\sbin\remove-datanode.bat <datanode_id>

# Remove the DataNode with rpc address:port
.\sbin\remove-datanode.bat <dn_rpc_address>:<dn_rpc_port>
```

### FAQ

See [FAQ](https://iotdb.apache.org/UserGuide/Master/FAQ/FAQ-for-cluster-setup.html).