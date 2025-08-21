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

# 测点管理 

## 1. 数据库管理

数据库（Database）可以被视为关系数据库中的Database。

### 1.1 创建数据库

我们可以根据存储模型建立相应的数据库。如下所示：

```
IoTDB > CREATE DATABASE root.ln
```

需要注意的是，推荐创建一个 database. 

Database 的父子节点都不能再设置 database。例如在已经有`root.ln`和`root.sgcc`这两个 database 的情况下，创建`root.ln.wf01` database 是不可行的。系统将给出相应的错误提示，如下所示：

```
IoTDB> CREATE DATABASE root.ln.wf01
Msg: 300: root.ln has already been created as database.
```
Database 节点名命名规则:
1. 节点名可由**中英文字符、数字、下划线（\_）、英文句号（.）、反引号（\`）** 组成
2. 若节点名为以下情况，则必须用**反引号（\`）** 将整个名称包裹。
   - 纯数字（如 12345） 
   - 含有特殊字符（如 . 或 \_）并可能引发歧义的名称（如 db.01、\_temp）
3. 反引号的特殊处理：
   若节点名本身需要包含反引号（\`），则需用**两个反引号（\`\`）** 表示一个反引号。例如：命名为\`db123\`\`（本身包含一个反引号），需写为 \`db123\`\`\`。

还需注意，如果在 Windows 系统上部署，database 名是大小写不敏感的。例如同时创建`root.ln` 和 `root.LN` 是不被允许的。

### 1.2 查看数据库

在 database 创建后，我们可以使用 [SHOW DATABASES](../SQL-Manual/SQL-Manual.md#查看数据库) 语句和 [SHOW DATABASES \<PathPattern>](../SQL-Manual/SQL-Manual.md#查看数据库) 来查看 database，SQL 语句如下所示：

```
IoTDB> show databases
IoTDB> show databases root.*
IoTDB> show databases root.**
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

### 1.3 删除数据库

用户可以使用`DELETE DATABASE <PathPattern>`语句删除该路径模式匹配的所有的数据库。在删除的过程中，需要注意的是数据库的数据也会被删除。

```
IoTDB > DELETE DATABASE root.ln
IoTDB > DELETE DATABASE root.sgcc
// 删除所有数据，时间序列以及数据库
IoTDB > DELETE DATABASE root.**
```

### 1.4 统计数据库数量

用户可以使用`COUNT DATABASES <PathPattern>`语句统计数据库的数量，允许指定`PathPattern` 用来统计匹配该`PathPattern` 的数据库的数量

SQL 语句如下所示：

```
IoTDB> show databases
IoTDB> count databases
IoTDB> count databases root.*
IoTDB> count databases root.sgcc.*
IoTDB> count databases root.sgcc
```

执行结果为：

```
+-------------+
|     database|
+-------------+
|    root.sgcc|
| root.turbine|
|      root.ln|
+-------------+
Total line number = 3
It costs 0.003s

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
|            3|
+-------------+
Total line number = 1
It costs 0.002s

+-------------+
|     Database|
+-------------+
|            0|
+-------------+
Total line number = 1
It costs 0.002s

+-------------+
|     database|
+-------------+
|            1|
+-------------+
Total line number = 1
It costs 0.002s
```

### 1.5 数据保留时间（TTL）

IoTDB 支持对 device 级别设置数据保留时间（TTL），这使得 IoTDB 可以定期、自动地删除一定时间之前的数据。合理使用 TTL可以帮助您控制 IoTDB 占用的总磁盘空间以避免出现磁盘写满等异常。并且，随着文件数量的增多，查询性能往往随之下降，内存占用也会有所提高。及时地删除一些较老的文件有助于使查询性能维持在一个较高的水平和减少内存资源的占用。

TTL的默认单位为毫秒，如果配置文件中的时间精度修改为其他单位，设置ttl时仍然使用毫秒单位。

当设置 TTL 时，系统会根据设置的路径寻找所包含的所有 device，并为这些 device 设置 TTL 时间，系统会按设备粒度对过期数据进行删除。请注意，此处是否过期判断依据的是数据点时间，不是写入时间。
当设备数据过期后，将不能被查询到，但磁盘文件中的数据不能保证立即删除（会在一定时间内删除），但可以保证最终被删除。
考虑到操作代价，系统不会立即物理删除超过 TTL 的数据，而是通过合并来延迟地物理删除。因此，在数据被物理删除前，如果调小或者解除 TTL，可能会导致之前因 TTL 而不可见的数据重新出现。
系统中仅能设置至多 1000 条 TTL 规则，达到该上限时，需要先删除部分 TTL 规则才能设置新的规则

#### TTL Path 规则
设置的路径 path 只支持前缀路径（即路径中间不能带 \* ， 且必须以 \*\* 结尾），该路径会匹配到设备，也允许用户指定不带星的 path 为具体的 database 或 device，当 path 不带 \* 时，会检查是否匹配到 database，若匹配到 database，则会同时设置 path 和 path.\*\*。
注意：设备 TTL 设置不会对元数据的存在性进行校验，即允许对一条不存在的设备设置 TTL。
```
合格的 path：
root.**
root.db.**
root.db.group1.**
root.db
root.db.group1.d1

不合格的 path：
root.*.db
root.**.db.*
root.db.*
```
#### TTL 适用规则
当一个设备适用多条TTL规则时，优先适用较精确和较长的规则。例如对于设备“root.bj.hd.dist001.turbine001”来说，规则“root.bj.hd.dist001.turbine001”比“root.bj.hd.dist001.\*\*”优先，而规则“root.bj.hd.dist001.\*\*”比“root.bj.hd.\*\*”优先；
#### 设置 TTL
set ttl 操作可以理解为设置一条 TTL规则，比如 set ttl to root.sg.group1.\*\* 就相当于对所有可以匹配到该路径模式的设备挂载 ttl。 unset ttl 操作表示对相应路径模式卸载 TTL，若不存在对应 TTL，则不做任何事。若想把 TTL 调成无限大，则可以使用 INF 关键字
设置 TTL 的 SQL 语句如下所示：
```
set ttl to pathPattern 360000;
```
pathPattern 是前缀路径，即路径中间不能带 \* 且必须以 \*\* 结尾。
pathPattern 匹配对应的设备。为了兼容老版本 SQL 语法，允许用户输入的 pathPattern 匹配到 db，则自动将前缀路径扩展为 path.\*\*。
例如，写set ttl to root.sg 360000 则会自动转化为set ttl to root.sg.\*\* 360000，转化后的语句对所有 root.sg 下的 device 设置TTL。
但若写的 pathPattern 无法匹配到 db，则上述逻辑不会生效。
如写set ttl to root.sg.group 360000 ，由于root.sg.group未匹配到 db，则不会被扩充为root.sg.group.\*\*。 也允许指定具体 device，不带 \*。
#### 取消 TTL

