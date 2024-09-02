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
  '/zh/UserGuide/V1.2.x/': [
    {
      text: 'IoTDB用户手册 (V1.2.x)',
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
        { text: '部署准备', link: 'Deployment-Preparation' },
        { text: '资源推荐', link: 'Deployment-Recommendation' },
        { text: '部署指导', link: 'Deployment-Guide' },
        { text: 'docker部署', link: 'Docker-Install' },
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
        { text: '数据写入与删除', link: 'Write-Delete-Data' },
        { text: '数据查询', link: 'Query-Data' },
        { text: '运算符和表达式', link: 'Operator-and-Expression' },
        { text: '流处理框架', link: 'Streaming' },
        { text: '数据同步', link: 'Data-Sync' },
        { text: '数据库编程', link: 'Database-Programming' },
        { text: '权限管理', link: 'Authority-Management' },
      ],
    },
    {
      text: '工具体系',
      collapsible: true,
      prefix: 'Tools-System/',
      // children: 'structure',
      children: [
        { text: 'SQL命令行终端 (CLI)', link: 'CLI' },
        { text: '监控工具', link: 'Monitor-Tool' },
        { text: '测试工具', link: 'Benchmark' },
        { text: '运维工具', link: 'Maintenance-Tool' },
        { text: '导入导出工具', link: 'Import-Export-Tool' },
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
        { text: 'C++原生接口', link: 'Programming-Cpp-Native-API' },
        { text: 'Go原生接口', link: 'Programming-Go-Native-API' },
        { text: 'C#原生接口', link: 'Programming-CSharp-Native-API' },
        { text: 'Node.js原生接口', link: 'Programming-NodeJS-Native-API' },
        { text: 'Rust原生接口', link: 'Programming-Rust-Native-API' },
        { text: 'JDBC (不推荐)', link: 'Programming-JDBC' },
        { text: 'MQTT', link: 'Programming-MQTT' },
        { text: 'Kafka', link: 'Programming-Kafka' },
        { text: 'REST API V1 (不推荐)', link: 'RestServiceV1' },
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
        { text: 'Grafana插件', link: 'Grafana-Plugin' },
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
        { text: 'Telegraf', link: 'Telegraf-IoTDB' },
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
        { text: 'UDF函数库', link: 'UDF-Libraries' },
        { text: '配置参数', link: 'Common-Config-Manual' },
        { text: 'ConfigNode配置参数', link: 'ConfigNode-Config-Manual' },
        { text: 'DataNode配置参数', link: 'DataNode-Config-Manual' },
        { text: '状态码', link: 'Status-Codes' },
        { text: '关键字', link: 'Keywords' },
      ],
    },
  ],
};
