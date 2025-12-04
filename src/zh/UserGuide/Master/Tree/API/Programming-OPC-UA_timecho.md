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

## 1. OPC UA

OPC UA 是一种在自动化领域用于不同设备和系统之间进行通信的技术规范，用于实现跨平台、跨语言和跨网络的操作，为工业物联网提供一个可靠和安全的数据交换基础。IoTDB 中支持 OPC UA协议， IoTDB OPC Server  支持 Client/Server 和 Pub/Sub 两种通信模式。

### 1.1 PC UA Client/Server 模式

- **Client/Server 模式**：在这种模式下，IoTDB 的流处理引擎通过 OPC UA Sink 与 OPC UA 服务器（Server）建立连接。OPC UA 服务器在其地址空间(Address Space) 中维护数据，IoTDB可以请求并获取这些数据。同时，其他OPC UA客户端（Client）也能访问服务器上的数据。

<div align="center">
    <img src="/img/OPCUA01.png" alt="" style="width: 70%;"/>
</div>


- 特性：

    - OPC UA 将从 Sink 收到的设备信息，按照树形模型整理到 Objects folder 下的文件夹中。
    - 每个测点都被记录为一个变量节点，并记录当前数据库中的最新值。

### 1.2 OPC UA Pub/Sub 模式

- **Pub/Sub 模式**：在这种模式下，IoTDB的流处理引擎通过 OPC UA Sink 向OPC UA 服务器（Server）发送数据变更事件。这些事件被发布到服务器的消息队列中，并通过事件节点 (Event Node) 进行管理。其他OPC UA客户端（Client）可以订阅这些事件节点，以便在数据变更时接收通知。

<div align="center">
    <img src="/img/OPCUA02.png" alt="" style="width: 70%;"/>
</div>

- 特性：
 
  - 每个测点会被 OPC UA 包装成一个事件节点（EventNode）。
 
  - 相关字段及其对应含义如下：

    | 字段       | 含义             | 类型（Milo）  | 示例                  |
    | :--------- | :--------------- | :------------ | :-------------------- |
    | Time       | 时间戳           | DateTime      | 1698907326198         |
    | SourceName | 测点对应完整路径 | String        | root.test.opc.sensor0 |
    | SourceNode | 测点数据类型     | NodeId        | Int32                 |
    | Message    | 数据             | LocalizedText | 3.0                   |

  - Event 仅会发送给所有已经监听的客户端，客户端未连接则会忽略该 Event。

## 2. IoTDB OPC Server 启动方式

### 2.1 语法

创建该 Sink 的语法如下：

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

### 2.2 参数

| **参数**                           | **描述**                       | **取值范围**                     | **是否必填** | **默认值**                                                                                                                                                                |
| ---------------------------------- | ------------------------------ | -------------------------------- | ------------ |------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| sink                               | OPC UA SINK                    | String: opc-ua-sink              | 必填         |                                                                                                                                                                        |
| sink.opcua.model                   | OPC UA 使用的模式              | String: client-server / pub-sub  | 选填         | pub-sub                                                                                                                                                                |
| sink.opcua.tcp.port                | OPC UA 的 TCP 端口             | Integer: [0, 65536]              | 选填         | 12686                                                                                                                                                                  |
| sink.opcua.https.port              | OPC UA 的 HTTPS 端口           | Integer: [0, 65536]              | 选填         | 8443                                                                                                                                                                   |
| sink.opcua.security.dir            | OPC UA 的密钥及证书目录        | String: Path，支持绝对及相对目录 | 选填         | iotdb 相关 DataNode 的 conf 目录下的 opc_security 文件夹 /<httpsPort:tcpPort>。<br>如无 iotdb 的 conf 目录（例如 IDEA 中启动 DataNode），则为用户主目录下的 iotdb_opc_security 文件夹 /<httpsPort:tcpPort> |
| sink.opcua.enable-anonymous-access | OPC UA 是否允许匿名访问        | Boolean                          | 选填         | true                                                                                                                                                                   |
| sink.user                          | 用户，这里指 OPC UA 的允许用户 | String                           | 选填         | root                                                                                                                                                                   |
| sink.password                      | 密码，这里指 OPC UA 的允许密码 | String                           | 选填         | TimechoDB@2021 //V2.0.6.x 之前默认密码为root                                                                                                                                                        |

### 2.3 示例

