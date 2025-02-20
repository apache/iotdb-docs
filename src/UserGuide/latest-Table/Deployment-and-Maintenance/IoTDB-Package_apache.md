<!--

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

-->
# Obtain TimechoDB

## 1 How to obtain TimechoDB

The installation package can be directly obtained from the Apache IoTDB official website:https://iotdb.apache.org/Download/


## 2 Installation Package Structure


Install the package after decompression（`apache-iotdb-<version>-all-bin.zip`）,After decompressing the installation package, the directory structure is as follows:

| **Catologue**    | **Type** | **Description**                                              |
| :--------------- | :------- | :----------------------------------------------------------- |
| conf             | Folder   | Configuration files directory, containing ConfigNode, DataNode, JMX, and logback configuration files. |
| data             | Folder   | Default data file directory, containing data files for ConfigNode and DataNode. *(This directory is generated after starting the program.)* |
| lib              | Folder   | Library files directory.                                     |
| licenses         | Folder   | Directory for open-source license certificates.              |
| logs             | Folder   | Default log file directory, containing log files for ConfigNode and DataNode. *(This directory is generated after starting the program.)* |
| sbin             | Folder   | Main scripts directory, containing scripts for starting, stopping, and managing the database. |
| tools            | Folder   | Tools directory.                                             |
| ext              | Folder   | Directory for pipe, trigger, and UDF plugin-related files.   |
| LICENSE          | File     | Open-source license file.                                    |
| NOTICE           | File     | Open-source notice file.                                     |
| README_ZH.md     | File     | User manual (Chinese version).                               |
| README.md        | File     | User manual (English version).                               |
| RELEASE_NOTES.md | File     | Release notes.                                               |