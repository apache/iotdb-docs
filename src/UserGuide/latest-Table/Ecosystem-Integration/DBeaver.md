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

# DBeaver(IoTDB)

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

3. Create a new database connection:

   1. Go to `DBeaver > Database > New Database Connection`, or click the `"+"` icon in the top-left corner.

      ![](/img/table-dbeaver-1.png)

      ![](/img/table-dbeaver-2.png)

   2. Select the IoTDB driver (under `"All"` or `"Timeseries"` categories).

      ![](/img/table-dbeaver-3.png)

   3. Configure the connection based on your IoTDB model:(Username = Password = root)

      1. For Tree Model: Use the default Host method

         ![](/img/table-dbeaver-4.png)

      2. For Table Model: Use the URL method and append `?sql_dialect=table` to enable table mode.

         ![](/img/table-dbeaver-5.png)

   4. Click `Test` Connection – if successful, the IoTDB version will be displayed.

      ![](/img/table-dbeaver-6.png)

4. You can now use IoTDB via DBeaver.

![](/img/table-dbeaver-7.png)