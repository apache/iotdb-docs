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
# Cluster Deployment

This guide describes how to manually deploy a cluster instance consisting of 3 ConfigNodes and 3 DataNodes (commonly referred to as a 3C3D cluster).

<div align="center">
    <img src="https://alioss.timecho.com/docs/img/cluster02.png" alt="" style="width: 60%;"/>
</div>



## Prerequisites

1. [System configuration](./Environment-Requirements.md):Ensure the system has been configured according to the preparation guidelines.

2. **IP Configuration**: It is recommended to use hostnames for IP configuration to prevent issues caused by IP address changes. Configure the `/etc/hosts` file on each server. For example, if the local IP is `11.101.17.224` and the hostname is `iotdb-1`, use the following command to set the hostname:

   ``` shell
   echo "192.168.1.3  iotdb-1" >> /etc/hosts 
   ```

   Use the hostname for `cn_internal_address` and `dn_internal_address` in IoTDB configuration.

3. **Unmodifiable Parameters**: Some parameters cannot be changed after the first startup. Refer to the Parameter Configuration section.

4. **Installation Path**: Ensure the installation path contains no spaces or non-ASCII characters to prevent runtime issues.

5. **User Permissions**: Choose one of the following permissions during installation and deployment:

   - **Root User (Recommended)**: This avoids permission-related issues.
   - **Non-Root User**:
      - Use the same user for all operations, including starting, activating, and stopping services.
      - Avoid using `sudo`, which can cause permission conflicts.

6. **Monitoring Panel**: Deploy a monitoring panel to track key performance metrics. Contact the Timecho team for access and refer to the "[Monitoring Panel Deployment](./Monitoring-panel-deployment.md)" guide.

## Preparation

1. Obtain the TimechoDB installation package: `timechodb-{version}-bin.zip` following[IoTDB-Package](../Deployment-and-Maintenance/IoTDB-Package_timecho.md)
2. Configure the operating system environment according to [Environment Requirement](./Environment-Requirements.md)

## Installation Steps

Taking a cluster with three Linux servers with the following information as example:

| Node IP       | Host Name | Service              |
| ------------- | --------- | -------------------- |
| 11.101.17.224 | iotdb-1   | ConfigNode、DataNode |
| 11.101.17.225 | iotdb-2   | ConfigNode、DataNode |
| 11.101.17.226 | iotdb-3   | ConfigNode、DataNode |

### 1.Configure Hostnames

On all three servers, configure the hostnames by editing the `/etc/hosts` file. Use the following commands:

```Bash
echo "11.101.17.224  iotdb-1"  >> /etc/hosts
echo "11.101.17.225  iotdb-2"  >> /etc/hosts
echo "11.101.17.226  iotdb-3"  >> /etc/hosts 
```

### 2. Extract Installation Package

Unzip the installation package and enter the installation directory:

```Plain
unzip  timechodb-{version}-bin.zip
cd  timechodb-{version}-bin
```

### 3. Parameters Configuration

- #### Memory Configuration

  Edit the following files for memory allocation:

  - **ConfigNode**: `./conf/confignode-env.sh` (or `.bat` for Windows)
  - **DataNode**: `./conf/datanode-env.sh` (or `.bat` for Windows)

  | **Parameter** | **Description**                    | **Default** | **Recommended** | **Notes**                               |
  | :------------ | :--------------------------------- | :---------- | :-------------- | :-------------------------------------- |
  | MEMORY_SIZE   | Total memory allocated to the node | Empty       | As needed       | Effective after restarting the service. |

**General Configuration**

Set the following parameters in `./conf/iotdb-system.properties`. Refer to `./conf/iotdb-system.properties.template` for a complete list.

**Cluster-Level Parameters**:

| **Parameter**             | **Description**                                              | **11.101.17.224** | **11.101.17.225** | **11.101.17.226** |
| :------------------------ | :----------------------------------------------------------- | :---------------- | :---------------- | :---------------- |
| cluster_name              | Name of the cluster                                          | defaultCluster    | defaultCluster    | defaultCluster    |
| schema_replication_factor | Metadata replication factor; DataNode count shall not be fewer than this value | 3                 | 3                 | 3                 |
| data_replication_factor   | Data replication factor; DataNode count shall not be fewer than this value | 2                 | 2                 | 2                 |

#### ConfigNode Parameters

