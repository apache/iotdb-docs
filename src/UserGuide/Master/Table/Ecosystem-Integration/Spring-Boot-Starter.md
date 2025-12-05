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

## 1. Overview
The Spring Boot Starter is a core modular component in the Spring Boot ecosystem. It simplifies the integration of third-party technologies (such as databases, message queues, and security frameworks) with Spring Boot applications through predefined dependency sets and automated configuration mechanisms. Each Starter encapsulates the core libraries, default configurations, and conditional initialization logic required for specific functionalities. Developers only need to include the dependency to achieve "zero-configuration" integration, adhering to the "convention over configuration" principle.

The officially provided iotdb-spring-boot-starter by IoTDB is a standardized integration component designed for the Spring Boot ecosystem, enabling developers to quickly and efficiently connect with time-series databases. By simply adding the dependency, developers can leverage IoTDB functionalities or modules, significantly reducing the complexity of technical integration in time-series data scenarios. This is particularly suitable for applications involving IoT, industrial internet, and other high-frequency time-series data storage and analysis.

## 2. Usage Steps

### 2.1 Version Requirements

* `IoTDB: >=2.0.3`
* `iotdb-spring-boot-starter: >=2.0.3`

### 2.2 Procedure

1. Install and start IoTDB, refer to [IoTDB QuickStart](../QuickStart/QuickStart.md)
2. Add the Maven dependency to your project

```xml
<dependency>
    <groupId>org.apache.iotdb</groupId>
    <artifactId>iotdb-spring-boot-starter</artifactId>
    <version>2.0.3</version>
</dependency>
```

3. Configure custom settings in `application.properties`:

```Properties
# IoTDB service address (format: IP:Port)
iotdb.session.url=127.0.0.1:6667
# IoTDB username
iotdb.session.username=root
# IoTDB password
iotdb.session.password=root
# Default SQL dialect
iotdb.session.sql-dialect=table
# Default database
iotdb.session.database=wind
# Connection pool max size
iotdb.session.max-size=10
```

4. Use the target Bean via `@Autowired`, for example

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

## 3. Usage Examples
For detailed examples, refer to the source code [examples/iotdb-spring-boot-start](https://github.com/apache/iotdb-extras/tree/master/examples/iotdb-spring-boot-start)