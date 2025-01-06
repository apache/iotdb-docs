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

# View

## Sequence View Application Background

## Application Scenario 1 Time Series Renaming (PI Asset Management)

In practice, the equipment collecting data may be named with identification numbers that are difficult to be understood by human beings, which brings difficulties in querying to the business layer.

The Sequence View, on the other hand, is able to re-organise the management of these sequences and access them using a new model structure without changing the original sequence content and without the need to create new or copy sequences.

**For example**: a cloud device uses its own NIC MAC address to form entity numbers and stores data by writing the following time sequence:`root.db.0800200A8C6D.xvjeifg`.

It is difficult for the user to understand. However, at this point, the user is able to rename it using the sequence view feature, map it to a sequence view, and use `root.view.device001.temperature` to access the captured data.

### Application Scenario 2 Simplifying business layer query logic

Sometimes users have a large number of devices that manage a large number of time series. When conducting a certain business, the user wants to deal with only some of these sequences. At this time, the focus of attention can be picked out by the sequence view function, which is convenient for repeated querying and writing.

**For example**: Users manage a product assembly line with a large number of time series for each segment of the equipment. The temperature inspector only needs to focus on the temperature of the equipment, so he can extract the temperature-related sequences and compose the sequence view.

### Application Scenario 3 Auxiliary Rights Management

In the production process, different operations are generally responsible for different scopes. For security reasons, it is often necessary to restrict the access scope of the operations staff through permission management.

**For example**: The safety management department now only needs to monitor the temperature of each device in a production line, but these data are stored in the same database with other confidential data. At this point, it is possible to create a number of new views that contain only temperature-related time series on the production line, and then to give the security officer access to only these sequence views, thus achieving the purpose of permission restriction.

### Motivation for designing sequence view functionality

Combining the above two types of usage scenarios, the motivations for designing sequence view functionality, are:

1. time series renaming.
2. to simplify the query logic at the business level.
3. Auxiliary rights management, open data to specific users through the view.

## Sequence View Concepts

### Terminology Concepts

Concept: If not specified, the views specified in this document are **Sequence Views**, and new features such as device views may be introduced in the future.

### Sequence view

A sequence view is a way of organising the management of time series.

In traditional relational databases, data must all be stored in a table, whereas in time series databases such as IoTDB, it is the sequence that is the storage unit. Therefore, the concept of sequence views in IoTDB is also built on sequences.

A sequence view is a virtual time series, and each virtual time series is like a soft link or shortcut that maps to a sequence or some kind of computational logic external to a certain view. In other words, a virtual sequence either maps to some defined external sequence or is computed from multiple external sequences.

Users can create views using complex SQL queries, where the sequence view acts as a stored query statement, and when data is read from the view, the stored query statement is used as the source of the data in the FROM clause.

### Alias Sequences

There is a special class of beings in a sequence view that satisfy all of the following conditions:

1. the data source is a single time series
2. there is no computational logic
3. no filtering conditions (e.g., no WHERE clause restrictions).

Such a sequence view is called an **alias sequence**, or alias sequence view. A sequence view that does not fully satisfy all of the above conditions is called a non-alias sequence view. The difference between them is that only aliased sequences support write functionality.

** All sequence views, including aliased sequences, do not currently support Trigger functionality. **

### Nested Views

A user may want to select a number of sequences from an existing sequence view to form a new sequence view, called a nested view.

**The current version does not support the nested view feature**.

### Some constraints on sequence views in IoTDB

#### Constraint 1 A sequence view must depend on one or several time series

A sequence view has two possible forms of existence:

1. it maps to a time series
2. it is computed from one or more time series.

The former form of existence has been exemplified in the previous section and is easy to understand; the latter form of existence here is because the sequence view allows for computational logic.

For example, the user has installed two thermometers in the same boiler and now needs to calculate the average of the two temperature values as a measurement. The user has captured the following two sequences: `root.db.d01.temperature01`, `root.db.d01.temperature02`.

