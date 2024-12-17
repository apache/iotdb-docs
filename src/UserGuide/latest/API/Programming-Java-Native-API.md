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

# Java Native API

## Overview
Session in IoTDB's native API is the core interface to interact with the database. It integrates rich methods and supports functions such as data writing, query and metadata operation. By instantiating a Session, you can establish a connection to the IoTDB server and perform various database operations in the environment built by that connection.
In addition, IoTDB also provides a Session Pool, which is a pooling form of a Session and is optimized specifically for multi-threaded concurrency scenarios. In the case of multi-threaded concurrency, the Session Pool can reasonably manage and allocate connection resources. To improve system performance and resource utilization efficiency. Session and Session Pool are the same in terms of functions and methods, both of which provide strong support for developers to interact with the IoTDB database in different scenarios, and developers can flexibly select them according to actual requirements.

## Step Overview
Core steps to use Session:
1. Create a Session instance: Initialize a session object to prepare for interaction with the IoTDB server.
2. Open the connection: Establish the connection with the IoTDB server through the Session instance.
3. Perform operations: Write data, query data, or manage metadata on the established connection.
4. Close the connection: After the operation is complete, close the connection with the IoTDB server to release resources.


Core steps for using SessionPool:
1. Create a Session pool instance: Initialize a SessionPool object to manage multiple session instances.
2. Perform operations: Directly obtain Session instances from the SessionPool and perform database operations without opening and closing connections each time.
3. Close SessionPool resources: If no database operation is required, close the session pool to release all related resources.

