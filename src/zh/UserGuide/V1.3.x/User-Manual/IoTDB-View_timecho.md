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

# 视图

## 一、 序列视图应用背景

### 1.1 应用场景1 时间序列重命名（PI资产管理）

实际应用中，采集数据的设备可能使用人类难以理解的标识号来命名，这给业务层带来了查询上的困难。

而序列视图能够重新组织管理这些序列，在不改变原有序列内容、无需新建或拷贝序列的情况下，使用新的模型结构来访问他们。

**例如**：一台云端设备使用自己的网卡MAC地址组成实体编号，存储数据时写入如下时间序列:`root.db.0800200A8C6D.xvjeifg`.

对于用户来说，它是难以理解的。但此时，用户能够使用序列视图功能对它重命名，将它映射到一个序列视图中去，使用`root.view.device001.temperature`来访问采集到的数据。

### 1.2 应用场景2 简化业务层查询逻辑

有时用户有大量设备，管理着大量时间序列。在进行某项业务时，用户希望仅处理其中的部分序列，此时就可以通过序列视图功能挑选出关注重点，方便反复查询、写入。

**例如**：用户管理一条产品流水线，各环节的设备有大量时间序列。温度检测员仅需要关注设备温度，就可以抽取温度相关的序列，组成序列视图。

### 1.3 应用场景3 辅助权限管理

生产过程中，不同业务负责的范围一般不同，出于安全考虑往往需要通过权限管理来限制业务员的访问范围。

**例如**：安全管理部门现在仅需要监控某生产线上各设备的温度，但这些数据与其他机密数据存放在同一数据库。此时，就可以创建若干新的视图，视图中仅含有生产线上与温度有关的时间序列，接着，向安全员只赋予这些序列视图的权限，从而达到权限限制的目的。

### 1.4 设计序列视图功能的动机

结合上述两类使用场景，设计序列视图功能的动机，主要有：

1. 时间序列重命名。
2. 简化业务层查询逻辑。
3. 辅助权限管理，通过视图向特定用户开放数据。

## 二、序列视图概念

### 2.1 术语概念

约定：若无特殊说明，本文档所指定的视图均是**序列视图**，未来可能引入设备视图等新功能。

### 2.2 序列视图

序列视图是一种组织管理时间序列的方式。

在传统关系型数据库中，数据都必须存放在一个表中，而在IoTDB等时序数据库中，序列才是存储单元。因此，IoTDB中序列视图的概念也是建立在序列上的。

一个序列视图就是一条虚拟的时间序列，每条虚拟的时间序列都像是一条软链接或快捷方式，映射到某个视图外部的序列或者某种计算逻辑。换言之，一个虚拟序列要么映射到某个确定的外部序列，要么由多个外部序列运算得来。

用户可以使用复杂的SQL查询创建视图，此时序列视图就像一条被存储的查询语句，当从视图中读取数据时，就把被存储的查询语句作为数据来源，放在FROM子句中。

### 2.3 别名序列

在序列视图中，有一类特殊的存在，他们满足如下所有条件：

1. 数据来源为单一的时间序列
2. 没有任何计算逻辑
3. 没有任何筛选条件（例如无WHERE子句的限制）

这样的序列视图，被称为**别名序列**，或别名序列视图。不完全满足上述所有条件的序列视图，就称为非别名序列视图。他们之间的区别是：只有别名序列支持写入功能。

**所有序列视图包括别名序列目前均不支持触发器功能（Trigger）。**

### 2.4 嵌套视图

用户可能想从一个现有的序列视图中选出若干序列，组成一个新的序列视图，就称之为嵌套视图。

**当前版本不支持嵌套视图功能**。

### 2.5 IoTDB中对序列视图的一些约束

#### 限制1 序列视图必须依赖于一个或者若干个时间序列

一个序列视图有两种可能的存在形式：

1. 它映射到一条时间序列
2. 它由一条或若干条时间序列计算得来

前种存在形式已在前文举例，易于理解；而此处的后一种存在形式，则是因为序列视图允许计算逻辑的存在。

比如，用户在同一个锅炉安装了两个温度计，现在需要计算两个温度值的平均值作为测量结果。用户采集到的是如下两个序列：`root.db.d01.temperature01`、`root.db.d01.temperature02`。