| **Parameter**       | **Description**                                              | **Default**     | **Recommended**                                              | **11.101.17.224** | **11.101.17.225** | **11.101.17.226** | **Notes**                                                  |
| :------------------ | :----------------------------------------------------------- | :-------------- | :----------------------------------------------------------- | :---------------- | :---------------- | :---------------- | :--------------------------------------------------------- |
| cn_internal_address | Address used for internal communication within the cluster   | 127.0.0.1       | Server's IPv4 address or hostname. Use hostname to avoid issues when the IP changes. | iotdb-1           | iotdb-2           | iotdb-3           | This parameter cannot be modified after the first startup. |
| cn_internal_port    | Port used for internal communication within the cluster      | 10710           | 10710                                                        | 10710             | 10710             | 10710             | This parameter cannot be modified after the first startup. |
| cn_consensus_port   | Port used for consensus protocol communication among ConfigNode replicas | 10720           | 10720                                                        | 10720             | 10720             | 10720             | This parameter cannot be modified after the first startup. |
| cn_seed_config_node | Address of the ConfigNode for registering and joining the cluster. (e.g.,`cn_internal_address:cn_internal_port`) | 127.0.0.1:10710 | Address and port of the seed ConfigNode (e.g., `cn_internal_address:cn_internal_port`) | iotdb-1:10710     | iotdb-1:10710     | iotdb-1:10710     | This parameter cannot be modified after the first startup. |

#### DataNode Parameters

| **Parameter**                   | **Description**                                              | **Default**     | **Recommended**                                              | **11.101.17.224** | **11.101.17.225** | **11.101.17.226** | **Notes**                                                  |
| :------------------------------ | :----------------------------------------------------------- | :-------------- | :----------------------------------------------------------- | :---------------- | :---------------- | :---------------- | :--------------------------------------------------------- |
| dn_rpc_address                  | Address for the client RPC service                           | 0.0.0.0         | 0.0.0.0                                                      | 0.0.0.0           | 0.0.0.0           | 0.0.0.0           | Effective after restarting the service.                    |
| dn_rpc_port                     | Port for the client RPC service                              | 6667            | 6667                                                         | 6667              | 6667              | 6667              | Effective after restarting the service.                    |
| dn_internal_address             | Address used for internal communication within the cluster   | 127.0.0.1       | Server's IPv4 address or hostname. Use hostname to avoid issues when the IP changes. | iotdb-1           | iotdb-2           | iotdb-3           | This parameter cannot be modified after the first startup. |
| dn_internal_port                | Port used for internal communication within the cluster      | 10730           | 10730                                                        | 10730             | 10730             | 10730             | This parameter cannot be modified after the first startup. |
| dn_mpp_data_exchange_port       | Port used for receiving data streams                         | 10740           | 10740                                                        | 10740             | 10740             | 10740             | This parameter cannot be modified after the first startup. |
| dn_data_region_consensus_port   | Port used for data replica consensus protocol communication  | 10750           | 10750                                                        | 10750             | 10750             | 10750             | This parameter cannot be modified after the first startup. |
| dn_schema_region_consensus_port | Port used for metadata replica consensus protocol communication | 10760           | 10760                                                        | 10760             | 10760             | 10760             | This parameter cannot be modified after the first startup. |
| dn_seed_config_node             | Address of the ConfigNode for registering and joining the cluster.(e.g.,`cn_internal_address:cn_internal_port`) | 127.0.0.1:10710 | Address of the first ConfigNode                              | iotdb-1:10710     | iotdb-1:10710     | iotdb-1:10710     | This parameter cannot be modified after the first startup. |

**Note:** Ensure files are saved after editing. Tools like VSCode Remote do not save changes automatically.

### 4. Start ConfigNode Instances

1. Start the first ConfigNode (`iotdb-1`) as the seed node

```Bash
cd sbin
./start-confignode.sh    -d      #"- d" parameter will start in the background
```

