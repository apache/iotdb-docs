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

# Window Functions

For time-series data feature analysis scenarios, IoTDB provides the capability of window functions, which deliver a flexible and efficient solution for in-depth mining and complex computation of time-series data. The following sections will elaborate on the feature in detail.

## 1. Function Overview

Window Functions perform calculations on each row based on a specific set of rows related to the current row (called a "window"). It combines grouping operations (`PARTITION BY`), sorting (`ORDER BY`), and definable calculation ranges (window frame `FRAME`), enabling complex cross-row calculations without collapsing the original data rows. It is commonly used in data analysis scenarios such as ranking, cumulative sums, moving averages, etc.

> Note: This feature is available starting from version V 2.0.5.

For example, in a scenario where you need to query the cumulative power consumption values of different devices, you can achieve this using window functions.

```SQL
-- Original data
+-----------------------------+------+-----+
|                         time|device| flow|
+-----------------------------+------+-----+
|1970-01-01T08:00:00.000+08:00|    d0|    3|
|1970-01-01T08:00:00.001+08:00|    d0|    5|
|1970-01-01T08:00:00.002+08:00|    d0|    3|
|1970-01-01T08:00:00.003+08:00|    d0|    1|
|1970-01-01T08:00:00.004+08:00|    d1|    2|
|1970-01-01T08:00:00.005+08:00|    d1|    4|
+-----------------------------+------+-----+

-- Create table and insert data
CREATE TABLE device_flow(device String tag,  flow INT32 FIELD);
insert into device_flow(time, device ,flow ) values ('1970-01-01T08:00:00.000+08:00','d0',3),('1970-01-01T08:00:01.000+08:00','d0',5),('1970-01-01T08:00:02.000+08:00','d0',3),('1970-01-01T08:00:03.000+08:00','d0',1),('1970-01-01T08:00:04.000+08:00','d1',2),('1970-01-01T08:00:05.000+08:00','d1',4);


-- Execute window function query
SELECT *, sum(flow) ​OVER(PARTITION​ ​BY​ device ​ORDER​ ​BY​ flow) ​as​ sum ​FROM device_flow;
```

After grouping, sorting, and calculation (steps are disassembled as shown in the figure below),

![](/img/window-function-1.png)

the expected results can be obtained:

```SQL
+-----------------------------+------+----+----+
|                         time|device|flow| sum|
+-----------------------------+------+----+----+
|1970-01-01T08:00:04.000+08:00|    d1|   2| 2.0|
|1970-01-01T08:00:05.000+08:00|    d1|   4| 6.0|
|1970-01-01T08:00:03.000+08:00|    d0|   1| 1.0|
|1970-01-01T08:00:00.000+08:00|    d0|   3| 7.0|
|1970-01-01T08:00:02.000+08:00|    d0|   3| 7.0|
|1970-01-01T08:00:01.000+08:00|    d0|   5|12.0|
+-----------------------------+------+----+----+
```

## 2. Function Definition

### 2.1 SQL Definition

```SQL
windowDefinition
    : name=identifier AS '(' windowSpecification ')'
    ;

windowSpecification
    : (existingWindowName=identifier)?
      (PARTITION BY partition+=expression (',' partition+=expression)*)?
      (ORDER BY sortItem (',' sortItem)*)?
      windowFrame?
    ;

windowFrame
    : frameExtent
    ;

frameExtent
    : frameType=RANGE start=frameBound
    | frameType=ROWS start=frameBound
    | frameType=GROUPS start=frameBound
    | frameType=RANGE BETWEEN start=frameBound AND end=frameBound
    | frameType=ROWS BETWEEN start=frameBound AND end=frameBound
    | frameType=GROUPS BETWEEN start=frameBound AND end=frameBound
    ;

frameBound
    : UNBOUNDED boundType=PRECEDING                 #unboundedFrame
    | UNBOUNDED boundType=FOLLOWING                 #unboundedFrame
    | CURRENT ROW                                   #currentRowBound
    | expression boundType=(PRECEDING | FOLLOWING)  #boundedFrame
    ;
```

