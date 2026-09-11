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
# 查询性能分析

## 1. 概述

查询分析用于帮助用户理解查询的执行机制和性能瓶颈，从而进行查询优化和性能调优。IoTDB 表模型提供两类查询分析语句：

- `EXPLAIN`：预览查询 SQL 的执行计划，展示 IoTDB 如何组织数据检索和处理。

- `EXPLAIN ANALYZE`：在 `EXPLAIN` 基础上真实执行查询，并展示查询执行过程中的时间、资源消耗和算子统计信息。

`EXPLAIN` 和 `EXPLAIN ANALYZE` 默认输出面向人工阅读，适合在 CLI 中直接查看。对于 Web Console、CI 回归测试、自动化性能诊断系统等需要稳定解析查询计划或执行统计的场景，可以使用 JSON 输出格式获取结构化结果。JSON 格式自 V2.0.11 起支持。

### 1.1 查询分析方式对比

与 Arthas 抽样等排查手段相比，`EXPLAIN ANALYZE` 无需部署额外组件，可以针对单条 SQL 进行分布式追踪，更适合定位具体查询的性能问题。

|方法|安装难度|业务影响|功能范围|
|---|---|---|---|
|`EXPLAIN ANALYZE` 语句|低。无需安装额外组件，为 IoTDB 内置 SQL 语句|低。只会影响当前分析的单条查询，对线上其他负载无影响|支持分布式，可对单条 SQL 进行追踪|
|Arthas 抽样|中。需要安装 Java Arthas 工具|高。CPU 抽样可能会影响线上业务响应速度|不支持分布式，仅支持对数据库整体查询负载和耗时进行分析|

## 2. EXPLAIN

### 2.1 语法

`EXPLAIN` 命令用于查看 SQL 查询的分布式执行计划。执行计划以算子树的形式展示，描述 IoTDB 将如何执行查询。

```SQL
EXPLAIN [(FORMAT { GRAPHVIZ | JSON })] <SELECT_STATEMENT>
```

其中：

|参数|说明|
|---|---|
|`SELECT_STATEMENT`|需要分析的查询语句|
|`FORMAT GRAPHVIZ`|以默认图形文本形式输出分布式计划，适合人工阅读|
|`FORMAT JSON`|以 JSON 对象输出分布式计划，适合程序解析（自 V2.0.11 起支持）|

`FORMAT` 后的格式名大小写不敏感，例如 `FORMAT json` 与 `FORMAT JSON` 等价。

### 2.2 默认 GRAPHVIZ 格式

`EXPLAIN` 默认格式为 `GRAPHVIZ`，执行后将得到 `distribution plan` 结果列。

以[示例数据](../Reference/Sample-Data.md)中的 `table1` 为例，以下两条语句等价：

```SQL
EXPLAIN SELECT * FROM table1;
EXPLAIN (FORMAT GRAPHVIZ) SELECT * FROM table1;
```

执行如上语句后，输出如下：IoTDB 通过 `DeviceTableScanNode` 节点从不同数据分区读取数据，并通过 `Collect` 算子汇总后返回。

```SQL
+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
|                                                                                                                                                                                                                                distribution plan|
+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
|                                                            ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐                                                             |
|                                                            │OutputNode-4                                                                                                          │                                                             |
|                                                            │OutputColumns-[time, region, plant_id, device_id, model_id, maintenance, temperature, humidity, status, arrival_time] │                                                             |
|                                                            │OutputSymbols: [time, region, plant_id, device_id, model_id, maintenance, temperature, humidity, status, arrival_time]│                                                             |
|                                                            └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘                                                             |
|                                                                                                                        │                                                                                                                        |
|                                                                                                                        │                                                                                                                        |
|                                                            ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐                                                             |
|                                                            │Collect-33                                                                                                            │                                                             |
|                                                            │OutputSymbols: [time, region, plant_id, device_id, model_id, maintenance, temperature, humidity, status, arrival_time]│                                                             |
|                                                            └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘                                                             |
|                                                            ┌───────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────┐                                                           |
|                                                            │                                                                                                                        │                                                           |
|                                                     ┌───────────┐                                                                                                            ┌───────────┐                                                      |
|                                                     │Exchange-40│                                                                                                            │Exchange-41│                                                      |
|                                                     └───────────┘                                                                                                            └───────────┘                                                      |
|                                                            │                                                                                                                        │                                                           |
|                                                            │                                                                                                                        │                                                           |
|┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐|
|│DeviceTableScanNode-32                                                                                                │ │DeviceTableScanNode-31                                                                                                │|
|│QualifiedTableName: database1.table1                                                                                  │ │QualifiedTableName: database1.table1                                                                                  │|
|│OutputSymbols: [time, region, plant_id, device_id, model_id, maintenance, temperature, humidity, status, arrival_time]│ │OutputSymbols: [time, region, plant_id, device_id, model_id, maintenance, temperature, humidity, status, arrival_time]│|
|│DeviceNumber: 4                                                                                                       │ │DeviceNumber: 2                                                                                                       │|
|│ScanOrder: ASC                                                                                                        │ │ScanOrder: ASC                                                                                                        │|
|│PushDownOffset: 0                                                                                                     │ │PushDownOffset: 0                                                                                                     │|
|│PushDownLimit: 0                                                                                                      │ │PushDownLimit: 0                                                                                                      │|
|│PushDownLimitToEachDevice: false                                                                                      │ │PushDownLimitToEachDevice: false                                                                                      │|
|│RegionId: 1                                                                                                           │ │RegionId: 2                                                                                                           │|
|└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘|
+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
```

### 2.3 JSON 格式

使用 `EXPLAIN (FORMAT JSON)` 可以返回分布式计划树的 JSON 表示。结果集为单列输出，JSON 格式下返回单行、单个 JSON 对象，便于 JDBC 客户端或自动化工具直接读取。

`EXPLAIN (FORMAT JSON)` 的顶层结构随查询类型变化：

|场景|顶层结构|说明|
|---|---|---|
|普通查询|plan node JSON object|顶层直接是 `OutputNode` 等计划节点对象|
|包含 materialized CTE 的查询|wrapper JSON object|顶层包含 `cteQueries` 和 `mainQuery`，用于同时保留 CTE 子查询计划与主查询计划|

每个 plan node 输出为一个 JSON object，基础字段如下：

|字段|类型/出现位置|说明|
|---|---|---|
|`name`|string|节点类型与 plan node id 拼接后的展示名，例如 `OutputNode-4`|
|`id`|string|plan node id|
|`properties`|object|节点属性。仅当节点存在可展示属性时输出|
|`children`|array|子节点数组。仅当节点存在子节点时输出|

常见 plan node 属性包括：

|节点类型|主要字段/属性|
|---|---|
|`OutputNode`|`OutputColumns`、`OutputSymbols`|
|`TableScanNode` / `DeviceTableScanNode`|`QualifiedTableName`、`OutputSymbols`、`DeviceNumber`、`ScanOrder`、`TimePredicate`、`PushDownPredicate`、`PushDownOffset`、`PushDownLimit`、`PushDownLimitToEachDevice`、`RegionId`|
|`TreeDeviceViewScanNode`|除表扫描属性外，补充 `TreeDB`、`MeasurementToColumnName`|
|`AggregationNode`|`OutputSymbols`、`Aggregators`、`GroupingKeys`、`Streamable`、`PreGroupedSymbols`、`Step`|
|`FilterNode`|`Predicate`|
|`ProjectNode`|`OutputSymbols`、`Expressions`|
|`LimitNode` / `OffsetNode`|`Count`|
|`SortNode` / `MergeSortNode`|`OrderBy`|
|`JoinNode`|`JoinType`、`Criteria`、`OutputSymbols`|
|`UnionNode`|`OutputSymbols`|
|`ExplainAnalyzeNode`|`ChildPermittedOutputs`|

当查询包含 materialized CTE 时，JSON 顶层不再直接是单个 plan node，而是包装为：

```JSON
{
  "cteQueries": [
    {
      "name": "cte1",
      "plan": {
        "name": "OutputNode-<id>",
        "id": "<id>"
      }
    }
  ],
  "mainQuery": {
    "name": "OutputNode-<id>",
    "id": "<id>"
  }
}
```

其中 `cteQueries[].plan` 与 `mainQuery` 均为 plan node JSON object。该结构用于同时保留 CTE 子查询计划与主查询计划。

以[示例数据](../Reference/Sample-Data.md)中的 `table1` 为例：

```SQL
EXPLAIN (FORMAT JSON) SELECT * FROM table1;
```

