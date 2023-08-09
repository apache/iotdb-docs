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

# 用户自定义函数（Python）

UDF（User Defined Function）即用户自定义函数。IoTDB 提供多种 Java 内建函数来满足您的计算需求，同时您还可以通过创建自定义 Python 函数来满足更多的计算需求。

根据此文档，您将会很快学会 Python UDF 的编写、注册、使用等操作。

## UDF 类型

IoTDB 支持两种类型的 UDF 函数，如下表所示。


| UDF 分类                                            | 描述                                                                                                                   |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| UDTF（User Defined Timeseries Generating Function） | 自定义时间序列生成函数。该类函数允许接收多条时间序列，最终会输出一条时间序列，生成的时间序列可以有任意多数量的数据点。 |
| UDAF（User Defined Aggregation Function）           | 正在开发，敬请期待。                                                                                                   |

## UDF 依赖

* 准备好 Python 运行环境，要求 Python 版本 >= 3.7
* 开发 UDF 需要依赖 apache-iotdb 包：`pip3 install apache-iotdb`

## UDTF（User Defined Timeseries Generating Function）

编写一个 UDTF 需要继承`UDTF`类，并至少实现`before_start`方法和一种`transform_row / transform_window`方法。

下表是所有可供用户实现的接口说明。


| 接口定义                                                                                   | 描述                                                                                                                                                                                                                                                                                                                     | 是否必须           |
| :----------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `def validate(self, validator: UDFParameterValidator):`                                    | 在初始化方法`before_start`调用前执行，用于检测`UDFParameters`中用户输入的参数是否合法。                                                                                                                                                                                                                                  | 否                 |
| `def before_start( self, parameters: UDFParameters, configurations: UDTFConfigurations ):` | 初始化方法，在 UDTF 处理输入数据前，调用用户自定义的初始化行为。用户每执行一次 UDTF 查询，框架就会构造一个新的 UDF 类实例，该方法在每个 UDF 类实例被初始化时调用一次。在每一个 UDF 类实例的生命周期内，该方法只会被调用一次。                                                                                            | 是                 |
| `def transform_row(self, row: Row, collector: PointCollector):`                            | 这个方法由框架调用。当您在`before_start`中选择以`RowByRowAccessStrategy`的策略消费原始数据时，这个数据处理方法就会被调用。输入参数以`Row`的形式传入，输出结果通过`PointCollector`输出。您需要在该方法内自行调用`collector`提供的数据收集方法，以决定最终的输出数据。                                                     | 与下面的方法二选一 |
| `def transform_window(self, row_window: RowWindow, collector: PointCollector):`            | 这个方法由框架调用。当您在`before_start`中选择以`SlidingSizeWindowAccessStrategy`或者`SlidingTimeWindowAccessStrategy`的策略消费原始数据时，这个数据处理方法就会被调用。输入参数以`RowWindow`的形式传入，输出结果通过`PointCollector`输出。您需要在该方法内自行调用`collector`提供的数据收集方法，以决定最终的输出数据。 | 与上面的方法二选一 |
| `def terminate(self, collector: PointCollector):`                                          | 这个方法由框架调用。该方法会在所有的`transform`调用执行完成后，在`before_destory`方法执行前被调用。在一个 UDF 查询过程中，该方法会且只会调用一次。您需要在该方法内自行调用`collector`提供的数据收集方法，以决定最终的输出数据。                                                                                          | 否                 |
| `def before_destroy(self): `                                                               | UDTF 的结束方法。此方法由框架调用，并且只会被调用一次，即在处理完最后一条记录之后被调用。                                                                                                                                                                                                                                | 否                 |

Python 版 UDF 接口语意和使用方式与 Java 版本 UDF 保持一致，具体可参考[Java UDF 使用方式](User-Defined-Function.md)。

