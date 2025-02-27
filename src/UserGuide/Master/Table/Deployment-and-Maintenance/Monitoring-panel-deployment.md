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

The monitoring panel is one of the supporting tools for TimechoDB. It aims to solve the monitoring problems of TimechoDB and its operating system, mainly including operating system resource monitoring, TimechoDB performance monitoring, and hundreds of kernel monitoring metrics, in order to help users monitor cluster health, optimize performance, and perform maintenance. This guide demonstrates how to enable the system monitoring module in a TimechoDB instance and visualize monitoring metrics using Prometheus + Grafana, using a typical 3C3D cluster (3 ConfigNodes and 3 DataNodes) as an example.

## 1. Installation Preparation

1. Installing TimechoDB: Install TimechoDB V1.0 or above. Contact sales or technical support to obtain the installation package.

2. Obtain the monitoring panel installation package: The monitoring panel is exclusive to the enterprise-grade TimechoDB. Contact sales or technical support to obtain it.

## 2. Installation Steps

### 2.1 Enable Monitoring Metrics Collection in TimechoDB

1. Enable related configuration options. The configuration options related to monitoring in TimechoDB are disabled by default. Before deploying the monitoring panel, you need to enable certain configuration options (note that the service needs to be restarted after enabling monitoring configuration).

| **Configuration**                  | **Configuration File**           | **Description**                                              |
| :--------------------------------- | :------------------------------- | :----------------------------------------------------------- |
| cn_metric_reporter_list            | conf/iotdb-confignode.properties | Uncomment the configuration option and set the value to PROMETHEUS |
| cn_metric_level                    | conf/iotdb-confignode.properties | Uncomment the configuration option and set the value to IMPORTANT |
| cn_metric_prometheus_reporter_port | conf/iotdb-confignode.properties | Uncomment the configuration option and keep the default port `9091` or set another port (ensure no conflict) |
| dn_metric_reporter_list            | conf/iotdb-datanode.properties   | Uncomment the configuration option and set the value to PROMETHEUS |
| dn_metric_level                    | conf/iotdb-datanode.properties   | Uncomment the configuration option and set the value to IMPORTANT |
| dn_metric_prometheus_reporter_port | conf/iotdb-datanode.properties   | Uncomment the configuration option and keep the default port `9092` or set another port (ensure no conflict) |

Taking the 3C3D cluster as an example, the monitoring configuration that needs to be modified is as follows:

| Node IP     | Host Name | Cluster Role | Configuration File Path      | Configuration                                                |
| ----------- | --------- | ------------ | ---------------------------- | ------------------------------------------------------------ |
| 192.168.1.3 | iotdb-1   | confignode   | conf/iotdb-system.properties | cn_metric_reporter_list=PROMETHEUS cn_metric_level=IMPORTANT cn_metric_prometheus_reporter_port=9091 |
| 192.168.1.4 | iotdb-2   | confignode   | conf/iotdb-system.properties | cn_metric_reporter_list=PROMETHEUS cn_metric_level=IMPORTANT cn_metric_prometheus_reporter_port=9091 |
| 192.168.1.5 | iotdb-3   | confignode   | conf/iotdb-system.properties | cn_metric_reporter_list=PROMETHEUS cn_metric_level=IMPORTANT cn_metric_prometheus_reporter_port=9091 |
| 192.168.1.3 | iotdb-1   | datanode     | conf/iotdb-system.properties | dn_metric_reporter_list=PROMETHEUS dn_metric_level=IMPORTANT dn_metric_prometheus_reporter_port=9092 |
| 192.168.1.4 | iotdb-2   | datanode     | conf/iotdb-system.properties | dn_metric_reporter_list=PROMETHEUS dn_metric_level=IMPORTANT dn_metric_prometheus_reporter_port=9092 |
| 192.168.1.5 | iotdb-3   | datanode     | conf/iotdb-system.properties | dn_metric_reporter_list=PROMETHEUS dn_metric_level=IMPORTANT dn_metric_prometheus_reporter_port=9092 |

2. Restart all nodes. After modifying the monitoring configurations on all 3 nodes, restart the ConfigNode and DataNode services:

```Bash
  ./sbin/stop-standalone.sh      #Stop confignode and datanode first
  ./sbin/start-confignode.sh  -d #Start confignode
  ./sbin/start-datanode.sh  -d   #Start datanode 
  ```

3. After restarting, confirm the running status of each node through the client. If all nodes are running, the configuration is successful.

![](/img/%E5%90%AF%E5%8A%A8.png)

### 2.2 Install and Configure Prometheus

> In this example, Prometheus is installed on server 192.168.1.3.

