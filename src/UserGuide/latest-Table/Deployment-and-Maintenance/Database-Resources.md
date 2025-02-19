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
## 1 CPU
<table style="text-align: center;">
   <tbody>
      <tr>
            <th rowspan="2">Number of timeseries (frequency&lt;=1HZ)</th>
            <th rowspan="2">CPU</th>        
            <th colspan="3">Number of nodes</th>
      </tr>
      <tr>
      <th>standalone</th>   
      <th>Dual-Active</th> 
      <th>Distributed</th> 
      </tr>
      <tr>
            <td>Within 100000</td>
            <td>2-4 cores</td>
            <td>1</td>
            <td>2</td>
            <td>3</td>
      </tr>
      <tr>
            <td>Within 300000</td>
            <td>4-8 cores</td>
            <td>1</td>
            <td>2</td>
            <td>3</td>
      </tr>
      <tr>
            <td>Within 500000</td>
            <td>8-16 cores</td>
            <td>1</td>
            <td>2</td>
            <td>3</td>
      </tr>
      <tr>
            <td>Within 1000000</td>
            <td>16-32 cores</td>
            <td>1</td>
            <td>2</td>
            <td>3</td>
      </tr>
      <tr>
            <td>Within 2000000</td>
            <td>32-48 cores</td>
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

## 2 Memory 
<table style="text-align: center;">
   <tbody>
      <tr>
            <th rowspan="2">Number of timeseries (frequency&lt;=1HZ)</th>
            <th rowspan="2">Memory</th>        
            <th colspan="3">Number of nodes</th>
      </tr>
      <tr>
      <th>standalone</th>   
      <th>Dual-Active</th> 
      <th>Distributed</th> 
      </tr>
      <tr>
            <td>Within 100000</td>
            <td>4-8G</td>
            <td>1</td>
            <td>2</td>
            <td>3</td>
      </tr>
      <tr>
            <td>Within 300000</td>
            <td>12-32G</td>
            <td>1</td>
            <td>2</td>
            <td>3</td>
      </tr>
      <tr>
            <td>Within 500000</td>
            <td>24-48G</td>
            <td>1</td>
            <td>2</td>
            <td>3</td>
      </tr>
      <tr>
            <td>Within 1000000</td>
            <td>32-96G</td>
            <td>1</td>
            <td>2</td>
            <td>3</td>
      </tr>
      <tr>
            <td>Within 2000000</td>
            <td>64-128G</td>
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

## 3 Storage (Disk)
### 3.1 Storage space
Calculation Formula:

```Plain
Storage Space = Number of Measurement Points * Sampling Frequency (Hz) * Size of Each Data Point (Bytes, see the table below) * Storage Duration * Replication Factor / Compression Ratio
```

Data Point Size Calculation Table:

<table style="text-align: center;">
   <tbody>
      <tr>
            <th>Data Type</th>   
            <th>Timestamp (Bytes)</th> 
            <th> Value (Bytes)</th> 
            <th> Total Data Point Size (Bytes) 
      </th> 
      </tr>
      <tr>
            <td>Boolean</td>
            <td>8</td>
            <td>1</td>
            <td>9</td>
      </tr>
      <tr>
            <td> INT32 / FLOAT (Single Precision)</td>
            <td>8</td>
            <td>4</td>
            <td>12</td>
      </tr>
      <tr>
            <td>INT64 / DOUBLE (Double Precision)</td>
            <td>8</td>
            <td>8</td>
            <td>16</td>
      </tr>
      <tr>
            <td>TEXT (String)</td>
            <td>8</td>
            <td>Average = a</td>
            <td>8+a</td>
      </tr>
</tbody>
</table>
Example:

- Scenario: 1,000 devices, 100 measurement points per device, i.e. 100,000 sequences in total. Data type is INT32. Sampling frequency is 1Hz (once per second). Storage duration is 1 year. Replication factor is 3.
- Full Calculation:
    ```Plain
    1,000 devices * 100 measurement points * 12 bytes per data point * 86,400 seconds per day * 365 days per year * 3 replicas / 10 compression ratio = 11 TB
    ```
- Simplified Calculation:
   ```Plain
    1,000 * 100 * 12 * 86,400 * 365 * 3 / 10 = 11 TB
    ```
### 3.2 Storage Configuration

- For systems with > 10 million measurement points or high query loads, SSD is recommended.

## 4 Network (NIC) 
When the write throughput does not exceed 10 million points per second, a gigabit network card is required. When the write throughput exceeds 10 million points per second, a 10-gigabit network card is required.

| **Write** **Throughput** **(Data Points/Second)** | **NIC** **Speed**    |
| ------------------------------------------------- | -------------------- |
| < 10 million                                      | 1 Gbps (Gigabit)     |
| ≥ 10 million                                      | 10 Gbps (10 Gigabit) |

## 5 Additional Notes

- IoTDB supports second-level cluster scaling . Data migration is not required when adding new nodes, so there is no need to worry about limited cluster capacity based on current data estimates. You can add new nodes to the cluster when scaling is needed in the future.