取消 TTL 的 SQL 语句如下所示：

```
IoTDB> unset ttl from root.ln
```

取消设置 TTL 后， `root.ln` 路径下所有的数据都会被保存。
```
IoTDB> unset ttl from root.sgcc.**
```

取消设置`root.sgcc`路径下的所有的 TTL 。
```
IoTDB> unset ttl from root.**
```

取消设置所有的 TTL 。

新语法
```
IoTDB> unset ttl from root.**
```

旧语法
```
IoTDB> unset ttl to root.**
```
新旧语法在功能上没有区别并且同时兼容，仅是新语法在用词上更符合常规。
#### 显示 TTL

显示 TTL 的 SQL 语句如下所示：
show all ttl

```
IoTDB> SHOW ALL TTL
+--------------+--------+
|          path|     TTL|
|       root.**|55555555|
| root.sg2.a.**|44440000|
+--------------+--------+
```

show ttl on pathPattern
```
IoTDB> SHOW TTL ON root.db.**;
+--------------+--------+
|          path|     TTL|
|    root.db.**|55555555|
|  root.db.a.**|44440000|
+--------------+--------+
```
SHOW ALL TTL 这个例子会给出所有的 TTL。
SHOW TTL ON pathPattern 这个例子会显示指定路径的 TTL。

显示设备的 TTL。
```
IoTDB> show devices
+---------------+---------+---------+
|         Device|IsAligned|      TTL|
+---------------+---------+---------+
|root.sg.device1|    false| 36000000|
|root.sg.device2|     true|      INF|
+---------------+---------+---------+
```
所有设备都一定会有 TTL，即不可能是 null。INF 表示无穷大。


### 1.6 设置异构数据库（进阶操作）

在熟悉 IoTDB 元数据建模的前提下，用户可以在 IoTDB 中设置异构的数据库，以便应对不同的生产需求。

目前支持的数据库异构参数有：

| 参数名                       | 参数类型    | 参数描述                      |
|---------------------------|---------|---------------------------|
| TTL                       | Long    | 数据库的 TTL                  |
| SCHEMA_REPLICATION_FACTOR | Integer | 数据库的元数据副本数                |
| DATA_REPLICATION_FACTOR   | Integer | 数据库的数据副本数                 |
| SCHEMA_REGION_GROUP_NUM   | Integer | 数据库的 SchemaRegionGroup 数量 |
| DATA_REGION_GROUP_NUM     | Integer | 数据库的 DataRegionGroup 数量   |

用户在配置异构参数时需要注意以下三点：
+ TTL 和 TIME_PARTITION_INTERVAL 必须为正整数。
+ SCHEMA_REPLICATION_FACTOR 和 DATA_REPLICATION_FACTOR 必须小于等于已部署的 DataNode 数量。
+ SCHEMA_REGION_GROUP_NUM 和 DATA_REGION_GROUP_NUM 的功能与 iotdb-common.properties 配置文件中的 
`schema_region_group_extension_policy` 和 `data_region_group_extension_policy` 参数相关，以 DATA_REGION_GROUP_NUM 为例：
若设置 `data_region_group_extension_policy=CUSTOM`，则 DATA_REGION_GROUP_NUM 将作为 Database 拥有的 DataRegionGroup 的数量；
若设置 `data_region_group_extension_policy=AUTO`，则 DATA_REGION_GROUP_NUM 将作为 Database 拥有的 DataRegionGroup 的配额下界，即当该 Database 开始写入数据时，将至少拥有此数量的 DataRegionGroup。

用户可以在创建 Database 时设置任意异构参数，或在单机/分布式 IoTDB 运行时调整部分异构参数。

#### 创建 Database 时设置异构参数

用户可以在创建 Database 时设置上述任意异构参数，SQL 语句如下所示：

```
CREATE DATABASE prefixPath (WITH databaseAttributeClause (COMMA? databaseAttributeClause)*)?
```

例如：
```
CREATE DATABASE root.db WITH SCHEMA_REPLICATION_FACTOR=1, DATA_REPLICATION_FACTOR=3, SCHEMA_REGION_GROUP_NUM=1, DATA_REGION_GROUP_NUM=2;
```

#### 运行时调整异构参数

用户可以在 IoTDB 运行时调整部分异构参数，SQL 语句如下所示：

```
ALTER DATABASE prefixPath WITH databaseAttributeClause (COMMA? databaseAttributeClause)*
```

例如：
```
ALTER DATABASE root.db WITH SCHEMA_REGION_GROUP_NUM=1, DATA_REGION_GROUP_NUM=2;
```

注意，运行时只能调整下列异构参数：
+ SCHEMA_REGION_GROUP_NUM
+ DATA_REGION_GROUP_NUM

#### 查看异构数据库

用户可以查询每个 Database 的具体异构配置，SQL 语句如下所示：

```
SHOW DATABASES DETAILS prefixPath?
```

例如：

```
IoTDB> SHOW DATABASES DETAILS
+--------+--------+-----------------------+---------------------+---------------------+--------------------+-----------------------+-----------------------+------------------+---------------------+---------------------+
|Database|     TTL|SchemaReplicationFactor|DataReplicationFactor|TimePartitionInterval|SchemaRegionGroupNum|MinSchemaRegionGroupNum|MaxSchemaRegionGroupNum|DataRegionGroupNum|MinDataRegionGroupNum|MaxDataRegionGroupNum|
+--------+--------+-----------------------+---------------------+---------------------+--------------------+-----------------------+-----------------------+------------------+---------------------+---------------------+
|root.db1|    null|                      1|                    3|            604800000|                   0|                      1|                      1|                 0|                    2|                    2|
|root.db2|86400000|                      1|                    1|            604800000|                   0|                      1|                      1|                 0|                    2|                    2|
|root.db3|    null|                      1|                    1|            604800000|                   0|                      1|                      1|                 0|                    2|                    2|
+--------+--------+-----------------------+---------------------+---------------------+--------------------+-----------------------+-----------------------+------------------+---------------------+---------------------+
Total line number = 3
It costs 0.058s
```

各列查询结果依次为：
+ 数据库名称
+ 数据库的 TTL
+ 数据库的元数据副本数
+ 数据库的数据副本数
+ 数据库的时间分区间隔
+ 数据库当前拥有的 SchemaRegionGroup 数量
+ 数据库需要拥有的最小 SchemaRegionGroup 数量
+ 数据库允许拥有的最大 SchemaRegionGroup 数量
+ 数据库当前拥有的 DataRegionGroup 数量
+ 数据库需要拥有的最小 DataRegionGroup 数量
+ 数据库允许拥有的最大 DataRegionGroup 数量


