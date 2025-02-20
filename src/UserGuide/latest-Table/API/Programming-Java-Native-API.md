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

IoTDB provides a Java native client driver and a session pool management mechanism. These tools enable developers to interact with IoTDB using object-oriented APIs, allowing time-series objects to be directly assembled and inserted into the database without constructing SQL statements. It is recommended to use the  `ITableSessionPool` for multi-threaded database operations to maximize efficiency.

## Prerequisites

### Environment Requirements

- **JDK**: Version 1.8 or higher
- **Maven**: Version 3.6 or higher

### Adding Maven Dependencies

```XML
<dependencies>
    <dependency>
      <groupId>com.timecho.iotdb</groupId>
      <artifactId>iotdb-session</artifactId>
      <version>2.0.1.1</version>
    </dependency>
</dependencies>
```

## Read and Write Operations

### ITableSession Interface

The `ITableSession` interface defines basic operations for interacting with IoTDB, including data insertion, query execution, and session closure. Note that this interface is **not thread-safe**.

#### Method Overview

| **Method Name**                                     | **Description**                                              | **Parameters**                                               | **Return Value** | **Exceptions**                                            |
| --------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ---------------- | --------------------------------------------------------- |
| insert(Tablet tablet)                               | Inserts a `Tablet` containing time-series data into the database. | `tablet`: The `Tablet` object to be inserted.                | None             | `StatementExecutionException`, `IoTDBConnectionException` |
| executeNonQueryStatement(String sql)                | Executes non-query SQL statements such as DDL or DML commands. | `sql`: The SQL statement to execute.                         | None             | `StatementExecutionException`, `IoTDBConnectionException` |
| executeQueryStatement(String sql)                   | Executes a query SQL statement and returns a `SessionDataSet` containing the query results. | `sql`: The SQL query statement to execute.                   | `SessionDataSet` | `StatementExecutionException`, `IoTDBConnectionException` |
| executeQueryStatement(String sql, long timeoutInMs) | Executes a query SQL statement with a specified timeout in milliseconds. | `sql`: The SQL query statement. `timeoutInMs`: Query timeout in milliseconds. | `SessionDataSet` | `StatementExecutionException`                             |
| close()                                             | Closes the session and releases resources.                   | None                                                         | None             | IoTDBConnectionException                                  |

#### Sample Code

```Java
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

### TableSessionBuilder Class

The `TableSessionBuilder` class is a builder for configuring and creating instances of the `ITableSession` interface. It allows developers to set connection parameters, query parameters, and security features.

#### Parameter Configuration

| **Parameter**                                       | **Description**                                              | **Default Value**                                 |
|-----------------------------------------------------| ------------------------------------------------------------ | ------------------------------------------------- |
| nodeUrls(List\<String> nodeUrls)                    | Sets the list of IoTDB cluster node URLs.                    | `Collections.singletonList("``localhost:6667``")` |
| username(String username)                           | Sets the username for the connection.                        | `"root"`                                          |
| password(String password)                           | Sets the password for the connection.                        | `"root"`                                          |
| database(String database)                           | Sets the target database name.                               | `null`                                            |
| queryTimeoutInMs(long queryTimeoutInMs)             | Sets the query timeout in milliseconds.                      | `60000` (1 minute)                                |
| fetchSize(int fetchSize)                            | Sets the fetch size for query results.                       | `5000`                                            |
| zoneId(ZoneId zoneId)                               | Sets the timezone-related `ZoneId`.                          | `ZoneId.systemDefault()`                          |
| thriftDefaultBufferSize(int thriftDefaultBufferSize) | Sets the default buffer size for the Thrift client (in bytes). | `1024`(1KB)                                       |
| thriftMaxFrameSize(int thriftMaxFrameSize)          | Sets the maximum frame size for the Thrift client (in bytes). | `64 * 1024 * 1024`(64MB)                          |
| enableRedirection(boolean enableRedirection)        | Enables or disables redirection for cluster nodes.           | `true`                                            |
| enableAutoFetch(boolean enableAutoFetch)            | Enables or disables automatic fetching of available DataNodes. | `true`                                            |
| maxRetryCount(int maxRetryCount)                    | Sets the maximum number of connection retry attempts.        | `60`                                              |
| retryIntervalInMs(long retryIntervalInMs)           | Sets the interval between retry attempts (in milliseconds).  | `500`(500 millisesonds)                           |
| useSSL(boolean useSSL)                              | Enables or disables SSL for secure connections.              | `false`                                           |
| trustStore(String keyStore)                         | Sets the path to the trust store for SSL connections.        | `null`                                            |
| trustStorePwd(String keyStorePwd)                   | Sets the password for the SSL trust store.                   | `null`                                            |
| enableCompression(boolean enableCompression)        | Enables or disables RPC compression for the connection.      | `false`                                           |
| connectionTimeoutInMs(int connectionTimeoutInMs)    | Sets the connection timeout in milliseconds.                 | `0` (no timeout)                                  |

#### Sample Code

```Java
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

