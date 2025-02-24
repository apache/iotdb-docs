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

## 依赖

- .NET SDK >= 5.0 或 .NET Framework 4.x
- Thrift >= 0.14.1
- NLog >= 4.7.9

## 安装

您可以使用 NuGet Package Manager, .NET CLI等工具来安装，以 .NET CLI为例

如果您使用的是\.NET 5.0 或者更高版本的SDK，输入如下命令即可安装最新的NuGet包

```
dotnet add package Apache.IoTDB
```

为了适配 .NET Framework 4.x，我们单独构建了一个NuGet包，如果您使用的是\.NET Framework 4.x，输入如下命令即可安装最新的包

```bash
dotnet add package Apache.IoTDB.framework
```

如果您想安装更早版本的客户端，只需要指定版本即可

```bash
# 安装0.12.1.2版本的客户端
dotnet add package Apache.IoTDB --version 0.12.1.2
```

## 基本接口说明

Session接口在语义上和其他语言客户端相同

```csharp
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

## **Row Record**

- 对**IoTDB**中的`record`数据进行封装和抽象。
- 示例：

| timestamp | status | temperature |
| --------- | ------ | ----------- |
| 1         | 0      | 20          |

- 构造方法：

```csharp
var rowRecord = 
  new RowRecord(long timestamps, List<object> values, List<string> measurements);
```

### **Tablet**

- 一种类似于表格的数据结构，包含一个设备的若干行非空数据块。
- 示例：

| time | status | temperature |
| ---- | ------ | ----------- |
| 1    | 0      | 20          |
| 2    | 0      | 20          |
| 3    | 3      | 21          |

- 构造方法：

```csharp
var tablet = 
  Tablet(string deviceId,  List<string> measurements, List<List<object>> values, List<long> timestamps);
