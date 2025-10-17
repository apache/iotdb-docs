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

# Overview

IoTDB Ecosystem Integration Bridges the Full Pipeline of Time-Series Data:
- Through data collection, it enables second-level device connectivity.
- Via data integration, it constructs cross-cloud pipelines.
- Leveraging programming frameworks, it accelerates business logic development.
- With computing engines, it accomplishes distributed processing.
- Through visualization and SQL development, it implements analytical strategies.
- Finally, by interfacing with IoT platforms, it achieves edge-cloud synergy—building a complete intelligent closed loop from the physical world to digital decision-making.

![](/img/eco-overview-n-en.png)

The following documentation will help you quickly and comprehensively understand the usage of various integration tools at each stage:

- Data Acquisition
    - Telegraf [Telegraf Plugin](./Telegraf.md)
- Data Integration
    - NiFi [Apache NiFi](./NiFi-IoTDB.md)
    - Kafka [Kafka](./Programming-Kafka.md)
- Computing Engine
    - Flink [Flink](./Flink-IoTDB.md)
    - Spark [Spark](./Spark-IoTDB.md)
- Visual Analytics
    - Zeppelin [Zeppelin](./Zeppelin-IoTDB.md)
    - Grafana [Grafana](./Grafana-Connector.md)
    - Grafana Plugin [Grafana Plugin](./Grafana-Plugin.md)
    - DataEase [DataEase](./DataEase.md)
- SQL Development
    - DBeaver [DBeaver](./DBeaver.md)
- IoT Platform
    - Thingsboard [Thingsboard](./Thingsboard.md)