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

# Java原生接口 

## 1. 功能介绍

IoTDB具备Java原生客户端驱动和对应的连接池，提供对象化接口，可以直接组装时序对象进行写入，无需拼装 SQL。推荐使用连接池，多线程并行操作数据库。

## 2. 使用方式

**环境要求:**

- JDK >= 1.8
- Maven >= 3.6

**在maven中添加依赖:**

```XML
<dependencies>
    <dependency>
      <groupId>org.apache.iotdb</groupId>
      <artifactId>iotdb-session</artifactId>
      <version>2.0.1-beta</version>
    </dependency>
</dependencies>
```

## 3. 读写操作

### 3.1 ITableSession接口

#### 3.1.1 功能描述

ITableSession接口定义了与IoTDB交互的基本操作，可以执行数据插入、查询操作以及关闭会话等，非线程安全。

#### 3.1.2 方法列表

以下是ITableSession接口中定义的方法及其详细说明：

| **方法名**                                          | **描述**                                                     | **参数**                                                    | **返回值**     | **返回异常**                                        |
| --------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- | -------------- | --------------------------------------------------- |
| insert(Tablet tablet)                               | 将一个包含时间序列数据的Tablet 对象插入到数据库中            | tablet: 要插入的Tablet对象                                  | 无             | StatementExecutionExceptionIoTDBConnectionException |
| executeNonQueryStatement(String sql)                | 执行非查询SQL语句，如DDL(数据定义语言)或DML(数据操作语言）命令 | sql: 要执行的SQL语句。                                      | 无             | StatementExecutionExceptionIoTDBConnectionException |
| executeQueryStatement(String sql)                   | 执行查询SQL语句，并返回包含查询结果的SessionDataSet对象      | sql: 要执行的查询SQL语句。                                  | SessionDataSet | StatementExecutionExceptionIoTDBConnectionException |
| executeQueryStatement(String sql, long timeoutInMs) | 执行查询SQL语句，并设置查询超时时间（以毫秒为单位）          | sql: 要执行的查询SQL语句。timeoutInMs: 查询超时时间（毫秒） | SessionDataSet | StatementExecutionException                         |
| close()                                             | 关闭会话，释放所持有的资源                                   | 无                                                          | 无             | IoTDBConnectionException                            |

#### 3.1.2 接口展示

``` java
/**
 * This interface defines a session for interacting with IoTDB tables.
 * It supports operations such as data insertion, executing queries, and closing the session.
 * Implementations of this interface are expected to manage connections and ensure
 * proper resource cleanup.
 *
 * <p>Each method may throw exceptions to indicate issues such as connection errors or
 * execution failures.
 *
 * <p>Since this interface extends {@link AutoCloseable}, it is recommended to use
 * try-with-resources to ensure the session is properly closed.
 */
public interface ITableSession extends AutoCloseable {

  /**
   * Inserts a {@link Tablet} into the database.
   *
   * @param tablet the tablet containing time-series data to be inserted.
   * @throws StatementExecutionException if an error occurs while executing the statement.
   * @throws IoTDBConnectionException    if there is an issue with the IoTDB connection.
   */
  void insert(Tablet tablet) throws StatementExecutionException, IoTDBConnectionException;

  /**
   * Executes a non-query SQL statement, such as a DDL or DML command.
   *
   * @param sql the SQL statement to execute.
   * @throws IoTDBConnectionException    if there is an issue with the IoTDB connection.
   * @throws StatementExecutionException if an error occurs while executing the statement.
   */
  void executeNonQueryStatement(String sql) throws IoTDBConnectionException, StatementExecutionException;

  /**
   * Executes a query SQL statement and returns the result set.
   *
   * @param sql the SQL query statement to execute.
   * @return a {@link SessionDataSet} containing the query results.
   * @throws StatementExecutionException if an error occurs while executing the statement.
   * @throws IoTDBConnectionException    if there is an issue with the IoTDB connection.
   */
  SessionDataSet executeQueryStatement(String sql)
      throws StatementExecutionException, IoTDBConnectionException;

  /**
   * Executes a query SQL statement with a specified timeout and returns the result set.
   *
   * @param sql         the SQL query statement to execute.
   * @param timeoutInMs the timeout duration in milliseconds for the query execution.
   * @return a {@link SessionDataSet} containing the query results.
   * @throws StatementExecutionException if an error occurs while executing the statement.
   * @throws IoTDBConnectionException    if there is an issue with the IoTDB connection.
   */
  SessionDataSet executeQueryStatement(String sql, long timeoutInMs)
      throws StatementExecutionException, IoTDBConnectionException;

  /**
   * Closes the session, releasing any held resources.
   *
   * @throws IoTDBConnectionException if there is an issue with closing the IoTDB connection.
   */
  @Override
  void close() throws IoTDBConnectionException;
}
```

### 3.2 TableSessionBuilder类

#### 3.2.1 功能描述

TableSessionBuilder类是一个构建器，用于配置和创建ITableSession接口的实例。它允许开发者设置连接参数、查询参数和安全特性等。

#### 3.2.2 配置选项

以下是TableSessionBuilder类中可用的配置选项及其默认值：

| **配置项**                                           | **描述**                                 | **默认值**                                  |
| ---------------------------------------------------- | ---------------------------------------- | ------------------------------------------- |
| nodeUrls(List`<String>` nodeUrls)                      | 设置IoTDB集群的节点URL列表               | Collections.singletonList("localhost:6667") |
| username(String username)                            | 设置连接的用户名                         | "root"                                      |
| password(String password)                            | 设置连接的密码                           | "root"                                      |
| database(String database)                            | 设置目标数据库名称                       | null                                        |
| queryTimeoutInMs(long queryTimeoutInMs)              | 设置查询超时时间（毫秒）                 | 60000（1分钟）                              |
| fetchSize(int fetchSize)                             | 设置查询结果的获取大小                   | 5000                                        |
| zoneId(ZoneId zoneId)                                | 设置时区相关的ZoneId                     | ZoneId.systemDefault()                      |
| thriftDefaultBufferSize(int thriftDefaultBufferSize) | 设置Thrift客户端的默认缓冲区大小（字节） | 1024（1KB）                                 |
| thriftMaxFrameSize(int thriftMaxFrameSize)           | 设置Thrift客户端的最大帧大小（字节）     | 64 * 1024 * 1024（64MB）                    |
| enableRedirection(boolean enableRedirection)         | 是否启用集群节点的重定向                 | true                                        |
| enableAutoFetch(boolean enableAutoFetch)             | 是否启用自动获取可用DataNodes            | true                                        |
| maxRetryCount(int maxRetryCount)                     | 设置连接尝试的最大重试次数               | 60                                          |
| retryIntervalInMs(long retryIntervalInMs)            | 设置重试间隔时间（毫秒）                 | 500                                         |
| useSSL(boolean useSSL)                               | 是否启用SSL安全连接                      | false                                       |
| trustStore(String keyStore)                          | 设置SSL连接的信任库路径                  | null                                        |
| trustStorePwd(String keyStorePwd)                    | 设置SSL连接的信任库密码                  | null                                        |
| enableCompression(boolean enableCompression)         | 是否启用RPC压缩                          | false                                       |
| connectionTimeoutInMs(int connectionTimeoutInMs)     | 设置连接超时时间（毫秒）                 | 0（无超时）                                 |

#### 3.2.3 接口展示

``` java
/**
 * A builder class for constructing instances of {@link ITableSession}.
 * 
 * <p>This builder provides a fluent API for configuring various options such as connection 
 * settings, query parameters, and security features.
 * 
 * <p>All configurations have reasonable default values, which can be overridden as needed.
 */
public class TableSessionBuilder {

    /**
     * Builds and returns a configured {@link ITableSession} instance.
     *
     * @return a fully configured {@link ITableSession}.
     * @throws IoTDBConnectionException if an error occurs while establishing the connection.
     */
    public ITableSession build() throws IoTDBConnectionException;

    /**
     * Sets the list of node URLs for the IoTDB cluster.
     *
     * @param nodeUrls a list of node URLs.
     * @return the current {@link TableSessionBuilder} instance.
     * @defaultValue Collection.singletonList("localhost:6667")
     */
    public TableSessionBuilder nodeUrls(List<String> nodeUrls);

    /**
     * Sets the username for the connection.
     *
     * @param username the username.
     * @return the current {@link TableSessionBuilder} instance.
     * @defaultValue "root"
     */
    public TableSessionBuilder username(String username);

    /**
     * Sets the password for the connection.
     *
     * @param password the password.
     * @return the current {@link TableSessionBuilder} instance.
     * @defaultValue "root"
     */
    public TableSessionBuilder password(String password);

    /**
     * Sets the target database name.
     *
     * @param database the database name.
     * @return the current {@link TableSessionBuilder} instance.
     * @defaultValue null
     */
    public TableSessionBuilder database(String database);

    /**
     * Sets the query timeout in milliseconds.
     *
     * @param queryTimeoutInMs the query timeout in milliseconds.
     * @return the current {@link TableSessionBuilder} instance.
     * @defaultValue 60000 (1 minute)
     */
    public TableSessionBuilder queryTimeoutInMs(long queryTimeoutInMs);

    /**
     * Sets the fetch size for query results.
     *
     * @param fetchSize the fetch size.
     * @return the current {@link TableSessionBuilder} instance.
     * @defaultValue 5000
     */
    public TableSessionBuilder fetchSize(int fetchSize);

    /**
     * Sets the {@link ZoneId} for timezone-related operations.
     *
     * @param zoneId the {@link ZoneId}.
     * @return the current {@link TableSessionBuilder} instance.
     * @defaultValue ZoneId.systemDefault()
     */
    public TableSessionBuilder zoneId(ZoneId zoneId);

    /**
     * Sets the default init buffer size for the Thrift client.
     *
     * @param thriftDefaultBufferSize the buffer size in bytes.
     * @return the current {@link TableSessionBuilder} instance.
     * @defaultValue 1024 (1 KB)
     */
    public TableSessionBuilder thriftDefaultBufferSize(int thriftDefaultBufferSize);

    /**
     * Sets the maximum frame size for the Thrift client.
     *
     * @param thriftMaxFrameSize the maximum frame size in bytes.
     * @return the current {@link TableSessionBuilder} instance.
     * @defaultValue 64 * 1024 * 1024 (64 MB)
     */
    public TableSessionBuilder thriftMaxFrameSize(int thriftMaxFrameSize);

    /**
     * Enables or disables redirection for cluster nodes.
     *
     * @param enableRedirection whether to enable redirection.
     * @return the current {@link TableSessionBuilder} instance.
     * @defaultValue true
     */
    public TableSessionBuilder enableRedirection(boolean enableRedirection);

    /**
     * Enables or disables automatic fetching of available DataNodes.
     *
     * @param enableAutoFetch whether to enable automatic fetching.
     * @return the current {@link TableSessionBuilder} instance.
     * @defaultValue true
     */
    public TableSessionBuilder enableAutoFetch(boolean enableAutoFetch);

    /**
     * Sets the maximum number of retries for connection attempts.
     *
     * @param maxRetryCount the maximum retry count.
     * @return the current {@link TableSessionBuilder} instance.
     * @defaultValue 60
     */
    public TableSessionBuilder maxRetryCount(int maxRetryCount);

    /**
     * Sets the interval between retries in milliseconds.
     *
     * @param retryIntervalInMs the interval in milliseconds.
     * @return the current {@link TableSessionBuilder} instance.
     * @defaultValue 500 milliseconds
     */
    public TableSessionBuilder retryIntervalInMs(long retryIntervalInMs);

    /**
     * Enables or disables SSL for secure connections.
     *
     * @param useSSL whether to enable SSL.
     * @return the current {@link TableSessionBuilder} instance.
     * @defaultValue false
     */
    public TableSessionBuilder useSSL(boolean useSSL);

    /**
     * Sets the trust store path for SSL connections.
     *
     * @param keyStore the trust store path.
     * @return the current {@link TableSessionBuilder} instance.
     * @defaultValue null
     */
    public TableSessionBuilder trustStore(String keyStore);

    /**
     * Sets the trust store password for SSL connections.
     *
     * @param keyStorePwd the trust store password.
     * @return the current {@link TableSessionBuilder} instance.
     * @defaultValue null
     */
    public TableSessionBuilder trustStorePwd(String keyStorePwd);

    /**
     * Enables or disables rpc compression for the connection.
     *
     * @param enableCompression whether to enable compression.
     * @return the current {@link TableSessionBuilder} instance.
     * @defaultValue false
     */
    public TableSessionBuilder enableCompression(boolean enableCompression);

    /**
     * Sets the connection timeout in milliseconds.
     *
     * @param connectionTimeoutInMs the connection timeout in milliseconds.
     * @return the current {@link TableSessionBuilder} instance.
     * @defaultValue 0 (no timeout)
     */
    public TableSessionBuilder connectionTimeoutInMs(int connectionTimeoutInMs);
}
```

## 4. 客户端连接池

### 4.1 ITableSessionPool 接口

#### 4.1.1 功能描述

ITableSessionPool 是一个用于管理 ITableSession实例的池。这个池可以帮助我们高效地重用连接，并且在不需要时正确地清理资源, 该接口定义了如何从池中获取会话以及如何关闭池的基本操作。

#### 4.1.2 方法列表

| **方法名**   | **描述**                                                     | **返回值**         | **返回异常**             |
| ------------ | ------------------------------------------------------------ | ------------------ | ------------------------ |
| getSession() | 从池中获取一个 ITableSession 实例，用于与 IoTDB 交互。       | ITableSession 实例 | IoTDBConnectionException |
| close()      | 关闭会话池，释放任何持有的资源。关闭后，不能再从池中获取新的会话。 | 无                 | 无                       |

#### 4.1.3 接口展示

```Java
/**
 * This interface defines a pool for managing {@link ITableSession} instances.
 * It provides methods to acquire a session from the pool and to close the pool.
 * 
 * <p>The implementation should handle the lifecycle of sessions, ensuring efficient
 * reuse and proper cleanup of resources.
 */
public interface ITableSessionPool {

    /**
     * Acquires an {@link ITableSession} instance from the pool.
     *
     * @return an {@link ITableSession} instance for interacting with the IoTDB.
     * @throws IoTDBConnectionException if there is an issue obtaining a session from the pool.
     */
    ITableSession getSession() throws IoTDBConnectionException;

    /**
     * Closes the session pool, releasing any held resources.
     *
     * <p>Once the pool is closed, no further sessions can be acquired.
     */
    void close();
}
```

### 4.2 TableSessionPoolBuilder 类

#### 4.2.1 功能描述

TableSessionPool 的构造器，用于配置和创建 ITableSessionPool 的实例。允许开发者配置连接参数、会话参数和池化行为等。

#### 4.2.2 配置选项

以下是 TableSessionPoolBuilder 类的可用配置选项及其默认值：

| **配置项**                                                   | **描述**                                     | **默认值**                                  |
| ------------------------------------------------------------ | -------------------------------------------- | ------------------------------------------- |
| nodeUrls(List`<String>` nodeUrls)                              | 设置IoTDB集群的节点URL列表                   | Collections.singletonList("localhost:6667") |
| maxSize(int maxSize)                                         | 设置会话池的最大大小，即池中允许的最大会话数 | 5                                           |
| user(String user)                                            | 设置连接的用户名                             | "root"                                      |
| password(String password)                                    | 设置连接的密码                               | "root"                                      |
| database(String database)                                    | 设置目标数据库名称                           | "root"                                      |
| queryTimeoutInMs(long queryTimeoutInMs)                      | 设置查询超时时间（毫秒）                     | 60000（1分钟）                              |
| fetchSize(int fetchSize)                                     | 设置查询结果的获取大小                       | 5000                                        |
| zoneId(ZoneId zoneId)                                        | 设置时区相关的 ZoneId                        | ZoneId.systemDefault()                      |
| waitToGetSessionTimeoutInMs(long waitToGetSessionTimeoutInMs) | 设置从池中获取会话的超时时间（毫秒）         | 30000（30秒）                               |
| thriftDefaultBufferSize(int thriftDefaultBufferSize)         | 设置Thrift客户端的默认缓冲区大小（字节）     | 1024（1KB）                                 |
| thriftMaxFrameSize(int thriftMaxFrameSize)                   | 设置Thrift客户端的最大帧大小（字节）         | 64 * 1024 * 1024（64MB）                    |
| enableCompression(boolean enableCompression)                 | 是否启用连接的压缩                           | false                                       |
| enableRedirection(boolean enableRedirection)                 | 是否启用集群节点的重定向                     | true                                        |
| connectionTimeoutInMs(int connectionTimeoutInMs)             | 设置连接超时时间（毫秒）                     | 10000（10秒）                               |
| enableAutoFetch(boolean enableAutoFetch)                     | 是否启用自动获取可用DataNodes                | true                                        |
| maxRetryCount(int maxRetryCount)                             | 设置连接尝试的最大重试次数                   | 60                                          |
| retryIntervalInMs(long retryIntervalInMs)                    | 设置重试间隔时间（毫秒）                     | 500                                         |
| useSSL(boolean useSSL)                                       | 是否启用SSL安全连接                          | false                                       |
| trustStore(String keyStore)                                  | 设置SSL连接的信任库路径                      | null                                        |
| trustStorePwd(String keyStorePwd)                            | 设置SSL连接的信任库密码                      | null                                        |

#### 4.1.3 接口展示

```Java
/**
 * A builder class for constructing instances of {@link ITableSessionPool}.
 * 
 * <p>This builder provides a fluent API for configuring a session pool, including
 * connection settings, session parameters, and pool behavior.
 * 
 * <p>All configurations have reasonable default values, which can be overridden as needed.
 */
public class TableSessionPoolBuilder {

    /**
     * Builds and returns a configured {@link ITableSessionPool} instance.
     *
     * @return a fully configured {@link ITableSessionPool}.
     */
    public ITableSessionPool build();

    /**
     * Sets the list of node URLs for the IoTDB cluster.
     *
     * @param nodeUrls a list of node URLs.
     * @return the current {@link TableSessionPoolBuilder} instance.
     * @defaultValue Collection.singletonList("localhost:6667")
     */
    public TableSessionPoolBuilder nodeUrls(List<String> nodeUrls);

    /**
     * Sets the maximum size of the session pool.
     *
     * @param maxSize the maximum number of sessions allowed in the pool.
     * @return the current {@link TableSessionPoolBuilder} instance.
     * @defaultValue 5
     */
    public TableSessionPoolBuilder maxSize(int maxSize);

    /**
     * Sets the username for the connection.
     *
     * @param user the username.
     * @return the current {@link TableSessionPoolBuilder} instance.
     * @defaultValue "root"
     */
    public TableSessionPoolBuilder user(String user);

    /**
     * Sets the password for the connection.
     *
     * @param password the password.
     * @return the current {@link TableSessionPoolBuilder} instance.
     * @defaultValue "root"
     */
    public TableSessionPoolBuilder password(String password);

    /**
     * Sets the target database name.
     *
     * @param database the database name.
     * @return the current {@link TableSessionPoolBuilder} instance.
     * @defaultValue "root"
     */
    public TableSessionPoolBuilder database(String database);

    /**
     * Sets the query timeout in milliseconds.
     *
     * @param queryTimeoutInMs the query timeout in milliseconds.
     * @return the current {@link TableSessionPoolBuilder} instance.
     * @defaultValue 60000 (1 minute)
     */
    public TableSessionPoolBuilder queryTimeoutInMs(long queryTimeoutInMs);

    /**
     * Sets the fetch size for query results.
     *
     * @param fetchSize the fetch size.
     * @return the current {@link TableSessionPoolBuilder} instance.
     * @defaultValue 5000
     */
    public TableSessionPoolBuilder fetchSize(int fetchSize);

    /**
     * Sets the {@link ZoneId} for timezone-related operations.
     *
     * @param zoneId the {@link ZoneId}.
     * @return the current {@link TableSessionPoolBuilder} instance.
     * @defaultValue ZoneId.systemDefault()
     */
    public TableSessionPoolBuilder zoneId(ZoneId zoneId);

    /**
     * Sets the timeout for waiting to acquire a session from the pool.
     *
     * @param waitToGetSessionTimeoutInMs the timeout duration in milliseconds.
     * @return the current {@link TableSessionPoolBuilder} instance.
     * @defaultValue 30000 (30 seconds)
     */
    public TableSessionPoolBuilder waitToGetSessionTimeoutInMs(long waitToGetSessionTimeoutInMs);

    /**
     * Sets the default buffer size for the Thrift client.
     *
     * @param thriftDefaultBufferSize the buffer size in bytes.
     * @return the current {@link TableSessionPoolBuilder} instance.
     * @defaultValue 1024 (1 KB)
     */
    public TableSessionPoolBuilder thriftDefaultBufferSize(int thriftDefaultBufferSize);

    /**
     * Sets the maximum frame size for the Thrift client.
     *
     * @param thriftMaxFrameSize the maximum frame size in bytes.
     * @return the current {@link TableSessionPoolBuilder} instance.
     * @defaultValue 64 * 1024 * 1024 (64 MB)
     */
    public TableSessionPoolBuilder thriftMaxFrameSize(int thriftMaxFrameSize);

    /**
     * Enables or disables compression for the connection.
     *
     * @param enableCompression whether to enable compression.
     * @return the current {@link TableSessionPoolBuilder} instance.
     * @defaultValue false
     */
    public TableSessionPoolBuilder enableCompression(boolean enableCompression);

    /**
     * Enables or disables redirection for cluster nodes.
     *
     * @param enableRedirection whether to enable redirection.
     * @return the current {@link TableSessionPoolBuilder} instance.
     * @defaultValue true
     */
    public TableSessionPoolBuilder enableRedirection(boolean enableRedirection);

    /**
     * Sets the connection timeout in milliseconds.
     *
     * @param connectionTimeoutInMs the connection timeout in milliseconds.
     * @return the current {@link TableSessionPoolBuilder} instance.
     * @defaultValue 10000 (10 seconds)
     */
    public TableSessionPoolBuilder connectionTimeoutInMs(int connectionTimeoutInMs);

    /**
     * Enables or disables automatic fetching of available DataNodes.
     *
     * @param enableAutoFetch whether to enable automatic fetching.
     * @return the current {@link TableSessionPoolBuilder} instance.
     * @defaultValue true
     */
    public TableSessionPoolBuilder enableAutoFetch(boolean enableAutoFetch);

    /**
     * Sets the maximum number of retries for connection attempts.
     *
     * @param maxRetryCount the maximum retry count.
     * @return the current {@link TableSessionPoolBuilder} instance.
     * @defaultValue 60
     */
    public TableSessionPoolBuilder maxRetryCount(int maxRetryCount);

    /**
     * Sets the interval between retries in milliseconds.
     *
     * @param retryIntervalInMs the interval in milliseconds.
     * @return the current {@link TableSessionPoolBuilder} instance.
     * @defaultValue 500 milliseconds
     */
    public TableSessionPoolBuilder retryIntervalInMs(long retryIntervalInMs);

    /**
     * Enables or disables SSL for secure connections.
     *
     * @param useSSL whether to enable SSL.
     * @return the current {@link TableSessionPoolBuilder} instance.
     * @defaultValue false
     */
    public TableSessionPoolBuilder useSSL(boolean useSSL);

    /**
     * Sets the trust store path for SSL connections.
     *
     * @param keyStore the trust store path.
     * @return the current {@link TableSessionPoolBuilder} instance.
     * @defaultValue null
     */
    public TableSessionPoolBuilder trustStore(String keyStore);

    /**
     * Sets the trust store password for SSL connections.
     *
     * @param keyStorePwd the trust store password.
     * @return the current {@link TableSessionPoolBuilder} instance.
     * @defaultValue null
     */
    public TableSessionPoolBuilder trustStorePwd(String keyStorePwd);
}
```

## 5. 示例代码

Session 示例代码：[src/main/java/org/apache/iotdb/TableModelSessionExample.java](https://github.com/apache/iotdb/blob/rc/2.0.1/example/session/src/main/java/org/apache/iotdb/TableModelSessionExample.java)

SessionPool 示例代码：[src/main/java/org/apache/iotdb/TableModelSessionPoolExample.java](https://github.com/apache/iotdb/blob/rc/2.0.1/example/session/src/main/java/org/apache/iotdb/TableModelSessionPoolExample.java)

```Java
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package org.apache.iotdb;

import org.apache.iotdb.isession.ITableSession;
import org.apache.iotdb.isession.SessionDataSet;
import org.apache.iotdb.isession.pool.ITableSessionPool;
import org.apache.iotdb.rpc.IoTDBConnectionException;
import org.apache.iotdb.rpc.StatementExecutionException;
import org.apache.iotdb.session.pool.TableSessionPoolBuilder;

import org.apache.tsfile.enums.TSDataType;
import org.apache.tsfile.write.record.Tablet;
import org.apache.tsfile.write.record.Tablet.ColumnCategory;
import org.apache.tsfile.write.schema.IMeasurementSchema;
import org.apache.tsfile.write.schema.MeasurementSchema;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class TableModelSessionPoolExample {

  private static final String LOCAL_URL = "127.0.0.1:6667";

  public static void main(String[] args) {

    // don't specify database in constructor
    ITableSessionPool tableSessionPool =
        new TableSessionPoolBuilder()
            .nodeUrls(Collections.singletonList(LOCAL_URL))
            .user("root")
            .password("root")
            .maxSize(1)
            .build();

    try (ITableSession session = tableSessionPool.getSession()) {

      session.executeNonQueryStatement("CREATE DATABASE test1");
      session.executeNonQueryStatement("CREATE DATABASE test2");

      session.executeNonQueryStatement("use test2");

      // or use full qualified table name
      session.executeNonQueryStatement(
          "create table test1.table1("
              + "region_id STRING ID, "
              + "plant_id STRING ID, "
              + "device_id STRING ID, "
              + "model STRING ATTRIBUTE, "
              + "temperature FLOAT MEASUREMENT, "
              + "humidity DOUBLE MEASUREMENT) with (TTL=3600000)");

      session.executeNonQueryStatement(
          "create table table2("
              + "region_id STRING ID, "
              + "plant_id STRING ID, "
              + "color STRING ATTRIBUTE, "
              + "temperature FLOAT MEASUREMENT, "
              + "speed DOUBLE MEASUREMENT) with (TTL=6600000)");

      // show tables from current database
      try (SessionDataSet dataSet = session.executeQueryStatement("SHOW TABLES")) {
        System.out.println(dataSet.getColumnNames());
        System.out.println(dataSet.getColumnTypes());
        while (dataSet.hasNext()) {
          System.out.println(dataSet.next());
        }
      }

      // show tables by specifying another database
      // using SHOW tables FROM
      try (SessionDataSet dataSet = session.executeQueryStatement("SHOW TABLES FROM test1")) {
        System.out.println(dataSet.getColumnNames());
        System.out.println(dataSet.getColumnTypes());
        while (dataSet.hasNext()) {
          System.out.println(dataSet.next());
        }
      }

      // insert table data by tablet
      List<IMeasurementSchema> measurementSchemaList =
          new ArrayList<>(
              Arrays.asList(
                  new MeasurementSchema("region_id", TSDataType.STRING),
                  new MeasurementSchema("plant_id", TSDataType.STRING),
                  new MeasurementSchema("device_id", TSDataType.STRING),
                  new MeasurementSchema("model", TSDataType.STRING),
                  new MeasurementSchema("temperature", TSDataType.FLOAT),
                  new MeasurementSchema("humidity", TSDataType.DOUBLE)));
      List<ColumnCategory> columnTypeList =
          new ArrayList<>(
              Arrays.asList(
                  ColumnCategory.ID,
                  ColumnCategory.ID,
                  ColumnCategory.ID,
                  ColumnCategory.ATTRIBUTE,
                  ColumnCategory.MEASUREMENT,
                  ColumnCategory.MEASUREMENT));
      Tablet tablet =
          new Tablet(
              "test1",
              IMeasurementSchema.getMeasurementNameList(measurementSchemaList),
              IMeasurementSchema.getDataTypeList(measurementSchemaList),
              columnTypeList,
              100);
      for (long timestamp = 0; timestamp < 100; timestamp++) {
        int rowIndex = tablet.getRowSize();
        tablet.addTimestamp(rowIndex, timestamp);
        tablet.addValue("region_id", rowIndex, "1");
        tablet.addValue("plant_id", rowIndex, "5");
        tablet.addValue("device_id", rowIndex, "3");
        tablet.addValue("model", rowIndex, "A");
        tablet.addValue("temperature", rowIndex, 37.6F);
        tablet.addValue("humidity", rowIndex, 111.1);
        if (tablet.getRowSize() == tablet.getMaxRowNumber()) {
          session.insert(tablet);
          tablet.reset();
        }
      }
      if (tablet.getRowSize() != 0) {
        session.insert(tablet);
        tablet.reset();
      }

      // query table data
      try (SessionDataSet dataSet =
          session.executeQueryStatement(
              "select * from test1 "
                  + "where region_id = '1' and plant_id in ('3', '5') and device_id = '3'")) {
        System.out.println(dataSet.getColumnNames());
        System.out.println(dataSet.getColumnTypes());
        while (dataSet.hasNext()) {
          System.out.println(dataSet.next());
        }
      }

    } catch (IoTDBConnectionException e) {
      e.printStackTrace();
    } catch (StatementExecutionException e) {
      e.printStackTrace();
    } finally {
      tableSessionPool.close();
    }

    // specify database in constructor
    tableSessionPool =
        new TableSessionPoolBuilder()
            .nodeUrls(Collections.singletonList(LOCAL_URL))
            .user("root")
            .password("root")
            .maxSize(1)
            .database("test1")
            .build();

    try (ITableSession session = tableSessionPool.getSession()) {

      // show tables from current database
      try (SessionDataSet dataSet = session.executeQueryStatement("SHOW TABLES")) {
        System.out.println(dataSet.getColumnNames());
        System.out.println(dataSet.getColumnTypes());
        while (dataSet.hasNext()) {
          System.out.println(dataSet.next());
        }
      }

      // change database to test2
      session.executeNonQueryStatement("use test2");

      // show tables by specifying another database
      // using SHOW tables FROM
      try (SessionDataSet dataSet = session.executeQueryStatement("SHOW TABLES")) {
        System.out.println(dataSet.getColumnNames());
        System.out.println(dataSet.getColumnTypes());
        while (dataSet.hasNext()) {
          System.out.println(dataSet.next());
        }
      }

    } catch (IoTDBConnectionException e) {
      e.printStackTrace();
    } catch (StatementExecutionException e) {
      e.printStackTrace();
    }

    try (ITableSession session = tableSessionPool.getSession()) {

      // show tables from default database test1
      try (SessionDataSet dataSet = session.executeQueryStatement("SHOW TABLES")) {
        System.out.println(dataSet.getColumnNames());
        System.out.println(dataSet.getColumnTypes());
        while (dataSet.hasNext()) {
          System.out.println(dataSet.next());
        }
      }

    } catch (IoTDBConnectionException e) {
      e.printStackTrace();
    } catch (StatementExecutionException e) {
      e.printStackTrace();
    } finally {
      tableSessionPool.close();
    }
  }
}
```