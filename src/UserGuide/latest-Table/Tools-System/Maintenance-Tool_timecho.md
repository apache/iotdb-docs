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
# Maintenance Tool

## 1. IoTDB-OpsKit

The IoTDB OpsKit is an easy-to-use operation and maintenance tool designed for TimechoDB (Enterprise-grade product based on Apache IoTDB). It helps address the operational and maintenance challenges of multi-node distributed IoTDB deployments by providing functionalities such as cluster deployment, start/stop management, elastic scaling, configuration updates, and data export. With one-click command execution, it simplifies the management of complex database clusters and significantly reduces operational complexity.

This document provides guidance on remotely deploying, configuring, starting, and stopping IoTDB cluster instances using the cluster management tool.

### 1.1 Prerequisites

The IoTDB OpsKit requires GLIBC 2.17 or later, which means the minimum supported operating system version is CentOS 7. The target machines for IoTDB deployment must have the following dependencies installed:

- JDK 8 or later
- lsof
- netstat
- unzip

If any of these dependencies are missing, please install them manually. The last section of this document provides installation commands for reference.

> **Note:** The IoTDB cluster management tool requires **root privileges** to execute.

### 1.2 Deployment

#### Download and Installation

The IoTDB OpsKit is an auxiliary tool for TimechoDB. Please contact Timecho team to obtain the download instructions.

To install:

1. Navigate to the `iotdb-opskit` directory and execute:

```Bash
bash install-iotdbctl.sh
```

This will activate the `iotdbctl` command in the current shell session. You can verify the installation by checking the deployment prerequisites:

```Bash
iotdbctl cluster check example
```

1. Alternatively, if you prefer not to activate `iotdbctl`, you can execute commands directly using the absolute path:

```Bash
<iotdbctl absolute path>/sbin/iotdbctl cluster check example
```

### 1.3 Cluster Configuration Files

The cluster configuration files are stored in the `iotdbctl/config` directory as YAML files.

- Each YAML file name corresponds to a cluster name. Multiple YAML files can coexist.
- A sample configuration file (`default_cluster.yaml`) is provided in the `iotdbctl/config` directory to assist users in setting up their configurations.

#### **Structure of YAML Configuration**

The YAML file consists of the following five sections:

1. `global` – General settings, such as SSH credentials, installation paths, and JDK configurations.
2. `confignode_servers` – Configuration settings for ConfigNodes.
3. `datanode_servers` – Configuration settings for DataNodes.
4. `grafana_server` – Configuration settings for Grafana monitoring.
5. `prometheus_server` – Configuration settings for Prometheus monitoring.

A sample YAML file (`default_cluster.yaml`) is included in the `iotdbctl/config` directory.

- You can copy and rename it based on your cluster setup.
- All uncommented fields are mandatory.
- Commented fields are optional.

**Example:** Checking `default_cluster.yaml`

To validate a cluster configuration, execute:

```SQL
iotdbctl cluster check default_cluster
```

For a complete list of available commands, refer to the command reference section below.

#### Parameter Reference

| **Parameter**           | **Description**                                              | **Mandatory** |
| ----------------------- | ------------------------------------------------------------ | ------------- |
| iotdb_zip_dir           | IoTDB distribution directory. If empty, the package will be downloaded from `iotdb_download_url`. | NO            |
| iotdb_download_url      | IoTDB download URL. If `iotdb_zip_dir` is empty, the package will be retrieved from this address. | NO            |
| jdk_tar_dir             | Local path to the JDK package for uploading and deployment.  | NO            |
| jdk_deploy_dir          | Remote deployment directory for the JDK.                     | NO            |
| jdk_dir_name            | JDK decompression directory name. Default: `jdk_iotdb`.      | NO            |
| iotdb_lib_dir           | IoTDB library directory (or `.zip` package for upgrades). Default: commented out. | NO            |
| user                    | SSH login username for deployment.                           | YES           |
| password                | SSH password (if omitted, key-based authentication will be used). | NO            |
| pkey                    | SSH private key (used if `password` is not provided).        | NO            |
| ssh_port                | SSH port number.                                             | YES           |
| deploy_dir              | IoTDB deployment directory.                                  | YES           |
| iotdb_dir_name          | IoTDB decompression directory name. Default: `iotdb`.        | NO            |
| datanode-env.sh         | Corresponds to `iotdb/config/datanode-env.sh`. If both `global` and `confignode_servers` are configured, `confignode_servers` takes precedence. | NO            |
| confignode-env.sh       | Corresponds to `iotdb/config/confignode-env.sh`. If both `global` and `datanode_servers` are configured, `datanode_servers` takes precedence. | NO            |
| iotdb-system.properties | Corresponds to `<iotdb_path>/config/iotdb-system.properties`. | NO            |
| cn_internal_address     | The inter-node communication address for ConfigNodes. This parameter defines the address of the surviving ConfigNode, which defaults to `confignode_x`. If both `global` and `confignode_servers` are configured, the value in `confignode_servers` takes precedence. Corresponds to `cn_internal_address` in `iotdb/config/iotdb-system.properties`. | YES           |
| dn_internal_address     | The inter-node communication address for DataNodes. This address defaults to `confignode_x`. If both `global` and `datanode_servers` are configured, the value in `datanode_servers` takes precedence. Corresponds to `dn_internal_address` in `iotdb/config/iotdb-system.properties`. | YES           |

