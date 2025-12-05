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

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/github/78357432-0c71cf80-75e4-11ea-98aa-c43a54d469ce.png">


## 2. Built-in MQTT Service
The Built-in MQTT Service provide the ability of direct connection to IoTDB through MQTT. It listen the publish messages from MQTT clients
 and then write the data into storage immediately. 
The MQTT topic corresponds to IoTDB timeseries. 
The messages payload can be format to events by `PayloadFormatter` which loaded by java SPI, and the default implementation is `JSONPayloadFormatter`.
The default `json` formatter support two json format and its json array. The following is an MQTT message payload example:

```json
 {
      "device":"root.sg.d1",
      "timestamp":1586076045524,
      "measurements":["s1","s2"],
      "values":[0.530635,0.530635]
 }
```
or
```json
 {
      "device":"root.sg.d1",
      "timestamps":[1586076045524,1586076065526],
      "measurements":["s1","s2"],
      "values":[[0.530635,0.530635], [0.530655,0.530695]]
 }
```
or json array of the above two.

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/github/78357469-1bf11880-75e4-11ea-978f-a53996667a0d.png">

## 3. MQTT Configurations
The IoTDB MQTT service load configurations from `${IOTDB_HOME}/${IOTDB_CONF}/iotdb-system.properties` by default.

Configurations are as follows:

| **Property**            | **Description**                                                                                                | **Default** |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `enable_mqtt_service`     | Enable/ disable the MQTT service.                                                                                    | FALSE             |
| `mqtt_host`               | Host address bound to the MQTT service.                                                                              | 127.0.0.1         |
| `mqtt_port`               | Port bound to the MQTT service.                                                                                      | 1883              |
| `mqtt_handler_pool_size`  | Thread pool size for processing MQTT messages.                                                                       | 1                 |
| **`mqtt_payload_formatter`** | **Formatting method for MQTT message payloads. ​**​**Options: `json` (tree model), `line` (table model).** | **json**    |
| `mqtt_max_message_size`   | Maximum allowed MQTT message size (bytes).                                                                           | 1048576           |

## 4. Coding Examples
The following is an example which a mqtt client send messages to IoTDB server.

```java
MQTT mqtt = new MQTT();
mqtt.setHost("127.0.0.1", 1883);
mqtt.setUserName("root");
mqtt.setPassword("root");

BlockingConnection connection = mqtt.blockingConnection();
connection.connect();

Random random = new Random();
for (int i = 0; i < 10; i++) {
    String payload = String.format("{\n" +
            "\"device\":\"root.sg.d1\",\n" +
            "\"timestamp\":%d,\n" +
            "\"measurements\":[\"s1\"],\n" +
            "\"values\":[%f]\n" +
            "}", System.currentTimeMillis(), random.nextDouble());

    connection.publish("root.sg.d1.s1", payload.getBytes(), QoS.AT_LEAST_ONCE, false);
}

connection.disconnect();

```

## 5. Customize your MQTT Message Format

