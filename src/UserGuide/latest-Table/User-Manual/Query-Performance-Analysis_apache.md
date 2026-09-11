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
# Query Performance Analysis

## 1. Overview

Query analysis helps users understand the execution mechanism and performance bottlenecks of queries, enabling query optimization and performance tuning. The IoTDB table model provides two types of query analysis statements:

- `EXPLAIN`: Previews the execution plan of a query SQL, showing how IoTDB organizes data retrieval and processing.

- `EXPLAIN ANALYZE`: Actually executes the query on top of `EXPLAIN`, and displays the time, resource consumption, and operator statistics during query execution.

The default output of `EXPLAIN` and `EXPLAIN ANALYZE` is designed for human reading and is suitable for direct viewing in the CLI. For scenarios that require stable parsing of query plans or execution statistics, such as Web Console, CI regression testing, and automated performance diagnosis systems, you can use the JSON output format to obtain structured results. The JSON format is supported since V2.0.11.

### 1.1 Comparison of Query Analysis Methods

Compared with Arthas sampling and other troubleshooting methods, `EXPLAIN ANALYZE` requires no additional components and can perform distributed tracing on a single SQL, making it more suitable for locating performance issues of specific queries.

|Method|Installation Difficulty|Business Impact|Functional Scope|
|---|---|---|---|
|`EXPLAIN ANALYZE` statement|Low. No additional components required, built-in IoTDB SQL statement|Low. Only affects the single query being analyzed, no impact on other online workloads|Supports distributed, can trace a single SQL|
|Arthas sampling|Medium. Requires installing the Java Arthas tool|High. CPU sampling may affect online business response speed|Does not support distributed, only supports analysis of overall query load and time consumption of the database|

## 2. EXPLAIN

### 2.1 Syntax

The `EXPLAIN` command is used to view the distributed execution plan of a SQL query. The execution plan is displayed as an operator tree, describing how IoTDB will execute the query.

```SQL
EXPLAIN [(FORMAT { GRAPHVIZ | JSON })] <SELECT_STATEMENT>
```

Where:

|Parameter|Description|
|---|---|
|`SELECT_STATEMENT`|The query statement to be analyzed|
|`FORMAT GRAPHVIZ`|Outputs the distributed plan in the default graphical text form, suitable for human reading|
|`FORMAT JSON`|Outputs the distributed plan as a JSON object, suitable for programmatic parsing (supported since V2.0.11)|

The format name after `FORMAT` is case-insensitive, for example, `FORMAT json` is equivalent to `FORMAT JSON`.

### 2.2 Default GRAPHVIZ Format

The default format of `EXPLAIN` is `GRAPHVIZ`. After execution, you will get the `distribution plan` result column.

Taking `table1` in the [sample data](../Reference/Sample-Data.md) as an example, the following two statements are equivalent:

```SQL
EXPLAIN SELECT * FROM table1;
EXPLAIN (FORMAT GRAPHVIZ) SELECT * FROM table1;
```

After executing the above statements, the output is as follows: IoTDB reads data from different data partitions through `DeviceTableScanNode` nodes, and aggregates and returns the results through the `Collect` operator.

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

### 2.3 JSON Format

Using `EXPLAIN (FORMAT JSON)` returns the JSON representation of the distributed plan tree. The result set is a single-column output, and in JSON format returns a single row with a single JSON object, making it convenient for JDBC clients or automation tools to read directly.

The top-level structure of `EXPLAIN (FORMAT JSON)` varies with the query type:

|Scenario|Top-level Structure|Description|
|---|---|---|
|Regular query|plan node JSON object|The top-level is directly a plan node object such as `OutputNode`|
|Query containing materialized CTE|wrapper JSON object|The top-level contains `cteQueries` and `mainQuery`, used to retain both the CTE subquery plan and the main query plan|

Each plan node is output as a JSON object. The basic fields are as follows:

|Field|Type/Occurrence|Description|
|---|---|---|
|`name`|string|The display name formed by concatenating the node type and plan node id, for example `OutputNode-4`|
|`id`|string|plan node id|
|`properties`|object|Node properties. Only output when the node has displayable properties|
|`children`|array|Array of child nodes. Only output when the node has child nodes|

Common plan node properties include:

|Node Type|Main Fields/Properties|
|---|---|
|`OutputNode`|`OutputColumns`, `OutputSymbols`|
|`TableScanNode` / `DeviceTableScanNode`|`QualifiedTableName`, `OutputSymbols`, `DeviceNumber`, `ScanOrder`, `TimePredicate`, `PushDownPredicate`, `PushDownOffset`, `PushDownLimit`, `PushDownLimitToEachDevice`, `RegionId`|
|`TreeDeviceViewScanNode`|In addition to table scan properties, adds `TreeDB`, `MeasurementToColumnName`|
|`AggregationNode`|`OutputSymbols`, `Aggregators`, `GroupingKeys`, `Streamable`, `PreGroupedSymbols`, `Step`|
|`FilterNode`|`Predicate`|
|`ProjectNode`|`OutputSymbols`, `Expressions`|
|`LimitNode` / `OffsetNode`|`Count`|
|`SortNode` / `MergeSortNode`|`OrderBy`|
|`JoinNode`|`JoinType`, `Criteria`, `OutputSymbols`|
|`UnionNode`|`OutputSymbols`|
|`ExplainAnalyzeNode`|`ChildPermittedOutputs`|

When the query contains a materialized CTE, the JSON top-level is no longer a single plan node directly, but is wrapped as:

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

Where `cteQueries[].plan` and `mainQuery` are both plan node JSON objects. This structure is used to retain both the CTE subquery plan and the main query plan.

Taking `table1` in the [sample data](../Reference/Sample-Data.md) as an example:

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

### 3.1 Syntax

`EXPLAIN ANALYZE` is a performance analysis SQL built into the IoTDB query engine. Unlike `EXPLAIN`, it actually executes the corresponding query plan and collects execution information, which can be used to track the specific performance distribution of a query, assisting in resource observation, performance tuning, and exception analysis.

```SQL
EXPLAIN ANALYZE [VERBOSE] [(FORMAT { TEXT | JSON })] <SELECT_STATEMENT>
```

Where:

|Parameter|Description|
|---|---|
|`SELECT_STATEMENT`|The query statement to be analyzed|
|`VERBOSE`|Prints more detailed analysis results. When not specified, some fine-grained statistics are omitted|
|`FORMAT TEXT`|Outputs analysis results in the default text form, suitable for human reading|
|`FORMAT JSON`|Outputs analysis results as a JSON object, suitable for programmatic parsing (supported since V2.0.11)|

### 3.2 Default TEXT Format

The default format of `EXPLAIN ANALYZE` is `TEXT`. After execution, you will get the `Explain Analyze` result column. The results consist of query planning statistics, fragment instance statistics, data reading statistics, and operator tree statistics.

- **Query Planning Statistics**

`QueryStatistics` contains query-level statistics:

|Field|Type/Occurrence|Description|
|---|---|---|
|`Analyze Cost`|Query planning statistics|Time consumed in the SQL analysis phase|
|`Fetch Partition Cost`|Query planning statistics|Time consumed fetching the partition table|
|`Fetch Schema Cost`|Query planning statistics|Time consumed fetching metadata and permission validation|
|`Logical Plan Cost`|Query planning statistics|Time consumed building the logical plan|
|`Logical Optimization Cost`|Query planning statistics|Time consumed in logical plan optimization|
|`Distribution Plan Cost`|Query planning statistics|Time consumed building the distributed plan|
|`Dispatch Cost`|Query planning statistics|Time consumed dispatching fragment instances|
|`Fragment Instances Count`|Query planning statistics|Total number of query fragments; each fragment's information is output in sequence|

