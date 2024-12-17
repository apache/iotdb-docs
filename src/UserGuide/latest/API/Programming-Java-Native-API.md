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

# Java Native API

## Installation

### Dependencies

- JDK >= 1.8
- Maven >= 3.6

### Using IoTDB Java Native API with Maven

```xml
<dependencies>
    <dependency>
      <groupId>org.apache.iotdb</groupId>
      <artifactId>iotdb-session</artifactId>
      <version>1.0.0</version>
    </dependency>
</dependencies>
```

## Syntax Convention

- **IoTDB-SQL interface:** The input SQL parameter needs to conform to the [syntax conventions](../User-Manual/Syntax-Rule.md#Literal-Values) and be escaped for JAVA strings. For example, you need to add a backslash before the double-quotes. (That is: after JAVA escaping, it is consistent with the SQL statement executed on the command line.)
- **Other interfaces:**
  - The node names in path or path prefix as parameter: The node names which should be escaped by backticks (`) in the SQL statement, escaping is required here.
  - Identifiers (such as template names) as parameters: The identifiers which should be escaped by backticks (`) in the SQL statement, and escaping is not required here.
- **Code example for syntax convention could be found at:** `example/session/src/main/java/org/apache/iotdb/SyntaxConventionRelatedExample.java`

## Native APIs

Here we show the commonly used interfaces and their parameters in the Native API:

### Session Management

- Initialize a Session

```java
// use default configuration
session = new Session.Builder.build();

// initialize with a single node
session =
    new Session.Builder()
        .host(String host)
        .port(int port)
        .build();

// initialize with multiple nodes
session =
    new Session.Builder()
        .nodeUrls(List<String> nodeUrls)
        .build();

// other configurations
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

Version represents the SQL semantic version used by the client, which is used to be compatible with the SQL semantics of 0.12 when upgrading 0.13. The possible values are: `V_0_12`, `V_0_13`, `V_1_0`, etc.

- Open a Session

```java
void open()
```

- Open a session, with a parameter to specify whether to enable RPC compression

```java
void open(boolean enableRPCCompression)
```

Notice: this RPC compression status of client must comply with that of IoTDB server

- Close a Session

```java
void close()
```

- SessionPool

We provide a connection pool (`SessionPool) for Native API.
Using the interface, you need to define the pool size.

If you can not get a session connection in 60 seconds, there is a warning log but the program will hang.

If a session has finished an operation, it will be put back to the pool automatically.
If a session connection is broken, the session will be removed automatically and the pool will try
to create a new session and redo the operation.
You can also specify an url list of multiple reachable nodes when creating a SessionPool, just as you would when creating a Session. To ensure high availability of clients in distributed cluster.

For query operations:

1. When using SessionPool to query data, the result set is `SessionDataSetWrapper`;
2. Given a `SessionDataSetWrapper`, if you have not scanned all the data in it and stop to use it,
   you have to call `SessionPool.closeResultSet(wrapper)` manually;
3. When you call `hasNext()` and `next()` of a `SessionDataSetWrapper` and there is an exception, then
   you have to call `SessionPool.closeResultSet(wrapper)` manually;
4. You can call `getColumnNames()` of `SessionDataSetWrapper` to get the column names of query result;

Examples: `session/src/test/java/org/apache/iotdb/session/pool/SessionPoolTest.java`

Or `example/session/src/main/java/org/apache/iotdb/SessionPoolExample.java`

### Database & Timeseries Management API

#### Database Management

- CREATE DATABASE

```java
void setStorageGroup(String storageGroupId)
```

- Delete one or several databases

```java
void deleteStorageGroup(String storageGroup)
void deleteStorageGroups(List<String> storageGroups)
```

#### Timeseries Management

- Create one or multiple timeseries

