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
IoTDB server includes a built-in MQTT service that allows remote devices send messages into IoTDB server directly.

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/github/78357432-0c71cf80-75e4-11ea-98aa-c43a54d469ce.png">

## Built-in MQTT Service
The Built-in MQTT Service provide the ability of direct connection to IoTDB through MQTT. It listens for publish messages from MQTT clients and immediately writes data to storage if the database already exists.

The portion of the MQTT topic before / is defined as the name of the database into which the IoTDB is stored, or if / is not present, the topic is defined directly as the name of the database into which the IoTDB is stored.

Message payloads can be formatted as events by the `PayloadFormatter` loaded by the Java SPI, and the default implementation of the table model is `LinePayloadFormatter`.

The table model uses the row protocol by default, where attribute_key is an optional field. The following is the definition of the row protocol:
```
<table_name>[,<tag_key>=<tag_value>[,<tag_key>=<tag_value>]][ <attribute_key>=<attribute_value>[,<attribute_key>=<attribute_value>]] <field_key>=<field_value>[,<field_key>=<field_value>] [<timestamp>]
```

The following is an example of an MQTT message payload:
```
 myTable,tag1=t1,tag2=t2 attr1=a1,attr2=a2 fieldKey="fieldValue" 1740109006000 
 myTable,tag1=t1,tag2=t2 fieldKey="fieldValue" 1740109006001
```


<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/github/78357469-1bf11880-75e4-11ea-978f-a53996667a0d.png">

## MQTT Configurations
The IoTDB MQTT service load configurations from `${IOTDB_HOME}/${IOTDB_CONF}/iotdb-system.properties` by default.

Configurations are as follows:

| NAME        | DESCRIPTION           |  DEFAULT  |
| ------------- |:-------------:|:---------:|
| enable_mqtt_service      | whether to enable the mqtt service |   false   |
| mqtt_host      | the mqtt service binding host | 127.0.0.1 |
| mqtt_port      | the mqtt service binding port    |   1883    |
| mqtt_handler_pool_size | the handler pool size for handing the mqtt messages      |     1     |
| mqtt_payload_formatter | the mqtt message payload formatter     |   json    |
| mqtt_max_message_size | the max mqtt message size in byte|  1048576  |


## Coding Examples
The following is an example which a mqtt client send messages to IoTDB server.

 ```java
MQTT mqtt = new MQTT();
mqtt.setHost("127.0.0.1", 1883);
mqtt.setUserName("root");
mqtt.setPassword("root");

BlockingConnection connection = mqtt.blockingConnection();
connection.connect();

String payload =
        "test1,tag1=t1,tag2=t2 attr3=a5,attr4=a4 field1=\"fieldValue1\",field2=1i,field3=1u 1";
    connection.publish(DATABASE + "/myTopic", payload.getBytes(), QoS.AT_LEAST_ONCE, false);
        Thread.sleep(10);

payload =
        "test1,tag1=t1,tag2=t2 attr1=a1,attr2=a2 field1=\"fieldValue1\",field2=1i,field3=1u 4 \n "
        + "test1,tag1=t1,tag2=t2 field4=2,field5=2i32,field6=2f 5";
        connection.publish(DATABASE, payload.getBytes(), QoS.AT_LEAST_ONCE, false);
        Thread.sleep(10);

connection.disconnect();
 ```


## Customize your MQTT Message Format

If you do not like the above Json format, you can customize your MQTT Message format by just writing several lines
of codes.

Steps:
1. Create a java project, and add dependency:
```xml
        <dependency>
            <groupId>org.apache.iotdb</groupId>
            <artifactId>iotdb-server</artifactId>
            <version>2.0.0</version>
        </dependency>
```
2. Define your implementation which implements `org.apache.iotdb.db.protocol.mqtt.PayloadFormatter`
   e.g.,
```java

import org.apache.iotdb.db.protocol.mqtt.Message;
import org.apache.iotdb.db.protocol.mqtt.PayloadFormatter;
import org.apache.iotdb.db.protocol.mqtt.TableMessage;

import io.netty.buffer.ByteBuf;
import org.apache.tsfile.enums.TSDataType;
import org.apache.tsfile.utils.Binary;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class CustomizedTablePayloadFormatter implements PayloadFormatter {

  @Override
  public List<Message> format(ByteBuf payload) {
    if (payload == null) {
      return Collections.emptyList();
    }
    
    List<Message> ret = new ArrayList<>();
    
    for (int i = 0; i < 2; i++) {
      long ts = i;
      TableMessage message = new TableMessage();
      message.setTable("tableTest");
      List<String> tagKeys = new ArrayList<>();
      List<Object> tagValues = new ArrayList<>();
      tagKeys.add("tag1");
      tagValues.add(new Binary[] {new Binary("tagValue1".getBytes(StandardCharsets.UTF_8))});
      message.setTagKeys(tagKeys);
      message.setTagValues(tagValues);
      List<String> attributeKeys = new ArrayList<>();
      List<Object> attributeValues = new ArrayList<>();
      attributeKeys.add("attribute1");
      attributeValues.add(
              new Binary[] {new Binary("attributeValue1".getBytes(StandardCharsets.UTF_8))});
      message.setAttributeKeys(attributeKeys);
      List<String> fields = new ArrayList<>();
      List<TSDataType> dataTypes = new ArrayList<>();
      List<Object> values = new ArrayList<>();
      fields.add("field");
      values.add(1);
      dataTypes.add(TSDataType.INT32);
      message.setFields(fields);
      message.setDataTypes(dataTypes);
      message.setValues(values);
      message.setAttributeValues(attributeValues);
      message.setTimestamp(ts);
      ret.add(message);
    }
    return ret;
  }

  @Override
  public String getName() {
    return "Customized";
  }

  @Override
  public String getType() {
    return PayloadFormatter.TABLE_TYPE;
  }
}
```
3. modify the file in `src/main/resources/META-INF/services/org.apache.iotdb.db.protocol.mqtt.PayloadFormatter`:
   clean the file and put your implementation class name into the file.
   In this example, the content is: `org.apache.iotdb.mqtt.server.CustomizedTablePayloadFormatter`
4. compile your implementation as a jar file: `mvn package -DskipTests`


Then, in your server:
1. Create ${IOTDB_HOME}/ext/mqtt/ folder, and put the jar into this folder.
2. Update configuration to enable MQTT service. (`enable_mqtt_service=true` in `conf/iotdb-system.properties`)
3. Set the value of `mqtt_payload_formatter` in `conf/iotdb-system.properties` as the value of getName() in your implementation
   , in this example, the value is `Customized`
4. Launch the IoTDB server.
5. Now IoTDB will use your implementation to parse the MQTT message.



