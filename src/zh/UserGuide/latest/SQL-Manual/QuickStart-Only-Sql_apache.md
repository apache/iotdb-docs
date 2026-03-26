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

# 快速 SQL 体验

> **在执行以下 SQL 语句前，请确保**
> 
> * **已成功启动 IoTDB 服务**
> * **已通过 Cli 客户端连接 IoTDB**
>
> 注意：若您使用的终端不支持多行粘贴（例如 Windows CMD），请将 SQL 语句调整为单行格式后再执行。

## 1. 数据库管理

```SQL
-- 创建数据库;
CREATE DATABASE root.ln;

-- 查看数据库;
SHOW DATABASES root.**;

-- 删除数据库;
DELETE DATABASE root.ln;

-- 统计数据库;
COUNT DATABASES root.**;
```

详细语法说明可参考：[数据库管理](../Basic-Concept/Operate-Metadata_apache.md#_1-数据库管理)

## 2. 时间序列管理

```SQL
-- 创建时间序列;
CREATE TIMESERIES root.ln.wf01.wt01.status BOOLEAN;
CREATE TIMESERIES root.ln.wf01.wt01.temperature FLOAT;

-- 创建对齐时间序列;
CREATE ALIGNED TIMESERIES root.ln.wf01.GPS(latitude FLOAT, longitude FLOAT);

-- 删除时间序列;
DELETE TIMESERIES root.ln.wf01.wt01.status;

-- 查看时间序列;
SHOW TIMESERIES root.ln.**;

-- 统计时间序列;
COUNT TIMESERIES root.ln.**;
```

详细语法说明可参考：[时间序列管理](../Basic-Concept/Operate-Metadata_apache.md#_2-时间序列管理)

## 3. 数据写入

```SQL
-- 单列写入;
INSERT INTO root.ln.wf01.wt01(timestamp, temperature) VALUES(1, 23.0),(2, 42.6);

-- 多列写入;
INSERT INTO root.ln.wf01.wt01(timestamp, status, temperature) VALUES (3, false, 33.1),(4, true, 24.6);
```

详细语法说明可参考：[数据写入](../Basic-Concept/Write-Data_apache.md)

## 4. 数据查询

```SQL
-- 时间过滤查询;
SELECT * from root.ln.** where time > 1;

-- 值过滤查询;
SELECT temperature FROM root.ln.wf01.wt01 where temperature > 36.5;

-- 函数查询;
SELECT count(temperature) FROM root.ln.wf01.wt01;

-- 最新点查询;
SELECT LAST status FROM root.ln.wf01.wt01;
```

详细语法说明可参考：[数据查询](../Basic-Concept/Query-Data_apache.md)

## 5. 数据删除

```SQL
-- 单列删除;
DELETE FROM root.ln.wf01.wt01.status WHERE time >= 20;

-- 多列删除;
DELETE FROM root.ln.wf01.wt01.* where time <= 10;
```

详细语法说明可参考：[数据删除](../Basic-Concept/Delete-Data.md)
