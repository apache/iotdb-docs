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
# Maintenance Statement

## 1. Status Checking

### 1.1 Viewing the Cluster Version

**Description**: Returns the current cluster version.

**Syntax**:

```SQL
showVersionStatement
    : SHOW VERSION
    ;
```

**Example**:

```SQL
IoTDB> SHOW VERSION;
```

**Result**:

```Plain
+-------+-----------+
|Version|  BuildInfo|
+-------+-----------+
|1.3.4.1|e5334cf-dev|
+-------+-----------+
```

### 1.2 Viewing Cluster Key Parameters

**Description**: Returns key parameters of the current cluster.

**Syntax**:

```SQL
showVariablesStatement
    : SHOW VARIABLES
    ;
```

Key Parameters:

1. **ClusterName**: The name of the current cluster.
2. **DataReplicationFactor**: Number of data replicas per DataRegion.
3. **SchemaReplicationFactor**: Number of schema replicas per SchemaRegion.
4. **DataRegionConsensusProtocolClass**: Consensus protocol class for DataRegions.
5. **SchemaRegionConsensusProtocolClass**: Consensus protocol class for SchemaRegions.
6. **ConfigNodeConsensusProtocolClass**: Consensus protocol class for ConfigNodes.
7. **TimePartitionOrigin**: The starting timestamp of database time partitions.
8. **TimePartitionInterval**: The interval of database time partitions (in milliseconds).
9. **ReadConsistencyLevel**: The consistency level for read operations.
10. **SchemaRegionPerDataNode**: Number of SchemaRegions per DataNode.
11. **DataRegionPerDataNode**: Number of DataRegions per DataNode.
12. **SeriesSlotNum**: Number of SeriesSlots per DataRegion.
13. **SeriesSlotExecutorClass**: Implementation class for SeriesSlots.
14. **DiskSpaceWarningThreshold**: Disk space warning threshold (in percentage).
15. **TimestampPrecision**: Timestamp precision.

**Example**:

```SQL
IoTDB> SHOW VARIABLES;
```

**Result**:

```Plain
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

### 1.3 Viewing the Current Timestamp of Database

**Description**: Returns the current timestamp of the database.

**Syntax**:

```SQL
showCurrentTimestampStatement
    : SHOW CURRENT_TIMESTAMP
    ;
```

**Example**:

```SQL
IoTDB> SHOW CURRENT_TIMESTAMP;
```

**Result**:

```Plain
+-----------------------------+
|             CurrentTimestamp|
+-----------------------------+
|2025-02-17T11:11:52.987+08:00|
+-----------------------------+
```

### 1.4 Viewing Executing Queries

**Description**: Displays information about all currently executing queries.

**Syntax**:

```SQL
showQueriesStatement
    : SHOW (QUERIES | QUERY PROCESSLIST)
        (WHERE where=booleanExpression)?
        (ORDER BY sortItem (',' sortItem)*)?
        limitOffsetClause
    ;
```

**Parameters**:

1. **WHERE Clause**: Filters the result set based on specified conditions.
2. **ORDER BY Clause**: Sorts the result set based on specified columns.
3. **limitOffsetClause**: Limits the number of rows returned.
    1. Format: `LIMIT <offset>, <row_count>`.

**Columns in QUERIES Table**:

- **time**: Timestamp when the query started.
- **queryid**: Unique ID of the query.
- **datanodeid**: ID of the DataNode executing the query.
- **elapsedtime**: Time elapsed since the query started (in seconds).
- **statement**: The SQL statement being executed.

**Example**:

```SQL
IoTDB> SHOW QUERIES WHERE elapsedtime > 0.003 
```

**Result**:

```SQL
+-----------------------------+-----------------------+----------+-----------+--------------------------------------+
|                         Time|                QueryId|DataNodeId|ElapsedTime|                             Statement|
+-----------------------------+-----------------------+----------+-----------+--------------------------------------+
|2025-05-09T15:16:01.293+08:00|20250509_071601_00015_1|         1|      0.006|SHOW QUERIES WHERE elapsedtime > 0.003|
+-----------------------------+-----------------------+----------+-----------+--------------------------------------+
```


## 2. Status Setting

### 2.1 Updating Configuration Items

**Description**: Updates configuration items. Changes take effect immediately without restarting if the items support hot modification.

**Syntax**:

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

**Parameters**:

1. **propertyAssignments**: A list of properties to update.
    1. Format: `property (',' property)*`.
    2. Values:
        - `DEFAULT`: Resets the configuration to its default value.
        - `expression`: A specific value (must be a string).
2. **ON INTEGER_VALUE** **(Optional):** Specifies the node ID to update.
    1. If not specified or set to a negative value, updates all ConfigNodes and DataNodes.

**Example**:

```SQL
IoTDB> SET CONFIGURATION a='1',b='1' ON 1;
```

### 2.2 Loading Manually Modified Configuration Files

**Description**: Loads manually modified configuration files and hot-loads the changes. Configuration items that support hot modification take effect immediately.

**Syntax**:

```SQL
loadConfigurationStatement
    : LOAD CONFIGURATION localOrClusterMode?
    ;
    