```java
void createTimeseries(String path, TSDataType dataType,
      TSEncoding encoding, CompressionType compressor, Map<String, String> props,
      Map<String, String> tags, Map<String, String> attributes, String measurementAlias)

void createMultiTimeseries(List<String> paths, List<TSDataType> dataTypes,
      List<TSEncoding> encodings, List<CompressionType> compressors,
      List<Map<String, String>> propsList, List<Map<String, String>> tagsList,
      List<Map<String, String>> attributesList, List<String> measurementAliasList)
```

- Create aligned timeseries

```java
void createAlignedTimeseries(String prefixPath, List<String> measurements,
      List<TSDataType> dataTypes, List<TSEncoding> encodings,
      List <CompressionType> compressors, List<String> measurementAliasList);
```

Attention: Alias of measurements are **not supported** currently.

- Delete one or several timeseries

```java
void deleteTimeseries(String path)
void deleteTimeseries(List<String> paths)
```

- Check whether the specific timeseries exists.

```java
boolean checkTimeseriesExists(String path)
```

#### Schema Template

Create a schema template for massive identical devices will help to improve memory performance. You can use Template, InternalNode and MeasurementNode to depict the structure of the template, and use belowed interface to create it inside session.

```java
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

We strongly suggest you implement templates only with flat-measurement (like object 'flatTemplate' in belowed snippet), since tree-structured template may not be a long-term supported feature in further version of IoTDB.

A snippet of using above Method and Class：

```java
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

You can query measurement inside templates with these APIS:

```java
// Return the amount of measurements inside a template
public int countMeasurementsInTemplate(String templateName);

// Return true if path points to a measurement, otherwise returne false
public boolean isMeasurementInTemplate(String templateName, String path);

// Return true if path exists in template, otherwise return false
public boolean isPathExistInTemplate(String templateName, String path);

// Return all measurements paths inside template
public List<String> showMeasurementsInTemplate(String templateName);

// Return all measurements paths under the designated patter inside template
public List<String> showMeasurementsInTemplate(String templateName, String pattern);
```

To implement schema template, you can set the measurement template named 'templateName' at path 'prefixPath'.

**Please notice that, we strongly recommend not setting templates on the nodes above the database to accommodate future updates and collaboration between modules.**

```java
void setSchemaTemplate(String templateName, String prefixPath)
```

Before setting template, you should firstly create the template using

```java
void createSchemaTemplate(Template template)
```

After setting template to a certain path, you can use the template to create timeseries on given device paths through the following interface, or you can write data directly to trigger timeseries auto creation using schema template under target devices.

```java
void createTimeseriesUsingSchemaTemplate(List<String> devicePathList)
```

After setting template to a certain path, you can query for info about template using belowed interface in session:

```java
/** @return All template names. */
public List<String> showAllTemplates();

/** @return All paths have been set to designated template. */
public List<String> showPathsTemplateSetOn(String templateName);

/** @return All paths are using designated template. */
public List<String> showPathsTemplateUsingOn(String templateName)
```

If you are ready to get rid of schema template, you can drop it with belowed interface. Make sure the template to drop has been unset from MTree.

```java
void unsetSchemaTemplate(String prefixPath, String templateName);
public void dropSchemaTemplate(String templateName);
```

Unset the measurement template named 'templateName' from path 'prefixPath'. When you issue this interface, you should assure that there is a template named 'templateName' set at the path 'prefixPath'.

Attention: Unsetting the template named 'templateName' from node at path 'prefixPath' or descendant nodes which have already inserted records using template is **not supported**.

### Data Manipulation Interface (DML Interface)

### Data Insert API

It is recommended to use insertTablet to help improve write efficiency.

- Insert a Tablet，which is multiple rows of a device, each row has the same measurements
  - **Better Write Performance**
  - **Support batch write**
  - **Support null values**: fill the null value with any value, and then mark the null value via BitMap

