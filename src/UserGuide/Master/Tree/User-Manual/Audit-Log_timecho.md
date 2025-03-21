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

# Audit log

## 1. Background of the function

Audit log is the record credentials of a database, which can be queried by the audit log function to ensure information security by various operations such as user add, delete, change and check in the database. With the audit log function of IoTDB, the following scenarios can be achieved:

- We can decide whether to record audit logs according to the source of the link ( human operation or not), such as: non-human operation such as hardware collector write data no need to record audit logs, human operation such as ordinary users through cli, workbench and other tools to operate the data need to record audit logs.
- Filter out system-level write operations, such as those recorded by the IoTDB monitoring system itself.

### 1.1 Scene Description

#### Logging all operations (add, delete, change, check) of all users

The audit log function traces all user operations in the database. The information recorded should include data operations (add, delete, query) and metadata operations (add, modify, delete, query), client login information (user name, ip address).

Client Sources：
- Cli、workbench、Zeppelin、Grafana、通过 Session/JDBC/MQTT 等协议传入的请求

![](/img/audit-log.png)

#### Audit logging can be turned off for some user connections

No audit logs are required for data written by the hardware collector via Session/JDBC/MQTT if it is a non-human action.

## 2. Function Definition

It is available through through configurations:

- Decide whether to enable the audit function or not
- Decide where to output the audit logs, support output to one or more
    1. log file
    2. IoTDB storage
- Decide whether to block the native interface writes to prevent recording too many audit logs to affect performance.
- Decide the content category of the audit log, supporting recording one or more
    1. data addition and deletion operations
    2. data and metadata query operations
    3. metadata class adding, modifying, and deleting operations.

### 2.1 configuration item

In iotdb-system.properties, change the following configurations:

```YAML
####################
### Audit log Configuration
####################

# whether to enable the audit log.
# Datatype: Boolean
# enable_audit_log=false

# Output location of audit logs
# Datatype: String
# IOTDB: the stored time series is: root.__system.audit._{user}
# LOGGER: log_audit.log in the log directory
# audit_log_storage=IOTDB,LOGGER

# whether enable audit log for DML operation of data
# whether enable audit log for DDL operation of schema
# whether enable audit log for QUERY operation of data and schema
# Datatype: String
# audit_log_operation=DML,DDL,QUERY

# whether the local write api records audit logs
# Datatype: Boolean
# This contains Session insert api: insertRecord(s), insertTablet(s),insertRecordsOfOneDevice
# MQTT insert api
# RestAPI insert api
# This parameter will cover the DML in audit_log_operation
# enable_audit_log_for_native_insert_api=true
```

