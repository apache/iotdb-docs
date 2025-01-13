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

export const enSidebar = {
  '/UserGuide/latest/': [
    {
      text: 'IoTDB User Guide',
      children: [],
    },
    {
      text: 'About IoTDB',
      collapsible: true,
      prefix: 'IoTDB-Introduction/',
      // children: 'structure', 使用该方式自动获取文件夹下的文件
      children: [
        { text: 'IoTDB Introduction', link: 'IoTDB-Introduction_timecho' },
        { text: 'Scenario', link: 'Scenario' },
      ],
    },
    {
      text: 'Background knowledge',
      collapsible: true,
      prefix: 'Background-knowledge/',
      children: [
        { text: 'Common Concepts', link: 'Cluster-Concept_timecho' },
        { text: 'Data Type', link: 'Data-Type' },
      ],
    },
    {
      text: 'Quick Start',
      link: 'QuickStart/QuickStart_timecho',
    },
    {
      text: 'Deployment & Maintenance',
      collapsible: true,
      prefix: 'Deployment-and-Maintenance/',
      // children: 'structure',
      children: [
        { text: 'Obtain TimechoDB', link: 'IoTDB-Package_timecho' },
        { text: 'Database Resources', link: 'Database-Resources' },
        { text: 'System Requirements', link: 'Environment-Requirements' },
        {
          text: 'Stand-Alone Deployment',
          link: 'Stand-Alone-Deployment_timecho',
        },
        { text: 'Cluster Deployment', link: 'Cluster-Deployment_timecho' },
        {
          text: 'Dual Active Deployment',
          link: 'Dual-Active-Deployment_timecho',
        },
        { text: 'Docker Deployment', link: 'Docker-Deployment_timecho' },
        { text: 'AINode Deployment', link: 'AINode_Deployment_timecho' },
        {
          text: 'Monitoring Panel Deployment',
          link: 'Monitoring-panel-deployment',
        },
        { text: 'Workbench Deployment', link: 'workbench-deployment_timecho' },
      ],
    },
    {
      text: 'Basic Functions',
      collapsible: true,
      prefix: 'Basic-Concept/',
      // children: 'structure',
      children: [
        {
          text: 'Data Modeling',
          collapsible: true,
          children: [
            {
              text: 'Timeseries Data Model',
              link: 'Navigating_Time_Series_Data',
            },
            {
              text: 'Modeling Scheme Design',
              link: 'Data-Model-and-Terminology',
            },
            {
              text: 'Measurement Point Management',
              link: 'Operate-Metadata_timecho',
            },
          ],
        },
        { text: 'Write & Delete', link: 'Write-Delete-Data' },
        { text: 'Query Data', link: 'Query-Data' },
      ],
    },
    {
      text: 'Advanced Features',
      collapsible: true,
      prefix: 'User-Manual/',
      // children: 'structure',
      children: [
        { text: 'Data Sync', link: 'Data-Sync_timecho' },
        { text: 'Data Subscription', link: 'Data-subscription' },
        { text: 'AI Capability', link: 'AINode_timecho' },
        {
          text: 'Security Management',
          collapsible: true,
          children: [
            { text: 'White List', link: 'White-List_timecho' },
            { text: 'Audit Log', link: 'Audit-Log_timecho' },
            { text: 'Authority Management', link: 'Authority-Management' },
          ],
        },
        { text: 'UDF', link: 'User-defined-function_timecho' },
        { text: 'View', link: 'IoTDB-View_timecho' },
        { text: 'Tiered Storage', link: 'Tiered-Storage_timecho' },
        { text: 'Continuous Query', link: 'Database-Programming' },
        {
          text: 'Database Programming',
          collapsible: true,
          children: [
            { text: 'UDF Development', link: 'UDF-development' },
            { text: 'Trigger', link: 'Trigger' },
            { text: 'Stream Processing', link: 'Streaming_timecho' },
          ],
        },
        {
          text: 'Maintenance SQL',
          collapsible: true,
          children: [
            { text: 'Query Performance Analysis', link: 'Query-Performance-Analysis' },
            { text: 'Load Balance', link: 'Load-Balance' },
            { text: 'Data Recovery', link: 'Data-Recovery' },
          ],
        },
      ],
    },
    {
      text: 'Tools System',
      collapsible: true,
      prefix: 'Tools-System/',
      // children: 'structure',
      children: [
        { text: 'CLI', link: 'CLI' },
        { text: 'Workbench', link: 'Workbench_timecho' },
        { text: 'Monitor Tool', link: 'Monitor-Tool_timecho' },
        { text: 'Benchmark Tool', link: 'Benchmark' },
        { text: 'Cluster Management Tool', link: 'Maintenance-Tool_timecho' },
        { text: 'Data Import', link: 'Data-Import-Tool' },
        { text: 'Data Export', link: 'Data-Export-Tool' },
      ],
    },
    {
      text: 'API',
      collapsible: true,
      prefix: 'API/',
      // children: 'structure',
      children: [
        { text: 'Java Native API', link: 'Programming-Java-Native-API' },
        { text: 'Python Native API', link: 'Programming-Python-Native-API' },
        { text: 'C++ Native API', link: 'Programming-Cpp-Native-API' },
        { text: 'Go Native API', link: 'Programming-Go-Native-API' },
        { text: 'C# Native API', link: 'Programming-CSharp-Native-API' },
        { text: 'Node.js Native API', link: 'Programming-NodeJS-Native-API' },
        { text: 'Rust Native API', link: 'Programming-Rust-Native-API' },
        { text: 'JDBC (Not Recommend)', link: 'Programming-JDBC' },
        { text: 'MQTT Protocol', link: 'Programming-MQTT' },
        { text: 'OPC UA Protocol', link: 'Programming-OPC-UA_timecho' },
        { text: 'Kafka', link: 'Programming-Kafka' },
        {
          text: 'REST API',
          collapsible: true,
          children: [
            { text: 'V1 (Not Recommend)', link: 'RestServiceV1' },
            { text: 'V2', link: 'RestServiceV2' },
          ],
        },
      ],
    },
    {
      text: 'Ecosystem Integration',
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
        { text: 'Grafana Plugin', link: 'Grafana-Plugin' },
        { text: 'Kubernetes', link: 'Kubernetes_timecho' },
        { text: 'Telegraf Plugin', link: 'Telegraf' },
        { text: 'ThingsBoard', link: 'Thingsboard' },
      ],
    },
    {
      text: 'SQL Manual',
      collapsible: true,
      prefix: 'SQL-Manual/',
      // children: 'structure',
      children: [
        { text: 'SQL Manual', link: 'SQL-Manual' },
        {
          text: 'Functions and Operators',
          collapsible: true,
          children: [
            { text: 'UDF Libraries', link: 'UDF-Libraries_timecho' },
            {
              text: 'Operator and Expression',
              link: 'Operator-and-Expression',
            },
            {
              text: 'Function and Expression',
              link: 'Function-and-Expression',
            },
          ],
        },
      ],
    },
    {
      text: 'Technical Insider',
      collapsible: true,
      prefix: 'Technical-Insider/',
      // children: 'structure',
      children: [
        { text: 'Research Paper ', link: 'Publication' },
        { text: 'Compression & Encoding', link: 'Encoding-and-Compression' },
        {
          text: 'Data Partitioning & Load Balancing',
          link: 'Cluster-data-partitioning',
        },
      ],
    },
    {
      text: 'Reference',
      collapsible: true,
      prefix: 'Reference/',
      // children: 'structure',
      children: [
        {
          text: 'Config Manual',
          collapsible: true,
          children: [
            { text: 'Common Config Manual', link: 'Common-Config-Manual' },
            {
              text: 'ConfigNode Config Manual',
              link: 'ConfigNode-Config-Manual',
            },
            { text: 'DataNode Config Manual', link: 'DataNode-Config-Manual_timecho' },
          ],
        },
        {
          text: 'Syntax-Rule',
          collapsible: true,
          children: [
            { text: 'Identifiers', link: 'Syntax-Rule' },
            { text: 'Keywords', link: 'Keywords' },
          ],
        },
        { text: 'Status Codes', link: 'Status-Codes' },
      ],
    },
    {
      text: 'FAQ',
      collapsible: true,
      prefix: 'FAQ/',
      // children: 'structure',
      children: [
        {
          text: 'Frequently Asked Questions',
          link: 'Frequently-asked-questions',
        },
      ],
    },
  ],
};