Both `datanode-env.sh` and `confignode-env.sh` allow **extra parameters** to be appended. These parameters can be configured using the `extra_opts` field. Example from `default_cluster.yaml`:

```YAML
datanode-env.sh:   
  extra_opts: |
    IOTDB_JMX_OPTS="$IOTDB_JMX_OPTS -XX:+UseG1GC"
    IOTDB_JMX_OPTS="$IOTDB_JMX_OPTS -XX:MaxGCPauseMillis=200"
```

#### ConfigNode Configuration

ConfigNodes can be configured in `confignode_servers`. Multiple ConfigNodes can be deployed, with the first started ConfigNode (`node1`) serving as the Seed ConfigNode by default.

| **Parameter**           | **Description**                                              | **Mandatory** |
| ----------------------- | ------------------------------------------------------------ | ------------- |
| name                    | ConfigNode name.                                             | YES           |
| deploy_dir              | ConfigNode deployment directory.                             | YES           |
| cn_internal_address     | Inter-node communication address for ConfigNodes, corresponding to `iotdb/config/iotdb-system.properties`. | YES           |
| cn_seed_config_node     | The cluster configuration address points to the surviving ConfigNode. This address defaults to `confignode_x`. If both `global` and `confignode_servers` are configured, the value in `confignode_servers` takes precedence, corresponding to `cn_internal_address` in `iotdb/config/iotdb-system.properties` | YES           |
| cn_internal_port        | Internal communication port, corresponding to `cn_internal_port` in `iotdb/config/iotdb-system.properties`. | YES           |
| cn_consensus_port       | Consensus communication port, corresponding to `cn_consensus_port` in `iotdb/config/iotdb-system.properties`. | NO            |
| cn_data_dir             | Data directory for ConfigNodes, corresponding to `cn_data_dir` in `iotdb/config/iotdb-system.properties`. | YES           |
| iotdb-system.properties | ConfigNode properties file. If `global` and `confignode_servers` are both configured, values from `confignode_servers` take precedence. | NO            |

#### DataNode Configuration

Datanodes can be configured in `datanode_servers`. Multiple DataNodes can be deployed, each requiring unique configuration.

| **Parameter**           | **Description**                                              | **Mandatory** |
| ----------------------- | ------------------------------------------------------------ | ------------- |
| name                    | DataNode name.                                               | YES           |
| deploy_dir              | DataNode deployment directory.                               | YES           |
| dn_rpc_address          | RPC communication address, corresponding to `dn_rpc_address` in `iotdb/config/iotdb-system.properties`. | YES           |
| dn_internal_address     | Internal communication address, corresponding to `dn_internal_address` in `iotdb/config/iotdb-system.properties`. | YES           |
| dn_seed_config_node     | Points to the active ConfigNode. Defaults to `confignode_x`. If `global` and `datanode_servers` are both configured, values from `datanode_servers` take precedence. Corresponds to `dn_seed_config_node` in `iotdb/config/iotdb-system.properties`. | YES           |
| dn_rpc_port             | RPC port for DataNodes, corresponding to `dn_rpc_port` in `iotdb/config/iotdb-system.properties`. | YES           |
| dn_internal_port        | Internal communication port, corresponding to `dn_internal_port` in `iotdb/config/iotdb-system.properties`. | YES           |
| iotdb-system.properties | DataNode properties file. If `global` and `datanode_servers` are both configured, values from `datanode_servers` take precedence. | NO            |

#### Grafana Configuration

Grafana can be configured in `grafana_server`. Defines the settings for deploying Grafana as a monitoring solution for IoTDB.

| **Parameter**    | **Description**                                              | **Mandatory** |
| ---------------- | ------------------------------------------------------------ | ------------- |
| grafana_dir_name | Name of the Grafana decompression directory. Default: `grafana_iotdb`. | NO            |
| host             | The IP address of the machine hosting Grafana.               | YES           |
| grafana_port     | The port Grafana listens on. Default: `3000`.                | NO            |
| deploy_dir       | Deployment directory for Grafana.                            | YES           |
| grafana_tar_dir  | Path to the Grafana compressed package.                      | YES           |
| dashboards       | Path to pre-configured Grafana dashboards.                   | NO            |

