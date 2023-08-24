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
- Maven 3.9+ (optional when using `mvnw` command)
- Flex
- Bison 2.7+
- Boost 1.56+
- OpenSSL 1.0+
- GCC 5.5.0+

> Even if we'll be building a C++ application, we still need `Maven` for the build and that requires `Java`

## Installation From Source Code

### Install CPP Dependencies

- **MAC**

    1. Install Homebrew, as we'll be installing all dependencies via that.
        ```shell
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        ``` 
    2. Make sure java ist installed, if not:
        ```shell
        brew install java
        ``` 
       Please pay attention to the output of the installation process. 
       It will probably note that you need to create a symlink:
        1. On Intel-based models:
           ```shell
           sudo ln -sfn /usr/local/opt/openjdk/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk.jdk
           ``` 
        2. On Arm-based models 
           ```shell
           sudo ln -sfn /opt/homebrew/opt/openjdk/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk.jdk
           ``` 
    3. Install Bison：Bison 2.3 is preinstalled on OSX, but this version is outdated, and we need a newer version.
       ```shell
       brew install bison
       ```
    4. Install Boost：Please make sure a relative new version of Boost is ready on your machine.
         If no Boost available, install the latest version of Boost:
       ```shell
       brew install boost
       ```
    5. OpenSSL ：Make sure the Openssl header files and libraries have been installed on your Mac. The default Openssl include file search path is "/usr/local/opt/openssl/include".
       ```shell
       brew install openssl
       ```

- **Ubuntu 20**

  To install all dependencies, run:

    ```shell
    sudo apt install default-jdk bison flex libboost-all-dev libssl-dev
    ```

- **CentOS 7.x**

  Some packages can be installed using Yum:

    ```shell
    sudo yum install bison flex openssl-devel
    ```

  The version of gcc and boost installed by yum is too low, therefore you should compile or download these binary packages by yourself.

- **Windows**

    1. Install Chocolatey, as we'll be installing all dependencies via that: [Installation Instructions](https://chocolatey.org/install) 

    2. Make sure Java is installed, if not:
       ```shell
       choco install openjdk
       ```
       > Note on Windows running on aarch64 machines, the chocolatey script has been seen to install an x86_64 version of the JDK instead, which will still work, but at a low-performance, as it'll be running in emulation-mode. Currently, however aarch64 is a bit of a problem and will hopefully be fully supported in future versions of the cmake-maven-plugin.

    3. Install Visual Studio 19 2022:
       ```shell
       choco install visualstudio2022community
       choco install visualstudio2022buildtools
       choco install visualstudio2022-workload-nativedesktop
       ```
       
    4. Install Flex and Bison:
       ```shell
       choco install winflexbison
       ```

     5. Install `Boost`:
        ```shell
        choco install boost-msvc-14.2
        ```

     6. Install `OpenSSL`:
        ```shell
        choco install openssl
        ```

### Compile

