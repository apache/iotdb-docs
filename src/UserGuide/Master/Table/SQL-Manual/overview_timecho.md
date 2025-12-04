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

## 1. Syntax Overview

```SQL
SELECT ⟨select_list⟩
    FROM ⟨tables⟩ | patternRecognition
    [WHERE ⟨condition⟩]
    [GROUP BY ⟨groups⟩]
    [HAVING ⟨group_filter⟩]
    [WINDOW windowDefinition (',' windowDefinition)*)]
    [FILL ⟨fill_methods⟩]
    [ORDER BY ⟨order_expression⟩]
    [OFFSET ⟨n⟩]
    [LIMIT ⟨n⟩];
```

The IoTDB table model query syntax supports the following clauses:

- **SELECT Clause**: Specifies the columns to be included in the result. Details: [SELECT Clause](../SQL-Manual/Select-Clause.md)
- **FROM Clause**: Indicates the data source for the query, which can be a single table, multiple tables joined using the `JOIN` clause, or a subquery. Details: [FROM & JOIN Clause](../SQL-Manual/From-Join-Clause.md)
- **patternRecognition**: Row Pattern Recognition, which supports capturing a segment of continuous data by defining recognition logic for pattern variables and regular expressions, and performs analysis and calculation on each captured data segment. Details:[Row Pattern Recognition](../SQL-Manual/Row-Pattern-Recognition.md)
- **WHERE Clause**: Filters rows based on specific conditions. Logically executed immediately after the `FROM` clause. Details: [WHERE Clause](../SQL-Manual/Where-Clause.md)
- **GROUP BY Clause**: Used for aggregating data, specifying the columns for grouping. Details: [GROUP BY Clause](../SQL-Manual/GroupBy-Clause.md)
- **HAVING Clause**: Applied after the `GROUP BY` clause to filter grouped data, similar to `WHERE` but operates after grouping. Details:[HAVING Clause](../SQL-Manual/Having-Clause.md)
- **WINDOW FUNCTION**: Window Function, a special function that performs calculations on each row based on a specific set of rows related to the current row (called a "window"). It combines grouping operations, sorting, and definable calculation ranges to implement complex cross-row calculations without collapsing the original data rows. Details: [Window Function](../SQL-Manual/Featured-Functions_timecho.md#_4-Window-Function)
- **FILL Clause**: Handles missing values in query results by specifying fill methods (e.g., previous non-null value or linear interpolation) for better visualization and analysis. Details:[FILL Clause](../SQL-Manual/Fill-Clause.md)
- **ORDER BY Clause**: Sorts query results in ascending (`ASC`) or descending (`DESC`) order, with optional handling for null values (`NULLS FIRST` or `NULLS LAST`). Details: [ORDER BY Clause](../SQL-Manual/OrderBy-Clause.md)
- **OFFSET Clause**: Specifies the starting position for the query result, skipping the first `OFFSET` rows. Often used with the `LIMIT` clause. Details: [LIMIT and OFFSET Clause](../SQL-Manual/Limit-Offset-Clause.md)
- **LIMIT Clause**: Limits the number of rows in the query result. Typically used in conjunction with the `OFFSET` clause for pagination. Details: [LIMIT and OFFSET Clause](../SQL-Manual/Limit-Offset-Clause.md)

## 2. Clause Execution Order

![](/img/data-query-1.png)