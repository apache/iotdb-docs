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

# Operate Metadata

## Database Management

### Create Database

According to the storage model we can set up the corresponding database. Two SQL statements are supported for creating databases, as follows:

```
IoTDB > create database root.ln
IoTDB > create database root.sgcc
```

We can thus create two databases using the above two SQL statements.

It is worth noting that 1 database is recommended.

When the path itself or the parent/child layer of the path is already created as database, the path is then not allowed to be created as database. For example, it is not feasible to create `root.ln.wf01` as database when two databases `root.ln` and `root.sgcc` exist. The system gives the corresponding error prompt as shown below:

```
IoTDB> CREATE DATABASE root.ln.wf01
Msg: 300: root.ln has already been created as database.
IoTDB> create database root.ln.wf01
Msg: 300: root.ln has already been created as database.
```

The LayerName of database can only be characters, numbers, underscores. If you want to set it to pure numbers or contain other characters, you need to enclose the database name with backticks (``). 

Besides, if deploy on Windows system, the LayerName is case-insensitive, which means it's not allowed to create databases `root.ln` and `root.LN` at the same time.

### Show Databases

After creating the database, we can use the [SHOW DATABASES](../Reference/SQL-Reference.md) statement and [SHOW DATABASES \<PathPattern>](../Reference/SQL-Reference.md) to view the databases. The SQL statements are as follows:

```
IoTDB> SHOW DATABASES
IoTDB> SHOW DATABASES root.**
```

The result is as follows:

```
+-------------+----+-------------------------+-----------------------+-----------------------+
|database| ttl|schema_replication_factor|data_replication_factor|time_partition_interval|
+-------------+----+-------------------------+-----------------------+-----------------------+
|    root.sgcc|null|                        2|                      2|                 604800|
|      root.ln|null|                        2|                      2|                 604800|
+-------------+----+-------------------------+-----------------------+-----------------------+
Total line number = 2
It costs 0.060s
```

### Delete Database

User can use the `DELETE DATABASE <PathPattern>` statement to delete all databases matching the pathPattern. Please note the data in the database will also be deleted. 

```
IoTDB > DELETE DATABASE root.ln
IoTDB > DELETE DATABASE root.sgcc
// delete all data, all timeseries and all databases
IoTDB > DELETE DATABASE root.**
```

### Count Databases

User can use the `COUNT DATABASE <PathPattern>` statement to count the number of databases. It is allowed to specify `PathPattern` to count the number of databases matching the `PathPattern`.

SQL statement is as follows:

```
IoTDB> count databases
IoTDB> count databases root.*
IoTDB> count databases root.sgcc.*
IoTDB> count databases root.sgcc
```

The result is as follows:

```
+-------------+
|     database|
+-------------+
|    root.sgcc|
| root.turbine|
|      root.ln|
+-------------+
Total line number = 3
It costs 0.003s

+-------------+
|     database|
+-------------+
|            3|
+-------------+
Total line number = 1
It costs 0.003s

+-------------+
|     database|
+-------------+
|            3|
+-------------+
Total line number = 1
It costs 0.002s

+-------------+
|     database|
+-------------+
|            0|
+-------------+
Total line number = 1
It costs 0.002s

+-------------+
|     database|
+-------------+
|            1|
+-------------+
Total line number = 1
It costs 0.002s
```

### Setting up heterogeneous databases (Advanced operations)

Under the premise of familiar with IoTDB metadata modeling, 
users can set up heterogeneous databases in IoTDB to cope with different production needs.

Currently, the following database heterogeneous parameters are supported:

| Parameter                 | Type    | Description                                   |
| ------------------------- | ------- | --------------------------------------------- |
| TTL                       | Long    | TTL of the Database                           |
| SCHEMA_REPLICATION_FACTOR | Integer | The schema replication number of the Database |
| DATA_REPLICATION_FACTOR   | Integer | The data replication number of the Database   |
| SCHEMA_REGION_GROUP_NUM   | Integer | The SchemaRegionGroup number of the Database  |
| DATA_REGION_GROUP_NUM     | Integer | The DataRegionGroup number of the Database    |

Note the following when configuring heterogeneous parameters:

+ TTL and TIME_PARTITION_INTERVAL must be positive integers.
+ SCHEMA_REPLICATION_FACTOR and DATA_REPLICATION_FACTOR must be smaller than or equal to the number of deployed DataNodes.
+ The function of SCHEMA_REGION_GROUP_NUM and DATA_REGION_GROUP_NUM are related to the parameter `schema_region_group_extension_policy` and `data_region_group_extension_policy` in iotdb-common.properties configuration file. Take DATA_REGION_GROUP_NUM as an example:
    If `data_region_group_extension_policy=CUSTOM` is set, DATA_REGION_GROUP_NUM serves as the number of DataRegionGroups owned by the Database.
    If `data_region_group_extension_policy=AUTO`, DATA_REGION_GROUP_NUM is used as the lower bound of the DataRegionGroup quota owned by the Database. That is, when the Database starts writing data, it will have at least this number of DataRegionGroups.

Users can set any heterogeneous parameters when creating a Database, or adjust some heterogeneous parameters during a stand-alone/distributed IoTDB run.

#### Set heterogeneous parameters when creating a Database

The user can set any of the above heterogeneous parameters when creating a Database. The SQL statement is as follows:

```
CREATE DATABASE prefixPath (WITH databaseAttributeClause (COMMA? databaseAttributeClause)*)?
```

For example:

```
CREATE DATABASE root.db WITH SCHEMA_REPLICATION_FACTOR=1, DATA_REPLICATION_FACTOR=3, SCHEMA_REGION_GROUP_NUM=1, DATA_REGION_GROUP_NUM=2;
```

#### Adjust heterogeneous parameters at run time

Users can adjust some heterogeneous parameters during the IoTDB runtime, as shown in the following SQL statement:

```
ALTER DATABASE prefixPath WITH databaseAttributeClause (COMMA? databaseAttributeClause)*
```

For example:

```
ALTER DATABASE root.db WITH SCHEMA_REGION_GROUP_NUM=1, DATA_REGION_GROUP_NUM=2;
```

Note that only the following heterogeneous parameters can be adjusted at runtime:

+ SCHEMA_REGION_GROUP_NUM
+ DATA_REGION_GROUP_NUM

#### Show heterogeneous databases

The user can query the specific heterogeneous configuration of each Database, and the SQL statement is as follows:

```
SHOW DATABASES DETAILS prefixPath?
```

For example:

```
IoTDB> SHOW DATABASES DETAILS
+--------+--------+-----------------------+---------------------+---------------------+--------------------+-----------------------+-----------------------+------------------+---------------------+---------------------+
|Database|     TTL|SchemaReplicationFactor|DataReplicationFactor|TimePartitionInterval|SchemaRegionGroupNum|MinSchemaRegionGroupNum|MaxSchemaRegionGroupNum|DataRegionGroupNum|MinDataRegionGroupNum|MaxDataRegionGroupNum|
+--------+--------+-----------------------+---------------------+---------------------+--------------------+-----------------------+-----------------------+------------------+---------------------+---------------------+
|root.db1|    null|                      1|                    3|            604800000|                   0|                      1|                      1|                 0|                    2|                    2|
|root.db2|86400000|                      1|                    1|            604800000|                   0|                      1|                      1|                 0|                    2|                    2|
|root.db3|    null|                      1|                    1|            604800000|                   0|                      1|                      1|                 0|                    2|                    2|
+--------+--------+-----------------------+---------------------+---------------------+--------------------+-----------------------+-----------------------+------------------+---------------------+---------------------+
Total line number = 3
It costs 0.058s
```

The query results in each column are as follows:

+ The name of the Database
+ The TTL of the Database
+ The schema replication number of the Database
+ The data replication number of the Database
+ The time partition interval of the Database
+ The current SchemaRegionGroup number of the Database
+ The required minimum SchemaRegionGroup number of the Database
+ The permitted maximum SchemaRegionGroup number of the Database
+ The current DataRegionGroup number of the Database
+ The required minimum DataRegionGroup number of the Database
+ The permitted maximum DataRegionGroup number of the Database

### TTL

IoTDB supports storage-level TTL settings, which means it is able to delete old data automatically and periodically. The benefit of using TTL is that hopefully you can control the total disk space usage and prevent the machine from running out of disks. Moreover, the query performance may downgrade as the total number of files goes up and the memory usage also increase as there are more files. Timely removing such files helps to keep at a high query performance level and reduce memory usage.

The default unit of TTL is milliseconds. If the time precision in the configuration file changes to another, the TTL is still set to milliseconds.

#### Set TTL

The SQL Statement for setting TTL is as follow:

```
IoTDB> set ttl to root.ln 3600000
```

This example means that for data in `root.ln`, only 3600000 ms, that is, the latest 1 hour will remain, the older one is removed or made invisible.

```
IoTDB> set ttl to root.sgcc.** 3600000
```

It supports setting TTL for databases in a path. This example represents setting TTL for all databases in the `root.sgcc` path.

```
IoTDB> set ttl to root.** 3600000
```

This example represents setting TTL for all databases.

#### Unset TTL

To unset TTL, we can use follwing SQL statement:

```
IoTDB> unset ttl to root.ln
```

After unset TTL, all data will be accepted in `root.ln`.

```
IoTDB> unset ttl to root.sgcc.**
```

Unset the TTL setting for all databases in the `root.sgcc` path.

```
IoTDB> unset ttl to root.**
```

Unset the TTL setting for all databases.

#### Show TTL

To Show TTL, we can use following SQL statement:

```
IoTDB> SHOW ALL TTL
IoTDB> SHOW TTL ON StorageGroupNames
```

The SHOW ALL TTL example gives the TTL for all databases.
The SHOW TTL ON root.ln,root.sgcc,root.DB example shows the TTL for the three storage 
groups specified.
Note: the TTL for databases that do not have a TTL set will display as null.

```
IoTDB> show all ttl
+----------+-------+
| database|ttl(ms)|
+---------+-------+
|  root.ln|3600000|
|root.sgcc|   null|
|  root.DB|3600000|
+----------+-------+
```

## Device Template

IoTDB supports the device template function, enabling different entities of the same type to share metadata, reduce the memory usage of metadata, and simplify the management of numerous entities and measurements.

Note: The `device` keyword in the following statements can be omitted.

### Create Device Template

The SQL syntax for creating a metadata template is as follows:

```sql
CREATE DEVICE TEMPLATE <templateName> ALIGNED? '(' <measurementId> <attributeClauses> [',' <measurementId> <attributeClauses>]+ ')'
```

**Example 1:** Create a template containing two non-aligned timeseires

```shell
IoTDB> create device template t1 (temperature FLOAT encoding=RLE, status BOOLEAN encoding=PLAIN compression=SNAPPY)
```

**Example 2:** Create a template containing a group of aligned timeseires

```shell
IoTDB> create device template t2 aligned (lat FLOAT encoding=Gorilla, lon FLOAT encoding=Gorilla)
```

