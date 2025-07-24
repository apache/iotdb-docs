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

# C# 原生接口

## 环境要求

* .NET SDK >= 5.0 或 .NET Framework 4.x
* Thrift >= 0.14.1
* NLog >= 4.7.9

## 依赖安装

您可以使用 NuGet Package Manager, .NET CLI等工具来安装，以 .NET CLI为例

如果您使用的是.NET 5.0 或者更高版本的SDK，输入如下命令即可安装最新的NuGet包

```Bash
dotnet add package Apache.IoTDB
```

为了适配 .NET Framework 4.x，我们单独构建了一个NuGet包，如果您使用的是.NET Framework 4.x，输入如下命令即可安装最新的包

```Bash
dotnet add package Apache.IoTDB.framework
```

如果您想安装更早版本的客户端，只需要指定版本即可

```Bash
# 安装0.12.1.2版本的客户端
dotnet add package Apache.IoTDB --version 0.12.1.2
```

## 快速入门

```C#
// 参数定义
string host = "localhost";
int port = 6667;
int pool_size = 2;

// 初始化session
var session_pool = new SessionPool(host, port, pool_size);

// 开启session
await session_pool.Open(false);

// 创建时间序列
await session_pool.CreateTimeSeries("root.test_group.test_device.ts1", TSDataType.TEXT, TSEncoding.PLAIN, Compressor.UNCOMPRESSED);
await session_pool.CreateTimeSeries("root.test_group.test_device.ts2", TSDataType.BOOLEAN, TSEncoding.PLAIN, Compressor.UNCOMPRESSED);
await session_pool.CreateTimeSeries("root.test_group.test_device.ts3", TSDataType.INT32, TSEncoding.PLAIN, Compressor.UNCOMPRESSED);

// 插入record
var measures = new List<string>{"ts1", "ts2", "ts3"};
var values = new List<object> { "test_text", true, (int)123 };
var timestamp = 1;
var rowRecord = new RowRecord(timestamp, values, measures);
await session_pool.InsertRecordAsync("root.test_group.test_device", rowRecord);

// 插入Tablet
var timestamp_lst = new List<long>{ timestamp + 1 };
var value_lst = new List<object> {"iotdb", true, (int) 12};
var tablet = new Tablet("root.test_group.test_device", measures, value_lst, timestamp_lst);
await session_pool.InsertTabletAsync(tablet);

// 关闭Session
await session_pool.Close();
```

## 全量接口说明

SessionPool 连接池支持并发客户端请求，线程安全。当 `pool_size`设为 1 时，其行为等同于单个 session。推荐使用 SessionPool ，作为实现与数据库交互的核心接口，SessionPool 集成了丰富的方法，支持数据写入、查询以及元数据操作等功能，详细介绍见下文。

### 基础接口

| 方法名         | 参数                      | 描述         | 示例                           |
| ---------------- | --------------------------- | -------------- | -------------------------------- |
| Open           | bool                      | 打开会话     | session\_pool.Open(false)      |
| Close          | null                      | 关闭会话     | session\_pool.Close()          |
| IsOpen         | null                      | 查看会话状态 | session\_pool.IsOpen()         |
| OpenDebugMode  | LoggingConfiguration=null | 启用调试模式 | session\_pool.OpenDebugMode()  |
| CloseDebugMode | null                      | 禁用调试模式 | session\_pool.CloseDebugMode() |
| SetTimeZone    | string                    | 设置时区     | session\_pool.GetTimeZone()    |
| GetTimeZone    | null                      | 获取时区     | session\_pool.GetTimeZone()    |

### 元数据接口

| 方法名                     | 参数                                                                 | 描述                 | 示例                                                                                                      |
| ---------------------------- | ---------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| SetStorageGroup            | string                                                               | （创建）存储组       | session\_pool.SetStorageGroup("root.97209\_TEST\_CSHARP\_CLIENT\_GROUP\_01")                              |
| CreateTimeSeries           | string, TSDataType, TSEncoding, Compressor                           | 创建时间序列         | session\_pool.InsertTabletsAsync(tablets)                                                                 |
| CreateMultiTimeSeriesAsync | List, List , List , List | 创建多个时间序列     | session\_pool.CreateMultiTimeSeriesAsync(ts\_path\_lst, data\_type\_lst, encoding\_lst, compressor\_lst); |
| CheckTimeSeriesExistsAsync | string                                                               | 查看时间序列是否存在 | session\_pool.CheckTimeSeriesExistsAsync(time series)                                                     |

### 写入接口

C# 原生接口支持通过 Record 和 Tablet 两种方式进行数据写入：

