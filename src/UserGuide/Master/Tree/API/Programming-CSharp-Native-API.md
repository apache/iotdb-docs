<!--
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
-->

# C# Native API

## 1. Environment Requirements

* .NET SDK >= 5.0 or .NET Framework 4.x
* Thrift >= 0.14.1
* NLog >= 4.7.9

## 2. Dependency Installation

You can use NuGet Package Manager, .NET CLI, or other tools to install the required packages.

Using .NET CLI:

If you are using .NET 5.0 or later, run the following command to install the latest NuGet package

```Bash
dotnet add package Apache.IoTDB
```

For .NET Framework 4.x, we provide a separate NuGet package. Run

```Bash
dotnet add package Apache.IoTDB.framework
```

To install an older version, specify the version explicitly

```Bash
# Install v0.12.1.2
dotnet add package Apache.IoTDB --version 0.12.1.2
```

## 3. Quick Start

```C#
// Define parameters  
string host = "localhost";  
int port = 6667;  
int pool_size = 2;  

// Initialize session pool  
var session_pool = new SessionPool(host, port, pool_size);  

// Open session  
await session_pool.Open(false);  

// Create time series  
await session_pool.CreateTimeSeries("root.test_group.test_device.ts1", TSDataType.TEXT, TSEncoding.PLAIN, Compressor.UNCOMPRESSED);  
await session_pool.CreateTimeSeries("root.test_group.test_device.ts2", TSDataType.BOOLEAN, TSEncoding.PLAIN, Compressor.UNCOMPRESSED);  
await session_pool.CreateTimeSeries("root.test_group.test_device.ts3", TSDataType.INT32, TSEncoding.PLAIN, Compressor.UNCOMPRESSED);  

// Insert a record  
var measures = new List<string>{"ts1", "ts2", "ts3"};  
var values = new List<object> { "test_text", true, (int)123 };  
var timestamp = 1;  
var rowRecord = new RowRecord(timestamp, values, measures);  
await session_pool.InsertRecordAsync("root.test_group.test_device", rowRecord);  

// Insert a tablet  
var timestamp_lst = new List<long>{ timestamp + 1 };  
var value_lst = new List<object> {"iotdb", true, (int) 12};  
var tablet = new Tablet("root.test_group.test_device", measures, value_lst, timestamp_lst);  
await session_pool.InsertTabletAsync(tablet);  

// Close session  
await session_pool.Close();
```

## 4. Full API Reference

SessionPoolis a thread-safe connection pool that supports concurrent client requests. When pool_size=1, it behaves like a single session.

### 4.1 Basic API

|  Method        | Parameters           | Description          | Example                       |
| -------------- | --------------------------- | -------------- | -------------------------------- |
| Open           | bool                      | Open session     | session\_pool.Open(false)      |
| Close          | null                      | Close session     | session\_pool.Close()          |
| IsOpen         | null                      | Check session status | session\_pool.IsOpen()         |
| OpenDebugMode  | LoggingConfiguration=null | Enable debug mode | session\_pool.OpenDebugMode()  |
| CloseDebugMode | null                      | Disable debug mode | session\_pool.CloseDebugMode() |
| SetTimeZone    | string                    | Set timezone     | session\_pool.GetTimeZone()    |
| GetTimeZone    | null                      | Get timezone    | session\_pool.GetTimeZone()    |

### 4.2 Metadata API

| Method        | Parameters           | Description          | Example                                                                                                           |
| ---------------------------- | ---------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| SetStorageGroup            | string                                                               | Create a storage group       | session\_pool.SetStorageGroup("root.97209\_TEST\_CSHARP\_CLIENT\_GROUP\_01")                              |
| CreateTimeSeries           | string, TSDataType, TSEncoding, Compressor                           | Create a time series         | session\_pool.InsertTabletsAsync(tablets)                                                                 |
| CreateMultiTimeSeriesAsync | List, List , List , List | Create multiple time series    | session\_pool.CreateMultiTimeSeriesAsync(ts\_path\_lst, data\_type\_lst, encoding\_lst, compressor\_lst); |
| CheckTimeSeriesExistsAsync | string                                                               | Check if a time series exists | session\_pool.CheckTimeSeriesExistsAsync(time series)                                                     |

### 4.3 Write API

IoTDB C# client supports RowRecord (single-row) and Tablet (batch) writing

* RowRecord: For single-row insertion.

```C#
var rowRecord = 
  new RowRecord(long timestamps, List<object> values, List<string> measurements);
```

