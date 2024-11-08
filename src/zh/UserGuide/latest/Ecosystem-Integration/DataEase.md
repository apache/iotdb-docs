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

## 产品概述

1. DataEase 简介

    DataEase 是一个开源的数据可视化与分析工具，提供拖拽式的界面，使得用户能够轻松创建图表和仪表板，已支持 MySQL、SQL Server、Hive、ClickHouse、达梦等多种数据源，并且可以集成到其他应用程序中。能帮助用户快速洞察数据，做出决策。更多介绍详情请参考[DataEase 官网](https://www.fit2cloud.com/dataease/index.html)

    <div style="text-align: center;">
      <img src="https://alioss.timecho.com/docs/img/DataEase1.png" alt="" style="width: 45%;"/>
      <img src="https://alioss.timecho.com/docs/img/DataEase2.png" alt="" style="width: 40%;"/>
    </div>

2. DataEase-IoTDB 连接器介绍

   IoTDB 可以通过API数据源的形式与DataEase实现高效集成，利用API数据源插件通过Session接口访问IoTDB数据。该插件支持定制化的数据处理功能，为用户提供了更大的灵活性和更多样化的数据操作选项。
    <div style="text-align: center;">
      <img src="https://alioss.timecho.com/docs/img/DataEase3.png" alt="" style="width: 70%;"/>
    </div>

## 安装要求

| **准备内容**              | **版本要求**                                                     |
| :-------------------- | :----------------------------------------------------------- |
| IoTDB                 | 版本无要求，安装请参考 IoTDB [部署指导](https://www.timecho.com/docs/zh/UserGuide/latest/Deployment-and-Maintenance/IoTDB-Package_timecho.html) |
| JDK                   | 建议 JDK11 及以上版本（推荐部署 JDK17 及以上版本）           |
| DataEase              | 要求 v1 系列 v1.18 版本，安装请参考 DataEase 官网[安装指导](https://dataease.io/docs/v2/installation/offline_INSTL_and_UPG/)（暂不支持 v2.x，其他版本适配请联系天谋商务） |
| DataEase-IoTDB 连接器 | 请联系天谋商务获取                                           |

## 安装步骤

步骤一：请联系商务获取压缩包，解压缩安装包（ iotdb-api-source-1.0.0.zip ）

步骤二：解压后，修改`config`文件夹中的配置文件`application.properties`

- 端口`server.port`可以按需进行修改
- `iotdb.nodeUrls`需配置为待连接的 IoTDB 的实例的地址和端口
- `iotdb.user`需配置为 IoTDB 的用户名
- `iotdb.password`需配置为 IoTDB 的密码

```Properties
# 启动 IoTDB API Source 监听的端口
server.port=8097
# IoTDB 的实例地址，多个 nodeUrls 用 ; 分割
iotdb.nodeUrls=127.0.0.1:6667
# IoTDB 用户名
iotdb.user=root
# IoTDB 密码
iotdb.password=root
```

步骤三：启动  DataEase-IoTDB 连接器

- 前台启动

```Shell
./sbin/start.sh
```

- 后台启动（增加 -d 参数）

```Shell
./sbin/start.sh -d
```

步骤四：启动后可以通过日志来查看是否启动成功。 

```Shell
 lsof -i:8097  // config 里启动 IoTDB API Source 监听的端口
```

## 使用说明

### 登录 DataEase

1. 登录 DataEase，访问地址 : `http://目标服务器IP地址:80`
<div style="text-align: center;">
    <img src="https://alioss.timecho.com/docs/img/DataEase4.png" alt="" style="width: 70%;"/>
  </div>

### 配置数据源

1. 在导航条中跳转【数据源】界面
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase5.png" alt="" style="width: 70%;"/>
</div>

2. 点击左上角 【 + 】，滑动到底部，选择【API】数据源
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase6.png" alt="" style="width: 70%;"/>
</div>

3. 新建 API 数据源，自行设置基本信息中的【显示名称】，在数据表位置点击【添加】
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase7.png" alt="" style="width: 70%;"/>
</div>

4. 在数据表名称字段中输入自定义的【名称】，请求类型选择 `Post`，地址填写 `http://[IoTDB API Source]:[port]/getData`，如果在本机操作且使用的是默认端口，地址应填写`http://127.0.0.1:8097/getData`
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase8.png" alt="" style="width: 70%;"/>
</div>

5. 在【请求参数】部分，选择【请求体】标签页，并确保格式设置为 JSON。请按照以下示例填写参数，其中：
    timeseries：要查询的序列的完整路径（目前只支持查询一条序列）
    limit：需要查询的条数（有效范围为 大于 0 且 小于 100000）

    ```JSON
    { 
        "timeseries": "root.ln.wf03.wt03.speed",
        "limit": 1000
    }
    ```
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase9.png" alt="" style="width: 70%;"/>
</div>

6. 点击【认证配置】标签页，选择【Basic Auth】作为认证方式，并准确输入 IoTDB 的用户名和密码
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase10.png" alt="" style="width: 70%;"/>
</div>

7. 点击【下一步】，将在`data`部分看到接口返回结果。如下图展示接口中，返回了`time`、 `rownumber`和`value`信息，同时需要指定各字段数据类型。完成设置后，点击界面右下角的【保存】按钮。
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase11.png" alt="" style="width: 70%;"/>
</div>

8. 保存后进入新建 API 数据源页面，点击右上角【保存】按钮。
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase12.png" alt="" style="width: 70%;"/>
</div>

9. 保存数据源：保存后，可在 API 分类菜单下查看该数据源及其详细信息，或编辑该数据源。 
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase13.png" alt="" style="width: 70%;"/>
</div>

### 配置数据集

1. 创建 API 数据集：在导航条中跳转至数据集页面，点击页面左上角的 【 + 】 符号，选择【API 数据集】类型，选择此数据集所在的目录，即可进入新建 API 数据集页面。
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase14.png" alt="" style="width: 49%;"/>
  <img src="https://alioss.timecho.com/docs/img/DataEase15.png" alt="" style="width: 49%;"/>
</div>

2. 在新建 API 数据集页面，选择刚才新建的 API 数据源和包含在数据集中的对应数据表（下图左），并设置数据集名称（下图右）。设置完毕后，点击页面右上角的【保存】按钮以完成数据集的创建。
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase16.png" alt="" style="width: 49%;"/>
  <img src="https://alioss.timecho.com/docs/img/DataEase17.png" alt="" style="width: 49%;"/>
</div>

3. 选择刚刚创建的数据集，进入【字段管理】标签页，然后将所需的字段（如 rowNum）标记为维度。
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase18.png" alt="" style="width: 70%;"/>
</div>

4. 配置更新频率：在【更新信息】页面上点击【添加任务】，设置以下信息：

    任务名称：根据实际情况填写
    
    更新方式：选择【全量更新】
    
    执行频率：根据实际情况设置（考虑DataEase获取速度，建议设置为大于 5 秒更新一次），例如需要设置为每 5 秒更新，则可以选择【表达式设定】并在【cron 表达式】中设置为`0/5 * * * * ? *`
    配置完成后，点击页面右下角的【确认】按钮保存设置。 
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase19.png" alt="" style="width: 70%;"/>
</div>

5. 任务已成功添加。可以通过点击页面左上角的【执行记录】选项查看执行记录。
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase20.png" alt="" style="width: 70%;"/>
</div>

### 配置仪表板

1. 在导航条中跳转至仪表板页面，可以点击【 + 】符号新建目录，并且在对应目录，点击【 + 】符号，然后从弹出的菜单中选择【新建仪表板】
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase21.png" alt="" style="width: 70%;"/>
</div>

2. 按需进行设置后点击【确定】，以自定义设置为例，确定后进入新建仪表板页面
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase22.png" alt="" style="width: 70%;"/>
</div>

3. 在新建仪表板页面，点击【视图】按钮以打开添加视图的弹窗。在弹窗中，选择之前创建的数据集，然后点击【下一步】继续操作。
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase23.png" alt="" style="width: 70%;"/>
</div>

4. 在选择图表类型的步骤中，根据展示需求，选择一个合适的图表类型，如【基础折线图】。选择完毕后，点击【确认】按钮应用选择。
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase24.png" alt="" style="width: 70%;"/>
</div>

5. 在图表配置界面，通过拖放操作将`rowNum`字段拖拽到类别轴（通常是 X 轴），将`value`字段拖拽到值轴（通常是 Y 轴）。
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase25.png" alt="" style="width: 70%;"/>
</div>

6. 在图表的类别轴设置中，选择将排序方式设定为升序，这样数据将按照从小到大的顺序展示。设置数据刷新频率以确定图表更新的频率。完成这些设置后，您可以进一步调整图表的其他格式和样式选项，比如颜色、大小等，以满足展示需求。调整完后，点击页面右上角的【保存】按钮来保存图表配置。
>由于 DataEase 在自动更新数据集后可能会导致原本按升序返回的 API 数据顺序错乱，所以需要在图表配置中手动指定排序方式。
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase26.png" alt="" style="width: 70%;"/>
</div>

7. 退出编辑后查看效果
<div style="text-align: center;">
  <img src="https://alioss.timecho.com/docs/img/DataEase27.png" alt="" style="width: 70%;"/>
</div>