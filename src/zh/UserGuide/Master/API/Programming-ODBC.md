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

# ODBC
在 JDBC 插件的基础上，IoTDB 可以通过 ODBC-JDBC 桥来支持通过 ODBC 对数据库的操作。

## 依赖
* 带依赖打包的 IoTDB JDBC 插件包
* ODBC-JDBC 桥（如 Zappy-Sys）

## 部署方法
### 准备 JDBC 插件包
下载 IoTDB 源码，在根目录下执行下面的命令：
```shell
mvn clean package -pl iotdb-client/jdbc -am -DskipTests -P get-jar-with-dependencies
```
之后，就可以在`iotdb-client/jdbc/target`目录下看到`iotdb-jdbc-1.3.2-SNAPSHOT-jar-with-dependencies.jar`文件。

### 准备 ODBC-JDBC 桥
*注意: 这里给出的仅仅是一种 ODBC-JDBC 桥，仅作示例。读者可以自行寻找其他的 ODBC-JDBC 桥来对接 IoTDB 的 JDBC 插件。*
1.  **下载 Zappy-Sys ODBC-JDBC 桥插件**：
    进入 https://zappysys.com/products/odbc-powerpack/odbc-jdbc-bridge-driver/ 网站，点击下载按钮并直接安装。

    ![ZappySys_website.jpg](https://alioss.timecho.com/upload/ZappySys_website.jpg)
2. **准备 IoTDB**：打开 IoTDB 集群，并任意写入一条数据。
    ```sql
    IoTDB > insert into root.ln.wf02.wt02(timestamp,status) values(1,true)
    ```
3. **部署及调试插件**：
    1. 打开 ODBC 数据源 32/64 位，取决于 Windows 的位数，一个示例的位置是 `C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Administrative Tools`。

       ![ODBC_ADD_CN.jpg](https://alioss.timecho.com/upload/ODBC_ADD_CN.jpg)
    2. 点击添加，选择 ZappySys JDBC Bridge。

       ![ODBC_CREATE_CN.jpg](https://alioss.timecho.com/upload/ODBC_CREATE_CN.jpg)
    3. 填写如下配置：

       | 配置项                 | 填写内容                                          | 示例                                                                                                                 |
       |---------------------|-----------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
       | Connection String   | jdbc:iotdb://<IoTDB 的 IP>:<IoTDB 的 rpc port>/ | jdbc:iotdb://127.0.0.1:6667/                                                                                       |
       | Driver Class        | org.apache.iotdb.jdbc.IoTDBDriver             | org.apache.iotdb.jdbc.IoTDBDriver                                                                                  |
       | JDBC driver file(s) | IoTDB JDBC jar-with-dependencies 插件路径         | C:\Users\13361\Documents\GitHub\iotdb\iotdb-client\jdbc\target\iotdb-jdbc-1.3.2-SNAPSHOT-jar-with-dependencies.jar |
       | User name           | IoTDB 的用户名                                    | root                                                                                                               |
       | User password       | IoTDB 的密码                                     | root                                                                                                               |

       ![ODBC_CONNECTION.png](https://alioss.timecho.com/upload/ODBC_CONNECTION.png)
    4. 点击 Test Connection 按钮，应该显示连接成功。

       ![ODBC_CONFIG_CN.jpg](https://alioss.timecho.com/upload/ODBC_CONFIG_CN.jpg)
    5. 点击上方的 Preview， 将查询文本换为 `select * from root.**`，点击 Preview Data，应该正确显示查询结果。

       ![ODBC_TEST.jpg](https://alioss.timecho.com/upload/ODBC_TEST.jpg)
4. **使用 ODBC 操作数据**：正确部署后，就可以使用 Windows 的 ODBC 库，对 IoTDB 的数据进行操作。 这里给出 C# 语言的代码示例：
    ```C#
    using System.Data.Odbc;
    
    // Get a connection
    var dbConnection = new OdbcConnection("DSN=ZappySys JDBC Bridge");
    dbConnection.Open();
    
    // Execute the write commands to prepare data
    var dbCommand = dbConnection.CreateCommand();
    dbCommand.CommandText = "insert into root.Keller.Flur.Energieversorgung(time, s1) values(1715670861634, 1)";
    dbCommand.ExecuteNonQuery();
    dbCommand.CommandText = "insert into root.Keller.Flur.Energieversorgung(time, s2) values(1715670861634, true)";
    dbCommand.ExecuteNonQuery();
    dbCommand.CommandText = "insert into root.Keller.Flur.Energieversorgung(time, s3) values(1715670861634, 3.1)";
    dbCommand.ExecuteNonQuery();
    
    // Execute the read command
    dbCommand.CommandText = "SELECT * FROM root.Keller.Flur.Energieversorgung";
    var dbReader = dbCommand.ExecuteReader();
    
    // Write the output header
    var fCount = dbReader.FieldCount;
    Console.Write(":");
    for(var i = 0; i < fCount; i++)
    {
        var fName = dbReader.GetName(i);
        Console.Write(fName + ":");
    }
    Console.WriteLine();
    
    // Output the content
    while (dbReader.Read())
    {
        Console.Write(":");
        for(var i = 0; i < fCount; i++) 
        {
            var fieldType = dbReader.GetFieldType(i);
            switch (fieldType.Name)
            {
                case "DateTime":
                    var dateTime = dbReader.GetInt64(i);
                    Console.Write(dateTime + ":");
                    break;
                case "Double":
                    if (dbReader.IsDBNull(i)) 
                    {
                        Console.Write("null:");
                    }
                    else 
                    {
                        var fValue = dbReader.GetDouble(i);
                        Console.Write(fValue + ":");
                    }   
                    break;
                default:
                    Console.Write(fieldType.Name + ":");
                    break;
            }
        }
        Console.WriteLine();
    }
    
    // Shut down gracefully
    dbReader.Close();
    dbCommand.Dispose();
    dbConnection.Close();
    ```
   运行该程序可以向 IoTDB 内写入数据，并且查询并打印写入的数据。
