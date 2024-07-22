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

# Feature Introduction

## Application Scenarios

Although the IoTDB data subscription module (**hereinafter referred to as the IoTDB subscription client**) refers to some functions of message queue products such as Kafka, **the IoTDB subscription client is not intended to replace these message queue products but to provide a new way of data consumption different from data query**. In the following application scenarios, using the IoTDB subscription client to consume data will have significant advantages:

1. **Replace polling queries for a large amount of data**: Avoid the significant impact on the performance of the original system when the query frequency is high and there are many measurement points; avoid the problem of uncertain query scope, and ensure that downstream obtains accurate and complete data.
2. **Facilitate downstream system integration**: Easier to connect with Flink, Spark, Kafka / DataX, Camel / MySQL, PG, and other system components. There is no need to customize the development of IoTDB's change capture logic for each big data component separately, which can simplify the design of integration components and facilitate users.
3. ……

## Key Concepts

**The IoTDB subscription client includes 3 core concepts: Topic, Consumer, and Consumer Group**

1. **Topic**: Topic is a logical concept used by the IoTDB subscription client to classify data and can be regarded as a data publishing channel. Producers publish data to specific topics, and consumers subscribe to these topics to receive relevant data.
2. **Consumer**: Consumer is an application or service in the IoTDB subscription client responsible for receiving and processing data published to a specific **Topic**. **Consumers** fetch data from the queue and process it accordingly. The IoTDB subscription client provides two types of **Consumers**:
   1. `SubscriptionPullConsumer`, corresponding to the pull consumption mode in message queues, where user code needs to actively call data fetching logic.
   2. `SubscriptionPushConsumer`, corresponding to the push consumption mode in message queues, where user code is triggered by new data arrival events.
3. **Consumer Group**: A Consumer Group is a collection of **Consumers**. When different **Consumers** in the same **Consumer Group** subscribe to the same **Topic**, these **Consumers** share the processing load of data under that **Topic**. Each piece of data under that **Topic** can only be processed by one **Consumer** within the group, ensuring that data will not be processed repeatedly (i.e., all consumers in a consumer group share the consumption progress).
   1. There can be any number of consumers in a consumer group, allowing for dynamic addition and removal of consumers.
   2. A topic does not need to be subscribed to by all consumers in a consumer group; all consumers can subscribe to specified topics as needed, meaning they can subscribe to multiple topics and dynamically add or cancel topic subscriptions. A consumer will only receive data from a topic if it has explicitly subscribed to that topic.
   3. Both `SubscriptionPullConsumer` and `SubscriptionPushConsumer` are allowed to join the same consumer group.
   4. A consumer is not allowed to join multiple different consumer groups simultaneously.

TODO: PIC

# Syntax Description

## Topic Management

### Concept

- **Basic Concept**: Topic is a logical concept used by the IoTDB subscription client to classify data and can be regarded as a data publishing channel. Producers publish data to specific topics, and consumers subscribe to these topics to receive relevant data. Unlike Kafka, in the IoTDB subscription client, a topic describes the **sequence characteristics, time characteristics, presentation form, and optional custom processing logic** of the subscribed data.
- **Representation Method**: A topic is defined by the following parts:
  - **Path**: Indicates a set of time series collections to be subscribed to.
  - **Time**: Indicates the time range of the time series to be subscribed to (event time).
  - **Processor**: Indicates the custom processing logic applied to the original subscription data, which can be specified through a plugin similar to a pipe processor.
  - **Format**: Indicates the presentation form of the data subscribed from this topic. Currently, two data forms are supported:
    - `SessionDataSetsHandler`: Use `SubscriptionSessionDataSetsHandler` to get data subscribed from this topic, allowing consumers to consume each piece of data row by row.
    - `TsFileHandler`: Use `SubscriptionTsFileHandler` to get data subscribed from this topic, allowing consumers to directly subscribe to TsFiles storing the corresponding data.
- **Lifecycle Management**
  - A topic can only be subscribed to after it has been created.
  - A topic can only be deleted when it is not being subscribed to, and its related consumption progress will be cleared upon deletion.

### Management Method 1: SQL

1. Create Topic