```JSON
+-----------------+                                                                                                                                 
|distribution plan|                                                                                                                                 
+-----------------+                                                                                                                                 
{                                                                                                                                                   
  "name": "OutputNode-4",                                                                                                                           
  "id": "4",                                                                                                                                        
  "properties": {                                                                                                                                   
    "OutputColumns": [                                                                                                                              
      "time",                                                                                                                                       
      "region",                                                                                                                                     
      "plant_id",                                                                                                                                   
      "device_id",                                                                                                                                  
      "model_id",                                                                                                                                   
      "maintenance",                                                                                                                                
      "temperature",                                                                                                                                
      "humidity",                                                                                                                                   
      "status",                                                                                                                                     
      "arrival_time"                                                                                                                                
    ],                                                                                                                                              
    "OutputSymbols": [                                                                                                                              
      "time",                                                                                                                                       
      "region",                                                                                                                                     
      "plant_id",                                                                                                                                   
      "device_id",                                                                                                                                  
      "model_id",                                                                                                                                   
      "maintenance",                                                                                                                                
      "temperature",                                                                                                                                
      "humidity",                                                                                                                                   
      "status",                                                                                                                                     
      "arrival_time"                                                                                                                                
    ]                                                                                                                                               
  },                                                                                                                                                
  "children": [                                                                                                                                     
    {                                                                                                                                               
      "name": "CollectNode-33",                                                                                                                     
      "id": "33",                                                                                                                                   
      "children": [                                                                                                                                 
        {                                                                                                                                           
          "name": "ExchangeNode-40",                                                                                                                
          "id": "40",                                                                                                                               
          "children": [                                                                                                                             
            {                                                                                                                                       
              "name": "DeviceTableScanNode-32",                                                                                                     
              "id": "32",                                                                                                                           
              "properties": {                                                                                                                       
                "QualifiedTableName": "database1.table1",                                                                                           
                "OutputSymbols": [                                                                                                                  
                  "time",                                                                                                                           
                  "region",                                                                                                                         
                  "plant_id",                                                                                                                       
                  "device_id",                                                                                                                      
                  "model_id",                                                                                                                       
                  "maintenance",                                                                                                                    
                  "temperature",                                                                                                                    
                  "humidity",                                                                                                                       
                  "status",                                                                                                                         
                  "arrival_time"                                                                                                                    
                ],                                                                                                                                  
                "DeviceNumber": "4",                                                                                                                
                "ScanOrder": "ASC",                                                                                                                 
                "PushDownOffset": "0",                                                                                                              
                "PushDownLimit": "0",                                                                                                               
                "PushDownLimitToEachDevice": "false",                                                                                               
                "RegionId": "1"                                                                                                                     
              }                                                                                                                                     
            }                                                                                                                                       
          ]                                                                                                                                         
        },                                                                                                                                          
        {                                                                                                                                           
          "name": "ExchangeNode-41",                                                                                                                
          "id": "41",                                                                                                                               
          "children": [                                                                                                                             
            {                                                                                                                                       
              "name": "DeviceTableScanNode-31",                                                                                                     
              "id": "31",                                                                                                                           
              "properties": {                                                                                                                       
                "QualifiedTableName": "database1.table1",                                                                                           
                "OutputSymbols": [                                                                                                                  
                  "time",                                                                                                                           
                  "region",                                                                                                                         
                  "plant_id",                                                                                                                       
                  "device_id",                                                                                                                      
                  "model_id",                                                                                                                       
                  "maintenance",                                                                                                                    
                  "temperature",                                                                                                                    
                  "humidity",                                                                                                                       
                  "status",                                                                                                                         
                  "arrival_time"                                                                                                                    
                ],                                                                                                                                  
                "DeviceNumber": "2",                                                                                                                
                "ScanOrder": "ASC",                                                                                                                 
                "PushDownOffset": "0",                                                                                                              
                "PushDownLimit": "0",                                                                                                               
                "PushDownLimitToEachDevice": "false",                                                                                               
                "RegionId": "2"                                                                                                                     
              }                                                                                                                                     
            }                                                                                                                                       
          ]                                                                                                                                         
        }                                                                                                                                           
      ]                                                                                                                                             
    }                                                                                                                                               
  ]                                                                                                                                                 
}                                                                                                                                                   
+-----------------+ 
```

## 3. EXPLAIN ANALYZE

### 3.1 语法

`EXPLAIN ANALYZE` 是 IoTDB 查询引擎自带的性能分析 SQL。与 `EXPLAIN` 不同，它会真实执行对应查询计划并统计执行信息，可用于追踪一条查询的具体性能分布，辅助资源观察、性能调优和异常分析。

```SQL
EXPLAIN ANALYZE [VERBOSE] [(FORMAT { TEXT | JSON })] <SELECT_STATEMENT>
```

其中：

|参数|说明|
|---|---|
|`SELECT_STATEMENT`|需要分析的查询语句|
|`VERBOSE`|打印更详细的分析结果。不填写时会省略部分细粒度统计|
|`FORMAT TEXT`|以默认文本形式输出分析结果，适合人工阅读|
|`FORMAT JSON`|以 JSON 对象输出分析结果，适合程序解析（自 V2.0.11 起支持）|

### 3.2 默认 TEXT 格式

`EXPLAIN ANALYZE` 默认格式为 `TEXT`，执行后将得到 `Explain Analyze` 结果列。结果由查询规划统计、fragment instance 统计、数据读取统计和算子树统计组成。

- **查询规划统计**

`QueryStatistics` 包含查询层面的统计信息：

|字段|类型/出现位置|说明|
|---|---|---|
|`Analyze Cost`|查询规划统计|SQL 分析阶段的耗时|
|`Fetch Partition Cost`|查询规划统计|拉取分区表的耗时|
|`Fetch Schema Cost`|查询规划统计|拉取元数据以及权限校验的耗时|
|`Logical Plan Cost`|查询规划统计|构建逻辑计划的耗时|
|`Logical Optimization Cost`|查询规划统计|逻辑计划优化的耗时|
|`Distribution Plan Cost`|查询规划统计|构建分布式计划的耗时|
|`Dispatch Cost`|查询规划统计|分发 fragment instance 的耗时|
|`Fragment Instances Count`|查询规划统计|总查询分片数量，每个查询分片的信息会依次输出|

- **Fragment instance 统计**

`FragmentInstance` 是 IoTDB 一个查询分片的封装。每个查询分片都会输出一份执行信息，主要包含 fragment 统计和算子信息。

fragment 统计包括：

|字段|类型/出现位置|说明|
|---|---|---|
|`Total Wall Time`|fragment 统计|该分片从开始执行到执行结束的物理时间|
|`Cost of initDataQuerySource`|fragment 统计|构建查询文件列表的耗时|
|`Seq File(unclosed)`|fragment 统计|未封口的顺序文件数量|
|`Seq File(closed)`|fragment 统计|已封口的顺序文件数量|
|`UnSeq File(unclosed)`|fragment 统计|未封口的乱序文件数量|
|`UnSeq File(closed)`|fragment 统计|已封口的乱序文件数量|
|`ready queued time`|fragment 统计|查询分片所有 task 在 ready queue 中的总时长|
|`blocked queued time`|fragment 统计|查询分片所有 task 在 blocked queue 中的总时长|

- **数据读取统计**

`Query Statistics` 明细字段包括：

|字段|类型/出现位置|说明|
|---|---|---|
|`loadBloomFilterFromCacheCount`|BloomFilter|命中 BloomFilterCache 的次数|
|`loadBloomFilterFromDiskCount`|BloomFilter|从磁盘读取 BloomFilter 的次数|
|`loadBloomFilterActualIOSize`|BloomFilter|从磁盘读取 BloomFilter 时产生的磁盘 IO，单位为 bytes|
|`loadBloomFilterTime`|BloomFilter|读取 BloomFilter 并计算序列是否存在的总耗时，单位为 ms|
|`loadTimeSeriesMetadataDiskSeqCount`|TimeSeriesMetadata|从已封口顺序文件中加载的 TimeSeriesMetadata 数量|
|`loadTimeSeriesMetadataDiskUnSeqCount`|TimeSeriesMetadata|从已封口乱序文件中加载的 TimeSeriesMetadata 数量|
|`loadTimeSeriesMetadataDiskSeqTime`|TimeSeriesMetadata|从已封口顺序文件中加载 TimeSeriesMetadata 的耗时|
|`loadTimeSeriesMetadataDiskUnSeqTime`|TimeSeriesMetadata|从已封口乱序文件中加载 TimeSeriesMetadata 的耗时|
|`loadTimeSeriesMetadataFromCacheCount`|TimeSeriesMetadata|命中 TimeSeriesMetadataCache 的次数|
|`loadTimeSeriesMetadataFromDiskCount`|TimeSeriesMetadata|从磁盘读取 TimeSeriesMetadata 的次数|
|`loadTimeSeriesMetadataActualIOSize`|TimeSeriesMetadata|从磁盘读取 TimeSeriesMetadata 时产生的磁盘 IO，单位为 bytes|
|`TimeSeriesMetadataModificationTime`|Mods 文件|读取 mods 文件的耗时|
|`constructAlignedChunkReadersDiskCount`|Chunk|构造 ChunkReader 的次数|
|`constructAlignedChunkReadersDiskTime`|Chunk|构造 ChunkReader 的总耗时，包含磁盘 IO 和解压缩|
|`pageReadersDecodeAlignedDiskCount`|Chunk|解码 page 的数量|
|`pageReadersDecodeAlignedDiskTime`|Chunk|解码 page 的总耗时|
|`loadChunkFromCacheCount`|Chunk|命中 ChunkCache 的次数|
|`loadChunkFromDiskCount`|Chunk|从磁盘读取 Chunk 的次数|
|`loadChunkActualIOSize`|Chunk|从磁盘读取 Chunk 时产生的磁盘 IO，单位为 bytes|

- **算子树统计**

算子树统计包括：

|字段|类型/出现位置|说明|
|---|---|---|
|`CPU Time`|算子树统计|当前算子的 CPU 执行耗时|
|`output`|算子树统计|当前算子的输出行数|
|`HasNext() Called Count`|算子树统计|当前算子 `HasNext()` 接口被调用的次数|
|`Next() Called Count`|算子树统计|当前算子 `Next()` 接口被调用的次数|
|`Estimated Memory Size`|算子树统计|当前算子的估算内存占用|
|节点专属统计信息|算子树统计|不同算子输出的定制统计字段，例如 `DeviceNumber`、`CurrentDeviceIndex`、`OutputPlanNodeId`、`size_in_bytes` 等|

常见节点专属统计字段包括：

