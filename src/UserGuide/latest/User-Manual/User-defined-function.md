#  USER-DEFINED FUNCTION (UDF)

## UDF Introduction

UDF (User Defined Function) refers to user-defined functions. IoTDB provides a variety of built-in time series processing functions and also supports extending custom functions to meet more computing needs.

## UDF usage method

###  UDF Types

In IoTDB, you can expand two types of UDF:

| UDF Class                                            | Description                                                          |
| --------------------------------------------------- | ------------------------------------------------------------ |
| UDTF（User Defined Timeseries Generating Function） | This type of function can take **multiple** time series as input, and output **one** time series, which can have any number of data points. |
| UDAF（User Defined Aggregation Function）           | Custom Aggregation Functions.  This type of function can take **multiple** time series as input, and output **one** aggregated data point for each group based on the GROUP BY type. |

UDF Function Development: [Development guidance](../Reference/UDF-development.md)

###  UDF Registration

The process of registering a UDF in IoTDB is as follows:

1. Implement a complete UDF class, assuming the full class name of this class is `org.apache.iotdb.udf.ExampleUDTF`.
2. Convert the project into a JAR package. If using Maven to manage the project, you can refer to the [Maven project example](https://github.com/apache/iotdb/tree/master/example/udf) above.
3. Make preparations for registration according to the registration mode. For details, see the following example.
4. You can use following SQL to register UDF.

```sql
CREATE FUNCTION <UDF-NAME> AS <UDF-CLASS-FULL-PATHNAME> (USING URI URI-STRING)
```

####  Example: register UDF named `example`, you can choose either of the following two registration methods

####  Method 1: Do not specify URI

Prepare:  
When registering using this method, it is necessary to place the JAR package in advance in the directory `iotdb-server-1.0.0-all-bin/ext/udf`（directory can config）.  
**Note that if using a cluster, the JAR package needs to be placed in that directory on all DataNodes**

Registration statement:

```sql
CREATE FUNCTION example AS 'org.apache.iotdb.udf.UDTFExample'
```

####  Method 2: Specify URI

Prepare:  
When registering using this method, it is necessary to upload the JAR package to the URI server in advance and ensure that the IoTDB instance executing the registration statement can access the URI server.
**Note that there is no need to manually place the JAR package. IoTDB will download the JAR package and synchronize it correctly to the entire cluster.**

Registration statement:

```sql
CREATE FUNCTION example AS 'org.apache.iotdb.udf.UDTFExample' USING URI 'http://jar/example.jar'
```

####  Note

1. Since UDF instances are dynamically loaded through reflection technology, you do not need to restart the server during the UDF registration process.

2. UDF function names are not case-sensitive.

3. Please ensure that the function name given to the UDF is different from all built-in function names. A UDF with the same name as a built-in function cannot be registered.

4. We recommend that you do not use classes that have the same class name but different function logic in different JAR packages. For example, in `UDF(UDAF/UDTF): udf1, udf2`, the JAR package of udf1 is `udf1.jar` and the JAR package of udf2 is `udf2.jar`. Assume that both JAR packages contain the `org.apache.iotdb.udf.ExampleUDTF` class. If you use two UDFs in the same SQL statement at the same time, the system will randomly load either of them and may cause inconsistency in UDF execution behavior.

###  UDF Deregistration

The SQL syntax is as follows:

```sql
DROP FUNCTION <UDF-NAME>
```

Example: Uninstall the UDF from the above example:

```sql
DROP FUNCTION example
```

###  UDF Queries

The usage of UDF is similar to that of built-in aggregation functions.

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

###  Show All Registered UDFs

``` sql
SHOW FUNCTIONS
```

###  User Permission Management


There are 1 types of user permissions related to UDF: `USE_UDF`

* Only users with this permission are allowed to register UDFs
* Only users with this permission are allowed to deregister UDFs
* Only users with this permission are allowed to use UDFs for queries

For more user permissions related content, please refer to [Account Management Statements](./Authority-Management.md).


### Configurable Properties

You can use `udf_lib_dir` to config udf lib directory.  
When querying by a UDF, IoTDB may prompt that there is insufficient memory. You can resolve the issue by configuring `udf_initial_byte_array_length_for_memory_control`, `udf_memory_budget_in_mb` and `udf_reader_transformer_collector_memory_proportion` in `iotdb-datanode.properties` and restarting the server.

###  Configurable Properties

You can use `udf_lib_dir` to config udf lib directory.  
When querying by a UDF, IoTDB may prompt that there is insufficient memory. You can resolve the issue by configuring `udf_initial_byte_array_length_for_memory_control`, `udf_memory_budget_in_mb` and `udf_reader_transformer_collector_memory_proportion` in `iotdb-datanode.properties` and restarting the server.


###  Contribute UDF

This part mainly introduces how external users can contribute their own UDFs to the IoTDB community.

####  Prerequisites

1. UDFs must be universal.

    The "universal" mentioned here refers to: UDFs can be widely used in some scenarios. In other words, the UDF function must have reuse value and may be directly used by other users in the community.

    If you are not sure whether the UDF you want to contribute is universal, you can send an email to `dev@iotdb.apache.org` or create an issue to initiate a discussion.

2. The UDF you are going to contribute has been well tested and can run normally in the production environment.


####  What you need to prepare

1. UDF source code
2. Test cases
3. Instructions

####  UDF Source Code

1. Create the UDF main class and related classes in `iotdb-core/node-commons/src/main/java/org/apache/iotdb/commons/udf/builtin` or in its subfolders.
2. Register your UDF in `iotdb-core/node-commons/src/main/java/org/apache/iotdb/commons/udf/builtin/BuiltinTimeSeriesGeneratingFunction.java`.

####  Test Cases

At a minimum, you need to write integration tests for the UDF.

You can add a test class in `integration-test/src/test/java/org/apache/iotdb/db/it/udf`. 


####  Instructions

The instructions need to include: the name and the function of the UDF, the attribute parameters that must be provided when the UDF is executed, the applicable scenarios, and the usage examples, etc.

The instructions for use should include both Chinese and English versions. Instructions for use should be added separately in `docs/zh/UserGuide/Operation Manual/DML Data Manipulation Language.md` and `docs/UserGuide/Operation Manual/DML Data Manipulation Language.md`.

####  Submit a PR

When you have prepared the UDF source code, test cases, and instructions, you are ready to submit a Pull Request (PR) on [Github](https://github.com/apache/iotdb). You can refer to our code contribution guide to submit a PR: [Development Guide](https://iotdb.apache.org/Community/Development-Guide.html).


After the PR review is approved and merged, your UDF has already contributed to the IoTDB community!

## UDF Libraries

You can refer to the [UDF Libraries](../Reference/UDF-Libraries.md)document to find the installation steps and registration statements for each function, to ensure that all required functions are registered correctly.

## UDF Development process

You can refer to UDF development：[Development Guide](../Reference/UDF-development.md)

##  Common problem:

Q1: How to modify the registered UDF? 

A1: Assume that the name of the UDF is `example` and the full class name is `org.apache.iotdb.udf.ExampleUDTF`, which is introduced by `example.jar`.

1. Unload the registered function by executing `DROP FUNCTION example`.
2. Delete `example.jar` under `iotdb-server-1.0.0-all-bin/ext/udf`.
3. Modify the logic in `org.apache.iotdb.udf.ExampleUDTF` and repackage it. The name of the JAR package can still be `example.jar`.
4. Upload the new JAR package to `iotdb-server-1.0.0-all-bin/ext/udf`.
5. Load the new UDF by executing `CREATE FUNCTION example AS "org.apache.iotdb.udf.ExampleUDTF"`.

