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

[Apache Kafka](https://kafka.apache.org/) is an open-source distributed event streaming platform used by thousands of companies for high-performance data pipelines, streaming analytics, data integration, and mission-critical applications. IoTDB can subscribe to Kafka data through a Kafka Consumer and write the data to IoTDB by using the Session API.

This document introduces a simple data ingestion flow: an application writes messages to a Kafka topic, the Kafka Consumer consumes the messages and parses them into IoTDB time series data, and then writes the data to IoTDB.

## 1. Environment Preparation

Before you start, make sure that the following environment is available:

- JDK 8 or later
- Maven 3.6 or later
- Apache Kafka. For installation and startup, refer to the [Kafka official documentation](https://kafka.apache.org/documentation/)
- An IoTDB service is running

The default addresses used in the following examples are:

| Service | Address |
| --- | --- |
| Kafka | `127.0.0.1:9092` |
| IoTDB | `127.0.0.1:6667` |
| IoTDB username | `root` |
| IoTDB password | `root` |

## 2. Add Dependencies

Add the Kafka and IoTDB Session dependencies to your Maven `pom.xml`. It is recommended that the IoTDB dependency version matches your deployed IoTDB version.

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

For the complete example project, see [iotdb-extras/examples/kafka](https://github.com/apache/iotdb-extras/tree/master/examples/kafka).

## 3. Kafka Message Format

The sample program uses a string format to transfer one IoTDB data record:

```text
device,timestamp,measurements,types,values
```

The fields are described as follows:

| Field | Description | Example |
| --- | --- | --- |
| `device` | IoTDB device path | `root.kafka.d0` |
| `timestamp` | Timestamp in milliseconds | `1716180000000` |
| `measurements` | Measurement names, separated by `:` when there are multiple values | `temperature:status` |
| `types` | Data types, separated by `:` when there are multiple values | `DOUBLE:BOOLEAN` |
| `values` | Data values, separated by `:` when there are multiple values | `36.5:true` |

Single-measurement example:

```text
root.kafka.d0,1716180000000,temperature,DOUBLE,36.5
```

Multiple-measurement example:

```text
root.kafka.d0,1716180000000,temperature:status,DOUBLE:BOOLEAN,36.5:true
```

## 4. Produce Data to Kafka

The following code shows the key logic for writing one IoTDB data record to the `Kafka-Test` topic:

```java
String value = "root.kafka.d0,"
    + System.currentTimeMillis()
    + ",temperature:status,DOUBLE:BOOLEAN,36.5:true";

producer.send(new ProducerRecord<>("Kafka-Test", "iotdb", value));
```

## 5. Consume Kafka Data and Write to IoTDB

After the Kafka Consumer reads a message from the topic, it parses the device, timestamp, measurements, types, and values, and writes the data to IoTDB through SessionPool.

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

The IoTDB `SessionPool` can be created as follows:

```java
SessionPool pool = new SessionPool.Builder()
    .host("127.0.0.1")
    .port(6667)
    .user("root")
    .password("root")
    .maxSize(3)
    .build();
```

## 6. Query the Result

Connect to the IoTDB CLI:

```bash
./sbin/start-cli.sh -h 127.0.0.1 -p 6667 -u root -pw root
```

Run the query:

```sql
SELECT * FROM root.kafka.**;
```

The query result shows the time series data written by the Kafka Consumer, for example:

```text
+-----------------------------+-------------------------+--------------------+
|                         Time|root.kafka.d0.temperature|root.kafka.d0.status|
+-----------------------------+-------------------------+--------------------+
|2024-05-20T10:00:00.000+08:00|                     36.5|                true|
+-----------------------------+-------------------------+--------------------+
```

