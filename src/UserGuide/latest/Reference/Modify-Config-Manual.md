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

# Introduction to configuration item modification
## Method to modify
* Use sql statement to modify [recommended]
* Directly modify the configuration file [not recommended]
## Effective method
* Cannot be modified after the first startup. (first_start)
* Take effect after restart (restart)
* hot load (hot_reload)
# Modify configuration files directly
It can take effect by restarting or following the command
## Hot reload configuration command
Make changes to configuration items that support hot reloading take effect immediately.
For configuration items that have been modified in the configuration file, deleting or commenting them from the configuration file and then performing load configuration will restore the default values.
```
load configuration
```
# SetConfiguration statement
```
set configuration key1 = 'value1' key2 = 'value2'... (on nodeId)
```
### Example 1
```
set configuration enable_cross_space_compaction='false'
```
To take effect permanently on all nodes in the cluster, set enable_cross_space_compaction to false and write it to iotdb-system.properties.
### Example 2
```
set configuration enable_cross_space_compaction='false' enable_seq_space_compaction='false' on 1
```
To take effect permanently on the node with nodeId 1, set enable_cross_space_compaction to false, set enable_seq_space_compaction to false, and write it to iotdb-system.properties.
### Example 3
```
set configuration enable_cross_space_compaction='false' timestamp_precision='ns'
```
To take effect permanently on all nodes in the cluster, set enable_cross_space_compaction to false, timestamp_precision to ns, and write it to iotdb-system.properties. However, timestamp_precision is a configuration item that cannot be modified after the first startup, so the update of this configuration item will be ignored and the return is as follows.
```
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 301: ignored config items: [timestamp_precision]
```
Effective configuration item
Configuration items that support hot reloading and take effect immediately are marked with effectiveMode as hot_reload in the iotdb-system.properties.template file.

Example
```
# Used for indicate cluster name and distinguish different cluster.
# If you need to modify the cluster name, it's recommended to use [set configuration cluster_name='xxx'] sql.
# Manually modifying configuration file is not recommended, which may cause node restart fail.
# effectiveMode: hot_reload
# Datatype: string
cluster_name=defaultCluster
```
