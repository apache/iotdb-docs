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
# ThingsBoard

## Product Overview

1. Introduction to ThingsBoard

  ThingsBoard is an open-source IoT platform that enables rapid development, management, and expansion of IoT projects. For more detailed information, please refer to [ThingsBoard Official Website](https://thingsboard.io/docs/getting-started-guides/what-is-thingsboard/)。

  ![](https://alioss.timecho.com/docs/img/ThingsBoard-en1.png)

1. Introduction to ThingsBoard-IoTDB

  ThingsBoard IoTDB provides the ability to store data from ThingsBoard to IoTDB, and also supports reading data information from the `root.thingsboard` database in ThingsBoard. The detailed architecture diagram is shown in yellow in the following figure.

### Relationship Diagram

  ![](https://alioss.timecho.com/docs/img/Thingsboard-2.png)

## Installation Requirements

| **Preparation Content**                   | **Version Requirements**                                     |
| :---------------------------------------- | :----------------------------------------------------------- |
| JDK                                       | Requirement to have installed version 17 or above. Please refer to the specific download for details [Oracle Official Website](https://www.oracle.com/java/technologies/downloads/) |
| IoTDB                                     | Require installation of V1.3.0 and above. Please refer to the specific installation process [Deployment guidance](https://www.timecho.com/docs/UserGuide/latest/Deployment-and-Maintenance/IoTDB-Package_timecho.html) |
| ThingsBoard<br /> (IoTDB adapted version) | Please contact the business department to obtain the installation package. For specific installation steps, please refer to the following text |

## Installation Steps

Please refer to the specific installation steps  [ThingsBoard Official Website](https://thingsboard.io/docs/user-guide/install/ubuntu/)。wherein：

- [ThingsBoard Official Website](https://thingsboard.io/docs/user-guide/install/ubuntu/)【 Step 2: ThingsBoard Service Installation 】 Use the installation package obtained from the business above to install (using the official ThingsBoard installation package cannot use IoTDB)
- [ThingsBoard Official Website](https://thingsboard.io/docs/user-guide/install/ubuntu/) 【Step 3: Configure ThingsBoard Database - ThingsBoard Configuration】 In this step, you need to add environment variables according to the following content

```shell
# ThingsBoard original configuration
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/thingsboard
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=PUT_YOUR_POSTGRESQL_PASSWORD_HERE ##Change password to pg

# To use IoTDB, the following variables need to be modified
export DATABASE_TS_TYPE=iotdb  ## Originally configured as SQL, change the variable value to iotdb


# To use IoTDB, the following variables need to be added
export DATABASE_TS_LATEST_TYPE=iotdb
export IoTDB_HOST=127.0.0.1  ## The IP address where iotdb is located
export IoTDB_PORT:6667       ## The port number for iotdb is 6667 by default
export IoTDB_USER:root       ## The username for iotdb,defaults as root
export IoTDB_PASSWORD:root   ## The password for iotdb,default as root
export IoTDB_CONNECTION_TIMEOUT:5000   ## IoTDB timeout setting
export IoTDB_FETCH_SIZE:1024   ## The number of data pulled in a single request is recommended to be set to 1024
export IoTDB_MAX_SIZE:200      ## The maximum number of sessions in the session pool is recommended to be set to>=concurrent requests
export IoTDB_DATABASE:root.thingsboard  ## Thingsboard data is written to the database stored in IoTDB, supporting customization
```

## Instructions

1. Create devices and connect data：Create devices in the entity device of Thingsboard and send data to the specified devices on ThingsBoard through an industrial gateway

  ![](https://alioss.timecho.com/docs/img/Thingsboard-en2.png)

2. Set rule chain：Set alarm rules for "SD-032F pump" in the rule chain library and set the rule chain as the root chain

  <div style="display: flex;justify-content: space-between;">           
    <img src="https://alioss.timecho.com/docs/img/thingsboard-en3.png" alt=" " style="width: 50%;"/>
    <img src="https://alioss.timecho.com/docs/img/thingsborad-en4.png" alt=" " style="width: 50%;"/>     
  </div>


3. View alarm records：The generated alarm records have been viewed by clicking on "Device Alarm"

  ![](https://alioss.timecho.com/docs/img/Thingsboard-en5.png)

4. Data Visualization：Visualize settings through "New Dashboard - Bind Devices - Associate Parameters" in the "Dashboard"

  <div style="display: flex;justify-content: space-between;">           
      <img src="https://alioss.timecho.com/docs/img/thingsboard-en6.png" alt=" " style="width: 50%;"/>
      <img src="https://alioss.timecho.com/docs/img/thingsboard-en7.png" alt=" " style="width: 50%;"/>     
  </div>

