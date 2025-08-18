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

In the native API of IoTDB, the `Session` is the core interface for interacting with the database. It integrates a rich set of methods that support data writing, querying, and metadata operations. By instantiating a `Session`, you can establish a connection to the IoTDB server and perform various database operations within the environment constructed by this connection. The `Session` is not thread-safe and should not be called simultaneously by multiple threads.

`SessionPool` is a connection pool for `Session`, and it is recommended to use `SessionPool` for programming. In scenarios with multi-threaded concurrency, `SessionPool` can manage and allocate connection resources effectively, thereby improving system performance and resource utilization efficiency.

## 1. Overview of Steps

1. Create a Connection Pool Instance: Initialize a SessionPool object to manage multiple Session instances.
2. Perform Operations: Directly obtain a Session instance from the SessionPool and execute database operations, without the need to open and close connections each time.
3. Close Connection Pool Resources: When database operations are no longer needed, close the SessionPool to release all related resources.


## 2. Detailed Steps

This section provides an overview of the core development process and does not demonstrate all parameters and interfaces. For a complete list of functionalities and parameters, please refer to:[Java Native API](./Programming-Java-Native-API.md#_3-native-interface-description) or check the: [Source Code](https://github.com/apache/iotdb/tree/rc/2.0.1/example/session/src/main/java/org/apache/iotdb)

### 2.1 Create a Maven Project

Create a Maven project and add the following dependencies to the pom.xml file (JDK >= 1.8, Maven >= 3.6):

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

### 2.2 Creating a Connection Pool Instance


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

### 2.3 Performing Database Operations

#### 2.3.1 Data Insertion

In industrial scenarios, data insertion can be categorized into the following types: inserting multiple rows of data, and inserting multiple rows of data for a single device. Below, we introduce the insertion interfaces for different scenarios.

##### Multi-Row Data Insertion Interface

Interface Description: Supports inserting multiple rows of data at once, where each row corresponds to multiple measurement values for a device at a specific timestamp.


Interface List:

| **Interface Name**                                           | **Function Description**                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| `insertRecords(List<String> deviceIds, List<Long> times, List<List<String>> measurementsList, List<List<TSDataType>> typesList, List<List<Object>> valuesList)` | Inserts multiple rows of data, suitable for scenarios where measurements are independently collected. |

Code Example:

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

##### Single-Device Multi-Row Data Insertion Interface

Interface Description: Supports inserting multiple rows of data for a single device at once, where each row corresponds to multiple measurement values for a specific timestamp.

Interface List：

| **Interface Name**            | **Function Description**                                     |
| ----------------------------- | ------------------------------------------------------------ |
| `insertTablet(Tablet tablet)` | Inserts multiple rows of data for a single device, suitable for scenarios where measurements are independently collected. |

Code Example:

```java
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import org.apache.iotdb.rpc.IoTDBConnectionException;
import org.apache.iotdb.rpc.StatementExecutionException;
import org.apache.iotdb.session.pool.SessionPool;
import org.apache.tsfile.enums.TSDataType;
import org.apache.tsfile.write.record.Tablet;
import org.apache.tsfile.write.schema.IMeasurementSchema;
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
        //nodeUrls.add("127.0.0.1:6668");
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
        List<IMeasurementSchema> schemaList = new ArrayList<>();
        schemaList.add(new MeasurementSchema("s1", TSDataType.INT64));
        schemaList.add(new MeasurementSchema("s2", TSDataType.INT64));
        schemaList.add(new MeasurementSchema("s3", TSDataType.INT64));

        Tablet tablet = new Tablet("root.sg.d1",schemaList,100);

        // Method 1 to add tablet data
        long timestamp = System.currentTimeMillis();

        Random random = new Random();
        for (long row = 0; row < 100; row++) {
            int rowIndex = tablet.getRowSize();
            tablet.addTimestamp(rowIndex, timestamp);
            for (int s = 0; s < 3; s++) {
                long value = random.nextLong();
                tablet.addValue(schemaList.get(s).getMeasurementName(), rowIndex, value);
            }
            if (tablet.getRowSize() == tablet.getMaxRowNumber()) {
                sessionPool.insertTablet(tablet);
                tablet.reset();
            }
            timestamp++;
        }
        if (tablet.getRowSize() != 0) {
            sessionPool.insertTablet(tablet);
            tablet.reset();
        }
    }

    public static void closeSessionPool(){
        sessionPool.close();
    }
}
```

#### 2.3.2 SQL Operations

SQL operations are divided into two categories: queries and non-queries. The corresponding interfaces are executeQuery and executeNonQuery. The difference between them is that the former executes specific query statements and returns a result set, while the latter performs insert, delete, and update operations and does not return a result set.

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
    }
    
    private static void executeQueryExample() throws IoTDBConnectionException, StatementExecutionException {
        // 1. execute normal query
        try(SessionDataSetWrapper wrapper = sessionPool.executeQueryStatement("select s1 from root.sg1.d1 limit 10")) {
            // get DataIterator like JDBC
            DataIterator dataIterator = wrapper.iterator();
            System.out.println(wrapper.getColumnNames());
            System.out.println(wrapper.getColumnTypes());
            while (dataIterator.next()) {
                StringBuilder builder = new StringBuilder();
                for (String columnName : wrapper.getColumnNames()) {
                    builder.append(dataIterator.getString(columnName) + " ");
                }
                System.out.println(builder);
            }
        }
        // 2. execute aggregate query
        try(SessionDataSetWrapper wrapper = sessionPool.executeQueryStatement("select count(s1) from root.sg1.d1 group by ([0, 40), 5ms) ")) {
            // get DataIterator like JDBC
            DataIterator dataIterator = wrapper.iterator();
            System.out.println(wrapper.getColumnNames());
            System.out.println(wrapper.getColumnTypes());
            while (dataIterator.next()) {
                StringBuilder builder = new StringBuilder();
                for (String columnName : wrapper.getColumnNames()) {
                    builder.append(dataIterator.getString(columnName) + " ");
                }
                System.out.println(builder);
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

### 3. Native Interface Description

#### 3.1 Parameter List

The Session class has the following fields, which can be set through the constructor or the Session.Builder method:

| **Field Name**                   | **Type**                            | **Description**                                              |
| -------------------------------- | ----------------------------------- | ------------------------------------------------------------ |
| `nodeUrls`                       | `List<String>`                      | List of URLs for database nodes, supporting multiple node connections |
| `username`                       | `String`                            | Username                                                     |
| `password`                       | `String`                            | Password                                                     |
| `fetchSize`                      | `int`                               | Default batch size for query results                         |
| `useSSL`                         | `boolean`                           | Whether to enable SSL                                        |
| `trustStore`                     | `String`                            | Path to the trust store                                      |
| `trustStorePwd`                  | `String`                            | Password for the trust store                                 |
| `queryTimeoutInMs`               | `long`                              | Query timeout in milliseconds                                |
| `enableRPCCompression`           | `boolean`                           | Whether to enable RPC compression                            |
| `connectionTimeoutInMs`          | `int`                               | Connection timeout in milliseconds                           |
| `zoneId`                         | `ZoneId`                            | Time zone setting for the session                            |
| `thriftDefaultBufferSize`        | `int`                               | Default buffer size for Thrift Thrift                        |
| `thriftMaxFrameSize`             | `int`                               | Maximum frame size for Thrift Thrift                         |
| `defaultEndPoint`                | `TEndPoint`                         | Default database endpoint information                        |
| `defaultSessionConnection`       | `SessionConnection`                 | Default session connection object                            |
| `isClosed`                       | `boolean`                           | Whether the current session is closed                        |
| `enableRedirection`              | `boolean`                           | Whether to enable redirection                                |
| `enableRecordsAutoConvertTablet` | `boolean`                           | Whether to enable the function of recording the automatic transfer to Tablet |
| `deviceIdToEndpoint`             | `Map<String, TEndPoint>`            | Mapping of device IDs to database endpoints                  |
| `endPointToSessionConnection`    | `Map<TEndPoint, SessionConnection>` | Mapping of database endpoints to session connections         |
| `executorService`                | `ScheduledExecutorService`          | Thread pool for periodically updating the node list          |
| `availableNodes`                 | `INodeSupplier`                     | Supplier of available nodes                                  |
| `enableQueryRedirection`         | `boolean`                           | Whether to enable query redirection                          |
| `version`                        | `Version`                           | Client version number, used for compatibility judgment with the server |
| `enableAutoFetch`                | `boolean`                           | Whether to enable automatic fetching                         |
| `maxRetryCount`                  | `int`                               | Maximum number of retries                                    |
| `retryIntervalInMs`              | `long`                              | Retry interval in milliseconds                               |



#### 3.2 Interface list

##### 3.2.1 Metadata Management

| **Method Name**                                              | **Function Description**                       | **Parameter Explanation**                                    |
| ------------------------------------------------------------ | ---------------------------------------------- | ------------------------------------------------------------ |
| `createDatabase(String database)`                            | Create a database                              | `database`: The name of the database to be created           |
| `deleteDatabase(String database)`                            | Delete a specified database                    | `database`: The name of the database to be deleted           |
| `deleteDatabases(List<String> databases)`                    | Batch delete databases                         | `databases`: A list of database names to be deleted          |
| `createTimeseries(String path, TSDataType dataType, TSEncoding encoding, CompressionType compressor)` | Create a single time series                    | `path`: The path of the time series，`dataType`: The data type，`encoding`: The encoding type，`compressor`: The compression type |
| `createAlignedTimeseries(...)`                               | Create aligned time series                     | Device ID, list of measurement points, list of data types, list of encodings, list of compression types |
| `createMultiTimeseries(...)`                                 | Batch create time series                       | Multiple paths, data types, encodings, compression types, properties, tags, aliases, etc. |
| `deleteTimeseries(String path)`                              | Delete a time series                           | `path`: The path of the time series to be deleted            |
| `deleteTimeseries(List<String> paths)`                       | Batch delete time series                       | `paths`:  A list of time series paths to be deleted          |
| `setSchemaTemplate(String templateName, String prefixPath)`  | Set a schema template                          | `templateName`: The name of template，`prefixPath`: The path where the template is applied |
| `createSchemaTemplate(Template template)`                    | Create a schema template                       | `template`: The template object                              |
| `dropSchemaTemplate(String templateName)`                    | Delete a schema template                       | `templateName`: The name of template to be deleted           |
| `addAlignedMeasurementsInTemplate(...)`                      | Add aligned measurements to a template         | Template name, list of measurement paths, data type, encoding type, compression type |
| `addUnalignedMeasurementsInTemplate(...)`                    | Add unaligned measurements to a template       | Same as above                                                |
| `deleteNodeInTemplate(String templateName, String path)`     | Delete a node in a template                    | `templateName`: The name of template，`path`: The path to be deleted |
| `countMeasurementsInTemplate(String name)`                   | Count the number of measurements in a template | `name`: The name of template                                 |
| `isMeasurementInTemplate(String templateName, String path)`  | Check if a measurement exists in a template    | `templateName`: The name of template，`path`: The path of the measurement |
| `isPathExistInTemplate(String templateName, String path)`    | Check if a path exists in a template           | same as above                                                |
| `showMeasurementsInTemplate(String templateName)`            | Show measurements in a template                | `templateName`: The name of template                         |
| `showMeasurementsInTemplate(String templateName, String pattern)` | Show measurements in a template by pattern     | `templateName`: The name of template，`pattern`: The matching pattern |
| `showAllTemplates()`                                         | Show all templates                             | No parameters                                                |
| `showPathsTemplateSetOn(String templateName)`                | Show paths where a template is set             | `templateName`: The name of the template                     |
| `showPathsTemplateUsingOn(String templateName)`              | Show actual paths using a template             | Same as above上                                              |
| `unsetSchemaTemplate(String prefixPath, String templateName)` | Unset the template setting for a path          | `prefixPath`: The path，`templateName`: The name of template |


##### 3.2.2 Data Insertion

| **Method Name**                                              | **Function Description**                                     | **Parameter Explanation**                                    |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `insertRecord(String deviceId, long time, List<String> measurements, List<TSDataType> types, Object... values)` | Insert a single record                                       | `deviceId`: Device ID，`time`: Timestamp，`measurements`:  List of measurement points，`types`: List of data types，`values`: List of values |
| `insertRecord(String deviceId, long time, List<String> measurements, List<String> values)` | Insert a single record                                       | `deviceId`: Device ID，`time`: Timestamp，`measurements`: List of measurement points，`values`: List of values |
| `insertRecords(List<String> deviceIds, List<Long> times, List<List<String>> measurementsList, List<List<Object>> valuesList)` | Insert multiple records                                      | `deviceIds`: List of device IDs，`times`:  List of timestamps，`measurementsList`:  List of timestamps，`valuesList`: List of lists of values |
| `insertRecords(List<String> deviceIds, List<Long> times, List<List<String>> measurementsList, List<List<TSDataType>> typesList, List<List<Object>> valuesList)` | Insert multiple records                                      | Same as above，plus `typesList`: List of lists of data types |
| `insertRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<TSDataType>> typesList, List<List<Object>> valuesList)` | Insert multiple records for a single device                  | `deviceId`:  Device ID，`times`: List of timestamps，`measurementsList`: List of lists of measurement points，`typesList`: List of lists of types，`valuesList`: List of lists of values |
| `insertRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<TSDataType>> typesList, List<List<Object>> valuesList, boolean haveSorted)` | Insert sorted multiple records for a single device           | Same as above, plus `haveSorted`: Whether the data is already sorted |
| `insertStringRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<String>> valuesList)` | Insert string-formatted records for a single device          | `deviceId`: Device ID，`times`: List of timestamps，`measurementsList`: List of lists of measurement points，`valuesList`:  List of lists of values |
| `insertStringRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<String>> valuesList, boolean haveSorted)` | Insert sorted string-formatted records for a single device   | Same as above, plus  `haveSorted`: Whether the data is already sorted序 |
| `insertAlignedRecord(String deviceId, long time, List<String> measurements, List<TSDataType> types, List<Object> values)` | Insert a single aligned record                               | `deviceId`: Device ID，`time`: Timestamp，`measurements`: List of measurement points，`types`: List of types，`values`: List of values |
| `insertAlignedRecord(String deviceId, long time, List<String> measurements, List<String> values)` | Insert a single string-formatted aligned record              | `deviceId`: Device ID`time`: Timestamp,`measurements`: List of measurement points，`values`: List of values |
| `insertAlignedRecords(List<String> deviceIds, List<Long> times, List<List<String>> measurementsList, List<List<Object>> valuesList)` | Insert multiple aligned records                              | `deviceIds`: List of device IDs，`times`: List of timestamps，`measurementsList`:  List of lists of measurement points，`valuesList`: List of lists of values |
| `insertAlignedRecords(List<String> deviceIds, List<Long> times, List<List<String>> measurementsList, List<List<TSDataType>> typesList, List<List<Object>> valuesList)` | Insert multiple aligned records                              | Same as above, plus `typesList`: List of lists of data types |
| `insertAlignedRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<TSDataType>> typesList, List<List<Object>> valuesList)` | Insert multiple aligned records for a single device          | Same as above                                                |
| `insertAlignedRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<TSDataType>> typesList, List<List<Object>> valuesList, boolean haveSorted)` | Insert sorted multiple aligned records for a single device   | Same as above, plus  `haveSorted`: Whether the data is already sorted |
| `insertAlignedStringRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<String>> valuesList)` | Insert string-formatted aligned records for a single device  | `deviceId`: Device ID，`times`: List of timestamps，`measurementsList`: List of lists of measurement points，`valuesList`:  List of lists of values |
| `insertAlignedStringRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<String>> valuesList, boolean haveSorted)` | Insert sorted string-formatted aligned records for a single device | Same as above, plus w `haveSorted`: whether the data is already sorted |
| `insertTablet(Tablet tablet)`                                | Insert a single Tablet data                                  | `tablet`: The Tablet data to be inserted                     |
| `insertTablet(Tablet tablet, boolean sorted)`                | Insert a sorted Tablet data                                  | Same as above, plus `sorted`: whether the data is already sorted |
| `insertAlignedTablet(Tablet tablet)`                         | Insert an aligned Tablet data                                | `tablet`:  The Tablet data to be inserted                    |
| `insertAlignedTablet(Tablet tablet, boolean sorted)`         | Insert a sorted aligned Tablet data                          | Same as above, plus `sorted`: whether the data is already sorted |
| `insertTablets(Map<String, Tablet> tablets)`                 | Insert multiple Tablet data in batch                         | `tablets`: Mapping from device IDs to Tablet data            |
| `insertTablets(Map<String, Tablet> tablets, boolean sorted)` | Insert sorted multiple Tablet data in batch                  | Same as above, plus `sorted`: whether the data is already sorted |
| `insertAlignedTablets(Map<String, Tablet> tablets)`          | Insert multiple aligned Tablet data in batch                 | `tablets`: Mapping from device IDs to Tablet data            |
| `insertAlignedTablets(Map<String, Tablet> tablets, boolean sorted)` | Insert sorted multiple aligned Tablet data in batch          | Same as above, plus `sorted`: whether the data is already sorted |

##### 3.2.3 Data Deletion

| **Method Name**                                              | **Function Description**                                     | **Parameter Explanation**                               |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------- |
| `deleteTimeseries(String path)`                              | Delete a single time series                                  | `path`: The path of the time series                     |
| `deleteTimeseries(List<String> paths)`                       | Batch delete time series                                     | `paths`: A list of time series paths                    |
| `deleteData(String path, long endTime)`                      | Delete historical data for a specified path                  | `path`: The path，`endTime`: The end timestamp          |
| `deleteData(List<String> paths, long endTime)`               | Batch delete historical data for specified paths             | `paths`:  A list of paths，`endTime`: The end timestamp |
| `deleteData(List<String> paths, long startTime, long endTime)` | Delete historical data within a time range for specified paths | Same as above, plus  `startTime`: The start timestamp   |


##### 3.2.4 Data Query

| **Method Name**                                              | **Function Description**                                 | **Parameter Explanation**                                    |
| ------------------------------------------------------------ | -------------------------------------------------------- | ------------------------------------------------------------ |
| `executeQueryStatement(String sql)`                          | Execute a query statement                                | `sql`: The query SQL statement                               |
| `executeQueryStatement(String sql, long timeoutInMs)`        | Execute a query statement with timeout                   | `sql`: The query SQL statement, `timeoutInMs`: The query timeout (in milliseconds), default to the server configuration, which is 60s. |
| `executeRawDataQuery(List<String> paths, long startTime, long endTime)` | Query raw data for specified paths                       | paths: A list of query paths, `startTime`: The start timestamp, `endTime`: The end timestamp |
| `executeRawDataQuery(List<String> paths, long startTime, long endTime, long timeOut)` | Query raw data for specified paths (with timeout)        | Same as above, plus `timeOut`: The timeout time              |
| `executeLastDataQuery(List<String> paths)`                   | Query the latest data                                    | `paths`: A list of query paths                               |
| `executeLastDataQuery(List<String> paths, long lastTime)`    | Query the latest data at a specified time                | `paths`: A list of query paths, `lastTime`: The specified timestamp |
| `executeLastDataQuery(List<String> paths, long lastTime, long timeOut)` | Query the latest data at a specified time (with timeout) | Same as above, plus `timeOut`: The timeout time              |
| `executeLastDataQueryForOneDevice(String db, String device, List<String> sensors, boolean isLegalPathNodes)` | Query the latest data for a single device                | `db`: The database name, `device`: The device name, `sensors`: A list of sensors, `isLegalPathNodes`: Whether the path nodes are legal |
| `executeAggregationQuery(List<String> paths, List<TAggregationType> aggregations)` | Execute an aggregation query                             | `paths`: A list of query paths, `aggregations`: A list of aggregation types |
| `executeAggregationQuery(List<String> paths, List<TAggregationType> aggregations, long startTime, long endTime)` | Execute an aggregation query with a time range           | Same as above, plus `startTime`: The start timestamp, `endTime`:` The end timestamp |
| `executeAggregationQuery(List<String> paths, List<TAggregationType> aggregations, long startTime, long endTime, long interval)` | Execute an aggregation query with a time interval        | Same as above, plus `interval`: The time interval            |
| `executeAggregationQuery(List<String> paths, List<TAggregationType> aggregations, long startTime, long endTime, long interval, long slidingStep)` | Execute a sliding window aggregation query               | Same as above, plus `slidingStep`: The sliding step          |
| `fetchAllConnections()`                                      | Get information of all active connections                | No parameters                                                |

##### 3.2.5 System Status and Backup

| **Method Name**            | **Function Description**                  | **Parameter Explanation**                  |
| -------------------------- | ----------------------------------------- | ------------------------------------------ |
| `getBackupConfiguration()` | Get backup configuration information      | No parameters                              |
| `fetchAllConnections()`    | Get information of all active connections | No parameters                              |
| `getSystemStatus()`        | Get the system status                     | Deprecated, returns  `SystemStatus.NORMAL` |