At this point, the user can use the average of the two sequences as one sequence in the view: `root.db.d01.avg_temperature`.

This example will 3.1.2 expand in detail.

#### Restriction 2 Non-alias sequence views are read-only

Writing to non-alias sequence views is not allowed.

Only aliased sequence views are supported for writing.

#### Restriction 3 Nested views are not allowed

It is not possible to select certain columns in an existing sequence view to create a sequence view, either directly or indirectly.

An example of this restriction will be given in 3.1.3.

#### Restriction 4 Sequence view and time series cannot be renamed

Both sequence views and time series are located under the same tree, so they cannot be renamed.

The name (path) of any sequence should be uniquely determined.

#### Restriction 5 Sequence views share timing data with time series, metadata such as labels are not shared

Sequence views are mappings pointing to time series, so they fully share timing data, with the time series being responsible for persistent storage.

However, their metadata such as tags and attributes are not shared.

This is because the business query, view-oriented users are concerned about the structure of the current view, and if you use group by tag and other ways to do the query, obviously want to get the view contains the corresponding tag grouping effect, rather than the time series of the tag grouping effect (the user is not even aware of those time series).

## Sequence view functionality

### Creating a view

Creating a sequence view is similar to creating a time series, the difference is that you need to specify the data source, i.e., the original sequence, through the AS keyword.

#### SQL for creating a view

User can select some sequences to create a view:

```SQL
CREATE VIEW root.view.device.status
AS
    SELECT s01  
    FROM root.db.device
```

It indicates that the user has selected the sequence `s01` from the existing device `root.db.device`, creating the sequence view `root.view.device.status`.

The sequence view can exist under the same entity as the time series, for example:

```SQL
CREATE VIEW root.db.device.status
AS
    SELECT s01
    FROM root.db.device
```

Thus, there is a virtual copy of `s01` under `root.db.device`, but with a different name `status`.

It can be noticed that the sequence views in both of the above examples are aliased sequences, and we are giving the user a more convenient way of creating a sequence for that sequence:

```SQL
CREATE VIEW root.view.device.status
AS
    root.db.device.s01
```

#### Creating views with computational logic

Following the example in section 2.2 Limitations 1:

> A user has installed two thermometers in the same boiler and now needs to calculate the average of the two temperature values as a measurement. The user has captured the following two sequences: `root.db.d01.temperature01`, `root.db.d01.temperature02`.
>
> At this point, the user can use the two sequences averaged as one sequence in the view: `root.view.device01.avg_temperature`.

If the view is not used, the user can query the average of the two temperatures like this:

```SQL
SELECT (temperature01 + temperature02) / 2
FROM root.db.d01
```

And if using a sequence view, the user can create a view this way to simplify future queries:

```SQL
CREATE VIEW root.db.d01.avg_temperature
AS
    SELECT (temperature01 + temperature02) / 2
    FROM root.db.d01
```

The user can then query it like this:

```SQL
SELECT avg_temperature FROM root.db.d01
```

#### Nested sequence views not supported

Continuing with the example from 3.1.2, the user now wants to create a new view using the sequence view `root.db.d01.avg_temperature`, which is not allowed. We currently do not support nested views, whether it is an aliased sequence or not.

For example, the following SQL statement will report an error:

```SQL
CREATE VIEW root.view.device.avg_temp_copy
AS
    root.db.d01.avg_temperature                        -- Not supported. Nested views are not allowed
```

#### Creating multiple sequence views at once

If only one sequence view can be specified at a time which is not convenient for the user to use, then multiple sequences can be specified at a time, for example:

```SQL
CREATE VIEW root.db.device.status, root.db.device.sub.hardware
AS
    SELECT s01, s02
    FROM root.db.device
```

此外，上述写法可以做简化：

```SQL
CREATE VIEW root.db.device(status, sub.hardware)
AS
    SELECT s01, s02
    FROM root.db.device
```

Both statements above are equivalent to the following typing:

