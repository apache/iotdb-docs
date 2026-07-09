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

# 集群维护

## 1. 核心概念

在进行集群维护操作前，需要理解 IoTDB 集群架构、序列分区、时间分区等相关概念。

### 1.1 名词汇总

|**名词**|**类型**|**解释**|
|---|---|---|
|ConfigNode|节点角色|管理节点，负责管理集群信息，包括分区信息的记录、负载均衡和操作调度与节点管理等功能。|
|DataNode|节点角色|数据节点，负责提供客户端的数据读写，全面管理数据和元数据，各个数据节点形成不同的副本组。|
|Database|元数据|数据库，不同数据库的数据物理隔离。|
|DeviceId|设备名|元数据树中从 root 到倒数第二级的全路径表示一个设备名。|
|SeriesSlot|序列分区槽|每个 Database 会对应固定个数的序列槽，包含其中序列的元数据。|
|TimeSlot|一个序列槽的一个时间分区槽|对应一个 SeriesSlot 内所有序列一个时间分区的数据。|
|DataPartition|数据分区槽|一个 SeriesSlot 加 一个 TimeSlot 对应一个 DataPartition|
|SchemaRegion|一组元数据分区|多个 SeriesSlot 的集合，DataNode 上的元数据管理引擎，提供对元数据的读写操作。|
|DataRegion|一组数据分区|多个 SeriesTimeSlot 的集合，DataNode 上的数据管理引擎，提供数据的读写操作。|
|ConfigNodeGroup|逻辑概念（共识组）|由集群中所有 ConfigNode 节点组成，通过共识协议维护一致的分区表信息。|
|SchemaRegionGroup|逻辑概念（共识组）|元数据副本组，包含元数据副本数个 SchemaRegion，管理相同的元数据，互为备份。|
|DataRegionGroup|逻辑概念（共识组）|数据副本组，包含数据副本数个 DataRegion，管理相同的数据，互为备份。是 IoTDB 集群吞吐能力的基础单元。|

### 1.2 集群架构

IoTDB 集群由管理节点（ConfigNode）与数据节点（DataNode）构成，采用 MPP 架构实现大规模并行处理。其核心特性在于对元数据进行设备级分区，对数据则进行设备与时间的二维分区，从而保障了全面的可扩展性。

![](/img/cluster-extention-1.png)

### 1.3 分区管理

#### 1.3.1 集群共识组

在 IoTDB 中，数据分区组（DataRegionGroup）和元数据分区组（SchemaRegionGroup）是读写负载的最小单元，通过**共识组**机制保证数据一致性。因此，集群扩容的本质即是增加数据分区，以提升并发能力与吞吐量。

![](/img/cluster-extention-2.png)

#### 1.3.2 分区槽机制

在分区和负载调度上，IoTDB 引入了两类核心槽机制来支持扩容和高效分布式管理。

第一类是**序列分区槽（SeriesPartitionSlot）**，它是对时间序列进行纵向管理的机制。每个数据库持有固定数量的序列分区槽（默认 1000 个），每个时间序列通过序列分区算法被分配到唯一的序列分区槽进行管理。使用序列分区槽可以避免直接记录设备或时间序列级别的分区信息，从而显著降低 ConfigNode 内存开销。

![](/img/cluster-extention-3.png)

第二类是**时间分区槽（TimePartitionSlot）**，它用于对时间序列数据进行横向切分。每个数据分区由一个序列分区槽和一个时间分区槽组合而成。当某个序列分区槽在特定时间分区槽下有数据时，就会生成对应的数据分区。

![](/img/cluster-extention-4.png)

通过序列分区槽与时间分区槽的组合，IoTDB 能够在扩容时灵活增加数据分区组，实现数据的均衡分布和高效读写，从而提升整个集群的吞吐能力与可扩展性。

## 2. 集群扩容

当 IoTDB 集群因数据量或访问压力激增，出现 CPU、内存、磁盘或网络等资源瓶颈时，可通过本指南进行横向扩容，以提升集群整体性能与承载力。

### 2.1 实现原理

IoTDB 集群扩容的核心是增加 DataNode 节点，因为 DataNode 是处理读写请求的主要节点。其内部的数据分区（DataRegion）是承载负载的关键单元，扩容的本质即通过增加数据分区组来提升集群并发能力与吞吐量。

默认情况下，假设集群的元数据副本数为三，数据副本数为二，初次初始化时会创建集群总核数除以二的数据分区。如下图一个由3台2核服务器组成的集群，假设每个数据副本组的处理能力为1，那么该集群（包含3个数据副本组）的总吞吐能力为3。因此，将服务器数量由三台扩展为六台，集群由原来的三数据分区组扩容为六数据分区组，总吞吐能力也相应实现翻倍。

![](/img/cluster-extention-5.png)

