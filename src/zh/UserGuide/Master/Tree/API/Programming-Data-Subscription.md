

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

# 数据订阅API

IoTDB 提供了强大的数据订阅功能，允许用户通过订阅 API 实时获取 IoTDB 新增的数据。详细的功能定义及介绍：[数据订阅](../User-Manual/Data-subscription.md)

## 1 核心步骤

1. 创建Topic：创建一个Topic，Topic中包含希望订阅的测点。
2. 订阅Topic：在 consumer 订阅 topic 前，topic 必须已经被创建，否则订阅会失败。同一个 consumer group 下的 consumers 会均分数据。
3. 消费数据：只有显式订阅了某个 topic，才会收到对应 topic 的数据。
4. 取消订阅： consumer close 时会退出对应的 consumer group，同时取消现存的所有订阅。 


## 2 详细步骤

本章节用于说明开发的核心流程，并未演示所有的参数和接口，如需了解全部功能及参数请参见: [全量接口说明](./Programming-Java-Native-API.md#3-全量接口说明)


### 2.1  创建maven项目

创建一个maven项目，并导入以下依赖（JDK >= 1.8, Maven >= 3.6）

```xml
<dependencies>
    <dependency>
      <groupId>org.apache.iotdb</groupId>
      <artifactId>iotdb-session</artifactId>
      <!-- 版本号与数据库版本号相同 -->
      <version>${project.version}</version>
    </dependency>
</dependencies>
```

### 2.2 代码案例

#### 2.2.1 Topic操作

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
        try (SubscriptionSession session = new SubscriptionSession("127.0.0.1", 6667)) {
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

#### 2.2.2 数据消费

##### 场景-1: 订阅IoTDB中新增的实时数据（大屏或组态展示的场景）

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
        consumerConfig.put(ConsumerConstant.CONSUME_LISTENER_KEY, TopicConstant.FORMAT_SESSION_DATA_SETS_HANDLER_VALUE);
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

##### 场景-2:订阅新增的 TsFile（定期数据备份的场景）

前提：需要被消费的topic的格式为TsfileHandler类型，举例：`create topic topic_all_tsfile with ('path'='root.**','format'='TsFileHandler')`

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
        consumerConfig.put(TopicConstant.FORMAT_KEY, TopicConstant.FORMAT_TS_FILE_HANDLER_VALUE);
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




## 3 全量接口说明

### 3.1 参数列表

可通过Properties参数对象设置消费者相关参数，具体参数如下。

#### 3.1.1 SubscriptionConsumer


| 参数                    | 是否必填（默认值）                                           | 参数含义                                                     |
| :---------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| host                    | optional: 127.0.0.1                                          | `String`: IoTDB 中某 DataNode 的 RPC host                    |
| port                    | optional: 6667                                               | `Integer`: IoTDB 中某 DataNode 的 RPC port                   |
| node-urls               | optional: 127.0.0.1:6667                                     | `List<String>`: IoTDB 中所有 DataNode 的 RPC 地址，可以是多个；host:port 和 node-urls 选填一个即可。当 host:port 和 node-urls 都填写了，则取 host:port 和 node-urls 的**并集**构成新的 node-urls 应用 |
| username                | optional: root                                               | `String`: IoTDB 中 DataNode 的用户名                         |
| password                | optional: root                                               | `String`: IoTDB 中 DataNode 的密码                           |
| groupId                 | optional                                                     | `String`: consumer group id，若未指定则随机分配（新的 consumer group），保证不同的 consumer group 对应的 consumer group id 均不相同 |
| consumerId              | optional                                                     | `String`: consumer client id，若未指定则随机分配，保证同一个 consumer group 中每一个 consumer client id 均不相同 |
| heartbeatIntervalMs     | optional: 30000 (min: 1000)                                  | `Long`: consumer 向 IoTDB DataNode 定期发送心跳请求的间隔    |
| endpointsSyncIntervalMs | optional: 120000 (min: 5000)                                 | `Long`: consumer 探测 IoTDB 集群节点扩缩容情况调整订阅连接的间隔 |
| fileSaveDir             | optional: Paths.get(System.getProperty("user.dir"), "iotdb-subscription").toString() | `String`: consumer 订阅出的 TsFile 文件临时存放的目录路径    |
| fileSaveFsync           | optional: false                                              | `Boolean`: consumer 订阅 TsFile 的过程中是否主动调用 fsync   |

`SubscriptionPushConsumer` 中的特殊配置：

| 参数               | 是否必填（默认值）                    | 参数含义                                                     |
| :----------------- | :------------------------------------ | :----------------------------------------------------------- |
| ackStrategy        | optional: `ACKStrategy.AFTER_CONSUME` | 消费进度的确认机制包含以下选项：`ACKStrategy.BEFORE_CONSUME`（当 consumer 收到数据时立刻提交消费进度，`onReceive` 前）`ACKStrategy.AFTER_CONSUME`（当 consumer 消费完数据再去提交消费进度，`onReceive` 后） |
| consumeListener    | optional                              | 消费数据的回调函数，需实现 `ConsumeListener` 接口，定义消费 `SessionDataSetsHandler` 和 `TsFileHandler` 形式数据的处理逻辑 |
| autoPollIntervalMs | optional: 5000 (min: 500)             | Long: consumer 自动拉取数据的时间间隔，单位为**毫秒**        |
| autoPollTimeoutMs  | optional: 10000 (min: 1000)           | Long: consumer 每次拉取数据的超时时间，单位为**毫秒**        |

`SubscriptionPullConsumer` 中的特殊配置：

| 参数               | 是否必填（默认值）        | 参数含义                                                     |
| :----------------- | :------------------------ | :----------------------------------------------------------- |
| autoCommit         | optional: true            | Boolean: 是否自动提交消费进度如果此参数设置为 false，则需要调用 `commit` 方法来手动提交消费进度 |
| autoCommitInterval | optional: 5000 (min: 500) | Long: 自动提交消费进度的时间间隔，单位为**毫秒**仅当 autoCommit 参数为 true 的时候才会生效 |


### 3.2 函数列表

#### 3.2.1 数据订阅

##### SubscriptionPullConsumer

| **函数名**                                                   | **说明**                                                     | **参数**                                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `open()`                                                     | 打开消费者连接，启动消息消费。如果 `autoCommit` 启用，会启动自动提交工作器。 | 无                                                           |
| `close()`                                                    | 关闭消费者连接。如果 `autoCommit` 启用，会在关闭前提交所有未提交的消息。 | 无                                                           |
| `poll(final Duration timeout)`                               | 拉取消息，指定超时时间。                                     | `timeout` : 拉取的超时时间。                                 |
| `poll(final long timeoutMs)`                                 | 拉取消息，指定超时时间（毫秒）。                             | `timeoutMs` : 超时时间，单位为毫秒。                         |
| `poll(final Set<String> topicNames, final Duration timeout)` | 拉取指定主题的消息，指定超时时间。                           | `topicNames` : 要拉取的主题集合。`timeout`: 超时时间。       |
| `poll(final Set<String> topicNames, final long timeoutMs)`   | 拉取指定主题的消息，指定超时时间（毫秒）。                   | `topicNames` : 要拉取的主题集合。`timeoutMs`: 超时时间，单位为毫秒。 |
| `commitSync(final SubscriptionMessage message)`              | 同步提交单条消息。                                           | `message` : 需要提交的消息对象。                             |
| `commitSync(final Iterable<SubscriptionMessage> messages)`   | 同步提交多条消息。                                           | `messages` : 需要提交的消息集合。                            |
| `commitAsync(final SubscriptionMessage message)`             | 异步提交单条消息。                                           | `message` : 需要提交的消息对象。                             |
| `commitAsync(final Iterable<SubscriptionMessage> messages)`  | 异步提交多条消息。                                           | `messages` : 需要提交的消息集合。                            |
| `commitAsync(final SubscriptionMessage message, final AsyncCommitCallback callback)` | 异步提交单条消息并指定回调函数。                             | `message` : 需要提交的消息对象。`callback` : 异步提交完成后的回调函数。 |
| `commitAsync(final Iterable<SubscriptionMessage> messages, final AsyncCommitCallback callback)` | 异步提交多条消息并指定回调函数。                             | `messages` : 需要提交的消息集合。`callback` : 异步提交完成后的回调函数。 |

##### SubscriptionPushConsumer

| **函数名**                                               | **说明**                                              | **参数**                                                |
| -------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------- |
| `open()`                                                 | 打开消费者连接，启动消息消费，提交自动轮询工作器。    | 无                                                      |
| `close()`                                                | 关闭消费者连接，停止消息消费。                        | 无                                                      |
| `toString()`                                             | 返回消费者对象的核心配置信息。                        | 无                                                      |
| `coreReportMessage()`                                    | 获取消费者核心配置的键值对表示形式。                  | 无                                                      |
| `allReportMessage()`                                     | 获取消费者所有配置的键值对表示形式。                  | 无                                                      |
| `buildPushConsumer()`                                    | 通过 `Builder` 构建 `SubscriptionPushConsumer` 实例。 | 无                                                      |
| `ackStrategy(final AckStrategy ackStrategy)`             | 配置消费者的消息确认策略。                            | `ackStrategy`: 指定的消息确认策略。                     |
| `consumeListener(final ConsumeListener consumeListener)` | 配置消费者的消息消费逻辑。                            | `consumeListener`: 消费者接收消息时的处理逻辑。         |
| `autoPollIntervalMs(final long autoPollIntervalMs)`      | 配置自动轮询的时间间隔。                              | `autoPollIntervalMs` : 自动轮询的间隔时间，单位为毫秒。 |
| `autoPollTimeoutMs(final long autoPollTimeoutMs)`        | 配置自动轮询的超时时间。                              | `autoPollTimeoutMs`: 自动轮询的超时时间，单位为毫秒。   |