```



## **API**

### **基础接口**

| api name       | parameters                | notes                    | use example                   |
| -------------- | ------------------------- | ------------------------ | ----------------------------- |
| Open           | bool                      | open session             | session_pool.Open(false)      |
| Close          | null                      | close session            | session_pool.Close()          |
| IsOpen         | null                      | check if session is open | session_pool.IsOpen()         |
| OpenDebugMode  | LoggingConfiguration=null | open debug mode          | session_pool.OpenDebugMode()  |
| CloseDebugMode | null                      | close debug mode         | session_pool.CloseDebugMode() |
| SetTimeZone    | string                    | set time zone            | session_pool.GetTimeZone()    |
| GetTimeZone    | null                      | get time zone            | session_pool.GetTimeZone()    |

### **Record相关接口**

| api name                            | parameters                    | notes                               | use example                                                  |
| ----------------------------------- | ----------------------------- | ----------------------------------- | ------------------------------------------------------------ |
| InsertRecordAsync                   | string, RowRecord             | insert single record                | session_pool.InsertRecordAsync("root.97209_TEST_CSHARP_CLIENT_GROUP.TEST_CSHARP_CLIENT_DEVICE", new RowRecord(1, values, measures)); |
| InsertRecordsAsync                  | List\<string\>, List\<RowRecord\> | insert records                      | session_pool.InsertRecordsAsync(device_id, rowRecords)       |
| InsertRecordsOfOneDeviceAsync       | string, List\<RowRecord\>       | insert records of one device        | session_pool.InsertRecordsOfOneDeviceAsync(device_id, rowRecords) |
| InsertRecordsOfOneDeviceSortedAsync | string, List\<RowRecord\>       | insert sorted records of one device | InsertRecordsOfOneDeviceSortedAsync(deviceId, sortedRowRecords); |
| TestInsertRecordAsync               | string, RowRecord             | test insert record                  | session_pool.TestInsertRecordAsync("root.97209_TEST_CSHARP_CLIENT_GROUP.TEST_CSHARP_CLIENT_DEVICE", rowRecord) |
| TestInsertRecordsAsync              | List\<string\>, List\<RowRecord\> | test insert record                  | session_pool.TestInsertRecordsAsync(device_id, rowRecords)   |

### **Tablet相关接口**

| api name               | parameters   | notes                | use example                                  |
| ---------------------- | ------------ | -------------------- | -------------------------------------------- |
| InsertTabletAsync      | Tablet       | insert single tablet | session_pool.InsertTabletAsync(tablet)       |
| InsertTabletsAsync     | List\<Tablet\> | insert tablets       | session_pool.InsertTabletsAsync(tablets)     |
| TestInsertTabletAsync  | Tablet       | test insert tablet   | session_pool.TestInsertTabletAsync(tablet)   |
| TestInsertTabletsAsync | List\<Tablet\> | test insert tablets  | session_pool.TestInsertTabletsAsync(tablets) |

### **SQL语句接口**

| api name                      | parameters | notes                          | use example                                                  |
| ----------------------------- | ---------- | ------------------------------ | ------------------------------------------------------------ |
| ExecuteQueryStatementAsync    | string     | execute sql query statement    | session_pool.ExecuteQueryStatementAsync("select * from root.97209_TEST_CSHARP_CLIENT_GROUP.TEST_CSHARP_CLIENT_DEVICE where time<15"); |
| ExecuteNonQueryStatementAsync | string     | execute sql nonquery statement | session_pool.ExecuteNonQueryStatementAsync( "create timeseries root.97209_TEST_CSHARP_CLIENT_GROUP.TEST_CSHARP_CLIENT_DEVICE.status with datatype=BOOLEAN,encoding=PLAIN") |

### 数据表接口

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

### **辅助接口**

| api name                   | parameters | notes                       | use example                                          |
| -------------------------- | ---------- | --------------------------- | ---------------------------------------------------- |
| CheckTimeSeriesExistsAsync | string     | check if time series exists | session_pool.CheckTimeSeriesExistsAsync(time series) |



用法可以参考[用户示例](https://github.com/apache/iotdb-client-csharp/tree/main/samples/Apache.IoTDB.Samples)

## 连接池

为了实现并发客户端请求，我们提供了针对原生接口的连接池(`SessionPool`)，由于`SessionPool`本身为`Session`的超集，当`SessionPool`的`pool_size`参数设置为1时，退化为原来的`Session`

我们使用`ConcurrentQueue`数据结构封装了一个客户端队列，以维护与服务端的多个连接，当调用`Open()`接口时，会在该队列中创建指定个数的客户端，同时通过`System.Threading.Monitor`类实现对队列的同步访问。

当请求发生时，会尝试从连接池中寻找一个空闲的客户端连接，如果没有空闲连接，那么程序将需要等待直到有空闲连接

当一个连接被用完后，他会自动返回池中等待下次被使用

## ByteBuffer

在传入RPC接口参数时，需要对Record和Tablet两种数据结构进行序列化，我们主要通过封装的ByteBuffer类实现

在封装字节序列的基础上，我们进行了内存预申请与内存倍增的优化，减少了序列化过程中内存的申请和释放，在一个拥有20000行的Tablet上进行序列化测试时，速度比起原生的数组动态增长具有**35倍的性能加速**

### 实现介绍
在进行`RowRecords`以及`Tablet`的插入时，我们需要对多行RowRecord和Tablet进行序列化以进行发送。客户端中的序列化实现主要依赖于ByteBuffer完成。接下来我们介绍ByteBuffer的实现细节。本文包含如下几点内容:
 - 序列化的协议
 - C#与Java的大小端的差异
 - ByteBuffer内存倍增算法

### 序列化协议
客户端向IoTDB服务器发送的序列化数据总体应该包含两个信息。
 -  数据类型
 -  数据本身

其中对于`字符串`的序列化时，我们需要再加入字符串的长度信息。即一个字符串的序列化完整结果为:

    [类型][长度][数据内容]
接下来我们分别介绍`RowRecord`、`Tablet`的序列化方式

#### RowRecord
我们对RowRecord进行序列化时，`伪代码`如下:
```csharp
public byte[] value_to_bytes(List<TSDataType> data_types, List<string> values){
    ByteBuffer buffer = new ByteBuffer(values.Count);
    for(int i = 0;i < data_types.Count(); i++){
        buffer.add_type((data_types[i]);
        buffer.add_val(values[i]);
    }
}
```

对于其序列化的结果格式如下:

    [数据类型1][数据1][数据类型2][数据2]...[数据类型N][数据N]
 其中数据类型为自定义的`Enum`变量，分别如下:
```csharp
public enum TSDataType{BOOLEAN, INT32, INT64, FLOAT, DOUBLE, TEXT, NONE};
```

#### Tablet序列化
使用`Tabelt`进行数据插入时有如下限制:

    限制：Tablet中数据不能有空值
由于向 `IoTDB`服务器发送`Tablet`数据插入请求时会携带`行数`， `列数`, `列数据类型`，所以`Tabelt`序列化时我们不需要加入数据类型信息。`Tablet`是`按照列进行序列化`，这是因为后端可以通过行数得知出当前列的元素个数，同时根据列类型来对数据进行解析。

### CSharp与Java序列化数据时的大小端差异
由于Java序列化默认大端协议，而CSharp序列化默认得到小端序列。所以我们在CSharp中序列化数据之后，需要对数据进行反转这样后端才可以正常解析。同时当我们从后端获取到序列化的结果时(如`SessionDataset`)，我们也需要对获得的数据进行反转以解析内容。这其中特例便是字符串的序列化，CSharp中对字符串的序列化结果为大端序，所以序列化字符串或者接收到字符串序列化结果时，不需要反转序列结果。

### ByteBuffer内存倍增法
拥有数万行的Tablet的序列化结果可能有上百兆，为了能够高效的实现大`Tablet`的序列化，我们对ByteBuffer使用`内存倍增法`的策略来减少序列化过程中对于内存的申请和释放。即当当前的buffer的长度不足以放下序列化结果时，我们将当前buffer的内存`至少`扩增2倍。这极大的减少了内存的申请释放次数，加速了大Tablet的序列化速度。
```csharp
private void extend_buffer(int space_need){
        if(write_pos + space_need >= total_length){
            total_length = max(space_need, total_length);
            byte[] new_buffer = new byte[total_length * 2];
            buffer.CopyTo(new_buffer, 0);
            buffer = new_buffer;
            total_length = 2 * total_length;
        }
}
```
同时在序列化`Tablet`时，我们首先根据Tablet的`行数`，`列数`以及每一列的数据类型估计当前`Tablet`序列化结果所需要的内存大小，并在初始化时进行内存的申请。这进一步的减少了内存的申请释放频率。

通过上述的策略，我们在一个有`20000`行的Tablet上进行测试时，序列化速度相比Naive数组长度动态生长实现算法具有约35倍的性能加速。

## 异常重连

当服务端发生异常或者宕机重启时，客户端中原来通过`Open()`产生的的session会失效，抛出`TException`异常

为了避免这一情况的发生，我们对大部分的接口进行了增强，一旦出现连接问题，就会尝试重新调用`Open()`接口并创建新的Session，并尝试重新发送对应的请求

