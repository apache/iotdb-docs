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

# Apache Spark

## 1. Overview
IoTDB provides the `Spark-IoTDB-Connector`, a Spark connector for IoTDB's tree model, which supports reading and writing data from/to IoTDB's tree model in Spark environments.

## 2. Compatibility Requirements
| Software | Version |
|----------|---------|
| `Spark` | 2.4.0-latest |
| `Scala` | 2.11, 2.12 |

* The `spark-iotdb-connector` is compatible with Java, Scala-based Spark, and PySpark.

## 3. Deployment Methods
There are two usage scenarios for the `spark-iotdb-connector`: IDE development and `spark-shell` debugging.

### 3.1 IDE Development
For IDE development, simply add the following dependency to your `pom.xml` file.

```XML
<dependency>
      <groupId>org.apache.iotdb</groupId>
      <!-- spark-iotdb-connector_2.11 or spark-iotdb-connector_2.13 -->
      <artifactId>spark-iotdb-connector_2.12.10</artifactId>
      <version>${iotdb.version}</version>
    </dependency>
```

### 3.2 `spark-shell` Debugging
To use the `spark-iotdb-connector` in `spark-shell`, follow these steps:

* Download the `with-dependencies` JAR package from the official website
* Copy the JAR package to the `${SPARK_HOME}/jars` directory using the following command:

```Bash
cp spark-iotdb-connector_2.12.10-${iotdb.version}.jar $SPARK_HOME/jars/
```

To ensure Spark can connect to IoTDB via JDBC, perform the following steps:

* Compile the IoTDB-JDBC connector by running:

```Bash
mvn clean package -pl iotdb-client/jdbc -am -DskipTests -P get-jar-with-dependencies
```

* The compiled JAR package will be located in the following directory:

```Bash
$IoTDB_HOME/iotdb-client/jdbc/target/iotdb-jdbc-{version}-SNAPSHOT-jar-with-dependencies.jar
```

* Copy the JAR package to the `${SPARK_HOME}/jars` directory using the following command:

```Bash
cp iotdb-jdbc-{version}-SNAPSHOT-jar-with-dependencies.jar $SPARK_HOME/jars/
```

## 4. Usage
### 4.1 Parameter Description
| **Parameter** | **Description** | **Default Value** | **Usage Scope** | **Nullable** |
|---------------|-----------------|-------------------|-----------------|--------------|
| url | Specifies the JDBC URL of IoTDB | null | read, write | FALSE |
| user | IoTDB username | root | read, write | TRUE |
| password | IoTDB password | root | read, write | TRUE |
| sql | Specifies the SQL query statement | null | read | TRUE |
| numPartition | Specifies the number of DataFrame partitions for read operations, and the write concurrency for write operations | 1 | read, write | TRUE |
| lowerBound | Query start timestamp (inclusive) | 0 | read | TRUE |
| upperBound | Query end timestamp (inclusive) | 0 | read | TRUE |

### 4.2 Reading Data
* Read data from IoTDB into a DataFrame

```scala
import org.apache.iotdb.spark.db._

val df = spark.read.format("org.apache.iotdb.spark.db")
  .option("user", "root")
  .option("password", "root")
  .option("url", "jdbc:iotdb://127.0.0.1:6667/")
  .option("sql", "select ** from root") // Query SQL
  .option("lowerBound", "0") // Timestamp lower bound
  .option("upperBound", "100000000") // Timestamp upper bound
  .option("numPartition", "5") // Number of partitions
  .load

df.printSchema()

df.show()
```

