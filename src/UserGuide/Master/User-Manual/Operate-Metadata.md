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

# 元数据操作
## 数据库管理

数据库（Database）可以被视为关系数据库中的Database。

### 创建数据库

我们可以根据存储模型建立相应的数据库。如下所示：

```
IoTDB > CREATE DATABASE root.ln
```

需要注意的是，database 的父子节点都不能再设置 database。例如在已经有`root.ln`和`root.sgcc`这两个 database 的情况下，创建`root.ln.wf01` database 是不可行的。系统将给出相应的错误提示，如下所示：

```
IoTDB> CREATE DATABASE root.ln.wf01
Msg: 300: root.ln has already been created as database.
```
Database 节点名只支持中英文字符、数字、下划线的组合，如果想设置为纯数字或者包含其他字符，需要用反引号(``)把 database 名称引起来。

还需注意，如果在 Windows 系统上部署，database 名是大小写不敏感的。例如同时创建`root.ln` 和 `root.LN` 是不被允许的。

### 删除数据库

用户可以使用`DELETE DATABASE <PathPattern>`语句删除该路径模式匹配的所有的数据库。在删除的过程中，需要注意的是数据库的数据也会被删除。

```
IoTDB > DELETE DATABASE root.ln
// 删除所有数据，时间序列以及数据库
IoTDB > DELETE DATABASE root.**
```

### 查看数据库

在 database 创建后，我们可以使用 [SHOW DATABASES](../Reference/SQL-Reference.md) 语句和 [SHOW DATABASES \<PathPattern>](../Reference/SQL-Reference.md) 来查看 database，SQL 语句如下所示：

```
IoTDB> show databases
IoTDB> show databases root.*
```

执行结果为：

```
+-------------+----+-------------------------+-----------------------+-----------------------+
|     database| ttl|schema_replication_factor|data_replication_factor|time_partition_interval|
+-------------+----+-------------------------+-----------------------+-----------------------+
|    root.sgcc|null|                        2|                      2|                 604800|
|      root.ln|null|                        2|                      2|                 604800|
+-------------+----+-------------------------+-----------------------+-----------------------+
Total line number = 2
It costs 0.060s
```

### 统计数据库数量

用户可以使用`COUNT DATABASES`语句统计数据库的数量

SQL 语句如下所示：

```
IoTDB> count databases
IoTDB> count databases root.sgcc.*
```

执行结果为：

```

+-------------+
|     Database|
+-------------+
|            3|
+-------------+
Total line number = 1
It costs 0.003s

+-------------+
|     Database|
+-------------+
|            0|
+-------------+
Total line number = 1
It costs 0.002s
```

### TTL

IoTDB 支持对 database 级别设置数据存活时间（TTL），这使得 IoTDB 可以定期、自动地删除一定时间之前的数据。合理使用 TTL
可以帮助您控制 IoTDB 占用的总磁盘空间以避免出现磁盘写满等异常。并且，随着文件数量的增多，查询性能往往随之下降，
内存占用也会有所提高。及时地删除一些较老的文件有助于使查询性能维持在一个较高的水平和减少内存资源的占用。

TTL的默认单位为毫秒，如果配置文件中的时间精度修改为其他单位，设置ttl时仍然使用毫秒单位。

#### 设置 TTL

设置 TTL 的 SQL 语句如下所示：
```
IoTDB> set ttl to root.ln 3600000
```
这个例子表示在`root.ln`数据库中，只有3600000毫秒，即最近一个小时的数据将会保存，旧数据会被移除或不可见。
```
IoTDB> set ttl to root.sgcc.** 3600000
```
支持给某一路径下的 database 设置TTL，这个例子表示`root.sgcc`路径下的所有 database 设置TTL。

#### 取消 TTL

取消 TTL 的 SQL 语句如下所示：

```
IoTDB> unset ttl to root.ln
```

取消设置 TTL 后， database `root.ln`中所有的数据都会被保存。
```
IoTDB> unset ttl to root.sgcc.**
```

取消设置`root.sgcc`路径下的所有 database 的 TTL 。


#### 显示 TTL

显示 TTL 的 SQL 语句如下所示：

