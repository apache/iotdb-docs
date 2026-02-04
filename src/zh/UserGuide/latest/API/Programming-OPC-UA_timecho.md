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

# OPC UA 协议

## 1. 功能概述

本文档介绍了 IoTDB 与 OPC UA 协议集成的两种独立工作模式，请根据您的业务场景进行选择：

* **模式一：数据订阅服务 (IoTDB 作为 OPC UA 服务器)**：IoTDB 启动内置的 OPC UA 服务器，被动地允许外部客户端（如 UAExpert）连接并订阅其内部数据。这是传统用法。
* **模式二：数据主动推送 (IoTDB 作为 OPC UA 客户端)**：IoTDB 作为客户端，主动将数据和元数据同步到一个或多个独立部署的外部 OPC UA 服务器。
  > 注意：该模式从 V2.0.8-beta 起支持。

**注意：模式互斥**

当 Pipe 配置中指定了 `node-urls` 参数（模式二），IoTDB 将不会启动内置的 OPC UA 服务器（模式一）。两种模式在同一 Pipe 中**不可同时使用**。

## 2. 数据订阅

本模式支持用户以 OPC UA 协议从 IoTDB 中订阅数据，订阅数据的通信模式支持 Client/Server 和 Pub/Sub 两种。

注意：本功能并非从外部 OPC Server 中采集数据写入 IoTDB

![](/img/opc-ua-new-1.png)

### 2.1 OPC 服务启动方式
#### 2.1.1 语法

启动 OPC UA 协议的语法：

```SQL
create pipe p1 
    with source (...) 
    with processor (...) 
    with sink ('sink' = 'opc-ua-sink', 
               'sink.opcua.tcp.port' = '12686', 
               'sink.opcua.https.port' = '8443', 
               'sink.user' = 'root', 
               'sink.password' = 'TimechoDB@2021',  //V2.0.6.x 之前默认密码为root
               'sink.opcua.security.dir' = '...'
              )
```

#### 2.1.2 参数

