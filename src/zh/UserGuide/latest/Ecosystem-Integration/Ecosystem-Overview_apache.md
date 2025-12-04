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

# 概览

IoTDB 生态集成打通时序数据全链路：通过数据采集实现设备秒级接入，经数据集成构建跨云管道，依托编程框架快速开发业务逻辑，结合计算引擎完成分布式处理，通过可视化与 SQL 开发实现分析策略，最终对接物联网平台完成边云协同，构建从物理世界到数字决策的完整智能闭环。

![](/img/eco-overview-n.png)

下面的文档将会帮助您快速详细的了解各个阶段不同集成工具的使用方式：

- 数据采集
  - Telegraf [Telegraf 插件](./Telegraf.md)
- 数据集成
  - NiFi [Apache NiFi](./NiFi-IoTDB.md)
  - Kafka [Kafka](./Programming-Kafka.md)
- 计算引擎
  - Flink [Flink](./Flink-IoTDB.md)
  - Spark [Spark](./Spark-IoTDB.md)
- 可视化分析
  - Zeppelin [Zeppelin](./Zeppelin-IoTDB_apache.md)
  - Grafana [Grafana](./Grafana-Connector.md)
  - Grafana Plugin [Grafana Plugin](./Grafana-Plugin.md)
  - DataEase [DataEase](./DataEase.md)
- SQL 开发
  - DBeaver [DBeaver](./DBeaver.md)
- 物联网对接 
  - Thingsboard [Thingsboard](./Thingsboard.md)