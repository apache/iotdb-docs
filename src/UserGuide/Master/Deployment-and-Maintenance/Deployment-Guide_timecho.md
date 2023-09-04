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

Note: Currently, To run standalone mode, you need to ensure that all addresses are set to 127.0.0.1, If you need to access the IoTDB from a machine different from the one where the IoTDB is located, please change the configuration item `dn_rpc_address` to the IP of the machine where the IoTDB lives. And replication factors set to 1, which is by now the default setting.
Besides, it's recommended to use SimpleConsensus in this mode, since it brings additional efficiency.

### Cluster deployment

#### Cluster management tool

The IoTDB cluster management tool is an easy-to-use operation and maintenance tool (enterprise version tool). 
It is designed to solve the operation and maintenance problems of multiple nodes in the IoTDB distributed system. 
It mainly includes cluster deployment, cluster start and stop, elastic expansion, configuration update, data export and other functions, thereby realizing one-click command issuance for complex database clusters, which greatly Reduce management difficulty. 
This document will explain how to remotely deploy, configure, start and stop IoTDB cluster instances with cluster management tools.

#### Deploy cluster management tools

##### Environment dependence

The machine where IoTDB is to be deployed needs to rely on jdk 8 and above, lsof, netstat, and unzip functions. If not, please install them yourself. You can refer to the installation commands required for the environment in the last section of the document.

Tip: The IoTDB cluster management tool requires an account with root privileges

##### Deployment method

###### Download and install

This tool is a supporting tool for IoTDB Enterprise Edition. You can contact your salesperson to obtain the tool download method.

Note: Since the binary package only supports GLIBC2.17 and above, the minimum version is Centos7.

* After entering the following commands in the iotd directory:

```bash
bash install-iotd.sh
```

The iotd keyword can be activated in the subsequent shell, such as checking the environment instructions required before deployment as follows:

```bash
iotd cluster check example
```

* You can also directly use <iotd absolute path>/sbin/iotd without activating iotd to execute commands, such as checking the environment required before deployment:

```bash
<iotd absolute path>/sbin/iotd cluster check example
```

#### Introduction to cluster configuration files

* There is a cluster configuration yaml file in the `iotd/config` directory. The yaml file name is the cluster name. There can be multiple yaml files. In order to facilitate users to configure yaml files, a `default_cluster.yaml` example is provided under the iotd/config directory.
* The yaml file configuration consists of five major parts: `global`, `confignode_servers`, `datanode_servers`, `grafana_server`, and `prometheus_server`
* `global` is a general configuration that mainly configures machine username and password, IoTDB local installation files, Jdk configuration, etc. A `default_cluster.yaml` sample data is provided in the `iotd/config` directory,
  Users can copy and modify it to their own cluster name and refer to the instructions inside to configure the IoTDB cluster. In the `default_cluster.yaml` sample, all uncommented items are required, and those that have been commented are non-required.

例如要执行`default_cluster.yaml`检查命令则需要执行命令`iotd cluster check default_cluster`即可，
更多详细命令请参考下面命令列表。


