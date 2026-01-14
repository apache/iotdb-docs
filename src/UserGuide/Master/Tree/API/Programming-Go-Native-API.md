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

# Go Native API

The Go Native API supports interaction with the database through both `Session` and `SessionPool` methods. Since `Session` is not thread-safe, using `SessionPool` is strongly recommended for programming. In multi-threaded concurrent scenarios, `SessionPool` can reasonably manage and allocate connection resources to enhance system performance and resource utilization efficiency.

This article focuses on the usage of `SessionPool`, covering the complete process from environment preparation and core operation steps to the full set of interfaces.

## 1. Environment Preparation

### 1.1 Prerequisites

- golang >= 1.13
- make >= 3.0
- curl >= 7.1.1
- thrift: 0.15.0
- Linux, MacOS, or other Unix-like systems
- Windows + bash (Git is needed to download the IoTDB Go client; any one of WSL, cygwin, or Git Bash is acceptable)

### 1.2 Installation Methods

- **Using go mod**

  ```bash
  # Switch to the HOME path of GOPATH and enable the Go Modules feature
  export GO111MODULE=on
  
  # Configure the GOPROXY environment variable
  export GOPROXY=https://goproxy.io
  
  # Create a named folder or directory and switch to it
  mkdir session_example && cd session_example
  
  # Save the file, which will automatically redirect to the new address
  curl -o session_example.go -L https://github.com/apache/iotdb-client-go/raw/main/example/session_example.go
  
  # Initialize the go module environment
  go mod init session_example
  
  # Download dependency packages
  go mod tidy
  
  # Compile and run the program
  go run session_example.go
  ```
- **Using GOPATH**

  ```bash
  # Get thrift 0.13.0
  go get github.com/apache/thrift@0.13.0
  
  # Recursively create the directory
  mkdir -p $GOPATH/src/iotdb-client-go-example/session_example
  
  # Switch to the current directory
  cd $GOPATH/src/iotdb-client-go-example/session_example
  
  # Save the file, which will automatically redirect to the new address
  curl -o session_example.go -L https://github.com/apache/iotdb-client-go/raw/main/example/session_example.go
  
  # Initialize the go module environment
  go mod init
  
  # Download dependency packages
  go mod tidy
  
  # Compile and run the program
  go run session_example.go
  ```

## 2. Core Steps

The three core steps for using the Go native interface to operate IoTDB are as follows:

1. **Create a connection pool instance**: Initialize a `SessionPool` object, configuring connection parameters and pool size.
2. **Execute database operations**: `GetSession()` from the pool, perform operations like data writing or querying, and **must** `PutBack(session)` upon completion.
3. **Close connection pool resources**: Call `sessionPool.Close()` at the end of the program to release all connections.

The following sections illustrate the core development workflow and do not demonstrate all parameters and interfaces. For the complete functionality and parameters, please refer to: **[Full Interface Description](../API/Programming-Go-Native-API.md#_3-full-interface-list)** or check: **[SessionPool Example Source Code](https://github.com/apache/iotdb-client-go/blob/main/example/session_pool/session_pool_example.go)**

### 2.1 Create Connection Pool Instance

- **Single Instance**

  ```go
  config := &client.PoolConfig{
      Host:     host,
      Port:     port,
      UserName: user,
      Password: password,
  }
  sessionPool = client.NewSessionPool(config, 3, 60000, 60000, false)
  defer sessionPool.Close()
  ```
- **Distributed or Active-Active**

  ```go
  config := &client.PoolConfig{
      UserName: user,
      Password: password,
      NodeUrls: strings.Split("127.0.0.1:6667,127.0.0.1:6668", ","),
  }
  sessionPool = client.NewSessionPool(config, 3, 60000, 60000, false)
  defer sessionPool.Close()
  ```

### 2.2 Database Operations

#### 2.2.1 Data Insertion

```go
session, err := sessionPool.GetSession()
defer sessionPool.PutBack(session)
status, err := session.InsertTablet(tablet, false)
tablet.Reset()
checkError(status, err)
```

#### 2.2.2 Data Query

```go
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

### 2.3 Usage Example

```go
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

    // 1. Create connection pool
    config := &client.PoolConfig{
        Host:     host,
        Port:     port,
        UserName: user,
        Password: password,
    }
    sessionPool = client.NewSessionPool(config, 3, 60000, 60000, false)

    defer sessionPool.Close()

    // 2. Create storage group
    setStorageGroup("root.sg1")

    // 3. Create time series
    createTimeseries("root.sg1.dev1.temperature")

    // 4. Data insertion
    insertTablet()

    // 5. Data query
    executeQueryStatement("select temperature from root.sg1.dev1")

    // 6. Deletion
    deleteTimeseries("root.sg1.dev1.temperature")
    deleteStorageGroup("root.sg1")

}

