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

Node.js 原生 API 支持通过 `TableSessionPool` 与 IoTDB 表模型进行交互，可执行表模型下的数据写入、查询、非查询 SQL 以及连接管理等操作。`TableSessionPool` 在连接池能力基础上增加了数据库上下文管理，适合在 Node.js 应用中访问关系型表结构的数据。

本文将围绕 `TableSessionPool` 的使用进行说明，涵盖从环境准备、核心操作步骤到常用接口的完整内容。

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

使用 Node.js 原生接口操作 IoTDB 表模型的三个核心步骤如下：

1. 创建连接池实例：初始化一个 `TableSessionPool` 对象，配置连接参数、数据库和池大小。
2. 执行数据库操作：直接通过连接池执行表创建、数据写入或查询等操作。
3. 关闭连接池资源：程序结束时调用 `tablePool.close()`，释放所有连接。

下面的章节用于说明开发的核心流程，并未演示所有参数和接口。如需了解完整能力，可查阅 [`@iotdb/client` 源码](https://github.com/apache/iotdb-client-nodejs/tree/develop/src)及[示例](https://github.com/apache/iotdb-client-nodejs/tree/develop/examples)。

### 2.1 创建连接池实例

#### 2.1.1 单节点连接

```typescript
import { TableSessionPool } from '@iotdb/client';

const tablePool = new TableSessionPool('localhost', 6667, {
  username: 'root',
  password: 'root',
  database: 'test',
  maxPoolSize: 10,
  minPoolSize: 2,
});

await tablePool.init();
```

其中 `database` 用于设置表模型的默认数据库。配置后，连接池执行查询和写入时会使用该数据库上下文。

#### 2.1.2 多节点连接

在集群环境下，推荐使用 `nodeUrls` 配置多个节点。连接池会以轮询方式在多个节点间分配连接，并在连接失败时尝试其他可用节点。

```typescript
import { TableSessionPool } from '@iotdb/client';

const tablePool = new TableSessionPool({
  nodeUrls: [
    '192.168.1.100:6667',
    '192.168.1.101:6667',
    '192.168.1.102:6667',
  ],
  username: 'root',
  password: 'root',
  database: 'test',
  maxPoolSize: 10,
  minPoolSize: 2,
});

await tablePool.init();
```

连接池参数可按业务并发量调整：`minPoolSize` 建议设置为平均并发负载，`maxPoolSize` 建议设置为峰值并发负载并预留 20% 到 30% 缓冲；`maxIdleTime` 用于清理长期空闲连接，`waitTimeout` 用于控制连接池耗尽时的最大等待时间。生产环境建议监控 `getPoolSize()`、`getAvailableSize()` 和 `getInUseSize()`，根据峰值负载调整连接池大小。

#### 2.1.3 SSL/TLS 连接

如 IoTDB 服务端启用了 SSL/TLS，可在创建连接池时开启 SSL，并指定证书相关参数。

```typescript
import { TableSessionPool } from '@iotdb/client';
import * as fs from 'fs';

const tablePool = new TableSessionPool({
  host: 'localhost',
  port: 6667,
  username: 'root',
  password: 'root',
  database: 'test',
  enableSSL: true,
  sslOptions: {
    ca: fs.readFileSync('/path/to/ca.crt'),
    cert: fs.readFileSync('/path/to/client.crt'),
    key: fs.readFileSync('/path/to/client.key'),
    rejectUnauthorized: true,
  },
});

await tablePool.init();
```

#### 2.1.4 写入重定向

在多节点 IoTDB 集群中，客户端支持写入重定向。写入操作发送到非目标节点时，服务端可能返回重定向建议，客户端会缓存目标路由，并在后续写入时优先使用更合适的节点。

```typescript
import { TableSessionPool } from '@iotdb/client';

const tablePool = new TableSessionPool({
  nodeUrls: [
    '192.168.1.100:6667',
    '192.168.1.101:6667',
    '192.168.1.102:6667',
  ],
  username: 'root',
  password: 'root',
  database: 'test',
  maxPoolSize: 10,
  enableRedirection: true,
  redirectCacheTTL: 300000,
});

await tablePool.init();
```

启用重定向后，可减少跨节点转发，提升写入吞吐并降低网络延迟。

### 2.2 数据库操作

#### 2.2.1 创建数据库和表

```typescript
await tablePool.executeNonQueryStatement('CREATE DATABASE IF NOT EXISTS test');

await tablePool.executeNonQueryStatement('USE test');

await tablePool.executeNonQueryStatement(`
  CREATE TABLE IF NOT EXISTS device_metrics (
    time TIMESTAMP TIME,
    device_id STRING TAG,
    region STRING ATTRIBUTE,
    temperature FLOAT FIELD,
    humidity FLOAT FIELD
  )
`);
```

#### 2.2.2 写入 Tablet 数据

表模型写入时，需要指定表名、列名、数据类型、时间戳和值。以下示例按列组织 `values`，每个数组对应一个非时间列。

```typescript
import { ColumnCategory, TSDataType } from '@iotdb/client';

await tablePool.insertTablet({
  tableName: 'device_metrics',
  columnNames: ['device_id', 'region', 'temperature', 'humidity'],
  columnTypes: [
    TSDataType.STRING,
    TSDataType.STRING,
    TSDataType.FLOAT,
    TSDataType.FLOAT,
  ],
  columnCategories: [
    ColumnCategory.TAG,
    ColumnCategory.ATTRIBUTE,
    ColumnCategory.FIELD,
    ColumnCategory.FIELD,
  ],
  timestamps: [Date.now(), Date.now() + 1000],
  values: [
    ['device_1', 'beijing', 25.5, 60.0],
    ['device_1', 'beijing', 26.0, 61.5],
  ],
});
```

如项目中未直接使用枚举，`columnTypes` 也可以使用数据类型编码。

写入数据时建议优先使用 `insertTablet` 批量写入，减少网络往返次数；常见批量大小可从 100 到 1000 行开始压测，再根据数据规模、网络和服务端资源调整。

#### 2.2.3 查询数据

查询结果通过 `SessionDataSet` 返回。使用完成后应调用 `close()` 释放服务端查询资源。

```typescript
const dataSet = await tablePool.executeQueryStatement(`
  SELECT time, device_id, region, temperature, humidity
  FROM device_metrics
  WHERE device_id = 'device_1'
`);

while (await dataSet.hasNext()) {
  const row = dataSet.next();
  console.log(row.getFields());
}

await dataSet.close();
```

对于小型结果集，也可以使用 `toArray()` 将全部结果加载到内存：

```typescript
const dataSet = await tablePool.executeQueryStatement('SHOW TABLES');
const rows = await dataSet.toArray();
console.log(rows);
await dataSet.close();
```

### 2.3 关闭连接池

```typescript
await tablePool.close();
```

建议在应用退出、定时任务结束或服务销毁时统一关闭连接池，避免连接泄漏。

## 3. 常用接口

### 3.1 TableSessionPool

#### 3.1.1 功能描述

`TableSessionPool` 是表模型推荐使用的连接池接口，支持自动会话管理和数据库上下文管理。调用查询、写入或非查询方法时，连接池会自动获取可用会话，执行完成后回收连接。

#### 3.1.2 构造方式

| 构造方式 | 说明 |
| --- | --- |
| `new TableSessionPool(host, port, config)` | 传统构造方式，适用于单节点连接 |
| `new TableSessionPool(config)` | 使用配置对象构造，适合 `nodeUrls` 多节点配置 |
| `new TableSessionPool(new PoolConfigBuilder().build())` | 使用构建器模式构造，推荐用于参数较多的场景 |

#### 3.1.3 方法列表

| 方法名 | 描述 |
| --- | --- |
| `init()` | 初始化连接池 |
| `close()` | 关闭连接池并释放所有连接 |
| `executeQueryStatement(sql, timeoutMs?)` | 执行查询 SQL，可设置查询超时时间 |
| `executeNonQueryStatement(sql)` | 执行非查询 SQL，例如 DDL 或 DML |
| `insertTablet(tablet)` | 插入表模型 Tablet 数据 |
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

### 3.2 Tablet 参数

表模型 `insertTablet` 的常用参数如下：

| 参数 | 描述 |
| --- | --- |
| `tableName` | 目标表名 |
| `columnNames` | 非时间列名称列表 |
| `dataTypes` | 非时间列的数据类型列表 |
| `columnCategories` | 非时间列的类别列表 |
| `timestamps` | 时间戳列表 |
| `values` | 列值列表，按列组织 |

`columnNames`、`columnTypes`、`columnCategories` 和 `values` 的顺序需要保持一致。

## 4. 数据类型

插入 Tablet 数据时，需要为每个列指定对应的数据类型。Node.js 客户端支持的常用类型如下：

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

1. 默认数据库不存在：如果配置的 `database` 在连接池初始化时尚不存在，请先执行 `CREATE DATABASE`，随后显式执行 `USE database_name`，再创建表、查询或写入；也可以在初始化 `TableSessionPool` 之前预先创建数据库。

2. 列不匹配：如果写入时出现列数量或类型不匹配，请检查 `columnNames`、`columnTypes`、`columnCategories` 和 `values` 的顺序及长度是否一致，并确认 `values` 按行组织且表结构与写入数据匹配。

3. 查询结果占用内存过高：大结果集查询建议使用 `hasNext()` 和 `next()` 分批读取，并调小 `fetchSize`。仅在结果集较小时使用 `toArray()`。

4. 获取连接超时：如果出现等待可用连接超时，通常说明连接池已被占满。可适当增大 `waitTimeout` 或 `maxPoolSize`，同时检查是否存在长时间未关闭的查询结果集。
