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

export const zhSidebar = {
  '/zh/UserGuide/latest/': [
    {
      text: 'IoTDB用户手册 (V1.3.x)',
      children: [],
    },
    {
      text: '关于IoTDB',
      collapsible: true,
      prefix: 'IoTDB-Introduction/',
      // children: 'structure', 使用该方式自动获取文件夹下的文件
      children: [
        { text: 'IoTDB简介', link: 'What-is-IoTDB' },
        { text: '主要功能特点', link: 'Features' },
        { text: '系统架构', link: 'Architecture' },
        { text: '性能特点', link: 'Performance' },
        { text: '应用场景', link: 'Scenario' },
        { text: '研究论文', link: 'Publication' },
      ],
    },
    {
      text: '快速上手',
      collapsible: true,
      prefix: 'QuickStart/',
      // children: 'structure',
      children: [
        { text: '单机版', link: 'QuickStart' },
        { text: '集群版', link: 'ClusterQuickStart' },
        { text: '常用SQL语句', link: 'General-SQL-Statements' },
      ],
    },
    {
      text: '基础概念',
      collapsible: true,
      prefix: 'Basic-Concept/',
      // children: 'structure',
      children: [
        { text: '数据模型', link: 'Data-Model-and-Terminology' },
        { text: '数据类型', link: 'Data-Type' },
        { text: '编码和压缩', link: 'Encoding-and-Compression' },
        { text: '数据分区与负载均衡', link: 'Cluster-data-partitioning' },
      ],
    },
    {
      text: '部署与运维',
      collapsible: true,
      prefix: 'Deployment-and-Maintenance/',
      // children: 'structure',
      children: [
        { text: '环境要求', link: 'Environmental-Requirement' },
        { text: '资源推荐', link: 'Deployment-Recommendation' },
        { text: '部署指导', link: 'Deployment-Guide_timecho' },
        { text: 'docker部署', link: 'Docker-Install' },
        { text: '监控面板安装部署', link: 'Monitoring-Board-Install-and-Deploy' },
      ],
    },

    {
      text: '使用手册',
      collapsible: true,
      prefix: 'User-Manual/',
      // children: 'structure',
      children: [
        { text: '语法约定', link: 'Syntax-Rule' },
        { text: '元数据管理', link: 'Operate-Metadata' },
        { text: '数据增删', link: 'Write-Delete-Data' },
        { text: '数据查询', link: 'Query-Data' },
        { text: '运算符和表达式', link: 'Operator-and-Expression' },
        { text: '流处理', link: 'Streaming_timecho' },
        { text: '数据同步', link: 'Data-Sync_timecho' },
        { text: '多级存储', link: 'Tiered-Storage_timecho' },
        { text: '视图', link: 'IoTDB-View_timecho' },
        { text: 'AINode', link: 'AINode_timecho' },
        { text: '数据库编程', link: 'Database-Programming' },
        { text: '安全控制', link: 'Security-Management_timecho' },
        { text: '权限管理', link: 'Authority-Management' },
      ],
    },
    {
      text: '工具体系',
      collapsible: true,
      prefix: 'Tools-System/',
      // children: 'structure',
      children: [
        { text: '命令行工具', link: 'CLI' },
        { text: '可视化控制台', link: 'Workbench_timecho' },
        { text: '监控工具', link: 'Monitor-Tool' },
        { text: '测试工具', link: 'Benchmark' },
        { text: '运维工具', link: 'Maintenance-Tool_timecho' },
        { text: '导入导出工具', link: 'Import-Export-Tool' },
      ],
    },
    {
      text: '应用编程接口',
      collapsible: true,
      prefix: 'API/',
      // children: 'structure',
      children: [
        { text: 'Java 原生接口', link: 'Programming-Java-Native-API' },
        { text: 'Python', link: 'Programming-Python-Native-API' },
        { text: 'C++', link: 'Programming-Cpp-Native-API' },
        { text: 'Go', link: 'Programming-Go-Native-API' },
        { text: 'C#', link: 'Programming-CSharp-Native-API' },
        { text: 'Node.js', link: 'Programming-NodeJS-Native-API' },
        { text: 'Rust', link: 'Programming-Rust-Native-API' },
        { text: 'JDBC (不推荐)', link: 'Programming-JDBC' },
        { text: 'MQTT', link: 'Programming-MQTT' },
        { text: 'Kafka', link: 'Programming-Kafka' },
        { text: 'REST API V1', link: 'RestServiceV1' },
        { text: 'REST API V2', link: 'RestServiceV2' },
        { text: 'TsFile API', link: 'Programming-TsFile-API' },
      ],
    },
    {
      text: '系统集成',
      collapsible: true,
      prefix: 'Ecosystem-Integration/',
      // children: 'structure',
      children: [
        { text: 'Grafana-Plugin', link: 'Grafana-Plugin' },
        { text: 'Grafana-IoTDB-Connector', link: 'Grafana-Connector' },
        { text: 'Zeppelin-IoTDB-Connector', link: 'Zeppelin-IoTDB' },
        { text: 'Spark-TsFile-Connector', link: 'Spark-TsFile' },
        { text: 'Spark-IoTDB-Connector', link: 'Spark-IoTDB' },
        { text: 'Hive-TsFile-Connector', link: 'Hive-TsFile' },
        { text: 'Flink-IoTDB-Connector', link: 'Flink-IoTDB' },
        //        { text: 'Flink-SQL-IoTDB-Connector', link: 'Flink-SQL-IoTDB' },
        { text: 'Flink-TsFile-Connector', link: 'Flink-TsFile' },
        { text: 'NiFi-IoTDB-Connector', link: 'NiFi-IoTDB' },
        { text: 'DBeaver-IoTDB 集成方案', link: 'DBeaver' },
      ],
    },
    {
      text: 'SQL手册',
      collapsible: true,
      prefix: 'SQL-Manual/',
      // children: 'structure',
      children: [
        { text: 'SQL手册', link: 'SQL-Manual' },
      ],
    },
    {
      text: 'FAQ',
      collapsible: true,
      prefix: 'FAQ/',
      // children: 'structure',
      children: [
        { text: '常见问题', link: 'Frequently-asked-questions' }],
    },
    {
      text: '参考',
      collapsible: true,
      prefix: 'Reference/',
      // children: 'structure',
      children: [
        { text: 'UDF 函数库', link: 'UDF-Libraries' },
        { text: '内置函数与表达式', link: 'Function-and-Expression' },
        { text: '配置参数', link: 'Common-Config-Manual' },
        { text: 'ConfigNode配置参数', link: 'ConfigNode-Config-Manual' },
        { text: 'DataNode配置参数', link: 'DataNode-Config-Manual' },
        { text: '状态码', link: 'Status-Codes' },
        { text: '关键字', link: 'Keywords' },
      ],
    },
  ],
};
