#  UDF

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

## 2. UDF management

###  2.1 UDF Registration

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
When registering using this method, it is necessary to place the JAR package in advance in the `ext/udf` directory of **all nodes in the cluster** (which can be configured).

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

###  2.2 UDF Deregistration

The SQL syntax is as follows:

```sql
DROP FUNCTION <UDF-NAME>
```

Example: Uninstall the UDF from the above example:

```sql
DROP FUNCTION example
```



###  2.3 Show All Registered UDFs

``` sql
SHOW FUNCTIONS
```

### 2.4 UDF configuration

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

###  2.5 UDF User Permissions


When users use UDF, they will be involved in the `USE_UDF` permission, and only users with this permission are allowed to perform UDF registration, uninstallation, and query operations.

For more user permissions related content, please refer to [Account Management Statements](../User-Manual/Authority-Management.md).


## 3. UDF Libraries

Based on the ability of user-defined functions, IoTDB provides a series of functions for temporal data processing, including data quality, data profiling, anomaly detection, frequency domain analysis, data matching, data repairing, sequence discovery, machine learning, etc., which can meet the needs of industrial fields for temporal data processing.

You can refer to the [UDF Libraries](../SQL-Manual/UDF-Libraries_apache.md)document to find the installation steps and registration statements for each function, to ensure that all required functions are registered correctly.


## 4. UDF development

### 4.1 UDF Development Dependencies

