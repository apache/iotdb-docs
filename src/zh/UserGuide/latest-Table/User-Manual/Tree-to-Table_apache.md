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
# 树转表视图

## 1. 功能概述

IoTDB 提供了树转表功能，支持通过创建表视图的方式，将已存在的树模型数据转化为表视图，进而通过表视图进行查询，实现了对同一份数据的树模型和表模型协同处理：

* 数据写入阶段，采用树模型语法，支持数据灵活接入和扩展。
* 数据分析阶段，采用表模型语法，支持通过标准 SQL 查询语言，执行复杂的数据分析。

![](/img/tree-to-table-1.png)

> - V2.0.5 及以后版本支持该功能。
> - 表视图只读，不允许通过表视图写入数据。

## 2. 功能介绍
### 2.1 创建表视图
#### 2.1.1 语法定义

```SQL
-- create (or replace) view on tree
CREATE
    [OR REPLACE]
    VIEW view_name ([viewColumnDefinition (',' viewColumnDefinition)*])
    [comment]
    [RESTRICT]
    [WITH properties]
    AS prefixPath

viewColumnDefinition
  : column_name [dataType] TAG [comment]                                    # tagColumn
  | column_name [dataType] TIME [comment]                                   # timeColumn
  | column_name [dataType] FIELD [FROM original_measurement] [comment]    # fieldColumn
  ;
  
comment
  : COMMENT string
  ;
```

> 注意：列仅支持 tag / field / time，不支持 attribute。

#### 2.1.2 语法说明
1. **`prefixPath`**

对应树模型的路径，路径最后一级必须为 `**`，且其他层级均不能出现 `*` 或 `**`。该路径确定 VIEW 对应的子树。

2. **`view_name`**