## Detailed steps
This chapter describes the core development process and does not demonstrate all parameters and interfaces. For all functions and parameters, please refer to: [Detailed Interface Description](./Programming-Java-Native-API.md#Detailed interface description) or visit: [Source Code](https://github.com/apache/iotdb/tree/master/example/session/src/main/java/org/apache/iotdb)

### 1. Create the maven project
Create a maven project and import the following dependencies (JDK >= 1.8, Maven >= 3.6)

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
### 2. Create session instances
#### Session
Method 1: Create a Session instance using the Builder constructor.
```java
package org.example;

import org.apache.iotdb.isession.util.Version;
import org.apache.iotdb.rpc.IoTDBConnectionException;
import org.apache.iotdb.session.Session;

public class IoTDBSessionExample {
    public static void main(String[] args) {
        Session session =
                new Session.Builder()
                        .host("127.0.0.1")
                        .port(6667)
                        .username("root")
                        .password("root")
                        .version(Version.V_1_0)
                        .build();
        try {
            session.open();
        } catch (IoTDBConnectionException e) {
            System.out.println("Connecting to the IoTDB failed.");
        }
        System.out.println("Connecting to the IoTDB succeeded.");
    }
}
```

Method 2: Create a Session instance using the new Session object.
```java
package org.example;

import org.apache.iotdb.rpc.IoTDBConnectionException;
import org.apache.iotdb.session.Session;

public class IoTDBSessionExample {
    public static void main(String[] args) {
        Session session = new Session("127.0.0.1", 6667);
        try {
            session.open();
        } catch (IoTDBConnectionException e) {
            System.out.println("Connecting to the IoTDB failed.");
        }
        System.out.println("Connecting to the IoTDB succeeded.");
    }
}
```

#### Session Pool
方式一：通过Builder来创建Session Pool实例
```java
package org.example;

import org.apache.iotdb.session.pool.SessionPool;

public class IoTDBSessionExample {
    public static void main(String[] args) {
        SessionPool sessionPool =
                new SessionPool.Builder()
                        .host("127.0.0.1")
                        .port(6667)
                        .user("root")
                        .password("root")
                        .maxSize(3)
                        .build();
    }
}
```

#### Session Pool
Method 1: Create a Session Pool instance using Builder
```java
package org.example;

import org.apache.iotdb.session.pool.SessionPool;

public class IoTDBSessionExample {
    public static void main(String[] args) {
        SessionPool sessionPool =
                new SessionPool.Builder()
                        .host("127.0.0.1")
                        .port(6667)
                        .user("root")
                        .password("root")
                        .maxSize(3)
                        .build();
    }
}
```

Method 2: Create a SessionPool instance using a direct new SessionPool object
```java
package org.example;

import org.apache.iotdb.session.pool.SessionPool;

public class IoTDBSessionExample {
    public static void main(String[] args) {
      SessionPool sessionPool =
              new SessionPool("127.0.0.1",6667,"root","root",100);
    }
}
```


### Perform Database Operation
The Session method list is the same as the SessionPool method list. This section uses Session as an example. If SessionPool is required, replace the Session object with SessionPool.

#### 元数据操作
```java
package org.example;

import org.apache.iotdb.isession.util.Version;
import org.apache.iotdb.rpc.IoTDBConnectionException;
import org.apache.iotdb.rpc.StatementExecutionException;
import org.apache.iotdb.session.Session;
import org.apache.tsfile.enums.TSDataType;
import org.apache.tsfile.file.metadata.enums.CompressionType;
import org.apache.tsfile.file.metadata.enums.TSEncoding;

public class IoTDBSessionExample {

    public static void main(String[] args) {
        Session session =
                new Session.Builder()
                        .host("127.0.0.1")
                        .port(6667)
                        .username("root")
                        .password("root")
                        .version(Version.V_1_0)
                        .build();
        try {
            session.open();
        } catch (IoTDBConnectionException e) {
            System.out.println("Connecting to the IoTDB failed.");
        }
        System.out.println("Connecting to the IoTDB succeeded.");

        try {
            // 1. create a database
            session.createDatabase("root.sg1");
            // 2. create a time series
            session.createTimeseries(
                    "root.sg1.d1.s1", TSDataType.INT64, TSEncoding.RLE, CompressionType.SNAPPY);
            // 3. delete a time series
            session.deleteTimeseries("root.sg1.d1.s1");
        } catch (IoTDBConnectionException | StatementExecutionException e) {
            throw new RuntimeException(e);
        }
        try {
          session.close();
        } catch (IoTDBConnectionException e) {
          // solve exception
        }
    }
}
```
#### Data Write
In industrial scenarios, data write can be classified into the following types based on the number of devices, write frequency, and data type: Single point real-time write, multiple devices write in batches, historical data write on a single device, batch data upload, and alignment data write. Different scenarios apply to different write interfaces. The following describes write interfaces in different scenarios.
##### Single Point Real-time Write
Scenario: Real-time status data of a single device is written with low update frequency. Usually, only one record is written at a time.

Applicable Interface:

| Interface name                                                                                  | Function description                                                                                          |
|-----------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| `insertRecord(String deviceId, long time, List<String> measurements, List<TSDataType> types, List<Object> values)` | A record of a single moment when multiple measuring points are inserted into a single device                                                                           |
| `insertRecord(String deviceId, long time, List<String> measurements, List<String> values)` | Similarly, there is no need to specify a data type and inferences are made based on the value passed in. Inference rules can be on the server configuration, detailed configuration in iotdb - system. The properties, the search in the template ` infer_type ` keyword |
| `insertAlignedRecord(String deviceId, long time, List<String> measurements, List<TSDataType> types, List<Object> values)` | A record of one moment of multiple measurement points inserted into a single device, which is an alignment device                                                                   |
| `insertAlignedRecord(String deviceId, long time, List<String> measurements, List<String> values)` | Similarly, there is no need to specify a data type and inferences are made based on the value passed in. Inference rules can be on the server configuration, detailed configuration in iotdb - system. The properties, the search in the template ` infer_type ` keyword                                                                               |

Code case:
```java
package org.example;

import java.util.ArrayList;
import java.util.List;
import org.apache.iotdb.isession.util.Version;
import org.apache.iotdb.rpc.IoTDBConnectionException;
import org.apache.iotdb.rpc.StatementExecutionException;
import org.apache.iotdb.session.Session;
import org.apache.tsfile.enums.TSDataType;

public class IoTDBSessionExample {

    public static void main(String[] args) {
        Session session =
                new Session.Builder()
                        .host("127.0.0.1")
                        .port(6667)
                        .username("root")
                        .password("root")
                        .version(Version.V_1_0)
                        .build();
        try {
            session.open();
        } catch (IoTDBConnectionException e) {
            // 连接Session异常
            System.out.println("Connecting to the IoTDB failed.");
        }
        System.out.println("Connecting to the IoTDB succeeded.");
        String deviceId = "root.sg1.d1";
        List<String> measurements = new ArrayList<>();
        List<TSDataType> types = new ArrayList<>();
        measurements.add("s1");
        measurements.add("s2");
        measurements.add("s3");
        types.add(TSDataType.INT64);
        types.add(TSDataType.INT64);
        types.add(TSDataType.INT64);

        for (long time = 0; time < 100; time++) {
            List<Object> values = new ArrayList<>();
            values.add(1L);
            values.add(2L);
            values.add(3L);
            try {
                session.insertRecord(deviceId, time, measurements, types, values);
            } catch (IoTDBConnectionException | StatementExecutionException e) {
                // solve exception
            }
        }
        try {
          session.close();
        } catch (IoTDBConnectionException e) {
          // solve exception
        }
    }
}
```

##### Write data to multiple devices in batches
Scenario: Real-time status or sensor data written to multiple devices in batches, suitable for factory or shop floor environments.

Applicable interface:

| Interface name                                                                                  | Function description                                                                                          |
|-----------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| `insertRecords(List<String> deviceIds, List<Long> times, List<List<String>> measurementsList, List<List<TSDataType>> typesList, List<List<Object>> valuesList)` | Insert multiple devices and record one moment of multiple measuring points for each device                                                                       |
| `insertRecords(List<String> deviceIds, List<Long> times, List<List<String>> measurementsList, List<List<Object>> valuesList)` |                                               Similarly, there is no need to specify a data type and inferences are made based on the value passed in. Inference rules can be on the server configuration, detailed configuration in iotdb - system. The properties, the search in the template ` infer_type ` keyword                                                |
| `insertAlignedRecords(List<String> deviceIds, List<Long> times, List<List<String>> measurementsList, List<List<TSDataType>> typesList, List<List<Object>> valuesList)` | Insert multiple devices and record one moment of multiple measuring points for each device. Each device is an aligned device                                                             |
| `insertAlignedRecords(List<String> deviceIds, List<Long> times, List<List<String>> measurementsList, List<List<Object>> valuesList)` | Similarly, there is no need to specify a data type and inferences are made based on the value passed in. Inference rules can be on the server configuration, detailed configuration in iotdb - system. The properties, the search in the template ` infer_type ` keyword |


Code case:
```java
package org.example;

import java.util.ArrayList;
import java.util.List;
import org.apache.iotdb.isession.util.Version;
import org.apache.iotdb.rpc.IoTDBConnectionException;
import org.apache.iotdb.rpc.StatementExecutionException;
import org.apache.iotdb.session.Session;
import org.apache.tsfile.enums.TSDataType;

public class IoTDBSessionExample {

    public static void main(String[] args) {
        Session session =
                new Session.Builder()
                        .host("127.0.0.1")
                        .port(6667)
                        .username("root")
                        .password("root")
                        .version(Version.V_1_0)
                        .build();
        try {
            session.open();
        } catch (IoTDBConnectionException e) {
            System.out.println("Connecting to the IoTDB failed.");
        }
        System.out.println("Connecting to the IoTDB succeeded.");
        String deviceId = "root.sg1.d1.s1";
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
                    session.insertRecords(deviceIds, timestamps, measurementsList, typesList, valuesList);
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
            session.insertRecords(deviceIds, timestamps, measurementsList, typesList, valuesList);
        } catch (IoTDBConnectionException | StatementExecutionException e) {
            // solve exception
        }
        try {
          session.close();
        } catch (IoTDBConnectionException e) {
          // solve exception
        }
    }
}
```

##### Single device historical data write-up

Scenario: Multiple historical records need to be added at a time because data collection intervals exist on a single device.

Applicable interface:

| Interface name                                                                                  | Function description                                                                          |
|-----------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| `insertRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<TSDataType>> typesList, List<List<Object>> valuesList)` | Insert multiple records for a single device                                                                                    |
| `insertRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<TSDataType>> typesList, List<List<Object>> valuesList, boolean haveSorted)` | Insert the sorting record of a single device, and its data is sorted without any out-of-order situation                                                                     |
| `insertRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<Object>> valuesList)` | Similarly, there is no need to specify a data type and inferences are made based on the value passed in. Inference rules can be on the server configuration, detailed configuration in iotdb - system. The properties, the search in the template ` infer_type ` keyword |
| `insertAlignedRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<TSDataType>> typesList, List<List<Object>> valuesList)` | Insert multiple records for a single device, which is an alignment device                                                                           |
| `insertAlignedRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<TSDataType>> typesList, List<List<Object>> valuesList, boolean haveSorted)` | Insert multiple records of a single device. This device is an aligned device, and its data has been sorted without any out-of-order                                                            |
| `insertAlignedRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<Object>> valuesList)` | Similarly, there is no need to specify a data type and inferences are made based on the value passed in. Inference rules can be on the server configuration, detailed configuration in iotdb - system. The properties, the search in the template ` infer_type ` keyword |

Code case:
```java
package org.example;

import java.util.ArrayList;
import java.util.List;
import org.apache.iotdb.isession.util.Version;
import org.apache.iotdb.rpc.IoTDBConnectionException;
import org.apache.iotdb.rpc.StatementExecutionException;
import org.apache.iotdb.session.Session;
import org.apache.tsfile.enums.TSDataType;

public class IoTDBSessionExample {

    public static void main(String[] args) throws IoTDBConnectionException, StatementExecutionException {
        Session session =
                new Session.Builder()
                        .host("127.0.0.1")
                        .port(6667)
                        .username("root")
                        .password("root")
                        .version(Version.V_1_0)
                        .build();
        try {
            session.open();
        } catch (IoTDBConnectionException e) {
            System.out.println("Connecting to the IoTDB failed.");
        }
        System.out.println("Connecting to the IoTDB succeeded.");
        String deviceId = "root.sg1.d1.s1";
        List<String> measurements = new ArrayList<>();
        measurements.add("s1");
        measurements.add("s2");
        measurements.add("s3");
        List<List<String>> measurementsList = new ArrayList<>();
        List<List<Object>> valuesList = new ArrayList<>();
        List<Long> timestamps = new ArrayList<>();
        List<List<TSDataType>> typesList = new ArrayList<>();

        for (long time = 0; time < 10; time ++) {
            List<Object> values = new ArrayList<>();
            List<TSDataType> types = new ArrayList<>();
            values.add(1L);
            values.add(2L);
            values.add(3L);
            types.add(TSDataType.INT64);
            types.add(TSDataType.INT64);
            types.add(TSDataType.INT64);
            measurementsList.add(measurements);
            valuesList.add(values);
            typesList.add(types);
            timestamps.add(time);
        }

        session.insertRecordsOfOneDevice(deviceId, timestamps, measurementsList, typesList, valuesList);
        try {
          session.close();
        } catch (IoTDBConnectionException e) {
          // solve exception
        }
    }
}
```
##### Batch data upload
Scenario: A large amount of data is uploaded from multiple devices at the same time, suitable for large-scale distributed data access.

Applicable interface:

| Interface name                                                                                | Function description                                    |
|-----------------------------------------------------------------------------------------|------------------------------------------|
| `insertTablet(Tablet tablet)`                                                          | Insert multiple measuring points for a single device, with data for multiple times at each measuring point                   |
| `insertTablet(Tablet tablet, boolean sorted)`                                          | Insert a single device with multiple measuring points, and the data of each measuring point at multiple times have been sorted          |
| `insertTablets(Map<String, Tablet> tablets)`                                           | Insert multiple measuring points for a single device, with data for multiple times at each measuring point                   |
| `insertTablets(Map<String, Tablet> tablets, boolean sorted)`                           | Insert a single device with multiple measuring points, and the data of each measuring point at multiple times have been sorted          |
| `insertAlignedTablet(Tablet tablet)`                                                  | Insert a single device with multiple measuring points, each measuring point with multiple moments of data, the device is aligned device          |
| `insertAlignedTablet(Tablet tablet, boolean sorted)`                                   | Insert a single device with multiple measuring points, each measuring point with multiple moments of data, the device is aligned device, and its data has been sorted |
| `insertAlignedTablets(Map<String, Tablet> tablets)`                                    | Insert multiple devices and multiple measuring points, each measuring point multiple time data                  |
| `insertAlignedTablets(Map<String, Tablet> tablets, boolean sorted)`                   | Insert multiple devices and multiple measuring points, and the data of each measuring point at multiple times has been arranged          |

Code case:
```java
package org.example;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import org.apache.iotdb.isession.util.Version;
import org.apache.iotdb.rpc.IoTDBConnectionException;
import org.apache.iotdb.rpc.StatementExecutionException;
import org.apache.iotdb.session.Session;
import org.apache.tsfile.enums.TSDataType;
import org.apache.tsfile.write.record.Tablet;
import org.apache.tsfile.write.schema.MeasurementSchema;

public class IoTDBSessionExample {

    public static void main(String[] args) throws IoTDBConnectionException, StatementExecutionException {
        Session session =
                new Session.Builder()
                        .host("127.0.0.1")
                        .port(6667)
                        .username("root")
                        .password("root")
                        .version(Version.V_1_0)
                        .build();
        try {
            session.open();
        } catch (IoTDBConnectionException e) {
            // 连接Session异常
            System.out.println("Connecting to the IoTDB failed.");
        }
        System.out.println("Connecting to the IoTDB succeeded.");
        String deviceId = "root.sg1.d1.s1";
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

        Tablet tablet = new Tablet(deviceId, schemaList, 100);

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
                session.insertTablet(tablet, true);
                tablet.reset();
            }
            timestamp++;
        }

        if (tablet.rowSize != 0) {
            session.insertTablet(tablet);
            tablet.reset();
        }
        try {
          session.close();
        } catch (IoTDBConnectionException e) {
          // solve exception
        }
    }
}
```

#### Data query
```java
package org.example;

import java.util.ArrayList;
import java.util.List;
import org.apache.iotdb.common.rpc.thrift.TAggregationType;
import org.apache.iotdb.isession.SessionDataSet;
import org.apache.iotdb.isession.util.Version;
import org.apache.iotdb.rpc.IoTDBConnectionException;
import org.apache.iotdb.rpc.StatementExecutionException;
import org.apache.iotdb.session.Session;

public class IoTDBSessionExample {
    private static final String ROOT_SG1_D1_S1 = "root.sg1.d1.s1";
    private static final String ROOT_SG1_D1_S2 = "root.sg1.d1.s2";
    private static final String ROOT_SG1_D1_S3 = "root.sg1.d1.s3";
    
    public static void main(String[] args) throws IoTDBConnectionException, StatementExecutionException {
        Session session =
                new Session.Builder()
                        .host("127.0.0.1")
                        .port(6667)
                        .username("root")
                        .password("root")
                        .version(Version.V_1_0)
                        .build();
        try {
            session.open();
        } catch (IoTDBConnectionException e) {
            System.out.println("Connecting to the IoTDB failed.");
        }
        System.out.println("Connecting to the IoTDB succeeded.");

        // 1. Query raw data using sql
        try (SessionDataSet dataSet = session.executeQueryStatement("select * from root.sg1.d1")) {
            System.out.println(dataSet.getColumnNames());
            dataSet.setFetchSize(1024); // default is 10000
            while (dataSet.hasNext()) {
                System.out.println(dataSet.next());
            }
        }

        // 2. Specify the query point, start time, end time, and timeout time
        List<String> paths = new ArrayList<>();
        paths.add(ROOT_SG1_D1_S1);
        paths.add(ROOT_SG1_D1_S2);
        paths.add(ROOT_SG1_D1_S3);
        long startTime = 10L;
        long endTime = 200L;
        long timeOut = 60000;

        try (SessionDataSet dataSet = session.executeRawDataQuery(paths, startTime, endTime, timeOut)) {
            System.out.println(dataSet.getColumnNames());
            dataSet.setFetchSize(1024);
            while (dataSet.hasNext()) {
                System.out.println(dataSet.next());
            }
        }

        // 3. Latest value query
        try (SessionDataSet sessionDataSet = session.executeLastDataQuery(paths, 3, 60000)) {
            System.out.println(sessionDataSet.getColumnNames());
            sessionDataSet.setFetchSize(1024);
            while (sessionDataSet.hasNext()) {
                System.out.println(sessionDataSet.next());
            }
        }

        // 4. Aggregate query
        List<TAggregationType> aggregations = new ArrayList<>();
        aggregations.add(TAggregationType.COUNT);
        aggregations.add(TAggregationType.SUM);
        aggregations.add(TAggregationType.MAX_VALUE);
        try (SessionDataSet sessionDataSet = session.executeAggregationQuery(paths, aggregations)) {
            System.out.println(sessionDataSet.getColumnNames());
            sessionDataSet.setFetchSize(1024);
            while (sessionDataSet.hasNext()) {
                System.out.println(sessionDataSet.next());
            }
        }

        // 5. Group query
        try (SessionDataSet sessionDataSet =
                     session.executeAggregationQuery(paths, aggregations, 0, 100, 10, 20)) {
            System.out.println(sessionDataSet.getColumnNames());
            sessionDataSet.setFetchSize(1024);
            while (sessionDataSet.hasNext()) {
                System.out.println(sessionDataSet.next());
            }
        }
    }
}
```

#### Data deletion
```java
package org.example;

import java.util.Collections;
import org.apache.iotdb.isession.util.Version;
import org.apache.iotdb.rpc.IoTDBConnectionException;
import org.apache.iotdb.rpc.StatementExecutionException;
import org.apache.iotdb.session.Session;

public class IoTDBSessionExample {
    private static final String ROOT_SG1_D1_S1 = "root.sg1.d1.s1";

    public static void main(String[] args) throws IoTDBConnectionException, StatementExecutionException {
        Session session =
                new Session.Builder()
                        .host("127.0.0.1")
                        .port(6667)
                        .username("root")
                        .password("root")
                        .version(Version.V_1_0)
                        .build();
        try {
            session.open();
        } catch (IoTDBConnectionException e) {
            System.out.println("Connecting to the IoTDB failed.");
        }
        System.out.println("Connecting to the IoTDB succeeded.");

        // 1. Delete data at a precise point in time
        String path = ROOT_SG1_D1_S1;
        long deleteTime = 99;
        session.deleteData(path, deleteTime);
        
        // 2. The data of a certain period is deleted
        long startTime = 1;
        session.deleteData(Collections.singletonList(path),startTime, deleteTime);
        
        // 3. Delete a measurement point
        session.deleteTimeseries(path);
    }
}
```

## Detailed Interface Description
### Parameter list
#### Session
| Field name | Type | description                                                |
|--------------------------------|-------------------------------|------------------------------------------------------------|
| `nodeUrls`                    | `List<String>`                | URL list of database nodes, supporting multi-node connections |
| `username`                    | `String`                      | Username                                                   |
| `password`                    | `String`                      | Password                                                           |
| `fetchSize`                   | `int`                         | Default batch return size of query results                             |
| `useSSL`                      | `boolean`                     | Whether to enable SSL                                                   |
| `trustStore`                  | `String`                      | Trust store path                                                      |
| `trustStorePwd`               | `String`                      | Trust store password                                                      |
| `queryTimeoutInMs`            | `long`                        | Query timeout period, in milliseconds                                               |
| `enableRPCCompression`        | `boolean`                     | Whether to enable RPC compression                                                |
| `connectionTimeoutInMs`       | `int`                         | Connection timeout, in milliseconds                                                |
| `zoneId`                      | `ZoneId`                      | Time zone setting of the session                                                    |
| `thriftDefaultBufferSize`     | `int`                         | Thrift Default buffer size                                             |
| `thriftMaxFrameSize`          | `int`                         | Thrift Maximum frame size                                               |
| `defaultEndPoint`             | `TEndPoint`                   | Default database endpoint information                                                 |
| `defaultSessionConnection`    | `SessionConnection`           | Default session connection object                                                  |
| `isClosed`                    | `boolean`                     | Whether the current session is closed                                                  |
| `enableRedirection`           | `boolean`                     | Whether to enable the redirection function                                            |
| `enableRecordsAutoConvertTablet` | `boolean`                  | Whether to enable automatic conversion of records to Tablet                                  |
| `deviceIdToEndpoint`          | `Map<String, TEndPoint>`      | Mapping between device ids and database endpoints                                          |
| `endPointToSessionConnection` | `Map<TEndPoint, SessionConnection>` | Mapping between database endpoints and session connections                                          |
| `executorService`             | `ScheduledExecutorService`    | A thread pool for periodically updating the node list                                           |
| `availableNodes`              | `INodeSupplier`               |Providers for available nodes                                            |
| `enableQueryRedirection`      | `boolean`                     | Whether to enable the query redirection function                                          |
| `version`                     | `Version`                     | Version number of the client, which is used to determine the compatibility with the server                                       |
| `enableAutoFetch`             | `boolean`                     | Whether to enable the automatic obtaining function                                              |
| `maxRetryCount`               | `int`                         | Maximum retry                                                  |
| `retryIntervalInMs`           | `long`                        | Retry interval, in milliseconds                                             |
Parameters that require additional clarification

nodeUrls: A list of multi-node urls that automatically switch to the next available node. The format is ip:port.

queryTimeoutInMs: If negative, the default configuration on the server is used; If the value is 0, the query timeout function is disabled.

enableRPCCompression: After this parameter is enabled, RPC data transmission is compressed. This parameter is applicable to scenarios with high bandwidth delay.

zoneId: indicates the session time zone. The available value can refer to Java's ZoneId standard, for example, Asia/Shanghai.

#### SessionPool
|Field name | Type | description                                                            |
|--------------------------------|-------------------------------|-------------------------------------------------------------------|
| `host`                        | `String`                      | Database host address                                                 |
| `port`                        | `int`                         | Database port                                                   |
| `user`                        | `String`                      | Database user name                                                     |
| `password`                    | `String`                      | Database password                                                       |
| `nodeUrls`                    | `List<String>`                | A list of multi-node urls |
| `maxSize`                     | `int`                         | The maximum number of connections in the connection pool is |
| `fetchSize`                   | `int`                         | The default batch return size of the query results is |
| `waitToGetSessionTimeoutInMs` | `long`                        | The wait timeout for getting a connection (ms) |
| `enableCompression`           | `boolean`                     | Whether to enable RPC compression |
| `enableRedirection`           | `boolean`                     | Whether to enable the redirection function |
| `enableRecordsAutoConvertTablet` | `boolean`                  | Whether to enable automatic Tablet conversion of records |
| `thriftDefaultBufferSize`     | `int`                         | Thrift Default buffer size |
| `thriftMaxFrameSize`          | `int`                         | Thrift Maximum frame size |
| `queryTimeoutInMs`            | `long`                        | Query timeout period, expressed in milliseconds |
| `version`                     | `Version`                     | The client version |
| `connectionTimeoutInMs`       | `int`                         | Connection timeout, in milliseconds |
| `zoneId`                      | `ZoneId`                      | Time zone Settings |
| `useSSL`                      | `boolean`                     | Whether to enable SSL |
| `trustStore`                  | `String`                      | The truststore path is |
| `trustStorePwd`               | `String`                      | Trust store password |
| `enableQueryRedirection`      | `boolean`                     | Whether to enable the query redirection function |
| `executorService`             | `ScheduledExecutorService`    | The thread pool for the node list is periodically updated |
| `availableNodes`              | `INodeSupplier`               | Providers for available nodes |
| `maxRetryCount`               | `int`                         | The maximum number of retries |
| `retryIntervalInMs`           | `long`                        | Retry interval, in milliseconds |
| `closed`                      | `boolean`                     | Whether the current connection pool is closed |
| `queue`                       | `ConcurrentLinkedDeque<ISession>` | Queues to which sessions are available |
| `occupied`                    | `ConcurrentMap<ISession, ISession>` | The occupied session connections are mapped to |
| `deviceIdToEndpoint`          | `Map<String, TEndPoint>`      | Mapping of device ids to database endpoints |
| `formattedNodeUrls`           | `String`                      | The formatted node URL string |
Fields that require additional clarification

nodeUrls: A list of multiple node addresses to support connectivity in a clustered environment. The format is ["host1:port1", "host2:port2"].

queue: Stores all available session connections. It is removed from the queue when a connection is needed.

occupied: Records the occupied connection so that it can be properly reclaimed when the connection is released.

maxRetryCount and retryIntervalInMs: control the retry policy. When an operation fails, the retrycount and RetryIntervalinMs are used to control the specified retry times.


### List of functions
#### Session Management
| 方法名                                                                                  | Function Description | Parameter Description                                                                                             |
|-----------------------------------------------------------------------------------------|--------------------------------------------|-----------------------------------------------------------------------------------------------------------|
| `open()`                                                                                | Open a session | No parameters                                                                         |
| `open(boolean enableRPCCompression)`                                                   | Open a session and enableRPC compression | `enableRPCCompression` : Whether to enable RPC compression |
| `open(boolean enableRPCCompression, int connectionTimeoutInMs)`                        | Open a session and set the connection timeout | `enableRPCCompression` : Whether to enableRPC compression, `connectionTimeoutInMs` : Connection timeout (ms) |
| `open(boolean enableRPCCompression, int connectionTimeoutInMs, Map<String, TEndPoint> deviceIdToEndpoint, INodeSupplier nodeSupplier)` | Open a session and configure the node | `enableRPCCompression` : Whether to enableRPC compression, `connectionTimeoutInMs` : Timeout, `deviceIdToEndpoint` : device mapping |
| `close()`                                                                              | Close a session | No parameter                          |
| `getVersion()`                                                                         | Obtain the session version | No parameter is specified                                                                                                    |
| `setVersion(Version version)`                                                         | Set session version | `version` : The version to set                                                                       |
| `getTimeZone()`                                                                        | Obtain the current time zone | None                                                                     |
| `setTimeZone(String zoneId)`                                                           | Set the time zone | `zoneId` : time zone identifier (for example, `Asia/Shanghai`)                                                  |
| `setTimeZoneOfSession(String zoneId)`                                                  | Set the session time zone | `zoneId` : indicates the time zone identifier                                                                       |
| `getFetchSize()`                                                                       | Limit the number of records to be queried in batches | No parameter is specified                                                                                               |
| `setFetchSize(int fetchSize)`                                                          | Set the maximum number of records for batch query | `fetchSize` : specifies the maximum number of records returned in each batch of query                                                        |
| `setQueryTimeout(long timeoutInMs)`                                                    | Set the query timeout period | `timeoutInMs` : Query timeout period (milliseconds).                                                                |
| `getQueryTimeout()`                                                                    | Obtain the query timeout period | No parameter                                                                               |
| `isEnableQueryRedirection()`                                                           | Check whether query redirection is enabled | No parameter                                                                                          |
| `setEnableQueryRedirection(boolean enableQueryRedirection)`                            | Set query redirection | `enableQueryRedirection` : indicates whether query redirection is enabled                                                           |
| `isEnableRedirection()`                                                                | Check whether redirection is enabled | No parameter                                                                                                  |
| `setEnableRedirection(boolean enableRedirection)`                                      | To set redirection | `enableRedirection` : Whether to enable redirection |

#### Metadata management
| 方法名                                                   | Function Description | Parameter Description                                                                                               |
|----------------------------------------------------------|--------------------------------------------|------------------------------------------------------------------------------------------------------------|
| `createDatabase(String database)`                      | Create a database | `database` : the name of the database                                                                                     |
| `deleteDatabase(String database)`                      | Deletes the specified database | `database` : The name of the database to be deleted                                                                          |
| `deleteDatabases(List<String> databases)`              |Batch delete databases | `databases` : list of database names to be deleted                                                                   |
| `createTimeseries(String path, TSDataType dataType, TSEncoding encoding, CompressionType compressor)` | Create a single time series | `path` : time series path, `dataType` : data type, `encoding` : encoding type, and `compressor` : compression type            |
| `createAlignedTimeseries(...)`                         | Create an alignment time series | device ID, point list, data type list, encoding list, and compression type list                                         |
| `createMultiTimeseries(...)`                           | Batch create time series | with multiple paths, data types, encoders, compression types, attributes, tags, aliases, and more                                            |
| `deleteTimeseries(String path)`                        | Delete time series | `path` : The time series path to delete is |
| `deleteTimeseries(List<String> paths)` | Deletes time series in batches | `paths` : List of time series paths to delete |
| `setSchemaTemplate(String templateName, String prefixPath)`| Set the pattern template |` templateName `: prefixPath: indicates the path of the application template |
| `createSchemaTemplate(Template template)`| Creates a pattern template | `template` : The template object |
| `dropSchemaTemplate(String templateName)` | Deletes the schema template | `templateName` : | is the name of the template to be deleted
| `addAlignedMeasurementsInTemplate(...) `| Adds align points to template | template name, point path list, data type, encoding type, and compression type                                              |
| `addUnalignedMeasurementsInTemplate(...)`| Add unaligned points to template | as above                                                                    |
| `deleteNodeInTemplate(String templateName, String path)`| Deletes a node from a template |` templateName `: template name,` path `: The path to delete is |
| `countMeasurementsInTemplate (String name)` | statistical number of measuring points in the template | `name` : template name |
| `isMeasurementInTemplate(String templateName, String path)`| Check whether a measurement point exists in the template |` templateName `: template name,` path `: Measuring point path |
| `isPathExistInTemplate(String templateName, String path)`| Check whether the path | exists in the template                                                               |
| `showMeasurementsInTemplate (String templateName) ` | show that measuring point of the template | `templateName` : indicates the template name |
| `showMeasurementsInTemplate(String templateName, String pattern)`| Displays measurement points in the template by pattern |` templateName `: indicates the template name,` pattern `: Matching mode |
| `showAllTemplates()` | Displays all templates | There is no parameter |
| `showPathsTemplateSetOn(String templateName)` | Displays the path of the template application | `templateName` : indicates the template name |
| `showPathsTemplateUsingOn(String templateName)` | Displays the actual path used by the template | ibid. |
| `unsetSchemaTemplate(String prefixPath, String templateName)`| Unsets the path template |` prefixPath `: path,` templateName `: template name                                                          |


#### Data write
| Method name | Function Description | Parameter Description                                                                                     |
|-----------------------------------------------------------------------------------------|--------------------------------------------|------------------------------------------------------------------------------------------------------------|
| `insertRecord(String deviceId, long time, List<String> measurements, List<TSDataType> types, Object... values)` | Insert a single record | `deviceId` : device ID, `time` : timestamp, `measurements` : list of points,` types` : list of data types, `values` : list of values      |
| `insertRecord(String deviceId, long time, List<String> measurements, List<String> values)` | Insert a single record | `deviceId` : device ID, `time` : timestamp, `measurements` : list of points,` values` : list of values        |
| `insertRecords(List<String> deviceIds, List<Long> times, List<List<String>> measurementsList, List<List<Object>> valuesList)` | Insert multiple records | deviceIds: device ID list, times: timestamp list, measurementsList: measurement point list, valuesList: value list       |
| `insertRecords(List<String> deviceIds, List<Long> times, List<List<String>> measurementsList, List<List<TSDataType>> typesList, List<List<Object>> valuesList)` |Insert multiple records | as above, add `typesList` : list of data types                                                    |
| `insertRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<TSDataType>> typesList, List<List<Object>> valuesList)` | Insert multiple records for a single device | `deviceId` : device ID, `times` : timestamp list,` measurementsList `: list of measurement points,` typesList `: Type list, `valuesList` : list of values |
| `insertRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<TSDataType>> typesList, List<List<Object>> valuesList, boolean haveSorted)` | Insert sorted multiple records for a single device | as above, add `haveSorted` : whether the data is sorted                                                                  |
| `insertStringRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<String>> valuesList)` | Insert a single device record in string format | `deviceId` : device ID, `times` : timestamp list,` measurementsList `: list of points,` valuesList `: list of values|
| `insertStringRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<String>> valuesList, boolean haveSorted)` |Insert sorted string format single-device record | as above, add `haveSorted` : whether the data is sorted                                                              |
| `insertAlignedRecord(String deviceId, long time, List<String> measurements, List<TSDataType> types, List<Object> values)` |Insert a single alignment record | `deviceId` : device ID, `time` : timestamp, `measurements` : list of points,` types` : type list, `values` : List of values |
| `insertAlignedRecord(String deviceId, long time, List<String> measurements, List<String> values) `| Inserts a single aligned record in string format |` deviceId `: device ID,` time `: timestamp,` measurements` : point list, `values` : List of values |
| `insertAlignedRecords(List<String> deviceIds, List<Long> times, List<List<String>> measurementsList, List<List<Object>> valuesList) `| Insert multiple alignment records |` deviceIds` : list of device ids, `times` : Timestamp list, `measurementsList` : list of measurement points, `valuesList` : list of values |
| `insertAlignedRecords(List<String> deviceIds, List<Long> times, List<List<String>> measurementsList, List<List<TSDataType>> typesList, List<List<Object>> valuesList) `| Insert multiple aligned records | as above, Add `typesList` : list of data types |
| `insertAlignedRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<TSDataType>> typesList, List<List<Object>> valuesList) `| Insert multiple alignment records for a single device | as above                                                  |
| `insertAlignedRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<TSDataType>> typesList, List<List<Object>> valuesList, boolean haveSorted) `| Insert sorted single-device multiple aligned records | as above, Added `haveSorted` : Whether the data is sorted |
| `insertAlignedStringRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<String>> valuesList) `| Inserts a single device alignment record in string format |` deviceId `: device ID,` times` : timestamp list, `measurementsList` : Point list, `valuesList` : list of values |
| `insertAlignedStringRecordsOfOneDevice(String deviceId, List<Long> times, List<List<String>> measurementsList, List<List<String>> valuesList, boolean haveSorted) `| Insert a sorted single-device alignment record in string format | as above, add` haveSorted `: Whether the data is sorted |
| `insertTablet(Tablet tablet)` | Inserts a single Tablet data | `tablet` : The Tablet data to be inserted |
| `insertTablet(Tablet tablet, boolean sorted) `| inserts sorted Tablet data | as above, add` sorted `: Whether the data is sorted |
| `insertAlignedTablet(Tablet tablet)` | inserts aligned Tablet data | `tablet` : The Tablet data to be inserted |
| `insertAlignedTablet(Tablet tablet, boolean sorted) `| inserts sorted aligning Tablet data | As above, add` sorted `: Whether the data is sorted |
| `insertTablets(Map<String, Tablet> tablets) `| Insert multiple Tablet data |` tablets` in batches: The mapping table for device ids to tablets |
| `insertTablets(Map<String, Tablet> tablets, boolean sorted) `| batch insert sorted Tablet data | As above, add` sorted `: Whether the data is sorted |
| `insertAlignedTablets(Map<String, Tablet> tablets) `| Batch insert multiple aligned Tablet data |` tablets` : The mapping table for device ids to tablets |
| `insertAlignedTablets(Map<String, Tablet> tablets, boolean sorted) `| batch insert sorted multiple aligned Tablet data | As above, add` sorted `: Whether the data is sorted |

#### 数据删除
| 方法名                                                                                  | 功能描述                                   | 参数解释                                                                                                   |
|-----------------------------------------------------------------------------------------|--------------------------------------------|------------------------------------------------------------------------------------------------------------|
| `deleteTimeseries(String path)`                                                       | 删除单个时间序列                          | `path`: 时间序列路径                                                                                      |
| `deleteTimeseries(List<String> paths)`                                                | 批量删除时间序列                          | `paths`: 时间序列路径列表                                                                                  |
| `deleteData(String path, long endTime)`                                               | 删除指定路径的历史数据                    | `path`: 路径，`endTime`: 结束时间戳                                                                        |
| `deleteData(List<String> paths, long endTime)`                                        | 批量删除路径的历史数据                    | `paths`: 路径列表，`endTime`: 结束时间戳                                                                   |
| `deleteData(List<String> paths, long startTime, long endTime)`                        | 删除路径时间范围内的历史数据              | 同上，增加 `startTime`: 起始时间戳                                                                         |


#### Data query
| Method name | Function Description | Parameter Description                                                                              |
|-----------------------------------------------------------------------------------------|--------------------------------------------|------------------------------------------------------------------------------------------------------------|
| `executeQueryStatement(String sql)`                                                   | Execute the query statement | `sql` : Query the SQL statement |
| `executeQueryStatement(String sql, long timeoutInMs) `| Execute a query with a timeout |` sql `: query an SQL statement,` timeoutInMs` : Query timeout period (ms) |
| `executeRawDataQuery(List<String> paths, long startTime, long endTime) `| queries the raw data of the specified path |` paths `: queries the list of paths,` startTime `: start timestamp,` endTime `: End timestamp |
| `executeRawDataQuery(List<String> paths, long startTime, long endTime, long timeOut) `| Queries the raw data of the specified path (with timeOut) | as above, add` timeout `: Timeout period |
| `executeLastDataQuery(List<String> paths)` | Queries the latest data | `paths` : Query the list of paths |
| `executeLastDataQuery(List<String> paths, long lastTime) `| to query the latest data at a specified time |` paths `: to query the list of paths,` lastTime `: The specified timestamp is |
| `executeLastDataQuery(List<String> paths, long lastTime, long timeOut) `| Queries the latest data at the specified time (with timeOut) | as above, add` timeout `: Timeout period |
| `executeLastDataQueryForOneDevice(String db, String device, List<String> sensors, boolean isLegalPathNodes) `| Queries the latest data on a single device |` db `: database name,` device `: device name,` sensors` : Sensor list, `isLegalPathNodes` : indicates whether a valid path node |
| `executeAggregationQuery(List<String> paths, List<TAggregationType> aggregations) `| Execute the aggregation query |` paths `: query the list of paths,` aggregations` : List of aggregate types |
| `executeAggregationQuery(List<String> paths, List<TAggregationType> aggregations, long startTime, long endTime) `| executes an aggregate query with a time range | as above, add` startTime `: the start timestamp,` endTime `: End timestamp |
| `executeAggregationQuery(List<String> paths, List<TAggregationType> aggregations, long startTime, long endTime, long interval) `| Execute the aggregated query with interval | as above, add` interval `: Time interval |
| `executeAggregationQuery(List<String> paths, List<TAggregationType> aggregations, long startTime, long endTime, long interval, long slidingStep) `| Run the sliding-window aggregate query | as above and add` slidingStep `: Slide step size |
| `fetchAllConnections()` | Get all active connection information | No parameter                                                         |

#### System status and Backup
| Method name | Function Description | Parameter Description                                                                                                |
|-------------------------------------------------------------------------------------|--------------------------------------------|------------------------------------------------------------------------------------------------------------|
| `getBackupConfiguration()`                                                         | Obtain backup configuration information | No parameter is specified                     |
| `fetchAllConnections()` | Get all active connection information | There is no parameter |
| `getSystemStatus()` | gets the system status | is deprecated and `SystemStatus.NORMAL` is returned by default                                                                   |



# Data Subscription

## 1 Topic Management

The `SubscriptionSession` class in the IoTDB subscription client provides interfaces for topic management. The status changes of topics are illustrated in the diagram below:

<div align="center">
    <img src="https://alioss.timecho.com/docs/img/Data_sub_04.png" alt="" style="width: 60%;"/>
</div>

### 1.1 Create Topic

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

### 1.2 Delete Topic

```Java
void dropTopicIfExists(String topicName) throws Exception;
```

### 1.3 View Topic

```Java
// Get all topics
Set<Topic> getTopics() throws Exception;

// Get a specific topic
Optional<Topic> getTopic(String topicName) throws Exception;
```

## 2 Check Subscription Status
The `SubscriptionSession` class in the IoTDB subscription client provides interfaces to check the subscription status:

```Java
Set<Subscription> getSubscriptions() throws Exception;
Set<Subscription> getSubscriptions(final String topicName) throws Exception;
```

## 3 Create Consumer

When creating a consumer using the JAVA native interface, you need to specify the parameters applied to the consumer.

For both `SubscriptionPullConsumer` and `SubscriptionPushConsumer`, the following common configurations are available:


| key                     | **required or optional with default**                        | description                                                  |
| :---------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| host                    | optional: 127.0.0.1                                          | `String`: The RPC host of a certain DataNode in IoTDB                     |
| port                    | optional: 6667                                               | Integer: The RPC port of a certain DataNode in IoTDB                     |
| node-urls               | optional: 127.0.0.1:6667                                     | `List<String>`: The RPC addresses of all DataNodes in IoTDB, can be multiple; either host:port or node-urls can be filled in. If both host:port and node-urls are filled in, the union of host:port and node-urls will be used to form a new node-urls application |
| username                | optional: root                                               | `String`: The username of a DataNode in IoTDB                          |
| password                | optional: root                                               | `String`: The password of a DataNode in IoTDB                             |
| groupId                 | optional                                                     | `String`: consumer group id, if not specified, a new consumer group will be randomly assigned, ensuring that different consumer groups have different consumer group ids |
| consumerId              | optional                                                     | `String`: consumer client id, if not specified, it will be randomly assigned, ensuring that each consumer client id in the same consumer group is unique |
| heartbeatIntervalMs     | optional: 30000 (min: 1000)                                  | `Long`: The interval at which the consumer sends heartbeat requests to the IoTDB DataNode      |
| endpointsSyncIntervalMs | optional: 120000 (min: 5000)                                 | `Long`: The interval at which the consumer detects the expansion and contraction of IoTDB cluster nodes and adjusts the subscription connection |
| fileSaveDir             | optional: Paths.get(System.getProperty("user.dir"), "iotdb-subscription").toString() | `String`: The temporary directory path where the TsFile files subscribed by the consumer are stored      |
| fileSaveFsync           | optional: false                                              | `Boolean`: Whether the consumer actively calls fsync during the subscription of TsFile    |


### 3.1 SubscriptionPushConsumer

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

### 3.2 SubscriptionPullConsumer

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

## 4 Subscribe to Topics

Both `SubscriptionPushConsumer` and `SubscriptionPullConsumer` provide the following JAVA native interfaces for subscribing to topics:

```Java
// Subscribe to topics
void subscribe(String topic) throws Exception;
void subscribe(List<String> topics) throws Exception;
```

- Before a consumer subscribes to a topic, the topic must have been created, otherwise, the subscription will fail.

- If a consumer subscribes to a topic that it has already subscribed to, no error will occur.

- If there are other consumers in the same consumer group that have subscribed to the same topics, the consumer will reuse the corresponding consumption progress.


## 5 Consume Data

For both push and pull mode consumers:


- Only after explicitly subscribing to a topic will the consumer receive data for that topic.

- If no topics are subscribed to after creation, the consumer will not be able to consume any data, even if other consumers in the same consumer group have subscribed to some topics.

### 5.1 SubscriptionPushConsumer

After `SubscriptionPushConsumer` subscribes to topics, there is no need to manually pull data.

The data consumption logic is within the `consumeListener` configuration specified when creating `SubscriptionPushConsumer`.

### 5.2 SubscriptionPullConsumer

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

## 6 Unsubscribe

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


## 7 Code Examples

### 7.1 Single Pull Consumer Consuming SessionDataSetsHandler Format Data

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

## 7.2 Multiple Push Consumers Consuming TsFileHandler Format Data

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