// Set storage group
func setStorageGroup(sg string) {
    session, err := sessionPool.GetSession()
    defer sessionPool.PutBack(session)
    if err == nil {
        session.SetStorageGroup(sg)
    }
}

// Delete storage group
func deleteStorageGroup(sg string) {
    session, err := sessionPool.GetSession()
    defer sessionPool.PutBack(session)
    if err == nil {
        checkError(session.DeleteStorageGroup(sg))
    }
}

// Create time series
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

// Delete time series
func deleteTimeseries(paths ...string) {
    session, err := sessionPool.GetSession()
    defer sessionPool.PutBack(session)
    if err == nil {
        checkError(session.DeleteTimeseries(paths))
    }
}

// Insert Tablet data
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

// Create Tablet
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

// Execute query statement
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

// Print query results
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

// Check error
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

## 3. Full Interface List

### 3.1 SessionPool Management Interfaces

| Interface Name                                                                                               | Function Description                                                                                                          | Parameter Description                                                                                                                                                                                                                            |
|:-------------------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------------------------------------------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `NewSessionPool(config *PoolConfig, maxSize, connTimeoutMs, waitTimeoutMs int, enableComp bool) SessionPool` | Creates and returns a Session connection pool instance.                                                                       | `config`: Pool configuration<br> `maxSize`: Maximum connections (≤0 uses CPU count * 5)<br>`connTimeoutMs`: TCP connection timeout (ms)<br>`waitTimeoutMs`: Session acquisition wait timeout (ms)<br>`enableComp`: Whether to enable compression |
| `GetSession() (Session, error)`                                                                              | Gets an available Session from the pool. Blocks if the pool is full, returns error on timeout. Must be paired with `PutBack`. | None                                                                                                                                                                                                                                            |
| `PutBack(session Session)`                                                                                   | Returns a used Session back to the connection pool.                                                                           | `session`: The instance obtained from `GetSession`                                                                                                                                                                                               |
| `Close()`                                                                                                    | Closes the connection pool, releasing all active connections. Must be called before program exit.                             | None                                                                                                                                                                                                                                             |

### 3.2 Data Insertion Interfaces

*The following interfaces are called via the obtained Session.*

