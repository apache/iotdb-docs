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

# Overview

## Syntax Overview

```SQL
SELECT ⟨select_list⟩
    FROM ⟨tables⟩
    [WHERE ⟨condition⟩]
    [GROUP BY ⟨groups⟩]
    [HAVING ⟨group_filter⟩]
    [FILL ⟨fill_methods⟩]
    [ORDER BY ⟨order_expression⟩]
    [OFFSET ⟨n⟩]
    [LIMIT ⟨n⟩];
```

IoTDB query syntax provides the following clauses:

- SELECT Clause: The columns to include in the query results. For detailed syntax, see: [SELECTClauses](../SQL-Manual/Select-Clause.md)
- FROM Clause: Specifies the data source of the query, which can be a single table, multiple tables joined using the JOIN clause, or a subquery. For detailed syntax, see: [FROM & JOIN Clauses](../SQL-Manual/From-Join-Clause.md)
- WHERE Clause: Used to filter data, selecting only rows that meet specific conditions. This clause is logically executed immediately after the FROM clause. For detailed syntax, see:[WHERE Clauses](../SQL-Manual/Where-Clause.md)
- GROUP BY Clause: Used when data aggregation is needed, specifying the columns used for grouping. For detailed syntax, see: [GROUP BY Clauses](../SQL-Manual/GroupBy-Clause.md)
- HAVING Clause: Used after the GROUP BY clause to filter data that has already been grouped. Similar to the WHERE clause, but the HAVING clause is executed after grouping. For detailed syntax, see: [HAVING Clauses](../SQL-Manual/Having-Clause.md)
- FILL Clause: Used to handle null values in the query results. Users can specify filling modes (such as the previous non-null value or linear interpolation) to fill null values with the FILL clause, facilitating data visualization and analysis. For detailed syntax, see: [FILL Clauses](../SQL-Manual/Fill-Clause.md)
- ORDER BY Clause: Sorts the query results, specifying ascending (ASC) or descending (DESC) order, as well as handling of NULL values (NULLS FIRST or NULLS LAST). For detailed syntax, see: [ORDER BY Clauses](../SQL-Manual/OrderBy-Clause.md)
- OFFSET Clause: Used to specify the starting position of the query results, that is, skipping the first OFFSET rows. Used in conjunction with the LIMIT clause. For detailed syntax, see: [LIMIT and OFFSET Clauses](../SQL-Manual/Limit-Offset-Clause.md)
- LIMIT Clause: Limits the number of rows in the query results, often used with the OFFSET clause to implement pagination. For detailed syntax, see: [LIMIT and OFFSET Clauses](../SQL-Manual/Limit-Offset-Clause.md)

## Clause Execution Order

1. FROM (table name)
2. WHERE (condition filtering)
3. SELECT (column names/expressions)
4. GROUP BY (grouping)
5. HAVING (condition filtering after grouping)
6. FILL(null value filling)
7. ORDER BY (sorting)
8. OFFSET (offset amount)
9. LIMIT (limit amount)