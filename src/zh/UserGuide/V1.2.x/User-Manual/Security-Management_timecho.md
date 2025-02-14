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

# 安全控制

## 白名单

**功能描述**

允许哪些客户端地址能连接 IoTDB

**配置文件**

conf/iotdb-common.properties

conf/white.list

**配置项**

iotdb-common.properties:

决定是否开启白名单功能

```YAML
# 是否开启白名单功能
enable_white_list=true
```

white.list:

决定哪些IP地址能够连接IoTDB

```YAML
# 支持注释
# 支持精确匹配，每行一个ip
10.2.3.4

# 支持*通配符，每行一个ip
10.*.1.3
10.100.0.*
```

**注意事项**

1. 如果通过session客户端取消本身的白名单，当前连接并不会立即断开。在下次创建连接的时候拒绝。
2. 如果直接修改white.list，一分钟内生效。如果通过session客户端修改，立即生效，更新内存中的值和white.list磁盘文件
3. 开启白名单功能，没有white.list 文件，启动DB服务成功，但是，拒绝所有连接。
4. DB服务运行中，删除 white.list 文件，至多一分钟后，拒绝所有连接。
5. 是否开启白名单功能的配置，可以热加载。
6. 使用Java 原生接口修改白名单，必须是root用户才能修改，拒绝非root用户修改；修改内容必须合法，否则会抛出StatementExecutionException异常。

![白名单](/img/%E7%99%BD%E5%90%8D%E5%8D%95.png)

## 审计日志

### 功能背景

   审计日志是数据库的记录凭证，通过审计日志功能可以查询到用户在数据库中增删改查等各项操作，以保证信息安全。关于IoTDB的审计日志功能可以实现以下场景的需求：

- 可以按链接来源（是否人为操作）决定是否记录审计日志，如：非人为操作如硬件采集器写入的数据不需要记录审计日志，人为操作如普通用户通过cli、workbench等工具操作的数据需要记录审计日志。
- 过滤掉系统级别的写入操作，如IoTDB监控体系本身记录的写入操作等。



#### 场景说明



##### 对所有用户的所有操作（增、删、改、查）进行记录

通过审计日志功能追踪到所有用户在数据中的各项操作。其中所记录的信息要包含数据操作（新增、删除、查询）及元数据操作（新增、修改、删除、查询）、客户端登录信息（用户名、ip地址）。



客户端的来源

- Cli、workbench、Zeppelin、Grafana、通过 Session/JDBC/MQTT 等协议传入的请求

![审计日志](/img/%E5%AE%A1%E8%AE%A1%E6%97%A5%E5%BF%97.png)



##### 可关闭部分用户连接的审计日志



如非人为操作，硬件采集器通过 Session/JDBC/MQTT 写入的数据不需要记录审计日志



### 功能定义



通过配置可以实现：

- 决定是否开启审计功能
- 决定审计日志的输出位置，支持输出至一项或多项
    1. 日志文件
    2. IoTDB存储
- 决定是否屏蔽原生接口的写入，防止记录审计日志过多影响性能
- 决定审计日志内容类别，支持记录一项或多项
    1. 数据的新增、删除操作
    2. 数据和元数据的查询操作
    3. 元数据类的新增、修改、删除操作

#### 配置项

 在iotdb-engine.properties 或 iotdb-common.properties中修改以下几项配置

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

