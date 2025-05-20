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

# Nested Queries

## 1. Overview

Nested queries, also known as subqueries, refer to query statements that contain one or more other query statements within them. A nested query consists of an inner query and an outer query.

## 2. Classification of Nested Queries

Nested queries can be classified based on two criteria: whether they reference the outer query and the dimensionality of the result set.

* **Classification by Reference to Outer Query:**

<table style="text-align: left;">
  <tbody>
     <tr>   <th>Classification Basis</th>
            <th>Nested Query Type</th>        
            <th>Description</th>
            <th>IoTDB Support</th>
      </tr>
      <tr>
            <td rowspan="2">Whether to Reference Outer Query</td>  
            <td>Non-Correlated Subquery</td>
            <td>The execution of the inner query is independent of the outer query. The inner query executes only once, and its result is used as a condition for the outer query.</td>
            <td>Supported</td>
      </tr>
      <tr>
            <td>Correlated Subquery</td>
            <td>The inner query references columns from the outer query's table, requiring the outer query to execute first, followed by the inner query.</td>
            <td>Not Supported</td>
      </tr>
  </tbody>
</table>

* **Classification by Result Set Dimensionality:**

<table style="text-align: left;">
  <tbody>
     <tr>   <th>Classification Basis</th>
            <th>Subquery Type</th>        
            <th>Description</th>
            <th>Usable Clauses</th>
            <th>IoTDB Support</th>
      </tr>
      <tr>
            <td rowspan="4">Result Set Dimensionality</td>  
            <td>Scalar Subquery</td>
            <td>Returns a single row and column.</td>
            <td>select、where、from、having</td>
            <td>Supported</td>
      </tr>
      <tr>
            <td>Column Subquery</td>
            <td>Returns N rows and one column.</td>
            <td>select、where、from、having</td>
            <td>Supported</td>
      </tr>
      <tr>
            <td>Row Subquery</td>
            <td>Returns one row and N columns.</td>
            <td> - </td>
            <td>Not Supported</td>
      </tr>
      <tr>
            <td>Table Subquery</td>
            <td>Returns N rows and M columns.</td>
            <td>from </td>
            <td>Supported</td>
      </tr>
  </tbody>
</table>

## 3. Functional Definitions

1. All inner queries must be enclosed in parentheses (subquery).

2. Non-correlated subqueries cannot reference columns from the outer query. Attempting to do so will result in an error:

    `Msg: org.apache.iotdb.jdbc.IoTDBSQLException： 701: Given correlated subquery is not supported`

### 3.1 Non-Correlated Scalar Subqueries

A scalar subquery returns a single scalar value and can be used to replace an operand in an expression.

**Syntax**

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

**Notes**

Scalar subqueries can be used as operands in any expression unless the input parameters are explicitly defined as constants.

Examples where scalar subqueries cannot be used as parameters:

* The first and third parameters of `date_bin(interval,source,origin)`.
* The first and third parameters of `date_bin_gapfill(interval,source,origin)`.
    * `interval` ：Time interval
    * `origin`：Starting timestamp
* `Fill` parameters
    * `fill previous`
    * `fill linear`
    * `fill constant`

### 3.2 Non-Correlated Column Subqueries

#### 3.2.1 Non-Correlated InPredicate

An InPredicate is a predicate that returns a column of boolean values.

**Syntax**

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

**Notes**

Usage: `X [NOT] IN (subquery)`

* `X` is an expression.
* `NOT` is optional (negation).
* `subquery` returns a result set `Result`with one column and multiple rows.
* For `WHERE X IN (subquery)`, each row where `X` is in `Result` will be retained in the `SELECT` output.

#### 3.2.2 Non-Correlated Quantified Comparison

A quantified comparison allows comparing a value to a set of values, typically consisting of:

1. Comparison operators:`<`， `>`， `=`， `<=`， `>=`， `!=`
2. Quantifiers:
    1. `ALL`: All elements must satisfy the condition.
    2. `ANY` or `SOME`: At least one element must satisfy the condition (ANY and SOME are equivalent).
3. Subquery: Returns a set of values to compare with the main query's value.

**Syntax**

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

**Notes**

Usage: `expression operator ALL/ANY/SOME (subquery)`

* ALL: The `expression` in the main query must satisfy the condition with every value returned by the subquery.
* ANY/SOME: The `expression` in the main query must satisfy the condition with at least one value returned by the subquery.

## 4. Usage Examples
### 4.1 Example Data

s1, s2, s3, s4 are of types INT, LONG, FLOAT, DOUBLE respectively.

