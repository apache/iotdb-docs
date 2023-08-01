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

# Workbench

Workbench is a graphical database management tool that can create multiple connections. It is used to manage IoTDB, and provides functions such as metadata visualization and management, data addition, deletion, modification, and permission control. Workbench not only meets all the needs of professional developers, but the simple and friendly interface design is also easy for beginners to use.

## Installation

If you encounter any problems during the installation process, you can refer to the documentation or seek help from the software vendor or technical support team.

Environmental requirements: JDK1.8.0_162 and above.

1. Download and unzip the software. The first step is to download the software from the official website or a trusted source at https://www.timecho.com/product.
2. Start the backend service. Enter the command:
```
java -jar workbench.jar
```
or
```
nohup java -jar workbench.jar  >/dev/null 2>&1 &
```
The default port is 9090.

3.   Access the web interface. The default address is `IP:9090`.

## Log In

The default user name is root and the password is 123456. The user name must be composed of letters, numbers, and underscores, and cannot start with numbers and underscores. It must be greater than or equal to 4 characters, and the password must be greater than or equal to 6 characters. Click "**文A**" to switch languages, Chinese and English are available.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image6.jpeg)

## User Interface

**Main interface**

The main interface consists of an action bar, a navigation bar, a toolbar, and several panes.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image7.png)

### 1. Connection Operation Bar

You can create a new database connection or database query.

### 2. Object Pane

The object pane displays the connected database instances. It adopts a tree structure design. Clicking to display sub-nodes can facilitate the processing of databases and their managed objects. The lowest level displayed is the device.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image8.jpeg)

### 3. Navigation Bar

In the navigation bar, you can choose "**Database Management**", "**Monitoring Management**", "**Operation Log**", "**Data Dashboard**".

### 4. Status Bar

The status bar displays the status information under the current option. When "**Database Management**" is selected, the status bar displays the online status of the database, IP, port, server status, and information about the number of storage groups, devices, and physical quantities.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image9.jpeg)

When "**Monitoring Management**" is selected, the status column displays the online status, IP, port, server status, database version, activation information and expiration time of the database. Note: The icon at "**Database Version**" indicates the Enterprise Edition or the Open Source Edition, and some functions of Workbench cannot be used on the Open Source Edition.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image10.jpeg)

### 5. Operation Column

In the operation column, any option can be selected for operation.

### 6. Information Pane

The information pane displays detailed information about the object.

## Connection

First create one or more connections using the connections window. Click "**Data Connection**" to create a new connection.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image11.jpeg)

Enter the required information in the pop-up connection window, where the data connection name must be greater than or equal to 3 characters. Then click "**Connection Test**", if "**Connection Test Passed**" is displayed, it means the connection is correct, click OK to create a new connection.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image12.png)

If you want to modify the connection, you can click the "**Edit**" option on the right side of the status bar to modify the database connection information.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image13.jpeg)

## Server Security

### Whitelist

The enterprise version of IoTDB can set the IPs that are allowed to access IoTDB by adding a whitelist. This function cannot be used when using the open source version of IoTDB to connect to Workbench.

Select "**Database Management**"->"**White List**" from the navigation bar to view the list of added whitelist IPs.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image14.jpeg)

Click "**Whitelist**" to add whitelist IP, and click "**Edit**"/"**Delete**" to modify the IP information of whitelist.

### Authority Management

Workbench provides powerful tools to manage permissions on server user accounts and database objects. Click "**Database User Management**" or "**Database Role Management**" in the operation column to open the user or role object list.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image15.jpeg)

**New users**. Select "**Database User Management**"-\>"**User Account＋**" to add a new user, fill in the user name and password as required, and add role information for the user.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image16.jpeg)

Permissions can be divided into data management permissions (such as adding, deleting, modifying and querying data) and permission management permissions (creating and deleting users and roles, granting and revoking permissions, etc.). Select "**Database User Management**"-\>"**Data Management Permission**"-\>"**Add Permission**" to add data management permission to the user. You can select "**Edit**" or "**Delete**" at the added permission to modify the permission information.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image17.jpeg)

