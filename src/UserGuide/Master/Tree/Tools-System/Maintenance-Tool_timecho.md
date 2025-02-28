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
# Cluster management tool

## 1. IoTDB-OpsKit

The IoTDB OpsKit is an easy-to-use operation and maintenance tool (enterprise version tool).
It is designed to solve the operation and maintenance problems of multiple nodes in the IoTDB distributed system.
It mainly includes cluster deployment, cluster start and stop, elastic expansion, configuration update, data export and other functions, thereby realizing one-click command issuance for complex database clusters, which greatly Reduce management difficulty.
This document will explain how to remotely deploy, configure, start and stop IoTDB cluster instances with cluster management tools.

### 1.1 Environment dependence

This tool is a supporting tool for TimechoDB(Enterprise Edition based on IoTDB). You can contact your sales representative to obtain the tool download method.

The machine where IoTDB is to be deployed needs to rely on jdk 8 and above, lsof, netstat, and unzip functions. If not, please install them yourself. You can refer to the installation commands required for the environment in the last section of the document.

Tip: The IoTDB cluster management tool requires an account with root privileges

### 1.2 Deployment method

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

### 1.3 Introduction to cluster configuration files

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
| iotdb-system.properties | Corresponds to `<iotdb path>/config/iotdb-system.properties`                                                                                                                                                                                                                                                                                                                   | NO      |
| cn\_internal\_address   | The cluster configuration address points to the surviving ConfigNode, and it points to confignode_x by default. When `global` and `confignode_servers` are configured at the same time, the value in `confignode_servers` is used first, corresponding to `cn_internal_address` in `iotdb/config/iotdb-system.properties`                                                      | YES       |
| dn\_internal\_address   | The cluster configuration address points to the surviving ConfigNode, and points to confignode_x by default. When configuring values for `global` and `datanode_servers` at the same time, the value in `datanode_servers` is used first, corresponding to `dn_internal_address` in `iotdb/config/iotdb-system.properties`                                                   | YES       |

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
| cn\_internal\_address       | Corresponds to iotdb/internal communication address, corresponding to `cn_internal_address` in `iotdb/config/iotdb-system.properties`                                                                                              | YES      |
| cn_internal_address       | The cluster configuration address points to the surviving ConfigNode, and it points to confignode_x by default. When `global` and `confignode_servers` are configured at the same time, the value in `confignode_servers` is used first, corresponding to `cn_internal_address` in `iotdb/config/iotdb-system.properties` | YES      |
| cn\_internal\_port          | Internal communication port, corresponding to `cn_internal_port` in `iotdb/config/iotdb-system.properties`                                                                                                          | YES      |
| cn\_consensus\_port         | Corresponds to `cn_consensus_port` in `iotdb/config/iotdb-system.properties`                                                                                                               | NO      |
| cn\_data\_dir               | Corresponds to `cn_consensus_port` in `iotdb/config/iotdb-system.properties` Corresponds to `cn_data_dir` in `iotdb/config/iotdb-system.properties`                                                                                                                       | YES      |
| iotdb-system.properties     | Corresponding to `iotdb/config/iotdb-system.properties`, when configuring values in `global` and `confignode_servers` at the same time, the value in confignode_servers will be used first.                                                                              | NO      |

* datanode_servers 是部署IoTDB Datanodes配置，里面可以配置多个Datanode

| parameter name          | parameter describe                                                                                                                                                                                                                                                                                                            | required |
|-------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| name                    | Datanode name                                                                                                                                                                                                                                                                                                                 | YES      |
| deploy\_dir             | IoTDB data node deployment directory                                                                                                                                                                                                                                                                                          | YES      |
| dn\_rpc\_address        | The datanode rpc address corresponds to `dn_rpc_address` in `iotdb/config/iotdb-system.properties`                                                                                                                                                                                                                          | YES      |
| dn\_internal\_address   | Internal communication address, corresponding to `dn_internal_address` in `iotdb/config/iotdb-system.properties`                                                                                                                                                                                                            | YES      |
| dn\_seed\_config\_node  | The cluster configuration address points to the surviving ConfigNode, and points to confignode_x by default. When configuring values for `global` and `datanode_servers` at the same time, the value in `datanode_servers` is used first, corresponding to `dn_seed_config_node` in `iotdb/config/iotdb-system.properties`. | YES      |
| dn\_rpc\_port           | Datanode rpc port address, corresponding to `dn_rpc_port` in `iotdb/config/iotdb-system.properties`                                                                                                                                                                                                                         | YES      |
| dn\_internal\_port      | Internal communication port, corresponding to `dn_internal_port` in `iotdb/config/iotdb-system.properties`                                                                                                                                                                                                                  | YES      |
| iotdb-system.properties | Corresponding to `iotdb/config/iotdb-system.properties`, when configuring values in `global` and `datanode_servers` at the same time, the value in `datanode_servers` will be used first.                                                                                                                                     | NO      |

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