扩容后，客户端读写负载的均衡规则是旧节点可能同时处理老设备（集群中已存在的 DeviceId 的数据）和新设备（集群中不存在的 DeviceId 的数据）的数据读写，而新节点仅接收新增数据的读写，旧节点不会对原有副本组进行自动重均衡。数据负载均衡通常在每个新时间分区创建时进行，默认时间为每周四上午八点。其核心原理是通过序列分区槽和时间分区槽进行负载均衡算法运算，从而决定数据由哪个节点的哪个分区处理。

![](/img/cluster-extention-6.png)

如果希望在扩容后进一步均衡历史数据，可按需执行 Region 迁移或 Region 重均衡：当需要精确指定 Region、源 DataNode 和目标 DataNode 时，可参考【4\. 手动 Region 迁移】；当希望系统自动计算迁移方案并完成整体均衡时，可参考【5\. 自动 Region 重均衡】。

### 2.2 操作步骤

#### 2.2.1 前置准备

1. 服务器环境检查，建议操作系统版本与原集群保持一致。

2. 数据库版本检查，建议版本与原集群版本保持一致。

3. 操作系统环境检查，保证所需端口不被占用，DataNode 会占用端口 6667、10730、10740、10750 、10760、9090、9190、3000请确保这些端口未被占用。

    ```Shell
    #如果命令有输出，则表示该端口已被占用。
    lsof -i:6667  或  netstat -tunp | grep 6667
    lsof -i:10710  或  netstat -tunp | grep 10710
    lsof -i:10720  或  netstat -tunp | grep 10720
    ```

4. 数据目录检查，确认服务器已挂载数据盘，建议将安装包放在数据盘目录下。

5. 软件依赖：安装 Java 运行环境 ，Java 版本 \>= 1\.8，请确保已设置 jdk 环境变量。

6. 域名配置：部署时推荐优先使用 hostname 进行 IP 配置，可避免后期修改主机 IP 导致数据库无法启动的问题。设置 hostname 需要在目标服务器上配置`/etc/hosts`，如本机 IP 是192\.168\.1\.3，hostname 是 iotdb\-1，则可以使用以下命令设置服务器的 hostname，并使用 hostname 配置 IoTDB 的 cn\_internal\_address、dn\_internal\_address、dn\_rpc\_address。

```Shell
# 注意：本机和原集群节点的域名都需要配置
echo "192.168.1.3  iotdb-1" >> /etc/hosts
```

#### 2.2.2 扩容操作

1. 为确保您获取的 IoTDB 安装包完整且正确，在执行安装部署前建议您进行 SHA512 校验。

2. 解压安装包并进入安装目录

```Shell
unzip  iotdb-{version}-bin.zip
cd  iotdb-{version}-bin
```

3. 修改相应配置

```Shell
cd  iotdb-{version}-bin/conf
vim iotdb-system.properies
```

|配置项|说明|默认|备注|
|---|---|---|---|
|dn\_seed\_config\_node|节点注册加入集群时连接的 ConfigNode 地址,即 cn\_internal\_address:cn\_internal\_port|127\.0\.0\.1:10710<br>|非常重要，强制修改此项，将其改为原集群 ConfigNode 主节点的地址<br>|
|dn\_rpc\_address|客户端 RPC 服务的地址|0\.0\.0\.0|按需修改，重启服务生效|
|dn\_rpc\_port|客户端 RPC 服务的端口|6667|按需修改，重启服务生效|
|dn\_internal\_address|DataNode 在集群内部通讯使用的地址|127\.0\.0\.1|按需修改，首次启动后不能修改|
|dn\_internal\_port|DataNode 在集群内部通信使用的端口|10730|按需修改，首次启动后不能修改|
|dn\_mpp\_data\_exchange\_port|DataNode 用于接收数据流使用的端口|10740|按需修改，首次启动后不能修改|
|dn\_data\_region\_consensus\_port|DataNode 用于数据副本共识协议通信使用的端口|10750|按需修改，首次启动后不能修改|
|dn\_schema\_region\_consensus\_port|DataNode 用于元数据副本共识协议通信使用的端口|10760|按需修改，首次启动后不能修改|

4. 启动 DataNode 节点

进入 IoTDB 的 sbin 目录下，启动 Datanode：

```Shell
./sbin/start-datanode.sh -d    #“-d”参数将在后台进行启动
```

5. 通过 CLI 命令连接原集群，进行扩容后验证

```Shell
# Linux 或 macOS系统
  ./iotdb-{version}-bin/sbin/start-cli.sh
  
  # Windows 系统
  ./iotdb-{version}-bin/sbin/start-cli.bat
```

6. 执行命令进行验证

执行`show datanodes`命令进行验证，预期结果列表中出现新加入的节点，且节点状态为 Running。

