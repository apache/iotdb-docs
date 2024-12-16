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

更多用户权限相关的内容，请参考 [权限管理语句](./Authority-Management.md##权限管理)。


## 4. UDF 函数库

基于用户自定义函数能力，IoTDB 提供了一系列关于时序数据处理的函数，包括数据质量、数据画像、异常检测、 频域分析、数据匹配、数据修复、序列发现、机器学习等，能够满足工业领域对时序数据处理的需求。

可以参考 [UDF 函数库](../SQL-Manual/UDF-Libraries_timecho.md)文档，查找安装步骤及每个函数对应的注册语句，以确保正确注册所有需要的函数。

##  5. 常见问题：

1. 如何修改已经注册的 UDF？

答：假设 UDF 的名称为`example`，全类名为`org.apache.iotdb.udf.UDTFExample`，由`example.jar`引入

1. 首先卸载已经注册的`example`函数，执行`DROP FUNCTION example`
2. 删除 `iotdb-server-1.0.0-all-bin/ext/udf` 目录下的`example.jar`
3. 修改`org.apache.iotdb.udf.UDTFExample`中的逻辑，重新打包，JAR 包的名字可以仍然为`example.jar`
4. 将新的 JAR 包上传至 `iotdb-server-1.0.0-all-bin/ext/udf` 目录下
5. 装载新的 UDF，执行`CREATE FUNCTION example AS "org.apache.iotdb.udf.UDTFExample"`