|字段|类型/出现位置|说明|
|---|---|---|
|`DeviceNumber`|`TableScan` 相关节点|当前 table scan 涉及的设备数量|
|`CurrentDeviceIndex`|`TableScan` 相关节点|当前正在扫描的设备索引|
|`OutputPlanNodeId`|sink 节点|sink 节点对应的下游接收数据节点|
|`size_in_bytes`|exchange 节点|exchange 节点接收到的 TsBlock 字节数，仅计算数据占用大小|
|`TimeSeriesIndexFilteredRows`|filter 下推到 table scan 时的 table scan 节点|通过序列元数据过滤掉的数据行数|
|`ChunkIndexFilteredRows`|filter 下推到 table scan 时的 table scan 节点|通过列块元数据过滤掉的数据行数|
|`PageIndexFilteredRows`|filter 下推到 table scan 时的 table scan 节点|通过页头内部统计信息过滤掉的数据行数|
|`RowScanFilteredRows`|filter 下推到 table scan 且使用 `VERBOSE` 时的 table scan 节点|逐行检查数据时被过滤掉的行数|

实际输出字段会随查询类型、涉及的算子、是否使用 `VERBOSE` 以及是否触发过滤下推而变化。未触发对应逻辑时，相关字段可能不会出现在结果中。

- **文本输出示例**

以[示例数据](../Reference/Sample-Data.md)中的 `table1` 为例，以下两条语句等价：

```SQL
EXPLAIN ANALYZE SELECT * FROM table1;
EXPLAIN ANALYZE (FORMAT TEXT) SELECT * FROM table1;
```

```SQL
+-------------------------------------------------------------------------------------------------------------------------+
|                                                                                                          Explain Analyze|
+-------------------------------------------------------------------------------------------------------------------------+
|Analyze Cost: 3.862 ms                                                                                                   |
|Fetch Partition Cost: 0.785 ms                                                                                           |
|Fetch Schema Cost: 5.473 ms                                                                                              |
|Logical Plan Cost: 37.350 ms                                                                                             |
|Logical Optimization Cost: 4.340 ms                                                                                      |
|Distribution Plan Cost: 1.287 ms                                                                                         |
|Dispatch Cost: 8.711 ms                                                                                                  |
|Fragment Instances Count: 3                                                                                              |
|                                                                                                                         |
|FRAGMENT-INSTANCE[Id: 20260722_064147_00096_1.2.0][IP: 127.0.0.1:10730][DataRegion: virtual_data_region][State: FINISHED]|
|  Total Wall Time: 64 ms                                                                                                 |
|  Cost of initDataQuerySource: 0.000 ms                                                                                  |
|  Seq File(unclosed): 0, Seq File(closed): 0                                                                             |
|  UnSeq File(unclosed): 0, UnSeq File(closed): 0                                                                         |
|  ready queued time: 0.428 ms, blocked queued time: 11.410 ms                                                            |
|  Query Statistics:                                                                                                      |
|    timeSeriesIndexFilteredRows: 0                                                                                       |
|    chunkIndexFilteredRows: 0                                                                                            |
|    pageIndexFilteredRows: 0                                                                                             |
|    [PlanNodeId 69]: IdentitySinkNode(IdentitySinkOperator)                                                              |
|        CPU Time: 28.691 ms                                                                                              |
|        output: 18 rows                                                                                                  |
|        HasNext() Called Count: 9                                                                                        |
|        Next() Called Count: 8                                                                                           |
|        Estimated Memory Size: 131072                                                                                    |
|        DownStreamPlanNodeId: 66                                                                                         |
|      [PlanNodeId 55]: CollectNode(CollectOperator)                                                                      |
|          CPU Time: 28.656 ms                                                                                            |
|          output: 18 rows                                                                                                |
|          HasNext() Called Count: 9                                                                                      |
|          Next() Called Count: 8                                                                                         |
|          Estimated Memory Size: 131072                                                                                  |
|        [PlanNodeId 64]: ExchangeNode(ExchangeOperator)                                                                  |
|            CPU Time: 13.310 ms                                                                                          |
|            output: 12 rows                                                                                              |
|            HasNext() Called Count: 5                                                                                    |
|            Next() Called Count: 4                                                                                       |
|            Estimated Memory Size: 131072                                                                                |
|            size_in_bytes: 3264                                                                                          |
|        [PlanNodeId 65]: ExchangeNode(ExchangeOperator)                                                                  |
|            CPU Time: 15.286 ms                                                                                          |
|            output: 6 rows                                                                                               |
|            HasNext() Called Count: 3                                                                                    |
|            Next() Called Count: 2                                                                                       |
|            Estimated Memory Size: 131072                                                                                |
|            size_in_bytes: 1632                                                                                          |
|                                                                                                                         |
|FRAGMENT-INSTANCE[Id: 20260722_064147_00096_1.3.0][IP: 127.0.0.1:10730][DataRegion: 1][State: FINISHED]                  |
|  Total Wall Time: 32 ms                                                                                                 |
|  Cost of initDataQuerySource: 7.652 ms                                                                                  |
|  Seq File(unclosed): 0, Seq File(closed): 0                                                                             |
|  UnSeq File(unclosed): 2, UnSeq File(closed): 0                                                                         |
|  ready queued time: 0.089 ms, blocked queued time: 0.000 ms                                                             |
|  Query Statistics:                                                                                                      |
|    timeSeriesIndexFilteredRows: 0                                                                                       |
|    chunkIndexFilteredRows: 0                                                                                            |
|    pageIndexFilteredRows: 0                                                                                             |
|    [PlanNodeId 67]: IdentitySinkNode(IdentitySinkOperator)                                                              |
|        CPU Time: 2.007 ms                                                                                               |
|        output: 12 rows                                                                                                  |
|        HasNext() Called Count: 9                                                                                        |
|        Next() Called Count: 8                                                                                           |
|        Estimated Memory Size: 327680                                                                                    |
|        DownStreamPlanNodeId: 64                                                                                         |
|      [PlanNodeId 54]: DeviceTableScanNode(TableScanOperator)                                                            |
|          CPU Time: 1.981 ms                                                                                             |
|          output: 12 rows                                                                                                |
|          HasNext() Called Count: 9                                                                                      |
|          Next() Called Count: 8                                                                                         |
|          Estimated Memory Size: 327680                                                                                  |
|          DeviceNumber: 4                                                                                                |
|          CurrentDeviceIndex: 3                                                                                          |
|                                                                                                                         |
|FRAGMENT-INSTANCE[Id: 20260722_064147_00096_1.4.0][IP: 127.0.0.1:10730][DataRegion: 2][State: FINISHED]                  |
|  Total Wall Time: 48 ms                                                                                                 |
|  Cost of initDataQuerySource: 0.933 ms                                                                                  |
|  Seq File(unclosed): 0, Seq File(closed): 0                                                                             |
|  UnSeq File(unclosed): 1, UnSeq File(closed): 0                                                                         |
|  ready queued time: 0.141 ms, blocked queued time: 0.000 ms                                                             |
|  Query Statistics:                                                                                                      |
|    timeSeriesIndexFilteredRows: 0                                                                                       |
|    chunkIndexFilteredRows: 0                                                                                            |
|    pageIndexFilteredRows: 0                                                                                             |
|    [PlanNodeId 68]: IdentitySinkNode(IdentitySinkOperator)                                                              |
|        CPU Time: 1.846 ms                                                                                               |
|        output: 6 rows                                                                                                   |
|        HasNext() Called Count: 5                                                                                        |
|        Next() Called Count: 4                                                                                           |
|        Estimated Memory Size: 327680                                                                                    |
|        DownStreamPlanNodeId: 65                                                                                         |
|      [PlanNodeId 53]: DeviceTableScanNode(TableScanOperator)                                                            |
|          CPU Time: 1.755 ms                                                                                             |
|          output: 6 rows                                                                                                 |
|          HasNext() Called Count: 5                                                                                      |
|          Next() Called Count: 4                                                                                         |
|          Estimated Memory Size: 327680                                                                                  |
|          DeviceNumber: 2                                                                                                |
|          CurrentDeviceIndex: 1                                                                                          |
+-------------------------------------------------------------------------------------------------------------------------+
```

- **VERBOSE 输出示例**

使用 `VERBOSE` 可以查看更细粒度的数据读取和过滤统计：

```SQL
EXPLAIN ANALYZE VERBOSE SELECT * FROM table1;
EXPLAIN ANALYZE VERBOSE (FORMAT TEXT) SELECT * FROM table1;
```

