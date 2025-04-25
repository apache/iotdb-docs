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
import { committers, mentors } from '../utils/index.js';

const locale = useLocaleConfig({
  '/': {
    mentors: 'Project Mentors',
    committers: 'Project Committers',
  },
  '/zh/': {
    mentors: '项目导师',
    committers: '项目贡献者',
  },
});
</script>

<template>
  <h2 style="text-align: center">
    {{ locale.mentors }}
  </h2>
  <div
    v-for="item in mentors"
    :key="item.id"
    class="box"
  >
    <img
      :src="item.avatar"
      alt=""
    >
    <div class="right">
      <p class="con-name">
        {{ item.name }}
      </p>
      <div class="con-detailed-info">
        <p>{{ item.role }}</p>
      </div>
      <div class="con-apache-info">
        <p class="con-id">
          Apache ID: {{ item.id }}
        </p>
        <p class="con-date">
          Starting date: {{ item.date }}
        </p>
      </div>
    </div>
  </div>

  <h2 style="text-align: center">
    {{ locale.committers }}
  </h2>
  <div
    v-for="item in committers"
    :key="item.id"
    class="box"
  >
    <img
      :src="item.avatar"
      alt=""
    >
    <div class="right">
      <p class="con-name">
        {{ item.name }}
      </p>
      <div class="con-detailed-info">
        <p>{{ item.role }}</p>
      </div>
      <div class="con-apache-info">
        <p class="con-id">
          Apache ID: {{ item.id }}
        </p>
        <p class="con-date">
          Starting date: {{ item.date }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.box {
  width: 50%;
  height: 200px;
  display: inline-block;
  vertical-align: top;
  text-align: center;
}

img {
  vertical-align: top;
  margin-right: 20px;
  display: inline-block;
  width: 100px;
  height: 120px;
}

.right {
  display: inline-block;
  font-size: 14px;
  height: 120px;
  width: 180px;
  padding: 0;
}

.con-detailed-info p {
  margin: 0;
  line-height: 10px;
}

.con-detailed-info {
  margin-bottom: 10px;
}

.con-apache-info p {
  margin: 0;
  color: #888;
}

.con-name {
  font-size: 16px;
  font-weight: 500;
}
</style>
