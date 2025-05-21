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

# 嵌套查询

## 1. 概述

嵌套查询又被称为子查询，是指一个查询语句内部包含另一个或多个查询语句。嵌套查询由内层查询和外层查询组成。

## 2. 嵌套查询分类

嵌套查询可以按照以下两种依据进行分类：按是否引用外层查询分类、按结果集行列数分类。

* **按是否引用外层查询分类：**

<table style="text-align: left;">
  <tbody>
     <tr>   <th>分类依据</th>
            <th>嵌套查询类型</th>        
            <th>描述</th>
            <th>IoTDB 支持情况</th>
      </tr>
      <tr>
            <td rowspan="2">是否引用外层查询</td>  
            <td>非关联子查询</td>
            <td>内层查询的执行和外层查询的执行是独立的，内层查询仅执行一次，执行完毕后将结果作为外层查询的条件使用。</td>
            <td>支持</td>
      </tr>
      <tr>
            <td>关联子查询</td>
            <td>内层查询中使用到了外层查询的表中某些列，需要先执行外层查询，然后执行内层查询。</td>
            <td>不支持</td>
      </tr>
  </tbody>
</table>

* **按照结果集行列数分类：**

<table style="text-align: left;">
  <tbody>
     <tr>   <th>分类依据</th>
            <th>子查询类型</th>        
            <th>描述</th>
            <th>使用位置</th>
            <th>IoTDB 支持情况</th>
      </tr>
      <tr>
            <td rowspan="4">结果集行列数</td>  
            <td>标量子查询（Scalar Subquery）</td>
            <td>返回的结果集结构为一行一列。</td>
            <td>select、where、from、having</td>
            <td>支持</td>
      </tr>
      <tr>
            <td>列子查询（Column Subquery）</td>
            <td>返回的结果集结构为 N 行一列。</td>
            <td>select、where、from、having</td>
            <td>支持</td>
      </tr>
      <tr>
            <td>行子查询（Row Subquery）</td>
            <td>返回的结果集结构为一行 N 列。</td>
            <td> - </td>
            <td>不支持</td>
      </tr>
      <tr>
            <td>表子查询（Table Subquery）</td>
            <td>返回的结果集结构为 N 行 M 列。</td>
            <td>from </td>
            <td>支持</td>
      </tr>
  </tbody>
</table>

## 3. 功能定义

1. 所有内层查询都需要用圆括号（）隔离，即以形如 （subquery） 的形式使用。

2. 非关联子查询在内层查询中不支持引用外层查询中的列，若引用则会报错：

    `Msg: org.apache.iotdb.jdbc.IoTDBSQLException： 701: Given correlated subquery is not supported`

### 3.1 非关联标量子查询

标量子查询返回的结果是一个标量值，可以用于替换表达式 expression 中的操作数。

**语法**

```SQL
primaryExpression
    : literalExpression                                                   #Literal
    | dateExpression #dateTimeExpression                                  #dateTimeExpression
    | '(' expression (',' expression)+ ')'                                #rowConstructor
    | ROW '(' expression (',' expression)* ')'                            #rowConstructor
    | qualifiedName '(' (label=identifier '.')? ASTERISK ')'              #functionCall
    | qualifiedName '(' (setQuantifier? expression (',' expression)*)?')' #functionCall
​    ​|​ ​'('​ query ​')'​                                                       #subqueryExpression
```

**说明**

标量子查询可以作为任意表达式（expression）的操作数，前提是这些输入参数在定义中未被强制规定为常量。

以下是一些不能使用标量子查询作为参数的例子：

* `date_bin(interval,source,origin)` 的第一、三个参数。
* `date_bin_gapfill(interval,source,origin)` 的第一、三个参数。
    * `interval` ：时间间隔
    * `origin`：起始时间戳
* `Fill` 参数
    * `fill previous`
    * `fill linear`
    * `fill constant`

### 3.2 非关联列子查询

#### 3.2.1 非关联 InPredicate

InPredicate 是一个 predicate，其返回值是一列 boolean 值。

**语法**

```SQL
predicate[ParserRuleContext value]
    : comparisonOperator right=valueExpression                           #comparison
    | comparisonOperator comparisonQuantifier '(' query ')'              #quantifiedComparison
    | NOT? BETWEEN lower=valueExpression AND upper=valueExpression       #between
    | NOT? IN '(' expression (',' expression)* ')'                       #inList
    |​ ​NOT? ​IN​ ​'('​ query ​')'​                                              #inSubquery
    | NOT? LIKE pattern=valueExpression (ESCAPE escape=valueExpression)? #like
    | IS NOT? NULL                                                       #nullPredicate
    | IS NOT? DISTINCT FROM right=valueExpression                        #distinctFrom
    ;
```

**说明**

使用形式：`X [NOT] IN (subquery)`

* `X` 是一个表达式（expression）。
* `NOT` 为可选，表示取反。
* `subquery` 返回一个一列多行的结果集 `Result`。
* 对于 `WHERE X IN (subquery)`，对于每一行 `X` 的结果，如果 `X` 在 `Result` 中，则 `SELECT` 中选取的当前行保留。

#### 3.2.2 非关联 Quantified Comparison