If metrics are configured in `iotdb-system.properties` and `iotdb-system.properties` of config/xxx.yaml, the configuration will be automatically put into promethues without manual modification.

Note: How to configure the value corresponding to the yaml key to contain special characters such as: etc. It is recommended to use double quotes for the entire value, and do not use paths containing spaces in the corresponding file paths to prevent abnormal recognition problems.

### 1.4 scenes to be used

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
iotdbctl cluster dist-lib default_cluster
iotdbctl cluster restart default_cluster
```

#### hot deployment

* First modify the configuration in config/xxx.yaml.
* Execute the distribution command, and then execute the hot deployment command to complete the hot deployment of the cluster configuration

```bash
iotdbctl cluster dist-conf default_cluster
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
* Configure `cn_internal_address`, `cn_internal_port`, `cn_consensus_port`, `cn_system_dir`, in `iotdb-system.properties` in `confignode_servers`
  If the values in `cn_consensus_dir` and `iotdb-system.properties` are not the default for IoTDB, they need to be configured, otherwise there is no need to configure them.
* Configure `dn_rpc_address`, `dn_internal_address`, `dn_data_dirs`, `dn_consensus_dir`, `dn_system_dir` in `iotdb-system.properties`
* Execute initialization command

```bash
iotdbctl cluster init default_cluster
```

#### Deploy IoTDB, Grafana and Prometheus

* Configure `iotdb-system.properties` to open the metrics interface
* Configure the Grafana configuration. If there are multiple `dashboards`, separate them with commas. The names cannot be repeated or they will be overwritten.
* Configure the Prometheus configuration. If the IoTDB cluster is configured with metrics, there is no need to manually modify the Prometheus configuration. The Prometheus configuration will be automatically modified according to which node is configured with metrics.
* Start the cluster

```bash
iotdbctl cluster start default_cluster
```

For more detailed parameters, please refer to the cluster configuration file introduction above

### 1.5 Command

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

| command         | description                                                                                      | parameter                                                                                                                                                                                                                                        |
|-----------------|-----------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| check           | check whether the cluster can be deployed                                                     | Cluster name list                                                                                                                                                                                                                                |
| clean           | cleanup-cluster                                                                               | cluster-name                                                                                                                                                                                                                                     |
| deploy/dist-all | deploy cluster                                                                                | Cluster name, -N, module name (optional for iotdb, grafana, prometheus), -op force (optional)                                                                                                                                                    |
| list            | cluster status list                                                                           | None                                                                                                                                                                                                                                             |
| start           | start cluster                                                                                 | Cluster name, -N, node name (nodename, grafana, prometheus optional)                                                                                                                                                                             |
| stop            | stop cluster                                                                                  | Cluster name, -N, node name (nodename, grafana, prometheus optional), -op force (nodename, grafana, prometheus optional)                                                                                                                         |
| restart         | restart cluster                                                                               | Cluster name, -N, node name (nodename, grafana, prometheus optional), -op force (nodename, grafana, prometheus optional)                                                                                                                         |
| show            | view cluster information. The details field indicates the details of the cluster information. | Cluster name, details (optional)                                                                                                                                                                                                                 |
| destroy         | destroy cluster                                                                               | Cluster name, -N, module name (iotdb, grafana, prometheus optional)                                                                                                                                                                              |
| scaleout        | cluster expansion                                                                             | Cluster name                                                                                                                                                                                                                                     |
| scalein         | cluster shrink                                                                                | Cluster name, -N, cluster node name or cluster node ip+port                                                                                                                                                                                      |
| reload          | hot loading of cluster configuration files                                                    | Cluster name                                                                                                                                                                                                                                     |
| dist-conf       | cluster configuration file distribution                                                       | Cluster name                                                                                                                                                                                                                                     |
| dumplog         | Back up specified cluster logs                                                                                      | Cluster name, -N, cluster node name -h Back up to target machine ip -pw Back up to target machine password -p Back up to target machine port -path Backup directory -startdate Start time -enddate End time -loglevel Log type -l transfer speed |
| dumpdata        | Backup cluster data                                                                                      | Cluster name, -h backup to target machine ip -pw backup to target machine password -p backup to target machine port -path backup directory -startdate start time -enddate end time -l transmission speed                                         |
| dist-lib        | lib package upgrade                                                                                       | Cluster name                                                                                                                                                                                                                                     |
| init            | When an existing cluster uses the cluster deployment tool, initialize the cluster configuration             | Cluster name                                                                                                                                                                                                                                     |
| status          | View process status                                                                                        | Cluster name                                                                                                                                                                                                                                     |
| activate        | Activate cluster                                                                                        | Cluster name                                                                                                                                                                                                                                     |
| health_check    | health check                                                                                    | Cluster name, -N, nodename (optional)                                                                                                                                                                                                           |
| backup          | Activate cluster                                                                                | Cluster name,-N nodename (optional)                                                                                                                                                                                                             |
| importschema    | Activate cluster                                                                                | Cluster name,-N nodename  -param   paramters                                                                                                                                                                                                    |
| exportschema    | Activate cluster                                                                                | Cluster name,-N nodename  -param   paramters                                                                                                                                                                                                    |



