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


# Write & Delete Data
## CLI INSERT

IoTDB provides users with a variety of ways to insert real-time data, such as directly inputting [INSERT SQL statement](../Reference/SQL-Reference.md) in [Client/Shell tools](../QuickStart/Command-Line-Interface.md), or using [Java JDBC](../API/Programming-JDBC.md) to perform single or batch execution of [INSERT SQL statement](../Reference/SQL-Reference.md).

NOTE： This section mainly introduces the use of [INSERT SQL statement](../Reference/SQL-Reference.md) for real-time data import in the scenario.

Writing a repeat timestamp covers the original timestamp data, which can be regarded as updated data.

### Use of INSERT Statements

The [INSERT SQL statement](../Reference/SQL-Reference.md) statement is used to insert data into one or more specified timeseries created. For each point of data inserted, it consists of a [timestamp](../Basic-Concept/Data-Model-and-Terminology.md) and a sensor acquisition value (see [Data Type](../Basic-Concept/Data-Type.md)).

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

### Insert Data Into Aligned Timeseries

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

## NATIVE API WRITE

The Native API ( Session ) is the most widely used series of APIs of IoTDB, including multiple APIs, adapted to different data collection scenarios, with high performance and multi-language support.

### Multi-language API write

#### Java

Before writing via the Java API, you need to establish a connection, refer to [Java Native API](../API/Programming-Java-Native-API.md).
then refer to [ JAVA Data Manipulation Interface (DML) ](../API/Programming-Java-Native-API.md#insert)

#### Python

Refer to [ Python Data Manipulation Interface (DML) ](../API/Programming-Python-Native-API.md#insert)

#### C++ 

Refer to [ C++ Data Manipulation Interface (DML) ](../API/Programming-Cpp-Native-API.md#insert)

#### Go

Refer to [Go Native API](../API/Programming-Go-Native-API.md)

## REST API WRITE

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

## MQTT WRITE

Refer to [Built-in MQTT Service](../API/Programming-MQTT.md#built-in-mqtt-service)

## BATCH DATA LOAD

In different scenarios, the IoTDB provides a variety of methods for importing data in batches. This section describes the two most common methods for importing data in CSV format and TsFile format.

### TsFile Batch Load

TsFile is the file format of time series used in IoTDB. You can directly import one or more TsFile files with time series into another running IoTDB instance through tools such as CLI. For details, see [Import-Export-Tool](../Tools-System/Import-Export-Tool.md).

### CSV Batch Load

CSV stores table data in plain text. You can write multiple formatted data into a CSV file and import the data into the IoTDB in batches. Before importing data, you are advised to create the corresponding metadata in the IoTDB. Don't worry if you forget to create one, the IoTDB can automatically infer the data in the CSV to its corresponding data type, as long as you have a unique data type for each column. In addition to a single file, the tool supports importing multiple CSV files as folders and setting optimization parameters such as time precision. For details, see [Import-Export-Tool](../Tools-System/Import-Export-Tool.md).

## DELETE

Users can delete data that meet the deletion condition in the specified timeseries by using the [DELETE statement](../Reference/SQL-Reference.md). When deleting data, users can select one or more timeseries paths, prefix paths, or paths with star  to delete data within a certain time interval.

In a JAVA programming environment, you can use the [Java JDBC](../API/Programming-JDBC.md) to execute single or batch UPDATE statements.

### Delete Single Timeseries

Taking ln Group as an example, there exists such a usage scenario:

The wf02 plant's wt02 device has many segments of errors in its power supply status before 2017-11-01 16:26:00, and the data cannot be analyzed correctly. The erroneous data affected the correlation analysis with other devices. At this point, the data before this time point needs to be deleted. The SQL statement for this operation is

```sql
delete from root.ln.wf02.wt02.status where time<=2017-11-01T16:26:00;
```

In case we hope to merely delete the data before 2017-11-01 16:26:00 in the year of 2017, The SQL statement is:

```sql
delete from root.ln.wf02.wt02.status where time>=2017-01-01T00:00:00 and time<=2017-11-01T16:26:00;
```

IoTDB supports to delete a range of timeseries points. Users can write SQL expressions as follows to specify the delete interval:

```sql
delete from root.ln.wf02.wt02.status where time < 10
delete from root.ln.wf02.wt02.status where time <= 10
delete from root.ln.wf02.wt02.status where time < 20 and time > 10
delete from root.ln.wf02.wt02.status where time <= 20 and time >= 10
delete from root.ln.wf02.wt02.status where time > 20
delete from root.ln.wf02.wt02.status where time >= 20
delete from root.ln.wf02.wt02.status where time = 20
```

Please pay attention that multiple intervals connected by "OR" expression are not supported in delete statement:

```
delete from root.ln.wf02.wt02.status where time > 4 or time < 0
Msg: 303: Check metadata error: For delete statement, where clause can only contain atomic
expressions like : time > XXX, time <= XXX, or two atomic expressions connected by 'AND'
```

If no "where" clause specified in a delete statement, all the data in a timeseries will be deleted.

```sql
delete from root.ln.wf02.wt02.status
```


### Delete Multiple Timeseries

If both the power supply status and hardware version of the ln group wf02 plant wt02 device before 2017-11-01 16:26:00 need to be deleted, [the prefix path with broader meaning or the path with star](../Basic-Concept/Data-Model-and-Terminology.md) can be used to delete the data. The SQL statement for this operation is:

```sql
delete from root.ln.wf02.wt02 where time <= 2017-11-01T16:26:00;
```

or

```sql
delete from root.ln.wf02.wt02.* where time <= 2017-11-01T16:26:00;
```

It should be noted that when the deleted path does not exist, IoTDB will not prompt that the path does not exist, but that the execution is successful, because SQL is a declarative programming method. Unless it is a syntax error, insufficient permissions and so on, it is not considered an error, as shown below:

```
IoTDB> delete from root.ln.wf03.wt02.status where time < now()
Msg: The statement is executed successfully.
```

### Delete Time Partition (experimental)

You may delete all data in a time partition of a database using the following grammar:

```sql
DELETE PARTITION root.ln 0,1,2
```

The `0,1,2` above is the id of the partition that is to be deleted, you can find it from the IoTDB
data folders or convert a timestamp manually to an id using `timestamp / partitionInterval
` (flooring), and the `partitionInterval` should be in your config (if time-partitioning is
supported in your version).

Please notice that this function is experimental and mainly for development, please use it with care.