视图名称，与表名相同（具体约束可参考[创建表](../Basic-Concept/Table-Management_apache.md#\_1-1-创建表)），如 db.view。

3. **`viewColumnDefinition`**

* `TAG`：每个 Tag 列按顺序对应`prefixPath`后面层级的路径节点。
* `FIELD`：FIELD 列对应树模型中的测点（叶子节点）。
    * 若指定了 FIELD 列，则列名使用声明中的`column_name`。
        * 若声明了 `original_measurement`，则直接映射到树模型该测点。否则取小写`column_name` 作为测点名进行树模型映射。
        * 不支持多个 FIELD 映射到树模型同名测点。
        * 若未指定 FIELD 列的 `dataType`，则默认获取树模型映射测点的数据类型。
        * 若树模型中的设备不包含某些声明的 FIELD 列，或与声明的 FIELD 列的数据类型不一致，则在查询该设备时，该 FIELD 列的值永远为 NULL。
    * 若未指定 FIELD 列，则创建时会自动扫描出`prefixPath`子树下所有的测点（包括定义为所有普通序列的测点，以及挂载路径与 `prefixPath `有所重合的所有模板中的测点），列名使用树模型测点名称。
        * 不支持树模型存在名称（含小写）相同但类型不同的测点

4. **`WITH properties`**

目前仅支持 TTL，表示该视图 TTL ms 之前的数据不会在查询时展示，即`WHERE time > now() - TTL`。若树模型设置了 TTL，则查询时取两者中的更小值。

> 注意：表视图 TTL 不影响树模型中设备的真实 TTL，当设备数据达到树模型设定的 TTL 后，将被系统物理删除。

5. **`OR REPLACE`**

table 与 view 不能重名。创建时若已存在同名 table ，则会报错；若已存在同名 view ，则进行替换。

6. **`RESTRICT`**

约束匹配树模型设备的层级数（从 prefixPath 下一层开始），若有 RESTRICT 字段，则匹配层级完全等于 tag 数量的 device，否则匹配层级小于等于 tag 数量的 device。默认非 RESTRICT，即匹配层级小于等于 tag 数量的 device。

#### 2.1.3 使用示例
1. 树模型及表视图原型

![](/img/tree-to-table-2.png)

2. 创建表视图

* 创建语句

```SQL
CREATE OR REPLACE VIEW viewdb."风机表"
  ("风机组" TAG, 
   "风机号" TAG, 
   "电压" DOUBLE FIELD, 
   "电流" DOUBLE FIELD
  ) 
with (ttl=604800000)
AS root.db.**
```

* 具体说明

该语句表示，创建出名为 `viewdb."风机表"` 的视图（viewdb 如不存在会报错），如果该视图已存在，则替换该视图：

* 为挂载于树模型 root.db.\*\* 路径下面的序列创建表视图。
* 具备`风机组`、`风机号`两个 `TAG` 列，因此表视图中只包含原树模型中第 3 层上的设备。
* 具备`电压`、`电流`两个 `FIELD` 列。这里两个 `FIELD` 列对应树模型下的序列名同样是`电压`、`电流`，且仅仅选取类型为 `DOUBLE` 的序列。
  
    **​序列名的改名需求：​**如果树模型下的序列名为`current`，想要创建出的表视图中对应的 `FIELD` 列名为`电流`，这种情况下，SQL 变更如下：

  ```SQL
  CREATE OR REPLACE VIEW viewdb."风机表"
    ("风机组" TAG, 
     "风机号" TAG, 
     "电压" DOUBLE FIELD, 
     "电流" DOUBLE FIELD FROM current
     ) 
  AS root.db.**
  with (ttl=604800000)
  ```

### 2.2 修改表视图
#### 2.2.1 语法定义

修改表视图功能支持修改视图名称、添加列、列重命名、删除列、设置视图的 TTL 属性，以及通过 COMMENT 添加注释。

```SQL
-- 修改视图名
ALTER VIEW [IF EXISTS] viewName RENAME TO to=identifier  
            
-- 在视图中添加某一列
ALTER VIEW [IF EXISTS] viewName ADD COLUMN [IF NOT EXISTS] viewColumnDefinition 
viewColumnDefinition
  : column_name [dataType] TAG                                     # tagColumn
  | column_name [dataType] FIELD [FROM original_measurement]     # fieldColumn
  
-- 为视图中的某一列重命名
ALTER VIEW [IF EXISTS] viewName RENAME COLUMN [IF EXISTS] oldName TO newName   

-- 删除视图中的某一列
ALTER VIEW [IF EXISTS] viewName DROP COLUMN [IF EXISTS] columnName    
              
-- 修改视图的 TTL
ALTER VIEW [IF EXISTS] viewName SET PROPERTIES propertyAssignments

-- 添加注释
COMMENT ON VIEW qualifiedName IS (string | NULL) #commentView
COMMENT ON COLUMN qualifiedName '.' column=identifier IS (string | NULL) #commentColumn
```

#### 2.2.2 语法说明
1. `SET PROPERTIES`操作目前仅支持对表视图的 TTL 属性进行配置。
2. 删除列功能，仅支持删除物理量列(FIELD)，标识列(TAG)不支持删除。
3. 修改后的 comment 会覆盖原有注释，如果指定为 null，则会擦除之前的 comment。
#### 2.2.3 使用示例

```SQL
-- 修改视图名
ALTER VIEW IF EXISTS tableview1 RENAME TO tableview
            
-- 在视图中添加某一列
ALTER VIEW IF EXISTS tableview ADD COLUMN IF NOT EXISTS temperature float field
  
-- 为视图中的某一列重命名
ALTER VIEW IF EXISTS tableview RENAME COLUMN IF EXISTS temperature TO temp

-- 删除视图中的某一列
ALTER VIEW IF EXISTS tableview DROP COLUMN IF EXISTS temp
              
-- 修改视图的 TTL
ALTER VIEW IF EXISTS tableview SET PROPERTIES TTL=3600

-- 添加注释
COMMENT ON VIEW tableview IS '树转表'
COMMENT ON COLUMN tableview.status is Null
```

### 2.3 删除表视图
#### 2.3.1 语法定义

```SQL
DROP VIEW [IF EXISTS] viewName
```

#### 2.3.2 使用示例

```SQL
DROP VIEW IF EXISTS tableview
```

### 2.4 查看表视图
#### 2.4.1 **`Show Tables`**
1. 语法定义

```SQL
SHOW TABLES (DETAILS)? ((FROM | IN) database_name)?
```

2. 语法说明

`SHOW TABLES (DETAILS)` 语句通过结果集的`TABLE_TYPE`字段展示表或视图的类型信息：

| 类型                                 | `TABLE_TYPE`字段值 |
| -------------------------------------- | ------------------------ |
| 普通表（Table)                       | `BASE TABLE`       |
| 树转表视图（Tree View)               | `VIEW FROM TREE`   |
| 系统表（Iinformation\_schema.Tables) | `SYSTEM VIEW`      |