### 1.6 Detailed command execution process

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

* Generate and upload `iotdb-system.properties` according to the yaml file node configuration information

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

* Generate and upload `iotdb-system.properties` according to the yaml file node configuration information

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
iotdbctl cluster dist-conf default_cluster
```

* Find the yaml file in the default location according to cluster-name and obtain the configuration information of `confignode_servers`, `datanode_servers`, `grafana` and `prometheus`

* Generate and upload `iotdb-system.properties` to the specified node according to the node configuration information of the yaml file

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
iotdbctl cluster dist-lib default_cluster
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

#### Cluster Health Check
```bash
iotdbctl cluster health_check default_cluster
```
* Locate the yaml file in the default location based on the cluster-name to retrieve confignode_servers and datanode_servers configuration information.
* Execute health_check.sh on each node.
* Single Node Health Check
```bash
iotdbctl cluster health_check default_cluster -N datanode_1
```
* Locate the yaml file in the default location based on the cluster-name to retrieve datanode_servers configuration information.
* Execute health_check.sh on datanode1.

#### Cluster Shutdown Backup

```bash
iotdbctl cluster backup default_cluster
```
* Locate the yaml file in the default location based on the cluster-name to retrieve confignode_servers and datanode_servers configuration information.
* Execute backup.sh on each node

* Single Node Backup

```bash
iotdbctl cluster backup default_cluster -N datanode_1
```

* Locate the yaml file in the default location based on the cluster-name to retrieve datanode_servers configuration information.
* Execute backup.sh on datanode1.
Note: Multi-node deployment on a single machine only supports quick mode.

#### Cluster Metadata Import
```bash
iotdbctl cluster importschema default_cluster -N datanode1 -param "-s ./dump0.csv -fd ./failed/ -lpf 10000"
```
* Locate the yaml file in the default location based on the cluster-name to retrieve datanode_servers configuration information.
* Execute metadata import with import-schema.sh on datanode1.
* Parameters for -param are as follows:

| command    | description                                                             | required |
|------------|-------------------------------------------------------------------------|----------|
| -s         | Specify the data file to be imported. You can specify a file or a directory. If a directory is specified, all files with a .csv extension in the directory will be imported in bulk.                                                   | YES      |
| -fd        | Specify a directory to store failed import files. If this parameter is not specified, failed files will be saved in the source data directory with the extension .failed added to the original filename.                               | No       |
| -lpf       | Specify the number of lines written to each failed import file. The default is 10000.| NO       |

#### Cluster Metadata Export

```bash
iotdbctl cluster exportschema default_cluster -N datanode1 -param "-t ./ -pf ./pattern.txt -lpf 10 -t 10000"
```

* Locate the yaml file in the default location based on the cluster-name to retrieve datanode_servers configuration information.
* Execute metadata export with export-schema.sh on datanode1.
* Parameters for -param are as follows:

| command     | description                                                             | required |
|-------------|-------------------------------------------------------------------------|----------|
| -t          | Specify the output path for the exported CSV file.                                                   | YES      |
| -path       | Specify the path pattern for exporting metadata. If this parameter is specified, the -s parameter will be ignored. Example: root.stock.**                           | NO       |
| -pf         | If -path is not specified, this parameter must be specified. It designates the file path containing the metadata paths to be exported, supporting txt file format. Each path to be exported is on a new line.| NO       |
| -lpf        | Specify the maximum number of lines for the exported dump file. The default is 10000.| NO       |
| -timeout    | Specify the timeout for session queries in milliseconds.| NO       |



### 1.7 Introduction to Cluster Deployment Tool Samples

In the cluster deployment tool installation directory config/example, there are three yaml examples. If necessary, you can copy them to config and modify them.

| name                        | description                                             |
|-----------------------------|------------------------------------------------|
| default\_1c1d.yaml          | 1 confignode and 1 datanode configuration example                   |
| default\_3c3d.yaml          | 3 confignode and 3 datanode configuration samples                  |
| default\_3c3d\_grafa\_prome | 3 confignode and 3 datanode, Grafana, Prometheus configuration examples |


## 2. IoTDB Data Directory Overview Tool

IoTDB data directory overview tool is used to print an overview of the IoTDB data directory structure. The location is tools/tsfile/print-iotdb-data-dir.

### 2.1 Usage

-   For Windows:

```bash
.\print-iotdb-data-dir.bat <IoTDB data folder path, separated by commas if there are multiple folders> (<storage path of the output overview file>) 
```

-   For Linux or MacOs:

```shell
./print-iotdb-data-dir.sh <IoTDB data folder path, separated by commas if there are multiple folders> (<storage path of the output overview file>) 
```

Note: if the storage path of the output overview file is not set, the default relative path "IoTDB_data_dir_overview.txt" will be used.

### 2.2 Example

Use Windows in this example:

`````````````````````````bash
.\print-iotdb-data-dir.bat D:\github\master\iotdb\data\datanode\data
````````````````````````
Starting Printing the IoTDB Data Directory Overview
````````````````````````
output save path:IoTDB_data_dir_overview.txt
data dir num:1
143  [main] WARN  o.a.i.t.c.conf.TSFileDescriptor - not found iotdb-system.properties, use the default configs.
|==============================================================
|D:\github\master\iotdb\data\datanode\data
|--sequence
|  |--root.redirect0
|  |  |--1
|  |  |  |--0
|  |--root.redirect1
|  |  |--2
|  |  |  |--0
|  |--root.redirect2
|  |  |--3
|  |  |  |--0
|  |--root.redirect3
|  |  |--4
|  |  |  |--0
|  |--root.redirect4
|  |  |--5
|  |  |  |--0
|  |--root.redirect5
|  |  |--6
|  |  |  |--0
|  |--root.sg1
|  |  |--0
|  |  |  |--0
|  |  |  |--2760
|--unsequence
|==============================================================
`````````````````````````

## 3. TsFile Sketch Tool

TsFile sketch tool is used to print the content of a TsFile in sketch mode. The location is tools/tsfile/print-tsfile.

### 3.1 Usage

-   For Windows:

```
.\print-tsfile-sketch.bat <TsFile path> (<storage path of the output sketch file>) 
```

-   For Linux or MacOs:

```
./print-tsfile-sketch.sh <TsFile path> (<storage path of the output sketch file>) 
```

Note: if the storage path of the output sketch file is not set, the default relative path "TsFile_sketch_view.txt" will be used.

### 3.2 Example

Use Windows in this example:

`````````````````````````bash
.\print-tsfile.bat D:\github\master\1669359533965-1-0-0.tsfile D:\github\master\sketch.txt
````````````````````````
Starting Printing the TsFile Sketch
````````````````````````
TsFile path:D:\github\master\1669359533965-1-0-0.tsfile
Sketch save path:D:\github\master\sketch.txt
148  [main] WARN  o.a.i.t.c.conf.TSFileDescriptor - not found iotdb-system.properties, use the default configs.
-------------------------------- TsFile Sketch --------------------------------
file path: D:\github\master\1669359533965-1-0-0.tsfile
file length: 2974

            POSITION|   CONTENT
            --------    -------
                   0|   [magic head] TsFile
                   6|   [version number] 3
