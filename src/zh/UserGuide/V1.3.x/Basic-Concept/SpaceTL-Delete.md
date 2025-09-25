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

# SpaceTL 删除

## 1. 概述

IoTDB(V1.3.2+) 支持通过参数配置 SpaceTL 删除策略：即当最后一级存储层（对象存储空间被视为无限）的存储空间不足时，可选择是否触发 SpaceTL 删除机制以释放空间。

注意：该机制仅会删除最后一个存储层中的文件。

## 2. 参数介绍

| 参数名                 | 描述                                                                                                    | 默认值 | 生效方式 |
| ------------------------ | --------------------------------------------------------------------------------------------------------- | -------- | ---------- |
| dn\_tier\_full\_policy | 最后一级存储层存储空间不足时的行为策略。可配置：1. NULL：不做任何处理1. DELETE：开启 SpaceTL 删除数据。 | NULL   | 热加载   |

参数说明：

* 若最后一级存储层包含**对象存储**则不触发 SpaceTL
* 该参数和 dn\_default\_space\_usage\_thresholds 参数联动，当最后一级存储层的可用空间低于 space\_usage\_thresholds 时触发 SpaceTL；默认当磁盘空间占用到达 85% 的时候开始删除直至空间占用降到 85% 以下才会停止

## 3. 使用示例

以三级存储为例，当最后一级存储空间到达85%时，触发 SpaceTL 删除机制开始删除文件。

```Properties
# data dirs
# If this property is unset, system will save the data in the default relative path directory under the IoTDB folder(i.e., %IOTDB_HOME%/data/datanode/data).
# If it is absolute, system will save the data in exact location it points to.
# If it is relative, system will save the data in the relative path directory it indicates under the IoTDB folder.
# If there are more than one directory, please separate them by commas ",".
# If tiered storage is enabled, please separate directories of different tiers by semicolons ";".
# Use keyword OBJECT_STORAGE to denote object storage media, object storage can only exist on the last tier and must have local dirs in the front tiers.
# Note: If data_dirs is assigned an empty string(i.e.,zero-size), it will be handled as a relative path.
# effectiveMode: hot_reload
# For windows platform
# If its prefix is a drive specifier followed by "\\", or if its prefix is "\\\\", then the path is absolute. Otherwise, it is relative.
# dn_data_dirs=data\\datanode\\data
# For Linux platform
# If its prefix is "/", then the path is absolute. Otherwise, it is relative.
dn_data_dirs=/data1/data;/data2/data,/data3/data;/data4/data

# Default tier TTL. When the survival time of the data exceeds the threshold, it will be migrated to the next tier.
# Negative value means the tier TTL is unlimited.
# effectiveMode: restart
# Datatype: long
# Unit: ms
tier_ttl_in_ms=86400000;864000000;-1

# Disk usage threshold, data will be moved to the next tier when the usage of the tier is higher than this threshold.
# If tiered storage is enabled, please separate thresholds of different tiers by semicolons ";".
# effectiveMode: hot_reload
# Datatype: double(percentage)
dn_default_space_usage_thresholds=0.75;0.8;0.85

# How to deal with the last tier?s data when its used space has been higher than its dn_default_space_usage_thresholds.
# The info of the two policies are as follows:
# effectiveMode: hot_reload
# 1. NULL: do nothing.
# 2. DELETE: delete the oldest data.
dn_tier_full_policy=DELETE
```

在该示例中，共配置了三个层级的存储，具体为：

| 层级   | 存储目录                | 数据保留时间                      | 磁盘存储空间阈值                                                 |
| -------- | ------------------------- | ----------------------------------- | ------------------------------------------------------------------ |
| 层级一 | /data1/data             | 只保留 1 天，超过后会移动到第二级 | 磁盘达到 75% 会移动部分文件到第二级                              |
| 层级二 | /data2/data,/data3/data | 只保留 10 天，超过后到第三级      | 磁盘达到 80% 会移动部分文件到第三级                              |
| 层级三 | /data4/data             | 没有过期时间，会一直存储          | 磁盘达到 85% 会删除部分文件（因为dn\_tier\_full\_policy=DELETE） |
