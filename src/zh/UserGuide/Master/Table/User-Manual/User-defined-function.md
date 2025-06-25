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

# 用户自定义函数

## 1. UDF介绍

UDF（User Defined Function）即用户自定义函数，IoTDB 提供多种内置的时序处理函数，也支持扩展自定义函数来满足更多的计算需求。

IoTDB 表模型中支持三种类型的 UDF ，如下表所示。

| UDF 类型                                  | 函数类型 | 描述                             |
|-----------------------------------------|------|--------------------------------|
| `UDSF（User-defined Scalar Function）`    | 标量函数 | 输入 k 列 1 行数据，输出1 列 1 行数据（一对一）。 |
| `UDAF（User-defined Aggregate Function）` | 聚合函数 | 输入k 列 m 行数据，输出1 列 1 行数据（多对一）。  |
| `UDTF（User-defined Table Function）`     | 表函数  | 输入0或1张表（k 列 m 行），输出1张表（x 行 y 列）。          |

* `UDSF` 可用于标量函数出现的任何子句和表达式中，如select子句、where子句等。
    * `select udsf1(s1) from table1 where udsf2(s1)>0`
* `UDAF` 可用于聚合函数出现的任何子句和表达式中，如select子句、having子句等；
    * `select udaf1(s1), device_id from table1 group by device_id having udaf2(s1)>0 `
* `UDTF` 可以像关系表一样在from子句中使用；
    * `select * from udtf('t1', bid);`

## 2. UDF 管理

### 2.1 UDF 注册


1. 准备 UDF 实现的 JAR 包，其中包含 UDF 实现类，如`org.apache.iotdb.udf.ScalarFunctionExample`。

    Jar 包的放置有两种方式：

* 本地：需要将 JAR 包放置到集群**所有节点**的 `ext/udf`目录下。
* 远端：需要将 JAR 包上传到 URI 服务器上并确保 IoTDB 实例能够访问该 URI 服务器（注册成功后IoTDB 会下载 JAR 包并同步到整个集群）。

2. 使用以下 SQL 语句注册 UDF

```SQL
CREATE FUNCTION <UDF-NAME> AS <UDF-CLASS-FULL-PATHNAME> (USING URI URI-STRING)
```

* 示例

```SQL
-- 本地
CREATE FUNCTION contain_null AS 'org.apache.iotdb.udf.ScalarFunctionExample';

-- 远端
CREATE FUNCTION contain_null AS 'org.apache.iotdb.udf.ScalarFunctionExample' USING URI 'http://jar/example.jar'
```

**注意：**

1. UDF 在装载过程中无需启停服务器。
2. UDF 名称大小写不敏感，不能与 IoTDB 内置函数重名。
3. 表模型和树模型的 UDF 空间相互独立。
4. 避免在不同的 JAR 包中创建全类名相同但功能逻辑不同的 UDF 类。如果存在，系统在执行 UDF 时会随机加载其中一个，造成执行行为不一致。

### 2.2 UDF 卸载

SQL 语法如下：

```SQL
DROP FUNCTION <UDF-NAME>
```

示例：卸载上述例子的 UDF：

```SQL
DROP FUNCTION contain_null
```

### 2.3 UDF 查看

* 如果 State 为 UNAVAILABLE，可能是在注册或卸载过程中系统发生了错误，请查看系统日志进行排查，重新注册或卸载 UDF 直至成功即可。

```SQL
SHOW FUNCTIONS
```

### 2.4 UDF 配置

* 可以在 `iotdb-system.properties` 中配置 UDF Jar 文件的存储目录：

```Properties
# UDF lib dir
udf_lib_dir=ext/udf
```

## 3. UDF 开发

### 3.1 UDF 依赖

