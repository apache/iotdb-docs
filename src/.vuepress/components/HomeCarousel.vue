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
        'The global energy transition accelerates power sector digitization. Enterprises deploy IoT and time-series databases to build smart energy systems, using real-time analytics for efficiency and security. IoTDB provides high-availability, low-bandwidth solutions to streamline data integration and energy transition.',
    },
    {
      src: '/img/scenario-aerospace-en.png',
      title: 'AeroSpace',
      detail:
        'Tech advances propel the digital-intelligent shift in aerospace. Enterprises integrate real-time telemetry and test data through lifecycle data management, ensuring precise monitoring and optimized designs. IoTDB delivers low-bandwidth sync and flexible deployment, delivering reliable data foundations for innovation and sustainable energy integration.',
    },
    {
      src: '/img/apache-home-scenarios-transportation-en.png',
      title: 'Transportation',
      detail:
        "Transportation leverages real-time vehicle data to drive smart scheduling and maintenance in railways/metro systems, ensuring real-time and reliable management for efficiency and cost reduction. IoTDB's time-series data processing with low-latency queries handles data surges and multi-source data flow, building a robust foundation for intelligent transport systems and enabling smarter automation.",
    },
    {
      src: '/img/apache-home-scenarios-steel-en.png',
      title: 'Steel & Metallurgy',
      detail:
        'The steel industry accelerates digital transformation using industrial IoT platforms for real-time production data analytics, boosting output, quality, and energy efficiency. IoTDB, a high-efficiency time-series database, enables cross-platform deployment with low resource use and seamless system integration via APIs, driving smart factories and industrial productivity growth.',
    },
    {
      src: '/img/apache-home-scenarios-iot-en.png',
      title: 'IoT',
      detail:
        "IoT enables smart industry operations via mass device connectivity and data analytics, driving efficient real-time scalable data management for monitoring and diagnostics. IoTDB, a native time-series database, supports edge-cloud sync and high-concurrency processing, empowering enterprises to unlock data value and advance IoT solutions.",
    },
  ],
  '/zh/': [
    {
      src: '/img/apache-home-scenarios-energy.png',
      title: '能源电力',
      detail:
        '全球能源变革驱动电力行业数字化转型，企业依托物联网与时序数据库技术升级智慧能源系统，通过全环节数据实时采集分析提升能效、保障电网安全。IoTDB以高可用集群、低流量同步、跨网闸支持及高性能优势，提供自主可控的时序数据管理方案，支撑企业应对海量数据挑战，推动传统能源与可再生能源高效整合。',
    },
    {
      src: '/img/apache-home-scenarios-areo.png',
      title: '航空航天',
      detail:
        '科技进步驱动航空航天数字化智能化转型，企业通过全周期数据管理整合实时遥测与试飞数据，实现关键系统精准监测，推动设计优化与安全管控。IoTDB以国产自研技术优势，通过高效低流量同步、离线迁移、灵活部署及低资源占用特性，为行业构建可靠数据底座，支撑技术创新与可持续发展。',
    },
    {
      src: '/img/apache-home-scenarios-transportation.png',
      title: '交通运输',
      detail:
        "交通运输行业依托实时车辆数据采集分析，驱动铁路、地铁等核心场景的智能调度与高效运维，满足高实时、高可靠管理需求，实现提效降本。IoTDB凭借高效时序数据处理及低延迟查询能力，应对数据爆发增长，支撑多源异构数据流转，为构建稳定可靠的智能交通系统提供技术底座，助力行业智能化与自动化升级。",
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
        "物联网通过海量设备互联与智能数据分析重构行业运营，驱动高效实时、稳定可扩展的数据管理系统，支撑设备监测与故障诊断等核心应用。IoTDB作为原生时序数据库，提供边缘到云端的全链路数据同步及分析能力，高并发处理特性适配大规模设备接入，为企业挖掘数据价值、提升运营效率提供灵活解决方案，推动物联网业务全面发展",
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
