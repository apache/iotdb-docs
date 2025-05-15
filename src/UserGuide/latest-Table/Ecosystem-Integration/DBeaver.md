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

DBeaver is an SQL client and database management tool. It can interact with IoTDB using IoTDB's JDBC driver.

## 1. Install DBeaver

* Download DBeaver: https://dbeaver.io/download/

## 2. Install IoTDB

* Method 1: Download IoTDB binary release
  * Download: https://iotdb.apache.org/Download/
  * Version requirement: ≥ 2.0.1
* Method 2: Build from source
  * Source code: https://github.com/apache/iotdb
  * Follow compilation instructions in README.md or README_ZH.md


## 3. Connect IoTDB to DBeaver

1. Start the IoTDB service.

   ```shell
   ./sbin/start-server.sh
   ```
2. Launch DBeaver.

3. Open Driver Manager

   ![](/img/UserGuide/Ecosystem-Integration/DBeaver/01.png?raw=true)

4. Create a new driver type for IoTDB

   ![](/img/UserGuide/Ecosystem-Integration/DBeaver/02.png)

5. Download `iotdb-jdbc`， from [source1](https://maven.proxy.ustclug.org/maven2/org/apache/iotdb/iotdb-jdbc/) or [source2](https://repo1.maven.org/maven2/org/apache/iotdb/iotdb-jdbc/)，choose the corresponding jar file，download the suffix `jar-with-dependencies.jar` file.

   ![](/img/table-dbeaver-8.png)

6. Add the downloaded jar file， then select `Find Class`.

   ![](/img/table-dbeaver-9.png)

7. Edit the driver Settings

   ![](/img/table-dbeaver-10.png)

8. Open New DataBase Connection and select iotdb

   ![](/img/UserGuide/Ecosystem-Integration/DBeaver/06.png)

9.  Edit JDBC Connection Settings

```
JDBC URL: jdbc:iotdb://127.0.0.1:6667/?sql_dialect=table
Username: root
Password: root
```

![](/img/table-dbeaver-11.png)

10. Test Connection

    ![](/img/table-dbeaver-12.png)

4. You can now use IoTDB via DBeaver.

![](/img/table-dbeaver-7.png)