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

# MyBatisPlus Generator

## 1. 概述

MyBatis-Plus Generator 是 MyBatis-Plus 框架内置的代码生成工具，基于数据库表结构自动生成标准化的实体类、Mapper 接口、Service 层及 Controller 层代码，集成 MyBatis-Plus 的通用 CRUD 方法（如 `BaseMapper` 内置增删改查）和条件构造器（`QueryWrapper`），支持 Lombok、Swagger 等扩展注解，通过简单配置即可快速构建符合企业级规范的持久层代码，大幅减少单表操作的重复开发工作，适用于快速搭建后台管理系统或标准化数据服务模块。

下文将介绍如何使用 Mybatis-Plus Generator 连接 IoTDB ，并生成数据库表对应的实体类、Mapper 接口、Service 层及 Controller 层代码文件。

## 2. 使用步骤

### 2.1 版本要求

- IoTDB: >=2.0.2-SNAPSHOT
- mybatisPlus: >=3.5.10
- iotdb-jdbc:>=2.0.4-SNAPSHOT

### 2.2 操作流程

#### 2.2.1 IoTDB 环境搭建

1. 下载、安装并启动 IoTDB 服务，具体可参考[快速上手](../QuickStart/QuickStart.md)
2. 创建数据库 database1 及表 table1 / table2，相关 SQL 语句可参考[示例数据](../Reference/Sample-Data.md)

#### 2.2.2 创建 Maven项目

1. 创建 Maven 项目
2. 在 pom 中增加如下依赖配置

```XML
<properties>
    <maven.compiler.source>17</maven.compiler.source>
    <maven.compiler.target>17</maven.compiler.target>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
</properties>

<dependencies>
    <dependency>
        <groupId>com.baomidou</groupId>
        <artifactId>mybatis-plus-spring-boot3-starter</artifactId>
        <version>3.5.10</version>
    </dependency>
    <dependency>
        <groupId>com.baomidou</groupId>
        <artifactId>mybatis-plus-generator</artifactId>
        <version>3.5.10</version>
    </dependency>
    <dependency>
        <groupId>com.github.jeffreyning</groupId>
        <artifactId>mybatisplus-plus</artifactId>
        <version>1.7.5-RELEASE</version>
    </dependency>
    <dependency>
        <groupId>org.apache.velocity</groupId>
        <artifactId>velocity-engine-core</artifactId>
        <version>2.0</version>
    </dependency>
    <dependency>
        <groupId>org.apache.iotdb</groupId>
        <artifactId>iotdb-jdbc</artifactId>
        <version>2.0.4-SNAPSHOT</version>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter</artifactId>
        <version>3.4.3</version>
        <exclusions>
            <exclusion>
                <groupId>org.slf4j</groupId>
                <artifactId>slf4j-api</artifactId>
            </exclusion>
            <exclusion>
                <groupId>commons-logging</groupId>
                <artifactId>commons-logging</artifactId>
            </exclusion>
        </exclusions>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
        <version>3.4.3</version>
        <exclusions>
            <exclusion>
                <groupId>org.slf4j</groupId>
                <artifactId>slf4j-api</artifactId>
            </exclusion>
            <exclusion>
                <groupId>commons-logging</groupId>
                <artifactId>commons-logging</artifactId>
            </exclusion>
        </exclusions>
    </dependency>
    <dependency>
        <groupId>io.springfox</groupId>
        <artifactId>springfox-swagger2</artifactId>
        <version>3.0.0</version>
    </dependency>
    <dependency>
        <groupId>io.springfox</groupId>
        <artifactId>springfox-swagger-ui</artifactId>
        <version>3.0.0</version>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <version>1.18.36</version>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <version>3.4.3</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>slf4j-api</artifactId>
        <version>2.0.13</version>
    </dependency>
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-classic</artifactId>
        <version>1.5.16</version>
    </dependency>
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-core</artifactId>
        <version>1.5.16</version>
    </dependency>
</dependencies>
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
                    <version>2.0.2-SNAPSHOT</version>
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
3. 新建执行文件，修改目标 IoTDB 的 `url`/ `username` / `password`，和目标文件生成目录 `outputDir`/`pathInfo`

```Java
package org.apache.iotdb;

import com.baomidou.mybatisplus.generator.FastAutoGenerator;
import com.baomidou.mybatisplus.generator.config.DataSourceConfig;
import com.baomidou.mybatisplus.generator.config.OutputFile;
import com.baomidou.mybatisplus.generator.config.rules.DateType;
import com.baomidou.mybatisplus.generator.config.rules.DbColumnType;
import org.apache.iotdb.jdbc.IoTDBDataSource;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.sql.Types;
import java.util.Collections;


