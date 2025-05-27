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

[MQTT](Message Queuing Telemetry Transport)(http://mqtt.org/) is a lightweight messaging protocol designed for IoT and low-bandwidth environments. It operates on a Publish/Subscribe (Pub/Sub) model, enabling efficient and reliable bidirectional communication between devices. Its core objectives are low power consumption, minimal bandwidth usage, and high real-time performance, making it ideal for unstable networks or resource-constrained scenarios (e.g., sensors, mobile devices).

IoTDB provides deep integration with the MQTT protocol, fully compliant with MQTT v3.1 (OASIS International Standard). The IoTDB server includes a built-in high-performance MQTT Broker module, eliminating the need for third-party middleware. Devices can directly write time-series data into the IoTDB storage engine via MQTT messages.

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/github/78357432-0c71cf80-75e4-11ea-98aa-c43a54d469ce.png">



## 2. Built-in MQTT Service
The Built-in MQTT Service provide the ability of direct connection to IoTDB through MQTT. It listen the publish messages from MQTT clients
and then write the data into storage immediately.
The MQTT topic corresponds to IoTDB timeseries.The first segment of the MQTT topic (split by `/`) is used as the database name.The table name is derived from the `<measurement>` in the line protocol.
The messages payload can be format to events by `PayloadFormatter` which loaded by java SPI, and the implementation of `PayloadFormatter` for table is `LinePayloadFormatter`.
The following is the line protocol syntax of MQTT message payload and an example:

* Line Protocol Syntax

```JavaScript
<measurement>[,<tag_key>=<tag_value>[,<tag_key>=<tag_value>]][ <attribute_key>=<attribute_value>[,<attribute_key>=<attribute_value>]] <field_key>=<field_value>[,<field_key>=<field_value>] [<timestamp>]
```

* Example

```JavaScript
myMeasurement,tag1=value1,tag2=value2 attr1=value1,attr2=value2 fieldKey="fieldValue" 1556813561098000000
```



## 3. MQTT Configurations

By default, the IoTDB MQTT service loads configurations from `${IOTDB_HOME}/${IOTDB_CONF}/iotdb-system.properties`.

Configurations are as follows:

| **Property**            | **Description**                                                                                                | **Default** |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------- |-------------|
| `enable_mqtt_service`     | Enable/ disable the MQTT service.                                                                                    | false       |
| `mqtt_host`               | Host address bound to the MQTT service.                                                                              | 127.0.0.1   |
| `mqtt_port`               | Port bound to the MQTT service.                                                                                      | 1883        |
| `mqtt_handler_pool_size`  | Thread pool size for processing MQTT messages.                                                                       | 1           |
| **`mqtt_payload_formatter`** | **Formatting method for MQTT message payloads. ​**​**Options: `json` (tree model), `line` (table model).** | **json**    |
| `mqtt_max_message_size`   | Maximum allowed MQTT message size (bytes).                                                                           | 1048576     |


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


## 5. Coding Examples
The following is an example which a mqtt client send messages to IoTDB server.

```java
MQTT mqtt = new MQTT();
mqtt.setHost("127.0.0.1", 1883);
mqtt.setUserName("root");
mqtt.setPassword("root");

BlockingConnection connection = mqtt.blockingConnection();
connection.connect();

for (int i = 0; i < 10; i++) {
    String payload = String.format("test%d,tag1=t1,tag2=t2 attr1=a1,attr2=a2 field1=\"value1\",field2=1i,field3=2u,field4=3i32,field5=t,field6=false,field7=4,field8=5f 1", random.nextDouble());

    connection.publish("root.sg.d1.s1", payload.getBytes(), QoS.AT_LEAST_ONCE, false);
}

connection.disconnect();

```

## 6. Customize your MQTT Message Format

If you do not like the above Line format, you can customize your MQTT Message format by just writing several lines
of codes. An example can be found in  [example/mqtt-customize](https://github.com/apache/iotdb/tree/master/example/mqtt-customize)  project.

Steps:
1. Create a java project, and add dependency:
```xml
        <dependency>
            <groupId>org.apache.iotdb</groupId>
            <artifactId>iotdb-server</artifactId>
            <version>2.0.4-SNAPSHOT</version>
        </dependency>
```
2. Define your implementation which implements `org.apache.iotdb.db.protocol.mqtt.PayloadFormatter`
   e.g.,

```java
package org.apache.iotdb.mqtt.server;

import io.netty.buffer.ByteBuf;
import org.apache.iotdb.db.protocol.mqtt.Message;
import org.apache.iotdb.db.protocol.mqtt.PayloadFormatter;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class CustomizedLinePayloadFormatter implements PayloadFormatter {

    @Override
    public List<Message> format(String topic, ByteBuf payload) {
        // Suppose the payload is a line format
        if (payload == null) {
            return null;
        }

        String line = payload.toString(StandardCharsets.UTF_8);
        // parse data from the line and generate Messages and put them into List<Meesage> ret
        List<Message> ret = new ArrayList<>();
        // this is just an example, so we just generate some Messages directly
        for (int i = 0; i < 3; i++) {
            long ts = i;
            TableMessage message = new TableMessage();
            
            // Parsing Database Name
            message.setDatabase("db" + i);
            
            //Parsing Table Names
            message.setTable("t" + i);

            // Parsing Tags
            List<String> tagKeys = new ArrayList<>();
            tagKeys.add("tag1" + i);
            tagKeys.add("tag2" + i);
            List<Object> tagValues = new ArrayList<>();
            tagValues.add("t_value1" + i);
            tagValues.add("t_value2" + i);
            message.setTagKeys(tagKeys);
            message.setTagValues(tagValues);

            // Parsing Attributes
            List<String> attributeKeys = new ArrayList<>();
            List<Object> attributeValues = new ArrayList<>();
            attributeKeys.add("attr1" + i);
            attributeKeys.add("attr2" + i);
            attributeValues.add("a_value1" + i);
            attributeValues.add("a_value2" + i);
            message.setAttributeKeys(attributeKeys);
            message.setAttributeValues(attributeValues);

           // Parsing Fields
           List<String> fields = Arrays.asList("field1" + i, "field2" + i);
           List<TSDataType> dataTypes = Arrays.asList(TSDataType.FLOAT, TSDataType.FLOAT);
           List<Object> values = Arrays.asList("4.0" + i, "5.0" + i);
           message.setFields(fields);
           message.setDataTypes(dataTypes);
           message.setValues(values);
           
           //// Parsing timestamp
           message.setTimestamp(ts);
           ret.add(message);
        }
        return ret;
    }

    @Override
    public String getName() {
        // set the value of mqtt_payload_formatter in iotdb-system.properties as the following string:
        return "CustomizedLine";
    }
}
```
3. modify the file in `src/main/resources/META-INF/services/org.apache.iotdb.db.protocol.mqtt.PayloadFormatter`:
   clean the file and put your implementation class name into the file.
   In this example, the content is: `org.apache.iotdb.mqtt.server.CustomizedLinePayloadFormatter`
4. compile your implementation as a jar file: `mvn package -DskipTests`


Then, in your server:
1. Create ${IOTDB_HOME}/ext/mqtt/ folder, and put the jar into this folder.
2. Update configuration to enable MQTT service. (`enable_mqtt_service=true` in `conf/iotdb-system.properties`)
3. Set the value of `mqtt_payload_formatter` in `conf/iotdb-system.properties` as the value of getName() in your implementation
   , in this example, the value is `CustomizedLine`
4. Launch the IoTDB server.
5. Now IoTDB will use your implementation to parse the MQTT message.

More: the message format can be anything you want. For example, if it is a binary format,
just use `payload.forEachByte()` or `payload.array` to get bytes content. 