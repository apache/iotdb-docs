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

# 模式查询

IoTDB 针对时序数据的特色分析场景，提供了模式查询能力，为时序数据的深度挖掘与复杂计算提供了灵活高效的解决方案。下文将对该功能进行详细的介绍。

## 1. 概述

模式查询支持通过定义模式变量的识别逻辑以及正则表达式来捕获一段连续的数据，并对每一段捕获的数据进行分析计算，适用于识别时序数据中的特定模式(如下图所示）、检测特定事件等业务场景。

![](/img/timeseries-featured-analysis-1.png)

> 注意：该功能从 V 2.0.5 版本开始提供。

## 2. 功能介绍
### 2.1 语法格式

```SQL
MATCH_RECOGNIZE (
  [ PARTITION BY column [, ...] ]
  [ ORDER BY column [, ...] ]
  [ MEASURES measure_definition [, ...] ]
  [ ROWS PER MATCH ]
  [ AFTER MATCH skip_to ]
  PATTERN ( row_pattern )
  [ SUBSET subset_definition [, ...] ]
  DEFINE variable_definition [, ...]
)
```

**说明：**

* PARTITION BY ： 可选，用于对输入表进行分组，每个分组能独立进行模式匹配。如果未声明该子句，则整个输入表将作为一个整体进行处理。
* ORDER BY ：可选，用于确保输入数据按某种顺序进行匹配处理。
* MEASURES ：可选，用于指定从匹配到的一段数据中提取哪些信息。
* ROWS PER MATCH ：可选，用于指定模式匹配成功后结果集的输出方式。
* AFTER MATCH SKIP ：可选，用于指定在识别到一个非空匹配后，下一次模式匹配应从哪一行继续进行。
* PATTERN ：用于定义需要匹配的行模式。
* SUBSET ：可选，用于将多个基本模式变量所匹配的行合并为一个逻辑集合。
* DEFINE ：用于定义行模式的基本模式变量。

**语法示例原始数据：**

```SQL
IoTDB:database3> select * from t
+-----------------------------+------+----------+
|                         time|device|totalprice|
+-----------------------------+------+----------+
|2025-01-01T00:01:00.000+08:00|    d1|        90|
|2025-01-01T00:02:00.000+08:00|    d1|        80|
|2025-01-01T00:03:00.000+08:00|    d1|        70|
|2025-01-01T00:04:00.000+08:00|    d1|        80|
|2025-01-01T00:05:00.000+08:00|    d1|        70|
|2025-01-01T00:06:00.000+08:00|    d1|        80|
+-----------------------------+------+----------+

-- 创建语句
create table t(device tag, totalprice int32 field)

insert into t(time,device,totalprice) values(2025-01-01T00:01:00, 'd1', 90),(2025-01-01T00:02:00, 'd1', 80),(2025-01-01T00:03:00, 'd1', 70),(2025-01-01T00:04:00, 'd1', 80),(2025-01-01T00:05:00, 'd1', 70),(2025-01-01T00:06:00, 'd1', 80)
```

### 2.2 DEFINE 子句

用于为模式识别中的每个基本模式变量指定其判断条件。这些变量通常由标识符（如 `A`, `B`）代表，并通过该子句中的布尔表达式精确定义哪些行符合该变量的要求。

* 在模式匹配执行过程中，仅当布尔表达式返回 TRUE 时，才会将当前行标记为该变量，从而将其纳入到当前匹配分组中。

```SQL
-- 只有在当前行的 totalprice 值小于前一行 totalprice 值的情况下，当前行才可以被识别为 B。
DEFINE B AS totalprice < PREV(totalprice)
```

* **未**在子句中**显式**定义的变量，其匹配条件隐含为恒真（TRUE），即可在任何输入行上成功匹配。

### 2.3 SUBSET 子句

用于将多个基本模式变量（如 `A`、`B`）匹配到的行合并成一个联合模式变量（如 `U`），使这些行可以被视为同一个逻辑集合进行操作。可用于`MEASURES`、`DEFINE `和`AFTER MATCH SKIP`子句。

```SQL
SUBSET U = (A, B)
```

例如，对于模式 `PATTERN ((A | B){5} C+)` ，在匹配过程中无法确定第五次重复时具体匹配的是基本模式变量 A 还是 B，因此

1. 在 `MEASURES `子句中，若需要引用该阶段最后一次匹配到的行，则可通过定义联合模式变量 `SUBSET U = (A, B)`实现。此时表达式 `RPR_LAST(U.totalprice)` 将直接返回该目标行的 `totalprice` 值。
2. 在 `AFTER MATCH SKIP` 子句中，若匹配结果中未包含基本模式变量 A 或 B 时，执行 `AFTER MATCH SKIP TO LAST B` 或 `AFTER MATCH SKIP TO LAST A` 会因锚点缺失跳转失败；而通过引入联合模式变量 `SUBSET U = (A, B)`，使用 `AFTER MATCH SKIP TO LAST U` 则始终有效。

### 2.4 PATTERN 子句

用于定义需要匹配的行模式，其基本构成单元是**基本模式变量。**

```SQL
PATTERN ( row_pattern )
```

#### 2.4.1 模式种类

| 行模式                            | 语法格式                | 描述                                                                                                                                                                                                                                                 |
| ----------------------------------- |---------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 模式连接（Pattern Concatenation） | `A B+ C+ D+`        | 由不带任何运算符的子模式组成，按声明顺序依次匹配所有子模式。|
| 模式选择（Pattern Alternation）   | `A \| B \| C`       | 由以`\|`分隔的多个子模式组成，仅匹配其中一个。当多个子模式均可匹配时，选择最左侧的子模式匹配。                                                                                                                                                    |
| 模式排列（Pattern Permutation）   | `PERMUTE(A, B, C)`  | 该模式等价于对所有子模式元素的不同顺序进行选择匹配，即要求 A、B、C 三者均须匹配，但其出现顺序不固定。当多种匹配顺序均可成功时，依据 PERMUTE 列表中元素的定义先后顺序，按**字典序原则**确定优先级。例如，A B C 为最高优先，C B A 则为最低优先。 |
| 模式分组（Pattern Grouping）      | `(A B C)`           | 用圆括号将子模式括起，视作一个整体对待，可与其他运算符配合使用。如`(A B C)+`表示连续出现一组`(A B C)`的模式。                                                                                                                                |
| 空模式（Empty Pattern）           | `()`                | 表示一个不包含任何行的空匹配                                                                                                                                                                                                                         |
| 模式排除（Pattern Exclusion）     | `{- row_pattern -}` | 用于指定在输出中需要排除的匹配部分。通常与`ALL ROWS PER MATCH`选项结合使用，用于输出感兴趣的行。如`PATTERN (A {- B+ C+ -} D+)`，并使用`ALL ROWS PER MATCH`时，输出将仅包含匹配的首行（`A`对应行）与尾部行（`D+`对应行）。        |

#### 2.4.2 分区起始/结束锚点（Partition Start/End Anchor）

* `^A` 表示匹配以 A 为分区开始的模式
    * 当 PATTERN 子句的取值为 `^A` 时，要求匹配必须从分区的首行开始，且这一行要满足 `A` 的定义
    * 当 PATTERN 子句的取值为 `^A^` 或 `A^` 时，输出结果为空
* `A$` 表示匹配以 A 为分区结束的模式
    * 当 PATTERN 子句的取值为 `A$` 时，要求必须在分区的结束位置匹配，并且这一行要满足 `A`的定义
    * 当 PATTERN 子句的取值为 `$A` 或 `$A$` 时，输出结果为空

**示例说明**

* 查询 sql

```SQL
SELECT m.time, m.match, m.price, m.label
FROM t
MATCH_RECOGNIZE ( 
    ORDER BY time 
    MEASURES 
         MATCH_NUMBER() AS match, 
         RUNNING RPR_LAST(totalprice) AS price, 
         CLASSIFIER() AS label 
    ALL ROWS PER MATCH 
    AFTER MATCH SKIP PAST LAST ROW 
    PATTERN %s -- PATTERN 子句 
    DEFINE A AS true 
) AS m;
```

* 查询结果
    * 当 PATTERN 子句为 PATTERN (^A) 时

  ![](/img/timeseries-featured-analysis-2.png)

  实际返回

  ```SQL
  +-----------------------------+-----+-----+-----+
  |                         time|match|price|label|
  +-----------------------------+-----+-----+-----+
  |2025-01-01T00:01:00.000+08:00|    1|   90|    A|
  +-----------------------------+-----+-----+-----+
  Total line number = 1
  ```

    * 当 PATTERN 子句为 PATTERN (^A^) 时，输出的结果为空，因为不可能从分区的起始位置开始匹配了一个 A 之后，又回到分区的起始位置

  ```SQL
  +----+-----+-----+-----+
  |time|match|price|label|
  +----+-----+-----+-----+
  +----+-----+-----+-----+
  Empty set.
  ```

    * 当 PATTERN 子句为 PATTERN (A\$) 时

  ![](/img/timeseries-featured-analysis-3.png)

  实际返回

  ```SQL
  +-----------------------------+-----+-----+-----+
  |                         time|match|price|label|
  +-----------------------------+-----+-----+-----+
  |2025-01-01T00:06:00.000+08:00|    1|   80|    A|
  +-----------------------------+-----+-----+-----+
  Total line number = 1
  ```

    * 当 PATTERN 子句为 PATTERN (\$A\$) 时，输出的结果为空

  ```SQL
  +----+-----+-----+-----+
  |time|match|price|label|
  +----+-----+-----+-----+
  +----+-----+-----+-----+
  Empty set.
  ```


#### 2.4.3 量词（Quantifiers）

量词用于指定子模式重复出现的次数，置于相应子模式之后，如 `(A | B)*`。

常用量词如下：

| 量词         | 描述                                                                                                                                                                                       |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `*`      | 零次或多次重复                                                                                                                                                                             |
| `+`      | 一次或多次重复                                                                                                                                                                             |
| `?`      | 零次或一次重复                                                                                                                                                                             |
| `{n}`    | 恰好重复 n 次                                                                                                                                                                              |
| `{m, n}` | 重复次数在 m 到 n 之间（m、n 为非负整数）。* 若省略左界，则默认从 0 开始；* 若省略右界，则重复次数不设上限（如 {5,} 等同于“至少重复五次”）；* 若同时省略左右界，即 {,}，则与 \* 等价。 |

* 可通过在量词后加 `?` 改变匹配偏好。
    * `{3,5}`：偏好 5 次，最不偏好 3 次；`{3,5}?`：偏好 3 次，最不偏好 5 次
    * `?`：偏好 1 次；`??`：偏好 0 次

### 2.5 AFTER MATCH SKIP 子句

用于指定在识别到一个非空匹配后，下一次模式匹配应从哪一行继续进行。

| 跳转策略                                                    | 描述                                              | 是否允许识别重叠匹配项 |
| ------------------------------------------------------------- | --------------------------------------------------- | ------------------------ |
| `AFTER MATCH SKIP PAST LAST ROW`                        | 默认行为。在当前匹配的最后一行之后的下一行开始。  | 否                     |
| `AFTER MATCH SKIP TO NEXT ROW`                          | 在当前匹配中的第二行开始。                        | 是                     |
| `AFTER MATCH SKIP TO [ FIRST \| LAST ] pattern_variable` | 跳转到某个模式变量的 [ 第一行 | 最后一行 ] 开始。 | 是                     |

* 在所有可能的配置中，仅当 `ALL ROWS PER MATCH WITH UNMATCHED ROWS` 与 `AFTER MATCH SKIP PAST LAST ROW` 联合使用时，系统才能确保对每个输入行恰好生成一条输出记录。

**示例说明**

* 查询 sql

```SQL
SELECT m.time, m.match, m.price, m.label
FROM t
MATCH_RECOGNIZE (
    ORDER BY time
    MEASURES 
        MATCH_NUMBER() AS match,
        RUNNING RPR_LAST(totalprice) AS price,
        CLASSIFIER() AS label
    ALL ROWS PER MATCH
    %s -- AFTER MATCH SKIP 子句
    PATTERN (A B+ C+ D?)
    SUBSET U = (C, D)
    DEFINE 
        B AS B.totalprice < PREV (B.totalprice),
        C AS C.totalprice > PREV (C.totalprice),
        D AS false -- 永远不会匹配成功
) AS m;
```

* 查询结果
    * 当 AFTER MATCH SKIP PAST LAST ROW 时

  ![](/img/timeseries-featured-analysis-4.png)

    *
        * 第一次匹配：第 1、2、3、4 行
        * 第二次匹配：根据 `AFTER MATCH SKIP PAST LAST ROW` 语义，从第 5 行开始，无法再找寻到一个合法匹配
        * 此模式一定不会出现重叠匹配

  ```SQL
  +-----------------------------+-----+-----+-----+
  |                         time|match|price|label|
  +-----------------------------+-----+-----+-----+
  |2025-01-01T00:01:00.000+08:00|    1|   90|    A|
  |2025-01-01T00:02:00.000+08:00|    1|   80|    B|
  |2025-01-01T00:03:00.000+08:00|    1|   70|    B|
  |2025-01-01T00:04:00.000+08:00|    1|   80|    C|
  +-----------------------------+-----+-----+-----+
  Total line number = 4
  ```

    * 当 AFTER MATCH SKIP TO NEXT ROW 时

  ![](/img/timeseries-featured-analysis-5.png)

    *
        * 第一次匹配：第 1、2、3、4 行
        * 第二次匹配：根据 `AFTER MATCH SKIP TO NEXT ROW` 语义，从第 2 行开始，匹配：第 2、3、4 行
        * 第三次匹配：尝试从第 3 行开始，失败
        * 第三次匹配：尝试从第 4 行开始，成功，匹配第 4、5、6行
        * 此模式允许出现重叠匹配

  ```SQL
  +-----------------------------+-----+-----+-----+
  |                         time|match|price|label|
  +-----------------------------+-----+-----+-----+
  |2025-01-01T00:01:00.000+08:00|    1|   90|    A|
  |2025-01-01T00:02:00.000+08:00|    1|   80|    B|
  |2025-01-01T00:03:00.000+08:00|    1|   70|    B|
  |2025-01-01T00:04:00.000+08:00|    1|   80|    C|
  |2025-01-01T00:02:00.000+08:00|    2|   80|    A|
  |2025-01-01T00:03:00.000+08:00|    2|   70|    B|
  |2025-01-01T00:04:00.000+08:00|    2|   80|    C|
  |2025-01-01T00:04:00.000+08:00|    3|   80|    A|
  |2025-01-01T00:05:00.000+08:00|    3|   70|    B|
  |2025-01-01T00:06:00.000+08:00|    3|   80|    C|
  +-----------------------------+-----+-----+-----+
  Total line number = 10
  ```

    * 当 AFTER MATCH SKIP TO FIRST C 时

  ![](/img/timeseries-featured-analysis-6.png)

    *
        * 第一次匹配：第 1、2、3、4 行
        * 第二次匹配：从第一个 C （也就是第 4 行）处开始，匹配第4、5、6行
        * 此模式允许出现重叠匹配

  ```SQL
  +-----------------------------+-----+-----+-----+
  |                         time|match|price|label|
  +-----------------------------+-----+-----+-----+
  |2025-01-01T00:01:00.000+08:00|    1|   90|    A|
  |2025-01-01T00:02:00.000+08:00|    1|   80|    B|
  |2025-01-01T00:03:00.000+08:00|    1|   70|    B|
  |2025-01-01T00:04:00.000+08:00|    1|   80|    C|
  |2025-01-01T00:04:00.000+08:00|    2|   80|    A|
  |2025-01-01T00:05:00.000+08:00|    2|   70|    B|
  |2025-01-01T00:06:00.000+08:00|    2|   80|    C|
  +-----------------------------+-----+-----+-----+
  Total line number = 7
  ```

    * 当 AFTER MATCH SKIP TO LAST B 或 AFTER MATCH SKIP TO B 时

  ![](/img/timeseries-featured-analysis-7.png)

    *
        * 第一次匹配：第 1、2、3、4 行
        * 第二次匹配：尝试从最后一个 B （也就是第 3 行）处开始，失败
        * 第二次匹配：尝试从第 4 行开始，成功匹配第4、5、6行
        * 此模式允许出现重叠匹配

  ```SQL
  +-----------------------------+-----+-----+-----+
  |                         time|match|price|label|
  +-----------------------------+-----+-----+-----+
  |2025-01-01T00:01:00.000+08:00|    1|   90|    A|
  |2025-01-01T00:02:00.000+08:00|    1|   80|    B|
  |2025-01-01T00:03:00.000+08:00|    1|   70|    B|
  |2025-01-01T00:04:00.000+08:00|    1|   80|    C|
  |2025-01-01T00:04:00.000+08:00|    2|   80|    A|
  |2025-01-01T00:05:00.000+08:00|    2|   70|    B|
  |2025-01-01T00:06:00.000+08:00|    2|   80|    C|
  +-----------------------------+-----+-----+-----+
  Total line number = 7
  ```

    * 当 AFTER MATCH SKIP TO U 时

  ![](/img/timeseries-featured-analysis-8.png)

    *
        * 第一次匹配：第 1、2、3、4 行
        * 第二次匹配：`SKIP TO U` 表示跳转到最后一个 C 或 D，D 永远不可能匹配成功，所以就是跳转到最后一个 C（也就是第 4 行），成功匹配第4、5、6行
        * 此模式允许出现重叠匹配

  ```SQL
  +-----------------------------+-----+-----+-----+
  |                         time|match|price|label|
  +-----------------------------+-----+-----+-----+
  |2025-01-01T00:01:00.000+08:00|    1|   90|    A|
  |2025-01-01T00:02:00.000+08:00|    1|   80|    B|
  |2025-01-01T00:03:00.000+08:00|    1|   70|    B|
  |2025-01-01T00:04:00.000+08:00|    1|   80|    C|
  |2025-01-01T00:04:00.000+08:00|    2|   80|    A|
  |2025-01-01T00:05:00.000+08:00|    2|   70|    B|
  |2025-01-01T00:06:00.000+08:00|    2|   80|    C|
  +-----------------------------+-----+-----+-----+
  Total line number = 7
  ```

    * 当 AFTER MATCH SKIP TO A 时，报错。因为不能跳转到匹配的第一行， 否则会造成死循环。

  ```SQL
  Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701: AFTER MATCH SKIP TO failed: cannot skip to first row of match
  ```

    * 当 AFTER MATCH SKIP TO B 时，报错。因为不能跳转到匹配分组中不存在的模式变量。

  ```SQL
  Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701: AFTER MATCH SKIP TO failed: pattern variable is not present in match
  ```


### 2.6 ROWS PER MATCH 子句

用于指定模式匹配成功后结果集的输出方式，主要包括以下两种选项：

| 输出方式           | 规则描述                                                                    | 输出结果                                                                                        | **空匹配/未匹配行**处理逻辑                                                                                                                                                                                                                                                                                |
| -------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ONE ROW PER MATCH  | 每一次成功匹配，产生一行输出结果。                                          | * PARTITION BY 子句中的列* MEASURES 子句中定义的表达式。                                      | 输出空匹配；跳过未匹配行。                                                                                                                                                                                                                                                                                       |
| ALL ROWS PER MATCH | 每一次匹配中的每一行都将产生一条输出记录，除非该行通过 exclusion 语法排除。 | * PARTITION BY 子句中的列* ORDER BY 子句中的列* MEASURES 子句中定义的表达式* 输入表中的其余列 | * 默认：输出空匹配；跳过未匹配行。* ALL ROWS PER MATCH​**SHOW EMPTY MATCHES**​：默认输出空匹配，跳过未匹配行* ALL ROWS PER MATCH​**OMIT EMPTY MATCHES**​：不输出空匹配，跳过未匹配行* ALL ROWS PER MATCH​**WITH UNMATCHED ROWS**​：输出空匹配，并为每一条未匹配行额外生成一条输出记录|

### 2.7 MEASURES 子句

用于指定从匹配到的一段数据中提取哪些信息。该子句为可选项，如果未显式指定，则根据 ROWS PER MATCH 子句的设置，部分输入列会成为模式识别的输出结果。

```SQL
MEASURES measure_expression AS measure_name [, ...]
```

* `measure_expression` 是根据匹配的一段数据计算出的标量值。

| 用法示例                                     | 说明                                                                                                         |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `A.totalprice AS starting_price`         | 返回匹配分组中第一行（即与变量 A 关联的唯一一行）中的价格，作为起始价格。                                    |
| `RPR_LAST(B.totalprice) AS bottom_price` | 返回与变量 B 关联的最后一行中的价格，代表“V”形模式中最低点的价格，对应下降区段的末尾。                     |
| `RPR_LAST(U.totalprice) AS top_price`    | 返回匹配分组中的最高价格，对应变量 C 或 D 所关联的最后一行，即整个匹配分组的末尾。【假设 SUBSET U = (C, D)】 |

* 每个 `measure_expression `都会定义一个输出列，该列可通过其指定的 `measure_name `进行引用。

### 2.8 模式查询表达式

在 MEASURES 与 DEFINE 子句中使用的表达式为​**标量表达式**​，用于在输入表的行级上下文中求值。**标量表达式**除了支持标准 SQL 语法外，还支持针对模式查询的特殊扩展函数。

#### 2.8.1 模式变量引用

```SQL
A.totalprice  
U.orderdate  
orderstatus
```

* 当列名前缀为某**基本模式变量**或**联合模式变量**时，表示引用该变量所匹配的所有行的对应列值。
* 若列名不带前缀，则等同于使用“​**全局联合模式变量**​”（即所有基本模式变量的并集）作前缀，表示引用当前匹配中所有行的该列值。

> 不允许在模式识别表达式中使用表名作列名前缀。

#### 2.8.2 扩展函数

| 函数名              | 函数式                                                                                                                                                                                                                                                                                                   | 描述                                                                                                                                                                                                                                                                                                   |
|------------------| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MATCH_NUMBER`函数 | `MATCH_NUMBER()`                                                                                                                                                                                                                                                                                     | 返回当前匹配在分区内的序号，从 1 开始计数。空匹配与非空匹配一致，也占用匹配序号。                                                                                                                                                                                                                      |
| `CLASSIFIER `函数  | `CLASSIFIER(option)`| 1. 返回当前行所映射的基本模式变量名称。1. `option`是一个可选参数：可以传入基本模式变量`CLASSIFIER(A）`或联合模式变量`CLASSIFIER(U）`，用于限定函数作用范围，对于不在范围内的行，直接返回 NULL。在对联合模式变量使用时，可用于辨别该行究竟映射至并集中哪一个基本模式变量。                  |
| 逻辑导航函数           | `RPR_FIRST(expr, k)`                                                                                                                                                                                                                                                                                 | 1. 表示从**当前匹配分组**中，定位至第一个满足 expr 的行，在此基础上再向分组尾部方向搜索到第 k 次出现的同一模式变量对应行，返回该行的指定列值。如果在指定方向上未能找到第 k 次匹配行，则函数返回 NULL。1. 其中 k 是可选参数，默认为 0，表示仅定位至首个满足条件的行；若显式指定，必须为非负整数。 |
| 逻辑导航函数           | `RPR_LAST(expr, k)`| 1. 表示从**当前匹配分组**中，定位至最后一个满足 expr 的行，在此基础上再向分组开头方向搜索到第 k 次出现的同一模式变量对应行，返回该行的指定列值。如果在指定方向上未能找到第 k 次匹配行，则函数返回 NULL。1. 其中 k 是可选参数，默认为 0，表示仅定位至末个满足条件的行；若显式指定，必须为非负整数。 |
| 物理导航函数           | `PREV(expr, k)`                                                                                                                                                                                                                                                                                      | 1. 表示从最后一次匹配至给定模式变量的行开始，向开头方向偏移 k 行，返回对应列值。若导航超出​**分区边界**​，则函数返回 NULL。1. 其中 k 是可选参数，默认为 1；若显式指定，必须为非负整数。 |
| 物理导航函数           |`NEXT(expr, k)`                           | 1. 表示从最后一次匹配至给定模式变量的行开始，向尾部方向偏移 k 行，返回对应列值。若导航超出​**分区边界**​，则函数返回 NULL。1. 其中 k 是可选参数，默认为 1；若显式指定，必须为非负整数。                                                                                                          |
| 聚合函数             | COUNT、SUM、AVG、MAX、MIN 函数                                                                                                                                                                                                                                                                           | 可用于对当前匹配中的数据进行计算。聚合函数与导航函数不允许互相嵌套。（V 2.0.6 版本起支持） |
| 嵌套函数             | `PREV/NEXT(CLASSIFIER())`                                                                                                                                                                                                                                                                            | 物理导航函数与 CLASSIFIER 函数嵌套。用于获取当前行的前一个和后一个匹配行所对应的模式变量 |
| 嵌套函数             |`PREV/NEXT(RPR_FIRST/RPR_LAST(expr, k)`） | 物理函数内部**允许嵌套**逻辑函数，逻辑函数内部**不允许嵌套**物理函数。用于先进行逻辑偏移，再进行物理偏移。                                                                                                                                                                                   |

**示例说明**

1. CLASSIFIER 函数

* 查询 sql

```SQL
SELECT m.time, m.match, m.price, m.lower_or_higher, m.label
FROM t
MATCH_RECOGNIZE (
    ORDER BY time
    MEASURES 
        MATCH_NUMBER() AS match,
        RUNNING RPR_LAST(totalprice) AS price,
        CLASSIFIER(U) AS lower_or_higher,
        CLASSIFIER(W) AS label
    ALL ROWS PER MATCH
    PATTERN ((L | H) A)
    SUBSET 
        U = (L, H),
        W = (A, L, H)
    DEFINE 
        A AS A.totalprice = 80,
        L AS L.totalprice < 80,
        H AS H.totalprice > 80
) AS m;
```
* 分析过程

  ![](/img/timeseries-featured-analysis-9.png)

* 查询结果

```SQL
+-----------------------------+-----+-----+---------------+-----+
|                         time|match|price|lower_or_higher|label|
+-----------------------------+-----+-----+---------------+-----+
|2025-01-01T00:01:00.000+08:00|    1|   90|              H|    H|
|2025-01-01T00:02:00.000+08:00|    1|   80|              H|    A|
|2025-01-01T00:03:00.000+08:00|    2|   70|              L|    L|
|2025-01-01T00:04:00.000+08:00|    2|   80|              L|    A|
|2025-01-01T00:05:00.000+08:00|    3|   70|              L|    L|
|2025-01-01T00:06:00.000+08:00|    3|   80|              L|    A|
+-----------------------------+-----+-----+---------------+-----+
Total line number = 6
```

2. 逻辑导航函数

* 查询 sql

```SQL
SELECT m.time, m.measure
FROM t
MATCH_RECOGNIZE ( 
    ORDER BY time 
    MEASURES 
         %s AS measure -- MEASURES 子句
    ALL ROWS PER MATCH 
    PATTERN (A+)
    DEFINE A AS true 
) AS m;
```

* 查询结果
    * 当取值为 totalprice、RPR\_LAST(totalprice)、RUNNING RPR\_LAST(totalprice) 时

  ![](/img/timeseries-featured-analysis-10.png)

  实际返回

  ```SQL
  +-----------------------------+-------+
  |                         time|measure|
  +-----------------------------+-------+
  |2025-01-01T00:01:00.000+08:00|     90|
  |2025-01-01T00:02:00.000+08:00|     80|
  |2025-01-01T00:03:00.000+08:00|     70|
  |2025-01-01T00:04:00.000+08:00|     80|
  |2025-01-01T00:05:00.000+08:00|     70|
  |2025-01-01T00:06:00.000+08:00|     80|
  +-----------------------------+-------+
  Total line number = 6
  ```

    * 当取值为 FINAL RPR\_LAST(totalprice) 时

  ![](/img/timeseries-featured-analysis-11.png)

  实际返回

  ```SQL
  +-----------------------------+-------+
  |                         time|measure|
  +-----------------------------+-------+
  |2025-01-01T00:01:00.000+08:00|     80|
  |2025-01-01T00:02:00.000+08:00|     80|
  |2025-01-01T00:03:00.000+08:00|     80|
  |2025-01-01T00:04:00.000+08:00|     80|
  |2025-01-01T00:05:00.000+08:00|     80|
  |2025-01-01T00:06:00.000+08:00|     80|
  +-----------------------------+-------+
  Total line number = 6
  ```

    * 当取值为 RPR\_FIRST(totalprice)、 RUNNING RPR\_FIRST(totalprice)、FINAL RPR\_FIRST(totalprice)时

  ![](/img/timeseries-featured-analysis-12.png)

  实际返回

  ```SQL
  +-----------------------------+-------+
  |                         time|measure|
  +-----------------------------+-------+
  |2025-01-01T00:01:00.000+08:00|     90|
  |2025-01-01T00:02:00.000+08:00|     90|
  |2025-01-01T00:03:00.000+08:00|     90|
  |2025-01-01T00:04:00.000+08:00|     90|
  |2025-01-01T00:05:00.000+08:00|     90|
  |2025-01-01T00:06:00.000+08:00|     90|
  +-----------------------------+-------+
  Total line number = 6
  ```

    * 当取值为 RPR\_LAST(totalprice, 2) 时

  ![](/img/timeseries-featured-analysis-13.png)

  实际返回

  ```SQL
  +-----------------------------+-------+
  |                         time|measure|
  +-----------------------------+-------+
  |2025-01-01T00:01:00.000+08:00|   null|
  |2025-01-01T00:02:00.000+08:00|   null|
  |2025-01-01T00:03:00.000+08:00|     90|
  |2025-01-01T00:04:00.000+08:00|     80|
  |2025-01-01T00:05:00.000+08:00|     70|
  |2025-01-01T00:06:00.000+08:00|     80|
  +-----------------------------+-------+
  Total line number = 6
  ```

    * 当取值为 FINAL RPP\_LAST(totalprice, 2) 时

  ![](/img/timeseries-featured-analysis-14.png)

  实际返回

  ```SQL
  +-----------------------------+-------+
  |                         time|measure|
  +-----------------------------+-------+
  |2025-01-01T00:01:00.000+08:00|     80|
  |2025-01-01T00:02:00.000+08:00|     80|
  |2025-01-01T00:03:00.000+08:00|     80|
  |2025-01-01T00:04:00.000+08:00|     80|
  |2025-01-01T00:05:00.000+08:00|     80|
  |2025-01-01T00:06:00.000+08:00|     80|
  +-----------------------------+-------+
  Total line number = 6
  ```

    * 当取值为 RPR\_FIRST(totalprice, 2) 和 FINAL RPR\_FIRST(totalprice, 2) 时

  ![](/img/timeseries-featured-analysis-15.png)

  实际返回

  ```SQL
  +-----------------------------+-------+
  |                         time|measure|
  +-----------------------------+-------+
  |2025-01-01T00:01:00.000+08:00|     70|
  |2025-01-01T00:02:00.000+08:00|     70|
  |2025-01-01T00:03:00.000+08:00|     70|
  |2025-01-01T00:04:00.000+08:00|     70|
  |2025-01-01T00:05:00.000+08:00|     70|
  |2025-01-01T00:06:00.000+08:00|     70|
  +-----------------------------+-------+
  Total line number = 6
  ```

3. 物理导航函数

* 查询 sql

```SQL
SELECT m.time, m.measure
FROM t
MATCH_RECOGNIZE ( 
    ORDER BY time 
    MEASURES 
         %s AS measure -- MEASURES 子句
    ALL ROWS PER MATCH 
    PATTERN (B)
    DEFINE B AS B.totalprice >= PREV(B.totalprice)
) AS m;
```

* 查询结果
    * 当取值为 `PREV(totalprice)` 时

  ![](/img/timeseries-featured-analysis-16.png)

  实际返回

  ```SQL
  +-----------------------------+-------+
  |                         time|measure|
  +-----------------------------+-------+
  |2025-01-01T00:04:00.000+08:00|     70|
  |2025-01-01T00:06:00.000+08:00|     70|
  +-----------------------------+-------+
  Total line number = 2
  ```

    * 当取值为 `PREV(B.totalprice, 2)` 时

  ![](/img/timeseries-featured-analysis-17.png)

  实际返回

  ```SQL
  +-----------------------------+-------+
  |                         time|measure|
  +-----------------------------+-------+
  |2025-01-01T00:04:00.000+08:00|     80|
  |2025-01-01T00:06:00.000+08:00|     80|
  +-----------------------------+-------+
  Total line number = 2
  ```

    * 当取值为 `PREV(B.totalprice, 4)` 时

  ![](/img/timeseries-featured-analysis-18.png)

  实际返回

  ```SQL
  +-----------------------------+-------+
  |                         time|measure|
  +-----------------------------+-------+
  |2025-01-01T00:04:00.000+08:00|   null|
  |2025-01-01T00:06:00.000+08:00|     80|
  +-----------------------------+-------+
  Total line number = 2
  ```

    * 当取值为 `NEXT(totalprice)` 或 `NEXT(B.totalprice, 1)` 时

  ![](/img/timeseries-featured-analysis-19.png)

  实际返回

  ```SQL
  +-----------------------------+-------+
  |                         time|measure|
  +-----------------------------+-------+
  |2025-01-01T00:04:00.000+08:00|     70|
  |2025-01-01T00:06:00.000+08:00|   null|
  +-----------------------------+-------+
  Total line number = 2
  ```

    * `当取值为 NEXT(B.totalprice, 2)` 时

  ![](/img/timeseries-featured-analysis-20.png)

  实际返回

  ```SQL
  +-----------------------------+-------+
  |                         time|measure|
  +-----------------------------+-------+
  |2025-01-01T00:04:00.000+08:00|     80|
  |2025-01-01T00:06:00.000+08:00|   null|
  +-----------------------------+-------+
  Total line number = 2
  ```

4. 聚合函数

* 查询 sql

```SQL
SELECT m.time, m.count, m.avg, m.sum, m.min, m.max
FROM t
MATCH_RECOGNIZE ( 
    ORDER BY time 
    MEASURES 
         COUNT(*) AS count,
         AVG(totalprice) AS avg,
         SUM(totalprice) AS sum,
         MIN(totalprice) AS min,
         MAX(totalprice) AS max
    ALL ROWS PER MATCH 
    PATTERN (A+)
    DEFINE A AS true 
) AS m;
```
* 分析过程（以 MIN(totalprice)为例）

![](/img/timeseries-featured-analysis-21.png)

* 查询结果

```SQL
+-----------------------------+-----+-----------------+-----+---+---+
|                         time|count|              avg|  sum|min|max|
+-----------------------------+-----+-----------------+-----+---+---+
|2025-01-01T00:01:00.000+08:00|    1|             90.0| 90.0| 90| 90|
|2025-01-01T00:02:00.000+08:00|    2|             85.0|170.0| 80| 90|
|2025-01-01T00:03:00.000+08:00|    3|             80.0|240.0| 70| 90|
|2025-01-01T00:04:00.000+08:00|    4|             80.0|320.0| 70| 90|
|2025-01-01T00:05:00.000+08:00|    5|             78.0|390.0| 70| 90|
|2025-01-01T00:06:00.000+08:00|    6|78.33333333333333|470.0| 70| 90|
+-----------------------------+-----+-----------------+-----+---+---+
Total line number = 6
```

5. 嵌套函数

示例一

* 查询 sql

```SQL
SELECT m.time, m.match, m.price, m.lower_or_higher, m.label, m.prev_label, m.next_label
FROM t
MATCH_RECOGNIZE (
    ORDER BY time
    MEASURES 
        MATCH_NUMBER() AS match,
        RUNNING RPR_LAST(totalprice) AS price,
        CLASSIFIER(U) AS lower_or_higher,
        CLASSIFIER(W) AS label,
        PREV(CLASSIFIER(W)) AS prev_label,
        NEXT(CLASSIFIER(W)) AS next_label
    ALL ROWS PER MATCH
    PATTERN ((L | H) A)
    SUBSET 
        U = (L, H),
        W = (A, L, H)
    DEFINE 
        A AS A.totalprice = 80,
        L AS L.totalprice < 80,
        H AS H.totalprice > 80
) AS m;
```
* 分析过程

![](/img/timeseries-featured-analysis-22.png)

* 查询结果

```SQL
+-----------------------------+-----+-----+---------------+-----+----------+----------+
|                         time|match|price|lower_or_higher|label|prev_label|next_label|
+-----------------------------+-----+-----+---------------+-----+----------+----------+
|2025-01-01T00:01:00.000+08:00|    1|   90|              H|    H|      null|         A|
|2025-01-01T00:02:00.000+08:00|    1|   80|              H|    A|         H|      null|
|2025-01-01T00:03:00.000+08:00|    2|   70|              L|    L|      null|         A|
|2025-01-01T00:04:00.000+08:00|    2|   80|              L|    A|         L|      null|
|2025-01-01T00:05:00.000+08:00|    3|   70|              L|    L|      null|         A|
|2025-01-01T00:06:00.000+08:00|    3|   80|              L|    A|         L|      null|
+-----------------------------+-----+-----+---------------+-----+----------+----------+
Total line number = 6
```

示例二

* 查询 sql

```SQL
SELECT m.time, m.prev_last_price, m.next_first_price 
FROM t 
MATCH_RECOGNIZE ( 
    ORDER BY time  
    MEASURES 
        PREV(RPR_LAST(totalprice), 2) AS prev_last_price, 
        NEXT(RPR_FIRST(totalprice), 2) as next_first_price  
    ALL ROWS PER MATCH 
    PATTERN (A+)    
    DEFINE A AS true 
) AS m;
```
* 分析过程

![](/img/timeseries-featured-analysis-23.png)

* 查询结果

```SQL
+-----------------------------+---------------+----------------+
|                         time|prev_last_price|next_first_price|
+-----------------------------+---------------+----------------+
|2025-01-01T00:01:00.000+08:00|           null|              70|
|2025-01-01T00:02:00.000+08:00|           null|              70|
|2025-01-01T00:03:00.000+08:00|             90|              70|
|2025-01-01T00:04:00.000+08:00|             80|              70|
|2025-01-01T00:05:00.000+08:00|             70|              70|
|2025-01-01T00:06:00.000+08:00|             80|              70|
+-----------------------------+---------------+----------------+
Total line number = 6
```

#### 2.8.3 RUNNING 和 FINAL 语义
1. 定义

* `RUNNING`: 表示计算范围为当前匹配分组内，从分组的起始行到当前正在处理的行（即到当前行为止）。
* `FINAL`: 表示计算范围为当前匹配分组内，从分组的起始行到分组的最终行（即整个匹配分组）。

2. 作用范围

* DEFINE 子句默认采用 RUNNING 语义。
* MEASURES 子句默认采用 RUNNING 语义，支持指定 FINAL 语义。当采用 ONE ROW PER MATCH 输出模式时，所有表达式都从匹配分组的末行位置进行计算，此时 RUNNING 语义与 FINAL 语义等价。

3. 语法约束

* RUNNING 和 FINAL 需要写在**逻辑导航函数**或聚合函数之前，不能直接作用于**列引用。**
    * 合法：`RUNNING RPP_LAST(A.totalprice)`、`FINAL RPP_LAST(A.totalprice)`
    * 非法：`RUNNING A.totalprice`、`FINAL A.totalprice`、 `RUNNING PREV(A.totalprice)`

## 3. 场景示例

以[示例数据](../Reference/Sample-Data.md)为源数据

### 3.1 时间分段查询

将 table1 中的数据按照时间间隔小于等于 24 小时分段，查询每段中的数据总条数，以及开始、结束时间。

查询SQL

```SQL
SELECT start_time, end_time, cnt 
FROM table1 
MATCH_RECOGNIZE (
    ORDER BY time 
    MEASURES 
        RPR_FIRST(A.time) AS start_time, 
        RPR_LAST(time) AS end_time, 
        COUNT() AS cnt 
    PATTERN (A B*)  
    DEFINE  B AS (cast(B.time as INT64) - cast(PREV(B.time) as INT64)) <= 86400000
) AS m
```

查询结果

```SQL
+-----------------------------+-----------------------------+---+
|                   start_time|                     end_time|cnt|
+-----------------------------+-----------------------------+---+
|2024-11-26T13:37:00.000+08:00|2024-11-26T13:38:00.000+08:00|  2|
|2024-11-27T16:38:00.000+08:00|2024-11-30T14:30:00.000+08:00| 16|
+-----------------------------+-----------------------------+---+
Total line number = 2
```

### 3.2 差值分段查询

将 table2 中的数据按照 humidity 湿度值差值小于 0.1 分段，查询每段中的数据总条数，以及开始、结束时间。

* 查询sql

```SQL
SELECT start_time, end_time, cnt 
FROM table2 
MATCH_RECOGNIZE (
    ORDER BY time 
    MEASURES 
        RPR_FIRST(A.time) AS start_time, 
        RPR_LAST(time) AS end_time, 
        COUNT() AS cnt 
    PATTERN (A B*)  
    DEFINE  B AS (B.humidity - PREV(B.humidity )) <=0.1
) AS m;
```

* 查询结果

```SQL
+-----------------------------+-----------------------------+---+
|                   start_time|                     end_time|cnt|
+-----------------------------+-----------------------------+---+
|2024-11-26T13:37:00.000+08:00|2024-11-27T00:00:00.000+08:00|  2|
|2024-11-28T08:00:00.000+08:00|2024-11-29T00:00:00.000+08:00|  2|
|2024-11-29T11:00:00.000+08:00|2024-11-30T00:00:00.000+08:00|  2|
+-----------------------------+-----------------------------+---+
Total line number = 3
```

### 3.3 事件统计查询

将 table1 中数据按照设备号分组，统计上海地区湿度大于 35 的开始、结束时间及最大湿度值。

* 查询sql

```SQL
SELECT m.device_id, m.match, m.event_start, m.event_end, m.max_humidity 
FROM table1
MATCH_RECOGNIZE (
  PARTITION BY device_id
  ORDER BY time 
  MEASURES
    MATCH_NUMBER() AS match,
    RPR_FIRST(A.time) AS event_start,
    RPR_LAST(A.time) AS event_end,
    MAX(A.humidity) AS max_humidity 
  ONE ROW PER MATCH
  PATTERN (A+)
  DEFINE
    A AS A.region= '上海' AND A.humidity> 35
) AS m
```

* 查询结果

```SQL
+---------+-----+-----------------------------+-----------------------------+------------+
|device_id|match|                  event_start|                    event_end|max_humidity|
+---------+-----+-----------------------------+-----------------------------+------------+
|      100|    1|2024-11-28T09:00:00.000+08:00|2024-11-29T18:30:00.000+08:00|        45.1|
|      101|    1|2024-11-30T09:30:00.000+08:00|2024-11-30T09:30:00.000+08:00|        35.2|
+---------+-----+-----------------------------+-----------------------------+------------+
Total line number = 2
```

## 4. 实际案例

### 4.1海拔高度监测

* **业务背景**

石油运输车辆在油品运输过程中，海拔高度会直接影响环境气压：海拔越高，气压越低，油品挥发风险越高。为精准评估油品自然损耗情况，需通过北斗定位数据识别海拔异常事件，为损耗评估提供数据支撑。

* **数据结构**

监测数据表包含以下核心字段：

| **ColumnName** | DataType  | Category | Comment                |
| ---------------------- | ----------- | ---------- | ------------------------ |
| time                 | TIMESTAMP | TIME     | 数据采集时间           |
| device\_id           | STRING    | TAG      | 车辆设备编号（分区键） |
| department           | STRING    | FIELD    | 所属部门               |
| altitude             | DOUBLE    | FIELD    | 海拔高度（单位：米）   |

* **业务需求**

识别运输车辆的海拔异常事件：当车辆海拔高度超过 500 米，后续又降至 500 米以下时，视为一个完整的异常事件。需计算每个事件的核心指标：

* 事件起始时间（海拔首次超过 500 米的时间）；
* 事件结束时间（海拔最后一次高于 500 米的时间）；
* 事件期间该车辆的最大海拔值。

![](/img/pattern-query-altitude.png)

* **实现方法**

```SQL
SELECT * 
FROM beidou
MATCH_RECOGNIZE ( 
    PARTITION BY device_id  -- 按车辆设备分区
    ORDER BY time           -- 按时间排序
    MEASURES
        FIRST(A.time) AS ts_s,  -- 事件起始时间
        LAST(A.time) AS ts_e,   -- 事件结束时间
        MAX(A.altitude) AS max_a  -- 事件最大海拔
    PATTERN (A+)  -- 匹配连续的海拔超500米的记录
    DEFINE
        A AS A.altitude > 500  -- 定义A为海拔高于500米的记录
)
```

### 4.2 安全注入操作识别

* **业务背景**

核电站需定期执行安全检测试验（如 PT1RPA010《用 1 RPA 601KC 进行安全注入逻辑试验》），以验证发电设备无损伤。该类试验会导致水管流量呈现特征性变化，中控系统需识别该流量模式，及时汇报异常行为，保障设备安全。

* **数据结构**

传感器数据表包含以下核心字段：

| **ColumnName** | DataType  | Category | Comment                |
| ---------------------- | ----------- | ---------- | ------------------------ |
| time                 | TIMESTAMP | TIME     | 数据采集时间           |
| pipe\_id             | STRING    | TAG      | 水管编号（分区键）     |
| pressure             | DOUBLE    | FIELD    | 水管压力               |
| flow\_rate           | DOUBLE    | FIELD    | 水管流量（核心监测值） |

* **业务需求**

识别 PT1RPA010 试验对应的流量特征模式：正常流量→持续下降→极低流量（<0.5）→持续回升→恢复正常流量。需提取该模式的核心指标：

* 模式整体起始时间（初始正常流量的时间）；
* 模式整体终止时间（恢复正常流量的时间）；
* 极低流量阶段的起始 / 结束时间；
* 极低流量阶段的最小流量值。

![](/img/pattern-query-flow.png)

* **实现方法**

```SQL
SELECT * FROM sensor MATCH_RECOGNIZE(
    PARTITION BY pipe_id  -- 按水管编号分区
    ORDER BY time           -- 按时间排序
    MEASURES 
        A.time AS start_ts,    -- 模式整体起始时间
        E.time AS end_ts,      -- 模式整体终止时间
        FIRST(C.time) AS low_start_ts,  -- 极低流量起始时间
        LAST(C.time) AS low_end_ts,    -- 极低流量结束时间
        MIN(C.flow_rate) AS min_low_flow  -- 极低流量最小值（补充原代码缺失字段名）
    ONE ROW PER MATCH       -- 每个匹配模式仅输出1行结果
    PATTERN(A B+? C+ D+? E) -- 匹配正常→下降→极低→回升→正常的流量模式
    DEFINE 
        A AS flow_rate BETWEEN 2 AND 2.5,  -- 初始正常流量
        B AS flow_rate < PREV(B.flow_rate), -- 流量持续下降
        C AS flow_rate < 0.5,               -- 极低流量阈值
        D AS flow_rate > PREV(D.flow_rate), -- 流量持续回升
        E AS flow_rate BETWEEN 2 AND 2.5    -- 恢复正常流量
);
```

### 4.3 极端运行阵风（草帽风）识别

* **业务背景**

风力发电场景中，“极端运行阵风（草帽风）” 是一种短时间（约 10 秒）、波峰显著的正弦形阵风，这类阵风会对风机造成物理损伤。识别该类阵风并统计发生频率，可有效评估风机受损风险，指导设备维护。

* **数据结构**

风机传感器数据表核心字段：

| **ColumnName** | DataType  | Category | Comment                |
| ---------------------- | ----------- | ---------- | ------------------------ |
| time                 | TIMESTAMP | TIME     | 风速采集时间           |
| speed                | DOUBLE    | FIELD    | 风机处风速（核心指标） |

* **业务需求**

识别 “草帽风” 的特征模式：风力缓慢下降→急剧增加→急剧减少→缓慢增加至初始值（全程约 10 秒）。核心目标是统计该类阵风的发生次数，为风机风险评估提供依据。

![](/img/pattern-query-speed.png)

* **实现方法**

```SQL
SELECT COUNT(*)  -- 统计极端阵风发生次数
FROM sensor
MATCH_RECOGNIZE(
    ORDER BY time  -- 按时间排序
    MEASURES 
        FIRST(B.time) AS ts_s,  -- 阵风起始时间
        LAST(D.time) AS ts_e    -- 阵风结束时间
    PATTERN (B+ R+? F+? D+? E)  -- 匹配草帽风的风速变化模式
    DEFINE 
        -- B阶段：风速缓慢下降，初始风速>9，首尾风速差<2.5
        B AS speed <= AVG(B.speed) 
            AND FIRST(B.speed) > 9
            AND (FIRST(B.speed) - LAST(B.speed)) < 2.5,
        -- R阶段：风速急剧增加（高于阶段平均风速）
        R AS speed >= AVG(R.speed), 
        -- F阶段：风速急剧减少，阶段最大风速>16（波峰阈值）
        F AS speed <= AVG(F.speed) 
            AND MAX(F.speed) > 16, 
        -- D阶段：风速缓慢增加，首尾风速差<2.5
        D AS speed >= AVG(D.speed) 
            AND (LAST(D.speed) - FIRST(D.speed)) < 2.5,
        -- E阶段：风速恢复至初始值±0.2，全程时长<11秒
        E AS speed - FIRST(B.speed) BETWEEN -0.2 AND 0.2
            AND time - FIRST(B.time) < 11
);
```