* Table1:

```SQL
// All data in table1
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

* Table 3: Contains Null Values

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

> Examples of subquery usage in the FROM clause can be referenced in [FROM & JOIN Clause](../SQL-Manual/From-Join-Clause.md). The following text primarily introduces examples of usage in the WHERE, HAVING, and SELECT clauses.


### 4.2 Non-Correlated Scalar Subquery Examples

**Where Clause**

Find records in table1 where `device_id = 'd01'` and s1 is greater than or equal to the average s1 value for the same device.

SQL:

```SQL
IoTDB> SELECT s1 FROM table1 
         WHERE device_id = 'd01' 
         and s1 >= (SELECT avg(s1) from table1 WHERE device_id = 'd01');
```

Result:

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

**Having Clause**

Group table1 by `device_id` and count records, filtering groups where the count is not less than the count of records for device `d1` in table2.

SQL:

```SQL
IoTDB> SELECT device_id, count(*) 
         from table1 group by device_id 
         having count(*) >= (SELECT count(*) from table2 where device_id = 'd1');
```

Result:

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

**Select Clause**

For each record in table1 where `device_id = 'd01'`, add its s1 value to the maximum s2 value for the same device (from a subquery).

SQL:

```SQL
IoTDB> SELECT s1 + 
          (SELECT max(s2) from table1 where device_id = 'd01') 
          from table1 where device_id = 'd01';
```

Result:

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

**Special Cases** 

* If a non-aggregate subquery returns exactly one row of results, it can also be treated as a scalar subquery: 

```SQL
// The subquery returns a value of 1, resulting in an empty result set
IoTDB> SELECT s1 FROM table1 
         WHERE device_id = 'd01' and 
         s1 = (SELECT s1 FROM table2 limit 1);
```

> If the subquery returns more than one row, an error will be thrown.

* When used as a standalone column in the SELECT clause, it can be considered equivalent to selecting a constant column. The result set will repeat the scalar subquery result X times, where X equals the number of rows in the outer query's result set.

SQL:

```SQL
// The outer query is: SELECT xx FROM table1 WHERE device_id = 'd01'
// And SELECT count(*) FROM table1 WHERE device_id = 'd01' returns 5, meaning the result set contains five rows

IoTDB> SELECT 
         (SELECT max(s1) from table1 where device_id = 'd01') 
         from table1 where device_id = 'd01';
```

Result:

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
 
### 4.3 Non-Correlated Column Subquery Examples

#### 4.3.1 Non-Correlated InPredicate

**Where Clause**
 
Find records in `table1` where `device_id = 'd01'` and `s1` values exist in `table3` for the same device.

SQL:

```SQL
IoTDB> SELECT s1 FROM table1 
         WHERE device_id = 'd01' and 
         s1 in (SELECT s1 from table3 WHERE device_id = 'd01');
```

Result:

```SQL
+--+
|s1|
+--+
|30|
|40|
+--+
Total line number = 2
```

**Having Clause**

From the `table1` table, group by `device_id`, calculate the record count for each device ID, and find all device IDs and their corresponding record counts where the result of adding 25 to the grouped record count appears in the s1 field values of records with device ID `'d01'` in the `table3` table.

SQL:

```SQL
IoTDB> SELECT device_id, count(*) from table1 
             group by device_id 
             having count(*) + 25 
             in (SELECT cast(s1 as INT64) from table3 where device_id = 'd01');
```

Result:

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

**Select Clause**
 
From `table1`, select records where `device_id = 'd01'` and check whether their `s1` field values exist in the `s1` field values of records with the same device ID (`d01`) in `table3`.

SQL:

```SQL
IoTDB> SELECT 
          s1 in (SELECT s1 from table3 WHERE device_id = 'd01') 
          from table1 where device_id = 'd01';
