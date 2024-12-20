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
      src: '/img/home-Slide1.png',
      title: 'High-end equipment',
      detail:
        ' In high-end manufacturing, there are many devices equipped with sensors collecting working status data.Meteorological stations, wind turbines are common high-end devices.These devices, if supports Java or Go (in development), can run TsFile to store data locally.In this way, TsFile can provide the ability to save data with high throughput, high compression ratio, and millisecond query.Together with TsFile-Sync tool, TsFiles can be transmitted to the data center.',
    },
    {
      src: '/img/home-Slide2.png',
      title: 'Local Controller',
      detail:
        'In the scene of factories, there are tens of devices under LAN network. IoTDB can be installed on a local controller server in the factory to receive data from those devices. The local controller server (normal PC or workstation) with IoTDB can provide the ability to persist data and query data with SQL-like interface. In addition, with TsFile-Sync tool, TsFiles on the local controller can be transmitted to the data center equipped with IoTDB instance in the cloud.',
    },
    {
      src: '/img/home-Slide3.png',
      title: 'Cloud Data Management',
      detail:
        "In the scene of high-speed networks (Internet of Vehicles, etc.), a car installed of sensors, can collect monitoring information (driving status, etc.) of itself at a certain frequency. Usually, these automotive devices have limited hardware configurations and are difficult to carry complex applications. Here, lightweight IoTDB(IoTDB Client) came into being. IoTDB's JDBC API can make data that can be sent through narrow-band IoT networks or 4G whichever is possible. In this way, devices and cloud are connected together.",
    },
  ],
  '/zh/': [
    {
      src: '/img/home-Slide1.png',
      title: '高端设备',
      detail:
        '在高端制造业中，有很多设备配备有传感器来收集工作状态数据，例如气象站，风力涡轮机是常见的高端设备。这些设备如果支持Java或Go（正在开发中），则可以运行TsFile在本地存储数据。通过这种方式，TsFile可以提供具有高吞吐、高压缩率和毫秒级查询延迟的数据管理功能。结合TsFile-Sync工具，可以将TsFiles同步到数据中心。',
    },
    {
      src: '/img/home-Slide2.png',
      title: '本地控制器',
      detail:
        '在工厂现场，LAN网络下有数十台设备。 IoTDB可以安装在工厂的本地控制器服务器上，以从这些设备接收数据。 安装有IoTDB的本地服务器（普通PC或工作站）可以使用类SQL存储和查询数据。 此外，使用TsFile-Sync工具，可以将本地控制器上的TsFile文件传输到云上安装有IoTDB实例的数据中心。',
    },
    {
      src: '/img/home-Slide3.png',
      title: '云数据管理',
      detail:
        '在高速网络（车联网等）的场景中，安装有传感器的汽车可以以一定频率收集自身的监视信息（行驶状态等）。 通常，这些汽车设备的硬件配置有限，并且难以进行复杂的应用。 轻量级的IoTDB（IoTDB客户端）应运而生。 借助JDBC API（或MQTT），它可以使用窄带IoT或4G/5G发送数据，从而将设备和云连接在一起。',
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