```
IoTDB> SHOW ALL TTL
IoTDB> SHOW TTL ON StorageGroupNames
```

SHOW ALL TTL 这个例子会给出所有 database 的 TTL。

## 元数据模版管理

IoTDB 支持元数据模板功能，实现同类型不同实体的物理量元数据共享，减少元数据内存占用，同时简化同类型实体的管理。

注：以下语句中的 `schema` 关键字可以省略。

### 创建元数据模板

创建元数据模板的 SQL 语法如下：

```sql
CREATE SCHEMA TEMPLATE <templateName> ALIGNED? '(' <measurementId> <attributeClauses> [',' <measurementId> <attributeClauses>]+ ')'
```

**示例1：** 创建包含两个非对齐序列的元数据模板

```shell
IoTDB> create schema template t1 (temperature FLOAT encoding=RLE, status BOOLEAN encoding=PLAIN compression=SNAPPY)
```

**示例2：** 创建包含一组对齐序列的元数据模板

```shell
IoTDB> create schema template t2 aligned (lat FLOAT encoding=Gorilla, lon FLOAT encoding=Gorilla)
```

其中，物理量 `lat` 和 `lon` 是对齐的。

### 挂载元数据模板

元数据模板在创建后，需执行挂载操作，方可用于相应路径下的序列创建与数据写入。

**挂载模板前，需确保相关数据库已经创建。**

**推荐将模板挂载在 database 节点上，不建议将模板挂载到 database 上层的节点上。**

挂载元数据模板的 SQL 语句如下所示：

```shell
IoTDB> set schema template t1 to root.sg1.d1
```

### 创建同时挂载元数据模版

元数据模版也可在创建的同时挂载

```shell
IoTDB> create device template t1(s1 int, s2 float)  on root.sg1
```

### 卸载元数据模板

卸载元数据模板的 SQL 语句如下所示：

```shell
IoTDB> unset schema template t1 from root.sg1.d1
```

**注意**：不支持卸载仍处于激活状态的模板，需保证执行卸载操作前解除对该模板的所有使用，即删除所有该模板表示的序列。

### 删除元数据模板

删除元数据模板的 SQL 语句如下所示：

```shell
IoTDB> drop schema template t1
```

**注意**：不支持删除已经挂载的模板，需在删除操作前保证该模板卸载成功。


### 查看元数据模板

- 查看所有元数据模板

SQL 语句如下所示：

```shell
IoTDB> show schema templates
```

执行结果如下：
```shell
+-------------+
|template name|
+-------------+
|           t2|
|           t1|
+-------------+
```

- 查看某个元数据模板下的物理量

SQL 语句如下所示：

```shell
IoTDB> show nodes in schema template t1
```

执行结果如下：
```shell
+-----------+--------+--------+-----------+
|child nodes|dataType|encoding|compression|
+-----------+--------+--------+-----------+
|temperature|   FLOAT|     RLE|     SNAPPY|
|     status| BOOLEAN|   PLAIN|     SNAPPY|
+-----------+--------+--------+-----------+
```

- 查看挂载了某个元数据模板的路径

```shell
IoTDB> show paths set schema template t1
```

执行结果如下：
```shell
+-----------+
|child paths|
+-----------+
|root.sg1.d1|
+-----------+
```

- 查看使用了某个元数据模板的路径（即模板在该路径上已激活，序列已创建）

```shell
IoTDB> show paths using schema template t1
```

执行结果如下：
```shell
+-----------+
|child paths|
+-----------+
|root.sg1.d1|
+-----------+
```


## 时间序列管理

### 创建非对齐序列

根据建立的数据模型，我们可以分别在两个存储组中创建相应的时间序列。创建时间序列的 SQL 语句如下所示：

```
IoTDB > CREATE TIMESERIES root.ln.wf01.wt01.status WITH DATATYPE=BOOLEAN, ENCODING=PLAIN
IoTDB > CREATE TIMESERIES root.ln.wf01.GPS(latitude FLOAT ENCODING=PLAIN COMPRESSOR=SNAPPY, longitude FLOAT ENCODING=PLAIN COMPRESSOR=SNAPPY)
```

从 v0.13 起，可以使用简化版的 SQL 语句创建时间序列：