### 4.3 Writing Data
```scala
// Construct narrow table data
val df = spark.createDataFrame(List(
  (1L, "root.test.d0", 1, 1L, 1.0F, 1.0D, true, "hello"),
  (2L, "root.test.d0", 2, 2L, 2.0F, 2.0D, false, "world")))

val dfWithColumn = df.withColumnRenamed("_1", "Time")
  .withColumnRenamed("_2", "Device")
  .withColumnRenamed("_3", "s0")
  .withColumnRenamed("_4", "s1")
  .withColumnRenamed("_5", "s2")
  .withColumnRenamed("_6", "s3")
  .withColumnRenamed("_7", "s4")
  .withColumnRenamed("_8", "s5")

// Write narrow table data
dfWithColumn
  .write
  .format("org.apache.iotdb.spark.db")
  .option("url", "jdbc:iotdb://127.0.0.1:6667/")
  .save

// Construct wide table data
val df = spark.createDataFrame(List(
  (1L, 1, 1L, 1.0F, 1.0D, true, "hello"),
  (2L, 2, 2L, 2.0F, 2.0D, false, "world")))

val dfWithColumn = df.withColumnRenamed("_1", "Time")
  .withColumnRenamed("_2", "root.test.d0.s0")
  .withColumnRenamed("_3", "root.test.d0.s1")
  .withColumnRenamed("_4", "root.test.d0.s2")
  .withColumnRenamed("_5", "root.test.d0.s3")
  .withColumnRenamed("_6", "root.test.d0.s4")
  .withColumnRenamed("_7", "root.test.d0.s5")

// Write wide table data
dfWithColumn.write.format("org.apache.iotdb.spark.db")
  .option("url", "jdbc:iotdb://127.0.0.1:6667/")
  .option("numPartition", "10")
  .save
```

## 5. Wide Table vs Narrow Table
### 5.1 Data Format Example
Taking the TsFile structure as an example, assume there are three measurements in the TsFile schema: status, temperature, and hardware.

* Basic information:

| Name | Type | Encoding |
|------|------|----------|
| status | Boolean | PLAIN |
| temperature | Float | RLE |
| hardware | Text | PLAIN |

* Data:
    * `d1:root.ln.wf01.wt01`
    * `d2:root.ln.wf02.wt02`

| time | d1.status | time | d1.temperature | time | d2.hardware | time | d2.status |
|------|-----------|------|----------------|------|-------------|------|-----------|
| 1    | True      | 1    | 2.2            | 2    | "aaa"       | 1    | True      |
| 3    | True      | 2    | 2.2            | 4    | "bbb"       | 2    | False     |
| 5    | False     | 3    | 2.1            | 6    | "ccc"       | 4    | True      |

* Wide table (default) format:

| Time | root.ln.wf02.wt02.temperature | root.ln.wf02.wt02.status | root.ln.wf02.wt02.hardware | root.ln.wf01.wt01.temperature | root.ln.wf01.wt01.status | root.ln.wf01.wt01.hardware |
|------|-------------------------------|--------------------------|----------------------------|-------------------------------|--------------------------|----------------------------|
| 1    | null                          | true                     | null                       | 2.2                           | true                     | null                       |
| 2    | null                          | false                    | aaa                        | 2.2                           | null                     | null                       |
| 3    | null                          | null                     | null                       | 2.1                           | true                     | null                       |
| 4    | null                          | true                     | bbb                        | null                          | null                     | null                       |
| 5    | null                          | null                     | null                       | null                          | false                    | null                       |
| 6    | null                          | null                     | ccc                        | null                          | null                     | null                       |

* Narrow table format:

| Time | Device            | status | hardware | temperature |
|------|-------------------|--------|----------|-------------|
| 1    | root.ln.wf01.wt01 | true   | null     | 2.2         |
| 1    | root.ln.wf02.wt02 | true   | null     | null        |
| 2    | root.ln.wf01.wt01 | null   | null     | 2.2         |
| 2    | root.ln.wf02.wt02 | false  | aaa      | null        |
| 3    | root.ln.wf01.wt01 | true   | null     | 2.1         |
| 4    | root.ln.wf02.wt02 | true   | bbb      | null        |
| 5    | root.ln.wf01.wt01 | false  | null     | null        |
| 6    | root.ln.wf02.wt02 | null   | ccc      | null        |

> Note: Corrected the device path typo in the original narrow table example (from `root.ln.wf02.wt01` to `root.ln.wf01.wt01`) to match the data definition.

### 5.2 Data Conversion Example
* Convert from wide table to narrow table

```scala
import org.apache.iotdb.spark.db._

val wide_df = spark.read.format("org.apache.iotdb.spark.db").option("url", "jdbc:iotdb://127.0.0.1:6667/").option("sql", "select * from root.** where time < 1100 and time > 1000").load
val narrow_df = Transformer.toNarrowForm(spark, wide_df)
```

* Convert from narrow table to wide table

```scala
import org.apache.iotdb.spark.db._

val wide_df = Transformer.toWideForm(spark, narrow_df)
```
