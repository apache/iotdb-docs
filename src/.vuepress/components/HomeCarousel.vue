<!-- 
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
-->

<script setup lang="ts">
import { useLocaleConfig } from '@vuepress/helper/client';
import { Carousel, Slide, Navigation } from 'vue3-carousel';
import 'vue3-carousel/dist/carousel.css';

const config = {
  autoplay: 5000,
  wrapAround: true,
  pauseAutoplayOnHover: true,
};

const title = useLocaleConfig({
  '/': 'Scenarios',
  '/zh/': '应用场景',
});

const slidesData = useLocaleConfig({
  '/': [
    {
      src: '/img/apache-home-scenarios-energy-en.png',
      title: 'Energy & Power',
      detail:
        ' With the rapid transformation of the global energy landscape, the energy and power industry is advancing digitalization and intelligent transformation. Enterprises are upgrading from traditional power grids to smart energy systems by leveraging IoT and time-series database technologies. Through the collection, analysis, and real-time monitoring of time-series data across all stages of power production, transmission, storage, and consumption, they enhance energy efficiency, reduce costs, and ensure grid security. IoTDB, with its high-availability clusters, low-traffic synchronization, cross-network gate support, and superior performance, provides a self-reliant and controllable time-series data management solution. This supports enterprises in tackling massive data challenges and promotes the efficient integration of traditional and renewable energy resources.',
    },
    {
      src: '/img/scenario-aerospace-en.png',
      title: 'AeroSpace',
      detail:
        'In recent years, technological advancements have accelerated the digitalization and intelligent development of the aerospace sector. Data acquisition and processing technologies have become core means of enhancing flight safety and system performance. By efficiently managing time-series data throughout the entire lifecycle of aircraft, enterprises can achieve precise monitoring and analysis of critical systems. This, combined with real-time telemetry data transmission and rapid test flight data import, drives design optimization and safety control. Leveraging its domestically developed technological strengths, IoTDB provides a reliable data foundation for the industry through efficient low-traffic synchronization, offline migration, flexible deployment, and low resource consumption, supporting technological innovation and sustainable development.',
    },
    {
      src: '/img/apache-home-scenarios-transportation-en.png',
      title: 'Transportation',
      detail:
        "The rapid development of the transportation industry has intensified the demand for diversified data management, particularly in critical hubs like railways and subways, where real-time performance, reliability, and accuracy are paramount. By real-time collection and analysis of multi-dimensional data (e.g., operational status, location), enterprises achieve intelligent scheduling, fault prediction, and efficient maintenance, enhancing system efficiency while reducing costs. Leveraging its high-performance time-series data processing and low-latency query capabilities, IoTDB addresses explosive data growth, supports heterogeneous data integration, and provides a robust foundation for building intelligent transportation systems, driving the industry toward automation and smart transformation.",
    },
    {
      src: '/img/apache-home-scenarios-steel-en.png',
      title: 'Steel & Metallurgy',
      detail:
        'The steel smelting industry is accelerating digital transformation by deploying industrial IoT platforms to enable real-time data collection and analysis across production processes. This enhances capacity, optimizes product quality, and reduces energy consumption. IoTDB, with its robust data storage, computational capabilities, and flexible deployment (cross-platform support, low resource consumption), provides integrated solutions through extensive interfaces. It drives smart factory development and empowers traditional industries to cultivate new productive forces.',
    },
    {
      src: '/img/apache-home-scenarios-iot-en.png',
      title: 'IoT',
      detail:
        "The Internet of Things (IoT) is profoundly transforming industry operations through massive device connectivity and intelligent data-driven management. As IoT devices proliferate, data management systems must deliver efficient processing, storage, and analytical capabilities to ensure real-time performance, stability, and scalability for core applications like device monitoring and predictive maintenance. As a native time-series database, IoTDB enables end-to-edge synchronization and analysis from edge devices to the cloud. With high-concurrency processing, it supports large-scale device integration, offering enterprises flexible solutions to unlock data value, enhance operational efficiency, and accelerate IoT-driven business growth.",
    },
  ],
  '/zh/': [
    {
      src: '/img/apache-home-scenarios-energy.png',
      title: '能源电力',
      detail:
        '随着全球能源格局加速变革，能源电力行业正推进数字化与智能化转型。企业通过物联网和时序数据库技术，实现从传统电网向智慧能源升级，依托电力全环节时序数据采集、分析与系统实时监控，提升能效、降低成本并保障电网安全。IoTDB以高可用集群、低流量同步、跨网闸支持及高性能优势，提供自主可控的时序数据管理方案，支撑企业应对海量数据挑战，推动传统能源与可再生能源高效整合。',
    },
    {
      src: '/img/apache-home-scenarios-areo.png',
      title: '航空航天',
      detail:
        '近年来，科技进步加速航空航天领域数字化与智能化发展，数据采集处理技术成为提升飞行安全与系统性能的核心手段。通过高效管理飞行器全生命周期时序数据，企业可实现关键系统精准监测分析，结合遥测实时回传与试飞数据快速导入，推动设计优化与安全管控。IoTDB以国产自研技术优势，通过高效低流量同步、离线迁移、灵活部署及低资源占用特性，为行业构建可靠数据底座，支撑技术创新与可持续发展。',
    },
    {
      src: '/img/apache-home-scenarios-transportation.png',
      title: '交通运输',
      detail:
        "交通运输行业快速发展催生了对多样化数据管理的迫切需求，尤其在铁路、地铁等核心枢纽中，实时性、可靠性和精准性至关重要。通过实时采集和分析车辆运行状态、位置等多维数据，企业可实现智能调度、故障预警与高效运维，提升系统效率并降低管理成本。IoTDB凭借高效时序数据处理及低延迟查询能力，应对数据爆发增长，支撑多源异构数据流转，为构建稳定可靠的智能交通系统提供技术底座，助力行业智能化与自动化升级。",
    },
    {
      src: '/img/apache-home-scenarios-steel.png',
      title: '钢铁冶炼',
      detail:
        '钢铁冶炼行业加速数字化转型，依托工业物联网平台实现生产全流程实时数据采集与分析，助力产能提升、质量优化与能耗降低。IoTDB凭借高效数据存储、计算能力及灵活部署特性，提供跨平台支持与低资源占用的解决方案，并通过丰富接口实现系统高效集成，推动智慧工厂建设，赋能传统工业新质生产力发展。',
    },
    {
      src: '/img/apache-home-scenarios-iot.png',
      title: '物联网通用',
      detail:
        "物联网（IoT）正深刻重塑行业运营模式，通过海量设备互联与数据深度分析实现智能管理。随着设备规模激增，数据管理系统需具备高效处理、存储和分析能力，满足实时性、稳定性和可扩展性需求，以支撑设备监测、故障诊断等核心应用。IoTDB作为原生时序数据库，提供边缘到云端的全链路数据同步及分析能力，高并发处理特性适配大规模设备接入，为企业挖掘数据价值、提升运营效率提供灵活解决方案，推动物联网业务全面发展。",
    },
  ],
});
</script>

