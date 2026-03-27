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

# SQL Manual

## DATABASE MANAGEMENT

For more details, see document [Operate-Metadata](../Basic-Concept/Operate-Metadata.md).

### Create Database

```sql
IoTDB > create database root.ln
IoTDB > create database root.sgcc
```

### Show Databases

```sql
IoTDB> SHOW DATABASES
IoTDB> SHOW DATABASES root.**
```

### Delete Database

```sql
IoTDB > DELETE DATABASE root.ln
IoTDB > DELETE DATABASE root.sgcc
// delete all data, all timeseries and all databases
IoTDB > DELETE DATABASE root.**
```

### Count Databases

```sql
IoTDB> count databases
IoTDB> count databases root.*
IoTDB> count databases root.sgcc.*
IoTDB> count databases root.sgcc
```

### Setting up heterogeneous databases (Advanced operations)

#### Set heterogeneous parameters when creating a Database

```sql
CREATE DATABASE root.db WITH SCHEMA_REPLICATION_FACTOR=1, DATA_REPLICATION_FACTOR=3, SCHEMA_REGION_GROUP_NUM=1, DATA_REGION_GROUP_NUM=2;
```

#### Adjust heterogeneous parameters at run time

```sql
ALTER DATABASE root.db WITH SCHEMA_REGION_GROUP_NUM=1, DATA_REGION_GROUP_NUM=2;
```

#### Show heterogeneous databases

```sql
SHOW DATABASES DETAILS
```

### TTL

#### Set TTL

```sql
IoTDB> set ttl to root.ln 3600000
IoTDB> set ttl to root.sgcc.** 3600000
IoTDB> set ttl to root.** 3600000
```

#### Unset TTL

```sql
IoTDB> unset ttl from root.ln
IoTDB> unset ttl from root.sgcc.**
IoTDB> unset ttl from root.**
```

#### Show TTL

```sql
IoTDB> SHOW ALL TTL
IoTDB> SHOW TTL ON StorageGroupNames
IoTDB> SHOW DEVICES
```

## DEVICE TEMPLATE

For more details, see document [Operate-Metadata](../Basic-Concept/Operate-Metadata.md).

![img](/img/%E6%A8%A1%E6%9D%BF.png)





![img](/img/templateEN.jpg)

### Create Device Template

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

```sql
IoTDB> set device template t1 to root.sg1.d1
```

### Activate Device Template

```sql
IoTDB> set device template t1 to root.sg1.d1
IoTDB> set device template t2 to root.sg1.d2
IoTDB> create timeseries using device template on root.sg1.d1
IoTDB> create timeseries using device template on root.sg1.d2
```

### Show Device Template

```sql
IoTDB> show device templates
IoTDB> show nodes in device template t1
IoTDB> show paths set device template t1
IoTDB> show paths using device template t1
```

### Deactivate Device Template

```sql
IoTDB> delete timeseries of device template t1 from root.sg1.d1
IoTDB> deactivate device template t1 from root.sg1.d1
IoTDB> delete timeseries of device template t1 from root.sg1.*, root.sg2.*
IoTDB> deactivate device template t1 from root.sg1.*, root.sg2.*
```

### Unset Device Template

```sql
IoTDB> unset device template t1 from root.sg1.d1
```

### Drop Device Template

```sql
IoTDB> drop device template t1
```

### Alter Device Template

```sql
IoTDB> alter device template t1 add (speed FLOAT encoding=RLE)
```

## TIMESERIES MANAGEMENT

For more details, see document [Operate-Metadata](../Basic-Concept/Operate-Metadata.md).

### Create Timeseries

```sql
IoTDB > create timeseries root.ln.wf01.wt01.status with datatype=BOOLEAN,encoding=PLAIN
IoTDB > create timeseries root.ln.wf01.wt01.temperature with datatype=FLOAT,encoding=RLE
IoTDB > create timeseries root.ln.wf02.wt02.hardware with datatype=TEXT,encoding=PLAIN
IoTDB > create timeseries root.ln.wf02.wt02.status with datatype=BOOLEAN,encoding=PLAIN
IoTDB > create timeseries root.sgcc.wf03.wt01.status with datatype=BOOLEAN,encoding=PLAIN
IoTDB > create timeseries root.sgcc.wf03.wt01.temperature with datatype=FLOAT,encoding=RLE
```

- From v0.13, you can use a simplified version of the SQL statements to create timeseries:

```sql
IoTDB > create timeseries root.ln.wf01.wt01.status with datatype=BOOLEAN,encoding=PLAIN
IoTDB > create timeseries root.ln.wf01.wt01.temperature with datatype=FLOAT,encoding=RLE
IoTDB > create timeseries root.ln.wf02.wt02.hardware with datatype=TEXT,encoding=PLAIN
IoTDB > create timeseries root.ln.wf02.wt02.status with datatype=BOOLEAN,encoding=PLAIN
IoTDB > create timeseries root.sgcc.wf03.wt01.status with datatype=BOOLEAN,encoding=PLAIN
IoTDB > create timeseries root.sgcc.wf03.wt01.temperature with datatype=FLOAT,encoding=RLE
```

- Notice that when in the CREATE TIMESERIES statement the encoding method conflicts with the data type, the system gives the corresponding error prompt as shown below:

```sql
IoTDB > create timeseries root.ln.wf02.wt02.status WITH DATATYPE=BOOLEAN, ENCODING=TS_2DIFF
error: encoding TS_2DIFF does not support BOOLEAN
```

### Create Aligned Timeseries

```sql
IoTDB> CREATE ALIGNED TIMESERIES root.ln.wf01.GPS(latitude FLOAT encoding=PLAIN compressor=SNAPPY, longitude FLOAT encoding=PLAIN compressor=SNAPPY)
```

### Delete Timeseries

```sql
IoTDB> delete timeseries root.ln.wf01.wt01.status
IoTDB> delete timeseries root.ln.wf01.wt01.temperature, root.ln.wf02.wt02.hardware
IoTDB> delete timeseries root.ln.wf02.*
IoTDB> drop timeseries root.ln.wf02.*
```

### Show Timeseries

```sql
IoTDB> show timeseries root.**
IoTDB> show timeseries root.ln.**
IoTDB> show timeseries root.ln.** limit 10 offset 10
IoTDB> show timeseries root.ln.** where timeseries contains 'wf01.wt'
IoTDB> show timeseries root.ln.** where dataType=FLOAT
```

### Count Timeseries

```sql
IoTDB > COUNT TIMESERIES root.**
IoTDB > COUNT TIMESERIES root.ln.**
IoTDB > COUNT TIMESERIES root.ln.*.*.status
IoTDB > COUNT TIMESERIES root.ln.wf01.wt01.status
IoTDB > COUNT TIMESERIES root.** WHERE TIMESERIES contains 'sgcc' 
IoTDB > COUNT TIMESERIES root.** WHERE DATATYPE = INT64
IoTDB > COUNT TIMESERIES root.** WHERE TAGS(unit) contains 'c' 
IoTDB > COUNT TIMESERIES root.** WHERE TAGS(unit) = 'c' 
IoTDB > COUNT TIMESERIES root.** WHERE TIMESERIES contains 'sgcc' group by level = 1
IoTDB > COUNT TIMESERIES root.** GROUP BY LEVEL=1
IoTDB > COUNT TIMESERIES root.ln.** GROUP BY LEVEL=2
IoTDB > COUNT TIMESERIES root.ln.wf01.* GROUP BY LEVEL=2
```

### Tag and Attribute Management

```sql
create timeseries root.turbine.d1.s1(temprature) with datatype=FLOAT, encoding=RLE, compression=SNAPPY tags(tag1=v1, tag2=v2) attributes(attr1=v1, attr2=v2)
```

