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

# Go 原生接口

Go 原生 API 支持通过 `Session `和 `SessionPool `两种方式与数据库进行交互。由于 `Session `非线程安全，因此强烈推荐使用 `SessionPool `编程。在多线程并发的情形下，`SessionPool `能够合理地管理和分配连接资源，以提升系统性能与资源利用效率。

本文将围绕 `SessionPool` 的使用进行说明，涵盖从环境准备、核心操作步骤到全量接口的完整内容。

## 1. 环境准备
### 1.1 前置依赖

* golang >= 1.13
* make >= 3.0
* curl >= 7.1.1
* thrift: 0.15.0
* Linux、Macos 或其他类 unix 系统
* Windows+bash (下载 IoTDB Go client 需要 git ，通过 WSL、cygwin、Git Bash 任意一种方式均可)

### 1.2 安装方法

* 使用 go mod

```Bash
# 切换到 GOPATH 的 HOME 路径，启用 Go Modules 功能
export GO111MODULE=on

# 配置 GOPROXY 环境变量
export GOPROXY=https://goproxy.io

# 创建命名的文件夹或目录，并切换当前目录
mkdir session_example && cd session_example

# 保存文件，自动跳转到新的地址
curl -o session_example.go -L https://github.com/apache/iotdb-client-go/raw/main/example/session_example.go

# 初始化 go module 环境
go mod init session_example

# 下载依赖包
go mod tidy

# 编译并运行程序
go run session_example.go
```

* 使用 GOPATH

```Bash
# get thrift 0.13.0
go get github.com/apache/thrift@0.13.0

# 递归创建目录
mkdir -p $GOPATH/src/iotdb-client-go-example/session_example

# 切换到当前目录
cd $GOPATH/src/iotdb-client-go-example/session_example

# 保存文件，自动跳转到新的地址
curl -o session_example.go -L https://github.com/apache/iotdb-client-go/raw/main/example/session_example.go

# 初始化 go module 环境
go mod init

# 下载依赖包
go mod tidy

# 编译并运行程序
go run session_example.go
```

## 2. 核心步骤

使用 Go 原生接口操作 IoTDB 的三个核心步骤如下：

1. 创建连接池实例：初始化一个`SessionPool`对象，配置连接参数和池大小。
2. 执行数据库操作：从连接池中`GetSession()`，执行数据写入或查询等操作，完成后必须`PutBack(session)`。
3. 关闭连接池资源：程序结束时调用`sessionPool.Close()`，释放所有连接。

