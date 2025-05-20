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
# 运维语句

## 1.  状态查看

### 1.1 查看集群版本

**含义**：返回当前集群的版本。

#### 语法：

```SQL
showVersionStatement
    : SHOW VERSION
    ;
```

#### 示例：

```SQL
IoTDB> SHOW VERSION
```

执行结果如下：

```SQL
+-------+-----------+
|Version|  BuildInfo|
+-------+-----------+
|1.3.4.1|e5334cf-dev|
+-------+-----------+
```

### 1.2 查看集群关键参数

**含义**：返回当前集群的关键参数。

#### 语法：

```SQL
showVariablesStatement
    : SHOW VARIABLES
    ;
```

关键参数如下：

1. **ClusterName**：当前集群的名称。
2. **DataReplicationFactor**：数据副本的数量，表示每个数据分区（DataRegion）的副本数。
3. **SchemaReplicationFactor**：元数据副本的数量，表示每个元数据分区（SchemaRegion）的副本数。
4. **DataRegionConsensusProtocolClass**：数据分区（DataRegion）使用的共识协议类。
5. **SchemaRegionConsensusProtocolClass**：元数据分区（SchemaRegion）使用的共识协议类。
6. **ConfigNodeConsensusProtocolClass**：配置节点（ConfigNode）使用的共识协议类。
7. **TimePartitionOrigin**：数据库时间分区的起始时间戳。
8. **TimePartitionInterval**：数据库的时间分区间隔（单位：毫秒）。
9. **ReadConsistencyLevel**：读取操作的一致性级别。
10. **SchemaRegionPerDataNode**：数据节点（DataNode）上的元数据分区（SchemaRegion）数量。
11. **DataRegionPerDataNode**：数据节点（DataNode）上的数据分区（DataRegion）数量。
12. **SeriesSlotNum**：数据分区（DataRegion）的序列槽（SeriesSlot）数量。
13. **SeriesSlotExecutorClass**：序列槽的实现类。
14. **DiskSpaceWarningThreshold**：磁盘空间告警阈值（单位：百分比）。
15. **TimestampPrecision**：时间戳精度。

#### 示例：

```SQL
IoTDB> SHOW VARIABLES
```

执行结果如下：

```SQL
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

### 1.3 查看数据库当前时间

#### 语法：

**含义**：返回数据库当前时间。

```SQL
showCurrentTimestampStatement
    : SHOW CURRENT_TIMESTAMP
    ;
```

#### 示例：

```SQL
IoTDB> SHOW CURRENT_TIMESTAMP
```

执行结果如下：

```SQL
+-----------------------------+
|             CurrentTimestamp|
+-----------------------------+
|2025-02-17T11:11:52.987+08:00|
+-----------------------------+
```

### 1.4 查看正在执行的查询信息

**含义**：用于显示所有正在执行的查询信息。

#### 语法：

```SQL
showQueriesStatement
    : SHOW (QUERIES | QUERY PROCESSLIST)
        (WHERE where=booleanExpression)?
        (ORDER BY sortItem (',' sortItem)*)?
        limitOffsetClause
    ;
```

**参数解释**：

1. **WHERE** 子句：需保证过滤的目标列是结果集中存在的列
2. **ORDER BY** 子句：需保证`sortKey`是结果集中存在的列
3. **limitOffsetClause**：
   - **含义**：用于限制结果集的返回数量。
   - **格式**：`LIMIT <offset>, <row_count>`， `<offset>` 是偏移量，`<row_count>` 是返回的行数。
4. **QUERIES** 表中的列：
   - **time**：查询开始的时间戳，时间戳精度与系统精度一致
   - **queryid**：查询语句的 ID
   - **datanodeid**：发起查询语句的 DataNode 的ID
   - **elapsedtime**：查询的执行耗时，单位是秒
   - **statement**：查询的 SQL 语句
 

#### 示例：

```SQL
IoTDB> SHOW QUERIES WHERE elapsedtime > 0.003 
```

执行结果如下：

```SQL
+-----------------------------+-----------------------+----------+-----------+--------------------------------------+
|                         Time|                QueryId|DataNodeId|ElapsedTime|                             Statement|
+-----------------------------+-----------------------+----------+-----------+--------------------------------------+
|2025-05-09T15:16:01.293+08:00|20250509_071601_00015_1|         1|      0.006|SHOW QUERIES WHERE elapsedtime > 0.003|
+-----------------------------+-----------------------+----------+-----------+--------------------------------------+
```

## 2. 状态设置

### 2.1 更新配置项

**含义**：用于更新配置项，执行完成后会进行配置项的热加载，对于支持热修改的配置项会立即生效。

#### 语法：

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

**参数解释**：

1. **propertyAssignments**
   - **含义**：更新的配置列表，由多个 `property` 组成。
   - 可以更新多个配置列表，用逗号分隔。
   - **取值**：
      - `DEFAULT`：将配置项恢复为默认值。
      - `expression`：具体的值，必须是一个字符串。
2. **ON INTEGER_VALUE**
   - **含义**：指定要更新配置的节点 ID。
   - **可选性**：可选。如果不指定或指定的值低于 0，则更新所有 ConfigNode 和 DataNode 的配置。

#### 示例：

```SQL
IoTDB> SET CONFIGURATION a='1',b='1' ON 1;
```

### 2.2 读取手动修改的配置文件

**含义**：用于读取手动修改过的配置文件，并对配置项进行热加载，对于支持热修改的配置项会立即生效。

#### 语法：

```SQL
loadConfigurationStatement
    : LOAD CONFIGURATION localOrClusterMode?
    ;
    
