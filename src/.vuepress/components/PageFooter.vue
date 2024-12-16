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
import { computed } from 'vue';
import { usePageData } from 'vuepress/client';
import { getDocVersion } from '../utils/index.js';

const pageData = usePageData();

const docVersion = computed(() => getDocVersion(pageData.value.path));

const locale = useLocaleConfig({
  '/': {
    copyright:
      'Copyright © :year: The Apache Software Foundation.\nApache IoTDB, IoTDB, Apache, the Apache feather logo, and the Apache IoTDB project logo are either registered trademarks or trademarks of The Apache Software Foundation in all countries',
    question: 'Having questions?',
    join: 'Connect with us on QQ, WeChat, or Slack.',
    joinLink: 'Join the community',
  },
  '/zh/': {
    copyright:
      '版权所有 © :year: Apache软件基金会。\nApache IoTDB，IoTDB，Apache，Apache 羽毛标志和 Apache IoTDB 项目标志是 Apache 软件基金会在所有国家的注册商标或商标',
    question: '有问题吗？',
    join: '在 QQ、微信或 Slack 上联系我们。',
    joinLink: '立即加入社区',
  },
});

const copyrightText = computed(() =>
  locale.value.copyright.replace(
    /:year:/g,
    new Date().getFullYear().toString(),
  ),
);
</script>

<template>
  <footer class="site-footer">
    <span
      id="doc-version"
      style="display: none"
    >{{ docVersion }}</span>
    <p class="copyright-text">
      {{ copyrightText }}
    </p>
    <p
      style="
        text-align: center;
        margin-top: 10px;
        color: #909399;
        font-size: 12px;
        margin: 0 30px;
      "
    >
      <strong>{{ locale.question }}</strong> {{ locale.join }}
      <a href="https://github.com/apache/iotdb/issues/1995">{{
        locale.joinLink
      }}</a>
    </p>
  </footer>
</template>

<style lang="scss">
.site-footer {
  padding-bottom: 2rem;

  .copyright-text {
    text-align: center;
    color: #909399;
    font-size: 12px;
    margin: 0 30px;
  }
}
</style>