```YAML
+-------------------------------------------------------------------------------------------------------------------------+
|                                                                                                          Explain Analyze|
+-------------------------------------------------------------------------------------------------------------------------+
|Analyze Cost: 1.016 ms                                                                                                   |
|Fetch Partition Cost: 0.555 ms                                                                                           |
|Fetch Schema Cost: 3.789 ms                                                                                              |
|Logical Plan Cost: 0.491 ms                                                                                              |
|Logical Optimization Cost: 2.625 ms                                                                                      |
|Distribution Plan Cost: 0.393 ms                                                                                         |
|Dispatch Cost: 37.041 ms                                                                                                 |
|Fragment Instances Count: 3                                                                                              |
|                                                                                                                         |
|FRAGMENT-INSTANCE[Id: 20260722_064913_00105_1.2.0][IP: 127.0.0.1:10730][DataRegion: virtual_data_region][State: FINISHED]|
|  Total Wall Time: 43 ms                                                                                                 |
|  Cost of initDataQuerySource: 0.000 ms                                                                                  |
|  Seq File(unclosed): 0, Seq File(closed): 0                                                                             |
|  UnSeq File(unclosed): 0, UnSeq File(closed): 0                                                                         |
|  ready queued time: 0.248 ms, blocked queued time: 23.757 ms                                                            |
|  Query Statistics:                                                                                                      |
|    loadBloomFilterFromCacheCount: 0                                                                                     |
|    loadBloomFilterFromDiskCount: 0                                                                                      |
|    loadBloomFilterActualIOSize: 0                                                                                       |
|    loadBloomFilterTime: 0.000                                                                                           |
|    loadTimeSeriesMetadataFromCacheCount: 0                                                                              |
|    loadTimeSeriesMetadataFromDiskCount: 0                                                                               |
|    loadTimeSeriesMetadataActualIOSize: 0                                                                                |
|    loadChunkFromCacheCount: 0                                                                                           |
|    loadChunkFromDiskCount: 0                                                                                            |
|    loadChunkActualIOSize: 0                                                                                             |
|    timeSeriesIndexFilteredRows: 0                                                                                       |
|    chunkIndexFilteredRows: 0                                                                                            |
|    pageIndexFilteredRows: 0                                                                                             |
|    rowScanFilteredRows: 0                                                                                               |
|    [PlanNodeId 69]: IdentitySinkNode(IdentitySinkOperator)                                                              |
|        CPU Time: 0.988 ms                                                                                               |
|        output: 18 rows                                                                                                  |
|        HasNext() Called Count: 9                                                                                        |
|        Next() Called Count: 8                                                                                           |
|        Estimated Memory Size: 131072                                                                                    |
|        DownStreamPlanNodeId: 66                                                                                         |
|      [PlanNodeId 55]: CollectNode(CollectOperator)                                                                      |
|          CPU Time: 0.954 ms                                                                                             |
|          output: 18 rows                                                                                                |
|          HasNext() Called Count: 9                                                                                      |
|          Next() Called Count: 8                                                                                         |
|          Estimated Memory Size: 131072                                                                                  |
|        [PlanNodeId 64]: ExchangeNode(ExchangeOperator)                                                                  |
|            CPU Time: 0.569 ms                                                                                           |
|            output: 12 rows                                                                                              |
|            HasNext() Called Count: 5                                                                                    |
|            Next() Called Count: 4                                                                                       |
|            Estimated Memory Size: 131072                                                                                |
|            size_in_bytes: 3264                                                                                          |
|        [PlanNodeId 65]: ExchangeNode(ExchangeOperator)                                                                  |
|            CPU Time: 0.354 ms                                                                                           |
|            output: 6 rows                                                                                               |
|            HasNext() Called Count: 3                                                                                    |
|            Next() Called Count: 2                                                                                       |
|            Estimated Memory Size: 131072                                                                                |
|            size_in_bytes: 1632                                                                                          |
|                                                                                                                         |
|FRAGMENT-INSTANCE[Id: 20260722_064913_00105_1.3.0][IP: 127.0.0.1:10730][DataRegion: 1][State: FINISHED]                  |
|  Total Wall Time: 32 ms                                                                                                 |
|  Cost of initDataQuerySource: 0.224 ms                                                                                  |
|  Seq File(unclosed): 0, Seq File(closed): 2                                                                             |
|  UnSeq File(unclosed): 0, UnSeq File(closed): 0                                                                         |
|  ready queued time: 0.025 ms, blocked queued time: 0.000 ms                                                             |
|  Query Statistics:                                                                                                      |
|    loadBloomFilterFromCacheCount: 2                                                                                     |
|    loadBloomFilterFromDiskCount: 0                                                                                      |
|    loadBloomFilterActualIOSize: 0                                                                                       |
|    loadBloomFilterTime: 0.018                                                                                           |
|    loadTimeSeriesMetadataAlignedDiskSeqCount: 4                                                                         |
|    loadTimeSeriesMetadataAlignedDiskSeqTime: 0.189                                                                      |
|    loadTimeSeriesMetadataFromCacheCount: 18                                                                             |
|    loadTimeSeriesMetadataFromDiskCount: 2                                                                               |
|    loadTimeSeriesMetadataActualIOSize: 0                                                                                |
|    alignedTimeSeriesMetadataModificationTime: 0.026                                                                     |
|    constructAlignedChunkReadersDiskCount: 4                                                                             |
|    constructAlignedChunkReadersDiskTime: 3.251                                                                          |
|    loadChunkFromCacheCount: 18                                                                                          |
|    loadChunkFromDiskCount: 0                                                                                            |
|    loadChunkActualIOSize: 0                                                                                             |
|    pageReadersDecodeAlignedDiskCount: 4                                                                                 |
|    pageReadersDecodeAlignedDiskTime: 0.210                                                                              |
|    timeSeriesIndexFilteredRows: 0                                                                                       |
|    chunkIndexFilteredRows: 0                                                                                            |
|    pageIndexFilteredRows: 0                                                                                             |
|    rowScanFilteredRows: 0                                                                                               |
|    [PlanNodeId 67]: IdentitySinkNode(IdentitySinkOperator)                                                              |
|        CPU Time: 5.150 ms                                                                                               |
|        output: 12 rows                                                                                                  |
|        HasNext() Called Count: 9                                                                                        |
|        Next() Called Count: 8                                                                                           |
|        Estimated Memory Size: 327680                                                                                    |
|        DownStreamPlanNodeId: 64                                                                                         |
|      [PlanNodeId 54]: DeviceTableScanNode(TableScanOperator)                                                            |
|          CPU Time: 5.136 ms                                                                                             |
|          output: 12 rows                                                                                                |
|          HasNext() Called Count: 9                                                                                      |
|          Next() Called Count: 8                                                                                         |
|          Estimated Memory Size: 327680                                                                                  |
|          DeviceNumber: 4                                                                                                |
|          CurrentDeviceIndex: 3                                                                                          |
|                                                                                                                         |
|FRAGMENT-INSTANCE[Id: 20260722_064913_00105_1.4.0][IP: 127.0.0.1:10730][DataRegion: 2][State: FINISHED]                  |
|  Total Wall Time: 32 ms                                                                                                 |
|  Cost of initDataQuerySource: 0.397 ms                                                                                  |
|  Seq File(unclosed): 0, Seq File(closed): 1                                                                             |
|  UnSeq File(unclosed): 0, UnSeq File(closed): 0                                                                         |
|  ready queued time: 0.075 ms, blocked queued time: 0.000 ms                                                             |
|  Query Statistics:                                                                                                      |
|    loadBloomFilterFromCacheCount: 0                                                                                     |
|    loadBloomFilterFromDiskCount: 0                                                                                      |
|    loadBloomFilterActualIOSize: 0                                                                                       |
|    loadBloomFilterTime: 0.000                                                                                           |
|    loadTimeSeriesMetadataAlignedDiskSeqCount: 2                                                                         |
|    loadTimeSeriesMetadataAlignedDiskSeqTime: 0.313                                                                      |
|    loadTimeSeriesMetadataFromCacheCount: 10                                                                             |
|    loadTimeSeriesMetadataFromDiskCount: 0                                                                               |
|    loadTimeSeriesMetadataActualIOSize: 0                                                                                |
|    alignedTimeSeriesMetadataModificationTime: 0.046                                                                     |
|    constructAlignedChunkReadersDiskCount: 2                                                                             |
|    constructAlignedChunkReadersDiskTime: 2.307                                                                          |
|    loadChunkFromCacheCount: 10                                                                                          |
|    loadChunkFromDiskCount: 0                                                                                            |
|    loadChunkActualIOSize: 0                                                                                             |
|    pageReadersDecodeAlignedDiskCount: 2                                                                                 |
|    pageReadersDecodeAlignedDiskTime: 0.129                                                                              |
|    timeSeriesIndexFilteredRows: 0                                                                                       |
|    chunkIndexFilteredRows: 0                                                                                            |
|    pageIndexFilteredRows: 0                                                                                             |
|    rowScanFilteredRows: 0                                                                                               |
|    [PlanNodeId 68]: IdentitySinkNode(IdentitySinkOperator)                                                              |
|        CPU Time: 4.187 ms                                                                                               |
|        output: 6 rows                                                                                                   |
|        HasNext() Called Count: 5                                                                                        |
|        Next() Called Count: 4                                                                                           |
|        Estimated Memory Size: 327680                                                                                    |
|        DownStreamPlanNodeId: 65                                                                                         |
|      [PlanNodeId 53]: DeviceTableScanNode(TableScanOperator)                                                            |
|          CPU Time: 4.172 ms                                                                                             |
|          output: 6 rows                                                                                                 |
|          HasNext() Called Count: 5                                                                                      |
|          Next() Called Count: 4                                                                                         |
|          Estimated Memory Size: 327680                                                                                  |
|          DeviceNumber: 2                                                                                                |
|          CurrentDeviceIndex: 1                                                                                          |
+-------------------------------------------------------------------------------------------------------------------------+
```

### 3.3 JSON 格式

使用 `EXPLAIN ANALYZE (FORMAT JSON)` 可以返回计划阶段耗时、fragment instance 统计、operator 统计等结构化信息。JSON 格式自 V2.0.11 起支持。

#### 3.3.1 默认 JSON 输出

```SQL
EXPLAIN ANALYZE (FORMAT JSON) SELECT * FROM t1;
```

顶层 JSON 结构如下：

|字段|类型/出现位置|说明|
|---|---|---|
|`planStatistics`|object|查询分析、分区获取、schema 获取、逻辑规划、逻辑优化、分布式规划、dispatch 等阶段耗时|
|`fragmentInstancesCount`|number|返回统计信息的 fragment instance 数量|
|`fragmentInstances`|array|各 fragment instance 的执行统计|

