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

# DBeaver

DBeaver is a SQL client software application and a database administration tool. It can use the JDBC application programming interface (API) to interact with IoTDB via the JDBC driver. 

## DBeaver Installation

* From DBeaver site: https://dbeaver.io/download/

## IoTDB Installation

* Download binary version
  * From IoTDB site: https://iotdb.apache.org/Download/
  * Version >= 0.13.0
* Or compile from source code
  * See https://github.com/apache/iotdb

## Connect IoTDB and DBeaver

1. Start IoTDB server

   ```shell
   ./sbin/start-server.sh
   ```
2. Start DBeaver
3. Open Driver Manager

   ![](/img/UserGuide/Ecosystem-Integration/DBeaver/01.png)

4. Create a new driver type for IoTDB

   ![](/img/UserGuide/Ecosystem-Integration/DBeaver/02.png)

5. Download `iotdb-jdbc`， from [source1](https://maven.proxy.ustclug.org/maven2/org/apache/iotdb/iotdb-jdbc/) or [source2](https://repo1.maven.org/maven2/org/apache/iotdb/iotdb-jdbc/)，choose the corresponding jar file，download the suffix `jar-with-dependencies.jar` file.
   ![](/img/20230920-192746.jpg)
   
6. Add the downloaded jar file， then select `Find Class`.

   ![](/img/UserGuide/Ecosystem-Integration/DBeaver/03.png)

7. Edit the driver Settings

   ![](/img/UserGuide/Ecosystem-Integration/DBeaver/05.png)

   ```
   Driver Name: IoTDB
   Driver Type: Generic
   URL Template: jdbc:iotdb://{host}:{port}/
   Default Port: 6667
   Default User: root
   ```

8. Open New DataBase Connection and select iotdb

   ![](/img/UserGuide/Ecosystem-Integration/DBeaver/06.png) 

9.  Edit JDBC Connection Settings

   ```
   JDBC URL: jdbc:iotdb://127.0.0.1:6667/
   Username: root
   Password: root
   ```
   ![](/img/UserGuide/Ecosystem-Integration/DBeaver/07.png)

10. Test Connection

   ![](/img/UserGuide/Ecosystem-Integration/DBeaver/08.png)

11. Enjoy IoTDB with DBeaver

   ![](/img/UserGuide/Ecosystem-Integration/DBeaver/09.png)

12. DBeaver tree structure display

   ![](/img/dbeaver01.png)