此时，用户可以使用两个序列求平均值，作为视图中的一条序列：`root.db.d01.avg_temperature`。

该例子会3.1.2详细展开。

#### 限制2 非别名序列视图是只读的

不允许向非别名序列视图写入。

只有别名序列视图是支持写入的。

#### 限制3 不允许嵌套视图

不能选定现有序列视图中的某些列来创建序列视图，无论是直接的还是间接的。

本限制将在3.1.3给出示例。

#### 限制4 序列视图与时间序列不能重名

序列视图和时间序列都位于同一棵树下，所以他们不能重名。

任何一条序列的名称（路径）都应该是唯一确定的。

#### 限制5 序列视图与时间序列的时序数据共用，标签等元数据不共用

序列视图是指向时间序列的映射，所以它们完全共用时序数据，由时间序列负责持久化存储。

但是它们的tag、attributes等元数据不共用。

这是因为进行业务查询时，面向视图的用户关心的是当前视图的结构，而如果使用group by tag等方式做查询，显然希望是得到视图下含有对应tag的分组效果，而非时间序列的tag的分组效果（用户甚至对那些时间序列毫无感知）。

## 三、序列视图功能介绍

### 3.1 创建视图

创建一个序列视图与创建一条时间序列类似，区别在于需要通过AS关键字指定数据来源，即原始序列。

#### 3.1.1. 创建视图的SQL

用户可以选取一些序列创建一个视图：

```SQL
CREATE VIEW root.view.device.status
AS
    SELECT s01  
    FROM root.db.device
```

它表示用户从现有设备`root.db.device`中选出了`s01`这条序列，创建了序列视图`root.view.device.status`。

序列视图可以与时间序列存在于同一实体下，例如：

```SQL
CREATE VIEW root.db.device.status
AS
    SELECT s01
    FROM root.db.device
```

这样，`root.db.device`下就有了`s01`的一份虚拟拷贝，但是使用不同的名字`status`。

可以发现，上述两个例子中的序列视图，都是别名序列，我们给用户提供一种针对该序列的更方便的创建方式：

```SQL
CREATE VIEW root.view.device.status
AS
    root.db.device.s01
```

#### 3.1.2 创建含有计算逻辑的视图

沿用2.2章节限制1中的例子：

> 用户在同一个锅炉安装了两个温度计，现在需要计算两个温度值的平均值作为测量结果。用户采集到的是如下两个序列：`root.db.d01.temperature01`、`root.db.d01.temperature02`。
>
> 此时，用户可以使用两个序列求平均值，作为视图中的一条序列：`root.view.device01.avg_temperature`。

如果不使用视图，用户可以这样查询两个温度的平均值：

```SQL
SELECT (temperature01 + temperature02) / 2
FROM root.db.d01
```

而如果使用序列视图，用户可以这样创建一个视图来简化将来的查询：

```SQL
CREATE VIEW root.db.d01.avg_temperature
AS
    SELECT (temperature01 + temperature02) / 2
    FROM root.db.d01
```

然后用户可以这样查询：

```SQL
SELECT avg_temperature FROM root.db.d01
```

#### 3.1.3 不支持嵌套序列视图

继续沿用3.1.2中的例子，现在用户想使用序列视图`root.db.d01.avg_temperature`创建一个新的视图，这是不允许的。我们目前不支持嵌套视图，无论它是否是别名序列，都不支持。

比如下列SQL语句会报错：

```SQL
CREATE VIEW root.view.device.avg_temp_copy
AS
    root.db.d01.avg_temperature                        -- 不支持。不允许嵌套视图
```

#### 3.1.4 一次创建多条序列视图

一次只能指定一个序列视图对用户来说使用不方便，则可以一次指定多条序列，比如：

```SQL
CREATE VIEW root.db.device.status, root.db.device.sub.hardware
AS
    SELECT s01, s02
    FROM root.db.device
```

此外，上述写法可以做简化：

```SQL
CREATE VIEW root.db.device(status, sub.hardware)
AS
    SELECT s01, s02
    FROM root.db.device
```

上述两条语句都等价于如下写法：

