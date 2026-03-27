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
# 数据保留时间 

## 概览

IoTDB 支持对设备（device）级别设置数据保留时间（TTL），允许系统自动定期删除旧数据，以有效控制磁盘空间并维护高性能查询和低内存占用。TTL 默认以毫秒为单位，数据过期后不可查询且禁止写入，但物理删除会延迟至压缩时。需注意，TTL 变更可能导致短暂数据可查询性变化，且若调小或解除 TTL，之前因 TTL 不可见的数据可能重新出现。

注意事项：
- TTL 设置为毫秒，不受配置文件时间精度影响。
- TTL 变更可能影响数据的可查询性。
- 系统最终会移除过期数据，但存在延迟。
- TTL 判断数据是否过期依据的是数据点时间，非写入时间。
- 系统最多支持设置 1000 条 TTL 规则，达到上限需先删除部分规则才能设置新规则。

## 设置TTL
### TTL Path 规则
设置的路径 path 只支持前缀路径（即路径中间不能带 \* ， 且必须以 \*\* 结尾），该路径会匹配到设备，也允许用户指定不带星的 path 为具体的 database 或 device，当 path 不带 \* 时，会检查是否匹配到 database，若匹配到 database，则会同时设置 path 和 path.\*\*。
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
### TTL 适用规则
当一个设备适用多条TTL规则时，优先适用较精确和较长的规则。例如对于设备“root.bj.hd.dist001.turbine001”来说，规则“root.bj.hd.dist001.turbine001”比“root.bj.hd.dist001.\*\*”优先，而规则“root.bj.hd.dist001.\*\*”比“root.bj.hd.\*\*”优先；
### 设置 TTL
set ttl 操作可以理解为设置一条 TTL规则，比如 set ttl to root.sg.group1.\*\* 就相当于对所有可以匹配到该路径模式的设备挂载 ttl。 unset ttl 操作表示对相应路径模式卸载 TTL，若不存在对应 TTL，则不做任何事。若想把 TTL 调成无限大，则可以使用 INF 关键字
设置 TTL 的 SQL 语句如下所示：
```
set ttl to pathPattern 360000;
```
pathPattern 是前缀路径，即路径中间不能带 \* 且必须以 \*\* 结尾。
pathPattern 匹配对应的设备。为了兼容老版本 SQL 语法，允许用户输入的 pathPattern 匹配到 db，则自动将前缀路径扩展为 path.\*\*。
例如，写set ttl to root.sg 360000 则会自动转化为set ttl to root.sg.\*\* 360000，转化后的语句对所有 root.sg 下的 device 设置TTL。
但若写的 pathPattern 无法匹配到 db，则上述逻辑不会生效。
如写set ttl to root.sg.group 360000 ，由于root.sg.group未匹配到 db，则不会被扩充为root.sg.group.\*\*。 也允许指定具体 device，不带 \*。
## 取消 TTL

取消 TTL 的 SQL 语句如下所示：

```
IoTDB> unset ttl from root.ln
```

取消设置 TTL 后， `root.ln` 路径下所有的数据都会被保存。
```
IoTDB> unset ttl from root.sgcc.**
```

取消设置`root.sgcc`路径下的所有的 TTL 。
```
IoTDB> unset ttl from root.**
```

取消设置所有的 TTL 。

新语法
```
IoTDB> unset ttl from root.**
```

旧语法
```
IoTDB> unset ttl to root.**
```
新旧语法在功能上没有区别并且同时兼容，仅是新语法在用词上更符合常规。
## 显示 TTL

显示 TTL 的 SQL 语句如下所示：
show all ttl

```
IoTDB> SHOW ALL TTL
+--------------+--------+
|          path|     TTL|
|       root.**|55555555|
| root.sg2.a.**|44440000|
+--------------+--------+
```

show ttl on pathPattern
```
IoTDB> SHOW TTL ON root.db.**;
+--------------+--------+
|          path|     TTL|
|    root.db.**|55555555|
|  root.db.a.**|44440000|
+--------------+--------+
```
SHOW ALL TTL 这个例子会给出所有的 TTL。
SHOW TTL ON pathPattern 这个例子会显示指定路径的 TTL。

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