In the pop-up interface, you can choose the granularity of permission function and specific permission content. Note that only when the [Query Data] permission and [View User] permission are checked, other permissions can be viewed in Workbench.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image18.jpeg)

Select "**Database User Management**"-\>"**Authority Management Authority**" to check the specific authority information in the information pane, and click "Save" to add authority management authority to the user.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image19.jpeg)

**Permission Preview**. Select "**Database User Management**"-\>"**Data Permission Preview**" to preview all data permissions under the user name. Note: This feature is only supported in Enterprise Edition.

## Data Migration

The import and export tool can import or export files in CSV format to IoTDB in batches.

### Batch Import

The batch import feature is only supported in the Enterprise Edition. Select the database to be operated in the object pane, select the device node, and the information "**Device Structure"** will appear in the information pane on the right. Click "**Import Physical Quantity**" to download the template and fill in the physical quantity information. Then upload the CSV file to import physical quantities in batches. Note: The current version does not support the import of alignment physical quantities.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image20.png)

Select "**Data Preview**"->"**Batch Import**" to import CSV file data that meets the requirements of the template. Currently, it supports importing aligned time series.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image21.jpeg)

### Batch Export

The batch export function is only supported in the Enterprise Edition. Select the database to be operated in the object pane, enter the device node, and select "**Device Structure**"-\>"**Export Physical Quantity**" to batch export the physical quantity metadata under the entity. In the search box, you can enter name/alias, tag name, and tag value to filter.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image22.jpeg)

Select "**Data Preview**"->"**Export Data**" to export the data under this entity in batches. The search box can be filtered by time range, time interval and physical quantity.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image23.jpeg)

## Data Preview

Workbench provides multi-level data preview tools.

### Data Model

Select the data connection to be previewed in the object pane, click "**Data Model**" in the operation column to preview the data model, the root is defined as LEVEL=0, the default display in Workbench is LEVEL=1, click "**View More**" to view more levels of data model information. The "**View More**" feature is only supported in the Enterprise Edition.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image24.png)

### Storage Group Information

Click "**Storage Group Information**" in the operation column to preview all the storage group information of the data connection, click "**Details**" to view the entity details under the storage group, and continue to click entity details to view the physical quantity details. Click "**Edit**" to edit the TTL information of the storage group.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image25.jpeg)

## Query

Workbench provides a powerful query tool that can directly edit the query text and save the query, simplifying the task of querying rows.

### Create a Query

Click "**Query**" in "**Connection Operation Bar**", select the data connection to be operated, and then enter the query editor.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image26.jpeg)

You can enter SQL statements on the query editor interface, and the prompt box will prompt keywords that meet the conditions. On the right side, functions or data can be selected for calculation as required.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image27.png){width="5.90625in" height="3.125in"}

After entering the SQL statement, click the upper right corner to select operations, namely "Save", "Run", "Pause" and "Delete". The running results display 10 lines per page, and the default limit is 100 lines of returned results, and you can also choose to cancel the limit to display all.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image28.jpeg)

### View Query

A saved connection can be viewed under **Query** under the data connection in the object pane.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image29.jpeg)

## Cluster Management

### Topology Management

Workbench provides a view of the cluster topology. Select "**Database Management**"-\>"**Node Management**"\>"**Topology Management**" to view the topology map. The "Topology Management" function is only supported in the Enterprise Edition.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image30.png)

The topology map shows the node IP, node type and port.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image31.jpeg)

### Node Management

Workbench provides management of cluster nodes. Select "**Database Management**"-\>"**Node Management**" to view the node status. You can query by node ID or node type.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image32.jpeg)

### Partition Management

Workbench provides management of cluster partitions. Select "**Database Management**"->"**Partition Management**" to check the partition status. You can query by partition ID or partition type.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image33.png)

## Storage Group Management

### Create a Storage Group

Select the database object to be operated in the object pane, and click "**New Storage Group**" to create a storage group. The storage group name is required, and the storage group name is required. Under normal circumstances, only letters, Numbers, underscores, and UNICODE are allowed. If Chinese characters contain special characters, please use backticks. Survival time is optional.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image34.png)

