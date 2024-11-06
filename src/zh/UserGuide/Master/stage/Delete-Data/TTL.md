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

# 数据存活时间（TTL）

IoTDB 支持对 device 级别设置数据存活时间（TTL），这使得 IoTDB 可以定期、自动地删除一定时间之前的数据。合理使用 TTL
可以帮助您控制 IoTDB 占用的总磁盘空间以避免出现磁盘写满等异常。并且，随着文件数量的增多，查询性能往往随之下降，
内存占用也会有所提高。及时地删除一些较老的文件有助于使查询性能维持在一个较高的水平和减少内存资源的占用。

TTL的默认单位为毫秒，如果配置文件中的时间精度修改为其他单位，设置ttl时仍然使用毫秒单位。

当设置 TTL 时，系统会根据设置的路径寻找所包含的所有 device，并为这些 device 设置 TTL 时间，系统会按设备粒度对过期数据进行删除。
当设备数据过期后，将不能被查询到，但磁盘文件中的数据不能保证立即删除（会在一定时间内删除），但可以保证最终被删除。
考虑到操作代价，系统不会立即物理删除超过 TTL 的数据，而是通过合并来延迟地物理删除。因此，在数据被物理删除前，如果调小或者解除 TTL，可能会导致之前因 TTL 而不可见的数据重新出现。
系统中仅能设置至多 1000 条 TTL 规则，达到该上限时，需要先删除部分 TTL 规则才能设置新的规则

## TTL Path 规则
设置的路径 path 只支持前缀路径（即路径中间不能带 \* 和 \*\*， 且必须以 \*\* 结尾），该路径会匹配到设备，也允许用户指定不带星的 path 为具体的 database 或 device，当 path 不带星时，会检查是否匹配到 database，若匹配到 database，则会同时设置 path 和 path.\*\*。
注意：设备 TTL 设置不会对元数据的存在性进行校验，即允许对一条不存在的设备设置 TTL。
```
合格的 path：
root.**
root.db.**
root.db.group1.**
root.db
root.db.group1.d1

不合格的 path：
root.*.db
root.**.db.*
root.db.*
```
## TTL 适用规则
当一个设备适用多条TTL规则时，优先适用较精确和较长的规则。例如对于设备“root.bj.hd.dist001.turbine001”来说，规则“root.bj.hd.dist001.turbine001”比“root.bj.hd.dist001.\*\*”优先，而规则“root.bj.hd.dist001.\*\*”比“root.bj.hd.\*\*”优先；
## 设置 TTL
set ttl 操作可以理解为设置一条 TTL规则，比如 set ttl to root.sg.group1.\*\* 就相当于对所有可以匹配到该路径模式的设备挂载 ttl。 unset ttl 操作表示对相应路径模式卸载 TTL，若不存在对应 TTL，则不做任何事。若想把 TTL 调成无限大，则可以使用 INF 关键字
设置 TTL 的 SQL 语句如下所示：
```
set ttl to prefixPath 360000;
```
prefixPath 是前缀路径，即路径不能带 \* 且以 \*\* 结尾。
prefixPath 匹配对应的设备。为了兼容老版本 SQL 语法，允许用户输入的 prefixPath 匹配到 db，则自动将前缀路径扩展为 path.\*\*。
例如，写set ttl to root.sg 360000 则会自动转化为set ttl to root.sg.\*\* 360000，转化后的语句对所有 root.sg 下的 device 设置TTL。
但若写的 pathPattern 无法匹配到 db，则上述逻辑不会生效。
如写set ttl to root.sg.group 360000 ，由于root.sg.group未匹配到 db，则不会被扩充为root.sg.group.\*\*。 也允许指定具体 device，不带 \*。
## 取消 TTL

取消 TTL 的 SQL 语句如下所示：

```
IoTDB> unset ttl to root.ln
```

取消设置 TTL 后， database `root.ln`中所有的数据都会被保存。
```
IoTDB> unset ttl to root.sgcc.**
```

取消设置`root.sgcc`路径下的所有 database 的 TTL 。
```
IoTDB> unset ttl to root.**
```

取消设置所有 database 的 TTL 。

## 显示 TTL

显示 TTL 的 SQL 语句如下所示：

```
IoTDB> SHOW ALL TTL
IoTDB> SHOW TTL ON StorageGroupNames
```

SHOW ALL TTL 这个例子会给出所有 database 的 TTL。
SHOW TTL ON root.ln,root.sgcc,root.DB 这个例子会显示指定的三个 database 的 TTL。
注意：没有设置 TTL 的 database 的 TTL 将显示为 null。

```
IoTDB> show all ttl
+-------------+-------+
|     database|ttl(ms)|
+-------------+-------+
|      root.ln|3600000|
|    root.sgcc|   null|
|      root.DB|3600000|
+-------------+-------+
```
显示设备的 TTL。
```
IoTDB> show devices
+---------------+---------+---------+
|         Device|IsAligned|      TTL|
+---------------+---------+---------+
|root.sg.device1|    false| 36000000|
|root.sg.device2|     true|      INF|
+---------------+---------+---------+
```
所有设备都一定会有 TTL，即不可能是 null。INF 表示无穷大。
