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
# 发版历史

## V1.3.3

> 最新发版时间：2024.11.20
>
> 下载地址：：https://iotdb.apache.org/zh/Download/

V1.3.3主要新增 String、Blob、Date、Timestamp 数据类型、增加数据订阅、DataNode 主动监听并加载 TsFile，同时增加可观测性指标、发送端支持传文件至指定目录后，接收端自动加载到 IoTDB、配置文件整合、客户端查询请求负载均衡等功能，对数据库监控、性能、稳定性进行了全方位提升，并修复部分产品 bug 和性能问题。具体发布内容如下：

- 存储模块：新增 String、Blob、Date、Timestamp 数据类型
- 存储模块：合并模块内存控制性能提升
- 查询模块：新增客户端查询请求负载均衡优化
- 查询模块：新增活跃元数据统计查询
- 查询模块：Filter 性能优化，提升聚合查询和 where 条件查询的速度
- 数据同步：发送端支持传文件至指定目录后，接收端自动加载到 IoTDB
- 数据同步：接收端新增数据类型请求的自动转换机制
- 数据订阅：新增数据订阅能力，支持以数据点或 TsFile 文件方式订阅数据库数据
- 数据加载：DataNode 主动监听并加载 TsFile，同时增加可观测性指标
- 流处理：Alter Pipe 支持 Alter Source 的能力
- 系统模块：优化配置文件，原有配置文件三合一，降低用户操作成本
- 系统模块：新增配置项设置接口
- 系统模块：优化重启恢复性能，减少启动时间
- 脚本与工具：新增元数据导入导出脚本
- 脚本与工具：新增对 Kubernetes Helm 的支持

## V1.3.2

> 最新发版时间：2024.7.1
>
> 下载地址：https://iotdb.apache.org/zh/Download/

V1.3.2主要新增 explain analyze 语句分析单个 SQL 查询耗时、新增 UDAF 用户自定义聚合函数框架、元数据同步、统计指定路径下数据点数、SQL 语句导入导出脚本等功能，同时集群管理工具支持滚动升级、上传插件到整个集群，对数据库监控、性能、稳定性进行了全方位提升，并修复部分产品 bug 和性能问题。具体发布内容如下：

- 存储模块：insertRecords 接口写入性能提升
- 查询模块：新增 Explain Analyze 语句（监控单条 SQL 执行各阶段耗时）
- 查询模块：新增 UDAF 用户自定义聚合函数框架
- 查询模块：新增 MaxBy/MinBy 函数，支持获取最大/小值的同时返回对应时间戳
- 查询模块：值过滤查询性能提升
- 数据同步：路径匹配支持通配符
- 数据同步：支持元数据同步（含时间序列及相关属性、权限等设置）
- 流处理：增加 Alter Pipe 语句，支持热更新 Pipe 任务的插件
- 系统模块：系统数据点数统计增加对 load TsFile 导入数据的统计
- 脚本与工具：新增本地升级备份工具（通过硬链接对原有数据进行备份）
- 脚本与工具：新增 export-data/import-data 脚本，支持将数据导出为 CSV、TsFile 格式或 SQL 语句
- 脚本与工具：Windows 环境支持通过窗口名区分 ConfigNode、DataNode、Cli

## V1.3.1

> 最新发版时间：2024.4.22
>
> 下载地址：https://iotdb.apache.org/zh/Download/

V1.3.1主要新增一键启停集群脚本、一键收集实例信息脚本、多种内置函数等新特性，优化了原有数据同步、日志输出策略、查询执行过程，提升系统可观测性，并修复部分产品 bug 和性能问题。具体发布内容如下：

- 增加一键启停集群脚本（start-all/stop-all.sh & start-all/stop-all.bat）
- 增加一键收集实例信息脚本（collect-info.sh & collect-info.bat）
- 新增标准差、方差内置聚合函数
- 新增 tsfile 修复命令
- Fill 子句支持设置填充超时阈值，超过时间阈值不填充
- 数据同步简化时间范围指定方式，直接设置起止时间
- 系统可观测性提升（增加集群节点的散度监控、分布式任务调度框架可观测性）
- 日志默认输出策略优化
- Load TsFile 完善内存控制，覆盖全流程
- Rest 接口（V2 版）增加列类型返回
- 优化查询执行过程
- 客户端自动拉取可用 DataNode 列表

## V1.3.0

> 最新发版时间：2024.1.1
>
> 下载地址：https://iotdb.apache.org/zh/Download/

V1.3.0主要新增SSL通讯加密、数据同步监控项统计等新特性，优化了原有权限模块的语法和逻辑、metrics算法库性能、python客户端写入性能以及在部分查询场景下的查询效率，修复部分产品 bug 和性能问题。具体发布内容如下：

- 安全模块：优化权限模块，支持时间序列粒度的权限控制
- 安全模块：客户端服务器支持 SSL 通讯加密
- 查询模块：计算类型视图支持 LAST 查询
- 流处理：新增 pipe 相关监控指标
- 存储模块：支持负数时间戳写入
- 脚本与工具：load 脚本导入数据纳入数据点数监控项统计
- 客户端模块：优化 python 客户端的性能
- 查询模块优化 show path 返回时间长的问题
- 查询模块：优化 explain 语句的展示结果，使展示结果对齐
- 系统模块：环境配置脚本中增加统一内存配置项 MEMORY_SIZE
- 系统模块：配置项 target_config_node_list 更名为 seed_config_node
- 系统模块：配置项 storage_query_schema_consensus_free_memory_proportion 更名为 datanode_memory_proportion

## V1.2.0

> 最新发版时间：2023.6.30
>
> 下载地址：https://iotdb.apache.org/zh/Download/

V1.2.0主要增加了流处理框架、动态模板、substring/replace/round内置查询函数等新特性，增强了show region、show timeseries、show variable等内置语句功能和Session接口，同时优化了内置监控项及其实现，修复部分产品bug和性能问题。

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

## V1.1.0

> 最新发版时间：2023-04-03
>
> 下载地址：https://iotdb.apache.org/zh/Download/

V1.1.0主要改进增加了部分新特性，如支持 GROUP BY VARIATION、GROUP BY CONDITION 等分段方式、增加 DIFF、COUNT_IF 等实用函数，引入 pipeline 执行引擎进一步提升查询速度等。同时修复对齐序列 last 查询 order by timeseries、LIMIT&OFFSET 不生效、重启后元数据模版错误、删除所有 database 后创建序列错误等相关问题。

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

## V1.0.0

> 最新发版时间：2022.12.03
>
> 下载地址：https://iotdb.apache.org/zh/Download/

V1.0.0主要修复分区计算及查询执行时的相关问题，历史快照未删除，数据查询及 SessionPool 内存使用上的相关问题等；同时改进增加部分新特性，如支持 show variables、explain align by device 等命令，完善 ExportCSV/ExportTsFile/MQTT 等功能，完善集群的启停流程、更改 IoTDB 集群默认的内部端口、新增用于区分集群的 cluster_name 属性等。

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