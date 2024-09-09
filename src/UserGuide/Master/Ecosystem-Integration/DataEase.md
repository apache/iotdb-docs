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

    DataEase is an open-source data visualization and analysis tool that provides a drag and drop interface, allowing users to easily create charts and dashboards. It supports MySQL SQL Server、Hive、ClickHouse、 Multiple data sources such as Dameng can be integrated into other applications. Can help users quickly gain insights into data and make decisions.For more detailed information, please refer to[DataEase official website](https://www.fit2cloud.com/dataease/index.html)

    <div style="text-align: center;">
      <img src="https://alioss.timecho.com/docs/img/DataEase-English1.png" alt="" style="width: 50%;"/>
      <img src="https://alioss.timecho.com/docs/img/DataEase2.png" alt="" style="width: 40%;"/>
    </div>

2. Introduction to the DataEase-IoTDB Connector

   IoTDB can be efficiently integrated with DataEase through API data sources, and IoTDB data can be accessed through the Session interface using API data source plugins. This plugin supports customized data processing functions, providing users with greater flexibility and more diverse data operation options.
    <div style="text-align: center;">
      <img src="https://alioss.timecho.com/docs/img/DataEase-English2.png" alt="" style="width: 70%;"/>
    </div>

## Installation Requirements

| **Preparation Content**              | **Version Requirements**                                                     |
| :-------------------- | :----------------------------------------------------------- |
| IoTDB                 | Version not required, please refer to installation IoTDB [Deployment guidance](https://www.timecho.com/docs/zh/UserGuide/latest/Deployment-and-Maintenance/IoTDB-Package_timecho.html) |
| JDK                   | Suggest JDK11 and above versions (recommend deploying JDK17 and above versions)           |
| DataEase              | Request v1 series v1.18 version, please refer to DataEase official website for installation [Installation Guide](https://dataease.io/docs/v2/installation/offline_INSTL_and_UPG/)（V2. x is currently not supported, please contact Timecho Business for compatibility with other versions） |
| DataEase-IoTDB Connector | Please contact Timecho Business for assistance                                           |

## Installation Steps

Step 1: Please contact the business to obtain the compressed file and unzip the installation package（ iotdb-api-source-1.0.0.zip ）

Step 2: After decompression,Modify the configuration file`application.properties` in the `config` folder

- port`server.port` can be modified as needed
- `iotdb.nodeUrls` need to configure the address and port of the IoTDB instance to be connected
- `iotdb.user` need to configure the username for IoTDB
- `iotdb.password` password for IoTDB needs to be configured

```Properties
# Port to start IoTDB API Source listening
server.port=8097
# The instance address of IoTDB,multiple nodeUrls use; division
iotdb.nodeUrls=127.0.0.1:6667
# IoTDB user name
iotdb.user=root
# IoTDB password
iotdb.password=root
```

Step 3: Start up  DataEase-IoTDB Connector

- Front end startup

```Shell
./sbin/start.sh
```

- Background startup (add - d parameter)

```Shell
./sbin/start.sh -d
```

Step 4: After startup, you can check whether the startup was successful through the log.

```Shell
 lsof -i:8097  // Starting the IoTDB API Source listening port in config
```

## Instructions

### Sign in DataEase

1. Sign in DataEase，access address : `http://目标服务器IP地址:80`
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English3.png" alt="" style="width: 70%;"/>
</div>

### Configure data source

1. Jump in the navigation bar【Data Source】interface
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English4.png" alt="" style="width: 70%;"/>
</div>

2. Click on the top left corner 【 + 】，slide to the bottom，choice【API】Data Source
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English5.png" alt="" style="width: 70%;"/>
</div>

3. New API Data Source，set the basic information on your own【Display name】，click on the data table location【+ Add】
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English6.png" alt="" style="width: 70%;"/>
</div>

4. Enter custom in the data table name field【Name】，request type selection `Post`，address filling `http://[IoTDB API Source]:[port]/getData`，If operating locally and using the default port，address filling`http://127.0.0.1:8097/getData`
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English7.png" alt="" style="width: 70%;"/>
</div>

5. In the【Request parameters】section, select the【Request Body】tab，and ensure that the format is set to JSON.Please fill in the parameters according to the following example, where：
    timeseries：The complete path of the sequence to be queried (currently only supports querying one sequence)
    limit：The number of items to be queried (valid range is greater than 0 and less than 100000)

    ```JSON
    { 
        "timeseries": "root.ln.wf03.wt03.speed",
        "limit": 1000
    }
    ```
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English8.png" alt="" style="width: 70%;"/>
</div>

6. Click on the【Auth config】tab, select【Basic Auth】as the authentication method, and enter the IoTDB username and password accurately
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English9.png" alt="" style="width: 70%;"/>
</div>

7. Click【Next】，you will see the interface return result in the`data`section.If the following figure shows the interface,returned`time`、 `rownumber`and `value`information，at the same time, it is necessary to specify the data types of each field。。After completing the settings, click the 'Save' button in the bottom right corner of the interface.
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English11.png" alt="" style="width: 70%;"/>
</div>

8. After saving, enter the new API data source page and click the 【 Save 】 button in the upper right corner.
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English12.png" alt="" style="width: 70%;"/>
</div>

9. Save Data Source: After saving, you can view the data source and its detailed information under the API classification menu, or edit the data source. 
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English13.png" alt="" style="width: 70%;"/>
</div>

### Configure the dataset

1. Create API dataset: navigate to in the navigation bar【Data Set】page，Click on the top left corner of the page 【 + 】 symbol，Select the【API dataset】type and choose the directory where this dataset is located to enter the New API Dataset page.
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English14.png" alt="" style="width: 49%;"/>
  <img src="https://alioss.timecho.com/docs/img/DataEase-English15.png" alt="" style="width: 49%;"/>
</div>

2. On the New API Dataset page, select the newly created API data source and the corresponding data table contained in the dataset (left in the figure below), and set the dataset name (right in the figure below). After setting up, click the【 Save 】button in the upper right corner of the page to complete the creation of the dataset.
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English16.png" alt="" style="width: 49%;"/>
  <img src="https://alioss.timecho.com/docs/img/DataEase-English17.png" alt="" style="width: 49%;"/>
</div>

3. Select the newly created dataset and enter【Field Manage】tag page, then mark the required fields (such as rowNum) as dimensions
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English18.png" alt="" style="width: 70%;"/>
</div>

4. onfigure update frequency: Click on 【Update info】on the【Add Task】page and set the following information:

    Task Name: Fill in according to the actual situation
    
    Update method: Select【Full update】
    
    Execution frequency: Set according to the actual situation (considering DataEase acquisition speed, it is recommended to set it to update every 5 seconds). For example, if it needs to be set to update every 5 seconds, you can choose【Expression setting】Aad in【cron expression】set as`0/5 * * * * ? *`
    After the configuration is complete, click the【confirm】button in the bottom right corner of the page to save the settings. 
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English19.png" alt="" style="width: 70%;"/>
</div>

5. The task has been successfully added. You can click on the top left corner of the page【Execution record】option to view execution records
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English20.png" alt="" style="width: 70%;"/>
</div>

### Configure dashboard

1. Jump to the 【 Dashboard 】 page in the navigation bar and click on it【 + 】symbol creation directory，and in the corresponding directory，Click on the【 + 】symbol and select from the pop-up menu【Create Dashboard】
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English21.png" alt="" style="width: 70%;"/>
</div>

2. After setting up as needed, click on【Confirm】. Taking custom settings as an example, confirm and enter the new dashboard page.
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English22.png" alt="" style="width: 70%;"/>
</div>

3. On the new dashboard page, click the【Chart】button to open a pop-up window for adding views.In the pop-up window, select the previously created dataset and click【Next】continue with the operation.
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English23.png" alt="" style="width: 70%;"/>
</div>

4. In the step of selecting icon types, choose a suitable chart type based on the display requirements,Like the【Base Line】. After selecting, click the 【Confirm】 button to apply the selection.
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English24.png" alt="" style="width: 70%;"/>
</div>

5. In the chart configuration interface, drag and drop the`rowNum`field to the category axis (usually the X-axis) and the`value`field to the value axis (usually the Y-axis).
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English25.png" alt="" style="width: 70%;"/>
</div>

6. In the category axis settings of the chart, select to set the sorting method to ascending, so that the data will be displayed in ascending order. Set the data refresh frequency to determine the frequency of chart updates. After completing these settings, you can further adjust other formatting and style options of the chart, such as color, size, etc., to meet display needs.After adjusting, click the【save】button in the upper right corner of the page to save the chart configuration.
>Due to the possibility of DataEase automatically updating the dataset, the original API data returned in ascending order may be out of order. Therefore, it is necessary to manually specify the sorting method in the chart configuration.
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English26.png" alt="" style="width: 70%;"/>
</div>

7. View the effect after exiting editing
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase-English27.png" alt="" style="width: 70%;"/>
</div>