可以从 [Maven 库](http://search.maven.org/) 中搜索下面示例中的依赖，请注意选择和目标 IoTDB 服务器版本相同的依赖版本。

```XML
<dependency>
  <groupId>org.apache.iotdb</groupId>
  <artifactId>udf-api</artifactId>
  <version>2.0.0</version>
  <scope>provided</scope>
</dependency>
```

### 3.2 标量函数（UDSF）

编写一个 UDSF 需要实现`org.apache.iotdb.udf.api.relational.ScalarFunction`接口。

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

接口说明：

| 接口定义                                                      | 描述                                                                                                                        | 是否必须 |
| --------------------------------------------------------------- |---------------------------------------------------------------------------------------------------------------------------| ---------- |
| `ScalarFunctionAnalysis analyze(FunctionArguments arguments);`| 1. 校验`FunctionArguments`中的输入列数、数据类型、系统参数等是否合法，不合法则抛出异常。<br> 2. 根据`FunctionArguments`构造`ScalarFunctionAnalysis`，包括输出类型等信息。 | 是       |
| `void beforeStart(FunctionArguments arguments);`                | 在 UDSF 处理输入数据前，调用用户自定义的初始化行为                                                                                              | 否       |
| `Object evaluate(Record input) throws UDFException;`            | UDSF 处理逻辑，根据一行输入数据，返回一行输出数据。                                                                                              | 是       |
| `void beforeDestroy();`                                         | UDSF 的结束方法，您可以在此方法中进行一些资源释放等的操作。此方法由框架调用。对于一个实例而言，生命周期中会且只会被调用一次，即在处理完最后一条记录之后被调用。                                        | 否       |

目前 ScalarFunctionAnalysis 中的字段：

| 字段类型 | 字段名称       | 默认值 |
| ---------- | ---------------- | -------- |
| Type     | outputDataType | 无     |

示例：[UDSF 的实现示例](https://github.com/apache/iotdb/blob/master/example/udf/src/main/java/org/apache/iotdb/udf/ScalarFunctionExample.java)，输入任意数据类型的任意多列，返回一个布尔值，代表该行输入是否包含 NULL 值。

### 3.3 聚合函数（UDAF）

一个完整的 UDAF 定义涉及到 `State` 和 `AggregateFunction` 两个类。

#### 3.3.1 State 类

编写一个 State 类需要实现`org.apache.iotdb.udf.api.State`接口。

```c++
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

接口说明：

| 接口定义                       | 描述                                                                                                                          | 是否必须 |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `void reset() `                  | 将`State`对象重置为初始的状态，您需要像编写构造函数一样，在该方法内填入`State`类中各个字段的初始值。                  | 是       |
| `byte[] serialize()`             | 将`State`序列化为二进制数据。该方法用于 IoTDB 内部的`State`对象传递，注意序列化的顺序必须和下面的反序列化方法一致。   | 是       |
| `void deserialize(byte[] bytes)` | 将二进制数据反序列化为`State`。该方法用于 IoTDB 内部的`State`对象传递，注意反序列化的顺序必须和上面的序列化方法一致。 | 是       |
| `void destroyState()`           | 进行资源释放等的操作。此方法由框架调用。对于一个实例而言，生命周期中会且只会被调用一次。                                      | 否      |

#### 3.3.2 AggregateFunction 类

编写一个 UDAF 需要实现 `org.apache.iotdb.udf.api.relational.AggregateFunction`接口。

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

接口说明：

| 接口定义                                                        | 描述                                                                                                                                      | 是否必须           |
| ----------------------------------------------------------------- |-----------------------------------------------------------------------------------------------------------------------------------------|----------------|
| `AggregateFunctionAnalysis analyze(FunctionArguments arguments);` | 1. 校验`FunctionArguments`中的输入列数、数据类型、系统参数等是否合法，不合法则抛出异常。<br> 2. 根据`FunctionArguments`构造`AggregateFunctionAnalysis`，包括输出类型、removable 等信息。 | 是              |
| `void beforeStart(FunctionArguments arguments); `                 | 在 UDAF 处理输入数据前，调用用户自定义的初始化行为                                                                                                            | 否              |
| `State createState();`                                            | 创建`State`对象，一般只需要调用默认构造函数，然后按需修改默认的初始值即可。                                                                                               | 是              |
| `void addInput(State state, Record input);`                       | 更新`State`对象，将输入的一行*​ ​*`Record`数据添加到聚合状态中。                                                                                              | 是              |
| `void combineState(State state, State rhs); `                     | 将`rhs`状态合并至`state`状态中。在分布式场景下，同一组的数据可能分布在不同节点上，IoTDB 会为每个节点上的部分数据生成一个`State`对象，然后调用该方法合并成完整的`State`。                                    | 是              |
| `void outputFinal(State state, ResultValue resultValue);`         | 根据`State`中的数据，计算出最终的聚合结果。注意根据聚合的语义，每一组只能输出一个值。                                                                                          | 是              |
| `void remove(State state, Record input);`| 更新`State`对象，将输入的一行*​ ​*`Record`数据从聚合状态中剔除。**实现该方法需要设置 AggregateFunctionAnalysis 中的 removable 字段为 true。**                                | 否              |
| `void beforeDestroy();`| UDSF 的结束方法，您可以在此方法中进行一些资源释放等的操作。此方法由框架调用。对于一个实例而言，生命周期中会且只会被调用一次，即在处理完最后一条记录之后被调用。                                                      | 否              |

目前 AggregateFunctionAnalysis 中的字段：

| 字段类型 | 字段名称       | 默认值 |
| ---------- | ---------------- | -------- |
| Type     | outputDataType | 无     |
| boolean  | removable      | false  |

示例：[UDAF 的实现示例](https://github.com/apache/iotdb/blob/master/example/udf/src/main/java/org/apache/iotdb/udf/AggregateFunctionExample.java)，计算不为 NULL 的行数。

### 3.4 表函数（UDTF）

#### 3.4.1 定义

表函数，也被称为表值函数（Table-Valued Function，TVF），不同于标量函数、聚合函数和窗口函数的返回值是一个“标量值”，表函数的返回值是一个“表”（结果集）。

#### 3.4.2 使用

表函数可以像关系表一样，以`tableFunctionCall`的形式在 SQL 查询的 `FROM` 子句中使用，支持传递参数，并根据参数动态生成结果集。

#### 3.4.3 语法

`tableFunctionCall` 的具体定义如下所示：

```sql
tableFunctionCall
    : qualifiedName '(' (tableFunctionArgument (',' tableFunctionArgument)*)?')'
    ;

tableFunctionArgument
    : (identifier '=>')? (tableArgument | scalarArgument)
​    ​;

tableArgument
    : tableArgumentRelation
        (PARTITION BY ('(' (expression (',' expression)*)? ')' | expression))?
        (ORDER BY ('(' sortItem (',' sortItem)* ')' | sortItem))?
    ;

tableArgumentRelation
    : qualifiedName  (AS? identifier columnAliases?)?         #tableArgumentTable
    | '(' query ')' (AS? identifier columnAliases?)?          #tableArgumentQuery
    ;

scalarArgument
    : expression
    | timeDuration
    ;
```

例如：

```SQL
// 这是从表函数中进行查询，传入一个字符串“t1”参数。
select * from tvf('t1'); 

// 这是从表函数中进行查询，传入一个字符串“t1”参数，一个 bid 表参数。
select * from tvf('t1', bid);
```

#### 3.4.4 函数参数

IoTDB 中的表函数为多态表值函数，支持参数类型如下所示：

| 参数类型                     | 定义                                                                 | 示例                                                                                                          |
| ------------------------------ | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 标量参数（Scalar Argument）| 必须是常量表达式，可以是任何的 SQL 数据类型，需要和声明的类型兼容。| `SIZE => 42`，`SIZE => '42'`，`SIZE => 42.2`，`SIZE => 12h`，`SIZE => 60m`                |
| 表参数（Table Argument）     | 可以是一个表名或一条查询语句。                                       | `input => orders`，`data => (SELECT * FROM region, nation WHERE region.regionkey = nation.regionkey)` |

表参数具有如下属性：

1. 组语义与行语义
   * 被声明为组语义（Set Semantic）的表参数意味着需要根据整个完整的分区才能得到结果集。
        * 允许在调用时指定 PARTITION 或 ORDER，执行引擎会 partition-by-partition 地进行处理。

       ```SQL
       input => orders PARTITION BY device_id ORDER BY time
       ```

        * 如果没有指定 PARTITION，则认为所有的数据都在同一个数据组中。
   * 被声明为行语义（Row Semantics）的表参数意味着行与行之间没有依赖关系。不允许在调用时指定  PARTITION 或 ORDER，执行引擎会 row-by-row 地进行处理。

2. 列穿透（Pass-through Columns）
    * 表参数如果被声明为列穿透，则表函数的结果列会包含该表参数输入的所有列。
    * 例如，窗口分析函数，通过为表参数设置列穿透属性，可实现输出结果为“所有输入列（包含原始列和聚合结果）+窗口ID”，即“原始数据+分析结果”。

#### 3.4.5 传递方式

| 传递方式   | 描述                                                        | 示例                                                                                                                                                                                            |
| ------------ |-----------------------------------------------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 按名传递   | 1. 可以通过任意的顺序传递参数。<br>2. 被声明有默认值的参数可以被省略。<br>3. 参数名大小写不敏感。 | `SELECT * FROM my_function(row_count => 100, column_count => 1);` `SELECT * FROM my_function(column_count => 1, row_count => 100);` `SELECT * FROM my_function(column_count => 1);` |
| 按位置传递 | 1. 必须按照声明的顺序进行传递参数。<br>2. 如果余下的参数都有默认值，可以只传一部分参数。         | `SELECT * FROM my_function(1, 100);` `SELECT * FROM my_function(1);`                                                                                                                    |

> 注意：
> 以上两种方式不允许混用，否则在语义解析时候会抛出“​**All arguments must be passed by name or all must be passed positionally**​”异常。

#### 3.4.6 返回结果

表函数的结果集由以下两部分组成。

1. 由表函数创建的生成列（Proper Columns）。
2. 根据表参数自动构建的映射列（Pass-through Columns）。
   * 如果指定了表参数的属性为列穿透，则会包括输入关系的所有列；
   * 如果没有指定为列穿透但指定了 PartitionBy，则是 PartitionBy 的列；
   * 如果均未指定，则不根据表参数自动构建列。



### 3.5 完整Maven项目示例

如果使用 [Maven](http://search.maven.org/)，可以参考示例项目[udf-example](https://github.com/apache/iotdb/tree/master/example/udf)。
