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

# C# Native API

## Installation

### Install from NuGet Package

We have prepared Nuget Package for C# users. Users can directly install the client through .NET CLI. [The link of our NuGet Package is here](https://www.nuget.org/packages/Apache.IoTDB/). Run the following command in the command line to complete installation

```sh
dotnet add package Apache.IoTDB
```

Note that the `Apache.IoTDB` package only supports versions greater than `.net framework 4.6.1`.

## Prerequisites

    .NET SDK Version >= 5.0 
    .NET Framework >= 4.6.1

## How to Use the Client (Quick Start)

Users can quickly get started by referring to the use cases under the Apache-IoTDB-Client-CSharp-UserCase directory. These use cases serve as a useful resource for getting familiar with the client's functionality and capabilities.

For those who wish to delve deeper into the client's usage and explore more advanced features, the samples directory contains additional code samples. 

## Developer environment requirements for iotdb-client-csharp

```
.NET SDK Version >= 5.0
.NET Framework >= 4.6.1
ApacheThrift >= 0.14.1
NLog >= 4.7.9
```

### OS

* Linux, Macos or other unix-like OS
* Windows+bash(WSL, cygwin, Git Bash)

### Command Line Tools

* dotnet CLI
* Thrift

## Basic interface description

The Session interface is semantically identical to other language clients

```csharp
// Parameters
string host = "localhost";
int port = 6667;
int pool_size = 2;

// Init Session
var session_pool = new SessionPool(host, port, pool_size);

// Open Session
await session_pool.Open(false);

// Create TimeSeries 
await session_pool.CreateTimeSeries("root.test_group.test_device.ts1", TSDataType.TEXT, TSEncoding.PLAIN, Compressor.UNCOMPRESSED);
await session_pool.CreateTimeSeries("root.test_group.test_device.ts2", TSDataType.BOOLEAN, TSEncoding.PLAIN, Compressor.UNCOMPRESSED);
await session_pool.CreateTimeSeries("root.test_group.test_device.ts3", TSDataType.INT32, TSEncoding.PLAIN, Compressor.UNCOMPRESSED);

// Insert Record
var measures = new List<string>{"ts1", "ts2", "ts3"};
var values = new List<object> { "test_text", true, (int)123 };
var timestamp = 1;
var rowRecord = new RowRecord(timestamp, values, measures);
await session_pool.InsertRecordAsync("root.test_group.test_device", rowRecord);

// Insert Tablet
var timestamp_lst = new List<long>{ timestamp + 1 };
var value_lst = new List<object> {"iotdb", true, (int) 12};
var tablet = new Tablet("root.test_group.test_device", measures, value_lst, timestamp_lst);
await session_pool.InsertTabletAsync(tablet);

// Close Session
await session_pool.Close();
```

## **Row Record**

- Encapsulate and abstract the `record` data in **IoTDB**
- e.g.

  | timestamp | status | temperature |
  | --------- | ------ | ----------- |
  | 1         | 0      | 20          |

- Construction：

```csharp
var rowRecord = 
  new RowRecord(long timestamps, List<object> values, List<string> measurements);
```

### **Tablet**

- A data structure similar to a table, containing several non empty data blocks of a device's rows。
- e.g.

  | time | status | temperature |
  | ---- | ------ | ----------- |
  | 1    | 0      | 20          |
  | 2    | 0      | 20          |
  | 3    | 3      | 21          |

- Construction：

```csharp
var tablet = 
  Tablet(string deviceId,  List<string> measurements, List<List<object>> values, List<long> timestamps);
```



## **API**

### **Basic API**

| api name       | parameters                | notes                    | use example                   |
| -------------- | ------------------------- | ------------------------ | ----------------------------- |
| Open           | bool                      | open session             | session_pool.Open(false)      |
| Close          | null                      | close session            | session_pool.Close()          |
| IsOpen         | null                      | check if session is open | session_pool.IsOpen()         |
| OpenDebugMode  | LoggingConfiguration=null | open debug mode          | session_pool.OpenDebugMode()  |
| CloseDebugMode | null                      | close debug mode         | session_pool.CloseDebugMode() |
| SetTimeZone    | string                    | set time zone            | session_pool.GetTimeZone()    |
| GetTimeZone    | null                      | get time zone            | session_pool.GetTimeZone()    |

### **Record API**

