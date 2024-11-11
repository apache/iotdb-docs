# Data Subscription

## 1.  Feature Introduction

The IoTDB data subscription module (also known as the IoTDB subscription client) is a feature supported after IoTDB V1.3.3, which provides users with a streaming data consumption method that is different from data queries. It refers to the basic concepts and logic of message queue products such as Kafka, **providing data subscription and consumption interfaces**, but it is not intended to completely replace these consumer queue products. Instead, it offers more convenient data subscription services for scenarios where simple streaming data acquisition is needed.

Using the IoTDB Subscription Client to consume data has significant advantages in the following application scenarios:

1. **Continuously obtaining the latest data**: By using a subscription method, it is more real-time than scheduled queries, simpler to program applications, and has a lower system burden;

2. **Simplify data push to third-party systems**: No need to develop data push components for different systems within IoTDB, data can be streamed within third-party systems, making it easier to send data to systems such as Flink, Kafka, DataX, Camel, MySQL, PG, etc.

## 2. Key Concepts

The IoTDB Subscription Client encompasses three core concepts: Topic, Consumer, and Consumer Group. The specific relationships are illustrated in the diagram below:

<div align="center">
    <img src="https://alioss.timecho.com/docs/img/Data_sub_01.png" alt="" style="width: 60%;"/>
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
    CREATE TOPIC <topicName> 
    WITH (
    [<parameter> = <value>,],
    );
```

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
CREATE TOPIC db_timerange
WITH (
  'path' = 'root.db.**',
  'start-time' = '2023-01-01',
  'end-time' = '2023-12-31',
);
```

#### 3.1.2 Delete Topic

A Topic can only be deleted if it is not subscribed to. When a Topic is deleted, its related consumption progress will be cleared.

```SQL
DROP TOPIC <topicName>;
```

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

In addition to SQL statements, IoTDB also supports using data subscription features through Java native interfaces（[link](../API/Programming-Java-Native-API.md)）.

### 4.1 Topic Management

The `SubscriptionSession` class in the IoTDB subscription client provides interfaces for topic management. The status changes of topics are illustrated in the diagram below:

<div align="center">
    <img src="https://alioss.timecho.com/docs/img/Data_sub_04.png" alt="" style="width: 60%;"/>
</div>

#### 4.1.1 Create Topic

```Java
Topic createTopic(String topicName, Properties properties) throws Exception;
```

Example:

```Java
try (final SubscriptionSession session = new SubscriptionSession(host, port)) {
  session.open();
  final Properties config = new Properties();
  config.put(TopicConstant.PATH_KEY, "root.db.**");
  session.createTopic(topicName, config);
}
```

#### 4.1.2 Delete Topic

```Java
void dropTopic(String topicName) throws Exception;
```

#### 4.1.3 View Topic

```Java
// Get all topics
Set<Topic> getTopics() throws Exception;

// Get a specific topic
Optional<Topic> getTopic(String topicName) throws Exception;
```

### 4.2 Check Subscription Status
The `SubscriptionSession` class in the IoTDB subscription client provides interfaces to check the subscription status:

```Java
Set<Subscription> getSubscriptions() throws Exception;
Set<Subscription> getSubscriptions(final String topicName) throws Exception;
```

### 4.3 Create Consumer

When creating a consumer using the JAVA native interface, you need to specify the parameters applied to the consumer.

For both `SubscriptionPullConsumer` and `SubscriptionPushConsumer`, the following common configurations are available:


| key                     | **required or optional with default**                        | description                                                  |
| :---------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| host                    | optional: 127.0.0.1                                          | String: The RPC host of a certain DataNode in IoTDB                     |
| port                    | optional: 6667                                               | Integer: The RPC port of a certain DataNode in IoTDB                     |
| node-urls               | optional: 127.0.0.1:6667                                     | List<String>: The RPC addresses of all DataNodes in IoTDB, can be multiple; either host:port or node-urls can be filled in. If both host:port and node-urls are filled in, the union of host:port and node-urls will be used to form a new node-urls application |
| username                | optional: root                                               | String: The username of a DataNode in IoTDB                          |
| password                | optional: root                                               | String: The password of a DataNode in IoTDB                             |
| groupId                 | optional                                                     | String: consumer group id, if not specified, a new consumer group will be randomly assigned, ensuring that different consumer groups have different consumer group ids |
| consumerId              | optional                                                     | String: consumer client id, if not specified, it will be randomly assigned, ensuring that each consumer client id in the same consumer group is unique |
| heartbeatIntervalMs     | optional: 30000 (min: 1000)                                  | Long: The interval at which the consumer sends heartbeat requests to the IoTDB DataNode      |
| endpointsSyncIntervalMs | optional: 120000 (min: 5000)                                 | Long: The interval at which the consumer detects the expansion and contraction of IoTDB cluster nodes and adjusts the subscription connection |
| fileSaveDir             | optional: Paths.get(System.getProperty("user.dir"), "iotdb-subscription").toString() | String: The temporary directory path where the TsFile files subscribed by the consumer are stored      |
| fileSaveFsync           | optional: false                                              | Boolean: Whether the consumer actively calls fsync during the subscription of TsFile    |


#### 4.3.1 SubscriptionPushConsumer

The following are special configurations for `SubscriptionPushConsumer`:


| key                | **required or optional with default** | description                                                  |
| :----------------- | :------------------------------------ | :----------------------------------------------------------- |
| ackStrategy        | optional: `ACKStrategy.AFTER_CONSUME` | Consumption progress confirmation mechanism includes the following options: `ACKStrategy.BEFORE_CONSUME` (submit consumption progress immediately when the consumer receives data, before `onReceive`) `ACKStrategy.AFTER_CONSUME` (submit consumption progress after the consumer has consumed the data, after `onReceive`) |
| consumeListener    | optional                              | Consumption data callback function, need to implement the `ConsumeListener` interface, define the consumption logic of `SessionDataSetsHandler` and `TsFileHandler` form data|
| autoPollIntervalMs | optional: 5000 (min: 500)             | Long: The interval at which the consumer automatically pulls data, in ms       |
| autoPollTimeoutMs  | optional: 10000 (min: 1000)           | Long: The timeout time for the consumer to pull data each time, in ms |

Among them, the ConsumerListener interface is defined as follows:


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

#### 4.3.2 SubscriptionPullConsumer

The following are special configurations for `SubscriptionPullConsumer` :

| key                | **required or optional with default** | description                                                  |
| :----------------- | :------------------------------------ | :----------------------------------------------------------- |
| autoCommit         | optional: true                        | Boolean: Whether to automatically commit consumption progress. If this parameter is set to false, the commit method must be called to manually `commit` consumption progress. |
| autoCommitInterval | optional: 5000 (min: 500)             | Long: The interval at which consumption progress is automatically committed, in milliseconds. This only takes effect when the autoCommit parameter is true.
 |

After creating a consumer, you need to manually call the consumer's open method:


```Java
void open() throws Exception;
```

At this point, the IoTDB subscription client will verify the correctness of the consumer's configuration. After a successful verification, the consumer will join the corresponding consumer group. That is, only after opening the consumer can you use the returned consumer object to subscribe to topics, consume data, and perform other operations.

### 4.4 Subscribe to Topics

Both `SubscriptionPushConsumer` and `SubscriptionPullConsumer` provide the following JAVA native interfaces for subscribing to topics: 

```Java
// Subscribe to topics
void subscribe(String topic) throws Exception;
void subscribe(List<String> topics) throws Exception;
```

- Before a consumer subscribes to a topic, the topic must have been created, otherwise, the subscription will fail.

- If a consumer subscribes to a topic that it has already subscribed to, no error will occur.

