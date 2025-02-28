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

# Data Recovery

Used to fix issues in data, such as data in sequential space not being arranged in chronological order.

## 1. START REPAIR DATA

Start a repair task to scan all files created before current time.
The repair task will scan all tsfiles and repair some bad files.

```sql
IoTDB> START REPAIR DATA
IoTDB> START REPAIR DATA ON LOCAL
IoTDB> START REPAIR DATA ON CLUSTER
```

## 2. STOP REPAIR DATA

Stop the running repair task. To restart the stopped task.
If there is a stopped repair task, it can be restart and recover the repair progress by executing SQL `START REPAIR DATA`.

```sql
IoTDB> STOP REPAIR DATA
IoTDB> STOP REPAIR DATA ON LOCAL
IoTDB> STOP REPAIR DATA ON CLUSTER
```

