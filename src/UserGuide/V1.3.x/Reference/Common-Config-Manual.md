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

# Common Configuration

IoTDB common files for ConfigNode and DataNode are under `conf`.

* `iotdb-system.properties`：IoTDB system configurations.


## Effective
Different configuration parameters take effect in the following three ways:

+ **Only allowed to be modified in first start up:** Can't be modified after first start, otherwise the ConfigNode/DataNode cannot start.
+ **After restarting system:** Can be modified after the ConfigNode/DataNode first start, but take effect after restart.
+ **hot-load:** Can be modified while the ConfigNode/DataNode is running, and trigger through sending the command(sql) `load configuration` or `set configuration 'key1' = 'value1'` to the IoTDB server by client or session.

## Configuration File

### Replication Configuration

* config\_node\_consensus\_protocol\_class

|    Name     | config\_node\_consensus\_protocol\_class                               |
|:-----------:|:-----------------------------------------------------------------------|
| Description | Consensus protocol of ConfigNode replicas, only support RatisConsensus |
|    Type     | String                                                                 |
|   Default   | org.apache.iotdb.consensus.ratis.RatisConsensus                        |
|  Effective  | Only allowed to be modified in first start up                          |

* schema\_replication\_factor

|    Name     | schema\_replication\_factor                                      |
|:-----------:|:-----------------------------------------------------------------|
| Description | Schema replication num                                           |
|    Type     | int32                                                            |
|   Default   | 1                                                                |
|  Effective  | Take effect on **new created Databases** after restarting system |

* schema\_region\_consensus\_protocol\_class

|    Name     |                                                  schema\_region\_consensus\_protocol\_class                                                  |
|:-----------:|:--------------------------------------------------------------------------------------------------------------------------------------------:|
| Description | Consensus protocol of schema replicas，larger than 1 replicas could only use RatisConsensus  |
|    Type     |                                                                    String                                                                    |
|   Default   |                                               org.apache.iotdb.consensus.ratis.RatisConsensus                                                |
|  Effective  |                                                Only allowed to be modified in first start up                                                 |

* data\_replication\_factor

|    Name     | data\_replication\_factor                                        |
|:-----------:|:-----------------------------------------------------------------|
| Description | Data replication num                                             |
|    Type     | int32                                                            |
|   Default   | 1                                                                |
|  Effective  | Take effect on **new created Databases** after restarting system |

* data\_region\_consensus\_protocol\_class

|    Name     | data\_region\_consensus\_protocol\_class                                                                                                             |
|:-----------:|:-----------------------------------------------------------------------------------------------------------------------------------------------------|
| Description | Consensus protocol of data replicas，larger than 1 replicas could use IoTConsensus or RatisConsensus |
|    Type     | String                                                                                                                                               |
|   Default   | org.apache.iotdb.consensus.simple.SimpleConsensus                                                                                                    |
|  Effective  | Only allowed to be modified in first start up                                                                                                        |

### Load balancing Configuration

* series\_partition\_slot\_num

|    Name     | series\_slot\_num                             |
|:-----------:|:----------------------------------------------|
| Description | Slot num of series partition                  |
|    Type     | int32                                         |
|   Default   | 10000                                         |
|  Effective  | Only allowed to be modified in first start up |

* series\_partition\_executor\_class

|    Name     | series\_partition\_executor\_class                                |
|:-----------:|:------------------------------------------------------------------|
| Description | Series partition hash function                                    |
|    Type     | String                                                            |
|   Default   | org.apache.iotdb.commons.partition.executor.hash.BKDRHashExecutor |
|  Effective  | Only allowed to be modified in first start up                     |

* schema\_region\_group\_extension\_policy

|    Name     | schema\_region\_group\_extension\_policy  |
|:-----------:|:------------------------------------------|
| Description | The extension policy of SchemaRegionGroup |
|    Type     | string                                    |
|   Default   | AUTO                                      |
|  Effective  | After restarting system                   |

* default\_schema\_region\_group\_num\_per\_database

|    Name     | default\_schema\_region\_group\_num\_per\_database                                                                                                                                                                                      |
|:-----------:|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Description | The number of SchemaRegionGroups that each Database has when using the CUSTOM-SchemaRegionGroup extension policy. The least number of SchemaRegionGroups that each Database has when using the AUTO-SchemaRegionGroup extension policy. |
|    Type     | int                                                                                                                                                                                                                                     |
|   Default   | 1                                                                                                                                                                                                                                       |
|  Effective  | After restarting system                                                                                                                                                                                                                 |

* schema\_region\_per\_data\_node

|    Name     | schema\_region\_per\_data\_node                                            |
|:-----------:|:---------------------------------------------------------------------------|
| Description | The maximum number of SchemaRegion expected to be managed by each DataNode |
|    Type     | double                                                                     |
|   Default   | 1.0                                                                        |
|  Effective  | After restarting system                                                    |

* data\_region\_group\_extension\_policy

|    Name     | data\_region\_group\_extension\_policy  |
|:-----------:|:----------------------------------------|
| Description | The extension policy of DataRegionGroup |
|    Type     | string                                  |
|   Default   | AUTO                                    |
|  Effective  | After restarting system                 |

* default\_data\_region\_group\_num\_per\_database

|    Name     | default\_data\_region\_group\_num\_per\_database                                                                                                                                                                                |
|:-----------:|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Description | The number of DataRegionGroups that each Database has when using the CUSTOM-DataRegionGroup extension policy. The least number of DataRegionGroups that each Database has when using the AUTO-DataRegionGroup extension policy. |
|    Type     | int                                                                                                                                                                                                                             |
|   Default   | 1                                                                                                                                                                                                                               |
|  Effective  | After restarting system                                                                                                                                                                                                         |

* data\_region\_per\_data\_node

|    Name     | data\_region\_per\_data\_node                                             |
|:-----------:|:--------------------------------------------------------------------------|
| Description | The maximum number of DataRegion expected to be managed by each DataNode  |
|    Type     | double                                                                    |
|   Default   | Half of the CPU cores                                                                       |
|  Effective  | After restarting system                                                   |

* enable\_data\_partition\_inherit\_policy

|    Name     | enable\_data\_partition\_inherit\_policy           |
|:-----------:|:---------------------------------------------------|
| Description | Whether to enable the DataPartition inherit policy |
|    Type     | Boolean                                            |
|   Default   | false                                              |
|  Effective  | After restarting system                            |

* leader\_distribution\_policy

|    Name     | leader\_distribution\_policy                            |
|:-----------:|:--------------------------------------------------------|
| Description | The policy of cluster RegionGroups' leader distribution |
|    Type     | String                                                  |
|   Default   | MIN_COST_FLOW                                           |
|  Effective  | After restarting system                                 |

* enable\_auto\_leader\_balance\_for\_ratis

|    Name     | enable\_auto\_leader\_balance\_for\_ratis\_consensus               |
|:-----------:|:-------------------------------------------------------------------|
| Description | Whether to enable auto leader balance for Ratis consensus protocol |
|    Type     | Boolean                                                            |
|   Default   | false                                                              |
|  Effective  | After restarting system                                            |

* enable\_auto\_leader\_balance\_for\_iot\_consensus

|    Name     | enable\_auto\_leader\_balance\_for\_iot\_consensus              |
|:-----------:|:----------------------------------------------------------------|
| Description | Whether to enable auto leader balance for IoTConsensus protocol |
|    Type     | Boolean                                                         |
|   Default   | true                                                            |
|  Effective  | After restarting system                                         |

### Cluster Management

* cluster\_name

|    Name     | cluster\_name                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
|:-----------:|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Description | The name of cluster                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
|    Type     | String                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
|   Default   | default_cluster                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
|  Effective  | Execute SQL in CLI: ```set configuration 'cluster_name'='xxx'``` (xxx is the new cluster name)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|  Attention  | This change is distributed to each node through the network. In the event of network fluctuations or node downtime, it is not guaranteed that the modification will be successful on all nodes. Nodes that fail to modify will not be able to join the cluster upon restart. At this time, it is necessary to manually modify the cluster_name item in the configuration file of the node, and then restart. Under normal circumstances, it is not recommended to change the cluster name by manually modifying the configuration file, nor is it recommended to hot load through the load configuration method. |

* time\_partition\_interval

|    Name     | time\_partition\_interval                                     |
|:-----------:|:--------------------------------------------------------------|
| Description | Time partition interval of data when ConfigNode allocate data |
|    Type     | Long                                                          |
|    Unit     | ms                                                            |
|   Default   | 604800000                                                     |
|  Effective  | Only allowed to be modified in first start up                 |

* heartbeat\_interval\_in\_ms

|    Name     | heartbeat\_interval\_in\_ms             |
|:-----------:|:----------------------------------------|
| Description | Heartbeat interval in the cluster nodes |
|    Type     | Long                                    |
|    Unit     | ms                                      |
|   Default   | 1000                                    |
|  Effective  | After restarting system                 |

* disk\_space\_warning\_threshold

|    Name     | disk\_space\_warning\_threshold |
|:-----------:|:--------------------------------|
| Description | Disk remaining threshold        |
|    Type     | double(percentage)              |
|   Default   | 0.05                            |
|  Effective  | After restarting system         |

### Memory Control Configuration

* datanode\_memory\_proportion

|Name| datanode\_memory\_proportion                                                  |
|:---:|:-------------------------------------------------------------------------------------------------------------|
|Description| Memory Allocation Ratio: StorageEngine, QueryEngine, SchemaEngine, Consensus, StreamingEngine,  and Free Memory                 |
|Type| Ratio                                                                                                        |
|Default| 3:3:1:1:1:1                                                                                                    |
|Effective| After restarting system                                                                                      |

* schema\_memory\_proportion

|Name| schema\_memory\_proportion                                                    |
|:---:|:----------------------------------------------------------------------------------------|
|Description| Schema Memory Allocation Ratio: SchemaRegion, SchemaCache, and PartitionCache. |
|Type| Ratio                                                                                   |
|Default| 5:4:1                                                                              |
|Effective| After restarting system                                                                   |

* storage\_engine\_memory\_proportion

|Name| storage\_engine\_memory\_proportion |
|:---:|:------------------------------------|
|Description| Memory allocation ratio in StorageEngine: Write, Compaction                       |
|Type| Ratio                               |
|Default| 8:2                                 |
|Effective| After restarting system                              |

* write\_memory\_proportion

|Name| write\_memory\_proportion                            |
|:---:|:----------------------------------------------------------------|
|Description| Memory allocation ratio in writing: Memtable, TimePartitionInfo |
|Type| Ratio                                                           |
|Default| 19:1                                                       |
|Effective| After restarting system                                                          |