3. 使用示例

```SQL
IoTDB> show tables details from database1
+-----------+-----------+------+-------+--------------+
|  TableName|    TTL(ms)|Status|Comment|     TableType|
+-----------+-----------+------+-------+--------------+
|  tableview|        INF| USING| 树转表 |VIEW FROM TREE|
|     table1|31536000000| USING|   null|    BASE TABLE|
|     table2|31536000000| USING|   null|    BASE TABLE|
+-----------+-----------+------+-------+--------------+

IoTDB> show tables details from information_schema 
+--------------+-------+------+-------+-----------+
|     TableName|TTL(ms)|Status|Comment|  TableType|
+--------------+-------+------+-------+-----------+
|       columns|    INF| USING|   null|SYSTEM VIEW|
|  config_nodes|    INF| USING|   null|SYSTEM VIEW|
|configurations|    INF| USING|   null|SYSTEM VIEW|
|    data_nodes|    INF| USING|   null|SYSTEM VIEW|
|     databases|    INF| USING|   null|SYSTEM VIEW|
|     functions|    INF| USING|   null|SYSTEM VIEW|
|      keywords|    INF| USING|   null|SYSTEM VIEW|
|        models|    INF| USING|   null|SYSTEM VIEW|
|         nodes|    INF| USING|   null|SYSTEM VIEW|
|  pipe_plugins|    INF| USING|   null|SYSTEM VIEW|
|         pipes|    INF| USING|   null|SYSTEM VIEW|
|       queries|    INF| USING|   null|SYSTEM VIEW|
|       regions|    INF| USING|   null|SYSTEM VIEW|
| subscriptions|    INF| USING|   null|SYSTEM VIEW|
|        tables|    INF| USING|   null|SYSTEM VIEW|
|        topics|    INF| USING|   null|SYSTEM VIEW|
|         views|    INF| USING|   null|SYSTEM VIEW|
+--------------+-------+------+-------+-----------+
```

#### 2.4.2 **`Show Create Table/View`**
1. 语法定义

```SQL
SHOW CREATE TABLE|VIEW viewname;
```

2. 语法说明

* SHOW CREATE TABLE  语句可用于展示普通表或者视图的完整创建信息；
* SHOW CREATE VIEW 语句仅可用于展示视图的完整创建信息；
* 两种语句均不支持用于展示系统表；

3. 使用示例

```SQL
IoTDB> show create table tableview
+---------+-------------------------------------------------------------------------------------------------------------------------------------------------------------+
|     View|                                                                                                                                                  Create View|
+---------+-------------------------------------------------------------------------------------------------------------------------------------------------------------+
|tableview|CREATE VIEW "tableview" ("device" STRING TAG,"model" STRING TAG,"status" BOOLEAN FIELD,"hardware" STRING FIELD) COMMENT '树转表' WITH (ttl=INF) AS root.ln.**|
+---------+-------------------------------------------------------------------------------------------------------------------------------------------------------------+

IoTDB> show create view tableview
+---------+-------------------------------------------------------------------------------------------------------------------------------------------------------------+
|     View|                                                                                                                                                  Create View|
+---------+-------------------------------------------------------------------------------------------------------------------------------------------------------------+
|tableview|CREATE VIEW "tableview" ("device" STRING TAG,"model" STRING TAG,"status" BOOLEAN FIELD,"hardware" STRING FIELD) COMMENT '表视图' WITH (ttl=INF) AS root.ln.**|
+---------+-------------------------------------------------------------------------------------------------------------------------------------------------------------+
```

### 2.5 非对齐与对齐设备的查询差异

树转表视图在查询对齐设备和非对齐设备中有 null 值的情况下结果​**可能与等价的树模型 align by device 查询不同**​。

