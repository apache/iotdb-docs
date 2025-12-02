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

The Git repository for the Go Native API client is located [here](https://github.com/apache/iotdb-client-go/)

## 1. Usage
### 1.1 Dependencies

* golang >= 1.13
* make   >= 3.0
* curl   >= 7.1.1
* thrift 0.15.0
* Linux、Macos or other unix-like systems
* Windows+bash (WSL、cygwin、Git Bash)

### 1.2 Installation

* go mod

```sh
export GO111MODULE=on
export GOPROXY=https://goproxy.io

mkdir session_example && cd session_example

curl -o session_example.go -L https://github.com/apache/iotdb-client-go/raw/main/example/session_example.go

go mod init session_example
go run session_example.go
```

* GOPATH

```sh
# get thrift 0.15.0
go get github.com/apache/thrift
cd $GOPATH/src/github.com/apache/thrift
git checkout 0.15.0

mkdir -p $GOPATH/src/iotdb-client-go-example/session_example
cd $GOPATH/src/iotdb-client-go-example/session_example
curl -o session_example.go -L https://github.com/apache/iotdb-client-go/raw/main/example/session_example.go
go run session_example.go
```

## 2. ITableSession Interface
### 2.1 Description

Defines core operations for interacting with IoTDB tables, including data insertion, query execution, and session closure. Not thread-safe.

### 2.2 Method List

| **Method Name**                                        | **Description**                                                    | **Parameters**                                                                 | **Return Value**                                    | **Return Error**                                                                             |
| -------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `Insert(tablet *Tablet)`                                 | Inserts a`Tablet`containing time-series data into the database.| `tablet`: A pointer to a Tablet containing time-series data to be inserted.      | A pointer to TSStatus indicating the execution result.    | An error if an issue occurs during the operation, such as a connection error or execution failure. |
| `xecuteNonQueryStatement(sql string)`| Executes non-query SQL statements such as DDL or DML commands.           | `sql`: The SQL statement to execute.| A pointer to TSStatus indicating the execution result.| An error if an issue occurs during the operation, such as a connection error or execution failure. |
| `ExecuteQueryStatement (sql string, timeoutInMs *int64)` | Executes a query SQL statement with a specified timeout in milliseconds. | `sql`: The SQL query statement.`timeoutInMs`: Query timeout in milliseconds. | A pointer to SessionDataSet containing the query results. | An error if an issue occurs during the operation, such as a connection error or execution failure. |
| `Close()`                                                | Closes the session and releases resources.                               | None                                                                                 | None                                                      | An error if there is an issue with closing the IoTDB connection.                                   |

### 2.3 Interface Definition
1. ITableSession

```go
// ITableSession defines an interface for interacting with IoTDB tables.
// It supports operations such as data insertion, executing queries, and closing the session.
// Implementations of this interface are expected to manage connections and ensure
// proper resource cleanup.
//
// Each method may return an error to indicate issues such as connection errors
// or execution failures.
//
// Since this interface includes a Close method, it is recommended to use
// defer to ensure the session is properly closed.
type ITableSession interface {

        // Insert inserts a Tablet into the database.
        //
        // Parameters:
        //   - tablet: A pointer to a Tablet containing time-series data to be inserted.
        //
        // Returns:
        //   - r: A pointer to TSStatus indicating the execution result.
        //   - err: An error if an issue occurs during the operation, such as a connection error or execution failure.
        Insert(tablet *Tablet) (r *common.TSStatus, err error)

        // ExecuteNonQueryStatement executes a non-query SQL statement, such as a DDL or DML command.
        //
        // Parameters:
        //   - sql: The SQL statement to execute.
        //
        // Returns:
        //   - r: A pointer to TSStatus indicating the execution result.
        //   - err: An error if an issue occurs during the operation, such as a connection error or execution failure.
        ExecuteNonQueryStatement(sql string) (r *common.TSStatus, err error)

        // ExecuteQueryStatement executes a query SQL statement and returns the result set.
        //
        // Parameters:
        //   - sql: The SQL query statement to execute.
        //   - timeoutInMs: A pointer to the timeout duration in milliseconds for the query execution. 
        //
        // Returns:
        //   - result: A pointer to SessionDataSet containing the query results.
        //   - err: An error if an issue occurs during the operation, such as a connection error or execution failure.
        ExecuteQueryStatement(sql string, timeoutInMs *int64) (*SessionDataSet, error)

        // Close closes the session, releasing any held resources.
        //
        // Returns:
        //   - err: An error if there is an issue with closing the IoTDB connection.
        Close() (err error)
}
```

2. Constructing a TableSession

* There’s no need to manually set the `sqlDialect` field in the `Config`structs. This is automatically handled by the corresponding `NewSession` function during initialization. Simply use the appropriate constructor based on your use case (single-node or cluster).

```Go
type Config struct {
   Host            string
   Port            string
   UserName        string
   Password        string
   FetchSize       int32
   TimeZone        string
   ConnectRetryMax int
   sqlDialect      string
   Version         Version
   Database        string
}

type ClusterConfig struct {
   NodeUrls        []string //ip:port
   UserName        string
   Password        string
   FetchSize       int32
   TimeZone        string
   ConnectRetryMax int
   sqlDialect      string
   Database        string
}

// NewTableSession creates a new TableSession instance using the provided configuration.
//
// Parameters:
//   - config: The configuration for the session.
//   - enableRPCCompression: A boolean indicating whether RPC compression is enabled.
//   - connectionTimeoutInMs: The timeout in milliseconds for establishing a connection.
//
// Returns:
//   - An ITableSession instance if the session is successfully created.
//   - An error if there is an issue during session initialization.
func NewTableSession(config *Config, enableRPCCompression bool, connectionTimeoutInMs int) (ITableSession, error)

// NewClusterTableSession creates a new TableSession instance for a cluster setup.
//
// Parameters:
//   - clusterConfig: The configuration for the cluster session.
//   - enableRPCCompression: A boolean indicating whether RPC compression is enabled.
//
// Returns:
//   - An ITableSession instance if the session is successfully created.
//   - An error if there is an issue during session initialization.
func NewClusterTableSession(clusterConfig *ClusterConfig, enableRPCCompression bool) (ITableSession, error)
```

> Note:
>
> When creating a `TableSession` via `NewTableSession` or `NewClusterTableSession`, the connection is already established; no additional `Open` operation is required.

### 2.4 Example

```go
package main

import (
   "flag"
   "github.com/apache/iotdb-client-go/client"
   "github.com/apache/iotdb-client-go/common"
   "log"
   "math/rand"
   "strconv"
   "time"
)

func main() {
   flag.Parse()
   config := &client.Config{
      Host:     "127.0.0.1",
      Port:     "6667",
      UserName: "root",
      Password: "TimechoDB@2021", //before V2.0.6 it is root
      Database: "test_session",
   }
   session, err := client.NewTableSession(config, false, 0)
   if err != nil {
      log.Fatal(err)
   }
   defer session.Close()

   checkError(session.ExecuteNonQueryStatement("create database test_db"))
   checkError(session.ExecuteNonQueryStatement("use test_db"))
   checkError(session.ExecuteNonQueryStatement("create table t1 (id1 string tag, id2 string tag, s1 text field, s2 text field)"))
   insertRelationalTablet(session)
   showTables(session)
   query(session)
}

func getTextValueFromDataSet(dataSet *client.SessionDataSet, columnName string) string {
   if dataSet.IsNull(columnName) {
      return "null"
   } else {
      return dataSet.GetText(columnName)
   }
}

func insertRelationalTablet(session client.ITableSession) {
   tablet, err := client.NewRelationalTablet("t1", []*client.MeasurementSchema{
      {
         Measurement: "id1",
         DataType:    client.STRING,
      },
      {
         Measurement: "id2",
         DataType:    client.STRING,
      },
      {
         Measurement: "s1",
         DataType:    client.TEXT,
      },
      {
         Measurement: "s2",
         DataType:    client.TEXT,
      },
   }, []client.ColumnCategory{client.TAG, client.TAG, client.FIELD, client.FIELD}, 1024)
   if err != nil {
      log.Fatal("Failed to create relational tablet {}", err)
   }
   ts := time.Now().UTC().UnixNano() / 1000000
   for row := 0; row < 16; row++ {
      ts++
      tablet.SetTimestamp(ts, row)
      tablet.SetValueAt("id1_field_"+strconv.Itoa(row), 0, row)
      tablet.SetValueAt("id2_field_"+strconv.Itoa(row), 1, row)
      tablet.SetValueAt("s1_value_"+strconv.Itoa(row), 2, row)
      tablet.SetValueAt("s2_value_"+strconv.Itoa(row), 3, row)
      tablet.RowSize++
   }
   checkError(session.Insert(tablet))

   tablet.Reset()

   for row := 0; row < 16; row++ {
      ts++
      tablet.SetTimestamp(ts, row)
      tablet.SetValueAt("id1_field_1", 0, row)
      tablet.SetValueAt("id2_field_1", 1, row)
      tablet.SetValueAt("s1_value_"+strconv.Itoa(row), 2, row)
      tablet.SetValueAt("s2_value_"+strconv.Itoa(row), 3, row)

      nullValueColumn := rand.Intn(4)
      tablet.SetValueAt(nil, nullValueColumn, row)
      tablet.RowSize++
   }
   checkError(session.Insert(tablet))
}

func showTables(session client.ITableSession) {
   timeout := int64(2000)
   dataSet, err := session.ExecuteQueryStatement("show tables", &timeout)
   if err != nil {
      log.Fatal(err)
   }
   for {
      hasNext, err := dataSet.Next()
      if err != nil {
         log.Fatal(err)
      }
      if !hasNext {
         break
      }
      log.Printf("tableName is", dataSet.GetText("TableName"))
   }
}

func query(session client.ITableSession) {
   timeout := int64(2000)
   dataSet, err := session.ExecuteQueryStatement("select * from t1", &timeout)
   if err != nil {
      log.Fatal(err)
   }
   for {
      hasNext, err := dataSet.Next()
      if err != nil {
         log.Fatal(err)
      }
      if !hasNext {
         break
      }
      log.Printf("%v %v %v %v", getTextValueFromDataSet(dataSet, "id1"), getTextValueFromDataSet(dataSet, "id2"), getTextValueFromDataSet(dataSet, "s1"), getTextValueFromDataSet(dataSet, "s2"))
   }
}

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

## 3. TableSessionPool  Interface
### 3.1 Description

Manages a pool of `ITableSession` instances for efficient connection reuse and resource cleanup.

### 3.2 Method List

| **Method Name** | **Description**                                      | **Return Value**                                      | **Return Error**                    |
| ----------------------- | ------------------------------------------------------------ | ------------------------------------------------------------- | ------------------------------------------- |
| `GetSession()`    | Acquires a session from the pool for database interaction. | A usable ITableSession instance for interacting with IoTDB. | An error if a session cannot be acquired. |
| `Close()`         | Closes the session pool and releases resources.。          | None                                                        | None                                      |

### 3.3 Interface Definition
1. TableSessionPool

```Go
// TableSessionPool manages a pool of ITableSession instances, enabling efficient
// reuse and management of resources. It provides methods to acquire a session
// from the pool and to close the pool, releasing all held resources.
//
// This implementation ensures proper lifecycle management of sessions,
// including efficient reuse and cleanup of resources.

// GetSession acquires an ITableSession instance from the pool.
//
// Returns:
//   - A usable ITableSession instance for interacting with IoTDB.
//   - An error if a session cannot be acquired.
func (spool *TableSessionPool) GetSession() (ITableSession, error) {
        return spool.sessionPool.getTableSession()
}

// Close closes the TableSessionPool, releasing all held resources.
// Once closed, no further sessions can be acquired from the pool.
func (spool *TableSessionPool) Close()
```

2. Constructing a TableSessionPool

```Go
type PoolConfig struct {
   Host            string
   Port            string
   NodeUrls        []string
   UserName        string
   Password        string
   FetchSize       int32
   TimeZone        string
   ConnectRetryMax int
   Database        string
   sqlDialect      string
}

// NewTableSessionPool creates a new TableSessionPool with the specified configuration.
//
// Parameters:
//   - conf: PoolConfig defining the configuration for the pool.
//   - maxSize: The maximum number of sessions the pool can hold.
//   - connectionTimeoutInMs: Timeout for establishing a connection in milliseconds.
//   - waitToGetSessionTimeoutInMs: Timeout for waiting to acquire a session in milliseconds.
//   - enableCompression: A boolean indicating whether to enable compression.
//
// Returns:
//   - A TableSessionPool instance.
func NewTableSessionPool(conf *PoolConfig, maxSize, connectionTimeoutInMs, waitToGetSessionTimeoutInMs int,
        enableCompression bool) TableSessionPool
```

> Note:
>
> * If a `Database` is specified when creating the `TableSessionPool`, all sessions acquired from the pool will automatically use this database. There is no need to explicitly set the database during operations.
> * Automatic State Reset: If a session temporarily switches to another database using `USE DATABASE` during usage, the session will automatically revert to the original database specified in the pool when closed and returned to the pool.

### 3.4 Example

```go
package main

import (
   "github.com/apache/iotdb-client-go/client"
   "github.com/apache/iotdb-client-go/common"
   "log"
   "strconv"
   "sync"
   "sync/atomic"
   "time"
)

func main() {
   sessionPoolWithSpecificDatabaseExample()
   sessionPoolWithoutSpecificDatabaseExample()
   putBackToSessionPoolExample()
}

func putBackToSessionPoolExample() {
   // should create database test_db before executing
   config := &client.PoolConfig{
      Host:     "127.0.0.1",
      Port:     "6667",
      UserName: "root",
      Password: "TimechoDB@2021", //before V2.0.6 it is root
      Database: "test_db",
   }
   sessionPool := client.NewTableSessionPool(config, 3, 60000, 4000, false)
   defer sessionPool.Close()

   num := 4
   successGetSessionNum := int32(0)
   var wg sync.WaitGroup
   wg.Add(num)
   for i := 0; i < num; i++ {
      dbName := "db" + strconv.Itoa(i)
      go func() {
         defer wg.Done()
         session, err := sessionPool.GetSession()
         if err != nil {
            log.Println("Failed to create database "+dbName+"because ", err)
            return
         }
         atomic.AddInt32(&successGetSessionNum, 1)
         defer func() {
            time.Sleep(6 * time.Second)
            // put back to session pool
            session.Close()
         }()
         checkError(session.ExecuteNonQueryStatement("create database " + dbName))
         checkError(session.ExecuteNonQueryStatement("use " + dbName))
         checkError(session.ExecuteNonQueryStatement("create table table_of_" + dbName + " (id1 string tag, id2 string tag, s1 text field, s2 text field)"))
      }()
   }
   wg.Wait()
   log.Println("success num is", successGetSessionNum)

   log.Println("All session's database have been reset.")
   // the using database will automatically reset to session pool's database after the session closed
   wg.Add(5)
   for i := 0; i < 5; i++ {
      go func() {
         defer wg.Done()
         session, err := sessionPool.GetSession()
         if err != nil {
            log.Println("Failed to get session because ", err)
         }
         defer session.Close()
         timeout := int64(3000)
         dataSet, err := session.ExecuteQueryStatement("show tables", &timeout)
         for {
            hasNext, err := dataSet.Next()
            if err != nil {
               log.Fatal(err)
            }
            if !hasNext {
               break
            }
            log.Println("table is", dataSet.GetText("TableName"))
         }
      }()
   }
   wg.Wait()
}

func sessionPoolWithSpecificDatabaseExample() {
   // should create database test_db before executing
   config := &client.PoolConfig{
      Host:     "127.0.0.1",
      Port:     "6667",
      UserName: "root",
      Password: "TimechoDB@2021", //before V2.0.6 it is root
      Database: "test_db",
   }
   sessionPool := client.NewTableSessionPool(config, 3, 60000, 8000, false)
   defer sessionPool.Close()
   num := 10
   var wg sync.WaitGroup
   wg.Add(num)
   for i := 0; i < num; i++ {
      tableName := "t" + strconv.Itoa(i)
      go func() {
         defer wg.Done()
         session, err := sessionPool.GetSession()
         if err != nil {
            log.Println("Failed to create table "+tableName+"because ", err)
            return
         }
         defer session.Close()
         checkError(session.ExecuteNonQueryStatement("create table " + tableName + " (id1 string tag, id2 string tag, s1 text field, s2 text field)"))
      }()
   }
   wg.Wait()
}

func sessionPoolWithoutSpecificDatabaseExample() {
   config := &client.PoolConfig{
      Host:     "127.0.0.1",
      Port:     "6667",
      UserName: "root",
      Password: "TimechoDB@2021", //before V2.0.6 it is root
   }
   sessionPool := client.NewTableSessionPool(config, 3, 60000, 8000, false)
   defer sessionPool.Close()
   num := 10
   var wg sync.WaitGroup
   wg.Add(num)
   for i := 0; i < num; i++ {
      dbName := "db" + strconv.Itoa(i)
      go func() {
         defer wg.Done()
         session, err := sessionPool.GetSession()
         if err != nil {
            log.Println("Failed to create database ", dbName, err)
            return
         }
         defer session.Close()
         checkError(session.ExecuteNonQueryStatement("create database " + dbName))
         checkError(session.ExecuteNonQueryStatement("use " + dbName))
         checkError(session.ExecuteNonQueryStatement("create table t1 (id1 string tag, id2 string tag, s1 text field, s2 text field)"))
      }()
   }
   wg.Wait()
}

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

