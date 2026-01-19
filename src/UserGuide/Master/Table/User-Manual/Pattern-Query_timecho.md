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

# Pattern Query

For time-series data feature analysis scenarios, IoTDB provides the capability of pattern query, which deliver a flexible and efficient solution for in-depth mining and complex computation of time-series data. The following sections will elaborate on the feature in detail.

## 1. Overview

Pattern query enables capturing a segment of continuous data by defining the recognition logic of pattern variables and regular expressions, and performing analysis and calculation on each captured data segment. It is suitable for business scenarios such as identifying specific patterns in time-series data (as shown in the figure below) and detecting specific events.

![](/img/timeseries-featured-analysis-1.png)

> Note: This feature is available starting from version V2.0.5.

## 2. Function Introduction
### 2.1 Syntax Format

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

**Note:**

* PARTITION BY: Optional. Used to group the input table, and each group can perform pattern matching independently. If this clause is not specified, the entire input table will be processed as a single unit.
* ORDER BY: Optional. Used to ensure that input data is processed in a specific order during matching.
* MEASURES: Optional. Used to specify which information to extract from the matched segment of data.
* ROWS PER MATCH: Optional. Used to specify the output method of the result set after successful pattern matching.
* AFTER MATCH SKIP: Optional. Used to specify which row to resume from for the next pattern match after identifying a non-empty match.
* PATTERN: Used to define the row pattern to be matched.
* SUBSET: Optional. Used to merge rows matched by multiple basic pattern variables into a single logical set.
* DEFINE: Used to define the basic pattern variables for the row pattern.

**Original Data for Syntax Examples:**

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

-- Creation Statement
create table t(device tag, totalprice int32 field)

