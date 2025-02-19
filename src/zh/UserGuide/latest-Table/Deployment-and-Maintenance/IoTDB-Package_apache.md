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
# 安装包获取
## 安装包获取方式

安装包可直接在Apache IoTDB官网获取：https://iotdb.apache.org/zh/Download/

## 安装包结构

解压后安装包（`apache-iotdb-<version>-all-bin.zip`），安装包解压后目录结构如下：

| **目录**         | **类型** | **说明**                                                     |
| ---------------- | -------- | ------------------------------------------------------------ |
| conf             | 文件夹   | 配置文件目录，包含 ConfigNode、DataNode、JMX 和 logback 等配置文件 |
| data             | 文件夹   | 默认的数据文件目录，包含 ConfigNode 和 DataNode 的数据文件。（启动程序后才会生成该目录） |
| lib              | 文件夹   | 库文件目录                                                   |
| licenses         | 文件夹   | 开源协议证书文件目录                                         |
| logs             | 文件夹   | 默认的日志文件目录，包含 ConfigNode 和 DataNode 的日志文件（启动程序后才会生成该目录） |
| sbin             | 文件夹   | 主要脚本目录，包含数据库启、停等脚本                         |
| tools            | 文件夹   | 工具目录                                                     |
| ext              | 文件夹   | pipe，trigger，udf插件的相关文件                             |
| LICENSE          | 文件     | 开源许可证文件                                               |
| NOTICE           | 文件     | 开源声明文件                                                 |
| README_ZH.md     | 文件     | 使用说明（中文版）                                           |
| README.md        | 文件     | 使用说明（英文版）                                           |
| RELEASE_NOTES.md | 文件     | 版本说明                                                     |
