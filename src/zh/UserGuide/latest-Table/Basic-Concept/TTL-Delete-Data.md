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

# 过期自动删除

## 1. 概览

IoTDB支持表级的数据自动过期删除（TTL）设置，允许系统自动定期删除旧数据，以有效控制磁盘空间并维护高性能查询和低内存占用。TTL默认以毫秒为单位，数据过期后不可查询且禁止写入，但物理删除会延迟至压缩时。需注意，TTL变更可能导致短暂数据可查询性变化。

**注意事项：**

1. TTL设置为毫秒，不受配置文件时间精度影响。
2. TTL变更可能影响数据的可查询性。
3. 系统最终会移除过期数据，但存在延迟。

## 2. 设置 TTL

在表模型中，IoTDB 的 TTL 是按照表的粒度生效的。可以直接在表上设置 TTL，或者在数据库级别设置 TTL。当在数据库级别设置了TTL时，在创建新表的过程中，系统会自动采用这个TTL值作为新表的默认设置，但每个表仍然可以独立地被设置或覆盖该值。

注意，如果数据库级别的TTL被修改，不会直接影响到已经存在的表的TTL设置。

### 2.1 为表设置 TTL

如果在建表时通过sql语句设置了表的 TTL，则会以表的ttl为准。建表语句详情可见：[表管理](../Basic-Concept/Table-Management.md)

示例1：创建表时设置 TTL

```SQL
CREATE TABLE test3 ("场站" string id, "温度" int32) with (TTL=3600)
```

示例2：更改表语句设置TTL：

```SQL
ALTER TABLE tableB SET PROPERTIES TTL=3600;
```

示例3：不指定TTL或设为默认值，它将与数据库的TTL相同，默认情况下是'INF'（无穷大）：

```SQL
CREATE TABLE test3 ("场站" string id, "温度" int32) with (TTL=DEFAULT)
CREATE TABLE test3 ("场站" string id, "温度" int32)
ALTER TABLE tableB set properties TTL=DEFAULT
```

### 2.2 为数据库设置 TTL

没有设置表的TTL，则会继承database的ttl。建数据库语句详情可见：[数据库管理](../Basic-Concept/Database-Management.md)

示例4：数据库设置为 ttl =3600000，将生成一个ttl=3600000的表：

```SQL
CREATE DATABASE db WITH (ttl=3600000)
use db
CREATE TABLE test3 ("场站" string id, "温度" int32)
```

示例5：数据库不设置ttl，将生成一个没有ttl的表:

```SQL
CREATE DATABASE db
use db
CREATE TABLE test3 ("场站" string id, "温度" int32)
```

示例6：数据库设置了ttl，但想显式设置没有TTL的表，可以将TTL设置为'INF'：

```SQL
CREATE DATABASE db WITH (ttl=3600000)
use db
CREATE TABLE test3 ("场站" string id, "温度" int32) with (ttl='INF')
```

## 3. 取消 TTL

取消 TTL 设置，可以修改表的 TTL 设置为 'INF'。目前，IoTDB 不支持修改数据库的 TTL。

```SQL
ALTER TABLE tableB set properties TTL='INF'
```

## 4. 查看 TTL 信息

使用 "SHOW DATABASES" 和 "SHOW TABLES" 命令可以直接显示数据库和表的 TTL 详情。数据库和表管理语句详情可见：[数据库管理](../Basic-Concept/Database-Management.md)、[表管理](../Basic-Concept/Table-Management.md)

> 注意，树模型数据库的TTL也将显示。

```SQL
IoTDB> show databases
+---------+-------+-----------------------+---------------------+---------------------+
| Database|TTL(ms)|SchemaReplicationFactor|DataReplicationFactor|TimePartitionInterval|
+---------+-------+-----------------------+---------------------+---------------------+
|test_prop|    300|                      1|                    3|               100000|
|    test2|    300|                      1|                    1|            604800000|
+---------+-------+-----------------------+---------------------+---------------------+

IoTDB> show databases details
+---------+-------+-----------------------+---------------------+---------------------+-----+
| Database|TTL(ms)|SchemaReplicationFactor|DataReplicationFactor|TimePartitionInterval|Model|
+---------+-------+-----------------------+---------------------+---------------------+-----+
|test_prop|    300|                      1|                    3|               100000|TABLE|
|    test2|    300|                      1|                    1|            604800000| TREE|
+---------+-------+-----------------------+---------------------+---------------------+-----+
IoTDB> show tables
+---------+-------+
|TableName|TTL(ms)|
+---------+-------+
|    grass|   1000|
|   bamboo|    300|
|   flower|    INF|
+---------+-------+

IoTDB> show tables details
+---------+-------+----------+
|TableName|TTL(ms)|    Status|
+---------+-------+----------+
|     bean|    300|PRE_CREATE|
|    grass|   1000|     USING|
|   bamboo|    300|     USING|
|   flower|    INF|     USING|
+---------+-------+----------+
```