### Delete Storage Groups

Select the storage group to be operated in the object pane, select "**Edit**" in the operation column to modify the survival time of the storage group, and select "**Delete**" to delete the storage group.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image35.png)

## Equipment and Physical Quantity Management

### Create Physical Quantities

Select the storage group to be operated in the object pane, click "**New Device**", and fill in the information as required to create the physical quantity under the storage group. The name of the physical quantity is required. Under normal circumstances, only letters, numbers, underscores and UNICODE are allowed. If Chinese characters contain special characters, please use backticks.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image36.png)

### Data Trend Preview

The "Data Trending" feature is only supported in the Enterprise Edition. Select a storage group in the object pane, "**Data Trend**" displays the physical quantity trend chart under the storage group, click the chart to display detailed information, you can select the time range to query the data in this interval, and display the minimum data such as value.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image37.png)

### Modify and Delete Physical Quantities

Select the device to be operated in the object pane, and click "**Edit**" on the right to modify the physical quantity information (alias, label and attribute) under the device. Click "**Delete**" to delete the device.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image38.png)

## Operation Log

"Operation Log" provides all operation records on Workbench, which can be filtered by IP, user, data connection, keyword and time range.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image39.jpeg)

## Monitoring Management

Workbench provides "**Monitoring Management**" to view the selected server monitoring properties. Select "**Monitoring Management**" from the navigation bar and select the type of monitoring you want. Optional "**Monitoring Indicators**", "**Connection Information**", "**Audit Log**".

### Monitoring Metrics

Monitoring metrics can be used to view the latest information on CPU indicators, memory indicators, and storage indicators.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image40.png)

### Connection Information

Connection information allows you to view information about users and servers connected to the Workbench. The "Connection Information" feature is only supported in the Enterprise Edition.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image41.png)

### Audit Log

The audit log shows all operations performed in IoTDB, and Workbench provides a query interface, which can be queried by time period or user name. The "Audit Log" feature is only supported in the Enterprise Edition.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image42.png)

## Data Dashboard

The data dashboard can be used to create a visual representation of database data. The following figure shows the dashboard with the Grafana template mounted.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image43.png)

### File Configuration

Configure the dashboard address in the file application-prod.properties, find the configuration item url.dashboard=https://grafana.com/, and fill in the grafana URL.

Content of application-prod.properties：
  ```plain Text
# Designate the log configuration file
logging.config=classpath:log4j2.xml

# Set port and context path
server.port=9090
server.servlet.context-path=/api

# The following data source configuration method will cause data loss after the project is repackaged.
# To facilitate testing during development, refer to the application-prod.properties file for configuration during actual project deployment
# sqlite
spring.datasource.url=jdbc:sqlite:./iotdb.db
spring.datasource.driver-class-name=org.sqlite.JDBC
# mysql
#spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
#spring.datasource.url=jdbc:mysql://
#spring.datasource.username=
#spring.datasource.password=

# Enable the multipart uploading function
spring.servlet.multipart.enabled=true
spring.servlet.multipart.file-size-threshold=2KB
spring.servlet.multipart.max-file-size=200MB
spring.servlet.multipart.max-request-size=215MB

# All files generated during CSV import and export are stored in this folder
file.temp-dir=./tempFile

spring.messages.basename=messages

# enable open audit in iotdb
enableIotdbAudit = false
# enable open audit in workbench:
enableWorkbenchAudit = true
# timechodb  config server rpc port
configServerPort=8867
# dashboard url
url.dashboard=https://grafana.com/
  ```

### Get URL

Log in to the Grafan panel, click the share button, select "**Link**" in the pop-up window, and copy "**Link URL**".

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image44.png)

## Q&A

1.   If you encounter the following situations, please try to exit "incognito mode" or change your browser.

![](https://alioss.timecho.com/docs/img/UserGuide/Ecosystem-Integration/Workbench/image45.png)

2.  If you cannot see the monitoring information, you need to enable Metric of IoTDB.

3.  When the active-active configuration changes, it is recommended to re-establish the connection.

