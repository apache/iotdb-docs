# fApache Flink(SQL)

The flink-sql-iotdb-connector seamlessly connects Flink SQL or Flink Table with IoTDB, enabling real-time read and write operations on IoTDB within Flink tasks. It can be applied to the following scenarios:

1. Real-time data synchronization: Real-time synchronization of data from one database to another.
2. Real-time data pipeline: Building real-time data processing pipelines to process and analyze data in databases.
3. Real-time data analysis: Real-time analysis of data in databases, providing real-time business insights.
4. Real-time applications: Real-time application of database data in real-time applications such as real-time reporting and real-time recommendations.
5. Real-time monitoring: Real-time monitoring of database data, detecting anomalies and errors.

## Read and Write Modes

| Read Modes (Source)       | Write Modes (Sink)         |
| ------------------------- | -------------------------- |
| Bounded Scan, Lookup, CDC | Streaming Sink, Batch Sink |

### Read Modes (Source)

* **Bounded Scan:** Bounded scan is primarily implemented by specifying the `time series` and optional `upper and lower bounds of the query conditions` to query data, and the query result usually consists of multiple rows of data. This type of query cannot retrieve data that is updated after the query.

* **Lookup:** The lookup query mode differs from the scan query mode. While bounded scan queries data within a time range, the `lookup` query mode only queries data at a precise time point, resulting in a single row of data. Additionally, only the right table of a `lookup join` can use the lookup query mode.

* **CDC:** CDC is mainly used in Flink's ETL tasks. When data in IoTDB changes, Flink can detect it through our provided CDC connector, and we can forward the detected change data to other external data sources to achieve the purpose of ETL.

### Write Modes (Sink)

* **Streaming Sink:** Used in Flink's streaming mode, it synchronizes the insert, update, and delete records of the Dynamic Table in Flink to IoTDB in real-time.

* **Batch Sink:** Used in Flink's batch mode, it writes the batch computation results from Flink to IoTDB in a single operation.

## Usage

We provide two ways to use the flink-sql-iotdb-connector. One is to reference it through Maven during project development, and the other is to use it in Flink's sql-client. We will introduce these two usage methods separately.

> 📌 Note: flink version requires 1.17.0 and above.

### Maven

Simply add the following dependency to your project's pom file:

```xml
<dependency>
    <groupId>org.apache.iotdb</groupId>
    <artifactId>flink-sql-iotdb-connector</artifactId>
    <version>${iotdb.version}</version>
</dependency>
```

### sql-client

If you want to use the flink-sql-iotdb-connector in the sql-client, follow these steps to configure the environment:

1. Download the flink-sql-iotdb-connector jar file with dependencies from the [official website](https://iotdb.apache.org/Download/).

2. Copy the jar file to the `$FLINK_HOME/lib` directory.

3. Start the Flink cluster.

4. Start the sql-client.

You can now use the flink-sql-iotdb-connector in the sql-client.

## Table Structure Specification

Regardless of the type of connector used, the following table structure specifications must be met:

- For all tables using the `IoTDB connector`, the first column must be named `Time_` and have a data type of `BIGINT`.
- All column names, except for the `Time_` column, must start with `root.`. Additionally, any node in the column name cannot be purely numeric. If there are purely numeric or other illegal characters in the column name, they must be enclosed in backticks. For example, the path `root.sg.d0.123` is an illegal path, but `root.sg.d0.`123`` is a valid path.
- When querying data from IoTDB using either `pattern` or `sql`, the time series names in the query result must include all column names in Flink, except for `Time_`. If there is no corresponding column name in the query result, that column will be filled with null.
- The supported data types in flink-sql-iotdb-connector are: `INT`, `BIGINT`, `FLOAT`, `DOUBLE`, `BOOLEAN`, `STRING`. The data type of each column in Flink Table must match the corresponding time series type in IoTDB, otherwise an error will occur and the Flink task will exit.

The following examples illustrate the mapping between time series in IoTDB and columns in Flink Table.

## Read Mode (Source)

### Scan Table (Bounded)

#### Parameters

| Parameter                 | Required | Default         | Type   | Description                                                  |
| ------------------------- | -------- | --------------- | ------ | ------------------------------------------------------------ |
| nodeUrls                  | No       | 127.0.0.1:6667  | String | Specifies the datanode addresses of IoTDB. If IoTDB is deployed in cluster mode, multiple addresses can be specified, separated by commas. |
| user                      | No       | root            | String | IoTDB username                                               |
| password                  | No       | root            | String | IoTDB password                                               |
| scan.bounded.lower-bound  | No       | -1L             | Long   | Lower bound (inclusive) of the timestamp for bounded scan queries. Valid when the parameter is greater than `0`. |
| scan.bounded.upper-bound  | No       | -1L             | Long   | Upper bound (inclusive) of the timestamp for bounded scan queries. Valid when the parameter is greater than `0`. |
| sql                       | Yes      | None            | String | Query to be executed in IoTDB.                              |

#### Example

This example demonstrates how to read data from IoTDB using the `scan table` method in a Flink Table Job:

Assume the data in IoTDB is as follows:
```text
IoTDB> select ** from root;
+-----------------------------+-------------+-------------+-------------+
|                         Time|root.sg.d0.s0|root.sg.d1.s0|root.sg.d1.s1|
+-----------------------------+-------------+-------------+-------------+
|1970-01-01T08:00:00.001+08:00|    1.0833644|      2.34874|    1.2414109|
|1970-01-01T08:00:00.002+08:00|     4.929185|    3.1885583|    4.6980085|
|1970-01-01T08:00:00.003+08:00|    3.5206156|    3.5600138|    4.8080945|
|1970-01-01T08:00:00.004+08:00|    1.3449302|    2.8781595|    3.3195343|
|1970-01-01T08:00:00.005+08:00|    3.3079383|    3.3840187|    3.7278645|
+-----------------------------+-------------+-------------+-------------+
Total line number = 5
It costs 0.028s
```

```java
import org.apache.flink.table.api.*;

public class BoundedScanTest {
  public static void main(String[] args) throws Exception {
    // setup table environment
    EnvironmentSettings settings = EnvironmentSettings
            .newInstance()
            .inStreamingMode()
            .build();
    TableEnvironment tableEnv = TableEnvironment.create(settings);
    // setup schema
    Schema iotdbTableSchema =
            Schema.newBuilder()
                    .column("Time_", DataTypes.BIGINT())
                    .column("root.sg.d0.s0", DataTypes.FLOAT())
                    .column("root.sg.d1.s0", DataTypes.FLOAT())
                    .column("root.sg.d1.s1", DataTypes.FLOAT())
                    .build();
    // register table
    TableDescriptor iotdbDescriptor =
            TableDescriptor.forConnector("IoTDB")
                    .schema(iotdbTableSchema)
                    .option("nodeUrls", "127.0.0.1:6667")
                    .option("sql", "select ** from root")
                    .build();
    tableEnv.createTemporaryTable("iotdbTable", iotdbDescriptor);

    // output table
    tableEnv.from("iotdbTable").execute().print();
  }
}
```
After executing the above job, the output table in the Flink console is as follows:
```text
+----+----------------------+--------------------------------+--------------------------------+--------------------------------+
| op |                Time_ |                  root.sg.d0.s0 |                  root.sg.d1.s0 |                  root.sg.d1.s1 |
+----+----------------------+--------------------------------+--------------------------------+--------------------------------+
| +I |                    1 |                      1.0833644 |                        2.34874 |                      1.2414109 |
| +I |                    2 |                       4.929185 |                      3.1885583 |                      4.6980085 |
| +I |                    3 |                      3.5206156 |                      3.5600138 |                      4.8080945 |
| +I |                    4 |                      1.3449302 |                      2.8781595 |                      3.3195343 |
| +I |                    5 |                      3.3079383 |                      3.3840187 |                      3.7278645 |
+----+----------------------+--------------------------------+--------------------------------+--------------------------------+
```

### Lookup Point

#### Parameters

| Parameter                | Required | Default         | Type    | Description                                                                 |
| ------------------------ | -------- | --------------- | ------- | --------------------------------------------------------------------------- |
| nodeUrls                 | No       | 127.0.0.1:6667  | String  | Specifies the addresses of the IoTDB datanode. If IoTDB is deployed in cluster mode, multiple addresses can be specified, separated by commas. |
| user                     | No       | root            | String  | IoTDB username                                                              |
| password                 | No       | root            | String  | IoTDB password                                                              |
| lookup.cache.max-rows    | No       | -1              | Integer | Maximum number of rows to cache for lookup queries. Effective when the parameter is greater than `0`. |
| lookup.cache.ttl-sec     | No       | -1              | Integer | Time-to-live for cached data in lookup queries, in seconds.                 |
| sql                      | Yes      | None            | String  | SQL query to execute in IoTDB.                                              |

#### Example

This example demonstrates how to perform a `lookup` query using the `device` table in IoTDB as a dimension table:

* Use the `datagen connector` to generate two fields as the left table for `Lookup Join`. The first field is an incrementing field representing the timestamp. The second field is a random field representing a measurement time series.
* Register a table using the `IoTDB connector` as the right table for `Lookup Join`.
* Join the two tables together.

The current data in IoTDB is as follows:

```text
IoTDB> select ** from root;
+-----------------------------+-------------+-------------+-------------+
|                         Time|root.sg.d0.s0|root.sg.d1.s0|root.sg.d1.s1|
+-----------------------------+-------------+-------------+-------------+
|1970-01-01T08:00:00.001+08:00|    1.0833644|      2.34874|    1.2414109|
|1970-01-01T08:00:00.002+08:00|     4.929185|    3.1885583|    4.6980085|
|1970-01-01T08:00:00.003+08:00|    3.5206156|    3.5600138|    4.8080945|
|1970-01-01T08:00:00.004+08:00|    1.3449302|    2.8781595|    3.3195343|
|1970-01-01T08:00:00.005+08:00|    3.3079383|    3.3840187|    3.7278645|
+-----------------------------+-------------+-------------+-------------+
Total line number = 5
It costs 0.028s
```
```java
import org.apache.flink.table.api.DataTypes;
import org.apache.flink.table.api.EnvironmentSettings;
import org.apache.flink.table.api.Schema;
import org.apache.flink.table.api.TableDescriptor;
import org.apache.flink.table.api.TableEnvironment;

public class LookupTest {
  public static void main(String[] args) {
    // Setup environment
    EnvironmentSettings settings = EnvironmentSettings
            .newInstance()
            .inStreamingMode()
            .build();
    TableEnvironment tableEnv = TableEnvironment.create(settings);

    // Register left table
    Schema dataGenTableSchema =
            Schema.newBuilder()
                    .column("Time_", DataTypes.BIGINT())
                    .column("s0", DataTypes.INT())
                    .build();

    TableDescriptor datagenDescriptor =
            TableDescriptor.forConnector("datagen")
                    .schema(dataGenTableSchema)
                    .option("fields.Time_.kind", "sequence")
                    .option("fields.Time_.start", "1")
                    .option("fields.Time_.end", "5")
                    .option("fields.s0.min", "1")
                    .option("fields.s0.max", "1")
                    .build();
    tableEnv.createTemporaryTable("leftTable", datagenDescriptor);

    // Register right table
    Schema iotdbTableSchema =
            Schema.newBuilder()
                    .column("Time_", DataTypes.BIGINT())
                    .column("root.sg.d0.s0", DataTypes.FLOAT())
                    .column("root.sg.d1.s0", DataTypes.FLOAT())
                    .column("root.sg.d1.s1", DataTypes.FLOAT())
                    .build();

    TableDescriptor iotdbDescriptor =
            TableDescriptor.forConnector("IoTDB")
                    .schema(iotdbTableSchema)
                    .option("sql", "select ** from root")
                    .build();
    tableEnv.createTemporaryTable("rightTable", iotdbDescriptor);

    // Join
    String sql =
            "SELECT l.Time_, l.s0, r.`root.sg.d0.s0`, r.`root.sg.d1.s0`, r.`root.sg.d1.s1` "
                    + "FROM (SELECT *, PROCTIME() AS proc_time FROM leftTable) AS l "
                    + "JOIN rightTable FOR SYSTEM_TIME AS OF l.proc_time AS r "
                    + "ON l.Time_ = r.Time_";

    // Output table
    tableEnv.sqlQuery(sql).execute().print();
  }
}
```

After executing the above task, the output table in Flink's console is as follows:
```text
+----+----------------------+-------------+---------------+----------------------+--------------------------------+
| op |                Time_ |          s0 | root.sg.d0.s0 |        root.sg.d1.s0 |                  root.sg.d1.s1 |
+----+----------------------+-------------+---------------+----------------------+--------------------------------+
| +I |                    5 |           1 |     3.3079383 |            3.3840187 |                      3.7278645 |
| +I |                    2 |           1 |      4.929185 |            3.1885583 |                      4.6980085 |
| +I |                    1 |           1 |     1.0833644 |              2.34874 |                      1.2414109 |
| +I |                    4 |           1 |     1.3449302 |            2.8781595 |                      3.3195343 |
| +I |                    3 |           1 |     3.5206156 |            3.5600138 |                      4.8080945 |
+----+----------------------+-------------+---------------+----------------------+--------------------------------+
```
### CDC

#### Parameters

| Parameter       | Required | Default         | Type    | Description                                                                 |
| --------------- | -------- | --------------- | ------- | --------------------------------------------------------------------------- |
| nodeUrls        | No       | 127.0.0.1:6667  | String  | Specifies the datanode address of IoTDB. If IoTDB is deployed in cluster mode, multiple addresses can be specified, separated by commas. |
| user            | No       | root            | String  | IoTDB username                                                              |
| password        | No       | root            | String  | IoTDB password                                                              |
| mode            | Yes      | BOUNDED         | ENUM    | **This parameter must be set to `CDC` in order to start**                    |
| sql             | Yes      | None            | String  | SQL query to be executed in IoTDB                                           |
| cdc.port        | No       | 8080            | Integer | Port number for the CDC service in IoTDB                                    |
| cdc.task.name   | Yes      | None            | String  | Required when the mode parameter is set to CDC. Used to create a Pipe task in IoTDB. |
| cdc.pattern     | Yes      | None            | String  | Required when the mode parameter is set to CDC. Used as a filtering condition for sending data in IoTDB. |

#### Example

This example demonstrates how to retrieve the changing data from a specific path in IoTDB using the `CDC Connector`:

* Create a `CDC` table using the `CDC Connector`.
* Print the `CDC` table.

```java
import org.apache.flink.table.api.*;

public class CDCTest {
  public static void main(String[] args) {
    // setup environment
    EnvironmentSettings settings = EnvironmentSettings
            .newInstance()
            .inStreamingMode()
            .build();
    TableEnvironment tableEnv = TableEnvironment.create(settings);
    // setup schema
    Schema iotdbTableSchema = Schema
            .newBuilder()
            .column("Time_", DataTypes.BIGINT())
            .column("root.sg.d0.s0", DataTypes.FLOAT())
            .column("root.sg.d1.s0", DataTypes.FLOAT())
            .column("root.sg.d1.s1", DataTypes.FLOAT())
            .build();

    // register table
    TableDescriptor iotdbDescriptor = TableDescriptor
            .forConnector("IoTDB")
            .schema(iotdbTableSchema)
            .option("mode", "CDC")
            .option("cdc.task.name", "test")
            .option("cdc.pattern", "root.sg")
            .build();
    tableEnv.createTemporaryTable("iotdbTable", iotdbDescriptor);

    // output table
    tableEnv.from("iotdbTable").execute().print();
  }
}
```
Run the above Flink CDC task and execute the following SQL in IoTDB-cli:
```sql
insert into root.sg.d1(timestamp,s0,s1) values(6,1.0,1.0);
insert into root.sg.d1(timestamp,s0,s1) values(7,1.0,1.0);
insert into root.sg.d1(timestamp,s0,s1) values(6,2.0,1.0);
insert into root.sg.d0(timestamp,s0) values(7,2.0);
```
The console of Flink will print the following data:
```text
+----+----------------------+--------------------------------+--------------------------------+--------------------------------+
| op |                Time_ |                  root.sg.d0.s0 |                  root.sg.d1.s0 |                  root.sg.d1.s1 |
+----+----------------------+--------------------------------+--------------------------------+--------------------------------+
| +I |                    7 |                         <NULL> |                            1.0 |                            1.0 |
| +I |                    6 |                         <NULL> |                            1.0 |                            1.0 |
| +I |                    6 |                         <NULL> |                            2.0 |                            1.0 |
| +I |                    7 |                            2.0 |                         <NULL> |                         <NULL> |
```
## Write Mode (Sink)

### Streaming Sink

#### Parameters

| Parameter | Required | Default         | Type    | Description                                                                 |
| ----------| -------- | --------------- | ------- | --------------------------------------------------------------------------- |
| nodeUrls  | No       | 127.0.0.1:6667  | String  | Specifies the datanode address of IoTDB. If IoTDB is deployed in cluster mode, multiple addresses can be specified, separated by commas. |
| user      | No       | root            | String  | IoTDB username                                                              |
| password  | No       | root            | String  | IoTDB password                                                              |
| aligned   | No       | false           | Boolean | Whether to call the `aligned` interface when writing data to IoTDB.         |

#### Example

This example demonstrates how to write data to IoTDB in a Flink Table Streaming Job:

* Generate a source data table using the `datagen connector`.
* Register an output table using the `IoTDB connector`.
* Insert data from the source table into the output table.

```java
import org.apache.flink.table.api.DataTypes;
import org.apache.flink.table.api.EnvironmentSettings;
import org.apache.flink.table.api.Schema;
import org.apache.flink.table.api.Table;
import org.apache.flink.table.api.TableDescriptor;
import org.apache.flink.table.api.TableEnvironment;

public class StreamingSinkTest {
    public static void main(String[] args) {
        // setup environment
        EnvironmentSettings settings = EnvironmentSettings
                .newInstance()
                .inStreamingMode()
                .build();
        TableEnvironment tableEnv = TableEnvironment.create(settings);

        // create data source table
        Schema dataGenTableSchema = Schema
                .newBuilder()
                .column("Time_", DataTypes.BIGINT())
                .column("root.sg.d0.s0", DataTypes.FLOAT())
                .column("root.sg.d1.s0", DataTypes.FLOAT())
                .column("root.sg.d1.s1", DataTypes.FLOAT())
                .build();
        TableDescriptor descriptor = TableDescriptor
                .forConnector("datagen")
                .schema(dataGenTableSchema)
                .option("rows-per-second", "1")
                .option("fields.Time_.kind", "sequence")
                .option("fields.Time_.start", "1")
                .option("fields.Time_.end", "5")
                .option("fields.root.sg.d0.s0.min", "1")
                .option("fields.root.sg.d0.s0.max", "5")
                .option("fields.root.sg.d1.s0.min", "1")
                .option("fields.root.sg.d1.s0.max", "5")
                .option("fields.root.sg.d1.s1.min", "1")
                .option("fields.root.sg.d1.s1.max", "5")
                .build();
        // register source table
        tableEnv.createTemporaryTable("dataGenTable", descriptor);
        Table dataGenTable = tableEnv.from("dataGenTable");

        // create iotdb sink table
        TableDescriptor iotdbDescriptor = TableDescriptor
                .forConnector("IoTDB")
                .schema(dataGenTableSchema)
                .build();
        tableEnv.createTemporaryTable("iotdbSinkTable", iotdbDescriptor);

        // insert data
        dataGenTable.executeInsert("iotdbSinkTable").print();
    }
}
```

After the above job is executed, the query result in the IoTDB CLI is as follows:

```text
IoTDB> select ** from root;
+-----------------------------+-------------+-------------+-------------+
|                         Time|root.sg.d0.s0|root.sg.d1.s0|root.sg.d1.s1|
+-----------------------------+-------------+-------------+-------------+
|1970-01-01T08:00:00.001+08:00|    1.0833644|      2.34874|    1.2414109|
|1970-01-01T08:00:00.002+08:00|     4.929185|    3.1885583|    4.6980085|
|1970-01-01T08:00:00.003+08:00|    3.5206156|    3.5600138|    4.8080945|
|1970-01-01T08:00:00.004+08:00|    1.3449302|    2.8781595|    3.3195343|
|1970-01-01T08:00:00.005+08:00|    3.3079383|    3.3840187|    3.7278645|
+-----------------------------+-------------+-------------+-------------+
Total line number = 5
It costs 0.054s
```
### Batch Sink

#### Parameters

| Parameter | Required | Default         | Type    | Description                                                  |
| --------- | -------- | --------------- | ------- | ------------------------------------------------------------ |
| nodeUrls  | No       | 127.0.0.1:6667  | String  | Specifies the addresses of datanodes in IoTDB. If IoTDB is deployed in cluster mode, multiple addresses can be specified, separated by commas. |
| user      | No       | root            | String  | IoTDB username                                               |
| password  | No       | root            | String  | IoTDB password                                               |
| aligned   | No       | false           | Boolean | Whether to call the `aligned` interface when writing data to IoTDB. |

#### Example

This example demonstrates how to write data to IoTDB in a Batch Job of a Flink Table:

* Generate a source table using the `IoTDB connector`.
* Register an output table using the `IoTDB connector`.
* Write the renamed columns from the source table back to IoTDB.

```java
import org.apache.flink.table.api.DataTypes;
import org.apache.flink.table.api.EnvironmentSettings;
import org.apache.flink.table.api.Schema;
import org.apache.flink.table.api.Table;
import org.apache.flink.table.api.TableDescriptor;
import org.apache.flink.table.api.TableEnvironment;

import static org.apache.flink.table.api.Expressions.$;

public class BatchSinkTest {
  public static void main(String[] args) {
    // setup environment
    EnvironmentSettings settings = EnvironmentSettings
            .newInstance()
            .inBatchMode()
            .build();
    TableEnvironment tableEnv = TableEnvironment.create(settings);

    // create source table
    Schema sourceTableSchema = Schema
            .newBuilder()
            .column("Time_", DataTypes.BIGINT())
            .column("root.sg.d0.s0", DataTypes.FLOAT())
            .column("root.sg.d1.s0", DataTypes.FLOAT())
            .column("root.sg.d1.s1", DataTypes.FLOAT())
            .build();
    TableDescriptor sourceTableDescriptor = TableDescriptor
            .forConnector("IoTDB")
            .schema(sourceTableSchema)
            .option("sql", "select ** from root.sg.d0,root.sg.d1")
            .build();

    tableEnv.createTemporaryTable("sourceTable", sourceTableDescriptor);
    Table sourceTable = tableEnv.from("sourceTable");
    // register sink table
    Schema sinkTableSchema = Schema
            .newBuilder()
            .column("Time_", DataTypes.BIGINT())
            .column("root.sg.d2.s0", DataTypes.FLOAT())
            .column("root.sg.d3.s0", DataTypes.FLOAT())
            .column("root.sg.d3.s1", DataTypes.FLOAT())
            .build();
    TableDescriptor sinkTableDescriptor = TableDescriptor
            .forConnector("IoTDB")
            .schema(sinkTableSchema)
            .build();
    tableEnv.createTemporaryTable("sinkTable", sinkTableDescriptor);

    // insert data
    sourceTable.renameColumns(
            $("root.sg.d0.s0").as("root.sg.d2.s0"),
            $("root.sg.d1.s0").as("root.sg.d3.s0"),
            $("root.sg.d1.s1").as("root.sg.d3.s1")
    ).insertInto("sinkTable").execute().print();
  }
}
```

After the above task is executed, the query result in the IoTDB cli is as follows:

```text
IoTDB> select ** from root;
+-----------------------------+-------------+-------------+-------------+-------------+-------------+-------------+
|                         Time|root.sg.d0.s0|root.sg.d1.s0|root.sg.d1.s1|root.sg.d2.s0|root.sg.d3.s0|root.sg.d3.s1|
+-----------------------------+-------------+-------------+-------------+-------------+-------------+-------------+
|1970-01-01T08:00:00.001+08:00|    1.0833644|      2.34874|    1.2414109|    1.0833644|      2.34874|    1.2414109|
|1970-01-01T08:00:00.002+08:00|     4.929185|    3.1885583|    4.6980085|     4.929185|    3.1885583|    4.6980085|
|1970-01-01T08:00:00.003+08:00|    3.5206156|    3.5600138|    4.8080945|    3.5206156|    3.5600138|    4.8080945|
|1970-01-01T08:00:00.004+08:00|    1.3449302|    2.8781595|    3.3195343|    1.3449302|    2.8781595|    3.3195343|
|1970-01-01T08:00:00.005+08:00|    3.3079383|    3.3840187|    3.7278645|    3.3079383|    3.3840187|    3.7278645|
+-----------------------------+-------------+-------------+-------------+-------------+-------------+-------------+
Total line number = 5
It costs 0.015s
```