```SQL
CREATE VIEW root.db.device.status
AS
    SELECT s01
    FROM root.db.device;

CREATE VIEW root.db.device.sub.hardware
AS
    SELECT s02
    FROM root.db.device
```

也等价于如下写法

```SQL
CREATE VIEW root.db.device.status, root.db.device.sub.hardware
AS
    root.db.device.s01, root.db.device.s02

-- 或者

CREATE VIEW root.db.device(status, sub.hardware)
AS
    root.db.device(s01, s02)
```

##### 所有序列间的映射关系为静态存储

有时，SELECT子句中可能包含运行时才能确定的语句个数，比如如下的语句：

```SQL
SELECT s01, s02
FROM root.db.d01, root.db.d02
```

上述语句能匹配到的序列数量是并不确定的，和系统状态有关。即便如此，用户也可以使用它创建视图。

不过需要特别注意，所有序列间的映射关系为静态存储（创建时固定）！请看以下示例：

当前数据库中仅含有`root.db.d01.s01`、`root.db.d02.s01`、`root.db.d02.s02`三条序列，接着创建视图：

```SQL
CREATE VIEW root.view.d(alpha, beta, gamma)
AS
    SELECT s01, s02
    FROM root.db.d01, root.db.d02
```

时间序列之间映射关系如下：

| 序号 | 时间序列          | 序列视图          |
| ---- | ----------------- | ----------------- |
| 1    | `root.db.d01.s01` | root.view.d.alpha |
| 2    | `root.db.d02.s01` | root.view.d.beta  |
| 3    | `root.db.d02.s02` | root.view.d.gamma |

此后，用户新增了序列`root.db.d01.s02`，则它不对应到任何视图；接着，用户删除`root.db.d01.s01`，则查询`root.view.d.alpha`会直接报错，它也不会对应到`root.db.d01.s02`。

请时刻注意，序列间映射关系是静态地、固化地存储的。

#### 3.1.5 批量创建序列视图

现有若干个设备，每个设备都有一个温度数值，例如：

1. root.db.d1.temperature
2. root.db.d2.temperature
3. ...

这些设备下可能存储了很多其他序列(例如`root.db.d1.speed`)，但目前可以创建一个视图，只包含这些设备的温度值，而不关系其他序列:

```SQL
CREATE VIEW root.db.view(${2}_temperature）
AS
    SELECT temperature FROM root.db.*
```

