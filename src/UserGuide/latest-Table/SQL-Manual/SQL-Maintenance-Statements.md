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

# Management Statements

## 1.  Status Inspection

### 1.1 View Current Tree/Table Model

**Syntax:**

```SQL
showCurrentSqlDialectStatement
    : SHOW CURRENT_SQL_DIALECT
    ;
```

**Example:**

```SQL
IoTDB> SHOW CURRENT_SQL_DIALECT
+-----------------+
|CurrentSqlDialect|
+-----------------+
|            TABLE|
+-----------------+
```

### 1.2 View Current User

**Syntax:**

```SQL
showCurrentUserStatement
    : SHOW CURRENT_USER
    ;
```

**Example:**

```SQL
IoTDB> SHOW CURRENT_USER
+-----------+
|CurrentUser|
+-----------+
|       root|
+-----------+
```

### 1.3 View Connected Database

**Syntax:**

```SQL
showCurrentDatabaseStatement
    : SHOW CURRENT_DATABASE
    ;
```

**Example:**

```SQL
IoTDB> SHOW CURRENT_DATABASE;
+---------------+
|CurrentDatabase|
+---------------+
|           null|
+---------------+

IoTDB> USE test;

IoTDB> SHOW CURRENT_DATABASE;
+---------------+
|CurrentDatabase|
+---------------+
|           test|
+---------------+
```

### 1.4 View Cluster Version

**Syntax:**

```SQL
showVersionStatement
    : SHOW VERSION
    ;
```

**Example:**

```SQL
IoTDB> SHOW VERSION
+-------+---------+
|Version|BuildInfo|
+-------+---------+
|2.0.1.2|  1ca4008|
+-------+---------+
```

### 1.5 View Key Cluster Parameters

**Syntax:**

```SQL
showVariablesStatement
    : SHOW VARIABLES
    ;
```

**Example:**

```SQL
IoTDB> SHOW VARIABLES
+----------------------------------+-----------------------------------------------------------------+
|                          Variable|                                                            Value|
+----------------------------------+-----------------------------------------------------------------+
|                       ClusterName|                                                   defaultCluster|
|             DataReplicationFactor|                                                                1|
|           SchemaReplicationFactor|                                                                1|
|  DataRegionConsensusProtocolClass|                      org.apache.iotdb.consensus.iot.IoTConsensus|
|SchemaRegionConsensusProtocolClass|                  org.apache.iotdb.consensus.ratis.RatisConsensus|
|  ConfigNodeConsensusProtocolClass|                  org.apache.iotdb.consensus.ratis.RatisConsensus|
|               TimePartitionOrigin|                                                                0|
|             TimePartitionInterval|                                                        604800000|
|              ReadConsistencyLevel|                                                           strong|
|           SchemaRegionPerDataNode|                                                                1|
|             DataRegionPerDataNode|                                                                0|
|                     SeriesSlotNum|                                                             1000|
|           SeriesSlotExecutorClass|org.apache.iotdb.commons.partition.executor.hash.BKDRHashExecutor|
|         DiskSpaceWarningThreshold|                                                             0.05|
|                TimestampPrecision|                                                               ms|
+----------------------------------+-----------------------------------------------------------------+
```

### 1.6 View Cluster ID

**Syntax:**

```SQL
showClusterIdStatement
    : SHOW (CLUSTERID | CLUSTER_ID)
    ;
```

**Example:**

```SQL
IoTDB> SHOW CLUSTER_ID
+------------------------------------+
|                           ClusterId|
+------------------------------------+
|40163007-9ec1-4455-aa36-8055d740fcda|
```

### 1.7  View Server Time

Shows time of the DataNode server directly connected to client

**Syntax:**

```SQL
showCurrentTimestampStatement
    : SHOW CURRENT_TIMESTAMP
    ;
```

**Example:**

```SQL
IoTDB> SHOW CURRENT_TIMESTAMP
+-----------------------------+
|             CurrentTimestamp|
+-----------------------------+
|2025-02-17T11:11:52.987+08:00|
+-----------------------------+
```

## 2. Status Configuration

### 2.1 Set Connection Tree/Table Model

**Syntax:**

```SQL
SET SQL_DIALECT EQ (TABLE | TREE)
```

**Example:**

```SQL
IoTDB> SET SQL_DIALECT=TABLE
IoTDB> SHOW CURRENT_SQL_DIALECT
+-----------------+
|CurrentSqlDialect|
+-----------------+
|            TABLE|
+-----------------+
```