Quantified Comparison 允许将一个值与一组值进行比较，通常由以下部分组成：

1. 比较运算符：`<`， `>`， `=`， `<=`， `>=`， `!=`
2. 比较量词：
    1. `ALL`：所有元素
    2. `ANY` 或 `SOME`：任意一个元素（ANY 和 SOME 是等价的）
3. 子查询：返回一个值的集合，用于与主查询中的值进行比较

**语法**

```SQL
predicate[ParserRuleContext value]
    : comparisonOperator right=valueExpression                           #comparison
    |​ comparisonOperator comparisonQuantifier ​'('​ query ​')'​              #quantifiedComparison
    | NOT? BETWEEN lower=valueExpression AND upper=valueExpression       #between
    | NOT? IN '(' expression (',' expression)* ')'                       #inList
    | NOT? IN '(' query ')'                                              #inSubquery
    | NOT? LIKE pattern=valueExpression (ESCAPE escape=valueExpression)? #like
    | IS NOT? NULL                                                       #nullPredicate
    | IS NOT? DISTINCT FROM right=valueExpression                        #distinctFrom
    ;
comparisonQuantifier
    : ALL | SOME | ANY
    ;
```

**说明**

使用形式：`expression operator ALL/ANY/SOME (subquery)`

* ALL：主查询中的 `expression` 与子查询返回的每一个值进行比较，所有比较都必须为 `True`，结果才为 `True`。
* ANY/SOME：主查询中的 `expression` 与子查询返回的每一个值进行比较，任意一个比较为 `True`，结果就是 `True`。

## 4. 使用示例
### 4.1 示例数据

s1， s2， s3， s4 分别为 INT， LONG， FLOAT， DOUBLE 类型

* Table1:

