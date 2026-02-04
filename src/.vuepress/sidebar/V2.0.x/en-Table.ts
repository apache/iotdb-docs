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
      text: 'IoTDB User Guide (V2.0.x)',
      children: [],
    },
    {
      text: 'About IoTDB',
      collapsible: true,
      prefix: 'IoTDB-Introduction/',
      children: [
        { text: 'IoTDB Introduction', link: 'IoTDB-Introduction_apache' },
        { text: 'Scenario', link: 'Scenario' },
        { text: 'Release History', link: 'Release-history_apache' },
      ],
    },
    {
      text: 'Background knowledge',
      collapsible: true,
      prefix: 'Background-knowledge/',
      children: [
        { text: 'Common Concepts', link: 'Cluster-Concept_apache' },
        { text: 'Timeseries Data Model', link: 'Navigating_Time_Series_Data' },
        { text: 'Modeling Scheme Design', link: 'Data-Model-and-Terminology_apache' },
        { text: 'Data Type', link: 'Data-Type' },
      ],
    },
    {
      text: 'Quick Start',
      link: 'QuickStart/QuickStart_apache',
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
              { text: 'Deployment form', link: 'Deployment-form_apache' },
              { text: 'Obtain IoTDB', link: 'IoTDB-Package_apache' },
              { text: 'Database Resources', link: 'Database-Resources' },
              { text: 'Environment Requirements', link: 'Environment-Requirements' },
            ],
          },
          {
            text: 'Database Deployment',
            collapsible: true,
            children: [
              { text: 'Stand-Alone Deployment', link: 'Stand-Alone-Deployment_apache'},
              { text: 'Cluster Deployment', link: 'Cluster-Deployment_apache' },
              { text: 'Docker Deployment', link: 'Docker-Deployment_apache' },
            ],
          },
          {
            text: 'AI Deployment',
            collapsible: true,
            children: [
                { text: 'AINode Deployment', link: 'AINode_Deployment_apache' },/*
               { text: 'AINode Deployment(V2.0.5/6)', link: 'AINode_Deployment_apache' },
               { text: 'AINode Deployment(V2.0.8)', link: 'AINode_Deployment_Upgrade_apache' }, */
            ],
          },
      ],
    },
    {
      text: 'Basic Functions',
      collapsible: true,
      prefix: 'Basic-Concept/',
      children: [
        { text: 'Database Management', link: 'Database-Management_apache' },
        { text: 'Table Management', link: 'Table-Management_apache' },
        { text: 'Write&Updata Data', link: 'Write-Updata-Data_apache' },
        { text: 'Query Data', link: 'Query-Data_apache' },
        {
          text: 'Delete Data',
          collapsible: true,
          children: [
            { text: 'Delete Data', link: 'Delete-Data' },
            { text: 'TTL Delete Data', link: 'TTL-Delete-Data_apache' },
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
        { text: 'Data Sync', link: 'Data-Sync_apache' },
        { text: 'UDF', link: 'User-defined-function' },
        {
          text: 'Security Management',
          collapsible: true,
          children: [
            { text: 'Authority Management', link: 'Authority-Management_apache' },
          ],
        },
        { text: 'Tree-to-Table Mapping', link: 'Tree-to-Table_apache' },
        {
          text: 'System Maintenance',
          collapsible: true,
          children: [
            { text: 'Query Performance Analysis', link: 'Query-Performance-Analysis' },
            { text: 'Cluster Maintenance', link: 'Load-Balance' },
            { text: 'Maintenance statement', link: 'Maintenance-commands_apache' },
          ],
        },
      ],
    },
    {
      text: 'AI capability',
      collapsible: true,
      prefix: 'AI-capability/',
      children: [
        { text: 'AINode(V2.0.5/6)', link: 'AINode_apache' },
        { text: 'AINode(V2.0.8)', link: 'AINode_Upgrade_apache' },
        { text: 'TimeSeries Large Model(V2.0.5/6)', link: 'TimeSeries-Large-Model' },
        { text: 'TimeSeries Large Model(V2.0.8)', link: 'TimeSeries-Large-Model_Upgrade_apache' },
      ],
    },
    {
      text: 'Tools System',
      collapsible: true,
      prefix: 'Tools-System/',
      children: [
        { text: 'CLI', link: 'CLI_apache' },
        { text: 'Monitor Tool', link: 'Monitor-Tool_apache' },
        { text: 'Benchmark Tool', link: 'Benchmark' },
        { text: 'Cluster Management Tool', link: 'Maintenance-Tool_apache' },
        { text: 'Data Import & Export', collapsible: true,
          children: [
            { text: 'Data Import', link: 'Data-Import-Tool_apache' },
            { text: 'Data Export', link: 'Data-Export-Tool_apache' },
          ],
        },
        { text: 'Schema Import & Export', collapsible: true,
          children: [
            { text: 'Schema Import', link: 'Schema-Import-Tool_apache' },
            { text: 'Schema Export', link: 'Schema-Export-Tool_apache' },
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
        { text: 'Java Native API', link: 'Programming-Java-Native-API_apache' },
        { text: 'Python Native API', link: 'Programming-Python-Native-API_apache' },
        { text: 'C++ Native API', link: 'Programming-Cpp-Native-API_apache' },
        { text: 'GO Native API', link: 'Programming-Go-Native-API_apache' },
        { text: 'C# Native API', link: 'Programming-CSharp-Native-API_apache' },
        { text: 'JDBC', link: 'Programming-JDBC_apache' },
        { text: 'MQTT Protocol', link: 'Programming-MQTT' },
        { text: 'RESTAPI V1 ', link: 'RestAPI-V1' },
      ],
    },
    {
      text: 'Ecosystem Integration',
      collapsible: true,
      prefix: 'Ecosystem-Integration/',
      children: [
        { text: 'Overview', link: 'Ecosystem-Overview_apache' },
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
        { text: 'Metadata Operations', link: 'SQL-Metadata-Operations_apache' },
        { text: 'Data Addition&Deletion', link: 'SQL-Data-Addition-Deletion_apache' },
        {
          text: 'Data Query',
          collapsible: true,
          children: [
            { text: 'overview', link: 'overview_apache' },
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
        { text: 'Maintenance Statements', link: 'SQL-Maintenance-Statements' },
        { text: 'Identifier', link: 'Identifier' },
        { text: 'Keywords', link: 'Keywords' },
        {
          text: 'Functions and Operators',
          collapsible: true,
          children: [
            { text: 'Basis Functions', link: 'Basis-Function' },
            { text: 'Featured Functions', link: 'Featured-Functions_apache' },
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
        { text: 'System Tables', link: 'System-Tables_apache' },
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