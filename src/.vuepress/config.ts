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
    [
      'script',
      {
        async: true,
        src: 'https://widget.kapa.ai/kapa-widget.bundle.js',
        'data-website-id': '2d37bfdd-8d98-40ba-9223-9d4f81bfb327',
        // 'data-language': 'zh',
        'data-project-name': 'Apache IoTDB',
        'data-project-color': '#FFFFFF',
        'data-button-z-index': '1999',
        'data-button-padding': '2px',
        'data-button-image-height': '24px',
        'data-button-image-width': '20px',
        'data-button-text-color': '#9E2878',
        'data-project-logo': 'https://iotdb.apache.org/img/logo.svg',
        'data-button-position-right': '16px',
        'data-button-position-bottom': '8px',
        'data-button-height': '50px',
        'data-button-width': '50px',
        'data-button-text': 'Ask',
        'data-modal-override-open-selector': '#custom-ask-ai-button',
        'data-modal-image-width': '150px',
        'data-modal-title': 'AI Docs',
        'data-modal-title-color': '#9E2878',
        'data-modal-disclaimer':
          'This is a custom LLM for Apache IoTDB with access to all [documentation](iotdb.apache.org/docs/), [GitHub Open Issues, PRs and READMEs](github.com/apache/iotdb).&#10;&#10;Companies deploy assistants like this ([built by kapa.ai](https://kapa.ai)) on docs via [website widget](https://docs.kapa.ai/integrations/website-widget) (Docker, Reddit), in [support forms](https://docs.kapa.ai/integrations/support-form-deflector) for ticket deflection (Monday.com, Mapbox), or as [Slack bots](https://docs.kapa.ai/integrations/slack-bot) with private sources.',

        // 'data-modal-example-questions':
        //   'How do I get started?,How to add example questions?',
        'data-user-analytics-fingerprint-enabled': 'true',
        'data-consent-required': 'true',
        'data-consent-screen-disclaimer':
          "By clicking \"I agree, let's chat\", you consent to the use of the AI assistant in accordance with kapa.ai's [Privacy Policy](https://www.kapa.ai/content/privacy-policy). This service uses reCAPTCHA, which requires your consent to Google's [Privacy Policy](https://policies.google.com/privacy) and [Terms of Service](https://policies.google.com/terms). By proceeding, you explicitly agree to both kapa.ai's and Google's privacy policies.",
      },
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
