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

# Ignition

## Product Overview

1. Introduction to Ignition

    Ignition is a web-based monitoring and data acquisition tool (SCADA) - an open and scalable universal platform. Ignition allows you to more easily control, track, display, and analyze all data of your enterprise, enhancing business capabilities. For more introduction details, please refer to [Ignition Official Website](https://docs.inductiveautomation.com/docs/8.1/getting-started/introducing-ignition)

2. Introduction to the Ignition-IoTDB Connector

   The ignition-IoTDB Connector is divided into two modules: the ignition-IoTDB Connector,Ignition-IoTDB With JDBC。 Among them:

   - Ignition-IoTDB Connector: Provides the ability to store data collected by Ignition into IoTDB, and also supports data reading in Components. It injects script interfaces such as `system. iotdb. insert`and`system. iotdb. query`to facilitate programming in Ignition
   - Ignition-IoTDB With JDBC: Ignition-IoTDB With JDBC can be used in the`Transaction Groups`module and is not applicable to the`Tag Historian`module. It can be used for custom writing and querying.

   The specific relationship and content between the two modules and ignition are shown in the following figure.

    ![](/img/20240703114443.png)

## Installation Requirements

| **Preparation Content**         | Version Requirements                                         |
| ------------------------------- | ------------------------------------------------------------ |
| IoTDB                           | Version 1.3.1 and above are required to be installed, please refer to IoTDB for installation [Deployment Guidance](../Deployment-and-Maintenance/IoTDB-Package_timecho.md) |
| Ignition                        | Requirement: 8.1 version (8.1.37 and above) of version 8.1 must be installed. Please refer to the Ignition official website for installation [Installation Guidance](https://docs.inductiveautomation.com/docs/8.1/getting-started/installing-and-upgrading)（Other versions are compatible, please contact the business department for more information） |
| Ignition-IoTDB Connector module | Please contact Business to obtain                            |
| Ignition-IoTDB With JDBC module | Download address：https://repo1.maven.org/maven2/org/apache/iotdb/iotdb-jdbc/ |

## Instruction Manual For Ignition-IoTDB Connector

### Introduce

The Ignition-IoTDB Connector module can store data in a database connection associated with the historical database provider. The data is directly stored in a table in the SQL database based on its data type, as well as a millisecond timestamp. Store data only when making changes based on the value pattern and dead zone settings on each label, thus avoiding duplicate and unnecessary data storage.

The Ignition-IoTDB Connector provides the ability to store the data collected by Ignition into IoTDB.

### Installation Steps

Step 1: Enter the `Configuration` - `System` - `Modules` module and click on the `Install or Upgrade a Module` button at the bottom

![](/img/Ignition-IoTDB%E8%BF%9E%E6%8E%A5%E5%99%A8-1.PNG)

Step 2: Select the obtained `modl`, select the file and upload it, click `Install`, and trust the relevant certificate.

![](/img/20240703-151030.png)

Step 3: After installation is completed, you can see the following content

![](/img/Ignition-IoTDB%E8%BF%9E%E6%8E%A5%E5%99%A8-3.PNG)

Step 4: Enter the `Configuration` - `Tags` - `History` module and click on `Create new Historical Tag Provider`  below

![](/img/Ignition-IoTDB%E8%BF%9E%E6%8E%A5%E5%99%A8-4.png)

Step 5: Select `IoTDB`  and fill in the configuration information

![](/img/Ignition-IoTDB%E8%BF%9E%E6%8E%A5%E5%99%A8-5.PNG)

The configuration content is as follows:

<table>
<tbody>
<tr>             
    <th>Name</th>             
    <th>Description</th>                     
    <th>Default Value</th> 
    <th>Notes</th> 
  </tr>
  <tr>                                  
    <th colspan="4">Main</th>       
  </tr>
  <tr>             
    <td>Provider Name</td>             
    <td>Provider Name</td>                     
    <td>-</td> 
    <td> </td> 
  </tr>
   <tr>             
    <td>Enabled</td>             
    <td> </td>                     
    <td>true</td> 
    <td>The provider can only be used when it is true</td> 
  </tr>
  <tr>             
    <td>Description</td>             
    <td>Description</td>                     
    <td>-</td> 
    <td> </td> 
  </tr>
  <tr>                                  
    <th colspan="4">IoTDB Settings</th>       
  </tr>
  <tr>             
    <td>Host Name</td>             
    <td>The address of the target IoTDB instance</td>                     
    <td>-</td> 
    <td> </td> 
  </tr>
  <tr>             
    <td>Port Number</td>             
    <td>The port of the target IoTDB instance</td>                     
    <td>6667</td> 
    <td> </td> 
  </tr>
  <tr>             
    <td>Username</td>             
    <td>The username of the target IoTDB</td>                     
    <td>-</td> 
    <td> </td> 
  </tr>
  <tr>             
    <td>Password</td>             
    <td>Password for target IoTDB</td>                     
    <td>-</td> 
    <td> </td> 
  </tr>
  <tr>             
    <td>Database Name</td>             
    <td>The database name to be stored, starting with root, such as root db</td>                     
    <td>-</td> 
    <td> </td> 
  </tr>
  <tr>             
    <td>Pool Size</td>             
    <td>Size of SessionPool</td>                     
    <td>50</td> 
    <td>Can be configured as needed</td> 
  </tr>
  <tr>                                  
    <th colspan="2">Store and Forward Settings</th> 
    <td>Just keep it as default</td>
    <td> </td>
  </tr>
</tbody>
</table>



### Instructions

#### Configure Historical Data Storage

- After configuring the `Provider`, you can use the `IoTDB Tag Historian` in the `Designer`, just like using other `Providers`. Right click on the corresponding `Tag`  and select `Edit Tag (s) `, then select the History category in the Tag Editor

  ![](/img/ignition-7.png)

- Set `History Disabled` to `true`, select `Storage Provider` as the `Provider` created in the previous step, configure other parameters as needed, click `OK`, and then save the project. At this point, the data will be continuously stored in the 'IoTDB' instance according to the set content.

  ![](/img/ignition-8.png)

#### Read Data

- You can also directly select the tags stored in IoTDB under the Data tab of the Report

  ![](/img/ignition-9.png)

- You can also directly browse relevant data in Components

  ![](/img/ignition-10.png)

#### Script module: This function can interact with IoTDB

1. system.iotdb.insert：


- Script Description: Write data to an IoTDB instance

- Script Definition：

  `system.iotdb.insert(historian, deviceId, timestamps, measurementNames, measurementValues)`

- Parameter：

  - `str historian`：The name of the corresponding IoTDB Tag Historian Provider
  - `str deviceId`：The deviceId written, excluding the configured database, such as Sine
  - `long[] timestamps`：List of timestamps for written data points
  - `str[] measurementNames`：List of names for written physical quantities
  - `str[][] measurementValues`：The written data point data corresponds to the timestamp list and physical quantity name list

- Return Value: None

- Available Range：Client, Designer, Gateway

- Usage example:

  ```shell
  system.iotdb.insert("IoTDB", "Sine", [system.date.now()],["measure1","measure2"],[["val1","val2"]])
  ```

2. system.iotdb.query：


- Script Description：Query the data written to the IoTDB instance

- Script Definition：

  `system.iotdb.query(historian, sql)`

- Parameter：

  - `str historian`：The name of the corresponding IoTDB Tag Historian Provider
  - `str sql`：SQL statement to be queried

- Return Value：
  Query Results：`List<Map<String, Object>>`

- Available Range：Client, Designer, Gateway

- Usage example：

  ```Python
  system.iotdb.query("IoTDB", "select * from root.db.Sine where time > 1709563427247")
  ```

## Ignition-IoTDB With JDBC

### Introduce

 Ignition-IoTDB With JDBC provides a JDBC driver that allows users to connect and query the Ignition IoTDB database using standard JDBC APIs

### Installation Steps

Step 1: Enter the `Configuration` - `Databases` -`Drivers` module and create the `Translator`

![](/img/Ignition-IoTDB%20With%20JDBC-1.png)

Step 2: Enter the `Configuration` - `Databases` - `Drivers` module, create a `JDBC Driver` , select the `Translator`  configured in the previous step, and upload the downloaded `IoTDB JDBC`. Set the Classname to `org. apache. iotdb. jdbc.IoTDBDriver`

![](/img/Ignition-IoTDB%20With%20JDBC-2.png)

Step 3: Enter the `Configuration` - `Databases` - `Connections` module, create a new `Connections` , select the`IoTDB Driver` created in the previous step for `JDBC Driver`, configure the relevant information, and save it to use

![](/img/Ignition-IoTDB%20With%20JDBC-3.png)

### Instructions

#### Data Writing

Select the previously created `Connection` from the `Data Source` in the `Transaction Groups`

- `Table name`needs to be set as the complete device path starting from root
- Uncheck `Automatically create table`
- `Store timestame to` configure as time

Do not select other options, set the fields, and after `enabled` , the data will be installed and stored in the corresponding IoTDB

![](/img/%E6%95%B0%E6%8D%AE%E5%86%99%E5%85%A5-1.png)

#### Query

- Select `Data Source` in the `Database Query Browser` and select the previously created `Connection` to write an SQL statement to query the data in IoTDB

![](/img/%E6%95%B0%E6%8D%AE%E6%9F%A5%E8%AF%A2-ponz.png)