* RowRecord 是对 IoTDB 中的`record`数据进行封装和抽象，适合单行数据写入的场景，其构造方法如下

```C#
var rowRecord = 
  new RowRecord(long timestamps, List<object> values, List<string> measurements);
```

* Tablet 是一种类似于表格的数据结构，适合一个设备若干行非空数据块写入的场景，其构造方法如下

```C#
var tablet = 
  new Tablet(string deviceId,  List<string> measurements, List<List<object>> values, List<long> timestamps);
```

#### Record

| 方法名                              | 参数                          | 描述                   | 示例                                                                                                                                         |
| ------------------------------------- | ------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| InsertRecordAsync                   | string, RowRecord             | 插入单条记录           | session\_pool.InsertRecordAsync("root.97209\_TEST\_CSHARP\_CLIENT\_GROUP.TEST\_CSHARP\_CLIENT\_DEVICE", new RowRecord(1, values, measures)); |
| InsertRecordsAsync                  | List, List | 插入多条记录           | session\_pool.InsertRecordsAsync(device\_id, rowRecords)                                                                                     |
| InsertRecordsOfOneDeviceAsync       | string, List       | 插入同一设备的记录     | session\_pool.InsertRecordsOfOneDeviceAsync(device\_id, rowRecords)                                                                          |
| InsertRecordsOfOneDeviceSortedAsync | string, List       | 插入同一设备的有序记录 | session\_pool.InsertRecordsOfOneDeviceSortedAsync(deviceId, sortedRowRecords);                                                               |
| TestInsertRecordAsync               | string, RowRecord             | 测试插入记录           | session\_pool.TestInsertRecordAsync("root.97209\_TEST\_CSHARP\_CLIENT\_GROUP.TEST\_CSHARP\_CLIENT\_DEVICE", rowRecord)                       |
| TestInsertRecordsAsync              | List, List | 测试插入记录           | session\_pool.TestInsertRecordsAsync(device\_id, rowRecords)                                                                                 |

#### Tablet

| 方法名                 | 参数         | 描述             | 示例                                          |
| ------------------------ | -------------- | ------------------ | ----------------------------------------------- |
| InsertTabletAsync      | Tablet       | 插入单个 tablet  | session\_pool.InsertTabletAsync(tablet)       |
| InsertTabletsAsync     | List | 插入一批 tablets | session\_pool.InsertTabletsAsync(tablets)     |
| TestInsertTabletAsync  | Tablet       | 测试插入 tablet  | session\_pool.TestInsertTabletAsync(tablet)   |
| TestInsertTabletsAsync | List | 测试插入 tablets | session\_pool.TestInsertTabletsAsync(tablets) |

### 查询接口

| 方法名                         | 参数   | 描述                | 示例                                                                                                                                                                               |
| -------------------------------- | -------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ExecuteQueryStatementAsync     | string | 执行 SQL 查询语句   | session\_pool.ExecuteQueryStatementAsync("select \* from root.97209\_TEST\_CSHARP\_CLIENT\_GROUP.TEST\_CSHARP\_CLIENT\_DEVICE where time<15");                                     |
| ExecuteNonQueryStatementAsync| string | 执行 SQL 非查询语句 | session\_pool.ExecuteNonQueryStatementAsync( "create timeseries root.97209\_TEST\_CSHARP\_CLIENT\_GROUP.TEST\_CSHARP\_CLIENT\_DEVICE.status with datatype=BOOLEAN,encoding=PLAIN") |

### 删除接口

| 方法名                   | 参数                     | 描述           | 示例                                                                                 |
| -------------------------- | -------------------------- | ---------------- | -------------------------------------------------------------------------------------- |
| DeleteStorageGroupAsync  | string                   | 删除单个存储组 | session\_pool.DeleteStorageGroupAsync("root.97209\_TEST\_CSHARP\_CLIENT\_GROUP\_01") |
| DeleteStorageGroupsAsync | List             | 删除存储组     | session\_pool.DeleteStorageGroupAsync("root.97209\_TEST\_CSHARP\_CLIENT\_GROUP")     |
| DeleteTimeSeriesAsync    | List             | 删除时间序列   | session\_pool.DeleteTimeSeriesAsync(ts\_path\_lst)                                   |
| DeleteTimeSeriesAsync    | string                   | 删除时间序列   | session\_pool.DeleteTimeSeriesAsync(ts\_path)                                        |
| DeleteDataAsync          | List, long, long | 删除数据       | session\_pool.DeleteDataAsync(ts\_path\_lst, 2, 3)                                   |

## 示例代码

完整示例请参考：[Apache.IoTDB.Samples](https://github.com/apache/iotdb-client-csharp/tree/main/samples/Apache.IoTDB.Samples)