## 2. 设备模板管理

IoTDB 支持设备模板功能，实现同类型不同实体的物理量元数据共享，减少元数据内存占用，同时简化同类型实体的管理。


![img](/img/%E6%A8%A1%E6%9D%BF.png)

![img](/img/template.jpg)

### 2.1 创建设备模板

创建设备模板的 SQL 语法如下：

```sql
CREATE DEVICE TEMPLATE <templateName> ALIGNED? '(' <measurementId> <attributeClauses> [',' <measurementId> <attributeClauses>]+ ')'
```

**示例1：** 创建包含两个非对齐序列的元数据模板

```shell
IoTDB> create device template t1 (temperature FLOAT, status BOOLEAN )
```

**示例2：** 创建包含一组对齐序列的元数据模板

```shell
IoTDB> create device template t2 aligned (lat FLOAT, lon FLOAT)
```

其中，物理量 `lat` 和 `lon` 是对齐的。

创建模板时，系统会默认指定编码压缩方式，无需手动指定，若业务场景需要手动调整，可参考如下示例：
```shell
IoTDB> create device template t1 (temperature FLOAT encoding=RLE, status BOOLEAN encoding=PLAIN compression=SNAPPY)
```
更多详细的数据类型与编码方式的对应列表请参见 [压缩&编码](../Technical-Insider/Encoding-and-Compression.md)。

### 2.2 挂载设备模板

元数据模板在创建后，需执行挂载操作，方可用于相应路径下的序列创建与数据写入。

**挂载模板前，需确保相关数据库已经创建。**

**推荐将模板挂载在 database 节点上，不建议将模板挂载到 database 上层的节点上。**

**模板挂载路径下禁止创建普通序列，已创建了普通序列的前缀路径上不允许挂载模板。**

挂载元数据模板的 SQL 语句如下所示：

```shell
IoTDB> set device template t1 to root.sg1.d1
```

### 2.3 激活设备模板

挂载好设备模板后，且系统开启自动注册序列功能的情况下，即可直接进行数据的写入。例如 database 为 root.sg1，模板 t1 被挂载到了节点 root.sg1.d1，那么可直接向时间序列（如 root.sg1.d1.temperature 和 root.sg1.d1.status）写入时间序列数据，该时间序列已可被当作正常创建的序列使用。

**注意**：在插入数据之前或系统未开启自动注册序列功能，模板定义的时间序列不会被创建。可以使用如下SQL语句在插入数据前创建时间序列即激活模板：

```shell
IoTDB> create timeseries using device template on root.sg1.d1
```

**示例：** 执行以下语句
```shell
IoTDB> set device template t1 to root.sg1.d1
IoTDB> set device template t2 to root.sg1.d2
IoTDB> create timeseries using device template on root.sg1.d1
IoTDB> create timeseries using device template on root.sg1.d2
```

查看此时的时间序列：
```sql
show timeseries root.sg1.**
```

```shell
+-----------------------+-----+-------------+--------+--------+-----------+----+----------+--------+-------------------+
|             timeseries|alias|     database|dataType|encoding|compression|tags|attributes|deadband|deadband parameters|
+-----------------------+-----+-------------+--------+--------+-----------+----+----------+--------+-------------------+
|root.sg1.d1.temperature| null|     root.sg1|   FLOAT|     RLE|     SNAPPY|null|      null|    null|               null|
|     root.sg1.d1.status| null|     root.sg1| BOOLEAN|   PLAIN|     SNAPPY|null|      null|    null|               null|
|        root.sg1.d2.lon| null|     root.sg1|   FLOAT| GORILLA|     SNAPPY|null|      null|    null|               null|
|        root.sg1.d2.lat| null|     root.sg1|   FLOAT| GORILLA|     SNAPPY|null|      null|    null|               null|
+-----------------------+-----+-------------+--------+--------+-----------+----+----------+--------+-------------------+
```

查看此时的设备：
```sql
show devices root.sg1.**
```

```shell
+---------------+---------+---------+
|        devices|isAligned| Template|
+---------------+---------+---------+
|    root.sg1.d1|    false|     null|
|    root.sg1.d2|     true|     null|
+---------------+---------+---------+
```

### 2.4 查看设备模板

- 查看所有设备模板

SQL 语句如下所示：

```shell
IoTDB> show device templates
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

- 查看某个设备模板下的物理量

SQL 语句如下所示：

```shell
IoTDB> show nodes in device template t1
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

- 查看挂载了某个设备模板的路径

```shell
IoTDB> show paths set device template t1
```

执行结果如下：
```shell
+-----------+
|child paths|
+-----------+
|root.sg1.d1|
+-----------+
```

- 查看使用了某个设备模板的路径（即模板在该路径上已激活，序列已创建）

```shell
IoTDB> show paths using device template t1
```

执行结果如下：
```shell
+-----------+
|child paths|
+-----------+
|root.sg1.d1|
+-----------+
```

### 2.5 解除设备模板

若需删除模板表示的某一组时间序列，可采用解除模板操作，SQL语句如下所示：

```shell
IoTDB> delete timeseries of device template t1 from root.sg1.d1
```

或

```shell
IoTDB> deactivate device template t1 from root.sg1.d1
```

解除操作支持批量处理，SQL语句如下所示：

```shell
IoTDB> delete timeseries of device template t1 from root.sg1.*, root.sg2.*
```

或

```shell
IoTDB> deactivate device template t1 from root.sg1.*, root.sg2.*
```

若解除命令不指定模板名称，则会将给定路径涉及的所有模板使用情况均解除。

### 2.6 卸载设备模板

卸载设备模板的 SQL 语句如下所示：

```shell
IoTDB> unset device template t1 from root.sg1.d1
```

**注意**：不支持卸载仍处于激活状态的模板，需保证执行卸载操作前解除对该模板的所有使用，即删除所有该模板表示的序列。

### 2.7 删除设备模板

删除设备模板的 SQL 语句如下所示：

```shell
IoTDB> drop device template t1
```

**注意**：不支持删除已经挂载的模板，需在删除操作前保证该模板卸载成功。

### 2.8 修改设备模板

在需要新增物理量的场景中，可以通过修改设备模板来给所有已激活该模板的设备新增物理量。

修改设备模板的 SQL 语句如下所示：

```shell
IoTDB> alter device template t1 add (speed FLOAT, FLOAT TEXT)
```

**向已挂载模板的路径下的设备中写入数据，若写入请求中的物理量不在模板中，将自动扩展模板。**


## 3. 时间序列管理

### 3.1 创建时间序列

