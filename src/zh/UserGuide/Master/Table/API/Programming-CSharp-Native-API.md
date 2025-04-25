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

## 1. 功能介绍

IoTDB具备C#原生客户端驱动和对应的连接池，提供对象化接口，可以直接组装时序对象进行写入，无需拼装 SQL。推荐使用连接池，多线程并行操作数据库。

## 2. 使用方式

**环境要求：**

* .NET SDK >= 5.0 或 .NET Framework 4.x
* Thrift >= 0.14.1
* NLog >= 4.7.9

**依赖安装：**

支持使用 NuGet Package Manager, .NET CLI等工具来安装，以 .NET CLI为例

如果使用的是\\.NET 5.0 或者更高版本的SDK，输入如下命令即可安装最新的NuGet包

```Plain
dotnet add package Apache.IoTDB
```

## 3. 读写操作

### 3.1 TableSessionPool

#### 3.1.1 功能描述

TableSessionPool 定义了与IoTDB交互的基本操作，可以执行数据插入、查询操作以及关闭会话等，同时也是一个连接池这个池可以帮助我们高效地重用连接，并且在不需要时正确地清理资源, 该接口定义了如何从池中获取会话以及如何关闭池的基本操作。

#### 3.1.2 方法列表

以下是 TableSessionPool 中定义的方法及其详细说明：

| 方法                                                           | 描述                                                           | 参数                                                                | 返回值                |
| ---------------------------------------------------------------- | ---------------------------------------------------------------- |-------------------------------------------------------------------|--------------------|
| `Open(bool enableRpcCompression)`                          | 打开会话连接，自定义`enableRpcCompression`                 | `enableRpcCompression`：是否启用`RpcCompression`，此参数需配合 Server 端配置一同使用 | `Task`               |
| `Open()`                                                   | 打开会话连接，不开启`RpcCompression`                       | 无                                                                 | `Task`               |
| `InsertAsync(Tablet tablet)`                               | 将一个包含时间序列数据的Tablet 对象插入到数据库中              | tablet: 要插入的Tablet对象                                              | `Task<int>`         |
| `ExecuteNonQueryStatementAsync(string sql)`                | 执行非查询SQL语句，如DDL(数据定义语言)或DML(数据操作语言）命令 | sql: 要执行的SQL语句。                                                   | `Task<int>`         |
| `ExecuteQueryStatementAsync(string sql)`                   | 执行查询SQL语句，并返回包含查询结果的SessionDataSet对象        | sql: 要执行的SQL语句。                                                   | `Task<SessionDataSet>` |
| `ExecuteQueryStatementAsync(string sql, long timeoutInMs)` | 执行查询SQL语句，并设置查询超时时间（以毫秒为单位）            | sql: 要执行的查询SQL语句。<br>timeoutInMs: 查询超时时间（毫秒）                      | `Task<SessionDataSet>`               |
| `Close()`                                                  | 关闭会话，释放所持有的资源                                     | 无                                                                 | `Task`               |

#### 3.1.3 接口展示

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

#### 3.2.1 功能描述

TableSessionPool.Builder 是 TableSessionPool的构造器，用于配置和创建 TableSessionPool 的实例。允许开发者配置连接参数、会话参数和池化行为等。

#### 3.2.2 配置选项

以下是 TableSessionPool.Builder 类的可用配置选项及其默认值：

| **配置项**                                   | **描述**                                                 | **默认值** |
| ---------------------------------------------------- | ---------------------------------------------------------------- | ------------------ |
| `SetHost(string host)`                               | 设置IoTDB的节点 host                                           | `localhost`        |
| `SetPort(int port)`                                  | 设置IoTDB的节点端口                                            | `6667`             |
| `SetNodeUrls(List nodeUrls)`                 | 设置IoTDB集群的节点URL列表，当设置此项时会忽略SetHost和SetPort | `无 `              |
| `SetUsername(string username)`                       | 设置连接的用户名                                               | `"root"`           |
| `SetPassword(string password)`                       | 设置连接的密码                                                 | `"root" `          |
| `SetFetchSize(int fetchSize)`                        | 设置查询结果的获取大小                                         | `1024 `            |
| `SetZoneId(string zoneId)`                           | 设置时区相关的ZoneId                                           | `UTC+08:00`        |
| `SetPoolSize(int poolSize)`                          | 设置会话池的最大大小，即池中允许的最大会话数                   | `8 `               |
| `SetEnableRpcCompression(bool enableRpcCompression)` | 是否启用RPC压缩                                                | `false`            |
| `SetConnectionTimeoutInMs(int timeout)`              | 设置连接超时时间（毫秒）                                       | `500`              |
| `SetDatabase(string database)`                       | 设置目标数据库名称                                             |` "" `              |

#### 3.2.3 接口展示

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

## 4. 示例代码

完整示例：[samples/Apache.IoTDB.Samples/TableSessionPoolTest.cs](https://github.com/apache/iotdb-client-csharp/blob/main/samples/Apache.IoTDB.Samples/TableSessionPoolTest.cs)

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