The` lat` and `lon` measurements are aligned.

### Set Device Template

After a device template is created, it should be set to specific path before creating related timeseries or insert data.

**It should be ensured that the related database has been set before setting template.**

**It is recommended to set device template to database path. It is not suggested to set device template to some path above database**

**It is forbidden to create timeseries under a path setting s tedeviceplate. Device template shall not be set on a prefix path of an existing timeseries.**

The SQL Statement for setting device template is as follow:

```shell
IoTDB> set device template t1 to root.sg1.d1
```

### Activate Device Template

After setting the device template, with the system enabled to auto create schema, you can insert data into the timeseries. For example, suppose there's a database root.sg1 and t1 has been set to root.sg1.d1, then timeseries like root.sg1.d1.temperature and root.sg1.d1.status are available and data points can be inserted.


**Attention**: Before inserting data or the system not enabled to auto create schema, timeseries defined by the device template will not be created. You can use the following SQL statement to create the timeseries or activate the  templdeviceate, act before inserting data:

```shell
IoTDB> create timeseries using device template on root.sg1.d1
```

**Example:** Execute the following statement

```shell
IoTDB> set device template t1 to root.sg1.d1
IoTDB> set device template t2 to root.sg1.d2
IoTDB> create timeseries using device template on root.sg1.d1
IoTDB> create timeseries using device template on root.sg1.d2
```

Show the time series:

```sql
show timeseries root.sg1.**
````

```shell
+-----------------------+-----+-------------+--------+--------+-----------+----+----------+--------+-------------------+
|             timeseries|alias|     database|dataType|encoding|compression|tags|attributes|deadband|deadband parameters|
+-----------------------+-----+-------------+--------+--------+-----------+----+----------+--------+-------------------+
|root.sg1.d1.temperature| null|     root.sg1|   FLOAT|     RLE|     SNAPPY|null|      null|    null|               null|
|     root.sg1.d1.status| null|     root.sg1| BOOLEAN|   PLAIN|     SNAPPY|null|      null|    null|               null|
|        root.sg1.d2.lon| null|     root.sg1|   FLOAT| GORILLA|     SNAPPY|null|      null|    null|               null|
|        root.sg1.d2.lat| null|     root.sg1|   FLOAT| GORILLA|     SNAPPY|null|      null|    null|               null|
+-----------------------+-----+-------------+--------+--------+-----------+----+----------+--------+-------------------+
```

Show the devices:

```sql
show devices root.sg1.**
````

