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

## 1. Feature Overview

DBeaver is an open-source universal database management tool that supports core functionalities including data query and visualization, metadata management, data import/export, and driver extensions. It provides a cross-platform graphical interface for various databases (e.g., MySQL, PostgreSQL, Oracle).

![](/img/dbeaver-new-1-en.png)

## 2. Prerequisites

Ensure DBeaver and IoTDB are installed:

- DBeaver download: https://dbeaver.io/download/

- IoTDB download: https://iotdb.apache.org/Download/

## 3. Configuration Guide

### 3.1 Download Driver

Select the appropriate version of the JAR package (choose the `jar-with-dependencies.jar` variant):

- Option 1: https://repo1.maven.org/maven2/com/timecho/iotdb/iotdb-jdbc/2.0.3.3/iotdb-jdbc-2.0.3.3-jar-with-dependencies.jar

- Option 2: https://repo1.maven.org/maven2/com/timecho/iotdb/iotdb-jdbc/2.0.3.3/

![](/img/dbeaver-new-2.png)

### 3.2 Configure Driver

#### Step 1: Open Driver Manager and Create New Driver

1. Navigate to `Database` → `Driver Manager` in the toolbar.

![](/img/dbeaver-new-3-en.png)

2. Click `New` to create a new driver configuration.

![](/img/dbeaver-new-4-en.png)

#### Step 2: Configure Driver Details

1. Under the `Libraries` tab, click `Add` File.

2. Select the downloaded IoTDB JDBC driver (e.g., `iotdb-jdbc-2.0.3-jar-with-dependencies.jar`).

3. Click `Find Class` to auto-detect the driver class.

![](/img/dbeaver-new-5-en.png)

4. Configure the following driver settings:

* ​Driver Name​​: IoTDB
* ​Class Name​​: org.apache.iotdb.jdbc.IoTDBDriver
* ​URL Template​​: jdbc:iotdb://{host}:{port}/
* ​Default Port​​: 6667
* ​​Default User​​: root

  ![](/img/dbeaver-new-6-en.png)

#### Step 3: Create and Test Connection

1. Click the `Create Connection` icon.

2. Search for IoTDB, select it, and click Next. Choose the `URL` connection method.

 ![](/img/dbeaver-new-7-en.png)

3. To complete the `JDBC URL`, append the parameter `?sql_dialect=table` for table model, and enter the IoTDB database password.

 ![](/img/dbeaver-new-8-table-en.png)

4. Click `Test Connection`. A successful connection will display Connected with server and driver versions.

 ![](/img/dbeaver-new-9-table-en.png)

## 4. Usage Guide

1. ​​Database Overview​​

In the left-side `​​Database Navigator​`​, you can view database-related information, including: database name, table names, column names, column data types, column comments.

 ![](/img/dbeaver-new-table-1-en.png)

 2. Table Structure

Double-click a table in the database list to display its structure in the ​​`Properties​`​ tab on the right panel, including: basic table attributes and detailed column information.

 ![](/img/dbeaver-new-table-2-en.png)

 The `​​Primary Keys`​​ section shows the table's composite primary keys (time + tag columns).

 ![](/img/dbeaver-new-table-3-en.png)

 3. ​Data View​​

Switch to the `Data` tab to explore all stored data for the selected table.

 ![](/img/dbeaver-new-table-4-en.png)

 4. ​Functions and Data Types​​

Under `Database Navigator` → `Procedures`, view all supported functions.

 ![](/img/dbeaver-new-table-5-en.png)

The `Data Types` tab lists all currently supported data types.

 ![](/img/dbeaver-new-table-6-en.png) 