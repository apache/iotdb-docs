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


## 5. 代码示例
以下是 mqtt 客户端将消息发送到 IoTDB 服务器的示例。

 ```java
MQTT mqtt = new MQTT();
mqtt.setHost("127.0.0.1", 1883);
mqtt.setUserName("root");
mqtt.setPassword("root");

BlockingConnection connection = mqtt.blockingConnection();
String DATABASE = "myMqttTest";
connection.connect();

String payload =
        "test1,tag1=t1,tag2=t2 attr3=a5,attr4=a4 field1=\"fieldValue1\",field2=1i,field3=1u 1";
connection.publish(DATABASE + "/myTopic", payload.getBytes(), QoS.AT_LEAST_ONCE, false);
Thread.sleep(10);

payload = "test1,tag1=t1,tag2=t2  field4=2,field5=2i32,field6=2f 2";
connection.publish(DATABASE, payload.getBytes(), QoS.AT_LEAST_ONCE, false);
Thread.sleep(10);

payload = "# It's a remark\n " + "test1,tag1=t1,tag2=t2 field4=2,field5=2i32,field6=2f 6";
        connection.publish(DATABASE + "/myTopic", payload.getBytes(), QoS.AT_LEAST_ONCE, false);
        Thread.sleep(10);

//批量写入示例        
payload =
        "test1,tag1=t1,tag2=t2  field7=t,field8=T,field9=true 3 \n "
        + "test1,tag1=t1,tag2=t2  field7=f,field8=F,field9=FALSE 4";
connection.publish(DATABASE + "/myTopic", payload.getBytes(), QoS.AT_LEAST_ONCE, false);
Thread.sleep(10);

//批量写入示例
payload =
        "test1,tag1=t1,tag2=t2 attr1=a1,attr2=a2 field1=\"fieldValue1\",field2=1i,field3=1u 4 \n "
        + "test1,tag1=t1,tag2=t2 field4=2,field5=2i32,field6=2f 5";
connection.publish(DATABASE + "/myTopic", payload.getBytes(), QoS.AT_LEAST_ONCE, false);
Thread.sleep(10);

connection.disconnect();
 ```


## 6. 自定义 MQTT 消息格式

事实上可以通过简单编程来实现 MQTT 消息的格式自定义。
可以在源码的 [example/mqtt-customize](https://github.com/apache/iotdb/tree/master/example/mqtt-customize) 项目中找到一个简单示例。

步骤:
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


3. 修改项目中的 `src/main/resources/META-INF/services/org.apache.iotdb.db.protocol.mqtt.PayloadFormatter` 文件:
   将示例中的文件内容清除，并将刚才的实现类的全名（包名.类名）写入文件中。注意，这个文件中只有一行。
   在本例中，文件内容为: `org.apache.iotdb.mqtt.server.CustomizedLinePayloadFormatter`
4. 编译项目生成一个 jar 包: `mvn package -DskipTests`


在 IoTDB 服务端:
1. 创建 ${IOTDB_HOME}/ext/mqtt/ 文件夹, 将刚才的 jar 包放入此文件夹。
2. 打开 MQTT 服务参数. (`enable_mqtt_service=true` in `conf/iotdb-system.properties`)
3. 用刚才的实现类中的 getName() 方法的返回值 设置为 `conf/iotdb-system.properties` 中 `mqtt_payload_formatter` 的值，
   , 在本例中，为 `CustomizedLine`
4. 启动 IoTDB
5. 搞定

More: MQTT 协议的消息不限于 line，你还可以用任意二进制。通过如下函数获得：
`payload.forEachByte()` or `payload.array`。 

## 7. 注意事项

为避免因缺省client_id引发的兼容性问题，强烈建议在所有MQTT客户端中始终显式地提供唯一且非空的 client_id。
不同客户端在client_id缺失或为空时的表现并不一致，常见示例如下：
1. 显式传入空字符串
• MQTTX：client_id=""时，IoTDB会直接丢弃消息；
• mosquitto_pub：client_id=""时，IoTDB能正常接收消息。
2. 完全不传client_id
• MQTTX：消息可被IoTDB正常接收；
• mosquitto_pub：IoTDB拒绝连接。
由此可见，显式指定唯一且非空的client_id是消除上述差异、确保消息可靠投递的最简单做法。