```Shell
IoTDB> show datanodes
+------+-------+----------+-------+-------------+---------------+
|NodeID| Status|RpcAddress|RpcPort|DataRegionNum|SchemaRegionNum|
+------+-------+----------+-------+-------------+---------------+
|     1|Running|   0.0.0.0|   6667|            0|              0|
|     2|Running|   0.0.0.0|   6668|            1|              1|
|     3|Running|   0.0.0.0|   6669|            1|              0|
|     4|Running|   0.0.0.0|   6669|            1|              0| # 新加入节点
+------+-------+----------+-------+-------------+---------------+
Total line number = 4
It costs 0.110s
```

7. 其他节点重复以上操作。新节点能够成功加入原集群的前提是原集群允许加入的 DataNode 节点数量足够，否则需要联系工作人员重新申请激活码信息。

#### 2.2.3 手动负载均衡（按需选择）

默认情况下，扩容后历史数据不会自动迁移。若需进一步均衡各节点的数据分布，可选择以下方式：

- 手动 Region 迁移：适用于已明确需要迁移的 Region、源 DataNode 和目标 DataNode 的场景，详见【4\. 手动 Region 迁移】。

- 自动 Region 重均衡：适用于扩容后希望系统自动选择迁移方案、整体均衡历史数据的场景，详见【5\. 自动 Region 重均衡】。

## 3. 节点管理

节点管理主要用于对集群中的 ConfigNode 和 DataNode 进行移除和添加，是保障集群高可用、实现负载均衡的基础运维操作。

### 3.1 ConfigNode 节点维护

ConfigNode 节点维护分为 ConfigNode 添加和移除两种操作，有两个常见使用场景：

- 集群扩展：如集群中只有1个 ConfigNode 时，希望增加 ConfigNode 以提升 ConfigNode 节点高可用性，则可以添加 2 个 ConfigNode，使得集群中有 3 个 ConfigNode。

- 集群故障恢复：1 个 ConfigNode 所在机器发生故障，使得该 ConfigNode 无法正常运行，此时可以移除该 ConfigNode，然后添加一个新的 ConfigNode 进入集群。

> ❗️注意，在完成 ConfigNode 节点维护后，需要保证集群中有 1 或者 3 个正常运行的 ConfigNode。2个 ConfigNode 不具备高可用性，超过 3 个 ConfigNode 会导致性能损失。
> 
> 

#### 3.1.1 添加 ConfigNode 节点

脚本命令：

```Bash
# Linux / macOS
# 首先切换到 IoTDB 根目录
sbin/start-confignode.sh

# Windows
# 首先切换到 IoTDB 根目录
# V2.0.4.x 版本之前
sbin\start-confignode.bat

# V2.0.4.x 版本及之后 
sbin\windows\start-confignode.bat
```

参数介绍：

|参数|描述|是否为必填项|
|---|---|---|
|\-v|显示版本信息|否|
|\-f|在前台运行脚本，不将其放到后台|否|
|\-d|以守护进程模式启动，即在后台运行|否|
|\-p|指定一个文件来存放进程ID，用于进程管理|否|
|\-c|指定配置文件夹的路径，脚本会从这里加载配置文件|否|
|\-g|打印垃圾回收（GC）的详细信息|否|
|\-H|指定Java堆转储文件的路径，当JVM内存溢出时使用|否|
|\-E|指定JVM错误日志文件的路径|否|
|\-D|定义系统属性，格式为 key=value|否|
|\-X|直接传递 \-XX 参数给 JVM|否|
|\-h|帮助指令|否|

#### 3.1.2 移除 ConfigNode 节点

首先通过 CLI 连接集群，通过 show confignodes 确认想要移除 ConfigNode 的 NodeID：

```SQL
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

然后使用 SQL 将 ConfigNode 移除，SQL 命令：

```Bash
remove confignode [confignode_id]
```

### 3.2 DataNode 节点维护

DataNode 节点维护有两个常见场景：

- 集群扩容：出于集群能力扩容等目的，添加新的 DataNode 进入集群。

- 集群故障恢复：一个 DataNode 所在机器出现故障，使得该 DataNode 无法正常运行，此时可以移除该 DataNode，并添加新的 DataNode 进入集群

> ❗️注意，为了使集群能正常工作，在 DataNode 节点维护过程中以及维护完成后，正常运行的 DataNode 总数不得少于数据副本数（通常为 2），也不得少于元数据副本数（通常为 3）。
> 
> 

#### 3.2.1 添加 DataNode 节点

脚本命令：

```Bash
# Linux / macOS 
# 首先切换到 IoTDB 根目录
sbin/start-datanode.sh

# Windows
# 首先切换到 IoTDB 根目录
# V2.0.4.x 版本之前
sbin\start-datanode.bat