| api name                            | parameters                    | notes                               | use example                                                  |
| ----------------------------------- | ----------------------------- | ----------------------------------- | ------------------------------------------------------------ |
| InsertRecordAsync                   | string, RowRecord             | insert single record                | session_pool.InsertRecordAsync("root.97209_TEST_CSHARP_CLIENT_GROUP.TEST_CSHARP_CLIENT_DEVICE", new RowRecord(1, values, measures)); |
| InsertRecordsAsync                  | List\<string\>, List\<RowRecord\> | insert records                      | session_pool.InsertRecordsAsync(device_id, rowRecords)       |
| InsertRecordsOfOneDeviceAsync       | string, List\<RowRecord\>       | insert records of one device        | session_pool.InsertRecordsOfOneDeviceAsync(device_id, rowRecords) |
| InsertRecordsOfOneDeviceSortedAsync | string, List\<RowRecord\>       | insert sorted records of one device | InsertRecordsOfOneDeviceSortedAsync(deviceId, sortedRowRecords); |
| TestInsertRecordAsync               | string, RowRecord             | test insert record                  | session_pool.TestInsertRecordAsync("root.97209_TEST_CSHARP_CLIENT_GROUP.TEST_CSHARP_CLIENT_DEVICE", rowRecord) |
| TestInsertRecordsAsync              | List\<string\>, List\<RowRecord\> | test insert record                  | session_pool.TestInsertRecordsAsync(device_id, rowRecords)   |

### **Tablet API**

| api name               | parameters   | notes                | use example                                  |
| ---------------------- | ------------ | -------------------- | -------------------------------------------- |
| InsertTabletAsync      | Tablet       | insert single tablet | session_pool.InsertTabletAsync(tablet)       |
| InsertTabletsAsync     | List\<Tablet\> | insert tablets       | session_pool.InsertTabletsAsync(tablets)     |
| TestInsertTabletAsync  | Tablet       | test insert tablet   | session_pool.TestInsertTabletAsync(tablet)   |
| TestInsertTabletsAsync | List\<Tablet\> | test insert tablets  | session_pool.TestInsertTabletsAsync(tablets) |

### **SQL API**

| api name                      | parameters | notes                          | use example                                                  |
| ----------------------------- | ---------- | ------------------------------ | ------------------------------------------------------------ |
| ExecuteQueryStatementAsync    | string     | execute sql query statement    | session_pool.ExecuteQueryStatementAsync("select * from root.97209_TEST_CSHARP_CLIENT_GROUP.TEST_CSHARP_CLIENT_DEVICE where time<15"); |
| ExecuteNonQueryStatementAsync | string     | execute sql nonquery statement | session_pool.ExecuteNonQueryStatementAsync( "create timeseries root.97209_TEST_CSHARP_CLIENT_GROUP.TEST_CSHARP_CLIENT_DEVICE.status with datatype=BOOLEAN,encoding=PLAIN") |

### **Scheam API**

| api name                   | parameters                                                   | notes                       | use example                                                  |
| -------------------------- | ------------------------------------------------------------ | --------------------------- | ------------------------------------------------------------ |
| SetStorageGroup            | string                                                       | set storage group           | session_pool.SetStorageGroup("root.97209_TEST_CSHARP_CLIENT_GROUP_01") |
| CreateTimeSeries           | string, TSDataType, TSEncoding, Compressor                   | create time series          | session_pool.InsertTabletsAsync(tablets)                     |
| DeleteStorageGroupAsync    | string                                                       | delete single storage group | session_pool.DeleteStorageGroupAsync("root.97209_TEST_CSHARP_CLIENT_GROUP_01") |
| DeleteStorageGroupsAsync   | List\<string\>                                                 | delete storage group        | session_pool.DeleteStorageGroupAsync("root.97209_TEST_CSHARP_CLIENT_GROUP") |
| CreateMultiTimeSeriesAsync | List\<string\>, List\<TSDataType\> , List\<TSEncoding\> , List\<Compressor\> | create multi time series    | session_pool.CreateMultiTimeSeriesAsync(ts_path_lst, data_type_lst, encoding_lst, compressor_lst); |
| DeleteTimeSeriesAsync      | List\<string\>                                                 | delete time series          |                                                              |
| DeleteTimeSeriesAsync      | string                                                       | delete time series          |                                                              |
| DeleteDataAsync            | List\<string\>, long, long                                     | delete data                 | session_pool.DeleteDataAsync(ts_path_lst, 2, 3)              |

### **Other API**

| api name                   | parameters | notes                       | use example                                          |
| -------------------------- | ---------- | --------------------------- | ---------------------------------------------------- |
| CheckTimeSeriesExistsAsync | string     | check if time series exists | session_pool.CheckTimeSeriesExistsAsync(time series) |



[e.g.](https://github.com/apache/iotdb-client-csharp/tree/main/samples/Apache.IoTDB.Samples)

## SessionPool

To implement concurrent client requests, we provide a `SessionPool` for the native interface. Since `SessionPool` itself is a superset of `Session`, when `SessionPool` is a When the `pool_size` parameter is set to 1, it reverts to the original `Session`

We use the `ConcurrentQueue` data structure to encapsulate a client queue to maintain multiple connections with the server. When the `Open()` interface is called, a specified number of clients are created in the queue, and synchronous access to the queue is achieved through the `System.Threading.Monitor` class.

When a request occurs, it will try to find an idle client connection from the Connection pool. If there is no idle connection, the program will need to wait until there is an idle connection

When a connection is used up, it will automatically return to the pool and wait for the next time it is used up