```SQL
CREATE VIEW root.db.device.status
AS
    SELECT s01
    FROM root.db.device;

CREATE VIEW root.db.device.sub.hardware
AS
    SELECT s02
    FROM root.db.device
```

is also equivalent to the following:

```SQL
CREATE VIEW root.db.device.status, root.db.device.sub.hardware
AS
    root.db.device.s01, root.db.device.s02

-- or

CREATE VIEW root.db.device(status, sub.hardware)
AS
    root.db.device(s01, s02)
```

##### The mapping relationships between all sequences are statically stored

Sometimes, the SELECT clause may contain a number of statements that can only be determined at runtime, such as below:

```SQL
SELECT s01, s02
FROM root.db.d01, root.db.d02
```

The number of sequences that can be matched by the above statement is uncertain and is related to the state of the system. Even so, the user can use it to create views.

However, it is important to note that the mapping relationship between all sequences is stored statically (fixed at creation)! Consider the following example:

The current database contains only three sequences `root.db.d01.s01`, `root.db.d02.s01`, `root.db.d02.s02`, and then the view is created:

```SQL
CREATE VIEW root.view.d(alpha, beta, gamma)
AS
    SELECT s01, s02
    FROM root.db.d01, root.db.d02
```

The mapping relationship between time series is as follows:

| sequence number | time series | sequence view |
| ---- | ----------------- | ----------------- |
| 1 | `root.db.d01.s01` | root.view.d.alpha |
| 2 | `root.db.d02.s01` | root.view.d.beta |
| 3 | `root.db.d02.s02` | root.view.d.gamma |

After that, if the user adds the sequence `root.db.d01.s02`, it does not correspond to any view; then, if the user deletes `root.db.d01.s01`, the query for `root.view.d.alpha` will report an error directly, and it will not correspond to `root.db.d01.s02` either.

Please always note that inter-sequence mapping relationships are stored statically and solidly.

#### Batch Creation of Sequence Views

There are several existing devices, each with a temperature value, for example:

1. root.db.d1.temperature
2. root.db.d2.temperature
3. ...

There may be many other sequences stored under these devices (e.g. `root.db.d1.speed`), but for now it is possible to create a view that contains only the temperature values for these devices, without relation to the other sequences:.

```SQL
CREATE VIEW root.db.view(${2}_temperature）
AS
    SELECT temperature FROM root.db.*
```

