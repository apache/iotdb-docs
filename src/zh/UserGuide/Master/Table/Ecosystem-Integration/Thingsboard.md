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

## 1. 功能概述

ThingsBoard 是一个开源物联网平台,用于设备管理、数据采集与可视化。它通过三个存储 SPI
分别存放设备时序数据、最新值时序数据和实体属性,因此可以在不改动平台本身的前提下替换存储层。

`iotdb-thingsboard-table` 在 IoTDB 表模型之上实现了这三个 SPI,使 ThingsBoard 部署可以把
时序数据存进 IoTDB,而不是 Cassandra 或关系型数据库:

| ThingsBoard SPI | 实现 | 用途 |
| --- | --- | --- |
| `TimeseriesDao` | `IoTDBTableTimeseriesDao` | 历史时序:批量写入、原始读与时间分桶聚合读、删除 |
| `TimeseriesLatestDao` | `IoTDBTableLatestDao` | 每个 telemetry key 的最新值 |
| `AttributesDao` | `IoTDBTableAttributesDao` | 实体属性,按 `SERVER_SCOPE` / `SHARED_SCOPE` / `CLIENT_SCOPE` 分域 |

本页介绍的是**表模型**集成:它对接的是原版 ThingsBoard 发行版,把模块及其运行期依赖放上
classpath 并配置若干属性即可启用。下面的部署一节列出了确切的 jar 集合,不是单独一个 jar。
**树模型**另有一套更早的集成,见
[ThingsBoard(树模型)](../../Tree/Ecosystem-Integration/Thingsboard.md);那一套把数据写在
`root.thingsboard` 下,并且需要 IoTDB 适配版的 ThingsBoard 安装包而非原版。两者互相独立,
按你使用的数据模型选择即可。

写入经由一个有界异步队列批量落入 IoTDB tablet。读取覆盖原始路径和聚合路径:固定宽度的毫秒
分桶使用 IoTDB 原生的 `date_bin`;日历分桶(`WEEK` / `WEEK_ISO` / `MONTH` / `QUARTER`)
则逐桶推进,以保证边界与 ThingsBoard 自身语义一致,并落在每个查询各自携带的时区上。

## 2. 使用步骤

### 2.1 版本要求

* `IoTDB: 2.0.8`(表模型)—— 集成测试实际运行的版本(`apache/iotdb:2.0.8-standalone`),
  其他 2.x 版本未经测试。
* `ThingsBoard: 4.3.1.2`
* `JDK: >= 17`

该模块是对着 ThingsBoard 4.3.1.2 的 SPI 编译的。由于 ThingsBoard 的 `common/data` 与 `dao`
构件未发布到 Maven Central,模块编译时使用的是其所需类型的编译期替身,这些类不会被打进产物
jar,因此运行时使用的是真实的 ThingsBoard 类。

### 2.2 获取 jar

从 `iotdb-extras` 仓库构建。该模块位于一个需显式开启的 profile 之后,普通的 reactor 构建不会
包含它:

```bash
# 在 apache/iotdb-extras 仓库根目录,使用 JDK 17+
# https://github.com/apache/iotdb-extras
mvn -pl iotdb-thingsboard-table -am -P with-thingsboard clean package
```

产物 jar 位于 `iotdb-thingsboard-table/target/` 下。

### 2.3 部署到 ThingsBoard

必须**先装好 ThingsBoard,再启用模块**:它的安装器会解析一个只有内置后端才提供的
`TsDatabaseSchemaService` bean,因此在第 3 节的选择器已经打开的情况下启动,安装会失败。

1. 安装并启动 IoTDB,参见 [IoTDB 快速上手](../QuickStart/QuickStart.md)。
2. 按常规方式装好 ThingsBoard,此时不要设置第 3 节的任何属性。
3. 把模块**以及 IoTDB 客户端的运行期依赖**一起放上 ThingsBoard 的 classpath。只放模块 jar
   是不够的——首次创建会话时会抛 `ITableSessionPool` 的 `NoClassDefFoundError`。用
   `dependency:copy-dependencies -DincludeScope=runtime` 收集,然后**去掉 ThingsBoard 已经
   自带的那些**,否则它更新的版本会被模块带的旧版本盖住。对 ThingsBoard 4.3.1.2 而言是九个
   ——`antlr4-runtime`、`commons-codec`、`commons-io`、`commons-lang3`、`httpclient`、
   `httpcore`、`lz4-java`、`snappy-java`、`zstd-jni`——外加 `commons-logging`,那个是
   ThingsBoard 自己要求移除的(它使用 `spring-jcl`)。其中 `antlr4-runtime` 后果最严重:
   ThingsBoard 4.3.1.2 自带 4.13.0,模块带的是 4.9.3,之后 Spring Data JPA 的 `HqlLexer`
   无法反序列化自己的语法,启动直接失败。剩下十一个 jar。请对着你要部署的那个 ThingsBoard
   版本重新推导这个集合,并且**以能启动的部署为准,而不是以依赖比对为准**:比对回答的是
   ThingsBoard 是否*自带*某个构件,而不是它是否*容得下*某个构件,`commons-logging` 正是
   两者分道扬镳的地方。
