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

## 字符集

IoTDB 包含多种字符集支持，默认使用 UTF-8 编码，并可以通过配置参数进行切换。

字符集相关的配置参数位于位于 `sbin` 目录下。
* `start-confignode.sh`：confignode 的配置文件，可以配置 ConfigNode 的字符集编码方式。
* `start-datanode.sh`：datanode 的配置文件，可以配置 DataNode 的字符集编码方式。

### 配置项

* -Dsun.jnu.encoding

|名字| -Dsun.jnu.encoding     |
|:---:|:-----------------------|
|描述| IoTDB 所在操作系统编码方式       |
|类型| String                 |
|默认值| UTF-8                  |
|改后生效方式| 重启服务生效                 |

* -Dfile.encoding

|名字| -Dfile.encoding  |
|:---:|:-----------------|
|描述| IoTDB 启动时的文件编码方式 |
|类型| String           |
|默认值| UTF-8            |
|改后生效方式| 重启服务生效           |

### 配置项修改方式

在 `start-confignode.sh` 和 `start-datanode.sh` 文件中，修改 `iotdb_parms` 中的上述两个配置项

```
  iotdb_parms="-Dlogback.configurationFile=${IOTDB_LOG_CONFIG}"
	iotdb_parms="$iotdb_parms -DIOTDB_HOME=${IOTDB_HOME}"
	iotdb_parms="$iotdb_parms -DIOTDB_DATA_HOME=${IOTDB_DATA_HOME}"
	iotdb_parms="$iotdb_parms -DTSFILE_HOME=${IOTDB_HOME}"
	iotdb_parms="$iotdb_parms -DIOTDB_CONF=${IOTDB_CONF}"
	iotdb_parms="$iotdb_parms -DTSFILE_CONF=${IOTDB_CONF}"
	iotdb_parms="$iotdb_parms -Dname=iotdb\.IoTDB"
	iotdb_parms="$iotdb_parms -DIOTDB_LOG_DIR=${IOTDB_LOG_DIR}"
	iotdb_parms="$iotdb_parms -Dsun.jnu.encoding=UTF-8"
	iotdb_parms="$iotdb_parms -Dfile.encoding=UTF-8"
```
