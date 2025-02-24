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

# 负载均衡

Region 迁移属于高级运维功能，具有一定操作成本，建议完整阅读后再使用该功能。如有疑问请联系 IoTDB 团队寻求技术支持。

## 1 功能介绍

IoTDB 是一个分布式数据库，数据的均衡分布对集群的磁盘空间、写入压力的负载均衡有着重要作用，region 是数据在 IoTDB 集群中进行分布式存储的基本单元，具体概念可见[region](../Background-knowledge/Cluster-Concept.md)。

集群正常运行情况下，IoTDB 将会自动对数据进行负载均衡，但在集群新加入 DataNode 节点、DataNode 所在机器硬盘损坏需要恢复数据等场景下，可通过手动 Region 迁移精细化调整集群负载和运维。

下面是一次region迁移过程的示意图：


![](/img/region%E8%BF%81%E7%A7%BB%E7%A4%BA%E6%84%8F%E5%9B%BE20241210.png)

## 2 注意事项

1. 推荐仅在 IoTDB 1.3.3 以及更高版本使用 Region 迁移功能。
2. 仅在共识协议为 IoTConsensus、Ratis 时支持 Region 迁移（iotdb-system.properties中的`schema_region_consensus_protocol_class` 和 `data_region_consensus_protocol_class`）。
3. Region 迁移会占用硬盘和网络带宽等系统资源，推荐在低业务负载时进行。
4. 在理想情况下，Region 迁移不影响用户侧读写。特殊情况下，Region 迁移可能阻塞写入，这种情况的具体鉴别与处理方式见使用说明。

## 3 使用说明

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