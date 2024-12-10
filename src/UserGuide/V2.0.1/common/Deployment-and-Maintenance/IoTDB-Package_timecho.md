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
## How to obtain TimechoDB
The enterprise version installation package can be obtained through product trial application or by directly contacting the business personnel who are in contact with you.

## Installation Package Structure
The directory structure after unpacking the installation package is as follows：
|  **catalogue**   | **Type** | **Explanation**                                              |
| :--------------: | -------- | ------------------------------------------------------------ |
|    activation    | folder   | The directory where the activation file is located, including the generated machine code and the enterprise version activation code obtained from the business side (this directory will only be generated after starting ConfigNode to obtain the activation code) |
|       conf       | folder   | Configuration file directory, including configuration files such as ConfigNode, DataNode, JMX, and logback |
|       data       | folder   | The default data file directory contains data files for ConfigNode and DataNode. (The directory will only be generated after starting the program) |
|       lib        | folder   | IoTDB executable library file directory                      |
|     licenses     | folder   | Open source community certificate file directory             |
|       logs       | folder   | The default log file directory, which includes log files for ConfigNode and DataNode (this directory will only be generated after starting the program) |
|       sbin       | folder   | Main script directory, including start, stop, and other scripts |
|      tools       | folder   | Directory of System Peripheral Tools                         |
|       ext        | folder   | Related files for pipe, trigger, and UDF plugins (created by the user when needed) |
|     LICENSE      | file     | certificate                                                  |
|      NOTICE      | file     | Tip                                                          |
|   README_ZH\.md   | file     | Explanation of the Chinese version in Markdown format        |
|    README\.md     | file     | Instructions for use                                         |
| RELEASE_NOTES\.md | file     | Version Description                                          |