### 2.2 Window Definition

#### 2.2.1 Partition

`PARTITION BY` is used to divide data into multiple independent, unrelated "groups". Window functions can only access and operate on data within their respective groups, and cannot access data from other groups. This clause is optional; if not explicitly specified, all data is divided into the same group by default. It is worth noting that unlike `GROUP BY` which aggregates a group of data into a single row, the window function with `PARTITION BY` **does not affect the number of rows within the group.**

* Example

Query statement:

```SQL
IoTDB> SELECT *, count(flow) OVER (PARTITION BY device) as count FROM device_flow;
```

Disassembly steps:

![](/img/window-function-2.png)

Query result:

```SQL
+-----------------------------+------+----+-----+
|                         time|device|flow|count|
+-----------------------------+------+----+-----+
|1970-01-01T08:00:04.000+08:00|    d1|   2|    2|
|1970-01-01T08:00:05.000+08:00|    d1|   4|    2|
|1970-01-01T08:00:00.000+08:00|    d0|   3|    4|
|1970-01-01T08:00:01.000+08:00|    d0|   5|    4|
|1970-01-01T08:00:02.000+08:00|    d0|   3|    4|
|1970-01-01T08:00:03.000+08:00|    d0|   1|    4|
+-----------------------------+------+----+-----+
```

#### 2.2.2 Ordering

`ORDER BY` is used to sort data within a partition. After sorting, rows with equal values are called peers. Peers affect the behavior of window functions; for example, different rank functions handle peers differently, and different frame division methods also handle peers differently. This clause is optional.

* Example

Query statement:

```SQL
IoTDB> SELECT *, rank() OVER (PARTITION BY device ORDER BY flow) as rank FROM device_flow;
```

Disassembly steps:

![](/img/window-function-3.png)

Query result:

```SQL
+-----------------------------+------+----+----+
|                         time|device|flow|rank|
+-----------------------------+------+----+----+
|1970-01-01T08:00:04.000+08:00|    d1|   2|   1|
|1970-01-01T08:00:05.000+08:00|    d1|   4|   2|
|1970-01-01T08:00:03.000+08:00|    d0|   1|   1|
|1970-01-01T08:00:00.000+08:00|    d0|   3|   2|
|1970-01-01T08:00:02.000+08:00|    d0|   3|   2|
|1970-01-01T08:00:01.000+08:00|    d0|   5|   4|
+-----------------------------+------+----+----+
```

#### 2.2.3 Framing

For each row in a partition, the window function evaluates on a corresponding set of rows called a Frame (i.e., the input domain of the Window Function on each row). The Frame can be specified manually, involving two attributes when specified, as detailed below.

<table style="text-align: left;">
    <tbody>
    <tr>
        <th>Frame Attribute</th>
        <th>Attribute Value</th>
        <th>Value Description</th>
    </tr>
    <tr>
        <td rowspan="3">Type</td>
        <td>ROWS</td>
        <td>Divide the frame by row number</td>
    </tr>
    <tr>
        <td>GROUPS</td>
        <td>Divide the frame by peers, i.e., rows with the same value are regarded as equivalent. All rows in peers are grouped into one group called a peer group</td>
    </tr>
    <tr>
        <td>RANGE</td>
        <td>Divide the frame by value</td>
    </tr>
    <tr>
        <td rowspan="5">Start and End Position</td>
        <td>UNBOUNDED PRECEDING</td>
        <td>The first row of the entire partition</td>
    </tr>
    <tr>
        <td>offset PRECEDING</td>
        <td>Represents the row with an "offset" distance from the current row in the preceding direction</td>
    </tr>
    <tr>
        <td>CURRENT ROW</td>
        <td>The current row</td>
    </tr>
    <tr>
        <td>offset FOLLOWING</td>
        <td>Represents the row with an "offset" distance from the current row in the following direction</td>
    </tr>
    <tr>
        <td>UNBOUNDED FOLLOWING</td>
        <td>The last row of the entire partition</td>
    </tr>
    </tbody>
