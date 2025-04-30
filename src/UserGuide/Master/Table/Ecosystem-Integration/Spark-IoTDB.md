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

# Apache Spark(IoTDB)

## 1. Functional Overview

IoTDB provides the `Spark-IoTDB-Table-Connector` to integrate IoTDB's table model with Spark, enabling data read/write operations in Spark environments through both DataFrame and Spark SQL interfaces.

### 1.1 DataFrame

DataFrame is a structured data abstraction in Spark, containing schema metadata (column names, data types, etc.) and serving as the primary data carrier between Spark operators. DataFrame transformations follow a lazy execution mechanism, where operations are only physically executed upon triggering an *action* (e.g., writing results or invoking `collect()`), thereby optimizing resource utilization by avoiding redundant computations.

The `Spark-IoTDB-Table-Connector` allows:

• Write: Processed DataFrames from upstream tasks can be directly written into IoTDB tables.

• Read: Data from IoTDB tables can be loaded as DataFrames for downstream analytical tasks.

![](/img/table-spark-en-1.png)

### 1.2 Spark SQL

Spark clusters can be accessed via the `Spark-SQL Shell` for interactive SQL execution. The `Spark-IoTDB-Table-Connector` maps IoTDB tables to temporary external views in Spark, enabling direct read/write operations using Spark SQL.

## 2. Compatibility Requirements

| Software                          | Version   |
| ----------------------------------- |-----------|
| `Spark-IoTDB-Table-Connector` | `2.0.4`   |
| `Spark`                       | `3.3-3.5` |
| `IoTDB`                       | `2.0.1+`  |
| `Scala`                       | `2.12`    |
| `JDK`                         | `8,11`    |

## 3. Deployment Methods

### 3.1 DataFrame

Add the following dependency to your project’s `pom.xml`:

```XML
<dependency>  
    <groupId>org.apache.iotdb</groupId>  
    <artifactId>spark-iotdb-table-connector-3.5</artifactId>  
    <version>2.0.4</version>  
</dependency>
```

### 3.2 Spark SQL

1.  Download the `Spark-IoTDB-Table-Connector` JAR from the official repository.
2. Copy the JAR file to the `${SPARK_HOME}/jars` directory.

![](/img/table-spark-en-2.png)

## 4. Usage Guide

### 4.1 Reading Data

#### 4.1.1 DataFrame

```Scala
val df = spark.read.format("org.apache.iotdb.spark.table.db.IoTDBTableProvider")  
  .option("iotdb.database", "$YOUR_IOTDB_DATABASE_NAME")  
  .option("iotdb.table", "$YOUR_IOTDB_TABLE_NAME")  
  .option("iotdb.username", "$YOUR_IOTDB_USERNAME")  
  .option("iotdb.password", "$YOUR_IOTDB_PASSWORD")  
  .option("iotdb.url", "$YOUR_IOTDB_URL")  
  .load()
```

#### 4.1.2 Spark SQL

```SQL
CREATE TEMPORARY VIEW spark_iotdb  
   USING org.apache.iotdb.spark.table.db.IoTDBTableProvider  
   OPTIONS(  
   "iotdb.database"="$YOUR_IOTDB_DATABASE_NAME",  
   "iotdb.table"="$YOUR_IOTDB_TABLE_NAME",  
   "iotdb.username"="$YOUR_IOTDB_USERNAME",  
   "iotdb.password"="$YOUR_IOTDB_PASSWORD",  
   "iotdb.urls"="$YOUR_IOTDB_URL"  
);  

SELECT * FROM spark_iotdb;
```

#### 4.1.3 Parameters

| Parameter            | Default              | Description                                                       | Mandatory |
| ---------------------- | ---------------------- | ------------------------------------------------------------------- | ----------- |
| `iotdb.database` | —                   | IoTDB database name (must pre-exist in IoTDB)                     | Yes       |
| `iotdb.table`    | —                   | IoTDB table name (must pre-exist in IoTDB)                        | Yes       |
| `iotdb.username` | `root`           | IoTDB username                                                    | No        |
| `iotdb.password` | `root`           | IoTDB password                                                    | No        |
| `iotdb.urls`     | `127.0.0.1:6667` | IoTDB DataNode RPC endpoints (comma-separated for multiple nodes) | No        |

#### 4.1.4 Key Notes

IoTDB supports several filtering conditions, column pruning, and `OFFSET`/`LIMIT` pushdown.

* The filtering conditions that can be pushed down include:

| Name               | SQL( IoTDB)                      |
| -------------------- | ---------------------------------- |
| `IS_NULL`      | `expr IS NULL`               |
| `IS_NOT_NULL`  | `expr IS NOT NULL`           |
| `STARTS_WITH`  | `starts_with(expr1, expr2)`  |
| `ENDS_WITH`    | `ends_with(expr1, expr2)`    |
| `CONTAINS`     | `expr1 LIKE '%expr2%'`       |
| `IN`           | `expr IN (expr1, expr2,...)` |
| `=`            | `expr1 = expr2`              |
| `<>`           | `expr1 <> expr2`             |
| `<`            | `expr1 < expr2`              |
| `<=`           | `expr1 <= expr2`             |
| `>`            | `expr1 > expr2`              |
| `>=`           | `expr1 >= expr2`             |
| `AND`          | `expr1 AND expr2`            |
| `OR`           | `expr1 OR expr2`             |
| `NOT`          | `NOT expr`                   |
| `ALWAYS_TRUE`  | `TRUE`                       |
| `ALWAYS_FALSE` | `FASLE`                      |

