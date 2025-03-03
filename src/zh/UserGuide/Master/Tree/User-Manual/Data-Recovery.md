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

# 数据修复

用于修复数据中存在的问题，如顺序空间内的数据未按时间递增顺序排列。

## 1. START REPAIR DATA

启动一个数据修复任务，扫描创建修复任务的时间之前产生的 tsfile 文件并修复有乱序错误的文件。

```sql
IoTDB> START REPAIR DATA
IoTDB> START REPAIR DATA ON LOCAL
IoTDB> START REPAIR DATA ON CLUSTER
```

## 2. STOP REPAIR DATA

停止一个进行中的修复任务。如果需要再次恢复一个已停止的数据修复任务的进度，可以重新执行 `START REPAIR DATA`.

```sql
IoTDB> STOP REPAIR DATA
IoTDB> STOP REPAIR DATA ON LOCAL
IoTDB> STOP REPAIR DATA ON CLUSTER
```

