#  用户自定义函数

## UDF 介绍

UDF（User Defined Function）即用户自定义函数，IoTDB 提供多种内建的面向时序处理的函数，也支持扩展自定义函数来满足更多的计算需求。

根据此文档，将很快学会 UDF 的编写、注册、使用等操作。

## UDF 使用方式

### UDF 类型

IoTDB 支持两种类型的 UDF 函数，如下表所示。

| UDF 分类                                            | 描述                                                         |
| --------------------------------------------------- | ------------------------------------------------------------ |
| UDTF（User Defined Timeseries Generating Function） | 自定义时间序列生成函数。该类函数允许接收多条时间序列，最终会输出一条时间序列，生成的时间序列可以有任意多数量的数据点。 |
| UDAF（User Defined Aggregation Function）           | 自定义聚合函数。该类函数接受多条时间序列数据，最终会根据用户指定的 GROUP BY 类型，为每个组生成一个聚合后的数据点。 |

###  UDF 注册

注册一个 UDF 可以按如下流程进行：

1. 实现一个完整的 UDF 类，假定这个类的全类名为`org.apache.iotdb.udf.UDTFExample`
2. 将项目打成 JAR 包，如果使用 Maven 管理项目，可以参考 [Maven 项目示例](https://github.com/apache/iotdb/tree/master/example/udf)的写法
3. 进行注册前的准备工作，根据注册方式的不同需要做不同的准备，具体可参考以下例子
4. 使用以下 SQL 语句注册 UDF

```sql
CREATE FUNCTION <UDF-NAME> AS <UDF-CLASS-FULL-PATHNAME> (USING URI URI-STRING)
```

####  示例：注册名为`example`的 UDF，以下两种注册方式任选其一即可

####  方式一：不指定URI

准备工作：  
使用该种方式注册时，需要提前将 JAR 包放置到目录 `iotdb-server-1.X.X-all-bin/ext/udf`（该目录可配置） 下。  
**注意，如果使用的是集群，那么需要将 JAR 包放置到所有 DataNode 的该目录下**  

注册语句：

```sql
CREATE FUNCTION example AS 'org.apache.iotdb.udf.UDTFExample'
```

####  方式二：指定URI

准备工作：  
使用该种方式注册时，需要提前将 JAR 包上传到 URI 服务器上并确保执行注册语句的 IoTDB 实例能够访问该 URI 服务器。  
**注意，无需手动放置 JAR 包，IoTDB 会下载 JAR 包并正确同步到整个集群**

注册语句：

```sql
CREATE FUNCTION example AS 'org.apache.iotdb.udf.UDTFExample' USING URI 'http://jar/example.jar'
```

####  注意

1. 由于 IoTDB 的 UDF 是通过反射技术动态装载的，因此在装载过程中无需启停服务器。

2. UDF 函数名称是大小写不敏感的。

3. 请不要给 UDF 函数注册一个内置函数的名字。使用内置函数的名字给 UDF 注册会失败。

4. 不同的 JAR 包中最好不要有全类名相同但实现功能逻辑不一样的类。例如 UDF(UDAF/UDTF)：`udf1`、`udf2`分别对应资源`udf1.jar`、`udf2.jar`。如果两个 JAR 包里都包含一个`org.apache.iotdb.udf.UDTFExample`类，当同一个 SQL 中同时使用到这两个 UDF 时，系统会随机加载其中一个类，导致 UDF 执行行为不一致。

###  UDF 卸载

SQL 语法如下：

```sql
DROP FUNCTION <UDF-NAME>
```

示例：卸载上述例子的 UDF：

```sql
DROP FUNCTION example
```

###  UDF 查询

UDF 的使用方法与普通内建函数的类似。

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

###  查看所有注册的 UDF

``` sql
SHOW FUNCTIONS
```

###  用户权限管理

用户在使用 UDF 时会涉及到 1 种权限：`USE_UDF`

* 具备该权限的用户才被允许执行 UDF 注册操作
* 具备该权限的用户才被允许执行 UDF 卸载操作
* 具备该权限的用户才被允许使用 UDF 进行查询

更多用户权限相关的内容，请参考 [权限管理语句](./Authority-Management.md##权限管理)。

###  配置项

使用配置项 `udf_lib_dir` 来配置 udf 的存储目录.  
在 SQL 语句中使用自定义函数时，可能提示内存不足。这种情况下，可以通过更改配置文件`iotdb-common.properties`中的`udf_initial_byte_array_length_for_memory_control`，`udf_memory_budget_in_mb`和`udf_reader_transformer_collector_memory_proportion`并重启服务来解决此问题。

###  贡献 UDF

该部分主要讲述了外部用户如何将自己编写的 UDF 贡献给 IoTDB 社区。

####  前提条件

1. UDF 具有通用性。

    通用性主要指的是：UDF 在某些业务场景下，可以被广泛使用。换言之，就是 UDF 具有复用价值，可被社区内其他用户直接使用。

    如果不确定自己写的 UDF 是否具有通用性，可以发邮件到 `dev@iotdb.apache.org` 或直接创建 ISSUE 发起讨论。

2. UDF 已经完成测试，且能够正常运行在用户的生产环境中。

####  贡献清单

1. UDF 的源代码
2. UDF 的测试用例
3. UDF 的使用说明

####  源代码

1. 在`iotdb-core/node-commons/src/main/java/org/apache/iotdb/commons/udf/builtin`中创建 UDF 主类和相关的辅助类。
2. 在`iotdb-core/node-commons/src/main/java/org/apache/iotdb/commons/udf/builtin/BuiltinTimeSeriesGeneratingFunction.java`中注册编写的 UDF。

####  测试用例

至少需要为贡献的 UDF 编写集成测试。

可以在`integration-test/src/test/java/org/apache/iotdb/db/it/udf`中为贡献的 UDF 新增一个测试类进行测试。

####  使用说明

使用说明需要包含：UDF 的名称、UDF 的作用、执行函数必须的属性参数、函数的适用的场景以及使用示例等。

使用说明需包含中英文两个版本。应分别在 `docs/zh/UserGuide/Operation Manual/DML Data Manipulation Language.md` 和 `docs/UserGuide/Operation Manual/DML Data Manipulation Language.md` 中新增使用说明。

####  提交 PR

当准备好源代码、测试用例和使用说明后，就可以将 UDF 贡献到 IoTDB 社区了。在 [Github](https://github.com/apache/iotdb) 上面提交 Pull Request (PR) 即可。具体提交方式见：[贡献指南](https://iotdb.apache.org/zh/Community/Development-Guide.html)。

当 PR 评审通过并被合并后， UDF 就已经贡献给 IoTDB 社区了！

## UDF 函数库

可以参考 [UDF 函数库](../Reference/UDF-Libraries.md)文档，查找安装步骤及每个函数对应的注册语句，以确保正确注册所有需要的函数。

## UDF 开发流程

可以参考 UDF函数开发：[开发指导](../Reference/UDF-development.md)

##  常见问题：

1. 如何修改已经注册的 UDF？

答：假设 UDF 的名称为`example`，全类名为`org.apache.iotdb.udf.UDTFExample`，由`example.jar`引入

1. 首先卸载已经注册的`example`函数，执行`DROP FUNCTION example`
2. 删除 `iotdb-server-1.0.0-all-bin/ext/udf` 目录下的`example.jar`
3. 修改`org.apache.iotdb.udf.UDTFExample`中的逻辑，重新打包，JAR 包的名字可以仍然为`example.jar`
4. 将新的 JAR 包上传至 `iotdb-server-1.0.0-all-bin/ext/udf` 目录下
5. 装载新的 UDF，执行`CREATE FUNCTION example AS "org.apache.iotdb.udf.UDTFExample"`