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

This guide introduces how to set up a standalone TimechoDB instance, which includes one ConfigNode and one DataNode (commonly referred to as 1C1D).

## 1. Prerequisites

1. **System Preparation**: Ensure the system has been configured according to the  [System Requirements](../Deployment-and-Maintenance/Environment-Requirements.md).

2. **IP Configuration**: It is recommended to use hostnames for IP configuration to prevent issues caused by IP address changes. Set the hostname by editing the `/etc/hosts` file. For example, if the local IP is `192.168.1.3` and the hostname is `iotdb-1`, run:

```Bash
echo "192.168.1.3  iotdb-1" >> /etc/hosts
```

Use the hostname for `cn_internal_address` and `dn_internal_address` in IoTDB configuration.

3. **Unmodifiable Parameters**: Some parameters cannot be changed after the first startup. Refer to the [Parameter Configuration](#22-parameters-configuration) section.

4. **Installation Path**: Ensure the installation path contains no spaces or non-ASCII characters to prevent runtime issues.

5. **User Permissions**: Choose one of the following permissions during installation and deployment:
   - **Root User (Recommended)**: This avoids permission-related issues.
   - **Non-Root User**:
      - Use the same user for all operations, including starting, activating, and stopping services.
      - Avoid using `sudo`, which can cause permission conflicts.

6. **Health Check Tool**: Before installation, the health check tool can help inspect the operating environment of IoTDB nodes and obtain detailed inspection results. The usage method of the IoTDB health check tool can be found in:[Health Check Tool](../Tools-System/Health-Check-Tool.md).

## 2. Installation Steps

### 2.1 Pre-installation Check

To ensure the IoTDB installation package you obtained is complete and valid, we recommend performing an SHA512 verification before proceeding with the installation and deployment.

#### Preparation:

- Obtain the officially released SHA512 checksum: Visit the [Release Versions](https://iotdb.apache.org/zh/Download/) page on the IoTDB open-source official website to get it.

#### Verification Steps (Linux as an Example):

1. Open the terminal and navigate to the directory where the installation package is stored (e.g., /data/iotdb):
   ```Bash
      cd /data/iotdb
      ```
2. Execute the following command to calculate the hash value:
   ```Bash
      sha512sum apache-iotdb-{version}-all-bin.zip
      ```
3. The terminal will output a result (the left part is the SHA512 checksum, and the right part is the file name):


![img](/img/sha512-07.png)

4. Compare the output result with the official SHA512 checksum. Once confirmed that they match, you can proceed with the installation and deployment of IoTDB as per the procedures below.


#### Notes:

- If the verification results do not match, please re-obtain the installation package.
- If a "file not found" prompt appears during verification, check whether the file path is correct or if the installation package has been fully downloaded.


### 2.2 Extract Installation Package

Unzip the installation package and navigate to the directory:

```Plain
unzip  apache-iotdb-{version}-all-bin.zip
cd  apache-iotdb-{version}-all-bin
```

### 2.3 Parameters Configuration

#### 2.3.1 Memory Configuration

Edit the following files for memory allocation:

- **ConfigNode**: `conf/confignode-env.sh` (or `.bat` for Windows)
- **DataNode**: `conf/datanode-env.sh` (or `.bat` for Windows)

| **Parameter** | **Description**                     | **Default** | **Recommended** | **Notes**               |
| :------------ | :---------------------------------- | :---------- | :-------------- | :---------------------- |
| MEMORY_SIZE   | Total memory allocated for the node | Empty       | As needed       | Save changes without immediate execution; modifications take effect after service restart. |

#### 2.3.2 General Configuration

Set the following parameters in `conf/iotdb-system.properties`. Refer to `conf/iotdb-system.properties.template` for a complete list.


**Cluster-Level Parameters**:

| **Parameter**             | **Description**             | **Default**    | **Recommended** | **Notes**                                                    |
| :------------------------ | :-------------------------- | :------------- | :-------------- | :----------------------------------------------------------- |
| cluster_name              | Name of the cluster         | defaultCluster | Customizable    | Support hot loading, but it is not recommended to change the cluster name by manually modifying the configuration file. |
| schema_replication_factor | Number of metadata replicas | 1              | 1               | In standalone mode, set this to 1. This value cannot be modified after the first startup. |
| data_replication_factor   | Number of data replicas     | 1              | 1               | In standalone mode, set this to 1. This value cannot be modified after the first startup. |

**ConfigNode Parameters**:

| **Parameter**       | **Description**                                              | **Default**     | **Recommended**                                              | **Notes**                                                  |
| :------------------ | :----------------------------------------------------------- | :-------------- | :----------------------------------------------------------- | :--------------------------------------------------------- |
| cn_internal_address | Address used for internal communication within the cluster   | 127.0.0.1       | Server's IPv4 address or hostname. Use hostname to avoid issues when the IP changes. | This parameter cannot be modified after the first startup. |
| cn_internal_port    | Port used for internal communication within the cluster      | 10710           | 10710                                                        | This parameter cannot be modified after the first startup. |
| cn_consensus_port   | Port used for consensus protocol communication among ConfigNode replicas | 10720           | 10720                                                        | This parameter cannot be modified after the first startup. |
| cn_seed_config_node | Address of the ConfigNode for registering and joining the cluster. (e.g.,`cn_internal_address:cn_internal_port`) | 127.0.0.1:10710 | Use `cn_internal_address:cn_internal_port`                   | This parameter cannot be modified after the first startup. |

**DataNode Parameters**:

| **Parameter**                   | **Description**                                              | **Default**     | **Recommended**                                                                                                 | **Notes**                                                  |
| :------------------------------ | :----------------------------------------------------------- | :-------------- |:----------------------------------------------------------------------------------------------------------------| :--------------------------------------------------------- |
| dn_rpc_address                  | Address for the client RPC service                           | 0.0.0.0         | The IPV4 address or host name of the server where it is located, and it is recommended to use the IPV4 address  | Effective after restarting the service.                    |
| dn_rpc_port                     | Port for the client RPC service                              | 6667            | 6667                                                                                                            | Effective after restarting the service.                    |
| dn_internal_address             | Address used for internal communication within the cluster   | 127.0.0.1       | Server's IPv4 address or hostname. Use hostname to avoid issues when the IP changes.                            | This parameter cannot be modified after the first startup. |
| dn_internal_port                | Port used for internal communication within the cluster      | 10730           | 10730                                                                                                           | This parameter cannot be modified after the first startup. |
| dn_mpp_data_exchange_port       | Port used for receiving data streams                         | 10740           | 10740                                                                                                           | This parameter cannot be modified after the first startup. |
| dn_data_region_consensus_port   | Port used for data replica consensus protocol communication  | 10750           | 10750                                                                                                           | This parameter cannot be modified after the first startup. |
| dn_schema_region_consensus_port | Port used for metadata replica consensus protocol communication | 10760           | 10760                                                                                                           | This parameter cannot be modified after the first startup. |
| dn_seed_config_node             | Address of the ConfigNode for registering and joining the cluster. (e.g.,`cn_internal_address:cn_internal_port`) | 127.0.0.1:10710 | Use `cn_internal_address:cn_internal_port`                                                                      | This parameter cannot be modified after the first startup. |

### 2.4 Start ConfigNode

Navigate to the `sbin` directory and start ConfigNode:

```Bash
./sbin/start-confignode.sh -d   # The "-d" flag starts the process in the background.
```

If the startup fails, refer to the [Common Issues](#3-common-issues)。 section below for troubleshooting.



### 2.5 Start DataNode

Navigate to the `sbin` directory of IoTDB and start the DataNode:

```Bash
./sbin/start-datanode.sh -d    # The "-d" flag starts the process in the background.
```

### 2.6 Start CLI

 Enter the IoTDB CLI.

```SQL
# For Linux or macOS
./start-cli.sh -sql_dialect table

# For Windows
./start-cli.bat -sql_dialect table
```

## 3. Common Issues

1. ConfigNode Fails to Start

   1. Review the startup logs to check if any parameters, which cannot be modified after the first startup, were changed.
   2. Check the logs for any other errors. If unresolved, contact technical support for assistance.
   3. If the deployment is fresh or data can be discarded, clean the environment and redeploy using the following steps:

  **Clean the Environment**

   1. Stop all ConfigNode and DataNode processes:
       ```Bash
      sbin/stop-standalone.sh
      ```

   2. Check for any remaining processes:
       ```Bash
      jps 
      # or 
      ps -ef | grep iotdb
      ```

   3. If processes remain, terminate them manually:
       ```Bash
       kill -9 <pid>
       
       #For systems with a single IoTDB instance, you can clean up residual processes with:
       ps -ef | grep iotdb | grep -v grep | tr -s ' ' ' ' | cut -d ' ' -f2 | xargs kill -9
       ```

   4. Delete the `data` and `logs` directories:
       ```Bash
       cd /data/iotdb 
       rm -rf data logs
       ```

## 4. Appendix

### 4.1 ConfigNode Parameters

| Parameter | Description                                                 | Required |
| :-------- | :---------------------------------------------------------- | :------- |
| -d        | Starts the process in daemon mode (runs in the background). | No       |

### 4.2 DataNode Parameters

| Parameter | Description                                                  | Required |
| :-------- | :----------------------------------------------------------- | :------- |
| -v        | Displays version information.                                | No       |
| -f        | Runs the script in the foreground without backgrounding it.  | No       |
| -d        | Starts the process in daemon mode (runs in the background).  | No       |
| -p        | Specifies a file to store the process ID for process management. | No       |
| -c        | Specifies the path to the configuration folder; the script loads configuration files from this location. | No       |
| -g        | Prints detailed garbage collection (GC) information.         | No       |
| -H        | Specifies the path for the Java heap dump file, used during JVM memory overflow. | No       |
| -E        | Specifies the file for JVM error logs.                       | No       |
| -D        | Defines system properties in the format `key=value`.         | No       |
| -X        | Passes `-XX` options directly to the JVM.                    | No       |
| -h        | Displays the help instructions.                              | No       |