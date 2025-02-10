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


# 白名单

**功能描述**

允许哪些客户端地址能连接 IoTDB

**配置文件**

conf/iotdb-system.properties

conf/white.list

**配置项**

iotdb-system.properties:

决定是否开启白名单功能

```YAML
# 是否开启白名单功能
enable_white_list=true
```

white.list:

决定哪些IP地址能够连接IoTDB

```YAML
# 支持注释
# 支持精确匹配，每行一个ip
10.2.3.4

# 支持*通配符，每行一个ip
10.*.1.3
10.100.0.*
```

**注意事项**

1. 如果通过session客户端取消本身的白名单，当前连接并不会立即断开。在下次创建连接的时候拒绝。
2. 如果直接修改white.list，一分钟内生效。如果通过session客户端修改，立即生效，更新内存中的值和white.list磁盘文件
3. 开启白名单功能，没有white.list 文件，启动DB服务成功，但是，拒绝所有连接。
4. DB服务运行中，删除 white.list 文件，至多一分钟后，拒绝所有连接。
5. 是否开启白名单功能的配置，可以热加载。
6. 使用Java 原生接口修改白名单，必须是root用户才能修改，拒绝非root用户修改；修改内容必须合法，否则会抛出StatementExecutionException异常。

![白名单](https://alioss.timecho.com/docs/img/%E7%99%BD%E5%90%8D%E5%8D%95.PNG)

