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

# JDBC

**注意**: 目前的JDBC实现仅是为与第三方工具连接使用的。不推荐使用 JDBC （执行插入语句时），因无法提供高性能写入，查询推荐使用 JDBC。

对于Java应用，我们推荐使用[Java 原生接口](./Programming-Java-Native-API_apache)*

## 1. 依赖

* JDK >= 1.8
* Maven >= 3.6

## 2. 安装方法

在根目录下执行下面的命令：
```shell
mvn clean install -pl iotdb-client/jdbc -am -DskipTests
```

### 2.1 在 MAVEN 中使用 IoTDB JDBC

```xml
<dependencies>
    <dependency>
      <groupId>org.apache.iotdb</groupId>
      <artifactId>iotdb-jdbc</artifactId>
      <version>1.3.1</version>
    </dependency>
</dependencies>
```

### 2.2 示例代码

本章提供了如何建立数据库连接、执行 SQL 和显示查询结果的示例。

要求您已经在工程中包含了数据库编程所需引入的包和 JDBC class.

**注意：为了更快地插入，建议使用 executeBatch()**

```java
import java.sql.*;
import org.apache.iotdb.jdbc.IoTDBSQLException;

public class JDBCExample {
  /**
   * Before executing a SQL statement with a Statement object, you need to create a Statement object using the createStatement() method of the Connection object.
   * After creating a Statement object, you can use its execute() method to execute a SQL statement
   * Finally, remember to close the 'statement' and 'connection' objects by using their close() method
   * For statements with query results, we can use the getResultSet() method of the Statement object to get the result set.
   */
  public static void main(String[] args) throws SQLException {
    Connection connection = getConnection();
    if (connection == null) {
      System.out.println("get connection defeat");
      return;
    }
    Statement statement = connection.createStatement();
    //Create database
    try {
      statement.execute("CREATE DATABASE root.demo");
    }catch (IoTDBSQLException e){
      System.out.println(e.getMessage());
    }

    //SHOW DATABASES
    statement.execute("SHOW DATABASES");
    outputResult(statement.getResultSet());

    //Create time series
    //Different data type has different encoding methods. Here use INT32 as an example
    try {
      statement.execute("CREATE TIMESERIES root.demo.s0 WITH DATATYPE=INT32,ENCODING=RLE;");
    }catch (IoTDBSQLException e){
      System.out.println(e.getMessage());
    }
    //Show time series
    statement.execute("SHOW TIMESERIES root.demo");
    outputResult(statement.getResultSet());
    //Show devices
    statement.execute("SHOW DEVICES");
    outputResult(statement.getResultSet());
    //Count time series
    statement.execute("COUNT TIMESERIES root");
    outputResult(statement.getResultSet());
    //Count nodes at the given level
    statement.execute("COUNT NODES root LEVEL=3");
    outputResult(statement.getResultSet());
    //Count timeseries group by each node at the given level
    statement.execute("COUNT TIMESERIES root GROUP BY LEVEL=3");
    outputResult(statement.getResultSet());
    

    //Execute insert statements in batch
    statement.addBatch("insert into root.demo(timestamp,s0) values(1,1);");
    statement.addBatch("insert into root.demo(timestamp,s0) values(2,15);");
    statement.addBatch("insert into root.demo(timestamp,s0) values(2,17);");
    statement.addBatch("insert into root.demo(timestamp,s0) values(4,12);");
    statement.executeBatch();
    statement.clearBatch();

    //Full query statement
    String sql = "select * from root.demo";
    ResultSet resultSet = statement.executeQuery(sql);
    System.out.println("sql: " + sql);
    outputResult(resultSet);

    //Exact query statement
    sql = "select s0 from root.demo where time = 4;";
    resultSet= statement.executeQuery(sql);
    System.out.println("sql: " + sql);
    outputResult(resultSet);

    //Time range query
    sql = "select s0 from root.demo where time >= 2 and time < 5;";
    resultSet = statement.executeQuery(sql);
    System.out.println("sql: " + sql);
    outputResult(resultSet);

    //Aggregate query
    sql = "select count(s0) from root.demo;";
    resultSet = statement.executeQuery(sql);
    System.out.println("sql: " + sql);
    outputResult(resultSet);

    //Delete time series
    statement.execute("delete timeseries root.demo.s0");

    //close connection
    statement.close();
    connection.close();
  }

  public static Connection getConnection() {
    // JDBC driver name and database URL
    String driver = "org.apache.iotdb.jdbc.IoTDBDriver";
    String url = "jdbc:iotdb://127.0.0.1:6667/";
    // set rpc compress mode
    // String url = "jdbc:iotdb://127.0.0.1:6667?rpc_compress=true";

    // Database credentials
    String username = "root";
    String password = "root";

    Connection connection = null;
    try {
      Class.forName(driver);
      connection = DriverManager.getConnection(url, username, password);
    } catch (ClassNotFoundException e) {
      e.printStackTrace();
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return connection;
  }

  /**
   * This is an example of outputting the results in the ResultSet
   */
  private static void outputResult(ResultSet resultSet) throws SQLException {
    if (resultSet != null) {
      System.out.println("--------------------------");
      final ResultSetMetaData metaData = resultSet.getMetaData();
      final int columnCount = metaData.getColumnCount();
      for (int i = 0; i < columnCount; i++) {
        System.out.print(metaData.getColumnLabel(i + 1) + " ");
      }
      System.out.println();
      while (resultSet.next()) {
        for (int i = 1; ; i++) {
          System.out.print(resultSet.getString(i));
          if (i < columnCount) {
            System.out.print(", ");
          } else {
            System.out.println();
            break;
          }
        }
      }
      System.out.println("--------------------------\n");
    }
  }
}
```

