# 多级存储
## 概述

多级存储功能向用户提供多种存储介质管理的能力，用户可以使用多级存储功能为 IoTDB 配置不同类型的存储介质，并为存储介质进行分级。具体的，在 IoTDB 中，多级存储的配置体现为多目录的管理。用户可以将多个存储目录归为同一类，作为一个“层级”向 IoTDB 中配置，这种“层级”我们称之为 storage tier；同时，用户可以根据数据的冷热进行分类，并将不同类别的数据存储到指定的“层级”中。当前 IoTDB 支持通过数据的 TTL 进行冷热数据的分类，当一个层级中的数据不满足当前层级定义的 TTL 规则时，该数据会被自动迁移至下一层级中。

## 参数定义

在 IoTDB 中开启多级存储，需要进行以下几个方面的配置：

1. 配置数据目录，并将数据目录分为不同的层级
2. 配置每个层级所管理的数据的 TTL，以区分不同层级管理的冷热数据类别。
3. 配置每个层级的最小剩余存储空间比例，当该层级的存储空间触发该阈值时，该层级的数据会被自动迁移至下一层级（可选）。

具体的参数定义及其描述如下。

| 配置项                                   | 默认值                   | 说明                                                         | 约束                                                         |
| ---------------------------------------- | ------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| dn_data_dirs                             | 无                       | 用来指定不同的存储目录，并将存储目录进行层级划分             | 每级存储使用分号分隔，单级内使用逗号分隔；云端配置只能作为最后一级存储且第一级不能作为云端存储；最多配置一个云端对象；远端存储目录使用 OBJECT_STORAGE 来表示 |
| default_ttl_in_ms                        | 无                       | 定义每个层级负责的数据范围，通过 TTL 表示                    | 每级存储使用分号分隔；层级数量需与 dn_data_dirs 定义的层级数一致 |
| dn_default_space_move_thresholds         | 0.15                     | 定义每个层级数据目录的最小剩余空间比例；当剩余空间少于该比例时，数据会被自动迁移至下一个层级；当最后一个层级的剩余存储空间到低于此阈值时，会将系统置为 READ_ONLY | 每级存储使用分号分隔；层级数量需与 dn_data_dirs 定义的层级数一致 |
| object_storage_type                      | AWS_S3                   | 云端存储类型                                                 | IoTDB 当前只支持 AWS S3 作为远端存储类型，此参数不支持修改   |
| object_storage_bucket                    | 无                       | 云端存储 bucket 的名称                                       | AWS S3 中的 bucket 定义；如果未使用远端存储，无需配置        |
| object_storage_endpoiont                 |                          | 云端存储的 endpoint                                          | AWS S3 的 endpoint；如果未使用远端存储，无需配置             |
| object_storage_access_key                |                          | 云端存储的验证信息 key                                       | AWS S3 的 credential key；如果未使用远端存储，无需配置       |
| object_storage_access_secret             |                          | 云端存储的验证信息 secret                                    | AWS S3 的 credential secret；如果未使用远端存储，无需配置    |
| remote_tsfile_cache_dirs                 | data/datanode/data/cache | 云端存储在本地的缓存目录                                     | 如果未使用远端存储，无需配置                                 |
| remote_tsfile_cache_page_size_in_kb      | 20480                    | 云端存储在本地缓存文件的块大小                               | 如果未使用远端存储，无需配置                                 |
| remote_tsfile_cache_max_disk_usage_in_mb | 51200                    | 云端存储本地缓存的最大磁盘占用大小                           | 如果未使用远端存储，无需配置                                 |

## 本地多级存储配置示例

以下以本地两级存储的配置示例。

```JavaScript
// 必须配置项
dn_data_dirs=/data1/data;/data2/data,/data3/data;
default_ttl_in_ms=86400000;-1
dn_default_space_move_thresholds=0.2;0.1
```

在该示例中，共配置了两个层级的存储，具体为：

| **层级** | **数据目录**                           | **数据范围**    | **磁盘最小剩余空间阈值** |
| -------- | -------------------------------------- | --------------- | ------------------------ |
| 层级一   | 目录一：/data1/data                    | 最近 1 天的数据 | 20%                      |
| 层级二   | 目录一：/data2/data目录二：/data3/data | 1 天以前的数据  | 10%                      |

## 远端多级存储配置示例

以下以三级存储为例：

```JavaScript
// 必须配置项
dn_data_dirs=/data1/data;/data2/data,/data3/data;OBJECT_STORAGE
default_ttl_in_ms=86400000;864000000;-1
dn_default_space_move_thresholds=0.2;0.15;0.1
object_storage_name=AWS_S3
object_storage_bucket=iotdb
object_storage_endpoiont=<your_endpoint>
object_storage_access_key=<your_access_key>
object_storage_access_secret=<your_access_secret>

// 可选配置项
remote_tsfile_cache_dirs=data/datanode/data/cache
remote_tsfile_cache_page_size_in_kb=20971520
remote_tsfile_cache_max_disk_usage_in_mb=53687091200
```

在该示例中，共配置了三个层级的存储，具体为：

| **层级** | **数据目录**                           | **数据范围**                 | **磁盘最小剩余空间阈值** |
| -------- | -------------------------------------- | ---------------------------- | ------------------------ |
| 层级一   | 目录一：/data1/data                    | 最近 1 天的数据              | 20%                      |
| 层级二   | 目录一：/data2/data目录二：/data3/data | 过去1 天至过去 10 天内的数据 | 15%                      |
| 层级三   | 远端 AWS S3 存储                       | 过去 10 天以前的数据         | 10%                      |