- **Fragment Instance Statistics**

`FragmentInstance` is the encapsulation of an IoTDB query fragment. Each query fragment outputs a copy of execution information, mainly including fragment statistics and operator information.

Fragment statistics include:

|Field|Type/Occurrence|Description|
|---|---|---|
|`Total Wall Time`|Fragment statistics|Physical time from when the fragment starts execution to when it finishes|
|`Cost of initDataQuerySource`|Fragment statistics|Time consumed building the query file list|
|`Seq File(unclosed)`|Fragment statistics|Number of unclosed sequential files|
|`Seq File(closed)`|Fragment statistics|Number of closed sequential files|
|`UnSeq File(unclosed)`|Fragment statistics|Number of unclosed out-of-order files|
|`UnSeq File(closed)`|Fragment statistics|Number of closed out-of-order files|
|`ready queued time`|Fragment statistics|Total time all tasks of the query fragment spent in the ready queue|
|`blocked queued time`|Fragment statistics|Total time all tasks of the query fragment spent in the blocked queue|

- **Data Reading Statistics**

`Query Statistics` detail fields include:

|Field|Type/Occurrence|Description|
|---|---|---|
|`loadBloomFilterFromCacheCount`|BloomFilter|Number of BloomFilterCache hits|
|`loadBloomFilterFromDiskCount`|BloomFilter|Number of times BloomFilter was read from disk|
|`loadBloomFilterActualIOSize`|BloomFilter|Disk IO generated when reading BloomFilter from disk, in bytes|
|`loadBloomFilterTime`|BloomFilter|Total time spent reading BloomFilter and computing whether a series exists, in ms|
|`loadTimeSeriesMetadataDiskSeqCount`|TimeSeriesMetadata|Number of TimeSeriesMetadata loaded from closed sequential files|
|`loadTimeSeriesMetadataDiskUnSeqCount`|TimeSeriesMetadata|Number of TimeSeriesMetadata loaded from closed out-of-order files|
|`loadTimeSeriesMetadataDiskSeqTime`|TimeSeriesMetadata|Time consumed loading TimeSeriesMetadata from closed sequential files|
|`loadTimeSeriesMetadataDiskUnSeqTime`|TimeSeriesMetadata|Time consumed loading TimeSeriesMetadata from closed out-of-order files|
|`loadTimeSeriesMetadataFromCacheCount`|TimeSeriesMetadata|Number of TimeSeriesMetadataCache hits|
|`loadTimeSeriesMetadataFromDiskCount`|TimeSeriesMetadata|Number of times TimeSeriesMetadata was read from disk|
|`loadTimeSeriesMetadataActualIOSize`|TimeSeriesMetadata|Disk IO generated when reading TimeSeriesMetadata from disk, in bytes|
|`TimeSeriesMetadataModificationTime`|Mods file|Time consumed reading mods files|
|`constructAlignedChunkReadersDiskCount`|Chunk|Number of times ChunkReader was constructed|
|`constructAlignedChunkReadersDiskTime`|Chunk|Total time consumed constructing ChunkReader, including disk IO and decompression|
|`pageReadersDecodeAlignedDiskCount`|Chunk|Number of pages decoded|
|`pageReadersDecodeAlignedDiskTime`|Chunk|Total time consumed decoding pages|
|`loadChunkFromCacheCount`|Chunk|Number of ChunkCache hits|
|`loadChunkFromDiskCount`|Chunk|Number of times Chunk was read from disk|
|`loadChunkActualIOSize`|Chunk|Disk IO generated when reading Chunk from disk, in bytes|

- **Operator Tree Statistics**

Operator tree statistics include:

|Field|Type/Occurrence|Description|
|---|---|---|
|`CPU Time`|Operator tree statistics|CPU execution time of the current operator|
|`output`|Operator tree statistics|Number of output rows of the current operator|
|`HasNext() Called Count`|Operator tree statistics|Number of times the current operator's `HasNext()` interface was called|
|`Next() Called Count`|Operator tree statistics|Number of times the current operator's `Next()` interface was called|
|`Estimated Memory Size`|Operator tree statistics|Estimated memory usage of the current operator|
|Node-specific statistics|Operator tree statistics|Custom statistics fields output by different operators, such as `DeviceNumber`, `CurrentDeviceIndex`, `OutputPlanNodeId`, `size_in_bytes`, etc.|

Common node-specific statistics fields include:

|Field|Type/Occurrence|Description|
|---|---|---|
|`DeviceNumber`|`TableScan` related nodes|Number of devices involved in the current table scan|
|`CurrentDeviceIndex`|`TableScan` related nodes|Index of the device currently being scanned|
|`OutputPlanNodeId`|sink node|The downstream data-receiving node corresponding to the sink node|
|`size_in_bytes`|exchange node|Number of bytes of TsBlock received by the exchange node, only counting data size|
|`TimeSeriesIndexFilteredRows`|table scan node when filter is pushed down to table scan|Number of data rows filtered out by series metadata|
|`ChunkIndexFilteredRows`|table scan node when filter is pushed down to table scan|Number of data rows filtered out by chunk metadata|
|`PageIndexFilteredRows`|table scan node when filter is pushed down to table scan|Number of data rows filtered out by page header internal statistics|
|`RowScanFilteredRows`|table scan node when filter is pushed down to table scan and `VERBOSE` is used|Number of rows filtered out during row-by-row data checking|

The actual output fields vary with the query type, the operators involved, whether `VERBOSE` is used, and whether filter pushdown is triggered. When the corresponding logic is not triggered, the relevant fields may not appear in the result.

- **Text Output Example**

Taking `table1` in the [sample data](../Reference/Sample-Data.md) as an example, the following two statements are equivalent:

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

- **VERBOSE Output Example**

Using `VERBOSE` you can view finer-grained data reading and filtering statistics:

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
|Logical Plan Cost: 0.491 ms                                                                                             |
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
|    loadBloomFilterFromDiskCount: 0                                                                                     |
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
|            CPU Time: 0.569 ms                                                                                          |
|            output: 12 rows                                                                                              |
|            HasNext() Called Count: 5                                                                                    |
|            Next() Called Count: 4                                                                                       |
|            Estimated Memory Size: 131072                                                                                |
|            size_in_bytes: 3264                                                                                          |
|        [PlanNodeId 65]: ExchangeNode(ExchangeOperator)                                                                  |
|            CPU Time: 0.354 ms                                                                                          |
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
|    loadBloomFilterFromDiskCount: 0                                                                                     |
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
|    loadBloomFilterFromDiskCount: 0                                                                                     |
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

### 3.3 JSON Format

Using `EXPLAIN ANALYZE (FORMAT JSON)` returns structured information such as plan phase time consumption, fragment instance statistics, and operator statistics. The JSON format is supported since V2.0.11.

#### 3.3.1 Default JSON Output

```SQL
EXPLAIN ANALYZE (FORMAT JSON) SELECT * FROM t1;
```

The top-level JSON structure is as follows:

|Field|Type/Occurrence|Description|
|---|---|---|
|`planStatistics`|object|Time consumption of query analysis, partition fetching, schema fetching, logical planning, logical optimization, distributed planning, dispatch, and other phases|
|`fragmentInstancesCount`|number|Number of fragment instances for which statistics are returned|
|`fragmentInstances`|array|Execution statistics of each fragment instance|

The main fields of `planStatistics` are as follows:

|Field|Type/Occurrence|Description|
|---|---|---|
|`analyzeCostMs`|planStatistics|SQL analysis time, in ms|
|`fetchPartitionCostMs`|planStatistics|Time to fetch partition information, in ms|
|`fetchSchemaCostMs`|planStatistics|Time to fetch schema information, in ms|
|`logicalPlanCostMs`|planStatistics|Logical plan generation time, in ms|
|`logicalOptimizationCostMs`|planStatistics|Logical optimization time, in ms|
|`distributionPlanCostMs`|planStatistics|Distributed plan generation time, in ms|
|`dispatchCostMs`|planStatistics|Fragment dispatch time, in ms|

The main fields of `fragmentInstances[]` are as follows:

|Field|Type/Occurrence|Description|
|---|---|---|
|`id`|fragmentInstances[]|fragment instance id|
|`ip`|fragmentInstances[]|IP of the node that executed this fragment instance|
|`dataRegion`|fragmentInstances[]|Corresponding DataRegion|
|`state`|fragmentInstances[]|Final state of the fragment instance|
|`totalWallTimeMs`|fragmentInstances[]|Total wall time, in ms|
|`initDataQuerySourceCostMs`|fragmentInstances[]|Data source initialization time, in ms|
|`initDataQuerySourceRetryCount`|fragmentInstances[]|Number of data source initialization retries. Only output when greater than 0|
|`seqFileUnclosed`, `seqFileClosed`, `unseqFileUnclosed`, `unseqFileClosed`|fragmentInstances[]|Number of sequential and out-of-order files involved|
|`readyQueuedTimeMs`, `blockQueuedTimeMs`|fragmentInstances[]|Ready / block queue waiting time, in ms|
|`queryStatistics`|fragmentInstances[]|Query statistics such as scanning, filtering, chunk/page reader|
|`operators`|fragmentInstances[]|Operator tree and execution statistics of each operator|

`operators` is a tree structure corresponding to the plan tree. The main fields are as follows:

|Field|Type/Occurrence|Description|
|---|---|---|
|`planNodeId`|operators|Corresponding plan node id|
|`nodeType`|operators|plan node type|
|`operatorType`|operators|Actual executed operator type|
|`count`|operators|Operator statistics aggregation count. Only output when present|
|`cpuTimeMs`|operators|Operator CPU execution time, in ms|
|`outputRows`|operators|Number of output rows|
|`hasNextCalledCount`, `nextCalledCount`|operators|Number of operator iteration calls|
|`estimatedMemorySize`|operators|Estimated memory usage. Only output when non-zero|
|`specifiedInfo`|operators|Operator-specific statistics. Only output when non-empty|
|`children`|operators|Child operator array|

Taking `table1` in the [sample data](../Reference/Sample-Data.md) as an example:

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

#### 3.3.2 VERBOSE JSON Output

When using `EXPLAIN ANALYZE VERBOSE (FORMAT JSON)`, the top-level structure is the same as the non-verbose JSON, but `queryStatistics` supplements finer-grained statistics beyond the basic filtered row counts, including bloom filter, time series metadata, chunk, page reader, modification, and actual IO size information.

The main differences between `VERBOSE` and non-`VERBOSE` JSON output are as follows:

|Output Mode|Top-level Structure|`queryStatistics` Field Granularity|Typical Fields|
|---|---|---|---|
|`EXPLAIN ANALYZE (FORMAT JSON)`|`planStatistics`, `fragmentInstancesCount`, `fragmentInstances`|Default statistics fields|`timeSeriesIndexFilteredRows`, `chunkIndexFilteredRows`, `pageIndexFilteredRows`|
|`EXPLAIN ANALYZE VERBOSE (FORMAT JSON)`|Same as non-`VERBOSE`|More detailed scanning, reading, and filtering statistics|`loadBloomFilterFromCacheCount`, `loadTimeSeriesMetadataFromCacheCount`, `loadChunkFromDiskCount`, `pageReadersDecodeAlignedMemCount`, `rowScanFilteredRows`|

Taking `table1` in the [sample data](../Reference/Sample-Data.md) as an example:

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

## 4. Scenario Examples

