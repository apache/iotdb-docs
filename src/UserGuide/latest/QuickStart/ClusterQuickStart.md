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

# Cluster Quick Start

The purpose of this article is to show how to start, expand, and shrink an IoTDB cluster in an easy way.

See also:
[FAQ](../FAQ/Frequently-asked-questions.md)


## 1. Installation and deployment

As an example, we'd like to start an IoTDB cluster with 3 ConfigNodes and 3 DataNodes(3C3D) with minimum modifications. Thus, 
- the cluster name is defaultCluster
- data/schema replica is 1
- the max heap size of ConfigNode take the 1/4 of the computer
- the max heap size of DataNode take the 1/4 of the computer

Suppose there are 3 computers(3 nodes we called here) with Linux OS and JDK installed(detail see [Prerequisites](../QuickStart/QuickStart.md)) and IoTDB working directory is `/data/iotdb`.
IP address and configurations is like below:

| Node IP | 192.168.132.10 | 192.168.132.11 | 192.168.132.12 |
|--------|:---------------|:---------------|:---------------|
| service   | ConfigNode     | ConfigNode     | ConfigNode     |
| service   | DataNode       | DataNode       | DataNode       |

Port:

| Service | ConfigNode | DataNode |
|---|---|---|
|port| 10710, 10720 | 6667, 10730, 10740, 10750, 10760 |

**illustration：**
- We could use IP address or hostname/domain to set up an IoTDB cluster, then we would take IP address. If using hostname/domain, `/etc/hosts` must be set well.
- JVM memory configuration: `ON_HEAP_MEMORY` in `confignode-env.sh` and `datanode-env.sh`, equal to or greater than 1G is recommended. It's enough for ConfigNode taking 1~2G. The memory taking of DataNode is decided by the inputing and querying data. 

