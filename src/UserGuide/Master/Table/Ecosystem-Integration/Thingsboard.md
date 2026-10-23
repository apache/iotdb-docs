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

The `iotdb-thingsboard-table` module lets ThingsBoard store historical
telemetry, latest telemetry, and entity attributes in the IoTDB Table Model.
It runs inside an existing ThingsBoard installation and does not require a
custom ThingsBoard build.

This integration is independent of the earlier
[ThingsBoard Tree Model integration](../../Tree/Ecosystem-Integration/Thingsboard.md),
which requires an IoTDB-adapted ThingsBoard build.

## 1. Download

The tested combination is:

| Component | Version |
| --- | --- |
| IoTDB | 2.0.11, Table Model |
| ThingsBoard | 4.3.1.2 |
| JDK | 17 or later |

The module is part of Apache IoTDB Extras 2.0.11. Download its jar from the
[2.0.11 release](https://github.com/apache/iotdb-extras/releases/tag/v2.0.11)
and verify its signature against the
[IoTDB KEYS](https://dist.apache.org/repos/dist/release/iotdb/KEYS) file.
The module jar does not include the IoTDB client. The commands below also
download the nine required client dependency jars from Maven Central into
the same `lib/` directory.

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

Deploy all ten jars downloaded to `lib/`. You can also build the module from
the `apache-iotdb-extras-2.0.11-source-release.zip` source package.

## 2. Install

Complete the normal ThingsBoard installation before enabling IoTDB storage.
Enabling this module while running the ThingsBoard installer makes the
installation fail with a missing `TsDatabaseSchemaService` error.

1. Install and start IoTDB. See [IoTDB QuickStart](../QuickStart/QuickStart.md).

   If IoTDB and ThingsBoard run in separate containers, connect them to the
   same Docker network and configure IoTDB to use a service name that
   ThingsBoard can reach. Otherwise the `apache/iotdb:2.0.11-standalone` image
   uses `127.0.0.1` for these addresses. For an IoTDB service named `iotdb`,
   set the following environment values on the IoTDB container:

   ```yaml
   cn_seed_config_node: iotdb:10710
   dn_seed_config_node: iotdb:10710
   cn_internal_address: iotdb
   dn_internal_address: iotdb
   dn_rpc_address: iotdb
   ```

2. Install ThingsBoard using its normal installation procedure and storage
   settings. Do not apply the IoTDB configuration from section 3 to the
   installer.

3. Make all ten downloaded jars available to ThingsBoard in its extensions
   directory, `/usr/share/thingsboard/extensions`.

   For the Docker image, mount or copy them to that directory. Section 3.1
   shows a Compose mount for the `lib/` directory.

   For the Linux `.deb` package, the package does not create the directory.
   After the installation has finished, run these commands from the directory
   that contains `lib/`:

   ```bash
   sudo install -d /usr/share/thingsboard/extensions
   sudo install -m 0644 lib/*.jar /usr/share/thingsboard/extensions/
   ```

All ten jars are required even before IoTDB storage is enabled. If only the
module jar is present, ThingsBoard fails to start with:

```text
NoClassDefFoundError: org/apache/iotdb/isession/pool/ITableSessionPool
```

With all ten jars present and no IoTDB storage settings enabled, ThingsBoard
starts normally and continues to use its existing storage backends.
ThingsBoard 4.3.1.2 already includes `lz4-java`, `zstd-jni`, `snappy-java`,
and `antlr4-runtime`; do not add another copy of these libraries.

## 3. Configure

Pass the configuration to the ThingsBoard process through the
`SPRING_APPLICATION_JSON` environment variable. This keeps the property names
exactly as shown, including underscores and hyphens. Use the instructions for
your installation method below. Both examples enable all three storage paths
for one ThingsBoard node.

Set `iotdb.host`, the credentials, and the database name for your deployment.
If `SPRING_APPLICATION_JSON` already contains other settings, merge these keys
into its existing JSON object.

### 3.1 Docker

In your existing Compose file, merge the following fragment into the
ThingsBoard service. The example names that service `thingsboard`; use your
existing service name if it differs. Keep its other environment settings,
volumes, ports, and network configuration. The `lib/` directory from section 1
must be beside the Compose file, and the IoTDB service, named `iotdb`, must be
on the same Docker network as ThingsBoard.

```yaml
services:
  thingsboard:
    image: thingsboard/tb-node:4.3.1.2
    volumes:
      - ./lib:/usr/share/thingsboard/extensions:ro
    environment:
      SPRING_APPLICATION_JSON: >-
        {
          "iotdb.host": "iotdb",
          "iotdb.port": "6667",
          "iotdb.username": "root",
          "iotdb.password": "root",
          "iotdb.database": "thingsboard",
          "iotdb.session-pool-size": "8",
          "iotdb.schema.bootstrap": "true",
          "database.ts.type": "iotdb-table",
          "iotdb.ts.experimental-raw-only": "true",
          "database.ts_latest.type": "iotdb-table",
          "iotdb.ts_latest.cluster_mode": "disabled",
          "database.attributes.type": "iotdb-table",
          "iotdb.attributes.cluster_mode": "disabled"
        }
```

This is a fragment for an already installed ThingsBoard deployment, not a
complete Compose file. Apply it to the running service, not to the installer.
If you already mount the extensions directory, put the ten jars in that
directory instead of adding a second mount at the same location.

### 3.2 Linux package

For the Linux `.deb` package, add the configuration below to
`/etc/thingsboard/conf/thingsboard.conf`, alongside its existing settings. The
ThingsBoard service reads this shell file at startup, so include the `export`
and the surrounding single quotes. Exporting the variable only in your
terminal does not configure the service.

The example assumes IoTDB is reachable from the ThingsBoard service at
`127.0.0.1`. Change the host if your deployment uses another address.

```bash
export SPRING_APPLICATION_JSON='{
  "iotdb.host": "127.0.0.1",
  "iotdb.port": "6667",
  "iotdb.username": "root",
  "iotdb.password": "root",
  "iotdb.database": "thingsboard",
  "iotdb.session-pool-size": "8",
  "iotdb.schema.bootstrap": "true",
  "database.ts.type": "iotdb-table",
  "iotdb.ts.experimental-raw-only": "true",
  "database.ts_latest.type": "iotdb-table",
  "iotdb.ts_latest.cluster_mode": "disabled",
  "database.attributes.type": "iotdb-table",
  "iotdb.attributes.cluster_mode": "disabled"
}'
```

### 3.3 Choose what IoTDB stores

Keep the settings for the storage paths you want to enable:

- **Historical telemetry:** set both `database.ts.type=iotdb-table` and
  `iotdb.ts.experimental-raw-only=true`.
- **Latest telemetry:** enable historical telemetry as above, then also set
  `database.ts_latest.type=iotdb-table` and
  `iotdb.ts_latest.cluster_mode`. Latest telemetry depends on the historical
  telemetry backend because it reads from the IoTDB telemetry table.
- **Entity attributes:** set `database.attributes.type=iotdb-table` and
  `iotdb.attributes.cluster_mode`. Attributes do not require either telemetry
  backend to use IoTDB.

Use the `cluster_mode` values described in section 3.4. Omit the settings for
storage paths you do not want to enable. If you enable historical telemetry
but omit `database.ts_latest.type`, latest telemetry continues to use the
original ThingsBoard backend.

`iotdb.ts.experimental-raw-only` is the required opt-in switch for the
historical telemetry backend. Its name is retained for compatibility: enabling
it supports writes, raw reads, deletes, and time-bucketed aggregation.

The default connection settings are host `127.0.0.1`, port `6667`,
username/password `root`/`root`, database `thingsboard`, and session-pool size
`8`. Schema initialization is enabled by default
(`iotdb.schema.bootstrap=true`) and creates the database and its tables on
first start. The Docker example overrides the host with `iotdb`; running in
Docker does not change the module's default host.

### 3.4 One or several ThingsBoard nodes

When latest telemetry or attributes use IoTDB, explicitly set the corresponding
`cluster_mode` property:

- **One ThingsBoard node:** use `disabled`, as in the examples.
- **Several ThingsBoard nodes:** use `sticky-routing` only when your deployment
  sends every operation that updates or deletes each device's or entity's
  latest telemetry or attributes to the same ThingsBoard node. Configure and
  verify that routing separately; setting this property does not establish it.
- **Several nodes without that routing guarantee:** use `disabled` only if
  you accept that concurrent updates from different nodes to the same
  latest-value key or attribute may leave inconsistent results. The module
  does not coordinate these writes across nodes.

Here, a node means a ThingsBoard node, not an IoTDB node. `disabled` does not
disable latest-telemetry or attribute storage. Any other value, including an
omitted or empty value, prevents startup when the corresponding backend is
enabled.

## 4. Run and verify

1. Start ThingsBoard with the ten jars and the new configuration.

   For the Compose example, apply the configuration from the directory
   containing the Compose file. Replace `thingsboard` if your service has
   another name:

   ```bash
   docker compose up -d thingsboard
   ```

   This recreates the container when its configuration has changed.
   Restarting an existing container alone does not apply changes to its
   environment.

   For the Linux package, restart the service:

   ```bash
   sudo systemctl restart thingsboard
   ```

2. Check the log for `IoTDB Table Mode session pool initialized`. With schema
   initialization enabled, also check for
   `IoTDB Table Mode schema bootstrap complete`.

   When entity attributes use IoTDB, a warning that the module removed
   ThingsBoard's `jpaAttributeDao` bean is expected. It means the module has
   replaced the built-in attribute backend.

3. Send test telemetry and a client attribute to a ThingsBoard device. Record
   the device ID, keys, values, and timestamps that ThingsBoard shows on the
   device's **Latest telemetry** and **Attributes** tabs.

   ![ThingsBoard latest telemetry stored through the IoTDB Table Model backend](/img/thingsboard-table-telemetry.png)

   ![ThingsBoard client attributes stored through the IoTDB Table Model backend](/img/thingsboard-table-attributes.png)

4. Query IoTDB for the same device and compare the keys, values, and
   timestamps with step 3. Replace `<device-id>` with the device ID, and
   `thingsboard` if you changed the database name:

```sql
USE thingsboard;

SELECT time, key, bool_v, long_v, double_v, str_v, json_v
FROM telemetry
WHERE entity_id = '<device-id>'
ORDER BY time DESC
LIMIT 10;

SELECT time, attribute_scope, key, bool_v, long_v, double_v, str_v, json_v
FROM entity_attributes
WHERE entity_id = '<device-id>'
ORDER BY time DESC
LIMIT 10;
```

## 5. Known limitations

- IoTDB 2.0.11 and ThingsBoard 4.3.1.2 are the tested versions. Other versions
  require separate verification.
- Multi-node writes to latest telemetry and entity attributes require the
  routing arrangement, or the acceptance of inconsistent results, described in
  section 3.4.
- Latest telemetry depends on the IoTDB historical telemetry backend. The
  module also handles writes and deletes that affect only the latest value;
  see the module's user guide for those operations.
- Retention uses IoTDB table-level TTL. See the module's
  [user guide](https://github.com/apache/iotdb-extras/blob/v2.0.11/iotdb-thingsboard-table/docs/user-guide.md)
  for its mapping to ThingsBoard retention settings.

For source builds, migration guidance, and implementation details, see the
[`iotdb-thingsboard-table` module](https://github.com/apache/iotdb-extras/tree/v2.0.11/iotdb-thingsboard-table).
