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

# Spring Boot Starter

## 1. 概述

Spring Boot Starter 是 Spring Boot 生态中的核心模块化组件，通过预定义依赖集合与自动化配置机制，简化第三方技术栈（如数据库、消息队列、安全框架）与 Spring Boot 应用的集成流程。每个 Starter 封装了特定功能所需的核心库、默认配置及条件化初始化逻辑，开发者仅需引入依赖即可实现“零配置”集成，遵循“约定优于配置”原则。

IoTDB 官方提供的 `iotdb-spring-boot-starter` 是专为 Spring Boot 生态设计的标准化集成组件，帮助开发者快速实现时序数据库的高效接入。开发者仅需引入依赖，即可使用 IoTDB 功能或模块，显著降低时序数据场景下的技术集成复杂度，适用于物联网、工业互联网等高频时序数据存储与分析场景。

## 2. 使用步骤

### 2.1 版本要求

* `IoTDB: >=2.0.3`
* `iotdb-spring-boot-starter: >=2.0.3`

### 2.2 操作流程

1. 安装并启动 IoTDB , 可参考 [IoTDB 快速入门](../QuickStart/QuickStart.md)
2. 在项目中添加 Maven 依赖

```xml
<dependency>
    <groupId>org.apache.iotdb</groupId>
    <artifactId>iotdb-spring-boot-starter</artifactId>
    <version>2.0.3</version>
</dependency>
```

3. 在 `application.properties` 文件中进行自定义配置

```Properties
# IoTDB 服务地址（格式：IP:Port）
iotdb.session.url=127.0.0.1:6667
# IoTDB 用户名
iotdb.session.username=root
# IoTDB 用户密码
iotdb.session.password=root
# 指定连接的默认模式
iotdb.session.sql-dialect=table
# 指定连接的默认数据库
iotdb.session.database=wind 
# 连接池最大连接数
iotdb.session.max-size=10
```

4. 通过 @Autowired 使用目标 Bean，例如

```java
@Autowired
private ITableSessionPool ioTDBSessionPool;

public void queryTableSessionPool() throws IoTDBConnectionException, StatementExecutionException {
    ITableSession tableSession = ioTDBSessionPool.getSession();
    final SessionDataSet sessionDataSet = tableSession.executeQueryStatement("select * from table1 limit 10");
    while (sessionDataSet.hasNext()) {
        final RowRecord rowRecord = sessionDataSet.next();
        final List<Field> fields = rowRecord.getFields();
        for (Field field : fields) {
            System.out.print(field.getStringValue());
        }
        System.out.println();
    }
}
```

## 3. 使用示例

详细的使用示例可参考源码 [examples/iotdb-spring-boot-start](https://github.com/apache/iotdb-extras/tree/master/examples/iotdb-spring-boot-start)