* Rename the tag/attribute key

```SQL
ALTER timeseries root.turbine.d1.s1 RENAME tag1 TO newTag1
```

* Reset the tag/attribute value

```SQL
ALTER timeseries root.turbine.d1.s1 SET newTag1=newV1, attr1=newV1
```

* Delete the existing tag/attribute

```SQL
ALTER timeseries root.turbine.d1.s1 DROP tag1, tag2
```

* Add new tags

```SQL
ALTER timeseries root.turbine.d1.s1 ADD TAGS tag3=v3, tag4=v4
```

* Add new attributes

```SQL
ALTER timeseries root.turbine.d1.s1 ADD ATTRIBUTES attr3=v3, attr4=v4
```

* Upsert alias, tags and attributes

> add alias or a new key-value if the alias or key doesn't exist, otherwise, update the old one with new value.

```SQL
ALTER timeseries root.turbine.d1.s1 UPSERT ALIAS=newAlias TAGS(tag3=v3, tag4=v4) ATTRIBUTES(attr3=v3, attr4=v4)
```

* Show timeseries using tags. Use TAGS(tagKey) to identify the tags used as filter key

```SQL
SHOW TIMESERIES (<`PathPattern`>)? timeseriesWhereClause
```

returns all the timeseries information that satisfy the where condition and match the pathPattern. SQL statements are as follows:

```SQL
ALTER timeseries root.ln.wf02.wt02.hardware ADD TAGS unit=c
ALTER timeseries root.ln.wf02.wt02.status ADD TAGS description=test1
show timeseries root.ln.** where TAGS(unit)='c'
show timeseries root.ln.** where TAGS(description) contains 'test1'
```

- count timeseries using tags

```SQL
COUNT TIMESERIES (<`PathPattern`>)? timeseriesWhereClause
COUNT TIMESERIES (<`PathPattern`>)? timeseriesWhereClause GROUP BY LEVEL=<INTEGER>
```

returns all the number of timeseries that satisfy the where condition and match the pathPattern. SQL statements are as follows:

```SQL
count timeseries
count timeseries root.** where TAGS(unit)='c'
count timeseries root.** where TAGS(unit)='c' group by level = 2
```

create aligned timeseries

```SQL
create aligned timeseries root.sg1.d1(s1 INT32 tags(tag1=v1, tag2=v2) attributes(attr1=v1, attr2=v2), s2 DOUBLE tags(tag3=v3, tag4=v4) attributes(attr3=v3, attr4=v4))
```

The execution result is as follows:

```SQL
IoTDB> show timeseries
+--------------+-----+-------------+--------+--------+-----------+-------------------------+---------------------------+--------+-------------------+
|    timeseries|alias|     database|dataType|encoding|compression|                     tags|                 attributes|deadband|deadband parameters|
+--------------+-----+-------------+--------+--------+-----------+-------------------------+---------------------------+--------+-------------------+
|root.sg1.d1.s1| null|     root.sg1|   INT32|     RLE|     SNAPPY|{"tag1":"v1","tag2":"v2"}|{"attr2":"v2","attr1":"v1"}|    null|               null|
|root.sg1.d1.s2| null|     root.sg1|  DOUBLE| GORILLA|     SNAPPY|{"tag4":"v4","tag3":"v3"}|{"attr4":"v4","attr3":"v3"}|    null|               null|
+--------------+-----+-------------+--------+--------+-----------+-------------------------+---------------------------+--------+-------------------+
```

Support query：

```SQL
IoTDB> show timeseries where TAGS(tag1)='v1'
+--------------+-----+-------------+--------+--------+-----------+-------------------------+---------------------------+--------+-------------------+
|    timeseries|alias|     database|dataType|encoding|compression|                     tags|                 attributes|deadband|deadband parameters|
+--------------+-----+-------------+--------+--------+-----------+-------------------------+---------------------------+--------+-------------------+
|root.sg1.d1.s1| null|     root.sg1|   INT32|     RLE|     SNAPPY|{"tag1":"v1","tag2":"v2"}|{"attr2":"v2","attr1":"v1"}|    null|               null|
+--------------+-----+-------------+--------+--------+-----------+-------------------------+---------------------------+--------+-------------------+
```

The above operations are supported for timeseries tag, attribute updates, etc.

## NODE MANAGEMENT

For more details, see document [Operate-Metadata](../Basic-Concept/Operate-Metadata.md).

### Show Child Paths

```SQL
SHOW CHILD PATHS pathPattern
```

### Show Child Nodes

```SQL
SHOW CHILD NODES pathPattern
```

### Count Nodes

```SQL
IoTDB > COUNT NODES root.** LEVEL=2
IoTDB > COUNT NODES root.ln.** LEVEL=2
IoTDB > COUNT NODES root.ln.wf01.** LEVEL=3
IoTDB > COUNT NODES root.**.temperature LEVEL=3
```

### Show Devices

```SQL
IoTDB> show devices
IoTDB> show devices root.ln.**
IoTDB> show devices root.ln.** where device contains 't'
IoTDB> show devices with database
IoTDB> show devices root.ln.** with database
```

### Count Devices

```SQL
IoTDB> show devices
IoTDB> count devices
IoTDB> count devices root.ln.**
```

## INSERT & LOAD DATA

### Insert Data

For more details, see document [Write-Data](../Basic-Concept/Write-Data).

#### Use of INSERT Statements

-   Insert Single Timeseries

```sql
IoTDB > insert into root.ln.wf02.wt02(timestamp,status) values(1,true)
IoTDB > insert into root.ln.wf02.wt02(timestamp,hardware) values(1, 'v1')
```

-   Insert Multiple Timeseries

```sql
IoTDB > insert into root.ln.wf02.wt02(timestamp, status, hardware) VALUES (2, false, 'v2')
IoTDB > insert into root.ln.wf02.wt02(timestamp, status, hardware) VALUES (3, false, 'v3'),(4, true, 'v4')
```

-   Use the Current System Timestamp as the Timestamp of the Data Point

```SQL
IoTDB > insert into root.ln.wf02.wt02(status, hardware) values (false, 'v2')
```

#### Insert Data Into Aligned Timeseries

```SQL
IoTDB > create aligned timeseries root.sg1.d1(s1 INT32, s2 DOUBLE)
IoTDB > insert into root.sg1.d1(time, s1, s2) aligned values(1, 1, 1)
IoTDB > insert into root.sg1.d1(time, s1, s2) aligned values(2, 2, 2), (3, 3, 3)
IoTDB > select * from root.sg1.d1
```

### Load External TsFile Tool

For more details, see document [Data Import](../Tools-System/Data-Import-Tool.md).

#### Load with SQL

1.   Load a single tsfile by specifying a file path (absolute path). 

- `load '/Users/Desktop/data/1575028885956-101-0.tsfile'`
- `load '/Users/Desktop/data/1575028885956-101-0.tsfile' sglevel=1`
- `load '/Users/Desktop/data/1575028885956-101-0.tsfile' onSuccess=delete`
- `load '/Users/Desktop/data/1575028885956-101-0.tsfile' sglevel=1 onSuccess=delete`


2.   Load a batch of files by specifying a folder path (absolute path). 

- `load '/Users/Desktop/data'`
- `load '/Users/Desktop/data' sglevel=1`
- `load '/Users/Desktop/data' onSuccess=delete`
- `load '/Users/Desktop/data' sglevel=1 onSuccess=delete`

#### Load with Script

```
./load-rewrite.bat -f D:\IoTDB\data -h 192.168.0.101 -p 6667 -u root -pw root
```

## DELETE DATA