### 4.1 CTE Query Plan

When `EXPLAIN (FORMAT JSON)` analyzes a query containing a materialized CTE, the output uses the wrapped structure of `cteQueries` + `mainQuery`.

Taking `table1` and `table2` in the [sample data](../Reference/Sample-Data.md) as an example:

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

### 4.2 Prepared Statement and Dynamic SQL

When analyzing prepared statements and dynamic SQL via `EXECUTE` or `EXECUTE IMMEDIATE`, the specified output format continues to take effect after the statement is expanded, and will not fall back to the default `GRAPHVIZ` or `TEXT` format.

```SQL
PREPARE explain_json_stmt FROM SELECT * FROM table1 WHERE device_id = ?;
EXPLAIN (FORMAT JSON) EXECUTE explain_json_stmt USING '101';

EXPLAIN ANALYZE (FORMAT JSON) EXECUTE IMMEDIATE 'SELECT * FROM table1 WHERE device_id = ?' USING '101';
```

Where:

- `EXPLAIN (FORMAT JSON) EXECUTE ...` returns a plan node JSON object.

- `EXPLAIN ANALYZE (FORMAT JSON) EXECUTE IMMEDIATE ...` returns a JSON object containing `planStatistics`, `fragmentInstancesCount`, and `fragmentInstances`.

1. `EXPLAIN (FORMAT JSON) EXECUTE ...` output structure example:

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

2. `EXPLAIN ANALYZE (FORMAT JSON) EXECUTE IMMEDIATE ...` output structure example:

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

### 4.3 JSON Display in CLI

The CLI outputs regular query results in tabular format by default. For JSON-format query analysis results, if the JSON body continues to be placed in table cells, each row would carry `|` borders, which is not conducive to copying, saving, and JSON parsing.

The CLI switches to raw JSON display when the following conditions are met:

|Condition|Description|
|---|---|
|The result set has only one column|Avoids affecting normal multi-column query display|
|The column name is `distribution plan` or `Explain Analyze`|Only matches the result columns of `EXPLAIN` / `EXPLAIN ANALYZE`|
|The first result value trimmed starts with `{` or `[`|Only enables raw output for JSON object / array content|

Raw JSON display rules:

- The CLI still outputs the column name header and outer separator line, so users can identify the current column as `distribution plan` or `Explain Analyze`.

- The JSON body is output line by line as-is, without adding `|` table borders.

- After the JSON ends, a separator line and row count statistics are output.

- Non-JSON `EXPLAIN`, default text `EXPLAIN ANALYZE`, and regular query results still use the original table output.

The differences between raw JSON output and regular table output are as follows:

|Output Type|Applicable Result|Display Method|Copy and Parse|
|---|---|---|---|
|Regular table output|Regular query results, default `EXPLAIN`, default `EXPLAIN ANALYZE`|Each row's content is placed inside table borders|Suitable for human viewing, not suitable for direct JSON copy parsing|
|Raw JSON output|`EXPLAIN (FORMAT JSON)`, `EXPLAIN ANALYZE (FORMAT JSON)`|Retains column name header, JSON body has no table borders|Suitable for direct copying, saving, or handing to a JSON parser|

Example:

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

### 4.4 Illegal Format Combinations

`EXPLAIN` and `EXPLAIN ANALYZE` support different formats. Illegal format combinations return a clear error.

|Statement|Default Format|Supported Formats|Unsupported Formats|
|---|---|---|---|
|`EXPLAIN`|`GRAPHVIZ`|`GRAPHVIZ`, `JSON`|`TEXT`, `XML`, other unknown formats|
|`EXPLAIN ANALYZE`|`TEXT`|`TEXT`, `JSON`|`GRAPHVIZ`, `XML`, other unknown formats|

Example:

```SQL
EXPLAIN (FORMAT TEXT) SELECT * FROM table1;
EXPLAIN ANALYZE (FORMAT GRAPHVIZ) SELECT * FROM table1;
EXPLAIN (FORMAT XML) SELECT * FROM table1;
```