If you use [Maven](http://search.maven.org/), you can search for the development dependencies listed below from the [Maven repository](http://search.maven.org/) . Please note that you must select the same dependency version as the target IoTDB server version for development.

``` xml
<dependency>
  <groupId>org.apache.iotdb</groupId>
  <artifactId>udf-api</artifactId>
  <version>1.0.0</version>
  <scope>provided</scope>
</dependency>
```

### 4.2 UDTF（User Defined Timeseries Generating Function）

To write a UDTF,  you need to inherit the `org.apache.iotdb.udf.api.UDTF` class, and at least implement the `beforeStart` method and a `transform` method.

#### Interface Description:

| Interface definition                                         | Description                                                  | Required to Implement                                 |
| :----------------------------------------------------------- | :----------------------------------------------------------- | ----------------------------------------------------- |
| void validate(UDFParameterValidator validator) throws Exception | This method is mainly used to validate `UDFParameters` and it is executed before `beforeStart(UDFParameters, UDTFConfigurations)` is called. | Optional                                              |
| void beforeStart(UDFParameters parameters, UDTFConfigurations configurations) throws Exception | The initialization method to call the user-defined initialization behavior before a UDTF processes the input data. Every time a user executes a UDTF query, the framework will construct a new UDF instance, and `beforeStart` will be called. | Required                                              |
| Object transform(Row row) throws Exception                 | This method is called by the framework. This data processing method will be called when you choose to use the `MappableRowByRowAccessStrategy` strategy (set in `beforeStart`) to consume raw data. Input data is passed in by `Row`, and the transformation result should be returned. | Required to implement at least one `transform` method |
| void transform(Column[] columns, ColumnBuilder builder) throws Exception | This method is called by the framework. This data processing method will be called when you choose to use the `MappableRowByRowAccessStrategy` strategy (set in `beforeStart`) to consume raw data. Input data is passed in by `Column[]`, and the transformation result should be output by `ColumnBuilder`. You need to call the data collection method provided by `builder`  to determine the output data. | Required to implement at least one `transform` method |
| void transform(Row row, PointCollector collector) throws Exception | This method is called by the framework. This data processing method will be called when you choose to use the `RowByRowAccessStrategy` strategy (set in `beforeStart`) to consume raw data. Input data is passed in by `Row`, and the transformation result should be output by `PointCollector`. You need to call the data collection method provided by `collector`  to determine the output data. | Required to implement at least one `transform` method |
| void transform(RowWindow rowWindow, PointCollector collector) throws Exception | This method is called by the framework. This data processing method will be called when you choose to use the `SlidingSizeWindowAccessStrategy` or `SlidingTimeWindowAccessStrategy` strategy (set in `beforeStart`) to consume raw data. Input data is passed in by `RowWindow`, and the transformation result should be output by `PointCollector`. You need to call the data collection method provided by `collector`  to determine the output data. | Required to implement at least one `transform` method |
| void terminate(PointCollector collector) throws Exception  | This method is called by the framework. This method will be called once after all `transform` calls have been executed. In a single UDF query, this method will and will only be called once. You need to call the data collection method provided by `collector`  to determine the output data. | Optional                                              |
| void beforeDestroy()                                       | This method is called by the framework after the last input data is processed, and will only be called once in the life cycle of each UDF instance. | Optional                                              |

In the life cycle of a UDTF instance, the calling sequence of each method is as follows:

1. void validate(UDFParameterValidator validator) throws Exception
2. void beforeStart(UDFParameters parameters, UDTFConfigurations configurations) throws Exception
3. `Object transform(Row row) throws Exception` or `void transform(Column[] columns, ColumnBuilder builder) throws Exception` or `void transform(Row row, PointCollector collector) throws Exception` or `void transform(RowWindow rowWindow, PointCollector collector) throws Exception`
4. void terminate(PointCollector collector) throws Exception
5. void beforeDestroy() 

> Note that every time the framework executes a UDTF query, a new UDF instance will be constructed. When the query ends, the corresponding instance will be destroyed. Therefore, the internal data of the instances in different UDTF queries (even in the same SQL statement) are isolated. You can maintain some state data in the UDTF without considering the influence of concurrency and other factors.

#### Detailed interface introduction:

1. **void validate(UDFParameterValidator validator) throws Exception**

The `validate` method is used to validate the parameters entered by the user.

In this method, you can limit the number and types of input time series, check the attributes of user input, or perform any custom verification.

Please refer to the [Javadoc](https://github.com/apache/iotdb/blob/rc/2.0.4/iotdb-api/udf-api/src/main/java/org/apache/iotdb/udf/api/customizer/parameter/UDFParameterValidator.java) for the usage of `UDFParameterValidator`.


2. **void beforeStart(UDFParameters parameters, UDTFConfigurations configurations) throws Exception**

This method is mainly used to customize UDTF. In this method, the user can do the following things:

1. Use UDFParameters to get the time series paths and parse key-value pair attributes entered by the user.
2. Set the strategy to access the raw data and set the output data type in UDTFConfigurations.
3. Create resources, such as establishing external connections, opening files, etc.


2.1  **UDFParameters**

`UDFParameters` is used to parse UDF parameters in SQL statements (the part in parentheses after the UDF function name in SQL). The input parameters have two parts. The first part is data types of the time series that the UDF needs to process, and the second part is the key-value pair attributes for customization. Only the second part can be empty.


Example：

``` sql
SELECT UDF(s1, s2, 'key1'='iotdb', 'key2'='123.45') FROM root.sg.d;
```

Usage：

``` java
void beforeStart(UDFParameters parameters, UDTFConfigurations configurations) throws Exception {
  String stringValue = parameters.getString("key1"); // iotdb
  Float floatValue = parameters.getFloat("key2"); // 123.45
  Double doubleValue = parameters.getDouble("key3"); // null
  int intValue = parameters.getIntOrDefault("key4", 678); // 678
  // do something
  
  // configurations
  // ...
}
```


2.2  **UDTFConfigurations**

You must use `UDTFConfigurations` to specify the strategy used by UDF to access raw data and the type of output sequence.

Usage：

``` java
void beforeStart(UDFParameters parameters, UDTFConfigurations configurations) throws Exception {
  // parameters
  // ...
  
  // configurations
  configurations
    .setAccessStrategy(new RowByRowAccessStrategy())
    .setOutputDataType(Type.INT32);
}
```

The `setAccessStrategy` method is used to set the UDF's strategy for accessing the raw data, and the `setOutputDataType` method is used to set the data type of the output sequence.

 2.2.1  **setAccessStrategy**


Note that the raw data access strategy you set here determines which `transform` method the framework will call. Please implement the `transform` method corresponding to the raw data access strategy. Of course, you can also dynamically decide which strategy to set based on the attribute parameters parsed by `UDFParameters`. Therefore, two `transform` methods are also allowed to be implemented in one UDF.

The following are the strategies you can set:

| Interface definition              | Description                                                  | The `transform` Method to Call                               |
| :-------------------------------- | :----------------------------------------------------------- | ------------------------------------------------------------ |
| MappableRowByRowStrategy                 | Custom scalar function<br>The framework will call the `transform` method once for each row of raw data input, with k columns of time series and 1 row of data input, and 1 column of time series and 1 row of data output. It can be used in any clause and expression where scalar functions appear, such as select clauses, where clauses, etc. | void transform(Column[] columns, ColumnBuilder builder) throws ExceptionObject transform(Row row) throws Exception |
| RowByRowAccessStrategy          | Customize time series generation function to process raw data line by line.<br>The framework will call the `transform` method once for each row of raw data input, inputting k columns of time series and 1 row of data, and outputting 1 column of time series and n rows of data.<br> When a sequence is input, the row serves as a data point for the input sequence.<br> When multiple sequences are input, after aligning the input sequences in time, each row serves as a data point for the input sequence.<br>（In a row of data, there may be a column with a `null` value, but not all columns are `null`） | void transform(Row row, PointCollector collector) throws Exception |
| SlidingTimeWindowAccessStrategy | Customize time series generation functions to process raw data in a sliding time window manner.<br>The framework will call the `transform` method once for each raw data input window, input k columns of time series m rows of data, and output 1 column of time series n rows of data.<br>A window may contain multiple rows of data, and after aligning the input sequence in time, each window serves as a data point for the input sequence. <br>(Each window may have i rows, and each row of data may have a column with a `null` value, but not all of them are `null`) | void transform(RowWindow rowWindow, PointCollector collector) throws Exception |
| SlidingSizeWindowAccessStrategy | Customize the time series generation function to process raw data in a fixed number of rows, meaning that each data processing window will contain a fixed number of rows of data (except for the last window).<br>The framework will call the `transform` method once for each raw data input window, input k columns of time series m rows of data, and output 1 column of time series n rows of data.<br>A window may contain multiple rows of data, and after aligning the input sequence in time, each window serves as a data point for the input sequence. <br>(Each window may have i rows, and each row of data may have a column with a `null` value, but not all of them are `null`) | void transform(RowWindow rowWindow, PointCollector collector) throws Exception |
| SessionTimeWindowAccessStrategy | Customize time series generation functions to process raw data in a session window format.<br>The framework will call the `transform` method once for each raw data input window, input k columns of time series m rows of data, and output 1 column of time series n rows of data.<br>A window may contain multiple rows of data, and after aligning the input sequence in time, each window serves as a data point for the input sequence.<br> (Each window may have i rows, and each row of data may have a column with a `null` value, but not all of them are `null`) | void transform(RowWindow rowWindow, PointCollector collector) throws Exception |
| StateWindowAccessStrategy       | Customize time series generation functions to process raw data in a state window format.<br>he framework will call the `transform` method once for each raw data input window, inputting 1 column of time series m rows of data and outputting 1 column of time series n rows of data.<br>A window may contain multiple rows of data, and currently only supports opening windows for one physical quantity, which is one column of data. | void transform(RowWindow rowWindow, PointCollector collector) throws Exception |


#### Interface Description:

- `MappableRowByRowStrategy` and `RowByRowAccessStrategy`: The construction of `RowByRowAccessStrategy` does not require any parameters.

- `SlidingTimeWindowAccessStrategy`

Window opening diagram:

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/UserGuide/Process-Data/UDF-User-Defined-Function/timeWindow.png">

`SlidingTimeWindowAccessStrategy`: `SlidingTimeWindowAccessStrategy` has many constructors, you can pass 3 types of parameters to them:

- Parameter 1: The display window on the time axis

The first type of parameters are optional. If the parameters are not provided, the beginning time of the display window will be set to the same as the minimum timestamp of the query result set, and the ending time of the display window will be set to the same as the maximum timestamp of the query result set.

- Parameter 2: Time interval for dividing the time axis (should be positive)
- Parameter 3: Time sliding step (not required to be greater than or equal to the time interval, but must be a positive number)

The sliding step parameter is also optional. If the parameter is not provided, the sliding step will be set to the same as the time interval for dividing the time axis.

The relationship between the three types of parameters can be seen in the figure below. Please see the [Javadoc](https://github.com/apache/iotdb/blob/rc/2.0.4/iotdb-api/udf-api/src/main/java/org/apache/iotdb/udf/api/customizer/strategy/SlidingTimeWindowAccessStrategy.java) for more details.

<div style="text-align: center;"><img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/github/99787878-47b51480-2b5b-11eb-8ed3-84088c5c30f7.png"></div>

> Note that the actual time interval of some of the last time windows may be less than the specified time interval parameter. In addition, there may be cases where the number of data rows in some time windows is 0. In these cases, the framework will also call the `transform` method for the empty windows.

- `SlidingSizeWindowAccessStrategy`

Window opening diagram:

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/UserGuide/Process-Data/UDF-User-Defined-Function/countWindow.png">

`SlidingSizeWindowAccessStrategy`:  `SlidingSizeWindowAccessStrategy` has many constructors, you can pass 2 types of parameters to them:

* Parameter 1: Window size. This parameter specifies the number of data rows contained in a data processing window. Note that the number of data rows in some of the last time windows may be less than the specified number of data rows.
* Parameter 2: Sliding step. This parameter means the number of rows between the first point of the next window and the first point of the current window. (This parameter is not required to be greater than or equal to the window size, but must be a positive number)

The sliding step parameter is optional. If the parameter is not provided, the sliding step will be set to the same as the window size.

- `SessionTimeWindowAccessStrategy`

Window opening diagram: **Time intervals less than or equal to the given minimum time interval `sessionGap` are assigned in one group.**

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/UserGuide/Process-Data/UDF-User-Defined-Function/sessionWindow.png">

`SessionTimeWindowAccessStrategy`: `SessionTimeWindowAccessStrategy` has many constructors, you can pass 2 types of parameters to them:

- Parameter 1: The display window on the time axis.
- Parameter 2: The minimum time interval `sessionGap` of two adjacent windows.

- `StateWindowAccessStrategy`

Window opening diagram: **For numerical data, if the state difference is less than or equal to the given threshold `delta`, it will be assigned in one group.**

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/UserGuide/Process-Data/UDF-User-Defined-Function/stateWindow.png">

`StateWindowAccessStrategy` has four constructors.

- Constructor 1: For numerical data, there are 3 parameters: the time axis can display the start and end time of the time window and the threshold `delta` for the allowable change within a single window.
- Constructor 2: For text data and boolean data, there are 3 parameters: the time axis can be provided to display the start and end time of the time window. For both data types, the data within a single window is same, and there is no need to provide an allowable change threshold.
- Constructor 3: For numerical data, there are 1 parameters: you can only provide the threshold delta that is allowed to change within a single window. The start time of the time axis display time window will be defined as the smallest timestamp in the entire query result set, and the time axis display time window end time will be defined as The largest timestamp in the entire query result set.
- Constructor 4: For text data and boolean data, you can provide no parameter. The start and end timestamps are explained in Constructor 3.

StateWindowAccessStrategy can only take one column as input for now.

Please see the [Javadoc](https://github.com/apache/iotdb/blob/rc/2.0.4/iotdb-api/udf-api/src/main/java/org/apache/iotdb/udf/api/customizer/strategy/StateWindowAccessStrategy.java) for more details.

 2.2.2  **setOutputDataType**

Note that the type of output sequence you set here determines the type of data that the `PointCollector` can actually receive in the `transform` method. The relationship between the output data type set in `setOutputDataType` and the actual data output type that `PointCollector` can receive is as follows:

| Output Data Type Set in `setOutputDataType` | Data Type that `PointCollector` Can Receive                  |
| :------------------------------------------ | :----------------------------------------------------------- |
| INT32                                     | int                                                        |
| INT64                                     | long                                                       |
| FLOAT                                    | float                                                      |
| DOUBLE                                    | double                                                     |
| BOOLEAN                                   | boolean                                                    |
| TEXT                                      | java.lang.String and org.apache.iotdb.udf.api.type.Binar` |

The type of output time series of a UDTF is determined at runtime, which means that a UDTF can dynamically determine the type of output time series according to the type of input time series.
Here is a simple example:

```java
void beforeStart(UDFParameters parameters, UDTFConfigurations configurations) throws Exception {
  // do something
  // ...
  
  configurations
    .setAccessStrategy(new RowByRowAccessStrategy())
    .setOutputDataType(parameters.getDataType(0));
}
```

3. **Object transform(Row row) throws Exception**

You need to implement this method or `transform(Column[] columns, ColumnBuilder builder) throws Exception` when you specify the strategy of UDF to read the original data as `MappableRowByRowAccessStrategy`.

This method processes the raw data one row at a time. The raw data is input from `Row` and output by its return object. You must return only one object based on each input data point in a single `transform` method call, i.e., input and output are  one-to-one. It should be noted that the type of output data points must be the same as you set in the `beforeStart` method, and the timestamps of output data points must be strictly monotonically increasing.

The following is a complete UDF example that implements the `Object transform(Row row) throws Exception` method. It is an adder that receives two columns of time series as input. 

```java
import org.apache.iotdb.udf.api.UDTF;
import org.apache.iotdb.udf.api.access.Row;
import org.apache.iotdb.udf.api.customizer.config.UDTFConfigurations;
import org.apache.iotdb.udf.api.customizer.parameter.UDFParameterValidator;
import org.apache.iotdb.udf.api.customizer.parameter.UDFParameters;
import org.apache.iotdb.udf.api.customizer.strategy.MappableRowByRowAccessStrategy;
import org.apache.iotdb.udf.api.type.Type;

public class Adder implements UDTF {
  private Type dataType;

  @Override
  public void validate(UDFParameterValidator validator) throws Exception {
    validator
        .validateInputSeriesNumber(2)
        .validateInputSeriesDataType(0, Type.INT64)
        .validateInputSeriesDataType(1, Type.INT64);
  }

  @Override
  public void beforeStart(UDFParameters parameters, UDTFConfigurations configurations) {
    dataType = parameters.getDataType(0);
    configurations
        .setAccessStrategy(new MappableRowByRowAccessStrategy())
        .setOutputDataType(dataType);
  }

  @Override
  public Object transform(Row row) throws Exception {
		return row.getLong(0) + row.getLong(1);
  }
}
```



4. **void transform(Column[] columns, ColumnBuilder builder) throws Exception**

You need to implement this method or `Object transform(Row row) throws Exception` when you specify the strategy of UDF to read the original data as `MappableRowByRowAccessStrategy`.

This method processes the raw data multiple rows at a time. After performance tests, we found that UDTF that process multiple rows at once perform better than those UDTF that process one data point at a time. The raw data is input from `Column[]` and output by `ColumnBuilder`. You must output a corresponding data point based on each input data point in a single `transform` method call, i.e., input and output are still one-to-one. It should be noted that the type of output data points must be the same as you set in the `beforeStart` method, and the timestamps of output data points must be strictly monotonically increasing.

The following is a complete UDF example that implements the `void transform(Column[] columns, ColumnBuilder builder) throws Exception` method. It is an adder that receives two columns of time series as input. 

```java
import org.apache.iotdb.tsfile.read.common.block.column.Column;
import org.apache.iotdb.tsfile.read.common.block.column.ColumnBuilder;
import org.apache.iotdb.udf.api.UDTF;
import org.apache.iotdb.udf.api.customizer.config.UDTFConfigurations;
import org.apache.iotdb.udf.api.customizer.parameter.UDFParameterValidator;
import org.apache.iotdb.udf.api.customizer.parameter.UDFParameters;
import org.apache.iotdb.udf.api.customizer.strategy.MappableRowByRowAccessStrategy;
import org.apache.iotdb.udf.api.type.Type;

public class Adder implements UDTF {
  private Type type;

  @Override
  public void validate(UDFParameterValidator validator) throws Exception {
    validator
        .validateInputSeriesNumber(2)
        .validateInputSeriesDataType(0, Type.INT64)
        .validateInputSeriesDataType(1, Type.INT64);
  }

  @Override
  public void beforeStart(UDFParameters parameters, UDTFConfigurations configurations) {
    type = parameters.getDataType(0);
    configurations.setAccessStrategy(new MappableRowByRowAccessStrategy()).setOutputDataType(type);
  }

  @Override
  public void transform(Column[] columns, ColumnBuilder builder) throws Exception {
    long[] inputs1 = columns[0].getLongs();
    long[] inputs2 = columns[1].getLongs();

    int count = columns[0].getPositionCount();
    for (int i = 0; i < count; i++) {
      builder.writeLong(inputs1[i] + inputs2[i]);
    }
  }
}
```

5. **void transform(Row row, PointCollector collector) throws Exception**

You need to implement this method when you specify the strategy of UDF to read the original data as `RowByRowAccessStrategy`.

This method processes the raw data one row at a time. The raw data is input from `Row` and output by `PointCollector`. You can output any number of data points in one `transform` method call. It should be noted that the type of output data points must be the same as you set in the `beforeStart` method, and the timestamps of output data points must be strictly monotonically increasing.

The following is a complete UDF example that implements the `void transform(Row row, PointCollector collector) throws Exception` method. It is an adder that receives two columns of time series as input. When two data points in a row are not `null`, this UDF will output the algebraic sum of these two data points.

``` java
import org.apache.iotdb.udf.api.UDTF;
import org.apache.iotdb.udf.api.access.Row;
import org.apache.iotdb.udf.api.collector.PointCollector;
import org.apache.iotdb.udf.api.customizer.config.UDTFConfigurations;
import org.apache.iotdb.udf.api.customizer.parameter.UDFParameters;
import org.apache.iotdb.udf.api.customizer.strategy.RowByRowAccessStrategy;
import org.apache.iotdb.udf.api.type.Type;

public class Adder implements UDTF {

  @Override
  public void beforeStart(UDFParameters parameters, UDTFConfigurations configurations) {
    configurations
        .setOutputDataType(TSDataType.INT64)
        .setAccessStrategy(new RowByRowAccessStrategy());
  }

  @Override
  public void transform(Row row, PointCollector collector) throws Exception {
    if (row.isNull(0) || row.isNull(1)) {
      return;
    }
    collector.putLong(row.getTime(), row.getLong(0) + row.getLong(1));
  }
}
```

6. **void transform(RowWindow rowWindow, PointCollector collector) throws Exception**

You need to implement this method when you specify the strategy of UDF to read the original data as `SlidingTimeWindowAccessStrategy` or `SlidingSizeWindowAccessStrategy`.

This method processes a batch of data in a fixed number of rows or a fixed time interval each time, and we call the container containing this batch of data a window. The raw data is input from `RowWindow` and output by `PointCollector`. `RowWindow` can help you access a batch of `Row`, it provides a set of interfaces for random access and iterative access to this batch of `Row`. You can output any number of data points in one `transform` method call. It should be noted that the type of output data points must be the same as you set in the `beforeStart` method, and the timestamps of output data points must be strictly monotonically increasing.

Below is a complete UDF example that implements the `void transform(RowWindow rowWindow, PointCollector collector) throws Exception` method. It is a counter that receives any number of time series as input, and its function is to count and output the number of data rows in each time window within a specified time range.

```java
import java.io.IOException;
import org.apache.iotdb.udf.api.UDTF;
import org.apache.iotdb.udf.api.access.Row;
import org.apache.iotdb.udf.api.access.RowWindow;
import org.apache.iotdb.udf.api.collector.PointCollector;
import org.apache.iotdb.udf.api.customizer.config.UDTFConfigurations;
import org.apache.iotdb.udf.api.customizer.parameter.UDFParameters;
import org.apache.iotdb.udf.api.customizer.strategy.SlidingTimeWindowAccessStrategy;
import org.apache.iotdb.udf.api.type.Type;

public class Counter implements UDTF {

  @Override
  public void beforeStart(UDFParameters parameters, UDTFConfigurations configurations) {
    configurations
        .setOutputDataType(TSDataType.INT32)
        .setAccessStrategy(new SlidingTimeWindowAccessStrategy(
            parameters.getLong("time_interval"),
            parameters.getLong("sliding_step"),
            parameters.getLong("display_window_begin"),
            parameters.getLong("display_window_end")));
  }

  @Override
  public void transform(RowWindow rowWindow, PointCollector collector) {
    if (rowWindow.windowSize() != 0) {
      collector.putInt(rowWindow.windowStartTime(), rowWindow.windowSize());
    }
  }
}
```

7. **void terminate(PointCollector collector) throws Exception**

In some scenarios, a UDF needs to traverse all the original data to calculate the final output data points. The `terminate` interface provides support for those scenarios.

This method is called after all `transform` calls are executed and before the `beforeDestory` method is executed. You can implement the `transform` method to perform pure data processing (without outputting any data points), and implement the  `terminate` method to output the processing results.

The processing results need to be output by the  `PointCollector`. You can output any number of data points in one `terminate` method call. It should be noted that the type of output data points must be the same as you set in the `beforeStart` method, and the timestamps of output data points must be strictly monotonically increasing.

Below is a complete UDF example that implements the `void terminate(PointCollector collector) throws Exception` method. It takes one time series whose data type is `INT32` as input, and outputs the maximum value point of the series.

```java
import java.io.IOException;
import org.apache.iotdb.udf.api.UDTF;
import org.apache.iotdb.udf.api.access.Row;
import org.apache.iotdb.udf.api.collector.PointCollector;
import org.apache.iotdb.udf.api.customizer.config.UDTFConfigurations;
import org.apache.iotdb.udf.api.customizer.parameter.UDFParameters;
import org.apache.iotdb.udf.api.customizer.strategy.RowByRowAccessStrategy;
import org.apache.iotdb.udf.api.type.Type;

public class Max implements UDTF {

  private Long time;
  private int value;

  @Override
  public void beforeStart(UDFParameters parameters, UDTFConfigurations configurations) {
    configurations
        .setOutputDataType(TSDataType.INT32)
        .setAccessStrategy(new RowByRowAccessStrategy());
  }

  @Override
  public void transform(Row row, PointCollector collector) {
    if (row.isNull(0)) {
      return;
    }
    int candidateValue = row.getInt(0);
    if (time == null || value < candidateValue) {
      time = row.getTime();
      value = candidateValue;
    }
  }

  @Override
  public void terminate(PointCollector collector) throws IOException {
    if (time != null) {
      collector.putInt(time, value);
    }
  }
}
```

8. **void beforeDestroy()**

The method for terminating a UDF.

This method is called by the framework. For a UDF instance, `beforeDestroy` will be called after the last record is processed. In the entire life cycle of the instance, `beforeDestroy` will only be called once.



### 4.3 UDAF (User Defined Aggregation Function)

A complete definition of UDAF involves two classes, `State` and `UDAF`.

#### State Class

To write your own `State`, you need to implement the `org.apache.iotdb.udf.api.State` interface.

#### Interface Description:

| Interface Definition             | Description                                                  | Required to Implement |
| -------------------------------- | ------------------------------------------------------------ | --------------------- |
| void reset()                   | To reset the `State` object to its initial state, you need to fill in the initial values of the fields in the `State` class within this method as if you were writing a constructor. | Required              |
| byte[] serialize()             | Serializes `State` to binary data. This method is used for IoTDB internal `State` passing. Note that the order of serialization must be consistent with the following deserialization methods. | Required              |
| void deserialize(byte[] bytes) | Deserializes binary data to `State`. This method is used for IoTDB internal  `State` passing. Note that the order of deserialization must be consistent with the serialization method above. | Required              |

#### Detailed interface introduction:

1. **void reset()**

This method resets the `State` to its initial state, you need to fill in the initial values of the fields in the `State` object in this method. For optimization reasons, IoTDB reuses `State` as much as possible internally, rather than creating a new `State` for each group, which would introduce unnecessary overhead. When `State` has finished updating the data in a group, this method is called to reset to the initial state as a way to process the next group.

In the case of `State` for averaging (aka `avg`), for example, you would need the sum of the data, `sum`, and the number of entries in the data, `count`, and initialize both to 0 in the `reset()` method.

```java
class AvgState implements State {
  double sum;

  long count;

  @Override
  public void reset() {
    sum = 0;
    count = 0;
  }
  
  // other methods
}
```

2. **byte[] serialize()/void deserialize(byte[] bytes)**

These methods serialize the `State` into binary data, and deserialize the `State` from the binary data. IoTDB, as a distributed database, involves passing data among different nodes, so you need to write these two methods to enable the passing of the State among different nodes. Note that the order of serialization and deserialization must be the consistent.

In the case of `State` for averaging (aka `avg`), for example, you can convert the content of State to `byte[]` array and read out the content of State from `byte[]` array in any way you want, the following shows the code for serialization/deserialization using `ByteBuffer` introduced by Java8:

```java
@Override
public byte[] serialize() {
  ByteBuffer buffer = ByteBuffer.allocate(Double.BYTES + Long.BYTES);
  buffer.putDouble(sum);
  buffer.putLong(count);

  return buffer.array();
}

@Override
public void deserialize(byte[] bytes) {
  ByteBuffer buffer = ByteBuffer.wrap(bytes);
  sum = buffer.getDouble();
  count = buffer.getLong();
}
```



#### UDAF Classes

To write a UDAF, you need to implement the `org.apache.iotdb.udf.api.UDAF` interface.

#### Interface Description:

| Interface definition                                         | Description                                                  | Required to Implement |
| ------------------------------------------------------------ | ------------------------------------------------------------ | --------------------- |
| void validate(UDFParameterValidator validator) throws Exception | This method is mainly used to validate `UDFParameters` and it is executed before `beforeStart(UDFParameters, UDTFConfigurations)` is called. | Optional              |
| void beforeStart(UDFParameters parameters, UDAFConfigurations configurations) throws Exception | Initialization method that invokes user-defined initialization behavior before UDAF processes the input data. Unlike UDTF, configuration is of type `UDAFConfiguration`. | Required              |
| State createState()                                        | To create a `State` object, usually just call the default constructor and modify the default initial value as needed. | Required              |
| void addInput(State state, Column[] columns, BitMap bitMap) | Update `State` object according to the incoming data `Column[]` in batch, note that last column `columns[columns.length - 1]` always represents the time column. In addition, `BitMap` represents the data that has been filtered out before, you need to manually determine whether the corresponding data has been filtered out when writing this method. | Required              |
| void combineState(State state, State rhs)                  | Merge `rhs` state into `state` state. In a distributed scenario, the same set of data may be distributed on different nodes, IoTDB generates a `State` object for the partial data on each node, and then calls this method to merge it into the complete `State`. | Required              |
| void outputFinal(State state, ResultValue resultValue)     | Computes the final aggregated result based on the data in `State`. Note that according to the semantics of the aggregation, only one value can be output per group. | Required              |
| void beforeDestroy()                                       | This method is called by the framework after the last input data is processed, and will only be called once in the life cycle of each UDF instance. | Optional              |

In the life cycle of a UDAF instance, the calling sequence of each method is as follows:

1. State createState()
2. void validate(UDFParameterValidator validator) throws Exception
3. void beforeStart(UDFParameters parameters, UDAFConfigurations configurations) throws Exception
4. void addInput(State state, Column[] columns, BitMap bitMap)
5. void combineState(State state, State rhs) 
6. void outputFinal(State state, ResultValue resultValue) 
7. void beforeDestroy()

Similar to UDTF, every time the framework executes a UDAF query, a new UDF instance will be constructed. When the query ends, the corresponding instance will be destroyed. Therefore, the internal data of the instances in different UDAF queries (even in the same SQL statement) are isolated. You can maintain some state data in the UDAF without considering the influence of concurrency and other factors.

#### Detailed interface introduction:


1. **void validate(UDFParameterValidator validator) throws Exception**

Same as UDTF, the `validate` method is used to validate the parameters entered by the user.

In this method, you can limit the number and types of input time series, check the attributes of user input, or perform any custom verification.

2. **void beforeStart(UDFParameters parameters, UDAFConfigurations configurations) throws Exception**

 The `beforeStart` method does the same thing as the UDAF:

1. Use UDFParameters to get the time series paths and parse key-value pair attributes entered by the user.
2. Set the strategy to access the raw data and set the output data type in UDAFConfigurations.
3. Create resources, such as establishing external connections, opening files, etc.

The role of the `UDFParameters` type can be seen above.

2.2  **UDTFConfigurations**

The difference from UDTF is that UDAF uses `UDAFConfigurations` as the type of `configuration` object.

Currently, this class only supports setting the type of output data.

```java
void beforeStart(UDFParameters parameters, UDAFConfigurations configurations) throws Exception {
  // parameters
  // ...

  // configurations
  configurations
    .setOutputDataType(Type.INT32); }
}
```

The relationship between the output type set in `setOutputDataType` and the type of data output that `ResultValue` can actually receive is as follows:

| The output type set in `setOutputDataType` | The output type that `ResultValue` can actually receive |
| ------------------------------------------ | ------------------------------------------------------- |
| INT32                                    | int                                                   |
| INT64                                   | long                                                  |
| FLOAT                                    | float                                                 |
| DOUBLE                                   | double                                                |
| BOOLEAN                                  | boolean                                               |
| TEXT                                    | org.apache.iotdb.udf.api.type.Binary                 |

The output type of the UDAF is determined at runtime. You can dynamically determine the output sequence type based on the input type.

Here is a simple example:

```java
void beforeStart(UDFParameters parameters, UDAFConfigurations configurations) throws Exception {
  // do something
  // ...
  
  configurations
    .setOutputDataType(parameters.getDataType(0));
}
```

3. **State createState()**


This method creates and initializes a `State` object for UDAF. Due to the limitations of the Java language, you can only call the default constructor for the `State` class. The default constructor assigns a default initial value to all the fields in the class, and if that initial value does not meet your requirements, you need to initialize them manually within this method.

The following is an example that includes manual initialization. Suppose you want to implement an aggregate function that multiply all numbers in the group, then your initial `State` value should be set to 1, but the default constructor initializes it to 0, so you need to initialize `State` manually after calling the default constructor:

```java
public State createState() {
  MultiplyState state = new MultiplyState();
  state.result = 1;
  return state;
}
```

4. **void addInput(State state, Column[] columns, BitMap bitMap)**

This method updates the `State` object with the raw input data. For performance reasons, also to align with the IoTDB vectorized query engine, the raw input data is no longer a data point, but an array of columns ``Column[]``. Note that the last column (i.e. `columns[columns.length - 1]`) is always the time column, so you can also do different operations in UDAF depending on the time.

Since the input parameter is not of a single data point type, but of multiple columns, you need to manually filter some of the data in the columns, which is why the third parameter, `BitMap`, exists. It identifies which of these columns have been filtered out, so you don't have to think about the filtered data in any case.

Here's an example of `addInput()` that counts the number of items (aka count). It shows how you can use `BitMap` to ignore data that has been filtered out. Note that due to the limitations of the Java language, you need to do the explicit cast the `State` object  from type defined in the interface to a custom `State` type at the beginning of the method, otherwise you won't be able to use the `State` object.

```java
public void addInput(State state, Column[] columns, BitMap bitMap) {
  CountState countState = (CountState) state;

  int count = columns[0].getPositionCount();
  for (int i = 0; i < count; i++) {
    if (bitMap != null && !bitMap.isMarked(i)) {
      continue;
    }
    if (!columns[0].isNull(i)) {
      countState.count++;
    }
  }
}
```

5. **void combineState(State state, State rhs)**


This method combines two `State`s, or more precisely, updates the first `State` object with the second `State` object. IoTDB is a distributed database, and the data of the same group may be distributed on different nodes. For performance reasons, IoTDB will first aggregate some of the data on each node into `State`, and then merge the `State`s on different nodes that belong to the same group, which is what `combineState` does.

Here's an example of `combineState()` for averaging (aka avg). Similar to `addInput`, you need to do an explicit type conversion for the two `State`s at the beginning. Also note that you are updating the value of the first `State` with the contents of the second `State`.

```java
public void combineState(State state, State rhs) {
  AvgState avgState = (AvgState) state;
  AvgState avgRhs = (AvgState) rhs;

  avgState.count += avgRhs.count;
  avgState.sum += avgRhs.sum;
}
```

6. **void outputFinal(State state, ResultValue resultValue)**

This method works by calculating the final result from `State`. You need to access the various fields in `State`, derive the final result, and set the final result into the `ResultValue` object.IoTDB internally calls this method once at the end for each group. Note that according to the semantics of aggregation, the final result can only be one value.

Here is another `outputFinal` example for averaging (aka avg). In addition to the forced type conversion at the beginning, you will also see a specific use of the `ResultValue` object, where the final result is set by `setXXX` (where `XXX` is the type name).

```java
public void outputFinal(State state, ResultValue resultValue) {
  AvgState avgState = (AvgState) state;

  if (avgState.count != 0) {
    resultValue.setDouble(avgState.sum / avgState.count);
  } else {
    resultValue.setNull();
  }
}
```

7. **void beforeDestroy()**


The method for terminating a UDF.

This method is called by the framework. For a UDF instance, `beforeDestroy` will be called after the last record is processed. In the entire life cycle of the instance, `beforeDestroy` will only be called once.


### 4.4 Maven Project Example

If you use Maven, you can build your own UDF project referring to our **udf-example** module. You can find the project [here](https://github.com/apache/iotdb/tree/master/example/udf).


## 5. Contribute universal built-in UDF functions to iotdb

This part mainly introduces how external users can contribute their own UDFs to the IoTDB community.

###  5.1 Prerequisites

1. UDFs must be universal.

    The "universal" mentioned here refers to: UDFs can be widely used in some scenarios. In other words, the UDF function must have reuse value and may be directly used by other users in the community.

    If you are not sure whether the UDF you want to contribute is universal, you can send an email to `dev@iotdb.apache.org` or create an issue to initiate a discussion.

2. The UDF you are going to contribute has been well tested and can run normally in the production environment.


###  5.2 What you need to prepare

1. UDF source code
2. Test cases
3. Instructions

###  5.3 Contribution Content

####  5.3.1 UDF Source Code

1. Create the UDF main class and related classes in `iotdb-core/node-commons/src/main/java/org/apache/iotdb/commons/udf/builtin` or in its subfolders.
2. Register your UDF in `iotdb-core/node-commons/src/main/java/org/apache/iotdb/commons/udf/builtin/BuiltinTimeSeriesGeneratingFunction.java`.

#### 5.3.2 Test Cases

At a minimum, you need to write integration tests for the UDF.

You can add a test class in `integration-test/src/test/java/org/apache/iotdb/db/it/udf`. 


####  5.3.3 Instructions

The instructions need to include: the name and the function of the UDF, the attribute parameters that must be provided when the UDF is executed, the applicable scenarios, and the usage examples, etc.

The instructions for use should include both Chinese and English versions. Instructions for use should be added separately in `docs/zh/UserGuide/Operation Manual/DML Data Manipulation Language.md` and `docs/UserGuide/Operation Manual/DML Data Manipulation Language.md`.

####  5.3.4 Submit a PR

When you have prepared the UDF source code, test cases, and instructions, you are ready to submit a Pull Request (PR) on [Github](https://github.com/apache/iotdb). You can refer to our code contribution guide to submit a PR: [Development Guide](https://iotdb.apache.org/Community/Development-Guide.html).


After the PR review is approved and merged, your UDF has already contributed to the IoTDB community!

##  6. Common problem

Q1: How to modify the registered UDF? 

A1: Assume that the name of the UDF is `example` and the full class name is `org.apache.iotdb.udf.ExampleUDTF`, which is introduced by `example.jar`.

1. Unload the registered function by executing `DROP FUNCTION example`.
2. Delete `example.jar` under `iotdb-server-2.0.x-all-bin/ext/udf`.
3. Modify the logic in `org.apache.iotdb.udf.ExampleUDTF` and repackage it. The name of the JAR package can still be `example.jar`.
4. Upload the new JAR package to `iotdb-server-2.0.x-all-bin/ext/udf`.
5. Load the new UDF by executing `CREATE FUNCTION example AS "org.apache.iotdb.udf.ExampleUDTF"`.

