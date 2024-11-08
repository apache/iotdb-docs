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
# DataEase

## Product Overview

1. Introduction to DataEase

    DataEase is an open-source data visualization and analysis tool that provides a drag-and-drop interface, allowing users to easily create charts and dashboards. It supports multiple data sources such as MySQL, SQL Server, Hive, ClickHouse, and DM, and can be integrated into other applications. This tool helps users quickly gain insights from their data and make informed decisions. For more detailed information, please refer to [DataEase official website](https://www.fit2cloud.com/dataease/index.html)

    <div style="text-align: center;">
      <img src="https://alioss.timecho.com/docs/img/DataEase2.png" alt="" style="width: 60%;"/>
    </div>

2. Introduction to the DataEase-IoTDB Connector

   IoTDB can be efficiently integrated with DataEase through API data sources, and IoTDB data can be accessed through the Session interface using API data source plugins. This plugin supports customized data processing functions, providing users with greater flexibility and more diverse data operation options.
    <div style="text-align: center;">
      <img src="https://alioss.timecho.com/docs/img/DataEase-English2.png" alt="" style="width: 70%;"/>
    </div>

## Installation Requirements

| **Preparation Content**              | **Version Requirements**                                                     |
| :-------------------- | :----------------------------------------------------------- |
| IoTDB                 | Version not required, please refer to [Deployment Guidance](https://www.timecho-global.com/docs/UserGuide/latest/Deployment-and-Maintenance/IoTDB-Package_timecho.html) |
| JDK                   | Requires JDK 11 or higher (JDK 17 or above is recommended for optimal performance)           |
| DataEase              | Requires v1 series v1.18 version, please refer to the official [DataEase Installation Guide](https://dataease.io/docs/v2/installation/offline_INSTL_and_UPG/)(V2.x is currently not supported. For integration with other versions, please contact Timecho) |
| DataEase-IoTDB Connector | Please contact Timecho for assistance                                           |

## Installation Steps

Step 1: Please contact Timecho to obtain the file and unzip the installation package `iotdb-api-source-1.0.0.zip`

Step 2: After extracting the files, modify the `application.properties` configuration file in the `config` folder

- `server.port` can be modified as needed.
- `iotdb.nodeUrls` should be configured with the address and port of the IoTDB instance to be connected.
- `iotdb.user` should be set to the IoTDB username.
- `iotdb.password` should be set to the IoTDB password.

```Properties
# Port on which the IoTDB API Source listens 
server.port=8097
# IoTDB instance addresses, multiple nodeUrls separated by ;
iotdb.nodeUrls=127.0.0.1:6667
# IoTDB username
iotdb.user=root
# IoTDB password
iotdb.password=root
```

Step 3: Start up  DataEase-IoTDB Connector

- Foreground start

```Shell
./sbin/start.sh
```

- Background start (add - d parameter)

```Shell
./sbin/start.sh -d
```

Step 4: After startup, you can check whether the startup was successful through the log.

```Shell
 lsof -i:8097  // The port configured in the file where the IoTDB API Source listens
```

## Instructions

### Sign in DataEase

1. Sign in DataEase，access address: `http://[target server IP address]:80`
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English3.png" alt="" style="width: 70%;"/>
</div>

### Configure data source

1. Navigate to "Data Source".
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English4.png" alt="" style="width: 70%;"/>
</div>

2.  Click on the "+" on the top left corner, choose "API" at the bottom as data source.
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English5.png" alt="" style="width: 70%;"/>
</div>

3. Set the "Display Name" and add the API Data Source.
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English6.png" alt="" style="width: 70%;"/>
</div>

4. Set the name of the Dataset Table, select "Post" as the Request Type, fill in the address with `http://[IoTDB API Source]:[port]/getData>`. If operating on the local machine and using the default port, the address should be set to `http://127.0.0.1:8097/getData`.
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English7.png" alt="" style="width: 70%;"/>
</div>

5. In the "Request parameters"-"Request Body" configuration, set the format as "JSON". Please fill in the parameters according to the following example：
    - timeseries：The full path of the series to be queried (currently only one series can be queried).
    - limit：The number of entries to query (valid range is greater than 0 and less than 100,000).

    ```JSON
    { 
        "timeseries": "root.ln.wf03.wt03.speed",
        "limit": 1000
    }
    ```
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English8.png" alt="" style="width: 70%;"/>
</div>

6. In the "Request parameters"-"Request Body" configuration, set "Basic Auth" as the verification method, and enter the IoTDB username and password.
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English9.png" alt="" style="width: 70%;"/>
</div>

7. In the next step, results are returned in the "data" section. For example, it returns `time`, `rownumber` and `value` as shown in the interface below. The date type for each field also need to be specified. After completing the settings, click the "Save" button in the bottom.
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English11.png" alt="" style="width: 70%;"/>
</div>

8. Save the settings to complete creating new API data source.
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English12.png" alt="" style="width: 70%;"/>
</div>

9. You can now view and edit the data source and its detailed information under "API"-"Data Source". 
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English13.png" alt="" style="width: 70%;"/>
</div>

### Configure the Dataset

1. Create API dataset: Navigate to "Data Set"，click on the "+" on the top left corner, select "API dataset" and choose the directory where this dataset is located to enter the New API Dataset interface.
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English14.png" alt="" style="width: 49%;"/>
  <img src="https://alioss.timecho.com/docs/img/DataEase-English15.png" alt="" style="width: 49%;"/>
</div>

2. Select the newly created API data source and the corresponding dataset table, then define the DataSet Name. Save the settings to complete the creation of the dataset.
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English16.png" alt="" style="width: 49%;"/>
  <img src="https://alioss.timecho.com/docs/img/DataEase-English17.png" alt="" style="width: 49%;"/>
</div>

3. Select the newly created dataset and navigate to "Field Manage", check the required fields (such as `rowNum`) and convert them to dimensions.
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English18.png" alt="" style="width: 70%;"/>
</div>

4. Configure update frequency: Click on "Add Task" under "Update info" tag and set the following information:

    - Task Name: Define the task name
    
    - Update method: Select "Full update"
    
    - Execution frequency: Set according to the actual situation. Considering the data retrieval speed of DataEase, it is recommended to set the update frequency to more than 5 seconds. For example, to set the update frequency to every 5 seconds, select "Expression setting" and configure the cron expression as `0/5****?*`.
    Click on "Confirm" to save the settings.
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English19.png" alt="" style="width: 70%;"/>
</div>

5. The task is now successfully added. You can click "Execution record" to view the logs.
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English20.png" alt="" style="width: 70%;"/>
</div>

### Configure Dashboard

1. Navigate to "Dashboard", click on "+" to create a directory, then click on "+" of the directory and select "Create Dashboard".
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English21.png" alt="" style="width: 70%;"/>
</div>

2. After setting up as needed, click on "Confirm". We will taking "Custom" setting as an example.
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English22.png" alt="" style="width: 70%;"/>
</div>

3. In the new dashboard interface, click on "Chart" to open a pop-up window for adding views. Select the previously created dataset and click on "Next".
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English23.png" alt="" style="width: 70%;"/>
</div>

4. Choose a chart type by need and define the chart title. We take "Base Line" as an example. Confirm to proceed.
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English24.png" alt="" style="width: 70%;"/>
</div>

5. In the chart configuration interface, drag and drop the `rowNum` field to the category axis (usually the X-axis) and the `value` field to the value axis (usually the Y-axis).
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English25.png" alt="" style="width: 70%;"/>
</div>

6. In the chart's category axis settings, set the sorting order to ascending, so that the data will be displayed in increasing order. Set the data refresh frequency to determine the frequency of chart updates. After completing these settings, you can further adjust other format and style options for the chart, such as color, size, etc., to meet display needs. Once adjustments are made, click the "Save" button to save the chart configuration.
>Since DataEase may cause the API data, originally returned in ascending order, to become disordered after automatically updating the dataset, it is necessary to manually specify the sorting order in the chart configuration.
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English26.png" alt="" style="width: 70%;"/>
</div>

7. After exiting the editing mode, you will be able to see the corresponding chart.
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English27.png" alt="" style="width: 70%;"/>
</div>