insert into t(time,device,totalprice) values(2025-01-01T00:01:00, 'd1', 90),(2025-01-01T00:02:00, 'd1', 80),(2025-01-01T00:03:00, 'd1', 70),(2025-01-01T00:04:00, 'd1', 80),(2025-01-01T00:05:00, 'd1', 70),(2025-01-01T00:06:00, 'd1', 80)
```

### 2.2 DEFINE Clause

Used to specify the judgment condition for each basic pattern variable in pattern recognition. These variables are usually represented by identifiers (e.g., `A`, `B`), and the Boolean expressions in this clause precisely define which rows meet the requirements of the variable.

* During pattern matching execution, a row is only marked as the variable (and thus included in the current matching group) if the Boolean expression returns TRUE.

```SQL
-- A row can only be identified as B if its totalprice value is less than the totalprice value of the previous row.
DEFINE B AS totalprice < PREV(totalprice)
```

* Variables not **explicitly** defined in this clause have an implicitly set condition of always true (TRUE), meaning they can be successfully matched on any input row.

### 2.3 SUBSET Clause

Used to merge rows matched by multiple basic pattern variables (e.g., `A`, `B`) into a combined pattern variable (e.g., `U`), allowing these rows to be treated as a single logical set for operations. It can be used in the `MEASURES`, `DEFINE`, and `AFTER MATCH SKIP` clauses.

```SQL
SUBSET U = (A, B)
```
For example, for the pattern `PATTERN ((A | B){5} C+)`, it is impossible to determine whether the 5th repetition matches the basic pattern variable A or B during matching. Therefore:

1. In the `MEASURES` clause, if you need to reference the last row matched in this phase, you can do so by defining the combined pattern variable `SUBSET U = (A, B)`. At this point, the expression `RPR_LAST(U.totalprice)` will directly return the `totalprice` value of the target row.
2. In the `AFTER MATCH SKIP` clause, if the matching result does not include the basic pattern variable A or B, executing `AFTER MATCH SKIP TO LAST B` or `AFTER MATCH SKIP TO LAST A` will fail to jump due to missing anchors. However, by introducing the combined pattern variable `SUBSET U = (A, B)`, using `AFTER MATCH SKIP TO LAST U` is always valid.

### 2.4 PATTERN Clause

Used to define the row pattern to be matched, whose basic building block is a row pattern variable.

```SQL
PATTERN ( row_pattern )
```

#### 2.4.1 Pattern Types

| Row Pattern           | Syntax Format                | Description                                                                                                                                                                                                                                                                                                                                                                                                                                            |
|-----------------------|---------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Pattern Concatenation | `A B+ C+ D+`        | Composed of subpatterns without any operators, matching all subpatterns in the declared order sequentially.                                                                                                                                                                                                                                                                                                                                            |
| Pattern Alternation   | `A \| B \| C`       | Composed of multiple subpatterns separated by `\|`, matching only one of them. If multiple subpatterns can be matched, the leftmost one is selected.                                                                                                                                                                                                                                                                                                   |
| Pattern Permutation   | `PERMUTE(A, B, C)`  | Equivalent to performing alternation matching on all different orders of the subpattern elements. It requires that A, B, and C must all be matched, but their order of appearance is not fixed. If multiple matching orders are possible, the priority is determined by the **lexicographical order** based on the definition sequence of elements in the PERMUTE list. For example, A B C has the highest priority, while C B A has the lowest.       |
| Pattern Grouping      | `(A B C)`           | Encloses subpatterns in parentheses to treat them as a single unit, which can be used with other operators. For example, `(A B C)+` indicates a pattern where a group of `(A B C)` appears consecutively.                                                                                                                                                                                                                                                                                                                                                                                       |
| Empty Pattern         | `()`                | Represents an empty match that does not contain any rows.                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Pattern Exclusion     | `{- row_pattern -}` | Used to specify the matched part to be excluded from the output. Usually used with the `ALL ROWS PER MATCH` option to output rows of interest. For example, `PATTERN (A {- B+ C+ -} D+)` with ALL ROWS PER MATCH will only output the first row `(corresponding to A)` and the trailing rows `(corresponding to D+)` of the match.                                                                                                                                                                                                                                                                                                     |

#### 2.4.2 Partition Start/End Anchor

* `^A` indicates matching a pattern that starts with A as the partition beginning
  * When the value of the PATTERN clause is `^A`, the match must start from the first row of the partition, and this row must satisfy the definition of `A`.
  * When the value of the PATTERN clause is `^A^` or `A^`, the output result is empty.
* `A$` indicates matching a pattern that ends with A as the partition end
  * When the value of the PATTERN clause is `A$`, the match must end at the end of the partition, and this row must satisfy the definition of `A`.
  * When the value of the PATTERN clause is `$A` or `$A$`, the output result is empty.

**Examples**

* Query sql

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

* Results
  * When the PATTERN clause is specified as PATTERN (^A)

  ![](/img/timeseries-featured-analysis-2.png)

  Actual Return

  ```SQL
  +-----------------------------+-----+-----+-----+
  |                         time|match|price|label|
  +-----------------------------+-----+-----+-----+
  |2025-01-01T00:01:00.000+08:00|    1|   90|    A|
  +-----------------------------+-----+-----+-----+
  Total line number = 1
  ```

  * When the PATTERN clause is specified as PATTERN (^A^), the output result is empty. This is because it is impossible to match an A starting from the beginning of a partition and then return to the beginning of the partition again.

  ```SQL
  +----+-----+-----+-----+
  |time|match|price|label|
  +----+-----+-----+-----+
  +----+-----+-----+-----+
  Empty set.
  ```

  * When the PATTERN clause is specified as PATTERN (A\$)

  ![](/img/timeseries-featured-analysis-3.png)

  Actual Return

  ```SQL
  +-----------------------------+-----+-----+-----+
  |                         time|match|price|label|
  +-----------------------------+-----+-----+-----+
  |2025-01-01T00:06:00.000+08:00|    1|   80|    A|
  +-----------------------------+-----+-----+-----+
  Total line number = 1
  ```

  * When the PATTERN clause is specified as PATTERN (\$A\$), the output result is empty.

  ```SQL
  +----+-----+-----+-----+
  |time|match|price|label|
  +----+-----+-----+-----+
  +----+-----+-----+-----+
  Empty set.
  ```


#### 2.4.3 Quantifiers

Quantifiers are used to specify the number of times a subpattern repeats, placed after the corresponding subpattern (e.g., `(A | B)*`).

Common quantifiers are as follows:

| Quantifier   | Description                                                                                                                                                                                                                                                                                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `*`      | Zero or more repetitions                                                                                                                                                                                                                                                                                                                                              |
| `+`      | One or more repetitions                                                                                                                                                                                                                                                                                                                                               |
| `?`      | Zero or one repetition                                                                                                                                                                                                                                                                                                                                                |
| `{n}`    | Exactly n repetitions                                                                                                                                                                                                                                                                                                                                                 |
| `{m, n}` | Repetitions between m and n times (m and n are non-negative integers). \* If the left bound is omitted, the default starts from 0; \* If the right bound is omitted, there is no upper limit on the number of repetitions (e.g., {5,} is equivalent to "at least five times"); \* If both left and right bounds are omitted (i.e., {,}), it is equivalent to `*`. |

* The matching preference can be changed by adding `?` after the quantifier.
  * `{3,5}`: Prefers 5 times, least prefers 3 times; `{3,5}?`: Prefers 3 times, least prefers 5 times.
  * `?`: Prefers 1 time; `??`: Prefers 0 times.

### 2.5 AFTER MATCH SKIP Clause

Used to specify which row to start the next pattern match from after identifying a non-empty match.

| Jump Strategy                                               | Description                                                                    | Allows Overlapping Matches? |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------- |
| `AFTER MATCH SKIP PAST LAST ROW`                        | Default behavior. Starts from the row after the last row of the current match. | No                          |
| `AFTER MATCH SKIP TO NEXT ROW`                          | Starts from the second row in the current match.                               | Yes                         |
| `AFTER MATCH SKIP TO [ FIRST \| LAST ] pattern_variable` | Jumps to start from the [ first row | last row ] of a pattern variable.        | Yes                         |

* Among all possible configurations, only when `ALL ROWS PER MATCH WITH UNMATCHED ROWS` is used in combination with `AFTER MATCH SKIP PAST LAST ROW` can the system ensure that exactly one output record is generated for each input row.

**Examples**

* Query sql

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

* Results
  * When AFTER MATCH SKIP PAST LAST ROW is specified

  ![](/img/timeseries-featured-analysis-4-en.png)

  *
    * First match: Rows 1, 2, 3, 4
    * Second match: According to the semantics of `AFTER MATCH SKIP PAST LAST ROW`, starting from row 5, no valid match can be found
    * This pattern will never have overlapping matches

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

  * When AFTER MATCH SKIP TO NEXT ROW

  ![](/img/timeseries-featured-analysis-5-en.png)

  *
    * First match: Rows 1, 2, 3, 4
    * Second match: According to the semantics of `AFTER MATCH SKIP TO NEXT ROW`, starting from row 2, matches: Rows 2, 3, 4
    * Third match: Attempts to start from row 3, fails
    * Fourth match: Attempts to start from row 4, succeeds, matches rows 4, 5, 6
    * This pattern allows overlapping matches

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

  * When AFTER MATCH SKIP TO FIRST C

  ![](/img/timeseries-featured-analysis-6-en.png)

  *
    * First match: Rows 1, 2, 3, 4
    * Second match: Starts from the first C (i.e., row 4), matches rows 4, 5, 6
    * This pattern allows overlapping matches

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

  * When AFTER MATCH SKIP TO LAST B or AFTER MATCH SKIP TO B

  ![](/img/timeseries-featured-analysis-7-en.png)

  *
    * First match: Rows 1, 2, 3, 4
    * Second match: Attempts to start from the last B (i.e., row 3), fails
    * Third match: Attempts to start from row 4, successfully matches rows 4, 5, 6
    * This pattern allows overlapping matches

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

  * When AFTER MATCH SKIP TO U

  ![](/img/timeseries-featured-analysis-8-en.png)

  *
    * First match: Rows 1, 2, 3, 4
    * Second match: `SKIP TO U` means jumping to the last C or D; D can never match successfully, so it jumps to the last C (i.e., row 4), successfully matching rows 4, 5, 6
    * This pattern allows overlapping matches

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

  * When AFTER MATCH SKIP TO A, you cannot jump to the first row of the match, otherwise it will cause an infinite loop

  ```SQL
  Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701: AFTER MATCH SKIP TO failed: cannot skip to first row of match
  ```

  * When AFTER MATCH SKIP TO B, you cannot jump to a pattern variable that does not exist in the match group

  ```SQL
  Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701: AFTER MATCH SKIP TO failed: pattern variable is not present in match
  ```


### 2.6 ROWS PER MATCH Clause

Used to specify the output method of the result set after a successful pattern match, including the following two main options:

| Output Method      | Rule Description                                                                                 | Output Result                                                                                                                                              | Handling Logic for **Empty Matches/Unmatched Rows**                                                                                                                                                                                                                                                                                                                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ONE ROW PER MATCH  | Generates one output row for each successful match.                                              | \* Columns in the PARTITION BY clause\* Expressions defined in the MEASURES clause.                                                                        | Outputs empty matches; skips unmatched rows.                                                                                                                                                                                                                                                                                                                                                                                     |
| ALL ROWS PER MATCH | Each row in a match generates an output record, unless the row is excluded via exclusion syntax. | \* Columns in the PARTITION BY clause\* Columns in the ORDER BY clause\* Expressions defined in the MEASURES clause\* Remaining columns in the input table | \* Default: Outputs empty matches; skips unmatched rows.\* ALL ROWS PER MATCH​**SHOW EMPTY MATCHES**​: Outputs empty matches by default; skips unmatched rows.\* ALL ROWS PER MATCH​**OMIT EMPTY MATCHES**​: Does not output empty matches; skips unmatched rows.\* ALL ROWS PER MATCH​**WITH UNMATCHED ROWS**​: Outputs empty matches and generates an additional output record for each unmatched row. |

### 2.7 MEASURES Clause

Used to specify which information to extract from a matched set of data. This clause is optional; if not explicitly specified, some input columns will become the output results of pattern recognition based on the settings of the ROWS PER MATCH clause.

SQL

```SQL
MEASURES measure_expression AS measure_name [, ...]
```

* A `measure_expression` is a scalar value calculated from the matched set of data.

| Usage Example                                | Description                                                                                                                                                                             |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `A.totalprice AS starting_price`         | Returns the price from the first row in the matched group (i.e., the only row associated with variable A) as the starting price.                                                        |
| `RPR_LAST(B.totalprice) AS bottom_price` | Returns the price from the last row associated with variable B, representing the lowest price in the "V" shape pattern (corresponding to the end of the downward segment).              |
| `RPR_LAST(U.totalprice) AS top_price`    | Returns the highest price in the matched group, corresponding to the last row associated with variable C or D (i.e., the end of the entire matched group). [Assuming SUBSET U = (C, D)] |

* Each `measure_expression` defines an output column, which can be referenced by its specified `measure_name`.

### 2.8 Row Pattern Recognition Expressions

Expressions used in the MEASURES and DEFINE clauses are ​**scalar expressions**​, evaluated in the row-level context of the input table. In addition to supporting standard SQL syntax, **scalar expressions** also support special extended functions for row pattern recognition.

#### 2.8.1 Pattern Variable References

```SQL
A.totalprice  
U.orderdate  
orderstatus
```

* When a column name is prefixed with a **basic pattern variable** or a ​**combined pattern variable**​, it refers to the corresponding column values of all rows matched by that variable.
* If a column name has no prefix, it is equivalent to using the "​**global combined pattern variable**​" (i.e., the union of all basic pattern variables) as the prefix, referring to the column values of all rows in the current match.

> Using table names as column name prefixes in pattern recognition expressions is not allowed.

#### 2.8.2 Extended Functions

| Function Name                 | Function Syntax                               | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `MATCH_NUMBER` Function   | `MATCH_NUMBER()`                          | Returns the sequence number of the current match within the partition, starting from 1. Empty matches occupy match sequence numbers just like non-empty matches.                                                                                                                                                                                                                                                                                                                                                                                           |
| `CLASSIFIER` Function     | `CLASSIFIER(option)`                      | 1. Returns the name of the basic pattern variable mapped by the current row. 2. `option` is an optional parameter: a basic pattern variable `CLASSIFIER(A)` or a combined pattern variable `CLASSIFIER(U)` can be passed in to limit the function's scope; for rows outside the scope, NULL is returned directly. When used with a combined pattern variable, it can be used to distinguish which basic pattern variable in the union the row is mapped to.                                                                                    |
| Logical Navigation Functions  | `RPR_FIRST(expr, k)`                      | 1. Indicates locating the first row satisfying `expr` in the ​**current match group**​, then searching for the k-th occurrence of the row corresponding to the same pattern variable towards the end of the group, and returning the specified column value of that row. If the k-th matching row is not found in the specified direction, the function returns NULL. 2. `k` is an optional parameter, defaulting to 0 (only locating the first row satisfying the condition); if explicitly specified, it must be a non-negative integer. |
| Logical Navigation Functions  | `RPR_LAST(expr, k)`                       | 1. Indicates locating the last row satisfying `expr` in the ​**current match group**​, then searching for the k-th occurrence of the row corresponding to the same pattern variable towards the start of the group, and returning the specified column value of that row. If the k-th matching row is not found in the specified direction, the function returns NULL. 2. `k` is an optional parameter, defaulting to 0 (only locating the last row satisfying the condition); if explicitly specified, it must be a non-negative integer. |
| Physical Navigation Functions | `PREV(expr, k)`                           | 1. Indicates offsetting k rows towards the start from the last row matched to the given pattern variable, and returning the corresponding column value. If navigation exceeds the ​**partition boundary**​, the function returns NULL. 2. `k` is an optional parameter, defaulting to 1; if explicitly specified, it must be a non-negative integer.                                                                                                                                                                                           |
| Physical Navigation Functions | `NEXT(expr, k)`                           | 1. Indicates offsetting k rows towards the end from the last row matched to the given pattern variable, and returning the corresponding column value. If navigation exceeds the ​**partition boundary**​, the function returns NULL. 2. `k` is an optional parameter, defaulting to 1; if explicitly specified, it must be a non-negative integer.                                                                                                                                                                                             |
| Aggregate Functions           | COUNT, SUM, AVG, MAX, MIN Functions           | Can be used to calculate data in the current match. Aggregate functions and navigation functions are not allowed to be nested within each other. (Supported from version V2.0.6)                                                                                                                                                                                                                                                                                                                                                                           |
| Nested Functions              | `PREV/NEXT(CLASSIFIER())`                 | Nesting of physical navigation functions and the CLASSIFIER function. Used to obtain the pattern variables corresponding to the previous and next matching rows of the current row.                                                                                                                                                                                                                                                                                                                                                                        |
| Nested Functions              | `PREV/NEXT(RPR_FIRST/RPR_LAST(expr, k)`） | **Logical functions are allowed to be nested** inside physical functions; **physical functions are not allowed to be nested** inside logical functions. Used to perform logical offset first, then physical offset.                                                                                                                                                                                                                                                                                                                            |

**Examples**

1. CLASSIFIER Function

* Query sql

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
* Analysis

  ![](/img/timeseries-featured-analysis-9-en.png)

* Result

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

2. Logical Navigation Functions

* Query sql

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

* Results
  * When the value is totalprice, RPR\_LAST(totalprice), RUNNING RPR\_LAST(totalprice)

  ![](/img/timeseries-featured-analysis-10.png)

  Actual Return

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

  * When the value is FINAL RPR\_LAST(totalprice)

  ![](/img/timeseries-featured-analysis-11.png)

  Actual Return

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

  * When the value is RPR\_FIRST(totalprice), RUNNING RPR\_FIRST(totalprice), FINAL RPR\_FIRST(totalprice)

  ![](/img/timeseries-featured-analysis-12.png)

  Actual Return

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

  * When the value is RPR\_LAST(totalprice, 2)

  ![](/img/timeseries-featured-analysis-13.png)

  Actual Return

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

  * When the value is FINAL RPP\_LAST(totalprice, 2)

  ![](/img/timeseries-featured-analysis-14.png)

  Actual Return

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

  * When the value is RPR\_FIRST(totalprice, 2) and FINAL RPR\_FIRST(totalprice, 2)

  ![](/img/timeseries-featured-analysis-15.png)

  Actual Return

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

3. Physical Navigation Functions

* Query sql

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

* Results
  * When the value is `PREV(totalprice)`

  ![](/img/timeseries-featured-analysis-16.png)

  Actual Return

  ```SQL
  +-----------------------------+-------+
  |                         time|measure|
  +-----------------------------+-------+
  |2025-01-01T00:04:00.000+08:00|     70|
  |2025-01-01T00:06:00.000+08:00|     70|
  +-----------------------------+-------+
  Total line number = 2
  ```

  * When the value is `PREV(B.totalprice, 2)`

  ![](/img/timeseries-featured-analysis-17.png)

  Actual Return

  ```SQL
  +-----------------------------+-------+
  |                         time|measure|
  +-----------------------------+-------+
  |2025-01-01T00:04:00.000+08:00|     80|
  |2025-01-01T00:06:00.000+08:00|     80|
  +-----------------------------+-------+
  Total line number = 2
  ```

  * When the value is `PREV(B.totalprice, 4)`

  ![](/img/timeseries-featured-analysis-18.png)

  Actual Return

  ```SQL
  +-----------------------------+-------+
  |                         time|measure|
  +-----------------------------+-------+
  |2025-01-01T00:04:00.000+08:00|   null|
  |2025-01-01T00:06:00.000+08:00|     80|
  +-----------------------------+-------+
  Total line number = 2
  ```

  * When the value is `NEXT(totalprice)` or `NEXT(B.totalprice, 1)`

  ![](/img/timeseries-featured-analysis-19.png)

  Actual Return

  ```SQL
  +-----------------------------+-------+
  |                         time|measure|
  +-----------------------------+-------+
  |2025-01-01T00:04:00.000+08:00|     70|
  |2025-01-01T00:06:00.000+08:00|   null|
  +-----------------------------+-------+
  Total line number = 2
  ```

  * `When the value is `NEXT(B.totalprice, 2)`

  ![](/img/timeseries-featured-analysis-20.png)

  Actual Return

  ```SQL
  +-----------------------------+-------+
  |                         time|measure|
  +-----------------------------+-------+
  |2025-01-01T00:04:00.000+08:00|     80|
  |2025-01-01T00:06:00.000+08:00|   null|
  +-----------------------------+-------+
  Total line number = 2
  ```

4. Aggregate Functions

* Query sql

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
* Analysis (Taking MIN(totalprice) as an Example)

![](/img/timeseries-featured-analysis-21.png)

* Result

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

5. Nested Functions

Example 1

* Query sql

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
* Analysis

![](/img/timeseries-featured-analysis-22-en.png)

* Result

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

Example 2

* Query sql

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
* Analysis

![](/img/timeseries-featured-analysis-23.png)

* Result

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

#### 2.8.3 RUNNING and FINAL Semantics

1. Definition

* `RUNNING`: Indicates the calculation scope is from the start row of the current match group to the row currently being processed (i.e., up to the current row).
* `FINAL`: Indicates the calculation scope is from the start row of the current match group to the final row of the group (i.e., the entire match group).

2. Scope of Application

* The DEFINE clause uses RUNNING semantics by default.
* The MEASURES clause uses RUNNING semantics by default and supports specifying FINAL semantics. When using the ONE ROW PER MATCH output mode, all expressions are calculated from the last row position of the match group, and at this time, RUNNING semantics are equivalent to FINAL semantics.

3. Syntax Constraints

* RUNNING and FINAL need to be written before **logical navigation functions** or aggregate functions, and cannot directly act on **column references.**
  * Valid: `RUNNING RPP_LAST(A.totalprice)`, `FINAL RPP_LAST(A.totalprice)`
  * Invalid: `RUNNING A.totalprice`, `FINAL A.totalprice`, `RUNNING PREV(A.totalprice)`

## 3. Scenario Examples

Using [Sample Data](../Reference/Sample-Data.md) as the source data

### 3.1 Time Segment Query

Segment the data in table1 by time intervals less than or equal to 24 hours, and query the total number of data entries in each segment, as well as the start and end times.

Query SQL

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

Results

```SQL
+-----------------------------+-----------------------------+---+
|                   start_time|                     end_time|cnt|
+-----------------------------+-----------------------------+---+
|2024-11-26T13:37:00.000+08:00|2024-11-26T13:38:00.000+08:00|  2|
|2024-11-27T16:38:00.000+08:00|2024-11-30T14:30:00.000+08:00| 16|
+-----------------------------+-----------------------------+---+
Total line number = 2
```

### 3.2 Difference Segment Query

Segment the data in table2 by humidity value differences less than 0.1, and query the total number of data entries in each segment, as well as the start and end times.

* Query SQL

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

* Results

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

### 3.3 Event Statistics Query

Group the data in table1 by device ID, and count the start and end times and maximum humidity value where the humidity in the Shanghai area is greater than 35.

* Query SQL

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

* Results

```SQL
+---------+-----+-----------------------------+-----------------------------+------------+
|device_id|match|                  event_start|                    event_end|max_humidity|
+---------+-----+-----------------------------+-----------------------------+------------+
|      100|    1|2024-11-28T09:00:00.000+08:00|2024-11-29T18:30:00.000+08:00|        45.1|
|      101|    1|2024-11-30T09:30:00.000+08:00|2024-11-30T09:30:00.000+08:00|        35.2|
+---------+-----+-----------------------------+-----------------------------+------------+
Total line number = 2
```
