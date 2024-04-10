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

## Cluster deployment(Cluster management tool)

The IoTDB cluster management tool is an easy-to-use operation and maintenance tool (enterprise version tool). 
It is designed to solve the operation and maintenance problems of multiple nodes in the IoTDB distributed system. 
It mainly includes cluster deployment, cluster start and stop, elastic expansion, configuration update, data export and other functions, thereby realizing one-click command issuance for complex database clusters, which greatly Reduce management difficulty. 
This document will explain how to remotely deploy, configure, start and stop IoTDB cluster instances with cluster management tools.

### Environment dependence

This tool is a supporting tool for TimechoDB(Enterprise Edition based on IoTDB). You can contact your sales representative to obtain the tool download method.

The machine where IoTDB is to be deployed needs to rely on jdk 8 and above, lsof, netstat, and unzip functions. If not, please install them yourself. You can refer to the installation commands required for the environment in the last section of the document.

Tip: The IoTDB cluster management tool requires an account with root privileges

### Deployment method

#### Download and install

This tool is a supporting tool for TimechoDB(Enterprise Edition based on IoTDB). You can contact your salesperson to obtain the tool download method.

Note: Since the binary package only supports GLIBC2.17 and above, the minimum version is Centos7.

* After entering the following commands in the iotdb-opskit directory:

```bash
bash install-iotdbctl.sh
```

The iotdbctl keyword can be activated in the subsequent shell, such as checking the environment instructions required before deployment as follows:

```bash
iotdbctl cluster check example
```

* You can also directly use &lt;iotdbctl absolute path&gt;/sbin/iotdbctl without activating iotdbctl to execute commands, such as checking the environment required before deployment:

```bash
<iotdbctl absolute path>/sbin/iotdbctl cluster check example
```

### Introduction to cluster configuration files

* There is a cluster configuration yaml file in the `iotdbctl/config` directory. The yaml file name is the cluster name. There can be multiple yaml files. In order to facilitate users to configure yaml files, a `default_cluster.yaml` example is provided under the iotdbctl/config directory.
* The yaml file configuration consists of five major parts: `global`, `confignode_servers`, `datanode_servers`, `grafana_server`, and `prometheus_server`
* `global` is a general configuration that mainly configures machine username and password, IoTDB local installation files, Jdk configuration, etc. A `default_cluster.yaml` sample data is provided in the `iotdbctl/config` directory,
  Users can copy and modify it to their own cluster name and refer to the instructions inside to configure the IoTDB cluster. In the `default_cluster.yaml` sample, all uncommented items are required, and those that have been commented are non-required.

例如要执行`default_cluster.yaml`检查命令则需要执行命令`iotdbctl cluster check default_cluster`即可，
更多详细命令请参考下面命令列表。


