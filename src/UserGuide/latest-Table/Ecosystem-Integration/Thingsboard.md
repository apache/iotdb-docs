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

# ThingsBoard

The `iotdb-thingsboard-table` module lets a stock ThingsBoard deployment store
historical telemetry, latest telemetry, and entity attributes in the IoTDB Table
Model. This page follows the operator workflow: download, install, configure,
run, and verify.

This integration is independent of the earlier
[ThingsBoard Tree Model integration](../../latest/Ecosystem-Integration/Thingsboard.md),
which requires an IoTDB-adapted ThingsBoard build.

## 1. Download

The tested combination is:

| Component | Version |
| --- | --- |
| IoTDB | 2.0.11, Table Model |
| ThingsBoard | 4.3.1.2 |
| JDK | 17 or later |

The module is part of the Apache IoTDB Extras 2.0.11 release. Its jar is
attached to the
[2.0.11 release](https://github.com/apache/iotdb-extras/releases/tag/v2.0.11)
with a signature that can be checked against the
[IoTDB KEYS](https://dist.apache.org/repos/dist/release/iotdb/KEYS) file. The
jar does not contain the IoTDB client, so the nine client jars it needs are
downloaded from Maven Central into the same `lib/` directory:

```bash
mkdir -p lib
R=https://github.com/apache/iotdb-extras/releases/download/v2.0.11
curl -fL -o lib/iotdb-thingsboard-table-2.0.11.jar $R/iotdb-thingsboard-table-2.0.11.jar
curl -fLO $R/iotdb-thingsboard-table-2.0.11.jar.asc
curl -fL https://dist.apache.org/repos/dist/release/iotdb/KEYS | gpg --import
gpg --verify iotdb-thingsboard-table-2.0.11.jar.asc lib/iotdb-thingsboard-table-2.0.11.jar

M=https://repo1.maven.org/maven2
for path in \
    org/apache/iotdb/iotdb-session/2.0.11/iotdb-session-2.0.11.jar \
    org/apache/iotdb/isession/2.0.11/isession-2.0.11.jar \
    org/apache/iotdb/service-rpc/2.0.11/service-rpc-2.0.11.jar \
    org/apache/iotdb/iotdb-thrift/2.0.11/iotdb-thrift-2.0.11.jar \
    org/apache/iotdb/iotdb-thrift-commons/2.0.11/iotdb-thrift-commons-2.0.11.jar \
    org/apache/thrift/libthrift/0.23.0/libthrift-0.23.0.jar \
    org/apache/tsfile/tsfile/2.4.0/tsfile-2.4.0.jar \
    org/apache/tsfile/common/2.4.0/common-2.4.0.jar \
    org/tukaani/xz/1.10/xz-1.10.jar; do
  curl -fL -o "lib/${path##*/}" "$M/$path"
done
```

`lib/` then holds the ten jars to deploy. The module can also be built from the
`apache-iotdb-extras-2.0.11-source-release.zip` source package.

## 2. Install

ThingsBoard must be installed before the IoTDB selectors are enabled. Its
installer resolves a `TsDatabaseSchemaService` supplied by the built-in
backends, so enabling this module during installation makes the installation
fail.

1. Install and start IoTDB. See [IoTDB QuickStart](../QuickStart/QuickStart.md).

   When IoTDB 2.0.11 and ThingsBoard run in separate containers, put them on the
   same Docker network and make IoTDB advertise a reachable service name. The
   `2.0.11-standalone` image otherwise binds these endpoints to `127.0.0.1`.
   For an IoTDB service named `iotdb`, set:

   ```yaml
   cn_seed_config_node: iotdb:10710
   dn_seed_config_node: iotdb:10710
   cn_internal_address: iotdb
   dn_internal_address: iotdb
   dn_rpc_address: iotdb
   ```

2. Install ThingsBoard normally without any of the properties from section 3.
3. Place the ten jars from `lib/` on the ThingsBoard classpath. All ten are
   needed even while no selector is set: with the module jar alone, ThingsBoard
   fails to start with
   `NoClassDefFoundError: org/apache/iotdb/isession/pool/ITableSessionPool`.

For the ThingsBoard Docker image, mount or copy the jars to
`/usr/share/thingsboard/extensions`; its `PropertiesLauncher` already includes
that directory through `LOADER_PATH`. Other installation formats may use a
different classpath extension mechanism.

The deployment directory contains exactly ten jars: the module, `iotdb-session`,
`isession`, `service-rpc`, `iotdb-thrift`, `iotdb-thrift-commons`, `libthrift`,
`tsfile`, `common`, and `xz`. ThingsBoard already ships the other libraries the
IoTDB client uses (`lz4-java`, `zstd-jni`, `snappy-java` and `antlr4-runtime`),
so do not add copies of them.

## 3. Configure

Add the properties for the storage paths you want to move to IoTDB. The
following example enables all three paths for a single-node deployment:

```properties
# IoTDB connection
# Docker service name; use 127.0.0.1 only when both processes share a host
iotdb.host=iotdb
iotdb.port=6667
iotdb.username=root
iotdb.password=root
iotdb.database=thingsboard
iotdb.session-pool-size=8
iotdb.schema.bootstrap=true

# Historical telemetry
database.ts.type=iotdb-table
iotdb.ts.experimental-raw-only=true

# Latest telemetry
database.ts_latest.type=iotdb-table
iotdb.ts_latest.cluster_mode=disabled

# Entity attributes
database.attributes.type=iotdb-table
iotdb.attributes.cluster_mode=disabled
```

The historical and latest selectors are separate. Omitting
`database.ts_latest.type` leaves latest values on the original ThingsBoard
backend even when historical telemetry is stored in IoTDB.

The example writes the connection defaults explicitly. Outside Docker,
`iotdb.host` defaults to `127.0.0.1`; the other defaults are port `6667`,
username/password `root`/`root`, database `thingsboard`, session-pool size `8`,
and schema bootstrap enabled.

When latest telemetry or attributes are enabled, their `cluster_mode` must be
set explicitly:

- `sticky-routing`: route writes for one identity to one node.
- `disabled`: single-node deployment, or explicitly accept best-effort
  convergence.

Any other value, including an empty value, stops startup with an explanatory
error.

## 4. Run and verify

1. Restart ThingsBoard after the bundle and configuration are in place.
2. Check the log for `IoTDB Table Mode session pool initialized`. With schema
   bootstrap enabled, also check for `IoTDB Table Mode schema bootstrap
   complete`.
3. Send test telemetry and attributes to a ThingsBoard device, then confirm
   them on the device's **Latest telemetry** and **Attributes** pages.

   ![ThingsBoard latest telemetry stored through the IoTDB Table Model backend](/img/thingsboard-table-telemetry.png)

   ![ThingsBoard client attributes stored through the IoTDB Table Model backend](/img/thingsboard-table-attributes.png)

4. Confirm the same values in IoTDB:

```sql
USE thingsboard;

SELECT *
FROM telemetry
ORDER BY time DESC
LIMIT 10;

SELECT *
FROM entity_attributes
ORDER BY time DESC
LIMIT 10;
```

## 5. Known limitations

- IoTDB 2.0.11 and ThingsBoard 4.3.1.2 are the tested versions. Other 2.x or
  ThingsBoard versions require separate verification.
- Attribute and latest-overlay writes converge within one JVM. A multi-writer
  deployment must use sticky routing or explicitly accept best-effort
  convergence.
- The latest-value path is derived from the telemetry table, with a small
  overlay for latest-only writes and deletes.
- Retention uses IoTDB table-level TTL. See the module's
  [user guide](https://github.com/apache/iotdb-extras/blob/v2.0.11/iotdb-thingsboard-table/docs/user-guide.md)
  for its mapping to ThingsBoard retention settings.

Design, source-build, migration, and compile-surface verification details remain
in the
[`iotdb-thingsboard-table` module](https://github.com/apache/iotdb-extras/tree/v2.0.11/iotdb-thingsboard-table).