`planStatistics` 主要字段如下：

|字段|类型/出现位置|说明|
|---|---|---|
|`analyzeCostMs`|planStatistics|SQL 分析耗时，单位 ms|
|`fetchPartitionCostMs`|planStatistics|获取分区信息耗时，单位 ms|
|`fetchSchemaCostMs`|planStatistics|获取 schema 信息耗时，单位 ms|
|`logicalPlanCostMs`|planStatistics|逻辑计划生成耗时，单位 ms|
|`logicalOptimizationCostMs`|planStatistics|逻辑优化耗时，单位 ms|
|`distributionPlanCostMs`|planStatistics|分布式计划生成耗时，单位 ms|
|`dispatchCostMs`|planStatistics|fragment dispatch 耗时，单位 ms|

`fragmentInstances[]` 主要字段如下：

|字段|类型/出现位置|说明|
|---|---|---|
|`id`|fragmentInstances[]|fragment instance id|
|`ip`|fragmentInstances[]|执行该 fragment instance 的节点 IP|
|`dataRegion`|fragmentInstances[]|对应 DataRegion|
|`state`|fragmentInstances[]|fragment instance 最终状态|
|`totalWallTimeMs`|fragmentInstances[]|总 wall time，单位 ms|
|`initDataQuerySourceCostMs`|fragmentInstances[]|初始化数据源耗时，单位 ms|
|`initDataQuerySourceRetryCount`|fragmentInstances[]|初始化数据源重试次数。仅当大于 0 时输出|
|`seqFileUnclosed`、`seqFileClosed`、`unseqFileUnclosed`、`unseqFileClosed`|fragmentInstances[]|涉及的顺序和乱序文件数量|
|`readyQueuedTimeMs`、`blockQueuedTimeMs`|fragmentInstances[]|ready / block 队列等待时间，单位 ms|
|`queryStatistics`|fragmentInstances[]|扫描、过滤、chunk/page reader 等查询统计|
|`operators`|fragmentInstances[]|operator tree 及每个 operator 的执行统计|

`operators` 为与 plan tree 对应的树状结构，主要字段如下：

|字段|类型/出现位置|说明|
|---|---|---|
|`planNodeId`|operators|对应 plan node id|
|`nodeType`|operators|plan node 类型|
|`operatorType`|operators|实际执行 operator 类型|
|`count`|operators|operator 统计聚合次数。仅当存在时输出|
|`cpuTimeMs`|operators|operator CPU 执行耗时，单位 ms|
|`outputRows`|operators|输出行数|
|`hasNextCalledCount`、`nextCalledCount`|operators|operator 迭代调用次数|
|`estimatedMemorySize`|operators|估算内存占用。仅非 0 时输出|
|`specifiedInfo`|operators|operator 特有统计信息。仅非空时输出|
|`children`|operators|子 operator 数组|

以[示例数据](../Reference/Sample-Data.md)中的 `table1` 为例：

```SQL
EXPLAIN ANALYZE (FORMAT JSON) SELECT * FROM table1;
```

```JSON
+---------------+
|Explain Analyze|
+---------------+
{
  "planStatistics": {
    "analyzeCostMs": 4.948,
    "fetchPartitionCostMs": 2.104,
    "fetchSchemaCostMs": 13.321,
    "logicalPlanCostMs": 2.264,
    "logicalOptimizationCostMs": 7.941,
    "distributionPlanCostMs": 1.434,
    "dispatchCostMs": 9.023
  },
  "fragmentInstancesCount": 3,
  "fragmentInstances": [
    {
      "id": "20260722_064302_00101_1.2.0",
      "ip": "127.0.0.1:10730",
      "dataRegion": "virtual_data_region",
      "state": "FINISHED",
      "totalWallTimeMs": 97,
      "initDataQuerySourceCostMs": 0.0,
      "seqFileUnclosed": 0,
      "seqFileClosed": 0,
      "unseqFileUnclosed": 0,
      "unseqFileClosed": 0,
      "readyQueuedTimeMs": 0.858,
      "blockQueuedTimeMs": 71.752,
      "queryStatistics": {
        "timeSeriesIndexFilteredRows": 0,
        "chunkIndexFilteredRows": 0,
        "pageIndexFilteredRows": 0
      },
      "operators": {
        "planNodeId": "69",
        "nodeType": "IdentitySinkNode",
        "operatorType": "IdentitySinkOperator",
        "cpuTimeMs": 6.082,
        "outputRows": 18,
        "hasNextCalledCount": 9,
        "nextCalledCount": 8,
        "estimatedMemorySize": 131072,
        "specifiedInfo": {
          "DownStreamPlanNodeId": "66"
        },
        "children": [
          {
            "planNodeId": "55",
            "nodeType": "CollectNode",
            "operatorType": "CollectOperator",
            "cpuTimeMs": 6.065,
            "outputRows": 18,
            "hasNextCalledCount": 9,
            "nextCalledCount": 8,
            "estimatedMemorySize": 131072,
            "children": [
              {
                "planNodeId": "64",
                "nodeType": "ExchangeNode",
                "operatorType": "ExchangeOperator",
                "cpuTimeMs": 1.119,
                "outputRows": 12,
                "hasNextCalledCount": 5,
                "nextCalledCount": 4,
                "estimatedMemorySize": 131072,
                "specifiedInfo": {
                  "size_in_bytes": "3264"
                }
              },
              {
                "planNodeId": "65",
                "nodeType": "ExchangeNode",
                "operatorType": "ExchangeOperator",
                "cpuTimeMs": 4.909,
                "outputRows": 6,
                "hasNextCalledCount": 3,
                "nextCalledCount": 2,
                "estimatedMemorySize": 131072,
                "specifiedInfo": {
                  "size_in_bytes": "1632"
                }
              }
            ]
          }
        ]
      }
    },
    {
      "id": "20260722_064302_00101_1.3.0",
      "ip": "127.0.0.1:10730",
      "dataRegion": "1",
      "state": "FINISHED",
      "totalWallTimeMs": 63,
      "initDataQuerySourceCostMs": 0.338,
      "seqFileUnclosed": 0,
      "seqFileClosed": 2,
      "unseqFileUnclosed": 0,
      "unseqFileClosed": 0,
      "readyQueuedTimeMs": 0.273,
      "blockQueuedTimeMs": 0.0,
      "queryStatistics": {
        "timeSeriesIndexFilteredRows": 0,
        "chunkIndexFilteredRows": 0,
        "pageIndexFilteredRows": 0
      },
      "operators": {
        "planNodeId": "67",
        "nodeType": "IdentitySinkNode",
        "operatorType": "IdentitySinkOperator",
        "cpuTimeMs": 57.338,
        "outputRows": 12,
        "hasNextCalledCount": 9,
        "nextCalledCount": 8,
        "estimatedMemorySize": 327680,
        "specifiedInfo": {
          "DownStreamPlanNodeId": "64"
        },
        "children": [
          {
            "planNodeId": "54",
            "nodeType": "DeviceTableScanNode",
            "operatorType": "TableScanOperator",
            "cpuTimeMs": 57.248,
            "outputRows": 12,
            "hasNextCalledCount": 9,
            "nextCalledCount": 8,
            "estimatedMemorySize": 327680,
            "specifiedInfo": {
              "DeviceNumber": "4",
              "CurrentDeviceIndex": "3"
            }
          }
        ]
      }
    },
    {
      "id": "20260722_064302_00101_1.4.0",
      "ip": "127.0.0.1:10730",
      "dataRegion": "2",
      "state": "FINISHED",
      "totalWallTimeMs": 79,
      "initDataQuerySourceCostMs": 0.231,
      "seqFileUnclosed": 0,
      "seqFileClosed": 1,
      "unseqFileUnclosed": 0,
      "unseqFileClosed": 0,
      "readyQueuedTimeMs": 0.038,
      "blockQueuedTimeMs": 0.0,
      "queryStatistics": {
        "timeSeriesIndexFilteredRows": 0,
        "chunkIndexFilteredRows": 0,
        "pageIndexFilteredRows": 0
      },
      "operators": {
        "planNodeId": "68",
        "nodeType": "IdentitySinkNode",
        "operatorType": "IdentitySinkOperator",
        "cpuTimeMs": 66.387,
        "outputRows": 6,
        "hasNextCalledCount": 5,
        "nextCalledCount": 4,
        "estimatedMemorySize": 327680,
        "specifiedInfo": {
          "DownStreamPlanNodeId": "65"
        },
        "children": [
          {
            "planNodeId": "53",
            "nodeType": "DeviceTableScanNode",
            "operatorType": "TableScanOperator",
            "cpuTimeMs": 66.362,
            "outputRows": 6,
            "hasNextCalledCount": 5,
            "nextCalledCount": 4,
            "estimatedMemorySize": 327680,
            "specifiedInfo": {
              "DeviceNumber": "2",
              "CurrentDeviceIndex": "1"
            }
          }
        ]
      }
    }
  ]
}
+---------------+
```

#### 3.3.2 VERBOSE JSON 输出

当使用 `EXPLAIN ANALYZE VERBOSE (FORMAT JSON)` 时，顶层结构与非 verbose JSON 一致，但 `queryStatistics` 会在基础过滤行数外补充更细粒度统计，包括 bloom filter、time series metadata、chunk、page reader、modification 和实际 IO size 等信息。

`VERBOSE` 与非 `VERBOSE` JSON 输出的主要差异如下：