* concurrent\_writing\_time\_partition

|Name| concurrent\_writing\_time\_partition |
|:---:|:---|
|Description| This config decides how many time partitions in a database can be inserted concurrently <br> For example, your partitionInterval is 86400 and you want to insert data in 5 different days, |
|Type|int32|
|Default| 1 |
|Effective|After restarting system|

* primitive\_array\_size

|    Name     | primitive\_array\_size                                    |
|:-----------:|:----------------------------------------------------------|
| Description | primitive array size (length of each array) in array pool |
|    Type     | Int32                                                     |
|   Default   | 64                                                        |
|  Effective  | After restart system                                      |

* chunk\_metadata\_size\_proportion

|Name| chunk\_metadata\_size\_proportion   |
|:---:|:------------------------------------|
|Description| size proportion for chunk metadata maintains in memory when writing tsfile |
|Type| Double                              |
|Default| 0.1                                 |
|Effective|After restart system|

* flush\_proportion

|    Name     | flush\_proportion                                                                                                                                                          |
|:-----------:|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Description | Ratio of write memory for invoking flush disk, 0.4 by default If you have extremely high write load (like batch=1000), it can be set lower than the default value like 0.2 |
|    Type     | Double                                                                                                                                                                     |
|   Default   | 0.4                                                                                                                                                                        |
|  Effective  | After restart system                                                                                                                                                       |

* buffered\_arrays\_memory\_proportion

|Name| buffered\_arrays\_memory\_proportion |
|:---:|:---|
|Description| Ratio of write memory allocated for buffered arrays |
|Type| Double |
|Default| 0.6 |
|Effective|After restart system|

* reject\_proportion

|Name| reject\_proportion |
|:---:|:---|
|Description| Ratio of write memory for rejecting insertion |
|Type| Double |
|Default| 0.8 |
|Effective|After restart system|

* write\_memory\_variation\_report\_proportion

|    Name     | write\_memory\_variation\_report\_proportion                 |
| :---------: | :----------------------------------------------------------- |
| Description | if memory cost of data region increased more than proportion of allocated memory for write, report to system |
|    Type     | Double                                                       |
|   Default   | 0.001                                                        |
|  Effective  | After restarting system                                      |

* check\_period\_when\_insert\_blocked

|Name| check\_period\_when\_insert\_blocked                                        |
|:---:|:----------------------------------------------------------------------------|
|Description| when an inserting is rejected, waiting period (in ms) to check system again |
|Type| Int32                                                                       |
|Default| 50                                                                          |
|Effective| After restart system                                                        |

* io\_task\_queue\_size\_for\_flushing

|Name| io\_task\_queue\_size\_for\_flushing          |
|:---:|:----------------------------------------------|
|Description| size of ioTaskQueue. The default value is 10  |
|Type| Int32                                         |
|Default| 10                                            |
|Effective| After restart system                          |

* enable\_query\_memory\_estimation

|Name| enable\_query\_memory\_estimation |
|:---:|:----------------------------------|
|Description| If true, we will estimate each query's possible memory footprint before executing it and deny it if its estimated memory exceeds current free memory |
|Type| bool                              |
|Default| true                              |
|Effective|hot-load|

* partition\_cache\_size

|Name| partition\_cache\_size |
|:---:|:---|
|Description| The max num of partition info record cached on DataNode. |
|Type| Int32 |
|Default| 1000 |
|Effective|After restarting system|

### Schema Engine Configuration

* schema\_engine\_mode

|    Name     | schema\_engine\_mode                                                                                                                                                                                                                                                     |
|:-----------:|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Description | Schema engine mode, supporting Memory and PBTree modes; PBTree mode support evict the timeseries schema temporarily not used in memory at runtime, and load it into memory from disk when needed. This parameter must be the same on all DataNodes in one cluster. |
|    Type     | string                                                                                                                                                                                                                                                                   |
|   Default   | Memory                                                                                                                                                                                                                                                                   |
|  Effective  | Only allowed to be modified in first start up                                                                                                                                                                                                                            |

* mlog\_buffer\_size

|Name| mlog\_buffer\_size |
|:---:|:---|
|Description| size of log buffer in each metadata operation plan(in byte) |
|Type|int32|
|Default| 1048576 |
|Effective|After restart system|

* sync\_mlog\_period\_in\_ms

|    Name     | sync\_mlog\_period\_in\_ms                                                                                                                                                                         |
| :---------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Description | The cycle when metadata log is periodically forced to be written to disk(in milliseconds). If force_mlog_period_in_ms = 0 it means force metadata log to be written to disk after each refreshment |
|    Type     | Int64                                                                                                                                                                                              |
|   Default   | 100                                                                                                                                                                                                |
|  Effective  | After restarting system                                                                                                                                                                               |

* tag\_attribute\_flush\_interval

|Name| tag\_attribute\_flush\_interval                                                                                                                                                                                                                |
|:---:|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|Description| interval num for tag and attribute records when force flushing to disk. When a certain amount of tag and attribute records is reached, they will be force flushed to disk. It is possible to lose at most tag_attribute_flush_interval records |
|Type| int32                                                                                                                                                                                                                                          |
|Default| 1000                                                                                                                                                                                                                                           |
|Effective| Only allowed to be modified in first start up                                                                                                                                                                                                  |

* tag\_attribute\_total\_size

|Name| tag\_attribute\_total\_size |
|:---:|:---|
|Description| The maximum persistence size of tags and attributes of each time series.|
|Type| int32 |
|Default| 700 |
|Effective|Only allowed to be modified in first start up|

* schema\_region\_device\_node\_cache\_size

|Name| schema\_region\_device\_node\_cache\_size |
|:---:|:--------------------------------|
|Description| The max num of device node, used for speeding up device query, cached in schemaRegion.      |
|Type| Int32                           |
|Default| 10000                          |
|Effective|After restarting system|

* max\_measurement\_num\_of\_internal\_request

|Name| max\_measurement\_num\_of\_internal\_request |
|:---:|:--------------------------------|
|Description| When there's too many measurements in one create timeseries plan, the plan will be split to several sub plan, with measurement num no more than this param.|
|Type| Int32                           |
|Default| 10000                          |
|Effective|After restarting system|

### Configurations for creating schema automatically

* enable\_auto\_create\_schema

|    Name     | enable\_auto\_create\_schema                                                  |
| :---------: | :---------------------------------------------------------------------------- |
| Description | whether auto create the time series when a non-existed time series data comes |
|    Type     | true or false                                                                 |
|   Default   | true                                                                          |
|  Effective  | After restarting system                                                       |

* default\_storage\_group\_level

|    Name     | default\_storage\_group\_level                                                                                                                                                                             |
| :---------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Description | Database level when creating schema automatically is enabled. For example, if we receives a data point from root.sg0.d1.s2, we will set root.sg0 as the database if database level is 1. (root is level 0) |
|    Type     | integer                                                                                                                                                                                                    |
|   Default   | 1                                                                                                                                                                                                          |
|  Effective  | After restarting system                                                                                                                                                                                    |

* boolean\_string\_infer\_type

|    Name     | boolean\_string\_infer\_type                                  |
| :---------: | :------------------------------------------------------------ |
| Description | To which type the values "true" and "false" should be reslved |
|    Type     | BOOLEAN or TEXT                                               |
|   Default   | BOOLEAN                                                       |
|  Effective  | After restarting system                                       |

* integer\_string\_infer\_type

|    Name     | integer\_string\_infer\_type                                            |
| :---------: | :---------------------------------------------------------------------- |
| Description | To which type an integer string like "67" in a query should be resolved |
|    Type     | INT32, INT64, DOUBLE, FLOAT or TEXT                                     |
|   Default   | DOUBLE                                                                  |
|  Effective  | After restarting system                                                 |

* floating\_string\_infer\_type

|    Name     | floating\_string\_infer\_type                                                   |
| :---------: |:--------------------------------------------------------------------------------|
| Description | To which type a floating number string like "6.7" in a query should be resolved |
|    Type     | DOUBLE, FLOAT or TEXT                                                           |
|   Default   | DOUBLE                                                                          |
|  Effective  | After restarting system                                                         |

* nan\_string\_infer\_type

|    Name     | nan\_string\_infer\_type                                  |
| :---------: | :-------------------------------------------------------- |
| Description | To which type the value NaN in a query should be resolved |
|    Type     | DOUBLE, FLOAT or TEXT                                     |
|   Default   | FLOAT                                                     |
|  Effective  | After restarting system                                   |

### Query Configurations

* read\_consistency\_level

|    Name     | mpp\_data\_exchange\_core\_pool\_size        |
|:-----------:|:---------------------------------------------|
| Description | The read consistency level, <br>1. strong(Default, read from the leader replica) <br>2. weak(Read from a random replica) |
|    Type     | string                                          |
|   Default   | strong                                           |
|  Effective  | After restarting system                      |

* meta\_data\_cache\_enable

|Name| meta\_data\_cache\_enable |
|:---:|:---|
|Description| Whether to cache meta data(BloomFilter, ChunkMetadata and TimeSeriesMetadata) or not.|
|Type|Boolean|
|Default| true |
|Effective| After restarting system|

* chunk\_timeseriesmeta\_free\_memory\_proportion

|Name| chunk\_timeseriesmeta\_free\_memory\_proportion                                                                                                                           |
|:---:|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|Description| Read memory Allocation Ratio: BloomFilterCache : ChunkCache : TimeSeriesMetadataCache : Coordinator : Operators : DataExchange : timeIndex in TsFileResourceList : others. |
|Default| 1 : 100 : 200 : 300 : 400   |
|Effective| After restarting system |

* enable\_last\_cache

|Name| enable\_last\_cache |
|:---:|:---|
|Description| Whether to enable LAST cache. |
|Type| Boolean |
|Default| true |
|Effective|After restarting system|

* max\_deduplicated\_path\_num

|Name| max\_deduplicated\_path\_num |
|:---:|:---|
|Description| allowed max numbers of deduplicated path in one query. |
|Type| Int32 |
|Default| 1000 |
|Effective|After restarting system|

* mpp\_data\_exchange\_core\_pool\_size

|    Name     | mpp\_data\_exchange\_core\_pool\_size        |
|:-----------:|:---------------------------------------------|
| Description | Core size of ThreadPool of MPP data exchange |
|    Type     | int32                                          |
|   Default   | 10                                           |
|  Effective  | After restarting system                      |

* mpp\_data\_exchange\_max\_pool\_size

|    Name     | mpp\_data\_exchange\_max\_pool\_size        |
| :---------: | :------------------------------------------ |
| Description | Max size of ThreadPool of MPP data exchange |
|    Type     | int32                                         |
|   Default   | 10                                          |
|  Effective  | After restarting system                     |