</table>

Among them, the meanings of `CURRENT ROW`, `PRECEDING N`, and `FOLLOWING N` vary with the type of frame, as shown in the following table:

|                    | `ROWS`     | `GROUPS`                                                                                                                     | `RANGE`                                                                                                        |
|--------------------|------------|------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| `CURRENT ROW`      | Current row        | Since a peer group contains multiple rows, this option differs depending on whether it acts on frame_start and frame_end: * frame_start: the first row of the peer group; * frame_end: the last row of the peer group.  | Same as GROUPS, differing depending on whether it acts on frame_start and frame_end: * frame_start: the first row of the peer group; * frame_end: the last row of the peer group.  |
| `offset PRECEDING` | The previous offset rows | The previous offset peer groups;                                                                                                       | Rows whose value difference from the current row in the preceding direction is less than or equal to offset are grouped into one frame                                                                              |
| `offset FOLLOWING` | The following offset rows | The following offset peer groups.                                                                                                       | Rows whose value difference from the current row in the following direction is less than or equal to offset are grouped into one frame                                                                              |

The syntax format is as follows:

```SQL
-- Specify both frame_start and frame_end
{ RANGE | ROWS | GROUPS } BETWEEN frame_start AND frame_end
-- Specify only frame_start, frame_end is CURRENT ROW
{ RANGE | ROWS | GROUPS } frame_start
```

If the Frame is not specified manually, the default Frame division rules are as follows:

* When the window function uses ORDER BY: The default Frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW (i.e., from the first row of the window to the current row). For example: In RANK() OVER(PARTITION BY COL1 ORDER BY COL2), the Frame defaults to include the current row and all preceding rows in the partition.
* When the window function does not use ORDER BY: The default Frame is RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING (i.e., all rows in the entire window). For example: In AVG(COL2) OVER(PARTITION BY col1), the Frame defaults to include all rows in the partition, calculating the average of the entire partition.

It should be noted that when the Frame type is GROUPS or RANGE, `ORDER BY` must be specified. The difference is that ORDER BY in GROUPS can involve multiple fields, while RANGE requires calculation and thus can only specify one field.

* Example

1. Frame type is ROWS

Query statement:

```SQL
IoTDB> SELECT *, count(flow) OVER(PARTITION BY device ROWS 1 PRECEDING) as count FROM device_flow;
```

Disassembly steps:

* Take the previous row and the current row as the Frame
  * For the first row of the partition, since there is no previous row, the entire Frame has only this row, returning 1;
  * For other rows of the partition, the entire Frame includes the current row and its previous row, returning 2:

![](/img/window-function-4.png)

Query result:

```SQL
+-----------------------------+------+----+-----+
|                         time|device|flow|count|
+-----------------------------+------+----+-----+
|1970-01-01T08:00:04.000+08:00|    d1|   2|    1|
|1970-01-01T08:00:05.000+08:00|    d1|   4|    2|
|1970-01-01T08:00:00.000+08:00|    d0|   3|    1|
|1970-01-01T08:00:01.000+08:00|    d0|   5|    2|
|1970-01-01T08:00:02.000+08:00|    d0|   3|    2|
|1970-01-01T08:00:03.000+08:00|    d0|   1|    2|
+-----------------------------+------+----+-----+
```

2. Frame type is GROUPS

Query statement:

```SQL
IoTDB> SELECT *, count(flow) OVER(PARTITION BY device ORDER BY flow GROUPS BETWEEN 1 PRECEDING AND CURRENT ROW) as count FROM device_flow;
```

Disassembly steps:

* Take the previous peer group and the current peer group as the Frame. Taking the partition with device d0 as an example (same for d1), for the count of rows:
  * For the peer group with flow 1, since there are no peer groups smaller than it, the entire Frame has only this row, returning 1;
  * For the peer group with flow 3, it itself contains 2 rows, and the previous peer group is the one with flow 1 (1 row), so the entire Frame has 3 rows, returning 3;
  * For the peer group with flow 5, it itself contains 1 row, and the previous peer group is the one with flow 3 (2 rows), so the entire Frame has 3 rows, returning 3.

