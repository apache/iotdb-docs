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
With IoTDB JDBC, IoTDB can be accessed using the ODBC-JDBC bridge.

## 1. Dependencies
* IoTDB-JDBC's jar-with-dependency package
* ODBC-JDBC bridge (e.g. ZappySys JDBC Bridge)

## 2. Deployment
### 2.1 Preparing JDBC package
Download the source code of IoTDB, and execute the following command in root directory:
```shell
mvn clean package -pl iotdb-client/jdbc -am -DskipTests -P get-jar-with-dependencies
```
Then, you can see the output `iotdb-jdbc-1.3.2-SNAPSHOT-jar-with-dependencies.jar` under `iotdb-client/jdbc/target` directory.

### 2.2 Preparing ODBC-JDBC Bridge
*Note: Here we only provide one kind of ODBC-JDBC bridge as the instance. Readers can use other ODBC-JDBC bridges to access IoTDB with the IOTDB-JDBC.*
1.  **Download Zappy-Sys ODBC-JDBC Bridge**:
    Enter the https://zappysys.com/products/odbc-powerpack/odbc-jdbc-bridge-driver/ website, and click "download".

    ![ZappySys_website.jpg](/img/ZappySys_website.jpg)

2. **Prepare IoTDB**: Set up IoTDB cluster, and write a row of data arbitrarily.
    ```sql
    IoTDB > insert into root.ln.wf02.wt02(timestamp,status) values(1,true)
    ```

3. **Deploy and Test the Bridge**:
    1. Open ODBC Data Sources(32/64 bit), depending on the bits of Windows. One possible position is `C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Administrative Tools`.

       ![ODBC_ADD_EN.jpg](/img/ODBC_ADD_EN.jpg)

    2. Click on "add" and select ZappySys JDBC Bridge.

       ![ODBC_CREATE_EN.jpg](/img/ODBC_CREATE_EN.jpg)

    3. Fill in the following settings:

       | Property            | Content                                                   | Example                                                                                                            |
       |---------------------|-----------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
       | Connection String   | jdbc:iotdb://\<The IP of IoTDB>:\<The rpc port of IoTDB>/ | jdbc:iotdb://127.0.0.1:6667/                                                                                       |
       | Driver Class        | org.apache.iotdb.jdbc.IoTDBDriver                         | org.apache.iotdb.jdbc.IoTDBDriver                                                                                  |
       | JDBC driver file(s) | The path of IoTDB JDBC jar-with-dependencies              | C:\Users\13361\Documents\GitHub\iotdb\iotdb-client\jdbc\target\iotdb-jdbc-1.3.2-SNAPSHOT-jar-with-dependencies.jar |
       | User name           | IoTDB's user name                                         | root                                                                                                               |
       | User password       | IoTDB's password                                          | root                                                                                                               |

       ![ODBC_CONNECTION.png](/img/ODBC_CONNECTION.png)

    4. Click on "Test Connection" button, and a "Test Connection: SUCCESSFUL" should appear.

       ![ODBC_CONFIG_EN.jpg](/img/ODBC_CONFIG_EN.jpg)

    5. Click the "Preview" button above, and replace the original query text with `select * from root.**`, then click "Preview Data", and the query result should correctly.

       ![ODBC_TEST.jpg](/img/ODBC_TEST.jpg)

4. **Operate IoTDB's data with ODBC**: After correct deployment, you can use Microsoft's ODBC library to operate IoTDB's data. Here's an example written in C#:
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
   This program can write data into IoTDB, and query the data we have just written.