# V2.0.4.x 版本及之后     
tools\windows\start-datanode.bat
```

参数介绍：

|缩写|描述|是否为必填项|
|---|---|---|
|\-v|显示版本信息|否|
|\-f|在前台运行脚本，不将其放到后台|否|
|\-d|以守护进程模式启动，即在后台运行|否|
|\-p|指定一个文件来存放进程ID，用于进程管理|否|
|\-c|指定配置文件夹的路径，脚本会从这里加载配置文件|否|
|\-g|打印垃圾回收（GC）的详细信息|否|
|\-H|指定Java堆转储文件的路径，当JVM内存溢出时使用|否|
|\-E|指定JVM错误日志文件的路径|否|
|\-D|定义系统属性，格式为 key=value|否|
|\-X|直接传递 \-XX 参数给 JVM|否|
|\-h|帮助指令|否|

说明：在添加 DataNode 后，随着新的写入到来（以及旧数据过期，如果设置了 TTL），集群负载会逐渐向新的 DataNode 均衡，最终在所有节点上达到存算资源的均衡。

#### 3.2.2 移除DataNode节点

首先通过 CLI 连接集群，通过`show datanodes`确认想要移除的 DataNode 的 NodeID：

```SQL
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

然后使用 SQL 将 DataNode 移除，SQL 命令：

```Bash
remove datanode [datanode_id]
```

## 4. 手动 Region 迁移

Region 迁移属于高级运维功能，具有一定操作成本，建议完整阅读后再使用该功能。如有疑问请联系 IoTDB 团队寻求技术支持。

### 4.1 功能介绍

IoTDB 是一个分布式数据库，Region 是数据在 IoTDB 集群中进行分布式存储的基本单元。集群正常运行情况下，IoTDB 会自动对新增数据进行负载均衡；在集群新加入 DataNode 节点、DataNode 所在机器硬盘损坏需要恢复数据等场景下，支持通过手动 Region 迁移精细化调整集群负载和运维。

### 4.2 注意事项

1. 推荐仅在 IoTDB 1\.3\.3 以及更高版本使用 Region 迁移功能。

2. 仅在共识协议为 IoTConsensus、Ratis 时支持 Region 迁移（`iotdb-system.properties`中的`schema_region_consensus_protocol_class` 和 `data_region_consensus_protocol_class`）。

3. Region 迁移会占用硬盘和网络带宽等系统资源，推荐在低业务负载时进行。

4. 在理想情况下，Region 迁移不影响用户侧读写。特殊情况下，Region 迁移可能阻塞写入，这种情况的具体鉴别与处理方式见使用说明。

### 4.3 使用说明

- **语法定义**：

    提交一个异步任务，将 region 从一个 DataNode 迁移到另一个 DataNode。

    ```SQL
    migrateRegion
          : MIGRATE REGION regionId=INTEGER_LITERAL FROM fromId=INTEGER_LITERAL TO toId=INTEGER_LITERAL
          ;
    ```

- **语法示例**：

    将 region 1 从 DataNode 2 迁移至 DataNode 3：

    ```SQL
    IoTDB> migrate region 1 from 2 to 3
      Msg: The statement is executed successfully.
    ```

    “The statement is executed successfully” 仅代表 Region 迁移任务提交成功，不代表执行完毕。任务执行情况通过 CLI 指令`show regions`查看。

- **相关配置项**：

    - 迁移速度控制：修改`iotdb-system.properties`参数 `region_migration_speed_limit_bytes_per_second`控制 Region 迁移速度。

- **耗时估算**：

    - 如果迁移过程无并发写入，那么耗时可以简单通过 Region 数据量除以数据传输速度来估算。实际数据传输速度由硬盘、网络带宽和迁移限速参数共同决定。

    - 如果迁移过程有并发写入，那么耗时会有所上升，具体耗时取决于写入压力、系统资源等多方面因素，可简单按无并发写入耗时×1\.5来估算。

- **迁移进度观察**：迁移过程中可通过 CLI 指令`show regions`观察状态变化，以 2 副本为例，Region 所在共识组的状态会经历如下过程：

    - 迁移开始前：`Running`，`Running`。

    - 扩容阶段：`Running`，`Running`，`Adding`。由于涉及到大量文件传输，可能耗时较长，具体进度在 DataNode 日志中搜索`[SNAPSHOT TRANSMISSION]`。

    - 缩容阶段：`Removing`，`Running`，`Running`。

    - 迁移完成：`Running`，`Running`。

        以扩容阶段为例，`show regions`的结果可能为：

    ```Plain Text
    IoTDB> show regions
    +--------+------------+-------+--------+-------------+-----------+----------+----------+-------+---------------+--------+-----------------------+
    |RegionId|        Type| Status|Database|SeriesSlotNum|TimeSlotNum|DataNodeId|RpcAddress|RpcPort|InternalAddress|    Role|             CreateTime|
    +--------+------------+-------+--------+-------------+-----------+----------+----------+-------+---------------+--------+-----------------------+
    |       0|SchemaRegion|Running| root.ln|            1|          0|         1|   0.0.0.0|   6668|      127.0.0.1|  Leader|2024-04-15T18:55:17.691|
    |       0|SchemaRegion|Running| root.ln|            1|          0|         2|   0.0.0.0|   6668|      127.0.0.1|  Leader|2024-04-15T18:55:17.691|
    |       0|SchemaRegion|Running| root.ln|            1|          0|         3|   0.0.0.0|   6668|      127.0.0.1|  Leader|2024-04-15T18:55:17.691|
    |       1|  DataRegion|Running| root.ln|            1|          1|         1|   0.0.0.0|   6667|      127.0.0.1|  Leader|2024-04-15T18:55:19.457|
    |       1|  DataRegion|Running| root.ln|            1|          1|         2|   0.0.0.0|   6668|      127.0.0.1|Follower|2024-04-15T18:55:19.457|
    |       1|  DataRegion| Adding| root.ln|            1|          1|         3|   0.0.0.0|   6668|      127.0.0.1|Follower|2024-04-15T18:55:19.457|
    +--------+------------+-------+--------+-------------+-----------+----------+----------+-------+---------------+--------+-----------------------+
    Total line number = 6
    It costs 0.003s
    ```

