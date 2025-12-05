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

# C++ Native API

## 1. Dependencies

- Java 8+
- Flex
- Bison 2.7+
- Boost 1.56+
- OpenSSL 1.0+
- GCC 5.5.0+

## 2. Installation

### 2.1 Install Required Dependencies

- **MAC**
    1. Install Bison:

       Use the following brew command to install the Bison version:
       ```shell
       brew install bison
       ```

    2. Install Boost: Make sure to install the latest version of Boost.

       ```shell
       brew install boost
       ```

    3. Check OpenSSL: Make sure the OpenSSL library is installed. The default OpenSSL header file path is "/usr/local/opt/openssl/include".

       If you encounter errors related to OpenSSL not being found during compilation, try adding `-Dopenssl.include.dir=""`.

- **Ubuntu 16.04+ or Other Debian-based Systems**

  Use the following commands to install dependencies:

    ```shell
    sudo apt-get update
    sudo apt-get install gcc g++ bison flex libboost-all-dev libssl-dev
    ```

- **CentOS 7.7+/Fedora/Rocky Linux or Other Red Hat-based Systems**

  Use the yum command to install dependencies:

    ```shell
    sudo yum update
    sudo yum install gcc gcc-c++ boost-devel bison flex openssl-devel
    ```

- **Windows**

    1. Set Up the Build Environment
        - Install MS Visual Studio (version 2019+ recommended): Make sure to select Visual Studio C/C++ IDE and compiler (supporting CMake, Clang, MinGW) during installation.
        - Download and install [CMake](https://cmake.org/download/).

    2. Download and Install Flex, Bison
        - Download [Win_Flex_Bison](https://sourceforge.net/projects/winflexbison/).
        - After downloading, rename the executables to flex.exe and bison.exe to ensure they can be found during compilation, and add the directory of these executables to the PATH environment variable.

    3. Install Boost Library
        - Download [Boost](https://www.boost.org/users/download/).
        - Compile Boost locally: Run `bootstrap.bat` and `b2.exe` in sequence.
        - Add the Boost installation directory to the PATH environment variable, e.g., `C:\Program Files (x86)\boost_1_78_0`.

    4. Install OpenSSL
        - Download and install [OpenSSL](http://slproweb.com/products/Win32OpenSSL.html).
        - Add the include directory under the installation directory to the PATH environment variable.

### 2.2 Compilation

Clone the source code from git:
```shell
git clone https://github.com/apache/iotdb.git
```

The default main branch is the master branch. If you want to use a specific release version, switch to that branch (e.g., version 1.3.2):
```shell
git checkout rc/1.3.2
```

Run Maven to compile in the IoTDB root directory:

- Mac or Linux with glibc version >= 2.32
    ```shell
    ./mvnw clean package -pl example/client-cpp-example -am -DskipTests -P with-cpp
    ``` 

- Linux with glibc version >= 2.31
    ```shell
    ./mvnw clean package -pl example/client-cpp-example -am -DskipTests -P with-cpp -Diotdb-tools-thrift.version=0.14.1.1-old-glibc-SNAPSHOT
    ```

- Linux with glibc version >= 2.17
    ```shell
    ./mvnw clean package -pl example/client-cpp-example -am -DskipTests -P with-cpp -Diotdb-tools-thrift.version=0.14.1.1-glibc223-SNAPSHOT
    ```

- Windows using Visual Studio 2022
    ```batch
    .\mvnw.cmd clean package -pl example/client-cpp-example -am -DskipTests -P with-cpp
    ```

- Windows using Visual Studio 2019
    ```batch
    .\mvnw.cmd clean package -pl example/client-cpp-example -am -DskipTests -P with-cpp -Dcmake.generator="Visual Studio 16 2019" -Diotdb-tools-thrift.version=0.14.1.1-msvc142-SNAPSHOT
    ```
    - If you haven't added the Boost library path to the PATH environment variable, you need to add the relevant parameters to the compile command, e.g., `-DboostIncludeDir="C:\Program Files (x86)\boost_1_78_0" -DboostLibraryDir="C:\Program Files (x86)\boost_1_78_0\stage\lib"`.

After successful compilation, the packaged library files will be located in `iotdb-client/client-cpp/target`, and you can find the compiled example program under `example/client-cpp-example/target`.

### 2.3 Compilation Q&A

Q: What are the requirements for the environment on Linux?

A:
- The known minimum version requirement for glibc (x86_64 version) is 2.17, and the minimum version for GCC is 5.5.
- The known minimum version requirement for glibc (ARM version) is 2.31, and the minimum version for GCC is 10.2.
- If the above requirements are not met, you can try compiling Thrift locally:
    - Download the code from https://github.com/apache/iotdb-bin-resources/tree/iotdb-tools-thrift-v0.14.1.0/iotdb-tools-thrift.
    - Run `./mvnw clean install`.
    - Go back to the IoTDB code directory and run `./mvnw clean package -pl example/client-cpp-example -am -DskipTests -P with-cpp`.

Q: How to resolve the `undefined reference to '_libc_single_thread'` error during Linux compilation?

A:
- This issue is caused by the precompiled Thrift dependencies requiring a higher version of glibc.
- You can try adding `-Diotdb-tools-thrift.version=0.14.1.1-glibc223-SNAPSHOT` or `-Diotdb-tools-thrift.version=0.14.1.1-old-glibc-SNAPSHOT` to the Maven compile command.

Q: What if I need to compile using Visual Studio 2017 or earlier on Windows?

A:
- You can try compiling Thrift locally before compiling the client:
    - Download the code from https://github.com/apache/iotdb-bin-resources/tree/iotdb-tools-thrift-v0.14.1.0/iotdb-tools-thrift.
    - Run `.\mvnw.cmd clean install`.
    - Go back to the IoTDB code directory and run `.\mvnw.cmd clean package -pl example/client-cpp-example -am -DskipTests -P with-cpp -Dcmake.generator="Visual Studio 15 2017"`.

## 3. Usage

### 3.1 TableSession Class

All operations in the C++ client are performed through the TableSession class. Below are the method descriptions defined in the TableSession interface.

#### 3.1.1 Method List

1. `insert(Tablet& tablet, bool sorted = false)`: Inserts a Tablet object containing time series data into the database. The sorted parameter indicates whether the rows in the tablet are already sorted by time.
2. `executeNonQueryStatement(string& sql)`: Executes non-query SQL statements, such as DDL (Data Definition Language) or DML (Data Manipulation Language) commands.
3. `executeQueryStatement(string& sql)`: Executes query SQL statements and returns a SessionDataSet object containing the query results. The optional timeoutInMs parameter indicates the timeout return time.
4. `open(bool enableRPCCompression = false)`: Opens the connection and determines whether to enable RPC compression (client state must match server state, disabled by default).
5. `close()`: Closes the connection.

#### 3.1.2 Interface Display

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
    string getDatabase(); //Get the currently selected database, can be replaced by executeNonQueryStatement
    void open(bool enableRPCCompression = false);
    void close();
};
```

### 3.2 TableSessionBuilder Class

The TableSessionBuilder class is a builder used to configure and create instances of the TableSession class. Through it, you can conveniently set connection parameters, query parameters, and other settings when creating instances.

#### 3.2.1 Usage Example

```cpp
//Set connection IP, port, username, password
//The order of settings is arbitrary, just ensure build() is called last, the created instance is connected by default through open()
session = (new TableSessionBuilder())
            ->host("127.0.0.1")
            ->rpcPort(6667)
            ->username("root")
            ->password("root")
            ->build();
```

#### 3.2.2 Configurable Parameter List

| **Parameter Name** | **Description** | **Default Value** |
| :---: | :---: | :---: |
| host | Set the connected node IP | "127.0.0.1" ("localhost") |
| rpcPort | Set the connected node port | 6667 |
| username | Set the connection username | "root" |
| password | Set the connection password | "root" |
| zoneId | Set the ZoneId related to timezone | "" |
| fetchSize | Set the query result fetch size | 10000 |
| database | Set the target database name | "" |

## 4. Examples

The sample code of using these interfaces is in:

- `example/client-cpp-example/src/TableSessionExample.cpp`: [TableSessionExample](https://github.com/apache/iotdb/tree/rc/2.0.1/example/client-cpp-example/src/TableSessionExample.cpp)

If the compilation finishes successfully, the example project will be placed under `example/client-cpp-example/target`

## 5. FAQ

### 5.1 on Mac

If errors occur when compiling thrift source code, try to downgrade your xcode-commandline from 12 to 11.5

see https://stackoverflow.com/questions/63592445/ld-unsupported-tapi-file-type-tapi-tbd-in-yaml-file/65518087#65518087


### 5.2 on Windows

When Building Thrift and downloading packages via "wget", a possible annoying issue may occur with
error message looks like:
```shell
Failed to delete cached file C:\Users\Administrator\.m2\repository\.cache\download-maven-plugin\index.ser
```
Possible fixes:
- Try to delete the ".m2\repository\\.cache\" directory and try again.
- Add "\<skipCache>true\</skipCache>" configuration to the download-maven-plugin maven phase that complains this error.

