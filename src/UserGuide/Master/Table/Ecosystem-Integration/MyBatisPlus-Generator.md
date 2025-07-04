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

## 1. Overview

MyBatis-Plus Generator is a built-in code generation tool of the MyBatis-Plus framework. It automatically generates standardized entity classes, Mapper interfaces, Service layers, and Controller layer code based on the database table structure. It integrates MyBatis-Plus's general CRUD methods (such as `BaseMapper` built-in create, read, update, delete) and condition constructors (`QueryWrapper`), and supports extended annotations like Lombok and Swagger. Through simple configuration, it can quickly build persistent layer code that conforms to enterprise-level specifications, greatly reducing repetitive development work for single-table operations. It is suitable for quickly building background management systems or standardized data service modules.

The following will introduce how to use Mybatis-Plus Generator to connect to IoTDB and generate entity classes, Mapper interfaces, Service layers, and Controller layer code files corresponding to database tables.

## 2. Usage Steps

### 2.1 Version Requirements

- IoTDB: >=2.0.2-SNAPSHOT
- mybatisPlus: >=3.5.10
- iotdb-jdbc:>=2.0.4-SNAPSHOT

### 2.2 Operating Process

#### 2.2.1 IoTDB Environment Setup

1. Download, install, and start the IoTDB service. For details, refer to [QuickStart](../QuickStart/QuickStart.md)
2. Create the database database1 and tables table1 / table2. Relevant SQL statements can refer to [Sample-Data](../Reference/Sample-Data.md)

#### 2.2.2 Create a Maven Project

1. Create a Maven project
2. Add the following dependency configurations to the pom

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
3. Create an execution file, modify the `url`/`username`/`password` of the target IoTDB, and the target file generation directory `outputDir`/`pathInfo`

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

#### 2.2.3 Generate Target Files

1. Run Main.java
2. View the log output. The following indicates that the target files are generated

```Java
16:10:08.943 [main] DEBUG com.baomidou.mybatisplus.generator.AutoGenerator -- ==========================File generation completed！！！==========================
```

#### 2.2.4 Generate Target Files

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
![](/img/MyBatisPlus-Generator.png.png)

#### 2.2.5 Modify Annotations

Manually adjust the generated code `org/apache/iotdb/entity/Table1.java`, `org/apache/iotdb/entity/Table2.java` to support multi-primary key queries.

```TypeScript
// Add new import
import com.github.jeffreyning.mybatisplus.anno.MppMultiId;

// Add new annotation @MppMultiId
@MppMultiId
// Modify annotation @TableId() -->> @TableField()
@TableField("time")
private Date time;

// Add new annotation @MppMultiId
@MppMultiId
// Modify annotation @TableId() -->> @TableField()
@TableField("region")
private String region;

// Add new annotation @MppMultiId
@MppMultiId
// Modify annotation @TableId() -->> @TableField()
@TableField("plant_id")
private String plantId;

// Add new annotation @MppMultiId
@MppMultiId
// Modify annotation @TableId() -->> @TableField()
@TableField("device_id")
private String deviceId;
```

## 3. Usage Example

For a complete usage example, refer to the source code [examples/mybatisplus-generator](https://github.com/apache/iotdb-extras/tree/master/examples/mybatisplus-generator) 

