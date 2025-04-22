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


# Session原生API

IoTDB 原生 API 中的 Session 是实现与数据库交互的核心接口，它集成了丰富的方法，支持数据写入、查询以及元数据操作等功能。通过实例化 Session，能够建立与 IoTDB 服务器的连接，在该连接所构建的环境中执行各类数据库操作。Session为非线程安全，不能被多线程同时调用。

SessionPool 是 Session 的连接池，推荐使用SessionPool编程。在多线程并发的情形下，SessionPool 能够合理地管理和分配连接资源，以提升系统性能与资源利用效率。

## 1 步骤概览

1. 创建连接池实例：初始化一个SessionPool对象，用于管理多个Session实例。
2. 执行操作：直接从SessionPool中获取Session实例，并执行数据库操作，无需每次都打开和关闭连接。
3. 关闭连接池资源：在不再需要进行数据库操作时，关闭SessionPool，释放所有相关资源。

## 2 详细步骤

本章节用于说明开发的核心流程，并未演示所有的参数和接口，如需了解全部功能及参数请参见: [全量接口说明](./Programming-Java-Native-API.md#_3-全量接口说明) 或 查阅: [源码](https://github.com/apache/iotdb/tree/master/example/session/src/main/java/org/apache/iotdb)

### 2.1 创建maven项目

创建一个maven项目，并在pom.xml文件中添加以下依赖（JDK >= 1.8, Maven >= 3.6）

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

### 2.2 创建连接池实例

```java
import java.util.ArrayList;
import java.util.List;
import org.apache.iotdb.session.pool.SessionPool;

public class IoTDBSessionPoolExample {
    private static SessionPool sessionPool;

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

### 2.3 执行数据库操作

#### 2.3.1 数据写入

在工业场景中，数据写入可分为以下几类：多行数据写入、单设备多行数据写入，下面按不同场景对写入接口进行介绍。

##### 多行数据写入接口

接口说明：支持一次写入多行数据，每一行对应一个设备一个时间戳的多个测点值。


接口列表：

| 接口名称                                                     | 功能描述                                   |
| ------------------------------------------------------------ | ------------------------------------------ |
| `insertRecords(List<String> deviceIds, List<Long> times, List<List<String>> measurementsList, List<List<TSDataType>> typesList, List<List<Object>> valuesList)` | 插入多行数据，适用于不同测点独立采集的场景 |

代码案例：

```java
import java.util.ArrayList;
import java.util.List;
import org.apache.iotdb.rpc.IoTDBConnectionException;
import org.apache.iotdb.rpc.StatementExecutionException;
import org.apache.iotdb.session.pool.SessionPool;
import org.apache.tsfile.enums.TSDataType;

public class SessionPoolExample {
 private static SessionPool sessionPool;
     public static void main(String[] args) throws IoTDBConnectionException, StatementExecutionException {
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

    public static void insertRecordsExample() throws IoTDBConnectionException, StatementExecutionException {
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

##### 单设备多行数据写入接口

接口说明：支持一次写入单个设备的多行数据，每一行对应一个时间戳的多个测点值。

接口列表：

| 接口名称                      | 功能描述                                             |
| ----------------------------- | ---------------------------------------------------- |
| `insertTablet(Tablet tablet)` | 插入单个设备的多行数据，适用于不同测点独立采集的场景 |

代码案例：

```java
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import org.apache.iotdb.rpc.IoTDBConnectionException;
import org.apache.iotdb.rpc.StatementExecutionException;
import org.apache.iotdb.session.pool.SessionPool;
import org.apache.tsfile.enums.TSDataType;
import org.apache.tsfile.write.record.Tablet;
import org.apache.tsfile.write.schema.MeasurementSchema;

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

#### 2.3.2 SQL操作

SQL操作分为查询和非查询两类操作，对应的接口为`executeQuery`和`executeNonQuery`操作，其区别为前者执行的是具体的查询语句，会返回一个结果集，后者是执行的是增、删、改操作，不返回结果集。

```java
import java.util.ArrayList;
import java.util.List;
import org.apache.iotdb.isession.pool.SessionDataSetWrapper;
import org.apache.iotdb.rpc.IoTDBConnectionException;
import org.apache.iotdb.rpc.StatementExecutionException;
import org.apache.iotdb.session.pool.SessionPool;

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
        // 1. create a nonAligned time series
        sessionPool.executeNonQueryStatement("create timeseries root.test.d1.s1 with dataType = int32");
        // 2. set ttl
        sessionPool.executeNonQueryStatement("set TTL to root.test.** 10000");
        // 3. delete time series
        sessionPool.executeNonQueryStatement("delete timeseries root.test.d1.s1");
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

### 3 全量接口说明

#### 3.1 参数列表

Session具有如下的字段，可以通过构造函数或Session.Builder方式设置如下参数

| 字段名                           | 类型                                | 说明                                     |
| -------------------------------- | ----------------------------------- | ---------------------------------------- |
| `nodeUrls`                       | `List<String>`                      | 数据库节点的 URL 列表，支持多节点连接    |
| `username`                       | `String`                            | 用户名                                   |
| `password`                       | `String`                            | 密码                                     |
| `fetchSize`                      | `int`                               | 查询结果的默认批量返回大小               |
| `useSSL`                         | `boolean`                           | 是否启用 SSL                             |
| `trustStore`                     | `String`                            | 信任库路径                               |
| `trustStorePwd`                  | `String`                            | 信任库密码                               |
| `queryTimeoutInMs`               | `long`                              | 查询的超时时间，单位毫秒                 |
| `enableRPCCompression`           | `boolean`                           | 是否启用 RPC 压缩                        |
| `connectionTimeoutInMs`          | `int`                               | 连接超时时间，单位毫秒                   |
| `zoneId`                         | `ZoneId`                            | 会话的时区设置                           |
| `thriftDefaultBufferSize`        | `int`                               | Thrift 默认缓冲区大小                    |
| `thriftMaxFrameSize`             | `int`                               | Thrift 最大帧大小                        |
| `defaultEndPoint`                | `TEndPoint`                         | 默认的数据库端点信息                     |
| `defaultSessionConnection`       | `SessionConnection`                 | 默认的会话连接对象                       |
| `isClosed`                       | `boolean`                           | 当前会话是否已关闭                       |
| `enableRedirection`              | `boolean`                           | 是否启用重定向功能                       |
| `enableRecordsAutoConvertTablet` | `boolean`                           | 是否启用记录自动转换为 Tablet 的功能     |
| `deviceIdToEndpoint`             | `Map<String, TEndPoint>`            | 设备 ID 和数据库端点的映射关系           |
| `endPointToSessionConnection`    | `Map<TEndPoint, SessionConnection>` | 数据库端点和会话连接的映射关系           |
| `executorService`                | `ScheduledExecutorService`          | 用于定期更新节点列表的线程池             |
| `availableNodes`                 | `INodeSupplier`                     | 可用节点的供应器                         |
| `enableQueryRedirection`         | `boolean`                           | 是否启用查询重定向功能                   |
| `version`                        | `Version`                           | 客户端的版本号，用于与服务端的兼容性判断 |
| `enableAutoFetch`                | `boolean`                           | 是否启用自动获取功能                     |
| `maxRetryCount`                  | `int`                               | 最大重试次数                             |
| `retryIntervalInMs`              | `long`                              | 重试的间隔时间，单位毫秒                 |



#### 3.2 接口列表

##### 3.2.1 元数据管理

| 方法名                                                       | 功能描述                 | 参数解释                                                     |
| ------------------------------------------------------------ | ------------------------ | ------------------------------------------------------------ |
| `createDatabase(String database)`                            | 创建数据库               | `database`: 数据库名称                                       |
| `deleteDatabase(String database)`                            | 删除指定数据库           | `database`: 要删除的数据库名称                               |
| `deleteDatabases(List<String> databases)`                    | 批量删除数据库           | `databases`: 要删除的数据库名称列表                          |
| `createTimeseries(String path, TSDataType dataType, TSEncoding encoding, CompressionType compressor)` | 创建单个时间序列         | `path`: 时间序列路径，`dataType`: 数据类型，`encoding`: 编码类型，`compressor`: 压缩类型 |
| `createAlignedTimeseries(...)`                               | 创建对齐时间序列         | 设备ID、测点列表、数据类型列表、编码列表、压缩类型列表       |
| `createMultiTimeseries(...)`                                 | 批量创建时间序列         | 多个路径、数据类型、编码、压缩类型、属性、标签、别名等       |
| `deleteTimeseries(String path)`                              | 删除时间序列             | `path`: 要删除的时间序列路径                                 |
| `deleteTimeseries(List<String> paths)`                       | 批量删除时间序列         | `paths`: 要删除的时间序列路径列表                            |
| `setSchemaTemplate(String templateName, String prefixPath)`  | 设置模式模板             | `templateName`: 模板名称，`prefixPath`: 应用模板的路径       |
| `createSchemaTemplate(Template template)`                    | 创建模式模板             | `template`: 模板对象                                         |
| `dropSchemaTemplate(String templateName)`                    | 删除模式模板             | `templateName`: 要删除的模板名称                             |
| `addAlignedMeasurementsInTemplate(...)`                      | 添加对齐测点到模板       | 模板名称、测点路径列表、数据类型、编码类型、压缩类型         |
| `addUnalignedMeasurementsInTemplate(...)`                    | 添加非对齐测点到模板     | 同上                                                         |
| `deleteNodeInTemplate(String templateName, String path)`     | 删除模板中的节点         | `templateName`: 模板名称，`path`: 要删除的路径               |
| `countMeasurementsInTemplate(String name)`                   | 统计模板中测点数量       | `name`: 模板名称                                             |
| `isMeasurementInTemplate(String templateName, String path)`  | 检查模板中是否存在某测点 | `templateName`: 模板名称，`path`: 测点路径                   |
| `isPathExistInTemplate(String templateName, String path)`    | 检查模板中路径是否存在   | 同上                                                         |
| `showMeasurementsInTemplate(String templateName)`            | 显示模板中的测点         | `templateName`: 模板名称                                     |
| `showMeasurementsInTemplate(String templateName, String pattern)` | 按模式显示模板中的测点   | `templateName`: 模板名称，`pattern`: 匹配模式                |
| `showAllTemplates()`                                         | 显示所有模板             | 无参数                                                       |
| `showPathsTemplateSetOn(String templateName)`                | 显示模板应用的路径       | `templateName`: 模板名称                                     |
| `showPathsTemplateUsingOn(String templateName)`              | 显示模板实际使用的路径   | 同上                                                         |
| `unsetSchemaTemplate(String prefixPath, String templateName)` | 取消路径的模板设置       | `prefixPath`: 路径，`templateName`: 模板名称                 |


##### 3.2.2 数据写入

| 方法名                                                       | 功能描述                           | 参数解释                                                     |
| ------------------------------------------------------------ | ---------------------------------- | ------------------------------------------------------------ |
| `insertRecord(String deviceId, long time, List<String> measurements, List<TSDataType> types, Object... values)` | 插入单条记录                       | `deviceId`: 设备ID，`time`: 时间戳，`measurements`: 测点列表，`types`: 数据类型列表，`values`: 值列表 |
| `insertRecord(String deviceId, long time, List<String> measurements, List<String> values)` | 插入单条记录                       | `deviceId`: 设备ID，`time`: 时间戳，`measurements`: 测点列表，`values`: 值列表 |
| `insertRecords(List<String> deviceIds, List<Long> times, List<List<String>> measurementsList, List<List<Object>> valuesList)` | 插入多条记录                       | `deviceIds`: 设备ID列表，`times`: 时间戳列表，`measurementsList`: 测点列表列表，`valuesList`: 值列表 |
| `insertRecords(List<String> deviceIds, List<Long> times, List<List<String>> measurementsList, List<List<TSDataType>> typesList, List<List<Object>> valuesList)` | 插入多条记录                       | 同上，增加 `typesList`: 数据类型列表                         |
| `insertRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<TSDataType>> typesList, List<List<Object>> valuesList)` | 插入单设备的多条记录               | `deviceId`: 设备ID，`times`: 时间戳列表，`measurementsList`: 测点列表列表，`typesList`: 类型列表，`valuesList`: 值列表 |
| `insertRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<TSDataType>> typesList, List<List<Object>> valuesList, boolean haveSorted)` | 插入排序后的单设备多条记录         | 同上，增加 `haveSorted`: 数据是否已排序                      |
| `insertStringRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<String>> valuesList)` | 插入字符串格式的单设备记录         | `deviceId`: 设备ID，`times`: 时间戳列表，`measurementsList`: 测点列表，`valuesList`: 值列表 |
| `insertStringRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<String>> valuesList, boolean haveSorted)` | 插入排序的字符串格式单设备记录     | 同上，增加 `haveSorted`: 数据是否已排序                      |
| `insertAlignedRecord(String deviceId, long time, List<String> measurements, List<TSDataType> types, List<Object> values)` | 插入单条对齐记录                   | `deviceId`: 设备ID，`time`: 时间戳，`measurements`: 测点列表，`types`: 类型列表，`values`: 值列表 |
| `insertAlignedRecord(String deviceId, long time, List<String> measurements, List<String> values)` | 插入字符串格式的单条对齐记录       | `deviceId`: 设备ID，`time`: 时间戳，`measurements`: 测点列表，`values`: 值列表 |
| `insertAlignedRecords(List<String> deviceIds, List<Long> times, List<List<String>> measurementsList, List<List<Object>> valuesList)` | 插入多条对齐记录                   | `deviceIds`: 设备ID列表，`times`: 时间戳列表，`measurementsList`: 测点列表，`valuesList`: 值列表 |
| `insertAlignedRecords(List<String> deviceIds, List<Long> times, List<List<String>> measurementsList, List<List<TSDataType>> typesList, List<List<Object>> valuesList)` | 插入多条对齐记录                   | 同上，增加 `typesList`: 数据类型列表                         |
| `insertAlignedRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<TSDataType>> typesList, List<List<Object>> valuesList)` | 插入单设备的多条对齐记录           | 同上                                                         |
| `insertAlignedRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<TSDataType>> typesList, List<List<Object>> valuesList, boolean haveSorted)` | 插入排序的单设备多条对齐记录       | 同上，增加 `haveSorted`: 数据是否已排序                      |
| `insertAlignedStringRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<String>> valuesList)` | 插入字符串格式的单设备对齐记录     | `deviceId`: 设备ID，`times`: 时间戳列表，`measurementsList`: 测点列表，`valuesList`: 值列表 |
| `insertAlignedStringRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<String>> valuesList, boolean haveSorted)` | 插入排序的字符串格式单设备对齐记录 | 同上，增加 `haveSorted`: 数据是否已排序                      |
| `insertTablet(Tablet tablet)`                                | 插入单个Tablet数据                 | `tablet`: 要插入的Tablet数据                                 |
| `insertTablet(Tablet tablet, boolean sorted)`                | 插入排序的Tablet数据               | 同上，增加 `sorted`: 数据是否已排序                          |
| `insertAlignedTablet(Tablet tablet)`                         | 插入对齐的Tablet数据               | `tablet`: 要插入的Tablet数据                                 |
| `insertAlignedTablet(Tablet tablet, boolean sorted)`         | 插入排序的对齐Tablet数据           | 同上，增加 `sorted`: 数据是否已排序                          |
| `insertTablets(Map<String, Tablet> tablets)`                 | 批量插入多个Tablet数据             | `tablets`: 设备ID到Tablet的映射表                            |
| `insertTablets(Map<String, Tablet> tablets, boolean sorted)` | 批量插入排序的多个Tablet数据       | 同上，增加 `sorted`: 数据是否已排序                          |
| `insertAlignedTablets(Map<String, Tablet> tablets)`          | 批量插入多个对齐Tablet数据         | `tablets`: 设备ID到Tablet的映射表                            |
| `insertAlignedTablets(Map<String, Tablet> tablets, boolean sorted)` | 批量插入排序的多个对齐Tablet数据   | 同上，增加 `sorted`: 数据是否已排序                          |

##### 3.2.3 数据删除

| 方法名                                                       | 功能描述                     | 参数解释                                 |
| ------------------------------------------------------------ | ---------------------------- | ---------------------------------------- |
| `deleteTimeseries(String path)`                              | 删除单个时间序列             | `path`: 时间序列路径                     |
| `deleteTimeseries(List<String> paths)`                       | 批量删除时间序列             | `paths`: 时间序列路径列表                |
| `deleteData(String path, long endTime)`                      | 删除指定路径的历史数据       | `path`: 路径，`endTime`: 结束时间戳      |
| `deleteData(List<String> paths, long endTime)`               | 批量删除路径的历史数据       | `paths`: 路径列表，`endTime`: 结束时间戳 |
| `deleteData(List<String> paths, long startTime, long endTime)` | 删除路径时间范围内的历史数据 | 同上，增加 `startTime`: 起始时间戳       |


##### 3.2.4 数据查询

| 方法名                                                       | 功能描述                         | 参数解释                                                     |
| ------------------------------------------------------------ | -------------------------------- | ------------------------------------------------------------ |
| `executeQueryStatement(String sql)`                          | 执行查询语句                     | `sql`: 查询SQL语句                                           |
| `executeQueryStatement(String sql, long timeoutInMs)`        | 执行带超时的查询语句             | `sql`: 查询SQL语句，`timeoutInMs`: 查询超时时间（毫秒）      |
| `executeRawDataQuery(List<String> paths, long startTime, long endTime)` | 查询指定路径的原始数据           | `paths`: 查询路径列表，`startTime`: 起始时间戳，`endTime`: 结束时间戳 |
| `executeRawDataQuery(List<String> paths, long startTime, long endTime, long timeOut)` | 查询指定路径的原始数据（带超时） | 同上，增加 `timeOut`: 超时时间                               |
| `executeLastDataQuery(List<String> paths)`                   | 查询最新数据                     | `paths`: 查询路径列表                                        |
| `executeLastDataQuery(List<String> paths, long lastTime)`    | 查询指定时间的最新数据           | `paths`: 查询路径列表，`lastTime`: 指定的时间戳              |
| `executeLastDataQuery(List<String> paths, long lastTime, long timeOut)` | 查询指定时间的最新数据（带超时） | 同上，增加 `timeOut`: 超时时间                               |
| `executeLastDataQueryForOneDevice(String db, String device, List<String> sensors, boolean isLegalPathNodes)` | 查询单个设备的最新数据           | `db`: 数据库名，`device`: 设备名，`sensors`: 传感器列表，`isLegalPathNodes`: 是否合法路径节点 |
| `executeAggregationQuery(List<String> paths, List<TAggregationType> aggregations)` | 执行聚合查询                     | `paths`: 查询路径列表，`aggregations`: 聚合类型列表          |
| `executeAggregationQuery(List<String> paths, List<TAggregationType> aggregations, long startTime, long endTime)` | 执行带时间范围的聚合查询         | 同上，增加 `startTime`: 起始时间戳，`endTime`: 结束时间戳    |
| `executeAggregationQuery(List<String> paths, List<TAggregationType> aggregations, long startTime, long endTime, long interval)` | 执行带时间间隔的聚合查询         | 同上，增加 `interval`: 时间间隔                              |
| `executeAggregationQuery(List<String> paths, List<TAggregationType> aggregations, long startTime, long endTime, long interval, long slidingStep)` | 执行滑动窗口聚合查询             | 同上，增加 `slidingStep`: 滑动步长                           |
| `fetchAllConnections()`                                      | 获取所有活动连接信息             | 无参数                                                       |

##### 3.2.5 系统状态与备份

| 方法名                     | 功能描述               | 参数解释                               |
| -------------------------- | ---------------------- | -------------------------------------- |
| `getBackupConfiguration()` | 获取备份配置信息       | 无参数                                 |
| `fetchAllConnections()`    | 获取所有活动的连接信息 | 无参数                                 |
| `getSystemStatus()`        | 获取系统状态           | 已废弃，默认返回 `SystemStatus.NORMAL` |



