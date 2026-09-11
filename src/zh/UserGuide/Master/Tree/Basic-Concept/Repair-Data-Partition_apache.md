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

# 修复数据分区表

在极端情况下，例如 ConfigNode 元数据丢失或部分数据分区信息损坏，IoTDB 自 V2\.0\.11 起提供手动修复数据分区表的能力。该功能用于恢复 ConfigNode 中缺失的数据分区信息，建议在确认存在数据分区表异常后使用。

## 1. 执行修复操作

当所有 ConfigNode 和 DataNode 均正常运行后，执行以下 SQL 触发修复流程：

```SQL
REPAIR DATA PARTITION TABLE;
```

系统将自动扫描各 DataNode 节点中的数据分区信息，并检查 ConfigNode 的数据分区表中是否存在缺失记录。若发现缺失，系统会自动进行修复。

> 注意：执行修复操作前，请确保 ConfigNode 与 DataNode 均处于正常运行状态。
> 


## 2. 查看修复进度

在执行 `REPAIR DATA PARTITION TABLE` 后，可以通过以下 SQL 查看修复任务的实时进度：

```SQL
SHOW REPAIR DATA PARTITION TABLE PROGRESS;
```

执行上述 SQL 后，系统将返回包含以下字段的结果集：

|字段名|说明|
|---|---|
|`Status`|当前修复任务的状态|
|`Progress(%)`|当前修复任务的整体进度百分比|
|`Message`|当前状态或进度的详细信息|

任务执行过程中可能看到类似结果：

```SQL
+----------------------------+-----------+----------------------------------------------------+
|                      Status|Progress(%)|                                             Message|
+----------------------------+-----------+----------------------------------------------------+
|  COLLECT_EARLIEST_TIMESLOTS|        0.0|   DataPartitionTable integrity check progress: 0.0%|
+----------------------------+-----------+----------------------------------------------------+
```

如果系统当前没有正在执行的修复任务，则返回 `IDLE` 状态，如：

```SQL
+------+-----------+-------------------------------------------------------+
|Status|Progress(%)|                                                Message|
+------+-----------+-------------------------------------------------------+
|  IDLE|        0.0|No running DataPartitionTable integrity check procedure|
+------+-----------+-------------------------------------------------------+
```

## 3. 配置参数（可选）

为避免扫描文件过程对线上正常业务造成影响，IoTDB 提供了以下两个可配置参数，用于控制并发处理能力与读取限流。您可以根据实际环境在 `iotdb-system.properties` 中按需配置。

|参数名|说明|默认值|
|---|---|---|
|`partition_table_recover_worker_num`|并行检索的线程数量|`10`|
|`partition_table_recover_max_read_mb_per_sec`|每秒最大读取速率，单位为 MB/s|`10`|

- 数据分区表修复过程中，会使用 `partition_table_recover_worker_num` 控制并发检查的线程数。在生产环境中，建议为 IoTDB 主要功能预留部分线程资源，该参数值不宜超过 CPU 核数。

- 在生产环境中，建议通过 `partition_table_recover_max_read_mb_per_sec` 设置读取速率上限，避免修复操作对业务读写造成过大压力。

> 注意：以上参数均为可选项，默认值为 `10`；取值须大于 `0`，修改后重启生效。
> 
