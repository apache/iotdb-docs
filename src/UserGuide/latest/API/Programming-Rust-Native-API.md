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

# Rust Native API Native API

IoTDB uses Thrift as a cross language RPC framework, so access to IoTDB can be achieved through the interface provided by Thrift. 
This document will introduce how to generate a native Rust interface that can access IoTDB.

## 1. Dependents

 * JDK >= 1.8
 * Rust >= 1.0.0
 * thrift 0.14.1
 * Linux、Macos or like unix
 * Windows+bash

Thrift (0.14.1 or higher) must be installed to compile Thrift files into Rust code. The following is the official installation tutorial, and in the end, you should receive a Thrift executable file.

```
http://thrift.apache.org/docs/install/
```

## 2. Compile the Thrift library and generate the Rust native interface

1. Find the `pom.xml` file in the root directory of the IoTDB source code folder.
2. Open the `pom.xml` file and find the following content:
   ```xml
                            <execution>
                                <id>generate-thrift-sources-python</id>
                                <phase>generate-sources</phase>
                                <goals>
                                    <goal>compile</goal>
                                </goals>
                                <configuration>
                                    <generator>py</generator>
                                    <outputDirectory>${project.build.directory}/generated-sources-python/</outputDirectory>
                                </configuration>
                            </execution>
   ```
3. Duplicate this block and change the `id`, `generator` and `outputDirectory` to this:
   ```xml
                            <execution>
                                <id>generate-thrift-sources-rust</id>
                                <phase>generate-sources</phase>
                                <goals>
                                    <goal>compile</goal>
                                </goals>
                                <configuration>
                                    <generator>rs</generator>
                                    <outputDirectory>${project.build.directory}/generated-sources-rust/</outputDirectory>
                                </configuration>
                            </execution>
   ```
4. In the root directory of the IoTDB source code folder，run `mvn clean generate-sources`.

This command will automatically delete the files in `iotdb/iotdb-protocol/thrift/target` and `iotdb/iotdb-protocol/thrift-commons/target`, and repopulate the folder with the newly generated files.
The newly generated Rust sources will be located in `iotdb/iotdb-protocol/thrift/target/generated-sources-rust` in the various modules of the `iotdb-protocol` module.

## 3. Using the Rust native interface

Copy `iotdb/iotdb-protocol/thrift/target/generated-sources-rust/` and `iotdb/iotdb-protocol/thrift-commons/target/generated-sources-rust/` into your project。

## 4. RPC interface

```
// open a session
TSOpenSessionResp openSession(1:TSOpenSessionReq req);

// close a session
TSStatus closeSession(1:TSCloseSessionReq req);

// run an SQL statement in batch
TSExecuteStatementResp executeStatement(1:TSExecuteStatementReq req);

// execute SQL statement in batch
TSStatus executeBatchStatement(1:TSExecuteBatchStatementReq req);

// execute query SQL statement
TSExecuteStatementResp executeQueryStatement(1:TSExecuteStatementReq req);

// execute insert, delete and update SQL statement 
TSExecuteStatementResp executeUpdateStatement(1:TSExecuteStatementReq req);

// fetch next query result
TSFetchResultsResp fetchResults(1:TSFetchResultsReq req)

// fetch meta data
TSFetchMetadataResp fetchMetadata(1:TSFetchMetadataReq req)

// cancel a query 
TSStatus cancelOperation(1:TSCancelOperationReq req);

// close a query dataset
TSStatus closeOperation(1:TSCloseOperationReq req);

// get time zone
TSGetTimeZoneResp getTimeZone(1:i64 sessionId);

// set time zone
TSStatus setTimeZone(1:TSSetTimeZoneReq req);

// get server's properties
ServerProperties getProperties();

// CREATE DATABASE
TSStatus setStorageGroup(1:i64 sessionId, 2:string storageGroup);

// create timeseries
TSStatus createTimeseries(1:TSCreateTimeseriesReq req);

// create multi timeseries
TSStatus createMultiTimeseries(1:TSCreateMultiTimeseriesReq req);

// delete timeseries
TSStatus deleteTimeseries(1:i64 sessionId, 2:list<string> path)

// delete sttorage groups
TSStatus deleteStorageGroups(1:i64 sessionId, 2:list<string> storageGroup);

// insert record
TSStatus insertRecord(1:TSInsertRecordReq req);

// insert record in string format
TSStatus insertStringRecord(1:TSInsertStringRecordReq req);

// insert tablet
TSStatus insertTablet(1:TSInsertTabletReq req);

// insert tablets in batch
TSStatus insertTablets(1:TSInsertTabletsReq req);

// insert records in batch
TSStatus insertRecords(1:TSInsertRecordsReq req);

// insert records of one device
TSStatus insertRecordsOfOneDevice(1:TSInsertRecordsOfOneDeviceReq req);

// insert records in batch as string format
TSStatus insertStringRecords(1:TSInsertStringRecordsReq req);

// test the latency of innsert tablet，caution：no data will be inserted, only for test latency
TSStatus testInsertTablet(1:TSInsertTabletReq req);

// test the latency of innsert tablets，caution：no data will be inserted, only for test latency
TSStatus testInsertTablets(1:TSInsertTabletsReq req);

// test the latency of innsert record，caution：no data will be inserted, only for test latency
TSStatus testInsertRecord(1:TSInsertRecordReq req);

// test the latency of innsert record in string format，caution：no data will be inserted, only for test latency
TSStatus testInsertStringRecord(1:TSInsertStringRecordReq req);

// test the latency of innsert records，caution：no data will be inserted, only for test latency
TSStatus testInsertRecords(1:TSInsertRecordsReq req);

// test the latency of innsert records of one device，caution：no data will be inserted, only for test latency
TSStatus testInsertRecordsOfOneDevice(1:TSInsertRecordsOfOneDeviceReq req);

// test the latency of innsert records in string formate，caution：no data will be inserted, only for test latency
TSStatus testInsertStringRecords(1:TSInsertStringRecordsReq req);

// delete data
TSStatus deleteData(1:TSDeleteDataReq req);

// execute raw data query
TSExecuteStatementResp executeRawDataQuery(1:TSRawDataQueryReq req);

// request a statement id from server
i64 requestStatementId(1:i64 sessionId);
```
