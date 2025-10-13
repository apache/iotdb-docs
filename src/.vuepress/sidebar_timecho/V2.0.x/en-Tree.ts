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
      text: 'TimechoDB User Guide (V2.0.x)',
      children: [],
    },
    {
      text: 'About TimechoDB',
      collapsible: true,
      prefix: 'IoTDB-Introduction/',
      children: [
        { text: 'IoTDB Introduction', link: 'IoTDB-Introduction_timecho' },
        { text: 'Scenario', link: 'Scenario' },
        { text: 'Release History', link: 'Release-history_timecho' },
        { text: 'Vulnerability submission', link: 'Vulnerability-submission' },
      ],
    },
    {
      text: 'Background knowledge',
      collapsible: true,
      prefix: 'Background-knowledge/',
      children: [
        { text: 'Common Concepts', link: 'Cluster-Concept_timecho' },
        {
          text: 'Timeseries Data Model',
          link: 'Navigating_Time_Series_Data',
        },
        {
          text: 'Modeling Scheme Design',
          link: 'Data-Model-and-Terminology_timecho',
        },
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
      children: [
        { text: 'Deployment form', link: 'Deployment-form_timecho' },
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
      children: [
        {
          text: 'Data Modeling',
          link: 'Operate-Metadata_timecho',
        },
        { text: 'Write Data', link: 'Write-Data' },
        { text: 'Query Data', link: 'Query-Data' },
        {
          text: 'Delete Data',
          collapsible: true,
          children: [
            { text: 'Delete Data', link: 'Delete-Data' },
            { text: 'TTL Delete Data', link: 'TTL-Delete' },
          ],
        },
      ],
    },
    {
      text: 'Advanced Features',
      collapsible: true,
      prefix: 'User-Manual/',
      children: [
        { text: 'Data Sync', link: 'Data-Sync_timecho' },
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
      children: [
        { text: 'CLI', link: 'CLI_timecho' },
        { text: 'Workbench', link: 'Workbench_timecho' },
        { text: 'Monitor Tool', link: 'Monitor-Tool_timecho' },
        { text: 'Benchmark Tool', link: 'Benchmark' },
        { text: 'Cluster Management Tool', link: 'Maintenance-Tool_timecho' },
        { text: 'Data Import & Export', collapsible: true,
          children: [
            { text: 'Data Import', link: 'Data-Import-Tool' },
            { text: 'Data Export', link: 'Data-Export-Tool' },
          ],
        },
        { text: 'Schema Import & Export', collapsible: true,
          children: [
            { text: 'Schema Import', link: 'Schema-Import-Tool' },
            { text: 'Schema Export', link: 'Schema-Export-Tool' },
          ],
        },
        { text: 'Full Backup Tool', link: 'Backup-Tool' },
        { text: 'Health Check Tool', link: 'Health-Check-Tool' },
      ],
    },
    {
      text: 'API',
      collapsible: true,
      prefix: 'API/',
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
      children: [
        { text: 'Overview', link: 'Ecosystem-Overview_timecho' },
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
      children: [
        { text: 'Identifiers', link: 'Syntax-Rule' },
        { text: 'Keywords', link: 'Keywords' },
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
        { text: 'Status Codes', link: 'Status-Codes' },
      ],
    },
    {
      text: 'FAQ',
      collapsible: true,
      prefix: 'FAQ/',
      children: [
        {
          text: 'Frequently Asked Questions',
          link: 'Frequently-asked-questions',
        },
      ],
    },
  ],
};