```

Result:

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

**Special Cases**

When using InPredicate in the SELECT clause (SELECT x [NOT] IN (subquery) FROM table), the result rules are summarized as follows:

* If the current row's x is null, the result is null
* If the current row's x is not null:
  * Without NOT:
    * If x exists in the subquery result set, the current row result is True
    * If x does not exist in the subquery result set:
      * If the subquery result set contains null, the current row result is null; otherwise, it's False
  * With NOT:
    * If x exists in the subquery result set, the current row result is False
    * If x does not exist in the subquery result set:
      * If the subquery result set contains null, the current row result is null; otherwise, it's True

Example 1: When X result set contains null

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

Example 2: When used in the SELECT clause, the corresponding row's result is null 

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

Example 3: When the subquery result set contains null values

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

Example 4: Use in the where clause, that is, where s1 in (subquery). The result set only contains one row of 40.

```SQL
IoTDB> select s1 from table1 where device_id = 'd02' and s1 in (select s1 from table3);
+--+
|s1|
+--+
|40|
+--+
Total line number = 1
```

Example 5: Use it in the select clause. The result set of s1 is (36, 40, null), and the result set of subquery is (30, 40, null). Since 36 is not equal to the two non-null results 30 and 40, and the result set of subquery contains null, the corresponding result is null.

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

#### 4.3.2 Non-Correlated Quantified Comparison

**WHERE Clause**

* ALL

Find the records with the equipment number `d01` from the `table1`, and the value of the `s1` field must be greater than all the `s1` field values of the same equipment number in the `table3`.

SQL:

```SQL
IoTDB> SELECT s1 FROM table1 
          WHERE device_id = 'd01' and 
          s1 > all (SELECT s1 FROM table3 WHERE device_id = 'd01');
```

Result:

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

Find the records with the equipment number `d01` from the `table1`, and the value of the `s1` field must be greater than the `s1` field value of any record with the same equipment number in the `table3`.

SQL:

```SQL
IoTDB> SELECT s1 FROM table1 
          WHERE device_id = 'd01' and 
          s1 > any (SELECT s1 FROM table1 WHERE device_id = 'd01');
```

Result:

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

**HAVING Clause**

* ALL

Group the records in `table1` by `device_id` (equipment number), calculate the number of records for each equipment number. Then, find the equipment numbers and their corresponding record counts such that the sum of the group record count and 35 is greater than or equal to all the `s1` field values (converted to the integer type) of the equipment number `d01` in `table3`.

SQL:

```SQL
IoTDB> SELECT device_id, count(*) from table1 
          group by device_id 
          having count(*) + 35 >= 
          all(SELECT cast(s1 as INT64) from table3 where device_id = 'd01');
```

Result:

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

Group the records in `table1` by `device_id` (equipment number), calculate the number of records for each equipment number. Then, find the equipment numbers and their corresponding record counts such that the sum of the group record count and 35 is greater than or equal to any one of the `s1` field values (converted to the integer type) of the equipment number `d01` in `table3`.

SQL:

```SQL
IoTDB> SELECT device_id, count(*) 
          from table1 group by device_id 
          having count(*) + 25 >= 
          any(SELECT cast(s1 as INT64) from table3 where device_id = 'd01');
```

Result:

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

**SELECT Clause**

* ALL

Select the records with the equipment number `d01` from `table1`, and the value of the `s1` field must be greater than all the `s1` field values of the equipment number `d01` in `table3`.

SQL:

```SQL
IoTDB> SELECT s1 > 
         all(SELECT (s1) from table3 WHERE device_id = 'd01') 
         from table1 where device_id = 'd01';
```

Result:

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

Select the records with the equipment number `d01` from `table1`, and the value of the `s1` field must be greater than any one of the `s1` field values of the equipment number `d01` in `table3`.

SQL:

```SQL
IoTDB> SELECT s1 > 
          any(SELECT (s1) from table3 WHERE device_id = 'd01') 
          from table1 where device_id = 'd01';
```

Result:

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

**Special Cases**

ALL requires all comparisons to be True for the result to be True.

ANY/SOME requires any comparison to be True for the result to be True.

Example 1: ALL

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

Note:

* For the two rows of 30 and 40 in `table1s1`, since the non-`null` result set (30, 40) of `table3 s1` makes 30 > 40 / 40 > 40 evaluate to `False`, that is, short-circuit evaluation occurs, and the result is `false`.
* For the three values of 50, 60, and 70, since ALL requires all comparison results to be `True` for the final result to be `True`, the comparisons of 50, 60, and 70 with `null` are all `null`, and the result is `null`.

Example 2: ANY/SOME

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

Note:

* For 30 and 40 in `table1`, because of the non-null result set (30, 40) of `table3 s1`, the comparison results are `true` (valid).
* For 50, 60, and 70, since `ANY` requires at least one comparison result to be `true` for the overall result to be `true`, and the comparison results with `null` are `null`, these results are `null`.
* In the second query, because we have excluded null values, for 50, 60, and 70, there are no larger non-null values in `table3`, so the comparison results are `false`.

### 4.4 Non-Correlated Subqueries

**Example:**

* Multi device downsampling alignment query. For detailed examples, see: [Example](../Basic-Concept/Query-Data.md#36-multi-device-downsampling-alignment-query)