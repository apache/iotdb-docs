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

# 数据安全

## 1. 数据存储加密
### 1.1 概述

IoTDB 通过内置的透明加密引擎支持对数据文件 TsFile 的加密防护。启用加密功能后，即可实现数据在写入时实时加密、读取时无缝解密的全流程自动化处理，保证落盘文件数据安全。该过程完全融入数据库内核，业务应用无感知且无需进行任何代码改造或查询逻辑调整。

### 1.2 参数配置

IoTDB 配置文件` ${IOTDB_HOME}/${IOTDB_CONF}/iotdb-system.properties`中数据加密相关的参数如下所示：

| 参数               | 注释                                                         |
| :----------------- | :----------------------------------------------------------- |
| `encrypt flag`     | `true`为开启加密                                             |
| `encrypt_key_path` | 文件导入的主密钥文件路径                                     |
| `encrypt type`     | 加密方式，例如"`org.apache.tsfile.encrypt.UNENCRYPTED`"。目前包括`AES128`和`UNENCRYPTED(SM4128)`。 |

### 1.3 使用流程

1. 获取 加密算法 Jar 包
2. 将 Jar 包放置于 IoTDB 部署路径下 lib 文件夹中，即 `${IOTDB_HOME}/lib`
3. 修改配置文件 ` ${IOTDB_HOME}/${IOTDB_CONF}/iotdb-system.properties`

```Properties
encrypt_flag=true
encrypt_type=org.example.encrypt.AES128.AES128
# encrypt_type=org.example.encrypt.SM4128.5M41283
encrypt_key_path=......
```

4. 启动 IoTDB 即可使用对应加密算法对 TsFile 文件进行加密。

### 1.4 注意事项

- 开启加密后，对合并功能无影响。但不支持系统内存在与配置不同的加密文件，以免触发合并时发生冲突。
- 开启加密后禁用 Pipe。
- 开启加密后禁用 Load TsFile。
- 建议对主密钥文件路径进行一定的保护，例如存放在特定权限才能访问的磁盘上等。

## 2. 数据传输加密

### 2.1 概述

在某些客户的生产环境中，对于数据传输的安全性要求更高，希望有更安全的传输方式，因此扩展了 Datanode 的 Client RPC 以支持数据传输加密。以下是支持数据传输加密的方式：

1. Thrift 除了普通模式与压缩模式外，增加 SSL 模式
2. SessionPool(java) 与 Session(java) 支持使用 SSL 模式连接
3. JDBC 支持使用 SSL 模式连接
4. CLI 支持使用 SSL 模式连接
5. 支持压缩模式
6. 支持 RSA  ECDSA 证书
   1. RSA证书：算法为RSA，签名算法为SHA256withRSA
   2. ECDSA 证书：算法为EC，签名算法为SHA256withECDSA

### 2.2 Server端配置

iotdb-datanode.properties 的默认配置，默认 ssl 是关闭状态。

#### 2.2.1 默认配置示例：

```Properties
#iotdb-datanode.properties的默认配置
.......
# is SSL enabled
#enable_thrift_ssl=false

# SSL key store path
#key_store_path=

# SSL key store password
#key_store_pwd=
.......
```

#### 2.2.2 启用 ssl 配置步骤：

1. 在iotdb/conf/iotdb-datanode.properties 配置文件中找到enable_thrift_ssl 配置默认是false,修改成true
2. 修改key_store_path，添加生成的keystore路径
3. 修改key_store_pwd为生成keystore的密码（秘钥库口令）
4. 启动iotdb服务

启用 ssl 配置后，需重启 iotdb 服务。同时，对应的使用到 dn_rpc_port 接口的客户端都需要使用 ssl 方式访问，否则不能访问。

```SQL
# is SSL enabled
enable_thrift_ssl=true

# SSL key store path
key_store_path=/Users/keystore/.keystore

# SSL key store password
key_store_pwd=123456
```

### 2.3 Java SessionPool

SessionPool 客户端配置ssl 需要配置useSSL、trustStore、trustStorePwd。

- useSSL ：是否开启ssl
- trustStore ：truststore的证书路径
- trustStorePwd：truststore的证书密码（秘钥库口令）

#### 2.3.1 代码示例：

```SQL
 sessionPool =
 new SessionPool.Builder()
 .nodeUrls(nodeUrls)
.user("root")
.password("root")
.maxSize(3)
.useSSL(true)
.trustStore("/Users/key/.truststore")
 .trustStorePwd("123456")
 .build();
```

### 2.4 Java Session

Session 客户端配置ssl 需要配置useSSL、trustStore、trustStorePwd 代码示例

- useSSL ：是否开启ssl
- trustStore ：truststore的证书路径
- trustStorePwd：truststore的证书密码（秘钥库口令）

#### 2.4.1 代码示例：

```SQL
session =
    new Session.Builder()
        .host(LOCAL_HOST)
        .port(6667)
        .username("root")
        .password("root")
        .version(Version.V_1_0)
        .useSSL(true)
        .trustStore("/Users/key/.truststore")
        .trustStorePwd("123456")
        .build();
```

### 2.5 Python
python 客户端配置 ssl 需要设置use_ssl、ca_certs。

- use_ssl ：是否启用 SSL。
- ca_certs ： 指定客户端证书路径。

#### 2.5.1 代码示例

```python
ip = "127.0.0.1"
port_ = "6667"
username_ = "root"
password_ = "root"
# Configure SSL enabled
use_ssl = True
# Configure certificate path
ca_certs = "/path/server.crt"


def get_data():
    session = Session(
        ip, port_, username_, password_, use_ssl=use_ssl, ca_certs=ca_certs
    )
```

### 2.6 JDBC

