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

# UDF

## 1. UDF Introduction

UDF refers to user-defined functions. IoTDB offers a variety of built-in time-series processing functions while supporting custom function extensions to fulfill advanced computational needs.

IoTDB's table model supports two types of UDFs, as detailed below:

| UDF Type                                | Function Type | Description                    |
|-----------------------------------------|---------------|--------------------------------|
| `UDSF（User-defined Scalar Function）`    | Scalar Function         | Processes ​1 row of k-column data, outputs ​1 row of 1-column data (one-to-one mapping). |
| `UDAF（User-defined Aggregate Function）` | Aggregate Function       | Processes ​m rows of k-column data, outputs ​1 row of 1-column data (many-to-one reduction). |

* `UDSF` can be used in any clause or expression where scalar functions are allowed, such as: SELECT clauses, WHERE conditions, etc.

    * `select udsf1(s1) from table1 where udsf2(s1)>0`
  
* `UDAF` can be used in any clause or expression where aggregate functions are allowed, such as: SELECT clauses, HAVING conditions, etc.

    * `select udaf1(s1), device_id from table1 group by device_id having udaf2(s1)>0 `


## 2. UDF Management

### 2.1 UDF Registration

1. Prepare the UDF JAR Package

   * The JAR should contain the UDF implementation class (e.g., `org.apache.iotdb.udf.ScalarFunctionExample`).
   
   * Deployment Options:
   
     * Local: Place the JAR in the `ext/udf` directory on **all cluster nodes**. 
     
     * Remote: Upload the JAR to a URI-accessible server (IoTDB will download and synchronize it across the cluster upon registration).
     
2. Register the UDF via SQL

   ```sql
   CREATE FUNCTION <UDF-NAME> AS <UDF-CLASS-FULL-PATHNAME> [USING URI <URI-STRING>]
   ```
   
    Examples:

    ```sql
    -- Local deployment
    CREATE FUNCTION contain_null AS 'org.apache.iotdb.udf.ScalarFunctionExample';
    
    -- Remote deployment (with URI)
    CREATE FUNCTION contain_null AS 'org.apache.iotdb.udf.ScalarFunctionExample' USING URI 'http://jar/example.jar';
    ```

Key Notes:

1. No Restart Required: UDFs can be loaded/unloaded dynamically without server restart.

2. Naming Rules:

* UDF names are ​case-insensitive.

* Must not conflict with built-in function names.

3. Model Isolation: UDFs in ​Table Model and ​Tree Model operate in separate namespaces.

4. Class Collision Warning: Avoid implementing UDF classes with identical full names but different logic across JARs. If present, IoTDB may randomly load one, causing inconsistent behavior.


### 2.2 UDF Uninstallation

* SQL Syntax:

```SQL
DROP FUNCTION <UDF-NAME>
```

* Example: Uninstall the UDF from the previous example:

```SQL
DROP FUNCTION contain_null
```

### 2.3 UDF Inspection

* View all registered UDFs and their statuses:

```SQL
SHOW FUNCTIONS
```
* Note: If the State shows UNAVAILABLE, errors may have occurred during registration/uninstallation. Check system logs and retry the operation until successful.


### 2.4 UDF Configuration

* Customize the UDF JAR storage directory in `iotdb-system.properties`:

```Properties
# UDF lib dir
udf_lib_dir=ext/udf
```

## 3. UDF Development

### 3.1 UDF Development Dependencies