| **参数**                     | **描述**                                                                                                                                                                                                                                                                                                                                                            | **取值范围**                                                                                                                                 | **是否必填** | **默认值**                                                                                                                                                                          |
| ------------------------------------ |-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------| -------------------- |----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| sink                               | OPC UA SINK                                                                                                                                                                                                                                                                                                                                                       | String: opc-ua-sink                                                                                                                      | 必填               |                                                                                                                                                                                  |
| sink.opcua.model                   | OPC UA 使用的模式                                                                                                                                                                                                                                                                                                                                                      | String: client-server / pub-sub                                                                                                          | 选填               | client-server                                                                                                                                                                    |
| sink.opcua.tcp.port                | OPC UA 的 TCP 端口                                                                                                                                                                                                                                                                                                                                                   | Integer: [0, 65536]                                                                                                                      | 选填               | 12686                                                                                                                                                                            |
| sink.opcua.https.port              | OPC UA 的 HTTPS 端口                                                                                                                                                                                                                                                                                                                                                 | Integer: [0, 65536]                                                                                                                      | 选填               | 8443                                                                                                                                                                             |
| sink.opcua.security.dir            | OPC UA 的密钥及证书目录                                                                                                                                                                                                                                                                                                                                                   | String: Path，支持绝对及相对目录                                                                                                                   | 选填               | 1. iotdb 相关 DataNode 的 conf 目录下的 `opc_security` 文件夹 `/<httpsPort:tcpPort>`。2. 如无 iotdb 的 conf 目录（例如 IDEA 中启动 DataNode），则为用户主目录下的 `iotdb_opc_security` 文件夹 `/<httpsPort:tcpPort>` |
| opcua.security-policy              | OPC UA 连接使用的安全策略，不区分大小写。可以配置多个，用`,`连接。配置一个安全策略后，client 才能用对应的策略连接。当前实现默认支持`None`和`Basic256Sha256`策略，应该默认改为任意的非`None`策略，`None`策略在调试环境中单独配置，因为`None`策略虽然不需移动证书，操作方便，但是不安全，生产环境的 server 不建议支持该策略。注意：V2.0.8-beta 起支持该参数，且仅支持 client-server 模式                                                                                                                         | String（安全性依次递增）:<br>`None`<br>`Basic128Rsa15`<br>`Basic256`<br>`Basic256Sha256`<br>`Aes128_Sha256_RsaOaep`<br>`Aes256_Sha256_RsaPss` | 选填| `Basic256Sha256`,`Aes128_Sha256_RsaOaep`,`lAes256_Sha256_RsaPss`                                                                                                                 |
| sink.opcua.enable-anonymous-access | OPC UA 是否允许匿名访问                                                                                                                                                                                                                                                                                                                                                   | Boolean                                                                                                                                  | 选填               | true                                                                                                                                                                             |
| sink.user                          | 用户，这里指 OPC UA 的允许用户                                                                                                                                                                                                                                                                                                                                               | String                                                                                                                                   | 选填               | root                                                                                                                                                                             |
| sink.password                      | 密码，这里指 OPC UA 的允许密码                                                                                                                                                                                                                                                                                                                                               | String                                                                                                                                   | 选填               | TimechoDB@2021（V2.0.6.x 之前默认密码为root）                                                                                                                                             |
| opcua.with-quality                 | OPC UA 的测点发布是否为 value + quality 模式。启用配置后，系统将按以下规则处理写入数据：<br>1. 同时包含 value 和 quality，则直接推送至 OPC UA Server。<br>2. 仅包含 value，则 quality 自动填充为 UNCERTAIN（默认值，支持自定义配置）。<br>3. 仅包含 quality，则该写入被忽略，不进行任何处理。<br>4. 包含非 value/quality 字段，则忽略该数据，并记录警告日志（日志频率可配置，避免高频干扰）。<br>5. quality 类型限制：目前仅支持布尔类型（true 表示 GOOD，false 表示 BAD）；   注意：V2.0.8-beta 起支持该参数，且仅支持 client-server 模式 | Boolean                                                                                                                                  | 选填               | false                                                                                                                                                                            |
| opcua.value-name                   | With-quality 为 true 时生效，表示 value 测点的名字。   注意：V2.0.8-beta 起支持该参数，且仅支持 client-server 模式                                                                                                                                                                                                                                                                                  | String                                                                                                                                   | 选填               | value                                                                                                                                                                            |
| opcua.quality-name                 | With-quality 为 true 时生效，表示 quality 测点的名字。   注意：V2.0.8-beta 起支持该参数，且仅支持 client-server 模式                                                                                                                                                                                                                                                                                | String                                                                                                                                   | 选填               | quality                                                                                                                                                                          |
| opcua.default-quality              | 没有 quality 时，可以通过 SQL 参数指定`GOOD`/`UNCERTAIN`/`BAD`。   注意：V2.0.8-beta 起支持该参数，且仅支持 client-server 模式                                                                                                                                                                                                                                                                      | String:`GOOD`/`UNCERTAIN`/`BAD`                                                                                                          | 选填               | `UNCERTAIN`                                                                                                                                                                      |
| opcua.timeout-seconds              | Client 连接 server 的超时秒数，仅在 IoTDB 为 client 时生效   注意：V2.0.8-beta 起支持该参数，且仅支持 client-server 模式                                                                                                                                                                                                                                                                             | Long                                                                                                                                     | 选填               | 10L                                                                                                                                                                              |

#### 2.1.3 示例

```Bash
create pipe p1 
    with sink ('sink' = 'opc-ua-sink'，
               'sink.user' = 'root', 
               'sink.password' = 'TimechoDB@2021');//V2.0.6.x 之前默认密码为root
start pipe p1;
```

