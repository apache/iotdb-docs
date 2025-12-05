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

# DataGrip

## 1. 功能简介

DataGrip 是一款通用数据库管理工具，支持数据查询与可视化​、元数据管理​、数据导入导出、驱动扩展等核心特性，为多种数据库（如 MySQL、Redis、Oracle等）提供跨平台的图形化操作界面。

IoTDB 通过 JDBC 接口与 DataGrip 集成，支持像管理文件夹一样通过树形结构导航时序数据，同时支持连接其他数据库（如 MySQL、Oracle）进行跨库关联分析，有效提升了物联网场景下的时序数据管理能力。

![](/img/datagrip-1.png)

## 2. 前置条件

安装好 DataGrip、IoTDB：

- DataGrip 下载地址：https://www.jetbrains.com/datagrip/download/

- IoTDB 下载地址：https://iotdb.apache.org/Download/

## 3. 配置方式

### 3.1 下载驱动

选择对应版本的 jar 包，下载后缀 `jar-with-dependencies.jar` 的包：

- 链接 1：https://repo1.maven.org/maven2/com/timecho/iotdb/iotdb-jdbc/2.0.3.3/iotdb-jdbc-2.0.3.3-jar-with-dependencies.jar

- 链接 2：https://repo1.maven.org/maven2/com/timecho/iotdb/iotdb-jdbc/2.0.3.3/

![](/img/datagrip-2.png)

### 3.2 配置驱动

#### 步骤一：打开驱动管理器并新建驱动

1. 打开数据库工具打开左侧边栏 -> 点击`+`新建 。

2. 选择`驱动程序`按钮，开始创建新的驱动配置。

![](/img/datagrip-3.png)

#### 步骤二：配置驱动信息

1. 配置【驱动】信息，在创建新驱动程序窗口中，点击`+`新建按钮。

![](/img/datagrip-4.png)

2. 点击 驱动程序文件栏`+`新建按钮 -> 选择自定义JAR。

3. 选择下载好的 IoTDB JDBC 驱动文件（如 `iotdb-jdbc-2.0.5-jar-with-dependencies.jar`）。

4. 在常规栏下的类字段里选择目标JDBC驱动类`org.apache.iotdb.jdbc.IoTDBDriver`。

5. 填写驱动名称：IoTDB。

![](/img/datagrip-5.png)

6. 在选项栏下的连接选项下的保持活动查询字段里添加`show version`。

![](/img/datagrip-6.png)

7. 点击确定。

#### 步骤三：创建并测试连接

1. 左侧边栏点击`+`新建图标 -> 选择数据源 -> 选择上面新建的用户驱动程序。

![](/img/datagrip-7.png)

2. 填写驱动名称、注释。

3. 完善 JDBC URL，并填写 IoTDB 数据库的密码。

4. 点击`测试连接`按钮，如果连接成功，会提示`已成功`，并显示服务器版本和驱动版本。

![](/img/datagrip-8.png)

5. 点击架构->选择所有数据库/所有架构。

![](/img/datagrip-9.png)

6. 点击应用，确定。

## 4. 使用方式

1. 数据库和表结构概览

在界面左侧的`数据库导航`中，可以查看数据库相关信息，包括数据库名称、表名称、表comment、唯一键（time+tag 列）信息。

![](/img/datagrip-10.png)

2. 修改表信息/表结构

在数据库列表中右键某张表，可在界面右侧展示栏中修改对应的表信息。

![](/img/datagrip-11.png)

![](/img/datagrip-12.png)

3. 数据

在左侧栏选择目标表，双击表可以看到表的所有数据。

在左侧栏选择目标表，右键选择新建查询控制台，在查询控制台中写sql，点击执行按钮则可以进行sql操作。

![](/img/datagrip-13.png)