可以在 url 中指定 version 参数：
```java
String url = "jdbc:iotdb://127.0.0.1:6667?version=V_1_0";
```
version 表示客户端使用的 SQL 语义版本，用于升级 0.13 时兼容 0.12 的 SQL 语义，可能取值有：`V_0_12`、`V_0_13`、`V_1_0`。

此外，IoTDB 在 JDBC 中提供了额外的接口，供用户在连接中使用不同的字符集（例如 GB18030）读写数据库。
IoTDB 默认的字符集为 UTF-8。当用户期望使用 UTF-8 外的字符集时，需要在 JDBC 的连接中，指定 charset 属性。例如：
1. 使用 GB18030 的 charset 创建连接：
```java
DriverManager.getConnection("jdbc:iotdb://127.0.0.1:6667?charset=GB18030", "root", "root")
```
2. 调用如下 `IoTDBStatement` 接口执行 SQL 时，可以接受 `byte[]` 编码的 SQL，该 SQL 将按照被指定的 charset 解析成字符串。
```java
public boolean execute(byte[] sql) throws SQLException;
```
3. 查询结果输出时，可使用 `ResultSet` 的 `getBytes` 方法得到的 `byte[]`，`byte[]` 的编码使用连接指定的 charset 进行。
```java
System.out.print(resultSet.getString(i) + " (" + new String(resultSet.getBytes(i), charset) + ")");
```
以下是完整示例:
```java
public class JDBCCharsetExample {

  private static final Logger LOGGER = LoggerFactory.getLogger(JDBCCharsetExample.class);

  public static void main(String[] args) throws Exception {
    Class.forName("org.apache.iotdb.jdbc.IoTDBDriver");

    try (final Connection connection =
            DriverManager.getConnection(
                "jdbc:iotdb://127.0.0.1:6667?charset=GB18030", "root", "root");
        final IoTDBStatement statement = (IoTDBStatement) connection.createStatement()) {

      final String insertSQLWithGB18030 =
          "insert into root.测试(timestamp, 维语, 彝语, 繁体, 蒙文, 简体, 标点符号, 藏语) values(1, 'ئۇيغۇر تىلى', 'ꆈꌠꉙ', \"繁體\", 'ᠮᠣᠩᠭᠣᠯ ᠬᠡᠯᠡ', '简体', '——？！', \"བོད་སྐད།\");";
      final byte[] insertSQLWithGB18030Bytes = insertSQLWithGB18030.getBytes("GB18030");
      statement.execute(insertSQLWithGB18030Bytes);
    } catch (IoTDBSQLException e) {
      LOGGER.error("IoTDB Jdbc example error", e);
    }

    outputResult("GB18030");
    outputResult("UTF-8");
    outputResult("UTF-16");
    outputResult("GBK");
    outputResult("ISO-8859-1");
  }

  private static void outputResult(String charset) throws SQLException {
    System.out.println("[Charset: " + charset + "]");
    try (final Connection connection =
            DriverManager.getConnection(
                "jdbc:iotdb://127.0.0.1:6667?charset=" + charset, "root", "root");
        final IoTDBStatement statement = (IoTDBStatement) connection.createStatement()) {
      outputResult(statement.executeQuery("select ** from root"), Charset.forName(charset));
    } catch (IoTDBSQLException e) {
      LOGGER.error("IoTDB Jdbc example error", e);
    }
  }

  private static void outputResult(ResultSet resultSet, Charset charset) throws SQLException {
    if (resultSet != null) {
      System.out.println("--------------------------");
      final ResultSetMetaData metaData = resultSet.getMetaData();
      final int columnCount = metaData.getColumnCount();
      for (int i = 0; i < columnCount; i++) {
        System.out.print(metaData.getColumnLabel(i + 1) + " ");
      }
      System.out.println();

      while (resultSet.next()) {
        for (int i = 1; ; i++) {
          System.out.print(
              resultSet.getString(i) + " (" + new String(resultSet.getBytes(i), charset) + ")");
          if (i < columnCount) {
            System.out.print(", ");
          } else {
            System.out.println();
            break;
          }
        }
      }
      System.out.println("--------------------------\n");
    }
  }
}
```