||||||||||||||||||||| [Chunk Group] of root.sg1.d1, num of Chunks:3
                   7|   [Chunk Group Header]
                    |           [marker] 0
                    |           [deviceID] root.sg1.d1
                  20|   [Chunk] of root.sg1.d1.s1, startTime: 1669359533948 endTime: 1669359534047 count: 100 [minValue:-9032452783138882770,maxValue:9117677033041335123,firstValue:7068645577795875906,lastValue:-5833792328174747265,sumValue:5.795959009889246E19]
                    |           [chunk header] marker=5, measurementID=s1, dataSize=864, dataType=INT64, compressionType=SNAPPY, encodingType=RLE
                    |           [page]  UncompressedSize:862, CompressedSize:860
                 893|   [Chunk] of root.sg1.d1.s2, startTime: 1669359533948 endTime: 1669359534047 count: 100 [minValue:-8806861312244965718,maxValue:9192550740609853234,firstValue:1150295375739457693,lastValue:-2839553973758938646,sumValue:8.2822564314572677E18]
                    |           [chunk header] marker=5, measurementID=s2, dataSize=864, dataType=INT64, compressionType=SNAPPY, encodingType=RLE
                    |           [page]  UncompressedSize:862, CompressedSize:860
                1766|   [Chunk] of root.sg1.d1.s3, startTime: 1669359533948 endTime: 1669359534047 count: 100 [minValue:-9076669333460323191,maxValue:9175278522960949594,firstValue:2537897870994797700,lastValue:7194625271253769397,sumValue:-2.126008424849926E19]
                    |           [chunk header] marker=5, measurementID=s3, dataSize=864, dataType=INT64, compressionType=SNAPPY, encodingType=RLE
                    |           [page]  UncompressedSize:862, CompressedSize:860