This is modelled on the query writeback (`SELECT INTO`) convention for naming rules, which uses variable placeholders to specify naming rules. See also: [QUERY WRITEBACK (SELECT INTO)](../User-Manual/Query-Data.md#into-clause-query-write-back)

Here `root.db.*.temperature` specifies what time series will be included in the view; and `${2}` specifies from which node in the time series the name is extracted to name the sequence view.

Here, `${2}` refers to level 2 (starting at 0) of `root.db.*.temperature`, which is the result of the `*` match; and `${2}_temperature` is the result of the match and `temperature` spliced together with underscores to make up the node names of the sequences under the view.

The above statement for creating a view is equivalent to the following writeup:

```SQL
CREATE VIEW root.db.view(${2}_${3}）
AS
    SELECT temperature from root.db.*
```

The final view contains these sequences:

1. root.db.view.d1_temperature
2. root.db.view.d2_temperature
3. ...

Created using wildcards, only static mapping relationships at the moment of creation will be stored.

#### SELECT clauses are somewhat limited when creating views

The SELECT clause used when creating a serial view is subject to certain restrictions. The main restrictions are as follows:

1. the `WHERE` clause cannot be used.
2. `GROUP BY` clause cannot be used.
3. `MAX_VALUE` and other aggregation functions cannot be used.

Simply put, after `AS` you can only use `SELECT ... FROM ... ` and the results of this query must form a time series.

### View Data Queries

For the data query functions that can be supported, the sequence view and time series can be used indiscriminately with identical behaviour when performing time series data queries.

**The types of queries that are not currently supported by the sequence view are as follows:**

1. **align by device query
2. **group by tags query

Users can also mix time series and sequence view queries in the same SELECT statement, for example:

```SQL
SELECT temperature01, temperature02, avg_temperature
FROM root.db.d01
WHERE temperature01 < temperature02
```

However, if the user wants to query the metadata of the sequence, such as tag, attributes, etc., the query is the result of the sequence view, not the result of the time series referenced by the sequence view.

In addition, for aliased sequences, if the user wants to get information about the time series such as tags, attributes, etc., the user needs to query the mapping of the view columns to find the corresponding time series, and then query the time series for the tags, attributes, etc. The method of querying the mapping of the view columns will be explained in section 3.5.

### Modify Views

The modification operations supported by the view include: modifying its calculation logic,modifying tag/attributes/aliases, and deleting.

#### Modify view data source

```SQL
ALTER VIEW root.view.device.status
AS
    SELECT s01
    FROM root.ln.wf.d01
```

#### Modify the view's calculation logic

```SQL
ALTER VIEW root.db.d01.avg_temperature
AS
    SELECT (temperature01 + temperature02 + temperature03) / 3
    FROM root.db.d01
```

#### Tag point management

- Add a new 
tag
```SQL
ALTER view root.turbine.d1.s1 ADD TAGS tag3=v3, tag4=v4
```

- Add a new attribute

```SQL
ALTER view root.turbine.d1.s1 ADD ATTRIBUTES attr3=v3, attr4=v4
```

- rename tag or attribute

```SQL
ALTER view root.turbine.d1.s1 RENAME tag1 TO newTag1
```

- Reset the value of a tag or attribute

```SQL
ALTER view root.turbine.d1.s1 SET newTag1=newV1, attr1=newV1
```

- Delete an existing tag or attribute

```SQL
ALTER view root.turbine.d1.s1 DROP tag1, tag2
```

- Update insert aliases, tags and attributes

> If the alias, tag or attribute did not exist before, insert it, otherwise, update the old value with the new one.

```SQL
ALTER view root.turbine.d1.s1 UPSERT TAGS(tag2=newV2, tag3=v3) ATTRIBUTES(attr3=v3, attr4=v4)
```

#### Deleting Views

Since a view is a sequence, a view can be deleted as if it were a time series.


```SQL
DELETE VIEW root.view.device.avg_temperatue
```

### View Synchronisation



#### If the dependent original sequence is deleted

When the sequence view is queried (when the sequence is parsed), **the empty result set** is returned if the dependent time series does not exist.

This is similar to the feedback for querying a non-existent sequence, but with a difference: if the dependent time series cannot be parsed, the empty result set is the one that contains the table header as a reminder to the user that the view is problematic.

Additionally, when the dependent time series is deleted, no attempt is made to find out if there is a view that depends on the column, and the user receives no warning.

#### Data Writes to Non-Aliased Sequences Not Supported

Writes to non-alias sequences are not supported.

Please refer to the previous section 2.1.6 Restrictions2 for more details.

#### Metadata for sequences is not shared

Please refer to the previous section 2.1.6 Restriction 5 for details.

### View Metadata Queries

View metadata query specifically refers to querying the metadata of the view itself (e.g., how many columns the view has), as well as information about the views in the database (e.g., what views are available).

#### Viewing Current View Columns

The user has two ways of querying:

1. a query using `SHOW TIMESERIES`, which contains both time series and series views. This query contains both the time series and the sequence view. However, only some of the attributes of the view can be displayed.
2. a query using `SHOW VIEW`, which contains only the sequence view. It displays the complete properties of the sequence view.

Example:

```Shell
IoTDB> show timeseries;
+--------------------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+
|          Timeseries|Alias|Database|DataType|Encoding|Compression|Tags|Attributes|Deadband|DeadbandParameters|ViewType|
+--------------------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+
|root.db.device.s01  | null| root.db|   INT32|     RLE|     SNAPPY|null|      null|    null|              null|    BASE|
+--------------------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+
|root.db.view.status | null| root.db|   INT32|     RLE|     SNAPPY|null|      null|    null|              null|    VIEW|
+--------------------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+
|root.db.d01.temp01  | null| root.db|   FLOAT|     RLE|     SNAPPY|null|      null|    null|              null|    BASE|
+--------------------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+
|root.db.d01.temp02  | null| root.db|   FLOAT|     RLE|     SNAPPY|null|      null|    null|              null|    BASE|
+--------------------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+
|root.db.d01.avg_temp| null| root.db|   FLOAT|    null|       null|null|      null|    null|              null|    VIEW|
+--------------------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+
Total line number = 5
It costs 0.789s
IoTDB>
```

The last column `ViewType` shows the type of the sequence, the time series is BASE and the sequence view is VIEW.

In addition, some of the sequence view properties will be missing, for example `root.db.d01.avg_temp` is calculated from temperature averages, so the `Encoding` and `Compression` properties are null values.

In addition, the query results of the `SHOW TIMESERIES` statement are divided into two main parts.

1. information about the timing data, such as data type, compression, encoding, etc.
2. other metadata information, such as tag, attribute, database, etc.

For the sequence view, the temporal data information presented is the same as the original sequence or null (e.g., the calculated average temperature has a data type but no compression method); the metadata information presented is the content of the view.

To learn more about the view, use `SHOW ``VIEW`. The `SHOW ``VIEW` shows the source of the view's data, etc.

```Shell
IoTDB> show VIEW root.**;
+--------------------+--------+--------+----+----------+--------+-----------------------------------------+
|          Timeseries|Database|DataType|Tags|Attributes|ViewType|                                   SOURCE|
+--------------------+--------+--------+----+----------+--------+-----------------------------------------+
|root.db.view.status | root.db|   INT32|null|      null|    VIEW|                       root.db.device.s01|
+--------------------+--------+--------+----+----------+--------+-----------------------------------------+
|root.db.d01.avg_temp| root.db|   FLOAT|null|      null|    VIEW|(root.db.d01.temp01+root.db.d01.temp02)/2|
+--------------------+--------+--------+----+----------+--------+-----------------------------------------+
Total line number = 2
It costs 0.789s
IoTDB>
```

The last column, `SOURCE`, shows the data source for the sequence view, listing the SQL statement that created the sequence.

##### About Data Types

Both of the above queries involve the data type of the view. The data type of a view is inferred from the original time series type of the query statement or alias sequence that defines the view. This data type is computed in real time based on the current state of the system, so the data type queried at different moments may be changing.

## FAQ

#### Q1: I want the view to implement the function of type conversion. For example, a time series of type int32 was originally placed in the same view as other series of type int64. I now want all the data queried through the view to be automatically converted to int64 type.

> Ans: This is not the function of the sequence view. But the conversion can be done using `CAST`, for example:

```SQL
CREATE VIEW root.db.device.int64_status
AS 
    SELECT CAST(s1, 'type'='INT64') from root.db.device
```

> This way, a query for `root.view.status` will yield a result of type int64.
> 
> Please note in particular that in the above example, the data for the sequence view is obtained by `CAST` conversion, so `root.db.device.int64_status` is not an aliased sequence, and thus **not supported for writing**.

#### Q2: Is default naming supported? Select a number of time series and create a view; but I don't specify the name of each series, it is named automatically by the database?

> Ans: Not supported. Users must specify the naming explicitly.

#### Q3: In the original system, create time series `root.db.device.s01`, you can find that database `root.db` is automatically created and device `root.db.device` is automatically created. Next, deleting the time series `root.db.device.s01` reveals that `root.db.device` was automatically deleted, while `root.db` remained. Will this mechanism be followed for creating views? What are the considerations?

> Ans: Keep the original behaviour unchanged, the introduction of view functionality will not change these original logics.

#### Q4: Does it support sequence view renaming?

> A: Renaming is not supported in the current version, you can create your own view with new name to put it into use.