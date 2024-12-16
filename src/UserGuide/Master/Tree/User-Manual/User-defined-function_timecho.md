#  USER-DEFINED FUNCTION (UDF)

## 1. UDF Introduction

UDF (User Defined Function) refers to user-defined functions. IoTDB provides a variety of built-in time series processing functions and also supports extending custom functions to meet more computing needs.

In IoTDB, you can expand two types of UDF:

<table style="text-align: left;">
  <tbody>
     <tr>            <th>UDF Class</th>
            <th>AccessStrategy</th>        
            <th>Description</th>
      </tr>
      <tr>
            <td rowspan="2">UDTF</td>
            <td>MAPPABLE_ROW_BY_ROW</td>
            <td>Custom scalar function, input k columns of time series and 1 row of data, output 1 column of time series and 1 row of data, can be used in any clause and expression that appears in the scalar function, such as select clause, where clause, etc.</td>
      </tr>
      <tr>
            <td>ROW_BY_ROW <br>SLIDING_TIME_WINDOW <br>SLIDING_SIZE_WINDOW <br>SESSION_TIME_WINDOW <br>STATE_WINDOW</td>
            <td>Custom time series generation function, input k columns of time series m rows of data, output 1 column of time series n rows of data, the number of input rows m can be different from the number of output rows n, and can only be used in SELECT clauses.</td>
      </tr>
      <tr>
            <td>UDAF</td>
            <td>-</td>       
            <td>Custom aggregation function, input k columns of time series m rows of data, output 1 column of time series 1 row of data, can be used in any clause and expression that appears in the aggregation function, such as select clause, having clause, etc.</td>
      </tr>
</tbody>
</table>

###  1.1 UDF usage 

The usage of UDF is similar to that of regular built-in functions, and can be directly used in SELECT statements like calling regular functions.

#### 1.Basic SQL syntax support

* Support `SLIMIT` / `SOFFSET`
* Support `LIMIT` / `OFFSET`
* Support queries with value filters
* Support queries with time filters


#### 2. Queries with * in SELECT Clauses

Assume that there are 2 time series (`root.sg.d1.s1` and `root.sg.d1.s2`)  in the system.

* **`SELECT example(*) from root.sg.d1`**

Then the result set will include the results of `example (root.sg.d1.s1)` and `example (root.sg.d1.s2)`.

* **`SELECT example(s1, *) from root.sg.d1`**

Then the result set will include the results of `example(root.sg.d1.s1, root.sg.d1.s1)` and `example(root.sg.d1.s1, root.sg.d1.s2)`.

* **`SELECT example(*, *) from root.sg.d1`**

Then the result set will include the results of  `example(root.sg.d1.s1, root.sg.d1.s1)`, `example(root.sg.d1.s2, root.sg.d1.s1)`, `example(root.sg.d1.s1, root.sg.d1.s2)` and `example(root.sg.d1.s2, root.sg.d1.s2)`.

#### 3. Queries with Key-value Attributes in UDF Parameters

You can pass any number of key-value pair parameters to the UDF when constructing a UDF query. The key and value in the key-value pair need to be enclosed in single or double quotes. Note that key-value pair parameters can only be passed in after all time series have been passed in. Here is a set of examples:

  Example:
``` sql
SELECT example(s1, 'key1'='value1', 'key2'='value2'), example(*, 'key3'='value3') FROM root.sg.d1;
SELECT example(s1, s2, 'key1'='value1', 'key2'='value2') FROM root.sg.d1;
```

#### 4. Nested Queries

  Example:
``` sql
SELECT s1, s2, example(s1, s2) FROM root.sg.d1;
SELECT *, example(*) FROM root.sg.d1 DISABLE ALIGN;
SELECT s1 * example(* / s1 + s2) FROM root.sg.d1;
SELECT s1, s2, s1 + example(s1, s2), s1 - example(s1 + example(s1, s2) / s2) FROM root.sg.d1;
```

## 2. UDF Development 

You can refer to UDF development：[Development Guide](./UDF-development.md)

## 3. UDF management

###  3.1 UDF Registration

The process of registering a UDF in IoTDB is as follows:

1. Implement a complete UDF class, assuming the full class name of this class is `org.apache.iotdb.udf.ExampleUDTF`.
2. Convert the project into a JAR package. If using Maven to manage the project, you can refer to the [Maven project example](https://github.com/apache/iotdb/tree/master/example/udf) above.
3. Make preparations for registration according to the registration mode. For details, see the following example.
4. You can use following SQL to register UDF.

```sql
CREATE FUNCTION <UDF-NAME> AS <UDF-CLASS-FULL-PATHNAME> (USING URI URI-STRING)
```

####  Example: register UDF named `example`, you can choose either of the following two registration methods

####  Method 1: Manually place the jar package

Prepare:   
When registering using this method, it is necessary to place the JAR package in advance in the `ext/udf` directory of all nodes in the cluster (which can be configured).

Registration statement:

```sql
CREATE FUNCTION example AS 'org.apache.iotdb.udf.UDTFExample'
```

####  Method 2: Cluster automatically installs jar packages through URI

Prepare:   
When registering using this method, it is necessary to upload the JAR package to the URI server in advance and ensure that the IoTDB instance executing the registration statement can access the URI server.

Registration statement:

```sql
CREATE FUNCTION example AS 'org.apache.iotdb.udf.UDTFExample' USING URI 'http://jar/example.jar'
```

IoTDB will download JAR packages and synchronize them to the entire cluster.

####  Note

1. Since UDF instances are dynamically loaded through reflection technology, you do not need to restart the server during the UDF registration process.

2. UDF function names are not case-sensitive.

3. Please ensure that the function name given to the UDF is different from all built-in function names. A UDF with the same name as a built-in function cannot be registered.

4. We recommend that you do not use classes that have the same class name but different function logic in different JAR packages. For example, in `UDF(UDAF/UDTF): udf1, udf2`, the JAR package of udf1 is `udf1.jar` and the JAR package of udf2 is `udf2.jar`. Assume that both JAR packages contain the `org.apache.iotdb.udf.ExampleUDTF` class. If you use two UDFs in the same SQL statement at the same time, the system will randomly load either of them and may cause inconsistency in UDF execution behavior.

###  3.2 UDF Deregistration

The SQL syntax is as follows:

```sql
DROP FUNCTION <UDF-NAME>
```

Example: Uninstall the UDF from the above example:

```sql
DROP FUNCTION example
```



###  3.3 Show All Registered UDFs

``` sql
SHOW FUNCTIONS
```

### 3.4 UDF configuration

- UDF configuration allows configuring the storage directory of UDF in `iotdb-system.properties`
 ``` Properties
# UDF lib dir

udf_lib_dir=ext/udf
```

- -When using custom functions, there is a message indicating insufficient memory. Change the following configuration parameters in `iotdb-system.properties` and restart the service.

 ``` Properties

# Used to estimate the memory usage of text fields in a UDF query.
# It is recommended to set this value to be slightly larger than the average length of all text
# effectiveMode: restart
# Datatype: int
udf_initial_byte_array_length_for_memory_control=48

# How much memory may be used in ONE UDF query (in MB).
# The upper limit is 20% of allocated memory for read.
# effectiveMode: restart
# Datatype: float
udf_memory_budget_in_mb=30.0

# UDF memory allocation ratio.
# The parameter form is a:b:c, where a, b, and c are integers.
# effectiveMode: restart
udf_reader_transformer_collector_memory_proportion=1:1:1
```

###  3.5 UDF User Permissions


When users use UDF, they will be involved in the `USE_UDF` permission, and only users with this permission are allowed to perform UDF registration, uninstallation, and query operations.

For more user permissions related content, please refer to [Account Management Statements](./Authority-Management.md).


## 4. UDF Libraries

Based on the ability of user-defined functions, IoTDB provides a series of functions for temporal data processing, including data quality, data profiling, anomaly detection, frequency domain analysis, data matching, data repairing, sequence discovery, machine learning, etc., which can meet the needs of industrial fields for temporal data processing.

You can refer to the [UDF Libraries](../SQL-Manual/UDF-Libraries_timecho.md)document to find the installation steps and registration statements for each function, to ensure that all required functions are registered correctly.


##  5. Common problem:

Q1: How to modify the registered UDF? 

A1: Assume that the name of the UDF is `example` and the full class name is `org.apache.iotdb.udf.ExampleUDTF`, which is introduced by `example.jar`.

1. Unload the registered function by executing `DROP FUNCTION example`.
2. Delete `example.jar` under `iotdb-server-1.0.0-all-bin/ext/udf`.
3. Modify the logic in `org.apache.iotdb.udf.ExampleUDTF` and repackage it. The name of the JAR package can still be `example.jar`.
4. Upload the new JAR package to `iotdb-server-1.0.0-all-bin/ext/udf`.
5. Load the new UDF by executing `CREATE FUNCTION example AS "org.apache.iotdb.udf.ExampleUDTF"`.