* mpp\_data\_exchange\_keep\_alive\_time\_in\_ms

|Name| mpp\_data\_exchange\_keep\_alive\_time\_in\_ms |
|:---:|:---|
|Description| Max waiting time for MPP data exchange |
|Type| long |
|Default| 1000 |
|Effective|After restarting system|

* driver\_task\_execution\_time\_slice\_in\_ms

|    Name     | driver\_task\_execution\_time\_slice\_in\_ms |
| :---------: | :------------------------------------------- |
| Description | Maximum execution time of a DriverTask       |
|    Type     | int32                                          |
|   Default   | 100                                          |
|  Effective  | After restarting system                      |

* max\_tsblock\_size\_in\_bytes

|    Name     | max\_tsblock\_size\_in\_bytes |
| :---------: | :---------------------------- |
| Description | Maximum capacity of a TsBlock |
|    Type     | int32                           |
|   Default   | 1024 * 1024 (1 MB)            |
|  Effective  | After restarting system       |

* max\_tsblock\_line\_numbers

|    Name     | max\_tsblock\_line\_numbers                 |
| :---------: | :------------------------------------------ |
| Description | Maximum number of lines in a single TsBlock |
|    Type     | int32                                         |
|   Default   | 1000                                        |
|  Effective  | After restarting system                     |

* slow\_query\_threshold

|Name| slow\_query\_threshold                  |
|:---:|:----------------------------------------|
|Description| Time cost(ms) threshold for slow query. |
|Type| Int32                                   |
|Default| 30000                                   |
|Effective| Trigger                                 |

* query\_timeout\_threshold

|Name| query\_timeout\_threshold |
|:---:|:---|
|Description| The max executing time of query. unit: ms |
|Type| Int32 |
|Default| 60000 |
|Effective| After restarting system|

* max\_allowed\_concurrent\_queries

|Name| max\_allowed\_concurrent\_queries |
|:---:|:---|
|Description| The maximum allowed concurrently executing queries. |
|Type| Int32 |
|Default| 1000 |
|Effective|After restarting system|

* query\_thread\_count

|Name| query\_thread\_count                                                                                            |
|:---:|:---------------------------------------------------------------------------------------------------------------------|
|Description| How many threads can concurrently execute query statement. When <= 0, use CPU core number. |
|Type| Int32                                                               |
|Default | CPU core number                                                    |
|Effective| After restarting system |

* batch\_size

|Name| batch\_size |
|:---:|:---|
|Description| The amount of data iterate each time in server (the number of data strips, that is, the number of different timestamps.) |
|Type| Int32 |
|Default| 100000 |
|Effective|After restarting system|

* sort\_buffer\_size\_in\_bytes

|Name| sort\_buffer\_size\_in\_bytes                                                                                                                                                                                                                                                     |
|:---:|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|Description| Sort buffer size, in bytes.                                                                                                                                                                                                                                                                     |
|Type| Long                                                                                                                                                                                                                                                                              |
|Default| Before V1.3.6: 1048576 (equivalent to 1MB);<br> From V1.3.6 onwards (including all V1.x versions): 0.The memory rule for external sort in the sort operator is as follows: When the data size is smaller than the sort buffer size (sort_buffer_size_in_bytes, in bytes), the sort operator will use in-memory sort. If sort_buffer_size_in_bytes ≤ 0, the default value is used. The default value is calculated as the minimum of 32MB and (memory for query operators / query_thread_count / 2). If sort_buffer_size_in_bytes > 0, the specified value is used. |
|Effective| Hot Reload                                                                                                                                                                                                                                                                               |



### TTL Configuration
* ttl\_check\_interval

|    Name     | ttl\_check\_interval                                                           |
|:-----------:|:-------------------------------------------------------------------------------|
| Description | The interval of TTL check task in each database. Unit: ms. Default is 2 hours. |
|    Type     | int                                                                            |
|   Default   | 7200000                                                                        |
|  Effective  | After restarting system                                                        |

* max\_expired\_time

|     Name     | max\_expired\_time                                                                                                                                |
| :----------: |:--------------------------------------------------------------------------------------------------------------------------------------------------|
|     Description     | If a file contains device that has expired for more than this duration, then the file will be settled immediately. Unit: ms.  Default is 1 month. |
|     Type     | int                                                                                                                                               |
|    Default    | 2592000000                                                                                                                                        |
| Effective | After restarting system                                                                                                                           |

* expired\_data\_ratio

|     Name     | expired\_data\_ratio                                                                                                                                    |
| :----------: |:--------------------------------------------------------------------------------------------------------------------------------------------------------|
|     Description     | The expired device ratio. If the ratio of expired devices in one file exceeds this value, then expired data of this file will be cleaned by compaction. |
|     Type     | float                                                                                                                                                   |
|    Default    | 0.3                                                                                                                                                     |
| Effective | After restarting system                                                                                                                                 |


### Storage Engine Configuration

* timestamp\_precision

|     Name     | timestamp\_precision        |
| :----------: | :-------------------------- |
|     Description     | timestamp precision，support ms、us、ns |
|     Type     | String                      |
|    Default    | ms                          |
| Effective | Only allowed to be modified in first start up                   |

* tier\_ttl\_in\_ms

|Name| tier\_ttl\_in\_ms  |
|:---:|:--------------|
|Description| Define the maximum age of data for which each tier is responsible		 |
|Type| long         |
|Default| -1          |
|Effective| After restarting system          |

* max\_waiting\_time\_when\_insert\_blocked

|    Name     | max\_waiting\_time\_when\_insert\_blocked                                     |
| :---------: |:------------------------------------------------------------------------------|
| Description | When the waiting time(in ms) of an inserting exceeds this, throw an exception |
|    Type     | Int32                                                                         |
|   Default   | 10000                                                                         |
|  Effective  | After restarting system                                                       |

* handle\_system\_error

|    Name     | handle\_system\_error                                  |
| :---------: |:-------------------------------------------------------|
| Description | What will the system do when unrecoverable error occurs|
|    Type     | String                                                 |
|   Default   | CHANGE\_TO\_READ\_ONLY                                 |
|  Effective  | After restarting system                                |

* write\_memory\_variation\_report\_proportion

|    Name     | write\_memory\_variation\_report\_proportion                                                                 |
| :---------: | :----------------------------------------------------------------------------------------------------------- |
| Description | if memory cost of data region increased more than proportion of allocated memory for write, report to system |
|    Type     | Double                                                                                                       |
|   Default   | 0.001                                                                                                        |
|  Effective  | After restarting system                                                                                      |

* enable\_timed\_flush\_seq\_memtable

|    Name     | enable\_timed\_flush\_seq\_memtable             |
|:-----------:|:------------------------------------------------|
| Description | whether to enable timed flush sequence memtable |
|    Type     | Boolean                                         |
|   Default   | true                                            |
|  Effective  | hot-load                                        |

* seq\_memtable\_flush\_interval\_in\_ms

|    Name     | seq\_memtable\_flush\_interval\_in\_ms                                                                   |
|:-----------:|:---------------------------------------------------------------------------------------------------------|
| Description | if a memTable's created time is older than current time minus this, the memtable will be flushed to disk |
|    Type     | int32                                                                                                    |
|   Default   | 10800000                                                                                                 |
|  Effective  | hot-load                                                                                                 |

* seq\_memtable\_flush\_check\_interval\_in\_ms

|Name| seq\_memtable\_flush\_check\_interval\_in\_ms |
|:---:|:---|
|Description| the interval to check whether sequence memtables need flushing |
|Type|int32|
|Default| 600000 |
|Effective| hot-load |

* enable\_timed\_flush\_unseq\_memtable

|Name| enable\_timed\_flush\_unseq\_memtable |
|:---:|:---|
|Description| whether to enable timed flush unsequence memtable |
|Type|Boolean|
|Default| false |
|Effective| hot-load |

* unseq\_memtable\_flush\_interval\_in\_ms

|    Name     | unseq\_memtable\_flush\_interval\_in\_ms                                                                 |
|:-----------:|:---------------------------------------------------------------------------------------------------------|
| Description | if a memTable's created time is older than current time minus this, the memtable will be flushed to disk |
|    Type     | int32                                                                                                    |
|   Default   | 600000                                                                                                 |
|  Effective  | hot-load                                                                                                 |

* unseq\_memtable\_flush\_check\_interval\_in\_ms

|Name| unseq\_memtable\_flush\_check\_interval\_in\_ms |
|:---:|:---|
|Description| the interval to check whether unsequence memtables need flushing |
|Type|int32|
|Default| 30000 |
|Effective| hot-load |

* tvlist\_sort\_algorithm

|Name| tvlist\_sort\_algorithm                           |
|:---:|:--------------------------------------------------|
|Description| the sort algorithm used in the memtable's TVList  |
|Type| String                                            |
|Default| TIM                                               |
|Effective| After restarting system                           |

* avg\_series\_point\_number\_threshold

|Name| avg\_series\_point\_number\_threshold                  |
|:---:|:-------------------------------------------------------|
|Description| max average number of point of each series in memtable |
|Type| int32                                                  |
|Default| 100000                                                 |
|Effective| After restarting system                                |

* flush\_thread\_count

|Name| flush\_thread\_count |
|:---:|:---|
|Description| The thread number used to perform the operation when IoTDB writes data in memory to disk. If the value is less than or equal to 0, then the number of CPU cores installed on the machine is used. The default is 0.|
|Type| int32 |
|Default| 0 |
|Effective|After restarting system|

* enable\_partial\_insert

|Name| enable\_partial\_insert |
|:---:|:---|
|Description| Whether continue to write other measurements if some measurements are failed in one insertion.|
|Type| Boolean |
|Default| true |
|Effective|After restarting system|

* recovery\_log\_interval\_in\_ms

|Name| recovery\_log\_interval\_in\_ms                                         |
|:---:|:------------------------------------------------------------------------|
|Description| the interval to log recover progress of each region when starting iotdb |
|Type| Int32                                                                   |
|Default| 5000                                                                    |
|Effective| After restarting system                                                 |

* 0.13\_data\_insert\_adapt

|Name| 0.13\_data\_insert\_adapt                                             |
|:---:|:----------------------------------------------------------------------|
|Description| if using v0.13 client to insert data, set this configuration to true. |
|Type| Boolean                                                               |
|Default| false                                                                 |
|Effective| After restarting system                                               |


* device\_path\_cache\_size

|   Name    | device\_path\_cache\_size                                                                                                 |
|:---------:|:--------------------------------------------------------------------------------------------------------------------------|
|Description| The max size of the device path cache. This cache is for avoiding initialize duplicated device id object in write process |
|   Type    | Int32                                                                                                                     |
|  Default  | 500000                                                                                                                    |
| Effective | After restarting system                                                                                                   |

