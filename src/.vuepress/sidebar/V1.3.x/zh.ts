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
  '/zh/UserGuide/V1.3.0-V1.3.2/': [
    {
      text: 'IoTDB用户手册 (V1.3.0/1/2)',
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
        { text: '学术成果', link: 'Publication' },
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
        { text: '走进时序数据', link: 'Navigating_Time_Series_Data' },
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
        { text: '安装包获取', link: 'IoTDB-Package' },
        { text: '资源规划', link: 'Database-Resources' },
        { text: '环境要求', link: 'Environment-Requirements' },
        { text: '单机版部署', link: 'Stand-Alone-Deployment' },
        { text: '集群版部署', link: 'Cluster-Deployment' },
        { text: 'Docker部署', link: 'Docker-Deployment' },
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
        { text: '流处理', link: 'Streaming' },
        { text: '数据同步', link: 'Data-Sync' },
        { text: '数据库编程', link: 'Database-Programming' },
        { text: '权限管理', link: 'Authority-Management' },
        { text: '运维语句', link: 'Maintennance' },
      ],
    },
    {
      text: '工具体系',
      collapsible: true,
      prefix: 'Tools-System/',
      // children: 'structure',
      children: [
        { text: '命令行工具', link: 'CLI' },
        { text: '监控工具', link: 'Monitor-Tool' },
        { text: '测试工具', link: 'Benchmark' },
        { text: '运维工具', link: 'Maintenance-Tool' },
        { text: '数据导入导出脚本', link: 'Data-Import-Export-Tool' },
        { text: 'TsFile导入导出脚本', link: 'TsFile-Import-Export-Tool' },
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
        { text: 'REST API V1 (不推荐)', link: 'RestServiceV1' },
        { text: 'REST API V2', link: 'RestServiceV2' },
      ],
    },
    {
      text: '系统集成',
      collapsible: true,
      prefix: 'Ecosystem-Integration/',
      // children: 'structure',
      children: [
        { text: 'Grafana Plugin', link: 'Grafana-Plugin' },
        { text: 'Grafana(IoTDB)', link: 'Grafana-Connector' },
        { text: 'Apache Zeppelin', link: 'Zeppelin-IoTDB' },
        { text: 'Apache Spark(TsFile)', link: 'Spark-TsFile' },
        { text: 'Apache Spark(IoTDB)', link: 'Spark-IoTDB' },
        { text: 'Apache Hive(TsFile)', link: 'Hive-TsFile' },
        { text: 'Apache Flink(IoTDB)', link: 'Flink-IoTDB' },
        { text: 'Apache Flink(SQL)', link: 'Flink-SQL-IoTDB' },
        { text: 'Apache Flink(TsFile)', link: 'Flink-TsFile' },
        { text: 'Apache NiFi', link: 'NiFi-IoTDB' },
        { text: 'DBeaver', link: 'DBeaver' },
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