根据建立的数据模型，我们可以分别在两个数据库中创建相应的时间序列。创建时间序列的 SQL 语句如下所示：

```
IoTDB > create timeseries root.ln.wf01.wt01.status with datatype=BOOLEAN
IoTDB > create timeseries root.ln.wf01.wt01.temperature with datatype=FLOAT
IoTDB > create timeseries root.ln.wf02.wt02.hardware with datatype=TEXT
IoTDB > create timeseries root.ln.wf02.wt02.status with datatype=BOOLEAN
IoTDB > create timeseries root.sgcc.wf03.wt01.status with datatype=BOOLEAN
IoTDB > create timeseries root.sgcc.wf03.wt01.temperature with datatype=FLOAT
```

从 v0.13 起，可以使用简化版的 SQL 语句创建时间序列：

```
IoTDB > create timeseries root.ln.wf01.wt01.status BOOLEAN
IoTDB > create timeseries root.ln.wf01.wt01.temperature FLOAT
IoTDB > create timeseries root.ln.wf02.wt02.hardware TEXT
IoTDB > create timeseries root.ln.wf02.wt02.status BOOLEAN
IoTDB > create timeseries root.sgcc.wf03.wt01.status BOOLEAN
IoTDB > create timeseries root.sgcc.wf03.wt01.temperature FLOAT
```

创建时间序列时，系统会默认指定编码压缩方式，无需手动指定，若业务场景需要手动调整，可参考如下示例：
```
IoTDB > create timeseries root.sgcc.wf03.wt01.temperature FLOAT encoding=PLAIN compressor=SNAPPY
```

需要注意的是，如果手动指定了编码方式，但与数据类型不对应时，系统会给出相应的错误提示，如下所示：
```
IoTDB> create timeseries root.ln.wf02.wt02.status WITH DATATYPE=BOOLEAN, ENCODING=TS_2DIFF
error: encoding TS_2DIFF does not support BOOLEAN
```

更多详细的数据类型与编码压缩方式的对应列表请参见 [压缩&编码](../Technical-Insider/Encoding-and-Compression.md)。


### 3.2 创建对齐时间序列

创建一组对齐时间序列的SQL语句如下所示：

```
IoTDB> CREATE ALIGNED TIMESERIES root.ln.wf01.GPS(latitude FLOAT, longitude FLOAT) 
```

一组对齐序列中的序列可以有不同的数据类型、编码方式以及压缩方式。

对齐的时间序列也支持设置别名、标签、属性。

### 3.3 删除时间序列

我们可以使用`(DELETE | DROP) TimeSeries <PathPattern>`语句来删除我们之前创建的时间序列。SQL 语句如下所示：

```
IoTDB> delete timeseries root.ln.wf01.wt01.status
IoTDB> delete timeseries root.ln.wf01.wt01.temperature, root.ln.wf02.wt02.hardware
IoTDB> delete timeseries root.ln.wf02.*
IoTDB> drop timeseries root.ln.wf02.*
```

### 3.4 查看时间序列

* SHOW LATEST? TIMESERIES pathPattern? timeseriesWhereClause? limitClause?

  SHOW TIMESERIES 中可以有四种可选的子句，查询结果为这些时间序列的所有信息

时间序列信息具体包括：时间序列路径名，database，Measurement 别名，数据类型，编码方式，压缩方式，属性和标签。

示例：

* SHOW TIMESERIES

  展示系统中所有的时间序列信息

* SHOW TIMESERIES <`Path`>

  返回给定路径的下的所有时间序列信息。其中 `Path` 需要为一个时间序列路径或路径模式。例如，分别查看`root`路径和`root.ln`路径下的时间序列，SQL 语句如下所示：

```
IoTDB> show timeseries root.**
IoTDB> show timeseries root.ln.**
```

执行结果分别为：

```
+-------------------------------+--------+-------------+--------+--------+-----------+-------------------------------------------+--------------------------------------------------------+--------+-------------------+
|                     timeseries|   alias|     database|dataType|encoding|compression|                                       tags|                                              attributes|deadband|deadband parameters|
+-------------------------------+--------+-------------+--------+--------+-----------+-------------------------------------------+--------------------------------------------------------+--------+-------------------+
|root.sgcc.wf03.wt01.temperature|    null|    root.sgcc|   FLOAT|     RLE|     SNAPPY|                                       null|                                                    null|    null|               null|
|     root.sgcc.wf03.wt01.status|    null|    root.sgcc| BOOLEAN|   PLAIN|     SNAPPY|                                       null|                                                    null|    null|               null|
|             root.turbine.d1.s1|newAlias| root.turbine|   FLOAT|     RLE|     SNAPPY|{"newTag1":"newV1","tag4":"v4","tag3":"v3"}|{"attr2":"v2","attr1":"newV1","attr4":"v4","attr3":"v3"}|    null|               null|
|     root.ln.wf02.wt02.hardware|    null|      root.ln|    TEXT|   PLAIN|     SNAPPY|                                       null|                                                    null|    null|               null|
|       root.ln.wf02.wt02.status|    null|      root.ln| BOOLEAN|   PLAIN|     SNAPPY|                                       null|                                                    null|    null|               null|
|  root.ln.wf01.wt01.temperature|    null|      root.ln|   FLOAT|     RLE|     SNAPPY|                                       null|                                                    null|    null|               null|
|       root.ln.wf01.wt01.status|    null|      root.ln| BOOLEAN|   PLAIN|     SNAPPY|                                       null|                                                    null|    null|               null|
+-------------------------------+--------+-------------+--------+--------+-----------+-------------------------------------------+--------------------------------------------------------+--------+-------------------+
Total line number = 7
It costs 0.016s

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

* SHOW TIMESERIES LIMIT INT OFFSET INT

  只返回从指定下标开始的结果，最大返回条数被 LIMIT 限制，用于分页查询。例如：

```
show timeseries root.ln.** limit 10 offset 10
```

* SHOW TIMESERIES WHERE TIMESERIES contains 'containStr'

  对查询结果集根据 timeseries 名称进行字符串模糊匹配过滤。例如：

```
show timeseries root.ln.** where timeseries contains 'wf01.wt'
```

执行结果为：

```
+-------------------------------+--------+-------------+--------+--------+-----------+-------------------------------------------+--------------------------------------------------------+--------+-------------------+
|                     timeseries|   alias|     database|dataType|encoding|compression|                                       tags|                                              attributes|deadband|deadband parameters|
+-------------------------------+--------+-------------+--------+--------+-----------+-------------------------------------------+--------------------------------------------------------+--------+-------------------+
|  root.ln.wf01.wt01.temperature|    null|      root.ln|   FLOAT|     RLE|     SNAPPY|                                       null|                                                    null|    null|               null|
|       root.ln.wf01.wt01.status|    null|      root.ln| BOOLEAN|   PLAIN|     SNAPPY|                                       null|                                                    null|    null|               null|
+-------------------------------+--------+-------------+--------+--------+-----------+-------------------------------------------+--------------------------------------------------------+--------+-------------------+
Total line number = 2
It costs 0.016s
```

* SHOW TIMESERIES WHERE DataType=type

  对查询结果集根据时间序列数据类型进行过滤。例如：

```
show timeseries root.ln.** where dataType=FLOAT
```

执行结果为:

```
+-------------------------------+--------+-------------+--------+--------+-----------+-------------------------------------------+--------------------------------------------------------+--------+-------------------+
|                     timeseries|   alias|     database|dataType|encoding|compression|                                       tags|                                              attributes|deadband|deadband parameters|
+-------------------------------+--------+-------------+--------+--------+-----------+-------------------------------------------+--------------------------------------------------------+--------+-------------------+
|root.sgcc.wf03.wt01.temperature|    null|    root.sgcc|   FLOAT|     RLE|     SNAPPY|                                       null|                                                    null|    null|               null|
|             root.turbine.d1.s1|newAlias| root.turbine|   FLOAT|     RLE|     SNAPPY|{"newTag1":"newV1","tag4":"v4","tag3":"v3"}|{"attr2":"v2","attr1":"newV1","attr4":"v4","attr3":"v3"}|    null|               null|
|  root.ln.wf01.wt01.temperature|    null|      root.ln|   FLOAT|     RLE|     SNAPPY|                                       null|                                                    null|    null|               null|
+-------------------------------+--------+-------------+--------+--------+-----------+-------------------------------------------+--------------------------------------------------------+--------+-------------------+
Total line number = 3
It costs 0.016s