|输出模式|顶层结构|`queryStatistics` 字段粒度|典型字段|
|---|---|---|---|
|`EXPLAIN ANALYZE (FORMAT JSON)`|`planStatistics`、`fragmentInstancesCount`、`fragmentInstances`|默认统计字段|`timeSeriesIndexFilteredRows`、`chunkIndexFilteredRows`、`pageIndexFilteredRows`|
|`EXPLAIN ANALYZE VERBOSE (FORMAT JSON)`|与非 `VERBOSE` 一致|更详细的扫描、读取和过滤统计|`loadBloomFilterFromCacheCount`、`loadTimeSeriesMetadataFromCacheCount`、`loadChunkFromDiskCount`、`pageReadersDecodeAlignedMemCount`、`rowScanFilteredRows`|

以[示例数据](../Reference/Sample-Data.md)中的 `table1` 为例：

```SQL
EXPLAIN ANALYZE VERBOSE (FORMAT JSON) SELECT * FROM table1;
```

```JSON
+---------------+
|Explain Analyze|
+---------------+
{
  "planStatistics": {
    "analyzeCostMs": 3.505,
    "fetchPartitionCostMs": 2.003,
    "fetchSchemaCostMs": 9.198,
    "logicalPlanCostMs": 1.481,
    "logicalOptimizationCostMs": 6.684,
    "distributionPlanCostMs": 0.711,
    "dispatchCostMs": 8.32
  },
  "fragmentInstancesCount": 3,
  "fragmentInstances": [
    {
      "id": "20260722_064502_00103_1.2.0",
      "ip": "127.0.0.1:10730",
      "dataRegion": "virtual_data_region",
      "state": "FINISHED",
      "totalWallTimeMs": 48,
      "initDataQuerySourceCostMs": 0.0,
      "seqFileUnclosed": 0,
      "seqFileClosed": 0,
      "unseqFileUnclosed": 0,
      "unseqFileClosed": 0,
      "readyQueuedTimeMs": 0.209,
      "blockQueuedTimeMs": 17.997,
      "queryStatistics": {
        "loadBloomFilterFromCacheCount": 0,
        "loadBloomFilterFromDiskCount": 0,
        "loadBloomFilterActualIOSize": 0,
        "loadBloomFilterTimeMs": 0.0,
        "loadTimeSeriesMetadataFromCacheCount": 0,
        "loadTimeSeriesMetadataFromDiskCount": 0,
        "loadTimeSeriesMetadataActualIOSize": 0,
        "loadChunkFromCacheCount": 0,
        "loadChunkFromDiskCount": 0,
        "loadChunkActualIOSize": 0,
        "timeSeriesIndexFilteredRows": 0,
        "chunkIndexFilteredRows": 0,
        "pageIndexFilteredRows": 0,
        "rowScanFilteredRows": 0
      },
      "operators": {
        "planNodeId": "69",
        "nodeType": "IdentitySinkNode",
        "operatorType": "IdentitySinkOperator",
        "cpuTimeMs": 26.368,
        "outputRows": 18,
        "hasNextCalledCount": 9,
        "nextCalledCount": 8,
        "estimatedMemorySize": 131072,
        "specifiedInfo": {
          "DownStreamPlanNodeId": "66"
        },
        "children": [
          {
            "planNodeId": "55",
            "nodeType": "CollectNode",
            "operatorType": "CollectOperator",
            "cpuTimeMs": 26.32,
            "outputRows": 18,
            "hasNextCalledCount": 9,
            "nextCalledCount": 8,
            "estimatedMemorySize": 131072,
            "children": [
              {
                "planNodeId": "64",
                "nodeType": "ExchangeNode",
                "operatorType": "ExchangeOperator",
                "cpuTimeMs": 0.47,
                "outputRows": 12,
                "hasNextCalledCount": 5,
                "nextCalledCount": 4,
                "estimatedMemorySize": 131072,
                "specifiedInfo": {
                  "size_in_bytes": "3264"
                }
              },
              {
                "planNodeId": "65",
                "nodeType": "ExchangeNode",
                "operatorType": "ExchangeOperator",
                "cpuTimeMs": 25.802,
                "outputRows": 6,
                "hasNextCalledCount": 3,
                "nextCalledCount": 2,
                "estimatedMemorySize": 131072,
                "specifiedInfo": {
                  "size_in_bytes": "1632"
                }
              }
            ]
          }
        ]
      }
    },
    {
      "id": "20260722_064502_00103_1.3.0",
      "ip": "127.0.0.1:10730",
      "dataRegion": "1",
      "state": "FINISHED",
      "totalWallTimeMs": 21,
      "initDataQuerySourceCostMs": 0.232,
      "seqFileUnclosed": 0,
      "seqFileClosed": 2,
      "unseqFileUnclosed": 0,
      "unseqFileClosed": 0,
      "readyQueuedTimeMs": 0.007,
      "blockQueuedTimeMs": 0.0,
      "queryStatistics": {
        "loadBloomFilterFromCacheCount": 2,
        "loadBloomFilterFromDiskCount": 0,
        "loadBloomFilterActualIOSize": 0,
        "loadBloomFilterTimeMs": 0.02,
        "loadTimeSeriesMetadataAlignedDiskSeqCount": 4,
        "loadTimeSeriesMetadataAlignedDiskSeqTimeMs": 0.483,
        "loadTimeSeriesMetadataFromCacheCount": 18,
        "loadTimeSeriesMetadataFromDiskCount": 2,
        "loadTimeSeriesMetadataActualIOSize": 0,
        "alignedTimeSeriesMetadataModificationTimeMs": 0.061,
        "constructAlignedChunkReadersDiskCount": 4,
        "constructAlignedChunkReadersDiskTimeMs": 2.693,
        "loadChunkFromCacheCount": 18,
        "loadChunkFromDiskCount": 0,
        "loadChunkActualIOSize": 0,
        "pageReadersDecodeAlignedDiskCount": 4,
        "pageReadersDecodeAlignedDiskTimeMs": 0.22,
        "timeSeriesIndexFilteredRows": 0,
        "chunkIndexFilteredRows": 0,
        "pageIndexFilteredRows": 0,
        "rowScanFilteredRows": 0
      },
      "operators": {
        "planNodeId": "67",
        "nodeType": "IdentitySinkNode",
        "operatorType": "IdentitySinkOperator",
        "cpuTimeMs": 5.002,
        "outputRows": 12,
        "hasNextCalledCount": 9,
        "nextCalledCount": 8,
        "estimatedMemorySize": 327680,
        "specifiedInfo": {
          "DownStreamPlanNodeId": "64"
        },
        "children": [
          {
            "planNodeId": "54",
            "nodeType": "DeviceTableScanNode",
            "operatorType": "TableScanOperator",
            "cpuTimeMs": 4.94,
            "outputRows": 12,
            "hasNextCalledCount": 9,
            "nextCalledCount": 8,
            "estimatedMemorySize": 327680,
            "specifiedInfo": {
              "DeviceNumber": "4",
              "CurrentDeviceIndex": "3"
            }
          }
        ]
      }
    },
    {
      "id": "20260722_064502_00103_1.4.0",
      "ip": "127.0.0.1:10730",
      "dataRegion": "2",
      "state": "FINISHED",
      "totalWallTimeMs": 32,
      "initDataQuerySourceCostMs": 0.253,
      "seqFileUnclosed": 0,
      "seqFileClosed": 1,
      "unseqFileUnclosed": 0,
      "unseqFileClosed": 0,
      "readyQueuedTimeMs": 0.027,
      "blockQueuedTimeMs": 0.0,
      "queryStatistics": {
        "loadBloomFilterFromCacheCount": 0,
        "loadBloomFilterFromDiskCount": 0,
        "loadBloomFilterActualIOSize": 0,
        "loadBloomFilterTimeMs": 0.0,
        "loadTimeSeriesMetadataAlignedDiskSeqCount": 2,
        "loadTimeSeriesMetadataAlignedDiskSeqTimeMs": 0.188,
        "loadTimeSeriesMetadataFromCacheCount": 10,
        "loadTimeSeriesMetadataFromDiskCount": 0,
        "loadTimeSeriesMetadataActualIOSize": 0,
        "alignedTimeSeriesMetadataModificationTimeMs": 0.037,
        "constructAlignedChunkReadersDiskCount": 2,
        "constructAlignedChunkReadersDiskTimeMs": 1.807,
        "loadChunkFromCacheCount": 10,
        "loadChunkFromDiskCount": 0,
        "loadChunkActualIOSize": 0,
        "pageReadersDecodeAlignedDiskCount": 2,
        "pageReadersDecodeAlignedDiskTimeMs": 0.62,
        "timeSeriesIndexFilteredRows": 0,
        "chunkIndexFilteredRows": 0,
        "pageIndexFilteredRows": 0,
        "rowScanFilteredRows": 0
      },
      "operators": {
        "planNodeId": "68",
        "nodeType": "IdentitySinkNode",
        "operatorType": "IdentitySinkOperator",
        "cpuTimeMs": 3.652,
        "outputRows": 6,
        "hasNextCalledCount": 5,
        "nextCalledCount": 4,
        "estimatedMemorySize": 327680,
        "specifiedInfo": {
          "DownStreamPlanNodeId": "65"
        },
        "children": [
          {
            "planNodeId": "53",
            "nodeType": "DeviceTableScanNode",
            "operatorType": "TableScanOperator",
            "cpuTimeMs": 3.633,
            "outputRows": 6,
            "hasNextCalledCount": 5,
            "nextCalledCount": 4,
            "estimatedMemorySize": 327680,
            "specifiedInfo": {
              "DeviceNumber": "2",
              "CurrentDeviceIndex": "1"
            }
          }
        ]
      }
    }
  ]
}
```

