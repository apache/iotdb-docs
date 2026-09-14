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

The Node.js native API supports interacting with the IoTDB table model through `TableSessionPool`, enabling data insertion, queries, non-query SQL, and connection management under the table model. Building on connection pool capabilities, `TableSessionPool` adds database context management, making it suitable for accessing relational table data in Node.js applications.

This document focuses on the usage of `TableSessionPool`, covering environment preparation, core steps, and common interfaces.

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

The three core steps of operating the IoTDB table model with the Node.js native API are as follows:

1. Create a connection pool instance: initialize a `TableSessionPool` object with connection parameters, database, and pool size.
2. Execute database operations: perform table creation, data insertion, or queries directly through the connection pool.
3. Close the connection pool: call `tablePool.close()` when the program ends to release all connections.

The following sections describe the core development workflow and do not demonstrate all parameters and interfaces. For the complete capabilities, refer to the [`@iotdb/client` source code](https://github.com/apache/iotdb-client-nodejs/tree/develop/src) and [examples](https://github.com/apache/iotdb-client-nodejs/tree/develop/examples).

### 2.1 Creating a Connection Pool Instance

#### 2.1.1 Single-Node Connection

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

Here `database` sets the default database for the table model. Once configured, the connection pool uses this database context for queries and writes.

#### 2.1.2 Multi-Node Connection

In a cluster environment, it is recommended to configure multiple nodes with `nodeUrls`. The connection pool distributes connections across nodes in a round-robin manner and tries other available nodes when a connection fails.

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

Connection pool parameters can be adjusted according to your workload: `minPoolSize` is recommended to be set to the average concurrent load, while `maxPoolSize` should be set to the peak concurrent load with a 20% to 30% buffer. `maxIdleTime` is used to clean up long-idle connections, and `waitTimeout` controls the maximum waiting time when the pool is exhausted. In production, it is recommended to monitor `getPoolSize()`, `getAvailableSize()`, and `getInUseSize()`, and adjust the pool size based on peak load.

#### 2.1.3 SSL/TLS Connection

If SSL/TLS is enabled on the IoTDB server, you can enable SSL when creating the connection pool and specify certificate-related parameters.

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

#### 2.1.4 Write Redirection

In a multi-node IoTDB cluster, the client supports write redirection. When a write operation is sent to a non-target node, the server may return a redirection hint. The client caches the target route and prefers a more suitable node for subsequent writes.

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

With redirection enabled, cross-node forwarding is reduced, improving write throughput and lowering network latency.

### 2.2 Database Operations

#### 2.2.1 Creating a Database and a Table

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

#### 2.2.2 Inserting Tablet Data

When writing in the table model, you need to specify the table name, column names, data types, timestamps, and values. The following example organizes `values` by column, where each array corresponds to a non-time column.

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

If your project does not use the enums directly, `columnTypes` can also use data type codes.

For data insertion, it is recommended to use `insertTablet` for batch writes to reduce network round trips. A common batch size to start with is 100 to 1000 rows, then adjust based on data volume, network, and server resources.

#### 2.2.3 Querying Data

Query results are returned through `SessionDataSet`. Call `close()` after use to release server-side query resources.

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

For small result sets, you can also use `toArray()` to load all results into memory:

```typescript
const dataSet = await tablePool.executeQueryStatement('SHOW TABLES');
const rows = await dataSet.toArray();
console.log(rows);
await dataSet.close();
```

### 2.3 Closing the Connection Pool

```typescript
await tablePool.close();
```

It is recommended to close the connection pool uniformly when the application exits, a scheduled task ends, or the service is destroyed, to avoid connection leaks.

## 3. Common Interfaces

### 3.1 TableSessionPool

#### 3.1.1 Description

`TableSessionPool` is the recommended connection pool interface for the table model. It supports automatic session management and database context management. When a query, insert, or non-query method is called, the pool automatically acquires an available session and recycles the connection after execution.

#### 3.1.2 Constructors

| Constructor | Description |
| --- | --- |
| `new TableSessionPool(host, port, config)` | Traditional constructor, suitable for single-node connections |
| `new TableSessionPool(config)` | Constructed with a configuration object, suitable for `nodeUrls` multi-node configurations |
| `new TableSessionPool(new PoolConfigBuilder().build())` | Constructed with the builder pattern, recommended when there are many parameters |

#### 3.1.3 Methods

| Method | Description |
| --- | --- |
| `init()` | Initializes the connection pool |
| `close()` | Closes the connection pool and releases all connections |
| `executeQueryStatement(sql, timeoutMs?)` | Executes a query SQL, with an optional query timeout |
| `executeNonQueryStatement(sql)` | Executes a non-query SQL, such as DDL or DML |
| `insertTablet(tablet)` | Inserts table model Tablet data |
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

### 3.2 Tablet Parameters

The common parameters of `insertTablet` in the table model are as follows:

| Parameter | Description |
| --- | --- |
| `tableName` | Target table name |
| `columnNames` | List of non-time column names |
| `dataTypes` | List of data types for non-time columns |
| `columnCategories` | List of categories for non-time columns |
| `timestamps` | List of timestamps |
| `values` | List of column values, organized by column |

The orders of `columnNames`, `columnTypes`, `columnCategories`, and `values` must be consistent.

## 4. Data Types

When inserting Tablet data, you need to specify the corresponding data type for each column. The common types supported by the Node.js client are as follows:

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

1. Default database does not exist: If the configured `database` does not exist when the connection pool is initialized, first execute `CREATE DATABASE`, then explicitly execute `USE database_name` before creating tables, querying, or writing. Alternatively, create the database before initializing `TableSessionPool`.

2. Column mismatch: If a column count or type mismatch occurs during insertion, check whether the orders and lengths of `columnNames`, `columnTypes`, `columnCategories`, and `values` are consistent, and confirm that `values` are organized by row and the table schema matches the written data.

3. Query results consume too much memory: For large result sets, it is recommended to read in batches with `hasNext()` and `next()` and reduce `fetchSize`. Use `toArray()` only for small result sets.

4. Connection acquisition timeout: If waiting for an available connection times out, the pool is usually exhausted. Increase `waitTimeout` or `maxPoolSize` as appropriate, and check whether there are query result sets that have not been closed for a long time.
