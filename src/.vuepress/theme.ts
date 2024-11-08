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

import { hopeTheme } from 'vuepress-theme-hope';
import { enNavbar, zhNavbar } from './navbar/index.js';
import { enSidebar, zhSidebar } from './sidebar/index.js';

export default hopeTheme({
  hostname: 'https://iotdb.apache.org/',

  darkmode: 'toggle',

  logo: '/logo.png',

  repo: 'https://github.com/apache/iotdb',

  repoLabel: 'GitHub',

  repoDisplay: true,

  docsRepo: 'https://github.com/apache/iotdb-docs',

  docsDir: 'src',

  docsBranch: 'main',

  pure: true,

  breadcrumb: false,

  navbarIcon: false,

  lastUpdated: true,

  contributors: false,

  navbarLayout: {
    start: ['Brand'],
    center: [],
    end: ['Search', 'Links', 'Language', 'Outlook', 'Repo'],
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

  // encrypt: {
  //   config: {
  //     "/demo/encrypt.html": ["1234"],
  //     "/zh/demo/encrypt.html": ["1234"],
  //   },
  // },

  plugins: {
    // comment: {
    //   // @ts-expect-error: You should generate and use your own comment service
    //   provider: "Waline",
    // },

    // all features are enabled for demo, only preserve features you need here
    prismjs: {
      themes: {
        light: 'one-dark',
        dark: 'one-dark',
      },
    },
    // shiki: {
    //   theme: 'one-dark-pro',
    //   langs: ['java', 'shell', 'sql', 'yaml', 'json', 'xml', 'go', 'python', 'scala', 'text', 'plaintext', 'txt', 'properties', 'rust', 'javascript', 'cpp', 'c#', 'csharp', 'js', 'cmd'],
    // },
    catalog: true,
    git: true,
    comment: {
      provider: 'None',
    },
    mdEnhance: {
      align: true,
      attrs: true,
      chart: false,
      codetabs: true,
      hint: true,
      demo: false,
      echarts: false,
      figure: true,
      flowchart: false,
      gfm: true,
      imgLazyload: true,
      imgSize: true,
      include: true,
      katex: true,
      mark: true,
      mermaid: false,
      stylize: [
        {
          matcher: 'Recommended',
          // eslint-disable-next-line consistent-return
          replacer: ({ tag }) => {
            if (tag === 'em') {
              return {
                tag: 'Badge',
                attrs: { type: 'tip' },
                content: 'Recommended',
              };
            }
          },
        },
      ],
      sub: true,
      sup: true,
      tabs: true,
      vPre: true,
      vuePlayground: false,
    },
  },
}, { custom: true });
