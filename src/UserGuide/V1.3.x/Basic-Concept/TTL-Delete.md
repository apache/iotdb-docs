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
# TTL Delete Data

## Overview

IoTDB supports setting data retention time (TTL) at the device level, allowing the system to automatically and periodically delete old data to effectively control disk space and maintain high query performance and low memory usage. TTL is set in milliseconds by default. Once data expires, it cannot be queried or written, but physical deletion is delayed until compaction. Please note that changes to TTL may temporarily affect data queryability, and if TTL is reduced or removed, previously invisible data due to TTL may reappear.

Important notes:
- TTL is set in milliseconds and is not affected by the time precision in the configuration file.
- Changes to TTL may affect data queryability.
- The system will eventually remove expired data, but there may be a delay.
- TTL determines data expiration based on the data point timestamp, not the ingestion time.
- The system supports setting up to 1000 TTL rules. When the limit is reached, existing rules must be removed before new ones can be added.

## Set TTL
### TTL Path Rule
The path can only be prefix paths (i.e., the path cannot contain \* , except \*\* in the last level).
This path will match devices and also allows users to specify paths without asterisks as specific databases or devices.
When the path does not contain asterisks, the system will check if it matches a database; if it matches a database, both the path and path.\*\* will be set at the same time. Note: Device TTL settings do not verify the existence of metadata, i.e., it is allowed to set TTL for a non-existent device.
```
qualified paths：
root.**
root.db.**
root.db.group1.**
root.db
root.db.group1.d1

unqualified paths：
root.*.db
root.**.db.*
root.db.*
```
### TTL Applicable Rules
When a device is subject to multiple TTL rules, the more precise and longer rules are prioritized. For example, for the device "root.bj.hd.dist001.turbine001", the rule "root.bj.hd.dist001.turbine001" takes precedence over "root.bj.hd.dist001.\*\*", and the rule "root.bj.hd.dist001.\*\*" takes precedence over "root.bj.hd.**".
### Set TTL
The set ttl operation can be understood as setting a TTL rule, for example, setting ttl to root.sg.group1.** is equivalent to mounting ttl for all devices that can match this path pattern.
The unset ttl operation indicates unmounting TTL for the corresponding path pattern; if there is no corresponding TTL, nothing will be done.
If you want to set TTL to be infinitely large, you can use the INF keyword.
The SQL Statement for setting TTL is as follow:
```
set ttl to pathPattern 360000;
```
Set the Time to Live (TTL) to a pathPattern of 360,000 milliseconds; the pathPattern should not contain a wildcard (\*) in the middle and must end with a double asterisk (\*\*). The pathPattern is used to match corresponding devices.
To maintain compatibility with older SQL syntax, if the user-provided pathPattern matches a database (db), the path pattern is automatically expanded to include all sub-paths denoted by path.\*\*.
For instance, writing "set ttl to root.sg 360000" will automatically be transformed into "set ttl to root.sg.\*\* 360000", which sets the TTL for all devices under root.sg. However, if the specified pathPattern does not match a database, the aforementioned logic will not apply. For example, writing "set ttl to root.sg.group 360000" will not be expanded to "root.sg.group.\*\*" since root.sg.group does not match a database.
It is also permissible to specify a particular device without a wildcard (*).
## Unset TTL

To unset TTL, we can use follwing SQL statement:

```
IoTDB> unset ttl from root.ln
```

After unset TTL, all data will be accepted in `root.ln`.
```
IoTDB> unset ttl from root.sgcc.**
```

Unset the TTL in the `root.sgcc` path.

New syntax
```
IoTDB> unset ttl from root.**
```

Old syntax
```
IoTDB> unset ttl to root.**
```
There is no functional difference between the old and new syntax, and they are compatible with each other.
The new syntax is just more conventional in terms of wording.

Unset the TTL setting for all path pattern.

## Show TTL

To Show TTL, we can use following SQL statement:

show all ttl

```
IoTDB> SHOW ALL TTL
+--------------+--------+
|          path|     TTL|
|       root.**|55555555|
| root.sg2.a.**|44440000|
+--------------+--------+
```

show ttl on pathPattern
```
IoTDB> SHOW TTL ON root.db.**;
+--------------+--------+
|          path|     TTL|
|    root.db.**|55555555|
|  root.db.a.**|44440000|
+--------------+--------+
```

The SHOW ALL TTL example gives the TTL for all path patterns.
The SHOW TTL ON pathPattern shows the TTL for the path pattern specified.

Display devices' ttl
```
IoTDB> show devices
+---------------+---------+---------+
|         Device|IsAligned|      TTL|
+---------------+---------+---------+
|root.sg.device1|    false| 36000000|
|root.sg.device2|     true|      INF|
+---------------+---------+---------+
```
All devices will definitely have a TTL, meaning it cannot be null. INF represents infinity.