```java
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

- Insert multiple Tablets

```java
void insertTablets(Map<String, Tablet> tablet)
```

- Insert a Record, which contains multiple measurement value of a device at a timestamp. This method is equivalent to providing a common interface for multiple data types of values. Later, the value can be cast to the original type through TSDataType.

  The correspondence between the Object type and the TSDataType type is shown in the following table.

  | TSDataType | Object         |
  | ---------- | -------------- |
  | BOOLEAN    | Boolean        |
  | INT32      | Integer        |
  | DATE       | LocalDate      |
  | INT64      | Long           |
  | TIMESTAMP  | Long           |
  | FLOAT      | Float          |
  | DOUBLE     | Double         |
  | TEXT       | String, Binary |
  | STRING     | String, Binary |
  | BLOB       | Binary         |

```java
void insertRecord(String deviceId, long time, List<String> measurements,
   List<TSDataType> types, List<Object> values)
```

- Insert multiple Records

```java
void insertRecords(List<String> deviceIds, List<Long> times,
    List<List<String>> measurementsList, List<List<TSDataType>> typesList,
    List<List<Object>> valuesList)
```

- Insert multiple Records that belong to the same device.
  With type info the server has no need to do type inference, which leads a better performance

```java
void insertRecordsOfOneDevice(String deviceId, List<Long> times,
    List<List<String>> measurementsList, List<List<TSDataType>> typesList,
    List<List<Object>> valuesList)
```

#### Insert with type inference

When the data is of String type, we can use the following interface to perform type inference based on the value of the value itself. For example, if value is "true" , it can be automatically inferred to be a boolean type. If value is "3.2" , it can be automatically inferred as a flout type. Without type information, server has to do type inference, which may cost some time.

- Insert a Record, which contains multiple measurement value of a device at a timestamp

```java
void insertRecord(String prefixPath, long time, List<String> measurements, List<String> values)
```

- Insert multiple Records

```java
void insertRecords(List<String> deviceIds, List<Long> times,
   List<List<String>> measurementsList, List<List<String>> valuesList)
```

- Insert multiple Records that belong to the same device.

```java
void insertStringRecordsOfOneDevice(String deviceId, List<Long> times,
        List<List<String>> measurementsList, List<List<String>> valuesList)
```

#### Insert of Aligned Timeseries

The Insert of aligned timeseries uses interfaces like insertAlignedXXX, and others are similar to the above interfaces:

- insertAlignedRecord
- insertAlignedRecords
- insertAlignedRecordsOfOneDevice
- insertAlignedStringRecordsOfOneDevice
- insertAlignedTablet
- insertAlignedTablets

### Data Delete API

- Delete data before or equal to a timestamp of one or several timeseries

```java
void deleteData(String path, long time)
void deleteData(List<String> paths, long time)
```

### Data Query API

- Time-series raw data query with time range:
  - The specified query time range is a left-closed right-open interval, including the start time but excluding the end time.

```java
SessionDataSet executeRawDataQuery(List<String> paths, long startTime, long endTime);
```

- Last query:

  - Query the last data, whose timestamp is greater than or equal LastTime.

    ```java
    SessionDataSet executeLastDataQuery(List<String> paths, long LastTime);
    ```

  - Query the latest point of the specified series of single device quickly, and support redirection;
    If you are sure that the query path is valid, set 'isLegalPathNodes' to true to avoid performance penalties from path verification.

    ```java
    SessionDataSet executeLastDataQueryForOneDevice(
        String db, String device, List<String> sensors, boolean isLegalPathNodes);
    ```

- Aggregation query:
  - Support specified query time range: The specified query time range is a left-closed right-open interval, including the start time but not the end time.
  - Support GROUP BY TIME.

```java
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

- Execute query statement

```java
SessionDataSet executeQueryStatement(String sql)
```

### Data Subscription

#### 1 Topic Management

The `SubscriptionSession` class in the IoTDB subscription client provides interfaces for topic management. The status changes of topics are illustrated in the diagram below:

::: center

<img src="https://alioss.timecho.com/docs/img/Data_sub_04.png" alt="" style="width: 60%;"/>

:::

##### 1.1 Create Topic

```Java
 void createTopicIfNotExists(String topicName, Properties properties) throws Exception;
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

##### 1.2 Delete Topic

```Java
void dropTopicIfExists(String topicName) throws Exception;
```

##### 1.3 View Topic

```Java
// Get all topics
Set<Topic> getTopics() throws Exception;