* **对齐设备**
    * 树模型的查询表现：当查询涉及的所有序列在某一行都是null时，不保留该行
    * 表视图的查询表现：与表模型一致，保留全是 null 的行
* **非对齐设备**
    * 树模型的查询表现：当查询涉及的所有序列在某一行都是null时，不保留该行
    * 表视图的查询表现：与树模型一致，不保留全是 null 的行
* **说明示例**
    * 对齐

  ```SQL
  -- 树模型写入数据（对齐）
  CREATE ALIGNED TIMESERIES root.db.battery.b1(voltage INT32, current FLOAT)
  INSERT INTO root.db.battery.b1(time, voltage, current) aligned values (1, 1, 1)
  INSERT INTO root.db.battery.b1(time, voltage, current) aligned values (2, null, 1)
  
  -- 创建 VIEW 语句
  CREATE VIEW view1 (battery_id TAG, voltage INT32 FIELD, current FLOAT FIELD) as root.db.battery.**
  
  -- 查询
  IoTDB> select voltage from view1
  +-------+
  |voltage|
  +-------+
  |      1|
  |   null|
  +-------+
  Total line number = 2
  ```

    * 非对齐

  ```SQL
  -- 树模型写入数据（非对齐）
  CREATE TIMESERIES root.db.battery.b1.voltage INT32
  CREATE TIMESERIES root.db.battery.b1.current FLOAT
  INSERT INTO root.db.battery.b1(time, voltage, current) values (1, 1, 1)
  INSERT INTO root.db.battery.b1(time, voltage, current) values (2, null, 1)
  
  -- 创建 VIEW 语句
  CREATE VIEW view1 (battery_id TAG, voltage INT32 FIELD, current FLOAT FIELD) as root.db.battery.**
  
  -- 查询
  IoTDB> select voltage from view1
  +-------+
  |voltage|
  +-------+
  |      1|
  +-------+
  Total line number = 1
  
  -- 如果在查询语句中指定了所有 field 列，或是仅指定了非 field 列时，才可以确保查到所有行
  IoTDB> select voltage,current from view1
  +-------+-------+
  |voltage|current|
  +-------+-------+
  |      1|    1.0|
  |   null|    1.0|
  +-------+-------+
  Total line number = 2
  
  IoTDB> select battery_id from view1
  +-------+
  |battery_id|
  +-------+
  |     b1|
  |     b1|
  +-------+
  Total line number = 2
  
  -- 如果查询中同时有部分 field 列，那最终结果的行数取决于这部分 field 列根据时间戳对齐后的行数
  IoTDB> select time,voltage from view1
  +-----------------------------+-------+
  |                         time|voltage|
  +-----------------------------+-------+
  |1970-01-01T08:00:00.001+08:00|      1|
  +-----------------------------+-------+
  Total line number = 1
  ```

## 3. 场景示例
### 3.1 原树模型管理了多种类型的设备

* 场景中不同类型的设备具备不同的层级路径和测点集合。
* ​**写入时**​：在数据库节点下按设备类型创建分支，每种设备下可以有不同的测点结构
* ​**查询时**​：为每种类型的设备建立一张表，每个表具有不同的标签和测点集合

![](/img/tree-to-table-3.png)

**表视图的创建 SQL：**

```SQL
-- 风机表
CREATE VIEW viewdb."风机表"
  ("风机组" TAG, 
   "风机号" TAG, 
   "电压" DOUBLE FIELD, 
   "电流" DOUBLE FIELD
   ) 
AS root.db."风机".**

-- 电机表
CREATE VIEW viewdb."电机表"
  ("电机组" TAG, 
   "电机号" TAG, 
   "功率" FLOAT FIELD, 
   "电量" FLOAT FIELD,
   "温度" FLOAT FIELD
   ) 
AS root.db."电机".**
```

### 3.2 原树模型中没有设备，只有测点

如场站的监控系统中，每个测点都有唯一编号，但无法对应到某些设备

> 大宽表形式

![](/img/tree-to-table-4.png)

**表视图的创建 SQL：**

