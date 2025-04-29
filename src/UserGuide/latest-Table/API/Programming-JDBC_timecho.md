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

The IoTDB JDBC provides a standardized way to interact with the IoTDB database, allowing users to execute SQL statements from Java programs for managing databases and time-series data. It supports operations such as connecting to the database, creating, querying, updating, and deleting data, as well as batch insertion and querying of time-series data.

**Note:** The current JDBC implementation is designed primarily for integration with third-party tools. High-performance writing **may not be achieved** when using JDBC for insert operations. For Java applications, it is recommended to use the **JAVA Native API** for optimal performance.

## 1. Prerequisites

### 1.1 **Environment Requirements**

- **JDK:** Version 1.8 or higher
- **Maven:** Version 3.6 or higher

### 1.2 **Adding Maven Dependencies**

Add the following dependency to your Maven `pom.xml` file:

```XML
<dependencies>
    <dependency>
      <groupId>com.timecho.iotdb</groupId>
      <artifactId>iotdb-session</artifactId>
      <version>2.0.1.1</version>
    </dependency>
</dependencies>
```

## 2. Read and Write Operations

**Write Operations:** Perform database operations such as inserting data, creating databases, and creating time-series using the `execute` method.

**Read Operations:** Execute queries using the `executeQuery` method and retrieve results via the `ResultSet` object.

### 2.1 Method Overview

| **Method Name**                                              | **Description**                                             | **Parameters**                                               | **Return Value**                                  |
| ------------------------------------------------------------ | ----------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------- |
| Class.forName(String driver)                                 | Loads the JDBC driver class                                 | `driver`: Name of the JDBC driver class                      | `Class`: Loaded class object                      |
| DriverManager.getConnection(String url, String username, String password) | Establishes a database connection                           | `url`: Database URL `username`: Username `password`: Password | `Connection`: Database connection object          |
| Connection.createStatement()                                 | Creates a `Statement` object for executing SQL statements   | None                                                         | `Statement`: SQL execution object                 |
| Statement.execute(String sql)                                | Executes a non-query SQL statement                          | `sql`: SQL statement to execute                              | `boolean`: Indicates if a `ResultSet` is returned |
| Statement.executeQuery(String sql)                           | Executes a query SQL statement and retrieves the result set | `sql`: SQL query statement                                   | `ResultSet`: Query result set                     |
| ResultSet.getMetaData()                                      | Retrieves metadata of the result set                        | None                                                         | `ResultSetMetaData`: Metadata object              |
| ResultSet.next()                                             | Moves to the next row in the result set                     | None                                                         | `boolean`: Whether the move was successful        |
| ResultSet.getString(int columnIndex)                         | Retrieves the string value of a specified column            | `columnIndex`: Column index (starting from 1)                | `String`: Column value                            |

## 3. Sample Code

**Note:** When using the Table Model, you must specify the `sql_dialect` parameter as `table` in the URL. Example:

```Java
String url = "jdbc:iotdb://127.0.0.1:6667?sql_dialect=table";
```

You can find the full example code at [GitHub Repository](https://github.com/apache/iotdb/blob/rc/2.0.1/example/jdbc/src/main/java/org/apache/iotdb/TableModelJDBCExample.java).

Here is an excerpt of the sample code:

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

import org.apache.iotdb.jdbc.IoTDBSQLException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;

public class TableModelJDBCExample {

  private static final Logger LOGGER = LoggerFactory.getLogger(TableModelJDBCExample.class);

  public static void main(String[] args) throws ClassNotFoundException, SQLException {
    Class.forName("org.apache.iotdb.jdbc.IoTDBDriver");

    // don't specify database in url
    try (Connection connection =
            DriverManager.getConnection(
                "jdbc:iotdb://127.0.0.1:6667?sql_dialect=table", "root", "root");
        Statement statement = connection.createStatement()) {

      statement.execute("CREATE DATABASE test1");
      statement.execute("CREATE DATABASE test2");

      statement.execute("use test2");

      // or use full qualified table name
      statement.execute(
          "create table test1.table1(region_id STRING TAG, plant_id STRING TAG, device_id STRING TAG, model STRING ATTRIBUTE, temperature FLOAT FIELD, humidity DOUBLE FIELD) with (TTL=3600000)");

      statement.execute(
          "create table table2(region_id STRING TAG, plant_id STRING TAG, color STRING ATTRIBUTE, temperature FLOAT FIELD, speed DOUBLE FIELD) with (TTL=6600000)");

      // show tables from current database
      try (ResultSet resultSet = statement.executeQuery("SHOW TABLES")) {
        ResultSetMetaData metaData = resultSet.getMetaData();
        System.out.println(metaData.getColumnCount());
        while (resultSet.next()) {
          System.out.println(resultSet.getString(1) + ", " + resultSet.getInt(2));
        }
      }

      // show tables by specifying another database
      // using SHOW tables FROM
      try (ResultSet resultSet = statement.executeQuery("SHOW TABLES FROM test1")) {
        ResultSetMetaData metaData = resultSet.getMetaData();
        System.out.println(metaData.getColumnCount());
        while (resultSet.next()) {
          System.out.println(resultSet.getString(1) + ", " + resultSet.getInt(2));
        }
      }

    } catch (IoTDBSQLException e) {
      LOGGER.error("IoTDB Jdbc example error", e);
    }

    // specify database in url
    try (Connection connection =
            DriverManager.getConnection(
                "jdbc:iotdb://127.0.0.1:6667/test1?sql_dialect=table", "root", "root");
        Statement statement = connection.createStatement()) {
      // show tables from current database test1
      try (ResultSet resultSet = statement.executeQuery("SHOW TABLES")) {
        ResultSetMetaData metaData = resultSet.getMetaData();
        System.out.println(metaData.getColumnCount());
        while (resultSet.next()) {
          System.out.println(resultSet.getString(1) + ", " + resultSet.getInt(2));
        }
      }

      // change database to test2
      statement.execute("use test2");

      try (ResultSet resultSet = statement.executeQuery("SHOW TABLES")) {
        ResultSetMetaData metaData = resultSet.getMetaData();
        System.out.println(metaData.getColumnCount());
        while (resultSet.next()) {
          System.out.println(resultSet.getString(1) + ", " + resultSet.getInt(2));
        }
      }
    }
  }
}
```