* insert\_multi\_tablet\_enable\_multithreading\_column\_threshold

|    Name     | insert\_multi\_tablet\_enable\_multithreading\_column\_threshold                                     |
| :---------: | :--------------------------------------------------------------------------------------------- |
| Description | When the insert plan column count reaches the specified threshold, multi-threading is enabled. |
|    Type     | int32                                                        |
|   Default   | 10                                                           |
|  Effective  | After restarting system                                      |

### Compaction Configurations

* enable\_seq\_space\_compaction

|    Name     | enable\_seq\_space\_compaction               |
| :---------: |:---------------------------------------------|
| Description | enable the compaction between sequence files |
|    Type     | Boolean                                      |
|   Default   | true                                         |
|  Effective  | hot-load                                     |

* enable\_unseq\_space\_compaction

|    Name     | enable\_unseq\_space\_compaction               |
| :---------: |:-----------------------------------------------|
| Description | enable the compaction between unsequence files |
|    Type     | Boolean                                        |
|   Default   | true                                           |
|  Effective  | hot-load                                       |

* enable\_cross\_space\_compaction

|    Name     | enable\_cross\_space\_compaction                                  |
| :---------: |:------------------------------------------------------------------|
| Description | enable the compaction between sequence files and unsequence files |
|    Type     | Boolean                                                           |
|   Default   | true                                                              |
|  Effective  | hot-load                                                             |

* enable\_auto\_repair\_compaction

|    Name     | enable\_auto\_repair\_compaction                                  |
| :---------: |:------------------------------------------------------------------|
| Description | enable auto repair unsorted file by compaction |
|    Type     | Boolean                                                           |
|   Default   | true                                                              |
|  Effective  | hot-load                                                             |

* cross\_selector

|Name| cross\_selector                                  |
|:---:|:-------------------------------------------------|
|Description| the task selector type of cross space compaction |
|Type| String                                           |
|Default| rewrite                                          |
|Effective| After restart system                             |

* cross\_performer

|Name| cross\_performer                                   |
|:---:|:---------------------------------------------------|
|Description| the task performer type of cross space compaction. The options are read_point and fast, read_point is the default and fast is still under test |
|Type| String                                             |
|Default| read\_point                                        |
|Effective| After restart system                               |

* inner\_seq\_selector

|Name| inner\_seq\_selector                                                                                                         |
|:---:|:-----------------------------------------------------------------------------------------------------------------------------|
|Description| the task selector type of inner sequence space compaction. Options: size\_tiered\_single_\target,size\_tiered\_multi\_target |
|Type| String                                                                                                                       |
|Default| hot-load                                                                                                                     |
|Effective| hot-load                                                                                                                     |

* inner\_seq\_performer

|Name| inner\_seq\_peformer                                                                                                                                    |
|:---:|:--------------------------------------------------------------------------------------------------------------------------------------------------------|
|Description| the task performer type of inner sequence space compaction. The options are read_chunk and fast, read_chunk is the default and fast is still under test |
|Type| String                                                                                                                                                  |
|Default| read\_chunk                                                                                                                                             |
|Effective| After restart system                                                                                                                                    |

* inner\_unseq\_selector

|Name| inner\_unseq\_selector                                      |
|:---:|:------------------------------------------------------------|
|Description| the task selector type of inner unsequence space compactionn. Options: size\_tiered\_single_\target,size\_tiered\_multi\_target |
|Type| String                                                      |
|Default| hot-load                                                |
|Effective| hot-load                                         |

* inner\_unseq\_performer

|Name| inner\_unseq\_peformer                                        |
|:---:|:--------------------------------------------------------------|
|Description| the task performer type of inner unsequence space compaction. The options are read_point and fast, read_point is the default and fast is still under test |
|Type| String                                                        |
|Default| read\_point                                                   |
|Effective| After restart system                                          |

* compaction\_priority

|    Name     | compaction\_priority                                                                                                                                                                                                                                                                       |
| :---------: |:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Description | Priority of compaction task. When it is BALANCE, system executes all types of compaction equally; when it is INNER\_CROSS, system takes precedence over executing inner space compaction task; when it is CROSS\_INNER, system takes precedence over executing cross space compaction task |
|    Type     | String                                                                                                                                                                                                                                                                                     |
|   Default   | INNER_CROSS                                                                                                                                                                                                                                                                                |
|  Effective  | After restart system                                                                                                                                                                                                                                                                       |

* target\_compaction\_file\_size

|    Name     | target\_compaction\_file\_size                 |
| :---------: |:-----------------------------------------------|
| Description | The target file size in compaction |
|    Type     | Int64                                          |
|   Default   | 2147483648                                     |
|  Effective  | After restart system                           |

* target\_chunk\_size

|    Name     | target\_chunk\_size                |
| :---------: | :--------------------------------- |
| Description | The target size of compacted chunk |
|    Type     | Int64                              |
|   Default   | 1048576                            |
|  Effective  | After restart system               |

* target\_chunk\_point\_num

|Name| target\_chunk\_point\_num |
|:---:|:---|
|Description| The target point number of compacted chunk |
|Type| int32 |
|Default| 100000 |
|Effective|After restart system|

* chunk\_size\_lower\_bound\_in\_compaction

|    Name     | chunk\_size\_lower\_bound\_in\_compaction                                               |
| :---------: |:----------------------------------------------------------------------------------------|
| Description | A source chunk will be deserialized in compaction when its size is less than this value |
|    Type     | Int64                                                                                   |
|   Default   | 10240                                                                                   |
|  Effective  | After restart system                                                                    |

* chunk\_point\_num\_lower\_bound\_in\_compaction

|Name| chunk\_point\_num\_lower\_bound\_in\_compaction                                              |
|:---:|:---------------------------------------------------------------------------------------------|
|Description| A source chunk will be deserialized in compaction when its point num is less than this value |
|Type| int32                                                                                        |
|Default| 1000                                                                                         |
|Effective| After restart system                                                                         |

* inner\_compaction\_total\_file\_num\_threshold

|Name| inner\_compaction\_total\_file\_num\_threshold           |
|:---:|:---------------------------------------------------------|
|Description| The max num of files encounter in inner space compaction |
|Type| int32                                                    |
|Default| 100                                                      |
|Effective| hot-load                                                 |

* inner\_compaction\_total\_file\_size\_threshold

|Name| inner\_compaction\_total\_file\_size\_threshold                 |
|:---:|:----------------------------------------------------------------|
|Description| The total file size limit in inner space compaction. Unit: byte |
|Type| int64                                                           |
|Default| 10737418240                                                     |
|Effective| hot-load                                                        |

* compaction\_max\_aligned\_series\_num\_in\_one\_batch

|Name| compaction\_max\_aligned\_series\_num\_in\_one\_batch               |
|:---:|:--------------------------------------------------------------------|
|Description| How many value chunk will be compacted in aligned series compaction |
|Type| int32                                                               |
|Default| 10                                                                  |
|Effective| hot-load                                                            |

* max\_level\_gap\_in\_inner\_compaction

|Name| max\_level\_gap\_in\_inner\_compaction          |
|:---:|:------------------------------------------------|
|Description| The max level gap in inner compaction selection |
|Type| int32                                           |
|Default| 2                                               |
|Effective| hot-load                                        |

* inner\_compaction\_candidate\_file\_num

|Name| inner\_compaction\_candidate\_file\_num                                        |
|:---:|:-------------------------------------------------------------------------------|
|Description| The file num requirement when selecting inner space compaction candidate files |
|Type| int32                                                                          |
|Default| 30                                                                             |
|Effective| hot-load                                                                       |

* max\_cross\_compaction\_file\_num

|Name| max\_cross\_compaction\_candidate\_file\_num             |
|:---:|:---------------------------------------------------------|
|Description| The max num of files encounter in cross space compaction |
|Type| int32                                                    |
|Default| 500                                                      |
|Effective| hot-load                                                 |

* max\_cross\_compaction\_file\_size

|Name| max\_cross\_compaction\_candidate\_file\_size             |
|:---:|:----------------------------------------------------------|
|Description| The max size of files encounter in cross space compaction |
|Type| Int64                                                     |
|Default| 5368709120                                                |
|Effective| hot-load                                                  |

* compaction\_thread\_count

|Name| compaction\_thread\_count        |
|:---:|:---------------------------------|
|Description| thread num to execute compaction |
|Type| int32                            |
|Default| 10                               |
|Effective| hot-load     |

* compaction\_schedule\_interval\_in\_ms

|    Name     | compaction\_schedule\_interval\_in\_ms |
| :---------: | :------------------------------------- |
| Description | interval of scheduling compaction      |
|    Type     | Int64                                  |
|   Default   | 60000                                  |
|  Effective  | After restart system                   |

* compaction\_submission\_interval\_in\_ms

|    Name     | compaction\_submission\_interval\_in\_ms |
| :---------: | :--------------------------------------- |
| Description | interval of submitting compaction task   |
|    Type     | Int64                                    |
|   Default   | 60000                                    |
|  Effective  | After restart system                     |

* compaction\_write\_throughput\_mb\_per\_sec

|Name| compaction\_write\_throughput\_mb\_per\_sec      |
|:---:|:-------------------------------------------------|
|Description| The write rate of all compaction tasks in MB/s, values less than or equal to 0 means no limit |
|Type| int32                                            |
|Default| 16                                               |
|Effective| hot-load                                         |

* compaction\_read\_throughput\_mb\_per\_sec

|Name| compaction\_read\_throughput\_mb\_per\_sec     |
|:---:|:------------------------------------------------|
|Description| The read rate of all compaction tasks in MB/s, values less than or equal to 0 means no limit |
|Type| int32                                           |
|Default| 0                                               |
|Effective| hot-load                                        |

* compaction\_read\_operation\_per\_sec

|Name| compaction\_read\_operation\_per\_sec                                                                          |
|:---:|:---------------------------------------------------------------------------------------------------------------|
|Description| The read operation of all compaction tasks can reach per second, values less than or equal to 0 means no limit |
|Type| int32                                                                                                          |
|Default| 0                                                                                                              |
|Effective| hot-load                                                                                                       |

* sub\_compaction\_thread\_count

|Name| sub\_compaction\_thread\_count                                            |
|:---:|:--------------------------------------------------------------------------|
|Description| the number of sub-compaction threads to accelerate cross space compaction |
|Type| Int32                                                                     |
|Default| 4                                                                         |
|Effective| hot-load                                                            |

* enable\_tsfile\_validation

