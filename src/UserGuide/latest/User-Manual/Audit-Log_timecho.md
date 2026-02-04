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

Audit logs provide a documented record of database activities. Through the audit log feature, you can track operations like data creation, deletion, modification, and querying to ensure information security. IoTDB's audit log functionality supports the following features:

* Ability to enable/disable audit logging through configuration
* Ability to set auditable operation types and privilege levels via parameters
* Ability to configure audit log file retention periods using TTL (time-based rolling) and SpaceTL (space-based rolling)
* Audit logs are encrypted by default

> Note: This feature is available from version V2.0.8-beta onwards.

## 2. Configuration Parameters

Edit the `iotdb-system.properties` file to enable audit logging using the following parameters:

| Parameter Name                          | Description                                                                                                                                                                                                                 | Data Type | Default Value              | Application Method |
|---------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|----------------------------|--------------------|
| `enable_audit_log`                    | Enable audit logging. true: enabled. false: disabled.                                                                                                                                                                      | Boolean   | false                      | Restart Required   |
| `auditable_operation_type`            | Operation type selection. DML: All DML operations; DDL: All DDL operations; QUERY: All queries; CONTROL: All control statements;                                                                                          | String    | DML,DDL,QUERY,CONTROL      | Restart Required   |
| `auditable_operation_level`           | Privilege level selection. global: Record all audit logs; object: Only record audit logs for data instances; Containment relationship: object < global.                                                                    | String    | global                     | Restart Required   |
| `auditable_operation_result`          | Audit result selection. success: Only record successful events; fail: Only record failed events;                                                                                                                           | String    | success, fail              | Restart Required   |
| `audit_log_ttl_in_days`               | Audit log TTL (Time To Live) in days. Logs older than this threshold will expire.                                                                                                                                         | Double    | -1.0 (never deleted)       | Restart Required   |
| `audit_log_space_tl_in_GB`            | Audit log SpaceTL in GB. When total audit log size exceeds this threshold, log rotation starts deleting oldest files.                                                                                                     | Double    | 1.0                        | Restart Required   |
| `audit_log_batch_interval_in_ms`      | Batch write interval for audit logs in milliseconds                                                                                                                                                                        | Long      | 1000                       | Restart Required   |
| `audit_log_batch_max_queue_bytes`     | Maximum queue size in bytes for batch processing audit logs. Subsequent writes will be blocked when queue exceeds this value.                                                                                           | Long      | 268435456                  | Restart Required   |

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