```SQL
CREATE TOPIC <topicName> 
WITH (
  [<parameter> = <value>,],
);
```

For the parameter and value, the definitions are as follows:

| **parameter**     | **required or optional with default value** | **description**                                              |
| :---------------- | :------------------------------------------ | :----------------------------------------------------------- |
| **path**          | optional: `root.**`                         | The path of the time series corresponding to the topic.        |
| **start-time**    | optional: `MIN_VALUE`                       | The start time of the subscribed data time series of the topic (event time), which can be in ISO format, such as 2011-12-03T10:15:30 or 2011-12-03T10:15:30+01:00; or a long value, meaning a raw timestamp, with units consistent with the database timestamp precision. Supports the special value **`now`**, meaning the creation time of the topic. When `start-time` is `now` and `end-time` is `MAX_VALUE`, it indicates subscribing only to real-time data. |
| **end-time**      | optional: `MAX_VALUE`                       | The end time of the subscribed data time series of the topic (event time), which can be in ISO format, such as 2011-12-03T10:15:30 or 2011-12-03T10:15:30+01:00; or a long value, meaning a raw timestamp, with units consistent with the database timestamp precision. Supports the special value **`now`**, meaning the creation time of the topic. When `end-time` is `now` and `start-time` is `MIN_VALUE`, it indicates subscribing only to historical data. |
| **processor**     | optional: `do-nothing-processor`            | The processor plugin name and its plugin configuration.         |
| **format**        | optional: `SessionDataSetsHandler`          | The data presentation format corresponding to the topic, with two options:<br>1. `SessionDataSetsHandler`<br>2. `TsFileHandler` |
| **mode (new in v1.3.3.2)**           | option: `live`                              | The subscription mode corresponding to the topic:<br>1. `live`: When subscribing to this topic, the data set mode is a dynamic data set, meaning it can continuously consume the latest data.<br>2. `snapshot`: When the consumer subscribes to this topic, the data set mode is a static data set, meaning the snapshot of the data at the time the consumer group subscribes to this topic (not the creation time of the topic). The static data set formed after subscription does not support TTL. |
| **loose-range (new in v1.3.3.2)**    | option: `""`                                | String: Whether to strictly filter the data corresponding to the topic according to the path and time range, for example:<br>1. `""`: Strictly filter the data corresponding to the topic according to the path and time range.<br>2. `"time"`: Do not strictly filter the data corresponding to the topic according to the time range (coarse filter); strictly filter the data corresponding to the topic according to the path.<br>3. `"path"`: Do not strictly filter the data corresponding to the topic according to the path (coarse filter); strictly filter the data corresponding to the topic according to the time range.<br>4. `"time, path"` / `"path, time"` / `"all"`: Do not strictly filter the data corresponding to the topic according to the path and time range (coarse filter). |

Example:

```SQL
-- Full subscription
CREATE TOPIC root_all;

-- Custom subscription
CREATE TOPIC sg_timerange
WITH (
  'path' = 'root.sg.**',
  'start-time' = '2023-01-01',
  'end-time' = '2023-12-31',
);
```

2. Delete Topic

```SQL
DROP TOPIC <topicName>;
```

3. Get Topic

```SQL
SHOW TOPICS;
SHOW TOPIC <topicName>;
```

### Management Method 2: JAVA SDK

The SubscriptionSession class in the IoTDB subscription client provides related interfaces for Topic management:

1. Create Topic

```Java
Topic createTopic(String topicName, Properties properties) throws Exception;
```

Example:


```Java
try (final SubscriptionSession session = new SubscriptionSession(host, port)) {
  session.open();
  final Properties config = new Properties();
  config.put(TopicConstant.PATH_KEY, "root.sg.**");
  session.createTopic(topicName, config);
}
```

2. Delete Topic

```Java
Topic dropTopic(String topicName) throws Exception;
```

3. Get Topic

```Java
// Get all topics
Set<Topic> getTopics() throws Exception;

// Get a single topic
Optional<Topic> getTopic(String topicName) throws Exception;
```

## Consumer Operations

**In the IoTDB subscription client, consumer-related operations can only be performed using the JAVA SDK.**

