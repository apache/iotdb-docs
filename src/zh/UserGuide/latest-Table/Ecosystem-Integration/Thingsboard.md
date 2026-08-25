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
[ThingsBoard 树模型集成](../../latest/Ecosystem-Integration/Thingsboard.md)，后者需要使用
IoTDB 适配版 ThingsBoard。

## 1. 下载

已经验证的版本组合如下：

| 组件 | 版本 |
| --- | --- |
| IoTDB | 2.0.8，表模型 |
| ThingsBoard | 4.3.1.2 |
| JDK | 17 或更高版本 |

本模块尚未进入 ASF Release。请从 `apache/iotdb-extras` 官方源码的 commit `275043ed`
或更新版本构建：

```bash
git clone https://github.com/apache/iotdb-extras.git
cd iotdb-extras
git checkout 275043ed
mvn -P with-thingsboard -pl iotdb-thingsboard-table -am clean package
mvn -P with-thingsboard -pl iotdb-thingsboard-table -am \
    dependency:copy-dependencies -DincludeScope=runtime \
    -DoutputDirectory="$PWD/runtime-deps"
```

第二条命令会有意生成未经筛选的依赖目录。第 2 节列出了实际需要部署的运行期 jar；不要
直接复制整个目录。

## 2. 安装

必须先安装 ThingsBoard，再启用 IoTDB 选择器。ThingsBoard 安装器会解析由内置后端提供的
`TsDatabaseSchemaService`；若安装阶段已经启用本模块，安装会失败。

1. 安装并启动 IoTDB，参见 [IoTDB 快速上手](../QuickStart/QuickStart.md)。

   若 IoTDB 2.0.8 与 ThingsBoard 分别运行在容器中，请把两者放入同一 Docker 网络，并让
   IoTDB 公布网络内可达的服务名。`2.0.8-standalone` 镜像默认把这些地址绑定到
   `127.0.0.1`。假设 IoTDB 服务名为 `iotdb`，请设置：

   ```yaml
   cn_seed_config_node: iotdb:10710
   dn_seed_config_node: iotdb:10710
   cn_internal_address: iotdb
   dn_internal_address: iotdb
   dn_rpc_address: iotdb
   ```

2. 按常规方式安装 ThingsBoard，此时不要设置第 3 节的任何属性。
3. 创建部署用的 `lib/` 目录，从 `iotdb-thingsboard-table/target/` 复制模块的二进制 jar，
   再从 `runtime-deps/` 复制下方列出的 10 个运行期 jar。将这 11 个 jar 全部放到
   ThingsBoard classpath 上。

对于 ThingsBoard Docker 镜像，可将这些 jar 挂载或复制到
`/usr/share/thingsboard/extensions`。镜像使用的 `PropertiesLauncher` 已通过
`LOADER_PATH` 包含该目录。其他安装方式可能采用不同的 classpath 扩展机制。

部署目录必须正好包含 11 个 jar：模块本身，以及 `iotdb-session`、`isession`、
`service-rpc`、`iotdb-thrift`、`iotdb-thrift-commons`、`libthrift`、`pipe-api`、
`tsfile`、`common` 和 `xz`。不要直接放入 Maven 复制出的全部运行期依赖；其中包含
ThingsBoard 已自带的旧版本冲突项。特别是 `antlr4-runtime` 4.9.3 会盖住 ThingsBoard 的
4.13.0，导致 Spring Data JPA 无法启动。

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

属性路径要求构建中包含
[apache/iotdb-extras#125](https://github.com/apache/iotdb-extras/pull/125)，即上游
commit `275043ed` 或更新版本。更早的构建无法在原版 ThingsBoard 上启用属性选择器。

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

- 已验证版本为 IoTDB 2.0.8 和 ThingsBoard 4.3.1.2。其他 IoTDB 2.x 或 ThingsBoard
  版本需要单独验证。
- 属性写入和最新值覆盖层只在单个 JVM 内收敛。多写入者部署必须使用固定路由，或明确接受
  尽力而为的收敛。
- 最新值路径从时序表派生，并使用一个小型覆盖层承接仅写最新值和仅删最新值的路径。
- 保留策略使用 IoTDB 表级 TTL；其与 ThingsBoard 保留设置的对应关系参见模块的
  [用户指南](https://github.com/apache/iotdb-extras/blob/master/iotdb-thingsboard-table/docs/user-guide.md)。

设计、源码构建、迁移和编译接口验证细节保留在
[`iotdb-thingsboard-table` 模块](https://github.com/apache/iotdb-extras/tree/master/iotdb-thingsboard-table)
中。