```
IoTDB > create timeseries root.ln.wf01.wt01.status BOOLEAN encoding=PLAIN
IoTDB > create timeseries root.ln.wf01.wt01.temperature FLOAT encoding=RLE
IoTDB > create timeseries root.ln.wf02.wt02.hardware TEXT encoding=PLAIN
IoTDB > create timeseries root.ln.wf02.wt02.status BOOLEAN encoding=PLAIN
IoTDB > create timeseries root.sgcc.wf03.wt01.status BOOLEAN encoding=PLAIN
IoTDB > create timeseries root.sgcc.wf03.wt01.temperature FLOAT encoding=RLE
```

需要注意的是，当创建时间序列时指定的编码方式与数据类型不对应时，系统会给出相应的错误提示，如下所示：
```
IoTDB> create timeseries root.ln.wf02.wt02.status WITH DATATYPE=BOOLEAN, ENCODING=TS_2DIFF
error: encoding TS_2DIFF does not support BOOLEAN
```

详细的数据类型与编码方式的对应列表请参见 [编码方式](../Data-Concept/Encoding.md)。

### 创建对齐时间序列

创建一组对齐时间序列的SQL语句如下所示：

```
IoTDB> CREATE ALIGNED TIMESERIES root.ln.wf01.wt01.status WITH DATATYPE=BOOLEAN, ENCODING=PLAIN
IoTDB> CREATE ALIGNED TIMESERIES root.ln.wf01.GPS(latitude FLOAT ENCODING=PLAIN COMPRESSOR=SNAPPY, longitude FLOAT ENCODING=PLAIN COMPRESSOR=SNAPPY)
```

一组对齐序列中的序列可以有不同的数据类型、编码方式以及压缩方式。

对齐的时间序列也支持设置别名、标签、属性。

### 使用元数据模版创建时间序列

使用元数据模版创建时间序列的SQL语句如下所示：
```
IoTDB> create timeseries using DEVICE TEMPLATE on root.sg1.d1
```

### 查看时间序列

* SHOW LATEST? TIMESERIES pathPattern? whereClause? limitClause?

  SHOW TIMESERIES 中可以有四种可选的子句，查询结果为这些时间序列的所有信息

时间序列信息具体包括：时间序列路径名，database，Measurement 别名，数据类型，编码方式，压缩方式，属性和标签。

示例：

* SHOW TIMESERIES

  展示系统中所有的时间序列信息

* SHOW TIMESERIES <`Path`>

  返回给定路径的下的所有时间序列信息。其中 `Path` 需要为一个时间序列路径或路径模式。例如，分别查看`root`路径和`root.ln`路径下的时间序列，SQL 语句如下所示：

```
IoTDB> show timeseries root.ln.**
```

执行结果为：

```
+-----------------------------+-----+-------------+--------+--------+-----------+----+----------+--------+-------------------+
|                   timeseries|alias|     database|dataType|encoding|compression|tags|attributes|deadband|deadband parameters|
+-----------------------------+-----+-------------+--------+--------+-----------+----+----------+--------+-------------------+
|   root.ln.wf02.wt02.hardware| null|      root.ln|    TEXT|   PLAIN|     SNAPPY|null|      null|    null|               null|
|     root.ln.wf02.wt02.status| null|      root.ln| BOOLEAN|   PLAIN|     SNAPPY|null|      null|    null|               null|
|root.ln.wf01.wt01.temperature| null|      root.ln|   FLOAT|     RLE|     SNAPPY|null|      null|    null|               null|
|     root.ln.wf01.wt01.status| null|      root.ln| BOOLEAN|   PLAIN|     SNAPPY|null|      null|    null|               null|
+-----------------------------+-----+-------------+--------+--------+-----------+----+----------+--------+-------------------+
Total line number = 4
It costs 0.004s
```

```
show timeseries root.ln.** limit 10 offset 10
```

* SHOW LATEST TIMESERIES

  表示查询出的时间序列需要按照最近插入时间戳降序排列
  

需要注意的是，当查询路径不存在时，系统会返回 0 条时间序列。

### 删除时间序列