```shell
+---------------+---------+
|        devices|isAligned|
+---------------+---------+
|    root.sg1.d1|    false|
|    root.sg1.d2|     true|
+---------------+---------+
````

### Show Device Template

- Show all device templates

The SQL statement looks like this:

```shell
IoTDB> show device templates
```

The execution result is as follows:

```shell
+-------------+
|template name|
+-------------+
|           t2|
|           t1|
+-------------+
```

- Show nodes under in device template

The SQL statement looks like this:

```shell
IoTDB> show nodes in device template t1
```

The execution result is as follows:

```shell
+-----------+--------+--------+-----------+
|child nodes|dataType|encoding|compression|
+-----------+--------+--------+-----------+
|temperature|   FLOAT|     RLE|     SNAPPY|
|     status| BOOLEAN|   PLAIN|     SNAPPY|
+-----------+--------+--------+-----------+
```

- Show the path prefix where a device template is set

```shell
IoTDB> show paths set device template t1
```

The execution result is as follows:

```shell
+-----------+
|child paths|
+-----------+
|root.sg1.d1|
+-----------+
```

- Show the path prefix where a device template is used (i.e. the time series has been created)

```shell
IoTDB> show paths using device template t1
```

The execution result is as follows:

```shell
+-----------+
|child paths|
+-----------+
|root.sg1.d1|
+-----------+
```

### Deactivate device Template

To delete a group of timeseries represented by device template, namely deactivate the device template, use the following SQL statement:

```shell
IoTDB> delete timeseries of device template t1 from root.sg1.d1
```

or

```shell
IoTDB> deactivate device template t1 from root.sg1.d1
```

The deactivation supports batch process. 

```shell
IoTDB> delete timeseries of device template t1 from root.sg1.*, root.sg2.*
```

or

```shell
IoTDB> deactivate device template t1 from root.sg1.*, root.sg2.*
```

If the template name is not provided in sql, all template activation on paths matched by given path pattern will be removed.

### Unset Device Template

The SQL Statement for unsetting device template is as follow:

```shell
IoTDB> unset device template t1 from root.sg1.d1
```

**Attention**: It should be guaranteed that none of the timeseries represented by the target device template exists, before unset it. It can be achieved by deactivation operation.

### Drop Device Template

The SQL Statement for dropping device template is as follow:

```shell
IoTDB> drop device template t1
```

**Attention**: Dropping an already set template is not supported.

### Alter Device Template

In a scenario where measurements need to be added, you can modify the  template to add measurements to all devicesdevice using the device template.

The SQL Statement for altering device template is as follow:

```shell
IoTDB> alter device template t1 add (speed FLOAT encoding=RLE, FLOAT TEXT encoding=PLAIN compression=SNAPPY)
```

**When executing data insertion to devices with device template set on related prefix path and there are measurements not present in this device template, the measurements will be auto added to this device template.**

## Timeseries Management

### Create Timeseries

According to the storage model selected before, we can create corresponding timeseries in the two databases respectively. The SQL statements for creating timeseries are as follows:

```
IoTDB > create timeseries root.ln.wf01.wt01.status with datatype=BOOLEAN,encoding=PLAIN
IoTDB > create timeseries root.ln.wf01.wt01.temperature with datatype=FLOAT,encoding=RLE
IoTDB > create timeseries root.ln.wf02.wt02.hardware with datatype=TEXT,encoding=PLAIN
IoTDB > create timeseries root.ln.wf02.wt02.status with datatype=BOOLEAN,encoding=PLAIN
IoTDB > create timeseries root.sgcc.wf03.wt01.status with datatype=BOOLEAN,encoding=PLAIN
IoTDB > create timeseries root.sgcc.wf03.wt01.temperature with datatype=FLOAT,encoding=RLE
```

From v0.13, you can use a simplified version of the SQL statements to create timeseries:

```
IoTDB > create timeseries root.ln.wf01.wt01.status BOOLEAN encoding=PLAIN
IoTDB > create timeseries root.ln.wf01.wt01.temperature FLOAT encoding=RLE
IoTDB > create timeseries root.ln.wf02.wt02.hardware TEXT encoding=PLAIN
IoTDB > create timeseries root.ln.wf02.wt02.status BOOLEAN encoding=PLAIN
IoTDB > create timeseries root.sgcc.wf03.wt01.status BOOLEAN encoding=PLAIN
IoTDB > create timeseries root.sgcc.wf03.wt01.temperature FLOAT encoding=RLE
```

Notice that when in the CREATE TIMESERIES statement the encoding method conflicts with the data type, the system gives the corresponding error prompt as shown below:

```
IoTDB > create timeseries root.ln.wf02.wt02.status WITH DATATYPE=BOOLEAN, ENCODING=TS_2DIFF
error: encoding TS_2DIFF does not support BOOLEAN
```

Please refer to [Encoding](../Basic-Concept/Encoding-and-Compression.md) for correspondence between data type and encoding.

### Create Aligned Timeseries

The SQL statement for creating a group of timeseries are as follows:

```
IoTDB> CREATE ALIGNED TIMESERIES root.ln.wf01.GPS(latitude FLOAT encoding=PLAIN compressor=SNAPPY, longitude FLOAT encoding=PLAIN compressor=SNAPPY)
```

You can set different datatype, encoding, and compression for the timeseries in a group of aligned timeseries

It is also supported to set an alias, tag, and attribute for aligned timeseries.

### Delete Timeseries

To delete the timeseries we created before, we are able to use `(DELETE | DROP) TimeSeries <PathPattern>` statement.

The usage are as follows:

```
IoTDB> delete timeseries root.ln.wf01.wt01.status
IoTDB> delete timeseries root.ln.wf01.wt01.temperature, root.ln.wf02.wt02.hardware
IoTDB> delete timeseries root.ln.wf02.*
IoTDB> drop timeseries root.ln.wf02.*
```

### Show Timeseries

* SHOW LATEST? TIMESERIES pathPattern? whereClause? limitClause?

    There are four optional clauses added in SHOW TIMESERIES, return information of time series 

Timeseries information includes: timeseries path, alias of measurement, database it belongs to, data type, encoding type, compression type, tags and attributes.

Examples:

* SHOW TIMESERIES

    presents all timeseries information in JSON form

* SHOW TIMESERIES <`PathPattern`> 

    returns all timeseries information matching the given <`PathPattern`>. SQL statements are as follows:

```
IoTDB> show timeseries root.**
IoTDB> show timeseries root.ln.**
```

The results are shown below respectively:

```
+-------------------------------+--------+-------------+--------+--------+-----------+-------------------------------------------+--------------------------------------------------------+--------+-------------------+
|                     timeseries|   alias|     database|dataType|encoding|compression|                                       tags|                                              attributes|deadband|deadband parameters|
+-------------------------------+--------+-------------+--------+--------+-----------+-------------------------------------------+--------------------------------------------------------+--------+-------------------+
|root.sgcc.wf03.wt01.temperature|    null|    root.sgcc|   FLOAT|     RLE|     SNAPPY|                                       null|                                                    null|    null|               null|
|     root.sgcc.wf03.wt01.status|    null|    root.sgcc| BOOLEAN|   PLAIN|     SNAPPY|                                       null|                                                    null|    null|               null|
|             root.turbine.d1.s1|newAlias| root.turbine|   FLOAT|     RLE|     SNAPPY|{"newTag1":"newV1","tag4":"v4","tag3":"v3"}|{"attr2":"v2","attr1":"newV1","attr4":"v4","attr3":"v3"}|    null|               null|
|     root.ln.wf02.wt02.hardware|    null|      root.ln|    TEXT|   PLAIN|     SNAPPY|                                       null|                                                    null|    null|               null|
|       root.ln.wf02.wt02.status|    null|      root.ln| BOOLEAN|   PLAIN|     SNAPPY|                                       null|                                                    null|    null|               null|
|  root.ln.wf01.wt01.temperature|    null|      root.ln|   FLOAT|     RLE|     SNAPPY|                                       null|                                                    null|    null|               null|
|       root.ln.wf01.wt01.status|    null|      root.ln| BOOLEAN|   PLAIN|     SNAPPY|                                       null|                                                    null|    null|               null|
+-------------------------------+--------+-------------+--------+--------+-----------+-------------------------------------------+--------------------------------------------------------+--------+-------------------+
Total line number = 7
It costs 0.016s

