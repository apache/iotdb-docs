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


# Write Data
## 1. CLI INSERT

IoTDB provides users with a variety of ways to insert real-time data, such as directly inputting [INSERT SQL statement](../SQL-Manual/SQL-Manual.md#insert-data) in [Client/Shell tools](../Tools-System/CLI.md), or using [Java JDBC](../API/Programming-JDBC.md) to perform single or batch execution of [INSERT SQL statement](../SQL-Manual/SQL-Manual.md).

NOTE： This section mainly introduces the use of [INSERT SQL statement](../SQL-Manual/SQL-Manual.md#insert-data) for real-time data import in the scenario.

Writing a repeat timestamp covers the original timestamp data, which can be regarded as updated data.

### 1.1 Use of INSERT Statements

The [INSERT SQL statement](../SQL-Manual/SQL-Manual.md#insert-data) statement is used to insert data into one or more specified timeseries created. For each point of data inserted, it consists of a [timestamp](../Basic-Concept/Operate-Metadata.md) and a sensor acquisition value (see [Data Type](../Background-knowledge/Data-Type.md)).
 
In the scenario of this section, take two timeseries `root.ln.wf02.wt02.status` and `root.ln.wf02.wt02.hardware` as an example, and their data types are BOOLEAN and TEXT, respectively.

The sample code for single column data insertion is as follows:

```
IoTDB > insert into root.ln.wf02.wt02(timestamp,status) values(1,true)
IoTDB > insert into root.ln.wf02.wt02(timestamp,hardware) values(1, 'v1')
```

The above example code inserts the long integer timestamp and the value "true" into the timeseries `root.ln.wf02.wt02.status` and inserts the long integer timestamp and the value "v1" into the timeseries `root.ln.wf02.wt02.hardware`. When the execution is successful, cost time is shown to indicate that the data insertion has been completed.

> Note: In IoTDB, TEXT type data can be represented by single and double quotation marks. The insertion statement above uses double quotation marks for TEXT type data. The following example will use single quotation marks for TEXT type data.

The INSERT statement can also support the insertion of multi-column data at the same time point.  The sample code of  inserting the values of the two timeseries at the same time point '2' is as follows:

```sql
IoTDB > insert into root.ln.wf02.wt02(timestamp, status, hardware) VALUES (2, false, 'v2')
```

In addition, The INSERT statement support insert multi-rows at once. The sample code of inserting two rows as follows:

```sql
IoTDB > insert into root.ln.wf02.wt02(timestamp, status, hardware) VALUES (3, false, 'v3'),(4, true, 'v4')
```

After inserting the data, we can simply query the inserted data using the SELECT statement:

```sql
IoTDB > select * from root.ln.wf02.wt02 where time < 5
```

The result is shown below. The query result shows that the insertion statements of single column and multi column data are performed correctly.

```
+-----------------------------+--------------------------+------------------------+
|                         Time|root.ln.wf02.wt02.hardware|root.ln.wf02.wt02.status|
+-----------------------------+--------------------------+------------------------+
|1970-01-01T08:00:00.001+08:00|                        v1|                    true|
|1970-01-01T08:00:00.002+08:00|                        v2|                   false|
|1970-01-01T08:00:00.003+08:00|                        v3|                   false|
|1970-01-01T08:00:00.004+08:00|                        v4|                    true|
+-----------------------------+--------------------------+------------------------+
Total line number = 4
It costs 0.004s
```

In addition, we can omit the timestamp column, and the system will use the current system timestamp as the timestamp of the data point. The sample code is as follows:

```sql
IoTDB > insert into root.ln.wf02.wt02(status, hardware) values (false, 'v2')
```

**Note:** Timestamps must be specified when inserting multiple rows of data in a SQL.

### 1.2 Insert Data Into Aligned Timeseries

To insert data into a group of aligned time series, we only need to add the `ALIGNED` keyword in SQL, and others are similar.

The sample code is as follows:

```sql
IoTDB > create aligned timeseries root.sg1.d1(s1 INT32, s2 DOUBLE)
IoTDB > insert into root.sg1.d1(time, s1, s2) aligned values(1, 1, 1)
IoTDB > insert into root.sg1.d1(time, s1, s2) aligned values(2, 2, 2), (3, 3, 3)
IoTDB > select * from root.sg1.d1
```

The result is shown below. The query result shows that the insertion statements are performed correctly.

```
+-----------------------------+--------------+--------------+
|                         Time|root.sg1.d1.s1|root.sg1.d1.s2|
+-----------------------------+--------------+--------------+
|1970-01-01T08:00:00.001+08:00|             1|           1.0|
|1970-01-01T08:00:00.002+08:00|             2|           2.0|
|1970-01-01T08:00:00.003+08:00|             3|           3.0|
+-----------------------------+--------------+--------------+
Total line number = 3
It costs 0.004s
```

## 2. NATIVE API WRITE

The Native API ( Session ) is the most widely used series of APIs of IoTDB, including multiple APIs, adapted to different data collection scenarios, with high performance and multi-language support.

### 2.1 Multi-language API write

#### Java

Before writing via the Java API, you need to establish a connection, refer to [Java Native API](../API/Programming-Java-Native-API.md).
then refer to [ JAVA Data Manipulation Interface (DML) ](../API/Programming-Java-Native-API.md#insert)

#### Python

Refer to [ Python Data Manipulation Interface (DML) ](../API/Programming-Python-Native-API.md#insert)

#### C++ 

Refer to [ C++ Data Manipulation Interface (DML) ](../API/Programming-Cpp-Native-API.md#insert)

#### Go

Refer to [Go Native API](../API/Programming-Go-Native-API.md)

## 3. REST API WRITE

Refer to [insertTablet (v1)](../API/RestServiceV1.md#inserttablet) or [insertTablet (v2)](../API/RestServiceV2.md#inserttablet)

Example：

```JSON
{
      "timestamps": [
            1,
            2,
            3
      ],
      "measurements": [
            "temperature",
            "status"
      ],
      "data_types": [
            "FLOAT",
            "BOOLEAN"
      ],
      "values": [
            [
                  1.1,
                  2.2,
                  3.3
            ],
            [
                  false,
                  true,
                  true
            ]
      ],
      "is_aligned": false,
      "device": "root.ln.wf01.wt01"
}
```

## 4. MQTT WRITE

Refer to [Built-in MQTT Service](../API/Programming-MQTT.md#built-in-mqtt-service)

## 5. BATCH DATA LOAD

In different scenarios, the IoTDB provides a variety of methods for importing data in batches. This section describes the two most common methods for importing data in CSV format and TsFile format.

### 5.1 TsFile Batch Load

TsFile is the file format of time series used in IoTDB. You can directly import one or more TsFile files with time series into another running IoTDB instance through tools such as CLI. For details, see [Data Import](../Tools-System/Data-Import-Tool.md).

### 5.2 CSV Batch Load

CSV stores table data in plain text. You can write multiple formatted data into a CSV file and import the data into the IoTDB in batches. Before importing data, you are advised to create the corresponding metadata in the IoTDB. Don't worry if you forget to create one, the IoTDB can automatically infer the data in the CSV to its corresponding data type, as long as you have a unique data type for each column. In addition to a single file, the tool supports importing multiple CSV files as folders and setting optimization parameters such as time precision. For details, see [Data Import](../Tools-System/Data-Import-Tool.md).

## 6. SCHEMALESS WRITING
In IoT scenarios, the types and quantities of devices may dynamically increase or decrease over time, and different devices may generate data with varying fields (e.g., temperature, humidity, status codes). Additionally, businesses often require rapid deployment and flexible integration of new devices without cumbersome predefined processes. Therefore, unlike traditional time-series databases that typically require predefining data models, IoTDB supports schema-less writing, where the database automatically identifies and registers the necessary metadata during data writing, enabling automatic modeling.

Users can either use CLI `INSERT` statements or native APIs to write data in real-time, either in batches or row-by-row, for single or multiple devices. Alternatively, they can import historical data in formats such as CSV or TsFile using import tools, during which metadata like time series, data types, and compression encoding methods are automatically created.



