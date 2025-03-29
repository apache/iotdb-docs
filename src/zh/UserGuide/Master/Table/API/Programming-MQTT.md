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

[MQTT](http://mqtt.org/) 是机器对机器（M2M）/“物联网”连接协议。

它被设计为一种非常轻量级的发布/订阅消息传递。

对于与需要较小代码占用和/或网络带宽非常宝贵的远程位置的连接很有用。

IoTDB 支持 MQTT v3.1（OASIS 标准）协议。
IoTDB 服务器包括内置的 MQTT 服务，该服务允许远程设备将消息直接发送到 IoTDB 服务器。

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/github/78357432-0c71cf80-75e4-11ea-98aa-c43a54d469ce.png">

## 内置 MQTT 服务
内置的 MQTT 服务提供了通过 MQTT 直接连接到 IoTDB 的能力。 它侦听来自 MQTT 客户端的发布消息，如果数据库已经存在，则立即将数据写入存储。注意：如果数据库不存在，将不会创建数据库，所以需提前创建数据库。

MQTT 主题中 / 之前的部分会被定义为存入 IoTDB 的数据库名字，如果不存在 / 则主题会被直接定义为存入 IoTDB 的数据库名字。

消息有效载荷可以由 Java SPI 加载的`PayloadFormatter`格式化为事件，表模型的默认实现为`LinePayloadFormatter`。

表模型默认使用行协议，其中attribute_key为可选字段。以下为行协议的定义：
```
<table_name>[,<tag_key>=<tag_value>[,<tag_key>=<tag_value>]][ <attribute_key>=<attribute_value>[,<attribute_key>=<attribute_value>]] <field_key>=<field_value>[,<field_key>=<field_value>] [<timestamp>]
```

以下是 MQTT 消息有效负载示例：
```
 myTable,tag1=t1,tag2=t2 attr1=a1,attr2=a2 fieldKey="fieldValue" 1740109006000 
 myTable,tag1=t1,tag2=t2 fieldKey="fieldValue" 1740109006001
```


<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/github/78357469-1bf11880-75e4-11ea-978f-a53996667a0d.png">

## MQTT 配置
默认情况下，IoTDB MQTT 服务从`${IOTDB_HOME}/${IOTDB_CONF}/iotdb-system.properties`加载配置。
使用 MQTT 写入IoTDB表模型需要在 `${IOTDB_HOME}/${IOTDB_CONF}/iotdb-system.properties` 中配置 `mqtt_payload_formatter` 为 `line`。

如
``` properties
enable_mqtt_service=true
mqtt_payload_formatter=line
```

默认配置如下：

| 名称      |         描述         |    默认     |
| ------------- |:------------------:|:---------:|
| enable_mqtt_service      |    是否启用 mqtt 服务    |   false   |
| mqtt_host      |    mqtt 服务绑定主机     | 127.0.0.1 |
| mqtt_port      |    mqtt 服务绑定端口     |   1883    |
| mqtt_handler_pool_size | 处理 mqtt 消息的处理程序池大小 |     1     |
| mqtt_payload_formatter | mqtt 消息有效负载格式化程序;选项： [json，line],内置 json 仅支持树模型，line 仅支持表模型。  |   json    |
| mqtt_max_message_size |  mqtt 消息最大长度（字节）   |  1048576  |


## 示例代码
以下是 mqtt 客户端将消息发送到 IoTDB 服务器的示例。

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


## 自定义 MQTT 消息格式

事实上可以通过简单编程来实现 MQTT 消息的格式自定义。

步骤:
1. 创建一个 Java 项目，增加如下依赖
```xml
        <dependency>
            <groupId>org.apache.iotdb</groupId>
            <artifactId>iotdb-server</artifactId>
            <version>2.0.0</version>
        </dependency>
```
2. 创建一个实现类，实现接口 `org.apache.iotdb.db.mqtt.protocol.PayloadFormatter`

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
3. 修改项目中的 `src/main/resources/META-INF/services/org.apache.iotdb.db.protocol.mqtt.PayloadFormatter` 文件:
  将示例中的文件内容清除，并将刚才的实现类的全名（包名.类名）写入文件中。注意，这个文件中只有一行。
  在本例中，文件内容为: `org.apache.iotdb.mqtt.server.CustomizedTablePayloadFormatter`
4. 编译项目生成一个 jar 包: `mvn package -DskipTests`


在 IoTDB 服务端:
1. 创建 ${IOTDB_HOME}/ext/mqtt/ 文件夹, 将刚才的 jar 包放入此文件夹。
2. 打开 MQTT 服务参数. (`enable_mqtt_service=true` in `conf/iotdb-system.properties`)
3. 用刚才的实现类中的 getName() 方法的返回值 设置为 `conf/iotdb-system.properties` 中 `mqtt_payload_formatter` 的值， 在本例中，为 `Customized`
4. 启动 IoTDB
5. 搞定