For more details, see document [Write-Delete-Data](../Basic-Concept/Write-Data).

### Delete Single Timeseries

```sql
IoTDB > delete from root.ln.wf02.wt02.status where time<=2017-11-01T16:26:00;
IoTDB > delete from root.ln.wf02.wt02.status where time>=2017-01-01T00:00:00 and time<=2017-11-01T16:26:00;
IoTDB > delete from root.ln.wf02.wt02.status where time < 10
IoTDB > delete from root.ln.wf02.wt02.status where time <= 10
IoTDB > delete from root.ln.wf02.wt02.status where time < 20 and time > 10
IoTDB > delete from root.ln.wf02.wt02.status where time <= 20 and time >= 10
IoTDB > delete from root.ln.wf02.wt02.status where time > 20
IoTDB > delete from root.ln.wf02.wt02.status where time >= 20
IoTDB > delete from root.ln.wf02.wt02.status where time = 20
IoTDB > delete from root.ln.wf02.wt02.status where time > 4 or time < 0
Msg: 303: Check metadata error: For delete statement, where clause can only contain atomic
expressions like : time > XXX, time <= XXX, or two atomic expressions connected by 'AND'
IoTDB > delete from root.ln.wf02.wt02.status
```

### Delete Multiple Timeseries

```sql
IoTDB > delete from root.ln.wf02.wt02 where time <= 2017-11-01T16:26:00;
IoTDB > delete from root.ln.wf02.wt02.* where time <= 2017-11-01T16:26:00;
IoTDB> delete from root.ln.wf03.wt02.status where time < now()
Msg: The statement is executed successfully.
```

### Delete Time Partition (experimental)

```sql
IoTDB > DELETE PARTITION root.ln 0,1,2
```

## QUERY DATA

For more details, see document [Query-Data](../Basic-Concept/Query-Data.md).

```sql
SELECT [LAST] selectExpr [, selectExpr] ...
    [INTO intoItem [, intoItem] ...]
    FROM prefixPath [, prefixPath] ...
    [WHERE whereCondition]
    [GROUP BY {
        ([startTime, endTime), interval [, slidingStep]) |
        LEVEL = levelNum [, levelNum] ... |
        TAGS(tagKey [, tagKey] ... ) |
        VARIATION(expression[,delta][,ignoreNull=true/false]) |
        CONDITION(expression,[keep>/>=/=/</<=]threshold[,ignoreNull=true/false]) |
        SESSION(timeInterval) |
        COUNT(expression, size[,ignoreNull=true/false])
    }]
    [HAVING havingCondition]
    [ORDER BY sortKey {ASC | DESC}]
    [FILL ({PREVIOUS | LINEAR | constant} (, interval=DURATION_LITERAL)?)]
    [SLIMIT seriesLimit] [SOFFSET seriesOffset]
    [LIMIT rowLimit] [OFFSET rowOffset]
    [ALIGN BY {TIME | DEVICE}]
```

### Basic Examples

#### Select a Column of Data Based on a Time Interval

```sql
IoTDB > select temperature from root.ln.wf01.wt01 where time < 2017-11-01T00:08:00.000
```

#### Select Multiple Columns of Data Based on a Time Interval

```sql
IoTDB > select status, temperature from root.ln.wf01.wt01 where time > 2017-11-01T00:05:00.000 and time < 2017-11-01T00:12:00.000;
```

#### Select Multiple Columns of Data for the Same Device According to Multiple Time Intervals

```sql
IoTDB > select status,temperature from root.ln.wf01.wt01 where (time > 2017-11-01T00:05:00.000 and time < 2017-11-01T00:12:00.000) or (time >= 2017-11-01T16:35:00.000 and time <= 2017-11-01T16:37:00.000);
```

#### Choose Multiple Columns of Data for Different Devices According to Multiple Time Intervals

```sql
IoTDB > select wf01.wt01.status,wf02.wt02.hardware from root.ln where (time > 2017-11-01T00:05:00.000 and time < 2017-11-01T00:12:00.000) or (time >= 2017-11-01T16:35:00.000 and time <= 2017-11-01T16:37:00.000);
```

#### Order By Time Query

```sql
IoTDB > select * from root.ln.** where time > 1 order by time desc limit 10;
```

### `SELECT` CLAUSE

#### Use Alias

```sql
IoTDB > select s1 as temperature, s2 as speed from root.ln.wf01.wt01;
```

#### Nested Expressions

##### Nested Expressions with Time Series Query

```sql
IoTDB > select a,
       b,
       ((a + 1) * 2 - 1) % 2 + 1.5,
       sin(a + sin(a + sin(b))),
       -(a + b) * (sin(a + b) * sin(a + b) + cos(a + b) * cos(a + b)) + 1
from root.sg1;

IoTDB > select (a + b) * 2 + sin(a) from root.sg

IoTDB > select (a + *) / 2  from root.sg1

IoTDB > select (a + b) * 3 from root.sg, root.ln
```

##### Nested Expressions query with aggregations

```sql
IoTDB > select avg(temperature),
       sin(avg(temperature)),
       avg(temperature) + 1,
       -sum(hardware),
       avg(temperature) + sum(hardware)
from root.ln.wf01.wt01;

IoTDB > select avg(*), 
     (avg(*) + 1) * 3 / 2 -1 
from root.sg1

IoTDB > select avg(temperature),
       sin(avg(temperature)),
       avg(temperature) + 1,
       -sum(hardware),
       avg(temperature) + sum(hardware) as custom_sum
from root.ln.wf01.wt01
GROUP BY([10, 90), 10ms);
```

#### Last Query

```sql
IoTDB > select last status from root.ln.wf01.wt01
IoTDB > select last status, temperature from root.ln.wf01.wt01 where time >= 2017-11-07T23:50:00
IoTDB > select last * from root.ln.wf01.wt01 order by timeseries desc;
IoTDB > select last * from root.ln.wf01.wt01 order by dataType desc;
```

### `WHERE` CLAUSE

#### Time Filter

```sql
IoTDB > select s1 from root.sg1.d1 where time > 2022-01-01T00:05:00.000;
IoTDB > select s1 from root.sg1.d1 where time = 2022-01-01T00:05:00.000;
IoTDB > select s1 from root.sg1.d1 where time >= 2022-01-01T00:05:00.000 and time < 2017-11-01T00:12:00.000;
```

#### Value Filter

```sql
IoTDB > select temperature from root.sg1.d1 where temperature > 36.5;
IoTDB > select status from root.sg1.d1 where status = true;
IoTDB > select temperature from root.sg1.d1 where temperature between 36.5 and 40;
IoTDB > select temperature from root.sg1.d1 where temperature not between 36.5 and 40;
IoTDB > select code from root.sg1.d1 where code in ('200', '300', '400', '500');
IoTDB > select code from root.sg1.d1 where code not in ('200', '300', '400', '500');
IoTDB > select code from root.sg1.d1 where temperature is null;
IoTDB > select code from root.sg1.d1 where temperature is not null;
```

#### Fuzzy Query

-   Fuzzy matching using `Like`

```sql
IoTDB > select * from root.sg.d1 where value like '%cc%'
IoTDB > select * from root.sg.device where value like '_b_'
```

-   Fuzzy matching using `Regexp`

```sql
IoTDB > select * from root.sg.d1 where value regexp '^[A-Za-z]+$'
IoTDB > select * from root.sg.d1 where value regexp '^[a-z]+$' and time > 100
```

### `GROUP BY` CLAUSE

-   Aggregate By Time without Specifying the Sliding Step Length

```sql
IoTDB > select count(status), max_value(temperature) from root.ln.wf01.wt01 group by ([2017-11-01T00:00:00, 2017-11-07T23:00:00),1d);
```

