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

Dual active usually refers to two independent machines (or clusters) that perform real-time mirror synchronization. Their configurations are completely independent and can simultaneously receive external writes. Each independent machine (or cluster) can synchronize the data written to itself to another machine (or cluster), and the data of the two machines (or clusters) can achieve final consistency.

- Two standalone machines (or clusters) can form a high availability group: when one of the standalone machines (or clusters) stops serving, the other standalone machine (or cluster) will not be affected. When the single machine (or cluster) that stopped the service is restarted, another single machine (or cluster) will synchronize the newly written data. Business can be bound to two standalone machines (or clusters) for read and write operations, thereby achieving high availability.
- The dual active deployment scheme allows for high availability with fewer than 3 physical nodes and has certain advantages in deployment costs. At the same time, the physical supply isolation of two sets of single machines (or clusters) can be achieved through the dual ring network of power and network, ensuring the stability of operation.
- At present, the dual active capability is a feature of the enterprise version.

![](/img/20240731104336.png)

## Note

1. It is recommended to prioritize using `hostname` for IP configuration during deployment to avoid the problem of database failure caused by modifying the host IP in the later stage. To set the hostname, you need to configure `/etc/hosts` on the target server. If the local IP is 192.168.1.3 and the hostname is iotdb-1, you can use the following command to set the server's hostname and configure IoTDB's `cn_internal-address` and` dn_internal-address` using the hostname.

    ```Bash
    echo "192.168.1.3  iotdb-1" >> /etc/hosts 
    ```

2. Some parameters cannot be modified after the first startup, please refer to the "Installation Steps" section below to set them.

3. Recommend deploying a monitoring panel, which can monitor important operational indicators and keep track of database operation status at any time. The monitoring panel can be obtained by contacting the business department. The steps for deploying the monitoring panel can be referred to [Monitoring Panel Deployment](../Deployment-and-Maintenance/Monitoring-panel-deployment.md)

## Installation Steps

Taking the dual active version IoTDB built by two single machines A and B as an example, the IP addresses of A and B are 192.168.1.3 and 192.168.1.4, respectively. Here, we use hostname to represent different hosts. The plan is as follows:

| Machine | Machine IP  | Host Name |
| ------- | ----------- | --------- |
| A       | 192.168.1.3 | iotdb-1   |
| B       | 192.168.1.4 | iotdb-2   |

### Step1：Install Two Independent IoTDBs Separately

Install IoTDB on two machines separately, and refer to the deployment documentation for the standalone version [Stand-Alone Deployment](../Deployment-and-Maintenance/Stand-Alone-Deployment_timecho.md)，The deployment document for the cluster version can be referred to [Cluster Deployment](../Deployment-and-Maintenance/Cluster-Deployment_timecho.md)。**It is recommended that the configurations of clusters A and B remain consistent to achieve the best dual active effect**

### Step2：Create A Aata Synchronization Task On Machine A To Machine B

- Create a data synchronization process on machine A, where the data on machine A is automatically synchronized to machine B. Use the cli tool in the sbin directory to connect to the IoTDB database on machine A:

    ```Bash
    ./sbin/start-cli.sh  -h iotdb-1
    ```

- Create and start the data synchronization command with the following SQL:

    ```Bash
    create pipe AB
    with source (
    'source.forwarding-pipe-requests' = 'false' 
    )
    with sink (
    'sink'='iotdb-thrift-sink',
    'sink.ip'='iotdb-2',
    'sink.port'='6667'
    )
    ```

- Note: To avoid infinite data loops, it is necessary to set the parameter `source.forwarding pipe questions` on both A and B to `false`, indicating that data transmitted from another pipe will not be forwarded.

### Step3：Create A Data Synchronization Task On Machine B To Machine A

- Create a data synchronization process on machine B, where the data on machine B is automatically synchronized to machine A. Use the cli tool in the sbin directory to connect to the IoTDB database on machine B

    ```Bash
    ./sbin/start-cli.sh  -h iotdb-2
    ```

    Create and start the pipe with the following SQL:

    ```Bash
    create pipe BA
    with source (
    'source.forwarding-pipe-requests' = 'false' 
    )
    with sink (
    'sink'='iotdb-thrift-sink',
    'sink.ip'='iotdb-1',
    'sink.port'='6667'
    )
    ```

- Note: To avoid infinite data loops, it is necessary to set the parameter `source. forwarding pipe questions` on both A and B to `false` , indicating that data transmitted from another pipe will not be forwarded.

### Step4：Validate Deployment

After the above data synchronization process is created, the dual active cluster can be started.

#### Check the running status of the cluster

```Bash
#Execute the show cluster command on two nodes respectively to check the status of IoTDB service
show  cluster
```

**Machine A**:

![](/img/%E5%8F%8C%E6%B4%BB-A.png)

**Machine B**:

![](/img/%E5%8F%8C%E6%B4%BB-B.png)

Ensure that every Configurable Node and DataNode is in the Running state.

#### Check synchronization status

- Check the synchronization status on machine A

```Bash
show pipes
```

![](/img/show%20pipes-A.png)

- Check the synchronization status on machine B

```Bash
show pipes
```

![](/img/show%20pipes-B.png)

Ensure that every pipe is in the RUNNING state.

### Step5：Stop Dual Active Version IoTDB

- Execute the following command on machine A:

    ```SQL
    ./sbin/start-cli.sh -h iotdb-1  #Log in to CLI
    IoTDB> stop pipe AB             #Stop the data synchronization process
    ./sbin/stop-standalone.sh       #Stop database service
    ```

- Execute the following command on machine B:

    ```SQL
    ./sbin/start-cli.sh -h iotdb-2  #Log in to CLI
    IoTDB> stop pipe BA             #Stop the data synchronization process
    ./sbin/stop-standalone.sh       #Stop database service
    ```