我们可以使用`(DELETE | DROP) TimeSeries <PathPattern>`语句来删除我们之前创建的时间序列。SQL 语句如下所示：

```
IoTDB> delete timeseries root.ln.wf01.wt01.status
IoTDB> delete timeseries root.ln.wf02.*
```

### 统计时间序列数量

IoTDB 支持使用`COUNT TIMESERIES<Path>`来统计一条路径中的时间序列个数。SQL 语句如下所示：
```
IoTDB > COUNT TIMESERIES root.**
```

除此之外，还可以通过定义`LEVEL`来统计指定层级下的时间序列个数。这条语句可以用来统计每一个设备下的传感器数量，语法为：`COUNT TIMESERIES <Path> GROUP BY LEVEL=<INTEGER>`。

例如有如下时间序列（可以使用`show timeseries`展示所有时间序列）：

```
+-------------------------------+--------+-------------+--------+--------+-----------+-------------------------------------------+--------------------------------------------------------+--------+-------------------+
|                     timeseries|   alias|     database|dataType|encoding|compression|                                       tags|                                              attributes|deadband|deadband parameters|
+-------------------------------+--------+-------------+--------+--------+-----------+-------------------------------------------+--------------------------------------------------------+--------+-------------------+
|root.sgcc.wf03.wt01.temperature|    null|    root.sgcc|   FLOAT|     RLE|     SNAPPY|                                       null|                                                    null|    null|               null|
|     root.sgcc.wf03.wt01.status|    null|    root.sgcc| BOOLEAN|   PLAIN|     SNAPPY|                                       null|                                                    null|    null|               null|
|             root.turbine.d1.s1|newAlias| root.turbine|   FLOAT|     RLE|     SNAPPY|{"newTag1":"newV1","tag4":"v4","tag3":"v3"}|{"attr2":"v2","attr1":"newV1","attr4":"v4","attr3":"v3"}|    null|               null|
|     root.ln.wf02.wt02.hardware|    null|      root.ln|    TEXT|   PLAIN|     SNAPPY|                               {"unit":"c"}|                                                    null|    null|               null|
|       root.ln.wf02.wt02.status|    null|      root.ln| BOOLEAN|   PLAIN|     SNAPPY|                    {"description":"test1"}|                                                    null|    null|               null|
|  root.ln.wf01.wt01.temperature|    null|      root.ln|   FLOAT|     RLE|     SNAPPY|                                       null|                                                    null|    null|               null|
|       root.ln.wf01.wt01.status|    null|      root.ln| BOOLEAN|   PLAIN|     SNAPPY|                                       null|                                                    null|    null|               null|
+-------------------------------+--------+-------------+--------+--------+-----------+-------------------------------------------+--------------------------------------------------------+--------+-------------------+
Total line number = 7
It costs 0.004s
```

那么 Metadata Tree 如下所示：

<img style="width:100%; max-width:600px; margin-left:auto; margin-right:auto; display:block;" src="https://alioss.timecho.com/docs/img/github/69792176-1718f400-1201-11ea-861a-1a83c07ca144.jpg">

可以看到，`root`被定义为`LEVEL=0`。那么当你输入如下语句时：

```
IoTDB > COUNT TIMESERIES root.** GROUP BY LEVEL=1
```

你将得到以下结果：

```
IoTDB> COUNT TIMESERIES root.** GROUP BY LEVEL=1
+------------+-----------------+
|      column|count(timeseries)|
+------------+-----------------+
|   root.sgcc|                2|
|root.turbine|                1|
|     root.ln|                4|
+------------+-----------------+
Total line number = 3
It costs 0.002s

```

> 注意：时间序列的路径只是过滤条件，与 level 的定义无关。

## 路径查询

### 查看路径的所有子路径

```
SHOW CHILD PATHS pathPattern
```

可以查看此路径模式所匹配的所有路径的下一层的所有路径和它对应的节点类型，即pathPattern.*所匹配的路径及其节点类型。

节点类型：ROOT -> SG INTERNAL -> DATABASE -> INTERNAL -> DEVICE -> TIMESERIES

示例：

* 查询 root.ln 的下一层：show child paths root.ln