// Get a specific topic
Optional<Topic> getTopic(String topicName) throws Exception;
```

#### 2 Check Subscription Status

The `SubscriptionSession` class in the IoTDB subscription client provides interfaces to check the subscription status:

```Java
Set<Subscription> getSubscriptions() throws Exception;
Set<Subscription> getSubscriptions(final String topicName) throws Exception;
```

#### 3 Create Consumer

When creating a consumer using the JAVA native interface, you need to specify the parameters applied to the consumer.

For both `SubscriptionPullConsumer` and `SubscriptionPushConsumer`, the following common configurations are available:

| key                     | **required or optional with default**                                                | description                                                                                                                                                                                                                                                        |
| :---------------------- | :----------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| host                    | optional: 127.0.0.1                                                                  | `String`: The RPC host of a certain DataNode in IoTDB                                                                                                                                                                                                              |
| port                    | optional: 6667                                                                       | Integer: The RPC port of a certain DataNode in IoTDB                                                                                                                                                                                                               |
| node-urls               | optional: 127.0.0.1:6667                                                             | `List<String>`: The RPC addresses of all DataNodes in IoTDB, can be multiple; either host:port or node-urls can be filled in. If both host:port and node-urls are filled in, the union of host:port and node-urls will be used to form a new node-urls application |
| username                | optional: root                                                                       | `String`: The username of a DataNode in IoTDB                                                                                                                                                                                                                      |
| password                | optional: root                                                                       | `String`: The password of a DataNode in IoTDB                                                                                                                                                                                                                      |
| groupId                 | optional                                                                             | `String`: consumer group id, if not specified, a new consumer group will be randomly assigned, ensuring that different consumer groups have different consumer group ids                                                                                           |
| consumerId              | optional                                                                             | `String`: consumer client id, if not specified, it will be randomly assigned, ensuring that each consumer client id in the same consumer group is unique                                                                                                           |
| heartbeatIntervalMs     | optional: 30000 (min: 1000)                                                          | `Long`: The interval at which the consumer sends heartbeat requests to the IoTDB DataNode                                                                                                                                                                          |
| endpointsSyncIntervalMs | optional: 120000 (min: 5000)                                                         | `Long`: The interval at which the consumer detects the expansion and contraction of IoTDB cluster nodes and adjusts the subscription connection                                                                                                                    |
| fileSaveDir             | optional: Paths.get(System.getProperty("user.dir"), "iotdb-subscription").toString() | `String`: The temporary directory path where the TsFile files subscribed by the consumer are stored                                                                                                                                                                |
| fileSaveFsync           | optional: false                                                                      | `Boolean`: Whether the consumer actively calls fsync during the subscription of TsFile                                                                                                                                                                             |

##### 3.1 SubscriptionPushConsumer

The following are special configurations for `SubscriptionPushConsumer`:

| key                | **required or optional with default** | description                                                                                                                                                                                                                                                                                                                  |
| :----------------- | :------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ackStrategy        | optional: `ACKStrategy.AFTER_CONSUME` | Consumption progress confirmation mechanism includes the following options: `ACKStrategy.BEFORE_CONSUME` (submit consumption progress immediately when the consumer receives data, before `onReceive`) `ACKStrategy.AFTER_CONSUME` (submit consumption progress after the consumer has consumed the data, after `onReceive`) |
| consumeListener    | optional                              | Consumption data callback function, need to implement the `ConsumeListener` interface, define the consumption logic of `SessionDataSetsHandler` and `TsFileHandler` form data                                                                                                                                                |
| autoPollIntervalMs | optional: 5000 (min: 500)             | Long: The interval at which the consumer automatically pulls data, in ms                                                                                                                                                                                                                                                     |
| autoPollTimeoutMs  | optional: 10000 (min: 1000)           | Long: The timeout time for the consumer to pull data each time, in ms                                                                                                                                                                                                                                                        |

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

##### 3.2 SubscriptionPullConsumer

The following are special configurations for `SubscriptionPullConsumer` :

| key                | **required or optional with default** | description                                                                                                                                                                   |
| :----------------- | :------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| autoCommit         | optional: true                        | Boolean: Whether to automatically commit consumption progress. If this parameter is set to false, the commit method must be called to manually `commit` consumption progress. |
| autoCommitInterval | optional: 5000 (min: 500)             | Long: The interval at which consumption progress is automatically committed, in milliseconds. This only takes effect when the autoCommit parameter is true.                   |
|                    |

After creating a consumer, you need to manually call the consumer's open method:

```Java
void open() throws Exception;
```

At this point, the IoTDB subscription client will verify the correctness of the consumer's configuration. After a successful verification, the consumer will join the corresponding consumer group. That is, only after opening the consumer can you use the returned consumer object to subscribe to topics, consume data, and perform other operations.

#### 4 Subscribe to Topics

Both `SubscriptionPushConsumer` and `SubscriptionPullConsumer` provide the following JAVA native interfaces for subscribing to topics:

```Java
// Subscribe to topics
void subscribe(String topic) throws Exception;
void subscribe(List<String> topics) throws Exception;
```

- Before a consumer subscribes to a topic, the topic must have been created, otherwise, the subscription will fail.

- If a consumer subscribes to a topic that it has already subscribed to, no error will occur.

- If there are other consumers in the same consumer group that have subscribed to the same topics, the consumer will reuse the corresponding consumption progress.

#### 5 Consume Data

For both push and pull mode consumers:

- Only after explicitly subscribing to a topic will the consumer receive data for that topic.

- If no topics are subscribed to after creation, the consumer will not be able to consume any data, even if other consumers in the same consumer group have subscribed to some topics.

##### 5.1 SubscriptionPushConsumer

After `SubscriptionPushConsumer` subscribes to topics, there is no need to manually pull data.

The data consumption logic is within the `consumeListener` configuration specified when creating `SubscriptionPushConsumer`.

##### 5.2 SubscriptionPullConsumer

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

#### 6 Unsubscribe

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

#### 7 Code Examples

##### 7.1 Single Pull Consumer Consuming SessionDataSetsHandler Format Data

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

##### 7.2 Multiple Push Consumers Consuming TsFileHandler Format Data

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
              // block the consumer main thread
              Thread.sleep(Long.MAX_VALUE);
            } catch (final IOException | InterruptedException e) {
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

### Other Modules (Execute SQL Directly)

- Execute non query statement

```java
void executeNonQueryStatement(String sql)
```

### Write Test Interface (to profile network cost)

These methods **don't** insert data into database and server just return after accept the request.

- Test the network and client cost of insertRecord

```java
void testInsertRecord(String deviceId, long time, List<String> measurements, List<String> values)

void testInsertRecord(String deviceId, long time, List<String> measurements,
        List<TSDataType> types, List<Object> values)
```

- Test the network and client cost of insertRecords

```java
void testInsertRecords(List<String> deviceIds, List<Long> times,
        List<List<String>> measurementsList, List<List<String>> valuesList)

void testInsertRecords(List<String> deviceIds, List<Long> times,
        List<List<String>> measurementsList, List<List<TSDataType>> typesList
        List<List<Object>> valuesList)
```

- Test the network and client cost of insertTablet

```java
void testInsertTablet(Tablet tablet)
```

- Test the network and client cost of insertTablets

```java
void testInsertTablets(Map<String, Tablet> tablets)
```

### Coding Examples

To get more information of the following interfaces, please view `session/src/main/java/org/apache/iotdb/session/Session.java`

The sample code of using these interfaces is in `example/session/src/main/java/org/apache/iotdb/SessionExample.java`，which provides an example of how to open an IoTDB session, execute a batch insertion.

For examples of aligned timeseries and measurement template, you can refer to `example/session/src/main/java/org/apache/iotdb/AlignedTimeseriesSessionExample.java`