```SQL
// table1 全部数据
IoTDB> select * from table1;
+-----------------------------+--------+--------+--------+---------+------+----------------+----+-----+----+----+-----+--------------------------------+--------------------------------+------------+-----------------------------+----------+
|                         time|province|    city|  region|device_id| color|            type|  s1|   s2|  s3|  s4|   s5|                              s6|                              s7|          s8|                           s9|       s10|
+-----------------------------+--------+--------+--------+---------+------+----------------+----+-----+----+----+-----+--------------------------------+--------------------------------+------------+-----------------------------+----------+
|2024-09-24T14:15:30.000+08:00|shanghai|shanghai|  pudong|      d05|   red|               A|  30| null|30.0|null| null|    shanghai_pudong_red_A_d05_30|                            null|0xcafebabe30|2024-09-24T14:15:30.000+08:00|      null|
|2024-09-24T14:15:35.000+08:00|shanghai|shanghai|  pudong|      d05|   red|               A|null|35000|35.0|35.0| null|    shanghai_pudong_red_A_d05_35|    shanghai_pudong_red_A_d05_35|        null|2024-09-24T14:15:35.000+08:00|2024-09-24|
|2024-09-24T14:15:40.000+08:00|shanghai|shanghai|  pudong|      d05|   red|               A|  40| null|40.0|null| true|                            null|    shanghai_pudong_red_A_d05_40|        null|2024-09-24T14:15:40.000+08:00|      null|
|2024-09-24T14:15:50.000+08:00|shanghai|shanghai|  pudong|      d05|   red|               A|null|50000|null|null|false|                            null|                            null|        null|2024-09-24T14:15:50.000+08:00|2024-09-24|
|2024-09-24T14:15:55.000+08:00|shanghai|shanghai|  pudong|      d05|   red|               A|  55| null|null|55.0| null|                            null|                            null|0xcafebabe55|2024-09-24T14:15:55.000+08:00|      null|
|2024-09-24T14:15:31.000+08:00|shanghai|shanghai|  pudong|      d07|yellow|               A|null|31000|null|null| null|                            null|                            null|0xcafebabe31|2024-09-24T14:15:31.000+08:00|      null|
|2024-09-24T14:15:36.000+08:00|shanghai|shanghai|  pudong|      d07|yellow|               A|  36| null|null|36.0| null|                            null| shanghai_pudong_yellow_A_d07_36|        null|2024-09-24T14:15:36.000+08:00|2024-09-24|
|2024-09-24T14:15:41.000+08:00|shanghai|shanghai|  pudong|      d07|yellow|               A|  41| null|41.0|null|false| shanghai_pudong_yellow_A_d07_41|                            null|0xcafebabe41|2024-09-24T14:15:41.000+08:00|      null|
|2024-09-24T14:15:46.000+08:00|shanghai|shanghai|  pudong|      d07|yellow|               A|null|46000|null|46.0| null|                            null| shanghai_pudong_yellow_A_d07_46|        null|2024-09-24T14:15:46.000+08:00|      null|
|2024-09-24T14:15:51.000+08:00|shanghai|shanghai|  pudong|      d07|yellow|               A|null| null|51.0|null| null| shanghai_pudong_yellow_A_d07_51|                            null|        null|2024-09-24T14:15:51.000+08:00|      null|
|2024-09-24T14:13:30.000+08:00|shanghai|shanghai| huangpu|      d01|   red|               A|  30|   30|30.0|30.0| true|   shanghai_huangpu_red_A_d01_30|   shanghai_huangpu_red_A_d01_30|0xcafebabe30|2024-09-24T14:13:00.000+08:00|2024-09-23|
|2024-09-24T14:14:30.000+08:00|shanghai|shanghai| huangpu|      d01|   red|               A|  40|   40|40.0|40.0|false|   shanghai_huangpu_red_A_d01_40|   shanghai_huangpu_red_A_d01_40|0xcafebabe40|2024-09-24T14:14:00.000+08:00|2024-09-24|
|2024-09-24T14:15:30.000+08:00|shanghai|shanghai| huangpu|      d01|   red|               A|  50|   50|50.0|50.0| true|   shanghai_huangpu_red_A_d01_50|   shanghai_huangpu_red_A_d01_50|0xcafebabe50|2024-09-24T14:15:00.000+08:00|2024-09-25|
|2024-09-24T14:16:30.000+08:00|shanghai|shanghai| huangpu|      d01|   red|               A|  60|   60|60.0|60.0|false|   shanghai_huangpu_red_A_d01_60|   shanghai_huangpu_red_A_d01_60|0xcafebabe60|2024-09-24T14:16:00.000+08:00|2024-09-26|
|2024-09-24T14:17:30.000+08:00|shanghai|shanghai| huangpu|      d01|   red|               A|  70|   70|70.0|70.0| true|   shanghai_huangpu_red_A_d01_70|   shanghai_huangpu_red_A_d01_70|0xcafebabe70|2024-09-24T14:17:00.000+08:00|2024-09-27|
|2024-09-24T14:15:31.000+08:00|shanghai|shanghai| huangpu|      d03|yellow|               A|null|31000|null|null| null|                            null|                            null|0xcafebabe31|2024-09-24T14:15:31.000+08:00|      null|
|2024-09-24T14:15:36.000+08:00|shanghai|shanghai| huangpu|      d03|yellow|               A|  36| null|null|36.0| null|                            null|shanghai_huangpu_yellow_A_d03_36|        null|2024-09-24T14:15:36.000+08:00|2024-09-24|
|2024-09-24T14:15:41.000+08:00|shanghai|shanghai| huangpu|      d03|yellow|               A|  41| null|41.0|null|false|shanghai_huangpu_yellow_A_d03_41|                            null|0xcafebabe41|2024-09-24T14:15:41.000+08:00|      null|
|2024-09-24T14:15:46.000+08:00|shanghai|shanghai| huangpu|      d03|yellow|               A|null|46000|null|46.0| null|                            null|shanghai_huangpu_yellow_A_d03_46|        null|2024-09-24T14:15:46.000+08:00|      null|
|2024-09-24T14:15:51.000+08:00|shanghai|shanghai| huangpu|      d03|yellow|               A|null| null|51.0|null| null|shanghai_huangpu_yellow_A_d03_51|                            null|        null|2024-09-24T14:15:51.000+08:00|      null|
|2024-09-24T14:15:31.000+08:00| beijing| beijing|chaoyang|      d11|yellow|               A|null|31000|null|null| null|                            null|                            null|0xcafebabe31|2024-09-24T14:15:31.000+08:00|      null|
|2024-09-24T14:15:36.000+08:00| beijing| beijing|chaoyang|      d11|yellow|               A|  36| null|null|36.0| null|                            null|beijing_chaoyang_yellow_A_d11_36|        null|2024-09-24T14:15:36.000+08:00|2024-09-24|
|2024-09-24T14:15:41.000+08:00| beijing| beijing|chaoyang|      d11|yellow|               A|  41| null|41.0|null|false|beijing_chaoyang_yellow_A_d11_41|                            null|0xcafebabe41|2024-09-24T14:15:41.000+08:00|      null|
|2024-09-24T14:15:46.000+08:00| beijing| beijing|chaoyang|      d11|yellow|               A|null|46000|null|46.0| null|                            null|beijing_chaoyang_yellow_A_d11_46|        null|2024-09-24T14:15:46.000+08:00|      null|
|2024-09-24T14:15:51.000+08:00| beijing| beijing|chaoyang|      d11|yellow|               A|null| null|51.0|null| null|beijing_chaoyang_yellow_A_d11_51|                            null|        null|2024-09-24T14:15:51.000+08:00|      null|
|2024-09-24T14:15:30.000+08:00| beijing| beijing|chaoyang|      d09|   red|               A|  30| null|30.0|null| null|   beijing_chaoyang_red_A_d09_30|                            null|0xcafebabe30|2024-09-24T14:15:30.000+08:00|      null|
|2024-09-24T14:15:35.000+08:00| beijing| beijing|chaoyang|      d09|   red|               A|null|35000|35.0|35.0| null|   beijing_chaoyang_red_A_d09_35|   beijing_chaoyang_red_A_d09_35|        null|2024-09-24T14:15:35.000+08:00|2024-09-24|
|2024-09-24T14:15:40.000+08:00| beijing| beijing|chaoyang|      d09|   red|               A|  40| null|40.0|null| true|                            null|   beijing_chaoyang_red_A_d09_40|        null|2024-09-24T14:15:40.000+08:00|      null|
|2024-09-24T14:15:50.000+08:00| beijing| beijing|chaoyang|      d09|   red|               A|null|50000|null|null|false|                            null|                            null|        null|2024-09-24T14:15:50.000+08:00|2024-09-24|
|2024-09-24T14:15:55.000+08:00| beijing| beijing|chaoyang|      d09|   red|               A|  55| null|null|55.0| null|                            null|                            null|0xcafebabe55|2024-09-24T14:15:55.000+08:00|      null|
|2024-09-24T14:15:30.000+08:00| beijing| beijing| haidian|      d13|   red|               A|  30| null|30.0|null| null|    beijing_haidian_red_A_d13_30|                            null|0xcafebabe30|2024-09-24T14:15:30.000+08:00|      null|
|2024-09-24T14:15:35.000+08:00| beijing| beijing| haidian|      d13|   red|               A|null|35000|35.0|35.0| null|    beijing_haidian_red_A_d13_35|    beijing_haidian_red_A_d13_35|        null|2024-09-24T14:15:35.000+08:00|2024-09-24|
|2024-09-24T14:15:40.000+08:00| beijing| beijing| haidian|      d13|   red|               A|  40| null|40.0|null| true|                            null|    beijing_haidian_red_A_d13_40|        null|2024-09-24T14:15:40.000+08:00|      null|
|2024-09-24T14:15:50.000+08:00| beijing| beijing| haidian|      d13|   red|               A|null|50000|null|null|false|                            null|                            null|        null|2024-09-24T14:15:50.000+08:00|2024-09-24|
|2024-09-24T14:15:55.000+08:00| beijing| beijing| haidian|      d13|   red|               A|  55| null|null|55.0| null|                            null|                            null|0xcafebabe55|2024-09-24T14:15:55.000+08:00|      null|
|2024-09-24T14:15:31.000+08:00| beijing| beijing| haidian|      d15|yellow|               A|null|31000|null|null| null|                            null|                            null|0xcafebabe31|2024-09-24T14:15:31.000+08:00|      null|
|2024-09-24T14:15:36.000+08:00| beijing| beijing| haidian|      d15|yellow|               A|  36| null|null|36.0| null|                            null| beijing_haidian_yellow_A_d15_36|        null|2024-09-24T14:15:36.000+08:00|2024-09-24|
|2024-09-24T14:15:41.000+08:00| beijing| beijing| haidian|      d15|yellow|               A|  41| null|41.0|null|false| beijing_haidian_yellow_A_d15_41|                            null|0xcafebabe41|2024-09-24T14:15:41.000+08:00|      null|
|2024-09-24T14:15:46.000+08:00| beijing| beijing| haidian|      d15|yellow|               A|null|46000|null|46.0| null|                            null| beijing_haidian_yellow_A_d15_46|        null|2024-09-24T14:15:46.000+08:00|      null|
|2024-09-24T14:15:51.000+08:00| beijing| beijing| haidian|      d15|yellow|               A|null| null|51.0|null| null| beijing_haidian_yellow_A_d15_51|                            null|        null|2024-09-24T14:15:51.000+08:00|      null|
|2024-09-24T14:15:36.000+08:00|shanghai|shanghai|  pudong|      d06|   red|BBBBBBBBBBBBBBBB|  36| null|null|null| true|    shanghai_pudong_red_B_d06_36|    shanghai_pudong_red_B_d06_36|        null|2024-09-24T14:15:36.000+08:00|      null|
|2024-09-24T14:15:40.000+08:00|shanghai|shanghai|  pudong|      d06|   red|BBBBBBBBBBBBBBBB|  40| null|null|40.0| null|                            null|    shanghai_pudong_red_B_d06_40|        null|2024-09-24T14:15:40.000+08:00|2024-09-24|
|2024-09-24T14:15:50.000+08:00|shanghai|shanghai|  pudong|      d06|   red|BBBBBBBBBBBBBBBB|null|50000|null|null| null|                            null|    shanghai_pudong_red_B_d06_50|0xcafebabe50|2024-09-24T14:15:50.000+08:00|      null|
|2024-09-24T14:15:30.000+08:00|shanghai|shanghai|  pudong|      d08|yellow|BBBBBBBBBBBBBBBB|null| null|30.0|null| true|                            null| shanghai_pudong_yellow_B_d08_30|        null|2024-09-24T14:15:30.000+08:00|2024-09-24|
|2024-09-24T14:15:40.000+08:00|shanghai|shanghai|  pudong|      d08|yellow|BBBBBBBBBBBBBBBB|null|40000|null|null| null|                            null|                            null|        null|2024-09-24T14:15:40.000+08:00|      null|
|2024-09-24T14:15:55.000+08:00|shanghai|shanghai|  pudong|      d08|yellow|BBBBBBBBBBBBBBBB|  55| null|null|55.0| null| shanghai_pudong_yellow_B_d08_55|                            null|0xcafebabe55|2024-09-24T14:15:55.000+08:00|      null|
|2024-09-24T14:15:36.000+08:00|shanghai|shanghai| huangpu|      d02|   red|BBBBBBBBBBBBBBBB|  36| null|null|null| true|   shanghai_huangpu_red_B_d02_36|   shanghai_huangpu_red_B_d02_36|        null|2024-09-24T14:15:36.000+08:00|      null|
|2024-09-24T14:15:40.000+08:00|shanghai|shanghai| huangpu|      d02|   red|BBBBBBBBBBBBBBBB|  40| null|null|40.0| null|                            null|   shanghai_huangpu_red_B_d02_40|        null|2024-09-24T14:15:40.000+08:00|2024-09-24|
|2024-09-24T14:15:50.000+08:00|shanghai|shanghai| huangpu|      d02|   red|BBBBBBBBBBBBBBBB|null|50000|null|null| null|                            null|   shanghai_huangpu_red_B_d02_50|0xcafebabe50|2024-09-24T14:15:50.000+08:00|      null|
|2024-09-24T14:15:30.000+08:00|shanghai|shanghai| huangpu|      d04|yellow|BBBBBBBBBBBBBBBB|null| null|30.0|null| true|                            null|shanghai_huangpu_yellow_B_d04_30|        null|2024-09-24T14:15:30.000+08:00|2024-09-24|
|2024-09-24T14:15:40.000+08:00|shanghai|shanghai| huangpu|      d04|yellow|BBBBBBBBBBBBBBBB|null|40000|null|null| null|                            null|                            null|        null|2024-09-24T14:15:40.000+08:00|      null|
|2024-09-24T14:15:55.000+08:00|shanghai|shanghai| huangpu|      d04|yellow|BBBBBBBBBBBBBBBB|  55| null|null|55.0| null|shanghai_huangpu_yellow_B_d04_55|                            null|0xcafebabe55|2024-09-24T14:15:55.000+08:00|      null|
|2024-09-24T14:15:36.000+08:00| beijing| beijing|chaoyang|      d10|   red|BBBBBBBBBBBBBBBB|  36| null|null|null| true|   beijing_chaoyang_red_B_d10_36|   beijing_chaoyang_red_B_d10_36|        null|2024-09-24T14:15:36.000+08:00|      null|
|2024-09-24T14:15:40.000+08:00| beijing| beijing|chaoyang|      d10|   red|BBBBBBBBBBBBBBBB|  40| null|null|40.0| null|                            null|   beijing_chaoyang_red_B_d10_40|        null|2024-09-24T14:15:40.000+08:00|2024-09-24|
|2024-09-24T14:15:50.000+08:00| beijing| beijing|chaoyang|      d10|   red|BBBBBBBBBBBBBBBB|null|50000|null|null| null|                            null|   beijing_chaoyang_red_B_d10_50|0xcafebabe50|2024-09-24T14:15:50.000+08:00|      null|
|2024-09-24T14:15:30.000+08:00| beijing| beijing|chaoyang|      d12|yellow|BBBBBBBBBBBBBBBB|null| null|30.0|null| true|                            null|beijing_chaoyang_yellow_B_d12_30|        null|2024-09-24T14:15:30.000+08:00|2024-09-24|
|2024-09-24T14:15:40.000+08:00| beijing| beijing|chaoyang|      d12|yellow|BBBBBBBBBBBBBBBB|null|40000|null|null| null|                            null|                            null|        null|2024-09-24T14:15:40.000+08:00|      null|
|2024-09-24T14:15:55.000+08:00| beijing| beijing|chaoyang|      d12|yellow|BBBBBBBBBBBBBBBB|  55| null|null|55.0| null|beijing_chaoyang_yellow_B_d12_55|                            null|0xcafebabe55|2024-09-24T14:15:55.000+08:00|      null|
|2024-09-24T14:15:36.000+08:00| beijing| beijing| haidian|      d14|   red|BBBBBBBBBBBBBBBB|  36| null|null|null| true|    beijing_haidian_red_B_d14_36|    beijing_haidian_red_B_d14_36|        null|2024-09-24T14:15:36.000+08:00|      null|
|2024-09-24T14:15:40.000+08:00| beijing| beijing| haidian|      d14|   red|BBBBBBBBBBBBBBBB|  40| null|null|40.0| null|                            null|    beijing_haidian_red_B_d14_40|        null|2024-09-24T14:15:40.000+08:00|2024-09-24|
|2024-09-24T14:15:50.000+08:00| beijing| beijing| haidian|      d14|   red|BBBBBBBBBBBBBBBB|null|50000|null|null| null|                            null|    beijing_haidian_red_B_d14_50|0xcafebabe50|2024-09-24T14:15:50.000+08:00|      null|
|2024-09-24T14:15:30.000+08:00| beijing| beijing| haidian|      d16|yellow|BBBBBBBBBBBBBBBB|null| null|30.0|null| true|                            null| beijing_haidian_yellow_B_d16_30|        null|2024-09-24T14:15:30.000+08:00|2024-09-24|
|2024-09-24T14:15:40.000+08:00| beijing| beijing| haidian|      d16|yellow|BBBBBBBBBBBBBBBB|null|40000|null|null| null|                            null|                            null|        null|2024-09-24T14:15:40.000+08:00|      null|
|2024-09-24T14:15:55.000+08:00| beijing| beijing| haidian|      d16|yellow|BBBBBBBBBBBBBBBB|  55| null|null|55.0| null| beijing_haidian_yellow_B_d16_55|                            null|0xcafebabe55|2024-09-24T14:15:55.000+08:00|      null|
+-----------------------------+--------+--------+--------+---------+------+----------------+----+-----+----+----+-----+--------------------------------+--------------------------------+------------+-----------------------------+----------+
Total line number = 64
```

