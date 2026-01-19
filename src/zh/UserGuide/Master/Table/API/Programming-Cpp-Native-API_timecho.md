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

# C++ 原生接口

## 1. 依赖

- Java 8+
- Flex
- Bison 2.7+
- Boost 1.56+
- OpenSSL 1.0+
- GCC 5.5.0+


## 2. 安装

### 2.1 安装相关依赖

- **MAC**
 1. 安装 Bison ：
  
     使用下面 brew 命令安装 bison 版本：
     ```shell
     brew install bison
     ```
     
  2. 安装 Boost ：确保安装最新的 Boost 版本。
  
     ```shell
     brew install boost
     ```
     
  3. 检查 OpenSSL ：确保 openssl 库已安装，默认的 openssl 头文件路径为"/usr/local/opt/openssl/include"

     如果在编译过程中出现找不到 openssl 的错误，尝试添加`-Dopenssl.include.dir=""`


- **Ubuntu 16.04+ 或其他 Debian 系列**

    使用以下命令安装所赖：

    ```shell
    sudo apt-get update
    sudo apt-get install gcc g++ bison flex libboost-all-dev libssl-dev
    ```


- **CentOS 7.7+/Fedora/Rocky Linux 或其他 Red-hat 系列**

    使用 yum 命令安装依赖：

    ```shell
    sudo yum update
    sudo yum install gcc gcc-c++ boost-devel bison flex openssl-devel
    ```


- **Windows**