```

* SHOW TIMESERIES WHERE TAGS(KEY) = VALUE
* SHOW TIMESERIES WHERE TAGS(KEY) CONTAINS VALUE

  对查询结果集根据标签进行过滤。例如：

```
show timeseries root.ln.** where TAGS(unit)='c'
show timeseries root.ln.** where TAGS(description) contains 'test1'
```

执行结果分别为：

```
+--------------------------+-----+-------------+--------+--------+-----------+------------+----------+--------+-------------------+
|                timeseries|alias|     database|dataType|encoding|compression|        tags|attributes|deadband|deadband parameters|
+--------------------------+-----+-------------+--------+--------+-----------+------------+----------+--------+-------------------+
|root.ln.wf02.wt02.hardware| null|      root.ln|    TEXT|   PLAIN|     SNAPPY|{"unit":"c"}|      null|    null|               null|
+--------------------------+-----+-------------+--------+--------+-----------+------------+----------+--------+-------------------+
Total line number = 1
It costs 0.005s

+------------------------+-----+-------------+--------+--------+-----------+-----------------------+----------+--------+-------------------+
|              timeseries|alias|     database|dataType|encoding|compression|                   tags|attributes|deadband|deadband parameters|
+------------------------+-----+-------------+--------+--------+-----------+-----------------------+----------+--------+-------------------+
|root.ln.wf02.wt02.status| null|      root.ln| BOOLEAN|   PLAIN|     SNAPPY|{"description":"test1"}|      null|    null|               null|
+------------------------+-----+-------------+--------+--------+-----------+-----------------------+----------+--------+-------------------+
Total line number = 1
It costs 0.004s

```


* SHOW LATEST TIMESERIES

  表示查询出的时间序列需要按照最近插入时间戳降序排列



需要注意的是，当查询路径不存在时，系统会返回 0 条时间序列。

### 3.5 统计时间序列总数

IoTDB 支持使用`COUNT TIMESERIES<Path>`来统计一条路径中的时间序列个数。SQL 语句如下所示：

* 可以通过 `WHERE` 条件对时间序列名称进行字符串模糊匹配，语法为： `COUNT TIMESERIES <Path> WHERE TIMESERIES contains 'containStr'` 。
* 可以通过 `WHERE` 条件对时间序列数据类型进行过滤，语法为： `COUNT TIMESERIES <Path> WHERE DataType=<DataType>'`。
* 可以通过 `WHERE` 条件对标签点进行过滤，语法为： `COUNT TIMESERIES <Path> WHERE TAGS(key)='value'` 或 `COUNT TIMESERIES <Path> WHERE TAGS(key) contains 'value'`。
* 可以通过定义`LEVEL`来统计指定层级下的时间序列个数。这条语句可以用来统计每一个设备下的传感器数量，语法为：`COUNT TIMESERIES <Path> GROUP BY LEVEL=<INTEGER>`。

```
IoTDB > COUNT TIMESERIES root.**
IoTDB > COUNT TIMESERIES root.ln.**
IoTDB > COUNT TIMESERIES root.ln.*.*.status
IoTDB > COUNT TIMESERIES root.ln.wf01.wt01.status
IoTDB > COUNT TIMESERIES root.** WHERE TIMESERIES contains 'sgcc' 
IoTDB > COUNT TIMESERIES root.** WHERE DATATYPE = INT64
IoTDB > COUNT TIMESERIES root.** WHERE TAGS(unit) contains 'c' 
IoTDB > COUNT TIMESERIES root.** WHERE TAGS(unit) = 'c' 
IoTDB > COUNT TIMESERIES root.** WHERE TIMESERIES contains 'sgcc' group by level = 1
```

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

<img style="width:100%; max-width:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/github/69792176-1718f400-1201-11ea-861a-1a83c07ca144.jpg">

可以看到，`root`被定义为`LEVEL=0`。那么当你输入如下语句时：

```
IoTDB > COUNT TIMESERIES root.** GROUP BY LEVEL=1
IoTDB > COUNT TIMESERIES root.ln.** GROUP BY LEVEL=2
IoTDB > COUNT TIMESERIES root.ln.wf01.* GROUP BY LEVEL=2
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

IoTDB > COUNT TIMESERIES root.ln.** GROUP BY LEVEL=2
+------------+-----------------+
|      column|count(timeseries)|
+------------+-----------------+
|root.ln.wf02|                2|
|root.ln.wf01|                2|
+------------+-----------------+
Total line number = 2
It costs 0.002s

IoTDB > COUNT TIMESERIES root.ln.wf01.* GROUP BY LEVEL=2
+------------+-----------------+
|      column|count(timeseries)|
+------------+-----------------+
|root.ln.wf01|                2|
+------------+-----------------+
Total line number = 1
It costs 0.002s
```

> 注意：时间序列的路径只是过滤条件，与 level 的定义无关。