+-----------------------------+-----+-------------+--------+--------+-----------+----+----------+--------+-------------------+
|                   timeseries|alias|     database|dataType|encoding|compression|tags|attributes|deadband|deadband parameters|
+-----------------------------+-----+-------------+--------+--------+-----------+----+----------+--------+-------------------+
|   root.ln.wf02.wt02.hardware| null|      root.ln|    TEXT|   PLAIN|     SNAPPY|null|      null|    null|               null|
|     root.ln.wf02.wt02.status| null|      root.ln| BOOLEAN|   PLAIN|     SNAPPY|null|      null|    null|               null|
|root.ln.wf01.wt01.temperature| null|      root.ln|   FLOAT|     RLE|     SNAPPY|null|      null|    null|               null|
|     root.ln.wf01.wt01.status| null|      root.ln| BOOLEAN|   PLAIN|     SNAPPY|null|      null|    null|               null|
+-----------------------------+-----+-------------+--------+--------+-----------+----+----------+--------+-------------------+
Total line number = 4
It costs 0.004s
```

* SHOW TIMESERIES LIMIT INT OFFSET INT

    returns all the timeseries information start from the offset and limit the number of series returned. For example,

```
show timeseries root.ln.** limit 10 offset 10
```

* SHOW TIMESERIES WHERE TIMESERIES contains 'containStr'

    The query result set is filtered by string fuzzy matching based on the names of the timeseries. For example:

```
show timeseries root.ln.** where timeseries contains 'wf01.wt'
```

The result is shown below:

```
+-------------------------------+--------+-------------+--------+--------+-----------+-------------------------------------------+--------------------------------------------------------+--------+-------------------+
|                     timeseries|   alias|     database|dataType|encoding|compression|                                       tags|                                              attributes|deadband|deadband parameters|
+-------------------------------+--------+-------------+--------+--------+-----------+-------------------------------------------+--------------------------------------------------------+--------+-------------------+
|  root.ln.wf01.wt01.temperature|    null|      root.ln|   FLOAT|     RLE|     SNAPPY|                                       null|                                                    null|    null|               null|
|       root.ln.wf01.wt01.status|    null|      root.ln| BOOLEAN|   PLAIN|     SNAPPY|                                       null|                                                    null|    null|               null|
+-------------------------------+--------+-------------+--------+--------+-----------+-------------------------------------------+--------------------------------------------------------+--------+-------------------+
Total line number = 2
It costs 0.016s
```

* SHOW TIMESERIES WHERE DataType=type

    The query result set is filtered by data type. For example:

```
show timeseries root.ln.** where dataType=FLOAT
```

The result is shown below:

```
+-------------------------------+--------+-------------+--------+--------+-----------+-------------------------------------------+--------------------------------------------------------+--------+-------------------+
|                     timeseries|   alias|     database|dataType|encoding|compression|                                       tags|                                              attributes|deadband|deadband parameters|
+-------------------------------+--------+-------------+--------+--------+-----------+-------------------------------------------+--------------------------------------------------------+--------+-------------------+
|root.sgcc.wf03.wt01.temperature|    null|    root.sgcc|   FLOAT|     RLE|     SNAPPY|                                       null|                                                    null|    null|               null|
|             root.turbine.d1.s1|newAlias| root.turbine|   FLOAT|     RLE|     SNAPPY|{"newTag1":"newV1","tag4":"v4","tag3":"v3"}|{"attr2":"v2","attr1":"newV1","attr4":"v4","attr3":"v3"}|    null|               null|
|  root.ln.wf01.wt01.temperature|    null|      root.ln|   FLOAT|     RLE|     SNAPPY|                                       null|                                                    null|    null|               null|
+-------------------------------+--------+-------------+--------+--------+-----------+-------------------------------------------+--------------------------------------------------------+--------+-------------------+
Total line number = 3
It costs 0.016s

```


* SHOW LATEST TIMESERIES

    all the returned timeseries information should be sorted in descending order of the last timestamp of timeseries

It is worth noting that when the queried path does not exist, the system will return no timeseries.  


### Count Timeseries

IoTDB is able to use `COUNT TIMESERIES <Path>` to count the number of timeseries matching the path. SQL statements are as follows:

* `WHERE` condition could be used to fuzzy match a time series name with the following syntax: `COUNT TIMESERIES <Path> WHERE TIMESERIES contains 'containStr'`.
* `WHERE` condition could be used to filter result by data type with the syntax: `COUNT TIMESERIES <Path> WHERE DataType=<DataType>'`.
* `WHERE` condition could be used to filter result by tags with the syntax: `COUNT TIMESERIES <Path> WHERE TAGS(key)='value'` or `COUNT TIMESERIES <Path> WHERE TAGS(key) contains 'value'`.
* `LEVEL` could be defined to show count the number of timeseries of each node at the given level in current Metadata Tree. This could be used to query the number of sensors under each device. The grammar is: `COUNT TIMESERIES <Path> GROUP BY LEVEL=<INTEGER>`.


```
IoTDB > COUNT TIMESERIES root.**
IoTDB > COUNT TIMESERIES root.ln.**
IoTDB > COUNT TIMESERIES root.ln.*.*.status
IoTDB > COUNT TIMESERIES root.ln.wf01.wt01.status
IoTDB > COUNT TIMESERIES root.** WHERE TIMESERIES contains 'sgcc' 
IoTDB > COUNT TIMESERIES root.** WHERE DATATYPE = INT64
IoTDB > COUNT TIMESERIES root.** WHERE TAGS(unit) contains 'c' 
IoTDB > COUNT TIMESERIES root.** WHERE TAGS(unit) = 'c' 
IoTDB > COUNT TIMESERIES root.** WHERE TIMESERIES contains 'sgcc' group by level = 1
```

