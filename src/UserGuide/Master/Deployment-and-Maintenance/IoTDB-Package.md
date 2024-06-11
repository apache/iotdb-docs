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
# IoTDB-Package
## CPU
| Number of second level sequences | CPU                                              | Number of nodes |      |                                                  |
| -------------------------------- | ------------------------------------------------ | --------------- | ---- | ------------------------------------------------ |
| standalone mode                  | Double active                                    | Distributed     |      |                                                  |
| Within 100000                    | 2-4 core                                         | 1               | 2    | 3                                                |
| Within 300000                    | 4-8core                                          | 1               | 2    | 3                                                |
| Within 500000                    | 8-26core                                         | 1               | 2    | 3                                                |
| Within 1000000                   | 16-32core                                        | 1               | 2    | 3                                                |
| Within 2000000                   | 32-48core                                        | 1               | 2    | 3                                                |
| Within 10000000                  | 48-core                                          | 1               | 2    | Please contact Timecho Business for consultation |
| Over 10000000                    | Please contact Timecho Business for consultation |                 |      |                                                  |
## Memory 
| Number of second level sequences | Memory                                           | Number of nodes |      |                                                  |
| -------------------------------- | ------------------------------------------------ | --------------- | ---- | ------------------------------------------------ |
| standalone mode                  | Double active                                    | Distributed     |      |                                                  |
| Within 100000                    | 4G-8G                                            | 1               | 2    | 3                                                |
| Within 300000                    | 12G-32G                                          | 1               | 2    | 3                                                |
| Within 500000                    | 24G-48G                                          | 1               | 2    | 3                                                |
| Within 1000000                   | 32G-96G                                          | 1               | 2    | 3                                                |
| Within 2000000                   | 64G-128G                                         | 1               | 2    | 3                                                |
| Within 10000000                  | 128G                                             | 1               | 2    | Please contact Timecho Business for consultation |
| 1000w以上Over 10000000           | Please contact Timecho Business for consultation |                 |      |                                                  |
## Storage (Disk)
### Storage space
Calculation formula: Number of measurement points * Sampling frequency (Hz) * Size of each data point (Byte, different data types may vary, see table below) * Storage time (seconds) * Number of copies (usually 1 copy for a single node and 2 copies for a cluster) ÷ Compression ratio (can be estimated at 5-10 times, but may be higher in actual situations)
| Data point size calculation table |                   |                  |                                      |
| --------------------------------- | ----------------- | ---------------- | ------------------------------------ |
| data type                         | Timestamp (Bytes) | Value (Bytes)    | Total size of data points (in bytes) |
| Boolean                           | 8                 | 1                | 9                                    |
| INT32）/FLOAT                     | 8                 | 4                | 12                                   |
| INT64/DOUBLE                      | 8                 | 8                | 16                                   |
| TEXT                              | 8                 | The average is a | 8+a                                  |

Example: 1000 devices, each with 100 measurement points, a total of 100000 sequences, INT32 type. Sampling frequency 1Hz (once per second), storage for 1 year, 3 copies.
- Complete calculation formula: 1000 devices * 100 measurement points * 12 bytes per data point * 86400 seconds per day * 365 days per year * 3 copies/10 compression ratio=11T
- Simplified calculation formula: 1000 * 100 * 12 * 86400 * 365 * 3/10=11T
### Storage Configuration
If the number of nodes is over 10000000 or the query load is high, it is recommended to configure SSD
## Other instructions
IoTDB has the ability to scale up clusters in seconds, and expanding node data does not require migration. Therefore, you do not need to worry about the limited cluster capacity estimated based on existing data. In the future, you can add new nodes to the cluster when you need to scale up.