|    Name     | enable\_tsfile\_validation                                                |
|:-----------:|:--------------------------------------------------------------------------|
| Description | Verify that TSfiles generated by Flush, Load, and Compaction are correct. |
|    Type     | boolean                                                                   |
|   Default   | false                                                                     |
|  Effective  | hot-load                                                                  |

* candidate\_compaction\_task\_queue\_size

|Name| candidate\_compaction\_task\_queue\_size    |
|:---:|:--------------------------------------------|
|Description| The size of candidate compaction task queue |
|Type| Int32                                       |
|Default| 50                                          |
|Effective| After restart system                        |

* compaction\_schedule\_thread\_num

|Name| compaction\_schedule\_thread\_num                                         |
|:---:|:--------------------------------------------------------------------------|
|Description| The number of threads to be set up to select compaction task. |
|Type| Int32                                                                     |
|Default| 4                                                                         |
|Effective| hot-load                                                                  |

### Write Ahead Log Configuration

* wal\_mode

|    Name     | wal\_mode                                                                                                                                                                                                                                                                                                                                                               |
|:-----------:|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Description | The write mode of wal. For DISABLE mode, the system will disable wal. For SYNC mode, the system will submit wal synchronously, write request will not return until its wal is fsynced to the disk successfully. For ASYNC mode, the system will submit wal asynchronously, write request will return immediately no matter its wal is fsynced to the disk successfully. |
|    Type     | String                                                                                                                                                                                                                                                                                                                                                                  |
|   Default   | ASYNC                                                                                                                                                                                                                                                                                                                                                                   |
|  Effective  | After restart system                                                                                                                                                                                                                                                                                                                                                    |

* max\_wal\_nodes\_num

|    Name     | max\_wal\_nodes\_num                                                                                                                   |
|:-----------:|:---------------------------------------------------------------------------------------------------------------------------------------|
| Description | Max number of wal nodes, each node corresponds to one wal directory. The default value 0 means the number is determined by the system. |
|    Type     | int32                                                                                                                                  |
|   Default   | 0                                                                                                                                      |
|  Effective  | After restart system                                                                                                                   |

* wal\_async\_mode\_fsync\_delay\_in\_ms

|    Name     | wal\_async\_mode\_fsync\_delay\_in\_ms                                          |
|:-----------:|:--------------------------------------------------------------------------------|
| Description | Duration a wal flush operation will wait before calling fsync in the async mode |
|    Type     | int32                                                                           |
|   Default   | 1000                                                                            |
|  Effective  | hot-load                                                                        |

* wal\_sync\_mode\_fsync\_delay\_in\_ms

|    Name     | wal\_sync\_mode\_fsync\_delay\_in\_ms                                          |
|:-----------:|:-------------------------------------------------------------------------------|
| Description | Duration a wal flush operation will wait before calling fsync in the sync mode |
|    Type     | int32                                                                          |
|   Default   | 3                                                                              |
|  Effective  | hot-load                                                                       |

* wal\_buffer\_size\_in\_byte

|    Name     | wal\_buffer\_size\_in\_byte  |
|:-----------:|:-----------------------------|
| Description | Buffer size of each wal node |
|    Type     | int32                        |
|   Default   | 33554432                     |
|  Effective  | After restart system         |

* wal\_buffer\_queue\_capacity

|    Name     | wal\_buffer\_queue\_capacity               |
|:-----------:|:-------------------------------------------|
| Description | Blocking queue capacity of each wal buffer |
|    Type     | int32                                      |
|   Default   | 500                                        |
|  Effective  | After restart system                       |

* wal\_file\_size\_threshold\_in\_byte

|    Name     | wal\_file\_size\_threshold\_in\_byte |
|:-----------:|:-------------------------------------|
| Description | Size threshold of each wal file      |
|    Type     | int32                                |
|   Default   | 31457280                             |
|  Effective  | hot-load                             |

* wal\_min\_effective\_info\_ratio

|    Name     | wal\_min\_effective\_info\_ratio                    |
|:-----------:|:----------------------------------------------------|
| Description | Minimum ratio of effective information in wal files |
|    Type     | double                                              |
|   Default   | 0.1                                                 |
|  Effective  | hot-load                                            |

* wal\_memtable\_snapshot\_threshold\_in\_byte

|    Name     | wal\_memtable\_snapshot\_threshold\_in\_byte                    |
|:-----------:|:----------------------------------------------------------------|
| Description | MemTable size threshold for triggering MemTable snapshot in wal |
|    Type     | int64                                                           |
|   Default   | 8388608                                                         |
|  Effective  | hot-load                                                        |

* max\_wal\_memtable\_snapshot\_num

|    Name     | max\_wal\_memtable\_snapshot\_num     |
|:-----------:|:--------------------------------------|
| Description | MemTable's max snapshot number in wal |
|    Type     | int32                                 |
|   Default   | 1                                     |
|  Effective  | hot-load                              |

* delete\_wal\_files\_period\_in\_ms

|    Name     | delete\_wal\_files\_period\_in\_ms                          |
|:-----------:|:------------------------------------------------------------|
| Description | The period when outdated wal files are periodically deleted |
|    Type     | int64                                                       |
|   Default   | 20000                                                       |
|  Effective  | hot-load                                                    |

### TsFile Configurations

* group\_size\_in\_byte

|Name|group\_size\_in\_byte|
|:---:|:---|
|Description|The data size written to the disk per time|
|Type|int32|
|Default| 134217728 |
|Effective|hot-load|

* page\_size\_in\_byte

|Name| page\_size\_in\_byte |
|:---:|:---|
|Description|The maximum size of a single page written in memory when each column in memory is written (in bytes)|
|Type|int32|
|Default| 65536 |
|Effective|hot-load|

* max\_number\_of\_points\_in\_page

|Name| max\_number\_of\_points\_in\_page                                                  |
|:---:|:-----------------------------------------------------------------------------------|
|Description| The maximum number of data points (timestamps - valued groups) contained in a page |
|Type| int32                                                                              |
|Default| 10000                                                                              |
|Effective| hot-load                                                                            |

* pattern\_matching\_threshold

|Name| pattern\_matching\_threshold       |
|:---:|:-----------------------------------|
|Description| Max matching time of regex pattern |
|Type| int32                              |
|Default| 1000000                              |
|Effective| hot-load                           |

* max\_degree\_of\_index\_node

