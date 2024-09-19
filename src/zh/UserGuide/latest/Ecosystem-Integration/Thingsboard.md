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

## 产品概述

1. ThingsBoard 简介

    ThingsBoard 是一个开源物联网平台，可实现物联网项目的快速开发、管理和扩展。更多介绍详情请参考[ ThingsBoard 官网](https://thingsboard.io/docs/getting-started-guides/what-is-thingsboard/)。

    ![](https://alioss.timecho.com/docs/img/ThingsBoard-1.PNG)

2. ThingsBoard-IoTDB 简介

    ThingsBoard-IoTDB 提供了将 ThingsBoard 中的数据存储到 IoTDB 的能力，也支持在 ThingsBoard 中读取 root.thingsboard 数据库下的数据信息。详细架构图如下图黄色标识所示。

### 关系示意图

![](https://alioss.timecho.com/docs/img/Thingsboard-2.png)

## 安装要求

| 准备内容                    | 版本要求                                                     |
| :-------------------------- | :----------------------------------------------------------- |
| JDK                         | 要求已安装 17 及以上版本，具体下载请查看 [Oracle 官网](https://www.oracle.com/java/technologies/downloads/) |
| IoTDB                       | 要求已安装 V1.3.0 及以上版本，具体安装过程请参考[部署指导](https://www.timecho.com/docs/zh/UserGuide/latest/Deployment-and-Maintenance/IoTDB-Package_timecho.html) |
| ThingsBoard（IoTDB 适配版） | 安装包请联系商务获取，具体安装步骤参见下文                   |

## 安装步骤

具体安装步骤请参考 [ThingsBoard 官网](https://thingsboard.io/docs/user-guide/install/ubuntu/)。其中：

- [ThingsBoard 官网](https://thingsboard.io/docs/user-guide/install/ubuntu/)中【步骤 2 ThingsBoard 服务安装】使用上方从商务获取的安装包进行安装（使用 ThingsBoard 官方安装包无法使用 iotdb）
- [ThingsBoard 官网](https://thingsboard.io/docs/user-guide/install/ubuntu/)中【步骤 3 配置 ThingsBoard 数据库-ThingsBoard 配置】步骤中需要按照下方内容添加环境变量

```Bash
# ThingsBoard 原有配置
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/thingsboard
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=PUT_YOUR_POSTGRESQL_PASSWORD_HERE ##修改为pg的密码

# 使用IoTDB需修改以下变量
export DATABASE_TS_TYPE=iotdb  ## 原配置为sql，将变量值改为iotdb


# 使用IoTDB需增加以下变量
export DATABASE_TS_LATEST_TYPE=iotdb
export IoTDB_HOST=127.0.0.1  ## iotdb所在的ip地址
export IoTDB_PORT:6667       ##  iotdb的端口号，默认为6667
export IoTDB_USER:root       ## iotdb的用户名，默认为root
export IoTDB_PASSWORD:root   ## iotdb的密码，默认为root
export IoTDB_CONNECTION_TIMEOUT:5000   ## iotdb超时时间设置
export IoTDB_FETCH_SIZE:1024   ## 单次请求所拉取的数据条数，推荐设置为1024
export IoTDB_MAX_SIZE:200      ##sessionpool内的最大数量，推荐设置为>=并发请求数
export IoTDB_DATABASE:root.thingsboard  ##thingsboard数据写入iotdb所存储的数据库，支持自定义
```

## 使用说明

1. 创建设备并接入数据：在 Thingsboard 的实体-设备中创建设备并通过工业网关将数据发送到 ThingsBoard 指定设备中

![](https://alioss.timecho.com/docs/img/ThingsBoard-3.PNG)

2. 设置规则链：在规则链库中对于“SD-032F 泵”设置告警规则并将该规则链设置为根链

  <div style="display: flex;justify-content: space-between;">           
    <img src="https://alioss.timecho.com/docs/img/ThingsBoard-4.PNG" alt=" " style="width: 50%;"/>
    <img src="https://alioss.timecho.com/docs/img/ThingsBoard-5.PNG" alt=" " style="width: 50%;"/>     
  </div>

3. 查看告警记录：对于产生的告警记录已经通过点击“设备-告警”来进行查看

![](https://alioss.timecho.com/docs/img/ThingsBoard-6.png)

4. 数据可视化：在“仪表板”中通过“新建仪表板-绑定设备-关联参数”进行可视化设置

 <div style="display: flex;justify-content: space-between;">           
    <img src="https://alioss.timecho.com/docs/img/ThingsBoard-7.png" alt=" " style="width: 50%;"/>
    <img src="https://alioss.timecho.com/docs/img/Thingsboard-10.png" alt=" " style="width: 50%;"/>     
  </div>

