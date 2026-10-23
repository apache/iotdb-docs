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

`iotdb-thingsboard-table` 模块让原版 ThingsBoard 可以把历史时序、最新值时序和实体属性
存入 IoTDB 表模型。本页按操作者真正使用它的顺序说明：下载、安装、配置、运行与验证。

这套集成独立于较早的
[ThingsBoard 树模型集成](../../Tree/Ecosystem-Integration/Thingsboard.md)，后者需要使用
IoTDB 适配版 ThingsBoard。

## 1. 下载

已经验证的版本组合如下：

| 组件 | 版本 |
| --- | --- |
| IoTDB | 2.0.11，表模型 |
| ThingsBoard | 4.3.1.2 |
| JDK | 17 或更高版本 |

本模块已随 Apache IoTDB Extras 2.0.11 正式发布。模块 jar 作为附件放在
[2.0.11 Release](https://github.com/apache/iotdb-extras/releases/tag/v2.0.11) 中，
并附有签名，可用 [IoTDB KEYS](https://dist.apache.org/repos/dist/release/iotdb/KEYS)
校验。该 jar 不包含 IoTDB 客户端，因此还需从 Maven Central 下载它依赖的 9 个客户端
jar，放入同一个 `lib/` 目录：

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

完成后 `lib/` 中即为需要部署的 10 个 jar。也可以用源码包
`apache-iotdb-extras-2.0.11-source-release.zip` 自行构建本模块。

## 2. 安装

必须先安装 ThingsBoard，再启用 IoTDB 选择器。ThingsBoard 安装器会解析由内置后端提供的
`TsDatabaseSchemaService`；若安装阶段已经启用本模块，安装会失败。

1. 安装并启动 IoTDB，参见 [IoTDB 快速上手](../QuickStart/QuickStart.md)。

   若 IoTDB 2.0.11 与 ThingsBoard 分别运行在容器中，请把两者放入同一 Docker 网络，并让
   IoTDB 公布网络内可达的服务名。`2.0.11-standalone` 镜像默认把这些地址绑定到
   `127.0.0.1`。假设 IoTDB 服务名为 `iotdb`，请设置：

   ```yaml
   cn_seed_config_node: iotdb:10710
   dn_seed_config_node: iotdb:10710
   cn_internal_address: iotdb
   dn_internal_address: iotdb
   dn_rpc_address: iotdb
   ```

2. 按常规方式安装 ThingsBoard，此时不要设置第 3 节的任何属性。
3. 将 `lib/` 中的 10 个 jar 放到 ThingsBoard classpath 上。即使尚未设置任何选择器，
   这 10 个 jar 也缺一不可：只放模块 jar 时，ThingsBoard 会启动失败，报
   `NoClassDefFoundError: org/apache/iotdb/isession/pool/ITableSessionPool`。

对于 ThingsBoard Docker 镜像，可将这些 jar 挂载或复制到
`/usr/share/thingsboard/extensions`。镜像使用的 `PropertiesLauncher` 已通过
`LOADER_PATH` 包含该目录。其他安装方式可能采用不同的 classpath 扩展机制。

部署目录必须正好包含 10 个 jar：模块本身，以及 `iotdb-session`、`isession`、
`service-rpc`、`iotdb-thrift`、`iotdb-thrift-commons`、`libthrift`、`tsfile`、
`common` 和 `xz`。IoTDB 客户端用到的其余库（`lz4-java`、`zstd-jni`、`snappy-java`
和 `antlr4-runtime`）ThingsBoard 已经自带，不要再放入其他副本。

## 3. 配置

按需要启用要迁移到 IoTDB 的存储路径。下面的单节点示例同时启用三条路径：

```properties
# IoTDB 连接
# Docker 服务名；仅当两个进程共享同一主机时使用 127.0.0.1
iotdb.host=iotdb
iotdb.port=6667
iotdb.username=root
iotdb.password=root
iotdb.database=thingsboard
iotdb.session-pool-size=8
iotdb.schema.bootstrap=true

# 历史时序
database.ts.type=iotdb-table
iotdb.ts.experimental-raw-only=true

# 最新值时序
database.ts_latest.type=iotdb-table
iotdb.ts_latest.cluster_mode=disabled

# 实体属性
database.attributes.type=iotdb-table
iotdb.attributes.cluster_mode=disabled
```

历史时序和最新值时序使用两个独立选择器。若遗漏 `database.ts_latest.type`，即使历史数据
已经存入 IoTDB，最新值仍会留在 ThingsBoard 原来的后端中。

示例显式写出了连接配置的默认值。在非 Docker 环境中，`iotdb.host` 默认为
`127.0.0.1`；其他默认值为端口 `6667`、用户名/密码 `root`/`root`、数据库
`thingsboard`、会话池大小 `8`，并默认启用表结构引导。

启用最新值或属性时，必须显式设置对应的 `cluster_mode`：

- `sticky-routing`：把同一 identity 的写入固定路由到一个节点。
- `disabled`：单节点部署，或明确接受尽力而为的收敛。

其他取值（包括空值）都会让启动停止并给出明确错误。

## 4. 运行与验证

1. 部署 jar 并完成配置后，重启 ThingsBoard。
2. 在日志中确认出现 `IoTDB Table Mode session pool initialized`。若启用了表结构引导，
   还应出现 `IoTDB Table Mode schema bootstrap complete`。
3. 向一台 ThingsBoard 测试设备发送时序和属性数据，然后在设备的“最新遥测”和“属性”页面
   确认这些值。

   ![通过 IoTDB 表模型后端存储的 ThingsBoard 最新遥测](/img/thingsboard-table-telemetry.png)

   ![通过 IoTDB 表模型后端存储的 ThingsBoard 客户端属性](/img/thingsboard-table-attributes.png)

4. 在 IoTDB 中查询同一批数据：

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

## 5. 已知限制

- 已验证版本为 IoTDB 2.0.11 和 ThingsBoard 4.3.1.2。其他 IoTDB 2.x 或 ThingsBoard
  版本需要单独验证。
- 属性写入和最新值覆盖层只在单个 JVM 内收敛。多写入者部署必须使用固定路由，或明确接受
  尽力而为的收敛。
- 最新值路径从时序表派生，并使用一个小型覆盖层承接仅写最新值和仅删最新值的路径。
- 保留策略使用 IoTDB 表级 TTL；其与 ThingsBoard 保留设置的对应关系参见模块的
  [用户指南](https://github.com/apache/iotdb-extras/blob/v2.0.11/iotdb-thingsboard-table/docs/user-guide.md)。

设计、源码构建、迁移和编译接口验证细节保留在
[`iotdb-thingsboard-table` 模块](https://github.com/apache/iotdb-extras/tree/v2.0.11/iotdb-thingsboard-table)
中。
