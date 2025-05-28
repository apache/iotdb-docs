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

# DBeaver(IoTDB)

## 1. 功能简介

DBeaver 是一款开源的通用数据库管理工具，支持数据查询与可视化​、元数据管理​、数据导入导出、驱动扩展等核心特性，为多种数据库（如 MySQL、PostgreSQL、Oracle等）提供跨平台的图形化操作界面。

![](/img/dbeaver-new-1.png)

## 2. 前置条件

安装好 DBeaver、IoTDB：

- DBeaver 下载地址：https://dbeaver.io/download/

- IoTDB 下载地址：https://iotdb.apache.org/Download/

## 3. 配置方式

### 3.1 下载驱动

选择对应版本的 jar 包，下载后缀 `jar-with-dependencies.jar` 的包：

- 链接 1：https://repo1.maven.org/maven2/com/timecho/iotdb/iotdb-jdbc/2.0.3.3/iotdb-jdbc-2.0.3.3-jar-with-dependencies.jar

- 链接 2：https://repo1.maven.org/maven2/com/timecho/iotdb/iotdb-jdbc/2.0.3.3/

![](/img/dbeaver-new-2.png)

### 3.2 配置驱动

#### 步骤一：打开驱动管理器并新建驱动

1. 打开数据库工具导航到`数据库` -> `驱动管理器`。

![](/img/dbeaver-new-3.png)

2. 点击`新建`按钮，开始创建新的驱动配置。

![](/img/dbeaver-new-4.png)

#### 步骤二：配置驱动信息

1. 配置【库】信息，在创建新驱动窗口中，点击`添加文件`按钮。

2. 选择下载好的 IoTDB JDBC 驱动文件（如 `iotdb-jdbc-2.0.3-jar-with-dependencies.jar`）。

3. 点击`找到类`按钮，自动识别驱动类。

![](/img/dbeaver-new-5.png)

4. 填写以下驱动设置信息：

  - 驱动名称：IoTDB
  - 类名：org.apache.iotdb.jdbc.IoTDBDriver
  - URL 模版：jdbc:iotdb://{host}:{port}/
  - 默认端口：6667
  - 默认用户：root

  ![](/img/dbeaver-new-6.png)

#### 步骤三：创建并测试连接

1. 点击`创建连接`图标。

2. 在搜索框中输入 `IoTDB`，并选择。点击`下一步`，选择 `URL` 的连接方式。

 ![](/img/dbeaver-new-7.png)

3. 完善 `JDBC URL`，并填写 IoTDB 数据库的密码。树模型可以选择`主机`的连接方式。

 ![](/img/dbeaver-new-8-tree.png)

4. 点击`测试连接`按钮，如果连接成功，会提示`已连接`，并显示服务器版本和驱动版本。

 ![](/img/dbeaver-new-9.png)

 ![](/img/dbeaver-new-10.png)

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