<template>
  <div class="vp-feature-bg light" style="background-image: url('/bg.svg'); background-attachment: fixed;" />
  <div class="vp-feature-bg dark" style="background-image: url('/bg.svg'); background-attachment: fixed;" />
  <div class="vp-feature" style="max-width: unset;">
    <h2 class="vp-feature-header" style="margin-top: 0 !important; padding-top: 0 !important; color: var(--vp-c-accent-bg) !important;">
      {{ title }}
    </h2>
    <Carousel v-bind="config">
      <Slide v-for="item in slidesData" :key="item.title">
        <div>
          <img class="slide-image" :src="item.src" alt="">
          <h3 class="slide-title">
            {{ item.title }}
          </h3>
          <p class="slide-description">
            {{ item.detail }}
          </p>
        </div>
      </Slide>

      <template #addons>
        <Navigation />
      </template>
    </Carousel>
  </div>
</template>
<style lang="scss">
.slide-image {
  width: 80%;
  height: auto;
}

.slide-title {
  font-size: 30px;
  text-align: center;
  line-height: normal;
}

.slide-description {
  font-weight: bold;
  font-size: 18px;
  line-height: 22px;
  text-align: justify !important;
  padding: 15px;
  padding: 0 30rem;
}
@media screen and (max-width: 768px) {
  .slide-description {
    padding: 0 1rem;
  }
  
}
</style>
