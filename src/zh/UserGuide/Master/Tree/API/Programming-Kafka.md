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

[Apache Kafka](https://kafka.apache.org/)  是一个开源的分布式事件流平台，被数千家公司用于高性能数据管道、流分析、数据集成和关键任务应用。

## 1 示例代码

### 1.1 kafka 生产者生产数据 Java 代码示例

```java
    Properties props = new Properties();
    props.put("bootstrap.servers", "127.0.0.1:9092");
    props.put("key.serializer", StringSerializer.class);
    props.put("value.serializer", StringSerializer.class);
    KafkaProducer<String, String> producer = new KafkaProducer<>(props);
    producer.send(
        new ProducerRecord<>(
            "Kafka-Test", "key", "root.kafka," + System.currentTimeMillis() + ",value,INT32,100"));
    producer.close();
```

### 1.2 kafka 消费者接收数据 Java 代码示例

```java
    Properties props = new Properties();
    props.put("bootstrap.servers", "127.0.0.1:9092");
    props.put("key.deserializer", StringDeserializer.class);
    props.put("value.deserializer", StringDeserializer.class);
    props.put("auto.offset.reset", "earliest");
    props.put("group.id", "Kafka-Test");
    KafkaConsumer<String, String> kafkaConsumer = new KafkaConsumer<>(props);
    kafkaConsumer.subscribe(Collections.singleton("Kafka-Test"));
    ConsumerRecords<String, String> records = kafkaConsumer.poll(Duration.ofSeconds(1));
 ```

### 1.3 存入 IoTDB 服务器的 Java 代码示例

```java
    SessionPool pool =
        new SessionPool.Builder()
            .host("127.0.0.1")
            .port(6667)
            .user("root")
            .password("root")
            .maxSize(3)
            .build();
    List<String> datas = new ArrayList<>(records.count());
    for (ConsumerRecord<String, String> record : records) {
      datas.add(record.value());
    }        
    int size = datas.size();
    List<String> deviceIds = new ArrayList<>(size);
    List<Long> times = new ArrayList<>(size);
    List<List<String>> measurementsList = new ArrayList<>(size);
    List<List<TSDataType>> typesList = new ArrayList<>(size);
    List<List<Object>> valuesList = new ArrayList<>(size);
    for (String data : datas) {
      String[] dataArray = data.split(",");
      String device = dataArray[0];
      long time = Long.parseLong(dataArray[1]);
      List<String> measurements = Arrays.asList(dataArray[2].split(":"));
      List<TSDataType> types = new ArrayList<>();
      for (String type : dataArray[3].split(":")) {
        types.add(TSDataType.valueOf(type));
      }
      List<Object> values = new ArrayList<>();
      String[] valuesStr = dataArray[4].split(":");
      for (int i = 0; i < valuesStr.length; i++) {
        switch (types.get(i)) {
          case INT64:
            values.add(Long.parseLong(valuesStr[i]));
            break;
          case DOUBLE:
            values.add(Double.parseDouble(valuesStr[i]));
            break;
          case INT32:
            values.add(Integer.parseInt(valuesStr[i]));
            break;
          case TEXT:
            values.add(valuesStr[i]);
            break;
          case FLOAT:
            values.add(Float.parseFloat(valuesStr[i]));
            break;
          case BOOLEAN:
            values.add(Boolean.parseBoolean(valuesStr[i]));
            break;
        }
      }
      deviceIds.add(device);
      times.add(time);
      measurementsList.add(measurements);
      typesList.add(types);
      valuesList.add(values);
    }
    pool.insertRecords(deviceIds, times, measurementsList, typesList, valuesList);
 ```

