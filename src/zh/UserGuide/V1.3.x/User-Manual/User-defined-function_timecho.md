#  用户自定义函数

## 1. UDF 介绍

UDF（User Defined Function）即用户自定义函数，IoTDB 提供多种内建的面向时序处理的函数，也支持扩展自定义函数来满足更多的计算需求。

IoTDB 支持两种类型的 UDF 函数，如下表所示。

<table style="text-align: left;">
  <tbody>
     <tr>            <th>UDF 分类</th>
            <th>数据访问策略</th>        
            <th>描述</th>
      </tr>
      <tr>
            <td rowspan="2">UDTF</td>
            <td>MAPPABLE_ROW_BY_ROW</td>
            <td>自定义标量函数，输入 k 列时间序列 1 行数据，输出 1 列时间序列 1 行数据，可用于标量函数出现的任何子句和表达式中，如select子句、where子句等。</td>
      </tr>
      <tr>
            <td>ROW_BY_ROW <br>SLIDING_TIME_WINDOW <br>SLIDING_SIZE_WINDOW <br>SESSION_TIME_WINDOW <br>STATE_WINDOW</td>
            <td>自定义时间序列生成函数，输入 k 列时间序列 m 行数据，输出 1 列时间序列 n 行数据，输入行数 m 可以与输出行数 n 不相同，只能用于SELECT子句中。</td>
      </tr>
      <tr>
            <td>UDAF</td>
            <td>-</td>       
            <td>自定义聚合函数，输入 k 列时间序列 m 行数据，输出 1 列时间序列 1 行数据，可用于聚合函数出现的任何子句和表达式中，如select子句、having子句等。</td>
      </tr>
  </tbody>
</table>

###  1.1 UDF 使用

UDF 的使用方法与普通内建函数类似，可以直接在 SELECT 语句中像调用普通函数一样使用UDF。

#### 1.支持的基础 SQL 语法

* `SLIMIT` / `SOFFSET`
* `LIMIT` / `OFFSET`
* 支持值过滤
* 支持时间过滤


#### 2. 带 * 查询

假定现在有时间序列 `root.sg.d1.s1`和 `root.sg.d1.s2`。

* **执行`SELECT example(*) from root.sg.d1`**

那么结果集中将包括`example(root.sg.d1.s1)`和`example(root.sg.d1.s2)`的结果。

* **执行`SELECT example(s1, *) from root.sg.d1`**

那么结果集中将包括`example(root.sg.d1.s1, root.sg.d1.s1)`和`example(root.sg.d1.s1, root.sg.d1.s2)`的结果。

* **执行`SELECT example(*, *) from root.sg.d1`**

那么结果集中将包括`example(root.sg.d1.s1, root.sg.d1.s1)`，`example(root.sg.d1.s2, root.sg.d1.s1)`，`example(root.sg.d1.s1, root.sg.d1.s2)` 和 `example(root.sg.d1.s2, root.sg.d1.s2)`的结果。

#### 3. 带自定义输入参数的查询

可以在进行 UDF 查询的时候，向 UDF 传入任意数量的键值对参数。键值对中的键和值都需要被单引号或者双引号引起来。注意，键值对参数只能在所有时间序列后传入。下面是一组例子：

  示例：
``` sql
SELECT example(s1, 'key1'='value1', 'key2'='value2'), example(*, 'key3'='value3') FROM root.sg.d1;
SELECT example(s1, s2, 'key1'='value1', 'key2'='value2') FROM root.sg.d1;
```

#### 4. 与其他查询的嵌套查询

  示例：
``` sql
SELECT s1, s2, example(s1, s2) FROM root.sg.d1;
SELECT *, example(*) FROM root.sg.d1 DISABLE ALIGN;
SELECT s1 * example(* / s1 + s2) FROM root.sg.d1;
SELECT s1, s2, s1 + example(s1, s2), s1 - example(s1 + example(s1, s2) / s2) FROM root.sg.d1;
```


## 2. UDF 开发

可以参考 UDF函数开发：[开发指导](./UDF-development.md)

## 3. UDF 管理

###  3.1 UDF 注册

注册一个 UDF 可以按如下流程进行：

