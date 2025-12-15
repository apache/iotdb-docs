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

## 1. 集群扩容

当 IoTDB 集群因数据量或访问压力激增，出现 CPU、内存、磁盘或网络等资源瓶颈时，可通过本指南进行横向扩容，以提升集群整体性能与承载力。

### 1.1 核心概念

在执行扩容操作前，需要理解 IoTDB 集群架构、序列分区、时间分区等相关概念。

#### 1.1.1 名词汇总

| **名词**    | **类型**             | **解释**                                                                                       |
| ------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------ |
| ConfigNode        | 节点角色                   | 管理节点，负责管理集群信息，包括分区信息的记录、负载均衡和操作调度与节点管理等功能。                 |
| DataNode          | 节点角色                   | 数据节点，负责提供客户端的数据读写，全面管理数据和元数据，各个数据节点形成不同的副本组。             |
| Database          | 元数据                     | 数据库，不同数据库的数据物理隔离                                                                     |
| DeviceId          | 设备名                     | 元数据树中从 root 到倒数第二级的全路径表示一个设备名                                                 |
| SeriesSlot        | 序列分区槽                 | 每个 Database会对应固定个数的序列槽，包含其中序列的元数据。                                          |
| SeriesTimeSlot    | 一个序列槽的一个时间分区槽 | 对应一个 SeriesSlot 内所有序列一个时间分区的数据                                                     |
| SchemaRegion      | 一组元数据分区             | 多个 SeriesSlot 的集合，DataNode 上的元数据管理引擎，提供对元数据的读写操作。                        |
| DataRegion        | 一组数据分区              | 多个 SeriesTimeSlot 的集合，DataNode 上的数据管理引擎，提供数据的读写操作。                          |
| ConfigNodeGroup   | 逻辑概念（共识组）         | 由集群中所有 ConfigNode 节点组成，通过共识协议维护一致的分区表信息。                                 |
| SchemaRegionGroup | 逻辑概念（共识组）         | 元数据副本组，包含元数据副本数个 SchemaRegion，管理相同的元数据，互为备份                            |
| DataRegionGroup   | 逻辑概念（共识组）         | 数据副本组，包含数据副本数个 DataRegion，管理相同的数据，互为备份。是 IoTDB 集群吞吐能力的基础单元。 |

#### 1.1.2 集群架构

IoTDB 集群由管理节点（ConfigNode）与数据节点（DataNode）构成，采用 MPP 架构实现大规模并行处理。其核心特性在于对元数据进行设备级分区，对数据则进行设备与时间的二维分区，从而保障了全面的可扩展性。

![](/img/cluster-extention-1.png)

#### 1.1.3 分区管理
##### 集群共识组

在IoTDB中，数据分区组（DataRegionGroup）和元数据分区组（SchemaRegionGroup）是读写负载的最小单元，通过**共识组**机制保证数据一致性。因此，集群扩容的本质即是增加数据分区，以提升并发能力与吞吐量。

![](/img/cluster-extention-2.png)

##### 分区槽机制

在分区和负载调度上，IoTDB 引入了两类核心槽机制来支持扩容和高效分布式管理。

第一类是​**序列分区槽（SeriesPartitionSlot）**​，它是对时间序列进行纵向管理的机制。每个数据库持有固定数量的序列分区槽（默认 1000 个），每个时间序列通过序列分区算法被分配到唯一的序列分区槽进行管理。使用序列分区槽可以避免直接记录设备或时间序列级别的分区信息，从而显著降低 ConfigNode 内存开销。

![](/img/cluster-extention-3.png)

第二类是​**时间分区槽（TimePartitionSlot）**​，它用于对时间序列数据进行横向切分。每个数据分区由一个序列分区槽和一个时间分区槽组合而成。当某个序列分区槽在特定时间分区槽下有数据时，就会生成对应的数据分区。

![](/img/cluster-extention-4.png)

通过序列分区槽与时间分区槽的组合，IoTDB 能够在扩容时灵活增加数据分区组，实现数据的均衡分布和高效读写，从而提升整个集群的吞吐能力与可扩展性。

### 1.2 实现原理

IoTDB 集群扩容的核心是增加 DataNode 节点，因为 DataNode 是处理读写请求的主要节点。其内部的数据分区（DataRegion）是承载负载的关键单元，扩容的本质即通过增加数据分区组来提升集群并发能力与吞吐量。

默认情况下，假设集群的元数据副本数为三，数据副本数为二，初次初始化时会创建集群总核数除以二的数据分区。如下图一个由3台2核服务器组成的集群，假设每个数据副本组的处理能力为1，那么该集群（包含3个数据副本组）的总吞吐能力为3。因此，将服务器数量由三台扩展为六台，集群由原来的三数据分区组扩容为六数据分区组，总吞吐能力也相应实现翻倍。

![](/img/cluster-extention-5.png)

