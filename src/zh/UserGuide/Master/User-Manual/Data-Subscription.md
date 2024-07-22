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

# 功能介绍

## 应用场景

IoTDB 数据订阅模块（**下称 IoTDB 订阅客户端**）虽然参考了部分消息队列产品如 Kafka 的功能定义，**但是 IoTDB 订阅客户端并不是为了替换这些消息队列产品，而是提供区别于数据查询的一种新的数据消费方式**。在下面应用场景中，使用 IoTDB 订阅客户端消费数据会有显著的优势：

1. **替换大量数据的轮询查询**：避免查询频率高、测点多时，轮询查询对原有系统性能的较大影响；避免查询范围不好确定问题，可保证下游拿到准确全量的数据
2. **方便下游进行系统集成**：更方便对接 Flink、Spark、Kafka / DataX、Camel / MySQL、PG 等系统组件。不需要为每一个大数据组件，单独定制开发 IoTDB 的变更捕获等逻辑，可简化集成组件设计，方便用户
3. ……

## 主要概念

**IoTDB 订阅客户端包含 3 个核心概念：Topic、Consumer、Consumer Group**

1. **Topic（主题）: Topic** 是 IoTDB 订阅客户端用于分类数据的逻辑概念，可以看作是数据的发布通道。生产者将数据发布到特定的主题，而消费者则订阅这些主题以接收相关数据。
2. **Consumer（消费者）: Consumer** 是 IoTDB 订阅客户端中的应用程序或服务，负责接收和处理发布到特定 **Topic** 的数据。**Consumer** 从队列中获取数据并进行相应的处理。在 IoTDB 订阅客户端中提供了两种类型的 **Consumers**:
   1. 一种是 `SubscriptionPullConsumer`，对应的是消息队列中的 pull 消费模式，用户代码需要主动调用数据获取逻辑
   2. 一种是 `SubscriptionPushConsumer`，对应的是消息队列中的 push 消费模式，用户代码由新到达的数据事件触发
3. **Consumer Group（消费者组）: Consumer Group** 是一组 **Consumers** 的集合，当同一个 **Consumer Group** 中不同的 **Consumers 订阅了相同的 Topic 时，这些 Consumers** 便共享该 Topic 下数据的处理负载，该 Topic 下的每条数据只能被组内的一个 **Consumer** 处理，确保数据不会被重复处理（即一个消费者组中的所有消费者共享消费进度）
   1. 一个 consumer group 中的 consumers 可以有任意多个，允许 consumers 的动态增删
   2. 一个 topic 不需要被一个 consumer group 中的所有 consumer 订阅，所有的 consumer 都可以按需订阅指定的 topics，即可以订阅多个 topics，可以动态的新增订阅或取消订阅 topics。一个 consumer 只有显式订阅了某个 topic，才会收到对应 topic 的数据
   3. 允许 `SubscriptionPullConsumer` 和 `SubscriptionPushConsumer` 加入同一个 consumer group
   4. 不允许一个 consumer 同时加入多个不同的 consumer groups

