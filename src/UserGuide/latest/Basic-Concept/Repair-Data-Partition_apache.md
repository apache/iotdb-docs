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

# Repair Data Partition Table

In extreme cases, such as ConfigNode metadata loss or partial data partition information corruption, IoTDB provides the ability to manually repair the data partition table starting from V2\.0\.11. This feature is used to recover missing data partition information in the ConfigNode, and it is recommended to use it only after confirming that the data partition table is abnormal.

## 1. Executing the Repair Operation

When all ConfigNodes and DataNodes are running normally, execute the following SQL to trigger the repair process:

```SQL
REPAIR DATA PARTITION TABLE;
```

The system will automatically scan the data partition information on each DataNode and check whether there are missing records in the data partition table of the ConfigNode. If any missing records are found, the system will repair them automatically.

> Note: Before executing the repair operation, please make sure that both ConfigNodes and DataNodes are running normally.
> 


## 2. Viewing the Repair Progress

After executing `REPAIR DATA PARTITION TABLE`, you can view the real-time progress of the repair task with the following SQL:

```SQL
SHOW REPAIR DATA PARTITION TABLE PROGRESS;
```

After executing the SQL above, the system will return a result set containing the following fields:

|Field|Description|
|---|---|
|`Status`|The status of the current repair task|
|`Progress(%)`|The overall progress percentage of the current repair task|
|`Message`|Detailed information about the current status or progress|

During the task execution, you may see results like:

```SQL
+----------------------------+-----------+----------------------------------------------------+
|                      Status|Progress(%)|                                             Message|
+----------------------------+-----------+----------------------------------------------------+
|  COLLECT_EARLIEST_TIMESLOTS|        0.0|   DataPartitionTable integrity check progress: 0.0%|
+----------------------------+-----------+----------------------------------------------------+
```

If there is no repair task currently running, the system will return the `IDLE` status, for example:

```SQL
+------+-----------+-------------------------------------------------------+
|Status|Progress(%)|                                                Message|
+------+-----------+-------------------------------------------------------+
|  IDLE|        0.0|No running DataPartitionTable integrity check procedure|
+------+-----------+-------------------------------------------------------+
```

## 3. Configuration Parameters (Optional)

To prevent the file scanning process from affecting normal online business, IoTDB provides the following two configurable parameters to control concurrent processing capability and read throttling. You can configure them as needed in `iotdb-system.properties` according to your actual environment.

|Parameter|Description|Default Value|
|---|---|---|
|`partition_table_recover_worker_num`|The number of threads for parallel retrieval|`10`|
|`partition_table_recover_max_read_mb_per_sec`|The maximum read rate per second, in MB/s|`10`|

- During the data partition table repair process, `partition_table_recover_worker_num` is used to control the number of concurrent checking threads. In production environments, it is recommended to reserve some thread resources for the main functions of IoTDB, and this parameter value should not exceed the number of CPU cores.

- In production environments, it is recommended to set an upper limit on the read rate through `partition_table_recover_max_read_mb_per_sec` to avoid the repair operation placing excessive pressure on business reads and writes.

> Note: The above parameters are all optional, with a default value of `10`; the value must be greater than `0`, and changes take effect after restart.
> 