![](/img/window-function-5.png)

Query result:

```SQL
+-----------------------------+------+----+-----+
|                         time|device|flow|count|
+-----------------------------+------+----+-----+
|1970-01-01T08:00:04.000+08:00|    d1|   2|    1|
|1970-01-01T08:00:05.000+08:00|    d1|   4|    2|
|1970-01-01T08:00:03.000+08:00|    d0|   1|    1|
|1970-01-01T08:00:00.000+08:00|    d0|   3|    3|
|1970-01-01T08:00:02.000+08:00|    d0|   3|    3|
|1970-01-01T08:00:01.000+08:00|    d0|   5|    3|
+-----------------------------+------+----+-----+
```

3. Frame type is RANGE

Query statement:

```SQL
IoTDB> SELECT *,count(flow) OVER(PARTITION BY device ORDER BY flow RANGE BETWEEN 2 PRECEDING AND CURRENT ROW) as count FROM device_flow;
```

Disassembly steps:

* Group rows whose data is **less than or equal to 2** compared to the current row into the same Frame. Taking the partition with device d0 as an example (same for d1), for the count of rows:
  * For the row with flow 1, since it is the smallest row, the entire Frame has only this row, returning 1;
  * For the row with flow 3, note that CURRENT ROW exists as frame_end, so it is the last row of the entire peer group. There is 1 row smaller than it that meets the requirement, and the peer group has 2 rows, so the entire Frame has 3 rows, returning 3;
  * For the row with flow 5, it itself contains 1 row, and there are 2 rows smaller than it that meet the requirement, so the entire Frame has 3 rows, returning 3.

![](/img/window-function-6.png)

Query result:

```SQL
+-----------------------------+------+----+-----+
|                         time|device|flow|count|
+-----------------------------+------+----+-----+
|1970-01-01T08:00:04.000+08:00|    d1|   2|    1|
|1970-01-01T08:00:05.000+08:00|    d1|   4|    2|
|1970-01-01T08:00:03.000+08:00|    d0|   1|    1|
|1970-01-01T08:00:00.000+08:00|    d0|   3|    3|
|1970-01-01T08:00:02.000+08:00|    d0|   3|    3|
|1970-01-01T08:00:01.000+08:00|    d0|   5|    3|
+-----------------------------+------+----+-----+
```

## 3. Built-in Window Functions

<table style="text-align: left;">
  <tbody>
    <tr>
      <th>Window Function Category</th>
      <th>Window Function Name</th>
      <th>Function Definition</th>
      <th>Supports FRAME Clause</th>
    </tr>
    <tr>
      <td rowspan="1">Aggregate Function</td>
      <td>All built-in aggregate functions</td>
      <td>Aggregate a set of values to get a single aggregated result.</td>
      <td>Yes</td>
    </tr>
    <tr>
      <td rowspan="5">Value Function</td>
      <td>first_value</td>
      <td>Return the first value of the frame; if IGNORE NULLS is specified, skip leading NULLs</td>
      <td>Yes</td>
    </tr>
    <tr>
      <td>last_value</td>
      <td>Return the last value of the frame; if IGNORE NULLS is specified, skip trailing NULLs</td>
      <td>Yes</td>
    </tr>
    <tr>
      <td>nth_value</td>
      <td>Return the nth element of the frame (note that n starts from 1); if IGNORE NULLS is specified, skip NULLs</td>
      <td>Yes</td>
    </tr>
    <tr>
      <td>lead</td>
      <td>Return the element offset rows after the current row (if IGNORE NULLS is specified, NULLs are not considered); if no such element exists (exceeding the partition range), return default</td>
      <td>No</td>
    </tr>
    <tr>
      <td>lag</td>
      <td>Return the element offset rows before the current row (if IGNORE NULLS is specified, NULLs are not considered); if no such element exists (exceeding the partition range), return default</td>
      <td>No</td>
    </tr>
    <tr>
      <td rowspan="6">Rank Function</td>
      <td>rank</td>
      <td>Return the sequence number of the current row in the entire partition; rows with the same value have the same sequence number, and there may be gaps between sequence numbers</td>
      <td>No</td>
    </tr>
    <tr>
      <td>dense_rank</td>
      <td>Return the sequence number of the current row in the entire partition; rows with the same value have the same sequence number, and there are no gaps between sequence numbers</td>
      <td>No</td>
    </tr>
    <tr>
      <td>row_number</td>
      <td>Return the row number of the current row in the entire partition; note that the row number starts from 1</td>
      <td>No</td>
    </tr>
    <tr>
      <td>percent_rank</td>
      <td>Return the sequence number of the current row's value in the entire partition as a percentage; i.e., (rank() - 1) / (n - 1), where n is the number of rows in the entire partition</td>
      <td>No</td>
    </tr>
    <tr>
      <td>cume_dist</td>
      <td>Return the sequence number of the current row's value in the entire partition as a percentage; i.e., (number of rows less than or equal to it) / n </td>
      <td>No</td>
    </tr>
    <tr>
      <td>ntile</td>
      <td>Specify n to number each row from 1 to n.</td>
      <td>No</td>
    </tr>
  </tbody>