- **阻塞写入**：

    IoTConsensus 的 Region 迁移不直接阻塞写入，但由于过程中需要阻塞 WAL 文件的清理，如果 WAL 文件堆积达到阈值`wal_throttle_threshold_in_byte`，那么当前 DataNode 会暂停写入，直到 WAL 文件恢复到阈值以下。

    如果迁移过程中由于 WAL 达到阈值造成写入报错（例如报错信息为 The write is rejected because the wal directory size has reached the threshold），可以将`wal_throttle_threshold_in_byte`调大到 500GB 或更大以允许继续写入。使用 SQL 语句：

    ```Plain Text
    IoTDB> set configuration "wal_throttle_threshold_in_byte"="536870912000" 
      Msg: The statement is executed successfully.
    ```

- 

### 4.4 场景示例

默认情况下，扩容后历史数据不会自动迁移。若需均衡各节点的数据分布，可手动迁移 Region。如下图所示，假设将旧节点 80 TB 的数据负载均衡至新节点，当单个 Region 的数据量为 1 TB，传输速度为 100 MB/s，迁移约需 3 小时完成。

![](/img/cluster-extention-8.png)

具体操作如下：

```SQL
-- 1. 将 Region-1 的副本数据从 DataNode-2 中迁移至 DataNode-4 中
migrate region 1 from 2 to 4

-- 2. 将 Region-2 的副本数据从 DataNode-3 中迁移至 DataNode-5 中
migrate region 2 from 3 to 5

-- 3. 将 Region-3 的副本数据从 DataNode-1 中迁移至 DataNode-6 中
migrate region 3 from 1 to 6
```

迁移完成后，系统中的 Region 数据将在旧节点与新节点之间重新分布，实现磁盘空间的均衡化与资源利用最优化。

![](/img/cluster-extention-9.png)

### 4.5 补充语法（不推荐）

> **注意：** `EXTEND REGION` 和 `REMOVE REGION` 属于 **高危** 运维指令，不推荐常规使用，生产环境请慎用。一般情况下，Region 迁移应使用 `MIGRATE REGION`；Region 重建应使用 `RECONSTRUCT Region`。
> 
> 

#### 4.5.1 Extend Region

将一个或多个 Region 扩容到指定 DataNode。

- 语法定义：

    ```SQL
    extendRegion
        : EXTEND REGION regionIds+=INTEGER_LITERAL (COMMA regionIds+=INTEGER_LITERAL)* TO targetDataNodeId=INTEGER_LITERAL
        ;
    ```

- 语法示例：

    将 Region 1 扩容到 DataNode 3：

    ```SQL
    IoTDB> extend region 1 to 3
    Msg: The statement is executed successfully.
    ```

#### 4.5.2 Remove Region

从指定 DataNode 上移除一个或多个 Region 副本。

- 语法定义：

    ```SQL
    removeRegion
        : REMOVE REGION regionIds+=INTEGER_LITERAL (COMMA regionIds+=INTEGER_LITERAL)* FROM targetDataNodeId=INTEGER_LITERAL
        ;
    ```

- 语法示例：

    从 DataNode 2 上移除 Region 1：

    ```SQL
    IoTDB> remove region 1 from 2
    Msg: The statement is executed successfully.
    ```

## 5. 自动 Region 重均衡

Region 重均衡属于高级运维功能，具有一定操作成本，建议完整阅读后再使用该功能。如有疑问请联系 IoTDB 团队寻求技术支持。

> V2\.0\.10 起支持
> 
> 

### 5.1 功能介绍

Region 重均衡功能支持通过一条 SQL 提交重均衡任务，系统后台使用扩容均衡算法计算 Region 迁移方案，并由 ConfigNode 调度执行。该功能不局限于扩容场景，在未出现扩缩容的情况下，如果存在 Region 大小不均衡、节点间磁盘使用不均衡或写入负载集中在少部分 Region 等情况，也可以使用此功能。

