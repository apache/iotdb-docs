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

# Data Sync

This document mainly contains the SQL statements for the data synchronization function. For detailed function introduction and usage instructions, see [Data Sync](../User-Manual/Data-Sync_timecho.md)

## 1. Create Task

**Syntax:**

```SQL
CREATE PIPE [IF NOT EXISTS] <PipeId> -- PipeId is the name that uniquely identifies the task
-- Data extraction plugin, optional
WITH SOURCE (
  [<parameter> = <value>,],
)
-- Data processing plugin, optional
WITH PROCESSOR (
  [<parameter> = <value>,],
)
-- Data connection plugin, required
WITH SINK (
  [<parameter> = <value>,],
)
```

**Example 1: Full Data Synchronization**

```SQL
create pipe A2B
with sink (
  'sink'='iotdb-thrift-sink',
  'node-urls' = '127.0.0.1:6668', 
)
```

**Example 2: Partial Data Synchronization**

```SQL
create pipe A2B
WITH SOURCE (
  'source'= 'iotdb-source',
  'mode.streaming' = 'true',
  'database-name'='db_b.*', 
  'start-time' = '2023.08.23T08:00:00+00:00', 
  'end-time' = '2023.10.23T08:00:00+00:00'
) 
with SINK (
  'sink'='iotdb-thrift-async-sink',
  'node-urls' = '127.0.0.1:6668', 
)
```

**Example 3: Bidirectional Data Transmission**

* Execute the following statement on IoTDB A

```SQL
create pipe AB
with source (
  'source.mode.double-living' ='true'
)
with sink (
  'sink'='iotdb-thrift-sink',
  'node-urls' = '127.0.0.1:6668', 
)
```

* Execute the following statement on IoTDB B

```SQL
create pipe BA
with source (
  'source.mode.double-living' ='true' 
)
with sink (
  'sink'='iotdb-thrift-sink',
  'node-urls' = '127.0.0.1:6667', 
)
```

**Example 4: Edge-Cloud Data Transmission**

* Execute the following statement on IoTDB B to synchronize data from B to A

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

* Execute the following statement on IoTDB C to synchronize data from C to A

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

* Execute the following statement on IoTDB D to synchronize data from D to A

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

**Example 5: Cascaded Data Transmission**

* Execute the following statement on IoTDB A to synchronize data from A to B

```SQL
create pipe AB
with sink (
  'sink'='iotdb-thrift-sink',
  'node-urls' = '127.0.0.1:6668', 
)
```

* Execute the following statement on IoTDB B to synchronize data from B to C

```SQL
create pipe BC
with source (
)
with sink (
  'sink'='iotdb-thrift-sink',
  'node-urls' = '127.0.0.1:6669', 
)
```

**Example 6: Cross-Gap Data Transmission**

```SQL
create pipe A2B
with sink (
  'sink'='iotdb-air-gap-sink',
  'node-urls' = '10.53.53.53:9780', 
)
```

**Example 7: Compressed Synchronization**

```SQL
create pipe A2B 
with sink (
 'node-urls' = '127.0.0.1:6668', 
 'compressor' = 'snappy,lz4',
 'rate-limit-bytes-per-second'='1048576' 
)
```

**Example 8: Encrypted Synchronization**

```SQL
create pipe A2B
with sink (
  'sink'='iotdb-thrift-ssl-sink',
  'node-urls'='127.0.0.1:6667',  
  'ssl.trust-store-path'='pki/trusted', 
  'ssl.trust-store-pwd'='root' 
)
```

**Example 9: Local Export of Object Type Data**

```SQL
CREATE PIPE tsfile_export_local
WITH SOURCE (                           
  'source' = 'iotdb-source',
  'table-name' = 'test_table'
)
WITH PROCESSOR (
  'processor' = 'do-nothing-processor'
)
WITH SINK (
  'sink' = 'tsfile-local-sink',                         
  'sink.local.target-path' = '/data/backup/export_2024',
  'sink.rate-limit-bytes-per-second' = '10485760'      
);
```

**Example 10: Remote Transmission of Object Type Data**

* This method requires pre-registration of the `tsfile_remote_sink` plugin

```SQL
CREATE PIPE tsfile_export_scp
WITH SOURCE (
  'source' = 'iotdb-source',
  'table-name' = 'test_table'                        
)
WITH PROCESSOR (
  'processor' = 'do-nothing-processor'
)
WITH SINK (
  'sink' = 'tsfile_remote_sink',
  'sink.file-mode' = 'scp',                          
  'sink.scp.host' = '192.168.1.100',                 
  'sink.scp.port' = '22',                            
  'sink.scp.user' = 'backup_user',                  
  'sink.scp.password' = 'ComplexPass123!',           
  'sink.scp.remote-path' = '/remote/archive/',       
  'sink.rate-limit-bytes-per-second' = '10485760'    
);
```

## 2. Start Task

**Syntax:**

```SQL
START PIPE <PipeId>
```

**Example:**

```SQL
START PIPE A2B
```

## 3. Stop Task

**Syntax:**

```SQL
STOP PIPE <PipeId>
```

**Example:**

```SQL
STOP PIPE A2B
```

## 4. Drop Task

**Syntax:**

```SQL
DROP PIPE [IF EXISTS] <PipeId>
```

**Example:**

```SQL
DROP PIPE IF EXISTS A2B
```

## 5. Show Tasks

**Syntax:**

```SQL
-- Show all tasks
SHOW PIPES
-- Show a specific task
SHOW PIPE <PipeId>
```

**Example:**

```SQL
SHOW PIPES

SHOW PIPE A2B
```

## 6. Alter Task

**Syntax:**

```SQL
ALTER PIPE [IF EXISTS] <PipeId>
    MODIFY/REPLACE SOURCE(...)
    MODIFY/REPLACE PROCESSOR(...)
    MODIFY/REPLACE SINK(...)
```

**Example:**

```SQL
ALTER PIPE A2B REPLACE SINK ('sink'='iotdb-thrift-sink', 'node-urls' = '127.0.0.1:6668');
```