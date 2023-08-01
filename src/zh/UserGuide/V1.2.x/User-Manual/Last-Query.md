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

# 最新点查询

最新点查询是时序数据库 Apache IoTDB 中提供的一种特殊查询。它返回指定时间序列中时间戳最大的数据点，即一条序列的最新状态。

在物联网数据分析场景中，此功能尤为重要。为了满足了用户对设备实时监控的需求，Apache IoTDB 对最新点查询进行了**缓存优化**，能够提供毫秒级的返回速度。

### 相关配置项
IoTDB 在 `iotdb-common.properties` 中提供了 `enable_last_cache` 和 `schema_memory_proportion` 两个配置参数，分别用于开启/关闭最新点缓存，以及控制打开最新点缓存后的内存占用。

#### enable_last_cache

`enable_last_cache` 为 `true` 时，开启最新点缓存；为 `false` 时，关闭最新点缓存。

#### schema_memory_proportion

指定了 SchemaRegion, SchemaCache 以及 PartitionCache的内存分配比例，最新点缓存在 SchemaCache 中，所以可以通过调整这个参数，达到调整最新点缓存内存占用的效果。
默认为 `5:4:1`，即最新点缓存所在的 SchemaCache，占用元数据内存的 40%。


### SQL 语法：

```sql
select last <Path> [COMMA <Path>]* from < PrefixPath > [COMMA < PrefixPath >]* <whereClause> [ORDER BY TIMESERIES (DESC | ASC)?]
```

其含义是： 查询时间序列 prefixPath.path 中最近时间戳的数据。

- `whereClause` 中当前只支持时间过滤条件，任何其他过滤条件都将会返回异常。当缓存的最新点不满足过滤条件时，IoTDB 需要从存储中获取结果，此时性能将会有所下降。

- 结果集为四列的结构：

    ```
    +----+----------+-----+--------+
    |Time|timeseries|value|dataType|
    +----+----------+-----+--------+
    ```

- 可以使用 `ORDER BY TIME/TIMESERIES/VALUE/DATATYPE (DESC | ASC)` 指定结果集按照某一列进行降序/升序排列。当值列包含多种类型的数据时，按照字符串类型来排序。

**示例 1：** 查询 root.ln.wf01.wt01.status 的最新数据点

```
IoTDB> select last status from root.ln.wf01.wt01
+-----------------------------+------------------------+-----+--------+
|                         Time|              timeseries|value|dataType|
+-----------------------------+------------------------+-----+--------+
|2017-11-07T23:59:00.000+08:00|root.ln.wf01.wt01.status|false| BOOLEAN|
+-----------------------------+------------------------+-----+--------+
Total line number = 1
It costs 0.000s
```

**示例 2：** 查询 root.ln.wf01.wt01 下 status，temperature 时间戳大于等于 2017-11-07T23:50:00 的最新数据点。

```
IoTDB> select last status, temperature from root.ln.wf01.wt01 where time >= 2017-11-07T23:50:00
+-----------------------------+-----------------------------+---------+--------+
|                         Time|                   timeseries|    value|dataType|
+-----------------------------+-----------------------------+---------+--------+
|2017-11-07T23:59:00.000+08:00|     root.ln.wf01.wt01.status|    false| BOOLEAN|
|2017-11-07T23:59:00.000+08:00|root.ln.wf01.wt01.temperature|21.067368|  DOUBLE|
+-----------------------------+-----------------------------+---------+--------+
Total line number = 2
It costs 0.002s
```

**示例 3：** 查询 root.ln.wf01.wt01 下所有序列的最新数据点，并按照序列名降序排列。

```
IoTDB> select last * from root.ln.wf01.wt01 order by timeseries desc;
+-----------------------------+-----------------------------+---------+--------+
|                         Time|                   timeseries|    value|dataType|
+-----------------------------+-----------------------------+---------+--------+
|2017-11-07T23:59:00.000+08:00|root.ln.wf01.wt01.temperature|21.067368|  DOUBLE|
|2017-11-07T23:59:00.000+08:00|     root.ln.wf01.wt01.status|    false| BOOLEAN|
+-----------------------------+-----------------------------+---------+--------+
Total line number = 2
It costs 0.002s
```

**示例 4：** 查询 root.ln.wf01.wt01 下所有序列的最新数据点，并按照dataType降序排列。

```
IoTDB> select last * from root.ln.wf01.wt01 order by dataType desc;
+-----------------------------+-----------------------------+---------+--------+
|                         Time|                   timeseries|    value|dataType|
+-----------------------------+-----------------------------+---------+--------+
|2017-11-07T23:59:00.000+08:00|root.ln.wf01.wt01.temperature|21.067368|  DOUBLE|
|2017-11-07T23:59:00.000+08:00|     root.ln.wf01.wt01.status|    false| BOOLEAN|
+-----------------------------+-----------------------------+---------+--------+
Total line number = 2
It costs 0.002s
```
