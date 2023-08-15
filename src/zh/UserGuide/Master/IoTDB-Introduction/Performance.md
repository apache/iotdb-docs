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

本章节从数据库连接、数据库读写性能及存储性能角度介绍IoTDB的性能特点，测试工具使用开源的时序数据库基准测试工具 IoTDBBenchmark。

## 数据库连接

- 支持高并发连接，单台服务器可支持数万次并发连接/秒。

## 数据库读写性能

- 具备高写入吞吐的特点，单核处理写入请求大于数万次/秒，单台服务器写入性能达到数千万点/秒；集群可线性扩展，集群的写入性能可达数亿点/秒。
- 具备高查询吞吐、低查询延迟的特点，单台服务器支持数千万点/秒查询吞吐，可在毫秒级聚合百亿数据点。

## 存储性能

- 支持存储海量数据，具备PB级数据的存储和处理能力。
- 支持高压缩比，无损压缩能够达到20倍压缩比，有损压缩能够达到100倍压缩比。