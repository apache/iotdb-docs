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

# General SQL Statements

## Database Management

Database is similar to the database in the relational database, which is a collection of structured time series data.

### create database

Create a database named `root.ln` with the following syntax:
```sql
CREATE DATABASE root.ln
```
### show databases

View all databases:

```sql
SHOW DATABASES
```
### delete database

Drop the database named `root.ln`:
```sql
DELETE DATABASE root.ln
```
### count databases

```sql
COUNT DATABASES
```
## Time Series Management

Time series is a collection of data points indexed by time. In IoTDB, time series refers to a complete sequence of measurement points. This section mainly introduces the management of time series.

### create timeseries

The encoding method and data type need to be specified. For example, create a time series named `root.ln.wf01.wt01.temperature`:
```sql
CREATE TIMESERIES root.ln.wf01.wt01.temperature WITH datatype=FLOAT,ENCODING=RLE
```

### show timeseries

View all time series:
```sql
SHOW TIMESERIES
```

Use wildcards to match time series under database `root.ln`:

```sql
SHOW TIMESERIES root.ln.**
```
### delete timeseries

Delete a time series named `root.ln.wf01.wt01.temperature`:
```sql
DELETE TIMESERIES root.ln.wf01.wt01.temperature
```
### count timeseries

Count the total number of time series:
```sql
COUNT TIMESERIES root.**
```
Count the number of time series under a wildcard path:
```sql
COUNT TIMESERIES root.ln.**
```
## Time Series Path Management

In addition to the concept of time series, IoTDB also has the concepts of subpaths and devices.

**Subpath**: It is a part of the path in a complete time series name. For example, if the time series name is `root.ln.wf01.wt01.temperature`, then `root.ln`, `root.ln.wf01`, and `root.ln.wf01.wt01` are all its subpaths.

**Device**: It is a combination of a group of time series. In IoTDB, the device is a subpath from the root to the penultimate node. If the time series name is `root.ln.wf01.wt01.temperature`, then `root.ln.wf01.wt01` is its device.

### show devices

```sql
SHOW DEVICES
```

### show child paths

Check out the next level of `root.ln`:
```sql
SHOW CHILD PATHS root.ln
```
### show child nodes

```sql
SHOW CHILD NODES root.ln
```
### count devices

Count the number of devices:
```sql
COUNT DEVICES
```
### count nodes

Count the number of nodes at the specified level in the path:
```sql
COUNT NODES root.ln.** LEVEL=2
```
## Query Data

The following are commonly used query statements in IoTDB.

### Query the data of the specified time series

Query all time series data under the device `root.ln.wf01.wt01`:

```sql
SELECT * FROM root.ln.wf01.wt01
```

### Query time series data within a certain time range

Query the data in the time series `root.ln.wf01.wt01.temperature` whose timestamp is greater than 2022-01-01T00:05:00.000:

```sql
SELECT temperature FROM root.ln.wf01.wt01 WHERE time > 2022-01-01T00:05:00.000
```

### Query time series data whose values are within the specified range

Query the data whose value is greater than 36.5 in the time series `root.ln.wf01.wt01.temperature`:

```sql
SELECT temperature FROM root.ln.wf01.wt01 WHERE temperature > 36.5
```

### Use last to query the latest point data

```sql
SELECT last * FROM root.ln.wf01.wt01
```
