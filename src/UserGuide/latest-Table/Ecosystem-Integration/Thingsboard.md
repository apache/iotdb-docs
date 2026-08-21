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

## 1. Overview

ThingsBoard is an open-source IoT platform for device management, data collection
and visualisation. It stores device telemetry, latest-value telemetry and entity
attributes through three storage SPIs, which allows the storage layer to be
replaced without changing the platform itself.

`iotdb-thingsboard-table` implements those three SPIs on top of the IoTDB Table
Model, so a ThingsBoard deployment can keep its telemetry in IoTDB instead of
Cassandra or a relational database:

| ThingsBoard SPI | Implementation | Purpose |
| --- | --- | --- |
| `TimeseriesDao` | `IoTDBTableTimeseriesDao` | Historical telemetry: batched writes, raw and time-bucketed aggregation reads, deletes |
| `TimeseriesLatestDao` | `IoTDBTableLatestDao` | Latest value per telemetry key |
| `AttributesDao` | `IoTDBTableAttributesDao` | Entity attributes, scoped by `SERVER_SCOPE` / `SHARED_SCOPE` / `CLIENT_SCOPE` |

This page covers the **Table Model** integration, which runs against a stock
ThingsBoard release and is enabled by putting the module and its runtime
dependencies on the classpath and setting a few properties. The deployment
section below lists the exact set; it is not a single jar.
There is a separate, earlier integration for the **Tree Model**, described in
[ThingsBoard (Tree Model)](../../latest/Ecosystem-Integration/Thingsboard.md);
that one stores data under `root.thingsboard` and requires an IoTDB-adapted
ThingsBoard build rather than a stock one. The two are independent — pick the one
that matches the data model you are using.

Writes are batched through a bounded asynchronous queue into IoTDB tablets.
Reads cover both the raw path and the aggregation path: fixed-width millisecond
buckets use IoTDB's native `date_bin`, while calendar buckets
(`WEEK` / `WEEK_ISO` / `MONTH` / `QUARTER`) are walked per bucket so that
boundaries match ThingsBoard's own semantics in the timezone carried by each
query.

## 2. Usage Steps

### 2.1 Version Requirements

* `IoTDB: 2.0.8` (Table Model) — the version the integration tests are executed
  against (`apache/iotdb:2.0.8-standalone`). Other 2.x releases are untested.
* `ThingsBoard: 4.3.1.2`
* `JDK: >= 17`

The module is compiled against the ThingsBoard 4.3.1.2 SPI surface. Because
ThingsBoard's `common/data` and `dao` artifacts are not published to Maven
Central, the module builds against a compile-only surface of the types it uses;
those classes are excluded from the packaged jar, so at runtime the real
ThingsBoard classes are used.

### 2.2 Obtain the jar

Build it from the `iotdb-extras` repository. The module sits behind an explicit
opt-in profile, so a plain reactor build does not include it:

```bash
# from the apache/iotdb-extras repository root, with JDK 17+
# https://github.com/apache/iotdb-extras
mvn -pl iotdb-thingsboard-table -am -P with-thingsboard clean package
```

The jar is produced under `iotdb-thingsboard-table/target/`.

### 2.3 Deploy into ThingsBoard

ThingsBoard must be installed **before** the module is enabled: its installer
resolves a `TsDatabaseSchemaService` bean that only the built-in backends
provide, so starting with the selectors of section 3 already set makes the
install step fail.

1. Install and start IoTDB, see [IoTDB QuickStart](../QuickStart/QuickStart.md).
2. Install ThingsBoard normally, with none of the properties in section 3 set.
3. Put the module **and the IoTDB client's runtime dependencies** on
   ThingsBoard's classpath. The module jar alone is not enough — it fails at
   first session creation with `NoClassDefFoundError` on `ITableSessionPool`.
   Collect the set with `dependency:copy-dependencies -DincludeScope=runtime`,
   then remove the artifacts ThingsBoard already bundles, or its newer copies
   are shadowed by the module's older ones. Against ThingsBoard 4.3.1.2 that is
   nine — `antlr4-runtime`, `commons-codec`, `commons-io`, `commons-lang3`,
   `httpclient`, `httpcore`, `lz4-java`, `snappy-java`, `zstd-jni` — plus
   `commons-logging`, which ThingsBoard asks to have removed because it uses
   `spring-jcl`. `antlr4-runtime` is the one that bites hardest: ThingsBoard
   4.3.1.2 ships 4.13.0 and the module brings 4.9.3, after which Spring Data
   JPA's `HqlLexer` cannot deserialise its own grammar and startup fails.
   Eleven jars remain. Re-derive that set against the ThingsBoard release you
   are deploying to, and prefer a deployment that boots over a dependency diff:
   the diff answers whether ThingsBoard *ships* an artifact, not whether it
   *tolerates* one, and `commons-logging` is exactly where those differ.
