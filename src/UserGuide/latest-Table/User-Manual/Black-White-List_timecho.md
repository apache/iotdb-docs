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

# Black White List

## 1. Introduction

IoTDB is a time-series database designed for IoT scenarios, supporting efficient data storage, query, and analysis. With the widespread application of IoT technology, data security and access control have become critical. In open environments, ensuring secure data access for legitimate users presents a key challenge. The whitelist mechanism allows only trusted IPs or users to connect, reducing the attack surface at the source. The blacklist function can block malicious IPs in real time in edge-cloud collaborative scenarios, preventing unauthorized access, SQL injection, brute‑force attacks, DDoS, and other threats, thereby providing continuous and stable security for data transmission.

> Note: This feature is available starting from version 2.0.6.

## 2. Whitelist

### 2.1 Function Description

By enabling the whitelist function and configuring the whitelist, client addresses allowed to connect to IoTDB are specified. Only clients within the whitelist can access IoTDB, achieving security control.

### 2.2 Configuration Parameters

Administrators can enable/disable the whitelist function and add, modify, or delete whitelist IPs/IP segments in the following two ways:

* Edit the configuration file `iotdb‑system.properties`.
* Use the `set configuration` statement.
    * Table model reference: [set configuration](../SQL-Manual/SQL-Maintenance-Statements.md#_2-2-update-configuration-items)

Related parameters are as follows:

| Name            | Description                                                                                                                       | Default Value | Effective Mode | Example                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------- | ---------------- | ------------------------------------------------------------------- |
| `enable_white_list` | Whether to enable the whitelist function. true: enable; false: disable. The value is case‑insensitive.                           | false         | Hot reload     | `set enable_white_list = 'true'`                              |
| `white_ip_list`   | Add, modify, or delete whitelist IPs/IP segments. Supports exact match and the \* wildcard. Multiple IPs are separated by commas. | empty         | Hot reload     | `set white_ip_list='192.168.1.200,192.168.1.201,192.168.1.*'` |

## 3. Blacklist

### 3.1 Function Description

By enabling the blacklist function and configuring the blacklist, certain specific IP addresses are prevented from accessing the database, guarding against unauthorized access, SQL injection, brute‑force attacks, DDoS attacks, and other security threats, thereby ensuring the security and stability of data transmission.

### 3.2 Configuration Parameters

Administrators can enable/disable the blacklist function and add, modify, or delete blacklist IPs/IP segments in the following two ways:

* Edit the configuration file `iotdb‑system.properties`.
* Use the `set configuration`statement.
    * Table model reference:[set configuration](../SQL-Manual/SQL-Maintenance-Statements.md#_2-2-update-configuration-items)

Related parameters are as follows:

| Name                | Description                                                                                                                       | Default Value | Effective Mode | Example                                                           |
|---------------------| ----------------------------------------------------------------------------------------------------------------------------------- | --------------- | ---------------- | ------------------------------------------------------------------- |
| `enable_black_list` | Whether to enable the blacklist function. true: enable; false: disable. The value is case‑insensitive.                           | false         | Hot reload     | `set enable_black_list = 'true'`                              |
| `black_ip_list`     | Add, modify, or delete blacklist IPs/IP segments. Supports exact match and the \* wildcard. Multiple IPs are separated by commas. | empty         | Hot reload     | `set black_ip_list='192.168.1.200,192.168.1.201,192.168.1.*'` |

## 4. Notes

1. After the whitelist is enabled, if the list is empty, all connections are denied. If the local IP is not included, local login is denied.
2. When the same IP appears in both the whitelist and blacklist, the blacklist takes precedence.
3. The system validates the IP format. Invalid entries will cause an error when the user connects and be skipped, without affecting the loading of other valid IPs.
4. Duplicate IPs in the configuration are supported; they are automatically deduplicated in memory without notification. For manual deduplication, edit the configuration accordingly.
5. Blacklist/whitelist rules only apply to new connections. Existing connections before enabling the function are not affected; they will be intercepted only upon subsequent reconnection.