</table>

### 3.1 Aggregate Function

All built-in aggregate functions such as `sum()`, `avg()`, `min()`, `max()` can be used as Window Functions.

> Note: Unlike GROUP BY, each row has a corresponding output in the Window Function

Example:

```SQL
IoTDB> SELECT *, sum(flow) OVER (PARTITION BY device ORDER BY flow) as sum FROM device_flow;
+-----------------------------+------+----+----+
|                         time|device|flow| sum|
+-----------------------------+------+----+----+
|1970-01-01T08:00:04.000+08:00|    d1|   2| 2.0|
|1970-01-01T08:00:05.000+08:00|    d1|   4| 6.0|
|1970-01-01T08:00:03.000+08:00|    d0|   1| 1.0|
|1970-01-01T08:00:00.000+08:00|    d0|   3| 7.0|
|1970-01-01T08:00:02.000+08:00|    d0|   3| 7.0|
|1970-01-01T08:00:01.000+08:00|    d0|   5|12.0|
+-----------------------------+------+----+----+
```

### 3.2 Value Function

1. `first_value`

* Function name: `first_value(value) [IGNORE NULLS]`
* Definition: Return the first value of the frame; if IGNORE NULLS is specified, skip leading NULLs;
* Example:

```SQL
IoTDB> SELECT *, first_value(flow) OVER w as first_value FROM device_flow WINDOW w AS (PARTITION BY device ORDER BY flow ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING);
+-----------------------------+------+----+-----------+
|                         time|device|flow|first_value|
+-----------------------------+------+----+-----------+
|1970-01-01T08:00:04.000+08:00|    d1|   2|          2|
|1970-01-01T08:00:05.000+08:00|    d1|   4|          2|
|1970-01-01T08:00:03.000+08:00|    d0|   1|          1|
|1970-01-01T08:00:00.000+08:00|    d0|   3|          1|
|1970-01-01T08:00:02.000+08:00|    d0|   3|          3|
|1970-01-01T08:00:01.000+08:00|    d0|   5|          3|
+-----------------------------+------+----+-----------+
```

2. `last_value`

* Function name: `last_value(value) [IGNORE NULLS]`
* Definition: Return the last value of the frame; if IGNORE NULLS is specified, skip trailing NULLs;
* Example:

```SQL
IoTDB> SELECT *, last_value(flow) OVER w as last_value FROM device_flow WINDOW w AS (PARTITION BY device ORDER BY flow ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING);
+-----------------------------+------+----+----------+
|                         time|device|flow|last_value|
+-----------------------------+------+----+----------+
|1970-01-01T08:00:04.000+08:00|    d1|   2|         4|
|1970-01-01T08:00:05.000+08:00|    d1|   4|         4|
|1970-01-01T08:00:03.000+08:00|    d0|   1|         3|
|1970-01-01T08:00:00.000+08:00|    d0|   3|         3|
|1970-01-01T08:00:02.000+08:00|    d0|   3|         5|
|1970-01-01T08:00:01.000+08:00|    d0|   5|         5|
+-----------------------------+------+----+----------+
```

