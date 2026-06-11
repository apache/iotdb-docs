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
# 数据同步

本文档主要为数据同步功能的SQL语句，详细功能介绍及使用说明见 [数据同步](../User-Manual/Data-Sync_apache.md) 

## 1.  创建任务

**语法：**

```SQL
CREATE PIPE [IF NOT EXISTS] <PipeId> -- PipeId 是能够唯一标定任务的名字
-- 数据抽取插件，可选插件
WITH SOURCE (
  [<parameter> = <value>,],
)
-- 数据处理插件，可选插件
WITH PROCESSOR (
  [<parameter> = <value>,],
)
-- 数据连接插件，必填插件
WITH SINK (
  [<parameter> = <value>,],
)
```

**示例一：全量数据同步**

```SQL
create pipe A2B
with sink (
  'sink'='iotdb-thrift-sink',
  'node-urls' = '127.0.0.1:6668', 
)
```

**示例二：部分数据同步**

```SQL
create pipe A2B
WITH SOURCE (
  'source'= 'iotdb-source',
  'mode.streaming' = 'true'  
  'database-name'='db_b.*', 
  'start-time' = '2023.08.23T08:00:00+00:00', 
  'end-time' = '2023.10.23T08:00:00+00:00'
) 
with SINK (
  'sink'='iotdb-thrift-async-sink',
  'node-urls' = '127.0.0.1:6668', 
)
```

**示例三：边云数据传输**

* 在 B IoTDB 上执行下列语句，将 B 中数据同步至 A

```SQL
create pipe BA
with source (
   'database-name'='db_b.*', 
   'table-name'='.*', 
)
with sink (
  'sink'='iotdb-thrift-sink',
  'node-urls' = '127.0.0.1:6667', 
)
```

* 在 C IoTDB 上执行下列语句，将 C 中数据同步至 A

```SQL
create pipe CA
with source (
   'database-name'='db_c.*', 
   'table-name'='.*', 
)
with sink (
  'sink'='iotdb-thrift-sink',
  'node-urls' = '127.0.0.1:6668', 
)
```

* 在 D IoTDB 上执行下列语句，将 D 中数据同步至 A

```SQL
create pipe DA
with source (
   'database-name'='db_d.*', 
   'table-name'='.*', 
)
with sink (
  'sink'='iotdb-thrift-sink',
  'node-urls' = '127.0.0.1:6669', 
)
```

**示例四：级联数据传输**

* 在 A IoTDB 上执行下列语句，将 A 中数据同步至 B

```SQL
create pipe AB
with sink (
  'sink'='iotdb-thrift-sink',
  'node-urls' = '127.0.0.1:6668', 
)
```

* 在 B IoTDB 上执行下列语句，将 B 中数据同步至 C

```SQL
create pipe BC
with source (
)
with sink (
  'sink'='iotdb-thrift-sink',
  'node-urls' = '127.0.0.1:6669', 
)
```

**示例五：压缩同步**

```SQL
create pipe A2B 
with sink (
 'node-urls' = '127.0.0.1:6668', 
 'compressor' = 'snappy,lz4',
 'rate-limit-bytes-per-second'='1048576' 
)
```

**示例六：加密同步**

```SQL
create pipe A2B
with sink (
  'sink'='iotdb-thrift-ssl-sink',
  'node-urls'='127.0.0.1:6667',  
  'ssl.trust-store-path'='pki/trusted', 
  'ssl.trust-store-pwd'='root' 
)
```

## 2. 开始任务

**语法：**

```SQL
START PIPE<PipeId>
```

**示例：**

```SQL
START PIPE A2B
```

## 3. 停止任务

**语法：**

```SQL
STOP PIPE <PipeId>
```

**示例：**

```SQL
STOP PIPE A2B
```

## 4. 删除任务

**语法：**

```SQL
DROP PIPE [IF EXISTS] <PipeId>
```

**示例：**

```SQL
DROP PIPE IF EXISTS A2B
```

## 5. 查看任务

**语法：**

```SQL
-- 查看全部任务
SHOW PIPES
-- 查看指定任务
SHOW PIPE <PipeId>
```

**示例：**

```SQL
SHOW PIPES

SHOW PIPE A2B
```

## 6. 修改任务

**语法：**

```SQL
ALTER PIPE [IF EXISTS] <PipeId>
    MODIFY/REPLACE SOURCE(...)
    MODIFY/REPLACE PROCESSOR(...)
    MODIFY/REPLACE SINK(...)
```

**示例：**

```SQL
ALTER PIPE A2B REPLACE SINK ('sink'='iotdb-thrift-sink', 'node-urls' = '127.0.0.1:6668');
```
