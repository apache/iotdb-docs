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

# Node.js 原生接口

Node.js 原生 API 支持通过 `Session` 和 `SessionPool` 两种方式与 IoTDB 树模型进行交互，可执行数据写入、查询、非查询 SQL 以及连接管理等操作。由于 `Session` 非线程安全，生产环境推荐使用 `SessionPool` 编程。在高并发场景下，`SessionPool` 能够统一管理连接资源，并支持多节点负载均衡、故障转移和写入重定向。

本文将围绕 `SessionPool` 的使用进行说明，涵盖从环境准备、核心操作步骤到常用接口的完整内容。

## 1. 环境准备

### 1.1 前置依赖

* Node.js >= 14.0.0
* npm >= 6.0.0
* IoTDB >= 2.0.11

### 1.2 安装方法

* **方式一：通过 npm 直接安装（推荐）**

在 Node.js 项目中执行：

```bash
npm install @iotdb/client
```

* **方式二：从源码构建**

如需使用仓库中的开发版本，可克隆源码并安装依赖：

```bash
git clone https://github.com/apache/iotdb-client-nodejs.git
cd iotdb-client-nodejs
git checkout develop
npm ci
```

Linux、macOS 或 WSL 环境执行：

```bash
npm run build
```

Windows PowerShell 环境执行：

```powershell
npm run build:esbuild
npm run build:types
New-Item -ItemType Directory -Force -Path dist\thrift\generated
Copy-Item src\thrift\generated\*.js,src\thrift\generated\*.d.ts -Destination dist\thrift\generated -Force
```

构建完成后，可在业务项目中通过客户端源码目录的绝对路径进行本地安装：

```bash
npm install /absolute/path/to/iotdb-client-nodejs
```

如使用 TypeScript，无需额外安装类型声明，客户端已内置完整的 TypeScript 类型定义。

**注意：请勿使用高版本客户端连接低版本服务。**

## 2. 核心步骤

使用 Node.js 原生接口操作 IoTDB 树模型的三个核心步骤如下：

1. 创建连接池实例：初始化一个 `SessionPool` 对象，配置连接参数和池大小。
2. 执行数据库操作：直接通过连接池执行数据写入、查询或非查询 SQL。
3. 关闭连接池资源：程序结束时调用 `pool.close()`，释放所有连接。

