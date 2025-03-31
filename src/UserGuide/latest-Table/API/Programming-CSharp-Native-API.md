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

## 1. Feature Overview

IoTDB provides a C# native client driver and corresponding connection pool, offering object-oriented interfaces that allow direct assembly of time-series objects for writing without SQL construction. It is recommended to use the connection pool for multi-threaded parallel database operations.

## 2. Usage Instructions

**Environment Requirements:**

* .NET SDK >= 5.0 or .NET Framework 4.x
* Thrift >= 0.14.1
* NLog >= 4.7.9

**Dependency Installation:**

It supports installation using tools such as NuGet Package Manager or .NET CLI. Taking .NET CLI as an example:

If using .NET 5.0 or a later version of the SDK, enter the following command to install the latest NuGet package:

```Plain
dotnet add package Apache.IoTDB
```

## 3. Read/Write Operations

### 3.1 TableSessionPool

#### 3.1.1 Functional Description

The `TableSessionPool` defines basic operations for interacting with IoTDB, supporting data insertion, query execution, and session closure. It also serves as a connection pool to efficiently reuse connections and properly release resources when unused. This interface defines how to acquire sessions from the pool and how to close the pool.

#### 3.1.2 Method List

Below are the methods defined in `TableSessionPool` with detailed descriptions:

| Method                                                         | Description                                                                    | Parameters                                                                                                | Return Type                |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------- |-----------------------------------------------------------------------------------------------------------| ---------------------------- |
| `Open(bool enableRpcCompression)`                          | Opens a session connection with custom `enableRpcCompression`              | `enableRpcCompression`: Whether to enable `RpcCompression` (requires server-side configuration alignment) | `Task`                 |
| `Open()`                                                   | Opens a session connection without enabling `RpcCompression`               | None                                                                                                      | `Task`                 |
| `InsertAsync(Tablet tablet)`                               | Inserts a `Tablet` object containing time-series data into the database    | `tablet`: The Tablet object to insert                                                                     | `Task<int>`            |
| `ExecuteNonQueryStatementAsync(string sql)`                | Executes a non-query SQL statement (e.g., DDL/DML commands)                    | `sql`: The SQL statement to execute                                                                       | `Task<int>`            |
| `ExecuteQueryStatementAsync(string sql)`                   | Executes a query SQL statement and returns a `SessionDataSet` with results | `sql`: The SQL query to execute                                                                           | `Task<SessionDataSet>` |
| `ExecuteQueryStatementAsync(string sql, long timeoutInMs)` | Executes a query SQL statement with a timeout (milliseconds)                   | `sql`: The SQL query to execute <br> `timeoutInMs`: Query timeout in milliseconds                         | `Task<SessionDataSet>` |
| `Close()`                                                  | Closes the session and releases held resources                                 | None                                                                                                      | `Task`                 |

#### 3.1.3 Interface Examples

```C#
public async Task Open(bool enableRpcCompression, CancellationToken cancellationToken = default)

  public async Task Open(CancellationToken cancellationToken = default)

  public async Task<int> InsertAsync(Tablet tablet)

  public async Task<int> ExecuteNonQueryStatementAsync(string sql)
  
  public async Task<SessionDataSet> ExecuteQueryStatementAsync(string sql)

  public async Task<SessionDataSet> ExecuteQueryStatementAsync(string sql, long timeoutInMs)
  
  public async Task Close()
```

### 3.2 TableSessionPool.Builder

#### 3.2.1 Functional Description

The `TableSessionPool.Builder` class configures and creates instances of `TableSessionPool`, allowing developers to set connection parameters, session settings, and pooling behaviors.

#### 3.2.2 Configuration Options

Below are the available configuration options for `TableSessionPool.Builder` and their defaults:

| ​**Configuration Method**            | ​**Description**                                                        | ​**Default Value** |
| --------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------- |
| `SetHost(string host)`                  | Sets the IoTDB node host                                                       | `localhost`           |
| `SetPort(int port)`                     | Sets the IoTDB node port                                                       | `6667`                |
| `SetNodeUrls(List nodeUrls)`            | Sets IoTDB cluster node URLs (overrides `SetHost`/`SetPort` when used) | Not set                   |
| `SetUsername(string username)`          | Sets the connection username                                                   | `"root"`              |
| `SetPassword(string password)`          | Sets the connection password                                                   | `"root"`              |
| `SetFetchSize(int fetchSize)`           | Sets the fetch size for query results                                          | `1024`                |
| `SetZoneId(string zoneId)`              | Sets the timezone ZoneID                                                       | `UTC+08:00`           |
| `SetPoolSize(int poolSize)`             | Sets the maximum number of sessions in the connection pool                     | `8`                   |
| `SetEnableRpcCompression(bool enable)`  | Enables/disables RPC compression                                               | `false`               |
| `SetConnectionTimeoutInMs(int timeout)` | Sets the connection timeout in milliseconds                                    | `500`                 |
| `SetDatabase(string database)`          | Sets the target database name                                                  | `""`                  |

