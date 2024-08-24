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

## Dependencies

- Java 8+
- Flex
- Bison 2.7+
- Boost 1.56+
- OpenSSL 1.0+
- GCC 5.5.0+

## Installation

### Install Required Dependencies

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

### Compilation

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
    ```Batchfile
    .\mvnw.cmd clean package -pl example/client-cpp-example -am -DskipTests -P with-cpp
    ```

- Windows using Visual Studio 2019
    ```Batchfile
    .\mvnw.cmd clean package -pl example/client-cpp-example -am -DskipTests -P with-cpp -Dcmake.generator="Visual Studio 16 2019" -Diotdb-tools-thrift.version=0.14.1.1-msvc142-SNAPSHOT
    ```
    - If you haven't added the Boost library path to the PATH environment variable, you need to add the relevant parameters to the compile command, e.g., `-DboostIncludeDir="C:\Program Files (x86)\boost_1_78_0" -DboostLibraryDir="C:\Program Files (x86)\boost_1_78_0\stage\lib"`.

After successful compilation, the packaged library files will be located in `iotdb-client/client-cpp/target`, and you can find the compiled example program under `example/client-cpp-example/target`.

### Compilation Q&A

Q: What are the requirements for the environment on Linux?

A:
- The known minimum version requirement for glibc (x86_64 version) is 2.17, and the minimum version for GCC is 5.5.
- The known minimum version requirement for glibc (ARM version) is 2.31, and the minimum version for GCC is 10.2.
- If these requirements are not met, you may need to compile Thrift locally. For details, refer to https://github.com/apache/iotdb/blob/master/iotdb-client/client-cpp/README.md.

Q: How to resolve the `undefined reference to '_libc_single_thread'` error during Linux compilation?

A:
- This issue is caused by the precompiled Thrift dependencies requiring a higher version of glibc.
- You can try adding `-Diotdb-tools-thrift.version=0.14.1.1-glibc223-SNAPSHOT` or `-Diotdb-tools-thrift.version=0.14.1.1-old-glibc-SNAPSHOT` to the Maven compile command.

Q: What if I need to compile using Visual Studio 2017 or earlier on Windows?

A:
- You need to compile Thrift locally first and then compile the client.
- Refer to https://github.com/apache/iotdb/blob/master/iotdb-client/client-cpp/README.md for more details.


## Native APIs

Here we show the commonly used interfaces and their parameters in the Native API:

### Initialization

- Open a Session
```cpp
void open(); 
```

- Open a session, with a parameter to specify whether to enable RPC compression
```cpp
void open(bool enableRPCCompression); 
```
Notice: this RPC compression status of client must comply with that of IoTDB server

- Close a Session
```cpp
void close(); 
```

### Data Definition Interface (DDL)

#### Database Management

- CREATE DATABASE
```cpp
void setStorageGroup(const std::string &storageGroupId);
```

- Delete one or several databases
```cpp
void deleteStorageGroup(const std::string &storageGroup);
void deleteStorageGroups(const std::vector<std::string> &storageGroups);
```

#### Timeseries Management

- Create one or multiple timeseries
```cpp
void createTimeseries(const std::string &path, TSDataType::TSDataType dataType, TSEncoding::TSEncoding encoding,
                          CompressionType::CompressionType compressor);
                          
void createMultiTimeseries(const std::vector<std::string> &paths,
                           const std::vector<TSDataType::TSDataType> &dataTypes,
                           const std::vector<TSEncoding::TSEncoding> &encodings,
                           const std::vector<CompressionType::CompressionType> &compressors,
                           std::vector<std::map<std::string, std::string>> *propsList,
                           std::vector<std::map<std::string, std::string>> *tagsList,
                           std::vector<std::map<std::string, std::string>> *attributesList,
                           std::vector<std::string> *measurementAliasList);
```

- Create aligned timeseries
```cpp
void createAlignedTimeseries(const std::string &deviceId,
                             const std::vector<std::string> &measurements,
                             const std::vector<TSDataType::TSDataType> &dataTypes,
                             const std::vector<TSEncoding::TSEncoding> &encodings,
                             const std::vector<CompressionType::CompressionType> &compressors);
```

- Delete one or several timeseries
```cpp
void deleteTimeseries(const std::string &path);
void deleteTimeseries(const std::vector<std::string> &paths);
```

- Check whether the specific timeseries exists.
```cpp
bool checkTimeseriesExists(const std::string &path);
```

#### Schema Template

- Create a schema template
```cpp
void createSchemaTemplate(const Template &templ);
```

- Set the schema template named `templateName` at path `prefixPath`.
```cpp
void setSchemaTemplate(const std::string &template_name, const std::string &prefix_path);
```

- Unset the schema template
```cpp
void unsetSchemaTemplate(const std::string &prefix_path, const std::string &template_name);
```

