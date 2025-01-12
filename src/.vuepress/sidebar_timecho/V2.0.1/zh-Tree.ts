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
  '/zh/UserGuide/V2.0.1/Tree': [
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
        { text: 'AINode部署', link: 'AINode_Deployment_timecho' },
        { text: '监控面板部署', link: 'Monitoring-panel-deployment' },
        { text: '可视化控制台部署', link: 'workbench-deployment_timecho' },
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
        { text: '写入&删除', link: 'Write-Delete-Data' },
        { text: '数据查询', link: 'Query-Data' },
      ],
    },
    {
      text: '高级功能',
      collapsible: true,
      prefix: 'User-Manual/',
      // children: 'structure',
      children: [
        { text: '数据同步', link: 'Data-Sync_timecho' },
        { text: '数据订阅', link: 'Data-subscription' },
        { text: 'AI能力', link: 'AINode_timecho' },
        {
          text: '安全管理',
          collapsible: true,
          children: [
            { text: '白名单', link: 'White-List_timecho' },
            { text: '审计日志', link: 'Audit-Log_timecho' },
            { text: '权限管理', link: 'Authority-Management' },
          ],
        },
        { text: '用户自定义函数', link: 'User-defined-function_timecho' },
        { text: '视图', link: 'IoTDB-View_timecho' },
        { text: '多级存储', link: 'Tiered-Storage_timecho' },
        { text: '连续查询', link: 'Database-Programming' },
        {
          text: '数据库编程',
          collapsible: true,
          children: [
            { text: 'UDF开发', link: 'UDF-development' },
            { text: '触发器', link: 'Trigger' },
            { text: '流处理框架', link: 'Streaming_timecho' },
          ],
        },
        {
          text: '运维语句',
          collapsible: true,
          children: [
            { text: '查询性能分析', link: 'Query-Performance-Analysis' },
            { text: '负载均衡', link: 'Load-Balance' },
            { text: '数据修复', link: 'Data-Recovery' },
          ],
        },
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
        { text: '监控工具', link: 'Monitor-Tool_timecho' },
        { text: '测试工具', link: 'Benchmark' },
        { text: '集群管理工具', link: 'Maintenance-Tool_timecho' },
        { text: '数据导入', link: 'Data-Import-Tool' },
        { text: '数据导出', link: 'Data-Export-Tool' },
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
        { text: 'Rust', link: 'Programming-Rust-Native-API' },
        { text: 'JDBC (不推荐)', link: 'Programming-JDBC' },
        { text: 'MQTT协议', link: 'Programming-MQTT' },
        { text: 'OPC UA协议', link: 'Programming-OPC-UA_timecho' },
        { text: 'Kafka', link: 'Programming-Kafka' },
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
      text: '系统集成',
      collapsible: true,
      prefix: 'Ecosystem-Integration/',
      // children: 'structure',
      children: [
        { text: 'Apache Flink(IoTDB)', link: 'Flink-IoTDB' },
        { text: 'Apache Flink(TsFile)', link: 'Flink-TsFile' },
        { text: 'Apache Hive(TsFile)', link: 'Hive-TsFile' },
        { text: 'Apache NiFi', link: 'NiFi-IoTDB' },
        { text: 'Apache Spark(TsFile)', link: 'Spark-TsFile' },
        { text: 'Apache Spark(IoTDB)', link: 'Spark-IoTDB' },
        { text: 'Apache Zeppelin', link: 'Zeppelin-IoTDB_timecho' },
        { text: 'DataEase', link: 'DataEase' },
        { text: 'DBeaver', link: 'DBeaver' },
        { text: 'Ignition', link: 'Ignition-IoTDB-plugin_timecho' },
        { text: 'Grafana(IoTDB)', link: 'Grafana-Connector' },
        { text: 'Grafana插件', link: 'Grafana-Plugin' },
        { text: 'Kubernetes', link: 'Kubernetes_timecho' },
        { text: 'ThingsBoard', link: 'Thingsboard' },
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
      text: '参考',
      collapsible: true,
      prefix: 'Reference/',
      // children: 'structure',
      children: [
        {
          text: '配置参数',
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