| parameter name          | parameter describe                                                                                                                                                                                                                                                                                                                                                             | required |
|-------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| iotdb\_zip\_dir         | IoTDB deployment distribution directory, if the value is empty, it will be downloaded from the address specified by `iotdb_download_url`                                                                                                                                                                                                                                       | NO       |
| iotdb\_download\_url    | IoTDB download address, if `iotdb_zip_dir` has no value, download from the specified address                                                                                                                                                                                                                                                                                   | NO       |
| jdk\_tar\_dir           | jdk local directory, you can use this jdk path to upload and deploy to the target node.                                                                                                                                                                                                                                                                                        | NO       |
| jdk\_deploy\_dir        | jdk remote machine deployment directory, jdk will be deployed to this directory, and the following `jdk_dir_name` parameter forms a complete jdk deployment directory, that is, `<jdk_deploy_dir>/<jdk_dir_name>`                                                                                                                                                              | NO       |
| jdk\_dir\_name          | The directory name after jdk decompression defaults to jdk_iotdb                                                                                                                                                                                                                                                                                                               | NO       |
| iotdb\_lib\_dir         | The IoTDB lib directory or the IoTDB lib compressed package only supports .zip format and is only used for IoTDB upgrade. It is in the comment state by default. If you need to upgrade, please open the comment and modify the path. If you use a zip file, please use the zip command to compress the iotdb/lib directory, such as zip -r lib.zip apache-iotdb-1.2.0/lib/* d | NO       |
| user                    | User name for ssh login deployment machine                                                                                                                                                                                                                                                                                                                                     | YES      |
| password                | The password for ssh login. If the password does not specify the use of pkey to log in, please ensure that the ssh login between nodes has been configured without a key.                                                                                                                                                                                                      | NO      |
| pkey                    | Key login: If password has a value, password is used first, otherwise pkey is used to log in.                                                                                                                                                                                                                                                                                  | NO      |
| ssh\_port               | ssh port                                                                                                                                                                                                                                                                                                                                                                       | YES       |
| deploy\_dir             | IoTDB deployment directory, IoTDB will be deployed to this directory and the following `iotdb_dir_name` parameter will form a complete IoTDB deployment directory, that is, `<deploy_dir>/<iotdb_dir_name>`                                                                                                                                                                    | YES       |
| iotdb\_dir\_name        | The directory name after decompression of IoTDB is iotdb by default.                                                                                                                                                                                                                                                                                                           | NO      |
| datanode-env.sh         | Corresponding to `iotdb/config/datanode-env.sh`, when `global` and `confignode_servers` are configured at the same time, the value in `confignode_servers` is used first                                                                                                                                                                                                       | NO      |
| confignode-env.sh       | Corresponding to `iotdb/config/confignode-env.sh`, the value in `datanode_servers` is used first when `global` and `datanode_servers` are configured at the same time                                                                                                                                                                                                          | NO      |
| iotdb-common.properties | Corresponds to `<iotdb path>/config/iotdb-common.properties`                                                                                                                                                                                                                                                                                                                   | NO      |
| cn\_internal\_address   | The cluster configuration address points to the surviving ConfigNode, and it points to confignode_x by default. When `global` and `confignode_servers` are configured at the same time, the value in `confignode_servers` is used first, corresponding to `cn_internal_address` in `iotdb/config/iotdb-confignode.properties`                                                  | YES       |
| dn\_internal\_address   | The cluster configuration address points to the surviving ConfigNode, and points to confignode_x by default. When configuring values for `global` and `datanode_servers` at the same time, the value in `datanode_servers` is used first, corresponding to `dn_internal_address` in `iotdb/config/iotdb-datanode.properties`                                                   | YES       |

Among them, datanode-env.sh and confignode-env.sh can be configured with extra parameters extra_opts. When this parameter is configured, corresponding values will be appended after datanode-env.sh and confignode-env.sh. Refer to default_cluster.yaml for configuration examples as follows:
datanode-env.sh:   
extra_opts: |
IOTDB_JMX_OPTS="$IOTDB_JMX_OPTS -XX:+UseG1GC"
IOTDB_JMX_OPTS="$IOTDB_JMX_OPTS -XX:MaxGCPauseMillis=200"

* `confignode_servers` is the configuration for deploying IoTDB Confignodes, in which multiple Confignodes can be configured
  By default, the first started ConfigNode node node1 is regarded as the Seed-ConfigNode

| parameter name              | parameter describe                                                                                                                                                                | required |
|-----------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| name                        | Confignode name                                                                                                                                                                   | YES      |
| deploy\_dir                 | IoTDB config node deployment directory                                                                                                                                                            | YES     |
| iotdb-confignode.properties | Corresponding to `iotdb/config/iotdb-confignode.properties`, please refer to the `iotdb-confignode.properties` file description for more details.                                                                                             | NO       |
| cn_internal_address       | The cluster configuration address points to the surviving ConfigNode, and it points to confignode_x by default. When `global` and `confignode_servers` are configured at the same time, the value in `confignode_servers` is used first, corresponding to `cn_internal_address` in `iotdb/config/iotdb-confignode.properties` | YES      |
| cn\_internal\_port          | Internal communication port, corresponding to `cn_internal_port` in `iotdb/config/iotdb-confignode.properties`                                                                                                          | YES      |
| cn\_consensus\_port         | Corresponds to `cn_consensus_port` in `iotdb/config/iotdb-confignode.properties`                                                                                                               | NO      |
| cn\_data\_dir               | Corresponds to `cn_consensus_port` in `iotdb/config/iotdb-confignode.properties` Corresponds to `cn_data_dir` in `iotdb/config/iotdb-confignode.properties`                                                                                                                       | YES      |
| iotdb-common.properties     | Corresponding to `iotdb/config/iotdb-common.properties`, when configuring values in `global` and `confignode_servers` at the same time, the value in confignode_servers will be used first.                                                                              | NO      |

* datanode_servers 是部署IoTDB Datanodes配置，里面可以配置多个Datanode

| parameter name            | parameter describe                                                                                                                                                                                                                                                                                                            | required |
|---------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| name                      | Datanode name                                                                                                                                                                                                                                                                                                                 | YES      |
| deploy\_dir               | IoTDB data node deployment directory                                                                                                                                                                                                                                                                                          | YES      |
| iotdb-datanode.properties | Corresponding to `iotdb/config/iotdb-datanode.properties`, please refer to the `iotdb-datanode.properties` file description for more details.                                                                                                                                                                                 | NO       |
| dn\_rpc\_address          | The datanode rpc address corresponds to `dn_rpc_address` in `iotdb/config/iotdb-datanode.properties`                                                                                                                                                                                                                          | YES      |
| dn\_internal\_address     | Internal communication address, corresponding to `dn_internal_address` in `iotdb/config/iotdb-datanode.properties`                                                                                                                                                                                                            | YES      |
| dn\_seed\_config\_node    | The cluster configuration address points to the surviving ConfigNode, and points to confignode_x by default. When configuring values for `global` and `datanode_servers` at the same time, the value in `datanode_servers` is used first, corresponding to `dn_seed_config_node` in `iotdb/config/iotdb-datanode.properties`. | YES      |
| dn\_rpc\_port             | Datanode rpc port address, corresponding to `dn_rpc_port` in `iotdb/config/iotdb-datanode.properties`                                                                                                                                                                                                                         | YES      |
| dn\_internal\_port        | Internal communication port, corresponding to `dn_internal_port` in `iotdb/config/iotdb-datanode.properties`                                                                                                                                                                                                                  | YES      |
| iotdb-common.properties   | Corresponding to `iotdb/config/iotdb-common.properties`, when configuring values in `global` and `datanode_servers` at the same time, the value in `datanode_servers` will be used first.                                                                                                                                     | NO      |

* grafana_server is the configuration related to deploying Grafana

| parameter name     | parameter describe                                          | required  |
|--------------------|-------------------------------------------------------------|-----------|
| grafana\_dir\_name | Grafana decompression directory name(default grafana_iotdb) | NO        |
| host               | Server ip deployed by grafana                               | YES       |
| grafana\_port      | The port of grafana deployment machine, default 3000                                      | NO        |
| deploy\_dir        | grafana deployment server directory                                            | YES       |
| grafana\_tar\_dir  | Grafana compressed package location                                               | YES       |
| dashboards         | dashboards directory                                            | NO |

* prometheus_server 是部署Prometheus 相关配置

| parameter name                 | parameter describe                                 | required |
|--------------------------------|----------------------------------------------------|----------|
| prometheus\_dir\_name          | prometheus decompression directory name, default prometheus_iotdb               | NO       |
| host                           | Server IP deployed by prometheus                                | YES      |
| prometheus\_port               | The port of prometheus deployment machine, default 9090                          | NO       |
| deploy\_dir                    | prometheus deployment server directory                                 | YES      |
| prometheus\_tar\_dir           | prometheus compressed package path                                   | YES      |
| storage\_tsdb\_retention\_time | The number of days to save data is 15 days by default                                     | NO       |
| storage\_tsdb\_retention\_size | The data size that can be saved by the specified block defaults to 512M. Please note the units are KB, MB, GB, TB, PB, and EB. | NO       |

If metrics are configured in `iotdb-datanode.properties` and `iotdb-confignode.properties` of config/xxx.yaml, the configuration will be automatically put into promethues without manual modification.

Note: How to configure the value corresponding to the yaml key to contain special characters such as: etc. It is recommended to use double quotes for the entire value, and do not use paths containing spaces in the corresponding file paths to prevent abnormal recognition problems.

### scenes to be used

#### Clean data

* Cleaning up the cluster data scenario will delete the data directory in the IoTDB cluster and `cn_system_dir`, `cn_consensus_dir`, `cn_consensus_dir` configured in the yaml file
  `dn_data_dirs`, `dn_consensus_dir`, `dn_system_dir`, `logs` and `ext` directories.
* First execute the stop cluster command, and then execute the cluster cleanup command.

```bash
iotdbctl cluster stop default_cluster
iotdbctl cluster clean default_cluster
```

#### Cluster destruction

* The cluster destruction scenario will delete `data`, `cn_system_dir`, `cn_consensus_dir`, in the IoTDB cluster
  `dn_data_dirs`, `dn_consensus_dir`, `dn_system_dir`, `logs`, `ext`, `IoTDB` deployment directory,
  grafana deployment directory and prometheus deployment directory.
* First execute the stop cluster command, and then execute the cluster destruction command.


```bash
iotdbctl cluster stop default_cluster
iotdbctl cluster destroy default_cluster
```

#### Cluster upgrade

* To upgrade the cluster, you first need to configure `iotdb_lib_dir` in config/xxx.yaml as the directory path where the jar to be uploaded to the server is located (for example, iotdb/lib).
* If you use zip files to upload, please use the zip command to compress the iotdb/lib directory, such as zip -r lib.zip apache-iotdb-1.2.0/lib/*
* Execute the upload command and then execute the restart IoTDB cluster command to complete the cluster upgrade.

```bash
iotdbctl cluster upgrade default_cluster
iotdbctl cluster restart default_cluster
```

#### hot deployment

* First modify the configuration in config/xxx.yaml.
* Execute the distribution command, and then execute the hot deployment command to complete the hot deployment of the cluster configuration

```bash
iotdbctl cluster distribute default_cluster
iotdbctl cluster reload default_cluster
```

#### Cluster expansion

* First modify and add a datanode or confignode node in config/xxx.yaml.
* Execute the cluster expansion command

```bash
iotdbctl cluster scaleout default_cluster
```

#### Cluster scaling

* First find the node name or ip+port to shrink in config/xxx.yaml (where confignode port is cn_internal_port, datanode port is rpc_port)
* Execute cluster shrink command

```bash
iotdbctl cluster scalein default_cluster
```

#### Using cluster management tools to manipulate existing IoTDB clusters

* Configure the server's `user`, `passwod` or `pkey`, `ssh_port`
* Modify the IoTDB deployment path in config/xxx.yaml, `deploy_dir` (IoTDB deployment directory), `iotdb_dir_name` (IoTDB decompression directory name, the default is iotdb)
  For example, if the full path of IoTDB deployment is `/home/data/apache-iotdb-1.1.1`, you need to modify the yaml files `deploy_dir:/home/data/` and `iotdb_dir_name:apache-iotdb-1.1.1`
* If the server is not using java_home, modify `jdk_deploy_dir` (jdk deployment directory) and `jdk_dir_name` (the directory name after jdk decompression, the default is jdk_iotdb). If java_home is used, there is no need to modify the configuration.
  For example, the full path of jdk deployment is `/home/data/jdk_1.8.2`, you need to modify the yaml files `jdk_deploy_dir:/home/data/`, `jdk_dir_name:jdk_1.8.2`
* Configure `cn_internal_address`, `dn_internal_address`
* Configure `cn_internal_address`, `cn_internal_port`, `cn_consensus_port`, `cn_system_dir`, in `iotdb-confignode.properties` in `confignode_servers`
  If the values in `cn_consensus_dir` and `iotdb-common.properties` are not the default for IoTDB, they need to be configured, otherwise there is no need to configure them.
* Configure `dn_rpc_address`, `dn_internal_address`, `dn_data_dirs`, `dn_consensus_dir`, `dn_system_dir` and `iotdb-common.properties` in `iotdb-datanode.properties` in `datanode_servers`
* Execute initialization command

```bash
iotdbctl cluster init default_cluster
```

#### Deploy IoTDB, Grafana and Prometheus

* Configure `iotdb-datanode.properties`, `iotdb-confignode.properties` to open the metrics interface
* Configure the Grafana configuration. If there are multiple `dashboards`, separate them with commas. The names cannot be repeated or they will be overwritten.
* Configure the Prometheus configuration. If the IoTDB cluster is configured with metrics, there is no need to manually modify the Prometheus configuration. The Prometheus configuration will be automatically modified according to which node is configured with metrics.
* Start the cluster

```bash
iotdbctl cluster start default_cluster
```

For more detailed parameters, please refer to the cluster configuration file introduction above

### Command

The basic usage of this tool is:
```bash
iotdbctl cluster <key> <cluster name> [params (Optional)]
```
* key indicates a specific command.

* cluster name indicates the cluster name (that is, the name of the yaml file in the `iotdbctl/config` file).

* params indicates the required parameters of the command (optional).

* For example, the command format to deploy the default_cluster cluster is:

```bash
iotdbctl cluster deploy default_cluster
```

* The functions and parameters of the cluster are listed as follows:

| command    | description                                                                                      | parameter                                                                                                                                                                                                                                        |
|------------|-----------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| check      | check whether the cluster can be deployed                                                     | Cluster name list                                                                                                                                                                                                                                |
| clean      | cleanup-cluster                                                                               | cluster-name                                                                                                                                                                                                                                     |
| deploy     | deploy cluster                                                                                | Cluster name, -N, module name (optional for iotdb, grafana, prometheus), -op force (optional)                                                                                                                                                    |
| list       | cluster status list                                                                           | None                                                                                                                                                                                                                                             |
| start      | start cluster                                                                                 | Cluster name, -N, node name (nodename, grafana, prometheus optional)                                                                                                                                                                             |
| stop       | stop cluster                                                                                  | Cluster name, -N, node name (nodename, grafana, prometheus optional), -op force (nodename, grafana, prometheus optional)                                                                                                                         |
| restart    | restart cluster                                                                               | Cluster name, -N, node name (nodename, grafana, prometheus optional), -op force (nodename, grafana, prometheus optional)                                                                                                                         |
| show       | view cluster information. The details field indicates the details of the cluster information. | Cluster name, details (optional)                                                                                                                                                                                                                 |
| destroy    | destroy cluster                                                                               | Cluster name, -N, module name (iotdb, grafana, prometheus optional)                                                                                                                                                                              |
| scaleout   | cluster expansion                                                                             | Cluster name                                                                                                                                                                                                                                     |
| scalein    | cluster shrink                                                                                | Cluster name, -N, cluster node name or cluster node ip+port                                                                                                                                                                                      |
| reload     | hot loading of cluster configuration files                                                    | Cluster name                                                                                                                                                                                                                                     |
| distribute | cluster configuration file distribution                                                       | Cluster name                                                                                                                                                                                                                                     |
| dumplog    | Back up specified cluster logs                                                                                      | Cluster name, -N, cluster node name -h Back up to target machine ip -pw Back up to target machine password -p Back up to target machine port -path Backup directory -startdate Start time -enddate End time -loglevel Log type -l transfer speed |
| dumpdata   | Backup cluster data                                                                                      | Cluster name, -h backup to target machine ip -pw backup to target machine password -p backup to target machine port -path backup directory -startdate start time -enddate end time -l transmission speed                                         |
| upgrade    | lib package upgrade                                                                                       | Cluster name                                                                                                                                                                                                                                     |
| init       | When an existing cluster uses the cluster deployment tool, initialize the cluster configuration             | Cluster name                                                                                                                                                                                                                                     |
| status     | View process status                                                                                        | Cluster name                                                                                                                                                                                                                                     |
| activate     | Activate cluster                                                                                        | Cluster name                                                                                                                                                                                                                                     |
### Detailed command execution process

The following commands are executed using default_cluster.yaml as an example, and users can modify them to their own cluster files to execute

#### Check cluster deployment environment commands

```bash
iotdbctl cluster check default_cluster
```

* Find the yaml file in the default location according to cluster-name and obtain the configuration information of `confignode_servers` and `datanode_servers`

* Verify that the target node is able to log in via SSH

* Verify whether the JDK version on the corresponding node meets IoTDB jdk1.8 and above, and whether the server is installed with unzip, lsof, and netstat.

* If you see the following prompt `Info:example check successfully!`, it proves that the server has already met the installation requirements.
  If `Error:example check fail!` is output, it proves that some conditions do not meet the requirements. You can check the Error log output above (for example: `Error:Server (ip:172.20.31.76) iotdb port(10713) is listening`) to make repairs. ,
  If the jdk check does not meet the requirements, we can configure a jdk1.8 or above version in the yaml file ourselves for deployment without affecting subsequent use.
  If checking lsof, netstat or unzip does not meet the requirements, you need to install it on the server yourself.

#### Deploy cluster command

```bash
iotdbctl cluster deploy default_cluster
```

* Find the yaml file in the default location according to cluster-name and obtain the configuration information of `confignode_servers` and `datanode_servers`

* Upload IoTDB compressed package and jdk compressed package according to the node information in `confignode_servers` and `datanode_servers` (if `jdk_tar_dir` and `jdk_deploy_dir` values ​​are configured in yaml)

* Generate and upload `iotdb-common.properties`, `iotdb-confignode.properties`, `iotdb-datanode.properties` according to the yaml file node configuration information

```bash
iotdbctl cluster deploy default_cluster -op force
```

Note: This command will force the deployment, and the specific process will delete the existing deployment directory and redeploy

*deploy a single module*
```bash
# Deploy grafana module
iotdbctl cluster deploy default_cluster -N grafana
# Deploy the prometheus module
iotdbctl cluster deploy default_cluster -N prometheus
# Deploy the iotdb module
iotdbctl cluster deploy default_cluster -N iotdb
```

#### Start cluster command

```bash
iotdbctl cluster start default_cluster
```

* Find the yaml file in the default location according to cluster-name and obtain the configuration information of `confignode_servers` and `datanode_servers`

* Start confignode, start sequentially according to the order in `confignode_servers` in the yaml configuration file and check whether the confignode is normal according to the process id, the first confignode is seek config

* Start the datanode in sequence according to the order in `datanode_servers` in the yaml configuration file and check whether the datanode is normal according to the process id.

* After checking the existence of the process according to the process id, check whether each service in the cluster list is normal through the cli. If the cli link fails, retry every 10s until it succeeds and retry up to 5 times


*
Start a single node command*
```bash
#Start according to the IoTDB node name
iotdbctl cluster start default_cluster -N datanode_1
#Start according to IoTDB cluster ip+port, where port corresponds to cn_internal_port of confignode and rpc_port of datanode.
iotdbctl cluster start default_cluster -N 192.168.1.5:6667
#Start grafana
iotdbctl cluster start default_cluster -N grafana
#Start prometheus
iotdbctl cluster start default_cluster -N prometheus
```

* Find the yaml file in the default location based on cluster-name

* Find the node location information based on the provided node name or ip:port. If the started node is `data_node`, the ip uses `dn_rpc_address` in the yaml file, and the port uses `dn_rpc_port` in datanode_servers in the yaml file.
  If the started node is `config_node`, the ip uses `cn_internal_address` in confignode_servers in the yaml file, and the port uses `cn_internal_port`

* start the node

Note: Since the cluster deployment tool only calls the start-confignode.sh and start-datanode.sh scripts in the IoTDB cluster,
When the actual output result fails, it may be that the cluster has not started normally. It is recommended to use the status command to check the current cluster status (iotdbctl cluster status xxx)


#### View IoTDB cluster status command

```bash
iotdbctl cluster show default_cluster
#View IoTDB cluster details
iotdbctl cluster show default_cluster details
```
* Find the yaml file in the default location according to cluster-name and obtain the configuration information of `confignode_servers` and `datanode_servers`

* Execute `show cluster details` through cli on datanode in turn. If one node is executed successfully, it will not continue to execute cli on subsequent nodes and return the result directly.

#### Stop cluster command


```bash
iotdbctl cluster stop default_cluster
```
* Find the yaml file in the default location according to cluster-name and obtain the configuration information of `confignode_servers` and `datanode_servers`

* According to the datanode node information in `datanode_servers`, stop the datanode nodes in order according to the configuration.

* Based on the confignode node information in `confignode_servers`, stop the confignode nodes in sequence according to the configuration

*force stop cluster command*

```bash
iotdbctl cluster stop default_cluster -op force
```
Will directly execute the kill -9 pid command to forcibly stop the cluster

*Stop single node command*

```bash
#Stop by IoTDB node name
iotdbctl cluster stop default_cluster -N datanode_1
#Stop according to IoTDB cluster ip+port (ip+port is to get the only node according to ip+dn_rpc_port in datanode or ip+cn_internal_port in confignode to get the only node)
iotdbctl cluster stop default_cluster -N 192.168.1.5:6667
#Stop grafana
iotdbctl cluster stop default_cluster -N grafana
#Stop prometheus
iotdbctl cluster stop default_cluster -N prometheus
```

* Find the yaml file in the default location based on cluster-name

* Find the corresponding node location information based on the provided node name or ip:port. If the stopped node is `data_node`, the ip uses `dn_rpc_address` in the yaml file, and the port uses `dn_rpc_port` in datanode_servers in the yaml file.
  If the stopped node is `config_node`, the ip uses `cn_internal_address` in confignode_servers in the yaml file, and the port uses `cn_internal_port`

* stop the node

Note: Since the cluster deployment tool only calls the stop-confignode.sh and stop-datanode.sh scripts in the IoTDB cluster, in some cases the iotdb cluster may not be stopped.


#### Clean cluster data command

```bash
iotdbctl cluster clean default_cluster
```

* Find the yaml file in the default location according to cluster-name and obtain the configuration information of `confignode_servers` and `datanode_servers`

* Based on the information in `confignode_servers` and `datanode_servers`, check whether there are still services running,
  If any service is running, the cleanup command will not be executed.

* Delete the data directory in the IoTDB cluster and the `cn_system_dir`, `cn_consensus_dir`, configured in the yaml file
  `dn_data_dirs`, `dn_consensus_dir`, `dn_system_dir`, `logs` and `ext` directories.



#### Restart cluster command

```bash
iotdbctl cluster restart default_cluster
```
* Find the yaml file in the default location according to cluster-name and obtain the configuration information of `confignode_servers`, `datanode_servers`, `grafana` and `prometheus`

* Execute the above stop cluster command (stop), and then execute the start cluster command (start). For details, refer to the above start and stop commands.

*Force restart cluster command*

```bash
iotdbctl cluster restart default_cluster -op force
```
Will directly execute the kill -9 pid command to force stop the cluster, and then start the cluster


*Restart a single node command*

```bash
#Restart datanode_1 according to the IoTDB node name
iotdbctl cluster restart default_cluster -N datanode_1
#Restart confignode_1 according to the IoTDB node name
iotdbctl cluster restart default_cluster -N confignode_1
#Restart grafana
iotdbctl cluster restart default_cluster -N grafana
#Restart prometheus
iotdbctl cluster restart default_cluster -N prometheus
```

#### Cluster shrink command

```bash
#Scale down by node name
iotdbctl cluster scalein default_cluster -N nodename
#Scale down according to ip+port (ip+port obtains the only node according to ip+dn_rpc_port in datanode, and obtains the only node according to ip+cn_internal_port in confignode)
iotdbctl cluster scalein default_cluster -N ip:port
```
* Find the yaml file in the default location according to cluster-name and obtain the configuration information of `confignode_servers` and `datanode_servers`

* Determine whether there is only one confignode node and datanode to be reduced. If there is only one left, the reduction cannot be performed.

* Then get the node information to shrink according to ip:port or nodename, execute the shrink command, and then destroy the node directory. If the shrink node is `data_node`, use `dn_rpc_address` in the yaml file for ip, and use `dn_rpc_address` in the port. `dn_rpc_port` in datanode_servers in yaml file.
  If the shrinking node is `config_node`, the ip uses `cn_internal_address` in confignode_servers in the yaml file, and the port uses `cn_internal_port`


Tip: Currently, only one node scaling is supported at a time

#### Cluster expansion command

```bash
iotdbctl cluster scaleout default_cluster
```
* Modify the config/xxx.yaml file to add a datanode node or confignode node

* Find the yaml file in the default location according to cluster-name and obtain the configuration information of `confignode_servers` and `datanode_servers`

* Find the node to be expanded, upload the IoTDB compressed package and jdb package (if the `jdk_tar_dir` and `jdk_deploy_dir` values ​​are configured in yaml) and decompress it

* Generate and upload `iotdb-common.properties`, `iotdb-confignode.properties` or `iotdb-datanode.properties` according to the yaml file node configuration information

* Execute the command to start the node and verify whether the node is started successfully

Tip: Currently, only one node expansion is supported at a time

#### destroy cluster command
```bash
iotdbctl cluster destroy default_cluster
```

* cluster-name finds the yaml file in the default location

* Check whether the node is still running based on the node node information in `confignode_servers`, `datanode_servers`, `grafana`, and `prometheus`.
  Stop the destroy command if any node is running

* Delete `data` in the IoTDB cluster and `cn_system_dir`, `cn_consensus_dir` configured in the yaml file
  `dn_data_dirs`, `dn_consensus_dir`, `dn_system_dir`, `logs`, `ext`, `IoTDB` deployment directory,
  grafana deployment directory and prometheus deployment directory

*Destroy a single module*

```bash
# Destroy grafana module
iotdbctl cluster destroy default_cluster -N grafana
# Destroy prometheus module
iotdbctl cluster destroy default_cluster -N prometheus
# Destroy iotdb module
iotdbctl cluster destroy default_cluster -N iotdb
```

#### Distribute cluster configuration commands

```bash
iotdbctl cluster distribute default_cluster
```

* Find the yaml file in the default location according to cluster-name and obtain the configuration information of `confignode_servers`, `datanode_servers`, `grafana` and `prometheus`

* Generate and upload `iotdb-common.properties`, `iotdb-confignode.properties`, `iotdb-datanode.properties` to the specified node according to the node configuration information of the yaml file

#### Hot load cluster configuration command

```bash
iotdbctl cluster reload default_cluster
```
* Find the yaml file in the default location according to cluster-name and obtain the configuration information of `confignode_servers` and `datanode_servers`

* Execute `load configuration` in the cli according to the node configuration information of the yaml file.

#### Cluster node log backup
```bash
iotdbctl cluster dumplog default_cluster -N datanode_1,confignode_1  -startdate '2023-04-11' -enddate '2023-04-26' -h 192.168.9.48 -p 36000 -u root -pw root -path '/iotdb/logs' -logs '/root/data/db/iotdb/logs'
```

* Find the yaml file in the default location based on cluster-name

* This command will verify the existence of datanode_1 and confignode_1 according to the yaml file, and then back up the log data of the specified node datanode_1 and confignode_1 to the specified service `192.168.9.48` port 36000 according to the configured start and end dates (startdate&lt;=logtime&lt;=enddate)  The data backup path is `/iotdb/logs`, and the IoTDB log storage path is `/root/data/db/iotdb/logs` (not required, if you do not fill in -logs xxx, the default is to backup logs from the IoTDB installation path /logs )

| command    | description                                                             | required |
|------------|-------------------------------------------------------------------------|----------|
| -h         | backup data server ip                                                   | NO       |
| -u         | backup data server username                                             | NO       |
| -pw        | backup data machine password                                            | NO       |
| -p         | backup data machine port(default 22)                                    | NO       |
| -path      | path to backup data (default current path)                              | NO       |
| -loglevel  | Log levels include all, info, error, warn (default is all)              | NO       |
| -l         | speed limit (default 1024 speed limit range 0 to 104857601 unit Kbit/s) | NO       |
| -N         | multiple configuration file cluster names are separated by commas.      | YES      |
| -startdate | start time (including default 1970-01-01)                               | NO        |
| -enddate   | end time (included)                                                     | NO        |
| -logs      | IoTDB log storage path, the default is ({iotdb}/logs)）                  | NO        |

#### Cluster data backup
```bash
iotdbctl cluster dumpdata default_cluster -granularity partition  -startdate '2023-04-11' -enddate '2023-04-26' -h 192.168.9.48 -p 36000 -u root -pw root -path '/iotdb/datas'
```
* This command will obtain the leader node based on the yaml file, and then back up the data to the /iotdb/datas directory on the 192.168.9.48 service based on the start and end dates (startdate&lt;=logtime&lt;=enddate)

| command      | description                                                             | required |
|--------------|-------------------------------------------------------------------------|----------|
| -h           | backup data server ip                                                   | NO       |
| -u           | backup data server username                                             | NO       |
| -pw          | backup data machine password                                            | NO       |
| -p           | backup data machine port(default 22)                                    | NO       |
| -path        | path to backup data (default current path)                              | NO       |
| -granularity | partition                                                               | YES      |
| -l           | speed limit (default 1024 speed limit range 0 to 104857601 unit Kbit/s) | NO       |
| -startdate   | start time (including default 1970-01-01)                               | YES      |
| -enddate     | end time (included)                                                     | YES      |

#### Cluster upgrade
```bash
iotdbctl cluster upgrade default_cluster
```
* Find the yaml file in the default location according to cluster-name and obtain the configuration information of `confignode_servers` and `datanode_servers`

* Upload lib package

Note that after performing the upgrade, please restart IoTDB for it to take effect.

#### Cluster initialization
```bash
iotdbctl cluster init default_cluster
```
* Find the yaml file in the default location according to cluster-name and obtain the configuration information of `confignode_servers`, `datanode_servers`, `grafana` and `prometheus`
* Initialize cluster configuration

#### View cluster process status
```bash
iotdbctl cluster status default_cluster
```

* Find the yaml file in the default location according to cluster-name and obtain the configuration information of `confignode_servers`, `datanode_servers`, `grafana` and `prometheus`
* Display the survival status of each node in the cluster

#### Cluster authorization activation

Cluster activation is activated by entering the activation code by default, or by using the - op license_path activated through license path

* Default activation method
```bash
iotdbctl cluster activate default_cluster
```
* Find the yaml file in the default location based on `cluster-name` and obtain the `confignode_servers` configuration information
* Obtain the machine code inside
* Waiting for activation code input

```bash
Machine code:
Kt8NfGP73FbM8g4Vty+V9qU5lgLvwqHEF3KbLN/SGWYCJ61eFRKtqy7RS/jw03lHXt4MwdidrZJ==
JHQpXu97IKwv3rzbaDwoPLUuzNCm5aEeC9ZEBW8ndKgGXEGzMms25+u==
Please enter the activation code: 
JHQpXu97IKwv3rzbaDwoPLUuzNCm5aEeC9ZEBW8ndKg=，lTF1Dur1AElXIi/5jPV9h0XCm8ziPd9/R+tMYLsze1oAPxE87+Nwws=
Activation successful
```
* Activate a node

```bash
iotdbctl cluster activate default_cluster -N confignode1
```

* Activate through license path

```bash
iotdbctl cluster activate default_cluster -op license_path 
```
* Find the yaml file in the default location based on `cluster-name` and obtain the `confignode_servers` configuration information
* Obtain the machine code inside
* Waiting for activation code input

```bash
Machine code:
Kt8NfGP73FbM8g4Vty+V9qU5lgLvwqHEF3KbLN/SGWYCJ61eFRKtqy7RS/jw03lHXt4MwdidrZJ==
JHQpXu97IKwv3rzbaDwoPLUuzNCm5aEeC9ZEBW8ndKgGXEGzMms25+u==
Please enter the activation code: 
JHQpXu97IKwv3rzbaDwoPLUuzNCm5aEeC9ZEBW8ndKg=，lTF1Dur1AElXIi/5jPV9h0XCm8ziPd9/R+tMYLsze1oAPxE87+Nwws=
Activation successful
```
* Activate a node

```bash
iotdbctl cluster activate default_cluster -N confignode1 -op license_path
```


### Introduction to Cluster Deployment Tool Samples

In the cluster deployment tool installation directory config/example, there are three yaml examples. If necessary, you can copy them to config and modify them.

| name                        | description                                             |
|-----------------------------|------------------------------------------------|
| default\_1c1d.yaml          | 1 confignode and 1 datanode configuration example                   |
| default\_3c3d.yaml          | 3 confignode and 3 datanode configuration samples                  |
| default\_3c3d\_grafa\_prome | 3 confignode and 3 datanode, Grafana, Prometheus configuration examples |


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

| **Configuration**      | **Description**                                              | **Default**     | **Usage**                                                    |
|------------------------| ------------------------------------------------------------ | --------------- | ------------------------------------------------------------ |
| cn\_internal\_address  | Internal rpc service address of ConfigNode                   | 127.0.0.1       | Set to the IPV4 address or domain name of the server         |
| cn\_internal\_port     | Internal rpc service port of ConfigNode                      | 10710           | Set to any unoccupied port                                   |
| cn\_consensus\_port    | ConfigNode replication consensus protocol communication port | 10720           | Set to any unoccupied port                                   |
| cn\_seed\_config\_node | ConfigNode address to which the node is connected when it is registered to the cluster. Note that Only one ConfigNode can be configured. | 127.0.0.1:10710 | For Seed-ConfigNode, set to its own cn\_internal\_address:cn\_internal\_port; For other ConfigNodes, set to other one running ConfigNode's cn\_internal\_address:cn\_internal\_port |

**Notice: The preceding configuration parameters cannot be changed after the node is started. Ensure that all ports are not occupied. Otherwise, the Node cannot be started.**

##### DataNode configuration

Open the DataNode configuration file ./conf/iotdb-datanode.properties,
and set the following parameters based on the IP address and available port of the server or VM:

| **Configuration**                   | **Description**                                  | **Default**     | **Usage**                                                    |
|-------------------------------------| ------------------------------------------------ | --------------- | ------------------------------------------------------------ |
| dn\_rpc\_address                    | Client RPC Service address                       | 127.0.0.1       | Set to the IPV4 address or domain name of the server         |
| dn\_rpc\_port                       | Client RPC Service port                          | 6667            | Set to any unoccupied port                                   |
| dn\_internal\_address               | Control flow address of DataNode inside cluster  | 127.0.0.1       | Set to the IPV4 address or domain name of the server         |
| dn\_internal\_port                  | Control flow port of DataNode inside cluster     | 10730           | Set to any unoccupied port                                   |
| dn\_mpp\_data\_exchange\_port       | Data flow port of DataNode inside cluster        | 10740           | Set to any unoccupied port                                   |
| dn\_data\_region\_consensus\_port   | Data replicas communication port for consensus   | 10750           | Set to any unoccupied port                                   |
| dn\_schema\_region\_consensus\_port | Schema replicas communication port for consensus | 10760           | Set to any unoccupied port                                   |
| dn\_seed\_config\_node              | Running ConfigNode of the Cluster                | 127.0.0.1:10710 | Set to any running ConfigNode's cn\_internal\_address:cn\_internal\_port. You can set multiple values, separate them with commas(",") |

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

| **Configuration**      | **Check**                                                    |
|------------------------| ------------------------------------------------------------ |
| cn\_internal\_address  | Is set to the IPV4 address or domain name of the server      |
| cn\_internal\_port     | The port isn't occupied                                      |
| cn\_consensus\_port    | The port isn't occupied                                      |
| cn\_seed\_config\_node | Is set to its own internal communication address, which is cn\_internal\_address:cn\_internal\_port |

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

| **Configuration**      | **Check**                                                    |
|------------------------| ------------------------------------------------------------ |
| cn\_internal\_address  | Is set to the IPV4 address or domain name of the server      |
| cn\_internal\_port     | The port isn't occupied                                      |
| cn\_consensus\_port    | The port isn't occupied                                      |
| cn\_seed\_config\_node | Is set to the internal communication address of an other running ConfigNode. The internal communication address of the seed ConfigNode is recommended. |

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
|-------------------------------------| ------------------------------------------------------------ |
| dn\_rpc\_address                    | Is set to the IPV4 address or domain name of the server      |
| dn\_rpc\_port                       | The port isn't occupied                                      |
| dn\_internal\_address               | Is set to the IPV4 address or domain name of the server      |
| dn\_internal\_port                  | The port isn't occupied                                      |
| dn\_mpp\_data\_exchange\_port       | The port isn't occupied                                      |
| dn\_data\_region\_consensus\_port   | The port isn't occupied                                      |
| dn\_schema\_region\_consensus\_port | The port isn't occupied                                      |
| dn\_seed\_config\_node              | Is set to the internal communication address of other running ConfigNodes. The internal communication address of the seed ConfigNode is recommended. |

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
Please read the [Cli manual](https://iotdb.apache.org/UserGuide/Master/QuickStart/Command-Line-Interface.html).

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

## AINode deployment

### Installation environment

#### Recommended Operating System

Ubuntu, CentOS, MacOS

#### Runtime Environment

AINode currently requires Python 3.8 or higher with pip and venv tools.

For networked environments, AINode creates a virtual environment and downloads runtime dependencies automatically, no additional configuration is needed.

In case of a non-networked environment, you can download it from https://cloud.tsinghua.edu.cn/d/4c1342f6c272439aa96c/to get the required dependencies and install them offline.

### Installation steps

Users can download the AINode software installation package, download and unzip it to complete the installation of AINode. You can also download the source code from the code repository and compile it to get the installation package.

### Software directory structure

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

### Start AINode

After completing the deployment of Seed-ConfigNode, you can add an AINode node to support the model registration and inference functions. After specifying the information of IoTDB cluster in the configuration item, you can execute the corresponding commands to start AINode and join the IoTDB cluster.

Note: Starting AINode requires that the system environment contains a Python interpreter of 3.8 or above as the default interpreter, so users should check whether the Python interpreter exists in the environment variables and can be directly invoked through the `python` command before using it.

#### Direct Start

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

#### Specify a customized virtual environment

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

#### Join the cluster

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

### Remove AINode

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

### Stop AINode

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

### Script parameter details

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

### AINode configuration items

AINode supports modifying some necessary parameters. The following parameters can be found in the `conf/iotdb-AINode.properties` file and modified for persistence:

| **Name**                    | **Description**                                                     | **Type** | **Default Value**         | **Modified Mode of Effect**             |
| --------------------------- | ------------------------------------------------------------ | -------- | ------------------ | ---------------------------- |
| ain_seed_config_node | ConfigNode address registered at AINode startup                             | String   | 10710              | Only allow to modify before the first startup |
| ain_inference_rpc_address   | Addresses where AINode provides services and communications                                   | String   | 127.0.0.1          | Effective after reboot                   |
| ain_inference_rpc_port      | AINode provides services and communication ports                                   | String   | 10810              | Effective after reboot                   |
| ain_system_dir              | AINode metadata storage path, the starting directory of the relative path is related to the operating system, it is recommended to use the absolute path. | String   | data/AINode/system | Effective after reboot                   |
| ain_models_dir              | AINode stores the path to the model file. The starting directory of the relative path is related to the operating system, and an absolute path is recommended. | String   | data/AINode/models | Effective after reboot                   |
| ain_logs_dir                | The path where AINode stores the logs. The starting directory of the relative path is related to the operating system, and it is recommended to use the absolute path. | String   | logs/AINode        | Effective after reboot                   |

### Frequently Asked Questions

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