#### 2.1.4 使用限制
1. 启动协议之后需要写入数据，才能建立连接，且仅能订阅建立连接之后的数据。
2. 推荐在单机模式下使用。在分布式模式下，每一个 IoTDB DataNode 都作为一个独立的 OPC Server 提供数据，需要单独订阅。

### 2.2 两种通信模式示例
#### 2.2.1 Client / Server 模式

在这种模式下，IoTDB 的流处理引擎通过 OPC UA Sink 与 OPC UA 服务器（Server）建立连接。OPC UA 服务器在其地址空间(Address Space) 中维护数据，IoTDB可以请求并获取这些数据。同时，其他OPC UA客户端（Client）也能访问服务器上的数据。

* 特性：
    * OPC UA 将从 Sink 收到的设备信息，按照树形模型整理到 Objects folder 下的文件夹中。
    * 每个测点都被记录为一个变量节点，并记录当前数据库中的最新值。
    * OPC UA 无法删除数据或者改变数据类型的设置

##### 2.2.1.1 准备工作
1. 此处以UAExpert客户端为例，下载 UAExpert 客户端：https://www.unified-automation.com/downloads/opc-ua-clients.html
2. 安装 UAExpert，填写自身的证书等信息。

##### 2.2.1.2 快速开始
1. 使用如下 sql，启动 OPC UA 服务。详细语法参见上文：[IoTDB OPC Server语法](./Programming-OPC-UA_timecho.md#_2-1-语法)

```SQL
create pipe p1 with sink ('sink'='opc-ua-sink');
```

2. 写入部分数据。

```SQL
insert into root.test.db(time, s2) values(now(), 2)
```

3. 在 UAExpert 中配置 iotdb 的连接，其中 password 填写为上述参数配置中 sink.password 中设定的密码（此处用户名、密码以2.3小节示例中配置的 root/root 为例）：

<div align="center">
    <img src="/img/OPCUA03.png" alt="" style="width: 60%;"/>
</div>

<div align="center">
    <img src="/img/OPCUA04.png" alt="" style="width: 60%;"/>
</div>

4. 信任服务器的证书后，在左侧 Objects folder 即可看到写入的数据。

<div align="center">
    <img src="/img/OPCUA05.png" alt="" style="width: 60%;"/>
</div>

<div align="center">
    <img src="/img/OPCUA06.png" alt="" style="width: 60%;"/>
</div>

5. 可以将左侧节点拖动到中间，并展示该节点的最新值：

<div align="center">
    <img src="/img/OPCUA07.png" alt="" style="width: 60%;"/>
</div>

#### 2.2.2 Pub / Sub 模式

在这种模式下，IoTDB的流处理引擎通过 OPC UA Sink 向OPC UA 服务器（Server）发送数据变更事件。这些事件被发布到服务器的消息队列中，并通过事件节点 (Event Node) 进行管理。其他OPC UA客户端（Client）可以订阅这些事件节点，以便在数据变更时接收通知。

* 特性：
    * 每个测点会被 OPC UA 包装成一个事件节点（EventNode）。
    * 相关字段及其对应含义如下：

      | 字段       | 含义             | 类型（Milo）  | 示例                  |
      | ------------ | ------------------ | --------------- | ----------------------- |
      | Time       | 时间戳           | DateTime      | 1698907326198         |
      | SourceName | 测点对应完整路径 | String        | root.test.opc.sensor0 |
      | SourceNode | 测点数据类型     | NodeId        | Int32                 |
      | Message    | 数据             | LocalizedText | 3.0                   |

    - Event 仅会发送给所有已经监听的客户端，客户端未连接则会忽略该 Event。
    - 如果数据被删除，信息则无法推送给客户端。


##### 2.2.2.1 准备工作

该代码位于 iotdb-example 包下的 [opc-ua-sink 文件夹](https://github.com/apache/iotdb/tree/master/example/pipe-opc-ua-sink/src/main/java/org/apache/iotdb/opcua)中

代码中包含：

- 主类（ClientTest）
- Client 证书相关的逻辑（IoTDBKeyStoreLoaderClient）
- Client 的配置及启动逻辑（ClientExampleRunner）
- ClientTest 的父类（ClientExample）

##### 2.2.2.2 快速开始

使用步骤为：

1. 打开 IoTDB 并写入部分数据。

```SQL
insert into root.a.b(time, c, d) values(now(), 1, 2);
```

     此处自动创建元数据开启。

2. 使用如下 sql，创建并启动 Pub-Sub 模式的 OPC UA Sink。详细语法参见上文：[IoTDB OPC Server语法](./Programming-OPC-UA_timecho.md#_2-1-语法)

```SQL
create pipe p1 with sink ('sink'='opc-ua-sink', 'sink.opcua.model'='pub-sub');
start pipe p1;
```

     此时能看到服务器的 conf 目录下创建了 opc 证书相关的目录。

<div align="center">
    <img src="/img/OPCUA08.png" alt="" style="width: 60%;"/>
</div>

3. 直接运行 Client 连接，此时 Client 证书被服务器拒收。

<div align="center">
    <img src="/img/OPCUA09.png" alt="" style="width: 60%;"/>
</div>

4. 进入服务器的 sink.opcua.security.dir 目录下，进入 pki 的 rejected 目录，此时 Client 的证书应该已经在该目录下生成。

<div align="center">
    <img src="/img/OPCUA10.png" alt="" style="width: 60%;"/>
</div>

5. 将客户端的证书移入（不是复制） 同目录下 trusted 目录的 certs 文件夹中。

<div align="center">
    <img src="/img/OPCUA11.png" alt="" style="width: 60%;"/>
</div>

6. 再次打开 Client 连接，此时服务器的证书应该被 Client 拒收。

<div align="center">
    <img src="/img/OPCUA12.png" alt="" style="width: 60%;"/>
</div>

7. 进入客户端的 <java.io.tmpdir>/client/security 目录下，进入 pki 的 rejected 目录，将服务器的证书移入（不是复制）trusted 目录。

<div align="center">
    <img src="/img/OPCUA13.png" alt="" style="width: 60%;"/>
</div>

8. 打开 Client，此时建立双向信任成功， Client 能够连接到服务器。

9. 向服务器中写入数据，此时 Client 中能够打印出收到的数据。

<div align="center">
    <img src="/img/OPCUA14.png" alt="" style="width: 60%;"/>
</div>


#### 2.2.3 注意事项

1. **单机与集群**：建议使用1C1D单机版，如果集群中有多个 DataNode，可能数据会分散发送在各个 DataNode 上，无法收听到全量数据。

2. **无需操作根目录下证书**：在证书操作过程中，无需操作 IoTDB security 根目录下的 `iotdb-server.pfx` 证书和 client security 目录下的 `example-client.pfx` 目录。Client 和 Server 双向连接时，会将根目录下的证书发给对方，对方如果第一次看见此证书，就会放入 reject dir，如果该证书在 trusted/certs 里面，则能够信任对方。

3. **建议使用** **Java 17+**：在 JVM 8 的版本中，可能会存在密钥长度限制，报 Illegal key size 错误。对于特定版本（如 jdk.1.8u151+），可以在 ClientExampleRunner 的 create client 里加入 `Security.`*`setProperty`*`("crypto.policy", "unlimited");` 解决，也可以下载无限制的包 `local_policy.jar` 与 `US_export_policy `解决替换 `JDK/jre/lib/security `目录下的包解决，下载网址：https://www.oracle.com/java/technologies/javase-jce8-downloads.html。

4. **连接问题**：如果报错为 Unknown host，需要修改 IoTDB DataNode 所在机器的 etc/hosts 文件，加入目标端机器的 url 和 hostName。

## 3. 数据推送

在此模式下，IoTDB 通过 Pipe 扮演 OPC UA 客户端角色，主动将选定的数据连同质量码(`quality`)一并推送到一个或多个外部 OPC UA 服务器。外部服务器会自动按 IoTDB 的元数据动态创建目录树和节点。

![](/img/opc-ua-data-push.png)

### 3.1 OPC 服务启动方式

#### 3.1.1语法

启动 OPC UA 协议的语法：

```SQL
create pipe p1 
    with source (...) 
    with processor (...) 
    with sink ('sink' = 'opc-ua-sink', 
               'opcua.node-url' = '127.0.0.1:12686', 
               'opcua.historizing' = 'true', 
               'opcua.with-quality' = 'true' 
              )
```

#### 3.1.2 参数

| **参数**                | **描述**                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | ** 取值范围 **                                                                                                                                                                      | **是否必填** | **默认值**   |
|-----------------------| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | -------------------- |
| sink                  | OPC UA SINK                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | String: opc-ua-sink                                                                                                                                                                           | 必填               |                    |
| opcua.node-url        | 逗号分隔，可以配置单个 OPC UA 的 tcp port，当存在该参数时，不会启动本机 server，而是发送到配置的 OPC UA Server。                                                                                                                                                                                                                                                                                                                                                                 | String                                                                                                                                                                                        | 选填               | `''`           |
| opcua.historizing     | 自动创建目录及叶子节点时，新节点是否存变量的历史数据。                                                                                                                                                                                                                                                                                                                                                                                                                           | Boolean                                                                                                                                                                                       | 选填               | false              |
| opcua.with-quality    | OPC UA 的测点发布是否为 value + quality 模式。启用配置后，系统将按以下规则处理写入数据：<br>1. 同时包含 value 和 quality，则直接推送至 OPC UA Server。<br>2. 仅包含 value，则 quality 自动填充为 UNCERTAIN（默认值，支持自定义配置）。<br>3. 仅包含 quality，则该写入被忽略，不进行任何处理。<br>4. 包含非 value/quality 字段，则忽略该数据，并记录警告日志（日志频率可配置，避免高频干扰）。<br>5. quality 类型限制：目前仅支持布尔类型（true 表示 GOOD，false 表示 BAD）； | Boolean                                                                                                                                  | 选填               | false                                                                                                                                                                            |
| opcua.value-name      | With-quality 为 true 时生效，表示 value 测点的名字。                                                                                                                                                                                                                                                                                                                                                                                                                              | String                                                                                                                                   | 选填               | value                                                                                                                                                                            |
| opcua.quality-name    | With-quality 为 true 时生效，表示 quality 测点的名字。                                                                                                                                                                                                                                                                                                                                                                                                                             | String                                                                                                                                   | 选填               | quality                                                                                                                                                                          |
| opcua.default-quality | 没有 quality 时，可以通过 SQL 参数指定`GOOD`/`UNCERTAIN`/`BAD`。                                                                                                                                                                                                                                                                                                                                                                                                   | String:`GOOD`/`UNCERTAIN`/`BAD`                                                                                                          | 选填               | `UNCERTAIN`                                                                                                                                                                      |
| opcua.security-policy | OPC UA client 连接使用的安全策略，不区分大小写，网址为：`http://opcfoundation.org/UA/SecurityPolicy#<policy_name>`，例如http://opcfoundation.org/UA/SecurityPolicy#Aes128_Sha256_RsaOaep                                                                                                                              | String（安全性依次递增）:<br>`None`<br>`Basic128Rsa15`<br>`Basic256`<br>`Basic256Sha256`<br>`Aes128_Sha256_RsaOaep`<br>`Aes256_Sha256_RsaPss` | 选填| `Basic256Sha256`                                                                                                                 |
| opcua.timeout-seconds | Client 连接 server 的超时秒数，仅在 IoTDB 为 client 时生效                                                                                                                                                                                                                                                                                                                                                                                                                        | Long                                                                                                                                     | 选填               | 10L                                                                                                                                                                              |

> **参数命名注意**：以上参数均支持省略 `opcua.` 前缀，例如 `node-urls` 和 `opcua.node-urls` 等价。
>
> **参数支持说明**：V2.0.8-beta 起支持以上`opcua. `相关参数，且仅支持` client-server` 模式

#### 3.1.3 示例

```Bash
create pipe p1 
    with source (...) 
    with processor (...) 
    with sink ('sink' = 'opc-ua-sink', 
               'node-urls' = '127.0.0.1:12686', 
               'historizing' = 'true', 
               'with-quality' = 'true' 
              )
```

#### 3.1.4 使用限制 

1. 当前模式**仅支持`client-server`****模式和树模型数据**。
2. 不支持一台机器上配置多个 DataNode，避免抢占相同的端口。
3. 不支持`OBJECT` 类型的数据推送。
4. 当某条时间序列改名后，将会联动修改 OPC UA Sink 删除对应的老路径，向新路径推送数据。
5. 生产环境强烈建议使用非`None`的安全策略（如`Basic256Sha256`），并正确配置证书双向信任。

### 3.2 外置 OPC UA 服务器项目

IoTDB  支持单独的外部 Server 项目。该 Server 的实现及配置项与 IoTDB 目前的内置 Server 相同，但是需要额外支持新增目录及叶子节点，保证可以自动按照 IoTDB 写入中的元数据创建目录及叶子节点。

该 Server 的相关配置在启动 Server 时，需通过命令行的 args 注入，暂不支持 yml、xml 等配置文件。启动参数的键名与 IoTDB OPC Server 配置项对应，其中配置项中的点（.）和短划线（-）需替换为下划线（\_）。

例如：

```SQL
.\start-IoTDB-opc-server.sh -enable_anonymous_access true -u root -pw root -https_port 8443
```

其中，`user` 和 `password` 可简写为 `-u`、`-p`，其余参数键名均与配置项保持一致。请注意，`userName` 不能作为参数键名，仅支持 `user`。

### 3.3 场景示例

**目标**：将多个数据源的数据，按区域汇聚到3个外部OPC Server，供监控中心统一访问。

![](/img/opc-ua-data-push-example.png)

1. **准备**：在三台服务器 (`ip1`, `ip2`, `ip3`) 上分别启动外部 OPC UA Server（端口12686）。
2. **配置Pipe**：在 IoTDB 中创建3个 Pipe，使用`processor`或`source`中的路径模式过滤，将不同区域的数据推送到对应的 Server。
   ```SQL
   -- 启动和连接 IoTDB
   .\start-standalone.sh
   
   -- 启动三个 OPC UA Server
   -- ip1、ip2、ip3 执行三次，端口为默认，12686
   .\start-IoTDB-external-opc-server.sh -enable-anonymous-access true -u root -pw root
   
   -- 创建三个 Pipe
   .\start-cli.sh
   create pipe p1 
       with source (<ip1相关的用户名和密码>) 
       with processor (...) 
       with sink ('sink' = 'opc-ua-sink', 
                  'node-urls' = 'ip1:12686', 
                  'historizing' = 'true',
                  'with-quality' = 'true' 
                 );
   create pipe p1 
       with source (<ip2相关的用户名和密码>) 
       with processor (...) 
       with sink ('sink' = 'opc-ua-sink', 
                  'node-urls' = 'ip2:12686', 
                  'historizing' = 'true', 
                  'with-quality' = 'true' 
                 );
   create pipe p1 
       with source (<ip3相关的用户名和密码>) 
       with processor (...) 
       with sink ('sink' = 'opc-ua-sink', 
                  'node-urls' = 'ip3:12686', 
                  'historizing' = 'true', 
                  'with-quality' = 'true' 
                 );
   ```
3. **效果**：监控中心只需连接 `ip1`, `ip2`, `ip3` 这三个Server，即可获取所有区域的完整数据视图，且数据附带质量信息。