#### Prometheus Configuration

Grafana can be configured in `prometheus_server`. Defines the settings for deploying Prometheus as a monitoring solution for IoTDB.

| **Parameter**               | **Description**                                              | **Mandatory** |
| --------------------------- | ------------------------------------------------------------ | ------------- |
| prometheus_dir_name         | Name of the Prometheus decompression directory. Default: `prometheus_iotdb`. | NO            |
| host                        | The IP address of the machine hosting Prometheus.            | YES           |
| prometheus_port             | The port Prometheus listens on. Default: `9090`.             | NO            |
| deploy_dir                  | Deployment directory for Prometheus.                         | YES           |
| prometheus_tar_dir          | Path to the Prometheus compressed package.                   | YES           |
| storage_tsdb_retention_time | Number of days data is retained. Default: `15 days`.         | NO            |
| storage_tsdb_retention_size | Maximum data storage size per block. Default: `512M`. Units: KB, MB, GB, TB, PB, EB. | NO            |

If metrics are enabled in `iotdb-system.properties` (in `config/xxx.yaml`), the configurations will be automatically applied to Prometheus without manual modification.

**Special Configuration Notes**

- **Handling Special Characters in YAML Keys**: If a YAML key value contains special characters (such as `:`), it is recommended to enclose the entire value in double quotes (`""`).
- **Avoid Spaces in File Paths**: Paths containing spaces may cause parsing errors in some configurations.

### 1.4 Usage Scenarios

#### Data Cleanup

This operation deletes cluster data directories, including:

- IoTDB data directories,
- ConfigNode directories (`cn_system_dir`, `cn_consensus_dir`),
- DataNode directories (`dn_data_dirs`, `dn_consensus_dir`, `dn_system_dir`),
- Log directories and ext directories specified in the YAML configuration.

To clean cluster data, perform the following steps:

```Bash
# Step 1: Stop the cluster
iotdbctl cluster stop default_cluster

# Step 2: Clean the cluster data
iotdbctl cluster clean default_cluster
```

#### Cluster Destruction

The cluster destruction process completely removes the following resources:

- Data directories,
- ConfigNode directories (`cn_system_dir`, `cn_consensus_dir`),
- DataNode directories (`dn_data_dirs`, `dn_consensus_dir`, `dn_system_dir`),
- Log and ext directories,
- IoTDB deployment directory,
- Grafana and Prometheus deployment directories.

To destroy a cluster, follow these steps:

```Bash
# Step 1: Stop the cluster
iotdbctl cluster stop default_cluster

# Step 2: Destroy the cluster
iotdbctl cluster destroy default_cluster
```

#### Cluster Upgrade

To upgrade the cluster, follow these steps:

1. In `config/xxx.yaml`, set **`iotdb_lib_dir`** to the path of the JAR files to be uploaded. Example: `iotdb/lib`
2. If uploading a compressed package, compress the `iotdb/lib` directory:

```Bash
zip -r lib.zip apache-iotdb-1.2.0/lib/*
```

1. Execute the following commands to distribute the library and restart the cluster:

```Bash
iotdbctl cluster dist-lib default_cluster
iotdbctl cluster restart default_cluster
```

#### Hot Deployment

Hot deployment allows real-time configuration updates without restarting the cluster.

Steps:

1. Modify the configuration in `config/xxx.yaml`.
2. Distribute the updated configuration and reload it:

```Bash
iotdbctl cluster dist-conf default_cluster
iotdbctl cluster reload default_cluster
```

#### Cluster Expansion

To expand the cluster by adding new nodes:

1. Add a new DataNode or ConfigNode in `config/xxx.yaml`.
2. Execute the cluster expansion command:

```Bash
iotdbctl cluster scaleout default_cluster
```

#### Cluster Shrinking

To remove a node from the cluster:

1. Identify the node name or IP:port in `config/xxx.yaml`:
    1. ConfigNode port: `cn_internal_port`
    2. DataNode port: `rpc_port`
2. Execute the following command:

```Bash
iotdbctl cluster scalein default_cluster
```

#### Managing Existing IoTDB Clusters

To manage an existing IoTDB cluster with the OpsKit tool:

1. Configure SSH credentials:
    1. Set `user`, `password` (or `pkey`), and `ssh_port` in `config/xxx.yaml`.
2. Modify IoTDB deployment paths: For example, if IoTDB is deployed at `/home/data/apache-iotdb-1.1.1`:

```YAML
deploy_dir: /home/data/
iotdb_dir_name: apache-iotdb-1.1.1
```

1. Configure JDK paths: If `JAVA_HOME` is not used, set the JDK deployment path:

```YAML
jdk_deploy_dir: /home/data/
jdk_dir_name: jdk_1.8.2
```

1. Set cluster addresses:

- `cn_internal_address` and `dn_internal_address`
- In `confignode_servers` → `iotdb-system.properties`, configure:
    - `cn_internal_address`, `cn_internal_port`, `cn_consensus_port`, `cn_system_dir`, `cn_consensus_dir`
- In `datanode_servers` → `iotdb-system.properties`, configure:
    - `dn_rpc_address`, `dn_internal_address`, `dn_data_dirs`, `dn_consensus_dir`, `dn_system_dir`

1. Execute the initialization command:

```Bash
iotdbctl cluster init default_cluster
```

#### Deploying IoTDB, Grafana, and Prometheus

To deploy an IoTDB cluster along with Grafana and Prometheus:

1. Enable metrics: In `iotdb-system.properties`, enable the metrics interface.
2. Configure Grafana:

- If deploying multiple dashboards, separate names with commas.
- Ensure dashboard names are unique to prevent overwriting.

1. Configure Prometheus:

- If the IoTDB cluster has metrics enabled, Prometheus automatically adapts without manual configuration.

1. Start the cluster:

```Bash
iotdbctl cluster start default_cluster
```

For detailed parameters, refer to the **Cluster Configuration Files** section above.

### 1.5 Command Reference

The basic command structure is:

```Bash
iotdbctl cluster <key> <cluster name> [params (Optional)]
```

- `key` – The specific command to execute.
- `cluster_name` – The name of the cluster (matches the YAML file name in `iotdbctl/config`).
- `params` – Optional parameters for the command.

Example: Deploying the `default_cluster` cluster

```Bash
iotdbctl cluster deploy default_cluster
```

#### Command Overview

| **ommand** | **escription**                     | **Parameters**                                       |
| ---------- | ---------------------------------- | ---------------------------------------------------- |
| check      | Check cluster readiness for deployment. | Cluster name                                         |
| clean      | Clean up cluster data.             | Cluster name                                         |
| deploy/dist-all | Deploy the cluster.                | Cluster name, -N module (optional: iotdb, grafana, prometheus), -op force (optional) |
| list       | List cluster status.               | None                                                 |
| start      | Start the cluster.                 | Cluster name, -N node name (optional: iotdb, grafana, prometheus) |
| stop       | Stop the cluster.                  | Cluster name, -N node name (optional), -op force (optional) |
| restart    | Restart the cluster.               | Cluster name, -N node name (optional), -op force (optional) |
| show       | View cluster details.              | Cluster name, details (optional)                     |
| destroy    | Destroy the cluster.               | Cluster name, -N module (optional: iotdb, grafana, prometheus) |
| scaleout   | Expand the cluster.                | Cluster name                                         |
| scalein    | Shrink the cluster.                | Cluster name, -N node name or IP:port                |
| reload     | Hot reload cluster configuration.  | Cluster name                                         |
| dist-conf  | Distribute cluster configuration.  | Cluster name                                         |
| dumplog    | Backup cluster logs.               | Cluster name, -N node name, -h target IP, -pw target password, -p target port, -path backup path, -startdate, -enddate, -loglevel, -l transfer speed |
| dumpdata   | Backup cluster data                | Cluster name, -h target IP, -pw target password, -p target port, -path backup path, -startdate, -enddate, -l transfer speed |
| dist-lib   | Upgrade the IoTDB lib package.     | Cluster name                                         |
| init       | Initialize the cluster configuration. | Cluster name                                         |
| status     | View process status.               | Cluster name                                         |
| activate   | Activate the cluster.              | Cluster name                                         |
| health_check | Perform a health check.            | Cluster name, -N, nodename (optional)                |
| backup     | Backup the cluster.                | Cluster name,-N nodename (optional)                  |
| importschema | Import metadata.                   | Cluster name,-N nodename  -param   paramters         |
| exportschema | Export metadata.                   | Cluster name,-N nodename  -param   paramters         |

### 1.6 Detailed Command Execution Process

The following examples use `default_cluster.yaml` as a reference. Users can modify the commands according to their specific cluster configuration files.

#### Check Cluster Deployment Environment

The following command checks whether the cluster environment meets the deployment requirements:

```Bash
iotdbctl cluster check default_cluster
```

**Execution Steps:**

1. Locate the corresponding YAML file (`default_cluster.yaml`) based on the cluster name.
2. Retrieve configuration information for ConfigNode and DataNode (`confignode_servers` and `datanode_servers`).
3. Verify the following conditions on the target node:
    1. SSH connectivity
    2. JDK version (must be 1.8 or above)
    3. Required system tools: unzip, lsof, netstat

**Expected Output:**

- If successful: `Info: example check successfully!`
- If failed: `Error: example check fail!`

**Troubleshooting Tips:**