||||||||||||||||||||| [Chunk Group] of root.sg1.d1 ends
                2656|   [marker] 2
                2657|   [TimeseriesIndex] of root.sg1.d1.s1, tsDataType:INT64, startTime: 1669359533948 endTime: 1669359534047 count: 100 [minValue:-9032452783138882770,maxValue:9117677033041335123,firstValue:7068645577795875906,lastValue:-5833792328174747265,sumValue:5.795959009889246E19]
                    |           [ChunkIndex] offset=20
                2728|   [TimeseriesIndex] of root.sg1.d1.s2, tsDataType:INT64, startTime: 1669359533948 endTime: 1669359534047 count: 100 [minValue:-8806861312244965718,maxValue:9192550740609853234,firstValue:1150295375739457693,lastValue:-2839553973758938646,sumValue:8.2822564314572677E18]
                    |           [ChunkIndex] offset=893
                2799|   [TimeseriesIndex] of root.sg1.d1.s3, tsDataType:INT64, startTime: 1669359533948 endTime: 1669359534047 count: 100 [minValue:-9076669333460323191,maxValue:9175278522960949594,firstValue:2537897870994797700,lastValue:7194625271253769397,sumValue:-2.126008424849926E19]
                    |           [ChunkIndex] offset=1766
                2870|   [IndexOfTimerseriesIndex Node] type=LEAF_MEASUREMENT
                    |           <s1, 2657>
                    |           <endOffset, 2870>
||||||||||||||||||||| [TsFileMetadata] begins
                2891|   [IndexOfTimerseriesIndex Node] type=LEAF_DEVICE
                    |           <root.sg1.d1, 2870>
                    |           <endOffset, 2891>
                    |   [meta offset] 2656
                    |   [bloom filter] bit vector byte array length=31, filterSize=256, hashFunctionSize=5
||||||||||||||||||||| [TsFileMetadata] ends
                2964|   [TsFileMetadataSize] 73
                2968|   [magic tail] TsFile
                2974|   END of TsFile
---------------------------- IndexOfTimerseriesIndex Tree -----------------------------
        [MetadataIndex:LEAF_DEVICE]
        └──────[root.sg1.d1,2870]
                        [MetadataIndex:LEAF_MEASUREMENT]
                        └──────[s1,2657]
