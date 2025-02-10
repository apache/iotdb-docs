# Data Subscription

## 1.  Feature Introduction

The IoTDB data subscription module (also known as the IoTDB subscription client) is a feature supported after IoTDB V1.3.3, which provides users with a streaming data consumption method that is different from data queries. It refers to the basic concepts and logic of message queue products such as Kafka, **providing data subscription and consumption interfaces**, but it is not intended to completely replace these consumer queue products. Instead, it offers more convenient data subscription services for scenarios where simple streaming data acquisition is needed.

Using the IoTDB Subscription Client to consume data has significant advantages in the following application scenarios:

1. **Continuously obtaining the latest data**: By using a subscription method, it is more real-time than scheduled queries, simpler to program applications, and has a lower system burden;

2. **Simplify data push to third-party systems**: No need to develop data push components for different systems within IoTDB, data can be streamed within third-party systems, making it easier to send data to systems such as Flink, Kafka, DataX, Camel, MySQL, PG, etc.

## 2. Key Concepts

The IoTDB Subscription Client encompasses three core concepts: Topic, Consumer, and Consumer Group. The specific relationships are illustrated in the diagram below:

<div align="center">
    <img src="https://alioss.timecho.com/docs/img/Data-sub05.png" alt="" style="width: 60%;"/>
</div>

1. **Topic**: Topic is the data space of IoTDB, represented by paths and time ranges (such as the full time range of root. * *). Consumers can subscribe to data on these topics (currently existing and future written). Unlike Kafka, IoTDB can create topics after data is stored, and the output format can be either Message or TsFile.

2. **Consumer**: Consumer is an IoTDB subscription client is located, responsible for receiving and processing data published to specific topics. Consumers retrieve data from the queue and process it accordingly. There are two types of Consumers available in the IoTDB subscription client:
  - `SubscriptionPullConsumer`, which corresponds to the pull consumption model in message queues, where user code needs to actively invoke data retrieval logic.
  - `SubscriptionPushConsumer`, which corresponds to the push consumption model in message queues, where user code is triggered by newly arriving data events.


3. **Consumer Group**: A Consumer Group is a collection of Consumers who share the same Consumer Group ID. The Consumer Group has the following characteristics:
  - Consumer Group and Consumer are in a one to many relationship. That is, there can be any number of consumers in a consumer group, but a consumer is not allowed to join multiple consumer groups simultaneously.
  - A Consumer Group can have different types of Consumers (`SubscriptionPullConsumer` and `SubscriptionPushConsumer`).
  - It is not necessary for all consumers in a Consumer Group to subscribe to the same topic.
  - When different Consumers in the same Consumer Group subscribe to the same Topic, each piece of data under that Topic will only be processed by one Consumer within the group, ensuring that data is not processed repeatedly.

## 3. SQL Statements

### 3.1 Topic Management

IoTDB supports the creation, deletion, and viewing of Topics through SQL statements. The status changes of Topics are illustrated in the diagram below:

<div align="center">
    <img src="https://alioss.timecho.com/docs/img/Data_sub_04.png" alt="" style="width: 60%;"/>
</div>

#### 3.1.1 Create Topic

The SQL statement is as follows:

```SQL
    CREATE TOPIC [IF NOT EXISTS] <topicName> 
    WITH (
    [<parameter> = <value>,],
    );
```

**IF NOT EXISTS semantics**: Used in creation operations to ensure that the create command is executed when the specified topic does not exist, preventing errors caused by attempting to create an existing topic.

Detailed explanation of each parameter is as follows:

| Key	                                          | Required or Optional with Default		                 | Description                                                     |
| :-------------------------------------------- | :--------------------------------- | :----------------------------------------------------------- |
| **path**                                      | optional: `root.**`                | The path of the time series data corresponding to the topic, representing a set of time series to be subscribed. |
| **start-time**                                | optional: `MIN_VALUE`              | The start time (event time) of the time series data corresponding to the topic. Can be in ISO format, such as 2011-12-03T10:15:30 or 2011-12-03T10:15:30+01:00, or a long value representing a raw timestamp consistent with the database's timestamp precision. Supports the special value `now`, which means the creation time of the topic. When start-time is `now` and end-time is MAX_VALUE, it indicates that only real-time data is subscribed. |
| **end-time**                                  | optional: `MAX_VALUE`              | The end time (event time) of the time series data corresponding to the topic. Can be in ISO format, such as 2011-12-03T10:15:30 or 2011-12:03T10:15:30+01:00, or a long value representing a raw timestamp consistent with the database's timestamp precision. Supports the special value `now`, which means the creation time of the topic. When end-time is `now` and start-time is MIN_VALUE, it indicates that only historical data is subscribed. |
| **processor**                                 | optional: `do-nothing-processor`   | The name and parameter configuration of the processor plugin, representing the custom processing logic applied to the original subscribed data, which can be specified in a similar way to pipe processor plugins.
 |