Corresponding errors:

```SQL
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701: Invalid EXPLAIN format: TEXT. Supported formats: GRAPHVIZ, JSON
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701: Invalid EXPLAIN ANALYZE format: GRAPHVIZ. Supported formats: TEXT, JSON
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701: Invalid EXPLAIN format: XML. Supported formats: GRAPHVIZ, JSON
```

## 5. FAQ

### 5.1 What to do when a query times out?

`EXPLAIN ANALYZE` actually executes the query, so it may also fail to return complete results when the query times out. To assist troubleshooting, IoTDB writes the current analysis results to a dedicated log in text form at certain time intervals; the log interval is calculated based on the query timeout, ensuring at least two result records before timeout.

When encountering a timeout, handle it in the following order:

1. Check the staged analysis results for the corresponding query in `logs/log_explain_analyze.log`.

2. If there are no results in the log, check whether only the lib package was replaced during the upgrade, and `conf/logback-datanode.xml` was not replaced synchronously.

3. After replacing the configuration, no restart is required. Wait for the configuration hot reload to complete, then execute `EXPLAIN ANALYZE VERBOSE`.

### 5.2 What is the difference between WALL TIME and CPU TIME?

CPU time refers to the time the program actually occupies the CPU for computation during execution, representing the processor resources actually consumed by the program.

Wall time refers to the real physical time from when the program starts execution to when it ends, including resource waiting time.

`WALL TIME < CPU TIME` is common in parallel execution scenarios. For example, if a query fragment is executed in parallel by two threads, 10 seconds of physical time pass, but the two threads each occupy one CPU core running for 10 seconds, then the CPU TIME is about 20 seconds, and the WALL TIME is about 10 seconds.

`WALL TIME > CPU TIME` is common in resource waiting scenarios. For example, a query fragment enters the blocked queue due to insufficient memory or waiting for upstream data, or enters the ready queue due to insufficient query thread resources. During the wait, no CPU is occupied, but physical time still passes.

### 5.3 Does EXPLAIN ANALYZE have additional overhead?

The statistics collection itself has almost no significant additional overhead. The `EXPLAIN ANALYZE` operator collects the statistics already available from the original query, and traverses via `next` without printing the query results, so there is usually no significant difference in time consumption compared to directly executing the same query.

Note that the analyzed query is still fully executed and normally consumes CPU, memory, and IO resources. When evaluating the impact on the production environment, refer to the resource consumption of the original query itself.

### 5.4 Which metrics should I focus on for IO time consumption?

Metrics involving IO time consumption mainly include `loadBloomFilterActualIOSize`, `loadBloomFilterTime`, `loadTimeSeriesMetadataAlignedDiskSeqTime`, `loadTimeSeriesMetadataAlignedDiskUnseqTime`, `loadTimeSeriesMetadataActualIOSize`, `alignedTimeSeriesMetadataModificationTime`, `constructAlignedChunkReadersDiskTime`, and `loadChunkActualIOSize`.

TimeSeriesMetadata loading statistics are separated for sequential and out-of-order files, but Chunk reading is not yet separately counted for sequential and out-of-order proportions; this can be estimated through the sequential/out-of-order ratio of TimeSeriesMetadata.

### 5.5 How to observe the impact of out-of-order data on query performance?

Out-of-order data mainly produces two types of impact:

1. During query, an additional merge sort needs to be done in memory.

2. Out-of-order data produces time range overlaps between data blocks, causing some statistics to be unusable for directly skipping data blocks that do not meet conditions, or for directly calculating aggregate values.

Currently, there is no direct observation metric specifically for the impact of out-of-order data. Usually, you can execute a query once when out-of-order data exists, and then execute the query again after the out-of-order data is merged, and evaluate by comparing the time consumption before and after.
