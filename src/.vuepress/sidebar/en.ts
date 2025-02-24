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

import { sidebar } from 'vuepress-theme-hope';
import { enSidebar as V201xTableSidebar } from './V2.0.x/en-Table.js';
import { enSidebar as V201xTreeSidebar } from './V2.0.x/en-Tree.js';
import { enSidebar as V103xSidebar } from './V1.3.x/en.js';
import { enSidebar as V1030Sidebar } from './V1.3.0-2/en.js';
import { enSidebar as V102xSidebar } from './V1.2.x/en.js';
import { enSidebar as V013xSidebar } from './V0.13.x/en.js';

export const enSidebar = sidebar({
  ...V201xTableSidebar,
  ...V201xTreeSidebar,
  ...V103xSidebar,
  ...V1030Sidebar,
  ...V102xSidebar,
  ...V013xSidebar,
});