| parameter name                           | parameter describe                                                                                                                                                                                                                                                                                                                                                          | required |
|----------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| iotdb_zip_dir              | IoTDB deployment distribution directory, if the value is empty, it will be downloaded from the address specified by `iotdb_download_url`                                                                                                                                                                                                                                    | NO       |
| iotdb_download_url         | IoTDB download address, if `iotdb_zip_dir` has no value, download from the specified address                                                                                                                                                                                                                                                                                | NO       |
| jdk_tar_dir                | jdk local directory, you can use this jdk path to upload and deploy to the target node.                                                                                                                                                                                                                                                                                     | NO       |
| jdk_deploy_dir             | jdk remote machine deployment directory, jdk will be deployed to this directory, and the following `jdk_dir_name` parameter forms a complete jdk deployment directory, that is, `<jdk_deploy_dir>/<jdk_dir_name>`                                                                                                                                                           | NO       |
| jdk_dir_name               | The directory name after jdk decompression defaults to jdk_iotdb                                                                                                                                                                                                                                                                                                            | NO       |
| iotdb_lib_dir              | The IoTDB lib directory or the IoTDB lib compressed package only supports .zip format and is only used for IoTDB upgrade. It is in the comment state by default. If you need to upgrade, please open the comment and modify the path. If you use a zip file, please use the zip command to compress the iotdb/lib directory, such as zip -r lib.zip apache-iotdb-1.2.0/lib/* d | NO       |
| user                       | User name for ssh login deployment machine                                                                                                                                                                                                                                                                                                                                  | YES      |
| password                   | The password for ssh login. If the password does not specify the use of pkey to log in, please ensure that the ssh login between nodes has been configured without a key.                                                                                                                                                                                                   | NO      |
| pkey                       | Key login: If password has a value, password is used first, otherwise pkey is used to log in.                                                                                                                                                                                                                                                                               | NO      |
| ssh_port                   | ssh port                                                                                                                                                                                                                                                                                                                                                                    | YES       |
| deploy_dir                 | IoTDB deployment directory, IoTDB will be deployed to this directory and the following `iotdb_dir_name` parameter will form a complete IoTDB deployment directory, that is, `<deploy_dir>/<iotdb_dir_name>`                                                                                                                                                                 | YES       |
| iotdb_dir_name             | The directory name after decompression of IoTDB is iotdb by default.                                                                                                                                                                                                                                                                                                        | NO      |
| datanode-env.sh            | Corresponding to `iotdb/config/datanode-env.sh`, when `global` and `confignode_servers` are configured at the same time, the value in `confignode_servers` is used first                                                                                                                                                                                                    | NO      |
| confignode-env.sh          | Corresponding to `iotdb/config/confignode-env.sh`, the value in `datanode_servers` is used first when `global` and `datanode_servers` are configured at the same time                                                                                                                                                                                                       | NO      |
| iotdb-common.properties    | Corresponds to `<iotdb path>/config/iotdb-common.properties`                                                                                                                                                                                                                                                                                                                | NO      |
| cn_target_config_node_list | The cluster configuration address points to the surviving ConfigNode, and it points to confignode_x by default. When `global` and `confignode_servers` are configured at the same time, the value in `confignode_servers` is used first, corresponding to `cn_target_config_node_list` in `iotdb/config/iotdb-confignode.properties`                                        | YES       |
| dn_target_config_node_list | The cluster configuration address points to the surviving ConfigNode, and points to confignode_x by default. When configuring values for `global` and `datanode_servers` at the same time, the value in `datanode_servers` is used first, corresponding to `dn_target_config_node_list` in `iotdb/config/iotdb-datanode.properties`                                         | YES       |

Among them, datanode-env.sh and confignode-env.sh can be configured with extra parameters extra_opts. When this parameter is configured, corresponding values will be appended after datanode-env.sh and confignode-env.sh. Refer to default_cluster.yaml for configuration examples as follows:
datanode-env.sh:   
extra_opts: |
IOTDB_JMX_OPTS="$IOTDB_JMX_OPTS -XX:+UseG1GC"
IOTDB_JMX_OPTS="$IOTDB_JMX_OPTS -XX:MaxGCPauseMillis=200"

* `confignode_servers` is the configuration for deploying IoTDB Confignodes, in which multiple Confignodes can be configured
  By default, the first started ConfigNode node node1 is regarded as the Seed-ConfigNode

|parameter name                           | parameter describe                                                                                                                                                                | required |
|---------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| name                      | Confignode name                                                                                                                                                                   | YES      |
| deploy_dir                | IoTDB config node deployment directory                                                                                                                                                            | YES｜     |
| iotdb-confignode.properties | Corresponding to `iotdb/config/iotdb-confignode.properties`, please refer to the `iotdb-confignode.properties` file description for more details.                                                                                             | NO       |
| cn_internal_address       | Corresponds to iotdb/internal communication address, corresponding to `cn_internal_address` in `iotdb/config/iotdb-confignode.properties`                                                                                              | YES      |
| cn_target_config_node_list | The cluster configuration address points to the surviving ConfigNode, and it points to confignode_x by default. When `global` and `confignode_servers` are configured at the same time, the value in `confignode_servers` is used first, corresponding to `cn_target_config_node_list` in `iotdb/config/iotdb-confignode.properties` | YES      |
| cn_internal_port          | Internal communication port, corresponding to `cn_internal_port` in `iotdb/config/iotdb-confignode.properties`                                                                                                          | YES      |
| cn_consensus_port         | Corresponds to `cn_consensus_port` in `iotdb/config/iotdb-confignode.properties`                                                                                                               | NO      |
| cn_data_dir               | Corresponds to `cn_consensus_port` in `iotdb/config/iotdb-confignode.properties` Corresponds to `cn_data_dir` in `iotdb/config/iotdb-confignode.properties`                                                                                                                       | YES      |
| iotdb-common.properties   | Corresponding to `iotdb/config/iotdb-common.properties`, when configuring values in `global` and `confignode_servers` at the same time, the value in confignode_servers will be used first.                                                                              | NO      |

* datanode_servers 是部署IoTDB Datanodes配置，里面可以配置多个Datanode

|parameter name                           | parameter describe                                                                                                                                                                                                                                                                                                                   | required |
| ---|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
|name| Datanode name                                                                                                                                                                                                                                                                                                                        | YES      |
|deploy_dir| IoTDB data node deployment directory                                                                                                                                                                                                                                                                                                 | YES      |
|iotdb-datanode.properties| Corresponding to `iotdb/config/iotdb-datanode.properties`, please refer to the `iotdb-datanode.properties` file description for more details.                                                                                                                                                                                        | NO       |
|dn_rpc_address| The datanode rpc address corresponds to `dn_rpc_address` in `iotdb/config/iotdb-datanode.properties`                                                                                                                                                                                                                                 | YES      |
|dn_internal_address| Internal communication address, corresponding to `dn_internal_address` in `iotdb/config/iotdb-datanode.properties`                                                                                                                                                                                                                   | YES      |
|dn_target_config_node_list| The cluster configuration address points to the surviving ConfigNode, and points to confignode_x by default. When configuring values for `global` and `datanode_servers` at the same time, the value in `datanode_servers` is used first, corresponding to `dn_target_config_node_list` in `iotdb/config/iotdb-datanode.properties`. | YES      |
|dn_rpc_port| Datanode rpc port address, corresponding to `dn_rpc_port` in `iotdb/config/iotdb-datanode.properties`                                                                                                                                                                                                                                | YES      |
|dn_internal_port| Internal communication port, corresponding to `dn_internal_port` in `iotdb/config/iotdb-datanode.properties`                                                                                                                                                                                                                         | YES      |
|iotdb-common.properties| Corresponding to `iotdb/config/iotdb-common.properties`, when configuring values in `global` and `datanode_servers` at the same time, the value in `datanode_servers` will be used first.                                                                                                                                                                                                                                   | NO      |

* grafana_server is the configuration related to deploying Grafana

|parameter name                           | parameter describe                                          | required  |
|------------------|-------------------------------------------------------------|-----------|
| grafana_dir_name | Grafana decompression directory name(default grafana_iotdb) | NO        |
| host             | Server ip deployed by grafana                               | YES       |
| grafana_port     | The port of grafana deployment machine, default 3000                                      | NO        |
| deploy_dir       | grafana deployment server directory                                            | YES       |
| grafana_tar_dir  | Grafana compressed package location                                               | YES       |
| dashboards       | dashboards directory                                            | NO |

* prometheus_server 是部署Prometheus 相关配置

|parameter name                           | parameter describe                                 | required |
|---------------------|----------------------------------------------------|----------|
| prometheus_dir_name | prometheus decompression directory name, default prometheus_iotdb               | NO       |
| host                | Server IP deployed by prometheus                                | YES      |
| prometheus_port     | The port of prometheus deployment machine, default 9090                          | NO       |
| deploy_dir          | prometheus deployment server directory                                 | YES      |
| prometheus_tar_dir  | prometheus compressed package path                                   | YES      |
| storage_tsdb_retention_time  | The number of days to save data is 15 days by default                                     | NO       |
| storage_tsdb_retention_size  | The data size that can be saved by the specified block defaults to 512M. Please note the units are KB, MB, GB, TB, PB, and EB. | NO       |

If metrics are configured in `iotdb-datanode.properties` and `iotdb-confignode.properties` of config/xxx.yaml, the configuration will be automatically put into promethues without manual modification.

Note: How to configure the value corresponding to the yaml key to contain special characters such as: etc. It is recommended to use double quotes for the entire value, and do not use paths containing spaces in the corresponding file paths to prevent abnormal recognition problems.

#### scenes to be used

##### Clean data

* Cleaning up the cluster data scenario will delete the data directory in the IoTDB cluster and `cn_system_dir`, `cn_consensus_dir`, `cn_consensus_dir` configured in the yaml file
  `dn_data_dirs`, `dn_consensus_dir`, `dn_system_dir`, `logs` and `ext` directories.
* First execute the stop cluster command, and then execute the cluster cleanup command.

```bash
iotd cluster stop default_cluster
iotd cluster clean default_cluster
```

##### Cluster destruction

* The cluster destruction scenario will delete `data`, `cn_system_dir`, `cn_consensus_dir`, in the IoTDB cluster
  `dn_data_dirs`, `dn_consensus_dir`, `dn_system_dir`, `logs`, `ext`, `IoTDB` deployment directory,
  grafana deployment directory and prometheus deployment directory.
* First execute the stop cluster command, and then execute the cluster destruction command.


```bash
iotd cluster stop default_cluster
iotd cluster destroy default_cluster
```

##### Cluster upgrade

* To upgrade the cluster, you first need to configure `iotdb_lib_dir` in config/xxx.yaml as the directory path where the jar to be uploaded to the server is located (for example, iotdb/lib).
* If you use zip files to upload, please use the zip command to compress the iotdb/lib directory, such as zip -r lib.zip apache-iotdb-1.2.0/lib/*
* Execute the upload command and then execute the restart IoTDB cluster command to complete the cluster upgrade.

```bash
iotd cluster upgrade default_cluster
iotd cluster restart default_cluster
```

##### hot deployment

* First modify the configuration in config/xxx.yaml.
* Execute the distribution command, and then execute the hot deployment command to complete the hot deployment of the cluster configuration

```bash
iotd cluster distribute default_cluster
iotd cluster reload default_cluster
```

##### Cluster expansion

* First modify and add a datanode or confignode node in config/xxx.yaml.
* Execute the cluster expansion command

```bash
iotd cluster scaleout default_cluster
```

##### Cluster scaling

* First find the node name or ip+port to shrink in config/xxx.yaml (where confignode port is cn_internal_port, datanode port is rpc_port)
* Execute cluster shrink command

```bash
iotd cluster scalein default_cluster
```

##### Using cluster management tools to manipulate existing IoTDB clusters

* Configure the server's `user`, `passwod` or `pkey`, `ssh_port`
* Modify the IoTDB deployment path in config/xxx.yaml, `deploy_dir` (IoTDB deployment directory), `iotdb_dir_name` (IoTDB decompression directory name, the default is iotdb)
  For example, if the full path of IoTDB deployment is `/home/data/apache-iotdb-1.1.1`, you need to modify the yaml files `deploy_dir:/home/data/` and `iotdb_dir_name:apache-iotdb-1.1.1`
* If the server is not using java_home, modify `jdk_deploy_dir` (jdk deployment directory) and `jdk_dir_name` (the directory name after jdk decompression, the default is jdk_iotdb). If java_home is used, there is no need to modify the configuration.
  For example, the full path of jdk deployment is `/home/data/jdk_1.8.2`, you need to modify the yaml files `jdk_deploy_dir:/home/data/`, `jdk_dir_name:jdk_1.8.2`
* Configure `cn_target_config_node_list`, `dn_target_config_node_list`
* Configure `cn_internal_address`, `cn_internal_port`, `cn_consensus_port`, `cn_system_dir`, in `iotdb-confignode.properties` in `confignode_servers`
  If the values in `cn_consensus_dir` and `iotdb-common.properties` are not the default for IoTDB, they need to be configured, otherwise there is no need to configure them.
* Configure `dn_rpc_address`, `dn_internal_address`, `dn_data_dirs`, `dn_consensus_dir`, `dn_system_dir` and `iotdb-common.properties` in `iotdb-datanode.properties` in `datanode_servers`
* Execute initialization command

```bash
iotd cluster init default_cluster
```

##### Deploy IoTDB, Grafana and Prometheus

* Configure `iotdb-datanode.properties`, `iotdb-confignode.properties` to open the metrics interface
* Configure the Grafana configuration. If there are multiple `dashboards`, separate them with commas. The names cannot be repeated or they will be overwritten.
* Configure the Prometheus configuration. If the IoTDB cluster is configured with metrics, there is no need to manually modify the Prometheus configuration. The Prometheus configuration will be automatically modified according to which node is configured with metrics.
* Start the cluster

```bash
iotd cluster start default_cluster
```

For more detailed parameters, please refer to the cluster configuration file introduction above

#### Command

The basic usage of this tool is:
```bash
iotd cluster <key> <cluster name> [params (Optional)]
```
* key indicates a specific command.

* cluster name indicates the cluster name (that is, the name of the yaml file in the `iotd/config` file).

* params indicates the required parameters of the command (optional).

* For example, the command format to deploy the default_cluster cluster is:

```bash
iotd cluster deploy default_cluster
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

#### Detailed command execution process

The following commands are executed using default_cluster.yaml as an example, and users can modify them to their own cluster files to execute

##### Check cluster deployment environment commands

```bash
iotd cluster check default_cluster
```

* Find the yaml file in the default location according to cluster-name and obtain the configuration information of `confignode_servers` and `datanode_servers`

* Verify that the target node is able to log in via SSH

* Verify whether the JDK version on the corresponding node meets IoTDB jdk1.8 and above, and whether the server is installed with unzip, lsof, and netstat.

* If you see the following prompt `Info:example check successfully!`, it proves that the server has already met the installation requirements.
  If `Error:example check fail!` is output, it proves that some conditions do not meet the requirements. You can check the Error log output above (for example: `Error:Server (ip:172.20.31.76) iotdb port(10713) is listening`) to make repairs. ,
  If the jdk check does not meet the requirements, we can configure a jdk1.8 or above version in the yaml file ourselves for deployment without affecting subsequent use.
  If checking lsof, netstat or unzip does not meet the requirements, you need to install it on the server yourself.

##### Deploy cluster command

```bash
iotd cluster deploy default_cluster
```

* Find the yaml file in the default location according to cluster-name and obtain the configuration information of `confignode_servers` and `datanode_servers`

* Upload IoTDB compressed package and jdk compressed package according to the node information in `confignode_servers` and `datanode_servers` (if `jdk_tar_dir` and `jdk_deploy_dir` values ​​are configured in yaml)

* Generate and upload `iotdb-common.properties`, `iotdb-confignode.properties`, `iotdb-datanode.properties` according to the yaml file node configuration information

```bash
iotd cluster deploy default_cluster -op force
```

Note: This command will force the deployment, and the specific process will delete the existing deployment directory and redeploy

*deploy a single module*
```bash
# Deploy grafana module
iotd cluster deploy default_cluster -N grafana
# Deploy the prometheus module
iotd cluster deploy default_cluster -N prometheus
# Deploy the iotdb module
iotd cluster deploy default_cluster -N iotdb
```

##### Start cluster command

```bash
iotd cluster start default_cluster
```

* Find the yaml file in the default location according to cluster-name and obtain the configuration information of `confignode_servers` and `datanode_servers`

* Start confignode, start sequentially according to the order in `confignode_servers` in the yaml configuration file and check whether the confignode is normal according to the process id, the first confignode is seek config

* Start the datanode in sequence according to the order in `datanode_servers` in the yaml configuration file and check whether the datanode is normal according to the process id.

* After checking the existence of the process according to the process id, check whether each service in the cluster list is normal through the cli. If the cli link fails, retry every 10s until it succeeds and retry up to 5 times


*
Start a single node command*
```bash
#Start according to the IoTDB node name
iotd cluster start default_cluster -N datanode_1
#Start according to IoTDB cluster ip+port, where port corresponds to cn_internal_port of confignode and rpc_port of datanode.
iotd cluster start default_cluster -N 192.168.1.5:6667
#Start grafana
iotd cluster start default_cluster -N grafana
#Start prometheus
iotd cluster start default_cluster -N prometheus
```

* Find the yaml file in the default location based on cluster-name

* Find the node location information based on the provided node name or ip:port. If the started node is `data_node`, the ip uses `dn_rpc_address` in the yaml file, and the port uses `dn_rpc_port` in datanode_servers in the yaml file.
  If the started node is `config_node`, the ip uses `cn_internal_address` in confignode_servers in the yaml file, and the port uses `cn_internal_port`

* start the node

Note: Since the cluster deployment tool only calls the start-confignode.sh and start-datanode.sh scripts in the IoTDB cluster,
When the actual output result fails, it may be that the cluster has not started normally. It is recommended to use the status command to check the current cluster status (iotd cluster status xxx)


##### View IoTDB cluster status command

```bash
iotd cluster show default_cluster
#View IoTDB cluster details
iotd cluster show default_cluster details
```
* Find the yaml file in the default location according to cluster-name and obtain the configuration information of `confignode_servers` and `datanode_servers`

* Execute `show cluster details` through cli on datanode in turn. If one node is executed successfully, it will not continue to execute cli on subsequent nodes and return the result directly.

##### Stop cluster command


```bash
iotd cluster stop default_cluster
```
* Find the yaml file in the default location according to cluster-name and obtain the configuration information of `confignode_servers` and `datanode_servers`

* According to the datanode node information in `datanode_servers`, stop the datanode nodes in order according to the configuration.

* Based on the confignode node information in `confignode_servers`, stop the confignode nodes in sequence according to the configuration

*force stop cluster command*

```bash
iotd cluster stop default_cluster -op force
```
Will directly execute the kill -9 pid command to forcibly stop the cluster

*Stop single node command*

```bash
#Stop by IoTDB node name
iotd cluster stop default_cluster -N datanode_1
#Stop according to IoTDB cluster ip+port (ip+port is to get the only node according to ip+dn_rpc_port in datanode or ip+cn_internal_port in confignode to get the only node)
iotd cluster stop default_cluster -N 192.168.1.5:6667
#Stop grafana
iotd cluster stop default_cluster -N grafana
#Stop prometheus
iotd cluster stop default_cluster -N prometheus
```

* Find the yaml file in the default location based on cluster-name

* Find the corresponding node location information based on the provided node name or ip:port. If the stopped node is `data_node`, the ip uses `dn_rpc_address` in the yaml file, and the port uses `dn_rpc_port` in datanode_servers in the yaml file.
  If the stopped node is `config_node`, the ip uses `cn_internal_address` in confignode_servers in the yaml file, and the port uses `cn_internal_port`

* stop the node

Note: Since the cluster deployment tool only calls the stop-confignode.sh and stop-datanode.sh scripts in the IoTDB cluster, in some cases the iotdb cluster may not be stopped.


##### Clean cluster data command

```bash
iotd cluster clean default_cluster
```

* Find the yaml file in the default location according to cluster-name and obtain the configuration information of `confignode_servers` and `datanode_servers`

* Based on the information in `confignode_servers` and `datanode_servers`, check whether there are still services running,
  If any service is running, the cleanup command will not be executed.

* Delete the data directory in the IoTDB cluster and the `cn_system_dir`, `cn_consensus_dir`, configured in the yaml file
  `dn_data_dirs`, `dn_consensus_dir`, `dn_system_dir`, `logs` and `ext` directories.



##### Restart cluster command

```bash
iotd cluster restart default_cluster
```
* Find the yaml file in the default location according to cluster-name and obtain the configuration information of `confignode_servers`, `datanode_servers`, `grafana` and `prometheus`

* Execute the above stop cluster command (stop), and then execute the start cluster command (start). For details, refer to the above start and stop commands.

*Force restart cluster command*

```bash
iotd cluster restart default_cluster -op force
```
Will directly execute the kill -9 pid command to force stop the cluster, and then start the cluster


*Restart a single node command*

```bash
#Restart datanode_1 according to the IoTDB node name
iotd cluster restart default_cluster -N datanode_1
#Restart confignode_1 according to the IoTDB node name
iotd cluster restart default_cluster -N confignode_1
#Restart grafana
iotd cluster restart default_cluster -N grafana
#Restart prometheus
iotd cluster restart default_cluster -N prometheus
```

##### Cluster shrink command

```bash
#Scale down by node name
iotd cluster scalein default_cluster -N nodename
#Scale down according to ip+port (ip+port obtains the only node according to ip+dn_rpc_port in datanode, and obtains the only node according to ip+cn_internal_port in confignode)
iotd cluster scalein default_cluster -N ip:port
```
* Find the yaml file in the default location according to cluster-name and obtain the configuration information of `confignode_servers` and `datanode_servers`

* Determine whether there is only one confignode node and datanode to be reduced. If there is only one left, the reduction cannot be performed.

* Then get the node information to shrink according to ip:port or nodename, execute the shrink command, and then destroy the node directory. If the shrink node is `data_node`, use `dn_rpc_address` in the yaml file for ip, and use `dn_rpc_address` in the port. `dn_rpc_port` in datanode_servers in yaml file.
  If the shrinking node is `config_node`, the ip uses `cn_internal_address` in confignode_servers in the yaml file, and the port uses `cn_internal_port`


Tip: Currently, only one node scaling is supported at a time

##### Cluster expansion command

```bash
iotd cluster scaleout default_cluster
```
* Modify the config/xxx.yaml file to add a datanode node or confignode node

* Find the yaml file in the default location according to cluster-name and obtain the configuration information of `confignode_servers` and `datanode_servers`

* Find the node to be expanded, upload the IoTDB compressed package and jdb package (if the `jdk_tar_dir` and `jdk_deploy_dir` values ​​are configured in yaml) and decompress it

* Generate and upload `iotdb-common.properties`, `iotdb-confignode.properties` or `iotdb-datanode.properties` according to the yaml file node configuration information

* Execute the command to start the node and verify whether the node is started successfully

Tip: Currently, only one node expansion is supported at a time

##### destroy cluster command
```bash
iotd cluster destroy default_cluster
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
iotd cluster destroy default_cluster -N grafana
# Destroy prometheus module
iotd cluster destroy default_cluster -N prometheus
# Destroy iotdb module
iotd cluster destroy default_cluster -N iotdb
```

##### Distribute cluster configuration commands

```bash
iotd cluster distribute default_cluster
```

* Find the yaml file in the default location according to cluster-name and obtain the configuration information of `confignode_servers`, `datanode_servers`, `grafana` and `prometheus`

* Generate and upload `iotdb-common.properties`, `iotdb-confignode.properties`, `iotdb-datanode.properties` to the specified node according to the node configuration information of the yaml file

##### Hot load cluster configuration command

```bash
iotd cluster reload default_cluster
```
* Find the yaml file in the default location according to cluster-name and obtain the configuration information of `confignode_servers` and `datanode_servers`

* Execute `load configuration` in the cli according to the node configuration information of the yaml file.

##### Cluster node log backup
```bash
iotd cluster dumplog default_cluster -N datanode_1,confignode_1  -startdate '2023-04-11' -enddate '2023-04-26' -h 192.168.9.48 -p 36000 -u root -pw root -path '/iotdb/logs' -logs '/root/data/db/iotdb/logs'
```

* Find the yaml file in the default location based on cluster-name

* This command will verify the existence of datanode_1 and confignode_1 according to the yaml file, and then back up the log data of the specified node datanode_1 and confignode_1 to the specified service `192.168.9.48` port `36000 according to the configured start and end dates (startdate<=logtime<=enddate) ` The data backup path is `/iotdb/logs`, and the IoTDB log storage path is `/root/data/db/iotdb/logs` (not required, if you do not fill in -logs xxx, the default is to backup logs from the IoTDB installation path /logs )

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

##### Cluster data backup
```bash
iotd cluster dumpdata default_cluster -granularity partition  -startdate '2023-04-11' -enddate '2023-04-26' -h 192.168.9.48 -p 36000 -u root -pw root -path '/iotdb/datas'
```
* This command will obtain the leader node based on the yaml file, and then back up the data to the /iotdb/datas directory on the 192.168.9.48 service based on the start and end dates (startdate<=logtime<=enddate)

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

##### Cluster upgrade
```bash
iotd cluster upgrade default_cluster
```
* Find the yaml file in the default location according to cluster-name and obtain the configuration information of `confignode_servers` and `datanode_servers`

* Upload lib package

Note that after performing the upgrade, please restart IoTDB for it to take effect.

##### Cluster initialization
```bash
iotd cluster init default_cluster
```
* Find the yaml file in the default location according to cluster-name and obtain the configuration information of `confignode_servers`, `datanode_servers`, `grafana` and `prometheus`
* Initialize cluster configuration

##### View cluster process status
```bash
iotd cluster status default_cluster
```

* Find the yaml file in the default location according to cluster-name and obtain the configuration information of `confignode_servers`, `datanode_servers`, `grafana` and `prometheus`
* Display the survival status of each node in the cluster

#### Introduction to Cluster Deployment Tool Samples

In the cluster deployment tool installation directory config/example, there are three yaml examples. If necessary, you can copy them to config and modify them.

| name                     | description                                             |
|--------------------------|------------------------------------------------|
| default_1c1d.yaml        | 1 confignode and 1 datanode configuration example                   |
| default_3c3d.yaml        | 3 confignode and 3 datanode configuration samples                  |
| default_3c3d_grafa_prome | 3 confignode and 3 datanode, Grafana, Prometheus configuration examples |


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
[Deployment Recommendation](https://iotdb.apache.org/UserGuide/Master/Cluster/Deployment-Recommendation.html):

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

**Notice:** Please set these parameters carefully based on the [Deployment Recommendation](https://iotdb.apache.org/UserGuide/Master/Cluster/Deployment-Recommendation.html).
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