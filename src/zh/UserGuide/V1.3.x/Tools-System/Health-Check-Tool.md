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

# 健康检查工具

## 1. 概述

IoTDB 健康检查工具是一个用于检测 IoTDB 节点运行环境的工具。它可以帮助用户在安装部署数据库前或运行期间检查节点的运行环境，并获取详细的检查结果。

> IoTDB版本要求：不能低于v1.3.2

## 2. 前置要求

Linux 系统

* `nc`（netcat）工具：默认已安装，用户需要有权限执行。
* `lsof` 或 `netstat`：至少安装其中一个，用户需要有权限执行。

> 检查相应工具是否已安装：
>
> 检查 `nc` 是否安装：`nc -h`
>
> 检查 `lsof` 是否安装：`lsof -v`

Windows 系统

* PowerShell：默认已启动。

## 3. 检查项

* 检查节点所在服务器的端口占用情况（windows/linux）
* 检查当前节点与集群中其他节点的端口连通性（windows/linux）
* 检查系统中是否安装了 JDK（java\_home）（windows/linux）
* 检查系统内存分配情况，检查 IoTDB 内存分配情况（windows/linux）
* 检查目录访问权限（windows/linux）
* 检查系统最大打开文件数是否满足要求（>= 65535）（仅 linux）
* 检查系统是否禁用了 swap（windows/linux）

## 4. 使用方法

### 4.1 命令格式

```Bash
health_check.sh/health_check.bat -ips<远程服务器IP+端口> , -o <all(default)/remote/local>
```

### 4.2 参数说明

| **参数** | **说明**                                                                                                                                    | **是否必填** |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `-ips`     | 远程服务器 IP 和端口，支持检查多个服务器，格式如下：`ip port1 port2，ip2 port2-1 port2-2`                                                     | 非必填             |
| `-o`       | 检查参数，可选值为`local`（本机检查）、`remote`（远程服务器端口连接性检查）、`all`（本机和远程服务器端口一起检查），默认值为`all` | 非必填             |

## 5. 使用方法

### 5.1 示例 1：检查全部

```Bash
health_check.sh/health_check.bat -ips 172.20.31.19 6667 18080,10.0.6.230 10311
```

输出结果：

```Bash
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

Check: Network(Remote Port Connectivity)
Requirement: 172.20.31.19:6667 18080 ,10.0.6.230:10311  need to be accessible
Result: 
The following server ports are inaccessible:
IP: 10.0.6.230, Ports: 10311 

Check: System Settings(Maximum Open Files Number)
Requirement: >= 65535
Result: 65535

Check: System Settings(Swap)
Requirement: disabled
Result: disabled.
```

### 5.2 示例 2：检查本机

```Bash
health_check.sh/health_check.bat -o local
```

输出结果：

```Bash
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

### 5.3 示例 3：检查远程

```Bash
health_check.sh/health_check.bat -o remote -ips 172.20.31.19 6667 18080,10.0.6.230 10311
```

输出结果：

```Bash
Check: Network(Remote Port Connectivity)
Requirement: 172.20.31.19:6667 18080 ,10.0.6.230:10311  need to be accessible
Result: 
The following server ports are inaccessible:
IP: 10.0.6.230, Ports: 10311
```

## 6. 常见问题

### 6.1 如何调整内存分配

* 修改`confignode-env.sh`中的MEMORY\_SIZE
* 修改`datanode-env.sh`中的MEMORY\_SIZE

### 6.2 如何修改最大打开数文件

* 设置系统最大打开文件数为 65535，以避免出现 "太多的打开文件 "的错误。

```Bash
#查看当前限制
ulimit -n
# 临时修改
ulimit -n 65535
# 永久修改
echo "* soft nofile 65535" >>  /etc/security/limits.conf
echo "* hard nofile 65535" >>  /etc/security/limits.conf
#退出当前终端会话后查看，预期显示65535
ulimit -n
```

### 6.3 如何禁用 Swap 及禁用原因

* 禁用原因：IoTDB 使用 Swap 会导致性能下降，建议禁用。
* 禁用方式：

```Bash
echo "vm.swappiness = 0">> /etc/sysctl.conf
# 一起执行 swapoff -a 和 swapon -a 命令是为了将 swap 里的数据转储回内存，并清空 swap 里的数据。
# 不可省略 swappiness 设置而只执行 swapoff -a；否则，重启后 swap 会再次自动打开，使得操作失效。
swapoff -a && swapon -a
# 在不重启的情况下使配置生效。
sysctl -p
# 检查内存分配，预期 swap 为 0
free -m
```