```Bash
create pipe p1 
    with sink ('sink' = 'opc-ua-sink'，
               'sink.user' = 'root', 
               'sink.password' = 'TimechoDB@2021'); //V2.0.6.x 之前默认密码为root
start pipe p1;
```

### 2.4 使用限制

1. **必须存在 DataRegion**：在 IoTDB 有 dataRegion 时，OPC UA 的服务器才会启动。因此，对于一个空的 IoTDB，需要写入一条数据，OPC UA 的服务器才有效。
2. **需连接才有数据**：每一个订阅该服务器的客户端，不会收到 OPC Server 在连接之前写入IoTDB的数据。

3. **多 DataNode 会有分散发送 / 冲突问题**：

  - 对于有多个 dataRegion，且分散在不同 DataNode ip上的 IoTDB 集群，数据会在 dataRegion 的 leader 上分散发送。客户端需要对 DataNode ip 的配置端口分别监听。

  - 建议在 1C1D 下使用该 OPC UA 服务器。

4. **不支持删除数据和修改测点类型：**在Client Server模式下，OPC UA无法删除数据或者改变数据类型的设置。而在Pub Sub模式下，如果数据被删除了，信息是无法推送给客户端的。

## 3. IoTDB OPC Server 示例

### 3.1 Client / Server 模式

#### 准备工作

1. 此处以UAExpert客户端为例，下载 UAExpert 客户端：https://www.unified-automation.com/downloads/opc-ua-clients.html

2. 安装 UAExpert，填写自身的证书等信息。

#### 快速开始

1. 使用如下 sql，创建并启动 client-server 模式的 OPC UA Sink。详细语法参见上文：[IoTDB OPC Server语法](#语法)

```SQL
create pipe p1 with sink ('sink'='opc-ua-sink');
```

2. 写入部分数据。

```SQL
insert into root.test.db(time, s2) values(now(), 2)
```

​     此处自动创建元数据开启。

3. 在 UAExpert 中配置 iotdb 的连接，其中 password 填写为上述参数配置中 sink.password 中设定的密码（此处以密码root为例）：

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

### 3.2 Pub / Sub 模式

#### 准备工作

该代码位于 iotdb-example 包下的 [opc-ua-sink 文件夹](https://github.com/apache/iotdb/tree/rc/2.0.1/example/pipe-opc-ua-sink/src/main/java/org/apache/iotdb/opcua)中

代码中包含：

- 主类（ClientTest）
- Client 证书相关的逻辑（IoTDBKeyStoreLoaderClient）
- Client 的配置及启动逻辑（ClientExampleRunner）
- ClientTest 的父类（ClientExample）

### 3.3 快速开始

使用步骤为：

1. 打开 IoTDB 并写入部分数据。

```SQL
insert into root.a.b(time, c, d) values(now(), 1, 2);
```

​     此处自动创建元数据开启。

2. 使用如下 sql，创建并启动 Pub-Sub 模式的 OPC UA Sink。详细语法参见上文：[IoTDB OPC Server语法](#语法)

```SQL
create pipe p1 with sink ('sink'='opc-ua-sink', 
                          'sink.opcua.model'='pub-sub');
start pipe p1;
```

​     此时能看到服务器的 conf 目录下创建了 opc 证书相关的目录。

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


### 3.4 注意事项

1. **单机与集群**：建议使用1C1D单机版，如果集群中有多个 DataNode，可能数据会分散发送在各个 DataNode 上，无法收听到全量数据。

2. **无需操作根目录下证书**：在证书操作过程中，无需操作 IoTDB security 根目录下的 `iotdb-server.pfx` 证书和 client security 目录下的 `example-client.pfx` 目录。Client 和 Server 双向连接时，会将根目录下的证书发给对方，对方如果第一次看见此证书，就会放入 reject dir，如果该证书在 trusted/certs 里面，则能够信任对方。

3. **建议使用** **Java 17+**：在 JVM 8 的版本中，可能会存在密钥长度限制，报 Illegal key size 错误。对于特定版本（如 jdk.1.8u151+），可以在 ClientExampleRunner 的 create client 里加入 `Security.`*`setProperty`*`("crypto.policy", "unlimited");` 解决，也可以下载无限制的包 `local_policy.jar` 与 `US_export_policy `解决替换 `JDK/jre/lib/security `目录下的包解决，下载网址：https://www.oracle.com/java/technologies/javase-jce8-downloads.html。
