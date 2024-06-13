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
| 秒级序列数 | CPU                | 节点数 |      |                    |
| ---------- | ------------------ | ------ | ---- | ------------------ |
| 单机       | 双活               | 分布式 |      |                    |
| 10w以内    | 2核-4核            | 1      | 2    | 3                  |
| 30w以内    | 4核-8核            | 1      | 2    | 3                  |
| 50w以内    | 8核-16核           | 1      | 2    | 3                  |
| 100w以内   | 16核-32核          | 1      | 2    | 3                  |
| 200w以内   | 32核-48核          | 1      | 2    | 3                  |
| 1000w以内  | 48核               | 1      | 2    | 请联系天谋商务咨询 |
| 1000w以上  | 请联系天谋商务咨询 |        |      |                    |
## 内存
| 秒级序列数 | 内存               | 节点数 |      |                    |
| ---------- | ------------------ | ------ | ---- | ------------------ |
| 单机       | 双活               | 分布式 |      |                    |
| 10w以内    | 4G-8G              | 1      | 2    | 3                  |
| 30w以内    | 12G-32G            | 1      | 2    | 3                  |
| 50w以内    | 24G-48G            | 1      | 2    | 3                  |
| 100w以内   | 32G-96G            | 1      | 2    | 3                  |
| 200w以内   | 64G-128G           | 1      | 2    | 3                  |
| 1000w以内  | 128G               | 1      | 2    | 请联系天谋商务咨询 |
| 1000w以上  | 请联系天谋商务咨询 |        |      |                    |
## 存储(磁盘)
### 存储空间
计算公式：测点数量 * 采样频率（Hz）* 每个数据点大小（Byte，不同数据类型不一样，见下表） * 存储时长（秒） * 副本数（一般单节点为1副本，集群为2副本）÷ 压缩比（可按5-10倍估算，实际情况可能更高）
| 数据点大小计算表                       |                |            |                      |
| -------------------------------------- | -------------- | ---------- | -------------------- |
| 数据类型                               | 时间戳（字节） | 值（字节） | 数据点总大小（字节） |
| 开关量（Boolean）                      | 8              | 1          | 9                    |
| 整型（INT32）/单精度浮点数（FLOAT）    | 8              | 4          | 12                   |
| 长整型（INT64）/双精度浮点数（DOUBLE） | 8              | 8          | 16                   |
| 字符串（TEXT）                         | 8              | 平均为 a   | 8+a                  |

示例：1000设备，每个设备100 测点，共 100000 序列，INT32 类型。采样频率1Hz（每秒一次），存储1年，3副本。
- 完整计算公式：1000设备*100测点*12字节每数据点*86400秒每天*365天每年*3副本/10压缩比=11T
- 简版计算公式：1000*100*12*86400*365*3/10=11T
### 存储配置
1000w 点位以上或查询负载较大，推荐配置 SSD。
## 其他说明
IoTDB 具有集群秒级扩容能力，扩容节点数据可不迁移，因此您无需担心按现有数据情况估算的集群能力有限，未来您可在需要扩容时为集群加入新的节点。