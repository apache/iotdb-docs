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

# OPC UA Protocol

## 1. OPC UA

OPC UA is a technical specification used in the automation field for communication between different devices and systems, enabling cross platform, cross language, and cross network operations, providing a reliable and secure data exchange foundation for the Industrial Internet of Things. IoTDB supports OPC UA protocol, and IoTDB OPC Server supports both Client/Server and Pub/Sub communication modes.

### 1.1 OPC UA Client/Server Mode

- **Client/Server Mode**：In this mode, IoTDB's stream processing engine establishes a connection with the OPC UA Server via an OPC UA Sink. The OPC UA Server maintains data within its Address Space, from which IoTDB can request and retrieve data. Additionally, other OPC UA Clients can access the data on the server.

<div align="center">
    <img src="/img/OPCUA15.png" alt="" style="width: 70%;"/>
</div>


- Features：

    - OPC UA will organize the device information received from Sink into folders under the Objects folder according to a tree model.

    - Each measurement point is recorded as a variable node and the latest value in the current database is recorded.

### 1.2 OPC UA Pub/Sub Mode

- **Pub/Sub Mode**： In this mode, IoTDB's stream processing engine sends data change events to the OPC UA Server through an OPC UA Sink. These events are published to the server's message queue and managed through Event Nodes. Other OPC UA Clients can subscribe to these Event Nodes to receive notifications upon data changes.

<div align="center">
    <img src="/img/OPCUA16.png" alt="" style="width: 70%;"/>
</div>

- Features：
 
  - Each measurement point is wrapped as an Event Node in OPC UA.

 
  - The relevant fields and their meanings are as follows:

    | Field       | Meaning             | Type (Milo)	  | Example                  |
    | :--------- | :--------------- | :------------ | :-------------------- |
    | Time       | Timestamp           | DateTime      | 1698907326198         |
    | SourceName | Full path of the measurement point	 | String        | root.test.opc.sensor0 |
    | SourceNode | Data type of the measurement point	     | NodeId        | Int32                 |
    | Message    | Data             | LocalizedText | 3.0                   |

  - Events are only sent to clients that are already listening; if a client is not connected, the Event will be ignored.


## 2. IoTDB OPC Server Startup method

### 2.1 Syntax

The syntax for creating the Sink is as follows:


```SQL
create pipe p1 
    with source (...) 
    with processor (...) 
    with sink ('sink' = 'opc-ua-sink', 
               'sink.opcua.tcp.port' = '12686', 
               'sink.opcua.https.port' = '8443', 
               'sink.user' = 'root', 
               'sink.password' = 'TimechoDB@2021', //Before V2.0.6.x the default password is root 
               'sink.opcua.security.dir' = '...'
              )
```

### 2.2 Parameters

| key                            | value                                                         | value range                         | required or not	 | default value                                                                                                                                                                                                                                                               |
| :------------------------------ | :----------------------------------------------------------- | :------------------------------------- | :------- |:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| sink                               | OPC UA SINK                    | String: opc-ua-sink              | Required	         |                                                                                                                                                                                                                                                                             |
| sink.opcua.model                   | OPC UA model used	              | String: client-server / pub-sub  | Optional         | pub-sub                                                                                                                                                                                                                                                                     |
| sink.opcua.tcp.port                | OPC UA's TCP port	             | Integer: [0, 65536]              | Optional         | 12686                                                                                                                                                                                                                                                                       |
| sink.opcua.https.port              | OPC UA's HTTPS port	           | Integer: [0, 65536]              | Optional         | 8443                                                                                                                                                                                                                                                                        |
| sink.opcua.security.dir            | Directory for OPC UA's keys and certificates	        | String: Path, supports absolute and relative directories | Optional         | Opc_security folder/<httpsPort: tcpPort>in the conf directory of the DataNode related to iotdb <br> If there is no conf directory for iotdb (such as launching DataNode in IDEA), it will be the iotdb_opc_Security folder/<httpsPort: tcpPort>in the user's home directory |
| sink.opcua.enable-anonymous-access | Whether OPC UA allows anonymous access	        | Boolean                          | Optional         | true                                                                                                                                                                                                                                                                        |
| sink.user                          | User for OPC UA, specified in the configuration	 | String                           | Optional         | root                                                                                                                                                                                                                                                                        |
| sink.password                      | Password for OPC UA, specified in the configuration	 | String                           | Optional         | TimechoDB@2021 //Before V2.0.6.x the default password is root                                                                                                                                                                                                               |

### 2.3 Example

```Bash
create pipe p1 
    with sink ('sink' = 'opc-ua-sink'，
               'sink.user' = 'root', 
               'sink.password' = 'TimechoDB@2021' //Before V2.0.6.x the default password is root 
start pipe p1;
```

### 2.4 Usage Limitations

1. **DataRegion Requirement**: The OPC UA server will only start if there is a DataRegion in IoTDB. For an empty IoTDB, a data entry is necessary for the OPC UA server to become effective.

2. **Data Availability**: Clients subscribing to the server will not receive data written to IoTDB before their connection.

3. **Multiple DataNodes may have scattered sending/conflict issues**：

  - For IoTDB clusters with multiple dataRegions and scattered across different DataNode IPs, data will be sent in a dispersed manner on the leaders of the dataRegions. The client needs to listen to the configuration ports of the DataNode IP separately.。

  - Suggest using this OPC UA server under 1C1D.