| **format**                                    | optional: `SessionDataSetsHandler` |  Represents the form in which data is subscribed from the topic. Currently supports the following two forms of data: `SessionDataSetsHandler`: Data subscribed from the topic is obtained using `SubscriptionSessionDataSetsHandler`, and consumers can consume each piece of data row by row. `TsFileHandler`: Data subscribed from the topic is obtained using `SubscriptionTsFileHandler`, and consumers can directly subscribe to the TsFile storing the corresponding data. |
| **mode** **(supported in versions 1.3.3.2 and later)**        | option: `live`                     | The subscription mode corresponding to the topic, with two options: `live`: When subscribing to this topic, the subscribed dataset mode is a dynamic dataset, which means that you can continuously consume the latest data. `snapshot`: When the consumer subscribes to this topic, the subscribed dataset mode is a static dataset, which means the snapshot of the data at the moment the consumer group subscribes to the topic (not the moment the topic is created); the formed static dataset after subscription does not support TTL.|
| **loose-range** **(supported in versions 1.3.3.2 and later)** | option: `""`                       |  String: Whether to strictly filter the data corresponding to this topic according to the path and time range, for example: "": Strictly filter the data corresponding to this topic according to the path and time range. `"time"`: Do not strictly filter the data corresponding to this topic according to the time range (rough filter); strictly filter the data corresponding to this topic according to the path. `"path"`: Do not strictly filter the data corresponding to this topic according to the path (rough filter); strictly filter the data corresponding to this topic according to the time range. `"time, path"` / `"path, time"` / `"all"`: Do not strictly filter the data corresponding to this topic according to the path and time range (rough filter).|

Examples are as follows:

```SQL
-- Full subscription
CREATE TOPIC root_all;

-- Custom subscription
CREATE TOPIC IF NOT EXISTS db_timerange
WITH (
  'path' = 'root.db.**',
  'start-time' = '2023-01-01',
  'end-time' = '2023-12-31'
);

#### 3.1.2 Delete Topic

A Topic can only be deleted if it is not subscribed to. When a Topic is deleted, its related consumption progress will be cleared.

```SQL
DROP TOPIC [IF EXISTS] <topicName>;
```
**IF EXISTS semantics**: Used in deletion operations to ensure that the delete command is executed when a specified topic exists, preventing errors caused by attempting to delete non-existent topics.

#### 3.1.3 View Topic

```SQL
SHOW TOPICS;
SHOW TOPIC <topicName>;
```

Result set:

```SQL
[TopicName|TopicConfigs]
```

- TopicName: Topic ID
- TopicConfigs: Topic configurations

### 3.2 Check Subscription Status

View all subscription relationships:

```SQL
-- Query the subscription relationships between all topics and consumer groups
SHOW SUBSCRIPTIONS
-- Query all subscriptions under a specific topic
SHOW SUBSCRIPTIONS ON <topicName>
```

Result set:

```SQL
[TopicName|ConsumerGroupName|SubscribedConsumers]
```

- TopicName: The ID of the topic.
- ConsumerGroupName: The ID of the consumer group specified in the user's code.
- SubscribedConsumers: All client IDs in the consumer group that have subscribed to the topic.

## 4. API interface

In addition to SQL statements, IoTDB also supports using data subscription features through Java native interfaces, more details see（[link](../API/Programming-Java-Native-API.md)）.


## 5. Frequently Asked Questions

### 5.1 What is the difference between IoTDB data subscription and Kafka?

1. Consumption Orderliness

- **Kafka guarantees that messages within a single partition are ordered**，when a topic corresponds to only one partition and only one consumer subscribes to this topic, the order in which the consumer (single-threaded) consumes the topic data is the same as the order in which the data is written.
- The IoTDB subscription client **does not guarantee** that the order in which the consumer consumes the data is the same as the order in which the data is written, but it will try to reflect the order of data writing.

2. Message Delivery Semantics

- Kafka can achieve Exactly once semantics for both Producers and Consumers through configuration.
- The IoTDB subscription client currently cannot provide Exactly once semantics for Consumers.