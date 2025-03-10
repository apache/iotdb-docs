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

# 全量备份工具

## 1. 概述

IoTDB 全量备份工具，用于将 IoTDB 单个节点的数据通过硬链接的方式备份到本地指定地址，并可以直接启动加入原集群。备份工具提供了两种模式：快速镜像模式和手动指定备份路径模式。

> 注意：
>
> * 备份前请停止IoTDB服务。
> * 脚本默认后台执行，执行过程中打印的相关信息会输出到日志文件中。
> * IoTDB版本要求：不能低于v1.3.2

## 2. 备份模式

### 2.1 模式一：快速镜像模式

#### 使用方法

```Bash
backup.sh/backup.bat -quick -node xxx  
 # xxx可选值见如下示例

backup.sh/backup.bat -quick -node 
# 备份所有节点到默认路径 

backup.sh/backup.bat -quick -node all 
# 备份所有节点到默认路径 

backup.sh/backup.bat -quick -node confignode 
# 仅备份confignode节点到默认路径

backup.sh/backup.bat -quick -node datanode 
# 仅备份datanode节点到默认路径
```

#### 参数说明

| **参数** | **说明**                                                                                                                                                        | **是否必填** |
| ---------------- |---------------------------------------------------------------------------------------------------------------------------------------------------------------| -------------------- |
| `-quick`   | 快速镜像                                                                                                                                                          | 非必填             |
| `-node`    | 备份节点类型，可选项包括`all`/`datanode`/`confignode`，空值默认为`all`。 <br> `all`：备份`datanode`和`confignode`节点 <br>`datanode`：只备份`datanode`节点 <br> `confignode`：只备份`confignode`节点 | 非必填             |

说明:

1. 校验当前 `IoTDB` 文件夹及根据配置文件列出所有配置路径是否已经存在`_backup`文件夹，如果存在则退出，信息为 `The backup folder already exists`（备份文件夹已经存在）。
2. 给原 `dn_data_dirs` 配置路径新建硬连接到对应的 `_backup` 路径 例如：`dn_data_dirs=/data/iotdb/data/datanode/data` 则备份完后数据在 `/data/iotdb/data/datanode/data_backup`
3. 拷贝出`dn_data_dirs` 其他文件到原 `IoTDB`文件夹到对应的 `_backup` 路径中 例如：`/data/iotdb `备份后 `/data/iotdb_backup`

### 2.2 模式二：手动指定模式

#### 使用方法

```Bash
backup.sh -node xxx -targetdir xxx -targetdatadir xxx -targetwaldir xxx
```

#### 参数说明
| **参数**       | **说明**                                                                           | **是否必填** |
| ---------------------- | ------------------------------------------------------------------------------------------ | -------------------- |
| `-node`          | 备份节点类型`all`/`datanode`/`confignode`默认值`all`                     | 非必填             |
| `-targetdir`     | `IoTDB`要备份到的文件夹                                                              | 必填               |
| `-targetdatadir` | 配置项`dn_data_dirs`路径下文件要备份到的路径，默认`targetdir/data/datanode/data` | 非必填             |
| `-targetwaldir`  | 配置项`dn_wal_dirs`路径下文件要备份到的路径,默认`targetdir/data/datanode/wal`    | 非必填             |


说明:

1. 校验参数 `-targetdir` 为必填项 ，如果参数不存在，则输出 `-targetdir cannot be empty， The backup folder must be specified`（`-targetdir` 参数不能为空，必须指定备份文件夹路径）。
2. 对比配置文件中`dn_data_dirs`，`dn_wal_dirs` 配置路径模式和参数 `-targetdatadir`，`-targetwaldir`是否一致，如果`-targetdatadir`， `-targetwaldir`参数为单一路径则认为一致，如果不一致，输出` -targetdatadir parameter exception, the number of original paths does not match the number of specified paths`（`-targetdatadir` 参数异常，原本路径个数跟现在指定路径个数不一致）。
3. 校验 `-targetdatadir` 配置的路径是否和原配置路径在同一块盘，如果不是同一块盘，则拷贝 `dn_data_dirs` 配置的文件到参数 `-targetdatadir` 对应目录。如果是同一块盘，则优先打硬连接 `dn_data_dirs` 配置的文件到参数 `-targetdatadir` 对应目录，如果打硬连接失败就拷贝文件到`-targetdatadir` 对应目录
4. 配置文件路径与目标路径匹配规则

