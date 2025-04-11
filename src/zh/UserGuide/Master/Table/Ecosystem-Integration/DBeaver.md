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

DBeaver 是一个 SQL 客户端和数据库管理工具。DBeaver 可以使用 IoTDB 的 JDBC 驱动与 IoTDB 进行交互。

## 1. DBeaver 安装

* DBeaver 下载地址：https://dbeaver.io/download/

## 2. IoTDB 安装

* 方法1：下载 IoTDB 二进制版本
  * IoTDB 下载地址：https://iotdb.apache.org/Download/
  * 版本 >= 2.0.1
* 方法2：从 IoTDB 源代码编译
  * 源代码： https://github.com/apache/iotdb
  * 编译方法参见以上链接中的 README.md 或 README_ZH.md

## 3. 连接 IoTDB 与 DBeaver

1. 启动 IoTDB 服务

   ```shell
   ./sbin/start-server.sh
   ```
2. 启动 DBeaver

3. 新建 Database Connection

   1. 点击 DBeaver > Database > New Database Connection，或者直接点击左上角图标

   ![](/img/table-dbeaver-1.png)
   
   2. 选择 IoTDB 驱动（可在 All 或 Timeseries 分类中找到）

   ![](/img/table-dbeaver-2.png)

   3. 根据要连接的IoTDB是树模型或表模型，选择不同的连接方式（Username = Password = root）

       1. 欲连接树模型IoTDB，使用默认的Host方法进行连接即可，如下图所示

       ![](/img/table-dbeaver-3.png)

       2. 欲连接表模型IoTDB，使用URL方法连接，需在URL后面添加 ?sql_dialect=table 启用表模式

      ![](/img/table-dbeaver-4.png)

   4. 通过 Test Connection 测试连接，能够显示对应的IoTDB版本号即连接成功

   ![](/img/table-dbeaver-5.png)

4. 可以开始通过 DBeaver 使用 IoTDB

![](/img/table-dbeaver-6.png)