#### 3.2.3 Interface Examples

```c#
public Builder SetHost(string host)
    {
      _host = host;
      return this;
    }

    public Builder SetPort(int port)
    {
      _port = port;
      return this;
    }

    public Builder SetUsername(string username)
    {
      _username = username;
      return this;
    }

    public Builder SetPassword(string password)
    {
      _password = password;
      return this;
    }

    public Builder SetFetchSize(int fetchSize)
    {
      _fetchSize = fetchSize;
      return this;
    }

    public Builder SetZoneId(string zoneId)
    {
      _zoneId = zoneId;
      return this;
    }

    public Builder SetPoolSize(int poolSize)
    {
      _poolSize = poolSize;
      return this;
    }

    public Builder SetEnableRpcCompression(bool enableRpcCompression)
    {
      _enableRpcCompression = enableRpcCompression;
      return this;
    }

    public Builder SetConnectionTimeoutInMs(int timeout)
    {
      _connectionTimeoutInMs = timeout;
      return this;
    }

    public Builder SetNodeUrls(List<string> nodeUrls)
    {
      _nodeUrls = nodeUrls;
      return this;
    }

    protected internal Builder SetSqlDialect(string sqlDialect)
    {
      _sqlDialect = sqlDialect;
      return this;
    }

    public Builder SetDatabase(string database)
    {
      _database = database;
      return this;
    }
    
    public Builder()
    {
      _host = "localhost";
      _port = 6667;
      _username = "root";
      _password = "root";
      _fetchSize = 1024;
      _zoneId = "UTC+08:00";
      _poolSize = 8;
      _enableRpcCompression = false;
      _connectionTimeoutInMs = 500;
      _sqlDialect = IoTDBConstant.TABLE_SQL_DIALECT;
      _database = "";
    }

    public TableSessionPool Build()
    {
      SessionPool sessionPool;
      // if nodeUrls is not empty, use nodeUrls to create session pool
      if (_nodeUrls.Count > 0)
      {
        sessionPool = new SessionPool(_nodeUrls, _username, _password, _fetchSize, _zoneId, _poolSize, _enableRpcCompression, _connectionTimeoutInMs, _sqlDialect, _database);
      }
      else
      {
        sessionPool = new SessionPool(_host, _port, _username, _password, _fetchSize, _zoneId, _poolSize, _enableRpcCompression, _connectionTimeoutInMs, _sqlDialect, _database);
      }
      return new TableSessionPool(sessionPool);
    }
```

## 4. Example

