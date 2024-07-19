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

[MQTT](http://mqtt.org/) is a machine-to-machine (M2M)/"Internet of Things" connectivity protocol.
It was designed as an extremely lightweight publish/subscribe messaging transport.
It is useful for connections with remote locations where a small code footprint is required and/or network bandwidth is at a premium.

IoTDB supports the MQTT v3.1(an OASIS Standard) protocol.
IoTDB server includes a built-in MQTT service that allows remote devices to send messages to an IoTDB server directly.

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="https://alioss.timecho.com/docs/img/github/78357432-0c71cf80-75e4-11ea-98aa-c43a54d469ce.png">

## Built-in MQTT Service
The built-in MQTT Service provides the ability of a direct connection to IoTDB using MQTT. 
It listens for publish messages from MQTT clients and then writes the data into storage immediately. 
The MQTT topic is directly mapped to the IoTDB timeseries used for persisting the data. 
The messages payload can be formatted to events by using the `PayloadFormatter` which loaded by Java SPI. 
The default implementation is `JSONPayloadFormatter`.
The default `json` formatter supports both accepting single json objects as well as arrays of json objects. 

The following are two examples of valid MQTT message payloads:

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

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="https://alioss.timecho.com/docs/img/github/78357469-1bf11880-75e4-11ea-978f-a53996667a0d.png">

## MQTT Configurations

The IoTDB MQTT service load configurations from `${IOTDB_HOME}/${IOTDB_CONF}/iotdb-system.properties` by default.

The `IoTDB MQTT service` loads it's configuration from `${IOTDB_HOME}/${IOTDB_CONF}/iotdb-system.properties` per default.

The configuration options of this file are as follows:

| NAME                   |                    DESCRIPTION                     |  DEFAULT  |
|------------------------|:--------------------------------------------------:|:---------:|
| enable_mqtt_service    |         whether to enable the mqtt service         |   false   |
| mqtt_host              |           the mqtt service binding host            | 127.0.0.1 |
| mqtt_port              |           the mqtt service binding port            |   1883    |
| mqtt_handler_pool_size |the handler pool size for handing the mqtt messages |    1      |
| mqtt_payload_formatter |         the mqtt message payload formatter         |   json    |
| mqtt_max_message_size  |         the max mqtt message size in byte          |  1048576  |

## Coding Examples
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

## Customize your MQTT Message Format

If you need a special format, you can customize your MQTT Message format by writing a few lines of codes. 

An example can be found in [example/mqtt-customize](https://github.com/apache/iotdb/tree/master/example/mqtt-customize) module.

Steps:
* Create a java project, and add dependency:
```xml
        <dependency>
            <groupId>org.apache.iotdb</groupId>
            <artifactId>iotdb-server</artifactId>
            <version>1.1.0-SNAPSHOT</version>
        </dependency>
```
* Create your implementation class which implements the `org.apache.iotdb.db.protocol.mqtt.PayloadFormatter` interface:
```java
package org.apache.iotdb.mqtt.server;

import io.netty.buffer.ByteBuf;
import org.apache.iotdb.db.protocol.mqtt.Message;
import org.apache.iotdb.db.protocol.mqtt.PayloadFormatter;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class CustomizedJsonPayloadFormatter implements PayloadFormatter {

    @Override
    public List<Message> format(ByteBuf payload) {
        // Suppose the payload is a json format
        if (payload == null) {
            return null;
        }

        String json = payload.toString(StandardCharsets.UTF_8);
        // parse data from the json and generate Messages and put them into List<Meesage> ret
        List<Message> ret = new ArrayList<>();
        // this is just an example, so we just generate some Messages directly
        for (int i = 0; i < 2; i++) {
            long ts = i;
            Message message = new Message();
            message.setDevice("d" + i);
            message.setTimestamp(ts);
            message.setMeasurements(Arrays.asList("s1", "s2"));
            message.setValues(Arrays.asList("4.0" + i, "5.0" + i));
            ret.add(message);
        }
        return ret;
    }

    @Override
    public String getName() {
        // set the value of mqtt_payload_formatter in iotdb-system.properties as the following string:
        return "CustomizedJson";
    }
}
```
* Update or create a file: `src/main/resources/META-INF/services/org.apache.iotdb.db.protocol.mqtt.PayloadFormatter` containing the fully qualified class name of your formatter. 
  (In the previous example, this would be adding a single line with this content: `org.apache.iotdb.mqtt.server.CustomizedJsonPayloadFormatter`)  
* compile your implementation into a jar file: `mvn package -DskipTests`

Then, in your server:
* Create an `${IOTDB_HOME}/ext/mqtt/` folder, and put the jar into this directory.
* Update configuration to enable MQTT service in `conf/iotdb-system.properties` by setting `enable_mqtt_service=true`.
* Set the value of `mqtt_payload_formatter` in `conf/iotdb-system.properties` to the value you are returning in your implementation of getName().
  (In this example, the value would be: `CustomizedJson`)
* Launch the IoTDB server.
* Now IoTDB will use your implementation to parse the MQTT message.

More: the message format can be anything you want. For example, if it is a binary format, 
just use `payload.forEachByte()` or `payload.array` to get bytes content. 