- JDK version not satisfied: Specify a valid `jdk1.8+` path in the YAML file for deployment.
- Missing system tools: Install unzip, lsof, and netstat on the server.
- Port conflict: Check the error log, e.g., `Error: Server (ip:172.20.31.76) iotdb port (10713) is listening.`

#### Deploy Cluster

Deploy the entire cluster using the following command:

```Bash
iotdbctl cluster deploy default_cluster
```

**Execution Steps:**

1. Locate the corresponding `YAML` file based on the cluster name.
2. Upload the IoTDB and JDK compressed packages (if `jdk_tar_dir` and `jdk_deploy_dir` are configured).
3. Generate and upload the iotdb-system.properties file based on the YAML configuration.

**Force Deployment:** To overwrite existing deployment directories and redeploy:

```Bash
iotdbctl cluster deploy default_cluster -op force
```

**Deploying Individual Modules:**

You can deploy specific components individually:

```Bash
# Deploy Grafana module
iotdbctl cluster deploy default_cluster -N grafana

# Deploy Prometheus module
iotdbctl cluster deploy default_cluster -N prometheus

# Deploy IoTDB module
iotdbctl cluster deploy default_cluster -N iotdb
```

#### Start Cluster

Start the cluster using the following command:

```Bash
iotdbctl cluster start default_cluster
```

**Execution Steps:**

1. Locate the `YAML` file based on the cluster name.
2. Start ConfigNodes sequentially according to the YAML order.
    1. The first ConfigNode is treated as the Seed ConfigNode.
    2. Verify startup by checking process IDs.
3. Start DataNodes sequentially and verify their process IDs.
4. After process verification, check the cluster's service health via CLI.
    1. If the CLI connection fails, retry every 10 seconds, up to 5 times.

**Start a Single Node:** Start specific nodes by name or IP:

```Bash
# By node name
iotdbctl cluster start default_cluster -N datanode_1

# By IP and port (ConfigNode uses `cn_internal_port`, DataNode uses `rpc_port`)
iotdbctl cluster start default_cluster -N 192.168.1.5:6667

# Start Grafana
iotdbctl cluster start default_cluster -N grafana

# Start Prometheus
iotdbctl cluster start default_cluster -N prometheus
```

**Note:** The `iotdbctl` tool relies on `start-confignode.sh` and `start-datanode.sh` scripts. If startup fails, check the cluster status using the following command:

```Bash
iotdbctl cluster status default_cluster
```

#### View Cluster Status

To view the current cluster status:

```Bash
iotdbctl cluster show default_cluster
```

To view detailed information:

```Bash
iotdbctl cluster show default_cluster details
```

**Execution Steps:**

1. Locate the YAML file and retrieve `confignode_servers` and `datanode_servers` configuration.
2. Execute `show cluster details` via CLI.
3. If one node returns successfully, the process skips checking remaining nodes.

#### Stop Cluster

To stop the entire cluster:

```Bash
iotdbctl cluster stop default_cluster
```

**Execution Steps:**

1. Locate the YAML file and retrieve `confignode_servers` and `datanode_servers` configuration.
2. Stop DataNodes sequentially based on the YAML configuration.
3. Stop ConfigNodes in sequence.

**Force Stop:** To forcibly stop the cluster using `kill -9`:

```Bash
iotdbctl cluster stop default_cluster -op force
```

**Stop a Single Node:** Stop nodes by name or IP:

```Bash
# By node name
iotdbctl cluster stop default_cluster -N datanode_1

# By IP and port
iotdbctl cluster stop default_cluster -N 192.168.1.5:6667

# Stop Grafana
iotdbctl cluster stop default_cluster -N grafana

# Stop Prometheus
iotdbctl cluster stop default_cluster -N prometheus
```

**Note:** If the IoTDB cluster is not fully stopped, verify its status using:

```Bash
iotdbctl cluster status default_cluster
```

#### Clean Cluster Data

To clean up cluster data, execute:

```Bash
iotdbctl cluster clean default_cluster
```

**Execution Steps:**

1. Locate the `YAML` file and retrieve `confignode_servers` and `datanode_servers` configuration.
2. Verify that no services are running. If any are active, the cleanup will not proceed.
3. Delete the following directories:
    1. IoTDB data directories,
    2. ConfigNode and DataNode system directories (`cn_system_dir`, `dn_system_dir`),
    3. Consensus directories (`cn_consensus_dir`, `dn_consensus_dir`),
    4. Logs and ext directories.

#### Restart Cluster

Restart the cluster using the following command:

```Bash
iotdbctl cluster restart default_cluster
```

**Execution Steps:**

1. Locate the YAML file and retrieve configurations for ConfigNodes, DataNodes, Grafana, and Prometheus.
2. Perform a cluster stop followed by a cluster start.

**Force Restart:** To forcibly restart the cluster:

```Bash
iotdbctl cluster restart default_cluster -op force
```

**Restart a Single Node:** Restart specific nodes by name:

```Bash
# Restart DataNode
iotdbctl cluster restart default_cluster -N datanode_1

# Restart ConfigNode
iotdbctl cluster restart default_cluster -N confignode_1

# Restart Grafana
iotdbctl cluster restart default_cluster -N grafana

# Restart Prometheus
iotdbctl cluster restart default_cluster -N prometheus
```

#### Cluster Expansion

To add a node to the cluster:

1. Edit `config/xxx.yaml` to add a new DataNode or ConfigNode.
2. Execute the following command:

```Bash
iotdbctl cluster scaleout default_cluster
```

**Execution Steps:**

1. Locate the YAML file and retrieve node configuration.
2. Upload the IoTDB and JDK packages (if `jdk_tar_dir` and `jdk_deploy_dir` are configured).
3. Generate and upload iotdb-system.properties.
4. Start the new node and verify success.

Tip: Only one node expansion is supported per execution.

#### Cluster Shrinking

To remove a node from the cluster:

1. Identify the node name or IP:port in `config/xxx.yaml`.
2. Execute the following command:

```Bash
#Scale down by node name
iotdbctl cluster scalein default_cluster -N nodename

#Scale down according to ip+port (ip+port obtains the only node according to ip+dn_rpc_port in datanode, and obtains the only node according to ip+cn_internal_port in confignode)
iotdbctl cluster scalein default_cluster -N ip:port
```

**Execution Steps:**

1. Locate the YAML file and retrieve node configuration.
2. Ensure at least one ConfigNode and one DataNode remain.
3. Identify the node to remove, execute the scale-in command, and delete the node directory.

Tip: Only one node shrinking is supported per execution.

#### Destroy Cluster

To destroy the entire cluster:

```Bash
iotdbctl cluster destroy default_cluster
```

**Execution Steps:**

1. Locate the YAML file and retrieve node information.
2. Verify that all nodes are stopped. If any node is running, the destruction will not proceed.
3. Delete the following directories:
    1. IoTDB data directories,
    2. ConfigNode and DataNode system directories,
    3. Consensus directories,
    4. Logs, ext, and deployment directories,
    5. Grafana and Prometheus directories.

**Destroy a Single Module:** To destroy individual modules:

```Bash
# Destroy Grafana
iotdbctl cluster destroy default_cluster -N grafana

# Destroy Prometheus
iotdbctl cluster destroy default_cluster -N prometheus

# Destroy IoTDB
iotdbctl cluster destroy default_cluster -N iotdb
```

#### Distribute Cluster Configuration

To distribute the cluster configuration files across nodes:

```Bash
iotdbctl cluster dist-conf default_cluster
```

**Execution Steps:**

1. Locate the YAML file based on `cluster-name`.
2. Retrieve configuration from `confignode_servers`, `datanode_servers`, `grafana`, and `prometheus`.
3. Generate and upload `iotdb-system.properties` to the specified nodes.

#### Hot Load Cluster Configuration

To reload the cluster configuration without restarting:

```Plain
iotdbctl cluster reload default_cluster
```

**Execution Steps:**

1. Locate the YAML file based on `cluster-name`.
2. Execute the `load configuration` command through the CLI for each node.

#### Cluster Node Log Backup

To back up logs from specific nodes:

```Bash
iotdbctl cluster dumplog default_cluster -N datanode_1,confignode_1  -startdate '2023-04-11' -enddate '2023-04-26' -h 192.168.9.48 -p 36000 -u root -pw root -path '/iotdb/logs' -logs '/root/data/db/iotdb/logs'
```

**Execution Steps:**

1. Locate the YAML file based on `cluster-name`.
2. Verify node existence (`datanode_1` and `confignode_1`).
3. Back up log data within the specified date range.
4. Save logs to `/iotdb/logs` or the default IoTDB installation path.

| **Command** | **Description**                                              | **Mandatory** |
| ----------- | ------------------------------------------------------------ | ------------- |
| -h          | IP address of the backup server                              | NO            |
| -u          | Username for the backup server                               | NO            |
| -pw         | Password for the backup server                               | NO            |
| -p          | Backup server port (Default: `22`)                           | NO            |
| -path       | Path for backup data (Default: current path)                 | NO            |
| -loglevel   | Log level (`all`, `info`, `error`, `warn`. Default: `all`)   | NO            |
| -l          | Speed limit (Default: unlimited; Range: 0 to 104857601 Kbit/s) | NO            |
| -N          | Cluster names (comma-separated)                              | YES           |
| -startdate  | Start date (inclusive; Default: `1970-01-01`)                | NO            |
| -enddate    | End date (inclusive)                                         | NO            |
| -logs       | IoTDB log storage path (Default: `{iotdb}/logs`)             | NO            |