`LOAD BALANCE` 本质上是由系统自动生成并执行一组 Region 迁移任务，适合进行整体重均衡；`migrate region` 则适合用户已经明确 RegionId、源 DataNode 和目标 DataNode 的精细化迁移场景。自动重均衡任务提交后，可通过 `SHOW MIGRATIONS` 观察实际生成的迁移任务和执行进度。

- 适用场景：扩容后希望历史 Region 自动迁移到新节点；节点间磁盘使用明显不均；部分 DataNode 写入压力较高，需要整体调整 Region 分布。

- 谨慎使用场景：业务高峰期、网络或磁盘 I/O 资源紧张时，建议先评估迁移带来的资源占用；如果需要精确控制某个 Region 的迁移路径，建议使用手动 Region 迁移。

### 5.2 LOAD BALANCE

```SQL
-- 触发系统负载均衡（由系统自动选择目标节点）
LOAD BALANCE;

-- 指定目标 DataNode 节点 ID，并执行负载均衡
LOAD BALANCE TO DATANODES(*DataNodeId,DataNodeId*);
```

- **功能机制**

向 ConfigNode 提交一个异步执行的全局或局部分布式均衡任务。任务触发后，集群 DataNode 会被划分为两类角色池，且数据物理迁移具备严格单向约束：

- From 节点（源节点池）：提供待迁移 Region 数据的节点

- To 节点（目标节点池）：接收迁移数据的节点

- 单向迁移规则：数据仅允许从 From 节点单向迁移至 To 节点

- **参数说明**

|参数|必填|说明|
|---|---|---|
|TO DATANODES|否|显式传入一个或多个 DataNodeId 列表（逗号分隔），传入的节点被划定为接收数据的 To 节点池，其余节点自动归属为提供数据的 From 节点池|

- **默认行为**

|执行方式|行为说明|
|---|---|
|不带参数 \(`LOAD BALANCE`\)|系统默认选择当前磁盘占用量最小的一个节点作为唯一的 To 节点|
|带参数 \(`LOAD BALANCE TO DATANODES(...)`\)|指定的节点被强行划定为接收数据的 To 节点池，其余节点为 From 节点池|

- **预期结果**

命令执行后，控制台将立即返回 `Msg: The statement is executed successfully.`。这仅表示 ConfigNode 成功受理了负载均衡任务并将测算生成的子任务编排入列，底层的海量物理迁移随即在后台异步展开。

- **配置项说明**

在配置文件 `iotdb-system.properties` 中，可通过 `region_migration_speed_limit_bytes_per_second` 控制每个 DataNode 的 Region 迁移传输上限，单位为 byte/s，默认值为 `50331648`，约 48 MiB/s。业务繁忙时可适当降低该值，业务低峰期可适当调高；但不建议设置过低，否则迁移耗时会明显增加，甚至可能发生迁移阻塞。配置值小于等于 0 表示不限速；该参数仅对 IoTConsensus 协议生效，支持热加载。

### 5.3 SHOW MIGRATIONS

由于平衡任务涉及数百 GB 级别的大文件跨节点流转，系统提供如下核心观测 SQL 获取具有细粒度状态指示的全局视图。该语句会返回当前集群内部正在执行的后台迁移任务清单，并以结构化列表展示任务状态、耗时和迁移进度。

```SQL
SHOW MIGRATIONS
```

- **结果集说明**

|字段名|说明|
|---|---|
|ProcedureId|Procedure 唯一标识|
|RegionId|Region ID|
|Type|Region 类型|
|FromNodeId|源节点 DataNode ID|
|ToNodeId|目标节点 DataNode ID|
|CurrentState|当前状态（如 `REGION_MIGRATE_PREPARE`, `ADD_REGION_PEER`, `REMOVE_REGION_PEER` 等）|
|ProcedureStatus|Procedure 状态（如 RUNNING、FINISHED、FAILED 等）|
|SubmittedTime|任务提交时间|
|LastUpdateTime|最近更新时间|
|Duration|已耗时|
|Progress|迁移进度（已迁移文件数/总文件数）|

例如：

```SQL
IoTDB> show migrations
+-----------+--------+----------+----------+--------+---------------------+---------------+-----------------------+-----------------------+----------------+---------------------------------+
|ProcedureId|RegionId|      Type|FromNodeId|ToNodeId|         CurrentState|ProcedureStatus|          SubmittedTime|         LastUpdateTime|        Duration|                         Progress|
+-----------+--------+----------+----------+--------+---------------------+---------------+-----------------------+-----------------------+----------------+---------------------------------+
|         11|       5|DataRegion|         2|       3|CHECK_ADD_REGION_PEER|        WAITING|2026-06-03T15:47:35.840|2026-06-03T15:47:35.966|31 second 169 ms|files 1/3, size 15.52 KB/15.61 KB|
+-----------+--------+----------+----------+--------+---------------------+---------------+-----------------------+-----------------------+----------------+---------------------------------+
Total line number = 1
It costs 0.004s
```

