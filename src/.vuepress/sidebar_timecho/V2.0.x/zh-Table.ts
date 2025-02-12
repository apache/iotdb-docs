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

export const zhSidebar = {
  '/zh/UserGuide/latest-Table/': [
    {
      text: 'IoTDB用户手册',
      children: [],
    },
    {
      text: '关于IoTDB',
      collapsible: true,
      prefix: 'IoTDB-Introduction/',
      // children: 'structure', 使用该方式自动获取文件夹下的文件
      children: [
        { text: '产品介绍', link: 'IoTDB-Introduction_timecho' },
        { text: '应用场景', link: 'Scenario' },
        { text: '发布历史', link: 'Release-history_timecho' },
      ],
    },
    {
      text: '预备知识',
      collapsible: true,
      prefix: 'Background-knowledge/',
      children: [
        { text: '常见概念', link: 'Cluster-Concept_timecho' },
        { text: '数据类型', link: 'Data-Type' },
        { text: '时序数据模型', link: 'Navigating_Time_Series_Data' },
        { text: '建模方案设计', link: 'Data-Model-and-Terminology' },
      ],
    },
    {
      text: '快速上手',
      link: 'QuickStart/QuickStart_timecho',
    },
    {
      text: '部署与运维',
      collapsible: true,
      prefix: 'Deployment-and-Maintenance/',
      // children: 'structure',
      children: [
        { text: '安装包获取', link: 'IoTDB-Package_timecho' },
        { text: '资源规划', link: 'Database-Resources' },
        { text: '系统配置', link: 'Environment-Requirements' },
        { text: '单机版部署指导', link: 'Stand-Alone-Deployment_timecho' },
        { text: '集群版部署指导', link: 'Cluster-Deployment_timecho' },
        { text: '双活版部署指导', link: 'Dual-Active-Deployment_timecho' },
        { text: 'Docker部署指导', link: 'Docker-Deployment_timecho' },
        { text: '监控面板部署', link: 'Monitoring-panel-deployment' },
      ],
    },
    {
      text: '基础功能',
      collapsible: true,
      prefix: 'Basic-Concept/',
      // children: 'structure',
      children: [
        { text: '数据库管理', link: 'Database-Management' },
        { text: '表管理', link: 'Table-Management' },
        { text: '写入&更新', link: 'Write-Updata-Data' },
        { text: '数据查询', link: 'Query-Data' },
        {
          text: '数据删除',
          collapsible: true,
          children: [
            { text: '数据删除', link: 'Delete-Data' },
            { text: '自动过期删除', link: 'TTL-Delete-Data' },
          ],
        },
      ],
    },
    {
      text: '高级功能',
      collapsible: true,
      prefix: 'User-Manual/',
      // children: 'structure',
      children: [
        { text: '数据同步', link: 'Data-Sync_timecho' },
      ],
    },
    {
      text: '工具体系',
      collapsible: true,
      prefix: 'Tools-System/',
      // children: 'structure',
      children: [
        { text: '命令行工具', link: 'CLI' },
      ],
    },
    {
      text: '应用编程接口',
      collapsible: true,
      prefix: 'API/',
      // children: 'structure',
      children: [
        { text: 'Java原生接口', link: 'Programming-Java-Native-API' },
        { text: 'Python原生接口', link: 'Programming-Python-Native-API' },
        { text: 'JDBC', link: 'Programming-JDBC' },
      ],
    },
    {
      text: 'SQL手册',
      collapsible: true,
      prefix: 'SQL-Manual/',
      // children: 'structure',
      children: [
        { text: '标识符', link: 'Identifier' },
        { text: '保留字&关键字', link: 'Keywords' },
        {
          text: '查询语句',
          collapsible: true,
          children: [
            { text: '概览', link: 'overview' },
            { text: 'SELECT子句', link: 'Select-Clause' },
            { text: 'FROM&JOIN子句', link: 'From-Join-Clause' },
            { text: 'WHERE子句', link: 'Where-Clause' },
            { text: 'GROUP BY子句', link: 'GroupBy-Clause' },
            { text: 'HAVING子句', link: 'Having-Clause' },
            { text: 'FILL子句', link: 'Fill-Clause' },
            { text: 'ORDER BY子句', link: 'OrderBy-Clause' },
            { text: 'LIMIT&OFFSET子句', link: 'Limit-Offset-Clause' },
          ],
        },
      ],
    },
    {
      text: '技术内幕',
      collapsible: true,
      prefix: 'Technical-Insider/',
      // children: 'structure',
      children: [
        { text: '压缩&编码', link: 'Encoding-and-Compression' },
        { text: '数据分区和负载均衡', link: 'Cluster-data-partitioning' },
      ],
    },
    {
      text: '附录',
      collapsible: true,
      prefix: 'Reference/',
      // children: 'structure',
      children: [
        { text: '示例数据', link: 'Sample-Data' },
        { text: '配置参数', link: 'System-Config-Manual' },
        { text: '状态码', link: 'Status-Codes' },
      ],
    },
  ],
};
