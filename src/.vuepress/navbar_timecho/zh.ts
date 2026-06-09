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
    text: '首页',
    link: 'https://www.timecho.com/',
    target: '_self',
  },
  {
    text: '产品',
    link: 'https://www.timecho.com/product',
    target: '_self',
  },
  {
    text: '文档',
    link: 'https://www.timecho.com/docs/zh/latest-Table/QuickStart/QuickStart_timecho.html',
    target: '_self',
    children: [
      {
        text: 'v2.0.x',
        link: '/zh/UserGuide/latest-Table/QuickStart/QuickStart_timecho',
      },
      {
        text: 'v1.3.x',
        link: '/zh/UserGuide/V1.3.x/QuickStart/QuickStart_timecho',
      },
      { text: 'v1.2.x', link: '/zh/UserGuide/V1.2.x/QuickStart/QuickStart' },
      { text: 'v0.13.x', link: '/zh/UserGuide/V0.13.x/QuickStart/QuickStart' },
      { text: '发布历史', link: '/zh/UserGuide/latest-Table/IoTDB-Introduction/Release-history_timecho.html' }
    ],
  },
  {
    text: '新闻',
    link: 'https://www.timecho.com/categories/news',
    target: '_self',
  },
  {
    text: '博客',
    link: 'https://www.timecho.com/categories/blogs',
    target: '_self',
  },
  {
    text: '关于我们',
    link: 'https://www.timecho.com/aboutus',
    target: '_self',
  },
]);
