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
# 监控面板部署

IoTDB配套监控面板是IoTDB企业版配套工具之一。它旨在解决IoTDB及其所在操作系统的监控问题，主要包括：操作系统资源监控、IoTDB性能监控，及上百项内核监控指标，从而帮助用户监控集群健康状态，并进行集群调优和运维。本文将以常见的3C3D集群(3个Confignode和3个Datanode)为例，为您介绍如何在IoTDB的实例中开启系统监控模块，并且使用Prometheus + Grafana的方式完成对系统监控指标的可视化。

## 安装准备

1. 安装 IoTDB：需先安装IoTDB V1.0 版本及以上企业版，您可联系商务或技术支持获取
2. 获取 IoTDB 监控面板安装包：基于企业版 IoTDB 的数据库监控面板，您可联系商务或技术支持获取

## 安装步骤

### 步骤一：IoTDB开启监控指标采集

1. 打开监控配置项。IoTDB中监控有关的配置项默认是关闭的，在部署监控面板前，您需要打开相关配置项（注意开启监控配置后需要重启服务）。

| 配置项                             | 所在配置文件                     | 配置说明                                                     |
| :--------------------------------- | :------------------------------- | :----------------------------------------------------------- |
| cn_metric_reporter_list            | conf/iotdb-confignode.properties | 将配置项取消注释，值设置为PROMETHEUS                         |
| cn_metric_level                    | conf/iotdb-confignode.properties | 将配置项取消注释，值设置为IMPORTANT                          |
| cn_metric_prometheus_reporter_port | conf/iotdb-confignode.properties | 将配置项取消注释，可保持默认设置9091，如设置其他端口，不与其他端口冲突即可 |
| dn_metric_reporter_list            | conf/iotdb-datanode.properties   | 将配置项取消注释，值设置为PROMETHEUS                         |
| dn_metric_level                    | conf/iotdb-datanode.properties   | 将配置项取消注释，值设置为IMPORTANT                          |
| dn_metric_prometheus_reporter_port | conf/iotdb-datanode.properties   | 将配置项取消注释，可默认设置为9092，如设置其他端口，不与其他端口冲突即可 |
| dn_metric_internal_reporter_type   | conf/iotdb-datanode.properties   | 将配置项取消注释，值设置为IOTDB                              |

以3C3D集群为例，需要修改的监控配置如下：

| 节点ip      | 主机名  | 集群角色   | 配置文件路径                     | 配置项                                                       |
| ----------- | ------- | ---------- | -------------------------------- | ------------------------------------------------------------ |
| 192.168.1.3 | iotdb-1 | confignode | conf/iotdb-confignode.properties | cn_metric_reporter_list=PROMETHEUS cn_metric_level=IMPORTANT cn_metric_prometheus_reporter_port=9091 |
| 192.168.1.4 | iotdb-2 | confignode | conf/iotdb-confignode.properties | cn_metric_reporter_list=PROMETHEUS cn_metric_level=IMPORTANT cn_metric_prometheus_reporter_port=9091 |
| 192.168.1.5 | iotdb-3 | confignode | conf/iotdb-confignode.properties | cn_metric_reporter_list=PROMETHEUS cn_metric_level=IMPORTANT cn_metric_prometheus_reporter_port=9091 |
| 192.168.1.3 | iotdb-1 | datanode   | conf/iotdb-datanode.properties   | dn_metric_reporter_list=PROMETHEUS dn_metric_level=IMPORTANT dn_metric_prometheus_reporter_port=9092 dn_metric_internal_reporter_type=IOTDB |
| 192.168.1.4 | iotdb-2 | datanode   | conf/iotdb-datanode.properties   | dn_metric_reporter_list=PROMETHEUS dn_metric_level=IMPORTANT dn_metric_prometheus_reporter_port=9092 dn_metric_internal_reporter_type=IOTDB |
| 192.168.1.5 | iotdb-3 | datanode   | conf/iotdb-datanode.properties   | dn_metric_reporter_list=PROMETHEUS dn_metric_level=IMPORTANT dn_metric_prometheus_reporter_port=9092 dn_metric_internal_reporter_type=IOTDB |

2. 重启所有节点。修改3个节点的监控指标配置后，可重新启动所有节点的confignode和datanode服务：

```shell
./sbin/stop-standalone.sh      #先停止confignode和datanode
./sbin/start-confignode.sh  -d #启动confignode
./sbin/start-datanode.sh  -d   #启动datanode 
```

3. 重启后，通过客户端确认各节点的运行状态，若状态都为Running，则为配置成功：

