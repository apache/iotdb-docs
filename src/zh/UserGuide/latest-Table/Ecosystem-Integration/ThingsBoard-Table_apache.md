# ThingsBoard

## 1\. 产品概述

### 1\.1 ThingsBoard 简介

ThingsBoard 是一个开源物联网平台，提供设备管理、数据采集和可视化等功能，帮助用户快速开发、管理和扩展物联网应用。更多介绍请参考 [ThingsBoard 官网](https://thingsboard.io/docs/getting-started-guides/what-is-thingsboard/)。

![ThingsBoard.png](/img/ThingsBoard-1.png)

### 1\.2 ThingsBoard 与 IoTDB 表模型集成

IoTDB 提供的 `iotdb-thingsboard-table` 扩展，可将 ThingsBoard 的历史遥测、最新遥测值和实体属性存储到 IoTDB 表模型，并支持在 ThingsBoard 中读取和展示这些数据。用户可按需选择使用 IoTDB 存储的数据类型，通过 ThingsBoard 进行设备数据管理与可视化。

## 2\. 使用步骤

### 2\.1 环境要求

本文以 IoTDB 2\.0\.11、ThingsBoard 4\.3\.1\.2 和 `iotdb-thingsboard-table` 2\.0\.11 为例介绍集成步骤。使用更高版本时，请结合对应版本文档确认扩展兼容性，并调整依赖、配置及启动方式。

|软件|示例版本或配置|用途|
|---|---|---|
|IoTDB|2\.0\.11，表模型|存储遥测和/或属性|
|ThingsBoard|4\.3\.1\.2|设备接入与数据管理|
|JDK|17|运行 IoTDB 和 ThingsBoard|

IoTDB 与 ThingsBoard 可以部署在不同主机或容器中。ThingsBoard 运行环境必须能够访问 IoTDB RPC 地址（默认端口 `6667`）。首次部署建议使用独立测试实例和测试设备。

### 2\.2 安装基础环境

按官方安装指南完成 ThingsBoard 和 IoTDB 的安装，并确认它们可以独立启动。先完成 ThingsBoard 自身的安装和数据库初始化，再按后续步骤接入 IoTDB 表模型。

- IoTDB 的安装部署请参考[单机部署](../Deployment-and-Maintenance/Stand-Alone-Deployment_apache.md)章节。

- 从 [ThingsBoard 4\.3\.1\.2 发布页](https://github.com/thingsboard/thingsboard/releases/tag/v4.3.1.2)获取安装包，并按 ThingsBoard 官方安装指南完成安装、数据库配置和初始化。

如果 IoTDB 与 ThingsBoard 分别运行在容器中，应将两者接入同一 Docker 网络，并让 IoTDB 使用 ThingsBoard 可访问的服务名。对于 `apache/iotdb:2.0.11-standalone` 镜像，假设 IoTDB 服务名为 `iotdb`，在该服务的 `environment` 中设置：

```YAML
cn_seed_config_node: iotdb:10710
dn_seed_config_node: iotdb:10710
cn_internal_address: iotdb
dn_internal_address: iotdb
dn_rpc_address: iotdb
```

### 2\.3 获取并部署扩展

1. **获取扩展。** 从 [Apache IoTDB Extras 2\.0\.11 发布目录](https://github.com/apache/iotdb-extras/releases/tag/v2.0.11)获取 `iotdb-thingsboard-table-2.0.11.jar`。

2. **下载依赖。** 扩展 JAR 不包含 IoTDB 客户端库。通过下表中的 Maven Central 链接下载全部 9 个依赖 JAR，与扩展 JAR 一起保存到本地 `lib` 目录。

    |    Maven 依赖|    版本|    JAR 下载|
    |---|---|---|
    |    `org.apache.iotdb:iotdb-session`|    `2.0.11`|    [iotdb\-session\-2\.0\.11\.jar](https://repo1.maven.org/maven2/org/apache/iotdb/iotdb-session/2.0.11/iotdb-session-2.0.11.jar)|
    |    `org.apache.iotdb:isession`|    `2.0.11`|    [isession\-2\.0\.11\.jar](https://repo1.maven.org/maven2/org/apache/iotdb/isession/2.0.11/isession-2.0.11.jar)|
    |    `org.apache.iotdb:service-rpc`|    `2.0.11`|    [service\-rpc\-2\.0\.11\.jar](https://repo1.maven.org/maven2/org/apache/iotdb/service-rpc/2.0.11/service-rpc-2.0.11.jar)|
    |    `org.apache.iotdb:iotdb-thrift`|    `2.0.11`|    [iotdb\-thrift\-2\.0\.11\.jar](https://repo1.maven.org/maven2/org/apache/iotdb/iotdb-thrift/2.0.11/iotdb-thrift-2.0.11.jar)|
    |    `org.apache.iotdb:iotdb-thrift-commons`|    `2.0.11`|    [iotdb\-thrift\-commons\-2\.0\.11\.jar](https://repo1.maven.org/maven2/org/apache/iotdb/iotdb-thrift-commons/2.0.11/iotdb-thrift-commons-2.0.11.jar)|
    |    `org.apache.thrift:libthrift`|    `0.23.0`|    [libthrift\-0\.23\.0\.jar](https://repo1.maven.org/maven2/org/apache/thrift/libthrift/0.23.0/libthrift-0.23.0.jar)|
    |    `org.apache.tsfile:tsfile`|    `2.4.0`|    [tsfile\-2\.4\.0\.jar](https://repo1.maven.org/maven2/org/apache/tsfile/tsfile/2.4.0/tsfile-2.4.0.jar)|
    |    `org.apache.tsfile:common`|    `2.4.0`|    [common\-2\.4\.0\.jar](https://repo1.maven.org/maven2/org/apache/tsfile/common/2.4.0/common-2.4.0.jar)|
    |    `org.tukaani:xz`|    `1.10`|    [xz\-1\.10\.jar](https://repo1.maven.org/maven2/org/tukaani/xz/1.10/xz-1.10.jar)|

    也可在 Bash 中执行以下命令，一次下载扩展和全部依赖到当前目录下的 `lib` 文件夹（适用于 Linux、macOS 或 Windows Git Bash）：

    ```Bash
    mkdir -p lib
    R=https://github.com/apache/iotdb-extras/releases/download/v2.0.11
    curl -fL -o lib/iotdb-thingsboard-table-2.0.11.jar "$R/iotdb-thingsboard-table-2.0.11.jar"

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

    下载完成后，`lib` 目录中应有 10 个 JAR（1 个扩展 JAR 和 9 个依赖 JAR）。

    ThingsBoard 4\.3\.1\.2 已包含 LZ4、Zstd、Snappy 和 ANTLR 运行库，不要在扩展目录中放入这些库的重复版本。

3. **部署扩展。** 将扩展 JAR 和全部 9 个依赖 JAR 放入 ThingsBoard 扩展目录：

    - **Linux（****`.deb`**** 安装包）：** `/usr/share/thingsboard/extensions`（适用于 ThingsBoard 4\.3\.1\.2 官方 `.deb` 包的常规安装，目录不存在时需手动创建）。

    - **Windows：** `<ThingsBoard目录>\extensions`。

    - **Docker：** 将 `lib` 目录挂载到容器内的 `/usr/share/thingsboard/extensions`，配置示例见第 2\.4\.1 节。

        使用 Linux `.deb` 安装包时，在包含 `lib` 文件夹的目录中执行以下命令，创建扩展目录并复制全部 JAR：

    ```Bash
    sudo install -d /usr/share/thingsboard/extensions
    sudo install -m 0644 lib/*.jar /usr/share/thingsboard/extensions/
    ```

    若修改了安装位置或启动配置，请以 ThingsBoard 进程的实际扩展加载路径为准。仅创建目录并复制 JAR，不会自动将该目录加入加载路径。

> 可选：如需验证扩展包的来源与完整性，可导入 Apache IoTDB [KEYS 文件](https://dist.apache.org/repos/dist/release/iotdb/KEYS)中的发布签名公钥，使用同一次发布中与扩展 JAR 对应的 `.asc` 文件校验签名。签名文件不需要部署到扩展目录。
>
>

### 2\.4 配置扩展

通过 ThingsBoard 进程的 `SPRING_APPLICATION_JSON` 环境变量传入配置。以下示例均适用于单个 ThingsBoard 节点，并同时启用历史遥测、最新遥测和实体属性存储。

根据实际部署修改 IoTDB 主机、端口、账号和数据库名。若已设置 `SPRING_APPLICATION_JSON`，将这些属性合并到现有 JSON 对象中，保留其他配置。属性名称中的连字符和下划线须按示例书写。

模块默认连接地址为 `127.0.0.1:6667`、账号密码为 `root`/`root`、数据库名为 `thingsboard`、会话池大小为 `8`。`iotdb.schema.bootstrap=true` 时首次启动会自动创建数据库和扩展所需的表。容器中应显式填写可访问的 IoTDB 主机名，默认地址不会因容器部署而自动改变。

#### 2\.4\.1 Docker Compose

将以下片段合并到现有 Compose 文件的 ThingsBoard 服务中。示例使用服务名 `thingsboard`，IoTDB 服务名为 `iotdb`；请按实际服务名称修改，并保留原有端口、网络、数据卷及其他环境变量。第 2\.3 节下载的 `lib` 目录应与 Compose 文件位于同一目录。

```YAML
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

该片段用于已经完成基础安装的 ThingsBoard 运行服务，不是独立的完整 Compose 文件。若已挂载扩展目录，将全部 10 个 JAR 放入原挂载目录，不要对同一容器路径重复挂载。

#### 2\.4\.2 Linux（`.deb` 安装包）

将以下配置加入 `/etc/thingsboard/conf/thingsboard.conf`，保留文件中的现有设置。ThingsBoard 服务启动时会读取该 shell 文件，因此须保留 `export` 和 JSON 外侧的单引号。只在终端中导出环境变量不会修改系统服务配置。

示例假设 IoTDB 与 ThingsBoard 部署在同一主机；若使用其他地址，请修改 `iotdb.host`。

```Bash
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

#### 2\.4\.3 Windows

将第 2\.4\.2 节中 `SPRING_APPLICATION_JSON` 的 JSON 对象内容设置为 ThingsBoard 服务进程可读取的系统或服务环境变量。变量名为 `SPRING_APPLICATION_JSON`；变量值仅填写从 `{` 到 `}` 的 JSON 内容，不包含 Bash 的 `export` 和外侧单引号。

只在当前 PowerShell 窗口设置 `$env:SPRING_APPLICATION_JSON` 不会更改已注册服务的环境。Windows 官方安装包通过 `install.bat` 配置扩展加载路径；修改安装位置或启动方式后，应确认实际加载路径包含扩展目录。

### 2\.5 启动并检查

按部署方式启动或重启 ThingsBoard：

- **Docker Compose：** 在 Compose 文件所在目录执行；若服务名不同，替换 `thingsboard`。

    ```Bash
    docker compose up -d thingsboard
    ```

    配置发生变化时，该命令会重建容器。仅重启已有容器不会应用修改后的环境变量或挂载配置。

- **Linux（****`.deb`**** 安装包）：** 重启系统服务。

    ```Bash
    sudo systemctl restart thingsboard
    ```

- **Windows：** 通过 Windows 服务管理器重启 ThingsBoard 服务。

确认日志包含扩展连接池初始化信息；启用表结构初始化时，还应出现 schema 创建完成信息：

```Plain Text
IoTDB Table Mode session pool initialized
IoTDB Table Mode schema bootstrap complete
```

启用实体属性存储时，日志中出现扩展替换 `jpaAttributeDao` 的 WARN 属于预期信息。若出现 `NoClassDefFoundError: org/apache/iotdb/isession/pool/ITableSessionPool`，请确认扩展目录包含模块 JAR 和全部 9 个依赖 JAR，并且该目录已加入 ThingsBoard 加载路径。

Linux `.deb` 服务日志通常位于 `/var/log/thingsboard/`；Windows 服务和容器的日志位置由其安装或运行方式决定。以前台进程运行时，日志通常输出到控制台或该进程配置的日志目录。

### 2\.6 验证数据

在 ThingsBoard 中创建设备并取得设备访问令牌。向设备遥测接口写入数据：

```HTTP
POST http://<ThingsBoard地址>:8080/api/v1/<设备访问令牌>/telemetry
Content-Type: application/json

{"temperature":23.75,"status":"ok"}
```

向客户端属性接口写入数据：

```HTTP
POST http://<ThingsBoard地址>:8080/api/v1/<设备访问令牌>/attributes
Content-Type: application/json

{"site":"local"}
```

可使用任意支持 HTTP 请求的客户端发送上述请求。Windows PowerShell 中请使用 `curl.exe`，或使用 `Invoke-RestMethod`；两者只是命令行调用方式不同。

写入后，在设备详情中查看数据：

- 在 **Latest telemetry（最新遥测）** 页面确认遥测键和值。

![ThingsBoard-Table-01.png](/img/ThingsBoard-Table-01.png)

- 在 **Attributes（属性）** 页面选择 **Client attributes（客户端属性）**，确认属性键和值。

![ThingsBoard-Table-02.png](/img/ThingsBoard-Table-02.png)

以上为页面示例，图中键值与本文写入样本不同，请以实际发送的数据为准。

等待遥测批量写入后，在 IoTDB 表模型 CLI 或 JDBC 客户端中查询。将 `<device-id>` 替换为 ThingsBoard 中该设备的 ID：

```SQL
USE thingsboard;

SELECT time, entity_id, key, bool_v, long_v, double_v, str_v, json_v
FROM telemetry
WHERE entity_id = '<device-id>'
ORDER BY time DESC
LIMIT 10;

SELECT time, entity_id, key, bool_v, long_v, double_v, str_v, json_v
FROM telemetry_latest
WHERE entity_id = '<device-id>'
ORDER BY time DESC
LIMIT 10;

SELECT time, entity_id, attribute_scope, key, bool_v, long_v, double_v, str_v, json_v
FROM entity_attributes
WHERE entity_id = '<device-id>'
ORDER BY time DESC
LIMIT 10;
```

对照实体 ID、键和值。遥测样本的 `ts` 和 `value` 存储在 `json_v` 中；表的 `time` 表示 IoTDB 行时间，不一定与请求中的样本时间戳相同。属性可按 scope 和对应类型列核对，例如 `CLIENT_SCOPE` 的字符串属性位于 `str_v`。ThingsBoard 设备页面中的最新遥测和属性也可用于回读检查。

## 3\. 存储路径配置

按需在 `SPRING_APPLICATION_JSON` 中保留相应存储选择器及参数：

|存储路径|配置|说明|
|---|---|---|
|历史遥测|`database.ts.type=iotdb-table`、`iotdb.ts.experimental-raw-only=true`|支持写入、原始查询、删除和时间窗口聚合。`experimental-raw-only` 是兼容性配置名，必须与历史遥测选择器同时设置。|
|最新遥测|`database.ts_latest.type=iotdb-table`、`iotdb.ts_latest.cluster_mode`|依赖历史遥测存储。未启用该选择器时，最新遥测仍由 ThingsBoard 原存储后端处理。|
|实体属性|`database.attributes.type=iotdb-table`、`iotdb.attributes.cluster_mode`|独立于遥测存储。启用后使用扩展提供的属性 DAO。|

启用最新遥测或实体属性存储时，必须为对应的 `cluster_mode` 设置有效值：

- 单个 ThingsBoard 节点使用 `disabled`。

- 多个 ThingsBoard 节点只有在同一设备或实体的最新遥测值和属性写入、更新及删除都能稳定路由至同一节点时，才使用 `sticky-routing`。该配置值不会自动配置 ThingsBoard 流量路由。

- 未配置粘性路由的多节点部署使用 `disabled` 时，不同节点并发更新同一最新值键或属性可能导致结果不一致。扩展不协调跨节点写入。

这里的“节点”指 ThingsBoard 节点，而不是 IoTDB 节点。`disabled` 不会关闭存储功能。启用了相应后端但未设置、留空或使用其他 `cluster_mode` 值时，ThingsBoard 会启动失败。

## 4\. 数据迁移与限制

- **已有数据：** 扩展不会自动迁移数据。已有实例切换前需完成回填并核对；启用属性存储后，未迁移的旧属性可能无法通过 ThingsBoard 读取。

- **数据保留：** IoTDB 按表设置 TTL，不会应用 ThingsBoard 的单条数据 TTL。`telemetry_latest` 默认不自动过期，也不受历史遥测表 TTL 影响，需单独规划保留策略。

- **数据类型：** 同一实体、键和时间戳的数据应保持类型一致，跨批次变更类型可能导致该数据点读取失败。

- **版本通知：** 最新遥测和属性操作返回的 `version` 为 `null`，依赖非空版本号的通知不会生效。

- **配置回退：** 恢复原存储配置不会自动迁回 IoTDB 中的数据；如需保留接入期间新增的数据，应另行安排回填或同步。

## 5\. 参考资料

完整配置参数、表结构和数据迁移映射等资料，请参见 [IoTDB ThingsBoard Table 扩展文档](https://github.com/apache/iotdb-extras/tree/v2.0.11/iotdb-thingsboard-table)。该目录的 `README.md` 提供模块概览，`docs/user-guide.md` 和 `docs/migration-guide.md` 分别提供详细使用说明与迁移说明。