localOrClusterMode
    : (ON (LOCAL | CLUSTER))
    ;
```

**参数解释**：

1. **localOrClusterMode**
   - **含义**：指定配置热加载的范围。
   - **可选性**：可选。默认值为 `CLUSTER`。
   - **取值**：
      - `LOCAL`：只对客户端直连的 DataNode 进行配置热加载。
      - `CLUSTER`：对集群中所有 DataNode 进行配置热加载。

#### 示例：

```SQL
IoTDB> LOAD CONFIGURATION ON LOCAL;
```

### 2.3 设置系统的状态

**含义**：用于设置系统的状态。

#### 语法：

```SQL
setSystemStatusStatement
    : SET SYSTEM TO (READONLY | RUNNING) localOrClusterMode?
    ;    
    
localOrClusterMode
    : (ON (LOCAL | CLUSTER))
    ;
```

**参数解释**：

1. **RUNNING | READONLY**
   - **含义**：指定系统的新状态。
   - **取值**：
      - `RUNNING`：将系统设置为运行状态，允许读写操作。
      - `READONLY`：将系统设置为只读状态，只允许读取操作，禁止写入操作。
2. **localOrClusterMode**
   - **含义**：指定状态变更的范围。
   - **可选性**：可选。默认值为 `CLUSTER`。
   - **取值**：
      - `LOCAL`：仅对客户端直连的 DataNode 生效。
      - `CLUSTER`：对集群中所有 DataNode 生效。

#### 示例：

```SQL
IoTDB> SET SYSTEM TO READONLY ON CLUSTER;
```


## 3. 数据管理

### 3.1 刷写内存表中的数据到磁盘

**含义**：将内存表中的数据刷写到磁盘上。

#### 语法：

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

**参数解释**：

1.  **identifier**
    - **含义**：指定要刷写的路径名称。
    - **可选性**：可选。如果不指定，则默认刷写所有路径。
    - **多个路径**：可以指定多个路径名称，用逗号分隔。例如：`FLUSH root.ln, root.lnm`。
2. **booleanValue**
   - **含义**：指定刷写的内容。
   - **可选性**：可选。如果不指定，则默认刷写顺序和乱序空间的内存。
   - **取值**：
      - `TRUE`：只刷写顺序空间的内存表。
      - `FALSE`：只刷写乱序空间的MemTable。
3. **localOrClusterMode**
   - **含义**：指定刷写的范围。
   - **可选性**：可选。默认值为 `CLUSTER`。
   - **取值**：
      - `ON LOCAL`：只刷写客户端直连的 DataNode 上的内存表。
      - `ON CLUSTER`：刷写集群中所有 DataNode 上的内存表。

#### 示例：

```SQL
IoTDB> FLUSH root.ln TRUE ON LOCAL;
```

## 4. 数据修复

### 4.1 启动后台扫描并修复 tsfile 任务

**含义**：启动一个后台任务，开始扫描并修复 tsfile，能够修复数据文件内的时间戳乱序类异常。

#### 语法：

```SQL
startRepairDataStatement
    : START REPAIR DATA localOrClusterMode?
    ;
    
localOrClusterMode
    : (ON (LOCAL | CLUSTER))
    ;
```

**参数解释**：

1. **localOrClusterMode**
   - **含义**：指定数据修复的范围。
   - **可选性**：可选。默认值为 `CLUSTER`。
   - **取值**：
      - `ON LOCAL`：仅对客户端直连的 DataNode 执行。
      - `ON CLUSTER`：对集群中所有 DataNode 执行。

#### 示例：

```SQL
IoTDB> START REPAIR DATA ON CLUSTER;
```

### 4.2 暂停后台修复 tsfile 任务

**含义**：暂停后台的修复任务，暂停中的任务可通过再次执行 start repair data 命令恢复。

#### 语法：

```SQL
stopRepairDataStatement
    : STOP REPAIR DATA localOrClusterMode?
    ;
    
localOrClusterMode
    : (ON (LOCAL | CLUSTER))
    ;
```

**参数解释**：

1. **localOrClusterMode**
   - **含义**：指定数据修复的范围。
   - **可选性**：可选。默认值为 `CLUSTER`。
   - **取值**：
      - `ON LOCAL`：仅对客户端直连的 DataNode 执行。
      - `ON CLUSTER`：对集群中所有 DataNode 执行。

#### 示例：

```SQL
IoTDB> STOP REPAIR DATA ON CLUSTER;
```

## 5. 终止查询

### 5.1 主动终止查询

**含义**：使用该命令主动地终止查询。

#### 语法：

```SQL
killQueryStatement
    : KILL (QUERY queryId=string | ALL QUERIES)
    ;
```

**参数解释**：

1. **QUERY queryId=string**
   - **含义**：指定要终止的查询的 ID。 `<queryId>` 是正在执行的查询的唯一标识符。
   - **获取查询 ID**：可以通过 `SHOW QUERIES` 命令获取所有正在执行的查询及其 ID。
2. **ALL QUERIES**
   - **含义**：终止所有正在执行的查询。

#### 示例：

通过指定 `queryId` 可以中止指定的查询，为了获取正在执行的查询 id，用户可以使用 show queries 命令，该命令将显示所有正在执行的查询列表。

```SQL
IoTDB> KILL QUERY 20250108_101015_00000_1; -- 终止指定query
IoTDB> KILL ALL QUERIES; -- 终止所有query
```