You can download the source code from the [IoTDB Website](https://iotdb.apache.org/Download/) or clone the GIT repository:
```shell
git clone https://github.com/apache/iotdb.git
```

The default dev branch is the master branch, If you want to use a released version (e.g. `0.13.3` or `1.2.0`), be sure to check out the corresponding tag:
```shell
git checkout v0.13.3
```
(Please note that we are using a `Go` compatible naming schema for our release tags, which prefixes the version by a `v`)

> If you want to use the `maven-wrapper` which will automatically fetch the right version of `Maven`, replace `mvn` with `./mvnw` on Mac and Linux and `mvnw.cmd` on Windows systems.

In order to compile the project, execute the following command in the root path of the project:

```shell
mvn package -P with-cpp -pl example/client-cpp-example, -am -DskipTest
```

As soon as the compilation finishes successfully, the packaged zip file containing the library will be placed under `iotdb-client/client-cpp/target/client-cpp-{iotdb-version}-cpp-${os}-${aarch}.zip` and the example demonstrating the use of the library will be located at: `example/client-cpp-example/target/SessionExample` and `example/client-cpp-example/target/AllignedTimeseriesSessionExample`. 

## Native APIs

Here we demonstrate the most commonly used interfaces and their parameters in the Native API:

### Initialization

- Open a Session:
    ```cpp
    void open(); 
    ```

- Open a session, with a parameter controlling if RPC compression should be used:
    ```cpp
    void open(bool enableRPCCompression); 
    ```
    Notice: The RPC compression setting of the client is required to match that of the IoTDB server

- Close a session:
    ```cpp
    void close(); 
    ```

### Data Definition Interface (DDL)

#### Database Management

- Create database:
```cpp
void setStorageGroup(const std::string &storageGroupId);
```

- Delete one or several databases:
```cpp
void deleteStorageGroup(const std::string &storageGroup);
void deleteStorageGroups(const std::vector<std::string> &storageGroups);
```

#### Timeseries Management

- Create one or multiple timeseries:
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

- Create aligned timeseries:
```cpp
void createAlignedTimeseries(const std::string &deviceId,
                             const std::vector<std::string> &measurements,
                             const std::vector<TSDataType::TSDataType> &dataTypes,
                             const std::vector<TSEncoding::TSEncoding> &encodings,
                             const std::vector<CompressionType::CompressionType> &compressors);
```

- Delete one or several timeseries:
```cpp
void deleteTimeseries(const std::string &path);
void deleteTimeseries(const std::vector<std::string> &paths);
```

- Check whether a specific timeseries exists:
```cpp
bool checkTimeseriesExists(const std::string &path);
```

#### Schema Template

- Create a schema template:
```cpp
void createSchemaTemplate(const Template &templ);
```

- Set the schema template named `templateName` at path `prefixPath`:
```cpp
void setSchemaTemplate(const std::string &template_name, const std::string &prefix_path);
```

- Unset the schema template:
```cpp
void unsetSchemaTemplate(const std::string &prefix_path, const std::string &template_name);
```

- After a schema template was created, you can edit the template with following functions:
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

- You can query schema templates with these APIs:
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
### Data Manipulation Interface (DMI)

#### Insert

- Insert one record, which contains multiple measurement value of a given device and timestamp:
```cpp
void insertRecord(const std::string &deviceId, 
                  int64_t time, 
                  const std::vector<std::string> &measurements,
                  const std::vector<char *> &values);
```

- Insert multiple Records for multiple devices (With type info in the `typesList` parameter the server doesn't need to do type inference, which results in better performance):
```cpp
void insertRecords(const std::vector<std::string> &deviceIds,
                   const std::vector<int64_t> &times,
                   const std::vector<std::vector<std::string>> &measurementsList,
                   const std::vector<std::vector<char *>> &valuesList);
```

- Insert multiple Records for the same device:
```cpp
void insertRecordsOfOneDevice(const std::string &deviceId,
                              std::vector<int64_t> &times,
                              std::vector<std::vector<std::string>> &measurementsList,
                              std::vector<std::vector<char *>> &valuesList);
```

All of the above versions require the server to figure out the data-types of each value, which comes with quite a performance-cost, therefore all of the above are also available in a version without type-inference:

```cpp
void insertRecord(const std::string &deviceId, 
                  int64_t time, 
                  const std::vector<std::string> &measurements,
                  const std::vector<TSDataType::TSDataType> &types,
                  const std::vector<std::string> &values);


void insertRecords(const std::vector<std::string> &deviceIds,
                   const std::vector<int64_t> &times,
                   const std::vector<std::vector<std::string>> &measurementsList,
                   const std::vector<std::vector<TSDataType::TSDataType>> &typesList,
                   const std::vector<std::vector<std::string>> &valuesList);


void insertRecordsOfOneDevice(const std::string &deviceId,
                              std::vector<int64_t> &times,
                              std::vector<std::vector<std::string>> &measurementsList,
                              std::vector<std::vector<TSDataType::TSDataType>> &typesList,
                              const std::vector<std::vector<std::string>> &valuesList);
```

For even better performance, it is recommended to use Tablets to help improve write efficiency.

- Insert a Tablet，which inserts multiple rows of data for a given device. Each row has the same structure:
    - Better write performance
    - Support null values: Fill the null value with any value, and then mark the null value via BitMap
```cpp
void insertTablet(Tablet &tablet);
```

- Insert multiple Tablets
```cpp
void insertTablets(std::unordered_map<std::string, Tablet *> &tablets);
```

#### Insert data into Aligned Timeseries

The insertion of aligned timeseries is performed by functions such as `insertAlignedXXX` however semantically they align to the non-aligned versions of the previous chapter:

```cpp
    void insertAlignedRecord(const std::string &deviceId,
                             int64_t time, 
                             const std::vector<std::string> &measurements,
                             const std::vector<std::string> &values);

    void insertAlignedRecord(const std::string &deviceId, 
                             int64_t time, 
                             const std::vector<std::string> &measurements,
                             const std::vector<TSDataType::TSDataType> &types,
                             const std::vector<char *> &values);

    void insertAlignedRecords(const std::vector<std::string> &deviceIds,
                              const std::vector<int64_t> &times,
                              const std::vector<std::vector<std::string>> &measurementsList,
                              const std::vector<std::vector<std::string>> &valuesList);

    void insertAlignedRecords(const std::vector<std::string> &deviceIds,
                              const std::vector<int64_t> &times,
                              const std::vector<std::vector<std::string>> &measurementsList,
                              const std::vector<std::vector<TSDataType::TSDataType>> &typesList,
                              const std::vector<std::vector<char *>> &valuesList);

    void insertAlignedRecordsOfOneDevice(const std::string &deviceId,
                                         std::vector<int64_t> &times,
                                         std::vector<std::vector<std::string>> &measurementsList,
                                         std::vector<std::vector<TSDataType::TSDataType>> &typesList,
                                         std::vector<std::vector<char *>> &valuesList);

    void insertAlignedRecordsOfOneDevice(const std::string &deviceId,
                                         std::vector<int64_t> &times,
                                         std::vector<std::vector<std::string>> &measurementsList,
                                         std::vector<std::vector<TSDataType::TSDataType>> &typesList,
                                         std::vector<std::vector<char *>> &valuesList,
                                         bool sorted);

    void insertAlignedTablet(Tablet &tablet);

    void insertAlignedTablet(Tablet &tablet, 
                             bool sorted);

    void insertAlignedTablets(std::unordered_map<std::string, Tablet *> &tablets, 
                              bool sorted = false);
```

#### Delete

- Delete data with timestamps before or equal to a given timestamp of one or several timeseries:
```cpp
void deleteData(const std::string &path, int64_t time);
void deleteData(const std::vector<std::string> &deviceId, int64_t time);
```

### IoTDB-SQL Interface

- Execute query statement

Query statements return data.

```cpp
unique_ptr<SessionDataSet> executeQueryStatement(const std::string &sql);
```

Non-Query statements don't return data (Delete, Create, ... statements)

- Execute non query statement
```cpp
void executeNonQueryStatement(const std::string &sql);
```

## Examples

The sample code for using these interfaces is located in:

- `example/client-cpp-example/src/SessionExample.cpp`
- `example/client-cpp-example/src/AlignedTimeseriesSessionExample.cpp`

As soon as the compilation finishes, the example project will be located at `example/client-cpp-example/target`

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
- Try to delete the ".m2\repository\.cache\" directory and try again.
- Add "\<skipCache>true\</skipCache>" configuration to the download-maven-plugin maven phase that complains this error.