**This section introduces four operations: creating a consumer, subscribing to a topic, consuming data, and unsubscribing.**

### Creating a Consumer

When using the JAVA SDK to create a consumer, you need to specify the parameters applied to the consumer.

For `SubscriptionPullConsumer` and `SubscriptionPushConsumer`, the following common configurations are available:

| key                     | **required or optional with default**                        | description                                                  |
| :---------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| host                    | optional: 127.0.0.1                                          | String: RPC host of a DataNode in IoTDB                      |
| port                    | optional: 6667                                               | Integer: RPC port of a DataNode in IoTDB                     |
| node-urls               | optional: 127.0.0.1:6667                                     | List\<String\>: RPC addresses of all DataNodes in IoTDB; can be multiple; either host:port or node-urls can be specified. If both are specified, the union of host:port and node-urls will be used as the new node-urls |
| username                | optional: root                                               | String: Username of the DataNode in IoTDB                    |
| password                | optional: root                                               | String: Password of the DataNode in IoTDB                    |
| groupId                 | optional                                                     | String: Consumer group ID. If not specified, a new consumer group will be randomly assigned, ensuring different consumer groups have unique IDs |
| consumerId              | optional                                                     | String: Consumer client ID. If not specified, a unique ID will be randomly assigned within the same consumer group |
| heartbeatIntervalMs     | optional: 30000 (min: 1000)                                  | Long: Interval for the consumer to send heartbeat requests to the IoTDB DataNode |
| endpointsSyncIntervalMs | optional: 120000 (min: 5000)                                 | Long: Interval for the consumer to detect cluster node expansion or reduction and adjust subscription connections |
| fileSaveDir             | optional: Paths.get(System.getProperty("user.dir"), "iotdb-subscription").toString() | String: Directory path where the consumer temporarily stores the subscribed TsFile files |
| fileSaveFsync           | optional: false                                              | Boolean: Whether the consumer actively calls fsync during the TsFile subscription process |

#### SubscriptionPushConsumer

The following are special configurations for `SubscriptionPushConsumer`:

| key                | **required or optional with default** | description                                                  |
| :----------------- | :------------------------------------ | :----------------------------------------------------------- |
| ackStrategy        | optional: `ACKStrategy.AFTER_CONSUME` | Acknowledgment strategy for consumption progress includes the following options:<br>1. `ACKStrategy.BEFORE_CONSUME` (Submit consumption progress immediately when the consumer receives data, before `onReceive`)<br>2. `ACKStrategy.AFTER_CONSUME` (Submit consumption progress after the consumer finishes consuming data, after `onReceive`) |
| consumeListener    | optional                              | Callback function for consuming data, must implement the `ConsumeListener` interface, defining the logic for handling data in `SessionDataSetsHandler` and `TsFileHandler` formats |
| autoPollIntervalMs | optional: 5000 (min: 500)             | Long: Time interval for the consumer to automatically pull data, in milliseconds |
| autoPollTimeoutMs  | optional: 10000 (min: 1000)           | Long: Timeout for the consumer to pull data each time, in milliseconds |

The `ConsumerListener` interface is defined as follows:

```Java
@FunctionInterface
interface ConsumeListener {
  default ConsumeResult onReceive(Message message) {
    return ConsumeResult.SUCCESS;
  }
}

enum ConsumeResult {
  SUCCESS,
  FAILURE,
}
```

#### SubscriptionPullConsumer

The following are the special configurations for `SubscriptionPullConsumer`:

| key                | **required or optional with default** | description                                                  |
| :----------------- | :------------------------------------ | :----------------------------------------------------------- |
| autoCommit         | optional: true                        | Boolean: Whether to automatically commit consumption progress<br>If this parameter is set to false, the `commit` method needs to be called to manually commit the consumption progress |
| autoCommitInterval | optional: 5000 (min: 500)             | Long: The interval for automatically committing consumption progress, in **milliseconds**<br>This is only effective when the autoCommit parameter is set to true |

After creating the consumer, you need to manually call the open method of the consumer:

```Java
void open() throws Exception;
```

