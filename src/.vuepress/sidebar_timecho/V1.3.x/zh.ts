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
  '/zh/UserGuide/V1.3.x/': [
    {
      text: 'TimechoDB用户手册 (V1.3.x)',
      children: [],
    },
    {
      text: '关于TimechoDB',
      collapsible: true,
      prefix: 'IoTDB-Introduction/',
      // children: 'structure', 使用该方式自动获取文件夹下的文件
      children: [
        { text: '产品介绍', link: 'IoTDB-Introduction_timecho' },
        { text: '应用场景', link: 'Scenario' },
        { text: '发布历史', link: 'Release-history_timecho' },
        { text: '漏洞提报', link: 'Vulnerability-submission' },
      ],
    },
    {
      text: '预备知识',
      collapsible: true,
      prefix: 'Background-knowledge/',
      children: [
        { text: '常见概念', link: 'Cluster-Concept_timecho' },
        { text: '数据类型', link: 'Data-Type' },
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
        { text: '环境配置', link: 'Environment-Requirements' },
        { text: '单机版部署指导', link: 'Stand-Alone-Deployment_timecho' },
        { text: '集群版部署指导', link: 'Cluster-Deployment_timecho' },
        { text: '双活版部署指导', link: 'Dual-Active-Deployment_timecho' },
        { text: 'Docker部署指导', link: 'Docker-Deployment_timecho' },
        { text: 'AINode部署', link: 'AINode_Deployment_timecho' },
        { text: '监控面板部署', link: 'Monitoring-panel-deployment' },
        { text: '可视化控制台部署', link: 'workbench-deployment_timecho' },
        { text: 'Kubernetes部署', link: 'Kubernetes_timecho' },
      ],
    },
    {
      text: '基础功能',
      collapsible: true,
      prefix: 'Basic-Concept/',
      // children: 'structure',
      children: [
        {
          text: '数据建模',
          collapsible: true,
          children: [
            { text: '时序数据模型', link: 'Navigating_Time_Series_Data' },
            { text: '建模方案设计', link: 'Data-Model-and-Terminology' },
            { text: '测点管理', link: 'Operate-Metadata_timecho' },
          ],
        },
        { text: '数据写入', link: 'Write-Data' },
        { text: '数据查询', link: 'Query-Data' },
        {
          text: '数据删除',
          collapsible: true,
          children: [
            { text: '数据删除', link: 'Delete-Data' },
            { text: '数据保留时间', link: 'TTL-Delete' },
          ],
        },
      ],
    },
    {
      text: '高级功能',
      collapsible: true,
      prefix: 'User-Manual/',
      children: [
        { text: '数据同步(V1.3.0/1/2)', link: 'Data-Sync-old_timecho' },
        { text: '数据同步(V1.3.3)', link: 'Data-Sync_timecho' },
        { text: '数据订阅', link: 'Data-subscription' },
        {
          text: '流计算',
          collapsible: true,
          children: [
            { text: '流计算框架', link: 'Streaming_timecho' },
            { text: '连续查询', link: 'Database-Programming' },
            { text: '触发器', link: 'Trigger' },
          ],
        },
        { text: '多级存储', link: 'Tiered-Storage_timecho' },
        { text: 'UDF', link: 'User-defined-function_timecho' },
        { text: '视图', link: 'IoTDB-View_timecho' },
        {
          text: '安全权限',
          collapsible: true,
          children: [
            { text: '权限管理', link: 'Authority-Management' },
            { text: '白名单', link: 'White-List_timecho' },
            { text: '安全审计', link: 'Audit-Log_timecho' },
          ],
        },
        {
          text: '系统运维',
          collapsible: true,
          children: [
            { text: '查询性能分析', link: 'Query-Performance-Analysis' },
            { text: '负载均衡', link: 'Load-Balance' },
            { text: '运维语句', link: 'Maintenance-statement' },
          ],
        },
      ],
    },
    {
      text: 'AI 能力',
      collapsible: true,
      prefix: 'AI-capability/',
      children: [
        { text: 'AINode', link: 'AINode_timecho' },
        { text: '时序大模型', link: 'TimeSeries-Large-Model' },
      ],
    },
    {
      text: '工具体系',
      collapsible: true,
      prefix: 'Tools-System/',
      // children: 'structure',
      children: [
        { text: '命令行工具', link: 'CLI_timecho' },
        { text: '可视化控制台', link: 'Workbench_timecho' },
        { text: '监控工具', link: 'Monitor-Tool_timecho' },
        { text: '测试工具', link: 'Benchmark' },
        { text: '集群管理工具', link: 'Maintenance-Tool_timecho' },
        { text: '数据导入导出(V1.3.0/1/2)', link: 'Data-Import-Export-Tool' },
        { text: 'TsFile导入导出(V1.3.0/1/2)', link: 'TsFile-Import-Export-Tool' },
        { text: '数据导入(V1.3.3)', link: 'Data-Import-Tool' },
        { text: '数据导入(V1.3.4)', link: 'Data-Import-Tool-1-3-4' },
        { text: '数据导出(V1.3.3)', link: 'Data-Export-Tool' }, 
        { text: '数据导出(V1.3.4)', link: 'Data-Export-Tool-1-3-4' }, 
        { text: '全量备份工具(V1.3.2)', link: 'Backup-Tool' },
        { text: '健康检查工具(V1.3.2)', link: 'Health-Check-Tool' }, 
      ],
    },
    {
      text: '应用编程接口',
      collapsible: true,
      prefix: 'API/',
      // children: 'structure',
      children: [
        { text: 'Java原生接口', collapsible: true,
          children: [
            { text: 'Java原生API', link: 'Programming-Java-Native-API' },
            { text: '数据订阅API', link: 'Programming-Data-Subscription' },
          ],
        },
        { text: 'Python原生接口', link: 'Programming-Python-Native-API' },
        { text: 'C++原生接口', link: 'Programming-Cpp-Native-API' },
        { text: 'Go原生接口', link: 'Programming-Go-Native-API' },
        { text: 'C#原生接口', link: 'Programming-CSharp-Native-API' },
        { text: 'Node.js原生接口', link: 'Programming-NodeJS-Native-API' },
        { text: 'Rust', link: 'Programming-Rust-Native-API' },
        { text: 'JDBC', link: 'Programming-JDBC' },
        /* { text: 'MQTT协议', link: 'Programming-MQTT' }, */
        { text: 'OPC UA协议', link: 'Programming-OPC-UA_timecho' },
        {
          text: 'REST API',
          collapsible: true,
          children: [
            { text: 'V1 (不推荐)', link: 'RestServiceV1' },
            { text: 'V2', link: 'RestServiceV2' },
          ],
        },
      ],
    },
    {
      text: '生态集成',
      collapsible: true,
      prefix: 'Ecosystem-Integration/',
      // children: 'structure',
      children: [
            {
              text: '数据采集',
              collapsible: true,
              children: [
                { text: 'Telegraf插件', link: 'Telegraf' },
              ],
            },
            {
              text: '数据集成',
              collapsible: true,
              children: [
                { text: 'Apache NiFi', link: 'NiFi-IoTDB' },
                { text: 'Kafka', link: 'Programming-Kafka' },
              ],
            },
            {
              text: '计算引擎',
              collapsible: true,
              children: [
                { text: 'Apache Flink', link: 'Flink-IoTDB' },
                { text: 'Apache Spark', link: 'Spark-IoTDB' },
              ],
            },
            {
              text: '可视化分析',
              collapsible: true,
              children: [
                { text: 'Apache Zeppelin', link: 'Zeppelin-IoTDB_timecho' },
                { text: 'Grafana', link: 'Grafana-Connector' },
                { text: 'Grafana插件', link: 'Grafana-Plugin' },
                { text: 'DataEase', link: 'DataEase' },
              ],
            },
            {
              text: 'SQL 开发',
              collapsible: true,
              children: [
                { text: 'DBeaver', link: 'DBeaver' },
              ],
            },
            {
              text: '物联网平台',
              collapsible: true,
              children: [
                { text: 'Ignition', link: 'Ignition-IoTDB-plugin_timecho' },
                { text: 'ThingsBoard', link: 'Thingsboard' },
              ],
            },
      ],
    },
    {
      text: 'SQL手册',
      collapsible: true,
      prefix: 'SQL-Manual/',
      // children: 'structure',
      children: [
        { text: 'SQL手册', link: 'SQL-Manual' },
        {
          text: '函数与运算符',
          collapsible: true,
          children: [
            { text: 'UDF函数库', link: 'UDF-Libraries_timecho' },
            { text: '函数与运算符', link: 'Operator-and-Expression' },
            { text: '内置函数与表达式', link: 'Function-and-Expression' },
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
        { text: '研究论文', link: 'Publication' },
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
        {
          text: '配置参数(V1.3.0/1/2)',
          collapsible: true,
          children: [
            { text: '配置参数', link: 'Common-Config-Manual-old' },
            { text: 'ConfigNode配置参数', link: 'ConfigNode-Config-Manual-old' },
            { text: 'DataNode配置参数', link: 'DataNode-Config-Manual-old_timecho' },
          ],
        },
        {
          text: '配置参数(V1.3.3)',
          collapsible: true,
          children: [
            { text: '配置参数', link: 'Common-Config-Manual' },
            { text: 'ConfigNode配置参数', link: 'ConfigNode-Config-Manual' },
            { text: 'DataNode配置参数', link: 'DataNode-Config-Manual_timecho' },
          ],
        },
        {
          text: '语法约定',
          collapsible: true,
          children: [
            { text: '标识符', link: 'Syntax-Rule' },
            { text: '关键字', link: 'Keywords' },
          ],
        },
        { text: '状态码', link: 'Status-Codes' },
      ],
    },
    {
      text: 'FAQ',
      collapsible: true,
      prefix: 'FAQ/',
      // children: 'structure',
      children: [{ text: '常见问题', link: 'Frequently-asked-questions' }],
    },
  ],
};