### 1.1 download
In every computer, [Download](https://iotdb.apache.org/Download/) the IoTDB install package and extract it to working directory of `/data/iotdb`.
Then get the directory tree:
```shell
/data/iotdb/
├── conf    # configuration files
├── lib     # jar library
├── sbin    # start/stop shell etc.
└── tools   # other tools
```

### 1.2. configuration

Configuration files are in `/data/iotdb/conf`.
Modify the specified configuration file according to the table below:

|  Configuration|      Configuration Option      | IP:192.168.132.10       | IP:192.168.132.11       | IP:192.168.132.12       |
|------------|:-------------------------------|----------------------|----------------------|:---------------------|
| iotdb-confignode.properties | cn\_internal\_address          | 192.168.132.10       | 192.168.132.11       | 192.168.132.12       |
|            | cn\_target\_config\_node\_list | 192.168.132.10:10710 | 192.168.132.10:10710 | 192.168.132.10:10710 |
| iotdb-datanode.properties   | dn\_rpc\_address               | 192.168.132.10       | 192.168.132.11       | 192.168.132.12       |
|            | dn\_internal\_address          | 192.168.132.10       | 192.168.132.11       | 192.168.132.12       |
|            | dn\_target\_config\_node\_list | 192.168.132.10:10710 | 192.168.132.10:10710 | 192.168.132.10:10710 |       

**Notice:**
It's recommended that the configurations of iotdb-common.properties and the heap size of JVM in all nodes are the same.

### 1.3. start IoTDB cluster
Before starting the IoTDB cluster, make sure the configurations are correct and there is no any data in the working directory. 

#### 1.3.1. start the first node
That is `cn_seed_config_node` in above configuration table.
Execute these commands below in node of `192.168.132.10`.
```shell
cd /data/iotdb
# start ConfigNode and DataNode services
sbin/start-standalone.sh
    
# check DataNode logs to see whether starting successfully or not
tail -f logs/log_datanode_all.log
# expecting statements like below
# 2023-07-21 20:26:01,881 [main] INFO  o.a.i.db.service.DataNode:192 - Congratulation, IoTDB DataNode is set up successfully. Now, enjoy yourself!
```
If there is no such logs mentioned abolve or there are some `Exception`s in log files, it's failed. Then please check `log_confignode_all.log` and `log_datanode_all.log` in directory of `/data/iotdb/logs`.

**Notice**：
- Make sure the first node, especially the first ConfigNode that `cn_seed_config_node` specified, starting successfully, and then start the other services.
- If starting failed，it's necessary to do [cleanup](#【reference】cleanup) before starting again.
- How to start service ConfigNode or DataNode alone: 
```shell
# start ConfigNode alone in daemon
sbin/start-confignode.sh -d
# start DataNode alone in daemon
sbin/start-datanode.sh -d
```

#### 1.3.2. start service ConfigNode and DataNode in other nodes
Execute commands below in both 192.168.132.11 and 192.168.132.12:
```shell
cd /data/iotdb
# start service ConfigNode and DataNode
sbin/start-standalone.sh
```
If starting failed, it's necessary to do [cleanup](#【reference】cleanup) in all nodes, and then doging all again from starting the first node.

#### 1.3.3. check the cluster status
If everything goes well, the cluster will start successfully. Then, we can start the Cli for verification.
```shell
/data/iotdb/sbin/start-cli.sh -h 192.168.132.10
IoTDB>show cluster;
# example result:
+------+----------+-------+---------------+------------+-------+---------+
|NodeID|  NodeType| Status|InternalAddress|InternalPort|Version|BuildInfo|
+------+----------+-------+---------------+------------+-------+---------+
|     0|ConfigNode|Running| 192.168.132.10|       10710|1.x.x  |  xxxxxxx|
|     1|  DataNode|Running| 192.168.132.10|       10730|1.x.x  |  xxxxxxx|
|     2|ConfigNode|Running| 192.168.132.11|       10710|1.x.x  |  xxxxxxx|
|     3|  DataNode|Running| 192.168.132.11|       10730|1.x.x  |  xxxxxxx|
|     4|ConfigNode|Running| 192.168.132.12|       10710|1.x.x  |  xxxxxxx|
|     5|  DataNode|Running| 192.168.132.12|       10730|1.x.x  |  xxxxxxx|
+------+----------+-------+---------------+------------+-------+---------+
``` 
**illustration:**
The IP address of `start-cli.sh -h` could be any IP address of DataNode service.


### 【reference】Cleanup
Execute commands in every node:
1. End processes of ConfigNode and DataNode
```shell
# 1. Stop services ConfigNode and DataNode
sbin/stop-standalone.sh

# 2. Check whether there are IoTDB processes left or not
jps
# 或者
ps -ef|gerp iotdb

# 3. If there is any IoTDB process left, kill it
kill -9 <pid>
# If there is only 1 IoTDB instance, execue command below to remove all IoTDB process
ps -ef|grep iotdb|grep -v grep|tr -s '  ' ' ' |cut -d ' ' -f2|xargs kill -9
```

2. Remove directories of data and logs
```shell
cd /data/iotdb
rm -rf data logs
``` 
**illustration:**
It's necessary to remove directory of `data` but it's not necessary to remove directory of `logs`, only for convenience.


## 2. Expand
`Expand` means add services of ConfigNode or DataNode into an existing IoTDB cluster.

It's the same as starting the other nodes mentioned above. That is downloading IoTDB install package, extracting, configurating and then starting. The new node here is `192.168.132.13`.
**Notice**
- It's must be cleaned up, in other words doing [cleanup](#cleanup) in it.
- `cluster_name` of `iotdb-common.properties` must be the same to the cluster.
- `cn_seed_config_node` and `dn_seed_config_node` must be the same to the cluster.
- The old data wouldn't be moved to the new node but the new data would be.

### 2.1. configuration
Modify the specified configuration file according to the table below:

|  Configuration |      Configuration Option| IP:192.168.132.13  | 
|------------|:-------------------------------|:---------------------|
| iotdb-confignode.properties | cn\_internal\_address          | 192.168.132.13       | 
|            | cn\_target\_config\_node\_list | 192.168.132.10:10710 | 
| iotdb-datanode.properties   | dn\_rpc\_address               | 192.168.132.13       | 
|            | dn\_internal\_address          | 192.168.132.13       | 
|            | dn\_target\_config\_node\_list | 192.168.132.10:10710 | 

### 2.2. expand
Execute commands below in new node of `192.168.132.13`:
```shell
cd /data/iotdb
# start service ConfigNode and DataNode
sbin/start-standalone.sh
```

### 2.3. check the result
Execute `show cluster` through Cli and the result like below:
```shell
/data/iotdb/sbin/start-cli.sh -h 192.168.132.10
IoTDB>show cluster;
# example result：
+------+----------+-------+---------------+------------+-------+---------+
|NodeID|  NodeType| Status|InternalAddress|InternalPort|Version|BuildInfo|
+------+----------+-------+---------------+------------+-------+---------+
|     0|ConfigNode|Running| 192.168.132.10|       10710|1.x.x  |  xxxxxxx|
|     1|  DataNode|Running| 192.168.132.10|       10730|1.x.x  |  xxxxxxx|
|     2|ConfigNode|Running| 192.168.132.11|       10710|1.x.x  |  xxxxxxx|
|     3|  DataNode|Running| 192.168.132.11|       10730|1.x.x  |  xxxxxxx|
|     4|ConfigNode|Running| 192.168.132.12|       10710|1.x.x  |  xxxxxxx|
|     5|  DataNode|Running| 192.168.132.12|       10730|1.x.x  |  xxxxxxx|
|     6|ConfigNode|Running| 192.168.132.13|       10710|1.x.x  |  xxxxxxx|
|     7|  DataNode|Running| 192.168.132.13|       10730|1.x.x  |  xxxxxxx|
+------+----------+-------+---------------+------------+-------+---------+
``` 


## 3. Remove service
`Shrink` means removing a service from the IoTDB cluster.
**Notice:**
- `Shrink` could be done in any node within the cluster
- Any service could be shrinked within cluster. But the DataNode service of the cluster must greater than the data replica of iotdb-common.properties.
- Be patient to wait for the end of shrinking, and then read the guide in logs carefully.

### 3.1 shrink service ConfigNode
```shell
cd /data/iotdb
# way 1: shrink with ip:port
sbin/remove-confignode.sh 192.168.132.13:10710

# way 2: shrink with NodeID of `show cluster`
sbin/remove-confignode.sh 6
```

### 3.2 shrink service DataNode
```shell
cd /data/iotdb
# way 1: shrink with ip:port
sbin/remove-datanode.sh 192.168.132.13:6667

# way 2: shrink with NodeID of `show cluster`
sbin/remove-datanode.sh 7
```

### 3.3 check the result

Execute `show cluster` through Cli, the result is like below:
```shell
+------+----------+-------+---------------+------------+-------+---------+
|NodeID|  NodeType| Status|InternalAddress|InternalPort|Version|BuildInfo|
+------+----------+-------+---------------+------------+-------+---------+
|     0|ConfigNode|Running| 192.168.132.10|       10710|1.x.x  |  xxxxxxx|
|     1|  DataNode|Running| 192.168.132.10|       10730|1.x.x  |  xxxxxxx|
|     2|ConfigNode|Running| 192.168.132.11|       10710|1.x.x  |  xxxxxxx|
|     3|  DataNode|Running| 192.168.132.11|       10730|1.x.x  |  xxxxxxx|
|     4|ConfigNode|Running| 192.168.132.12|       10710|1.x.x  |  xxxxxxx|
|     5|  DataNode|Running| 192.168.132.12|       10730|1.x.x  |  xxxxxxx|
+------+----------+-------+---------------+------------+-------+---------+
```