At this point, the IoTDB subscription client will verify the correctness of the consumer's configuration. Once verified successfully, the consumer will join the corresponding consumer group. This means that after opening the consumer, you can use the returned consumer object to subscribe to Topics, consume data, and perform other operations.

### Subscribing to Topics

`SubscriptionPushConsumer` and `SubscriptionPullConsumer` provide the following JAVA SDK for subscribing to Topics:

```Java
// Subscribe to topics
void subscribe(String topic) throws Exception;
void subscribe(List<\String\> topics) throws Exception;
```

- Before a consumer subscribes to a topic, the topic must have been created; otherwise, the subscription will fail.
- If a consumer subscribes to a topic that it has already subscribed to, no error will be thrown.
- If other consumers in the same consumer group have already subscribed to the same topics, the consumer will reuse the corresponding consumption progress.

### Consuming Data

**For both push mode and pull mode consumers:**

- A consumer will only receive data for a topic if it has explicitly subscribed to that topic.
- If a consumer has not subscribed to any topics after being created, it will not be able to consume any data, even if other consumers in the same consumer group have subscribed to some topics.

#### SubscriptionPushConsumer

After subscribing to topics, a `SubscriptionPushConsumer` does not need to manually pull data; the logic for consuming data is specified in the consumeListener configuration when creating the `SubscriptionPushConsumer`.

#### SubscriptionPullConsumer

After subscribing to topics, a `SubscriptionPullConsumer` needs to actively call the `poll` method to pull data:

```Java
List<SubscriptionMessage> poll(final Duration timeout) throws Exception;
List<SubscriptionMessage> poll(final long timeoutMs) throws Exception;
List<SubscriptionMessage> poll(final Set<String> topicNames, final Duration timeout) throws Exception;
List<SubscriptionMessage> poll(final Set<String> topicNames, final long timeoutMs) throws Exception;
```

In the `poll` method, you can specify the topic names to pull (if not specified, it will default to pulling all the topics that the consumer has subscribed to) and the timeout duration.

When the SubscriptionPullConsumer is configured with the autoCommit parameter set to false, the `commitSync` and `commitAsync` methods need to be called manually to synchronously or asynchronously commit the consumption progress of a batch of data:

```Java
void commitSync(final SubscriptionMessage message) throws Exception;
void commitSync(final Iterable<SubscriptionMessage> messages) throws Exception;

CompletableFuture<Void> commitAsync(final SubscriptionMessage message);
CompletableFuture<Void> commitAsync(final Iterable<SubscriptionMessage> messages);
void commitAsync(final SubscriptionMessage message, final AsyncCommitCallback callback);
void commitAsync(final Iterable<SubscriptionMessage> messages, final AsyncCommitCallback callback);
```

The `AsyncCommitCallback` class is defined as follows:

```Java
public interface AsyncCommitCallback {
  default void onComplete() {
    // Do nothing
  }

  default void onFailure(final Throwable e) {
    // Do nothing
  }
}
```

### Unsubscribing

`SubscriptionPushConsumer` and `SubscriptionPullConsumer` provide the following JAVA SDK for unsubscribing and closing consumers:

```Java
// Unsubscribe from topics
void unsubscribe(String topic) throws Exception;
void unsubscribe(List\<String\> topics) throws Exception;

// Close the consumer
void close();
```

- If a consumer unsubscribes from a topic that it has not subscribed to, no error will be thrown.
- When a consumer closes, it will exit the corresponding consumer group and automatically unsubscribe from all the topics it has subscribed to.
- After the consumer is closed, its lifecycle ends, and it cannot be reopened to subscribe and consume data again.

## Subscription Status Retrieval

### Method 1: SQL

Users can use SQL to query the existing subscription relationships in the IoTDB subscription client:

```SQL
-- Query all topics and the subscription relationships of consumer groups
SHOW SUBSCRIPTIONS
-- Query all subscriptions under a specific topic
SHOW SUBSCRIPTIONS ON <topicName>
```

Result set:

```SQL
[TopicName|ConsumerGroupName|SubscribedConsumers]
```

- TopicName: Topic ID
- ConsumerGroupName: Consumer group ID specified in user code
- SubscribedConsumers: All client IDs in the consumer group that have subscribed to the topic

