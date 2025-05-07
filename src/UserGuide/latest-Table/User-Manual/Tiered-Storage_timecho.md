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

The **tiered storage** feature enables users to manage multiple types of storage media efficiently. Users can configure different storage media types within IoTDB and classify them into distinct storage tiers. In IoTDB, tiered storage is implemented by managing multiple directories. Users can group multiple storage directories into the same category and designate them as a **storage tier**. Additionally, data can be classified based on its "hotness" or "coldness" and stored accordingly in designated tiers.

Currently, IoTDB supports hot and cold data classification based on the **Time-To-Live (****TTL****)** parameter. When data in a tier no longer meets the defined TTL rules, it is automatically migrated to the next tier.

## 2. **Parameter Definitions**

To enable multi-level storage in IoTDB, the following configurations are required:

1. Configure data directories and assign them into different tiers
2. Set TTL for each Tier to distinguish hot and cold data managed by different tiers.
3. Configure minimum remaining storage space ratio for each tier (Optional). If the available space in a tier falls below the defined threshold, data will be migrated to the next tier automatically.

The specific parameter definitions and their descriptions are as follows.

| **Parameter**                              | **Default Value**          | **Description**                                                                                                                                                                                                     | **Constraints**                                                                                                                                                                                                                                |
| :----------------------------------------- | :------------------------- |:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `dn_data_dirs`                             | `data/datanode/data`       | Specifies storage directories grouped into tiers.                                                                                                                                                                   | Tiers are separated by `;`, directories within the same tier are separated by `,`. <br>Cloud storage (e.g., AWS S3) can only be the last tier. <br>Use `OBJECT_STORAGE` to denote cloud storage. <br>Only one cloud storage bucket is allowed. |
| `tier_ttl_in_ms`                           | `-1`                       | Defines the TTL (in milliseconds) for each tier to determine the data range it manages.                                                                                                                             | Tiers are separated by `;`. <br>The number of tiers must match `dn_data_dirs`. <br>`-1` means "no limit".                                                                                                                                      |
| `dn_default_space_usage_thresholds`        | `0.85`                     | Define the maximum storage usage threshold ratio for each tier of data directories. When the used space exceeds this ratio, the data will be automatically migrated to the next tier. If the storage usage of the last tier surpasses this threshold, the system will be set to ​​READ_ONLY​​ mode. | -Tiers are separated by `;`.The number of tiers must match `dn_data_dirs`.                                                                                                                                                                     |
| `object_storage_type`                      | `AWS_S3`                   | Cloud storage type.                                                                                                                                                                                                 | all `AWS_S3` is supported.                                                                                                                                                                                                                    |
| `object_storage_bucket`                    | `iotdb_data`               | Cloud storage bucket name.                                                                                                                                                                                          | Required only if cloud storage is used.                                                                                                                                                                                                        |
| `object_storage_endpoiont`                 | (Empty)                    | Cloud storage endpoint.                                                                                                                                                                                             | Required only if cloud storage is used.                                                                                                                                                                                                        |
| `object_storage_region`                 | (Empty)                    | Cloud storage Region.                                                                                                                                                                                             | Required only if cloud storage is used.                                                                                                                                                                                                        |
| `object_storage_access_key`                | (Empty)                    | Cloud storage access key.                                                                                                                                                                                           | Required only if cloud storage is used.                                                                                                                                                                                                        |
| `object_storage_access_secret`             | (Empty)                    | Cloud storage access secret.                                                                                                                                                                                        | Required only if cloud storage is used.                                                                                                                                                                                                        |
| `enable_path_style_access`             | false                    | Whether to enable path style access for object storage service.                                                                                                                                                                                 | Required only if cloud storage is used.                                                                                                                                                                                                        |
| `remote_tsfile_cache_dirs`                 | `data/datanode/data/cache` | Local cache directory for cloud storage.                                                                                                                                                                            | Required only if cloud storage is used.                                                                                                                                                                                                        |
| `remote_tsfile_cache_page_size_in_kb`      | `20480`                    | Page size (in KB) for cloud storage local cache.                                                                                                                                                                    | Required only if cloud storage is used.                                                                                                                                                                                                        |
| `remote_tsfile_cache_max_disk_usage_in_mb` | `51200`                    | Maximum disk space (in MB) allocated for cloud storage local cache.                                                                                                                                                 | Required only if cloud storage is used.                                                                                                                                                                                                        |

## 3. Local Tiered Storage Example

The following is an example of a **two-tier local storage configuration**:

```Properties
# Mandatory configurations
dn_data_dirs=/data1/data;/data2/data,/data3/data
tier_ttl_in_ms=86400000;-1
dn_default_space_usage_thresholds=0.2;0.1
```

**Tier Details:**

| **Tier** | **Storage Directories**      | **Data Range**        | **Remaining Space Threshold** |
| :------- | :--------------------------- | :-------------------- | :---------------------------- |
| Tier 1   | `/data1/data`                | Last 1 day of data    | 20%                           |
| Tier 2   | `/data2/data`, `/data3/data` | Data older than 1 day | 10%                           |

## 4. Cloud-based Tiered Storage Example

The following is an example of a **three-tier configuration with cloud storage**:

```Properties
# Mandatory configurations
dn_data_dirs=/data1/data;/data2/data,/data3/data;OBJECT_STORAGE
tier_ttl_in_ms=86400000;864000000;-1
dn_default_space_usage_thresholds=0.2;0.15;0.1
object_storage_type=AWS_S3
object_storage_bucket=iotdb
object_storage_region=<your_region>
object_storage_endpoiont=<your_endpoint>
object_storage_access_key=<your_access_key>
object_storage_access_secret=<your_access_secret>

# Optional configurations
enable_path_style_access=false
remote_tsfile_cache_dirs=data/datanode/data/cache
remote_tsfile_cache_page_size_in_kb=20971520
remote_tsfile_cache_max_disk_usage_in_mb=53687091200
```

**Tier Details:**

| **Tier** | **Storage Directories**      | **Data Range**                 | **Remaining Space Threshold** |
| :------- | :--------------------------- | :----------------------------- | :---------------------------- |
| Tier 1   | `/data1/data`                | Last 1 day of data             | 20%                           |
| Tier 2   | `/data2/data`, `/data3/data` | Data from 1 day to 10 days ago | 15%                           |
| Tier 3   |  S3 Cloud Storage         | Data older than 10 days        | 10%                           |