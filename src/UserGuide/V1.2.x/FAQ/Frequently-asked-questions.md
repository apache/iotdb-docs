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

# Frequently Asked Questions

## General FAQ

### 1. How can I identify my version of IoTDB?

There are several ways to identify the version of IoTDB that you are using:

* Launch IoTDB's Command Line Interface:

```
> ./start-cli.sh -p 6667 -pw root -u root -h localhost
 _____       _________  ______   ______    
|_   _|     |  _   _  ||_   _ `.|_   _ \   
  | |   .--.|_/ | | \_|  | | `. \ | |_) |  
  | | / .'`\ \  | |      | |  | | |  __'.  
 _| |_| \__. | _| |_    _| |_.' /_| |__) | 
|_____|'.__.' |_____|  |______.'|_______/  version x.x.x
```

* Check pom.xml file:

```
<version>x.x.x</version>
```

* Use JDBC API:

```
String iotdbVersion = tsfileDatabaseMetadata.getDatabaseProductVersion();
```

* Use Command Line Interface:

```
IoTDB> show version
show version
+---------------+
|version        |
+---------------+
|x.x.x          |
+---------------+
Total line number = 1
It costs 0.241s
```

### 2. Where can I find IoTDB logs?

Suppose your root directory is:

```
$ pwd
/workspace/iotdb