### Method 2: JAVA SDK

The `SubscriptionSession` class in the IoTDB subscription client provides related interfaces for retrieving subscription status:

```Java
Set<Subscription> getSubscriptions() throws Exception;
Set<Subscription> getSubscriptions(final String topicName) throws Exception;
```

# Code Examples (JAVA SDK)

## Single Pull Consumer Consuming Data in SessionDataSetsHandler Format

```Java
// Create topics
try (final SubscriptionSession session = new SubscriptionSession(HOST, PORT)) {
  session.open();
  final Properties config = new Properties();
  config.put(TopicConstant.PATH_KEY, "root.sg.**");
  session.createTopic(TOPIC_1, config);
}

// Subscription: property-style ctor
final Properties config = new Properties();
config.put(ConsumerConstant.CONSUMER_ID_KEY, "c1");
config.put(ConsumerConstant.CONSUMER_GROUP_ID_KEY, "cg1");

final SubscriptionPullConsumer consumer1 = new SubscriptionPullConsumer(config);
consumer1.open();
consumer1.subscribe(TOPIC_1);
while (true) {
  LockSupport.parkNanos(SLEEP_NS); // wait some time
  final List<SubscriptionMessage> messages = consumer1.poll(POLL_TIMEOUT_MS);
  for (final SubscriptionMessage message : messages) {
    for (final SubscriptionSessionDataSet dataSet : message.getSessionDataSetsHandler()) {
      System.out.println(dataSet.getColumnNames());
      System.out.println(dataSet.getColumnTypes());
      while (dataSet.hasNext()) {
        System.out.println(dataSet.next());
      }
    }
  }
  // Auto commit
}

// Show topics and subscriptions
try (final SubscriptionSession session = new SubscriptionSession(HOST, PORT)) {
  session.open();
  session.getTopics().forEach((System.out::println));
  session.getSubscriptions().forEach((System.out::println));
}

consumer1.unsubscribe(TOPIC_1);
consumer1.close();
```

## Multiple Push Consumers Consuming Data in TsFileHandler Format

```Java
// Create topics
try (final SubscriptionSession subscriptionSession = new SubscriptionSession(HOST, PORT)) {
  subscriptionSession.open();
  final Properties config = new Properties();
  config.put(TopicConstant.FORMAT_KEY, TopicConstant.FORMAT_TS_FILE_HANDLER_VALUE);
  subscriptionSession.createTopic(TOPIC_2, config);
}

final List<Thread> threads = new ArrayList<>();
for (int i = 0; i < 8; ++i) {
  final int idx = i;
  final Thread thread =
      new Thread(
          () -> {
            // Subscription: builder-style ctor
            try (final SubscriptionPushConsumer consumer2 =
                new SubscriptionPushConsumer.Builder()
                    .consumerId("c" + idx)
                    .consumerGroupId("cg2")
                    .fileSaveDir(System.getProperty("java.io.tmpdir"))
                    .ackStrategy(AckStrategy.AFTER_CONSUME)
                    .consumeListener(
                        message -> {
                          doSomething(message.getTsFileHandler());
                          return ConsumeResult.SUCCESS;
                        })
                    .buildPushConsumer()) {
              consumer2.open();
              consumer2.subscribe(TOPIC_2);
            } catch (final IOException e) {
              throw new RuntimeException(e);
            }
          });
  thread.start();
  threads.add(thread);
}

for (final Thread thread : threads) {
  thread.join();
}
```

# FAQ

## What is the difference between IoTDB data subscription and Kafka?

### Consumption Orderliness

- **Kafka guarantees message order within a single partition**. When a topic corresponds to only one partition and only one consumer subscribes to this topic, the consumer (single-threaded) can ensure that the order of consuming the topic's data is the same as the order in which the data was written.
- The IoTDB subscription client **does not guarantee** that the order in which the consumer consumes data is the same as the order in which the data was written, but it will try to reflect the order of data writing.

### Message Delivery Semantics

- Kafka can achieve Exactly once semantics for Producer and Consumer through configuration.
- The IoTDB subscription client currently cannot provide Exactly once semantics for Consumer.
