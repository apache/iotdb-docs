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

# 配置项修改介绍
## 设置方式
* 使用sql语句修改【推荐】
* 直接修改配置文件【不推荐】
## 生效方式
* 第一次启动后不可修改 (first_start)
* 重启后生效 (restart)
* 热加载 (hot_reload)
# 直接修改配置文件
可以通过重启或以下命令生效
## 热加载配置命令
使支持热加载的配置项改动立即生效。
对于已经写在配置文件中修改过的配置项，从配置文件中删除或注释后再进行 load configuration 将恢复默认值。
```
load configuration
```
# 配置项操作语句
设置配置项
```
set configuration 'key1' = 'value1' 'key2' = 'value2'... (on nodeId)
```
### 示例1
```
set configuration 'enable_cross_space_compaction' = 'false'
```
对集群所有节点永久生效，设置 enable_cross_space_compaction 为 false，并写入到 iotdb-system.properties 中。
### 示例2
```
set configuration 'enable_cross_space_compaction' ='false' 'enable_seq_space_compaction' = 'false' on 1
```
对 nodeId 为 1 的节点永久生效，设置 enable_cross_space_compaction 为 false，设置 enable_seq_space_compaction 为 false，并写入到 iotdb-system.properties 中。
### 示例3
```
set configuration  'enable_cross_space_compaction' = 'false'  'timestamp_precision' = 'ns'
```
对集群所有节点永久生效，设置 enable_cross_space_compaction 为 false，timestamp_precision 为 ns，并写入到 iotdb-system.properties 中。但是，timestamp_precision 是第一次启动后就无法修改的配置项，因此会忽略这个配置项的更新，返回如下。
```
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 301: ignored config items: [timestamp_precision]
```
# 生效配置项
支持热加载立即生效的配置项在 iotdb-system.properties.template 文件中标记 effectiveMode 为 hot_reload
示例
```
# Used for indicate cluster name and distinguish different cluster.
# If you need to modify the cluster name, it's recommended to use [set configuration 'cluster_name'='xxx'] sql.
# Manually modifying configuration file is not recommended, which may cause node restart fail.
# effectiveMode: hot_reload
# Datatype: string
cluster_name=defaultCluster
```
