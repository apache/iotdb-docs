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

# Health Check Tool

## 1. Overview
The IoTDB Health Check Tool is designed to inspect the runtime environment of IoTDB nodes. It assists users in verifying the node's environment both before deployment and during operation, providing detailed inspection reports.


## 2. Prerequisites

Linux Systems

* `nc` (netcat) tool: Installed by default; user must have execution permissions.
* `lsof` or `netstat`: At least one must be installed; user must have execution permissions.

> To verify tool installation:
> 
>Check `nc`: `nc -h`
> 
>Check `lsof`: `lsof -v`

Windows Systems

* PowerShell: Enabled by default.

## 3. Inspection Items
* Check port occupancy on the node's server (Windows/Linux).
* Verify port connectivity between the current node and other cluster nodes (Windows/Linux).
* Check JDK installation (JAVA_HOME) (Windows/Linux).
* Inspect system memory allocation and IoTDB memory configuration (Windows/Linux).
* Validate directory access permissions (Windows/Linux).
* Ensure the system's maximum number of open files meets requirements (≥ 65535) (Linux only).
* Confirm swap is disabled (Windows/Linux).

## 4. Usage Instructions
### 4.1 Command Format
```bash
health_check.sh/health_check.bat -ips <Remote_IP+Ports> -o <all(default)/remote/local>
```
### 4.2 Parameter Descriptions

|**Parameter** |**Description**                                                                                               | ​**Required** |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `-ips`          | Remote server IPs and ports. Supports multiple servers. Format: `ip port1 port2, ip2 port2-1 port2-2`           | Optional             |
| `-o`            | Scope of check: `local` (local machine), `remote` (remote server ports), `all` (both). Default: `all` | Optional             |


## 5. Usage Examples
### 5.1 Example 1: Check All
```bash
   health_check.sh/health_check.bat -ips 172.20.31.19 6667 18080,10.0.6.230 10311
```   

Output:

```bash
Check: Installation Environment(JDK)
Requirement: JDK Version >=1.8
Result: JDK Version 11.0.21

Check: Installation Environment(Memory)
Requirement: Allocate sufficient memory for IoTDB
Result: Total Memory 7.8Gi, 2.33 G allocated to IoTDB ConfigNode, 3.88 G allocated to IoTDB DataNode

Check: Installation Environment(Directory Access)
Requirement: IoTDB needs write permissions for data/datanode/data, data/datanode/consensus, data/datanode/system, data/datanode/wal, data/confignode/system, data/confignode/consensus, ext/pipe, ext/udf, ext/trigger.
Result:
data/datanode/data has write permission
data/datanode/consensus has write permission
data/datanode/system has write permission
data/datanode/wal has write permission
data/confignode/system has write permission
data/confignode/consensus has write permission
ext/pipe has write permission
ext/udf has write permission
ext/trigger has write permission

Check: Network(Local Port)
Requirement: Ports 16668, 10730, 11742, 10750, 10760, 10710, 10720 must be unoccupied
Result:
Ports 16668, 10730, 11742, 10750, 10760, 10710, 10720 are free

Check: Network(Remote Port Connectivity)
Requirement: 172.20.31.19:6667, 18080 and 10.0.6.230:10311 must be accessible
Result:
Inaccessible server ports:
IP: 10.0.6.230, Ports: 10311

Check: System Settings(Maximum Open Files Number)
Requirement: >= 65535
Result: 65535

Check: System Settings(Swap)
Requirement: Disabled
Result: Disabled.
```

### 5.2 Example 2: Local Check

```bash
health_check.sh/health_check.bat -o local
```

Output:

```bash
Check: Installation Environment(JDK)
Requirement: JDK Version >=1.8
Result: JDK Version 11.0.21

Check: Installation Environment(Memory)
Requirement: Allocate sufficient memory for IoTDB
Result: Total Memory 7.8Gi, 2.33 G allocated to IoTDB ConfigNode, 3.88 G allocated to IoTDB DataNode

Check: Installation Environment(Directory Access)
Requirement: IoTDB needs data/datanode/data,data/datanode/consensus,data/datanode/system,data/datanode/wal,data/confignode/system,data/confignode/consensus,ext/pipe,ext/udf,ext/trigger write permission.
Result: 
data/datanode/data has write permission
data/datanode/consensus has write permission
data/datanode/system has write permission
data/datanode/wal has write permission
data/confignode/system has write permission
data/confignode/consensus has write permission
ext/pipe has write permission
ext/udf has write permission
ext/trigger has write permission

Check: Network(Local Port)
Requirement: Port 16668 10730 11742 10750 10760 10710 10720 is not occupied
Result: 
Port 16668  10730  11742  10750  10760  10710  10720  is free

Check: System Settings(Maximum Open Files Number)
Requirement: >= 65535
Result: 65535

Check: System Settings(Swap)
Requirement: disabled
Result: disabled.
```

### 5.3 Example 3: Remote Check
```bash
health_check.sh/health_check.bat -o remote -ips 172.20.31.19 6667 18080,10.0.6.230 10311
```

Output:

```bash
Check: Network(Remote Port Connectivity)
Requirement: 172.20.31.19:6667, 18080 and 10.0.6.230:10311 must be accessible
Result:
Inaccessible server ports:
IP: 10.0.6.230, Ports: 10311
```

## 6. FAQs
### 6.1 How to Adjust Memory Allocation

* Modify MEMORY\_SIZE in `confignode-env.sh`.
* Modify MEMORY\_SIZE in `datanode-env.sh`.

### 6.2 How to Modify Max Open Files Limit

* To avoid "too many open files" errors:

```bash
# Check current limit
ulimit -n
# Temporarily set
ulimit -n 65535
# Permanently set
echo "* soft nofile 65535" >> /etc/security/limits.conf
echo "* hard nofile 65535" >> /etc/security/limits.conf
# Verify after re-login
ulimit -n  # Should return 65535
```

### 6.3 How to Disable Swap and Why
* Why Disable:
IoTDB performance degrades when using swap.

* Steps:

```bash
# Disable swap
echo "vm.swappiness = 0" >> /etc/sysctl.conf
# Clear swap data and reload
swapoff -a && swapon -a
# Apply settings without reboot
sysctl -p
# Verify swap is 0
free -m
```