In a production environment, each device typically has its own MQTT client, and the message formats of these clients have been pre-defined. If communication is to be carried out in accordance with the MQTT message format supported by IoTDB, a comprehensive upgrade and transformation of all existing clients would be required, which would undoubtedly incur significant costs. However, we can easily achieve customization of the MQTT message format through simple programming means, without the need to modify the clients. 
An example can be found in  [example/mqtt-customize](https://github.com/apache/iotdb/tree/rc/2.0.1/example/mqtt-customize)  project.

Assuming the MQTT client sends the following message format:
```json
 {
    "time":1586076045523,
    "deviceID":"car_1",
    "deviceType":"Gasoline car​​",
    "point":"Fuel level​​",
    "value":10.0
}
```
Or in the form of an array of JSON:
```java
[
    {        
        "time":1586076045523,        
        "deviceID":"car_1",        
        "deviceType":"Gasoline car​​",        
        "point":"Fuel level",        
        "value":10.0
    },
    {       
        "time":1586076045524,       
        "deviceID":"car_2",
        "deviceType":"NEV(new enegry vehicle)",       
        "point":"Speed",       
        "value":80.0
    }
]
```

Then you can set up the custom MQTT message format through the following steps:

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

import org.apache.iotdb.db.protocol.mqtt.Message;
import org.apache.iotdb.db.protocol.mqtt.PayloadFormatter;
import org.apache.iotdb.db.protocol.mqtt.TableMessage;

import com.google.common.collect.Lists;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParseException;
import io.netty.buffer.ByteBuf;
import org.apache.commons.lang3.NotImplementedException;
import org.apache.tsfile.enums.TSDataType;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * The Customized JSON payload formatter. one json format supported: { "time":1586076045523,
 * "deviceID":"car_1", "deviceType":"NEV", "point":"Speed", "value":80.0 }
 */
public class CustomizedJsonPayloadFormatter implements PayloadFormatter {
    private static final String JSON_KEY_TIME = "time";
    private static final String JSON_KEY_DEVICEID = "deviceID";
    private static final String JSON_KEY_DEVICETYPE = "deviceType";
    private static final String JSON_KEY_POINT = "point";
    private static final String JSON_KEY_VALUE = "value";
    private static final Gson GSON = new GsonBuilder().create();

    @Override
    public List<Message> format(String topic, ByteBuf payload) {
        if (payload == null) {
            return new ArrayList<>();
        }
        String txt = payload.toString(StandardCharsets.UTF_8);
        JsonElement jsonElement = GSON.fromJson(txt, JsonElement.class);
        if (jsonElement.isJsonObject()) {
            JsonObject jsonObject = jsonElement.getAsJsonObject();
            return formatTableRow(topic, jsonObject);
        } else if (jsonElement.isJsonArray()) {
            JsonArray jsonArray = jsonElement.getAsJsonArray();
            List<Message> messages = new ArrayList<>();
            for (JsonElement element : jsonArray) {
                JsonObject jsonObject = element.getAsJsonObject();
                messages.addAll(formatTableRow(topic, jsonObject));
            }
            return messages;
        }
        throw new JsonParseException("payload is invalidate");
    }

    @Override
    @Deprecated
    public List<Message> format(ByteBuf payload) {
        throw new NotImplementedException();
    }

    private List<Message> formatTableRow(String topic, JsonObject jsonObject) {
        TableMessage message = new TableMessage();
        String database = !topic.contains("/") ? topic : topic.substring(0, topic.indexOf("/"));
        String table = "test_table";

        // Parsing Database Name
        message.setDatabase((database));

        // Parsing Table Name
        message.setTable(table);

        // Parsing Tags
        List<String> tagKeys = new ArrayList<>();
        tagKeys.add(JSON_KEY_DEVICEID);
        List<Object> tagValues = new ArrayList<>();
        tagValues.add(jsonObject.get(JSON_KEY_DEVICEID).getAsString());
        message.setTagKeys(tagKeys);
        message.setTagValues(tagValues);

        // Parsing Attributes
        List<String> attributeKeys = new ArrayList<>();
        List<Object> attributeValues = new ArrayList<>();
        attributeKeys.add(JSON_KEY_DEVICETYPE);
        attributeValues.add(jsonObject.get(JSON_KEY_DEVICETYPE).getAsString());
        message.setAttributeKeys(attributeKeys);
        message.setAttributeValues(attributeValues);

        // Parsing Fields
        List<String> fields = Arrays.asList(JSON_KEY_POINT);
        List<TSDataType> dataTypes = Arrays.asList(TSDataType.FLOAT);
        List<Object> values = Arrays.asList(jsonObject.get(JSON_KEY_VALUE).getAsFloat());
        message.setFields(fields);
        message.setDataTypes(dataTypes);
        message.setValues(values);

        // Parsing timestamp
        message.setTimestamp(jsonObject.get(JSON_KEY_TIME).getAsLong());
        return Lists.newArrayList(message);
    }

    @Override
    public String getName() {
        // set the value of mqtt_payload_formatter in iotdb-common.properties as the following string:
        return "CustomizedJson2Table";
    }

    @Override
    public String getType() {
        return PayloadFormatter.TABLE_TYPE;
    }
}
```
3. modify the file in `src/main/resources/META-INF/services/org.apache.iotdb.db.protocol.mqtt.PayloadFormatter`:
  clean the file and put your implementation class name into the file.
  In this example, the content is: `org.apache.iotdb.mqtt.server.CustomizedJsonPayloadFormatter`
4. compile your implementation as a jar file: `mvn package -DskipTests`


Then, in your server:
1. Create ${IOTDB_HOME}/ext/mqtt/ folder, and put the jar into this folder.
2. Update configuration to enable MQTT service. (`enable_mqtt_service=true` in `conf/iotdb-system.properties`)
3. Set the value of `mqtt_payload_formatter` in `conf/iotdb-system.properties` as the value of getName() in your implementation
  , in this example, the value is `CustomizedJson2Table`
4. Launch the IoTDB server.
5. Now IoTDB will use your implementation to parse the MQTT message.

More: the message format can be anything you want. For example, if it is a binary format, 
just use `payload.forEachByte()` or `payload.array` to get bytes content. 


## 6. Caution

To avoid compatibility issues caused by a default client_id, always explicitly supply a unique, non-empty client_id in every MQTT client.
Behavior varies when the client_id is missing or empty. Common examples:
1. Explicitly sending an empty string
   • MQTTX: When client_id="", IoTDB silently discards the message.
   • mosquitto_pub: When client_id="", IoTDB receives the message normally.
2. Omitting client_id entirely
   • MQTTX: IoTDB accepts the message.
   • mosquitto_pub: IoTDB rejects the connection.
   Therefore, explicitly assigning a unique, non-empty client_id is the simplest way to eliminate these discrepancies and ensure reliable message delivery.
