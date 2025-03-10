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

# Backup Tool

## 1. Overview

The IoTDB Full Backup Tool is designed to create a full backup of a single IoTDB node’s data via hard links to a specified local directory. The backup can then be directly started and joined to the original cluster. The tool offers two modes: **Quick Mirror Mode** and **Manual Backup Path Mode**.

> **Notes**:
>
> * **Stop the IoTDB service before starting the backup**.
> * The script runs in the background by default, and logs are saved to log files during execution.
> * **IoTDB version requirement**: Must be **v1.3.2 or higher**.


## 2. Backup Modes

### 2.1 Mode 1: Quick Mirror Mode

#### Usage

```bash
backup.sh/backup.bat -quick -node xxx 
# Optional values for xxx are shown in the following examples

backup.sh/backup.bat -quick -node 
# Back up all nodes to the default path 

backup.sh/backup.bat -quick -node all 
# Back up all nodes to the default path 

backup.sh/backup.bat -quick -node confignode 
# Back up only the ConfigNode to the default path 

backup.sh/backup.bat -quick -node datanode 
# Back up only the DataNode to the default path
```

#### Parameter Descriptions

| **Parameter** | **Description**                                                                                                                                                                                                                             | **Required** |
| ----------------------- |---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| ---------------------- |
| `-quick`          | Enables Quick Mirror Mode.                                                                                                                                                                                                                  | No                   |
| `-node`           | Specifies the node type to back up. Options: `all`, `datanode`, or `confignode`. Default: `all`. <br>`all`: Back up both DataNode and ConfigNode. <br>`datanode`: Back up only the DataNode. <br>`confignode`: Back up only the ConfigNode. | No                   |

**Process Details**:

1. Check if the `_backup` folder already exists in the current IoTDB directory or paths specified in the configuration file. If it exists, the tool exits with the error: `The backup folder already exists`.
2. Create hard links from the original `dn_data_dirs` paths to the corresponding `_backup` paths.
    * Example: If `dn_data_dirs=/data/iotdb/data/datanode/data`, the backup data will be stored in `/data/iotdb/data/datanode/data_backup`.
3. Copy other files from the IoTDB directory (e.g., `/data/iotdb`) to the `_backup` path (e.g., `/data/iotdb_backup`).


### 2.2 Mode 2: Manual Backup Path Mode

#### Usage

```bash
backup.sh -node xxx -targetdir xxx -targetdatadir xxx -targetwaldir xxx  
```

#### Parameter Descriptions

| **Parameter** | **Description**                                                                    | **Required** |
| ----------------------- | -------------------------------------------------------------------------------------------- | ---------------------- |
| `-node`           | Node type to back up (`all`, `datanode`, or `confignode`). Default: `all`. | No                   |
| `-targetdir`      | Target directory for backing up the IoTDB folder.                                          | **Yes**      |
| `-targetdatadir`  | Target path for `dn_data_dirs` files. Default: `targetdir/data/datanode/data`.     | No                   |
| `-targetwaldir`   | Target path for `dn_wal_dirs` files. Default: `targetdir/data/datanode/wal`.       | No                   |

**Process Details**:

1. The `-targetdir` parameter is mandatory. If missing, the tool exits with the error: `-targetdir cannot be empty. The backup folder must be specified`.
2. Validate consistency between configuration paths (`dn_data_dirs`, `dn_wal_dirs`) and parameters (`-targetdatadir`, `-targetwaldir`):

    * If `-targetdatadir` or `-targetwaldir` is a single path, it is considered consistent.
    * If the number of source paths (from configuration) does not match the target paths, the tool exits with the error: `-targetdatadir parameter exception: the number of original paths does not match the specified paths`.
3. Check if `-targetdatadir` paths are on the same disk as the original paths:

    * **Same disk**: Attempt to create hard links. If hard links fail, copy files instead.
    * **Different disk**: Copy files directly.
4. Path Matching Rules

* **Many-to-One**: Multiple source paths can be backed up to a single target path.
* **One-to-One**: A single source path can be backed up to a single target path.
* **Many-to-Many**: Multiple source paths can be backed up to multiple target paths, but the pattern must match.

#### Examples

| **Configuration Paths**                                                                       | **`-targetdatadir` Paths**                                                                                                                              | **Result**       |
| ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `/data/iotdb/data/datanode/data`                                                                  | `/data/iotdb_backup/data/datanode/data`                                                                                                                   |**Consistent**   |
| `/data/iotdb/data/datanode/data`                                                                  | `/data/iotdb_backup/data/datanode/data1,/data/iotdb_backup/data/datanode/data2`                                                                           | **Inconsistent** |
| `/data/iotdb/data/datanode/data1,/data/iotdb/data/datanode/data2`                                 | `/data/iotdb_backup/data/datanode/data`                                                                                                                   | **Consistent**   |
| `/data/iotdb/data/datanode/data1,/data/iotdb/data/datanode/data2`                                 | `/data/iotdb_backup/data/datanode/data3,/data/iotdb_backup/data/datanode/data4`                                                                           | **Consistent**   |
| `/data/iotdb/data/datanode/data1,/data/iotdb/data/datanode/data2;/data/iotdb/data/datanode/data3` | `/data/iotdb_backup/data/datanode/data`                                                                                                                   | **Consistent**   |
| `/data/iotdb/data/datanode/data1,/data/iotdb/data/datanode/data2;/data/iotdb/data/datanode/data3` | `/data/iotdb_backup/data/datanode/data1;/data/iotdb_backup/data/datanode/data1`                                                                           | **Consistent**   |
| `/data/iotdb/data/datanode/data1,/data/iotdb/data/datanode/data2;/data/iotdb/data/datanode/data3` | `/data/iotdb_backup/data/datanode/data1,/data/iotdb_backup/data/datanode/data3;/data/iotdb_backup/data/datanode/data`                                     | **Consistent**   |
| `/data/iotdb/data/datanode/data1,/data/iotdb/data/datanode/data2;/data/iotdb/data/datanode/data3` | `/data/iotdb_backup/data/datanode/data1,/data/iotdb_backup/data/datanode/data3;/data/iotdb_backup/data/datanode/data1,/data/iotdb_backup/data/datanode/data4` | **Inconsistent** |

#### Path Matching Rules Summary

* **Paths separated by `;` only**:
    * `-targetdatadir` can be a single path (no `;` or `,`).
    * `-targetdatadir` can also use `;` to split paths, but the count must match the source paths.
* **Paths separated by `,` only**:
    * `-targetdatadir` can be a single path (no `;` or `,`).
    * `-targetdatadir` can also use `,` to split paths, but the count must match the source paths.
* **Paths with both `;` and `,`**:
    * `-targetdatadir` can be a single path (no `;` or `,`).
    * Split paths first by `;`, then by `,`. The number of paths at each level must match.

> **Note**: The `dn_wal_dirs` parameter (for WAL paths) follows the same rules as `dn_data_dirs`.
