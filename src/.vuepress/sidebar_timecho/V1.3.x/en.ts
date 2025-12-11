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
  '/UserGuide/V1.3.x/': [
    {
      text: 'TimechoDB User Guide (V1.3.x)',
      children: [],
    },
    {
      text: 'About TimechoDB',
      collapsible: true,
      prefix: 'IoTDB-Introduction/',
      // children: 'structure', 使用该方式自动获取文件夹下的文件
      children: [
        { text: 'IoTDB Introduction', link: 'IoTDB-Introduction_timecho' },
        { text: 'Scenario', link: 'Scenario' },
        { text: 'Release History', link: 'Release-history_timecho' },
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
        { text: 'Environment Requirements', link: 'Environment-Requirements' },
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
        { text: 'Kubernetes Deployment', link: 'Kubernetes_timecho' },
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
        { text: 'Write Data', link: 'Write-Data' },
        { text: 'Query Data', link: 'Query-Data' },
        {
          text: 'Delete Data',
          collapsible: true,
          children: [
            { text: 'Delete Data', link: 'Delete-Data' },
            { text: 'TTL Delete Data', link: 'TTL-Delete' },
            { text: 'SpaceTL Delete Data', link: 'SpaceTL-Delete' },
          ],
        },
      ],
    },
    {
      text: 'Advanced Features',
      collapsible: true,
      prefix: 'User-Manual/',
      children: [
        { text: 'Data Sync(V1.3.0/1/2)', link: 'Data-Sync-old_timecho' },
        { text: 'Data Sync(V1.3.3)', link: 'Data-Sync_timecho' },
        { text: 'Data Subscription', link: 'Data-subscription' },
        {
          text: 'Stream Computing',
          collapsible: true,
          children: [
            { text: 'Stream Computing Framework', link: 'Streaming_timecho' },
            { text: 'Continuous Query', link: 'Database-Programming' },
            { text: 'Trigger', link: 'Trigger' },
          ],
        },
        { text: 'Tiered Storage', link: 'Tiered-Storage_timecho' },
        { text: 'UDF', link: 'User-defined-function_timecho' },
        { text: 'View', link: 'IoTDB-View_timecho' },
        {
          text: 'Security Permissions',
          collapsible: true,
          children: [
            { text: 'Permission Management', link: 'Authority-Management' },
            { text: 'White List', link: 'White-List_timecho' },
            { text: 'Security Audit', link: 'Audit-Log_timecho' },
          ],
        },
        {
          text: 'System Maintenance',
          collapsible: true,
          children: [
            { text: 'Query Performance Analysis', link: 'Query-Performance-Analysis' },
            { text: 'Load Balance', link: 'Load-Balance' },
            { text: 'Maintenance statement', link: 'Maintenance-commands' },
          ],
        },
      ],
    },
    {
      text: 'AI capability',
      collapsible: true,
      prefix: 'AI-capability/',
      children: [
        { text: 'AINode', link: 'AINode_timecho' },
        { text: 'TimeSeries Large Model', link: 'TimeSeries-Large-Model' },
      ],
    },
    {
      text: 'Tools System',
      collapsible: true,
      prefix: 'Tools-System/',
      // children: 'structure',
      children: [
        { text: 'CLI', link: 'CLI_timecho' },
        { text: 'Workbench', link: 'Workbench_timecho' },
        { text: 'Monitor Tool', link: 'Monitor-Tool_timecho' },
        { text: 'Benchmark Tool', link: 'Benchmark' },
        { text: 'Cluster Management Tool', link: 'Maintenance-Tool_timecho' },
        { text: 'Data Import Export(V1.3.0/1/2)', link: 'Data-Import-Export-Tool' },
        { text: 'TsFile Import Export(V1.3.0/1/2)', link: 'TsFile-Import-Export-Tool' },
        { text: 'Data Import(V1.3.3)', link: 'Data-Import-Tool' },
        { text: 'Data Import(V1.3.4)', link: 'Data-Import-Tool-1-3-4' },
        { text: 'Data Export(V1.3.3)', link: 'Data-Export-Tool' }, 
        { text: 'Data Export(V1.3.4)', link: 'Data-Export-Tool-1-3-4' }, 
        { text: 'Full Backup Tool(V1.3.2)', link: 'Backup-Tool' },
        { text: 'Health Check Tool(V1.3.2)', link: 'Health-Check-Tool' }, 
      ],
    },
    {
      text: 'API',
      collapsible: true,
      prefix: 'API/',
      // children: 'structure',
      children: [
        { text: 'Java Native Interface', collapsible: true,
          children: [
            { text: 'Java Native API', link: 'Programming-Java-Native-API' },
            { text: 'Data Subscription API', link: 'Programming-Data-Subscription' },
          ],
        },
        { text: 'Python Native API', link: 'Programming-Python-Native-API' },
        { text: 'C++ Native API', link: 'Programming-Cpp-Native-API' },
        { text: 'Go Native API', link: 'Programming-Go-Native-API' },
        { text: 'C# Native API', link: 'Programming-CSharp-Native-API' },
        { text: 'Node.js Native API', link: 'Programming-NodeJS-Native-API' },
        { text: 'Rust Native API', link: 'Programming-Rust-Native-API' },
        { text: 'JDBC', link: 'Programming-JDBC' },
        /* { text: 'MQTT Protocol', link: 'Programming-MQTT' }, */
        { text: 'OPC UA Protocol', link: 'Programming-OPC-UA_timecho' },
        { text: 'OPC DA Protocol', link: 'Programming-OPC-DA_timecho' },
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
        {
          text: '‌Data Acquisition',
          collapsible: true,
          children: [
            { text: 'Telegraf Plugin', link: 'Telegraf' },
          ],
        },
        {
          text: 'Data Integration',
          collapsible: true,
          children: [
            { text: 'Apache NiFi', link: 'NiFi-IoTDB' },
            { text: 'Kafka', link: 'Programming-Kafka' },
          ],
        },
        {
          text: '‌Computing Engine',
          collapsible: true,
          children: [
            { text: 'Apache Flink', link: 'Flink-IoTDB' },
            { text: 'Apache Spark', link: 'Spark-IoTDB' },
          ],
        },
        {
          text: '‌Visual Analytics',
          collapsible: true,
          children: [
            { text: 'Apache Zeppelin', link: 'Zeppelin-IoTDB' },
            { text: 'Grafana', link: 'Grafana-Connector' },
            { text: 'Grafana Plugin', link: 'Grafana-Plugin' },
            { text: 'DataEase', link: 'DataEase' },
          ],
        },
        {
          text: '‌SQL Development',
          collapsible: true,
          children: [
            { text: 'DBeaver', link: 'DBeaver' },
          ],
        },
        {
          text: '‌IoT Platform',
          collapsible: true,
          children: [
            { text: 'Ignition', link: 'Ignition-IoTDB-plugin_timecho' },
            { text: 'ThingsBoard', link: 'Thingsboard' },
          ],
        },
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
          text: 'Config Manual(V1.3.0/1/2)',
          collapsible: true,
          children: [
            { text: 'Common Config Manual', link: 'Common-Config-Manual-old' },
            { text: 'ConfigNode Config Manual', link: 'ConfigNode-Config-Manual-old' },
            { text: 'DataNode Config Manual', link: 'DataNode-Config-Manual-old_timecho' },
          ],
        },
        {
          text: 'Config Manual(V1.3.3)',
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