### 2.2 Update Configuration Items

**Syntax:**

```SQL
setConfigurationStatement
    : SET CONFIGURATION propertyAssignments (ON INTEGER_VALUE)?
    ;

propertyAssignments
    : property (',' property)*
    ;
    
property
    : identifier EQ propertyValue
    ;

propertyValue
    : DEFAULT
    | expression
    ;
```

**Example:**

```SQL
IoTDB> SET CONFIGURATION a='1',b='1' ON 1;
```

### 2.3 Load Manually Modified Configuration

**Syntax:**

```SQL
loadConfigurationStatement
    : LOAD CONFIGURATION localOrClusterMode?
    ;
    
localOrClusterMode
    : (ON (LOCAL | CLUSTER))
    ;
```

**Example:**

```SQL
IoTDB> LOAD CONFIGURATION ON LOCAL;
```

### 2.4 Set System Status

**Syntax:**

```SQL
setSystemStatusStatement
    : SET SYSTEM TO (READONLY | RUNNING) localOrClusterMode?
    ;    
    
localOrClusterMode
    : (ON (LOCAL | CLUSTER))
    ;
```

**Example:**

```SQL
IoTDB> SET SYSTEM TO READONLY ON CLUSTER;
```

## 3. Data Management

### 3.1 Flush Memory Table to Disk

**Syntax:**

```SQL
flushStatement
    : FLUSH identifier? (',' identifier)* booleanValue? localOrClusterMode?
    ;

booleanValue
    : TRUE | FALSE
    ;

localOrClusterMode
    : (ON (LOCAL | CLUSTER))
    ;
```

**Example:**

```SQL
IoTDB> FLUSH test_db TRUE ON LOCAL;
```

### 3.2 Clear DataNode Cache

**Syntax:**

```SQL
clearCacheStatement
    : CLEAR clearCacheOptions? CACHE localOrClusterMode?
    ;

clearCacheOptions
    : ATTRIBUTE
    | QUERY
    | ALL
    ;

localOrClusterMode
    : (ON (LOCAL | CLUSTER))
    ;
```

**Example:**

```SQL
IoTDB> CLEAR ALL CACHE ON LOCAL;
```

## 4. Data Repair

### 4.1 Start Background TsFile Repair

**Syntax:**

```SQL
startRepairDataStatement
    : START REPAIR DATA localOrClusterMode?
    ;
    
localOrClusterMode
    : (ON (LOCAL | CLUSTER))
    ;
```

**Example:**

```SQL
IoTDB> START REPAIR DATA ON CLUSTER;
```

### 4.2 Pause TsFile Repair

**Syntax:**

```SQL
stopRepairDataStatement
    : STOP REPAIR DATA localOrClusterMode?
    ;
    
localOrClusterMode
    : (ON (LOCAL | CLUSTER))
    ;
```

**Example:**

```SQL
IoTDB> STOP REPAIR DATA ON CLUSTER;
```

## 5. Query Operations

### 5.1 View Active Queries

**Syntax:**

```SQL
showQueriesStatement
    : SHOW (QUERIES | QUERY PROCESSLIST)
        (WHERE where=booleanExpression)?
        (ORDER BY sortItem (',' sortItem)*)?
        limitOffsetClause
    ;
```

**Example:**

```SQL
IoTDB> SHOW QUERIES WHERE elapsed_time > 30 
+-----------------------+-----------------------------+-----------+------------+------------+----+
|               query_id|                   start_time|datanode_id|elapsed_time|   statement|user|
+-----------------------+-----------------------------+-----------+------------+------------+----+
|20250108_101015_00000_1|2025-01-08T18:10:15.935+08:00|          1|      32.283|show queries|root|
+-----------------------+-----------------------------+-----------+------------+------------+----+
```

### 5.2 Terminate Queries

**Syntax:**

```SQL
killQueryStatement
    : KILL (QUERY queryId=string | ALL QUERIES)
    ;
```

**Example:**

```SQL
IoTDB> KILL QUERY 20250108_101015_00000_1; -- teminate specific query
IoTDB> KILL ALL QUERIES; -- teminate all query
```

### 5.3 Query Performance Analysis

#### 5.3.1 View Execution Plan

**Syntax:**

```SQL
EXPLAIN <SELECT_STATEMENT>
```