| Interface Name                                                                                                                                                           | Function Description                                       | Parameter Description                                                                                                                                           |
|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:-----------------------------------------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `InsertRecord(deviceId string, measurements []string, dataTypes []TSDataType, values []interface{}, timestamp int64) (r common.TSStatus, err error)`                     | Inserts a single record.                                   | `deviceId`: Device ID <br>`measurements`: Measurement list<br>`dataTypes`: Data type list<br>`values`: Value list<br>`timestamp`: Timestamp                     |
| `InsertAlignedRecord(deviceId string, measurements []string, dataTypes []TSDataType, values []interface{}, timestamp int64) (r common.TSStatus, err error)`              | Inserts a single aligned record.                           | `deviceId`: Device ID<br>`measurements`: Measurement list<br>`dataTypes`: Data type list<br>`values`: Value list<br>`timestamp`: Timestamp                      |
| `InsertStringRecord(deviceId string, measurements []string, values []string, timestamp int64) (r common.TSStatus, err error)`                                            | Inserts a single record in string format.                  | `deviceId`: Device ID<br>`measurements`: Measurement list<br>`values`: String-type value list<br>`timestamp`: Timestamp                                         |
| `InsertRecords(deviceIds []string, measurements [][]string, dataTypes [][]TSDataType, values [][]interface{}, timestamps []int64) (r common.TSStatus, err error)`        | Inserts multiple records for multiple devices.             | `deviceIds`: Device ID list<br>`measurements`: 2D measurement list<br>`dataTypes`: 2D data type list<br>`values`: 2D value list<br>`timestamps`: Timestamp list |
| `InsertAlignedRecords(deviceIds []string, measurements [][]string, dataTypes [][]TSDataType, values [][]interface{}, timestamps []int64) (r common.TSStatus, err error)` | Inserts multiple records for multiple aligned devices.     | `deviceIds`: Device ID list<br>`measurements`: 2D measurement list<br>`dataTypes`: 2D data type list<br>`values`: 2D value list<br>`timestamps`: Timestamp list |
| `InsertTablet(tablet Tablet, sorted bool) (r common.TSStatus, err error)`                                                                                                | Inserts multiple rows of data for a single device.         | `tablet`: The Tablet data to insert<br>`sorted`: Whether the data is sorted                                                                                     |
| `InsertAlignedTablet(tablet Tablet, sorted bool) (r common.TSStatus, err error)`                                                                                         | Inserts multiple rows of data for a single aligned device. | `tablet`: The Tablet data to insert<br>`sorted`: Whether the data is sorted                                                                                    |
| `InsertTablets(tablets []Tablet, sorted bool) (r common.TSStatus, err error)`                                                                                            | Batch inserts multiple Tablet data.                        | `tablets`: Multiple Tablet data to insert<br>`sorted`: Whether the data is sorted                                                                               |
| `InsertAlignedTablets(tablets []Tablet, sorted bool) (r common.TSStatus, err error)`                                                                                     | Batch inserts multiple aligned devices' data.              | `tablets`: Multiple Tablet data to insert<br>`sorted`: Whether the data is sorted                                                                               |

### 3.3 SQL and Query Interfaces

*The following interfaces are called via the obtained Session.*

| Interface Name                                                                                                                                           | Function Description                                                           | Parameter Description                                                                                                                                                      |
|:---------------------------------------------------------------------------------------------------------------------------------------------------------|:-------------------------------------------------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `ExecuteStatement(sql string)(SessionDataSet, error)`                                                                                                    | Executes SQL (primarily for queries), returns a SessionDataSet.                | `sql`: The SQL query statement to execute                                                                                                                                  |
| `ExecuteQueryStatement(sql string, timeoutMs *int64) (SessionDataSet, error)`                                                                            | Executes a query SQL with optional timeout, returns a SessionDataSet.          | `sql`: The SQL query statement to execute <br> `timeoutMs`: Query timeout time (milliseconds)                                                                              |
| `ExecuteNonQueryStatement(sql string) (r common.TSStatus, err error)`                                                                                    | Executes SQL that does not return a result set (e.g., INSERT, CREATE, DELETE). | `sql`: The SQL statement to execute                                                                                                                                        |
| `ExecuteRawDataQuery(paths []string, startTime int64, endTime int64) (*SessionDataSet, error)`                                                           | Queries raw data for specified time series within a time range.                | `paths`: Query path list <br>`startTime`: Start timestamp<br>`endTime`: End timestamp                                                                                      |
| `ExecuteAggregationQuery(paths []string, aggregations []common.TAggregationType, startTime, endTime, interval, timeoutMs int64) (SessionDataSet, error)` | Executes an aggregation query (COUNT, AVG, etc.).                              | `paths`: Query path list<br>`aggregations`: Aggregation type list<br>`startTime, endTime, interval`: Start time, end time, and interval<br>`timeoutMs`: Query timeout time |
| `ExecuteBatchStatement(sqls []string) (r common.TSStatus, err error)`                                                                                    | Executes multiple SQL statements in batch.                                     | `sqls`: The SQL statements to execute                                                                                                                                     |