![subscription-example](https://github.com/user-attachments/assets/80bfe5bd-6b0c-4836-a14b-d811ccf54ae2)

# 语法说明

## Topic 管理

### 概念

- **基本概念**：Topic 是 IoTDB 订阅客户端中用于分类数据的逻辑概念，可以看作是数据的发布通道。生产者将数据发布到特定的主题，而消费者则订阅这些主题以接收相关数据。不同于 Kafka，在 IoTDB 订阅客户端中主题描述了订阅数据的**序列特征，时间特征，呈现形式，及可选的自定义处理逻辑**
- **表示方法：Topic 由下述几个部分定义**
  - **Path**：表示一组需要订阅的时间序列集合
  - **Time**：表示需要订阅的时间序列的时间范围（event time）
  - **Processor**：表示对原始订阅数据应用的自定义处理逻辑，可以通过类似 pipe processor 插件的方式指定
  - **Format**：表示从该主题订阅出的数据呈现形式，目前支持下述两种数据形式：
    - `SessionDataSetsHandler`：使用 `SubscriptionSessionDataSetsHandler` 获取从该主题订阅出的数据，消费者可以按行消费每条数据
    - `TsFileHandler`：使用 `SubscriptionTsFileHandler` 获取从该主题订阅出的数据，消费者可以直接订阅到存储相应数据的 TsFile
- **生命周期管理**
  - Topic 只有被创建了，才能被订阅
  - Topic 在没有被订阅的情况下，才能被删除，Topic 被删除时，其相关的消费进度都会被清理

### 管理方式 1: SQL

1. 创建 Topic

```SQL
CREATE TOPIC <topicName> 
WITH (
  [<parameter> = <value>,],
);
```

对于 parameter 和 value，定义如下：

| **parameter**     | **required or optional with default value** | **description**                                              |
| :---------------- | :------------------------------------------ | :----------------------------------------------------------- |
| **path**          | optional: `root.**`                         | topic 对应时间序列的路径 path                                |
| **start-time**    | optional: `MIN_VALUE`                       | topic 对应订阅数据时间序列的开始时间（event time）可以为 ISO 格式，例如 2011-12-03T10:15:30 或 2011-12-03T10:15:30+01:00；也可以为 long 值，含义为裸时间戳，单位与数据库时间戳精度一致。支持特殊 value **`now`**，含义为 topic 的创建时间，当 start-time 为 `now` 且 end-time 为 `MAX_VALUE` 时表示只订阅实时数据 |
| **end-time**      | optional: `MAX_VALUE`                       | topic 对应订阅数据时间序列的结束时间（event time）可以为 ISO 格式，例如 2011-12-03T10:15:30 或 2011-12-03T10:15:30+01:00；也可以为 long 值，含义为裸时间戳，单位与数据库时间戳精度一致。支持特殊 value **`now`**，含义为 topic 的创建时间，当 end-time 为 `now` 且 start-time 为 `MIN_VALUE` 时表示只订阅历史数据 |
| **processor**     | optional: `do-nothing-processor`            | processor 插件名及其插件配置                                             |
| **format**        | optional: `SessionDataSetsHandler`          | topic 对应的数据呈现形式，有两个选项：<br>1. `SessionDataSetsHandler`<br>2. `TsFileHandler` |
| **mode (v1.3.3.2 新增)**           | option: `live`                              | topic 对应的订阅模式：<br>1. `live`：订阅该主题时，订阅的数据集模式为动态数据集，即可以不断消费到最新的数据<br>2. `snapshot`：consumer 订阅该主题时，订阅的数据集模式为静态数据集，即 consumer group 订阅该主题的时刻（不是创建主题的时刻）数据的 snapshot；形成订阅后的静态数据集不支持 TTL |
| **loose-range (v1.3.3.2 新增)**    | option: `""`                                | String: 是否严格按照 path 和 time range 来筛选该 topic 对应的数据，例如：<br>1. `""`：严格按照 path 和 time range 来筛选该 topic 对应的数据<br>2. `"time"`：不严格按照 time range 来筛选该 topic 对应的数据（粗筛）；严格按照 path 来筛选该 topic 对应的数据<br>3. `"path"`：不严格按照 path 来筛选该 topic 对应的数据（粗筛）；严格按照 time range 来筛选该 topic 对应的数据<br>4. `"time, path"` / `"path, time"` / `"all"`：不严格按照 path 和 time range 来筛选该 topic 对应的数据（粗筛） |

示例：

```SQL
-- 全量订阅
CREATE TOPIC root_all;

-- 自定义订阅
CREATE TOPIC sg_timerange
WITH (
  'path' = 'root.sg.**',
  'start-time' = '2023-01-01',
  'end-time' = '2023-12-31',
);
```

2. 删除 Topic

```SQL
DROP TOPIC <topicName>;
```

3. 获取 Topic

```SQL
SHOW TOPICS;
SHOW TOPIC <topicName>;
```

### 管理方式 2: JAVA SDK

IoTDB 订阅客户端中的 SubscriptionSession 类提供了 Topic 管理的相关接口：

1. 创建 Topic

```Java
Topic createTopic(String topicName, Properties properties) throws Exception;
```

示例：

```Java
try (final SubscriptionSession session = new SubscriptionSession(host, port)) {
  session.open();
  final Properties config = new Properties();
  config.put(TopicConstant.PATH_KEY, "root.sg.**");
  session.createTopic(topicName, config);
}
```

2. 删除 Topic

```Java
Topic dropTopic(String topicName) throws Exception;
```

3. 获取 Topic

```Java
// 获取所有 topics
Set<Topic> getTopics() throws Exception;

// 获取单个 topic
Optional<Topic> getTopic(String topicName) throws Exception;
```

## Consumer 操作

**在 IoTDB 订阅客户端中只能通过 JAVA SDK 的方式进行 consumer 相关的操作。**

**本节介绍创建 consumer，订阅 topic，消费数据和取消订阅 4 种操作。**

### 创建 Consumer

在使用 JAVA SDK 创建 consumer 时，需要指定 consumer 所应用的参数。

对于 `SubscriptionPullConsumer` 和 `SubscriptionPushConsumer` 而言，有以下公共配置：

| key                     | **required or optional with default**                        | description                                                  |
| :---------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| host                    | optional: 127.0.0.1                                          | String: IoTDB 中某 DataNode 的 RPC host                      |
| port                    | optional: 6667                                               | Integer: IoTDB 中某 DataNode 的 RPC port                     |
| node-urls               | optional: 127.0.0.1:6667                                     | List\<String\>: IoTDB 中所有 DataNode 的 RPC 地址，可以是多个；host:port 和 node-urls 选填一个即可。当 host:port 和 node-urls 都填写了，则取 host:port 和 node-urls 的**并集**构成新的 node-urls 应用 |
| username                | optional: root                                               | String: IoTDB 中 DataNode 的用户名                           |
| password                | optional: root                                               | String: IoTDB 中 DataNode 的密码                             |
| groupId                 | optional                                                     | String: consumer group id，若未指定则随机分配（新的 consumer group），保证不同的 consumer group 对应的 consumer group id 均不相同 |
| consumerId              | optional                                                     | String: consumer client id，若未指定则随机分配，保证同一个 consumer group 中每一个 consumer client id 均不相同 |
| heartbeatIntervalMs     | optional: 30000 (min: 1000)                                  | Long: consumer 向 IoTDB DataNode 定期发送心跳请求的间隔      |
| endpointsSyncIntervalMs | optional: 120000 (min: 5000)                                 | Long: consumer 探测 IoTDB 集群节点扩缩容情况调整订阅连接的间隔 |
| fileSaveDir             | optional: Paths.get(System.getProperty("user.dir"), "iotdb-subscription").toString() | String: consumer 订阅出的 TsFile 文件临时存放的目录路径      |
| fileSaveFsync           | optional: false                                              | Boolean: consumer 订阅 TsFile 的过程中是否主动调用 fsync     |

#### SubscriptionPushConsumer

以下为 `SubscriptionPushConsumer` 中的特殊配置：

| key                | **required or optional with default** | description                                                  |
| :----------------- | :------------------------------------ | :----------------------------------------------------------- |
| ackStrategy        | optional: `ACKStrategy.AFTER_CONSUME` | 消费进度的确认机制包含以下选项：<br>1. `ACKStrategy.BEFORE_CONSUME`（当 consumer 收到数据时立刻提交消费进度，`onReceive` 前）<br>2. `ACKStrategy.AFTER_CONSUME`（当 consumer 消费完数据再去提交消费进度，`onReceive` 后） |
| consumeListener    | optional                              | 消费数据的回调函数，需实现 `ConsumeListener` 接口，定义消费 `SessionDataSetsHandler` 和 `TsFileHandler` 形式数据的处理逻辑 |
| autoPollIntervalMs | optional: 5000 (min: 500)             | Long: consumer 自动拉取数据的时间间隔，单位为**毫秒**                        |
| autoPollTimeoutMs  | optional: 10000 (min: 1000)           | Long: consumer 每次拉取数据的超时时间，单位为**毫秒**                        |

其中，`ConsumerListener` 接口定义如下：

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

以下为 `SubscriptionPullConsumer` 中的特殊配置：

| key                | **required or optional with default** | description                                                  |
| :----------------- | :------------------------------------ | :----------------------------------------------------------- |
| autoCommit         | optional: true                        | Boolean: 是否自动提交消费进度<br>如果此参数设置为 false，则需要调用 `commit` 方法来手动提交消费进度 |
| autoCommitInterval | optional: 5000 (min: 500)             | Long: 自动提交消费进度的时间间隔，单位为**毫秒**<br>仅当 autoCommit 参数为 true 的时候才会生效 |

在创建 consumer 后，需要手动调用 consumer 的 open 方法：

```Java
void open() throws Exception;
```

此时，IoTDB 订阅客户端才会校验 consumer 的配置正确性，在校验成功后 consumer 就会加入对应的 consumer group。也就是说，在打开 consumer 后，才可以使用返回的 consumer 对象进行订阅 Topic，消费数据等操作。

### 订阅 Topic

`SubscriptionPushConsumer` 和 `SubscriptionPullConsumer` 提供了下述 JAVA SDK 用于订阅 Topics:

```Java
// 订阅 topics
void subscribe(String topic) throws Exception;
void subscribe(List<\String\> topics) throws Exception;
```

- 在 consumer 订阅 topic 前，topic 必须已经被创建，否则订阅会失败
- 一个 consumer 在已经订阅了某个 topic 的情况下再次订阅这个 topic，不会报错
- 如果该 consumer 所在的 consumer group 中已经有 consumers 订阅了相同的 topics，那么该 consumer 将会复用对应的消费进度

### 消费数据

**无论是 push 模式还是 pull 模式的 consumer：**

- 只有显式订阅了某个 topic，才会收到对应 topic 的数据
- 若在创建后没有订阅任何 topics，此时该 consumer 无法消费到任何数据，即使该 consumer 所在的 consumer group 中其它的 consumers 订阅了一些 topics

#### SubscriptionPushConsumer

SubscriptionPushConsumer 在订阅 topics 后，无需手动拉取数据，其消费数据的逻辑在创建 SubscriptionPushConsumer 指定的 `consumeListener` 配置中。

#### SubscriptionPullConsumer

SubscriptionPullConsumer 在订阅 topics 后，需要主动调用 `poll` 方法拉取数据：

```Java
List<SubscriptionMessage> poll(final Duration timeout) throws Exception;
List<SubscriptionMessage> poll(final long timeoutMs) throws Exception;
List<SubscriptionMessage> poll(final Set<String> topicNames, final Duration timeout) throws Exception;
List<SubscriptionMessage> poll(final Set<String> topicNames, final long timeoutMs) throws Exception;
```

在 poll 方法中可以指定需要拉取的 topic 名称（如果不指定则默认拉取该 consumer 已订阅的所有 topics）和超时时间。

当 SubscriptionPullConsumer 配置 autoCommit 参数为 false 时，需要手动调用 commitSync 和 commitAsync 方法同步或异步提交某批数据的消费进度：

```Java
void commitSync(final SubscriptionMessage message) throws Exception;
void commitSync(final Iterable<SubscriptionMessage> messages) throws Exception;

CompletableFuture<Void> commitAsync(final SubscriptionMessage message);
CompletableFuture<Void> commitAsync(final Iterable<SubscriptionMessage> messages);
void commitAsync(final SubscriptionMessage message, final AsyncCommitCallback callback);
void commitAsync(final Iterable<SubscriptionMessage> messages, final AsyncCommitCallback callback);
```

AsyncCommitCallback 类定义如下：

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

### 取消订阅

`SubscriptionPushConsumer` 和 `SubscriptionPullConsumer` 提供了下述 JAVA SDK 用于取消订阅并关闭 consumer:

```Java
// 取消订阅 topics
void unsubscribe(String topic) throws Exception;
void unsubscribe(List\<String\> topics) throws Exception;

// 关闭 consumer
void close();
```

- 在 topic 存在的情况下，如果一个 consumer 在没有订阅了某个 topic 的情况下取消订阅某个 topic，不会报错
- consumer close 时会退出对应的 consumer group，同时自动 unsubscribe 该 consumer 现存订阅的所有 topics
- consumer 在 close 后生命周期即结束，无法再重新 open 订阅并消费数据

## 订阅状态获取

### 获取方式 1: SQL

用户可以使用 SQL 查询 IoTDB 订阅客户端中目前存在的订阅关系：

```SQL
-- 查询所有的 topics 与 consumer group 的订阅关系
SHOW SUBSCRIPTIONS
-- 查询某个 topic 下所有的 subscriptions
SHOW SUBSCRIPTIONS ON <topicName>
```

结果集：

```SQL
[TopicName|ConsumerGroupName|SubscribedConsumers]
```

- TopicName：主题 ID
- ConsumerGroupName：用户代码中指定的消费者组 ID
- SubscribedConsumers：该消费者组中订阅了该主题的所有客户端 ID

### 获取方式 2: JAVA SDK

IoTDB 订阅客户端中的 SubscriptionSession 类提供了获取订阅状态的相关接口：

```Java
Set<Subscription> getSubscriptions() throws Exception;
Set<Subscription> getSubscriptions(final String topicName) throws Exception;
```

# 代码示例 (JAVA SDK)

## 单 Pull Consumer 消费 SessionDataSetsHandler 形式的数据

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

## 多 Push Consumer 消费 TsFileHandler 形式的数据

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

## IoTDB 数据订阅与 Kafka 的区别是什么？

### 消费有序性

- **Kafka 保证消息在单个 partition 内是有序的**，当某个 topic 仅对应一个 partition 且只有一个 consumer 订阅了这个 topic，即可保证该 consumer（单线程） 消费该 topic 数据的顺序即为数据写入的顺序。
- IoTDB 订阅客户端**不保证** consumer 消费数据的顺序即为数据写入的顺序，但会尽量反映数据写入的顺序。

### 消息送达语义

- Kafka 可以通过配置实现 Producer 和 Consumer 的 Exactly once 语义。
- IoTDB 订阅客户端目前无法提供 Consumer 的 Exactly once 语义。