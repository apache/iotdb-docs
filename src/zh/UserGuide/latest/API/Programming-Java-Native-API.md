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

# Java编程接口

## Session原生API

IoTDB 原生 API 中的 Session 是实现与数据库交互的核心接口，它集成了丰富的方法，支持数据写入、查询以及元数据操作等功能。通过实例化 Session，能够建立与 IoTDB 服务器的连接，在该连接所构建的环境中执行各类数据库操作。

Session为单线程安全模型，如实际的应用场景为多线程并发场景，强烈推荐使用SessionPool编程。SessionPool 是 Session 的池化形式，专门针对多线程并发场景进行了优化，在多线程并发的情形下，SessionPool 能够合理地管理和分配连接资源，以提升系统性能与资源利用效率。

### 步骤概览

使用SessionPool的核心步骤：
1. 创建会话池实例：初始化一个SessionPool对象，用于管理多个Session实例。
2. 执行操作：直接从SessionPool中获取Session实例，并执行数据库操作，无需每次都打开和关闭连接。
3. 关闭会话池资源：在不再需要进行数据库操作时，关闭SessionPool，释放所有相关资源。

### 详细步骤
本章节用于说明开发的核心流程，并未演示所有的参数和接口，如需了解全部功能及参数请参见: [附录](./Programming-Java-Native-API.md#附录) 或 查阅: [源码](https://github.com/apache/iotdb/tree/master/example/session/src/main/java/org/apache/iotdb)

#### 1. 创建maven项目
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
#### 2. 创建会话实例

```java
public class IoTDBSessionExample {
    public static void main(String[] args) {
        // Using nodeUrls ensures that when one node goes down, other nodes are automatically connected to retry
        List<String> nodeUrls = new ArrayList<>();
        nodeUrls.add("127.0.0.1:6667");
        nodeUrls.add("127.0.0.1:6668");
        sessionPool =
                new SessionPool.Builder()
                        .nodeUrls(nodeUrls)
                        .user("root")
                        .password("root")
                        .maxSize(3)
                        .build();
    }
}
```

#### 执行数据库操作
##### 数据写入
在工业场景中，数据写入可以根据设备数量、写入频率和数据类型分为以下几类：多（单）设备同一时刻写入、单设备不同时刻数据（攒批）写入。业务允许的情况下，推荐攒批写入以提高写入效率。下面按不同场景对写入接口进行介绍。

###### 多（单）设备同一时刻写入
场景：多（单）个设备的实时状态或传感器数据批量写入，特点是采集一次上传一次。

适用接口：

| 接口名称                                                                                                                                                                   | 功能描述                                                                                          |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| `insertRecords(List<String> deviceIds, List<Long> times, List<List<String>> measurementsList, List<List<TSDataType>> typesList, List<List<Object>> valuesList)`        | 插入多个设备，每个设备多个测点的一个时刻的记录                                                                       |
| `insertRecords(List<String> deviceIds, List<Long> times, List<List<String>> measurementsList, List<List<String>> valuesList)`                                          |同上，不需要指定数据类型，会根据传入的值进行推断。推断规则可在服务端配置，详细配置在iotdb-system.properties.template中的搜索`infer_type`关键字 |
| `insertAlignedRecords(List<String> deviceIds, List<Long> times, List<List<String>> measurementsList, List<List<TSDataType>> typesList, List<List<Object>> valuesList)` | 插入多个设备，每个设备多个测点的一个时刻的记录。每个设备为对齐设备                                                             |
| `insertAlignedRecords(List<String> deviceIds, List<Long> times, List<List<String>> measurementsList, List<List<String>> valuesList)`                                   | 同上，不需要指定数据类型，会根据传入的值进行推断。推断规则可在服务端配置，详细配置在iotdb-system.properties.template中的搜索`infer_type`关键字 |


代码案例：
```java
public class SessionPoolExample {

    private static SessionPool sessionPool;

    public static void main(String[] args) {

        // 1. init SessionPool
        constructSessionPool();

        // 2. execute insert data
        insertRecordsExample();

        // 3. close SessionPool
        closeSessionPool();

    }

    private static void constructSessionPool() {
        // Using nodeUrls ensures that when one node goes down, other nodes are automatically connected to retry
        List<String> nodeUrls = new ArrayList<>();
        nodeUrls.add("127.0.0.1:6667");
        nodeUrls.add("127.0.0.1:6668");
        sessionPool =
                new SessionPool.Builder()
                        .nodeUrls(nodeUrls)
                        .user("root")
                        .password("root")
                        .maxSize(3)
                        .build();
    }

    public static void insertRecordsExample(){
        String deviceId = "root.sg1.d1";
        List<String> measurements = new ArrayList<>();
        measurements.add("s1");
        measurements.add("s2");
        measurements.add("s3");
        List<String> deviceIds = new ArrayList<>();
        List<List<String>> measurementsList = new ArrayList<>();
        List<List<Object>> valuesList = new ArrayList<>();
        List<Long> timestamps = new ArrayList<>();
        List<List<TSDataType>> typesList = new ArrayList<>();

        for (long time = 0; time < 500; time++) {
            List<Object> values = new ArrayList<>();
            List<TSDataType> types = new ArrayList<>();
            values.add(1L);
            values.add(2L);
            values.add(3L);
            types.add(TSDataType.INT64);
            types.add(TSDataType.INT64);
            types.add(TSDataType.INT64);

            deviceIds.add(deviceId);
            measurementsList.add(measurements);
            valuesList.add(values);
            typesList.add(types);
            timestamps.add(time);
            if (time != 0 && time % 100 == 0) {
                try {
                    sessionPool.insertRecords(deviceIds, timestamps, measurementsList, typesList, valuesList);
                } catch (IoTDBConnectionException | StatementExecutionException e) {
                    // solve exception
                }
                deviceIds.clear();
                measurementsList.clear();
                valuesList.clear();
                typesList.clear();
                timestamps.clear();
            }
        }

        try {
            sessionPool.insertRecords(deviceIds, timestamps, measurementsList, typesList, valuesList);
        } catch (IoTDBConnectionException | StatementExecutionException e) {
            // solve exception
        }
    }

    public static void closeSessionPool(){
        sessionPool.close();
    }
}
```

###### 批量数据上传
场景：多个设备的大量数据同时上传，适合大规模分布式数据接入。

适用接口：

| 接口名称                                                                                  | 功能描述                                     |
|-----------------------------------------------------------------------------------------|------------------------------------------|
| `insertTablet(Tablet tablet)`                                                          | 插入单个设备多个测点，每个测点多个时刻的数据                   |
| `insertAlignedTablet(Tablet tablet)`                                                  | 插入单个设备多个测点，每个测点多个时刻的数据，该设备为对齐设备          |

代码案例：
```java
public class SessionPoolExample {

    private static SessionPool sessionPool;

    public static void main(String[] args) throws IoTDBConnectionException, StatementExecutionException {

        // 1. init SessionPool
        constructSessionPool();

        // 2. execute insert data
        insertTabletExample();

        // 3. close SessionPool
        closeSessionPool();

    }

    private static void constructSessionPool() {
        // Using nodeUrls ensures that when one node goes down, other nodes are automatically connected to retry
        List<String> nodeUrls = new ArrayList<>();
        nodeUrls.add("127.0.0.1:6667");
        nodeUrls.add("127.0.0.1:6668");
        sessionPool =
                new SessionPool.Builder()
                        .nodeUrls(nodeUrls)
                        .user("root")
                        .password("root")
                        .maxSize(3)
                        .build();
    }

    private static void insertTabletExample() throws IoTDBConnectionException, StatementExecutionException {
        /*
         * A Tablet example:
         *      device1
         * time s1, s2, s3
         * 1,   1,  1,  1
         * 2,   2,  2,  2
         * 3,   3,  3,  3
         */
        // The schema of measurements of one device
        // only measurementId and data type in MeasurementSchema take effects in Tablet
        List<MeasurementSchema> schemaList = new ArrayList<>();
        schemaList.add(new MeasurementSchema("s1", TSDataType.INT64));
        schemaList.add(new MeasurementSchema("s2", TSDataType.INT64));
        schemaList.add(new MeasurementSchema("s3", TSDataType.INT64));

        Tablet tablet = new Tablet("root.sg.d1", schemaList, 100);

        // Method 1 to add tablet data
        long timestamp = System.currentTimeMillis();

        Random random = new Random();
        for (long row = 0; row < 100; row++) {
            int rowIndex = tablet.rowSize++;
            tablet.addTimestamp(rowIndex, timestamp);
            for (int s = 0; s < 3; s++) {
                long value = random.nextLong();
                tablet.addValue(schemaList.get(s).getMeasurementId(), rowIndex, value);
            }
            if (tablet.rowSize == tablet.getMaxRowNumber()) {
                sessionPool.insertTablet(tablet);
                tablet.reset();
            }
            timestamp++;
        }

        if (tablet.rowSize != 0) {
            sessionPool.insertTablet(tablet);
            tablet.reset();
        }
    }


    public static void closeSessionPool(){
        sessionPool.close();
    }
}
```

##### 数据查询
```java
public class SessionPoolExample {

    private static SessionPool sessionPool;

    public static void main(String[] args) throws IoTDBConnectionException, StatementExecutionException {

        // 1. init SessionPool
        constructSessionPool();

        // 2. executes a non-query SQL statement, such as a DDL or DML command.
        executeQueryExample();

        // 3. executes a query SQL statement and returns the result set.
        executeNonQueryExample();

        // 4. close SessionPool
        closeSessionPool();

    }


    private static void executeNonQueryExample() throws IoTDBConnectionException, StatementExecutionException {

        // 1. create time series
        sessionPool.executeNonQueryStatement("create timeseries root.test.d1.s1 with dataType = int32");

        // 2. set ttl
        sessionPool.executeNonQueryStatement("set TTL to root.test.** 10000");

        // 3. delete time series
        sessionPool.executeNonQueryStatement("delete timeseries root.test.d1.s1");
    }

    
    private static void executeQueryExample() throws IoTDBConnectionException, StatementExecutionException {
        // 1. execute normal query
        try(SessionDataSetWrapper wrapper = sessionPool.executeQueryStatement("select s1 from root.sg1.d1 limit 10")) {
            while (wrapper.hasNext()) {
                System.out.println(wrapper.next());
            }
        }

        // 2. execute aggregate query
        try(SessionDataSetWrapper wrapper = sessionPool.executeQueryStatement("select count(s1) from root.sg1.d1 group by ([0, 40), 5ms) ")) {
            while (wrapper.hasNext()) {
                System.out.println(wrapper.next());
            }
        }

    }

    private static void constructSessionPool() {
        // Using nodeUrls ensures that when one node goes down, other nodes are automatically connected to retry
        List<String> nodeUrls = new ArrayList<>();
        nodeUrls.add("127.0.0.1:6667");
        nodeUrls.add("127.0.0.1:6668");
        sessionPool =
                new SessionPool.Builder()
                        .nodeUrls(nodeUrls)
                        .user("root")
                        .password("root")
                        .maxSize(3)
                        .build();
    }

    public static void closeSessionPool(){
        sessionPool.close();
    }
}
```

##### 数据删除
```java
public class SessionPoolExample {

    private static SessionPool sessionPool;

    public static void main(String[] args) throws IoTDBConnectionException, StatementExecutionException {

        // 1. init SessionPool
        constructSessionPool();

        // 2. delete data
        deleteDataExample();

        // 3. close SessionPool
        closeSessionPool();

    }

    public static void deleteDataExample() throws IoTDBConnectionException, StatementExecutionException {
        // 1. Delete data at a precise point in time
        String path = "root.sg.d1.s1";
        long deleteTime = 99;
        sessionPool.deleteData(path, deleteTime);

        // 2. The data of a certain period is deleted
        long startTime = 1;
        sessionPool.deleteData(Collections.singletonList(path),startTime, deleteTime);

        // 3. Delete a measurement point
        sessionPool.deleteTimeseries(path);
    }

    private static void constructSessionPool() {
        // Using nodeUrls ensures that when one node goes down, other nodes are automatically connected to retry
        List<String> nodeUrls = new ArrayList<>();
        nodeUrls.add("127.0.0.1:6667");
        nodeUrls.add("127.0.0.1:6668");
        sessionPool =
                new SessionPool.Builder()
                        .nodeUrls(nodeUrls)
                        .user("root")
                        .password("root")
                        .maxSize(3)
                        .build();
    }

    public static void closeSessionPool(){
        sessionPool.close();
    }
}
```

## 数据订阅
IoTDB 提供了强大的数据订阅功能，允许用户通过订阅获取数据更新通知。订阅功能支持多种消费模式，包括拉取模式（Pull）和推送模式（Push）。章节旨在帮助用户理解并使用 IoTDB 的数据订阅功能。详细的功能定义及介绍：[数据订阅](../../User-Manual/Data-Sync_timecho.md#数据同步)

### 核心步骤

1. 创建Topic：创建一个Topic，Topic中包含指定的数据范围。
2. 订阅Topic：在 consumer 订阅 topic 前，topic 必须已经被创建，否则订阅会失败。如果该 consumer 所在的 consumer group 中已经有 consumers 订阅了相同的 topics，那么该 consumer 将会复用对应的消费进度。
3. 消费数据：支持Pull和Push两种消费模型。只有显式订阅了某个 topic，才会收到对应 topic 的数据。若在创建后没有订阅任何 topics，此时该 consumer 无法消费到任何数据，即使该 consumer 所在的 consumer group 中其它的 consumers 订阅了一些 topics.
4. 取消订阅： consumer close 时会退出对应的 consumer group，同时自动 unsubscribe 该 consumer 现存订阅的所有 topics. consumer 在 close 后生命周期即结束，无法再重新 open 订阅并消费数据。


### 详细步骤
本章节用于说明开发的核心流程，并未演示所有的参数和接口，如需了解全部功能及参数请参见: [附录](./Programming-Java-Native-API.md#附录)


#### 1. 创建maven项目
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

#### 2. 代码案例

```java
public class DataConsumerExample {

    public static void main(String[] args) throws IoTDBConnectionException, StatementExecutionException {
        try (SubscriptionSession session = new SubscriptionSession("127.0.0.1", 6667)) {
            // 1. open session
            session.open();

            // 2. create a topic of all data
            Properties sessionConfig = new Properties();
            sessionConfig.put(TopicConstant.PATH_KEY, "root.db.**");

            session.createTopic("allData", sessionConfig);

            // 3. show all topics
            Set<Topic> topics = session.getTopics();
            System.out.println(topics);

            // 4. show a specific topic
            Optional<Topic> allData = session.getTopic("allData");
            System.out.println(allData.get());
        }

        // 5. create a pull consumer, the subscription is automatically cancelled when the logic in the try resources is completed
        Properties consumerConfig = new Properties();
        consumerConfig.put(ConsumerConstant.CONSUMER_ID_KEY, "c1");
        consumerConfig.put(ConsumerConstant.CONSUMER_GROUP_ID_KEY, "cg1");
        try (SubscriptionPullConsumer pullConsumer = new SubscriptionPullConsumer(consumerConfig)) {
            pullConsumer.open();
            pullConsumer.subscribe("allData");
            int i = 0;
            while (i < 100) {
                List<SubscriptionMessage> messages = pullConsumer.poll(10000);
                for (SubscriptionMessage message : messages) {
                    for (SubscriptionSessionDataSet dataSet : message.getSessionDataSetsHandler()) {
                        System.out.println(dataSet.getColumnNames());
                        System.out.println(dataSet.getColumnTypes());
                        while (dataSet.hasNext()) {
                            System.out.println(dataSet.next());
                        }
                    }
                }
                i++;
            }
        }


        // 6. create a push consumer, the subscription is automatically cancelled when the logic in the try resources is completed
        try (SubscriptionPushConsumer consumer2 =
                     new SubscriptionPushConsumer.Builder().consumerId("c2").consumerGroupId("sg2")
                             .fileSaveDir(System.getProperty("java.io.tmpdir"))
                             .ackStrategy(AckStrategy.AFTER_CONSUME)
                             .consumeListener(
                                     message -> {
                                         for (SubscriptionSessionDataSet dataSet : message.getSessionDataSetsHandler()) {
                                             System.out.println(dataSet.getColumnNames());
                                             System.out.println(dataSet.getColumnTypes());
                                             while (dataSet.hasNext()) {
                                                 System.out.println(dataSet.next());
                                             }
                                         }
                                         return ConsumeResult.SUCCESS;
                                     })
                             .buildPushConsumer()) {
            consumer2.open();
            consumer2.subscribe("allData");
        }
    }
}

```

## 附录
### 参数列表
#### Session
| 字段名                        | 类型                          | 说明                                                                 |
|--------------------------------|-------------------------------|----------------------------------------------------------------------|
| `nodeUrls`                    | `List<String>`                | 数据库节点的 URL 列表，支持多节点连接                               |
| `username`                    | `String`                      | 用户名                                                              |
| `password`                    | `String`                      | 密码                                                                |
| `fetchSize`                   | `int`                         | 查询结果的默认批量返回大小                                          |
| `useSSL`                      | `boolean`                     | 是否启用 SSL                                                        |
| `trustStore`                  | `String`                      | 信任库路径                                                          |
| `trustStorePwd`               | `String`                      | 信任库密码                                                          |
| `queryTimeoutInMs`            | `long`                        | 查询的超时时间，单位毫秒                                           |
| `enableRPCCompression`        | `boolean`                     | 是否启用 RPC 压缩                                                   |
| `connectionTimeoutInMs`       | `int`                         | 连接超时时间，单位毫秒                                             |
| `zoneId`                      | `ZoneId`                      | 会话的时区设置                                                      |
| `thriftDefaultBufferSize`     | `int`                         | Thrift 默认缓冲区大小                                               |
| `thriftMaxFrameSize`          | `int`                         | Thrift 最大帧大小                                                   |
| `defaultEndPoint`             | `TEndPoint`                   | 默认的数据库端点信息                                                |
| `defaultSessionConnection`    | `SessionConnection`           | 默认的会话连接对象                                                  |
| `isClosed`                    | `boolean`                     | 当前会话是否已关闭                                                  |
| `enableRedirection`           | `boolean`                     | 是否启用重定向功能                                                  |
| `enableRecordsAutoConvertTablet` | `boolean`                  | 是否启用记录自动转换为 Tablet 的功能                                |
| `deviceIdToEndpoint`          | `Map<String, TEndPoint>`      | 设备 ID 和数据库端点的映射关系                                      |
| `endPointToSessionConnection` | `Map<TEndPoint, SessionConnection>` | 数据库端点和会话连接的映射关系                                   |
| `executorService`             | `ScheduledExecutorService`    | 用于定期更新节点列表的线程池                                        |
| `availableNodes`              | `INodeSupplier`               | 可用节点的供应器                                                    |
| `enableQueryRedirection`      | `boolean`                     | 是否启用查询重定向功能                                              |
| `version`                     | `Version`                     | 客户端的版本号，用于与服务端的兼容性判断                            |
| `enableAutoFetch`             | `boolean`                     | 是否启用自动获取功能                                                |
| `maxRetryCount`               | `int`                         | 最大重试次数                                                        |
| `retryIntervalInMs`           | `long`                        | 重试的间隔时间，单位毫秒                                            |
需要额外说明的参数

nodeUrls: 多节点 URL 列表，支持自动切换到下一个可用节点。格式为 ip:port。

queryTimeoutInMs: 如果为负数，则表示使用服务端默认配置；如果为 0，则禁用查询超时功能。

enableRPCCompression: 启用后，RPC 数据传输将启用压缩，适用于高带宽延迟场景。

zoneId: 会话时区，可用值参考 Java 的 ZoneId 标准，例如 Asia/Shanghai。

#### SessionPool
| 字段名                        | 类型                          | 说明                                                                 |
|--------------------------------|-------------------------------|----------------------------------------------------------------------|
| `host`                        | `String`                      | 数据库主机地址                                                      |
| `port`                        | `int`                         | 数据库端口                                                          |
| `user`                        | `String`                      | 数据库用户名                                                        |
| `password`                    | `String`                      | 数据库密码                                                          |
| `nodeUrls`                    | `List<String>`                | 多节点的 URL 列表                                                   |
| `maxSize`                     | `int`                         | 连接池的最大连接数                                                  |
| `fetchSize`                   | `int`                         | 查询结果的默认批量返回大小                                          |
| `waitToGetSessionTimeoutInMs` | `long`                        | 获取连接的等待超时时间（毫秒）                                      |
| `enableCompression`           | `boolean`                     | 是否启用 RPC 压缩                                                   |
| `enableRedirection`           | `boolean`                     | 是否启用重定向功能                                                  |
| `enableRecordsAutoConvertTablet` | `boolean`                  | 是否启用记录自动转换为 Tablet 的功能                                |
| `thriftDefaultBufferSize`     | `int`                         | Thrift 默认缓冲区大小                                               |
| `thriftMaxFrameSize`          | `int`                         | Thrift 最大帧大小                                                   |
| `queryTimeoutInMs`            | `long`                        | 查询超时时间，单位毫秒                                              |
| `version`                     | `Version`                     | 客户端版本号                                                        |
| `connectionTimeoutInMs`       | `int`                         | 连接超时时间，单位毫秒                                              |
| `zoneId`                      | `ZoneId`                      | 时区设置                                                            |
| `useSSL`                      | `boolean`                     | 是否启用 SSL                                                        |
| `trustStore`                  | `String`                      | 信任库路径                                                          |
| `trustStorePwd`               | `String`                      | 信任库密码                                                          |
| `enableQueryRedirection`      | `boolean`                     | 是否启用查询重定向功能                                              |
| `executorService`             | `ScheduledExecutorService`    | 定期更新节点列表的线程池                                            |
| `availableNodes`              | `INodeSupplier`               | 可用节点的供应器                                                    |
| `maxRetryCount`               | `int`                         | 最大重试次数                                                        |
| `retryIntervalInMs`           | `long`                        | 重试间隔时间，单位毫秒                                              |
| `closed`                      | `boolean`                     | 当前连接池是否已关闭                                                |
| `queue`                       | `ConcurrentLinkedDeque<ISession>` | 可用会话连接的队列                                               |
| `occupied`                    | `ConcurrentMap<ISession, ISession>` | 已占用的会话连接映射                                             |
| `deviceIdToEndpoint`          | `Map<String, TEndPoint>`      | 设备 ID 到数据库端点的映射                                          |
| `formattedNodeUrls`           | `String`                      | 格式化后的节点 URL 字符串                                           |
需要额外说明的字段

nodeUrls：一个包含多个节点地址的列表，用于支持集群环境的连接。格式为 ["host1:port1", "host2:port2"]。

queue：保存所有可用的会话连接。当需要连接时会从队列中取出。

occupied：用于记录正在被占用的连接

#### SubscriptionConsumer

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

`SubscriptionPushConsumer` 中的特殊配置：

| 参数                                          | 是否必填（默认值）                 | 参数含义                                                     |
| :-------------------------------------------- | :--------------------------------- | :----------------------------------------------------------- |
| ackStrategy        | optional: `ACKStrategy.AFTER_CONSUME` | 消费进度的确认机制包含以下选项：`ACKStrategy.BEFORE_CONSUME`（当 consumer 收到数据时立刻提交消费进度，`onReceive` 前）`ACKStrategy.AFTER_CONSUME`（当 consumer 消费完数据再去提交消费进度，`onReceive` 后） |
| consumeListener    | optional                              | 消费数据的回调函数，需实现 `ConsumeListener` 接口，定义消费 `SessionDataSetsHandler` 和 `TsFileHandler` 形式数据的处理逻辑 |
| autoPollIntervalMs | optional: 5000 (min: 500)             | Long: consumer 自动拉取数据的时间间隔，单位为**毫秒**        |
| autoPollTimeoutMs  | optional: 10000 (min: 1000)           | Long: consumer 每次拉取数据的超时时间，单位为**毫秒**        |

`SubscriptionPullConsumer` 中的特殊配置：

| 参数                                          | 是否必填（默认值）                 | 参数含义                                                     |
| :-------------------------------------------- | :--------------------------------- | :----------------------------------------------------------- |
| autoCommit         | optional: true                        | Boolean: 是否自动提交消费进度如果此参数设置为 false，则需要调用 `commit` 方法来手动提交消费进度 |
| autoCommitInterval | optional: 5000 (min: 500)             | Long: 自动提交消费进度的时间间隔，单位为**毫秒**仅当 autoCommit 参数为 true 的时候才会生效 |


### 函数列表
#### 会话管理

| 方法名                                                                                  | 功能描述                                   | 参数解释                                                                                                   |
|-----------------------------------------------------------------------------------------|--------------------------------------------|------------------------------------------------------------------------------------------------------------|
| `open()`                                                                                | 打开会话                                   | 无参数                                                                                                     |
| `open(boolean enableRPCCompression)`                                                   | 打开会话并启用RPC压缩                      | `enableRPCCompression`: 是否启用RPC压缩                                                                    |
| `open(boolean enableRPCCompression, int connectionTimeoutInMs)`                        | 打开会话并设置连接超时                     | `enableRPCCompression`: 是否启用RPC压缩，`connectionTimeoutInMs`: 连接超时时间（毫秒）                     |
| `open(boolean enableRPCCompression, int connectionTimeoutInMs, Map<String, TEndPoint> deviceIdToEndpoint, INodeSupplier nodeSupplier)` | 打开会话并配置节点                        | `enableRPCCompression`: 是否启用RPC压缩，`connectionTimeoutInMs`: 超时时间，`deviceIdToEndpoint`: 设备映射 |
| `close()`                                                                              | 关闭会话                                   | 无参数                                                                                                     |
| `getVersion()`                                                                         | 获取会话版本                               | 无参数                                                                                                     |
| `setVersion(Version version)`                                                         | 设置会话版本                               | `version`: 要设置的版本                                                                                   |
| `getTimeZone()`                                                                        | 获取当前时区                               | 无参数                                                                                                     |
| `setTimeZone(String zoneId)`                                                           | 设置时区                                   | `zoneId`: 时区标识符（例如 `Asia/Shanghai`）                                                               |
| `setTimeZoneOfSession(String zoneId)`                                                  | 设置会话时区                               | `zoneId`: 时区标识符                                                                                       |
| `getFetchSize()`                                                                       | 获取批量查询的记录数限制                   | 无参数                                                                                                     |
| `setFetchSize(int fetchSize)`                                                          | 设置批量查询的记录数限制                   | `fetchSize`: 每批查询返回的最大记录数                                                                     |
| `setQueryTimeout(long timeoutInMs)`                                                    | 设置查询超时时间                           | `timeoutInMs`: 查询的超时时间（毫秒）                                                                     |
| `getQueryTimeout()`                                                                    | 获取查询超时时间                           | 无参数                                                                                                     |
| `isEnableQueryRedirection()`                                                           | 检查是否启用查询重定向                     | 无参数                                                                                                     |
| `setEnableQueryRedirection(boolean enableQueryRedirection)`                            | 设置查询重定向                             | `enableQueryRedirection`: 是否启用查询重定向                                                              |
| `isEnableRedirection()`                                                                | 检查是否启用重定向                         | 无参数                                                                                                     |
| `setEnableRedirection(boolean enableRedirection)`                                      | 设置重定向                                 | `enableRedirection`: 是否启用重定向                                                                        |


#### 元数据管理

| 方法名                                                                                  | 功能描述                                   | 参数解释                                                                                                   |
|-----------------------------------------------------------------------------------------|--------------------------------------------|------------------------------------------------------------------------------------------------------------|
| `createDatabase(String database)`                                                     | 创建数据库                                 | `database`: 数据库名称                                                                                     |
| `deleteDatabase(String database)`                                                     | 删除指定数据库                             | `database`: 要删除的数据库名称                                                                             |
| `deleteDatabases(List<String> databases)`                                             | 批量删除数据库                             | `databases`: 要删除的数据库名称列表                                                                        |
| `createTimeseries(String path, TSDataType dataType, TSEncoding encoding, CompressionType compressor)` | 创建单个时间序列                          | `path`: 时间序列路径，`dataType`: 数据类型，`encoding`: 编码类型，`compressor`: 压缩类型                  |
| `createAlignedTimeseries(...)`                                                        | 创建对齐时间序列                          | 设备ID、测点列表、数据类型列表、编码列表、压缩类型列表                                                     |
| `createMultiTimeseries(...)`                                                          | 批量创建时间序列                          | 多个路径、数据类型、编码、压缩类型、属性、标签、别名等                                                     |
| `deleteTimeseries(String path)`                                                       | 删除时间序列                               | `path`: 要删除的时间序列路径                                                                               |
| `deleteTimeseries(List<String> paths)`                                                | 批量删除时间序列                           | `paths`: 要删除的时间序列路径列表                                                                          |
| `setSchemaTemplate(String templateName, String prefixPath)`                           | 设置模式模板                               | `templateName`: 模板名称，`prefixPath`: 应用模板的路径                                                     |
| `createSchemaTemplate(Template template)`                                             | 创建模式模板                               | `template`: 模板对象                                                                                       |
| `dropSchemaTemplate(String templateName)`                                             | 删除模式模板                               | `templateName`: 要删除的模板名称                                                                           |
| `addAlignedMeasurementsInTemplate(...)`                                               | 添加对齐测点到模板                        | 模板名称、测点路径列表、数据类型、编码类型、压缩类型                                                      |
| `addUnalignedMeasurementsInTemplate(...)`                                             | 添加非对齐测点到模板                      | 同上                                                                                                       |
| `deleteNodeInTemplate(String templateName, String path)`                              | 删除模板中的节点                          | `templateName`: 模板名称，`path`: 要删除的路径                                                             |
| `countMeasurementsInTemplate(String name)`                                            | 统计模板中测点数量                        | `name`: 模板名称                                                                                           |
| `isMeasurementInTemplate(String templateName, String path)`                           | 检查模板中是否存在某测点                  | `templateName`: 模板名称，`path`: 测点路径                                                                 |
| `isPathExistInTemplate(String templateName, String path)`                             | 检查模板中路径是否存在                    | 同上                                                                                                       |
| `showMeasurementsInTemplate(String templateName)`                                     | 显示模板中的测点                          | `templateName`: 模板名称                                                                                   |
| `showMeasurementsInTemplate(String templateName, String pattern)`                    | 按模式显示模板中的测点                    | `templateName`: 模板名称，`pattern`: 匹配模式                                                              |
| `showAllTemplates()`                                                                  | 显示所有模板                              | 无参数                                                                                                     |
| `showPathsTemplateSetOn(String templateName)`                                         | 显示模板应用的路径                        | `templateName`: 模板名称                                                                                   |
| `showPathsTemplateUsingOn(String templateName)`                                       | 显示模板实际使用的路径                    | 同上                                                                                                       |
| `unsetSchemaTemplate(String prefixPath, String templateName)`                         | 取消路径的模板设置                        | `prefixPath`: 路径，`templateName`: 模板名称                                                               |


#### 数据写入
| 方法名                                                                                  | 功能描述                                   | 参数解释                                                                                                   |
|-----------------------------------------------------------------------------------------|--------------------------------------------|------------------------------------------------------------------------------------------------------------|
| `insertRecord(String deviceId, long time, List<String> measurements, List<TSDataType> types, Object... values)` | 插入单条记录                              | `deviceId`: 设备ID，`time`: 时间戳，`measurements`: 测点列表，`types`: 数据类型列表，`values`: 值列表       |
| `insertRecord(String deviceId, long time, List<String> measurements, List<String> values)` | 插入单条记录                              | `deviceId`: 设备ID，`time`: 时间戳，`measurements`: 测点列表，`values`: 值列表                             |
| `insertRecords(List<String> deviceIds, List<Long> times, List<List<String>> measurementsList, List<List<Object>> valuesList)` | 插入多条记录                              | `deviceIds`: 设备ID列表，`times`: 时间戳列表，`measurementsList`: 测点列表列表，`valuesList`: 值列表        |
| `insertRecords(List<String> deviceIds, List<Long> times, List<List<String>> measurementsList, List<List<TSDataType>> typesList, List<List<Object>> valuesList)` | 插入多条记录                              | 同上，增加 `typesList`: 数据类型列表                                                                        |
| `insertRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<TSDataType>> typesList, List<List<Object>> valuesList)` | 插入单设备的多条记录                     | `deviceId`: 设备ID，`times`: 时间戳列表，`measurementsList`: 测点列表列表，`typesList`: 类型列表，`valuesList`: 值列表 |
| `insertRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<TSDataType>> typesList, List<List<Object>> valuesList, boolean haveSorted)` | 插入排序后的单设备多条记录                | 同上，增加 `haveSorted`: 数据是否已排序                                                                    |
| `insertStringRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<String>> valuesList)` | 插入字符串格式的单设备记录               | `deviceId`: 设备ID，`times`: 时间戳列表，`measurementsList`: 测点列表，`valuesList`: 值列表                 |
| `insertStringRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<String>> valuesList, boolean haveSorted)` | 插入排序的字符串格式单设备记录           | 同上，增加 `haveSorted`: 数据是否已排序                                                                    |
| `insertAlignedRecord(String deviceId, long time, List<String> measurements, List<TSDataType> types, List<Object> values)` | 插入单条对齐记录                         | `deviceId`: 设备ID，`time`: 时间戳，`measurements`: 测点列表，`types`: 类型列表，`values`: 值列表          |
| `insertAlignedRecord(String deviceId, long time, List<String> measurements, List<String> values)` | 插入字符串格式的单条对齐记录             | `deviceId`: 设备ID，`time`: 时间戳，`measurements`: 测点列表，`values`: 值列表                             |
| `insertAlignedRecords(List<String> deviceIds, List<Long> times, List<List<String>> measurementsList, List<List<Object>> valuesList)` | 插入多条对齐记录                         | `deviceIds`: 设备ID列表，`times`: 时间戳列表，`measurementsList`: 测点列表，`valuesList`: 值列表            |
| `insertAlignedRecords(List<String> deviceIds, List<Long> times, List<List<String>> measurementsList, List<List<TSDataType>> typesList, List<List<Object>> valuesList)` | 插入多条对齐记录                         | 同上，增加 `typesList`: 数据类型列表                                                                        |
| `insertAlignedRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<TSDataType>> typesList, List<List<Object>> valuesList)` | 插入单设备的多条对齐记录                | 同上                                                                                                       |
| `insertAlignedRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<TSDataType>> typesList, List<List<Object>> valuesList, boolean haveSorted)` | 插入排序的单设备多条对齐记录            | 同上，增加 `haveSorted`: 数据是否已排序                                                                    |
| `insertAlignedStringRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<String>> valuesList)` | 插入字符串格式的单设备对齐记录           | `deviceId`: 设备ID，`times`: 时间戳列表，`measurementsList`: 测点列表，`valuesList`: 值列表                 |
| `insertAlignedStringRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<String>> valuesList, boolean haveSorted)` | 插入排序的字符串格式单设备对齐记录       | 同上，增加 `haveSorted`: 数据是否已排序                                                                    |
| `insertTablet(Tablet tablet)`                                                          | 插入单个Tablet数据                        | `tablet`: 要插入的Tablet数据                                                                              |
| `insertTablet(Tablet tablet, boolean sorted)`                                          | 插入排序的Tablet数据                      | 同上，增加 `sorted`: 数据是否已排序                                                                        |
| `insertAlignedTablet(Tablet tablet)`                                                  | 插入对齐的Tablet数据                      | `tablet`: 要插入的Tablet数据                                                                              |
| `insertAlignedTablet(Tablet tablet, boolean sorted)`                                   | 插入排序的对齐Tablet数据                  | 同上，增加 `sorted`: 数据是否已排序                                                                        |
| `insertTablets(Map<String, Tablet> tablets)`                                           | 批量插入多个Tablet数据                    | `tablets`: 设备ID到Tablet的映射表                                                                          |
| `insertTablets(Map<String, Tablet> tablets, boolean sorted)`                           | 批量插入排序的多个Tablet数据              | 同上，增加 `sorted`: 数据是否已排序                                                                        |
| `insertAlignedTablets(Map<String, Tablet> tablets)`                                    | 批量插入多个对齐Tablet数据                | `tablets`: 设备ID到Tablet的映射表                                                                          |
| `insertAlignedTablets(Map<String, Tablet> tablets, boolean sorted)`                   | 批量插入排序的多个对齐Tablet数据          | 同上，增加 `sorted`: 数据是否已排序                                                                        |

#### 数据删除

| 方法名                                                                                  | 功能描述                                   | 参数解释                                                                                                   |
|-----------------------------------------------------------------------------------------|--------------------------------------------|------------------------------------------------------------------------------------------------------------|
| `deleteTimeseries(String path)`                                                       | 删除单个时间序列                          | `path`: 时间序列路径                                                                                      |
| `deleteTimeseries(List<String> paths)`                                                | 批量删除时间序列                          | `paths`: 时间序列路径列表                                                                                  |
| `deleteData(String path, long endTime)`                                               | 删除指定路径的历史数据                    | `path`: 路径，`endTime`: 结束时间戳                                                                        |
| `deleteData(List<String> paths, long endTime)`                                        | 批量删除路径的历史数据                    | `paths`: 路径列表，`endTime`: 结束时间戳                                                                   |
| `deleteData(List<String> paths, long startTime, long endTime)`                        | 删除路径时间范围内的历史数据              | 同上，增加 `startTime`: 起始时间戳                                                                         |


#### 数据查询
| 方法名                                                                                  | 功能描述                                   | 参数解释                                                                                                   |
|-----------------------------------------------------------------------------------------|--------------------------------------------|------------------------------------------------------------------------------------------------------------|
| `executeQueryStatement(String sql)`                                                   | 执行查询语句                               | `sql`: 查询SQL语句                                                                                        |
| `executeQueryStatement(String sql, long timeoutInMs)`                                  | 执行带超时的查询语句                       | `sql`: 查询SQL语句，`timeoutInMs`: 查询超时时间（毫秒）                                                   |
| `executeRawDataQuery(List<String> paths, long startTime, long endTime)`                | 查询指定路径的原始数据                     | `paths`: 查询路径列表，`startTime`: 起始时间戳，`endTime`: 结束时间戳                                      |
| `executeRawDataQuery(List<String> paths, long startTime, long endTime, long timeOut)`  | 查询指定路径的原始数据（带超时）           | 同上，增加 `timeOut`: 超时时间                                                                            |
| `executeLastDataQuery(List<String> paths)`                                             | 查询最新数据                               | `paths`: 查询路径列表                                                                                      |
| `executeLastDataQuery(List<String> paths, long lastTime)`                              | 查询指定时间的最新数据                     | `paths`: 查询路径列表，`lastTime`: 指定的时间戳                                                           |
| `executeLastDataQuery(List<String> paths, long lastTime, long timeOut)`                | 查询指定时间的最新数据（带超时）           | 同上，增加 `timeOut`: 超时时间                                                                            |
| `executeLastDataQueryForOneDevice(String db, String device, List<String> sensors, boolean isLegalPathNodes)` | 查询单个设备的最新数据                  | `db`: 数据库名，`device`: 设备名，`sensors`: 传感器列表，`isLegalPathNodes`: 是否合法路径节点               |
| `executeAggregationQuery(List<String> paths, List<TAggregationType> aggregations)`     | 执行聚合查询                               | `paths`: 查询路径列表，`aggregations`: 聚合类型列表                                                       |
| `executeAggregationQuery(List<String> paths, List<TAggregationType> aggregations, long startTime, long endTime)` | 执行带时间范围的聚合查询               | 同上，增加 `startTime`: 起始时间戳，`endTime`: 结束时间戳                                                 |
| `executeAggregationQuery(List<String> paths, List<TAggregationType> aggregations, long startTime, long endTime, long interval)` | 执行带时间间隔的聚合查询             | 同上，增加 `interval`: 时间间隔                                                                           |
| `executeAggregationQuery(List<String> paths, List<TAggregationType> aggregations, long startTime, long endTime, long interval, long slidingStep)` | 执行滑动窗口聚合查询               | 同上，增加 `slidingStep`: 滑动步长                                                                        |
| `fetchAllConnections()`                                                               | 获取所有活动连接信息                       | 无参数                                                                                                     |

#### 系统状态与备份
| 方法名                                                                                  | 功能描述                                   | 参数解释                                                                                                   |
|-----------------------------------------------------------------------------------------|--------------------------------------------|------------------------------------------------------------------------------------------------------------|
| `getBackupConfiguration()`                                                             | 获取备份配置信息                          | 无参数                                                                                                     |
| `fetchAllConnections()`                                                               | 获取所有活动的连接信息                    | 无参数                                                                                                     |
| `getSystemStatus()`                                                                    | 获取系统状态                              | 已废弃，默认返回 `SystemStatus.NORMAL`                                                                     |

#### 数据订阅
##### SubscriptionPullConsumer

| **函数名**                          | **说明**                                                                 | **参数**                                                                                                                                                                                                                              |
|-------------------------------------|--------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `open()`                            | 打开消费者连接，启动消息消费。如果 `autoCommit` 启用，会启动自动提交工作器。 | 无                                                                                                                                                                                                                                   | 
| `close()`                           | 关闭消费者连接。如果 `autoCommit` 启用，会在关闭前提交所有未提交的消息。       | 无                                                                                                                                                                                                                                   |
| `poll(final Duration timeout)`      | 拉取消息，指定超时时间。                                                 | `timeout` : 拉取的超时时间。                                                                                                                                                                                                |
| `poll(final long timeoutMs)`        | 拉取消息，指定超时时间（毫秒）。                                         | `timeoutMs` : 超时时间，单位为毫秒。                                                                                                                                                                                            | 
| `poll(final Set<String> topicNames, final Duration timeout)` | 拉取指定主题的消息，指定超时时间。                                       | `topicNames` : 要拉取的主题集合。`timeout`: 超时时间。                                                                                                                                                      | 
| `poll(final Set<String> topicNames, final long timeoutMs)`   | 拉取指定主题的消息，指定超时时间（毫秒）。                               | `topicNames` : 要拉取的主题集合。`timeoutMs`: 超时时间，单位为毫秒。                                                                                                                                             | 
| `commitSync(final SubscriptionMessage message)`             | 同步提交单条消息。                                                      | `message` : 需要提交的消息对象。                                                                                                                                                                                | 
| `commitSync(final Iterable<SubscriptionMessage> messages)`  | 同步提交多条消息。                                                      | `messages` : 需要提交的消息集合。                                                                                                                                                                     |
| `commitAsync(final SubscriptionMessage message)`            | 异步提交单条消息。                                                      | `message` : 需要提交的消息对象。                                                                                                                                                                                |
| `commitAsync(final Iterable<SubscriptionMessage> messages)` | 异步提交多条消息。                                                      | `messages` : 需要提交的消息集合。                                                                                                                                                                     |
| `commitAsync(final SubscriptionMessage message, final AsyncCommitCallback callback)` | 异步提交单条消息并指定回调函数。                                         | `message` : 需要提交的消息对象。`callback` : 异步提交完成后的回调函数。                                                                                                                |
| `commitAsync(final Iterable<SubscriptionMessage> messages, final AsyncCommitCallback callback)` | 异步提交多条消息并指定回调函数。                                         | `messages` : 需要提交的消息集合。`callback` : 异步提交完成后的回调函数。                                                                                                     |

##### SubscriptionPushConsumer

| **函数名**                          | **说明**                                                                                           | **参数**                                                                                                                                                                              |
|-------------------------------------|----------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `open()`                            | 打开消费者连接，启动消息消费，提交自动轮询工作器。                                                  | 无                                                                                                                                                                                   | 
| `close()`                           | 关闭消费者连接，停止消息消费。                                                                      | 无                                                                                                                                                                                   | 
| `toString()`                        | 返回消费者对象的核心配置信息。                                                                      | 无                                                                                                                                                                                   |
| `coreReportMessage()`               | 获取消费者核心配置的键值对表示形式。                                                                | 无                                                                                                                                                                                   | 
| `allReportMessage()`                | 获取消费者所有配置的键值对表示形式。                                                                | 无                                                                                                                                                                                   | 
| `buildPushConsumer()`               | 通过 `Builder` 构建 `SubscriptionPushConsumer` 实例。                                               | 无                                                                                                                                                                                   |
| `ackStrategy(final AckStrategy ackStrategy)` | 配置消费者的消息确认策略。                                                                          | `ackStrategy`: 指定的消息确认策略。                                                                                                                                    | 
| `consumeListener(final ConsumeListener consumeListener)` | 配置消费者的消息消费逻辑。                                                                          | `consumeListener`: 消费者接收消息时的处理逻辑。                                                                                                                     | 
| `autoPollIntervalMs(final long autoPollIntervalMs)` | 配置自动轮询的时间间隔。                                                                             | `autoPollIntervalMs` : 自动轮询的间隔时间，单位为毫秒。                                                                                                                         | 
| `autoPollTimeoutMs(final long autoPollTimeoutMs)` | 配置自动轮询的超时时间。                                                                             | `autoPollTimeoutMs`: 自动轮询的超时时间，单位为毫秒。                                                                                                                         | 

