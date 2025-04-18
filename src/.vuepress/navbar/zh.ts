/*
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
 */

import { navbar } from 'vuepress-theme-hope';

export const zhNavbar = navbar([
  {
    text: '文档',
    children: [
      // { text: 'latest', link: '/zh/UserGuide/Master/QuickStart/QuickStart_apache' },
      {
        text: 'v2.0.x',
        link: '/zh/UserGuide/latest/QuickStart/QuickStart_apache',
      },
      {
        text: 'v1.3.x',
        link: '/zh/UserGuide/V1.3.x/QuickStart/QuickStart_apache',
      },
      { text: 'v1.2.x', link: '/zh/UserGuide/V1.2.x/QuickStart/QuickStart' },
      { text: 'v0.13.x', link: '/zh/UserGuide/V0.13.x/QuickStart/QuickStart' },
    ],
  },
  {
    text: '系统设计',
    link: 'https://cwiki.apache.org/confluence/pages/viewpage.action?pageId=177051872',
  },
  {
    text: '下载',
    link: '/zh/Download/',
  },
  {
    text: '社区',
    children: [
      { text: '关于社区', link: '/zh/Community/About' },
      { text: '贡献指南', link: '/zh/Community/Development-Guide' },
      { text: '社区伙伴', link: '/zh/Community/Community-Partners' },
      { text: '交流与反馈', link: '/zh/Community/Feedback' },
      { text: '活动与报告', link: 'zh/Community/Events-and-Reports' },
      { text: 'Committers', link: '/zh/Community/Committers' },
    ],
  },
  {
    text: 'ASF',
    children: [
      { text: '基金会', link: 'https://www.apache.org/' },
      { text: '许可证', link: 'https://www.apache.org/licenses/' },
      { text: '安全', link: 'https://www.apache.org/security/' },
      {
        text: '赞助',
        link: 'https://www.apache.org/foundation/sponsorship.html',
      },
      { text: '致谢', link: 'https://www.apache.org/foundation/thanks.html' },
      { text: '活动', link: 'https://www.apache.org/events/current-event' },
      {
        text: '隐私',
        link: 'https://privacy.apache.org/policies/privacy-policy-public.html',
      },
    ],
  },
]);
