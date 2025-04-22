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
# MQTT 协议

## 1. 概述

MQTT 是一种专为物联网（IoT）和低带宽环境设计的轻量级消息传输协议，基于发布/订阅（Pub/Sub）模型，支持设备间高效、可靠的双向通信。其核心目标是低功耗、低带宽消耗和高实时性，尤其适合网络不稳定或资源受限的场景（如传感器、移动设备）。

IoTDB 深度集成了 MQTT 协议能力，完整兼容 MQTT v3.1（OASIS 国际标准协议）。IoTDB 服务器内置高性能 MQTT Broker 服务模块，无需第三方中间件，支持设备通过 MQTT 报文将时序数据直接写入 IoTDB 存储引擎。

![](/img/mqtt-table-1.png)

## 2. 配置方式

默认情况下，IoTDB MQTT 服务通过`${IOTDB_HOME}/${IOTDB_CONF}/iotdb-system.properties`加载配置。

具体配置项如下：

| **名称**                    | **描述**                                                                                                                                                                        | **默认** |
|---------------------------| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `enable_mqtt_service`       | 是否启用 mqtt 服务                                                                                                                                                                    | FALSE          |
| `mqtt_host`                 | mqtt 服务绑定主机                                                                                                                                                                     | 127.0.0.1      |
| `mqtt_port`                 | mqtt 服务绑定端口                                                                                                                                                                     | 1883           |
| `mqtt_handler_pool_size`    | 处理 mqtt 消息的处理程序池大小                                                                                                                                                        | 1              |
| **`mqtt_payload_formatter`** | **mqtt**​**​ 消息有效负载格式化程序。**​**可选项：**​​**`json`**​**：仅适用于树模型。**​​**`line`**​**：仅适用于表模型。** | **json** |
| `mqtt_max_message_size`     | mqtt 消息最大长度（字节）                                                                                                                                                             | 1048576        |

## 3. 写入协议

* 行协议语法格式

```JavaScript
<measurement>[,<tag_key>=<tag_value>[,<tag_key>=<tag_value>]][ <attribute_key>=<attribute_value>[,<attribute_key>=<attribute_value>]] <field_key>=<field_value>[,<field_key>=<field_value>] [<timestamp>]
```

* 示例

```JavaScript
myMeasurement,tag1=value1,tag2=value2 attr1=value1,attr2=value2 fieldKey="fieldValue" 1556813561098000000
```

![](/img/mqtt-table-2.png)


## 4. 命名约定

* 数据库名称

MQTT topic 名称用 `/` 分割后， 第一串内容作为数据库名称。

```Properties
topic: stock/Legacy
databaseName: stock


topic: stock/Legacy/#
databaseName:stock
```

* 表名称

表名称使用行协议中的 `<measurement>`。

* 类型标识

| Filed 内容                                                     | IoTDB 数据类型 |
|--------------------------------------------------------------| ---------------- |
| 1<br>1.12                                                    | DOUBLE         |
| 1`f`<br>1.12`f`                                                  | FLOAT          |
| 1`i`<br>123`i`                                                   | INT64          |
| 1`u`<br>123`u`                                                   | INT64|
| 1`i32`<br>123`i32`                                               | INT32          |
| `"xxx"`                                                      | TEXT           |
| `t`,`T`,`true`,`True`,`TRUE` <br>`f`,`F`,`false`,`False`,`FALSE` | BOOLEAN        |

