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

6. **Monitoring Panel**: Deploy a monitoring panel to track key performance metrics. Contact the Timecho team for access and refer to the [Monitoring Board Install and Deploy](../Deployment-and-Maintenance/Monitoring-panel-deployment.md).

## 2. Installation Steps

### 2.1 Extract Installation Package

Unzip the installation package and navigate to the directory:

```Bash
unzip timechodb-{version}-bin.zip
cd timechodb-{version}-bin
```

### 2.2 Parameters Configuration

#### 2.2.1 Memory Configuration

Edit the following files for memory allocation:

- **ConfigNode**: `conf/confignode-env.sh` (or `.bat` for Windows)
- **DataNode**: `conf/datanode-env.sh` (or `.bat` for Windows)

| **Parameter** | **Description**                     | **Default** | **Recommended** | **Notes**               |
| :------------ | :---------------------------------- | :---------- | :-------------- | :---------------------- |
| MEMORY_SIZE   | Total memory allocated for the node | Empty       | As needed       | Save changes without immediate execution; modifications take effect after service restart. |

#### 2.2.2 General Configuration

Set the following parameters in `conf/iotdb-system.properties`. Refer to `conf/iotdb-system.properties.template` for a complete list.

**Cluster-Level Parameters**:

| **Parameter**             | **Description**             | **Default**    | **Recommended** | **Notes**                                                    |
| :------------------------ | :-------------------------- | :------------- | :-------------- | :----------------------------------------------------------- |
| cluster_name              | Name of the cluster         | defaultCluster | Customizable    | If there is no specific requirement, keep the default value. |
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

### 2.3 Start ConfigNode

Navigate to the `sbin` directory and start ConfigNode:

```Bash
./sbin/start-confignode.sh -d   # The "-d" flag starts the process in the background.
```

If the startup fails, refer to the [Common Issues](#3-common-issues)。 section below for troubleshooting.



### 2.4 Start DataNode

Navigate to the `sbin` directory of IoTDB and start the DataNode:

```Bash
./sbin/start-datanode.sh -d    # The "-d" flag starts the process in the background.
```

### 2.5 Activate the Database

#### Option 1: Command-Based Activation

1. Enter the IoTDB CLI.
   - **For Table Model**:
   - ```SQL
      # For Linux or macOS
      ./start-cli.sh -sql_dialect table
      
      # For Windows
      ./start-cli.bat -sql_dialect table
      ```

2. Run the following command to retrieve the machine code required for activation:

```Bash
show system info
``` 

3. Copy the returned machine code (displayed as a green string) and send it to the Timecho team:

```Bash
+--------------------------------------------------------------+
|                                                    SystemInfo|
+--------------------------------------------------------------+
|                                          01-TE5NLES4-UDDWCMYE|
+--------------------------------------------------------------+
Total line number = 1
It costs 0.030s
```

4. Enter the activation code provided by the Timecho team in the CLI using the following format. Wrap the activation code in single quotes ('):

```Bash
IoTDB> activate '01-D4EYQGPZ-EAUJJODW-NUKRDR6F-TUQS3B75-EDZFLK3A-6BOKJFFZ-ALDHOMN7-NB2E4BHI-7ZKGFVK6-GCIFXA4T-UG3XJTTD-SHJV6F2P-Q27B4OMJ-R47ZDIM3-UUASUXG2-OQXGVZCO-MMYKICZU-TWFQYYAO-ZOAGOKJA-NYHQTA5U-EWAR4EP5-MRC6R2CI-PKUTKRCT-7UDGRH3F-7BYV4P5D-6KKIA==='
```

#### Option 2: File-Based Activation

- Start both the ConfigNode and DataNode.
- Navigate to the `activation` folder and copy the `system_info` file.
- Send the `system_info` file to the Timecho team.
- Place the license file provided by the Timecho team into the corresponding `activation` folder for each node.


### 2.6 Verify Activation

In the CLI, you can check the activation status by running the `show activation` command. Check the `ClusterActivationStatus` field. If it shows `ACTIVATED`, the database has been successfully activated.

![](/img/%E5%8D%95%E6%9C%BA-%E9%AA%8C%E8%AF%81.png)

## 3. Common Issues
1. Activation Fails Repeatedly

   1. Use the `ls -al` command to verify that the ownership of the installation directory matches the current user.
   2. Check the ownership of all files in the `./activation` directory to ensure they belong to the current user.

2. ConfigNode Fails to Start

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