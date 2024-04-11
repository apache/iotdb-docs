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

import { getDirname, path } from 'vuepress/utils';
import { viteBundler } from '@vuepress/bundler-vite';
import { defineUserConfig } from 'vuepress';
import { redirectPlugin } from '@vuepress/plugin-redirect';
import { docsearchPlugin } from './components/docsearch/node/index.js';
import theme from './theme.js';

const dirname = getDirname(import.meta.url);

export default defineUserConfig({
  base: '/',

  locales: {
    '/': {
      lang: 'en-US',
      title: 'IoTDB Website',
      description: 'Apache IoTDB',
    },
    '/zh/': {
      lang: 'zh-CN',
      title: 'IoTDB Website',
      description: 'Apache IoTDB',
    },
  },

  theme,
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'Description', content: 'Apache IoTDB: Time Series Database for IoT' }],
    ['meta', { name: 'Keywords', content: 'TSDB, time series, time series database, IoTDB, IoT database, IoT data management,时序数据库, 时间序列管理, IoTDB, 物联网数据库, 实时数据库, 物联网数据管理, 物联网数据' }],
    ['meta', { name: 'baidu-site-verification', content: 'wfKETzB3OT' }],
    ['meta', { name: 'google-site-verification', content: 'mZWAoRY0yj_HAr-s47zHCGHzx5Ju-RVm5wDbPnwQYFo' }],
    ['script', { type: 'text/javascript' }, `
var _paq = window._paq = window._paq || [];
/* tracker methods like "setCustomDimension" should be called before "trackPageView" */
_paq.push(["setDoNotTrack", true]);
_paq.push(["disableCookies"]);
_paq.push(['trackPageView']);
_paq.push(['enableLinkTracking']);
(function() {
  var u="https://analytics.apache.org/";
  _paq.push(['setTrackerUrl', u+'matomo.php']);
  _paq.push(['setSiteId', '56']);
  var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
  g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
})();
       `],
  ],

  shouldPrefetch: false,
  alias: {
    '@theme-hope/components/PageFooter': path.resolve(
      dirname,
      './components/PageFooter.vue',
    ),
    // '@theme-hope/modules/info/utils/index': path.resolve(
    //   dirname,
    //   './utils/index',
    // ),
  },
  plugins: [
    docsearchPlugin({
      appId: 'JLT9R2YGAE',
      apiKey: 'f1f30c0df04d74534e066d07786bce05',
      indexName: 'iotdb-apache',
      maxResultsPerGroup: 10,
      locales: {
        '/zh/': {
          placeholder: '搜索文档',
          translations: {
            button: {
              buttonText: '搜索文档',
              buttonAriaLabel: '搜索文档',
            },
            modal: {
              searchBox: {
                resetButtonTitle: '清除查询条件',
                resetButtonAriaLabel: '清除查询条件',
                cancelButtonText: '取消',
                cancelButtonAriaLabel: '取消',
              },
              startScreen: {
                recentSearchesTitle: '搜索历史',
                noRecentSearchesText: '没有搜索历史',
                saveRecentSearchButtonTitle: '保存至搜索历史',
                removeRecentSearchButtonTitle: '从搜索历史中移除',
                favoriteSearchesTitle: '收藏',
                removeFavoriteSearchButtonTitle: '从收藏中移除',
              },
              errorScreen: {
                titleText: '无法获取结果',
                helpText: '你可能需要检查你的网络连接',
              },
              footer: {
                selectText: '选择',
                navigateText: '切换',
                closeText: '关闭',
                searchByText: '搜索提供者',
              },
              noResultsScreen: {
                noResultsText: '无法找到相关结果',
                suggestedQueryText: '你可以尝试查询',
                reportMissingResultsText: '你认为该查询应该有结果？',
                reportMissingResultsLinkText: '点击反馈',
              },
            },
          },
        },
      },
    }),
    redirectPlugin({
      // hostname: 'https://iotdb.apache.org/',
      config: {
        '/UserGuide/Master/QuickStart/QuickStart.html': '/UserGuide/latest/QuickStart/QuickStart.html',
        '/zh/UserGuide/Master/QuickStart/QuickStart.html': '/zh/UserGuide/latest/QuickStart/QuickStart.html',
      },
    }),
  ],
  bundler: viteBundler({
    vuePluginOptions: {
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'center',
        },
      },
    },
  }),
  pagePatterns: ['**/*.md', '!**/stage/**/*.md', '!**/Master/**/*.md', '!.vuepress', '!node_modules'],
});
