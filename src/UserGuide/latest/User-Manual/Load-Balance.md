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

## Load Balance

Region migration belongs to advanced operations and maintenance functions, which have certain operational costs. It is recommended to read the entire document before using this function. If you have any questions about the solution design, please contact the IoTDB team for technical support.


### Feature introduction

IoTDB is a distributed database, and the balanced distribution of data plays an important role in load balancing the disk space and write pressure of the cluster. Region is the basic unit for distributed storage of data in IoTDB cluster, and the specific concept can be seen in [region](../Background-knowledge/Cluster-Concept.md)。

Under normal operation of the cluster, IoTDB will automatically perform load balancing on data. However, in scenarios where a new DataNode node is added to the cluster or where the hard disk of the machine where the DataNode is located is damaged and data needs to be recovered, manual region migration can be used to finely adjust the cluster load and operations.

Here is a schematic diagram of the region migration process :


![](https://alioss.timecho.com/docs/img/region%E8%BF%81%E7%A7%BB%E7%A4%BA%E6%84%8F%E5%9B%BE20241210.png)

### Notes

1. It is recommended to only use the Region Migration feature on IoTDB 1.3.3 and higher versions.
2. Region migration is only supported when the consensus protocol is IoTConsus or Ratis (in iotdb system. properties, the `schema_region_consensus_protocol_class` and`data_region_consensus_protocol_class`).
3. Region migration will occupy system resources such as hard drives and network bandwidth, and it is recommended to perform it during low business loads.
4. The region migration process will occupy WAL files, blocking the deletion of WAL files in this consensus group. If the total number of WAL files reaches `wal_file_size_threshold_in_byte`, writing will be blocked.

### Instructions for use

- **Grammar definition** :

  Submit an asynchronous task to migrate a region from one DataNode to another.


  ```SQL
    migrateRegion
        : MIGRATE REGION regionId=INTEGER_LITERAL FROM fromId=INTEGER_LITERAL TO toId=INTEGER_LITERAL
        ;
    ```

- **Example** : 

  Migrating region 1 from DataNode 2 to DataNode 3:
  
  ```SQL
    IoTDB> migrate region 1 from 2 to 3
    Msg: The statement is executed successfully.
  ```

  "The statement is executed successfully" only represents the successful submission of the region migration task, not the completion of execution. The execution status of the task can be viewed through the CLI command `show regions `.
- **Related configuration** :
   - Migration speed control : modify `iotdb-system.properties `parameters `region_migration_speed_limit_bytes_per_second `control region migration speed.
- **Time cost estimation** :
   - If there are no concurrent writes during the migration process, the time consumption can be simply estimated by dividing the region data volume by the data transfer speed. For example, for a 1TB region, the hard disk internet bandwidth and speed limit parameters jointly determine that the data transfer speed is 100MB/s, so it takes about 3 hours to complete the migration.
   - If there are concurrent writes in the migration process, the time consumption will increase, and the specific time consumption depends on various factors such as write pressure and system resources. It can be simply estimated as `no concurrent write time × 1.5 `.
- **Migration progress observation** : During the migration process, the state changes can be observed through the CLI command `show regions `. Taking the 2 replicas as an example, the state of the consensus group where the region is located will go through the following process:
   - Before migration starts: `Running `, `Running `.
   - Expansion phase: `Running `, `Running `, `Adding `. Due to the large number of file transfers involved, it may take a long time. If using IoTConsensus, the specific file transfer progress can be searched in the DataNode log `[SNAPSHOT TRANSMISSION] `.
   - Stages: `Removing `, `Running `, `Running `.
   - Migration complete: `Running `, `Running `.

  Taking the expansion phase as an example, the result of `show regions` may be:

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