- If there are other consumers in the same consumer group that have subscribed to the same topics, the consumer will reuse the corresponding consumption progress.


### 4.5 Consume Data

For both push and pull mode consumers:


- Only after explicitly subscribing to a topic will the consumer receive data for that topic.

- If no topics are subscribed to after creation, the consumer will not be able to consume any data, even if other consumers in the same consumer group have subscribed to some topics.

#### 4.5.1 SubscriptionPushConsumer

After `SubscriptionPushConsumer` subscribes to topics, there is no need to manually pull data. 

The data consumption logic is within the `consumeListener` configuration specified when creating `SubscriptionPushConsumer`.

#### 4.5.2 SubscriptionPullConsumer

After SubscriptionPullConsumer subscribes to topics, it needs to actively call the poll method to pull data:

```Java
List<SubscriptionMessage> poll(final Duration timeout) throws Exception;
List<SubscriptionMessage> poll(final long timeoutMs) throws Exception;
List<SubscriptionMessage> poll(final Set<String> topicNames, final Duration timeout) throws Exception;
List<SubscriptionMessage> poll(final Set<String> topicNames, final long timeoutMs) throws Exception;
```

In the poll method, you can specify the topic names to be pulled (if not specified, it defaults to pulling all topics that the consumer has subscribed to) and the timeout period.


When the SubscriptionPullConsumer is configured with the autoCommit parameter set to false, it is necessary to manually call the commitSync and commitAsync methods to synchronously or asynchronously commit the consumption progress of a batch of data:


```Java
void commitSync(final SubscriptionMessage message) throws Exception;
void commitSync(final Iterable<SubscriptionMessage> messages) throws Exception;

CompletableFuture<Void> commitAsync(final SubscriptionMessage message);
CompletableFuture<Void> commitAsync(final Iterable<SubscriptionMessage> messages);
void commitAsync(final SubscriptionMessage message, final AsyncCommitCallback callback);
void commitAsync(final Iterable<SubscriptionMessage> messages, final AsyncCommitCallback callback);
```

The AsyncCommitCallback class is defined as follows:

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

### 4.6 Unsubscribe

The `SubscriptionPushConsumer` and `SubscriptionPullConsumer` provide the following JAVA native interfaces for unsubscribing and closing the consumer:

```Java
// Unsubscribe from topics
void unsubscribe(String topic) throws Exception;
void unsubscribe(List<String> topics) throws Exception;

// Close consumer
void close();
```

- If a consumer unsubscribes from a topic that it has not subscribed to, no error will occur.
- When a consumer is closed, it will exit the corresponding consumer group and automatically unsubscribe from all topics it is currently subscribed to.
- Once a consumer is closed, its lifecycle ends, and it cannot be reopened to subscribe to and consume data again.


### 4.7 Code Examples

#### 4.7.1 Single Pull Consumer Consuming SessionDataSetsHandler Format Data

```Java
// Create topics
try (final SubscriptionSession session = new SubscriptionSession(HOST, PORT)) {
  session.open();
  final Properties config = new Properties();
  config.put(TopicConstant.PATH_KEY, "root.db.**");
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

#### 4.7.2 Multiple Push Consumers Consuming TsFileHandler Format Data

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

## 5. Frequently Asked Questions

### 5.1 What is the difference between IoTDB data subscription and Kafka?

1. Consumption Orderliness

- **Kafka guarantees that messages within a single partition are ordered**，when a topic corresponds to only one partition and only one consumer subscribes to this topic, the order in which the consumer (single-threaded) consumes the topic data is the same as the order in which the data is written.
- The IoTDB subscription client **does not guarantee** that the order in which the consumer consumes the data is the same as the order in which the data is written, but it will try to reflect the order of data writing.

2. Message Delivery Semantics

- Kafka can achieve Exactly once semantics for both Producers and Consumers through configuration.
- The IoTDB subscription client currently cannot provide Exactly once semantics for Consumers.
