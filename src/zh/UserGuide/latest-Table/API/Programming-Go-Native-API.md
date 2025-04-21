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

## 1. 使用方法 
### 1.1 依赖

 * golang >= 1.13
 * make   >= 3.0
 * curl   >= 7.1.1
 * thrift 0.15.0
 * Linux、Macos 或其他类 unix 系统
 * Windows+bash (下载 IoTDB Go client 需要 git ，通过 WSL、cygwin、Git Bash 任意一种方式均可)

### 1.2 安装方法

 * 通过 go mod

```sh
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

* 通过 GOPATH

```sh
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

## 2. ITableSession 接口
### 2.1 功能描述

ITableSession 接口定义了与 IoTDB 交互的基本操作，可以执行数据插入、查询操作以及关闭会话等，非线程安全。

### 2.2 方法列表

以下是 ITableSession 接口中定义的方法及其详细说明：

| **方法名**                                             | **描述**                                                       | **参数**                                                            | **返回值**                                   | **返回异常**                            |
| -------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------- |
| `Insert(tablet *Tablet)`                                 | 将一个包含时间序列数据的Tablet 插入到数据库中| `tablet`: 要插入的`Tablet`| `TSStatus`：执行结果的状态，由 common 包定义。 | `errer`：操作过程中的错误（如连接失败）。 |
| `xecuteNonQueryStatement(sql string)`| 执行非查询 SQL 语句，如 DDL (数据定义语言)或 DML (数据操作语言）命令 | `sql`: 要执行的 SQL 语句。| 同上                                               | 同上|
| `ExecuteQueryStatement (sql string, timeoutInMs *int64)` | 执行查询 SQL 语句，并返回查询结果集                                  | `sql`: 要执行的查询 SQL 语句。`timeoutInMs`: 查询超时时间（毫秒） | `SessionDataSet`：查询结果数据集。             | `errer`：操作过程中的错误（如连接失败）。 |
| `Close()`                                                | 关闭会话，释放所持有的资源                                           | 无                                                                        | 无                                                 | `errer`：关闭连接过程中的错误             |

### 2.3 接口展示
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

2. 构造 TableSession

* Config 中不需要手动设置 sqlDialect，使用时只需要使用对应的 NewSession 函数

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

> 注意：
>
> 通过 *NewTableSession 或 NewClusterTableSession* 得到的 TableSession，连接已经建立，不需要额外的 open 操作。

### 2.4 示例代码

```Go
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
      Password: "root",
      Database: "test_session",
   }
   session, err := client.NewTableSession(config, false, 0)
   if err != nil {
      log.Fatal(err)
   }
   defer session.Close()

   checkError(session.ExecuteNonQueryStatement("create database test_db"))
   checkError(session.ExecuteNonQueryStatement("use test_db"))
   checkError(session.ExecuteNonQueryStatement("create table t1 (id1 string id, id2 string id, s1 text measurement, s2 text measurement)"))
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
   }, []client.ColumnCategory{client.ID, client.ID, client.MEASUREMENT, client.MEASUREMENT}, 1024)
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

## 3. TableSessionPool 接口
### 3.1 功能描述

TableSessionPool 是一个用于管理 ITableSession 实例的池。这个池可以帮助我们高效地重用连接，并且在不需要时正确地清理资源, 该接口定义了如何从池中获取会话以及如何关闭池的基本操作。

### 3.2  方法列表

| **方法名**   | **描述**                                                     | **返回值**          | **返回异常**              |
| -------------------- | -------------------------------------------------------------------- | --------------------------- | --------------------------------- |
| `GetSession()` | 从池中获取一个 ITableSession 实例，用于与 IoTDB 交互。             | `ITableSession `实例| `error`：获取失败的错误原因 |
| `Close()`      | 关闭会话池，释放任何持有的资源。关闭后，不能再从池中获取新的会话。 | 无                        | 无                              |

### 3.3 接口展示
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

2. 构造 TableSessionPool

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

> 注意：
>
> * 通过 TableSessionPool 得到的 TableSession，如果已经在创建 TableSessionPool 指定了 Database，使用时可以不再指定 Database。
> * 如果使用过程中通过 use database 指定了其他 database，在 close 放回 TableSessionPool 时会自动恢复为 TableSessionPool 所用的 database。

### 3.4 示例代码

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
      Password: "root",
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
         checkError(session.ExecuteNonQueryStatement("create table table_of_" + dbName + " (id1 string id, id2 string id, s1 text measurement, s2 text measurement)"))
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
      Password: "root",
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
         checkError(session.ExecuteNonQueryStatement("create table " + tableName + " (id1 string id, id2 string id, s1 text measurement, s2 text measurement)"))
      }()
   }
   wg.Wait()
}

func sessionPoolWithoutSpecificDatabaseExample() {
   config := &client.PoolConfig{
      Host:     "127.0.0.1",
      Port:     "6667",
      UserName: "root",
      Password: "root",
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
         checkError(session.ExecuteNonQueryStatement("create table t1 (id1 string id, id2 string id, s1 text measurement, s2 text measurement)"))
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

