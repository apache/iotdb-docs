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


# Security Audit

## 1. Introduction

Audit logs serve as the record credentials of a database, enabling tracking of various operations (e.g., create, read, update, delete) to ensure information security. The audit log feature in IoTDB supports the following capabilities:

* Supports enabling/disabling the audit log functionality through configuration
* Supports configuring operation types and privilege levels to be recorded via parameters
* Supports setting the storage duration of audit log files, including time-based rolling (via TTL) and space-based rolling (via SpaceTL)
* Supports configuring parameters to count slow requests (with write/query latency exceeding a threshold, default 3000 milliseconds) within any specified time period
* Audit log files are stored in encrypted format by default

> Note: This feature is available from version V2.0.8-beta onwards.

## 2. Configuration Parameters

Edit the `iotdb-system.properties` file to enable audit logging using the following parameters:

| Parameter Name                              | Description                                                                                                 | Data Type | Default Value                 | Activation Method |
|-------------------------------------------|------------------------------------------------------------------------------------------------------------|-----------|-------------------------------|-------------------|
| `enable_audit_log`                        | Whether to enable audit logging. true: enabled. false: disabled.                                          | Boolean   | false                         | Hot Reload        |
| `auditable_operation_type`                | Operation type selection. DML: all DML operations are logged; DDL: all DDL operations are logged; QUERY: all query operations are logged; CONTROL: all control statements are logged. | String    | DML,DDL,QUERY,CONTROL         | Hot Reload        |
| `auditable_dml_event_type`                | Event types for auditing DML operations. `OBJECT_AUTHENTICATION`: object authentication, `SLOW_OPERATION`: slow operation | String    | `OBJECT_AUTHENTICATION`,`SLOW_OPERATION` | Hot Reload        |
| `auditable_ddl_event_type`                | Event types for auditing DDL operations. `OBJECT_AUTHENTICATION`: object authentication, `SLOW_OPERATION`: slow operation | String    | `OBJECT_AUTHENTICATION`,`SLOW_OPERATION` | Hot Reload        |
| `auditable_query_event_type`              | Event types for auditing query operations. `OBJECT_AUTHENTICATION`: object authentication, `SLOW_OPERATION`: slow operation | String    | `OBJECT_AUTHENTICATION`,`SLOW_OPERATION` | Hot Reload        |
| `auditable_control_event_type`            | Event types for auditing control operations. `CHANGE_AUDIT_OPTION`: audit option change, `OBJECT_AUTHENTICATION`: object authentication, `LOGIN`: login, `LOGOUT`: logout, `DN_SHUTDOWN`: data node shutdown, `SLOW_OPERATION`: slow operation | String    | `CHANGE_AUDIT_OPTION`,`OBJECT_AUTHENTICATION`,`LOGIN`,`LOGOUT`,`DN_SHUTDOWN`,`SLOW_OPERATION` | Hot Reload        |
| `auditable_operation_level`               | Permission level selection. global: log all audit events; object: only log events related to data instances. Containment relationship: object < global. For example: when set to global, all audit logs are recorded normally; when set to object, only operations on specific data instances are recorded. | String    | global                        | Hot Reload        |
| `auditable_operation_result`              | Audit result selection. success: log only successful events; fail: log only failed events                  | String    | success,fail                  | Hot Reload        |
| `audit_log_ttl_in_days`                   | Audit log TTL (Time To Live). Logs older than this threshold will expire.                                   | Double    | -1.0 (never deleted)          | Hot Reload        |
| `audit_log_space_tl_in_GB`                | Audit log SpaceTL. Logs will start rotating when total space reaches this threshold.                       | Double    | 1.0                             | Hot Reload        |
| `audit_log_batch_interval_in_ms`          | Batch write interval for audit logs                                                                          | Long      | 1000                            | Hot Reload        |
| `audit_log_batch_max_queue_bytes`         | Maximum byte size of the queue for batch processing audit logs. Subsequent write operations will be blocked when this threshold is exceeded. | Long      | 268435456                       | Hot Reload        |

## 3. Access Methods

Supports direct reading of audit logs via SQL.

### 3.1 SQL Syntax

```SQL
SELECT (<audit_log_field>, )* log FROM <AUDIT_LOG_PATH> WHERE whereclause ORDER BY order_expression
```

* `AUDIT_LOG_PATH`: Audit log storage location `root.__audit.log.<node_id>.<user_id>`
* `audit_log_field`: Query fields refer to the metadata structure below
* Supports WHERE clause filtering and ORDER BY sorting

### 3.2 Metadata Structure