3. `nth_value`

* Function name: `nth_value(value, n) [IGNORE NULLS]`
* Definition: Return the nth element of the frame (note that n starts from 1); if IGNORE NULLS is specified, skip NULLs;
* Example:

```SQL
IoTDB> SELECT *, nth_value(flow, 2) OVER w as nth_values FROM device_flow WINDOW w AS (PARTITION BY device ORDER BY flow ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING);
+-----------------------------+------+----+----------+
|                         time|device|flow|nth_values|
+-----------------------------+------+----+----------+
|1970-01-01T08:00:04.000+08:00|    d1|   2|         4|
|1970-01-01T08:00:05.000+08:00|    d1|   4|         4|
|1970-01-01T08:00:03.000+08:00|    d0|   1|         3|
|1970-01-01T08:00:00.000+08:00|    d0|   3|         3|
|1970-01-01T08:00:02.000+08:00|    d0|   3|         3|
|1970-01-01T08:00:01.000+08:00|    d0|   5|         5|
+-----------------------------+------+----+----------+
```

4. lead

* Function name: `lead(value[, offset[, default]]) [IGNORE NULLS]`
* Definition: Return the element offset rows after the current row (if IGNORE NULLS is specified, NULLs are not considered); if no such element exists (exceeding the partition range), return default; the default value of offset is 1, and the default value of default is NULL.
* The lead function requires an ORDER BY window clause
* Example:

```SQL
IoTDB> SELECT *, lead(flow) OVER w as lead FROM device_flow WINDOW w AS(PARTITION BY device ORDER BY time);
+-----------------------------+------+----+----+
|                         time|device|flow|lead|
+-----------------------------+------+----+----+
|1970-01-01T08:00:04.000+08:00|    d1|   2|   4|
|1970-01-01T08:00:05.000+08:00|    d1|   4|null|
|1970-01-01T08:00:00.000+08:00|    d0|   3|   5|
|1970-01-01T08:00:01.000+08:00|    d0|   5|   3|
|1970-01-01T08:00:02.000+08:00|    d0|   3|   1|
|1970-01-01T08:00:03.000+08:00|    d0|   1|null|
+-----------------------------+------+----+----+
```

5. lag

* Function name: `lag(value[, offset[, default]]) [IGNORE NULLS]`
* Definition: Return the element offset rows before the current row (if IGNORE NULLS is specified, NULLs are not considered); if no such element exists (exceeding the partition range), return default; the default value of offset is 1, and the default value of default is NULL.
* The lag function requires an ORDER BY window clause
* Example:

```SQL
IoTDB> SELECT *, lag(flow) OVER w as lag FROM device_flow WINDOW w AS(PARTITION BY device ORDER BY device);
+-----------------------------+------+----+----+
|                         time|device|flow| lag|
+-----------------------------+------+----+----+
|1970-01-01T08:00:04.000+08:00|    d1|   2|null|
|1970-01-01T08:00:05.000+08:00|    d1|   4|   2|
|1970-01-01T08:00:00.000+08:00|    d0|   3|null|
|1970-01-01T08:00:01.000+08:00|    d0|   5|   3|
|1970-01-01T08:00:02.000+08:00|    d0|   3|   5|
|1970-01-01T08:00:03.000+08:00|    d0|   1|   3|
+-----------------------------+------+----+----+
```

### 3.3 Rank Function

1. rank

* Function name: `rank()`
* Definition: Return the sequence number of the current row in the entire partition; rows with the same value have the same sequence number, and there may be gaps between sequence numbers;
* Example:

