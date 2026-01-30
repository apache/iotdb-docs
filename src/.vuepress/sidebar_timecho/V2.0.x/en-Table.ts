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
      text: 'TimechoDB User Guide (V2.0.x)',
      children: [],
    },
    {
      text: 'About TimechoDB',
      collapsible: true,
      prefix: 'IoTDB-Introduction/',
      children: [
        { text: 'Introduction', link: 'IoTDB-Introduction_timecho' },
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
      text: 'Installation and Deployment',
      collapsible: true,
      prefix: 'Deployment-and-Maintenance/',
      children: [
          {
            text: 'Deployment Preparation',
            collapsible: true,
            children: [
              { text: 'Deployment form', link: 'Deployment-form_timecho' },
              { text: 'Obtain TimechoDB', link: 'IoTDB-Package_timecho' },
              { text: 'Database Resources', link: 'Database-Resources' },
              { text: 'Environment Requirements', link: 'Environment-Requirements' },
            ],
          },
          {
            text: 'Database Deployment',
            collapsible: true,
            children: [
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
            ],
          },
          {
            text: 'AI Deployment',
            collapsible: true,
            children: [
                { text: 'AINode Deployment', link: 'AINode_Deployment_timecho' },/*
              { text: 'AINode Deployment(V2.0.5/6)', link: 'AINode_Deployment_timecho' },
              { text: 'AINode Deployment(V2.0.8)', link: 'AINode_Deployment_Upgrade_timecho' }, */
            ],
          },
          {
               text: 'Peripheral Tools',
               collapsible: true,
               children: [
                 {
                   text: 'Monitoring Panel Deployment',
                   link: 'Monitoring-panel-deployment',
                 },
               ],
          },
      ],
    },
    {
      text: 'Basic Functions',
      collapsible: true,
      prefix: 'Basic-Concept/',
      children: [
        { text: 'Database Management', link: 'Database-Management_timecho' },
        { text: 'Table Management', link: 'Table-Management_timecho' },
        { text: 'Write&Updata Data', link: 'Write-Updata-Data_timecho' },
        { text: 'Query Data', link: 'Query-Data_timecho' },
        {
          text: 'Delete Data',
          collapsible: true,
          children: [
            { text: 'Delete Data', link: 'Delete-Data' },
            { text: 'TTL Delete Data', link: 'TTL-Delete-Data_timecho' },
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
        { text: 'Data Sync', link: 'Data-Sync_timecho' },
        {
            text: 'Timeseries Featured Analysis',
            collapsible: true,
            children: [
                { text: 'Pattern Query', link: 'Pattern-Query_timecho' },
                { text: 'Window Function', link: 'Window-Function_timecho' },
            ],
        },
        { text: 'UDF', link: 'User-defined-function' },
        {
          text: 'Security Management',
          collapsible: true,
          children: [
            { text: 'Authority Management', link: 'Authority-Management_timecho' },
            { text: 'Black White List', link: 'Black-White-List_timecho' },
          ],
        },
        { text: 'Tiered Storage', link: 'Tiered-Storage_timecho' },
        { text: 'Tree-to-Table Mapping', link: 'Tree-to-Table_timecho' },
        {
          text: 'System Maintenance',
          collapsible: true,
          children: [
            { text: 'Query Performance Analysis', link: 'Query-Performance-Analysis' },
            { text: 'Cluster Maintenance', link: 'Load-Balance' },
            { text: 'Maintenance statement', link: 'Maintenance-commands_timecho' },
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
        { text: 'Monitor Tool', link: 'Monitor-Tool_timecho' },
        { text: 'Benchmark Tool', link: 'Benchmark' },
        { text: 'Cluster Management Tool', link: 'Maintenance-Tool_timecho' },
        { text: 'Data Import & Export', collapsible: true,
          children: [
            { text: 'Data Import', link: 'Data-Import-Tool_timecho' },
            { text: 'Data Export', link: 'Data-Export-Tool_timecho' },
          ],
        },
        { text: 'Schema Import & Export', collapsible: true,
          children: [
            { text: 'Schema Import', link: 'Schema-Import-Tool_timecho' },
            { text: 'Schema Export', link: 'Schema-Export-Tool_timecho' },
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
        { text: 'Java Native API', link: 'Programming-Java-Native-API_timecho' },
        { text: 'Python Native API', link: 'Programming-Python-Native-API_timecho' },
        { text: 'C++ Native API', link: 'Programming-Cpp-Native-API_timecho' },
        { text: 'GO Native API', link: 'Programming-Go-Native-API_timecho' },
        { text: 'C# Native API', link: 'Programming-CSharp-Native-API_timecho' },
        { text: 'JDBC', link: 'Programming-JDBC_timecho' },
        { text: 'MQTT Protocol', link: 'Programming-MQTT' },
        { text: 'RESTAPI V1 ', link: 'RestAPI-V1' },
      ],
    },
    {
      text: 'Ecosystem Integration',
      collapsible: true,
      prefix: 'Ecosystem-Integration/',
      children: [
        { text: 'Overview', link: 'Ecosystem-Overview_timecho' },
        {
          text: '‌Computing Engine',
          collapsible: true,
          children: [
            { text: 'Apache Spark', link: 'Spark-IoTDB' },
          ],
        },
        {
          text: '‌SQL Development',
          collapsible: true,
          children: [
            { text: 'DBeaver', link: 'DBeaver' },
            { text: 'DataGrip', link: 'DataGrip' },
          ],
        },
        {
          text: 'Programming Framework',
          collapsible: true,
          children: [
            { text: 'Spring Boot Starter', link: 'Spring-Boot-Starter' },
            { text: 'Mybatis Generator', link: 'Mybatis-Generator' },
            { text: 'MyBatisPlus Generator', link: 'MyBatisPlus-Generator' },
          ],
        },
      ],
    },
    {
      text: 'SQL Manual',
      collapsible: true,
      prefix: 'SQL-Manual/',
      children: [
        { text: 'Metadata Operations', link: 'SQL-Metadata-Operations_timecho' },
        { text: 'Data Addition&Deletion', link: 'SQL-Data-Addition-Deletion_timecho' },
        {
          text: 'Data Query',
          collapsible: true,
          children: [
            { text: 'overview', link: 'overview_timecho' },
            { text: 'SELECT Clause', link: 'Select-Clause' },
            { text: 'FROM&JOIN Clause', link: 'From-Join-Clause' },
            { text: 'WHERE Clause', link: 'Where-Clause' },
            { text: 'GROUP BY Clause', link: 'GroupBy-Clause' },
            { text: 'HAVING Clause', link: 'Having-Clause' },
            { text: 'FILL Clause', link: 'Fill-Clause' },
            { text: 'ORDER BY Clause', link: 'OrderBy-Clause' },
            { text: 'LIMIT&OFFSET Clause', link: 'Limit-Offset-Clause' },
            { text: 'Nested Queries', link: 'Nested-Queries' },
            { text: 'Pattern Query', link: 'Row-Pattern-Recognition_timecho' },
          ],
        },
        { text: 'Maintenance Statements', link: 'SQL-Maintenance-Statements' },
        { text: 'Identifier', link: 'Identifier' },
        { text: 'Keywords', link: 'Keywords' },
        {
          text: 'Functions and Operators',
          collapsible: true,
          children: [
            { text: 'Basis Functions', link: 'Basis-Function' },
            { text: 'Featured Functions', link: 'Featured-Functions_timecho' },
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
        { text: 'System Tables', link: 'System-Tables_timecho' },
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