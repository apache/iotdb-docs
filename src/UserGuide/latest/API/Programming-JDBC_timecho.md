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

**Note**: The current JDBC implementation is only for connecting with third-party tools. We do not recommend using JDBC (when executing insert statements) as it cannot provide high-performance writing. For queries, we recommend using JDBC.
PLEASE USE [Java Native API](./Programming-Java-Native-API_timecho) INSTEAD*

## 1. Dependencies

* JDK >= 1.8+
* Maven >= 3.9+

## 2. Installation

In root directory:

```shell
mvn clean install -pl iotdb-client/jdbc -am -DskipTests
```

## 3. Use IoTDB JDBC with Maven

```xml
<dependencies>
    <dependency>
      <groupId>org.apache.iotdb</groupId>
      <artifactId>iotdb-jdbc</artifactId>
      <version>1.3.1</version>
    </dependency>
</dependencies>
```

## 4. Coding Examples

This chapter provides an example of how to open a database connection, execute an SQL query, and display the results.

It requires including the packages containing the JDBC classes needed for database programming.

**NOTE: For faster insertion, the insertTablet() in Session is recommended.**

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
    statement.addBatch("INSERT INTO root.demo(timestamp,s0) VALUES(1,1);");
    statement.addBatch("INSERT INTO root.demo(timestamp,s0) VALUES(1,1);");
    statement.addBatch("INSERT INTO root.demo(timestamp,s0) VALUES(2,15);");
    statement.addBatch("INSERT INTO root.demo(timestamp,s0) VALUES(2,17);");
    statement.addBatch("INSERT INTO root.demo(timestamp,s0) values(4,12);");
    statement.executeBatch();
    statement.clearBatch();

    //Full query statement
    String sql = "SELECT * FROM root.demo";
    ResultSet resultSet = statement.executeQuery(sql);
    System.out.println("sql: " + sql);
    outputResult(resultSet);

    //Exact query statement
    sql = "SELECT s0 FROM root.demo WHERE time = 4;";
    resultSet= statement.executeQuery(sql);
    System.out.println("sql: " + sql);
    outputResult(resultSet);

    //Time range query
    sql = "SELECT s0 FROM root.demo WHERE time >= 2 AND time < 5;";
    resultSet = statement.executeQuery(sql);
    System.out.println("sql: " + sql);
    outputResult(resultSet);

    //Aggregate query
    sql = "SELECT COUNT(s0) FROM root.demo;";
    resultSet = statement.executeQuery(sql);
    System.out.println("sql: " + sql);
    outputResult(resultSet);

    //Delete time series
    statement.execute("DELETE timeseries root.demo.s0");

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
    String password = "TimechoDB@2021"; //Before V2.0.6.x the default password is root 

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

The parameter `version` can be used in the url:
````java
String url = "jdbc:iotdb://127.0.0.1:6667?version=V_1_0";
````
The parameter `version` represents the SQL semantic version used by the client, which is used in order to be compatible with the SQL semantics of `0.12` when upgrading to `0.13`. 
The possible values are: `V_0_12`, `V_0_13`, `V_1_0`.

In addition, IoTDB provides additional interfaces in JDBC for users to read and write the database using different character sets (e.g., GB18030) in the connection.
The default character set for IoTDB is UTF-8. When users want to use a character set other than UTF-8, they need to specify the charset property in the JDBC connection. For example:
1. Create a connection using the GB18030 charset:
```java
DriverManager.getConnection("jdbc:iotdb://127.0.0.1:6667?charset=GB18030", "root", "TimechoDB@2021"); //Before V2.0.6.x the default password is root 
```
2. When executing SQL with the `IoTDBStatement` interface, the SQL can be provided as a `byte[]` array, and it will be parsed into a string according to the specified charset.
```java
public boolean execute(byte[] sql) throws SQLException;
```
3. When outputting query results, the `getBytes` method of `ResultSet` can be used to get `byte[]`, which will be encoded using the charset specified in the connection.
```java
System.out.print(resultSet.getString(i) + " (" + new String(resultSet.getBytes(i), charset) + ")");
```
Here is a complete example:
```java
public class JDBCCharsetExample {

  private static final Logger LOGGER = LoggerFactory.getLogger(JDBCCharsetExample.class);

  public static void main(String[] args) throws Exception {
    Class.forName("org.apache.iotdb.jdbc.IoTDBDriver");

    try (final Connection connection =
            DriverManager.getConnection(
                "jdbc:iotdb://127.0.0.1:6667?charset=GB18030", "root", "TimechoDB@2021"); //Before V2.0.6.x the default password is root 
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
                "jdbc:iotdb://127.0.0.1:6667?charset=" + charset, "root", "TimechoDB@2021"); //Before V2.0.6.x the default password is root 
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