```SQL
IoTDB> SELECT *, rank() OVER w as rank FROM device_flow WINDOW w AS (PARTITION BY device ORDER BY flow);
+-----------------------------+------+----+----+
|                         time|device|flow|rank|
+-----------------------------+------+----+----+
|1970-01-01T08:00:04.000+08:00|    d1|   2|   1|
|1970-01-01T08:00:05.000+08:00|    d1|   4|   2|
|1970-01-01T08:00:03.000+08:00|    d0|   1|   1|
|1970-01-01T08:00:00.000+08:00|    d0|   3|   2|
|1970-01-01T08:00:02.000+08:00|    d0|   3|   2|
|1970-01-01T08:00:01.000+08:00|    d0|   5|   4|
+-----------------------------+------+----+----+
```

2. dense_rank

* Function name: `dense_rank()`
* Definition: Return the sequence number of the current row in the entire partition; rows with the same value have the same sequence number, and there are no gaps between sequence numbers.
* Example:

```SQL
IoTDB> SELECT *, dense_rank() OVER w as dense_rank FROM device_flow WINDOW w AS (PARTITION BY device ORDER BY flow);
+-----------------------------+------+----+----------+
|                         time|device|flow|dense_rank|
+-----------------------------+------+----+----------+
|1970-01-01T08:00:04.000+08:00|    d1|   2|         1|
|1970-01-01T08:00:05.000+08:00|    d1|   4|         2|
|1970-01-01T08:00:03.000+08:00|    d0|   1|         1|
|1970-01-01T08:00:00.000+08:00|    d0|   3|         2|
|1970-01-01T08:00:02.000+08:00|    d0|   3|         2|
|1970-01-01T08:00:01.000+08:00|    d0|   5|         3|
+-----------------------------+------+----+----------+
```

3. row_number

* Function name: `row_number()`
* Definition: Return the row number of the current row in the entire partition; note that the row number starts from 1;
* Example:

```SQL
IoTDB> SELECT *, row_number() OVER w as row_number FROM device_flow WINDOW w AS (PARTITION BY device ORDER BY flow);
+-----------------------------+------+----+----------+
|                         time|device|flow|row_number|
+-----------------------------+------+----+----------+
|1970-01-01T08:00:04.000+08:00|    d1|   2|         1|
|1970-01-01T08:00:05.000+08:00|    d1|   4|         2|
|1970-01-01T08:00:03.000+08:00|    d0|   1|         1|
|1970-01-01T08:00:00.000+08:00|    d0|   3|         2|
|1970-01-01T08:00:02.000+08:00|    d0|   3|         3|
|1970-01-01T08:00:01.000+08:00|    d0|   5|         4|
+-----------------------------+------+----+----------+
```

4. percent_rank

* Function name: `percent_rank()`
* Definition: Return the sequence number of the current row's value in the entire partition as a percentage; i.e., **(rank() - 1) / (n - 1)**, where n is the number of rows in the entire partition;
* Example:

```SQL
IoTDB> SELECT *, percent_rank() OVER w as percent_rank FROM device_flow WINDOW w AS (PARTITION BY device ORDER BY flow);
+-----------------------------+------+----+------------------+
|                         time|device|flow|      percent_rank|
+-----------------------------+------+----+------------------+
|1970-01-01T08:00:04.000+08:00|    d1|   2|               0.0|
|1970-01-01T08:00:05.000+08:00|    d1|   4|               1.0|
|1970-01-01T08:00:03.000+08:00|    d0|   1|               0.0|
|1970-01-01T08:00:00.000+08:00|    d0|   3|0.3333333333333333|
|1970-01-01T08:00:02.000+08:00|    d0|   3|0.3333333333333333|
|1970-01-01T08:00:01.000+08:00|    d0|   5|               1.0|
+-----------------------------+------+----+------------------+
```

5. cume_dist

* Function name: `cume_dist`
* Definition: Return the sequence number of the current row's value in the entire partition as a percentage; i.e., **(number of rows less than or equal to it) / n**.
* Example:

```SQL
IoTDB> SELECT *, cume_dist() OVER w as cume_dist FROM device_flow WINDOW w AS (PARTITION BY device ORDER BY flow);
+-----------------------------+------+----+---------+
|                         time|device|flow|cume_dist|
+-----------------------------+------+----+---------+
|1970-01-01T08:00:04.000+08:00|    d1|   2|      0.5|
|1970-01-01T08:00:05.000+08:00|    d1|   4|      1.0|
|1970-01-01T08:00:03.000+08:00|    d0|   1|     0.25|
|1970-01-01T08:00:00.000+08:00|    d0|   3|     0.75|
|1970-01-01T08:00:02.000+08:00|    d0|   3|     0.75|
|1970-01-01T08:00:01.000+08:00|    d0|   5|      1.0|
+-----------------------------+------+----+---------+
```

6. ntile

* Function name: `ntile`
* Definition: Specify n to number each row from 1 to n.
  * If the number of rows in the entire partition is less than n, the number is the row index;
  * If the number of rows in the entire partition is greater than n:
    * If the number of rows is divisible by n, it is perfect. For example, if the number of rows is 4 and n is 2, the numbers are 1, 1, 2, 2;
    * If the number of rows is not divisible by n, distribute to the first few groups. For example, if the number of rows is 5 and n is 3, the numbers are 1, 1, 2, 2, 3;
* Example:

```SQL
IoTDB> SELECT *, ntile(2) OVER w as ntile FROM device_flow WINDOW w AS (PARTITION BY device ORDER BY flow);
+-----------------------------+------+----+-----+
|                         time|device|flow|ntile|
+-----------------------------+------+----+-----+
|1970-01-01T08:00:04.000+08:00|    d1|   2|    1|
|1970-01-01T08:00:05.000+08:00|    d1|   4|    2|
|1970-01-01T08:00:03.000+08:00|    d0|   1|    1|
|1970-01-01T08:00:00.000+08:00|    d0|   3|    1|
|1970-01-01T08:00:02.000+08:00|    d0|   3|    2|
|1970-01-01T08:00:01.000+08:00|    d0|   5|    2|
+-----------------------------+------+----+-----+
```

## 4. Scenario Examples

1. Multi-device diff function

For each row of each device, calculate the difference from the previous row:

```SQL
SELECT
    *,
    measurement - lag(measurement) OVER (PARTITION BY device ORDER BY time)
FROM data
WHERE timeCondition;
```

For each row of each device, calculate the difference from the next row:

```SQL
SELECT
    *,
    measurement - lead(measurement) OVER (PARTITION BY device ORDER BY time)
FROM data
WHERE timeCondition;
```

For each row of a single device, calculate the difference from the previous row (same for the next row):

```SQL
SELECT
    *,
    measurement - lag(measurement) OVER (ORDER BY time)
FROM data
where device='d1'
WHERE timeCondition;
```

2. Multi-device TOP_K/BOTTOM_K

Use rank to get the sequence number, then retain the desired order in the outer query.

(Note: The execution order of window functions is after the HAVING clause, so a subquery is needed here)

```SQL
SELECT *
FROM(     
    SELECT 
        *, 
        rank() OVER (PARTITION BY device ORDER BY time DESC)
    FROM data 
    WHERE timeCondition
)
WHERE rank <= 3;
```

In addition to sorting by time, you can also sort by the value of the measurement point:

```SQL
SELECT *
FROM(     
    SELECT 
        *, 
        rank() OVER (PARTITION BY device ORDER BY measurement DESC)
    FROM data 
    WHERE timeCondition
)
WHERE rank <= 3;
```

3. Multi-device CHANGE_POINTS

This SQL is used to remove consecutive identical values in the input sequence, which can be achieved with lead + subquery:

```SQL
SELECT
    time,
    device,
    measurement 
FROM(
    SELECT          
        time,         
        device,         
        measurement,         
        LEAD(measurement) OVER (PARTITION BY device ORDER BY time) AS next     
    FROM data 
    WHERE timeCondition
)
WHERE measurement != next OR next IS NULL;
```
