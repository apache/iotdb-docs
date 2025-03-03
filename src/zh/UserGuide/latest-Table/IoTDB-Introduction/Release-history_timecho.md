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

## 1 TimechoDB（数据库内核）
### V1.3.4.1
> 发版时间：2025.01.08
>
> 下载地址：请联系天谋工作人员进行下载

V1.3.4.1版本新增模式匹配函数、持续优化数据订阅机制，提升稳定性、import-data/export-data 脚本扩展支持新数据类型，import-data/export-data 脚本合并同时兼容 TsFile、CSV 和 SQL 三种类型数据的导入导出等功能，同时对数据库监控、性能、稳定性进行了全方位提升。具体发布内容如下：

- 查询模块：用户可通过配置项控制 UDF、PipePlugin、Trigger 和 AINode 通过 URI 加载 jar 包
- 系统模块：UDF 函数拓展，新增 pattern_match 模式匹配函数
- 数据同步：支持在发送端指定接收端鉴权信息
- 生态集成：支持 Kubernetes Operator 
- 脚本与工具：import-data/export-data 脚本扩展，支持新数据类型（字符串、大二进制对象、日期、时间戳）
- 脚本与工具：import-data/export-data 脚本迭代，同时兼容 TsFile、CSV 和 SQL 三种类型数据的导入导出

### V1.3.3.3

> 发版时间：2024.10.31
>
> 下载地址：请联系天谋工作人员进行下载

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

### V1.3.3.2

> 发版时间：2024.8.15
>
> 下载地址：请联系天谋工作人员进行下载

V1.3.3.2版本支持输出读取mods文件的耗时、输入最大顺乱序归并排序内存 以及dispatch 耗时、通过参数配置对时间分区原点的调整、支持根据 pipe 历史数据处理结束标记自动结束订阅，同时合并了模块内存控制性能提升，具体发布内容如下：

- 查询模块：Explain Analyze 功能支持输出读取mods文件的耗时
- 查询模块：Explain Analyze 功能支持输入最大顺乱序归并排序内存以及 dispatch 耗时
- 存储模块：新增合并目标文件拆分功能，增加配置文件参数
- 系统模块：支持通过参数配置对时间分区原点的调整
- 流处理：数据订阅支持根据 pipe 历史数据处理结束标记自动结束订阅
- 数据同步：RPC 压缩支持指定压缩等级
- 脚本与工具：数据/元数据导出只过滤 root.__system，不对root.__systema 等开头的数据进行过滤

### V1.3.3.1

> 发版时间：2024.7.12
>
> 下载地址：请联系天谋工作人员进行下载

V1.3.3.1版本多级存储增加限流机制、数据同步支持在发送端 sink 指定接收端使用用户名密码密码鉴权，优化了数据同步接收端一些不明确的WARN日志、重启恢复性能，减少启动时间，同时对脚本内容进行了合并，具体发布内容如下：

- 查询模块：Filter 性能优化，提升聚合查询和where条件查询的速度
- 查询模块：Java Session客户端查询 sql 请求均分到所有节点
- 系统模块：将"iotdb-confignode.properties、iotdb-datanode.properties、iotdb-common.properties"配置文件合并为" iotdb-system.properties"
- 存储模块：多级存储增加限流机制
- 数据同步：数据同步支持在发送端 sink 指定接收端使用用户名密码密码鉴权
- 系统模块：优化重启恢复性能，减少启动时间

### V1.3.2.2

> 发版时间：2024.6.4
>
> 下载地址：请联系天谋工作人员进行下载

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

### V1.3.1.4

> 发版时间：2024.4.23
>
> 下载地址：请联系天谋工作人员进行下载

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

### V1.3.0.4

> 发版时间：2024.1.3
>
> 下载地址：请联系天谋工作人员进行下载

V1.3.0.4 发布了全新内生机器学习框架 AINode，全面升级权限模块支持序列粒度授予权限，并对视图、流处理等功能进行诸多细节优化，进一步提升了产品的使用易用度，并增强了版本稳定性和各方面性能。具体发布内容如下：

- 查询模块：新增 AINode 内生机器学习模块
- 查询模块：优化 show path 语句返回时间长的问题
- 安全模块：升级权限模块，支持时间序列粒度的权限设置
- 安全模块：支持客户端与服务器 SSL 通讯加密
- 流处理：流处理模块新增多种 metrics 监控项
- 查询模块：非可写视图序列支持 LAST 查询
- 系统模块：优化数据点监控项统计准确性

### V1.2.0.1

> 发版时间：2023.6.30
>
> 下载地址：请联系天谋工作人员进行下载

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

### V1.1.0.1

> 发版时间：2023-04-03
>
> 下载地址：请联系天谋工作人员进行下载

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

### V1.0.0.1

> 发版时间：2022.12.03
>
> 下载地址：请联系天谋工作人员进行下载

V1.0.0.1主要修复分区计算及查询执行时的相关问题，历史快照未删除，数据查询及 SessionPool 内存使用上的相关问题等；同时改进增加部分新特性，如支持 show variables、explain align by device 等命令，完善 ExportCSV/ExportTsFile/MQTT 等功能，完善集群的启停流程、更改 IoTDB 集群默认的内部端口、新增用于区分集群的 cluster_name 属性等。

- 系统模块：支持分布式高可用架构
- 系统模块：支持多副本存储
- 系统模块：启动节点时，如果端口已被占用，则终止启动流程
- 系统模块：支持集群管理sql
- 系统模块：支持对Confignode、Datanode进行启动、停止、移除等功能管理
- 系统模块：可配置共识协议框架及多种共识协议：Simple、IoTConsensus、Ratis
- 系统模块：支持数据、元数据、Confignode的多副本管理
- 查询模块：支持大规模并行处理框架MPP，提供分布式读写能力
- 流处理模块：支持流处理框架
- 流处理模块：支持集群间数据同步功能

## 2 Workbench（控制台工具）

| **控制台版本号** | **版本说明**                                                 | **可支持IoTDB版本** |
| ---------------- | ------------------------------------------------------------ | ------------------- |
| V1.5.1           | 新增AI分析功能以及模式匹配功能                               | V1.3.2及以上版本    |
| V1.4.0           | 新增树模型展示及英文版                                       | V1.3.2及以上版本    |
| V1.3.1           | 分析功能新增分析方式，优化导入模版等功能                     | V1.3.2及以上版本    |
| V1.3.0           | 新增数据库配置功能，优化部分版本细节                         | V1.3.2及以上版本    |
| V1.2.6           | 优化各模块权限控制功能                                       | V1.3.1及以上版本    |
| V1.2.5           | 可视化功能新增“常用模版”概念，所有界面优化补充页面缓存等功能 | V1.3.0及以上版本    |
| V1.2.4           | 计算功能新增“导入、导出”功能，测点列表新增“时间对齐”字段     | V1.2.2及以上版本    |
| V1.2.3           | 首页新增“激活详情”，新增分析等功能                           | V1.2.2及以上版本    |
| V1.2.2           | 优化“测点描述”展示内容等功能                                 | V1.2.2及以上版本    |
| V1.2.1           | 数据同步界面新增“监控面板”，优化Prometheus提示信息           | V1.2.2及以上版本    |
| V1.2.0           | 全新Workbench版本升级                                        | V1.2.0及以上版本    |