* Table2: 

```SQL
IoTDB> select * from table2
+-----------------------------+---------+----+----+----+----+-----+-----+-------+------------+-----------------------------+----------+
|                         time|device_id|  s1|  s2|  s3|  s4|   s5|   s6|     s7|          s8|                           s9|       s10|
+-----------------------------+---------+----+----+----+----+-----+-----+-------+------------+-----------------------------+----------+
|1970-01-01T08:00:00.001+08:00|       d1|   1|  11| 1.1|11.1| true|text1|string1|0xcafebabe01|1970-01-01T08:00:00.001+08:00|2024-10-01|
|1970-01-01T08:00:00.002+08:00|       d1|   2|  22| 2.2|22.2|false| null|   null|        null|                         null|      null|
|1970-01-01T08:00:00.003+08:00|       d1|null|null|null|null| null|text3|string3|0xcafebabe03|1970-01-01T08:00:00.003+08:00|2024-10-03|
|1970-01-01T08:00:00.004+08:00|       d1|null|null|null|null| null|text4|string4|0xcafebabe04|1970-01-01T08:00:00.004+08:00|2024-10-04|
|1970-01-01T08:00:00.005+08:00|       d1|   5|  55| 5.5|55.5|false| null|   null|        null|                         null|      null|
+-----------------------------+---------+----+----+----+----+-----+-----+-------+------------+-----------------------------+----------+
Total line number = 5
```