#### Cluster Data Backup

To back up data from the cluster:

```Bash
iotdbctl cluster dumpdata default_cluster -granularity partition  -startdate '2023-04-11' -enddate '2023-04-26' -h 192.168.9.48 -p 36000 -u root -pw root -path '/iotdb/datas'
```

This command identifies the leader node from the YAML file and backs up data within the specified date range to the `/iotdb/datas` directory on the `192.168.9.48` server.

| **Command**  | **Description**                                              | **Mandatory** |
| ------------ | ------------------------------------------------------------ | ------------- |
| -h           | IP address of the backup server                              | NO            |
| -u           | Username for the backup server                               | NO            |
| -pw          | Password for the backup server                               | NO            |
| -p           | Backup server port (Default: `22`)                           | NO            |
| -path        | Path for storing backup data (Default: current path)         | NO            |
| -granularity | Data partition granularity                                   | YES           |
| -l           | Speed limit (Default: unlimited; Range: 0 to 104857601 Kbit/s) | NO            |
| -startdate   | Start date (inclusive)                                       | YES           |
| -enddate     | End date (inclusive)                                         | YES           |

#### Cluster Upgrade

To upgrade the cluster:

```Bash
iotdbctl cluster dist-lib default_cluster
```

**Execution Steps:**

1. Locate the YAML file based on the cluster name.
2. Retrieve the configuration of `confignode_servers` and `datanode_servers`.
3. Upload the library package.

**Note:** After the upgrade, restart all IoTDB nodes for the changes to take effect.

#### Cluster Initialization

To initialize the cluster:

```Bash
iotdbctl cluster init default_cluster
```

**Execution Steps:**

1. Locate the YAML file based on the cluster name.
2. Retrieve configuration details for `confignode_servers`, `datanode_servers`, `Grafana`, and `Prometheus`.
3. Initialize the cluster configuration.

#### View Cluster Process

To check the cluster process status:

```Bash
iotdbctl cluster status default_cluster
```

**Execution Steps:**

1. Locate the YAML file based on the cluster name.
2. Retrieve configuration details for `confignode_servers`, `datanode_servers`, `Grafana`, and `Prometheus`.
3. Display the operational status of each node in the cluster.

#### Cluster Authorization Activation

**Default Activation Method:** To activate the cluster using an activation code:

```Bash
iotdbctl cluster activate default_cluster
```

**Execution Steps:**

1. Locate the YAML file based on the cluster name.
2. Retrieve the `confignode_servers` configuration.
3. Obtain the machine code.
4. Enter the activation code when prompted.

Example:

```Bash
Machine code:
Kt8NfGP73FbM8g4Vty+V9qU5lgLvwqHEF3KbLN/SGWYCJ61eFRKtqy7RS/jw03lHXt4MwdidrZJ==
JHQpXu97IKwv3rzbaDwoPLUuzNCm5aEeC9ZEBW8ndKgGXEGzMms25+u==
Please enter the activation code:
JHQpXu97IKwv3rzbaDwoPLUuzNCm5aEeC9ZEBW8ndKg=, lTF1Dur1AElXIi/5jPV9h0XCm8ziPd9/R+tMYLsze1oAPxE87+Nwws=
Activation successful.
```

**Activate a Specific Node:** To activate a specific node:

```Bash
iotdbctl cluster activate default_cluster -N confignode1
```

**Activate via License Path:** To activate using a license file:

```Bash
iotdbctl cluster activate default_cluster -op license_path 
```

#### Cluster Health Check

To perform a cluster health check:

```Bash
iotdbctl cluster health_check default_cluster
```

**Execution Steps:**

1. Locate the YAML file based on the cluster name.
2. Retrieve configuration details for `confignode_servers` and `datanode_servers`.
3. Execute `health_check.sh` on each node.

**Single Node Health Check:** To check a specific node:

```Bash
iotdbctl cluster health_check default_cluster -N datanode_1
```

#### Cluster Shutdown Backup

To back up the cluster during shutdown:

```Bash
iotdbctl cluster backup default_cluster
```

**Execution Steps:**

1. Locate the YAML file based on the cluster name.
2. Retrieve configuration details for `confignode_servers` and `datanode_servers`.
3. Execute `backup.sh` on each node.

**Single Node Backup:** To back up a specific node:

```Bash
iotdbctl cluster backup default_cluster -N datanode_1
```

**Note:** Multi-node deployment on a single machine only supports quick mode.

#### Cluster Metadata Import

To import metadata:

```Bash
iotdbctl cluster importschema default_cluster -N datanode1 -param "-s ./dump0.csv -fd ./failed/ -lpf 10000"
```

**Execution Steps:**