| Field                  | Description                                      | Data Type      |
|------------------------|--------------------------------------------------|----------------|
| `time`             | The date and time when the event started       | timestamp      |
| `username`         | User name                                        | string         |
| `cli_hostname`     | Client hostname identifier                       | string         |
| `audit_event_type` | Audit event type, e.g., WRITE_DATA, GENERATE_KEY| string         |
| `operation_type`   | Operation type, e.g., DML, DDL, QUERY, CONTROL | string         |
| `privilege_type`   | Privilege used, e.g., WRITE_DATA, MANAGE_USER  | string         |
| `privilege_level`  | Event privilege level, global or object        | string         |
| `result`           | Event result, success=1, fail=0                | boolean        |
| `database`         | Database name                                    | string         |
| `sql_string`       | User's original SQL statement                  | string         |
| `log`              | Detailed event description                     | string         |

### 3.3 Usage Examples

* Query times, usernames and host information for successfully executed queries:

```SQL
IoTDB> select username,cli_hostname from root.__audit.log.** where operation_type='QUERY' and result=true align by device
+-----------------------------+---------------------------+--------+------------+
|                         Time|                     Device|username|cli_hostname|
+-----------------------------+---------------------------+--------+------------+
|2026-01-23T10:39:21.563+08:00|root.__audit.log.node_1.u_0|    root|   127.0.0.1|
|2026-01-23T10:39:33.746+08:00|root.__audit.log.node_1.u_0|    root|   127.0.0.1|
|2026-01-23T10:42:15.032+08:00|root.__audit.log.node_1.u_0|    root|   127.0.0.1|
+-----------------------------+---------------------------+--------+------------+
Total line number = 3
It costs 0.036s
```

* Query latest operation details:

```SQL
IoTDB> select username,cli_hostname,operation_type,sql_string  from root.__audit.log.** order by time desc limit 1 align by device
+-----------------------------+---------------------------+--------+------------+--------------+------------------------------------------------------------------------------------------------------------------+
|                         Time|                     Device|username|cli_hostname|operation_type|                                                                                                        sql_string|
+-----------------------------+---------------------------+--------+------------+--------------+------------------------------------------------------------------------------------------------------------------+
|2026-01-23T10:42:32.795+08:00|root.__audit.log.node_1.u_0|    root|   127.0.0.1|         QUERY|select username,cli_hostname from root.__audit.log.** where operation_type='QUERY' and result=true align by device|
+-----------------------------+---------------------------+--------+------------+--------------+------------------------------------------------------------------------------------------------------------------+
Total line number = 1
It costs 0.033s
```

* Query failed operations:

```SQL
IoTDB> select database,operation_type,log  from root.__audit.log.** where result=false align by device
+-----------------------------+-------------------------------+-----------+--------------+---------------------------------------------------------------------------------+
|                         Time|                         Device|   database|operation_type|                                                                              log|
+-----------------------------+-------------------------------+-----------+--------------+---------------------------------------------------------------------------------+
|2026-01-23T10:49:55.159+08:00|root.__audit.log.node_1.u_10000|           |       CONTROL|        User user1 (ID=10000) login failed with code: 801, Authentication failed.|
|2026-01-23T10:52:04.579+08:00|root.__audit.log.node_1.u_10000|  [root.**]|         QUERY|   User user1 (ID=10000) requests authority on object [root.**] with result false|
|2026-01-23T10:52:43.412+08:00|root.__audit.log.node_1.u_10000|root.userdb|           DDL| User user1 (ID=10000) requests authority on object root.userdb with result false|
|2026-01-23T10:52:48.075+08:00|root.__audit.log.node_1.u_10000|       null|         QUERY|User user1 (ID=10000) requests authority on object root.__audit with result false|
+-----------------------------+-------------------------------+-----------+--------------+---------------------------------------------------------------------------------+
Total line number = 4
It costs 0.024s
```

* Query audit records for user 'u_0' on node 'node_1' with event types 'SLOW_OPERATION' and 'LOGIN'

```SQL
IoTDB> select * from root.__audit.log.node_1.u_0 where audit_event_type='SLOW_OPERATION' or audit_event_type='LOGIN' limit 1 align by device 
+-----------------------------+---------------------------+------+---------------+--------------+--------+--------------+-----------------------------------------------------------------------------------------------+----------+----------------+------------+--------+
|                         Time|                     Device|result|privilege_level|privilege_type|database|operation_type|                                                                                            log|sql_string|audit_event_type|cli_hostname|username|
+-----------------------------+---------------------------+------+---------------+--------------+--------+--------------+-----------------------------------------------------------------------------------------------+----------+----------------+------------+--------+
|2026-01-23T11:42:23.636+08:00|root.__audit.log.node_1.u_0|  true|         GLOBAL|          null|        |       CONTROL|IoTDB: Login status: Login successfully. User root (ID=0), opens Session-1-root:127.0.0.1:51308|          |           LOGIN|   127.0.0.1|    root|
+-----------------------------+---------------------------+------+---------------+--------------+--------+--------------+-----------------------------------------------------------------------------------------------+----------+----------------+------------+--------+
Total line number = 1
It costs 0.021s
```