* Table3: 包含 null 值

```SQL
IoTDB> select device_id, s1 from table3;
+---------+----+
|device_id|  s1|
+---------+----+
|   d_null|  30|
|   d_null|null|
|      d01|  30|
|      d01|  40|
+---------+----+
Total line number = 4
```

> From 子句中子查询使用示例可参考[FROM & JOIN 子句](../SQL-Manual/From-Join-Clause.md)，下文中主要介绍 Where、Having、Select 子句中的使用示例。

### 4.2 非关联标量子查询

**Where 子句**

从 table1 中找出设备编号为`d01`的所有记录中，数值 s1 大于或等于该设备 s1 数值平均值的记录。

SQL:

```SQL
IoTDB> SELECT s1 FROM table1 
         WHERE device_id = 'd01' 
         and s1 >= (SELECT avg(s1) from table1 WHERE device_id = 'd01');
```

结果：

```SQL
+--+
|s1|
+--+
|50|
|60|
|70|
+--+
Total line number = 3
```

**Having 子句**

统计 table1 中按设备编号（device\_id）分组，每个设备编号的记录数，找出记录数不少于 table2 中设备`d1`记录数的所有设备及其记录数。

SQL:

```SQL
IoTDB> SELECT device_id, count(*) 
         from table1 group by device_id 
         having count(*) >= (SELECT count(*) from table2 where device_id = 'd1');
```

