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

`iotdb-thingsboard-table` 模块可将 ThingsBoard 的历史遥测数据、
最新遥测值和实体属性存入 IoTDB 表模型。模块直接加载到现有的
ThingsBoard 中，无需使用定制版 ThingsBoard。

本模块与较早的
[ThingsBoard 树模型集成](../../latest/Ecosystem-Integration/Thingsboard.md)
是两套独立方案；树模型方案需要使用 IoTDB 适配版 ThingsBoard。

## 1. 下载

已验证的版本组合如下：

| 组件 | 版本 |
| --- | --- |
| IoTDB | 2.0.11，表模型 |
| ThingsBoard | 4.3.1.2 |
| JDK | 17 或更高版本 |

本模块随 Apache IoTDB Extras 2.0.11 发布。以下命令从
[2.0.11 发布页面](https://github.com/apache/iotdb-extras/releases/tag/v2.0.11)
下载模块 jar，并使用
[IoTDB KEYS](https://dist.apache.org/repos/dist/release/iotdb/KEYS)
校验签名。模块 jar 不包含 IoTDB 客户端，因此命令还会从
Maven Central 下载所需的 9 个客户端依赖 jar，统一放入 `lib/`。

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

部署时需要使用 `lib/` 中下载得到的全部 10 个 jar。也可以用源码包
`apache-iotdb-extras-2.0.11-source-release.zip` 自行构建模块。

## 2. 安装

必须先完成 ThingsBoard 的正常安装，再配置 IoTDB 存储。
如果在运行 ThingsBoard 安装程序时就启用本模块，安装会因缺少
`TsDatabaseSchemaService` 而失败。

1. 安装并启动 IoTDB，参见
   [IoTDB 快速上手](../QuickStart/QuickStart.md)。

   如果 IoTDB 和 ThingsBoard 分别运行在容器中，请将两者接入同一
   Docker 网络，并让 IoTDB 使用 ThingsBoard 可以访问的服务名。
   `apache/iotdb:2.0.11-standalone` 镜像默认对以下地址使用
   `127.0.0.1`。假设 IoTDB 服务名为 `iotdb`，在 IoTDB 容器的
   环境配置中设置：

   ```yaml
   cn_seed_config_node: iotdb:10710
   dn_seed_config_node: iotdb:10710
   cn_internal_address: iotdb
   dn_internal_address: iotdb
   dn_rpc_address: iotdb
   ```

2. 按 ThingsBoard 的正常流程和存储配置完成安装。
   不要将第 3 节的 IoTDB 配置用于安装程序。

3. 将下载得到的全部 10 个 jar 放入 ThingsBoard 的扩展目录
   `/usr/share/thingsboard/extensions`。

   使用 Docker 镜像时，将这些 jar 挂载或复制到该目录。第 3.1 节
   给出了挂载 `lib/` 目录的 Compose 示例。

   使用 Linux `.deb` 安装包时，安装包不会创建该目录。请在安装
   完成后，在包含 `lib/` 的目录中执行：

   ```bash
   sudo install -d /usr/share/thingsboard/extensions
   sudo install -m 0644 lib/*.jar /usr/share/thingsboard/extensions/
   ```

即使还没有启用 IoTDB 存储，这 10 个 jar 也必须全部就位。
如果只放入模块 jar，ThingsBoard 会启动失败并报错：

```text
NoClassDefFoundError: org/apache/iotdb/isession/pool/ITableSessionPool
```

放齐 10 个 jar、但尚未启用任何 IoTDB 存储配置时，ThingsBoard
可以正常启动，继续使用原有存储后端。ThingsBoard 4.3.1.2 已自带
`lz4-java`、`zstd-jni`、`snappy-java` 和 `antlr4-runtime`，
不要再添加这些库的其他副本。

## 3. 配置

通过 ThingsBoard 进程的 `SPRING_APPLICATION_JSON` 环境变量
传入配置。JSON 中的属性名保留原样，包括下划线和连字符。
请按部署方式使用下面的说明；两个示例均适用于只有一个
ThingsBoard 节点、同时启用三类 IoTDB 存储的情况。

按实际部署修改 `iotdb.host`、用户名、密码和数据库名。
如果已经设置了 `SPRING_APPLICATION_JSON`，将这些属性合并到
现有 JSON 对象中，保留其中的其他配置。

### 3.1 Docker

将以下片段合并到现有 Compose 文件的 ThingsBoard 服务配置中。
示例将该服务命名为 `thingsboard`；如果已有名称不同，请使用
实际名称。保留原有环境变量、数据卷、端口和网络配置。
第 1 节生成的 `lib/` 应与 Compose 文件位于同一目录；
IoTDB 服务名为 `iotdb`，并与 ThingsBoard 使用同一 Docker 网络。

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

这只是已有 ThingsBoard 部署的配置片段，不是完整的 Compose
文件。它用于安装完成后的运行服务，不用于安装程序。
如果已经挂载了扩展目录，将 10 个 jar 放入原挂载目录即可，
不要再对同一容器路径添加第二个挂载。

### 3.2 Linux 安装包

使用 Linux `.deb` 安装包时，将下面的配置加入
`/etc/thingsboard/conf/thingsboard.conf`，保留文件中的已有设置。
ThingsBoard 服务启动时会读取这个 shell 文件，因此需要保留
`export` 和 JSON 外侧的单引号。只在终端中导出环境变量，
并不能完成系统服务的配置。

此例假设 ThingsBoard 服务可以通过 `127.0.0.1` 访问 IoTDB。
如果实际地址不同，请修改 `iotdb.host`。

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

### 3.3 选择使用 IoTDB 存储的数据

按需要保留相应配置：

- **历史遥测数据：** 同时设置 `database.ts.type=iotdb-table`
  和 `iotdb.ts.experimental-raw-only=true`。
- **最新遥测值：** 先按上一项启用历史遥测存储，再设置
  `database.ts_latest.type=iotdb-table` 和
  `iotdb.ts_latest.cluster_mode`。最新值需要读取 IoTDB
  遥测表，因此不能脱离历史遥测存储单独启用。
- **实体属性：** 设置 `database.attributes.type=iotdb-table`
  和 `iotdb.attributes.cluster_mode`。属性存储不要求历史遥测
  或最新遥测值也使用 IoTDB。

`cluster_mode` 的取值见第 3.4 节。不需要启用某类 IoTDB 存储时，
省略对应配置即可。如果启用了历史遥测存储，但未设置
`database.ts_latest.type`，最新遥测值仍使用 ThingsBoard 原来的后端。

`iotdb.ts.experimental-raw-only` 是启用历史遥测后端时必须设置的
开关。名称是为兼容旧配置而保留的，并不表示只支持原始数据：
启用后支持写入、原始数据查询、删除，以及按时间窗口聚合。

连接配置的默认值为：主机 `127.0.0.1`、端口 `6667`、
用户名和密码 `root`/`root`、数据库 `thingsboard`、会话池大小 `8`。
默认启用表结构初始化，即 `iotdb.schema.bootstrap=true`，
首次启动时会自动创建数据库和表。
Docker 示例将主机显式改为 `iotdb`；模块的默认主机地址不会
因为使用 Docker 而自动改变。

### 3.4 单节点与多节点

启用最新遥测值或实体属性的 IoTDB 存储后，必须明确设置对应的
`cluster_mode`：

- **只有一个 ThingsBoard 节点：** 按示例设为 `disabled`。
- **有多个 ThingsBoard 节点：** 只有在已确保同一设备或实体的
  最新遥测值和属性，无论更新还是删除，都由同一个 ThingsBoard
  节点处理时，才设为 `sticky-routing`。路由需要另行配置和验证；
  设置这个属性不会自动建立路由。
- **有多个节点，但无法保证上述路由：** 只有在明确接受并发写入
  风险时才使用 `disabled`。不同节点同时更新同一个最新值键
  或属性，可能导致结果不一致；模块不会协调这些跨节点写入。

这里的“节点”指 ThingsBoard 节点，不是 IoTDB 节点。
`disabled` 不会关闭最新遥测值或属性存储。对应存储功能启用后，
如果未设置该配置、将其留空或使用其他值，ThingsBoard 将无法启动。

## 4. 运行与验证

1. 使用全部 10 个 jar 和新配置启动 ThingsBoard。

   使用 Compose 示例时，在 Compose 文件所在目录执行以下命令。
   如果服务名不是 `thingsboard`，请替换为实际名称：

   ```bash
   docker compose up -d thingsboard
   ```

   配置有变化时，该命令会重建容器。仅重启已经创建的容器，
   不会应用对环境变量配置的修改。

   使用 Linux 安装包时，重启服务：

   ```bash
   sudo systemctl restart thingsboard
   ```

2. 确认日志中出现 `IoTDB Table Mode session pool initialized`。
   如果启用了表结构初始化，还应看到
   `IoTDB Table Mode schema bootstrap complete`。

   启用 IoTDB 属性存储后，日志会警告模块移除了 ThingsBoard 的
   `jpaAttributeDao`。这是预期行为，表示内置属性后端已被替换。

3. 向一台测试设备发送遥测数据和一个客户端属性，在设备的
   “最新遥测”和“属性”页面记下设备 ID、键名、值和时间戳。

   ![通过 IoTDB 表模型后端存储的 ThingsBoard 最新遥测](/img/thingsboard-table-telemetry.png)

   ![通过 IoTDB 表模型后端存储的 ThingsBoard 客户端属性](/img/thingsboard-table-attributes.png)

4. 在 IoTDB 中查询同一台设备，核对键名、值和时间戳是否与第 3 步
   记下的一致。把 `<device-id>` 换成设备 ID；如果修改过数据库名，
   请同时替换 `thingsboard`：

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

- 已验证的版本为 IoTDB 2.0.11 和 ThingsBoard 4.3.1.2。
  其他版本需要单独验证。
- 多个 ThingsBoard 节点写入最新遥测值或实体属性时，需要满足
  第 3.4 节的路由要求，或明确接受并发写入可能导致的不一致。
- 最新遥测值依赖 IoTDB 历史遥测存储。模块也支持只写入或只删除
  最新值的操作；具体处理方式参见模块的用户指南。
- 数据保留期使用 IoTDB 表级 TTL。它与 ThingsBoard 数据保留设置
  的对应关系，参见模块的
  [用户指南](https://github.com/apache/iotdb-extras/blob/v2.0.11/iotdb-thingsboard-table/docs/user-guide.md)。

源码构建、数据迁移及实现说明，参见
[`iotdb-thingsboard-table` 模块](https://github.com/apache/iotdb-extras/tree/v2.0.11/iotdb-thingsboard-table)。