1. Locate the YAML file based on the cluster name to retrieve `datanode_servers` configuration information.
2. Execute metadata import using `import-schema.sh` on `datanode1`.

Parameter Descriptions for `-param`:

| **Command** | **Description**                                              | **Mandatory** |
| ----------- | ------------------------------------------------------------ | ------------- |
| -s          | Specify the data file or directory to be imported. If a directory is specified, all files with a `.csv` extension will be imported in bulk. | YES           |
| -fd         | Specify a directory to store failed import files. If omitted, failed files will be saved in the source directory with the `.failed` suffix added to the original filename. | No            |
| -lpf        | Specify the maximum number of lines per failed import file (Default: 10,000). | NO            |

#### Cluster Metadata Export

To export metadata:

```Bash
iotdbctl cluster exportschema default_cluster -N datanode1 -param "-t ./ -pf ./pattern.txt -lpf 10 -t 10000"
```

**Execution Steps:**

1. Locate the YAML file based on the cluster name to retrieve `datanode_servers` configuration information.
2. Execute metadata export using `export-schema.sh` on `datanode1`.

**Parameter Descriptions for** **`-param`:**

| **Command** | **Description**                                              | **Mandatory** |
| ----------- | ------------------------------------------------------------ | ------------- |
| -t          | Specify the output path for the exported CSV file.           | YES           |
| -path       | Specify the metadata path pattern for export. If this parameter is specified, the `-s` parameter will be ignored. Example: `root.stock.**`. | NO            |
| -pf         | If `-path` is not specified, use this parameter to specify the file containing metadata paths to export. The file must be in `.txt` format, with one path per line. | NO            |
| -lpf        | Specify the maximum number of lines per exported file (Default: 10,000). | NO            |
| -timeout    | Specify the session query timeout in milliseconds.           | NO            |

### 1.7 Introduction to Cluster Deployment Tool Samples

In the cluster deployment tool installation directory (config/example), there are three YAML configuration examples. If needed, you can copy and modify them for your deployment.

| **Name**             | **Description**                                          |
| -------------------- | -------------------------------------------------------- |
| default_1c1d.yaml    | Example configuration for 1 ConfigNode and 1 DataNode.   |
| default_3c3d.yaml    | Example configuration for 3 ConfigNodes and 3 DataNodes. |
| default_3c3d_grafa_prome | Example configuration for 3 ConfigNodes, 3 DataNodes, Grafana, and Prometheus. |

## 2. IoTDB Data Directory Overview Tool

The IoTDB Data Directory Overview Tool provides an overview of the IoTDB data directory structure. It is located at `tools/tsfile/print-iotdb-data-dir`.

### 2.1 Usage

- For Windows:

```Bash
.\print-iotdb-data-dir.bat <IoTDB data folder path, separated by commas if there are multiple folders> (<storage path of the output overview file>) 
```

- For Linux or MacOs:

```Shell
./print-iotdb-data-dir.sh <IoTDB data folder path, separated by commas if there are multiple folders> (<storage path of the output overview file>) 
```

**Note:** If the output path is not specified, the default relative path `IoTDB_data_dir_overview.txt` will be used.

### 2.2 Example

Use Windows in this example:

~~~Bash
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
~~~

## 3. TsFile Sketch Tool

The TsFile Sketch Tool provides a summarized view of the content within a TsFile. It is located at `tools/tsfile/print-tsfile`.

### 3.1 Usage

- For Windows:

```Plain
.\print-tsfile-sketch.bat <TsFile path> (<storage path of the output sketch file>) 
```

- For Linux or MacOs:

```Plain
./print-tsfile-sketch.sh <TsFile path> (<storage path of the output sketch file>) 
```

**Note:** If the output path is not specified, the default relative path `TsFile_sketch_view.txt` will be used.

### 3.2 Example

Use Windows in this example:

~~~Bash
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
~~~

Explanations:

- The output is separated by the `|` symbol. The left side indicates the actual position within the TsFile, while the right side provides a summary of the content.
- The `"||||||||||||||||||||"` lines are added for readability and are not part of the actual TsFile data.
- The final `"IndexOfTimerseriesIndex Tree"` section reorganizes the metadata index tree at the end of the TsFile. This view aids understanding but does not represent actual stored data.

## 4. TsFile Resource Sketch Tool

The TsFile Resource Sketch Tool displays details about TsFile resource files. It is located at `tools/tsfile/print-tsfile-resource-files`.

### 4.1 Usage

- For Windows:

```Bash
.\print-tsfile-resource-files.bat <path of the parent directory of the TsFile resource files, or path of a TsFile resource file>
```

- For Linux or MacOs:

```Plain
./print-tsfile-resource-files.sh <path of the parent directory of the TsFile resource files, or path of a TsFile resource file> 
```

### 4.2 Example

Use Windows in this example:

~~~Bash
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
~~~
