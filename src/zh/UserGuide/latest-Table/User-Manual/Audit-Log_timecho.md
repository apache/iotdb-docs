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


# 安全审计

## 1. 引言

审计日志是数据库的记录凭证，通过审计日志功能可以查询数据库中增删改查等各项操作，以保证信息安全。IoTDB 审计日志功能支持以下特性：

* 可通过配置决定是否开启审计日志功能
* 可通过参数设置审计日志记录的操作类型和权限级别
* 可通过参数设置审计日志文件的存储周期，包括基于 TTL 实现时间滚动和基于 SpaceTL 实现空间滚动。
* 审计日志文件默认加密存储

> 注意：该功能从 V2.0.8 版本开始提供。

## 2. 配置参数

通过编辑配置文件 `iotdb-system.properties` 中如下参数来启动审计日志功能。

| 参数名称                              | 参数描述                                                                                                                                                                                                                | 数据类型 | 默认值                 | 生效方式 |
|-----------------------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------ | ---------- |
| `enable_audit_log`                | 是否开启审计日志。 true：启用。false：禁用。                                                                                                                                                                            | Boolean  | false                  | 重启     |
| `auditable_operation_type`        | 操作类型选择。 DML ：所有 DML 都会记录审计日志； DDL ：所有 DDL 都会记录审计日志； QUERY ：所有 QUERY 都会记录审计日志； CONTROL：所有控制语句都会记录审计日志；                                                        | String   | DML,DDL,QUERY,CONTROL  | 重启     |
| `auditable_operation_level`       | 权限级别选择。 global ：记录全部的审计日志； object：仅针对数据实例的事件的审计日志会被记录； 包含关系：object  < global。 例如：设置为 global 时，所有审计日志正常记录；设置为 object 时，仅记录对具体数据实例的操作。 | String   | global                 | 重启     |
| `auditable_operation_result`      | 审计结果选择。 success：只记录成功事件的审计日志； fail：只记录失败事件的审计日志；                                                                                                                                     | String   | success, fail          | 重启     |
| `audit_log_ttl_in_days`           | 审计日志的 TTL，生成审计日志的时间达到该阈值后过期。                                                                                                                                                                    | Double   | -1.0（永远不会被删除） | 重启     |
| `audit_log_space_tl_in_GB`        | 审计日志的 SpaceTL，审计日志总空间达到该阈值后开始轮转删除。                                                                                                                                                            | Double   | 1.0| 重启|
| `audit_log_batch_interval_in_ms`  | 审计日志批量写入的时间间隔                                                                                                                                                                                              | Long     | 1000                   | 重启     |
| `audit_log_batch_max_queue_bytes` | 用于批量处理审计日志的队列最大字节数。当队列大小超过此值时，后续的写入操作将被阻塞。                                                                                                                                    | Long     | 268435456              | 重启     |

## 3. 查阅方法

支持通过 SQL 直接阅读、获取审计日志相关信息。

### 3.1 SQL 语法

```SQL
SELECT (<audit_log_field>, )* log FROM <AUDIT_LOG_PATH> WHERE whereclause ORDER BY order_expression
```

其中：

* `AUDIT_LOG_PATH` ：审计日志存储位置`__audit.audit_log`；
* `audit_log_field`：查询字段请参考下一小节元数据结构。
* 支持 Where 条件搜索和 Order By 排序。

### 3.2 元数据结构

| 字段                   | 含义                                             | 类型      |
| ------------------------ | -------------------------------------------------- | ----------- |
| `time`             | 事件开始的的日期和时间                           | timestamp |
| `username`         | 用户名称                                         | string    |
| `cli_hostname`     | 用户主机标识                                     | string    |
| `audit_event_type` | 审计事件类型，WRITE\_DATA, GENERATE\_KEY 等      | string    |
| `operation_type`   | 审计事件的操作类型，DML, DDL, QUERY, CONTROL     | string    |
| `privilege_type`   | 审计事件使用的权限，WRITE\_DATA, MANAGE\_USER 等 | string    |
| `privilege_level`  | 事件的权限级别，global, object                   | string    |
| `result`           | 事件结果，success=1, fail=0                      | boolean   |
| `database`         | 数据库名称                                       | string    |
| `sql_string`       | 用户的原始 SQL                                   | string    |
| `log`              | 具体的事件描述                                   | string    |

### 3.3 使用示例

* 查询成功执行了DML操作的时间、用户名及主机信息

```SQL
IoTDB:__audit> select time,username,cli_hostname  from audit_log where result = true and operation_type='DML'
+-----------------------------+--------+------------+
|                         time|username|cli_hostname|
+-----------------------------+--------+------------+
|2026-01-23T11:43:46.697+08:00|    root|   127.0.0.1|
|2026-01-23T11:45:39.950+08:00|    root|   127.0.0.1|
+-----------------------------+--------+------------+
Total line number = 2
It costs 0.284s
```

* 查询最近一次操作的时间、用户名、主机信息、操作类型以及原始 SQL

```SQL
IoTDB:__audit> select time,username,cli_hostname,operation_type,sql_string  from audit_log order by time desc limit 1
+-----------------------------+--------+------------+--------------+------------------------------------------------------------------------------------------------------+
|                         time|username|cli_hostname|operation_type|                                                                                            sql_string|
+-----------------------------+--------+------------+--------------+------------------------------------------------------------------------------------------------------+
|2026-01-23T11:46:31.026+08:00|    root|   127.0.0.1|         QUERY|select time,username,cli_hostname,operation_type,sql_string  from audit_log order by time desc limit 1|
+-----------------------------+--------+------------+--------------+------------------------------------------------------------------------------------------------------+
Total line number = 1
It costs 0.053s
```

* 查询所有事件结果为false的操作数据库、操作类型及日志信息

```SQL
IoTDB:__audit> select time,database,operation_type,log  from audit_log where result=false
+-----------------------------+--------+--------------+----------------------------------------------------------------------+
|                         time|database|operation_type|                                                                   log|
+-----------------------------+--------+--------------+----------------------------------------------------------------------+
|2026-01-23T11:47:42.136+08:00|        |       CONTROL|User user1 (ID=-1) login failed with code: 804, Authentication failed.|
+-----------------------------+--------+--------------+----------------------------------------------------------------------+
Total line number = 1
It costs 0.011s
```
