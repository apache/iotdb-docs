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

# 概览

## 1 语法概览

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

IoTDB 查询语法提供以下子句：

- SELECT 子句：查询结果应包含的列。详细语法见：[SELECT子句](../SQL-Manual/Select-Clause.md)
- FROM 子句：指出查询的数据源，可以是单个表、多个通过 `JOIN` 子句连接的表，或者是一个子查询。详细语法见：[FROM & JOIN 子句](../SQL-Manual/From-Join-Clause.md)
- WHERE 子句：用于过滤数据，只选择满足特定条件的数据行。这个子句在逻辑上紧跟在 FROM 子句之后执行。详细语法见：[WHERE 子句](../SQL-Manual/Where-Clause.md)
- GROUP BY 子句：当需要对数据进行聚合时使用，指定了用于分组的列。详细语法见：[GROUP BY 子句](../SQL-Manual/GroupBy-Clause.md)
- HAVING 子句：在 GROUP BY 子句之后使用，用于对已经分组的数据进行过滤。与 WHERE 子句类似，但 HAVING 子句在分组后执行。详细语法见：[HAVING 子句](../SQL-Manual/Having-Clause.md)
- FILL 子句：用于处理查询结果中的空值，用户可以使用 FILL 子句来指定数据缺失时的填充模式（如前一个非空值或线性插值）来填充 null 值，以便于数据可视化和分析。 详细语法见：[FILL 子句](../SQL-Manual/Fill-Clause.md)
- ORDER BY 子句：对查询结果进行排序，可以指定升序（ASC）或降序（DESC），以及 NULL 值的处理方式（NULLS FIRST 或 NULLS LAST）。详细语法见：[ORDER BY 子句](../SQL-Manual/OrderBy-Clause.md)
- OFFSET 子句：用于指定查询结果的起始位置，即跳过前 OFFSET 行。与 LIMIT 子句配合使用。详细语法见：[LIMIT 和 OFFSET 子句](../SQL-Manual/Limit-Offset-Clause.md)
- LIMIT 子句：限制查询结果的行数，通常与 OFFSET 子句一起使用以实现分页功能。详细语法见：[LIMIT 和 OFFSET 子句](../SQL-Manual/Limit-Offset-Clause.md)

## 2 子句执行顺序

1. FROM(表名)
2. WHERE(条件过滤)
3. SELECT(列名/表达式)
4. GROUP BY (分组)
5. HAVING(分组后的条件过滤)
6. FILL(空值填充)
7. ORDER BY(排序)
8. OFFSET(偏移量)
9. LIMIT(限制数量)