```
+------------+----------+
| child paths|node types|
+------------+----------+
|root.ln.wf01|  INTERNAL|
|root.ln.wf02|  INTERNAL|
+------------+----------+
Total line number = 2
It costs 0.002s
```

### 查看路径的下一级节点

```
SHOW CHILD NODES pathPattern
```

可以查看此路径模式所匹配的节点的下一层的所有节点。

示例：


* 查询 root.ln 的下一层 ：show child nodes root.ln

```
+------------+
| child nodes|
+------------+
|        wf01|
|        wf02|
+------------+
```

### 查看路径的设备节点

* SHOW DEVICES pathPattern? (WITH DATABASE)? limitClause? #showDevices

与 `Show Timeseries` 相似，IoTDB 目前也支持两种方式查看设备。

* `SHOW DEVICES` 语句显示当前所有的设备信息，等价于 `SHOW DEVICES root.**`。
* `SHOW DEVICES <PathPattern>` 语句规定了 `PathPattern`，返回给定的路径模式所匹配的设备信息。

SQL 语句如下所示：

```
IoTDB> show devices root.ln.**
```

你可以获得如下数据：

```

+-----------------+---------+
|          devices|isAligned|
+-----------------+---------+
|root.ln.wf01.wt01|    false|
|root.ln.wf02.wt02|    false|
+-----------------+---------+
Total line number = 2
It costs 0.001s
```

其中，`isAligned`表示该设备下的时间序列是否对齐。

查看设备及其 database 信息，可以使用 `SHOW DEVICES WITH DATABASE` 语句。

* `SHOW DEVICES WITH DATABASE` 语句显示当前所有的设备信息和其所在的 database，等价于 `SHOW DEVICES root.**`。
* `SHOW DEVICES <PathPattern> WITH DATABASE` 语句规定了 `PathPattern`，返回给定的路径模式所匹配的设备信息和其所在的 database。

SQL 语句如下所示：

```
IoTDB> show devices with database
IoTDB> show devices root.ln.** with database
```

你可以获得如下数据：

```
+-------------------+-------------+---------+
|            devices|     database|isAligned|
+-------------------+-------------+---------+
|  root.ln.wf01.wt01|      root.ln|    false|
|  root.ln.wf02.wt02|      root.ln|    false|
|root.sgcc.wf03.wt01|    root.sgcc|    false|
|    root.turbine.d1| root.turbine|    false|
+-------------------+-------------+---------+
Total line number = 4
It costs 0.003s

+-----------------+-------------+---------+
|          devices|     database|isAligned|
+-----------------+-------------+---------+
|root.ln.wf01.wt01|      root.ln|    false|
|root.ln.wf02.wt02|      root.ln|    false|
+-----------------+-------------+---------+
Total line number = 2
It costs 0.001s
```

### 统计路径下的节点数量

IoTDB 支持使用`COUNT NODES <PathPattern> LEVEL=<INTEGER>`来统计当前 Metadata
 树下满足某路径模式的路径中指定层级的节点个数。这条语句可以用来统计带有特定采样点的设备数。例如：

```
IoTDB > COUNT NODES root.** LEVEL=2
IoTDB > COUNT NODES root.ln.wf01.* LEVEL=3
```

对于上面提到的例子和 Metadata Tree，你可以获得如下结果：

```
+------------+
|count(nodes)|
+------------+
|           4|
+------------+
Total line number = 1
It costs 0.003s


+------------+
|count(nodes)|
+------------+
|           1|
+------------+
Total line number = 1
It costs 0.002s


```

> 注意：时间序列的路径只是过滤条件，与 level 的定义无关。

### 统计设备数量

* COUNT DEVICES \<PathPattern\>

上述语句用于统计设备的数量，同时允许指定`PathPattern` 用于统计匹配该`PathPattern` 的设备数量

SQL 语句如下所示：

```
IoTDB> count devices
IoTDB> count devices root.ln.**
```

你可以获得如下数据：

```

+--------------+
|count(devices)|
+--------------+
|             4|
+--------------+
Total line number = 1
It costs 0.004s

+--------------+
|count(devices)|
+--------------+
|             2|
+--------------+
Total line number = 1
It costs 0.004s
```