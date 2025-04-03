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
  '/UserGuide/latest-Table/': [
    {
      text: 'IoTDB User Guide',
      children: [],
    },
    {
      text: 'About IoTDB',
      collapsible: true,
      prefix: 'IoTDB-Introduction/',
      children: [
        { text: 'IoTDB Introduction', link: 'IoTDB-Introduction_timecho' },
        { text: 'Scenario', link: 'Scenario' },
        { text: 'Release history', link: 'Release-history_timecho' },
      ],
    },
    {
      text: 'Background knowledge',
      collapsible: true,
      prefix: 'Background-knowledge/',
      children: [
        { text: 'Common Concepts', link: 'Cluster-Concept_timecho' },
        { text: 'Timeseries Data Model', link: 'Navigating_Time_Series_Data' },
        { text: 'Modeling Scheme Design', link: 'Data-Model-and-Terminology_timecho' },
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
        {
          text: 'Monitoring Panel Deployment',
          link: 'Monitoring-panel-deployment',
        },
      ],
    },
    {
      text: 'Basic Functions',
      collapsible: true,
      prefix: 'Basic-Concept/',
      children: [
        { text: 'Database Management', link: 'Database-Management' },
        { text: 'Table Management', link: 'Table-Management' },
        { text: 'Write&Updata Data', link: 'Write-Updata-Data' },
        { text: 'Query Data', link: 'Query-Data' },
        {
          text: 'Delete Data',
          collapsible: true,
          children: [
            { text: 'Delete Data', link: 'Delete-Data' },
            { text: 'TTL Delete Data', link: 'TTL-Delete-Data' },
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
        { text: 'UDF', link: 'User-defined-function' },
        {
          text: 'Security Permissions',
          collapsible: true,
          children: [
            { text: 'Authority Management', link: 'Authority-Management' },
          ],
        },
        { text: 'Tiered Storage', link: 'Tiered-Storage_timecho' },
        {
          text: 'System Maintenance',
          collapsible: true,
          children: [
            { text: 'Query Performance Analysis', link: 'Query-Performance-Analysis' },
            { text: 'Maintenance statement', link: 'Maintenance-commands' },
          ],
        },
      ],
    },
    {
      text: 'Tools System',
      collapsible: true,
      prefix: 'Tools-System/',
      children: [
        { text: 'CLI', link: 'CLI' },
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
      children: [
        { text: 'Java Native API', link: 'Programming-Java-Native-API_timecho' },
        { text: 'Python Native API', link: 'Programming-Python-Native-API' },
        { text: 'C++ Native API', link: 'Programming-Cpp-Native-API' },
        { text: 'C# Native API', link: 'Programming-CSharp-Native-API' },
        { text: 'JDBC', link: 'Programming-JDBC_timecho' },
        { text: 'RESTAPI V1 ', link: 'RestAPI-V1' },
      ],
    },
    {
      text: 'Ecosystem Integration',
      collapsible: true,
      prefix: 'Ecosystem-Integration/',
      children: [
        { text: 'DBeaver', link: 'DBeaver' },
      ],
    },
    {
      text: 'SQL Manual',
      collapsible: true,
      prefix: 'SQL-Manual/',
      children: [
        { text: 'Identifier', link: 'Identifier' },
        { text: 'Keywords', link: 'Keywords' },
        {
          text: 'Query statement',
          collapsible: true,
          children: [
            { text: 'overview', link: 'overview' },
            { text: 'SELECT Clause', link: 'Select-Clause' },
            { text: 'FROM&JOIN Clause', link: 'From-Join-Clause' },
            { text: 'WHERE Clause', link: 'Where-Clause' },
            { text: 'GROUP BY Clause', link: 'GroupBy-Clause' },
            { text: 'HAVING Clause', link: 'Having-Clause' },
            { text: 'FILL Clause', link: 'Fill-Clause' },
            { text: 'ORDER BY Clause', link: 'OrderBy-Clause' },
            { text: 'LIMIT&OFFSET Clause', link: 'Limit-Offset-Clause' },
            { text: 'Nested Queries', link: 'Nested-Queries' },
          ],
        },
        {
          text: 'Functions and Operators',
          collapsible: true,
          children: [
            { text: 'Basis Functions', link: 'Basis-Function' },
            { text: 'Featured Functions', link: 'Featured-Functions' },
          ],
        },

      ],
    },
    {
      text: 'Technical Insider',
      collapsible: true,
      prefix: 'Technical-Insider/',
      children: [
        { text: 'Compression & Encoding', link: 'Encoding-and-Compression' },
        { text: 'Data Partitioning & Load Balancing', link: 'Cluster-data-partitioning' },
      ],
    },
    {
      text: 'Reference',
      collapsible: true,
      prefix: 'Reference/',
      children: [
        { text: 'Sample Data', link: 'Sample-Data' },
        { text: 'Config Manual', link: 'System-Config-Manual' },
        { text: 'Status Codes', link: 'Status-Codes' },
        { text: 'System Tables', link: 'System-Tables' },
      ],
    },
  ],
};