2. Start the remaining ConfigNodes (`iotdb-2` and `iotdb-3`) in sequence.

    If the startup fails, refer to the [Common Questions](#common-questions) section below for troubleshooting.

### 5.Start DataNode Instances

On each server, navigate to the `sbin` directory and start the DataNode:

```Go
cd sbin
./start-datanode.sh   -d   #"- d" parameter will start in the background
```

### 6.Activate Database

#### Option 1: File-Based Activation

1. Start all ConfigNodes and DataNodes.
2. Copy the `system_info` file from the `activation` directory on each server and send them to the Timecho team.
3. Place the license files provided by the Timecho team into the corresponding `activation` folder for each node.

#### Option 2: Command-Based Activation

1. Enter the IoTDB CLI for each node:

- **For Table Model**:

   ```SQL
   # For Linux or macOS
   ./start-cli.sh -sql_dialect table
   
   # For Windows
   ./start-cli.bat -sql_dialect table
   ```

- **For Tree Model**:

   ```SQL
   # For Linux or macOS
   ./start-cli.sh
   
   # For Windows
   ./start-cli.bat
   ```

2. Run the following command to retrieve the machine code required for activation:

   ```Bash
   show system info
   ```

   **Note**: Activation is currently supported only in the Tree Model.

3. Copy the returned machine code of each server (displayed as a green string) and send it to the Timecho team:

    ```Bash
    +--------------------------------------------------------------+
    |                                                    SystemInfo|
    +--------------------------------------------------------------+
    |01-TE5NLES4-UDDWCMYE,01-GG5NLES4-XXDWCMYE,01-FF5NLES4-WWWWCMYE|
    +--------------------------------------------------------------+
    Total line number = 1
    It costs 0.030s
    ```

4. Enter the activation codes provided by the Timecho team in the CLI in sequence using the following format. Wrap the activation code in single quotes ('):

    ```Bash
    IoTDB> activate '01-D4EYQGPZ-EAUJJODW-NUKRDR6F-TUQS3B75-EDZFLK3A-6BOKJFFZ-ALDHOMN7-NB2E4BHI-7ZKGFVK6-GCIFXA4T-UG3XJTTD-SHJV6F2P-Q27B4OMJ-R47ZDIM3-UUASUXG2-OQXGVZCO-MMYKICZU-TWFQYYAO-ZOAGOKJA-NYHQTA5U-EWAR4EP5-MRC6R2CI-PKUTKRCT-7UDGRH3F-7BYV4P5D-6KKIA===,01-D4EYQGPZ-EAUJJODW-NUKRDR6F-TUQS3B75-EDZFLK3A-6BOKJFFZ-ALDHOMN7-NB2E4BHI-7ZKGFVK6-GCIFXA4T-UG3XJTTD-SHJV6F2P-Q27B4OMJ-R47ZDIM3-UUASUXG2-OQXGVZCO-MMYKICZU-TWFQYYAO-ZOAGOKJA-NYHQTA5U-EWAR4EP5-MRC6R2CI-PKUTKRCT-7UDGRH3F-7BYV4P5D-6KKIA===,01-D4EYQGPZ-EAUJJODW-NUKRDR6F-TUQS3B75-EDZFLK3A-6BOKJFFZ-ALDHOMN7-NB2E4BHI-7ZKGFVK6-GCIFXA4T-UG3XJTTD-SHJV6F2P-Q27B4OMJ-R47ZDIM3-UUASUXG2-OQXGVZCO-MMYKICZU-TWFQYYAO-ZOAGOKJA-NYHQTA5U-EWAR4EP5-MRC6R2CI-PKUTKRCT-7UDGRH3F-7BYV4P5D-6KKIA==='
    ```

### 7.Verify Activation

Check the `ClusterActivationStatus` field. If it shows `ACTIVATED`, the database has been successfully activated.

![](https://alioss.timecho.com/docs/img/%E9%9B%86%E7%BE%A4-%E9%AA%8C%E8%AF%81.png)

## Maintenance

### ConfigNode Maintenance

ConfigNode maintenance includes adding and removing ConfigNodes. Common use cases include:

- **Cluster Expansion:** If the cluster contains only 1 ConfigNode, adding 2 more ConfigNodes enhances high availability, resulting in a total of 3 ConfigNodes.
- **Cluster Fault Recovery:** If a ConfigNode's machine fails and it cannot function normally, remove the faulty ConfigNode and add a new one to the cluster.

**Note:** After completing ConfigNode maintenance, ensure that the cluster contains either 1 or 3 active ConfigNodes. Two ConfigNodes do not provide high availability, and more than three ConfigNodes can degrade performance.

#### Adding a ConfigNode

**Linux /** **MacOS**:

```Plain
sbin/start-confignode.sh
```

**Windows:**

```Plain
sbin/start-confignode.bat
```

#### Removing a ConfigNode

1. Connect to the cluster using the CLI and confirm the internal address and port of the ConfigNode to be removed:

    ```Plain
    show confignodes;
    ```

Example output:

```Plain
IoTDB> show confignodes
+------+-------+---------------+------------+--------+
|NodeID| Status|InternalAddress|InternalPort|    Role|
+------+-------+---------------+------------+--------+
|     0|Running|      127.0.0.1|       10710|  Leader|
|     1|Running|      127.0.0.1|       10711|Follower|
|     2|Running|      127.0.0.1|       10712|Follower|
+------+-------+---------------+------------+--------+
Total line number = 3
It costs 0.030s
```

2. Remove the ConfigNode using the script:

**Linux /** **MacOS**:

```Bash
sbin/remove-confignode.sh [confignode_id]
# Or:
sbin/remove-confignode.sh [cn_internal_address:cn_internal_port]
```

**Windows:**

```Bash
sbin/remove-confignode.bat [confignode_id]
# Or:
sbin/remove-confignode.bat [cn_internal_address:cn_internal_port]
```

### DataNode Maintenance

DataNode maintenance includes adding and removing DataNodes. Common use cases include:

- **Cluster Expansion:** Add new DataNodes to increase cluster capacity.
- **Cluster Fault Recovery:** If a DataNode's machine fails and it cannot function normally, remove the faulty DataNode and add a new one to the cluster.

**Note:** During and after DataNode maintenance, ensure that the number of active DataNodes is not fewer than the data replication factor (usually 2) or the schema replication factor (usually 3).

#### Adding a DataNode

**Linux /** **MacOS**:

```Plain
sbin/start-datanode.sh
```

**Windows:**

```Plain
sbin/start-datanode.bat
```

**Note:** After adding a DataNode, the cluster load will gradually balance across all nodes as new writes arrive and old data expires (if TTL is set).

#### Removing a DataNode

1. Connect to the cluster using the CLI and confirm the RPC address and port of the DataNode to be removed:

```Plain
show datanodes;
```

Example output:

```Plain
IoTDB> show datanodes
+------+-------+----------+-------+-------------+---------------+
|NodeID| Status|RpcAddress|RpcPort|DataRegionNum|SchemaRegionNum|
+------+-------+----------+-------+-------------+---------------+
|     1|Running|   0.0.0.0|   6667|            0|              0|
|     2|Running|   0.0.0.0|   6668|            1|              1|
|     3|Running|   0.0.0.0|   6669|            1|              0|
+------+-------+----------+-------+-------------+---------------+
Total line number = 3
It costs 0.110s
```

2. Remove the DataNode using the script:

**Linux / MacOS:**

```Bash
sbin/remove-datanode.sh [dn_rpc_address:dn_rpc_port]
```

**Windows:**

```Bash
sbin/remove-datanode.bat [dn_rpc_address:dn_rpc_port]
```

## Common Questions

1. Activation Fails Repeatedly
   - Use the `ls -al` command to verify that the ownership of the installation directory matches the current user.
   - Check the ownership of all files in the `./activation` directory to ensure they belong to the current user.
2. ConfigNode Fails to Start
   - Review the startup logs to check if any parameters, which cannot be modified after the first startup, were changed.
   - Check the logs for any other errors. If unresolved, contact technical support for assistance.
   - If the deployment is fresh or data can be discarded, clean the environment and redeploy using the following steps:
 **Clean the Environment**

   - Stop all ConfigNode and DataNode processes:
     ```Bash
      sbin/stop-standalone.sh
      ```

   - Check for any remaining processes:
     ```Bash
      jps 
      # or 
      ps -ef | grep iotdb
      ```

   - If processes remain, terminate them manually:
     ```Bash
       kill -9 <pid>
       
       #For systems with a single IoTDB instance, you can clean up residual processes with:
       ps -ef | grep iotdb | grep -v grep | tr -s ' ' ' ' | cut -d ' ' -f2 | xargs kill -9
       ```

   - Delete the `data` and `logs` directories:
       ```Bash
       cd /data/iotdb 
       rm -rf data logs
       ```

## Appendix

### ConfigNode Parameters

| Parameter | Description                                                 | Is it required |
| :-------- | :---------------------------------------------------------- | :------------- |
| -d        | Starts the process in daemon mode (runs in the background). | No             |

### DataNode Parameters

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