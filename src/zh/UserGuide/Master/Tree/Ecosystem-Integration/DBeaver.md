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

## 1. 功能简介

DBeaver 是一款开源的通用数据库管理工具，支持数据查询与可视化​、元数据管理​、数据导入导出、驱动扩展等核心特性，为多种数据库（如 MySQL、PostgreSQL、Oracle等）提供跨平台的图形化操作界面。

![](/img/dbeaver-2520-1.png)

## 2. 前置条件

安装好 DBeaver、IoTDB：

- DBeaver（>= V25.2.0），下载地址：https://dbeaver.io/download/

- IoTDB 已启动，下载地址：https://iotdb.apache.org/Download/

## 3. 创建连接

1. 点击 DBeaver > 数据库 > 新建数据库连接，或者直接点击左上角图标

![](/img/dbeaver-2520-2.png)

2. 选择 IoTDB 驱动（可在 All 或 Timeseries 分类中找到）

![](/img/dbeaver-2520-3.png)

3. 完善连接设置，并根据要连接的 IoTDB 是树模型或表模型，选择不同的连接方式

![](/img/dbeaver-2520-4.png)

4. 测试连接（请选择适配版本的驱动文件）。如果连接成功，会提示已连接，并显示服务器版本和驱动版本。

![](/img/dbeaver-2520-5.png)

## 4. 使用方式

1. 数据库概览

在界面左侧的`数据库导航`中，可以查看数据库相关信息，包括数据库名称、设备名称、测点名称以及测点类型。

 ![](/img/dbeaver-new-tree-1.png)

 2. 设备及测点

在左侧数据库列表中，双击选中某个设备，界面右侧将展示该设备的基本属性信息，在`列`标签中可查看测点的详细信息。

 ![](/img/dbeaver-new-tree-2.png)

 3. 数据

在右侧界面切换到`数据`页签，即可查看该测点存储的全部数据。

 ![](/img/dbeaver-new-tree-3.png)

 4. 函数与数据类型

在`数据库导航`下的`存储过程`页签中，可以查看数据库支持的所有函数；

 ![](/img/dbeaver-new-tree-4.png)

 在`数据类型`页签中，可以查看数据库当前支持的所有数据类型。

 ![](/img/dbeaver-new-tree-5.png) 