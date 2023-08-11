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

# 负载均衡

IoTDB中，负载均衡的首要目标为各节点写入负载均衡，其次为各节点磁盘剩余空间均衡，并且支持在集群扩容后仍保持这两个性质。

为自动满足以上两个性质，IoTDB使用以下技术手段：
- 在AUTO策略下，自动进行 RegionGroup 数量的调整
- 产生新的时间分区的时候，写入负载在所有 RegionGroup 之间均分
- Region在不同节点之间实时均衡，通过贪心算法向 Region 数量少的 DataNode 分配Region
- Region 写入负载实时均衡，同一数据库下所有 RegionGroup 均分所有 SeriesSlot，集群计算资源达到均衡
- 可手动触发磁盘负载均衡
- 移除节点时，节点上的 Region 迁移到其他存活节点上

## 自动调整数据库配额

在 AUTO 策略下，每当集群新增减少DataNode 时，根据region_per_data_node 参数调整集群允许拥有的 RegionGroup 数量，然后将配额平均分配给所有 Database。

## 自动增加 RegionGroup

根据 Database 当前已使用的 series slot 数量和平均每个 RegionGroup 应管理的 series slot 数量决定是否为该 Database 扩容 RegionGroup。

在Database 所有 series slot 均被激活后，如果此 Database 的 RecionGroup 配额增加，那当新区创建时，会一次性在集群创建多个 RegionGroup，保证该 Database 持有的 RegionGroup 数量等于配额。

## Region 负载均衡

当系统检测到各节点剩余空间不均衡，或用户输入 `cluster rebalance` ，就会触发 Region 迁移。迁移通过以下步骤进行：

1. 使用模拟退火算法计算出Region迁移方案，目标为让各 DataNode 拥有的 Region 数量几乎相同，且各 DataNode 的磁盘使用率几乎相等
2. 对所有需要迁移的 Region，进行并发迁移
3. 限制每个 DataNode 的网络输出总流量
4. 监测迁移速率





