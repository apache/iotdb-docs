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

const VERSION_REG = /UserGuide\/([^/]+)/;
const URL_REG = /UserGuide\/([^/]+)\/([^/]+)/;

export const getDocVersion = (path = '', defaultValue = 'latest') => {
  if (path.includes('UserGuide/Master') || !path.includes('UserGuide')) {
    return defaultValue;
  }
  /**
   * 路径 /zh/UserGuide/V1.3.0-2/QuickStart/QuickStart_apache.html, 匹配 V1.3.0-2
   * 路径 /zh/UserGuide/V1.2.x/QuickStart/QuickStart_apache.html, 匹配 V1.2.x
   * 路径 /zh/UserGuide/latest/QuickStart/QuickStart_apache.html, 匹配 latest
   *
   * 匹配路径中的版本号，UserGuide 后面的版本号为当前文档的版本号, 版本号不一定为数字，可能为 latest或其它，因此只用 / 作为分隔符
   */

  return VERSION_REG.exec(path)?.[1] ?? defaultValue;
};

export const getDialect = (path = '', defaultValue = '') => {
  if (path.includes('UserGuide/Master') || !path.includes('UserGuide')) {
    return defaultValue;
  }
  /**
   * 路径 /zh/UserGuide/V1.3.0-2/QuickStart/QuickStart_apache.html, 匹配 QuickStart
   * 路径 /zh/UserGuide/V1.2.x/QuickStart/QuickStart_apache.html, 匹配 QuickStart
   * 路径 /zh/UserGuide/latest-Table/QuickStart/QuickStart_apache.html, 匹配 Table
   * 路径 /zh/UserGuide/latest/QuickStart/QuickStart_apache.html, 匹配 Tree
   *
   * 匹配路径中的版本号，UserGuide 后面的版本号为当前文档的版本号, 版本号不一定为数字，可能为 latest或其它，因此只用 / 作为分隔符
   */
  const docVersion = getDocVersion(path);
  if (docVersion === 'latest' || docVersion.includes('-Tree')) {
    return 'Tree';
  } 
  if (docVersion.includes('-Table')) {
    return 'Table';
  }
  return defaultValue;
};

export const URL_SUFFIX = '_apache';