@SpringBootApplication
@MapperScan("org.apache.iotdb.mapper")
public class Main {
    public static void main(String[] args) {
        SpringApplication.run(Main.class, args);
        IoTDBDataSource dataSource = new IoTDBDataSource();
        dataSource.setUrl("jdbc:iotdb://127.0.0.1:6667/database1?sql_dialect=table");
        dataSource.setUser("root");
        dataSource.setPassword("root");
        FastAutoGenerator generator = FastAutoGenerator.create(new DataSourceConfig.Builder(dataSource).driverClassName("org.apache.iotdb.jdbc.IoTDBDriver"));
        generator
                .globalConfig(builder -> {
                    builder.author("IoTDB")
                            .enableSwagger()
                            .dateType(DateType.ONLY_DATE)
                            .outputDir("src/main/java");
                })
                .packageConfig(builder -> {
                    builder.parent("org.apache.iotdb")
                            .mapper("mapper")
                            .pathInfo(Collections.singletonMap(OutputFile.xml, "src/main/java/org/apache/iotdb/xml"));
                })
                .dataSourceConfig(builder -> {
                    builder.typeConvertHandler((globalConfig, typeRegistry, metaInfo) -> {
                        int typeCode = metaInfo.getJdbcType().TYPE_CODE;
                        switch (typeCode) {
                            case Types.FLOAT:
                                return DbColumnType.FLOAT;
                            default:
                                return typeRegistry.getColumnType(metaInfo);
                        }
                    });
                })
                .strategyConfig(builder -> {
                    builder.addInclude("table1");
                    builder.entityBuilder()
                            .enableLombok()
//                            .addIgnoreColumns("create_time")
                            .enableFileOverride();
                    builder.serviceBuilder()
                            .formatServiceFileName("%sService")
                            .formatServiceImplFileName("%sServiceImpl")
                            .convertServiceFileName((entityName -> entityName + "Service"))
                            .enableFileOverride();
                    builder.controllerBuilder()
                            .enableRestStyle()
                            .enableFileOverride();
                })
                .strategyConfig(builder -> {
                    builder.addInclude("table2");
                    builder.entityBuilder()
                            .enableLombok()
//                            .addIgnoreColumns("create_time")
                            .enableFileOverride();
                    builder.serviceBuilder()
                            .formatServiceFileName("%sService")
                            .formatServiceImplFileName("%sServiceImpl")
                            .convertServiceFileName((entityName -> entityName + "Service"))
                            .enableFileOverride();
                    builder.controllerBuilder()
                            .enableRestStyle()
                            .enableFileOverride();
                })
                .execute();
    }
}
```

#### 2.2.3 生成目标文件

1. 运行 Main.java
2. 查看日志输出，如下所示即生成目标文件

```Java
16:10:08.943 [main] DEBUG com.baomidou.mybatisplus.generator.AutoGenerator -- ==========================文件生成完成！！！==========================
```

#### 2.2.4 查看目标文件

```Plain
org/apache/iotdb/controller/Table1Controller.java
org/apache/iotdb/controller/Table2Controller.java
org/apache/iotdb/entity/Table1.java
org/apache/iotdb/mapper/Table2.xml
org/apache/iotdb/service/Table1Service.java  
org/apache/iotdb/service/Table2Service.java
org/apache/iotdb/service/impl/Table1ServiceImpl.java  
org/apache/iotdb/service/impl/Table2ServiceImpl.java
org/apache/iotdb/xml/Table1Mapper.xml
org/apache/iotdb/xml/Table2Mapper.xml
```
![](/img/MyBatisPlus-Generator.png)

#### 2.2.5 修改注释

手动调整生成的代码`org/apache/iotdb/entity/Table1.java`,`org/apache/iotdb/entity/Table2.java`使其支持多主键查询。

```TypeScript
// 新增 import
import com.github.jeffreyning.mybatisplus.anno.MppMultiId;

//  新增注解 @MppMultiId
@MppMultiId
// 修改注解 @TableId() -->> @TableField()
@TableField("time")
private Date time;

//  新增注解 @MppMultiId
@MppMultiId
// 修改注解 @TableId() -->> @TableField()
@TableField("region")
private String region;

//  新增注解 @MppMultiId
@MppMultiId
// 修改注解 @TableId() -->> @TableField()
@TableField("plant_id")
private String plantId;

//  新增注解 @MppMultiId
@MppMultiId
// 修改注解 @TableId() -->> @TableField()
@TableField("device_id")
private String deviceId;
```

## 3. 使用示例

完整的使用示例可参考源码 [examples/mybatisplus-generator](https://github.com/apache/iotdb-extras/tree/master/examples/mybatisplus-generator) 

