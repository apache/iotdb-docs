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


## 1. Overview

MyBatis Generator is an automated code generation tool officially released by MyBatis for the persistence layer. By parsing database table structures, it automatically generates entity classes (POJOs), Mapper interfaces, and XML mapping files. This enables rapid construction of standardized CRUD operation logic and significantly reduces the development cost of foundational code.

To simplify integration in time-series database scenarios, the IoTDB team has extended this tool to launch ​**​IoTDB MyBatis Generator​**​. Deeply adapted for IoTDB's time-series data model characteristics, it automatically generates entity classes, Mapper interfaces, and corresponding Mapper XML files that conform to time-series storage semantics. This provides a standardized and reusable engineering practice solution for efficient IoTDB integration.

## 2. Usage Steps

### 2.1 Version Requirements

* `IoTDB`: >=2.0.2

* `mybatis-generator-plugin`: >=2.0.3

* `iotdb-jdbc`: >=2.0.3

### 2.2 Operating Procedure

1. ​Install and start IoTDB,  Refer to [IoTDB Quick Start](../QuickStart/QuickStart.md)

2. Obtain the plugin​
   
   * ​​Method 1​*: Directly reference the Maven dependency

   * ​​Method 2​​: Clone the plugin source code and install locally:

```Bash
git clone https://github.com/apache/iotdb-extras.git
cd .\mybatis-generator\
mvn clean install
```

3. Add dependency

 Add the following configuration to your project's `pom.xml`:

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
                     <!--Example: <version>2.0.3</version> -->
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

4. Configure generatorConfig.xml 

* Place the following configuration in `src/main/resources/generatorConfig.xml`:

* Key customizable elements: `jdbcConnection`, `javaModelGenerator`, `sqlMapGenerator`, `javaClientGenerator`, `table`

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

5. Execute code generation

Run in terminal:

```Shell
mvn mybatis-generator:generate
```

6. View generated code​

Find the generated files in your project:

```Shell
# You can see the target file in your Project
org/apache/iotdb/mybatis/plugin/model/table1.java
org/apache/iotdb/mybatis/plugin/mapper/table1Mapper.java
org/apache/iotdb/mybatis/plugin/xml/table1Mapper.xml
```

## 3. Usage Example

For detailed usage examples, refer to the source code: [examples/mybatis-generator](https://github.com/apache/iotdb-extras/tree/master/examples/mybatis-generator)