## Session Pool

### ITableSessionPool Interface

The `ITableSessionPool` interface manages a pool of `ITableSession` instances, enabling efficient reuse of connections and proper cleanup of resources.

#### Method Overview

| **Method Name** | **Description**                                            | **Return Value** | **Exceptions**             |
| --------------- | ---------------------------------------------------------- | ---------------- | -------------------------- |
| getSession()    | Acquires a session from the pool for database interaction. | `ITableSession`  | `IoTDBConnectionException` |
| close()         | Closes the session pool and releases resources.。          | None             | None                       |

#### Sample Code

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

### TableSessionPoolBuilder Class

The `TableSessionPoolBuilder` class is a builder for configuring and creating `ITableSessionPool` instances, supporting options like connection settings and pooling behavior.

#### Parameter Configuration

| **Parameter**                                                 | **Description**                                              | **Default Value**                             |
|---------------------------------------------------------------| ------------------------------------------------------------ | --------------------------------------------- |
| nodeUrls(List\<String> nodeUrls)                              | Sets the list of IoTDB cluster node URLs.                    | `Collections.singletonList("localhost:6667")` |
| maxSize(int maxSize)                                          | Sets the maximum size of the session pool, i.e., the maximum number of sessions allowed in the pool. | `5`                                           |
| user(String user)                                             | Sets the username for the connection.                        | `"root"`                                      |
| password(String password)                                     | Sets the password for the connection.                        | `"root"`                                      |
| database(String database)                                     | Sets the target database name.                               | `"root"`                                      |
| queryTimeoutInMs(long queryTimeoutInMs)                       | Sets the query timeout in milliseconds.                      | `60000`(1 minute)                             |
| fetchSize(int fetchSize)                                      | Sets the fetch size for query results.                       | `5000`                                        |
| zoneId(ZoneId zoneId)                                         | Sets the timezone-related `ZoneId`.                          | `ZoneId.systemDefault()`                      |
| waitToGetSessionTimeoutInMs(long waitToGetSessionTimeoutInMs) | Sets the timeout duration (in milliseconds) for acquiring a session from the pool. | `30000`(30 seconds)                           |
| thriftDefaultBufferSize(int thriftDefaultBufferSize)          | Sets the default buffer size for the Thrift client (in bytes). | `1024`(1KB)                                   |
| thriftMaxFrameSize(int thriftMaxFrameSize)                    | Sets the maximum frame size for the Thrift client (in bytes). | `64 * 1024 * 1024`(64MB)                      |
| enableCompression(boolean enableCompression)                  | Enables or disables compression for the connection.          | `false`                                       |
| enableRedirection(boolean enableRedirection)                  | Enables or disables redirection for cluster nodes.           | `true`                                        |
| connectionTimeoutInMs(int connectionTimeoutInMs)              | Sets the connection timeout in milliseconds.                 | `10000` (10 seconds)                          |
| enableAutoFetch(boolean enableAutoFetch)                      | Enables or disables automatic fetching of available DataNodes. | `true`                                        |
| maxRetryCount(int maxRetryCount)                              | Sets the maximum number of connection retry attempts.        | `60`                                          |
| retryIntervalInMs(long retryIntervalInMs)                     | Sets the interval between retry attempts (in milliseconds).  | `500` (500 milliseconds)                      |
| useSSL(boolean useSSL)                                        | Enables or disables SSL for secure connections.              | `false`                                       |
| trustStore(String keyStore)                                   | Sets the path to the trust store for SSL connections.        | `null`                                        |
| trustStorePwd(String keyStorePwd)                             | Sets the password for the SSL trust store.                   | `null`                                        |

#### Sample Code

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