## 4. 场景示例

### 4.1 CTE 查询计划

当 `EXPLAIN (FORMAT JSON)` 分析包含 materialized CTE 的查询时，输出会使用 `cteQueries` \+ `mainQuery` 的包装结构。

以[示例数据](../Reference/Sample-Data.md)中的 `table1` 和 `table2` 为例：

```SQL
EXPLAIN (FORMAT JSON)
WITH cte1 AS MATERIALIZED (SELECT * FROM table2)
SELECT * FROM table1
WHERE table1.device_id IN (SELECT device_id FROM cte1);
```

```JSON
+-----------------+
|distribution plan|
+-----------------+
{
  "cteQueries": [
    {
      "name": "cte1",
      "plan": {
        "name": "OutputNode-4",
        "id": "4",
        "properties": {
          "OutputColumns": [
            "time",
            "region",
            "plant_id",
            "device_id",
            "model_id",
            "maintenance",
            "temperature",
            "humidity",
            "status",
            "arrival_time"
          ],
          "OutputSymbols": [
            "time",
            "region",
            "plant_id",
            "device_id",
            "model_id",
            "maintenance",
            "temperature",
            "humidity",
            "status",
            "arrival_time"
          ]
        },
        "children": [
          {
            "name": "CollectNode-33",
            "id": "33",
            "children": [
              {
                "name": "ExchangeNode-40",
                "id": "40",
                "children": [
                  {
                    "name": "DeviceTableScanNode-32",
                    "id": "32",
                    "properties": {
                      "QualifiedTableName": "database1.table2",
                      "OutputSymbols": [
                        "time",
                        "region",
                        "plant_id",
                        "device_id",
                        "model_id",
                        "maintenance",
                        "temperature",
                        "humidity",
                        "status",
                        "arrival_time"
                      ],
                      "DeviceNumber": "3",
                      "ScanOrder": "ASC",
                      "PushDownOffset": "0",
                      "PushDownLimit": "0",
                      "PushDownLimitToEachDevice": "false",
                      "RegionId": "1"
                    }
                  }
                ]
              },
              {
                "name": "ExchangeNode-41",
                "id": "41",
                "children": [
                  {
                    "name": "DeviceTableScanNode-31",
                    "id": "31",
                    "properties": {
                      "QualifiedTableName": "database1.table2",
                      "OutputSymbols": [
                        "time",
                        "region",
                        "plant_id",
                        "device_id",
                        "model_id",
                        "maintenance",
                        "temperature",
                        "humidity",
                        "status",
                        "arrival_time"
                      ],
                      "DeviceNumber": "3",
                      "ScanOrder": "ASC",
                      "PushDownOffset": "0",
                      "PushDownLimit": "0",
                      "PushDownLimitToEachDevice": "false",
                      "RegionId": "2"
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  ],
  "mainQuery": {
    "name": "OutputNode-12",
    "id": "12",
    "properties": {
      "OutputColumns": [
        "time",
        "region",
        "plant_id",
        "device_id",
        "model_id",
        "maintenance",
        "temperature",
        "humidity",
        "status",
        "arrival_time"
      ],
      "OutputSymbols": [
        "time",
        "region",
        "plant_id",
        "device_id",
        "model_id",
        "maintenance",
        "temperature",
        "humidity",
        "status",
        "arrival_time"
      ]
    },
    "children": [
      {
        "name": "ProjectNode-35",
        "id": "35",
        "properties": {
          "OutputSymbols": [
            "time",
            "region",
            "plant_id",
            "device_id",
            "model_id",
            "maintenance",
            "temperature",
            "humidity",
            "status",
            "arrival_time"
          ],
          "Expressions": [
            "\"time\"",
            "\"region\"",
            "\"plant_id\"",
            "\"device_id\"",
            "\"model_id\"",
            "\"maintenance\"",
            "\"temperature\"",
            "\"humidity\"",
            "\"status\"",
            "\"arrival_time\""
          ]
        },
        "children": [
          {
            "name": "FilterNode-138",
            "id": "138",
            "properties": {
              "Predicate": "\"expr\""
            },
            "children": [
              {
                "name": "SemiJoinNode-109",
                "id": "109",
                "children": [
                  {
                    "name": "ExchangeNode-218",
                    "id": "218",
                    "children": [
                      {
                        "name": "MergeSortNode-197",
                        "id": "197",
                        "properties": {
                          "OrderBy": "{orderBy\u003d[device_id], orderings\u003d{device_id\u003dASC NULLS LAST}}"
                        },
                        "children": [
                          {
                            "name": "ExchangeNode-216",
                            "id": "216",
                            "children": [
                              {
                                "name": "DeviceTableScanNode-196",
                                "id": "196",
                                "properties": {
                                  "QualifiedTableName": "database1.table1",
                                  "OutputSymbols": [
                                    "time",
                                    "region",
                                    "plant_id",
                                    "device_id",
                                    "model_id",
                                    "maintenance",
                                    "temperature",
                                    "humidity",
                                    "status",
                                    "arrival_time"
                                  ],
                                  "DeviceNumber": "4",
                                  "ScanOrder": "ASC",
                                  "PushDownOffset": "0",
                                  "PushDownLimit": "0",
                                  "PushDownLimitToEachDevice": "true",
                                  "RegionId": "1"
                                }
                              }
                            ]
                          },
                          {
                            "name": "ExchangeNode-217",
                            "id": "217",
                            "children": [
                              {
                                "name": "DeviceTableScanNode-195",
                                "id": "195",
                                "properties": {
                                  "QualifiedTableName": "database1.table1",
                                  "OutputSymbols": [
                                    "time",
                                    "region",
                                    "plant_id",
                                    "device_id",
                                    "model_id",
                                    "maintenance",
                                    "temperature",
                                    "humidity",
                                    "status",
                                    "arrival_time"
                                  ],
                                  "DeviceNumber": "2",
                                  "ScanOrder": "ASC",
                                  "PushDownOffset": "0",
                                  "PushDownLimit": "0",
                                  "PushDownLimitToEachDevice": "true",
                                  "RegionId": "2"
                                }
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "name": "ExchangeNode-219",
                    "id": "219",
                    "children": [
                      {
                        "name": "SortNode-137",
                        "id": "137",
                        "properties": {
                          "OrderBy": "{orderBy\u003d[device_id_3], orderings\u003d{device_id_3\u003dASC NULLS FIRST}}"
                        },
                        "children": [
                          {
                            "name": "ProjectNode-6",
                            "id": "6",
                            "properties": {
                              "OutputSymbols": [
                                "device_id_3"
                              ],
                              "Expressions": [
                                "\"device_id_3\""
                              ]
                            },
                            "children": [
                              {
                                "name": "CteScanNode-2",
                                "id": "2"
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
+-----------------+
```

### 4.2 Prepared Statement 与动态 SQL

通过 `EXECUTE` 或 `EXECUTE IMMEDIATE` 分析预处理语句和动态 SQL 时，指定的输出格式会在语句展开后继续生效，不会退回默认的 `GRAPHVIZ` 或 `TEXT` 格式。

```SQL
PREPARE explain_json_stmt FROM SELECT * FROM table1 WHERE device_id = ?;
EXPLAIN (FORMAT JSON) EXECUTE explain_json_stmt USING '101';

EXPLAIN ANALYZE (FORMAT JSON) EXECUTE IMMEDIATE 'SELECT * FROM table1 WHERE device_id = ?' USING '101';
```

其中：

- `EXPLAIN (FORMAT JSON) EXECUTE ...` 返回 plan node JSON object。

- `EXPLAIN ANALYZE (FORMAT JSON) EXECUTE IMMEDIATE ...` 返回包含 `planStatistics`、`fragmentInstancesCount`、`fragmentInstances` 的 JSON object。

1. `EXPLAIN (FORMAT JSON) EXECUTE ...` 输出结构示例：

```JSON
+-----------------+
|distribution plan|
+-----------------+
{
  "name": "OutputNode-5",
  "id": "5",
  "properties": {
    "OutputColumns": [
      "time",
      "region",
      "plant_id",
      "device_id",
      "model_id",
      "maintenance",
      "temperature",
      "humidity",
      "status",
      "arrival_time"
    ],
    "OutputSymbols": [
      "time",
      "region",
      "plant_id",
      "device_id",
      "model_id",
      "maintenance",
      "temperature",
      "humidity",
      "status",
      "arrival_time"
    ]
  },
  "children": [
    {
      "name": "DeviceTableScanNode-46",
      "id": "46",
      "properties": {
        "QualifiedTableName": "database1.table1",
        "OutputSymbols": [
          "time",
          "region",
          "plant_id",
          "device_id",
          "model_id",
          "maintenance",
          "temperature",
          "humidity",
          "status",
          "arrival_time"
        ],
        "DeviceNumber": "3",
        "ScanOrder": "ASC",
        "PushDownOffset": "0",
        "PushDownLimit": "0",
        "PushDownLimitToEachDevice": "false",
        "RegionId": "1"
      }
    }
  ]
}
+-----------------+
```

2. `EXPLAIN ANALYZE (FORMAT JSON) EXECUTE IMMEDIATE ...` 输出结构示例：