结果：

```SQL
+---------+-----+
|device_id|_col1|
+---------+-----+
|      d01|    5|
|      d03|    5|
|      d05|    5|
|      d07|    5|
|      d09|    5|
|      d11|    5|
|      d13|    5|
|      d15|    5|
+---------+-----+
Total line number = 8
```

**Select 子句**

从 table1 中选择设备编号为`d01`的所有记录，把每个记录的 s1 字段值与子查询得到的结果（即同一设备编号下 s2 字段的最大值）相加，返回计算后的新字段值。

SQL:

```SQL
IoTDB> SELECT s1 + 
          (SELECT max(s2) from table1 where device_id = 'd01') 
          from table1 where device_id = 'd01';
```

结果：

```SQL
+-----+
|_col0|
+-----+
|  100|
|  110|
|  120|
|  130|
|  140|
+-----+
Total line number = 5
```

**特殊情况**

* 如果非聚合子查询返回的结果集刚好只有一行，也可以认为是标量子查询：

```SQL
// 子查询返回的值为 1，结果集为空集
IoTDB> SELECT s1 FROM table1 
         WHERE device_id = 'd01' and 
         s1 = (SELECT s1 FROM table2 limit 1);
```

> 如果返回的值不止一行，则会报错

* 在 SELECT 子句中作为单独的一列时，可以认为和 select 一个常量列等价，结果集形式为标量子查询结果重复 X 次，X 等于外层查询的结果集行数。

SQL:

```SQL
// 外层查询为 SELECT xx from table1 where device_id = 'd01'，
// 而 SELECT count(*) from table1 where device_id = 'd01' 的结果是5，即结果集有五行

IoTDB> SELECT 
         (SELECT max(s1) from table1 where device_id = 'd01') 
         from table1 where device_id = 'd01';
```

结果：

```SQL
+-----+
|_col0|
+-----+
|   70|
|   70|
|   70|
|   70|
|   70|
+-----+
Total line number = 5
```

### 4.3 非关联列子查询

#### 4.3.1 非关联 InPredicate

