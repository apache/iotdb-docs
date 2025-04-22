

<!--

* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
  *
* http://www.apache.org/licenses/LICENSE-2.0
  *
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
  -->

# Data Subscription API

IoTDB provides powerful data subscription functionality, allowing users to access newly added data from IoTDB in real-time through subscription APIs. For detailed functional definitions and introductions：[Data subscription](../User-Manual/Data-subscription.md)

## 1. Core Steps

1. Create Topic: Create a Topic that includes the measurement points you wish to subscribe to.
2. Subscribe to Topic: Before a consumer subscribes to a topic, the topic must have been created, otherwise the subscription will fail. Consumers under the same consumer group will evenly distribute the data.
3. Consume Data: Only by explicitly subscribing to a specific topic will you receive data from that topic.
4. Unsubscribe: When a consumer is closed, it will exit the corresponding consumer group and cancel all existing subscriptions. 


## 2. Detailed Steps

This section is used to illustrate the core development process and does not demonstrate all parameters and interfaces. For a comprehensive understanding of all features and parameters, please refer to: [Java Native API](../API/Programming-Java-Native-API.md#_3-native-interface-description)


### 2.1  Create a Maven project

Create a Maven project and import the following dependencies（JDK >= 1.8, Maven >= 3.6）

```xml
<dependencies>
    <dependency>
      <groupId>org.apache.iotdb</groupId>
      <artifactId>iotdb-session</artifactId>
      <!-- The version number is the same as the database version number -->
      <version>${project.version}</version>
    </dependency>
</dependencies>
```

### 2.2 Code Example

#### 2.2.1 Topic operations

```java
import java.util.Optional;
import java.util.Properties;
import java.util.Set;
import org.apache.iotdb.rpc.IoTDBConnectionException;
import org.apache.iotdb.rpc.StatementExecutionException;
import org.apache.iotdb.rpc.subscription.config.TopicConstant;
import org.apache.iotdb.session.subscription.SubscriptionSession;
import org.apache.iotdb.session.subscription.model.Topic;

public class DataConsumerExample {

    public static void main(String[] args) throws IoTDBConnectionException, StatementExecutionException {
        try (SubscriptionSession session = new SubscriptionSession("127.0.0.1", 6667, "root", "root", 67108864)) {
            // 1. open session
            session.open();

            // 2. create a topic of all data
            Properties sessionConfig = new Properties();
            sessionConfig.put(TopicConstant.PATH_KEY, "root.**");

            session.createTopic("allData", sessionConfig);

            // 3. show all topics
            Set<Topic> topics = session.getTopics();
            System.out.println(topics);

            // 4. show a specific topic
            Optional<Topic> allData = session.getTopic("allData");
            System.out.println(allData.get());
        }
    }
}
```

#### 2.2.2 Data Consume

##### Scenario-1: Subscribing to newly added real-time data in IoTDB (for scenarios such as dashboard or configuration display)

```java
import java.io.IOException;
import java.util.List;
import java.util.Properties;
import org.apache.iotdb.rpc.subscription.config.ConsumerConstant;
import org.apache.iotdb.rpc.subscription.config.TopicConstant;
import org.apache.iotdb.session.subscription.consumer.SubscriptionPullConsumer;
import org.apache.iotdb.session.subscription.payload.SubscriptionMessage;
import org.apache.iotdb.session.subscription.payload.SubscriptionMessageType;
import org.apache.iotdb.session.subscription.payload.SubscriptionSessionDataSet;
import org.apache.tsfile.read.common.RowRecord;

public class DataConsumerExample {

    public static void main(String[] args) throws IOException {

        // 5. create a pull consumer, the subscription is automatically cancelled when the logic in the try resources is completed
        Properties consumerConfig = new Properties();
        consumerConfig.put(ConsumerConstant.CONSUMER_ID_KEY, "c1");
        consumerConfig.put(ConsumerConstant.CONSUMER_GROUP_ID_KEY, "cg1");
        consumerConfig.put(ConsumerConstant.USERNAME_KEY, "root");
        consumerConfig.put(ConsumerConstant.PASSWORD_KEY, "root");
        try (SubscriptionPullConsumer pullConsumer = new SubscriptionPullConsumer(consumerConfig)) {
            pullConsumer.open();
            pullConsumer.subscribe("topic_all");
            while (true) {
                List<SubscriptionMessage> messages = pullConsumer.poll(10000);
                for (final SubscriptionMessage message : messages) {
                    final short messageType = message.getMessageType();
                    if (SubscriptionMessageType.isValidatedMessageType(messageType)) {
                        for (final SubscriptionSessionDataSet dataSet : message.getSessionDataSetsHandler()) {
                            while (dataSet.hasNext()) {
                                final RowRecord record = dataSet.next();
                                System.out.println(record);
                            }
                        }
                    }
                }
            }
        }
    }
}


```

##### Scenario-2: Subscribing to newly added TsFiles (for scenarios such as regular data backup)

Prerequisite: The format of the topic to be consumed must be of the TsfileHandler type. For example：`create topic topic_all_tsfile with ('path'='root.**','format'='TsFileHandler')`

```java
import java.io.IOException;
import java.util.List;
import java.util.Properties;
import org.apache.iotdb.rpc.subscription.config.ConsumerConstant;
import org.apache.iotdb.rpc.subscription.config.TopicConstant;
import org.apache.iotdb.session.subscription.consumer.SubscriptionPullConsumer;
import org.apache.iotdb.session.subscription.payload.SubscriptionMessage;


public class DataConsumerExample {

    public static void main(String[] args) throws IOException {
        // 1. create a pull consumer, the subscription is automatically cancelled when the logic in the try resources is completed
        Properties consumerConfig = new Properties();
        consumerConfig.put(ConsumerConstant.CONSUMER_ID_KEY, "c1");
        consumerConfig.put(ConsumerConstant.CONSUMER_GROUP_ID_KEY, "cg1");
        // 2. Specify the consumption type as the tsfile type
        consumerConfig.put(ConsumerConstant.USERNAME_KEY, "root");
        consumerConfig.put(ConsumerConstant.PASSWORD_KEY, "root");
        consumerConfig.put(ConsumerConstant.FILE_SAVE_DIR_KEY, "/Users/iotdb/Downloads");
        try (SubscriptionPullConsumer pullConsumer = new SubscriptionPullConsumer(consumerConfig)) {
            pullConsumer.open();
            pullConsumer.subscribe("topic_all_tsfile");
            while (true) {
                List<SubscriptionMessage> messages = pullConsumer.poll(10000);
                for (final SubscriptionMessage message : messages) {
                    message.getTsFileHandler().copyFile("/Users/iotdb/Downloads/1.tsfile");
                }
            }
        }
    }
}
```




## 3. Java Native API Description

### 3.1 Parameter List

The consumer-related parameters can be set through the Properties parameter object. The specific parameters are as follows:

#### SubscriptionConsumer


| **Parameter**           | **required or optional with default**                        | **Parameter Meaning**                                        |
| :---------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| host                    | optional: 127.0.0.1                                          | `String`: The RPC host of a DataNode in IoTDB                |
| port                    | optional: 6667                                               | `Integer`: The RPC port of a DataNode in IoTDB               |
| node-urls               | optional: 127.0.0.1:6667                                     | `List<String>`: The RPC addresses of all DataNodes in IoTDB, which can be multiple; either host:port or node-urls can be filled. If both host:port and node-urls are filled, the **union** of host:port and node-urls will be taken to form a new node-urls for application |
| username                | optional: root                                               | `String`: The username of the DataNode in IoTDB              |
| password                | optional: root                                               | `String`: The password of the DataNode in IoTDB              |
| groupId                 | optional                                                     | `String`: consumer group id，if not specified, it will be randomly assigned （a new consumer group），ensuring that the consumer group id of different consumer groups are all different |
| consumerId              | optional                                                     | `String`: consumer client id，if not specified, it will be randomly assigned，ensuring that each consumer client id in the same consumer group is different |
| heartbeatIntervalMs     | optional: 30000 (min: 1000)                                  | `Long`: The interval at which the consumer sends periodic heartbeat requests to the IoTDB DataNode |
| endpointsSyncIntervalMs | optional: 120000 (min: 5000)                                 | `Long`: The interval at which the consumer detects the expansion or contraction of IoTDB cluster nodes and adjusts the subscription connection |
| fileSaveDir             | optional: Paths.get(System.getProperty("user.dir"), "iotdb-subscription").toString() | `String`:  The temporary directory path where the consumer stores the subscribed TsFile files |
| fileSaveFsync           | optional: false                                              | `Boolean`: Whether the consumer actively calls fsync during the subscription of TsFiles |

Special configurations in `SubscriptionPushConsumer` ：

| **Parameter**      | **required or optional with default** | **Parameter Meaning**                                        |
| :----------------- | :------------------------------------ | :----------------------------------------------------------- |
| ackStrategy        | optional: `ACKStrategy.AFTER_CONSUME` | The acknowledgment mechanism for consumption progress includes the following options: `ACKStrategy.BEFORE_CONSUME`（the consumer submits the consumption progress immediately upon receiving the data, before `onReceive` ）`ACKStrategy.AFTER_CONSUME`（the consumer submits the consumption progress after consuming the data, after `onReceive` ） |
| consumeListener    | optional                              | The callback function for consuming data, which needs to implement the `ConsumeListener` interface, defining the processing logic for consuming `SessionDataSetsHandler` and `TsFileHandler` formatted data |
| autoPollIntervalMs | optional: 5000 (min: 500)             | Long: The time interval at which the consumer automatically pulls data, in **ms** |
| autoPollTimeoutMs  | optional: 10000 (min: 1000)           | Long: The timeout duration for the consumer to pull data each time, in **ms** |

Special configurations in `SubscriptionPullConsumer` ：

| **Parameter**      | **required or optional with default** | **Parameter Meaning**                                        |
| :----------------- | :------------------------------------ | :----------------------------------------------------------- |
| autoCommit         | optional: true                        | Boolean: Whether to automatically commit the consumption progress. If this parameter is set to false, the `commit` method needs to be called manually to submit the consumption progress |
| autoCommitInterval | optional: 5000 (min: 500)             | Long: The time interval for automatically committing the consumption progress, in **ms** .This parameter only takes effect when the `autoCommit` parameter is set to true |


### 3.2 Function List

#### Data subscription

##### SubscriptionPullConsumer

| **Function name**                                            | **Description**                                              | **Parameter**                                                |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `open()`                                                     | Opens the consumer connection and starts message consumption. If `autoCommit` is enabled, it will start the automatic commit worker. | None                                                         |
| `close()`                                                    | Closes the consumer connection. If `autoCommit` is enabled, it will commit all uncommitted messages before closing. | None                                                         |
| `poll(final Duration timeout)`                               | Pulls messages with a specified timeout.                     | `timeout` : The timeout duration.                            |
| `poll(final long timeoutMs)`                                 | Pulls messages with a specified timeout in milliseconds.     | `timeoutMs` : The timeout duration in milliseconds.          |
| `poll(final Set<String> topicNames, final Duration timeout)` | Pulls messages from specified topics with a specified timeout. | `topicNames` : The set of topics to pull messages from. `timeout`: The timeout duration。 |
| `poll(final Set<String> topicNames, final long timeoutMs)`   | Pulls messages from specified topics with a specified timeout in milliseconds. | `topicNames` : The set of topics to pull messages from.`timeoutMs`: The timeout duration in milliseconds. |
| `commitSync(final SubscriptionMessage message)`              | Synchronously commits a single message.                      | `message` : The message object to be committed.              |
| `commitSync(final Iterable<SubscriptionMessage> messages)`   | Synchronously commits multiple messages.                     | `messages` :  The collection of message objects to be committed. |
| `commitAsync(final SubscriptionMessage message)`             | Asynchronously commits a single message.                     | `message` : The message object to be committed.              |
| `commitAsync(final Iterable<SubscriptionMessage> messages)`  | Asynchronously commits multiple messages.                    | `messages` :  The collection of message objects to be committed. |
| `commitAsync(final SubscriptionMessage message, final AsyncCommitCallback callback)` | Asynchronously commits a single message with a specified callback. | `message` : The message object to be committed. `callback` : The callback function to be executed after asynchronous commit. |
| `commitAsync(final Iterable<SubscriptionMessage> messages, final AsyncCommitCallback callback)` | Asynchronously commits multiple messages with a specified callback. | `messages` : The collection of message objects to be committed.`callback` :  The callback function to be executed after asynchronous commit. |

##### SubscriptionPushConsumer

| **Function name**                                        | **Description**                                              | **Parameter**                                                |
| -------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `open()`                                                 | Opens the consumer connection, starts message consumption, and submits the automatic polling worker. | None                                                         |
| `close()`                                                | Closes the consumer connection and stops message consumption. | None                                                         |
| `toString()`                                             | Returns the core configuration information of the consumer object. | None                                                         |
| `coreReportMessage()`                                    | Obtains the key-value representation of the consumer's core configuration. | None                                                         |
| `allReportMessage()`                                     | Obtains the key-value representation of all the consumer's configurations. | None                                                         |
| `buildPushConsumer()`                                    | Builds a `SubscriptionPushConsumer` instance through the `Builder` | None                                                         |
| `ackStrategy(final AckStrategy ackStrategy)`             | Configures the message acknowledgment strategy for the consumer. | `ackStrategy`: The specified message acknowledgment strategy. |
| `consumeListener(final ConsumeListener consumeListener)` | Configures the message consumption logic for the consumer.   | `consumeListener`: The processing logic when the consumer receives messages. |
| `autoPollIntervalMs(final long autoPollIntervalMs)`      | Configures the interval for automatic polling.               | `autoPollIntervalMs` : The interval for automatic polling, in milliseconds. |
| `autoPollTimeoutMs(final long autoPollTimeoutMs)`        | Configures the timeout for automatic polling.间。            | `autoPollTimeoutMs`: The timeout for automatic polling, in milliseconds. |