### 3.6 活跃时间序列查询
我们在原有的时间序列查询和统计上添加新的WHERE时间过滤条件，可以得到在指定时间范围中存在数据的时间序列。

需要注意的是， 在带有时间过滤的元数据查询中并不考虑视图的存在，只考虑TsFile中实际存储的时间序列。

一个使用样例如下：
```
IoTDB> insert into root.sg.data(timestamp, s1,s2) values(15000, 1, 2);
IoTDB> insert into root.sg.data2(timestamp, s1,s2) values(15002, 1, 2);
IoTDB> insert into root.sg.data3(timestamp, s1,s2) values(16000, 1, 2);
IoTDB> show timeseries;
+----------------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+
|      Timeseries|Alias|Database|DataType|Encoding|Compression|Tags|Attributes|Deadband|DeadbandParameters|ViewType|
+----------------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+
| root.sg.data.s1| null| root.sg|   FLOAT| GORILLA|        LZ4|null|      null|    null|              null|    BASE|
| root.sg.data.s2| null| root.sg|   FLOAT| GORILLA|        LZ4|null|      null|    null|              null|    BASE|
|root.sg.data3.s1| null| root.sg|   FLOAT| GORILLA|        LZ4|null|      null|    null|              null|    BASE|
|root.sg.data3.s2| null| root.sg|   FLOAT| GORILLA|        LZ4|null|      null|    null|              null|    BASE|
|root.sg.data2.s1| null| root.sg|   FLOAT| GORILLA|        LZ4|null|      null|    null|              null|    BASE|
|root.sg.data2.s2| null| root.sg|   FLOAT| GORILLA|        LZ4|null|      null|    null|              null|    BASE|
+----------------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+

IoTDB> show timeseries where time >= 15000 and time < 16000;
+----------------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+
|      Timeseries|Alias|Database|DataType|Encoding|Compression|Tags|Attributes|Deadband|DeadbandParameters|ViewType|
+----------------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+
| root.sg.data.s1| null| root.sg|   FLOAT| GORILLA|        LZ4|null|      null|    null|              null|    BASE|
| root.sg.data.s2| null| root.sg|   FLOAT| GORILLA|        LZ4|null|      null|    null|              null|    BASE|
|root.sg.data2.s1| null| root.sg|   FLOAT| GORILLA|        LZ4|null|      null|    null|              null|    BASE|
|root.sg.data2.s2| null| root.sg|   FLOAT| GORILLA|        LZ4|null|      null|    null|              null|    BASE|
+----------------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+

IoTDB> count timeseries where time >= 15000 and time < 16000;
+-----------------+
|count(timeseries)|
+-----------------+
|                4|
+-----------------+
```
关于活跃时间序列的定义，能通过正常查询查出来的数据就是活跃数据，也就是说插入但被删除的时间序列不在考虑范围内。

### 3.7 标签点管理

我们可以在创建时间序列的时候，为它添加别名和额外的标签和属性信息。

标签和属性的区别在于：

* 标签可以用来查询时间序列路径，会在内存中维护标点到时间序列路径的倒排索引：标签 -> 时间序列路径
* 属性只能用时间序列路径来查询：时间序列路径 -> 属性

所用到的扩展的创建时间序列的 SQL 语句如下所示：
```
create timeseries root.turbine.d1.s1(temprature) with datatype=FLOAT tags(tag1=v1, tag2=v2) attributes(attr1=v1, attr2=v2)
```

括号里的`temprature`是`s1`这个传感器的别名。
我们可以在任何用到`s1`的地方，将其用`temprature`代替，这两者是等价的。

> IoTDB 同时支持在查询语句中使用 AS 函数设置别名。二者的区别在于：AS 函数设置的别名用于替代整条时间序列名，且是临时的，不与时间序列绑定；而上文中的别名只作为传感器的别名，与其绑定且可与原传感器名等价使用。

> 注意：额外的标签和属性信息总的大小不能超过`tag_attribute_total_size`.

 * 标签点属性更新
创建时间序列后，我们也可以对其原有的标签点属性进行更新，主要有以下六种更新方式：
* 重命名标签或属性
```
ALTER timeseries root.turbine.d1.s1 RENAME tag1 TO newTag1
```
* 重新设置标签或属性的值
```
ALTER timeseries root.turbine.d1.s1 SET newTag1=newV1, attr1=newV1
```
* 删除已经存在的标签或属性
```
ALTER timeseries root.turbine.d1.s1 DROP tag1, tag2
```
* 添加新的标签
```
ALTER timeseries root.turbine.d1.s1 ADD TAGS tag3=v3, tag4=v4
```
* 添加新的属性
```
ALTER timeseries root.turbine.d1.s1 ADD ATTRIBUTES attr3=v3, attr4=v4
```
* 更新插入别名，标签和属性
> 如果该别名，标签或属性原来不存在，则插入，否则，用新值更新原来的旧值
```
ALTER timeseries root.turbine.d1.s1 UPSERT ALIAS=newAlias TAGS(tag2=newV2, tag3=v3) ATTRIBUTES(attr3=v3, attr4=v4)
```

* 使用标签作为过滤条件查询时间序列，使用 TAGS(tagKey) 来标识作为过滤条件的标签
```
SHOW TIMESERIES (<`PathPattern`>)? timeseriesWhereClause
```

返回给定路径的下的所有满足条件的时间序列信息，SQL 语句如下所示：

```
ALTER timeseries root.ln.wf02.wt02.hardware ADD TAGS unit=c
ALTER timeseries root.ln.wf02.wt02.status ADD TAGS description=test1
show timeseries root.ln.** where TAGS(unit)='c'
show timeseries root.ln.** where TAGS(description) contains 'test1'
```

执行结果分别为：

```
+--------------------------+-----+-------------+--------+--------+-----------+------------+----------+--------+-------------------+
|                timeseries|alias|     database|dataType|encoding|compression|        tags|attributes|deadband|deadband parameters|
+--------------------------+-----+-------------+--------+--------+-----------+------------+----------+--------+-------------------+
|root.ln.wf02.wt02.hardware| null|      root.ln|    TEXT|   PLAIN|     SNAPPY|{"unit":"c"}|      null|    null|               null|
+--------------------------+-----+-------------+--------+--------+-----------+------------+----------+--------+-------------------+
Total line number = 1
It costs 0.005s

+------------------------+-----+-------------+--------+--------+-----------+-----------------------+----------+--------+-------------------+
|              timeseries|alias|     database|dataType|encoding|compression|                   tags|attributes|deadband|deadband parameters|
+------------------------+-----+-------------+--------+--------+-----------+-----------------------+----------+--------+-------------------+
|root.ln.wf02.wt02.status| null|      root.ln| BOOLEAN|   PLAIN|     SNAPPY|{"description":"test1"}|      null|    null|               null|
+------------------------+-----+-------------+--------+--------+-----------+-----------------------+----------+--------+-------------------+
Total line number = 1
It costs 0.004s
```