**Where 子句**

从`table1`中找出设备编号为`d01`，并且其`s1`值也出现在`table3`中相同设备编号`d01`的记录里的所有`s1`值。

SQL:

```SQL
IoTDB> SELECT s1 FROM table1 
         WHERE device_id = 'd01' and 
         s1 in (SELECT s1 from table3 WHERE device_id = 'd01');
```

结果：

```SQL
+--+
|s1|
+--+
|30|
|40|
+--+
Total line number = 2
```

**Having 子句**

从`table1`表中按`device_id`（设备编号）分组，计算每个设备编号的记录数，找出分组记录数加上 25 后，其结果值出现在`table3`表中设备编号为'd01'的`s1`字段值中的所有设备编号及其对应的记录数。

SQL:

```SQL
IoTDB> SELECT device_id, count(*) from table1 
             group by device_id 
             having count(*) + 25 
             in (SELECT cast(s1 as INT64) from table3 where device_id = 'd01');
```

结果：

```SQL
+---------+-----+
|device_id|_col1|
+---------+-----+
|      d01|    5|
|      d03|    5|
|      d05|    5|
|      d07|    5|
|      d09|    5|
|      d11|    5|
|      d13|    5|
|      d15|    5|
+---------+-----+
Total line number = 8
```

**Select 子句**

从`table1`中选择设备编号为`d01`的记录，检查这些记录的`s1`字段值是否存在于`table3`中相同设备编号`d01`的`s1`字段值中。

SQL:

```SQL
IoTDB> SELECT 
          s1 in (SELECT s1 from table3 WHERE device_id = 'd01') 
          from table1 where device_id = 'd01';
```

结果：

```SQL
+-----+
|_col0|
+-----+
| true|
| true|
|false|
|false|
|false|
+-----+
Total line number = 5
```

**特殊情况**

在 select 子句中使用 InPredicate 时（select  x [not] in （subquery） from table），结果规则总结为：

* 当前行 x 为 null，结果行为 null
* 当前行 x 不为 null
    * 无 NOT
        * x 在 subquery 结果集中则当前行结果为 True
        * x 不在 subquery 结果集中
            * 如果 subquery 结果集包含 null，则当前行结果为 null，否则为 False
    * 有 NOT
        * x 在 subquery 结果集中则当前行结果为 False
        * x 不在 subquery 结果集中
            * 如果 subquery 结果集包含 null，则当前行结果为 null，否则为 True

示例 1：X 结果集包含 null

```SQL
IoTDB> select s1 from table3;
+----+
|  s1|
+----+
|  30|
|null|
|  30|
|  40|
+----+
Total line number = 4

IoTDB> select s1 from table3 where s1 in (select s1 from table3);
+--+
|s1|
+--+
|30|
|30|
|40|
+--+
Total line number = 3
```

示例 2：在 select 子句里面使用，对应的行的结果是 null

```SQL
IoTDB> select device_id, s1 in (select s1 from table1 where device_id = 'd01'), s1 from table3 ;
+---------+-----+----+
|device_id|_col1|  s1|
+---------+-----+----+
|   d_null| true|  30|
|      d01| true|  30|
|      d01| true|  40|
|   d_null| null|null|
+---------+-----+----+
```

示例 3：子查询结果集包含 null

```SQL
IoTDB> select s1 from table1 where device_id = 'd02'
+----+
|  s1|
+----+
|  36|
|  40|
|null|
+----+
Total line number = 3

IoTDB> select s1 from table3;
+----+
|  s1|
+----+
|  30|
|null|
|  30|
|  40|
+----+
Total line number = 4
```

示例 4：在 where 子句中使用，即 where s1 in （subquery），结果集只包含 40 一行

```SQL
IoTDB> select s1 from table1 where device_id = 'd02' and s1 in (select s1 from table3);
+--+
|s1|
+--+
|40|
+--+
Total line number = 1
```

示例 5：在 select 子句中使用，s1 的结果集为 （36， 40， null），subquery 的结果集为（30， 40， null），由于 36 与非 null 的两个结果 30 和 40 不相等，且 subquery 的结果集包含 null，所以对应的结果是 null

```SQL
IoTDB> SELECT 
>     s1 in (SELECT s1 from table3) from table1 
>         where device_id = 'd02'
+-----+
|_col0|
+-----+
| null|
| true|
| null|
+-----+
Total line number = 3
```

#### 4.3.2 非关联 QuantifiedComparison

**Where 子句**

* ALL

从`table1`表中找出设备编号为`d01`的记录，并且`s1`字段值要大于`table3`表中同样设备编号的所有`s1`字段值。

SQL:

```SQL
IoTDB> SELECT s1 FROM table1 
          WHERE device_id = 'd01' and 
          s1 > all (SELECT s1 FROM table3 WHERE device_id = 'd01');
```

结果：

```SQL
+--+
|s1|
+--+
|50|
|60|
|70|
+--+
Total line number = 3
```

* ANY/SOME

从`table1`表中找出设备编号为`d01`的记录，并且`s1`字段值要大于`table3`表中同样设备编号的任意一条记录的`s1`字段值。

SQL:

```SQL
IoTDB> SELECT s1 FROM table1 
          WHERE device_id = 'd01' and 
          s1 > any (SELECT s1 FROM table1 WHERE device_id = 'd01');
```

结果：

```SQL
+--+
|s1|
+--+
|40|
|50|
|60|
|70|
+--+
Total line number = 4
```

**Having 子句**

* ALL

从`table1`中按`device_id`（设备编号）分组，计算每个设备编号的记录数量，找出分组记录数加上 35 后，大于或等于`table3`中设备编号为`d01`的所有`s1`字段值（转换为整数类型）的设备编号及其对应的记录数。

SQL:

```SQL
IoTDB> SELECT device_id, count(*) from table1 
          group by device_id 
          having count(*) + 35 >= 
          all(SELECT cast(s1 as INT64) from table3 where device_id = 'd01');
```

结果：

```SQL
+---------+-----+
|device_id|_col1|
+---------+-----+
|      d01|    5|
|      d03|    5|
|      d05|    5|
|      d07|    5|
|      d09|    5|
|      d11|    5|
|      d13|    5|
|      d15|    5|
+---------+-----+
Total line number = 8
```

* ANY/SOME

从`table1`中按`device_id`（设备编号）分组，计算每个设备编号的记录数量，找出分组记录数加上 35 后，大于或等于`table3`中设备编号为`d01`的任意一条记录`s1`字段值（转换为整数类型）的设备编号及其对应的记录数。

SQL:

```SQL
IoTDB> SELECT device_id, count(*) 
          from table1 group by device_id 
          having count(*) + 25 >= 
          any(SELECT cast(s1 as INT64) from table3 where device_id = 'd01');
```

结果：

```SQL
+---------+-----+
|device_id|_col1|
+---------+-----+
|      d01|    5|
|      d03|    5|
|      d05|    5|
|      d07|    5|
|      d09|    5|
|      d11|    5|
|      d13|    5|
|      d15|    5|
+---------+-----+
Total line number = 8
```

**Select 子句**

* ALL

从`table1`中选择设备编号为`d01`的记录，并且`s1`字段值要大于`table3`表中设备编号为`d01`的所有`s1`字段值。

SQL:

```SQL
IoTDB> SELECT s1 > 
         all(SELECT (s1) from table3 WHERE device_id = 'd01') 
         from table1 where device_id = 'd01';
```

结果：

```SQL
+-----+
|_col0|
+-----+
|false|
|false|
| true|
| true|
| true|
+-----+
Total line number = 5
```

* ANY/SOME

从`table1`中选择设备编号为`d01`的记录，并且`s1`字段值要大于`table3`表中设备编号为`d01`的任意一条记`s1`字段值。

SQL:

```SQL
IoTDB> SELECT s1 > 
          any(SELECT (s1) from table3 WHERE device_id = 'd01') 
          from table1 where device_id = 'd01';
```

结果：

```SQL
+-----+
|_col0|
+-----+
|false|
| true|
| true|
| true|
| true|
+-----+
Total line number = 5
```

**特殊情况**

ALL 要求所有比较都为 True 结果才为 True

ANY/SOME 要求任意比较为 True 结果就为 True

示例 1：ALL

```SQL
IoTDB> select s1 from table1 where device_id = 'd01'
+--+
|s1|
+--+
|30|
|40|
|50|
|60|
|70|
+--+
Total line number = 5

IoTDB> select s1 from table3;
+----+
|  s1|
+----+
|  30|
|null|
|  30|
|  40|
+----+

IoTDB> select (s1 > all(select s1 from table3)) from table1 where device_id = 'd01';
+-----+
|_col0|
+-----+
|false|
|false|
| null|
| null|
| null|
+-----+
```

说明：

* `table1s1` 的 30，40 两行，由于 `table3 s1` 的非 `null` 结果集 （30， 40） 让 30 > 40/ 40 > 40 为 `False` ，即短路求值，结果是 `false`。
* 对于 50，60，70 三个值，由于 ALL 要求的是所有比较结果都是 `True` 结果才是 `True`， 50，60，70 与 `null` 的比较都是 `null`，结果是 `null`。

示例 2：ANY/SOME

```SQL
IoTDB> SELECT s1 <= 
         any(SELECT (s1) from table3), s1 <= any(SELECT (s1) from table3 where s1 is not NULL)
         from table1 where device_id = 'd01'
+-----+-----+
|_col0|_col1|
+-----+-----+
| true| true|
| true| true|
| null|false|
| null|false|
| null|false|
+-----+-----+
```

说明：

* 对于`table1`中的 30 和 40，由于 `table3 s1` 的非 null 结果集 （30， 40），使得比较结果为`true`（成立）。
* 对于 50、60、70，由于`ANY`要求的是至少一个比较结果为`true`结果就是`true`，而与`null`的比较结果为`null`，所以这些结果为`null`。
* 在第二个查询中，由于我们排除了空值，所以对于 50、60、70，由于`table3`中没有更大的非空值，比较结果为`false`。

### 4.4 非关联表子查询

**示例：**

* 多设备降采样对齐查询，详细示例可见：[示例](../Basic-Concept/Query-Data.md#36-多设备降采样对齐查询)