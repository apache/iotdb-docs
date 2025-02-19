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
# Dual Active Deployment

## What is a double active version?

Dual-active mode refers to two independent instances (either standalone or clusters) with completely independent configurations. These instances can simultaneously handle external read and write operations, with real-time bi-directional synchronization and breakpoint recovery capabilities.

Key features include:

- **Mutual Backup of Instances**: If one instance stops service, the other remains unaffected. When the stopped instance resumes, the other instance will synchronize newly written data. Businesses can bind both instances for read and write operations, achieving high availability.
- **Cost-Effective Deployment**: The dual-active deployment solution achieves high availability with only two physical nodes, offering cost advantages. Additionally, physical resource isolation for the two instances can be ensured by leveraging dual-ring power and network designs, enhancing operational stability.

**Note:** The dual-active functionality is exclusively available in enterprise-grade TimechoDB.

![](/img/20240731104336.png)

## Prerequisites

1. **Hostname Configuration**: It is recommended to prioritize hostname over IP during deployment to avoid issues where the database cannot start due to later changes in the host IP. For instance, if the local IP is `192.168.1.3` and the hostname is `iotdb-1`, configure it in `/etc/hosts` using:

```Bash
echo "192.168.1.3  iotdb-1" >> /etc/hosts 
```

Use the hostname to configure IoTDB’s `cn_internal_address` and `dn_internal_address`.

2. **Immutable Parameters**: Some parameters cannot be changed after the initial startup. Follow the steps in the "Installation Steps" section to configure them correctly.

3. **Monitoring Panel**: Deploying a monitoring panel is recommended to monitor key performance indicators and stay informed about the database’s operational status. Contact the Timecho team to obtain the monitoring panel and refer to the corresponding  [Monitoring Panel Deployment](../Deployment-and-Maintenance/Monitoring-panel-deployment.md) for deployment steps.

## 3 Installation Steps

This guide uses two standalone nodes, A and B, to deploy the dual-active version of TimechoDB. The IP addresses and hostnames for the nodes are as follows:

| Machine | IP Address  | Hostname |
| ------- | ----------- | -------- |
| A       | 192.168.1.3 | iotdb-1  |
| B       | 192.168.1.4 | iotdb-2  |

### Step1：Install Two Independent TimechoDB Instances

Install TimechoDB on both machines (A and B) independently. For detailed instructions, refer to the standalone  [Stand-Alone Deployment](../Deployment-and-Maintenance/Stand-Alone-Deployment_timecho.md)or cluster [Cluster Deployment](../Deployment-and-Maintenance/Cluster-Deployment_timecho.md)deployment guides. 

Ensure that configurations for A and B are consistent for optimal dual-active performance.

### Step2：Configure Data Synchronization from Machine A to Machine B

- Connect to the database on Machine A using the CLI tool from the `sbin` directory:

```Bash
./sbin/start-cli.sh  -h iotdb-1
```

- Then create and start a data synchronization process. Use the following SQL command:

```Bash
create pipe AB
with source (
  'source.mode.double-living' ='true'
with sink (
  'sink'='iotdb-thrift-sink',
  'sink.ip'='iotdb-2',
  'sink.port'='6667'
)
```

- **Note:** To avoid infinite data loops, ensure the parameter `source.mode.double-living` is set to `true` on both A and B. This prevents retransmission of data received through the other instance's pipe.

### Step3：Configure Data Synchronization from Machine B to Machine A

- Connect to the database on Machine B:

```Bash
./sbin/start-cli.sh  -h iotdb-2
```

- Then create and start the synchronization process with the following SQL command:

```Bash
create pipe BA
with source (
'source.mode.double-living' ='true'
)
with sink (
  'sink'='iotdb-thrift-sink',
  'sink.ip'='iotdb-1',
  'sink.port'='6667'
)
```

- **Note:** To avoid infinite data loops, ensure the parameter `source.mode.double-living` is set to `true` on both A and B. This prevents retransmission of data received through the other instance's pipe.

### Step4：Verify Deployment

#### Check Cluster Status

Run the `show cluster` command on both nodes to verify the status of the TimechoDB services:

```Bash
show  cluster
```

**Machine A**:

![](/img/%E5%8F%8C%E6%B4%BB-A.png)

**Machine B**:

![](/img/%E5%8F%8C%E6%B4%BB-B.png)

Ensure all `ConfigNode` and `DataNode` processes are in the `Running` state.

#### Check Synchronization Status

Use the `show pipes` command on both nodes:

```Bash
show pipes
```

Confirm that all pipes are in the `RUNNING` state:

On machine A:

![](/img/show%20pipes-A.png)

On machine B:

![](/img/show%20pipes-B.png)

### Step5：Stop the Dual-Active Instances

To stop the dual-active instances:

On machine A:

```SQL
./sbin/start-cli.sh -h iotdb-1  # Log in to CLI
IoTDB> stop pipe AB             # Stop data synchronization
./sbin/stop-standalone.sh       # Stop database service
```

On machine B:

```SQL
./sbin/start-cli.sh -h iotdb-2  # Log in to CLI
IoTDB> stop pipe BA             # Stop data synchronization
./sbin/stop-standalone.sh       # Stop database service
```