- Show Regions 联动状态观测

迁移过程中，相关 Region 的状态也会发生变化。以 2 副本集群为例，在  `SHOW MIGRATIONS`  显示某个任务正在执行时，执行 `show regions` 可观察到该 Region 经历如下状态变化：

1. 稳态（迁移前）：  `Running`,  `Running`。

2. 复制扩容过渡态：  `Running`,  `Running`,  `Adding`（目标 To 节点新建 Region 副本并接收快照，处于  `Adding `状态，该状态不对外提供服务）。

3. 安全移除过渡态：  `Removing`,  `Running`,  `Running`（目标节点追平数据变为  `Running`，原 From 节点变为  `Removing`进行删除回收）。

4. 新稳态（迁移后）： 旧 Region 删除成功，重回  `Running` ,  `Running` 状态。

### 5.4 场景示例

以下示例模拟某个真实工业场景：随着业务数据持续增长，系统原有的“两台核心数据节点”配置需要扩展为具有更高吞吐量与存储余量的“三数据节点”架构，并使用双副本冗余（即 1C2D \-\> 1C3D 的平滑扩容）。集群初始为 1 个 ConfigNode 和 2 个 DataNode，新增 DataNode 3 后，通过自动 Region 重均衡让新节点承载部分历史 Region，从而缓解原有节点的存储压力。

![](/img/load-balance.png)

以下 SQL 返回结果仅用于说明关键流程，部分输出为节选展示；实际返回结果会受集群规模、Region 数量、数据库名称、时间分区和节点地址等因素影响，请以实际运行结果为准。

1. 扩容前，通过 `show cluster` 查看集群节点，集群中只有 DataNode 1 和 DataNode 2。

```SQL
IoTDB> show cluster
+------+----------+-------+---------------+------------+--------+---------+
|NodeID|  NodeType| Status|InternalAddress|InternalPort| Version|BuildInfo|
+------+----------+-------+---------------+------------+--------+---------+
|     0|ConfigNode|Running|   confignode-1|       10710|  2.0.10|   53e***|
|     1|  DataNode|Running|     datanode-1|       10730|  2.0.10|   53e***|
|     2|  DataNode|Running|     datanode-2|       10730|  2.0.10|   53e***|
+------+----------+-------+---------------+------------+--------+---------+
```

2. 扩容后，通过 `show cluster` 确认 DataNode 3 已加入集群，且状态为 Running。

```SQL
IoTDB> show cluster
+------+----------+-------+---------------+------------+--------+---------+
|NodeID|  NodeType| Status|InternalAddress|InternalPort| Version|BuildInfo|
+------+----------+-------+---------------+------------+--------+---------+
|     0|ConfigNode|Running|   confignode-1|       10710|  2.0.10|   53e***|
|     1|  DataNode|Running|     datanode-1|       10730|  2.0.10|   53e***|
|     2|  DataNode|Running|     datanode-2|       10730|  2.0.10|   53e***|
|     3|  DataNode|Running|     datanode-3|       10730|  2.0.10|   53e***|
+------+----------+-------+---------------+------------+--------+---------+
```

3. 执行 `LOAD BALANCE` 提交重均衡任务。该命令提交成功仅表示 ConfigNode 已受理任务。如果希望明确指定新节点作为迁移目标，可使用 `TO DATANODES` 指定目标 DataNodeId。

```SQL
IoTDB> LOAD BALANCE;

-- 或者指定 DataNode 3 作为目标节点
IoTDB> LOAD BALANCE TO DATANODE 3;
```

4. 通过 `show migrations` 观察后台迁移任务。此时控制台可看到正在排队与流转的子任务，例如多个 Region 副本正从 DataNode 1、DataNode 2 迁移至 DataNode 3。

```SQL
IoTDB> show migrations
+-----------+--------+------------+----------+--------+------------------------+---------------+-----------------------+-----------------------+----------------+---------------------------------+
|ProcedureId|RegionId|        Type|FromNodeId|ToNodeId|            CurrentState|ProcedureStatus|          SubmittedTime|         LastUpdateTime|        Duration|                         Progress|
+-----------+--------+------------+----------+--------+------------------------+---------------+-----------------------+-----------------------+----------------+---------------------------------+
|        101|       3|  DataRegion|         1|       3|   CHECK_ADD_REGION_PEER|        WAITING|2026-06-03T16:29:25.051|2026-06-03T16:29:25.159| 2 second 897 ms|files 8/96, size 24 GB/280 GB    |
|        102|       5|  DataRegion|         2|       3|   CHECK_ADD_REGION_PEER|        WAITING|2026-06-03T16:29:25.059|2026-06-03T16:29:25.163| 2 second 889 ms|files 5/72, size 18 GB/210 GB    |
|        103|       4|SchemaRegion|         1|       3|CHECK_REMOVE_REGION_PEER|        WAITING|2026-06-03T16:29:25.067|2026-06-03T16:29:26.807| 2 second 876 ms|                                 |
+-----------+--------+------------+----------+--------+------------------------+---------------+-----------------------+-----------------------+----------------+---------------------------------+
```

