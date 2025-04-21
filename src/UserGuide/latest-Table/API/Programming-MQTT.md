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
# MQTT Protocol

## 1. Overview

MQTT (Message Queuing Telemetry Transport) is a lightweight messaging protocol designed for IoT and low-bandwidth environments. It operates on a Publish/Subscribe (Pub/Sub) model, enabling efficient and reliable bidirectional communication between devices. Its core objectives are low power consumption, minimal bandwidth usage, and high real-time performance, making it ideal for unstable networks or resource-constrained scenarios (e.g., sensors, mobile devices).

IoTDB provides deep integration with the MQTT protocol, fully compliant with MQTT v3.1 (OASIS International Standard). The IoTDB server includes a built-in high-performance MQTT Broker module, eliminating the need for third-party middleware. Devices can directly write time-series data into the IoTDB storage engine via MQTT messages.

![](/img/mqtt-table-en-1.png)


## 2. Configuration

By default, the IoTDB MQTT service loads configurations from `${IOTDB_HOME}/${IOTDB_CONF}/iotdb-system.properties`.

| **Property**            | **Description**                                                                                                | **Default** |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `enable_mqtt_service`     | Enable/ disable the MQTT service.                                                                                    | FALSE             |
| `mqtt_host`               | Host address bound to the MQTT service.                                                                              | 127.0.0.1         |
| `mqtt_port`               | Port bound to the MQTT service.                                                                                      | 1883              |
| `mqtt_handler_pool_size`  | Thread pool size for processing MQTT messages.                                                                       | 1                 |
| **`mqtt_payload_formatter`** | **Formatting method for MQTT message payloads. ​**​**Options: `json` (tree model), `line` (table model).** | **json**    |
| `mqtt_max_message_size`   | Maximum allowed MQTT message size (bytes).                                                                           | 1048576           |

## 3. Write Protocol

* Line Protocol Syntax

```JavaScript
<measurement>[,<tag_key>=<tag_value>[,<tag_key>=<tag_value>]][ <attribute_key>=<attribute_value>[,<attribute_key>=<attribute_value>]] <field_key>=<field_value>[,<field_key>=<field_value>] [<timestamp>]
```

* Example

```JavaScript
myMeasurement,tag1=value1,tag2=value2 attr1=value1,attr2=value2 fieldKey="fieldValue" 1556813561098000000
```

![](/img/mqtt-table-en-2.png)

## 4. Naming Conventions

* Database Name

The first segment of the MQTT topic (split by `/`) is used as the database name.

```Properties
topic: stock/Legacy
databaseName: stock


topic: stock/Legacy/#
databaseName:stock
```

* Table Name

The table name is derived from the `<measurement>` in the line protocol.

* Type Identifiers

| Filed Value                                                        | IoTDB Data Type |
|--------------------------------------------------------------------| ----------------- |
| 1<br>1.12                                                          | DOUBLE          |
| 1`f`<br>1.12`f`                                                    | FLOAT           |
| 1`i`<br>123`i`                                                     | INT64           |
| 1`u`<br>123`u`                                                     | INT64          |
| 1`i32`<br>123`i32`                                                 | INT32           |
| `"xxx"`                                                            | TEXT            |
| `t`,`T`,`true`,`True`,`TRUE`<br> `f`,`F`,`false`,`False`,`FALSE`   | BOOLEAN         |