> Constraints:
> * `CONTAINS` requires constant values for `expr2`.
> * Non-pushdown-capable child expressions invalidate the entire conjunctive clause.

* Column Pruning:

Supports specifying column names when constructing IoTDB SQL queries to avoid transferring unnecessary column data.

* Offset/Limit Pushdown:

Supports pushdown of OFFSET and LIMIT clauses, enabling direct integration of Spark-provided pagination parameters into IoTDB queries.

### 4.2 Writing Data

#### 4.2.1 DataFrame

```Scala
val df = spark.createDataFrame(List(  
  (1L, "tag1_value1", "tag2_value1", "attribute1_value1", 1, true),  
  (2L, "tag1_value1", "tag2_value2", "attribute1_value1", 2, false)))  
  .toDF("time", "tag1", "tag2", "attribute1", "s1", "s2")  

df  
  .write  
  .format("org.apache.iotdb.spark.table.db.IoTDBTableProvider")  
  .option("iotdb.database", "$YOUR_IOTDB_DATABASE_NAME")  
  .option("iotdb.table", "$YOUR_IOTDB_TABLE_NAME")  
  .option("iotdb.username", "$YOUR_IOTDB_USERNAME")  
  .option("iotdb.password", "$YOUR_IOTDB_PASSWORD")  
  .option("iotdb.urls", "$YOUR_IOTDB_URL")  
  .save()
```

#### 4.2.2 Spark SQL

```SQL
CREATE TEMPORARY VIEW spark_iotdb  
   USING org.apache.iotdb.spark.table.db.IoTDBTableProvider  
   OPTIONS(  
   "iotdb.database"="$YOUR_IOTDB_DATABASE_NAME",  
   "iotdb.table"="$YOUR_IOTDB_TABLE_NAME",  
   "iotdb.username"="$YOUR_IOTDB_USERNAME",  
   "iotdb.password"="$YOUR_IOTDB_PASSWORD",  
   "iotdb.urls"="$YOUR_IOTDB_URL"  
);  

INSERT INTO spark_iotdb VALUES ("VALUE1", "VALUE2", ...);  
INSERT INTO spark_iotdb SELECT * FROM YOUR_TABLE;
```

#### 4.2.3 Key Notes

* No Auto-Schema Creation: Tables/columns must pre-exist in IoTDB.
* Order Sensitivity:
    * `INSERT INTO VALUES`: Values must follow IoTDB table schema order (as per `DESC TABLE`).
    * `INSERT INTO SELECT`: Columns must exist in the target table. Mismatched column counts trigger `IllegalArgumentException`.
* Column Name Mapping: DataFrame or `INSERT INTO SELECT` with explicit column names allows schema order flexibility.

### 4.3 Data Type Mapping

1.  Read (From IoTDB  To Spark)

| IoTDB Type                 | Spark Type        |
| ---------------------------- | ------------------- |
| `TsDataType.BOOLEAN`   | `BooleanType` |
| `TsDataType.INT32`     | `IntegerType` |
| `TsDataType.DATE`      | `DateType`    |
| `TsDataType.INT64`     | `LongType`    |
| `TsDataType.TIMESTAMP` | `LongType`    |
| `TsDataType.FLOAT`     | `FloatType`   |
| `TsDataType.DOUBLE`    | `DoubleType`  |
| `TsDataType.STRING`    | `StringType`  |
| `TsDataType.TEXT`      | `StringType`  |
| `TsDataType.BLOB`      | `BinaryType`  |

2. Write (From Spark To IoTDB)

The mapping primarily converts data into IoTDB Tablet format for writing.

> During the Tablet ingestion process into IoTDB, secondary type conversion will be automatically performed if data type mismatches occur.

| Spark Type        | IoTDB Type               |
| ------------------- | -------------------------- |
| `BooleanType` | `TsDataType.BOOLEAN` |
| `ByteType`    | `TsDataType.INT32`   |
| `ShortType`   | `TsDataType.INT32`   |
| `IntegerType` | `TsDataType.INT32`   |
| `LongType`    | `TsDataType.INT64`   |
| `FloatType`   | `TsDataType.FLOAT`   |
| `DoubleType`  | `TsDataType.DOUBLE`  |
| `StringType`  | `TsDataType.STRING`  |
| `BinaryType`  | `TsDataType.BLOB`    |
| `DateType`    | `TsDataType.DATE`    |
| `Others`      | `TsDataType.STRING`  |

### 4.4 Security

1.  Authentication & Authorization

* Credentials: Username/password are required for IoTDB access.
* Access Control:
    * Write: Requires `INSERT` privilege on the target table/database.
    * Read: Requires `SELECT` privilege on the target table/database.

2. Constraints

* Automatic table/column creation is unsupported.
* Schema validation is enforced during writing.