4. 迁移过程中，通过 `show regions` 可观察到目标节点上的 Region 进入 `Adding` 状态。此时，DataNode 3 会在本机文件系统中创建对应 Region 的目录；源 DataNode 会将本地持久化 TsFile 打包为快照，并通过跨网络 RPC 投递到 DataNode 3。以下仅节选与本次重均衡相关的 DataRegion 行。

```SQL
IoTDB> show regions
+--------+----------+-------+--------------+-------------+-----------+----------+----------+-------+---------------+--------+-----------------------+----------+----------------+
|RegionId|      Type| Status|      Database|SeriesSlotNum|TimeSlotNum|DataNodeId|RpcAddress|RpcPort|InternalAddress|    Role|             CreateTime|TsFileSize|CompressionRatio|
+--------+----------+-------+--------------+-------------+-----------+----------+----------+-------+---------------+--------+-----------------------+----------+----------------+
|       3|DataRegion|Running|root.industry|            8|          1|         1|     host1|   6667|     datanode-1|Follower|2026-06-03T16:26:45.691|    280 GB|            3.24|
|       3|DataRegion|Running|root.industry|            8|          1|         2|     host2|   6667|     datanode-2|  Leader|2026-06-03T16:26:45.691|    280 GB|            3.24|
|       3|DataRegion| Adding|root.industry|            8|          1|         3|     host3|   6667|     datanode-3|Follower|2026-06-03T16:26:45.691|   Unknown|             NaN|
+--------+----------+-------+--------------+-------------+-----------+----------+----------+-------+---------------+--------+-----------------------+----------+----------------+
```

5. 当 DataNode 3 接收完快照，并回放迁移期间产生的 WAL 数据后，新副本进入 `Running` 状态；同时，原节点上的对应 Region 副本会被标记为 `Removing` 并进行删除回收。当 `show migrations` 返回空结果时，表示迁移任务已结束，当前没有正在执行的迁移任务。

```SQL
IoTDB> show migrations
+-----------+--------+----+----------+--------+------------+---------------+-------------+--------------+--------+--------+
|ProcedureId|RegionId|Type|FromNodeId|ToNodeId|CurrentState|ProcedureStatus|SubmittedTime|LastUpdateTime|Duration|Progress|
+-----------+--------+----+----------+--------+------------+---------------+-------------+--------------+--------+--------+
+-----------+--------+----+----------+--------+------------+---------------+-------------+--------------+--------+--------+
```

6. 再次查询 `show regions`，确认相关 Region 已迁移至目标节点，并回到 `Running` 状态。如下所示，部分 Region 副本迁移到 DataNode 3 后，DataNode 1、DataNode 2 和 DataNode 3 都继续承载历史 DataRegion。以下仍仅节选与本次重均衡相关的 DataRegion 行。

```SQL
IoTDB> show regions
+--------+----------+-------+--------------+-------------+-----------+----------+----------+-------+---------------+--------+-----------------------+----------+----------------+
|RegionId|      Type| Status|      Database|SeriesSlotNum|TimeSlotNum|DataNodeId|RpcAddress|RpcPort|InternalAddress|    Role|             CreateTime|TsFileSize|CompressionRatio|
+--------+----------+-------+--------------+-------------+-----------+----------+----------+-------+---------------+--------+-----------------------+----------+----------------+
|       3|DataRegion|Running|root.industry|            8|          1|         2|     host2|   6667|     datanode-2|Follower|2026-06-03T16:26:45.691|    280 GB|            3.24|
|       3|DataRegion|Running|root.industry|            8|          1|         3|     host3|   6667|     datanode-3|  Leader|2026-06-03T16:26:45.691|    280 GB|            3.24|
|       5|DataRegion|Running|root.industry|            6|          1|         1|     host1|   6667|     datanode-1|  Leader|2026-06-03T16:26:45.698|    210 GB|            2.86|
|       5|DataRegion|Running|root.industry|            6|          1|         3|     host3|   6667|     datanode-3|Follower|2026-06-03T16:26:45.698|    210 GB|            2.86|
|       7|DataRegion|Running|root.industry|            7|          1|         1|     host1|   6667|     datanode-1|Follower|2026-06-03T16:26:45.717|    240 GB|            3.10|
|       7|DataRegion|Running|root.industry|            7|          1|         2|     host2|   6667|     datanode-2|  Leader|2026-06-03T16:26:45.717|    240 GB|            3.10|
+--------+----------+-------+--------------+-------------+-----------+----------+----------+-------+---------------+--------+-----------------------+----------+----------------+
```
