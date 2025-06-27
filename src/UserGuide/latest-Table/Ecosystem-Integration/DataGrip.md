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

# DataGrip

## 1. Feature Overview

DataGrip is an open-source universal database management tool that supports core functionalities including data query and visualization, metadata management, data import/export, and driver extensions. It provides a cross-platform graphical interface for various databases (e.g., MySQL, PostgreSQL, Oracle).

IoTDB integrates with DataGrip via JDBC, enabling users to navigate time-series data in a tree-like structure similar to managing folders. It also supports cross-database analysis by connecting to other databases (e.g., MySQL, Oracle), significantly enhancing time-series data management capabilities in IoT scenarios.

![](/img/datagrip-en-1.png)

## 2. Prerequisites

Ensure DataGrip and IoTDB are installed:

- DataGrip download: https://www.jetbrains.com/datagrip/download/

- IoTDB download: https://iotdb.apache.org/Download/

## 3. Configuration Guide

### 3.1 Download Driver

Select the appropriate version of the JAR package (choose the `jar-with-dependencies.jar` variant):

- Option 1: https://repo1.maven.org/maven2/com/timecho/iotdb/iotdb-jdbc/2.0.3.3/iotdb-jdbc-2.0.3.3-jar-with-dependencies.jar

- Option 2: https://repo1.maven.org/maven2/com/timecho/iotdb/iotdb-jdbc/2.0.3.3/

![](/img/datagrip-2.png)

### 3.2 Configure Driver

#### Step 1: Open Driver Manager and Create New Driver

1. Open ​​Database Tool Window​​ from the left sidebar → Click the `+` button to create a new configuration.

2. Select the ​`​Driver​`​ button to start configuring a new driver.

![](/img/datagrip-en-3.png)

#### Step 2: Configure Driver Details

1. In the ​​Drivers​​ section, click the `+` button in the `Create New Driver` window.

![](/img/datagrip-en-4.png)

2. Click the `+` button under ​​Driver Files​​ → Select ​​Custom JARs​​.

3. Choose the downloaded IoTDB JDBC driver file (e.g., `iotdb-jdbc-2.0.5-jar-with-dependencies.jar`).

4. Under the ​​General​​ tab, select the JDBC driver class: `org.apache.iotdb.jdbc.IoTDBDriver`.

5. Set the driver name: ​​IoTDB​​.

![](/img/datagrip-en-5.png)

6. Under the ​​Options​​ tab, add `show version` to the ​​Keep-alive query​​ field in the ​​Connection​​ section.

![](/img/datagrip-en-6.png)

7. Click ​​OK​​.

#### Step 3: Create and Test Connection

1. Click the `+` button in the left sidebar → Select ​​Data Source​​ → Choose the newly created driver.

![](/img/datagrip-en-7.png)

2. Enter the driver name and comments (optional).

3. Configure the ​​JDBC URL​​ and enter the IoTDB database password.

4. Click ​`​Test Connection`​​. If successful, it will display `​​Succeeded​` along with server and driver versions.

![](/img/datagrip-en-8.png)

5. Navigate to ​​Schemas​​ → Select ​​All databases / All schemas​​.

![](/img/datagrip-en-9.png)

6. Click ​​Apply​​ → ​​OK​​.

## 4. Usage Guide

1. Database and Table Structure Overview​​

In the ​`​Database Explorer​​ `(left panel), you can view: Database names, Table names and comments, Primary key info (time + tag columns).

![](/img/datagrip-en-10.png)

2. Modify Table Structure​​

Right-click a table → Use the right panel to edit table properties (e.g., columns, constraints).

![](/img/datagrip-en-11.png)

![](/img/datagrip-en-12.png)

3. Data Operations​​

​​View Data​​: Double-click a table to see all records.

​​Run Queries​​: Right-click a table → ​​New Query Console​​ → Write SQL → Click ​​Execute​​.

![](/img/datagrip-en-13.png)

