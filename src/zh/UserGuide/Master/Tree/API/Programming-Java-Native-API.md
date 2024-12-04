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

# Java 原生接口

## 安装

### 依赖

* JDK >= 1.8
* Maven >= 3.6


### 在 MAVEN 中使用原生接口

```xml
<dependencies>
    <dependency>
      <groupId>org.apache.iotdb</groupId>
      <artifactId>iotdb-session</artifactId>
      <version>${project.version}</version>
    </dependency>
</dependencies>
```

## 语法说明

 - 对于 IoTDB-SQL 接口：传入的 SQL 参数需要符合  [语法规范](../User-Manual/Syntax-Rule.md#字面值常量) ，并且针对 JAVA 字符串进行反转义，如双引号前需要加反斜杠。（即：经 JAVA 转义之后与命令行执行的 SQL 语句一致。） 
 - 对于其他接口： 
   - 经参数传入的路径或路径前缀中的节点： 在 SQL 语句中需要使用反引号（`）进行转义的，此处均需要进行转义。 
   - 经参数传入的标识符（如模板名）：在 SQL 语句中需要使用反引号（`）进行转义的，均可以不用进行转义。
 - 语法说明相关代码示例可以参考：`example/session/src/main/java/org/apache/iotdb/SyntaxConventionRelatedExample.java`

## 基本接口说明

下面将给出 Session 对应的接口的简要介绍和对应参数：

### Session管理

* 初始化 Session

``` java
// 全部使用默认配置
session = new Session.Builder.build();

// 指定一个可连接节点
session = 
    new Session.Builder()
        .host(String host)
        .port(int port)
        .build();

// 指定多个可连接节点
session = 
    new Session.Builder()
        .nodeUrls(List<String> nodeUrls)
        .build();

// 其他配置项
session = 
    new Session.Builder()
        .fetchSize(int fetchSize)
        .username(String username)
        .password(String password)
        .thriftDefaultBufferSize(int thriftDefaultBufferSize)
        .thriftMaxFrameSize(int thriftMaxFrameSize)
        .enableRedirection(boolean enableRedirection)
        .version(Version version)
        .build();
```

其中，version 表示客户端使用的 SQL 语义版本，用于升级 0.13 时兼容 0.12 的 SQL 语义，可能取值有：`V_0_12`、`V_0_13`、`V_1_0`等。


* 开启 Session

``` java
void open()
```

* 开启 Session，并决定是否开启 RPC 压缩

``` java
void open(boolean enableRPCCompression)
```

注意: 客户端的 RPC 压缩开启状态需和服务端一致

* 关闭 Session

``` java
void close()
```

* SessionPool

我们提供了一个针对原生接口的连接池 (`SessionPool`)，使用该接口时，你只需要指定连接池的大小，就可以在使用时从池中获取连接。
如果超过 60s 都没得到一个连接的话，那么会打印一条警告日志，但是程序仍将继续等待。

当一个连接被用完后，他会自动返回池中等待下次被使用；
当一个连接损坏后，他会从池中被删除，并重建一个连接重新执行用户的操作；
你还可以像创建 Session 那样在创建 SessionPool 时指定多个可连接节点的 url，以保证分布式集群中客户端的高可用性。

对于查询操作：

1. 使用 SessionPool 进行查询时，得到的结果集是`SessionDataSet`的封装类`SessionDataSetWrapper`;
2. 若对于一个查询的结果集，用户并没有遍历完且不再想继续遍历时，需要手动调用释放连接的操作`closeResultSet`;
3. 若对一个查询的结果集遍历时出现异常，也需要手动调用释放连接的操作`closeResultSet`.
4. 可以调用 `SessionDataSetWrapper` 的 `getColumnNames()` 方法得到结果集列名 

使用示例可以参见 `session/src/test/java/org/apache/iotdb/session/pool/SessionPoolTest.java`

或 `example/session/src/main/java/org/apache/iotdb/SessionPoolExample.java`


### 测点管理接口

#### Database 管理

* 设置 database

``` java
void setStorageGroup(String storageGroupId)
```

* 删除单个或多个 database

``` java
void deleteStorageGroup(String storageGroup)
void deleteStorageGroups(List<String> storageGroups)
```
#### 时间序列管理

* 创建单个或多个时间序列

``` java
void createTimeseries(String path, TSDataType dataType,
      TSEncoding encoding, CompressionType compressor, Map<String, String> props,
      Map<String, String> tags, Map<String, String> attributes, String measurementAlias)
      
void createMultiTimeseries(List<String> paths, List<TSDataType> dataTypes,
      List<TSEncoding> encodings, List<CompressionType> compressors,
      List<Map<String, String>> propsList, List<Map<String, String>> tagsList,
      List<Map<String, String>> attributesList, List<String> measurementAliasList)
```

* 创建对齐时间序列

```
void createAlignedTimeseries(String prefixPath, List<String> measurements,
      List<TSDataType> dataTypes, List<TSEncoding> encodings,
      List <CompressionType> compressors, List<String> measurementAliasList);
```

注意：目前**暂不支持**使用传感器别名。

* 删除一个或多个时间序列

``` java
void deleteTimeseries(String path)
void deleteTimeseries(List<String> paths)
```

* 检测时间序列是否存在

``` java
boolean checkTimeseriesExists(String path)
```

#### 元数据模版

* 创建元数据模板，可以通过先后创建 Template、MeasurementNode 的对象，描述模板内物理量结构与类型、编码方式、压缩方式等信息，并通过以下接口创建模板

``` java
public void createSchemaTemplate(Template template);

Class Template {
    private String name;
    private boolean directShareTime;
    Map<String, Node> children;
    public Template(String name, boolean isShareTime);
    
    public void addToTemplate(Node node);
    public void deleteFromTemplate(String name);
    public void setShareTime(boolean shareTime);
}

Abstract Class Node {
    private String name;
    public void addChild(Node node);
    public void deleteChild(Node node);
}

Class MeasurementNode extends Node {
    TSDataType dataType;
    TSEncoding encoding;
    CompressionType compressor;
    public MeasurementNode(String name, 
                           TSDataType dataType, 
                           TSEncoding encoding,
                          CompressionType compressor);
}
```

通过上述类的实例描述模板时，Template 内应当仅能包含单层的 MeasurementNode，具体可以参见如下示例：

``` java
MeasurementNode nodeX = new MeasurementNode("x", TSDataType.FLOAT, TSEncoding.RLE, CompressionType.SNAPPY);
MeasurementNode nodeY = new MeasurementNode("y", TSDataType.FLOAT, TSEncoding.RLE, CompressionType.SNAPPY);
MeasurementNode nodeSpeed = new MeasurementNode("speed", TSDataType.DOUBLE, TSEncoding.GORILLA, CompressionType.SNAPPY);

// This is the template we suggest to implement
Template flatTemplate = new Template("flatTemplate");
template.addToTemplate(nodeX);
template.addToTemplate(nodeY);
template.addToTemplate(nodeSpeed);

createSchemaTemplate(flatTemplate);
```

* 完成模板挂载操作后，可以通过如下的接口在给定的设备上使用模板注册序列，或者也可以直接向相应的设备写入数据以自动使用模板注册序列。

``` java
void createTimeseriesUsingSchemaTemplate(List<String> devicePathList)
```

* 将名为'templateName'的元数据模板挂载到'prefixPath'路径下，在执行这一步之前，你需要创建名为'templateName'的元数据模板
* **请注意，我们强烈建议您将模板设置在 database 或 database 下层的节点中，以更好地适配未来版本更新及各模块的协作**

``` java
void setSchemaTemplate(String templateName, String prefixPath)
```

- 将模板挂载到 MTree 上之后，你可以随时查询所有模板的名称、某模板被设置到 MTree 的所有路径、所有正在使用某模板的所有路径，即如下接口：

``` java
/** @return All template names. */
public List<String> showAllTemplates();

/** @return All paths have been set to designated template. */
public List<String> showPathsTemplateSetOn(String templateName);

/** @return All paths are using designated template. */
public List<String> showPathsTemplateUsingOn(String templateName)
```

- 如果你需要删除某一个模板，请确保在进行删除之前，MTree 上已经没有节点被挂载了模板，对于已经被挂载模板的节点，可以用如下接口卸载模板；


``` java
void unsetSchemaTemplate(String prefixPath, String templateName);
public void dropSchemaTemplate(String templateName);
```

* 请注意，如果一个子树中有多个孩子节点需要使用模板，可以在其共同父母节点上使用 setSchemaTemplate 。而只有在已有数据点插入模板对应的物理量时，模板才会被设置为激活状态，进而被 show timeseries 等查询检测到。
* 卸载'prefixPath'路径下的名为'templateName'的元数据模板。你需要保证给定的路径'prefixPath'下需要有名为'templateName'的元数据模板。

注意：目前不支持从曾经在'prefixPath'路径及其后代节点使用模板插入数据后（即使数据已被删除）卸载模板。


### 数据写入接口

推荐使用 insertTablet 帮助提高写入效率

* 插入一个 Tablet，Tablet 是一个设备若干行数据块，每一行的列都相同
  * **写入效率高**
  * **支持批量写入**
  * **支持写入空值**：空值处可以填入任意值，然后通过 BitMap 标记空值

``` java
void insertTablet(Tablet tablet)

public class Tablet {
  /** deviceId of this tablet */
  public String prefixPath;
  /** the list of measurement schemas for creating the tablet */
  private List<MeasurementSchema> schemas;
  /** timestamps in this tablet */
  public long[] timestamps;
  /** each object is a primitive type array, which represents values of one measurement */
  public Object[] values;
  /** each bitmap represents the existence of each value in the current column. */
  public BitMap[] bitMaps;
  /** the number of rows to include in this tablet */
  public int rowSize;
  /** the maximum number of rows for this tablet */
  private int maxRowNumber;
  /** whether this tablet store data of aligned timeseries or not */
  private boolean isAligned;
}
```

* 插入多个 Tablet

``` java
void insertTablets(Map<String, Tablet> tablets)
```

* 插入一个 Record，一个 Record 是一个设备一个时间戳下多个测点的数据。这里的 value 是 Object 类型，相当于提供了一个公用接口，后面可以通过 TSDataType 将 value 强转为原类型

  其中，Object 类型与 TSDataType 类型的对应关系如下表所示：

  | TSDataType | Object       |
  |------------|--------------|
  | BOOLEAN    | Boolean      |
  | INT32      | Integer      |
  | DATE       | LocalDate    |
  | INT64      | Long         |
  | TIMESTAMP  | Long         |
  | FLOAT      | Float        |
  | DOUBLE     | Double       |
  | TEXT       | String, Binary |
  | STRING     | String, Binary |
  | BLOB       | Binary |

``` java
void insertRecord(String prefixPath, long time, List<String> measurements,
   List<TSDataType> types, List<Object> values)
```

* 插入多个 Record

``` java
void insertRecords(List<String> deviceIds,
        List<Long> times,
        List<List<String>> measurementsList,
        List<List<TSDataType>> typesList,
        List<List<Object>> valuesList)
```

* 插入同属于一个 device 的多个 Record

``` java
void insertRecordsOfOneDevice(String deviceId, List<Long> times,
    List<List<String>> measurementsList, List<List<TSDataType>> typesList,
    List<List<Object>> valuesList)
```

#### 带有类型推断的写入

当数据均是 String 类型时，我们可以使用如下接口，根据 value 的值进行类型推断。例如：value 为 "true" ，就可以自动推断为布尔类型。value 为 "3.2" ，就可以自动推断为数值类型。服务器需要做类型推断，可能会有额外耗时，速度较无需类型推断的写入慢

* 插入一个 Record，一个 Record 是一个设备一个时间戳下多个测点的数据

``` java
void insertRecord(String prefixPath, long time, List<String> measurements, List<String> values)
```

* 插入多个 Record

``` java
void insertRecords(List<String> deviceIds, List<Long> times,
   List<List<String>> measurementsList, List<List<String>> valuesList)
```

* 插入同属于一个 device 的多个 Record

``` java
void insertStringRecordsOfOneDevice(String deviceId, List<Long> times,
    List<List<String>> measurementsList, List<List<String>> valuesList)
```

#### 对齐时间序列的写入

对齐时间序列的写入使用 insertAlignedXXX 接口，其余与上述接口类似：

* insertAlignedRecord
* insertAlignedRecords
* insertAlignedRecordsOfOneDevice
* insertAlignedStringRecordsOfOneDevice
* insertAlignedTablet
* insertAlignedTablets

### 数据删除接口

* 删除一个或多个时间序列在某个时间点前或这个时间点的数据

``` java
void deleteData(String path, long endTime)
void deleteData(List<String> paths, long endTime)
```

### 数据查询接口

* 时间序列原始数据范围查询：
  - 指定的查询时间范围为左闭右开区间，包含开始时间但不包含结束时间。

``` java
SessionDataSet executeRawDataQuery(List<String> paths, long startTime, long endTime);
```

* 最新点查询：
  - 查询最后一条时间戳大于等于某个时间点的数据。
  ``` java
  SessionDataSet executeLastDataQuery(List<String> paths, long lastTime);
  ```
  - 快速查询单设备下指定序列最新点，支持重定向；如果您确认使用的查询路径是合法的，可将`isLegalPathNodes`置为true以避免路径校验带来的性能损失。
  ``` java
  SessionDataSet executeLastDataQueryForOneDevice(
      String db, String device, List<String> sensors, boolean isLegalPathNodes);
  ```

* 聚合查询：
  - 支持指定查询时间范围。指定的查询时间范围为左闭右开区间，包含开始时间但不包含结束时间。
  - 支持按照时间区间分段查询。

``` java
SessionDataSet executeAggregationQuery(List<String> paths, List<Aggregation> aggregations);

SessionDataSet executeAggregationQuery(
    List<String> paths, List<Aggregation> aggregations, long startTime, long endTime);

SessionDataSet executeAggregationQuery(
    List<String> paths,
    List<Aggregation> aggregations,
    long startTime,
    long endTime,
    long interval);

SessionDataSet executeAggregationQuery(
    List<String> paths,
    List<Aggregation> aggregations,
    long startTime,
    long endTime,
    long interval,
    long slidingStep);
```

* 直接执行查询语句

``` java
SessionDataSet executeQueryStatement(String sql)
```

### 数据订阅

#### 1 Topic 管理

IoTDB 订阅客户端中的 `SubscriptionSession` 类提供了 Topic 管理的相关接口。Topic状态变化如下图所示：

<div align="center">
    <img src="https://alioss.timecho.com/docs/img/Data_sub_03.png" alt="" style="width: 60%;"/>
</div>

##### 1.1 创建 Topic

```Java
 void createTopicIfNotExists(String topicName, Properties properties) throws Exception;
```

示例：

```Java
try (final SubscriptionSession session = new SubscriptionSession(host, port)) {
  session.open();
  final Properties config = new Properties();
  config.put(TopicConstant.PATH_KEY, "root.db.**");
  session.createTopic(topicName, config);
}
```

##### 1.2 删除 Topic

```Java
void dropTopicIfExists(String topicName) throws Exception;
```

##### 1.3 查看 Topic

```Java
// 获取所有 topics
Set<Topic> getTopics() throws Exception;

// 获取单个 topic
Optional<Topic> getTopic(String topicName) throws Exception;
```

#### 2 查看订阅状态

IoTDB 订阅客户端中的 `SubscriptionSession` 类提供了获取订阅状态的相关接口：

```Java
Set<Subscription> getSubscriptions() throws Exception;
Set<Subscription> getSubscriptions(final String topicName) throws Exception;
```

#### 3 创建 Consumer

在使用 JAVA 原生接口创建 consumer 时，需要指定 consumer 所应用的参数。

对于 `SubscriptionPullConsumer` 和 `SubscriptionPushConsumer` 而言，有以下公共配置：

| 参数                                          | 是否必填（默认值）                 | 参数含义                                                     |
| :-------------------------------------------- | :--------------------------------- | :----------------------------------------------------------- |
| host                    | optional: 127.0.0.1                                          | `String`: IoTDB 中某 DataNode 的 RPC host                      |
| port                    | optional: 6667                                               | `Integer`: IoTDB 中某 DataNode 的 RPC port                     |
| node-urls               | optional: 127.0.0.1:6667                                     | `List<String>`: IoTDB 中所有 DataNode 的 RPC 地址，可以是多个；host:port 和 node-urls 选填一个即可。当 host:port 和 node-urls 都填写了，则取 host:port 和 node-urls 的**并集**构成新的 node-urls 应用 |
| username                | optional: root                                               | `String`: IoTDB 中 DataNode 的用户名                           |
| password                | optional: root                                               | `String`: IoTDB 中 DataNode 的密码                             |
| groupId                 | optional                                                     | `String`: consumer group id，若未指定则随机分配（新的 consumer group），保证不同的 consumer group 对应的 consumer group id 均不相同 |
| consumerId              | optional                                                     | `String`: consumer client id，若未指定则随机分配，保证同一个 consumer group 中每一个 consumer client id 均不相同 |
| heartbeatIntervalMs     | optional: 30000 (min: 1000)                                  | `Long`: consumer 向 IoTDB DataNode 定期发送心跳请求的间隔      |
| endpointsSyncIntervalMs | optional: 120000 (min: 5000)                                 | `Long`: consumer 探测 IoTDB 集群节点扩缩容情况调整订阅连接的间隔 |
| fileSaveDir             | optional: Paths.get(System.getProperty("user.dir"), "iotdb-subscription").toString() | `String`: consumer 订阅出的 TsFile 文件临时存放的目录路径      |
| fileSaveFsync           | optional: false                                              | `Boolean`: consumer 订阅 TsFile 的过程中是否主动调用 fsync     |


##### 3.1 SubscriptionPushConsumer

以下为 `SubscriptionPushConsumer` 中的特殊配置：
| 参数                                          | 是否必填（默认值）                 | 参数含义                                                     |
| :-------------------------------------------- | :--------------------------------- | :----------------------------------------------------------- |
| ackStrategy        | optional: `ACKStrategy.AFTER_CONSUME` | 消费进度的确认机制包含以下选项：`ACKStrategy.BEFORE_CONSUME`（当 consumer 收到数据时立刻提交消费进度，`onReceive` 前）`ACKStrategy.AFTER_CONSUME`（当 consumer 消费完数据再去提交消费进度，`onReceive` 后） |
| consumeListener    | optional                              | 消费数据的回调函数，需实现 `ConsumeListener` 接口，定义消费 `SessionDataSetsHandler` 和 `TsFileHandler` 形式数据的处理逻辑 |
| autoPollIntervalMs | optional: 5000 (min: 500)             | Long: consumer 自动拉取数据的时间间隔，单位为**毫秒**        |
| autoPollTimeoutMs  | optional: 10000 (min: 1000)           | Long: consumer 每次拉取数据的超时时间，单位为**毫秒**        |

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

##### 3.2 SubscriptionPullConsumer

以下为 `SubscriptionPullConsumer` 中的特殊配置：

| 参数                                          | 是否必填（默认值）                 | 参数含义                                                     |
| :-------------------------------------------- | :--------------------------------- | :----------------------------------------------------------- |
| autoCommit         | optional: true                        | Boolean: 是否自动提交消费进度如果此参数设置为 false，则需要调用 `commit` 方法来手动提交消费进度 |
| autoCommitInterval | optional: 5000 (min: 500)             | Long: 自动提交消费进度的时间间隔，单位为**毫秒**仅当 autoCommit 参数为 true 的时候才会生效 |

在创建 consumer 后，需要手动调用 consumer 的 open 方法：

```Java
void open() throws Exception;
```

此时，IoTDB 订阅客户端才会校验 consumer 的配置正确性，在校验成功后 consumer 就会加入对应的 consumer group。也就是说，在打开 consumer 后，才可以使用返回的 consumer 对象进行订阅 Topic，消费数据等操作。

#### 4 订阅 Topic

`SubscriptionPushConsumer` 和 `SubscriptionPullConsumer` 提供了下述 JAVA 原生接口用于订阅 Topics:

```Java
// 订阅 topics
void subscribe(String topic) throws Exception;
void subscribe(List<String> topics) throws Exception;
```

- 在 consumer 订阅 topic 前，topic 必须已经被创建，否则订阅会失败
- 一个 consumer 在已经订阅了某个 topic 的情况下再次订阅这个 topic，不会报错
- 如果该 consumer 所在的 consumer group 中已经有 consumers 订阅了相同的 topics，那么该 consumer 将会复用对应的消费进度

#### 5 消费数据

无论是 push 模式还是 pull 模式的 consumer：

- 只有显式订阅了某个 topic，才会收到对应 topic 的数据
- 若在创建后没有订阅任何 topics，此时该 consumer 无法消费到任何数据，即使该 consumer 所在的 consumer group 中其它的 consumers 订阅了一些 topics

##### 5.1 SubscriptionPushConsumer

SubscriptionPushConsumer 在订阅 topics 后，无需手动拉取数据，其消费数据的逻辑在创建 SubscriptionPushConsumer 指定的 `consumeListener` 配置中。

##### 5.2 SubscriptionPullConsumer

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

#### 6 取消订阅

`SubscriptionPushConsumer` 和 `SubscriptionPullConsumer` 提供了下述 JAVA 原生接口用于取消订阅并关闭 consumer:

```Java
// 取消订阅 topics
void unsubscribe(String topic) throws Exception;
void unsubscribe(List<String> topics) throws Exception;

// 关闭 consumer
void close();
```

- 在 topic 存在的情况下，如果一个 consumer 在没有订阅了某个 topic 的情况下取消订阅某个 topic，不会报错
- consumer close 时会退出对应的 consumer group，同时自动 unsubscribe 该 consumer 现存订阅的所有 topics
- consumer 在 close 后生命周期即结束，无法再重新 open 订阅并消费数据

#### 7 代码示例

##### 7.1 单 Pull Consumer 消费 SessionDataSetsHandler 形式的数据

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

##### 7.2 多 Push Consumer 消费 TsFileHandler 形式的数据

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


### 其他功能（直接执行SQL语句）

``` java
void executeNonQueryStatement(String sql)
```

### 写入测试接口 (用于分析网络带宽)

不实际写入数据，只将数据传输到 server 即返回

* 测试 insertRecord

``` java
void testInsertRecord(String deviceId, long time, List<String> measurements, List<String> values)

void testInsertRecord(String deviceId, long time, List<String> measurements,
        List<TSDataType> types, List<Object> values)
```

* 测试 testInsertRecords

``` java
void testInsertRecords(List<String> deviceIds, List<Long> times,
        List<List<String>> measurementsList, List<List<String>> valuesList)

void testInsertRecords(List<String> deviceIds, List<Long> times,
        List<List<String>> measurementsList, List<List<TSDataType>> typesList,
        List<List<Object>> valuesList)
```

* 测试 insertTablet

``` java
void testInsertTablet(Tablet tablet)
```

* 测试 insertTablets

``` java
void testInsertTablets(Map<String, Tablet> tablets)
```

### 示例代码

浏览上述接口的详细信息，请参阅代码 ```session/src/main/java/org/apache/iotdb/session/Session.java```

使用上述接口的示例代码在 ```example/session/src/main/java/org/apache/iotdb/SessionExample.java```

使用对齐时间序列和元数据模板的示例可以参见 `example/session/src/main/java/org/apache/iotdb/AlignedTimeseriesSessionExample.java`