---------------------------------- TsFile Sketch End ----------------------------------
`````````````````````````

Explanations:

-   Separated by "|", the left is the actual position in the TsFile, and the right is the summary content.
-   "||||||||||||||||||||" is the guide information added to enhance readability, not the actual data stored in TsFile.
-   The last printed "IndexOfTimerseriesIndex Tree" is a reorganization of the metadata index tree at the end of the TsFile, which is convenient for intuitive understanding, and again not the actual data stored in TsFile.

## 4. TsFile Resource Sketch Tool

TsFile resource sketch tool is used to print the content of a TsFile resource file. The location is tools/tsfile/print-tsfile-resource-files.

### 4.1 Usage

-   For Windows:

```bash
.\print-tsfile-resource-files.bat <path of the parent directory of the TsFile resource files, or path of a TsFile resource file>
```

-   For Linux or MacOs:

```
./print-tsfile-resource-files.sh <path of the parent directory of the TsFile resource files, or path of a TsFile resource file> 
```

### 4.2 Example

Use Windows in this example:

`````````````````````````bash
.\print-tsfile-resource-files.bat D:\github\master\iotdb\data\datanode\data\sequence\root.sg1\0\0
````````````````````````
Starting Printing the TsFileResources
````````````````````````
147  [main] WARN  o.a.i.t.c.conf.TSFileDescriptor - not found iotdb-system.properties, use the default configs.
230  [main] WARN  o.a.iotdb.db.conf.IoTDBDescriptor - Cannot find IOTDB_HOME or IOTDB_CONF environment variable when loading config file iotdb-system.properties, use default configuration
231  [main] WARN  o.a.iotdb.db.conf.IoTDBDescriptor - Couldn't load the configuration iotdb-system.properties from any of the known sources.
233  [main] WARN  o.a.iotdb.db.conf.IoTDBDescriptor - Cannot find IOTDB_HOME or IOTDB_CONF environment variable when loading config file iotdb-system.properties, use default configuration
237  [main] WARN  o.a.iotdb.db.conf.IoTDBDescriptor - Couldn't load the configuration iotdb-system.properties from any of the known sources.
Analyzing D:\github\master\iotdb\data\datanode\data\sequence\root.sg1\0\0\1669359533489-1-0-0.tsfile ...

Resource plan index range [9223372036854775807, -9223372036854775808]
device root.sg1.d1, start time 0 (1970-01-01T08:00+08:00[GMT+08:00]), end time 99 (1970-01-01T08:00:00.099+08:00[GMT+08:00])

Analyzing the resource file folder D:\github\master\iotdb\data\datanode\data\sequence\root.sg1\0\0 finished.
`````````````````````````

`````````````````````````bash
.\print-tsfile-resource-files.bat D:\github\master\iotdb\data\datanode\data\sequence\root.sg1\0\0\1669359533489-1-0-0.tsfile.resource
````````````````````````
Starting Printing the TsFileResources
````````````````````````
178  [main] WARN  o.a.iotdb.db.conf.IoTDBDescriptor - Cannot find IOTDB_HOME or IOTDB_CONF environment variable when loading config file iotdb-system.properties, use default configuration
186  [main] WARN  o.a.i.t.c.conf.TSFileDescriptor - not found iotdb-system.properties, use the default configs.
187  [main] WARN  o.a.iotdb.db.conf.IoTDBDescriptor - Couldn't load the configuration iotdb-system.properties from any of the known sources.
188  [main] WARN  o.a.iotdb.db.conf.IoTDBDescriptor - Cannot find IOTDB_HOME or IOTDB_CONF environment variable when loading config file iotdb-system.properties, use default configuration
192  [main] WARN  o.a.iotdb.db.conf.IoTDBDescriptor - Couldn't load the configuration iotdb-system.properties from any of the known sources.
Analyzing D:\github\master\iotdb\data\datanode\data\sequence\root.sg1\0\0\1669359533489-1-0-0.tsfile ...

Resource plan index range [9223372036854775807, -9223372036854775808]
device root.sg1.d1, start time 0 (1970-01-01T08:00+08:00[GMT+08:00]), end time 99 (1970-01-01T08:00:00.099+08:00[GMT+08:00])

Analyzing the resource file D:\github\master\iotdb\data\datanode\data\sequence\root.sg1\0\0\1669359533489-1-0-0.tsfile.resource finished.
`````````````````````````