* Tablet: For batch insertion (device + multiple rows).

```C#
var tablet = 
  new Tablet(string deviceId,  List<string> measurements, List<List<object>> values, List<long> timestamps);
```

#### 4.3.1 Record

| Method        | Parameters           | Description                          | Example                                                                                                                                     |
| ------------------------------------- | ------------------------------- |--------------------------------------| ---------------------------------------------------------------------------------------------------------------------------------------------- |
| InsertRecordAsync                   | string, RowRecord             | Insert a single record               | session\_pool.InsertRecordAsync("root.97209\_TEST\_CSHARP\_CLIENT\_GROUP.TEST\_CSHARP\_CLIENT\_DEVICE", new RowRecord(1, values, measures)); |
| InsertRecordsAsync                  | List, List | Insert multiple records              | session\_pool.InsertRecordsAsync(device\_id, rowRecords)                                                                                     |
| InsertRecordsOfOneDeviceAsync       | string, List       | Insert records for one device        | session\_pool.InsertRecordsOfOneDeviceAsync(device\_id, rowRecords)                                                                          |
| InsertRecordsOfOneDeviceSortedAsync | string, List       | Insert sorted records for one device | session\_pool.InsertRecordsOfOneDeviceSortedAsync(deviceId, sortedRowRecords);                                                               |
| TestInsertRecordAsync               | string, RowRecord             | Test record insertion                | session\_pool.TestInsertRecordAsync("root.97209\_TEST\_CSHARP\_CLIENT\_GROUP.TEST\_CSHARP\_CLIENT\_DEVICE", rowRecord)                       |
| TestInsertRecordsAsync              | List, List | Test record insertion                | session\_pool.TestInsertRecordsAsync(device\_id, rowRecords)                                                                                 |

#### 4.3.2 Tablet

| Method        | Parameters           | Description          | Example                                         |
| ------------------------ | -------------- | ------------------ | ----------------------------------------------- |
| InsertTabletAsync      | Tablet       | Insert a single tablet  | session\_pool.InsertTabletAsync(tablet)       |
| InsertTabletsAsync     | List | Insert multiple tablets | session\_pool.InsertTabletsAsync(tablets)     |
| TestInsertTabletAsync  | Tablet       | Test tablet insertion  | session\_pool.TestInsertTabletAsync(tablet)   |
| TestInsertTabletsAsync | List | Test tablet insertion | session\_pool.TestInsertTabletsAsync(tablets) |

### 4.4 Query API

| Method        | Parameters           | Description          | Example                                                                                                                                                                          |
| -------------------------------- | -------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ExecuteQueryStatementAsync     | string | Execute a query   | session\_pool.ExecuteQueryStatementAsync("select \* from root.97209\_TEST\_CSHARP\_CLIENT\_GROUP.TEST\_CSHARP\_CLIENT\_DEVICE where time<15");                                     |
| ExecuteNonQueryStatementAsync| string | Execute a non-query statement | session\_pool.ExecuteNonQueryStatementAsync( "create timeseries root.97209\_TEST\_CSHARP\_CLIENT\_GROUP.TEST\_CSHARP\_CLIENT\_DEVICE.status with datatype=BOOLEAN,encoding=PLAIN") |

### 4.5 Delete API

| Method        | Parameters           | Description            | Example                                                                               |
| -------------------------- | -------------------------- |------------------------| -------------------------------------------------------------------------------------- |
| DeleteStorageGroupAsync  | string                   | Delete a storage group | session\_pool.DeleteStorageGroupAsync("root.97209\_TEST\_CSHARP\_CLIENT\_GROUP\_01") |
| DeleteStorageGroupsAsync | List             | Delete storage groups  | session\_pool.DeleteStorageGroupAsync("root.97209\_TEST\_CSHARP\_CLIENT\_GROUP")     |
| DeleteTimeSeriesAsync    | List             | Delete time series     | session\_pool.DeleteTimeSeriesAsync(ts\_path\_lst)                                   |
| DeleteTimeSeriesAsync    | string                   | Delete time series     | session\_pool.DeleteTimeSeriesAsync(ts\_path)                                        |
| DeleteDataAsync          | List, long, long | Delete data            | session\_pool.DeleteDataAsync(ts\_path\_lst, 2, 3)                                   |

## 5. Sample Code

For complete examples, refer to: [Apache.IoTDB.Samples](https://github.com/apache/iotdb-client-csharp/tree/main/samples/Apache.IoTDB.Samples)