扩容后，客户端读写负载的均衡规则是旧节点可能同时处理老设备（集群中已存在的 DeviceId 的数据）和新设备（集群中不存在的 DeviceId 的数据）的数据读写，而新节点仅接收新增数据的读写，旧节点不会对原有副本组进行自动重均衡。数据负载均衡通常在每个新时间分区创建时进行，默认时间为每周四上午八点。其核心原理是通过序列分区槽和时间分区槽进行负载均衡算法运算，从而决定数据由哪个节点的哪个分区处理。

![](/img/cluster-extention-6.png)

如果希望在扩容后对所有新老数据进行重新均衡，则需要使用数据分区手动迁移功能（简称Region 迁移）。

Region迁移语法参考：

```SQL
-- 解释：将哪个RegionId节点的数据从哪个DataNodeId节点迁移到哪个目标DataNodeId节点
  migrateRegion
      : MIGRATE REGION regionId=INTEGER_LITERAL FROM fromId=INTEGER_LITERAL TO toId=INTEGER_LITERAL
      ;
```

在迁移过程中，ConfigNode负责整体调度，原 region 和原 DataNode 提供被移除的数据，新 region 和新 DataNode 承担新增数据。

![](/img/cluster-extention-7.png)

如上图由3个DataNode组成的集群中，region 1副本组分布在DataNode 1和DataNode 2中，假设此时想将DataNode 1中的region 1副本迁移至DataNode 3中，其运转流程如下：

1. 在CLI命令行中执行以下命令：

```SQL
migrate region 1 from 1 to 3
```

2. 此时Region迁移进入到复制阶段，复制阶段的核心工作是在目标节点中创建新的region副本，将同步全量region 1的数据，此时region状态为Adding。
3. 此时Region迁移进入到移除阶段，当目标节点中的数据已经全量同步完毕，旧region节点的数据则可以安全删除了，所以此步骤的核心工作是移除旧节点的所有数据，以释放磁盘空间，此时region状态为Removing。
4. 当2和3步骤执行完毕后，Region迁移工作整体完成。

### 1.3 操作步骤
#### 1.3.1 前置准备

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
5. 软件依赖：安装 Java 运行环境 ，Java 版本 >= 1.8，请确保已设置 jdk 环境变量。
6. 域名配置：部署时推荐优先使用hostname进行IP配置，可避免后期修改主机ip导致数据库无法启动的问题。设置hostname需要在目标服务器上配置/etc/hosts，如本机ip是192.168.1.3，hostname是iotdb-1，则可以使用以下命令设置服务器的 hostname，并使用hostname配置IoTDB的cn\_internal\_address、dn\_internal\_address、dn\_rpc\_address。

```Shell
# 注意：本机和原集群节点的域名都需要配置
echo "192.168.1.3  iotdb-1" >> /etc/hosts
```

#### 1.3.2 扩容操作
1. 为确保您获取的 TimechoDB 安装包完整且正确，在执行安装部署前建议您进行 SHA512 校验。
2. 解压安装包并进入安装目录

```Shell
unzip  timechodb-{version}-bin.zip
cd  timechodb-{version}-bin
```

3. 修改相应配置

```Shell
cd  timechodb-{version}-bin/conf
vim iotdb-system.properies
```

| 配置项                              | 说明                                                                                        | 默认                      | 备注                                                                      |
| ------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------- | --------------------------------------------------------------------------- |
| **dn\_seed\_config\_node**   | **节点注册加入集群时连接的ConfigNode地址,即cn\_internal\_address:cn\_internal\_port** | **127.0.0.1:10710** | **\* 非常重要，强制修改此项，将其改为原集群ConfigNode主节点的地址** |
| dn\_rpc\_address                    | 客户端 RPC 服务的地址                                                                       | 0.0.0.0                   | 按需修改，重启服务生效                                                    |
| dn\_rpc\_port                       | 客户端 RPC 服务的端口                                                                       | 6667                      | 按需修改，重启服务生效                                                    |
| dn\_internal\_address               | DataNode在集群内部通讯使用的地址                                                            | 127.0.0.1                 | 按需修改，首次启动后不能修改                                              |
| dn\_internal\_port                  | DataNode在集群内部通信使用的端口                                                            | 10730                     | 按需修改，首次启动后不能修改                                              |
| dn\_mpp\_data\_exchange\_port       | DataNode用于接收数据流使用的端口                                                            | 10740                     | 按需修改，首次启动后不能修改                                              |
| dn\_data\_region\_consensus\_port   | DataNode用于数据副本共识协议通信使用的端口                                                  | 10750                     | 按需修改，首次启动后不能修改                                              |
| dn\_schema\_region\_consensus\_port | DataNode用于元数据副本共识协议通信使用的端口                                                | 10760                     | 按需修改，首次启动后不能修改                                              |

4. 启动DataNode节点

进入iotdb的sbin目录下，启动datanode：

```Shell
./sbin/start-datanode.sh -d    #“-d”参数将在后台进行启动
```

5. 通过CLI命令连接原集群，进行扩容后验证

```Shell
# Linux或MACOS系统
  ./timechodb-{version}-bin/sbin/start-cli.sh
  
  # windows系统
  ./timechodb-{version}-bin/sbin/start-cli.bat
```

6. 执行命令进行验证

