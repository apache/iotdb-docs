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

# OPC DA 协议

## 1. OPC DA

OPC DA (OPC Data Access) 是工业自动化领域的一种通信协议标准，属于经典 OPC（OLE for Process Control）技术的核心部分。它的主要目标是实现 Windows 环境下工业设备与软件（如 SCADA、HMI、数据库）之间的实时数据交互。OPC DA 基于 COM / DCOM 实现，是一个轻量级的协议，分为服务器和客户端两个角色。

* **服务器：** 可以视为一个 Item 的池，存储各个实例的最新数据及其状态。所有 item 只能在服务器端管理，客户端只能读写数据，无权操作元信息。

![](/img/opc-da-1-1.png)

* **客户端：** 连接服务器后，需要自定义一个组（这个组仅与客户端有关），并创建服务器的同名 item，然后可以对自身已创建的 item 进行读写。

![](/img/opc-da-1-2.png)

## 2. OPC DA Sink

IoTDB （V1.3.5.2及以后的V1.x版本，V2.5.0.1及以后的V2.x版本支持） 提供的 OPC DA Sink 支持将树模型数据推送到本地 COM 服务器的插件，它封装了 OPC DA 接口规范及其固有复杂性，显著简化了集成流程。OPC DA Sink 推送数据流图如下所示。

![](/img/opc-da-2-1.png)

### 2.1 SQL 语法

```SQL
---- 注意这里的 clsID 需要替换为自己的 clsID
create pipe opc (
    'sink'='opc-da-sink', 
    --- 'opcda.progid'='opcserversim.Instance.1'
    'opcda.clsid'='CAE8D0E1-117B-11D5-924B-11C0F023E91C'
);
```

### 2.2 参数介绍

| **参数**    | **描述**                                                      | **取值范围 ** | 是否必填         |
| ------------------- | --------------------------------------------------------------------- | ----------------------- | ------------------ |
| sink              | OPC DA SINK                                                         | String: opc-da-sink   | 必填             |
| sink.opcda.clsid  | OPC Server 的 ClsID（唯一标识字符串）。建议使用 clsID 而非 progID。 | String                | 和 progId 二选一 |
| sink.opcda.progid | OPC Server 的 ProgID，如果有 clsID，优先使用 clsID。                | String                | 和 clsID 二选一  |

### 2.3 映射规范

使用时，IoTDB 将会将自身的树模型最新数据推送到服务器，数据的 itemID 为树模型下的时间序列的全路径，如 `root.a.b.c.d`。注意根据 OPC DA 标准，客户端无权直接在 server 侧创建 item，因此需要服务器提前将 IoTDB 的时间序列以 itemID 和对应数据类型的格式创建为 item。

* 数据类型对应如下表所示。

| IoTDB     | OPC-DA Server                                             |
| ----------- | ----------------------------------------------------------- |
| INT32     | VT\_I4                                                    |
| INT64     | VT\_I8                                                    |
| FLOAT     | VT\_R4                                                    |
| DOUBLE    | VT\_R8                                                    |
| TEXT      | VT\_BSTR                                                  |
| BOOLEAN   | VT\_BOOL                                                  |
| DATE      | VT\_DATE                                                  |
| TIMESTAMP | VT\_DATE                                                  |
| BLOB      | VT\_BSTR（Variant 不支持 VT\_BLOB，因此用 VT\_BSTR 替代） |
| STRING    | VT\_BSTR                                                  |

### 2.4 常见错误码

| 符号                        | 错误码     | 描述                                                                                                                                                 |
| ----------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| OPC\_E\_BADTYPE             | 0xC0040004 | 服务器无法在指定格式/请求的数据类型与规范数据类型之间转换数据。即服务器的数据类型与 IoTDB 的注册类型不一致。                                         |
| OPC\_E\_UNKNOWNITEMID| 0xC0040007 | 在服务器地址空间中未定义该条目ID（添加或验证时），或该条目ID在服务器地址空间中已不存在（读取或写入时）。即 IoTDB 的测点在服务器内没有对应的 itemID。 |
| OPC\_E\_INVALIDITEMID       | 0xC0040008 | 该 itemID不符合服务器的语法规范。                                                                                                                    |
| REGDB\_E\_CLASSNOTREG       | 0x80040154 | 未注册类                                                                                                                                             |
| RPC\_S\_SERVER\_UNAVAILABLE | 0x800706ba | RPC服务不可用                                                                                                                                        |
| DISP\_E\_OVERFLOW           | 0x8002000a | 超过类型的最大值                                                                                                                                     |
| DISP\_E\_BADVARTYPE         | 0x80020005 | 类型不匹配                                                                                                                                           |