For example, if there are several timeseries (use `show timeseries` to show all timeseries):

```
+-------------------------------+--------+-------------+--------+--------+-----------+-------------------------------------------+--------------------------------------------------------+--------+-------------------+
|                     timeseries|   alias|     database|dataType|encoding|compression|                                       tags|                                              attributes|deadband|deadband parameters|
+-------------------------------+--------+-------------+--------+--------+-----------+-------------------------------------------+--------------------------------------------------------+--------+-------------------+
|root.sgcc.wf03.wt01.temperature|    null|    root.sgcc|   FLOAT|     RLE|     SNAPPY|                                       null|                                                    null|    null|               null|
|     root.sgcc.wf03.wt01.status|    null|    root.sgcc| BOOLEAN|   PLAIN|     SNAPPY|                                       null|                                                    null|    null|               null|
|             root.turbine.d1.s1|newAlias| root.turbine|   FLOAT|     RLE|     SNAPPY|{"newTag1":"newV1","tag4":"v4","tag3":"v3"}|{"attr2":"v2","attr1":"newV1","attr4":"v4","attr3":"v3"}|    null|               null|
|     root.ln.wf02.wt02.hardware|    null|      root.ln|    TEXT|   PLAIN|     SNAPPY|                               {"unit":"c"}|                                                    null|    null|               null|
|       root.ln.wf02.wt02.status|    null|      root.ln| BOOLEAN|   PLAIN|     SNAPPY|                    {"description":"test1"}|                                                    null|    null|               null|
|  root.ln.wf01.wt01.temperature|    null|      root.ln|   FLOAT|     RLE|     SNAPPY|                                       null|                                                    null|    null|               null|
|       root.ln.wf01.wt01.status|    null|      root.ln| BOOLEAN|   PLAIN|     SNAPPY|                                       null|                                                    null|    null|               null|
+-------------------------------+--------+-------------+--------+--------+-----------+-------------------------------------------+--------------------------------------------------------+--------+-------------------+
Total line number = 7
It costs 0.004s
```

Then the Metadata Tree will be as below:

<center><img style="width:100%; max-width:600px; margin-left:auto; margin-right:auto; display:block;" src="https://alioss.timecho.com/docs/img/github/69792176-1718f400-1201-11ea-861a-1a83c07ca144.jpg"></center>

As can be seen, `root` is considered as `LEVEL=0`. So when you enter statements such as:

```
IoTDB > COUNT TIMESERIES root.** GROUP BY LEVEL=1
IoTDB > COUNT TIMESERIES root.ln.** GROUP BY LEVEL=2
IoTDB > COUNT TIMESERIES root.ln.wf01.* GROUP BY LEVEL=2
```

You will get following results:

```
+------------+-----------------+
|      column|count(timeseries)|
+------------+-----------------+
|   root.sgcc|                2|
|root.turbine|                1|
|     root.ln|                4|
+------------+-----------------+
Total line number = 3
It costs 0.002s

+------------+-----------------+
|      column|count(timeseries)|
+------------+-----------------+
|root.ln.wf02|                2|
|root.ln.wf01|                2|
+------------+-----------------+
Total line number = 2
It costs 0.002s

+------------+-----------------+
|      column|count(timeseries)|
+------------+-----------------+
|root.ln.wf01|                2|
+------------+-----------------+
Total line number = 1
It costs 0.002s
```

> Note: The path of timeseries is just a filter condition, which has no relationship with the definition of level.

### Tag and Attribute Management

We can also add an alias, extra tag and attribute information while creating one timeseries.

The differences between tag and attribute are:

* Tag could be used to query the path of timeseries, we will maintain an inverted index in memory on the tag: Tag -> Timeseries
* Attribute could only be queried by timeseries path : Timeseries -> Attribute

The SQL statements for creating timeseries with extra tag and attribute information are extended as follows:

```
create timeseries root.turbine.d1.s1(temprature) with datatype=FLOAT, encoding=RLE, compression=SNAPPY tags(tag1=v1, tag2=v2) attributes(attr1=v1, attr2=v2)
```

The `temprature` in the brackets is an alias for the sensor `s1`. So we can use `temprature` to replace `s1` anywhere.

> IoTDB also supports using AS function to set alias. The difference between the two is: the alias set by the AS function is used to replace the whole time series name, temporary and not bound with the time series; while the alias mentioned above is only used as the alias of the sensor, which is bound with it and can be used equivalent to the original sensor name.

> Notice that the size of the extra tag and attribute information shouldn't exceed the `tag_attribute_total_size`.

We can update the tag information after creating it as following:

* Rename the tag/attribute key

```
ALTER timeseries root.turbine.d1.s1 RENAME tag1 TO newTag1
```

* Reset the tag/attribute value

```
ALTER timeseries root.turbine.d1.s1 SET newTag1=newV1, attr1=newV1
```

* Delete the existing tag/attribute

```
ALTER timeseries root.turbine.d1.s1 DROP tag1, tag2
```

* Add new tags

```
ALTER timeseries root.turbine.d1.s1 ADD TAGS tag3=v3, tag4=v4
```

* Add new attributes

```
ALTER timeseries root.turbine.d1.s1 ADD ATTRIBUTES attr3=v3, attr4=v4
```

* Upsert alias, tags and attributes

> add alias or a new key-value if the alias or key doesn't exist, otherwise, update the old one with new value.

```
ALTER timeseries root.turbine.d1.s1 UPSERT ALIAS=newAlias TAGS(tag3=v3, tag4=v4) ATTRIBUTES(attr3=v3, attr4=v4)
```

