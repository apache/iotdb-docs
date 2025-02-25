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

## 企业版获取方式

企业版安装包可通过产品试用申请，或直接联系与您对接的商务人员获取。

## 安装包结构

解压后安装包（iotdb-enterprise-{version}-bin.zip），安装包解压后目录结构如下：

| **目录**         | **类型** | **说明**                                                     |
| ---------------- | -------- | ------------------------------------------------------------ |
| activation       | 文件夹   | 激活文件所在目录，包括生成的机器码以及从商务侧获取的企业版激活码（启动ConfigNode后才会生成该目录，即可获取激活码） |
| conf             | 文件夹   | 配置文件目录，包含 ConfigNode、DataNode、JMX 和 logback 等配置文件 |
| data             | 文件夹   | 默认的数据文件目录，包含 ConfigNode 和 DataNode 的数据文件。（启动程序后才会生成该目录） |
| lib              | 文件夹   | IoTDB可执行库文件目录                                        |
| licenses         | 文件夹   | 开源社区证书文件目录                                         |
| logs             | 文件夹   | 默认的日志文件目录，包含 ConfigNode 和 DataNode 的日志文件（启动程序后才会生成该目录） |
| sbin             | 文件夹   | 主要脚本目录，包含启、停等脚本等                             |
| tools            | 文件夹   | 系统周边工具目录                                             |
| ext              | 文件夹   | pipe，trigger，udf插件的相关文件（需要使用时用户自行创建）   |
| LICENSE          | 文件     | 证书                                                         |
| NOTICE           | 文件     | 提示                                                         |
| README_ZH\.md     | 文件     | markdown格式的中文版说明                                     |
| README\.md        | 文件     | 使用说明                                                     |
| RELEASE_NOTES\.md | 文件     | 版本说明                                                     |