执行show datanodes命令进行验证，预期结果列表中出现新加入的节点，且节点状态为Running

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
Total line number = 3
It costs 0.110s
```

7. 其它节点重复以上操作，值得注意的是，新节点能够成功加入原集群需保证原集群允许加入的DataNode节点数量是足够的，否则需要联系工作人员重新申请激活码信息。

#### 1.3.3 手动负载均衡（按需选择）

默认情况下，扩容后历史数据不会自动迁移。若需均衡各节点的数据分布，需手动迁移 Region。迁移耗时可估算为：Region 数据量 ÷ 实际数据传输速度。如下图所示，假设将旧节点80TB的数据负载均衡至新节点，当单个 Region 的数据量为 1 TB，传输速度为100 MB/s，迁移约需 3 小时完成。

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


## 2. 负载均衡

Region 迁移属于高级运维功能，具有一定操作成本，建议完整阅读后再使用该功能。如有疑问请联系 IoTDB 团队寻求技术支持。

### 2.1 功能介绍

IoTDB 是一个分布式数据库，数据的均衡分布对集群的磁盘空间、写入压力的负载均衡有着重要作用，region 是数据在 IoTDB 集群中进行分布式存储的基本单元，具体概念可见[region](../Background-knowledge/Cluster-Concept.md)。

集群正常运行情况下，IoTDB 将会自动对数据进行负载均衡，但在集群新加入 DataNode 节点、DataNode 所在机器硬盘损坏需要恢复数据等场景下，可通过手动 Region 迁移精细化调整集群负载和运维。

下面是一次region迁移过程的示意图：


![](/img/region%E8%BF%81%E7%A7%BB%E7%A4%BA%E6%84%8F%E5%9B%BE20241210.png)

### 2.2 注意事项

1. 推荐仅在 IoTDB 1.3.3 以及更高版本使用 Region 迁移功能。
2. 仅在共识协议为 IoTConsensus、Ratis 时支持 Region 迁移（iotdb-system.properties中的`schema_region_consensus_protocol_class` 和 `data_region_consensus_protocol_class`）。
3. Region 迁移会占用硬盘和网络带宽等系统资源，推荐在低业务负载时进行。
4. 在理想情况下，Region 迁移不影响用户侧读写。特殊情况下，Region 迁移可能阻塞写入，这种情况的具体鉴别与处理方式见使用说明。

### 2.3 使用说明

- **语法定义**：

  提交一个异步任务，将 region 从一个 DataNode 迁移到另一个 DataNode。

  ```SQL
    migrateRegion
        : MIGRATE REGION regionId=INTEGER_LITERAL FROM fromId=INTEGER_LITERAL TO toId=INTEGER_LITERAL
        ;
    ```

- **示例**：
  
  将 region 1 从 DataNode 2 迁移至 DataNode 3：

  ```SQL
    IoTDB> migrate region 1 from 2 to 3
    Msg: The statement is executed successfully.
  ```

  “The statement is executed successfully” 仅代表region迁移任务提交成功，不代表执行完毕。任务执行情况通过 CLI 指令`show regions`查看。

- **相关配置项**：

    - 迁移速度控制：修改`iotdb-system.properties`参数 `region_migration_speed_limit_bytes_per_second`控制 region 迁移速度。

- **耗时估算**：
    - 如果迁移过程无并发写入，那么耗时可以简单通过 region 数据量除以数据传输速度来估算。例如对于 1TB 的 region，硬盘网络带宽和限速参数共同决定数据传输速度是 100MB/s，那么需要约 3 小时完成迁移。
    - 如果迁移过程有并发写入，那么耗时会有所上升，具体耗时取决于写入压力、系统资源等多方面因素，可简单按无并发写入耗时×1.5来估算。

- **迁移进度观察**：迁移过程中可通过 CLI 指令`show regions`观察状态变化，以 2 副本为例，region 所在共识组的状态会经历如下过程：
    - 迁移开始前：`Running`，`Running`。

    - 扩容阶段：`Running`，`Running`，`Adding`。由于涉及到大量文件传输，可能耗时较长，具体进度在 DataNode 日志中搜索`[SNAPSHOT TRANSMISSION]`。

    - 缩容阶段：`Removing`，`Running`，`Running`。

    - 迁移完成：`Running`，`Running`。

  以扩容阶段为例，`show regions`的结果可能为：

  ```Plain
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
  Total line number = 3
  It costs 0.003s
  ```

- **阻塞写入**：

  IoTConsensus 的 region 迁移不直接阻塞写入，但由于过程中需要阻塞 WAL 文件的清理，如果 WAL 文件堆积达到阈值`wal_throttle_threshold_in_byte`，那么当前 DataNode 会暂停写入，直到 WAL 文件恢复到阈值以下。

  如果迁移过程中由于 WAL 达到阈值造成写入报错（例如报错信息为 The write is rejected because the wal directory size has reached the threshold），可以将`wal_throttle_threshold_in_byte`调大到 500GB 或更大以允许继续写入。使用 SQL 语句：
  ```plain
    IoTDB> set configuration "wal_throttle_threshold_in_byte"="536870912000" 
    Msg: The statement is executed successfully.
  ```