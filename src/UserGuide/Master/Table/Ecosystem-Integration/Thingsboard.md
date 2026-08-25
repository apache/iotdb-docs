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
[ThingsBoard Tree Model integration](../../Tree/Ecosystem-Integration/Thingsboard.md),
which requires an IoTDB-adapted ThingsBoard build.

## 1. Download

The tested combination is:

| Component | Version |
| --- | --- |
| IoTDB | 2.0.8, Table Model |
| ThingsBoard | 4.3.1.2 |
| JDK | 17 or later |

This module is not yet included in an ASF release. Build it from the official
`apache/iotdb-extras` source at commit `275043ed` or later:

```bash
git clone https://github.com/apache/iotdb-extras.git
cd iotdb-extras
git checkout 275043ed
mvn -P with-thingsboard -pl iotdb-thingsboard-table -am clean package
mvn -P with-thingsboard -pl iotdb-thingsboard-table -am \
    dependency:copy-dependencies -DincludeScope=runtime \
    -DoutputDirectory="$PWD/runtime-deps"
```

The second command intentionally produces an unfiltered dependency directory.
Section 2 lists the exact runtime jars to deploy; do not copy the directory as
a whole.

## 2. Install

ThingsBoard must be installed before the IoTDB selectors are enabled. Its
installer resolves a `TsDatabaseSchemaService` supplied by the built-in
backends, so enabling this module during installation makes the installation
fail.

1. Install and start IoTDB. See [IoTDB QuickStart](../QuickStart/QuickStart.md).

   When IoTDB 2.0.8 and ThingsBoard run in separate containers, put them on the
   same Docker network and make IoTDB advertise a reachable service name. The
   `2.0.8-standalone` image otherwise binds these endpoints to `127.0.0.1`.
   For an IoTDB service named `iotdb`, set:

   ```yaml
   cn_seed_config_node: iotdb:10710
   dn_seed_config_node: iotdb:10710
   cn_internal_address: iotdb
   dn_internal_address: iotdb
   dn_rpc_address: iotdb
   ```

2. Install ThingsBoard normally without any of the properties from section 3.
3. Create a deployment `lib/` directory containing the module's binary jar from
   `iotdb-thingsboard-table/target/` and the ten runtime jars listed below from
   `runtime-deps/`. Place all eleven jars on the ThingsBoard classpath.

For the ThingsBoard Docker image, mount or copy the jars to
`/usr/share/thingsboard/extensions`; its `PropertiesLauncher` already includes
that directory through `LOADER_PATH`. Other installation formats may use a
different classpath extension mechanism.

The deployment directory contains exactly eleven jars: the module, `iotdb-session`,
`isession`, `service-rpc`, `iotdb-thrift`, `iotdb-thrift-commons`, `libthrift`,
`pipe-api`, `tsfile`, `common`, and `xz`. Do not add the unfiltered Maven runtime
directory: it contains older copies of libraries already supplied by
ThingsBoard. In particular, `antlr4-runtime` 4.9.3 shadows ThingsBoard's 4.13.0
copy and prevents Spring Data JPA from starting.

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

Attributes require a build containing
[apache/iotdb-extras#125](https://github.com/apache/iotdb-extras/pull/125),
merged as commit `275043ed`. Earlier builds cannot enable the attributes
selector on stock ThingsBoard.

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

- IoTDB 2.0.8 and ThingsBoard 4.3.1.2 are the tested versions. Other 2.x or
  ThingsBoard versions require separate verification.
- Attribute and latest-overlay writes converge within one JVM. A multi-writer
  deployment must use sticky routing or explicitly accept best-effort
  convergence.
- The latest-value path is derived from the telemetry table, with a small
  overlay for latest-only writes and deletes.
- Retention uses IoTDB table-level TTL. See the module's
  [user guide](https://github.com/apache/iotdb-extras/blob/master/iotdb-thingsboard-table/docs/user-guide.md)
  for its mapping to ThingsBoard retention settings.

Design, source-build, migration, and compile-surface verification details remain
in the
[`iotdb-thingsboard-table` module](https://github.com/apache/iotdb-extras/tree/master/iotdb-thingsboard-table).
