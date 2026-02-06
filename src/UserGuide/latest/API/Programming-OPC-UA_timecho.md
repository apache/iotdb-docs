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

# OPC UA Protocol

## 1. Overview

This document describes two independent operational modes for IoTDB's integration with the OPC UA protocol. Choose the mode based on your business scenario:

* **Mode 1: Data Subscription Service (IoTDB as OPC UA Server)**: IoTDB starts an embedded OPC UA server to passively allow external clients (e.g., UAExpert) to connect and subscribe to its internal data. This is the traditional usage.
* **Mode 2: Data Push (IoTDB as OPC UA Client)**: IoTDB acts as a client to actively synchronize data and metadata to one or more independently deployed external OPC UA servers.
  > Note: This mode is supported starting from V2.0.8.

**Note: Modes are mutually exclusive**
When the Pipe configuration specifies the `node-urls` parameter (Mode 2), IoTDB will **not** start the embedded OPC UA server (Mode 1). These two modes **cannot be used simultaneously** within the same Pipe.

## 2. Data Subscription

This mode supports users subscribing to data from IoTDB using the OPC UA protocol, with communication modes supporting both Client/Server and Pub/Sub.

Note: This feature does **not** involve collecting data from external OPC Servers into IoTDB.

![](/img/opc-ua-new-1-en.png)

### 2.1 OPC Service Startup

#### 2.1.1 Syntax

Syntax for starting OPC UA protocol:

```SQL
CREATE PIPE p1 
    WITH SOURCE (...) 
    WITH PROCESSOR (...) 
    WITH SINK ('sink' = 'opc-ua-sink', 
               'sink.opcua.tcp.port' = '12686', 
               'sink.opcua.https.port' = '8443', 
               'sink.user' = 'root', 
               'sink.password' = 'TimechoDB@2021',  // Default password was 'root' before V2.0.6.x
               'sink.opcua.security.dir' = '...'
              )
```

#### 2.1.2 Parameters

| **Parameter**                     | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | **Value Range**                                                                                                                     | **Required** | **Default Value**                                                                                                                                                                          |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |-------------------------------------------------------------------------------------------------------------------------------------| -------------------- |----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| sink                               | OPC UA SINK                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | String: opc-ua-sink                                                                                                                 | Required             |                                                                                                                                                                                  |
| sink.opcua.model                   | OPC UA operational mode                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | String: client-server / pub-sub                                                                                                     | Optional             | client-server                                                                                                                                                                    |
| sink.opcua.tcp.port                | OPC UA TCP port                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Integer: [0, 65536]                                                                                                                 | Optional             | 12686                                                                                                                                                                            |
| sink.opcua.https.port              | OPC UA HTTPS port                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Integer: [0, 65536]                                                                                                                 | Optional             | 8443                                                                                                                                                                             |
| sink.opcua.security.dir            | OPC UA key and certificate directory                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | String: Path (supports absolute/relative paths)                                                                                     | Optional             | 1. `opc_security` folder under IoTDB's DataNode conf directory `/`. 2. User home directory's `iotdb_opc_security` folder `/` if no IoTDB conf directory exists (e.g., when starting DataNode in IDEA) |
| opcua.security-policy              | Security policy used for OPC UA connections (case-insensitive). Multiple policies can be configured and separated by commas. After configuring one policy, clients can only connect using that policy. Default implementation supports `None` and `Basic256Sha256`. Should be set to a non-`None` policy by default. `None` policy is only for debugging (convenient but insecure; not recommended for production). Note: Supported since V2.0.8, only for client-server mode. | String (security level increases):`None`,`Basic128Rsa15`,`Basic256`,`Basic256Sha256`,`Aes128_Sha256_RsaOaep`,`Aes256_Sha256_RsaPss` | Optional | `Basic256Sha256,Aes128_Sha256_RsaOaep,Aes256_Sha256_RsaPss`                                                                                                                 |
| sink.opcua.enable-anonymous-access | Whether OPC UA allows anonymous access                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Boolean                                                                                                                             | Optional             | true                                                                                                                                                                             |
| sink.user                          | User (OPC UA allowed user)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | String                                                                                                                              | Optional             | root                                                                                                                                                                             |
| sink.password                      | Password (OPC UA allowed password)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | String                                                                                                                              | Optional             | TimechoDB@2021 (Default was 'root' before V2.0.6.x)                                                                                                                                             |
| opcua.with-quality                 | Whether OPC UA publishes data in value + quality mode. When enabled, system processes data as follows:1. Both value and quality present → Push directly to OPC UA Server.2. Only value present → Quality automatically filled as UNCERTAIN (default, configurable).3. Only quality present → Ignore write (no processing).4. Non-value/quality fields present → Ignore data and log warning (configurable log frequency to avoid high-frequency interference).5. Quality type restriction: Only boolean type supported (true = GOOD, false = BAD).**Note**: Supported since V2.0.8, only for client-server mode | Boolean                                                                                                                             | Optional             | false                                                                                                                                                                            |
| opcua.value-name                   | Effective when `with-quality` = true, specifies the name of the value point. **Note**: Supported since V2.0.8, only for client-server mode                                                                                                                                                                                                                                                                                                                                                                                                         | String                                                                                                                              | Optional             | value                                                                                                                                                                            |
| opcua.quality-name                 | Effective when `with-quality` = true, specifies the name of the quality point. **Note**: Supported since V2.0.8, only for client-server mode                                                                                                                                                                                                                                                                                                                                                                                                       | String                                                                                                                              | Optional             | quality                                                                                                                                                                          |
| opcua.default-quality              | When no quality is provided, specify `GOOD`/`UNCERTAIN`/`BAD` via SQL parameter. **Note**: Supported since V2.0.8, only for client-server mode                                                                                                                                                                                                                                                                                                                                                                                             | String: `GOOD`/`UNCERTAIN`/`BAD`                                                                                                    | Optional             | `UNCERTAIN`                                                                                                                                                                      |
| opcua.timeout-seconds              | Client connection timeout in seconds (effective only when IoTDB acts as client). **Note**: Supported since V2.0.8, only for client-server mode                                                                                                                                                                                                                                                                                                                                                                                             | Long                                                                                                                                | Optional             | 10L                                                                                                                                                                              |