- 使用标签作为过滤条件统计时间序列数量

```
COUNT TIMESERIES (<`PathPattern`>)? timeseriesWhereClause
COUNT TIMESERIES (<`PathPattern`>)? timeseriesWhereClause GROUP BY LEVEL=<INTEGER>
```

返回给定路径的下的所有满足条件的时间序列的数量，SQL 语句如下所示：

```
count timeseries
count timeseries root.** where TAGS(unit)='c'
count timeseries root.** where TAGS(unit)='c' group by level = 2
```

执行结果分别为：

```
IoTDB> count timeseries
+-----------------+
|count(timeseries)|
+-----------------+
|                6|
+-----------------+
Total line number = 1
It costs 0.019s
IoTDB> count timeseries root.** where TAGS(unit)='c'
+-----------------+
|count(timeseries)|
+-----------------+
|                2|
+-----------------+
Total line number = 1
It costs 0.020s
IoTDB> count timeseries root.** where TAGS(unit)='c' group by level = 2
+--------------+-----------------+
|        column|count(timeseries)|
+--------------+-----------------+
|  root.ln.wf02|                2|
|  root.ln.wf01|                0|
|root.sgcc.wf03|                0|
+--------------+-----------------+
Total line number = 3
It costs 0.011s
```

> 注意，现在我们只支持一个查询条件，要么是等值条件查询，要么是包含条件查询。当然 where 子句中涉及的必须是标签值，而不能是属性值。

创建对齐时间序列

```
create aligned timeseries root.sg1.d1(s1 INT32 tags(tag1=v1, tag2=v2) attributes(attr1=v1, attr2=v2), s2 DOUBLE tags(tag3=v3, tag4=v4) attributes(attr3=v3, attr4=v4))
```

执行结果如下：

```
IoTDB> show timeseries
+--------------+-----+-------------+--------+--------+-----------+-------------------------+---------------------------+--------+-------------------+
|    timeseries|alias|     database|dataType|encoding|compression|                     tags|                 attributes|deadband|deadband parameters|
+--------------+-----+-------------+--------+--------+-----------+-------------------------+---------------------------+--------+-------------------+
|root.sg1.d1.s1| null|     root.sg1|   INT32|     RLE|     SNAPPY|{"tag1":"v1","tag2":"v2"}|{"attr2":"v2","attr1":"v1"}|    null|               null|
|root.sg1.d1.s2| null|     root.sg1|  DOUBLE| GORILLA|     SNAPPY|{"tag4":"v4","tag3":"v3"}|{"attr4":"v4","attr3":"v3"}|    null|               null|
+--------------+-----+-------------+--------+--------+-----------+-------------------------+---------------------------+--------+-------------------+
```

支持查询：

```
IoTDB> show timeseries where TAGS(tag1)='v1'
+--------------+-----+-------------+--------+--------+-----------+-------------------------+---------------------------+--------+-------------------+
|    timeseries|alias|     database|dataType|encoding|compression|                     tags|                 attributes|deadband|deadband parameters|
+--------------+-----+-------------+--------+--------+-----------+-------------------------+---------------------------+--------+-------------------+
|root.sg1.d1.s1| null|     root.sg1|   INT32|     RLE|     SNAPPY|{"tag1":"v1","tag2":"v2"}|{"attr2":"v2","attr1":"v1"}|    null|               null|
+--------------+-----+-------------+--------+--------+-----------+-------------------------+---------------------------+--------+-------------------+
```

上述对时间序列标签、属性的更新等操作都支持。


## 4. 路径查询

### 4.1 路径（Path）

路径（path）是用于表示时间序列的层级结构的表达式，其语法定义如下：
```SQL
  path       
      : nodeName ('.' nodeName)*
      ;
      
  nodeName
      : wildcard? identifier wildcard?
      | wildcard
      ;
      
  wildcard 
      : '*' 
      | '**'
      ;
```
### 4.2 路径结点名（NodeName）

- 路径中由 `.` 分割的部分称为路径结点名（nodeName）。
- 例如，`root.a.b.c` 是一个层级为 4 的路径，其中 root、a、b 和 c 都是路径结点名。

#### 约束条件
- 保留字符 root：root 是一个保留字符，仅允许出现在路径的开头。如果在其他层级出现 root，系统将无法解析并提示报错。

- 字符支持：除 root 外的其他层级支持以下字符：
  - 字母（a-z、A-Z）
  - 数字（0-9）
  - 下划线（_）
  - UNICODE 中文字符（\u2E80 到 \u9FFF）
- 大小写敏感性：在 Windows 系统上，数据库路径结点名是大小写不敏感的。例如，root.ln 和 root.LN 会被视为相同的路径。

### 4.3 特殊字符（反引号）

如果`路径结点名（NodeName）`中需要使用特殊字符（如空格、标点符号等），可以使用反引号（`）将结点名引用起来。更多关于反引号的使用方法，请参考[反引号](../SQL-Manual/Syntax-Rule.md#反引号)。

### 4.4 路径模式（Path Pattern）

为了使得在表达多个时间序列的时候更加方便快捷，IoTDB 为用户提供带通配符`*`或`**`的路径。通配符可以出现在路径中的任何层。

- 单层通配符（*）：在路径中表示一层。
  - 例如，`root.vehicle.*.sensor1` 表示以 `root.vehicle` 为前缀，以 `sensor1` 为后缀，且层级等于 4 的路径。
  
- 多层通配符（**）：在路径中表示(`*`)+，即为一层或多层`*`.
  - 例如：`root.vehicle.device1.**` 表示所有以 `root.vehicle.device1` 为前缀且层级大于等于 4 的路径。
  - `root.vehicle.**.sensor1` 表示以 `root.vehicle` 为前缀，以 `sensor1` 为后缀，且层级大于等于 4 的路径。

**注意**：* 和 ** 不能放在路径的开头。

### 4.5 查看路径的所有子路径

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

* 查询形如 root.xx.xx.xx 的路径：show child paths root.\*.\*

```
+---------------+
|    child paths|
+---------------+
|root.ln.wf01.s1|
|root.ln.wf02.s2|
+---------------+
```

### 4.6 查看路径的下一级节点

```
SHOW CHILD NODES pathPattern
```

可以查看此路径模式所匹配的节点的下一层的所有节点。

示例：

* 查询 root 的下一层：show child nodes root

```
+------------+
| child nodes|
+------------+
|          ln|
+------------+
```

* 查询 root.ln 的下一层 ：show child nodes root.ln

```
+------------+
| child nodes|
+------------+
|        wf01|
|        wf02|
+------------+
```

### 4.7 统计节点数

IoTDB 支持使用`COUNT NODES <PathPattern> LEVEL=<INTEGER>`来统计当前 Metadata
 树下满足某路径模式的路径中指定层级的节点个数。这条语句可以用来统计带有特定采样点的设备数。例如：

```
IoTDB > COUNT NODES root.** LEVEL=2
IoTDB > COUNT NODES root.ln.** LEVEL=2
IoTDB > COUNT NODES root.ln.wf01.* LEVEL=3
IoTDB > COUNT NODES root.**.temperature LEVEL=3
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
|           2|
+------------+
Total line number = 1
It costs 0.002s