-   Aggregate By Time Specifying the Sliding Step Length

```sql
IoTDB > select count(status), max_value(temperature) from root.ln.wf01.wt01 group by ([2017-11-01 00:00:00, 2017-11-07 23:00:00), 3h, 1d);
```

-   Aggregate by Natural Month

```sql
IoTDB > select count(status) from root.ln.wf01.wt01 group by([2017-11-01T00:00:00, 2019-11-07T23:00:00), 1mo, 2mo);
IoTDB > select count(status) from root.ln.wf01.wt01 group by([2017-10-31T00:00:00, 2019-11-07T23:00:00), 1mo, 2mo);                                                    
```

-   Left Open And Right Close Range

```sql
IoTDB > select count(status) from root.ln.wf01.wt01 group by ((2017-11-01T00:00:00, 2017-11-07T23:00:00],1d);
```

-   Aggregation By Variation

```sql
IoTDB > select __endTime, avg(s1), count(s2), sum(s3) from root.sg.d group by variation(s6)
IoTDB > select __endTime, avg(s1), count(s2), sum(s3) from root.sg.d group by variation(s6, ignoreNull=false)
IoTDB > select __endTime, avg(s1), count(s2), sum(s3) from root.sg.d group by variation(s6, 4)
IoTDB > select __endTime, avg(s1), count(s2), sum(s3) from root.sg.d group by variation(s6+s5, 10)
```

-   Aggregation By Condition

```sql
IoTDB > select max_time(charging_status),count(vehicle_status),last_value(soc) from root.** group by condition(charging_status=1,KEEP>=2,ignoringNull=true)
IoTDB > select max_time(charging_status),count(vehicle_status),last_value(soc) from root.** group by condition(charging_status=1,KEEP>=2,ignoringNull=false)
```

-   Aggregation By Session

```sql
IoTDB > select __endTime,count(*) from root.** group by session(1d)
IoTDB > select __endTime,sum(hardware) from root.ln.wf02.wt01 group by session(50s) having sum(hardware)>0 align by device
```

-   Aggregation By Count

```sql
IoTDB > select count(charging_stauts), first_value(soc) from root.sg group by count(charging_status,5) 
IoTDB > select count(charging_stauts), first_value(soc) from root.sg group by count(charging_status,5,ignoreNull=false) 
```

-   Aggregation By Level

```sql
IoTDB > select count(status) from root.** group by level = 1
IoTDB > select count(status) from root.** group by level = 3
IoTDB > select count(status) from root.** group by level = 1, 3
IoTDB > select max_value(temperature) from root.** group by level = 0
IoTDB > select count(*) from root.ln.** group by level = 2
```

-   Aggregate By Time with Level Clause

```sql
IoTDB > select count(status) from root.ln.wf01.wt01 group by ((2017-11-01T00:00:00, 2017-11-07T23:00:00],1d), level=1;
IoTDB > select count(status) from root.ln.wf01.wt01 group by ([2017-11-01 00:00:00, 2017-11-07 23:00:00), 3h, 1d), level=1;
```

-   Aggregation query by one single tag

```sql
IoTDB > SELECT AVG(temperature) FROM root.factory1.** GROUP BY TAGS(city);
```

-   Aggregation query by multiple tags

```sql
IoTDB > SELECT avg(temperature) FROM root.factory1.** GROUP BY TAGS(city, workshop);
```

-   Downsampling Aggregation by tags based on Time Window

```sql
IoTDB > SELECT avg(temperature) FROM root.factory1.** GROUP BY ([1000, 10000), 5s), TAGS(city, workshop);
```

### `HAVING` CLAUSE

Correct:

```sql
IoTDB > select count(s1) from root.** group by ([1,11),2ms), level=1 having count(s2) > 1
IoTDB > select count(s1), count(s2) from root.** group by ([1,11),2ms) having count(s2) > 1 align by device
```

Incorrect: 

```sql
IoTDB > select count(s1) from root.** group by ([1,3),1ms) having sum(s1) > s1
IoTDB > select count(s1) from root.** group by ([1,3),1ms) having s1 > 1
IoTDB > select count(s1) from root.** group by ([1,3),1ms), level=1 having sum(d1.s1) > 1
IoTDB > select count(d1.s1) from root.** group by ([1,3),1ms), level=1 having sum(s1) > 1
```

### `FILL` CLAUSE

#### `PREVIOUS` Fill

```sql
IoTDB > select temperature, status from root.sgcc.wf03.wt01 where time >= 2017-11-01T16:37:00.000 and time <= 2017-11-01T16:40:00.000 fill(previous);
```

#### `PREVIOUS` FILL and specify the fill timeout threshold
```sql
select temperature, status from root.sgcc.wf03.wt01 where time >= 2017-11-01T16:37:00.000 and time <= 2017-11-01T16:40:00.000 fill(previous, 2m);
```

#### `LINEAR` Fill

```sql
IoTDB > select temperature, status from root.sgcc.wf03.wt01 where time >= 2017-11-01T16:37:00.000 and time <= 2017-11-01T16:40:00.000 fill(linear);
```

#### Constant Fill

```sql
IoTDB > select temperature, status from root.sgcc.wf03.wt01 where time >= 2017-11-01T16:37:00.000 and time <= 2017-11-01T16:40:00.000 fill(2.0);
IoTDB > select temperature, status from root.sgcc.wf03.wt01 where time >= 2017-11-01T16:37:00.000 and time <= 2017-11-01T16:40:00.000 fill(true);
```

### `LIMIT` and `SLIMIT` CLAUSES (PAGINATION)

#### Row Control over Query Results

```sql
IoTDB > select status, temperature from root.ln.wf01.wt01 limit 10
IoTDB > select status, temperature from root.ln.wf01.wt01 limit 5 offset 3
IoTDB > select status,temperature from root.ln.wf01.wt01 where time > 2017-11-01T00:05:00.000 and time< 2017-11-01T00:12:00.000 limit 2 offset 3
IoTDB > select count(status), max_value(temperature) from root.ln.wf01.wt01 group by ([2017-11-01T00:00:00, 2017-11-07T23:00:00),1d) limit 5 offset 3
```

#### Column Control over Query Results

```sql
IoTDB > select * from root.ln.wf01.wt01 where time > 2017-11-01T00:05:00.000 and time < 2017-11-01T00:12:00.000 slimit 1
IoTDB > select * from root.ln.wf01.wt01 where time > 2017-11-01T00:05:00.000 and time < 2017-11-01T00:12:00.000 slimit 1 soffset 1
IoTDB > select max_value(*) from root.ln.wf01.wt01 group by ([2017-11-01T00:00:00, 2017-11-07T23:00:00),1d) slimit 1 soffset 1
```

#### Row and Column Control over Query Results

```sql
IoTDB > select * from root.ln.wf01.wt01 limit 10 offset 100 slimit 2 soffset 0
```

### `ORDER BY` CLAUSE

#### Order by in ALIGN BY TIME mode

```sql
IoTDB > select * from root.ln.** where time <= 2017-11-01T00:01:00 order by time desc;
```

#### Order by in ALIGN BY DEVICE mode

```sql
IoTDB > select * from root.ln.** where time <= 2017-11-01T00:01:00 order by device desc,time asc align by device;
IoTDB > select * from root.ln.** where time <= 2017-11-01T00:01:00 order by time asc,device desc align by device;
IoTDB > select * from root.ln.** where time <= 2017-11-01T00:01:00 align by device;
IoTDB > select count(*) from root.ln.** group by ((2017-11-01T00:00:00.000+08:00,2017-11-01T00:03:00.000+08:00],1m) order by device asc,time asc align by device
```

