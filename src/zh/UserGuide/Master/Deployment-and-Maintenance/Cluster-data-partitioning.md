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

# 集群数据分区与负载均衡

IoTDB 以数据分区（DataRegion）为单位对元数据和数据进行管理，从序列和时间两个维度进行数据划分。

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="https://alioss.timecho.com/docs/img/%E5%88%86%E5%8C%BA%E6%A7%BD%E4%B8%8E%E6%95%B0%E6%8D%AE%E5%88%86%E5%8C%BA.png?raw=true">

## 分区槽

一个序列分区槽和一个时间分区槽可以组合产生一个数据分区(当该序列分区槽在该时间分区槽下有对应数据时)。

### 序列分区槽

每个数据库持有固定数量的序列分区槽，默认为1000个。该数据库管理的每个时间序列都将通过序列分区算法（通常为某种哈希算法）被分配给唯一的序列分区槽管理。

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="https://alioss.timecho.com/docs/img/SeriesPartitionSlot.png?raw=true">

### 时间分区槽

每个时间序列都将持续产生数据，如果一个时间序列产生的全部数据持续存储于一个节点，那么集群新增的 DataNode 可能无法得到有效利用。

时间分区槽从时间维度对时序数据进行分片（默认为每1天一个时间分区），使得集群时序数据的存储易于规划。

## 元数据分区

单个数据库的元数据分区管理，会按照一定的负载均衡策略，将所有序列槽分配到相应的 SchemaRegionGroup 中，进而在集群中横向扩展。

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="https://alioss.timecho.com/docs/img/SchemaRegion.png?raw=true">

## 数据分区

会按照一定的负载均衡策略，进行时间分区槽和序列分区槽的划分，并分配到相应的 DataRegionGroup 中，进而在集群中横向扩展。

单个数据库的数据分区管理，在10000个分区槽、连续运行十年的情况下，预计需要0.68GB。

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="https://alioss.timecho.com/docs/img/DataRegion.png?raw=true">

## 负载均衡

当集群容量保持不变时，数据会被均匀分配到各个节点，以实现存储和计算资源的均衡利用。

同时，在进行集群扩容时，系统会自动增加区域（region）的数量，以充分利用所有节点的计算资源，无需人工干预。这种动态扩展能够提高集群的性能和可扩展性，使整个系统更加灵活和高效。