$ ls -l
server/
cli/
pom.xml
Readme.md
...
```

Let `$IOTDB_HOME = /workspace/iotdb/server/target/iotdb-server-{project.version}`

Let `$IOTDB_CLI_HOME = /workspace/iotdb/cli/target/iotdb-cli-{project.version}`

By default settings, the logs are stored under ```IOTDB_HOME/logs```. You can change log level and storage path by configuring ```logback.xml``` under ```IOTDB_HOME/conf```.

### 3. Where can I find IoTDB data files?

By default settings, the data files (including tsfile, metadata, and WAL files) are stored under ```IOTDB_HOME/data/datanode```.

### 4. How do I know how many time series are stored in IoTDB?

Use IoTDB's Command Line Interface:

```
IoTDB> show timeseries root
```

In the result, there is a statement shows `Total timeseries number`, this number is the timeseries number in IoTDB.

In the current version, IoTDB supports querying the number of time series. Use IoTDB's Command Line Interface:

```
IoTDB> count timeseries root
```

If you are using Linux, you can use the following shell command:

```
> grep "0,root" $IOTDB_HOME/data/system/schema/mlog.txt |  wc -l
>   6
```

### 5. Can I use Hadoop and Spark to read TsFile in IoTDB?

Yes. IoTDB has intense integration with Open Source Ecosystem. IoTDB supports [Hadoop](https://github.com/apache/iotdb/tree/master/hadoop), [Spark](https://github.com/apache/iotdb/tree/master/spark-tsfile) and [Grafana](https://github.com/apache/iotdb/tree/master/grafana-plugin) visualization tool.

### 6. How does IoTDB handle duplicate points?

A data point is uniquely identified by a full time series path (e.g. ```root.vehicle.d0.s0```) and timestamp. If you submit a new point with the same path and timestamp as an existing point, IoTDB updates the value of this point instead of inserting a new point.

### 7. How can I tell what type of the specific timeseries?

Use ```SHOW TIMESERIES <timeseries path>``` SQL in IoTDB's Command Line Interface:

For example, if you want to know the type of all timeseries, the \<timeseries path> should be `root`. The statement will be:

```
IoTDB> show timeseries root
```

If you want to query specific sensor, you can replace the \<timeseries path> with the sensor name. For example:

```
IoTDB> show timeseries root.fit.d1.s1
```

Otherwise, you can also use wildcard in timeseries path:

```
IoTDB> show timeseries root.fit.d1.*
```

### 8. How can I change IoTDB's Cli time display format?

The default IoTDB's Cli time display format is readable (e.g. ```1970-01-01T08:00:00.001```), if you want to display time in timestamp type or other readable format, add parameter ```-disableISO8601``` in start command:

```
> $IOTDB_CLI_HOME/sbin/start-cli.sh -h 127.0.0.1 -p 6667 -u root -pw root -disableISO8601
```

### 9. How to handle error `IndexOutOfBoundsException` from `org.apache.ratis.grpc.server.GrpcLogAppender`?

### 10. How to deal with estimated out of memory errors?

Report an error message:
```
301: There is not enough memory to execute current fragment instance, current remaining free memory is 86762854, estimated memory usage for current fragment instance is 270139392
```
Error analysis:
The datanode_memory_proportion parameter controls the memory divided to the query, and the chunk_timeseriesmeta_free_memory_proportion parameter controls the memory available for query execution.
By default the memory allocated to the query is 30% of the heap memory and the memory available for query execution is 20% of the query memory.
The error report shows that the current remaining memory available for query execution is 86762854B = 82.74MB, and the query is estimated to use 270139392B = 257.6MB of execution memory.

Some possible improvement items:

- Without changing the default parameters, crank up the heap memory of IoTDB greater than 4.2G (4.2G * 1024MB = 4300MB), 4300M * 30% * 20% = 258M > 257.6M, which can fulfill the requirement.
- Change parameters such as datanode_memory_proportion so that the available memory for query execution is >257.6MB.
- Reduce the number of exported time series.
- Add slimit limit to the query statement, which is also an option to reduce the query time series.
- Add align by device, which will export in device order, and the memory usage will be reduced to single-device level.

It is an internal error introduced by Ratis 2.4.1 dependency, and we can safely ignore this exception as it will
not affect normal operations. We will fix this message in the incoming releases.

## FAQ for Cluster Setup

### Cluster StartUp and Stop

#### 1. Failed to start ConfigNode for the first time, how to find the reason?

- Make sure that the data/confignode directory is cleared when start ConfigNode for the first time.
- Make sure that the <IP+Port> used by ConfigNode is not occupied, and the <IP+Port> is also not conflicted with other ConfigNodes.
- Make sure that the `cn_target_confignode_list` is configured correctly, which points to the alive ConfigNode. And if the ConfigNode is started for the first time, make sure that `cn_target_confignode_list` points to itself.
- Make sure that the configuration(consensus protocol and replica number) of the started ConfigNode is accord with the `cn_target_confignode_list` ConfigNode.

#### 2. ConfigNode is started successfully, but why the node doesn't appear in the results of `show cluster`?

- Examine whether the `cn_target_confignode_list` points to the correct address. If `cn_target_confignode_list` points to itself, a new ConfigNode cluster is started.

#### 3. Failed to start DataNode for the first time, how to find the reason?

- Make sure that the data/datanode directory is cleared when start DataNode for the first time. If the start result is “Reject DataNode restart.”, maybe the data/datanode directory is not cleared.
- Make sure that the <IP+Port> used by DataNode is not occupied, and the <IP+Port> is also not conflicted with other DataNodes.
- Make sure that the `dn_target_confignode_list` points to the alive ConfigNode.

#### 4. Failed to remove DataNode, how to find the reason?

- Examine whether the parameter of remove-datanode.sh is correct, only rpcIp:rpcPort and dataNodeId are correct parameter.
- Only when the number of available DataNodes in the cluster is greater than max(schema_replication_factor, data_replication_factor), removing operation can be executed.
- Removing DataNode will migrate the data from the removing DataNode to other alive DataNodes. Data migration is based on Region, if some regions are migrated failed, the removing DataNode will always in the status of `Removing`.
- If the DataNode is in the status of `Removing`, the regions in the removing DataNode will also in the status of `Removing` or `Unknown`, which are unavailable status. Besides, the removing DataNode will not receive new write requests from client.
  And users can use the command `set system status to running` to make the status of DataNode from Removing to Running;
  If users want to make the Regions from Removing to available status, command `migrate region from datanodeId1 to datanodeId2` can take effect, this command can migrate the regions to other alive DataNodes.
  Besides, IoTDB will publish `remove-datanode.sh -f` command in the next version, which can remove DataNodes forced (The failed migrated regions will be discarded).

#### 5. Whether the down DataNode can be removed?

- The down DataNode can be removed only when the replica factor of schema and data is greater than 1.  
  Besides, IoTDB will publish `remove-datanode.sh -f` function in the next version.

#### 6. What should be paid attention to when upgrading from 0.13 to 1.0?

- The file structure between 0.13 and 1.0 is different, we can't copy the data directory from 0.13 to 1.0 to use directly.
  If you want to load the data from 0.13 to 1.0, you can use the LOAD function.
- The default RPC address of 0.13 is `0.0.0.0`, but the default RPC address of 1.0 is `127.0.0.1`.


### Cluster Restart

#### 1. How to restart any ConfigNode in the cluster?

- First step: stop the process by stop-confignode.sh or kill PID of ConfigNode.
- Second step: execute start-confignode.sh to restart ConfigNode.

#### 2. How to restart any DataNode in the cluster?

- First step: stop the process by stop-datanode.sh or kill PID of DataNode.
- Second step: execute start-datanode.sh to restart DataNode.

#### 3. If it's possible to restart ConfigNode using the old data directory when it's removed?

- Can't. The running result will be "Reject ConfigNode restart. Because there are no corresponding ConfigNode(whose nodeId=xx) in the cluster".

#### 4. If it's possible to restart DataNode using the old data directory when it's removed?

- Can't. The running result will be "Reject DataNode restart. Because there are no corresponding DataNode(whose nodeId=xx) in the cluster. Possible solutions are as follows:...".

#### 5. Can we execute start-confignode.sh/start-datanode.sh successfully when delete the data directory of given ConfigNode/DataNode without killing the PID?

- Can't. The running result will be "The port is already occupied".

### Cluster Maintenance

#### 1. How to find the reason when Show cluster failed, and error logs like "please check server status" are shown?

- Make sure that more than one half ConfigNodes are alive.
- Make sure that the DataNode connected by the client is alive.

#### 2. How to fix one DataNode when the disk file is broken?

- We can use remove-datanode.sh to fix it. Remove-datanode will migrate the data in the removing DataNode to other alive DataNodes.
- IoTDB will publish Node-Fix tools in the next version.

#### 3. How to decrease the memory usage of ConfigNode/DataNode?

- Adjust the ON_HEAP_MEMORY、OFF_HEAP_MEMORY options in conf/confignode-env.sh and conf/datanode-env.sh.