## 数据类型映射
| IoTDB 中的数据类型 | Python UDF 中的数据类型 |
|--------------|-------------------|
| BOOLEAN      | Boolean           |
| INT32        | Integer           |
| INT64        | BigInteger        |
| FLOAT        | Float             |
| DOUBLE       | Float             |
| TEXT         | Text              |
| LONG         | BigInteger        |

## UDF 注册

注册一个 UDF 可以按如下流程进行：

1. 实现一个完整的 UDF 类，假定这个类的存储在 DataNode 服务器的 `/home/iotdb/udf/udf.py` 路径下
2. 使用以下 SQL 语句注册 UDF

```sql
CREATE FUNCTION <UDF-NAME> AS <UDF-FILE-PATH> LANGUAGE PYTHON
```

例如：
    
```sql  
CREATE FUNCTION udf1 AS '/home/iotdb/udf/udf.py' LANGUAGE PYTHON
```

### 注意

由于 IoTDB 的 Python UDF 是借用 Java 反射技术动态装载的，因此您在装载过程中无需启停服务器。

UDF 函数名称是大小写不敏感的。

请不要给 UDF 函数注册一个内置函数的名字。使用内置函数的名字给 UDF 注册会失败。

## UDF 卸载

卸载 UDF 的 SQL 语法如下：

```sql
DROP FUNCTION <UDF-NAME>
```

例如：

```sql
DROP FUNCTION udf1
```

## UDF 查询

UDF 的使用方法与普通内建函数的类似。

### 支持的基础 SQL 语法

* `SLIMIT` / `SOFFSET`
* `LIMIT` / `OFFSET`
* 支持值过滤
* 支持时间过滤

### 带 * 查询

假定现在有时间序列 `root.sg.d1.s1`和 `root.sg.d1.s2`。

* **执行`SELECT example(*) from root.sg.d1`**

那么结果集中将包括`example(root.sg.d1.s1)`和`example(root.sg.d1.s2)`的结果。

* **执行`SELECT example(s1, *) from root.sg.d1`**

那么结果集中将包括`example(root.sg.d1.s1, root.sg.d1.s1)`和`example(root.sg.d1.s1, root.sg.d1.s2)`的结果。

* **执行`SELECT example(*, *) from root.sg.d1`**

那么结果集中将包括`example(root.sg.d1.s1, root.sg.d1.s1)`，`example(root.sg.d1.s2, root.sg.d1.s1)`，`example(root.sg.d1.s1, root.sg.d1.s2)` 和 `example(root.sg.d1.s2, root.sg.d1.s2)`的结果。

### 带自定义输入参数的查询

您可以在进行 UDF 查询的时候，向 UDF 传入任意数量的键值对参数。键值对中的键和值都需要被单引号或者双引号引起来。注意，键值对参数只能在所有时间序列后传入。下面是一组例子：

```sql
SELECT example(s1, 'key1'='value1', 'key2'='value2'), example(*, 'key3'='value3') FROM root.sg.d1;
SELECT example(s1, s2, 'key1'='value1', 'key2'='value2') FROM root.sg.d1;
```

### 与其他查询的嵌套查询

```sql
SELECT s1, s2, example(s1, s2) FROM root.sg.d1;
SELECT *, example(*) FROM root.sg.d1 DISABLE ALIGN;
SELECT s1 * example(* / s1 + s2) FROM root.sg.d1;
SELECT s1, s2, s1 + example(s1, s2), s1 - example(s1 + example(s1, s2) / s2) FROM root.sg.d1;
```

## 查看所有注册的 UDF

```sql
SHOW FUNCTIONS
```

## 用户权限管理

用户在使用 UDF 时会涉及到 3 种权限：

* `CREATE_FUNCTION`：具备该权限的用户才被允许执行 UDF 注册操作
* `DROP_FUNCTION`：具备该权限的用户才被允许执行 UDF 卸载操作
* `READ_TIMESERIES`：具备该权限的用户才被允许使用 UDF 进行查询

更多用户权限相关的内容，请参考 [权限管理语句](../Administration-Management/Administration.md)。
