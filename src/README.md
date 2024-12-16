---
home: true
heroText: Apache IoTDB
heroImage: /img/logo.svg
tagline: Database for Internet of Things
actions:
  - text: Download
    link: ./Download/
    type: primary

  - text: Quick Start
    link: ./UserGuide/latest/QuickStart/QuickStart_apache.html

highlights:
  - header: Introduction
    description: Apache IoTDB (Database for Internet of Things) is an IoT native database with high performance for data management and analysis, deployable on the edge and the cloud. Due to its light-weight architecture, high performance and rich feature set together with its deep integration with Apache Hadoop, Spark and Flink, Apache IoTDB can meet the requirements of massive data storage, high-speed data ingestion and complex data analysis in the IoT industrial fields.

  - header: Main Features
    features:
      - title: High-throughput read and write
        details: Apache IoTDB can support high-speed write access for millions of low-power and intelligently networked devices. It also provides lightning read access for retrieving data.

      - title: Efficient directory structure
        details: Apache IoTDB can efficiently organize complex data structure from IoT devices and large size of timeseries data with fuzzy searching strategy for complex directory of timeseries data.

      - title: Rich query semantics
        details: Apache IoTDB can support time alignment for timeseries data across devices and sensors, computation in timeseries field and abundant aggregation functions in time dimension.

      - title: Low cost on hardware
        details: Apache IoTDB can reach a high compression ratio of disk storage (it costs less than $0.23 to store 1GB of data on hard disk).

      - title: Flexible deployment
        details: Apache IoTDB can provide users one-click installation on the cloud, terminal tool on desktop and the bridge tool between cloud platform and on premise machine (Data Synchronization Tool).

      - title: Intense integration with Open Source Ecosystem
        details: Apache IoTDB can support analysis ecosystems, for example, Hadoop, Spark, Flink and Grafana (visualization tool).
---

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
<HomeCarousel />

<script setup>
import HomeCarousel from '@source/.vuepress/components/HomeCarousel.vue'
</script>