Complete example : [samples/Apache.IoTDB.Samples/TableSessionPoolTest.cs](https://github.com/apache/iotdb-client-csharp/blob/main/samples/Apache.IoTDB.Samples/TableSessionPoolTest.cs)

```c#
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Apache.IoTDB.DataStructure;

namespace Apache.IoTDB.Samples;

public class TableSessionPoolTest
{
  private readonly SessionPoolTest sessionPoolTest;

  public TableSessionPoolTest(SessionPoolTest sessionPoolTest)
  {
    this.sessionPoolTest = sessionPoolTest;
  }

  public async Task Test()
  {
    await TestCleanup();

    await TestSelectAndInsert();
    await TestUseDatabase();
    // await TestCleanup();
  }


  public async Task TestSelectAndInsert()
  {
    var tableSessionPool = new TableSessionPool.Builder()
            .SetNodeUrls(sessionPoolTest.nodeUrls)
            .SetUsername(sessionPoolTest.username)
            .SetPassword(sessionPoolTest.password)
            .SetFetchSize(1024)
            .Build();

    await tableSessionPool.Open(false);

    if (sessionPoolTest.debug) tableSessionPool.OpenDebugMode();


    await tableSessionPool.ExecuteNonQueryStatementAsync("CREATE DATABASE test1");
    await tableSessionPool.ExecuteNonQueryStatementAsync("CREATE DATABASE test2");

    await tableSessionPool.ExecuteNonQueryStatementAsync("use test2");

    // or use full qualified table name
    await tableSessionPool.ExecuteNonQueryStatementAsync(
        "create table test1.table1(region_id STRING TAG, plant_id STRING TAG, device_id STRING TAG, model STRING ATTRIBUTE, temperature FLOAT FIELD, humidity DOUBLE FIELD) with (TTL=3600000)");

    await tableSessionPool.ExecuteNonQueryStatementAsync(
        "create table table2(region_id STRING TAG, plant_id STRING TAG, color STRING ATTRIBUTE, temperature FLOAT FIELD, speed DOUBLE FIELD) with (TTL=6600000)");

    // show tables from current database
    var res = await tableSessionPool.ExecuteQueryStatementAsync("SHOW TABLES");
    res.ShowTableNames();
    while (res.HasNext()) Console.WriteLine(res.Next());
    await res.Close();

    // show tables by specifying another database
    // using SHOW tables FROM
    res = await tableSessionPool.ExecuteQueryStatementAsync("SHOW TABLES FROM test1");
    res.ShowTableNames();
    while (res.HasNext()) Console.WriteLine(res.Next());
    await res.Close();

    var tableName = "testTable1";
    List<string> columnNames =
        new List<string> {
            "region_id",
            "plant_id",
            "device_id",
            "model",
            "temperature",
            "humidity" };
    List<TSDataType> dataTypes =
        new List<TSDataType>{
            TSDataType.STRING,
            TSDataType.STRING,
            TSDataType.STRING,
            TSDataType.STRING,
            TSDataType.FLOAT,
            TSDataType.DOUBLE};
    List<ColumnCategory> columnCategories =
        new List<ColumnCategory>{
            ColumnCategory.TAG,
            ColumnCategory.TAG,
            ColumnCategory.TAG,
            ColumnCategory.ATTRIBUTE,
            ColumnCategory.FIELD,
            ColumnCategory.FIELD};
    var values = new List<List<object>> { };
    var timestamps = new List<long> { };
    for (long timestamp = 0; timestamp < 100; timestamp++)
    {
      timestamps.Add(timestamp);
      values.Add(new List<object> { "1", "5", "3", "A", 1.23F + timestamp, 111.1 + timestamp });
    }
    var tablet = new Tablet(tableName, columnNames, columnCategories, dataTypes, values, timestamps);

    await tableSessionPool.InsertAsync(tablet);


    res = await tableSessionPool.ExecuteQueryStatementAsync("select * from testTable1 "
          + "where region_id = '1' and plant_id in ('3', '5') and device_id = '3'");
    res.ShowTableNames();
    while (res.HasNext()) Console.WriteLine(res.Next());
    await res.Close();

    await tableSessionPool.Close();
  }


  public async Task TestUseDatabase()
  {
    var tableSessionPool = new TableSessionPool.Builder()
            .SetNodeUrls(sessionPoolTest.nodeUrls)
            .SetUsername(sessionPoolTest.username)
            .SetPassword(sessionPoolTest.password)
            .SetDatabase("test1")
            .SetFetchSize(1024)
            .Build();

    await tableSessionPool.Open(false);

    if (sessionPoolTest.debug) tableSessionPool.OpenDebugMode();


    // show tables from current database
    var res = await tableSessionPool.ExecuteQueryStatementAsync("SHOW TABLES");
    res.ShowTableNames();
    while (res.HasNext()) Console.WriteLine(res.Next());
    await res.Close();

    await tableSessionPool.ExecuteNonQueryStatementAsync("use test2");

    // show tables from current database
    res = await tableSessionPool.ExecuteQueryStatementAsync("SHOW TABLES");
    res.ShowTableNames();
    while (res.HasNext()) Console.WriteLine(res.Next());
    await res.Close();

    await tableSessionPool.Close();
  }

  public async Task TestCleanup()
  {
    var tableSessionPool = new TableSessionPool.Builder()
            .SetNodeUrls(sessionPoolTest.nodeUrls)
            .SetUsername(sessionPoolTest.username)
            .SetPassword(sessionPoolTest.password)
            .SetFetchSize(1024)
            .Build();

    await tableSessionPool.Open(false);

    if (sessionPoolTest.debug) tableSessionPool.OpenDebugMode();

    await tableSessionPool.ExecuteNonQueryStatementAsync("drop database test1");
    await tableSessionPool.ExecuteNonQueryStatementAsync("drop database test2");

    await tableSessionPool.Close();
  }
}
```