- After measurement template created, you can edit the template with belowed APIs.
```cpp
// Add aligned measurements to a template
void addAlignedMeasurementsInTemplate(const std::string &template_name,
                                      const std::vector<std::string> &measurements,
                                      const std::vector<TSDataType::TSDataType> &dataTypes,
                                      const std::vector<TSEncoding::TSEncoding> &encodings,
                                      const std::vector<CompressionType::CompressionType> &compressors);

// Add one aligned measurement to a template
void addAlignedMeasurementsInTemplate(const std::string &template_name,
                                      const std::string &measurement,
                                      TSDataType::TSDataType dataType,
                                      TSEncoding::TSEncoding encoding,
                                      CompressionType::CompressionType compressor);

// Add unaligned measurements to a template
void addUnalignedMeasurementsInTemplate(const std::string &template_name,
                                        const std::vector<std::string> &measurements,
                                        const std::vector<TSDataType::TSDataType> &dataTypes,
                                        const std::vector<TSEncoding::TSEncoding> &encodings,
                                        const std::vector<CompressionType::CompressionType> &compressors);

// Add one unaligned measurement to a template
void addUnalignedMeasurementsInTemplate(const std::string &template_name,
                                        const std::string &measurement,
                                        TSDataType::TSDataType dataType,
                                        TSEncoding::TSEncoding encoding,
                                        CompressionType::CompressionType compressor);

// Delete a node in template and its children
void deleteNodeInTemplate(const std::string &template_name, const std::string &path);
```

- You can query measurement templates with these APIS:
```cpp
// Return the amount of measurements inside a template
int countMeasurementsInTemplate(const std::string &template_name);

// Return true if path points to a measurement, otherwise returne false
bool isMeasurementInTemplate(const std::string &template_name, const std::string &path);

// Return true if path exists in template, otherwise return false
bool isPathExistInTemplate(const std::string &template_name, const std::string &path);

// Return all measurements paths inside template
std::vector<std::string> showMeasurementsInTemplate(const std::string &template_name);

// Return all measurements paths under the designated patter inside template
std::vector<std::string> showMeasurementsInTemplate(const std::string &template_name, const std::string &pattern);
```


### Data Manipulation Interface (DML)

#### Insert

> It is recommended to use insertTablet to help improve write efficiency.

- Insert a Tablet，which is multiple rows of a device, each row has the same measurements
    - Better Write Performance
    - Support null values: fill the null value with any value, and then mark the null value via BitMap
```cpp
void insertTablet(Tablet &tablet);
```

- Insert multiple Tablets
```cpp
void insertTablets(std::unordered_map<std::string, Tablet *> &tablets);
```

- Insert a Record, which contains multiple measurement value of a device at a timestamp
```cpp
void insertRecord(const std::string &deviceId, int64_t time, const std::vector<std::string> &measurements,
                  const std::vector<TSDataType::TSDataType> &types, const std::vector<char *> &values);
```

- Insert multiple Records
```cpp
void insertRecords(const std::vector<std::string> &deviceIds,
                   const std::vector<int64_t> &times,
                   const std::vector<std::vector<std::string>> &measurementsList,
                   const std::vector<std::vector<TSDataType::TSDataType>> &typesList,
                   const std::vector<std::vector<char *>> &valuesList);
```

- Insert multiple Records that belong to the same device. With type info the server has no need to do type inference, which leads a better performance
```cpp
void insertRecordsOfOneDevice(const std::string &deviceId,
                              std::vector<int64_t> &times,
                              std::vector<std::vector<std::string>> &measurementsList,
                              std::vector<std::vector<TSDataType::TSDataType>> &typesList,
                              std::vector<std::vector<char *>> &valuesList);
```

#### Insert with type inference

Without type information, server has to do type inference, which may cost some time.

```cpp
void insertRecord(const std::string &deviceId, int64_t time, const std::vector<std::string> &measurements,
                  const std::vector<std::string> &values);


void insertRecords(const std::vector<std::string> &deviceIds,
                   const std::vector<int64_t> &times,
                   const std::vector<std::vector<std::string>> &measurementsList,
                   const std::vector<std::vector<std::string>> &valuesList);


void insertRecordsOfOneDevice(const std::string &deviceId,
                              std::vector<int64_t> &times,
                              std::vector<std::vector<std::string>> &measurementsList,
                              const std::vector<std::vector<std::string>> &valuesList);
```

#### Insert data into Aligned Timeseries

The Insert of aligned timeseries uses interfaces like `insertAlignedXXX`, and others are similar to the above interfaces:

- insertAlignedRecord
- insertAlignedRecords
- insertAlignedRecordsOfOneDevice
- insertAlignedTablet
- insertAlignedTablets

#### Delete

- Delete data before or equal to a timestamp of one or several timeseries
```cpp
void deleteData(const std::string &path, int64_t time);
void deleteData(const std::vector<std::string> &deviceId, int64_t time);
```

### IoTDB-SQL Interface

- Execute query statement
```cpp
void executeNonQueryStatement(const std::string &sql);
```

- Execute non query statement
```cpp
void executeNonQueryStatement(const std::string &sql);
```


## Examples

The sample code of using these interfaces is in:

- `example/client-cpp-example/src/SessionExample.cpp`
- `example/client-cpp-example/src/AlignedTimeseriesSessionExample.cpp` (Aligned Timeseries)

If the compilation finishes successfully, the example project will be placed under `example/client-cpp-example/target`

## FAQ

### on Mac

If errors occur when compiling thrift source code, try to downgrade your xcode-commandline from 12 to 11.5

see https://stackoverflow.com/questions/63592445/ld-unsupported-tapi-file-type-tapi-tbd-in-yaml-file/65518087#65518087


### on Windows

When Building Thrift and downloading packages via "wget", a possible annoying issue may occur with
error message looks like:
```shell
Failed to delete cached file C:\Users\Administrator\.m2\repository\.cache\download-maven-plugin\index.ser
```
Possible fixes:
- Try to delete the ".m2\repository\\.cache\" directory and try again.
- Add "\<skipCache>true\</skipCache>" configuration to the download-maven-plugin maven phase that complains this error.

