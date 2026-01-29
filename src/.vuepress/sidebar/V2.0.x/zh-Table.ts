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
      text: 'IoTDB用户手册(V2.0.x)',
      children: [],
    },
    {
      text: '关于IoTDB',
      collapsible: true,
      prefix: 'IoTDB-Introduction/',
      children: [
        { text: '产品介绍', link: 'IoTDB-Introduction_apache' },
        { text: '应用场景', link: 'Scenario' },
        { text: '发布历史', link: 'Release-history_apache' },
      ],
    },
    {
      text: '预备知识',
      collapsible: true,
      prefix: 'Background-knowledge/',
      children: [
        { text: '常见概念', link: 'Cluster-Concept_apache' },
        { text: '时序数据模型', link: 'Navigating_Time_Series_Data' },
        { text: '建模方案设计', link: 'Data-Model-and-Terminology_apache' },
        { text: '数据类型', link: 'Data-Type' },
      ],
    },
    {
      text: '快速上手',
      link: 'QuickStart/QuickStart_apache',
    },
    {
      text: '安装部署',
      collapsible: true,
      prefix: 'Deployment-and-Maintenance/',
      children: [
          {
            text: '部署准备',
            collapsible: true,
            children: [
              { text: '部署形态', link: 'Deployment-form_apache' },
              { text: '安装包获取', link: 'IoTDB-Package_apache' },
              { text: '资源规划', link: 'Database-Resources_apache' },
              { text: '环境配置', link: 'Environment-Requirements' },
            ],
          },
          {
            text: '数据库部署',
            collapsible: true,
            children: [
              { text: '单机版部署', link: 'Stand-Alone-Deployment_apache' },
              { text: '集群版部署', link: 'Cluster-Deployment_apache' },
              { text: 'Docker 部署', link: 'Docker-Deployment_apache' },
            ],
          },
          {
            text: 'AI 部署',
            collapsible: true,
            children: [
              { text: 'AINode 部署(V2.0.5/6)', link: 'AINode_Deployment_apache' },
              { text: 'AINode 部署(V2.0.8)', link: 'AINode_Deployment_Upgrade_apache' },
            ],
          },
      ],
    },
    {
      text: '基础功能',
      collapsible: true,
      prefix: 'Basic-Concept/',
      children: [
         { text: '数据库管理', link: 'Database-Management_apache' },
        { text: '表管理', link: 'Table-Management_apache' },
        { text: '写入&更新', link: 'Write-Updata-Data_apache' },
        { text: '数据查询', link: 'Query-Data_apache' },
        {
          text: '数据删除',
          collapsible: true,
          children: [
            { text: '数据删除', link: 'Delete-Data' },
            { text: '数据保留时间', link: 'TTL-Delete-Data_apache' },
            { text: 'SpaceTL 删除', link: 'SpaceTL-Delete' },
          ],
        },
      ],
    },
    {
      text: '高级功能',
      collapsible: true,
      prefix: 'User-Manual/',
      children: [
        { text: '数据同步', link: 'Data-Sync_apache' },
        { text: 'UDF', link: 'User-defined-function' },
        {
          text: '安全管理',
          collapsible: true,
          children: [{ text: '权限管理', link: 'Authority-Management_apache' }],
        },
        { text: '树转表视图', link: 'Tree-to-Table_apache' },
        {
          text: '系统运维',
          collapsible: true,
          children: [
            { text: '查询性能分析', link: 'Query-Performance-Analysis' },
            { text: '集群维护', link: 'Load-Balance' },
            { text: '运维语句', link: 'Maintenance-statement_apache' },
          ],
        },
      ],
    },
    {
      text: 'AI 能力',
      collapsible: true,
      prefix: 'AI-capability/',
      children: [
        { text: 'AINode(V2.0.5/6)', link: 'AINode_apache' },
        { text: 'AINode(V2.0.8)', link: 'AINode_Upgrade_apache' },
        { text: '时序大模型(V2.0.5/6)', link: 'TimeSeries-Large-Model' },
        { text: '时序大模型(V2.0.8)', link: 'TimeSeries-Large-Model_Upgrade_apache' },
      ],
    },
    {
      text: '工具体系',
      collapsible: true,
      prefix: 'Tools-System/',
      children: [
        { text: '命令行工具', link: 'CLI_apache' },
        { text: '监控工具', link: 'Monitor-Tool_apache' },
        { text: '集群管理工具', link: 'Maintenance-Tool_apache' },
        { text: '数据导入导出', collapsible: true,
          children: [
            { text: '数据导入', link: 'Data-Import-Tool_apache' },
            { text: '数据导出', link: 'Data-Export-Tool_apache' },
          ],
        },
        { text: '元数据导入导出', collapsible: true,
          children: [
            { text: '元数据导入', link: 'Schema-Import-Tool_apache' },
            { text: '元数据导出', link: 'Schema-Export-Tool_apache' },
          ],
        },
        { text: '全量备份工具', link: 'Backup-Tool' },
        { text: '健康检查工具', link: 'Health-Check-Tool' },
      ],
    },
    {
      text: '应用编程接口',
      collapsible: true,
      prefix: 'API/',
      children: [
        { text: 'Java原生接口', link: 'Programming-Java-Native-API_apache' },
        { text: 'Python原生接口', link: 'Programming-Python-Native-API_apache' },
        { text: 'C++原生接口', link: 'Programming-Cpp-Native-API_apache' },
        { text: 'GO原生接口', link: 'Programming-Go-Native-API_apache' },
        { text: 'C#原生接口', link: 'Programming-CSharp-Native-API_apache' },
        { text: 'JDBC', link: 'Programming-JDBC_apache' },
        { text: 'MQTT协议', link: 'Programming-MQTT' },
        { text: 'RESTAPI V1 ', link: 'RestServiceV1' },
      ],
    },
    {
      text: '生态集成',
      collapsible: true,
      prefix: 'Ecosystem-Integration/',
      children: [
        { text: '概览', link: 'Ecosystem-Overview_apache' },
        {
          text: '计算引擎',
          collapsible: true,
          children: [
            { text: 'Apache Spark', link: 'Spark-IoTDB' },
          ],
        },
        {
          text: 'SQL 开发',
          collapsible: true,
          children: [
            { text: 'DBeaver', link: 'DBeaver' },
            { text: 'DataGrip', link: 'DataGrip' },
          ],
        },
        {
          text: '编程框架',
          collapsible: true,
          children: [
            { text: 'Spring Boot Starter', link: 'Spring-Boot-Starter' },
            { text: 'Mybatis Generator', link: 'Mybatis-Generator' },
            { text: 'MyBatisPlus Generator', link: 'MyBatisPlus-Generator' },
          ],
        },
      ],
    },
    {
      text: 'SQL手册',
      collapsible: true,
      prefix: 'SQL-Manual/',
      children: [
        { text: '元数据操作', link: 'SQL-Metadata-Operations_apache' },
        { text: '数据增删', link: 'SQL-Data-Addition-Deletion_apache' },
        {
          text: '数据查询',
          collapsible: true,
          children: [
            { text: '概览', link: 'overview_apache' },
            { text: 'SELECT子句', link: 'Select-Clause' },
            { text: 'FROM&JOIN子句', link: 'From-Join-Clause' },
            { text: 'WHERE子句', link: 'Where-Clause' },
            { text: 'GROUP BY子句', link: 'GroupBy-Clause' },
            { text: 'HAVING子句', link: 'Having-Clause' },
            { text: 'FILL子句', link: 'Fill-Clause' },
            { text: 'ORDER BY子句', link: 'OrderBy-Clause' },
            { text: 'LIMIT&OFFSET子句', link: 'Limit-Offset-Clause' },
            { text: '嵌套查询', link: 'Nested-Queries' },
          ],
        },
        { text: '运维语句', link: 'SQL-Maintenance-Statements' },
        { text: '标识符', link: 'Identifier' },
        { text: '保留字&关键字', link: 'Keywords' },
        {
          text: '函数与操作符',
          collapsible: true,
          children: [
            { text: '基础函数', link: 'Basis-Function' },
            { text: '特色函数', link: 'Featured-Functions_apache' },
          ],
        },

      ],
    },
    {
      text: '技术内幕',
      collapsible: true,
      prefix: 'Technical-Insider/',
      children: [
        { text: '压缩&编码', link: 'Encoding-and-Compression' },
        { text: '数据分区和负载均衡', link: 'Cluster-data-partitioning' },
      ],
    },
    {
      text: '附录',
      collapsible: true,
      prefix: 'Reference/',
      children: [
        { text: '示例数据', link: 'Sample-Data' },
        { text: '配置参数', link: 'System-Config-Manual' },
        { text: '状态码', link: 'Status-Codes' },
        { text: '系统表', link: 'System-Tables_apache' },
      ],
    },
    {
      text: 'FAQ',
      collapsible: true,
      prefix: 'FAQ/',
      children: [{ text: '常见问题', link: 'Frequently-asked-questions' }],
    },
  ],
};
