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

![](/img/dbeaver-2520-1-en.png)

## 2. Prerequisites

Ensure DBeaver and IoTDB are installed:

- DBeaver(>= V25.2.0), download: https://dbeaver.io/download/

- IoTDB is running, download: https://iotdb.apache.org/Download/

## 3. Create Connection

1. Click ​​DBeaver > Database > New Database Connection​​, or directly click the icon in the upper-left corner.

![](/img/dbeaver-2520-2-en.png)

2. Select the ​​IoTDB driver​​ (you can find it under the ​​All​​ or ​​Timeseries​​ category).

![](/img/dbeaver-2520-3-en.png)

3. Complete the connection settings, and choose the appropriate sql dialect based on whether the target IoTDB uses a ​​Tree Model​​ or ​​Table Model​​.

![](/img/dbeaver-2520-4-en.png)

4. Test the connection (make sure to select the driver file compatible with your version). If the connection is successful, a prompt will appear showing "Connected," along with the server version and driver version.

![](/img/dbeaver-2520-5-en.png)

## 4. Usage Guide

1. ​​Database Overview​​

Navigate to the left-side `Database Navigator` to view database details, including database name, device names, measurement names, and data types.

 ![](/img/dbeaver-new-tree-1-en.png)

 2. ​​Devices and Measurements​​

Double-click a device in the database list to display its properties. The `Columns` tab shows detailed measurement information.

 ![](/img/dbeaver-new-tree-2-en.png)

 3. ​​Data View​​

Switch to the `Data` tab to explore all stored data for the selected measurement.

 ![](/img/dbeaver-new-tree-3-en.png)

 4. ​​Functions and Data Types​​

Under `Database Navigator` → `Procedures`, view all supported functions.

 ![](/img/dbeaver-new-tree-4-en.png)

The `Data Types` tab lists all currently supported data types.

 ![](/img/dbeaver-new-tree-5-en.png) 