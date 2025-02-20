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
      text: 'Quick Start',
      link: 'QuickStart/QuickStart_timecho',
    },
    {
      text: 'Deployment & Maintenance',
      collapsible: true,
      prefix: 'Deployment-and-Maintenance/',
      // children: 'structure',
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
      // children: 'structure',
      children: [
        {
          text: 'Data Modeling',
          collapsible: true,
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
      ],
    },
    {
      text: 'SQL Manual',
      collapsible: true,
      prefix: 'SQL-Manual/',
      // children: 'structure',
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
          ],
        },
      ],
    },
    {
      text: 'Reference',
      collapsible: true,
      prefix: 'Reference/',
      // children: 'structure',
      children: [
        { text: 'Config Manual', link: 'System-Config-Manual' },
        { text: 'Sample Data', link: 'Sample-Data' },
      ],
    },
  ],
};