#### Order by arbitrary expressions

```sql
IoTDB > select score from root.** order by score desc align by device
IoTDB > select score,total from root.one order by base+score+bonus desc
IoTDB > select score,total from root.one order by total desc
IoTDB > select base, score, bonus, total from root.** order by total desc NULLS Last,
                                  score desc NULLS Last,
                                  bonus desc NULLS Last,
                                  time desc align by device
IoTDB > select min_value(total) from root.** order by min_value(total) asc align by device
IoTDB > select min_value(total),max_value(base) from root.** order by max_value(total) desc align by device
IoTDB > select score from root.** order by device asc, score desc, time asc align by device
```

### `ALIGN BY` CLAUSE

#### Align by Device

```sql
IoTDB > select * from root.ln.** where time <= 2017-11-01T00:01:00 align by device;
```

### `INTO` CLAUSE (QUERY WRITE-BACK)

```sql
IoTDB > select s1, s2 into root.sg_copy.d1(t1), root.sg_copy.d2(t1, t2), root.sg_copy.d1(t2) from root.sg.d1, root.sg.d2;
IoTDB > select count(s1 + s2), last_value(s2) into root.agg.count(s1_add_s2), root.agg.last_value(s2) from root.sg.d1 group by ([0, 100), 10ms);
IoTDB > select s1, s2 into root.sg_copy.d1(t1, t2), root.sg_copy.d2(t1, t2) from root.sg.d1, root.sg.d2 align by device;
IoTDB > select s1 + s2 into root.expr.add(d1s1_d1s2), root.expr.add(d2s1_d2s2) from root.sg.d1, root.sg.d2 align by device;
```

-   Using variable placeholders:

```sql
IoTDB > select s1, s2
into root.sg_copy.d1(::), root.sg_copy.d2(s1), root.sg_copy.d1(${3}), root.sg_copy.d2(::)
from root.sg.d1, root.sg.d2;

IoTDB > select d1.s1, d1.s2, d2.s3, d3.s4
into ::(s1_1, s2_2), root.sg.d2_2(s3_3), root.${2}_copy.::(s4)
from root.sg;

IoTDB > select * into root.sg_bk.::(::) from root.sg.**;

IoTDB > select s1, s2, s3, s4
into root.backup_sg.d1(s1, s2, s3, s4), root.backup_sg.d2(::), root.sg.d3(backup_${4})
from root.sg.d1, root.sg.d2, root.sg.d3
align by device;

IoTDB > select avg(s1), sum(s2) + sum(s3), count(s4)
into root.agg_${2}.::(avg_s1, sum_s2_add_s3, count_s4)
from root.**
align by device;

IoTDB > select * into ::(backup_${4}) from root.sg.** align by device;

IoTDB > select s1, s2 into root.sg_copy.d1(t1, t2), aligned root.sg_copy.d2(t1, t2) from root.sg.d1, root.sg.d2 align by device;
```

## Maintennance
Generate the corresponding query plan:
```
explain select s1,s2 from root.sg.d1
```
Execute the corresponding SQL, analyze the execution and output:
```
explain analyze select s1,s2 from root.sg.d1 order by s1
``` 
## OPERATOR

For more details, see document [Operator-and-Expression](./Operator-and-Expression.md).

### Arithmetic Operators