4. 如何扩展 classpath 取决于安装方式。ThingsBoard 以 Spring Boot 应用运行:Docker 镜像通过
   `PropertiesLauncher` 启动并已支持 `LOADER_PATH`,把这些 jar 放进
   `/usr/share/thingsboard/extensions` 即可;deb/rpm 包则直接执行发行版 jar。请按你所用的
   安装方式查阅 ThingsBoard 自身的部署文档。
5. 将下方配置写入 ThingsBoard 的 `thingsboard.yml`,或提供等价的环境变量。
6. 重启 ThingsBoard。首次启动时,模块会在 IoTDB 中创建所需的数据库与表,除非关闭了该引导。

该模块是一个 Spring Boot 自动配置,因此 ThingsBoard 侧无需组件扫描或代码改动。

## 3. 配置

### 3.1 激活

历史时序需要时序选择器加上显式开关:

```Properties
# 选择本后端作为历史时序存储
database.ts.type=iotdb-table
# 显式开关,必须与上面的选择器同时设置
iotdb.ts.experimental-raw-only=true
```

最新值时序**另需**它自己的选择器。若遗漏,历史时序会存入 IoTDB,而最新值仍留在 ThingsBoard
的默认后端,且启动时不会报错:

```Properties
database.ts_latest.type=iotdb-table
# 最新值 DAO 激活时必填:sticky-routing | disabled
iotdb.ts_latest.cluster_mode=sticky-routing
```

实体属性是单独的一项开关,未启用时该 DAO 不生效。与两个时间序列选择器不同,它并非
独立于宿主:ThingsBoard 自身没有属性存储的配置开关,因此启用这一项会改动
ThingsBoard 的 bean 图,而不只是本模块的。

> **暂时不要在原版 ThingsBoard 上启用这一项。** ThingsBoard 自身没有为属性存储提供配置开关
> ——它的 JPA 属性 bean 是无条件注册的——因此设置下面这个选择器会让模块的冲突检查导致启动失败。
> 相应的修复正在上游 apache/iotdb-extras#125 中等待评审。它只撤下一个 bean ——
> ThingsBoard 自己的 `jpaAttributeDao`,按 bean 名与全限定类名同时匹配 —— 其余任何
> 竞争的 `AttributesDao` 一律不动,而是让启动失败。在该 PR 合入且包含它的构建发布之前,
> 本提示有效。

```Properties
database.attributes.type=iotdb-table
# 属性 DAO 激活时必填:sticky-routing | disabled
iotdb.attributes.cluster_mode=sticky-routing
```

### 3.2 连接与表结构

| 属性 | 默认值 | 含义 |
| --- | --- | --- |
| `iotdb.host` / `iotdb.port` | `127.0.0.1` / `6667` | IoTDB 节点地址 |
| `iotdb.username` / `iotdb.password` | `root` / `root` | IoTDB 凭据 |
| `iotdb.database` | `thingsboard` | 目标 IoTDB 数据库 |
| `iotdb.session-pool-size` | `8` | 表会话池大小 |
| `iotdb.schema.bootstrap` | `true` | 首次启动时创建数据库与表;若自行管理表结构则设为 `false` |

### 3.3 集群模式

当对应 DAO 激活时,`iotdb.attributes.cluster_mode` 与 `iotdb.ts_latest.cluster_mode` 必须显式
设置。可选值:

* `sticky-routing` —— 同一 identity 的写入固定路由到单个节点
* `disabled` —— 单节点部署,或已接受尽力而为的收敛

其他取值(包括留空)会在启动时直接失败,而不是静默通过。这两条写入路径只在单个 JVM 内收敛,
因此多写入者的集群部署需要上述两种确认之一。

## 4. 已知限制

* 属性写入与最新值覆盖层的写入只在单个 JVM 内收敛。集群部署必须二选一:把每个 identity 固定
  到单个节点(`sticky-routing`),或显式接受尽力而为的收敛(`disabled`)—— 这正是集群模式必须
  显式声明而非取默认值的原因。
* 最新值路径由时序表派生而来,另有一个很小的覆盖层,用于承接纯派生无法表达的"只写最新值"与
  "只删最新值"路径。
* 保留策略使用表级 TTL,其与 ThingsBoard 自身保留设置的对应关系,参见模块的
  [用户指南](https://github.com/apache/iotdb-extras/blob/master/iotdb-thingsboard-table/docs/user-guide.md)。
