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

# Mybatis Generator


## 1. 概述

MyBatis Generator 是 MyBatis 官方推出的持久层代码自动化生成工具，通过解析数据库表结构自动生成实体类（POJO）、Mapper 接口及 XML 映射文件，可快速构建标准化 CRUD 操作逻辑，显著减少基础代码开发成本。为简化时序数据库场景下的集成流程，IoTDB 官方基于此工具扩展推出 `IoTDB-Mybatis-Generator`，针对 IoTDB 的时序数据模型特性进行深度适配，能够自动生成符合时序存储语义的实体类，mapper接口及对应的mapper.xml文件，为 IoTDB 的高效接入提供了标准化、可复用的工程实践方案。

## 2. 使用步骤

### 2.1 版本要求

* `IoTDB`: >=2.0.2

* `mybatis-generator-plugin`: >=2.0.3

* `iotdb-jdbc`: >=2.0.3

### 2.2 操作流程

1. 安装并启动 IoTDB , 可参考 [IoTDB 快速入门](../QuickStart/QuickStart.md)

2. 获取插件

   * 方式一：直接引用 Maven 依赖

   * 方式二：通过克隆插件源码，进行本地依赖安装。

```Bash
git clone https://github.com/apache/iotdb-extras.git
cd .\mybatis-generator\
mvn clean install
```

3. 在需要使用插件的项目 pom 文件中引用目标依赖

```xml
<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
</properties>

<build>
    <plugins>
        <plugin>
            <groupId>org.mybatis.generator</groupId>
            <artifactId>mybatis-generator-maven-plugin</artifactId>
            <version>1.4.2</version>
            <dependencies>
                <dependency>
                    <groupId>org.apache.iotdb</groupId>
                    <artifactId>mybatis-generator-plugin</artifactId>
                    <version>{lastest_version}</version>
                     <!--例如： <version>2.0.3</version> -->
                </dependency>
            </dependencies>
            <configuration>
                <verbose>true</verbose>
                <overwrite>true</overwrite>
                <configurationFile>src/main/resources/generatorConfig.xml</configurationFile>
            </configuration>
        </plugin>
    </plugins>
</build>
```

4. 自定义配置文件`generatorConfig.xml`放到 `resources `目录下，`generatorConfig.xml`内容可参考如下模板，其中可维护项主要涉及`jdbcConnection`、`javaModelGenerator`、`sqlMapGenerator`、`javaClientGenerator`、`table`。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE generatorConfiguration PUBLIC "-//mybatis.org//DTD MyBatis Generator Configuration 1.0//EN" "http://mybatis.org/dtd/mybatis-generator-config_1_0.dtd">
<generatorConfiguration>
    <classPathEntry location="/apache/iotdb/iotdb-client/jdbc/target/iotdb-jdbc-2.0.4-SNAPSHOT-jar-with-dependencies.jar"/>
    <!-- mvn mybatis-generator:generate hierarchical/flat-->
    <context id="myBatis3Simple" targetRuntime="MyBatis3Simple" defaultModelType="flat">
        <plugin type="org.apache.iotdb.mybatis.plugin.LombokPlugin"/>
        <plugin type="org.apache.iotdb.mybatis.plugin.BatchInsertPlugin"/>
        <plugin type="org.apache.iotdb.mybatis.plugin.SerializablePlugin"/>
        <plugin type="org.mybatis.generator.plugins.VirtualPrimaryKeyPlugin"/>
        <commentGenerator type="org.apache.iotdb.mybatis.plugin.generator.SwaggerCommentGenerator">
            <property name="suppressAllComments" value="true"/>
            <property name="suppressDate" value="true"/>
            <property name="addRemarkComments" value="true"/>
        </commentGenerator>
        <jdbcConnection driverClass="org.apache.iotdb.jdbc.IoTDBDriver" connectionURL="jdbc:iotdb://127.0.0.1:6667/database1?sql_dialect=table" userId="root" password="root"/>
        <javaTypeResolver type="org.apache.iotdb.mybatis.plugin.generator.resolver.IoTDBJavaTypeResolver">
            <property name="forceBigDecimals" value="false"/>
        </javaTypeResolver>
        <javaModelGenerator targetPackage="org.apache.iotdb.mybatis.plugin.model" targetProject="src/main/java">
            <property name="trimStrings" value="true"/>
        </javaModelGenerator>
        <sqlMapGenerator targetPackage="org.apache.iotdb.mybatis.plugin.xml" targetProject="src/main/java">
        </sqlMapGenerator>
        <javaClientGenerator type="XMLMAPPER" targetPackage="org.apache.iotdb.mybatis.plugin.mapper" targetProject="src/main/java">
        </javaClientGenerator>
        <table schema="database1" tableName="table1" domainObjectName="table1" enableSelectByPrimaryKey="true" enableInsert="true" enableDeleteByPrimaryKey="true">
            <property name="virtualKeyColumns" value="time,region,plant_id,device_id,model_id,maintenance,temperature,humidity,status,arrival_time"/>
        </table>
    </context>
</generatorConfiguration>
```

5. 执行如下命令，即可在配置的目标目录下生成目标代码。

```Shell
mvn mybatis-generator:generate
```

6. 查看目标代码

```Shell
# You can see the target file in your Project
org/apache/iotdb/mybatis/plugin/model/table1.java
org/apache/iotdb/mybatis/plugin/mapper/table1Mapper.java
org/apache/iotdb/mybatis/plugin/xml/table1Mapper.xml
```

## 3. 使用示例

详细的使用示例可参考源码 [examples/mybatis-generator](https://github.com/apache/iotdb-extras/tree/master/examples/mybatis-generator)