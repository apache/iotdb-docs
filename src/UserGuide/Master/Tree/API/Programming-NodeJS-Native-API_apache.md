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

# Node.js Native API

The Node.js native API supports interacting with the IoTDB tree model through `Session` and `SessionPool`, enabling data insertion, queries, non-query SQL, and connection management. Since `Session` is not thread-safe, `SessionPool` is recommended for production environments. Under high concurrency, `SessionPool` manages connection resources in a unified way and supports multi-node load balancing, failover, and write redirection.

This document focuses on the usage of `SessionPool`, covering environment preparation, core steps, and common interfaces.

## 1. Environment Preparation

### 1.1 Prerequisites

* Node.js >= 14.0.0
* npm >= 6.0.0
* IoTDB >= 2.0.11

### 1.2 Installation

* **Option 1: Install directly via npm (recommended)**

Run the following command in your Node.js project:

```bash
npm install @iotdb/client
```

* **Option 2: Build from source**

To use the development version from the repository, clone the source code and install dependencies:

```bash
git clone https://github.com/apache/iotdb-client-nodejs.git
cd iotdb-client-nodejs
git checkout develop
npm ci
```

On Linux, macOS, or WSL, run:

```bash
npm run build
```

On Windows PowerShell, run:

```powershell
npm run build:esbuild
npm run build:types
New-Item -ItemType Directory -Force -Path dist\thrift\generated
Copy-Item src\thrift\generated\*.js,src\thrift\generated\*.d.ts -Destination dist\thrift\generated -Force
```

After the build is complete, you can install the client locally in your business project via the absolute path of the client source directory:

```bash
npm install /absolute/path/to/iotdb-client-nodejs
```

If you use TypeScript, no additional type declarations are required. The client comes with complete TypeScript type definitions built in.

**Note: Do not use a higher-version client to connect to a lower-version server.**

## 2. Core Steps

The three core steps of operating the IoTDB tree model with the Node.js native API are as follows:

1. Create a connection pool instance: initialize a `SessionPool` object with connection parameters and pool size.
2. Execute database operations: perform data insertion, queries, or non-query SQL directly through the connection pool.
3. Close the connection pool: call `pool.close()` when the program ends to release all connections.