1. 构建编译环境
   - 安装 MS Visual Studio（推荐安装 2019+ 版本）：安装时需要勾选 Visual Studio C/C++ IDE and compiler(supporting CMake, Clang, MinGW)
   - 下载安装 [CMake](https://cmake.org/download/) 。

2. 下载安装 Flex、Bison
   - 下载 [Win_Flex_Bison](https://sourceforge.net/projects/winflexbison/) 
   - 下载后需要将可执行文件重命名为 flex.exe 和 bison.exe 以保证编译时能够被找到，添加可执行文件的目录到 PATH 环境变量中

3. 安装 Boost 库
   - 下载 [Boost](https://www.boost.org/users/download/) 
   - 本地编译 Boost ：依次执行 bootstrap.bat 和 b2.exe
   - 添加 Boost 安装目录到 PATH 环境变量中，例如 `C:\Program Files (x86)\boost_1_78_0`
       
4. 安装 OpenSSL
   - 下载安装 [OpenSSL](http://slproweb.com/products/Win32OpenSSL.html) 
   - 添加 OpenSSL 下的 include 目录到 PATH 环境变量中


### 2.2 执行编译

从 git 克隆源代码:
```shell
git clone https://github.com/apache/iotdb.git
```

默认的主分支是 master 分支，如果你想使用某个发布版本，请切换分支 (如 1.3.2 版本):
```shell
git checkout rc/1.3.2
```

在 IoTDB 根目录下执行 maven 编译:

- Mac 或 glibc 版本 >= 2.32 的 Linux 
    ```shell
    ./mvnw clean package -pl example/client-cpp-example -am -DskipTests -P with-cpp
    ``` 

- glibc 版本 >= 2.31 的 Linux
    ```shell
    ./mvnw clean package -pl example/client-cpp-example -am -DskipTests -P with-cpp -Diotdb-tools-thrift.version=0.14.1.1-old-glibc-SNAPSHOT
    ```

- glibc 版本 >= 2.17 的 Linux
    ```shell
    ./mvnw clean package -pl example/client-cpp-example -am -DskipTests -P with-cpp -Diotdb-tools-thrift.version=0.14.1.1-glibc223-SNAPSHOT
    ```

- 使用 Visual Studio 2022 的 Windows
    ```batch
    .\mvnw.cmd clean package -pl example/client-cpp-example -am -DskipTests -P with-cpp
    ```

- 使用 Visual Studio 2019 的 Windows
    ```batch
    .\mvnw.cmd clean package -pl example/client-cpp-example -am -DskipTests -P with-cpp -Dcmake.generator="Visual Studio 16 2019" -Diotdb-tools-thrift.version=0.14.1.1-msvc142-SNAPSHOT
    ```
    - 如果没有将 Boost 库地址加入 PATH 环境变量，在编译命令中还需添加相关参数，例如：`-DboostIncludeDir="C:\Program Files (x86)\boost_1_78_0" -DboostLibraryDir="C:\Program Files (x86)\boost_1_78_0\stage\lib"`

编译成功后，打包好的库文件位于 `iotdb-client/client-cpp/target` 中，同时可以在 `example/client-cpp-example/target` 下找到编译好的示例程序。

### 2.3 编译 Q&A

Q：Linux 上的环境有哪些要求呢？

A：
- 已知依赖的 glibc (x86_64 版本) 最低版本要求为 2.17，GCC 最低版本为 5.5
- 已知依赖的 glibc (ARM 版本) 最低版本要求为 2.31，GCC 最低版本为 10.2
- 如果不满足上面的要求，可以尝试自己本地编译 Thrift
    - 下载 https://github.com/apache/iotdb-bin-resources/tree/iotdb-tools-thrift-v0.14.1.0/iotdb-tools-thrift 这里的代码
    - 执行 `./mvnw clean install`
    - 回到 iotdb 代码目录执行 `./mvnw clean package -pl example/client-cpp-example -am -DskipTests -P with-cpp`


Q：Linux 编译报错`undefined reference to '_libc_sinle_thread'`如何处理？

A：
- 该问题是用于默认的预编译 Thrift 依赖了过高的 glibc 版本导致的
- 可以尝试在编译的 maven 命令中增加 `-Diotdb-tools-thrift.version=0.14.1.1-glibc223-SNAPSHOT` 或者 `-Diotdb-tools-thrift.version=0.14.1.1-old-glibc-SNAPSHOT`

Q：如果在 Windows 上需要使用 Visual Studio 2017 或更早版本进行编译，要怎么做？

A:
- 可以尝试自己本地编译 Thrift 后再进行客户端的编译
    - 下载 https://github.com/apache/iotdb-bin-resources/tree/iotdb-tools-thrift-v0.14.1.0/iotdb-tools-thrift 这里的代码
    - 执行 `.\mvnw.cmd clean install`
    - 回到 iotdb 代码目录执行 `.\mvnw.cmd clean package -pl example/client-cpp-example -am -DskipTests -P with-cpp -Dcmake.generator="Visual Studio 15 2017"`

Q: Windows 上使用 Visual Studio 进行编译时出现乱码，如何解决？

A:
- 该问题是由于项目整体使用 utf-8 编码，而编译用到的一些 windows 系统文件编码不是 utf-8（系统编码默认跟随地区，在中国为 GBK）
- 可以在控制面板中更改系统区域设置，具体操作方法为：打开控制面板 -> 时钟和区域 -> 区域，切换到管理选项卡，在 "非Unicode程序的语言" 下，选择更改系统区域设置，勾选 `Beta版：使用Unicode UTF-8提供全球语言支持` 后重启电脑。（细节可能随windows版本有差异，可在网上寻找详细教程）
- 注意，修改 windows 系统编码后可能会导致一些其他使用 GBK 编码的程序出现乱码，将系统区域改回后可复原，请自行斟酌。

## 3. 使用方式

### 3.1 TableSession 类

C++ 客户端的操作均通过 TableSession 类进行，下面将给出 TableSession 接口中定义的方法说明。

#### 3.1.1 方法列表

1. `insert(Tablet& tablet, bool sorted = false)`，将一个包含时间序列数据的Tablet对象插入到数据库中，sorted参数指明tablet中的行是否已按时间排序。
2. `executeNonQueryStatement(string& sql)`，执行非查询SQL语句，如DDL(数据定义语言)或DML(数据操作语言)命令。
3. `executeQueryStatement(string& sql)`，执行查询SQL语句，并返回包含查询结果的SessionDataSet对象，可选timeoutInMs参数指示超时返回时间。
   * 注意：调用 `SessionDataSet::next()` 获取查询结果行时，必须将返回的 `std::shared_ptr<RowRecord>` 对象存储在局部作用域变量中（例如：`auto row = dataSet->next();`），以确保数据生命周期有效。若直接通过 `.get()` 或裸指针访问（如 `dataSet->next().get()`），将导致智能指针引用计数归零，数据被立即释放，后续访问将引发未定义行为。
4. `open(bool enableRPCCompression = false)`，开启连接，并决定是否启用RPC压缩(客户端状态须与服务端一致，默认不开启)。
5. `close()`，关闭连接。

#### 3.1.2 接口展示

```cpp
class TableSession {
private:
    Session* session;
public:
    TableSession(Session* session) {
        this->session = session;
    }
    void insert(Tablet& tablet, bool sorted = false);
    void executeNonQueryStatement(const std::string& sql);
    unique_ptr<SessionDataSet> executeQueryStatement(const std::string& sql);
    unique_ptr<SessionDataSet> executeQueryStatement(const std::string& sql, int64_t timeoutInMs);
    string getDatabase(); //获取当前选择的database，可由executeNonQueryStatement代替
    void open(bool enableRPCCompression = false);
    void close();
};
```

### 3.2 TableSessionBuilder 类

TableSessionBuilder类是一个构建器，用于配置和创建TableSession类的实例，通过它可以在创建实例时方便地设置连接参数、查询参数等。

#### 3.2.1 使用示例

```cpp
//设置连接的IP、端口、用户名、密码
//设置的顺序任意，确保最后调用build()即可，创建的实例默认已进行open()连接操作
session = (new TableSessionBuilder())
            ->host("127.0.0.1")
            ->rpcPort(6667)
            ->username("root")
            ->password("TimechoDB@2021") //V2.0.6.x 之前默认密码是root
            ->build();
```

#### 3.2.2 可设置的参数列表

| **参数名** | **描述** |          **默认值**          |
| :---: | :---: |:-------------------------:|
| host | 设置连接的节点IP | "127.0.0.1" ("localhost") |
| rpcPort | 设置连接的节点端口 |           6667            |
| username | 设置连接的用户名 |          "root"           |
| password | 设置连接密码 |    "TimechoDB@2021"  //V2.0.6.x 之前默认密码是root     |
| zoneId | 设置时区相关的ZoneId |            ""             |
| fetchSize | 设置查询结果的获取大小 |           10000           |
| database | 设置目标数据库名称 |            ""             |


## 4. 示例代码

示例工程源代码：

- `example/client-cpp-example/src/TableModelSessionExample.cpp` : [TableModelSessionExample](https://github.com/apache/iotdb/blob/master/example/client-cpp-example/src/TableModelSessionExample.cpp)

编译成功后，示例代码工程位于 `example/client-cpp-example/target`

```cpp
#include "TableSession.h"
#include "TableSessionBuilder.h"

using namespace std;

shared_ptr<TableSession> session;

void insertRelationalTablet() {

    vector<pair<string, TSDataType::TSDataType>> schemaList {
        make_pair("region_id", TSDataType::TEXT),
        make_pair("plant_id", TSDataType::TEXT),
        make_pair("device_id", TSDataType::TEXT),
        make_pair("model", TSDataType::TEXT),
        make_pair("temperature", TSDataType::FLOAT),
        make_pair("humidity", TSDataType::DOUBLE)
    };
    
    vector<ColumnCategory> columnTypes = {
        ColumnCategory::TAG,
        ColumnCategory::TAG,
        ColumnCategory::TAG,
        ColumnCategory::ATTRIBUTE,
        ColumnCategory::FIELD,
        ColumnCategory::FIELD
    };
    
    Tablet tablet("table1", schemaList, columnTypes, 100);
    
    for (int row = 0; row < 100; row++) {
        int rowIndex = tablet.rowSize++;
        tablet.timestamps[rowIndex] = row;
        // 使用基于索引的 API 比通过列名查找更高效
        // 推荐写法：tablet.addValue(0, rowIndex, "1");
        // 避免写法：tablet.addValue("region_id", rowIndex, "1");
        tablet.addValue(0, rowIndex, "1");    // region_id
        tablet.addValue(1, rowIndex, "5");    // plant_id
        tablet.addValue(2, rowIndex, "3");    // device_id
        tablet.addValue(3, rowIndex, "A");    // model
        tablet.addValue(4, rowIndex, 37.6F);  // temperature
        tablet.addValue(5, rowIndex, 111.1);  // humidity
        if (tablet.rowSize == tablet.maxRowNumber) {
            session->insert(tablet);
            tablet.reset();
        }
    }
    
    if (tablet.rowSize != 0) {
        session->insert(tablet);
        tablet.reset();
    }
}

void Output(unique_ptr<SessionDataSet> &dataSet) {
    for (const string &name: dataSet->getColumnNames()) {
        cout << name << "  ";
    }
    cout << endl;
    while (dataSet->hasNext()) {
        cout << dataSet->next()->toString();
    }
    cout << endl;
}

void OutputWithType(unique_ptr<SessionDataSet> &dataSet) {
    for (const string &name: dataSet->getColumnNames()) {
        cout << name << "  ";
    }
    cout << endl;
    for (const string &type: dataSet->getColumnTypeList()) {
        cout << type << "  ";
    }
    cout << endl;
    while (dataSet->hasNext()) {
        cout << dataSet->next()->toString();
    }
    cout << endl;
}

int main() {
    try {
        session = (new TableSessionBuilder())
            ->host("127.0.0.1")
            ->rpcPort(6667)
            ->username("root")
            ->password("root")
            ->build();
            
        cout << "[Create Database db1,db2]\n" << endl;
        try {
            session->executeNonQueryStatement("CREATE DATABASE IF NOT EXISTS db1");
            session->executeNonQueryStatement("CREATE DATABASE IF NOT EXISTS db2");
        } catch (IoTDBException &e) {
            cout << e.what() << endl;
        }
        
        cout << "[Use db1 as database]\n" << endl;
        try {
            session->executeNonQueryStatement("USE db1");
        } catch (IoTDBException &e) {
            cout << e.what() << endl;
        }
        
        cout << "[Create Table table1,table2]\n" << endl;
        try {
            session->executeNonQueryStatement("create table db1.table1(region_id STRING TAG, plant_id STRING TAG, device_id STRING TAG, model STRING ATTRIBUTE, temperature FLOAT FIELD, humidity DOUBLE FIELD) with (TTL=3600000)");
            session->executeNonQueryStatement("create table db2.table2(region_id STRING TAG, plant_id STRING TAG, color STRING ATTRIBUTE, temperature FLOAT FIELD, speed DOUBLE FIELD) with (TTL=6600000)");
        } catch (IoTDBException &e) {
            cout << e.what() << endl;
        }
        
        cout << "[Show Tables]\n" << endl;
        try {
            unique_ptr<SessionDataSet> dataSet = session->executeQueryStatement("SHOW TABLES");
            Output(dataSet);
        } catch (IoTDBException &e) {
            cout << e.what() << endl;
        }
        
        cout << "[Show tables from specific database]\n" << endl;
        try {
            unique_ptr<SessionDataSet> dataSet = session->executeQueryStatement("SHOW TABLES FROM db1");
            Output(dataSet);
        } catch (IoTDBException &e) {
            cout << e.what() << endl;
        }
        
        cout << "[InsertTablet]\n" << endl;
        try {
            insertRelationalTablet();
        } catch (IoTDBException &e) {
            cout << e.what() << endl;
        }
        
        cout << "[Query Table Data]\n" << endl;
        try {
            unique_ptr<SessionDataSet> dataSet = session->executeQueryStatement("SELECT * FROM table1"
                " where region_id = '1' and plant_id in ('3', '5') and device_id = '3'");
            OutputWithType(dataSet);
        } catch (IoTDBException &e) {
            cout << e.what() << endl;
        }
        
        session->close();
        
        // specify database in constructor
        session = (new TableSessionBuilder())
            ->host("127.0.0.1")
            ->rpcPort(6667)
            ->username("root")
            ->password("root")
            ->database("db1")
            ->build();
            
        cout << "[Show tables from current database(db1)]\n" << endl;
        try {
            unique_ptr<SessionDataSet> dataSet = session->executeQueryStatement("SHOW TABLES");
            Output(dataSet);
        } catch (IoTDBException &e) {
            cout << e.what() << endl;
        }
        
        cout << "[Change database to db2]\n" << endl;
        try {
            session->executeNonQueryStatement("USE db2");
        } catch (IoTDBException &e) {
            cout << e.what() << endl;
        }
        
        cout << "[Show tables from current database(db2)]\n" << endl;
        try {
            unique_ptr<SessionDataSet> dataSet = session->executeQueryStatement("SHOW TABLES");
            Output(dataSet);
        } catch (IoTDBException &e) {
            cout << e.what() << endl;
        }
        
        cout << "[Drop Database db1,db2]\n" << endl;
        try {
            session->executeNonQueryStatement("DROP DATABASE db1");
            session->executeNonQueryStatement("DROP DATABASE db2");
        } catch (IoTDBException &e) {
            cout << e.what() << endl;
        }
        
        cout << "session close\n" << endl;
        session->close();
        
        cout << "finished!\n" << endl;
    } catch (IoTDBConnectionException &e) {
        cout << e.what() << endl;
    } catch (IoTDBException &e) {
        cout << e.what() << endl;
    }
    return 0;
}
```

## 5. FAQ

### 5.1 Thrift 编译相关问题

1. MAC：本地 Maven 编译 Thrift 时如出现以下链接的问题，可以尝试将 xcode-commandline 版本从 12 降低到 11.5
   https://stackoverflow.com/questions/63592445/ld-unsupported-tapi-file-type-tapi-tbd-in-yaml-file/65518087#65518087


2. Windows：Maven 编译 Thrift 时需要使用 wget 下载远端文件，可能出现以下报错：
   ```
   Failed to delete cached file C:\Users\Administrator\.m2\repository\.cache\download-maven-plugin\index.ser
   ```
   
    解决方法：
   - 尝试删除 ".m2\repository\\.cache\" 目录并重试。
   - 在添加 pom 文件对应的 download-maven-plugin 中添加 "\<skipCache>true\</skipCache>"