#### 2.1.3 Example

```Bash
CREATE PIPE p1 
    WITH SINK ('sink' = 'opc-ua-sink',
               'sink.user' = 'root', 
               'sink.password' = 'TimechoDB@2021');  // Default password was 'root' before V2.0.6.x
START PIPE p1;
```

#### 2.1.4 Usage Restrictions

1. Data must be written after protocol startup to establish connection. Only data written *after* connection can be subscribed.
2. Recommended for single-node mode. In distributed mode, each IoTDB DataNode acts as an independent OPC Server; separate subscriptions are required for each.

### 2.2 Example of Two Communication Modes

#### 2.2.1 Client/Server Mode

In this mode, IoTDB's stream processing engine establishes a connection with the OPC UA Server (Server) via OPC UA Sink. The OPC UA Server maintains data in its address space (Address Space), and IoTDB can request and retrieve this data. Other OPC UA clients (Clients) can also access the server's data.

* **Features**:
    * OPC UA organizes device information received from Sink into folders under Objects folder in tree structure.
    * Each point is recorded as a variable node with the latest value in the current database.
    * OPC UA cannot delete data or change data type settings.

##### 2.2.1.1 Preparation

1. Example using UAExpert client: Download UAExpert client from https://www.unified-automation.com/downloads/opc-ua-clients.html
2. Install UAExpert and configure certificate information.

##### 2.2.1.2 Quick Start

