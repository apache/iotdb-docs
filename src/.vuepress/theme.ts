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

import { hopeTheme } from 'vuepress-theme-hope';
import { enNavbar, zhNavbar } from './navbar/index.js';
import { enSidebar, zhSidebar } from './sidebar/index.js';

export default hopeTheme(
  {
    hostname: 'https://iotdb.apache.org/',
    logo: '/logo.png',

    repo: 'apache/iotdb',
    docsRepo: 'https://github.com/apache/iotdb-docs',
    docsDir: 'src',

    focus: false,
    darkmode: 'toggle',
    breadcrumb: false,
    contributors: false,

    navbarTitle: '',
    navbarLayout: {
      start: ['Brand'],
      center: [],
      end: ['DocSearch', 'Links', 'Language', 'Outlook', 'Repo'],
    },

    locales: {
      '/': {
        // navbar
        navbar: enNavbar,

        // sidebar
        sidebar: enSidebar,

        footer: 'Default footer',

        displayFooter: true,

        metaLocales: {
          editLink: 'Found Error? Edit this page on GitHub',
        },
      },

      /**
       * Chinese locale config
       */
      '/zh/': {
        // navbar
        navbar: zhNavbar,

        // sidebar
        sidebar: zhSidebar,

        footer: '默认页脚',

        displayFooter: true,

        // page meta
        metaLocales: {
          editLink: '发现错误？在 GitHub 上编辑此页',
        },
      },
    },

    markdown: {
      align: true,
      hint: false,
      figure: true,
      gfm: true,
      imgLazyload: true,
      math: true,
      linksCheck: {
        build: 'error',
      },
      highlighter: {
        type: 'shiki',
        theme: 'one-dark-pro',
      },
    },

    plugins: {
      docsearch: {},
      catalog: false,
      redirect: {
        config: {
          '/UserGuide/Master/QuickStart/QuickStart.html':
            '/UserGuide/latest/QuickStart/QuickStart_apache.html',
          '/zh/UserGuide/Master/QuickStart/QuickStart.html':
            '/zh/UserGuide/latest/QuickStart/QuickStart_apache.html',
        },
      },
    },
  },
  { custom: true },
);