1. 实现一个完整的 UDF 类，假定这个类的全类名为`org.apache.iotdb.udf.UDTFExample`
2. 将项目打成 JAR 包，如果使用 Maven 管理项目，可以参考 [Maven 项目示例](https://github.com/apache/iotdb/tree/master/example/udf)的写法
3. 进行注册前的准备工作，根据注册方式的不同需要做不同的准备，具体可参考以下例子
4. 使用以下 SQL 语句注册 UDF

```sql
CREATE FUNCTION <UDF-NAME> AS <UDF-CLASS-FULL-PATHNAME> (USING URI URI-STRING)
```

####  示例：注册名为`example`的 UDF，以下两种注册方式任选其一即可

####  方式一：手动放置jar包

准备工作：  
使用该种方式注册时，需要提前将 JAR 包放置到集群所有节点的 `ext/udf`目录下（该目录可配置）。

注册语句：

```sql
CREATE FUNCTION example AS 'org.apache.iotdb.udf.UDTFExample'
```

####  方式二：集群通过URI自动安装jar包

准备工作：  
使用该种方式注册时，需要提前将 JAR 包上传到 URI 服务器上并确保执行注册语句的 IoTDB 实例能够访问该 URI 服务器。  

注册语句：

```sql
CREATE FUNCTION example AS 'org.apache.iotdb.udf.UDTFExample' USING URI 'http://jar/example.jar'
```

IoTDB 会下载 JAR 包并同步到整个集群。

####  注意

1. 由于 IoTDB 的 UDF 是通过反射技术动态装载的，因此在装载过程中无需启停服务器。

2. UDF 函数名称是大小写不敏感的。

3. 请不要给 UDF 函数注册一个内置函数的名字。使用内置函数的名字给 UDF 注册会失败。

4. 不同的 JAR 包中最好不要有全类名相同但实现功能逻辑不一样的类。例如 UDF(UDAF/UDTF)：`udf1`、`udf2`分别对应资源`udf1.jar`、`udf2.jar`。如果两个 JAR 包里都包含一个`org.apache.iotdb.udf.UDTFExample`类，当同一个 SQL 中同时使用到这两个 UDF 时，系统会随机加载其中一个类，导致 UDF 执行行为不一致。

###  3.2 UDF 卸载

SQL 语法如下：

```sql
DROP FUNCTION <UDF-NAME>
```

示例：卸载上述例子的 UDF：

```sql
DROP FUNCTION example
```


###  3.3 查看所有注册的 UDF

``` sql
SHOW FUNCTIONS
```

###  3.4 UDF 配置

- 允许在 `iotdb-system.properties` 中配置 udf 的存储目录.：
 ``` Properties
# UDF lib dir

udf_lib_dir=ext/udf
```

- 使用自定义函数时，提示内存不足，更改 `iotdb-system.properties` 中下述配置参数并重启服务。
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

###  3.5 UDF 用户权限

用户在使用 UDF 时会涉及到 `USE_UDF` 权限，具备该权限的用户才被允许执行 UDF 注册、卸载和查询操作。

更多用户权限相关的内容，请参考 [权限管理语句](../User-Manual/Authority-Management.md##权限管理)。


## 4. UDF 函数库

基于用户自定义函数能力，IoTDB 提供了一系列关于时序数据处理的函数，包括数据质量、数据画像、异常检测、 频域分析、数据匹配、数据修复、序列发现、机器学习等，能够满足工业领域对时序数据处理的需求。

可以参考 [UDF 函数库](../SQL-Manual/UDF-Libraries_timecho.md)文档，查找安装步骤及每个函数对应的注册语句，以确保正确注册所有需要的函数。

## 5. UDF 开发

###  5.1 UDF 依赖

如果您使用 [Maven](http://search.maven.org/) ，可以从 [Maven 库](http://search.maven.org/) 中搜索下面示例中的依赖。请注意选择和目标 IoTDB 服务器版本相同的依赖版本。

``` xml
<dependency>
  <groupId>org.apache.iotdb</groupId>
  <artifactId>udf-api</artifactId>
  <version>1.0.0</version>
  <scope>provided</scope>
</dependency>
```

###  5.2 UDTF（User Defined Timeseries Generating Function）

编写一个 UDTF 需要继承`org.apache.iotdb.udf.api.UDTF`类，并至少实现`beforeStart`方法和一种`transform`方法。

#### 接口说明:

| 接口定义                                                     | 描述                                                         | 是否必须                  |
| :----------------------------------------------------------- | :----------------------------------------------------------- | ------------------------- |
| void validate(UDFParameterValidator validator) throws Exception | 在初始化方法`beforeStart`调用前执行，用于检测`UDFParameters`中用户输入的参数是否合法。 | 否                        |
| void beforeStart(UDFParameters parameters, UDTFConfigurations configurations) throws Exception | 初始化方法，在 UDTF 处理输入数据前，调用用户自定义的初始化行为。用户每执行一次 UDTF 查询，框架就会构造一个新的 UDF 类实例，该方法在每个 UDF 类实例被初始化时调用一次。在每一个 UDF 类实例的生命周期内，该方法只会被调用一次。 | 是                        |
| Object transform(Row row) throws Exception`                 | 这个方法由框架调用。当您在`beforeStart`中选择以`MappableRowByRowAccessStrategy`的策略消费原始数据时，可以选用该方法进行数据处理。输入参数以`Row`的形式传入，输出结果通过返回值`Object`输出。 | 所有`transform`方法四选一 |
| void transform(Column[] columns, ColumnBuilder builder) throws Exception | 这个方法由框架调用。当您在`beforeStart`中选择以`MappableRowByRowAccessStrategy`的策略消费原始数据时，可以选用该方法进行数据处理。输入参数以`Column[]`的形式传入，输出结果通过`ColumnBuilder`输出。您需要在该方法内自行调用`builder`提供的数据收集方法，以决定最终的输出数据。 | 所有`transform`方法四选一 |
| void transform(Row row, PointCollector collector) throws Exception | 这个方法由框架调用。当您在`beforeStart`中选择以`RowByRowAccessStrategy`的策略消费原始数据时，这个数据处理方法就会被调用。输入参数以`Row`的形式传入，输出结果通过`PointCollector`输出。您需要在该方法内自行调用`collector`提供的数据收集方法，以决定最终的输出数据。 | 所有`transform`方法四选一 |
| void transform(RowWindow rowWindow, PointCollector collector) throws Exception | 这个方法由框架调用。当您在`beforeStart`中选择以`SlidingSizeWindowAccessStrategy`或者`SlidingTimeWindowAccessStrategy`的策略消费原始数据时，这个数据处理方法就会被调用。输入参数以`RowWindow`的形式传入，输出结果通过`PointCollector`输出。您需要在该方法内自行调用`collector`提供的数据收集方法，以决定最终的输出数据。 | 所有`transform`方法四选一 |
| void terminate(PointCollector collector) throws Exception  | 这个方法由框架调用。该方法会在所有的`transform`调用执行完成后，在`beforeDestory`方法执行前被调用。在一个 UDF 查询过程中，该方法会且只会调用一次。您需要在该方法内自行调用`collector`提供的数据收集方法，以决定最终的输出数据。 | 否                        |
| void beforeDestroy()                                       | UDTF 的结束方法。此方法由框架调用，并且只会被调用一次，即在处理完最后一条记录之后被调用。 | 否                        |

在一个完整的 UDTF 实例生命周期中，各个方法的调用顺序如下：

1. void validate(UDFParameterValidator validator) throws Exception
2. void beforeStart(UDFParameters parameters, UDTFConfigurations configurations) throws Exception
3. Object transform(Row row) throws Exception 或着 void transform(Column[] columns, ColumnBuilder builder) throws Exception 或者 void transform(Row row, PointCollector collector) throws Exception 或者 void transform(RowWindow rowWindow, PointCollector collector) throws Exception
4. void terminate(PointCollector collector) throws Exception
5. void beforeDestroy() 

> 注意，框架每执行一次 UDTF 查询，都会构造一个全新的 UDF 类实例，查询结束时，对应的 UDF 类实例即被销毁，因此不同 UDTF 查询（即使是在同一个 SQL 语句中）UDF 类实例内部的数据都是隔离的。您可以放心地在 UDTF 中维护一些状态数据，无需考虑并发对 UDF 类实例内部状态数据的影响。

#### 接口详细介绍：

1. **void validate(UDFParameterValidator validator) throws Exception**

 `validate`方法能够对用户输入的参数进行验证。

 您可以在该方法中限制输入序列的数量和类型，检查用户输入的属性或者进行自定义逻辑的验证。

 `UDFParameterValidator`的使用方法请见 Javadoc。

2. **void beforeStart(UDFParameters parameters, UDTFConfigurations configurations) throws Exception**

 `beforeStart`方法有两个作用：
  1. 帮助用户解析 SQL 语句中的 UDF 参数
  2. 配置 UDF 运行时必要的信息，即指定 UDF 访问原始数据时采取的策略和输出结果序列的类型
  3. 创建资源，比如建立外部链接，打开文件等

2.1  **UDFParameters**

`UDFParameters`的作用是解析 SQL 语句中的 UDF 参数（SQL 中 UDF 函数名称后括号中的部分）。参数包括序列类型参数和字符串 key-value 对形式输入的属性参数。

示例：

``` sql
SELECT UDF(s1, s2, 'key1'='iotdb', 'key2'='123.45') FROM root.sg.d;
```

用法：

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

您必须使用 `UDTFConfigurations` 指定 UDF 访问原始数据时采取的策略和输出结果序列的类型。

用法：

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

其中`setAccessStrategy`方法用于设定 UDF 访问原始数据时采取的策略，`setOutputDataType`用于设定输出结果序列的类型。

 2.2.1  **setAccessStrategy**

注意，您在此处设定的原始数据访问策略决定了框架会调用哪一种`transform`方法 ，请实现与原始数据访问策略对应的`transform`方法。当然，您也可以根据`UDFParameters`解析出来的属性参数，动态决定设定哪一种策略，因此，实现两种`transform`方法也是被允许的。

下面是您可以设定的访问原始数据的策略：

| 接口定义                        | 描述                                                         | 调用的`transform`方法                                        |
| ------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| MappableRowByRowStrategy                | 自定义标量函数<br>框架会为每一行原始数据输入调用一次`transform`方法，输入 k 列时间序列 1 行数据，输出 1 列时间序列 1 行数据，可用于标量函数出现的任何子句和表达式中，如select子句、where子句等。 | void transform(Column[] columns, ColumnBuilder builder) throws ExceptionObject transform(Row row) throws Exception |
| RowByRowAccessStrategy          | 自定义时间序列生成函数，逐行地处理原始数据。<br>框架会为每一行原始数据输入调用一次`transform`方法，输入 k 列时间序列 1 行数据，输出 1 列时间序列 n 行数据。<br> 当输入一个序列时，该行就作为输入序列的一个数据点。<br> 当输入多个序列时，输入序列按时间对齐后，每一行作为的输入序列的一个数据点。<br>（一行数据中，可能存在某一列为`null`值，但不会全部都是`null`） | void transform(Row row, PointCollector collector) throws Exception |
| SlidingTimeWindowAccessStrategy | 自定义时间序列生成函数，以滑动时间窗口的方式处理原始数据。<br>框架会为每一个原始数据输入窗口调用一次`transform`方法，输入 k 列时间序列 m 行数据，输出 1 列时间序列 n 行数据。<br>一个窗口可能存在多行数据，输入序列按时间对齐后，每个窗口作为的输入序列的一个数据点。 <br>（每个窗口可能存在 i 行，每行数据可能存在某一列为`null`值，但不会全部都是`null`） | void transform(RowWindow rowWindow, PointCollector collector) throws Exception |
| SlidingSizeWindowAccessStrategy | 自定义时间序列生成函数，以固定行数的方式处理原始数据，即每个数据处理窗口都会包含固定行数的数据（最后一个窗口除外）。<br>框架会为每一个原始数据输入窗口调用一次`transform`方法，输入 k 列时间序列 m 行数据，输出 1 列时间序列 n 行数据。<br>一个窗口可能存在多行数据，输入序列按时间对齐后，每个窗口作为的输入序列的一个数据点。 <br>（每个窗口可能存在 i 行，每行数据可能存在某一列为`null`值，但不会全部都是`null`） | void transform(RowWindow rowWindow, PointCollector collector) throws Exception |
| SessionTimeWindowAccessStrategy | 自定义时间序列生成函数，以会话窗口的方式处理原始数据。<br>框架会为每一个原始数据输入窗口调用一次`transform`方法，输入 k 列时间序列 m 行数据，输出 1 列时间序列 n 行数据。<br>一个窗口可能存在多行数据，输入序列按时间对齐后，每个窗口作为的输入序列的一个数据点。<br> （每个窗口可能存在 i 行，每行数据可能存在某一列为`null`值，但不会全部都是`null`） | void transform(RowWindow rowWindow, PointCollector collector) throws Exception |
| StateWindowAccessStrategy       | 自定义时间序列生成函数，以状态窗口的方式处理原始数据。<br>框架会为每一个原始数据输入窗口调用一次`transform`方法，输入 1 列时间序列 m 行数据，输出 1 列时间序列 n 行数据。<br>一个窗口可能存在多行数据，目前仅支持对一个物理量也就是一列数据进行开窗。 | void transform(RowWindow rowWindow, PointCollector collector) throws Exception |

#### 接口详情：

- `MappableRowByRowStrategy` 和 `RowByRowAccessStrategy`的构造不需要任何参数。

- `SlidingTimeWindowAccessStrategy`

开窗示意图:

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/UserGuide/Process-Data/UDF-User-Defined-Function/timeWindow.png">

`SlidingTimeWindowAccessStrategy`有多种构造方法，您可以向构造方法提供 3 类参数：

1. 时间轴显示时间窗开始和结束时间

时间轴显示时间窗开始和结束时间不是必须要提供的。当您不提供这类参数时，时间轴显示时间窗开始时间会被定义为整个查询结果集中最小的时间戳，时间轴显示时间窗结束时间会被定义为整个查询结果集中最大的时间戳。

2. 划分时间轴的时间间隔参数（必须为正数）
3. 滑动步长（不要求大于等于时间间隔，但是必须为正数）

滑动步长参数也不是必须的。当您不提供滑动步长参数时，滑动步长会被设定为划分时间轴的时间间隔。

3 类参数的关系可见下图。策略的构造方法详见 Javadoc。

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/github/99787878-47b51480-2b5b-11eb-8ed3-84088c5c30f7.png">

> 注意，最后的一些时间窗口的实际时间间隔可能小于规定的时间间隔参数。另外，可能存在某些时间窗口内数据行数量为 0 的情况，这种情况框架也会为该窗口调用一次`transform`方法。

- `SlidingSizeWindowAccessStrategy`

开窗示意图:

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/UserGuide/Process-Data/UDF-User-Defined-Function/countWindow.png">

`SlidingSizeWindowAccessStrategy`有多种构造方法，您可以向构造方法提供 2 个参数：

1. 窗口大小，即一个数据处理窗口包含的数据行数。注意，最后一些窗口的数据行数可能少于规定的数据行数。
2. 滑动步长，即下一窗口第一个数据行与当前窗口第一个数据行间的数据行数（不要求大于等于窗口大小，但是必须为正数）

滑动步长参数不是必须的。当您不提供滑动步长参数时，滑动步长会被设定为窗口大小。

- `SessionTimeWindowAccessStrategy`

开窗示意图：**时间间隔小于等于给定的最小时间间隔 sessionGap 则分为一组。**

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/UserGuide/Process-Data/UDF-User-Defined-Function/sessionWindow.png">


`SessionTimeWindowAccessStrategy`有多种构造方法，您可以向构造方法提供 2 类参数：

1. 时间轴显示时间窗开始和结束时间。
2. 会话窗口之间的最小时间间隔。

- `StateWindowAccessStrategy`

开窗示意图：**对于数值型数据，状态差值小于等于给定的阈值 delta 则分为一组。**

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/UserGuide/Process-Data/UDF-User-Defined-Function/stateWindow.png">

`StateWindowAccessStrategy`有四种构造方法：

1. 针对数值型数据，可以提供时间轴显示时间窗开始和结束时间以及对于单个窗口内部允许变化的阈值delta。
2. 针对文本数据以及布尔数据，可以提供时间轴显示时间窗开始和结束时间。对于这两种数据类型，单个窗口内的数据是相同的，不需要提供变化阈值。
3. 针对数值型数据，可以只提供单个窗口内部允许变化的阈值delta，时间轴显示时间窗开始时间会被定义为整个查询结果集中最小的时间戳，时间轴显示时间窗结束时间会被定义为整个查询结果集中最大的时间戳。
4. 针对文本数据以及布尔数据，可以不提供任何参数，开始与结束时间戳见3中解释。

StateWindowAccessStrategy 目前只能接收一列输入。策略的构造方法详见 Javadoc。

 2.2.2  **setOutputDataType**

注意，您在此处设定的输出结果序列的类型，决定了`transform`方法中`PointCollector`实际能够接收的数据类型。`setOutputDataType`中设定的输出类型和`PointCollector`实际能够接收的数据输出类型关系如下：

| `setOutputDataType`中设定的输出类型 | `PointCollector`实际能够接收的输出类型                       |
| :---------------------------------- | :----------------------------------------------------------- |
| INT32                             | int                                                        |
| INT64                             | long                                                       |
| FLOAT                             | float                                                      |
| DOUBLE                            | double                                                     |
| BOOLEAN                           | boolean                                                    |
| TEXT                              | java.lang.String 和 org.apache.iotdb.udf.api.type.Binary |

UDTF 输出序列的类型是运行时决定的。您可以根据输入序列类型动态决定输出序列类型。

示例：

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

当您在`beforeStart`方法中指定 UDF 读取原始数据的策略为 `MappableRowByRowAccessStrategy`，您就需要该方法和下面的`void transform(Column[] columns, ColumnBuilder builder) throws Exception` 二选一来实现，在该方法中增加对原始数据处理的逻辑。

该方法每次处理原始数据的一行。原始数据由`Row`读入，由返回值输出。您必须在一次`transform`方法调用中，根据每个输入的数据点输出一个对应的数据点，即输入和输出依然是一对一的。需要注意的是，输出数据点的类型必须与您在`beforeStart`方法中设置的一致，而输出数据点的时间戳必须是严格单调递增的。

下面是一个实现了`Object transform(Row row) throws Exception`方法的完整 UDF 示例。它是一个加法器，接收两列时间序列输入，输出这两个数据点的代数和。

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

当您在`beforeStart`方法中指定 UDF 读取原始数据的策略为 `MappableRowByRowAccessStrategy`，您就需要实现该方法，在该方法中增加对原始数据处理的逻辑。

该方法每次处理原始数据的多行，经过性能测试，我们发现一次性处理多行的 UDTF 比一次处理一行的 UDTF 性能更好。原始数据由`Column[]`读入，由`ColumnBuilder`输出。您必须在一次`transform`方法调用中，根据每个输入的数据点输出一个对应的数据点，即输入和输出依然是一对一的。需要注意的是，输出数据点的类型必须与您在`beforeStart`方法中设置的一致，而输出数据点的时间戳必须是严格单调递增的。

下面是一个实现了`void transform(Column[] columns, ColumnBuilder builder) throws Exceptionn`方法的完整 UDF 示例。它是一个加法器，接收两列时间序列输入，输出这两个数据点的代数和。

``` java
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

当您在`beforeStart`方法中指定 UDF 读取原始数据的策略为 `RowByRowAccessStrategy`，您就需要实现该方法，在该方法中增加对原始数据处理的逻辑。

该方法每次处理原始数据的一行。原始数据由`Row`读入，由`PointCollector`输出。您可以选择在一次`transform`方法调用中输出任意数量的数据点。需要注意的是，输出数据点的类型必须与您在`beforeStart`方法中设置的一致，而输出数据点的时间戳必须是严格单调递增的。

下面是一个实现了`void transform(Row row, PointCollector collector) throws Exception`方法的完整 UDF 示例。它是一个加法器，接收两列时间序列输入，当这两个数据点都不为`null`时，输出这两个数据点的代数和。

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
        .setOutputDataType(Type.INT64)
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

当您在`beforeStart`方法中指定 UDF 读取原始数据的策略为 `SlidingTimeWindowAccessStrategy`或者`SlidingSizeWindowAccessStrategy`时，您就需要实现该方法，在该方法中增加对原始数据处理的逻辑。

该方法每次处理固定行数或者固定时间间隔内的一批数据，我们称包含这一批数据的容器为窗口。原始数据由`RowWindow`读入，由`PointCollector`输出。`RowWindow`能够帮助您访问某一批次的`Row`，它提供了对这一批次的`Row`进行随机访问和迭代访问的接口。您可以选择在一次`transform`方法调用中输出任意数量的数据点，需要注意的是，输出数据点的类型必须与您在`beforeStart`方法中设置的一致，而输出数据点的时间戳必须是严格单调递增的。

下面是一个实现了`void transform(RowWindow rowWindow, PointCollector collector) throws Exception`方法的完整 UDF 示例。它是一个计数器，接收任意列数的时间序列输入，作用是统计并输出指定时间范围内每一个时间窗口中的数据行数。

```java
import java.io.IOException;
import org.apache.iotdb.udf.api.UDTF;
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
        .setOutputDataType(Type.INT32)
        .setAccessStrategy(new SlidingTimeWindowAccessStrategy(
            parameters.getLong("time_interval"),
            parameters.getLong("sliding_step"),
            parameters.getLong("display_window_begin"),
            parameters.getLong("display_window_end")));
  }

  @Override
  public void transform(RowWindow rowWindow, PointCollector collector) throws Exception {
    if (rowWindow.windowSize() != 0) {
      collector.putInt(rowWindow.windowStartTime(), rowWindow.windowSize());
    }
  }
}
```

7. **void terminate(PointCollector collector) throws Exception**

在一些场景下，UDF 需要遍历完所有的原始数据后才能得到最后的输出结果。`terminate`接口为这类 UDF 提供了支持。

该方法会在所有的`transform`调用执行完成后，在`beforeDestory`方法执行前被调用。您可以选择使用`transform`方法进行单纯的数据处理，最后使用`terminate`将处理结果输出。

结果需要由`PointCollector`输出。您可以选择在一次`terminate`方法调用中输出任意数量的数据点。需要注意的是，输出数据点的类型必须与您在`beforeStart`方法中设置的一致，而输出数据点的时间戳必须是严格单调递增的。

下面是一个实现了`void terminate(PointCollector collector) throws Exception`方法的完整 UDF 示例。它接收一个`INT32`类型的时间序列输入，作用是输出该序列的最大值点。

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

UDTF 的结束方法，您可以在此方法中进行一些资源释放等的操作。

此方法由框架调用。对于一个 UDF 类实例而言，生命周期中会且只会被调用一次，即在处理完最后一条记录之后被调用。

### 5.3 UDAF（User Defined Aggregation Function）

一个完整的 UDAF 定义涉及到 State 和 UDAF 两个类。

#### State 类

编写一个 State 类需要实现`org.apache.iotdb.udf.api.State`接口，下表是需要实现的方法说明。

#### 接口说明:

| 接口定义                         | 描述                                                         | 是否必须 |
| -------------------------------- | ------------------------------------------------------------ | -------- |
| void reset()                   | 将 `State` 对象重置为初始的状态，您需要像编写构造函数一样，在该方法内填入 `State` 类中各个字段的初始值。 | 是       |
| byte[] serialize()             | 将 `State` 序列化为二进制数据。该方法用于 IoTDB 内部的 `State` 对象传递，注意序列化的顺序必须和下面的反序列化方法一致。 | 是       |
| void deserialize(byte[] bytes) | 将二进制数据反序列化为 `State`。该方法用于 IoTDB 内部的 `State` 对象传递，注意反序列化的顺序必须和上面的序列化方法一致。 | 是       |

#### 接口详细介绍:

1. **void reset()**

该方法的作用是将 `State` 重置为初始的状态，您需要在该方法内填写 `State` 对象中各个字段的初始值。出于优化上的考量，IoTDB 在内部会尽可能地复用 `State`，而不是为每一个组创建一个新的 `State`，这样会引入不必要的开销。当 `State` 更新完一个组中的数据之后，就会调用这个方法重置为初始状态，以此来处理下一个组。

以求平均数（也就是 `avg`）的 `State` 为例，您需要数据的总和 `sum` 与数据的条数 `count`，并在 `reset()` 方法中将二者初始化为 0。

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

该方法的作用是将 State 序列化为二进制数据，和从二进制数据中反序列化出 State。IoTDB 作为分布式数据库，涉及到在不同节点中传递数据，因此您需要编写这两个方法，来实现 State 在不同节点中的传递。注意序列化和反序列的顺序必须一致。

还是以求平均数（也就是求 avg）的 State 为例，您可以通过任意途径将 State 的内容转化为 `byte[]` 数组，以及从 `byte[]` 数组中读取出 State 的内容，下面展示的是用 Java8 引入的 `ByteBuffer` 进行序列化/反序列的代码：

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

#### UDAF 类

编写一个 UDAF 类需要实现`org.apache.iotdb.udf.api.UDAF`接口，下表是需要实现的方法说明。

#### 接口说明:

| 接口定义                                                     | 描述                                                         | 是否必须 |
| ------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| void validate(UDFParameterValidator validator) throws Exception | 在初始化方法`beforeStart`调用前执行，用于检测`UDFParameters`中用户输入的参数是否合法。该方法与 UDTF 的`validate`相同。 | 否       |
| void beforeStart(UDFParameters parameters, UDAFConfigurations configurations) throws Exception | 初始化方法，在 UDAF 处理输入数据前，调用用户自定义的初始化行为。与 UDTF 不同的是，这里的 configuration 是 `UDAFConfiguration` 类型。 | 是       |
| State createState()                                        | 创建`State`对象，一般只需要调用默认构造函数，然后按需修改默认的初始值即可。 | 是       |
| void addInput(State state, Column[] columns, BitMap bitMap) | 根据传入的数据`Column[]`批量地更新`State`对象，注意最后一列，也就是 `columns[columns.length - 1]` 总是代表时间列。另外`BitMap`表示之前已经被过滤掉的数据，您在编写该方法时需要手动判断对应的数据是否被过滤掉。 | 是       |
| void combineState(State state, State rhs)                  | 将`rhs`状态合并至`state`状态中。在分布式场景下，同一组的数据可能分布在不同节点上，IoTDB 会为每个节点上的部分数据生成一个`State`对象，然后调用该方法合并成完整的`State`。 | 是       |
| void outputFinal(State state, ResultValue resultValue)     | 根据`State`中的数据，计算出最终的聚合结果。注意根据聚合的语义，每一组只能输出一个值。 | 是       |
| void beforeDestroy()                                       | UDAF 的结束方法。此方法由框架调用，并且只会被调用一次，即在处理完最后一条记录之后被调用。 | 否       |

在一个完整的 UDAF 实例生命周期中，各个方法的调用顺序如下：

1. State createState()
2. void validate(UDFParameterValidator validator) throws Exception
3. void beforeStart(UDFParameters parameters, UDAFConfigurations configurations) throws Exception
4. void addInput(State state, Column[] columns, BitMap bitMap)
5. void combineState(State state, State rhs)
6. void outputFinal(State state, ResultValue resultValue)
7. void beforeDestroy()

和 UDTF 类似，框架每执行一次 UDAF 查询，都会构造一个全新的 UDF 类实例，查询结束时，对应的 UDF 类实例即被销毁，因此不同 UDAF 查询（即使是在同一个 SQL 语句中）UDF 类实例内部的数据都是隔离的。您可以放心地在 UDAF 中维护一些状态数据，无需考虑并发对 UDF 类实例内部状态数据的影响。

#### 接口详细介绍:

1. **void validate(UDFParameterValidator validator) throws Exception**

同 UDTF， `validate`方法能够对用户输入的参数进行验证。 

您可以在该方法中限制输入序列的数量和类型，检查用户输入的属性或者进行自定义逻辑的验证。

2. **void beforeStart(UDFParameters parameters, UDAFConfigurations configurations) throws Exception**

 `beforeStart`方法的作用 UDAF 相同：
 
  1. 帮助用户解析 SQL 语句中的 UDF 参数
  2. 配置 UDF 运行时必要的信息，即指定 UDF 访问原始数据时采取的策略和输出结果序列的类型
  3. 创建资源，比如建立外部链接，打开文件等。

其中，`UDFParameters` 类型的作用可以参照上文。

2.2  **UDTFConfigurations**

和 UDTF 的区别在于，UDAF 使用了 `UDAFConfigurations` 作为 `configuration` 对象的类型。

目前，该类仅支持设置输出数据的类型。

```java
void beforeStart(UDFParameters parameters, UDAFConfigurations configurations) throws Exception {
  // parameters
  // ...

  // configurations
  configurations
    .setOutputDataType(Type.INT32);
}
```

`setOutputDataType` 中设定的输出类型和 `ResultValue` 实际能够接收的数据输出类型关系如下：

| `setOutputDataType`中设定的输出类型 | `ResultValue`实际能够接收的输出类型    |
| :---------------------------------- | :------------------------------------- |
| INT32                               | int                                    |
| INT64                               | long                                   |
| FLOAT                               | float                                  |
| DOUBLE                              | double                                 |
| BOOLEAN                             | boolean                                |
| TEXT                                | org.apache.iotdb.udf.api.type.Binary   |

UDAF 输出序列的类型也是运行时决定的。您可以根据输入序列类型动态决定输出序列类型。

示例：

```java
void beforeStart(UDFParameters parameters, UDAFConfigurations configurations) throws Exception {
  // do something
  // ...
  
  configurations
    .setOutputDataType(parameters.getDataType(0));
}
```

3. **State createState()**

为 UDAF 创建并初始化 `State`。由于 Java 语言本身的限制，您只能调用 `State` 类的默认构造函数。默认构造函数会为类中所有的字段赋一个默认的初始值，如果该初始值并不符合您的要求，您需要在这个方法内进行手动的初始化。

下面是一个包含手动初始化的例子。假设您要实现一个累乘的聚合函数，`State` 的初始值应该设置为 1，但是默认构造函数会初始化为 0，因此您需要在调用默认构造函数之后，手动对 `State` 进行初始化：

```java
public State createState() {
  MultiplyState state = new MultiplyState();
  state.result = 1;
  return state;
}
```

4. **void addInput(State state, Column[] columns, BitMap bitMap)**

该方法的作用是，通过原始的输入数据来更新 `State` 对象。出于性能上的考量，也是为了和 IoTDB 向量化的查询引擎相对齐，原始的输入数据不再是一个数据点，而是列的数组 `Column[]`。注意最后一列（也就是 `columns[columns.length - 1]` ）总是时间列，因此您也可以在 UDAF 中根据时间进行不同的操作。

由于输入参数的类型不是一个数据点，而是多个列，您需要手动对列中的部分数据进行过滤处理，这就是第三个参数 `BitMap` 存在的意义。它用来标识这些列中哪些数据被过滤掉了，您在任何情况下都无需考虑被过滤掉的数据。

下面是一个用于统计数据条数（也就是 count）的 `addInput()` 示例。它展示了您应该如何使用 `BitMap` 来忽视那些已经被过滤掉的数据。注意还是由于 Java 语言本身的限制，您需要在方法的开头将接口中定义的 `State` 类型强制转化为自定义的 `State` 类型，不然后续无法正常使用该 `State` 对象。

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

该方法的作用是合并两个 `State`，更加准确的说，是用第二个 `State` 对象来更新第一个 `State` 对象。IoTDB 是分布式数据库，同一组的数据可能分布在多个不同的节点上。出于性能考虑，IoTDB 会为每个节点上的部分数据先进行聚合成 `State`，然后再将不同节点上的、属于同一个组的 `State` 进行合并，这就是 `combineState` 的作用。

下面是一个用于求平均数（也就是 avg）的 `combineState()` 示例。和 `addInput` 类似，您都需要在开头对两个 `State` 进行强制类型转换。另外需要注意是用第二个 `State` 的内容来更新第一个 `State` 的值。

```java
public void combineState(State state, State rhs) {
  AvgState avgState = (AvgState) state;
  AvgState avgRhs = (AvgState) rhs;

  avgState.count += avgRhs.count;
  avgState.sum += avgRhs.sum;
}
```

6. **void outputFinal(State state, ResultValue resultValue)**

该方法的作用是从 `State` 中计算出最终的结果。您需要访问 `State` 中的各个字段，求出最终的结果，并将最终的结果设置到 `ResultValue` 对象中。IoTDB 内部会为每个组在最后调用一次这个方法。注意根据聚合的语义，最终的结果只能是一个值。

下面还是一个用于求平均数（也就是 avg）的 `outputFinal` 示例。除了开头的强制类型转换之外，您还将看到 `ResultValue` 对象的具体用法，即通过 `setXXX`（其中 `XXX` 是类型名）来设置最后的结果。

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

UDAF 的结束方法，您可以在此方法中进行一些资源释放等的操作。

此方法由框架调用。对于一个 UDF 类实例而言，生命周期中会且只会被调用一次，即在处理完最后一条记录之后被调用。

###  5.4 完整 Maven 项目示例

如果您使用 [Maven](http://search.maven.org/)，可以参考我们编写的示例项目**udf-example**。您可以在 [这里](https://github.com/apache/iotdb/tree/master/example/udf) 找到它。


## 6. 为iotdb贡献通用的内置UDF函数

该部分主要讲述了外部用户如何将自己编写的 UDF 贡献给 IoTDB 社区。

###  6.1 前提条件

1. UDF 具有通用性。

    通用性主要指的是：UDF 在某些业务场景下，可以被广泛使用。换言之，就是 UDF 具有复用价值，可被社区内其他用户直接使用。

    如果不确定自己写的 UDF 是否具有通用性，可以发邮件到 `dev@iotdb.apache.org` 或直接创建 ISSUE 发起讨论。

2. UDF 已经完成测试，且能够正常运行在用户的生产环境中。

###  6.2 贡献清单

1. UDF 的源代码
2. UDF 的测试用例
3. UDF 的使用说明

###  6.3 贡献内容

#### 6.3.1 源代码

1. 在`iotdb-core/node-commons/src/main/java/org/apache/iotdb/commons/udf/builtin`中创建 UDF 主类和相关的辅助类。
2. 在`iotdb-core/node-commons/src/main/java/org/apache/iotdb/commons/udf/builtin/BuiltinTimeSeriesGeneratingFunction.java`中注册编写的 UDF。

#### 6.3.2 测试用例

至少需要为贡献的 UDF 编写集成测试。

可以在`integration-test/src/test/java/org/apache/iotdb/db/it/udf`中为贡献的 UDF 新增一个测试类进行测试。

####  6.3.3 使用说明

使用说明需要包含：UDF 的名称、UDF 的作用、执行函数必须的属性参数、函数的适用的场景以及使用示例等。

使用说明需包含中英文两个版本。应分别在 `docs/zh/UserGuide/Operation Manual/DML Data Manipulation Language.md` 和 `docs/UserGuide/Operation Manual/DML Data Manipulation Language.md` 中新增使用说明。

####  6.3.4 提交 PR

当准备好源代码、测试用例和使用说明后，就可以将 UDF 贡献到 IoTDB 社区了。在 [Github](https://github.com/apache/iotdb) 上面提交 Pull Request (PR) 即可。具体提交方式见：[贡献指南](https://iotdb.apache.org/zh/Community/Development-Guide.html)。

当 PR 评审通过并被合并后， UDF 就已经贡献给 IoTDB 社区了！

##  7. 常见问题

1. 如何修改已经注册的 UDF？

答：假设 UDF 的名称为`example`，全类名为`org.apache.iotdb.udf.UDTFExample`，由`example.jar`引入

1. 首先卸载已经注册的`example`函数，执行`DROP FUNCTION example`
2. 删除 `iotdb-server-1.0.0-all-bin/ext/udf` 目录下的`example.jar`
3. 修改`org.apache.iotdb.udf.UDTFExample`中的逻辑，重新打包，JAR 包的名字可以仍然为`example.jar`
4. 将新的 JAR 包上传至 `iotdb-server-1.0.0-all-bin/ext/udf` 目录下
5. 装载新的 UDF，执行`CREATE FUNCTION example AS "org.apache.iotdb.udf.UDTFExample"`