You can search for the dependencies in the examples below from [the Maven Repository](http://search.maven.org/). Please ensure to select dependency versions that match your target IoTDB server version.

```XML
<dependency>
  <groupId>org.apache.iotdb</groupId>
  <artifactId>udf-api</artifactId>
  <version>2.0.0</version>
  <scope>provided</scope>
</dependency>
```

### 3.2 UDSF

To develop a `UDSF (User-Defined Scalar Function)`, you need to implement the `org.apache.iotdb.udf.api.relational.ScalarFunction` interface.

```java
public interface ScalarFunction extends SQLFunction {
  /**
   * In this method, the user need to do the following things:
   *
   * <ul>
   *   <li>Validate {@linkplain FunctionArguments}. Throw {@link UDFArgumentNotValidException} if
   *       any parameter is not valid.
   *   <li>Use {@linkplain FunctionArguments} to get input data types and infer output data type.
   *   <li>Construct and return a {@linkplain ScalarFunctionAnalysis} object.
   * </ul>
   *
   * @param arguments arguments used to validate
   * @throws UDFArgumentNotValidException if any parameter is not valid
   * @return the analysis result of the scalar function
   */
  ScalarFunctionAnalysis analyze(FunctionArguments arguments) throws UDFArgumentNotValidException;

  /**
   * This method is called after the ScalarFunction is instantiated and before the beginning of the
   * transformation process. This method is mainly used to initialize the resources used in
   * ScalarFunction.
   *
   * @param arguments used to parse the input arguments entered by the user
   * @throws UDFException the user can throw errors if necessary
   */
  default void beforeStart(FunctionArguments arguments) throws UDFException {
    // do nothing
  }

  /**
   * This method will be called to process the transformation. In a single UDF query, this method
   * may be called multiple times.
   *
   * @param input original input data row
   * @throws UDFException the user can throw errors if necessary
   */
  Object evaluate(Record input) throws UDFException;

  /** This method is mainly used to release the resources used in the ScalarFunction. */
  default void beforeDestroy() {
    // do nothing
  }
}
```

Interface Specification:

| Interface Definition                                                     | Description                                                                                                                                                                                                                           | Required |
| --------------------------------------------------------------- |---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `ScalarFunctionAnalysis analyze(FunctionArguments arguments);`| 1. Validates the input column count, data types, and system parameters in `FunctionArguments`. Throws exceptions if invalid. <br> 2. Constructs `ScalarFunctionAnalysis` based on `FunctionArguments`, including output type information. | Yes      |
| `void beforeStart(FunctionArguments arguments);`                | Custom initialization behavior before UDSF processes input data.                                                                                                                                                                         | No       |
| `Object evaluate(Record input) throws UDFException;`            | Core UDSF logic that processes one row of input data and returns one row of output data.                                                                                                                                              | Yes      |
| `void beforeDestroy();`                                         | Cleanup method for resource release. Called exactly once per instance by the framework after processing the last record.                                                                                                          | Np       |

Current Fields in `ScalarFunctionAnalysis`:

| Field Type| Field Name    | Default Value |
| ---------- | ---------------- |---------------|
| Type     | outputDataType | None          |

[UDSF Implementation Example](https://github.com/apache/iotdb/blob/master/example/udf/src/main/java/org/apache/iotdb/udf/ScalarFunctionExample.java): Takes any number of columns of any data type as input and returns a boolean indicating whether the row contains NULL values.

### 3.3 UDAF

A complete `UDAF (User-Defined Aggregate Function)` definition requires implementation of two classes: `State` and `AggregateFunction`.

#### 3.3.1 State Class

To implement a `State` class, you need to implement the `org.apache.iotdb.udf.api.State` interface.

```java
public interface State {
  /** Reset your state object to its initial state. */
  void reset();

  /**
   * Serialize your state into byte array. The order of serialization must be consistent with
   * deserialization.
   */
  byte[] serialize();

  /**
   * Deserialize byte array into your state. The order of deserialization must be consistent with
   * serialization.
   */
  void deserialize(byte[] bytes);

  /** Destroy state. You may release previously binding resource in this method. */
  default void destroyState() {}
  ;
}
```

Interface Specification:

| Interface Definition          | Description                                                                                                                          | Required |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |----------|
| `void reset() `                  | Resets the `State` object to its initial state. You should initialize all fields of the `State` class in this method, similar to a constructor.                  | Yes      |
| `byte[] serialize()`             | Serializes the `State` into binary data. Used for internal `State` object transfer in IoTDB. Note: The serialization order must match the deserialization method below.   | Yes      |
| `void deserialize(byte[] bytes)` | Deserializes binary data back into a `State` object. Used for internal `State` object transfer in IoTDB. Note: The deserialization order must match the serialization method above. | Yes      |
| `void destroyState()`           | Performs resource cleanup operations. Called exactly once per instance by the framework at the end of its lifecycle.                                      | No       |

#### 3.3.2 AggregateFunction Class
 
To implement a `UDAF`, you need to implement the `org.apache.iotdb.udf.api.relational.AggregateFunction` interface.

```java
public interface AggregateFunction extends SQLFunction {

  /**
   * In this method, the user need to do the following things:
   *
   * <ul>
   *   <li>Validate {@linkplain FunctionArguments}. Throw {@link UDFArgumentNotValidException} if
   *       any parameter is not valid.
   *   <li>Use {@linkplain FunctionArguments} to get input data types and infer output data type.
   *   <li>Construct and return a {@linkplain AggregateFunctionAnalysis} object.
   * </ul>
   *
   * @param arguments arguments used to validate
   * @throws UDFArgumentNotValidException if any parameter is not valid
   * @return the analysis result of the scalar function
   */
  AggregateFunctionAnalysis analyze(FunctionArguments arguments)
      throws UDFArgumentNotValidException;

  /**
   * This method is called after the AggregateFunction is instantiated and before the beginning of
   * the transformation process. This method is mainly used to initialize the resources used in
   * AggregateFunction.
   *
   * @param arguments used to parse the input arguments entered by the user
   * @throws UDFException the user can throw errors if necessary
   */
  default void beforeStart(FunctionArguments arguments) throws UDFException {
    // do nothing
  }

  /** Create and initialize state. You may bind some resource in this method. */
  State createState();

  /**
   * Update state with data columns.
   *
   * @param state state to be updated
   * @param input original input data row
   */
  void addInput(State state, Record input);

  /**
   * Merge two state in execution engine.
   *
   * @param state current state
   * @param rhs right-hand-side state to be merged
   */
  void combineState(State state, State rhs);

  /**
   * Calculate output value from final state
   *
   * @param state final state
   * @param resultValue used to collect output data points
   */
  void outputFinal(State state, ResultValue resultValue);

  /**
   * Remove input data from state. This method is used to remove the data points that have been
   * added to the state. Once it is implemented, {@linkplain
   * AggregateFunctionAnalysis.Builder#removable(boolean)} should be set to true.
   *
   * @param state state to be updated
   * @param input row to be removed
   */
  default void remove(State state, Record input) {
    throw new UnsupportedOperationException();
  }

  /** This method is mainly used to release the resources used in the SQLFunction. */
  default void beforeDestroy() {
    // do nothing
  }
}
```

Interface Specification:

| Interface Definition                                              | Description                                                                                                                                                                                     | Required |
|-------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `AggregateFunctionAnalysis analyze(FunctionArguments arguments);` | 1. Validates input column count, data types, and system parameters in `FunctionArguments` (throws exceptions if invalid).<br>2. Constructs `AggregateFunctionAnalysis` including output type and removable flag. | Yes      |
| `void beforeStart(FunctionArguments arguments); `                 | Custom initialization before processing input data.                                                                                                                                                                   | No        |
| `State createState();`                                            | Creates a `State` object (typically via default constructor with optional initial value overrides).                                                                                                                                                       | Yes      |
| `void addInput(State state, Record input);`                       | Updates aggregation `state` by incorporating one input row.                                                                                                                                                      | Yes      |
| `void combineState(State state, State rhs); `                     | Merges `rhs` state into `state` (critical for distributed execution where partial states are combined).                                                                                 | Yes      |
| `void outputFinal(State state, ResultValue resultValue);`         | Computes final aggregation result (must produce exactly one output value per group).                                                                                                                                                  | Yes      |
| `void remove(State state, Record input);`                         | Updates `state` by removing one input row (requires `removable=true` in `AggregateFunctionAnalysis`).                                                                                        | No        |
| `void beforeDestroy();`                                           | Resource cleanup method (called exactly once per instance after final record processing).                                                                            | No       |

Current Fields in `AggregateFunctionAnalysis`:

| Field Type| Field Name    | Default Value  |
| ---------- | ---------------- |-------|
| Type     | outputDataType | None  |
| boolean  | removable      | false |
 
[UDAF Example](https://github.com/apache/iotdb/blob/master/example/udf/src/main/java/org/apache/iotdb/udf/AggregateFunctionExample.java): Counts non-NULL rows.

### 3.4 Complete Maven Project Example

For Maven-based implementations, refer to the sample project: [udf-example](https://github.com/apache/iotdb/tree/master/example/udf).
