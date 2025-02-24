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

export const enNavbar = navbar([
  {
    text: 'Documentation',
    children: [
      { text: 'v2.0.x', link: '/UserGuide/latest/QuickStart/QuickStart_apache' },
      {
        text: 'v1.3.x',
        link: '/UserGuide/V1.3.x/QuickStart/QuickStart_apache',
      },
      { text: 'v1.2.x', link: '/UserGuide/V1.2.x/QuickStart/QuickStart' },
      { text: 'v0.13.x', link: '/UserGuide/V0.13.x/QuickStart/QuickStart' },
    ],
  },
  {
    text: 'Design',
    link: 'https://cwiki.apache.org/confluence/display/IOTDB/System+Design',
  },
  {
    text: 'Download',
    link: '/Download/',
  },
  {
    text: 'Community',
    children: [
      { text: 'About the Community', link: '/Community/About-the-Community' },
      { text: 'Development Guide', link: '/Community/Development-Guide' },
      { text: 'Community Partners', link: '/Community/Community-Partners' },
      {
        text: 'Communication Channels',
        link: '/Community/Communication-Channels',
      },
      { text: 'Events and Reports', link: '/Community/Events-and-Reports' },
      { text: 'Commiters', link: '/Community/Commiters' },
    ],
  },
  {
    text: 'ASF',
    children: [
      { text: 'Foundation', link: 'https://www.apache.org/' },
      { text: 'License', link: 'https://www.apache.org/licenses/' },
      { text: 'Security', link: 'https://www.apache.org/security/' },
      {
        text: 'Sponsorship',
        link: 'https://www.apache.org/foundation/sponsorship.html',
      },
      { text: 'Thanks', link: 'https://www.apache.org/foundation/thanks.html' },
      {
        text: 'Current  Events',
        link: 'https://www.apache.org/events/current-event',
      },
      {
        text: 'Privacy',
        link: 'https://privacy.apache.org/policies/privacy-policy-public.html',
      },
    ],
  },
]);
