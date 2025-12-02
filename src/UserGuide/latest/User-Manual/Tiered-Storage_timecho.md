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

# Tiered Storage 
## 1. Overview

The Tiered storage functionality allows users to define multiple layers of storage, spanning across multiple types of storage media (Memory mapped directory, SSD, rotational hard discs or cloud storage). While memory and cloud storage is usually singular, the local file system storages can consist of multiple directories joined together into one tier. Meanwhile, users can classify data based on its hot or cold nature and store data of different categories in specified "tier". Currently, IoTDB supports the classification of hot and cold data through TTL (Time to live / age) of data.  When the data in one tier does not meet the TTL rules defined in the current tier, the data will be automatically migrated to the next tier.

## 2. Parameter Definition

To enable tiered storage in IoTDB, you need to configure the following aspects:

1. configure the data catalogue and divide the data catalogue into different tiers
2. configure the TTL of the data managed in each tier to distinguish between hot and cold data categories managed in different tiers.
3. configure the minimum remaining storage space ratio for each tier so that when the storage space of the tier triggers the threshold, the data of the tier will be automatically migrated to the next tier (optional).

The specific parameter definitions and their descriptions are as follows.

| Configuration                                   | Default                    | Description                                                          | Constraint                                                          |
| --------------------------------------- | ------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| dn_data_dirs                            | data/datanode/data                        | specify different storage directories and divide the storage directories into tiers             | Each level of storage uses a semicolon to separate, and commas to separate within a single level; cloud (OBJECT_STORAGE) configuration can only be used as the last level of storage and the first level can't be used as cloud storage; a cloud object at most; the remote storage directory is denoted by OBJECT_STORAGE |
| tier_ttl_in_ms                        | -1                        | Define the maximum age of data for which each tier is responsible                    | Each level of storage is separated by a semicolon; the number of levels should match the number of levels defined by dn_data_dirs；"-1" means "unlimited". |
| dn_default_space_usage_thresholds        | 0.85                     | Define the maximum storage usage threshold ratio for each tier of data directories. When the used space exceeds this ratio, the data will be automatically migrated to the next tier. If the storage usage of the last tier surpasses this threshold, the system will be set to ​​READ_ONLY​​ mode. | Each level of storage is separated by a semicolon; the number of levels should match the number of levels defined by dn_data_dirs |
| object_storage_type                     | `AWS_S3`                   | Cloud storage type.                   | all `AWS_S3` is supported.                           |
| object_storage_bucket                   | iotdb_data                        | Name of cloud storage bucket                                       | Bucket definition in AWS S3; no need to configure if remote storage is not used        |
| object_storage_endpoint                 |                          | endpoint of cloud storage                                          | endpoint of AWS S3；If remote storage is not used, no configuration required             |
| object_storage_region                 | (Empty)                    | Cloud storage Region.              | Required only if cloud storage is used.                       |
| object_storage_access_key               |                          | Authentication information stored in the cloud: key                                       | AWS S3 credential key；If remote storage is not used, no configuration required       |
| object_storage_access_secret            |                          | Authentication information stored in the cloud: secret                                    | AWS S3 credential secret；If remote storage is not used, no configuration required    |
| enable_path_style_access             | false                    | Whether to enable path style access for object storage service.       | Required only if cloud storage is used.                   |
| remote_tsfile_cache_dirs                | data/datanode/data/cache | Cache directory stored locally in the cloud                                     | If remote storage is not used, no configuration required                                 |
| remote_tsfile_cache_page_size_in_kb     | 20480                    |Block size of locally cached files stored in the cloud                               | If remote storage is not used, no configuration required                                 |
| remote_tsfile_cache_max_disk_usage_in_mb | 51200                    | Maximum Disk Occupancy Size for Cloud Storage Local Cache                           | If remote storage is not used, no configuration required                                 |

## 3. local tiered storag configuration example

The following is an example of a local two-level storage configuration.

```JavaScript
//Required configuration items
dn_data_dirs=/data1/data;/data2/data,/data3/data;
tier_ttl_in_ms=86400000;-1
dn_default_space_usage_thresholds=0.2;0.1
```

In this example, two levels of storage are configured, specifically:

| **tier** | **data path**                           | **data range**    | **threshold for minimum remaining disk space** |
| -------- | -------------------------------------- | --------------- | ------------------------ |
| tier 1   | path 1：/data1/data                    | data for last 1 day | 20%                      |
| tier 2   | path 2：/data2/data path 2：/data3/data | data from 1 day ago  | 10%                      |

## 4. remote tiered storag configuration example

The following takes three-level storage as an example:

```JavaScript
//Required configuration items
dn_data_dirs=/data1/data;/data2/data,/data3/data;OBJECT_STORAGE
tier_ttl_in_ms=86400000;864000000;-1
dn_default_space_usage_thresholds=0.2;0.15;0.1
object_storage_type=AWS_S3
object_storage_bucket=iotdb
object_storage_region=<your_region>
object_storage_endpoint=<your_endpoint>
object_storage_access_key=<your_access_key>
object_storage_access_secret=<your_access_secret>

// Optional configuration items
enable_path_style_access=false
remote_tsfile_cache_dirs=data/datanode/data/cache
remote_tsfile_cache_page_size_in_kb=20971520
remote_tsfile_cache_max_disk_usage_in_mb=53687091200
```

In this example, a total of three levels of storage are configured, specifically:

| **tier** | **data path**                           | **data range**                 | **threshold for minimum remaining disk space** |
| -------- | -------------------------------------- | ---------------------------- | ------------------------ |
| tier1   | path 1：/data1/data                    | data for last 1 day              | 20%                      |
| tier2   | path 1：/data2/data path 2：/data3/data | data from past 1 day to past 10 days | 15%                      |
| tier 3   |  S3 Cloud Storage         | Data older than 10 days        | 10%                           |
