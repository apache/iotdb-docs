# 数据订阅

## 1. 功能介绍

IoTDB 数据订阅模块（又称 IoTDB 订阅客户端）是IoTDB V1.3.3 版本后支持的功能，它为用户提供了一种区别于数据查询的流式数据消费方式。它参考了 Kafka 等消息队列产品的基本概念和逻辑，**提供数据订阅和消费接口**，但并不是为了完全替代这些消费队列的产品，更多的是在简单流式获取数据的场景为用户提供更加便捷的数据订阅服务。

在下面应用场景中，使用 IoTDB 订阅客户端消费数据会有显著的优势：

1. **持续获取最新数据**：使用订阅的方式，比定时查询更实时、应用编程更简单、系统负担更小；
2. **简化数据推送至第三方系统**：无需在 IoTDB 内部开发不同系统的数据推送组件，可以在第三方系统内实现数据的流式获取，更方便将数据发送至 Flink、Kafka、DataX、Camel、MySQL、PG 等系统。

## 2. 主要概念

IoTDB 订阅客户端包含 3 个核心概念：Topic、Consumer、Consumer Group，具体关系如下图

<div align="center">
    <img src="https://alioss.timecho.com/docs/img/Data-sub01.png" alt="" style="width: 60%;"/>
</div>

1. **Topic（主题）**: Topic 是 IoTDB 的数据空间，由路径和时间范围表示（如 root.** 的全时间范围）。消费者可以订阅这些主题的数据（当前已有的和未来写入的）。不同于 Kafka，IoTDB 可在数据入库后再创建 Topic，且输出格式可选择 Message 或 TsFile 两种。

2. **Consumer（消费者）**: Consumer 是 IoTDB 的订阅客户端，负责接收和处理发布到特定 Topic 的数据。Consumer 从队列中获取数据并进行相应的处理。在 IoTDB 订阅客户端中提供了两种类型的 Consumers:
  - 一种是 `SubscriptionPullConsumer`，对应的是消息队列中的 pull 消费模式，用户代码需要主动调用数据获取逻辑
  - 一种是 `SubscriptionPushConsumer`，对应的是消息队列中的 push 消费模式，用户代码由新到达的数据事件触发

3. **Consumer Group（消费者组）**: Consumer Group 是一组 Consumers 的集合，拥有相同 Consumer Group ID 的消费者属于同一个消费者组。Consumer Group 有以下特点：
  - Consumer Group 与 Consumer  为一对多的关系。即一个 consumer group 中的 consumers 可以有任意多个，但不允许一个 consumer 同时加入多个 consumer groups
  - 允许一个 Consumer Group 中有不同类型的 Consumer（`SubscriptionPullConsumer` 和 `SubscriptionPushConsumer`）
  - 一个 topic 不需要被一个 consumer group 中的所有 consumer 订阅
  - 当同一个 Consumer Group 中不同的 Consumers 订阅了相同的 Topic 时，该 Topic 下的每条数据只会被组内的一个 Consumer 处理，确保数据不会被重复处理

## 3. SQL 语句

### 3.1 Topic 管理

IoTDB 支持通过 SQL 语句对 Topic 进行创建、删除、查看操作。Topic状态变化如下图所示：

<div align="center">
    <img src="https://alioss.timecho.com/docs/img/Data_sub_02.png" alt="" style="width: 60%;"/>
</div>

#### 3.1.1 创建 Topic

SQL 语句为：

```SQL
    CREATE TOPIC [IF NOT EXISTS] <topicName> 
    WITH (
    [<parameter> = <value>,],
    );
```
**IF NOT EXISTS 语义**：用于创建操作中，确保当指定 Topic 不存在时，执行创建命令，防止因尝试创建已存在的 Topic 而导致报错。

各参数详细解释如下：