1. Start OPC UA service using SQL (detailed syntax see [IoTDB OPC Server Syntax](./Programming-OPC-UA_timecho.md#_2-1-语法)):

```SQL
CREATE PIPE p1 WITH SINK ('sink'='opc-ua-sink');
```

2. Write some data:

```SQL
INSERT INTO root.test.db(time, s2) VALUES(NOW(), 2);
```

3. Configure UAExpert to connect to IoTDB (password matches `sink.password` configured above, e.g., root/TimechoDB@2021):
4. Trust the server certificate, then view written data under Objects folder on the left:
5. Drag left nodes to the middle to display latest value:

#### 2.2.2 Pub/Sub Mode

In this mode, IoTDB's stream processing engine sends data change events to the OPC UA Server (Server) via OPC UA Sink. These events are published to the server's message queue and managed via Event Nodes. Other OPC UA clients (Clients) can subscribe to these Event Nodes to receive notifications when data changes.

* **Features**:

    * Each point is packaged as an Event Node (EventNode) by OPC UA.
    * Related fields and meanings:

      | Field        | Meaning             | Type (Milo)   | Example                 |
      | ------------ | ------------------ | -------------- | ----------------------- |
      | Time       | Timestamp           | DateTime      | 1698907326198         |
      | SourceName | Full path of point  | String        | root.test.opc.sensor0 |
      | SourceNode | Data type of point  | NodeId        | Int32                 |
      | Message    | Data                | LocalizedText | 3.0                   |



- Events are sent only to currently subscribed clients. Unconnected clients ignore events.
- Deleted data cannot be pushed to clients.

##### 2.2.2.1 Preparation

Code located in `example/pipe-opc-ua-sink/src/main/java/org/apache/iotdb/opcua` of iotdb-example package.

Contains:

- Main class (`ClientTest`)
- Client certificate logic (`IoTDBKeyStoreLoaderClient`)
- Client configuration and startup logic (`ClientExampleRunner`)
- Parent class for `ClientTest` (`ClientExample`)

##### 2.2.2.2 Quick Start

1. Open IoTDB and write some data:

```SQL
INSERT INTO root.a.b(time, c, d) VALUES(NOW(), 1, 2);  // Auto-creates metadata
```

2. Create and start Pub/Sub mode OPC UA Sink:

```SQL
CREATE PIPE p1 WITH SINK ('sink'='opc-ua-sink', 'sink.opcua.model'='pub-sub');
START PIPE p1;
```

3. Observe server creates OPC certificate directory under conf:
4. Run Client to connect, but server rejects Client certificate:
5. Enter server's `sink.opcua.security.dir` → `pki` → `rejected` directory, find Client's certificate:
6. Move Client's certificate (not copy) to `trusted/certs` directory:
7. Reopen Client → server certificate rejected by Client:
8. Enter client's `<java.io.tmpdir>/client/security` → `pki` → `rejected` → move server's certificate (not copy) to `trusted`:
9. Open Client → successful bidirectional trust, connection established.
10. Write data to server → Client prints received data:

#### 2.2.3 Notes

1. **Single-node vs Cluster**: Recommend single-node (1C1D). In cluster with multiple DataNodes, data may be distributed across nodes, preventing full data subscription.
2. **No root certificate operations**: No need to handle IoTDB's root security directory `iotdb-server.pfx` or client security directory `example-client.pfx`. During bidirectional connection, root certificates are exchanged. New certificates are placed in `rejected` directory; if in `trusted/certs`, they're trusted.
3. **Recommended Java 17+**: JDK 8 may have key size restrictions causing "Illegal key size" errors. For specific versions (e.g., jdk.1.8u151+), add `Security.setProperty("crypto.policy", "unlimited");` in `ClientExampleRunner.createClient()`, or replace `JDK/jre/lib/security/local_policy.jar` and `US_export_policy.jar` with unlimited versions from https://www.oracle.com/java/technologies/javase-jce8-downloads.html.
4. **Connection issues**: If error is "Unknown host", modify `/etc/hosts` on IoTDB DataNode machine to add target machine's URL and hostname.

## 3. Data Push

In this mode, IoTDB acts as an OPC UA client via Pipe to actively push selected data (including quality code) to one or more external OPC UA servers. External servers automatically create directory trees and nodes based on IoTDB's metadata.

![](/img/opc-ua-data-push-en.png)

### 3.1 OPC Service Startup

#### 3.1.1 Syntax

Syntax for starting OPC UA protocol:

```SQL
CREATE PIPE p1 
    WITH SOURCE (...) 
    WITH PROCESSOR (...) 
    WITH SINK ('sink' = 'opc-ua-sink', 
               'opcua.node-url' = '127.0.0.1:12686', 
               'opcua.historizing' = 'true', 
               'opcua.with-quality' = 'true' 
              )
```

#### 3.1.2 Parameters

| **Parameter**                | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | **Value Range**                                                                                                                     | **Required** | **Default Value**   |
|-----------------------| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |-------------------------------------------------------------------------------------------------------------------------------------| -------------------- | -------------------- |
| sink                  | OPC UA SINK                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | String: opc-ua-sink                                                                                                                 | Required             |                    |
| opcua.node-url        | Comma-separated OPC UA TCP ports. When specified, IoTDB **does not** start local server but sends data to configured OPC UA Server.                                                                                                                                                                                                                                                                                                                                                                 | String                                                                                                                              | Optional             | `''`           |
| opcua.historizing     | When automatically creating directories and leaf nodes, whether to store historical data in new nodes.                                                                                                                                                                                                                                                                                                                                                                                                                           | Boolean                                                                                                                             | Optional             | false              |
| opcua.with-quality    | Whether OPC UA publishes data in value + quality mode. When enabled, system processes data as follows:1. Both value and quality present → Push directly to OPC UA Server.2. Only value present → Quality automatically filled as UNCERTAIN (default, configurable).3. Only quality present → Ignore write (no processing).4. Non-value/quality fields present → Ignore data and log warning (configurable log frequency).5. Quality type restriction: Only boolean type supported (true = GOOD, false = BAD). | Boolean                                                                                                                             | Optional             | false                                                                                                                                                                            |
| opcua.value-name      | Effective when `with-quality` = true, specifies the name of the value point.                                                                                                                                                                                                                                                                                                                                                                                                                              | String                                                                                                                              | Optional             | value                                                                                                                                                                            |
| opcua.quality-name    | Effective when `with-quality` = true, specifies the name of the quality point.                                                                                                                                                                                                                                                                                                                                                                                                                             | String                                                                                                                              | Optional             | quality                                                                                                                                                                          |
| opcua.default-quality | When no quality is provided, specify `GOOD`/`UNCERTAIN`/`BAD` via SQL parameter.                                                                                                                                                                                                                                                                                                                                                                                                   | String: `GOOD`/`UNCERTAIN`/`BAD`                                                                                                    | Optional             | `UNCERTAIN`                                                                                                                                                                      |
| opcua.security-policy | OPC UA client security policy (case-insensitive), URL format: `http://opcfoundation.org/UA/SecurityPolicy#`, e.g., `http://opcfoundation.org/UA/SecurityPolicy#Aes128_Sha256_RsaOaep`                                                                                                                              | String (security level increases):`None`,`Basic128Rsa15`,`Basic256`,`Basic256Sha256`,`Aes128_Sha256_RsaOaep`,`Aes256_Sha256_RsaPss` | Optional | `Basic256Sha256`                                                                                                                 |
| opcua.timeout-seconds | Client connection timeout in seconds (effective only when IoTDB acts as client)                                                                                                                                                                                                                                                                                                                                                                                                                        | Long                                                                                                                                | Optional             | 10L                                                                                                                                                                              |

> **Parameter Naming Note**: All parameters support omitting `opcua.` prefix (e.g., `node-urls` and `opcua.node-urls` are equivalent).
>
> **Support Note**: All `opcua.` parameters are supported starting from V2.0.8, and only for `client-server` mode.

#### 3.1.3 Example

```Bash
CREATE PIPE p1 
    WITH SOURCE (...) 
    WITH PROCESSOR (...) 
    WITH SINK ('sink' = 'opc-ua-sink', 
               'node-urls' = '127.0.0.1:12686', 
               'historizing' = 'true', 
               'with-quality' = 'true' 
              )
```

#### 3.1.4 Usage Restrictions

1. Current mode **only supports `client-server` mode and tree model data**.
2. Do not configure multiple DataNodes on one machine to avoid port conflicts.
3. **Does not support** `OBJECT` type data push.
4. When a time series is renamed, OPC UA Sink automatically deletes the old path and pushes data to the new path.
5. **Strongly recommended** to use non-`None` security policy (e.g., `Basic256Sha256`) with proper bidirectional certificate trust in production.

### 3.2 External OPC UA Server Project

IoTDB supports a standalone external Server project. This Server implements the same configuration as IoTDB's embedded Server but requires additional support for dynamically creating directories and leaf nodes based on IoTDB's metadata.

Configuration is injected via command-line args when starting the Server (no YAML/XML support). Parameter keys match IoTDB OPC Server configuration items, with dots (`.`) and hyphens (`-`) replaced by underscores (`_`).

Example:

```SQL
./start-IoTDB-opc-server.sh -enable_anonymous_access true -u root -pw root -https_port 8443
```

Where `user` and `password` can be abbreviated as `-u` and `-p`. All other parameter keys match configuration items. Note: `userName` is **not** a valid parameter key; only `user` is supported.

### 3.3 Scenario Example

**Goal**: Aggregate data from multiple sources to 3 external OPC Servers for unified monitoring center access.

![](/img/opc-ua-data-push-example-en.png)

1. **Preparation**: Start external OPC UA Server (port 12686) on three servers (`ip1`, `ip2`, `ip3`).
2. **Configure Pipes**: Create 3 Pipes in IoTDB, using `processor` or `source` path patterns to filter data by region and push to corresponding Servers.
   ```SQL
   -- Start IoTDB
   ./start-standalone.sh
   
   -- Start three OPC UA Servers (on ip1, ip2, ip3)
   ./start-IoTDB-external-opc-server.sh -enable-anonymous-access true -u root -pw root
   
   -- Create three Pipes
   ./start-cli.sh
   CREATE PIPE p1 
       WITH SOURCE (<ip1 credentials>) 
       WITH PROCESSOR (...) 
       WITH SINK ('sink' = 'opc-ua-sink', 
                  'node-urls' = 'ip1:12686', 
                  'historizing' = 'true',
                  'with-quality' = 'true' 
                 );
   CREATE PIPE p2 
       WITH SOURCE (<ip2 credentials>) 
       WITH PROCESSOR (...) 
       WITH SINK ('sink' = 'opc-ua-sink', 
                  'node-urls' = 'ip2:12686', 
                  'historizing' = 'true', 
                  'with-quality' = 'true' 
                 );
   CREATE PIPE p3 
       WITH SOURCE (<ip3 credentials>) 
       WITH PROCESSOR (...) 
       WITH SINK ('sink' = 'opc-ua-sink', 
                  'node-urls' = 'ip3:12686', 
                  'historizing' = 'true', 
                  'with-quality' = 'true' 
                 );
   ```
3. **Result**: The monitoring center only needs to connect to `ip1`, `ip2`, and `ip3` to access the complete data view from all regions, with quality information attached.