4. **Does not support deleting data and modifying measurement point types:** In Client Server mode, OPC UA cannot delete data or change data type settings. In Pub Sub mode, if data is deleted, information cannot be pushed to the client.

## 3. IoTDB OPC Server Example

### 3.1 Client / Server Mode

#### Preparation Work

1. Take UAExpert client as an example, download the UAExpert client: https://www.unified-automation.com/downloads/opc-ua-clients.html

2. Install UAExpert and fill in your own certificate information.

#### Quick Start

1. Use the following SQL to create and start the OPC UA Sink in client-server mode. For detailed syntax, please refer to: [IoTDB OPC Server Syntax](#syntax)

```SQL
create pipe p1 with sink ('sink'='opc-ua-sink');
```

2. Write some data.

```SQL
insert into root.test.db(time, s2) values(now(), 2)
```

​     The metadata is automatically created and enabled here.

3. Configure the connection to IoTDB in UAExpert, where the password should be set to the one defined in the sink.password parameter (using the default password "root" as an example):

<div align="center">
    <img src="/img/OPCUA18.png" alt="" style="width: 60%;"/>
</div>

<div align="center">
    <img src="/img/OPCUA04.png" alt="" style="width: 60%;"/>
</div>

4. After trusting the server's certificate, you can see the written data in the Objects folder on the left.

<div align="center">
    <img src="/img/OPCUA05.png" alt="" style="width: 60%;"/>
</div>

<div align="center">
    <img src="/img/OPCUA17.png" alt="" style="width: 60%;"/>
</div>

5. You can drag the node on the left to the center and display the latest value of that node:

<div align="center">
    <img src="/img/OPCUA07.png" alt="" style="width: 60%;"/>
</div>

### 3.2 Pub / Sub Mode

#### Preparation Work

The code is located in the [opc-ua-sink package](https://github.com/apache/iotdb/tree/rc/2.0.1/example/pipe-opc-ua-sink/src/main/java/org/apache/iotdb/opcua)under the iotdb-example package.

The code includes:

- The main class （ClientTest）
- Client certificate-related logic（IoTDBKeyStoreLoaderClient）
- Client configuration and startup logic（ClientExampleRunner）
- The parent class of ClientTest（ClientExample）

### 3.3 Quick Start

The steps are as follows:

1. Start IoTDB and write some data.

```SQL
insert into root.a.b(time, c, d) values(now(), 1, 2);
```

​     The metadata is automatically created and enabled here.

2. Use the following SQL to create and start the OPC UA Sink in Pub-Sub mode. For detailed syntax, please refer to: [IoTDB OPC Server Syntax](#syntax)

```SQL
create pipe p1 with sink ('sink'='opc-ua-sink', 
                          'sink.opcua.model'='pub-sub');
start pipe p1;
```

​     At this point, you can see that the opc certificate-related directory has been created under the server's conf directory.

<div align="center">
    <img src="/img/OPCUA08.png" alt="" style="width: 60%;"/>
</div>

3. Run the Client connection directly; the Client's certificate will be rejected by the server.

<div align="center">
    <img src="/img/OPCUA09.png" alt="" style="width: 60%;"/>
</div>

4. Go to the server's sink.opcua.security.dir directory, then to the pki's rejected directory, where the Client's certificate should have been generated.

<div align="center">
    <img src="/img/OPCUA10.png" alt="" style="width: 60%;"/>
</div>

5. Move (not copy) the client's certificate into (not into a subdirectory of) the trusted directory's certs folder in the same directory.

<div align="center">
    <img src="/img/OPCUA11.png" alt="" style="width: 60%;"/>
</div>

6. Open the Client connection again; the server's certificate should now be rejected by the Client.

<div align="center">
    <img src="/img/OPCUA12.png" alt="" style="width: 60%;"/>
</div>

7. Go to the client's <java.io.tmpdir>/client/security directory, then to the pki's rejected directory, and move the server's certificate into (not into a subdirectory of) the trusted directory.

<div align="center">
    <img src="/img/OPCUA13.png" alt="" style="width: 60%;"/>
</div>

8. Open the Client, and now the two-way trust is successful, and the Client can connect to the server.

9. Write data to the server, and the Client will print out the received data.

<div align="center">
    <img src="/img/OPCUA14.png" alt="" style="width: 60%;"/>
</div>


### 3.4 Notes

1. **stand alone and cluster:** It is recommended to use a 1C1D (one coordinator and one data node) single machine version. If there are multiple DataNodes in the cluster, data may be sent in a scattered manner across various DataNodes, and it may not be possible to listen to all the data.

2. **No Need to Operate Root Directory Certificates:** During the certificate operation process, there is no need to operate the `iotdb-server.pfx` certificate under the IoTDB security root directory and the `example-client.pfx` directory under the client security directory. When the Client and Server connect bidirectionally, they will send the root directory certificate to each other. If it is the first time the other party sees this certificate, it will be placed in the reject dir. If the certificate is in the trusted/certs, then the other party can trust it.

3. **It is Recommended to Use Java 17+:**
In JVM 8 versions, there may be a key length restriction, resulting in an "Illegal key size" error. For specific versions (such as jdk.1.8u151+), you can add `Security.`*`setProperty`*`("crypto.policy", "unlimited");`; in the create client of ClientExampleRunner to solve this, or you can download the unlimited package `local_policy.jar` and `US_export_policy ` to replace the packages in the `JDK/jre/lib/security `. Download link:https://www.oracle.com/java/technologies/javase-jce8-downloads.html。