![](https://alioss.timecho.com/docs/img/%E5%90%AF%E5%8A%A8.PNG)

### 步骤二：安装、配置Prometheus

> 此处以prometheus安装在服务器192.168.1.3为例。

1. 下载 Prometheus 安装包，要求安装 V2.30.3 版本及以上，可前往 Prometheus 官网下载（https://prometheus.io/download）
2. 解压安装包，进入解压后的文件夹：

```Shell
tar xvfz prometheus-*.tar.gz
cd prometheus-*
```

3. 修改配置。修改配置文件prometheus.yml如下
   1. 新增confignode任务收集ConfigNode的监控数据
   2. 新增datanode任务收集DataNode的监控数据

```shell
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

4. 启动Prometheus。Prometheus 监控数据的默认过期时间为15天，在生产环境中，建议将其调整为180天以上，以对更长时间的历史监控数据进行追踪，启动命令如下所示：

```Shell
./prometheus --config.file=prometheus.yml --storage.tsdb.retention.time=180d
```

5. 确认启动成功。在浏览器中输入 http://192.168.1.3:9090，进入Prometheus，点击进入Status下的Target界面，当看到State均为Up时表示配置成功并已经联通。

![](https://alioss.timecho.com/docs/img/prometheus.png)



6. 点击Targets中左侧链接可以跳转到网页监控，查看相应节点的监控信息：

![](https://alioss.timecho.com/docs/img/%E8%8A%82%E7%82%B9%E7%9B%91%E6%8E%A7.png)

### 步骤三：安装grafana并配置数据源

> 此处以Grafana安装在服务器192.168.1.3为例。

1. 下载 Grafana 安装包，要求安装 V8.4.2 版本及以上，可以前往Grafana官网下载（https://grafana.com/grafana/download）
2. 解压并进入对应文件夹

```Shell
tar -zxvf grafana-*.tar.gz
cd grafana-*
```

3. 启动Grafana：

```Shell
./bin/grafana-server web 
```

4. 登录Grafana。在浏览器中输入 http://192.168.1.3:3000（或修改后的端口），进入Grafana，默认初始用户名和密码均为 admin。

5. 配置数据源。在Connections中找到Data sources，新增一个data source并配置Data Source为Prometheus

![](https://alioss.timecho.com/docs/img/%E6%B7%BB%E5%8A%A0%E9%85%8D%E7%BD%AE.png)

在配置Data Source时注意Prometheus所在的URL，配置好后点击Save & Test 出现 Data source is working 提示则为配置成功

![](https://alioss.timecho.com/docs/img/%E9%85%8D%E7%BD%AE%E6%88%90%E5%8A%9F.png)

### 步骤四：导入IoTDB Grafana看板

1. 进入Grafana，选择Dashboards：

   ![](https://alioss.timecho.com/docs/img/%E9%9D%A2%E6%9D%BF%E9%80%89%E6%8B%A9.png)

2. 点击右侧 Import 按钮

      ![](https://alioss.timecho.com/docs/img/Import%E6%8C%89%E9%92%AE.png)

3. 使用upload json file的方式导入Dashboard

      ![](https://alioss.timecho.com/docs/img/%E5%AF%BC%E5%85%A5Dashboard.png)

4. 选择IoTDB监控面板中其中一个面板的json文件，这里以选择 Apache IoTDB ConfigNode Dashboard为例（监控面板安装包获取参见本文【安装准备】）：

      ![](https://alioss.timecho.com/docs/img/%E9%80%89%E6%8B%A9%E9%9D%A2%E6%9D%BF.png)

5. 选择数据源为Prometheus，然后点击Import

      ![](https://alioss.timecho.com/docs/img/%E9%80%89%E6%8B%A9%E6%95%B0%E6%8D%AE%E6%BA%90.png)

6. 之后就可以看到导入的Apache IoTDB ConfigNode Dashboard监控面板

      ![](https://alioss.timecho.com/docs/img/%E9%9D%A2%E6%9D%BF.png)

7. 同样地，我们可以导入Apache IoTDB DataNode Dashboard、Apache Performance Overview Dashboard、Apache System Overview Dashboard，可看到如下的监控面板：

      <div style="display: flex;justify-content: space-between;">
      <img src="https://alioss.timecho.com/docs/img/%E9%9D%A2%E6%9D%BF1-eppf.png" alt="" style="width: 30%;" />
      <img src="https://alioss.timecho.com/docs/img/%E9%9D%A2%E6%9D%BF2.png"  alt="" style="width: 30%;"/> 
      <img src="https://alioss.timecho.com/docs/img/%E9%9D%A2%E6%9D%BF3.png"  alt="" style="width: 30%;"/>
    </div>

8. 至此，IoTDB监控面板就全部导入完成了，现在可以随时查看监控信息了。

      ![](https://alioss.timecho.com/docs/img/%E9%9D%A2%E6%9D%BF%E6%B1%87%E6%80%BB.png)

## 附录、监控指标详解

### 1. 系统面板（System Dashboard）

该面板展示了当前系统CPU、内存、磁盘、网络资源的使用情况已经JVM的部分状况。

#### 1.1 CPU

- CPU Core：CPU 核数
- CPU Load：
  - System CPU Load：整个系统在采样时间内 CPU 的平均负载和繁忙程度
  - Process CPU Load：IoTDB 进程在采样时间内占用的 CPU 比例
- CPU Time Per Minute：系统每分钟内所有进程的 CPU 时间总和

#### 1.2 Memory

- System Memory：当前系统内存的使用情况。
  - Commited vm size： 操作系统分配给正在运行的进程使用的虚拟内存的大小。
  - Total physical memory：系统可用物理内存的总量。
  - Used physical memory：系统已经使用的内存总量。包含进程实际使用的内存量和操作系统 buffers/cache 占用的内存。
- System Swap Memory：交换空间（Swap Space）内存用量。
- Process Memory：IoTDB 进程使用内存的情况。
  - Max Memory：IoTDB 进程能够从操作系统那里最大请求到的内存量。（datanode-env/confignode-env 配置文件中配置分配的内存大小）
  - Total Memory：IoTDB 进程当前已经从操作系统中请求到的内存总量。
  - Used Memory：IoTDB 进程当前已经使用的内存总量。

#### 1.3 Disk

- Disk Space：
  - Total disk space：IoTDB 可使用的最大磁盘空间。
  - Used disk space：IoTDB 已经使用的磁盘空间。
- Log Number Per Minute：采样时间内每分钟 IoTDB 各级别日志数量的平均值。
- File Count：IoTDB 相关文件数量
  - all：所有文件数量
  - TsFile：TsFile 数量
  - seq：顺序 TsFile 数量
  - unseq：乱序 TsFile 数量
  - wal：WAL 文件数量
  - cross-temp：跨空间合并 temp 文件数量
  - inner-seq-temp：顺序空间内合并 temp 文件数量
  - innser-unseq-temp：乱序空间内合并 temp 文件数量
  - mods：墓碑文件数量
- Open File Count：系统打开的文件句柄数量
- File Size：IoTDB 相关文件的大小。各子项分别是对应文件的大小。
- Disk I/O Busy Rate：等价于 iostat 中的 %util 指标，一定程度上反映磁盘的繁忙程度。各子项分别是对应磁盘的指标。
- Disk I/O Throughput：系统各磁盘在一段时间 I/O Throughput 的平均值。各子项分别是对应磁盘的指标。
- Disk I/O Ops：等价于 iostat 中的 r/s 、w/s、rrqm/s、wrqm/s 四个指标，指的是磁盘每秒钟进行 I/O 的次数。read 和 write 指的是磁盘执行单次 I/O 的次数，由于块设备有相应的调度算法，在某些情况下可以将多个相邻的 I/O 合并为一次进行，merged-read 和 merged-write 指的是将多个 I/O 合并为一个 I/O 进行的次数。
- Disk I/O Avg Time：等价于 iostat 的 await，即每个 I/O 请求的平均时延。读和写请求分开记录。
- Disk I/O Avg Size：等价于 iostat 的 avgrq-sz，反映了每个 I/O 请求的大小。读和写请求分开记录。
- Disk I/O Avg Queue Size：等价于 iostat 中的 avgqu-sz，即 I/O 请求队列的平均长度。
- I/O System Call Rate：进程调用读写系统调用的频率，类似于 IOPS。
- I/O Throughput：进程进行 I/O 的吞吐量，分为 actual_read/write 和 attempt_read/write 两类。actual read 和 actual write 指的是进程实际导致块设备进行 I/O 的字节数，不包含被 Page Cache 处理的部分。

#### 1.4 JVM

- GC Time Percentage：节点 JVM 在过去一分钟的时间窗口内，GC 耗时所占的比例
- GC Allocated/Promoted Size Detail： 节点 JVM 平均每分钟晋升到老年代的对象大小，新生代/老年代和非分代新申请的对象大小
- GC Data Size Detail：节点 JVM 长期存活的对象大小和对应代际允许的最大值
- Heap Memory：JVM 堆内存使用情况。
  - Maximum heap memory：JVM 最大可用的堆内存大小。
  - Committed heap memory：JVM 已提交的堆内存大小。
  - Used heap memory：JVM 已经使用的堆内存大小。
  - PS Eden Space：PS Young 区的大小。
  - PS Old Space：PS Old 区的大小。
  - PS Survivor Space：PS Survivor 区的大小。
  - ...（CMS/G1/ZGC 等）
- Off Heap Memory：堆外内存用量。
  - direct memory：堆外直接内存。
  - mapped memory：堆外映射内存。
- GC Number Per Minute：节点 JVM 平均每分钟进行垃圾回收的次数，包括 YGC 和 FGC
- GC Time Per Minute：节点 JVM 平均每分钟进行垃圾回收的耗时，包括 YGC 和 FGC
- GC Number Per Minute Detail：节点 JVM 平均每分钟由于不同 cause 进行垃圾回收的次数，包括 YGC 和 FGC
- GC Time Per Minute Detail：节点 JVM 平均每分钟由于不同 cause 进行垃圾回收的耗时，包括 YGC 和 FGC
- Time Consumed Of Compilation Per Minute：每分钟 JVM 用于编译的总时间
- The Number of Class：
  - loaded：JVM 目前已经加载的类的数量
  - unloaded：系统启动至今 JVM 卸载的类的数量
- The Number of Java Thread：IoTDB 目前存活的线程数。各子项分别为各状态的线程数。

#### 1.5 Network

eno 指的是到公网的网卡，lo 是虚拟网卡。

- Net Speed：网卡发送和接收数据的速度
- Receive/Transmit Data Size：网卡发送或者接收的数据包大小，自系统重启后算起
- Packet Speed：网卡发送和接收数据包的速度，一次 RPC 请求可以对应一个或者多个数据包
- Connection Num：当前选定进程的 socket 连接数（IoTDB只有 TCP）

### 2. 整体性能面板（Performance Overview Dashboard）

#### 2.1 Cluster Overview

- Total CPU Core: 集群机器 CPU 总核数
- DataNode CPU Load: 集群各DataNode 节点的 CPU 使用率
- 磁盘
  - Total Disk Space: 集群机器磁盘总大小
  - DataNode Disk Usage: 集群各 DataNode 的磁盘使用率
- Total Timeseries: 集群管理的时间序列总数（含副本），实际时间序列数需结合元数据副本数计算
- Cluster: 集群 ConfigNode 和 DataNode 节点数量
- Up Time: 集群启动至今的时长
- Total Write Point Per Second: 集群每秒写入总点数（含副本），实际写入总点数需结合数据副本数分析
- 内存
  - Total System Memory: 集群机器系统内存总大小
  - Total Swap Memory: 集群机器交换内存总大小
  - DataNode Process Memory Usage: 集群各 DataNode 的内存使用率
- Total File Number: 集群管理文件总数量
- Cluster System Overview: 集群机器概述，包括平均 DataNode 节点内存占用率、平均机器磁盘使用率
- Total DataBase: 集群管理的 Database 总数（含副本）
- Total DataRegion: 集群管理的 DataRegion 总数
- Total SchemaRegion: 集群管理的 SchemaRegion 总数

####  2.2 Node Overview

- CPU Core: 节点所在机器的 CPU 核数
- Disk Space: 节点所在机器的磁盘大小
- Timeseries: 节点所在机器管理的时间序列数量（含副本）
- System Overview: 节点所在机器的系统概述，包括 CPU 负载、进程内存使用比率、磁盘使用比率
- Write Point Per Second: 节点所在机器的每秒写入速度（含副本）
- System Memory: 节点所在机器的系统内存大小
- Swap Memory: 节点所在机器的交换内存大小
- File Number: 节点管理的文件数

#### 2.3 Performance

- Session Idle Time: 节点的 session 连接的总空闲时间和总忙碌时间
- Client Connection: 节点的客户端连接情况，包括总连接数和活跃连接数
- Time Consumed Of Operation: 节点的各类型操作耗时，包括平均值和P99
- Average Time Consumed Of Interface: 节点的各个 thrift 接口平均耗时
- P99 Time Consumed Of Interface: 节点的各个 thrift 接口的 P99 耗时数
- Task Number: 节点的各项系统任务数量
- Average Time Consumed of Task: 节点的各项系统任务的平均耗时
- P99 Time Consumed of Task: 节点的各项系统任务的 P99 耗时
- Operation Per Second: 节点的每秒操作数
- 主流程
  - Operation Per Second Of Stage: 节点主流程各阶段的每秒操作数
  - Average Time Consumed Of Stage: 节点主流程各阶段平均耗时
  - P99 Time Consumed Of Stage: 节点主流程各阶段 P99 耗时
- Schedule 阶段
  - OPS Of Schedule: 节点 schedule 阶段各子阶段每秒操作数
  - Average Time Consumed Of Schedule Stage: 节点 schedule 阶段各子阶段平均耗时
  - P99 Time Consumed Of Schedule Stage: 节点的 schedule 阶段各子阶段 P99 耗时
- Local Schedule 各子阶段
  - OPS Of Local Schedule Stage: 节点 local schedule 各子阶段每秒操作数
  - Average Time Consumed Of Local Schedule Stage: 节点 local schedule 阶段各子阶段平均耗时
  - P99 Time Consumed Of Local Schedule Stage: 节点的 local schedule 阶段各子阶段 P99 耗时
- Storage 阶段
  - OPS Of Storage Stage: 节点 storage 阶段各子阶段每秒操作数
  - Average Time Consumed Of Storage Stage: 节点 storage 阶段各子阶段平均耗时
  - P99 Time Consumed Of Storage Stage: 节点 storage 阶段各子阶段 P99 耗时
- Engine 阶段
  - OPS Of Engine Stage: 节点 engine 阶段各子阶段每秒操作数
  - Average Time Consumed Of Engine Stage: 节点的 engine 阶段各子阶段平均耗时
  - P99 Time Consumed Of Engine Stage: 节点 engine 阶段各子阶段的 P99 耗时

#### 2.4 System

- CPU Load: 节点的 CPU 负载
- CPU Time Per Minute: 节点的每分钟 CPU 时间，最大值和 CPU 核数相关
- GC Time Per Minute: 节点的平均每分钟 GC 耗时，包括 YGC 和 FGC
- Heap Memory: 节点的堆内存使用情况
- Off Heap Memory: 节点的非堆内存使用情况
- The Number Of Java Thread: 节点的 Java 线程数量情况
- File Count: 节点管理的文件数量情况
- File Size: 节点管理文件大小情况
- Log Number Per Minute: 节点的每分钟不同类型日志情况

### 3. ConfigNode 面板（ConfigNode Dashboard）

该面板展示了集群中所有管理节点的表现情况，包括分区、节点信息、客户端连接情况统计等。

#### 3.1 Node Overview

- Database Count: 节点的数据库数量
- Region
  - DataRegion Count: 节点的 DataRegion 数量
  - DataRegion Current Status: 节点的 DataRegion 的状态
  - SchemaRegion Count: 节点的 SchemaRegion 数量
  - SchemaRegion Current Status: 节点的 SchemaRegion 的状态
- System Memory: 节点的系统内存大小
- Swap Memory: 节点的交换区内存大小
- ConfigNodes: 节点所在集群的 ConfigNode 的运行状态
- DataNodes: 节点所在集群的 DataNode 情况
- System Overview: 节点的系统概述，包括系统内存、磁盘使用、进程内存以及CPU负载

#### 3.2 NodeInfo

- Node Count: 节点所在集群的节点数量，包括 ConfigNode 和 DataNode
- ConfigNode Status: 节点所在集群的 ConfigNode 节点的状态
- DataNode Status: 节点所在集群的 DataNode 节点的状态
- SchemaRegion Distribution: 节点所在集群的 SchemaRegion 的分布情况
- SchemaRegionGroup Leader Distribution: 节点所在集群的 SchemaRegionGroup 的 Leader 分布情况
- DataRegion Distribution: 节点所在集群的 DataRegion 的分布情况
- DataRegionGroup Leader Distribution: 节点所在集群的 DataRegionGroup 的 Leader 分布情况

#### 3.3 Protocol

- 客户端数量统计
  - Active Client Num: 节点各线程池的活跃客户端数量
  - Idle Client Num: 节点各线程池的空闲客户端数量
  - Borrowed Client Count: 节点各线程池的借用客户端数量
  - Created Client Count: 节点各线程池的创建客户端数量
  - Destroyed Client Count: 节点各线程池的销毁客户端数量
- 客户端时间情况
  - Client Mean Active Time: 节点各线程池客户端的平均活跃时间
  - Client Mean Borrow Wait Time: 节点各线程池的客户端平均借用等待时间
  - Client Mean Idle Time: 节点各线程池的客户端平均空闲时间

#### 3.4 Partition Table

- SchemaRegionGroup Count: 节点所在集群的 Database 的 SchemaRegionGroup 的数量
- DataRegionGroup Count: 节点所在集群的 Database 的 DataRegionGroup 的数量
- SeriesSlot Count: 节点所在集群的 Database 的 SeriesSlot 的数量
- TimeSlot Count: 节点所在集群的 Database 的 TimeSlot 的数量
- DataRegion Status: 节点所在集群的 DataRegion 状态
- SchemaRegion Status: 节点所在集群的 SchemaRegion 的状态

#### 3.5 Consensus

- Ratis Stage Time: 节点的 Ratis 各阶段耗时
- Write Log Entry: 节点的 Ratis 写 Log 的耗时
- Remote / Local Write Time: 节点的 Ratis 的远程写入和本地写入的耗时
- Remote / Local Write QPS: 节点 Ratis 的远程和本地写入的 QPS
- RatisConsensus Memory: 节点 Ratis 共识协议的内存使用

### 4. DataNode 面板（DataNode Dashboard）

该面板展示了集群中所有数据节点的监控情况，包含写入耗时、查询耗时、存储文件数等。

#### 4.1 Node Overview

- The Number Of Entity: 节点管理的实体情况
- Write Point Per Second: 节点的每秒写入速度
- Memory Usage: 节点的内存使用情况，包括 IoT Consensus 各部分内存占用、SchemaRegion内存总占用和各个数据库的内存占用。

#### 4.2 Protocol

- 节点操作耗时
  - The Time Consumed Of Operation (avg): 节点的各项操作的平均耗时
  - The Time Consumed Of Operation (50%): 节点的各项操作耗时的中位数
  - The Time Consumed Of Operation (99%): 节点的各项操作耗时的P99
- Thrift统计
  - The QPS Of Interface: 节点各个 Thrift 接口的 QPS
  - The Avg Time Consumed Of Interface: 节点各个 Thrift 接口的平均耗时
  - Thrift Connection: 节点的各类型的 Thrfit 连接数量
  - Thrift Active Thread: 节点各类型的活跃 Thrift 连接数量
- 客户端统计
  - Active Client Num: 节点各线程池的活跃客户端数量
  - Idle Client Num: 节点各线程池的空闲客户端数量
  - Borrowed Client Count: 节点的各线程池借用客户端数量
  - Created Client Count: 节点各线程池的创建客户端数量
  - Destroyed Client Count: 节点各线程池的销毁客户端数量
  - Client Mean Active Time: 节点各线程池的客户端平均活跃时间
  - Client Mean Borrow Wait Time: 节点各线程池的客户端平均借用等待时间
  - Client Mean Idle Time: 节点各线程池的客户端平均空闲时间

#### 4.3 Storage Engine

- File Count: 节点管理的各类型文件数量
- File Size: 节点管理的各类型文件大小
- TsFile
  - TsFile Total Size In Each Level: 节点管理的各级别 TsFile 文件总大小
  - TsFile Count In Each Level: 节点管理的各级别 TsFile 文件数量
  - Avg TsFile Size In Each Level: 节点管理的各级别 TsFile 文件的平均大小
- Task Number: 节点的 Task 数量
- The Time Consumed of Task: 节点的 Task 的耗时
- Compaction
  - Compaction Read And Write Per Second: 节点的每秒钟合并读写速度
  - Compaction Number Per Minute: 节点的每分钟合并数量
  - Compaction Process Chunk Status: 节点合并不同状态的 Chunk 的数量
  - Compacted Point Num Per Minute: 节点每分钟合并的点数

#### 4.4 Write Performance

- Write Cost(avg): 节点写入耗时平均值，包括写入 wal 和 memtable
- Write Cost(50%): 节点写入耗时中位数，包括写入 wal 和 memtable
- Write Cost(99%): 节点写入耗时的P99，包括写入 wal 和 memtable
- WAL
  - WAL File Size: 节点管理的 WAL 文件总大小
  - WAL File Num: 节点管理的 WAL 文件数量
  - WAL Nodes Num: 节点管理的 WAL Node 数量
  - Make Checkpoint Costs: 节点创建各类型的 CheckPoint 的耗时
  - WAL Serialize Total Cost: 节点 WAL 序列化总耗时
  - Data Region Mem Cost: 节点不同的DataRegion的内存占用、当前实例的DataRegion的内存总占用、当前集群的 DataRegion 的内存总占用
  - Serialize One WAL Info Entry Cost: 节点序列化一个WAL Info Entry 耗时
  - Oldest MemTable Ram Cost When Cause Snapshot: 节点 WAL 触发 oldest MemTable snapshot 时 MemTable 大小
  - Oldest MemTable Ram Cost When Cause Flush: 节点 WAL 触发 oldest MemTable flush 时 MemTable 大小
  - Effective Info Ratio Of WALNode: 节点的不同 WALNode 的有效信息比
  - WAL Buffer
    - WAL Buffer Cost: 节点 WAL flush SyncBuffer 耗时，包含同步和异步两种
    - WAL Buffer Used Ratio: 节点的 WAL Buffer 的使用率
    - WAL Buffer Entries Count: 节点的 WAL Buffer 的条目数量
- Flush统计
  - Flush MemTable Cost(avg): 节点 Flush 的总耗时和各个子阶段耗时的平均值
  - Flush MemTable Cost(50%): 节点 Flush 的总耗时和各个子阶段耗时的中位数
  - Flush MemTable Cost(99%): 节点 Flush 的总耗时和各个子阶段耗时的 P99
  - Flush Sub Task Cost(avg): 节点的 Flush 平均子任务耗时平均情况，包括排序、编码、IO 阶段
  - Flush Sub Task Cost(50%): 节点的 Flush 各个子任务的耗时中位数情况，包括排序、编码、IO 阶段
  - Flush Sub Task Cost(99%): 节点的 Flush 平均子任务耗时P99情况，包括排序、编码、IO 阶段
- Pending Flush Task Num: 节点的处于阻塞状态的 Flush 任务数量
- Pending Flush Sub Task Num: 节点阻塞的 Flush 子任务数量
- Tsfile Compression Ratio Of Flushing MemTable: 节点刷盘 Memtable 时对应的 TsFile 压缩率
- Flush TsFile Size Of DataRegions: 节点不同 DataRegion 的每次刷盘时对应的 TsFile 大小
- Size Of Flushing MemTable: 节点刷盘的 Memtable 的大小
- Points Num Of Flushing MemTable: 节点不同 DataRegion 刷盘时的点数
- Series Num Of Flushing MemTable: 节点的不同 DataRegion 的 Memtable 刷盘时的时间序列数
- Average Point Num Of Flushing MemChunk: 节点 MemChunk 刷盘的平均点数

#### 4.5 Schema Engine

- Schema Engine Mode: 节点的元数据引擎模式
- Schema Consensus Protocol: 节点的元数据共识协议
- Schema Region Number: 节点管理的 SchemaRegion 数量
- Schema Region Memory Overview: 节点的 SchemaRegion 的内存数量
- Memory Usgae per SchemaRegion: 节点 SchemaRegion 的平均内存使用大小
- Cache MNode per SchemaRegion: 节点每个 SchemaRegion 中 cache node 个数
- MLog Length and Checkpoint: 节点每个 SchemaRegion 的当前 mlog 的总长度和检查点位置（仅 SimpleConsensus 有效）
- Buffer MNode per SchemaRegion: 节点每个 SchemaRegion 中 buffer node 个数
- Activated Template Count per SchemaRegion: 节点每个SchemaRegion中已激活的模版数
- 时间序列统计
  - Timeseries Count per SchemaRegion: 节点 SchemaRegion 的平均时间序列数
  - Series Type: 节点不同类型的时间序列数量
  - Time Series Number: 节点的时间序列总数
  - Template Series Number: 节点的模板时间序列总数
  - Template Series Count per SchemaRegion: 节点每个SchemaRegion中通过模版创建的序列数
- IMNode统计
  - Pinned MNode per SchemaRegion: 节点每个 SchemaRegion 中 Pinned 的 IMNode 节点数
  - Pinned Memory per SchemaRegion: 节点每个 SchemaRegion 中 Pinned 的 IMNode 节点的内存占用大小
  - Unpinned MNode per SchemaRegion: 节点每个 SchemaRegion 中 Unpinned 的 IMNode 节点数
  - Unpinned Memory per SchemaRegion: 节点每个 SchemaRegion 中 Unpinned 的 IMNode 节点的内存占用大小
  - Schema File Memory MNode Number: 节点全局 pinned 和 unpinned 的 IMNode 节点数
  - Release and Flush MNode Rate: 节点每秒 release 和 flush 的 IMNode 数量
- Cache Hit Rate: 节点的缓存命中率
- Release and Flush Thread Number: 节点当前活跃的 Release 和 Flush 线程数量
- Time Consumed of Relead and Flush (avg): 节点触发 cache 释放和 buffer 刷盘耗时的平均值
- Time Consumed of Relead and Flush (99%): 节点触发 cache 释放和 buffer 刷盘的耗时的 P99

#### 4.6 Query Engine

- 各阶段耗时
  - The time consumed of query plan stages(avg): 节点查询各阶段耗时的平均值
  - The time consumed of query plan stages(50%): 节点查询各阶段耗时的中位数
  - The time consumed of query plan stages(99%): 节点查询各阶段耗时的P99
- 执行计划分发耗时
  - The time consumed of plan dispatch stages(avg): 节点查询执行计划分发耗时的平均值
  - The time consumed of plan dispatch stages(50%): 节点查询执行计划分发耗时的中位数
  - The time consumed of plan dispatch stages(99%): 节点查询执行计划分发耗时的P99
- 执行计划执行耗时
  - The time consumed of query execution stages(avg): 节点查询执行计划执行耗时的平均值
  - The time consumed of query execution stages(50%): 节点查询执行计划执行耗时的中位数
  - The time consumed of query execution stages(99%): 节点查询执行计划执行耗时的P99
- 算子执行耗时
  - The time consumed of operator execution stages(avg): 节点查询算子执行耗时的平均值
  - The time consumed of operator execution(50%): 节点查询算子执行耗时的中位数
  - The time consumed of operator execution(99%): 节点查询算子执行耗时的P99
- 聚合查询计算耗时
  - The time consumed of query aggregation(avg): 节点聚合查询计算耗时的平均值
  - The time consumed of query aggregation(50%): 节点聚合查询计算耗时的中位数
  - The time consumed of query aggregation(99%): 节点聚合查询计算耗时的P99
- 文件/内存接口耗时
  - The time consumed of query scan(avg): 节点查询文件/内存接口耗时的平均值
  - The time consumed of query scan(50%): 节点查询文件/内存接口耗时的中位数
  - The time consumed of query scan(99%): 节点查询文件/内存接口耗时的P99
- 资源访问数量
  - The usage of query resource(avg): 节点查询资源访问数量的平均值
  - The usage of query resource(50%): 节点查询资源访问数量的中位数
  - The usage of query resource(99%): 节点查询资源访问数量的P99
- 数据传输耗时
  - The time consumed of query data exchange(avg): 节点查询数据传输耗时的平均值
  - The time consumed of query data exchange(50%): 节点查询数据传输耗时的中位数
  - The time consumed of query data exchange(99%): 节点查询数据传输耗时的P99
- 数据传输数量
  - The count of Data Exchange(avg): 节点查询的数据传输数量的平均值
  - The count of Data Exchange: 节点查询的数据传输数量的分位数，包括中位数和P99
- 任务调度数量与耗时
  - The number of query queue: 节点查询任务调度数量
  - The time consumed of query schedule time(avg): 节点查询任务调度耗时的平均值
  - The time consumed of query schedule time(50%): 节点查询任务调度耗时的中位数
  - The time consumed of query schedule time(99%): 节点查询任务调度耗时的P99

#### 4.7 Query Interface

- 加载时间序列元数据
  - The time consumed of load timeseries metadata(avg): 节点查询加载时间序列元数据耗时的平均值
  - The time consumed of load timeseries metadata(50%): 节点查询加载时间序列元数据耗时的中位数
  - The time consumed of load timeseries metadata(99%): 节点查询加载时间序列元数据耗时的P99
- 读取时间序列
  - The time consumed of read timeseries metadata(avg): 节点查询读取时间序列耗时的平均值
  - The time consumed of read timeseries metadata(50%): 节点查询读取时间序列耗时的中位数
  - The time consumed of read timeseries metadata(99%): 节点查询读取时间序列耗时的P99
- 修改时间序列元数据
  - The time consumed of timeseries metadata modification(avg): 节点查询修改时间序列元数据耗时的平均值
  - The time consumed of timeseries metadata modification(50%): 节点查询修改时间序列元数据耗时的中位数
  - The time consumed of timeseries metadata modification(99%): 节点查询修改时间序列元数据耗时的P99
- 加载Chunk元数据列表
  - The time consumed of load chunk metadata list(avg): 节点查询加载Chunk元数据列表耗时的平均值
  - The time consumed of load chunk metadata list(50%): 节点查询加载Chunk元数据列表耗时的中位数
  - The time consumed of load chunk metadata list(99%): 节点查询加载Chunk元数据列表耗时的P99
- 修改Chunk元数据
  - The time consumed of chunk metadata modification(avg): 节点查询修改Chunk元数据耗时的平均值
  - The time consumed of chunk metadata modification(50%): 节点查询修改Chunk元数据耗时的总位数
  - The time consumed of chunk metadata modification(99%): 节点查询修改Chunk元数据耗时的P99
- 按照Chunk元数据过滤
  - The time consumed of chunk metadata filter(avg): 节点查询按照Chunk元数据过滤耗时的平均值
  - The time consumed of chunk metadata filter(50%): 节点查询按照Chunk元数据过滤耗时的中位数
  - The time consumed of chunk metadata filter(99%): 节点查询按照Chunk元数据过滤耗时的P99
- 构造Chunk Reader
  - The time consumed of construct chunk reader(avg): 节点查询构造Chunk Reader耗时的平均值
  - The time consumed of construct chunk reader(50%): 节点查询构造Chunk Reader耗时的中位数
  - The time consumed of construct chunk reader(99%): 节点查询构造Chunk Reader耗时的P99
- 读取Chunk
  - The time consumed of read chunk(avg): 节点查询读取Chunk耗时的平均值
  - The time consumed of read chunk(50%): 节点查询读取Chunk耗时的中位数
  - The time consumed of read chunk(99%): 节点查询读取Chunk耗时的P99
- 初始化Chunk Reader
  - The time consumed of init chunk reader(avg): 节点查询初始化Chunk Reader耗时的平均值
  - The time consumed of init chunk reader(50%): 节点查询初始化Chunk Reader耗时的中位数
  - The time consumed of init chunk reader(99%): 节点查询初始化Chunk Reader耗时的P99
- 通过 Page Reader 构造 TsBlock 
  - The time consumed of build tsblock from page reader(avg): 节点查询通过 Page Reader 构造 TsBlock 耗时的平均值
  - The time consumed of build tsblock from page reader(50%): 节点查询通过 Page Reader 构造 TsBlock 耗时的中位数
  - The time consumed of build tsblock from page reader(99%): 节点查询通过 Page Reader 构造 TsBlock 耗时的P99
- 查询通过 Merge Reader 构造 TsBlock
  - The time consumed of build tsblock from merge reader(avg): 节点查询通过 Merge Reader 构造 TsBlock 耗时的平均值
  - The time consumed of build tsblock from merge reader(50%): 节点查询通过 Merge Reader 构造 TsBlock 耗时的中位数
  - The time consumed of build tsblock from merge reader(99%): 节点查询通过 Merge Reader 构造 TsBlock 耗时的P99

####  4.8 Query Data Exchange

查询的数据交换耗时。

- 通过 source handle 获取 TsBlock 
  - The time consumed of source handle get tsblock(avg): 节点查询通过 source handle 获取 TsBlock 耗时的平均值
  - The time consumed of source handle get tsblock(50%): 节点查询通过 source handle 获取 TsBlock 耗时的中位数
  - The time consumed of source handle get tsblock(99%): 节点查询通过 source handle 获取 TsBlock 耗时的P99
- 通过 source handle 反序列化 TsBlock
  - The time consumed of source handle deserialize tsblock(avg): 节点查询通过 source handle 反序列化 TsBlock 耗时的平均值
  - The time consumed of source handle deserialize tsblock(50%): 节点查询通过 source handle 反序列化 TsBlock 耗时的中位数
  - The time consumed of source handle deserialize tsblock(99%): 节点查询通过 source handle 反序列化 TsBlock 耗时的P99
- 通过 sink handle 发送 TsBlock 
  - The time consumed of sink handle send tsblock(avg): 节点查询通过 sink handle 发送 TsBlock 耗时的平均值
  - The time consumed of sink handle send tsblock(50%): 节点查询通过 sink handle 发送 TsBlock 耗时的中位数
  - The time consumed of sink handle send tsblock(99%): 节点查询通过 sink handle 发送 TsBlock 耗时的P99
- 回调 data block event
  - The time consumed of on acknowledge data block event task(avg): 节点查询回调 data block event 耗时的平均值
  - The time consumed of on acknowledge data block event task(50%): 节点查询回调 data block event 耗时的中位数
  - The time consumed of on acknowledge data block event task(99%): 节点查询回调 data block event 耗时的P99
- 获取 data block task 
  - The time consumed of get data block task(avg): 节点查询获取 data block task 耗时的平均值
  - The time consumed of get data block task(50%): 节点查询获取 data block task 耗时的中位数
  - The time consumed of get data block task(99%): 节点查询获取 data block task 耗时的 P99

#### 4.9 Query Related Resource

- MppDataExchangeManager: 节点查询时 shuffle sink handle 和 source handle 的数量
- LocalExecutionPlanner: 节点可分配给查询分片的剩余内存
- FragmentInstanceManager: 节点正在运行的查询分片上下文信息和查询分片的数量
- Coordinator: 节点上记录的查询数量
- MemoryPool Size: 节点查询相关的内存池情况
- MemoryPool Capacity: 节点查询相关的内存池的大小情况，包括最大值和剩余可用值
- DriverScheduler: 节点查询相关的队列任务数量

#### 4.10 Consensus - IoT Consensus

- 内存使用
  - IoTConsensus Used Memory: 节点的 IoT Consensus 的内存使用情况，包括总使用内存大小、队列使用内存大小、同步使用内存大小
- 节点间同步情况
  - IoTConsensus Sync Index: 节点的 IoT Consensus 的 不同 DataRegion 的 SyncIndex 大小
  - IoTConsensus Overview: 节点的 IoT Consensus 的总同步差距和缓存的请求数量
  - IoTConsensus Search Index Rate: 节点 IoT Consensus 不同 DataRegion 的写入 SearchIndex 的增长速率
  - IoTConsensus Safe Index Rate: 节点 IoT Consensus 不同 DataRegion 的同步 SafeIndex 的增长速率
  - IoTConsensus LogDispatcher Request Size: 节点 IoT Consensus 不同 DataRegion 同步到其他节点的请求大小
  - Sync Lag: 节点 IoT Consensus 不同 DataRegion 的同步差距大小
  - Min Peer Sync Lag: 节点 IoT Consensus 不同 DataRegion 向不同副本的最小同步差距
  - Sync Speed Diff Of Peers: 节点 IoT Consensus 不同 DataRegion 向不同副本同步的最大差距
  - IoTConsensus LogEntriesFromWAL Rate: 节点 IoT Consensus 不同 DataRegion 从 WAL 获取日志的速率
  - IoTConsensus LogEntriesFromQueue Rate: 节点 IoT Consensus 不同 DataRegion 从 队列获取日志的速率
- 不同执行阶段耗时
  - The Time Consumed Of Different Stages (avg): 节点 IoT Consensus 不同执行阶段的耗时的平均值
  - The Time Consumed Of Different Stages (50%): 节点 IoT Consensus 不同执行阶段的耗时的中位数
  - The Time Consumed Of Different Stages (99%): 节点 IoT Consensus 不同执行阶段的耗时的P99

#### 4.11 Consensus - DataRegion Ratis Consensus

- Ratis Stage Time: 节点 Ratis 不同阶段的耗时
- Write Log Entry: 节点 Ratis 写 Log 不同阶段的耗时
- Remote / Local Write Time: 节点 Ratis 在本地或者远端写入的耗时
- Remote / Local Write QPS: 节点 Ratis 在本地或者远端写入的 QPS
- RatisConsensus Memory: 节点 Ratis 的内存使用情况

#### 4.12 Consensus - SchemaRegion Ratis Consensus

- Ratis Stage Time: 节点 Ratis 不同阶段的耗时
- Write Log Entry: 节点 Ratis 写 Log 各阶段的耗时
- Remote / Local Write Time: 节点 Ratis 在本地或者远端写入的耗时
- Remote / Local Write QPS: 节点 Ratis 在本地或者远端写入的QPS
- RatisConsensus Memory: 节点 Ratis 内存使用情况