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

<!-- TOC -->

# 常见问题

## 1. 一般问题

### 1.1 如何查询我的IoTDB版本？

有几种方法可以识别您使用的 IoTDB 版本：

* 启动 IoTDB 的命令行界面：

```
> ./start-cli.sh -p 6667 -pw root -u root -h localhost
 _____       _________  ______   ______    
|_   _|     |  _   _  ||_   _ `.|_   _ \   
  | |   .--.|_/ | | \_|  | | `. \ | |_) |  
  | | / .'`\ \  | |      | |  | | |  __'.  
 _| |_| \__. | _| |_    _| |_.' /_| |__) | 
|_____|'.__.' |_____|  |______.'|_______/  version x.x.x
```

* 检查 pom.xml 文件：

```
<version>x.x.x</version>
```

* 使用 JDBC API:

```
String iotdbVersion = tsfileDatabaseMetadata.getDatabaseProductVersion();
```

* 使用命令行接口：

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

### 1.2 在哪里可以找到IoTDB的日志？

假设您的根目录是：

```shell
$ pwd
/workspace/iotdb

$ ls -l
server/
cli/
pom.xml
Readme.md
...
```

假如 `$IOTDB_HOME = /workspace/iotdb/server/target/iotdb-server-{project.version}`

假如 `$IOTDB_CLI_HOME = /workspace/iotdb/cli/target/iotdb-cli-{project.version}`

在默认的设置里，logs 文件夹会被存储在```IOTDB_HOME/logs```。您可以在```IOTDB_HOME/conf```目录下的```logback.xml```文件中修改日志的级别和日志的存储路径。

### 1.3 在哪里可以找到IoTDB的数据文件？

在默认的设置里，数据文件（包含 TsFile，metadata，WAL）被存储在```IOTDB_HOME/data/datanode```文件夹。

### 1.4 可以使用Spark读取IoTDB中的TsFile吗？

是的。IoTDB 与开源生态紧密结合。IoTDB 支持 [Spark](../Ecosystem-Integration/Spark-IoTDB.md) 可视化工具。

### 1.5 如何更改IoTDB的客户端时间显示格式？

IoTDB 客户端默认显示的时间是人类可读的（比如：```1970-01-01T08:00:00.001```)，如果您想显示是时间戳或者其他可读格式，请在启动命令上添加参数```-disableISO8601```:

```
> $IOTDB_CLI_HOME/sbin/start-cli.sh -h 127.0.0.1 -p 6667 -u root -pw root -disableISO8601
```

### 1.6 怎么处理来自`org.apache.ratis.grpc.server.GrpcLogAppender`的`IndexOutOfBoundsException`？

这是我们的依赖Ratis 2.4.1的一个内部错误日志，不会对数据写入和读取造成任何影响。
已经报告给Ratis社区，并会在未来的版本中修复。

### 1.7 预估内存不足报错如何处理？

报错信息：
```
301: There is not enough memory to execute current fragment instance, current remaining free memory is 86762854, estimated memory usage for current fragment instance is 270139392
```
报错分析：
datanode_memory_proportion参数控制分给查询的内存，chunk_timeseriesmeta_free_memory_proportion参数控制查询执行可用的内存。
默认情况下分给查询的内存为堆内存*30%，查询执行可用的内存为查询内存的20%。
报错显示当前剩余查询执行可用内存为86762854B=82.74MB，该查询预估使用执行内存270139392B=257.6MB。

一些可能的改进项：

- 在不改变默认参数的前提下，调大IoTDB的堆内存大于 4.2G（4.2G * 1024MB=4300MB），4300M*30%*20%=258M>257.6M，可以满足要求。
- 更改 datanode_memory_proportion 等参数，使查询执行可用内存>257.6MB。
- 减少导出的时间序列数量。
- 给查询语句添加 slimit 限制，也是减少查询时间序列的一种方案。
- 添加 align by device，会按照device顺序进行输出，内存占用会降低至单device级别。


## 2. 分布式部署 FAQ

### 2.1 集群启停

#### ConfigNode初次启动失败，如何排查原因？

- ConfigNode初次启动时确保已清空data/confignode目录
- 确保该ConfigNode使用到的<IP+端口>没有被占用，没有与已启动的ConfigNode使用到的<IP+端口>冲突
- 确保该ConfigNode的cn_seed_config_node（指向存活的ConfigNode；如果该ConfigNode是启动的第一个ConfigNode，该值指向自身）配置正确
- 确保该ConfigNode的配置项（共识协议、副本数等）等与cn_seed_config_node对应的ConfigNode集群一致

#### ConfigNode初次启动成功，show cluster的结果里为何没有该节点？

- 检查cn_seed_config_node是否正确指向了正确的地址； 如果cn_seed_config_node指向了自身，则会启动一个新的ConfigNode集群

#### DataNode初次启动失败，如何排查原因？

- DataNode初次启动时确保已清空data/datanode目录。 如果启动结果为“Reject DataNode restart.”则表示启动时可能没有清空data/datanode目录
- 确保该DataNode使用到的<IP+端口>没有被占用，没有与已启动的DataNode使用到的<IP+端口>冲突
- 确保该DataNode的dn_seed_config_node指向存活的ConfigNode

#### 移除DataNode执行失败，如何排查？

- 检查remove-datanode脚本的参数是否正确，是否传入了正确的ip:port或正确的dataNodeId
- 只有集群可用节点数量 > max(元数据副本数量, 数据副本数量)时，移除操作才允许被执行
- 执行移除DataNode的过程会将该DataNode上的数据迁移到其他存活的DataNode，数据迁移以Region为粒度，如果某个Region迁移失败，则被移除的DataNode会一直处于Removing状态
- 补充：处于Removing状态的节点，其节点上的Region也是Removing或Unknown状态，即不可用状态。 该Remvoing状态的节点也不会接受客户端的请求。如果要使Removing状态的节点变为可用，用户可以使用set system status to running 命令将该节点设置为Running状态；如果要使迁移失败的Region处于可用状态，可以使用migrate region from datanodeId1 to datanodeId2 命令将该不可用的Region迁移到其他存活的节点。另外IoTDB后续也会提供 `remove-datanode.sh -f` 命令，来强制移除节点（迁移失败的Region会直接丢弃）

#### 挂掉的DataNode是否支持移除？

- 当前集群副本数量大于1时可以移除。 如果集群副本数量等于1，则不支持移除。 在下个版本会推出强制移除的命令

#### 从0.13升级到1.0需要注意什么？

- 0.13版本与1.0版本的文件目录结构是不同的，不能将0.13的data目录直接拷贝到1.0集群使用。如果需要将0.13的数据导入至1.0，可以使用LOAD功能
- 0.13版本的默认RPC地址是0.0.0.0，1.0版本的默认RPC地址是127.0.0.1


### 2.2 集群重启

#### 如何重启集群中的某个ConfigNode？

- 第一步：通过`stop-confignode.sh`或kill进程方式关闭ConfigNode进程
- 第二步：通过执行`start-confignode.sh`启动ConfigNode进程实现重启
- 下个版本IoTDB会提供一键重启的操作

#### 如何重启集群中的某个DataNode？

- 第一步：通过`stop-datanode.sh`或kill进程方式关闭DataNode进程
- 第二步：通过执行`start-datanode.sh`启动DataNode进程实现重启
- 下个版本IoTDB会提供一键重启的操作

#### 将某个ConfigNode移除后（remove-confignode），能否再利用该ConfigNode的data目录重启？

- 不能。会报错：Reject ConfigNode restart. Because there are no corresponding ConfigNode(whose nodeId=xx) in the cluster.

#### 将某个DataNode移除后（remove-datanode），能否再利用该DataNode的data目录重启？

- 不能正常重启，启动结果为“Reject DataNode restart. Because there are no corresponding DataNode(whose nodeId=xx) in the cluster. Possible solutions are as follows:...”

#### 用户看到某个ConfigNode/DataNode变成了Unknown状态，在没有kill对应进程的情况下，直接删除掉ConfigNode/DataNode对应的data目录，然后执行`start-confignode.sh`/`start-datanode.sh`，这种情况下能成功吗?

- 无法启动成功，会报错端口已被占用

### 2.3 集群运维

#### Show cluster执行失败，显示“please check server status”，如何排查?

- 确保ConfigNode集群一半以上的节点处于存活状态
- 确保客户端连接的DataNode处于存活状态

#### 某一DataNode节点的磁盘文件损坏，如何修复这个节点?

- 当前只能通过remove-datanode的方式进行实现。remove-datanode执行的过程中会将该DataNode上的数据迁移至其他存活的DataNode节点（前提是集群设置的副本数大于1）
- 下个版本IoTDB会提供一键修复节点的功能

#### 如何降低ConfigNode、DataNode使用的内存？

- 在conf/confignode-env.sh、conf/datanode-env.sh文件可通过调整ON_HEAP_MEMORY、OFF_HEAP_MEMORY等选项可以调整ConfigNode、DataNode使用的最大堆内、堆外内存

