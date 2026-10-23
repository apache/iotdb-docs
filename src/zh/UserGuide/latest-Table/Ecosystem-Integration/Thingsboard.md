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

`iotdb-thingsboard-table` 模块可以让标准版 ThingsBoard 把历史遥测数据、最新遥测值和实体
属性存入 IoTDB 表模型。三类数据可以分别迁移到 IoTDB。本页依次介绍下载、安装、配置和
验证。

这套集成独立于较早的
[ThingsBoard 树模型集成](../../latest/Ecosystem-Integration/Thingsboard.md)，后者需要使用
IoTDB 适配版 ThingsBoard。

## 1. 下载

经过验证的版本组合如下：

| 组件 | 版本 |
| --- | --- |
| IoTDB | 2.0.11，表模型 |
| ThingsBoard | 4.3.1.2 |
| JDK | 17 或更高版本 |

本模块随 Apache IoTDB Extras 2.0.11 正式发布。模块 jar 及其签名作为附件放在
[2.0.11 Release](https://github.com/apache/iotdb-extras/releases/tag/v2.0.11) 中，签名可用
[IoTDB KEYS](https://dist.apache.org/repos/dist/release/iotdb/KEYS) 校验。模块 jar 不包含
IoTDB 客户端，因此还需要 9 个客户端 jar。下面的命令把这 10 个 jar 下载到 `lib/` 目录，
并校验模块 jar 的签名：

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

IoTDB 客户端用到的其他库（`lz4-java`、`zstd-jni`、`snappy-java` 和 `antlr4-runtime`）
ThingsBoard 已经自带，不要再另外放入。也可以用源码包
`apache-iotdb-extras-2.0.11-source-release.zip` 自行构建本模块。

## 2. 安装

请先安装 ThingsBoard，再启用本模块。ThingsBoard 安装程序依赖它自带的存储后端；如果第 3
节的 IoTDB 配置已经生效，安装会中止并报
`No qualifying bean of type 'org.thingsboard.server.service.install.TsDatabaseSchemaService' available`。

1. 安装并启动 IoTDB，参见 [IoTDB 快速上手](../QuickStart/QuickStart.md)。

   如果 IoTDB 和 ThingsBoard 分别运行在不同容器中，请把它们放在同一个 Docker 网络里，并让
   IoTDB 对外公布自己的服务名。否则 `2.0.11-standalone` 镜像会把这些地址绑定到
   `127.0.0.1`，ThingsBoard 容器无法访问。假设 IoTDB 的服务名为 `iotdb`，请设置：

   ```yaml
      cn_seed_config_node: iotdb:10710
      dn_seed_config_node: iotdb:10710
      cn_internal_address: iotdb
      dn_internal_address: iotdb
      dn_rpc_address: iotdb
      ```

2. 按常规方式安装 ThingsBoard，此时不要加入第 3 节的任何配置。
3. 把 `lib/` 中的 10 个 jar 放入 ThingsBoard 的扩展目录 `/usr/share/thingsboard/extensions`。
   Docker 镜像和 Linux `.deb` 安装包都会加载该目录中的所有 jar，具体做法见第 3 节。该目录中已有的
   其他 jar 请保留。

   这 10 个 jar 缺一不可，即使还没有启用本模块也是如此。只放模块 jar 时，ThingsBoard 无法
   启动，并报 `NoClassDefFoundError: org/apache/iotdb/isession/pool/ITableSessionPool`。
   放齐 10 个 jar 但不加下面的配置时，ThingsBoard 照常使用自己的存储，本模块不起作用。

## 3. 配置

### 配置项

下面这组配置把三类数据都存入单个 IoTDB 节点：

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

各配置项的含义：

- **连接**：`iotdb.host` 是 ThingsBoard 访问 IoTDB 的地址。在 Docker 中填 IoTDB 的服务名，
  其他环境填主机名或 IP。只有两者直接运行在同一台主机上（不在容器中），或共用同一个容器
  网络命名空间时，才使用 `127.0.0.1`。未设置的项使用默认值：地址 `127.0.0.1`、端口 `6667`、用户名和密码
  均为 `root`、数据库 `thingsboard`、会话池大小 `8`。`iotdb.schema.bootstrap=true`（默认）
  时，模块会在首次启动时自动创建数据库和表。
- **历史遥测数据**：同时设置 `database.ts.type=iotdb-table` 和
  `iotdb.ts.experimental-raw-only=true` 后存入 IoTDB。后者是启用这部分存储的必需开关，名字
  为兼容早期版本而保留；开启后，历史遥测数据的写入、查询、删除和聚合都由本模块处理。
- **最新遥测值**：设置 `database.ts_latest.type=iotdb-table` 后存入 IoTDB。最新值从 IoTDB
  中的历史遥测数据读取，所以还需要上面两项历史数据配置。不设置这一项时，即使历史数据已在
  IoTDB 中，最新值仍留在 ThingsBoard 原有的存储里。
- **实体属性**：设置 `database.attributes.type=iotdb-table` 后存入 IoTDB，与前两类数据互不
  依赖。ThingsBoard 本身没有切换属性存储的配置项，因此本模块会在启动时移除 ThingsBoard
  自带的属性存储组件，并输出一条提到 `jpaAttributeDao` 的 `WARN` 日志。
- **`cluster_mode`**：把最新遥测值或实体属性存入 IoTDB 时必须设置；填其他值（包括留空）
  都会导致启动失败。它用于说明多个 ThingsBoard 节点之间如何分担写入。本模块只在单个
  ThingsBoard 进程内保护对同一个键的并发修改，这个配置不会转发请求，也不会协调各节点。
  - `disabled`：只有一个 ThingsBoard 节点时使用。有多个节点时，只有在能接受“不同节点同时
    修改同一设备或实体可能导致结果不一致”的情况下才使用。
  - `sticky-routing`：有多个节点，并且你的部署能保证同一设备或实体的所有更新和删除都由同一
    节点处理时使用。这种路由需要你自己配置并验证。

### 把配置传给 ThingsBoard

配置项名称中含有点、下划线和连字符，因此请把它们写成一个 JSON 对象，通过环境变量
`SPRING_APPLICATION_JSON` 传入。

**Docker（Compose）**：在 ThingsBoard 服务中加入该环境变量和 jar 目录，其他配置保持不变。
挂载会替换镜像中的扩展目录，因此如果还用到其他扩展 jar，请一并放进同一个 `lib/` 目录：

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

用 `docker compose up -d` 使配置生效，它会重新创建容器。只重启原有容器不会读取新的环境变量。

**Linux 安装包（`.deb`）**：安装包不会创建扩展目录。请先创建目录并复制 jar：

```bash
sudo mkdir -p /usr/share/thingsboard/extensions
sudo cp lib/*.jar /usr/share/thingsboard/extensions/
```

然后把配置加入 `/etc/thingsboard/conf/thingsboard.conf`，ThingsBoard 服务启动时会读取这个
文件。示例假设 IoTDB 与 ThingsBoard 在同一台主机上，否则请修改 `iotdb.host`：

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

最后用 `sudo systemctl restart thingsboard` 重启服务。只在自己的终端里设置这个变量，对服务
不起作用。

## 4. 运行与验证

1. 启动 ThingsBoard；如果已在运行，则重启。
2. 在 ThingsBoard 日志中确认出现 `IoTDB Table Mode session pool initialized`。启用表结构
   自动创建时，随后还会出现 `IoTDB Table Mode schema bootstrap complete`。把实体属性存入
   IoTDB 时，出现提到 `jpaAttributeDao` 的 `WARN` 属于正常现象。
3. 向一台 ThingsBoard 设备发送测试遥测数据和属性，在设备的“最新遥测”和“属性”页面记下
   设备 ID、键、值和时间。

   ![通过 IoTDB 表模型后端存储的 ThingsBoard 最新遥测](/img/thingsboard-table-telemetry.png)

   ![通过 IoTDB 表模型后端存储的 ThingsBoard 客户端属性](/img/thingsboard-table-attributes.png)

4. 在 IoTDB 中查询同一台设备，核对键、值和时间。把 `<device-id>` 换成设备 ID：

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

## 5. 已知限制

- 已验证的版本为 IoTDB 2.0.11 和 ThingsBoard 4.3.1.2。其他 IoTDB 2.x 或 ThingsBoard 版本
  需要另行验证。
- 有多个 ThingsBoard 节点时，最新遥测值和实体属性能否保持一致，取决于第 3 节 `cluster_mode`
  中所说的路由。
- 数据保留依靠 IoTDB 表级 TTL，它与 ThingsBoard 保留设置的对应关系参见模块的
  [用户指南](https://github.com/apache/iotdb-extras/blob/v2.0.11/iotdb-thingsboard-table/docs/user-guide.md)。

设计说明、源码构建和已有数据迁移，参见
[`iotdb-thingsboard-table` 模块](https://github.com/apache/iotdb-extras/tree/v2.0.11/iotdb-thingsboard-table)。
