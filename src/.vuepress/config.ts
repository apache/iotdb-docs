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

const kapaConfig = {
  async: true,
  src: 'https://widget.kapa.ai/kapa-widget.bundle.js',
  'data-website-id': '2d37bfdd-8d98-40ba-9223-9d4f81bfb327',
  // 'data-language': 'zh',
  'data-project-name': 'Apache IoTDB',
  'data-project-color': '#FFFFFF',
  'data-button-z-index': '1999',
  'data-button-padding': '4px',
  'data-button-border-radius': '4px',
  'data-button-image-height': '24px',
  'data-button-image-width': '20px',
  'data-button-text-color': '#9E2878',
  'data-project-logo': 'https://iotdb.apache.org/img/logo.svg',
  'data-button-position-right': '16px',
  'data-button-position-bottom': '8px',
  'data-button-height': '56px',
  'data-button-width': '48px',
  'data-button-text': 'Ask',
  'data-modal-override-open-selector': '#custom-ask-ai-button',
  'data-modal-image-width': '150px',
  'data-modal-title': 'AI Docs',
  'data-modal-title-color': '#9E2878',
  'data-deep-thinking-button-active-bg-color': '#F6F7F8',
  'data-deep-thinking-button-active-text-color': '#9E2878',
  'data-deep-thinking-button-active-hover-text-color': '#9E2878',
  'data-modal-disclaimer': `This is a custom LLM for Apache IoTDB with access to all [documentation](iotdb.apache.org/docs/), [GitHub Open Issues, PRs and READMEs](github.com/apache/iotdb).&#10;&#10;
    
If you encounter "Error in verifying browser for feedback submission. Captcha token could not be obtained." please ensure that you can access Google services.`,
  'data-user-analytics-fingerprint-enabled': 'true',
  'data-consent-required': 'true',
  'data-consent-screen-disclaimer':
    "By clicking <I agree, let's chat>, you consent to the use of the AI assistant in accordance with kapa.ai's [Privacy Policy](https://www.kapa.ai/content/privacy-policy). This service uses reCAPTCHA, which requires your consent to Google's [Privacy Policy](https://policies.google.com/privacy) and [Terms of Service](https://policies.google.com/terms). By proceeding, you explicitly agree to both kapa.ai's and Google's privacy policies.",
};

export default defineUserConfig({
  base: '/',

  locales: {
    '/': {
      lang: 'en-US',
      title: 'IoTDB Website',
      description: 'Apache IoTDB',
      head: [['script', { ...kapaConfig }]],
    },
    '/zh/': {
      lang: 'zh-CN',
      title: 'IoTDB Website',
      description: 'Apache IoTDB',
      head: [
        [
          'script',
          {
            ...kapaConfig,
            'data-language': 'zh',
            'data-modal-disclaimer': `这是一个针对 Apache IoTDB 的定制化大型语言模型，能够访问所有[文档](iotdb.apache.org/docs/)、[GitHub 公开问题、PR 和自述文件](github.com/apache/iotdb)。&#10;&#10;

如果您遇到"Error in verifying browser for feedback submission. Captcha token could not be obtained." 请确保您能够顺畅访问 Google 服务。`,
            'data-consent-screen-disclaimer':
              "点击<I agree, let's chat>即表示您同意按照 kapa.ai 的[隐私政策](https://www.kapa.ai/content/privacy-policy)使用 AI 助手。本服务使用 reCAPTCHA，您需要同意 Google 的[隐私政策](https://policies.google.com/privacy)和[服务条款](https://policies.google.com/terms)。继续操作即表示您明确同意 kapa.ai 和 Google 的隐私政策。",
          },
        ],
      ],
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
