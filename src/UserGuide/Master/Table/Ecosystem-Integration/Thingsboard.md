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

The `iotdb-thingsboard-table` module lets a standard ThingsBoard deployment
store its historical telemetry, latest telemetry values and entity attributes in
the IoTDB table model. Each of the three kinds of data can be moved to IoTDB on
its own. This page walks through download, installation, configuration and
verification.

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

The module is part of the Apache IoTDB Extras 2.0.11 release. Its jar is
attached to the
[2.0.11 release](https://github.com/apache/iotdb-extras/releases/tag/v2.0.11)
together with a signature, which can be checked against the
[IoTDB KEYS](https://dist.apache.org/repos/dist/release/iotdb/KEYS) file. The
module jar does not include the IoTDB client, so nine client jars are needed as
well. The following commands download all ten jars into a `lib/` directory and
verify the module's signature:

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

The other libraries the IoTDB client uses (`lz4-java`, `zstd-jni`,
`snappy-java` and `antlr4-runtime`) are already part of ThingsBoard; do not add
copies of them. The module can also be built from the
`apache-iotdb-extras-2.0.11-source-release.zip` source package.

## 2. Install

Install ThingsBoard before you enable the module. The ThingsBoard installer
needs ThingsBoard's own storage backends; if the IoTDB settings from section 3
are already present, the installer stops with
`No qualifying bean of type 'org.thingsboard.server.service.install.TsDatabaseSchemaService' available`.

1. Install and start IoTDB. See [IoTDB QuickStart](../QuickStart/QuickStart.md).

   When IoTDB and ThingsBoard run in separate containers, put them on the same
   Docker network and make IoTDB announce its service name. Otherwise the
   `2.0.11-standalone` image binds these endpoints to `127.0.0.1`, which the
   ThingsBoard container cannot reach. For an IoTDB service named `iotdb`, set:

   ```yaml
   cn_seed_config_node: iotdb:10710
   dn_seed_config_node: iotdb:10710
   cn_internal_address: iotdb
   dn_internal_address: iotdb
   dn_rpc_address: iotdb
   ```

2. Install ThingsBoard as usual, without any of the settings from section 3.
3. Put the ten jars from `lib/` into ThingsBoard's extensions directory,
   `/usr/share/thingsboard/extensions`. Both the Docker image and the Linux
   `.deb` package load every jar in that directory. Section 3 shows how to do this
   for each kind of installation. Keep any other jars that are already there.

   All ten jars are required, even before the module is enabled. With the
   module jar alone, ThingsBoard does not start and reports
   `NoClassDefFoundError: org/apache/iotdb/isession/pool/ITableSessionPool`.
   With all ten jars and none of the settings below, ThingsBoard runs on its
   own storage and the module does nothing.

## 3. Configure

### Settings

The following settings move all three kinds of data to a single IoTDB node:

```properties
# IoTDB connection
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

# Latest telemetry values
database.ts_latest.type=iotdb-table
iotdb.ts_latest.cluster_mode=disabled

# Entity attributes
database.attributes.type=iotdb-table
iotdb.attributes.cluster_mode=disabled
```

What they mean:

- **Connection.** `iotdb.host` is the address ThingsBoard uses to reach IoTDB:
  the service name in Docker, or a host name or IP address otherwise. Use
  `127.0.0.1` only when both run directly on the same host, outside containers,
  or share one container network namespace. If a setting is left out, the defaults are host
  `127.0.0.1`, port `6667`, user `root` with password `root`, database
  `thingsboard`, and a pool of `8` sessions. With `iotdb.schema.bootstrap=true`
  (the default), the module creates the database and its tables on first start.
- **Historical telemetry** moves to IoTDB when both `database.ts.type=iotdb-table`
  and `iotdb.ts.experimental-raw-only=true` are set. The second setting is the
  required switch that turns this storage on. Its name is kept for
  compatibility with earlier builds; with it set, the module stores, reads,
  deletes and aggregates historical telemetry.
- **Latest telemetry values** move to IoTDB with
  `database.ts_latest.type=iotdb-table`. Latest values are read from the
  historical telemetry kept in IoTDB, so this also needs the two historical
  settings above. Without it, latest values stay in ThingsBoard's own storage
  even when historical telemetry is in IoTDB.
- **Entity attributes** move to IoTDB with `database.attributes.type=iotdb-table`,
  independently of the other two. ThingsBoard has no setting of its own for
  this, so the module removes ThingsBoard's attribute storage bean at startup
  and logs a `WARN` that names `jpaAttributeDao`.
- **`cluster_mode`** must be set when latest values or attributes are moved to
  IoTDB; any other value, including an empty one, stops startup with an
  error. It states how ThingsBoard nodes share writes. The module protects
  concurrent changes to the same key only inside one ThingsBoard process; the
  setting does not route requests or coordinate nodes.
  - `disabled`: use this with a single ThingsBoard node. With several nodes,
    use it only if you accept that concurrent updates to the same device or
    entity from different nodes can leave inconsistent results.
  - `sticky-routing`: use this with several nodes when your deployment makes
    sure that all updates and deletes for one device or entity are handled by
    the same node. Configure and verify that routing yourself.

### Passing the settings to ThingsBoard

The setting names contain dots, underscores and hyphens, so pass them as one
JSON object in the `SPRING_APPLICATION_JSON` environment variable.

**Docker (Compose).** Add the environment variable and the jar directory to
the ThingsBoard service, keeping its other settings. The bind mount replaces the
image's extensions directory, so put any other extension jars you use into the
same `lib/` directory:

```yaml
services:
  thingsboard:
    environment:
      SPRING_APPLICATION_JSON: >-
        {"iotdb.host": "iotdb", "iotdb.port": "6667",
         "iotdb.username": "root", "iotdb.password": "root",
         "iotdb.database": "thingsboard", "iotdb.session-pool-size": "8",
         "iotdb.schema.bootstrap": "true",
         "database.ts.type": "iotdb-table",
         "iotdb.ts.experimental-raw-only": "true",
         "database.ts_latest.type": "iotdb-table",
         "iotdb.ts_latest.cluster_mode": "disabled",
         "database.attributes.type": "iotdb-table",
         "iotdb.attributes.cluster_mode": "disabled"}
    volumes:
      - ./lib:/usr/share/thingsboard/extensions:ro
```

Apply it with `docker compose up -d`, which recreates the container. Restarting
the old container does not pick up a changed environment.

**Linux package (`.deb`).** The package does not create the extensions
directory. Create it and copy the jars:

```bash
sudo mkdir -p /usr/share/thingsboard/extensions
sudo cp lib/*.jar /usr/share/thingsboard/extensions/
```

Then add the settings to `/etc/thingsboard/conf/thingsboard.conf`, which the
ThingsBoard service reads at startup. The example assumes IoTDB on the same
host; change `iotdb.host` otherwise:

```bash
export SPRING_APPLICATION_JSON='{
  "iotdb.host": "127.0.0.1", "iotdb.port": "6667",
  "iotdb.username": "root", "iotdb.password": "root",
  "iotdb.database": "thingsboard", "iotdb.session-pool-size": "8",
  "iotdb.schema.bootstrap": "true",
  "database.ts.type": "iotdb-table",
  "iotdb.ts.experimental-raw-only": "true",
  "database.ts_latest.type": "iotdb-table",
  "iotdb.ts_latest.cluster_mode": "disabled",
  "database.attributes.type": "iotdb-table",
  "iotdb.attributes.cluster_mode": "disabled"
}'
```

Restart the service with `sudo systemctl restart thingsboard`. Setting the
variable in your own shell has no effect on the service.

## 4. Run and verify

1. Start ThingsBoard, or restart it if it is already running.
2. Check the ThingsBoard log for `IoTDB Table Mode session pool initialized`.
   With schema bootstrap enabled, `IoTDB Table Mode schema bootstrap complete`
   follows. When attributes are moved, the `WARN` about `jpaAttributeDao` is
   expected.
3. Send test telemetry and attributes to a ThingsBoard device, and note the
   device ID, the keys, the values and their times as shown on the device's
   **Latest telemetry** and **Attributes** tabs.

   ![ThingsBoard latest telemetry stored through the IoTDB Table Model backend](/img/thingsboard-table-telemetry.png)

   ![ThingsBoard client attributes stored through the IoTDB Table Model backend](/img/thingsboard-table-attributes.png)

4. Query the same device in IoTDB and compare keys, values and times. Replace
   `<device-id>` with the device ID:

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

- IoTDB 2.0.11 and ThingsBoard 4.3.1.2 are the tested versions. Other IoTDB
  2.x or ThingsBoard versions need their own verification.
- With several ThingsBoard nodes, consistent latest values and attributes depend
  on the routing described under `cluster_mode` in section 3.
- Retention uses IoTDB table-level TTL. The module's
  [user guide](https://github.com/apache/iotdb-extras/blob/v2.0.11/iotdb-thingsboard-table/docs/user-guide.md)
  explains how it relates to ThingsBoard's retention settings.

The design, building from source and migrating existing data are described in
the
[`iotdb-thingsboard-table` module](https://github.com/apache/iotdb-extras/tree/v2.0.11/iotdb-thingsboard-table).