+------------+
|count(nodes)|
+------------+
|           1|
+------------+
Total line number = 1
It costs 0.002s

+------------+
|count(nodes)|
+------------+
|           2|
+------------+
Total line number = 1
It costs 0.002s
```

> 注意：时间序列的路径只是过滤条件，与 level 的定义无关。

### 4.8 查看设备

* SHOW DEVICES pathPattern? (WITH DATABASE)? devicesWhereClause? limitClause? 

与 `Show Timeseries` 相似，IoTDB 目前也支持两种方式查看设备。

* `SHOW DEVICES` 语句显示当前所有的设备信息，等价于 `SHOW DEVICES root.**`。
* `SHOW DEVICES <PathPattern>` 语句规定了 `PathPattern`，返回给定的路径模式所匹配的设备信息。
* `WHERE` 条件中可以使用 `DEVICE contains 'xxx'`，根据 device 名称进行模糊查询。
* `WHERE` 条件中可以使用 `TEMPLATE = 'xxx'`,`TEMPLATE != 'xxx'`，根据 template 名称进行过滤查询。
* `WHERE` 条件中可以使用 `TEMPLATE is null`,`TEMPLATE is not null`，根据 template 是否为null(null 表示没激活)进行过滤查询。

SQL 语句如下所示：

```
IoTDB> show devices
IoTDB> show devices root.ln.**
IoTDB> show devices root.ln.** where device contains 't'
IoTDB> show devices root.ln.** where template = 't1'
IoTDB> show devices root.ln.** where template is null
IoTDB> show devices root.ln.** where template != 't1'
IoTDB> show devices root.ln.** where template is not null
```

你可以获得如下数据：

```
+-------------------+---------+---------+
|            devices|isAligned| Template|
+-------------------+---------+---------+
|  root.ln.wf01.wt01|    false|       t1|
|  root.ln.wf02.wt02|    false|     null|
|root.sgcc.wf03.wt01|    false|     null|
|    root.turbine.d1|    false|     null|
+-------------------+---------+---------+
Total line number = 4
It costs 0.002s

+-----------------+---------+---------+
|          devices|isAligned| Template|
+-----------------+---------+---------+
|root.ln.wf01.wt01|    false|       t1|
|root.ln.wf02.wt02|    false|     null|
+-----------------+---------+---------+
Total line number = 2
It costs 0.001s

+-----------------+---------+---------+
|          devices|isAligned| Template|
+-----------------+---------+---------+
|root.ln.wf01.wt01|    false|       t1|
|root.ln.wf02.wt02|    false|     null|
+-----------------+---------+---------+
Total line number = 2
It costs 0.001s

+-----------------+---------+---------+
|          devices|isAligned| Template|
+-----------------+---------+---------+
|root.ln.wf01.wt01|    false|       t1|
+-----------------+---------+---------+
Total line number = 1
It costs 0.001s

+-----------------+---------+---------+
|          devices|isAligned| Template|
+-----------------+---------+---------+
|root.ln.wf02.wt02|    false|     null|
+-----------------+---------+---------+
Total line number = 1
It costs 0.001s
```

其中，`isAligned`表示该设备下的时间序列是否对齐,
`Template`显示着该设备所激活的模板名，null 表示没有激活模板。

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
+-------------------+-------------+---------+---------+
|            devices|     database|isAligned| Template|
+-------------------+-------------+---------+---------+
|  root.ln.wf01.wt01|      root.ln|    false|       t1|
|  root.ln.wf02.wt02|      root.ln|    false|     null|
|root.sgcc.wf03.wt01|    root.sgcc|    false|     null|
|    root.turbine.d1| root.turbine|    false|     null|
+-------------------+-------------+---------+---------+
Total line number = 4
It costs 0.003s

+-----------------+-------------+---------+---------+
|          devices|     database|isAligned| Template|
+-----------------+-------------+---------+---------+
|root.ln.wf01.wt01|      root.ln|    false|       t1|
|root.ln.wf02.wt02|      root.ln|    false|     null|
+-----------------+-------------+---------+---------+
Total line number = 2
It costs 0.001s
```

### 4.9 统计设备数量

* COUNT DEVICES \<PathPattern\>

上述语句用于统计设备的数量，同时允许指定`PathPattern` 用于统计匹配该`PathPattern` 的设备数量

SQL 语句如下所示：

```
IoTDB> show devices
IoTDB> count devices
IoTDB> count devices root.ln.**
```

你可以获得如下数据：

```
+-------------------+---------+---------+
|            devices|isAligned| Template|
+-------------------+---------+---------+
|root.sgcc.wf03.wt03|    false|     null|
|    root.turbine.d1|    false|     null|
|  root.ln.wf02.wt02|    false|     null|
|  root.ln.wf01.wt01|    false|       t1|
+-------------------+---------+---------+
Total line number = 4
It costs 0.024s

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

### 4.10 活跃设备查询
和活跃时间序列一样，我们可以在查看和统计设备的基础上添加时间过滤条件来查询在某段时间内存在数据的活跃设备。这里活跃的定义与活跃时间序列相同，使用样例如下：
```
IoTDB> insert into root.sg.data(timestamp, s1,s2) values(15000, 1, 2);
IoTDB> insert into root.sg.data2(timestamp, s1,s2) values(15002, 1, 2);
IoTDB> insert into root.sg.data3(timestamp, s1,s2) values(16000, 1, 2);
IoTDB> show devices;
+-------------------+---------+
|            devices|isAligned|
+-------------------+---------+
|       root.sg.data|    false|
|      root.sg.data2|    false|
|      root.sg.data3|    false|
+-------------------+---------+

IoTDB> show devices where time >= 15000 and time < 16000;
+-------------------+---------+
|            devices|isAligned|
+-------------------+---------+
|       root.sg.data|    false|
|      root.sg.data2|    false|
+-------------------+---------+

IoTDB> count devices where time >= 15000 and time < 16000;
+--------------+
|count(devices)|
+--------------+
|             2|
+--------------+
```