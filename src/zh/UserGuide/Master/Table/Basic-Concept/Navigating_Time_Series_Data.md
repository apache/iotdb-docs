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
# 时序数据模型

## 1. 什么叫时序数据？

万物互联的今天，物联网场景、工业场景等各类场景都在进行数字化转型，人们通过在各类设备上安装传感器对设备的各类状态进行采集。如电机采集电压、电流，风机的叶片转速、角速度、发电功率；车辆采集经纬度、速度、油耗；桥梁的振动频率、挠度、位移量等。传感器的数据采集，已经渗透在各个行业中。

![](https://alioss.timecho.com/docs/img/%E6%97%B6%E5%BA%8F%E6%95%B0%E6%8D%AE%E4%BB%8B%E7%BB%8D.png)


通常来说，我们把每个采集点位叫做一个**测点（ 也叫物理量、时间序列、时间线、信号量、指标、测量值等）**，每个测点都在随时间的推移不断收集到新的数据信息，从而构成了一条**时间序列**。用表格的方式，每个时间序列就是一个由时间、值两列形成的表格；用图形化的方式，每个时间序列就是一个随时间推移形成的走势图，也可以形象的称之为设备的“心电图”。

![](https://alioss.timecho.com/docs/img/%E5%BF%83%E7%94%B5%E5%9B%BE1.png)

传感器产生的海量时序数据是各行各业数字化转型的基础，因此我们对时序数据的模型梳理主要围绕设备、传感器展开。

## 2. 时序数据中的关键概念有哪些？

时序数据中主要涉及的概念如下。

| **设备（Device）**              | 也称为实体、装备等，是实际场景中拥有物理量的设备或装置。在 IoTDB 中，实体是管理一组时间序列的集合，可以是一个物理设备、测量装置、传感器集合等。如：能源场景：风机，由区域、场站、线路、机型、实例等标识工厂场景：机械臂，由物联网平台生成的唯一 ID 标识车联网场景：车辆，由车辆识别代码 VIN 标识监控场景：CPU，由机房、机架、Hostname、设备类型等标识 |
| ------------------------------- | ------------------------------------------------------------ |
| **测点（FIELD）**   | 也称物理量、信号量、指标、点位、工况等，是在实际场景中检测装置记录的测量信息。通常一个物理量代表一个采集点位，能够定期采集所在环境的物理量。如：能源电力场景：电流、电压、风速、转速车联网场景：油量、车速、经度、维度工厂场景：温度、湿度 |
| **数据点（Data Point）**        | 由一个时间戳和一个数值组成，其中时间戳为 long 类型，数值可以为 BOOLEAN、FLOAT、INT32 等各种类型。如下图表格形式的时间序列的一行，或图形形式的时间序列的一个点，就是一个数据点。<br> <img src="https://alioss.timecho.com/docs/img/DataPoint01.png" alt="" style="width: 70%;"/> |
| **采集频率（Frequency）**       | 指物理量在一定时间内产生数据的次数。例如，一个温度传感器可能每秒钟采集一次温度数据，那么它的采集频率就是1Hz（赫兹），即每秒1次。 |
| **数据保存时间（TTL）**  | TTL 指定表中数据的保存时间，超过 TTL 的数据将自动删除。IoTDB 支持对不同的表设定不同的数据存活时间，便于 IoTDB 定期、自动地删除一定时间之前的数据。合理使用 TTL 可以控制 IoTDB 占用的总磁盘空间，避免磁盘写满等异常，并维持较高的查询性能和减少内存资源占用。 |