Detailed syntax reference: [EXPLAIN STATEMENT](../User-Manual/Query-Performance-Analysis.md#_1-explain-statement)

**Example:**

```SQL
IoTDB> explain select * from t1
+-----------------------------------------------------------------------------------------------+
|                                                                              distribution plan|
+-----------------------------------------------------------------------------------------------+
|                        ┌─────────────────────────────────────────────┐                        |
|                        │OutputNode-4                                 │                        |
|                        │OutputColumns-[time, device_id, type, speed] │                        |
|                        │OutputSymbols: [time, device_id, type, speed]│                        |
|                        └─────────────────────────────────────────────┘                        |
|                                               │                                               |
|                                               │                                               |
|                        ┌─────────────────────────────────────────────┐                        |
|                        │Collect-21                                   │                        |
|                        │OutputSymbols: [time, device_id, type, speed]│                        |
|                        └─────────────────────────────────────────────┘                        |
|                       ┌───────────────────────┴───────────────────────┐                       |
|                       │                                               │                       |
|┌─────────────────────────────────────────────┐                  ┌───────────┐                 |
|│TableScan-19                                 │                  │Exchange-28│                 |
|│QualifiedTableName: test.t1                  │                  └───────────┘                 |
|│OutputSymbols: [time, device_id, type, speed]│                        │                       |
|│DeviceNumber: 1                              │                        │                       |
|│ScanOrder: ASC                               │ ┌─────────────────────────────────────────────┐|
|│PushDownOffset: 0                            │ │TableScan-20                                 │|
|│PushDownLimit: 0                             │ │QualifiedTableName: test.t1                  │|
|│PushDownLimitToEachDevice: false             │ │OutputSymbols: [time, device_id, type, speed]│|
|│RegionId: 2                                  │ │DeviceNumber: 1                              │|
|└─────────────────────────────────────────────┘ │ScanOrder: ASC                               │|
|                                                │PushDownOffset: 0                            │|
|                                                │PushDownLimit: 0                             │|
|                                                │PushDownLimitToEachDevice: false             │|
|                                                │RegionId: 1                                  │|
|                                                └─────────────────────────────────────────────┘|
+-----------------------------------------------------------------------------------------------+
```

#### 5.3.2 Analyze Query Performance

**Syntax:**

```SQL
EXPLAIN ANALYZE [VERBOSE] <SELECT_STATEMENT>
```

Detailed syntax reference: [EXPLAIN ANALYZE STATEMENT](../User-Manual/Query-Performance-Analysis.md#_2-explain-analyze-statement)

**Example:**

```SQL
IoTDB> explain analyze verbose select * from t1
+-----------------------------------------------------------------------------------------------+
|                                                                                Explain Analyze|
+-----------------------------------------------------------------------------------------------+
|Analyze Cost: 38.860 ms                                                                        |
|Fetch Partition Cost: 9.888 ms                                                                 |
|Fetch Schema Cost: 54.046 ms                                                                   |
|Logical Plan Cost: 10.102 ms                                                                   |
|Logical Optimization Cost: 17.396 ms                                                           |
|Distribution Plan Cost: 2.508 ms                                                               |
|Dispatch Cost: 22.126 ms                                                                       |
|Fragment Instances Count: 2                                                                    |
|                                                                                               |
|FRAGMENT-INSTANCE[Id: 20241127_090849_00009_1.2.0][IP: 0.0.0.0][DataRegion: 2][State: FINISHED]|
|  Total Wall Time: 18 ms                                                                       |
|  Cost of initDataQuerySource: 6.153 ms                                                        |
|  Seq File(unclosed): 1, Seq File(closed): 0                                                   |
|  UnSeq File(unclosed): 0, UnSeq File(closed): 0                                               |
|  ready queued time: 0.164 ms, blocked queued time: 0.342 ms                                   |
|  Query Statistics:                                                                            |
|    loadBloomFilterFromCacheCount: 0                                                           |
|    loadBloomFilterFromDiskCount: 0                                                            |
|    loadBloomFilterActualIOSize: 0                                                             |
|    loadBloomFilterTime: 0.000                                                                 |
|    loadTimeSeriesMetadataAlignedMemSeqCount: 1                                                |
|    loadTimeSeriesMetadataAlignedMemSeqTime: 0.246                                             |
|    loadTimeSeriesMetadataFromCacheCount: 0                                                    |
|    loadTimeSeriesMetadataFromDiskCount: 0                                                     |
|    loadTimeSeriesMetadataActualIOSize: 0                                                      |
|    constructAlignedChunkReadersMemCount: 1                                                    |
|    constructAlignedChunkReadersMemTime: 0.294                                                 |
|    loadChunkFromCacheCount: 0                                                                 |
|    loadChunkFromDiskCount: 0                                                                  |
|    loadChunkActualIOSize: 0                                                                   |
|    pageReadersDecodeAlignedMemCount: 1                                                        |
|    pageReadersDecodeAlignedMemTime: 0.047                                                     |
|    [PlanNodeId 43]: IdentitySinkNode(IdentitySinkOperator)                                    |
|        CPU Time: 5.523 ms                                                                     |
|        output: 2 rows                                                                         |
|        HasNext() Called Count: 6                                                              |
|        Next() Called Count: 5                                                                 |
|        Estimated Memory Size: : 327680                                                        |
|      [PlanNodeId 31]: CollectNode(CollectOperator)                                            |
|          CPU Time: 5.512 ms                                                                   |
|          output: 2 rows                                                                       |
|          HasNext() Called Count: 6                                                            |
|          Next() Called Count: 5                                                               |
|          Estimated Memory Size: : 327680                                                      |
|        [PlanNodeId 29]: TableScanNode(TableScanOperator)                                      |
|            CPU Time: 5.439 ms                                                                 |
|            output: 1 rows                                                                     |
|            HasNext() Called Count: 3
|            Next() Called Count: 2                                                             |
|            Estimated Memory Size: : 327680                                                    |
|            DeviceNumber: 1                                                                    |
|            CurrentDeviceIndex: 0                                                              |
|        [PlanNodeId 40]: ExchangeNode(ExchangeOperator)                                        |
|            CPU Time: 0.053 ms                                                                 |
|            output: 1 rows                                                                     |
|            HasNext() Called Count: 2                                                          |
|            Next() Called Count: 1                                                             |
|            Estimated Memory Size: : 131072                                                    |
|                                                                                               |
|FRAGMENT-INSTANCE[Id: 20241127_090849_00009_1.3.0][IP: 0.0.0.0][DataRegion: 1][State: FINISHED]|
|  Total Wall Time: 13 ms                                                                       |
|  Cost of initDataQuerySource: 5.725 ms                                                        |
|  Seq File(unclosed): 1, Seq File(closed): 0                                                   |
|  UnSeq File(unclosed): 0, UnSeq File(closed): 0                                               |
|  ready queued time: 0.118 ms, blocked queued time: 5.844 ms                                   |
|  Query Statistics:                                                                            |
|    loadBloomFilterFromCacheCount: 0                                                           |
|    loadBloomFilterFromDiskCount: 0                                                            |
|    loadBloomFilterActualIOSize: 0                                                             |
|    loadBloomFilterTime: 0.000                                                                 |
|    loadTimeSeriesMetadataAlignedMemSeqCount: 1                                                |
|    loadTimeSeriesMetadataAlignedMemSeqTime: 0.004                                             |
|    loadTimeSeriesMetadataFromCacheCount: 0                                                    |
|    loadTimeSeriesMetadataFromDiskCount: 0                                                     |
|    loadTimeSeriesMetadataActualIOSize: 0                                                      |
|    constructAlignedChunkReadersMemCount: 1                                                    |
|    constructAlignedChunkReadersMemTime: 0.001                                                 |
|    loadChunkFromCacheCount: 0                                                                 |
|    loadChunkFromDiskCount: 0                                                                  |
|    loadChunkActualIOSize: 0                                                                   |
|    pageReadersDecodeAlignedMemCount: 1                                                        |
|    pageReadersDecodeAlignedMemTime: 0.007                                                     |
|    [PlanNodeId 42]: IdentitySinkNode(IdentitySinkOperator)                                    |
|        CPU Time: 0.270 ms                                                                     |
|        output: 1 rows                                                                         |
|        HasNext() Called Count: 3                                                              |
|        Next() Called Count: 2                                                                 |
|        Estimated Memory Size: : 327680                                                        |
|      [PlanNodeId 30]: TableScanNode(TableScanOperator)                                        |
|          CPU Time: 0.250 ms                                                                   |
|          output: 1 rows                                                                       |
|          HasNext() Called Count: 3                                                            |
|          Next() Called Count: 2                                                               |
|          Estimated Memory Size: : 327680                                                      |
|          DeviceNumber: 1                                                                      |
|          CurrentDeviceIndex: 0                                                                |
+-----------------------------------------------------------------------------------------------+
```