localOrClusterMode
    : (ON (LOCAL | CLUSTER))
    ;
```

**Parameters**:

1. **localOrClusterMode** **(Optional):**
    1. Specifies the scope of configuration loading.
    2. Default: `CLUSTER`.
    3. Values:
        - `LOCAL`: Loads configuration only on the DataNode directly connected to the client.
        - `CLUSTER`: Loads configuration on all DataNodes in the cluster.

**Example**:

```SQL
IoTDB> LOAD CONFIGURATION ON LOCAL;
```

### 2.3 Setting the System Status

**Description**: Sets the system status to either `READONLY` or `RUNNING`.

**Syntax**:

```SQL
setSystemStatusStatement
    : SET SYSTEM TO (READONLY | RUNNING) localOrClusterMode?
    ;    
    
localOrClusterMode
    : (ON (LOCAL | CLUSTER))
    ;
```

**Parameters**:

1. **RUNNING |** **READONLY**:
    1. **RUNNING**: Sets the system to running mode, allowing both read and write operations.
    2. **READONLY**: Sets the system to read-only mode, allowing only read operations and prohibiting writes.
2. **localOrClusterMode** **(Optional):**
    1. **LOCAL**: Applies the status change only to the DataNode directly connected to the client.
    2. **CLUSTER**: Applies the status change to all DataNodes in the cluster.
    3. **Default**: `ON CLUSTER`.

**Example**:

```SQL
IoTDB> SET SYSTEM TO READONLY ON CLUSTER;
```

## 3. Data Management

### 3.1 Flushing Data from Memory to Disk

**Description**: Flushes data from the memory table to disk.

**Syntax**:

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

**Parameters**:

1. **identifier** **(Optional):**
    1. Specifies the name of the path to flush.
    2. If not specified, all path are flushed.
    3. **Multiple Paths**: Multiple path names can be specified, separated by commas (e.g., `FLUSH root.ln, root.lnm.**`).
2. **booleanValue** **(****Optional****)**:
    1. Specifies the type of data to flush.
    2. **TRUE**: Flushes only the sequential memory table.
    3. **FALSE**: Flushes only the unsequential MemTable.
    4. **Default**: Flushes both sequential and unsequential memory tables.
3. **localOrClusterMode** **(****Optional****)**:
    1. **ON LOCAL**: Flushes only the memory tables on the DataNode directly connected to the client.
    2. **ON CLUSTER**: Flushes memory tables on all DataNodes in the cluster.
    3. **Default:** `ON CLUSTER`.

**Example**:

```SQL
IoTDB> FLUSH root.ln TRUE ON LOCAL;
```

## 4. Data Repair

### 4.1 Starting Background Scan and Repair of TsFiles

**Description**: Starts a background task to scan and repair TsFiles, fixing issues such as timestamp disorder within data files.

**Syntax**:

```SQL
startRepairDataStatement
    : START REPAIR DATA localOrClusterMode?
    ;
    
localOrClusterMode
    : (ON (LOCAL | CLUSTER))
    ;
```

**Parameters**:

1. **localOrClusterMode（Optional）**:
    1. **ON LOCAL**: Executes the repair task only on the DataNode directly connected to the client.
    2. **ON CLUSTER**: Executes the repair task on all DataNodes in the cluster.
    3. **Default:** `ON CLUSTER`.

**Example**:

```SQL
IoTDB> START REPAIR DATA ON CLUSTER;
```

### 4.2 Pausing Background TsFile Repair Task

**Description**: Pauses the background repair task. The paused task can be resumed by executing the `START REPAIR DATA` command again.

**Syntax**:

```SQL
stopRepairDataStatement
    : STOP REPAIR DATA localOrClusterMode?
    ;
    
localOrClusterMode
    : (ON (LOCAL | CLUSTER))
    ;
```

**Parameters**:

1. **localOrClusterMode** **(Optional):**
    1. **ON LOCAL**: Executes the pause command only on the DataNode directly connected to the client.
    2. **ON CLUSTER**: Executes the pause command on all DataNodes in the cluster.
    3. **Default:** `ON CLUSTER`.

**Example**:

```SQL
IoTDB> STOP REPAIR DATA ON CLUSTER;
```

## 5. Query Termination

### 5.1 Terminating Queries

**Description**: Terminates one or more running queries.

**Syntax**:

```SQL
killQueryStatement
    : KILL (QUERY queryId=string | ALL QUERIES)
    ;
```

**Parameters**:

1. **QUERY** **queryId:** Specifies the ID of the query to terminate.

- To obtain the `queryId`, use the `SHOW QUERIES` command.

2. **ALL QUERIES:** Terminates all currently running queries.

**Example**:

Terminate a specific query:

```SQL
IoTDB> KILL QUERY 20250108_101015_00000_1;
```

Terminate all queries:

```SQL
IoTDB> KILL ALL QUERIES;
```