The following sections describe the core development workflow and do not demonstrate all parameters and interfaces. For the complete capabilities, refer to the [`@iotdb/client` source code](https://github.com/apache/iotdb-client-nodejs/tree/develop/src) and [examples](https://github.com/apache/iotdb-client-nodejs/tree/develop/examples).

### 2.1 Creating a Connection Pool Instance

#### 2.1.1 Single-Node Connection

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

#### 2.1.2 Multi-Node Connection

In a cluster environment, it is recommended to configure multiple nodes with `nodeUrls`. The connection pool distributes connections across nodes in a round-robin manner and tries other available nodes when a connection fails.

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

You can also create the connection pool configuration with the builder pattern:

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

Connection pool parameters can be adjusted according to your workload: `minPoolSize` is recommended to be set to the average concurrent load, while `maxPoolSize` should be set to the peak concurrent load with a 20% to 30% buffer. `maxIdleTime` is used to clean up long-idle connections, and `waitTimeout` controls the maximum waiting time when the pool is exhausted. In production, it is recommended to monitor `getPoolSize()`, `getAvailableSize()`, and `getInUseSize()`, and adjust the pool size based on peak load.

#### 2.1.3 SSL/TLS Connection

If SSL/TLS is enabled on the IoTDB server, you can enable SSL when creating the connection pool and specify certificate-related parameters.

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

#### 2.1.4 Write Redirection

In a multi-node IoTDB cluster, the client supports write redirection. When a write operation is sent to a non-target node, the server may return a redirection hint. The client caches the device-to-node mapping and prefers the target node for subsequent writes to the same device.

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

With redirection enabled, cross-node forwarding is reduced, improving write throughput and lowering network latency. This capability applies to device-level write scenarios in the tree model.

### 2.2 Database Operations

#### 2.2.1 Creating a Database and Time Series

```typescript
await pool.executeNonQueryStatement('CREATE DATABASE root.test');

await pool.executeNonQueryStatement(
  'CREATE TIMESERIES root.test.device1.temperature WITH DATATYPE=FLOAT, ENCODING=RLE'
);

await pool.executeNonQueryStatement(
  'CREATE TIMESERIES root.test.device1.humidity WITH DATATYPE=FLOAT, ENCODING=RLE'
);
```

#### 2.2.2 Inserting Tablet Data

`insertTablet` supports batch insertion of multiple rows per device. `values` is a two-dimensional array organized by row: each row corresponds to a timestamp, consistent with the order of `timestamps`; each column corresponds to a measurement, consistent with the order of `measurements`.

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

Here `dataTypes` can use data type codes, which can also be encapsulated as constants in your project. See Chapter 4 of this document for common type codes.

For data insertion, it is recommended to use `insertTablet` for batch writes to reduce network round trips. A common batch size to start with is 100 to 1000 rows, then adjust based on data volume, network, and server resources.

#### 2.2.3 Querying Data

Query results are returned through `SessionDataSet`, which supports paged fetching and is suitable for large result sets. Call `close()` after use to release server-side query resources.

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

For small result sets, you can also use `toArray()` to load all results into memory:

```typescript
const dataSet = await pool.executeQueryStatement('SHOW DATABASES');
const rows = await dataSet.toArray();
console.log(rows);
await dataSet.close();
```

### 2.3 Closing the Connection Pool

```typescript
await pool.close();
```

It is recommended to close the connection pool uniformly when the application exits, a scheduled task ends, or the service is destroyed, to avoid connection leaks.

## 3. Common Interfaces

### 3.1 SessionPool

#### 3.1.1 Description

`SessionPool` is the recommended connection pool interface for the tree model and supports automatic session management. When a query, insert, or non-query method is called, the pool automatically acquires an available `Session` and recycles the connection after execution.

#### 3.1.2 Constructors

| Constructor | Description |
| --- | --- |
| `new SessionPool(hosts, port, config)` | Traditional constructor, suitable for single-node or multi-host configurations with the same port |
| `new SessionPool(config)` | Constructed with a configuration object, suitable for `nodeUrls` multi-node configurations |
| `new SessionPool(new PoolConfigBuilder().build())` | Constructed with the builder pattern, recommended when there are many parameters |

#### 3.1.3 Methods

| Method | Description |
| --- | --- |
| `init()` | Initializes the connection pool |
| `close()` | Closes the connection pool and releases all connections |
| `executeQueryStatement(sql, timeoutMs?)` | Executes a query SQL, with an optional query timeout |
| `executeNonQueryStatement(sql)` | Executes a non-query SQL, such as DDL or DML |
| `insertTablet(tablet)` | Inserts Tablet data |
| `getSession()` | Acquires a `Session` from the pool, which must be returned manually |
| `releaseSession(session)` | Returns a manually acquired `Session` to the pool |
| `getPoolSize()` | Gets the current pool size |
| `getAvailableSize()` | Gets the current number of available connections |
| `getInUseSize()` | Gets the current number of connections in use |

#### 3.1.4 Configuration Options

| Option | Description |
| --- | --- |
| `host` | Host address |
| `port` | Port |
| `nodeUrls` | Multiple node addresses, in the format `host:port` |
| `username` | User name |
| `password` | Password |
| `database` | Default database |
| `timezone` | Time zone |
| `fetchSize` | Batch fetch size for query results |
| `maxPoolSize` | Maximum number of connections |
| `minPoolSize` | Minimum number of connections |
| `maxIdleTime` | Maximum idle time in milliseconds |
| `waitTimeout` | Wait timeout for acquiring a connection, in milliseconds |
| `enableSSL` | Whether to enable SSL |
| `sslOptions` | SSL options |
| `enableRedirection` | Whether to enable write redirection |
| `redirectCacheTTL` | Redirection cache expiration time in milliseconds |

### 3.2 Session

#### 3.2.1 Description

`Session` represents an independent session, suitable for simple scripts or single-threaded scenarios. `Session` is not thread-safe; use `SessionPool` for multi-threaded or high-concurrency scenarios.

#### 3.2.2 Methods

| Method | Description |
| --- | --- |
| `open()` | Opens the session |
| `close()` | Closes the session |
| `executeQueryStatement(sql, timeoutMs?)` | Executes a query SQL |
| `executeNonQueryStatement(sql)` | Executes a non-query SQL |
| `insertTablet(tablet)` | Inserts Tablet data |
| `isOpen()` | Checks whether the session is open |

## 4. Data Types

When inserting Tablet data, you need to specify the corresponding data type for each measurement. The common types supported by the Node.js client are as follows:

| Type Code | Type Name | JavaScript Type | Description |
| --- | --- | --- | --- |
| `0` | `BOOLEAN` | `boolean` | Boolean value |
| `1` | `INT32` | `number` | 32-bit integer |
| `2` | `INT64` | `bigint` | 64-bit integer |
| `3` | `FLOAT` | `number` | 32-bit floating point |
| `4` | `DOUBLE` | `number` | 64-bit floating point |
| `5` | `TEXT` | `string` | UTF-8 text |
| `8` | `TIMESTAMP` | `Date` | Millisecond-precision timestamp |
| `9` | `DATE` | `Date` | Date type |
| `10` | `BLOB` | `Buffer` | Binary data |
| `11` | `STRING` | `string` | UTF-8 string |

When handling the `INT64` type, it is recommended to use `bigint` in JavaScript to avoid precision loss when values exceed the safe integer range of `number`.

## 5. FAQ

1. Connection refused: If `ECONNREFUSED` occurs, check whether the IoTDB service is running, whether the RPC port is correct, and whether the network and firewall allow access. The default port is usually `6667`.

2. Connection acquisition timeout: If waiting for an available connection times out, the pool is usually exhausted. Increase `waitTimeout` or `maxPoolSize` as appropriate, and check whether a manually acquired `Session` is not returned via `releaseSession(session)`.

3. Query results consume too much memory: For large result sets, it is recommended to read in batches with `hasNext()` and `next()` and reduce `fetchSize`. Use `toArray()` only for small result sets.

4. Unstable write performance: It is recommended to use `insertTablet` for batch writes and adjust the number of rows per batch based on data volume, network, and server resources. In multi-node environments, configure `nodeUrls` so that the pool distributes load across nodes.