1. Download Prometheus (version 2.30.3 or later). You can download it on Prometheus homepage (https://prometheus.io/docs/introduction/first_steps/)
2. Unzip the installation package and enter the folder:

```Shell
  tar xvfz prometheus-*.tar.gz
  cd prometheus-*
  ```

3. Modify the configuration. Modify the configuration file `prometheus.yml` as follows
   - Add a confignode job to collect monitoring data for ConfigNode
   - Add a datanode job to collect monitoring data for DataNodes

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

5. Confirm successful startup. Open a browser and navigate to http://192.168.1.3:9090 . Navitage to "Status" -> "Targets". If the states of all targets were up, the configuration is successful.

    <div style="display: flex;justify-content: space-between;">
      <img src="/img/%E5%90%AF%E5%8A%A8_1.png" alt=""  style="width: 50%;"  /> 
      <img src="/img/%E5%90%AF%E5%8A%A8_2.png" alt="" style="width: 48%;"/>
    </div>

6. Click the links in the `Targets` page to view monitoring information for the respective nodes.

![](/img/%E8%8A%82%E7%82%B9%E7%9B%91%E6%8E%A7.png)

### 2.3 Install Grafana and Configure the Data Source

> n this example, Grafana is installed on server 192.168.1.3.

1. Download Grafana (version 8.4.2 or later). You can download it on Grafana homepage (https://grafana.com/grafana/download)

2. 2. Unzip the installation package and enter the folder:

```Shell
  tar -zxvf grafana-*.tar.gz
  cd grafana-*
  ```

3. Start Grafana:

```Shell
  ./bin/grafana-server web 
  ```

4. Log in to Grafana. Open a browser and navigate to `http://192.168.1.3:3000` (or the modified port). The default initial username and password are both `admin`.

5. Configure data sources. Navigate to "Connections" -> "Data sources", add a new data source, and add`Prometheus`as data source.

![](/img/%E6%B7%BB%E5%8A%A0%E9%85%8D%E7%BD%AE.png)

Ensure the URL for Prometheus is correct. Click "Save & Test". If the message "Data source is working" appears, the configuration is successful.

![](/img/%E9%85%8D%E7%BD%AE%E6%88%90%E5%8A%9F.png)

### 2.4 Import IoTDB Grafana Dashboards

1. Enter Grafana and select Dashboards:

   ![](/img/%E9%9D%A2%E6%9D%BF%E9%80%89%E6%8B%A9.png)

2. Click the Import button on the right side

      ![](/img/Import%E6%8C%89%E9%92%AE.png)

3. Import Dashboard using upload JSON file

      ![](/img/%E5%AF%BC%E5%85%A5Dashboard.png)

4. Choose one of the JSON files (e.g., `Apache IoTDB ConfigNode Dashboard`). 

      ![](/img/%E9%80%89%E6%8B%A9%E9%9D%A2%E6%9D%BF.png)

5. Choose Prometheus as the data source and click "Import"

      ![](/img/%E9%80%89%E6%8B%A9%E6%95%B0%E6%8D%AE%E6%BA%90.png)

6. The imported `Apache IoTDB ConfigNode Dashboard` will now be displayed.

      ![](/img/%E9%9D%A2%E6%9D%BF.png)

7. Similarly, import other dashboards such as `Apache IoTDB DataNode Dashboard`, `Apache Performance Overview Dashboard`, and `Apache System Overview Dashboard`.

      <div style="display: flex;justify-content: space-between;">
      <img src="/img/%E9%9D%A2%E6%9D%BF1-eppf.png" alt="" style="width: 30%;" />
      <img src="/img/%E9%9D%A2%E6%9D%BF2.png"  alt="" style="width: 30%;"/> 
      <img src="/img/%E9%9D%A2%E6%9D%BF3.png"  alt="" style="width: 30%;"/>
    </div>

8. The IoTDB monitoring panel is now fully imported, and you can view monitoring information at any time.

      ![](/img/%E9%9D%A2%E6%9D%BF%E6%B1%87%E6%80%BB.png)

## 3. Appendix, Detailed Monitoring Metrics

### 3.1 System Dashboard

This dashboard displays the current system's **CPU****, memory, disk, and network resource****s**, as well as some **JVM****-related metrics**.  

#### 3.1.1 CPU

- **CPU Core:** Number of CPU cores.  
- **CPU Load:**  
  - **System CPU Load:** The average CPU load and utilization of the entire system during the sampling period.  
  - **Process CPU Load:** The percentage of CPU resources occupied by the IoTDB process during the sampling period.  
- **CPU Time Per Minute:** The total CPU time consumed by all processes in the system per minute. 

#### 3.1.2 Memory

- **System Memory:** Current system memory usage.  
  - **Committed VM Size:** Virtual memory size allocated by the operating system to running processes.  
  - **Total Physical Memory****:** Total available physical memory in the system.  
  - **Used Physical Memory****:** The total amount of memory currently in use, including memory actively used by processes and memory occupied by the operating system for buffers and caching.
- **System Swap Memory:** The amount of swap space memory in use. 
- **Process Memory:** Memory usage of the IoTDB process.  
  - **Max Memory:** The maximum amount of memory that the IoTDB process can request from the OS (configured in the `datanode-env`/`confignode-env` configuration files).  
  - **Total Memory:** The total amount of memory currently allocated by the IoTDB process from the OS.  
  - **Used Memory:** The total amount of memory currently in use by the IoTDB process.  

#### 3.1.3 Disk

- **Disk Space:**  
  - **Total Disk Space:** Maximum disk space available for IoTDB.  
  - **Used Disk Space:** Disk space currently occupied by IoTDB.  
- **Log Number Per Minute:** Average number of IoTDB logs generated per minute, categorized by log levels.
- **File Count:** The number of files related to IoTDB.
  - **All:** Total number of files.  
  - **TsFile:** Number of TsFiles.  
  - **Seq:** Number of sequential TsFiles.  
  - **Unseq:** Number of unordered TsFiles.  
  - **WAL:** Number of WAL (Write-Ahead Log) files. 
  - **Cross-Temp:** Number of temporary files generated during cross-space merge operations.  
  - **Inner-Seq-Temp:** Number of temporary files generated during sequential-space merge operations.
  - **Inner-Unseq-Temp:** Number of temporary files generated during unordered-space merge operations. 
  - **Mods:** Number of tombstone files.  
- **Open File Count:** Number of open file handles in the system.  
- **File Size:** The size of IoTDB-related files, with each sub-item representing the size of a specific file type.
- **Disk I/O Busy Rate:** Equivalent to the `%util` metric in `iostat`, indicating the level of disk utilization. Each sub-item corresponds to a specific disk.
- **Disk I/O Throughput****:** Average I/O throughput of system disks over a given period. Each sub-item corresponds to a specific disk.  
- **Disk I/O Ops:** Equivalent to `r/s`, `w/s`, `rrqm/s`, and `wrqm/s` in `iostat`, representing the number of I/O operations per second.  
- **Disk I/O Avg Time:** Equivalent to the `await` metric in `iostat`, representing the average latency of each I/O request, recorded separately for read and write operations. 
- **Disk I/O Avg Size:** Equivalent to the `avgrq-sz` metric in `iostat`, indicating the average size of each I/O request, recorded separately for read and write operations.
- **Disk I/O Avg Queue Size:** Equivalent to `avgqu-sz` in `iostat`, representing the average length of the I/O request queue.  
- **I/O System Call Rate:** Frequency of read/write system calls invoked by the process, similar to IOPS.  
- **I/O Throughput****:** I/O throughput of the process, divided into `actual_read/write` and `attempt_read/write`. `Actual read` and `actual write` refer to the number of bytes actually written to or read from the storage device, excluding those handled by the Page Cache.

#### 3.1.4 JVM

- **GC Time Percentage:** Percentage of time spent on garbage collection (GC) by the JVM in the past minute.  
- **GC Allocated/Promoted Size Detail:** The average size of objects promoted to the old generation per minute, as well as newly allocated objects in the young/old generation and non-generational areas.
- **GC Data Size Detail:** Size of long-lived objects in the JVM and the maximum allowed size for each generation.  
- **Heap Memory:** JVM heap memory usage.  
  - **Maximum Heap Memory:** Maximum available heap memory for the JVM.  
  - **Committed Heap Memory:** Committed heap memory size for the JVM.  
  - **Used Heap Memory:** The amount of heap memory currently in use.  
  - **PS Eden Space:** Size of the PS Young generation's Eden space.  
  - **PS Old Space:** Size of the PS Old generation.  
  - **PS Survivor Space:** Size of the PS Survivor space.  
- **O****ff Heap Memory:** Off-heap memory usage.  
  - **Direct Memory:** The amount of direct memory used.
  - **Mapped Memory:** The amount of memory used for mapped files.  
- **GC Number Per Minute:** Average number of garbage collections (YGC and FGC) performed per minute.
- **GC Time Per Minute:** Average time spent on garbage collection (YGC and FGC) per minute.  
- **GC Number Per Minute Detail:** Average number of garbage collections performed per minute due to different causes.  
- **GC Time Per Minute Detail:** Average time spent on garbage collection per minute due to different causes.  
- **Time Consumed of Compilation Per Minute:** Total time spent on JVM compilation per minute.  
- **The Number of Class:**  
  - **Loaded:** Number of classes currently loaded by the JVM.  
  - **Unloaded:** Number of classes unloaded by the JVM since system startup.  
- **The Number of Java Thread:** The number of currently active threads in IoTDB. Each sub-item represents the number of threads in different states.  

#### 3.1.5 Network

- **Net Speed:** Data transmission and reception speed by the network interface.
- **Receive/Transmit Data Size:** The total size of data packets sent and received by the network interface since system startup.
- **Packet Speed:** The rate of data packets sent and received by the network interface. A single RPC request may correspond to one or more packets.
- **Connection Num:** Number of socket connections for the current process (IoTDB only uses TCP).  

### 3.2 Performance Overview Dashboard

This dashboard provides an overview of the system's overall performance.  

#### 3.2.1 Cluster Overview

- **Total CPU Core:** Total number of CPU cores in the cluster.
- **DataNode CPU Load:** CPU utilization of each DataNode in the cluster.
- Disk:
  - **Total Disk Space:** Total disk space across all cluster nodes.
  - **DataNode Disk Usage:** Disk usage of each DataNode in the cluster.
- **Total Timeseries:** The total number of time series managed by the cluster (including replicas). The actual number of time series should be calculated considering metadata replicas.
- **Cluster:** The number of ConfigNode and DataNode instances in the cluster.
- **Up Time:** The duration since the cluster started.
- **Total Write Point Per Second:** The total number of data points written per second in the cluster (including replicas). The actual number of writes should be analyzed in conjunction with the data replication factor.
- Memory:
  - **Total System Memory:** The total system memory available in the cluster.
  - **Total Swap Memory:** The total swap memory available in the cluster.
  - **DataNode Process Memory Usage:** The memory usage of each DataNode in the cluster.
- **Total File Number:** The total number of files managed by the cluster.
- **Cluster System Overview:** An overview of cluster-wide system resources, including average DataNode memory usage and average disk usage.
- **Total Database:** The total number of databases managed by the cluster (including replicas).
- **Total DataRegion:** The total number of DataRegions in the cluster.
- **Total SchemaRegion:** The total number of SchemaRegions in the cluster.

#### 3.2.2 Node Overview

- **CPU Core:** Number of CPU cores on the node’s machine.
- **Disk Space:** Total disk space available on the node’s machine.
- **Timeseries:** The number of time series managed by the node (including replicas).
- **System Overview:** Overview of the node’s system resources, including CPU load, process memory usage, and disk usage.
- **Write Point Per Second:** The write speed of the node, including replicated data.
- **System Memory:** The total system memory available on the node’s machine.
- **Swap Memory:** The total swap memory available on the node’s machine.
- **File Number:** The number of files managed by the node.

#### 3.2.3 Performance 

- **Session Idle Time:** The total idle time of session connections on the node.
- **Client Connection:** The status of client connections on the node, including the total number of connections and the number of active connections.
- **Time Consumed Of Operation:** The latency of various operations on the node, including the average value and P99 percentile.
- **Average Time Consumed Of Interface:** The average latency of each **Thrift interface** on the node.
- **P99 Time Consumed Of Interface:** The P99 latency of each Thrift interface on the node.
- **Task Number:** The number of system tasks running on the node.
- **Average Time Consumed Of Task:** The average execution time of system tasks on the node.
- **P99 Time Consumed Of Task:** The P99 execution time of system tasks on the node.
- **Operation Per Second:** The number of operations executed per second on the node.
- Main Process:  
  - **Operation Per Second of Stage:** The number of operations executed per second in different stages of the main process.
  - **Average Time Consumed of Stage:** The average execution time of different stages in the main process.
  - **P99 Time Consumed of Stage:** The P99 execution time of different stages in the main process.
- Scheduling Stage:  
  - **OPS Of Schedule:** The number of operations executed per second in different sub-stages of the scheduling stage.
  - **Average Time Consumed Of Schedule Stage:** The average execution time in different sub-stages of the scheduling stage.
  - **P99 Time Consumed Of Schedule Stage:** The P99 execution time in different sub-stages of the scheduling stage.
- Local Scheduling Stage:  
  - **OPS of Local Schedule Stage:** Number of operations per second at each sub-stage of the local schedule stage.  
  - **Average Time Consumed of Local Schedule Stage:** Average time consumed at each sub-stage of the local schedule stage.  
  - **P99 Time Consumed of Local Schedule Stage:** P99 time consumed at each sub-stage of the local schedule stage.  
- Storage Stage:  
  - **OPS of Storage Stage:** Number of operations per second at each sub-stage of the storage stage.  
  - **Average Time Consumed of Storage Stage:** Average time consumed at each sub-stage of the storage stage.  
  - **P99 Time Consumed of Storage Stage:** P99 time consumed at each sub-stage of the storage stage.  
- Engine Stage:  
  - **OPS Of Engine Stage:** The number of operations executed per second in different sub-stages of the engine stage.
  - **Average Time Consumed Of Engine Stage:** The average execution time in different sub-stages of the engine stage.
  - **P99 Time Consumed Of Engine Stage:** The P99 execution time in different sub-stages of the engine stage.

#### 3.2.4 System

- **CPU Load:** The CPU load of the node.
- **CPU Time Per Minute:** The total CPU time per minute on the node, which is influenced by the number of CPU cores.
- **GC Time Per Minute:** The average time spent on Garbage Collection (GC) per minute on the node, including Young GC (YGC) and Full GC (FGC).
- **Heap Memory:** The heap memory usage of the node.
- **Off-Heap Memory:** The off-heap memory usage of the node.
- **The Number Of Java Thread:** The number of Java threads on the node.
- **File Count:** The number of files managed by the node.
- **File Size:** The total size of files managed by the node.
- **Log Number Per Minute:** The number of logs generated per minute on the node, categorized by log type.

### 3.3 ConfigNode Dashboard

This dashboard displays the performance metrics of all management nodes in the cluster, including **partition information, node status, and client connection statistics**.

#### 3.3.1 Node Overview

- **Database Count:** Number of databases on the node.  
- Region:  
  - **DataRegion Count:** Number of DataRegions on the node.  
  - **DataRegion Current Status:** Current status of DataRegions on the node.  
  - **SchemaRegion Count:** Number of SchemaRegions on the node. 
  - **SchemaRegion Current Status:** Current status of SchemaRegions on the node.  
- **System Memory:** System memory on the node's machine.  
- **Swap Memory:** Swap memory on the node's machine.  
- **ConfigNodes:** Status of ConfigNodes in the cluster.  
- **DataNodes:** Status of DataNodes in the cluster.  
- **System Overview:** Overview of the node's system resources, including system memory, disk usage, process memory, and CPU load.  

#### 3.3.2 NodeInfo

- **Node Count:** The total number of nodes in the cluster, including ConfigNodes and DataNodes.
- **ConfigNode Status:** The status of ConfigNodes in the cluster.
- **DataNode Status:** The status of DataNodes in the cluster.
- **SchemaRegion Distribution:** The distribution of SchemaRegions in the cluster.
- **SchemaRegionGroup Leader Distribution:** The leader distribution of SchemaRegionGroups in the cluster.
- **DataRegion Distribution:** The distribution of DataRegions in the cluster.
- **DataRegionGroup Leader Distribution:** The leader distribution of DataRegionGroups in the cluster.

#### 3.3.3 Protocol

- Client Count Statistics:  
  - **Active Client Num:** The number of active clients in each thread pool on the node.
  - **Idle Client Num:** The number of idle clients in each thread pool on the node.
  - **Borrowed Client Count:** The number of borrowed clients in each thread pool on the node.
  - **Created Client Count:** The number of clients created in each thread pool on the node.
  - **Destroyed Client Count:** The number of clients destroyed in each thread pool on the node.
- Client Time Statistics:  
  - **Client Mean Active Time:** The average active time of clients in each thread pool on the node.
  - **Client Mean Borrow Wait Time:** The average time clients spend waiting for borrowed resources in each thread pool.
  - **Client Mean Idle Time:** The average idle time of clients in each thread pool.

#### 3.3.4 Partition Table

- **SchemaRegionGroup Count:** The number of **SchemaRegionGroups** in the cluster’s databases.
- **DataRegionGroup Count:** The number of DataRegionGroups in the cluster’s databases.
- **SeriesSlot Count:** The number of SeriesSlots in the cluster’s databases.
- **TimeSlot Count:** The number of TimeSlots in the cluster’s databases.
- **DataRegion Status:** The status of DataRegions in the cluster.
- **SchemaRegion Status:** The status of SchemaRegions in the cluster.

#### 3.3.5 Consensus 

- **Ratis Stage Time:** The execution time of different stages in the Ratis consensus protocol.
- **Write Log Entry:** The execution time for writing log entries in Ratis.
- **Remote / Local Write Time:** The time taken for remote and local writes in Ratis.
- **Remote / Local Write QPS:** The **queries per second (QPS)** for remote and local writes in Ratis.
- **RatisConsensus Memory:** The memory usage of the Ratis consensus protocol on the node.

### 3.4 DataNode Dashboard

This dashboard displays the monitoring status of all **DataNodes** in the cluster, including **write latency, query latency, and storage file counts**. 

#### 3.4.1 Node Overview 

- **The Number of Entity:** The number of entities managed by the node.
- **Write Point Per Second:** The write speed of the node (points per second).
- **Memory Usage:** The memory usage of the node, including IoT Consensus memory usage, SchemaRegion memory usage, and per-database memory usage.

#### 3.4.2 Protocol 

- Operation Latency:  
  - **The Time Consumed of Operation (avg):** The average latency of operations on the node.
  - **The Time Consumed of Operation (50%):** The median latency of operations on the node.
  - **The Time Consumed of Operation (99%):** The P99 latency of operations on the node.
- Thrift Statistics:  
  - **The QPS of Interface:** The queries per second (QPS) for each Thrift interface on the node.
  - **The Avg Time Consumed of Interface:** The average execution time for each Thrift interface on the node.
  - **Thrift Connection:** The number of active Thrift connections on the node.
  - **Thrift Active Thread:** The number of active Thrift threads on the node.
- Client Statistics:  
  - **Active Client Num:** The number of active clients in each thread pool.
  - **Idle Client Num:** The number of idle clients in each thread pool.
  - **Borrowed Client Count:** The number of borrowed clients in each thread pool.
  - **Created Client Count:** The number of clients created in each thread pool.
  - **Destroyed Client Count:** The number of clients destroyed in each thread pool.
  - **Client Mean Active Time:** The average active time of clients in each thread pool.
  - **Client Mean Borrow Wait Time:** The average time clients spend waiting for borrowed resources in each thread pool.
  - **Client Mean Idle Time:** The average idle time of clients in each thread pool.

#### 3.4.3 Storage Engine 

- **File Count:** The number of files managed by the node.
- **File Size:** The total size of files managed by the node.
- TsFile:  
  - **TsFile Total Size In Each Level:** The total size of TsFiles at each level.
  - **TsFile Count In Each Level:** The number of TsFiles at each level.
  - **Avg TsFile Size In Each Level:** The average size of TsFiles at each level.
- **Task Number:** The number of tasks on the node.
- **The Time Consumed of Task:** The total execution time of tasks on the node.
- Compaction:  
  - **Compaction Read And Write Per Second:** The read/write speed of compaction operations.
  - **Compaction Number Per Minute:** The number of **compaction** operations per minute.
  - **Compaction Process Chunk Status:** The number of **chunks** in different states during compaction.
  - **Compacted Point Num Per Minute:** The number of data points compacted per minute.

#### 3.4.4 Write Performance

- **Write Cost (avg):** The average **write latency**, including WAL and **memtable** writes.
- **Write Cost (50%):** The **median write latency**, including WAL and **memtable** writes.
- **Write Cost (99%):** The **P99 write latency**, including WAL and **memtable** writes.
- WAL (Write-Ahead Logging)
  - **WAL File Size:** The total size of WAL files managed by the node.
  - **WAL File Num:** The total number of WAL files managed by the node.
  - **WAL Nodes Num:** The total number of WAL Nodes managed by the node.
  - **Make Checkpoint Costs:** The time required to create different types of Checkpoints.
  - **WAL Serialize Total Cost:** The total serialization time for WAL.
  - **Data Region Mem Cost:** The memory usage of different DataRegions, including total memory usage of DataRegions on the current instance and total memory usage of DataRegions across the entire cluster.
  - **Serialize One WAL Info Entry Cost:** The time taken to serialize a single WAL Info Entry.
  - **Oldest MemTable Ram Cost When Cause Snapshot:** The memory size of the oldest MemTable when a snapshot is triggered by WAL.
  - **Oldest MemTable Ram Cost When Cause Flush:** The memory size of the oldest MemTable when a flush is triggered by WAL.
  - **Effective Info Ratio of WALNode:** The ratio of effective information in different WALNodes.
  - WAL Buffer
    - **WAL Buffer Cost:** The time taken to flush the SyncBuffer of WAL, including both synchronous and asynchronous flushes.
    - **WAL Buffer Used Ratio:** The utilization ratio of the WAL Buffer.
    - **WAL Buffer Entries Count:** The number of entries in the WAL Buffer.
- Flush Statistics
  - **Flush MemTable Cost (avg):** The average total flush time, including time spent in different sub-stages.
  - **Flush MemTable Cost (50%):** The median total flush time, including time spent in different sub-stages.
  - **Flush MemTable Cost (99%):** The P99 total flush time, including time spent in different sub-stages.
  - **Flush Sub Task Cost (avg):** The average execution time of flush sub-tasks, including sorting, encoding, and I/O stages.
  - **Flush Sub Task Cost (50%):** The median execution time of flush sub-tasks, including sorting, encoding, and I/O stages.
  - **Flush Sub Task Cost (99%):** The P99 execution time of flush sub-tasks, including sorting, encoding, and I/O stages.
- **Pending Flush Task Num:** The number of Flush tasks currently in a blocked state.
- **Pending Flush Sub Task Num:** The number of blocked Flush sub-tasks.
- **TsFile Compression Ratio of Flushing MemTable:** The compression ratio of TsFiles generated from flushed MemTables.
- **Flush TsFile Size of DataRegions:** The size of TsFiles generated from flushed MemTables in different DataRegions.
- **Size of Flushing MemTable:** The size of the MemTable currently being flushed.
- **Points Num of Flushing MemTable:** The number of data points being flushed from MemTables in different DataRegions.
- S**eries Num of Flushing MemTable:** The number of time series being flushed from MemTables in different DataRegions.
- **Average Point Num of Flushing MemChunk:** The average number of points in MemChunks being flushed.

#### 3.4.5 Schema Engine

- **Schema Engine Mode:** The metadata engine mode used by the node.
- **Schema Consensus Protocol:** The metadata consensus protocol used by the node.
- **Schema Region Number:** The number of SchemaRegions managed by the node.
- **Schema Region Memory Overview:** The total memory used by SchemaRegions on the node.
- **Memory Usage per SchemaRegion:** The average memory usage per SchemaRegion.
- **Cache MNode per SchemaRegion:** The number of cached MNodes per SchemaRegion.
- **MLog Length and Checkpoint****:** The current MLog size and checkpoint position for each SchemaRegion (valid only for SimpleConsensus).
- **Buffer MNode per SchemaRegion:** The number of buffered MNodes per SchemaRegion.
- **Activated Template Count per SchemaRegion:** The number of activated templates per SchemaRegion.
- Time Series Statistics
  - **Timeseries Count per SchemaRegion:** The average number of time series per SchemaRegion.
  - **Series Type:** The number of time series of different types.
  - **Time Series Number:** The total number of time series on the node.
  - **Template Series Number:** The total number of template-based time series on the node.
  - **Template Series Count per SchemaRegion:** The number of time series created via templates per SchemaRegion.
- IMNode Statistics
  - **Pinned MNode per SchemaRegion:** The number of pinned IMNodes per SchemaRegion.
  - **Pinned Memory per SchemaRegion:** The memory usage of pinned IMNodes per SchemaRegion.
  - **Unpinned MNode per SchemaRegion:** The number of unpinned IMNodes per SchemaRegion.
  - **Unpinned Memory per SchemaRegion:** The memory usage of unpinned IMNodes per SchemaRegion.
  - **Schema File Memory MNode Number:** The total number of pinned and unpinned IMNodes on the node.
  - **Release and Flush MNode Rate:** The number of IMNodes released and flushed per second.
- **Cache Hit Rate:** The cache hit ratio of the node.
- **Release and Flush Thread Number:** The number of active threads for releasing and flushing memory.
- **Time Consumed of Release and Flush (avg):** The average execution time for cache release and buffer flush.
- **Time Consumed of Release and Flush (99%):** The P99 execution time for cache release and buffer flush.

#### 3.4.6 Query Engine

- Time Consumed at Each Stage
  - **The time consumed of query plan stages (avg):** The average time consumed in different query plan stages on the node.
  - **The time consumed of query plan stages (50%):** The median time consumed in different query plan stages on the node.
  - **The time consumed of query plan stages (99%):** The P99 time consumed in different query plan stages on the node.
- Plan Dispatch Time
  - **The time consumed of plan dispatch stages (avg):** The average time consumed in query execution plan dispatch.
  - **The time consumed of plan dispatch stages (50%):** The median time consumed in query execution plan dispatch.
  - **The time consumed of plan dispatch stages (99%):** The P99 time consumed in query execution plan dispatch.
- Query Execution Time
  - **The time consumed of query execution stages (avg):** The average time consumed in query execution on the node.
  - **The time consumed of query execution stages (50%):** The median time consumed in query execution on the node.
  - **The time consumed of query execution stages (99%):** The P99 time consumed in query execution on the node.
- Operator Execution Time
  - **The time consumed of operator execution stages (avg):** The average time consumed in query operator execution.
  - **The time consumed of operator execution (50%):** The median time consumed in query operator execution.
  - **The time consumed of operator execution (99%):** The P99 time consumed in query operator execution
- Aggregation Query Computation Time
  - **The time consumed of query aggregation (avg):** The average time consumed in aggregation query computation.
  - **The time consumed of query aggregation (50%):** The median time consumed in aggregation query computation.
  - **The time consumed of query aggregation (99%):** The P99 time consumed in aggregation query computation.
- File/Memory Interface Time
  - **The time consumed of query scan (avg):** The average time consumed in file/memory interface query scans.
  - **The time consumed of query scan (50%):** The median time consumed in file/memory interface query scans.
  - **The time consumed of query scan (99%):** The P99 time consumed in file/memory interface query scans.
- Resource Access Count
  - **The usage of query resource (avg):** The average number of resource accesses during query execution.
  - **The usage of query resource (50%):** The median number of resource accesses during query execution.
  - **The usage of query resource (99%):** The P99 number of resource accesses during query execution.
- Data Transmission Time
  - **The time consumed of query data exchange (avg):** The average time consumed in query data exchange.
  - **The time consumed of query data exchange (50%):** The median time consumed in query data exchange.
  - **The time consumed of query data exchange (99%):** The P99 time consumed in query data exchange.
- Data Transmission Count
  - **The count of Data Exchange (avg):** The average number of data exchanges during queries.
  - **The count of Data Exchange:** The quantiles (median, P99) of data exchanges during queries.
- Task Scheduling Count and Time
  - **The number of query queue:** The number of query tasks scheduled.
  - **The time consumed of query schedule time (avg):** The average time consumed for query scheduling.
  - **The time consumed of query schedule time (50%):** The median time consumed for query scheduling.
  - **The time consumed of query schedule time (99%):** The P99 time consumed for query scheduling.

#### 3.4.7 Query Interface

- Load Time Series Metadata
  - **The time consumed of load timeseries metadata (avg):** The average time consumed for loading time series metadata.
  - **The time consumed of load timeseries metadata (50%):** The median time consumed for loading time series metadata.
  - **The time consumed of load timeseries metadata (99%):** The P99 time consumed for loading time series metadata.
- Read Time Series
  - **The time consumed of read timeseries metadata (avg):** The average time consumed for reading time series.
  - **The time consumed of read timeseries metadata (50%):** The median time consumed for reading time series.
  - **The time consumed of read timeseries metadata (99%):** The P99 time consumed for reading time series.
- Modify Time Series Metadata
  - **The time consumed of timeseries metadata modification (avg):** The average time consumed for modifying time series metadata.
  - **The time consumed of timeseries metadata modification (50%):** The median time consumed for modifying time series metadata.
  - **The time consumed of timeseries metadata modification (99%):** The P99 time consumed for modifying time series metadata.
- Load Chunk Metadata List
  - The time consumed of load chunk metadata list(avg): Average time consumed of loading chunk metadata list by the node
  - The time consumed of load chunk metadata list(50%): Median time consumed of loading chunk metadata list by the node
  - The time consumed of load chunk metadata list(99%): P99 time consumed of loading chunk metadata list by the node
- Modify Chunk Metadata
  - The time consumed of chunk metadata modification(avg): Average time consumed of modifying chunk metadata by the node
  - The time consumed of chunk metadata modification(50%): Median time consumed of modifying chunk metadata by the node
  - The time consumed of chunk metadata modification(99%): P99 time consumed of modifying chunk metadata by the node
- Filter by Chunk Metadata
  - **The time consumed of chunk metadata filter (avg):** The average time consumed for filtering by chunk metadata.
  - **The time consumed of chunk metadata filter (50%):** The median time consumed for filtering by chunk metadata.
  - **The time consumed of chunk metadata filter (99%):** The P99 time consumed for filtering by chunk metadata.
- Construct Chunk Reader
  - **The time consumed of construct chunk reader (avg):** The average time consumed for constructing a Chunk Reader.
  - **The time consumed of construct chunk reader (50%):** The median time consumed for constructing a Chunk Reader.
  - **The time consumed of construct chunk reader (99%):** The P99 time consumed for constructing a Chunk Reader.
- Read Chunk
  - **The time consumed of read chunk (avg):** The average time consumed for reading a Chunk.
  - **The time consumed of read chunk (50%):** The median time consumed for reading a Chunk.
  - **The time consumed of read chunk (99%):** The P99 time consumed for reading a Chunk.
- Initialize Chunk Reader
  - **The time consumed of init chunk reader (avg):** The average time consumed for initializing a Chunk Reader.
  - **The time consumed of init chunk reader (50%):** The median time consumed for initializing a Chunk Reader.
  - **The time consumed of init chunk reader (99%):** The P99 time consumed for initializing a Chunk Reader.
- Build TsBlock from Page Reader
  - **The time consumed of build tsblock from page reader (avg):** The average time consumed for building a TsBlock using a Page Reader.
  - **The time consumed of build tsblock from page reader (50%):** The median time consumed for building a TsBlock using a Page Reader.
  - **The time consumed of build tsblock from page reader (99%):** The P99 time consumed for building a TsBlock using a Page Reader.
- Build TsBlock from Merge Reader
  - **The time consumed of build tsblock from merge reader (avg):** The average time consumed for building a TsBlock using a Merge Reader.
  - **The time consumed of build tsblock from merge reader (50%):** The median time consumed for building a TsBlock using a Merge Reader.
  - **The time consumed of build tsblock from merge reader (99%):** The P99 time consumed for building a TsBlock using a Merge Reader.

#### 3.4.8 Query Data Exchange

Time consumed of data exchange in queries.

- Get TsBlock via Source Handle
  - **The time consumed of source handle get tsblock (avg):** The average time consumed for retrieving a TsBlock using the source handle.
  - **The time consumed of source handle get tsblock (50%):** The median time consumed for retrieving a TsBlock using the source handle.
  - **The time consumed of source handle get tsblock (99%):** The P99 time consumed for retrieving a TsBlock using the source handle.
- Deserialize TsBlock via Source Handle
  - **The time consumed of source handle deserialize tsblock (avg):** The average time consumed for deserializing a TsBlock via the source handle.
  - **The time consumed of source handle deserialize tsblock (50%):** The median time consumed for deserializing a TsBlock via the source handle.
  - **The time consumed of source handle deserialize tsblock (99%):** The P99 time consumed for deserializing a TsBlock via the source handle.
- Send TsBlock via Sink Handle
  - **The time consumed of sink handle send tsblock (avg):** The average time consumed for sending a TsBlock via the sink handle.
  - **The time consumed of sink handle send tsblock (50%):** The median time consumed for sending a TsBlock via the sink handle.
  - **The time consumed of sink handle send tsblock (99%):** The P99 time consumed for sending a TsBlock via the sink handle.
- Handle Data Block Event Callback
  - **The time consumed of handling data block event callback (avg):** The average time consumed for handling the callback of a data block event during query execution.
  - **The time consumed of handling data block event callback (50%):** The median time consumed for handling the callback of a data block event during query execution.
  - **The time consumed of handling data block event callback (99%):** The P99 time consumed for handling the callback of a data block event during query execution.
- Get Data Block Task
  - **The time consumed of get data block task (avg):** The average time consumed for retrieving a data block task.
  - **The time consumed of get data block task (50%):** The median time consumed for retrieving a data block task.
  - **The time consumed of get data block task (99%):** The P99 time consumed for retrieving a data block task.

#### 3.4.9 Query Related Resource

- **MppDataExchangeManager:** The number of shuffle sink handles and source handles during queries.
- **LocalExecutionPlanner:** The remaining memory available for query fragments.
- **FragmentInstanceManager:** The context information and count of running query fragments.
- **Coordinator:** The number of queries recorded on the node.
- **MemoryPool Size:** The status of the memory pool related to queries.
- **MemoryPool Capacity:** The size of the query-related memory pool, including the maximum and remaining available capacity.
- **DriverScheduler:** The number of queued query tasks.

#### 3.4.10 Consensus - IoT Consensus

- Memory Usage
  - **IoTConsensus Used Memory:** The memory usage of IoT Consensus, including total used memory, queue memory usage, and synchronization memory usage.
- Synchronization between Nodes
  - **IoTConsensus Sync Index:** The sync index size of different DataRegions.
  - **IoTConsensus Overview:** The total synchronization lag and cached request count of IoT Consensus.
  - **IoTConsensus Search Index Rate:** The growth rate of SearchIndex writes for different DataRegions.
  - **IoTConsensus Safe Index Rate:** The growth rate of SafeIndex synchronization for different DataRegions.
  - **IoTConsensus LogDispatcher Request Size:** The size of synchronization requests sent to other nodes for different DataRegions.
  - **Sync Lag:** The synchronization lag size of different DataRegions.
  - **Min Peer Sync Lag:** The minimum synchronization lag to different replicas for different DataRegions.
  - **Sync Speed Diff of Peers:** The maximum synchronization lag to different replicas for different DataRegions.
  - **IoTConsensus LogEntriesFromWAL Rate:** The rate of retrieving log entries from WAL for different DataRegions.
  - **IoTConsensus LogEntriesFromQueue Rate:** The rate of retrieving log entries from the queue for different DataRegions.
- Execution Time of Different Stages
  - **The Time Consumed of Different Stages (avg):** The average execution time of different stages in IoT Consensus.
  - **The Time Consumed of Different Stages (50%):** The median execution time of different stages in IoT Consensus.
  - **The Time Consumed of Different Stages (99%):** The P99 execution time of different stages in IoT Consensus.

#### 3.4.11 Consensus - DataRegion Ratis Consensus

- **Ratis Stage Time:** The execution time of different stages in Ratis.
- **Write Log Entry:** The execution time for writing logs in Ratis.
- **Remote / Local Write Time:** The time taken for remote and local writes in Ratis.
- **Remote / Local Write QPS****:** The QPS for remote and local writes in Ratis.
- **RatisConsensus Memory:** The memory usage of Ratis consensus.

#### 3.4.12 Consensus - SchemaRegion Ratis Consensus

- **Ratis Stage Time:** The execution time of different stages in Ratis.
- **Write Log Entry:** The execution time for writing logs in Ratis.
- **Remote / Local Write Time:** The time taken for remote and local writes in Ratis.
- **Remote / Local Write QPS****:** The QPS for remote and local writes in Ratis.
- **RatisConsensus Memory:** The memory usage of Ratis consensus.