### 3.4 Metadata Operation Interfaces

*The following interfaces are called via the obtained Session.*

| Interface Name                                                                                                                                                                                                 | Function Description                                                                 | Parameter Description                                                                                                                                                                                                                                   |
|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:-------------------------------------------------------------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `SetStorageGroup(storageGroupId string) (r common.TSStatus, err error)`                                                                                                                                        | Creates a database (storage group).                                                  | `storageGroupId`: Database (storage group) name                                                                                                                                                                                                         |
| `DeleteStorageGroup(storageGroupId string) (r common.TSStatus, err error)`                                                                                                                                     | Deletes a database (storage group).                                                  | `storageGroupId`: The database (storage group) name to delete                                                                                                                                                                                           |
| `DeleteStorageGroups(storageGroupIds ...string) (r common.TSStatus, err error)`                                                                                                                                | Deletes multiple databases (storage groups).                                         | `storageGroupIds`: The list of database (storage group) names to delete                                                                                                                                                                                 |
| `CreateTimeseries(path string, dataType TSDataType, encoding TSEncoding, compressor TSCompressionType, attributes map[string]string, tags map[string]string) (r common.TSStatus, err error)`                   | Creates a non-aligned time series.                                                   | `path`: Time series path<br>`dataType`: Data type<br>`encoding`: Encoding method<br>`compressor`: Compression algorithm<br>`attributes`: (Optional) Series attributes<br>`tags`: (Optional) Series tags                                                 |
| `CreateAlignedTimeseries(prefixPath string, measurements []string, dataTypes []TSDataType, encodings []TSEncoding, compressors []TSCompressionType, measurementAlias []string) (r common.TSStatus, err error)` | Creates a group of aligned time series.                                              | `prefixPath`: Time series path prefix <br>`measurements`: Measurement name list<br>`dataTypes, encodings, compressors`: Data type, encoding, and compressor list for each measurement<br>`measurementAlias`: (Optional) Alias list for each measurement |
| `DeleteTimeseries(paths []string) (r common.TSStatus, err error)`                                                                                                                                              | Deletes multiple time series (including their data).                                 | `paths`: The list of time series paths to delete                                                                                                                                                                                                        |
| `DeleteData(paths []string, startTime int64, endTime int64) (r common.TSStatus, err error)`                                                                                                                    | Deletes data within a time period for specified time series (metadata is preserved). | `paths`: The list of time series paths<br>`startTime`: Start timestamp<br>`endTime`: End timestamp                                                                                                                                                      |
| `SetTimeZone(timeZone string) (r common.TSStatus, err error)`                                                                                                                                                  | Sets the time zone for the current session.                                          | `timeZone`: Time zone string, e.g., "UTC", "Asia/Shanghai", "GMT+8"                                                                                                                                                                                     |
| `GetTimeZone() (string, error)`                                                                                                                                                                                | Gets the time zone of the current session.                                           | None                                                                                                                                                                                                                                                   |

### 3.5 Key Configuration Structure (PoolConfig)

| Field       | Type       | Required                      | Description                                                              |
|:------------|:-----------|:------------------------------|:-------------------------------------------------------------------------|
| `Host`      | `string`   | Choose one with `NodeUrls`    | Single-node host address.                                                |
| `Port`      | `string`   | Choose one with `NodeUrls`    | Single-node port.                                                        |
| `NodeUrls`  | `[]string` | Choose one with `Host`/`Port` | Cluster node address list, format: `"host:port"`.                        |
| `UserName`  | `string`   | Yes                           | Username.                                                               |
| `Password`  | `string`   | Yes                           | Password.                                                                |
| `FetchSize` | `int32`    | No                            | Query result set fetch size, default 1024.                               |
| `TimeZone`  | `string`   | No                            | Session time zone, e.g., "Asia/Shanghai". Default uses server time zone. |
| `Database`  | `string`   | No                            | For table model; used to set the session's default database.             |