下面的章节用于说明开发的核心流程，并未演示所有的参数和接口，如需了解全部功能及参数请参见: [全量接口说明](../API/Programming-Go-Native-API.md#_3-全量接口) 或 查阅: [SessionPool 示例源码](https://github.com/apache/iotdb-client-go/blob/main/example/session_pool/session_pool_example.go)

### 2.1 创建连接池实例

* 单实例

```Go
config := &client.PoolConfig{
    Host:     host,
    Port:     port,
    UserName: user,
    Password: password,
}
sessionPool = client.NewSessionPool(config, 3, 60000, 60000, false)
defer​ ​sessionPool.Close()
```

* 分布式或双活

```Go
config := &client.PoolConfig{
                UserName: user,
                Password: password,
                NodeUrls: strings.Split("127.0.0.1:6667,127.0.0.1:6668", ","),
        }
sessionPool = client.NewSessionPool(config, 3, 60000, 60000, false)
defer​ ​sessionPool.Close()
```

### 2.2 数据库操作
#### 2.2.1 数据写入

```Go
session, err := sessionPool.GetSession()
defer sessionPool.PutBack(session)
status, err := session.InsertTablet(tablet, false)
tablet.Reset()
checkError(status, err)
```

#### 2.2.2 数据查询

```Go
var timeout int64 = 1000
session, err := sessionPool.GetSession()
defer sessionPool.PutBack(session)
if err != nil {
    log.Print(err)
    return
}
sessionDataSet, err := session.ExecuteQueryStatement(sql, &timeout)
if err == nil {
    defer sessionDataSet.Close()
    printDataSet(sessionDataSet)
} else {
    log.Println(err)
}
```

### 2.3 使用示例

```Go
import (
    "flag"
    "fmt"
    "log"
    "math/rand"
    "strings"
    "time"

    "github.com/apache/iotdb-client-go/v2/client"
    "github.com/apache/iotdb-client-go/v2/common"
)

var (
    host     string
    port     string
    user     string
    password string
)
var sessionPool client.SessionPool

func main() {
    flag.StringVar(&host, "host", "127.0.0.1", "--host=192.168.1.100")
    flag.StringVar(&port, "port", "6667", "--port=6667")
    flag.StringVar(&user, "user", "root", "--user=root")
    flag.StringVar(&password, "password", "root", "--password=root")
    flag.Parse()
    
    //1.创建连接池
    config := &client.PoolConfig{
        Host:     host,
        Port:     port,
        UserName: user,
        Password: password,
    }
    sessionPool = client.NewSessionPool(config, 3, 60000, 60000, false)

    defer sessionPool.Close()
    
    //2.创建存储组
    setStorageGroup("root.sg1") 
    
    //3. 创建时间序列
    createTimeseries("root.sg1.dev1.temperature")
    
    //4.数据写入
    insertTablet()

    //5. 数据查询
    executeQueryStatement("select temperature from root.sg1.dev1") 
    
    //6. 删除
    deleteTimeseries("root.sg1.dev1.temperature")
    deleteStorageGroup("root.sg1")

}

// 设置存储组
func setStorageGroup(sg string) {
    session, err := sessionPool.GetSession()
    defer sessionPool.PutBack(session)
    if err == nil {
        session.SetStorageGroup(sg)
    }
}

// 删除存储组
func deleteStorageGroup(sg string) {
    session, err := sessionPool.GetSession()
    defer sessionPool.PutBack(session)
    if err == nil {
        checkError(session.DeleteStorageGroup(sg))
    }
}

// 创建时间序列
func createTimeseries(path string) {
    var (
        dataType   = client.FLOAT
        encoding   = client.PLAIN
        compressor = client.SNAPPY
    )
    session, err := sessionPool.GetSession()
    defer sessionPool.PutBack(session)
    if err == nil {
        checkError(session.CreateTimeseries(path, dataType, encoding, compressor, nil, nil))
    }
}

// 删除时间序列
func deleteTimeseries(paths ...string) {
    session, err := sessionPool.GetSession()
    defer sessionPool.PutBack(session)
    if err == nil {
        checkError(session.DeleteTimeseries(paths))
    }
}

// 插入Tablet数据
func insertTablet() {
    session, err := sessionPool.GetSession()
    defer sessionPool.PutBack(session)
    if err == nil {
        if tablet, err := createTablet(12); err == nil {
            status, err := session.InsertTablet(tablet, false)
            tablet.Reset()
            checkError(status, err)
        } else {
            log.Fatal(err)
        }
    }
}

//创建Tablet
func createTablet(rowCount int) (*client.Tablet, error) {
    tablet, err := client.NewTablet("root.sg1.dev1", []*client.MeasurementSchema{
        {
            Measurement: "temperature",
            DataType:    client.FLOAT,
        },
    }, rowCount)

    if err != nil {
        return nil, err
    }
    ts := time.Now().UTC().UnixNano() / 1000000
    for row := 0; row < int(rowCount); row++ {
        ts++
        tablet.SetTimestamp(ts, row)
        tablet.SetValueAt(rand.Float32(), 0, row)
        tablet.RowSize++
    }
    return tablet, nil
}

// 执行查询语句
func executeQueryStatement(sql string) {
    var timeout int64 = 1000
    session, err := sessionPool.GetSession()
    defer sessionPool.PutBack(session)
    if err != nil {
        log.Print(err)
        return
    }
    sessionDataSet, err := session.ExecuteQueryStatement(sql, &timeout)
    if err == nil {
        defer sessionDataSet.Close()
        printDataSet(sessionDataSet)
    } else {
        log.Println(err)
    }
}

// 打印查询结果
func printDataSet(sds *client.SessionDataSet) {
    columnNames := sds.GetColumnNames()
    for _, value := range columnNames {
        fmt.Printf("%s\t", value)
    }
    fmt.Println()

    for next, err := sds.Next(); err == nil && next; next, err = sds.Next() {
        for _, columnName := range columnNames {
            isNull, _ := sds.IsNull(columnName)

            if isNull {
                fmt.Printf("%v\t\t", "null")
            } else {
                v, _ := sds.GetString(columnName)
                fmt.Printf("%v\t\t", v)
            }
        }
        fmt.Println()
    }
}

// 检查错误
func checkError(status *common.TSStatus, err error) {
    if err != nil {
        log.Fatal(err)
    }

    if status != nil {
        if err = client.VerifySuccess(status); err != nil {
            log.Println(err)
        }
    }
}
```

## 3. 全量接口
### 3.1 SessionPool 管理接口

| 接口名称                                                                                                         | 功能描述                                                   | 参数说明                                                                                                                                            |
|--------------------------------------------------------------------------------------------------------------|--------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| `NewSessionPool(config *PoolConfig, maxSize, connTimeoutMs, waitTimeoutMs int, enableComp bool) SessionPool` | 创建并返回一个Session连接池实例。                                   | `config`: 连接池配置 <br>`maxSize`: 最大连接数(≤0时取CPU数\*5) <br>`connTimeoutMs`: TCP连接超时(ms) <br>`waitTimeoutMs`: 获取Session等待超时(ms) <br>`enableComp`: 是否启用压缩 |
| `GetSession() (Session, error)`                                                                              | 从池中获取一个可用Session。若池满则阻塞等待，超时返回错误。​**必须与PutBack配对使用**​。 | 无                                                                                                                                               |
| `PutBack(session Session)`                                                                                   | 将使用完毕的Session归还到连接池中。                                  | `session`: 从GetSession获取的实例                                                                                                                     |
| `Close()`                                                                                                    | 关闭连接池，释放所有活跃连接。程序退出前必须调用。                              | 无                                                                                                                                               |

### 3.2 数据写入接口

以下接口需通过获取的 Session 进行调用

| 接口名称                                                                                                                                                                     | 功能描述                     | 参数说明                                                                                                                                                       |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `InsertRecord(deviceId string, measurements []string, dataTypes []TSDataType, values []interface{}, timestamp int64) (r common.TSStatus, err error)`                     | 插入单条记录。| `deviceId`: 设备ID <br>`measurements`: 测点列表 <br>`dataTypes`: 数据类型列表<br>`values`: 值列表<br>`timestamp`: 时间戳 |
| `InsertAlignedRecord(deviceId string, measurements []string, dataTypes []TSDataType, values []interface{}, timestamp int64) (r common.TSStatus, err error)`              | 插入单条对齐记录。           | `deviceId`: 设备ID<br>`measurements`: 测点列表<br>`dataTypes`: 数据类型列表<br>`values`: 值列表<br>`timestamp`: 时间戳 |
| `InsertStringRecord(deviceId string, measurements []string, values []string, timestamp int64) (r common.TSStatus, err error)`                                            | 插入字符串格式的单条记录。   | `deviceId`: 设备ID<br>`measurements`: 测点列表<br>`values`: 字符串类型的值列表<br>`timestamp`: 时间戳                           |
| `InsertRecords(deviceIds []string, measurements [][]string, dataTypes [][]TSDataType, values [][]interface{}, timestamps []int64) (r common.TSStatus, err error)`        | 插入多条记录。| `deviceIds`: 设备ID列表<br>`measurements`:二维测点列表<br>`dataTypes`: 二维数据类型列表<br>`values`: 二维值列表<br>`timestamps`: 时间戳列表                |
| `InsertAlignedRecords(deviceIds []string, measurements [][]string, dataTypes [][]TSDataType, values [][]interface{}, timestamps []int64) (r common.TSStatus, err error)` | 插入多个对齐设备的多条记录。 | `deviceIds`: 设备ID列表<br>`measurements`:二维测点列表<br>`dataTypes`: 二维数据类型列表<br>`values`: 二维值列表<br>`timestamps`: 时间戳列表                |
| `InsertTablet(tablet Tablet, sorted bool) (r common.TSStatus, err error)`                                                                                                | 插入单个设备的多条数据。     | `tablet`: 要插入的`Tablet`数据<br>`sorted`: 数据是否已排序                                                                                             |
| `InsertAlignedTablet(tablet Tablet, sorted bool) (r common.TSStatus, err error)`                                                                                         | 插入单个对齐设备的多条数据。 | `tablet`: 要插入的`Tablet`数据<br>`sorted`: 数据是否已排序                                                                                             |
| `InsertTablets``(tablets []Tablet, sorted bool) (r common.TSStatus, err error)`                                                                                          | 批量插入多个 Tablet 数据。   | `tablets`: 要插入的多个`Tablet `数据<br>`sorted`: 数据是否已排序                                                                                       |
| `InsertAlignedTablets(tablets []Tablet, sorted bool) (r common.TSStatus, err error)`                                                                                     | 批量插入多个对齐设备的数据。 | `tablets`: 要插入的多个`Tablet `数据<br>`sorted`: 数据是否已排序                                                                                       |

### 3.3 SQL与查询接口

以下接口需通过获取的 Session 进行调用

| 接口名称                                                                                                                                                     | 功能描述                                  | 参数说明                                                                                                                 |
|----------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| `ExecuteStatement(sql string)`*`(`*`SessionDataSet, error)`                                                                                              | 执行SQL（主要查询），返回`SessionDataSet`。       | `sql`：要执行的SQL查询语句                                                                                                    |
| `ExecuteQueryStatement(sql string, timeoutMs int64) (SessionDataSet, error)`                                                                             | 执行查询SQL，可指定超时，返回`SessionDataSet`。     | `sql`：要执行的SQL查询语句<br>`timeoutMs`: 查询超时时间（毫秒）                                                                         |
| `ExecuteNonQueryStatementExecuteNonQueryStatement(sql string) (r common.TSStatus, err error)`                                                            | 执行不返回结果集的SQL（如INSERT, CREATE, DELETE）。 | `sql`：要执行的SQL语句                                                                                                      |
| `ExecuteRawDataQuery(paths []string, startTime int64, endTime int64) (*SessionDataSet, error)`                                                           | 查询指定时间序列在时间范围内的原始数据。                | `paths`: 查询路径列表<br>`startTime`: 起始时间戳<br>`endTime`: 结束时间戳                                                            |
| `ExecuteAggregationQuery(paths []string, aggregations []common.TAggregationType, startTime, endTime, interval, timeoutMs int64) (SessionDataSet, error)` | 执行聚合查询（COUNT, AVG等）。                  | `paths`: 查询路径列表<br>`aggregations`: 聚合类型列表<br>`startTime, endTime, interval`: 起始时间、结束时间和间隔时间<br>`timeoutMs`: 查询超时时间   |
| `ExecuteBatchStatement(sqls []string) (r common.TSStatus, err error)`                                                                                    | 批量执行多条SQL语句。                          | `sqls`：要执行的SQL语句                                                                                                     |

### 3.4 元数据操作接口

以下接口需通过获取的 Session 进行调用

| 接口名称                                                                                                                                                                                                           | 功能描述                      | 参数说明                                                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |---------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| `SetStorageGroup(storageGroupId string) (r common.TSStatus, err error)`                                                                                                                                        | 创建数据库（存储组）。               | `storageGroupId`：数据库（存储组）名称                                                                                                                         |
| `DeleteStorageGroup(storageGroupId string) (r common.TSStatus, err error)`                                                                                                                                     | 删除一个数据库（存储组）。             | `storageGroupId`：要删除的数据库（存储组）名称                                                                                                                     |
| `DeleteStorageGroups(storageGroupIds ...string) (r common.TSStatus, err error)`                                                                                                                                | 删除多个数据库（存储组）。             | `storageGroupIds`：要删除的数据库（存储组）名称列表                                                                                                                  |
| `CreateTimeseries(path string, dataType TSDataType, encoding TSEncoding, compressor TSCompressionType, attributes map[string]string, tags map[string]string) (r common.TSStatus, err error)`                   | 创建非对齐时间序列。                | `path`: 时间序列路径<br>`dataType`: 数据类型<br>`encoding`: 编码方式<br>`compressor`: 压缩算法<br>`attributes`: （可选）序列属性<br>`tags`: （可选）序列标签                          |
| `CreateAlignedTimeseries(prefixPath string, measurements []string, dataTypes []TSDataType, encodings []TSEncoding, compressors []TSCompressionType, measurementAlias []string) (r common.TSStatus, err error)` | 创建一组对齐时间序列。               | `prefixPath`: 时间序列路径前缀<br>`measurements`: 测点名称列表<br>`dataTypes, encodings, compressors`: 每个测点对应的数据类型、编码和压缩算法列表<br>`measurementAlias`: （可选）每个测点的别名列表 |
| `DeleteTimeseries(paths []string) (r common.TSStatus, err error)`                                                                                                                                              | 删除多条时间序列（含数据）。            | `paths`：要删除的时间序列路径列表                                                                                                                                |
| `DeleteData(paths []string, startTime int64, endTime int64) (r common.TSStatus, err error)`                                                                                                                    | 删除指定时间序列在时间段内的数据（保留元数据）。  | `paths`: 要删除的时间序列路径列表<br>`startTime`: 起始时间戳<br>`endTime`: 结束时间戳。                                                                                    |
| `SetTimeZone(timeZone string) (r common.TSStatus, err error)`                                                                                                                                                  | 设置当前会话时区。                 | `timeZone`: 时区字符串，例如 ”UTC”, ”Asia/Shanghai”, ”GMT+8”                                                                                                |
| `GetTimeZone() (string, error)`                                                                                                                                                                                | 获取当前会话时区。                 | 无                                                                                                                                                   |

### 3.5 关键配置结构 (PoolConfig)

| 字段            | 类型           | 必填              | 描述                                                      |
| ----------------- | ---------------- | ------------------- | ----------------------------------------------------------- |
| `Host`      | `string`   | 与NodeUrls二选一  | 单节点主机地址。                                          |
| `Port`      | `string`   | 与NodeUrls二选一  | 单节点端口。                                              |
| `NodeUrls`  | `[]string` | 与Host/Port二选一 | 集群节点地址列表，格式为`”host:port”`。             |
| `UserName`  | `string`   | 是                | 用户名。                                                  |
| `Password`  | `string`   | 是                | 密码。                                                    |
| `FetchSize` | `int32`    | 否                | 查询结果集获取大小，默认1024。                            |
| `TimeZone`  | `string`   | 否                | 会话时区，如`”Asia/Shanghai”`，默认使用服务端时区。 |
| `Database`  | `string`   | 否                | 表模型适用，用于设置会话默认数据库。                      |