```JSON
+---------------+
|Explain Analyze|
+---------------+
{
  "planStatistics": {
    "analyzeCostMs": 2.904,
    "fetchPartitionCostMs": 1.35,
    "fetchSchemaCostMs": 5.259,
    "logicalPlanCostMs": 1.123,
    "logicalOptimizationCostMs": 6.157,
    "distributionPlanCostMs": 0.571,
    "dispatchCostMs": 5.909
  },
  "fragmentInstancesCount": 1,
  "fragmentInstances": [
    {
      "id": "20260722_065558_00118_1.2.0",
      "ip": "127.0.0.1:10730",
      "dataRegion": "1",
      "state": "FINISHED",
      "totalWallTimeMs": 10,
      "initDataQuerySourceCostMs": 1.768,
      "seqFileUnclosed": 0,
      "seqFileClosed": 2,
      "unseqFileUnclosed": 0,
      "unseqFileClosed": 0,
      "readyQueuedTimeMs": 0.059,
      "blockQueuedTimeMs": 0.0,
      "queryStatistics": {
        "timeSeriesIndexFilteredRows": 0,
        "chunkIndexFilteredRows": 0,
        "pageIndexFilteredRows": 0
      },
      "operators": {
        "planNodeId": "74",
        "nodeType": "IdentitySinkNode",
        "operatorType": "IdentitySinkOperator",
        "cpuTimeMs": 9.193,
        "outputRows": 10,
        "hasNextCalledCount": 7,
        "nextCalledCount": 6,
        "estimatedMemorySize": 327680,
        "specifiedInfo": {
          "DownStreamPlanNodeId": "73"
        },
        "children": [
          {
            "planNodeId": "68",
            "nodeType": "DeviceTableScanNode",
            "operatorType": "TableScanOperator",
            "cpuTimeMs": 9.055,
            "outputRows": 10,
            "hasNextCalledCount": 7,
            "nextCalledCount": 6,
            "estimatedMemorySize": 327680,
            "specifiedInfo": {
              "DeviceNumber": "3",
              "CurrentDeviceIndex": "2"
            }
          }
        ]
      }
    }
  ]
}
+---------------+
```

### 4.3 CLI 中的 JSON 展示

CLI 对普通查询结果默认按表格输出。对于 JSON 格式的查询分析结果，如果继续把 JSON 正文放入表格单元格，每一行都会带上 `|` 边框，不利于复制、保存和 JSON 解析。

当满足以下条件时，CLI 会切换为 raw JSON 展示：

|条件|说明|
|---|---|
|结果集只有一列|避免影响普通多列查询展示|
|列名为 `distribution plan` 或 `Explain Analyze`|仅匹配 `EXPLAIN` / `EXPLAIN ANALYZE` 的结果列|
|首个结果值 trim 后以 `{` 或 `[` 开始|仅对 JSON object / array 内容启用 raw 输出|

raw JSON 展示规则：

- CLI 仍输出列名表头和外层分隔线，用户可以识别当前列为 `distribution plan` 或 `Explain Analyze`。

- JSON 正文逐行原样输出，不添加 `|` 表格边框。

- JSON 结束后输出分隔线和行数统计。

- 非 JSON 的 `EXPLAIN`、默认文本 `EXPLAIN ANALYZE`、普通查询结果仍走原有表格输出。

raw JSON 展示与普通表格输出的区别如下：

|输出类型|适用结果|展示方式|复制与解析|
|---|---|---|---|
|普通表格输出|普通查询结果、默认 `EXPLAIN`、默认 `EXPLAIN ANALYZE`|每一行内容都放在表格边框内|适合人工查看，不适合直接作为 JSON 复制解析|
|raw JSON 输出|`EXPLAIN (FORMAT JSON)`、`EXPLAIN ANALYZE (FORMAT JSON)`|保留列名表头，JSON 正文不加表格边框|适合直接复制、保存或交给 JSON parser 解析|

示例：

```SQL
start-cli.sh -sql_dialect table -e "EXPLAIN (FORMAT JSON) SELECT time, device_id, temperature FROM database1.table1"
```

```SQL
+-----------------+
|distribution plan|
+-----------------+
{
  "name": "OutputNode-4",
  "id": "4",
  "properties": {
    "OutputColumns": [
      "time",
      "device_id",
      "temperature"
    ],
    "OutputSymbols": [
      "time",
      "device_id",
      "temperature"
    ]
  },
  "children": [
    {
      "name": "CollectNode-42",
      "id": "42",
      "children": [
        {
          "name": "ExchangeNode-49",
          "id": "49",
          "children": [
            {
              "name": "DeviceTableScanNode-41",
              "id": "41",
              "properties": {
                "QualifiedTableName": "database1.table1",
                "OutputSymbols": [
                  "time",
                  "device_id",
                  "temperature"
                ],
                "DeviceNumber": "4",
                "ScanOrder": "ASC",
                "PushDownOffset": "0",
                "PushDownLimit": "0",
                "PushDownLimitToEachDevice": "false",
                "RegionId": "1"
              }
            }
          ]
        },
        {
          "name": "ExchangeNode-50",
          "id": "50",
          "children": [
            {
              "name": "DeviceTableScanNode-40",
              "id": "40",
              "properties": {
                "QualifiedTableName": "database1.table1",
                "OutputSymbols": [
                  "time",
                  "device_id",
                  "temperature"
                ],
                "DeviceNumber": "2",
                "ScanOrder": "ASC",
                "PushDownOffset": "0",
                "PushDownLimit": "0",
                "PushDownLimitToEachDevice": "false",
                "RegionId": "2"
              }
            }
          ]
        }
      ]
    }
  ]
}
+-----------------+
```

### 4.4 非法格式组合

`EXPLAIN` 和 `EXPLAIN ANALYZE` 支持的格式不同。非法格式组合会返回明确错误。

|语句|默认格式|支持格式|不支持格式|
|---|---|---|---|
|`EXPLAIN`|`GRAPHVIZ`|`GRAPHVIZ`、`JSON`|`TEXT`、`XML`、其他未知格式|
|`EXPLAIN ANALYZE`|`TEXT`|`TEXT`、`JSON`|`GRAPHVIZ`、`XML`、其他未知格式|

示例：

```SQL
EXPLAIN (FORMAT TEXT) SELECT * FROM table1;
EXPLAIN ANALYZE (FORMAT GRAPHVIZ) SELECT * FROM table1;
EXPLAIN (FORMAT XML) SELECT * FROM table1;
```

对应报错：

```SQL
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701: Invalid EXPLAIN format: TEXT. Supported formats: GRAPHVIZ, JSON
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701: Invalid EXPLAIN ANALYZE format: GRAPHVIZ. Supported formats: TEXT, JSON
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701: Invalid EXPLAIN format: XML. Supported formats: GRAPHVIZ, JSON
```

## 5. 常见问题

### 5.1 查询超时时怎么办？

`EXPLAIN ANALYZE` 会真实执行查询，因此也可能在查询超时时无法返回完整结果。为辅助排查，IoTDB 会按一定时间间隔将当前分析结果以文本形式写入专用日志；日志间隔根据查询超时时间计算，可保证超时前至少记录两次结果。

遇到超时时，按以下顺序处理：

1. 查看 `logs/log_explain_analyze.log` 中对应查询的阶段性分析结果。

2. 如果日志中没有结果，检查升级时是否只替换了 lib 包，而未同步替换 `conf/logback-datanode.xml`。

3. 替换配置后无需重启。等待配置热加载完成，再执行 `EXPLAIN ANALYZE VERBOSE`。

### 5.2 WALL TIME 和 CPU TIME 有什么区别？

CPU 时间指程序在执行过程中实际占用 CPU 进行计算的时间，表示程序实际消耗的处理器资源。

墙上时间指从程序开始执行到结束的真实物理时间，包括资源等待时间。

`WALL TIME < CPU TIME` 常见于并行执行场景。例如一个查询分片被两个线程并行执行，物理时间过去 10 秒，但两个线程各占用一个 CPU 核运行 10 秒，则 CPU TIME 约为 20 秒，WALL TIME 约为 10 秒。

`WALL TIME > CPU TIME` 常见于等待资源场景。例如查询分片因内存不足或等待上游数据进入 blocked queue，或者因查询线程资源不足进入 ready queue。等待期间不占用 CPU，但物理时间仍在流逝。

### 5.3 EXPLAIN ANALYZE 是否有额外开销？

统计信息采集本身几乎没有显著的额外开销。`EXPLAIN ANALYZE` 算子会收集原查询已有的统计信息，并通过 `next` 遍历但不打印查询结果，因此与直接执行同一查询的耗时通常没有显著差别。

需要注意的是，被分析的查询仍会完整执行并正常消耗 CPU、内存和 IO 资源。评估生产环境影响时，应以原查询本身的资源消耗为准。

### 5.4 IO 耗时主要关注哪些指标？

涉及 IO 耗时的指标主要包括 `loadBloomFilterActualIOSize`、`loadBloomFilterTime`、`loadTimeSeriesMetadataAlignedDiskSeqTime`、`loadTimeSeriesMetadataAlignedDiskUnseqTime`、`loadTimeSeriesMetadataActualIOSize`、`alignedTimeSeriesMetadataModificationTime`、`constructAlignedChunkReadersDiskTime`、`loadChunkActualIOSize`。

TimeSeriesMetadata 的加载分别统计顺序文件和乱序文件，但 Chunk 的读取暂时未分开统计顺序和乱序比例，可以通过 TimeSeriesMetadata 的顺乱序比例进行估算。

### 5.5 乱序数据对查询性能的影响如何观测？

乱序数据主要产生两类影响：

1. 查询时需要在内存中多做一次归并排序。

2. 乱序数据会产生数据块间的时间范围重叠，导致部分统计信息无法直接用于跳过不满足条件的数据块，或无法直接计算聚合值。

当前没有单独针对乱序数据影响的直接观测指标。通常可以在存在乱序数据时执行一次查询，待乱序数据合并完成后再次执行查询，通过前后耗时对比进行评估。
