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
# Monitoring Panel Deployment

The IoTDB monitoring panel is one of the supporting tools for the IoTDB Enterprise Edition. It aims to solve the monitoring problems of IoTDB and its operating system, mainly including operating system resource monitoring, IoTDB performance monitoring, and hundreds of kernel monitoring indicators, in order to help users monitor the health status of the cluster, and perform cluster optimization and operation. This article will take common 3C3D clusters (3 Confignodes and 3 Datanodes) as examples to introduce how to enable the system monitoring module in an IoTDB instance and use Prometheus+Grafana to visualize the system monitoring indicators.

## Installation Preparation

1. Installing IoTDB: You need to first install IoTDB V1.0 or above Enterprise Edition. You can contact business or technical support to obtain
2. Obtain the IoTDB monitoring panel installation package: Based on the enterprise version of IoTDB database monitoring panel, you can contact business or technical support to obtain

## Installation Steps

### Step 1: IoTDB enables monitoring indicator collection

1. Open the monitoring configuration item. The configuration items related to monitoring in IoTDB are disabled by default. Before deploying the monitoring panel, you need to open the relevant configuration items (note that the service needs to be restarted after enabling monitoring configuration).

| **Configuration**                  | Located in the configuration file | **Description**                                              |
| :--------------------------------- | :-------------------------------- | :----------------------------------------------------------- |
| cn_metric_reporter_list            | conf/iotdb-confignode.properties  | Uncomment the configuration item and set the value to PROMETHEUS |
| cn_metric_level                    | conf/iotdb-confignode.properties  | Uncomment the configuration item and set the value to IMPORTANT |
| cn_metric_prometheus_reporter_port | conf/iotdb-sysconfignodetem.properties  | Uncomment the configuration item to maintain the default setting of 9091. If other ports are set, they will not conflict with each other |
| dn_metric_reporter_list            | conf/iotdb-datanode.properties    | Uncomment the configuration item and set the value to PROMETHEUS |
| dn_metric_level                    | conf/iotdb-datanode.properties    | Uncomment the configuration item and set the value to IMPORTANT |
| dn_metric_prometheus_reporter_port | conf/iotdb-datanode.properties    | Uncomment the configuration item and set it to 9092 by default. If other ports are set, they will not conflict with each other |

Taking the 3C3D cluster as an example, the monitoring configuration that needs to be modified is as follows:

| Node IP     | Host Name | Cluster Role | Configuration File Path          | Configuration                                                |
| ----------- | --------- | ------------ | -------------------------------- | ------------------------------------------------------------ |
| 192.168.1.3 | iotdb-1   | confignode   | conf/iotdb-confignode.properties | cn_metric_reporter_list=PROMETHEUS cn_metric_level=IMPORTANT cn_metric_prometheus_reporter_port=9091 |
| 192.168.1.4 | iotdb-2   | confignode   | conf/iotdb-confignode.properties | cn_metric_reporter_list=PROMETHEUS cn_metric_level=IMPORTANT cn_metric_prometheus_reporter_port=9091 |
| 192.168.1.5 | iotdb-3   | confignode   | conf/iotdb-confignode.properties | cn_metric_reporter_list=PROMETHEUS cn_metric_level=IMPORTANT cn_metric_prometheus_reporter_port=9091 |
| 192.168.1.3 | iotdb-1   | datanode     | conf/iotdb-datanode.properties   | dn_metric_reporter_list=PROMETHEUS dn_metric_level=IMPORTANT dn_metric_prometheus_reporter_port=9092  |
| 192.168.1.4 | iotdb-2   | datanode     | conf/iotdb-datanode.properties   | dn_metric_reporter_list=PROMETHEUS dn_metric_level=IMPORTANT dn_metric_prometheus_reporter_port=9092  |
| 192.168.1.5 | iotdb-3   | datanode     | conf/iotdb-datanode.properties   | dn_metric_reporter_list=PROMETHEUS dn_metric_level=IMPORTANT dn_metric_prometheus_reporter_port=9092  |

2. Restart all nodes. After modifying the monitoring indicator configuration of three nodes, the confignode and datanode services of all nodes can be restarted:

```Bash
./sbin/stop-standalone.sh      #Stop confignode and datanode first
./sbin/start-confignode.sh  -d #Start confignode
./sbin/start-datanode.sh  -d   #Start datanode 
```

3. After restarting, confirm the running status of each node through the client. If the status is Running, it indicates successful configuration:

![](/img/%E5%90%AF%E5%8A%A8.PNG)

### Step 2: Install and configure Prometheus

> Taking Prometheus installed on server 192.168.1.3 as an example.

