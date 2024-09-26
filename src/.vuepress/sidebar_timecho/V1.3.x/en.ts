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

export const enSidebar = {
  '/UserGuide/latest/': [
    {
      text: 'IoTDB User Guide (V1.3.3)',
      children: [],
    },
    {
      text: 'About IoTDB',
      collapsible: true,
      prefix: 'IoTDB-Introduction/',
      // children: 'structure',
      children: [
        { text: 'What is IoTDB', link: 'What-is-IoTDB' },
        { text: 'Features', link: 'Features' },
        { text: 'System Architecture', link: 'Architecture' },
        { text: 'Performance', link: 'Performance' },
        { text: 'Scenario', link: 'Scenario' },
        { text: 'Academic Achievement', link: 'Publication' },
      ],
    },
    {
      text: 'Quick Start',
      link: 'QuickStart/QuickStart_timecho',
    },
    {
      text: 'Basic Concept',
      collapsible: true,
      prefix: 'Basic-Concept/',
      // children: 'structure',
      children: [
        { text: 'Navigating Time Series Data', link: 'Navigating_Time_Series_Data' },
        { text: 'Data Model', link: 'Data-Model-and-Terminology' },
        { text: 'Data Type', link: 'Data-Type' },
        { text: 'Encoding and Compression', link: 'Encoding-and-Compression' },
        { text: 'Data Partitioning & Load Balancing', link: 'Cluster-data-partitioning' },
      ],
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
        { text: 'Stand-Alone Deployment', link: 'Stand-Alone-Deployment_timecho' },
        { text: 'Cluster Deployment', link: 'Cluster-Deployment_timecho' },
        { text: 'Dual Active Deployment', link: 'Dual-Active-Deployment_timecho' },
        { text: 'Docker Deployment', link: 'Docker-Deployment_timecho' },
        { text: 'AINode Deployment', link: 'AINode_Deployment_timecho' },
        { text: 'Monitoring Panel Deployment', link: 'Monitoring-panel-deployment' },
        { text: 'Workbench Deployment', link: 'workbench-deployment' },
      ],
    },

    {
      text: 'User Manual',
      collapsible: true,
      prefix: 'User-Manual/',
      // children: 'structure',
      children: [
        { text: 'Syntax Rule', link: 'Syntax-Rule' },
        { text: 'Operate Metadata', link: 'Operate-Metadata_timecho' },
        { text: 'Write & Delete Data', link: 'Write-Delete-Data' },
        { text: 'Query Data', link: 'Query-Data' },
        { text: 'Operator and Expression', link: 'Operator-and-Expression' },
        { text: 'Streaming Framework', link: 'Streaming_timecho' },
        { text: 'Data Sync', link: 'Data-Sync_timecho' },
        { text: 'Tiered Storage', link: 'Tiered-Storage_timecho' },
        { text: 'View', link: 'IoTDB-View_timecho' },
        { text: 'AI Capability', link: 'AINode_timecho' },
        { text: 'Database Programming', link: 'Database-Programming' },
        { text: 'Security Management', link: 'Security-Management_timecho' },
        { text: 'Database Administration', link: 'Authority-Management' },
        { text: 'Maintennance', link: 'Maintennance' },
      ],
    },
    {
      text: 'Tools System',
      collapsible: true,
      prefix: 'Tools-System/',
      // children: 'structure',
      children: [
        { text: 'Command Line Interface (CLI)', link: 'CLI' },
        { text: 'Workbench', link: 'Workbench_timecho' },
        { text: 'Monitor Tool', link: 'Monitor-Tool_timecho' },
        { text: 'Benchmark Tool', link: 'Benchmark' },
        { text: 'Maintenance Tool', link: 'Maintenance-Tool_timecho' },
        { text: 'Data Import Export Script', link: 'Data-Import-Export-Tool' },
        { text: 'TsFile Import Export Script', link: 'TsFile-Import-Export-Tool' },
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
        { text: 'Kafka', link: 'Programming-Kafka' },
        { text: 'REST API V1 (Not Recommend)', link: 'RestServiceV1' },
        { text: 'REST API V2', link: 'RestServiceV2' },
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
      ],
    },
    {
      text: 'FAQ',
      collapsible: true,
      prefix: 'FAQ/',
      // children: 'structure',
      children: [
        { text: 'Frequently Asked Questions', link: 'Frequently-asked-questions' }],
    },
    {
      text: 'Reference',
      collapsible: true,
      prefix: 'Reference/',
      // children: 'structure',
      children: [
        { text: 'UDF Libraries', link: 'UDF-Libraries' },
        { text: 'Function and Expression', link: 'Function-and-Expression' },
        { text: 'Common Config Manual', link: 'Common-Config-Manual' },
        { text: 'ConfigNode Config Manual', link: 'ConfigNode-Config-Manual' },
        { text: 'DataNode Config Manual', link: 'DataNode-Config-Manual' },
        { text: 'Status Codes', link: 'Status-Codes' },
        { text: 'Keywords', link: 'Keywords' },
      ],
    },
  ],
};
