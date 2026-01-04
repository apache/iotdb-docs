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

# 黑白名单

## 1. 引言

IoTDB 是一款针对物联网场景设计的时间序列数据库，支持高效的数据存储、查询和分析。随着物联网技术的广泛应用，数据安全性和访问控制变得至关重要。在开放环境中，如何保证合法用户对数据的安全访问成为了一项关键挑战。白名单机制仅允许可信 IP 或用户接入，从源头缩小攻击面；黑名单功能则能在边缘与云端协同场景下实时拦截恶意 IP，阻断非法访问、SQL 注入、暴力破解及 DDoS 等威胁，为数据传输提供持续、稳定的安全保障。

> 注意：该功能从 V2.0.6 版本开始提供。

## 2. 白名单

### 2.1 功能描述

通过开启白名单功能、配置白名单列表，指定允许连接 IoTDB 的客户端地址，来限制仅在白名单范围内的客户端才能够访问 IoTDB，从而实现安全控制。

### 2.2 配置参数

管理员可以通过以下两种方式来启用/禁用白名单功能以及添加、修改、删除白名单ip/ip段。

* 编辑配置文件 `iotdb-system.properties`进行维护
* 通过 set configuration 语句进行维护
    * 树模型请参考：[set configuration](../Reference/Modify-Config-Manual.md)

相关参数如下：

| 名称                    | 描述                                                                              | 默认值 | 生效方式 | 示例                                                              |
| ------------------------- | ----------------------------------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------- |
| `enable_white_list` | 是否启用白名单功能。true：启用；false：禁用。字段值不区分大小写。                 | false  | 热加载   | `set enable_white_list = 'true' `                             |
| `white_ip_list`     | 添加、修改、删除白名单ip/ip段。支持精确匹配，支持\*通配符，多个ip之间以逗号分隔。 | 空     | 热加载   | `set white_ip_list='192.168.1.200,192.168.1.201,192.168.1.*`' |

## 3. 黑名单

### 3.1 功能描述

通过开启黑名单功能、配置黑名单列表，阻止某些特定 IP 地址访问数据库，来防止非法访问、SQL注入、暴力破解、DDoS攻击等安全威胁，从而确保数据传输过程中的安全性和稳定性。

### 3.2 配置参数

管理员可以通过以下两种方式来启用/禁用黑名单功能以及添加、修改、删除黑名单 ip/ip 段。

* 编辑配置文件 `iotdb-system.properties`进行维护
* 通过 set configuration 语句进行维护
    * 树模型请参考：[set configuration](../Reference/Modify-Config-Manual.md)
    
相关参数如下：

| 名称                    | 描述                                                                              | 默认值 | 生效方式 | 示例                                                              |
| ------------------------- | ----------------------------------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------- |
| `enable_black_list` | 是否启用黑名单功能。true：启用；false：禁用。字段值不区分大小写。                 | false  | 热加载   | `set enable_black_list = 'true' `                             |
| `black_ip_list`     | 添加、修改、删除黑名单ip/ip段。支持精确匹配，支持\*通配符，多个ip之间以逗号分隔。 | 空     | 热加载   | `set black_ip_list='192.168.1.200,192.168.1.201,192.168.1.*`' |

## 4. 注意事项

1. 开启白名单后，若列表为空将拒绝所有连接，若未包含本机 IP 则拒绝本机登录。
2. 当同一 IP 同时存在于黑白名单时，黑名单优先级更高。
3. 系统会校验 IP 格式，无效条目将在用户连接时报错并被跳过，不影响其他有效IP的加载。
4. 配置支持重复IP，内存中会自动去重且无提示。如需去重请手动修改。
5. 黑/白名单规则仅对新连接生效，功能开启前的现有连接不受影响，其后续重连才会被拦截。