```SQL
CREATE VIEW viewdb.machine
  (DCS_PIT_02105A DOUBLE FIELD, 
   DCS_PIT_02105B DOUBLE FIELD,
   DCS_PIT_02105C DOUBLE FIELD,
   ...
   DCS_XI_02716A DOUBLE FIELD
   ) 
AS root.db.**
```

### 3.3 原树模型中一个设备既有子设备，也有测点

如在储能场景中，每一层结构都要监控其电压和电流

* ​**写入时**​：按照物理世界的监测点，对每一层结构进行建模
* ​**查询时**​：按照设备分类，建立多个表对每一层结构信息进行管理

![](/img/tree-to-table-5.png)

**表视图的创建 SQL：**

```SQL
-- 电池舱表
CREATE VIEW viewdb."电池舱表"
  ("电池站" TAG, 
   "电池舱" TAG, 
   "电压" DOUBLE FIELD, 
   "电流" DOUBLE FIELD
   ) 
RESTRICT
AS root.db.**

-- 电池堆表
CREATE VIEW viewdb."电池堆表"
  ("电池站" TAG, 
   "电池舱" TAG, 
   "电池堆" TAG, 
   "电压" DOUBLE FIELD, 
   "电流" DOUBLE FIELD
   ) 
RESTRICT
AS root.db.**

-- 电池簇表
CREATE VIEW viewdb."电池簇表"
  ("电池站" TAG, 
   "电池舱" TAG, 
   "电池堆" TAG, 
   "电池簇" TAG,
   "电压" DOUBLE FIELD, 
   "电流" DOUBLE FIELD
   ) 
RESTRICT
AS 'root.db.**'

-- 电芯表
CREATE VIEW viewdb."电芯表"
  ("电池站" TAG, 
   "电池舱" TAG, 
   "电池堆" TAG, 
   "电池簇" TAG,
   "电芯" TAG,
   "电压" DOUBLE FIELD, 
   "电流" DOUBLE FIELD
   )
RESTRICT
AS root.db.**
```

### 3.4 原树模型中一个设备下只有一个测点

> 窄表形式

#### 3.4.1 所有测点数据类型相同

![](/img/tree-to-table-6.png)

**表视图的创建 SQL：**

```SQL
CREATE VIEW viewdb.machine
  (
   sensor_id STRING TAG,
   value DOUBLE FIELD
   ) 
AS root.db.**
```

#### 3.4.2 测点的数据类型不相同
##### 3.4.2.1 为每一种数据类型的测点建一个窄表视图

​**优点**​：表视图数量是常数个，仅与系统中的数据类型相关

​**缺点**​：查询某一个测点值时，需要提前知道其数据类型，再去决定查询哪张表视图

![](/img/tree-to-table-7.png)

**表视图的创建 SQL：**

```SQL
CREATE VIEW viewdb.machine_float
  (
   sensor_id STRING TAG,
   value FLOAT FIELD
   ) 
AS root.db.**

CREATE VIEW viewdb.machine_double
  (
   sensor_id STRING TAG,
   value DOUBLE FIELD
   ) 
AS root.db.**

CREATE VIEW viewdb.machine_int32
  (
   sensor_id STRING TAG,
   value INT32 FIELD
   ) 
AS root.db.**

CREATE VIEW viewdb.machine_int64
  (
   sensor_id STRING TAG,
   value INT64 FIELD
   ) 
AS root.db.**

...
```

##### 3.4.2.2 为每一个测点建一个表

​**优点**​：查询某一个测点值时，不需要先查一下数据类型，再去决定查询哪张表，简单便捷

​**缺点**​：当测点数量较多时，会引入过多的表视图，需要写大量的建视图语句

![](/img/tree-to-table-8.png)

**表视图的创建 SQL：**

```SQL
CREATE VIEW viewdb.DCS_PIT_02105A
  (
   value FLOAT FIELD
   ) 
AS root.db.DCS_PIT_02105A.**

CREATE VIEW viewdb.DCS_PIT_02105B
  (
   value DOUBLE FIELD
   ) 
AS root.db.DCS_PIT_02105B.**

CREATE VIEW viewdb.DCS_XI_02716A
  (
   value INT64 FIELD
   ) 
AS root.db.DCS_XI_02716A.**

......
```