* **多对一**：多个源路径可以备份到一个目标路径。
* **一对一**：一个源路径可以备份到一个目标路径。
* **多对多**：多个源路径可以备份到多个目标路径，但需要模式匹配。

#### 示例

| **配置文件路径**                                  | **参数 `-targetdatadir` 路径**           | **校验结果**            |
|--------------------------------|-----------------------------------------------------------|---------------------|
| /data/iotdb/data/datanode/data                                     | /data/iotdb\_backup/data/datanode/data                                                                                                                          | 一致                  |
| /data/iotdb/data/datanode/data                                                              | /data/iotdb\_backup/data/datanode/data1,/data/iotdb\_backup/data/datanode/data2                                                                                 | 不一致                 |
| /data/iotdb/data/datanode/data1,/data/iotdb/data/datanode/data2                             | /data/iotdb\_backup/data/datanode/data                                                                                                                          | 一致                  |
| /data/iotdb/data/datanode/data1,/data/iotdb/data/datanode/data2                             | /data/iotdb\_backup/data/datanode/data3,/data/iotdb\_backup/data/datanode/data4                                                                                 | 一致                  |
| /data/iotdb/data/datanode/data1,/data/iotdb/data/datanode/data2;/data/iotdb/data/datanode/data3 | /data/iotdb\_backup/data/datanode/data                                                                                                                          | 一致                  |
| /data/iotdb/data/datanode/data1,/data/iotdb/data/datanode/data2;/data/iotdb/data/datanode/data3 | /data/iotdb\_backup/data/datanode/data1;/data/iotdb\_backup/data/datanode/data1                                                                                 | 一致                  |
| /data/iotdb/data/datanode/data1,/data/iotdb/data/datanode/data2;/data/iotdb/data/datanode/data3 | /data/iotdb\_backup/data/datanode/data1,/data/iotdb\_backup/data/datanode/data3;/data/iotdb\_backup/data/datanode/data                                          | 一致                  |
| /data/iotdb/data/datanode/data1,/data/iotdb/data/datanode/data2;/data/iotdb/data/datanode/data3 | /data/iotdb\_backup/data/datanode/data1,/data/iotdb\_backup/data/datanode/data3;/data/iotdb\_backup/data/datanode/data1,/data/iotdb\_backup/data/datanode/data4 | 不一致                 |

#### 匹配规则总结

* 当 `dn_data_dirs` 仅有 `;` 分割时：
  **规则**：* `-targetdatadir` 可以只输入一个路径（路径中没有 `;` 和 `,`）。
    * `-targetdatadir` 也可以按照 `;` 分割多个路径，但数量必须和 `dn_data_dirs` 中的路径数量相等，且路径中不能有 `,`。
* 当 `dn_data_dirs` 仅有 `,` 分割时：
  **规则**：* `-targetdatadir` 可以只输入一个路径（路径中没有 `;` 和 `,`）。
    * `-targetdatadir` 也可以按照 `,` 分割多个路径，但数量必须和 `dn_data_dirs` 中的路径数量相等，且路径中不能有 `;`。
* 当 `dn_data_dirs` 同时有 `;` 和 `,` 分割时：
  **规则**：* `-targetdatadir` 可以只输入一个路径（路径中没有 `;` 和 `,`）。
    * `-targetdatadir` 也可以优先按照 `;` 分割多个路径，数量必须和 `dn_data_dirs` 中的路径数量相等。每个 `;` 分割的路径中可以只输入一个路径，也可以按照 `,` 分割多个路径，但`,`分割的路径数量必须相等。

> `wal` 路径通常通过 `dn_wal_dirs` 参数指定，规则同上
