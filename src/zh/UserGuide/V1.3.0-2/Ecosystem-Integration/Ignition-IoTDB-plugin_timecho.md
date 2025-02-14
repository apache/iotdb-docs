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

## 产品概述

1. Ignition简介

    Ignition 是一个基于WEB的监控和数据采集工具（SCADA）- 一个开放且可扩展的通用平台。Ignition可以让你更轻松地控制、跟踪、显示和分析企业的所有数据，提升业务能力。更多介绍详情请参考[Ignition官网](https://docs.inductiveautomation.com/docs/8.1/getting-started/introducing-ignition)

2. Ignition-IoTDB Connector介绍

    Ignition-IoTDB Connector分为两个模块：Ignition-IoTDB连接器、Ignition-IoTDB With JDBC。其中：

    - Ignition-IoTDB 连接器：提供了将 Ignition 采集到的数据存入 IoTDB 的能力，也支持在Components中进行数据读取，同时注入了 `system.iotdb.insert`和`system.iotdb.query`脚本接口用于方便在Ignition编程使用
    - Ignition-IoTDB With JDBC：Ignition-IoTDB With JDBC 可以在 `Transaction Groups` 模块中使用，不适用于 `Tag Historian`模块，可以用于自定义写入和查询。

    两个模块与Ignition的具体关系与内容如下图所示。

    ![](/img/Ignition.png)

## 安装要求

| **准备内容**             | **版本要求**                                                 |
| :------------------------: | :------------------------------------------------------------: |
| IoTDB                    | 要求已安装V1.3.1及以上版本，安装请参考 IoTDB [部署指导](../Deployment-and-Maintenance/IoTDB-Package_timecho.md) |
| Ignition                 | 要求已安装 8.1.x版本（8.1.37及以上）的 8.1 版本，安装请参考 Ignition 官网[安装指导](https://docs.inductiveautomation.com/docs/8.1/getting-started/installing-and-upgrading)（其他版本适配请联系商务了解） |
| Ignition-IoTDB连接器模块 | 请联系商务获取                                               |
| Ignition-IoTDB With JDBC模块 | 下载地址：https://repo1.maven.org/maven2/org/apache/iotdb/iotdb-jdbc/ |

## Ignition-IoTDB连接器使用说明

### 简介

Ignition-IoTDB连接器模块可以将数据存入与历史数据库提供程序关联的数据库连接中。数据根据其数据类型直接存储到 SQL 数据库中的表中，以及毫秒时间戳。根据每个标签上的值模式和死区设置，仅在更改时存储数据，从而避免重复和不必要的数据存储。

Ignition-IoTDB连接器提供了将 Ignition 采集到的数据存入 IoTDB 的能力。

### 安装步骤

步骤一：进入 `Config` - `System`- `Modules` 模块，点击最下方的`Install or Upgrade a Module...`

![](/img/Ignition-IoTDB%E8%BF%9E%E6%8E%A5%E5%99%A8-1.PNG)

步骤二：选择获取到的 `modl`，选择文件并上传，点击 `Install`，信任相关证书。

![](/img/ignition-3.png)

步骤三：安装完成后可以看到如下内容

![](/img/Ignition-IoTDB%E8%BF%9E%E6%8E%A5%E5%99%A8-3.PNG)

步骤四：进入 `Config` - `Tags`- `History` 模块，点击下方的`Create new Historical Tag Provider...`

![](/img/Ignition-IoTDB%E8%BF%9E%E6%8E%A5%E5%99%A8-4.png)

步骤五：选择 `IoTDB`并填写配置信息

![](/img/Ignition-IoTDB%E8%BF%9E%E6%8E%A5%E5%99%A8-5.PNG)

配置内容如下：

<table>
<tbody>
<tr>             
    <th>名称</th>             
    <th>含义</th>                     
    <th>默认值</th> 
    <th>备注</th> 
  </tr>
  <tr>                                  
    <th colspan="4">Main</th>       
  </tr>
  <tr>             
    <td>Provider Name</td>             
    <td>Provider 名称</td>                     
    <td>-</td> 
    <td> </td> 
  </tr>
   <tr>             
    <td>Enabled</td>             
    <td> </td>                     
    <td>true</td> 
    <td>为 true 时才能使用该 Provider</td> 
  </tr>
  <tr>             
    <td>Description</td>             
    <td>备注</td>                     
    <td>-</td> 
    <td> </td> 
  </tr>
  <tr>                                  
    <th colspan="4">IoTDB Settings</th>       
  </tr>
  <tr>             
    <td>Host Name</td>             
    <td>目标IoTDB实例的地址</td>                     
    <td>-</td> 
    <td> </td> 
  </tr>
  <tr>             
    <td>Port Number</td>             
    <td>目标IoTDB实例的端口</td>                     
    <td>6667</td> 
    <td> </td> 
  </tr>
  <tr>             
    <td>Username</td>             
    <td>目标IoTDB的用户名</td>                     
    <td>-</td> 
    <td> </td> 
  </tr>
  <tr>             
    <td>Password</td>             
    <td>目标IoTDB的密码</td>                     
    <td>-</td> 
    <td> </td> 
  </tr>
  <tr>             
    <td>Database Name</td>             
    <td>要存储的数据库名称，以 root 开头，如 root.db</td>                     
    <td>-</td> 
    <td> </td> 
  </tr>
  <tr>             
    <td>Pool Size</td>             
    <td>SessionPool 的 Size</td>                     
    <td>50</td> 
    <td>可以按需进行配置</td> 
  </tr>
  <tr>                                  
    <th colspan="2">Store and Forward Settings</th> 
    <td>保持默认即可</td>
    <td> </td>
  </tr>
</tbody>
</table>


### 使用说明

#### 配置历史数据存储

- 配置好 `Provider` 后就可以在 `Designer` 中使用 `IoTDB Tag Historian` 了，就跟使用其他的 `Provider` 一样，右键点击对应 `Tag` 选择 `Edit tag(s)`，在 Tag Editor 中选择 History 分类

  ![](/img/ignition-7.png)

- 设置 `History Enabled` 为 `true`，并选择 `Storage Provider` 为上一步创建的 `Provider`，按需要配置其它参数，并点击 `OK`，然后保存项目。此时数据将会按照设置的内容持续的存入 `IoTDB` 实例中。

  ![](/img/ignition-8.png)

#### 读取数据

- 也可以在 Report 的 Data 标签下面直接选择存入 IoTDB 的 Tags

  ![](/img/ignition-9.png)

- 在 Components 中也可以直接浏览相关数据

  ![](/img/ignition-10.png)

#### 脚本模块：该功能能够与 IoTDB 进行交互

1. system.iotdb.insert：


- 脚本说明：将数据写入到 IoTDB 实例中

- 脚本定义： 
  ``` shell
  system.iotdb.insert(historian, deviceId, timestamps, measurementNames, measurementValues)
  ```

- 参数：

  - `str historian`：对应的 IoTDB Tag Historian Provider 的名称
  - `str deviceId`：写入的 deviceId，不含配置的 database，如 Sine
  - `long[] timestamps`：写入的数据点对于的时间戳列表
  - `str[] measurementNames`：写入的物理量的名称列表
  - `str[][] measurementValues`：写入的数据点数据，与时间戳列表和物理量名称列表对应

- 返回值：无

- 可用范围：Client, Designer, Gateway

- 使用示例：

  ```shell
  system.iotdb.insert("IoTDB", "Sine", [system.date.now()],["measure1","measure2"],[["val1","val2"]])
  ```

2. system.iotdb.query：


- 脚本说明：查询写到 IoTDB 实例中的数据

- 脚本定义：
 ```shell
  system.iotdb.query(historian, sql)
  ```

- 参数：

  - `str historian`：对应的 IoTDB Tag Historian Provider 的名称
  - `str sql`：待查询的 sql 语句

- 返回值：
    查询的结果：`List<Map<String, Object>>`

- 可用范围：Client, Designer, Gateway
- 使用示例：

```shell
system.iotdb.query("IoTDB", "select * from root.db.Sine where time > 1709563427247")
```

## Ignition-IoTDB With JDBC

### 简介

 Ignition-IoTDB With JDBC提供了一个 JDBC 驱动，允许用户使用标准的JDBC API 连接和查询 lgnition-loTDB 数据库

### 安装步骤

 步骤一：进入 `Config` - `Databases` -`Drivers` 模块，创建 `Translator`

![](/img/Ignition-IoTDB%20With%20JDBC-1.png)

 步骤二：进入 `Config` - `Databases` -`Drivers` 模块，创建 `JDBC Driver`，选择上一步配置的 `Translator`并上传下载的 `IoTDB-JDBC`，Classname 配置为 `org.apache.iotdb.jdbc.IoTDBDriver`

![](/img/Ignition-IoTDB%20With%20JDBC-2.png)

步骤三：进入 `Config` - `Databases` -`Connections` 模块，创建新的 `Connections`，`JDBC Driver` 选择上一步创建的 `IoTDB Driver`，配置相关信息后保存即可使用

![](/img/Ignition-IoTDB%20With%20JDBC-3.png)

### 使用说明

#### 数据写入

 在`Transaction Groups`中的 `Data Source`选择之前创建的 `Connection`

- `Table name` 需设置为 root 开始的完整的设备路径
- 取消勾选 `Automatically create table`
- `Store timestame to` 配置为 time

不选择其他项，设置好字段，并 `Enabled` 后 数据会安装设置存入对应的 IoTDB

![](/img/%E6%95%B0%E6%8D%AE%E5%86%99%E5%85%A5-1.png)

#### 数据查询

- 在 `Database Query Browser` 中选择`Data Source`选择之前创建的 `Connection`，即可编写 SQL 语句查询 IoTDB 中的数据

![](/img/%E6%95%B0%E6%8D%AE%E6%9F%A5%E8%AF%A2-ponz.png)