* Show timeseries using tags. Use TAGS(tagKey) to identify the tags used as filter key

```
SHOW TIMESERIES (<`PathPattern`>)? timeseriesWhereClause
```

returns all the timeseries information that satisfy the where condition and match the pathPattern. SQL statements are as follows:

```
ALTER timeseries root.ln.wf02.wt02.hardware ADD TAGS unit=c
ALTER timeseries root.ln.wf02.wt02.status ADD TAGS description=test1
show timeseries root.ln.** where TAGS(unit)='c'
show timeseries root.ln.** where TAGS(description) contains 'test1'
```

The results are shown below respectly:

```
+--------------------------+-----+-------------+--------+--------+-----------+------------+----------+--------+-------------------+
|                timeseries|alias|     database|dataType|encoding|compression|        tags|attributes|deadband|deadband parameters|
+--------------------------+-----+-------------+--------+--------+-----------+------------+----------+--------+-------------------+
|root.ln.wf02.wt02.hardware| null|      root.ln|    TEXT|   PLAIN|     SNAPPY|{"unit":"c"}|      null|    null|               null|
+--------------------------+-----+-------------+--------+--------+-----------+------------+----------+--------+-------------------+
Total line number = 1
It costs 0.005s

+------------------------+-----+-------------+--------+--------+-----------+-----------------------+----------+--------+-------------------+
|              timeseries|alias|     database|dataType|encoding|compression|                   tags|attributes|deadband|deadband parameters|
+------------------------+-----+-------------+--------+--------+-----------+-----------------------+----------+--------+-------------------+
|root.ln.wf02.wt02.status| null|      root.ln| BOOLEAN|   PLAIN|     SNAPPY|{"description":"test1"}|      null|    null|               null|
+------------------------+-----+-------------+--------+--------+-----------+-----------------------+----------+--------+-------------------+
Total line number = 1
It costs 0.004s
```

- count timeseries using tags

```
COUNT TIMESERIES (<`PathPattern`>)? timeseriesWhereClause
COUNT TIMESERIES (<`PathPattern`>)? timeseriesWhereClause GROUP BY LEVEL=<INTEGER>
```

returns all the number of timeseries that satisfy the where condition and match the pathPattern. SQL statements are as follows:

```
count timeseries
count timeseries root.** where TAGS(unit)='c'
count timeseries root.** where TAGS(unit)='c' group by level = 2
```

The results are shown below respectly :

```
IoTDB> count timeseries
+-----------------+
|count(timeseries)|
+-----------------+
|                6|
+-----------------+
Total line number = 1
It costs 0.019s
IoTDB> count timeseries root.** where TAGS(unit)='c'
+-----------------+
|count(timeseries)|
+-----------------+
|                2|
+-----------------+
Total line number = 1
It costs 0.020s
IoTDB> count timeseries root.** where TAGS(unit)='c' group by level = 2
+--------------+-----------------+
|        column|count(timeseries)|
+--------------+-----------------+
|  root.ln.wf02|                2|
|  root.ln.wf01|                0|
|root.sgcc.wf03|                0|
+--------------+-----------------+
Total line number = 3
It costs 0.011s
```

> Notice that, we only support one condition in the where clause. Either it's an equal filter or it is an `contains` filter. In both case, the property in the where condition must be a tag.

create aligned timeseries

```
create aligned timeseries root.sg1.d1(s1 INT32 tags(tag1=v1, tag2=v2) attributes(attr1=v1, attr2=v2), s2 DOUBLE tags(tag3=v3, tag4=v4) attributes(attr3=v3, attr4=v4))
```

The execution result is as follows:

```
IoTDB> show timeseries
+--------------+-----+-------------+--------+--------+-----------+-------------------------+---------------------------+--------+-------------------+
|    timeseries|alias|     database|dataType|encoding|compression|                     tags|                 attributes|deadband|deadband parameters|
+--------------+-----+-------------+--------+--------+-----------+-------------------------+---------------------------+--------+-------------------+
|root.sg1.d1.s1| null|     root.sg1|   INT32|     RLE|     SNAPPY|{"tag1":"v1","tag2":"v2"}|{"attr2":"v2","attr1":"v1"}|    null|               null|
|root.sg1.d1.s2| null|     root.sg1|  DOUBLE| GORILLA|     SNAPPY|{"tag4":"v4","tag3":"v3"}|{"attr4":"v4","attr3":"v3"}|    null|               null|
+--------------+-----+-------------+--------+--------+-----------+-------------------------+---------------------------+--------+-------------------+
```

Support query：

```
IoTDB> show timeseries where TAGS(tag1)='v1'
+--------------+-----+-------------+--------+--------+-----------+-------------------------+---------------------------+--------+-------------------+
|    timeseries|alias|     database|dataType|encoding|compression|                     tags|                 attributes|deadband|deadband parameters|
+--------------+-----+-------------+--------+--------+-----------+-------------------------+---------------------------+--------+-------------------+
|root.sg1.d1.s1| null|     root.sg1|   INT32|     RLE|     SNAPPY|{"tag1":"v1","tag2":"v2"}|{"attr2":"v2","attr1":"v1"}|    null|               null|
+--------------+-----+-------------+--------+--------+-----------+-------------------------+---------------------------+--------+-------------------+
```

The above operations are supported for timeseries tag, attribute updates, etc.

## Node Management

### Show Child Paths

```
SHOW CHILD PATHS pathPattern
```

Return all child paths and their node types of all the paths matching pathPattern.

node types: ROOT -> DB INTERNAL -> DATABASE -> INTERNAL -> DEVICE -> TIMESERIES