### 2.5 使用限制

* 仅支持 COM，且仅能在 Windows 上使用
* 重启后可能会推送少部分旧数据，但是最终会推送新数据
* 目前仅支持树模型数据。

## 3. 使用步骤
### 3.1 前置条件
1. Windows 环境，版本 >= 8
2. IoTDB 已安装且可正常运行
3. OPC DA Server 已安装

* 以 Simple OPC Server Simulator 为例

![](/img/opc-da-3-1.png)

* 双击某项，可以修改该项的名字（itemID），数据，数据类型等各个信息。
* 右键某项，可以删除该项、更新值、以及新建项。

![](/img/opc-da-3-2.png)

4. OPC DA Client 已安装

* 以 KepwareServerEX 的 quickClient 为例
* 在 Kepware 中可以如下打开 OPC DA Client

![](/img/opc-da-3-3.png)

![](/img/opc-da-3-4.png)


### 3.2 配置修改

修改 server 配置，以避免 IoTDB 的写入 client 与 Kepware 的读取 client 连接到两个不同的实例而无法调试。

* 首先按 Win+R 键，在运行菜单内输入 `dcomcnfg`，打开 dcom 的组件配置：

![](/img/opc-da-3-5.png)

* 点击组件服务 -> 计算机 -> 我的电脑 -> DCOM 配置，找到`AGG Software Simple OPC Server Simulator`，右键“属性”：

![](/img/opc-da-3-6.png)

* 在`标识`内，将`用户账户`改为`交互式用户`。注意这里不要为`启动用户`，否则可能导致两个 client 分别启动不同的 server 实例。

![](/img/opc-da-3-7.png)

### 3.3 clsID 获取
1. 方式一：通过 DCOM 配置 获取

* 按 Win+R 键，在运行菜单内输入 `dcomcnfg`，打开 dcom 的组件配置；
* 点击组件服务 -> 计算机 -> 我的电脑 -> DCOM 配置，找到`AGG Software Simple OPC Server Simulator`，右键“属性”。
* 在 `常规 `中可以获取该应用程序的 clsID，用于之后 opc-da-sink 的连接，注意不带大括号

![](/img/opc-da-3-8.png)

2. 方式二：clsID 与 progID 也可以直接在 server 里获取

* 点击 `Help` > `Show OPC Server Info`

![](/img/opc-da-3-9.png)

* 弹窗中即可显示

![](/img/opc-da-3-10.png)

### 3.4 写入数据
#### 3.4.1 DA Server
1. 在 DA Server 内新建项，与 IoTDB 的待写入项的 name 与 type 保持一致

![](/img/opc-da-3-11.png)

2. 在 Kepware 中连上该 server：

![](/img/opc-da-3-12.png)

3. 右键服务器新建组，组名任意：

![](/img/opc-da-3-13.png)

![](/img/opc-da-3-14.png)

4. 右键新建 item，item 的名字为之前创建的名字

![](/img/opc-da-3-15.png)

![](/img/opc-da-3-16.png)

![](/img/opc-da-3-17.png)

#### 3.4.2 IoTDB
1. 启动 IoTDB
2. 创建 Pipe

```SQL
create pipe opc ('sink'='opc-da-sink', 'opcda.clsid'='CAE8D0E1-117B-11D5-924B-11C0F023E91C')
```

* 注意：如果创建失败，提示` Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 1107: Failed to connect to server, error code: 0x80040154`，则可以参考该解决方案进行处理：https://opcexpert.com/support/0x80040154-class-not-registered/

3. 创建时间序列（如果已开启自动创建元数据，则本步骤可以省略）

```SQL
create timeseries root.a.b.c.r string;
```

4. 插入数据

```SQL
insert into root.a.b.c (time, r) values(10000, "SomeString")
```

### 3.5 验证数据

查看 Quick client 的数据，应该已经得到更新。

![](/img/opc-da-3-18.png)