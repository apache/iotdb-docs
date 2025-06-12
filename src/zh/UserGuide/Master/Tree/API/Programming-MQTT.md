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

[MQTT](http://mqtt.org/) 是一种专为物联网（IoT）和低带宽环境设计的轻量级消息传输协议，基于发布/订阅（Pub/Sub）模型，支持设备间高效、可靠的双向通信。其核心目标是低功耗、低带宽消耗和高实时性，尤其适合网络不稳定或资源受限的场景（如传感器、移动设备）。

IoTDB 深度集成了 MQTT 协议能力，完整兼容 MQTT v3.1（OASIS 国际标准协议）。IoTDB 服务器内置高性能 MQTT Broker 服务模块，无需第三方中间件，支持设备通过 MQTT 报文将时序数据直接写入 IoTDB 存储引擎。

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/github/78357432-0c71cf80-75e4-11ea-98aa-c43a54d469ce.png">

## 2. 内置 MQTT 服务
内置的 MQTT 服务提供了通过 MQTT 直接连接到 IoTDB 的能力。 它侦听来自 MQTT 客户端的发布消息，然后立即将数据写入存储。
MQTT 主题与 IoTDB 时间序列相对应。
消息有效载荷可以由 Java SPI 加载的`PayloadFormatter`格式化为事件，默认实现为`JSONPayloadFormatter` 
   默认的`json`格式化程序支持两种 json 格式以及由他们组成的json数组，以下是 MQTT 消息有效负载示例：

```json
 {
      "device":"root.sg.d1",
      "timestamp":1586076045524,
      "measurements":["s1","s2"],
      "values":[0.530635,0.530635]
 }
```
或者
```json
 {
      "device":"root.sg.d1",
      "timestamps":[1586076045524,1586076065526],
      "measurements":["s1","s2"],
      "values":[[0.530635,0.530635], [0.530655,0.530695]]
 }
```
或者以上两者的JSON数组形式。

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/github/78357469-1bf11880-75e4-11ea-978f-a53996667a0d.png">

## 3. MQTT 配置
默认情况下，IoTDB MQTT 服务从`${IOTDB_HOME}/${IOTDB_CONF}/iotdb-system.properties`加载配置。

具体配置项如下：

| **名称**                    | **描述**                                                                                                                                                                        | **默认** |
|---------------------------| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `enable_mqtt_service`       | 是否启用 mqtt 服务                                                                                                                                                                    | FALSE          |
| `mqtt_host`                 | mqtt 服务绑定主机                                                                                                                                                                     | 127.0.0.1      |
| `mqtt_port`                 | mqtt 服务绑定端口                                                                                                                                                                     | 1883           |
| `mqtt_handler_pool_size`    | 处理 mqtt 消息的处理程序池大小                                                                                                                                                        | 1              |
| **`mqtt_payload_formatter`** | **mqtt**​**​ 消息有效负载格式化程序。**​**可选项：**​​**`json`**​**：仅适用于树模型。**​​**`line`**​**：仅适用于表模型。** | **json** |
| `mqtt_max_message_size`     | mqtt 消息最大长度（字节）                                                                                                                                                             | 1048576        |



## 4. 代码示例
以下是 mqtt 客户端将消息发送到 IoTDB 服务器的示例。

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


## 5. 自定义 MQTT 消息格式

在生产环境中，每个设备通常都配备了自己的 MQTT 客户端，且这些客户端的消息格式已经预先设定。如果按照 IoTDB 所支持的 MQTT 消息格式进行通信，就需要对现有的所有客户端进行全面的升级改造，这无疑会带来较高的成本。然而，我们可以通过简单的编程手段，轻松实现 MQTT 消息格式的自定义，而无需改造客户端。
可以在源码的 [example/mqtt-customize](https://github.com/apache/iotdb/tree/master/example/mqtt-customize) 项目中找到一个简单示例。

假定mqtt客户端传过来的是以下消息格式：
```json
 {
    "time":1586076045523,
    "deviceID":"car_1",
    "deviceType":"油车",
    "point":"油量",
    "value":10.0
}
```
或者JSON的数组形式：
```java
[
    {        
        "time":1586076045523,        
        "deviceID":"car_1",        
        "deviceType":"油车",        
        "point":"油量",        
        "value":10.0
    },
    {       
        "time":1586076045524,       
        "deviceID":"car_2",
        "deviceType":"新能源车",       
        "point":"速度",       
        "value":80.0
    }
]
```


则可以通过以下步骤设置设置自定义MQTT消息格式：

1. 创建一个 Java 项目，增加如下依赖
```xml
        <dependency>
            <groupId>org.apache.iotdb</groupId>
            <artifactId>iotdb-server</artifactId>
            <version>2.0.4-SNAPSHOT</version>
        </dependency>
```
2. 创建一个实现类，实现接口 `org.apache.iotdb.db.mqtt.protocol.PayloadFormatter`

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
 * "deviceID":"car_1", "deviceType":"新能源车", "point":"速度", "value":80.0 }
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
3. 修改项目中的 `src/main/resources/META-INF/services/org.apache.iotdb.db.protocol.mqtt.PayloadFormatter` 文件:
  将示例中的文件内容清除，并将刚才的实现类的全名（包名.类名）写入文件中。注意，这个文件中只有一行。
  在本例中，文件内容为: `org.apache.iotdb.mqtt.server.CustomizedJsonPayloadFormatter`
4. 编译项目生成一个 jar 包: `mvn package -DskipTests`


在 IoTDB 服务端:
1. 创建 ${IOTDB_HOME}/ext/mqtt/ 文件夹, 将刚才的 jar 包放入此文件夹。
2. 打开 MQTT 服务参数. (`enable_mqtt_service=true` in `conf/iotdb-system.properties`)
3. 用刚才的实现类中的 getName() 方法的返回值 设置为 `conf/iotdb-system.properties` 中 `mqtt_payload_formatter` 的值， 
  , 在本例中，为 `CustomizedJson2Table`
4. 启动 IoTDB
5. 搞定

More: MQTT 协议的消息不限于 json，你还可以用任意二进制。通过如下函数获得：
`payload.forEachByte()` or `payload.array`。 
