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

import { getDirname, path } from 'vuepress/utils';
import { viteBundler } from '@vuepress/bundler-vite';
import { defineUserConfig } from 'vuepress';
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
    [
      'meta',
      {
        name: 'Description',
        content: 'Apache IoTDB: Time Series Database for IoT',
      },
    ],
    [
      'meta',
      {
        name: 'Keywords',
        content:
          'TSDB, time series, time series database, IoTDB, IoT database, IoT data management, 时序数据库, 时间序列管理, IoTDB, 物联网数据库, 实时数据库, 物联网数据管理, 物联网数据',
      },
    ],
    ['meta', { name: 'baidu-site-verification', content: 'wfKETzB3OT' }],
    [
      'meta',
      {
        name: 'google-site-verification',
        content: 'mZWAoRY0yj_HAr-s47zHCGHzx5Ju-RVm5wDbPnwQYFo',
      },
    ],
    [
      'script',
      { type: 'text/javascript' },
      `\
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
`,
    ],
    // [
    //   'script',
    //   {
    //     async: true,
    //     src: 'https://widget.kapa.ai/kapa-widget.bundle.js',
    //     'data-website-id': '2d37bfdd-8d98-40ba-9223-9d4f81bfb327',
    //     // 'data-language': 'zh',
    //     'data-project-name': 'Apache IoTDB',
    //     'data-project-color': '#9E2878',
    //     'data-button-image-height': '0px',
    //     'data-button-image-width': '0px',
    //     // 'data-button-bg-color': '#FFF',
    //     // 'data-button-text-color': '#9E2878',
    //     'data-project-logo': 'https://iotdb.apache.org/slogo.png',
    //     'data-button-position-right': '16px',
    //     'data-button-position-bottom': '120px',
    //     'data-button-height': '50px',
    //     'data-button-width': '50px',
    //     'data-button-text': 'Ask',
    //     'data-modal-image-width': '150px',
    //     'data-modal-title': 'AI Docs',
    //     // 'data-modal-disclaimer':
    //     //   'This is a custom LLM with access to all [Kapa documentation](https://docs.kapa.ai).',
    //     // 'data-modal-example-questions':
    //     //   'How do I get started?,How to add example questions?',
    //     'data-user-analytics-fingerprint-enabled': 'true',
    //     // 'data-modal-x-offset': '0',
    //     // 'data-modal-y-offset': '0',
    //     // 'data-modal-with-overlay': 'false',
    //     // 'data-modal-inner-flex-direction': 'column',
    //     // 'data-modal-inner-justify-content': 'end',
    //     // 'data-modal-inner-max-width': '500px',
    //     // 'data-modal-inner-position-left': 'auto',
    //     // 'data-modal-inner-position-right': '0',
    //     // 'data-modal-inner-position-bottom': '0',
    //     // 'data-modal-inner-position-top': '0',
    //     // 'data-modal-size': '100vh',
    //     // 'data-modal-lock-scroll': 'false',
    //     // 'data-modal-header-bg-color': '#fff',
    //   },
    // ],
  ],

  shouldPrefetch: false,
  alias: {
    '@theme-hope/components/base/PageFooter': path.resolve(
      dirname,
      './components/PageFooter.vue',
    ),
  },
  bundler: viteBundler({
    vuePluginOptions: {
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'center',
        },
      },
    },
  }),
  pagePatterns: [
    '**/*.md',
    '!**/*_timecho.md',
    '!**/stage/**/*.md',
    '!**/Master/**/*.md',
    '!.vuepress',
    '!node_modules',
  ],
});
