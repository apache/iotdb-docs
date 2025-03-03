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


# Rust 原生接口

IoTDB 使用 Thrift 作为跨语言的 RPC 框架，因此可以通过 Thrift 提供的接口来实现对 IoTDB 的访问。本文档将介绍如何生成可访问 IoTDB 的原生 Rust 接口。


## 1. 依赖

 * JDK >= 1.8
 * Rust >= 1.0.0
 * thrift 0.14.1
 * Linux、Macos 或其他类 unix 系统
 * Windows+bash (下载 IoTDB Go client 需要 git ，通过 WSL、cygwin、Git Bash 任意一种方式均可)

必须安装 thrift（0.14.1 或更高版本）才能将 thrift 文件编译为 Rust 代码。下面是官方的安装教程，最终，您应该得到一个 thrift 可执行文件。

```
http://thrift.apache.org/docs/install/
```


## 2. 编译 thrift 库，生成 Rust 原生接口

1. 在 IoTDB 源代码文件夹的根目录中找到 pom.xml 文件。
2. 打开 pom.xml 文件，找到以下内容：

```xml
<execution>
  <id>generate-thrift-sources-java</id>
  <phase>generate-sources</phase>
  <goals>
      <goal>compile</goal>
  </goals>
  <configuration>
      <generator>java</generator>
      <thriftExecutable>${thrift.exec.absolute.path}</thriftExecutable>
      <thriftSourceRoot>${basedir}/src/main/thrift</thriftSourceRoot>
  </configuration>
</execution>
```
3. 参考该设置，在 pom.xml 文件中添加以下内容，用来生成 Rust 的原生接口：

```xml
<execution>
    <id>generate-thrift-sources-rust</id>
    <phase>generate-sources</phase>
    <goals>
        <goal>compile</goal>
    </goals>
    <configuration>
        <generator>rs</generator>
        <thriftExecutable>${thrift.exec.absolute.path}</thriftExecutable>
        <thriftSourceRoot>${basedir}/src/main/thrift</thriftSourceRoot>
        <includes>**/common.thrift,**/client.thrift</includes>
        <outputDirectory>${project.build.directory}/generated-sources-rust</outputDirectory>
    </configuration>
</execution>
```

4. 在 IoTDB 源代码文件夹的根目录下，运行`mvn clean generate-sources`，

这个指令将自动删除`iotdb/iotdb-protocol/thrift/target` 和 `iotdb/iotdb-protocol/thrift-commons/target`中的文件，并使用新生成的 thrift 文件重新填充该文件夹。

这个文件夹在 git 中会被忽略，并且**永远不应该被推到 git 中！**

**注意**不要将`iotdb/iotdb-protocol/thrift/target` 和 `iotdb/iotdb-protocol/thrift-commons/target`上传到 git 仓库中 ！

## 3. 使用 Rust 原生接口

将 `iotdb/iotdb-protocol/thrift/target/generated-sources-rust/` 和 `iotdb/iotdb-protocol/thrift-commons/target/generated-sources-rust/` 中的文件复制到您的项目中，即可使用。

## 4. 支持的 rpc 接口

```
// 打开一个 session
TSOpenSessionResp openSession(1:TSOpenSessionReq req);

// 关闭一个 session
TSStatus closeSession(1:TSCloseSessionReq req);

// 执行一条 SQL 语句
TSExecuteStatementResp executeStatement(1:TSExecuteStatementReq req);

// 批量执行 SQL 语句
TSStatus executeBatchStatement(1:TSExecuteBatchStatementReq req);

// 执行查询 SQL 语句
TSExecuteStatementResp executeQueryStatement(1:TSExecuteStatementReq req);

// 执行插入、删除 SQL 语句
TSExecuteStatementResp executeUpdateStatement(1:TSExecuteStatementReq req);

// 向服务器取下一批查询结果
TSFetchResultsResp fetchResults(1:TSFetchResultsReq req)

// 获取元数据
TSFetchMetadataResp fetchMetadata(1:TSFetchMetadataReq req)

// 取消某次查询操作
TSStatus cancelOperation(1:TSCancelOperationReq req);

// 关闭查询操作数据集，释放资源
TSStatus closeOperation(1:TSCloseOperationReq req);

// 获取时区信息
TSGetTimeZoneResp getTimeZone(1:i64 sessionId);

// 设置时区
TSStatus setTimeZone(1:TSSetTimeZoneReq req);

// 获取服务端配置
ServerProperties getProperties();

// 设置 database
TSStatus setStorageGroup(1:i64 sessionId, 2:string storageGroup);

// 创建时间序列
TSStatus createTimeseries(1:TSCreateTimeseriesReq req);

// 创建多条时间序列
TSStatus createMultiTimeseries(1:TSCreateMultiTimeseriesReq req);

// 删除时间序列
TSStatus deleteTimeseries(1:i64 sessionId, 2:list<string> path)

// 删除 database
TSStatus deleteStorageGroups(1:i64 sessionId, 2:list<string> storageGroup);

// 按行插入数据
TSStatus insertRecord(1:TSInsertRecordReq req);

// 按 String 格式插入一条数据
TSStatus insertStringRecord(1:TSInsertStringRecordReq req);

// 按列插入数据
TSStatus insertTablet(1:TSInsertTabletReq req);

// 按列批量插入数据
TSStatus insertTablets(1:TSInsertTabletsReq req);

// 按行批量插入数据
TSStatus insertRecords(1:TSInsertRecordsReq req);

// 按行批量插入同属于某个设备的数据
TSStatus insertRecordsOfOneDevice(1:TSInsertRecordsOfOneDeviceReq req);

// 按 String 格式批量按行插入数据
TSStatus insertStringRecords(1:TSInsertStringRecordsReq req);

// 测试按列插入数据的延迟，注意：该接口不真实插入数据，只用来测试网络延迟
TSStatus testInsertTablet(1:TSInsertTabletReq req);

// 测试批量按列插入数据的延迟，注意：该接口不真实插入数据，只用来测试网络延迟
TSStatus testInsertTablets(1:TSInsertTabletsReq req);

// 测试按行插入数据的延迟，注意：该接口不真实插入数据，只用来测试网络延迟
TSStatus testInsertRecord(1:TSInsertRecordReq req);

// 测试按 String 格式按行插入数据的延迟，注意：该接口不真实插入数据，只用来测试网络延迟
TSStatus testInsertStringRecord(1:TSInsertStringRecordReq req);

// 测试按行插入数据的延迟，注意：该接口不真实插入数据，只用来测试网络延迟
TSStatus testInsertRecords(1:TSInsertRecordsReq req);

// 测试按行批量插入同属于某个设备的数据的延迟，注意：该接口不真实插入数据，只用来测试网络延迟
TSStatus testInsertRecordsOfOneDevice(1:TSInsertRecordsOfOneDeviceReq req);

// 测试按 String 格式批量按行插入数据的延迟，注意：该接口不真实插入数据，只用来测试网络延迟
TSStatus testInsertStringRecords(1:TSInsertStringRecordsReq req);

// 删除数据
TSStatus deleteData(1:TSDeleteDataReq req);

// 执行原始数据查询
TSExecuteStatementResp executeRawDataQuery(1:TSRawDataQueryReq req);

// 向服务器申请一个查询语句 ID
i64 requestStatementId(1:i64 sessionId);
```
