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

# 多语言远程 UDF（C / C++ / Java / ...）

Remote UDF Service 支持通过 RPC 的方式访问用户提供的 UDF Service，以实现用户自定义函数的执行。
相比于 Native 的 UDF 实现，Remote UDF Service 有如下优势：
* 跨语言：可以用 Protobuf 支持的各类语言编写 UDF Service。
* 安全：UDF 执行失败或崩溃，仅会影响 UDF Service 自身，而不会导致 IoTDB 进程崩溃。
* 灵活：UDF Service 中可以调用任意其他服务或程序库类，以满足更多样的业务需求。

## 依赖
### protobuf 编译安装
* 下载地址 https://github.com/protocolbuffers/protobuf/releases
* 确认安装依赖库：automake，autoconf，libtool是否已经安装，未安装的需要安装
* 下载 protobuf 安装文件，解压
* 编译 (用于生成编译服务器下可执行程序)： 
```shell
./autogen.sh
./configure --prefix=/XX/bin/protobuflib/
make
make install
```
如果你使用的是 Java 或 C++等，完成以上步骤就已经可以使用生成的protobuf可执行程序生产protobuf相关文件了。

### protobuf-c 编译安装（C 语言远程 UDF 需此步骤）

* 下载地址: https://codechina.csdn.net/mirrors/protobuf-c/protobuf-c/-/releases/v1.4.0?spm=1033.2243.3001.5876
* 确认安装依赖库：protobuf, 设置之前protobuf编译出的依赖库资源的环境变量：
```shell
PKG_CONFIG_PATH=/XX/bin/protobuflib/
export PKG_CONFIG_PATH
```
* 下载protobuf-c，解压
* 编译 (用于生成编译服务器下可执行程序)：
```shell
./autogen.sh
./configure --prefix=/XX/bin/protobufc/
make
make install
```
protobufc下生成的文件，即为编译生成的依赖库、protobuf-c可执行程序，使用protobuf-c可执行程序可以根据proto文件生成.c和.h文件

## 编写 UDF 函数

### 拷贝 proto 文件

function_service.proto 和 types.proto 拷贝到 Rpc 服务中

- function_service.proto
    - PFunctionCallRequest
        - function_name：函数名称，对应创建函数时指定的symbol
        - args：方法传递的参数
        - context：查询上下文信息
    - PFunctionCallResponse
        - result：结果
        - status：状态，0代表正常
    - PCheckFunctionRequest
        - function：函数相关信息
        - match_type：匹配类型
    - PCheckFunctionResponse
        - status：状态，0代表正常

### 生成接口

通过 protoc 生成代码，具体参数通过 protoc -h 查看

### 实现接口

共需要实现以下三个方法
- fnCall：用于编写计算逻辑
- checkFn：用于创建 UDF 时校验，校验函数名/参数/返回值等是否合法
- handShake：用于接口探活

## 创建 UDF

```sql
CREATE FUNCTION <UDF-NAME> AS 
    SYMBOL = <SYMBOL>,
    OBJECT_FILE = <OBJECT_FILE>,
    LANGUAGE PROTOBUF
```

说明：
1. `symbol`表示的是 rpc 调用传递的方法名，这个参数是必须设定的。
2. `object_file`表示的 rpc 服务地址，目前支持单个地址和 brpc 兼容格式的集群地址。

示例：
```sql
CREATE FUNCTION rpc_udf1 AS 
    SYMBOL = "fnCall",
    OBJECT_FILE = "127.0.0.1:9090",
    LANGUAGE PROTOBUF;
```

## UDF 卸载

卸载 UDF 的 SQL 语法如下：

```sql
DROP FUNCTION <UDF-NAME>
```

例如：

```sql
DROP FUNCTION rpc_udf1
```

## UDF 查询

UDF 的使用方法与普通内建函数的类似。

### 支持的基础 SQL 语法

* `SLIMIT` / `SOFFSET`
* `LIMIT` / `OFFSET`
* 支持值过滤
* 支持时间过滤

### 带 * 查询

假定现在有时间序列 `root.sg.d1.s1`和 `root.sg.d1.s2`。

* **执行`SELECT example(*) from root.sg.d1`**

那么结果集中将包括`example(root.sg.d1.s1)`和`example(root.sg.d1.s2)`的结果。

* **执行`SELECT example(s1, *) from root.sg.d1`**

那么结果集中将包括`example(root.sg.d1.s1, root.sg.d1.s1)`和`example(root.sg.d1.s1, root.sg.d1.s2)`的结果。

* **执行`SELECT example(*, *) from root.sg.d1`**

那么结果集中将包括`example(root.sg.d1.s1, root.sg.d1.s1)`，`example(root.sg.d1.s2, root.sg.d1.s1)`，`example(root.sg.d1.s1, root.sg.d1.s2)` 和 `example(root.sg.d1.s2, root.sg.d1.s2)`的结果。

### 带自定义输入参数的查询

您可以在进行 UDF 查询的时候，向 UDF 传入任意数量的键值对参数。键值对中的键和值都需要被单引号或者双引号引起来。注意，键值对参数只能在所有时间序列后传入。下面是一组例子：

```sql
SELECT example(s1, 'key1'='value1', 'key2'='value2'), example(*, 'key3'='value3') FROM root.sg.d1;
SELECT example(s1, s2, 'key1'='value1', 'key2'='value2') FROM root.sg.d1;
```

### 与其他查询的嵌套查询

```sql
SELECT s1, s2, example(s1, s2) FROM root.sg.d1;
SELECT *, example(*) FROM root.sg.d1 DISABLE ALIGN;
SELECT s1 * example(* / s1 + s2) FROM root.sg.d1;
SELECT s1, s2, s1 + example(s1, s2), s1 - example(s1 + example(s1, s2) / s2) FROM root.sg.d1;
```

## 查看所有注册的 UDF

```sql
SHOW FUNCTIONS
```

## 用户权限管理

用户在使用 UDF 时会涉及到 3 种权限：

* `CREATE_FUNCTION`：具备该权限的用户才被允许执行 UDF 注册操作
* `DROP_FUNCTION`：具备该权限的用户才被允许执行 UDF 卸载操作
* `READ_TIMESERIES`：具备该权限的用户才被允许使用 UDF 进行查询

更多用户权限相关的内容，请参考 [权限管理语句](../Administration-Management/Administration.md)。
