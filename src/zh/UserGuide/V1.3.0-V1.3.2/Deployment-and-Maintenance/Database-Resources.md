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
# 资源规划
## CPU
<table>
      <tr>
            <th rowspan="2">秒级序列数</th>
            <th rowspan="2">CPU</th>        
            <th colspan="3">节点数</th>
      </tr>
      <tr>
            <th>单机</th>   
            <th>双活</th> 
            <th>分布式</th> 
      </tr>
      <tr>
            <td>10W以内</td>
            <td>2核-4核</td>
            <td>1</td>
            <td>2</td>
            <td>3</td>
      </tr>
      <tr>
            <td>30W以内</td>
            <td>4核-8核</td>
            <td>1</td>
            <td>2</td>
            <td>3</td>
      </tr>
      <tr>
            <td>50W以内</td>
            <td>8核-16核</td>
            <td>1</td>
            <td>2</td>
            <td>3</td>
      </tr>
      <tr>
            <td>100W以内</td>
            <td>16核-32核</td>
            <td>1</td>
            <td>2</td>
            <td>3</td>
      </tr>
      <tr>
            <td>200w以内</td>
            <td>32核-48核</td>
            <td>1</td>
            <td>2</td>
            <td>3</td>
      </tr>
      <tr>
            <td>1000w以内</td>
            <td>48核</td>
            <td>1</td>
            <td>2</td>
            <td>请联系天谋商务咨询</td>
      </tr>
      <tr>
            <td>1000w以上</td>
            <th colspan="4">请联系天谋商务咨询</th>
      </tr>
</table>

## 内存
<table>
      <tr>
            <th rowspan="2">秒级序列数</th>
            <th rowspan="2">内存</th>        
            <th colspan="3">节点数</th>
      </tr>
      <tr>
            <th>单机</th>   
            <th>双活</th> 
            <th>分布式</th> 
      </tr>
      <tr>
            <td>10W以内</td>
            <td>4G-8G</td>
            <td>1</td>
            <td>2</td>
            <td>3</td>
      </tr>
      <tr>
            <td>30W以内</td>
            <td>12G-32G</td>
            <td>1</td>
            <td>2</td>
            <td>3</td>
      </tr>
      <tr>
            <td>50W以内</td>
            <td>24G-48G</td>
            <td>1</td>
            <td>2</td>
            <td>3</td>
      </tr>
      <tr>
            <td>100W以内</td>
            <td>32G-96G</td>
            <td>1</td>
            <td>2</td>
            <td>3</td>
      </tr>
      <tr>
            <td>200w以内</td>
            <td>64G-128G</td>
            <td>1</td>
            <td>2</td>
            <td>3</td>
      </tr>
      <tr>
            <td>1000w以内</td>
            <td>128G</td>
            <td>1</td>
            <td>2</td>
            <td>请联系天谋商务咨询</td>
      </tr>
      <tr>
            <td>1000w以上</td>
            <td colspan="4">请联系天谋商务咨询</td>
      </tr>
</table>

## 存储(磁盘)
### 存储空间
计算公式：测点数量 * 采样频率（Hz）* 每个数据点大小（Byte，不同数据类型不一样，见下表）
<table>
      <tr>
            <th colspan="4"> 数据点大小计算表 </th>        
      </tr>
      <tr>
            <td> 数据类型 </td>
            <td>时间戳（字节）</td>
            <td>值（字节）</td>
            <td>数据点总大小（字节）</td>
      </tr>
      <tr>
            <td>开关量（Boolean）</td>
            <td>8</td>
            <td>1</td>
            <td>9</td>
      </tr>
      <tr>
            <td>整型（INT32）/ 单精度浮点数（FLOAT）</td>
            <td>8</td>
            <td>4</td>
            <td>12</td>
      </tr>
      <tr>
            <td>长整型（INT64）/ 双精度浮点数（DOUBLE）</td>
            <td>8</td>
            <td>8</td>
            <td>16</td>
      </tr>
      <tr>
            <td>字符串（TEXT）</td>
            <td>8</td>
            <td>平均为a</td>
            <td>8+a</td>
      </tr>
</table>


示例：1000设备，每个设备100 测点，共 100000 序列，INT32 类型。采样频率1Hz（每秒一次），存储1年，3副本。
- 完整计算公式：1000设备 * 100测点 * 12字节每数据点 * 86400秒每天 * 365天每年 * 3副本/10压缩比=11T
- 简版计算公式：1000 * 100 * 12 * 86400 * 365 * 3 / 10 = 11T
### 存储配置
1000w 点位以上或查询负载较大，推荐配置 SSD。
## 其他说明
IoTDB 具有集群秒级扩容能力，扩容节点数据可不迁移，因此您无需担心按现有数据情况估算的集群能力有限，未来您可在需要扩容时为集群加入新的节点。