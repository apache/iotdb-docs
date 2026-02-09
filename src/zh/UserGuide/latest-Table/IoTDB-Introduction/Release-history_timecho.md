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
# 发布历史

## 1. TimechoDB（数据库内核）

### V2.0.8.1

> 发版时间：2026.02.04</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：timechodb-2.0.8.1-bin.zip</br>
> SHA512 校验码：49d97cbf488443f8e8e73cc39f6f320b3bc84b194aed90af695ebd5771650b5e5b6a3abb0fb68059bd01827260485b903c035657b337442f4fdd32c877f2aca3

V2.0.8.1 版本表模型新增 Object 数据类型，AINode 支持协变量预测以及支持并发推理功能，优化审计日志功能及全量数据同步功能，同时对数据库监控、性能、稳定性进行了全方位提升。具体发布内容如下：

* 存储模块：表模型新增 [Object 数据类型](../Background-knowledge/Data-Type_timecho.md)
* 查询模块：表模型新增多个系统表：[CONNECTIONS](../Reference/System-Tables_timecho.md#_2-18-connections-表)（实时连接追踪）、[CURRENT_QUERIES](../Reference/System-Tables_timecho.md#_2-19-current-queries-表)（活跃查询监控）、[QUERIES_COSTS_HISTOGRAM](../Reference/System-Tables_timecho.md#_2-20-queries-costs-histogram-表)（查询耗时分布）
* 系统模块：优化[审计日志](../User-Manual/Audit-Log_timecho.md)功能
* AI 模块：支持[协变量预测及并发推理](../AI-capability/AINode_Upgrade_timecho.md)功能
* 其他模块：升级 [OPC UA 协议](../../latest/API/Programming-OPC-UA_timecho.md)，支持数据推送

### V2.0.6.6

> 发版时间：2026.01.20</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：timechodb-2.0.6.6-bin.zip</br>
> SHA512 校验码：d12e60b8119690d63c501d0c2afcd527e39df8a8786198e35b53338e21939e1a9244805e710d81cbb62d02c2739909d7e8227c029660a0cd9ea7ca718cf9bdf6

V2.0.6.6 版本主要优化了树模型时间序列的查询性能，同时对数据库监控、性能、稳定性进行了全方位提升。具体发布内容如下：

* 查询模块：优化了 show/count timeseries/devices 的查询性能
* 其他：修复安全漏洞 CVE-2025-12183，CVE-2025-66566 and CVE-2025-11226

### V2.0.6.4

> 发版时间：2025.11.17</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：timechodb-2.0.6.4-bin.zip</br>
> SHA512 校验码：57b9998cc14632862c32b6781c70db1c52caf8172b5d45d27cc214cab50d3afd4230ed0754e1c1a4ed825666bf971dc81fbb7d3b93261e57e9dabc20e794a2b8

V2.0.6.4 版本主要优化了存储以及 AINode 模块的相关功能，修复了部分产品缺陷，同时对数据库监控、性能、稳定性进行了全方位提升。具体发布内容如下：

* 存储模块：支持树模型修改时间序列的编码及压缩方式
* AINode：支持一键部署，优化了模型推理功能

### V2.0.6.1

> 发版时间：2025.09.19</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：timechodb-2.0.6.1-bin.zip</br>
> SHA512 校验码：c88e3e2c0dbd06578bd0697ca9992880b300baee2c4906ba1f952134e37ae2fa803a6af236f4541d318b75f43a498b5d5bfbbc7c445783271076c36e696e4dd0

V2.0.6.1 版本新增表模型查询写回功能，新增访问控制黑白名单功能，新增位操作函数（内置标量函数）以及可下推的时间函数，同时对数据库监控、性能、稳定性进行了全方位提升。具体发布内容如下：

* 查询模块：支持表模型查询写回功能
* 查询模块：表模型行模式识别支持使用聚合函数，捕获连续数据进行分析计算
* 查询模块：表模型新增内置标量函数-位操作函数
* 查询模块：表模型新增可下推的 EXTRACT 时间函数
* 系统模块：新增访问控制，支持用户自定义配置黑白名单功能
* 其他：用户默认密码更新为安全强度更高的“TimechoDB@2021”

### V2.0.5.2

> 发版时间：2025.08.08</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：timechodb-2.0.5.2-bin.zip</br>
> SHA512 校验码：a00a4075c9937b7749c454f71d2480fea5e9ff9659c0628b132e30e2f256c7c537cd91dca4f6be924db0274bb180946a1b88e460c025bf82fdb994a3c2c7b91e

V2.0.5.2 版本修复了部分产品缺陷，优化了数据同步功能，同时对数据库监控、性能、稳定性进行了全方位提升。

### V2.0.5.1

> 发版时间：2025.07.14</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：timechodb-2.0.5.1-bin.zip</br>
> SHA512 校验码：aa724755b659bf89a60da6f2123dfa91fe469d2e330ed9bd029e8f36dd49212f3d83b1025e9da26cb69315e02f65c7e9a93922e40df4f2aa4c7f8da8da2a4cea

V2.0.5.1 版本新增树转表视图、表模型窗口函数、聚合函数 approx\_most\_frequent，并支持 LEFT & RIGHT JOIN、ASOF LEFT JOIN；AINode 新增 Timer-XL、Timer-Sundial 两种内置模型，支持树、表模型推理及微调功能，同时对数据库监控、性能、稳定性进行了全方位提升。具体发布内容如下：

* 查询模块：支持手动创建树转表视图
* 查询模块：表模型新增窗口函数
* 查询模块：表模型新增聚合函数 approx\_most\_frequent
* 查询模块：表模型 JOIN 功能扩展，支持 LEFT & RIGHT JOIN、ASOF LEFT JOIN
* 查询模块：表模型支持行模式识别，可捕获连续数据进行分析计算
* 查询模块：表模型新增多个系统表，例如：VIEWS（表视图信息）、MODELS（模型信息）等
* 系统模块：新增 TsFile 数据文件加密功能
* AI 模块：AINode 新增 Timer-XL、Timer-Sundial 两种内置模型
* AI 模块：AINode 支持树模型、表模型的推理及微调功能
* 其他模块：支持通过 OPC DA 协议发布数据

### 2.x 其他历史版本

#### V2.0.4.2

> 发版时间：2025.06.21</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：timechodb-2.0.4.2-bin.zip</br>
> SHA512 校验码：31f26473ac90988ce970dac8d0950671bde918f9af6f2f6a6c2bf99a53aa1c0a459c53a137b18ff0b28e70952e9c4b6acb50029e0b2e38837b969eb8f78f2939

V2.0.4.2 版本支持了传递 TOPIC 给 MQTT 自定义插件，同时对数据库监控、性能、稳定性进行了全方位提升。

#### V2.0.4.1

> 发版时间：2025.06.03</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：timechodb-2.0.4.1-bin.zip</br>
> SHA512 校验码：93ac08bfae06aff6db04849f474458433026f66778f4f5c402eb22f1a7cb14d8096daf0a9e9cc365ddfefd4f8ca4443b2a9fb6461906f056b1e6a344990beb3a

V2.0.4.1 版本表模型新增用户自定义表函数（UDTF）及多种内置表函数、新增聚合函数 approx\_count\_distinct、新增支持针对时间列的 ASOF INNER JOIN，并对脚本工具进行了分类整理，将 Windows 平台专用脚本独立，同时对数据库监控、性能、稳定性进行了全方位提升。具体发布内容如下：

* 查询模块：表模型新增用户自定义表函数（UDTF）及多种内置表函数
* 查询模块：表模型支持针对时间列的 ASOF INNER JOIN
* 查询模块：表模型新增聚合函数 approx\_count\_distinct
* 流处理：支持通过 SQL 异步加载 TsFile
* 系统模块：缩容时，副本选择支持容灾负载均衡策略
* 系统模块：适配 Window Server 2025
* 脚本与工具：对脚本工具进行了分类整理，并将 Windows 平台专用脚本独立

#### V2.0.3.4

> 发版时间：2025.06.13</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：timechodb-2.0.3.4-bin.zip</br>
> SHA512 校验码：d80d34b7d3890def75b17c491fc4c13efc36153a5950a9b23744755d04d6adb5d6ab9ec970101183fef7bfeb8a559ef92fce90d2d22f7b7fd5795cd5589461bb

V2.0.3.4版本将用户密码的加密算法变更为 SHA-256，同时对数据库监控、性能、稳定性进行了全方位提升。

#### V2.0.3.3

> 发版时间：2025.05.16</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：timechodb-2.0.3.3-bin.zip</br>
> SHA512 校验码：f47e3fb45f869dbe690e7cfaa93f95e5e08a462b362aa9d7ccac7ee5b55022dc8f62db12009dfde055f278f3003ff9ea7c22849d52a3ef2c25822f01ade78591

V2.0.3.3 版本新增元数据导入导出脚本适配表模型、Spark 生态集成（表模型）、AINode 返回结果新增时间戳，表模型新增部分聚合函数和标量函数，同时对数据库监控、性能、稳定性进行了全方位提升。具体发布内容如下：

* 查询模块：表模型新增聚合函数 count\_if 和标量函数 greatest / least
* 查询模块：表模型全表 count(\*) 查询性能显著提升
* AI 模块：AINode 返回结果新增时间戳
* 系统模块：表模型元数据模块性能优化
* 系统模块：表模型支持主动监听并加载 TsFile 功能
* 系统模块：新增 TsFile 解析转换时间、TsFile 转 Tablet 数量等监控指标
* 生态集成：表模型生态拓展集成 Spark
* 脚本与工具：import-schema、export-schema 脚本支持表模型元数据导入导出

#### V2.0.3.2

> 发版时间：2025.05.15</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：timechodb-2.0.3.2-bin.zip</br>
> SHA512 校验码：76bd294de4b01782e5dd621a996aeb448e4581f98c70fb5b72b17dc392c2e1227c0d26bd3df5533669a80f217a83a566bc6ec926b7efd21ce7a89b894cd33e19

V2.0.3.2版本修复了部分产品缺陷，优化了节点移除功能，同时对数据库监控、性能、稳定性进行了全方位提升。

#### V2.0.2.1

> 发版时间：2025.04.07</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：timechodb-2.0.2.1-bin.zip</br>
> SHA512 校验码：a41be3f8c57e6a39ac165f1d6ab92c9ed790b0712528f31662c58617f4c94e6bfc9392a9c1ef2fc5bdd8c7ca79901389f368cbdbec3e5b1d5c1ce155b2f1a457

V2.0.2.1 版本新增了表模型权限管理、用户管理以及相关操作鉴权，并新增了表模型 UDF、系统表和嵌套查询等功能。此外，持续优化数据订阅机制，同时对数据库监控、性能、稳定性进行了全方位提升。具体发布内容如下：

* 查询模块：新增表模型 UDF 的管理、用户自定义标量函数（UDSF）和用户自定义聚合函数（UDAF）
* 查询模块：用户可通过配置项控制 UDF、PipePlugin、Trigger 和 AINode 通过 URI 加载 jar 包
* 查询模块：表模型支持权限管理、用户管理以及相关操作鉴权
* 查询模块：新增系统表及多种运维语句，优化系统管理
* 系统模块：CSharp 客户端支持表模型
* 系统模块：新增表模型 C++ Session 写入接口
* 系统模块：多级存储支持符合 S3 协议的非 AWS 对象存储系统
* 系统模块：UDF 函数拓展，新增 pattern\_match 模式匹配函数
* 数据同步：表模型支持元数据同步及同步删除操作

#### V2.0.1.2

> 发版时间：2025.01.25</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：timechodb-2.0.1.2-bin.zip</br>
> SHA512 校验码：51c2fa5da2974a8a3c8871dec1c49bd98e5d193a13ef33ac7801adb833a1e360d74f0160bcdf33c7ffb23a5c5e0f376e26a4315cf877f1459483356285b85349

V2.0.1.2 版本正式实现树表双模型配置，并配合表模型支持标准 SQL 查询语法、多种函数和运算符、流处理、Benchmark 等功能。此外，该版本更新还包括：Python 客户端支持四种新数据类型，支持只读模式下的数据库删除操作，脚本工具同时兼容 TsFile、CSV 和 SQL 数据的导入导出，对 Kubernetes Operator 的生态集成等功能，同时对数据库监控、性能、稳定性进行了全方位提升。具体发布内容如下：

* 时序表模型：IoTDB 支持了时序表模型，提供的 SQL 语法包括 SELECT、WHERE、JOIN、GROUP BY、ORDER BY、LIMIT 子句和嵌套查询
* 查询模块：表模型支持多种函数和运算符，包括逻辑运算符、数学函数以及时序特色函数 DIFF 等
* 查询模块：用户可通过配置项控制 UDF、PipePlugin、Trigger 和 AINode 通过 URI 加载 jar 包
* 存储模块：表模型支持通过 Session 接口进行数据写入，Session 接口支持元数据自动创建
* 存储模块：Python 客户端新增支持四种新数据类型：`String`、`Blob`、`Date` 和 `Timestamp`
* 存储模块：优化同种类合并任务优先级的比较规则
* 流处理模块：支持在发送端指定接收端鉴权信息
* 流处理模块：TsFile Load 支持表模型
* 流处理模块：流处理插件适配表模型
* 系统模块：增强了 DataNode 缩容的稳定性
* 系统模块：在 readonly 状态下，支持用户进行 drop database 操作
* 脚本与工具：Benchmark 工具适配表模型
* 脚本与工具： Benchmark 工具支持四种新数据类型：`String`、`Blob`、`Date` 和 `Timestamp`
* 脚本与工具：data/export-data 脚本扩展，支持新数据类型（字符串、大二进制对象、日期、时间戳）
* 脚本与工具：import-data/export-data 脚本迭代，同时兼容 TsFile、CSV 和 SQL 三种类型数据的导入导出
* 生态集成：支持 Kubernetes Operator


### V1.3.6.6

> 发版时间：2026.01.20</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：iotdb-enterprise-1.3.6.6-bin.zip</br>
> SHA512 校验码：590d3ead053298c6df0ede637572ba598b9b684f8b35ab874bd4452f765e1421938f4cca2cf0423af2e806592aa8b15bdd25b41df7de809435a4d0239fc04790

V1.3.6.6 版本优化了数据的读写功能，修复了部分产品缺陷，同时对数据库监控、性能、稳定性进行了全方位提升。

### V1.3.6.3

> 发版时间：2026.01.04</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：iotdb-enterprise-1.3.6.3-bin.zip</br>
> SHA512 校验码：43719a1384f59f63cb0029cdda0aba433383cd1a0f5ebc142e54f8aa6623cc30a7efb3e3aef7f3d485d5e07bec91be215c92ed21b5201613d5cc44044251c978

V1.3.6.3 版本主要围绕查询性能、内存管理机制两大核心方向进行了深度优化，对数据库监控、性能、稳定性进行了全方位提升。具体发布内容如下：

* 查询模块：优化多种场景的查询性能，包括多序列 Last 查询等
* 查询模块：Java SDK 新增 FastLastQuery 接口，支持更高效的 Last 查询操作
* 查询模块：树模型 fetchSchema 调整为分段流式返回，提升大数据量场景下的响应速度
* 存储模块：优化内存管理，避免内存泄漏风险，保障系统长期稳定运行
* 存储模块：优化文件合并机制，提升合并处理效率，优化系统存储资源占用
* 其他：修复安全漏洞 CVE-2025-12183，CVE-2025-66566 and CVE-2025-11226


### V1.3.6.1

> 发版时间：2025.12.09</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：iotdb-enterprise-1.3.6.1-bin.zip</br>
> SHA512 校验码：9fb6a6870aa2133bfc40508324a7d97ee078d0d44895beef7b0a331edd203419119fb02b933f585b6c4a6fe9b59708a053d7cf65206b22b1a4f01a5fe518424c

V1.3.6.1 版本主要围绕数据同步稳定性这一核心方向进行了深度优化，对数据库监控、性能、稳定性进行了全方位提升。具体发布内容如下：

* 数据同步：优化 Pipe SQL 参数配置，支持指定异步加载方式
* 数据同步：新增语法糖功能，可将全量 Pipe 创建 SQL 自动拆分为实时同步与历史同步两类
* 系统模块：新增全局数据类型压缩方式配置项，支持按需调整存储压缩策略


### V1.3.5.11

> 发版时间：2025.09.24</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：iotdb-enterprise-1.3.5.11-bin.zip</br>
> SHA512 校验码：f18419e20c0d7e9316febee5a053306a97268cb07e18e6933716c2ef98520fbbe051dfa1da02a9c83e8481a839ce35525ce6c50f890f821e3d760f550c75f804

V1.3.5.11 版本主要优化了数据同步功能，修复了部分产品缺陷，同时对数据库监控、性能、稳定性进行了全方位提升。

### V1.3.5.10

> 发版时间：2025.08.27</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：iotdb-enterprise-1.3.5.10-bin.zip</br>
> SHA512 校验码：3aea6d2318f52b39bfb86dae9ff06fe1b719fdeceaabb39278c9a73544e1ceaf0660339f9342abb888c8281a0fb6144179dac9bb0c40ba0ecc66bac4dd7cbe80

V1.3.5.10 版本修复了部分产品缺陷，同时对数据库监控、性能、稳定性进行了全方位提升。

### V1.3.5.9

> 发版时间：2025.08.25</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：iotdb-enterprise-1.3.5.9-bin.zip</br>
> SHA512 校验码：95b7a6790e94dc88e355a81e5a54b10ee87bdadae69ba0b215273967b3422178d5ee81fa5adf1c5380a67dbb30cf9782eaa3cbfd6ec744b0fd9a91c983ee8f70

V1.3.5.9 版本优化了内存控制，修复了部分产品缺陷，同时对数据库监控、性能、稳定性进行了全方位提升。
### 1.x 其他历史版本

#### V1.3.5.8

> 发版时间：2025.08.19</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：iotdb-enterprise-1.3.5.8-bin.zip</br>
> SHA512 校验码：aa9802301614e20294a7f2fc4c149ba20d58213d9b74e8f8c607e0f4860949bad164bce2851b63c1d39b7568d62975ab257c269b3a9c168a29ea3945b6d28982

V1.3.5.8 版本优化了数据同步功能，修复了部分产品缺陷，同时对数据库监控、性能、稳定性进行了全方位提升。

#### V1.3.5.7

> 发版时间：2025.08.13</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：iotdb-enterprise-1.3.5.7-bin.zip</br>
> SHA512 校验码：17374a440267aed3507dcc8cf4dc8703f8136d5af30d16206a6e1101e378cbbc50eda340b1598a12df35fe87d96db20f7802f0e64033a013d4b81499198663d4

V1.3.5.7 版本优化了数据同步功能，修复了部分产品缺陷，同时对数据库监控、性能、稳定性进行了全方位提升。

#### V1.3.5.6

> 发版时间：2025.07.16</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：iotdb-enterprise-1.3.5.6-bin.zip</br>
> SHA512 校验码：05b9fda4d98ba8a1c9313c0831362ed3d667ce07cb00acaeabcf6441a6d67dff7da27f3fda2a5e1b3c3b85d1e5c730a534f3aa2f0c731b8c03ef447203b32493

V1.3.5.6 版本新增配置项开关支持禁用数据订阅功能，优化了C++高可用客户端，以及正常情况、重启、删除三个场景下的 PIPE 同步延迟问题，和大 TEXT 对象时的查询问题，同时对数据库监控、性能、稳定性进行了全方位提升。

#### V1.3.5.4

> 发版时间：2025.06.19</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：iotdb-enterprise-1.3.5.4-bin.zip</br>
> SHA512 校验码：edac5f8b70dd67b3f84d3e693dc025a10b41565143afa15fc0c4937f8207479ffe2da787cc9384440262b1b05748c23411373c08606c6e354ea3dcdba0371778

V1.3.5.4 版本修复了部分产品缺陷，优化了节点移除功能，同时对数据库监控、性能、稳定性进行了全方位提升。

#### V1.3.5.3

> 发版时间：2025.06.13</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：iotdb-enterprise-1.3.5.3-bin.zip</br>
> SHA512 校验码：5f807322ceec9e63a6be86108cc57e7ad4251b99a6c28baf11256ab65b2145768e9110409f89834d5f4256094a8ad995775c0e59a17224ff2627cd9354e09d82

V1.3.5.3 版本主要优化了数据同步功能，包括持久化 PIPE 发送进度，增加 PIPE 事件传输时间监控项，并修复了相关缺陷；另外将用户密码的加密算法变更为 SHA-256，同时对数据库监控、性能、稳定性进行了全方位提升。

#### V1.3.5.2

> 发版时间：2025.06.10</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：iotdb-enterprise-1.3.5.2-bin.zip</br>
> SHA512 校验码：4c0a5db76c6045dfd27cce303546155cdb402318024dae5f999f596000d7b038b13bbeac39068331b5c6e2c80bc1d89cd346dd0be566fe2fe865007d441d9d05

V1.3.5.2 版本主要优化了数据同步功能，包括支持通过使用参数进行级联配置，支持同步和实时写入顺序完全一致；支持系统重启后历史数据和实时数据分区发送，同时对数据库监控、性能、稳定性进行了全方位提升。

#### V1.3.5.1

> 发版时间：2025.05.15</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：iotdb-enterprise-1.3.5.1-bin.zip</br>
> SHA512 校验码：91f22bafbdd4d580126ed59ba1ba99d14209f10ce4a0a4bd7d731943ac99fdb6ebfab6e3a1e294a7cb7f46367e9fd4252b0d9ac4d4240ddedf6d85658e48f212

V1.3.5.1 版本修复了部分产品缺陷，同时对数据库监控、性能、稳定性进行了全方位提升。

#### V1.3.4.2

> 发版时间：2025.04.14</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：iotdb-enterprise-1.3.4.2-bin.zip</br>
> SHA512 校验码：52fbd79f5e7256e7d04edc8f640bb8d918e837fedd1e64642beb2b2b25e3525b5f5a4c92235f88f6f7b59bfcdf096e4ea52ab85bfef0b69274334470017a2c5b2

V1.3.4.2 版本优化了数据同步功能，支持双活之间同步外部 PIPE 转发而来的数据。


#### V1.3.4.1

> 发版时间：2025.01.08</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：iotdb-enterprise-1.3.4.1-bin.zip</br>
> SHA512 校验码：e9d46516f1f25732a93cc915041a8e59bca77cf8a1018c89d18ed29598540c9f2bdf1ffae9029c87425cecd9ecb5ebebea0334c7e23af11e28d78621d4a78148

V1.3.4.1 版本新增模式匹配函数、持续优化数据订阅机制，提升稳定性、import-data/export-data 脚本扩展支持新数据类型，import-data/export-data 脚本合并同时兼容 TsFile、CSV 和 SQL 三种类型数据的导入导出等功能，同时对数据库监控、性能、稳定性进行了全方位提升。具体发布内容如下：

- 查询模块：用户可通过配置项控制 UDF、PipePlugin、Trigger 和 AINode 通过 URI 加载 jar 包
- 系统模块：UDF 函数拓展，新增 pattern_match 模式匹配函数
- 数据同步：支持在发送端指定接收端鉴权信息
- 生态集成：支持 Kubernetes Operator 
- 脚本与工具：import-data/export-data 脚本扩展，支持新数据类型（字符串、大二进制对象、日期、时间戳）
- 脚本与工具：import-data/export-data 脚本迭代，同时兼容 TsFile、CSV 和 SQL 三种类型数据的导入导出

#### V1.3.3.3

> 发版时间：2024.10.31</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：iotdb-enterprise-1.3.3.3-bin.zip</br>
> SHA512 校验码：4a3eceda479db3980e9c8058628e71ba5a16fbfccf70894e8181aea5e014c7b89988d0093f6d42df29d478340a33878602a3924bec13f442a48611cec4e0e961

V1.3.3.3版本增加优化重启恢复性能，减少启动时间、DataNode 主动监听并加载 TsFile，同时增加可观测性指标、发送端支持传文件至指定目录后，接收端自动加载到IoTDB、Alter Pipe 支持 Alter Source 的能力等功能，同时对数据库监控、性能、稳定性进行了全方位提升。具体发布内容如下：

- 数据同步：接收端支持对不一致数据类型的自动转换
- 数据同步：接收端增强可观测性，支持多个内部接口的 ops/latency 统计
- 数据同步：opc-ua-sink 插件支持 CS 模式访问和非匿名访问方式
- 数据订阅： SDK 支持 create if not exists 和 drop if exists 接口
- 流处理：Alter Pipe 支持 Alter Source 的能力
- 系统模块：新增 rest 模块的耗时监控
- 脚本与工具：支持加载自动加载指定目录的TsFile文件
- 脚本与工具：import-tsfile脚本扩展，支持脚本与iotdb server不在同一服务器运行
- 脚本与工具：新增对Kubernetes Helm的支持
- 脚本与工具：Python 客户端支持新数据类型（字符串、大二进制对象、日期、时间戳）

#### V1.3.3.2

> 发版时间：2024.8.15</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：iotdb-enterprise-1.3.3.2-bin.zip</br>
> SHA512 校验码：32733610da40aa965e5e9263a869d6e315c5673feaefad43b61749afcf534926398209d9ca7fff866c09deb92c09d950c583cea84be5a6aa2c315e1c7e8cfb74

V1.3.3.2版本支持输出读取mods文件的耗时、输入最大顺乱序归并排序内存 以及dispatch 耗时、通过参数配置对时间分区原点的调整、支持根据 pipe 历史数据处理结束标记自动结束订阅，同时合并了模块内存控制性能提升，具体发布内容如下：

- 查询模块：Explain Analyze 功能支持输出读取mods文件的耗时
- 查询模块：Explain Analyze 功能支持输入最大顺乱序归并排序内存以及 dispatch 耗时
- 存储模块：新增合并目标文件拆分功能，增加配置文件参数
- 系统模块：支持通过参数配置对时间分区原点的调整
- 流处理：数据订阅支持根据 pipe 历史数据处理结束标记自动结束订阅
- 数据同步：RPC 压缩支持指定压缩等级
- 脚本与工具：数据/元数据导出只过滤 root.__system，不对root.__systema 等开头的数据进行过滤

#### V1.3.3.1

> 发版时间：2024.7.12</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：iotdb-enterprise-1.3.3.1-bin.zip</br>
> SHA512 校验码：1fdffbc1f18bfabfa3463a5a6fbc4f6ba6ab686942f9e85e7e6be1840fb8700e0147e5e73fd52201656ae6adb572cc2e5ecc61bcad6fa4c5a4048c4207e3c6c0

V1.3.3.1版本多级存储增加限流机制、数据同步支持在发送端 sink 指定接收端使用用户名密码密码鉴权，优化了数据同步接收端一些不明确的WARN日志、重启恢复性能，减少启动时间，同时对脚本内容进行了合并，具体发布内容如下：

- 查询模块：Filter 性能优化，提升聚合查询和where条件查询的速度
- 查询模块：Java Session客户端查询 sql 请求均分到所有节点
- 系统模块：将"iotdb-confignode.properties、iotdb-datanode.properties、iotdb-common.properties"配置文件合并为" iotdb-system.properties"
- 存储模块：多级存储增加限流机制
- 数据同步：数据同步支持在发送端 sink 指定接收端使用用户名密码密码鉴权
- 系统模块：优化重启恢复性能，减少启动时间

#### V1.3.2.2

> 发版时间：2024.6.4</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：iotdb-enterprise-1.3.2.2-bin.zip</br>
> SHA512 校验码：ad73212a0b5025d18d2481163f6b2d4f604e06eb5e391cc6cba7bf4e42792e115b527ed8bfb5cd95d20a150645c8b4d56a531889dac229ce0f63139a27267322

V1.3.2.2 版本新增 explain analyze 语句分析单个 SQL 查询耗时、新增 UDAF 用户自定义聚合函数框架、支持磁盘空间到达设置阈值自动删除数据、元数据同步、统计指定路径下数据点数、SQL 语句导入导出脚本等功能，同时集群管理工具支持滚动升级、上传插件到整个集群，同时对数据库监控、性能、稳定性进行了全方位提升。具体发布内容如下：

- 存储模块：insertRecords 接口写入性能提升
- 存储模块：新增 SpaceTL 功能，支持磁盘空间到达设置阈值自动删除数据
- 查询模块：新增 Explain Analyze 语句（监控单条 SQL 执行各阶段耗时）
- 查询模块：新增 UDAF 用户自定义聚合函数框架
- 查询模块：UDF 新增包络解调分析
- 查询模块：新增 MaxBy/MinBy 函数，支持获取最大/小值的同时返回对应时间戳
- 查询模块：值过滤查询性能提升
- 数据同步：路径匹配支持通配符
- 数据同步：支持元数据同步（含时间序列及相关属性、权限等设置）
- 流处理：增加 Alter Pipe 语句，支持热更新 Pipe 任务的插件
- 系统模块：系统数据点数统计增加对 load TsFile 导入数据的统计
- 脚本与工具：新增本地升级备份工具（通过硬链接对原有数据进行备份）
- 脚本与工具：新增 export-data/import-data 脚本，支持将数据导出为 CSV、TsFile 格式或 SQL 语句
- 脚本与工具：Windows 环境支持通过窗口名区分 ConfigNode、DataNode、Cli

#### V1.3.1.4

> 发版时间：2024.4.23</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：iotdb-enterprise-1.3.1.4-bin.zip</br>
> SHA512 校验码：8547702061d52e2707c750a624730eb2d9b605b60661efa3c8f11611ca1685aeb51b6f8a93f94c1b30bf2e8764139489c9fbb76cf598cfa8bf9c874b2a7c57eb

V1.3.1 版本增加系统激活情况查看、内置方差/标准差聚合函数、内置Fill语句支持超时时间设置、tsfile修复命令等功能，增加一键收集实例信息脚本、一键启停集群等脚本，并对视图、流处理等功能进行优化，提升使用易用度和版本性能。具体发布内容如下：

- 查询模块：Fill 子句支持设置填充超时阈值，超过时间阈值不填充
- 查询模块：Rest 接口（V2 版）增加列类型返回
- 数据同步：数据同步简化时间范围指定方式，直接设置起止时间
- 数据同步：数据同步支持 SSL 传输协议（iotdb-thrift-ssl-sink 插件）
- 系统模块：支持使用 SQL 查询集群激活信息
- 系统模块：多级存储增加迁移时传输速率控制
- 系统模块：系统可观测性提升（增加集群节点的散度监控、分布式任务调度框架可观测性）
- 系统模块：日志默认输出策略优化
- 脚本与工具：增加一键启停集群脚本（start-all/stop-all.sh & start-all/stop-all.bat）
- 脚本与工具：增加一键收集实例信息脚本（collect-info.sh & collect-info.bat）

#### V1.3.0.4

> 发版时间：2024.1.3</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：iotdb-enterprise-1.3.0.4-bin.zip</br>
> SHA512 校验码：3c07798f37c07e776e5cd24f758e8aaa563a2aae0fb820dad5ebf565ad8a76c765b896d44e7fdb7dad2e46ffd4262af901c765f9bf6af926bc62103118e38951

V1.3.0.4 发布了全新内生机器学习框架 AINode，全面升级权限模块支持序列粒度授予权限，并对视图、流处理等功能进行诸多细节优化，进一步提升了产品的使用易用度，并增强了版本稳定性和各方面性能。具体发布内容如下：

- 查询模块：新增 AINode 内生机器学习模块
- 查询模块：优化 show path 语句返回时间长的问题
- 安全模块：升级权限模块，支持时间序列粒度的权限设置
- 安全模块：支持客户端与服务器 SSL 通讯加密
- 流处理：流处理模块新增多种 metrics 监控项
- 查询模块：非可写视图序列支持 LAST 查询
- 系统模块：优化数据点监控项统计准确性

#### V1.2.0.1

> 发版时间：2023.6.30</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：iotdb-enterprise-1.2.0.1-bin.zip</br>
> SHA512 校验码：dcf910d0c047d148a6c52fa9ee03a4d6bc3ff2a102dc31c0864695a25268ae933a274b093e5f3121689063544d7c6b3b635e5e87ae6408072e8705b3c4e20bf0

V1.2.0.1主要增加了流处理框架、动态模板、substring/replace/round内置查询函数等新特性，增强了show region、show timeseries、show variable等内置语句功能和Session接口，同时优化了内置监控项及其实现，修复部分产品bug和性能问题。

- 流处理：新增流处理框架
- 元数据模块：新增模板动态扩充功能
- 存储模块：新增SPRINTZ和RLBE编码以及LZMA2压缩算法
- 查询模块：新增cast、round、substr、replace内置标量函数
- 查询模块：新增time_duration、mode内置聚合函数
- 查询模块：SQL语句支持case when语法
- 查询模块：SQL语句支持order by表达式
- 接口模块：Python API支持连接分布式多个节点
- 接口模块：Python客户端支持写入重定向
- 接口模块：Session API增加用模板批量创建序列接口

#### V1.1.0.1

> 发版时间：2023-04-03</br>
> 下载地址：请联系天谋工作人员进行下载</br>
> 安装包名称：iotdb-enterprise-1.1.0.1.zip</br>
> SHA512 校验码：58df58fc8b11afeec8436678842210ec092ac32f6308656d5356b7819acc199f1aec4b531635976b091b61d6736f0d9706badcabeaa5de50939e5c331c1dc804

V1.1.0.1主要改进增加了部分新特性，如支持 GROUP BY VARIATION、GROUP BY CONDITION 等分段方式、增加 DIFF、COUNT_IF 等实用函数，引入 pipeline 执行引擎进一步提升查询速度等。同时修复对齐序列 last 查询 order by timeseries、LIMIT&OFFSET 不生效、重启后元数据模版错误、删除所有 database 后创建序列错误等相关问题。

- 查询模块：align by device 语句支持 order by time
- 查询模块：支持 Show Queries 命令
- 查询模块：支持 kill query 命令
- 系统模块：show regions 支持指定特定的 database
- 系统模块：新增 SQL show variables， 可以展示当前集群参数
- 查询模块：聚合查询支持 GROUP BY VARIATION 
- 查询模块：SELECT INTO 支持特定的数据类型强转
- 查询模块：实现内置标量函数 DIFF 
- 系统模块：show regions 显示创建时间
- 查询模块：实现内置聚合函数 COUNT_IF 
- 查询模块：聚合查询支持  GROUP BY CONDITION
- 系统模块：支持修改 dn_rpc_port 和 dn_rpc_address 


## 2. Workbench（控制台工具）

| **控制台版本号** | **版本说明**                                                 | **可支持IoTDB版本**       | **SHA512 校验码**                                           |
| ---------------- | ------------------------------------------------------------ | ------------------------- | ------------------------------------------------------------ |
| V2.1.1           | 优化趋势界面测点选择，支持无设备场景                         | V2.0 及以上版本           | aa05fd4d9f33f07c0949bc2d6546bb4b9791ed5ea94bcef27e2bf51ea141ec0206f1c12466aced7bf3449e11ad68d65378d697f3d10cb4881024a83746029a65 |
| V2.0.1-beta      | V2.x系列首个版本，支持树、表双模型                           | V2.0 及以上版本           | 0ca0d5029874ed8ada9c7d1cb562370b3a46913eed66d39c08759287ccc8bf332cf80bb8861e788614b61ae5d53a9f5605f553e1a607e856f395eb5102e7cc4d |
| V1.5.7           | 优化测点列表中测点名称拆分为设备名称和测点，测点选择区域支持左右滚动，以及导出文件列顺序与页面保持一致 | V1.3.4及以上的1.x系列版本 | d3cd4a63372ca5d6217b67dddf661980c6a442b3b1564235e9ad34fc254d681febd58c2cc59c6273ffbfd8a1b003b9adb130ecfaaebe1942003b0d07427b1fcc |
| V1.5.6           | 优化 CSV 格式导入导出功能：导入时，支持标签、别名为非必填项；导出时，支持测点描述里反引号包裹引号的场景 | V1.3.4及以上的1.x系列版本 | 276ac1ea341f468bf6d29489c9109e9aa61afe2d1caaab577bc40603c6f4120efccc36b65a58a29ce6a266c21b46837aad6128f84ba5e676231ea9e6284a35e5 |
| V1.5.5           | 新增服务器时钟，支持企业版激活数据库                         | V1.3.4及以上的1.x系列版本 | b18d01b70908d503a25866d1cc69d14e024d5b10ca6fcc536932fdbef8257c66e53204663ce3be5548479911aca238645be79dfd7ee7e65a07ab3c0f68c497f6 |
| V1.5.4           | 新增实例管理中prometheus设置的认证功能                       | V1.3.4及以上的1.x系列版本 | adc7e13576913f9e43a9671fed02911983888da57be98ec8fbbb2593600d310f69619d32b22b569520c88e29f100d7ccae995b20eba757dbb1b2825655719335 |
| V1.5.1           | 新增AI分析功能以及模式匹配功能                               | V1.3.2及以上的1.x系列版本 | 4f2053a2a3b2b255ce195268d6cd245278f3be32ba4cf68be1552c386d78ed4424f7bdc9d8e68c6b8260b3e398c8fd23ff342439c4e88e1e777c62640d2279f9 |
| V1.4.0           | 新增树模型展示及英文版                                       | V1.3.2及以上的1.x系列版本 | 734077f3bb5e1719d20b319d8b554ce30718c935cb0451e02b2c9267ff770e9c2d63b958222f314f16c2e6e62bf78b643255249b574ee6f37d00e123433981e8 |
| V1.3.1           | 分析功能新增分析方式，优化导入模版等功能                     | V1.3.2及以上的1.x系列版本 | 134f87101cc7f159f8a22ac976ad2a3a295c5435058ee0a15160892aac46ac61dd3cfb0633b4aea9cc7415bf904d0ae65aaf77d663f027d864204d81fb34768b |
| V1.3.0           | 新增数据库配置功能，优化部分版本细节                         | V1.3.2及以上的1.x系列版本 | 94a137fc5c681b211f3e076472a9c5875d59e7f0cd6d7409cb8f66bb9e4f87577a0f12dd500e2bcb99a435860c82183e4a6514b638bcb4aecfb48f184730f3f1 |
| V1.2.6           | 优化各模块权限控制功能                                       | V1.3.1及以上的1.x系列版本 | f345b7edcbe245a561cb94ec2e4f4d40731fe205f134acadf5e391e5874c5c2477d9f75f15dbaf36c3a7cb6506823ac6fbc2a0ccce484b7c4cc71ec0fbdd9901 |
| V1.2.5           | 可视化功能新增“常用模版”概念，所有界面优化补充页面缓存等功能 | V1.3.0及以上的1.x系列版本 | 37376b6cfbef7df8496e255fc33627de01bd68f636e50b573ed3940906b6f3da1e8e8b25260262293b8589718f5a72180fa15e5823437bf6dc51ed7da0c583f7 |
| V1.2.4           | 计算功能新增“导入、导出”功能，测点列表新增“时间对齐”字段     | V1.2.2及以上的1.x系列版本 | 061ad1add38c109c1a90b06f1ddb7797bd45e84a34a4f77154ee48b90bdc7ecccc1e25eaa53fbbc98170d99facca93e3536192dd8d10a50ce505f59923ce6186 |
| V1.2.3           | 首页新增“激活详情”，新增分析等功能                           | V1.2.2及以上的1.x系列版本 | 254f5b7451300f6f99937d27fd7a5b20847d5293f53e0eaf045ac9235c7ea011785716b800014645ed5d2161078b37e1d04f3c59589c976614fb801c4da982e1 |
| V1.2.2           | 优化“测点描述”展示内容等功能                                 | V1.2.2及以上的1.x系列版本 | 062e520d010082be852d6db0e2a3aa6de594eb26aeb608da28a212726e378cd4ea30fca5e1d2c3231ebd8de29e94ca9641f1fabc1cea46acfb650c37b7681b4e |
| V1.2.1           | 数据同步界面新增“监控面板”，优化Prometheus提示信息           | V1.2.2及以上的1.x系列版本 | 8a3bcf87982ad5004528829b121f2d3945429deb77069917a42a8c8d2e2e2a2c24a398aaa87003920eeacc0c692f1ed39eac52a696887aa085cce011f0ddd745 |
| V1.2.0           | 全新Workbench版本升级                                        | V1.2.0及以上的1.x系列版本 | ea1f7d3a4c0c6476a195479e69bbd3b3a2da08b5b2bb70b0a4aba988a28b5db5a209d4e2c697eb8095dfdf130e29f61f2ddf58c5b51d002c8d4c65cfc13106b3 |