For details and examples, see the document [Arithmetic Operators and Functions](./Operator-and-Expression.md#arithmetic-operators).

```sql
select s1, - s1, s2, + s2, s1 + s2, s1 - s2, s1 * s2, s1 / s2, s1 % s2 from root.sg.d1
```

### Comparison Operators

For details and examples, see the document [Comparison Operators and Functions](./Operator-and-Expression.md#comparison-operators).

```sql
# Basic comparison operators
select a, b, a > 10, a <= b, !(a <= b), a > 10 && a > b from root.test;

# `BETWEEN ... AND ...` operator
select temperature from root.sg1.d1 where temperature between 36.5 and 40;
select temperature from root.sg1.d1 where temperature not between 36.5 and 40;

# Fuzzy matching operator: Use `Like` for fuzzy matching
select * from root.sg.d1 where value like '%cc%'
select * from root.sg.device where value like '_b_'

# Fuzzy matching operator: Use `Regexp` for fuzzy matching
select * from root.sg.d1 where value regexp '^[A-Za-z]+$'
select * from root.sg.d1 where value regexp '^[a-z]+$' and time > 100
select b, b like '1%', b regexp '[0-2]' from root.test;

# `IS NULL` operator
select code from root.sg1.d1 where temperature is null;
select code from root.sg1.d1 where temperature is not null;

# `IN` operator
select code from root.sg1.d1 where code in ('200', '300', '400', '500');
select code from root.sg1.d1 where code not in ('200', '300', '400', '500');
select a, a in (1, 2) from root.test;
```

### Logical Operators

For details and examples, see the document [Logical Operators](./Operator-and-Expression.md#logical-operators).

```sql
select a, b, a > 10, a <= b, !(a <= b), a > 10 && a > b from root.test;
```

## BUILT-IN FUNCTIONS

For more details, see document [Operator-and-Expression](./Operator-and-Expression.md#built-in-functions).

### Aggregate Functions

For details and examples, see the document [Aggregate Functions](./Operator-and-Expression.md#aggregate-functions).

```sql
select count(status) from root.ln.wf01.wt01;

select count_if(s1=0 & s2=0, 3), count_if(s1=1 & s2=0, 3) from root.db.d1;
select count_if(s1=0 & s2=0, 3, 'ignoreNull'='false'), count_if(s1=1 & s2=0, 3, 'ignoreNull'='false') from root.db.d1;

select time_duration(s1) from root.db.d1;
```

### Arithmetic Functions

For details and examples, see the document [Arithmetic Operators and Functions](./Operator-and-Expression.md#arithmetic-functions).

```sql
select s1, sin(s1), cos(s1), tan(s1) from root.sg1.d1 limit 5 offset 1000;
select s4,round(s4),round(s4,2),round(s4,-1) from root.sg1.d1;
```

### Comparison Functions

For details and examples, see the document [Comparison Operators and Functions](./Operator-and-Expression.md#comparison-functions).

```sql
select ts, on_off(ts, 'threshold'='2') from root.test;
select ts, in_range(ts, 'lower'='2', 'upper'='3.1') from root.test;
```

### String Processing Functions

For details and examples, see the document [String Processing](./Operator-and-Expression.md#string-processing-functions).

```sql
select s1, string_contains(s1, 's'='warn') from root.sg1.d4;
select s1, string_matches(s1, 'regex'='[^\\s]+37229') from root.sg1.d4;
select s1, length(s1) from root.sg1.d1
select s1, locate(s1, "target"="1") from root.sg1.d1
select s1, locate(s1, "target"="1", "reverse"="true") from root.sg1.d1
select s1, startswith(s1, "target"="1") from root.sg1.d1
select s1, endswith(s1, "target"="1") from root.sg1.d1
select s1, s2, concat(s1, s2, "target1"="IoT", "target2"="DB") from root.sg1.d1
select s1, s2, concat(s1, s2, "target1"="IoT", "target2"="DB", "series_behind"="true") from root.sg1.d1
select s1, substring(s1 from 1 for 2) from root.sg1.d1
select s1, replace(s1, 'es', 'tt') from root.sg1.d1
select s1, upper(s1) from root.sg1.d1
select s1, lower(s1) from root.sg1.d1
select s3, trim(s3) from root.sg1.d1
select s1, s2, strcmp(s1, s2) from root.sg1.d1
select strreplace(s1, "target"=",", "replace"="/", "limit"="2") from root.test.d1
select strreplace(s1, "target"=",", "replace"="/", "limit"="1", "offset"="1", "reverse"="true") from root.test.d1
select regexmatch(s1, "regex"="\d+\.\d+\.\d+\.\d+", "group"="0") from root.test.d1
select regexreplace(s1, "regex"="192\.168\.0\.(\d+)", "replace"="cluster-$1", "limit"="1") from root.test.d1
select regexsplit(s1, "regex"=",", "index"="-1") from root.test.d1
select regexsplit(s1, "regex"=",", "index"="3") from root.test.d1
```

### Data Type Conversion Function

For details and examples, see the document [Data Type Conversion Function](./Operator-and-Expression.md#data-type-conversion-function).

```sql
SELECT cast(s1 as INT32) from root.sg
```

### Constant Timeseries Generating Functions

For details and examples, see the document [Constant Timeseries Generating Functions](./Operator-and-Expression.md#constant-timeseries-generating-functions).

```sql
select s1, s2, const(s1, 'value'='1024', 'type'='INT64'), pi(s2), e(s1, s2) from root.sg1.d1; 
```

### Selector Functions

For details and examples, see the document [Selector Functions](./Operator-and-Expression.md#selector-functions).

```sql
select s1, top_k(s1, 'k'='2'), bottom_k(s1, 'k'='2') from root.sg1.d2 where time > 2020-12-10T20:36:15.530+08:00;
```

### Continuous Interval Functions

For details and examples, see the document [Continuous Interval Functions](./Operator-and-Expression.md#continuous-interval-functions).

```sql
select s1, zero_count(s1), non_zero_count(s2), zero_duration(s3), non_zero_duration(s4) from root.sg.d2;
```

### Variation Trend Calculation Functions

For details and examples, see the document [Variation Trend Calculation Functions](./Operator-and-Expression.md#variation-trend-calculation-functions).

```sql
select s1, time_difference(s1), difference(s1), non_negative_difference(s1), derivative(s1), non_negative_derivative(s1) from root.sg1.d1 limit 5 offset 1000; 

SELECT DIFF(s1), DIFF(s2) from root.test;
SELECT DIFF(s1, 'ignoreNull'='false'), DIFF(s2, 'ignoreNull'='false') from root.test;
```

### Sample Functions

For details and examples, see the document [Sample Functions](./Operator-and-Expression.md#sample-functions).

```sql
select equal_size_bucket_random_sample(temperature,'proportion'='0.1') as random_sample from root.ln.wf01.wt01;
select equal_size_bucket_agg_sample(temperature, 'type'='avg','proportion'='0.1') as agg_avg, equal_size_bucket_agg_sample(temperature, 'type'='max','proportion'='0.1') as agg_max, equal_size_bucket_agg_sample(temperature,'type'='min','proportion'='0.1') as agg_min, equal_size_bucket_agg_sample(temperature, 'type'='sum','proportion'='0.1') as agg_sum, equal_size_bucket_agg_sample(temperature, 'type'='extreme','proportion'='0.1') as agg_extreme, equal_size_bucket_agg_sample(temperature, 'type'='variance','proportion'='0.1') as agg_variance from root.ln.wf01.wt01;
select equal_size_bucket_m4_sample(temperature, 'proportion'='0.1') as M4_sample from root.ln.wf01.wt01;
select equal_size_bucket_outlier_sample(temperature, 'proportion'='0.1', 'type'='avg', 'number'='2') as outlier_avg_sample, equal_size_bucket_outlier_sample(temperature, 'proportion'='0.1', 'type'='stendis', 'number'='2') as outlier_stendis_sample, equal_size_bucket_outlier_sample(temperature, 'proportion'='0.1', 'type'='cos', 'number'='2') as outlier_cos_sample, equal_size_bucket_outlier_sample(temperature, 'proportion'='0.1', 'type'='prenextdis', 'number'='2') as outlier_prenextdis_sample from root.ln.wf01.wt01;

select M4(s1,'timeInterval'='25','displayWindowBegin'='0','displayWindowEnd'='100') from root.vehicle.d1
select M4(s1,'windowSize'='10') from root.vehicle.d1
```

### Change Points Function

For details and examples, see the document [Time-Series](./Operator-and-Expression.md#change-points-function).

```sql
select change_points(s1), change_points(s2), change_points(s3), change_points(s4), change_points(s5), change_points(s6) from root.testChangePoints.d1
```

## DATA QUALITY FUNCTION LIBRARY

For more details, see document [Operator-and-Expression](./UDF-Libraries.md).

### Data Quality

For details and examples, see the document [Data-Quality](./UDF-Libraries.md#data-quality).

```sql
# Completeness
select completeness(s1) from root.test.d1 where time <= 2020-01-01 00:00:30
select completeness(s1,"window"="15") from root.test.d1 where time <= 2020-01-01 00:01:00

# Consistency
select consistency(s1) from root.test.d1 where time <= 2020-01-01 00:00:30
select consistency(s1,"window"="15") from root.test.d1 where time <= 2020-01-01 00:01:00

# Timeliness
select timeliness(s1) from root.test.d1 where time <= 2020-01-01 00:00:30
select timeliness(s1,"window"="15") from root.test.d1 where time <= 2020-01-01 00:01:00

# Validity
select Validity(s1) from root.test.d1 where time <= 2020-01-01 00:00:30
select Validity(s1,"window"="15") from root.test.d1 where time <= 2020-01-01 00:01:00

# Accuracy
select Accuracy(t1,t2,t3,m1,m2,m3) from root.test
```

### Data Profiling

For details and examples, see the document [Data-Profiling](./UDF-Libraries.md#data-profiling).

```sql
# ACF
select acf(s1) from root.test.d1 where time <= 2020-01-01 00:00:05

# Distinct
select distinct(s2) from root.test.d2

# Histogram
select histogram(s1,"min"="1","max"="20","count"="10") from root.test.d1

# Integral
select integral(s1) from root.test.d1 where time <= 2020-01-01 00:00:10
select integral(s1, "unit"="1m") from root.test.d1 where time <= 2020-01-01 00:00:10

# IntegralAvg
select integralavg(s1) from root.test.d1 where time <= 2020-01-01 00:00:10

# Mad
select mad(s0) from root.test
select mad(s0, "error"="0.01") from root.test

# Median
select median(s0, "error"="0.01") from root.test

# MinMax
select minmax(s1) from root.test

# Mode
select mode(s2) from root.test.d2

# MvAvg
select mvavg(s1, "window"="3") from root.test

# PACF
select pacf(s1, "lag"="5") from root.test

# Percentile
select percentile(s0, "rank"="0.2", "error"="0.01") from root.test

# Quantile
select quantile(s0, "rank"="0.2", "K"="800") from root.test

# Period
select period(s1) from root.test.d3

# QLB
select QLB(s1) from root.test.d1

# Resample
select resample(s1,'every'='5m','interp'='linear') from root.test.d1
select resample(s1,'every'='30m','aggr'='first') from root.test.d1
select resample(s1,'every'='30m','start'='2021-03-06 15:00:00') from root.test.d1

# Sample
select sample(s1,'method'='reservoir','k'='5') from root.test.d1
select sample(s1,'method'='isometric','k'='5') from root.test.d1

# Segment
select segment(s1, "error"="0.1") from root.test

# Skew
select skew(s1) from root.test.d1

# Spline
select spline(s1, "points"="151") from root.test

# Spread
select spread(s1) from root.test.d1 where time <= 2020-01-01 00:00:30

# Stddev
select stddev(s1) from root.test.d1

# ZScore
select zscore(s1) from root.test
```

### Anomaly Detection

For details and examples, see the document [Anomaly-Detection](./UDF-Libraries.md#anomaly-detection).

```sql
# IQR
select iqr(s1) from root.test

# KSigma
select ksigma(s1,"k"="1.0") from root.test.d1 where time <= 2020-01-01 00:00:30

# LOF
select lof(s1,s2) from root.test.d1 where time<1000
select lof(s1, "method"="series") from root.test.d1 where time<1000

# MissDetect
select missdetect(s2,'minlen'='10') from root.test.d2

# Range
select range(s1,"lower_bound"="101.0","upper_bound"="125.0") from root.test.d1 where time <= 2020-01-01 00:00:30

# TwoSidedFilter
select TwoSidedFilter(s0, 'len'='5', 'threshold'='0.3') from root.test

# Outlier
select outlier(s1,"r"="5.0","k"="4","w"="10","s"="5") from root.test

# MasterTrain
select MasterTrain(lo,la,m_lo,m_la,'p'='3','eta'='1.0') from root.test

# MasterDetect
select MasterDetect(lo,la,m_lo,m_la,model,'output_type'='repair','p'='3','k'='3','eta'='1.0') from root.test
select MasterDetect(lo,la,m_lo,m_la,model,'output_type'='anomaly','p'='3','k'='3','eta'='1.0') from root.test
```

### Frequency Domain

For details and examples, see the document [Frequency-Domain](./UDF-Libraries.md#frequency-domain-analysis).

```sql
# Conv
select conv(s1,s2) from root.test.d2

# Deconv
select deconv(s3,s2) from root.test.d2
select deconv(s3,s2,'result'='remainder') from root.test.d2

# DWT
select dwt(s1,"method"="haar") from root.test.d1

# FFT
select fft(s1) from root.test.d1
select fft(s1, 'result'='real', 'compress'='0.99'), fft(s1, 'result'='imag','compress'='0.99') from root.test.d1

# HighPass
select highpass(s1,'wpass'='0.45') from root.test.d1

# IFFT
select ifft(re, im, 'interval'='1m', 'start'='2021-01-01 00:00:00') from root.test.d1

# LowPass
select lowpass(s1,'wpass'='0.45') from root.test.d1

# Envelope
select envelope(s1) from root.test.d1
```

### Data Matching

For details and examples, see the document [Data-Matching](./UDF-Libraries.md#data-matching).

```sql
# Cov
select cov(s1,s2) from root.test.d2

# DTW
select dtw(s1,s2) from root.test.d2

# Pearson
select pearson(s1,s2) from root.test.d2

# PtnSym
select ptnsym(s4, 'window'='5', 'threshold'='0') from root.test.d1

# XCorr
select xcorr(s1, s2) from root.test.d1 where time <= 2020-01-01 00:00:05
```

### Data Repairing

For details and examples, see the document [Data-Repairing](./UDF-Libraries.md#data-repairing).

```sql
# TimestampRepair
select timestamprepair(s1,'interval'='10000') from root.test.d2
select timestamprepair(s1) from root.test.d2

# ValueFill
select valuefill(s1) from root.test.d2
select valuefill(s1,"method"="previous") from root.test.d2

# ValueRepair
select valuerepair(s1) from root.test.d2
select valuerepair(s1,'method'='LsGreedy') from root.test.d2

# MasterRepair
select MasterRepair(t1,t2,t3,m1,m2,m3) from root.test

# SeasonalRepair
select seasonalrepair(s1,'period'=3,'k'=2) from root.test.d2
select seasonalrepair(s1,'method'='improved','period'=3) from root.test.d2
```

### Series Discovery

For details and examples, see the document [Series-Discovery](./UDF-Libraries.md#series-discovery).

```sql
# ConsecutiveSequences
select consecutivesequences(s1,s2,'gap'='5m') from root.test.d1
select consecutivesequences(s1,s2) from root.test.d1

# ConsecutiveWindows
select consecutivewindows(s1,s2,'length'='10m') from root.test.d1
```

### Machine Learning

For details and examples, see the document [Machine-Learning](./UDF-Libraries.md#machine-learning).

```sql
# AR
select ar(s0,"p"="2") from root.test.d0

# Representation
select representation(s0,"tb"="3","vb"="2") from root.test.d0

# RM
select rm(s0, s1,"tb"="3","vb"="2") from root.test.d0
```


## CONDITIONAL EXPRESSION

For details and examples, see the document [Conditional Expressions](./UDF-Libraries.md#conditional-expressions).

```sql
select T, P, case
when 1000<T and T<1050 and 1000000<P and P<1100000 then "good!"
when T<=1000 or T>=1050 then "bad temperature"
when P<=1000000 or P>=1100000 then "bad pressure"
end as `result`
from root.test1

select str, case
when str like "%cc%" then "has cc"
when str like "%dd%" then "has dd"
else "no cc and dd" end as `result`
from root.test2

select
count(case when x<=1 then 1 end) as `(-∞,1]`,
count(case when 1<x and x<=3 then 1 end) as `(1,3]`,
count(case when 3<x and x<=7 then 1 end) as `(3,7]`,
count(case when 7<x then 1 end) as `(7,+∞)`
from root.test3

select x, case x when 1 then "one" when 2 then "two" else "other" end from root.test4

select x, case x when 1 then true when 2 then false end as `result` from root.test4

select x, case x
when 1 then 1
when 2 then 222222222222222
when 3 then 3.3
when 4 then 4.4444444444444
end as `result`
from root.test4
```

## TRIGGER

For more details, see document [Database-Programming](../User-Manual/Database-Programming.md).

### Create Trigger

```sql
// Create Trigger
createTrigger
    : CREATE triggerType TRIGGER triggerName=identifier triggerEventClause ON pathPattern AS className=STRING_LITERAL uriClause? triggerAttributeClause?
    ;

triggerType
    : STATELESS | STATEFUL
    ;

triggerEventClause
    : (BEFORE | AFTER) INSERT
    ;
        
uriClause
    : USING URI uri
    ;

uri
    : STRING_LITERAL
    ;
    
triggerAttributeClause
    : WITH LR_BRACKET triggerAttribute (COMMA triggerAttribute)* RR_BRACKET
    ;

triggerAttribute
    : key=attributeKey operator_eq value=attributeValue
    ;
```

### Drop Trigger

```sql
// Drop Trigger
dropTrigger
  : DROP TRIGGER triggerName=identifier
;
```

### Show Trigger

```sql
SHOW TRIGGERS
```

## CONTINUOUS QUERY (CQ)

For more details, see document [Operator-and-Expression](./Operator-and-Expression.md).

```sql
CREATE (CONTINUOUS QUERY | CQ) <cq_id> 
[RESAMPLE 
  [EVERY <every_interval>] 
  [BOUNDARY <execution_boundary_time>]
  [RANGE <start_time_offset>[, end_time_offset]] 
]
[TIMEOUT POLICY BLOCKED|DISCARD]
BEGIN
  SELECT CLAUSE
    INTO CLAUSE
    FROM CLAUSE
    [WHERE CLAUSE]
    [GROUP BY(<group_by_interval>[, <sliding_step>]) [, level = <level>]]
    [HAVING CLAUSE]
    [FILL ({PREVIOUS | LINEAR | constant} (, interval=DURATION_LITERAL)?)]
    [LIMIT rowLimit OFFSET rowOffset]
    [ALIGN BY DEVICE]
END
```

### Configuring execution intervals

```sql
CREATE CONTINUOUS QUERY cq1
RESAMPLE EVERY 20s
BEGIN
SELECT max_value(temperature)
  INTO root.ln.wf02.wt02(temperature_max), root.ln.wf02.wt01(temperature_max), root.ln.wf01.wt02(temperature_max), root.ln.wf01.wt01(temperature_max)
  FROM root.ln.*.*
  GROUP BY(10s)
END
```

### Configuring time range for resampling

```sql
CREATE CONTINUOUS QUERY cq2
RESAMPLE RANGE 40s
BEGIN
  SELECT max_value(temperature)
  INTO root.ln.wf02.wt02(temperature_max), root.ln.wf02.wt01(temperature_max), root.ln.wf01.wt02(temperature_max), root.ln.wf01.wt01(temperature_max)
  FROM root.ln.*.*
  GROUP BY(10s)
END
```

### Configuring execution intervals and CQ time ranges

```sql
CREATE CONTINUOUS QUERY cq3
RESAMPLE EVERY 20s RANGE 40s
BEGIN
  SELECT max_value(temperature)
  INTO root.ln.wf02.wt02(temperature_max), root.ln.wf02.wt01(temperature_max), root.ln.wf01.wt02(temperature_max), root.ln.wf01.wt01(temperature_max)
  FROM root.ln.*.*
  GROUP BY(10s)
  FILL(100.0)
END
```

### Configuring end_time_offset for CQ time range

```sql
CREATE CONTINUOUS QUERY cq4
RESAMPLE EVERY 20s RANGE 40s, 20s
BEGIN
  SELECT max_value(temperature)
  INTO root.ln.wf02.wt02(temperature_max), root.ln.wf02.wt01(temperature_max), root.ln.wf01.wt02(temperature_max), root.ln.wf01.wt01(temperature_max)
  FROM root.ln.*.*
  GROUP BY(10s)
  FILL(100.0)
END
```

### CQ without group by clause

```sql
CREATE CONTINUOUS QUERY cq5
RESAMPLE EVERY 20s
BEGIN
  SELECT temperature + 1
  INTO root.precalculated_sg.::(temperature)
  FROM root.ln.*.*
  align by device
END
```

### CQ Management

#### Listing continuous queries

```sql
SHOW (CONTINUOUS QUERIES | CQS) 
```

#### Dropping continuous queries

```sql
DROP (CONTINUOUS QUERY | CQ) <cq_id>
```

#### Altering continuous queries

CQs can't be altered once they're created. To change a CQ, you must `DROP` and re`CREATE` it with the updated settings.

## USER-DEFINED FUNCTION (UDF)

For more details, see document [Operator-and-Expression](./UDF-Libraries.md).

### UDF Registration

```sql
CREATE FUNCTION <UDF-NAME> AS <UDF-CLASS-FULL-PATHNAME> (USING URI URI-STRING)?
```

### UDF Deregistration

```sql
DROP FUNCTION <UDF-NAME>
```

### UDF Queries

```sql
SELECT example(*) from root.sg.d1
SELECT example(s1, *) from root.sg.d1
SELECT example(*, *) from root.sg.d1

SELECT example(s1, 'key1'='value1', 'key2'='value2'), example(*, 'key3'='value3') FROM root.sg.d1;
SELECT example(s1, s2, 'key1'='value1', 'key2'='value2') FROM root.sg.d1;

SELECT s1, s2, example(s1, s2) FROM root.sg.d1;
SELECT *, example(*) FROM root.sg.d1 DISABLE ALIGN;
SELECT s1 * example(* / s1 + s2) FROM root.sg.d1;
SELECT s1, s2, s1 + example(s1, s2), s1 - example(s1 + example(s1, s2) / s2) FROM root.sg.d1;
```

### Show All Registered UDFs

```sql
SHOW FUNCTIONS
```

## ADMINISTRATION MANAGEMENT

For more details, see document [Operator-and-Expression](./Operator-and-Expression.md).

### SQL Statements

- Create user (Requires MANAGE_USER permission)

```SQL
CREATE USER <userName> <password>
eg: CREATE USER user1 'passwd'
```

- Delete user (Requires MANAGE_USER permission)

```sql
DROP USER <userName>
eg: DROP USER user1
```

- Create role (Requires MANAGE_ROLE permission)

```sql
CREATE ROLE <roleName>
eg: CREATE ROLE role1
```

- Delete role (Requires MANAGE_ROLE permission)

```sql
DROP ROLE <roleName>
eg: DROP ROLE role1  
```

- Grant role to user (Requires MANAGE_ROLE permission)

```sql
GRANT ROLE <ROLENAME> TO <USERNAME>
eg: GRANT ROLE admin TO user1
```

- Revoke role from user(Requires MANAGE_ROLE permission)

```sql
REVOKE ROLE <ROLENAME> FROM <USER>
eg: REVOKE ROLE admin FROM user1
```

- List all user (Requires MANAGE_USER permission)

```sql
LIST USER
```

- List all role (Requires MANAGE_ROLE permission)

```sql
LIST ROLE
```

- List all users granted specific role.（Requires MANAGE_USER permission)

```sql
LIST USER OF ROLE <roleName>
eg: LIST USER OF ROLE roleuser
```

- List all role granted to specific user.

```sql
LIST ROLE OF USER <username> 
eg: LIST ROLE OF USER tempuser
```

- List all privileges of user

```sql
LIST PRIVILEGES OF USER <username>;
eg: LIST PRIVILEGES OF USER tempuser;
```

- List all privileges of role

```sql
LIST PRIVILEGES OF ROLE <roleName>;
eg: LIST PRIVILEGES OF ROLE actor;
```

- Modify password

```sql
ALTER USER <username> SET PASSWORD <password>;
eg: ALTER USER tempuser SET PASSWORD 'newpwd';
```

### Authorization and Deauthorization


```sql
GRANT <PRIVILEGES> ON <PATHS> TO ROLE/USER <NAME> [WITH GRANT OPTION];
eg: GRANT READ ON root.** TO ROLE role1;
eg: GRANT READ_DATA, WRITE_DATA ON root.t1.** TO USER user1;
eg: GRANT READ_DATA, WRITE_DATA ON root.t1.**,root.t2.** TO USER user1;
eg: GRANT MANAGE_ROLE ON root.** TO USER user1 WITH GRANT OPTION;
eg: GRANT ALL ON root.** TO USER user1 WITH GRANT OPTION;
```

```sql
REVOKE <PRIVILEGES> ON <PATHS> FROM ROLE/USER <NAME>;
eg: REVOKE READ ON root.** FROM ROLE role1;
eg: REVOKE READ_DATA, WRITE_DATA ON root.t1.** FROM USER user1;
eg: REVOKE READ_DATA, WRITE_DATA ON root.t1.**, root.t2.** FROM USER user1;
eg: REVOKE MANAGE_ROLE ON root.** FROM USER user1;
eg: REVOKE ALL ON ROOT.** FROM USER user1;
```


#### Delete Time Partition (experimental)

```
Eg: IoTDB > DELETE PARTITION root.ln 0,1,2
```

#### Continuous Query,CQ

```
Eg: IoTDB > CREATE CONTINUOUS QUERY cq1 BEGIN SELECT max_value(temperature) INTO temperature_max FROM root.ln.*.* GROUP BY time(10s) END
```

#### Maintenance Command

- FLUSH

```
Eg: IoTDB > flush
```

- MERGE

```
Eg: IoTDB > MERGE
Eg: IoTDB > FULL MERGE
```

- CLEAR CACHE

```sql
Eg: IoTDB > CLEAR CACHE
```

- START REPAIR DATA

```sql
Eg: IoTDB > START REPAIR DATA
```

- STOP REPAIR DATA

```sql
Eg: IoTDB > STOP REPAIR DATA
```

- SET SYSTEM TO READONLY / WRITABLE

```
Eg: IoTDB > SET SYSTEM TO READONLY / WRITABLE
```

- Query abort

```
Eg: IoTDB > KILL QUERY 1
```