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

# Kafka

[Apache Kafka](https://kafka.apache.org/) 是一个开源的分布式事件流平台，常用于构建高性能数据管道、流式分析和数据集成系统。IoTDB 可以通过 Kafka Consumer 订阅 Kafka 中的数据，并使用 Session API 将数据写入 IoTDB。

本文介绍一个简单的数据写入流程：应用程序向 Kafka Topic 写入消息，Kafka Consumer 消费消息并解析为 IoTDB 时序数据，最后写入 IoTDB。

## 1. 环境准备

使用前请确保已准备以下环境：

- JDK 8 或以上版本
- Maven 3.6 或以上版本
- Apache Kafka，安装与启动方式请参考 [Kafka 官方文档](https://kafka.apache.org/documentation/)
- Apache IoTDB 服务已启动

以下示例中使用的默认地址如下：

| 服务 | 地址 |
| --- | --- |
| Kafka | `127.0.0.1:9092` |
| IoTDB | `127.0.0.1:6667` |
| IoTDB 用户名 | `root` |
| IoTDB 密码 | `root` |

## 2. 添加项目依赖

在 Maven 项目的 `pom.xml` 中添加 Kafka 与 IoTDB Session 相关依赖。IoTDB 依赖版本建议与实际部署的 IoTDB 版本保持一致。

```xml
<dependencies>
    <dependency>
        <groupId>org.apache.iotdb</groupId>
        <artifactId>iotdb-session</artifactId>
        <version>2.0.4</version>
    </dependency>
    <dependency>
        <groupId>org.apache.kafka</groupId>
        <artifactId>kafka-clients</artifactId>
        <version>3.7.0</version>
    </dependency>
</dependencies>
```

完整示例工程可参考：[iotdb-extras/examples/kafka](https://github.com/apache/iotdb-extras/tree/master/examples/kafka)。

## 3. Kafka 消息格式

示例程序使用字符串格式传输一条 IoTDB 数据记录：

```text
device,timestamp,measurements,types,values
```

字段说明如下：

| 字段 | 说明 | 示例 |
| --- | --- | --- |
| `device` | IoTDB 设备路径 | `root.kafka.d0` |
| `timestamp` | 时间戳，单位为毫秒 | `1716180000000` |
| `measurements` | 测点名称，多个测点使用 `:` 分隔 | `temperature:status` |
| `types` | 数据类型，多个类型使用 `:` 分隔 | `DOUBLE:BOOLEAN` |
| `values` | 数据值，多个值使用 `:` 分隔 | `36.5:true` |

单测点消息示例：

```text
root.kafka.d0,1716180000000,temperature,DOUBLE,36.5
```

多测点消息示例：

```text
root.kafka.d0,1716180000000,temperature:status,DOUBLE:BOOLEAN,36.5:true
```

## 4. 生产数据到 Kafka

以下代码展示向 `Kafka-Test` Topic 写入一条 IoTDB 数据记录的关键逻辑：

```java
String value = "root.kafka.d0,"
    + System.currentTimeMillis()
    + ",temperature:status,DOUBLE:BOOLEAN,36.5:true";

producer.send(new ProducerRecord<>("Kafka-Test", "iotdb", value));
```

## 5. 消费 Kafka 数据并写入 IoTDB

Kafka Consumer 从 Topic 中读取消息后，解析设备、时间戳、测点、类型和值，并调用 IoTDB SessionPool 写入数据。

```java
String[] fields = record.value().split(",");
String device = fields[0];
long time = Long.parseLong(fields[1]);
List<String> measurements = Arrays.asList(fields[2].split(":"));

String[] typeNames = fields[3].split(":");
String[] valueTexts = fields[4].split(":");

List<TSDataType> types = new ArrayList<>();
List<Object> values = new ArrayList<>();

for (int i = 0; i < typeNames.length; i++) {
  TSDataType type = TSDataType.valueOf(typeNames[i]);
  types.add(type);

  switch (type) {
    case INT32:
      values.add(Integer.parseInt(valueTexts[i]));
      break;
    case INT64:
      values.add(Long.parseLong(valueTexts[i]));
      break;
    case FLOAT:
      values.add(Float.parseFloat(valueTexts[i]));
      break;
    case DOUBLE:
      values.add(Double.parseDouble(valueTexts[i]));
      break;
    case BOOLEAN:
      values.add(Boolean.parseBoolean(valueTexts[i]));
      break;
    case TEXT:
      values.add(valueTexts[i]);
      break;
    default:
      throw new IllegalArgumentException("Unsupported data type: " + type);
  }
}

pool.insertRecord(device, time, measurements, types, values);
```

其中，IoTDB SessionPool 可按如下方式创建：

```java
SessionPool pool = new SessionPool.Builder()
    .host("127.0.0.1")
    .port(6667)
    .user("root")
    .password("root")
    .maxSize(3)
    .build();
```

## 6. 查询写入结果

连接 IoTDB CLI：

```bash
./sbin/start-cli.sh -h 127.0.0.1 -p 6667 -u root -pw root
```

执行查询：

```sql
SELECT * FROM root.kafka.**;
```

查询结果中可以看到由 Kafka Consumer 写入的时间序列数据，例如：

```text
+-----------------------------+-------------------------+--------------------+
|                         Time|root.kafka.d0.temperature|root.kafka.d0.status|
+-----------------------------+-------------------------+--------------------+
|2024-05-20T10:00:00.000+08:00|                     36.5|                true|
+-----------------------------+-------------------------+--------------------+
```