这里仿照了查询写回（`SELECT INTO`）对命名规则的约定，使用变量占位符来指定命名规则。可以参考：[查询写回（SELECT INTO）](https://iotdb.apache.org/zh/UserGuide/Master/Query-Data/Select-Into.html)

这里`root.db.*.temperature`指定了有哪些时间序列会被包含在视图中；`${2}`则指定了从时间序列中的哪个节点提取出名字来命名序列视图。

此处，`${2}`指代的是`root.db.*.temperature`的层级2（从 0 开始），也就是`*`的匹配结果；`${2}_temperature`则是将匹配结果与`temperature`通过下划线拼接了起来，构成视图下各序列的节点名称。

上述创建视图的语句，和下列写法是等价的：

```SQL
CREATE VIEW root.db.view(${2}_${3}）
AS
    SELECT temperature from root.db.*
```

最终视图中含有这些序列：

1. root.db.view.d1_temperature
2. root.db.view.d2_temperature
3. ...

使用通配符创建，只会存储创建时刻的静态映射关系。

#### 3.1.6 创建视图时SELECT子句受到一定限制

创建序列视图时，使用的SELECT子句受到一定限制。主要限制如下：

1. 不能使用`WHERE`子句。
2. 不能使用`GROUP BY`子句。
3. 不能使用`MAX_VALUE`等聚合函数。

简单来说，`AS`后只能使用`SELECT ... FROM ... `的结构，且该查询语句的结果必须能构成一条时间序列。

### 3.2 视图数据查询

对于可以支持的数据查询功能，在执行时序数据查询时，序列视图与时间序列可以无差别使用，行为完全一致。

**目前序列视图不支持的查询类型如下：**

1. **align by device 查询**
2. **group by tags 查询**

用户也可以在同一个SELECT语句中混合查询时间序列与序列视图，比如：

```SQL
SELECT temperature01, temperature02, avg_temperature
FROM root.db.d01
WHERE temperature01 < temperature02
```

但是，如果用户想要查询序列的元数据，例如tag、attributes等，则查询到的是序列视图的结果，而并非序列视图所引用的时间序列的结果。

此外，对于别名序列，如果用户想要得到时间序列的tag、attributes等信息，则需要先查询视图列的映射，找到对应的时间序列，再向时间序列查询tag、attributes等信息。查询视图列的映射的方法将会在3.5部分说明。

### 3.3 视图修改

对视图的修改，例如改名、修改计算逻辑、删除等操作，都和创建新的视图类似，需要重新指定整个视图的全部列相关的描述。

#### 3.3.1 修改视图数据来源

```SQL
ALTER VIEW root.view.device.status
AS
    SELECT s01
    FROM root.ln.wf.d01
```

#### 3.3.2 修改视图的计算逻辑

```SQL
ALTER VIEW root.db.d01.avg_temperature
AS
    SELECT (temperature01 + temperature02 + temperature03) / 3
    FROM root.db.d01
```

#### 3.3.3 标签点管理

- 添加新的标签

```SQL
ALTER view root.turbine.d1.s1 ADD TAGS tag3=v3, tag4=v4
```

- 添加新的属性

```SQL
ALTER view root.turbine.d1.s1 ADD ATTRIBUTES attr3=v3, attr4=v4
```

- 重命名标签或属性

```SQL
ALTER view root.turbine.d1.s1 RENAME tag1 TO newTag1
```

- 重新设置标签或属性的值

```SQL
ALTER view root.turbine.d1.s1 SET newTag1=newV1, attr1=newV1
```

- 删除已经存在的标签或属性

```SQL
ALTER view root.turbine.d1.s1 DROP tag1, tag2
```

- 更新插入别名，标签和属性

> 如果该别名，标签或属性原来不存在，则插入，否则，用新值更新原来的旧值

```SQL
ALTER view root.turbine.d1.s1 UPSERT TAGS(tag2=newV2, tag3=v3) ATTRIBUTES(attr3=v3, attr4=v4)
```

#### 3.3.4 删除视图

因为一个视图就是一条序列，因此可以像删除时间序列一样删除一个视图。

扩充原有删除时间序列的方法，不新增`DELETE VIEW`的语句。

```SQL
DELETE VIEW root.view.device.avg_temperatue
```

### 3.4 视图同步

序列视图的数据总是经由实时的查询获得，因此天然支持数据同步。

#### 如果依赖的原序列被删除了

当序列视图查询时（序列解析时），如果依赖的时间序列不存在，则**返回空结果集**。

这和查询一个不存在的序列的反馈类似，但是有区别：如果依赖的时间序列无法解析，空结果集是包含表头的，以此来提醒用户该视图是存在问题的。

此外，被依赖的时间序列删除时，不会去查找是否有依赖于该列的视图，用户不会收到任何警告。

#### 不支持非别名序列的数据写入

不支持向非别名序列的写入。

详情请参考前文 2.1.6 限制2

#### 序列的元数据不共用

详情请参考前文2.1.6 限制5

### 3.5 视图元数据查询

视图元数据查询，特指查询视图本身的元数据（例如视图有多少列），以及数据库内视图的信息（例如有哪些视图）。

#### 3.5.1 查看当前的视图列

用户有两种查询方式：

1. 使用`SHOW TIMESERIES`进行查询，该查询既包含时间序列，也包含序列视图。但是只能显示视图的部分属性
2. 使用`SHOW VIEW`进行查询，该查询只包含序列视图。能完整显示序列视图的属性。

举例：

```Shell
IoTDB> show timeseries;
+--------------------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+
|          Timeseries|Alias|Database|DataType|Encoding|Compression|Tags|Attributes|Deadband|DeadbandParameters|ViewType|
+--------------------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+
|root.db.device.s01  | null| root.db|   INT32|     RLE|     SNAPPY|null|      null|    null|              null|    BASE|
+--------------------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+
|root.db.view.status | null| root.db|   INT32|     RLE|     SNAPPY|null|      null|    null|              null|    VIEW|
+--------------------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+
|root.db.d01.temp01  | null| root.db|   FLOAT|     RLE|     SNAPPY|null|      null|    null|              null|    BASE|
+--------------------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+
|root.db.d01.temp02  | null| root.db|   FLOAT|     RLE|     SNAPPY|null|      null|    null|              null|    BASE|
+--------------------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+
|root.db.d01.avg_temp| null| root.db|   FLOAT|    null|       null|null|      null|    null|              null|    VIEW|
+--------------------+-----+--------+--------+--------+-----------+----+----------+--------+------------------+--------+
Total line number = 5
It costs 0.789s
IoTDB>
```

最后一列`ViewType`中显示了该序列的类型，时间序列为BASE，序列视图是VIEW。

此外，某些序列视图的属性会缺失，比如`root.db.d01.avg_temp`是由温度均值计算得来，所以`Encoding`和`Compression`属性都为空值。

此外，`SHOW TIMESERIES`语句的查询结果主要分为两部分:

1. 时序数据的信息，例如数据类型，压缩方式，编码等
2. 其他元数据信息，例如tag，attribute，所属database等

对于序列视图，展示的时序数据信息与其原始序列一致或者为空值（比如计算得到的平均温度有数据类型但是无压缩方式）；展示的元数据信息则是视图的内容。

如果要得知视图的更多信息，需要使用`SHOW ``VIEW`。`SHOW ``VIEW`中展示视图的数据来源等。

```Shell
IoTDB> show VIEW root.**;
+--------------------+--------+--------+----+----------+--------+-----------------------------------------+
|          Timeseries|Database|DataType|Tags|Attributes|ViewType|                                   SOURCE|
+--------------------+--------+--------+----+----------+--------+-----------------------------------------+
|root.db.view.status | root.db|   INT32|null|      null|    VIEW|                       root.db.device.s01|
+--------------------+--------+--------+----+----------+--------+-----------------------------------------+
|root.db.d01.avg_temp| root.db|   FLOAT|null|      null|    VIEW|(root.db.d01.temp01+root.db.d01.temp02)/2|
+--------------------+--------+--------+----+----------+--------+-----------------------------------------+
Total line number = 2
It costs 0.789s
IoTDB>
```

最后一列`SOURCE`显示了该序列视图的数据来源，列出了创建该序列的SQL语句。

##### 关于数据类型

上述两种查询都涉及视图的数据类型。视图的数据类型是根据定义视图的查询语句或别名序列的原始时间序列类型推断出来的。这个数据类型是根据当前系统的状态实时计算出来的，因此在不同时刻查询到的数据类型可能是改变的。

## 四、FAQ

####Q1：我想让视图实现类型转换的功能。例如，原有一个int32类型的时间序列，和其他int64类型的序列被放在了同一个视图中。我现在希望通过视图查询到的数据，都能自动转换为int64类型。

> Ans：这不是序列视图的职能范围。但是可以使用`CAST`进行转换，比如：

```SQL
CREATE VIEW root.db.device.int64_status
AS 
    SELECT CAST(s1, 'type'='INT64') from root.db.device
```

> 这样，查询`root.view.status`时，就会得到int64类型的结果。
> 
> 请特别注意，上述例子中，序列视图的数据是通过`CAST`转换得到的，因此`root.db.device.int64_status`并不是一条别名序列，也就**不支持写入**。

####Q2：是否支持默认命名？选择若干时间序列，创建视图；但是我不指定每条序列的名字，由数据库自动命名？

> Ans：不支持。用户必须明确指定命名。

#### Q3：在原有体系中，创建时间序列`root.db.device.s01`，可以发现自动创建了database`root.db`，自动创建了device`root.db.device`。接着删除时间序列`root.db.device.s01`，可以发现`root.db.device`被自动删除，`root.db`却还是保留的。对于创建视图，会沿用这一机制吗？出于什么考虑呢？

> Ans：保持原有的行为不变，引入视图功能不会改变原有的这些逻辑。

#### Q4：是否支持序列视图重命名？

> A：当前版本不支持重命名，可以自行创建新名称的视图投入使用。