4. How the classpath is extended depends on the installation. ThingsBoard runs
   as a Spring Boot application: the Docker images launch through
   `PropertiesLauncher` and already honour a `LOADER_PATH` entry, so placing the
   jars in `/usr/share/thingsboard/extensions` is enough; the deb/rpm packages
   execute the distribution jar directly. Consult ThingsBoard's own deployment
   documentation for the installation method you use.
5. Add the configuration below to ThingsBoard's `thingsboard.yml`, or supply the
   equivalent environment variables.
6. Restart ThingsBoard. On first start the module creates its database and tables
   in IoTDB, unless that bootstrap is disabled.

The module is a Spring Boot auto-configuration, so no component scanning or code
change is required on the ThingsBoard side.

## 3. Configuration

### 3.1 Activation

Historical telemetry needs the timeseries selector plus the explicit opt-in:

```Properties
# select this backend for historical telemetry
database.ts.type=iotdb-table
# explicit opt-in; required together with the selector above
iotdb.ts.experimental-raw-only=true
```

Latest-value telemetry needs its **own** selector in addition to those two. If it
is omitted, historical telemetry is stored in IoTDB while latest values stay on
ThingsBoard's default backend, with no error at startup:

```Properties
database.ts_latest.type=iotdb-table
# required when the latest DAO is active: sticky-routing | disabled
iotdb.ts_latest.cluster_mode=sticky-routing
```

Entity attributes are a separate opt-in and are inert unless enabled. Unlike the
two timeseries selectors it is not independent of the host: ThingsBoard has no
attributes-backend switch of its own, so enabling this one changes ThingsBoard's
bean graph rather than only this module's.

> **Do not enable this on a stock ThingsBoard yet.** ThingsBoard has no
> configuration switch of its own for attributes storage — its JPA attributes
> bean registers unconditionally — so setting the selector below makes startup
> fail on the module's conflict check. A fix is under review upstream as
> apache/iotdb-extras#125. It withdraws exactly one bean — ThingsBoard's own
> `jpaAttributeDao`, matched on both the bean name and the fully-qualified class
> name — and fails startup on any other competing `AttributesDao` rather than
> removing it. This note applies until that PR is merged and a build containing
> it is released.


```Properties
database.attributes.type=iotdb-table
# required when the attribute DAO is active: sticky-routing | disabled
iotdb.attributes.cluster_mode=sticky-routing
```

### 3.2 Connection and schema

| Property | Default | Meaning |
| --- | --- | --- |
| `iotdb.host` / `iotdb.port` | `127.0.0.1` / `6667` | IoTDB node address |
| `iotdb.username` / `iotdb.password` | `root` / `root` | IoTDB credentials |
| `iotdb.database` | `thingsboard` | Target IoTDB database |
| `iotdb.session-pool-size` | `8` | Table session pool size |
| `iotdb.schema.bootstrap` | `true` | Create the database and tables on first start; set to `false` to manage the schema out of band |

### 3.3 Cluster mode

`iotdb.attributes.cluster_mode` and `iotdb.ts_latest.cluster_mode` must be set
explicitly when the corresponding DAO is active. Accepted values:

* `sticky-routing` — writes for one identity are pinned to a single node
* `disabled` — single-node deployment, or best-effort convergence accepted

Any other value, including leaving it empty, fails at startup rather than
silently. These write paths converge within a single JVM, so a multi-writer
cluster needs one of the two acknowledgements above.

## 4. Known Limitations

* Attribute and latest-overlay writes converge within a single JVM. A clustered
  deployment must either pin each identity to one node (`sticky-routing`) or
  explicitly accept best-effort convergence (`disabled`) — which is why the
  cluster mode has to be stated rather than defaulted.
* The latest-value path is derived from the telemetry table, with a small overlay
  for the latest-only write and delete paths that a pure derivation cannot
  express.
* Table-level TTL is used for retention; see the module's
  [user guide](https://github.com/apache/iotdb-extras/blob/master/iotdb-thingsboard-table/docs/user-guide.md)
  for how it maps onto ThingsBoard's own retention settings.
