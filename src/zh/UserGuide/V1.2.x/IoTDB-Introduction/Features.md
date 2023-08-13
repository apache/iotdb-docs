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

# 主要功能特点

IoTDB 具有以下特点：

* 灵活的部署方式
  * 云端一键部署
  * 终端解压即用
  * 终端-云端无缝连接（数据云端同步工具）
* 低硬件成本的存储解决方案
  *	高压缩比的磁盘存储（10 亿数据点硬盘成本低于 1.4 元）
* 目录结构的时间序列组织管理方式
  *	支持复杂结构的智能网联设备的时间序列组织
  *	支持大量同类物联网设备的时间序列组织
  *	可用模糊方式对海量复杂的时间序列目录结构进行检索
* 高通量的时间序列数据读写
  *	支持百万级低功耗强连接设备数据接入（海量）
  *	支持智能网联设备数据高速读写（高速）
  *	以及同时具备上述特点的混合负载
* 面向时间序列的丰富查询语义
  *	跨设备、跨传感器的时间序列时间对齐
  *	面向时序数据特征的计算
  *	提供面向时间维度的丰富聚合函数支持
* 极低的学习门槛
  *	支持类 SQL 的数据操作
  *	提供 JDBC 的编程接口
  *	完善的导入导出工具
* 完美对接开源生态环境
  *	支持开源数据分析生态系统：Hadoop、Spark
  *	支持开源可视化工具对接：Grafana
* 统一的数据访问模式
  * 无需进行分库分表处理
  * 无需区分实时库和历史库
* 高可用性支持
  * 支持HA分布式架构，系统提供7*24小时不间断的实时数据库服务
  * 应用访问系统，可以连接集群中的任何一个节点进行
  * 一个物理节点宕机或网络故障，不会影响系统的正常运行
  * 物理节点的增加、删除或过热，系统会自动进行计算/存储资源的负载均衡处理
  * 支持异构环境，不同类型、不同性能的服务器可以组建集群，系统根据物理机的配置，自动负载均衡
* 知识产权及国产化支持
  * 具有自主知识产权
  * 支持龙芯、飞腾、鲲鹏等国产CPU
  * 支持中标麒麟、银河麒麟、统信、凝思等国产服务器操作系统