Example：

* return the child paths of root.ln：show child paths root.ln

```
+------------+----------+
| child paths|node types|
+------------+----------+
|root.ln.wf01|  INTERNAL|
|root.ln.wf02|  INTERNAL|
+------------+----------+
Total line number = 2
It costs 0.002s
```

> get all paths in form of root.xx.xx.xx：show child paths root.xx.xx

### Show Child Nodes

```
SHOW CHILD NODES pathPattern
```

Return all child nodes of the pathPattern.

Example：

* return the child nodes of root：show child nodes root

```
+------------+
| child nodes|
+------------+
|          ln|
+------------+
```

* return the child nodes of root.ln：show child nodes root.ln

```
+------------+
| child nodes|
+------------+
|        wf01|
|        wf02|
+------------+
```

### Count Nodes

IoTDB is able to use `COUNT NODES <PathPattern> LEVEL=<INTEGER>` to count the number of nodes at
 the given level in current Metadata Tree considering a given pattern. IoTDB will find paths that
  match the pattern and counts distinct nodes at the specified level among the matched paths.
  This could be used to query the number of devices with specified measurements. The usage are as
   follows:

```
IoTDB > COUNT NODES root.** LEVEL=2
IoTDB > COUNT NODES root.ln.** LEVEL=2
IoTDB > COUNT NODES root.ln.wf01.** LEVEL=3
IoTDB > COUNT NODES root.**.temperature LEVEL=3
```

As for the above mentioned example and Metadata tree, you can get following results:

```
+------------+
|count(nodes)|
+------------+
|           4|
+------------+
Total line number = 1
It costs 0.003s

+------------+
|count(nodes)|
+------------+
|           2|
+------------+
Total line number = 1
It costs 0.002s

+------------+
|count(nodes)|
+------------+
|           1|
+------------+
Total line number = 1
It costs 0.002s

+------------+
|count(nodes)|
+------------+
|           2|
+------------+
Total line number = 1
It costs 0.002s
```

> Note: The path of timeseries is just a filter condition, which has no relationship with the definition of level.

### Show Devices

* SHOW DEVICES pathPattern? (WITH DATABASE)? devicesWhereClause? limitClause?

Similar to `Show Timeseries`, IoTDB also supports two ways of viewing devices:

* `SHOW DEVICES` statement presents all devices' information, which is equal to `SHOW DEVICES root.**`.
* `SHOW DEVICES <PathPattern>` statement specifies the `PathPattern` and returns the devices information matching the pathPattern and under the given level.
* `WHERE` condition supports `DEVICE contains 'xxx'`  to do a fuzzy query based on the device name.

SQL statement is as follows:

```
IoTDB> show devices
IoTDB> show devices root.ln.**
IoTDB> show devices root.ln.** where device contains 't'
```

You can get results below:

```
+-------------------+---------+
|            devices|isAligned|
+-------------------+---------+
|  root.ln.wf01.wt01|    false|
|  root.ln.wf02.wt02|    false|
|root.sgcc.wf03.wt01|    false|
|    root.turbine.d1|    false|
+-------------------+---------+
Total line number = 4
It costs 0.002s

+-----------------+---------+
|          devices|isAligned|
+-----------------+---------+
|root.ln.wf01.wt01|    false|
|root.ln.wf02.wt02|    false|
+-----------------+---------+
Total line number = 2
It costs 0.001s
```

`isAligned` indicates whether the timeseries under the device are aligned.

To view devices' information with database, we can use `SHOW DEVICES WITH DATABASE` statement.

* `SHOW DEVICES WITH DATABASE` statement presents all devices' information with their database.
* `SHOW DEVICES <PathPattern> WITH DATABASE` statement specifies the `PathPattern` and returns the 
    devices' information under the given level with their database information.

SQL statement is as follows:

```
IoTDB> show devices with database
IoTDB> show devices root.ln.** with database
```

You can get results below:

```
+-------------------+-------------+---------+
|            devices|     database|isAligned|
+-------------------+-------------+---------+
|  root.ln.wf01.wt01|      root.ln|    false|
|  root.ln.wf02.wt02|      root.ln|    false|
|root.sgcc.wf03.wt01|    root.sgcc|    false|
|    root.turbine.d1| root.turbine|    false|
+-------------------+-------------+---------+
Total line number = 4
It costs 0.003s

+-----------------+-------------+---------+
|          devices|     database|isAligned|
+-----------------+-------------+---------+
|root.ln.wf01.wt01|      root.ln|    false|
|root.ln.wf02.wt02|      root.ln|    false|
+-----------------+-------------+---------+
Total line number = 2
It costs 0.001s
```

### Count Devices

* COUNT DEVICES /<PathPattern/>

The above statement is used to count the number of devices. At the same time, it is allowed to specify `PathPattern` to count the number of devices matching the `PathPattern`.

SQL statement is as follows:

```
IoTDB> show devices
IoTDB> count devices
IoTDB> count devices root.ln.**
```

You can get results below:

```
+-------------------+---------+
|            devices|isAligned|
+-------------------+---------+
|root.sgcc.wf03.wt03|    false|
|    root.turbine.d1|    false|
|  root.ln.wf02.wt02|    false|
|  root.ln.wf01.wt01|    false|
+-------------------+---------+
Total line number = 4
It costs 0.024s

+--------------+
|count(devices)|
+--------------+
|             4|
+--------------+
Total line number = 1
It costs 0.004s

+--------------+
|count(devices)|
+--------------+
|             2|
+--------------+
Total line number = 1
It costs 0.004s
```

