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

# SpaceTL Delete

## 1. Overview

IoTDB(V1.3.2+) supports configuring the SpaceTL deletion policy through parameters: when the storage space of the last-level storage tier (object storage space is considered unlimited) is insufficient, users can choose whether to trigger the SpaceTL deletion mechanism to free up space.

Note: This mechanism only deletes files in the last storage tier.

## 2. Parameter Introduction

| Parameter Name            | Description                                                                                                                                                                    | Default Value | Effective Mode |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ---------------- |
| `dn_tier_full_policy` | Behavior policy when the storage space of the last-level storage tier is insufficient. Configurable options:1. NULL: Take no action.2. DELETE: Enable SpaceTL data deletion. | NULL          | Hot Reload     |

Parameter Explanation:

* If the last-level storage tier includes object storage, SpaceTL will not be triggered.
* This parameter works in conjunction with the `dn_default_space_usage_thresholds`parameter. SpaceTL is triggered when the available space of the last-level storage tier falls below the `space_usage_thresholds`. By default, deletion begins when disk space usage reaches 85% and continues until usage drops below 85%.

## 3. Usage Example

In a three-tier storage setup, when the storage space of the last tier reaches 85%, the SpaceTL deletion mechanism is triggered to start deleting files.

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

In this example, three tiers of storage are configured as follows:

| Tier Level | Storage Directories           | Data Retention Time                                 | Disk Storage Space Threshold                                                            |
| ------------ | ------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Tier 1     | `/data1/data`             | Retained for 1 day; exceeded data moves to Tier 2   | Data moves to Tier 2 when disk usage reaches 75%                                        |
| Tier 2     | `/data2/data,/data3/data` | Retained for 10 days; exceeded data moves to Tier 3 | Data moves to Tier 3 when disk usage reaches 80%                                        |
| Tier 3     | `/data4/data`             | No expiration time; data is stored indefinitely     | Deletes some files when disk usage reaches 85% (due to`dn_tier_full_policy=DELETE`) |
