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
# Database Resources
## 1. CPU
<table style="text-align: center;">
   <tbody>
      <tr>
            <th rowspan="2">Number of timeseries (frequency&lt;=1HZ)</th>
            <th rowspan="2">CPU</th>        
            <th colspan="3">Number of nodes</th>
      </tr>
      <tr>
      <th>standalone mode</th>   
      <th>Double active</th> 
      <th>Distributed</th> 
      </tr>
      <tr>
            <td>Within 100000</td>
            <td>2core-4core</td>
            <td>1</td>
            <td>2</td>
            <td>3</td>
      </tr>
      <tr>
            <td>Within 300000</td>
            <td>4core-8core</td>
            <td>1</td>
            <td>2</td>
            <td>3</td>
      </tr>
      <tr>
            <td>Within 500000</td>
            <td>8core-26core</td>
            <td>1</td>
            <td>2</td>
            <td>3</td>
      </tr>
      <tr>
            <td>Within 1000000</td>
            <td>16core-32core</td>
            <td>1</td>
            <td>2</td>
            <td>3</td>
      </tr>
      <tr>
            <td>Within 2000000</td>
            <td>32core-48core</td>
            <td>1</td>
            <td>2</td>
            <td>3</td>
      </tr>
      <tr>
            <td>Within 10000000</td>
            <td>48core</td>
            <td>1</td>
            <td>2</td>
            <td>Please contact Timecho Business for consultation</td>
      </tr>
      <tr>
            <td>Over 10000000</td>
            <td colspan="4">Please contact Timecho Business for consultation</td>
      </tr>
</tbody>
</table>

## 2. Memory 
<table style="text-align: center;">
   <tbody>
      <tr>
            <th rowspan="2">Number of timeseries (frequency&lt;=1HZ)</th>
            <th rowspan="2">Memory</th>        
            <th colspan="3">Number of nodes</th>
      </tr>
      <tr>
      <th>standalone mode</th>   
      <th>Double active</th> 
      <th>Distributed</th> 
      </tr>
      <tr>
            <td>Within 100000</td>
            <td>2G-4G</td>
            <td>1</td>
            <td>2</td>
            <td>3</td>
      </tr>
      <tr>
            <td>Within 300000</td>
            <td>6G-12G</td>
            <td>1</td>
            <td>2</td>
            <td>3</td>
      </tr>
      <tr>
            <td>Within 500000</td>
            <td>12G-24G</td>
            <td>1</td>
            <td>2</td>
            <td>3</td>
      </tr>
      <tr>
            <td>Within 1000000</td>
            <td>24G-48G</td>
            <td>1</td>
            <td>2</td>
            <td>3</td>
      </tr>
      <tr>
            <td>Within 2000000</td>
            <td>48G-96G</td>
            <td>1</td>
            <td>2</td>
            <td>3</td>
      </tr>
      <tr>
            <td>Within 10000000</td>
            <td>128G</td>
            <td>1</td>
            <td>2</td>
            <td>Please contact Timecho Business for consultation</td>
      </tr>
      <tr>
            <td>Over 10000000</td>
            <td colspan="4">Please contact Timecho Business for consultation</td>
      </tr>
</tbody>
</table>

## 3. Storage (Disk)
### 3.1 Storage space
Calculation formula: Number of measurement points * Sampling frequency (Hz) * Size of each data point (Byte, different data types may vary, see table below) * Storage time (seconds) * Number of copies (usually 1 copy for a single node and 2 copies for a cluster) ÷ Compression ratio (can be estimated at 5-10 times, but may be higher in actual situations)
<table style="text-align: center;">
   <tbody>
      <tr>
            <th colspan="4">Data point size calculation</th>
      </tr>
      <tr>
            <th>data type</th>   
            <th>Timestamp (Bytes)</th> 
            <th> Value (Bytes)</th> 
            <th> Total size of data points (in bytes) 
      </th> 
      </tr>
      <tr>
            <td>Boolean</td>
            <td>8</td>
            <td>1</td>
            <td>9</td>
      </tr>
      <tr>
            <td> INT32/FLOAT</td>
            <td>8</td>
            <td>4</td>
            <td>12</td>
      </tr>
      <tr>
            <td>INT64/DOUBLE</td>
            <td>8</td>
            <td>8</td>
            <td>16</td>
      </tr>
      <tr>
            <td>TEXT</td>
            <td>8</td>
            <td>The average is a</td>
            <td>8+a</td>
      </tr>
</tbody>
</table>

Example: 1000 devices, each with 100 measurement points, a total of 100000 sequences, INT32 type. Sampling frequency 1Hz (once per second), storage for 1 year, 3 copies.
- Complete calculation formula: 1000 devices * 100 measurement points * 12 bytes per data point * 86400 seconds per day * 365 days per year * 3 copies / 10 compression ratio / 1024 / 1024 / 1024 / 1024 =11T
- Simplified calculation formula: 1000 * 100 * 12 * 86400 * 365 * 3 / 10 / 1024 / 1024 / 1024 / 1024 =11T

### 3.2 Storage Configuration
If the number of nodes is over 10000000 or the query load is high, it is recommended to configure SSD
## 4. Network (Network card)
If the write throughput does not exceed 10 million points/second, configure 1Gbps network card. When the write throughput exceeds 10 million points per second, a 10Gbps network card needs to be configured.
| **Write throughput (data points per second)** | **NIC rate** |
| ------------------- | ------------- |
| <10 million | 1Gbps |
| >=10 million | 10Gbps |
## 5. Other instructions
IoTDB has the ability to scale up clusters in seconds, and expanding node data does not require migration. Therefore, you do not need to worry about the limited cluster capacity estimated based on existing data. In the future, you can add new nodes to the cluster when you need to scale up.