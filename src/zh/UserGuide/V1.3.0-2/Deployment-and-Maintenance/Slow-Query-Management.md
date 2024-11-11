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

# 慢查询管理

IoTDB 会将慢查询输出到单独的日志文件 log_datanode_slow_sql.log 中，并记录其执行耗时。

## 配置慢查询的阈值

IoTDB 在 `iotdb-common.properties` 提供了 `slow_query_threshold` 配置项，单位是毫秒，默认是30秒，超过此参数指定的阈值，便会被判断为慢查询，待其查询执行结束后，将其记录在 log_datanode_slow_sql.log 中。

## 慢查询日志示例

```
2023-07-31 20:15:00,533 [pool-27-IoTDB-ClientRPC-Processor-1$20230731_121500_00003_1] INFO  o.a.i.d.q.p.Coordinator:225 - Cost: 42593 ms, sql is select * from root.db.** 
```