下面的章节用于说明开发的核心流程，并未演示所有参数和接口。如需了解完整能力，可查阅 [`@iotdb/client` 源码](https://github.com/apache/iotdb-client-nodejs/tree/develop/src)及[示例](https://github.com/apache/iotdb-client-nodejs/tree/develop/examples)。

### 2.1 创建连接池实例

#### 2.1.1 单节点连接

```typescript
import { SessionPool } from '@iotdb/client';

const pool = new SessionPool('localhost', 6667, {
  username: 'root',
  password: 'root',
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTime: 60000,
  waitTimeout: 60000,
});

await pool.init();
```

#### 2.1.2 多节点连接

在集群环境下，推荐使用 `nodeUrls` 配置多个节点。连接池会以轮询方式在多个节点间分配连接，并在连接失败时尝试其他可用节点。

```typescript
import { SessionPool } from '@iotdb/client';

const pool = new SessionPool({
  nodeUrls: [
    '192.168.1.100:6667',
    '192.168.1.101:6667',
    '192.168.1.102:6667',
  ],
  username: 'root',
  password: 'root',
  maxPoolSize: 15,
  minPoolSize: 3,
});

await pool.init();
```

也可以使用构建器模式创建连接池配置：

```typescript
import { SessionPool, PoolConfigBuilder } from '@iotdb/client';

const pool = new SessionPool(
  new PoolConfigBuilder()
    .nodeUrls([
      '192.168.1.100:6667',
      '192.168.1.101:6667',
      '192.168.1.102:6667',
    ])
    .username('root')
    .password('root')
    .maxPoolSize(15)
    .minPoolSize(3)
    .build()
);

await pool.init();
```

连接池参数可按业务并发量调整：`minPoolSize` 建议设置为平均并发负载，`maxPoolSize` 建议设置为峰值并发负载并预留 20% 到 30% 缓冲；`maxIdleTime` 用于清理长期空闲连接，`waitTimeout` 用于控制连接池耗尽时的最大等待时间。生产环境建议监控 `getPoolSize()`、`getAvailableSize()` 和 `getInUseSize()`，根据峰值负载调整连接池大小。

#### 2.1.3 SSL/TLS 连接

如 IoTDB 服务端启用了 SSL/TLS，可在创建连接池时开启 SSL，并指定证书相关参数。

```typescript
import { SessionPool } from '@iotdb/client';
import * as fs from 'fs';

const pool = new SessionPool({
  host: 'localhost',
  port: 6667,
  username: 'root',
  password: 'root',
  enableSSL: true,
  sslOptions: {
    ca: fs.readFileSync('/path/to/ca.crt'),
    cert: fs.readFileSync('/path/to/client.crt'),
    key: fs.readFileSync('/path/to/client.key'),
    rejectUnauthorized: true,
  },
});

await pool.init();
```

#### 2.1.4 写入重定向

在多节点 IoTDB 集群中，客户端支持写入重定向。写入操作发送到非目标节点时，服务端可能返回重定向建议，客户端会缓存设备到节点的映射，并在后续写入同一设备时优先使用目标节点。

```typescript
import { SessionPool } from '@iotdb/client';

const pool = new SessionPool({
  nodeUrls: [
    '192.168.1.100:6667',
    '192.168.1.101:6667',
    '192.168.1.102:6667',
  ],
  username: 'root',
  password: 'root',
  maxPoolSize: 10,
  enableRedirection: true,
  redirectCacheTTL: 300000,
});

await pool.init();
```

启用重定向后，可减少跨节点转发，提升写入吞吐并降低网络延迟。该能力适用于树模型中的设备级写入场景。

### 2.2 数据库操作

#### 2.2.1 创建数据库和时间序列

```typescript
await pool.executeNonQueryStatement('CREATE DATABASE root.test');

await pool.executeNonQueryStatement(
  'CREATE TIMESERIES root.test.device1.temperature WITH DATATYPE=FLOAT, ENCODING=RLE'
);

await pool.executeNonQueryStatement(
  'CREATE TIMESERIES root.test.device1.humidity WITH DATATYPE=FLOAT, ENCODING=RLE'
);
```

#### 2.2.2 写入 Tablet 数据

`insertTablet` 支持按设备批量写入多行数据。`values` 为二维数组，按行组织数据：每行对应一个时间戳，与 `timestamps` 顺序一致；每列对应一个测点，与 `measurements` 顺序一致。

```typescript
await pool.insertTablet({
  deviceId: 'root.test.device1',
  measurements: ['temperature', 'humidity'],
  dataTypes: [3, 3],
  timestamps: [Date.now(), Date.now() + 1000],
  values: [
    [25.5, 60.0],
    [26.0, 61.5],
  ],
});
```

其中 `dataTypes` 可使用数据类型编码，也可在项目中封装为常量使用。常用类型编码见本文第 4 章。

写入数据时建议优先使用 `insertTablet` 批量写入，减少网络往返次数；常见批量大小可从 100 到 1000 行开始压测，再根据数据规模、网络和服务端资源调整。

#### 2.2.3 查询数据

查询结果通过 `SessionDataSet` 返回，支持分页拉取，适合处理较大的结果集。使用完成后应调用 `close()` 释放服务端查询资源。

```typescript
const dataSet = await pool.executeQueryStatement(
  'SELECT temperature, humidity FROM root.test.device1'
);

while (await dataSet.hasNext()) {
  const row = dataSet.next();
  console.log(row.getTimestamp(), row.getFields());
}

await dataSet.close();
```

对于小型结果集，也可以使用 `toArray()` 将全部结果加载到内存：

```typescript
const dataSet = await pool.executeQueryStatement('SHOW DATABASES');
const rows = await dataSet.toArray();
console.log(rows);
await dataSet.close();
```

### 2.3 关闭连接池

```typescript
await pool.close();
```

建议在应用退出、定时任务结束或服务销毁时统一关闭连接池，避免连接泄漏。

## 3. 常用接口

### 3.1 SessionPool

#### 3.1.1 功能描述

`SessionPool` 是树模型推荐使用的连接池接口，支持自动会话管理。调用查询、写入或非查询方法时，连接池会自动获取可用 `Session`，执行完成后回收连接。

#### 3.1.2 构造方式

| 构造方式 | 说明 |
| --- | --- |
| `new SessionPool(hosts, port, config)` | 传统构造方式，适用于单节点或同端口多主机配置 |
| `new SessionPool(config)` | 使用配置对象构造，适合 `nodeUrls` 多节点配置 |
| `new SessionPool(new PoolConfigBuilder().build())` | 使用构建器模式构造，推荐用于参数较多的场景 |

#### 3.1.3 方法列表

| 方法名 | 描述 |
| --- | --- |
| `init()` | 初始化连接池 |
| `close()` | 关闭连接池并释放所有连接 |
| `executeQueryStatement(sql, timeoutMs?)` | 执行查询 SQL，可设置查询超时时间 |
| `executeNonQueryStatement(sql)` | 执行非查询 SQL，例如 DDL 或 DML |
| `insertTablet(tablet)` | 插入 Tablet 数据 |
| `getSession()` | 从连接池中获取一个 `Session`，需要手动归还 |
| `releaseSession(session)` | 将手动获取的 `Session` 释放回连接池 |
| `getPoolSize()` | 获取当前连接池大小 |
| `getAvailableSize()` | 获取当前可用连接数 |
| `getInUseSize()` | 获取当前正在使用的连接数 |

#### 3.1.4 配置项

| 配置项 | 描述 |
| --- | --- |
| `host` | 设置主机地址 |
| `port` | 设置端口 |
| `nodeUrls` | 设置多个节点地址，格式为 `host:port` |
| `username` | 设置用户名 |
| `password` | 设置密码 |
| `database` | 设置默认数据库 |
| `timezone` | 设置时区 |
| `fetchSize` | 设置查询结果批量拉取大小 |
| `maxPoolSize` | 设置最大连接数 |
| `minPoolSize` | 设置最小连接数 |
| `maxIdleTime` | 设置最大空闲时间，单位为毫秒 |
| `waitTimeout` | 设置获取连接的等待超时时间，单位为毫秒 |
| `enableSSL` | 是否启用 SSL |
| `sslOptions` | 设置 SSL 参数 |
| `enableRedirection` | 是否启用写入重定向 |
| `redirectCacheTTL` | 设置重定向缓存过期时间，单位为毫秒 |

### 3.2 Session

#### 3.2.1 功能描述

`Session` 表示一个独立会话，适用于简单脚本或单线程场景。`Session` 非线程安全，多线程或高并发场景请使用 `SessionPool`。

#### 3.2.2 方法列表

| 方法名 | 描述 |
| --- | --- |
| `open()` | 打开会话 |
| `close()` | 关闭会话 |
| `executeQueryStatement(sql, timeoutMs?)` | 执行查询 SQL |
| `executeNonQueryStatement(sql)` | 执行非查询 SQL |
| `insertTablet(tablet)` | 插入 Tablet 数据 |
| `isOpen()` | 判断会话是否已打开 |

## 4. 数据类型

插入 Tablet 数据时，需要为每个测点指定对应的数据类型。Node.js 客户端支持的常用类型如下：

| 类型编码 | 类型名称 | JavaScript 类型 | 说明 |
| --- | --- | --- | --- |
| `0` | `BOOLEAN` | `boolean` | 布尔值 |
| `1` | `INT32` | `number` | 32 位整数 |
| `2` | `INT64` | `bigint` | 64 位整数 |
| `3` | `FLOAT` | `number` | 32 位浮点数 |
| `4` | `DOUBLE` | `number` | 64 位浮点数 |
| `5` | `TEXT` | `string` | UTF-8 文本 |
| `8` | `TIMESTAMP` | `Date` | 毫秒精度时间戳 |
| `9` | `DATE` | `Date` | 日期类型 |
| `10` | `BLOB` | `Buffer` | 二进制数据 |
| `11` | `STRING` | `string` | UTF-8 字符串 |

处理 `INT64` 类型时，建议在 JavaScript 中使用 `bigint`，避免超出 `number` 安全整数范围后出现精度损失。

## 5. 常见问题

1. 连接被拒绝：如果出现 `ECONNREFUSED`，请检查 IoTDB 服务是否已启动、RPC 端口是否正确、网络和防火墙是否允许访问。默认端口通常为 `6667`。

2. 获取连接超时：如果出现等待可用连接超时，通常说明连接池已被占满。可适当增大 `waitTimeout` 或 `maxPoolSize`，同时检查是否存在手动获取 `Session` 后未调用 `releaseSession(session)` 的情况。

3. 查询结果占用内存过高：大结果集查询建议使用 `hasNext()` 和 `next()` 分批读取，并调小 `fetchSize`。仅在结果集较小时使用 `toArray()`。

4. 写入性能不稳定：建议优先使用 `insertTablet` 批量写入，并根据数据规模、网络和服务端资源调整每批行数。多节点环境下建议配置 `nodeUrls`，让连接池在多个节点间分配负载。