| 参数                                          | 是否必填（默认值）                 | 参数含义                                                     |
| :-------------------------------------------- | :--------------------------------- | :----------------------------------------------------------- |
| **path**                                      | optional: `root.**`                | topic 对应订阅数据时间序列的路径 path，表示一组需要订阅的时间序列集合 |
| **start-time**                                | optional: `MIN_VALUE`              | topic 对应订阅数据时间序列的开始时间（event time）可以为 ISO 格式，例如 2011-12-03T10:15:30 或 2011-12-03T10:15:30+01:00也可以为 long 值，含义为裸时间戳，单位与数据库时间戳精度一致支持特殊 value **`now`**，含义为 topic 的创建时间，当 start-time 为 `now` 且 end-time 为 MAX_VALUE 时表示只订阅实时数据 |
| **end-time**                                  | optional: `MAX_VALUE`              | topic 对应订阅数据时间序列的结束时间（event time）可以为 ISO 格式，例如 2011-12-03T10:15:30 或 2011-12-03T10:15:30+01:00也可以为 long 值，含义为裸时间戳，单位与数据库时间戳精度一致支持特殊 value `now`，含义为 topic 的创建时间，当 end-time 为 `now` 且 start-time 为 MIN_VALUE 时表示只订阅历史数据 |
| **processor**                                 | optional: `do-nothing-processor`   | processor 插件名及其参数配置，表示对原始订阅数据应用的自定义处理逻辑，可以通过类似 pipe processor 插件的方式指定 |
| **format**                                    | optional: `SessionDataSetsHandler` | 表示从该主题订阅出的数据呈现形式，目前支持下述两种数据形式：`SessionDataSetsHandler`：使用 `SubscriptionSessionDataSetsHandler` 获取从该主题订阅出的数据，消费者可以按行消费每条数据`TsFileHandler`：使用 `SubscriptionTsFileHandler` 获取从该主题订阅出的数据，消费者可以直接订阅到存储相应数据的 TsFile |
| **mode** **(v1.3.3.2 及之后版本支持)**        | option: `live`                     | topic 对应的订阅模式，有两个选项：`live`：订阅该主题时，订阅的数据集模式为动态数据集，即可以不断消费到最新的数据`snapshot`：consumer 订阅该主题时，订阅的数据集模式为静态数据集，即 consumer group 订阅该主题的时刻（不是创建主题的时刻）数据的 snapshot；形成订阅后的静态数据集不支持 TTL |
| **loose-range** **(v1.3.3.2 及之后版本支持)** | option: `""`                       | String: 是否严格按照 path 和 time range 来筛选该 topic 对应的数据，例如：`""`：严格按照 path 和 time range 来筛选该 topic 对应的数据`"time"`：不严格按照 time range 来筛选该 topic 对应的数据（粗筛）；严格按照 path 来筛选该 topic 对应的数据`"path"`：不严格按照 path 来筛选该 topic 对应的数据（粗筛）；严格按照 time range 来筛选该 topic 对应的数据`"time, path"` / `"path, time"` / `"all"`：不严格按照 path 和 time range 来筛选该 topic 对应的数据（粗筛） |

示例如下：

```SQL
-- 全量订阅
CREATE TOPIC root_all;

-- 自定义订阅
CREATE TOPIC IF NOT EXISTS db_timerange
WITH (
  'path' = 'root.db.**',
  'start-time' = '2023-01-01',
  'end-time' = '2023-12-31'
);
```

#### 3.1.2 删除 Topic

Topic 在没有被订阅的情况下，才能被删除，Topic 被删除时，其相关的消费进度都会被清理

```SQL
DROP TOPIC [IF EXISTS] <topicName>;
```

**IF EXISTS 语义**：用于删除操作中，确保当指定 Topic 存在时，执行删除命令，防止因尝试删除不存在的 Topic 而导致报错。

#### 3.1.3 查看 Topic

```SQL
SHOW TOPICS;
SHOW TOPIC <topicName>;
```

结果集：

```SQL
[TopicName|TopicConfigs]
```

- TopicName：主题 ID
- TopicConfigs：主题配置

### 3.2 查看订阅状态

查看所有订阅关系：

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

## 4. API 接口

除 SQL 语句外，IoTDB 还支持通过 Java 原生接口使用数据订阅功能。详细语法参见页面：Java 原生接口（[链接](../API/Programming-Java-Native-API.md)）。

## 5. 常见问题

### 5.1 IoTDB 数据订阅与 Kafka 的区别是什么？

1. 消费有序性

- **Kafka 保证消息在单个 partition 内是有序的**，当某个 topic 仅对应一个 partition 且只有一个 consumer 订阅了这个 topic，即可保证该 consumer（单线程） 消费该 topic 数据的顺序即为数据写入的顺序。
- IoTDB 订阅客户端**不保证** consumer 消费数据的顺序即为数据写入的顺序，但会尽量反映数据写入的顺序。

2. 消息送达语义

- Kafka 可以通过配置实现 Producer 和 Consumer 的 Exactly once 语义。
- IoTDB 订阅客户端目前无法提供 Consumer 的 Exactly once 语义。