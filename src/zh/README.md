---
containerClass: home
home: true
icon: home
heroText: Apache IoTDB
heroImage: /img/logo.svg
bgImage: bg.svg
bgImageDark: bg.svg
bgImageStyle:
  background-attachment: fixed
heroFullScreen: true
tagline: Apache IoTDB（物联网数据库）是一体化收集、存储、管理与分析物联网时序数据的软件系统。Apache IoTDB 采用轻量式架构，具有高性能和丰富的功能，并与 Apache Hadoop、Spark 和 Flink 等进行了深度集成，可以满足工业物联网领域的海量数据存储、高速数据读取和复杂数据分析需求。

actions:
  - text: 下载
    link: ./Download/
    type: primary

  - text: 快速上手
    link: ./UserGuide/latest/QuickStart/QuickStart_apache

# highlights:
  # - header: 介绍
  #   description: Apache IoTDB（物联网数据库）是一体化收集、存储、管理与分析物联网时序数据的软件系统。Apache IoTDB 采用轻量式架构，具有高性能和丰富的功能，并与 Apache Hadoop、Spark 和 Flink 等进行了深度集成，可以满足工业物联网领域的海量数据存储、高速数据读取和复杂数据分析需求。

highlights:
  - header: 主要特点
    bgImage: /bg.svg
    bgImageDark: /bg.svg
    bgImageStyle:
      background-attachment: fixed
    features:
      - title: 高吞吐量读写
        details: Apache IoTDB 中可以支持数百万个低功耗和智能联网设备的高速写访问。 它还提供数据快速读取访问以查询。

      - title: 高效的目录结构
        details: Apache IoTDB 可以对拥有复杂组织关系的物联网设备进行树形结构管理，并使用通配符对这些元数据进行模糊匹配。

      - title: 丰富的查询语义
        details: Apache IoTDB 可以支持跨设备和传感器的时间对齐查询，在时间维度上的聚合（降采样）等。

      - title: 低硬件成本
        details: Apache IoTDB 可以实现磁盘存储的高压缩率。

      - title: 部署灵活
        details: Apache IoTDB 可以为用户提供云上的一键式安装、终端访问工具以及边-云之间的协同（数据同步工具）。

      - title: 与开源生态系统的紧密集成
        details: Apache IoTDB 支持许多大数据软件生态系统，例如Hadoop、Spark、Flink和Grafana（可视化工具）


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