|Name| max\_degree\_of\_index\_node |
|:---:|:---|
|Description|The maximum degree of the metadata index tree (that is, the max number of each node's children)|
|Type|int32|
|Default| 256 |
|Effective|Only allowed to be modified in first start up|

* max\_string\_length

|Name| max\_string\_length |
|:---:|:---|
|Description|The maximum length of a single string (number of character)|
|Type|int32|
|Default| 128 |
|Effective|hot-load|

* value\_encoder

|    Name     | value\_encoder                        |
| :---------: | :------------------------------------ |
| Description | Encoding type of value column         |
|    Type     | Enum String: “TS_2DIFF”,“PLAIN”,“RLE” |
|   Default   | PLAIN                                 |
|  Effective  | hot-load                               |

* float\_precision

|Name| float\_precision |
|:---:|:---|
|Description| The precision of the floating point number.(The number of digits after the decimal point) |
|Type|int32|
|Default| The default is 2 digits. Note: The 32-bit floating point number has a decimal precision of 7 bits, and the 64-bit floating point number has a decimal precision of 15 bits. If the setting is out of the range, it will have no practical significance. |
|Effective|hot-load|

* compressor

|    Name     | compressor                                                             |
|:-----------:|:-----------------------------------------------------------------------|
| Description | Data compression method; Time compression method in aligned timeseries |
|    Type     | Enum String : "UNCOMPRESSED", "SNAPPY", "LZ4", "ZSTD", "LZMA2"         |
|   Default   | SNAPPY                                                                 |
|  Effective  | hot-load                                                               |

* bloomFilterErrorRate

|    Name     | bloomFilterErrorRate                                                                                                                                                                                                                                                                                                                                                                                             |
| :---------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Description | The false positive rate of bloom filter in each TsFile. Bloom filter checks whether a given time series is in the tsfile before loading metadata. This can improve the performance of loading metadata and skip the tsfile that doesn't contain specified time series. If you want to learn more about its mechanism, you can refer to: [wiki page of bloom filter](https://en.wikipedia.org/wiki/Bloom_filter). |
|    Type     | float, (0, 1)                                                                                                                                                                                                                                                                                                                                                                                                    |
|   Default   | 0.05                                                                                                                                                                                                                                                                                                                                                                                                             |
|  Effective  | After restarting system                                                                                                                                                                                                                                                                                                                                                                                          |


### Authorization Configuration

* authorizer\_provider\_class

|          Name          | authorizer\_provider\_class                             |
| :--------------------: | :------------------------------------------------------ |
|      Description       | the class name of the authorization service             |
|          Type          | String                                                  |
|        Default         | org.apache.iotdb.commons.auth.authorizer.LocalFileAuthorizer |
|       Effective        | After restarting system                                 |
| Other available values | org.apache.iotdb.commons.auth.authorizer.OpenIdAuthorizer    |

* openID\_url

|    Name     | openID\_url                                      |
| :---------: | :----------------------------------------------- |
| Description | the openID server if OpenIdAuthorizer is enabled |
|    Type     | String (a http url)                              |
|   Default   | no                                               |
|  Effective  | After restarting system                          |

* iotdb\_server\_encrypt\_decrypt\_provider

|    Name     | iotdb\_server\_encrypt\_decrypt\_provider                      |
| :---------: | :------------------------------------------------------------- |
| Description | The Class for user password encryption                         |
|    Type     | String                                                         |
|   Default   | org.apache.iotdb.commons.security.encrypt.MessageDigestEncrypt |
|  Effective  | Only allowed to be modified in first start up                  |

* iotdb\_server\_encrypt\_decrypt\_provider\_parameter

|    Name     | iotdb\_server\_encrypt\_decrypt\_provider\_parameter             |
| :---------: | :--------------------------------------------------------------- |
| Description | Parameters used to initialize the user password encryption class |
|    Type     | String                                                           |
|   Default   | 空                                                               |
|  Effective  | After restarting system                                          |

* author\_cache\_size

|    Name     | author\_cache\_size         |
| :---------: | :-------------------------- |
| Description | Cache size of user and role |
|    Type     | int32                       |
|   Default   | 1000                        |
|  Effective  | After restarting system     |

* author\_cache\_expire\_time

|    Name     | author\_cache\_expire\_time                       |
| :---------: | :------------------------------------------------ |
| Description | Cache expire time of user and role, Unit: minutes |
|    Type     | int32                                             |
|   Default   | 30                                                |
|  Effective  | After restarting system                           |

### UDF Configuration

* udf\_initial\_byte\_array\_length\_for\_memory\_control

|    Name     | udf\_initial\_byte\_array\_length\_for\_memory\_control                                                                                                          |
| :---------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Description | Used to estimate the memory usage of text fields in a UDF query. It is recommended to set this value to be slightly larger than the average length of all texts. |
|    Type     | int32                                                        |
|   Default   | 48                                                           |
|  Effective  | After restarting system                                      |

* udf\_memory\_budget\_in\_mb

|    Name     | udf\_memory\_budget\_in\_mb                                                                                |
| :---------: | :--------------------------------------------------------------------------------------------------------- |
| Description | How much memory may be used in ONE UDF query (in MB). The upper limit is 20% of allocated memory for read. |
|    Type     | Float                                                                                                      |
|   Default   | 30.0                                                                                                       |
|  Effective  | After restarting system                                                                                    |

* udf\_reader\_transformer\_collector\_memory\_proportion

|    Name     | udf\_reader\_transformer\_collector\_memory\_proportion                                                                             |
| :---------: | :---------------------------------------------------------------------------------------------------------------------------------- |
| Description | UDF memory allocation ratio for reader, transformer and collector. The parameter form is a : b : c, where a, b, and c are integers. |
|    Type     | String                                                                                                                              |
|   Default   | 1:1:1                                                                                                                               |
|  Effective  | After restarting system                                                                                                             |

* udf\_root\_dir

|    Name     | udf\_root\_dir            |
| :---------: | :------------------------ |
| Description | Root directory of UDF     |
|    Type     | String                    |
|   Default   | ext/udf(Windows:ext\\udf) |
|  Effective  | After restarting system   |

* udf\_lib\_dir

|    Name     | udf\_lib\_dir                |
| :---------: | :--------------------------- |
| Description | UDF log and jar file dir     |
|    Type     | String                       |
|   Default   | ext/udf（Windows：ext\\udf） |
|  Effective  | After restarting system      |

### Trigger Configuration


* trigger\_lib\_dir

|    Name     | trigger\_lib\_dir       |
| :---------: |:------------------------|
| Description | Trigger JAR file dir    |
|    Type     | String                  |
|   Default   | ext/trigger             |
|  Effective  | After restarting system |

* stateful\_trigger\_retry\_num\_when\_not\_found

|    Name     | stateful\_trigger\_retry\_num\_when\_not\_found                                    |
| :---------: |:-----------------------------------------------------------------------------------|
| Description | How many times we will retry to found an instance of stateful trigger on DataNodes |
|    Type     | Int32                                                                              |
|   Default   | 3                                                                                  |
|  Effective  | After restarting system                                                            |


### SELECT-INTO

* into\_operation\_buffer\_size\_in\_byte

|    Name     | into\_operation\_buffer\_size\_in\_byte                                                                                            |
| :---------: | :---------------------------------------------------------------------------------------------------------------------------------- |
| Description | When the select-into statement is executed, the maximum memory occupied by the data to be written (unit: Byte) |
|    Type     | int64                                                        |
|   Default   | 100MB                                                        |
|  Effective  | hot-load                                                      |


* select\_into\_insert\_tablet\_plan\_row\_limit

|    Name     | select\_into\_insert\_tablet\_plan\_row\_limit                                                                                            |
| :---------: | :---------------------------------------------------------------------------------------------------------------------------------- |
| Description | The maximum number of rows that can be processed in insert-tablet-plan when executing select-into statements. When <= 0, use 10000. |
|    Type     | int32                                                        |
|   Default   | 10000                                                        |
|  Effective  | hot-load                                                      |

* into\_operation\_execution\_thread\_count

|    Name     | into\_operation\_execution\_thread\_count                     |
| :---------: | :------------------------------------------------------------ |
| Description | The number of threads in the thread pool that execute insert-tablet tasks |
|    Type     | int32                                                         |
|   Default   | 2                                                             |
|  Effective  | After restarting system                                       |

### Continuous Query

* continuous\_query\_execution\_thread

|    Name     | continuous\_query\_execution\_thread                             |
| :---------: | :------------------------------------------------------------ |
| Description | How many threads will be set up to perform continuous queries |
|    Type     | int32                                                        |
|   Default   | max(1, the / 2)                                              |
|  Effective  | After restarting system                                      |

* continuous\_query\_min\_every\_interval

|    Name     | continuous\_query\_min\_every\_interval                 |
| :---------: | :-------------------------------------------------- |
| Description | Minimum every interval to perform continuous query. |
|    Type     | duration                                            |
|   Default   | 1s                                                  |
|  Effective  | After restarting system                             |

### PIPE Configuration

* pipe_lib_dir

| **Name**     | **pipe_lib_dir**               |
| ------------ | -------------------------- |
| Description         | Directory for storing custom Pipe plugins |
| Type         | string                     |
| Default Value       | ext/pipe                   |
| Effective | Not currently supported for modification               |

* pipe_subtask_executor_max_thread_num

| **Name**     | **pipe_subtask_executor_max_thread_num**                         |
| ------------ | ------------------------------------------------------------ |
| Description         | The maximum number of threads that can be used for processors and sinks in Pipe subtasks. The actual value will be the minimum of pipe_subtask_executor_max_thread_num and the maximum of 1 and half of the CPU core count. |
| Type         | int                                                          |
| Default Value       | 5                                                            |
| Effective | After restarting system                                                 |

* pipe_sink_timeout_ms

| **Name**     | **pipe_sink_timeout_ms**                          |
| ------------ | --------------------------------------------- |
| Description         | The connection timeout for Thrift clients in milliseconds. |
| Type         | int                                           |
| Default Value       | 900000                                        |
| Effective | After restarting system                                  |

* pipe_sink_selector_number

| **Name**     | **pipe_sink_selector_number**                                    |
| ------------ | ------------------------------------------------------------ |
| Description         | The maximum number of threads for processing execution results in the iotdb-thrift-async-sink plugin. It is recommended to set this value to be less than or equal to pipe_sink_max_client_number. |
| Type         | int                                                          |
| Default Value       | 4                                                            |
| Effective | After restarting system                                                 |

* pipe_sink_max_client_number

| **Name**     | **pipe_sink_max_client_number**                                 |
| ------------ | ----------------------------------------------------------- |
| Description         | The maximum number of clients that can be used in the iotdb-thrift-async-sink plugin. |
| Type         | int                                                         |
| Default Value       | 16                                                          |
| Effective | After restarting system                                                |

* pipe_air_gap_receiver_enabled

| **Name**     | **pipe_air_gap_receiver_enabled**                                |
| ------------ | ------------------------------------------------------------ |
| Description         | Whether to enable receiving Pipe data through a gateway. The receiver can only return 0 or 1 in TCP mode to indicate whether the data was successfully received. |
| Type         | Boolean                                                      |
| Default Value       | false                                                        |
| Effective | After restarting system                                                 |

* pipe_air_gap_receiver_port

| **Name**     | **pipe_air_gap_receiver_port**           |
| ------------ | ------------------------------------ |
| Description         | The port used by the server to receive Pipe data through a gateway. |
| Type         | int                                  |
| Default Value       | 9780                                 |
| Effective | After restarting system                         |

* pipe_all_sinks_rate_limit_bytes_per_second

| **Name**     | **pipe_all_sinks_rate_limit_bytes_per_second**                   |
| ------------ | ------------------------------------------------------------ |
| Description         | The total number of bytes per second that all Pipe sinks can transmit. When the given value is less than or equal to 0, it indicates there is no limit. The default value is -1, which means there is no limit. |
| Type         | double                                                       |
| Default Value       | -1                                                           |
| Effective  | Can be hot-loaded                                                     |

### IOTConsensus Configuration

* data_region_iot_max_log_entries_num_per_batch

|    Name     | data_region_iot_max_log_entries_num_per_batch                     |
| :---------: | :------------------------------------------------ |
| Description | The maximum log entries num in IoTConsensus Batch |
|    Type     | int32                                             |
|   Default   | 1024                                              |
|  Effective  | After restarting system                           |

* data_region_iot_max_size_per_batch

|    Name     | data_region_iot_max_size_per_batch                     |
| :---------: | :------------------------------------- |
| Description | The maximum size in IoTConsensus Batch |
|    Type     | int32                                  |
|   Default   | 16MB                                   |
|  Effective  | After restarting system                |

* data_region_iot_max_pending_batches_num

|    Name     | data_region_iot_max_pending_batches_num                         |
| :---------: | :---------------------------------------------- |
| Description | The maximum pending batches num in IoTConsensus |
|    Type     | int32                                           |
|   Default   | 12                                              |
|  Effective  | After restarting system                         |

* data_region_iot_max_memory_ratio_for_queue

|    Name     | data_region_iot_max_memory_ratio_for_queue                         |
| :---------: | :------------------------------------------------- |
| Description | The maximum memory ratio for queue in IoTConsensus |
|    Type     | double                                             |
|   Default   | 0.6                                                |
|  Effective  | After restarting system                            |

### RatisConsensus Configuration

* config\_node\_ratis\_log\_appender\_buffer\_size\_max

|   Name   | config\_node\_ratis\_log\_appender\_buffer\_size\_max |
|:------:|:-----------------------------------------------|
|   Description   | confignode max payload size for a single log-sync-RPC from leader to follower                  |
|   Type   | int32                                          |
|  Default   | 4MB                                            |
| Effective | After restarting system                                           |


* schema\_region\_ratis\_log\_appender\_buffer\_size\_max

|   Name   | schema\_region\_ratis\_log\_appender\_buffer\_size\_max |
|:------:|:-------------------------------------------------|
|   Description   | schema region max payload size for a single log-sync-RPC from leader to follower                |
|   Type   | int32                                            |
|  Default   | 4MB                                              |
| Effective | After restarting system                                             |

* data\_region\_ratis\_log\_appender\_buffer\_size\_max

|   Name   | data\_region\_ratis\_log\_appender\_buffer\_size\_max |
|:------:|:-----------------------------------------------|
|   Description   | data region max payload size for a single log-sync-RPC from leader to follower                 |
|   Type   | int32                                          |
|  Default   | 4MB                                            |
| Effective | After restarting system                                           |

* config\_node\_ratis\_snapshot\_trigger\_threshold

|   Name   | config\_node\_ratis\_snapshot\_trigger\_threshold |
|:------:|:---------------------------------------------|
|   Description   | confignode trigger a snapshot when snapshot_trigger_threshold logs are written                 |
|   Type   | int32                                        |
|  Default   | 400,000                                      |
| Effective | After restarting system                                         |

* schema\_region\_ratis\_snapshot\_trigger\_threshold

|   Name   | schema\_region\_ratis\_snapshot\_trigger\_threshold |
|:------:|:-----------------------------------------------|
|   Description   | schema region trigger a snapshot when snapshot_trigger_threshold logs are written                |
|   Type   | int32                                          |
|  Default   | 400,000                                        |
| Effective | After restarting system                                           |

* data\_region\_ratis\_snapshot\_trigger\_threshold

|   Name   | data\_region\_ratis\_snapshot\_trigger\_threshold |
|:------:|:---------------------------------------------|
|   Description   | data region trigger a snapshot when snapshot_trigger_threshold logs are written                |
|   Type   | int32                                        |
|  Default   | 400,000                                      |
| Effective | After restarting system                                         |

* config\_node\_ratis\_log\_unsafe\_flush\_enable

|   Name   | config\_node\_ratis\_log\_unsafe\_flush\_enable    |
|:------:|:---------------------------------------------------|
|   Description   | confignode allows flushing Raft Log asynchronously |
|   Type   | boolean                                            |
|  Default   | false                                              |
| Effective | After restarting system                            |

* schema\_region\_ratis\_log\_unsafe\_flush\_enable

|   Name   | schema\_region\_ratis\_log\_unsafe\_flush\_enable     |
|:------:|:------------------------------------------------------|
|   Description   | schema region allows flushing Raft Log asynchronously |
|   Type   | boolean                                               |
|  Default   | false                                                 |
| Effective | After restarting system                               |

* data\_region\_ratis\_log\_unsafe\_flush\_enable

|   Name   | data\_region\_ratis\_log\_unsafe\_flush\_enable     |
|:------:|:----------------------------------------------------|
|   Description   | data region allows flushing Raft Log asynchronously |
|   Type   | boolean                                             |
|  Default   | false                                               |
| Effective | After restarting system                             |

* config\_node\_ratis\_log\_segment\_size\_max\_in\_byte

|   Name   | config\_node\_ratis\_log\_segment\_size\_max\_in\_byte |
|:------:|:-----------------------------------------------|
|   Description   | confignode max capacity of a single Log segment file                   |
|   Type   | int32                                          |
|  Default   | 24MB                                           |
| Effective | After restarting system                                           |

* schema\_region\_ratis\_log\_segment\_size\_max\_in\_byte

|   Name   | schema\_region\_ratis\_log\_segment\_size\_max\_in\_byte |
|:------:|:-------------------------------------------------|
|   Description   | schema region max capacity of a single Log segment file              |
|   Type   | int32                                            |
|  Default   | 24MB                                             |
| Effective | After restarting system                                             |

* data\_region\_ratis\_log\_segment\_size\_max\_in\_byte

|   Name   | data\_region\_ratis\_log\_segment\_size\_max\_in\_byte |
|:------:|:-----------------------------------------------|
|   Description   | data region max capacity of a single Log segment file                |
|   Type   | int32                                          |
|  Default   | 24MB                                           |
| Effective | After restarting system                                           |

* config\_node\_ratis\_grpc\_flow\_control\_window

|   Name   | config\_node\_ratis\_grpc\_flow\_control\_window                             |
|:------:|:-----------------------------------------------------------------------------|
|   Description   | confignode flow control window for ratis grpc log appender                   |
|   Type   | int32                                                                        |
|  Default   | 4MB                                                                          |
| Effective | After restarting system                                                      |

* schema\_region\_ratis\_grpc\_flow\_control\_window

|   Name   | schema\_region\_ratis\_grpc\_flow\_control\_window |
|:------:|:---------------------------------------------|
|   Description   | schema region flow control window for ratis grpc log appender                  |
|   Type   | int32                                        |
|  Default   | 4MB                                          |
| Effective | After restarting system                                         |

* data\_region\_ratis\_grpc\_flow\_control\_window

|   Name   | data\_region\_ratis\_grpc\_flow\_control\_window |
|:------:|:-------------------------------------------|
|   Description   | data region flow control window for ratis grpc log appender                  |
|   Type   | int32                                      |
|  Default   | 4MB                                        |
| Effective | After restarting system                                       |

* config\_node\_ratis\_grpc\_leader\_outstanding\_appends\_max

|    Name     | config\_node\_ratis\_grpc\_leader\_outstanding\_appends\_max |
| :---------: | :----------------------------------------------------- |
| Description | config node grpc pipeline concurrency threshold        |
|    Type     | int32                                                  |
|   Default   | 128                                                    |
|  Effective  | After restarting system                                |

* schema\_region\_ratis\_grpc\_leader\_outstanding\_appends\_max

|    Name     | schema\_region\_ratis\_grpc\_leader\_outstanding\_appends\_max |
| :---------: | :------------------------------------------------------ |
| Description | schema region grpc pipeline concurrency threshold       |
|    Type     | int32                                                   |
|   Default   | 128                                                     |
|  Effective  | After restarting system                                 |

* data\_region\_ratis\_grpc\_leader\_outstanding\_appends\_max

|    Name     | data\_region\_ratis\_grpc\_leader\_outstanding\_appends\_max |
| :---------: | :---------------------------------------------------- |
| Description | data region grpc pipeline concurrency threshold       |
|    Type     | int32                                                 |
|   Default   | 128                                                   |
|  Effective  | After restarting system                               |

* config\_node\_ratis\_log\_force\_sync\_num

|    Name     | config\_node\_ratis\_log\_force\_sync\_num |
| :---------: | :------------------------------------ |
| Description | config node fsync threshold           |
|    Type     | int32                                 |
|   Default   | 128                                   |
|  Effective  | After restarting system               |

* schema\_region\_ratis\_log\_force\_sync\_num

|    Name     | schema\_region\_ratis\_log\_force\_sync\_num |
| :---------: | :-------------------------------------- |
| Description | schema region fsync threshold           |
|    Type     | int32                                   |
|   Default   | 128                                     |
|  Effective  | After restarting system                 |

* data\_region\_ratis\_log\_force\_sync\_num

|    Name     | data\_region\_ratis\_log\_force\_sync\_num |
| :---------: | :----------------------------------- |
| Description | data region fsync threshold          |
|    Type     | int32                                |
|   Default   | 128                                  |
|  Effective  | After restarting system              |

* config\_node\_ratis\_rpc\_leader\_election\_timeout\_min\_ms

|   Name   | config\_node\_ratis\_rpc\_leader\_election\_timeout\_min\_ms |
|:------:|:-----------------------------------------------------|
|   Description   | confignode min election timeout for leader election                            |
|   Type   | int32                                                |
|  Default   | 2000ms                                               |
| Effective | After restarting system                                                 |

* schema\_region\_ratis\_rpc\_leader\_election\_timeout\_min\_ms

|   Name   | schema\_region\_ratis\_rpc\_leader\_election\_timeout\_min\_ms |
|:------:|:-------------------------------------------------------|
|   Description   | schema region min election timeout for leader election                           |
|   Type   | int32                                                  |
|  Default   | 2000ms                                                 |
| Effective | After restarting system                                                   |

* data\_region\_ratis\_rpc\_leader\_election\_timeout\_min\_ms

|   Name   | data\_region\_ratis\_rpc\_leader\_election\_timeout\_min\_ms |
|:------:|:-----------------------------------------------------|
|   Description   | data region min election timeout for leader election                           |
|   Type   | int32                                                |
|  Default   | 2000ms                                               |
| Effective | After restarting system                                                 |

* config\_node\_ratis\_rpc\_leader\_election\_timeout\_max\_ms

|   Name   | config\_node\_ratis\_rpc\_leader\_election\_timeout\_max\_ms |
|:------:|:-----------------------------------------------------|
|   Description   | confignode max election timeout for leader election                            |
|   Type   | int32                                                |
|  Default   | 2000ms                                               |
| Effective | After restarting system                                                 |

* schema\_region\_ratis\_rpc\_leader\_election\_timeout\_max\_ms

|   Name   | schema\_region\_ratis\_rpc\_leader\_election\_timeout\_max\_ms |
|:------:|:-------------------------------------------------------|
|   Description   | schema region max election timeout for leader election                           |
|   Type   | int32                                                  |
|  Default   | 2000ms                                                 |
| Effective | After restarting system                                                   |

* data\_region\_ratis\_rpc\_leader\_election\_timeout\_max\_ms

|   Name   | data\_region\_ratis\_rpc\_leader\_election\_timeout\_max\_ms |
|:------:|:-----------------------------------------------------|
|   Description   | data region max election timeout for leader election                           |
|   Type   | int32                                                |
|  Default   | 2000ms                                               |
| Effective | After restarting system                                                 |

* config\_node\_ratis\_request\_timeout\_ms

|   Name   | config\_node\_ratis\_request\_timeout\_ms |
|:------:|:-------------------------------------|
|   Description   | confignode ratis client retry threshold              |
|   Type   | int32                                |
|  Default   | 10s                                  |
| Effective | After restarting system                                 |

* schema\_region\_ratis\_request\_timeout\_ms

|   Name   | schema\_region\_ratis\_request\_timeout\_ms |
|:------:|:---------------------------------------|
|   Description   | schema region ratis client retry threshold             |
|   Type   | int32                                  |
|  Default   | 10s                                    |
| Effective | After restarting system                                   |

* data\_region\_ratis\_request\_timeout\_ms

|   Name   | data\_region\_ratis\_request\_timeout\_ms |
|:------:|:-------------------------------------|
|   Description   | data region ratis client retry threshold             |
|   Type   | int32                                |
|  Default   | 10s                                  |
| Effective | After restarting system                                 |

* config\_node\_ratis\_max\_retry\_attempts

|   Name   | config\_node\_ratis\_max\_retry\_attempts  |
|:------:|:-------------------------------------------|
|   Description   | confignode ratis client max retry attempts |
|   Type   | int32                                      |
|  Default   | 10                                         |
| Effective | After restarting system                    |

* config\_node\_ratis\_initial\_sleep\_time\_ms

|   Name   | config\_node\_ratis\_initial\_sleep\_time\_ms    |
|:------:|:-------------------------------------------------|
|   Description   | confignode ratis client retry initial sleep time |
|   Type   | int32                                            |
|  Default   | 100ms                                            |
| Effective | After restarting system                          |

* config\_node\_ratis\_max\_sleep\_time\_ms

|   Name   | config\_node\_ratis\_max\_sleep\_time\_ms    |
|:------:|:---------------------------------------------|
|   Description   | confignode ratis client retry max sleep time |
|   Type   | int32                                        |
|  Default   | 10s                                          |
| Effective | After restarting system                      |

* schema\_region\_ratis\_max\_retry\_attempts

|   Name   | schema\_region\_ratis\_max\_retry\_attempts |
|:------:|:---------------------------------------|
|   Description   | schema region ratis client max retry attempts            |
|   Type   | int32                                  |
|  Default   | 10                                     |
| Effective | After restarting system                                   |

* schema\_region\_ratis\_initial\_sleep\_time\_ms

|   Name   | schema\_region\_ratis\_initial\_sleep\_time\_ms |
|:------:|:------------------------------------------|
|   Description   | schema region ratis client retry initial sleep time             |
|   Type   | int32                                     |
|  Default   | 100ms                                     |
| Effective | After restarting system                                      |

* schema\_region\_ratis\_max\_sleep\_time\_ms

|   Name   | schema\_region\_ratis\_max\_sleep\_time\_ms |
|:------:|:--------------------------------------|
|   Description   | schema region ratis client retry max sleep time         |
|   Type   | int32                                 |
|  Default   | 10s                                   |
| Effective | After restarting system                                  |

* data\_region\_ratis\_max\_retry\_attempts

|   Name   | data\_region\_ratis\_max\_retry\_attempts |
|:------:|:-------------------------------------|
|   Description   | data region ratis client max retry attempts            |
|   Type   | int32                                |
|  Default   | 10                                   |
| Effective | After restarting system                                 |

* data\_region\_ratis\_initial\_sleep\_time\_ms

|   Name   | data\_region\_ratis\_initial\_sleep\_time\_ms |
|:------:|:----------------------------------------|
|   Description   | data region ratis client retry initial sleep time             |
|   Type   | int32                                   |
|  Default   | 100ms                                   |
| Effective | After restarting system                                    |

* data\_region\_ratis\_max\_sleep\_time\_ms

|   Name   | data\_region\_ratis\_max\_sleep\_time\_ms |
|:------:|:------------------------------------|
|   Description   | data region ratis client retry max sleep time         |
|   Type   | int32                               |
|  Default   | 10s                                 |
| Effective | After restarting system                                |

* ratis\_first\_election\_timeout\_min\_ms

|   Name   | ratis\_first\_election\_timeout\_min\_ms           |
|:------:|:----------------------------------------------------------------|
|   Description   | minimal first election timeout for RatisConsensus |
|   Type   | int64                                                          |
|  Default   | 50 (ms)                                                             |
| Effective | After restarting system                                         |

* ratis\_first\_election\_timeout\_max\_ms

|   Name   | ratis\_first\_election\_timeout\_max\_ms           |
|:------:|:----------------------------------------------------------------|
|   Description   | maximal first election timeout for RatisConsensus |
|   Type   | int64                                                          |
|  Default   | 150 (ms)                                                             |
| Effective | After restarting system      |


* config\_node\_ratis\_preserve\_logs\_num\_when\_purge

|   Name   | config\_node\_ratis\_preserve\_logs\_num\_when\_purge          |
|:------:|:---------------------------------------------------------------|
|   Description   | confignode preserves certain logs when take snapshot and purge |
|   Type   | int32                                                          |
|  Default   | 1000                                                           |
| Effective | After restarting system                                        |

* schema\_region\_ratis\_preserve\_logs\_num\_when\_purge

|   Name   | schema\_region\_ratis\_preserve\_logs\_num\_when\_purge           |
|:------:|:------------------------------------------------------------------|
|   Description   | schema region preserves certain logs when take snapshot and purge |
|   Type   | int32                                                             |
|  Default   | 1000                                                              |
| Effective | After restarting system                                           |

* data\_region\_ratis\_preserve\_logs\_num\_when\_purge

|   Name   | data\_region\_ratis\_preserve\_logs\_num\_when\_purge           |
|:------:|:----------------------------------------------------------------|
|   Description   | data region preserves certain logs when take snapshot and purge |
|   Type   | int32                                                           |
|  Default   | 1000                                                            |
| Effective | After restarting system                                         |

* config\_node\_ratis\_log\_max\_size 

|   Name   | config\_node\_ratis\_log\_max\_size            |
|:------:|:----------------------------------------------------------------|
|   Description   | Max file size of in-disk Raft Log for config node |
|   Type   | int64                                                          |
|  Default   | 2147483648 (2GB)                                             |
| Effective | After restarting system                                         |

* schema\_region\_ratis\_log\_max\_size 

|   Name   | schema\_region\_ratis\_log\_max\_size            |
|:------:|:----------------------------------------------------------------|
|   Description   | Max file size of in-disk Raft Log for schema region |
|   Type   | int64                                                          |
|  Default   | 2147483648 (2GB)                                             |
| Effective | After restarting system                                         |

* data\_region\_ratis\_log\_max\_size 

|   Name   | data\_region\_ratis\_log\_max\_size            |
|:------:|:----------------------------------------------------------------|
|   Description   | Max file size of in-disk Raft Log for data region |
|   Type   | int64                                                          |
|  Default   | 21474836480 (20GB)                                             |
| Effective | After restarting system                                         |

* config\_node\_ratis\_periodic\_snapshot\_interval

|   Name   | config\_node\_ratis\_periodic\_snapshot\_interval           |
|:------:|:----------------------------------------------------------------|
|   Description   | duration interval of config-node periodic snapshot |
|   Type   | int64                                                           |
|  Default   | 86400 (seconds)                                                           |
| Effective | After restarting system                                         |

* schema\_region\_ratis\_periodic\_snapshot\_interval  

|   Name   | schema\_region\_ratis\_preserve\_logs\_num\_when\_purge           |
|:------:|:----------------------------------------------------------------|
|   Description   | duration interval of schema-region periodic snapshot |
|   Type   | int64                                                          |
|  Default   | 86400 (seconds)                                                             |
| Effective | After restarting system                                         |

* data\_region\_ratis\_periodic\_snapshot\_interval  

|   Name   | data\_region\_ratis\_preserve\_logs\_num\_when\_purge           |
|:------:|:----------------------------------------------------------------|
|   Description   | duration interval of data-region periodic snapshot |
|   Type   | int64                                                          |
|  Default   | 86400 (seconds)                                                             |
| Effective | After restarting system                                         |

### Procedure Configuration

* procedure\_core\_worker\_thread\_count

|    Name     | procedure\_core\_worker\_thread\_count |
| :---------: | :--------------------------------- |
| Description | The number of worker thread count  |
|    Type     | int32                                |
|   Default   | 4                                  |
|  Effective  | After restarting system            |

* procedure\_completed\_clean\_interval

|    Name     | procedure\_completed\_clean\_interval                   |
| :---------: | :--------------------------------------------------- |
| Description | Time interval of completed procedure cleaner work in |
|    Type     | int32                                                  |
|    Unit     | second                                               |
|   Default   | 30                                                   |
|  Effective  | After restarting system                              |

* procedure\_completed\_evict\_ttl

|    Name     | procedure\_completed\_evict\_ttl  |
| :---------: | :----------------------------- |
| Description | The ttl of completed procedure |
|    Type     | int32                            |
|    Unit     | second                         |
|   Default   | 800                            |
|  Effective  | After restarting system        |

### MQTT Broker Configuration

* enable\_mqtt\_service

|    Name     | enable\_mqtt\_service。              |
|:-----------:|:------------------------------------|
| Description | Whether to enable the MQTT service  |
|    Type     | Boolean                             |
|   Default   | False                               |
|  Effective  | hot-load                             |

* mqtt\_host

|    Name     | mqtt\_host                                   |
|:-----------:|:---------------------------------------------|
| Description | The host to which the MQTT service is bound  |
|    Type     | String                                       |
|   Default   | 0.0.0.0                                      |
|   Effective    | hot-load                                      |

* mqtt\_port

|    Name     | mqtt\_port                                  |
|:-----------:|:--------------------------------------------|
| Description | The port to which the MQTT service is bound |
|    Type     | int32                                       |
|   Default   | 1883                                        |
|   Effective    | hot-load                                     |

* mqtt\_handler\_pool\_size

|Name| mqtt\_handler\_pool\_size                                   |
|:---:|:------------------------------------------------------------|
|Description| The size of the handler pool used to process MQTT messages  |
|Type| int32                                                       |
|Default| 1                                                           |
|Effective| hot-load                                                     |

* mqtt\_payload\_formatter

|    Name     | mqtt\_payload\_formatter       |
|:-----------:|:-------------------------------|
| Description | MQTT message payload formatter |
|    Type     | String                         |
|   Default   | JSON                           |
|   Effective    | hot-load                        |

* mqtt\_max\_message\_size

|  Name  | mqtt\_max\_message\_size                 |
|:------:|:-----------------------------------------|
|   Description   | Maximum length of MQTT message in bytes  |
|   Type   | int32                                    |
|  Default   | 1048576                                  |
| Effective | hot-load                                  |




#### TsFile Active Listening&Loading Function Configuration

* load\_active\_listening\_enable

|Name| load\_active\_listening\_enable |
|:---:|:---|
|Description| Whether to enable the DataNode's active listening and loading of tsfile functionality (default is enabled). |
|Type| Boolean |
|Default| true |
|Effective| hot-load |

* load\_active\_listening\_dirs

|Name| load\_active\_listening\_dirs |
|:---:|:---|
|Description| The directories to be listened to (automatically includes subdirectories of the directory), if there are multiple, separate with “,”. The default directory is ext/load/pending (supports hot loading). |
|Type| String |
|Default| ext/load/pending |
|Effective|hot-load|

* load\_active\_listening\_fail\_dir

|Name| load\_active\_listening\_fail\_dir |
|:---:|:---|
|Description| The directory to which files are transferred after the execution of loading tsfile files fails, only one directory can be configured. |
|Type| String |
|Default| ext/load/failed |
|Effective|hot-load|

* load\_active\_listening\_max\_thread\_num

|Name|  load\_active\_listening\_max\_thread\_num |
|:---:|:---|
|Description| The maximum number of threads to perform loading tsfile tasks simultaneously. The default value when the parameter is commented out is max(1, CPU core count / 2). When the user sets a value not in the range [1, CPU core count / 2], it will be set to the default value (1, CPU core count / 2). |
|Type| Long |
|Default| max(1, CPU core count / 2) |
|Effective|Effective after restart|


* load\_active\_listening\_check\_interval\_seconds

|Name|  load\_active\_listening\_check\_interval\_seconds |
|:---:|:---|
|Description| Active listening polling interval in seconds. The function of actively listening to tsfile is achieved by polling the folder. This configuration specifies the time interval between two checks of load_active_listening_dirs, and the next check will be executed after load_active_listening_check_interval_seconds seconds of each check. When the user sets the polling interval to less than 1, it will be set to the default value of 5 seconds. |
|Type| Long |
|Default| 5|
|Effective|Effective after restart|