jdbc 支持两种方式的ssl 配置，需要配置use_ssl、trust_store、trust_store_pwd。

- use_ssl:是否开启ssl 默认是false
- trust_store:truststore的证书路径
- trust_store_pwd:truststore证书的密码（秘钥库口令）

#### 2.6.1 代码示例：

**方式一、在jdbc 的url 中配置使用**

jdbc:iotdb://ip:port?use_ssl=true&trust_store_pwd=123456&trust_store=/Users/keystore/.truststore

```SQL
try (Connection connection =
        DriverManager.getConnection(
            "jdbc:iotdb://127.0.0.1:6667?version=V_1_0&use_ssl=true&trust_store_pwd=123456&trust_store=/Users/keystore/.truststore",
            "root",
            "root");Statement statement = connection.createStatement(){
           // 代码逻辑 
            
 }catch (IoTDBSQLException e) {
      logger.error("IoTDB Jdbc example error", e);
 }
```

**方式二、使用Properties 来配置使用**

```SQL
java.util.Properties info = new Properties();
info.setProperty("use_ssl", "true");
info.setProperty("user", "root");
info.setProperty("password", "root");
info.setProperty("trust_store", "/Users/keystore/.truststore");
info.setProperty("trust_store_pwd","123456");
try (Connection connection =
        DriverManager.getConnection("jdbc:iotdb://127.0.0.1:6667?version=V_1_0", info);
        Statement statement = connection.createStatement()) {
        // 代码逻辑
        
}catch (IoTDBSQLException e) {
      logger.error("IoTDB Jdbc example error", e);
}
``` 


### 2.7 CLI

```SQL
./start-cli.sh -h 127.0.0.1 -p 6667 -u root -pw root -usessl true -ts /Users/keystore/.truststore -tpw 123456
```

### 2.8 SSL证书生成方式

需安装 JDK、测试jdk8和jdk11生成证书未发现问题

1. 创建私钥（.keystore）

```SQL
keytool -genkeypair -alias mykey -keyalg RSA -validity 7 -keystore .keystore
```

2. 导出对应的证书

```SQL
keytool -export -alias mykey -keystore .keystore -rfc -file certificate.cer
```

3. 将该证书导入到客户端信任库（公钥：.truststore）

```SQL
keytool -import -alias mykey -file certificate.cer -keystore .truststore
```

4. 创建 ECDSA 证书

提示:FIPS标准规定使用 RSA、ECDSA 或 EdDSA(23年刚支持)

```Bash
keytool -genkeypair -alias mykey -keyalg EC -validity 7 -keystore aa.keystore

keytool -export -alias mykey -keystore aa.keystore -rfc -file certificate.cer

keytool -import -alias mykey -file certificate.cer -keystore aa.truststore
```

### 2.9 性能测试

#### 2.9.1 插入测试

使用session 的inserttablet方法，使用100 设备*100测点，每批 100 行 loop 100 次，测试3遍，三次插入使用不同的设备名字，测试环境：1c1d，mac 16G，Intel Core i5。

**代码示例：**

```Properties
for(int i=0;i<100;i++){
  insertTablet(i+"");
}
private static void insertTablet(String d) throws IoTDBConnectionException, StatementExecutionException {
  List<MeasurementSchema> schemaList = new ArrayList<>();
  for(int i=1;i<=100;i++){
    schemaList.add(new MeasurementSchema("s"+i, TSDataType.INT64));
  }

  Tablet tablet = new Tablet(ROOT_SG1_D1+d, schemaList, 100);
  long timestamp = System.currentTimeMillis();

  for (long row = 0; row < 100; row++) {
    int rowIndex = tablet.rowSize++;
    tablet.addTimestamp(rowIndex, timestamp);
    for (int s = 0; s < 100; s++) {
      long value = random.nextLong();
      tablet.addValue(schemaList.get(s).getMeasurementId(), rowIndex, value);
    }
    if (tablet.rowSize == tablet.getMaxRowNumber()) {
      session.insertTablet(tablet, true);
      tablet.reset();
    }
    timestamp++;
  }

  if (tablet.rowSize != 0) {
    session.insertTablet(tablet);
    tablet.reset();
  }

}
```

**插入测试结果:**

|        | ssl（单位ms） | 非ssl（单位ms） |
| ------ | ------------- | --------------- |
| 第一次 | 13611         | 14099           |
| 第二次 | 11938         | 10236           |
| 第三次 | 13801         | 13663           |

**测试结论：**

根据ssl 三次取平均值为13117ms、非ssl取平均值12666ms，综合测试结果可以看出非ssl 插入速度略快ssl(`3.5%`)

#### 2.9.2 查询测试

使用session 的executeQueryStatement方法、循环100次查询不同设备的测点，测试3遍，查询完后修改ssl重启iotdb，三次查询使用不同的设备名字，测试环境：1c1d，mac 16G，Intel Core i5

**代码示例：**

```Properties
private static void query(String d) throws IoTDBConnectionException, StatementExecutionException {
try (SessionDataSet dataSet = session.executeQueryStatement("select * from root.sg1.d9"+d)) {
System.out.println(dataSet.getColumnNames());
dataSet.setFetchSize(1024); // default is 10000
while (dataSet.hasNext()) {
System.out.println(dataSet.next());
}
}
}
```

**查询测试结果:**

|        | ssl（单位ms） | 非ssl（单位ms） |
| ------ | ------------- | --------------- |
| 第一次 | 7101          | 6111            |
| 第二次 | 3109          | 2162            |
| 第三次 | 3594          | 3032            |

**测试结论：**

根据ssl 三次取平均值为4601ms、非ssl取平均值3768ms，综合测试结果可以看出非ssl 插入速度略快ssl（`22%`）