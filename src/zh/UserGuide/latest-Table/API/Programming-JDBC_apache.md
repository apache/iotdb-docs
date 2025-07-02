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

## 1. 功能介绍

IoTDB JDBC接口提供了一种标准的方式来与IoTDB数据库进行交互，允许用户通过Java程序执行SQL语句来管理数据库和时间序列数据。它支持数据库的连接、创建、查询、更新和删除操作，以及时间序列数据的批量插入和查询。

**注意**: 目前的JDBC实现仅是为与第三方工具连接使用的。使用JDBC（执行插入语句时）无法提供高性能写入。

对于Java应用，我们推荐使用Java 原生接口。

## 2. 使用方式

**环境要求:**

- JDK >= 1.8
- Maven >= 3.6

**在maven中添加依赖:**

```XML
<dependencies>
    <dependency>
      <groupId>org.apache.iotdb</groupId>
      <artifactId>iotdb-jdbc</artifactId>
      <version>2.0.1-beta</version>
    </dependency>
</dependencies>
```

## 3. 读写操作

### 3.1 功能说明

- **写操作**：通过execute方法执行插入、创建数据库、创建时间序列等操作。
- **读操作**：通过executeQuery方法执行查询操作，并使用ResultSet对象获取查询结果。

### 3.2 **方法列表**

| **方法名**                                                   | **描述**                           | **参数**                                                   | **返回值**                          |
| ------------------------------------------------------------ | ---------------------------------- | ---------------------------------------------------------- | ----------------------------------- |
| Class.forName(String driver)                                 | 加载JDBC驱动类                     | driver: JDBC驱动类的名称                                   | Class: 加载的类对象                 |
| DriverManager.getConnection(String url, String username, String password) | 建立数据库连接                     | url: 数据库的URLusername: 数据库用户名password: 数据库密码 | Connection: 数据库连接对象          |
| Connection.createStatement()                                 | 创建Statement对象，用于执行SQL语句 | 无                                                         | Statement: SQL语句执行对象          |
| Statement.execute(String sql)                                | 执行SQL语句，对于非查询语句        | sql: 要执行的SQL语句                                       | boolean: 指示是否返回ResultSet对象  |
| Statement.executeQuery(String sql)                           | 执行查询SQL语句并返回结果集        | sql: 要执行的查询SQL语句                                   | ResultSet: 查询结果集               |
| ResultSet.getMetaData()                                      | 获取结果集的元数据                 | 无                                                         | ResultSetMetaData: 结果集元数据对象 |
| ResultSet.next()                                             | 移动到结果集的下一行               | 无                                                         | boolean: 是否成功移动到下一行       |
| ResultSet.getString(int columnIndex)                         | 获取指定列的字符串值               | columnIndex: 列索引（从1开始）                             | String: 列的字符串值                |

## 4. 示例代码

**注意：使用表模型，必须在 url 中指定 sql_dialect 参数为 table。**

```Java
String url = "jdbc:iotdb://127.0.0.1:6667?sql_dialect=table";
```
JDBC 连接集群时，url 配置集群中任意一个节点即可。

JDBC接口示例代码:[src/main/java/org/apache/iotdb/TableModelJDBCExample.java](https://github.com/apache/iotdb/blob/rc/2.0.1/example/jdbc/src/main/java/org/apache/iotdb/TableModelJDBCExample.java)


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