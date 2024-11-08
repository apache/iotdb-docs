/*
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
 */

  import { navbar } from 'vuepress-theme-hope';

  export const enNavbar = navbar([
    {
      text: 'Home',
      link: '/',
    },
    {
      text: 'Product',
      link: '/product',
    },
    {
      text: 'Documentation',
      children: [
        { text: 'latest', link: '/UserGuide/latest/QuickStart/QuickStart_timecho' },
        { text: 'v1.1.x', link: '/UserGuide/V1.1.x/QuickStart/QuickStart' },
        { text: 'v1.0.x', link: '/UserGuide/V1.0.x/QuickStart/QuickStart' },
        { text: 'v0.13.x', link: '/UserGuide/V0.13.x/QuickStart/QuickStart' },
      ],
    },
    {
      text: 'News',
      link: '/categories/news',
    },
    {
      text: 'Blogs',
      link: '/categories/blogs',
    },
    {
      text: 'About',
      link: '/aboutus',
    },
  ]);
  