1. Download the Prometheus installation package, which requires installation of V2.30.3 and above. You can go to the Prometheus official website to download it(https://prometheus.io/docs/introduction/first_steps/)
2. Unzip the installation package and enter the unzipped folder:

```Shell
tar xvfz prometheus-*.tar.gz
cd prometheus-*
```

3. Modify the configuration. Modify the configuration file prometheus.yml as follows
   1. Add configNode task to collect monitoring data for ConfigNode
   2. Add a datanode task to collect monitoring data for DataNodes

```YAML
global:
  scrape_interval: 15s 
  evaluation_interval: 15s 
scrape_configs:
  - job_name: "prometheus"
    static_configs:
      - targets: ["localhost:9090"]
  - job_name: "confignode"
    static_configs:
      - targets: ["iotdb-1:9091","iotdb-2:9091","iotdb-3:9091"]
    honor_labels: true
  - job_name: "datanode"
    static_configs:
      - targets: ["iotdb-1:9092","iotdb-2:9092","iotdb-3:9092"]
    honor_labels: true
```

4. Start Prometheus. The default expiration time for Prometheus monitoring data is 15 days. In production environments, it is recommended to adjust it to 180 days or more to track historical monitoring data for a longer period of time. The startup command is as follows:

```Shell
./prometheus --config.file=prometheus.yml --storage.tsdb.retention.time=180d
```

5. Confirm successful startup. Enter in browser http://192.168.1.3:9090 Go to Prometheus and click on the Target interface under Status. When you see that all States are Up, it indicates successful configuration and connectivity.

    <div style="display: flex;justify-content: space-between;">
      <img src="/img/%E5%90%AF%E5%8A%A8_1.png" alt=""  style="width: 50%;"  /> 
      <img src="/img/%E5%90%AF%E5%8A%A8_2.png" alt="" style="width: 48%;"/>
    </div>

6. Clicking on the left link in Targets will redirect you to web monitoring and view the monitoring information of the corresponding node:

![](/img/%E8%8A%82%E7%82%B9%E7%9B%91%E6%8E%A7.png)

### Step 3: Install Grafana and configure the data source

> Taking Grafana installed on server 192.168.1.3 as an example.

1. Download the Grafana installation package, which requires installing version 8.4.2 or higher. You can go to the Grafana official website to download it(https://grafana.com/grafana/download)
2. Unzip and enter the corresponding folder

```Shell
tar -zxvf grafana-*.tar.gz
cd grafana-*
```

3. Start Grafana:

```Shell
./bin/grafana-server web 
```

4. Log in to Grafana. Enter in browser http://192.168.1.3:3000 (or the modified port), enter Grafana, and the default initial username and password are both admin.

5. Configure data sources. Find Data sources in Connections, add a new data source, and configure the Data Source to Prometheus

![](/img/%E6%B7%BB%E5%8A%A0%E9%85%8D%E7%BD%AE.png)

When configuring the Data Source, pay attention to the URL where Prometheus is located. After configuring it, click on Save&Test and a Data Source is working prompt will appear, indicating successful configuration

![](/img/%E9%85%8D%E7%BD%AE%E6%88%90%E5%8A%9F.png)

### Step 4: Import IoTDB Grafana Dashboards

1. Enter Grafana and select Dashboards:

   ![](/img/%E9%9D%A2%E6%9D%BF%E9%80%89%E6%8B%A9.png)

2. Click the Import button on the right side

      ![](/img/Import%E6%8C%89%E9%92%AE.png)

3. Import Dashboard using upload JSON file

      ![](/img/%E5%AF%BC%E5%85%A5Dashboard.png)

4. Select the JSON file of one of the panels in the IoTDB monitoring panel, using the Apache IoTDB ConfigNode Dashboard as an example (refer to the installation preparation section in this article for the monitoring panel installation package):

      ![](/img/%E9%80%89%E6%8B%A9%E9%9D%A2%E6%9D%BF.png)

5. Select Prometheus as the data source and click Import

      ![](/img/%E9%80%89%E6%8B%A9%E6%95%B0%E6%8D%AE%E6%BA%90.png)

6. Afterwards, you can see the imported Apache IoTDB ConfigNode Dashboard monitoring panel

      ![](/img/%E9%9D%A2%E6%9D%BF.png)

7. Similarly, we can import the Apache IoTDB DataNode Dashboard Apache Performance Overview Dashboard、Apache System Overview Dashboard， You can see the following monitoring panel:

     <div style="display: flex;justify-content: space-between;">
      <img src="/img/%E9%9D%A2%E6%9D%BF1-eppf.png" alt="" style="width: 30%;" />
      <img src="/img/%E9%9D%A2%E6%9D%BF2.png"  alt="" style="width: 30%;"/> 
      <img src="/img/%E9%9D%A2%E6%9D%BF3.png"  alt="" style="width: 30%;"/>
    </div>

8. At this point, all IoTDB monitoring panels have been imported and monitoring information can now be viewed at any time.

      ![](/img/%E9%9D%A2%E6%9D%BF%E6%B1%87%E6%80%BB.png)

## Appendix, Detailed Explanation of Monitoring Indicators

### System Dashboard

This panel displays the current usage of system CPU, memory, disk, and network resources, as well as partial status of the JVM.

#### CPU

- CPU Core：CPU cores
- CPU Load：
  - System CPU Load：The average CPU load and busyness of the entire system during the sampling time
  - Process CPU Load：The proportion of CPU occupied by the IoTDB process during sampling time
- CPU Time Per Minute：The total CPU time of all processes in the system per minute

#### Memory

- System Memory：The current usage of system memory.
  - Commited vm size： The size of virtual memory allocated by the operating system to running processes.
  - Total physical memory：The total amount of available physical memory in the system.
  - Used physical memory：The total amount of memory already used by the system. Contains the actual amount of memory used by the process and the memory occupied by the operating system buffers/cache.
- System Swap Memory：Swap Space memory usage.
- Process Memory：The usage of memory by the IoTDB process.
  - Max Memory：The maximum amount of memory that an IoTDB process can request from the operating system. (Configure the allocated memory size in the datanode env/configure env configuration file)
  - Total Memory：The total amount of memory that the IoTDB process has currently requested from the operating system.
  - Used Memory：The total amount of memory currently used by the IoTDB process.

#### Disk

- Disk Space：
  - Total disk space：The maximum disk space that IoTDB can use.
  - Used disk space：The disk space already used by IoTDB.
- Log Number Per Minute：The average number of logs at each level of IoTDB per minute during the sampling time.
- File Count：Number of IoTDB related files
  - all：All file quantities
  - TsFile：Number of TsFiles
  - seq：Number of sequential TsFiles
  - unseq：Number of unsequence TsFiles
  - wal：Number of WAL files
  - cross-temp：Number of cross space merge temp files
  - inner-seq-temp：Number of merged temp files in sequential space
  - innser-unseq-temp：Number of merged temp files in unsequential space
  - mods：Number of tombstone files
- Open File Count：Number of file handles opened by the system
- File Size：The size of IoTDB related files. Each sub item corresponds to the size of the corresponding file.
- Disk I/O Busy Rate：Equivalent to the% util indicator in iostat, it to some extent reflects the level of disk busyness. Each sub item is an indicator corresponding to the disk.
- Disk I/O Throughput：The average I/O throughput of each disk in the system over a period of time. Each sub item is an indicator corresponding to the disk.
- Disk I/O Ops：Equivalent to the four indicators of r/s, w/s, rrqm/s, and wrqm/s in iostat, it refers to the number of times a disk performs I/O per second. Read and write refer to the number of times a disk performs a single I/O. Due to the corresponding scheduling algorithm of block devices, in some cases, multiple adjacent I/Os can be merged into one. Merge read and merge write refer to the number of times multiple I/Os are merged into one I/O.
- Disk I/O Avg Time：Equivalent to the await of iostat, which is the average latency of each I/O request. Separate recording of read and write requests.
- Disk I/O Avg Size：Equivalent to the avgrq sz of iostat, it reflects the size of each I/O request. Separate recording of read and write requests.
- Disk I/O Avg Queue Size：Equivalent to avgqu sz in iostat, which is the average length of the I/O request queue.
- I/O System Call Rate：The frequency of process calls to read and write system calls, similar to IOPS.
- I/O Throughput：The throughput of process I/O can be divided into two categories: actual-read/write and attemppt-read/write. Actual read and actual write refer to the number of bytes that a process actually causes block devices to perform I/O, excluding the parts processed by Page Cache.

#### JVM

- GC Time Percentage：The proportion of GC time spent by the node JVM in the past minute's time window
- GC Allocated/Promoted Size Detail： The average size of objects promoted to the old era per minute by the node JVM, as well as the size of objects newly applied for by the new generation/old era and non generational new applications
- GC Data Size Detail：The long-term surviving object size of the node JVM and the maximum intergenerational allowed value
- Heap Memory：JVM heap memory usage.
  - Maximum heap memory：The maximum available heap memory size for the JVM.
  - Committed heap memory：The size of heap memory that has been committed by the JVM.
  - Used heap memory：The size of heap memory already used by the JVM.
  - PS Eden Space：The size of the PS Young area.
  - PS Old Space：The size of the PS Old area.
  - PS Survivor Space：The size of the PS survivor area.
  - ...（CMS/G1/ZGC, etc）
- Off Heap Memory：Out of heap memory usage.
  - direct memory：Out of heap direct memory.
  - mapped memory：Out of heap mapped memory.
- GC Number Per Minute：The average number of garbage collection attempts per minute by the node JVM, including YGC and FGC
- GC Time Per Minute：The average time it takes for node JVM to perform garbage collection per minute, including YGC and FGC
- GC Number Per Minute Detail：The average number of garbage collections per minute by node JVM due to different reasons, including YGC and FGC
- GC Time Per Minute Detail：The average time spent by node JVM on garbage collection per minute due to different reasons, including YGC and FGC
- Time Consumed Of Compilation Per Minute：The total time JVM spends compiling per minute
- The Number of Class：
  - loaded：The number of classes currently loaded by the JVM
  - unloaded：The number of classes uninstalled by the JVM since system startup
- The Number of Java Thread：The current number of surviving threads in IoTDB. Each sub item represents the number of threads in each state.

#### Network

Eno refers to the network card connected to the public network, while lo refers to the virtual network card.

- Net Speed：The speed of network card sending and receiving data
- Receive/Transmit Data Size：The size of data packets sent or received by the network card, calculated from system restart
- Packet Speed：The speed at which the network card sends and receives packets, and one RPC request can correspond to one or more packets
- Connection Num：The current number of socket connections for the selected process (IoTDB only has TCP)

### Performance Overview Dashboard

#### Cluster Overview

- Total CPU Core:Total CPU cores of cluster machines
- DataNode CPU Load:CPU usage of each DataNode node in the cluster
- Disk
  - Total Disk Space: Total disk size of cluster machines
  - DataNode Disk Usage: The disk usage rate of each DataNode in the cluster
- Total Timeseries: The total number of time series managed by the cluster (including replicas), the actual number of time series needs to be calculated in conjunction with the number of metadata replicas
- Cluster: Number of ConfigNode and DataNode nodes in the cluster
- Up Time: The duration of cluster startup until now
- Total Write Point Per Second: The total number of writes per second in the cluster (including replicas), and the actual total number of writes needs to be analyzed in conjunction with the number of data replicas
- Memory
  - Total System Memory: Total memory size of cluster machine system
  - Total Swap Memory: Total size of cluster machine swap memory
  - DataNode Process Memory Usage: Memory usage of each DataNode in the cluster
- Total File Number:Total number of cluster management files
- Cluster System Overview:Overview of cluster machines, including average DataNode node memory usage and average machine disk usage
- Total DataBase: The total number of databases managed by the cluster (including replicas)
- Total DataRegion: The total number of DataRegions managed by the cluster
- Total SchemaRegion: The total number of SchemeRegions managed by the cluster

#### Node Overview

- CPU Core: The number of CPU cores in the machine where the node is located
- Disk Space: The disk size of the machine where the node is located
- Timeseries: Number of time series managed by the machine where the node is located (including replicas)
- System Overview: System overview of the machine where the node is located, including CPU load, process memory usage ratio, and disk usage ratio
- Write Point Per Second: The write speed per second of the machine where the node is located (including replicas)
- System Memory: The system memory size of the machine where the node is located
- Swap Memory:The swap memory size of the machine where the node is located
- File Number: Number of files managed by nodes

#### Performance

- Session Idle Time:The total idle time and total busy time of the session connection of the node
- Client Connection: The client connection status of the node, including the total number of connections and the number of active connections
- Time Consumed Of Operation: The time consumption of various types of node operations, including average and P99
- Average Time Consumed Of Interface: The average time consumption of each thrust interface of a node
- P99 Time Consumed Of Interface: P99 time consumption of various thrust interfaces of nodes
- Task Number: The number of system tasks for each node
- Average Time Consumed of Task: The average time spent on various system tasks of a node
- P99 Time Consumed of Task: P99 time consumption for various system tasks of nodes
- Operation Per Second: The number of operations per second for a node
- Mainstream Process
  - Operation Per Second Of Stage: The number of operations per second for each stage of the node's main process
  - Average Time Consumed Of Stage: The average time consumption of each stage in the main process of a node
  - P99 Time Consumed Of Stage: P99 time consumption for each stage of the node's main process
- Schedule Stage
  - OPS Of Schedule: The number of operations per second in each sub stage of the node schedule stage
  - Average Time Consumed Of Schedule Stage:The average time consumption of each sub stage in the node schedule stage
  - P99 Time Consumed Of Schedule Stage: P99 time consumption for each sub stage of the schedule stage of the node
- Local Schedule Sub Stages
  - OPS Of Local Schedule Stage: The number of operations per second in each sub stage of the local schedule node
  - Average Time Consumed Of Local Schedule Stage: The average time consumption of each sub stage in the local schedule stage of the node
  - P99 Time Consumed Of Local Schedule Stage: P99 time consumption for each sub stage of the local schedule stage of the node
- Storage Stage
  - OPS Of Storage Stage: The number of operations per second in each sub stage of the node storage stage
  - Average Time Consumed Of Storage Stage: Average time consumption of each sub stage in the node storage stage
  - P99 Time Consumed Of Storage Stage: P99 time consumption for each sub stage of node storage stage
- Engine Stage
  - OPS Of Engine Stage: The number of operations per second in each sub stage of the node engine stage
  - Average Time Consumed Of Engine Stage: The average time consumption of each sub stage in the engine stage of a node
  - P99 Time Consumed Of Engine Stage: P99 time consumption of each sub stage in the node engine stage

#### System

- CPU Load: CPU load of nodes
- CPU Time Per Minute: The CPU time per minute of a node, with the maximum value related to the number of CPU cores
- GC Time Per Minute:The average GC time per minute for nodes, including YGC and FGC
- Heap Memory: Node's heap memory usage
- Off Heap Memory: Non heap memory usage of nodes
- The Number Of Java Thread: Number of Java threads on nodes
- File Count:Number of files managed by nodes
- File Size: Node management file size situation
- Log Number Per Minute: Different types of logs per minute for nodes

### ConfigNode Dashboard

This panel displays the performance of all management nodes in the cluster, including partitioning, node information, and client connection statistics.

#### Node Overview

- Database Count: Number of databases for nodes
- Region
  - DataRegion Count:Number of DataRegions for nodes
  - DataRegion Current Status: The state of the DataRegion of the node
  - SchemaRegion Count: Number of SchemeRegions for nodes
  - SchemaRegion Current Status: The state of the SchemeRegion of the node
- System Memory: The system memory size of the node
- Swap Memory: Node's swap memory size
- ConfigNodes: The running status of the ConfigNode in the cluster where the node is located
- DataNodes:The DataNode situation of the cluster where the node is located
- System Overview: System overview of nodes, including system memory, disk usage, process memory, and CPU load

#### NodeInfo

- Node Count: The number of nodes in the cluster where the node is located, including ConfigNode and DataNode
- ConfigNode Status: The status of the ConfigNode node in the cluster where the node is located
- DataNode Status: The status of the DataNode node in the cluster where the node is located
- SchemaRegion Distribution: The distribution of SchemaRegions in the cluster where the node is located
- SchemaRegionGroup Leader Distribution: The distribution of leaders in the SchemaRegionGroup of the cluster where the node is located
- DataRegion Distribution: The distribution of DataRegions in the cluster where the node is located
- DataRegionGroup Leader Distribution:The distribution of leaders in the DataRegionGroup of the cluster where the node is located

#### Protocol

- Client Count
  - Active Client Num: The number of active clients in each thread pool of a node
  - Idle Client Num: The number of idle clients in each thread pool of a node
  - Borrowed Client Count: Number of borrowed clients in each thread pool of the node
  - Created Client Count: Number of created clients for each thread pool of the node
  - Destroyed Client Count: The number of destroyed clients in each thread pool of the node
- Client time situation
  - Client Mean Active Time: The average active time of clients in each thread pool of a node
  - Client Mean Borrow Wait Time: The average borrowing waiting time of clients in each thread pool of a node
  - Client Mean Idle Time: The average idle time of clients in each thread pool of a node

#### Partition Table

- SchemaRegionGroup Count: The number of SchemaRegionGroups in the Database of the cluster where the node is located
- DataRegionGroup Count: The number of DataRegionGroups in the Database of the cluster where the node is located
- SeriesSlot Count: The number of SeriesSlots in the Database of the cluster where the node is located
- TimeSlot Count: The number of TimeSlots in the Database of the cluster where the node is located
- DataRegion Status: The DataRegion status of the cluster where the node is located
- SchemaRegion Status: The status of the SchemeRegion of the cluster where the node is located

#### Consensus

- Ratis Stage Time: The time consumption of each stage of the node's Ratis
- Write Log Entry: The time required to write a log for the Ratis of a node
- Remote / Local Write Time: The time consumption of remote and local writes for the Ratis of nodes
- Remote / Local Write QPS: Remote and local QPS written to node Ratis
- RatisConsensus Memory: Memory usage of Node Ratis consensus protocol

### DataNode Dashboard

This panel displays the monitoring status of all data nodes in the cluster, including write time, query time, number of stored files, etc.

#### Node Overview

- The Number Of Entity: Entity situation of node management
- Write Point Per Second: The write speed per second of the node
- Memory Usage: The memory usage of the node, including the memory usage of various parts of IoT Consensus, the total memory usage of SchemaRegion, and the memory usage of various databases.

#### Protocol

- Node Operation Time Consumption
  - The Time Consumed Of Operation (avg): The average time spent on various operations of a node
  - The Time Consumed Of Operation (50%): The median time spent on various operations of a node
  - The Time Consumed Of Operation (99%): P99 time consumption for various operations of nodes
- Thrift Statistics
  - The QPS Of Interface: QPS of various Thrift interfaces of nodes
  - The Avg Time Consumed Of Interface: The average time consumption of each Thrift interface of a node
  - Thrift Connection: The number of Thrfit connections of each type of node
  - Thrift Active Thread: The number of active Thrift connections for each type of node
- Client Statistics
  - Active Client Num: The number of active clients in each thread pool of a node
  - Idle Client Num: The number of idle clients in each thread pool of a node
  - Borrowed Client Count:Number of borrowed clients for each thread pool of a node
  - Created Client Count: Number of created clients for each thread pool of the node
  - Destroyed Client Count: The number of destroyed clients in each thread pool of the node
  - Client Mean Active Time: The average active time of clients in each thread pool of a node
  - Client Mean Borrow Wait Time: The average borrowing waiting time of clients in each thread pool of a node
  - Client Mean Idle Time: The average idle time of clients in each thread pool of a node

#### Storage Engine

- File Count: Number of files of various types managed by nodes
- File Size: Node management of various types of file sizes
- TsFile
  - TsFile Total Size In Each Level: The total size of TsFile files at each level of node management
  - TsFile Count In Each Level: Number of TsFile files at each level of node management
  - Avg TsFile Size In Each Level: The average size of TsFile files at each level of node management
- Task Number: Number of Tasks for Nodes
- The Time Consumed of Task: The time consumption of tasks for nodes
- Compaction
  - Compaction Read And Write Per Second: The merge read and write speed of nodes per second
  - Compaction Number Per Minute: The number of merged nodes per minute
  - Compaction Process Chunk Status: The number of Chunks in different states merged by nodes
  - Compacted Point Num Per Minute: The number of merged nodes per minute

#### Write Performance

- Write Cost(avg): Average node write time, including writing wal and memtable
- Write Cost(50%): Median node write time, including writing wal and memtable
- Write Cost(99%): P99 for node write time, including writing wal and memtable
- WAL
  - WAL File Size: Total size of WAL files managed by nodes
  - WAL File Num:Number of WAL files managed by nodes
  - WAL Nodes Num: Number of WAL nodes managed by nodes
  - Make Checkpoint Costs: The time required to create various types of CheckPoints for nodes
  - WAL Serialize Total Cost: Total time spent on node WAL serialization
  - Data Region Mem Cost: Memory usage of different DataRegions of nodes, total memory usage of DataRegions of the current instance, and total memory usage of DataRegions of the current cluster
  - Serialize One WAL Info Entry Cost: Node serialization time for a WAL Info Entry
  - Oldest MemTable Ram Cost When Cause Snapshot: MemTable size when node WAL triggers oldest MemTable snapshot
  - Oldest MemTable Ram Cost When Cause Flush: MemTable size when node WAL triggers oldest MemTable flush
  - Effective Info Ratio Of WALNode: The effective information ratio of different WALNodes of nodes
  - WAL Buffer
    - WAL Buffer Cost: Node WAL flush SyncBuffer takes time, including both synchronous and asynchronous options
    - WAL Buffer Used Ratio: The usage rate of the WAL Buffer of the node
    - WAL Buffer Entries Count: The number of entries in the WAL Buffer of a node
- Flush Statistics
  - Flush MemTable Cost(avg): The total time spent on node Flush and the average time spent on each sub stage
  - Flush MemTable Cost(50%): The total time spent on node Flush and the median time spent on each sub stage
  - Flush MemTable Cost(99%): The total time spent on node Flush and the P99 time spent on each sub stage
  - Flush Sub Task Cost(avg): The average time consumption of each node's Flush subtask, including sorting, encoding, and IO stages
  - Flush Sub Task Cost(50%): The median time consumption of each subtask of the Flush node, including sorting, encoding, and IO stages
  - Flush Sub Task Cost(99%): The average subtask time P99 for Flush of nodes, including sorting, encoding, and IO stages
- Pending Flush Task Num: The number of Flush tasks in a blocked state for a node
- Pending Flush Sub Task Num: Number of Flush subtasks blocked by nodes
- Tsfile Compression Ratio Of Flushing MemTable: The compression rate of TsFile corresponding to node flashing Memtable
- Flush TsFile Size Of DataRegions: The corresponding TsFile size for each disk flush of nodes in different DataRegions
- Size Of Flushing MemTable: The size of the Memtable for node disk flushing
- Points Num Of Flushing MemTable: The number of points when flashing data in different DataRegions of a node
- Series Num Of Flushing MemTable: The number of time series when flashing Memtables in different DataRegions of a node
- Average Point Num Of Flushing MemChunk: The average number of disk flushing points for node MemChunk

#### Schema Engine

- Schema Engine Mode: The metadata engine pattern of nodes
- Schema Consensus Protocol: Node metadata consensus protocol
- Schema Region Number:Number of SchemeRegions managed by nodes
- Schema Region Memory Overview: The amount of memory in the SchemeRegion of a node
- Memory Usgae per SchemaRegion:The average memory usage size of node SchemaRegion
- Cache MNode per SchemaRegion: The number of cache nodes in each SchemeRegion of a node
- MLog Length and Checkpoint: The total length and checkpoint position of the current mlog for each SchemeRegion of the node (valid only for SimpleConsense)
- Buffer MNode per SchemaRegion: The number of buffer nodes in each SchemeRegion of a node
- Activated Template Count per SchemaRegion: The number of activated templates in each SchemeRegion of a node
- Time Series statistics
  - Timeseries Count per SchemaRegion: The average number of time series for node SchemaRegion
  - Series Type: Number of time series of different types of nodes
  - Time Series Number: The total number of time series nodes
  - Template Series Number: The total number of template time series for nodes
  - Template Series Count per SchemaRegion: The number of sequences created through templates in each SchemeRegion of a node
- IMNode Statistics
  - Pinned MNode per SchemaRegion: Number of IMNode nodes with Pinned nodes in each SchemeRegion
  - Pinned Memory per SchemaRegion: The memory usage size of the IMNode node for Pinned nodes in each SchemeRegion of the node
  - Unpinned MNode per SchemaRegion: The number of unpinned IMNode nodes in each SchemeRegion of a node
  - Unpinned Memory per SchemaRegion: Memory usage size of unpinned IMNode nodes in each SchemeRegion of the node
  - Schema File Memory MNode Number: Number of IMNode nodes with global pinned and unpinned nodes
  - Release and Flush MNode Rate: The number of IMNodes that release and flush nodes per second
- Cache Hit Rate: Cache hit rate of nodes
- Release and Flush Thread Number: The current number of active Release and Flush threads on the node
- Time Consumed of Relead and Flush (avg): The average time taken for node triggered cache release and buffer flushing
- Time Consumed of Relead and Flush (99%): P99 time consumption for node triggered cache release and buffer flushing

#### Query Engine

- Time Consumption In Each Stage
  - The time consumed of query plan stages(avg): The average time spent on node queries at each stage
  - The time consumed of query plan stages(50%): Median time spent on node queries at each stage
  - The time consumed of query plan stages(99%): P99 time consumption for node query at each stage
- Execution Plan Distribution Time
  - The time consumed of plan dispatch stages(avg): The average time spent on node query execution plan distribution
  - The time consumed of plan dispatch stages(50%): Median time spent on node query execution plan distribution
  - The time consumed of plan dispatch stages(99%): P99 of node query execution plan distribution time
- Execution Plan Execution Time
  - The time consumed of query execution stages(avg): The average execution time of node query execution plan
  - The time consumed of query execution stages(50%):Median execution time of node query execution plan
  - The time consumed of query execution stages(99%): P99 of node query execution plan execution time
- Operator Execution Time
  - The time consumed of operator execution stages(avg): The average execution time of node query operators
  - The time consumed of operator execution(50%): Median execution time of node query operator
  - The time consumed of operator execution(99%): P99 of node query operator execution time
- Aggregation Query Computation Time
  - The time consumed of query aggregation(avg): The average computation time for node aggregation queries
  - The time consumed of query aggregation(50%): Median computation time for node aggregation queries
  - The time consumed of query aggregation(99%): P99 of node aggregation query computation time
- File/Memory Interface Time Consumption
  - The time consumed of query scan(avg): The average time spent querying file/memory interfaces for nodes
  - The time consumed of query scan(50%): Median time spent querying file/memory interfaces for nodes
  - The time consumed of query scan(99%): P99 time consumption for node query file/memory interface
- Number Of Resource Visits
  - The usage of query resource(avg): The average number of resource visits for node queries
  - The usage of query resource(50%): Median number of resource visits for node queries
  - The usage of query resource(99%): P99 for node query resource access quantity
- Data Transmission Time
  - The time consumed of query data exchange(avg): The average time spent on node query data transmission
  - The time consumed of query data exchange(50%): Median query data transmission time for nodes
  - The time consumed of query data exchange(99%): P99 for node query data transmission time
- Number Of Data Transfers
  - The count of Data Exchange(avg): The average number of data transfers queried by nodes
  - The count of Data Exchange: The quantile of the number of data transfers queried by nodes, including the median and P99
- Task Scheduling Quantity And Time Consumption
  - The number of query queue: Node query task scheduling quantity
  - The time consumed of query schedule time(avg): The average time spent on scheduling node query tasks
  - The time consumed of query schedule time(50%): Median time spent on node query task scheduling
  - The time consumed of query schedule time(99%): P99 of node query task scheduling time

#### Query Interface

- Load Time Series Metadata
  - The time consumed of load timeseries metadata(avg): The average time taken for node queries to load time series metadata
  - The time consumed of load timeseries metadata(50%): Median time spent on loading time series metadata for node queries
  - The time consumed of load timeseries metadata(99%): P99 time consumption for node query loading time series metadata
- Read Time Series
  - The time consumed of read timeseries metadata(avg): The average time taken for node queries to read time series
  - The time consumed of read timeseries metadata(50%): The median time taken for node queries to read time series
  - The time consumed of read timeseries metadata(99%): P99 time consumption for node query reading time series
- Modify Time Series Metadata
  - The time consumed of timeseries metadata modification(avg):The average time taken for node queries to modify time series metadata
  - The time consumed of timeseries metadata modification(50%): Median time spent on querying and modifying time series metadata for nodes
  - The time consumed of timeseries metadata modification(99%): P99 time consumption for node query and modification of time series metadata
- Load Chunk Metadata List
  - The time consumed of load chunk metadata list(avg): The average time it takes for node queries to load Chunk metadata lists
  - The time consumed of load chunk metadata list(50%): Median time spent on node query loading Chunk metadata list
  - The time consumed of load chunk metadata list(99%): P99 time consumption for node query loading Chunk metadata list
- Modify Chunk Metadata
  - The time consumed of chunk metadata modification(avg): The average time it takes for node queries to modify Chunk metadata
  - The time consumed of chunk metadata modification(50%): The total number of bits spent on modifying Chunk metadata for node queries
  - The time consumed of chunk metadata modification(99%): P99 time consumption for node query and modification of Chunk metadata
- Filter According To Chunk Metadata
  - The time consumed of chunk metadata filter(avg): The average time spent on node queries filtering by Chunk metadata
  - The time consumed of chunk metadata filter(50%): Median filtering time for node queries based on Chunk metadata
  - The time consumed of chunk metadata filter(99%): P99 time consumption for node query filtering based on Chunk metadata
- Constructing Chunk Reader
  - The time consumed of construct chunk reader(avg): The average time spent on constructing Chunk Reader for node queries
  - The time consumed of construct chunk reader(50%): Median time spent on constructing Chunk Reader for node queries
  - The time consumed of construct chunk reader(99%): P99 time consumption for constructing Chunk Reader for node queries
- Read Chunk
  - The time consumed of read chunk(avg): The average time taken for node queries to read Chunks
  - The time consumed of read chunk(50%): Median time spent querying nodes to read Chunks
  - The time consumed of read chunk(99%): P99 time spent on querying and reading Chunks for nodes
- Initialize Chunk Reader
  - The time consumed of init chunk reader(avg): The average time spent initializing Chunk Reader for node queries
  - The time consumed of init chunk reader(50%): Median time spent initializing Chunk Reader for node queries
  - The time consumed of init chunk reader(99%):P99 time spent initializing Chunk Reader for node queries
- Constructing TsBlock Through Page Reader
  - The time consumed of build tsblock from page reader(avg): The average time it takes for node queries to construct TsBlock through Page Reader
  - The time consumed of build tsblock from page reader(50%): The median time spent on constructing TsBlock through Page Reader for node queries
  - The time consumed of build tsblock from page reader(99%):Node query using Page Reader to construct TsBlock time-consuming P99
- Query the construction of TsBlock through Merge Reader
  - The time consumed of build tsblock from merge reader(avg): The average time taken for node queries to construct TsBlock through Merge Reader
  - The time consumed of build tsblock from merge reader(50%): The median time spent on constructing TsBlock through Merge Reader for node queries
  - The time consumed of build tsblock from merge reader(99%): Node query using Merge Reader to construct TsBlock time-consuming P99

#### Query Data Exchange

The data exchange for the query is time-consuming.

- Obtain TsBlock through source handle
  - The time consumed of source handle get tsblock(avg): The average time taken for node queries to obtain TsBlock through source handle
  - The time consumed of source handle get tsblock(50%):Node query obtains the median time spent on TsBlock through source handle
  - The time consumed of source handle get tsblock(99%): Node query obtains TsBlock time P99 through source handle
- Deserialize TsBlock through source handle
  - The time consumed of source handle deserialize tsblock(avg): The average time taken for node queries to deserialize TsBlock through source handle
  - The time consumed of source handle deserialize tsblock(50%): The median time taken for node queries to deserialize TsBlock through source handle
  - The time consumed of source handle deserialize tsblock(99%): P99 time spent on deserializing TsBlock through source handle for node query
- Send TsBlock through sink handle 
  - The time consumed of sink handle send tsblock(avg): The average time taken for node queries to send TsBlock through sink handle
  - The time consumed of sink handle send tsblock(50%): Node query median time spent sending TsBlock through sink handle
  - The time consumed of sink handle send tsblock(99%): Node query sends TsBlock through sink handle with a time consumption of P99
- Callback data block event
  - The time consumed of on acknowledge data block event task(avg): The average time taken for node query callback data block event
  - The time consumed of on acknowledge data block event task(50%): Median time spent on node query callback data block event
  - The time consumed of on acknowledge data block event task(99%): P99 time consumption for node query callback data block event
- Get Data Block Tasks 
  - The time consumed of get data block task(avg): The average time taken for node queries to obtain data block tasks
  - The time consumed of get data block task(50%): The median time taken for node queries to obtain data block tasks
  - The time consumed of get data block task(99%): P99 time consumption for node query to obtain data block task

#### Query Related Resource

- MppDataExchangeManager:The number of shuffle sink handles and source handles during node queries
- LocalExecutionPlanner: The remaining memory that nodes can allocate to query shards
- FragmentInstanceManager: The query sharding context information and the number of query shards that the node is running
- Coordinator: The number of queries recorded on the node
- MemoryPool Size: Node query related memory pool situation
- MemoryPool Capacity: The size of memory pools related to node queries, including maximum and remaining available values
- DriverScheduler: Number of queue tasks related to node queries

#### Consensus - IoT Consensus

- Memory Usage
  - IoTConsensus Used Memory: The memory usage of IoT Consumes for nodes, including total memory usage, queue usage, and synchronization usage
- Synchronization Status Between Nodes
  - IoTConsensus Sync Index: SyncIndex size for different DataRegions of IoT Consumption nodes
  - IoTConsensus Overview:The total synchronization gap and cached request count of IoT consumption for nodes
  - IoTConsensus Search Index Rate: The growth rate of writing SearchIndex for different DataRegions of IoT Consumer nodes
  - IoTConsensus Safe Index Rate: The growth rate of synchronous SafeIndex for different DataRegions of IoT Consumer nodes
  - IoTConsensus LogDispatcher Request Size: The request size for node IoT Consusus to synchronize different DataRegions to other nodes
  - Sync Lag: The size of synchronization gap between different DataRegions in IoT Consumption node
  - Min Peer Sync Lag: The minimum synchronization gap between different DataRegions and different replicas of node IoT Consumption
  - Sync Speed Diff Of Peers: The maximum difference in synchronization from different DataRegions to different replicas for node IoT Consumption
  - IoTConsensus LogEntriesFromWAL Rate: The rate at which nodes IoT Consumus obtain logs from WAL for different DataRegions
  - IoTConsensus LogEntriesFromQueue Rate: The rate at which nodes IoT Consumes different DataRegions retrieve logs from the queue
- Different Execution Stages Take Time
  - The Time Consumed Of Different Stages (avg): The average time spent on different execution stages of node IoT Consumus
  - The Time Consumed Of Different Stages (50%): The median time spent on different execution stages of node IoT Consusus
  - The Time Consumed Of Different Stages (99%):P99 of the time consumption for different execution stages of node IoT Consusus

#### Consensus - DataRegion Ratis Consensus

- Ratis Stage Time: The time consumption of different stages of node Ratis
- Write Log Entry: The time consumption of writing logs at different stages of node Ratis
- Remote / Local Write Time: The time it takes for node Ratis to write locally or remotely
- Remote / Local Write QPS: QPS written by node Ratis locally or remotely
- RatisConsensus Memory:Memory usage of node Ratis

#### Consensus - SchemaRegion Ratis Consensus

- Ratis Stage Time: The time consumption of different stages of node Ratis
- Write Log Entry: The time consumption for writing logs at each stage of node Ratis
- Remote / Local Write Time: The time it takes for node Ratis to write locally or remotelyThe time it takes for node Ratis to write locally or remotely
- Remote / Local Write QPS: QPS written by node Ratis locally or remotely
- RatisConsensus Memory: Node Ratis Memory Usage